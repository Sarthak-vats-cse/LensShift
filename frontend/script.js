/**
 * LensShift — Sidebar UI
 * Connected to Live FastAPI Backend Engine
 */

(function () {
  "use strict";

  // Configuration for your local full-stack server
  const BACKEND_URL = "http://localhost:8000/api/shift";

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

  let currentQuery = "";

  /* ── Utilities ── */
  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatCount(n) {
    if (!n) return "0";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function getBiasLevel(value) {
    for (const tier of BIAS_LEVELS) {
      if (value <= tier.max) return tier.label;
    }
    return "High";
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

  /* ── Render Live Sections from Backend Payload ── */
  function renderEchoBreaker(analysis, query) {
    const headline = document.getElementById("echo-headline");
    const body = document.getElementById("echo-body");
    const source = document.getElementById("echo-source");

    if (headline) headline.textContent = "Perspective Shift Found";
    if (body && analysis) {
      body.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>Mainstream Bias:</strong> ${escapeHtml(analysis.perspective)}</div>
        <div style="margin-bottom: 8px;"><strong>Skeptical Critique:</strong> ${escapeHtml(analysis.skeptical_view)}</div>
        <div style="margin-bottom: 8px;"><strong>Academic Lens:</strong> ${escapeHtml(analysis.academic_view)}</div>
      `;
    }
    if (source) source.textContent = "Groq Llama-3.3";

    if (exploreBtn) {
      exploreBtn.disabled = false;
      exploreBtn.innerHTML =
        "Save Reading Angle" +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M7 17L17 7M17 7H9M17 7v8"/></svg>';
    }
    if (echoFeedback) echoFeedback.hidden = true;
  }

  function renderSerendipityPicks(recommendations) {
    if (!serendipityList || !recommendations) return;

    const topics = recommendations.recommended_topics || [];

    // 1. Build the cards and make them visually look clickable
    serendipityList.innerHTML = topics
      .map(function (topic, idx) {
        return (
          '<li class="serendipity-card" style="cursor: pointer; border: 1px solid transparent; transition: border-color 0.2s;" onmouseover="this.style.borderColor=\'#4F46E5\'" onmouseout="this.style.borderColor=\'transparent\'" data-topic="' + escapeHtml(topic) + '">' +
          '<div class="serendipity-card__toggle" style="pointer-events: none;">' +
          '<span class="serendipity-card__num">0' + (idx + 1) + "</span>" +
          '<h3 class="serendipity-card__title">Explore alternative field</h3>' +
          '<span class="serendipity-card__domain" style="font-weight: 600; color: #111;">' + escapeHtml(topic) + "</span>" +
          '<p class="serendipity-card__desc" style="margin-top: 8px;">Click to shift your lens and run a deep analysis on this specific angle.</p>' +
          '<div class="serendipity-card__footer" style="margin-top: 12px;">' +
          '<span class="serendipity-card__tag serendipity-card__tag--edu">Search Topic ↗</span>' +
          "</div></div></li>"
        );
      })
      .join("");

    // 2. Wire the cards to trigger a new backend search when clicked!
    serendipityList.querySelectorAll(".serendipity-card").forEach(function (card) {
      card.addEventListener("click", function () {
        const newTopic = card.getAttribute("data-topic");
        
        // Update the search box text visually so the user knows what's happening
        if (searchInput) searchInput.value = newTopic;
        
        // Scroll back to the top of the sidebar smoothly
        document.querySelector(".sidebar-scroll").scrollTo({ top: 0, behavior: 'smooth' });
        
        // Fire the backend engine!
        runSearch(newTopic);
      });
    });
  }

  function renderDailyDiscovery(recommendations) {
    if (!recommendations) return;
    
    const surpriseTopic = recommendations.surprise_topic || "Deep space anomalies";
    
    if (discoverySite) discoverySite.textContent = "Surprise Expansion Vector";
    if (discoveryReason) discoveryReason.textContent = surpriseTopic;

    // Turn the broken 'Show Another' button into an actionable 'Explore' button
    if (discoveryRefresh) {
      discoveryRefresh.textContent = "Search this topic ↗";
      discoveryRefresh.onclick = function () {
        if (searchInput) searchInput.value = surpriseTopic;
        document.querySelector(".sidebar-scroll").scrollTo({ top: 0, behavior: 'smooth' });
        runSearch(surpriseTopic);
      };
    }
  }

  function renderDiscussions(hnResults) {
    if (!discussionList) return;
    
    const validItems = (hnResults || []).filter(
      thread => thread && thread.title && thread.title !== "No Title" && thread.title.trim() !== ""
    );

    if (validItems.length === 0) {
      discussionList.innerHTML =
        '<li class="discussion-item" style="padding: 16px; font-size: 13px; color: #666;">No relevant community discussions found for this specific query.</li>';
      return;
    }

    discussionList.innerHTML = validItems
      .map(function (thread) {
        return (
          '<li class="discussion-item">' +
          '<a href="' + (thread.url || "#") + '" target="_blank" class="discussion-item__link" aria-label="' + escapeHtml(thread.title) + '">' +
          '<h3 class="discussion-item__title">' + escapeHtml(thread.title) + "</h3>" +
          '<div class="discussion-item__meta">' +
          '<span class="discussion-item__subreddit">Hacker News</span>' +
          '<span class="discussion-item__stat discussion-item__stat--up" aria-label="Points">▲ ' +
          formatCount(thread.points) + "</span>" +
          "</div></a></li>"
        );
      })
      .join("");
  }

  /* ── Network Integration Bridge ── */
  async function runSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      if (searchInput) {
        searchInput.focus();
        searchInput.classList.add("search-form__input--error");
        setTimeout(function () {
          searchInput.classList.remove("search-form__input--error");
        }, 600);
      }
      return;
    }

    currentQuery = trimmed;
    setStatus("Analyzing", "is-loading");

    if (emptyState) emptyState.hidden = true;
    if (sidebarContent) {
      sidebarContent.hidden = true;
      sidebarContent.classList.remove("is-visible");
    }

    renderBubbleMeter(0, trimmed);

    try {
      // Direct POST payload matching FastAPI SearchRequest data structure
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!response.ok) {
        throw new Error("API server responded with status: " + response.status);
      }

      const payload = await response.json();
      console.log("[LensShift UI] Server payload captured:", payload);

      // Distribute live backend data layers to existing UI sub-components
      const biasValue = payload.current_analysis?.bubble_score || 50;
      renderBubbleMeter(biasValue, trimmed);

      renderEchoBreaker(payload.current_analysis, trimmed);
      renderSerendipityPicks(payload.recommendations);
      renderDiscussions(payload.hackernews);
      renderDailyDiscovery(payload.recommendations);

      if (sidebarContent) {
        sidebarContent.hidden = false;
        void sidebarContent.offsetWidth;
        sidebarContent.classList.add("is-visible");
      }

      setStatus("Active", "is-active");
    } catch (error) {
      console.error("[LensShift UI] Handshake error:", error);
      setStatus("Offline", "search-form__input--error");
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent =
          "Connection to LensShift Engine lost. Verify python main.py is running.";
      }
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchInput) runSearch(searchInput.value);
  }

  /* ── Sidebar controls ── */
  function openSidebar() {
    if (host) host.classList.add("is-open");
    if (sidebar) sidebar.setAttribute("aria-hidden", "false");
    if (launcher) launcher.hidden = true;
    if (searchInput) searchInput.focus();
  }

  function closeSidebar() {
    if (host) host.classList.remove("is-open");
    if (sidebar) sidebar.setAttribute("aria-hidden", "true");
    if (launcher) launcher.hidden = false;
    closeSettings();
  }

  function closeSettings() {
    if (settingsDropdown) settingsDropdown.hidden = true;
    if (settingsToggle) settingsToggle.setAttribute("aria-expanded", "false");
  }

  function toggleSettings() {
    if (!settingsDropdown || !settingsToggle) return;
    const open = settingsDropdown.hidden;
    settingsDropdown.hidden = !open;
    settingsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function handleExploreAngle() {
    if (!echoFeedback || !exploreBtn) return;
    
    echoFeedback.hidden = false;
    echoFeedback.textContent = 'Opening perspective for "' + currentQuery + '"…';

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
      settingsDropdown
        .querySelectorAll(".settings-dropdown__item")
        .forEach(function (item) {
          item.addEventListener("click", closeSettings);
        });
    }

    document.addEventListener("click", function (e) {
      if (
        settingsDropdown &&
        !settingsDropdown.hidden &&
        !settingsDropdown.contains(e.target) &&
        !settingsToggle.contains(e.target)
      ) {
        closeSettings();
      }
    });

    if (exploreBtn) exploreBtn.addEventListener("click", handleExploreAngle);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (settingsDropdown && !settingsDropdown.hidden) closeSettings();
        else if (host && host.classList.contains("is-open")) closeSidebar();
      }
    });
  }

  function init() {
    renderBubbleMeter(0, "");
    bindEvents();
    openSidebar();

    // STEP 3 INTEGRATION: Automatically extract the query passed into the iframe URL and trigger the backend
    const iframeParams = new URLSearchParams(window.location.search);
    const incomingQuery = iframeParams.get("q");

    if (incomingQuery) {
      // Put the query into the search input box visually
      if (searchInput) searchInput.value = incomingQuery;
      // Fire off the asynchronous fetch pipeline to your FastAPI server
      runSearch(incomingQuery);
    } else {
      if (searchInput) searchInput.focus();
    }
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