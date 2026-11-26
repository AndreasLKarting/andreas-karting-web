#!/usr/bin/env python3
"""Generate the hidden, unindexed pages /nl|en|gr/rd-5vu19xn8kj/ from the existing language pages (header, footer, head)."""
import re, os
SLUG = '5vu19xn8kj'  # secret part of the URL; the pages are not linked, not in the sitemap and noindex
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
L = {'nl': dict(html='nl', src='nl/index.html', nav='Racedata', title='Racedata | Andreas Lazaridis',
                desc='Ronde voor ronde racedata van Andreas Lazaridis: racelijn, snelheid, G-krachten en rondetijden uit GPS-metingen.', loc='nl_NL'),
     'en': dict(html='en', src='en/index.html', nav='Race data', title='Race data | Andreas Lazaridis',
                desc='Lap-by-lap race data from Andreas Lazaridis: racing line, speed, G-forces and lap times from GPS measurements.', loc='en_GB'),
     'gr': dict(html='el', src='gr/index.html', nav='Δεδομένα αγώνων', title='Δεδομένα αγώνων | Andreas Lazaridis',
                desc='Δεδομένα αγώνων γύρο προς γύρο από τον Andreas Lazaridis: ιδανική γραμμή, ταχύτητα, δυνάμεις G και χρόνοι γύρου από μετρήσεις GPS.', loc='el_GR')}
