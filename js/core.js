/* Camp Wildwood — core: RNG, storage, audio, profiles */
'use strict';

/* ---------- RNG (mulberry32, seedable) ---------- */
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const R = {
  rand:null,
  seed(s){ this.rand = mulberry32(s); },
  f(){ return this.rand ? this.rand() : Math.random(); },
  int(min,max){ return min + Math.floor(this.f()*(max-min+1)); },
  choice(arr){ return arr[Math.floor(this.f()*arr.length)]; },
  shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(this.f()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
};

/* ---------- Storage (localStorage, per-profile namespaced) ---------- */
const Store = {
  KEY:'campWildwood.v1',
  BACKUP_KEY:'campWildwood.v1.backup',
  _mem:{},
  _ls:false,
  init(){
    try{ localStorage.setItem('__cw_test','1'); localStorage.removeItem('__cw_test'); this._ls=true; }
    catch(e){ this._ls=false; }
    if(this._ls){
      const read=key=>{try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch(e){return null;}};
      this._mem=read(this.KEY)||read(this.BACKUP_KEY)||{};
    }
    for(const [id,p] of Object.entries(this.profiles)){
      if(!p||typeof p!=='object'||Array.isArray(p))continue;
      p.id=p.id||id;p.name=typeof p.name==='string'?p.name:'Camper';p.avatar=p.avatar||'🦝';
      p.tokens=Number.isFinite(p.tokens)?Math.max(0,p.tokens):0;
      for(const field of ['targets','seen','missionsDone','activeMissions'])if(!p[field]||typeof p[field]!=='object'||Array.isArray(p[field]))p[field]={};
      if(!p.camp||typeof p.camp!=='object'||Array.isArray(p.camp))p.camp={lodge:0,field:0};
      if(!Array.isArray(p.shop))p.shop=[];if(!Array.isArray(p.report))p.report=[];
    }
    if(typeof Settings!=='undefined')Settings.init();
  },
  _save(){
    if(!this._ls)return;
    try{
      const old=localStorage.getItem(this.KEY);
      if(old){try{const v=JSON.parse(old);if(v&&typeof v==='object'&&!Array.isArray(v))localStorage.setItem(this.BACKUP_KEY,old);}catch(e){}}
      localStorage.setItem(this.KEY,JSON.stringify(this._mem));
    }catch(e){this._ls=false;if(typeof document!=='undefined'&&document.getElementById('toast'))toast('Progress is temporary: this browser cannot save right now.',6000);}
  },
  get profiles(){
    if(!this._mem.profiles||typeof this._mem.profiles!=='object'||Array.isArray(this._mem.profiles))this._mem.profiles={};
    return this._mem.profiles;
  },
  profile(id){ return this.profiles[id]; },
  saveProfile(p){ this.profiles[p.id]=p; this._save(); },
  deleteProfile(id){ delete this.profiles[id]; this._save(); },
  persist(){ this._save(); }
};

/* ---------- Teacher settings (device-level, shared by all campers on this device) ---------- */
const Settings = {
  KEY:'campWildwood.settings',
  unlockAll:false,
  init(){
    try{ const v=JSON.parse(localStorage.getItem(this.KEY)); if(v&&typeof v==='object'&&!Array.isArray(v)) this.unlockAll=!!v.unlockAll; }catch(e){}
  },
  save(){ try{ localStorage.setItem(this.KEY,JSON.stringify({unlockAll:this.unlockAll})); }catch(e){} },
  setUnlockAll(v){ this.unlockAll=!!v; this.save(); }
};
function newProfileState(name, avatar){
  return {
    id:'p'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),
    name, avatar: avatar||'🦝', created:Date.now(),
    tokens:0,
    camp:{ lodge:0, field:0 },           // restoration stages and saved camp design
    shop:[],                              // owned cosmetic ids
    targets:{},                           // targetId -> {attempts:[bool], done:bool, badge:bool}
    seen:{},                              // familyId -> [keys]
    missionsDone:{},                      // missionKey -> true (token awarded once)
    report:[]                             // session log entries {t, text, good, total}
  };
}

