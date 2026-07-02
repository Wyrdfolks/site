/**
 * Section animation controller factories for homepage scroll orchestration.
 */

(() => {
  window.wyrdUi = window.wyrdUi || {};

  /**
   * @typedef {Object} SectionController
   * @property {() => void} onEnter
   * @property {() => void} onLeave
   * @property {() => void} onEnterBack
   * @property {() => void} onLeaveBack
   * @property {() => void} destroy
   */

  /**
   * Create a no-op section controller.
   * @returns {SectionController}
   */
  function createNoOpSectionController() {
    return {
      onEnter: () => {},
      onLeave: () => {},
      onEnterBack: () => {},
      onLeaveBack: () => {},
      destroy: () => {},
    };
  }

  /**
   * Create a section controller from partial handlers.
   *
   * @param {Partial<SectionController>} handlers
   * @returns {SectionController}
   */
  function createSectionController(handlers = {}) {
    return {
      ...createNoOpSectionController(),
      ...handlers,
    };
  }

  /**
   * Initialize hover-based inertia animations for matching elements.
   *
   * @param {string} selector
   * @param {{ velocityScale?: number, wiggleRange?: number, hoverDuration?: number, wiggleDuration?: number, returnDuration?: number }} [options]
   * @returns {() => void} Cleanup function
   */
  function initWiggleHoverAnimations(selector, options = {}) {
    const hoverCapable = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    if (!hoverCapable.matches) return () => {};

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return () => {};

    const {
      velocityScale = 0.08,
      wiggleRange = 40,
      hoverDuration = 0.15,
      wiggleDuration = 0.4,
      returnDuration = 0.6,
    } = options;

    /** @type {{ deltaX: number, deltaY: number, oldX: number, oldY: number }} */
    let pointerVelocity = { deltaX: 0, deltaY: 0, oldX: 0, oldY: 0 };

    /**
     * @param {MouseEvent} e
     */
    function trackPointerVelocity(e) {
      pointerVelocity.deltaX = e.clientX - pointerVelocity.oldX;
      pointerVelocity.deltaY = e.clientY - pointerVelocity.oldY;
      pointerVelocity.oldX = e.clientX;
      pointerVelocity.oldY = e.clientY;
    }

    function getRandomWiggle() {
      return (Math.random() - 0.5) * wiggleRange;
    }

    /**
     * @param {HTMLElement} el
     * @returns {number}
     */
    function getBaselineRotation(el) {
      const style = window.getComputedStyle(el);
      const transform = style.getPropertyValue("transform");
      if (transform === "none") return 0;

      const matrixRegex = /matrix\(([^)]+)\)/;
      const match = transform.match(matrixRegex);
      if (!match) return 0;

      const values = match[1].split(",").map((v) => parseFloat(v.trim()));
      const [a, b] = [values[0], values[1]];
      return Math.atan2(b, a) * (180 / Math.PI);
    }

    /**
     * @param {HTMLElement} sticker
     */
    function handleElementHover(element) {
      gsap.killTweensOf(element);

      const baselineRotation = getBaselineRotation(element);
      const wiggleAngle = getRandomWiggle();

      const hoverTl = gsap.timeline();

      hoverTl.to(
        element,
        {
          x: pointerVelocity.deltaX * velocityScale,
          y: pointerVelocity.deltaY * velocityScale,
          duration: hoverDuration,
          ease: "power1.out",
        },
        0,
      );

      hoverTl.to(
        element,
        {
          rotation: baselineRotation + wiggleAngle,
          duration: wiggleDuration,
          ease: "back.out(2)",
        },
        0,
      );

      hoverTl.to(
        element,
        {
          x: 0,
          y: 0,
          rotation: baselineRotation,
          duration: returnDuration,
          ease: "elastic.out(0.75, 0.6)",
        },
        "<40%",
      );
    }

    /** @type {Array<{ element: Element, handler: () => void }>} */
    const hoverHandlers = [];
    elements.forEach((element) => {
      const handler = () =>
        handleElementHover(/** @type {HTMLElement} */ (element));
      hoverHandlers.push({ element, handler });
      element.addEventListener("mouseenter", handler);
    });

    document.addEventListener("mousemove", trackPointerVelocity, {
      passive: true,
    });

    return () => {
      hoverHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("mouseenter", handler);
      });
      document.removeEventListener("mousemove", trackPointerVelocity);
    };
  }

  /**
   * Initialize hover-based inertia animations for hero sticker decorations.
   *
   * @returns {() => void} Cleanup function
   */
  function initHeroStickerHoverAnimations() {
    initWiggleHoverAnimations("[data-home-hero-sticker]");
    initWiggleHoverAnimations("[data-home-fomo-sticker]");
  }

  /**
   * Build a controller for the hero section animations.
   *
   * @param {{ heroIntroDuration: number, heroOutroDuration: number, heroStickerDuration: number }} params
   * @returns {SectionController}
   */
  function createHeroSectionController({
    heroIntroDuration,
    heroOutroDuration,
    heroStickerDuration,
  }) {
    const heroSection = document.querySelector("[data-home-hero]");
    const heroTitle = document.querySelector("[data-home-hero-title]");
    const heroStickers = document.querySelectorAll("[data-home-hero-sticker]");

    if (!heroSection || !heroTitle || heroStickers.length === 0) {
      return createNoOpSectionController();
    }

    const pinTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "+=35%",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    function playIntro() {
      gsap.killTweensOf(heroStickers);

      gsap.set(heroTitle, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
      });

      gsap.fromTo(
        heroStickers,
        { autoAlpha: 0, scale: 0, rotation: 15 },
        {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          duration: heroStickerDuration,
          ease: "elastic.out(1, 0.5)",
          stagger: 0.15,
          delay: heroIntroDuration * 0.25,
        },
      );
    }

    function playOutro() {
      gsap.killTweensOf(heroStickers);

      gsap.to(heroStickers, {
        autoAlpha: 0,
        scale: 0,
        duration: heroStickerDuration * 0.9,
        ease: "power2.in",
        stagger: 0.1,
      });
    }

    return createSectionController({
      onEnter: playIntro,
      onLeave: playOutro,
      onEnterBack: playIntro,
      onLeaveBack: playOutro,
      destroy: () => {
        pinTimeline.scrollTrigger?.kill();
        pinTimeline.kill();
      },
    });
  }

  /**
   * Build a controller for the Espaces hero subsection.
   *
   * @param {{ desktopMedia: MediaQueryList }} params
   * @returns {SectionController}
   */
  function createEspacesHeroController({ desktopMedia }) {
    const heroSection = document.querySelector('[data-espaces-section="hero"]');
    const heroContent = heroSection?.querySelector(
      "[data-espaces-hero-content]",
    );

    if (
      !(heroSection instanceof HTMLElement) ||
      !(heroContent instanceof HTMLElement)
    ) {
      return createNoOpSectionController();
    }

    const textTimeline = gsap.timeline({
      paused: true,
      defaults: {
        duration: desktopMedia.matches ? 5 : 15,
        ease: "power2.out",
      },
    });

    textTimeline.fromTo(
      heroContent,
      { xPercent: desktopMedia.matches ? 50 : -50, autoAlpha: 0.35 },
      { xPercent: desktopMedia.matches ? 0 : 120, autoAlpha: 1 },
    );

    return createSectionController({
      onEnter() {
        textTimeline.restart();
      },
      onLeave: () => textTimeline.reverse(),
      onEnterBack: () => textTimeline.play(),
      onLeaveBack: () => textTimeline.reverse(),
      destroy: () => textTimeline.kill(),
    });
  }

  /**
   * Build a controller for the Espaces subtitle subsection.
   *
   * @returns {SectionController}
   */
  function createEspacesSubtitleController() {
    const subtitleSection = document.querySelector(
      '[data-espaces-section="subtitle"]',
    );
    const subtitleContent = subtitleSection?.querySelector(
      "[data-espaces-subtitle-content]",
    );

    if (
      !(subtitleSection instanceof HTMLElement) ||
      !(subtitleContent instanceof HTMLElement)
    ) {
      return createNoOpSectionController();
    }

    const subtitleTimeline = gsap.timeline({
      paused: true,
      defaults: { duration: 3, ease: "power2.out" },
    });

    subtitleTimeline.fromTo(
      subtitleContent,
      { autoAlpha: 0 },
      { autoAlpha: 1 },
    );

    return createSectionController({
      onEnter() {
        subtitleTimeline.restart();
      },
      onLeave: () => subtitleTimeline.reverse(),
      onEnterBack: () => subtitleTimeline.play(),
      onLeaveBack: () => subtitleTimeline.reverse(),
      destroy: () => subtitleTimeline.kill(),
    });
  }

  /**
   * Build a merged controller for Espaces hero + subtitle section.
   *
   * @param {{ desktopMedia: MediaQueryList }} params
   * @returns {SectionController}
   */
  function createEspacesSectionController({ desktopMedia }) {
    const espacesSection = document.querySelector(
      '[data-espaces-section="hero"]',
    );
    const introContent = espacesSection?.querySelector(
      "[data-espaces-intro-content]",
    );
    const heroContent = espacesSection?.querySelector(
      "[data-espaces-hero-content]",
    );
    const subtitleContent = espacesSection?.querySelector(
      "[data-espaces-subtitle-content]",
    );
    const heroTextPath = heroContent?.querySelector("textPath");

    if (
      !(espacesSection instanceof HTMLElement) ||
      !(heroContent instanceof HTMLElement) ||
      !(subtitleContent instanceof HTMLElement)
    ) {
      return createNoOpSectionController();
    }

    gsap.set(espacesSection, { position: "relative" });
    if (introContent instanceof HTMLElement) {
      gsap.set(introContent, {
        autoAlpha: 0,
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        marginTop: 0,
        zIndex: 3,
      });
    }
    gsap.set(heroContent, { autoAlpha: 0 });
    gsap.set(subtitleContent, {
      autoAlpha: 0,
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      marginTop: 0,
      zIndex: 2,
    });

    if (heroTextPath instanceof SVGTextPathElement) {
      gsap.set(heroTextPath, {
        attr: { startOffset: desktopMedia.matches ? "170%" : "182%" },
      });
    }

    const sceneTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: espacesSection,
        start: "top top",
        end: "+=280%",
        pin: espacesSection,
        pinSpacing: true,
        scrub: 1.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    // Reveal hero title by moving along its curved SVG path.
    if (heroTextPath instanceof SVGTextPathElement) {
      if (introContent instanceof HTMLElement) {
        sceneTimeline.to(introContent, { autoAlpha: 1, duration: 1.15 }, 0);
        sceneTimeline.to(introContent, { autoAlpha: 0, duration: 0.85 }, 1.55);
      }

      sceneTimeline.set(heroContent, { autoAlpha: 1 }, 2.08);
      sceneTimeline.to(
        heroTextPath,
        {
          attr: { startOffset: "50%" },
          duration: 7,
          ease: "power2.out",
        },
        2.1,
      );

      sceneTimeline.to(
        heroTextPath,
        {
          attr: { startOffset: desktopMedia.matches ? "-62%" : "-42%" },
          duration: 3,
          ease: "power2.in",
        },
        9.2,
      );
    } else {
      // Fallback for environments where SVG textPath is not available.
      if (introContent instanceof HTMLElement) {
        sceneTimeline.to(introContent, { autoAlpha: 1, duration: 1.15 }, 0);
        sceneTimeline.to(introContent, { autoAlpha: 0, duration: 0.85 }, 1.55);
      }

      sceneTimeline.set(heroContent, { autoAlpha: 1 }, 2.08);

      sceneTimeline.fromTo(
        heroContent,
        { xPercent: desktopMedia.matches ? 50 : 22, autoAlpha: 0.45 },
        {
          xPercent: desktopMedia.matches ? -260 : -140,
          autoAlpha: 1,
          duration: 10,
        },
        2.1,
      );
    }

    // Subtitle appears centered as the title finishes leaving the frame.
    sceneTimeline.to(subtitleContent, { autoAlpha: 1, duration: 1.15 }, 11.25);
    sceneTimeline.to(subtitleContent, { autoAlpha: 1, duration: 1.15 }, 13.5);

    return createSectionController({
      onEnter: () => {},
      onLeave: () => {},
      onEnterBack: () => {},
      onLeaveBack: () => {},
      destroy: () => {
        sceneTimeline.scrollTrigger?.kill();
        sceneTimeline.kill();
      },
    });
  }

  /**
   * Build a controller for Espaces mondes list pin/scroll scene.
   *
   * @param {{ desktopMedia: MediaQueryList }} params
   * @returns {SectionController}
   */
  function createEspacesMondesController({ desktopMedia }) {
    const mondesSection = document.querySelector("[data-espaces-mondes]");
    const mondesCard = mondesSection?.querySelector(
      "[data-espaces-mondes-card]",
    );
    const mondesList = mondesSection?.querySelector(
      "[data-espaces-mondes-list]",
    );
    const mondesListScroll = mondesSection?.querySelector(
      "[data-espaces-mondes-list-scroll]",
    );

    if (
      !(mondesSection instanceof HTMLElement) ||
      !(mondesList instanceof HTMLElement)
    ) {
      return createNoOpSectionController();
    }

    if (!desktopMedia.matches) {
      return createNoOpSectionController();
    }

    const listScrollTarget =
      mondesListScroll instanceof HTMLElement ? mondesListScroll : mondesList;

    let sceneTimeline = null;
    let sceneTrigger = null;

    function buildScene() {
      sceneTrigger?.kill();
      sceneTimeline?.kill();

      const listTravel = Math.max(
        0,
        listScrollTarget.scrollHeight - mondesList.clientHeight,
      );
      if (listTravel <= 0) return;

      gsap.set(listScrollTarget, { y: 0 });
      gsap.set(mondesList, { autoAlpha: 0, xPercent: 10 });
      if (mondesCard instanceof HTMLElement) {
        gsap.set(mondesCard, { autoAlpha: 0, xPercent: -10 });
      }

      sceneTimeline = gsap.timeline({ defaults: { ease: "none" } });

      if (mondesCard instanceof HTMLElement) {
        sceneTimeline.to(
          mondesCard,
          {
            autoAlpha: 1,
            xPercent: 0,
            duration: 0.22,
            ease: "power2.out",
          },
          0,
        );
      }

      sceneTimeline.to(
        mondesList,
        {
          autoAlpha: 1,
          xPercent: 0,
          duration: 0.22,
          ease: "power2.out",
        },
        0,
      );

      sceneTimeline.to(
        listScrollTarget,
        { y: -listTravel, duration: 0.78 },
        0.22,
      );

      sceneTrigger = ScrollTrigger.create({
        trigger: mondesSection,
        start: "top top",
        end: () =>
          `+=${Math.max(listTravel + window.innerHeight * 0.6, window.innerHeight * 1.2)}`,
        scrub: 1.25,
        pin: mondesSection,
        pinSpacing: true,
        animation: sceneTimeline,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      });
    }

    buildScene();

    return createSectionController({
      onEnter: () => {},
      onLeave: () => {},
      onEnterBack: () => {},
      onLeaveBack: () => {},
      destroy: () => {
        sceneTrigger?.kill();
        sceneTimeline?.kill();
      },
    });
  }

  /**
   * Build a controller for the hero FOMO content fade-in.
   *
   * @returns {SectionController}
   */
  function createHeroFomoFadeController() {
    const fomoSection = document.querySelector("[data-home-fomo]");
    const fomoStage = fomoSection?.querySelector("[data-home-fomo-stage]");
    const content = fomoSection?.querySelector("[data-home-fomo-content]");

    if (
      !(fomoSection instanceof HTMLElement) ||
      !(fomoStage instanceof HTMLElement) ||
      !(content instanceof HTMLElement)
    ) {
      return createNoOpSectionController();
    }

    const fomoStickers = Array.from(
      fomoSection.querySelectorAll("[data-home-fomo-sticker]"),
    );

    /**
     * Split a text element into word spans for staggered reveal animation.
     * (for HERO-FOMO section)
     * @param {Element[]} targets
     * @returns {HTMLElement[]}
     */
    function buildWordRevealTargets(targets) {
      const words = [];

      targets.forEach((target) => {
        if (!(target instanceof HTMLElement)) return;
        const sourceText = target.textContent?.trim() || "";
        if (!sourceText) return;

        target.textContent = "";
        const fragment = document.createDocumentFragment();
        sourceText.split(/\s+/).forEach((word, index, array) => {
          const wordSpan = document.createElement("span");
          wordSpan.textContent = word;
          wordSpan.className = "home-word-reveal-word";
          wordSpan.style.display = "inline-block";
          fragment.appendChild(wordSpan);
          words.push(wordSpan);
          if (index < array.length - 1)
            fragment.appendChild(document.createTextNode(" "));
        });
        target.appendChild(fragment);
      });

      return words;
    }

    const wordTargets = buildWordRevealTargets(
      Array.from(content.querySelectorAll("h1, h2, h3, h4, p")),
    );

    const ctaAndSocialTargets = Array.from(
      content.querySelectorAll(
        "[data-home-fomo-cta], [data-home-fomo-social-stack], [data-home-fomo-social-links]",
      ),
    ).filter((target) => target instanceof HTMLElement);

    const revealTargets = Array.from(
      new Set([
        ...(wordTargets.length > 0 ? wordTargets : [content]),
        ...ctaAndSocialTargets,
      ]),
    );

    // Apply initial state immediately so DOM style changes are visible at init.
    gsap.set(content, { autoAlpha: 1 });
    gsap.set(fomoStickers, {
      autoAlpha: 1,
      scale: 0,
      transformOrigin: "50% 50%",
    });
    gsap.set(revealTargets, {
      autoAlpha: 1,
      yPercent: 0,
      scaleY: 1,
      rotate: 0,
    });

    const fadeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: fomoSection,
        start: "top top",
        end: "+=180%",
        pin: fomoSection,
        pinSpacing: true,
        scrub: 1.25,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    // Primary panel: title reveal + stickers, then fade to secondary panel.
    fadeTimeline.fromTo(
      revealTargets,
      {
        autoAlpha: 0,
        yPercent: 100,
        scaleY: 0,
        rotate: 10,
      },
      {
        autoAlpha: 1,
        yPercent: 0,
        scaleY: 1,
        rotate: 0,
        duration: 1,
        ease: "elastic.out(0.75, 0.6)",
        stagger: 0.035,
      },
      0.2,
    );

    fadeTimeline.to(
      fomoStickers,
      {
        scale: 1,
        duration: 0.4,
        ease: "back.out(3)",
        stagger: 0.2,
      },
      "<",
    );

    fadeTimeline.to(content, { autoAlpha: 0, duration: 0.9 }, 2.8);

    return createSectionController({
      onEnter: () => {},
      onLeave: () => {},
      onEnterBack: () => {},
      onLeaveBack: () => {},
      destroy: () => {
        fadeTimeline.scrollTrigger?.kill();
        fadeTimeline.kill();
      },
    });
  }

  /**
   * Build a controller for bottom-of-page dice rain activation.
   *
   * @returns {SectionController}
   */
  function createBottomDiceRainController() {
    const sceneHost = document.querySelector("[data-home-bottom-dice]");
    const sceneTarget = sceneHost?.querySelector(
      "[data-home-bottom-dice-target]",
    );
    const sceneApi = window.wyrdUi?.footerDiceRain;

    if (
      !(sceneHost instanceof HTMLElement) ||
      !(sceneTarget instanceof HTMLElement) ||
      !sceneApi ||
      typeof sceneApi.start !== "function" ||
      typeof sceneApi.stop !== "function"
    ) {
      return createNoOpSectionController();
    }

    const trigger = ScrollTrigger.create({
      trigger: sceneHost,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => sceneApi.start({ target: sceneTarget }),
      onEnterBack: () => sceneApi.start({ target: sceneTarget }),
      onLeaveBack: () => sceneApi.stop(),
    });

    return createSectionController({
      onEnter: () => {},
      onLeave: () => {},
      onEnterBack: () => {},
      onLeaveBack: () => {},
      destroy: () => {
        trigger.kill();
        sceneApi.stop();
      },
    });
  }

  /**
   * Build a controller for the presentation section cards.
   *
   * @returns {SectionController}
   */
  function createPresentationSectionController() {
    const presentationSection = document.querySelector(
      "[data-home-presentation]",
    );
    const presentationCopy =
      presentationSection?.querySelector(".presentation-copy");
    const presentationCardsScene = presentationSection?.querySelector(
      "[data-home-presentation-cards]",
    );
    const layoutApi = window.wyrdUi.presentationCardsLayout;

    if (
      !(presentationSection instanceof HTMLElement) ||
      !(presentationCardsScene instanceof HTMLElement) ||
      !layoutApi
    )
      return createNoOpSectionController();

    const cards = layoutApi.getPresentationCards(presentationCardsScene);
    if (cards.length === 0) return createNoOpSectionController();

    const copyElements = presentationCopy
      ? Array.from(presentationCopy.querySelectorAll("h2, p"))
      : [];

    let floatingTweens = [];
    let floatingActive = false;
    let spreadTimeline = null;

    function clearFloatingTweens() {
      floatingTweens.forEach((tween) => tween.kill());
      floatingTweens = [];
    }

    function buildStackedState(card, index) {
      const finalLayout = layoutApi.getPresentationCardFinalLayout(card);
      const offset = layoutApi.getPresentationCardStackedOffset(card);
      return {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        xPercent: -50,
        yPercent: -50,
        x: offset.x,
        y: offset.y,
        rotation: finalLayout.motion.rotation + offset.rotation,
        scale: 0.84,
        zIndex: cards.length - index,
        position: "absolute",
      };
    }

    function setStackedStart() {
      cards.forEach((card, index) =>
        gsap.set(card, { ...buildStackedState(card, index) }),
      );
    }

    function buildSpreadTimeline() {
      if (spreadTimeline) return;

      spreadTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });

      if (copyElements.length > 0) {
        gsap.set(copyElements, { autoAlpha: 0 });
        spreadTimeline.to(
          copyElements,
          { autoAlpha: 1, duration: 1.2, stagger: 0.2 },
          0,
        );
      }

      cards.forEach((card, index) => {
        const finalLayout = layoutApi.getPresentationCardFinalLayout(card);
        const finalStyles = finalLayout.position;

        spreadTimeline.to(
          card,
          {
            ...finalStyles,
            xPercent: -50,
            yPercent: -50,
            x: finalLayout.motion.x,
            y: finalLayout.motion.y,
            rotation: finalLayout.motion.rotation,
            scale: 1,
            duration: 1.9,
          },
          index * 0.18,
        );
      });

      spreadTimeline.eventCallback("onComplete", startFloating);
    }

    // card floating animation on scroll end, with drift and rotation
    function startFloating() {
      if (floatingActive) return;

      clearFloatingTweens();
      floatingActive = true;

      cards.forEach((card, index) => {
        const cycle = gsap.timeline({ repeat: -1, yoyo: true });
        const direction = index % 2 === 0 ? 1 : -1;
        const yDrift = gsap.utils.random(12, 28);
        const xDrift = gsap.utils.random(3, 10);
        const rotationDrift = gsap.utils.random(2.4, 6.5);
        const driftDuration = gsap.utils.random(2.8, 4.6) + index * 0.2;
        const settleDuration = gsap.utils.random(2.4, 3.8);

        cycle.to(card, {
          y: `+=${direction * yDrift}`,
          x: `+=${direction * xDrift}`,
          rotation: `+=${direction * rotationDrift}`,
          duration: driftDuration,
          ease: "sine.inOut",
        });

        cycle.to(card, {
          y: `+=${-direction * yDrift * 0.4}`,
          x: `+=${direction * xDrift * 0.3}`,
          rotation: `+=${-direction * rotationDrift * 0.35}`,
          duration: settleDuration,
          ease: "sine.inOut",
        });

        floatingTweens.push(cycle);
      });
    }

    function stopFloating() {
      floatingActive = false;
      clearFloatingTweens();
    }

    cards.forEach((card) => {
      card.dataset.presentationGsapControlled = "true";
    });

    setStackedStart();
    buildSpreadTimeline();

    function playSpread() {
      stopFloating();
      setStackedStart();
      if (copyElements.length > 0) {
        gsap.set(copyElements, { autoAlpha: 0 });
      }
      spreadTimeline?.restart();
    }

    return createSectionController({
      onEnter: playSpread,
      onLeave: stopFloating,
      onEnterBack: playSpread,
      onLeaveBack: stopFloating,
      destroy() {
        stopFloating();
        cards.forEach((card) => {
          delete card.dataset.presentationGsapControlled;
        });
        if (spreadTimeline) {
          spreadTimeline.kill();
          spreadTimeline = null;
        }
      },
    });
  }

  /**
   * ticker horizontal scroll scene.   *
   * @returns {SectionController}
   */
  function createTickerSectionController() {
    const tickerSection = document.querySelector("[data-home-ticker]");
    const tickerTrack = tickerSection?.querySelector(
      "[data-home-ticker-track]",
    );

    if (
      !(tickerSection instanceof HTMLElement) ||
      !(tickerTrack instanceof HTMLElement)
    ) {
      return createNoOpSectionController();
    }

    /** @type {gsap.core.Timeline | null} */
    let sceneTimeline = null;
    /** @type {ScrollTrigger | null} */
    let sceneTrigger = null;
    let rebuildQueued = false;

    function queueRebuild() {
      if (rebuildQueued) return;
      rebuildQueued = true;
      window.requestAnimationFrame(() => {
        rebuildQueued = false;
        buildSceneArtifacts();
      });
    }

    function buildSceneArtifacts() {
      sceneTrigger?.kill();
      sceneTimeline?.kill();

      const viewportWidth = tickerSection.clientWidth;
      const trackWidth = tickerTrack.scrollWidth;
      const startOffset = Math.min(viewportWidth * 0.12, 96);
      const travelDistance = Math.max(
        trackWidth - viewportWidth + startOffset + 96,
        viewportWidth * 0.75,
      );
      const sceneScrollDistance = Math.max(
        travelDistance * 4,
        window.innerHeight * 3.5,
      );

      gsap.set(tickerTrack, {
        x: startOffset,
        autoAlpha: 1,
        willChange: "transform",
      });

      sceneTimeline = gsap.timeline({ defaults: { ease: "none" } });
      sceneTimeline.fromTo(
        tickerTrack,
        { x: startOffset },
        { x: -travelDistance, duration: 1 },
      );

      sceneTrigger = ScrollTrigger.create({
        trigger: tickerSection,
        start: "top bottom",
        end: "bottom top",
        scrub: 15,
        animation: sceneTimeline,
        invalidateOnRefresh: true,
      });
    }

    buildSceneArtifacts();

    if (document.fonts?.ready) {
      document.fonts.ready.then(queueRebuild);
    }

    window.addEventListener("load", queueRebuild, { once: true });

    return createSectionController({
      onEnter: () => gsap.set(tickerTrack, { force3D: true }),
      onLeave: () => gsap.set(tickerTrack, { force3D: true }),
      onEnterBack: () => gsap.set(tickerTrack, { force3D: true }),
      onLeaveBack: () => gsap.set(tickerTrack, { force3D: true }),
      destroy() {
        window.removeEventListener("load", queueRebuild);
        sceneTrigger?.kill();
        sceneTimeline?.kill();
      },
    });
  }

  /**
   * Build a controller for the Guests horizontal scroll scene.
   *
   * @returns {SectionController}
   */
  function createGuestsSectionController() {
    const guestsCardsSection = document.querySelector(
      "[data-home-guests-cards]",
    );
    const guestsScene = guestsCardsSection?.querySelector(
      "[data-home-guests-scene]",
    );
    const guestsTitle = guestsCardsSection?.querySelector(
      "[data-home-guests-title]",
    );
    const guestsStage = guestsCardsSection?.querySelector(".home-guests-stage");
    const guestsViewport = guestsCardsSection?.querySelector(
      "[data-home-guests-viewport]",
    );
    const guestsTrack = guestsCardsSection?.querySelector(
      "[data-home-guests-track]",
    );
    const guestCardItems = guestsCardsSection
      ? Array.from(
          guestsCardsSection.querySelectorAll("[data-home-guests-card-item]"),
        )
      : [];

    const guestsTeaserText = guestsCardsSection?.querySelector(
      "[data-home-guests-teaser-text]",
    );

    if (
      !(guestsCardsSection instanceof HTMLElement) ||
      !(guestsScene instanceof HTMLElement) ||
      !(guestsStage instanceof HTMLElement) ||
      !(guestsViewport instanceof HTMLElement) ||
      !(guestsTrack instanceof HTMLElement) ||
      guestCardItems.length === 0
    ) {
      return createNoOpSectionController();
    }

    /** @type {gsap.core.Timeline | null} */
    let sceneTimeline = null;
    /** @type {ScrollTrigger | null} */
    let sceneTrigger = null;

    function getTrackTravelDistance() {
      return Math.max(0, guestsTrack.scrollWidth - guestsViewport.clientWidth);
    }

    function buildSceneArtifacts() {
      sceneTrigger?.kill();
      sceneTimeline?.kill();

      const travelDistance = getTrackTravelDistance();
      const minTravel = guestsViewport.clientWidth;
      const effectiveTravel = Math.max(travelDistance, minTravel);
      const startOffset = guestsViewport.clientWidth + 80;
      const mobileExtraTravel =
        window.innerWidth < 768 ? guestsViewport.clientWidth * 0.8 : 0;
      const endOffset = effectiveTravel + 180 + mobileExtraTravel;
      const sceneScrollDistance = Math.max(
        effectiveTravel * 4 + window.innerHeight * 2.8,
        window.innerHeight * 5.6,
      );

      gsap.set(guestsTrack, {
        x: startOffset,
        autoAlpha: 1,
        position: "relative",
        zIndex: 3,
      });
      gsap.set(guestCardItems, {
        y: 0,
        rotation: 0,
        transformOrigin: "50% 50%",
      });

      if (guestsTitle instanceof HTMLElement)
        gsap.set(guestsTitle, {
          xPercent: 0,
          autoAlpha: 1,
          position: "relative",
          zIndex: 1,
        });
      if (guestsTeaserText instanceof HTMLElement)
        gsap.set(guestsTeaserText, {
          xPercent: 0,
          autoAlpha: 0,
          position: "relative",
          zIndex: 1,
        });

      sceneTimeline = gsap.timeline({ defaults: { ease: "none" } });

      const setCardY = [];
      const setCardRotation = [];

      const cardMotionProfiles = guestCardItems.map((_, index) => ({
        direction: index % 2 === 0 ? 1 : -1,
        yAmplitude: 17 + index * 2.1,
        rotationAmplitude: 5.2 + index * 0.7,
        phase: index * 0.9,
        cycleCount: 2.8 + index * 0.25,
      }));

      guestCardItems.forEach((card, index) => {
        setCardY[index] = gsap.quickTo(card, "y", {
          duration: 0.46,
          ease: "power2.out",
        });
        setCardRotation[index] = gsap.quickTo(card, "rotation", {
          duration: 0.46,
          ease: "power2.out",
        });
      });

      function applyCardMotion(progress) {
        guestCardItems.forEach((card, index) => {
          const profile = cardMotionProfiles[index];
          const wave =
            progress * profile.cycleCount * Math.PI * 2 + profile.phase;
          const y = Math.sin(wave) * profile.yAmplitude * profile.direction;
          const rotation =
            (Math.cos(wave * 1.08) * profile.rotationAmplitude +
              Math.sin(wave * 0.54) * profile.rotationAmplitude * 0.35) *
            profile.direction;

          setCardY[index](y);
          setCardRotation[index](rotation);
        });
      }

      if (guestsTitle instanceof HTMLElement)
        sceneTimeline.to(guestsTitle, { autoAlpha: 0, duration: 2.1 }, 0.15);
      sceneTimeline.to(guestsTrack, { x: -endOffset, duration: 7.6 }, 0);

      if (guestsTeaserText instanceof HTMLElement) {
        sceneTimeline.to(
          guestsTeaserText,
          {
            autoAlpha: 1,
            duration: 2.4,
          },
          4.8,
        );
      }

      sceneTrigger = ScrollTrigger.create({
        trigger: guestsCardsSection,
        start: "top top",
        end: () => `+=${sceneScrollDistance}`,
        scrub: 2,
        pin: guestsCardsSection,
        pinSpacing: true,
        animation: sceneTimeline,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onRefresh: (self) => applyCardMotion(self.progress),
        onUpdate: (self) => applyCardMotion(self.progress),
      });

      applyCardMotion(0);
    }

    function buildArtifacts() {
      buildSceneArtifacts();
    }

    buildArtifacts();

    const sceneTargets = [
      guestsTrack,
      guestsTitle,
      guestsTeaserText,
      ...guestCardItems,
    ].filter((target) => target instanceof HTMLElement);

    return createSectionController({
      onEnter: () => gsap.set(sceneTargets, { force3D: true }),
      onLeave: () => gsap.set(sceneTargets, { force3D: true }),
      onEnterBack: () => gsap.set(sceneTargets, { force3D: true }),
      onLeaveBack: () => gsap.set(sceneTargets, { force3D: true }),
      destroy() {
        sceneTrigger?.kill();
        sceneTimeline?.kill();
      },
    });
  }

  window.wyrdUi.homeSectionControllers = {
    createNoOpSectionController,
    createSectionController,
    initHeroStickerHoverAnimations,
    createHeroSectionController,
    createHeroFomoFadeController,
    createBottomDiceRainController,
    createEspacesSectionController,
    createEspacesMondesController,
    createEspacesHeroController,
    createEspacesSubtitleController,
    createPresentationSectionController,
    createTickerSectionController,
    createGuestsSectionController,
  };
})();
