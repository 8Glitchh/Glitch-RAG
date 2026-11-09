/* Module 3: Information retrieval with vector databases
   Outlines only. Fill them in when you get here (see ADDING.md). */

addModule({
  id: 'm3', n: '03', name: 'Vector databases', lib: 'ann · chunking · reranking',
  chapters: [
    { id: 'm3-ann', title: 'Approximate nearest neighbours', file: 'ann.py',
      blurb: "Searching millions of vectors fast, with algorithms like HNSW." },
    { id: 'm3-vectordb', title: 'Vector databases', file: 'vectordb.py',
      blurb: "Storing, indexing and querying embeddings in a vector database." },
    { id: 'm3-chunking', title: 'Chunking', file: 'chunking.py',
      blurb: "Splitting long documents into pieces the retriever can find." },
    { id: 'm3-query', title: 'Query parsing', file: 'query.py',
      blurb: "Rewriting and cleaning up the user's question before searching." },
    { id: 'm3-rerank', title: 'Reranking', file: 'rerank.py',
      blurb: "Cross-encoders and rerankers that reorder the results for precision." },
  ],
});