/* ---------- Audio: sfx + narration + read-aloud ---------- */
const Audio2 = {
  ctx:null, enabled:true, current:null, narrationEpoch:0, fallbackTimer:null,
  ac(){
    if(!this.ctx){ try{ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
    return this.ctx;
  },
  tone(freq,dur,type,vol,when){
    if(!this.enabled) return;
    const ctx=this.ac(); if(!ctx) return;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type||'sine'; o.frequency.value=freq;
    const t=ctx.currentTime+(when||0);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.18,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+dur+0.05);
  },
  good(){ this.tone(523,.12,'sine'); this.tone(659,.12,'sine',.18,.1); this.tone(784,.2,'sine',.18,.2); },
  bad(){ this.tone(220,.18,'triangle',.15); this.tone(180,.22,'triangle',.15,.12); },
  click(){ this.tone(440,.06,'square',.06); },
  pop(){ this.tone(880,.08,'sine',.12); this.tone(1174,.1,'sine',.1,.06); },
  stopNarration(){
    this.narrationEpoch++;clearTimeout(this.fallbackTimer);this.fallbackTimer=null;
    if(this.current){ try{ this.current.pause(); this.current.currentTime=0; }catch(e){} this.current=null; }
    try{ speechSynthesis.cancel(); }catch(e){}
  },
  /* Play a demo MP3; fall back to speechSynthesis reading `fallbackText`. onend called either way. */
  narrate(src, fallbackText, onend){
    this.stopNarration();
    if(!this.enabled){ if(onend) onend(); return; }
    if(!src){this.speak(fallbackText,onend);return;}
    // Prefer embedded Melody-voice clips (audio/a*.js); fall back to file URL, then speech.
    const name = String(src).split('/').pop();
    const data=window.AUDIO_DATA||{},embedded=data[name]||data['m1-'+name]||null;
    const audio=new Audio(embedded||src),epoch=this.narrationEpoch;
    let finished=false,started=false;
    const valid=()=>!finished&&epoch===this.narrationEpoch;
    const done=()=>{if(!valid())return;finished=true;clearTimeout(this.fallbackTimer);this.current=null;if(onend)onend();};
    const fallback=()=>{if(!valid())return;finished=true;clearTimeout(this.fallbackTimer);audio.pause();this.current=null;this.speak(fallbackText,onend);};
    audio.onended=done;audio.onerror=fallback;
    audio.oncanplaythrough=()=>{if(!valid()||started)return;started=true;try{audio.play().then(()=>{if(valid())clearTimeout(this.fallbackTimer);}).catch(fallback);}catch(e){fallback();}};
    this.fallbackTimer=setTimeout(()=>{if(valid()&&audio.paused)fallback();},4000);
    this.current=audio;
  },
  speak(text, onend){
    this.stopNarration();
    if(!this.enabled){if(onend)onend();return;}
    const epoch=this.narrationEpoch;
    try{
      const spoken=String(text).replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/→/g,' then ').replace(/\+/g,' plus ').replace(/=/g,' equals ');
      const u=new SpeechSynthesisUtterance(spoken);
      u.rate=0.95; u.pitch=1.05;
      const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith('en'));
      const fem=vs.find(v=>/female|zira|samantha|google us english|tessa/i.test(v.name));
      if(fem) u.voice=fem;
      u.onend=()=>{ if(epoch===this.narrationEpoch&&onend) onend(); };u.onerror=u.onend;
      speechSynthesis.speak(u);
    }catch(e){ if(onend) onend(); }
  },
  toggle(){ this.enabled=!this.enabled; if(!this.enabled) this.stopNarration(); return this.enabled; }
};

/* ---------- tiny DOM helpers ---------- */
function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function toast(msg, ms){
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add('hidden'), ms||2200);
}
function confetti(n){
  const layer=document.getElementById('confetti-layer');
  const colors=['#ffcf4d','#43a468','#2f7fd0','#d94f3d','#b678e0'];
  for(let i=0;i<(n||40);i++){
    const c=el('div','confetti'); c.style.left=Math.random()*100+'vw';
    c.style.background=colors[i%colors.length];
    c.style.animationDuration=(1.6+Math.random()*1.6)+'s';
    c.style.animationDelay=(Math.random()*0.5)+'s';
    layer.appendChild(c); setTimeout(()=>c.remove(),3600);
  }
}
function mascotSay(show){ document.getElementById('mascot').classList.toggle('hidden', !show); }
