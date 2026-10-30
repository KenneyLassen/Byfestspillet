// Run with: node --test tests/runner.test.cjs
// Behavioral tests of the exact pure simulation used by the runner browser UI.
// Browser input, rendering, rotation and storage require separate UI checks.
const test = require('node:test');
const assert = require('node:assert/strict');
const { STEP, RESCUE_Y, MAX_SPEED, MAX_MOMENTUM, MIN_SCREEN_X, MAX_SCREEN_X, PAD_COMPRESSION_TICKS, createRun, step, surfaceAt, playerBounds, hit } = require('../runner-core.js');

const NONE = { jump: false };
const clone = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected, message) => assert.ok(
  Math.abs(actual - expected) < 1e-6, `${message}: expected ${expected}, got ${actual}`,
);
const screenBounds = run => {
  const bounds = playerBounds(run);
  return { top: bounds.top - (run.cameraY || 0), bottom: bounds.bottom - (run.cameraY || 0) };
};

function flatRun() {
  const run = createRun();
  run.platforms = [{ id: 'test-floor', x: -1000, w: 1000000, y1: 500, y2: 500, type: 'platform' }];
  run.hazards = [];
  run.generatedTo = 1e9;
  run.nextPowerupTick = 1e9; // Isolated floor tests do not schedule course pickups.
  Object.assign(run.player, {
    y: 500, vy: 0, onGround: true,
    groundPlatformId: 'test-floor', invulnerable: 0, hurt: 0,
  });
  return run;
}

function ticks(run, count, input = NONE) {
  for (let i = 0; i < count; i++) step(run, typeof input === 'function' ? input(i, run) : input);
  return run;
}

function until(run, condition, input = NONE, limit = 1000) {
  for (let i = 0; i < limit; i++) {
    if (condition(run)) return;
    step(run, input);
  }
  assert.ok(condition(run), 'the expected simulation condition must be reached');
}

function fallingPadRun() {
  const run = flatRun();
  run.platforms[0].type = 'pad';
  Object.assign(run.player, { y: 100, vy: 0, onGround: false,
    groundPlatformId: null, coyoteTicks: 0 });
  return run;
}

function firstContactTick() {
  const run = fallingPadRun();
  until(run, r => r.player.compressTicks === PAD_COMPRESSION_TICKS, NONE, 240);
  return run.ticks;
}

test('ground running and ground jumps preserve the perfect streak and stored power without automatic rebounds', () => {
  const run=flatRun();run.platforms[0].type='ground';run.platforms[0].y1=run.platforms[0].y2=550;
  Object.assign(run.player,{y:550,combo:5,jumpCharge:3});
  run.bonusPoints=200;
  ticks(run,300);
  assert.equal(run.player.motion,'run');assert.equal(run.player.y,550);
  assert.equal(run.player.compressTicks,0);assert.equal(run.player.combo,5);assert.equal(run.player.jumpCharge,3);
  assert.equal(run.score,225,'running time earns survival points and keeps earned perfect-hop bonuses');
  step(run,{jump:true});ticks(run,5);
  assert.ok(!run.player.onGround&&run.player.vy<0,'ground responds to a manual jump');
  step(run,{jump:true});
  assert.equal(run.player.combo,5,'an early ground-jump press is not a missed cushion timing');
  until(run,r=>r.player.onGround,NONE,240);
  assert.equal(run.player.groundPlatformId,'test-floor');assert.equal(run.player.y,550);
  assert.equal(run.player.combo,5);assert.equal(run.player.jumpCharge,3);
  assert.equal(run.bonusPoints,200);
  assert.equal(run.player.timingInputTick,null,'ground landing cannot leave a stale cushion input');
  assert.equal(run.lives,3);
});

test('ground timing exemption applies to a ground landing rather than protecting arbitrary pad jumps over empty gaps', () => {
  const ground=flatRun(),gap=flatRun();
  ground.platforms[0].type='ground';ground.platforms[0].y1=ground.platforms[0].y2=550;
  gap.platforms=[];
  for(const run of [ground,gap])Object.assign(run.player,{y:150,vy:200,onGround:false,groundPlatformId:null,
    coyoteTicks:0,combo:4,jumpCharge:3,jumpKind:'pad',jumpFromGround:false});
  step(ground,{jump:true});step(gap,{jump:true});
  assert.equal(ground.player.combo,4,'a real ground landing has no cushion timing to fail');
  assert.equal(gap.player.combo,0,'an early non-ground press retains the existing mistiming rule');
});

test('missing the jump from ground meets the raised cushion front with one hit and a safe forward recovery', () => {
  const run=flatRun();
  run.platforms=[{id:'ground',type:'ground',x:0,w:1000,y1:550,y2:550},
    {id:'pad',type:'pad',x:1000,w:1400,y1:435,y2:435}];
  Object.assign(run.player,{x:970,y:550,groundPlatformId:'ground',combo:5,jumpCharge:3});run.cameraX=750;
  while(run.player.x+run.player.w/2<1000)step(run,NONE);
  assert.equal(run.lives,2,'the body cannot enter a solid cushion front');
  assert.ok(run.events.some(e=>e.type==='hit'&&e.reason==='pad-edge'&&e.text==='AV!'));
  assert.ok(run.player.x>=1025&&run.player.y===435,'recovery places the runner on the next cushion');
  assert.equal(run.player.combo,0);assert.equal(run.player.jumpCharge,0);
  assert.equal(run.player.groundPlatformId,'pad');assert.ok(run.recoveryTicks>0);
  ticks(run,60);assert.equal(run.lives,2,'one front collision is never a double hit');
});

test('the opening course includes a visible running section and a reachable first cushion beyond it', () => {
  const run=createRun(),ground=run.platforms.find(p=>p.type==='ground');
  assert.ok(ground,'a ground section is part of the early course');
  assert.equal(ground.y1,550);assert.equal(ground.y2,550);
  assert.ok(ground.x<2500&&ground.w>=1000,'the opening offers a sustained run before the next cushion');
  until(run,r=>r.platforms.some(p=>p.type==='pad'&&p.x===ground.x+ground.w),NONE,1200);
  const next=run.platforms.find(p=>p.type==='pad'&&p.x===ground.x+ground.w);
  assert.equal(next.y1,435);assert.ok(next.w>=1000,'the first return has a broad landing');
});

