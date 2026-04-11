/**
 * Homepage-only section switching driven by GSAP.
 *
 * One downward gesture/key down moves to the next scroll stop.
 * One upward gesture/key up moves to the previous scroll stop.
 * The footer is treated as the final stop after the homepage sections.
 * Nested scrollable containers keep native scrolling when they still
 * have scroll range in the gesture direction.
 */

const SECTION_SELECTOR = "main section.home-section";
const FOOTER_SELECTOR = "body > footer";

const DESKTOP_SCROLL_DURATION = 1.35;
const MOBILE_SCROLL_DURATION = 0.85;

const WHEEL_THRESHOLD = 18;
const DESKTOP_TOUCH_THRESHOLD = 48;
const MOBILE_TOUCH_THRESHOLD = 72;

const SCREEN_WIDTH_THRESHOLD = 768;

const isDesktop = window.matchMedia(`(min-width: ${SCREEN_WIDTH_THRESHOLD}px)`);

/**
 * Collect all scroll destinations in DOM order, including the footer.
 * @returns {HTMLElement[]}
 */
function getScrollStops() {
  const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
  const footer = document.querySelector(FOOTER_SELECTOR);

  if (footer instanceof HTMLElement) {
    sections.push(footer);
  }

  return sections;
}

/**
 * Detect the closest scroll stop to the current window position.
 * @param {HTMLElement[]} stops
 * @returns {number}
 */
