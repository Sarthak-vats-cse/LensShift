(function () {
  "use strict";

  // 1. Extract the active search query directly from Google's URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("q");

  if (!searchQuery) return;

  console.log("[LensShift] Intercepted Google query:", searchQuery);

  // 2. Adjust Google's main layout style so it doesn't overlap with our sidebar
  const mainContent = document.getElementById("rcnt");
  if (mainContent) {
    mainContent.style.marginRight = "420px";
  }

  // 3. Create a host element for the isolated Shadow DOM
  const host = document.createElement("div");
  host.id = "lensshift-extension-root";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.right = "0";
  host.style.width = "400px";
  host.style.height = "100vh";
  host.style.zIndex = "999999";
  document.body.appendChild(host);

  // 4. Attach the Shadow Root to completely sandbox the styles
  const shadowRoot = host.attachShadow({ mode: "open" });

  // 5. Build an iframe inside the Shadow DOM to load your index.html cleanly
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  // We use just "index.html" assuming your manifest and HTML are in the same root folder
  iframe.src = chrome.runtime.getURL("index.html?q=" + encodeURIComponent(searchQuery));
  
  shadowRoot.appendChild(iframe);
})();