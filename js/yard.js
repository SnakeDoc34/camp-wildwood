/* Camp builder. Decorative artwork is separate from every mathematical model. */
'use strict';

const YARD_SLOTS=[
  {id:'lodge-left',name:'Lodge garden',x:19,y:20},
  {id:'lodge-right',name:'Lodge entrance',x:81,y:20},
  {id:'field-left',name:'Left sideline',x:17,y:50},
  {id:'field-right',name:'Right sideline',x:83,y:50},
  {id:'creek',name:'Creek corner',x:19,y:81},
  {id:'trail',name:'Trail corner',x:81,y:81}
];
const STARTER_ITEMS=[
  {id:'sapling',name:'Little pine',art:'🌲',cost:0,description:'A welcome gift. Find a sunny place for your tree.'},
  {id:'stones',name:'Trail stones',art:'🪨',cost:0,description:'A welcome gift. Make a path beside the lodge.'}
];
const Yard={
  selected:null,message:'',soccer:null,checkout:null,picnic:null,
  item(id){return [...STARTER_ITEMS,...SHOP_ITEMS].find(it=>it.id===id);},
  owns(p,id){return STARTER_ITEMS.some(it=>it.id===id)||p.shop.includes(id);},
  ensure(p){
    const old=p.camp.design;
    const migrating=!old||typeof old!=='object'||Array.isArray(old)||old.version!==1;
    if(migrating)p.camp.design={version:1,slots:{creek:'sapling',trail:'stones'},pitch:'meadow',goal:null,goals:0,best:0};
    const d=p.camp.design;
    if(!d.slots||typeof d.slots!=='object'||Array.isArray(d.slots))d.slots={};
    const clean={},used=new Set();
    for(const slot of YARD_SLOTS){const id=d.slots[slot.id];if(this.item(id)&&id!=='soccer-field'&&this.owns(p,id)&&!used.has(id)){clean[slot.id]=id;used.add(id);}}
    d.slots=clean;
    d.pitch=this.owns(p,'soccer-field')&&d.pitch==='soccer'?'soccer':'meadow';
    if(!this.item(d.goal)||this.owns(p,d.goal))d.goal=null;
    d.goals=Number.isSafeInteger(d.goals)&&d.goals>=0?d.goals:0;
    d.best=Number.isInteger(d.best)&&d.best>=0&&d.best<=3?d.best:0;
    if(migrating){for(const id of p.shop)this.install(p,id);}
    return d;
  },
  install(p,id){
    const d=p.camp.design,it=this.item(id);if(!d||!it||!this.owns(p,id))return;
    if(id==='soccer-field'){d.pitch='soccer';return;}
    if(Object.values(d.slots).includes(id))return;
    const slot=YARD_SLOTS.find(s=>s.id===it.place&&!d.slots[s.id])||YARD_SLOTS.find(s=>!d.slots[s.id]);
    if(slot)d.slots[slot.id]=id;
  },
  goal(p){const d=this.ensure(p);return this.item(d.goal)||SHOP_ITEMS.find(it=>!this.owns(p,it.id)&&it.id==='soccer-field')||SHOP_ITEMS.find(it=>!this.owns(p,it.id));},
  setGoal(p,id){if(!SHOP_ITEMS.some(it=>it.id===id)||this.owns(p,id))return false;this.ensure(p).goal=id;Store.persist();return true;},
  place(p,id,slotId){
    if(id==='soccer-field'||!this.item(id)||!this.owns(p,id)||!YARD_SLOTS.some(s=>s.id===slotId))return false;
    const d=this.ensure(p),oldSlot=YARD_SLOTS.find(s=>d.slots[s.id]===id),replaced=d.slots[slotId];
    if(oldSlot&&oldSlot.id!==slotId){if(replaced)d.slots[oldSlot.id]=replaced;else delete d.slots[oldSlot.id];}
    d.slots[slotId]=id;Store.persist();return true;
  },
  putAway(p,id){const d=this.ensure(p);for(const slot of YARD_SLOTS)if(d.slots[slot.id]===id)delete d.slots[slot.id];Store.persist();},
  art(id){
    const shapes={
      sapling:'<path d="M46 92V61" stroke="#765239" stroke-width="9"/><path d="M46 4 25 38h12L16 68h60L55 38h12Z" fill="#327152" stroke="#174b38" stroke-width="3"/>',
      stones:'<path d="m14 65 8-13 22-3 10 14-9 12-24 1Z" fill="#bbb9ac" stroke="#69756c" stroke-width="3"/><path d="m50 34 8-13 21 3 5 14-13 10-18-4Z" fill="#d4cfc2" stroke="#69756c" stroke-width="3"/><path d="m57 84 4-12 21 1 8 10-9 8-20 2Z" fill="#989f94" stroke="#69756c" stroke-width="3"/>',
      'flag-red':'<path d="M31 91V8" stroke="#765239" stroke-width="6"/><path d="M34 12h47L66 30l15 17H34Z" fill="#d76549" stroke="#823e2d" stroke-width="3"/><ellipse cx="32" cy="94" rx="18" ry="4" fill="#658951"/>',
      flowers:'<path d="M13 73h76L80 94H22Z" fill="#ab764b" stroke="#715039" stroke-width="3"/><path d="M28 72V43m24 29V33m24 39V46" stroke="#3e7852" stroke-width="4"/><g fill="#de7888" stroke="#8d415d" stroke-width="2"><circle cx="28" cy="36" r="12"/><circle cx="52" cy="27" r="12"/><circle cx="76" cy="39" r="12"/></g><g fill="#f6d578"><circle cx="28" cy="36" r="4"/><circle cx="52" cy="27" r="4"/><circle cx="76" cy="39" r="4"/></g>',
      lanterns:'<path d="M11 88V15m79 73V15" stroke="#765239" stroke-width="5"/><path d="M11 17q39 24 79 0" fill="none" stroke="#4b5a3d" stroke-width="3"/><g fill="#edbe69" stroke="#9b6037" stroke-width="3"><ellipse cx="28" cy="47" rx="12" ry="18"/><ellipse cx="71" cy="47" rx="12" ry="18"/></g><path d="M28 28v38m43-38v38" stroke="#b6803e" stroke-width="2"/>',
      sign:'<path d="M48 90V20" stroke="#755139" stroke-width="8"/><path d="M9 19h74l12 16-12 16H9Z" fill="#c6a675" stroke="#795936" stroke-width="3"/><path d="M21 30h51m-51 10h38" stroke="#795936" stroke-width="3"/>',
      bench:'<path d="M13 24h74v24H13Zm-4 38h82v12H9Z" fill="#b88253" stroke="#745038" stroke-width="3"/><path d="M22 73v19m56-19v19M22 48v14m56-14v14" stroke="#745038" stroke-width="6"/>',
      tent:'<path d="m7 83 44-67 43 67Z" fill="#efbf72" stroke="#7b603c" stroke-width="3"/><path d="m51 16 21 67H30Z" fill="#886a46"/><path d="M6 85h90" stroke="#795936" stroke-width="4"/>',
      'soccer-field':'<rect x="7" y="16" width="87" height="70" rx="8" fill="#438260"/><g stroke="#fff9de" fill="none" stroke-width="3"><rect x="16" y="24" width="68" height="54"/><path d="M50 24v54"/><circle cx="50" cy="51" r="13"/></g>'
    };
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">'+(shapes[id]||'')+'</svg>';
  },
  lodge(stage){
    return '<svg viewBox="0 0 200 150" aria-hidden="true" focusable="false"><ellipse cx="100" cy="138" rx="88" ry="9" fill="#6d9259" opacity=".5"/><path d="M32 69h137v66H32Z" fill="'+(stage?'#bd9362':'#9a8b70')+'" stroke="#6e5239" stroke-width="4"/><path d="m19 70 81-61 81 61Z" fill="'+(stage>1?'#ba6347':'#6c7560')+'" stroke="#5b5140" stroke-width="4"/><path d="M135 14h18v33h-18" fill="#9d7455" stroke="#6e5239" stroke-width="3"/><path d="M85 86h32v49H85Z" fill="#6f5034"/><g fill="'+(stage>1?'#ffd779':'#9dbbbb')+'" stroke="#6f5034" stroke-width="3"><rect x="46" y="86" width="23" height="23"/><rect x="131" y="86" width="23" height="23"/></g>'+(stage===0?'<path d="m43 78 22 36m64-37 27 39" stroke="#716954" stroke-width="7"/>':'')+(stage===3?'<path d="M37 77q63 27 124 0" fill="none" stroke="#477046" stroke-width="5"/><g fill="#efcb70"><circle cx="58" cy="84" r="4"/><circle cx="83" cy="89" r="4"/><circle cx="108" cy="89" r="4"/><circle cx="134" cy="84" r="4"/></g>':'')+'</svg>';
  },
  scene(p,editable){
    const d=this.ensure(p),scene=el('div','camp-yard'+(editable?' editable-yard':''));
    const count=Object.keys(d.slots).length;
    scene.setAttribute('aria-label','Your camp: '+(d.pitch==='soccer'?'soccer field':'open meadow')+' and '+count+' placed item'+(count===1?'':'s'));
    const trees=[25,100,182,270,725,810,895,977].map((x,i)=>'<path d="m'+x+' 8-27 52h15l-30 46h84l-30-46h15Z" fill="'+(i%2?'#386d51':'#4d805b')+'"/>').join('');
    const grass=['#c1c89d','#c6d49c','#cbdca7','#d0e2af'][p.camp.field]||'#c1c89d';
    scene.appendChild(el('div','yard-ground','<svg viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect width="1000" height="650" fill="'+grass+'"/><path d="M0 480Q120 420 115 650H0Z" fill="#93c6c8"/><path d="M0 468Q142 420 128 650" fill="none" stroke="#f2e9cb" stroke-width="18"/><path d="M510 180Q610 300 850 610" fill="none" stroke="#e7d6ae" stroke-width="35"/><ellipse cx="500" cy="425" rx="290" ry="175" fill="'+grass+'"/>'+trees+'</svg>'));
    const lodge=el('div','yard-lodge',this.lodge(p.camp.lodge)+'<span>Welcome Lodge</span>');scene.appendChild(lodge);
    const pitch=el('div','yard-pitch '+(d.pitch==='soccer'?'soccer-pitch':'meadow-pitch'));
    if(d.pitch==='soccer'){
      pitch.innerHTML='<span class="pitch-midline"></span><span class="pitch-circle"></span><span class="pitch-box top"></span><span class="pitch-box bottom"></span><span class="pitch-goal top"></span><span class="pitch-goal bottom"></span><span class="pitch-ball" aria-hidden="true">⚽</span><span class="pitch-caption">Your soccer field</span>';
    }else{pitch.style.background=['#aeb381','#b8c487','#b9ce8d','#bedd95'][p.camp.field]||'#aeb381';pitch.innerHTML='<span class="meadow-label">Your open meadow</span><span class="meadow-sprigs" aria-hidden="true">'+(p.camp.field===0?'♧ &nbsp; ♧ &nbsp; ♧':'✿ &nbsp; ✿ &nbsp; ✿')+'</span>';}
    scene.appendChild(pitch);
    for(const slot of YARD_SLOTS){
      const id=d.slots[slot.id],it=this.item(id),cell=el(editable?'button':'div','yard-slot'+(id?' has-item':' empty-slot'));
      cell.style.left=slot.x+'%';cell.style.top=slot.y+'%';
      if(editable){cell.id='plot-'+slot.id;cell.setAttribute('aria-label',slot.name+': '+(it?it.name:'empty')+(this.selected?'. Place '+this.item(this.selected).name:'') );cell.setAttribute('aria-pressed',String(Boolean(id&&id===this.selected)));}
      cell.innerHTML=(it?this.art(id):'<span class="slot-plus" aria-hidden="true">+</span>')+'<span class="slot-label">'+esc(editable?slot.name:(it?it.name:''))+'</span>';
      if(editable)cell.onclick=()=>{
        if(this.selected){const name=this.item(this.selected).name;this.place(p,this.selected,slot.id);this.selected=null;this.message=name+' placed at '+slot.name+'. Saved!';Audio2.pop();}
        else if(id){this.selected=id;this.message=it.name+' selected. Choose another place to move it, or put it away.';}
        else this.message='Choose an item from Your backpack first, then choose this place.';
        this.renderDesigner(p);document.getElementById('plot-'+slot.id)?.focus?.();
      };
      scene.appendChild(cell);
    }
    scene.appendChild(el('span','yard-stamp','Made by '+esc(p.name)));
    return scene;
  },
  renderGoal(box,p){
    box.innerHTML='';const it=this.goal(p);
    if(!it){box.appendChild(el('p','fine','Your shop collection is complete! Keep arranging your camp and practicing your skills.'));return;}
    const card=el('div','camp-goal'),art=el('div','goal-art',this.art(it.id)),details=el('div','goal-copy');
    details.appendChild(el('span','eyebrow','Saving for'));
    details.appendChild(el('strong',null,esc(it.name)));
    const needed=Math.max(0,it.cost-p.tokens);
    details.appendChild(el('p','fine',needed?needed+' more token'+(needed===1?'':'s')+' to '+(it.id==='soccer-field'?'build your field.':'bring it to camp.'):'You have enough tokens. Ready to build!'));
    const progress=el('div','goal-progress','<span style="width:'+Math.min(100,p.tokens/it.cost*100)+'%"></span>');progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Tokens saved for '+it.name);progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(it.cost));progress.setAttribute('aria-valuenow',String(Math.min(it.cost,p.tokens)));details.appendChild(progress);
    const inShop=box.id==='shop-goal',btn=el('button','mid-btn',inShop?'Find this item ↓':needed?'See my goal':'Get it in the shop →');
    btn.onclick=()=>{
      if(!inShop){App.showShop();return;}
      const card=[...document.getElementById('shop-list').children].find(c=>c.getAttribute('data-item')===it.id);
      card?.scrollIntoView?.({block:'center'});const buttons=card?.querySelectorAll('button');if(buttons)[...buttons].find(b=>!b.disabled)?.focus?.();
    };
    card.appendChild(art);card.appendChild(details);card.appendChild(btn);box.appendChild(card);
  },
  renderDesigner(p){
    const d=this.ensure(p);document.getElementById('design-message').textContent=this.message;
    const box=document.getElementById('designer-yard');box.innerHTML='';box.appendChild(this.scene(p,true));
    const inv=document.getElementById('design-inventory');inv.innerHTML='';
    inv.appendChild(el('h3',null,'Your backpack'));inv.appendChild(el('p','fine','Pick an item, then a place. Moving onto another item swaps their places. Items put away stay yours.'));
    const grid=el('div','inventory-grid');
    for(const it of [...STARTER_ITEMS,...SHOP_ITEMS].filter(it=>it.id!=='soccer-field'&&this.owns(p,it.id))){
      const placed=Object.values(d.slots).includes(it.id),b=el('button','inventory-item'+(this.selected===it.id?' selected':''),this.art(it.id)+'<span>'+esc(it.name)+'</span><small>'+(it.cost===0?'Welcome gift · ':'')+(placed?'In camp':'In backpack')+'</small>');
      b.id='pack-'+it.id;b.setAttribute('aria-label','Place '+it.name);b.setAttribute('aria-pressed',String(this.selected===it.id));
      b.onclick=()=>{this.selected=it.id;this.message=it.name+' selected. Choose a place in your camp.';this.renderDesigner(p);document.getElementById(b.id)?.focus?.();};grid.appendChild(b);
    }
    inv.appendChild(grid);
    const away=el('button','hint-btn','Put selected item away');away.disabled=!this.selected||!Object.values(d.slots).includes(this.selected);
    away.onclick=()=>{if(!this.selected)return;const name=this.item(this.selected).name;this.putAway(p,this.selected);this.selected=null;this.message=name+' is safe in your backpack.';this.renderDesigner(p);};inv.appendChild(away);
    if(this.owns(p,'soccer-field')){
      const mode=el('div','field-mode');mode.appendChild(el('h3',null,'Choose your field'));
      for(const value of ['soccer','meadow']){const b=el('button','hint-btn',value==='soccer'?'Soccer field':'Open meadow');b.setAttribute('aria-pressed',String(d.pitch===value));b.onclick=()=>{d.pitch=value;this.soccer=null;Store.persist();this.message=value==='soccer'?'Soccer field ready. Try a few goal kicks below!':'Open meadow ready. Your soccer kit stays yours.';this.renderDesigner(p);};mode.appendChild(b);}inv.appendChild(mode);
    }
    this.renderSoccer(p);
    this.renderActivities(p);
  },
  kick(p,aim){
    if(!this.owns(p,'soccer-field')||this.ensure(p).pitch!=='soccer'||!['left','center','right'].includes(aim)||!this.soccer||this.soccer.shots>=3)return false;
    const s=this.soccer,target=['center','left','right'][s.shots],goal=aim===target;
    s.shots++;if(goal){s.goals++;p.camp.design.goals++;Audio2.good();}else Audio2.pop();
    s.lastAim=aim;s.lastGoal=goal;p.camp.design.best=Math.max(p.camp.design.best,s.goals);Store.persist();return true;
  },
  renderSoccer(p){
    const box=document.getElementById('soccer-activity');box.innerHTML='';const d=this.ensure(p);
    if(!this.owns(p,'soccer-field')){
      const locked=el('div','soccer-unlock');locked.appendChild(el('div','unlock-art',this.art('soccer-field')));locked.appendChild(el('h3',null,'Turn the meadow into a soccer field'));
      locked.appendChild(el('p','hint','The soccer kit adds field markings, two goals, and a goal-kicking activity. Save 4 tokens to build it.'));
      const b=el('button','mid-btn','Save for the soccer kit');b.onclick=()=>{this.setGoal(p,'soccer-field');App.showShop();};locked.appendChild(b);box.appendChild(locked);return;
    }
    if(d.pitch!=='soccer'){box.appendChild(el('p','fine','Choose Soccer field above whenever you want to play.'));return;}
    const card=el('div','soccer-game');card.appendChild(el('span','eyebrow','Your camp activity'));card.appendChild(el('h3',null,'Goal kick!'));
    card.appendChild(el('p','hint','Aim at the golden cone. Pick left, center, or right. Three kicks per round; play whenever you like.'));
    if(!this.soccer){const start=el('button','big-btn','Play goal kick');start.onclick=()=>{this.soccer={shots:0,goals:0};this.renderSoccer(p);};card.appendChild(start);}
    else{
      const s=this.soccer,target=s.shots<3?['center','left','right'][s.shots]:null;
      const goal=el('div','kick-goal');
      for(const aim of ['left','center','right'])goal.appendChild(el('span','goal-zone'+(target===aim?' target-zone':''),target===aim?'<span aria-hidden="true">▲</span><small>Golden cone</small>':''));
      const ball=el('span','kick-ball'+(s.lastAim?' kicked':''),'⚽');ball.style.setProperty?.('--kick-x',({left:'-90px',center:'0px',right:'90px'})[s.lastAim]||'0px');goal.appendChild(ball);card.appendChild(goal);
      const msg=s.shots===3?'Round complete! '+s.goals+' of 3 goals.':(s.shots?(s.lastGoal?'Goal! ':'Wide of the cone. '):'')+'Kick '+(s.shots+1)+' of 3: aim '+target+'.';
      const status=el('p','kick-status',esc(msg));status.setAttribute('role','status');status.setAttribute('aria-live','polite');card.appendChild(status);
      if(s.shots<3){const row=el('div','row kick-controls');for(const aim of ['left','center','right']){const b=el('button','mid-btn','Kick '+aim);b.onclick=()=>{if(this.kick(p,aim))this.renderSoccer(p);};row.appendChild(b);}card.appendChild(row);}
      else{const b=el('button','mid-btn','Play another round');b.onclick=()=>{this.soccer={shots:0,goals:0};this.renderSoccer(p);};card.appendChild(b);}
    }
    card.appendChild(el('p','fine','Personal best: '+d.best+' / 3 · Total goals: '+d.goals+'. Camp play does not spend or earn tokens.'));
    box.appendChild(card);
  },
  /* Chapter-completion activities: the working Trading Post and the picnic sharing board. */
  renderActivities(p){
    const box=document.getElementById('chapter-activities');if(!box)return;box.innerHTML='';
    const chDone=ch=>window.TARGETS.filter(t=>t.chapter===ch).every(t=>p.targets[t.id]&&p.targets[t.id].done);
    /* Trading Post checkout */
    const post=el('div','soccer-game');
    post.appendChild(el('span','eyebrow','Trading Post activity'));
    post.appendChild(el('h3',null,'🧾 Trading Post checkout'));
    if(!chDone('ch10')){
      post.appendChild(el('p','hint','Finish every Money mission to open the Trading Post! Then you can run the checkout and make change for customers.'));
    }else{
      const c=this.checkout||(this.checkout={price:65,paid:100,made:0,served:0,message:'A customer is waiting!'});
      post.appendChild(el('p','hint','The customer buys something for '+fmtMoney(c.price)+' and pays with '+fmtMoney(c.paid)+'. Tap coins and bills to make the change: '+fmtMoney(c.paid-c.price)+'.'));
      post.appendChild(el('p','hint','Your change so far: <b>'+fmtMoney(c.made)+'</b>'+(c.message?' · '+esc(c.message):'')));
      const row=el('div','row');
      for(const v of [25,10,5,1]){ const b=el('button','mid-btn',v+'¢'); b.onclick=()=>{ c.made+=v; c.message=''; this.renderActivities(p); }; row.appendChild(b); }
      const clear=el('button','mid-btn','Start over'); clear.onclick=()=>{ c.made=0; c.message=''; this.renderActivities(p); }; row.appendChild(clear);
      const give=el('button','big-btn','Give change'); give.onclick=()=>{
        if(c.made===c.paid-c.price){ c.served++; const items=[['a sticker',65,100],['a juice box',85,100],['a muffin',145,500],['a cap',375,500],['a whistle',230,500],['a postcard',55,100],['a kite',690,1000],['a ball',425,500]];
          const next=items[Math.floor(Math.random()*items.length)]; c.price=next[1]; c.paid=next[2]; c.made=0; c.message='Correct change! 🎉 Customer '+(c.served)+' served. Next customer: '+next[0]+'.'; Audio2.good(); }
        else c.message='That is '+fmtMoney(c.made)+' — the change should be '+fmtMoney(c.paid-c.price)+'. Try again!';
        this.renderActivities(p);
      }; row.appendChild(give);
      post.appendChild(row);
      post.appendChild(el('p','fine','Customers served this visit: '+c.served+'. Camp play does not spend or earn tokens.'));
    }
    box.appendChild(post);
    /* Picnic sharing board */
    const grove=el('div','soccer-game');
    grove.appendChild(el('span','eyebrow','Picnic Grove activity'));
    grove.appendChild(el('h3',null,'🍉 Picnic sharing board'));
    if(!chDone('ch11')){
      grove.appendChild(el('p','hint','Finish every Fractions mission to open the sharing board! Then you can cut picnic pies into equal parts and share them fairly.'));
    }else{
      const s=this.picnic||(this.picnic={parts:4,shaded:1,target:null,message:'Cut the pie and shade a share!'});
      const view=el('div','demo-visual');view.innerHTML=fractionSVG({parts:s.parts,shaded:s.shaded,shape:'circle'});grove.appendChild(view);
      grove.appendChild(el('p','hint','The pie is cut into '+s.parts+' equal parts, and '+s.shaded+' of them are shaded: <b>'+s.shaded+'/'+s.parts+'</b>'+(s.message?' · '+esc(s.message):'')));
      const row=el('div','row');
      const mk=(label,fn)=>{ const b=el('button','mid-btn',label); b.onclick=()=>{ fn(); s.message=''; this.renderActivities(p); }; return b; };
      row.appendChild(mk('Parts −',()=>{ s.parts=Math.max(2,s.parts-1); s.shaded=Math.min(s.shaded,s.parts); }));
      row.appendChild(mk('Parts +',()=>{ s.parts=Math.min(10,s.parts+1); }));
      row.appendChild(mk('Shade −',()=>{ s.shaded=Math.max(0,s.shaded-1); }));
      row.appendChild(mk('Shade +',()=>{ s.shaded=Math.min(s.parts,s.shaded+1); }));
      const challenge=el('button','big-btn',s.target?'Check my share':'Give me a challenge');
      challenge.onclick=()=>{
        if(!s.target){ const den=[3,4,5,6,7,8,9,10][Math.floor(Math.random()*8)]; s.target={num:1+Math.floor(Math.random()*(den-1)),den}; s.message='Your challenge: show '+s.target.num+'/'+s.target.den+'.'; }
        else if(s.parts===s.target.den&&s.shaded===s.target.num){ s.message='That is exactly '+s.target.num+'/'+s.target.den+'! 🎉'; s.target=null; Audio2.good(); }
        else s.message='Not yet — the challenge is '+s.target.num+'/'+s.target.den+'. You are showing '+s.shaded+'/'+s.parts+'.';
        this.renderActivities(p);
      };
      row.appendChild(challenge);
      grove.appendChild(row);
      grove.appendChild(el('p','fine','Equal parts make fair shares. Camp play does not spend or earn tokens.'));
    }
    box.appendChild(grove);
  },
  reward(body,p,earned,restored){
    const card=el('div','camp-reward');card.appendChild(el('span','eyebrow','Your work grows your camp'));
    card.appendChild(el('h3',null,earned?'🪙 +'+earned+' camp token'+(earned===1?'':'s'):'Your camp is waiting'));
    card.appendChild(el('p','fine',restored||'Use your tokens to choose something, then put it in your camp.'));
    card.appendChild(this.scene(p,false));
    const goal=el('div');this.renderGoal(goal,p);card.appendChild(goal);
    const build=el('button','big-btn','Build my camp →');build.onclick=()=>App.showDesign();card.appendChild(build);body.appendChild(card);
  }
};
