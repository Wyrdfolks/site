/**
 * Script for handling the layout of the presentation cards on the
 * home page, which are absolutely positioned and rotated around the
 * center of the presentation section.
 *
 * TODO: mobile layout
 * TODO: animations with GSAP
 */

const CARD_SIZE = 250; // px

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

const COLORS = Object.keys(CARD_POSITIONS_DESKTOP);

function layoutPresentationCards() {
  const cards = Array.from(document.querySelectorAll(".presentation-card"));

  cards.forEach((card) => {
    const classes = Array.from(card.classList);
    const color = classes.find((cls) => COLORS.includes(cls));
    const position = CARD_POSITIONS_DESKTOP[color ?? "card-purple"];
    for (const [cssProp, value] of Object.entries(position))
      card.style[cssProp] = value;
  });
}

function schedulePresentationCardLayout() {
  window.requestAnimationFrame(layoutPresentationCards);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", schedulePresentationCardLayout);
} else {
  schedulePresentationCardLayout();
}

window.addEventListener("resize", schedulePresentationCardLayout);
