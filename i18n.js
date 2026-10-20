/* Page text from Google Sheets (one published CSV tab per language).
   Language = <html lang>: nl, en, el. Sheet columns: key, translation.
   Elements opt in with:
     data-i18n="key"        replace the element's text
     data-i18n-first="key"  replace only the first text node (text before a child element)
     data-i18n-bold         also wrap known names (teams, series) in <b>
   The text already in the HTML is the fallback; a cached copy of the last
   successful sheet load is applied first so the page does not flash. */
(function () {
  var BASE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrQTYaoqWvwmPKYbInqhbu4hII_DbV8_bhokbmEGP2MNCJb8efUMAeSUDZZZQDEM2u_l4HOSiRgwo5/pub?single=true&output=csv&gid=";
  var SHEETS = { nl: "112123784", en: "402460765", el: "1540549123" };
  var lang = document.documentElement.lang;
  if (!SHEETS[lang]) return;
  var CACHE = "alracing-i18n-" + lang;
  var BOLD = ["Dutch Outdoor Karting Championship (DOKC)", "Dutch Racing Series - DRS", "Sodi World Series - SWS", "Den Hartog Racing", "KWM Racing", "NK Huurkarten", "FK Huurkarten"];

  function parse(text) {
    var rows = [], row = [], cell = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); cell = ""; rows.push(row); row = [];
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    var d = {};
    rows.forEach(function (r, n) {
      var k = (r[0] || "").trim();
      if (!k || (n === 0 && k.toLowerCase() === "key")) return;
      if ((r[1] || "").trim()) d[k] = r[1].trim();
    });
    return d;
  }

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function bold(s) {
    var h = esc(s);
    BOLD.forEach(function (n) { h = h.split(esc(n)).join("<b>" + esc(n) + "</b>"); });
    return h;
  }

  function meta(sel, attr, val) { var e = document.querySelector(sel); if (e) e.setAttribute(attr, val); }

  function apply(d) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = d[el.getAttribute("data-i18n")];
      if (v == null) return;
      if (el.hasAttribute("data-i18n-bold")) el.innerHTML = bold(v); else el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-first]").forEach(function (el) {
      var v = d[el.getAttribute("data-i18n-first")];
      if (v == null) return;
      var n = el.firstChild;
      if (n && n.nodeType === 3) n.nodeValue = v; else el.insertBefore(document.createTextNode(v), el.firstChild);
    });
    if (d.page_title) {
      document.title = d.page_title;
      meta('meta[property="og:title"]', "content", d.page_title);
      meta('meta[name="twitter:title"]', "content", d.page_title);
    }
    if (d.meta_description) {
      meta('meta[name="description"]', "content", d.meta_description);
      meta('meta[property="og:description"]', "content", d.meta_description);
      meta('meta[name="twitter:description"]', "content", d.meta_description);
    }
  }

  function run() {
    try { var c = localStorage.getItem(CACHE); if (c) apply(JSON.parse(c)); } catch (e) {}
    fetch(BASE + SHEETS[lang], { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (t) {
        var d = parse(t);
        if (!Object.keys(d).length) return;
        apply(d);
        try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {}
      })
      .catch(function () { /* keep the text already in the page */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