test('short and held ground jumps reach the raised cushion at opening and maximum speed without spending the streak', () => {
  for(const maximum of [false,true])for(const held of [false,true]){
    const run=flatRun();
    run.platforms=[{id:'ground',type:'ground',x:0,w:1200,y1:550,y2:550},
      {id:'pad',type:'pad',x:1200,w:1400,y1:435,y2:435}];
    Object.assign(run.player,{x:maximum?900:1000,y:550,groundPlatformId:'ground',combo:4,jumpCharge:3});
    run.cameraX=run.player.x-220;run.bonusPoints=200;
    if(maximum){run.ticks=run.scoreTicks=36000;run.baseSpeed=MAX_SPEED;run.speed=MAX_SPEED+MAX_MOMENTUM;
      Object.assign(run.player,{vx:860,momentum:MAX_MOMENTUM,relativeVX:230});}
    until(run,r=>1200-r.player.x<=22+r.player.vx*.32,maximum?{right:true}:NONE,120);
    let landed=false;
    for(let i=0;i<240;i++){
      step(run,{jump:held||i<2,right:maximum});
      assert.equal(run.lives,3,'the whole body clears the raised front');
      assert.equal(run.player.combo,4);assert.equal(run.player.jumpCharge,3);assert.equal(run.bonusPoints,200);
      if(run.player.groundPlatformId==='pad'){landed=true;break;}
    }
    assert.ok(landed,`${maximum?'maximum':'opening'} speed ${held?'hold':'tap'} reaches the pad`);
    assert.equal(run.player.compressTicks,PAD_COMPRESSION_TICKS);
    const missed=clone(run);ticks(missed,PAD_COMPRESSION_TICKS+1);
    assert.equal(missed.player.combo,0,'ignoring the next cushion timing still ends the perfect streak');
    assert.equal(missed.player.jumpCharge,2);assert.equal(missed.bonusPoints,200,'earned bonuses are never taken back');
    if(held)step(run,{right:maximum});
    step(run,{jump:true,right:maximum});
    assert.equal(run.player.combo,5,'a fresh well-timed press on the next pad continues the streak');
    assert.equal(run.player.jumpCharge,4);assert.equal(run.bonusPoints,300,'the fifth perfect still earns its normal bonus');
  }
});

test('a slow left-held ground jump can land on the cushion edge and earn a perfect press before contact', () => {
  function setup(){
    const run=flatRun();
    run.platforms=[{id:'ground',type:'ground',x:0,w:1200,y1:550,y2:550},
      {id:'pad',type:'pad',x:1200,w:1400,y1:435,y2:435}];
    Object.assign(run.player,{x:1165,y:550,vx:40,relativeVX:-230,groundPlatformId:'ground',combo:4,jumpCharge:3});
    run.cameraX=515;run.bonusPoints=200;return run;
  }
  for(const held of [false,true]){
    const reference=setup();let contactTick=null;
    const baseInput=(i,run)=>({left:true,jump:i===0||(held?run.player.vy<0:i<2)});
    for(let i=0;i<240;i++){
      step(reference,baseInput(i,reference));
      assert.equal(reference.lives,3,'a body-width landing must not turn into a fall rescue');
      if(reference.events.some(e=>e.type==='land'&&e.platform==='pad')){contactTick=reference.ticks;break;}
    }
    assert.ok(contactTick,'tap and hold both reach the edge of the raised cushion');
    assert.ok(reference.player.x<1200&&reference.player.x+reference.player.w/2>=1200,
      'the planted foot reaches the top before the body center crosses the edge');
    const run=setup();let pressed=false;
    for(let i=0;i<contactTick;i++){
      const input=baseInput(i,run);
      if(run.ticks===contactTick-8){
        assert.equal(run.player.timingReady,true,'the same overlap is predicted by the perfect-timing signal');
        input.jump=true;pressed=true;
      }
      step(run,input);
    }
    assert.ok(pressed);assert.equal(run.lives,3);assert.equal(run.player.groundPlatformId,'pad');
    assert.equal(run.player.combo,5);assert.equal(run.player.jumpCharge,4);assert.equal(run.bonusPoints,300);
  }
  const padJump=setup();
  Object.assign(padJump.player,{x:1185,y:430,vy:500,onGround:false,groundPlatformId:null,jumpKind:'pad',jumpFromGround:false});
  padJump.cameraX=535;
  ticks(padJump,3,{left:true});
  assert.ok(padJump.player.x<1200&&padJump.player.x+padJump.player.w/2>1200);
  assert.notEqual(padJump.player.groundPlatformId,'pad','ordinary pad jumps retain the center-point landing rule');
});

test('even a fully powered fast rebound leaves ground reaction space before the next raised cushion', () => {
  const run=createRun(),p=run.player;
  Object.assign(run,{ticks:36000,scoreTicks:36000,cameraX:1668,baseSpeed:400,speed:630});
  Object.assign(p,{x:1888,y:510,onGround:true,groundPlatformId:'section-0',compressTicks:1,
    padImpactSpeed:1000,combo:4,jumpCharge:5,pendingPadBoost:true,contactQuality:'perfect',contactJudged:true,
    momentum:MAX_MOMENTUM,relativeVX:230});
  let runningTicks=0,reached=false;
  for(let i=0;i<500;i++){
    const floor=run.platforms.find(f=>f.id===p.groundPlatformId);
    const next=floor&&run.platforms.find(f=>f.x>=floor.x+floor.w&&f.type==='pad');
    let jump=p.jumpKind==='manual'&&p.vy<0;
    if(floor?.type==='ground'){
      runningTicks++;
      if(next&&next.x-p.x<=p.w/2+p.vx*.32)jump=true;
    }
    step(run,{jump,right:true});
    assert.equal(run.lives,3,'a strong rebound cannot force an unavoidable front hit');
    if(p.groundPlatformId==='section-2'){reached=true;break;}
  }
  assert.ok(reached,'the real opening route reaches the return cushion');
  assert.ok(runningTicks>=12,'even this extreme arrival offers actual grounded steps before jumping');
});

test('hero pickups appear rarely at identical active times on the same course and restart cleanly', () => {
  const a=flatRun(),b=flatRun();
  for(const run of [a,b]){
    run.platforms[0].type='ground';run.platforms[0].y1=run.platforms[0].y2=550;run.player.y=550;
    run.nextPowerupTick=3600;
  }
  const appearances=[];let lastId=null;
  for(let i=0;i<90*120;i++){
    step(a,NONE);step(b,NONE);
    assert.ok(a.powerups.length<=1,'only one uncollected pickup can be ahead');
    const item=a.powerups[0];
    if(item&&item.id!==lastId){
      appearances.push(a.scoreTicks);lastId=item.id;
      assert.equal(item.type,'hero');assert.equal(item.w,42);assert.equal(item.h,42);
      assert.equal(item.y+item.h/2,505,'the collectible sits within a standing or hopping body');
      assert.ok(item.x-a.player.x>=650&&item.x-a.player.x<=850,'the item is visible well before collection');
    }
  }
  assert.deepEqual(appearances,[3600,10200],'the first pickup is at30 seconds, then at least55 seconds later');
  assert.deepEqual(a,b,'pickups and flight replay deterministically for every player');
  const fresh=createRun();assert.equal(fresh.player.flightTicks,0);assert.deepEqual(fresh.powerups,[]);
  assert.equal(fresh.nextPowerupTick,3600);
});

