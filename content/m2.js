/* Module 2: Information Retrieval and Search Foundations
   Lab material only: Ungraded Lab 1 (vector embeddings), Ungraded Lab 2 (retrieval metrics)
   and Assignment 2 (BM25, semantic search, reciprocal rank fusion).
   How to add or change things: see ADDING.md. */

addModule({
  id: 'm2', n: '02', name: 'Search foundations', lib: 'embeddings · metrics · bm25 · rrf',
  chapters: [

  /* ------------------------------------------------------------------ */
  {
    id: 'm2-embeddings', title: 'Vector embeddings', file: 'embeddings.py',
    source: 'Module 2 · Ungraded Lab 1',
    blurb: "Turn text into vectors with `model.encode`, compare them with cosine similarity and Euclidean distance, and rank documents.",
    learn: [
      { h: "Text in, vector out", p: "An **embedding model** turns a word or sentence into a fixed-size list of numbers, a **vector**. The lab uses `BAAI/bge-base-en-v1.5` through the `sentence_transformers` library. Every text becomes **768 numbers**, however long or short it is.",
        code: py`
          from sentence_transformers import SentenceTransformer

          model = SentenceTransformer("BAAI/bge-base-en-v1.5")
          res = model.encode("RAG is awesome")
          print(res.shape)`,
        out: "(768,)",
        tip: "In the course notebooks the model loads from a local folder (`os.environ['MODELS']`), but the call is the same." },
      { h: "Many texts at once", p: "Pass a **list** of strings and you get one vector per string: a 2D array with one row per text.",
        code: py`
          vectors = model.encode(["apple", "car"])
          print(vectors.shape)`,
        out: "(2, 768)",
        tip: "Encoding a list in one call is much faster than calling `encode` once per text in a loop." },
      { h: "Cosine similarity: same direction?", p: "Cosine similarity compares the **angle** between two vectors. Close to **1** means very similar meaning. **Higher is better.** You don't write it yourself: the assignments import it ready-made.",
        code: py`
          from utils import cosine_similarity

          scores = cosine_similarity([1, 2], [1, 1])
          print([round(float(s), 4) for s in scores])`,
        out: "[0.9487]",
        tip: "It always returns a **list** with one score per vector, even when you compare against just one. Take `[0]` to get the number." },
      { h: "Euclidean distance: how far apart?", p: "Euclidean distance is the straight-line distance between the two points. Close to **0** means very similar. **Lower is better**, the opposite of cosine.",
        code: py`
          from utils import euclidean_distance

          dists = euclidean_distance([1, 2], [1, 1])
          print([round(float(d), 4) for d in dists])`,
        out: "[1.0]",
        tip: "Same shape as cosine: one vector first, then one vector or a list of vectors, and a list comes back." },
      { h: "The two metrics can disagree", p: "The lab compares `v1 = [1, 2]` with `[3, 2]` and `[5, 6]`. By **cosine**, `[5, 6]` is closer: it points in almost the same direction. By **Euclidean**, `[3, 2]` is closer: it's nearer as a point. Cosine ignores length; Euclidean doesn't.",
        code: py`
          v1 = [1, 2]
          array_v = [[3, 2], [5, 6]]
          print([round(float(c), 3) for c in cosine_similarity(v1, array_v)])
          print([round(float(d), 3) for d in euclidean_distance(v1, array_v)])`,
        out: "[0.868, 0.973]\n[2.0, 5.657]",
        tip: "Pass a list of vectors as the second argument and you get one score per vector, in the same order." },
      { h: "Ranking documents with embeddings", p: "The lab's `retrieve_relevant` is a mini search engine: embed the query, embed the documents, score each one, then sort. Cosine sorts **descending** (`reverse=True`); Euclidean sorts **ascending**.",
        code: py`
          def retrieve_relevant(query, documents, metric='cosine_similarity'):
              query_emb = model.encode(query)
              documents_emb = model.encode(documents)
              if metric == 'cosine_similarity':
                  distances = cosine_similarity(query_emb, documents_emb)
                  vals = [(doc, dist) for doc, dist in zip(documents, distances)]
                  vals.sort(reverse=True, key=lambda x: x[1])
              elif metric == 'euclidean':
                  distances = euclidean_distance(query_emb, documents_emb)
                  vals = [(doc, dist) for doc, dist in zip(documents, distances)]
                  vals.sort(key=lambda x: x[1])
              return vals`,
        tip: "`zip` pairs each document with its score, and `key=lambda x: x[1]` sorts the pairs by the score (the second item)." },
      { h: "Embeddings learn associations, not facts", p: "For “Suggest to me great places to visit in Asia”, Kyoto doesn't come out on top, even though it's the only place in Asia. The model ranks by which sentences **appear in similar contexts** in its training data, and generic travel sentences like Santorini's and Banff's look alike.",
        tip: "Semantic search returns what's closest in meaning to the model, which isn't always what's factually right." },
      { h: "Long texts get cut off", p: "The model reads at most **512 tokens**. Anything after that is ignored, so in the lab the embedding of the whole long text and of just its first 3000 characters are **exactly the same**.",
        code: py`
          big_text_embedding = model.encode(big_text)
          short_embedding = model.encode(big_text[:3000])
          print(np.array_equal(big_text_embedding, short_embedding))`,
        out: "True",
        tip: "That's why long documents get split into smaller pieces (chunks) before embedding. It's covered in later modules." },
      { h: "Seeing 768 dimensions", p: "You can't plot 768 numbers. The lab uses **PCA** to squeeze each vector down to 2 numbers that keep as much of the spread as possible, then plots them: words like *car* and *automobile* land near each other.",
        code: py`
          from sklearn.decomposition import PCA

          pca = PCA(n_components=2)
          embeddings_2d = pca.fit_transform(embeddings)   # (n, 768) → (n, 2)`,
      },
    ],
    fill: [
      { code: py`res = model.{?}("RAG is awesome")   # text → vector`, a: ['encode'], why: "`model.encode(text)` returns the embedding." },
      { code: py`from utils import {?}   # the ready-made cosine function`, a: ['cosine_similarity'], why: "The assignments import `cosine_similarity` from `utils` instead of writing it." },
      { code: py`score = cosine_similarity(apple_vec, fruit_vec){?}   # just the number, not a list`, a: ['[0]'], why: "It returns a list with one score per vector. With one vector, the score is at `[0]`." },
      { code: py`vals.sort(reverse={?}, key=lambda x: x[1])   # cosine: highest first`, a: ['True'], why: "Higher cosine means more similar, so sort descending." },
      { code: py`vals = [(doc, dist) for doc, dist in {?}(documents, distances)]   # pair each doc with its score`, a: ['zip'], why: "`zip` walks two lists side by side." },
      { code: py`pca = PCA(n_components={?})   # squeeze to 2D for a plot`, a: ['2'], why: "Two components means two numbers per text: an x and a y." },
      { code: py`print(np.{?}(big_text_embedding, short_embedding))   # identical arrays?`, a: ['array_equal'], why: "`np.array_equal` checks every element. The lab uses it to show the long text was truncated." },
    ],
    output: [
      { code: py`
          from utils import cosine_similarity
          print([round(float(s), 2) for s in cosine_similarity([1, 0], [5, 0])])`, o: ['[1.0]', '[0.2]', '[5.0]', '1.0'], a: 0, why: "Same direction, different lengths: cosine similarity is still 1, because it only looks at the angle. And it comes back as a list." },
      { code: py`
          from utils import euclidean_distance
          print([round(float(d), 2) for d in euclidean_distance([1, 0], [5, 0])])`, o: ['[4.0]', '[0.0]', '[1.0]', '4.0'], a: 0, why: "Same direction, but the points are 4 apart. Euclidean distance cares about length; cosine doesn't." },
      { code: py`
          import numpy as np
          from utils import cosine_similarity
          scores = cosine_similarity([1, 2], [[3, 2], [5, 6]])
          print(int(np.argmax(scores)))`, o: ['1', '0', '2', '0.973'], a: 0, why: "Cosine scores are about 0.868 and 0.973, so the most similar vector is at position 1, `[5, 6]`." },
      { code: py`
          import numpy as np
          from utils import euclidean_distance
          dists = euclidean_distance([1, 2], [[3, 2], [5, 6]])
          print(int(np.argmin(dists)))`, o: ['0', '1', '2', '2.0'], a: 0, why: "Distances are 2.0 and about 5.66. For distance, the **smallest** wins: position 0, `[3, 2]`. The two metrics pick different vectors." },
      { code: py`
          scores = [("Santorini", 0.71), ("Kyoto", 0.64), ("Prague", 0.68)]
          scores.sort(reverse=True, key=lambda x: x[1])
          print([s[0] for s in scores])`, o: ["['Santorini', 'Prague', 'Kyoto']", "['Kyoto', 'Prague', 'Santorini']", "['Santorini', 'Kyoto', 'Prague']", '[0.71, 0.68, 0.64]'], a: 0, why: "Sorted by the second item (the score), highest first. That's how cosine results are ranked." },
      { code: py`
          dists = [("Santorini", 0.81), ("Kyoto", 0.92), ("Prague", 0.77)]
          dists.sort(key=lambda x: x[1])
          print(dists[0][0])`, o: ['Prague', 'Kyoto', 'Santorini', '0.77'], a: 0, why: "Euclidean results sort ascending, so the smallest distance, the closest match, comes first." },
      { code: py`
          words = ["apple", "car", "fruit"]
          print(words.index("fruit"))`, o: ['2', '3', '1', 'fruit'], a: 0, why: "`.index` returns the position of an item, counting from 0. The lab uses it to find a word's vector in the array." },
    ],
    order: [
      { task: "Find the document closest in meaning to a query (cosine).",
        lines: ['query_emb = model.encode(query)', 'documents_emb = model.encode(documents)', 'scores = cosine_similarity(query_emb, documents_emb)', 'pairs = list(zip(documents, scores))', 'pairs.sort(reverse=True, key=lambda x: x[1])', 'print(pairs[0][0])'],
        alts: [[1, 0, 2, 3, 4, 5]] },
      { task: "Find the closest document by Euclidean distance.",
        lines: ['from utils import euclidean_distance', 'query_emb = model.encode(query)', 'documents_emb = model.encode(documents)', 'distances = euclidean_distance(query_emb, documents_emb)', 'pairs = sorted(zip(documents, distances), key=lambda x: x[1])', 'print(pairs[0][0])'],
        alts: [[0, 2, 1, 3, 4, 5]] },
    ],
    debug: [
      { task: "Rank documents by Euclidean distance, closest first.",
        code: py`
          distances = euclidean_distance(query_emb, documents_emb)
          vals = list(zip(documents, distances))
          vals.sort(reverse=True, key=lambda x: x[1])`,
        line: 3, fix: 'vals.sort(key=lambda x: x[1])', why: "For Euclidean distance, **smaller** means closer, so sort ascending. `reverse=True` puts the worst match first." },
      { task: "Print the similarity between two words.",
        code: py`
          a = model.encode("apple")
          b = model.encode("fruit")
          print(f"{cosine_similarity(a, b):.4f}")`,
        line: 3, fix: 'print(f"{cosine_similarity(a, b)[0]:.4f}")', why: "The lab's `cosine_similarity` always returns a list, even for one vector. Take `[0]` before formatting the number." },
      { task: "Pick the closest document by Euclidean distance.",
        code: py`
          distances = euclidean_distance(query_emb, documents_emb)
          best = documents[np.argmax(distances)]
          print(best)`,
        line: 2, fix: 'best = documents[np.argmin(distances)]', why: "For distance, smaller means closer. `argmax` picks the **farthest** document; use `argmin`." },
    ],
    tools: [
      { q: "Measure how similar two embeddings are in meaning, ignoring their lengths.", o: ['Cosine similarity', 'Euclidean distance', 'len()', 'np.array_equal'], a: 0, why: "Cosine only looks at the angle between the vectors." },
      { q: "Plot 768-dimensional embeddings on a 2D chart.", o: ['PCA with n_components=2', 'model.encode', 'np.dot', 'Sort them'], a: 0, prose: true, why: "PCA reduces the dimensions while keeping as much of the spread as possible." },
      { q: "A 20-page document gets a poor embedding.", o: ['The model only reads 512 tokens: split it into smaller pieces', 'Use Euclidean distance instead', 'Encode it twice', 'Sort in reverse'], a: 0, prose: true, why: "Everything past the token limit is cut off and ignored." },
      { q: "Turn 1,000 sentences into vectors quickly.", o: ['model.encode(list_of_sentences) in one call', 'A for loop calling encode 1,000 times', 'PCA', 'np.argsort'], a: 0, why: "One call with a list batches the work and returns a 2D array." },
    ],
    tf: [
      { s: "`BAAI/bge-base-en-v1.5` turns any text into 768 numbers.", a: true, why: "Its embeddings always have 768 dimensions." },
      { s: "For cosine similarity, higher means more similar.", a: true, why: "1 is the maximum: the same direction." },
      { s: "For Euclidean distance, higher means more similar.", a: false, why: "Lower is closer. 0 means identical points." },
      { s: "Cosine similarity and Euclidean distance always pick the same closest vector.", a: false, why: "In the lab they disagree: cosine picks [5, 6], Euclidean picks [3, 2]." },
      { s: "Text past the model's 512-token limit still changes the embedding.", a: false, why: "It's ignored. The lab shows the long text and its first 3000 characters give identical vectors." },
      { s: "Embedding models rank by how texts are used together in training data, not by checking facts.", a: true, why: "That's why Kyoto wasn't top for an Asia question." },
      { s: "PCA is used in the lab to make embeddings more accurate.", a: false, why: "It's only for visualising: it squeezes vectors to 2D so they can be plotted." },
      { s: "`model.encode([\"apple\", \"car\"])` returns one vector per word.", a: true, why: "A list in gives a 2D array out, shape (2, 768)." },
      { s: "In the assignments you import `cosine_similarity` instead of writing it yourself.", a: true, why: "Assignment 2 imports it from `utils`; later work uses ready-made library functions." },
      { s: "`cosine_similarity(a, b)` returns a single number when b is one vector.", a: false, why: "It always returns a list. Use `[0]` for the number." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm2-metrics', title: 'Retrieval metrics', file: 'metrics.py',
    source: 'Module 2 · Ungraded Lab 2',
    blurb: "Measure a retriever with Precision@K and Recall@K on a labelled dataset, and see the trade-off between them.",
    learn: [
      { h: "You need labelled data", p: "To grade a retriever, you need queries whose right answers you already know. The lab uses the **20 Newsgroups** dataset: about 11,000 posts, each labelled with one of 20 categories like `sci.space`. A retrieved post counts as **relevant** if its category matches the one the query is about.",
        code: py`
          test_queries = [
              {"query": "advancements in space exploration technology", "desired_category": "sci.space"},
              {"query": "NHL playoffs and team performance statistics", "desired_category": "rec.sport.hockey"},
          ]` },
      { h: "Picking the top K", p: "`top_k_greatest_indices` returns the positions of the K highest scores. `enumerate` keeps each score's position, sorting by value puts the best first, and slicing keeps K of them.",
        code: py`
          def top_k_greatest_indices(lst, k):
              indexed_list = list(enumerate(lst))
              sorted_by_value = sorted(indexed_list, key=lambda x: x[1], reverse=True)
              return [index for index, value in sorted_by_value[:k]]

          print(top_k_greatest_indices([0.2, 0.9, 0.5, 0.7], 2))`,
        out: "[1, 3]" },
      { h: "Precision@K: how much of what I got is right?", p: "Out of the K documents retrieved, the share that are relevant.",
        code: py`
          def precision_at_k(relevant_count, k):
              if k == 0:
                  return 0.0
              return relevant_count / k

          print(precision_at_k(4, 5))`,
        out: "0.8",
        tip: "Precision = relevant in top K ÷ K." },
      { h: "Recall@K: how much of what exists did I find?", p: "Out of **all** the relevant documents in the corpus, the share that made it into the top K.",
        code: py`
          def recall_at_k(relevant_count, total_relevant):
              if total_relevant == 0:
                  return 0.0
              return relevant_count / total_relevant

          print(recall_at_k(5, 500))`,
        out: "0.01",
        tip: "Recall = relevant in top K ÷ total relevant in the corpus. Each category has about 500–600 posts, so recall stays small." },
      { h: "Counting relevant results", p: "`compute_metrics` turns the top-K positions into categories, then counts matches with `sum(1 for ... if ...)`: one for every item that passes the test.",
        code: py`
          retrieved_categories = ["sci.space", "sci.space", "sci.med", "sci.space", "sci.space"]
          relevant_in_top_k = sum(1 for cat in retrieved_categories if cat == "sci.space")
          print(relevant_in_top_k)`,
        out: "4" },
      { h: "The precision-recall trade-off", p: "As K grows from 5 to 20 to 50, **recall goes up** (you find more of the relevant posts) and **precision tends to go down** (more irrelevant ones sneak in). At K=5 most queries had precision near 1.00 but recall around 0.01.",
        tip: "For RAG, the lab suggests K between 5 and 20: high precision, and a context small enough for the LLM. You want the *most* relevant documents, not *all* of them." },
      { h: "Some queries are just harder", p: "“historical influence of politics on society” scored the lowest precision at every K, around 0.4–0.5. Its category, `talk.politics.misc`, overlaps a lot with other politics categories, so the embeddings mix them up.",
        tip: "Metrics averaged over several queries hide this, so look at each query's numbers too." },
    ],
    fill: [
      { code: py`
          def precision_at_k(relevant_count, k):
              return relevant_count / {?}`, a: ['k'], why: "Precision divides by how many you retrieved." },
      { code: py`
          def recall_at_k(relevant_count, total_relevant):
              return relevant_count / {?}`, a: ['total_relevant'], why: "Recall divides by how many relevant documents exist in total." },
      { code: py`indexed_list = list({?}(lst))   # keep each score's position`, a: ['enumerate'], why: "`enumerate` gives (position, value) pairs." },
      { code: py`sorted_by_value = sorted(indexed_list, key=lambda x: x[1], {?}=True)   # biggest first`, a: ['reverse'], why: "`reverse=True` sorts descending." },
      { code: py`relevant_in_top_k = {?}(1 for cat in retrieved_categories if cat == desired_category)`, a: ['sum'], why: "Adding up a 1 for every match counts the matches." },
      { code: py`
          if k == 0:
              return {?}   # avoid dividing by zero`, a: ['0.0', '0'], why: "Retrieving nothing gives a precision of 0 instead of a crash." },
    ],
    output: [
      { code: py`
          def precision_at_k(relevant_count, k):
              return relevant_count / k

          print(precision_at_k(3, 5))`, o: ['0.6', '0.3', '1.67', '3'], a: 0, why: "3 relevant out of 5 retrieved." },
      { code: py`
          def recall_at_k(relevant_count, total_relevant):
              return relevant_count / total_relevant

          print(recall_at_k(3, 4))`, o: ['0.75', '1.33', '0.6', '0.25'], a: 0, why: "Found 3 of the 4 relevant documents that exist." },
      { code: py`print(list(enumerate([0.4, 0.9])))`, o: ['[(0, 0.4), (1, 0.9)]', '[(1, 0.4), (2, 0.9)]', '[0, 1]', '[0.4, 0.9]'], a: 0, why: "`enumerate` pairs each value with its position, starting from 0." },
      { code: py`
          lst = [0.3, 0.8, 0.1, 0.6]
          pairs = sorted(enumerate(lst), key=lambda x: x[1], reverse=True)
          print([i for i, v in pairs[:2]])`, o: ['[1, 3]', '[0.8, 0.6]', '[3, 1]', '[0, 1]'], a: 0, why: "The two biggest scores are at positions 1 (0.8) and 3 (0.6)." },
      { code: py`
          cats = ["sci.space", "sci.med", "sci.space"]
          print(sum(1 for c in cats if c == "sci.space"))`, o: ['2', '3', '1', 'True'], a: 0, why: "One 1 for each match, then added up." },
      { code: py`
          for k in [5, 20]:
              relevant = 5 if k == 5 else 16
              print(k, relevant / k, relevant / 500)`, o: ['5 1.0 0.01\n20 0.8 0.032', '5 1.0 0.01\n20 0.8 0.01', '5 0.01 1.0\n20 0.032 0.8', '20 0.8 0.032'], a: 0, why: "Going from K=5 to K=20, precision falls (1.0 → 0.8) while recall rises (0.01 → 0.032). That's the trade-off." },
    ],
    order: [
      { task: "Compute Precision@K and Recall@K for one query.",
        lines: ['q_emb = model.encode(query)', 'cosine_scores = cosine_similarity(q_emb, E)', 'top_results = top_k_greatest_indices(cosine_scores, k=top_k)', 'retrieved = [category_of(i) for i in top_results]', 'relevant_in_top_k = sum(1 for c in retrieved if c == desired_category)', 'p = precision_at_k(relevant_in_top_k, top_k)', 'r = recall_at_k(relevant_in_top_k, total_relevant_in_corpus)'],
        alts: [[0, 1, 2, 3, 4, 6, 5]] },
      { task: "Write top_k_greatest_indices.",
        lines: ['def top_k_greatest_indices(lst, k):', '    indexed_list = list(enumerate(lst))', '    sorted_by_value = sorted(indexed_list, key=lambda x: x[1], reverse=True)', '    return [index for index, value in sorted_by_value[:k]]'] },
    ],
    debug: [
      { task: "Return the positions of the top k scores.",
        code: py`
          def top_k_greatest_indices(lst, k):
              indexed_list = list(enumerate(lst))
              sorted_by_value = sorted(indexed_list, key=lambda x: x[1])
              return [index for index, value in sorted_by_value[:k]]`,
        line: 3, fix: '    sorted_by_value = sorted(indexed_list, key=lambda x: x[1], reverse=True)', why: "Without `reverse=True` it sorts ascending, so you get the k **worst** scores." },
      { task: "Compute recall.",
        code: py`
          relevant_in_top_k = 4
          total_relevant_in_corpus = 500
          r = recall_at_k(relevant_in_top_k, top_k)`,
        line: 3, fix: 'r = recall_at_k(relevant_in_top_k, total_relevant_in_corpus)', why: "Dividing by `top_k` gives precision. Recall divides by all the relevant documents in the corpus." },
      { task: "Return the indices of the top k items.",
        code: py`
          def top_k_greatest_indices(lst, k):
              indexed_list = list(enumerate(lst))
              sorted_by_value = sorted(indexed_list, key=lambda x: x[1], reverse=True)
              return [value for index, value in sorted_by_value[:k]]`,
        line: 4, fix: '    return [index for index, value in sorted_by_value[:k]]', why: "This returns the scores, not their positions. You need the index to look the document up." },
    ],
    tools: [
      { q: "Of the 5 documents my retriever returned, how many were useful?", o: ['Precision@K', 'Recall@K', 'Cosine similarity', 'PCA'], a: 0, why: "Precision looks only at what you retrieved." },
      { q: "Did my retriever find most of the relevant documents that exist?", o: ['Recall@K', 'Precision@K', 'Euclidean distance', 'top_k'], a: 0, why: "Recall compares against every relevant document in the corpus." },
      { q: "You raise K from 5 to 50. What usually happens?", o: ['Recall goes up, precision goes down', 'Both go up', 'Both go down', 'Nothing changes'], a: 0, prose: true, why: "More documents means finding more relevant ones, but also more irrelevant ones." },
      { q: "You want to measure your retriever, but nothing in your data says which documents are right.", o: ['Build a labelled set: queries with known relevant documents', 'Use a bigger K', 'Switch to Euclidean distance', 'Use PCA'], a: 0, prose: true, why: "Precision and recall need ground truth to compare against." },
    ],
    tf: [
      { s: "Precision@K = relevant documents in the top K ÷ K.", a: true, why: "The share of retrieved documents that are relevant." },
      { s: "Recall@K = relevant documents in the top K ÷ K.", a: false, why: "Recall divides by the total number of relevant documents in the corpus." },
      { s: "Raising K usually raises recall.", a: true, why: "You retrieve more, so you catch more of the relevant documents." },
      { s: "Raising K always raises precision.", a: false, why: "Precision usually drops, because more irrelevant documents get in." },
      { s: "In the lab, recall at K=5 was around 0.01 even when precision was perfect.", a: true, why: "Each category has hundreds of posts, and 5 is a tiny share of them." },
      { s: "Retrieval metrics can be computed without knowing which documents are relevant.", a: false, why: "They need a labelled dataset." },
      { s: "For RAG, the lab suggests K around 5 to 20.", a: true, why: "High precision and a context size the LLM can handle." },
      { s: "`enumerate(lst)` gives (position, value) pairs.", a: true, why: "That's how `top_k_greatest_indices` remembers where each score came from." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm2-retrievers', title: 'BM25, semantic search and RRF', file: 'retrievers.py',
    source: 'Module 2 · Assignment 2',
    blurb: "Build three retrievers over the BBC news: BM25 keyword search, semantic search with embeddings, and reciprocal rank fusion to combine them.",
    learn: [
      { h: "Three ways to retrieve", p: "**BM25** scores documents by the **words** they share with the query: how often each word appears, how rare it is overall, and how long the document is. **Semantic search** compares **meaning** using embeddings. **RRF** merges both rankings into one.",
        tip: "Every function in this assignment returns a list of **indices** into `NEWS_DATA`, just like Module 1's `retrieve`." },
      { h: "Setting up BM25", p: "The corpus is each article's title and description joined with a space. Build the retriever, **tokenize** the corpus (split it into words), then **index** it so it can be searched.",
        code: py`
          import bm25s

          corpus = [x['title'] + " " + x['description'] for x in NEWS_DATA]
          BM25_RETRIEVER = bm25s.BM25(corpus=corpus)
          TOKENIZED_DATA = bm25s.tokenize(corpus)
          BM25_RETRIEVER.index(TOKENIZED_DATA)` },
      { h: "Exercise 1: bm25_retrieve", p: "Tokenize the query, retrieve the top k, take the first row of results (there was one query), and turn each document back into its position with `corpus.index`.",
        code: py`
          def bm25_retrieve(query: str, top_k: int = 5):
              tokenized_query = bm25s.tokenize(query)
              results, scores = BM25_RETRIEVER.retrieve(tokenized_query, k=top_k)
              results = results[0]
              top_k_indices = [corpus.index(result) for result in results]
              return top_k_indices

          print(bm25_retrieve("What are the recent news about GDP?"))`,
        out: "[752, 673, 289, 626, 43]",
        tip: "`retrieve` returns one row per query. You sent one query, so take `results[0]`." },
      { h: "Semantic search setup", p: "The articles were embedded ahead of time: `EMBEDDINGS` is an array with one 768-number vector per article. Only the query gets embedded when you search.",
        code: py`
          import joblib
          from sentence_transformers import SentenceTransformer

          EMBEDDINGS = joblib.load("embeddings.joblib")   # shape (870, 768)
          model = SentenceTransformer("BAAI/bge-base-en-v1.5")` },
      { h: "Sorting highest first with argsort", p: "`np.argsort` returns the **positions** that would sort an array, smallest first. Sorting the **negative** scores gives the biggest scores first.",
        code: py`
          import numpy as np

          scores = np.array([0.2, 0.9, 0.5])
          print(np.argsort(scores))
          print(np.argsort(-scores))`,
        out: "[0 2 1]\n[1 2 0]" },
      { h: "Exercise 2: semantic_search_retrieve", p: "Embed the query, score it against every article, sort descending, keep the top k, and cast the numpy numbers to plain `int`s.",
        code: py`
          def semantic_search_retrieve(query, top_k=5):
              query_embedding = model.encode(query)
              similarity_scores = cosine_similarity(query_embedding, EMBEDDINGS)
              similarity_indices = np.argsort(-similarity_scores)
              top_k_indices_array = similarity_indices[:top_k]
              top_k_indices = [int(x) for x in top_k_indices_array]
              return top_k_indices

          print(semantic_search_retrieve("What are the recent news about GDP?"))`,
        out: "[743, 673, 626, 752, 326]",
        tip: "BM25 and semantic search agree on three of the five GDP articles (752, 673, 626) but each also finds articles the other misses." },
      { h: "Reciprocal rank fusion", p: "RRF gives each document **1 ÷ (K + rank)** from every list it appears in, and adds them up. Ranks start at 1. Documents near the top of **both** lists win. `K` (60 by default) softens the gap between rank 1 and rank 2.",
        code: py`
          K = 60
          print(round(1 / (K + 1), 4))   # rank 1
          print(round(1 / (K + 5), 4))   # rank 5`,
        out: "0.0164\n0.0154" },
      { h: "Exercise 3: reciprocal_rank_fusion", p: "A dictionary collects each document's total score. `enumerate(lst, start=1)` gives ranks from 1. Then sort the dictionary's keys by their scores, highest first, and keep the top k.",
        code: py`
          def reciprocal_rank_fusion(list1, list2, top_k=5, K=60):
              rrf_scores = {}
              for lst in [list1, list2]:
                  for rank, item in enumerate(lst, start=1):
                      if item not in rrf_scores:
                          rrf_scores[item] = 0
                      rrf_scores[item] += 1 / (rank + K)
              sorted_items = sorted(rrf_scores, key=rrf_scores.get, reverse=True)
              top_k_indices = [int(x) for x in sorted_items[:top_k]]
              return top_k_indices

          print(reciprocal_rank_fusion([743, 673, 626, 752, 326], [752, 673, 289, 626, 43]))`,
        out: "[673, 752, 626, 743, 289]",
        tip: "673 wins: it's 2nd in both lists. 752 is 1st in one list but only 4th in the other." },
      { h: "Plugging a retriever into RAG", p: "The final prompt now takes the retriever as an argument, so you can swap methods. RRF is special: it needs **two lists**, so the function checks the retriever's name and runs both searches first.",
        code: py`
          if retrieve_function.__name__ == 'reciprocal_rank_fusion':
              list1 = semantic_search_retrieve(query, top_k)
              list2 = bm25_retrieve(query, top_k)
              top_k_indices = retrieve_function(list1, list2, top_k)
          else:
              top_k_indices = retrieve_function(query=query, top_k=top_k)`,
        tip: "In Python, a function is a value: you can pass `bm25_retrieve` itself (no brackets) and call it later." },
      { h: "Which one wins?", p: "The widget answers one query four ways: semantic, BM25, RRF and no RAG. **BM25** shines for exact names and rare words (a company, a person). **Semantic** shines when the query uses different words from the articles. **RRF** is a safe middle ground.",
      },
    ],
    fill: [
      { code: py`corpus = [x['title'] + " " + x[{?}] for x in NEWS_DATA]`, a: ["'description'"], why: "The BM25 corpus is the title and the description joined with a space." },
      { code: py`tokenized_query = bm25s.{?}(query)`, a: ['tokenize'], why: "BM25 matches words, so the query is split into tokens first." },
      { code: py`results, scores = BM25_RETRIEVER.retrieve(tokenized_query, {?}=top_k)`, a: ['k'], why: "In bm25s, the number of results is the `k` argument." },
      { code: py`top_k_indices = [corpus.{?}(result) for result in results]   # document → position`, a: ['index'], why: "`list.index(x)` gives the position of `x` in the list." },
      { code: py`similarity_indices = np.argsort({?}similarity_scores)   # highest score first`, a: ['-'], why: "argsort sorts ascending, so sorting the negated scores puts the biggest first." },
      { code: py`
          for rank, item in enumerate(lst, start={?}):   # ranks begin at 1
              print(rank, item)`, a: ['1'], why: "Ranking convention: the first result is rank 1, not 0." },
      { code: py`rrf_scores[item] += 1 / (rank + {?})`, a: ['K'], why: "The RRF score is 1 ÷ (rank + K)." },
      { code: py`sorted_items = sorted(rrf_scores, key=rrf_scores.{?}, reverse=True)`, a: ['get'], why: "`rrf_scores.get` looks up each key's score, so the keys sort by score." },
    ],
    output: [
      { code: py`
          import numpy as np
          scores = np.array([0.1, 0.7, 0.4, 0.9])
          print(np.argsort(-scores)[:2])`, o: ['[3 1]', '[0 2]', '[0.9 0.7]', '[1 3]'], a: 0, why: "Highest first: position 3 (0.9), then position 1 (0.7)." },
      { code: py`
          for rank, item in enumerate([752, 673], start=1):
              print(rank, item)`, o: ['1 752\n2 673', '0 752\n1 673', '752 1\n673 2', '1 673\n2 752'], a: 0, why: "`start=1` makes the counter begin at 1." },
      { code: py`
          scores = {"a": 0.2, "b": 0.9, "c": 0.5}
          print(sorted(scores, key=scores.get, reverse=True))`, o: ["['b', 'c', 'a']", "['a', 'c', 'b']", '[0.9, 0.5, 0.2]', "['a', 'b', 'c']"], a: 0, why: "Sorting a dictionary sorts its keys; `key=scores.get` orders them by their values." },
      { code: py`
          def rrf(list1, list2, top_k=3, K=60):
              rrf_scores = {}
              for lst in [list1, list2]:
                  for rank, item in enumerate(lst, start=1):
                      if item not in rrf_scores:
                          rrf_scores[item] = 0
                      rrf_scores[item] += 1 / (rank + K)
              return sorted(rrf_scores, key=rrf_scores.get, reverse=True)[:top_k]

          print(rrf([1, 2, 3], [2, 4, 1]))`, o: ['[2, 1, 4]', '[1, 2, 3]', '[1, 2, 4]', '[2, 4, 1]'], a: 0, why: "2 is near the top of both lists (2nd and 1st), so it has the highest total. 1 is in both lists too (1st and 3rd). 4 beats 3 because rank 2 scores more than rank 3." },
      { code: py`
          corpus = ["GDP rises", "Storm hits", "Election day"]
          results = ["Election day", "GDP rises"]
          print([corpus.index(r) for r in results])`, o: ['[2, 0]', '[0, 2]', '[1, 2]', "['Election day', 'GDP rises']"], a: 0, why: "BM25 returns document texts; `corpus.index` turns each back into its position." },
      { code: py`
          import numpy as np
          arr = np.array([743, 673])
          print([int(x) for x in arr])`, o: ['[743, 673]', '[743 673]', 'array([743, 673])', '[np.int64(743), np.int64(673)]'], a: 0, why: "Casting with `int()` gives plain Python numbers. The grader compares against a plain list." },
    ],
    order: [
      { task: "Write bm25_retrieve.",
        lines: ['def bm25_retrieve(query, top_k=5):', '    tokenized_query = bm25s.tokenize(query)', '    results, scores = BM25_RETRIEVER.retrieve(tokenized_query, k=top_k)', '    results = results[0]', '    return [corpus.index(result) for result in results]'] },
      { task: "Write semantic_search_retrieve.",
        lines: ['def semantic_search_retrieve(query, top_k=5):', '    query_embedding = model.encode(query)', '    similarity_scores = cosine_similarity(query_embedding, EMBEDDINGS)', '    similarity_indices = np.argsort(-similarity_scores)', '    return [int(x) for x in similarity_indices[:top_k]]'] },
      { task: "Write reciprocal_rank_fusion.",
        lines: ['def reciprocal_rank_fusion(list1, list2, top_k=5, K=60):', '    rrf_scores = {}', '    for lst in [list1, list2]:', '        for rank, item in enumerate(lst, start=1):', '            if item not in rrf_scores:', '                rrf_scores[item] = 0', '            rrf_scores[item] += 1 / (rank + K)', '    sorted_items = sorted(rrf_scores, key=rrf_scores.get, reverse=True)', '    return [int(x) for x in sorted_items[:top_k]]'] },
    ],
    debug: [
      { task: "Return the indices of the top k BM25 results.",
        code: py`
          tokenized_query = bm25s.tokenize(query)
          results, scores = BM25_RETRIEVER.retrieve(tokenized_query, k=top_k)
          top_k_indices = [corpus.index(result) for result in results]`,
        line: 3, fix: 'top_k_indices = [corpus.index(result) for result in results[0]]', why: "`results` has one row per query. Loop over `results[0]`, the row for your one query." },
      { task: "Get the top k most similar articles.",
        code: py`
          query_embedding = model.encode(query)
          similarity_scores = cosine_similarity(query_embedding, EMBEDDINGS)
          similarity_indices = np.argsort(similarity_scores)
          top_k_indices = [int(x) for x in similarity_indices[:top_k]]`,
        line: 3, fix: 'similarity_indices = np.argsort(-similarity_scores)', why: "argsort sorts ascending, so this returns the k **least** similar articles. Negate the scores." },
      { task: "Add up the RRF score for each document.",
        code: py`
          rrf_scores = {}
          for lst in [list1, list2]:
              for rank, item in enumerate(lst, start=1):
                  rrf_scores[item] += 1 / (rank + K)`,
        line: 4, fix: '            rrf_scores[item] = rrf_scores.get(item, 0) + 1 / (rank + K)', why: "The first time a document appears it isn't in the dictionary yet, so `+=` raises `KeyError`. Start it at 0 first (the assignment uses `if item not in rrf_scores`)." },
      { task: "Score each rank with RRF.",
        code: py`
          for rank, item in enumerate(lst):
              if item not in rrf_scores:
                  rrf_scores[item] = 0
              rrf_scores[item] += 1 / (rank + K)`,
        line: 1, fix: 'for rank, item in enumerate(lst, start=1):', why: "Without `start=1`, the top result gets rank 0, so every score is a little off. The grader expects ranks from 1." },
    ],
    tools: [
      { q: "Find articles that mention an exact company name like “Nvidia”.", o: ['BM25 keyword search', 'Semantic search', 'PCA', 'No RAG'], a: 0, prose: true, why: "Exact, rare words are BM25's strength." },
      { q: "The query says “cost of living” but the articles say “inflation”.", o: ['Semantic search', 'BM25 keyword search', 'np.argsort without the minus', 'Raise K in RRF'], a: 0, prose: true, why: "Semantic search matches meaning even when the words differ." },
      { q: "Combine a BM25 ranking and a semantic ranking into one list.", o: ['Reciprocal rank fusion', 'Average the embeddings', 'Concatenate the lists', 'Precision@K'], a: 0, why: "RRF rewards documents ranked high in either or both lists." },
      { q: "Get positions sorted from highest to lowest score in numpy.", o: ['np.argsort(-scores)', 'np.argsort(scores)', 'np.sort(scores)', 'sorted(scores)'], a: 0, why: "argsort returns positions, and the minus flips the order." },
    ],
    tf: [
      { s: "BM25 looks at word frequency, how rare a word is, and document length.", a: true, why: "Those three factors decide each document's score." },
      { s: "BM25 understands that “car” and “automobile” mean the same thing.", a: false, why: "It matches words. Semantic search is the one that matches meaning." },
      { s: "`BM25_RETRIEVER.retrieve` returns one row of results per query.", a: true, why: "That's why the code takes `results[0]`." },
      { s: "`np.argsort` sorts from largest to smallest by default.", a: false, why: "Ascending by default. Negate the scores to get largest first." },
      { s: "In RRF, ranks start at 1.", a: true, why: "`enumerate(lst, start=1)`." },
      { s: "A document that appears in only one list gets no RRF score.", a: false, why: "It gets a score from that one list, just a smaller one." },
      { s: "In the assignment, the articles' embeddings are computed fresh every time you search.", a: false, why: "They were pre-computed and loaded with joblib. Only the query is embedded." },
      { s: "BM25 and semantic search agreed on three of the top five GDP articles.", a: true, why: "752, 673 and 626 appear in both lists." },
    ],
  },

  ],
});
