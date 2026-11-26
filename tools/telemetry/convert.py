#!/usr/bin/env python3
"""Convert RaceChrono CSV exports (format 2 and 3) into small JSON files for the Race data page.

Usage:  python3 tools/telemetry/convert.py session1.csv [session2.csv ...] [--out data/rd-5vu19xn8kj]

Writes <out>/<id>.json for every session and refreshes <out>/index.json (id, track, date, fastest lap, laps).
No GPS coordinates are published: positions are converted to metres relative to the session centre.
Needs: python3, numpy, pandas.
"""
import sys, os, re, json, math
import numpy as np, pandas as pd

N = 160  # points per lap

def read(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        lines = [next(f) for _ in range(40)] if False else None
    meta, hdr = {}, None
    with open(path, encoding='utf-8', errors='ignore') as f:
        for i, line in enumerate(f):
            if line.startswith('timestamp,') or line.startswith('Time (s),'):
                hdr = i; break
            m = re.match(r'^(Session title|Track name|Created),(.*)$', line.strip())
            if m: meta[m.group(1)] = m.group(2).strip().strip('"')
    if hdr is None: raise SystemExit('Not a RaceChrono export: ' + path)
    df = pd.read_csv(path, skiprows=hdr, header=0, low_memory=False)
    first = pd.to_numeric(df.iloc[:, 0], errors='coerce')
    df = df[first.notna()].reset_index(drop=True)
    cols = {c.lower(): c for c in df.columns}
    def pick(*names):
        for n in names:
            for c in df.columns:
                if c.lower() == n: return c
        raise SystemExit('Column not found: %s' % names[0])
    out = pd.DataFrame({
        'el': pd.to_numeric(df[pick('elapsed_time', 'elapsed time (s)')], errors='coerce'),
        'lap': pd.to_numeric(df[pick('lap_number', 'lap #')], errors='coerce'),
        'dist': pd.to_numeric(df[pick('distance_traveled', 'distance (m)')], errors='coerce'),
        'lat': pd.to_numeric(df[pick('latitude', 'latitude (deg)')], errors='coerce'),
        'lon': pd.to_numeric(df[pick('longitude', 'longitude (deg)')], errors='coerce'),
        'v': pd.to_numeric(df[pick('speed', 'speed (m/s)')], errors='coerce'),
    }).dropna(subset=['el', 'dist', 'lat', 'lon', 'v'])
    return meta, out

def convert(path, outdir):
    meta, d = read(path)
    d = d[d.lap.notna()].copy()
    lat0, lon0 = d.lat.mean(), d.lon.mean()
    kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
    d['x'] = (d.lon - lon0) * kx; d['y'] = (d.lat - lat0) * ky
    laps = []
    groups = [(int(n), g.reset_index(drop=True)) for n, g in d.groupby('lap')]
    starts = {n: g.el.iloc[0] for n, g in groups}
    lens = [g.dist.iloc[-1] - g.dist.iloc[0] for n, g in groups]
    med = float(np.median(lens)) if lens else 0
    for (n, g), L in zip(groups, lens):
        if med <= 0 or abs(L - med) > 0.08 * med: continue          # in/out laps and cut-off laps
        nxt = starts.get(n + 1)
        t = (nxt - g.el.iloc[0]) if nxt is not None else (g.el.iloc[-1] - g.el.iloc[0])
        if t <= 5: continue
        s = g.dist - g.dist.iloc[0]
        s, idx = np.unique(s.values, return_index=True)
        gi = g.iloc[idx]
        q = np.linspace(0, s[-1], N)
        sm = lambda a: pd.Series(a).rolling(5, center=True, min_periods=1).mean().values
        x = np.interp(q, s, sm(gi.x.values)); y = np.interp(q, s, sm(gi.y.values))
        v = np.interp(q, s, sm(gi.v.values)) * 3.6
        tt = np.interp(q, s, gi.el.values - gi.el.values[0])
        tt = tt * (t / tt[-1]) if tt[-1] > 0 else tt
        p = []
        for i in range(N):
            p += [int(round(x[i] * 10)), int(round(y[i] * 10)), int(round(v[i] * 10)), int(round(tt[i] * 1000))]
        laps.append({'n': n, 't': round(float(t), 3), 'd': round(float(L), 1), 'p': p})
    if not laps: raise SystemExit('No complete laps in ' + path)
    best = min(range(len(laps)), key=lambda i: laps[i]['t'])
    top = max(max(l['p'][2::4]) for l in laps) / 10
    base = os.path.splitext(os.path.basename(path))[0]
    sid = re.sub(r'^session_', '', base)
    sid = re.sub(r'_v\d+$', '', sid)
    m = re.match(r'(\d{4})(\d{2})(\d{2})_\d{6}_(.*)', sid)
    date = '%s-%s-%s' % m.group(1, 2, 3) if m else ''
    sid = (m.group(4) if m else sid).replace('_-_', '-').replace('_', '-')
    sid = '%s-%s' % (date[:7], sid) if date else sid
    data = {'id': sid, 'track': meta.get('Track name', ''), 'date': date, 'u': {'xy': 10, 'v': 10, 't': 1000},
            'best': best, 'top': round(top, 1), 'laps': laps}
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, sid + '.json'), 'w') as f: json.dump(data, f, separators=(',', ':'))
    return {'id': sid, 'track': data['track'], 'date': date, 'fastest': laps[best]['t'], 'laps': len(laps), 'top': data['top'],
            'title': meta.get('Session title', '')}

def main():
    args = sys.argv[1:]; outdir = 'data/rd-5vu19xn8kj'
    if '--out' in args:
        i = args.index('--out'); outdir = args[i + 1]; del args[i:i + 2]
    idx_path = os.path.join(outdir, 'index.json')
    idx = {}
    if os.path.exists(idx_path):
        idx = {x['id']: x for x in json.load(open(idx_path))}
    for p in args:
        m = convert(p, outdir); idx[m['id']] = m; print('ok', m['id'], m['laps'], 'laps, fastest', m['fastest'])
    json.dump(sorted(idx.values(), key=lambda x: x['date'], reverse=True), open(idx_path, 'w'), separators=(',', ':'))
main()
