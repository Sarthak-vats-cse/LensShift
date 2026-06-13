# LensShift: The Human Web

**Break out of the algorithmic bubble. Discover the human perspective.**

LensShift is an anti-algorithm search parser and perspective shifter. It operates as a browser extension seamlessly injected into Google Search, powered by a localized FastAPI and Groq AI backend. Instead of SEO-optimized listicles and AI content farms, LensShift intercepts your search query and surfaces academic critique, skeptical counter-narratives, and deep, unfiltered human debates from niche communities.

---

## Core Features

* **The Echo Breaker:** Powered by Groq (Llama-3.3), this engine analyzes the mainstream bias of your search query and instantly generates skeptical and academic counter-perspectives to broaden your context.
* **Deep Human Discussions:** Bypasses standard web scraping by utilizing the Algolia API to deep-search Hacker News comment sections. It finds where real engineers, developers, and thinkers are actively debating your topic, even if it is buried in a broader thread.
* **Serendipity Rabbit-Hole Engine:** Interactive expansion cards that pivot your search into related, unexpected domains. Clicking a card autonomously triggers a fresh backend analysis loop.
* **Shadow DOM Injection:** The frontend UI is sandboxed within a Shadow DOM, ensuring it renders flawlessly on top of Google Search without CSS bleeding or layout conflicts.

---

## Tech Stack

**Frontend (Extension)**
* Vanilla JavaScript
* HTML5 / Custom CSS
* Chrome Extension API (Manifest V3, Content Scripts, ActiveTab)

**Backend (API Engine)**
* Python 3.x
* FastAPI & Uvicorn
* Groq API (LLM inference)
* Algolia Search API (Hacker News indexing)
* Pydantic & Python-dotenv

---

## How to Run Locally (Judge's Guide)

To test LensShift, you need to spin up the local Python API and load the frontend extension into your Chromium-based browser.

### Phase 1: Start the Backend Engine
1. Clone this repository to your local machine:
   `git clone https://github.com/your-username/LensShift.git`
   `cd LensShift`
2. Install the required Python dependencies:
   `python -m pip install -r requirements.txt`
3. Set up your environment variables:
   * Locate the `.env.example` file in the root directory.
   * Create a new file named exactly `.env`.
   * Copy the contents of `.env.example` into `.env` and insert your personal Groq API Key.
4. Boot the FastAPI server:
   `python main.py`
   *Wait for the terminal to display 'Application startup complete'.*

### Phase 2: Attach the Frontend Extension
1. Open Google Chrome (or Brave/Edge) and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** to ON (usually located in the top right corner).
3. Click the **Load unpacked** button in the top left.
4. Select the `frontend` folder from the cloned repository.

### Phase 3: Test the Pipeline
1. Open a new tab and navigate to Google.com.
2. Search for a highly debated or commercialized topic (e.g., "Agile methodology destroying software quality" or "Water consumption of generative AI data centers").
3. The LensShift sidebar will automatically slide in, intercept the query, and query the local API to generate the human web analysis.

---

## The Team

Built for the hackathon by:
* **Sahil** — Full-Stack Architecture & API Integration
* **thesussymiss** — Frontend UI & Extension Ecosystem
* **Symboria** — Data Logic & Lore/Concept Engineering
