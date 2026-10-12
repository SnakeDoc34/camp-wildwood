/* Camp Wildwood — camp shell: chapters, hub, shop, restoration, report */
'use strict';

const CHAPTERS = [
  { id:'ch8', num:8, title:'Mental Calculation', place:'Welcome Lodge', art:'🛖', soon:false,
    blurb:'Add and subtract like a mental-math ranger.' },
  { id:'ch9', num:9, title:'Equal Groups', place:'Soccer Field', art:'⚽', soon:false,
    blurb:'Multiply and divide groups of 3 and 4.' },
  { id:'ch10', num:10, title:'Money', place:'Trading Post', art:'🪙', soon:true, blurb:'Coming in the next release.' },
  { id:'ch11', num:11, title:'Fractions', place:'Picnic Grove', art:'🍉', soon:true, blurb:'Coming in the next release.' },
  { id:'ch12', num:12, title:'Time', place:'Adventure Station', art:'⏰', soon:true, blurb:'Coming in the next release.' },
  { id:'ch13', num:13, title:'Capacity', place:'Water Works', art:'🪣', soon:true, blurb:'Coming in the next release.' },
  { id:'ch14', num:14, title:'Graphs', place:'Fishing Dock', art:'🎣', soon:true, blurb:'Coming in the next release.' },
  { id:'ch15', num:15, title:'Shapes', place:'Woodland Workshop', art:'🔷', soon:true, blurb:'Coming in the next release.' },
];
const RESTORE_STAGES = ['🛖 run-down','🛖 tidy','🛖 cozy','🛖⭐ beautiful'];
const SHOP_ITEMS = [
  { id:'flag-red',   name:'Red camp flag',   art:'🚩', cost:3 },
  { id:'flowers',    name:'Flower beds',     art:'🌸', cost:5 },
  { id:'lanterns',   name:'Paper lanterns',  art:'🏮', cost:8 },
  { id:'sign',       name:'Carved camp sign', art:'🪧', cost:6 },
];

const Camp = {
  targetsFor(chId){ return (window.TARGETS||[]).filter(t=>t.chapter===chId); },
  /* restoration: lodge advances with ch8 targets done, field with ch9 */
  refreshStages(p){
    const ch8done=this.targetsFor('ch8').filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
    const ch9done=this.targetsFor('ch9').filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
    const n8=this.targetsFor('ch8').length, n9=this.targetsFor('ch9').length;
    p.camp.lodge = n8? Math.min(3, Math.ceil(ch8done/n8*3)):0;
    p.camp.field = n9? Math.min(3, Math.ceil(ch9done/n9*3)):0;
  },
  renderHub(p){
    document.getElementById('hub-greeting').textContent = 'Welcome back, '+p.name+'! 🏕️';
    const map=document.getElementById('camp-map'); map.innerHTML='';
    this.refreshStages(p); Store.persist();
    CHAPTERS.forEach(ch=>{
      const card=el('div','card'+(ch.soon?' locked':''));
      const stage = ch.id==='ch8'? 'Lodge '+RESTORE_STAGES[p.camp.lodge] : ch.id==='ch9'? 'Field '+['run-down','tidy','cozy','⭐ beautiful'][p.camp.field] : '';
      card.innerHTML='<div class="art">'+ch.art+'</div><h3>'+esc(ch.place)+'</h3>'+
        '<p><strong>Chapter '+ch.num+': '+esc(ch.title)+'</strong></p><p class="hint">'+esc(ch.blurb)+'</p>'+
        (stage?'<p class="stage-dots">'+esc(stage)+'</p>':'');
      if(!ch.soon){ card.onclick=()=>{ Audio2.click(); App.showTargets(ch.id); }; }
      else card.onclick=()=>toast('Under construction — coming soon!');
      map.appendChild(card);
    });
    // owned decorations strip
    if(p.shop.length){
      const d=el('div','card'); d.style.gridColumn='1/-1';
      d.innerHTML='<h3>Your camp decorations</h3><div style="font-size:2rem">'+p.shop.map(id=>{const s=SHOP_ITEMS.find(x=>x.id===id);return s?s.art:'';}).join(' ')+'</div>';
      d.onclick=()=>{};
      map.appendChild(d);
    }
  },
  renderTargets(chId){
    const ch=CHAPTERS.find(c=>c.id===chId);
    document.getElementById('targets-title').textContent='Chapter '+ch.num+': '+ch.title;
    document.getElementById('targets-sub').textContent=ch.place+' · pick a skill to practice';
    const list=document.getElementById('target-list'); list.innerHTML='';
    this.targetsFor(chId).forEach(t=>{
      const st=App.profile.targets[t.id]||{};
      const card=el('div','card');
      card.innerHTML='<div class="art">'+t.art+'</div><h3>'+esc(t.title)+'</h3>'+
        '<p class="hint">'+esc(t.blurb)+'</p>'+
        (st.badge?'<span class="badge">🏅 Badge earned</span>':(st.done?'<span class="badge">✅ Done</span>':''))+
        (st.attempts&&st.attempts.length?'<p class="fine">Recent: '+st.attempts.slice(-5).map(a=>a?'✅':'❌').join(' ')+'</p>':'');
      card.onclick=()=>{ Audio2.click(); Engine.start(t.id); };
      list.appendChild(card);
    });
  },
  renderShop(p){
    document.getElementById('shop-tokens').textContent=p.tokens;
    const list=document.getElementById('shop-list'); list.innerHTML='';
    SHOP_ITEMS.forEach(it=>{
      const owned=p.shop.includes(it.id);
      const card=el('div','card');
      card.innerHTML='<div class="art">'+it.art+'</div><h3>'+esc(it.name)+'</h3>'+
        '<p><strong>🪙 '+it.cost+'</strong></p>'+
        (owned?'<span class="badge">Owned</span>':'<button class="mid-btn">Buy</button>');
      if(!owned){
        card.querySelector('button').onclick=(e)=>{ e.stopPropagation();
          if(p.tokens>=it.cost){ p.tokens-=it.cost; p.shop.push(it.id); Store.persist(); Audio2.good(); confetti(30); toast(it.name+' added to your camp!'); this.renderShop(p); App.syncTop(); }
          else { Audio2.bad(); toast('Not enough tokens yet — finish missions to earn more!'); }
        };
      }
      list.appendChild(card);
    });
  },
  addReport(p, entry){ p.report.push(Object.assign({t:Date.now()},entry)); Store.persist(); },
  renderReport(p){
    const b=document.getElementById('report-body');
    const rows=p.report.map(r=>'<tr><td>'+new Date(r.t).toLocaleTimeString()+'</td><td>'+esc(r.text)+'</td><td>'+(r.total? r.good+'/'+r.total : '—')+'</td></tr>').join('');
    const tg=p.report.reduce((a,r)=>a+(r.good||0),0), tt=p.report.reduce((a,r)=>a+(r.total||0),0);
    b.innerHTML='<h3>Report for '+esc(p.name)+' · 🪙 '+p.tokens+' tokens</h3>'+
      (rows? '<table><tr><th>Time</th><th>Activity</th><th>Correct</th></tr>'+rows+'</table>'
            : '<p class="hint">No missions yet today. Play a mission and it will show up here!</p>')+
      (tt? '<p><strong>Overall this device: '+tg+' correct out of '+tt+'.</strong></p>':'')+
      '<p class="fine">Tip for teachers: print this page (or screenshot it) as the durable record — browser storage is per-device.</p>';
  }
};