BODY = '''<main>
<section class="rd-hero"><div class="wrap"><div class="rd-top"><div><span class="eyebrow">Andreas Lazaridis</span><h1 id="rdH1"></h1><p id="rdIntro" class="rd-intro"></p></div><div class="rd-stats" id="rdStats"></div></div></div></section>
<section id="rdDash" class="rd-dash"><div class="wrap"><h2 id="rdTitle"></h2><p id="rdErr" class="rd-err"></p>
<div class="rd-sb" id="rdTiles"></div>
<div class="rd-stage">
<div class="rd-card rd-tw-card"><div class="rd-twh"><span class="k" id="rdTowerT"></span><div class="rd-sort"><button type="button" data-sort="lap" class="on" id="rdSortLap"></button><button type="button" data-sort="time" id="rdSortFast"></button></div></div><div class="rd-tower" id="rdTower"></div></div>
<div class="rd-card rd-mapc"><div class="rd-maph"><div class="rd-lapsel"><button type="button" id="rdPrev">&lsaquo;</button><b id="rdLapNo"></b><button type="button" id="rdNext">&rsaquo;</button></div><span id="rdBadge" class="rd-badge"></span></div>
<svg id="rdMap" class="rd-map" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Racing line"></svg>
<div class="rd-legend"><span><i style="background:#eaf0ff"></i><em id="rdLeg1"></em></span><span><i style="background:#3b7bff"></i><em id="rdLeg2"></em></span><span><i style="background:#ff6a3d"></i><em id="rdLeg3"></em></span></div>
<div class="rd-ctl"><button type="button" id="rdPlay" class="rd-play">&#10074;&#10074;</button><input id="rdSlider" type="range" min="0" max="60" step="0.001" value="0" aria-label="Lap time"><span id="rdTime" class="rd-time"></span><div class="rd-rates"><button type="button" data-rate="0.5">0.5&times;</button><button type="button" data-rate="1" class="on">1&times;</button><button type="button" data-rate="2">2&times;</button></div></div></div>
<div class="rd-side">
<div class="rd-card"><span class="k" id="rdSpeedT"></span><div class="rd-gauge"><svg viewBox="0 0 140 86" aria-hidden="true"><path class="bg" d="M10 76 A60 60 0 0 1 130 76"/><path id="rdArc" class="fg" d="M10 76 A60 60 0 0 1 130 76"/></svg><div class="rd-gv"><b id="rdV">0</b><small id="rdKm"></small></div></div><div class="rd-vs"><span id="rdVsT"></span> <b id="rdDelta">+0.00</b></div></div>
<div class="rd-card"><span class="k" id="rdGT"></span><svg viewBox="0 0 100 100" class="rd-gd" aria-hidden="true"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="21"/><line x1="8" y1="50" x2="92" y2="50"/><line x1="50" y1="8" x2="50" y2="92"/><circle id="rdGdot" cx="50" cy="50" r="3.6" class="dot"/></svg><div class="rd-gl"><span><em id="rdGLatT"></em> <b id="rdGlat">0.0</b> G</span><span><em id="rdGLonT"></em> <b id="rdGlon">0.0</b> G</span></div></div>
</div></div>
<div class="rd-card rd-vid" id="rdVid" hidden><span class="k" id="rdVidT"></span><div class="rd-vbox" id="rdVbox"></div></div>
<div class="rd-card rd-spc"><span class="k" id="rdSpChartT"></span><svg id="rdSpChart" class="rd-chart rd-drag" viewBox="0 0 800 210"></svg></div>
<p class="rd-note" id="rdNote"></p></div></section>
<section id="rdAll"><div class="wrap"><div class="rd-allh"><h2 id="rdAllT"></h2><button type="button" id="rdTop" class="btn ghost"></button></div><div class="rd-cards" id="rdCards"></div></div></section>
<p id="rdEmpty" class="wrap rd-err" hidden></p>
</main>
'''
pth = lambda l: '/rd-%s/' % SLUG if l == 'nl' else '/%s/rd-%s/' % (l, SLUG)  # Dutch (the main language) sits at the shortest URL
LANGSCRIPT = None
for lang, c in L.items():
    s = open(os.path.join(ROOT, c['src']), encoding='utf-8').read()
    if LANGSCRIPT is None:
        LANGSCRIPT = re.search(r'<script>\(function\(\)\{var box=document.getElementById\("lang"\).*?</script>', s, re.S).group(0)
    head = s[:s.index('</head>')]
    url = 'https://www.alracing.nl' + pth(lang)
    head = re.sub(r'<title>.*?</title>', '<title>%s</title>' % c['title'], head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + c['desc'], head)
    head = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\g<1>' + c['desc'], head)
    head = re.sub(r'(<meta name="twitter:description" content=")[^"]*', r'\g<1>' + c['desc'], head)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\g<1>' + c['title'], head)
    head = re.sub(r'(<meta name="twitter:title" content=")[^"]*', r'\g<1>' + c['title'], head)
    head = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\g<1>' + url, head)
    head = re.sub(r'<link rel="canonical"[^>]*>\n?', '', head)
    head = re.sub(r'<link rel="alternate" hreflang[^>]*>\n?', '', head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', head, flags=re.S)
    head = re.sub(r'<script>\(function\(\)\{try\{if\(/bot.*?</script>\n?', '', head, flags=re.S)
    head += '<meta name="robots" content="noindex, nofollow, noarchive">\n<link rel="stylesheet" href="/racedata.css">\n'
    hdr = s[s.index('<header>'):s.index('</header>') + 9]
    hdr = re.sub(r'href="#(profile|achievements|calendar|media|social|sponsoring)"', r'href="/%s/#\1"' % lang, hdr)
    hdr = hdr.replace('<a class="logo" href="#top">', '<a class="logo" href="/%s/">' % lang)
    for l2 in ('nl', 'en', 'gr'):
        hdr = hdr.replace('<a href="/%s/" hreflang' % l2, '<a href="%s" hreflang' % pth(l2))
    ftr = s[s.index('<footer>'):s.index('</footer>') + 9]
    ftr = re.sub(r'href="#(calendar|sponsoring)"', r'href="/%s/#\1"' % lang, ftr)
    out = head + '</head>\n<body>\n' + hdr + '\n' + BODY + ftr + '\n' + LANGSCRIPT + '\n<script src="/racedata.js"></script>\n</body>\n</html>\n'
    d = os.path.join(ROOT, *pth(lang).strip('/').split('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok')
