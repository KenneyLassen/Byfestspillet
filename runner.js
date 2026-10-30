// Rendering, menus, asset preparation and audio build on Hoppeborg Challenge.
(() => {
  'use strict';
  const canvas=document.getElementById('game'), ctx=canvas.getContext('2d'), ui=document.getElementById('ui');
  const Art=window.RunnerArt;
  const ASSET_FILES = {
    boyAtlas: 'art/foerste-saet/dreng-hop.png',
    girlAtlas: 'art/foerste-saet/pige-hop.png',
    boyRun: 'art/loeb-saet-v2/dreng-loeb.png',
    girlRun: 'art/loeb-saet-v2/pige-loeb.png',
    boyHero: 'art/superhelt-saet/dreng-superhelt.png',
    girlHero: 'art/superhelt-saet/pige-superhelt.png',
    boyHeroLand: 'art/heltelanding-saet/dreng-landing.png',
    girlHeroLand: 'art/heltelanding-saet/pige-landing.png',
    heroPickup: 'art/superhelt-saet/powerup.png',
    cushion: 'art/foerste-saet/hoppepude.png',
    boySlide: 'art/sliske-saet/dreng-glid.png',
    girlSlide: 'art/sliske-saet/pige-glid.png',
    slide: 'art/sliske-saet/sliske.png',
    trees: 'art/baggrund-saet/traeer.png',
    clouds: 'art/baggrund-saet/skyer.png',
    sun: 'art/baggrund-saet/sol.png',
    flags: 'art/baggrund-saet/flag.png',
    castle: 'hoppeborg.png',
    boyIdle: 'dreng_idle.png',
    boyJump: 'dreng_jump.png',
    girlIdle: 'pige_idle.png',
    girlJump: 'pige_jump.png',
    coin: 'coin.png',
    plate: 'plate.png',
    sausage: 'art/farer-saet/poelse.png',
    frisbee: 'art/farer-saet/frisbee.png'
  };
  ctx.imageSmoothingEnabled = true;
  const assets = {}, preparedAssets = {}, assetFailures = new Set();
  const SCENERY_SHEETS={trees:{columns:3,rows:1,columnEdges:[0,860,1525,2172]},
    clouds:{columns:3,rows:1,columnEdges:[0,765,1530,2172]},
    sun:{columns:1,rows:1},flags:{columns:2,rows:2}};
  // Measured hip centers and planted-shoe baselines in the unchanged masters.
  // The corrected set has a neutral calibration followed by a complete loop;
  // its passing poses replace the old repeated wide strides and deep crouch.
  const RUN_SHEETS={
    boyRun:{columns:3,rows:3,
      anchors:[[230,412],[222,411],[221,412],[224,408],[210,396],[221,411],[210,398],[216,398],[223,392]].map(([x,y])=>({x,y}))},
    girlRun:{columns:3,rows:3,
      anchors:[[221,403],[217,399],[216,402],[229,405],[214,403],[215,405],[219,395],[224,395],[223,394]].map(([x,y])=>({x,y}))}
  };
  // Individual regions keep the wide capes inside their own flying frame.
  // Coordinates end with the measured chest anchor (standing: planted feet).
  const HERO_SHEETS={
    boyHero:[[0,0,500,680,320,611],[520,0,1254,680,1000,430],
      [0,700,627,1254,400,1020],[627,700,1254,1254,1030,1030]],
    girlHero:[[0,0,540,680,320,630],[570,0,1254,680,970,450],
      [0,700,627,1254,400,1010],[627,700,1254,1254,1040,1040]]
  };
  // Separate regions keep the broad braking capes out of the neutral frame.
  // Every pose uses one neutral calibration and a measured hip/foot anchor.
  const HERO_LANDING_SHEETS={
    boyHeroLand:[[0,0,540,640,342,619],[550,0,1254,640,1018,582],
      [0,650,650,1254,419,1167],[680,650,1254,1254,1010,1199]],
    girlHeroLand:[[0,0,550,640,341,628],[565,0,1254,640,1006,563],
      [0,640,690,1254,442,1198],[700,640,1254,1254,1035,1220]]
  };
  // Measured in the unchanged 1254px masters. Extra margins keep every shoe
  // inside its own cell; anchors are local to that cell's documented origin.
  const SLIDE_SHEETS={
    boySlide:{columns:2,rows:2,rowEdges:[0,690,1254],
      anchors:[null,{x:273,y:615},{x:325,y:478},{x:237,y:467}]},
    girlSlide:{columns:2,rows:2,columnEdges:[0,690,1254],rowEdges:[0,690,1254],
      anchors:[null,{x:239,y:618},{x:420,y:444},{x:211,y:451}]}
  };
  // The downloaded originals remain untouched. Some have a baked-in neutral
  // checkerboard: mask only connected background pixels in the render cache.
  function prepareAsset(name, img) {
    const c = document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
    const cx=c.getContext('2d', {willReadFrequently:true}); cx.drawImage(img,0,0);
    const pixels=cx.getImageData(0,0,c.width,c.height), data=pixels.data, count=c.width*c.height;
    const heroSpec=HERO_SHEETS[name]||HERO_LANDING_SHEETS[name];
    if(heroSpec){
      if(c.width!==1254||c.height!==1254)throw new Error('Unexpected superhero sheet dimensions');
      const frames=heroSpec.map(([left,top,right,bottom,x,y])=>{
        const region=Art?.atlasFromPixels(data,c.width,c.height,{columns:1,rows:1,
          columnEdges:[left,right],rowEdges:[top,bottom],anchors:[{x:x-left,y:y-top}]});
        if(!region)throw new Error('Invalid superhero frame');
        return region.frames[0];
      });
      return {image:c,atlas:{width:c.width,height:c.height,frames,scale:70/frames[0].h}};
    }
    if(RUN_SHEETS[name]){
      if(c.width!==1254||c.height!==1254)throw new Error('Unexpected running sheet dimensions');
      const atlas=Art?.atlasFromPixels(data,c.width,c.height,RUN_SHEETS[name]);
      if(!atlas)throw new Error('Invalid running sprite atlas');
      return {image:c,atlas};
    }
    if(SCENERY_SHEETS[name]){
      const spec=SCENERY_SHEETS[name];
      // Wide crowns and clouds need their documented, unequal cell margins.
      const columnEdges=spec.columnEdges?.map(x=>Math.round(x*c.width/spec.columnEdges.at(-1)));
      const atlas=Art?.atlasFromPixels(data,c.width,c.height,{...spec,columnEdges});
      if(!atlas)throw new Error('Invalid scenery sprite sheet');
      return {image:c,atlas};
    }
    if(SLIDE_SHEETS[name]){
      if(c.width!==1254||c.height!==1254)throw new Error('Unexpected seated sheet dimensions');
      const atlas=Art?.atlasFromPixels(data,c.width,c.height,SLIDE_SHEETS[name]);
      if(!atlas)throw new Error('Invalid seated sprite atlas');
      return {image:c,atlas};
    }
    if(name==='boyAtlas'||name==='girlAtlas'){
      // Some imagegen outputs bake a neutral grid into RGB. Keep the master file
      // intact and prepare a transparent render cache, as for the legacy images.
      if(Art)data.set(Art.maskAtlasBackground(data,c.width,c.height));
      const atlas=Art?.atlasFromPixels(data,c.width,c.height);
      if(!atlas)throw new Error('Invalid sprite atlas');
      cx.putImageData(pixels,0,0);
      return {image:c,atlas};
    }
    // Use the flat contact span. The decorative outside curves would otherwise
    // leave the feet floating at the rectangular platform's physical edges.
    if(name==='cushion')return {image:img,x:180,y:190,w:1810,h:339};
    if(name==='slide')return {image:img,x:250,y:222,w:1650,h:302};
    if(['castle','boyIdle','boyJump','girlIdle','girlJump','plate'].includes(name)) {
      const seen=new Uint8Array(count), queue=new Int32Array(count); let tail=0;
      const visit=i=>{if(i<0||i>=count||seen[i])return;seen[i]=1;const j=i*4;
        const lo=Math.min(data[j],data[j+1],data[j+2]), hi=Math.max(data[j],data[j+1],data[j+2]);
        if(data[j+3]<16 || (lo>190 && hi-lo<22)){data[j+3]=0;queue[tail++]=i;}};
      for(let x=0;x<c.width;x++){visit(x);visit(count-c.width+x);}
      for(let y=0;y<c.height;y++){visit(y*c.width);visit(y*c.width+c.width-1);}
      // The opening beneath this castle's arch is enclosed by the artwork.
      if(name==='castle')visit(Math.floor(c.height*.36)*c.width+Math.floor(c.width*.5));
      for(let head=0;head<tail;head++){const i=queue[head];if(i%c.width)visit(i-1);if(i%c.width<c.width-1)visit(i+1);visit(i-c.width);visit(i+c.width);}
      cx.putImageData(pixels,0,0);
    }
    let left=c.width,top=c.height,right=-1,bottom=-1;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    const crop=name==='logo'||right<left?{x:0,y:0,w:c.width,h:c.height}:{x:left,y:top,w:right-left+1,h:bottom-top+1};
    return {image:c,...crop};
  }
  function assetStatus(){
    const missing=[...assetFailures].filter(k=>k!=='logo');
    document.getElementById('assetStatus').textContent=missing.length?'Nogle billeder kunne ikke indlæses. Spillet bruger reservegrafik.':'';
  }
  Object.entries(ASSET_FILES).forEach(([name,src])=>{
    const img=new Image(); assets[name]=img;
    img.onload=()=>{try{preparedAssets[name]=prepareAsset(name,img);}catch{if(name==='boyAtlas'||name==='girlAtlas'||name==='cushion'||name==='slide'||RUN_SHEETS[name]||HERO_SHEETS[name]||HERO_LANDING_SHEETS[name]||SLIDE_SHEETS[name]||SCENERY_SHEETS[name])assetFailures.add(name);else preparedAssets[name]={image:img,x:0,y:0,w:img.naturalWidth,h:img.naturalHeight};}assetStatus();};
    img.onerror=()=>{assetFailures.add(name);assetStatus();};img.src=src;
  });
  const sponsorState={entries:[],logos:new Map()};
  const sponsorsReady=loadSponsors();
  async function loadSponsors(){
    if(typeof fetch!=='function'||!window.SponsorConfig)return;
    try{
      const response=await fetch('sponsorer.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('Sponsor file unavailable');
      sponsorState.entries=window.SponsorConfig.parse(await response.json()).sponsors;
      for(const sponsor of sponsorState.entries){
        if(!sponsor.image)continue;
        const image=new Image();sponsorState.logos.set(sponsor.id,image);
        image.onerror=()=>{assetFailures.add('sponsorLogo-'+sponsor.id);assetStatus();};
        image.src=sponsor.image;
      }
    }catch{assetFailures.add('sponsorConfig');assetStatus();}
  }
  function fitRect(sw,sh,x,y,w,h,alignY=.5){const scale=Math.min(w/sw,h/sh);return{x:x+(w-sw*scale)/2,y:y+(h-sh*scale)*alignY,w:sw*scale,h:sh*scale};}
  function drawAsset(name,x,y,w,h,fallbackFn,alignY=.5){
    const img=assets[name], a=preparedAssets[name];
    if(img&&img.complete&&img.naturalWidth>0){const source=a||{image:img,x:0,y:0,w:img.naturalWidth,h:img.naturalHeight};const r=fitRect(source.w,source.h,x,y,w,h,alignY);ctx.drawImage(source.image,source.x,source.y,source.w,source.h,r.x,r.y,r.w,r.h);}
    else if(typeof fallbackFn==='function')fallbackFn();
  }
  let audioCtx=null;
  function unlockAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!audioCtx&&Audio)audioCtx=new Audio();if(audioCtx?.state==='suspended')audioCtx.resume().catch(()=>{});}catch{}}
  const beep=(type='sine',f=440,d=0.08,v=0.03)=>{if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d)};

  const Core=window.RunnerCore, byId=id=>document.getElementById(id);
  // Different physics means different records. Keep every previous save intact.
  const STORAGE_KEY='aulumHopOgRul_v4';
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatTime=ticks=>(Math.floor(ticks/12)/10).toFixed(1).replace('.',',');
  const formatPoints=points=>Math.max(0,Math.floor(points||0)).toLocaleString('da-DK');
  function readData(){
    try{
      const own=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      const old=own||JSON.parse(localStorage.getItem('aulumHopOgRul_v3')||localStorage.getItem('aulumHopOgRul_v2')||localStorage.getItem('aulumHopOgRul_v1')||localStorage.getItem('aulumByfestData_v2')||localStorage.getItem('aulumByfestData_v1')||'null');
      const seen=new Set();
      const players=(Array.isArray(old?.players)?old.players:[]).filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&!seen.has(p.id)&&seen.add(p.id)).map(p=>({
        id:p.id,name:p.name.slice(0,18),avatar:p.avatar==='pige'?'pige':'dreng',
        bestTicks:own&&Number.isSafeInteger(p.bestTicks)&&p.bestTicks>0?p.bestTicks:0,
        bestScore:own&&Number.isSafeInteger(p.bestScore)&&p.bestScore>0?p.bestScore:0,
        gamesPlayed:own&&Number.isSafeInteger(p.gamesPlayed)?Math.max(0,p.gamesPlayed):0
      }));
      return{players,currentPlayerId:players.some(p=>p.id===old?.currentPlayerId)?old.currentPlayerId:null,sound:old?.sound!==false};
    }catch{return{players:[],currentPlayerId:null,sound:true};}
  }
  const data=readData();
  const game={state:'START',run:null,paused:false,lastResult:null,preview:Core.createRun(),input:{jump:false,left:false,right:false},popups:[]};
  let lastFrame=null,accumulator=0;
  const getPlayer=()=>data.players.find(p=>p.id===data.currentPlayerId);
  const inputSources={jump:new Set(),left:new Set(),right:new Set()};
  const pressedEdges={jump:false};
  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));byId('saveStatus').textContent='';}
    catch{byId('saveStatus').textContent='Resultatet kan ikke gemmes i denne browser lige nu.';}
  }
  function resetInput(){
    for(const key of Object.keys(inputSources)){inputSources[key].clear();game.input[key]=false;}
    pressedEdges.jump=false;
    document.querySelectorAll('[data-control]').forEach(b=>b.dataset.held='false');
  }
  function setControl(control,source,down){
    if(!(control in inputSources))return;
    const previous=game.input[control];
    if(down)inputSources[control].add(source);else inputSources[control].delete(source);
    game.input[control]=inputSources[control].size>0;
    if(control in pressedEdges&&game.input[control]&&!previous)pressedEdges[control]=true;
    const button=byId({jump:'hopButton',left:'leftButton',right:'rightButton'}[control]);
    button.dataset.held=String(game.input[control]);
  }
  const needsRotation=()=>matchMedia('(max-width: 760px) and (orientation: portrait)').matches;
  function setState(state){
    game.state=state;resetInput();game.paused=false;lastFrame=null;accumulator=0;
    document.body.classList.toggle('is-playing',state==='PLAYING');
    byId('hud').hidden=byId('touchControls').hidden=state!=='PLAYING';
    byId('pauseOverlay').hidden=true;renderUI();
  }
  const rules='<ul class="rules"><li><b>↔</b><span>Vælg selv afsæt og landinger.</span></li><li><b>↑</b><span>Perfekte hop bygger hoppekraft.</span></li><li><b>★</b><span>Fem perfekte i træk = +100 point.</span></li></ul>';
  const controlsText='← → / A D = styr · Space / ↑ = hop';
  function renderUI(){
    const p=getPlayer();
    if(game.state==='START'){
      ui.innerHTML='<p class="eyebrow">VELKOMMEN I LEGELANDET</p><h1>Hop.<br>Højere.<br><em>Prøv igen!</em></h1><p class="intro">Find rytmen på puderne, byg fart i hoppene og jagt din næste rekord.</p>'+rules+
        '<button class="btn" id="goPlayers">'+(p?'Spil som '+escapeHTML(p.name)+' →':'Lad os spille →')+'</button><button class="btn quiet" id="goHigh">Se lokale rekorder</button><p class="small">Tre liv. Alle starter med samme hoppekraft.</p>';
      byId('goPlayers').onclick=()=>setState(p?'INSTRUCTIONS':'PLAYER_SELECT');
      byId('goHigh').onclick=()=>setState('HIGHSCORES');
    }else if(game.state==='PLAYER_SELECT'){
      ui.innerHTML='<p class="eyebrow">HVEM ER KLAR?</p><h2>Vælg din spiller</h2><div class="profile-list">'+data.players.map(pl=>'<button class="btn sec pick" data-id="'+escapeHTML(pl.id)+'"><span>'+(pl.avatar==='pige'?'👧 ':'👦 ')+escapeHTML(pl.name)+'</span><small>'+formatPoints(pl.bestScore)+' point</small></button>').join('')+'</div><form id="playerForm"><div class="form-row"><div><label for="newName">Kaldenavn</label><input id="newName" maxlength="18" autocomplete="off" placeholder="Dit kaldenavn" required></div><div><label for="avatar">Figur</label><select id="avatar"><option value="dreng">Dreng</option><option value="pige">Pige</option></select></div></div><button class="btn" type="submit">Opret spiller →</button></form><button class="btn quiet" id="back">Tilbage</button><p class="small">Profiler og rekorder gemmes på denne enhed.</p>';
      ui.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{data.currentPlayerId=b.dataset.id;save();setState('INSTRUCTIONS');});
      byId('playerForm').onsubmit=e=>{e.preventDefault();const name=byId('newName').value.trim();if(!name)return;const pl={id:crypto.randomUUID(),name,avatar:byId('avatar').value,bestTicks:0,bestScore:0,gamesPlayed:0};data.players.push(pl);data.currentPlayerId=pl.id;save();setState('INSTRUCTIONS');};
      byId('back').onclick=()=>setState('START');
    }else if(game.state==='INSTRUCTIONS'){
      ui.innerHTML='<p class="eyebrow">KLAR, '+escapeHTML(p.name.toLocaleUpperCase('da'))+'?</p><h2>Find rytmen.<br>Vælg din landing.</h2><p class="intro">Banen bevæger sig fremad. Styr til siderne, også i luften. Puderne hopper for dig: tryk HOP lige før landing for et perfekt afsæt.</p>'+rules+'<p class="small">På jorden løber du: tryk HOP op på næste pude. Din perfekte serie og hoppekraft bevares. Du glider automatisk ned ad sliskerne. Fang stjernen med kappe for at flyve som superhelt i 7 sekunder; du lander automatisk igen. 10 point pr. sekund + bonus for hver serie på fem perfekte hop.</p><button class="btn" id="play">Start turen →</button><p class="small" id="rotateHint">'+(needsRotation()?'Vend telefonen på siden for at spille.':controlsText)+'</p><button class="btn quiet" id="players">Skift spiller</button>';
      byId('play').onclick=startRound;byId('players').onclick=()=>setState('PLAYER_SELECT');
    }else if(game.state==='RESULTS'){
      const r=game.lastResult;
      ui.innerHTML='<p class="eyebrow">'+(r.isBest?'NY PERSONLIG REKORD!':'GODT KÆMPET, '+escapeHTML(p.name.toLocaleUpperCase('da'))+'!')+'</p><h2>Et hop mere<br>næste gang?</h2><p class="score-big">'+formatPoints(r.score)+' <small>point</small></p><span class="badge">Din rekord: '+formatPoints(p.bestScore)+' point</span><p class="score-breakdown">'+formatTime(r.ticks)+' sek. → '+formatPoints(r.score-r.bonusPoints)+' point<br>Perfekte serier → +'+formatPoints(r.bonusPoints)+' point</p><p class="intro">'+r.message+'</p><button class="btn" id="again">Prøv igen →</button><button class="btn quiet" id="high">Se lokale rekorder</button><button class="btn quiet" id="players">Skift spiller</button>';
      byId('again').onclick=startRound;byId('high').onclick=()=>setState('HIGHSCORES');byId('players').onclick=()=>setState('PLAYER_SELECT');
    }else if(game.state==='HIGHSCORES'){
      const top=data.players.filter(p=>p.gamesPlayed>0).slice().sort((a,b)=>b.bestScore-a.bestScore).slice(0,10);
      ui.innerHTML='<p class="eyebrow">PÅ DENNE ENHED</p><h2>De bedste hop</h2><ol class="score-list">'+top.map((pl,i)=>'<li><b>'+ (i>0&&pl.bestScore===top[i-1].bestScore?top.findIndex(t=>t.bestScore===pl.bestScore)+1:i+1) +'</b><span>'+escapeHTML(pl.name)+'</span><strong>'+formatPoints(pl.bestScore)+' point</strong></li>').join('')+'</ol>'+(top.length?'':'<p class="intro">Den første rekord kan blive din.</p>')+'<p class="small">Nye pointrekorder: overlevelsestid + bonusser. Tidligere udgavers resultater er gemt separat.</p><button class="btn" id="back">Tilbage til spillet →</button>';
      byId('back').onclick=()=>setState(p?'INSTRUCTIONS':'START');
    }
  }
  function startRound(){
    if(!getPlayer())return setState('PLAYER_SELECT');
    unlockAudio();game.run=Core.createRun();game.popups=[];setState('PLAYING');updateHUD();
    if(needsRotation())pause('rotation');else canvas.focus({preventScroll:true});
  }
  function pause(reason='manual'){
    if(game.state!=='PLAYING')return;
    game.paused=true;resetInput();accumulator=0;lastFrame=null;
    byId('pauseOverlay').hidden=false;
    const rotate=reason==='rotation'||needsRotation();
    byId('pauseTitle').textContent=rotate?'Vend telefonen på siden':'Spillet er på pause';
    byId('pauseMessage').textContent=rotate?'Hop og Rul spilles i bredformat. Din tur venter her.':'Klar til næste hop?';
    byId('resumeButton').hidden=rotate;
  }
  function resume(){
    if(needsRotation())return pause('rotation');
    game.paused=false;resetInput();accumulator=0;lastFrame=null;byId('pauseOverlay').hidden=true;unlockAudio();canvas.focus({preventScroll:true});
  }
  function finishRound(){
    if(game.state!=='PLAYING')return;
    const p=getPlayer(),run=game.run,ticks=run.scoreTicks,score=run.score,isBest=score>p.bestScore;
    p.gamesPlayed++;
    if(isBest){p.bestScore=score;p.bestTicks=ticks;}
    game.lastResult={ticks,score,bonusPoints:run.bonusPoints,isBest,message:'Tip: Styr dit afsæt, og tryk HOP, når knappen lyser grønt.'};
    save();setState('RESULTS');
  }
  function groundJumpCue(run){
    const p=run.player;
    if(!p.onGround||p.hurt>0||!run.platforms.some(f=>f.id===p.groundPlatformId&&f.type==='ground'))return null;
    const pad=run.platforms.find(f=>f.type==='pad'&&f.x>=p.x);
    return {ready:!!pad&&pad.x-p.x<=p.w/2+Math.max(1,p.vx)*.4};
  }
  function updateHUD(){
    const run=game.run,p=run.player;
    byId('runScore').textContent=formatPoints(run.score);
    byId('runTime').textContent=formatTime(run.scoreTicks)+' sek.';
    byId('runLives').textContent=Array.from({length:3},(_,i)=>i<run.lives?'♥':'♡').join(' ');
    byId('runLives').setAttribute('aria-label',run.lives+' liv');
    byId('runCombo').textContent=p.combo||0;
    byId('comboProgress').style.width=(p.combo?((p.combo-1)%5+1):0)*20+'%';
    byId('runCharge').textContent=(p.jumpCharge||0)+' / '+(Core.MAX_JUMP_CHARGE||5);
    byId('chargeProgress').style.width=((p.jumpCharge||0)/(Core.MAX_JUMP_CHARGE||5))*100+'%';
    const groundCue=groundJumpCue(run);
    const flying=(p.flightTicks||0)>0;
    byId('hopButton').disabled=flying;
    byId('hopButton').dataset.ready=String(!flying&&(groundCue?groundCue.ready:!!p.timingReady));
    byId('hopHint').textContent=flying?'Flyver automatisk':groundCue?(groundCue.ready?'HOP OP NU!':'Hop op på puden'):p.timingReady?'HOP NU!':'Perfekt før landing';
  }
  function sound(type){
    if(!data.sound)return;
    if(type==='jump')beep('sine',520,.09,.025);
    if(type==='hit')beep('sawtooth',150,.12,.025);
    if(type==='end')beep('triangle',220,.2,.025);
    if(type==='perfect')beep('triangle',880,.12,.035);
    if(type==='bonus')beep('sine',1200,.22,.035);
  }
  function processEvents(){
    for(const event of game.run.events.splice(0)){
      sound(event.type);
      if(event.type==='hit')game.popups.push({text:'AV!',kind:'hit',t:1.0});
      if(event.type==='hero-start'){
        inputSources.jump.clear();game.input.jump=false;pressedEdges.jump=false;
        byId('hopButton').dataset.held='false';if(data.sound)beep('triangle',1040,.25,.035);
      }
      if(event.type==='timing'){
        if(event.quality==='perfect')sound('perfect');
        game.popups.push({text:event.quality==='perfect'?'PERFEKT!':event.quality==='good'?'Godt hop!':'Find rytmen igen',kind:event.quality,t:.75});
      }
      if(event.type==='bonus')game.popups.push({text:'5 PERFEKTE! +'+event.points+' POINT',kind:'bonus',t:1.5});
    }
  }
  function rounded(x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function drawScenery(name,index,x,y,w,h,alignY=.5){
    const sheet=preparedAssets[name],frame=sheet?.atlas?.frames[index];
    if(!frame)return false;
    const r=fitRect(frame.w,frame.h,x,y,w,h,alignY);
    ctx.drawImage(sheet.image,frame.x,frame.y,frame.w,frame.h,r.x,r.y,r.w,r.h);
    return true;
  }
  function drawForegroundTrees(run){
    const frame=preparedAssets.trees?.atlas?.frames[2];
    for(const tree of Art?.foregroundTrees(run.platforms)||[]){
      const width=frame?tree.height*frame.w/frame.h:tree.height*.8;
      const x=tree.x-run.cameraX;
      if(x+width/2<0||x-width/2>1200)continue;
      ctx.save();ctx.globalAlpha=1;
      if(!drawScenery('trees',tree.variant,x-width/2,tree.y-tree.height,width,tree.height,1)){
        ctx.fillStyle='#84532e';ctx.fillRect(x-width*.05,tree.y-tree.height*.55,width*.1,tree.height*.55);
        ctx.fillStyle='#63973e';ctx.beginPath();ctx.ellipse(x,tree.y-tree.height*.65,width/2,tree.height*.35,0,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawSponsorBanners(run){
    if(!sponsorState.entries.length)return;
    ctx.save();ctx.globalAlpha=1;
    for(const pad of run.platforms){
      const compression=run.player.groundPlatformId===pad.id?(run.player.compressionDepth||0):0;
      for(const slot of Art?.sponsorSlots(pad,compression)||[]){
        const x=slot.x-run.cameraX;
        if(x+slot.w<0||x>1200)continue;
        const sponsor=sponsorState.entries.length?sponsorState.entries[slot.index%sponsorState.entries.length]:null;
        const logo=sponsor?sponsorState.logos.get(sponsor.id):null;
        // The complete opaque card, not just its logo, belongs above every tree.
        rounded(x,slot.y,slot.w,slot.h,6,'#fffbed','#397969');
        if(logo?.complete&&logo.naturalWidth>0){
          const r=fitRect(logo.naturalWidth,logo.naturalHeight,x+12,slot.y+6,slot.w-24,slot.h-12);
          ctx.drawImage(logo,0,0,logo.naturalWidth,logo.naturalHeight,r.x,r.y,r.w,r.h);
        }else{
          const cx=x+slot.w/2,cy=slot.y+slot.h/2;
          ctx.strokeStyle='#a4bfb3';ctx.lineWidth=2;ctx.strokeRect(cx-14,cy-10,28,20);
          ctx.beginPath();ctx.moveTo(cx-11,cy+7);ctx.lineTo(cx-3,cy-1);ctx.lineTo(cx+2,cy+3);
          ctx.lineTo(cx+8,cy-4);ctx.lineTo(cx+12,cy+1);ctx.stroke();
          ctx.beginPath();ctx.arc(cx-7,cy-5,2,0,Math.PI*2);ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
  function drawBackground(camera,seconds,reduced){
    const sky=ctx.createLinearGradient(0,0,0,675);sky.addColorStop(0,'#79c8fb');sky.addColorStop(.72,'#d2eef7');sky.addColorStop(1,'#c8dfac');
    ctx.fillStyle=sky;ctx.fillRect(0,0,1200,675);
    if(!drawScenery('sun',0,910,40,138,138)){
      ctx.fillStyle='#fff4b8';ctx.beginPath();ctx.arc(979,109,48,0,Math.PI*2);ctx.fill();
    }
    const cloudCamera=camera*.1+(reduced?0:seconds*3);
    const firstCloud=Math.floor(cloudCamera/340)-1;
    ctx.globalAlpha=.9;
    for(let i=firstCloud;i<firstCloud+6;i++){
      const variant=((i%3)+3)%3,x=i*340-cloudCamera,y=70+variant*38;
      if(!drawScenery('clouds',variant,x,y,230,102)){
        ctx.fillStyle='#fffdf0b0';ctx.beginPath();ctx.ellipse(x+80,y+40,65,18,0,0,Math.PI*2);ctx.ellipse(x+120,y+28,33,24,0,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.globalAlpha=1;
    for(let layer=0;layer<2;layer++){
      ctx.fillStyle=layer?'#accda5':'#c7dfb7';
      for(let i=-1;i<6;i++){const x=i*370-((camera*(layer?.25:.1))%370);ctx.beginPath();ctx.ellipse(x,495+layer*38,280,125-layer*25,0,Math.PI,0);ctx.fill();}
    }
    const cx=820-camera*.18,castleBase=545;
    if(cx>-400&&cx<1250){
      ctx.fillStyle='#8ebc78';ctx.beginPath();ctx.ellipse(cx+150,castleBase+5,185,20,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#496f4930';ctx.beginPath();ctx.ellipse(cx+150,castleBase,145,7,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.94;drawAsset('castle',cx,castleBase-230,300,230,()=>{},1);ctx.globalAlpha=1;
    }
    for(let layer=0;layer<2;layer++){
      const treeCamera=camera*(layer?.3:.15),spacing=layer?345:290;
      const first=Math.floor(treeCamera/spacing)-1;
      ctx.globalAlpha=layer?.72:.35;
      for(let i=first;i<first+7;i++){
        const variant=((i%3)+3)%3,height=(layer?270:170)+variant*18;
        const x=i*spacing-treeCamera+(layer?-75:45),base=layer?578:520;
        if(!drawScenery('trees',variant,x,base-height,250,height,1)){
          ctx.strokeStyle='#82aa81';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+80,base);ctx.lineTo(x+80,base-95);ctx.stroke();
          ctx.fillStyle='#80b39a';ctx.beginPath();ctx.arc(x+80,base-105,37,0,Math.PI*2);ctx.fill();
        }
      }
    }
    ctx.fillStyle='#8db67b';ctx.fillRect(0,590,1200,85);
    ctx.fillStyle='#afcb8e';for(let i=0;i<40;i++){const x=i*37-(camera*.6%37);ctx.fillRect(x,608+(i%4)*12,15,3);}
  }
  function drawFlagSupport(x,run){
    if(x<-20||x>1220)return;
    const worldX=x+(run.cameraX||0);
    let base=590;
    for(const platform of run.platforms){
      if(platform.x>worldX+14||platform.x+platform.w<worldX-14)continue;
      const compression=run.player.groundPlatformId===platform.id?(run.player.compressionDepth||0):0;
      const left=Math.max(platform.x,worldX-14),right=Math.min(platform.x+platform.w,worldX+14);
      base=Math.min(base,Core.surfaceAt(platform,left)+compression,Core.surfaceAt(platform,right)+compression);
    }
    ctx.save();
    // Hide the entire support behind the near surface, including strokes and
    // its round foot. A cushion's transparent lower margin is not an occluder.
    ctx.beginPath();ctx.rect(x-16,154,32,Math.max(0,base-154));ctx.clip();
    rounded(x-12,156,24,434,6,'#b7783e','#6e452a');
    rounded(x-8,164,5,418,2,'#dfa468');
    ctx.strokeStyle='#86512c';ctx.lineWidth=1.5;
    for(let i=0;i<4;i++){
      const y=204+i*90;
      ctx.beginPath();ctx.moveTo(x+5,y);ctx.bezierCurveTo(x+1,y+20,x+8,y+40,x+4,y+65);ctx.stroke();
    }
    ctx.beginPath();ctx.ellipse(x+2,352,3,9,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#e6b77d';ctx.beginPath();ctx.ellipse(x,160,9,3,0,0,Math.PI*2);ctx.fill();
    // The cord is tied below the rounded wooden cap, at each section's peak.
    ctx.strokeStyle='#6b7755';ctx.lineWidth=2;
    for(const y of [169,174]){ctx.beginPath();ctx.moveTo(x-13,y);ctx.lineTo(x+13,y-1);ctx.stroke();}
    ctx.restore();
  }
  // The cord belongs to the course, so camera lift can reveal a jump above it.
  function drawWorldFlags(run){
    const camera=run.cameraX||0,seconds=run.ticks*Core.STEP;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const first=Math.floor(camera/1200)-1;
    const colors=['#ef784b','#f8cd51','#36a9dc','#25b5a6'];
    for(let section=first;section<first+3;section++){
      const start=section*1200-camera;
      drawFlagSupport(start,run);
      ctx.strokeStyle='#5b7362b0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,170);ctx.quadraticCurveTo(start+600,240,start+1200,170);ctx.stroke();
      ctx.globalAlpha=.86;
      for(const flag of Art?.flagLayout(seconds,reduced,section)||[]){
        const x=flag.x-camera;if(x<-30||x>1230)continue;
        ctx.save();ctx.translate(x,flag.y);ctx.rotate(flag.angle);
        if(!drawScenery('flags',flag.variant,-17,0,34,46,0)){
          ctx.fillStyle=colors[flag.variant];ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(17,0);ctx.lineTo(0,46);ctx.closePath();ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha=1;
    }
  }
  function drawCushion(platform,x,top){
    const asset=preparedAssets.cushion;if(!asset)return false;
    const width=platform.w,bottom=590;
    const rows=Math.max(1,Math.ceil((bottom-platform.y1)/100));
    const rowHeight=(bottom-top)/rows,scale=rowHeight/asset.h;
    const capSource=254,capWidth=capSource*scale;
    const centerSource=900,centerWidth=centerSource*scale;
    ctx.save();ctx.beginPath();ctx.rect(x,top,width,bottom-top);ctx.clip();
    for(let row=0;row<rows;row++){
      const y=top+row*rowHeight;
      const radius=Math.min(14,rowHeight/5);
      ctx.save();ctx.beginPath();ctx.roundRect(x,y,width,rowHeight,radius);ctx.clip();
      // Caps and repeating panels share one scale in both directions.
      ctx.drawImage(asset.image,asset.x,asset.y,capSource,asset.h,x,y,capWidth,rowHeight);
      ctx.drawImage(asset.image,asset.x+asset.w-capSource,asset.y,capSource,asset.h,x+width-capWidth,y,capWidth,rowHeight);
      const end=x+width-capWidth;
      for(let dx=x+capWidth;dx<end;dx+=centerWidth){
        const visible=Math.min(centerWidth,end-dx);
        ctx.drawImage(asset.image,600,asset.y,visible/scale,asset.h,dx,y,visible,rowHeight);
      }
      ctx.restore();
      ctx.beginPath();ctx.roundRect(x+.5,y+.5,width-1,rowHeight-1,radius);
      ctx.strokeStyle='#246e6866';ctx.lineWidth=1;ctx.stroke();
    }
    ctx.restore();
    return true;
  }
  function drawTerrain(run){
    for(const platform of run.platforms){
      const x=platform.x-run.cameraX,w=platform.w;
      if(x+w<-50||x>1250)continue;
      if(platform.type==='ground'){
        const top=platform.y1;
        ctx.fillStyle='#98734f';ctx.fillRect(x,top,w,Math.max(675,top+110)-top);
        ctx.fillStyle='#8fc85a';ctx.fillRect(x,top,w,10);
        ctx.fillStyle='#b9de75';ctx.fillRect(x,top,w,3);
        ctx.fillStyle='#6c873f';ctx.fillRect(x,top+10,w,3);
        // Small tufts and soil marks stay in world coordinates with the path.
        for(let offset=18;offset<w-12;offset+=67){
          const dx=x+offset;
          if(dx<-20||dx>1220)continue;
          ctx.strokeStyle='#5e923b';ctx.lineWidth=1.5;ctx.beginPath();
          ctx.moveTo(dx-4,top+3);ctx.lineTo(dx-7,top-2);ctx.moveTo(dx,top+3);ctx.lineTo(dx+2,top-3);ctx.stroke();
          ctx.fillStyle='#bb9870';ctx.fillRect(dx+12,top+28+(Math.floor(offset/67)%3)*17,9,2);
        }
        continue;
      }
      const compression=run.player.groundPlatformId===platform.id?(run.player.compressionDepth||0):0;
      const a=platform.y1+compression,b=platform.y2+compression,slide=platform.type==='slide',pad=platform.type==='pad';
      const color=pad?'#f4c456':slide?'#ec875e':'#69b6ad';
      ctx.fillStyle='#174e481c';ctx.beginPath();ctx.ellipse(x+w/2,597,w/2,12,0,0,Math.PI*2);ctx.fill();
      if(pad&&drawCushion(platform,x,a))continue;
      if(slide&&drawSlide(platform,x,a,b))continue;
      ctx.beginPath();ctx.moveTo(x,a+12);ctx.lineTo(x+w,b+12);ctx.lineTo(x+w,578);ctx.quadraticCurveTo(x+w,590,x+w-13,590);ctx.lineTo(x+13,590);ctx.quadraticCurveTo(x,590,x,577);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#276e62';ctx.stroke();
      ctx.save();ctx.beginPath();ctx.moveTo(x+3,a+18);ctx.lineTo(x+w-3,b+18);ctx.lineTo(x+w-3,580);ctx.lineTo(x+3,580);ctx.clip();
      ctx.strokeStyle='#ffffff25';ctx.lineWidth=4;
      for(let seam=45;seam<w;seam+=52){ctx.beginPath();ctx.moveTo(x+seam,a);ctx.lineTo(x+seam,590);ctx.stroke();}
      ctx.restore();
      if(slide){
        // A steep rail's upper edge must follow the exact contact line.
        ctx.beginPath();ctx.moveTo(x,a);ctx.lineTo(x+w,b);ctx.lineTo(x+w,b+18);ctx.lineTo(x,a+18);ctx.closePath();ctx.fillStyle='#ffc390';ctx.fill();
      }else{
        ctx.beginPath();ctx.moveTo(x+9,a+10);ctx.lineTo(x+w-9,b+10);ctx.strokeStyle='#286f6355';ctx.lineWidth=22;ctx.lineCap='round';ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+9,a+8);ctx.lineTo(x+w-9,b+8);ctx.strokeStyle=pad?'#ffe5a0':'#b6e2c9';ctx.lineWidth=17;ctx.stroke();ctx.lineCap='butt';
      }
      // The upper edge of the padded rail is exactly the physics surface.
      if(pad){ctx.fillStyle='#855f22';ctx.font='bold 18px Trebuchet MS';ctx.textAlign='center';ctx.fillText('HOPPEPUDE',x+w/2,a+59);ctx.textAlign='start';}
      if(slide){ctx.strokeStyle='#fff3c7';ctx.lineWidth=4;for(let j=65;j<w-20;j+=80){const sy=Core.surfaceAt(platform,platform.x+j);ctx.beginPath();ctx.moveTo(x+j,sy+37);ctx.lineTo(x+j+14,sy+43);ctx.lineTo(x+j,sy+49);ctx.stroke();}}
    }
  }
  function drawSlide(platform,x,top,bottom){
    const asset=preparedAssets.slide;if(!asset)return false;
    // Reuse the pad texture as the inflatable wedge underneath the slide.
    ctx.save();ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+platform.w,bottom);
    ctx.lineTo(x+platform.w,590);ctx.lineTo(x,590);ctx.closePath();ctx.clip();
    if(!drawCushion(platform,x,top)){
      ctx.fillStyle='#f4c456';ctx.fillRect(x,top,platform.w,590-top);
    }
    ctx.restore();
    const angle=Math.atan2(bottom-top,platform.w),length=Math.hypot(platform.w,bottom-top);
    const thickness=44,scale=thickness/asset.h,capSource=200,capWidth=capSource*scale;
    const centerSource=900,centerWidth=centerSource*scale;
    ctx.save();ctx.translate(x,top);ctx.rotate(angle);
    ctx.beginPath();ctx.rect(0,0,length,thickness);ctx.clip();
    ctx.drawImage(asset.image,asset.x,asset.y,capSource,asset.h,0,0,capWidth,thickness);
    const end=length-capWidth;
    for(let dx=capWidth;dx<end;dx+=centerWidth){
      const visible=Math.min(centerWidth,end-dx);
      ctx.drawImage(asset.image,600,asset.y,visible/scale,asset.h,dx,0,visible,thickness);
    }
    ctx.drawImage(asset.image,asset.x+asset.w-capSource,asset.y,capSource,asset.h,end,0,capWidth,thickness);
    ctx.restore();
    return true;
  }
  const runningClocks=new WeakMap();
  function runningPoseIndex(run){
    const p=run.player;
    const active=p.onGround&&!p.sliding&&!(p.hurt>0)&&!(p.flightTicks>0)&&Math.abs(p.vx||0)>=1&&
      !(p.compressTicks>0&&p.compressTicks<=2);
    let clock=runningClocks.get(run);
    if(!clock||run.ticks<clock.tick){clock={tick:run.ticks,phase:0,active};runningClocks.set(run,clock);}
    const ticks=run.ticks-clock.tick;
    // A visual clock owns no simulation fields. Repeated draws at the same
    // tick, pause and airborne intervals cannot race or fast-forward the legs.
    if(active&&clock.active&&ticks>0&&ticks<=30){
      const cadence=Math.min(12,Math.max(4,Math.abs(p.vx)/30));
      clock.phase=(clock.phase+ticks*Core.STEP*cadence)%8;
    }
    clock.tick=run.ticks;clock.active=active;
    return Art?.runPoseIndex(p,clock.phase)??null;
  }
  // Pose changes follow physical contact and progress, never a free-running loop.
  function getPlayerVisual(run){
    const pl=run.player;
    const motion=pl.motion||(pl.onGround?'run':pl.vy<0?'rise':'fall');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heroActive=(pl.flightTicks||0)>0,heroIndex=reduced?1:1+Math.floor(run.ticks/18)%3;
    const heroLandingIndex=heroActive&&pl.flightTicks<=120?(reduced?3:pl.flightTicks>90?1:pl.flightTicks>48?2:3):null;
    // Start near the flying pose's visible feet, then settle onto the real
    // foot coordinate. The final pose meets the surface without moving physics.
    const heroLandingOffset=heroLandingIndex===1?-20*Math.max(0,(pl.flightTicks-90)/30):0;
    const lowPose=!heroActive&&(pl.sliding||motion==='slide');
    const slide=run.platforms.find(f=>f.id===pl.groundPlatformId&&f.type==='slide');
    const progress=slide?(pl.x-slide.x)/slide.w:.5;
    const slideIndex=progress<.22?1:progress>.78?3:2;
    const runningAtlas=preparedAssets[getPlayer()?.avatar==='pige'?'girlRun':'boyRun'];
    const contactIndex=runningAtlas?.atlas?runningPoseIndex(run):null;
    const runIndex=heroActive?null:contactIndex;
    return{
      motion,
      sprite:heroActive||motion==='rise'?'Jump':'Idle',
      poseIndex:Art?Art.poseIndex(pl):0,
      poseName:heroActive?(heroLandingIndex?'hero-land-'+heroLandingIndex:'hero-fly'):lowPose?['slide-entry','slide','slide-exit'][slideIndex-1]:runIndex!==null?(runIndex?'run-'+runIndex:'neutral'):Art?Art.POSES[Art.poseIndex(pl)]:'neutral',
      alpha:!heroActive&&pl.invulnerable>0?(reduced?.7:Math.floor(run.ticks/24)%2?.28:1):1,
      lowPose,slideIndex,runIndex,heroActive,heroIndex,heroLandingIndex,heroLandingOffset,
      angle:lowPose?(pl.slopeAngle||0):0,
      frame:Math.floor(run.distance/20)%8
    };
  }
  function drawRunner(run){
    const pl=run.player,p=getPlayer()||{avatar:'dreng'},x=pl.x-run.cameraX;
    const visual=getPlayerVisual(run);
    const platform=run.platforms.find(f=>pl.x>=f.x&&pl.x<=f.x+f.w);
    const ground=platform?Core.surfaceAt(platform,pl.x):590;
    const altitude=Math.max(0,ground-pl.y),shadowSize=Math.max(8,22-altitude*.045);
    ctx.fillStyle='#174e4833';ctx.beginPath();ctx.ellipse(x,Math.min(592,ground+5),shadowSize,4,0,0,Math.PI*2);ctx.fill();
    const name=(p.avatar==='pige'?'girl':'boy')+visual.sprite;
    const seated=preparedAssets[p.avatar==='pige'?'girlSlide':'boySlide'];
    const seatedRect=visual.lowPose&&seated?.atlas&&Art?Art.framePlacement(seated.atlas,visual.slideIndex,0,0):null;
    const hero=preparedAssets[p.avatar==='pige'?'girlHero':'boyHero'];
    const heroRect=visual.heroActive&&hero?.atlas&&Art?Art.framePlacement(hero.atlas,visual.heroIndex,x,pl.y-35):null;
    const heroLanding=preparedAssets[p.avatar==='pige'?'girlHeroLand':'boyHeroLand'];
    const heroLandingRect=visual.heroLandingIndex!==null&&heroLanding?.atlas&&Art?
      Art.framePlacement(heroLanding.atlas,visual.heroLandingIndex,x,pl.y+visual.heroLandingOffset):null;
    // Blink the sprite, while keeping the outline visible to track the player.
    if(pl.invulnerable>0&&!visual.heroActive){
      ctx.strokeStyle='#fff9d3';ctx.lineWidth=4;ctx.beginPath();
      if(seatedRect){
        ctx.save();ctx.translate(x,pl.y);ctx.rotate(visual.angle);
        ctx.roundRect(seatedRect.dx-6,seatedRect.dy-6,seatedRect.dw+12,seatedRect.dh+12,12);
        ctx.stroke();ctx.restore();
      }else{ctx.ellipse(x,pl.y-pl.h/2,33,pl.h/2+8,0,0,Math.PI*2);ctx.stroke();}
    }
    ctx.save();ctx.globalAlpha=visual.alpha;
    if(heroLandingRect){
      const r=heroLandingRect;ctx.drawImage(heroLanding.image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);
    }else if(heroRect){
      const r=heroRect;ctx.drawImage(hero.image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);
    }else if(seatedRect){
      const r=seatedRect;
      ctx.translate(x,pl.y);ctx.rotate(visual.angle);
      ctx.drawImage(seated.image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);
    }else{
      if(visual.heroActive){
        ctx.fillStyle='#8333bf';ctx.strokeStyle='#ffd95e';ctx.lineWidth=2;ctx.beginPath();
        ctx.moveTo(x-5,pl.y-55);ctx.lineTo(x-48,pl.y-35);ctx.lineTo(x-20,pl.y-12);ctx.closePath();ctx.fill();ctx.stroke();
      }
      const running=visual.runIndex!==null&&preparedAssets[p.avatar==='pige'?'girlRun':'boyRun'];
      const sheet=running||preparedAssets[p.avatar==='pige'?'girlAtlas':'boyAtlas'];
      if(sheet?.atlas&&Art){
        const r=Art.framePlacement(sheet.atlas,running?visual.runIndex:visual.poseIndex,x,pl.y);
        ctx.drawImage(sheet.image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);
      }else{
        drawAsset(name,x-26,pl.y-70,52,70,()=>{ctx.fillStyle='#f49b71';ctx.beginPath();ctx.arc(x,pl.y-54,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#356f92';ctx.fillRect(x-13,pl.y-40,26,34);},1);
      }
    }
    ctx.restore();
    if(pl.sliding){
      ctx.strokeStyle='#fff7d7b0';ctx.lineWidth=3;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-32-i*9,pl.y-8-i*9);ctx.lineTo(x-53-i*9,pl.y-14-i*9);ctx.stroke();}
    }
    if(visual.motion==='compress'){
      ctx.strokeStyle='#ffeaa8';ctx.lineWidth=3;
      for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x+side*25,pl.y-4);ctx.lineTo(x+side*38,pl.y-12);ctx.stroke();}
    }
  }
  function drawPlayerFeedback(run){
    const pl=run.player,x=pl.x-run.cameraX;
    if(pl.hurt>0||game.popups.some(p=>p.kind==='hit')){
      const bubbleY=Math.max(100+(run.cameraY||0),pl.y-pl.h-46);
      rounded(x-34,bubbleY,68,34,12,'#fffbed','#ce5436');
      ctx.font='bold 22px Trebuchet MS';ctx.textAlign='center';ctx.fillStyle='#be482e';ctx.fillText('AV!',x,bubbleY+25);ctx.textAlign='start';
    }
  }
  function drawPowerups(run){
    for(const item of run.powerups||[]){
      const x=item.x-run.cameraX,y=item.y;
      if(item.type!=='hero'||x<-70||x>1250)continue;
      drawAsset('heroPickup',x-4,y-4,item.w+8,item.h+8,()=>{
        ctx.fillStyle='#8333bf';ctx.beginPath();ctx.moveTo(x+22,y+4);ctx.lineTo(x-3,y+27);ctx.lineTo(x+15,y+39);ctx.closePath();ctx.fill();
        ctx.beginPath();
        for(let i=0;i<10;i++){
          const angle=-Math.PI/2+i*Math.PI/5,r=i%2?8:18,px=x+21+Math.cos(angle)*r,py=y+21+Math.sin(angle)*r;
          if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
        }
        ctx.closePath();ctx.fillStyle='#ffdb50';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#8d632d';ctx.stroke();
      });
      ctx.font='bold 12px Trebuchet MS';ctx.fillStyle='#592d77';ctx.textAlign='center';ctx.fillText('SUPERHELT',x+item.w/2,y-10);ctx.textAlign='start';
    }
  }
  function drawHazards(run){
    for(const h of run.hazards){
      const x=h.x-run.cameraX,y=h.y;if(x<-90||x>1300)continue;
      if(h.type==='sausage')drawAsset('sausage',x-8,y-8,h.w+16,h.h+16,()=>{rounded(x,y,h.w,h.h,12,'#b96636');});
      else drawAsset('frisbee',x,y,h.w,h.h,()=>{ctx.fillStyle='#f5f4e1';ctx.strokeStyle='#e8714a';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x+h.w/2,y+h.h/2,h.w/2,h.h/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#fac866';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x+h.w/2,y+h.h/2,h.w*.30,h.h*.22,0,0,Math.PI*2);ctx.stroke();});
      ctx.strokeStyle='#fff9e0a0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+h.w+10,y+3);ctx.lineTo(x+h.w+36,y+3);ctx.moveTo(x+h.w+10,y+h.h-2);ctx.lineTo(x+h.w+25,y+h.h-2);ctx.stroke();
      if(x>810&&x<1150){ctx.fillStyle='#985030';ctx.font='bold 16px Trebuchet MS';ctx.fillText(h.type==='frisbee'?'FRISBEE!':'PØLSE!',x-15,y-18);}
    }
  }
  function draw(){
    const active=game.state==='PLAYING'||game.state==='RESULTS',run=active&&game.run?game.run:game.preview;
    canvas.dataset.motion=run.player.motion||'run';
    canvas.dataset.pose=getPlayerVisual(run).poseName;
    ctx.clearRect(0,0,1200,675);drawBackground(run.cameraX||0,run.ticks*Core.STEP,matchMedia('(prefers-reduced-motion: reduce)').matches);
    ctx.save();ctx.translate(0,-(run.cameraY||0));
    drawWorldFlags(run);drawTerrain(run);drawRunner(run);drawForegroundTrees(run);drawHazards(run);drawPowerups(run);drawSponsorBanners(run);drawPlayerFeedback(run);ctx.restore();
    if(!active){
      rounded(423,295,352,91,16,'#fff9e9f0','#55897a');
      ctx.textAlign='center';ctx.fillStyle='#397769';ctx.font='bold 12px Trebuchet MS';ctx.fillText('AULUM BYFEST PRÆSENTERER',599,320);ctx.fillStyle='#174e48';ctx.font='bold 43px Trebuchet MS';ctx.fillText('HOP & RUL',599,365);ctx.textAlign='start';
    }else if(game.state==='PLAYING'){
      ctx.textAlign='center';ctx.fillStyle='#245d50';ctx.font='bold 18px Trebuchet MS';
      let hint=run.scoreTicks<360?'Styr med ← → og find rytmen':run.scoreTicks<960?'HOP lige før landing. Fem perfekte giver bonus!':'';
      const groundCue=groundJumpCue(run);
      if(groundCue)hint=groundCue.ready?'HOP op på næste pude!':'Løb på jorden. Din perfekte serie er bevaret.';
      if(run.player.sliding)hint='WUUH! Slisken giver dig fart.';
      if(run.recoveryTicks>0)hint='OP IGEN! Du har stadig en chance.';
      if(run.player.flightTicks>0){
        const seconds=(Math.ceil(run.player.flightTicks/12)/10).toFixed(1).replace('.',',');
        hint='SUPERHELT · '+seconds+' sek.';
      }
      if(hint){rounded(357,122,486,38,15,'#fffbeddd');ctx.fillStyle='#245d50';ctx.fillText(hint,600,148);}
      ctx.textAlign='start';
      const feedback=game.popups.find(p=>p.kind==='bonus')||game.popups.filter(p=>p.kind!=='hit').at(-1);
      if(feedback){rounded(405,178,390,42,14,feedback.kind==='bonus'?'#fbd25ef5':'#fffbedf0');ctx.textAlign='center';ctx.font='bold 19px Trebuchet MS';ctx.fillStyle='#174e48';ctx.fillText(feedback.text,600,205);ctx.textAlign='start';}
    }
  }
  function frame(ts){
    if(lastFrame===null)lastFrame=ts;
    const elapsed=(ts-lastFrame)/1000;lastFrame=ts;
    if(game.state==='PLAYING'&&!game.paused&&!document.hidden){
      if(elapsed>.25){pause('interruption');}
      else{
        accumulator+=Math.max(0,elapsed);
        while(accumulator+1e-10>=Core.STEP&&game.state==='PLAYING'){
          Core.step(game.run,{jump:game.input.jump||pressedEdges.jump,left:game.input.left,right:game.input.right});
          pressedEdges.jump=false;processEvents();
          game.popups=game.popups.filter(p=>(p.t-=Core.STEP)>0);
          accumulator-=Core.STEP;
          if(game.run.status==='ended')finishRound();
        }
        if(game.state==='PLAYING')updateHUD();
      }
    }
    draw();requestAnimationFrame(frame);
  }
  const keyControl=key=>({ArrowLeft:'left',ArrowRight:'right',a:'left',A:'left',d:'right',D:'right',ArrowUp:'jump',' ':'jump',w:'jump',W:'jump'}[key]);
  addEventListener('keydown',e=>{
    if(game.state!=='PLAYING'||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='Escape'){e.preventDefault();if(!e.repeat){if(game.paused)resume();else pause();}return;}
    const control=keyControl(e.key);if(!control||game.paused)return;e.preventDefault();
    if(!e.repeat)setControl(control,e.code||e.key.toLowerCase(),true);unlockAudio();
  });
  addEventListener('keyup',e=>{const control=keyControl(e.key);if(control)setControl(control,e.code||e.key.toLowerCase(),false);});
  document.querySelectorAll('[data-control]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{if(game.state!=='PLAYING'||game.paused)return;e.preventDefault();button.setPointerCapture(e.pointerId);setControl(button.dataset.control,'pointer'+e.pointerId,true);unlockAudio();});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>setControl(button.dataset.control,'pointer'+e.pointerId,false));
    button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat&&!game.paused)setControl(button.dataset.control,'button',true);}});
    button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();setControl(button.dataset.control,'button',false);}});
    button.addEventListener('blur',()=>setControl(button.dataset.control,'button',false));
  });
  byId('pauseButton').onclick=()=>pause();byId('resumeButton').onclick=resume;
  byId('exitButton').onclick=()=>setState('INSTRUCTIONS');
  function soundLabel(){byId('soundButton').textContent=data.sound?'Lyd til':'Lyd fra';byId('soundButton').setAttribute('aria-pressed',String(data.sound));}
  byId('soundButton').onclick=()=>{data.sound=!data.sound;soundLabel();unlockAudio();save();};
  addEventListener('blur',()=>{resetInput();if(game.state==='PLAYING')pause('blur');});
  document.addEventListener('visibilitychange',()=>{resetInput();lastFrame=null;if(document.hidden&&game.state==='PLAYING')pause('hidden');});
  addEventListener('resize',()=>{
    if(game.state==='PLAYING'){if(needsRotation())pause('rotation');else if(game.paused)pause('manual');}
    if(game.state==='INSTRUCTIONS')byId('rotateHint').textContent=needsRotation()?'Vend telefonen på siden for at spille.':controlsText;
  });
  soundLabel();renderUI();requestAnimationFrame(frame);
})();
