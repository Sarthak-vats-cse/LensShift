/**
 * LensShift - Bubble Profile Logic
 *
 * This module handles:
 * 1. Tracking user search history (locally only)
 * 2. Categorizing searches into bubble types
 * 3. Calculating bubble score (how trapped the user is)
 * 4. Detecting dominant bubble
 *
 * Author: Data Engineering Team
 * Privacy: All data stays in browser - nothing sent to servers
 */

// ============================================
// CATEGORY KEYWORDS (synced with JSON file)
// ============================================
const CATEGORY_KEYWORDS = {
  tech: [
    "python", "javascript", "java", "coding", "programming",
    "developer", "software", "github", "react", "vue",
    "angular", "node", "api", "database", "machine learning",
    "ml", "ai", "framework", "linux", "docker"
  ],
  politics: [
    "election", "government", "policy", "democrat", "republican",
    "president", "congress", "senate", "vote", "political",
    "legislation", "party", "campaign", "law", "constitution"
  ],
  health: [
    "diet", "fitness", "workout", "gym", "exercise",
    "medical", "doctor", "symptom", "disease", "treatment",
    "nutrition", "mental health", "anxiety", "depression", "yoga"
  ],
  finance: [
    "stock", "stocks", "crypto", "bitcoin", "ethereum",
    "investment", "trading", "market", "economy", "savings",
    "loan", "tax", "salary", "budget", "mutual fund"
  ],
  entertainment: [
    "movie", "film", "music", "song", "netflix",
    "spotify", "youtube", "game", "gaming", "anime",
    "series", "celebrity", "actor", "singer", "concert"
  ],
  science: [
    "research", "study", "physics", "chemistry", "biology",
    "space", "nasa", "climate", "evolution", "genetics",
    "quantum", "atom", "ecosystem", "discovery", "theory"
  ],
  shopping: [
    "buy", "price", "review", "best", "cheap",
    "discount", "amazon", "flipkart", "deal", "offer",
    "product", "iphone", "samsung", "laptop", "smartphone"
  ],
  sports: [
    "cricket", "football", "soccer", "basketball", "tennis",
    "ipl", "fifa", "nba", "match", "tournament",
    "player", "team", "score", "champion", "trophy"
  ],
  education: [
    "college", "university", "course", "degree", "exam",
    "study", "tutorial", "lecture", "professor", "student",
    "scholarship", "admission", "syllabus", "coursera", "udemy"
  ],
  news: [
    "news", "breaking", "headlines", "latest", "today",
    "update", "report", "media", "press", "current affairs"
  ]
};

// ============================================
// BUBBLE TYPE LABELS
// ============================================
const BUBBLE_LABELS = {
  tech: "Tech Bubble 💻",
  politics: "Political Bubble 🗳️",
  health: "Health Bubble 🏥",
  finance: "Finance Bubble 💰",
  entertainment: "Entertainment Bubble 🎬",
  science: "Science Bubble 🔬",
  shopping: "Shopping Bubble 🛒",
  sports: "Sports Bubble ⚽",
  education: "Education Bubble 📚",
  news: "News Bubble 📰"
};

// ============================================
// FUNCTION 1: Detect Categories from Query
// ============================================
/**
 * Analyzes a search query and detects which
 * category/categories it belongs to.
 *
 * @param {string} query - The user's search query
 * @returns {string[]} - Array of matched categories
 */
function detectCategories(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const queryLower = query.toLowerCase();
  const matchedCategories = [];

  for (const [category, keywords] of
       Object.entries(CATEGORY_KEYWORDS)) {
    const isMatch = keywords.some(
      keyword => queryLower.includes(keyword)
    );

    if (isMatch) {
      matchedCategories.push(category);
    }
  }

  return matchedCategories;
}

// ============================================
// FUNCTION 2: Calculate Bubble Score
// ============================================
/**
 * Calculates how "in a bubble" the user is.
 *
 * Score Range:
 *   0   = Very diverse (no bubble)
 *   100 = Extreme bubble (one category dominates)
 *
 * @param {object} categories - Category counts
 * @returns {object} - Bubble analysis result
 */
