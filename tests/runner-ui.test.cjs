// Run with: node --test tests/runner-ui.test.cjs
// Loads the actual simulation and browser adapter. Canvas/DOM/audio are stubs;
// layout, visual assets and real device behavior are checked separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CORE = fs.readFileSync(path.join(ROOT, 'runner-core.js'), 'utf8');
const ART = fs.readFileSync(path.join(ROOT, 'runner-art.js'), 'utf8');
const SPONSOR_CONFIG = fs.readFileSync(path.join(ROOT, 'sponsor-config.js'), 'utf8');
const SCRIPT = fs.readFileSync(path.join(ROOT, 'runner.js'), 'utf8');
const OLD_KEY = 'aulumByfestData_v2';
const NEW_KEY = 'aulumHopOgRul_v4';
const clone = value => JSON.parse(JSON.stringify(value));
const legacy = () => ({
  players: [{ id: 'old-player', name: 'Maja', avatar: 'pige', coins: 950,
    highScore: 99999, bestTicks: 88888, gamesPlayed: 400,
    upgrades: { jump: 9, balance: 9, speed: 9, magnet: 9, shield: 9 } }],
  leaderboard: [{ playerId: 'old-player', score: 99999 }],
});

function harness(initialStorage = new Map([[OLD_KEY, JSON.stringify(legacy())]]), options = {}) {
  const storage = new Map(initialStorage);
  const writes = [];
  const elements = new Map();
  const listeners = new Map();
  const images = [], drawCalls = [], rotations = [], translations = [], outlines = [],paintOps=[];
  let transform=[1,0,0,1,0,0],clipBounds=null,pathRect=null;const transformStack=[],clipStack=[];
  const ctx = new Proxy({
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: options.imageData || new Uint8ClampedArray(0) }),
    drawImage: (...args) => { drawCalls.push(args);paintOps.push({kind:'image',args,transform:[...transform]}); },
    fill:()=>paintOps.push({kind:'fill',color:ctx.fillStyle,alpha:ctx.globalAlpha??1,clip:clipBounds?.slice()}),
    fillRect:(...args)=>paintOps.push({kind:'rect',color:ctx.fillStyle,args,transform:[...transform]}),
    fillText:(text,x,y,maxWidth)=>paintOps.push({kind:'text',text:String(text),x,y,maxWidth}),
    save:()=>{transformStack.push([...transform]);clipStack.push(clipBounds?.slice()||null);},
    restore:()=>{transform=transformStack.pop()||[1,0,0,1,0,0];clipBounds=clipStack.pop()||null;},
    beginPath:()=>{pathRect=null;},
    rect:(...args)=>{pathRect=args;},
    clip:()=>{if(pathRect)clipBounds=pathRect.slice();},
    rotate: angle => {
      rotations.push(angle);const [a,b,c,d,e,f]=transform,cos=Math.cos(angle),sin=Math.sin(angle);
      transform=[a*cos+c*sin,b*cos+d*sin,c*cos-a*sin,d*cos-b*sin,e,f];
    },
    translate: (x,y) => {
      translations.push([x,y]);const [a,b,c,d,e,f]=transform;transform=[a,b,c,d,e+a*x+c*y,f+b*x+d*y];
    },
    roundRect: (...args) => {outlines.push(args);paintOps.push({kind:'rounded',args,transform:[...transform]});},
    measureText: text => ({ width: String(text).length * 8 }),
  }, { get: (object, key) => key in object ? object[key] : () => {} });

  class Element {
    constructor(tagName = 'DIV', attributes = '') {
      this.tagName = tagName.toUpperCase();
      this.dataset = {}; this.style = {}; this.value = ''; this.hidden = false;
      this.children = []; this.listeners = new Map();
      this.classList = { add() {}, remove() {}, toggle() {} };
      for (const [, key, value] of attributes.matchAll(/([\w-]+)\s*=\s*['"]([^'"]*)['"]/g)) {
        if (key.startsWith('data-')) this.dataset[key.slice(5)] = value;
        else this[key] = value;
      }
    }
    set innerHTML(html) {
      this.html = html; this.children = [];
      for (const [, tagName, attributes] of html.matchAll(/<(button|input|select|form|div|span|p|strong|canvas)\b([^>]*)>/gi)) {
        const element = new Element(tagName, attributes);
        this.children.push(element);
        if (element.id) elements.set(element.id, element);
      }
    }
    get innerHTML() { return this.html || ''; }
    querySelectorAll(selector) {
      if (selector.startsWith('.')) return this.children.filter(el => (el.class || '').split(/\s+/).includes(selector.slice(1)));
      if (selector === '[data-control]') return this.children.filter(el => Object.hasOwn(el.dataset, 'control'));
      return [];
    }
    addEventListener(type, handler) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(handler);
    }
    dispatch(type, fields = {}) {
      const event = { target: this, preventDefault() {}, stopPropagation() {}, ...fields };
      this[`on${type}`]?.(event);
      for (const handler of this.listeners.get(type) || []) handler(event);
      return event;
    }
    getContext() { return ctx; }
    setAttribute(key, value) { this[key] = value; }
    focus() {}
    setPointerCapture() {}
    releasePointerCapture() {}
  }

  const body = new Element('body');
  body.innerHTML = HTML;
  const document = {
    body, hidden: false,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    createElement: name => new Element(name),
    querySelectorAll: selector => selector === '[data-control]'
      ? [...elements.values()].filter(el => Object.hasOwn(el.dataset, 'control')) : [],
    addEventListener: (type, handler) => addListener(`document:${type}`, handler),
  };
  function addListener(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  }
  let portrait = false,reducedMotion=false;
  const sandbox = {
    console, document,
    Image: class { constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; images.push(this); } },
    crypto: { randomUUID: () => 'new-player' },
    fetch:async()=>({ok:options.sponsorFetchOK!==false,json:async()=>options.sponsorConfig||{version:1,sponsors:[]}}),
    matchMedia: query => ({ matches:query.includes('prefers-reduced-motion')?reducedMotion:portrait }),
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => { writes.push(key); storage.set(key, String(value)); },
    },
    addEventListener: addListener,
    requestAnimationFrame: () => 1,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(CORE, sandbox, { filename: 'runner-core.js' });
  vm.runInContext(ART, sandbox, { filename: 'runner-art.js' });
  vm.runInContext(SPONSOR_CONFIG,sandbox,{filename:'sponsor-config.js'});
  const instrumented = SCRIPT.replace(/\}\)\(\);\s*$/, `
    globalThis.__runnerTest = {
      data, game, startRound, finishRound, setState, pause, resume, frame,
      getPlayer, inputSources, pressedEdges, getPlayerVisual, updateHUD,
      preparedAssets, drawRunner, drawCushion, sponsorsReady
    };
  })();`);
  assert.notEqual(instrumented, SCRIPT, 'test-only exposure must not change production files');
  vm.runInContext(instrumented, sandbox, { filename: 'runner.js' });
  const api = sandbox.__runnerTest;
  function dispatch(type, fields = {}) {
    const event = { key: '', code: '', repeat: false, target: body,
      preventDefault() {}, stopPropagation() {}, ...fields };
    for (const handler of listeners.get(type) || []) handler(event);
  }
  function start() {
    api.data.currentPlayerId = api.data.players[0].id;
    api.startRound();
    return api.game.run;
  }
  return { ...api, storage, writes, elements, dispatch, start, document, images, drawCalls, rotations, translations, outlines,paintOps,
    setPortrait: value => { portrait = value; },setReducedMotion:value=>{reducedMotion=value;},
    Core: sandbox.RunnerCore, Art: sandbox.RunnerArt };
}

test('legacy profiles import names and figures without importing scores, upgrades or changing the old save', () => {
  const app = harness();
  const oldSave = app.storage.get(OLD_KEY);
  assert.deepEqual(clone(app.data.players), [{ id: 'old-player', name: 'Maja', avatar: 'pige', bestTicks: 0, bestScore: 0, gamesPlayed: 0 }]);
  const run = app.start();
  assert.deepEqual(clone(run), clone(app.Core.createRun()), 'old purchases cannot alter runner physics or lives');
  app.frame(0); app.frame(100);
  app.finishRound();
  assert.equal(app.storage.get(OLD_KEY), oldSave, 'the original game save remains byte-for-byte intact');
  assert.ok(app.writes.every(key => key === NEW_KEY));
});

test('points including bonuses choose the best run, keep its duration and survive reload without duplicate finishes', () => {
  const app = harness();
  for (const result of [
    { scoreTicks: 1200, score: 100, bonusPoints: 0 },
    { scoreTicks: 600, score: 250, bonusPoints: 200 },
    { scoreTicks: 2400, score: 200, bonusPoints: 0 },
    { scoreTicks: 3000, score: 250, bonusPoints: 0 },
  ]) {
    app.start();
    Object.assign(app.game.run, result);
    app.finishRound();
    app.finishRound();
    assert.equal(app.game.lastResult.score, result.score);
    assert.equal(app.game.lastResult.bonusPoints, result.bonusPoints);
    assert.ok(app.elements.get('ui').innerHTML.includes('+' + result.bonusPoints + ' point'),
      'the result explains the bonus portion of this attempt');
  }
  app.data.players.push({ id: 'second-player', name: 'Emil', avatar: 'dreng', bestTicks: 0, bestScore: 0, gamesPlayed: 0 });
  app.data.currentPlayerId = 'second-player';
  app.startRound();
  Object.assign(app.game.run, { scoreTicks: 1500, score: 225, bonusPoints: 100 });
  app.finishRound();
  const reload = harness(app.storage);
  assert.equal(reload.data.players.length, 2);
  assert.equal(reload.data.players[0].bestScore, 250);
  assert.equal(reload.data.players[0].bestTicks, 600, 'the shorter bonus-winning run keeps its own duration');
  assert.equal(reload.data.players[0].gamesPlayed, 4);
  assert.equal(reload.data.players[1].bestScore, 225);
  assert.equal(reload.data.players[1].bestTicks, 1500);
  assert.equal(reload.data.players[1].gamesPlayed, 1);
  assert.equal(reload.data.currentPlayerId, 'second-player');
  reload.setState('HIGHSCORES');
  assert.equal((reload.elements.get('ui').innerHTML.match(/<li>/g) || []).length, 2,
    'the local leaderboard contains one best result per profile');
  assert.ok(reload.elements.get('ui').innerHTML.indexOf('Maja') < reload.elements.get('ui').innerHTML.indexOf('Emil'),
    'the leaderboard orders by points, not survival time');
});