test('collecting a hero pickup grants exactly seven active seconds of protected flight and a safe forward return', () => {
  const run=flatRun();run.platforms[0].type='ground';run.platforms[0].y1=run.platforms[0].y2=550;
  Object.assign(run.player,{y:550,combo:4,jumpCharge:3});run.bonusPoints=200;run.nextPowerupTick=1e9;
  run.powerups=[{id:'test-hero',type:'hero',x:run.player.x-21,y:490,w:42,h:42}];
  step(run,NONE);
  assert.equal(run.player.flightTicks,840,'collection starts the complete seven-second effect');
  assert.equal(run.player.motion,'fly');assert.equal(run.powerups.length,0);
  assert.ok(run.events.some(e=>e.type==='hero-start'&&e.duration===7));
  assert.equal(hit(run,'sausage'),false,'hero protection is enforced by the simulation');
  const camera=run.cameraX,scoreTicks=run.scoreTicks;
  for(let i=0;i<839;i++){
    step(run,{jump:i%2===0});
    assert.equal(run.player.motion,'fly');assert.ok(run.player.flightTicks>0);
    assert.equal(run.lives,3);assert.equal(run.player.combo,4);assert.equal(run.player.jumpCharge,3);
    const bounds=screenBounds(run);assert.ok(bounds.top>=100-1e-6&&bounds.bottom<=RESCUE_Y+1e-6);
  }
  assert.equal(run.player.flightTicks,1);
  step(run,NONE);
  assert.equal(run.player.flightTicks,0);assert.ok(run.player.onGround);
  assert.equal(run.player.groundPlatformId,'test-floor');assert.equal(run.player.y,550);
  assert.ok(run.cameraX-camera>=7000,'the flight advances several full screens');
  assert.equal(run.scoreTicks-scoreTicks,840);assert.equal(run.bonusPoints,200);
  assert.equal(run.player.combo,4);assert.equal(run.player.jumpCharge,3);
  assert.ok(run.player.invulnerable>0,'return leaves a short protected landing');
  assert.ok(run.events.some(e=>e.type==='hero-end'));
});

test('hero flight steers within the screen and descends smoothly onto a broad forward pad beyond a gap', () => {
  for(const direction of ['left','right']){
    const run=flatRun();
    run.platforms=[{id:'launch-ground',type:'ground',x:-1000,w:7500,y1:550,y2:550},
      {id:'safe-exit',type:'pad',x:8500,w:2200,y1:435,y2:435}];
    Object.assign(run.player,{y:550,combo:4,jumpCharge:3,groundPlatformId:'launch-ground'});
    run.powerups=[{id:'test-flight',type:'hero',x:run.player.x-20,y:490,w:42,h:42}];
    step(run,NONE);let lastX=run.player.x,lastY=run.player.y;
    for(let i=0;i<840;i++){
      step(run,{[direction]:true,jump:true});
      assert.ok(run.player.x>=lastX,'the effect never teleports backwards');
      assert.ok(Math.abs(run.player.y-lastY)<10,'takeoff and descent do not vertically snap');
      assert.ok(run.player.screenX>=MIN_SCREEN_X-1e-6&&run.player.screenX<=MAX_SCREEN_X+1e-6);
      const bounds=screenBounds(run);assert.ok(bounds.top>=100-1e-6&&bounds.bottom<=RESCUE_Y+1e-6);
      lastX=run.player.x;lastY=run.player.y;
    }
    assert.equal(run.player.flightTicks,0);assert.equal(run.player.groundPlatformId,'safe-exit');
    assert.ok(run.player.x>=8650&&run.player.x<=10480,'the exit leaves room on a wide landing');
    assert.equal(run.player.y,435);assert.equal(run.player.combo,4);assert.equal(run.player.jumpCharge,3);
    assert.equal(run.player.contactEligible,false,'automatic return cannot claim or fail a perfect landing');
    ticks(run,PAD_COMPRESSION_TICKS+1,{jump:true});
    assert.equal(run.player.combo,4);assert.equal(run.player.jumpCharge,3);
    assert.equal(run.bonusPoints,0);assert.equal(run.lives,3);
  }
});

test('hero flight extends the real generated course before selecting a broad landing beyond the usual horizon', () => {
  const run=createRun(),p=run.player,x=19430;
  Object.assign(run,{cameraX:x-220,ticks:36000,scoreTicks:36000,nextPowerupTick:1e9});
  Object.assign(p,{x,y:300,onGround:false,groundPlatformId:null});
  step(run,NONE);
  const source=run.platforms.find(floor=>x>=floor.x&&x<=floor.x+floor.w);
  assert.equal(source.id,'section-17');assert.equal(source.type,'pad');
  assert.ok(source.w>=600&&!source.hazard,'the real course permits a pickup here');
  Object.assign(p,{x:x-run.baseSpeed*STEP,y:source.y1,onGround:true,
    groundPlatformId:source.id,vy:0,combo:4,jumpCharge:3});
  run.powerups=[{id:'real-collect',type:'hero',x:x-21,y:source.y1-66,w:42,h:42}];
  step(run,NONE);
  assert.equal(p.flightTicks,840,'the pickup is collected through the ordinary collision path');
  const initialX=p.x;
  for(let i=0;i<840;i++){
    const oldX=p.x;
    step(run,{right:true});
    assert.ok(p.x>=oldX,'extending the course never moves the player backwards');
    assert.equal(run.lives,3,'landing planning cannot cause an involuntary life loss');
  }
  const landing=run.platforms.find(floor=>floor.id===p.groundPlatformId);
  assert.equal(p.flightTicks,0);assert.ok(p.onGround);
  assert.ok(landing&&['pad','ground'].includes(landing.type)&&landing.w>=600);
  assert.ok(p.x>=landing.x+150&&landing.x+landing.w-p.x>=220);
  assert.ok(p.x-initialX>=7000,'the full flight still advances far along the genuine course');
  assert.equal(p.combo,4);assert.equal(p.jumpCharge,3);
  assert.ok(p.invulnerable>=1.2);assert.equal(run.recoveryTicks,0);
});

