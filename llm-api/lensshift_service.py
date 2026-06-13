from groq_service import (
    get_opposing_view,
    analyze_search_history,
    get_recommendations
)

from hackernews_service import (
    get_hackernews_results
)

from duckduckgo_service import (
    get_duckduckgo_results
)

import json


def run_lensshift(query):

    # Load history
    try:
        with open("search_history.json", "r") as file:
            history = json.load(file)
    except:
        history = []

    # Add current query
    history.append(query)

    # Save updated history
    with open("search_history.json", "w") as file:
        json.dump(history, file, indent=4)

    # Groq analysis
    current_analysis = get_opposing_view(query)

    # Search history analysis
    history_analysis = analyze_search_history(
        history
    )

    # Recommendations
    recommendations = get_recommendations(
        history
    )

    # Hacker News results
    hackernews = get_hackernews_results(
        query
    )

    # DuckDuckGo results
    duckduckgo = get_duckduckgo_results(
        query
    )

    # Return everything together
    return {
        "current_analysis":
            current_analysis,

        "history_analysis":
            history_analysis,

        "recommendations":
            recommendations,

        "hackernews":
            hackernews,

        "duckduckgo":
            duckduckgo
    }