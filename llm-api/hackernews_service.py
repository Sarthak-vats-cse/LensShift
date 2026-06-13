import requests
import urllib.parse

def get_hackernews_results(query: str) -> list:
    print(f"[HackerNews] Hunting for discussions on: {query}")
    
    # 1. Clean the query
    stop_words = {"what", "is", "the", "of", "in", "how", "to", "a", "and", "for", "on", "are"}
    keywords = [word for word in query.split() if word.lower() not in stop_words]
    clean_query = " ".join(keywords)
    
    # 2. Search EVERYTHING (Stories and Comments), grab more hits to filter through
    url = f"https://hn.algolia.com/api/v1/search?query={urllib.parse.quote(clean_query)}&hitsPerPage=15"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        results = []
        seen_titles = set() # This stops us from showing the same thread 4 times if 4 comments match
        
        for hit in data.get('hits', []):
            # If it's a story, use 'title'. If it's a comment, use 'story_title'.
            title = hit.get('title') or hit.get('story_title')
            
            # Construct a bulletproof URL directly to the HN discussion
            story_id = hit.get('story_id') or hit.get('objectID')
            url_link = hit.get('url') or hit.get('story_url') or f"https://news.ycombinator.com/item?id={story_id}"
            
            # Grab the points (comments use 'story_points')
            points = hit.get('points') or hit.get('story_points') or 0

            # Only add it if it's a valid, unique thread
            if title and title not in seen_titles:
                seen_titles.add(title)
                results.append({
                    "title": title,
                    "url": url_link,
                    "points": points
                })
                
            # Stop once we have 4 perfect, unique cards for the UI
            if len(results) >= 4:
                break
                
        return results
        
    except Exception as e:
        print(f"[HackerNews Error] API failed: {e}")
        return []