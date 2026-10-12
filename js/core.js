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
  _mem:{},
  _ls:false,
  init(){
    try{ localStorage.setItem('__cw_test','1'); localStorage.removeItem('__cw_test'); this._ls=true; }
    catch(e){ this._ls=false; }
    if(this._ls){
      try{ this._mem = JSON.parse(localStorage.getItem(this.KEY)) || {}; }catch(e){ this._mem={}; }
    }
  },
  _save(){ if(this._ls){ try{ localStorage.setItem(this.KEY, JSON.stringify(this._mem)); }catch(e){} } },
  get profiles(){ return this._mem.profiles || (this._mem.profiles = {}); },
  profile(id){ return this.profiles[id]; },
  saveProfile(p){ this.profiles[p.id]=p; this._save(); },
  deleteProfile(id){ delete this.profiles[id]; this._save(); },
  persist(){ this._save(); }
};
function newProfileState(name, avatar){
  return {
    id:'p'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),
    name, avatar: avatar||'🦝', created:Date.now(),
    tokens:0,
    camp:{ lodge:0, field:0 },           // restoration stages 0..3
    shop:[],                              // owned cosmetic ids
    targets:{},                           // targetId -> {attempts:[bool], done:bool, badge:bool}
    seen:{},                              // familyId -> [keys]
    missionsDone:{},                      // missionKey -> true (token awarded once)
    report:[]                             // session log entries {t, text, good, total}
  };
}

/* ---------- Audio: sfx + narration + read-aloud ---------- */
const Audio2 = {
  ctx:null, enabled:true, current:null,
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
    if(this.current){ try{ this.current.pause(); this.current.currentTime=0; }catch(e){} this.current=null; }
    try{ speechSynthesis.cancel(); }catch(e){}
  },
  /* Play a demo MP3; fall back to speechSynthesis reading `fallbackText`. onend called either way. */
  narrate(src, fallbackText, onend){
    this.stopNarration();
    if(!this.enabled){ if(onend) onend(); return; }
    const el = new Audio(src);
    let finished=false;
    const done=()=>{ if(!finished){ finished=true; if(onend) onend(); } };
    el.onended=done; el.onerror=()=>{ this.speak(fallbackText, done); };
    el.oncanplaythrough=()=>{ try{ el.play().catch(()=>this.speak(fallbackText,done)); }catch(e){ this.speak(fallbackText,done); } };
    setTimeout(()=>{ if(!finished && el.paused){ this.speak(fallbackText,done); } }, 4000);
    this.current=el;
  },
  speak(text, onend){
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.rate=0.95; u.pitch=1.05;
      const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith('en'));
      const fem=vs.find(v=>/female|zira|samantha|google us english|tessa/i.test(v.name));
      if(fem) u.voice=fem;
      u.onend=()=>{ if(onend) onend(); }; u.onerror=()=>{ if(onend) onend(); };
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
