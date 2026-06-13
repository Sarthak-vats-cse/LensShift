"""
LensShift - Serendipity Score Calculator

This module measures how 'surprising' or 'unexpected'
a search result is compared to typical Google results.

Higher serendipity = more unique, hidden-gem content
Lower serendipity = mainstream, SEO-optimized content

Author: Data Engineering Team
"""

import re
from urllib.parse import urlparse
from datetime import datetime
from typing import List, Dict


# ============================================
# CONFIGURATION
# ============================================

# Big mainstream platforms (low serendipity)
MAINSTREAM_PLATFORMS = [
    'medium.com', 'reddit.com', 'quora.com',
    'wikipedia.org', 'youtube.com', 'forbes.com',
    'cnn.com', 'bbc.com', 'nytimes.com',
    'huffpost.com', 'buzzfeed.com', 'businessinsider.com',
    'techcrunch.com', 'mashable.com', 'theverge.com',
    'amazon.com', 'flipkart.com', 'facebook.com',
    'twitter.com', 'instagram.com', 'linkedin.com',
    'pinterest.com', 'tiktok.com'
]

# Indie web indicators (high serendipity)
INDIE_INDICATORS = [
    'blog', 'personal', 'garden', 'notes',
    'journal', 'diary', 'thoughts', 'musings',
    'homepage', 'about-me', 'portfolio',
    'neocities', 'tilde', 'sourcehut',
    'gitlab.io', 'github.io', 'pages.dev'
]

# Academic/research indicators (high serendipity)
ACADEMIC_INDICATORS = [
    '.edu', '.ac.', 'university', 'college',
    'research', 'institute', 'academy',
    'scholar', 'arxiv', 'jstor', 'pubmed',
    'researchgate', 'academia.edu'
]

# Old web indicators (high serendipity)
OLD_WEB_YEARS = [
    '2005', '2006', '2007', '2008', '2009',
    '2010', '2011', '2012', '2013', '2014'
]

# Suspicious commercial indicators (low serendipity)
COMMERCIAL_INDICATORS = [
    'affiliate', 'sponsored', 'promoted',
    'best-of-2024', 'top-10', 'review-2024',
    'discount', 'coupon', 'deals'
]


# ============================================
# FUNCTION 1: Analyze URL Components
# ============================================

def analyze_url_components(url: str) -> Dict:
    """
    Breaks down a URL into analyzable components.
    
    Args:
        url: The URL to analyze
        
    Returns:
        Dictionary with parsed URL info
    """
    try:
        parsed = urlparse(url.lower())
        return {
            'domain': parsed.netloc,
            'path': parsed.path,
            'full_url': url.lower(),
            'is_https': parsed.scheme == 'https'
        }
    except Exception:
        return {
            'domain': '',
            'path': '',
            'full_url': url.lower() if url else '',
            'is_https': False
        }


# ============================================
# FUNCTION 2: Check if URL is Mainstream
# ============================================

def is_mainstream_platform(url_components: Dict) -> bool:
    """
    Checks if URL belongs to a big mainstream platform.
    
    Args:
        url_components: Parsed URL components
        
    Returns:
        True if mainstream, False otherwise
    """
    domain = url_components.get('domain', '')
    return any(
        platform in domain
        for platform in MAINSTREAM_PLATFORMS
    )


# ============================================
# FUNCTION 3: Check for Indie Web Signals
# ============================================

def count_indie_signals(url_components: Dict) -> int:
    """
    Counts how many indie web indicators
    are present in the URL.
    
    Args:
        url_components: Parsed URL components
        
    Returns:
        Number of indie signals found
    """
    full_url = url_components.get('full_url', '')
    count = 0

    for indicator in INDIE_INDICATORS:
        if indicator in full_url:
            count += 1

    return count


# ============================================
# FUNCTION 4: Check for Academic Signals
# ============================================

def count_academic_signals(url_components: Dict) -> int:
    """
    Counts academic/research indicators.
    
    Args:
        url_components: Parsed URL components
        
    Returns:
        Number of academic signals found
    """
    full_url = url_components.get('full_url', '')
    count = 0

    for indicator in ACADEMIC_INDICATORS:
        if indicator in full_url:
            count += 1

    return count


# ============================================
# FUNCTION 5: Check for Old Web Content
# ============================================

def has_old_web_signals(url_components: Dict) -> bool:
    """
    Checks if URL or content suggests old web era.
    
    Args:
        url_components: Parsed URL components
        
    Returns:
        True if old web signals found
    """
    full_url = url_components.get('full_url', '')
    return any(
        year in full_url
        for year in OLD_WEB_YEARS
    )


# ============================================
# FUNCTION 6: Check for Commercial Content
# ============================================

def count_commercial_signals(url_components: Dict) -> int:
    """
    Counts commercial/SEO indicators (low serendipity).
    
    Args:
        url_components: Parsed URL components
        
    Returns:
        Number of commercial signals
    """
    full_url = url_components.get('full_url', '')
    count = 0

    for indicator in COMMERCIAL_INDICATORS:
        if indicator in full_url:
            count += 1

    return count


# ============================================
# FUNCTION 7: Main Serendipity Score Calculator
# ============================================

