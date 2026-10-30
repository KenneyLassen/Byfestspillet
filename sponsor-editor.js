/* Local sponsor authoring: a memory-only draft and an explicit JSON download. */
(() => {
  'use strict';
  const Config=window.SponsorConfig,byId=id=>document.getElementById(id);
  let config={version:1,sponsors:[]},editingId=null,selectedImage,hasChanges=false,busy=false;
  const form=byId('sponsorForm'),nameInput=byId('sponsorName'),logoInput=byId('sponsorLogo');

  function status(message,error=false){
    byId('status').textContent=message;
    byId('status').dataset.error=String(error);
  }

  function setBusy(value){
    busy=value;
    for(const id of ['saveSponsor','sponsorLogo','sponsorName','cancelEdit','removeLogo','openConfig','downloadConfig'])byId(id).disabled=value;
  }

  function updateFormPreview(){
    byId('formPreview').hidden=!selectedImage;
    byId('removeLogo').hidden=!selectedImage;
    if(selectedImage)byId('formLogo').src=selectedImage;
    else byId('formLogo').removeAttribute('src');
  }

  function resetForm(){
    editingId=null;selectedImage=undefined;nameInput.value='';logoInput.value='';
    byId('formTitle').textContent='Tilføj en sponsor';
    byId('saveSponsor').textContent='Tilføj sponsor';
    byId('cancelEdit').hidden=true;
    updateFormPreview();
  }

  function commit(next){
    config=Config.parse(next);hasChanges=true;renderList();
  }

  function button(text,label,action,disabled=false){
    const node=document.createElement('button');node.type='button';node.className='quiet';
    node.textContent=text;node.setAttribute('aria-label',label);node.disabled=disabled;node.onclick=()=>{if(!busy)action();};
    return node;
  }

  function edit(sponsor){
    editingId=sponsor.id;nameInput.value=sponsor.name;selectedImage=sponsor.image;logoInput.value='';
    byId('formTitle').textContent='Rediger sponsor';byId('saveSponsor').textContent='Gem sponsor';
    byId('cancelEdit').hidden=false;updateFormPreview();nameInput.focus();
    status('Rediger sponsoren, og klik Gem sponsor.');
  }

  function move(index,direction){
    const sponsors=config.sponsors.slice(),target=index+direction;
    if(target<0||target>=sponsors.length)return;
    [sponsors[index],sponsors[target]]=[sponsors[target],sponsors[index]];
    commit({version:1,sponsors});status('Rækkefølgen er ændret i din kladde.');
  }

  function remove(sponsor){
    commit({version:1,sponsors:config.sponsors.filter(entry=>entry.id!==sponsor.id)});
    if(editingId===sponsor.id)resetForm();
    status(sponsor.name+' er fjernet fra kladden.');
  }

  function renderList(){
    const list=byId('sponsorList');list.replaceChildren();
    byId('emptyState').hidden=config.sponsors.length>0;
    byId('sponsorCount').textContent=config.sponsors.length+' af '+Config.limits.sponsors;
    config.sponsors.forEach((sponsor,index)=>{
      const card=document.createElement('li');card.className='sponsor-card';
      const preview=document.createElement('div');preview.className='banner-preview';
      const logo=document.createElement('div');logo.className='logo';
      const fallback=document.createElement('span');fallback.textContent='Indlæser billede…';logo.append(fallback);
      if(sponsor.image){
        const image=document.createElement('img');image.alt=sponsor.name;
        image.onload=()=>{fallback.hidden=true;};
        image.onerror=()=>{image.remove();fallback.textContent='Billedet kan ikke vises';fallback.hidden=false;};
        image.src=sponsor.image;logo.append(image);
      }
      preview.append(logo);
      const info=document.createElement('div');info.className='card-info';
      const title=document.createElement('h3');title.textContent=sponsor.name;info.append(title);
      const actions=document.createElement('div');actions.className='actions';
      actions.append(button('Rediger','Rediger '+sponsor.name,()=>edit(sponsor)),
        button('Op','Flyt '+sponsor.name+' op',()=>move(index,-1),index===0),
        button('Ned','Flyt '+sponsor.name+' ned',()=>move(index,1),index===config.sponsors.length-1),
        button('Fjern','Fjern '+sponsor.name,()=>remove(sponsor)));
      info.append(actions);card.append(preview,info);list.append(card);
    });
  }

  function readFile(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error('Filen kunne ikke læses. Prøv igen.'));
      reader.readAsDataURL(file);
    });
  }

  function checkImage(source){
    return new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve();
      image.onerror=()=>reject(new Error('Billedet kunne ikke åbnes. Vælg en PNG, JPEG eller WebP.'));
      image.src=source;
    });
  }

  logoInput.onchange=async()=>{
    const file=logoInput.files[0];if(!file)return;
    const previous=selectedImage;setBusy(true);
    try{
      if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Vælg et PNG-, JPEG- eller WebP-billede.');
      if(file.size>Config.limits.imageBytes)throw new Error('Et sponsorbillede må højst fylde 3 MB.');
      const image=await readFile(file);await checkImage(image);selectedImage=image;hasChanges=true;
      if(!nameInput.value.trim())nameInput.value=file.name.replace(/\.[^.]*$/,'').trim().slice(0,Config.limits.nameLength)||'Sponsorbillede';
      updateFormPreview();status('Billedet er klar. Tilføj eller gem sponsoren.');
    }catch(error){selectedImage=previous;logoInput.value='';status(error.message,true);}
    finally{setBusy(false);}
  };

  byId('removeLogo').onclick=()=>{selectedImage=undefined;logoInput.value='';hasChanges=true;updateFormPreview();};
  byId('cancelEdit').onclick=()=>{resetForm();status('Redigeringen er annulleret.');};
  nameInput.oninput=()=>{hasChanges=true;};
  form.onsubmit=event=>{
    event.preventDefault();if(busy)return;
    try{
      if(!selectedImage){status('Vælg et sponsorbillede, før du gemmer.',true);logoInput.focus();return;}
      const id=editingId||(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
      const entry={id,name:nameInput.value};if(selectedImage)entry.image=selectedImage;
      const sponsors=config.sponsors.slice(),index=sponsors.findIndex(sponsor=>sponsor.id===editingId);
      if(index<0)sponsors.push(entry);else sponsors[index]=entry;
      commit({version:1,sponsors});resetForm();nameInput.focus();
      status('Sponsoren er gemt i kladden. Hent sponsorfilen, når listen er klar.');
    }catch(error){status(error.message,true);}
  };

  byId('openConfig').onclick=()=>byId('configFile').click();
  byId('configFile').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;setBusy(true);
    try{
      if(file.size>Config.limits.configBytes)throw new Error('Sponsorfilen må højst fylde 8 MB.');
      const imported=Config.parse(await file.text());commit(imported);resetForm();
      status('Sponsorfilen er åbnet. '+config.sponsors.length+' sponsorer er klar i kladden.');
    }catch(error){status(error.message,true);}
    finally{event.target.value='';setBusy(false);}
  };

  byId('downloadConfig').onclick=()=>{
    if(busy)return;
    if(editingId||nameInput.value.trim()||selectedImage){
      status('Tilføj eller gem sponsoren først, eller annullér redigeringen.',true);nameInput.focus();return;
    }
    try{
      const text=Config.serialize(config),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download='sponsorer.json';
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status('Sponsorfilen er hentet. Erstat sponsorer.json i spillets mappe, og udgiv spillet for at vise ændringen til alle.');
    }catch(error){status(error.message,true);}
  };

  renderList();
  setBusy(true);
  fetch('sponsorer.json',{cache:'no-store'}).then(response=>{
    if(!response.ok)throw new Error('Sponsorfilen kunne ikke indlæses.');
    return response.text();
  }).then(text=>{
    const loaded=Config.parse(text);
    if(!hasChanges){config=loaded;renderList();status('Den nuværende sponsorfil er indlæst. '+config.sponsors.length+' sponsorer.');}
    else status('Din kladde er bevaret. Den indlæste fil blev ikke lagt oven i dine ændringer.');
  }).catch(()=>status('Den nuværende sponsorfil kunne ikke indlæses. Du kan stadig tilføje sponsorer eller åbne en sponsorfil.',true))
    .finally(()=>setBusy(false));
})();
