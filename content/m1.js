/* Module 1: RAG overview
   Lab material only: Ungraded Lab 2 (LLM calls and augmented prompts) and the Module 1 assignment (BBC news RAG).
   How to add or change things: see ADDING.md. Copy a chapter from TEMPLATE.js to start a new one. */

addModule({
  id: 'm1', n: '01', name: 'RAG overview', lib: 'llm calls · prompts · retrieval',
  chapters: [

  /* ------------------------------------------------------------------ */
  {
    id: 'm1-python', title: "Python you'll need", file: 'basics.py',
    source: 'The Python in Ungraded Lab 2 and the assignment',
    blurb: "Dictionaries, f-strings, loops, list comprehensions and `join`: the Python every RAG lab is built from.",
    learn: [
      { h: "Dictionaries: values by name", p: "A dictionary stores values under **keys**. Every news article and every house in the labs is a dictionary. Square brackets with the key give you the value.",
        code: py`
          article = {
              "title": "Large tornado seen in Nebraska",
              "published_at": "2024-04-26",
          }
          print(article["title"])
          print(article["published_at"])`,
        out: "Large tornado seen in Nebraska\n2024-04-26",
        tip: "A key that doesn't exist raises `KeyError`. Check the spelling: `'title'` is not `'Title'`." },
      { h: "Lists of dictionaries", p: "A dataset is usually a **list** of dictionaries, one per document. Pick the document from the list first, then the field from the dictionary.",
        code: py`
          news = [
              {"title": "Macron warns Europe"},
              {"title": "Moulin Rouge sails fall"},
          ]
          print(news[1]["title"])
          print(len(news))`,
        out: "Moulin Rouge sails fall\n2",
        tip: "Lists count from 0, so `news[0]` is the first article and `news[1]` the second." },
      { h: "f-strings: text with values in it", p: "Put an `f` before the quotes, and anything inside `{ }` is replaced with its value. Every prompt in the course is built this way.",
        code: py`
          title = "Macron warns Europe"
          date = "2024-04-25"
          line = f"Title: {title}, Published at: {date}"
          print(line)`,
        out: "Title: Macron warns Europe, Published at: 2024-04-25",
        tip: "Inside an f-string with double quotes, use single quotes for keys: `f\"{doc['title']}\"`." },
      { h: "Loops: one step per item", p: "`for doc in docs:` runs the indented lines once for each item. **Indentation decides what's inside the loop**: everything indented under `for` repeats, and the first unindented line runs after it.",
        code: py`
          docs = ["storm", "election", "AI"]
          for doc in docs:
              print("found:", doc)
          print("done")`,
        out: "found: storm\nfound: election\nfound: AI\ndone" },
      { h: "Building a list with append", p: "Start with an empty list, loop, and `append` each result. Exercise 2 of the assignment is exactly this pattern.",
        code: py`
          docs = [{"title": "A"}, {"title": "B"}]
          lines = []
          for doc in docs:
              lines.append(f"Title: {doc['title']}")
          print(lines)`,
        out: "['Title: A', 'Title: B']",
        tip: "`append` changes the list itself and returns nothing, so write `lines.append(x)`, not `lines = lines.append(x)`." },
      { h: "List comprehensions: a loop in one line", p: "`[what_to_collect for item in items]`. Read it from the middle: **for each item, collect this**. `query_news` in the assignment is one of these.",
        code: py`
          NEWS = ["storm", "election", "AI", "sport"]
          indices = [0, 2]
          picked = [NEWS[i] for i in indices]
          print(picked)`,
        out: "['storm', 'AI']",
        tip: "Same as: `picked = []`, then `for i in indices:` and `picked.append(NEWS[i])`." },
      { h: "join: glue strings together", p: "`separator.join(list)` turns a list of strings into **one** string, with the separator between each pair. `\"\\n\".join(...)` puts each item on its own line.",
        code: py`
          lines = ["Title: A", "Title: B", "Title: C"]
          text = "\n".join(lines)
          print(text)`,
        out: "Title: A\nTitle: B\nTitle: C" },
      { h: "Default and keyword arguments", p: "`top_k=5` in a function definition means **5 unless you pass something else**. In a call, `retrieve(query, top_k=top_k)` gives the parameter on the left the value of your variable on the right.",
        code: py`
          def get_docs(query, top_k=5):
              return f"{top_k} docs for '{query}'"

          print(get_docs("storms"))
          print(get_docs("storms", top_k=2))`,
        out: "5 docs for 'storms'\n2 docs for 'storms'",
        tip: "Type hints like `query: str` and `-> list[dict]` are labels for humans. Python doesn't check them." },
    ],
    fill: [
      { code: py`
          article = {"title": "Storm in Nebraska"}
          print(article[{?}])   # prints Storm in Nebraska`, a: ['"title"'], why: "Look values up by their key, in quotes: `article[\"title\"]`." },
      { code: py`line = {?}"Title: {title}"   # fill {title} with the variable's value`, a: ['f'], why: "Without the `f`, Python prints `{title}` literally." },
      { code: py`
          lines = []
          for doc in docs:
              lines.{?}(doc["title"])`, a: ['append'], why: "`append` adds one item to the end of a list." },
      { code: py`text = "\n".{?}(lines)   # one string, one item per line`, a: ['join'], why: "`join` belongs to the separator string and takes the list." },
      { code: py`picked = [NEWS[i] {?} i in indices]`, a: ['for'], why: "A list comprehension is `[collect for item in items]`." },
      { code: py`
          news = [{"title": "A"}, {"title": "B"}]
          print(news[{?}]["title"])   # prints A`, a: ['0'], why: "The first item is at position 0." },
      { code: py`
          def get_docs(query, top_k{?}):   # top_k is 5 unless the caller says otherwise
              ...`, a: ['=5'], why: "`top_k=5` gives the parameter a default value." },
    ],
    output: [
      { code: py`
          doc = {"title": "AI news", "year": 2024}
          print(f"{doc['title']} ({doc['year']})")`, o: ['AI news (2024)', "{doc['title']} ({doc['year']})", 'title (year)', 'Error'], a: 0, why: "The f-string swaps each `{...}` for the value stored under that key." },
      { code: py`
          for word in ["a", "b"]:
              print(word)
          print("end")`, o: ['a\nb\nend', 'a\nend\nb\nend', 'a\nb', 'end'], a: 0, why: "`print(\"end\")` isn't indented, so it runs once, after the loop." },
      { code: py`
          words = ["a", "b", "c"]
          print(", ".join(words))`, o: ['a, b, c', "['a', 'b', 'c']", 'a, b, c, ', 'abc'], a: 0, why: "The separator goes **between** items, never after the last one." },
      { code: py`
          nums = [1, 2, 3]
          print([n * 10 for n in nums])`, o: ['[10, 20, 30]', '[1, 2, 3, 10]', '60', '[10]'], a: 0, why: "For each n, collect n * 10." },
      { code: py`
          name = "Paris"
          print("Hello {name}")`, o: ['Hello {name}', 'Hello Paris', 'Hello name', 'Error'], a: 0, why: "There's no `f` before the quotes, so `{name}` is printed as plain text." },
      { code: py`
          def greet(name, greeting="Hi"):
              return f"{greeting}, {name}"

          print(greet("Sara", greeting="Hello"))`, o: ['Hello, Sara', 'Hi, Sara', 'Hello, Hi', 'Error'], a: 0, why: "Passing `greeting=\"Hello\"` replaces the default \"Hi\"." },
    ],
    order: [
      { task: "Turn a list of articles into one string, one title per line.",
        lines: ['lines = []', 'for doc in docs:', '    lines.append(doc["title"])', 'text = "\\n".join(lines)', 'print(text)'] },
      { task: "Write a function that returns the first top_k titles.",
        lines: ['def first_titles(docs, top_k=2):', '    titles = [doc["title"] for doc in docs]', '    return titles[:top_k]', 'print(first_titles(news))'] },
    ],
    debug: [
      { task: "Collect every title.",
        code: py`
          titles = []
          for doc in docs:
              title = doc["title"]
          titles.append(title)`,
        line: 4, fix: '    titles.append(title)', why: "`append` isn't indented, so it runs once after the loop and only adds the last title. Indent it to put it inside the loop." },
      { task: "Print the article's title.",
        code: py`
          doc = {"title": "Storm in Nebraska"}
          print(f"Title: {doc[title]}")`,
        line: 2, fix: `print(f"Title: {doc['title']}")`, why: "Without quotes, `title` is read as a variable name, and there's no variable called title: `NameError`. Keys are strings, so they need quotes." },
      { task: "Glue the lines into one string.",
        code: py`
          lines = ["Title: A", "Title: B"]
          text = lines.join("\n")
          print(text)`,
        line: 2, fix: 'text = "\\n".join(lines)', why: "`join` belongs to the separator, not the list: `\"\\n\".join(lines)`. Lists don't have a join method." },
      { task: "Collect the titles.",
        code: py`
          titles = []
          for doc in docs:
              titles.append(None)
          print(titles)`,
        line: 3, fix: '    titles.append(doc["title"])', why: "The starter code's `None` placeholder is still there, so the list fills up with None. Replace it with the real value." },
    ],
    tools: [
      { q: "Get the value stored under `'url'` in `doc`.", o: ["doc['url']", 'doc.url', 'doc[url]', "doc('url')"], a: 0, why: "Dictionaries use square brackets with the key in quotes." },
      { q: "Turn a list of strings into one string, one per line.", o: ['"\\n".join(lines)', 'lines.join("\\n")', 'str(lines)', 'lines + "\\n"'], a: 0, why: "`str(lines)` would give you the brackets and quotes too." },
      { q: "Put a variable's value inside a string.", o: ['f"Title: {title}"', '"Title: {title}"', '"Title: " title', "'Title: ' - title"], a: 0, why: "Only an f-string fills in `{title}`." },
      { q: "Make a new list with one item for each item in another list, in one line.", o: ['A list comprehension: [x for x in items]', 'A dictionary', 'join', 'An f-string'], a: 0, prose: true, why: "That's exactly what a list comprehension is for." },
    ],
    tf: [
      { s: "`doc['title']` and `doc['Title']` look up the same key.", a: false, why: "Keys are case-sensitive." },
      { s: "Python lists start counting at 0.", a: true, why: "The first item is `items[0]`." },
      { s: "`\"Hi {name}\"` fills in the value of name.", a: false, why: "Only with an `f` in front: `f\"Hi {name}\"`." },
      { s: "Lines indented under `for` run once per item.", a: true, why: "Indentation is how Python knows what's inside the loop." },
      { s: "`\", \".join([\"a\", \"b\"])` gives `\"a, b\"`.", a: true, why: "The separator goes between the items." },
      { s: "`[d['title'] for d in docs]` does the same as a for loop with append.", a: true, why: "It's the one-line version of that loop." },
      { s: "Type hints like `query: str` make Python reject other types.", a: false, why: "They're notes for humans and tools. Python ignores them when running." },
      { s: "In `f(top_k=top_k)`, the left `top_k` is the parameter and the right one is your variable.", a: true, why: "They just happen to share a name." },
      { s: "`lines.append(x)` returns the new list.", a: false, why: "It changes the list in place and returns None." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm1-llm', title: 'Calling an LLM', file: 'llm_call.py',
    source: 'Ungraded Lab 2 · section 1',
    blurb: "Send a prompt, read the answer, and hold a conversation with a list of messages.",
    learn: [
      { h: "One prompt in, one answer out", p: "The course helper `generate_with_single_input` sends your prompt to an LLM and returns a dictionary. The answer's text is under `'content'`.",
        code: py`
          from utils import generate_with_single_input

          output = generate_with_single_input(prompt="What is the capital of France?")
          print(output["role"])
          print(output["content"])`,
        out: "assistant\nThe capital of France is **Paris**.",
        tip: "You never need to read `utils.py`. Treat it as a black box: prompt in, `{'role': ..., 'content': ...}` out." },
      { h: "Roles", p: "Every message has a **role**: `user` is the person asking, `assistant` is the model's reply, and `system` holds instructions that set how the model behaves. The answer always comes back with the role `assistant`.",
        code: py`
          {"role": "system", "content": "You answer in one short sentence."}
          {"role": "user", "content": "Who won the 2018 World Cup?"}
          {"role": "assistant", "content": "France won it."}` },
      { h: "A conversation is a list of messages", p: "`generate_with_multiple_input` takes the whole conversation as a list. The model has **no memory**: to ask a follow-up, you send every earlier message again.",
        code: py`
          messages = [
              {"role": "user", "content": "Who won the 2018 World Cup?"},
              {"role": "assistant", "content": "France won the 2018 World Cup."},
              {"role": "user", "content": "Who was the captain?"},
          ]
          output = generate_with_multiple_input(messages=messages, max_tokens=100)
          print(output["content"])`,
        out: "The captain was Hugo Lloris.",
        tip: "“Who was the captain?” only makes sense because the earlier messages are in the list." },
      { h: "Keeping the conversation going", p: "Append the model's reply, then your next question, and call again. That growing list is the chat history.",
        code: py`
          messages.append(output)   # the assistant's reply
          messages.append({"role": "user", "content": "Who scored in the final?"})
          output = generate_with_multiple_input(messages=messages)`,
        tip: "`output` already has the right shape, `{'role': 'assistant', 'content': ...}`, so you can append it as it is." },
      { h: "max_tokens: a length limit", p: "A **token** is a piece of a word, roughly ¾ of an English word on average. `max_tokens` caps how many tokens the model may write. If it hits the limit, the answer **stops mid-sentence**.",
        code: py`
          output = generate_with_single_input(
              prompt="Explain RAG in detail.",
              max_tokens=20,   # very short: the answer will be cut off
          )`,
        tip: "The course helper uses 500 by default." },
      { h: "The same call with the OpenAI library", p: "Together.ai uses the same API format as OpenAI, so the `openai` library works too. Its answer is an object, not a dictionary. The text is at `response.choices[0].message.content`.",
        code: py`
          response = client.chat.completions.create(
              model="Qwen/Qwen3.5-9B",
              messages=messages,
          )
          print(response.choices[0].message.content)`,
        tip: "Ignore the huge printed `ChatCompletion` object. That one path is all you need from it." },
    ],
    fill: [
      { code: py`print(output[{?}])   # just the answer text`, a: ['"content"'], why: "The dictionary has two keys: `'role'` and `'content'`. The text is under `'content'`." },
      { code: py`message = {"role": {?}, "content": "Who won the 2018 World Cup?"}   # the person asking`, a: ['"user"'], why: "The person asking is the `user`." },
      { code: py`message = {"role": {?}, "content": "Answer in one sentence."}   # rules for the whole chat`, a: ['"system"'], why: "System messages set how the model should behave." },
      { code: py`output = generate_with_single_input(prompt="Hi", {?}=50)   # at most 50 tokens`, a: ['max_tokens'], why: "`max_tokens` limits the length of the answer." },
      { code: py`print(response.choices[0].message.{?})`, a: ['content'], why: "With the OpenAI library you go through attributes: `choices[0].message.content`." },
      { code: py`messages.{?}(output)   # add the reply to the history`, a: ['append'], why: "The history is a list, so you `append` each new message." },
    ],
    output: [
      { code: py`
          output = {"role": "assistant", "content": "Paris"}
          print(output["content"])`, o: ['Paris', 'assistant', "{'role': 'assistant', 'content': 'Paris'}", 'content'], a: 0, why: "`output[\"content\"]` is just the text." },
      { code: py`
          messages = [
              {"role": "user", "content": "Hi"},
              {"role": "assistant", "content": "Hello!"},
          ]
          messages.append({"role": "user", "content": "How are you?"})
          print(len(messages))`, o: ['3', '2', '1', '4'], a: 0, why: "Two messages plus the one you appended." },
      { code: py`
          messages = [
              {"role": "system", "content": "Be brief."},
              {"role": "user", "content": "Hi"},
          ]
          print(messages[-1]["role"])`, o: ['user', 'system', 'assistant', 'Hi'], a: 0, why: "`[-1]` is the last item, and its role is `user`." },
      { code: py`
          output = {"role": "assistant", "content": "France won."}
          print(output)`, o: ["{'role': 'assistant', 'content': 'France won.'}", 'France won.', 'assistant: France won.', 'Error'], a: 0, why: "Printing the whole dictionary shows its keys too. Use `output['content']` for just the text." },
      { code: py`
          messages = []
          for q in ["Who won?", "Who scored?"]:
              messages.append({"role": "user", "content": q})
          print([m["content"] for m in messages])`, o: ["['Who won?', 'Who scored?']", "['Who scored?']", "['user', 'user']", '[]'], a: 0, why: "Each loop step appends one message; the comprehension then collects each message's content." },
    ],
    order: [
      { task: "Ask a question, then a follow-up that depends on the answer.",
        lines: ['messages = [{"role": "user", "content": "Who won the 2018 World Cup?"}]', 'output = generate_with_multiple_input(messages=messages)', 'messages.append(output)', 'messages.append({"role": "user", "content": "Who was the captain?"})', 'output = generate_with_multiple_input(messages=messages)', 'print(output["content"])'] },
      { task: "Send one prompt and print only the answer text.",
        lines: ['from utils import generate_with_single_input', 'prompt = "What is RAG?"', 'output = generate_with_single_input(prompt=prompt)', 'print(output["content"])'] },
    ],
    debug: [
      { task: "Print only the model's answer.",
        code: py`
          output = generate_with_single_input(prompt="What is RAG?")
          print(output["answer"])`,
        line: 2, fix: 'print(output["content"])', why: "The dictionary only has `'role'` and `'content'`, so `'answer'` raises `KeyError`." },
      { task: "Ask a follow-up question about the same team.",
        code: py`
          messages = [{"role": "user", "content": "Who won the 2018 World Cup?"}]
          output = generate_with_multiple_input(messages=messages)
          messages = [{"role": "user", "content": "Who was the captain?"}]
          output = generate_with_multiple_input(messages=messages)`,
        line: 3, fix: 'messages += [output, {"role": "user", "content": "Who was the captain?"}]', why: "This replaces the history instead of adding to it, so the model never sees the first question and doesn't know which team you mean. Send the whole conversation." },
      { task: "Print the answer from the OpenAI library.",
        code: py`
          response = client.chat.completions.create(model="Qwen/Qwen3.5-9B", messages=messages)
          print(response["content"])`,
        line: 2, fix: 'print(response.choices[0].message.content)', why: "The OpenAI library returns an object, not a dictionary. The text is at `response.choices[0].message.content`." },
    ],
    tools: [
      { q: "Ask one question that needs no chat history.", o: ['generate_with_single_input(prompt)', 'generate_with_multiple_input(messages)', 'retrieve(query)', 'print(prompt)'], a: 0, why: "One prompt, one answer: the single-input helper is the simplest fit." },
      { q: "Continue a chat where the new question depends on earlier answers.", o: ['generate_with_multiple_input with the full message list', 'generate_with_single_input with just the new question', 'A bigger max_tokens', 'A different model'], a: 0, prose: true, why: "The model has no memory, so the earlier messages must be sent again." },
      { q: "The answers keep stopping mid-sentence.", o: ['Raise max_tokens', 'Lower max_tokens', 'Change the role to system', 'Add more messages'], a: 0, why: "The model hit its token limit." },
      { q: "Make the model answer in one sentence for the whole chat.", o: ['A message with the role "system"', 'A message with the role "assistant"', 'max_tokens=1', 'A longer question'], a: 0, prose: true, why: "System messages set the rules. `max_tokens` would just cut the answer off." },
    ],
    tf: [
      { s: "The model remembers your earlier calls by itself.", a: false, why: "Each call starts from nothing. History only exists if you send it." },
      { s: "`generate_with_single_input` returns a dictionary with `'role'` and `'content'`.", a: true, why: "That's all it returns." },
      { s: "The model's reply comes back with the role `\"assistant\"`.", a: true, why: "`user` is you, `assistant` is the model." },
      { s: "A token is always exactly one word.", a: false, why: "Tokens are pieces of words. A long word can be several tokens." },
      { s: "If the answer reaches `max_tokens`, it gets cut off.", a: true, why: "The model stops writing at the limit, even mid-sentence." },
      { s: "With the OpenAI library, the text is at `response.choices[0].message.content`.", a: true, why: "The answer is an object, so you use dots and an index." },
      { s: "A system message is the model's answer.", a: false, why: "It's the instructions. The answer is the assistant message." },
      { s: "Together.ai works with the OpenAI library because its API uses the same format.", a: true, why: "It's “OpenAI compatible”: same requests, same responses." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm1-augment', title: 'Augmented prompts', file: 'augment.py',
    source: 'Ungraded Lab 2 · section 2',
    blurb: "Turn your data into text, put it in a prompt, and see how much the answer changes.",
    learn: [
      { h: "LLMs only read text", p: "Your data is usually a list of dictionaries, but the model can't read Python objects. Step one of augmenting a prompt is always **turning the data into text**.",
        code: py`
          house_data = [
              {"address": "123 Maple Street", "bedrooms": 3, "price": 230000},
              {"address": "456 Elm Avenue", "bedrooms": 4, "price": 320000},
          ]` },
      { h: "A layout function", p: "Loop over the items and write **one line per item** with an f-string. The `\\n` at the end of each line keeps the items apart, so they don't blur together for the model.",
        code: py`
          def house_info_layout(houses):
              layout = ""
              for house in houses:
                  layout += (f"House at {house['address']} with "
                             f"{house['bedrooms']} bedrooms, "
                             f"priced at {house['price']}.\n")
              return layout

          print(house_info_layout(house_data))`,
        out: "House at 123 Maple Street with 3 bedrooms, priced at 230000.\nHouse at 456 Elm Avenue with 4 bedrooms, priced at 320000.",
        tip: "`layout += text` means `layout = layout + text`: add to the end. Strings side by side inside `( )` are glued into one." },
      { h: "The prompt template", p: "Almost every RAG prompt has three parts: an **instruction** (what to do), the **context** (your data) and the **query** (the question).",
        code: py`
          def generate_prompt(query, houses):
              houses_layout = house_info_layout(houses)
              prompt = f"""
          Use the following houses information to answer users queries.
          {houses_layout}
          Query: {query}
          """
              return prompt`,
        tip: "Triple quotes let a string span several lines." },
      { h: "Without vs with the context", p: "Ask the same question twice. **Without** the house data, the model has never heard of these houses, so it guesses or says it can't know. **With** it, the answer is easy: 456 Elm Avenue is the most expensive.",
        code: py`
          query = "What is the most expensive house?"

          plain = generate_with_single_input(prompt=query)
          augmented = generate_with_single_input(prompt=generate_prompt(query, house_data))

          print(augmented["content"])`,
        out: "The most expensive house is 456 Elm Avenue, priced at $320,000.",
        tip: "Same model, same question. The only difference is what it was given to read. (The lab sends the augmented prompt with `role='assistant'`; normally it would be `'user'`. Try both.)" },
      { h: "Pass only what's relevant", p: "`generate_prompt` accepts **any** list of houses. With 2 houses you can pass them all. With 50,000 you can't: the prompt would be far too long, slow and expensive. Picking the few that matter is the **retriever's** job.",
        code: py`
          cheap = [h for h in house_data if h["price"] < 300000]
          prompt = generate_prompt("Which house is under 300k?", cheap)`,
        tip: "Every LLM has a **context window**: a limit on how much text fits in one prompt." },
      { h: "The instruction changes the answer", p: "The instruction decides how the model uses the context. “Use **only** this information” keeps it to your data. “Add this to what you know” lets it mix in its own knowledge, which is what the assignment's default prompt does.",
        code: py`
          strict = (
              "Answer using ONLY the information below. "
              "If it isn't there, say you don't know.\n"
              f"{houses_layout}\n"
              f"Query: {query}"
          )` },
    ],
    fill: [
      { code: py`
          layout = ""
          for house in houses:
              layout {?} f"{house['address']}\n"   # add to the end`, a: ['+='], why: "`+=` adds to the string. `=` would replace it each time." },
      { code: py`line = f"House at {house[{?}]}"   # the street address`, a: ["'address'"], why: "The address is stored under the key `'address'`." },
      { code: py`
          prompt = f"""
          Use the following houses information to answer users queries.
          {houses_layout}
          Query: {{?}}
          """`, a: ['query'], why: "The question goes at the end, after the context." },
      { code: py`cheap = [h for h in house_data if h["price"] {?} 300000]   # houses under 300k`, a: ['<'], why: "The `if` keeps only the houses that pass the test." },
      { code: py`
          def house_info_layout(houses):
              layout = ""
              for house in houses:
                  layout += f"{house['address']}\n"
              {?} layout`, a: ['return'], why: "`return` hands the finished text back to whoever called the function." },
      { code: py`augmented = generate_with_single_input(prompt=generate_prompt(query, {?}))   # pass the data in`, a: ['house_data'], why: "`generate_prompt` needs the question and the list of houses." },
    ],
    output: [
      { code: py`
          houses = [{"address": "1 Oak St", "price": 100}, {"address": "2 Elm St", "price": 200}]
          layout = ""
          for h in houses:
              layout += f"{h['address']}: {h['price']}\n"
          print(layout)`, o: ['1 Oak St: 100\n2 Elm St: 200', '1 Oak St: 100 2 Elm St: 200', '2 Elm St: 200', "{h['address']}: {h['price']}"], a: 0, why: "`+=` keeps adding lines, and each `\\n` starts a new one." },
      { code: py`
          query = "Cheapest house?"
          context = "1 Oak St: 100"
          prompt = f"Context: {context}\nQuery: {query}"
          print(prompt)`, o: ['Context: 1 Oak St: 100\nQuery: Cheapest house?', 'Context: {context}\nQuery: {query}', 'Query: Cheapest house?\nContext: 1 Oak St: 100', 'Context: 1 Oak St: 100 Query: Cheapest house?'], a: 0, why: "The f-string fills both values, and `\\n` puts the query on its own line." },
      { code: py`
          houses = [{"address": "A", "price": 230}, {"address": "B", "price": 320}, {"address": "C", "price": 150}]
          cheap = [h["address"] for h in houses if h["price"] < 300]
          print(cheap)`, o: ["['A', 'C']", "['B']", "['A', 'B', 'C']", '[230, 150]'], a: 0, why: "The `if` keeps houses under 300, and the comprehension collects their addresses." },
      { code: py`
          layout = ""
          layout += "a"
          layout += "b"
          print(layout)`, o: ['ab', 'b', 'a', 'a b'], a: 0, why: "Each `+=` adds to the end, with no space unless you add one." },
      { code: py`
          template = "Query: {query}\nDocs: {documents}"
          print(template.format(query="Storms?", documents="Tornado in Nebraska"))`, o: ['Query: Storms?\nDocs: Tornado in Nebraska', 'Query: {query}\nDocs: {documents}', 'Storms?\nTornado in Nebraska', 'Error'], a: 0, why: "`.format()` fills `{query}` and `{documents}` by name, like an f-string you fill in later. The assignment's custom prompt box works this way." },
    ],
    order: [
      { task: "Build an augmented prompt from the house data and ask the LLM.",
        lines: ['query = "What is the most expensive house?"', 'houses_layout = house_info_layout(house_data)', 'prompt = f"Use this information:\\n{houses_layout}\\nQuery: {query}"', 'output = generate_with_single_input(prompt=prompt)', 'print(output["content"])'],
        alts: [[1, 0, 2, 3, 4]] },
      { task: "Write the layout function.",
        lines: ['def house_info_layout(houses):', '    layout = ""', '    for house in houses:', `        layout += f"{house['address']}, {house['price']}\\n"`, '    return layout'] },
    ],
    debug: [
      { task: "Put every house in the layout, one per line.",
        code: py`
          def house_info_layout(houses):
              layout = ""
              for house in houses:
                  layout = f"{house['address']}\n"
              return layout`,
        line: 4, fix: `        layout += f"{house['address']}\\n"`, why: "`=` replaces the string every time, so only the last house survives. `+=` adds to it." },
      { task: "Build the prompt with the data in it.",
        code: py`
          houses_layout = house_info_layout(house_data)
          prompt = f"""
          Use the following houses information to answer users queries.
          houses_layout
          Query: {query}
          """`,
        line: 4, fix: '{houses_layout}', why: "Without `{ }`, the f-string writes the word houses_layout instead of the data." },
      { task: "Return the layout for all the houses.",
        code: py`
          def house_info_layout(houses):
              layout = ""
              for house in houses:
                  layout += f"{house['address']}\n"
                  return layout`,
        line: 5, fix: '    return layout', why: "`return` is inside the loop, so the function stops after the first house. Unindent it so it runs after the loop." },
    ],
    tools: [
      { q: "You want the model to answer only from your data, and admit when it doesn't know.", o: ['Say so in the instruction: “Use ONLY the information below. If it isn\'t there, say you don\'t know.”', 'Raise max_tokens', 'Remove the query from the prompt', 'Send the data in a separate call'], a: 0, prose: true, why: "The instruction controls how the model uses the context." },
      { q: "You have 50,000 houses and a question about one neighbourhood.", o: ['Retrieve the relevant few and put only those in the prompt', 'Put all 50,000 in the prompt', 'Ask without any data', 'Make 50,000 separate calls'], a: 0, prose: true, why: "That's the reason retrievers exist: the context window can't hold everything." },
      { q: "Fill named placeholders `{query}` and `{documents}` in a template written earlier.", o: ['template.format(query=q, documents=d)', 'template.join(q, d)', 'f"{template}"', 'template + q + d'], a: 0, why: "`.format()` fills placeholders by name." },
      { q: "Write a string that spans several lines.", o: ['Triple quotes: """ ... """', 'A list', 'Square brackets', 'A dictionary'], a: 0, prose: true, why: "Triple-quoted strings can contain line breaks." },
    ],
    tf: [
      { s: "An LLM can read a Python list of dictionaries directly.", a: false, why: "It only reads text, so you format the data into a string first." },
      { s: "Augmenting a prompt means adding extra information to it.", a: true, why: "That's the A in RAG." },
      { s: "A typical RAG prompt has an instruction, the context and the query.", a: true, why: "What to do, what to use, and what was asked." },
      { s: "Putting your whole database in every prompt is a good idea.", a: false, why: "It doesn't fit the context window, and it's slow and expensive. Retrieve the relevant parts." },
      { s: "Normally, a prompt you write is sent with the role `\"user\"`.", a: true, why: "The lab used `'assistant'` for the augmented prompt, but `'user'` is the usual choice." },
      { s: "`layout += text` adds text to the end of layout.", a: true, why: "It's short for `layout = layout + text`." },
      { s: "`template.format(query=q)` fills the `{query}` placeholder.", a: true, why: "Placeholders are filled by name." },
      { s: "Once a prompt has context, the model can't hallucinate anymore.", a: false, why: "Less likely, not impossible." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm1-retrieve', title: 'Retrieval', file: 'retrieve.py',
    source: 'Module 1 assignment · sections 3.1 to 3.3',
    blurb: "Find the documents that match a question: indices, `top_k`, and searching by meaning.",
    learn: [
      { h: "The retriever's job", p: "Given a **query**, return the documents most relevant to it. In the assignment, `retrieve(query, top_k)` doesn't return documents: it returns their **positions** (indices) in `NEWS_DATA`.",
        code: py`
          indices = retrieve("Concerts in North America", top_k=1)
          print(indices)`,
        out: "[350]" },
      { h: "From indices to documents", p: "`query_news` takes those positions and pulls out the actual articles. It's one list comprehension: **for each index, collect `NEWS_DATA[index]`**.",
        code: py`
          def query_news(indices):
              return [NEWS_DATA[index] for index in indices]

          docs = query_news([3, 6, 9])
          print(len(docs))`,
        out: "3",
        tip: "Like a library catalogue: `retrieve` gives you shelf numbers, `query_news` fetches the books." },
      { h: "top_k: how many to fetch", p: "`top_k` is how many documents come back, best match first. Too few and you might miss the answer. Too many and the prompt fills with noise, gets longer and costs more.",
        code: py`
          retrieve("storms in the US", top_k=1)   # just the best match
          retrieve("storms in the US", top_k=5)   # the 5 best, best first`,
        tip: "The assignment uses `top_k=5` by default." },
      { h: "Searching by meaning: embeddings", p: "An **embedding model** turns text into a list of numbers called a **vector**. Texts with similar meanings get similar vectors, so the retriever can rank documents by how close their vectors are to the query's. The assignment loads one called `BAAI/bge-base-en-v1.5`: that's what all those loading messages were.",
        code: py`
          vec = model.encode("Large tornado seen in Nebraska")
          print(len(vec))   # bge-base gives 768 numbers per text`,
        out: "768",
        tip: "Think of a vector as coordinates on a map of meaning: “tornado” and “severe storm” land close together. How the retriever measures closeness is Module 2." },
      { h: "Meaning, not matching words", p: "Searching “Concerts in North America” returned an article about bands losing money on tour. It never says “concert”, but “tour” and “live music” mean something close. That's **semantic search**. A plain keyword search would have missed it.",
        tip: "It isn't perfect: that article was mostly about UK bands. The retriever returns what's **closest**, not what's **correct**." },
      { h: "One function for both steps", p: "Exercise 1 joins the two steps: query in, documents out. That's the **R** in RAG.",
        code: py`
          def get_relevant_data(query: str, top_k: int = 5) -> list[dict]:
              relevant_indices = retrieve(query, top_k=top_k)
              relevant_data = query_news(relevant_indices)
              return relevant_data` },
    ],
    fill: [
      { code: py`indices = retrieve("storms", {?}=3)   # the 3 best matches`, a: ['top_k'], why: "`top_k` sets how many documents come back." },
      { code: py`
          def query_news(indices):
              return [NEWS_DATA[index] for index in {?}]`, a: ['indices'], why: "Loop over the indices you were given." },
      { code: py`
          relevant_indices = retrieve(query, top_k=top_k)
          relevant_data = {?}(relevant_indices)   # numbers → articles`, a: ['query_news'], why: "`query_news` turns positions into the actual articles." },
      { code: py`vec = model.{?}("Large tornado seen in Nebraska")   # text → vector`, a: ['encode'], why: "Embedding models from `sentence_transformers` use `encode`." },
      { code: py`docs = get_relevant_data("AI news", top_k={?})   # only the single best article`, a: ['1'], why: "`top_k=1` returns just the best match." },
    ],
    output: [
      { code: py`
          NEWS_DATA = ["storm", "election", "AI", "sport"]
          indices = [2, 0]
          print([NEWS_DATA[i] for i in indices])`, o: ["['AI', 'storm']", "['storm', 'AI']", "['election', 'storm']", '[2, 0]'], a: 0, why: "The order follows the indices: best match first, as the retriever returned them." },
      { code: py`
          scores = {"storm": 0.91, "concert": 0.12, "tornado": 0.88}
          ranked = sorted(scores, key=scores.get, reverse=True)
          print(ranked[:2])`, o: ["['storm', 'tornado']", "['concert', 'tornado']", "['storm', 'concert']", '[0.91, 0.88]'], a: 0, why: "That's ranking: sort by score, highest first (`reverse=True`), and keep the top 2. A retriever does the same with similarity scores." },
      { code: py`
          def get_docs(query, top_k=5):
              return list(range(top_k))

          print(get_docs("storms"))
          print(get_docs("storms", top_k=2))`, o: ['[0, 1, 2, 3, 4]\n[0, 1]', '[0, 1]\n[0, 1]', '[0, 1, 2, 3, 4, 5]\n[0, 1, 2]', 'Error'], a: 0, why: "Without `top_k` the default 5 is used; passing `top_k=2` overrides it." },
    ],
    order: [
      { task: "Find the 3 most relevant articles and print their titles.",
        lines: ['indices = retrieve("AI breakthroughs", top_k=3)', 'docs = query_news(indices)', 'for doc in docs:', '    print(doc["title"])'] },
      { task: "Write get_relevant_data.",
        lines: ['def get_relevant_data(query, top_k=5):', '    relevant_indices = retrieve(query, top_k=top_k)', '    relevant_data = query_news(relevant_indices)', '    return relevant_data'] },
    ],
    debug: [
      { task: "Return the 5 most relevant articles.",
        code: py`
          def get_relevant_data(query, top_k=5):
              relevant_indices = retrieve(query, top_k=top_k)
              return relevant_indices`,
        line: 3, fix: '    return query_news(relevant_indices)', why: "This returns positions like `[350, 12, 88]`, not articles. Turn them into documents with `query_news`." },
      { task: "Retrieve the 5 best matches.",
        code: py`
          query = "Greatest storms in the US"
          indices = retrieve(query, top_k="5")`,
        line: 2, fix: 'indices = retrieve(query, top_k=5)', why: "`\"5\"` in quotes is text, not a number. `top_k` must be an int." },
      { task: "Get the articles for these indices.",
        code: py`
          indices = retrieve("storms", top_k=2)
          docs = [NEWS_DATA for index in indices]`,
        line: 2, fix: 'docs = [NEWS_DATA[index] for index in indices]', why: "This collects the whole dataset once per index. You want the article **at** each index: `NEWS_DATA[index]`." },
    ],
    tools: [
      { q: "Your answers miss information that's spread over several articles.", o: ['Raise top_k', 'Lower top_k to 1', 'Raise max_tokens', 'Remove the query'], a: 0, why: "More retrieved documents means more of the needed information reaches the prompt." },
      { q: "Turn a sentence into a vector.", o: ['An embedding model: model.encode(text)', 'An f-string', 'query_news', 'max_tokens'], a: 0, prose: true, why: "Embedding models map text to vectors that capture its meaning." },
      { q: "Find articles about concerts that only use words like “tour” and “live music”.", o: ['Semantic search with embeddings', 'Keyword search for “concert”', 'A bigger LLM', 'Sorting by date'], a: 0, prose: true, why: "Semantic search matches meaning, so different words with the same meaning still match." },
    ],
    tf: [
      { s: "`retrieve` in the assignment returns the documents themselves.", a: false, why: "It returns their indices. `query_news` turns those into documents." },
      { s: "`top_k=3` returns the 3 best matches.", a: true, why: "Best match first." },
      { s: "An embedding is a list of numbers that represents what a text means.", a: true, why: "Similar meanings get similar vectors." },
      { s: "Semantic search only finds documents that contain the exact words of the query.", a: false, why: "That's keyword search. Semantic search matches meaning." },
      { s: "The retriever always returns the right document.", a: false, why: "It returns the closest ones by its measure, which can still be off." },
      { s: "A bigger `top_k` is always better.", a: false, why: "More documents means more noise, a longer prompt and higher cost." },
      { s: "The `BertModel LOAD REPORT` messages in the assignment mean something is broken.", a: false, why: "That's the embedding model loading. The note itself says the UNEXPECTED key can be ignored." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm1-pipeline', title: 'Your first RAG pipeline', file: 'rag.py',
    source: 'Module 1 assignment · sections 3.4 to 4',
    blurb: "The assignment from start to finish: retrieve, format, build the prompt, call the LLM, and compare with and without RAG.",
    learn: [
      { h: "The whole pipeline", p: "Every RAG system follows the same four steps. You've now seen or written every one of them.",
        code: py`
          relevant_data = get_relevant_data(query, top_k=5)       # 1. retrieve
          formatted = format_relevant_data(relevant_data)         # 2. format
          prompt = f"Query: {query}\n2024 News: {formatted}"      # 3. augment
          answer = generate_with_single_input(prompt)["content"]  # 4. generate` },
      { h: "Formatting the documents", p: "Exercise 2: one block of text per article with its **title, description, date and URL**. It's the house layout again: loop, f-string, append, join.",
        code: py`
          def format_relevant_data(relevant_data):
              formatted_documents = []
              for document in relevant_data:
                  formatted_document = (
                      f"Title: {document['title']}, "
                      f"Description: {document['description']}, "
                      f"Published at: {document['published_at']}\n"
                      f"URL: {document['url']}"
                  )
                  formatted_documents.append(formatted_document)
              return "\n".join(formatted_documents)`,
        tip: "Both lines inside the loop must be indented the same. If `append` sits at the level of `for`, only the last article survives." },
      { h: "What the model actually reads", p: "Run the format function on one article and you get plain text the model can use. Including the **URL** lets the model say where its answer came from.",
        code: py`
          doc = {"title": "Large tornado seen touching down in Nebraska",
                 "description": "Severe storms moved across several US states.",
                 "published_at": "2024-04-26",
                 "url": "https://www.bbc.co.uk/news/world-us-canada-68860070"}
          print(format_relevant_data([doc]))`,
        out: "Title: Large tornado seen touching down in Nebraska, Description: Severe storms moved across several US states., Published at: 2024-04-26\nURL: https://www.bbc.co.uk/news/world-us-canada-68860070" },
      { h: "Building the final prompt", p: "`generate_final_prompt` puts it together. With `use_rag=False` it returns just the query, so you can compare. The default instruction tells the model to **add** the 2024 news to what it already knows.",
        code: py`
          def generate_final_prompt(query, top_k=5, use_rag=True, prompt=None):
              if not use_rag:
                  return query
              relevant_data = get_relevant_data(query, top_k=top_k)
              retrieve_data_formatted = format_relevant_data(relevant_data)
              if prompt is None:
                  prompt = (f"Answer the user query below. ... "
                            f"Query: {query}\n"
                            f"2024 News: {retrieve_data_formatted}")
              else:
                  prompt = prompt.format(query=query, documents=retrieve_data_formatted)
              return prompt`,
        tip: "`prompt=None` means “no custom prompt was given, so use the default”." },
      { h: "Custom prompt templates", p: "Pass your own template with `{query}` and `{documents}` placeholders, and `.format()` fills them in. That's what the prompt box in the assignment's experiment widget does.",
        code: py`
          template = """Answer using ONLY these articles. If the answer isn't in them, say "I don't know."

          Articles:
          {documents}

          Question: {query}"""

          prompt = generate_final_prompt("What happened in Nebraska?", prompt=template)`,
        tip: "No `f` before the template on purpose: the `{ }` stay as placeholders until `.format()` fills them." },
      { h: "Calling the LLM and comparing", p: "`llm_call` builds the prompt and sends it. The assignment's model was trained up to December 2023, so **without RAG** it can't know 2024 events, and **with RAG** it answers from the retrieved news.",
        code: py`
          query = "Tell me about the US GDP in the past 3 years."
          print(llm_call(query, use_rag=True))    # uses the 2024 news
          print(llm_call(query, use_rag=False))   # memory only, stops at 2023` },
      { h: "Experiments worth running", p: "Change one thing at a time and compare the answers: `top_k=1` against `top_k=10`, the default prompt against an “only use these articles” prompt, and a question the news can't answer. Watching what changes is how you build intuition for RAG." },
    ],
    fill: [
      { code: py`formatted_documents = {?}   # start with an empty list`, a: ['[]', 'list()'], why: "An empty list to collect one string per article." },
      { code: py`line = f"Published at: {document[{?}]}"`, a: ["'published_at'"], why: "The date is stored under `'published_at'`, with an underscore." },
      { code: py`
          if not {?}:
              return query   # no retrieval: just the question`, a: ['use_rag'], why: "With `use_rag=False` the prompt is only the query, for comparison." },
      { code: py`prompt = prompt.{?}(query=query, documents=retrieve_data_formatted)`, a: ['format'], why: "`.format()` fills the template's placeholders by name." },
      { code: py`generated_message = generated_response[{?}]   # just the text`, a: ["'content'"], why: "The LLM helper returns `{'role': ..., 'content': ...}`." },
      { code: py`print(llm_call(query, use_rag={?}))   # memory only, no retrieved news`, a: ['False'], why: "The boolean `False`, without quotes." },
    ],
    output: [
      { code: py`
          docs = [{"title": "A", "url": "a.com"}, {"title": "B", "url": "b.com"}]
          lines = [f"{d['title']} ({d['url']})" for d in docs]
          print("\n".join(lines))`, o: ['A (a.com)\nB (b.com)', 'A (a.com) B (b.com)', "['A (a.com)', 'B (b.com)']", 'A\nB'], a: 0, why: "One formatted line per document, then `join` puts each on its own line." },
      { code: py`
          def final_prompt(query, use_rag=True):
              if not use_rag:
                  return query
              return f"Docs: ...\nQuery: {query}"

          print(final_prompt("Storms?", use_rag=False))`, o: ['Storms?', 'Docs: ...\nQuery: Storms?', 'None', 'Error'], a: 0, why: "With `use_rag=False` the function returns early with just the query." },
      { code: py`
          template = "Q: {query} | D: {documents}"
          print(template.format(documents="tornado", query="storms?"))`, o: ['Q: storms? | D: tornado', 'Q: tornado | D: storms?', 'Q: {query} | D: {documents}', 'Error'], a: 0, why: "`.format()` matches by name, so the order of the arguments doesn't matter." },
      { code: py`
          prompt = None
          if prompt is None:
              prompt = "default prompt"
          print(prompt)`, o: ['default prompt', 'None', 'Error', 'prompt'], a: 0, why: "This is how `generate_final_prompt` picks the default when no custom prompt is given." },
      { code: py`
          docs = [{"published_at": "2024-04-25"}, {"published_at": "2023-11-02"}]
          cutoff = "2023-12-31"
          new = [d["published_at"] for d in docs if d["published_at"] > cutoff]
          print(new)`, o: ["['2024-04-25']", "['2023-11-02']", "['2024-04-25', '2023-11-02']", '[]'], a: 0, why: "Dates written as YYYY-MM-DD compare correctly as text. Only the 2024 article is news to a model trained up to December 2023." },
    ],
    order: [
      { task: "Write format_relevant_data.",
        lines: ['def format_relevant_data(relevant_data):', '    formatted_documents = []', '    for document in relevant_data:', `        formatted_document = f"Title: {document['title']}, URL: {document['url']}"`, '        formatted_documents.append(formatted_document)', '    return "\\n".join(formatted_documents)'] },
      { task: "Run the whole pipeline for one query.",
        lines: ['query = "What happened in Nebraska?"', 'relevant_data = get_relevant_data(query, top_k=5)', 'formatted = format_relevant_data(relevant_data)', 'prompt = f"Query: {query}\\nNews: {formatted}"', 'answer = generate_with_single_input(prompt)["content"]', 'print(answer)'] },
    ],
    debug: [
      { task: "Collect every formatted article.",
        code: py`
          formatted_documents = []
          for document in relevant_data:
              formatted_document = f"Title: {document['title']}"
          formatted_documents.append(formatted_document)`,
        line: 4, fix: '    formatted_documents.append(formatted_document)', why: "Outside the loop, `append` runs once, so only the last article reaches the prompt. Indent it." },
      { task: "Append each formatted article.",
        code: py`
          formatted_documents = []
          for document in relevant_data:
              formatted_document = f"Title: {document['title']}"
              formatted_documents.append(None)
          text = "\n".join(formatted_documents)`,
        line: 4, fix: '    formatted_documents.append(formatted_document)', why: "The starter code's `None` is still there. `join` can't glue None into a string, so it crashes with `TypeError`." },
      { task: "Fill the custom prompt template.",
        code: py`
          template = "Question: {query}\nArticles: {documents}"
          prompt = template.format(query=query)`,
        line: 2, fix: 'prompt = template.format(query=query, documents=formatted)', why: "Every placeholder needs a value. Leaving out `documents` raises `KeyError: 'documents'`." },
      { task: "Get the answer without RAG, for comparison.",
        code: py`
          query = "What happened in Nebraska in April 2024?"
          with_rag = llm_call(query, use_rag=True)
          without_rag = llm_call(query, use_rag="False")`,
        line: 3, fix: 'without_rag = llm_call(query, use_rag=False)', why: "`\"False\"` in quotes is a non-empty string, and Python treats any non-empty string as true. So RAG stays on. Use the boolean `False`." },
    ],
    tools: [
      { q: "The model doesn't say where its information came from.", o: ["Include each article's URL in the formatted text and ask it to cite", 'Set top_k to 0', 'Remove the titles', 'Use use_rag=False'], a: 0, prose: true, why: "It can only cite what it was given, so give it the URLs and ask." },
      { q: "Measure how much RAG helps for a question.", o: ['Run llm_call with use_rag=True and use_rag=False and compare', 'Run it once with RAG', 'Raise max_tokens', 'Read utils.py'], a: 0, prose: true, why: "The same question with and without the documents shows exactly what retrieval added." },
      { q: "Use your own prompt wording in the assignment.", o: ['Pass a template with {query} and {documents} as prompt=', 'Edit utils.py', 'Change top_k', 'Rename the query variable'], a: 0, prose: true, why: "`generate_final_prompt` fills your template with `.format()`." },
      { q: "The model mixes in old, wrong facts instead of using the 2024 news.", o: ['Tell it to answer only from the provided articles', 'Use use_rag=False', 'Lower top_k to 1', 'Delete the URLs'], a: 0, prose: true, why: "The default prompt invites it to mix in its own knowledge. A stricter instruction stops that." },
    ],
    tf: [
      { s: "`format_relevant_data` returns one string, not a list.", a: true, why: "`\"\\n\".join(...)` turns the list into a single string." },
      { s: "With `use_rag=False`, the prompt is just the query.", a: true, why: "That's the no-RAG baseline you compare against." },
      { s: "The assignment's default prompt tells the model to use only the 2024 news.", a: false, why: "It tells the model to add the news to its own knowledge." },
      { s: "`use_rag=\"False\"`, in quotes, turns RAG off.", a: false, why: "A non-empty string counts as true." },
      { s: "If a template has `{query}` and `{documents}`, `.format()` needs both.", a: true, why: "A missing one raises `KeyError`." },
      { s: "The grader also runs new cells you add to the notebook.", a: false, why: "Only the provided graded cells count. Your own cells are ignored." },
      { s: "Without RAG, the assignment's model can't know about 2024 events.", a: true, why: "Its training data ends in December 2023." },
      { s: "Strings placed side by side inside `( )` are glued into one string.", a: true, why: "Python joins neighbouring string literals automatically." },
    ],
  },

  ],
});
