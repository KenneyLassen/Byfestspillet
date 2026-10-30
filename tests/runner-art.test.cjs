// Real pose/placement logic with synthetic transparent pixels; pixel aesthetics
// and the generated production artwork are inspected separately in the browser.
const test = require('node:test');
const assert = require('node:assert/strict');
const Art = require('../runner-art.js');
const Core = require('../runner-core.js');

test('running steps follow travel only during foot contact and yield to takeoff, flight, hurt and slides', () => {
  const player={x:220,vx:270,onGround:true,compressTicks:8,hurt:0,sliding:false};
  assert.equal(Art.runPoseIndex(player,0),1);
  player.x=230;assert.equal(Art.runPoseIndex(player,.99),1);
  player.x=240;assert.equal(Art.runPoseIndex(player,1.01),2);
  assert.equal(Art.runPoseIndex(player,1.01),2,'a held visual phase keeps its frame');
  for(const change of [{onGround:false},{sliding:true},{hurt:.3},{compressTicks:2}]){
    assert.equal(Art.runPoseIndex({...player,...change}),null);
  }
  assert.equal(Art.runPoseIndex({...player,compressTicks:0,vx:0}),0,'stationary contact uses calibration');
  const a=Core.createRun(),b=Core.createRun(),contactFrames=new Set();
  for(let i=0;i<240;i++){
    const frame=Art.runPoseIndex(a.player,i/120*9);
    if(frame!==null)contactFrames.add(frame);
    Core.step(a,{});Core.step(b,{});
  }
  assert.ok(contactFrames.size>=2,'real short pad contacts show moving steps');
  assert.deepEqual(a,b,'visual steps leave the complete simulation unchanged');
});

test('foreground trees are sparse world-anchored passages on long low pads after the introduction', () => {
  const pads=[{id:'start',type:'pad',x:0,w:1900,y1:510,y2:510},
    {id:'high',type:'pad',x:2100,w:1000,y1:355,y2:355},
    {id:'low',type:'pad',x:3200,w:1700,y1:515,y2:515},
    {id:'short',type:'pad',x:5000,w:500,y1:510,y2:510},
    {id:'slope',type:'slide',x:5600,w:900,y1:300,y2:515}];
  const before=JSON.stringify(pads);
  assert.deepEqual(Art.foregroundTrees(pads),[{x:3550,y:590,height:434,variant:2}]);
  assert.deepEqual(Art.foregroundTrees(pads.slice(2)),[{x:3550,y:590,height:434,variant:2}],
    'pruning old course sections does not move the foreground tree');
  assert.equal(JSON.stringify(pads),before);
});

test('sponsor slots stay inside pad fronts, below the landing edge and stable while the pad compresses', () => {
  const pad={id:'low',type:'pad',x:3200,w:1000,y1:515,y2:515};
  const slots=Art.sponsorSlots(pad,0),compressed=Art.sponsorSlots(pad,11);
  assert.deepEqual(slots.map(s=>[s.x,s.y,s.w,s.h]),[[3300,529,200,38],[3740,529,200,38]]);
  assert.deepEqual(compressed.map(s=>[s.x,s.y,s.w,s.h]),[[3300,540,200,38],[3740,540,200,38]]);
  assert.deepEqual(Art.sponsorSlots({...pad,type:'slide',y2:570},0),[]);
  assert.deepEqual(Art.sponsorSlots({...pad,w:200},0),[]);
  assert.ok(slots.every(s=>s.y+s.h<=578));
});

test('bunting stays attached to its sagging cord while wind gently moves the cloth', () => {
  const still=Art.flagLayout(0,true),early=Art.flagLayout(0,false),later=Art.flagLayout(2,false);
  assert.equal(still.length,21);
  assert.deepEqual(still[10],{x:600,y:205,angle:0,variant:2});
  assert.ok(early.some((flag,i)=>Math.abs(flag.angle-later[i].angle)>.01),'wind changes the flags over time');
  for(let i=0;i<still.length;i++){
    assert.equal(early[i].x,still[i].x);
    assert.equal(early[i].y,still[i].y,'attachment point remains on the cord');
    assert.ok(Math.abs(early[i].angle-still[i].angle)<=.065);
    assert.ok(Math.abs(later[i].angle-still[i].angle)<=.065);
  }
  assert.deepEqual(Art.flagLayout(1000,true),still,'reduced motion has no flutter');
});

