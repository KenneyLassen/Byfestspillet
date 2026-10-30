// Run with: node --test tests/gameplay.test.cjs
// Exercises the actual inline game script; instrumentation exists only inside the VM.
// This is a logic regression suite, not a substitute for visual/browser/device testing.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const STORAGE_KEY = 'aulumByfestData_v2';
const HTML = fs.readFileSync(path.join(__dirname, '..', 'hoppeborg.html'), 'utf8');
const SCRIPT = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
const clone = value => JSON.parse(JSON.stringify(value));
const profile = (overrides = {}) => ({
  id: 'existing-player', name: 'Aulum-spiller', avatar: 'pige', coins: 240,
  highScore: 95, gamesPlayed: 4,
  upgrades: { jump: 1, balance: 1, speed: 1, magnet: 1, shield: 1 },
  ...overrides,
});

function harness(saved = { players: [profile()], leaderboard: [] }) {
  let now = 10000;
  const storage = new Map([[STORAGE_KEY, JSON.stringify(saved)]]);
  const elements = new Map();
  const listeners = new Map();
  const drawCalls = [];
  const context2d = new Proxy({
    drawImage: (...args) => drawCalls.push(args),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    measureText: text => ({ width: String(text).length * 8 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  }, { get: (object, key) => key in object ? object[key] : () => {} });

  class Element {
    constructor(tagName = 'DIV', attributes = '') {
      this.tagName = tagName.toUpperCase(); this.dataset = {}; this.style = {};
      this.value = ''; this.disabled = false; this.children = []; this.listeners = new Map();
      this.classList = { add() {}, remove() {}, toggle() {} };
      for (const match of attributes.matchAll(/([\w-]+)\s*=\s*['"]([^'"]*)['"]/g)) {
        const [, key, value] = match;
        if (key.startsWith('data-')) this.dataset[key.slice(5)] = value;
        else this[key] = value;
      }
    }
    set innerHTML(html) {
      this.html = html; this.children = [];
      for (const match of html.matchAll(/<(button|input|select|div|span|p)\b([^>]*)>/gi)) {
        const element = new Element(match[1], match[2]);
        this.children.push(element);
        if (element.id) elements.set(element.id, element);
      }
    }
    get innerHTML() { return this.html || ''; }
    querySelectorAll(selector) {
      if (selector.startsWith('.')) return this.children.filter(el => (el.class || '').split(/\s+/).includes(selector.slice(1)));
      if (selector.startsWith('[')) {
        const key = selector.match(/data-([\w-]+)/)?.[1];
        return this.children.filter(el => Object.hasOwn(el.dataset, key));
      }
      return this.children.filter(el => el.tagName === selector.toUpperCase());
    }
    addEventListener(type, handler) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(handler);
    }
    dispatch(type, event = {}) {
      const payload = { target: this, preventDefault() {}, stopPropagation() {}, ...event };
      this[`on${type}`]?.(payload);
      for (const handler of this.listeners.get(type) || []) handler(payload);
      return payload;
    }
    getContext() { return context2d; }
    getBoundingClientRect() { return { left: 0, top: 0, width: this.width || 1200, height: this.height || 720 }; }
    setAttribute(name, value) { this[name] = value; }
    getAttribute(name) { return this[name]; }
    appendChild(element) { this.children.push(element); return element; }
    setPointerCapture() {}
    releasePointerCapture() {}
    hasPointerCapture() { return true; }
    focus() {}
    closest(selector) { return selector.includes(this.tagName.toLowerCase()) ? this : null; }
  }

  const body = new Element('body');
  const document = {
    body, hidden: false, activeElement: body,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element(id === 'game' ? 'canvas' : 'div'));
      return elements.get(id);
    },
    createElement: name => new Element(name),
    querySelectorAll: selector => [...elements.values()].flatMap(el => el.querySelectorAll(selector)),
    addEventListener: (type, handler) => addListener(`document:${type}`, handler),
  };
  const canvas = document.getElementById('game'); canvas.width = 1200; canvas.height = 720;
  document.getElementById('touchControls').innerHTML = HTML.match(/<div id="touchControls"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
  function addListener(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  }
  class SilentAudioContext {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }
    createGain() { return { gain: { value: 0, exponentialRampToValueAtTime() {} }, connect() {} }; }
    resume() { this.state = 'running'; return Promise.resolve(); }
  }
  const sandbox = {
    console, document, performance: { now: () => now },
    Image: class {
      constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
      addEventListener() {}
    },
    AudioContext: SilentAudioContext, devicePixelRatio: 1,
    crypto: { randomUUID: () => 'new-player' },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    addEventListener: addListener, setTimeout: () => 1, clearTimeout() {},
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
  };
  sandbox.window = sandbox;
  const instrumented = SCRIPT.replace(/\}\)\(\);\s*$/, `
    globalThis.__gameTest = {
      game, GAME_STATES, startRound, update, handleCollisions, finishRound,
      renderUI, setState, defaultPlayer, save, draw, drawPlayer, getPlayfield,
      drawAsset, assets, preparedAssets
    };
  })();`);
  assert.notEqual(instrumented, SCRIPT, 'Game IIFE must be instrumentable without editing production code');
  vm.runInNewContext(instrumented, sandbox, { filename: 'index.html:inline-script' });
  const api = sandbox.__gameTest;
  function dispatch(type, details = {}) {
    const event = { key: '', code: '', repeat: false, target: body, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...details };
    for (const handler of listeners.get(type) || []) handler(event);
    return event;
  }
  function start() {
    api.game.currentPlayerId = api.game.players[0].id;
    api.startRound();
    Object.keys(api.game.spawnTimers).forEach(key => { api.game.spawnTimers[key] = Infinity; });
    api.game.coins = []; api.game.obstacles = []; api.game.powerups = [];
    return api.game.player;
  }
  function step(dt) { now += dt * 1000; api.update(dt); }
  function advance(seconds, fps = 60) {
    for (let elapsed = 0; elapsed < seconds - 1e-9;) {
      const dt = Math.min(1 / fps, seconds - elapsed); step(dt); elapsed += dt;
    }
  }
  return { ...api, elements, storage, drawCalls, document, canvas, dispatch, start, step, advance };
}

