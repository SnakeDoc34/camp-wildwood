/* Camp Wildwood — camp shell: chapters, hub, shop, restoration, report */
'use strict';

const CHAPTERS = [
  { id:'trail', num:0, title:'Trailhead', place:'Trailhead', art:'🥾', soon:false,
    blurb:'Start here: the 2A foundations — place value, number bonds, renaming, first multiplication.' },
  { id:'ch8', num:8, title:'Mental Calculation', place:'Welcome Lodge', art:'🛖', soon:false,
    blurb:'Add and subtract like a mental-math ranger.' },
  { id:'ch9', num:9, title:'Equal Groups', place:'Soccer Field', art:'⚽', soon:false,
    blurb:'Multiply and divide groups of 3 and 4.' },
  { id:'ch10', num:10, title:'Money', place:'Trading Post', art:'🪙', soon:false, blurb:'Make $1, count money, and give change.' },
  { id:'ch11', num:11, title:'Fractions', place:'Picnic Grove', art:'🍉', soon:false, blurb:'Halves, fourths, and parts of a whole.' },
  { id:'ch12', num:12, title:'Time', place:'Adventure Station', art:'⏰', soon:false, blurb:'Tell time, measure intervals, a.m. and p.m.' },
  { id:'ch13', num:13, title:'Capacity', place:'Water Works', art:'🪣', soon:false, blurb:'Compare, measure, and convert liters, quarts, and gallons.' },
  { id:'ch14', num:14, title:'Graphs', place:'Fishing Dock', art:'🎣', soon:false, blurb:'Read picture graphs and bar graphs.' },
  { id:'ch15', num:15, title:'Shapes', place:'Woodland Workshop', art:'🔷', soon:false, blurb:'Sides, polygons, patterns, and solid shapes.' },
];
const RESTORE_STAGES = ['🛖 run-down','🛖 tidy','🛖 cozy','🛖⭐ beautiful'];
const CHAPTER_AREA = { trail:'trailhead', ch8:'lodge', ch9:'field', ch10:'post', ch11:'grove', ch12:'station', ch13:'water', ch14:'dock', ch15:'workshop' };
const AREA_STAGE_LABELS = {
  lodge: RESTORE_STAGES,
  field: ['run-down','tidy','cozy','⭐ beautiful'],
  post: ['bare ground','market stall','trading post','⭐ bustling market'],
  grove: ['bare ground','clearing','picnic grove','⭐ picnic paradise'],
  station: ['bare ground','trail post','adventure station','⭐ expedition base'],
  water: ['dry ground','pump','water works','⭐ splash station'],
  dock: ['bare shore','small dock','fishing dock','⭐ angler’s wharf'],
  workshop: ['bare ground','tool bench','woodland workshop','⭐ master craftsman’s shop'],
  trailhead: ['overgrown path','marked trail','trailhead camp','⭐ ranger gateway']
};
const AREA_NAMES = { trailhead:'Trailhead', lodge:'Lodge', field:'Field', post:'Trading Post', grove:'Picnic Grove', station:'Adventure Station', water:'Water Works', dock:'Fishing Dock', workshop:'Workshop' };
/* One woodland friend per mission — completing a mission befriends its critter. */
const CRITTERS = {
  'ch8-adding-ones':['🐇','Bunny'],'ch8-adding-tens':['🦉','Owl'],'ch8-making-100':['🦫','Beaver'],
  'ch8-adding-98':['🦊','Fox'],'ch8-subtracting':['🐢','Turtle'],'ch8-subtracting-98':['🦝','Raccoon'],
  'ch9-groups-3':['🐸','Frog'],'ch9-multiply-3':['🦋','Butterfly'],'ch9-divide-3':['🐝','Bee'],
  'ch9-groups-4':['🦌','Deer'],'ch9-multiply-4':['🐦','Bluebird'],'ch9-divide-4':['🦔','Hedgehog'],
  'ch10-making-1':['🐿️','Chipmunk'],'ch10-counting':['🦦','Otter'],'ch10-change':['🦡','Badger'],
  'ch10-comparing':['🦆','Duck'],'ch10-adding':['🐻','Bear Cub'],'ch10-subtracting':['🐺','Wolf Pup'],
  'ch11-halves':['🐭','Mouse'],'ch11-unit':['🐜','Ant'],'ch11-writing':['🦗','Cricket'],
  'ch11-whole':['🦎','Lizard'],'ch11-comparing':['🐌','Snail'],
  'ch12-telling':['🦜','Parrot'],'ch12-intervals':['🐞','Ladybug'],'ch12-ampm':['🦇','Bat'],
  'ch13-comparing':['🦢','Swan'],'ch13-units':['🐟','Trout'],'ch13-measuring':['🦀','Crab'],
  'ch14-picture':['🦐','Shrimp'],'ch14-bar':['🐡','Pufferfish'],'ch14-questions':['🐙','Octopus'],
  'ch15-sides':['🐛','Caterpillar'],'ch15-polygons':['🪲','Beetle'],'ch15-circles':['🐚','Hermit Crab'],
  'ch15-patterns':['🦚','Peacock'],'ch15-solids':['🦨','Skunk'],
  'trail-place':['🪿','Goose'],'trail-bonds':['🐥','Chick'],'trail-regroup':['🐹','Vole'],'trail-mult':['🐓','Hen']
};
const FESTIVAL_TEXT='Welcome to the Camp Wildwood Festival! You did it, camper. You learned to add and subtract the smart way, to multiply and divide, to count money and make change, to share fairly with fractions, to tell time, to measure water, to read graphs, and to build with shapes. Every lodge beam, every dock plank, every picnic blanket is here because of your hard work. All your woodland friends are here to celebrate with you. Camp Wildwood is restored — and you are a true Camp Wildwood Ranger!';
const SHOP_ITEMS = [
  { id:'flag-red', name:'Red camp flag', art:'🚩', cost:3, place:'lodge-right', description:'Raise your flag beside the lodge or along the field.' },
  { id:'soccer-field', name:'Soccer field kit', art:'⚽', cost:4, description:'Build a marked field with two goals. Unlock the Goal kick activity!' },
  { id:'flowers', name:'Flower beds', art:'🌸', cost:5, place:'lodge-left', description:'Plant a bright flower bed anywhere in your camp.' },
  { id:'bench', name:'Sideline bench', art:'🪑', cost:3, place:'field-left', description:'Give your field a place for the cheering section.' },
  { id:'tent', name:'Adventure tent', art:'⛺', cost:5, place:'field-right', description:'Set up a tent for your woodland adventures.' },
  { id:'lanterns', name:'Paper lanterns', art:'🏮', cost:8, place:'lodge-left', description:'Hang golden lanterns to brighten your camp.' },
  { id:'sign', name:'Carved camp sign', art:'🪧', cost:6, place:'trail', description:'Give your trail a wooden welcome sign.' },
  {id:'campfire',name:'Cozy campfire',art:'🔥',cost:4,place:'trail',description:'A glowing stone-ring campfire with a little curl of smoke.'},
  {id:'canoe',name:'Creek canoe',art:'🛶',cost:7,place:'creek',description:'Park a cedar canoe beside the water. A new story starts at the creek.'},
  {id:'fairy-lights',name:'Woodland fairy lights',art:'✨',cost:6,place:'lodge-left',description:'String warm lights between two pines. They glow after sunset.'},
  {id:'team-blue',name:'Lagoon club colors',art:'🔵',cost:3,fieldUpgrade:true,description:'Blue corner flags, team stands, and goalkeeper kit. Choose it in Your soccer club.'},
  {id:'team-sunset',name:'Sunset club colors',art:'🟠',cost:3,fieldUpgrade:true,description:'Warm coral team colors for your custom soccer club.'},
  {id:'pitch-stripes',name:'Pro striped turf',art:'🏟️',cost:4,fieldUpgrade:true,description:'Alternating mown stripes across your 3D field and shootout arena.'},
  {id:'goal-neon',name:'Mint goal frames',art:'🥅',cost:5,fieldUpgrade:true,description:'Bright mint frames for both soccer goals.'},
  {id:'stadium-lights',name:'Stadium light kit',art:'💡',cost:7,fieldUpgrade:true,description:'Tall floodlights around your field. Try them at night!'},
  {id:'grandstand',name:'Club grandstands',art:'📣',cost:6,fieldUpgrade:true,description:'Build two rows of cheering stands in your chosen team color.'},
];

