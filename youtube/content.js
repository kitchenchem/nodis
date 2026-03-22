function isHomePage() {
  const path = window.location.pathname;
  return path === "/" || path === "";
}

function injectNav() {
  if (!isHomePage()) {
    const existing = document.getElementById("yt-focus-nav");
    if (existing) existing.remove();
    return;
  }

  if (document.getElementById("yt-focus-nav")) return;

  const container =
    document.querySelector("ytd-browse[page-subtype='home'] #primary") ||
    document.querySelector("#primary");
  if (!container) return;

  const nav = document.createElement("div");
  nav.id = "yt-focus-nav";

  const links = [
    { label: "Downloads", href: "https://www.youtube.com/feed/downloads" },
    { label: "Playlists", href: "https://www.youtube.com/feed/playlists" },
    { label: "History", href: "https://www.youtube.com/feed/history" },
  ];

  for (const link of links) {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    nav.appendChild(a);
  }

  container.prepend(nav);
}

const BLOCKED_SIDEBAR_SECTIONS = ["explore", "more from youtube"];
const BLOCKED_SIDEBAR_ITEMS = ["shorts"];

function blockSidebarSections() {
  const guide = document.querySelector("tp-yt-app-drawer #guide-content") ||
                document.querySelector("#guide-content");
  if (!guide) return;

  // Block entire sections by heading text (Explore, More from YouTube)
  const sections = guide.querySelectorAll("ytd-guide-section-renderer");
  for (const section of sections) {
    const title = section.querySelector("#guide-section-title, h3");
    if (!title) continue;
    const text = title.textContent.trim().toLowerCase();
    if (BLOCKED_SIDEBAR_SECTIONS.some((s) => text.includes(s))) {
      section.classList.add("yt-focus-blocked");
    }
  }

  // Block individual items by label (Shorts)
  const entries = guide.querySelectorAll("ytd-guide-entry-renderer");
  for (const entry of entries) {
    const label = entry.querySelector("yt-formatted-string, .title");
    if (!label) continue;
    const text = label.textContent.trim().toLowerCase();
    if (BLOCKED_SIDEBAR_ITEMS.includes(text)) {
      entry.classList.add("yt-focus-blocked");
    }
  }
}

function blockMiniSidebarShorts() {
  // Collapsed/mini sidebar uses ytd-mini-guide-entry-renderer
  const entries = document.querySelectorAll("ytd-mini-guide-entry-renderer");
  for (const entry of entries) {
    const label = entry.querySelector("yt-formatted-string, .title, .yt-core-attributed-string");
    if (!label) continue;
    const text = label.textContent.trim().toLowerCase();
    if (text === "shorts") {
      entry.classList.add("yt-focus-blocked");
    }
  }
}

function runAll() {
  injectNav();
  blockSidebarSections();
  blockMiniSidebarShorts();
}

runAll();

let debounceTimer = null;
const observer = new MutationObserver(() => {
  if (debounceTimer) return;
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    observer.disconnect();
    runAll();
    observer.observe(document.body, { subtree: true, childList: true });
  }, 150);
});
observer.observe(document.body, { subtree: true, childList: true });
