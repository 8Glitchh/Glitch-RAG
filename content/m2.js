/* Module 2: Information retrieval and search foundations
   These chapters are outlines: a title and a short description, no lessons yet.
   When you reach this module, fill each chapter in (see ADDING.md), or rename,
   add and remove chapters to match what the course actually covers. */

addModule({
  id: 'm2', n: '02', name: 'Search foundations', lib: 'keyword · semantic · hybrid',
  chapters: [
    { id: 'm2-retriever', title: 'Inside the retriever', file: 'retriever.py',
      blurb: "How a retriever is built, and filtering documents by metadata like date or source." },
    { id: 'm2-keyword', title: 'Keyword search', file: 'keyword.py',
      blurb: "Matching words: bag of words, TF-IDF and BM25." },
    { id: 'm2-semantic', title: 'Semantic search', file: 'semantic.py',
      blurb: "Matching meaning: embedding models, vectors and similarity scores." },
    { id: 'm2-hybrid', title: 'Hybrid search', file: 'hybrid.py',
      blurb: "Combining keyword and semantic results, for example with reciprocal rank fusion." },
    { id: 'm2-eval', title: 'Evaluating retrieval', file: 'eval.py',
      blurb: "Measuring whether the right documents come back: precision, recall and ranking metrics." },
  ],
});
