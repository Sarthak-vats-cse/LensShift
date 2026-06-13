from duckduckgo_service import (
    get_duckduckgo_results
)

query = input("Enter search query: ")

results = get_duckduckgo_results(query)

print("\nDuckDuckGo Results:\n")

for item in results:

    print("Title:", item["title"])
    print("URL:", item["url"])
    print("Snippet:", item["snippet"])

    print("-" * 50)