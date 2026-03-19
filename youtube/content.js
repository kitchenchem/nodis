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

function hideShortsEverywhere() {
  // Hide Shorts shelf renderers (old style)
  const shelves = document.querySelectorAll(
    "ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]"
  );
  for (const shelf of shelves) {
    shelf.style.display = "none";
    const parentSection = shelf.closest("ytd-item-section-renderer, ytd-shelf-renderer");
    if (parentSection) parentSection.style.display = "none";
  }

  // Hide new view-model based Shorts grid shelf (search results)
  const gridShelves = document.querySelectorAll("grid-shelf-view-model");
  for (const shelf of gridShelves) {
    shelf.style.display = "none";
  }

  // Hide individual Shorts lockup items
  const shortsLockups = document.querySelectorAll(
    "ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2"
  );
  for (const lockup of shortsLockups) {
    lockup.style.display = "none";
  }

  // Hide any individual video item that links to /shorts/
  const videoRenderers = document.querySelectorAll(
    "ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer"
  );
  for (const renderer of videoRenderers) {
    const link = renderer.querySelector('a[href*="/shorts/"]');
    const badge = renderer.querySelector('[overlay-style="SHORTS"]');
    if (link || badge) {
      renderer.style.display = "none";
    }
  }

  // Hide anything with the SHORTS overlay badge
  const shortsBadges = document.querySelectorAll('[overlay-style="SHORTS"]');
  for (const badge of shortsBadges) {
    const renderer = badge.closest(
      "ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ytd-item-section-renderer, ytd-shelf-renderer"
    );
    if (renderer) renderer.style.display = "none";
  }
}

// Run on page load and on SPA navigation
injectNav();
blockSidebarSections();
blockMiniSidebarShorts();
hideShortsEverywhere();

const observer = new MutationObserver(() => {
  // Always try to inject nav — if we're on homepage and it's missing
  // (e.g. YouTube rebuilt the DOM), it needs to be re-added
  injectNav();
  blockSidebarSections();
  blockMiniSidebarShorts();
  hideShortsEverywhere();
});

observer.observe(document.body, { subtree: true, childList: true });
