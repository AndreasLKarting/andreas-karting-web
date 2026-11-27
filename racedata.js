/* Race data page: lap-by-lap telemetry from RaceChrono sessions.
   Session list: Google Sheet tab "Sessions" (columns: date, title, track, country, type, file, show, notes;
   optional title_en / title_el), published as CSV and pasted in SESSIONS_CSV below.
   Telemetry: /data/rd-5vu19xn8kj/<file>.json, made with tools/telemetry/convert.py.
   Without the sheet, every session in /data/rd-5vu19xn8kj/index.json is shown. */
(function () {
  "use strict";
  var SESSIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrQTYaoqWvwmPKYbInqhbu4hII_DbV8_bhokbmEGP2MNCJb8efUMAeSUDZZZQDEM2u_l4HOSiRgwo5/pub?gid=2063501786&single=true&output=csv"; // "Sessions" tab, File > Share > Publish to web > CSV
  var EMAIL = "info@alracing.nl";
  var LINKS = { instagram: "https://www.instagram.com/andreas.lazaridis.karting/", tiktok: "https://www.tiktok.com/@andreaskarting", youtube: "https://www.youtube.com/channel/UC0MeHXdDhLF814x2ey1p_Wg" };
  var DATA = "/data/rd-5vu19xn8kj/";
  var LANG = document.documentElement.lang || "nl";
  var TX = {
    nl: { chDate:"Datum",chTrack:"Baan",chCity:"Plaats",chCountry:"Land",chLen:"Lengte",chDir:"Richting",chCorners:"Bochten",chCornV:"hoofdbochten",chType:"Type",chKart:"Kart",chEvent:"Evenement",chCond:"Omstandigheden",chTemp:"Baantemp.",chNotes:"Opmerking", theoSub:"{x} s ({y}%) blijft liggen", cons:"Consistentie", consSub:"beste 5 ronden vs beste · verschil tussen ronden {x}%", clean:"schoon", total:"totaal", cleanSub:"trage ronden uitgesloten", cmpT:"Vergelijk met", fastTag:"snelste", deT:"Tijdverschil t.o.v. vergelijkingsronde (s) · onder 0 winst, boven 0 verlies", vsLap:"t.o.v. ronde", trT:"Verloop rondetijden", trLeg:"gouden stip: snelste ronde · gestreept: gemiddelde", avgS:"Gem.", ggT:"G-G / grip", gLatAx:"Zijwaartse G", gLonAx:"Lengte G", pLat:"Max zijwaarts", pBrk:"Max remkracht", tkT:"Belangrijkste inzichten", tk1:"Grootste winst", tk1v:"{c}: gemiddeld +{x} s", tk1s:"Hier verlies je gemiddeld de meeste tijd t.o.v. je eigen beste doorkomst.", tk2:"Meest consistent", tk2s:"Kleinste spreiding tussen ronden: ±{x} s.", tk3:"Beste reeks", tk3v:"Ronden {a}–{b} binnen {x} s", tk3s:"De sterkste opeenvolgende ronden van de sessie.", hiT:"Baangeschiedenis", hiPb:"persoonlijk record", hiFirst:"eerste bezoek. Een volgend bezoek wordt hier vergeleken.", hiNew:"nieuw persoonlijk record in deze sessie.", hiVs:"deze sessie: {x} s t.o.v. record.", hiNext:"volgende sessie…", an: "Analyse", sec: "Sectoren", secN: "Sectoren zijn drie even lange delen van de ronde (geen tijdlijnen op de baan), dus indicatief. Paars = beste sector.", cor: "Bochten", corSub: "Gekozen ronde t.o.v. de snelste ronde", corN: "Berekend uit GPS: verschillen van enkele honderdsten zijn meetruis.", lp: "Ronde", tm: "Tijd", theo: "Theoretisch beste", entry: "Ingang", minv: "Min", exit: "Uitgang", plat: "Max zijw. G", gap: "Verschil (s)", crn: "B", peakBr: "max. remkracht", vsFast: "snelste ronde", fastShort: "Snelste", title: "Racedata", intro: "Elke sessie ronde voor ronde: racelijn, snelheid en de snelste ronde. Kies een sessie en rijd mee.", sessions: "Sessies", laps: "Gereden ronden", circuits: "Circuits", top: "Topsnelheid", latest: "Laatste sessie", chosen: "Sessie", fastest: "Snelste ronde", lapWord: "Ronde", avg: "Gemiddelde ronde", avgSub: "zonder trage ronden", count: "Ronden", countSub: "in deze sessie", topSub: "hoogst gemeten", straight: "Rechtdoor", bend: "Bocht", brake: "Remmen", speed: "Snelheid", vs: "t.o.v. snelste ronde", g: "G-krachten", lat: "zijwaarts", lon: "lengte", spChart: "Snelheid over de ronde · klik of sleep om te springen", lapChart: "Alle rondetijden · klik op een ronde om mee te rijden", note: "Gemeten met GPS. G-krachten zijn berekend uit de racelijn en snelheid.", onboard: "Onboard", watch: "Bekijk de onboard", sortLap: "Volgorde", sortFast: "Snelste eerst", all: "Alle sessies", ride: "Rijd mee →", toTop: "Naar boven", rounds: "ronden", fl: "Snelste ronde", fastBadge: "Snelste ronde", play: "Afspelen", pause: "Pauzeren", prev: "Vorige ronde", next: "Volgende ronde", empty: "Nog geen sessies.", err: "De data kon niet geladen worden.", loading: "Laden…", slow: "trager dan de grafiek toont", km: "km/u" },
    en: { chDate:"Date",chTrack:"Track",chCity:"City",chCountry:"Country",chLen:"Length",chDir:"Direction",chCorners:"Corners",chCornV:"main corners",chType:"Type",chKart:"Kart",chEvent:"Event",chCond:"Conditions",chTemp:"Track temp",chNotes:"Note", theoSub:"{x} s ({y}%) left on the table", cons:"Consistency", consSub:"best 5 laps vs best · lap-to-lap change {x}%", clean:"clean", total:"total", cleanSub:"slow laps excluded", cmpT:"Compare with", fastTag:"fastest", deT:"Delta time vs compare lap (s) · below 0 gaining, above 0 losing", vsLap:"compared to lap", trT:"Lap-time trend", trLeg:"gold dot: fastest lap · dashed: average", avgS:"Avg", ggT:"G-G / grip", gLatAx:"Lateral G", gLonAx:"Longitudinal G", pLat:"Peak lateral", pBrk:"Peak braking", tkT:"Key takeaways", tk1:"Biggest gain", tk1v:"{c}: +{x} s on average", tk1s:"The corner where you lose the most time on average against your own best.", tk2:"Most consistent", tk2s:"Tightest spread between laps: ±{x} s.", tk3:"Best stint", tk3v:"Laps {a}–{b} within {x} s", tk3s:"The strongest consecutive laps of the session.", hiT:"Track history", hiPb:"personal best", hiFirst:"first visit. The next visit will be compared here.", hiNew:"new personal best in this session.", hiVs:"this session: {x} s vs the record.", hiNext:"next visit…", an: "Analysis", sec: "Sectors", secN: "Sectors are three equal-distance parts of the lap (there are no timing lines on the track), so indicative. Purple = best sector.", cor: "Corners", corSub: "Selected lap vs the fastest lap", corN: "Calculated from GPS: differences of a few hundredths are measurement noise.", lp: "Lap", tm: "Time", theo: "Theoretical best", entry: "Entry", minv: "Min", exit: "Exit", plat: "Peak lat G", gap: "Gap (s)", crn: "T", peakBr: "peak braking", vsFast: "fastest lap", fastShort: "Fastest", title: "Race data", intro: "Every session lap by lap: racing line, speed and the fastest lap. Choose a session and ride along.", sessions: "Sessions", laps: "Laps completed", circuits: "Circuits", top: "Top speed", latest: "Latest session", chosen: "Session", fastest: "Fastest lap", lapWord: "Lap", avg: "Average lap", avgSub: "excluding slow laps", count: "Laps", countSub: "in this session", topSub: "highest measured", straight: "Straight ahead", bend: "Bend", brake: "Brakes", speed: "Speed", vs: "compared to fastest", g: "G-forces", lat: "lateral", lon: "longitudinal", spChart: "Speed over the lap · click or drag to jump", lapChart: "All lap times · click a lap to ride along", note: "Measured with GPS. G-forces are calculated from the racing line and speed.", onboard: "Onboard", watch: "Watch the onboard", sortLap: "Order", sortFast: "Fastest first", all: "All sessions", ride: "Ride along →", toTop: "Top", rounds: "laps", fl: "Fastest lap", fastBadge: "Fastest lap", play: "Play", pause: "Pause", prev: "Previous lap", next: "Next lap", empty: "No sessions yet.", err: "The data could not be loaded.", loading: "Loading…", slow: "slower than the chart shows", km: "km/h" },
    el: { chDate:"Ημερομηνία",chTrack:"Πίστα",chCity:"Πόλη",chCountry:"Χώρα",chLen:"Μήκος",chDir:"Κατεύθυνση",chCorners:"Στροφές",chCornV:"κύριες στροφές",chType:"Τύπος",chKart:"Kart",chEvent:"Εκδήλωση",chCond:"Συνθήκες",chTemp:"Θερμ. πίστας",chNotes:"Σημείωση", theoSub:"{x} s ({y}%) χάνονται", cons:"Σταθερότητα", consSub:"καλύτεροι 5 γύροι έναντι καλύτερου · μεταβολή μεταξύ γύρων {x}%", clean:"καθαροί", total:"σύνολο", cleanSub:"εξαιρούνται οι αργοί γύροι", cmpT:"Σύγκριση με", fastTag:"ταχύτερος", deT:"Διαφορά χρόνου έναντι γύρου σύγκρισης (s) · κάτω από 0 κερδίζετε, πάνω από 0 χάνετε", vsLap:"σε σχέση με τον γύρο", trT:"Τάση χρόνων γύρου", trLeg:"χρυσή τελεία: ταχύτερος γύρος · διακεκομμένη: μέσος όρος", avgS:"Μ.Ο.", ggT:"G-G / πρόσφυση", gLatAx:"Πλάγια G", gLonAx:"Διαμήκης G", pLat:"Μέγ. πλάγια", pBrk:"Μέγ. πέδηση", tkT:"Βασικά συμπεράσματα", tk1:"Μεγαλύτερο κέρδος", tk1v:"{c}: +{x} s κατά μέσο όρο", tk1s:"Η στροφή όπου χάνετε τον περισσότερο χρόνο σε σχέση με το δικό σας καλύτερο.", tk2:"Πιο σταθερός", tk2s:"Μικρότερη διασπορά μεταξύ γύρων: ±{x} s.", tk3:"Καλύτερη σειρά", tk3v:"Γύροι {a}–{b} εντός {x} s", tk3s:"Οι δυνατότεροι διαδοχικοί γύροι της συνεδρίας.", hiT:"Ιστορικό πίστας", hiPb:"προσωπικό ρεκόρ", hiFirst:"πρώτη επίσκεψη. Η επόμενη επίσκεψη θα συγκριθεί εδώ.", hiNew:"νέο προσωπικό ρεκόρ σε αυτή τη συνεδρία.", hiVs:"αυτή η συνεδρία: {x} s έναντι του ρεκόρ.", hiNext:"επόμενη επίσκεψη…", an: "Ανάλυση", sec: "Τομείς", secN: "Οι τομείς είναι τρία ίσα τμήματα του γύρου (δεν υπάρχουν γραμμές χρονομέτρησης), άρα ενδεικτικοί. Μωβ = καλύτερος τομέας.", cor: "Στροφές", corSub: "Επιλεγμένος γύρος σε σχέση με τον ταχύτερο", corN: "Υπολογισμός από GPS: διαφορές λίγων εκατοστών είναι θόρυβος μέτρησης.", lp: "Γύρος", tm: "Χρόνος", theo: "Θεωρητικά καλύτερος", entry: "Είσοδος", minv: "Ελάχ.", exit: "Έξοδος", plat: "Μέγ. πλάγια G", gap: "Διαφορά (s)", crn: "Σ", peakBr: "μέγ. πέδηση", vsFast: "ταχύτερος γύρος", fastShort: "Ταχύτερος", title: "Δεδομένα αγώνων", intro: "Κάθε συνεδρία γύρο προς γύρο: ιδανική γραμμή, ταχύτητα και ο ταχύτερος γύρος. Επιλέξτε μια συνεδρία και ακολουθήστε τον γύρο.", sessions: "Συνεδρίες", laps: "Ολοκληρωμένοι γύροι", circuits: "Πίστες", top: "Μέγιστη ταχύτητα", latest: "Τελευταία συνεδρία", chosen: "Συνεδρία", fastest: "Ταχύτερος γύρος", lapWord: "Γύρος", avg: "Μέσος γύρος", avgSub: "χωρίς αργούς γύρους", count: "Γύροι", countSub: "σε αυτή τη συνεδρία", topSub: "υψηλότερη μέτρηση", straight: "Ευθεία", bend: "Στροφή", brake: "Φρένα", speed: "Ταχύτητα", vs: "σε σχέση με τον ταχύτερο", g: "Δυνάμεις G", lat: "πλάγια", lon: "διαμήκης", spChart: "Ταχύτητα στον γύρο · κάντε κλικ ή σύρετε για να μεταβείτε", lapChart: "Όλοι οι χρόνοι γύρου · κάντε κλικ σε έναν γύρο", note: "Μετρήσεις με GPS. Οι δυνάμεις G υπολογίζονται από την ιδανική γραμμή και την ταχύτητα.", onboard: "Onboard", watch: "Δες το onboard", sortLap: "Σειρά", sortFast: "Ταχύτεροι πρώτα", all: "Όλες οι συνεδρίες", ride: "Δες τον γύρο →", toTop: "Επάνω", rounds: "γύροι", fl: "Ταχύτερος γύρος", fastBadge: "Ταχύτερος γύρος", play: "Αναπαραγωγή", pause: "Παύση", prev: "Προηγούμενος γύρος", next: "Επόμενος γύρος", empty: "Δεν υπάρχουν ακόμη συνεδρίες.", err: "Δεν ήταν δυνατή η φόρτωση των δεδομένων.", loading: "Φόρτωση…", slow: "πιο αργός από όσο δείχνει το γράφημα", km: "χλμ/ώρα" }
  };
  var T = TX[LANG] || TX.en, DATEL = { nl: "nl-NL", en: "en-GB", el: "el-GR" }[LANG] || "en-GB";
  var COL = { straight: "#eaf0ff", bend: "#3b7bff", brake: "#ff6a3d", best: "#f5c542", pur: "#b58cff" };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var fmtT = function (s) { if (!isFinite(s)) return "–"; var m = Math.floor(s / 60), r = s - m * 60; return m ? m + ":" + (r < 10 ? "0" : "") + r.toFixed(3) : r.toFixed(3); };
  function csv(t) { var r = [], w = [], c = "", q = 0, i, h; for (i = 0; i < t.length; i++) { h = t[i]; if (q) { if (h == '"' && t[i + 1] == '"') { c += '"'; i++; } else if (h == '"') q = 0; else c += h; } else if (h == '"') q = 1; else if (h == ",") { w.push(c); c = ""; } else if (h == "\n") { w.push(c); r.push(w); w = []; c = ""; } else if (h != "\r") c += h; } w.push(c); r.push(w); return r; }
  function iso(d) { d = String(d || "").trim(); var m = d.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})$/); if (!m) return d.slice(0, 10); var a = +m[1], b = +m[2]; if (b > 12 && a <= 12) { var x = a; a = b; b = x; } return m[3] + "-" + String(b).padStart(2, "0") + "-" + String(a).padStart(2, "0"); }
  function fmtDate(d) { var t = new Date(d + "T12:00:00"); return isNaN(t) ? d : t.toLocaleDateString(DATEL, { day: "numeric", month: "long", year: "numeric" }); }
  function getJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }

  // ---------- header/footer wiring
  document.querySelectorAll("[data-mail]").forEach(function (a) { a.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Sponsorship enquiry - Andreas Lazaridis"); });
  document.querySelectorAll("[data-k]").forEach(function (a) { a.href = LINKS[a.dataset.k]; a.target = "_blank"; a.rel = "noopener"; });

  // ---------- state
  var S = { cmp: 0, cs: null, list: [], meta: {}, cur: null, data: null, laps: [], sel: 0, best: 0, tc: 0, playing: true, rate: 1, sort: "lap", vmax: 100, bounds: null, latestId: null };
  var raf = 0, lastTs = 0;

  // ---------- decode one lap into arrays and derived G-forces / segment types
  function decode(l, u) {
    if (l._d) return l._d;
    var P = l.p, n = P.length / 4, x = new Float32Array(n), y = new Float32Array(n), v = new Float32Array(n), t = new Float32Array(n), i;
    for (i = 0; i < n; i++) { x[i] = P[4 * i] / u.xy; y[i] = -P[4 * i + 1] / u.xy; v[i] = P[4 * i + 2] / u.v; t[i] = P[4 * i + 3] / u.t; }
    var gl = new Float32Array(n), gt = new Float32Array(n), th = new Float32Array(n);
    for (i = 1; i < n - 1; i++) th[i] = Math.atan2(y[i + 1] - y[i - 1], x[i + 1] - x[i - 1]);
    th[0] = th[1]; th[n - 1] = th[n - 2];
    for (i = 1; i < n - 1; i++) {
      var dt = Math.max(t[i + 1] - t[i - 1], 1e-3), dth = th[i + 1] - th[i - 1];
      while (dth > Math.PI) dth -= 2 * Math.PI; while (dth < -Math.PI) dth += 2 * Math.PI;
      gl[i] = (v[i + 1] - v[i - 1]) / 3.6 / dt / 9.81;
      gt[i] = (v[i] / 3.6) * (dth / dt) / 9.81;
    }
    var sm = function (a) { for (var k = 0; k < 3; k++) { var b = new Float32Array(a.length); for (var j = 0; j < a.length; j++) { var s = 0, c = 0; for (var d = -3; d <= 3; d++) { var q = j + d; if (q >= 0 && q < a.length) { s += a[q]; c++; } } b[j] = s / c; } a = b; } return a; };
    gl = sm(gl); gt = sm(gt);
    var type = new Uint8Array(n);
    for (i = 0; i < n; i++) type[i] = gl[i] < -0.12 ? 2 : Math.abs(gt[i]) > 0.33 ? 1 : 0;
    return (l._d = { x: x, y: y, v: v, t: t, gl: gl, gt: gt, type: type, n: n });
  }

  // ---------- corners (found on the fastest lap, same index windows on every lap) and three equal-distance sectors
  function findCorners(q) { // one corner per peak of the racing line's turning rate; neighbours turning the same way without a clear easing-off between them are merged
    var n = q.n, v = q.v, i, k, ad = function (a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
    var sm = function (a) { var b = new Float32Array(n); for (var r = 0; r < 2; r++) { for (i = 0; i < n; i++) b[i] = (a[Math.max(0, i - 1)] + a[i] + a[Math.min(n - 1, i + 1)]) / 3; a = Float32Array.from(b); } return a; };
    var sx = sm(q.x), sy = sm(q.y), th = new Float32Array(n), tr = new Float32Array(n);
    for (i = 1; i < n - 1; i++) th[i] = Math.atan2(sy[i + 1] - sy[i - 1], sx[i + 1] - sx[i - 1]);
    th[0] = th[1]; th[n - 1] = th[n - 2];
    for (i = 0; i < n; i++) tr[i] = ad(th[Math.min(n - 1, i + 2)] - th[Math.max(0, i - 2)]);
    var pk = [];
    for (i = 2; i < n - 2; i++) { var a = Math.abs(tr[i]); if (a >= 0.48 && a >= Math.abs(tr[i - 1]) && a > Math.abs(tr[i + 1]) && a >= Math.abs(tr[i - 2]) && a >= Math.abs(tr[i + 2])) pk.push(i); }
    var out = [];
    pk.forEach(function (p) {
      var last = out[out.length - 1];
      if (last && Math.sign(tr[last.p]) === Math.sign(tr[p])) {
        var dip = 1e9, di = last.p; for (k = last.p; k <= p; k++) { var d = Math.sign(tr[p]) * tr[k]; if (d < dip) { dip = d; di = k; } }
        if (p - last.p < 7 || dip > 0.9 * Math.min(Math.abs(tr[last.p]), Math.abs(tr[p]))) { if (Math.abs(tr[p]) > Math.abs(tr[last.p])) last.p = p; return; }
      }
      out.push({ p: p });
    });
    return out.map(function (o, j) {
      var c = Math.max(0, o.p - 4); for (k = c; k <= Math.min(n - 1, o.p + 4); k++) if (v[k] < v[c]) c = k;
      var lo = Math.max(j ? out[j - 1].p + 1 : 0, o.p - 9), hi = Math.min(j < out.length - 1 ? out[j + 1].p - 1 : n - 1, o.p + 9), e = lo, x = c;
      for (k = lo; k <= c; k++) if (v[k] >= v[e]) e = k;
      for (k = c; k <= hi; k++) if (v[k] >= v[x]) x = k;
      return { e: e, c: c, x: x, pr: 0 };
    });
  }
  function sectorTimes(l, u) {
    var q = decode(l, u), n = q.n, b1 = Math.round((n - 1) / 3), b2 = Math.round(2 * (n - 1) / 3), t0 = q.t[0];
    return [q.t[b1] - t0, q.t[b2] - q.t[b1], l.t - (q.t[b2] - t0)];
  }
  function cornerStats(l, u, cr) {
    var q = decode(l, u), mn = 1e9, pl = 0, k;
    for (k = cr.e; k <= cr.x; k++) { mn = Math.min(mn, q.v[k]); pl = Math.max(pl, Math.abs(q.gt[k])); }
    return { entry: q.v[cr.e], min: mn, exit: q.v[cr.x], lat: pl, time: q.t[cr.x] - q.t[cr.e] };
  }

  // ---------- onboard video (optional "video" column in the Sessions tab: YouTube link or id; "video_start" in seconds)
  function ytId(v) { v = String(v || "").trim(); var m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : ""; }
  function renderVideo(s) {
    var id = ytId(s.video), box = $("rdVbox"), card = $("rdVid");
    if (!id) { card.hidden = true; box.innerHTML = ""; return; }
    var st = parseInt(s.vstart, 10) > 0 ? parseInt(s.vstart, 10) : 0;
    box.innerHTML = "<button type='button' class='rd-vplay' aria-label='" + esc(T.watch) + "'><img src='https://i.ytimg.com/vi/" + id + "/hqdefault.jpg' alt='' loading='lazy'><span>▶ " + esc(T.watch) + "</span></button>";
    box.firstChild.onclick = function () { box.innerHTML = "<iframe src='https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0" + (st ? "&start=" + st : "") + "' title='" + esc(s.title) + "' allow='accelerometer; autoplay; encrypted-media; picture-in-picture' allowfullscreen referrerpolicy='strict-origin-when-cross-origin'></iframe>"; };
    card.hidden = false;
  }

  // ---------- loading
  function loadList() {
    var idx = getJSON(DATA + "index.json").catch(function () { return []; });
    var sheet = SESSIONS_CSV ? fetch(SESSIONS_CSV).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(csv).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([idx, sheet]).then(function (res) {
      var idxList = res[0], rows = res[1], meta = {};
      idxList.forEach(function (m) { meta[m.id] = m; });
      var list = [];
      if (rows && rows.length > 1) {
        var hd = rows[0].map(function (h) { return h.trim().toLowerCase(); }), ix = function (n) { return hd.indexOf(n); };
        rows.slice(1).forEach(function (r) {
          var g = function (n) { return ix(n) < 0 ? "" : (r[ix(n)] || "").trim(); };
          var file = g("file").replace(/\.json$/i, "").replace(/^.*\//, "");
          if (!file || /^(no|nee|0|false|n)$/i.test(g("show"))) return;
          var m = meta[file] || {};
          list.push({ id: file, date: iso(g("date")) || m.date || "", title: g("title_" + LANG) || g("title") || m.title || file, track: g("track") || m.track || "", country: g("country"), type: g("type"), notes: g("notes"), city: g("city"), kart: g("kart"), event: g("event"), cond: g("conditions"), temp: g("track_temp"), dir: g("direction"), video: g("video"), vstart: g("video_start"), fastest: m.fastest, laps: m.laps, top: m.top, o: m.o });
        });
      } else {
        idxList.forEach(function (m) { list.push({ id: m.id, date: m.date, title: m.title || m.track, track: m.track, fastest: m.fastest, laps: m.laps, top: m.top, o: m.o }); });
      }
      list.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      S.list = list;
      return list;
    });
  }

  function renderHero() {
    var l = S.list, tracks = {}, laps = 0, top = 0;
    l.forEach(function (s) { tracks[(s.track || s.id).toLowerCase()] = 1; laps += s.laps || 0; top = Math.max(top, s.top || 0); });
    var st = [[l.length, T.sessions], [laps, T.laps], [Object.keys(tracks).length, T.circuits], [top ? Math.round(top * 10) / 10 + "<small>" + T.km + "</small>" : "–", T.top]];
    $("rdStats").innerHTML = st.map(function (x) { return "<div><b>" + x[0] + "</b><span>" + esc(x[1]) + "</span></div>"; }).join("");
  }

  function selectSession(id, scroll) {
    var s = S.list.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    S.cur = s; $("rdTitle").textContent = (id === S.latestId ? T.latest : T.chosen) + ": " + s.title;
    $("rdDash").classList.add("loading");
    getJSON(DATA + id + ".json").then(function (d) {
      S.data = d; S.laps = d.laps; S.best = d.best; S.sel = d.best; S.cmp = d.best; S.tc = 0;
      var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, vmax = 0;
      d.laps.forEach(function (l) { var q = decode(l, d.u); for (var i = 0; i < q.n; i++) { vmax = Math.max(vmax, q.v[i]); } });
      var b = decode(d.laps[d.best], d.u);
      for (var i = 0; i < b.n; i++) { minX = Math.min(minX, b.x[i]); maxX = Math.max(maxX, b.x[i]); minY = Math.min(minY, b.y[i]); maxY = Math.max(maxY, b.y[i]); }
      S.bounds = [minX, minY, maxX, maxY]; S.vmax = Math.ceil(vmax / 20) * 20 + 0;
      s.fastest = d.laps[d.best].t; s.laps = d.laps.length; s.top = d.top;
      buildDash(); setLap(d.best, true); renderVideo(s);
      $("rdDash").classList.remove("loading");
      renderCards();
      if (scroll) $("rdDash").scrollIntoView({ behavior: "smooth", block: "start" });
    }).catch(function () { $("rdDash").classList.remove("loading"); $("rdDash").classList.add("failed"); $("rdErr").textContent = T.err; });
  }

  // ---------- dashboard markup (once per session)
  function buildDash() {
    var d = S.data, laps = d.laps, best = laps[d.best].t;
    S.corners = findCorners(decode(laps[d.best], d.u));
    var ci = [], secs = [], mins = [1e9, 1e9, 1e9], k;
    laps.forEach(function (l, i) { if (l.t <= best * 1.08) { ci.push(i); var st = sectorTimes(l, d.u); secs.push(st); for (k = 0; k < 3; k++) mins[k] = Math.min(mins[k], st[k]); } });
    S.cs = { idx: ci, sec: secs, mins: mins };
    var ts = ci.map(function (i) { return laps[i].t; }), avg = ts.reduce(function (a2, x) { return a2 + x; }, 0) / ts.length;
    var theo = mins[0] + mins[1] + mins[2], left = best - theo;
    var sorted = ts.slice().sort(function (a2, b2) { return a2 - b2; }), n5 = sorted.slice(0, 5), a5 = n5.reduce(function (a2, x) { return a2 + x; }, 0) / n5.length;
    var dsum = 0, dn = 0; for (k = 1; k < ci.length; k++) if (ci[k] === ci[k - 1] + 1) { dsum += Math.abs(laps[ci[k]].t - laps[ci[k - 1]].t); dn++; }
    var cons = (a5 - best) / best * 100, l2l = dn ? dsum / dn / avg * 100 : 0;
    $("rdTiles").innerHTML = [
      [T.fastest, "<span class='gd'>" + fmtT(best) + "</span>", T.lapWord + " " + laps[d.best].n],
      [T.theo, fmtT(theo), left > 0.0005 ? T.theoSub.replace("{x}", left.toFixed(2)).replace("{y}", (left / best * 100).toFixed(2)) : "–"],
      [T.avg, fmtT(avg), T.avgSub],
      [T.cons, "+" + cons.toFixed(2) + "%", T.consSub.replace("{x}", l2l.toFixed(2))],
      [T.top, d.top + " <small>" + T.km + "</small>", T.topSub],
      [T.count, ci.length + " <small>" + T.clean + " / " + laps.length + " " + T.total + "</small>", T.cleanSub]
    ].map(function (x) { return "<div class='sb'><span class='k'>" + esc(x[0]) + "</span><b>" + x[1] + "</b><span class='s'>" + esc(x[2]) + "</span></div>"; }).join("");
    $("rdCmp").innerHTML = laps.map(function (l, i) { return "<option value='" + i + "'" + (i === S.cmp ? " selected" : "") + ">" + esc(T.lapWord + " " + l.n + " · " + fmtT(l.t) + (i === d.best ? " (" + T.fastTag + ")" : "")) + "</option>"; }).join("");
    renderChips(); renderTakeaways(); renderHistory();
    // map
    var bb = S.bounds, pad = 22, w = bb[2] - bb[0] + 2 * pad, h = bb[3] - bb[1] + 2 * pad;
    var svg = $("rdMap"); svg.setAttribute("viewBox", [bb[0] - pad, bb[1] - pad, w, h].join(" "));
    var sc = Math.max(w, h) / 420;
    svg.dataset.sc = sc;
    svg.innerHTML = "<g id='rdMapLines'></g><g id='rdSF'></g><g id='rdCorn' class='rd-corn'></g><circle id='rdDot' r='" + 6 * sc + "' fill='" + COL.straight + "' stroke='#fff' stroke-width='" + 2 * sc + "'/>";
    renderTower(); renderAnalysis();
  }

  function drawMap() {
    var q = decode(S.laps[S.sel], S.data.u), sc = +$("rdMap").dataset.sc, out = "", i, start = 0;
    var pts = function (a, b) { var s = []; for (var k = a; k <= b; k++) s.push(q.x[k].toFixed(1) + "," + q.y[k].toFixed(1)); return s.join(" "); };
    var all = pts(0, q.n - 1);
    out += "<polyline points='" + all + " " + q.x[0].toFixed(1) + "," + q.y[0].toFixed(1) + "' fill='none' stroke='#1b2030' stroke-width='" + 15 * sc + "' stroke-linecap='round' stroke-linejoin='round'/>";
    for (i = 1; i <= q.n; i++) {
      if (i === q.n || q.type[i] !== q.type[start]) {
        var e = Math.min(i, q.n - 1), c = [COL.straight, COL.bend, COL.brake][q.type[start]];
        out += "<polyline points='" + pts(start, e) + "' fill='none' stroke='" + c + "' stroke-width='" + 4.2 * sc + "' stroke-linecap='round' stroke-linejoin='round' style='filter:drop-shadow(0 0 " + 3 * sc + "px " + c + ")'/>";
        start = i;
      }
    }
    $("rdMapLines").innerHTML = out;
    var cx = 0, cy = 0; for (i = 0; i < q.n; i++) { cx += q.x[i]; cy += q.y[i]; } cx /= q.n; cy /= q.n;
    $("rdCorn").innerHTML = (S.corners || []).map(function (cr, k) {
      var px = q.x[cr.c], py = q.y[cr.c], dx = px - cx, dy = py - cy, L2 = Math.hypot(dx, dy) || 1;
      return "<text x='" + (px + dx / L2 * 17 * sc).toFixed(1) + "' y='" + (py + dy / L2 * 17 * sc + 3.5 * sc).toFixed(1) + "' font-size='" + 11 * sc + "' text-anchor='middle'>" + T.crn + (k + 1) + "</text>";
    }).join("");
    var dx = q.x[2] - q.x[0], dy = q.y[2] - q.y[0], L = Math.hypot(dx, dy) || 1, nx = -dy / L * 9 * sc, ny = dx / L * 9 * sc;
    $("rdSF").innerHTML = "<line x1='" + (q.x[0] - nx) + "' y1='" + (q.y[0] - ny) + "' x2='" + (q.x[0] + nx) + "' y2='" + (q.y[0] + ny) + "' stroke='#fff' stroke-width='" + 2.4 * sc + "'/>";
  }

  function drawSpeedChart() {
    var q = decode(S.laps[S.sel], S.data.u), b = decode(S.laps[S.cmp], S.data.u), W = 800, H = 210, ml = 34, mr = 8, mt = 10, mb = 22, n = q.n, vm = S.vmax;
    var X = function (i) { return ml + (W - ml - mr) * i / (n - 1); }, Y = function (v) { return mt + (H - mt - mb) * (1 - v / vm); };
    var line = function (a) { var s = ""; for (var i = 0; i < n; i++) s += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(a.v[i]).toFixed(1); return s; };
    var g = "", k;
    for (k = 0; k <= vm; k += 20) g += "<line x1='" + ml + "' x2='" + (W - mr) + "' y1='" + Y(k) + "' y2='" + Y(k) + "' stroke='#252a38' stroke-width='1'/><text x='" + (ml - 5) + "' y='" + (Y(k) + 3) + "' text-anchor='end'>" + k + "</text>";
    var area = line(q) + "L" + X(n - 1) + " " + Y(0) + "L" + X(0) + " " + Y(0) + "Z";
    var dm = Math.round(S.laps[S.sel].d), bands = "", bs = -1;
    for (k = 0; k <= n; k++) { var br = k < n && q.type[k] === 2; if (br && bs < 0) bs = k; if (!br && bs >= 0) { bands += "<rect x='" + X(bs) + "' y='" + mt + "' width='" + Math.max(2, X(k - 1) - X(bs)) + "' height='" + (H - mt - mb) + "' fill='" + COL.brake + "' opacity='.16'/>"; bs = -1; } }
    var secs = "", cors = "", nn = n - 1;
    [1, 2].forEach(function (m) { var xx = X(Math.round(m * nn / 3)); secs += "<line x1='" + xx + "' x2='" + xx + "' y1='" + mt + "' y2='" + (H - mb) + "' stroke='#5a6178' stroke-dasharray='2 4'/>"; });
    [0, 1, 2].forEach(function (m) { secs += "<text x='" + (X(Math.round(m * nn / 3)) + 4) + "' y='" + (mt + 9) + "' fill='#8b92a8'>S" + (m + 1) + "</text>"; });
    (S.corners || []).forEach(function (cr, k) { cors += "<text class='cl' x='" + X(cr.c) + "' y='" + (Y(q.v[cr.c]) + 14) + "' text-anchor='middle'>" + T.crn + (k + 1) + "</text>"; });
    var sl = S.laps[S.sel], bl = S.laps[S.cmp];
    $("rdSpLeg").innerHTML = "<span><i style='background:" + COL.straight + "'></i>" + esc(T.lapWord + " " + sl.n) + "</span><span><i style='background:" + COL.pur + "'></i>" + esc((S.cmp === S.best ? T.vsFast + " (" : "") + T.lapWord + " " + bl.n + (S.cmp === S.best ? ")" : "")) + "</span>";
    $("rdSpChart").innerHTML = "<defs><linearGradient id='rdAr' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + COL.bend + "' stop-opacity='.45'/><stop offset='1' stop-color='" + COL.bend + "' stop-opacity='0'/></linearGradient></defs>" + g +
      bands + "<path d='" + area + "' fill='url(#rdAr)'/>" + "<path d='" + line(b) + "' fill='none' stroke='" + COL.pur + "' stroke-width='2' opacity='.95'/>" + secs + cors +
      "<path d='" + line(q) + "' fill='none' stroke='" + COL.straight + "' stroke-width='2'/>" +
      "<line id='rdPh' y1='" + mt + "' y2='" + (H - mb) + "' stroke='#e9ecf5' stroke-width='2'/><circle id='rdPhD' r='4.5' fill='" + COL.straight + "' stroke='#fff' stroke-width='1.5'/>" +
      "<text x='" + ml + "' y='" + (H - 6) + "'>0 m</text><text x='" + (W - mr) + "' y='" + (H - 6) + "' text-anchor='end'>" + dm + " m</text>";
    $("rdSpChart").dataset.geo = [ml, W - mr, mt, H - mb, W, H].join(",");
  }

  // ---------- info chips, takeaways, track history
  function renderChips() {
    var c = S.cur, d = S.data, ch = [[T.chDate, c.date ? fmtDate(c.date) : ""], [T.chTrack, c.track], [T.chCity, c.city], [T.chCountry, c.country], [T.chLen, Math.round(d.laps[d.best].d).toLocaleString(DATEL) + " m"],
      [T.chDir, c.dir], [T.chCorners, S.corners.length ? S.corners.length + " " + T.chCornV : ""], [T.chType, c.type], [T.chKart, c.kart], [T.chEvent, c.event], [T.chCond, c.cond], [T.chTemp, c.temp], [T.chNotes, c.notes]];
    $("rdChips").innerHTML = ch.filter(function (x) { return x[1]; }).map(function (x) { return "<span><em>" + esc(x[0]) + "</em> " + esc(x[1]) + "</span>"; }).join("");
  }
  function renderTakeaways() {
    var d = S.data, laps = S.laps, cs = S.cs, out = [], k, j;
    if (S.corners.length && cs.idx.length > 1) {
      var worst = -1, wv = 0;
      S.corners.forEach(function (cr, ki) {
        var tt = cs.idx.map(function (i) { return cornerStats(laps[i], d.u, cr).time; }), mn = Math.min.apply(null, tt), av = tt.reduce(function (a, x) { return a + (x - mn); }, 0) / tt.length;
        if (av > wv) { wv = av; worst = ki; }
      });
      if (worst >= 0) out.push([T.tk1, T.tk1v.replace("{c}", T.crn + (worst + 1)).replace("{x}", wv.toFixed(2)), T.tk1s]);
    }
    if (cs.idx.length > 2) {
      var best = 0, bs = 1e9;
      for (k = 0; k < 3; k++) { var xs = cs.sec.map(function (r) { return r[k]; }), m = xs.reduce(function (a, x) { return a + x; }, 0) / xs.length, sd = Math.sqrt(xs.reduce(function (a, x) { return a + (x - m) * (x - m); }, 0) / xs.length); if (sd < bs) { bs = sd; best = k; } }
      out.push([T.tk2, "S" + (best + 1), T.tk2s.replace("{x}", bs.toFixed(2))]);
      var bi = -1, br = 1e9;
      for (j = 0; j + 2 < cs.idx.length; j++) {
        if (cs.idx[j + 2] !== cs.idx[j] + 2) continue;
        var w3 = [0, 1, 2].map(function (o) { return laps[cs.idx[j + o]].t; }), r2 = Math.max.apply(null, w3) - Math.min.apply(null, w3);
        if (r2 < br) { br = r2; bi = j; }
      }
      if (bi >= 0) out.push([T.tk3, T.tk3v.replace("{a}", laps[cs.idx[bi]].n).replace("{b}", laps[cs.idx[bi + 2]].n).replace("{x}", br.toFixed(2)), T.tk3s]);
    }
    $("rdTkT").hidden = $("rdTk").hidden = !out.length;
    $("rdTk").innerHTML = out.map(function (x) { return "<div class='rd-card'><span class='k'>" + esc(x[0]) + "</span><b>" + esc(x[1]) + "</b><p>" + esc(x[2]) + "</p></div>"; }).join("");
  }
  function renderHistory() {
    var c = S.cur, key = (c.track || "").toLowerCase(), v = S.list.filter(function (x) { return x.fastest && (x.track || "").toLowerCase() === key; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!key || !v.length) { $("rdHiT").hidden = $("rdHi").hidden = true; return; }
    $("rdHiT").hidden = $("rdHi").hidden = false;
    var pb = v.reduce(function (a, x) { return x.fastest < a.fastest ? x : a; }, v[0]), mine = c.fastest, txt;
    if (v.length === 1) txt = T.hiFirst; else if (pb.id === c.id) txt = T.hiNew; else txt = T.hiVs.replace("{x}", "+" + (mine - pb.fastest).toFixed(3));
    $("rdHi").innerHTML = "<div><span class='k'>" + esc((c.track || "") + " · " + T.hiPb) + "</span><p><b class='gd'>" + fmtT(pb.fastest) + "</b> (" + esc(fmtDate(pb.date)) + ") · " + esc(txt) + "</p></div><ol>" +
      v.map(function (x) { return "<li class='" + (x.id === c.id ? "on" : "") + (x.id === pb.id ? " pb" : "") + "'><i></i><span>" + esc(new Date(x.date + "T12:00:00").toLocaleDateString(DATEL, { month: "short", year: "numeric" })) + "</span><b>" + fmtT(x.fastest) + "</b></li>"; }).join("") + "<li class='nx'><i></i><span>" + esc(T.hiNext) + "</span></li></ol>";
  }

  // ---------- delta chart (selected lap minus compare lap)
  function drawDelta() {
    var q = decode(S.laps[S.sel], S.data.u), c = decode(S.laps[S.cmp], S.data.u), n = q.n, W = 800, H = 130, ml = 34, mr = 8, mt = 10, mb = 22, i, m = 0, dl = [];
    for (i = 0; i < n; i++) { dl[i] = (q.t[i] - q.t[0]) - (c.t[i] - c.t[0]); m = Math.max(m, Math.abs(dl[i])); }
    var r = Math.max(.5, Math.ceil(m * 2) / 2), X = function (k) { return ml + (W - ml - mr) * k / (n - 1); }, Y = function (v) { return mt + (H - mt - mb) * (1 - (v + r) / (2 * r)); }, g = "", p = "";
    [-r, -r / 2, 0, r / 2, r].forEach(function (v) { g += "<line x1='" + ml + "' x2='" + (W - mr) + "' y1='" + Y(v) + "' y2='" + Y(v) + "' stroke='#252a38'/><text x='" + (ml - 5) + "' y='" + (Y(v) + 3) + "' text-anchor='end'>" + (v > 0 ? "+" : "") + v.toFixed(2) + "</text>"; });
    for (i = 0; i < n; i++) p += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(dl[i]).toFixed(1);
    $("rdDeChart").innerHTML = g + "<path d='" + p + "' fill='none' stroke='#3ddc84' stroke-width='2'/><line id='rdDePh' y1='" + mt + "' y2='" + (H - mb) + "' stroke='#e9ecf5' stroke-width='2'/><text x='" + ml + "' y='" + (H - 6) + "'>0 m</text><text x='" + (W - mr) + "' y='" + (H - 6) + "' text-anchor='end'>" + Math.round(S.laps[S.sel].d) + " m</text>";
    $("rdDeChart").dataset.geo = [ml, W - mr, mt, H - mb, W, H].join(",");
  }

  // ---------- sector, corner, trend and grip analysis
  function renderAnalysis() {
    var d = S.data, laps = S.laps, best = laps[S.best].t, cs = S.cs, mins = cs.mins, i, k;
    var th = "<tr><th>" + esc(T.lp) + "</th><th>S1</th><th>S2</th><th>S3</th><th>" + esc(T.tm) + "</th></tr>";
    var body = cs.idx.map(function (li, r) {
      return "<tr class='" + (li === S.sel ? "on" : "") + "' data-i='" + li + "'><td>" + esc(T.lapWord + " " + laps[li].n) + "</td>" + cs.sec[r].map(function (x, k2) { return "<td class='" + (Math.abs(x - mins[k2]) < 1e-6 ? "pu" : "") + "'>" + x.toFixed(3) + "</td>"; }).join("") + "<td class='" + (li === S.best ? "gd" : "") + "'>" + fmtT(laps[li].t) + "</td></tr>";
    }).join("");
    $("rdSec").innerHTML = th + body + "<tr class='sum'><td>" + esc(T.theo) + "</td><td class='pu'>" + mins[0].toFixed(3) + "</td><td class='pu'>" + mins[1].toFixed(3) + "</td><td class='pu'>" + mins[2].toFixed(3) + "</td><td>" + fmtT(mins[0] + mins[1] + mins[2]) + "</td></tr>";
    var cr = S.corners || [], sel = laps[S.sel], bl = laps[S.best], pk = 0, bq = decode(bl, d.u);
    for (i = 0; i < bq.n; i++) pk = Math.max(pk, -bq.gl[i]);
    $("rdCorSub").textContent = T.corSub + " · " + T.peakBr + " " + pk.toFixed(2) + " G";
    var ch = "<tr><th>" + esc(T.cor) + "</th><th>" + esc(T.entry) + "</th><th>" + esc(T.minv) + "</th><th>" + esc(T.exit) + "</th><th>" + esc(T.plat) + "</th><th>" + esc(T.gap) + "</th></tr>";
    var maxLat = 0, stats = cr.map(function (c2) { var a = cornerStats(sel, d.u, c2), b = cornerStats(bl, d.u, c2); maxLat = Math.max(maxLat, a.lat); return [a, b]; });
    $("rdCor").innerHTML = ch + stats.map(function (st, k2) {
      var a = st[0], g = a.time - st[1].time;
      return "<tr><td>" + T.crn + (k2 + 1) + "</td><td>" + a.entry.toFixed(1) + "</td><td>" + a.min.toFixed(1) + "</td><td>" + a.exit.toFixed(1) + "</td><td class='" + (a.lat === maxLat ? "gd" : "") + "'>" + a.lat.toFixed(2) + "</td><td class='" + (g > 0.004 ? "sl" : "fa") + "'>" + (g >= 0 ? "+" : "") + g.toFixed(2) + "</td></tr>";
    }).join("");
    $("rdCor").parentNode.hidden = !cr.length;
    drawTrend(); drawGG();
  }
  function drawTrend() {
    var laps = S.laps, cs = S.cs, W = 560, H = 250, ml = 56, mr = 14, mt = 14, mb = 26, ts = cs.idx.map(function (i) { return laps[i].t; });
    if (ts.length < 2) { $("rdTrend").innerHTML = ""; return; }
    var lo = Math.min.apply(null, ts), hi = Math.max.apply(null, ts), pad = Math.max(.1, (hi - lo) * .15); lo -= pad; hi += pad;
    var X = function (k) { return ml + (W - ml - mr) * k / (ts.length - 1); }, Y = function (v) { return mt + (H - mt - mb) * (1 - (v - lo) / (hi - lo)); }, g = "", k;
    for (k = 0; k < 4; k++) { var v = lo + (hi - lo) * k / 3; g += "<line x1='" + ml + "' x2='" + (W - mr) + "' y1='" + Y(v) + "' y2='" + Y(v) + "' stroke='#252a38'/><text x='" + (ml - 6) + "' y='" + (Y(v) + 3) + "' text-anchor='end'>" + fmtT(v) + "</text>"; }
    var avg = ts.reduce(function (a, x) { return a + x; }, 0) / ts.length, pts = ts.map(function (t, k2) { return X(k2).toFixed(1) + "," + Y(t).toFixed(1); }).join(" ");
    var step = ts.length > 14 ? 2 : 1, dots = "";
    cs.idx.forEach(function (li, k2) {
      var on = li === S.sel, isb = li === S.best;
      dots += "<circle cx='" + X(k2) + "' cy='" + Y(ts[k2]) + "' r='" + (isb ? 6 : 4) + "' fill='" + (isb ? COL.best : COL.bend) + "'" + (on ? " stroke='#fff' stroke-width='2'" : "") + "/>";
      if (k2 % step === 0) dots += "<text x='" + X(k2) + "' y='" + (H - 8) + "' text-anchor='middle'>L" + laps[li].n + "</text>";
    });
    $("rdTrend").innerHTML = g + "<line x1='" + ml + "' x2='" + (W - mr) + "' y1='" + Y(avg) + "' y2='" + Y(avg) + "' stroke='#8b92a8' stroke-dasharray='4 4'/><text x='" + (W - mr) + "' y='" + (Y(avg) - 5) + "' text-anchor='end'>" + T.avgS + " " + fmtT(avg) + "</text><polyline points='" + pts + "' fill='none' stroke='" + COL.bend + "' stroke-width='2'/>" + dots;
  }
  function drawGG() {
    var q = decode(S.laps[S.sel], S.data.u), cx = 170, cy = 145, s = 115 / 1.4, i, pl = 0, pb = 0, tv = 0, g = "", pts = "";
    [-1.4, -1, -.5, 0, .5, 1, 1.4].forEach(function (v) { g += "<text x='" + (cx + v * s) + "' y='" + (cy + 1.4 * s + 16) + "' text-anchor='middle'>" + v.toFixed(1) + "</text><text x='" + (cx - 1.4 * s - 8) + "' y='" + (cy - v * s + 3) + "' text-anchor='end'>" + v.toFixed(1) + "</text>"; });
    for (i = 0; i < q.n; i++) { pl = Math.max(pl, Math.abs(q.gt[i])); pb = Math.max(pb, -q.gl[i]); tv = Math.max(tv, q.v[i]); pts += "<circle cx='" + (cx + q.gt[i] * s).toFixed(1) + "' cy='" + (cy - q.gl[i] * s).toFixed(1) + "' r='2.3' fill='#6f8dff' opacity='.6'/>"; }
    $("rdGG").innerHTML = "<line x1='" + (cx - 1.4 * s) + "' x2='" + (cx + 1.4 * s) + "' y1='" + cy + "' y2='" + cy + "' stroke='#2c3141'/><line y1='" + (cy - 1.4 * s) + "' y2='" + (cy + 1.4 * s) + "' x1='" + cx + "' x2='" + cx + "' stroke='#2c3141'/><circle cx='" + cx + "' cy='" + cy + "' r='" + s + "' fill='none' stroke='#2c3141'/><circle cx='" + cx + "' cy='" + cy + "' r='" + pl * s + "' fill='none' stroke='" + COL.best + "' stroke-dasharray='3 4' opacity='.8'/>" + g + pts +
      "<text x='" + cx + "' y='" + (cy + 1.4 * s + 32) + "' text-anchor='middle'>" + esc(T.gLatAx) + "</text><text transform='translate(10 " + cy + ") rotate(-90)' text-anchor='middle'>" + esc(T.gLonAx) + "</text>";
    $("rdGGT").textContent = T.ggT + " · " + T.lapWord + " " + S.laps[S.sel].n;
    $("rdGGS").innerHTML = [[T.pLat, pl.toFixed(2) + " G", 1], [T.pBrk, pb.toFixed(2) + " G", 0], [T.top, Math.round(tv) + " " + T.km, 0]].map(function (x) { return "<div><span class='k'>" + esc(x[0]) + "</span><b" + (x[2] ? " class='gd'" : "") + ">" + x[1] + "</b></div>"; }).join("");
  }

  // timing tower: every lap with its time, the gap to the fastest lap and a bar; click a lap to ride along
  function renderTower() {
    var laps = S.laps, best = laps[S.best].t, order = laps.map(function (l, i) { return i; });
    if (S.sort === "time") order.sort(function (a, b) { return laps[a].t - laps[b].t; });
    var span = Math.max.apply(null, laps.filter(function (l) { return l.t <= best * 1.08; }).map(function (l) { return l.t - best; }).concat(.3));
    $("rdTower").innerHTML = order.map(function (i) {
      var l = laps[i], d = l.t - best, slow = l.t > best * 1.08, w = slow ? 0 : Math.max(5, 100 - d / span * 92);
      return "<button type='button' class='tw" + (i === S.best ? " best" : "") + (i === S.sel ? " on" : "") + (slow ? " slow" : "") + "' data-i='" + i + "'" + (slow ? " title='" + esc(T.slow) + "'" : "") + "><span class='n'>" + l.n + "</span><span class='t'>" + fmtT(l.t) + "</span><span class='dl'>" + (i === S.best ? "" : "+" + d.toFixed(3)) + "</span><i style='width:" + w + "%'></i></button>";
    }).join("");
    document.querySelectorAll("[data-sort]").forEach(function (b) { b.classList.toggle("on", b.dataset.sort === S.sort); });
  }
  function towerSelect() {
    var c = $("rdTower"), rows = c.querySelectorAll(".tw"), row = null;
    rows.forEach(function (b) { var on = +b.dataset.i === S.sel; b.classList.toggle("on", on); if (on) row = b; });
    if (row && (row.offsetTop < c.scrollTop || row.offsetTop + row.offsetHeight > c.scrollTop + c.clientHeight)) c.scrollTop = row.offsetTop - c.clientHeight / 2;
  }

  // ---------- selection / playback
  function setLap(i, keepPlay) {
    S.sel = Math.max(0, Math.min(S.laps.length - 1, i)); S.tc = 0;
    var l = S.laps[S.sel], best = S.laps[S.best].t;
    $("rdLapNo").textContent = T.lapWord + " " + l.n;
    $("rdBadge").textContent = S.sel === S.best ? T.fastBadge : "+" + (l.t - best).toFixed(3) + " s · " + fmtT(l.t);
    $("rdBadge").className = "rd-badge" + (S.sel === S.best ? " gd" : "");
    $("rdSlider").max = l.t.toFixed(3);
    $("rdVsT").textContent = S.cmp === S.best ? T.vs : T.vsLap + " " + S.laps[S.cmp].n;
    drawMap(); drawSpeedChart(); drawDelta();
    towerSelect(); renderAnalysis();
    update();
    if (!keepPlay) return;
  }

  function at(q, tc) { // index and fraction for a time within the lap
    var lo = 0, hi = q.n - 1; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (q.t[mid] <= tc) lo = mid; else hi = mid; }
    var f = (tc - q.t[lo]) / Math.max(q.t[hi] - q.t[lo], 1e-6); return [lo, Math.max(0, Math.min(1, f))];
  }

  function update() {
    if (!S.data) return;
    var q = decode(S.laps[S.sel], S.data.u), b = decode(S.laps[S.cmp], S.data.u), a = at(q, S.tc), i = a[0], f = a[1], j = Math.min(i + 1, q.n - 1);
    var L = function (arr) { return arr[i] + (arr[j] - arr[i]) * f; };
    var x = L(q.x), y = L(q.y), v = L(q.v), gt = L(q.gt), gl = L(q.gl), idx = i + f;
    var dot = $("rdDot"); dot.setAttribute("cx", x.toFixed(1)); dot.setAttribute("cy", y.toFixed(1));
    dot.setAttribute("fill", "#fff");
    $("rdSlider").value = S.tc.toFixed(3);
    $("rdTime").textContent = S.tc.toFixed(3) + " / " + S.laps[S.sel].t.toFixed(3);
    $("rdV").textContent = Math.round(v);
    $("rdArc").style.strokeDashoffset = (188.5 * (1 - Math.min(1, v / S.vmax))).toFixed(1);
    var bi = Math.round(idx), delta = q.t[Math.round(idx)] - b.t[bi]; // time difference at the same point of the lap
    $("rdDelta").textContent = (delta >= 0 ? "+" : "") + delta.toFixed(2);
    $("rdDelta").className = delta > 0.005 ? "slow" : delta < -0.005 ? "fast" : "";
    var gc = 0, gx = 50 + gt / 1.2 * 42, gy = 50 - gl / 1.2 * 42; // dial: 1.2 G at the edge
    $("rdGdot").setAttribute("cx", Math.max(8, Math.min(92, gx)).toFixed(1)); $("rdGdot").setAttribute("cy", Math.max(8, Math.min(92, gy)).toFixed(1));
    $("rdGlat").textContent = Math.abs(gt).toFixed(1); $("rdGlon").textContent = Math.abs(gl).toFixed(1);
    var geo = $("rdSpChart").dataset.geo; if (geo) {
      geo = geo.split(",").map(Number); var px = geo[0] + (geo[1] - geo[0]) * idx / (q.n - 1), vm = S.vmax, py = geo[2] + (geo[3] - geo[2]) * (1 - v / vm);
      var dg = $("rdDeChart").dataset.geo, dp = $("rdDePh"); if (dg && dp) { dg = dg.split(",").map(Number); var dx2 = dg[0] + (dg[1] - dg[0]) * idx / (q.n - 1); dp.setAttribute("x1", dx2); dp.setAttribute("x2", dx2); }
      var ph = $("rdPh"); if (ph) { ph.setAttribute("x1", px); ph.setAttribute("x2", px); $("rdPhD").setAttribute("cx", px); $("rdPhD").setAttribute("cy", py); }
    }
  }

  function tick(ts) {
    if (!S.playing) { raf = 0; return; }
    if (!S.data) { raf = requestAnimationFrame(tick); return; }
    var dt = Math.min((ts - lastTs) / 1000, .1); lastTs = ts;
    S.tc += dt * S.rate; if (S.tc >= S.laps[S.sel].t) S.tc = 0;
    update(); raf = requestAnimationFrame(tick);
  }
  function play(on) {
    S.playing = on; $("rdPlay").textContent = on ? "❚❚" : "▶"; $("rdPlay").setAttribute("aria-label", on ? T.pause : T.play);
    if (on && !raf) { lastTs = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function thumb(o) {
    if (!o || o.length < 6) return "<svg class='th' viewBox='0 0 100 100'></svg>";
    var p = []; for (var i = 0; i < o.length; i += 2) p.push((o[i] / 10).toFixed(1) + "," + (o[i + 1] / 10).toFixed(1));
    return "<svg class='th' viewBox='0 0 100 100' aria-hidden='true'><polyline points='" + p.join(" ") + " " + p[0] + "' fill='none' stroke='currentColor' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/></svg>";
  }
  function renderCards() {
    $("rdCards").innerHTML = S.list.map(function (s) {
      return "<button type='button' class='rd-row" + (S.cur && s.id === S.cur.id ? " on" : "") + "' data-id='" + esc(s.id) + "'>" + thumb(s.o) +
        "<span class='who'><em>" + esc(fmtDate(s.date)) + (s.track ? " · " + esc(s.track) : "") + "</em><h3>" + esc(s.title) + "</h3></span>" +
        "<span class='stats'><span class='c'><small>" + esc(T.fl) + "</small><b class='gd'>" + (s.fastest ? fmtT(s.fastest) : "–") + "</b></span>" +
        "<span class='c'><small>" + esc(T.count) + "</small><b>" + (s.laps || "–") + "</b></span>" +
        "<span class='c'><small>" + esc(T.top) + "</small><b>" + (s.top ? s.top + " <i>" + T.km + "</i>" : "–") + "</b></span></span>" +
        "<span class='go'>" + esc(T.ride) + "</span></button>";
    }).join("");
    var on = $("rdCards").querySelector(".rd-row.on");
    if (on) $("rdCards").scrollTo({ left: on.offsetLeft - ($("rdCards").clientWidth - on.offsetWidth) / 2, behavior: "smooth" });
  }

  function pointerFrac(el, e) { var r = el.getBoundingClientRect(); return (e.clientX - r.left) / r.width; }
  function wire() {
    $("rdPlay").onclick = function () { play(!S.playing); };
    $("rdPrev").onclick = function () { setLap(S.sel - 1); }; $("rdNext").onclick = function () { setLap(S.sel + 1); };
    $("rdSlider").oninput = function () { S.tc = +this.value; update(); };
    document.querySelectorAll("[data-rate]").forEach(function (b) { b.onclick = function () { S.rate = +b.dataset.rate; document.querySelectorAll("[data-rate]").forEach(function (o) { o.classList.toggle("on", o === b); }); }; });
    var sp = $("rdSpChart"), drag = false, jump = function (e, el) { el = el || sp; if (!S.data) return; var geo = el.dataset.geo.split(",").map(Number), fx = pointerFrac(el, e) * geo[4], f = Math.max(0, Math.min(1, (fx - geo[0]) / (geo[1] - geo[0]))), q = decode(S.laps[S.sel], S.data.u); S.tc = q.t[Math.round(f * (q.n - 1))]; update(); };
    [sp, $("rdDeChart")].forEach(function (el) {
      el.addEventListener("pointerdown", function (e) { drag = true; el.setPointerCapture(e.pointerId); jump(e, el); });
      el.addEventListener("pointermove", function (e) { if (drag) jump(e, el); }); el.addEventListener("pointerup", function () { drag = false; });
    });
    $("rdCmp").onchange = function () { S.cmp = +this.value; if (S.data) { drawSpeedChart(); drawDelta(); setLap(S.sel); } };
    $("rdTower").addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b) setLap(+b.dataset.i); });
    $("rdSec").addEventListener("click", function (e) { var r = e.target.closest("tr[data-i]"); if (r) setLap(+r.dataset.i); });
    document.querySelectorAll("[data-sort]").forEach(function (b) { b.onclick = function () { S.sort = b.dataset.sort; if (S.data) { renderTower(); towerSelect(); } }; });
    $("rdCards").addEventListener("click", function (e) { var b = e.target.closest("[data-id]"); if (b) selectSession(b.dataset.id, true); });
    document.querySelectorAll("[data-cscroll]").forEach(function (b) { b.onclick = function () { var t = $("rdCards"); t.scrollBy({ left: +b.dataset.cscroll * Math.max(260, t.clientWidth * .8), behavior: "smooth" }); }; });
    $("rdTop").onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); };
    document.addEventListener("visibilitychange", function () { if (!document.hidden && S.playing && !raf) { lastTs = performance.now(); raf = requestAnimationFrame(tick); } });
    document.addEventListener("keydown", function (e) { if (e.key === " " && e.target === document.body) { e.preventDefault(); play(!S.playing); } if (S.data && e.target === document.body) { if (e.key === "ArrowLeft") setLap(S.sel - 1); if (e.key === "ArrowRight") setLap(S.sel + 1); } });
  }

  function labels() {
    var m = { rdH1: T.title, rdIntro: T.intro, rdLeg1: T.straight, rdLeg2: T.bend, rdLeg3: T.brake, rdSpeedT: T.speed, rdVsT: T.vs, rdGT: T.g, rdGLatT: T.lat, rdGLonT: T.lon, rdVidT: T.onboard, rdSpChartT: T.spChart, rdTowerT: T.lapChart, rdSortLap: T.sortLap, rdSortFast: T.sortFast, rdNote: T.note, rdAnT: T.an, rdCmpT: T.cmpT, rdDeT: T.deT, rdTrT: T.trT, rdTrLeg: T.trLeg, rdTkT: T.tkT, rdHiT: T.hiT, rdSecT: T.sec, rdSecN: T.secN, rdCorT: T.cor, rdCorN: T.corN, rdAllT: T.all, rdTop: T.toTop, rdKm: T.km };
    Object.keys(m).forEach(function (k) { if ($(k)) $(k).textContent = m[k]; });
    $("rdPrev").setAttribute("aria-label", T.prev); $("rdNext").setAttribute("aria-label", T.next);
  }
  function init() {
    labels(); wire(); play(!matchMedia("(prefers-reduced-motion: reduce)").matches);
    $("rdDash").classList.add("loading");
    loadList().then(function (list) {
      if (!list.length) { $("rdDash").hidden = true; $("rdAll").hidden = true; $("rdEmpty").hidden = false; $("rdEmpty").textContent = T.empty; renderHero(); return; }
      S.latestId = list[0].id; renderHero(); renderCards();
      selectSession(list[0].id, false);
    }).catch(function () { $("rdDash").classList.remove("loading"); $("rdEmpty").hidden = false; $("rdEmpty").textContent = T.err; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
