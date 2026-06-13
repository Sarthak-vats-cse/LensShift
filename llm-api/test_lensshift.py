from lensshift_service import run_lensshift

query = input("Enter search query: ")

result = run_lensshift(query)

print("\n===== CURRENT ANALYSIS =====")

print("\nPerspective:")
print(result["current_analysis"]["perspective"])

print("\nAcademic View:")
print(result["current_analysis"]["academic_view"])

print("\nIndustry View:")
print(result["current_analysis"]["industry_view"])

print("\nSkeptical View:")
print(result["current_analysis"]["skeptical_view"])

print("\nBubble Score:")
print(result["current_analysis"]["bubble_score"])

print("\n===== HISTORY ANALYSIS =====")

print("Main Interests:")
print(result["history_analysis"]["main_interests"])

print("\nBubble Score:")
print(result["history_analysis"]["bubble_score"])

print("\nOutside Topic:")
print(result["history_analysis"]["outside_topic"])

print("\n===== RECOMMENDATIONS =====")

for topic in result["recommendations"]["recommended_topics"]:
    print("-", topic)

print("\nSurprise Topic:")
print(result["recommendations"]["surprise_topic"])

print("\n===== HACKER NEWS RESULTS =====")

for article in result["hackernews"]:

    print("\nTitle:", article["title"])
    print("Points:", article["points"])
    print("URL:", article["url"])