/* Module 4: LLMs and text generation in RAG
   Outlines only. Fill them in when you get here (see ADDING.md). */

addModule({
  id: 'm4', n: '04', name: 'LLMs and generation', lib: 'sampling · prompts · evaluation',
  chapters: [
    { id: 'm4-transformers', title: 'How LLMs generate text', file: 'llm.py',
      blurb: "Tokens, transformers, and how a model picks the next word." },
    { id: 'm4-sampling', title: 'Sampling settings', file: 'sampling.py',
      blurb: "Temperature, top_k, top_p and other knobs that change the output." },
    { id: 'm4-prompting', title: 'Prompt engineering for RAG', file: 'prompts.py',
      blurb: "System prompts, examples and structure that help the model use the context." },
    { id: 'm4-hallucination', title: 'Hallucinations and citations', file: 'grounding.py',
      blurb: "Keeping answers grounded in the documents, and showing the sources." },
    { id: 'm4-eval', title: 'Evaluating answers', file: 'eval_llm.py',
      blurb: "Checking whether answers are correct, relevant and faithful to the context." },
    { id: 'm4-agentic', title: 'Agentic RAG', file: 'agentic.py',
      blurb: "Letting the LLM decide when and what to retrieve." },
  ],
});
