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

// threshold of vertical scroll in pixels before showing/hiding the navbar
const NAV_VISIBILITY_THRESHOLD_DESKTOP = 12;
const NAV_VISIBILITY_THRESHOLD_MOBILE = 28;
const SCREEN_WIDTH_THRESHOLD = 768;

const isDesktop = window.matchMedia(`(min-width: ${SCREEN_WIDTH_THRESHOLD}px)`);
const navBar = document.getElementById("navbar");
const drawer = document.getElementById("nav-side-drawer");
const navHeight = navBar?.getBoundingClientRect().height || 0;

/**
 * @typedef {Object} NavScrollState
 * @property {number} currentScrollY
 * @property {-1 | 0 | 1} lastDirection
 * @property {number} accumulatedDelta
 * @property {boolean} navVisible
 */

function getNavVisibilityThreshold() {
  return isDesktop.matches
    ? NAV_VISIBILITY_THRESHOLD_DESKTOP
    : NAV_VISIBILITY_THRESHOLD_MOBILE;
}

/**
 * Convert a scroll delta into a normalized direction.
 * @param {number} deltaY
 * @returns {-1 | 0 | 1}
 */
function getScrollDirection(deltaY) {
  if (deltaY === 0) return 0;
  return deltaY > 0 ? 1 : -1;
}

/**
 * Determine whether the navbar should stay visible regardless of scroll
 * direction, such as near the top of the page or while the menu drawer is open.
 * @param {HTMLElement | null} drawer
 * @param {number} currentScrollY
 * @param {number} navHeight
 * @returns {boolean}
 */
function shouldShowNavByDefault(drawer, currentScrollY, navHeight) {
  return (
    isNavMenuOpen(drawer) || currentScrollY <= window.innerHeight - navHeight
  );
}

/**
 * Reset scroll accumulated scroll delta when the navbar must remain visible.
 * @param {NavScrollState} state
 */
function resetNavScrollState(state) {
  state.navVisible = true;
  state.lastDirection = 0;
  state.accumulatedDelta = 0;
}

/**
 * Update navbar visibility using accumulated scroll distance so tiny direction
 * changes do not immediately show or hide the bar.
 * @param {NavScrollState} state
 * @param {number} deltaY
 * @returns {boolean}
 */
function updateNavVisibility(state, deltaY) {
  const direction = getScrollDirection(deltaY);

  if (direction !== 0) {
    if (direction !== state.lastDirection) {
      state.accumulatedDelta = 0;
      state.lastDirection = direction;
    }
    state.accumulatedDelta += deltaY;
  }

  const threshold = getNavVisibilityThreshold();

  if (
    direction > 0 &&
    state.navVisible &&
    state.accumulatedDelta >= threshold
  ) {
    state.navVisible = false;
    state.accumulatedDelta = 0;
  } else if (
    direction < 0 &&
    !state.navVisible &&
    Math.abs(state.accumulatedDelta) >= threshold
  ) {
    state.navVisible = true;
    state.accumulatedDelta = 0;
  }

  return state.navVisible;
}

/**
 * @param {string} color
 */
function applyNavColor(color = DEFAULT_COLOR) {
  navBar?.classList.remove("purple", "green", "pink");
  navBar?.classList.add(color);
  drawer?.classList.remove("purple", "green", "pink");
  drawer?.classList.add(color);
}

/**
 * @param {HTMLElement} navbar
 */
function toggleNavDisplay(show) {
  navBar?.classList.toggle("nav-hidden", !show);
  navBar?.setAttribute("data-nav-visible", show ? "true" : "false");
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

const BODY_CLASSES = ["overflow-hidden"];
const BACKDROP_CLOSED_CLASSES = ["opacity-0", "pointer-events-none"];
const BACKDROP_OPEN_CLASSES = ["opacity-100", "pointer-events-auto"];
const DRAWER_CLOSED_CLASSES = [
  "-translate-x-full",
  "opacity-0",
  "pointer-events-none",
  "is-opening",
];
const DRAWER_OPEN_CLASSES = [
  "translate-x-0",
  "opacity-100",
  "pointer-events-auto",
  "is-opening",
];

/**
 * @param {{drawer: HTMLElement, backdrop: HTMLElement, toggleButton: HTMLElement}} state
 * @param {boolean} open
 */
function setNavMenuState({ drawer, backdrop, toggleButton }, open) {
  if (!drawer || !backdrop || !toggleButton) return;

  if (open) {
    drawer.classList.remove(...DRAWER_CLOSED_CLASSES);
    drawer.classList.add(...DRAWER_OPEN_CLASSES);
    backdrop.classList.remove(...BACKDROP_CLOSED_CLASSES);
    backdrop.classList.add(...BACKDROP_OPEN_CLASSES);
    drawer.setAttribute("aria-hidden", "false");
    toggleButton.setAttribute("aria-expanded", "true");
    document.body.classList.add(...BODY_CLASSES);
  } else {
    drawer.classList.remove(...DRAWER_OPEN_CLASSES);
    drawer.classList.add(...DRAWER_CLOSED_CLASSES);
    backdrop.classList.remove(...BACKDROP_OPEN_CLASSES);
    backdrop.classList.add(...BACKDROP_CLOSED_CLASSES);
    drawer.setAttribute("aria-hidden", "true");
    toggleButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove(...BODY_CLASSES);
  }
}

function initNavMenuToggle() {
  const toggleButton = document.getElementById("nav-menu-toggle");
  const closeButton = document.getElementById("nav-menu-close");
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
    if (!navBar) return;

    const sections = Array.from(document.querySelectorAll("[data-nav-color]"));

    if (!sections.length) return applyNavColor(DEFAULT_COLOR);

    /** @type {NavScrollState} */
    const navScrollState = {
      currentScrollY: window.scrollY,
      lastDirection: 0,
      accumulatedDelta: 0,
      navVisible: true,
    };

    function syncNavColor() {
      applyNavColor(detectActiveSectionColor(sections));
    }

    function onScroll() {
      const nextScrollY = window.scrollY;
      const deltaY = nextScrollY - navScrollState.currentScrollY;
      navScrollState.currentScrollY = nextScrollY;

      const drawer = document.getElementById("nav-side-drawer");
      const showNavByDefault = shouldShowNavByDefault(
        drawer,
        navScrollState.currentScrollY,
        navHeight,
      );

      if (showNavByDefault) {
        resetNavScrollState(navScrollState);
        toggleNavDisplay(true);
        syncNavColor();
        return;
      }

      const navVisible = updateNavVisibility(navScrollState, deltaY);
      toggleNavDisplay(navVisible);
      syncNavColor();
    }

    toggleNavDisplay(true);
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