test('missed pickups are pruned and an ended flight cannot advance or leak into a new round', () => {
  const run=flatRun();run.powerups=[{id:'missed',type:'hero',x:-500,y:100,w:42,h:42}];
  step(run,NONE);assert.deepEqual(run.powerups,[],'missed icons do not accumulate behind the camera');
  run.powerups=[{id:'collected',type:'hero',x:run.player.x-21,y:run.player.y-60,w:42,h:42}];
  step(run,NONE);assert.equal(run.player.flightTicks,840);
  run.status='ended';const ended=clone(run);ticks(run,120,{jump:true,right:true});
  assert.deepEqual(run,ended,'an ended attempt freezes flight and pickup scheduling');
  const fresh=createRun();assert.equal(fresh.player.flightTicks,0);assert.equal(fresh.player.flightLandingId,null);
  assert.deepEqual(fresh.powerups,[]);assert.equal(fresh.nextPowerupTick,3600);
});

test('the first ground run gives an early frisbee warning and room to dodge before returning to the cushion', () => {
  const run=createRun();let firstWarning=null,reachedReturn=false;
  for(let i=0;i<16*120;i++){
    const input=referenceInput(run);
    step(run,input);
    for(const event of run.events)if(event.type==='warning'&&firstWarning===null)firstWarning=event;
    run.events.length=0;
    assert.equal(run.lives,3,'the early flying hazard and the next raised cushion have a safe input route');
    if(run.player.groundPlatformId==='section-2')reachedReturn=true;
  }
  assert.ok(firstWarning&&firstWarning.hazard==='frisbee','the introduction includes a frisbee rather than20 empty seconds');
  assert.ok(firstWarning.tick>=8*120&&firstWarning.tick<=14*120,'the first warning follows the calm opening');
  assert.ok(reachedReturn,'the player can still jump safely onto the return cushion');
});

test('long safe hazard sections send several well-spaced warnings after a calm eight-second opening', () => {
  const run=flatRun();Object.assign(run.platforms[0],{type:'pad',hazard:'sausage',hazardStart:120});
  run.player.invulnerable=1000;
  const warnings=[];
  for(let i=0;i<15*120;i++){
    step(run,NONE);
    for(const event of run.events)if(event.type==='warning')warnings.push(event.tick);
    run.events.length=0;
  }
  assert.ok(warnings.length>=3,'long sections can send more than one flying hazard');
  assert.ok(warnings[0]>=8*120,'the first eight seconds remain free of hazards');
  for(let i=1;i<warnings.length;i++){
    assert.ok(warnings[i]-warnings[i-1]>=3*120,'warnings leave time to react');
    assert.ok(warnings[i]-warnings[i-1]<=4*120,'there are no old seven-second gaps on an eligible long section');
  }
  assert.equal(run.lives,3);
});

test('same course and same held inputs reproduce an identical complete result', () => {
  assert.equal(STEP, 1 / 120);
  const a = createRun();
  const b = createRun();
  assert.equal(a.lives, 3);
  for (let i = 0; i < 24000; i++) {
    const input = { jump: i % 163 < 36,
      left: i % 431 < 80, right: i % 431 >= 220 && i % 431 < 300 };
    step(a, input);
    step(b, input);
  }
  assert.deepEqual(a, b, 'the browser and a replay can produce the same simulation state');
  assert.equal(a.status, 'ended', 'an unskilled repeating input sequence eventually exhausts three lives');
});

test('a held jump rises higher than a short tap, and holding never repeats the jump', () => {
  const tap = flatRun();
  const hold = flatRun();
  let tapTop = tap.player.y;
  let holdTop = hold.player.y;
  for (let i = 0; i < 240; i++) {
    step(tap, { jump: i < 2 });
    step(hold, { jump: true });
    tapTop = Math.min(tapTop, tap.player.y);
    holdTop = Math.min(holdTop, hold.player.y);
  }
  assert.ok(holdTop < tapTop - 25, `holding should create a useful higher jump: tap ${tapTop}, hold ${holdTop}`);
  assert.ok(tap.player.onGround && hold.player.onGround, 'both jumps finish on the ground');
  ticks(hold, 120, { jump: true });
  near(hold.player.y, 500, 'holding through landing must not bounce forever');
  step(hold, NONE);
  step(hold, { jump: true });
  assert.ok(hold.player.vy < 0 && !hold.player.onGround, 'a fresh press after release starts another jump');
});

test('pressing jump just before landing is buffered into the next takeoff', () => {
  const run = flatRun();
  Object.assign(run.player, { y: 491, vy: 300, onGround: false, groundPlatformId: null });
  step(run, { jump: true });
  assert.ok(!run.player.onGround, 'the first press is made above the surface');
  until(run, r => r.player.vy < 0, { jump: true }, 30);
  assert.ok(run.player.y <= 500 && !run.player.onGround);
  assert.equal(run.lives, 3);
});

test('a jump immediately after walking off an edge still responds', () => {
  const run = flatRun();
  run.platforms[0].x = 0;
  run.platforms[0].w = run.player.x + 12;
  until(run, r => !r.player.onGround, NONE, 60);
  step(run, { jump: true });
  assert.ok(run.player.vy < 0, 'a small timing error at the platform edge should be forgiven');
  assert.equal(run.lives, 3);
});

test('left and right respond on the ground and in the air while the course keeps scrolling', () => {
  for (const airborne of [false, true]) {
    const left = flatRun(), right = flatRun(), center = flatRun();
    for (const run of [left, right, center]) if (airborne) step(run, { jump: true });
    const screenStart = left.player.x - left.cameraX;
    ticks(left, 36, { jump: airborne, left: true });
    ticks(right, 36, { jump: airborne, right: true });
    ticks(center, 36, { jump: airborne });
    assert.ok(left.player.x - left.cameraX < screenStart - 25, 'left input visibly shifts the player left');
    assert.ok(right.player.x - right.cameraX > screenStart + 25, 'right input visibly shifts the player right');
    near(left.cameraX, right.cameraX, 'steering does not alter automatic course progress');
    near(left.cameraX, center.cameraX, 'holding back cannot stop the scrolling course');
    assert.equal(left.scoreTicks, right.scoreTicks);
    if (airborne) assert.ok(!left.player.onGround && !right.player.onGround);
  }
});

test('opposite steering inputs cancel, release brakes smoothly, and sustained steering stays within the screen band', () => {
  const both = flatRun();
  const screenStart = both.player.x - both.cameraX;
  ticks(both, 120, { left: true, right: true });
  near(both.player.x - both.cameraX, screenStart, 'simultaneous opposite inputs cancel');

  const released = flatRun();
  ticks(released, 36, { right: true });
  const atRelease = released.player.x - released.cameraX;
  ticks(released, 90);
  const afterBraking = released.player.x - released.cameraX;
  assert.ok(afterBraking >= atRelease && afterBraking < atRelease + 35, 'release removes steering drift promptly');
  ticks(released, 60);
  assert.ok(Math.abs(released.player.x - released.cameraX - afterBraking) < 1, 'released steering settles to rest');

  for (const side of ['left', 'right']) {
    const run = flatRun();
    for (let i = 0; i < 1200; i++) {
      step(run, { [side]: true });
      const screenX = run.player.x - run.cameraX;
      assert.ok(screenX >= 140 - 1e-6 && screenX <= 650 + 1e-6, 'the character cannot leave the playable screen band');
    }
    assert.ok(run.cameraX > 2500, 'even sustained left movement cannot farm a stationary part of the course');
    assert.equal(run.lives, 3);
  }
});

