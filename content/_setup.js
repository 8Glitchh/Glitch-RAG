/* Glitch RAG: content setup. You don't need to edit this file.

   It runs before the content files (m1.js, m2.js, ...) and gives them two things:
     py`...`        write Python code inside the content, indented however you like
     addModule({}) register a module with its chapters

   It also has the checker. Both the app and `node check.js` use it to find typos
   and missing fields, skip anything broken, and say exactly where the problem is. */

// Code snippets are written indented inside the content files; this strips that indent.
function dedent(t) {
  var lines = t.replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
  var ind = Math.min.apply(null, lines.filter(function (l) { return l.trim(); }).map(function (l) { return l.match(/^ */)[0].length; }));
  return lines.map(function (l) { return l.slice(ind); }).join('\n');
}
function py(s) { return dedent(String.raw.apply(String, arguments)); }

var TRACKS = [];          // the modules, in order
var CONTENT_ERRORS = [];  // { level: 'error' | 'warn', where, msg }

function addModule(m) {
  var file = (typeof document !== 'undefined' && document.currentScript && document.currentScript.getAttribute('src'))
    || (typeof __currentFile !== 'undefined' ? __currentFile : 'content');
  if (m && typeof m === 'object') m._file = file;
  TRACKS.push(m);
}

// Plain-English hints for the JavaScript errors a typo in a content file causes.
function contentHint(msg) {
  msg = String(msg || '');
  if (/Unexpected end of input/.test(msg)) return ' (a bracket, brace or quote was opened and never closed)';
  if (/Unexpected (identifier|token|string|number)|missing \) after|Invalid or unexpected token/.test(msg)) return ' (usually a missing comma between two items, or a quote that was never closed, on this line or the one before)';
  if (/is not defined/.test(msg)) return ' (inside a code block, JavaScript reads ${...} as its own code. Write {...} without the $)';
  return '';
}

// Syntax errors in content files, as the browser reports them.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('error', function (e) {
    if (!e.filename || !/\/content\/[^/]+\.js/.test(e.filename)) return;
    var file = e.filename.replace(/^.*\/(content\/[^/?#]+).*$/, '$1');
    CONTENT_ERRORS.push({ level: 'error', where: file + (e.lineno ? ' line ' + e.lineno : ''), msg: e.message + contentHint(e.message) });
  });
}