test('existing v2 profiles, upgrades and leaderboard load without migration or loss', () => {
  const data = { players: [profile({ upgrades: { jump: 3, balance: 2, speed: 4, magnet: 2, shield: 3 } })],
    leaderboard: [{ playerId: 'existing-player', name: 'Aulum-spiller', score: 95, date: '2026-05-04' }] };
  const app = harness(data);
  assert.deepEqual(clone(app.game.players), data.players);
  assert.deepEqual(clone(app.game.leaderboard), data.leaderboard);
  app.start();
  assert.equal(app.game.player.r, 18);
  assert.ok(app.game.player.spriteWidth <= 52 && app.game.player.spriteHeight <= 72, 'player has smaller visual bounds');
});

test('horizontal input responds promptly and travels consistently at 30, 60 and 144 fps', () => {
  const distances = [30, 60, 144].map(fps => {
    const app = harness(); const player = app.start(); const x = player.x;
    app.dispatch('keydown', { key: 'ArrowRight', code: 'ArrowRight' });
    app.advance(0.5, fps);
    const distance = player.x - x;
    assert.ok(distance > 150, `${fps} fps: movement should be responsive, got ${distance}`);
    app.dispatch('keyup', { key: 'ArrowRight', code: 'ArrowRight' });
    app.advance(0.25, fps);
    assert.ok(Math.abs(player.vx) < 5, `${fps} fps: releasing input stops drift`);
    return distance;
  });
  assert.ok(Math.max(...distances) - Math.min(...distances) < 2, JSON.stringify(distances));
});

