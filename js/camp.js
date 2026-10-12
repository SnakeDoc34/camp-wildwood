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
  { id:'flag-red', name:'Red camp flag', art:'🚩', cost:3, place:'lodge-right', description:'Raise your flag beside the lodge or along the field.' },
  { id:'soccer-field', name:'Soccer field kit', art:'⚽', cost:4, description:'Build a marked field with two goals. Unlock the Goal kick activity!' },
  { id:'flowers', name:'Flower beds', art:'🌸', cost:5, place:'lodge-left', description:'Plant a bright flower bed anywhere in your camp.' },
  { id:'bench', name:'Sideline bench', art:'🪑', cost:3, place:'field-left', description:'Give your field a place for the cheering section.' },
  { id:'tent', name:'Adventure tent', art:'⛺', cost:5, place:'field-right', description:'Set up a tent for your woodland adventures.' },
  { id:'lanterns', name:'Paper lanterns', art:'🏮', cost:8, place:'lodge-left', description:'Hang golden lanterns to brighten your camp.' },
  { id:'sign', name:'Carved camp sign', art:'🪧', cost:6, place:'trail', description:'Give your trail a wooden welcome sign.' },
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
    document.getElementById('hub-greeting').textContent = 'Welcome back, '+p.name+'!';
    const map=document.getElementById('camp-map'); map.innerHTML='';
    const future=document.getElementById('future-trails-list');future.innerHTML='';
    this.refreshStages(p); Store.persist();
    const yard=document.getElementById('hub-yard');yard.innerHTML='';yard.appendChild(Yard.scene(p,false));
    Yard.renderGoal(document.getElementById('hub-goal'),p);Store.persist();
    const completed=window.TARGETS.filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
    document.getElementById('camp-completion').textContent=completed+' of '+window.TARGETS.length+' missions complete';
    CHAPTERS.forEach(ch=>{
      if(ch.soon){future.appendChild(el('div','future-chapter','<span aria-hidden="true">'+ch.art+'</span><span><strong>'+esc(ch.place)+'</strong><small>'+esc(ch.title)+'</small></span>'));return;}
      const card=el('button','card trail-card '+(ch.id==='ch8'?'lodge-trail':'field-trail'));
      const targets=this.targetsFor(ch.id),done=targets.filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
      const stage = ch.id==='ch8'? 'Lodge '+RESTORE_STAGES[p.camp.lodge] : ch.id==='ch9'? 'Field '+['run-down','tidy','cozy','⭐ beautiful'][p.camp.field] : '';
      card.innerHTML='<span class="trail-top"><span class="eyebrow">Chapter '+ch.num+'</span><span class="art" aria-hidden="true">'+ch.art+'</span></span><h3>'+esc(ch.place)+'</h3>'+
        '<p class="trail-subtitle">'+esc(ch.title)+'</p><p class="hint">'+esc(ch.blurb)+'</p>'+
        '<span class="trail-progress" aria-label="'+done+' of '+targets.length+' missions complete"><span style="width:'+done/targets.length*100+'%"></span></span>'+
        '<span class="trail-bottom"><span class="fine">'+done+' / '+targets.length+' missions · '+esc(stage)+'</span><span class="trail-arrow" aria-hidden="true">→</span></span>';
      card.onclick=()=>{ Audio2.click(); App.showTargets(ch.id); };
      map.appendChild(card);
    });
  },
  renderTargets(chId){
    const ch=CHAPTERS.find(c=>c.id===chId);
    document.getElementById('targets-title').textContent='Chapter '+ch.num+': '+ch.title;
    document.getElementById('targets-sub').textContent=ch.place+' · pick a skill to practice';
    const list=document.getElementById('target-list'); list.innerHTML='';
    this.targetsFor(chId).forEach((t,index)=>{
      const st=App.profile.targets[t.id]||{};
      const card=el('button','card skill-card'+(st.done?' skill-complete':''));
      card.innerHTML='<span class="skill-top"><span class="mission-number">'+String(index+1).padStart(2,'0')+'</span><span class="art" aria-hidden="true">'+t.art+'</span></span><h3>'+esc(t.title)+'</h3>'+
        '<p class="hint">'+esc(t.blurb)+'</p>'+
        (st.badge?'<span class="badge">🏅 Badge earned</span>':(st.done?'<span class="badge">✅ Done</span>':''))+
        (st.attempts&&st.attempts.length?'<p class="fine">Recent: '+st.attempts.slice(-5).map(a=>a?'⭐ independent':'🌱 with support').join(' · ')+'</p>':'')+
        ((App.profile.activeMissions||{})[t.id]?'<span class="badge">Resume mission</span>':'');
      card.onclick=()=>{ Audio2.click(); Engine.start(t.id); };
      list.appendChild(card);
    });
  },
  renderShop(p){
    Yard.ensure(p);
    document.getElementById('shop-tokens').textContent=p.tokens;
    Yard.renderGoal(document.getElementById('shop-goal'),p);
    const list=document.getElementById('shop-list'); list.innerHTML='';
    SHOP_ITEMS.forEach(it=>{
      const owned=p.shop.includes(it.id);
      const card=el('div','card shop-card'+(it.id==='soccer-field'?' featured-item':''));
      card.setAttribute('data-item',it.id);
      card.appendChild(el('div','shop-item-art',Yard.art(it.id)));
      card.appendChild(el('h3',null,esc(it.name)));card.appendChild(el('p','hint',esc(it.description)));
      card.appendChild(el('p','shop-price','🪙 '+it.cost+' tokens'));
      const actions=el('div','shop-actions');
      if(!owned){
        const buy=el('button','mid-btn',it.id==='soccer-field'?'Build field · 4 tokens':'Buy · '+it.cost+' tokens');buy.disabled=p.tokens<it.cost;
        buy.onclick=(e)=>{ e.stopPropagation();
          if(p.shop.includes(it.id))return;
          if(p.tokens>=it.cost){
            p.tokens-=it.cost;p.shop.push(it.id);Yard.install(p,it.id);
            if(p.camp.design.goal===it.id)p.camp.design.goal=null;
            Store.persist();Audio2.good();confetti(30);
            document.getElementById('shop-message').textContent=it.id==='soccer-field'?'Your soccer field is built! Choose Play in my camp to try goal kicks.':it.name+' is yours! Choose Arrange in my camp to move it.';
            toast(it.name+' unlocked!');this.renderShop(p);App.syncTop();
          }
          else { Audio2.bad(); toast('Not enough tokens yet — finish missions to earn more!'); }
        };
        actions.appendChild(buy);
        if(p.tokens<it.cost)actions.appendChild(el('small','fine',(it.cost-p.tokens)+' more token'+(it.cost-p.tokens===1?'':'s')+' needed'));
        const save=el('button','hint-btn',Yard.goal(p)?.id===it.id?'My savings goal':'Save for this');save.setAttribute('aria-pressed',String(Yard.goal(p)?.id===it.id));
        save.onclick=()=>{Yard.setGoal(p,it.id);this.renderShop(p);toast('Saving for '+it.name+'.');};actions.appendChild(save);
      }else{
        actions.appendChild(el('span','badge','✓ Yours'));
        const use=el('button','mid-btn',it.id==='soccer-field'?'Play in my camp':'Arrange in my camp');use.onclick=()=>App.showDesign(it.id);actions.appendChild(use);
      }
      card.appendChild(actions);
      list.appendChild(card);
    });
  },
  addReport(p, entry){ p.report.push(Object.assign({t:Date.now()},entry)); Store.persist(); },
  renderReport(p){
    const b=document.getElementById('report-body');
    const rows=p.report.map(r=>'<tr><td>'+new Date(r.t).toLocaleTimeString()+'</td><td>'+esc(r.text)+'</td><td>'+(r.total? r.good+'/'+r.total : '—')+'</td></tr>').join('');
    const tg=p.report.reduce((a,r)=>a+(r.good||0),0), tt=p.report.reduce((a,r)=>a+(r.total||0),0);
    b.innerHTML='<h3>Report for '+esc(p.name)+' · 🪙 '+p.tokens+' tokens</h3>'+
      (rows? '<table><tr><th>Time</th><th>Activity</th><th>First attempt</th></tr>'+rows+'</table>'
            : '<p class="hint">No missions yet today. Play a mission and it will show up here!</p>')+
      (tt? '<p><strong>Recorded first attempts: '+tg+' out of '+tt+'.</strong></p>':'')+
      '<p class="fine">New records count first attempts completed without hints. Successful retries still complete missions and earn rewards. Existing records keep their original scores.</p>'+
      '<p class="fine">Tip for teachers: print this page (or screenshot it) as the durable record — browser storage is per-device.</p>';
  }
};
