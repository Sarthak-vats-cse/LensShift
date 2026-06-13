from groq_service import (
    get_opposing_view,
    analyze_search_history,
    get_recommendations
)

import json

query = input("Enter a search query: ")

# Load search history
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

# Analyze current search
result = get_opposing_view(query)

print("\n===== CURRENT SEARCH ANALYSIS =====")

print("\nPerspective:")
print(result["perspective"])

print("\nAcademic View:")
print(result["academic_view"])

print("\nIndustry View:")
print(result["industry_view"])

print("\nSkeptical View:")
print(result["skeptical_view"])

print("\nBubble Score:")
print(result["bubble_score"])

print("\nReason:")
print(result["bubble_reason"])

print("\nAlternative Search Angles:")

for search in result["alternative_searches"]:
    print("-", search)

# Analyze history
history_analysis = analyze_search_history(history)

print("\n===== HISTORY ANALYSIS =====")

print("\nMain Interests:")
print(history_analysis["main_interests"])

print("\nBubble Score:")
print(history_analysis["bubble_score"])

print("\nReason:")
print(history_analysis["reason"])

print("\nExplore Outside Your Bubble:")
print(history_analysis["outside_topic"])

# Generate recommendations
recommendations = get_recommendations(history)

print("\n===== RECOMMENDATIONS =====")

print("\nTopics To Explore:")

for topic in recommendations["recommended_topics"]:
    print("-", topic)

print("\nSurprise Topic:")
print(recommendations["surprise_topic"])