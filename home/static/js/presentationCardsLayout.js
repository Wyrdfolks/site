/**
 * Script for handling the layout of the presentation cards on the
 * home page, which are absolutely positioned and rotated around the
 * center of the presentation section.
 */

(() => {
  const CARD_POSITIONS_DESKTOP = {
    "card-yellow": {
      x: -220,
      y: -300,
      rotation: -4,
      stackedOffset: { x: -26, y: -18, rotation: -14 },
    },
    "card-pink": {
      x: 320,
      y: -300,
      rotation: 3,
      stackedOffset: { x: 24, y: -22, rotation: 10 },
    },
    "card-purple": {
      x: -540,
      y: 100,
      rotation: 4,
      stackedOffset: { x: -20, y: 20, rotation: 8 },
    },
    "card-green": {
      x: 200,
      y: 280,
      rotation: -11,
      stackedOffset: { x: 18, y: 16, rotation: -8 },
    },
    "card-blue": {
      x: 490,
      y: 200,
      rotation: 19,
      stackedOffset: { x: 30, y: 6, rotation: 16 },
    },
  };

  const CARD_POSITIONS_TABLET = {
    "card-yellow": {
      x: -200,
      y: -370,
      rotation: -12,
      stackedOffset: { x: -22, y: -16, rotation: -9 },
    },
    "card-pink": {
      x: 175,
      y: -330,
      rotation: 8,
      stackedOffset: { x: 20, y: -18, rotation: 8 },
    },
    "card-purple": {
      x: -305,
      y: 325,
      rotation: 6,
      stackedOffset: { x: -18, y: 18, rotation: 7 },
    },
    "card-green": {
      x: 250,
      y: 330,
      rotation: -9,
      stackedOffset: { x: 16, y: 14, rotation: -7 },
    },
    "card-blue": {
      x: 80,
      y: 430,
      rotation: 14,
      stackedOffset: { x: 24, y: 5, rotation: 9 },
    },
  };

  const CARD_POSITIONS_PHONE_LARGE = {
    "card-yellow": {
      x: -120,
      y: -220,
      rotation: -15,
      stackedOffset: { x: -18, y: -14, rotation: -8 },
    },
    "card-pink": {
      x: 125,
      y: -230,
      rotation: 12,
      stackedOffset: { x: 16, y: -16, rotation: 7 },
    },
    "card-purple": {
      x: -150,
      y: 200,
      rotation: 14,
      stackedOffset: { x: -14, y: 14, rotation: 7 },
    },
    "card-blue": {
      x: 35,
      y: 260,
      rotation: -16,
      stackedOffset: { x: 20, y: 4, rotation: 9 },
    },
    "card-green": {
      x: 140,
      y: 220,
      rotation: 10,
      stackedOffset: { x: 12, y: 12, rotation: -6 },
    },
  };

  const CARD_POSITIONS_PHONE_SMALL = {
    "card-yellow": {
      x: -115,
      y: -220,
      rotation: -13,
      stackedOffset: { x: -15, y: -11, rotation: -7 },
    },
    "card-pink": {
      x: 100,
      y: -240,
      rotation: 10,
      stackedOffset: { x: 14, y: -13, rotation: 6 },
    },
    "card-purple": {
      x: -130,
      y: 220,
      rotation: 12,
      stackedOffset: { x: -12, y: 11, rotation: 6 },
    },
    "card-blue": {
      x: 25,
      y: 230,
      rotation: -14,
      stackedOffset: { x: 17, y: 3, rotation: 8 },
    },
    "card-green": {
      x: 115,
      y: 270,
      rotation: 8,
      stackedOffset: { x: 10, y: 10, rotation: -5 },
    },
  };

  const CARD_POSITIONS_BY_TIER = {
    phoneSmall: CARD_POSITIONS_PHONE_SMALL,
    phoneLarge: CARD_POSITIONS_PHONE_LARGE,
    tablet: CARD_POSITIONS_TABLET,
    desktop: CARD_POSITIONS_DESKTOP,
  };

  const SHARED_SCREEN_THRESHOLD = 768;

  const COLORS = Object.keys(CARD_POSITIONS_DESKTOP);

  window.wyrdUi = window.wyrdUi || {};
  window.wyrdUi.screenThreshold =
    window.wyrdUi.screenThreshold ?? SHARED_SCREEN_THRESHOLD;
  window.wyrdUi.desktopMedia =
    window.wyrdUi.desktopMedia ||
    window.matchMedia(`(min-width: ${window.wyrdUi.screenThreshold}px)`);

  const desktopMedia = window.wyrdUi.desktopMedia;

  function getPresentationCardTier() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height >= width;

    if (width <= 390) return "phoneSmall";
    if (width <= 767) return "phoneLarge";
    if (width <= 1023 && isPortrait) return "tablet";
    return "desktop";
  }

  /**
   * Get the active card position map for the current breakpoint.
   * @returns {Record<string, { x: number, y: number, rotation: number, stackedOffset: { x: number, y: number, rotation: number } }>}
   */
  function getPresentationCardPositions() {
    return CARD_POSITIONS_BY_TIER[getPresentationCardTier()];
  }

  /**
   * Resolve a presentation card color class.
   * @param {HTMLElement} card
   * @returns {string}
   */
  function getPresentationCardColor(card) {
    const classes = Array.from(card.classList);
    return classes.find((cls) => COLORS.includes(cls)) ?? "card-purple";
  }

  /**
   * Resolve the final layout for a presentation card.
   * @param {HTMLElement} card
   * @returns {{ position: { top: string, left: string, right: string, bottom: string }, motion: { x: number, y: number, rotation: number } }}
   */
  function getPresentationCardFinalLayout(card) {
    const color = getPresentationCardColor(card);
    const position = getPresentationCardPositions()[color];

    return {
      position: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
      },
      motion: {
        x: position.x,
        y: position.y,
        rotation: position.rotation,
      },
    };
  }

  /**
   * Resolve the stacked start offset for a presentation card.
   * @param {HTMLElement} card
   * @returns {{ x: number, y: number, rotation: number }}
   */
  function getPresentationCardStackedOffset(card) {
    const color = getPresentationCardColor(card);
    return getPresentationCardPositions()[color].stackedOffset;
  }

  /**
   * Collect presentation cards from a scope.
   * @param {ParentNode} [scope=document]
   * @returns {HTMLElement[]}
   */
  function getPresentationCards(scope = document) {
    return Array.from(scope.querySelectorAll(".presentation-card"));
  }

  function layoutPresentationCards() {
    const cards = getPresentationCards();
    const positions = getPresentationCardPositions();

    cards.forEach((card) => {
      if (card.dataset.presentationGsapControlled === "true") return;
      const color = getPresentationCardColor(card);
      const position = positions[color];

      card.style.position = "absolute";
      card.style.top = "50%";
      card.style.left = "50%";
      card.style.right = "auto";
      card.style.bottom = "auto";
      card.style.transform = `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`;
    });
  }

  function schedulePresentationCardLayout() {
    window.requestAnimationFrame(layoutPresentationCards);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      schedulePresentationCardLayout,
    );
  } else schedulePresentationCardLayout();

  desktopMedia.addEventListener("change", schedulePresentationCardLayout);
  window.addEventListener("resize", schedulePresentationCardLayout);

  window.wyrdUi.presentationCardsLayout = {
    getPresentationCards,
    getPresentationCardTier,
    getPresentationCardPositions,
    getPresentationCardStackedOffset,
    getPresentationCardFinalLayout,
    layoutPresentationCards,
  };
})();
