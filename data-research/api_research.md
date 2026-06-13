# LensShift - API Documentation

## APIs We Use

We use 3 APIs in LensShift:

1. Groq API - for AI/LLM responses
2. DuckDuckGo API - for search results
3. Hacker News API - for tech discussions

---

## 1. Groq API

**Purpose:** Generates opposing viewpoints using AI

**URL:** https://api.groq.com/openai/v1/chat/completions

**Auth:** Needs API key (free signup at https://console.groq.com)

**Model to use:** llama3-8b-8192 (very fast)

**Speed:** Under 1 second

**Rate Limit:** 30 requests per minute (free tier)

**Example Code:**

    from groq import Groq
    client = Groq(api_key="YOUR_KEY")
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": "your query"}]
    )

---

## 2. DuckDuckGo API

**Purpose:** Get search results without tracking

**URL:** https://api.duckduckgo.com/

**Auth:** No API key needed! Free to use.

**Speed:** Under 2 seconds

**Rate Limit:** No hard limit, but be respectful

**Easiest Way - Use Python Library:**

    pip install duckduckgo-search

    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        results = list(ddgs.text("python", max_results=5))

---

## 3. Hacker News API

**Purpose:** Get tech discussions and comments

**URL:** https://hn.algolia.com/api/v1/search

**Auth:** No API key needed! Free to use.

**Speed:** Under 1 second

**Rate Limit:** Very generous, no issues

**Example Code:**

    import httpx
    response = httpx.get(
        "https://hn.algolia.com/api/v1/search",
        params={"query": "python", "tags": "story"}
    )
    data = response.json()

---

## Summary Table

| API | API Key Needed? | Speed |
|-----|-----------------|-------|
| Groq | YES | Fast |
| DuckDuckGo | NO | Medium |
| Hacker News | NO | Fast |

---

## Environment Variables

Only ONE API key needed. Create a .env file:

    GROQ_API_KEY=your_key_here

Never commit .env file to GitHub!

---

## Backup Plans

- If Groq fails: Use OpenAI as backup
- If DuckDuckGo fails: Use Brave Search
- If Hacker News fails: Use Reddit JSON API

---

## Python Packages Needed

Add to requirements.txt:

    fastapi
    uvicorn
    httpx
    groq
    duckduckgo-search
    python-dotenv

---

## Why These 3 Work Together

- Groq gives AI perspective
- DuckDuckGo gives unbiased search
- Hacker News gives real human discussions

Together they break the filter bubble!

---

End of Documentation