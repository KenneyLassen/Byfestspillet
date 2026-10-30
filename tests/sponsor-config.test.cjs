const test=require('node:test');
const assert=require('node:assert/strict');
const Config=require('../sponsor-config.js');
const PICTURE='data:image/png;base64,AAAA';

test('every actual sponsor requires a picture for parsing and export while an empty list stays valid',()=>{
  for(const image of [undefined,'','  ']){
    const value={version:1,sponsors:[{id:'partner',name:'Intern betegnelse',image}]};
    assert.throws(()=>Config.parse(value),/billede/i);
    assert.throws(()=>Config.serialize(value),/billede/i);
  }
  assert.deepEqual(Config.parse({version:1,sponsors:[]}),{version:1,sponsors:[]});
});

test('sponsor files round-trip names, stable identities, logos and display order without changing the input',()=>{
  const input={version:1,sponsors:[
    {id:'lokal-1',name:'  Lokal sponsor  ',image:'art/sponsorer/logo.png'},
    {id:'lokal-2',name:'Anden sponsor',image:PICTURE}
  ]};
  const before=JSON.stringify(input);
  const expected={version:1,sponsors:[
    {id:'lokal-1',name:'Lokal sponsor',image:'art/sponsorer/logo.png'},
    {id:'lokal-2',name:'Anden sponsor',image:PICTURE}
  ]};
  assert.deepEqual(Config.parse(input),expected);
  assert.deepEqual(Config.parse(Config.serialize(input)),expected);
  assert.equal(JSON.stringify(input),before);
});

test('sponsor files reject missing identities, duplicate identities, blank or oversized names and unsupported versions',()=>{
  const valid={id:'partner',name:'Lokal sponsor',image:PICTURE};
  for(const value of [null,[],{version:2,sponsors:[]},{version:1,sponsors:{}},
    {version:1,sponsors:[{name:'Mangler id'}]},
    {version:1,sponsors:[valid,{...valid,name:'Anden'}]},
    {version:1,sponsors:[{...valid,id:'../partner'}]},
    {version:1,sponsors:[{...valid,name:'  '}]},
    {version:1,sponsors:[{...valid,name:'x'.repeat(61)}]}]){
    assert.throws(()=>Config.parse(value),Error);
  }
  assert.deepEqual(Config.parse({version:1,sponsors:[]}),{version:1,sponsors:[]});
  assert.equal(Config.parse({version:1,sponsors:[{...valid,name:'Æ'.repeat(60)}]}).sponsors[0].name.length,60);
});

test('logos accept portable raster data or relative raster paths and reject executable, remote and traversal sources',()=>{
  const entry=image=>({version:1,sponsors:[{id:'partner',name:'Sponsor',image}]});
  for(const image of ['art/sponsorer/Logo Øst.png','./logo.webp','logo.JPEG','data:image/png;base64,AAAA',
    'data:image/jpeg;base64,AA==','data:image/webp;base64,AAA=']){
    assert.equal(Config.parse(entry(image)).sponsors[0].image,image);
  }
  assert.throws(()=>Config.parse(entry('  ')),/billede/i);
  for(const image of ['https://example.com/logo.png','//example.com/logo.png','/logo.png',
    '../logo.png','art/../logo.png','%2e%2e/logo.png','art\\logo.png','logo.svg',
    'data:image/svg+xml;base64,AAAA','data:text/html;base64,AAAA',
    'data:image/png;base64,not base64','data:image/png;base64,AAA','logo.png?url=example.com',42]){
    assert.throws(()=>Config.parse(entry(image)),Error,String(image));
  }
});

test('bounded sponsor files allow 24 entries and a 3 MiB logo but reject oversized content with useful errors',()=>{
  const sponsors=Array.from({length:24},(_,i)=>({id:'partner-'+i,name:'Sponsor '+i,image:PICTURE}));
  assert.equal(Config.parse({version:1,sponsors}).sponsors.length,24);
  assert.throws(()=>Config.parse({version:1,sponsors:[...sponsors,{id:'extra',name:'Ekstra'}]}),/24/);
  const image='data:image/png;base64,'+'A'.repeat(4*1024*1024);
  assert.equal(Config.parse({version:1,sponsors:[{id:'logo',name:'Logo',image}]}).sponsors[0].image,image);
  assert.throws(()=>Config.parse({version:1,sponsors:[{id:'logo',name:'Logo',image:image+'AAAA'}]}),/3 MB/);
  assert.throws(()=>Config.parse({version:1,sponsors:[{id:'one',name:'En',image},{id:'two',name:'To',image}]}),/8 MB/);
  assert.throws(()=>Config.parse(' '.repeat(8*1024*1024+1)),/8 MB/);
  assert.throws(()=>Config.parse('{broken json'),/JSON/);
});
