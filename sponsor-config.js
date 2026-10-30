/* Shared sponsor-file contract for the game and the local editor. */
(function(root,factory){
  'use strict';

  const config=factory();
  if(typeof module==='object'&&module.exports)module.exports=config;
  else root.SponsorConfig=config;
}(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const limits=Object.freeze({sponsors:24,nameLength:60,imageBytes:3*1024*1024,configBytes:8*1024*1024});

  function byteLength(text){
    let size=0;
    for(let i=0;i<text.length;i++){
      const code=text.codePointAt(i);
      size+=code<=0x7f?1:code<=0x7ff?2:code<=0xffff?3:4;
      if(code>0xffff)i++;
    }
    return size;
  }

  function encode(value){return JSON.stringify(value,null,2)+'\n';}

  function checkFileSize(text){
    if(text.length>limits.configBytes||byteLength(text)>limits.configBytes){
      throw new Error('Sponsorfilen må højst fylde 8 MB. Brug mindre billeder.');
    }
  }

  function imageSource(value){
    if(typeof value!=='string')throw new Error('Hver sponsor skal have et sponsorbillede.');
    const image=value.trim();
    if(!image)throw new Error('Hver sponsor skal have et sponsorbillede.');
    const raster=/^data:image\/(?:png|jpeg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/i.exec(image);
    if(raster&&raster[1].length%4===0){
      const payload=raster[1],padding=payload.endsWith('==')?2:payload.endsWith('=')?1:0;
      if(payload.length/4*3-padding>limits.imageBytes)throw new Error('Et sponsorbillede må højst fylde 3 MB.');
      return image;
    }
    const path=/^[\p{L}\p{N}_ .()/~-]+\.(?:png|jpe?g|webp)$/iu.test(image);
    if(path&&!image.startsWith('/')&&!image.includes('..'))return image;
    throw new Error('Brug PNG, JPEG eller WebP. Billedstien skal være relativ uden .. eller en ekstern adresse.');
  }

  function parse(value){
    let source=value;
    if(typeof value==='string'){
      checkFileSize(value);
      try{source=JSON.parse(value);}catch{throw new Error('Sponsorfilen er ikke gyldig JSON.');}
    }
    if(!source||Array.isArray(source)||source.version!==1||!Array.isArray(source.sponsors)){
      throw new Error('Sponsorfilen skal have version 1 og en liste med sponsorer.');
    }
    if(source.sponsors.length>limits.sponsors)throw new Error('Der er plads til højst 24 sponsorer.');
    const identities=new Set();
    const result={version:1,sponsors:source.sponsors.map(sponsor=>{
      if(!sponsor||typeof sponsor.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(sponsor.id)){
        throw new Error('Hver sponsor skal have et gyldigt id.');
      }
      if(identities.has(sponsor.id))throw new Error('To sponsorer må ikke have samme id.');
      identities.add(sponsor.id);
      if(typeof sponsor.name!=='string'||!sponsor.name.trim()||sponsor.name.trim().length>limits.nameLength){
        throw new Error('Betegnelsen skal være mellem 1 og 60 tegn.');
      }
      const entry={id:sponsor.id,name:sponsor.name.trim(),image:imageSource(sponsor.image)};
      return entry;
    })};
    checkFileSize(encode(result));
    return result;
  }

  function serialize(value){return encode(parse(value));}

  return {parse,serialize,limits};
}));
