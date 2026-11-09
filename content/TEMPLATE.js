/* ======================================================================
   CHAPTER TEMPLATE. This file isn't loaded by the app; it's here to copy from.

   To add a chapter:
     1. Open the module file (content/m2.js for Module 2, and so on).
     2. Copy everything between COPY FROM HERE and TO HERE below.
     3. Paste it inside that module's  chapters: [ ... ]  list.
        For a module's first lab, replace its placeholder chapter (e.g. m2-labs).
     4. Change the text, then check it: run  node check.js  in the project
        folder, or open index.html in a browser and look for a yellow bar.

   Rules that matter:
     - Every { ... } in a list is followed by a comma.
     - Code goes inside py`...` (backticks). Inside it, never write ${ and
       never use a backtick. Python f-strings only need { }, so that's fine.
     - Text in "double quotes": write \" for a quote inside it.
       Use `backticks` inside text to show code, and **stars** for bold.
     - a: in output/tools counts from 0 (first option = 0).
       line: in debug counts from 1 (first line of code = 1).
     - The FIRST option in o: doesn't have to be the right one; the app
       shuffles them. But a: must point at the right one.
     - Never change a chapter's id once you've studied it: progress is
       saved under the id.
   ====================================================================== */

/* ---------------- COPY FROM HERE ---------------- */
  {
    id: 'm2-keyword',                 // unique, never change it later
    title: 'Keyword search',          // shown in the app
    file: 'keyword.py',               // the fake file name shown on code blocks
    source: 'Module 2 · Lab 1',       // optional: where this came from
    blurb: "One sentence about what this chapter covers.",

    // LESSON CARDS: read in order. h = heading, p = text, code / out / tip are optional.
    learn: [
      { h: "What BM25 does", p: "Explain one idea per card, in plain words. Use **bold** for the key term and `code` for names.",
        code: py`
          scores = bm25.get_scores(["tornado"])
          print(scores[:3])`,
        out: "[0.0 2.31 0.0]",
        tip: "Optional: a short extra hint or a common mistake." },
      { h: "A card without code", p: "Cards can be just text." },
    ],

    // FILL IN: {?} marks the blank. a = accepted answers (first one is shown as the answer).
    fill: [
      { code: py`docs = retrieve(query, {?}=5)`, a: ['top_k'], why: "Why that's the answer." },
    ],

    // PREDICT THE OUTPUT: o = options, a = position of the right one (from 0).
    // Run the code yourself and paste the real output, so it's exactly right.
    output: [
      { code: py`
          words = ["a", "b"]
          print(len(words))`, o: ['2', '1', '3', 'Error'], a: 0, why: "Two items in the list." },
    ],

    // PUT IT IN ORDER: lines in the RIGHT order. The app shuffles them.
    // alts (optional): other valid orders, as lists of line positions (from 0).
    order: [
      { task: "Retrieve, then print the titles.",
        lines: ['indices = retrieve("storms", top_k=3)', 'docs = query_news(indices)', 'for doc in docs:', '    print(doc["title"])'] },
    ],

    // DEBUG: line = the line with the bug (from 1), fix = the corrected line.
    debug: [
      { task: "What the code is supposed to do.",
        code: py`
          indices = retrieve("storms", top_k="3")
          docs = query_news(indices)`,
        line: 1, fix: 'indices = retrieve("storms", top_k=3)', why: "Why it was wrong." },
    ],

    // PICK THE TOOL: a question with options. prose: true for options that are sentences, not code.
    tools: [
      { q: "Find documents that contain the exact word “BM25”.", o: ['Keyword search', 'Semantic search', 'A bigger LLM', 'Raise top_k'], a: 0, prose: true, why: "Exact words are what keyword search matches." },
    ],

    // TRUE OR FALSE: a is true or false, WITHOUT quotes. Also used by Rapid fire.
    tf: [
      { s: "BM25 is a keyword search method.", a: true, why: "It scores documents by the words they share with the query." },
    ],
  },
/* ---------------- TO HERE ---------------- */