test('survival scoring and round time agree at 30, 60 and 144 fps', () => {
  const results = [30, 60, 144].map(fps => {
    const app = harness(); app.start(); app.advance(5, fps);
    assert.ok(Math.abs(app.game.time - 55) < 0.001);
    assert.ok(Math.abs(app.game.score - 35) < 0.01, `${fps} fps should retain fractional frame points`);
    return app.game.score;
  });
  assert.ok(Math.max(...results) - Math.min(...results) < 0.01);
});

test('complete 60-second rounds finish once with equal scores at 30, 60 and 144 fps', () => {
  const scores = [30, 60, 144].map(fps => {
    const app = harness(); app.start(); app.advance(60.1, fps);
    assert.equal(app.game.state, app.GAME_STATES.RESULTS);
    assert.equal(app.game.time, 0);
    assert.equal(app.game.players[0].gamesPlayed, 5);
    assert.equal(app.game.leaderboard.length, 1);
    assert.ok(Math.abs(app.game.lastResult.score - 1050) <= 1);
    return app.game.lastResult.score;
  });
  assert.ok(Math.max(...scores) - Math.min(...scores) <= 1, JSON.stringify(scores));
});

for (const fps of [30, 60, 144]) {
  test(`a tap just before landing awards one perfect jump at ${fps} fps`, () => {
    const app = harness(); const player = app.start();
    player.y = app.getPlayfield().floorY - player.r - 12; player.vy = 300;
    app.dispatch('keydown', { key: ' ', code: 'Space' }); app.advance(0.2, fps);
    assert.equal(player.combo, 1);
    assert.ok(player.bouncePower > 1.2);
    assert.equal(app.game.popups.filter(p => p.txt === 'Perfekt hop!').length, 1);
    assert.ok(app.game.score >= 80 && app.game.score < 85);
    assert.ok(player.vy < 0, 'landing launches the timed jump');
  });

  test(`a slightly earlier tap awards a good jump at ${fps} fps`, () => {
    const app = harness(); const player = app.start();
    player.y = app.getPlayfield().floorY - player.r - 46; player.vy = 300;
    app.dispatch('keydown', { key: ' ', code: 'Space' }); app.advance(0.25, fps);
    assert.equal(app.game.popups.filter(p => p.txt === 'Godt hop!').length, 1);
    assert.equal(player.combo, 0);
    assert.ok(player.bouncePower > 1);
    assert.ok(app.game.score >= 25 && app.game.score < 30);
  });
}

test('an early tap breaks combo and cannot produce a delayed bonus', () => {
  const app = harness(); const player = app.start();
  player.y = app.getPlayfield().floorY - player.r - 200; player.vy = 50;
  player.combo = 5; player.bouncePower = 2;
  app.dispatch('keydown', { key: ' ', code: 'Space' }); app.step(1 / 60);
  assert.equal(player.combo, 0); assert.ok(player.bouncePower < 2);
  assert.ok(app.game.popups.some(p => p.txt === 'For tidligt!'));
  app.advance(0.7);
  assert.ok(!app.game.popups.some(p => /Perfekt hop|Godt hop/.test(p.txt)));
});

test('holding the jump key and OS key repeat do not create another timed tap', () => {
  const app = harness(); const player = app.start();
  player.y = app.getPlayfield().floorY - player.r - 200; player.vy = 50;
  app.dispatch('keydown', { key: ' ', code: 'Space' }); app.step(1 / 60);
  player.y = app.getPlayfield().floorY - player.r - 12; player.vy = 300;
  app.dispatch('keydown', { key: ' ', code: 'Space', repeat: true }); app.advance(0.2);
  assert.equal(player.combo, 0);
  assert.ok(!app.game.popups.some(p => p.txt === 'Perfekt hop!'));
  app.dispatch('keyup', { key: ' ', code: 'Space' });
  player.y = app.getPlayfield().floorY - player.r - 12; player.vy = 300;
  app.dispatch('keydown', { key: ' ', code: 'Space' }); app.advance(0.2);
  assert.equal(player.combo, 1, 'a new press after release still works');
});

