/* Hop og Rul: deterministic shared rules. One step is exactly 1/120 second.
   Coordinates are world pixels; rendering subtracts cameraX and cameraY. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RunnerCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var STEP = 1 / 120, WIDTH = 1200, HEIGHT = 675, PLAYER_SCREEN_X = 220;
  var INITIAL_SPEED = 270, MAX_SPEED = 400, MAX_MOMENTUM = 230;
  var INVULNERABILITY = 1.5, RECOVERY_TICKS = 60;
  var GRAVITY = 1700, JUMP_SPEED = 850, RELEASE_GRAVITY = 2500;
  var PAD_COMPRESSION_TICKS = 9, PAD_COMPRESSION_DEPTH = 11;
  var PERFECT_BEFORE_TICKS = 12, PERFECT_AFTER_TICKS = 6;
  var GOOD_BEFORE_TICKS = 18, GOOD_AFTER_TICKS = 9;
  var MAX_JUMP_CHARGE = 5, FIVE_PERFECT_BONUS = 100, POINTS_PER_SECOND = 10;
  var MIN_SCREEN_X = 140, MAX_SCREEN_X = 650, LATERAL_SPEED = 230;
  var BUFFER_TICKS = 15, COYOTE_TICKS = 11;
  var HAZARD_INTERVAL_TICKS = Math.round(3.2 * 120);
  var HERO_FLIGHT_TICKS = 7 * 120, HERO_FLIGHT_SPEED = 1050;
  // Ground sections remain above the rescue line and the phone controls.
  var CEILING = 100, RESCUE_Y = 570;
  var INTRO = [
    { gap: 0, w: 900, y1: 510, y2: 510, type: 'pad' },
    { gap: 0, w: 1500, y1: 550, y2: 550, type: 'ground', hazard: 'frisbee', hazardStart: 80 },
    { gap: 0, w: 1100, y1: 435, y2: 435, type: 'pad' },
    { gap: 45, w: 720, y1: 435, y2: 435, type: 'pad' },
    { gap: 50, w: 500, y1: 355, y2: 355, type: 'pad' },
    { gap: 0, w: 185, y1: 355, y2: 515, type: 'slide' },
    { gap: 0, w: 1700, y1: 515, y2: 515, type: 'pad', hazard: 'sausage', hazardStart: 600 }
  ];
  var COURSE = [
    { gap: 95, w: 1240, y1: 410, y2: 410, type: 'pad', hazard: 'frisbee' },
    { gap: 90, w: 1000, y1: 510, y2: 510, type: 'pad', hazard: 'sausage', hazardStart: 80 },
    { gap: 80, w: 860, y1: 390, y2: 390, type: 'pad' },
    { gap: 85, w: 550, y1: 300, y2: 300, type: 'pad' },
    { gap: 0, w: 235, y1: 300, y2: 515, type: 'slide' },
    { gap: 0, w: 1700, y1: 515, y2: 515, type: 'pad', hazard: 'sausage', hazardStart: 600 },
    { gap: 0, w: 1500, y1: 550, y2: 550, type: 'ground' },
    { gap: 0, w: 1200, y1: 435, y2: 435, type: 'pad' },
    { gap: 100, w: 1240, y1: 405, y2: 405, type: 'pad', hazard: 'frisbee' },
    { gap: 90, w: 1000, y1: 505, y2: 505, type: 'pad', hazard: 'sausage', hazardStart: 80 },
    { gap: 80, w: 880, y1: 375, y2: 375, type: 'pad' },
    { gap: 85, w: 600, y1: 285, y2: 285, type: 'pad' },
    { gap: 0, w: 240, y1: 285, y2: 510, type: 'slide' },
    { gap: 0, w: 1700, y1: 510, y2: 510, type: 'pad', hazard: 'sausage', hazardStart: 600 },
    { gap: 100, w: 600, y1: 410, y2: 410, type: 'pad' },
    { gap: 95, w: 900, y1: 490, y2: 490, type: 'pad', hazard: 'frisbee', hazardStart: 40 }
  ];
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function surfaceAt(platform, x) {
    return platform.y1 + (platform.y2 - platform.y1) * clamp((x - platform.x) / platform.w, 0, 1);
  }
  function landingContainsX(state, platform, x) {
    // Ground approaches meet a cushion with the same body width as its front.
    // Existing cushion-to-cushion landings retain their center-point rule.
    var reach = state.player.jumpFromGround && platform.type === 'pad' ? state.player.w / 2 : 0;
    return x + reach >= platform.x && x - reach <= platform.x + platform.w;
  }
  function playerBounds(state) {
    var p = state.player;
    return { x: p.x - p.w / 2, y: p.y - p.h, w: p.w, h: p.h,
      left: p.x - p.w / 2, right: p.x + p.w / 2, top: p.y - p.h, bottom: p.y };
  }
  function emit(state, type, data) {
    state.events.push(Object.assign({ type: type, tick: state.ticks }, data || {}));
  }
  function groundFor(state) {
    return state.platforms.find(function (platform) { return platform.id === state.player.groundPlatformId; });
  }
  function ensureCourse(state, minimumEnd) {
    var horizon = Math.max(Math.max(state.player.x, state.cameraX + WIDTH) + WIDTH, minimumEnd || 0);
    while (state.generatedTo < horizon) {
      var template = state.nextSection < INTRO.length ? INTRO[state.nextSection] :
        COURSE[(state.nextSection - INTRO.length) % COURSE.length];
      var start = state.generatedTo + template.gap;
      state.platforms.push({ id: 'section-' + state.nextSection, x: start, w: template.w,
        y1: template.y1, y2: template.y2, type: template.type, hazard: template.hazard || null,
        hazardStart: template.hazardStart || 120, hazardSpawned: false });
      state.generatedTo = start + template.w;
      state.nextSection += 1;
    }
    state.platforms = state.platforms.filter(function (p) { return p.x + p.w > state.cameraX - WIDTH; });
  }
  function updateCamera(state, immediate) {
    var p = state.player;
    var target = Math.min(0, p.y - 390);
    var current = typeof state.cameraY === 'number' ? state.cameraY : 0;
    current = immediate ? target : current + (target - current) * (1 - Math.exp(-7 * STEP));
    // The camera follows an intact ballistic arc; it never changes jump velocity.
    state.cameraY = clamp(current, Math.min(0, p.y - RESCUE_Y), Math.min(0, p.y - p.h - CEILING));
    p.screenX = p.x - state.cameraX;
    state.distance = state.cameraX;
  }
  function updateMotion(state) {
    var p = state.player, ground = p.onGround && groundFor(state);
    p.slopeAngle = ground ? Math.atan2(ground.y2 - ground.y1, ground.w) : 0;
    p.sliding = !!ground && ground.type === 'slide' && p.slopeAngle > 0;
    p.h = p.sliding ? 42 : 70;
    p.motion = p.flightTicks > 0 ? 'fly' : p.hurt > 0 ? 'hurt' : p.compressTicks > 0 ? 'compress' : p.sliding ? 'slide' :
      p.onGround ? 'run' : p.vy < 0 ? 'rise' : 'fall';
  }
  function createRun() {
    var state = {
      rulesVersion: 'hop-og-rul-physics-4', ticks: 0, scoreTicks: 0, score: 0, bonusPoints: 0, distance: 0,
      cameraX: 0, cameraY: 0, baseSpeed: INITIAL_SPEED, speed: INITIAL_SPEED, level: 1,
      lives: 3, status: 'running', recoveryTicks: 0, generatedTo: 1000,
      nextSection: 0, nextHazardId: 0, nextHazardTick: 0,
      nextPowerupId: 0, nextPowerupTick: 30 * 120,
      player: {
        x: PLAYER_SCREEN_X, screenX: PLAYER_SCREEN_X, relativeVX: 0, y: 510, vx: INITIAL_SPEED, vy: 0, w: 44, h: 70,
        momentum: 0, onGround: true, sliding: false, slopeAngle: 0,
        motion: 'run', invulnerable: 0, hurt: 0, combo: 0, jumpCharge: 0, bouncePower: 1,
        groundPlatformId: 'start', lastJump: false,
        coyoteTicks: COYOTE_TICKS, jumpBufferTicks: 0, jumpHoldTicks: 0,
        jumpKind: null, jumpFromGround: false,
        compressTicks: 0, landingCompression: 0, compressionDepth: 0,
        padImpactSpeed: 0, pendingPadBoost: false, lastLaunchSpeed: 0,
        contactTick: null, contactEligible: false, contactJudged: true, contactQuality: null,
        timingInputTick: null, badTimingPress: false, timingReady: false,
        flightTicks: 0, flightStartY: null, flightLandingId: null,
        flightLandingX: null, flightDescentY: null
      },
      platforms: [{ id: 'start', x: 0, w: 1000, y1: 510, y2: 510, type: 'pad' }],
      hazards: [], powerups: [], events: []
    };
    ensureCourse(state);
    return state;
  }
  function clearCompression(p) {
    p.y -= p.compressionDepth;
    p.compressTicks = 0;
    p.landingCompression = 0;
    p.compressionDepth = 0;
    p.pendingPadBoost = false;
  }
  function launch(state, kind, speed) {
    var p = state.player;
    clearCompression(p);
    p.vy = -speed;
    p.lastLaunchSpeed = speed;
    p.onGround = false;
    p.sliding = false;
    p.groundPlatformId = null;
    p.coyoteTicks = 0;
    p.jumpBufferTicks = 0;
    p.jumpHoldTicks = 0;
    p.jumpKind = kind;
    if (kind !== 'manual') p.jumpFromGround = false;
    p.h = 70;
    p.bouncePower = kind === 'pad' ? speed / 600 : 1;
    p.motion = 'rise';
    p.timingInputTick = null;
    p.badTimingPress = false;
    p.contactEligible = false;
    p.contactJudged = true;
    p.contactTick = null;
    p.timingReady = false;
    emit(state, 'jump', { kind: kind, speed: speed });
  }
  function updateScore(state) {
    state.score = Math.floor(state.scoreTicks * POINTS_PER_SECOND / 120) + state.bonusPoints;
  }
  function nextLandingTime(state, surfaceType) {
    var p = state.player, nearest = Infinity;
    if (p.onGround) return 0;
    for (var i = 0; i < state.platforms.length; i++) {
      var platform = state.platforms[i];
      if (platform.type === 'slide' || (surfaceType && platform.type !== surfaceType)) continue;
      var slope = (platform.y2 - platform.y1) / platform.w;
      var surface = platform.y1 + slope * (p.x - platform.x);
      var relativeV = p.vy - slope * p.vx;
      var discriminant = relativeV * relativeV + 2 * GRAVITY * (surface - p.y);
      if (discriminant < 0) continue;
      var t = (-relativeV + Math.sqrt(discriminant)) / GRAVITY;
      var x = p.x + p.vx * t;
      if (t >= 0 && landingContainsX(state, platform, x) && t < nearest) nearest = t;
    }
    return nearest;
  }
  function judgeContact(state, forceMiss) {
    var p = state.player;
    if (!p.contactEligible || p.contactJudged) return;
    if (p.timingInputTick === null && !forceMiss) return;
    var delta = p.timingInputTick === null ? Infinity : p.timingInputTick - p.contactTick;
    var quality = 'miss';
    if (!forceMiss && !p.badTimingPress && delta >= -PERFECT_BEFORE_TICKS && delta <= PERFECT_AFTER_TICKS) quality = 'perfect';
    else if (!forceMiss && !p.badTimingPress && delta >= -GOOD_BEFORE_TICKS && delta <= GOOD_AFTER_TICKS) quality = 'good';
    p.contactJudged = true;
    p.contactQuality = quality;
    p.pendingPadBoost = quality !== 'miss';
    if (quality === 'perfect') {
      p.combo += 1;
      p.jumpCharge = Math.min(MAX_JUMP_CHARGE, p.jumpCharge + 1);
      if (p.combo % 5 === 0) {
        state.bonusPoints += FIVE_PERFECT_BONUS;
        updateScore(state);
        emit(state, 'bonus', { points: FIVE_PERFECT_BONUS, streak: p.combo });
      }
    } else {
      p.combo = 0;
      p.jumpCharge = Math.max(0, p.jumpCharge - 1);
    }
    emit(state, 'timing', { quality: quality, streak: p.combo, charge: p.jumpCharge });
  }
  function beginCompression(state, impact, eligible) {
    var p = state.player;
    p.compressTicks = PAD_COMPRESSION_TICKS;
    p.landingCompression = 0;
    p.compressionDepth = 0;
    p.padImpactSpeed = Math.max(0, impact);
    p.contactTick = state.ticks;
    p.contactEligible = !!eligible && p.hurt === 0;
    p.contactJudged = !p.contactEligible;
    p.contactQuality = null;
    p.pendingPadBoost = false;
    p.jumpBufferTicks = 0;
    p.jumpKind = null;
    p.vy = 0;
    p.motion = 'compress';
    if (p.contactEligible) judgeContact(state, false);
  }
  function hit(state, reason) {
    var p = state.player;
    if (state.status !== 'running' || p.invulnerable > 0 || p.flightTicks > 0) return false;
    state.lives = Math.max(0, state.lives - 1);
    clearCompression(p);
    p.invulnerable = INVULNERABILITY;
    p.hurt = 0.45;
    p.combo = 0;
    p.jumpCharge = 0;
    p.momentum = 0;
    p.relativeVX = 0;
    p.timingInputTick = null;
    p.badTimingPress = false;
    p.contactEligible = false;
    p.contactJudged = true;
    p.contactTick = null;
    p.contactQuality = null;
    p.timingReady = false;
    p.bouncePower = 1;
    p.vy = Math.max(660, p.vy);
    p.onGround = false;
    p.sliding = false;
    p.groundPlatformId = null;
    p.coyoteTicks = 0;
    p.jumpBufferTicks = 0;
    p.jumpHoldTicks = 0;
    p.jumpKind = null;
    p.jumpFromGround = false;
    p.h = 70;
    p.motion = 'hurt';
    p.y = Math.min(p.y, RESCUE_Y);
    emit(state, 'hit', { text: 'AV!', reason: reason || 'hazard', lives: state.lives });
    if (state.lives === 0) {
      state.status = 'ended';
      emit(state, 'end', { scoreTicks: state.scoreTicks });
    }
    updateCamera(state, true);
    return true;
  }
  function recover(state) {
    hit(state, 'fall');
    if (state.status === 'ended') return;
    ensureCourse(state);
    var p = state.player;
    var landing = state.platforms.find(function (platform) {
      return platform.x + platform.w >= p.x + 100 && platform.type !== 'slide';
    });
    if (!landing) landing = state.platforms[state.platforms.length - 1];
    clearCompression(p);
    p.x = clamp(Math.max(p.x, landing.x + 75), landing.x + 25, landing.x + landing.w - 75);
    state.cameraX = Math.max(state.cameraX, p.x - PLAYER_SCREEN_X);
    p.relativeVX = 0;
    p.y = surfaceAt(landing, p.x);
    p.vy = 0;
    p.onGround = true;
    p.groundPlatformId = landing.id;
    p.invulnerable = INVULNERABILITY;
    p.combo = 0;
    p.jumpCharge = 0;
    p.bouncePower = 1;
    p.jumpBufferTicks = 0;
    p.coyoteTicks = COYOTE_TICKS;
    p.jumpKind = null;
    p.jumpFromGround = landing.type === 'ground';
    p.momentum = 0;
    p.timingInputTick = null;
    p.badTimingPress = false;
    p.contactEligible = false;
    p.contactJudged = true;
    p.contactTick = null;
    p.contactQuality = null;
    p.timingReady = false;
    state.recoveryTicks = RECOVERY_TICKS;
    state.hazards = state.hazards.filter(function (h) { return h.x > p.x + 450; });
    state.nextHazardTick = state.ticks + 4 * 120;
    updateMotion(state);
    updateCamera(state, true);
    emit(state, 'recover');
  }
  function spawnHazards(state) {
    if (state.scoreTicks < 8 * 120 || state.ticks < state.nextHazardTick) return;
    var p = state.player;
    for (var i = 0; i < state.platforms.length; i++) {
      var platform = state.platforms[i];
      var groundCast = platform.type === 'ground';
      if (!platform.hazard || (!groundCast && platform.type !== 'pad')) continue;
      if (groundCast && (platform.hazardSpawned || !p.onGround || p.groundPlatformId !== platform.id)) continue;
      var frisbee = platform.hazard === 'frisbee';
      var warningDistance = groundCast ? 650 : 860;
      // The projectile meets even a forward-steering runner before the pad ends.
      var fastest = state.speed + LATERAL_SPEED;
      var runway = fastest * warningDistance / (fastest + (frisbee ? 165 : 190)) + (groundCast ? 450 : 100);
      if (p.x < platform.x + (platform.hazardStart || 120) || p.x > platform.x + platform.w - runway) continue;
      platform.hazardSpawned = (platform.hazardSpawned || 0) + 1;
      state.hazards.push({ id: 'hazard-' + state.nextHazardId++, type: platform.hazard,
        x: p.x + warningDistance, y: platform.y1 - (frisbee ? 68 : 30),
        w: frisbee ? 66 : 61, h: frisbee ? 24 : 29, vx: frisbee ? -165 : -190 });
      state.nextHazardTick = state.ticks + HAZARD_INTERVAL_TICKS;
      emit(state, 'warning', { hazard: platform.hazard });
      break;
    }
  }
  function updateHazards(state) {
    var p = state.player, b = playerBounds(state);
    var body = { x: b.x + 7, y: b.y + 5, w: b.w - 14, h: b.h - 8 };
    state.hazards = state.hazards.filter(function (h) {
      h.x += (typeof h.vx === 'number' ? h.vx : -165) * STEP;
      if (h.x + h.w < p.x - 350) return false;
      var overlap = body.x < h.x + h.w && body.x + body.w > h.x &&
        body.y < h.y + h.h && body.y + body.h > h.y;
      if (overlap) { hit(state, h.type); return false; }
      return true;
    });
  }
  function clearFlightContact(p) {
    p.jumpBufferTicks = 0;
    p.jumpHoldTicks = 0;
    p.jumpKind = null;
    p.jumpFromGround = false;
    p.timingInputTick = null;
    p.badTimingPress = false;
    p.contactEligible = false;
    p.contactJudged = true;
    p.contactTick = null;
    p.contactQuality = null;
    p.timingReady = false;
  }
  function spawnPowerups(state) {
    if (state.player.flightTicks > 0 || state.powerups.length || state.scoreTicks < state.nextPowerupTick) return;
    var targetX = state.player.x + 750;
    var platform = state.platforms.find(function (floor) {
      return (floor.type === 'pad' || floor.type === 'ground') && !floor.hazard && floor.w >= 600 &&
        targetX >= floor.x + 120 && targetX <= floor.x + floor.w - 180;
    });
    if (!platform) return;
    state.powerups.push({ id: 'hero-' + state.nextPowerupId++, type: 'hero',
      x: targetX - 21, y: surfaceAt(platform, targetX) - 66, w: 42, h: 42 });
    state.nextPowerupTick = state.scoreTicks + 55 * 120;
  }
  function collectPowerups(state) {
    var p = state.player, body = playerBounds(state);
    state.powerups = state.powerups.filter(function (item) {
      if (item.x + item.w < state.cameraX - 100) return false;
      var overlap = body.left < item.x + item.w && body.right > item.x &&
        body.top < item.y + item.h && body.bottom > item.y;
      if (!overlap || item.type !== 'hero') return true;
      clearCompression(p);
      clearFlightContact(p);
      p.flightTicks = HERO_FLIGHT_TICKS;
      p.flightStartY = p.y;
      p.flightLandingId = p.flightLandingX = p.flightDescentY = null;
      p.onGround = false;
      p.groundPlatformId = null;
      p.sliding = false;
      p.hurt = 0;
      p.h = 70;
      p.vy = 0;
      p.momentum = 0;
      state.hazards = [];
      emit(state, 'hero-start', { duration: 7 });
      return false;
    });
  }
  function flightLanding(state, desiredX) {
    // A fast flight can reach short pads and a slide at the normal draw horizon.
    // Search at most one full course cycle, generating real sections as needed.
    for (var sections = 0; sections <= INTRO.length + COURSE.length; sections++) {
      var landing = state.platforms.find(function (platform) {
        return (platform.type === 'pad' || platform.type === 'ground') &&
          platform.w >= 600 && platform.x + platform.w >= desiredX + 220;
      });
      if (landing) return landing;
      ensureCourse(state, Math.max(desiredX + 220, state.generatedTo + 1));
    }
    throw new Error('The course must provide a broad forward landing');
  }
  function endHeroFlight(state, landing) {
    var p = state.player;
    p.flightTicks = 0;
    p.flightStartY = p.flightLandingX = p.flightLandingId = p.flightDescentY = null;
    clearFlightContact(p);
    p.onGround = true;
    p.groundPlatformId = landing.id;
    p.y = surfaceAt(landing, p.x);
    p.vy = 0;
    p.relativeVX = 0;
    p.momentum = 0;
    p.coyoteTicks = COYOTE_TICKS;
    p.invulnerable = Math.max(p.invulnerable, 1.2);
    state.speed = state.baseSpeed;
    state.hazards = [];
    state.nextHazardTick = state.ticks + 3 * 120;
    if (landing.type === 'pad') beginCompression(state, 600, false);
    updateMotion(state);
    emit(state, 'hero-end');
  }
  function advanceHeroFlight(state, input) {
    var p = state.player, remaining = p.flightTicks, oldY = p.y;
    if (remaining <= 120 && p.flightLandingId === null) {
      var desiredX = p.x + HERO_FLIGHT_SPEED * remaining * STEP;
      var destination = flightLanding(state, desiredX);
      p.flightLandingId = destination.id;
      p.flightLandingX = Math.max(desiredX, destination.x + 150);
      p.flightDescentY = p.y;
    }
    if (p.flightLandingId !== null) {
      var landing = state.platforms.find(function (platform) { return platform.id === p.flightLandingId; });
      var dx = (p.flightLandingX - p.x) / remaining;
      state.cameraX += dx;
      p.x += dx;
      p.vx = state.speed = dx / STEP;
      p.relativeVX = 0;
      var t = (121 - remaining) / 120;
      p.y = p.flightDescentY + (surfaceAt(landing, p.flightLandingX) - p.flightDescentY) * t * t * (3 - 2 * t);
    } else {
      state.speed = HERO_FLIGHT_SPEED;
      advanceHorizontal(state, input);
      var rise = Math.min(1, (HERO_FLIGHT_TICKS - remaining + 1) / 90);
      p.y = p.flightStartY + (200 - p.flightStartY) * rise * rise * (3 - 2 * rise);
    }
    p.vy = (p.y - oldY) / STEP;
    p.flightTicks -= 1;
    if (p.flightTicks === 0) endHeroFlight(state, landing);
    updateMotion(state);
    updateCamera(state, false);
  }
  function updateHorizontalSpeed(state, ground) {
    var p = state.player;
    if (ground && ground.type === 'slide' && ground.y2 > ground.y1 && p.compressTicks === 0) {
      var slope = (ground.y2 - ground.y1) / ground.w;
      // Horizontal component of acceleration down the incline, with surface drag.
      var acceleration = GRAVITY * slope / (1 + slope * slope) * 0.48;
      p.momentum = Math.min(MAX_MOMENTUM, p.momentum + acceleration * STEP);
    } else {
      p.momentum *= Math.exp(-(p.onGround ? 0.8 : 0.28) * STEP);
      if (p.momentum < 0.01) p.momentum = 0;
    }
    state.speed = state.baseSpeed + p.momentum;
  }
  function advanceHorizontal(state, input) {
    var p = state.player;
    var direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    var target = direction * LATERAL_SPEED;
    p.relativeVX += (target - p.relativeVX) * (1 - Math.exp(-(direction ? 15 : 23) * STEP));
    if (Math.abs(p.relativeVX) < 0.02) p.relativeVX = 0;
    var oldX = p.x;
    state.cameraX += state.speed * STEP;
    p.x += (state.speed + p.relativeVX) * STEP;
    var clamped = clamp(p.x, state.cameraX + MIN_SCREEN_X, state.cameraX + MAX_SCREEN_X);
    if (clamped !== p.x) p.relativeVX = 0;
    p.x = clamped;
    p.vx = (p.x - oldX) / STEP;
    p.screenX = p.x - state.cameraX;
    state.distance = state.cameraX;
  }
  function advanceCompression(state, ground) {
    var p = state.player;
    judgeContact(state, false);
    p.compressTicks -= 1;
    var phase = 1 - p.compressTicks / PAD_COMPRESSION_TICKS;
    p.landingCompression = Math.sin(Math.PI * phase);
    p.compressionDepth = p.landingCompression * PAD_COMPRESSION_DEPTH;
    p.y = surfaceAt(ground, p.x) + p.compressionDepth;
    if (p.compressTicks === 0 || p.x + p.vx * STEP >= ground.x + ground.w - 2) {
      judgeContact(state, true);
      var speed = clamp(p.padImpactSpeed * 0.84, 600, 820);
      if (p.pendingPadBoost && p.hurt === 0) speed += p.contactQuality === 'perfect' ? 120 : 80;
      speed += p.jumpCharge * 35;
      launch(state, 'pad', Math.min(1120, speed));
    }
  }
  function setLanding(state, platform, y, impact) {
    var p = state.player;
    p.y = y;
    p.vy = 0;
    p.onGround = true;
    p.groundPlatformId = platform.id;
    p.coyoteTicks = COYOTE_TICKS;
    p.jumpKind = null;
    p.jumpFromGround = platform.type === 'ground';
    p.bouncePower = 1;
    emit(state, 'land', { platform: platform.type, impact: impact });
    if (platform.type === 'pad') {
      beginCompression(state, impact, true);
    }
    else {
      if (platform.type === 'ground') {
        p.timingInputTick = null;
        p.badTimingPress = false;
        p.contactEligible = false;
        p.contactJudged = true;
        p.contactTick = null;
        p.contactQuality = null;
      }
      if (p.jumpBufferTicks > 0 && p.hurt === 0) launch(state, 'manual', JUMP_SPEED);
    }
  }
  function step(state, input) {
    if (state.status !== 'running') return state;
    input = input || {};
    var p = state.player;
    var ground = p.onGround ? groundFor(state) : null;
    if (ground) p.jumpFromGround = ground.type === 'ground';
    var pressedJump = !!input.jump && !p.lastJump;
    p.lastJump = !!input.jump;
    state.ticks += 1;
    p.invulnerable = Math.max(0, p.invulnerable - STEP);
    p.hurt = Math.max(0, p.hurt - STEP);
    p.jumpBufferTicks = Math.max(0, p.jumpBufferTicks - 1);
    if (state.recoveryTicks > 0) {
      state.recoveryTicks -= 1;
      p.jumpBufferTicks = 0;
      updateMotion(state);
      updateCamera(state, false);
      return state;
    }
    if (p.flightTicks > 0) {
      state.scoreTicks += 1;
      updateScore(state);
      state.baseSpeed = Math.min(MAX_SPEED, INITIAL_SPEED + state.scoreTicks * STEP * 0.9);
      state.level = 1 + Math.floor(state.scoreTicks * STEP / 20);
      ensureCourse(state);
      advanceHeroFlight(state, input);
      return state;
    }
    if (pressedJump && p.hurt === 0) {
      p.jumpBufferTicks = BUFFER_TICKS;
      var padTime = nextLandingTime(state, 'pad');
      var groundTime = nextLandingTime(state, 'ground');
      // Running and early manual ground jumps are not cushion-timing attempts.
      var groundJumpInput = !p.onGround &&
        ((isFinite(groundTime) && groundTime <= padTime) ||
          (p.jumpFromGround && padTime > (GOOD_BEFORE_TICKS + 2) * STEP));
      if (!groundJumpInput && p.timingInputTick === null && (!p.onGround || !p.contactJudged)) {
        p.timingInputTick = state.ticks;
        if (!p.onGround && nextLandingTime(state) > (GOOD_BEFORE_TICKS + 2) * STEP) {
          p.badTimingPress = true;
          p.combo = 0;
        }
      }
    }
    state.scoreTicks += 1;
    updateScore(state);
    state.baseSpeed = Math.min(MAX_SPEED, INITIAL_SPEED + state.scoreTicks * STEP * 0.9);
    state.level = 1 + Math.floor(state.scoreTicks * STEP / 20);
    ensureCourse(state);
    ground = p.onGround ? groundFor(state) : null;
    updateHorizontalSpeed(state, ground);
    if (p.onGround) p.coyoteTicks = COYOTE_TICKS;
    else p.coyoteTicks = Math.max(0, p.coyoteTicks - 1);
    // Initial placements do not earn timing credit; every pad resumes its spring.
    if (ground && ground.type === 'pad' && p.compressTicks === 0) {
      beginCompression(state, 600, false);
    }
    if (p.contactEligible && !p.contactJudged && p.onGround) {
      judgeContact(state, false);
      if (state.ticks - p.contactTick > GOOD_AFTER_TICKS) judgeContact(state, true);
    }
    if ((!ground || ground.type !== 'pad') && p.compressTicks === 0 &&
      p.jumpBufferTicks > 0 && p.coyoteTicks > 0 && p.hurt === 0) {
      launch(state, 'manual', JUMP_SPEED);
      ground = null;
    }
    var oldX = p.x, oldY = p.y, previousGround = ground;
    advanceHorizontal(state, input);
    if (p.compressTicks > 0 && ground) {
      advanceCompression(state, ground);
    } else if (p.onGround && ground && p.x <= ground.x + ground.w && p.x >= ground.x) {
      p.y = surfaceAt(ground, p.x);
      p.vy = (ground.y2 - ground.y1) / ground.w * p.vx;
    } else {
      var continuation = previousGround && p.onGround && state.platforms.find(function (platform) {
        return Math.abs(platform.x - (previousGround.x + previousGround.w)) < 0.01 &&
          Math.abs(platform.y1 - previousGround.y2) < 0.01 && p.x >= platform.x && p.x <= platform.x + platform.w;
      });
      if (continuation) {
        p.y = surfaceAt(continuation, p.x);
        p.groundPlatformId = continuation.id;
        p.vy = (continuation.y2 - continuation.y1) / continuation.w * p.vx;
        if (continuation.type === 'pad') beginCompression(state, Math.abs(p.vy), false);
      } else {
        p.onGround = false;
        p.groundPlatformId = null;
        var gravity = p.jumpKind === 'manual' && !input.jump && p.vy < 0 ? RELEASE_GRAVITY : GRAVITY;
        p.jumpHoldTicks += 1;
        p.y += p.vy * STEP + 0.5 * gravity * STEP * STEP;
        p.vy += gravity * STEP;
        if (p.vy >= 0) {
          var landing = null, landingY = Infinity;
          for (var i = 0; i < state.platforms.length; i++) {
            var platform = state.platforms[i];
            if (!landingContainsX(state, platform, p.x)) continue;
            var surface = surfaceAt(platform, p.x), oldSurface = surfaceAt(platform, oldX);
            if (oldY <= oldSurface + 1.5 && p.y >= surface && surface < landingY) {
              landing = platform; landingY = surface;
            }
          }
          if (landing) setLanding(state, landing, landingY, p.vy);
        }
      }
    }
    if (p.jumpFromGround) {
      var blockedFront = state.platforms.find(function (platform) {
        return platform.type === 'pad' && oldX + p.w / 2 <= platform.x &&
          p.x + p.w / 2 >= platform.x && p.y > platform.y1 + 1.5;
      });
      if (blockedFront) {
        hit(state, 'pad-edge');
        if (state.status === 'running') recover(state);
      }
    }
    if (p.y >= RESCUE_Y) { p.y = RESCUE_Y; recover(state); }
    updateMotion(state);
    if (state.status === 'running' && state.recoveryTicks === 0) {
      spawnPowerups(state);
      collectPowerups(state);
      if (p.flightTicks === 0) { spawnHazards(state); updateHazards(state); }
    }
    updateMotion(state);
    updateCamera(state, false);
    p.timingReady = p.flightTicks === 0 && p.hurt === 0 && p.timingInputTick === null && (
      (!p.onGround && nextLandingTime(state, 'pad') <= PERFECT_BEFORE_TICKS * STEP) ||
      (p.contactEligible && !p.contactJudged && state.ticks - p.contactTick <= PERFECT_AFTER_TICKS));
    return state;
  }
  return {
    STEP: STEP, WIDTH: WIDTH, HEIGHT: HEIGHT, PLAYER_SCREEN_X: PLAYER_SCREEN_X,
    INITIAL_SPEED: INITIAL_SPEED, MAX_SPEED: MAX_SPEED, MAX_MOMENTUM: MAX_MOMENTUM,
    GRAVITY: GRAVITY, JUMP_SPEED: JUMP_SPEED, PAD_COMPRESSION_TICKS: PAD_COMPRESSION_TICKS,
    PAD_COMPRESSION_DEPTH: PAD_COMPRESSION_DEPTH,
    PERFECT_BEFORE_TICKS: PERFECT_BEFORE_TICKS, PERFECT_AFTER_TICKS: PERFECT_AFTER_TICKS,
    GOOD_BEFORE_TICKS: GOOD_BEFORE_TICKS, GOOD_AFTER_TICKS: GOOD_AFTER_TICKS,
    MAX_JUMP_CHARGE: MAX_JUMP_CHARGE, FIVE_PERFECT_BONUS: FIVE_PERFECT_BONUS,
    POINTS_PER_SECOND: POINTS_PER_SECOND,
    MIN_SCREEN_X: MIN_SCREEN_X, MAX_SCREEN_X: MAX_SCREEN_X, LATERAL_SPEED: LATERAL_SPEED,
    INVULNERABILITY: INVULNERABILITY, RECOVERY_TICKS: RECOVERY_TICKS, RESCUE_Y: RESCUE_Y,
    HERO_FLIGHT_TICKS: HERO_FLIGHT_TICKS, HERO_FLIGHT_SPEED: HERO_FLIGHT_SPEED,
    createRun: createRun, step: step, surfaceAt: surfaceAt, playerBounds: playerBounds, hit: hit
  };
}));