test('feet remain exactly on flat and sloping surfaces while moving across them', () => {
  const flat = flatRun();
  ticks(flat, 90);
  near(flat.player.y, 500, 'flat contact');
  const slide = flatRun();
  const platform = { id: 'test-slide', x: 0, w: 1600, y1: 350, y2: 560, type: 'slide' };
  slide.platforms = [platform];
  slide.player.y = surfaceAt(platform, slide.player.x);
  slide.player.groundPlatformId = platform.id;
  for (let i = 0; i < 180; i++) {
    step(slide, NONE);
    assert.ok(slide.player.onGround, 'the slide carries the character instead of dropping through it');
    near(slide.player.y, surfaceAt(platform, slide.player.x), 'sloping contact');
  }
  assert.ok(slide.player.y > 380, 'sliding moves the feet down the slope');
});

test('connected platform, slide and exit remain a continuous walkable surface', () => {
  const run = flatRun();
  run.platforms = [
    { id: 'entry', x: 0, w: 250, y1: 400, y2: 400, type: 'platform' },
    { id: 'slope', x: 250, w: 200, y1: 400, y2: 500, type: 'slide' },
    { id: 'exit', x: 450, w: 1500, y1: 500, y2: 500, type: 'platform' },
  ];
  Object.assign(run.player, { y: 400, groundPlatformId: 'entry' });
  for (let i = 0; i < 180; i++) {
    step(run, NONE);
    const underfoot = run.platforms.find(p => run.player.x >= p.x && run.player.x <= p.x + p.w);
    assert.ok(run.player.onGround, 'joints in the slide must not create a fall');
    near(run.player.y, surfaceAt(underfoot, run.player.x), 'connected surface contact');
  }
  assert.equal(run.player.groundPlatformId, 'exit');
  assert.equal(run.lives, 3);
});

test('every landing on the same cushion compresses and launches the player again', () => {
  const run = flatRun();
  run.platforms[0].type = 'pad';
  Object.assign(run.player, { y: 430, vy: 300, onGround: false, groundPlatformId: null });
  let launches = 0, compressions = 0, wasCompressing = false;
  for (let i = 0; i < 720 && launches < 3; i++) {
    step(run, NONE);
    const compressing = run.player.landingCompression > 0;
    if (compressing && !wasCompressing) compressions++;
    wasCompressing = compressing;
    launches += run.events.filter(event => event.type === 'jump' && event.kind === 'pad').length;
    run.events.length = 0;
  }
  assert.equal(launches, 3, 'the same cushion remains elastic on later landings');
  assert.ok(compressions >= 3, 'every rebound is preceded by visible compression');
  assert.ok(run.player.vy < 0 && !run.player.onGround);
  assert.equal(run.lives, 3);
});

test('a harder cushion landing stores more rebound energy than a gentle landing', () => {
  const speeds = [150, 850].map(impactSpeed => {
    const run = flatRun();
    run.platforms[0].type = 'pad';
    Object.assign(run.player, { y: 499, vy: impactSpeed, onGround: false, groundPlatformId: null });
    until(run, r => r.player.vy < 0, NONE, 90);
    return -run.player.vy;
  });
  assert.ok(speeds[1] > speeds[0] + 10,
    `landing impact affects the actual launch, not only the drawing: ${speeds.join(', ')}`);
});

test('a fresh jump press near cushion contact boosts the stored rebound', () => {
  const speeds = [false, true].map(boost => {
    const run = flatRun();
    run.platforms[0].type = 'pad';
    Object.assign(run.player, { y: 499, vy: 500, onGround: false, groundPlatformId: null });
    until(run, r => r.player.vy < 0, { jump: boost }, 90);
    return -run.player.vy;
  });
  assert.ok(speeds[1] > speeds[0] + 75, 'timing a new press at landing produces a meaningfully stronger bounce');
});

test('perfect timing includes exactly 100 ms before and 50 ms after a real pad landing', () => {
  const contactTick = firstContactTick();
  for (const offset of [-19, -18, -13, -12, 0, 6, 7, 9, 10]) {
    const run = fallingPadRun();
    for (let tick = 1; tick <= contactTick + PAD_COMPRESSION_TICKS + 2; tick++) {
      step(run, { jump: tick === contactTick + offset });
    }
    const perfect = offset >= -12 && offset <= 6;
    const expectedQuality = perfect ? 'perfect' : offset >= -18 && offset <= 9 ? 'good' : 'miss';
    assert.equal(run.player.combo, perfect ? 1 : 0, `first press ${offset} ticks relative to landing`);
    assert.equal(run.player.jumpCharge, perfect ? 1 : 0, 'only perfect timing builds the charge');
    assert.equal(run.bonusPoints, 0, 'one contact cannot award a five-hop streak bonus');
    const grades = run.events.filter(event => event.type === 'timing');
    assert.equal(grades.length, 1, 'a real landing receives one timing grade');
    assert.equal(grades[0].quality, expectedQuality, `feedback matches the boundary at offset ${offset}`);
  }
});

test('five consecutive perfect landings award exactly one 100-point bonus, and ten award exactly two', () => {
  const run = fallingPadRun();
  until(run, r => r.player.compressTicks === PAD_COMPRESSION_TICKS);
  for (let landing = 1; landing <= 10; landing++) {
    step(run, { jump: true });
    if (landing === 5) {
      for (let repeat = 0; repeat < 3; repeat++) {
        step(run, NONE);
        step(run, { jump: true });
      }
    }
    until(run, r => r.player.compressTicks === 0, NONE, 30);
    assert.equal(run.player.combo, landing);
    assert.equal(run.player.jumpCharge, Math.min(5, landing));
    assert.equal(run.bonusPoints, Math.floor(landing / 5) * 100,
      'the bonus is granted once at each fifth perfect landing');
    assert.equal(run.score, Math.floor(run.scoreTicks / 12) + run.bonusPoints);
    if (landing < 10) until(run, r => r.player.compressTicks === PAD_COMPRESSION_TICKS, NONE, 300);
  }
  assert.equal(run.lives, 3);
  assert.deepEqual(run.events.filter(event => event.type === 'bonus').map(event => ({ points: event.points, streak: event.streak })),
    [{ points: 100, streak: 5 }, { points: 100, streak: 10 }], 'each streak milestone emits its bonus exactly once');
});