test('losing focus releases movement and jump so controls cannot stick', () => {
  const app = harness(); app.start();
  app.dispatch('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
  app.dispatch('keydown', { key: ' ', code: 'Space' });
  app.dispatch('blur');
  assert.equal(app.game.input.left, false); assert.equal(app.game.input.right, false);
  assert.equal(app.game.input.jump, false); assert.equal(app.game.input.jumpPressed, false);
});

test('multiple keys for one direction remain responsive when one key is released', () => {
  const app = harness(); app.start();
  app.dispatch('keydown', { key: 'ArrowRight' }); app.dispatch('keydown', { key: 'd' });
  app.dispatch('keyup', { key: 'ArrowRight' });
  assert.equal(app.game.input.right, true);
  app.dispatch('keyup', { key: 'd' }); assert.equal(app.game.input.right, false);
});

test('releasing Shift before A or D does not leave movement stuck', () => {
  const app = harness(); app.start();
  for (const [upper, lower, code, direction] of [['D', 'd', 'KeyD', 'right'], ['A', 'a', 'KeyA', 'left']]) {
    for (const eventCode of [code, '']) {
      app.dispatch('keydown', { key: upper, code: eventCode, shiftKey: true });
      assert.equal(app.game.input[direction], true);
      app.dispatch('keyup', { key: 'Shift', code: 'ShiftLeft', shiftKey: false });
      app.dispatch('keyup', { key: lower, code: eventCode, shiftKey: false });
      assert.equal(app.game.input[direction], false, `${code || lower}: releasing the same physical key clears movement`);
    }
  }
});

test('typing in a profile field is not captured as gameplay input', () => {
  const app = harness(); app.start();
  const event = app.dispatch('keydown', { key: 'a', target: { tagName: 'INPUT' } });
  assert.equal(app.game.input.left, false); assert.equal(event.defaultPrevented, false);
});

test('touch movement, simultaneous jump and pointer cancellation release correctly', () => {
  const app = harness(); const player = app.start();
  const buttons = app.elements.get('touchControls').querySelectorAll('[data-control]');
  const right = buttons.find(button => button.dataset.control === 'right');
  const jump = buttons.find(button => button.dataset.control === 'jump');
  assert.ok(right && jump, 'touch controls exist in the delivered HTML');
  right.dispatch('pointerdown', { pointerId: 11 });
  player.y = app.getPlayfield().floorY - player.r - 12; player.vy = 300;
  jump.dispatch('pointerdown', { pointerId: 12 }); app.advance(0.2);
  assert.equal(player.combo, 1); assert.equal(app.game.input.right, true);
  jump.dispatch('pointerup', { pointerId: 12 }); assert.equal(app.game.input.jump, false);
  right.dispatch('pointercancel', { pointerId: 11 }); assert.equal(app.game.input.right, false);
  right.dispatch('pointerdown', { pointerId: 13 });
  right.dispatch('lostpointercapture', { pointerId: 13 }); assert.equal(app.game.input.right, false);
});

test('loaded image rendering preserves source proportions inside every destination box', () => {
  const app = harness();
  for (const [name, file] of Object.entries({ castle: 'hoppeborg.png', boyIdle: 'dreng_idle.png',
    boyJump: 'dreng_jump.png', girlIdle: 'pige_idle.png', girlJump: 'pige_jump.png',
    coin: 'coin.png', plate: 'plate.png', sausage: 'sausage.png' })) {
    const png = fs.readFileSync(path.join(__dirname, '..', file));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    Object.assign(app.assets[name], { complete: true, naturalWidth: width, naturalHeight: height });
    app.drawAsset(name, 10, 20, 300, 100);
    const [, , , sourceWidth, sourceHeight, x, y, renderedWidth, renderedHeight] = app.drawCalls.at(-1);
    assert.ok(Math.abs(renderedWidth / renderedHeight - sourceWidth / sourceHeight) < 1e-9, name);
    assert.ok(x >= 10 && y >= 20 && x + renderedWidth <= 310.001 && y + renderedHeight <= 120.001, name);
  }
});

test('all avatar poses preserve crop proportions and align their visible feet with the landing surface', () => {
  const app = harness(); const player = app.start();
  for (const name of ['boyIdle', 'boyJump', 'girlIdle', 'girlJump']) {
    Object.assign(app.assets[name], { complete: true, naturalWidth: 1024, naturalHeight: 1536 });
    app.preparedAssets[name] = { image: app.assets[name], x: 40, y: 80, w: 300, h: 700 };
  }
  player.y = app.getPlayfield().floorY - player.r;
  for (const avatar of ['dreng', 'pige']) for (const vy of [0, -400]) {
    player.vy = vy; app.drawPlayer(player, { avatar });
    const [, , , sourceWidth, sourceHeight, x, y, width, height] = app.drawCalls.at(-1);
    assert.ok(Math.abs(width / height - sourceWidth / sourceHeight) < 1e-9);
    assert.ok(Math.abs(y + height - app.getPlayfield().floorY) < 1e-9);
    assert.ok(width <= 52 && height <= 72);
    assert.ok(x >= 0 && x + width <= app.canvas.width && y >= 0);
  }
});

for (const type of ['sausage', 'plate', 'fries', 'balloon']) {
  test(`${type} damage says AV!, clears combo/power/tap and immediately reverses upward motion`, () => {
    const app = harness(); const player = app.start();
    Object.assign(player, { y: 260, vy: -400, combo: 7, bouncePower: 3, pendingJumpAt: 0 });
    app.game.score = 100;
    app.game.obstacles = [{ type, x: player.x, y: player.y, r: 24, vx: 0, vy: 0 }];
    app.handleCollisions(app.game.players[0], app.getPlayfield().floorY);
    assert.equal(player.combo, 0); assert.equal(player.bouncePower, 1); assert.equal(player.pendingJumpAt, null);
    assert.ok(player.vy >= 620); assert.ok(player.hitCooldown > 0);
    assert.ok(app.game.popups.some(p => p.txt === 'AV!'));
    assert.equal(app.game.obstacles.length, 0, 'contact is consumed');
    const y = player.y; app.step(1 / 60); assert.ok(player.y > y, 'player falls on next frame');
    const score = app.game.score;
    app.game.obstacles = [{ type, x: player.x, y: player.y, r: 24, vx: 0, vy: 0 }];
    app.handleCollisions(app.game.players[0], app.getPlayfield().floorY);
    assert.equal(app.game.score, score, 'recovery prevents repeated contact damage');
    assert.equal(app.game.obstacles.length, 0);
  });
}

test('a shield protects combo, accumulated power and upward jump from overlapping obstacles', () => {
  const app = harness(); const player = app.start();
  Object.assign(player, { y: 260, vy: -400, combo: 5, bouncePower: 2.5, shield: 3 });
  app.game.obstacles = ['sausage', 'plate', 'fries', 'balloon'].map(type => ({ type, x: player.x, y: player.y, r: 24 }));
  app.handleCollisions(app.game.players[0], app.getPlayfield().floorY);
  assert.equal(player.shield, 0); assert.equal(player.combo, 5); assert.equal(player.bouncePower, 2.5);
  assert.equal(player.vy, -400); assert.equal(app.game.obstacles.length, 0);
  assert.equal(app.game.popups.filter(p => p.txt === 'Skjold reddede dig!').length, 1);
  assert.ok(!app.game.popups.some(p => p.txt === 'AV!'));
});

test('extreme jump upgrades, horizontal impacts and out-of-bounds states stay on screen', () => {
  const app = harness({ players: [profile({ upgrades: { jump: 100, balance: 1, speed: 100, magnet: 1, shield: 1 } })], leaderboard: [] });
  const player = app.start(); const field = app.getPlayfield();
  player.combo = 30; player.bouncePower = 4.2; player.vy = 1000;
  for (const fps of [30, 60, 144]) {
    for (const direction of [-1, 1]) {
      player.x = direction < 0 ? -100 : app.canvas.width + 100;
      player.vx = direction * 10000; player.y = -500; player.vy = -5000;
      app.game.input.left = direction < 0; app.game.input.right = direction > 0;
      for (let frame = 0; frame < fps * 2; frame++) {
        app.step(1 / fps);
        assert.ok(player.x >= field.left - 0.001 && player.x <= field.right + 0.001);
        assert.ok(player.y >= field.top - 0.001 && player.y + player.r <= field.floorY + 0.001);
        assert.ok(player.x - player.spriteWidth / 2 >= 0 && player.x + player.spriteWidth / 2 <= app.canvas.width);
        assert.ok(player.y + player.r - player.spriteHeight >= 0 && player.y + player.r <= app.canvas.height);
      }
    }
  }
});

test('coin, shield and magnet pickups still work and are consumed once', () => {
  const app = harness(); const player = app.start(); const field = app.getPlayfield();
  app.game.coins = [{ x: player.x, y: player.y, r: 10, bonus: false }];
  app.game.powerups = ['shield', 'magnet'].map(type => ({ type, x: player.x, y: player.y, r: 12 }));
  app.handleCollisions(app.game.players[0], field.floorY);
  assert.equal(app.game.roundCoins, 1); assert.equal(app.game.coins.length, 0);
  assert.ok(player.shield > 0 && player.magnet > 0); assert.equal(app.game.powerups.length, 0);
  const score = app.game.score;
  app.handleCollisions(app.game.players[0], field.floorY);
  assert.equal(app.game.score, score); assert.equal(app.game.roundCoins, 1);
});

test('the existing shop purchases and persists an upgrade without replacing other data', () => {
  const data = { players: [profile()], leaderboard: [{ name: 'Ven', score: 123, playerId: 'friend' }] };
  const app = harness(data); app.game.currentPlayerId = data.players[0].id;
  app.setState(app.GAME_STATES.SHOP);
  const button = app.elements.get('ui').querySelectorAll('.buy').find(el => el.dataset.k === 'speed');
  assert.ok(button, 'shop still exposes the speed upgrade'); button.dispatch('click');
  const saved = JSON.parse(app.storage.get(STORAGE_KEY));
  assert.equal(saved.players[0].upgrades.speed, 2); assert.equal(saved.players[0].coins, 220);
  assert.equal(saved.players[0].highScore, 95); assert.deepEqual(saved.leaderboard, data.leaderboard);
  const reload = harness(saved); assert.equal(reload.game.players[0].upgrades.speed, 2);
});

test('a finished round persists coins, integer score, records and the existing profile exactly once', () => {
  const data = { players: [profile()], leaderboard: [{ name: 'Ven', score: 100, playerId: 'friend' }] };
  const app = harness(data); app.start();
  app.game.score = 250.1; app.game.roundCoins = 9; app.game.time = 0.01;
  app.step(1 / 30); app.step(1 / 30);
  assert.equal(app.game.state, app.GAME_STATES.RESULTS);
  const saved = JSON.parse(app.storage.get(STORAGE_KEY)); const player = saved.players[0];
  assert.equal(player.id, 'existing-player'); assert.equal(player.avatar, 'pige');
  assert.equal(player.gamesPlayed, 5); assert.equal(player.coins, 249);
  assert.equal(player.highScore, 250); assert.deepEqual(player.upgrades, data.players[0].upgrades);
  assert.equal(saved.leaderboard.length, 2); assert.equal(saved.leaderboard[0].score, 250);
  assert.ok(saved.leaderboard.some(entry => entry.playerId === 'friend'));
  assert.equal(app.game.lastResult.rank, 1); assert.equal(app.game.lastResult.coinsEarned, 9);
  const reload = harness(saved); assert.deepEqual(clone(reload.game.players), saved.players);
});
