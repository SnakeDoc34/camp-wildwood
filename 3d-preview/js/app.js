/* Camp Wildwood — app router, profiles screen, topbar */
'use strict';

const AVATARS=['🦝','🦊','🐻','🦉','🐸','🐢','🦌','🐿️'];

const App = {
  profile:null,
  show(id){
    if(id!=='screen-mission')Engine.suspend();
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('topbar').classList.toggle('hidden', id==='screen-title'||id==='screen-profiles');
    mascotSay(id!=='screen-title'&&id!=='screen-profiles');
    if(typeof Camp3D!=='undefined')Camp3D.sweep();
    window.scrollTo(0,0);
  },
  syncTop(){
    if(!this.profile) return;
    document.getElementById('profile-avatar').textContent=this.profile.avatar;
    document.getElementById('profile-name').textContent=this.profile.name;
    document.getElementById('token-count').textContent=this.profile.tokens;
  },
  showTargets(chId){ this.show('screen-targets'); Camp.renderTargets(chId); },
  showShop(){ Audio2.click();document.getElementById('shop-message').textContent='';this.show('screen-shop');Camp.renderShop(this.profile); },
  showDesign(itemId){
    Audio2.click();this.show('screen-design');Yard.selected=itemId&&Yard.owns(this.profile,itemId)&&Yard.isPlaceable(itemId)?itemId:null;
    if(itemId==='soccer-field'&&Yard.owns(this.profile,itemId)){Yard.ensure(this.profile).pitch='soccer';Store.persist();}
    Yard.soccer=null;if(typeof CampPlay!=='undefined'){CampPlay.soccer=null;CampPlay.canoe=null;}Yard.message=Yard.selected?'Choose a place for '+Yard.item(Yard.selected).name+'.':'Pick an item, then choose a place. Your camp saves as you build.';
    Yard.renderDesigner(this.profile);
  },
  init(){
    Store.init(); if(typeof Living!=='undefined')Living.init(); R.seed(Date.now()%2147483647);
    if('speechSynthesis' in window){ try{ speechSynthesis.getVoices(); }catch(e){} }
    // topbar
    document.getElementById('btn-home').onclick=()=>{ Audio2.click(); this.show('screen-hub'); Camp.renderHub(this.profile); };
    document.getElementById('profile-chip').onclick=()=>{ Audio2.click();this.show('screen-profiles');this.renderProfiles(); };
    document.getElementById('btn-sound').onclick=(e)=>{ const on=Audio2.toggle(); e.target.textContent=on?'🔊':'🔇'; };
    document.getElementById('btn-read').onclick=()=>{
      const txt=document.querySelector('.screen:not(.hidden)').innerText.slice(0,600);
      Audio2.speak(txt);
    };
    document.getElementById('btn-start').onclick=()=>{ Audio2.click(); this.show('screen-profiles'); this.renderProfiles(); };
    document.getElementById('btn-add-profile').onclick=()=>this.addProfile();
    document.getElementById('new-profile-name').addEventListener('keydown',e=>{ if(e.key==='Enter') this.addProfile(); });
    document.getElementById('btn-shop').onclick=()=>this.showShop();
    document.getElementById('btn-design').onclick=()=>this.showDesign();
    document.getElementById('designer-shop').onclick=()=>this.showShop();
    document.getElementById('shop-design').onclick=()=>this.showDesign();
    document.getElementById('btn-report').onclick=()=>{ Audio2.click(); this.show('screen-report'); Camp.renderReport(this.profile); };
    document.getElementById('btn-guide').onclick=()=>{ Audio2.click(); this.show('screen-guide'); Camp.renderGuide(this.profile); };
    const unlockToggle=document.getElementById('unlock-all-toggle');
    if(unlockToggle){ unlockToggle.checked=Settings.unlockAll; unlockToggle.onchange=e=>{ Settings.setUnlockAll(e.target.checked); toast(e.target.checked?'🔓 All missions unlocked.':'🔒 Trail order on — missions unlock in order.'); }; }
    const calm=document.getElementById('calm-visuals-toggle');
    if(calm){calm.checked=Settings.calmVisuals;calm.onchange=e=>Settings.setCalmVisuals(e.target.checked);}
    document.getElementById('btn-print').onclick=()=>window.print();
    document.getElementById('btn-quit-mission').onclick=()=>{ Audio2.stopNarration(); document.onkeydown=null; this.showTargets(this.targetChapter()); };
    document.querySelectorAll('[data-go="hub"]').forEach(b=>b.onclick=()=>{ Audio2.click(); this.show('screen-hub'); Camp.renderHub(this.profile); });
    this.show('screen-title');
    if(!Store._ls)toast('Progress is temporary: this browser cannot save right now.',6000);
  },
  targetChapter(){ return (Engine.target&&Engine.target.chapter)||'ch8'; },
  renderProfiles(){
    const list=document.getElementById('profile-list'); list.innerHTML='';
    const ids=Object.keys(Store.profiles);
    if(!ids.length) list.appendChild(el('p','hint','No campers yet — add one below!'));
    ids.forEach(id=>{
      const p=Store.profiles[id];
      const card=el('div','card profile-card');
      const choose=el('button','profile-select','<span class="art">'+esc(p.avatar)+'</span><span><strong>'+esc(p.name)+'</strong><span class="fine">🪙 '+p.tokens+' camp tokens</span></span>');
      choose.onclick=()=>{ Audio2.pop();this.profile=Store.profile(id);this.syncTop();this.show('screen-hub');Camp.renderHub(this.profile); };
      card.appendChild(choose);
      const del=el('button','hint-btn','Remove');
      del.onclick=(e)=>{ e.stopPropagation(); if(confirm('Remove '+p.name+' and their whole camp?')){ Store.deleteProfile(id); this.renderProfiles(); } };
      card.appendChild(del);
      list.appendChild(card);
    });
  },
  addProfile(){
    const inp=document.getElementById('new-profile-name');
    const name=inp.value.trim().slice(0,16);
    if(!name){ toast('Type a nickname first!'); return; }
    const avatar=AVATARS[Object.keys(Store.profiles).length % AVATARS.length];
    const p=newProfileState(name, avatar);
    Store.saveProfile(p); inp.value='';
    Audio2.pop(); toast('Welcome to Camp Wildwood, '+name+'!');
    this.renderProfiles();
  }
};

document.addEventListener('DOMContentLoaded',()=>App.init());