function calculateBubbleScore(categories) {
  const total = Object.values(categories)
    .reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return {
      bubbleScore: 0,
      diversityScore: 100,
      dominantCategory: null,
      bubbleLabel: "No bubble detected yet",
      totalSearches: 0
    };
  }

  // Find dominant category
  let dominantCategory = null;
  let maxCount = 0;

  for (const [category, count] of
       Object.entries(categories)) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = category;
    }
  }

  // Calculate scores
  const bubbleScore = Math.round((maxCount / total) * 100);
  const diversityScore = 100 - bubbleScore;

  return {
    bubbleScore,
    diversityScore,
    dominantCategory,
    bubbleLabel: BUBBLE_LABELS[dominantCategory] ||
                 "Mixed Bubble",
    totalSearches: total
  };
}

// ============================================
// FUNCTION 3: Update Bubble Profile
// ============================================
/**
 * Updates the user's bubble profile with a new search.
 * Stores data locally using Chrome Storage API.
 *
 * @param {string} query - New search query
 * @returns {Promise} - Updated profile
 */
function updateBubbleProfile(query) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profile'], (result) => {
      // Initialize profile if it doesn't exist
      const profile = result.profile || {
        searches: [],
        categories: {},
        createdAt: Date.now()
      };

      // Detect categories for this search
      const categories = detectCategories(query);

      // Update category counts
      categories.forEach(cat => {
        profile.categories[cat] =
          (profile.categories[cat] || 0) + 1;
      });

      // Add to search history (keep last 50)
      profile.searches.push({
        query: query,
        timestamp: Date.now(),
        categories: categories
      });

      if (profile.searches.length > 50) {
        profile.searches.shift();
      }

      // Calculate bubble metrics
      const bubbleMetrics = calculateBubbleScore(
        profile.categories
      );

      profile.metrics = bubbleMetrics;
      profile.updatedAt = Date.now();

      // Save back to storage
      chrome.storage.local.set({ profile }, () => {
        resolve(profile);
      });
    });
  });
}

// ============================================
// FUNCTION 4: Get Current Bubble Profile
// ============================================
/**
 * Retrieves the current bubble profile.
 *
 * @returns {Promise} - Current profile data
 */
function getBubbleProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profile'], (result) => {
      resolve(result.profile || null);
    });
  });
}

// ============================================
// FUNCTION 5: Reset Bubble Profile
// ============================================
/**
 * Resets the user's bubble profile.
 * Useful for testing or user privacy controls.
 *
 * @returns {Promise} - Confirmation
 */
function resetBubbleProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['profile'], () => {
      resolve({ success: true });
    });
  });
}

// ============================================
// FUNCTION 6: Get Bubble Insights
// ============================================
/**
 * Generates human-readable insights about
 * the user's bubble pattern.
 *
 * @param {object} profile - User's bubble profile
 * @returns {object} - Insights and recommendations
 */
function getBubbleInsights(profile) {
  if (!profile || !profile.metrics) {
    return {
      message: "Start searching to see your bubble profile!",
      recommendation: null,
      severity: "info"
    };
  }

  const { bubbleScore, dominantCategory, totalSearches } =
    profile.metrics;

  // Less than 5 searches = not enough data
  if (totalSearches < 5) {
    return {
      message: `Only ${totalSearches} searches tracked.`,
      recommendation: "Keep searching to build your profile.",
      severity: "info"
    };
  }

  // Determine severity
  let severity, message, recommendation;

  if (bubbleScore >= 70) {
    severity = "high";
    message =
      `⚠️ You're deep in a ${BUBBLE_LABELS[dominantCategory]}!`;
    recommendation =
      `${bubbleScore}% of your searches are about ` +
      `${dominantCategory}. Try exploring other topics.`;
  } else if (bubbleScore >= 40) {
    severity = "medium";
    message =
      `📊 You lean toward ${BUBBLE_LABELS[dominantCategory]}`;
    recommendation =
      `${bubbleScore}% bubble score. Consider diversifying.`;
  } else {
    severity = "low";
    message = "✅ Your search habits are diverse!";
    recommendation =
      "Great job exploring different topics.";
  }

  return {
    message,
    recommendation,
    severity,
    bubbleScore,
    dominantCategory
  };
}

// ============================================
// EXPORTS (for use in extension)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectCategories,
    calculateBubbleScore,
    updateBubbleProfile,
    getBubbleProfile,
    resetBubbleProfile,
    getBubbleInsights,
    CATEGORY_KEYWORDS,
    BUBBLE_LABELS
  };
}