test('holding HOP or replacing an early press with repeated taps cannot manufacture perfect chains', () => {
  const held = fallingPadRun();
  ticks(held, 1800, { jump: true });
  assert.equal(held.player.combo, 0);
  assert.equal(held.player.jumpCharge, 0);
  assert.equal(held.bonusPoints, 0, 'a held button cannot create a streak');

  const spammed = fallingPadRun();
  const contactTick = firstContactTick();
  for (let tick = 1; tick <= contactTick + PAD_COMPRESSION_TICKS; tick++) {
    // The first attempt is much too early. Later contact-time taps must not
    // replace it and turn a bad rhythm into a perfect landing.
    step(spammed, { jump: tick === 1 || (tick >= contactTick - 10 && tick % 2 === 0) });
  }
  assert.equal(spammed.player.combo, 0);
  assert.equal(spammed.player.jumpCharge, 0);
  assert.equal(spammed.bonusPoints, 0);
});

test('an unpressed landing breaks a perfect chain and cannot pay the next streak bonus', () => {
  const run = fallingPadRun();
  until(run, r => r.player.compressTicks === PAD_COMPRESSION_TICKS);
  for (let landing = 1; landing <= 4; landing++) {
    step(run, { jump: true });
    until(run, r => r.player.compressTicks === 0, NONE, 30);
    until(run, r => r.player.compressTicks === PAD_COMPRESSION_TICKS, NONE, 300);
  }
  assert.equal(run.player.combo, 4);
  until(run, r => r.player.compressTicks === 0, NONE, 30);
  assert.equal(run.player.combo, 0, 'an ungraded landing ends the consecutive perfect streak');
  assert.equal(run.bonusPoints, 0);
  until(run, r => r.player.compressTicks === PAD_COMPRESSION_TICKS, NONE, 300);
  step(run, { jump: true });
  until(run, r => r.player.compressTicks === 0, NONE, 30);
  assert.equal(run.player.combo, 1, 'the next perfect landing starts a new streak');
  assert.equal(run.bonusPoints, 0);
});

test('jump release changes acceleration smoothly and the camera follows a natural rise, apex and fall', () => {
  const run = flatRun();
  run.platforms[0].y1 = run.platforms[0].y2 = 300;
  run.player.y = 300;
  step(run, { jump: true });
  let previousVY = run.player.vy, previousY = run.player.y;
  let sawRise = false, sawFall = false, sawCameraFollow = false, apexCount = 0;
  for (let i = 0; i < 240 && !run.player.onGround; i++) {
    step(run, { jump: i < 20 });
    if (run.player.onGround) break;
    const deltaV = run.player.vy - previousVY;
    assert.ok(deltaV > 0 && deltaV < 50,
      `gravity should change velocity continuously without an artificial ceiling or release snap: ${deltaV}`);
    if (run.player.y < previousY) sawRise = true;
    if (run.player.y > previousY) sawFall = true;
    if (previousVY < 0 && run.player.vy >= 0) apexCount++;
    if (run.cameraY < 0) sawCameraFollow = true;
    const bounds = screenBounds(run);
    assert.ok(bounds.top >= 100 - 1e-6 && bounds.bottom <= RESCUE_Y + 1e-6);
    previousVY = run.player.vy; previousY = run.player.y;
  }
  assert.ok(sawRise && sawFall && sawCameraFollow, 'the natural arc rises high enough for the camera to follow');
  assert.equal(apexCount, 1);
  assert.ok(run.player.onGround);
  near(run.player.y, 300, 'the full arc returns to the surface');
});

test('running, rising and falling expose distinct movement states for the renderer', () => {
  const run = flatRun();
  step(run, NONE);
  const running = run.player.motion;
  step(run, { jump: true });
  const rising = run.player.motion;
  until(run, r => r.player.vy > 40, { jump: true }, 180);
  assert.ok(!run.player.onGround, 'the descending pose is sampled before landing');
  const falling = run.player.motion;
  for (const motion of [running, rising, falling]) assert.equal(typeof motion, 'string');
  assert.equal(new Set([running, rising, falling]).size, 3,
    'the renderer can distinguish running, upward flight and downward flight');
});

test('a steep slide creates extra speed that carries onto the level exit', () => {
  const run = flatRun();
  run.platforms = [
    { id: 'steep-slide', x: 0, w: 650, y1: 280, y2: 510, type: 'slide' },
    { id: 'level-exit', x: 650, w: 2000, y1: 510, y2: 510, type: 'platform' },
  ];
  Object.assign(run.player, {
    y: surfaceAt(run.platforms[0], run.player.x), groundPlatformId: 'steep-slide',
  });
  const initialSpeed = run.speed;
  let wasSliding = false, largestSpeed = initialSpeed;
  until(run, r => {
    wasSliding ||= r.player.sliding === true;
    largestSpeed = Math.max(largestSpeed, r.speed);
    return r.player.groundPlatformId === 'level-exit';
  }, NONE, 400);
  assert.ok(wasSliding, 'a slide has its own movement state');
  assert.ok(largestSpeed > initialSpeed + 40, 'descent gains actual horizontal speed');
  const exitSpeed = run.speed;
  ticks(run, 24);
  assert.ok(run.speed > initialSpeed + 25, 'momentum survives at least 0.2 seconds onto the exit');
  assert.ok(run.speed < exitSpeed, 'level-ground friction gradually removes slide momentum');
  assert.ok(run.player.onGround && !run.player.sliding);
  near(run.player.y, 510, 'the extra speed does not detach the feet from the exit');
  assert.equal(run.lives, 3);
});

test('slide momentum is capped and naturally decays on a flat surface', () => {
  const run = flatRun();
  run.platforms = [{ id: 'steep', x: 0, w: 650, y1: 280, y2: 510, type: 'slide' },
    { id: 'flat', x: 650, w: 10000, y1: 510, y2: 510, type: 'platform' }];
  Object.assign(run.player, { y: surfaceAt(run.platforms[0], run.player.x),
    groundPlatformId: 'steep', momentum: MAX_MOMENTUM - 1 });
  let reachedCap = false;
  until(run, r => {
    assert.ok(r.player.momentum <= MAX_MOMENTUM + 1e-6);
    reachedCap ||= r.player.momentum >= MAX_MOMENTUM - 0.01;
    return r.player.groundPlatformId === 'flat';
  }, NONE, 500);
  assert.ok(reachedCap, 'extra downhill acceleration stops at the momentum limit');
  const exitMomentum = run.player.momentum;
  ticks(run, 240);
  assert.ok(run.player.momentum < exitMomentum / 2, 'flat-ground drag dissipates the extra speed');
  assert.ok(run.speed >= run.baseSpeed, 'dissipation never slows the player below normal course speed');
});

