/**
 * Script for handling the layout of the presentation cards on the
 * home page, which are absolutely positioned and rotated around the
 * center of the presentation section.
 *
 * TODO: animations with GSAP
 */

(() => {
  const CARD_POSITIONS_DESKTOP = {
    "card-yellow": {
      top: "-45px",
      left: "20px",
      transform: "translate(0, -100%) rotate(-3.6deg)",
    },
    "card-pink": {
      top: "-30px",
      right: "-135px",
      transform: "translate(0, -100%) rotate(3deg)",
    },
    "card-purple": {
      bottom: "-75px",
      left: "-12px",
      transform: "translate(-100%, 0) rotate(3.8deg)",
    },
    "card-green": {
      bottom: "-12px",
      right: "55px",
      transform: "translate(0, 100%) rotate(-11deg)",
    },
    "card-blue": {
      bottom: "30px",
      right: "0",
      transform: "translate(100%, 100%) rotate(18.6deg)",
    },
  };

  const CARD_POSITIONS_MOBILE = {
    "card-yellow": {
      top: "-10px",
      left: "-30px",
      transform: "translate(0, -100%) rotate(-15deg)",
    },
    "card-pink": {
      top: "-30px",
      right: "-25px",
      transform: "translate(0, -100%) rotate(12deg)",
    },
    "card-purple": {
      bottom: "-85px",
      left: "60px",
      transform: "translate(-100%, 0) rotate(14deg)",
    },
    "card-blue": {
      bottom: "-30px",
      left: "80px",
      transform: "translate(0, 100%) rotate(-9deg)",
    },
    "card-green": {
      bottom: "-10px",
      right: "50px",
      transform: "translate(100%, 100%) rotate(5deg)",
    },
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

  function layoutPresentationCards() {
    const cards = Array.from(document.querySelectorAll(".presentation-card"));
    const positions = desktopMedia.matches
      ? CARD_POSITIONS_DESKTOP
      : CARD_POSITIONS_MOBILE;

    cards.forEach((card) => {
      const classes = Array.from(card.classList);
      const color = classes.find((cls) => COLORS.includes(cls));
      const position = positions[color ?? "card-purple"];

      for (const [cssProp, value] of Object.entries(position)) {
        card.style[cssProp] = value;
      }
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
  } else {
    schedulePresentationCardLayout();
  }

  desktopMedia.addEventListener("change", schedulePresentationCardLayout);
  window.addEventListener("resize", schedulePresentationCardLayout);
})();
