#!/usr/bin/env node
/* Checks the course content for typos and missing fields before you push.
   Run it from the project folder:   node check.js
   It loads the same files as the app (the <script ... data-content> lines in index.html)
   and uses the same checker, so if this says OK, the app will too. */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*\bdata-content\b[^>]*>/g)].map(m => m[1]);

const ctx = vm.createContext({ console });
const load = f => {
  ctx.__currentFile = f;
  new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }).runInContext(ctx);
};
load('content/_setup.js');

for (const f of files) {
  if (!fs.existsSync(path.join(root, f))) {
    ctx.CONTENT_ERRORS.push({ level: 'error', where: f, msg: 'index.html loads this file, but it does not exist.' });
    continue;
  }
  try { load(f); }
  catch (e) {
    const at = String(e.stack || '').match(new RegExp(f.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + ':(\\d+)'));
    ctx.CONTENT_ERRORS.push({ level: 'error', where: f + (at ? ' line ' + at[1] : ''), msg: e.message + ctx.contentHint(e.message) });
  }
}
ctx.prepareContent(files);

const TYPES = ['fill', 'output', 'order', 'debug', 'tools', 'tf'];
console.log('');
for (const f of files) {
  const mods = ctx.TRACKS.filter(m => m._file === f);
  if (!mods.length) { console.log(`  ✗ ${f}`); continue; }
  for (const m of mods) {
    const written = m.chapters.filter(c => c.learn.length || TYPES.some(t => c[t].length));
    const qs = m.chapters.reduce((s, c) => s + TYPES.reduce((n, t) => n + c[t].length, 0), 0);
    const outline = m.chapters.length - written.length;
    console.log(`  ✓ ${f.padEnd(16)} ${m.n} ${m.name}: ${written.length} chapter${written.length === 1 ? '' : 's'} written, ${qs} questions${outline ? `, ${outline} outline${outline === 1 ? '' : 's'}` : ''}`);
  }
}

const errors = ctx.CONTENT_ERRORS.filter(x => x.level === 'error');
const warns = ctx.CONTENT_ERRORS.filter(x => x.level !== 'error');
console.log('');
for (const x of ctx.CONTENT_ERRORS) {
  console.log(`  ${x.level === 'error' ? 'ERROR  ' : 'warning'}  ${x.where}`);
  console.log(`           ${x.msg.replace(/`/g, '')}`);
}
if (!ctx.CONTENT_ERRORS.length) console.log('  All good. Push it.');
else console.log(`\n  ${errors.length} error${errors.length === 1 ? '' : 's'}, ${warns.length} warning${warns.length === 1 ? '' : 's'}.${errors.length ? ' Broken questions are skipped in the app until you fix them.' : ''}`);
console.log('');
process.exit(errors.length ? 1 : 0);
