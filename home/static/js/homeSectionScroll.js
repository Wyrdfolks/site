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
  const isIosWebkit =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
    /WebKit/.test(window.navigator.userAgent);

  /**
   * Initialize the hash scroll hint for the homepage:
   * Show "scroll down" message if the page has a hash anchor.
   * It disappears once the user shows scroll intent (actual scroll,
   * keyboard nav) and doesn't reappear.
   */
  function initHashScrollHint() {
    if (!document.body.classList.contains("template-homepage")) return;

    let hint = document.querySelector("[data-home-hash-scroll-hint]");
    // fallback to create the hint element if it doesn't exist
    if (!(hint instanceof HTMLElement)) {
      hint = document.createElement("p");
      hint.hidden = true;
      hint.setAttribute("aria-hidden", "true");
      hint.setAttribute("data-home-hash-scroll-hint", "");
      hint.className =
        "fixed left-1/2 bottom-[clamp(0.875rem,3.5vh,1.5rem)] z-40 m-0 -translate-x-1/2 translate-y-1.5 rounded-full bg-black/10 px-3.5 py-1.5 text-[clamp(0.75rem,1.7vw,0.9rem)] uppercase leading-none tracking-widest opacity-0 pointer-events-none transition-all duration-200 ease-out";
      hint.textContent = "Animer";
      hint.title = "Scrollez pour animer";
      document.body.appendChild(hint);
    }

    const hiddenClasses = ["opacity-0", "translate-y-1.5"];
    const visibleClasses = ["opacity-100", "translate-y-0"];
    const bounceClass = "animate-bounce";

    function setHiddenState() {
      hint.classList.remove(...visibleClasses, bounceClass);
      hint.classList.add(...hiddenClasses);
    }

    function setVisibleState() {
      hint.classList.remove(...hiddenClasses);
      hint.classList.add(...visibleClasses);
    }

    // if (!window.location.hash || window.location.hash === "#") {
    //   hint.hidden = true;
    //   setHiddenState();
    //   hint.setAttribute("aria-hidden", "true");
    //   return;
    // }

    let dismissed = false;
    let hasUserScrollIntent = false;
    let intentStartY = window.scrollY;

    function cleanupListeners() {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    }

    function onWheel() {
      hasUserScrollIntent = true;
      intentStartY = window.scrollY;
    }

    function onTouchStart() {
      hasUserScrollIntent = true;
      intentStartY = window.scrollY;
    }

    function dismissHint() {
      if (dismissed) return;
      dismissed = true;
      setHiddenState();
      hint.setAttribute("aria-hidden", "true");
      cleanupListeners();
      window.setTimeout(() => (hint.hidden = true), 220);
    }

    function onKeyDown(event) {
      const keysThatScroll = new Set([
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "Space",
      ]);

      if (keysThatScroll.has(event.code) || keysThatScroll.has(event.key)) {
        hasUserScrollIntent = true;
        intentStartY = window.scrollY;
      }
    }

    function onScroll() {
      if (!hasUserScrollIntent) return;
      if (Math.abs(window.scrollY - intentStartY) > 2) dismissHint();
    }

    hint.hidden = false;
    hint.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => {
      setVisibleState();
      hint.classList.add(bounceClass);
    });

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

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
   * Build section-activation theme transitions. When a section is active in
   * the viewport center, animate body colors to that section's theme.
   *
   * @returns {Array<{ kill: () => void }>}
   */
  function initSectionThemeTransitions() {
    const sections = Array.from(document.querySelectorAll("[data-nav-color]"));
    if (sections.length === 0) return [];

    /** @type {Array<{ kill: () => void }> } */
    const themeArtifacts = [];

    const rootStyles = window.getComputedStyle(document.documentElement);

    /**
     * @param {string} cssVar
     * @param {string} fallback
     * @returns {string}
     */
    function resolveColorVar(cssVar, fallback) {
      return rootStyles.getPropertyValue(cssVar).trim() || fallback;
    }

    const themeByNavColor = {
      purple: {
        backgroundColor: resolveColorVar("--color-wyrd-purple-500", "#5a43f2"),
        color: "white",
      },
      green: {
        backgroundColor: resolveColorVar("--color-wyrd-green-900", "#0c3b2d"),
        color: resolveColorVar("--color-wyrd-green-500", "#6ef2a3"),
      },
      pink: {
        backgroundColor: resolveColorVar("--color-wyrd-pink-500", "#f47ab2"),
        color: resolveColorVar("--color-wyrd-pink-900", "#4d1430"),
      },
    };

    const mondeListThemeByNavColor = {
      purple: {
        ...themeByNavColor.purple,
        backgroundColor: resolveColorVar("--color-wyrd-purple-400", "#9375ff"),
        borderColor: themeByNavColor.purple.color,
      },
      pink: {
        ...themeByNavColor.pink,
        borderColor: themeByNavColor.pink.color,
      },
      green: {
        backgroundColor: resolveColorVar("--color-wyrd-green-800", "#0c3b2d"),
        color: resolveColorVar("--color-wyrd-green-500", "#7cf6a8"),
        borderColor: resolveColorVar("--color-wyrd-green-500", "#7cf6a8"),
      },
    };

    const mondeZoneThemeByNavColor = {
      pink: themeByNavColor.pink,
      purple: {
        backgroundColor: "white",
        color: resolveColorVar("--color-wyrd-indigo-900", "#060412"),
      },
      green: {
        backgroundColor: resolveColorVar("--color-wyrd-green-500", "#6ef2a3"),
        color: resolveColorVar("--color-wyrd-green-900", "#0c3b2d"),
      },
    };

    const fallbackTheme = themeByNavColor.purple;
    const sectionThemeMap = new Map();
    let activeSection = null;

    sections.forEach((section) => {
      if (!(section instanceof HTMLElement)) return;
      const navColor = section.dataset.navColor || "";
      sectionThemeMap.set(section, {
        navColor: themeByNavColor[navColor] ? navColor : "purple",
        theme: themeByNavColor[navColor] || fallbackTheme,
      });
    });

    /**
     * @param {HTMLElement} section
     */
    function applyThemeFromSection(section, immediate = false) {
      const sectionTheme = sectionThemeMap.get(section);
      if (!sectionTheme) return;

      const mondeListTheme =
        mondeListThemeByNavColor[sectionTheme.navColor] ||
        mondeListThemeByNavColor.green;
      const mondeZoneTheme =
        mondeZoneThemeByNavColor[sectionTheme.navColor] ||
        mondeZoneThemeByNavColor.green;

      window.wyrdUi = window.wyrdUi || {};
      window.wyrdUi.activeNavColor = sectionTheme.navColor;
      document.body.dataset.activeNavColor = sectionTheme.navColor;
      window.dispatchEvent(
        new CustomEvent("wyrd:theme-color-change", {
          detail: { navColor: sectionTheme.navColor },
        }),
      );

      gsap.to([document.documentElement, document.body], {
        backgroundColor: sectionTheme.theme.backgroundColor,
        color: sectionTheme.theme.color,
        "--monde-list-bg": mondeListTheme.backgroundColor,
        "--monde-list-text": mondeListTheme.color,
        "--monde-card-border-color": mondeListTheme.borderColor,
        "--monde-zone-bg": mondeZoneTheme.backgroundColor,
        "--monde-zone-text": mondeZoneTheme.color,
        duration: immediate ? 0 : 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    function getMostVisibleSection() {
      const viewportHeight = window.innerHeight;
      let winner = null;
      let maxVisiblePx = -1;

      sections.forEach((section) => {
        if (!(section instanceof HTMLElement)) return;
        const rect = section.getBoundingClientRect();
        const visiblePx =
          Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

        if (visiblePx > maxVisiblePx) {
          maxVisiblePx = visiblePx;
          winner = section;
        }
      });

      return winner;
    }

    function syncThemeToMostVisible(immediate = false) {
      const winner = getMostVisibleSection();
      if (!(winner instanceof HTMLElement)) return;
      if (winner === activeSection && !immediate) return;
      activeSection = winner;
      applyThemeFromSection(winner, immediate);
    }

    const globalThemeTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onRefresh: () => syncThemeToMostVisible(true),
      onUpdate: () => syncThemeToMostVisible(false),
    });

    themeArtifacts.push(globalThemeTrigger);

    syncThemeToMostVisible(true);

    return themeArtifacts;
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

    // iOS browser chrome show/hide emits resize during scroll; avoid pin jitter.
    if (isIosWebkit) ScrollTrigger.config({ ignoreMobileResize: true });

    function initLenisBridge() {
      if (!window.Lenis) return () => {};
      if (window.__homeLenisInitialized) return () => {};
      if (isIosWebkit) return () => {};

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

      registerSectionController("[data-home-ticker]", () =>
        controllersApi.createTickerSectionController(),
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
    const themeTransitionArtifacts = initSectionThemeTransitions();

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
    const lifecycleTriggerStart = isIosWebkit ? "top 72%" : "top 85%";
    const lifecycleTriggerEnd = isIosWebkit ? "bottom 28%" : "bottom 15%";

    stops.forEach((stop, index) => {
      const controller = getSectionController(index);

      const trigger = ScrollTrigger.create({
        trigger: stop,
        start: lifecycleTriggerStart,
        end: lifecycleTriggerEnd,
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
    let resizeRefreshTimeout = null;

    function onResize() {
      if (resizeRefreshTimeout) window.clearTimeout(resizeRefreshTimeout);
      resizeRefreshTimeout = window.setTimeout(() => {
        resizeRefreshTimeout = null;
        ScrollTrigger.refresh();
      }, 180);
    }

    function onOrientationChange() {
      window.setTimeout(() => ScrollTrigger.refresh(), 280);
    }

    function teardownHomeSectionScroll() {
      if (hasTeardownRun) return;
      hasTeardownRun = true;

      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      window.removeEventListener("pagehide", teardownHomeSectionScroll);

      if (resizeRefreshTimeout) {
        window.clearTimeout(resizeRefreshTimeout);
        resizeRefreshTimeout = null;
      }

      stopTriggers.forEach((trigger) => trigger.kill());
      themeTransitionArtifacts.forEach((artifact) => artifact.kill());
      if (typeof cleanupHeroHoverAnimations === "function") {
        cleanupHeroHoverAnimations();
      }
      cleanupLenisBridge();
      destroySectionControllers();
      window.__homeSectionScrollInitialized = false;
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);
    window.addEventListener("pagehide", teardownHomeSectionScroll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initHashScrollHint();
      initHomeSectionScroll();
    });
  } else {
    initHashScrollHint();
    initHomeSectionScroll();
  }
})();
