# 📊 LensShift — Data Research Module

This folder contains the **data engineering layer** of LensShift, including category mapping, bias detection logic, scoring algorithms, and test datasets.

---

## 📁 Files Overview

| File | Purpose | Used By |
|------|---------|---------|
| `category_keywords.json` | 10 category definitions with keywords | Extension + Backend |
| `bias_taxonomy.json` | 7 bias types with detection rules | Backend + LLM |
| `bubble_profile_logic.js` | JavaScript engine for bubble tracking | Extension |
| `serendipity_score.py` | Python scoring for result uniqueness | Backend |
| `test_cases.csv` | 45 test queries for validation | All teams |
| `api_research.md` | Complete API documentation | LLM/Backend Engineers |

---

## 🧠 What This Module Does

1. **Categorizes searches** into 10 topics (tech, politics, health, etc.)
2. **Detects 7 types of biases** (echo chamber, commercial, recency, etc.)
3. **Calculates bubble scores** (how trapped a user is in one topic)
4. **Scores serendipity** (how unique/unexpected each result is)
5. **Documents all APIs** used by the project

---

## 🔧 How to Use

### For Backend (Python):
```python
from data_research.serendipity_score import (
    score_results_batch,
    sort_by_serendipity,
    get_top_serendipitous
)

# Get top 5 most unique results
top_results = get_top_serendipitous(api_results, top_n=5)

// Import the bubble profile logic
import {
    detectCategories,
    updateBubbleProfile,
    getBubbleInsights
} from './bubble_profile_logic.js';

// Track a new search
await updateBubbleProfile("best python framework");