def calculate_serendipity_score(result: Dict) -> int:
    """
    Calculates serendipity score for a single result.
    
    Score Range: 0 to 100
    - 0-30   = Mainstream/expected content
    - 31-60  = Somewhat unique
    - 61-100 = Highly serendipitous (hidden gem)
    
    Args:
        result: Dictionary with 'url', 'title', 'snippet'
        
    Returns:
        Serendipity score (0-100)
    """
    url = result.get('url', '')
    if not url:
        return 0

    components = analyze_url_components(url)
    score = 50  # Start at neutral

    # Mainstream penalty
    if is_mainstream_platform(components):
        score -= 30

    # Indie web bonus
    indie_count = count_indie_signals(components)
    score += min(indie_count * 10, 25)

    # Academic bonus
    academic_count = count_academic_signals(components)
    score += min(academic_count * 15, 30)

    # Old web bonus
    if has_old_web_signals(components):
        score += 15

    # Commercial penalty
    commercial_count = count_commercial_signals(components)
    score -= min(commercial_count * 10, 20)

    # Short, simple URLs bonus (less spammy)
    if len(url) < 60 and url.count('/') <= 4:
        score += 10

    # Very long URLs penalty (often SEO spam)
    if len(url) > 150:
        score -= 10

    # Clamp between 0 and 100
    return max(0, min(100, score))


# ============================================
# FUNCTION 8: Batch Score Multiple Results
# ============================================

def score_results_batch(results: List[Dict]) -> List[Dict]:
    """
    Calculates serendipity score for a list of results.
    
    Args:
        results: List of result dictionaries
        
    Returns:
        Same list with 'serendipity_score' added
    """
    scored_results = []

    for result in results:
        score = calculate_serendipity_score(result)
        result_with_score = result.copy()
        result_with_score['serendipity_score'] = score
        result_with_score['serendipity_label'] = (
            get_serendipity_label(score)
        )
        scored_results.append(result_with_score)

    return scored_results


# ============================================
# FUNCTION 9: Get Human-Readable Label
# ============================================

def get_serendipity_label(score: int) -> str:
    """
    Converts numerical score to human label.
    
    Args:
        score: Serendipity score (0-100)
        
    Returns:
        Label string with emoji
    """
    if score >= 80:
        return "💎 Hidden Gem"
    elif score >= 60:
        return "✨ Unique Find"
    elif score >= 40:
        return "🔍 Somewhat Unique"
    elif score >= 20:
        return "📄 Mainstream"
    else:
        return "📰 Very Common"


# ============================================
# FUNCTION 10: Sort by Serendipity
# ============================================

def sort_by_serendipity(
    results: List[Dict],
    descending: bool = True
) -> List[Dict]:
    """
    Sorts results by serendipity score.
    
    Args:
        results: List of scored results
        descending: True = highest first (default)
        
    Returns:
        Sorted list of results
    """
    return sorted(
        results,
        key=lambda x: x.get('serendipity_score', 0),
        reverse=descending
    )


# ============================================
# FUNCTION 11: Get Top Serendipitous Results
# ============================================

def get_top_serendipitous(
    results: List[Dict],
    top_n: int = 5
) -> List[Dict]:
    """
    Returns the top N most serendipitous results.
    
    Args:
        results: List of results
        top_n: How many to return
        
    Returns:
        Top N serendipitous results
    """
    scored = score_results_batch(results)
    sorted_results = sort_by_serendipity(scored)
    return sorted_results[:top_n]


# ============================================
# FUNCTION 12: Calculate Average Serendipity
# ============================================

def calculate_average_serendipity(
    results: List[Dict]
) -> Dict:
    """
    Calculates overall serendipity stats for a result set.
    
    Args:
        results: List of results
        
    Returns:
        Dict with stats
    """
    if not results:
        return {
            'average': 0,
            'highest': 0,
            'lowest': 0,
            'total_results': 0,
            'hidden_gems_count': 0
        }

    scored = score_results_batch(results)
    scores = [
        r.get('serendipity_score', 0) for r in scored
    ]

    return {
        'average': round(sum(scores) / len(scores), 1),
        'highest': max(scores),
        'lowest': min(scores),
        'total_results': len(scores),
        'hidden_gems_count': sum(
            1 for s in scores if s >= 80
        )
    }


# ============================================
# TESTING (run this file directly to test)
# ============================================

if __name__ == "__main__":
    # Sample test results
    test_results = [
        {
            'url': 'https://www.medium.com/best-python-frameworks',
            'title': 'Best Python Frameworks 2024',
            'snippet': 'Top 10 frameworks...'
        },
        {
            'url': 'https://johndoe.github.io/blog/2010/python-notes',
            'title': "John's Python Notes",
            'snippet': 'My experience with Python...'
        },
        {
            'url': 'https://cs.stanford.edu/research/python-study',
            'title': 'Stanford Python Research',
            'snippet': 'Academic study on...'
        },
        {
            'url': 'https://amazon.com/best-laptops-2024',
            'title': 'Best Laptops 2024 - Affiliate Deal',
            'snippet': 'Buy now with discount...'
        },
        {
            'url': 'https://my-personal-garden.tilde.club/thoughts',
            'title': 'Random thoughts on coding',
            'snippet': 'Personal musings...'
        }
    ]

    print("=" * 60)
    print("LENSSHIFT SERENDIPITY SCORE TEST")
    print("=" * 60)

    scored = score_results_batch(test_results)
    sorted_results = sort_by_serendipity(scored)

    print("\nSorted by Serendipity (Highest First):\n")
    for i, result in enumerate(sorted_results, 1):
        print(f"{i}. {result['serendipity_label']} "
              f"({result['serendipity_score']}/100)")
        print(f"   URL: {result['url']}")
        print()

    stats = calculate_average_serendipity(test_results)
    print("=" * 60)
    print("OVERALL STATS:")
    print(f"  Average Score: {stats['average']}/100")
    print(f"  Highest: {stats['highest']}/100")
    print(f"  Lowest: {stats['lowest']}/100")
    print(f"  Hidden Gems: {stats['hidden_gems_count']}")
    print("=" * 60)