test('repeating bunting has fixed world anchors and stable cloth identity in every cord section', () => {
  const next=Art.flagLayout(2,false,1),far=Art.flagLayout(2,false,7);
  assert.equal(next[10].x,1800);
  assert.equal(next[10].y,205);
  assert.equal(next[10].variant,3);
  assert.equal(far[10].x,9000);
  assert.equal(far[10].y,205);
  assert.equal(far[10].variant,1);
  assert.deepEqual(Art.flagLayout(1000,true,1).map(f=>[f.x,f.y,f.variant]),
    next.map(f=>[f.x,f.y,f.variant]),'wind and reduced motion never move cord attachments');
  const first=Art.flagLayout(2,false,0);
  assert.notEqual(first[10].angle,next[10].angle,'wind phase belongs to the world flag, not its screen slot');
});

function atlasPixels() {
  // Uneven dimensions exercise the last row/column without rounding away pixels.
  const width = 97, height = 95, pixels = new Uint8ClampedArray(width * height * 4);
  const boxes = [];
  function color(x, y, rgba) { pixels.set(rgba, (y * width + x) * 4); }
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const index = row * 3 + col;
    const x0 = Math.floor(col * width / 3), y0 = Math.floor(row * height / 3);
    const left = x0 + 5 + index % 2, top = y0 + 3;
    const h = index === 7 || index === 8 ? 13 : index === 4 ? 24 : 20;
    for (let y = top; y < top + h - 2; y++) for (let x = left; x < left + 13; x++) {
      color(x, y, [220, 50, 20, 255]);
    }
    // Offset white shoes: the contact anchor must follow these, not crop center.
    for (let y = top + h - 2; y < top + h; y++) for (let x = left + 6; x < left + 16; x++) {
      color(x, y, [255, 255, 255, 255]);
    }
    color(x0, y0, [0, 0, 0, 20]); // faint stray shadow must not enlarge crop
    boxes.push({ left, top, w: 16, h, footX: left + 11, footY: top + h });
  }
  return { pixels, width, height, boxes };
}

test('seated artwork uses its standing calibration scale and a seat anchor rather than shrinking to the low collision body', () => {
  const width=120,height=120,pixels=new Uint8ClampedArray(width*height*4);
  for(let i=0;i<4;i++){
    const x=(i%2)*60+10,y=Math.floor(i/2)*60+5;
    const w=i===0?18:40,h=i===0?40:28;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels.set([220,45,30,255],(yy*width+xx)*4);
  }
  const atlas=Art.atlasFromPixels(pixels,width,height,{columns:2,rows:2,
    anchors:[null,{x:20,y:33},{x:20,y:33},{x:20,y:33}]});
  assert.ok(atlas,'a four-pose seated sheet is usable');
  assert.equal(atlas.frames.length,4);
  assert.equal(atlas.scale,1.75,'the 40px standing calibration is displayed at 70 world pixels');
  const standing=Art.framePlacement(atlas,0,220,355);
  const seated=Art.framePlacement(atlas,2,0,0);
  assert.equal(standing.dh,70);
  assert.equal(seated.dw,70,'extended seated legs keep their anatomical scale');
  assert.equal(seated.dh,49,'seated silhouette height comes from posture, independent of the 42px collision height');
  assert.equal(seated.dx,-17.5);
  assert.equal(seated.dy,-49);
  const before=pixels.slice();
  Art.framePlacement(atlas,3,0,0);
  assert.deepEqual(pixels,before);
});

test('documented nonuniform sheet divisions keep extended shoes inside their own frame', () => {
  const pixels=new Uint8ClampedArray(120*120*4);
  for(const [left,top,w,h] of [[10,5,18,40],[80,5,35,60],[10,80,55,30],[80,80,35,30]]){
    for(let y=top;y<top+h;y++)for(let x=left;x<left+w;x++)pixels.set([220,40,30,255],(y*120+x)*4);
  }
  const atlas=Art.atlasFromPixels(pixels,120,120,{columns:2,rows:2,columnEdges:[0,70,120],rowEdges:[0,70,120]});
  assert.deepEqual(atlas.frames.map(f=>[f.x,f.y,f.w,f.h]),[[10,5,18,40],[80,5,35,60],[10,80,55,30],[80,80,35,30]]);
});

