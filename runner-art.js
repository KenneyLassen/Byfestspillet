/* Visual-only pose and atlas geometry. This module never changes the simulation. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RunnerArt = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const POSES = ['neutral', 'takeoff-1', 'takeoff-2', 'rise-1', 'rise-2',
    'fall-1', 'fall-2', 'land-1', 'land-2'];

  function runPoseIndex(player, phase = 0) {
    if(!player.onGround||player.sliding||player.hurt>0||
      (player.compressTicks>0&&player.compressTicks<=2))return null;
    if(Math.abs(player.vx||0)<1)return 0;
    return 1+Math.floor(Math.max(0,phase))%8;
  }

  // Like the legacy game's loader, mask only background connected to a cell edge.
  // Generated RGB masters remain unchanged. Enclosed white shoes/eyes stay opaque.
  function maskAtlasBackground(pixels, width, height) {
    const data = new Uint8ClampedArray(pixels);
    // A genuine alpha asset already has correct edges and must be left alone.
    for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return data;
    const count = width * height, seen = new Uint8Array(count), queue = new Int32Array(count);
    let tail = 0;
    const visit = i => {
      if (i < 0 || i >= count || seen[i]) return;
      seen[i] = 1;
      const j = i * 4, lo = Math.min(data[j], data[j + 1], data[j + 2]);
      const hi = Math.max(data[j], data[j + 1], data[j + 2]);
      if (data[j + 3] < 16 || (lo >= 155 && hi - lo <= 28)) {
        data[j + 3] = 0; queue[tail++] = i;
      }
    };
    for (let line = 0; line <= 3; line++) {
      const x = Math.min(width - 1, Math.floor(line * width / 3));
      const y = Math.min(height - 1, Math.floor(line * height / 3));
      for (let yy = 0; yy < height; yy++) visit(yy * width + x);
      for (let xx = 0; xx < width; xx++) visit(y * width + xx);
    }
    for (let head = 0; head < tail; head++) {
      const i = queue[head];
      if (i % width) visit(i - 1);
      if (i % width < width - 1) visit(i + 1);
      visit(i - width); visit(i + width);
    }
    return data;
  }

  function poseIndex(player) {
    if (player.sliding) return 0; // The separate slide artwork is a later asset set.
    if (player.hurt > 0) return 5;
    if (player.compressTicks > 0) {
      if (player.compressTicks >= 7) return 7;
      if (player.compressTicks >= 5) return 8;
      if (player.compressTicks >= 3) return 1;
      return 2;
    }
    if (player.onGround) return 0;
    if (player.vy < 0) {
      if (player.jumpKind && player.jumpHoldTicks < 6) return 2;
      return player.vy < -.45 * (player.lastLaunchSpeed || 600) ? 3 : 4;
    }
    return player.vy < 300 ? 5 : 6;
  }

  // Analyse alpha within each original grid cell, preserving white shoe details.
  // One scale from the neutral pose is shared by every frame; crouches stay shorter.
  function atlasFromPixels(pixels, width, height, options = {}) {
    if (pixels.length !== width * height * 4 || width < 30 || height < 30) return null;
    const columns=options.columns||3,rows=options.rows||3;
    const frames = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const x0 = options.columnEdges?.[col]??Math.floor(col * width / columns);
      const x1 = options.columnEdges?.[col+1]??Math.floor((col+1) * width / columns);
      const y0 = options.rowEdges?.[row]??Math.floor(row * height / rows);
      const y1 = options.rowEdges?.[row+1]??Math.floor((row+1) * height / rows);
      let left = x1, right = -1, top = y1, bottom = -1, visible = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        if (pixels[(y * width + x) * 4 + 3] < 64) continue;
        visible++; left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      // An empty cell or an opaque background is not a usable sprite.
      if (right < left || visible > (x1 - x0) * (y1 - y0) * .75) return null;
      let footLeft = x1, footRight = -1;
      const shoeBand = Math.max(2, Math.round((bottom - top + 1) * .055));
      for (let y = bottom - shoeBand + 1; y <= bottom; y++) for (let x = left; x <= right; x++) {
        if (pixels[(y * width + x) * 4 + 3] < 128) continue;
        footLeft = Math.min(footLeft, x); footRight = Math.max(footRight, x);
      }
      const anchor=options.anchors?.[row*columns+col];
      frames.push({ x: left, y: top, w: right - left + 1, h: bottom - top + 1,
        anchorX: anchor?x0+anchor.x:footRight >= footLeft ? (footLeft + footRight + 1) / 2 : (left + right + 1) / 2,
        anchorY: anchor?y0+anchor.y:bottom + 1 });
    }
    return { width, height, frames, scale: 70 / frames[0].h };
  }

  function framePlacement(atlas, index, centerX, feetY) {
    const frame = atlas.frames[index], scale = atlas.scale;
    return { sx: frame.x, sy: frame.y, sw: frame.w, sh: frame.h,
      dx: centerX + (frame.x - frame.anchorX) * scale,
      dy: feetY + (frame.y - frame.anchorY) * scale,
      dw: frame.w * scale, dh: frame.h * scale };
  }

  // Attachment points lie on the same quadratic cord as the renderer.
  // Time comes from simulation ticks, so pause never advances the wind.
  function flagLayout(seconds, reducedMotion, section = 0) {
    return Array.from({length:21},(_,i)=>{
      const x=60+i*54,u=x/1200,index=section*21+i;
      const tangent=Math.atan(140*(1-2*u)/1200);
      const sway=reducedMotion?0:Math.sin(seconds*.85+index*.55)*.065;
      return {x:section*1200+x,y:170+140*u*(1-u),angle:tangent+sway,variant:((index%4)+4)%4};
    });
  }

  function foregroundTrees(platforms) {
    return platforms.filter(p=>p.type==='pad'&&p.x>=2000&&p.w>=700&&p.y1>=480)
      .map(p=>({x:p.x+Math.min(350,p.w*.4),y:590,height:434,variant:2}));
  }

  function sponsorSlots(pad, compression = 0) {
    if(pad.type!=='pad'||pad.w<260)return [];
    // Reserve room for the existing maximum 11px compression and pad edges.
    const h=Math.min(48,590-pad.y1-37);
    if(h<24)return [];
    const count=Math.max(1,Math.floor((pad.w-300)/440)+1);
    return Array.from({length:count},(_,i)=>({
      x:pad.x+Math.min(200,pad.w/2)+i*440-100,y:pad.y1+compression+14,
      w:200,h,index:Math.floor(pad.x/440)+i
    }));
  }

  return { POSES, poseIndex, runPoseIndex, maskAtlasBackground, atlasFromPixels, framePlacement, flagLayout, foregroundTrees, sponsorSlots };
}));
