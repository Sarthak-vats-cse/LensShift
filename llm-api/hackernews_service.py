import requests


def get_hackernews_results(query):

    search_url = (
        f"https://hn.algolia.com/api/v1/search?query={query}"
    )

    response = requests.get(search_url)

    data = response.json()

    results = []

    for item in data["hits"][:5]:

        results.append({
            "title": item.get("title", "No Title"),
            "url": item.get("url", ""),
            "points": item.get("points", 0)
        })

    return results