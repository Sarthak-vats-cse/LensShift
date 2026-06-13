from groq import Groq
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Read API key
api_key = os.getenv("GROQ_API_KEY")

# Create Groq client
client = Groq(api_key=api_key)


def get_opposing_view(query: str) -> dict:

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "Return only valid JSON."
            },
            {
                "role": "user",
                "content": f"""
A user searched:
'{query}'

Analyze the search and provide:

1. Likely user perspective
2. Academic perspective
3. Industry perspective
4. Skeptical perspective
5. Bubble score from 0 to 100
6. Short reason for the score
7. Three alternative search angles

Return JSON only in this format:

{{
    "perspective": "...",
    "academic_view": "...",
    "industry_view": "...",
    "skeptical_view": "...",
    "bubble_score": 0,
    "bubble_reason": "...",
    "alternative_searches": [
        "...",
        "...",
        "..."
    ]
}}
"""
            }
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(
        response.choices[0].message.content
    )


def analyze_search_history(history: list) -> dict:

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "Return only valid JSON."
            },
            {
                "role": "user",
                "content": f"""
Analyze this search history:

{history}

Estimate:

1. Main interests
2. Bubble score (0-100)
3. Reason for score
4. Suggested topic outside the bubble

Return JSON:

{{
    "main_interests": "...",
    "bubble_score": 0,
    "reason": "...",
    "outside_topic": "..."
}}
"""
            }
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(
        response.choices[0].message.content
    )


def get_recommendations(history: list) -> dict:

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "Return only valid JSON."
            },
            {
                "role": "user",
                "content": f"""
Based on this search history:

{history}

Suggest:

1. Four topics outside the user's bubble
2. One surprising topic they may enjoy

Return JSON:

{{
    "recommended_topics": [
        "...",
        "...",
        "...",
        "..."
    ],
    "surprise_topic": "..."
}}
"""
            }
        ],
        response_format={"type": "json_object"}
    )

    return json.loads(
        response.choices[0].message.content
    )