const Camp = {
  targetsFor(chId){ return (window.TARGETS||[]).filter(t=>t.chapter===chId); },
  /* Trail order follows the Dimensions Math lesson sequence. A teacher can
     open every mission from the Report screen (Settings.unlockAll). */
  isChapterUnlocked(p,chId){
    if(typeof Settings!=='undefined'&&Settings.unlockAll)return true;
    /* The Trailhead is a foundation ramp, not a gate: it and Chapter 8 are
       both open from the start. Chapters 9+ chain as before. */
    if(chId==='trail'||chId==='ch8')return true;
    const order=CHAPTERS.filter(c=>!c.soon).map(c=>c.id),i=order.indexOf(chId);
    if(i<=0)return true;
    const prev=this.targetsFor(order[i-1]);
    return prev.length>0&&prev.every(t=>p.targets[t.id]&&p.targets[t.id].done);
  },
  /* The Festival celebrates the 37 Dimensions Math 2B missions; the
     Trailhead foundations are a bonus ramp and never gate it. */
  coreTargets(){ return window.TARGETS.filter(t=>t.chapter!=='trail'); },
  isTargetUnlocked(p,t){
    if(typeof Settings!=='undefined'&&Settings.unlockAll)return true;
    if(p.targets[t.id]&&p.targets[t.id].done)return true;
    if((p.activeMissions||{})[t.id])return true;
    if(!this.isChapterUnlocked(p,t.chapter))return false;
    const list=this.targetsFor(t.chapter),i=list.indexOf(t);
    if(i<=0)return true;
    const prev=list[i-1];
    return Boolean(p.targets[prev.id]&&p.targets[prev.id].done);
  },
  lockReason(p,t){
    if(!this.isChapterUnlocked(p,t.chapter)){
      const prev=CHAPTERS[CHAPTERS.findIndex(c=>c.id===t.chapter)-1];
      return 'Finish Chapter '+(prev?prev.num:'')+' first';
    }
    const list=this.targetsFor(t.chapter),i=list.indexOf(t);
    return i>0?'Finish “'+list[i-1].title+'” first':'';
  },
  /* restoration: each chapter's missions grow its own camp place */
  refreshStages(p){
    for(const [chId,area] of Object.entries(CHAPTER_AREA)){
      const targets=this.targetsFor(chId),n=targets.length;
      const done=targets.filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
      p.camp[area]=n?Math.min(3,Math.ceil(done/n*3)):0;
    }
  },
  renderHub(p){
    document.getElementById('hub-greeting').textContent = 'Welcome back, '+p.name+'!';
    const map=document.getElementById('camp-map'); map.innerHTML='';
    const future=document.getElementById('future-trails-list');future.innerHTML='';
    this.refreshStages(p); Store.persist();
    const yard=document.getElementById('hub-yard');yard.innerHTML='';yard.appendChild(Yard.scene(p,false));
    Yard.renderGoal(document.getElementById('hub-goal'),p);Store.persist();
    const core=this.coreTargets(),completed=core.filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
    document.getElementById('camp-completion').textContent=completed+' of '+core.length+' missions complete';
    /* festival meter: every mission brings the Camp Festival closer */
    const fm=document.getElementById('festival-meter');
    if(fm){
      if(completed===core.length){
        fm.innerHTML='<b>🎉 Your camp is ready for the Camp Festival!</b><p class="fine">Every trail is complete. The Festival is open!</p>';
        const go=el('button','big-btn','🎪 Enter the Camp Festival');
        go.onclick=()=>{ Audio2.click(); App.show('screen-festival'); Camp.renderFestival(p); };
        fm.appendChild(go);
      }else{
        fm.innerHTML='<b>🎪 Camp Festival readiness: '+completed+' of '+core.length+' missions</b><div class="festival-bar"><span style="width:'+Math.round(completed/core.length*100)+'%"></span></div><p class="fine">Finish the Dimensions Math 2B missions to get the camp ready for the big Festival. Trailhead foundations are a bonus ramp — they do not count toward the Festival.</p>';
      }
    }
    /* woodland friends living at this camp */
    const crow=document.getElementById('critter-row');
    if(crow){ const found=this.critterList(p).filter(c=>c.found);
      crow.innerHTML='<b>Woodland friends:</b> '+(found.length?found.map(c=>'<span title="'+esc(c.name)+'">'+c.emoji+'</span>').join(' '):'none yet — finish a mission to meet one! Open the Field Guide to see who is hiding.'); }
    CHAPTERS.forEach(ch=>{
      if(ch.soon){future.appendChild(el('div','future-chapter','<span aria-hidden="true">'+ch.art+'</span><span><strong>'+esc(ch.place)+'</strong><small>'+esc(ch.title)+'</small></span>'));return;}
      const card=el('button','card trail-card '+(ch.id==='ch8'?'lodge-trail':'field-trail'));
      const targets=this.targetsFor(ch.id),done=targets.filter(t=>p.targets[t.id]&&p.targets[t.id].done).length;
      const area=CHAPTER_AREA[ch.id];
      const stage = area? AREA_NAMES[area]+' '+(AREA_STAGE_LABELS[area][p.camp[area]]||'') : '';
      const chapterLocked=!this.isChapterUnlocked(p,ch.id);
      if(chapterLocked)card.classList.add('trail-locked');
      card.innerHTML='<span class="trail-top"><span class="eyebrow">'+(ch.num? 'Chapter '+ch.num : 'Start Here · 2A Foundations')+'</span><span class="art" aria-hidden="true">'+ch.art+'</span></span><h3>'+esc(ch.place)+'</h3>'+
        '<p class="trail-subtitle">'+esc(ch.title)+'</p><p class="hint">'+esc(ch.blurb)+'</p>'+
        '<span class="trail-progress" aria-label="'+done+' of '+targets.length+' missions complete"><span style="width:'+done/targets.length*100+'%"></span></span>'+
        (chapterLocked
          ? '<span class="trail-bottom"><span class="lock-note">🔒 Finish the Chapter '+(ch.num-1)+' missions to open this trail</span></span>'
          : '<span class="trail-bottom"><span class="fine">'+done+' / '+targets.length+' missions · '+esc(stage)+'</span><span class="trail-arrow" aria-hidden="true">→</span></span>');
      card.onclick=()=>{ Audio2.click(); if(chapterLocked){ toast('🔒 Finish the Chapter '+(ch.num-1)+' missions first — or ask a teacher to unlock all missions in the Report.'); return; } App.showTargets(ch.id); };
      map.appendChild(card);
    });
  },
  renderTargets(chId){
    const ch=CHAPTERS.find(c=>c.id===chId);
    document.getElementById('targets-title').textContent=(ch.num? 'Chapter '+ch.num+': '+ch.title : ch.title+' — 2A Foundations');
    document.getElementById('targets-sub').textContent=ch.place+' · pick a skill to practice';
    const list=document.getElementById('target-list'); list.innerHTML='';
    this.targetsFor(chId).forEach((t,index)=>{
      const st=App.profile.targets[t.id]||{};
      const unlocked=this.isTargetUnlocked(App.profile,t);
      const card=el('button','card skill-card'+(st.done?' skill-complete':'')+(unlocked?'':' skill-locked'));
      card.innerHTML='<span class="skill-top"><span class="mission-number">'+String(index+1).padStart(2,'0')+'</span><span class="art" aria-hidden="true">'+(unlocked?t.art:'🔒')+'</span></span><h3>'+esc(t.title)+'</h3>'+
        '<p class="hint">'+esc(t.blurb)+'</p>'+
        (t.strategyName?'<p class="fine">🧭 Strategy: '+esc(t.strategyName)+'</p>':'')+
        (unlocked
          ? (st.badge?'<span class="badge">🏅 Badge earned</span>':(st.done?'<span class="badge">✅ Done</span>':''))
            +(st.attempts&&st.attempts.length?'<p class="fine">Recent: '+st.attempts.slice(-5).map(a=>a?'⭐ independent':'🌱 with support').join(' · ')+'</p>':'')
            +((App.profile.activeMissions||{})[t.id]?'<span class="badge">Resume mission</span>':'')
          : '<span class="lock-note">🔒 '+esc(this.lockReason(App.profile,t))+'</span>');
      if(unlocked){ card.onclick=()=>{ Audio2.click(); Engine.start(t.id); }; }
      else { card.disabled=true; card.setAttribute('aria-label',t.title+' (locked). '+this.lockReason(App.profile,t)); }
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
            document.getElementById('shop-message').textContent=it.id==='soccer-field'?'Your soccer field is built! Choose Play in my camp to try goal kicks.':it.name+' is yours! '+(it.fieldUpgrade?'Choose Customize field to use it.':'Choose Arrange in my camp to move it.');
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
        const use=el('button','mid-btn',it.id==='soccer-field'?'Play in my camp':it.fieldUpgrade?'Customize field':'Arrange in my camp');use.onclick=()=>App.showDesign(it.id);actions.appendChild(use);
      }
      card.appendChild(actions);
      list.appendChild(card);
    });
  },
  addReport(p, entry){ p.report.push(Object.assign({t:Date.now()},entry)); Store.persist(); },
  critterList(p){
    return window.TARGETS.map(t=>{ const c=CRITTERS[t.id]; if(!c) return null;
      return { target:t, emoji:c[0], name:c[1], found:Boolean(p.targets[t.id]&&p.targets[t.id].done) }; }).filter(Boolean);
  },

  renderGuide(p){
    const list=document.getElementById('guide-list'); if(!list) return; list.innerHTML='';
    const critters=this.critterList(p),found=critters.filter(c=>c.found).length;
    document.getElementById('guide-summary').textContent='You have met '+found+' of '+critters.length+' woodland friends. Finish a mission to meet its friend!';
    for(const c of critters){
      const card=el('div','critter-card'+(c.found?' found':''));
      if(c.found) card.innerHTML='<span class="critter-art">'+c.emoji+'</span><b>'+c.name+'</b><span>Met at '+esc(c.target.title)+'</span>';
      else card.innerHTML='<span class="critter-art hiding">❔</span><b>Still hiding</b><span>Finish '+esc(c.target.title)+' to meet it</span>';
      list.appendChild(card);
    }
  },

  renderFestival(p){
    const b=document.getElementById('festival-body'); if(!b) return; b.innerHTML='';
    b.appendChild(el('h2',null,'🎪 The Camp Wildwood Festival!'));
    b.appendChild(Yard.scene(p,false));
    b.appendChild(el('div','caption-box',esc(FESTIVAL_TEXT)));
    const badges=window.TARGETS.filter(t=>p.targets[t.id]&&p.targets[t.id].badge).length;
    const friends=this.critterList(p).filter(c=>c.found).length;
    const cert=el('div','card festival-cert');
    cert.innerHTML='<h3>🏅 Camp Wildwood Ranger Certificate</h3>'
      +'<p>This certifies that <strong>'+esc(p.name)+'</strong> completed all '+this.coreTargets().length+' Dimensions Math 2B missions at Camp Wildwood.</p>'
      +'<p>🪙 '+p.tokens+' camp tokens · 🏅 '+badges+' skill badges · 🦉 '+friends+' woodland friends</p>'
      +'<p class="critter-row">'+this.critterList(p).filter(c=>c.found).map(c=>c.emoji).join(' ')+'</p>';
    b.appendChild(cert);
    const row=el('div','row');
    const hear=el('button','mid-btn','🔊 Hear it'); hear.onclick=()=>Audio2.narrate('audio/m5-festival.mp3',FESTIVAL_TEXT);
    const print=el('button','mid-btn','🖨️ Print certificate'); print.onclick=()=>window.print();
    row.appendChild(hear); row.appendChild(print); b.appendChild(row);
    confetti(80); Audio2.good(); Audio2.narrate('audio/m5-festival.mp3',FESTIVAL_TEXT);
  },

  renderReport(p){
    const cb=document.getElementById('unlock-all-toggle');
    if(cb&&typeof Settings!=='undefined')cb.checked=Settings.unlockAll;
    const b=document.getElementById('report-body');
    const rows=p.report.map(r=>'<tr><td>'+new Date(r.t).toLocaleTimeString()+'</td><td>'+esc(r.text)+'</td><td>'+(r.total? r.good+'/'+r.total : '—')+'</td></tr>').join('');
    const tg=p.report.reduce((a,r)=>a+(r.good||0),0), tt=p.report.reduce((a,r)=>a+(r.total||0),0);
    b.innerHTML='<h3>Report for '+esc(p.name)+' · 🪙 '+p.tokens+' tokens</h3>'+
      (this.coreTargets().every(t=>p.targets[t.id]&&p.targets[t.id].done)?'<p>🎪 <strong>Camp Festival complete!</strong> All '+this.coreTargets().length+' Dimensions Math 2B missions finished — this camper is a Camp Wildwood Ranger.</p>':'')+
      '<p>🦉 Woodland friends met: '+this.critterList(p).filter(c=>c.found).length+' of '+window.TARGETS.length+' — see the Field Guide on the camp map.</p>'+
      (()=>{
        const learned=[...new Set(window.TARGETS.filter(t=>p.targets[t.id]&&p.targets[t.id].done&&t.strategyName).map(t=>t.strategyName))];
        return learned.length? '<p>🧭 <strong>Strategies learned:</strong> '+learned.map(esc).join(' · ')+'</p>' : '';
      })()+
      (rows? '<table><tr><th>Time</th><th>Activity</th><th>First attempt</th></tr>'+rows+'</table>'
            : '<p class="hint">No missions yet today. Play a mission and it will show up here!</p>')+
      (tt? '<p><strong>Recorded first attempts: '+tg+' out of '+tt+'.</strong></p>':'')+
      '<p class="fine">New records count first attempts completed without hints. Successful retries still complete missions and earn rewards. Existing records keep their original scores.</p>'+
      '<p class="fine">Tip for teachers: print this page (or screenshot it) as the durable record — browser storage is per-device.</p>';
  }
};
