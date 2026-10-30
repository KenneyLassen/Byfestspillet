const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Config=require('../sponsor-config.js');
const SCRIPT=fs.readFileSync(path.join(__dirname,'../sponsor-editor.js'),'utf8');
const HTML=fs.readFileSync(path.join(__dirname,'../sponsorer.html'),'utf8');
const PICTURE='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWioAAAAASUVORK5CYII=';

function editor(){
  const nodes=new Map(),downloads=[],blobs=[];let resolveFetch,id=0;
  class Element{
    constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.disabled=false;this.value='';this.files=[];this.hidden=false;this.textContent='';}
    append(...items){this.children.push(...items);for(const item of items)item.parent=this;}
    replaceChildren(...items){this.children=[];this.append(...items);}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
    setAttribute(key,value){this[key]=value;}
    removeAttribute(key){delete this[key];}
    focus(){}
    click(){if(this.disabled)return;if(this.tagName==='a')downloads.push({name:this.download,blob:blobs.at(-1)});this.onclick?.();}
  }
  for(const match of HTML.matchAll(/id="([^"]+)"/g))nodes.set(match[1],new Element());
  const document={getElementById:key=>nodes.get(key),createElement:tag=>new Element(tag),body:new Element('body')};
  const sandbox={window:{SponsorConfig:Config},document,Blob,
    URL:{createObjectURL:blob=>{blobs.push(blob);return 'blob:test';},revokeObjectURL(){}},
    crypto:{randomUUID:()=> 'created-'+(++id)},setTimeout:callback=>{callback();return 1;},
    fetch:()=>new Promise(resolve=>{resolveFetch=resolve;}),
    FileReader:class{readAsDataURL(file){this.result=file.data;queueMicrotask(()=>this.onload());}},
    Image:class{set src(value){this.value=value;queueMicrotask(()=>this.onload());}}
  };
  vm.runInNewContext(SCRIPT,sandbox,{filename:'sponsor-editor.js'});
  return {nodes,downloads,
    async load(value){resolveFetch({ok:true,text:async()=>Config.serialize(value)});await new Promise(setImmediate);},
    async fail(){resolveFetch({ok:false});await new Promise(setImmediate);},
    fill(value){const input=nodes.get('sponsorName');if(!input.disabled){input.value=value;input.oninput?.();}},
    async upload(name='banner.png'){const input=nodes.get('sponsorLogo');if(!input.disabled){input.files=[{name,type:'image/png',size:100,data:PICTURE}];await input.onchange();}},
    submit(){if(!nodes.get('saveSponsor').disabled)nodes.get('sponsorForm').onsubmit({preventDefault(){}});}
  };
}

test('pending initial load prevents edits and export, then adding preserves the published picture list',async()=>{
  const app=editor();
  for(const id of ['saveSponsor','sponsorName','sponsorLogo','downloadConfig'])assert.equal(app.nodes.get(id).disabled,true,id+' is disabled during loading');
  app.fill('For tidlig sponsor');await app.upload();app.submit();app.nodes.get('downloadConfig').click();
  assert.equal(app.downloads.length,0);
  await app.load({version:1,sponsors:[{id:'existing',name:'Eksisterende sponsor',image:PICTURE}]});
  assert.equal(app.nodes.get('saveSponsor').disabled,false);
  app.fill('Ny sponsor');await app.upload();app.submit();app.nodes.get('downloadConfig').click();
  assert.equal(app.downloads.length,1);
  assert.equal(app.downloads[0].name,'sponsorer.json');
  const exported=Config.parse(await app.downloads[0].blob.text());
  assert.deepEqual(exported.sponsors.map(entry=>[entry.id,entry.name,entry.image]),[
    ['existing','Eksisterende sponsor',PICTURE],['created-1','Ny sponsor',PICTURE]
  ]);
});

test('upload supplies an internal filename label, and failed picture previews never substitute that label',async()=>{
  const app=editor();await app.load({version:1,sponsors:[]});
  await app.upload('Aulum partner.png');
  assert.equal(app.nodes.get('sponsorName').value,'Aulum partner');
  app.submit();
  const card=app.nodes.get('sponsorList').children[0],preview=card.children[0].children[0];
  preview.children.find(child=>child.tagName==='img').onerror();
  assert.equal(preview.children[0].textContent,'Billedet kan ikke vises');
  assert.equal(preview.children[0].hidden,false);
  app.nodes.get('downloadConfig').click();
  const exported=Config.parse(await app.downloads[0].blob.text());
  assert.equal(exported.sponsors[0].image,PICTURE);
});

test('removing a required picture cannot save a name-only entry, and failed initial loading unlocks recovery',async()=>{
  const app=editor();await app.fail();
  assert.equal(app.nodes.get('sponsorLogo').disabled,false);
  assert.equal(app.nodes.get('status').dataset.error,'true');
  await app.upload('Sponsor.png');app.submit();
  const card=app.nodes.get('sponsorList').children[0];
  card.children[1].children[1].children[0].click();
  app.nodes.get('removeLogo').click();app.submit();
  assert.equal(app.nodes.get('status').dataset.error,'true');
  assert.match(app.nodes.get('status').textContent,/billede/i);
  app.nodes.get('cancelEdit').click();app.nodes.get('downloadConfig').click();
  const exported=Config.parse(await app.downloads[0].blob.text());
  assert.equal(exported.sponsors.length,1);assert.equal(exported.sponsors[0].image,PICTURE);
});
