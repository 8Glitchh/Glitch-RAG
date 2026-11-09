# Adding to Glitch RAG as you study

The app is split in two:

- **`index.html`** is the app. You don't need to touch it.
- **`content/`** is the course: one file per module (`m1.js` … `m5.js`). This is what you edit.

Module 1 is fully written. Modules 2 to 5 are **outlines**: each chapter has a title and a one-line description, and the app shows it as “not added yet”. Fill them in as you reach them.

## The fastest way: ask Claude

When you finish a lab or assignment, send Claude the notebook with this message:

> Write a Glitch RAG chapter for this notebook, in the exact format of `content/TEMPLATE.js`. It replaces the outline chapter `m2-keyword` in `content/m2.js` (keep that id). Include 5–7 lesson cards, 6 fill-ins, 5 output questions, 2 ordering puzzles, 3 debug questions, 4 pick-the-tool questions and 7 true/false statements. Use simple language, use the notebook's own code and function names, and run every output question to make sure the answer is exact.

Paste the result over the outline chapter, run the check (below), and push.

## Doing it yourself

1. Open the module file, e.g. `content/m2.js`.
2. Open `content/TEMPLATE.js` and copy the chapter between **COPY FROM HERE** and **TO HERE**.
3. Paste it over the outline chapter you're filling in. Keep the outline's `id`.
4. Change the text. Every field is explained in the template.

You can also rename, add or delete chapters in a module. To add a whole new module (say, a second course), copy `m5.js` to `m6.js`, change its `id`, `n` and `name`, and add one line to `index.html` next to the others:

```html
<script src="content/m6.js" data-content></script>
```

## Checking your work

Either of these shows every mistake, with the file, chapter and line:

- **In a terminal**, in the project folder: `node check.js`
- **In a browser**: double-click `index.html`. If anything is wrong, a yellow bar appears at the top; tap it for the list.

Broken questions are skipped, not shown broken, so one typo never takes down the whole app.

## Publishing

```bash
node check.js
git add content
git commit -m "Add Module 2 keyword search chapter"
git push
```

GitHub Pages updates about a minute later. The app on your phone notices the change by itself and shows **“A new version is ready”**. No version numbers to bump.

## The mistakes everyone makes

| Mistake | What happens | Fix |
|---|---|---|
| Missing comma between two `{ ... }` items | The whole module file stops loading | `node check.js` shows the line |
| `${` inside a `` py`...` `` code block | JavaScript tries to run it | Python f-strings only need `{ }`; drop the `$` |
| A backtick `` ` `` inside a code block | Ends the code block early | Avoid backticks in Python code |
| `a: 'true'` in a true/false question | Question is skipped | `a: true`, no quotes |
| `a:` in output/tools counted from 1 | Wrong answer marked right | Counts from **0**: first option is `a: 0` |
| `line:` in debug counted from 0 | Wrong line highlighted | Counts from **1**: first line is `line: 1` |
| Changing a chapter's `id` | Progress for that chapter is lost | Pick the id once, then leave it |
| Guessing an output answer | The app teaches something wrong | Run the code and paste the real output |

## What each question type needs

| Type | Fields | Notes |
|---|---|---|
| `learn` | `h`, `p` and/or `code`, optional `out`, `tip` | One idea per card |
| `fill` | `code` with `{?}`, `a: ['answer']`, `why` | Several accepted answers allowed; quotes `'` and `"` count as the same |
| `output` | `code`, `o: [options]`, `a: index`, `why` | Optional `q:` replaces “What does this print?” |
| `order` | `task`, `lines: [in order]`, optional `alts` | `alts: [[1, 0, 2]]` = another valid order |
| `debug` | `task`, `code`, `line`, `fix`, `why` | `line: [2, 3]` if either line counts |
| `tools` | `q`, `o`, `a`, `why`, optional `prose: true` | `prose` for options that are sentences |
| `tf` | `s`, `a: true/false`, `why` | Also feeds Rapid fire |

`why` is the explanation shown after answering. It's the part you actually learn from, so make it say *why*, not just repeat the answer.
