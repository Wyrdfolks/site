/**
 * Script used by the navbar to change its display dynamically
 * on scroll:
 *
 * - The navbar hides when the user scrolls down by at least the screen height
 * - The navbar shows when the user scrolls up, or when they're at the top of the page
 * - The navbar also changes color based on the section of the page currently in view
 * - On menu button click, the side navigation menu drawer is toggled
 */

const DEFAULT_COLOR = "purple";

/**
 * @param {HTMLElement} navbar
 * @param {string} color
 */
function applyNavColor(navbar, color = DEFAULT_COLOR) {
  navbar.classList.remove("purple", "green", "pink");
  navbar.classList.add(color);
}

/**
 * @param {HTMLElement} navbar
 * @param {boolean} show
 */
function toggleNavDisplay(navbar, show) {
  if (show) navbar.classList.remove("hidden");
  else navbar.classList.add("hidden");
}

/**
 * Detects the active section based on which one is at the top of
 * the viewport, or the closest one above it, to determine the nav color.
 * @param {HTMLElement[]} sections
 * @returns {"purple" | "green" | "pink"}
 */
function detectActiveSectionColor(sections) {
  const topY = 0;
  let active = null;
  let closestAbove = null;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= topY && rect.bottom >= topY) active = section;
    else if (rect.top <= topY) closestAbove = section;
  }

  const activeSection = active || closestAbove || sections[0];
  const color = activeSection?.dataset?.navColor || DEFAULT_COLOR;
  return color;
}

function isNavMenuOpen(drawer) {
  return drawer?.getAttribute("aria-hidden") === "false";
}

/**
 * @param {{drawer: HTMLElement, backdrop: HTMLElement, toggleButton: HTMLElement}} state
 * @param {boolean} open
 */
function setNavMenuState({ drawer, backdrop, toggleButton }, open) {
  if (!drawer || !backdrop || !toggleButton) return;

  if (open) {
    drawer.classList.remove(
      "-translate-x-full",
      "opacity-0",
      "pointer-events-none",
    );
    drawer.classList.add("translate-x-0", "opacity-100", "pointer-events-auto");
    backdrop.classList.remove("opacity-0", "pointer-events-none");
    backdrop.classList.add("opacity-100", "pointer-events-auto");
    drawer.setAttribute("aria-hidden", "false");
    toggleButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("overflow-hidden");
  } else {
    drawer.classList.remove(
      "translate-x-0",
      "opacity-100",
      "pointer-events-auto",
    );
    drawer.classList.add(
      "-translate-x-full",
      "opacity-0",
      "pointer-events-none",
    );
    backdrop.classList.remove("opacity-100", "pointer-events-auto");
    backdrop.classList.add("opacity-0", "pointer-events-none");
    drawer.setAttribute("aria-hidden", "true");
    toggleButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("overflow-hidden");
  }
}

function initNavMenuToggle() {
  const toggleButton = document.getElementById("nav-menu-toggle");
  const closeButton = document.getElementById("nav-menu-close");
  const drawer = document.getElementById("nav-side-drawer");
  const backdrop = document.getElementById("nav-menu-backdrop");

  if (!toggleButton || !drawer || !backdrop) return;

  const menuElements = { drawer, backdrop, toggleButton };

  setNavMenuState(menuElements, false);

  toggleButton.addEventListener("click", () => {
    setNavMenuState(menuElements, !isNavMenuOpen(drawer));
  });

  backdrop.addEventListener("click", () => {
    setNavMenuState(menuElements, false);
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      setNavMenuState(menuElements, false);
    });
  }

  const links = drawer.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      setNavMenuState(menuElements, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isNavMenuOpen(drawer)) {
      setNavMenuState(menuElements, false);
      toggleButton.focus();
    }
  });
}

(function () {
  function initNavColorSwitching() {
    const navBar = document.getElementById("navbar");
    if (!navBar) return;

    const sections = Array.from(document.querySelectorAll("[data-nav-color]"));

    if (!sections.length) return applyNavColor(navBar, DEFAULT_COLOR);

    let currentScrollY = window.scrollY;

    function syncNavColor() {
      applyNavColor(navBar, detectActiveSectionColor(sections));
    }

    function onScroll() {
      const scrollingUp = currentScrollY - window.scrollY > 0;
      currentScrollY = window.scrollY;
      const drawer = document.getElementById("nav-side-drawer");
      const showNav =
        isNavMenuOpen(drawer) ||
        scrollingUp ||
        currentScrollY <= window.innerHeight;
      toggleNavDisplay(navBar, showNav);
      syncNavColor();
    }

    syncNavColor();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncNavColor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initNavColorSwitching();
      initNavMenuToggle();
    });
  } else {
    initNavColorSwitching();
    initNavMenuToggle();
  }
})();
