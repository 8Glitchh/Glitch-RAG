/* Module 5: RAG systems in production
   Outlines only. Fill them in when you get here (see ADDING.md). */

addModule({
  id: 'm5', n: '05', name: 'RAG in production', lib: 'monitoring · cost · security',
  chapters: [
    { id: 'm5-challenges', title: 'What changes in production', file: 'production.py',
      blurb: "Real users, more data, and what tends to break." },
    { id: 'm5-observability', title: 'Monitoring and observability', file: 'monitoring.py',
      blurb: "Logging, tracing and evaluating a running RAG system." },
    { id: 'm5-cost', title: 'Cost and speed', file: 'cost.py',
      blurb: "Trading quality against latency and price, including quantization." },
    { id: 'm5-security', title: 'Security and privacy', file: 'security.py',
      blurb: "Keeping private documents private and handling untrusted input." },
    { id: 'm5-multimodal', title: 'Multimodal RAG', file: 'multimodal.py',
      blurb: "Retrieving images, tables and PDFs, not just text." },
  ],
});