test('deprecated roll input cannot duck, postpone a pad rebound, or alter an airborne run', () => {
  for (const mode of ['platform', 'pad', 'air']) {
    const ordinary = flatRun();
    if (mode === 'pad') ordinary.platforms[0].type = 'pad';
    if (mode === 'air') Object.assign(ordinary.player, {
      y: 300, vy: 100, onGround: false, groundPlatformId: null,
    });
    const deprecated = clone(ordinary);
    for (let i = 0; i < 720; i++) {
      const input = { jump: i % 137 === 60, left: i % 400 < 80, right: i % 400 > 280 };
      step(ordinary, input);
      step(deprecated, { ...input, roll: i % 17 < 12 });
    }
    assert.deepEqual(deprecated, ordinary, `old roll input has no effect in ${mode}`);
    assert.ok(!ordinary.events.some(event => event.type === 'roll'));
    assert.ok(!Object.keys(ordinary.player).some(key => /roll/i.test(key)), 'no duck or roll state remains');
  }
});

test('a head-height frisbee can be cleared with a jump and hits an unprotected standing player', () => {
  const jump = flatRun();
  const stand = flatRun();
  for (const run of [jump, stand]) {
    run.hazards = [{ id: 'frisbee', type: 'frisbee', x: run.player.x + 140, y: 432, w: 66, h: 24, vx: -165 }];
  }
  ticks(jump, 50, { jump: true });
  ticks(stand, 50);
  assert.equal(jump.lives, 3, 'jumping clears the frisbee without a duck move');
  assert.equal(stand.lives, 2, 'frisbees remain harmful');
});

test('a low sausage can be cleared with a jump and hits a standing player', () => {
  const jump = flatRun();
  const stand = flatRun();
  for (const run of [jump, stand]) {
    run.hazards = [{ id: 'sausage', type: 'sausage', x: run.player.x + 140, y: 470, w: 61, h: 29, vx: -190 }];
  }
  ticks(jump, 50, { jump: true });
  ticks(stand, 50);
  assert.equal(jump.lives, 3, 'jumping clears a low sausage');
  assert.equal(stand.lives, 2, 'sausages remain harmful');
});

test('simultaneous projectile contacts emit one AV! and take only one life', () => {
  const run = flatRun();
  run.hazards = ['frisbee', 'sausage'].map((type, id) => ({
    id, type, x: run.player.x, y: 450, w: 60, h: 40, vx: 0,
  }));
  step(run, NONE);
  assert.equal(run.lives, 2);
  const impacts = run.events.filter(event => event.type === 'hit');
  assert.equal(impacts.length, 1);
  assert.equal(impacts[0].text, 'AV!');
  assert.equal(run.hazards.length, 0, 'contacted projectiles cannot repeatedly hit the same player');
});

test('frisbees and sausages still spawn and approach when their floor is a bouncing pad', () => {
  for (const type of ['frisbee', 'sausage']) {
    const run = flatRun();
    run.scoreTicks = 20 * 120;
    Object.assign(run.platforms[0], { x: 0, w: 3000, type: 'pad', hazard: type,
      hazardStart: 120, hazardSpawned: false });
    step(run, NONE);
    assert.equal(run.hazards.length, 1, `${type} is not lost when flat floors become inflatable`);
    assert.equal(run.hazards[0].type, type);
    assert.ok(run.events.some(event => event.type === 'warning'), 'the approach still provides a warning');
    const initialX = run.hazards[0].x;
    ticks(run, 30);
    assert.equal(run.hazards.length, 1, 'the approaching projectile remains visible before contact');
    assert.ok(run.hazards[0].x < initialX, 'the projectile travels toward the player');
  }
});

test('damage costs one life, clears power and combo, forces falling, and prevents repeated damage', () => {
  const run = flatRun();
  Object.assign(run.player, { y: 330, vy: -600, onGround: false, combo: 8, bouncePower: 3,
    jumpCharge: 5, momentum: 180 });
  hit(run, 'frisbee');
  assert.equal(run.lives, 2);
  assert.equal(run.player.combo, 0);
  assert.equal(run.player.bouncePower, 1);
  assert.equal(run.player.jumpCharge, 0);
  assert.equal(run.player.momentum, 0, 'damage also removes accumulated slide momentum');
  assert.ok(run.player.vy > 0, 'damage immediately changes an ascending jump to a fall');
  assert.ok(run.player.invulnerable > 0 && run.player.hurt > 0);
  hit(run, 'sausage');
  assert.equal(run.lives, 2, 'simultaneous objects cannot remove another life');
  until(run, r => r.player.invulnerable <= 0, NONE, 300);
  hit(run, 'sausage');
  assert.equal(run.lives, 1, 'damage resumes when the visible protection expires');
  until(run, r => r.player.invulnerable <= 0, NONE, 300);
  hit(run, 'frisbee');
  assert.equal(run.lives, 0);
  assert.equal(run.status, 'ended');
  const ended = clone(run);
  ticks(run, 120, { jump: true });
  assert.deepEqual(run, ended, 'a finished round cannot gain time or continue moving');
});

test('missing a platform costs one life and safely rescues forward without scoring during recovery', () => {
  const run = flatRun();
  run.platforms = [{ id: 'safe-landing', x: run.player.x + 180, w: 1800, y1: 500, y2: 500, type: 'platform' }];
  Object.assign(run.player, { y: RESCUE_Y - 1, vy: 450, onGround: false, groundPlatformId: null });
  const oldX = run.player.x;
  step(run, NONE);
  assert.equal(run.lives, 2);
  assert.ok(run.player.x >= oldX, 'the rescue cannot move the player backwards');
  assert.ok(run.player.onGround, 'the player is restored to a real platform');
  assert.ok(screenBounds(run).bottom <= RESCUE_Y);
  assert.ok(run.recoveryTicks > 0, 'the player gets a short safe recovery period');
  const score = run.scoreTicks;
  const distance = run.distance;
  const remaining = run.recoveryTicks;
  ticks(run, remaining);
  assert.equal(run.scoreTicks, score, 'rescue time is excluded from survival score');
  assert.equal(run.distance, distance, 'rescue freezes course progress');
  assert.equal(run.lives, 2, 'recovery never causes an extra life loss');
});

test('falling after a projectile hit does not charge a second life during protection', () => {
  const run = flatRun();
  run.platforms = [{ id: 'safe-landing', x: run.player.x + 180, w: 1800, y1: 500, y2: 500, type: 'platform' }];
  Object.assign(run.player, { y: RESCUE_Y - 1, vy: -200, onGround: false, groundPlatformId: null });
  hit(run, 'frisbee');
  assert.equal(run.lives, 2);
  step(run, NONE);
  assert.equal(run.lives, 2, 'the forced fall and its rescue are part of the same damage incident');
  assert.ok(run.player.onGround && screenBounds(run).bottom <= RESCUE_Y);
});