// Checks every module, chapter and question. Broken ones are removed (and listed); the rest is cleaned up.
function prepareContent(expectedFiles) {
  var add = function (level, where, msg) { CONTENT_ERRORS.push({ level: level, where: where, msg: msg }); };
  var str = function (x) { return typeof x === 'string' && x.trim() !== ''; };
  var idx = function (a, list) { return typeof a === 'number' && a % 1 === 0 && a >= 0 && a < list.length; };
  var opts = function (o) { return Array.isArray(o) && o.length >= 2 && o.every(function (x) { return typeof x === 'string'; }); };

  (expectedFiles || []).forEach(function (f) {
    var loaded = TRACKS.some(function (m) { return m && m._file === f; });
    var crashed = CONTENT_ERRORS.some(function (x) { return x.where.indexOf(f) === 0; });
    if (!loaded && !crashed) add('error', f, "This file didn't load, so its module is missing. Usually it's a typo: a missing comma, bracket or quote. Run `node check.js` to see the exact line.");
  });

  var CHECK = {
    fill: function (it) {
      if (!str(it.code) || it.code.indexOf('{?}') < 0) return 'code needs `{?}` where the blank goes';
      if (!Array.isArray(it.a) || !it.a.length || !it.a.every(str)) return 'a must be a list of accepted answers, like a: ["shape"]';
    },
    output: function (it) {
      if (!str(it.code)) return 'code is missing';
      if (!opts(it.o)) return 'o must be a list of at least 2 options (strings)';
      if (!idx(it.a, it.o)) return 'a must be the position of the right option in o, counting from 0 (o has ' + it.o.length + ' options, so 0 to ' + (it.o.length - 1) + ')';
    },
    order: function (it) {
      if (!str(it.task)) return 'task is missing';
      if (!Array.isArray(it.lines) || it.lines.length < 2 || !it.lines.every(function (l) { return typeof l === 'string'; })) return 'lines must be a list of at least 2 lines, in the right order';
      if (it.alts != null && !(Array.isArray(it.alts) && it.alts.every(function (o) {
        return Array.isArray(o) && o.length === it.lines.length && o.slice().sort(function (a, b) { return a - b; }).every(function (v, k) { return v === k; });
      }))) return 'each entry in alts must list every line number exactly once, counting from 0';
    },
    debug: function (it) {
      if (!str(it.task)) return 'task is missing';
      if (!str(it.code)) return 'code is missing';
      var n = it.code.split('\n').length, ls = [].concat(it.line);
      if (!ls.length || !ls.every(function (x) { return typeof x === 'number' && x % 1 === 0 && x >= 1 && x <= n; })) return "line must be the bug's line number, counting from 1 (this code has " + n + ' lines)';
      if (typeof it.fix !== 'string') return 'fix (the corrected line) is missing';
    },
    tools: function (it) {
      if (!str(it.q)) return 'q (the question) is missing';
      if (!opts(it.o)) return 'o must be a list of at least 2 options (strings)';
      if (!idx(it.a, it.o)) return 'a must be the position of the right option in o, counting from 0 (o has ' + it.o.length + ' options, so 0 to ' + (it.o.length - 1) + ')';
    },
    tf: function (it) {
      if (!str(it.s)) return 's (the statement) is missing';
      if (it.a !== true && it.a !== false) return 'a must be true or false, without quotes';
    },
  };
  var TYPES = ['fill', 'output', 'order', 'debug', 'tools', 'tf'];
  var seenMod = {}, seenCh = {}, mods = [];

  TRACKS.forEach(function (m, mi) {
    var f = (m && m._file) || 'content';
    if (!m || typeof m !== 'object' || !str(m.id) || !str(m.name) || !Array.isArray(m.chapters)) return add('error', f, 'A module needs id, name and chapters: [ ... ]. This module was skipped.');
    if (seenMod[m.id]) return add('error', f, 'Two modules use the id "' + m.id + '". This one was skipped.');
    seenMod[m.id] = 1;
    m.n = m.n != null ? String(m.n) : String(mi + 1).padStart(2, '0');
    m.lib = m.lib || '';
    m.chapters = m.chapters.filter(function (c, ci) {
      var at = f + ' · chapter ' + (ci + 1);
      if (!c || typeof c !== 'object' || !str(c.id) || !str(c.title)) { add('error', at, 'A chapter needs an id and a title. It was skipped.'); return false; }
      at = f + ' · ' + c.title;
      if (seenCh[c.id]) { add('error', at, 'The id "' + c.id + '" is already used by another chapter. Every chapter needs its own id. It was skipped.'); return false; }
      seenCh[c.id] = 1;
      c.blurb = c.blurb || '';
      c.file = c.file || 'main.py';
      c.learn = (Array.isArray(c.learn) ? c.learn : []).filter(function (card, k) {
        if (card && str(card.h) && (str(card.p) || str(card.code))) return true;
        add('error', at + ' · learn card ' + (k + 1), 'A lesson card needs h (a heading) and p (text) or code. It was skipped.');
        return false;
      });
      TYPES.forEach(function (ty) {
        c[ty] = (Array.isArray(c[ty]) ? c[ty] : []).filter(function (it, k) {
          var w = at + ' · ' + ty + ' #' + (k + 1);
          var bad = it && typeof it === 'object' ? CHECK[ty](it) : 'this is not a { ... } question';
          if (bad) { add('error', w, bad + '. This question was skipped.'); return false; }
          if (!str(it.why) && ty !== 'order') add('warn', w, 'why (the explanation shown after answering) is missing');
          return true;
        });
      });
      return true;
    });
    if (!m.chapters.length) return add('warn', f, 'Module "' + m.name + '" has no chapters yet, so it is hidden.');
    mods.push(m);
  });

  mods.sort(function (a, b) { return a.n.localeCompare(b.n, undefined, { numeric: true }); });
  TRACKS.length = 0;
  mods.forEach(function (m) { TRACKS.push(m); });
  return TRACKS;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { dedent: dedent, py: py };
