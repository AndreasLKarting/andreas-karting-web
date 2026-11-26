#!/usr/bin/env python3
"""Generate /nl/racedata/, /en/racedata/ and /gr/racedata/ from the existing language pages (header, footer, head)."""
import re, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
L = {'nl': dict(html='nl', src='nl/index.html', nav='Racedata', title='Racedata | Andreas Lazaridis',
                desc='Ronde voor ronde racedata van Andreas Lazaridis: racelijn, snelheid, G-krachten en rondetijden uit GPS-metingen.', loc='nl_NL'),
     'en': dict(html='en', src='en/index.html', nav='Race data', title='Race data | Andreas Lazaridis',
                desc='Lap-by-lap race data from Andreas Lazaridis: racing line, speed, G-forces and lap times from GPS measurements.', loc='en_GB'),
     'gr': dict(html='el', src='gr/index.html', nav='Δεδομένα αγώνων', title='Δεδομένα αγώνων | Andreas Lazaridis',
                desc='Δεδομένα αγώνων γύρο προς γύρο από τον Andreas Lazaridis: ιδανική γραμμή, ταχύτητα, δυνάμεις G και χρόνοι γύρου από μετρήσεις GPS.', loc='el_GR')}
BODY = '''<main>
<section class="rd-hero"><svg id="rdBg" class="rd-bg" aria-hidden="true" preserveAspectRatio="xMaxYMid meet"></svg><div class="wrap"><span class="eyebrow">Andreas Lazaridis</span><h1 id="rdH1"></h1><p id="rdIntro" class="rd-intro"></p><div class="rd-stats" id="rdStats"></div></div></section>
<section id="rdDash" class="rd-dash"><div class="wrap"><h2 id="rdTitle"></h2><p id="rdErr" class="rd-err"></p>
<div class="rd-tiles" id="rdTiles"></div>
<div class="rd-grid">
<div class="rd-card rd-mapc"><div class="rd-maph"><div class="rd-lapsel"><button type="button" id="rdPrev">&lsaquo;</button><b id="rdLapNo"></b><button type="button" id="rdNext">&rsaquo;</button></div><span id="rdBadge" class="rd-badge"></span></div>
<svg id="rdMap" class="rd-map" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Racing line"></svg>
<div class="rd-legend"><span><i style="background:#d4ff3a"></i><em id="rdLeg1"></em></span><span><i style="background:#4d74ff"></i><em id="rdLeg2"></em></span><span><i style="background:#ff4b5c"></i><em id="rdLeg3"></em></span></div>
<div class="rd-ctl"><button type="button" id="rdPlay" class="rd-play">&#10074;&#10074;</button><input id="rdSlider" type="range" min="0" max="60" step="0.001" value="0" aria-label="Lap time"><span id="rdTime" class="rd-time"></span><div class="rd-rates"><button type="button" data-rate="0.5">0.5&times;</button><button type="button" data-rate="1" class="on">1&times;</button><button type="button" data-rate="2">2&times;</button></div></div></div>
<div class="rd-side">
<div class="rd-card"><span class="k" id="rdSpeedT"></span><div class="rd-v"><b id="rdV">0</b><small id="rdKm"></small></div><div class="rd-bar"><i id="rdVbar"></i></div><div class="rd-vs"><span id="rdVsT"></span> <b id="rdDelta">+0.00</b></div></div>
<div class="rd-card"><span class="k" id="rdGT"></span><svg viewBox="0 0 100 100" class="rd-gd" aria-hidden="true"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="21"/><line x1="8" y1="50" x2="92" y2="50"/><line x1="50" y1="8" x2="50" y2="92"/><circle id="rdGdot" cx="50" cy="50" r="3.6" class="dot"/></svg><div class="rd-gl"><span><em id="rdGLatT"></em> <b id="rdGlat">0.0</b> G</span><span><em id="rdGLonT"></em> <b id="rdGlon">0.0</b> G</span></div></div>
</div></div>
<div class="rd-card"><span class="k" id="rdSpChartT"></span><svg id="rdSpChart" class="rd-chart rd-drag" viewBox="0 0 800 210"></svg></div>
<div class="rd-card"><span class="k" id="rdLapChartT"></span><svg id="rdLapChart" class="rd-chart" viewBox="0 0 800 200"></svg></div>
<p class="rd-note" id="rdNote"></p></div></section>
<section id="rdAll"><div class="wrap"><div class="rd-allh"><h2 id="rdAllT"></h2><button type="button" id="rdTop" class="btn ghost"></button></div><div class="rd-cards" id="rdCards"></div></div></section>
<p id="rdEmpty" class="wrap rd-err" hidden></p>
</main>
'''
LANGSCRIPT = None
for lang, c in L.items():
    s = open(os.path.join(ROOT, c['src']), encoding='utf-8').read()
    if LANGSCRIPT is None:
        LANGSCRIPT = re.search(r'<script>\(function\(\)\{var box=document.getElementById\("lang"\).*?</script>', s, re.S).group(0)
    head = s[:s.index('</head>')]
    url = 'https://www.alracing.nl/%s/racedata/' % lang
    head = re.sub(r'<title>.*?</title>', '<title>%s</title>' % c['title'], head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + c['desc'], head)
    head = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\g<1>' + c['desc'], head)
    head = re.sub(r'(<meta name="twitter:description" content=")[^"]*', r'\g<1>' + c['desc'], head)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\g<1>' + c['title'], head)
    head = re.sub(r'(<meta name="twitter:title" content=")[^"]*', r'\g<1>' + c['title'], head)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + url, head)
    head = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\g<1>' + url, head)
    for hl, path in (('nl', '/nl/racedata/'), ('en', '/en/racedata/'), ('el', '/gr/racedata/'), ('x-default', '/nl/racedata/')):
        head = re.sub(r'(<link rel="alternate" hreflang="%s" href=")[^"]*' % hl, r'\g<1>https://www.alracing.nl' + path, head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', head, flags=re.S)
    head = re.sub(r'<script>\(function\(\)\{try\{if\(/bot.*?</script>\n?', '', head, flags=re.S)
    head += '<link rel="stylesheet" href="/racedata.css">\n'
    hdr = s[s.index('<header>'):s.index('</header>') + 9]
    hdr = re.sub(r'href="#(profile|achievements|calendar|media|social|sponsoring)"', r'href="/%s/#\1"' % lang, hdr)
    hdr = hdr.replace('<a class="logo" href="#top">', '<a class="logo" href="/%s/">' % lang)
    for l2 in ('nl', 'en', 'gr'):
        hdr = hdr.replace('<a href="/%s/" hreflang' % l2, '<a href="/%s/racedata/" hreflang' % l2)
    hdr = hdr.replace('</nav>', '<a href="/%s/racedata/" aria-current="page">%s</a></nav>' % (lang, c['nav']), 1)
    ftr = s[s.index('<footer>'):s.index('</footer>') + 9]
    ftr = re.sub(r'href="#(calendar|sponsoring)"', r'href="/%s/#\1"' % lang, ftr)
    ftr = re.sub(r'(<a href="/%s/#calendar" data-i18n="footer_calendar">[^<]*</a>)' % lang, r'\1<a href="/%s/racedata/">%s</a>' % (lang, c['nav']), ftr, 1)
    out = head + '</head>\n<body>\n' + hdr + '\n' + BODY + ftr + '\n' + LANGSCRIPT + '\n<script src="/racedata.js"></script>\n</body>\n</html>\n'
    os.makedirs(os.path.join(ROOT, lang, 'racedata'), exist_ok=True)
    open(os.path.join(ROOT, lang, 'racedata', 'index.html'), 'w', encoding='utf-8').write(out)
    # nav + footer link on the home page
    for page in ([c['src'], 'index.html'] if lang == 'nl' else [c['src']]):
        pth = os.path.join(ROOT, page); h = open(pth, encoding='utf-8').read()
        if '/racedata/' not in h:
            h = h.replace('</nav>', '<a href="/%s/racedata/">%s</a></nav>' % (lang, c['nav']), 1)
            h = re.sub(r'(<a href="#calendar" data-i18n="footer_calendar">[^<]*</a>)', r'\1<a href="/%s/racedata/">%s</a>' % (lang, c['nav']), h, 1)
            open(pth, 'w', encoding='utf-8').write(h)
print('ok')
