let lastPathname = window.location.pathname;

function isHomePage() {
  return window.location.pathname === "/" || window.location.pathname === "/home";
}

function isSearchPage() {
  return window.location.pathname.startsWith("/search");
}

// Toggle body class so CSS rules are scoped to home page only
function updatePageClass() {
  document.body.classList.toggle("nodis-home", isHomePage());
}

// Manage the home page banner (all hiding is done via CSS + body class)
function blockHomeFeed() {
  updatePageClass();

  if (!isHomePage()) {
    const banner = document.getElementById("nodis-x-banner");
    if (banner) banner.remove();
    return;
  }

  const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
  if (!primaryColumn || document.getElementById("nodis-x-banner")) return;

  const header = primaryColumn.querySelector("header, [data-testid='TopNavBar']");
  const insertTarget = header ? header.parentElement : primaryColumn;

  const banner = document.createElement("div");
  banner.id = "nodis-x-banner";
  banner.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "min-height:50vh;gap:24px;padding:60px 20px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";

  const msg = document.createElement("div");
  msg.style.cssText = "font-size:22px;font-weight:700;color:var(--text-color, #e7e9ea);";
  msg.textContent = "you're free";
  banner.appendChild(msg);

  const hint = document.createElement("div");
  hint.style.cssText = "font-size:15px;color:var(--text-color, #71767b);";
  hint.textContent = "mindful doomscrolling";
  banner.appendChild(hint);

  const links = [
    { label: "notifications", href: "/notifications" },
    { label: "messages", href: "/messages" },
    { label: "lists", href: "/" + NODIS_CONFIG.X_USERNAME + "/lists" },
    { label: "bookmarks", href: "/i/bookmarks" },
  ];

  const nav = document.createElement("div");
  nav.style.cssText = "display:flex;gap:20px;margin-top:12px;";
  for (const link of links) {
    const a = document.createElement("a");
    a.textContent = link.label;
    a.href = link.href;
    a.style.cssText =
      "padding:10px 24px;border-radius:9999px;font-size:15px;font-weight:700;" +
      "text-decoration:none;color:#fff;background:#1d9bf0;transition:background 0.15s;";
    a.addEventListener("mouseenter", () => (a.style.background = "#1a8cd8"));
    a.addEventListener("mouseleave", () => (a.style.background = "#1d9bf0"));
    nav.appendChild(a);
  }
  banner.appendChild(nav);

  if (header && header.nextSibling) {
    insertTarget.insertBefore(banner, header.nextSibling);
  } else {
    insertTarget.appendChild(banner);
  }
}

// Hide everything in the sidebar except the search box
function blockSidebarNoise() {
  const sidebar = document.querySelector('[data-testid="sidebarColumn"]');
  if (!sidebar) return;

  const newsSidebar = sidebar.querySelector('[data-testid="news_sidebar"]');
  if (newsSidebar) newsSidebar.style.display = "none";

  const sections = sidebar.querySelectorAll("section, aside");
  for (const s of sections) {
    s.style.display = "none";
  }

  const searchForm = sidebar.querySelector('form[role="search"]');
  if (searchForm) {
    let sibling = searchForm.closest("div[class]");
    if (sibling) {
      sibling = sibling.nextElementSibling;
      while (sibling) {
        sibling.style.display = "none";
        sibling = sibling.nextElementSibling;
      }
    }
  }
}

// On search page, remove algorithmic suggestions, keep query results
function cleanSearchResults() {
  if (!isSearchPage()) return;

  const trends = document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="trend"]');
  for (const t of trends) {
    t.style.display = "none";
  }

  const sidebar = document.querySelector('[data-testid="sidebarColumn"]');
  if (sidebar) {
    const sections = sidebar.querySelectorAll("section, aside");
    for (const section of sections) {
      const heading = section.querySelector("h2, h3, [role='heading']");
      if (!heading) continue;
      const text = heading.textContent.trim().toLowerCase();
      if (
        text.includes("who to follow") ||
        text.includes("you might like") ||
        text.includes("topics to follow") ||
        text.includes("relevant people")
      ) {
        section.style.display = "none";
      }
    }
  }
}

// Hide the Explore link from the left navigation
function hideExploreNav() {
  const navLinks = document.querySelectorAll('a[data-testid="AppTabBar_Explore_Link"], a[href="/explore"]');
  for (const link of navLinks) {
    link.style.display = "none";
  }
}

function runAll() {
  blockHomeFeed();
  blockSidebarNoise();
  cleanSearchResults();
  hideExploreNav();
}

runAll();

const observer = new MutationObserver(runAll);
observer.observe(document.body, { subtree: true, childList: true });

// Content scripts can't intercept the page's pushState calls (isolated world),
// so poll for URL changes to catch SPA navigation reliably.
setInterval(() => {
  if (window.location.pathname !== lastPathname) {
    lastPathname = window.location.pathname;
    runAll();
  }
}, 200);
