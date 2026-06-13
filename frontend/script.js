/**
 * LensShift — Sidebar UI
 * Vanilla JS · dummy data · search-driven demo for hackathon
 */

(function () {
  "use strict";

  /* ── Template data pools (rotated / personalized by query) ── */

  const ECHO_TEMPLATES = [
    {
      headline: "The mainstream answer might be oversimplified",
      body: "Independent writers and community forums often challenge the top results — pointing out missing context, commercial incentives, or voices left out of the conversation.",
      sourceType: "Independent Blog",
    },
    {
      headline: "Consider the opposite framing entirely",
      body: "Academic and long-form sources frequently argue against the consensus view surfaced by search engines, offering nuance that ranking algorithms tend to flatten.",
      sourceType: "Academic",
    },
    {
      headline: "Real people disagree — loudly",
      body: "Reddit threads and niche forums are full of firsthand experiences that contradict sponsored listicles and SEO-optimized review sites dominating page one.",
      sourceType: "Reddit",
    },
  ];

  const SERENDIPITY_POOL = [
    { title: "A contrarian take from the indie web", domain: "calmtech.org", description: "Long-form writing from small publishers who don't optimize for clicks — just honest, slow journalism.", category: "Blog" },
    { title: "Community thread with raw opinions", domain: "reddit.com", description: "Thousands of unfiltered comments from people who've actually lived through the topic you're researching.", category: "Forum" },
    { title: "University research summary", domain: "stanford.edu", description: "Peer-reviewed findings and campus studies that rarely surface in commercial search results.", category: ".edu" },
    { title: "Archived page from a quieter internet", domain: "archive.org", description: "A snapshot of how this topic was discussed before algorithms reshaped the entire information landscape.", category: "Archive" },
    { title: "Personal blog — no ads, no agenda", domain: "write.as", description: "One person's deep dive written for readers, not advertisers. Refreshingly unoptimized.", category: "Blog" },
    { title: "Hacker News discussion", domain: "news.ycombinator.com", description: "Developers and thinkers debating trade-offs the mainstream press rarely covers.", category: "Forum" },
  ];

  const DISCUSSION_POOL = [
    { title: "Unpopular opinion thread that challenges the top results", subreddit: "r/ChangeMyView", upvotes: 3200, comments: 890 },
    { title: "What experts won't tell you about this topic", subreddit: "r/AskReddit", upvotes: 2100, comments: 456 },
    { title: "I spent 6 months researching this — here's what I found", subreddit: "r/DepthHub", upvotes: 4800, comments: 312 },
    { title: "Why the popular advice on this is wrong", subreddit: "r/skeptic", upvotes: 1650, comments: 278 },
    { title: "Lessons from someone who actually did this", subreddit: "r/IAmA", upvotes: 9200, comments: 1204 },
  ];

  const DAILY_DISCOVERIES = [
    { site: "Low Tech Magazine", reason: "Solar-powered website design and essays questioning whether we need faster devices at all." },
    { site: "Marginalia Search", reason: "Independent search engine indexing small sites — the opposite of a filter bubble." },
    { site: "512KB Club", reason: "Websites so lightweight they load instantly — proof the web doesn't need bloat." },
    { site: "Hacker News — Ask HN archives", reason: "Years of unfiltered developer wisdom on topics search engines bury under SEO content." },
    { site: "Neocities", reason: "A neighborhood of hand-built personal sites — the web as people actually make it." },
    { site: "Internet Archive Wayback Machine", reason: "See how any topic was discussed before algorithms rewrote the narrative." },
  ];

  const BIAS_LEVELS = [
    { max: 33, label: "Low" },
    { max: 66, label: "Medium" },
    { max: 100, label: "High" },
  ];

  /* ── DOM refs ── */

  const host = document.getElementById("lensshift-host");
  const sidebar = document.getElementById("lensshift-sidebar");
  const launcher = document.getElementById("lensshift-launcher");
  const closeBtn = document.getElementById("sidebar-close");
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsDropdown = document.getElementById("settings-dropdown");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const statusPill = document.getElementById("status-pill");
  const sidebarContent = document.getElementById("sidebar-content");
  const emptyState = document.getElementById("empty-state");
  const bubbleMeter = document.getElementById("bubble-meter");
  const bubbleMeterFill = document.getElementById("bubble-meter-fill");
  const bubbleMeterLabel = document.getElementById("bubble-meter-label");
  const bubbleMeterTrack = document.querySelector(".bubble-meter__track");
  const exploreBtn = document.getElementById("explore-angle-btn");
  const echoFeedback = document.getElementById("echo-feedback");
  const serendipityList = document.getElementById("serendipity-list");
  const discussionList = document.getElementById("discussion-list");
  const discoverySite = document.getElementById("discovery-site");
  const discoveryReason = document.getElementById("discovery-reason");
  const discoveryRefresh = document.getElementById("discovery-refresh");

  let discoveryIndex = 0;
  let sidebarOpen = true;
  let currentQuery = "";
  let searchTimeout = null;

  /* ── Utilities ── */

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  /** Deterministic hash from string → number 0–99 */
  function hashQuery(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h % 100;
  }

  function pickFromPool(pool, query, count) {
    const start = hashQuery(query) % pool.length;
    const picks = [];
    for (let i = 0; i < count; i++) {
      picks.push(pool[(start + i) % pool.length]);
    }
    return picks;
  }

  function getBiasLevel(value) {
    for (const tier of BIAS_LEVELS) {
      if (value <= tier.max) return tier.label;
    }
    return "High";
  }

  function tagClass(category) {
    const map = { Blog: "blog", Forum: "forum", ".edu": "edu", Archive: "archive" };
    return "serendipity-card__tag--" + (map[category] || "blog");
  }

  function setStatus(text, state) {
    if (!statusPill) return;
    statusPill.textContent = text;
    statusPill.classList.remove("is-active", "is-loading");
    if (state) statusPill.classList.add(state);
  }

  /* ── Bubble meter ── */

  function renderBubbleMeter(value, query) {
    const level = getBiasLevel(value);
    const label = query
      ? "Commercial Bias: " + level
      : "Enter a query to analyze";

    if (bubbleMeterLabel) bubbleMeterLabel.textContent = label;
    if (bubbleMeterFill) bubbleMeterFill.style.width = value + "%";
    if (bubbleMeterTrack) {
      bubbleMeterTrack.setAttribute("aria-valuenow", String(value));
      bubbleMeterTrack.setAttribute("aria-label", label);
    }
    if (bubbleMeter) {
      bubbleMeter.classList.toggle("bubble-meter--idle", !query);
      bubbleMeter.classList.toggle("is-analyzed", !!query);
    }
  }

  /* ── Render sections ── */

  function renderEchoBreaker(query) {
    const echo = pickFromPool(ECHO_TEMPLATES, query, 1)[0];
    const headline = document.getElementById("echo-headline");
    const body = document.getElementById("echo-body");
    const source = document.getElementById("echo-source");

    const personalized = query.length > 0
      ? echo.headline.replace("this topic", '"' + query + '"')
      : echo.headline;

    if (headline) headline.textContent = personalized;
    if (body) {
      body.textContent = 'On "' + query + '": ' + echo.body;
    }
    if (source) source.textContent = echo.sourceType;

    if (exploreBtn) {
      exploreBtn.disabled = false;
      exploreBtn.innerHTML =
        'Explore this angle' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M7 17L17 7M17 7H9M17 7v8"/></svg>';
    }
    if (echoFeedback) echoFeedback.hidden = true;
  }

  function renderSerendipityPicks(query) {
    if (!serendipityList) return;
    const picks = pickFromPool(SERENDIPITY_POOL, query, 4);

    serendipityList.innerHTML = picks
      .map(function (pick, idx) {
        return (
          '<li class="serendipity-card" data-id="sp-' + idx + '">' +
          '<button type="button" class="serendipity-card__toggle" aria-expanded="false">' +
          '<span class="serendipity-card__num">0' + (idx + 1) + "</span>" +
          '<h3 class="serendipity-card__title">' + escapeHtml(pick.title) + "</h3>" +
          '<span class="serendipity-card__domain">' + escapeHtml(pick.domain) + "</span>" +
          '<p class="serendipity-card__desc">' + escapeHtml(pick.description) + "</p>" +
          '<div class="serendipity-card__footer">' +
          '<span class="serendipity-card__tag ' + tagClass(pick.category) + '">' +
          escapeHtml(pick.category) + "</span>" +
          '<span class="serendipity-card__expand-hint"></span>' +
          "</div></button></li>"
        );
      })
      .join("");

    serendipityList.querySelectorAll(".serendipity-card__toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const card = btn.closest(".serendipity-card");
        const expanded = card.classList.toggle("is-expanded");
        btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    });
  }

  function renderDiscussions(query) {
    if (!discussionList) return;
    const threads = pickFromPool(DISCUSSION_POOL, query + "-d", 3);

    discussionList.innerHTML = threads
      .map(function (thread) {
        const title = thread.title.replace("this topic", query);
        return (
          '<li class="discussion-item">' +
          '<a href="#" class="discussion-item__link" aria-label="' + escapeHtml(title) + '">' +
          '<h3 class="discussion-item__title">' + escapeHtml(title) + "</h3>" +
          '<div class="discussion-item__meta">' +
          '<span class="discussion-item__subreddit">' + escapeHtml(thread.subreddit) + "</span>" +
          '<span class="discussion-item__stat discussion-item__stat--up" aria-label="Upvotes">▲ ' +
          formatCount(thread.upvotes) + "</span>" +
          '<span class="discussion-item__stat" aria-label="Comments">' +
          formatCount(thread.comments) + " comments</span>" +
          "</div></a></li>"
        );
      })
      .join("");

    discussionList.querySelectorAll(".discussion-item__link").forEach(function (link) {
      link.addEventListener("click", function (e) { e.preventDefault(); });
    });
  }

  function renderDailyDiscovery(index) {
    const i = ((index % DAILY_DISCOVERIES.length) + DAILY_DISCOVERIES.length) % DAILY_DISCOVERIES.length;
    discoveryIndex = i;
    const item = DAILY_DISCOVERIES[i];
    if (discoverySite) discoverySite.textContent = item.site;
    if (discoveryReason) discoveryReason.textContent = item.reason;
  }

  /* ── Search flow ── */

  function runSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      searchInput.focus();
      searchInput.classList.add("search-form__input--error");
      setTimeout(function () { searchInput.classList.remove("search-form__input--error"); }, 600);
      return;
    }

    currentQuery = trimmed;
    setStatus("Analyzing", "is-loading");

    if (emptyState) emptyState.hidden = true;
    if (sidebarContent) {
      sidebarContent.hidden = true;
      sidebarContent.classList.remove("is-visible");
    }

    const biasValue = 25 + hashQuery(trimmed);
    renderBubbleMeter(0, trimmed);

    requestAnimationFrame(function () {
      renderBubbleMeter(biasValue, trimmed);
    });

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      renderEchoBreaker(trimmed);
      renderSerendipityPicks(trimmed);
      renderDiscussions(trimmed);
      renderDailyDiscovery(hashQuery(trimmed));

      if (sidebarContent) {
        sidebarContent.hidden = false;
        void sidebarContent.offsetWidth;
        sidebarContent.classList.add("is-visible");
      }

      setStatus("Active", "is-active");
    }, 480);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    runSearch(searchInput.value);
  }

  /* ── Sidebar controls ── */

  function openSidebar() {
    sidebarOpen = true;
    host.classList.add("is-open");
    sidebar.setAttribute("aria-hidden", "false");
    if (launcher) launcher.hidden = true;
    searchInput.focus();
  }

  function closeSidebar() {
    sidebarOpen = false;
    host.classList.remove("is-open");
    sidebar.setAttribute("aria-hidden", "true");
    if (launcher) launcher.hidden = false;
    closeSettings();
  }

  function closeSettings() {
    settingsDropdown.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
  }

  function toggleSettings() {
    const open = settingsDropdown.hidden;
    settingsDropdown.hidden = !open;
    settingsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function handleExploreAngle() {
    echoFeedback.hidden = false;
    echoFeedback.textContent = "Opening perspective for \"" + currentQuery + "\"…";

    setTimeout(function () {
      echoFeedback.textContent = "Saved to your reading list.";
      exploreBtn.disabled = true;
      exploreBtn.textContent = "Added ✓";
    }, 550);
  }

  /* ── Events ── */

  function bindEvents() {
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (launcher) launcher.addEventListener("click", openSidebar);
    if (searchForm) searchForm.addEventListener("submit", handleSearchSubmit);

    if (settingsToggle) {
      settingsToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleSettings();
      });
    }

    if (settingsDropdown) {
      settingsDropdown.querySelectorAll(".settings-dropdown__item").forEach(function (item) {
        item.addEventListener("click", closeSettings);
      });
    }

    document.addEventListener("click", function (e) {
      if (
        !settingsDropdown.hidden &&
        !settingsDropdown.contains(e.target) &&
        !settingsToggle.contains(e.target)
      ) {
        closeSettings();
      }
    });

    if (exploreBtn) exploreBtn.addEventListener("click", handleExploreAngle);
    if (discoveryRefresh) {
      discoveryRefresh.addEventListener("click", function () {
        renderDailyDiscovery(discoveryIndex + 1);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (!settingsDropdown.hidden) closeSettings();
        else if (sidebarOpen) closeSidebar();
      }
    });
  }

  /* ── Init ── */

  function init() {
    renderBubbleMeter(0, "");
    renderDailyDiscovery(Math.floor(Math.random() * DAILY_DISCOVERIES.length));
    bindEvents();
    openSidebar();
    searchInput.focus();
  }

  window.LensShiftUI = {
    search: runSearch,
    open: openSidebar,
    close: closeSidebar,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