test('a key or pointer tap between animation frames reaches the engine once and is then released', () => {
  for (const source of ['keyboard', 'pointer']) {
    const app = harness();
    app.start(); app.frame(0);
    if (source === 'keyboard') {
      app.dispatch('keydown', { key: ' ', code: 'Space' });
      app.dispatch('keyup', { key: ' ', code: 'Space' });
    } else {
      const button = app.elements.get('hopButton');
      button.dispatch('pointerdown', { pointerId: 7 });
      button.dispatch('pointerup', { pointerId: 7 });
    }
    assert.equal(app.game.input.jump, false, 'the finger or key was already released');
    app.frame(4);
    assert.equal(app.game.run.ticks, 0, 'input survives a frame too short for a simulation step');
    app.frame(1000 / 120);
    assert.equal(app.game.run.player.lastJump, true, `${source} tap reaches the next physics tick`);
    assert.equal(app.pressedEdges.jump, false, 'the queued edge is consumed');
    app.frame(2 * 1000 / 120);
    assert.equal(app.game.run.player.lastJump, false, `${source} tap does not become an endlessly held jump`);
  }
});

test('the same timed input gives the same physics and score at 30, 60, 120 and 144 animation frames per second', () => {
  const results = [30, 60, 120, 144].map(fps => {
    const app = harness();
    app.start(); app.frame(0);
    for (let i = 1; i <= fps * 3; i++) {
      app.frame(i * 1000 / fps);
      if (i === fps / 2) {
        app.dispatch('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        app.dispatch('keydown', { key: 'ArrowRight', code: 'ArrowRight' });
      }
      if (i === fps) {
        app.dispatch('keyup', { key: 'ArrowUp', code: 'ArrowUp' });
        app.dispatch('keyup', { key: 'ArrowRight', code: 'ArrowRight' });
      }
      if (i === fps * 2) {
        app.dispatch('keydown', { key: 'W', code: 'KeyW' });
        app.dispatch('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
      }
      if (i === fps * 2.5) {
        app.dispatch('keyup', { key: 'W', code: 'KeyW' });
        app.dispatch('keyup', { key: 'ArrowLeft', code: 'ArrowLeft' });
      }
    }
    assert.equal(app.game.run.ticks, 360, `${fps} fps completes exactly three simulation seconds`);
    assert.equal(app.game.run.scoreTicks, 360);
    return clone(app.game.run);
  });
  for (const run of results.slice(1)) assert.deepEqual(run, results[0]);
});

test('pause, resume and restart discard accumulated wall time instead of awarding free survival time', () => {
  const app = harness();
  app.start(); app.frame(0); app.frame(10);
  const score = app.game.run.scoreTicks;
  app.pause();
  app.frame(60000); app.frame(61000);
  assert.equal(app.game.run.scoreTicks, score);
  app.resume();
  app.frame(90000);
  assert.equal(app.game.run.scoreTicks, score, 'resume establishes a fresh time baseline');
  app.frame(90010);
  assert.equal(app.game.run.scoreTicks, score + 1);
  app.start();
  app.frame(120000);
  assert.equal(app.game.run.scoreTicks, 0, 'a new round cannot inherit the previous accumulator');
  app.frame(120010);
  assert.equal(app.game.run.scoreTicks, 1);
  app.frame(130000);
  assert.ok(app.game.paused, 'a long rendering interruption pauses the prototype');
  assert.equal(app.game.run.scoreTicks, 1, 'a frozen browser cannot add the whole missing interval');
});

test('losing focus clears keyboard, touch and queued presses and requires an explicit resume', () => {
  const app = harness();
  app.start(); app.frame(0);
  app.dispatch('keydown', { key: 'W', code: 'KeyW' });
  app.dispatch('keydown', { key: 'D', code: 'KeyD' });
  app.elements.get('hopButton').dispatch('pointerdown', { pointerId: 3 });
  app.elements.get('leftButton').dispatch('pointerdown', { pointerId: 4 });
  app.dispatch('blur');
  assert.ok(app.game.paused);
  assert.deepEqual(clone(app.game.input), { jump: false, left: false, right: false });
  assert.deepEqual(clone(app.pressedEdges), { jump: false });
  assert.ok(Object.values(app.inputSources).every(sources => sources.size === 0));
  for (const id of ['hopButton', 'leftButton', 'rightButton']) {
    assert.equal(app.elements.get(id).dataset.held, 'false');
  }
  app.frame(10000);
  assert.equal(app.game.run.scoreTicks, 0);
  app.resume(); app.frame(20000); app.frame(20020);
  const baseline = app.Core.createRun();
  app.Core.step(baseline, {}); app.Core.step(baseline, {});
  baseline.events = [];
  assert.deepEqual(clone(app.game.run), clone(baseline), 'resume matches two fresh no-input ticks, including automatic pad movement');
});

test('portrait starts paused and rotation to landscape still waits for an intentional resume', () => {
  const app = harness();
  app.setPortrait(true); app.start(); app.frame(0); app.frame(100);
  assert.ok(app.game.paused);
  assert.equal(app.game.run.scoreTicks, 0);
  assert.equal(app.elements.get('resumeButton').hidden, true);
  app.resume();
  assert.ok(app.game.paused, 'a portrait resume cannot bypass the rotation prompt');
  app.setPortrait(false); app.dispatch('resize');
  assert.ok(app.game.paused);
  assert.equal(app.elements.get('resumeButton').hidden, false);
  app.resume(); app.frame(1000); app.frame(1100);
  assert.equal(app.game.run.scoreTicks, 12);
});

test('text entry and keyboard repeat cannot accidentally trigger gameplay, and Shift release does not stick a key', () => {
  const app = harness();
  app.start(); app.frame(0);
  app.dispatch('keydown', { key: ' ', code: 'Space', target: { tagName: 'INPUT' } });
  app.dispatch('keydown', { key: 'ArrowUp', code: 'ArrowUp', repeat: true });
  app.dispatch('keydown', { key: 'ArrowLeft', code: 'ArrowLeft', target: { tagName: 'INPUT' } });
  app.dispatch('keydown', { key: 'D', code: 'KeyD', repeat: true });
  app.frame(20);
  assert.deepEqual(clone(app.game.input), { jump: false, left: false, right: false });
  assert.equal(app.game.run.player.lastJump, false);
  app.dispatch('keydown', { key: 'W', code: 'KeyW' });
  app.dispatch('keyup', { key: 'w', code: 'KeyW' });
  assert.equal(app.game.input.jump, false, 'the physical key identity survives a Shift change');
  assert.equal(app.pressedEdges.jump, true, 'the real press is retained for the next simulation step');
  app.frame(25);
  assert.equal(app.game.run.player.lastJump, true, 'the real initial press reaches physics once');
});

test('physics 4 preserves v1, v2 and v3 profiles and exact old saves with separate point records', () => {
  const previous = { players: [{ id: 'runner-player', name: 'Alma', avatar: 'pige',
    bestTicks: 3600, bestScore: 99999, gamesPlayed: 4 }], currentPlayerId: 'runner-player', sound: false };
  const raw = JSON.stringify(previous);
  for (const previousKey of ['aulumHopOgRul_v1', 'aulumHopOgRul_v2', 'aulumHopOgRul_v3']) {
    const app = harness(new Map([[previousKey, raw]]));
    assert.equal(app.data.players[0].name, 'Alma');
    assert.equal(app.data.players[0].avatar, 'pige');
    assert.equal(app.data.currentPlayerId, 'runner-player');
    assert.equal(app.data.sound, false);
    assert.equal(app.data.players[0].bestTicks, 0);
    assert.equal(app.data.players[0].bestScore, 0);
    assert.equal(app.data.players[0].gamesPlayed, 0);
    app.start(); Object.assign(app.game.run, { scoreTicks: 600, score: 150, bonusPoints: 100 }); app.finishRound();
    assert.equal(app.storage.get(previousKey), raw);
    assert.ok(app.writes.every(key => key === NEW_KEY));
    const reloaded = harness(app.storage).data.players[0];
    assert.equal(reloaded.bestTicks, 600);
    assert.equal(reloaded.bestScore, 150);
  }
  const older = JSON.stringify({ players: [{ id: 'older', name: 'Tidligere', avatar: 'dreng' }], currentPlayerId: 'older', sound: true });
  const allVersions = harness(new Map([
    ['aulumHopOgRul_v1', older], ['aulumHopOgRul_v2', older], ['aulumHopOgRul_v3', raw],
  ]));
  assert.equal(allVersions.data.currentPlayerId, 'runner-player', 'the newest prior version takes precedence');
  assert.equal(allVersions.data.players[0].name, 'Alma');
  assert.equal(allVersions.data.sound, false);
  allVersions.start();
  Object.assign(allVersions.game.run, { scoreTicks: 120, score: 10, bonusPoints: 0 });
  allVersions.finishRound();
  assert.equal(allVersions.storage.get('aulumHopOgRul_v3'), raw, 'v3 remains available unchanged for rollback');
});

test('rise and fall retain distinct fallback poses and protection blinks without hiding the player', () => {
  const app = harness(), run = app.start();
  run.player.motion = 'rise';
  assert.equal(app.getPlayerVisual(run).sprite, 'Jump');
  run.player.motion = 'fall';
  assert.equal(app.getPlayerVisual(run).sprite, 'Idle');
  run.player.invulnerable = 1;
  run.ticks = 0;
  const first = app.getPlayerVisual(run).alpha;
  run.ticks = 24;
  const second = app.getPlayerVisual(run).alpha;
  assert.notEqual(first, second);
  assert.ok(first > 0 && second > 0, 'the outline and sprite never disappear fully');
  run.player.motion = 'slide'; run.player.slopeAngle = Math.PI/4;
  assert.equal(app.getPlayerVisual(run).angle, Math.PI/4);
  run.player.invulnerable = 0;
  assert.equal(app.getPlayerVisual(run).alpha, 1);
});

test('the new renderer selects physical poses for both figures without changing v4 records or the run', () => {
  const saved = JSON.stringify({ players: [{ id: 'current', name: 'Alma', avatar: 'pige',
    bestTicks: 2460, bestScore: 405, gamesPlayed: 8 }], currentPlayerId: 'current', sound: false });
  const app = harness(new Map([[NEW_KEY, saved]])), run = app.start();
  run.platforms = [{ id: 'start', x: 0, w: 20000, y1: 510, y2: 510, type: 'pad' }];
  run.generatedTo = 20000; run.nextHazardTick = 100000;
  const observed = new Set();
  for (let tick = 0; tick < 160; tick++) {
    const before = clone(run), visual = app.getPlayerVisual(run);
    assert.equal(visual.poseName, app.Art.POSES[visual.poseIndex]);
    assert.equal(visual.poseIndex, app.Art.poseIndex(run.player));
    observed.add(visual.poseName);
    app.drawRunner(run);
    assert.deepEqual(clone(run), before, 'drawing never changes the core state');
    app.Core.step(run, {});
  }
  for (const name of ['neutral', 'land-1', 'land-2', 'takeoff-1', 'takeoff-2', 'rise-1', 'rise-2', 'fall-1', 'fall-2']) {
    assert.ok(observed.has(name), `${name} is reachable through real physics`);
  }
  assert.equal(app.data.players[0].bestTicks, 2460);
  assert.equal(app.data.players[0].bestScore, 405);
  assert.equal(app.data.players[0].gamesPlayed, 8);
  assert.equal(app.storage.get(NEW_KEY), saved);
});

function transparentTestAtlas() {
  const pixels = new Uint8ClampedArray(90 * 90 * 4);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    for (let y = row * 30 + 5; y < row * 30 + 25; y++) for (let x = col * 30 + 5; x < col * 30 + 17; x++) {
      pixels.set([255, 255, 255, 255], (y * 90 + x) * 4);
    }
  }
  return pixels;
}

test('both running sheets keep calibration scale and planted feet during real contact, with jump and damage poses taking priority', () => {
  for(const [avatar,key,file,anchors] of [
    ['dreng','boyRun','art/loeb-saet-v2/dreng-loeb.png',[[230,412],[222,411],[221,412],[224,408],[210,396],[221,411],[210,398],[216,398],[223,392]]],
    ['pige','girlRun','art/loeb-saet-v2/pige-loeb.png',[[221,403],[217,399],[216,402],[229,405],[214,403],[215,405],[219,395],[224,395],[223,394]]]
  ]){
    const pixels=new Uint8ClampedArray(1254*1254*4),rows=[0,418,836];
    for(let i=0;i<9;i++){
      const [ax,ay]=anchors[i],x0=i%3*418,y0=rows[Math.floor(i/3)];
      for(let y=y0+ay-100;y<y0+ay;y++)for(let x=x0+ax-20;x<x0+ax+20;x++)pixels.set([255,255,255,255],(y*1254+x)*4);
    }
    const app=harness(undefined,{imageData:pixels}),image=app.images.find(img=>img.src===file);
    assert.ok(image,'the running atlas is requested');
    Object.assign(image,{complete:true,naturalWidth:1254,naturalHeight:1254});image.onload();
    const sheet=app.preparedAssets[key];assert.equal(sheet.atlas.frames.length,9);
    assert.equal(sheet.atlas.scale,.7,'neutral calibration is 70 world units');
    const run=app.start();app.data.players[0].avatar=avatar;
    Object.assign(run.player,{x:220,y:515,vx:270,onGround:true,compressTicks:8,hurt:0,sliding:false,motion:'compress'});
    const before=clone(run),stored=app.storage.get(NEW_KEY),writes=app.writes.length;
    for(const x of [220,230,240]){
      run.player.x=x;app.drawCalls.length=0;app.drawRunner(run);
      const call=app.drawCalls.find(c=>c[0]===sheet.image);
      assert.ok(call,'the contact step uses the new artwork');
      assert.equal(call[7]/call[3],.7);assert.equal(call[8]/call[4],.7);
      assert.equal(call[6]+call[8],515,'the planted shoe meets the pad');
      assert.match(app.getPlayerVisual(run).poseName,/^run-/);
    }
    run.player.x=220;assert.deepEqual(clone(run),before);
    for(const changes of [{onGround:false,compressTicks:0},{compressTicks:2},{hurt:.3}]){
      const old=clone(run.player);Object.assign(run.player,changes);app.drawCalls.length=0;app.drawRunner(run);
      assert.ok(!app.drawCalls.some(c=>c[0]===sheet.image),'takeoff, flight and hurt never keep running');
      Object.assign(run.player,old);
    }
    assert.equal(app.storage.get(NEW_KEY),stored);assert.equal(app.writes.length,writes);
  }
});

test('the visible castle base rests on its grass pitch instead of floating inside transparent image margins', () => {
  const pixels=new Uint8ClampedArray(120*120*4);
  for(let y=20;y<90;y++)for(let x=10;x<110;x++)pixels.set([210,80,30,255],(y*120+x)*4);
  const app=harness(undefined,{imageData:pixels}),img=app.images.find(image=>image.src.endsWith('hoppeborg.png'));
  Object.assign(img,{complete:true,naturalWidth:120,naturalHeight:120});img.onload();
  const castle=app.preparedAssets.castle;
  assert.deepEqual([castle.x,castle.y,castle.w,castle.h],[10,20,100,70],
    'only visible pixels determine the castle base');
  app.start();app.drawCalls.length=0;app.frame(0);
  const call=app.drawCalls.find(c=>c[0]===castle.image);
  assert.ok(call);
  assert.equal(call[6]+call[8],545,'visible base meets the grass pitch');
  assert.ok(Math.abs(call[7]/call[3]-call[8]/call[4])<1e-12);
});

test('styled sausage and frisbee pictures keep their proportions, camera position and existing hazard boxes without changing a run', () => {
  const pixels=new Uint8ClampedArray(120*60*4);
  for(let y=18;y<42;y++)for(let x=20;x<100;x++)pixels.set([255,255,255,255],(y*120+x)*4);
  const app=harness(undefined,{imageData:pixels});
  const pictures=[
    {name:'sausage',file:'art/farer-saet/poelse.png',x:1275,y:440,w:61,h:29,box:[867,432,77,45],center:[905.5,454.5]},
    {name:'frisbee',file:'art/farer-saet/frisbee.png',x:1380,y:365,w:66,h:24,box:[980,365,66,24],center:[1013,377]}
  ];
  for(const picture of pictures){
    const image=app.images.find(img=>img.src===picture.file);
    assert.ok(image,`${picture.name} loads its new picture`);
    Object.assign(image,{complete:true,naturalWidth:120,naturalHeight:60});image.onload();
    const source=app.preparedAssets[picture.name];
    assert.deepEqual([source.x,source.y,source.w,source.h],[20,18,80,24],
      'transparent margins are cropped while opaque white picture details remain');
  }
  const run=app.start();run.cameraX=400;
  run.hazards=pictures.map(p=>({id:p.name,type:p.name,x:p.x,y:p.y,w:p.w,h:p.h,vx:-165}));
  const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.drawCalls.length=0;app.paintOps.length=0;app.frame(0);
  for(const picture of pictures){
    const call=app.drawCalls.find(c=>c[0]===app.preparedAssets[picture.name].image);
    assert.ok(call,`${picture.name} uses its picture on the playing field`);
    assert.ok(Math.abs(call[7]/call[3]-call[8]/call[4])<1e-12,'uniform scaling preserves the picture');
    const [left,top,width,height]=picture.box;
    assert.ok(call[5]>=left&&call[6]>=top&&call[5]+call[7]<=left+width&&call[6]+call[8]<=top+height,
      'the picture stays inside the existing visual envelope');
    assert.deepEqual([call[5]+call[7]/2,call[6]+call[8]/2],picture.center,
      'the visible picture stays centered on its camera-adjusted hazard');
  }
  assert.ok(app.paintOps.some(op=>op.kind==='text'&&op.text==='PØLSE!'));
  assert.ok(app.paintOps.some(op=>op.kind==='text'&&op.text==='FRISBEE!'));
  assert.deepEqual(clone(run),before);assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});

test('failed sausage and frisbee picture loads keep both hazards visible and the round playable', () => {
  const app=harness(),run=app.start();
  const failed=['art/farer-saet/poelse.png','art/farer-saet/frisbee.png'].map(file=>app.images.find(img=>img.src===file));
  for(const image of failed){
    Object.assign(image,{complete:true,naturalWidth:0,naturalHeight:0});image.onerror();
  }
  run.hazards=[
    {id:'sausage',type:'sausage',x:900,y:440,w:61,h:29,vx:-190},
    {id:'frisbee',type:'frisbee',x:1000,y:365,w:66,h:24,vx:-165}
  ];
  const saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.paintOps.length=0;app.drawCalls.length=0;assert.doesNotThrow(()=>app.frame(0));
  assert.match(app.elements.get('assetStatus').textContent,/reservegrafik/);
  assert.ok(app.paintOps.some(op=>op.kind==='fill'&&op.color==='#b96636'),'sausage fallback remains visible');
  assert.ok(app.paintOps.some(op=>op.kind==='fill'&&op.color==='#f5f4e1'),'frisbee fallback remains visible');
  assert.ok(!app.drawCalls.some(call=>failed.includes(call[0])),'failed pictures are never drawn');
  app.Core.step(run,{});assert.equal(run.status,'running');
  assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});

test('foreground trees hide the player while opaque sponsor banners and flying hazards remain in front', async () => {
  const app=harness(undefined,{sponsorConfig:{version:1,sponsors:[{id:'test',name:'Prøvesponsor',image:'art/sponsorer/proeve.png'}]}});
  await app.sponsorsReady;
  const logo=app.images.find(img=>img.src==='art/sponsorer/proeve.png');
  assert.ok(logo,'the shared sponsor file is loaded');
  Object.assign(logo,{complete:true,naturalWidth:400,naturalHeight:100});
  const frame={x:0,y:0,w:80,h:100,anchorX:40,anchorY:100},tree={id:'tree'},player={id:'player'},sausage={id:'sausage'};
  app.preparedAssets.trees={image:tree,atlas:{frames:[frame,frame,frame]}};
  app.preparedAssets.girlAtlas={image:player,atlas:{scale:1,frames:[{x:0,y:0,w:44,h:70,anchorX:22,anchorY:70}]}};
  app.preparedAssets.sausage={image:sausage,x:0,y:0,w:60,h:22};
  Object.assign(app.images.find(img=>img.src==='art/farer-saet/poelse.png'),{complete:true,naturalWidth:60,naturalHeight:22});
  const run=app.start();run.cameraX=3100;
  run.platforms=[{id:'low',type:'pad',x:3200,w:1000,y1:515,y2:515}];
  Object.assign(run.player,{x:3550,y:515,h:70,onGround:true,sliding:false,motion:'run',groundPlatformId:'low'});
  run.hazards=[{id:'visible-danger',type:'sausage',x:3550,y:450,w:60,h:22}];
  const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.drawCalls.length=0;app.paintOps.length=0;app.frame(0);
  const playerIndex=app.drawCalls.findIndex(c=>c[0]===player);
  const foregroundIndex=app.drawCalls.findLastIndex(c=>c[0]===tree);
  assert.ok(foregroundIndex>playerIndex,'tree is painted after the player');
  assert.equal(app.drawCalls[foregroundIndex][8],434);
  assert.ok(app.drawCalls.findIndex(c=>c[0]===sausage)>foregroundIndex,'danger stays visible');
  const logoCall=app.drawCalls.find(c=>c[0]===logo);
  assert.ok(app.drawCalls.findIndex(c=>c===logoCall)>foregroundIndex,'tree never covers sponsor');
  assert.ok(Math.abs(logoCall[7]/logoCall[3]-logoCall[8]/logoCall[4])<1e-12);
  const treePaint=app.paintOps.findLastIndex(op=>op.kind==='image'&&op.args[0]===tree);
  const logoPaint=app.paintOps.findIndex(op=>op.kind==='image'&&op.args[0]===logo);
  assert.ok(app.paintOps.slice(treePaint+1,logoPaint).some(op=>op.kind==='fill'&&op.color==='#fffbed'&&op.alpha===1),
    'an opaque card also covers trees under transparent parts of the logo');
  assert.deepEqual(clone(run),before);assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});

test('unavailable sponsor pictures leave image placeholders and never substitute sponsor names', async () => {
  const named=harness(undefined,{sponsorConfig:{version:1,sponsors:[{id:'test',name:'Prøvesponsor',image:'art/sponsorer/mangler.png'}]}});
  await named.sponsorsReady;named.start();named.paintOps.length=0;named.frame(0);
  assert.ok(!named.paintOps.some(op=>op.kind==='text'&&op.text==='Prøvesponsor'),'a name never replaces the picture');
  assert.ok(named.paintOps.some(op=>op.kind==='fill'&&op.color==='#fffbed'),'empty picture card stays visible');
  for(const options of [{sponsorFetchOK:false},{sponsorConfig:{version:2,sponsors:[]}}]){
    const app=harness(undefined,options);await app.sponsorsReady;const run=app.start();
    app.paintOps.length=0;assert.doesNotThrow(()=>app.frame(0));
    assert.match(app.elements.get('assetStatus').textContent,/reservegrafik/);
    assert.ok(!app.paintOps.some(op=>op.kind==='fill'&&op.color==='#fffbed'),'no empty advertising slots when no pictures are configured');
    app.Core.step(run,{});assert.equal(run.status,'running');
  }
});

test('internal sponsor labels are not printed on picture banners', async () => {
  const app=harness(undefined,{sponsorConfig:{version:1,sponsors:[{id:'wide',name:'W'.repeat(60),image:'art/sponsorer/banner.png'}]}});
  await app.sponsorsReady;app.start();app.paintOps.length=0;app.frame(0);
  const lines=app.paintOps.filter(op=>op.kind==='text'&&op.text.startsWith('WW'));
  assert.equal(lines.length,0);
});

test('damage feedback stays above foreground trees even when the body is hidden', () => {
  const app=harness(),run=app.start(),tree={id:'tree-feedback'};
  app.preparedAssets.trees={image:tree,atlas:{frames:Array(3).fill({x:0,y:0,w:80,h:100})}};
  run.platforms=[{id:'low',type:'pad',x:3200,w:1000,y1:515,y2:515}];run.cameraX=3100;
  Object.assign(run.player,{x:3550,y:515,h:70,onGround:false,hurt:.5,motion:'hurt'});
  app.paintOps.length=0;app.frame(0);
  const lastTree=app.paintOps.findLastIndex(op=>op.kind==='image'&&op.args[0]===tree);
  const av=app.paintOps.findIndex(op=>op.kind==='text'&&op.text==='AV!');
  assert.ok(lastTree>=0&&av>lastTree,'AV! is painted after the occluding canopy');
});

test('new background sprites keep their proportions behind the course and leave physics and records alone', () => {
  const app=harness(),run=app.start();
  const frame={x:20,y:10,w:100,h:150,anchorX:70,anchorY:160};
  const sprites=['trees','clouds','sun','flags'];
  for(const name of sprites)app.preparedAssets[name]={image:{id:name},atlas:{frames:Array(4).fill(frame)}};
  const cushion={id:'course'};
  app.preparedAssets.cushion={image:cushion,x:180,y:190,w:1810,h:339};
  run.cameraX=350;run.ticks=240;
  const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.drawCalls.length=0;app.frame(0);
  const background=app.drawCalls.filter(call=>sprites.includes(call[0].id));
  for(const name of sprites)assert.ok(background.some(call=>call[0].id===name),name+' is drawn');
  for(const [,sx,sy,sw,sh,dx,dy,dw,dh] of background){
    assert.ok(Math.abs(dw/sw-dh/sh)<1e-12,'source proportions survive display');
    assert.deepEqual([sx,sy,sw,sh],[20,10,100,150]);
  }
  const firstCourse=app.drawCalls.findIndex(call=>call[0]===cushion);
  assert.ok(firstCourse>0);
  assert.ok(app.drawCalls.every((call,index)=>!sprites.includes(call[0].id)||index<firstCourse));
  assert.deepEqual(clone(run),before);
  assert.equal(app.storage.get(NEW_KEY),saved);
  assert.equal(app.writes.length,writes);
});

test('the cord follows world camera movement behind a player who jumps above it without changing the run or records', () => {
  const app=harness(),run=app.start();
  const frame={x:0,y:0,w:34,h:46,anchorX:17,anchorY:46},flags={id:'world-flags'},player={id:'high-player'};
  app.preparedAssets.flags={image:flags,atlas:{frames:Array(4).fill(frame)}};
  app.preparedAssets.girlAtlas={image:player,atlas:{scale:1,frames:Array(9).fill({x:0,y:0,w:44,h:70,anchorX:22,anchorY:70})}};
  Object.assign(run.player,{x:600,y:150,onGround:false,sliding:false,motion:'rise',vy:-350});
  const saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  function render(cameraX,cameraY){
    Object.assign(run,{cameraX,cameraY});const before=clone(run);app.paintOps.length=0;app.frame(0);
    const cord=app.paintOps.find(op=>op.kind==='image'&&op.args[0]===flags&&Math.abs(op.transform[4]-(600-cameraX))<1e-9);
    assert.ok(cord,'the same flag remains at its camera-adjusted world anchor');
    assert.equal(cord.transform[5],205-cameraY);
    const figure=app.paintOps.find(op=>op.kind==='image'&&op.args[0]===player);
    assert.ok(figure);
    assert.ok(app.paintOps.indexOf(cord)<app.paintOps.indexOf(figure),'the player passes in front of the cord');
    assert.ok(figure.args[6]+figure.args[8]+figure.transform[5]<cord.transform[5],'the whole player can be above the cord');
    assert.deepEqual(clone(run),before);assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
  }
  render(0,0);render(35,0);render(35,-180);
});

test('wind follows playing time, freezes in pause and stays still with reduced motion', () => {
  const app=harness();app.start();
  const angles=timestamp=>{app.rotations.length=0;app.frame(timestamp);return [...app.rotations];};
  const first=angles(0),moving=angles(100);
  assert.equal(first.length,21);
  assert.ok(first.some((a,i)=>Math.abs(a-moving[i])>1e-4));
  app.pause('manual');
  assert.deepEqual(angles(200),moving);
  assert.deepEqual(angles(3000),moving);
  app.setReducedMotion(true);
  const reduced=angles(3100);
  assert.deepEqual(reduced,Array.from(app.Art.flagLayout(0,true),flag=>flag.angle));
  assert.deepEqual(angles(8000),reduced);
});

test('the scenery loader separates the requested tree, cloud, sun and flag sheets into usable transparent frames', () => {
  for(const [name,file,columns,rows] of [['trees','traeer.png',3,1],['clouds','skyer.png',3,1],['sun','sol.png',1,1],['flags','flag.png',2,2]]){
    const pixels=new Uint8ClampedArray(120*120*4);
    // Wide oak/cloud1 crosses a nominal third; frame cuts must use asset margins.
    const boxes=name==='trees'?[[5,10,41,60],[52,10,28,60],[90,10,25,60]]:
      name==='clouds'?[[5,10,37,35],[47,10,33,35],[90,10,25,35]]:
      name==='sun'?[[10,10,60,60]]:[[10,10,30,40],[70,10,30,40],[10,70,30,40],[70,70,30,40]];
    for(const [left,top,w,h] of boxes){
      for(let y=top;y<top+h;y++)for(let x=left;x<left+w;x++)pixels.set([230,200,80,255],(y*120+x)*4);
    }
    const app=harness(undefined,{imageData:pixels}),img=app.images.find(image=>image.src.endsWith(file));
    assert.ok(img,file+' is requested');
    Object.assign(img,{complete:true,naturalWidth:120,naturalHeight:120});img.onload();
    assert.equal(app.preparedAssets[name].atlas.frames.length,columns*rows);
    assert.deepEqual(clone(app.preparedAssets[name].atlas.frames.map(f=>[f.x,f.y,f.w,f.h])),boxes);
    app.start();app.drawCalls.length=0;app.frame(0);
    const cache=app.preparedAssets[name].image;
    const calls=app.drawCalls.filter(c=>c[0]===cache);
    assert.ok(calls.length>0);
    assert.ok(calls.every(c=>c[3]<120),'a sprite frame is drawn, not the entire opaque sheet');
  }
});

test('invalid opaque scenery shows a status message and uses fallback shapes without breaking play', () => {
  const app=harness(undefined,{imageData:new Uint8ClampedArray(120*120*4).fill(255)});
  for(const [name,file] of [['trees','traeer.png'],['clouds','skyer.png'],['sun','sol.png'],['flags','flag.png']]){
    const img=app.images.find(image=>image.src.endsWith(file));
    Object.assign(img,{complete:true,naturalWidth:120,naturalHeight:120});img.onload();
    assert.equal(app.preparedAssets[name],undefined);
    assert.match(app.elements.get('assetStatus').textContent,/reservegrafik/);
    app.drawCalls.length=0;
    assert.doesNotThrow(()=>app.frame(0));
    assert.ok(!app.drawCalls.some(call=>call[0]===img),'opaque image is never drawn over the scene');
  }
  const run=app.start();app.Core.step(run,{});assert.equal(run.status,'running');
});

test('both figures sit at the physical slide contact with their standing scale through entry, glide and exit', () => {
  const app=harness(),run=app.start();
  // A known four-frame sheet: standing height40px, seated height28px.
  const pixels=new Uint8ClampedArray(120*120*4);
  for(let i=0;i<4;i++){
    const x=(i%2)*60+10,y=Math.floor(i/2)*60+5;
    for(let yy=y;yy<y+(i?28:40);yy++)for(let xx=x;xx<x+(i?40:18);xx++)pixels.set([220,45,30,255],(yy*120+xx)*4);
  }
  const atlas=app.Art.atlasFromPixels(pixels,120,120,{columns:2,rows:2,anchors:[null,{x:20,y:33},{x:20,y:33},{x:20,y:33}]});
  const platform={id:'seated-test',type:'slide',x:1000,w:240,y1:285,y2:510};
  run.platforms=[platform];run.cameraX=900;
  for(const avatar of ['dreng','pige']){
    app.getPlayer().avatar=avatar;
    const image={id:avatar+'-seated'};
    app.preparedAssets[avatar==='pige'?'girlSlide':'boySlide']={image,atlas};
    for(const [progress,index,name] of [[.05,1,'slide-entry'],[.5,2,'slide'],[.95,3,'slide-exit']]){
      Object.assign(run.player,{x:platform.x+platform.w*progress,y:285+225*progress,h:42,
        onGround:true,sliding:true,motion:'slide',groundPlatformId:platform.id,slopeAngle:Math.atan2(225,240)});
      const before=clone(run),stored=app.storage.get(NEW_KEY);
      app.drawCalls.length=0;app.rotations.length=0;app.translations.length=0;
      app.drawRunner(run);
      const call=app.drawCalls.find(c=>c[0]===image);
      assert.ok(call,'the seated character image is used');
      assert.equal(app.getPlayerVisual(run).poseName,name);
      assert.equal(call[7],70,'the 40px seated width keeps the standing calibration scale');
      assert.equal(call[8],49);
      assert.equal(call[5],-17.5);
      assert.equal(call[6],-49);
      assert.ok(app.rotations.some(angle=>Math.abs(angle-Math.atan2(225,240))<1e-12));
      assert.deepEqual(app.translations.at(-1),[run.player.x-run.cameraX,run.player.y]);
      assert.equal(call[1],atlas.frames[index].x);assert.equal(call[2],atlas.frames[index].y);
      assert.deepEqual(clone(run),before);
      assert.equal(app.storage.get(NEW_KEY),stored);
    }
  }
});

test('protection surrounds the full seated artwork and keeps blinking with the same seat contact', () => {
  const app=harness(),run=app.start();
  const image={id:'protected-seated'},frame={x:0,y:0,w:60,h:55,anchorX:10,anchorY:50};
  app.preparedAssets.girlSlide={image,atlas:{scale:1,frames:[frame,frame,frame,frame]}};
  Object.assign(run.player,{h:42,sliding:true,motion:'slide',invulnerable:1,slopeAngle:Math.PI/4});
  app.drawRunner(run);
  assert.deepEqual(app.outlines.at(-1),[-16,-56,72,67,12],
    'marker follows the 60x55 artwork plus padding, independent of collision size42');
  run.ticks=24;
  assert.equal(app.getPlayerVisual(run).alpha,.28);
  const before=clone(run);app.drawRunner(run);assert.deepEqual(clone(run),before);
});

test('real slide physics reaches all three seated poses and returns to the jump series on departure or damage', () => {
  const app=harness(),run=app.start();
  run.platforms=[{id:'slide-route',type:'slide',x:1000,w:240,y1:285,y2:510},
    {id:'exit',type:'pad',x:1240,w:3000,y1:510,y2:510}];
  run.generatedTo=5000;run.nextHazardTick=100000;run.cameraX=800;
  Object.assign(run.player,{x:1001,y:285.9375,h:42,onGround:true,sliding:true,motion:'slide',
    groundPlatformId:'slide-route',slopeAngle:Math.atan2(225,240)});
  const seen=new Set();
  for(let tick=0;tick<180;tick++){
    seen.add(app.getPlayerVisual(run).poseName);
    app.Core.step(run,{});
  }
  for(const pose of ['slide-entry','slide','slide-exit','land-1','rise-1','fall-1'])assert.ok(seen.has(pose),pose);
  Object.assign(run.player,{sliding:true,onGround:true,motion:'slide',h:42,groundPlatformId:'slide-route'});
  app.Core.hit(run,'sausage');
  assert.equal(app.getPlayerVisual(run).lowPose,false);
  assert.equal(app.getPlayerVisual(run).poseName,'fall-1');
});

test('both loaded atlases draw only the current pose with feet anchored and grid offsets preserved', () => {
  const app = harness(undefined, { imageData: transparentTestAtlas() }), run = app.start();
  for (const [avatar, name, filename] of [['dreng', 'boyAtlas', 'dreng-hop.png'], ['pige', 'girlAtlas', 'pige-hop.png']]) {
    const img = app.images.find(image => image.src.endsWith(filename));
    assert.ok(img, `the ${avatar} atlas is requested`);
    Object.assign(img, { complete: true, naturalWidth: 90, naturalHeight: 90 });
    img.onload();
    assert.equal(app.preparedAssets[name].atlas.frames.length, 9);
    app.getPlayer().avatar = avatar;
    Object.assign(run.player, { onGround: false, compressTicks: 0, sliding: false, hurt: 0, motion: 'fall', vy: 450 });
    app.drawCalls.length = 0;
    app.drawRunner(run);
    const cache = app.preparedAssets[name].image;
    assert.notEqual(cache, img, 'master image remains intact while its canvas cache is drawn');
    const calls = app.drawCalls.filter(call => call[0] === cache);
    assert.equal(calls.length, 1, 'the entire atlas is never drawn as a sprite');
    const call = calls[0], pose = app.getPlayerVisual(run).poseIndex;
    const place = app.Art.framePlacement(app.preparedAssets[name].atlas, pose, run.player.x - run.cameraX, run.player.y);
    assert.deepEqual(call.slice(1), [place.sx, place.sy, place.sw, place.sh, place.dx, place.dy, place.dw, place.dh]);
    assert.ok(place.sy >= 60, 'fall-2 retains its source position in the third grid row');
    assert.equal(place.dy + place.dh, run.player.y);
    assert.ok(place.dw > 0 && place.dh > 0, 'steering does not flip the right-facing artwork');
  }
});

test('an invalid loaded atlas shows fallback artwork and a status message without breaking play', () => {
  const app = harness(undefined, { imageData: new Uint8ClampedArray(90 * 90 * 4).fill(255) });
  const run = app.start(), img = app.images.find(image => image.src.endsWith('pige-hop.png'));
  Object.assign(img, { complete: true, naturalWidth: 90, naturalHeight: 90 });
  img.onload();
  assert.equal(app.preparedAssets.girlAtlas, undefined);
  assert.match(app.elements.get('assetStatus').textContent, /reservegrafik/);
  app.drawCalls.length = 0;
  assert.doesNotThrow(() => app.drawRunner(run));
  assert.equal(app.drawCalls.some(call => call[0] === img), false, 'opaque atlas never becomes a background rectangle');
  app.Core.step(run, {});
  assert.equal(run.status, 'running');
});

test('cushion caps and repeated panels preserve aspect ratio on wide, tall and compressed platforms', () => {
  const app = harness(), image = { id: 'cushion-render-fixture' };
  app.preparedAssets.cushion = { image, x: 180, y: 190, w: 1810, h: 339 };
  for (const [width, surface, compression] of [[1000, 510, 0], [360, 290, 0], [180, 450, 11]]) {
    app.drawCalls.length = 0;
    assert.equal(app.drawCushion({ w: width, y1: surface }, 20, surface + compression), true);
    assert.ok(app.drawCalls.length >= 3);
    for (const [source, sx, sy, sw, sh, dx, dy, dw, dh] of app.drawCalls) {
      assert.equal(source, image);
      assert.ok(sw > 0 && sh > 0 && dw > 0 && dh > 0);
      assert.ok(Math.abs(dw / sw - dh / sh) < 1e-12, 'one scale applies horizontally and vertically');
      assert.ok(dy >= surface + compression && dy + dh <= 590 + 1e-10);
      assert.ok(dx >= 20 - 1e-10 && dx + dw <= 20 + width + 1e-10);
      assert.ok(sx >= 180 && sx + sw <= 1990);
      assert.equal(sy, 190);
      assert.equal(sh, 339);
    }
    assert.equal(Math.min(...app.drawCalls.map(call => call[6])), surface + compression,
      'the upper edge follows the same compressed surface as the feet');
  }
});

test('slide artwork follows every generated slope with a level local contact edge and uniformly scaled panels', () => {
  for(const [width,top,bottom] of [[185,355,515],[235,300,515],[240,285,510]]){
    const app=harness(),run=app.start(),image={id:'slide-texture'};
    app.preparedAssets.slide={image,x:250,y:222,w:1650,h:302};
    run.platforms=[{id:'slide-test',type:'slide',x:100,w:width,y1:top,y2:bottom}];
    const before=clone(run);
    app.frame(0);
    const calls=app.drawCalls.filter(call=>call[0]===image);
    assert.ok(calls.length>=3,'slide caps and repeatable middle are rendered');
    assert.ok(app.rotations.some(a=>Math.abs(a-Math.atan2(bottom-top,width))<1e-12));
    for(const [,sx,sy,sw,sh,dx,dy,dw,dh] of calls){
      assert.equal(sy,222);assert.equal(sh,302);
      assert.equal(dy,0,'top contact is local y=0 before rotation');
      assert.ok(Math.abs(dw/sw-dh/sh)<1e-12);
      assert.ok(sx>=250&&sx+sw<=1900);
      assert.ok(dx>=0&&dx+dw<=Math.hypot(width,bottom-top)+1e-9);
    }
    assert.deepEqual(clone(run),before);
  }
});

test('a hurt player on a slide keeps the low visual pose used by the collision body', () => {
  const app = harness(), run = app.start();
  Object.assign(run.player, { motion: 'hurt', sliding: true, slopeAngle: Math.PI/4, h: 42 });
  const visual=app.getPlayerVisual(run);
  assert.equal(visual.lowPose,true);
  assert.equal(visual.angle,Math.PI/4);
});

test('steering combines physical keys and touch sources, and Shift release cannot leave a direction held', () => {
  const app = harness(), run = app.start();
  app.frame(0);
  app.dispatch('keydown', { key: 'A', code: 'KeyA' });
  app.dispatch('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
  app.dispatch('keyup', { key: 'a', code: 'KeyA' });
  assert.equal(app.game.input.left, true, 'the second left key is still held');
  app.dispatch('keyup', { key: 'ArrowLeft', code: 'ArrowLeft' });
  assert.equal(app.game.input.left, false);
  app.dispatch('keydown', { key: 'D', code: 'KeyD' });
  app.elements.get('rightButton').dispatch('pointerdown', { pointerId: 20 });
  app.dispatch('keyup', { key: 'd', code: 'KeyD' });
  assert.equal(app.game.input.right, true, 'releasing the key preserves a concurrent touch');
  for (let tick = 1; tick <= 24; tick++) app.frame(tick * 1000 / 120);
  const neutral = app.Core.createRun();
  for (let tick = 1; tick <= 24; tick++) app.Core.step(neutral, {});
  assert.ok(run.player.x - run.cameraX > neutral.player.x - neutral.cameraX,
    'steering reaches the engine and changes horizontal position relative to the camera');
  app.elements.get('rightButton').dispatch('pointerup', { pointerId: 20 });
  assert.equal(app.game.input.right, false);
  assert.deepEqual(Object.keys(app.pressedEdges), ['jump'], 'only jumping has a latched press edge');
});

test('only three controls remain and Down or S cannot duck or cancel automatic pad bouncing', () => {
  const app = harness(), baseline = harness();
  app.start(); baseline.start(); app.frame(0); baseline.frame(0);
  assert.deepEqual(app.document.querySelectorAll('[data-control]').map(button => button.dataset.control).sort(),
    ['jump', 'left', 'right']);
  assert.equal(app.elements.has('rollButton'), false, 'the removed control is absent from the actual page');
  assert.deepEqual(Object.keys(app.inputSources).sort(), ['jump', 'left', 'right']);
  const formerKeys = [
    { key: 'ArrowDown', code: 'ArrowDown' }, { key: 's', code: 'KeyS' }, { key: 'S', code: 'KeyS' },
  ];
  for (let tick = 1; tick <= 240; tick++) {
    if (tick % 20 === 1) for (const key of formerKeys) app.dispatch('keydown', key);
    if (tick % 20 === 10) for (const key of formerKeys) app.dispatch('keyup', key);
    app.frame(tick * 1000 / 120); baseline.frame(tick * 1000 / 120);
    assert.deepEqual(clone(app.game.run), clone(baseline.game.run),
      `removed keys have no effect during pad compression, launch or flight at tick ${tick}`);
  }
  assert.deepEqual(clone(app.game.input), { jump: false, left: false, right: false });
  assert.deepEqual(clone(app.pressedEdges), { jump: false });
});

test('two-finger steering and jumping survive independent pointer cancellation without stuck controls', () => {
  const app = harness();
  app.start(); app.frame(0);
  const right = app.elements.get('rightButton'), jump = app.elements.get('hopButton');
  right.dispatch('pointerdown', { pointerId: 8 });
  jump.dispatch('pointerdown', { pointerId: 9 });
  app.frame(1000 / 120);
  assert.equal(app.game.input.right, true);
  assert.equal(app.game.run.player.lastJump, true);
  jump.dispatch('pointercancel', { pointerId: 9 });
  assert.equal(app.game.input.jump, false);
  assert.equal(app.game.input.right, true, 'cancelled jumping does not release the other finger');
  app.frame(2 * 1000 / 120);
  assert.equal(app.game.run.player.lastJump, false);
  right.dispatch('lostpointercapture', { pointerId: 8 });
  assert.equal(app.game.input.right, false);
  assert.equal(right.dataset.held, 'false');
  assert.ok(Object.values(app.inputSources).every(sources => sources.size === 0));
});

test('a newly entered nickname is saved as text and escaped in instructions, profile selection and records', () => {
  const app = harness(new Map());
  app.setState('PLAYER_SELECT');
  app.elements.get('newName').value = '  <svg/onload=1>  ';
  app.elements.get('avatar').value = 'pige';
  app.elements.get('playerForm').dispatch('submit');
  assert.equal(app.data.players[0].name, '<svg/onload=1>');
  assert.equal(app.data.players[0].avatar, 'pige');
  assert.ok(app.elements.get('ui').innerHTML.includes('&lt;SVG/ONLOAD=1&gt;'));
  app.start(); Object.assign(app.game.run, { scoreTicks: 120, score: 110, bonusPoints: 100 }); app.finishRound();
  for (const state of ['PLAYER_SELECT', 'HIGHSCORES']) {
    app.setState(state);
    assert.ok(app.elements.get('ui').innerHTML.includes('&lt;svg/onload=1&gt;'));
    assert.ok(!app.elements.get('ui').innerHTML.includes('<svg/'));
  }
  assert.equal(harness(app.storage).data.players[0].name, '<svg/onload=1>');
});

test('the HUD shows engine points, streak, charge and timing readiness and clears them after damage', () => {
  const app = harness(), run = app.start();
  Object.assign(run, { scoreTicks: 360, score: 130, bonusPoints: 100 });
  Object.assign(run.player, { combo: 5, jumpCharge: 3, timingReady: true });
  app.updateHUD();
  assert.equal(app.elements.get('runScore').textContent, '130');
  assert.equal(app.elements.get('runTime').textContent, '3,0 sek.');
  assert.equal(app.elements.get('runCombo').textContent, 5);
  assert.equal(app.elements.get('comboProgress').style.width, '100%');
  assert.equal(app.elements.get('runCharge').textContent, '3 / 5');
  assert.equal(app.elements.get('chargeProgress').style.width, '60%');
  assert.equal(app.elements.get('hopButton').dataset.ready, 'true');
  assert.equal(app.elements.get('hopHint').textContent, 'HOP NU!');
  app.Core.hit(run, 'frisbee');
  app.updateHUD();
  assert.equal(app.elements.get('runCombo').textContent, 0);
  assert.equal(app.elements.get('chargeProgress').style.width, '0%');
  assert.equal(app.elements.get('hopButton').dataset.ready, 'false');
  assert.equal(app.elements.get('runLives')['aria-label'], '2 liv');
  assert.equal(app.elements.get('runScore').textContent, '130', 'earned points remain after damage');
});

test('a ground stretch has a grassy contact edge and earth below it while nearby pads keep their own artwork', () => {
  const app=harness(),run=app.start(),cushion={id:'ground-neighbour-pad'};
  app.preparedAssets.cushion={image:cushion,x:180,y:190,w:1810,h:339};
  run.platforms=[{id:'grass-run',type:'ground',x:0,w:2000,y1:550,y2:550},
    {id:'up-pad',type:'pad',x:2000,w:1000,y1:435,y2:435}];
  run.cameraX=1400;
  Object.assign(run.player,{x:1700,y:550,onGround:true,compressTicks:0,hurt:0,sliding:false,motion:'run',groundPlatformId:'grass-run',combo:4,jumpCharge:3});
  const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.paintOps.length=0;app.drawCalls.length=0;app.frame(0);
  const earth=app.paintOps.find(op=>op.kind==='rect'&&op.color==='#98734f');
  const grass=app.paintOps.find(op=>op.kind==='rect'&&op.color==='#8fc85a');
  assert.ok(earth&&grass,'ground has recognisable earth and grass rather than an inflatable face');
  assert.deepEqual(earth.args,[-1400,550,2000,125]);
  assert.deepEqual(grass.args,[-1400,550,2000,10],'the grassy upper edge meets the physical surface');
  const padCalls=app.drawCalls.filter(call=>call[0]===cushion);
  assert.ok(padCalls.length>0,'the next cushion retains its artwork');
  assert.ok(padCalls.every(call=>call[5]>=600),'no cushion texture is painted across the ground section');
  assert.ok(!app.paintOps.some(op=>op.kind==='text'&&op.text==='HOPPEPUDE'));
  assert.deepEqual(clone(run),before);assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});

test('ground instructions and hop cues distinguish jumping onto a cushion from perfect landing timing without clearing the streak', () => {
  const app=harness(),run=app.start();
  app.setState('INSTRUCTIONS');
  assert.match(app.elements.get('ui').innerHTML,/På jorden løber du/);
  assert.match(app.elements.get('ui').innerHTML,/perfekte serie og hoppekraft bevares/);
  app.setState('PLAYING');
  run.platforms=[{id:'ground-cue',type:'ground',x:0,w:1000,y1:550,y2:550},
    {id:'pad-cue',type:'pad',x:1000,w:1000,y1:435,y2:435}];
  Object.assign(run.player,{x:700,y:550,w:44,vx:270,onGround:true,compressTicks:0,hurt:0,sliding:false,motion:'run',groundPlatformId:'ground-cue',combo:5,jumpCharge:4,timingReady:false});
  const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.updateHUD();
  assert.equal(app.elements.get('hopHint').textContent,'Hop op på puden');
  assert.equal(app.elements.get('hopButton').dataset.ready,'false','a distant pad does not ask for an early jump');
  for(const [vx,x] of [[270,875],[40,963]]){
    Object.assign(run.player,{vx,x});app.updateHUD();
    assert.equal(app.elements.get('hopHint').textContent,'HOP OP NU!');
    assert.equal(app.elements.get('hopButton').dataset.ready,'true','the cue includes the player front at slow and normal speed');
  }
  app.paintOps.length=0;app.frame(0);
  assert.ok(app.paintOps.some(op=>op.kind==='text'&&op.text==='HOP op på næste pude!'));
  assert.equal(app.elements.get('runCombo').textContent,5);
  assert.equal(app.elements.get('runCharge').textContent,'4 / 5');
  Object.assign(run.player,{x:700,vx:270});assert.deepEqual(clone(run),before);
  Object.assign(run.player,{groundPlatformId:'pad-cue',timingReady:true});app.updateHUD();
  assert.equal(app.elements.get('hopHint').textContent,'HOP NU!','pad timing keeps its existing meaning');
  assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});

test('wooden supports meet every cord peak, follow the world camera and stay behind cushion fronts', () => {
  const app=harness(),run=app.start(),cushion={id:'in-front-of-poles'};
  app.preparedAssets.cushion={image:cushion,x:180,y:190,w:1810,h:339};
  run.platforms=[{id:'support-pad',type:'pad',x:1000,w:1000,y1:435,y2:435}];
  Object.assign(run,{cameraX:220,cameraY:-80});
  const before=clone(run),stored=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.paintOps.length=0;app.frame(0);
  const pole=app.paintOps.find(op=>op.kind==='rounded'&&op.args[0]===968&&op.args[1]===156&&op.args[2]===24&&op.args[3]===434);
  assert.ok(pole,'the support is centered at world x1200 where two cord sections meet at y170');
  assert.equal(pole.transform[5],80,'support and cord share vertical camera movement');
  const pad=app.paintOps.find(op=>op.kind==='image'&&op.args[0]===cushion);
  assert.ok(app.paintOps.indexOf(pole)<app.paintOps.indexOf(pad),'cushions cover the support below their top');
  Object.assign(run,{cameraX:255,cameraY:0});app.paintOps.length=0;app.frame(0);
  assert.ok(app.paintOps.some(op=>op.kind==='rounded'&&op.args[0]===933&&op.args[1]===156),'the same world support moves by camera travel');
  Object.assign(run,{cameraX:220,cameraY:-80});assert.deepEqual(clone(run),before);
  assert.equal(app.storage.get(NEW_KEY),stored);assert.equal(app.writes.length,writes);
});

test('the complete wooden support is clipped at the surface in front of it so transparent cushion margins cannot expose its foot', () => {
  for(const type of ['pad','ground','slide']){
    const app=harness(),run=app.start();
    run.platforms=[{id:'occluder',type,x:1000,w:1000,y1:type==='ground'?550:435,y2:type==='slide'?515:type==='ground'?550:435}];
    Object.assign(run,{cameraX:220,cameraY:0});
    Object.assign(run.player,{groundPlatformId:'occluder',compressionDepth:type==='pad'?8:0});
    app.paintOps.length=0;app.frame(0);
    const pole=app.paintOps.find(op=>op.kind==='fill'&&op.color==='#b7783e');
    assert.ok(pole,'the visible support is drawn');
    assert.ok(pole.clip,'every part of the pole, including its curved foot and highlight, has an occlusion clip');
    const front=run.platforms[0],expected=type==='ground'?550:type==='pad'?443:449.88;
    assert.ok(Math.abs(pole.clip[1]+pole.clip[3]-expected)<1e-9,'no pole pixels survive below the near terrain contact edge');
  }
});

test('both figures request the reviewed running set and render its full phase sequence through the loop boundary without changing a run or save', () => {
  // These source markers verify playback of the visually reviewed cycle;
  // synthetic pixels cannot establish whether the drawings are anatomical.
  for(const [avatar,key,file] of [
    ['dreng','boyRun','art/loeb-saet-v2/dreng-loeb.png'],
    ['pige','girlRun','art/loeb-saet-v2/pige-loeb.png']
  ]){
    const app=harness();
    assert.ok(app.images.some(image=>image.src===file),`${avatar} requests the reviewed running artwork`);
    const sheet={image:{id:`reviewed-${avatar}`},atlas:{scale:1,frames:Array.from({length:9},(_,i)=>({
      x:i*100,y:20,w:40,h:70,anchorX:i*100+20,anchorY:90
    }))}};
    app.preparedAssets[key]=sheet;
    const run=app.start();app.data.players[0].avatar=avatar;
    Object.assign(run.player,{x:220,y:515,vx:270,onGround:true,compressTicks:0,hurt:0,
      sliding:false,flightTicks:0,invulnerable:0,motion:'run'});
    const stored=[...app.storage],writes=app.writes.length;
    for(const [tick,phase] of [[0,1],[14,2],[27,3],[40,4],[54,5],[67,6],[80,7],[94,8],[107,1]]){
      run.ticks=tick;run.player.x=220+270*tick/120;
      const before=clone(run);app.drawCalls.length=0;
      assert.equal(app.getPlayerVisual(run).runIndex,phase,`${avatar} selects phase ${phase} at tick ${tick}`);
      app.drawRunner(run);
      const calls=app.drawCalls.filter(call=>call[0]===sheet.image);
      assert.equal(calls.length,1,'exactly one complete running frame is drawn');
      assert.deepEqual(calls[0].slice(1,5),[phase*100,20,40,70],'the selected phase reaches the canvas, including the last-to-first transition');
      assert.equal(calls[0][7]/calls[0][3],1);assert.equal(calls[0][8]/calls[0][4],1);
      assert.equal(calls[0][6]+calls[0][8],515,'the prepared contact anchor remains on the ground');
      assert.deepEqual(clone(run),before,'playback does not change simulation state');
    }
    assert.deepEqual([...app.storage],stored);assert.equal(app.writes.length,writes);
  }
});

test('running animation has a natural capped cadence and freezes during pause and airborne gaps without changing the run', () => {
  for(const [speed,expectedChanges] of [[270,9],[860,12]]){
    const app=harness(),run=app.start();
    const frame={x:0,y:0,w:40,h:70,anchorX:20,anchorY:70};
    app.preparedAssets.girlRun={image:{id:'cadence-run'},atlas:{scale:1,frames:Array(9).fill(frame)}};
    Object.assign(run.player,{x:220,vx:speed,onGround:true,compressTicks:0,hurt:0,sliding:false,motion:'run'});
    let last,changes=0;
    for(let tick=0;tick<=120;tick++){
      run.ticks=tick;run.player.x=220+speed*tick/120;
      const before=clone(run),pose=app.getPlayerVisual(run).runIndex;
      if(last!==undefined&&pose!==last)changes++;
      assert.equal(app.getPlayerVisual(run).runIndex,pose,'a second render at the same tick never advances the pose');
      assert.deepEqual(clone(run),before,'the visual clock never writes to physics');last=pose;
    }
    assert.ok(changes>=expectedChanges-1&&changes<=expectedChanges,
      `one second at speed ${speed} has ${expectedChanges} restrained frame changes rather than rapid leg flicker: ${changes}`);
    const paused=app.getPlayerVisual(run).runIndex;
    assert.equal(app.getPlayerVisual(run).runIndex,paused,'paused simulation ticks hold their frame');
    run.player.onGround=false;run.ticks+=600;
    assert.equal(app.getPlayerVisual(run).runIndex,null);
    run.player.onGround=true;run.ticks++;
    assert.equal(app.getPlayerVisual(run).runIndex,paused,'airtime is not fast-forwarded into the next ground contact');
  }
});

test('both superhero sheets preserve body scale, draw one flying pose and return to ordinary sprites after flight', () => {
  const cases=[
    ['dreng','boyHero','dreng-superhelt.png',[[320,611],[1000,430],[400,1020],[1030,1030]]],
    ['pige','girlHero','pige-superhelt.png',[[320,630],[970,450],[400,1010],[1040,1040]]]
  ];
  for(const [avatar,key,file,anchors] of cases){
    const pixels=new Uint8ClampedArray(1254*1254*4);
    anchors.forEach(([ax,ay],i)=>{
      for(let y=ay-(i?30:100);y<ay+(i?30:0);y++)for(let x=ax-(i?60:20);x<ax+(i?60:20);x++)pixels.set([255,255,255,255],(y*1254+x)*4);
    });
    const app=harness(undefined,{imageData:pixels}),image=app.images.find(i=>i.src.endsWith(file));
    assert.ok(image,'the transformed character artwork is requested');
    Object.assign(image,{complete:true,naturalWidth:1254,naturalHeight:1254});image.onload();
    const sheet=app.preparedAssets[key];assert.equal(sheet.atlas.frames.length,4);
    assert.equal(sheet.atlas.scale,.7,'standing calibration still measures70 world units');
    const run=app.start();app.data.players[0].avatar=avatar;
    Object.assign(run.player,{flightTicks:840,onGround:false,sliding:false,hurt:0,invulnerable:0,motion:'fly',y:200});
    const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
    const seen=new Set();
    for(const tick of [0,18,36]){
      run.ticks=tick;app.drawCalls.length=0;app.drawRunner(run);
      const call=app.drawCalls.find(c=>c[0]===sheet.image);assert.ok(call,'hero flight uses its own atlas');
      assert.equal(call[7]/call[3],.7);assert.equal(call[8]/call[4],.7);
      seen.add(call[1]+','+call[2]);assert.equal(app.drawCalls.filter(c=>c[0]===sheet.image).length,1);
      assert.equal(app.getPlayerVisual(run).poseName,'hero-fly');
    }
    assert.equal(seen.size,3,'the cape has three gentle flight frames');
    run.ticks=0;assert.deepEqual(clone(run),before);assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
    run.player.flightTicks=0;run.player.motion='fall';app.drawCalls.length=0;app.drawRunner(run);
    assert.ok(!app.drawCalls.some(c=>c[0]===sheet.image),'expiry restores ordinary character drawing');
  }
});

test('both heroes prepare their legs for landing during the final flight second and meet the floor without altering the seven-second run', () => {
  for(const [avatar,flyKey,landKey,file] of [
    ['dreng','boyHero','boyHeroLand','art/heltelanding-saet/dreng-landing.png'],
    ['pige','girlHero','girlHeroLand','art/heltelanding-saet/pige-landing.png']
  ]){
    const app=harness(),run=app.start();app.data.players[0].avatar=avatar;
    const frames=Array.from({length:4},(_,i)=>({x:i*100,y:0,w:40,h:100,anchorX:i*100+20,anchorY:100}));
    const flying={id:avatar+'-flying'},landing={id:avatar+'-landing'};
    // Sentinels test the actual renderer's phase and placement contract. The
    // production drawings and their anatomy are checked separately in-browser.
    app.preparedAssets[flyKey]={image:flying,atlas:{scale:.7,frames}};
    app.preparedAssets[landKey]={image:landing,atlas:{scale:.7,frames}};
    const ground=run.platforms.find(p=>p.type==='ground');
    Object.assign(run,{cameraX:1900,bonusPoints:200,nextHazardTick:1e9,nextPowerupTick:1e9});
    Object.assign(run.player,{x:2200,y:550,vx:270,vy:0,onGround:true,groundPlatformId:ground.id,
      compressTicks:0,compressionDepth:0,contactEligible:false,contactJudged:true,combo:4,jumpCharge:3});
    run.powerups=[{id:'landing-test-pickup',type:'hero',x:2180,y:490,w:42,h:42}];
    app.Core.step(run,{});
    assert.equal(run.player.flightTicks,840,'ordinary pickup starts the full seven seconds');
    const control=clone(run),startTicks=run.scoreTicks,saved=app.storage.get(NEW_KEY),writes=app.writes.length;
    for(const [remaining,phase,offset] of [[840,null,null],[121,null,null],[120,1,-20],[91,1,-2/3],
      [90,2,0],[49,2,0],[48,3,0],[1,3,0],[0,null,null]]){
      while(run.player.flightTicks>remaining){app.Core.step(run,{});app.Core.step(control,{});}
      const before=clone(run);app.drawCalls.length=0;app.drawRunner(run);
      if(phase!==null){
        const call=app.drawCalls.find(c=>c[0]===landing);
        assert.ok(call,`${avatar} shows the landing artwork with ${remaining} flight ticks left`);
        assert.equal(call[1],phase*100,'the descent advances through the reviewed preparation poses');
        assert.equal(call[7]/call[3],.7);assert.equal(call[8]/call[4],.7,'a common scale preserves body proportions');
        assert.ok(Math.abs(call[5]+14-(run.player.x-run.cameraX))<1e-9,'the measured hip follows the camera');
        assert.ok(Math.abs(call[6]+call[8]-(run.player.y+offset))<1e-9,
          'the first pose eases down from flight and the final shoes meet the physical feet');
        assert.ok(!app.drawCalls.some(c=>c[0]===flying),'only the preparation pose is drawn during descent');
        app.drawRunner(run);
        assert.equal(app.drawCalls.findLast(c=>c[0]===landing)[1],phase*100,'a second draw never advances preparation');
      }else if(remaining>0){
        assert.ok(app.drawCalls.some(c=>c[0]===flying),'ordinary flight keeps its original artwork');
        assert.ok(!app.drawCalls.some(c=>c[0]===landing),'preparation begins only in the last second');
      }else{
        assert.ok(!app.drawCalls.some(c=>c[0]===flying||c[0]===landing),'touchdown restores ordinary contact artwork');
        assert.ok(run.player.onGround);assert.equal(run.player.y,app.Core.surfaceAt(run.platforms.find(p=>p.id===run.player.groundPlatformId),run.player.x));
      }
      assert.deepEqual(clone(run),before,'drawing cannot change the flight simulation');
      assert.deepEqual(clone(run),clone(control),'rendered and unrendered genuine Core flights remain identical');
      if(remaining===90){
        app.pause('manual');app.drawCalls.length=0;app.frame(1000);
        assert.deepEqual(clone(run),before,'pause freezes the descent and its remaining time');
        assert.equal(app.drawCalls.findLast(c=>c[0]===landing)[1],200,'pause holds the current preparation pose');
        app.resume();
      }
    }
    assert.ok(app.images.some(image=>image.src===file),'the reviewed landing sheet is requested');
    assert.equal(run.scoreTicks-startTicks,840,'the visual transition neither adds nor removes flight time');
    assert.equal(run.lives,3);assert.equal(run.player.combo,4);assert.equal(run.player.jumpCharge,3);assert.equal(run.bonusPoints,200);
    assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes,'landing artwork never writes player records');
  }
});

test('both landing sheets load their separate measured regions with one neutral scale and physical foot anchors', () => {
  for(const [avatar,key,file,anchors] of [
    ['dreng','boyHeroLand','art/heltelanding-saet/dreng-landing.png',[[342,619],[1018,582],[419,1167],[1010,1199]]],
    ['pige','girlHeroLand','art/heltelanding-saet/pige-landing.png',[[341,628],[1006,563],[442,1198],[1035,1220]]]
  ]){
    const sizes=[[40,100],[100,60],[80,80],[60,95]],pixels=new Uint8ClampedArray(1254*1254*4);
    anchors.forEach(([ax,ay],i)=>{
      const [w,h]=sizes[i];
      for(let y=ay-h;y<ay;y++)for(let x=ax-w/2;x<ax+w/2;x++)pixels.set([255,255,255,255],(y*1254+x)*4);
    });
    const app=harness(undefined,{imageData:pixels}),image=app.images.find(i=>i.src===file);
    assert.ok(image,'the separate landing sheet is requested');
    Object.assign(image,{complete:true,naturalWidth:1254,naturalHeight:1254});image.onload();
    const sheet=app.preparedAssets[key];assert.ok(sheet?.atlas);
    assert.equal(sheet.atlas.frames.length,4,'the neutral and all three caped poses remain separate');
    assert.equal(sheet.atlas.scale,.7,'the standing calibration sets one scale for the entire sheet');
    assert.deepEqual(clone(sheet.atlas.frames.map(f=>[f.anchorX,f.anchorY])),anchors,
      'per-region local coordinates preserve the measured global hip and foot anchors');
    const run=app.start();app.data.players[0].avatar=avatar;
    Object.assign(run,{cameraX:70});
    Object.assign(run.player,{x:300,y:350,onGround:false,sliding:false,hurt:0,invulnerable:0,motion:'fly'});
    const saved=app.storage.get(NEW_KEY),writes=app.writes.length;
    for(const [phase,remaining,offset] of [[1,120,-20],[2,78,0],[3,24,0]]){
      run.player.flightTicks=remaining;const before=clone(run);app.drawCalls.length=0;app.drawRunner(run);
      const calls=app.drawCalls.filter(c=>c[0]===sheet.image);assert.equal(calls.length,1,'a whole atlas is never drawn as one character');
      const [ax,ay]=anchors[phase],[w,h]=sizes[phase],call=calls[0];
      assert.deepEqual(call.slice(1,5),[ax-w/2,ay-h,w,h],'the correct isolated source pose is selected');
      assert.equal(call[7]/w,.7);assert.equal(call[8]/h,.7,'posture changes do not resize the body');
      assert.ok(Math.abs(call[5]+call[7]/2-230)<1e-9,'the hip anchor follows the camera');
      assert.ok(Math.abs(call[6]+call[8]-(350+offset))<1e-9,'the measured shoe bottom follows the physical foot coordinate');
      assert.deepEqual(clone(run),before);
    }
    assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
  }
});

test('reduced motion holds a steady feet-down landing pose and unavailable or invalid landing sheets keep the original flying sprite', () => {
  for(const [avatar,flyKey,landKey,file] of [
    ['dreng','boyHero','boyHeroLand','art/heltelanding-saet/dreng-landing.png'],
    ['pige','girlHero','girlHeroLand','art/heltelanding-saet/pige-landing.png']
  ]){
    const app=harness(),run=app.start();app.data.players[0].avatar=avatar;
    const frames=Array.from({length:4},(_,i)=>({x:i*100,y:0,w:40,h:100,anchorX:i*100+20,anchorY:100}));
    const flying={id:avatar+'-fallback-flight'},landing={id:avatar+'-steady-landing'};
    app.preparedAssets[flyKey]={image:flying,atlas:{scale:.7,frames}};
    app.preparedAssets[landKey]={image:landing,atlas:{scale:.7,frames}};
    Object.assign(run.player,{x:300,y:350,onGround:false,sliding:false,hurt:0,invulnerable:0,motion:'fly'});
    const saved=app.storage.get(NEW_KEY),writes=app.writes.length;
    app.setReducedMotion(true);
    for(const remaining of [120,91,90,49,48,1]){
      run.player.flightTicks=remaining;const before=clone(run);app.drawCalls.length=0;app.drawRunner(run);
      const call=app.drawCalls.find(c=>c[0]===landing);assert.ok(call);
      assert.equal(call[1],300,'reduced motion keeps one feet-down preparation pose');
      assert.equal(call[6]+call[8],350,'the calm pose has no easing or bob offset');
      assert.deepEqual(clone(run),before);
    }
    delete app.preparedAssets[landKey];
    const image=app.images.find(i=>i.src===file);assert.ok(image);
    for(const failed of [false,true]){
      if(failed){
        Object.assign(image,{complete:true,naturalWidth:100,naturalHeight:100});image.onload();
        assert.ok(!app.preparedAssets[landKey],'an invalid sheet is rejected rather than exposed as a raw picture');
        assert.match(app.elements.get('assetStatus').textContent,/reservegrafik/);
      }
      for(const reduced of [false,true]){
        app.setReducedMotion(reduced);run.player.flightTicks=60;
        const before=clone(run);app.drawCalls.length=0;app.drawRunner(run);
        assert.ok(app.drawCalls.some(c=>c[0]===flying),'the original flight artwork remains visible during the descent');
        assert.ok(!app.drawCalls.some(c=>c[0]===landing||c[0]===image),'a missing or rejected sheet never becomes a full-atlas rectangle');
        assert.deepEqual(clone(run),before);
      }
    }
    assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
  }
});

test('hero countdown freezes with pause, explains automatic flight and restores ordinary HOP afterwards', () => {
  const app=harness(),run=app.start();
  Object.assign(run.player,{flightTicks:840,onGround:false,sliding:false,motion:'fly',hurt:0});
  const saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.updateHUD();app.paintOps.length=0;app.frame(0);
  assert.equal(app.elements.get('hopButton').disabled,true,'automatic flight does not ask for jump presses');
  assert.equal(app.elements.get('hopHint').textContent,'Flyver automatisk');
  assert.ok(app.paintOps.some(op=>op.kind==='text'&&op.text==='SUPERHELT · 7,0 sek.'));
  run.player.flightTicks=360;app.pause('manual');app.paintOps.length=0;app.frame(1000);
  assert.equal(run.player.flightTicks,360);assert.ok(app.paintOps.some(op=>op.kind==='text'&&op.text==='SUPERHELT · 3,0 sek.'));
  run.player.flightTicks=0;run.player.onGround=true;run.player.motion='run';app.updateHUD();
  assert.equal(app.elements.get('hopButton').disabled,false);
  assert.equal(app.elements.get('hopHint').textContent,'Perfekt før landing');
  assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});

test('the collectible superhero star is visible above foreground trees without changing the run or records', () => {
  const app=harness(),run=app.start(),pickup={id:'hero-collectible'},tree={id:'pickup-tree'};
  const image=app.images.find(i=>i.src.endsWith('superhelt-saet/powerup.png'));
  assert.ok(image);Object.assign(image,{complete:true,naturalWidth:100,naturalHeight:80});
  app.preparedAssets.heroPickup={image:pickup,x:10,y:10,w:80,h:60};
  app.preparedAssets.trees={image:tree,atlas:{frames:Array(3).fill({x:0,y:0,w:80,h:100})}};
  run.platforms=[{id:'low',type:'pad',x:3200,w:1700,y1:515,y2:515}];
  run.cameraX=3100;run.powerups=[{id:'star',type:'hero',x:3550,y:449,w:42,h:42}];
  const before=clone(run),saved=app.storage.get(NEW_KEY),writes=app.writes.length;
  app.drawCalls.length=0;app.frame(0);
  const star=app.drawCalls.find(c=>c[0]===pickup);assert.ok(star,'the rare powerup has a visible picture');
  assert.equal(star[7]/star[3],star[8]/star[4],'the star and cape are never stretched');
  assert.ok(app.drawCalls.indexOf(star)>app.drawCalls.findLastIndex(c=>c[0]===tree),'tree leaves cannot hide the collectible');
  assert.deepEqual(clone(run),before);assert.equal(app.storage.get(NEW_KEY),saved);assert.equal(app.writes.length,writes);
});
