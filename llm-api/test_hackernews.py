from hackernews_service import get_hackernews_results

query = input("Enter search query: ")

results = get_hackernews_results(query)

print("\nHacker News Results:\n")

for item in results:

    print("Title:", item["title"])
    print("Points:", item["points"])
    print("URL:", item["url"])
    print("-" * 50)