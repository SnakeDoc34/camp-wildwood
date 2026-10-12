/* Camp Wildwood — app router, profiles screen, topbar */
'use strict';

const AVATARS=['🦝','🦊','🐻','🦉','🐸','🐢','🦌','🐿️'];

const App = {
  profile:null,
  show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('topbar').classList.toggle('hidden', id==='screen-title'||id==='screen-profiles');
    mascotSay(id!=='screen-title'&&id!=='screen-profiles');
    window.scrollTo(0,0);
  },
  syncTop(){
    if(!this.profile) return;
    document.getElementById('profile-avatar').textContent=this.profile.avatar;
    document.getElementById('profile-name').textContent=this.profile.name;
    document.getElementById('token-count').textContent=this.profile.tokens;
  },
  showTargets(chId){ this.show('screen-targets'); Camp.renderTargets(chId); },
  init(){
    Store.init(); R.seed(Date.now()%2147483647);
    if('speechSynthesis' in window){ try{ speechSynthesis.getVoices(); }catch(e){} }
    // topbar
    document.getElementById('btn-home').onclick=()=>{ Audio2.click(); this.show('screen-hub'); Camp.renderHub(this.profile); };
    document.getElementById('btn-sound').onclick=(e)=>{ const on=Audio2.toggle(); e.target.textContent=on?'🔊':'🔇'; };
    document.getElementById('btn-read').onclick=()=>{
      const txt=document.querySelector('.screen:not(.hidden)').innerText.slice(0,600);
      Audio2.speak(txt);
    };
    document.getElementById('btn-start').onclick=()=>{ Audio2.click(); this.show('screen-profiles'); this.renderProfiles(); };
    document.getElementById('btn-add-profile').onclick=()=>this.addProfile();
    document.getElementById('new-profile-name').addEventListener('keydown',e=>{ if(e.key==='Enter') this.addProfile(); });
    document.getElementById('btn-shop').onclick=()=>{ Audio2.click(); this.show('screen-shop'); Camp.renderShop(this.profile); };
    document.getElementById('btn-report').onclick=()=>{ Audio2.click(); this.show('screen-report'); Camp.renderReport(this.profile); };
    document.getElementById('btn-print').onclick=()=>window.print();
    document.getElementById('btn-quit-mission').onclick=()=>{ Audio2.stopNarration(); document.onkeydown=null; this.showTargets(this.targetChapter()); };
    document.querySelectorAll('[data-go="hub"]').forEach(b=>b.onclick=()=>{ Audio2.click(); this.show('screen-hub'); Camp.renderHub(this.profile); });
    this.show('screen-title');
  },
  targetChapter(){ return (Engine.target&&Engine.target.chapter)||'ch8'; },
  renderProfiles(){
    const list=document.getElementById('profile-list'); list.innerHTML='';
    const ids=Object.keys(Store.profiles);
    if(!ids.length) list.appendChild(el('p','hint','No campers yet — add one below!'));
    ids.forEach(id=>{
      const p=Store.profiles[id];
      const card=el('div','card');
      card.innerHTML='<div class="art">'+esc(p.avatar)+'</div><h3>'+esc(p.name)+'</h3><p class="hint">🪙 '+p.tokens+' tokens</p>';
      const del=el('button','hint-btn','Remove');
      del.onclick=(e)=>{ e.stopPropagation(); if(confirm('Remove '+p.name+' and their whole camp?')){ Store.deleteProfile(id); this.renderProfiles(); } };
      card.appendChild(del);
      card.onclick=()=>{ Audio2.pop(); this.profile=Store.profile(id); this.syncTop(); this.show('screen-hub'); Camp.renderHub(this.profile); };
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
