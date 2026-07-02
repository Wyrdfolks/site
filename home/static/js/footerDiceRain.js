/**
 * Bottom-of-page dice rain scene powered by Matter.js.
 */

(() => {
  window.wyrdUi = window.wyrdUi || {};

  const ALL_DICE_TEXTURES = [
    "/static/img/d10_blue.png",
    "/static/img/d10_blue_bis.png",
    "/static/img/d10_green.png",
    "/static/img/d10_green_bis.png",
    "/static/img/d10_pink.png",
    "/static/img/d10_pink_bis.png",
    "/static/img/d10_purple.png",
    "/static/img/d10_purple_bis.png",
    "/static/img/d10_yellow.png",
    "/static/img/d10_yellow_bis.png",
    "/static/img/d12_blue.png",
    "/static/img/d12_green.png",
    "/static/img/d12_pink.png",
    "/static/img/d12_purple.png",
    "/static/img/d12_yellow.png",
    "/static/img/d20_blue.png",
    "/static/img/d20_green.png",
    "/static/img/d20_pink.png",
    "/static/img/d20_purple.png",
    "/static/img/d20_yellow.png",
    "/static/img/d4_blue.png",
    "/static/img/d4_green.png",
    "/static/img/d4_pink.png",
    "/static/img/d4_purple.png",
    "/static/img/d4_yellow.png",
    "/static/img/d6_blue.png",
    "/static/img/d6_green.png",
    "/static/img/d6_pink.png",
    "/static/img/d6_purple.png",
    "/static/img/d6_yellow.png",
    "/static/img/d8_blue.png",
    "/static/img/d8_green.png",
    "/static/img/d8_pink.png",
    "/static/img/d8_purple.png",
    "/static/img/d8_yellow.png",
  ]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  const desktopMedia =
    window.wyrdUi.desktopMedia || window.matchMedia("(min-width: 768px)");
  const isDesktop = desktopMedia.matches;

  const DROP_COUNT = 15;
  const DROP_INTERVAL_MS = 120;
  const GRAVITY_Y = 1.6;
  const RESTITUTION = 0.8; // "bounciness"
  const FRICTION = 0.62;
  const STATIC_FRICTION = 0.95;
  const AIR_FRICTION = 0.005;
  const TEXTURE_REFERENCE_SIZE = 256;
  const FLOOR_VISUAL_OFFSET_PX = 20; //  avoid dice "sinking" into the bottom of the screen
  const DIE_SIZE_PX = isDesktop ? 50 : 30;
  const DICE_TEXTURES = isDesktop
    ? ALL_DICE_TEXTURES
    : ALL_DICE_TEXTURES.slice(15);
  const FLOOR_THICKNESS_PX = 80;
  const SPAWN_OVERFLOW_PX = DIE_SIZE_PX * 0.6;

  /** @type {null | { container: HTMLElement, engine: any, render: any, runner: any, timeouts: number[], textureIndex: number, spawnY: number, onResize: () => void }} */
  let sceneState = null;

  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Clear all pending spawn timers.
   * @returns {void}
   */
  function clearScheduledSpawns() {
    if (!sceneState) return;
    sceneState.timeouts.forEach((id) => window.clearTimeout(id));
    sceneState.timeouts = [];
  }

  /**
   * Create Matter.js engine world bounds with floor aligned to viewport bottom.
   * @param {Matter.World} world
   * @param {typeof Matter.Bodies} Bodies
   * @param {typeof Matter.Composite} Composite
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {number} visibleFloorBottom
   * @returns {void}
   */
  function createBounds(
    world,
    Bodies,
    Composite,
    canvasWidth,
    canvasHeight,
  ) {
    const wallDepth = FLOOR_THICKNESS_PX;
    const floorWidth = canvasWidth + wallDepth * 2;
    const floorHeight = wallDepth;

    const floor = Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight - FLOOR_VISUAL_OFFSET_PX + floorHeight / 2,
      floorWidth,
      floorHeight,
      { isStatic: true, render: { visible: false } },
    );

    const leftWall = Bodies.rectangle(
      wallDepth * -1,
      canvasHeight / 2,
      wallDepth * 2,
      canvasHeight,
      { isStatic: true, render: { visible: false } },
    );

    const rightWall = Bodies.rectangle(
      canvasWidth + wallDepth,
      canvasHeight / 2,
      wallDepth * 2,
      canvasHeight,
      { isStatic: true, render: { visible: false } },
    );

    const ceiling = Bodies.rectangle(
      canvasWidth / 2 + wallDepth * 2,
      wallDepth * -1,
      canvasWidth + wallDepth * 4,
      wallDepth * 2,
      { isStatic: true, render: { visible: false } },
    );

    Composite.add(world, [floor, leftWall, rightWall, ceiling]);
  }

  /**
   * Spawn a single die body at the top entry point.
   * @returns {void}
   */
  function spawnDie() {
    if (!sceneState || !window.Matter) return;

    const { Bodies, Composite } = window.Matter;
    const { render, engine } = sceneState;

    const canvasWidth = render.options.width;
    const dieSize = DIE_SIZE_PX;
    const dieHalf = dieSize / 2;
    const spawnMin = dieHalf;
    const spawnMax = canvasWidth - dieHalf;

    const texture =
      DICE_TEXTURES[sceneState.textureIndex % DICE_TEXTURES.length];
    sceneState.textureIndex += 1;

    const dieScale = dieSize / TEXTURE_REFERENCE_SIZE;
    const spawnY = sceneState.spawnY;

    const die = Bodies.rectangle(
      getRandomNumber(spawnMin, spawnMax),
      spawnY,
      dieSize,
      dieSize,
      {
        restitution: RESTITUTION,
        friction: FRICTION,
        frictionStatic: STATIC_FRICTION,
        frictionAir: AIR_FRICTION,
        slop: 0.001,
        render: {
          sprite: {
            texture,
            xScale: dieScale,
            yScale: dieScale,
          },
        },
      },
    );

    Composite.add(engine.world, die);
  }

  /**
   * Spawn a burst of dice over a short interval.
   * @returns {void}
   */
  function spawnDiceRain() {
    if (!sceneState) return;

    clearScheduledSpawns();

    for (let i = 0; i < DROP_COUNT; i += 1) {
      const timeoutId = window.setTimeout(
        () => spawnDie(),
        i * DROP_INTERVAL_MS,
      );
      sceneState.timeouts.push(timeoutId);
    }
  }

  /**
   * Tear down Matter.js scene and release resources.
   * @returns {void}
   */
  function destroyScene() {
    if (!sceneState || !window.Matter) return;

    const { Render, Runner, World, Engine } = window.Matter;
    const { render, runner, engine, onResize } = sceneState;

    clearScheduledSpawns();
    window.removeEventListener("resize", onResize);

    if (runner) Runner.stop(runner);
    if (render) {
      Render.stop(render);
      if (render.canvas && render.canvas.parentNode)
        render.canvas.parentNode.removeChild(render.canvas);
      render.textures = {};
    }

    if (engine) {
      World.clear(engine.world, false);
      Engine.clear(engine);
    }

    sceneState = null;
  }

  /**
   * Build and run Matter.js scene for the provided target element.
   * @param {HTMLElement} target
   * @returns {void}
   */
  function buildScene(target) {
    if (!window.Matter) return;

    const { Engine, Render, Runner } = window.Matter;

    const canvasWidth = target.clientWidth;
    const canvasHeight = target.clientHeight;
    const spawnY = -SPAWN_OVERFLOW_PX;

    const engine = Engine.create();
    engine.world.gravity.y = GRAVITY_Y;

    const render = Render.create({
      element: target,
      engine,
      options: {
        background: "transparent",
        wireframes: false,
        width: canvasWidth,
        height: canvasHeight,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      },
    });

    const runner = Runner.create();

    const onResize = () => {
      if (!sceneState) return;
      const activeContainer = sceneState.container;
      destroyScene();
      start({ target: activeContainer });
    };

    sceneState = {
      container: target,
      engine,
      render,
      runner,
      timeouts: [],
      textureIndex: 0,
      spawnY,
      onResize,
    };

    createBounds(
      engine.world,
      window.Matter.Bodies,
      window.Matter.Composite,
      canvasWidth,
      canvasHeight,
    );

    Render.run(render);
    Runner.run(runner, engine);
    window.addEventListener("resize", onResize);
  }

  /**
   * Start or retrigger the dice rain scene.
   * @param {{ target: HTMLElement }} params
   * @returns {void}
   */
  function start({ target }) {
    if (!(target instanceof HTMLElement) || !window.Matter) return;

    if (sceneState && sceneState.container === target) {
      spawnDiceRain();
      return;
    }

    destroyScene();
    buildScene(target);

    if (!sceneState) return;

    gsap.set(target, { autoAlpha: 1 });

    spawnDiceRain();
  }

  /**
   * Stop and destroy the dice rain scene.
   * @returns {void}
   */
  function stop() {
    destroyScene();
  }

  /**
   * Initialize footer dice rain on any page that includes the shared footer.
   * @returns {void}
   */
  function initFooterDiceRain() {
    if (window.__footerDiceRainInitialized) return;
    if (!window.gsap || !window.Matter || !window.IntersectionObserver) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sceneHost = document.querySelector("[data-home-bottom-dice]");
    const sceneTarget = sceneHost?.querySelector(
      "[data-home-bottom-dice-target]",
    );

    if (
      !(sceneHost instanceof HTMLElement) ||
      !(sceneTarget instanceof HTMLElement)
    ) {
      return;
    }

    let isActive = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!(entry instanceof IntersectionObserverEntry)) return;

        if (entry.isIntersecting) {
          if (!isActive) {
            start({ target: sceneTarget });
            isActive = true;
          }
          return;
        }

        if (isActive) {
          stop();
          isActive = false;
        }
      },
      { root: null, threshold: 0 },
    );

    observer.observe(sceneHost);

    function teardownFooterDiceRain() {
      observer.disconnect();
      stop();
      window.removeEventListener("pagehide", teardownFooterDiceRain);
      window.__footerDiceRainInitialized = false;
    }

    if (sceneHost.getBoundingClientRect().top <= window.innerHeight) {
      start({ target: sceneTarget });
      isActive = true;
    }

    window.__footerDiceRainInitialized = true;
    window.addEventListener("pagehide", teardownFooterDiceRain);
  }

  window.wyrdUi.footerDiceRain = {
    textures: DICE_TEXTURES,
    initFooterDiceRain,
    start,
    stop,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooterDiceRain, {
      once: true,
    });
  } else initFooterDiceRain();
})();
