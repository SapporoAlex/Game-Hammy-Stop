(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Constants (mirrors main.py)
  // ---------------------------------------------------------------------
  const WIDTH = 1800, HEIGHT = 1000;
  const GRID_SIZE = 100;
  const SPEED = 5;
  const BARBOX_W = 600, BARBOX_H = 50;
  const COLORS = {
    BLACK: 'rgb(0,0,0)',
    WHITE: 'rgb(255,255,255)',
    PURPLE: 'rgb(10,0,90)',
    COBALT: 'rgb(10,0,200)',
    VALUE: 'rgb(15,190,255)',
    DETECTION_GREEN: 'rgb(95,255,25)',
    BARBOX: 'rgb(100,100,100)',
  };
  const FONT = "60px Bahnschrift, 'Segoe UI', 'Arial Narrow', sans-serif";
  const HIGH_SCORE_KEY = 'hammyStopHighScore';

  // ---------------------------------------------------------------------
  // Grid data (from grid_config.csv / secret_map.csv)
  // ---------------------------------------------------------------------
  const GRID_CONFIG = [
    '0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0',
    '0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0',
    '0,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,0',
    '0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0',
    '0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0',
    '0,1,1,1,0,0,0,1,1,1,0,1,1,1,0,1,0',
    '0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0',
    '0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0',
  ];
  const SECRET_MAP = [
    '1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1',
    '1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1',
    '1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1',
    '0,0,1,0,1,0,1,0,0,0,0,1,0,1,0,1',
    '0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1',
    '0,0,1,0,1,0,1,0,1,1,1,1,0,1,0,1',
    '1,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0',
    '1,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0',
  ];

  function buildImpassable(rows) {
    const set = new Set();
    rows.forEach((row, y) => {
      row.split(',').forEach((cell, x) => {
        if (cell.trim() === '1') set.add(x + ',' + y);
      });
    });
    return set;
  }

  function randrangeStep(start, stop, step) {
    const n = Math.ceil((stop - start) / step);
    return start + Math.floor(Math.random() * n) * step;
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // ---------------------------------------------------------------------
  // Assets
  // ---------------------------------------------------------------------
  const IMAGE_FILES = {
    s1: 's1.png', s2: 's2.png',
    um1: 'um1.png', um2: 'um2.png',
    dm1: 'dm1.png', dm2: 'dm2.png',
    lm1: 'lm1.png', lm2: 'lm2.png',
    rm1: 'rm1.png', rm2: 'rm2.png',
    f1: 'f1.png',
    n1: 'n1.png', n2: 'n2.png', n3: 'n3.png', n4: 'n4.png',
    n5: 'n5.png', n6: 'n6.png', n7: 'n7.png', n8: 'n8.png',
    p1: 'p1.png', p2: 'p2.png', p3: 'p3.png',
    title: 'title.png',
    i1: 'i1.png',
  };
  const AUDIO_FILES = { bgm: 'bgm.mp3', nut: 'nut.mp3', poop: 'poop.mp3', alert: 'alert.mp3' };

  const IMG = {};
  const SFX = {};
  let bgmAudio = null;

  function loadImage(name, file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { IMG[name] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = 'assets/images/' + file;
    });
  }

  function loadAudio(name, file) {
    return new Promise((resolve) => {
      const a = new Audio('assets/audio/' + file);
      a.preload = 'auto';
      SFX[name] = a;
      const done = () => resolve();
      a.addEventListener('canplaythrough', done, { once: true });
      a.addEventListener('error', done, { once: true });
      setTimeout(done, 3000);
    });
  }

  function playSfx(name) {
    const template = SFX[name];
    if (!template) return;
    const inst = template.cloneNode(true);
    inst.play().catch(() => {});
  }

  async function loadAssets() {
    const tasks = [];
    for (const [name, file] of Object.entries(IMAGE_FILES)) tasks.push(loadImage(name, file));
    for (const [name, file] of Object.entries(AUDIO_FILES)) tasks.push(loadAudio(name, file));
    await Promise.all(tasks);
    bgmAudio = SFX.bgm;
    delete SFX.bgm;
    bgmAudio.loop = true;
  }

  // ---------------------------------------------------------------------
  // Entities (mirror player.py / nuts.py / circles.py / ui.py)
  // ---------------------------------------------------------------------
  class Character {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 50;
      this.height = 50;
      this.standingImgs = [IMG.s1, IMG.s2];
      this.upImgs = [IMG.um1, IMG.um2];
      this.downImgs = [IMG.dm1, IMG.dm2];
      this.leftImgs = [IMG.lm1, IMG.lm2];
      this.rightImgs = [IMG.rm1, IMG.rm2];
      this.fImgs = [IMG.f1, IMG.f1];
      this.currentImgs = this.standingImgs;
      this.image = this.standingImgs[0];
      this.imgIndex = 0;
      this.animationCounter = 0;
      this.isFrozen = false;
      this.freezeTime = 100;
      this.detection = 100;
    }
    updateImage() {
      this.animationCounter += 1;
      if (this.animationCounter >= 10) {
        this.imgIndex = (this.imgIndex + 1) % 2;
        this.animationCounter = 0;
      }
      this.image = this.currentImgs[this.imgIndex];
    }
    standStill() { this.currentImgs = this.standingImgs; }
    moveUp() { this.currentImgs = this.upImgs; }
    moveDown() { this.currentImgs = this.downImgs; }
    moveLeft() { this.currentImgs = this.leftImgs; }
    moveRight() { this.currentImgs = this.rightImgs; }
    freeze() { this.currentImgs = this.fImgs; this.isFrozen = true; }
    lowerFreezeTime() { if (this.freezeTime > 0) this.freezeTime -= 0.5; }
  }

  class Nut {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.images = [IMG.n1, IMG.n2, IMG.n3, IMG.n4, IMG.n5, IMG.n6, IMG.n7, IMG.n8];
      this.w = 100;
      this.h = 100;
      this.currentIndex = 0;
      this.image = this.images[0];
      this.animationSpeed = 10;
      this.animationCounter = 0;
    }
    update() {
      this.animationCounter += 1;
      if (this.animationCounter >= this.animationSpeed) {
        this.animationCounter = 0;
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.image = this.images[this.currentIndex];
      }
    }
    draw(ctx) { ctx.drawImage(this.image, this.x, this.y); }
    checkCollision(player) {
      return rectsOverlap(this.x, this.y, this.w, this.h, player.x, player.y, player.width, player.height);
    }
  }

  class Circle {
    constructor(type, x, y) {
      this.radius = 100;
      this.x = x;
      this.y = y;
      this.type = type;
      this.dir = type === 'a' ? 'u' : 1;
      this.rectX = x - this.radius;
      this.rectY = y - this.radius;
      this.rectW = this.radius * 2;
      this.rectH = this.radius * 2;
    }
    updateRect() {
      this.rectX = this.x - this.radius;
      this.rectY = this.y - this.radius;
      this.rectW = this.radius * 2;
      this.rectH = this.radius * 2;
    }
    display(ctx) {
      if (this.type === 'a') {
        if (this.y <= 200 && this.dir === 'u') this.dir = 'l';
        else if (this.x <= 300 && this.dir === 'l') this.dir = 'd';
        else if (this.y >= 800 && this.dir === 'd') this.dir = 'r';
        else if (this.x === 1500 && this.dir === 'r') this.dir = 'u';

        if (this.dir === 'u') this.y -= 5;
        else if (this.dir === 'l') this.x -= 5;
        else if (this.dir === 'd') this.y += 5;
        else if (this.dir === 'r') this.x += 5;
      } else if (this.type === 'b') {
        if (this.y >= 750) this.dir = -1;
        else if (this.y <= 200) this.dir = 1;
        this.y += 5 * this.dir;
      } else if (this.type === 'c') {
        if (this.x >= 1600) this.dir = -1;
        else if (this.x <= 300) this.dir = 1;
        this.x += 5 * this.dir;
      }

      ctx.save();
      ctx.globalAlpha = 128 / 255;
      ctx.fillStyle = 'rgb(250,230,130)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    checkCollision(player) {
      return rectsOverlap(this.rectX, this.rectY, this.rectW, this.rectH, player.x, player.y, player.width, player.height);
    }
  }

  class Bar {
    constructor(x, y, valueColor) {
      this.x = x;
      this.y = y;
      this.valueColor = valueColor;
    }
    display(ctx, value) {
      ctx.fillStyle = COLORS.BARBOX;
      ctx.fillRect(this.x, this.y, BARBOX_W, BARBOX_H);
      const valueWidth = Math.min(value * 6, BARBOX_W);
      if (valueWidth > 0) {
        ctx.fillStyle = this.valueColor;
        ctx.fillRect(this.x, this.y, valueWidth, BARBOX_H);
      }
    }
  }

  // ---------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const gameArea = document.getElementById('game-area');
  const loadingScreen = document.getElementById('loading-screen');

  let highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10) || 0;
  const impassableTiles = buildImpassable(highScore >= 50 ? SECRET_MAP : GRID_CONFIG);

  function isImpassable(x, y) {
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    return impassableTiles.has(gridX + ',' + gridY);
  }

  function updateHighScore(newScore) {
    if (newScore > highScore) {
      highScore = newScore;
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
  }

  // ---------------------------------------------------------------------
  // Input: keyboard + touch
  // ---------------------------------------------------------------------
  const keys = { left: false, right: false, up: false, down: false, space: false, escape: false, enter: false };
  const virtual = { left: false, right: false, up: false, down: false, space: false };

  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowLeft': keys.left = true; e.preventDefault(); break;
      case 'ArrowRight': keys.right = true; e.preventDefault(); break;
      case 'ArrowUp': keys.up = true; e.preventDefault(); break;
      case 'ArrowDown': keys.down = true; e.preventDefault(); break;
      case 'Space': keys.space = true; e.preventDefault(); break;
      case 'Escape': keys.escape = true; break;
      case 'Enter': keys.enter = true; break;
    }
  });
  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'ArrowLeft': keys.left = false; break;
      case 'ArrowRight': keys.right = false; break;
      case 'ArrowUp': keys.up = false; break;
      case 'ArrowDown': keys.down = false; break;
      case 'Space': keys.space = false; break;
      case 'Escape': keys.escape = false; break;
      case 'Enter': keys.enter = false; break;
    }
  });

  function isTouchDevice() {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }
  const isTouch = isTouchDevice();
  if (isTouch) document.body.classList.add('touch-device');

  function bindHold(el, onDown, onUp) {
    if (!el) return;
    const start = (e) => { e.preventDefault(); onDown(); el.classList.add('pressed'); };
    const end = (e) => { e.preventDefault(); onUp(); el.classList.remove('pressed'); };
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  bindHold(document.getElementById('btn-up'), () => { virtual.up = true; }, () => { virtual.up = false; });
  bindHold(document.getElementById('btn-down'), () => { virtual.down = true; }, () => { virtual.down = false; });
  bindHold(document.getElementById('btn-left'), () => { virtual.left = true; }, () => { virtual.left = false; });
  bindHold(document.getElementById('btn-right'), () => { virtual.right = true; }, () => { virtual.right = false; });
  bindHold(document.getElementById('btn-freeze'), () => { virtual.space = true; }, () => { virtual.space = false; });

  canvas.addEventListener('pointerdown', () => {
    if (state === 'menu') startGame();
  });

  const fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  function updateOrientationClass() {
    const portrait = window.innerHeight >= window.innerWidth;
    document.body.classList.toggle('orientation-portrait', portrait);
    document.body.classList.toggle('orientation-landscape', !portrait);
  }
  window.addEventListener('resize', updateOrientationClass);
  window.addEventListener('orientationchange', updateOrientationClass);
  updateOrientationClass();

  function resizeCanvasOnly() {
    const rect = gameArea.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    canvas.style.width = Math.floor(WIDTH * scale) + 'px';
    canvas.style.height = Math.floor(HEIGHT * scale) + 'px';
  }
  if (window.ResizeObserver) {
    new ResizeObserver(resizeCanvasOnly).observe(gameArea);
  } else {
    window.addEventListener('resize', resizeCanvasOnly);
  }

  // ---------------------------------------------------------------------
  // Game state (mirrors main.py's play()/main_menu())
  // ---------------------------------------------------------------------
  let state = 'menu';
  let score = 0;
  let player, nuts, poops, circleList, freezeBar, detectionBar;
  let poopTimeoutId = null;

  function spawnPoop() {
    const poopImgs = [IMG.p1, IMG.p2, IMG.p3];
    const image = poopImgs[Math.floor(Math.random() * poopImgs.length)];
    poops.push({ image, x: player.x, y: player.y });
    playSfx('poop');
  }

  function scheduleNextPoop() {
    const interval = 10000 + Math.random() * 20000; // randint(10000, 30000)
    poopTimeoutId = setTimeout(() => {
      if (state !== 'playing') return;
      spawnPoop();
      scheduleNextPoop();
    }, interval);
  }

  function startGame() {
    player = new Character(50, 400);
    freezeBar = new Bar(50, HEIGHT - 75, COLORS.VALUE);
    detectionBar = new Bar(WIDTH - BARBOX_W - 50, HEIGHT - 75, COLORS.DETECTION_GREEN);
    score = 0;
    nuts = [new Nut(400, 400)];
    poops = [];
    circleList = [
      new Circle('a', WIDTH / 2, HEIGHT / 2),
      new Circle('b', WIDTH / 2, HEIGHT / 2),
      new Circle('c', WIDTH / 2, HEIGHT / 2),
    ];
    state = 'playing';
    scheduleNextPoop();
    if (bgmAudio) {
      bgmAudio.currentTime = 0;
      bgmAudio.play().catch(() => {});
    }
  }

  function goToMenu() {
    state = 'menu';
    if (poopTimeoutId) { clearTimeout(poopTimeoutId); poopTimeoutId = null; }
  }

  // ---------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------
  function drawGrid() {
    ctx.fillStyle = COLORS.COBALT;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let x = 50; x < WIDTH - 50; x += GRID_SIZE) {
      for (let y = 100; y < HEIGHT - 100; y += GRID_SIZE) {
        const gridX = Math.floor((x - 50) / GRID_SIZE);
        const gridY = Math.floor((y - 50) / GRID_SIZE);
        if (impassableTiles.has(gridX + ',' + gridY)) {
          ctx.drawImage(IMG.i1, x, y);
        } else {
          ctx.fillStyle = COLORS.PURPLE;
          ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
        }
      }
    }
    ctx.strokeStyle = COLORS.BLACK;
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 100, 1700, 800);
  }

  function displayText() {
    ctx.textBaseline = 'top';
    ctx.font = FONT;
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText(`NUTS: ${score}`, 50, 30);
    ctx.fillText(`HI-SCORE: ${highScore}`, WIDTH - BARBOX_W / 1.5, 30);
    ctx.fillStyle = COLORS.BARBOX;
    ctx.fillText('DETECTION', WIDTH - BARBOX_W - 50, HEIGHT - 75);
    ctx.fillText('FREEZE', 50, HEIGHT - 75);
  }

  function render() {
    drawGrid();
    freezeBar.display(ctx, player.freezeTime);
    detectionBar.display(ctx, player.detection);
    for (const nut of nuts) { nut.draw(ctx); nut.update(); }
    for (const poop of poops) { ctx.drawImage(poop.image, poop.x, poop.y); }
    ctx.drawImage(player.image, player.x, player.y);
    for (const circle of circleList) circle.display(ctx);
    ctx.drawImage(IMG.title, 600, 10, 600, 100);
    displayText();
  }

  function renderMenu() {
    ctx.fillStyle = COLORS.COBALT;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = COLORS.PURPLE;
    ctx.fillRect(200, 100, 1400, 700);
    ctx.drawImage(IMG.title, 300, 200);
    ctx.textBaseline = 'top';
    ctx.font = FONT;
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText(isTouch ? 'Tap to Play' : 'Press Enter to Play', 600, 500);
    if (!isTouch) ctx.fillText('Press Esc to Quit', 600, 600);
    if (score > 0) ctx.fillText(`You got ${score} nuts!`, 600, 700);
  }

  // ---------------------------------------------------------------------
  // Fixed-timestep tick (mirrors the body of play()'s while loop)
  // ---------------------------------------------------------------------
  function gameTick() {
    const left = keys.left || virtual.left;
    const right = keys.right || virtual.right;
    const up = keys.up || virtual.up;
    const down = keys.down || virtual.down;
    const space = keys.space || virtual.space;
    const escape = keys.escape;

    let newX = player.x, newY = player.y;

    if (left && player.x > 50 && !player.isFrozen) {
      newX -= SPEED; player.moveLeft();
    } else if (right && player.x < (WIDTH - GRID_SIZE - 50) && !player.isFrozen) {
      newX += SPEED; player.moveRight();
    } else if (up && player.y > 100 && !player.isFrozen) {
      newY -= SPEED; player.moveUp();
    } else if (down && player.y < (HEIGHT - GRID_SIZE - 100) && !player.isFrozen) {
      newY += SPEED; player.moveDown();
    } else if (space && player.freezeTime > 0) {
      player.freeze();
      player.lowerFreezeTime();
    } else if (escape) {
      goToMenu();
      return;
    } else {
      player.isFrozen = false;
      player.standStill();
    }

    if (!isImpassable(newX, newY)) {
      player.x = newX;
      player.y = newY;
    }

    for (let i = nuts.length - 1; i >= 0; i--) {
      const nut = nuts[i];
      if (nut.checkCollision(player)) {
        score += 1;
        playSfx('nut');
        updateHighScore(score);
        nuts.splice(i, 1);
        player.detection += 5;
        player.freezeTime += 25;
        if (player.freezeTime > 100) player.freezeTime = 100;
        if (player.detection > 100) player.detection = 100;
      }
    }

    for (const circle of circleList) {
      circle.updateRect();
      if (circle.checkCollision(player) && !player.isFrozen) {
        player.detection -= 0.5;
        playSfx('alert');
        if (player.detection < 0) {
          goToMenu();
          return;
        }
      }
      if (score >= 10 && circleList.length === 3) circleList.push(new Circle('a', WIDTH / 2, HEIGHT / 2));
      if (score >= 20 && circleList.length === 4) circleList.push(new Circle('b', 400, HEIGHT / 2));
      if (score >= 30 && circleList.length === 5) circleList.push(new Circle('c', WIDTH / 2, 300));
      if (score >= 40 && circleList.length === 6) circleList.push(new Circle('b', 800, HEIGHT / 2));
      if (score >= 50 && circleList.length === 7) circleList.push(new Circle('c', WIDTH / 2, 600));
    }

    if (nuts.length <= 2) {
      nuts.push(new Nut(randrangeStep(200, 1500, 100), randrangeStep(200, 800, 100)));
    }

    render();
    player.updateImage();
  }

  // ---------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------
  const STEP = 1000 / 60;
  let lastTime = null;
  let accumulator = 0;

  function frame(now) {
    if (state === 'menu' && keys.enter) startGame();

    if (lastTime === null) lastTime = now;
    let delta = now - lastTime;
    lastTime = now;
    if (delta > 250) delta = 250;
    accumulator += delta;

    let steps = 0;
    while (accumulator >= STEP && steps < 5) {
      accumulator -= STEP;
      if (state === 'playing') gameTick();
      steps++;
    }

    if (state === 'menu') renderMenu();

    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------
  async function init() {
    await loadAssets();
    loadingScreen.classList.add('hidden');
    resizeCanvasOnly();
    requestAnimationFrame(frame);
  }

  init();
})();