test('RGB checkerboard masking clears edge-connected background and preserves outlined white shoe and eye details', () => {
  const width = 90, height = 90, source = new Uint8ClampedArray(width * height * 4);
  const offset = (x, y) => (y * width + x) * 4;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const grey = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 ? 190 : 230;
    source.set([grey, grey, grey, 255], offset(x, y));
  }
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const left = col * 30 + 5, top = row * 30 + 5;
    for (let y = top; y < top + 20; y++) for (let x = left; x < left + 15; x++) {
      // A dark enclosing outline protects neutral-white pixels in the figure.
      const border = x === left || x === left + 14 || y === top || y === top + 19;
      source.set(border ? [40, 25, 15, 255] : [240, 45, 35, 255], offset(x, y));
    }
    source.set([255, 255, 255, 255], offset(left + 8, top + 3));
    source.set([240, 240, 245, 255], offset(left + 8, top + 17));
  }
  const original = source.slice();
  const masked = Art.maskAtlasBackground(source, width, height);
  assert.notEqual(masked, source);
  assert.deepEqual(source, original, 'masking never changes master pixels');
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const left = col * 30 + 5, top = row * 30 + 5;
    assert.equal(masked[offset(col * 30, row * 30) + 3], 0, 'each grid cell has transparent background');
    assert.equal(masked[offset(left - 1, top + 10) + 3], 0, 'connected background next to the outline is cleared');
    assert.equal(masked[offset(left, top) + 3], 255, 'dark outline remains opaque');
    assert.deepEqual([...masked.slice(offset(left + 8, top + 3), offset(left + 8, top + 3) + 4)], [255, 255, 255, 255]);
    assert.deepEqual([...masked.slice(offset(left + 8, top + 17), offset(left + 8, top + 17) + 4)], [240, 240, 245, 255]);
  }
  const atlas = Art.atlasFromPixels(masked, width, height);
  assert.ok(atlas);
  assert.equal(atlas.frames.length, 9);
});

test('genuine alpha sprites bypass background masking without damaging semi-transparent edges or white details', () => {
  const { pixels, width, height } = atlasPixels();
  pixels.set([230, 230, 230, 120], 4 * 2);
  const original = pixels.slice();
  const masked = Art.maskAtlasBackground(pixels, width, height);
  assert.notEqual(masked, pixels, 'cache owns a separate pixel buffer');
  assert.deepEqual(masked, original, 'all original colors and alpha values remain exact');
  assert.deepEqual(pixels, original);
  assert.equal(masked[4 * 2 + 3], 120);
});

test('a real spring follows landing, takeoff, ascent and descent without changing physics', () => {
  const run = Core.createRun();
  run.platforms = [{ id: 'start', x: 0, w: 20000, y1: 510, y2: 510, type: 'pad' }];
  run.generatedTo = 20000;
  run.nextHazardTick = 100000;
  const observed = [];
  const withArt = JSON.parse(JSON.stringify(run)), physicsOnly = JSON.parse(JSON.stringify(run));
  for (let tick = 0; tick < 220; tick++) {
    const before = JSON.stringify(withArt);
    const name = Art.POSES[Art.poseIndex(withArt.player)];
    assert.equal(JSON.stringify(withArt), before, 'pose selection does not write state');
    if (observed.at(-1) !== name) observed.push(name);
    Core.step(withArt, {});
    Core.step(physicsOnly, {});
  }
  assert.deepEqual(withArt, physicsOnly, 'render selection leaves every simulation field unchanged');
  const firstCycle = ['neutral', 'land-1', 'land-2', 'takeoff-1', 'takeoff-2', 'rise-1', 'rise-2', 'fall-1', 'fall-2', 'land-1'];
  assert.deepEqual(observed.slice(0, firstCycle.length), firstCycle);
  assert.equal(withArt.rulesVersion, 'hop-og-rul-physics-4');
});

test('launch strength changes ascent timing while falling off an edge does not invent a takeoff', () => {
  const player = { onGround: false, jumpKind: 'pad', jumpHoldTicks: 20, lastLaunchSpeed: 1000, vy: -500 };
  assert.equal(Art.POSES[Art.poseIndex(player)], 'rise-1');
  player.lastLaunchSpeed = 600;
  player.vy = -250;
  assert.equal(Art.POSES[Art.poseIndex(player)], 'rise-2');
  Object.assign(player, { jumpKind: null, jumpHoldTicks: 0, vy: 20 });
  assert.equal(Art.POSES[Art.poseIndex(player)], 'fall-1');
  player.vy = 650;
  assert.equal(Art.POSES[Art.poseIndex(player)], 'fall-2');
});