function getClosestStopIndex(stops) {
  const currentY = window.scrollY;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  stops.forEach((stop, index) => {
    const distance = Math.abs(stop.offsetTop - currentY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

/**
 * Find the nearest scrollable ancestor of an element, if any.
 * @param {HTMLElement | null} element
 * @returns {HTMLElement | null}
 */
function findScrollableAncestor(element) {
  let current = element;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);

    if (canScrollY && current.scrollHeight > current.clientHeight + 1) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

/**
 * Check if a nested scroll container can absorb the gesture.
 * @param {HTMLElement | null} scrollable
 * @param {number} direction
 * @returns {boolean}
 */
function canScrollableHandleDirection(scrollable, direction) {
  if (!scrollable) return false;

  if (direction > 0) {
    return (
      scrollable.scrollTop + scrollable.clientHeight <
      scrollable.scrollHeight - 1
    );
  }

  return scrollable.scrollTop > 1;
}

function isNavMenuOpen() {
  const drawer = document.getElementById("nav-side-drawer");
  return drawer?.getAttribute("aria-hidden") === "false";
}

function sectionFitsViewport(section) {
  return section instanceof HTMLElement
    ? section.offsetHeight <= window.innerHeight
    : false;
}

/**
 * On mobile, use a higher touch threshold to avoid triggering section
 * scroll unintentionally when trying to scroll within a section that
 * doesn't fit in the viewport
 */
function getScrollDuration() {
  return isDesktop.matches ? DESKTOP_SCROLL_DURATION : MOBILE_SCROLL_DURATION;
}

// same here
function getTouchThreshold() {
  return isDesktop.matches ? DESKTOP_TOUCH_THRESHOLD : MOBILE_TOUCH_THRESHOLD;
}

/**
 * Initialize GSAP animations for the "Espaces" section, triggered on scroll.
 * - The hero content slides in from left to right while fading in.
 * - The subtitle fades in and out when entering/leaving the viewport.
 */
function initEspacesAnimations({ goToStop }) {
  const heroSection = document.querySelector('[data-espaces-section="hero"]');
  const heroContent = heroSection?.querySelector("[data-espaces-hero-content]");
  const subtitleSection = document.querySelector(
    '[data-espaces-section="subtitle"]',
  );
  const subtitleContent = subtitleSection?.querySelector(
    "[data-espaces-subtitle-content]",
  );
  const heroIndex = heroSection
    ? Array.from(document.querySelectorAll(SECTION_SELECTOR)).findIndex(
        (section) => section === heroSection,
      )
    : -1;

  if (
    heroSection instanceof HTMLElement &&
    heroContent instanceof HTMLElement
  ) {
    // animation to slide the text from left to right while fading in,
    // triggered when the section enters the viewport
    const textTimeline = gsap.timeline({
      paused: true,
      defaults: { duration: isDesktop.matches ? 5 : 15, ease: "power2.out" },
    });

    textTimeline.fromTo(
      heroContent,
      { xPercent: isDesktop.matches ? 50 : -50, autoAlpha: 0.35 },
      { xPercent: isDesktop.matches ? 0 : 120, autoAlpha: 1 },
    );

    const goToNextOnComplete = () => {
      if (heroIndex > 0) goToStop(heroIndex + 1);
      textTimeline.eventCallback("onComplete", null);
    };

    ScrollTrigger.create({
      trigger: heroSection,
      start: "top 70%",
      end: "bottom 30%",
      onEnter: () => {
        // first section enter, allow advancing to next
        // section (fading text) when animation completes
        textTimeline.eventCallback("onComplete", goToNextOnComplete);
        textTimeline.restart();
      },
      onEnterBack: () => textTimeline.play(),
      onLeave: () => textTimeline.reverse(),
      onLeaveBack: () => textTimeline.reverse(),
    });
  }

  if (
    subtitleSection instanceof HTMLElement &&
    subtitleContent instanceof HTMLElement
  ) {
    // have the subtitle fade in and out when the section enters/leavess the viewport
    const subtitleTimeline = gsap.timeline({
      paused: true,
      defaults: { duration: 3, ease: "power2.out" },
    });

    subtitleTimeline.fromTo(
      subtitleContent,
      { autoAlpha: 0 },
      { autoAlpha: 1 },
    );

    const goToNextOnComplete = () => {
      if (heroIndex > 0) goToStop(heroIndex + 2);
      subtitleTimeline.eventCallback("onComplete", null);
    };

    ScrollTrigger.create({
      trigger: subtitleSection,
      start: "top 70%",
      end: "bottom 30%",
      onEnter: () => {
        // first section enter, allow advancing to next (spaces list)
        subtitleTimeline.eventCallback("onComplete", goToNextOnComplete);
        subtitleTimeline.restart();
      },
      onEnterBack: () => subtitleTimeline.play(),
      onLeave: () => subtitleTimeline.reverse(),
      onLeaveBack: () => subtitleTimeline.reverse(),
    });
  }
}

function initHomeSectionScroll() {
  if (!document.body.classList.contains("template-homepage")) return;
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollToPlugin) return;
  if (window.__homeSectionScrollInitialized) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stops = getScrollStops();
  if (stops.length < 2) return;

  window.__homeSectionScrollInitialized = true;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  let currentIndex = getClosestStopIndex(stops);
  let isAnimating = false;
  let touchStartY = 0;
  let touchLastY = 0;
  let touchScrollable = null;
  let touchCaptured = false;

  // prevent automatic scroll animation to the next section
  // if the current section doesn't fit in the viewport
  // (ie. the user needs to scroll manually to see all content,
  // like on mobile for the spaces list section)
  function currentStopNeedsNativeScroll() {
    const currentStop = stops[currentIndex];
    return (
      currentStop instanceof HTMLElement && !sectionFitsViewport(currentStop)
    );
  }

  /**
   * Go to home section at the specified index with a smooth scroll animation.
   * @param {number} nextIndex
   * @returns {boolean}
   */
  function goToStop(nextIndex) {
    if (nextIndex < 0 || nextIndex >= stops.length || isAnimating) {
      return false;
    }

    const targetStop = stops[nextIndex];
    if (!targetStop || nextIndex === currentIndex) {
      return false;
    }

    isAnimating = true;
    currentIndex = nextIndex;

    gsap.to(window, {
      duration: getScrollDuration(),
      ease: "power2.inOut",
      overwrite: true,
      scrollTo: {
        y: targetStop,
        autoKill: false,
      },
      onComplete: () => {
        isAnimating = false;
      },
      onInterrupt: () => {
        isAnimating = false;
        currentIndex = getClosestStopIndex(stops);
      },
    });

    return true;
  }

  initEspacesAnimations({ goToStop });

  // create GSAP ScrollTriggers for each stop (home sections + footer)
  // to keep track of the current index
  stops.forEach((stop, index) => {
    ScrollTrigger.create({
      trigger: stop,
      start: "top center",
      end: "bottom center",
      onEnter: () => (currentIndex = index),
      onEnterBack: () => (currentIndex = index),
    });
  });

  /**
   * Handle directional input for scrolling.
   * @param {number} deltaY
   * @param {HTMLElement | null} eventTarget
   * @returns {boolean}
   */
  function handleDirectionalInput(deltaY, eventTarget) {
    const direction = deltaY > 0 ? 1 : -1;
    if (isAnimating || isNavMenuOpen()) return false;

    if (currentStopNeedsNativeScroll()) return false;

    const scrollable = findScrollableAncestor(
      eventTarget instanceof HTMLElement ? eventTarget : null,
    );

    if (canScrollableHandleDirection(scrollable, direction)) return false;

    return goToStop(currentIndex + direction);
  }

  /**
   * @param {WheelEvent} event
   */
  function onWheel(event) {
    if (isAnimating) return event.preventDefault();
    if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
    const handled = handleDirectionalInput(event.deltaY, event.target);
    if (handled) event.preventDefault();
  }

  /**
   * @param {TouchEvent} event
   */
  function onTouchStart(event) {
    if (!event.touches.length) return;
    touchStartY = event.touches[0].clientY;
    touchLastY = touchStartY;
    touchCaptured = false;
    touchScrollable = findScrollableAncestor(
      event.target instanceof HTMLElement ? event.target : null,
    );
  }

  /**
   * @param {TouchEvent} event
   */
  function onTouchMove(event) {
    if (!event.touches.length || isNavMenuOpen()) return;
    if (isAnimating) return event.preventDefault();

    touchLastY = event.touches[0].clientY;
    const deltaY = touchStartY - touchLastY;
    if (Math.abs(deltaY) < getTouchThreshold()) return;

    if (currentStopNeedsNativeScroll()) {
      touchCaptured = false;
      return;
    }

    const direction = deltaY > 0 ? 1 : -1;
    if (canScrollableHandleDirection(touchScrollable, direction)) {
      touchCaptured = false;
      return;
    }

    touchCaptured = true;
    event.preventDefault();
  }

  /**
   * @param {TouchEvent} event
   */
  function onTouchEnd(event) {
    if (isAnimating) return event.preventDefault();
    const deltaY = touchStartY - touchLastY;
    if (Math.abs(deltaY) < getTouchThreshold()) return;
    const handled = handleDirectionalInput(deltaY, event.target);
    if (handled && touchCaptured) event.preventDefault();
  }

  function onResize() {
    currentIndex = getClosestStopIndex(stops);
    ScrollTrigger.refresh();
  }

  /**
   * @param {KeyboardEvent} event
   * @returns
   */
  function onKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      const handled = handleDirectionalInput(1, event.target);
      if (handled) event.preventDefault();
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      const handled = handleDirectionalInput(-1, event.target);
      if (handled) event.preventDefault();
    }
  }

  // listen to wheel, touch, and key events at the window level
  // to capture them before any scrollable containers
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: false });
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHomeSectionScroll);
} else {
  initHomeSectionScroll();
}
