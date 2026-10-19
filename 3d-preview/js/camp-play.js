/* Camp customization and sport rules. Pure rules are independently tested. */
'use strict';
const CampStyle={
  team(v){return ({forest:'#246b59',gold:'#cc9a3d',lagoon:'#3979b5',sunset:'#c96c61'})[v]||'#246b59';},
  roof(v){return ({cedar:'#a65e46',pine:'#3c6d62',slate:'#536c7c'})[v]||'#a65e46';},
  tent(v){return ({canvas:'#edcb8c',coral:'#ce8066',lake:'#6ba9ae'})[v]||'#edcb8c';},
  validChoice(p,key,value){
    const map={roof:['cedar','pine','slate'],tentColor:['canvas','coral','lake'],team:['forest','gold','lagoon','sunset']};
    if(!map[key]?.includes(value))return false;
    return !(value==='lagoon'&&!Yard.owns(p,'team-blue'))&&!(value==='sunset'&&!Yard.owns(p,'team-sunset'));
  },
  set(p,key,value){if(!this.validChoice(p,key,value))return false;Yard.ensure(p)[key]=value;Store.persist();return true;},
  transform(p,id,change){
    const d=Yard.ensure(p);if(!Yard.owns(p,id)||!Yard.isPlaceable(id))return false;
    const tr=d.transforms[id]||{rotation:0,scale:1};
    if(change==='rotate')tr.rotation=(tr.rotation+45)%360;
    else if([.8,1,1.2].includes(change))tr.scale=change;else return false;
    d.transforms[id]=tr;Store.persist();return true;
  },
  render(inv,p){
    const d=Yard.ensure(p),card=el('div','style-panel');card.appendChild(el('h3',null,'Make it your camp'));
    const choose=(title,key,options)=>{const group=el('div','style-choices');group.appendChild(el('strong',null,title));for(const [value,label,color]of options){const b=el('button','swatch-btn','<i style="background:'+color+'"></i>'+label);b.disabled=!this.validChoice(p,key,value);b.setAttribute('aria-pressed',String(d[key]===value));b.onclick=()=>{if(this.set(p,key,value))Yard.renderDesigner(p);};group.appendChild(b);}card.appendChild(group);};
    choose('Lodge roof','roof',[['cedar','Cedar','#a65e46'],['pine','Pine','#3c6d62'],['slate','Slate','#536c7c']]);
    choose('Tent fabric','tentColor',[['canvas','Canvas','#edcb8c'],['coral','Coral','#ce8066'],['lake','Lake','#6ba9ae']]);
    if(Yard.selected){const tr=d.transforms[Yard.selected]||{rotation:0,scale:1},row=el('div','style-choices');row.appendChild(el('strong',null,Yard.item(Yard.selected).name));for(const [label,value]of [['Rotate 45°','rotate'],['Small',.8],['Regular',1],['Large',1.2]]){const b=el('button','hint-btn',label);b.onclick=()=>{this.transform(p,Yard.selected,value);Yard.renderDesigner(p);};row.appendChild(b);}card.appendChild(row);}
    if(Yard.owns(p,'soccer-field')){
      card.appendChild(el('h3',null,'Your soccer club'));choose('Team colors','team',[['forest','Forest','#246b59'],['gold','Gold','#cc9a3d'],['lagoon','Blue kit · shop','#3979b5'],['sunset','Sunset kit · shop','#c96c61']]);
      const label=el('label','team-name-label','Team nickname (16 characters max)'),input=el('input');input.id='team-name';input.maxLength=16;input.value=d.teamName;input.setAttribute('aria-label','Team nickname');label.appendChild(input);card.appendChild(label);
      const save=el('button','mid-btn','Save team nickname');save.onclick=()=>{d.teamName=input.value.trim().slice(0,16)||'Wildwood FC';Store.persist();Yard.message='Team nickname saved!';Yard.renderDesigner(p);};card.appendChild(save);
      for(const [id,key,label]of [['pitch-stripes','striped','Striped turf'],['goal-neon','neon','Mint goal frames'],['stadium-lights','floodlights','Stadium lights'],['grandstand','stands','Team stands']]){
        const b=el('button','upgrade-btn',(Yard.owns(p,id)?(d[key]?'✓ ':'＋ '):'🔒 ')+label+(Yard.owns(p,id)?'':' · '+Yard.item(id).cost+' tokens'));b.setAttribute('aria-pressed',String(Boolean(Yard.owns(p,id)&&d[key])));b.onclick=()=>{if(!Yard.owns(p,id)){Yard.setGoal(p,id);App.showShop();return;}d[key]=!d[key];Store.persist();Yard.renderDesigner(p);};card.appendChild(b);
      }
    }inv.appendChild(card);
  }
};
const SoccerRules={
  resolve({aimX,aimY,power,keeperX,difficulty='cozy'}){
    if(![aimX,aimY,power,keeperX].every(Number.isFinite)||Math.abs(aimX)>1||aimY<0||aimY>1||power<0||power>1)return null;
    const x=aimX*3.65,y=.55+aimY*1.8+Math.max(0,power-.85)*13;
    const short=power<.3,wide=Math.abs(x)>3.9,high=y>2.85;
    const reach=difficulty==='ranger'?1.05:.8,saved=!short&&!wide&&!high&&Math.abs(x-keeperX)<reach&&y<2.6;
    return {x,y,goal:!short&&!wide&&!high&&!saved,outcome:short?'short':high?'high':wide?'wide':saved?'saved':'goal'};
  }
};
const CanoeRules={
  create(seed=Date.now()){const random=mulberry32(seed);return {lane:1,gates:Array.from({length:8},()=>Math.floor(random()*3)),index:0,score:0,phase:'ready',progress:0};},
  steer(s,lane){if(!s||!Number.isInteger(lane)||lane<0||lane>2||s.phase==='done')return false;s.lane=lane;return true;},
  cross(s){if(!s||s.phase!=='running'||s.index>=s.gates.length)return false;const hit=s.lane===s.gates[s.index];if(hit)s.score++;s.index++;s.progress=0;if(s.index===s.gates.length)s.phase='done';return hit;}
};
const CampPlay={
  soccer:null,canoe:null,canoeTimer:null,
  stop(){this.soccer=null;this.canoe=null;if(this.canoeTimer){window.clearInterval?.(this.canoeTimer);this.canoeTimer=null;}this.syncMode();},
  dialog(card){card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','Camp sports challenge');card.addEventListener('keydown',e=>{if(e.key==='Escape'){card.querySelector('.game-exit')?.click?.();return;}if(e.key==='Tab'){const buttons=[...card.querySelectorAll('button,input')].filter(b=>!b.disabled);const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&e.target===first){e.preventDefault();last?.focus?.();}else if(!e.shiftKey&&e.target===last){e.preventDefault();first?.focus?.();}}});},
  syncMode(){document.documentElement?.classList.toggle('playing-camp-game',Boolean(this.soccer||(this.canoe&&this.canoe.phase!=='ready')));},
  newSoccer(mode='cozy'){return {mode,phase:'ready',shots:0,goals:0,points:0,aimX:.7,aimY:.65,power:.6,clock:0,keeperX:0,flight:0,result:null,committed:false,target:0};},
  fire(p,s){
    if(!s||s.phase!=='ready'||s.shots>=5||!Yard.owns(p,'soccer-field')||Yard.ensure(p).pitch!=='soccer')return false;
    const result=SoccerRules.resolve({...s,difficulty:s.mode});if(!result)return false;s.result=result;s.phase='flight';s.flight=0;s.shots++;s.committed=false;Audio2.click();return true;
  },
  commit(p,s){
    if(!s||s.phase!=='flight'||s.committed)return false;s.committed=true;
    if(s.result.goal){s.goals++;Yard.ensure(p).goals++;s.points+=100;if(Math.hypot(s.result.x-(s.target%2?-2.7:2.7),s.result.y-1.9)<.45)s.points+=50;Audio2.good();}else Audio2.pop();
    const stats=Yard.ensure(p).soccer3D;stats.bestGoals=Math.max(stats.bestGoals,s.goals);stats.bestScore=Math.max(stats.bestScore,s.points);stats.rounds+=s.shots===5?1:0;Store.persist();s.phase=s.shots>=5?'done':'result';return true;
  },
  renderSoccer(box,p){
    box.innerHTML='';const d=Yard.ensure(p);
    if(!Yard.owns(p,'soccer-field')){const locked=el('div','activity-unlock','<span class="eyebrow">BUILD · CUSTOMIZE · PLAY</span><h3>Wildwood Shootout</h3><p>A moving goalkeeper. Five shots. Your own club colors. Build the soccer field kit for 4 math tokens to open the 3D pitch.</p>');const b=el('button','mid-btn','Save for the soccer kit');b.onclick=()=>{Yard.setGoal(p,'soccer-field');App.showShop();};locked.appendChild(b);box.appendChild(locked);return;}
    if(d.pitch!=='soccer'){box.appendChild(el('p','hint','Choose Soccer field in the designer to open Wildwood Shootout.'));return;}
    const card=el('div','arcade-card'+(this.soccer?' arcade-playing':''));if(this.soccer){this.dialog(card);const exit=el('button','game-exit','✕ Back to camp designer');exit.onclick=()=>{this.soccer=null;this.renderSoccer(box,p);};card.appendChild(exit);}this.syncMode();card.appendChild(el('span','eyebrow','YOUR CLUB · YOUR CHALLENGE'));card.appendChild(el('h3',null,'Wildwood Shootout'));
    card.appendChild(el('p','hint','1. Tap the goal or pick an aim button. 2. Watch the keeper. 3. Kick while the power marker is in the gold zone. Aim for the floating ring for a bonus. Five shots, no timer.'));
    if(!this.soccer){const modes=el('div','row');for(const [mode,label]of [['cozy','Play goal kick'],['ranger','Ranger challenge']]){const b=el('button',mode==='cozy'?'big-btn':'mid-btn',label);b.onclick=()=>{this.canoe=null;this.soccer=this.newSoccer(mode);this.renderSoccer(box,p);};modes.appendChild(b);}card.appendChild(modes);}
    const s=this.soccer||this.newSoccer(),aimButtons=[];const stage=el('div','world-stage soccer-stage');stage.appendChild(el('span','world-loading','Opening the 3D pitch…'));stage.setAttribute('data-daylight',d.timeOfDay);const layout=el('div','shootout-layout'),consoleBox=el('div','shootout-console');layout.appendChild(stage);layout.appendChild(consoleBox);card.appendChild(layout);
    const hud=el('div','arcade-hud','<span>'+esc(d.teamName)+'</span><span>SHOT '+Math.min(5,s.phase==='ready'?s.shots+1:Math.max(1,s.shots))+' / 5</span><strong>'+s.goals+' GOALS · '+s.points+' PTS</strong>');consoleBox.appendChild(hud);
    const status=el('p','arcade-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');consoleBox.appendChild(status);
    if(this.soccer){
      const grid=el('div','aim-grid');grid.setAttribute('aria-label','Choose where to aim in the goal');for(const [yy,rowName]of [[.85,'High'],[.2,'Low']])for(const [xx,colName]of [[-.8,'left'],[0,'center'],[.8,'right']]){const b=el('button','aim-btn',rowName+' '+colName);b.setAttribute('aria-pressed',String(s.aimX===xx&&s.aimY===yy));b.disabled=s.phase!=='ready';b.onclick=()=>{s.aimX=xx;s.aimY=yy;for(const a of grid.children)a.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');};grid.appendChild(b);aimButtons.push(b);}consoleBox.appendChild(grid);
      if(s.phase==='ready'){
        const meter=el('div','power-meter','<span class="power-safe"></span><i class="power-marker"></i>');meter.setAttribute('role','img');meter.setAttribute('aria-label','Shot power meter. Gold zone gives controlled power.');consoleBox.appendChild(meter);
        const controls=el('div','row shot-buttons'),kick=el('button','big-btn','KICK!');kick.onclick=()=>{if(this.fire(p,s)){kick.disabled=true;status.textContent='Ball in flight…';for(const b of grid.children)b.disabled=true;setTimeout(()=>{if(this.soccer===s&&s.phase==='flight'&&this.commit(p,s))this.renderSoccer(box,p);},1250);}};controls.appendChild(kick);
        const steady=el('button','hint-btn',s.steady?'Steady power: ON':'Use steady power');steady.setAttribute('aria-pressed',String(Boolean(s.steady)));steady.onclick=()=>{s.steady=!s.steady;s.power=.65;steady.textContent=s.steady?'Steady power: ON':'Use steady power';steady.setAttribute('aria-pressed',String(s.steady));};controls.appendChild(steady);consoleBox.appendChild(controls);
        status.textContent='Choose a corner. Watch the keeper, then make your shot.';
      }else if(s.phase==='done'||s.phase==='result'){
        const messages={goal:'GOAL! A great finish.',saved:'Saved! Try a corner farther from the keeper.',high:'Over the bar. Try a little less power.',short:'Not enough power. Look for the gold zone.',wide:'Just wide. Aim inside the posts.'};status.textContent=(messages[s.result?.outcome]||'')+(s.phase==='done'?' Final score: '+s.goals+' / 5 goals · '+s.points+' points.':'');
        const next=el('button','big-btn',s.phase==='done'?'Play another round':'Next shot →');next.onclick=()=>{if(s.phase==='done')this.soccer=this.newSoccer(s.mode);else{s.phase='ready';s.result=null;s.target++;}this.renderSoccer(box,p);};consoleBox.appendChild(next);
      }
    }
    card.appendChild(el('p','fine','Best: '+d.soccer3D.bestGoals+' / 5 goals · '+d.soccer3D.bestScore+' points. Sports scores stay separate from math tokens. Steady power is always available.'));box.appendChild(card);
    if(typeof Camp3D!=='undefined')Camp3D.mount(stage,'soccer',p,{onAim:(x,y)=>{if(this.soccer!==s||s.phase!=='ready')return;s.aimX=x;s.aimY=y;for(const b of aimButtons)b.setAttribute('aria-pressed','false');},update:(v,dt)=>{
      s.clock+=dt;const calm=Living.isCalm();
      if(s.phase==='ready'){s.keeperX=Math.sin(s.clock*(s.mode==='ranger'?1.65:1.05))*2.7;s.power=(s.steady||calm)?.65:.2+.8*(.5+.5*Math.sin(s.clock*3));v.keeper.position.x=s.keeperX;v.keeper.rotation.z=0;v.ball.position.set(0,.4,6.5);const marker=card.querySelector('.power-marker');if(marker)marker.style.left=s.power*100+'%';v.targetRing.position.x=s.target%2?-2.7:2.7;v.aimRing.position.set(s.aimX*3.65,.55+s.aimY*1.8,-8.3);}
      if(s.phase==='flight'){
        s.flight+=dt/(calm?.55:1.05);const t=Math.min(1,s.flight);v.ball.position.set(s.result.x*t,.4+(s.result.y-.4)*t+Math.sin(t*Math.PI)*2.8,6.5-15*t);v.ball.rotation.x-=dt*12;v.keeper.position.x+=(s.result.x-v.keeper.position.x)*dt*2;v.keeper.rotation.z=-Math.sign(s.result.x-s.keeperX)*Math.sin(t*Math.PI)*.7;
        if(t===1&&this.soccer===s&&this.commit(p,s))this.renderSoccer(box,p);
      }
    }});
  },
  renderCanoe(box,p){
    if(this.canoeTimer){window.clearInterval?.(this.canoeTimer);this.canoeTimer=null;}
    const d=Yard.ensure(p),card=el('div','arcade-card canoe-card');card.appendChild(el('span','eyebrow','THE CREEK IS CALLING'));card.appendChild(el('h3',null,'Creek Gate Rally'));
    if(!Yard.owns(p,'canoe')){card.appendChild(el('p','hint','Save 7 math tokens for the creek canoe. Then steer a 3D canoe through eight winding gates.'));const b=el('button','mid-btn','Save for the canoe');b.onclick=()=>{Yard.setGoal(p,'canoe');App.showShop();};card.appendChild(b);box.appendChild(card);return;}
    card.appendChild(el('p','hint','Steer left, middle, or right to line up with the next gold gate. The creek carries you forward. Eight gates; missing one just gives you another chance.'));
    const s=this.canoe||(this.canoe=CanoeRules.create());if(s.phase!=='ready'){card.classList.add('arcade-playing');card.classList.add('canoe-playing');this.dialog(card);const exit=el('button','game-exit','✕ Back to camp designer');exit.onclick=()=>{this.canoe=null;Yard.renderDesigner(p);};card.appendChild(exit);}this.syncMode();const stage=el('div','world-stage canoe-stage');stage.appendChild(el('span','world-loading','Launching your canoe…'));card.appendChild(stage);
    const status=el('p','arcade-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');card.appendChild(status);
    const updateStatus=()=>status.textContent=s.phase==='done'?'Creek run complete! '+s.score+' of 8 gates.':s.phase==='ready'?'Ready for the creek?':'Gate '+(s.index+1)+' of 8 · Steer '+['LEFT','MIDDLE','RIGHT'][s.gates[s.index]]+' · '+s.score+' gates cleared.';updateStatus();
    const controls=el('div','row');for(const [lane,label]of [[0,'Steer left'],[1,'Steer middle'],[2,'Steer right']]){const b=el('button','mid-btn',label);b.disabled=s.phase==='done';b.setAttribute('aria-pressed',String(s.lane===lane));b.onclick=()=>{CanoeRules.steer(s,lane);for(const a of controls.children)a.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');};controls.appendChild(b);}card.appendChild(controls);
    if(s.phase==='ready'||s.phase==='done'){const start=el('button','big-btn',s.phase==='ready'?'Start creek run':'Run the creek again');start.onclick=()=>{if(s.phase==='done')this.canoe=CanoeRules.create();this.soccer=null;this.canoe.phase='running';Yard.renderDesigner(p);};card.appendChild(start);}
    const pause=el('button','hint-btn',s.phase==='paused'?'Resume creek run':'Pause creek run');pause.disabled=s.phase==='ready'||s.phase==='done';pause.onclick=()=>{s.phase=s.phase==='paused'?'running':'paused';pause.textContent=s.phase==='paused'?'Resume creek run':'Pause creek run';};card.appendChild(pause);
    card.appendChild(el('p','fine','Personal best: '+d.canoeBest+' / 8 gates. No tokens are spent or awarded.'));box.appendChild(card);
    if(s.phase==='running'&&window.setInterval)this.canoeTimer=window.setInterval(()=>{
      if(this.canoe!==s||!stage.isConnected){window.clearInterval(this.canoeTimer);this.canoeTimer=null;return;}
      if(document.hidden||s.phase!=='running')return;
      s.progress+=.1*(s.index<3?.24:.29);
      if(s.progress>=1){const good=CanoeRules.cross(s);good?Audio2.pop():Audio2.click();updateStatus();if(s.phase==='done'){d.canoeBest=Math.max(d.canoeBest,s.score);Store.persist();Yard.renderDesigner(p);}}
    },100);
    if(typeof Camp3D!=='undefined')Camp3D.mount(stage,'canoe',p,{update:(v,dt)=>{
      v.boat.position.x+=((s.lane-1)*2.8-v.boat.position.x)*Math.min(1,dt*7);v.boat.rotation.z=Living.isCalm()?0:Math.sin(v.time*2)*.04;
      for(let j=0;j<v.gates.length;j++){const idx=s.index+j;v.gates[j].visible=idx<s.gates.length;v.gates[j].position.set(((s.gates[idx]??1)-1)*2.8,0,5-(1-s.progress)*12-j*12);}
    }});
    // Accessible non-WebGL play: deliberate steering + crossing, same rules.
    const cross=el('button','hint-btn canoe-fallback','Cross next gate (simple mode)');cross.onclick=()=>{if(s.phase!=='running')return;CanoeRules.cross(s);if(s.phase==='done'){d.canoeBest=Math.max(d.canoeBest,s.score);Store.persist();}Yard.renderDesigner(p);};card.appendChild(cross);
  }
};