test('damage cannot leave the sprite celebrating a launch and slides retain their separate pose path', () => {
  const player = { hurt: .4, compressTicks: 9, onGround: false, vy: 660, jumpKind: null };
  assert.equal(Art.POSES[Art.poseIndex(player)], 'fall-1');
  player.sliding = true;
  assert.equal(Art.POSES[Art.poseIndex(player)], 'neutral');
});

test('atlas analysis preserves grid coordinates, white shoes and original pixels', () => {
  const fixture = atlasPixels(), original = fixture.pixels.slice();
  const atlas = Art.atlasFromPixels(fixture.pixels, fixture.width, fixture.height);
  assert.ok(atlas);
  assert.equal(atlas.frames.length, 9);
  atlas.frames.forEach((frame, i) => {
    const box = fixture.boxes[i];
    assert.deepEqual(frame, { x: box.left, y: box.top, w: box.w, h: box.h, anchorX: box.footX, anchorY: box.footY });
  });
  assert.deepEqual(fixture.pixels, original, 'analysis never masks artwork or removes white clothing');
  assert.equal(atlas.width, fixture.width);
  assert.equal(atlas.height, fixture.height);
});

test('all poses keep one body scale, landings remain shorter and foot anchors remain on the surface', () => {
  const fixture = atlasPixels();
  const atlas = Art.atlasFromPixels(fixture.pixels, fixture.width, fixture.height);
  const neutral = Art.framePlacement(atlas, 0, 220, 510);
  const landing = Art.framePlacement(atlas, 7, 220, 521);
  const raised = Art.framePlacement(atlas, 4, 220, 270);
  assert.equal(neutral.dh, 70);
  assert.ok(landing.dh < neutral.dh, 'a crouched landing is not enlarged to standing height');
  assert.ok(raised.dh > neutral.dh, 'a taller silhouette does not shrink the entire body');
  for (let i = 0; i < atlas.frames.length; i++) {
    const frame = atlas.frames[i], x = 140 + i * 30, y = 490 + i;
    const placed = Art.framePlacement(atlas, i, x, y);
    assert.equal(placed.dw / placed.sw, atlas.scale);
    assert.equal(placed.dh / placed.sh, atlas.scale);
    assert.equal(placed.dx + (frame.anchorX - placed.sx) * atlas.scale, x);
    assert.equal(placed.dy + (frame.anchorY - placed.sy) * atlas.scale, y);
    assert.equal(placed.dy + placed.dh, y, 'lowest visible shoe pixel meets the supplied feet position');
  }
});

test('compression and camera movement translate every pose without rescaling it', () => {
  const fixture = atlasPixels();
  const atlas = Art.atlasFromPixels(fixture.pixels, fixture.width, fixture.height);
  const before = Art.framePlacement(atlas, 8, 220, 510);
  const after = Art.framePlacement(atlas, 8, 197, 521);
  assert.equal(after.dx - before.dx, -23);
  assert.equal(after.dy - before.dy, 11);
  assert.equal(after.dw, before.dw);
  assert.equal(after.dh, before.dh);
});

test('empty, missing-cell, wrong-sized and opaque sprite sheets fall back instead of drawing a background rectangle', () => {
  const fixture = atlasPixels();
  assert.equal(Art.atlasFromPixels(new Uint8ClampedArray(12), 97, 95), null);
  assert.equal(Art.atlasFromPixels(new Uint8ClampedArray(4 * 9 * 9), 9, 9), null);
  assert.equal(Art.atlasFromPixels(new Uint8ClampedArray(fixture.pixels.length), 97, 95), null);
  const opaque = new Uint8ClampedArray(fixture.pixels.length).fill(255);
  assert.equal(Art.atlasFromPixels(opaque, 97, 95), null);
  const missingLast = fixture.pixels.slice();
  for (let y = Math.floor(2 * 95 / 3); y < 95; y++) for (let x = Math.floor(2 * 97 / 3); x < 97; x++) {
    missingLast[(y * 97 + x) * 4 + 3] = 0;
  }
  assert.equal(Art.atlasFromPixels(missingLast, 97, 95), null);
});
