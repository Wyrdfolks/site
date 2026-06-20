/**
 * Homepage section animation orchestration for continuous scrolling.
 *
 * Section controllers own animation behavior. This file wires controllers
 * to ScrollTrigger lifecycle callbacks (enter/leave/enterBack/leaveBack).
 */

(() => {
  const SECTION_SELECTOR = "main section.home-section";
  const FOOTER_SELECTOR = "body > footer";

  const SHARED_SCREEN_THRESHOLD = 768;
  const LIFECYCLE_COOLDOWN_MS = 140;

  // Hero section animation timings (in seconds)
  const HERO_INTRO_DURATION = 2;
  const HERO_OUTRO_DURATION = 1.8;
  const HERO_STICKER_DURATION = 0.5;

  window.wyrdUi = window.wyrdUi || {};
  window.wyrdUi.screenThreshold =
    window.wyrdUi.screenThreshold ?? SHARED_SCREEN_THRESHOLD;
  window.wyrdUi.desktopMedia =
    window.wyrdUi.desktopMedia ||
    window.matchMedia(`(min-width: ${window.wyrdUi.screenThreshold}px)`);

  const desktopMedia = window.wyrdUi.desktopMedia;

  /**
   * Collect all section stops in DOM order, including footer.
   *
   * @returns {HTMLElement[]}
   */
  function getStops() {
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    const footer = document.querySelector(FOOTER_SELECTOR);

    if (footer instanceof HTMLElement) {
      sections.push(footer);
    }

    return sections;
  }

  /**
   * Detect closest stop index to current scroll position.
   *
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
   * Build scrubbed background transitions so section colors blend instead
   * of switching abruptly at boundaries.
   *
   * @returns {Array<{ kill: () => void }>}
   */
  function initSectionBackgroundTransitions() {
    const sections = Array.from(document.querySelectorAll("[data-nav-color]"));
    if (sections.length < 2) return [];

    /** @type {Array<{ kill: () => void }> } */
    const backgroundArtifacts = [];

    let previousColor = window.getComputedStyle(sections[0]).backgroundColor;

    sections.forEach((section, index) => {
      if (!(section instanceof HTMLElement)) return;

      const currentColor = window.getComputedStyle(section).backgroundColor;

      if (index === 0) {
        section.style.backgroundColor = currentColor;
        previousColor = currentColor;
        return;
      }

      // Start from previous section color and blend toward current as the
      // new section scrolls in.
      section.style.backgroundColor = previousColor;

      const blendTween = gsap.to(section, {
        backgroundColor: currentColor,
        ease: "none",
        paused: true,
      });

      const blendTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "top 40%",
        scrub: 1,
        animation: blendTween,
        invalidateOnRefresh: true,
      });

      backgroundArtifacts.push(blendTween, blendTrigger);
      previousColor = currentColor;
    });

    return backgroundArtifacts;
  }

  function initHomeSectionScroll() {
    if (!document.body.classList.contains("template-homepage")) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.__homeSectionScrollInitialized) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const controllersApi = window.wyrdUi?.homeSectionControllers;
    if (!controllersApi) return;

    const stops = getStops();
    if (stops.length < 2) return;

    window.__homeSectionScrollInitialized = true;

    gsap.registerPlugin(ScrollTrigger);

    function initLenisBridge() {
      if (!window.Lenis) return () => {};
      if (window.__homeLenisInitialized) return () => {};

      const lenis = new window.Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: true,
      });

      const onLenisScroll = () => ScrollTrigger.update();
      const onGsapTick = (time) => {
        lenis.raf(time * 1000);
      };

      lenis.on("scroll", onLenisScroll);
      gsap.ticker.add(onGsapTick);
      gsap.ticker.lagSmoothing(0);

      window.wyrdUi.homeLenis = lenis;
      window.__homeLenisInitialized = true;

      return () => {
        gsap.ticker.remove(onGsapTick);
        lenis.off("scroll", onLenisScroll);
        lenis.destroy();
        delete window.wyrdUi.homeLenis;
        window.__homeLenisInitialized = false;
      };
    }

    const cleanupLenisBridge = initLenisBridge();

    const noOpController = controllersApi.createNoOpSectionController();

    /**
     * Build section animation controllers keyed by section index.
     *
     * @returns {Map<number, typeof noOpController>}
     */
    function buildSectionControllers() {
      const controllers = new Map();

      /**
       * Resolve stop index for a section selector.
       *
       * @param {string} selector
       * @returns {number}
       */
      function getSectionStopIndex(selector) {
        const section = document.querySelector(selector);
        return section ? stops.findIndex((stop) => stop === section) : -1;
      }

      /**
       * Register a section controller by selector.
       *
       * @param {string} selector
       * @param {(params: { sectionIndex: number }) => SectionController} createController
       */
      function registerSectionController(selector, createController) {
        const sectionIndex = getSectionStopIndex(selector);
        if (sectionIndex < 0) return;
        controllers.set(sectionIndex, createController({ sectionIndex }));
      }

      registerSectionController("[data-home-hero]", () =>
        controllersApi.createHeroSectionController({
          heroIntroDuration: HERO_INTRO_DURATION,
          heroOutroDuration: HERO_OUTRO_DURATION,
          heroStickerDuration: HERO_STICKER_DURATION,
        }),
      );

      registerSectionController("[data-home-presentation]", () =>
        controllersApi.createPresentationSectionController(),
      );

      registerSectionController('[data-espaces-section="hero"]', () =>
        controllersApi.createEspacesSectionController({
          desktopMedia,
        }),
      );

      registerSectionController("[data-espaces-mondes]", () =>
        controllersApi.createEspacesMondesController({
          desktopMedia,
        }),
      );

      registerSectionController("[data-home-guests-cards]", () =>
        controllersApi.createGuestsSectionController(),
      );

      return controllers;
    }

    const sectionControllers = buildSectionControllers();
    const standaloneControllers = [
      controllersApi.createHeroFomoFadeController(),
    ];

    function getSectionController(index) {
      return sectionControllers.get(index) || noOpController;
    }

    function destroySectionControllers() {
      sectionControllers.forEach((controller) => {
        controller.destroy();
      });
      standaloneControllers.forEach((controller) => {
        controller.destroy();
      });
    }

    const cleanupHeroHoverAnimations =
      controllersApi.initHeroStickerHoverAnimations();
    const cleanupGuestsHoverAnimations =
      controllersApi.initGuestsCardHoverAnimations?.() || (() => {});
    const backgroundTransitionArtifacts = initSectionBackgroundTransitions();

    // Ensure current section gets an initial enter callback on first load.
    const initialIndex = getClosestStopIndex(stops);
    getSectionController(initialIndex).onEnter();

    /** @type {Map<string, number>} */
    const lifecycleCooldownByEvent = new Map();

    /**
     * Prevent rapid repeated lifecycle calls near trigger boundaries.
     *
     * @param {number} index
     * @param {"enter" | "leave" | "enterBack" | "leaveBack"} eventName
     * @param {() => void} callback
     */
    function invokeWithCooldown(index, eventName, callback) {
      const key = `${index}:${eventName}`;
      const now = Date.now();
      const lastCall = lifecycleCooldownByEvent.get(key) ?? 0;

      if (now - lastCall < LIFECYCLE_COOLDOWN_MS) return;
      lifecycleCooldownByEvent.set(key, now);
      callback();
    }

    const stopTriggers = [];
    stops.forEach((stop, index) => {
      const controller = getSectionController(index);

      const trigger = ScrollTrigger.create({
        trigger: stop,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () =>
          invokeWithCooldown(index, "enter", () => controller.onEnter()),
        onLeave: () =>
          invokeWithCooldown(index, "leave", () => controller.onLeave()),
        onEnterBack: () =>
          invokeWithCooldown(index, "enterBack", () =>
            controller.onEnterBack(),
          ),
        onLeaveBack: () =>
          invokeWithCooldown(index, "leaveBack", () =>
            controller.onLeaveBack(),
          ),
      });

      stopTriggers.push(trigger);
    });

    let hasTeardownRun = false;

    function onResize() {
      ScrollTrigger.refresh();
    }

    function teardownHomeSectionScroll() {
      if (hasTeardownRun) return;
      hasTeardownRun = true;

      window.removeEventListener("resize", onResize);
      window.removeEventListener("pagehide", teardownHomeSectionScroll);

      stopTriggers.forEach((trigger) => trigger.kill());
      backgroundTransitionArtifacts.forEach((artifact) => artifact.kill());
      cleanupHeroHoverAnimations();
      cleanupGuestsHoverAnimations();
      cleanupLenisBridge();
      destroySectionControllers();
      window.__homeSectionScrollInitialized = false;
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("pagehide", teardownHomeSectionScroll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeSectionScroll);
  } else {
    initHomeSectionScroll();
  }
})();
