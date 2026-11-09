# Glitch RAG

Learn Retrieval-Augmented Generation in small steps, alongside the RAG course.
Each chapter has a short lesson, then seven ways to test yourself: fill in the missing code, predict the output, put lines in order, find the bug, pick the right tool, a 60-second true/false round, and a 10-question exam.

**Spaced review** brings every question you've answered back on a schedule: tomorrow, then after 3 days, a week, two weeks and a month. Get it wrong and it starts again at one day. The number in the top bar is how many are due today.

It grows as you study. Module 1 is written; Modules 2 to 5 are outlines you fill in when you reach them. See **[ADDING.md](ADDING.md)**.

Runs entirely in the browser and works offline once installed; progress is saved on your device.

## Files

| | |
|---|---|
| `index.html` | The app |
| `content/m1.js` … `m5.js` | The course, one file per module. This is what you edit |
| `content/TEMPLATE.js` | A chapter to copy from |
| `content/_setup.js` | Loads and checks the content (no need to edit) |
| `check.js` | `node check.js` finds mistakes in the content |
| `sw.js` | Offline support |

## Run it locally

Double-click `index.html`. Everything works except offline mode, which needs a web address.

## Publish with GitHub Pages

Repository **Settings → Pages → Build and deployment**: Source *Deploy from a branch*, branch `main`, folder `/ (root)`. The app appears at `https://8glitchh.github.io/Glitch-RAG/` a minute later.

After that, every `git push` updates it. Open apps notice the change and offer the update; there's no version number to bump.