test('a missed landing on the last life ends above the mobile controls with the whole player visible', () => {
  assert.ok(RESCUE_Y <= 570, 'the player must stop above the touch controls near logical y=575');
  const run = flatRun();
  run.lives = 1;
  run.platforms = [{ id: 'too-far', x: run.player.x + 180, w: 1800, y1: 500, y2: 500, type: 'platform' }];
  Object.assign(run.player, { y: RESCUE_Y - 1, vy: 450, onGround: false, groundPlatformId: null });
  step(run, NONE);
  assert.equal(run.status, 'ended');
  assert.equal(run.lives, 0);
  const bounds = screenBounds(run);
  assert.ok(bounds.top >= 100);
  assert.ok(bounds.bottom <= RESCUE_Y && bounds.bottom <= 570,
    'the final fall freezes visibly instead of behind the phone buttons');
  const ended = clone(run);
  ticks(run, 60);
  assert.deepEqual(run, ended, 'the final pose cannot fall farther after game over');
});

test('a minute of jumping and side movement keeps the full character in view', () => {
  const run = flatRun();
  for (let i = 0; i < 7200; i++) {
    step(run, { jump: i % 160 < 60, left: i % 600 < 150, right: i % 600 > 450 });
    const bounds = screenBounds(run);
    assert.ok(bounds.top >= 100 - 1e-6, `head stays in view on tick ${i}`);
    assert.ok(bounds.bottom <= RESCUE_Y + 1e-6, `feet stay above controls on tick ${i}`);
    assert.ok(run.player.screenX >= MIN_SCREEN_X - 1e-6 && run.player.screenX <= MAX_SCREEN_X + 1e-6,
      'side movement keeps the character within the safe band');
  }
  assert.equal(run.lives, 3, 'a safe floor does not injure the player');
});

function referenceInput(run) {
  const p = run.player;
  const floor = run.platforms.find(platform => platform.id === p.groundPlatformId);
  let jump = p.jumpKind === 'manual' && p.vy < 0;
  if (p.onGround && floor && floor.type !== 'pad') {
    const next = run.platforms.find(platform => platform.x > floor.x);
    if (next && next.x > floor.x + floor.w + 0.1 && floor.x + floor.w - p.x < 55) jump = true;
    if (floor.type === 'ground' && next && next.type === 'pad' &&
      next.x-p.x <= p.w/2+p.vx*.32) jump = true;
  }
  const approaching = run.hazards.find(hazard => hazard.x > p.x - 30 && hazard.x - p.x < 95);
  if (approaching && p.onGround && (approaching.type === 'sausage' || floor?.type === 'ground')) jump = true;
  return { jump };
}

function choosePadBoost(run, targetX, depth = 7, budget = { nodes: 0 }) {
  // Explore only the two legal choices at a cushion contact: ordinary rebound
  // or a fresh HOP. Cloned simulations use unchanged physics, lives and hazards.
  assert.ok(++budget.nodes < 2000, 'reference planning must stay bounded');
  let best = -Infinity, bestBoost = false;
  for (const boost of [false, true]) {
    const trial = structuredClone(run);
    trial.events.length = 0;
    const lives = trial.lives;
    step(trial, { jump: boost });
    for (let i = 0; i < 1000; i++) {
      if (trial.lives !== lives || trial.status !== 'running') break;
      if (trial.player.x > targetX && trial.player.onGround && trial.player.compressTicks === 0) {
        return { score: 1e6, boost };
      }
      if (trial.player.compressTicks === PAD_COMPRESSION_TICKS) {
        const score = depth > 0 ? choosePadBoost(trial, targetX, depth - 1, budget).score : trial.player.x;
        if (score > best) { best = score; bestBoost = boost; }
        break;
      }
      step(trial, referenceInput(trial));
      trial.events.length = 0;
    }
  }
  return { score: best, boost: bestBoost };
}

test('the higher generated terrain has a route without ducking from opening and maximum speed', () => {
  // Bounded lookahead proves an input-controlled route exists. It knows precise
  // geometry and future physics, so it does not establish child-friendly timing.
  for (const startAtMaximum of [false, true]) {
    const run = createRun();
    const initialScore = startAtMaximum ? 300 * 120 : 0;
    const duration = startAtMaximum ? 60 : 220;
    if (startAtMaximum) {
      run.ticks = run.scoreTicks = initialScore;
      run.baseSpeed = run.speed = run.player.vx = MAX_SPEED;
    }
    let minStandingHeight = Infinity, largestSlideDrop = 0;
    for (let i = 0; i < duration * 120; i++) {
      const input = referenceInput(run);
      const floor = run.platforms.find(platform => platform.id === run.player.groundPlatformId);
      if (run.player.compressTicks === PAD_COMPRESSION_TICKS) {
        input.jump = choosePadBoost(run, floor.x + floor.w + 150).boost;
      }
      step(run, input);
      assert.ok(run.platforms.every(platform => ['pad','slide','ground'].includes(platform.type)),
        'the generated course contains cushions, slides and explicit running ground');
      assert.equal(run.lives, 3,
        `${startAtMaximum ? 'maximum' : 'opening'} reference route must stay safe at ${Math.round(i * STEP)} seconds`);
      const bounds = screenBounds(run);
      assert.ok(bounds.top >= 100 - 1e-6 && bounds.bottom <= RESCUE_Y + 1e-6);
      if (run.player.onGround) minStandingHeight = Math.min(minStandingHeight, run.player.y);
      if (run.player.sliding && floor) largestSlideDrop = Math.max(largestSlideDrop, floor.y2 - floor.y1);
      run.events.length = 0;
    }
    assert.equal(run.status, 'running');
    assert.equal(run.baseSpeed, MAX_SPEED, 'the route includes maximum base speed plus slide momentum');
    assert.equal(run.scoreTicks, initialScore + duration * 120, 'the route needs no rescues or pauses');
    assert.ok(minStandingHeight <= 300, 'the reference player really reaches the high platforms');
    assert.ok(largestSlideDrop >= 200, 'the reference player really takes a large downhill slide');
  }
});

test('difficulty increases then reaches a stable speed cap during a long run', () => {
  const run = flatRun();
  const initialSpeed = run.speed;
  ticks(run, 120 * 300);
  const cappedSpeed = run.speed;
  assert.ok(cappedSpeed > initialSpeed, 'the opening is slower than the late course');
  ticks(run, 120 * 300);
  near(run.speed, cappedSpeed, 'late speed has a ceiling instead of rising indefinitely');
  assert.equal(run.status, 'running', 'survival has no artificial time limit');
  assert.equal(run.scoreTicks, 120 * 600, 'all unpaused safe play contributes to the survival score');
});
