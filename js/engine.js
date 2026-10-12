/* Mission player: demonstration, controls, guided work, independent work, optional challenge. */
'use strict';

const MathCheck={
  expected(pr){
    const m=pr&&pr.math;if(!m)return NaN;
    if(m.type==='add')return m.a+m.b;
    if(m.type==='subtract')return m.a-m.b;
    if(m.type==='equivalent-add')return m.a+m.b-m.known;
    if(m.type==='missing-addend')return m.total-m.a;
    if(m.type==='multiply')return m.a*m.b;
    if(m.type==='divide')return m.divisor>0?m.total/m.divisor:NaN;
    if(m.type==='difference')return m.c*m.d-m.a*m.b;
    if(m.type==='money'){
      if(m.op==='add')return m.a+m.b;
      if(m.op==='sub'||m.op==='change')return m.a-m.b;
      if(m.op==='compare')return m.pick==='less'?Math.min(m.a,m.b):Math.max(m.a,m.b);
      return m.cents;
    }
    if(m.type==='fraction')return m.num+'/'+m.den;
    if(m.type==='fraction-whole')return (m.den-m.num)+'/'+m.den;
    if(m.type==='fraction-count')return m.num;
    if(m.type==='fraction-shade')return m.num;
    if(m.type==='fraction-compare'){
      const left=m.aNum*m.bDen,right=m.bNum*m.aDen;
      if(left===right)return m.aNum+'/'+m.aDen;
      const aBigger=left>right;
      return (m.pick==='smaller')!==aBigger? m.aNum+'/'+m.aDen : m.bNum+'/'+m.bDen;
    }
    return NaN;
  },
  valid(pr){
    const m=pr&&pr.math;if(!m)return false;
    const n=this.expected(pr);
    let expectedText;
    if(typeof n==='string'){ expectedText=n; }
    else{
      if(!Number.isInteger(n)||n<0)return false;
      if(n>(m.type==='money'?2000:1000))return false;
      expectedText=pr.moneyText?fmtMoney(n):String(n);
    }
    return expectedText===String(pr.answer)&&
      typeof pr.html==='string'&&typeof pr.key==='string'&&
      (!pr.choices||(new Set(pr.choices.map(String)).size===pr.choices.length&&pr.choices.map(String).includes(expectedText)));
  }
};

const Engine={
  VERSION:'dm2b-m2b',target:null,profile:null,steps:[],idx:0,firstTry:true,active:false,visitId:null,
  start(targetId){
    const t=window.TARGETS.find(x=>x.id===targetId);if(!t||!App.profile)return;
    if(typeof Camp!=='undefined'&&Camp.isTargetUnlocked&&!Camp.isTargetUnlocked(App.profile,t)){
      toast('🔒 Finish the mission before this one to unlock it!');return;
    }
    this.suspend();this.target=t;this.profile=App.profile;this.active=true;
    const saved=(this.profile.activeMissions||{})[targetId];
    const resume=saved&&saved.version===this.VERSION&&Array.isArray(saved.steps)&&
      Number.isInteger(saved.idx)&&saved.idx>=0&&saved.idx<saved.steps.length&&
      saved.steps.every(s=>s&&['demo','demo2','controls','guided','independent','adventure','adventure-problem','done'].includes(s.type)&&
        (!['guided','independent','adventure-problem'].includes(s.type)||(s.problem&&window.FAMILIES[s.problem.fid]&&MathCheck.valid(s.problem))))&&
      saved.steps[saved.idx].type!=='done';
    if(resume){this.steps=saved.steps;this.idx=saved.idx;this.firstTry=saved.firstTry===true;this.visitId=saved.visitId;}
    else{
      this.idx=0;this.firstTry=true;this.visitId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      this.steps=[{type:'demo'}];
      if(t.demo2)this.steps.push({type:'demo2'});
      this.steps.push({type:'controls'});
      for(let i=0;i<2;i++)this.steps.push({type:'guided',problem:this.freshProblem(t,[t.guidedFamilies[i%t.guidedFamilies.length]])});
      for(let i=0;i<4;i++)this.steps.push({type:'independent',problem:this.freshProblem(t,[t.families[i%t.families.length]])});
      this.steps.push({type:'adventure'},{type:'done'});
    }
    App.show('screen-mission');mascotSay(true);this.checkpoint();this.render();
  },
  checkpoint(){
    if(!this.active||!this.profile||!this.target)return;
    this.profile.activeMissions=this.profile.activeMissions||{};
    this.profile.activeMissions[this.target.id]={version:this.VERSION,visitId:this.visitId,idx:this.idx,firstTry:this.firstTry,steps:this.steps};
    Store.persist();
  },
  suspend(){this.checkpoint();this.active=false;document.onkeydown=null;Audio2.stopNarration();},
  freshProblem(t,familyIds){
    const p=this.profile||App.profile;
    for(let tries=0;tries<100;tries++){
      const fid=R.choice(familyIds),inst=window.FAMILIES[fid].gen();
      if(!MathCheck.valid(inst))throw new Error('Invalid generated problem: '+fid);
      const seen=p.seen[fid]||[];
      const inMission=this.steps.some(s=>s.problem&&s.problem.fid===fid&&s.problem.key===inst.key);
      if(!seen.includes(inst.key)&&!inMission)return Object.assign({fid},inst);
    }
    // Finite fact pools eventually repeat; review is intentional, not infinite novelty.
    const fid=R.choice(familyIds);p.seen[fid]=[];
    const inst=window.FAMILIES[fid].gen();return Object.assign({fid},inst);
  },
  allowedAdventureFamilies(){
    return this.target.adventureFamilies.filter(fid=>{
      const owner=window.FAMILIES[fid].owner;
      return !owner||owner===this.target.id||Boolean(this.profile.targets[owner]&&this.profile.targets[owner].done);
    });
  },
  markSeen(pr){
    const a=this.profile.seen[pr.fid]||(this.profile.seen[pr.fid]=[]);
    if(!a.includes(pr.key))a.push(pr.key);
  },
  render(){
    if(!this.active)return;
    const body=document.getElementById('mission-body');body.innerHTML='';
    const dots=document.getElementById('mission-progress');dots.innerHTML='';
    this.steps.forEach((s,i)=>dots.appendChild(el('span','pdot'+(i<this.idx?' done':i===this.idx?' now':''))));
    dots.setAttribute('aria-label','Step '+(this.idx+1)+' of '+this.steps.length);
    const phases={demo:'Learn',demo2:'Learn',controls:'How to play',guided:'Practice together',independent:'Your turn',adventure:'Adventure', 'adventure-problem':'Adventure',done:'Complete'};
    const phase=document.getElementById('mission-phase');
    if(phase)phase.textContent=phases[this.steps[this.idx].type];
    body.setAttribute('data-phase',this.steps[this.idx].type);
    document.onkeydown=null;Audio2.stopNarration();
    const step=this.steps[this.idx];
    if(step.type==='demo')this.renderDemo(body,false);
    else if(step.type==='demo2')this.renderDemo(body,true);
    else if(step.type==='controls')this.renderControls(body);
    else if(step.type==='adventure')this.renderAdventureGate(body);
    else if(step.type==='done')this.renderDone(body);
    else this.renderProblem(body,step);
  },
  next(){
    if(!this.active)return;
    const s=this.steps[this.idx];
    if(['guided','independent','adventure-problem'].includes(s.type)&&!s.solved)return;
    if(this.idx>=this.steps.length-1)return;
    this.idx++;this.firstTry=true;this.checkpoint();this.render();
  },
  renderDemo(body,second){
    const t=this.target,d2=second&&t.demo2?t.demo2:null;
    const caption=d2?d2.caption:t.demoCaption,audio=d2?d2.audio:t.audio;
    body.appendChild(el('h2',null,(d2?'🔍 Another example: ':'🔍 Demonstration: ')+esc(t.title)));
    const vis=el('div','demo-visual');body.appendChild(vis);this.demoVisual(vis,{demoVisual:d2?d2.visual:t.demoVisual});
    body.appendChild(el('div','caption-box',esc(caption)));
    if(!d2&&t.teachingNote){
      const note=el('details','strategy-note','<summary>More ways to think about it</summary><p>'+esc(t.teachingNote)+'</p>');
      body.appendChild(note);
    }
    const row=el('div','row'),play=el('button','mid-btn','🔊 Hear it'),next=el('button','big-btn','Next →');
    play.onclick=()=>Audio2.narrate(audio,caption);
    next.onclick=()=>{next.disabled=true;Audio2.click();this.next();};
    row.appendChild(play);row.appendChild(next);body.appendChild(row);Audio2.narrate(audio,caption);
  },
  renderControls(body){
    body.appendChild(el('h2',null,'🎮 How to play'));
    body.appendChild(el('div','caption-box',esc(this.target.controls)));
    const row=el('div','row'),play=el('button','mid-btn','🔊 Hear it'),next=el('button','big-btn','Got it — let’s go!');
    play.onclick=()=>Audio2.narrate(this.target.controlsAudio,this.target.controls);
    next.onclick=()=>{next.disabled=true;Audio2.click();this.next();};
    row.appendChild(play);row.appendChild(next);body.appendChild(row);
    Audio2.narrate(this.target.controlsAudio,this.target.controls);
  },
  renderAdventureGate(body){
    body.appendChild(el('h2',null,'⛰️ Adventure challenge'));
    body.appendChild(el('p','hint','Use the skills you have practiced. Optional — earn one bonus token the first time you finish this challenge.'));
    const row=el('div','row'),go=el('button','big-btn','Take the challenge'),skip=el('button','big-btn secondary','Skip for now');
    go.onclick=()=>{go.disabled=true;this.steps[this.idx]={type:'adventure-problem',problem:this.freshProblem(this.target,this.allowedAdventureFamilies())};this.checkpoint();this.render();};
    skip.onclick=()=>{skip.disabled=true;this.next();};
    row.appendChild(go);row.appendChild(skip);body.appendChild(row);
  },
  renderProblem(body,step){
    const pr=step.problem,label={guided:'Guided practice',independent:'Your turn','adventure-problem':'Adventure!'}[step.type];
    body.appendChild(el('h2',null,(step.type==='guided'?'🤝 ':'⭐ ')+label));
    const workspace=el('div','practice-workspace'),question=el('div','question-area'),answer=el('div','answer-area');
    if(step.type==='guided'&&pr.guide)question.appendChild(el('div','coach-note','<span class="eyebrow">Ranger tip</span><p>'+esc(pr.guide)+'</p>'));
    question.appendChild(el('div','problem',pr.html));
    if(pr.visual)this.problemVisual(question,pr);
    workspace.appendChild(question);workspace.appendChild(answer);body.appendChild(workspace);
    const fb=el('div','feedback');fb.setAttribute('aria-live','polite');
    if(pr.kind==='deal'||pr.kind==='grouping')this.renderDeal(answer,pr,fb,step);
    else if(pr.kind==='shade')this.renderShade(answer,pr,fb,step);
    else if(pr.choices)this.renderChoices(answer,pr,fb,step);
    else this.renderEntry(answer,pr,fb,step);
    body.appendChild(fb);
    if(step.solved)this.renderSolved(body,pr,fb,step);
    else if(step.mistakes){fb.className='feedback retry';fb.textContent='Let’s try again. '+this.hintText(pr,Math.max(0,step.mistakes-1));}
    else if(step.hintsUsed){fb.className='feedback retry';fb.textContent='💡 '+this.hintText(pr,step.hintsUsed-1);}
    const row=el('div','row'),hear=el('button','hint-btn','🔊 Read aloud'),hint=el('button','hint-btn','💡 Hint');
    hear.onclick=()=>Audio2.speak(pr.speak||pr.html.replace(/<[^>]+>/g,' '));
    hint.disabled=Boolean(step.solved);
    hint.onclick=()=>{this.firstTry=false;step.assisted=true;step.hintsUsed=(step.hintsUsed||0)+1;this.checkpoint();Audio2.click();fb.className='feedback retry';fb.textContent='💡 '+this.hintText(pr,step.hintsUsed-1);};
    row.appendChild(hear);row.appendChild(hint);body.appendChild(row);
  },
  hintText(pr,index){const hints=pr.hints||[pr.hint];return hints[Math.min(index,hints.length-1)];},
  renderChoices(body,pr,fb,step){
    const wrap=el('div','choices');step.choiceOrder=step.choiceOrder||R.shuffle(pr.choices);
    step.choiceOrder.forEach(ch=>{
      const b=el('button','choice-btn',esc(ch));b.disabled=Boolean(step.solved||(step.wrongChoices||[]).includes(String(ch)));
      if(step.solved&&String(ch)===String(pr.answer))b.classList.add('correct');
      b.onclick=()=>this.answer(b,String(ch)===String(pr.answer),pr,fb,step,wrap);wrap.appendChild(b);
    });body.appendChild(wrap);
  },
  renderEntry(body,pr,fb,step){
    const money=!!pr.moneyEntry;
    const row=el('div','entry-row'),disp=el('input',null);
    disp.id='entry-display';disp.type='text';disp.inputMode='numeric';disp.maxLength=money?7:4;disp.autocomplete='off';
    disp.setAttribute('aria-label','Your answer'+(pr.answerUnit?' in '+pr.answerUnit:''));
    const show=()=>{ disp.value=money?(step.entry?fmtMoney(Number(step.entry)):''):(step.entry||''); };
    show();disp.disabled=Boolean(step.solved);
    disp.oninput=()=>{ const raw=disp.value.replace(/\D/g,'').slice(0,4); step.entry=raw; show(); this.checkpoint(); };
    row.appendChild(disp);
    const check=el('button','big-btn','Check');check.disabled=Boolean(step.solved);
    check.onclick=()=>{
      const raw=money?(step.entry||''):disp.value;
      if(!raw.trim()){fb.textContent='Enter a number first.';return;}
      this.answer(check,Number(raw)===Number(pr.answer),pr,fb,step,null,disp);
    };
    row.appendChild(check);body.appendChild(row);
    const pad=el('div','numpad'),write=(value)=>{if(step.solved)return;step.entry=String(value).replace(/\D/g,'').slice(0,4);show();this.checkpoint();};
    '1234567890'.split('').forEach(d=>{
      const k=el('button','numkey',d);k.disabled=Boolean(step.solved);
      k.onclick=()=>{Audio2.click();write((step.entry||'')+d);};pad.appendChild(k);
    });
    const back=el('button','numkey','⌫');back.setAttribute('aria-label','Delete last digit');back.disabled=Boolean(step.solved);
    back.onclick=()=>write((step.entry||'').slice(0,-1));pad.appendChild(back);body.appendChild(pad);
    if(money)body.appendChild(el('p','answer-unit','Type the amount in cents — watch it become dollars and cents.'));
    else if(pr.answerUnit)body.appendChild(el('p','answer-unit',esc(pr.answerUnit)));
    if(!step.solved)document.onkeydown=e=>{
      if(!this.active||document.getElementById('screen-mission').classList.contains('hidden'))return;
      if(e.key==='Enter'){e.preventDefault();check.onclick();}
      else if(e.target!==disp&&/^[0-9]$/.test(e.key)){e.preventDefault();write((step.entry||'')+e.key);}
      else if(e.target!==disp&&e.key==='Backspace'){e.preventDefault();write((step.entry||'').slice(0,-1));}
    };
  },
  renderShade(body,pr,fb,step){
    if(!Array.isArray(step.shade)||step.shade.length!==pr.parts)step.shade=Array(pr.parts).fill(false);
    const bar=el('div','frac-shade-bar');
    bar.setAttribute('role','group');bar.setAttribute('aria-label','Tap parts to shade '+pr.shadeTarget+' of '+pr.parts+' equal parts');
    step.shade.forEach((on,i)=>{
      const seg=el('button','frac-seg'+(on?' on':''),on?'■':'□');
      seg.disabled=Boolean(step.solved);
      seg.setAttribute('aria-label','Part '+(i+1)+' of '+pr.parts+(on?', shaded':', not shaded'));
      seg.setAttribute('aria-pressed',String(on));
      seg.onclick=()=>{ if(step.solved)return; step.shade[i]=!step.shade[i]; Audio2.pop(); this.checkpoint(); this.render(); };
      bar.appendChild(seg);
    });
    body.appendChild(bar);
    const count=step.shade.filter(Boolean).length;
    body.appendChild(el('p','hint',count+' of '+pr.parts+' parts shaded. Shade exactly '+pr.shadeTarget+'.'));
    const check=el('button','big-btn','Check my coloring');
    check.disabled=Boolean(step.solved);
    check.onclick=()=>this.answer(check,count===pr.shadeTarget,pr,fb,step);
    body.appendChild(check);
  },
  renderDeal(body,pr,fb,step){
    const sharing=pr.kind==='deal',divisor=pr.math.divisor;
    step.deal=step.deal||{left:pr.total,counts:sharing?Array(divisor).fill(0):[]};
    const deal=step.deal,btn=el('button','deal-pile',
      (sharing?'Deal one round':'Make one group of '+divisor)+'<br><small>'+deal.left+' counters left</small>');
    btn.disabled=deal.left===0||Boolean(step.solved);
    body.appendChild(btn);
    const bins=el('div','diagram-grid');this.drawGroups(bins,deal.counts);body.appendChild(bins);
    btn.onclick=()=>{
      if(!this.active||step.solved||deal.left===0)return;
      if(sharing)deal.counts=deal.counts.map(n=>n+1);else deal.counts.push(divisor);
      deal.left-=divisor;Audio2.pop();this.checkpoint();this.render();
    };
    if(deal.left===0){
      body.appendChild(el('p','hint',sharing?'All shared equally. How many counters in each group?':'All grouped. How many groups did you make?'));
      this.renderEntry(body,pr,fb,step);
    }
  },
  answer(btn,ok,pr,fb,step,wrap,disp){
    if(!this.active||this.profile!==App.profile||this.steps[this.idx]!==step||btn.disabled||step.solved)return;
    if(ok){
      step.solved=true;step.entry=String(pr.answer);step.independent=this.firstTry&&!step.assisted;
      this.markSeen(pr);
      if(step.type==='independent'||step.type==='adventure-problem'){
        const st=this.profile.targets[this.target.id]||(this.profile.targets[this.target.id]={attempts:[],done:false,badge:false});
        st.attempts.push(step.independent);st.attempts=st.attempts.slice(-20);
        st.evidence=st.evidence||[];st.evidence.push({correct:step.independent,visit:this.visitId,key:pr.fid+':'+pr.key});st.evidence=st.evidence.slice(-20);
        Camp.addReport(this.profile,{text:this.target.title+' — '+(step.type==='adventure-problem'?'adventure':'practice'),good:step.independent?1:0,total:1,assisted:Boolean(step.assisted)});
      }
      this.checkpoint();this.render();Audio2.good();confetti(24);
    }else{
      this.firstTry=false;step.mistakes=(step.mistakes||0)+1;
      if(wrap){step.wrongChoices=step.wrongChoices||[];step.wrongChoices.push(String(btn.textContent));btn.classList.add('wrong');btn.disabled=true;}
      if(disp){disp.value='';step.entry='';}
      fb.className='feedback retry';fb.textContent='Let’s try again. '+this.hintText(pr,step.mistakes-1);
      this.checkpoint();Audio2.bad();
    }
  },
  renderSolved(body,pr,fb){
    fb.className='feedback good';fb.textContent='🎉 Correct! '+(pr.answerText||pr.answer)+(pr.answerUnit?' '+pr.answerUnit:'');
    if(pr.explain)body.appendChild(el('div','explain','📖 '+esc(pr.explain)));
    const next=el('button','big-btn','Continue →');
    next.onclick=()=>{next.disabled=true;this.next();};body.appendChild(next);document.onkeydown=null;
  },
  renderDone(body){
    const t=this.target,p=this.profile,st=p.targets[t.id]||(p.targets[t.id]={attempts:[],done:false,badge:false});
    const oldStages={lodge:p.camp.lodge,field:p.camp.field,post:p.camp.post||0,grove:p.camp.grove||0};
    st.done=true;let newToken=false,newBadge=false,newBonus=false,newPractice=false;
    const doneStep=this.steps.find(s=>s.type==='done');
    if(!p.missionsDone[t.id]){p.missionsDone[t.id]=true;p.tokens++;newToken=true;}
    else if(doneStep&&!doneStep.rewardPaid&&this.steps.filter(s=>s.type==='guided'||s.type==='independent').length===6&&this.steps.filter(s=>s.type==='guided'||s.type==='independent').every(s=>s.solved)){
      p.tokens++;newPractice=true;
    }
    if(this.steps.some(s=>s.type==='adventure-problem'&&s.solved)&&!p.missionsDone[t.id+':adventure']){
      p.missionsDone[t.id+':adventure']=true;p.tokens++;newBonus=true;
    }
    if(doneStep)doneStep.rewardPaid=true;
    const recent=(st.evidence||[]).slice(-5);
    if(!st.badge&&recent.length===5&&recent.filter(e=>e.correct).length>=4&&new Set(recent.map(e=>e.visit)).size>=2){st.badge=true;newBadge=true;}
    delete p.activeMissions[t.id];Camp.refreshStages(p);Store.persist();App.syncTop();
    this.active=false;Audio2.stopNarration();document.onkeydown=null;
    body.appendChild(el('h2',null,'🏁 Mission complete!'));confetti(50);Audio2.good();
    let html='<p>You finished <strong>'+esc(t.title)+'</strong>.</p>';
    if(newPractice)html+='<p>Practice replay complete. You earned another camp token.</p>';
    if(newBonus)html+='<p>First Adventure challenge complete. Bonus token earned!</p>';
    if(newBadge)html+='<p>🏅 Badge earned for independent practice across two visits.</p>';
    const critter=(typeof CRITTERS!=='undefined')?CRITTERS[t.id]:null;
    if(newToken&&critter)html+='<p>'+critter[0]+' <strong>'+esc(critter[1])+'</strong> moved into your camp! Meet all of your friends in the Field Guide on the camp map.</p>';
    body.appendChild(el('div','caption-box',html));
    const part={ch8:'lodge',ch9:'field',ch10:'post',ch11:'grove'}[t.chapter]||'lodge';
    const restored=p.camp[part]>oldStages[part]?({lodge:'Your lodge has a new look!',field:'Your meadow is looking greener!',post:'Your Trading Post is growing!',grove:'Your Picnic Grove is blooming!'})[part]+' Finish more skills to restore your camp.':null;
    Yard.reward(body,p,Number(newToken)+Number(newPractice)+Number(newBonus),restored);
    const row=el('div','row'),again=el('button','mid-btn','🔁 Play again'),hub=el('button','big-btn','Back to camp 🗺️');
    again.onclick=()=>this.start(t.id);hub.onclick=()=>{App.show('screen-hub');Camp.renderHub(p);};
    row.appendChild(again);row.appendChild(hub);body.appendChild(row);
  },
  drawGroups(box,counts,labels){
    counts.forEach((count,i)=>{
      const group=el('div','math-group'),items=el('div','counter-grid');
      group.setAttribute('aria-label','Group '+(i+1)+': '+count+' counters');
      for(let n=0;n<count;n++){const dot=el('span','math-dot');dot.setAttribute('aria-hidden','true');items.appendChild(dot);}
      group.appendChild(items);group.appendChild(el('div','group-label',esc(labels?labels[i]:'Group '+(i+1))));box.appendChild(group);
    });
  },
  line(box,values,changes){
    const min=Math.min(...values),max=Math.max(...values),x=v=>50+(v-min)/(max-min||1)*420;
    let svg='<svg class="math-line" viewBox="0 0 520 130" role="img" aria-label="'+esc(values.join(', then '))+'"><path d="M30 90 H490" stroke="#2e7d4f" stroke-width="3"/>';
    [...new Set(values)].forEach(v=>{const px=x(v);svg+='<path d="M'+px+' 82 V98" stroke="#2e7d4f" stroke-width="2"/><text x="'+px+'" y="120" text-anchor="middle">'+v+'</text>';});
    for(let i=1;i<values.length;i++){const a=x(values[i-1]),b=x(values[i]),mid=(a+b)/2,dir=b>a?1:-1;svg+='<path d="M'+a+' 80 Q'+mid+' 8 '+b+' 80" fill="none" stroke="#2f7fd0" stroke-width="3"/><path d="M'+(b-dir*10)+' 69 L'+b+' 80 L'+(b+dir*3)+' 66" fill="none" stroke="#2f7fd0" stroke-width="3"/><text x="'+mid+'" y="34" text-anchor="middle">'+changes[i-1]+'</text>';}
    box.appendChild(el('div','line-wrap',svg+'</svg>'));
  },
  demoVisual(box,t){
    const v=t.demoVisual||{};
    const eq=text=>box.appendChild(el('div','math-equation',esc(text)));
    if(v.kind==='bridge'||v.kind==='shift'){
      const move=v.kind==='bridge'?10-v.a%10:v.move,land=v.a+move,rest=v.b-move;
      this.line(box,[v.a,land,v.a+v.b],['+'+move,'+'+rest]);
      eq('Split '+v.b+' into '+move+' and '+rest+'.');eq(v.a+' + '+v.b+' = '+land+' + '+rest+' = '+(v.a+v.b));
    }else if(v.kind==='comp'){
      const extra=100-v.k,first=v.op==='-'?v.a-100:v.a+100,result=v.op==='-'?v.a-v.k:v.a+v.k,correction=v.op==='-'?'+':'−';
      eq(v.a+' '+v.op+' '+v.k);
      eq('1. '+v.a+' '+v.op+' 100 = '+first);
      eq('2. '+first+' '+correction+' '+extra+' = '+result);
      box.appendChild(el('p','hint',v.op==='-'?'100 removes too much. Put back '+extra+'.':'100 adds too much. Remove the extra '+extra+'.'));
    }else if(v.kind==='hundred'){
      const bond=el('div','number-bond','<div class="bond-whole">100</div><svg class="bond-links" viewBox="0 0 240 44" aria-hidden="true"><path d="M120 0 L44 44 M120 0 L196 44" fill="none" stroke="#256853" stroke-width="3"/></svg><div class="bond-parts"><span>'+v.a+'</span><span>'+(100-v.a)+'</span></div>');
      bond.setAttribute('aria-label','The whole is 100. The parts are '+v.a+' and '+(100-v.a)+'.');
      box.appendChild(bond);eq(v.a+' + '+(100-v.a)+' = 100');
    }else if(v.kind==='subtraction'){
      v.examples.forEach(e=>{
        const panel=el('div','math-panel'),move=e.a%e.unit,land=e.a-move,rest=e.b-move;
        panel.appendChild(el('h3',null,e.a+' − '+e.b));this.line(panel,[e.a,land,e.a-e.b],['−'+move,'−'+rest]);
        panel.appendChild(el('div','math-equation',e.a+' − '+move+' = '+land+'. '+land+' − '+rest+' = '+(e.a-e.b)+'.'));box.appendChild(panel);
      });
    }else if(v.kind==='groups'){
      const grid=el('div','diagram-grid');this.drawGroups(grid,Array(v.groups).fill(v.per),Array(v.groups).fill(v.per+' in each'));box.appendChild(grid);eq(v.groups+' groups of '+v.per+': '+v.groups+' × '+v.per+' = '+v.groups*v.per);
    }else if(v.kind==='fact'){
      const array=el('div','math-array');array.style.gridTemplateColumns='repeat('+v.per+', 24px)';
      for(let r=0;r<v.groups;r++)for(let c=0;c<v.per;c++)array.appendChild(el('span','math-dot'+(r>=v.base?' extra-group':'')));
      array.setAttribute('aria-label',v.groups+' rows of '+v.per+', or '+v.per+' columns of '+v.groups);box.appendChild(array);
      box.appendChild(el('div','array-legend','<span class="known-rows">'+v.base+' known groups</span><span class="new-rows">'+(v.groups-v.base)+' more group</span>'));
      eq(v.base+' × '+v.per+' = '+v.base*v.per);eq(v.base*v.per+' + '+(v.groups-v.base)*v.per+' = '+v.groups*v.per);
      eq(v.groups+' × '+v.per+' = '+v.per+' × '+v.groups+' = '+v.groups*v.per);
    }else if(v.kind==='division'){
      const quotient=v.total/v.divisor,compare=el('div','division-compare');
      for(const sharing of [true,false]){
        const panel=el('div','math-panel'),grid=el('div','diagram-grid'),count=sharing?v.divisor:quotient,per=sharing?quotient:v.divisor;
        panel.appendChild(el('h3',null,sharing?'Sharing '+v.total:'Grouping the same '+v.total));
        panel.appendChild(el('p','hint',sharing?'Make '+v.divisor+' equal groups.':'Put '+v.divisor+' in every group.'));
        this.drawGroups(grid,Array(count).fill(per));panel.appendChild(grid);
        panel.appendChild(el('div','math-equation',quotient+(sharing?' counters per group':' groups')));compare.appendChild(panel);
      }
      box.appendChild(compare);eq(v.total+' ÷ '+v.divisor+' = '+quotient);eq('Check: '+v.divisor+' × '+quotient+' = '+v.total);
    }else if(v.kind==='money'){
      const wrap=el('div','demo-visual-inner');wrap.innerHTML=moneyHTML(v.coins);box.appendChild(wrap);
      eq('Count on from the biggest: '+(v.countBy||'')+' = '+fmtMoney(v.total));
    }else if(v.kind==='fraction'){
      const wrap=el('div','demo-visual-inner');wrap.innerHTML=fractionSVG(v);box.appendChild(wrap);
      eq(v.shaded+' of '+v.parts+' equal parts are shaded: '+v.shaded+'/'+v.parts);
      if(v.note)box.appendChild(el('p','hint',v.note));
    }else if(v.kind==='fraction-compare'){
      const compare=el('div','division-compare');
      for(const side of [v.a,v.b]){
        const panel=el('div','math-panel');panel.innerHTML=fractionSVG(side);
        panel.appendChild(el('div','math-equation',side.shaded+'/'+side.parts));compare.appendChild(panel);
      }
      box.appendChild(compare);
      if(v.note)box.appendChild(el('p','hint',v.note));
    }else if(v.kind==='steps'){
      (v.lines||[]).forEach(line=>eq(line));
      if(v.note)box.appendChild(el('p','hint',v.note));
    }else if(v.kind==='money-compare'){
      const compare=el('div','division-compare');
      for(const side of [v.a,v.b]){
        const panel=el('div','math-panel');panel.innerHTML=moneyHTML(side.coins);
        panel.appendChild(el('div','math-equation',fmtMoney(side.total)));compare.appendChild(panel);
      }
      box.appendChild(compare);
      if(v.note)box.appendChild(el('p','hint',v.note));
    }
  },
  problemVisual(body,pr){
    const v=pr.visual,box=el('div','demo-visual');
    if(v.type==='groups'){
      const grid=el('div','diagram-grid');
      this.drawGroups(grid,Array(v.groups).fill(v.per));box.appendChild(grid);body.appendChild(box);
    }else if(v.type==='money'){
      box.innerHTML=moneyHTML(v.coins);body.appendChild(box);
    }else if(v.type==='fraction'){
      box.innerHTML=fractionSVG(v);body.appendChild(box);
    }
  }
};

/* Exact money and fraction renderings shared by demos and problems. */
function moneyHTML(coins){
  const coinStyle={1:['coin penny','1¢'],5:['coin nickel','5¢'],10:['coin dime','10¢'],25:['coin quarter','25¢']};
  let html='<div class="money-row" role="img" aria-label="Money: '+coins.map(c=>c>=100?fmtMoney(c):c+' cents').join(', ')+'">';
  for(const c of coins){
    if(c>=100)html+='<span class="bill">'+fmtMoney(c)+'</span>';
    else{const s=coinStyle[c]||['coin',''+c+'¢'];html+='<span class="'+s[0]+'">'+s[1]+'</span>';}
  }
  return html+'</div>';
}
function fractionSVG(v){
  const parts=v.parts,shaded=v.shaded||0,label=shaded+' of '+parts+' equal parts shaded';
  if(v.shape==='bar'){
    let cells='';
    for(let i=0;i<parts;i++)cells+='<rect x="'+(i*44)+'" y="6" width="42" height="52" rx="4" fill="'+(i<shaded?'#e8873a':'#ffffff')+'" stroke="#35563e" stroke-width="2.5"/>';
    return '<svg class="frac-svg" viewBox="0 0 '+(parts*44)+' 64" role="img" aria-label="'+label+'">'+cells+'</svg>';
  }
  const cx=70,cy=70,r=62;let slices='';
  const weights=v.weights||Array(parts).fill(1),wTotal=weights.reduce((s,w)=>s+w,0);
  let acc=0;
  for(let i=0;i<parts;i++){
    const a0=(acc/wTotal)*Math.PI*2-Math.PI/2;acc+=weights[i];const a1=(acc/wTotal)*Math.PI*2-Math.PI/2;
    const x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
    const large=parts===1?1:0;
    const d=parts===1
      ? 'M '+cx+' '+cy+' m -'+r+' 0 a '+r+' '+r+' 0 1 0 '+(2*r)+' 0 a '+r+' '+r+' 0 1 0 -'+(2*r)+' 0'
      : 'M '+cx+' '+cy+' L '+x0.toFixed(1)+' '+y0.toFixed(1)+' A '+r+' '+r+' 0 '+large+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+' Z';
    slices+='<path d="'+d+'" fill="'+(i<shaded?'#e8873a':'#ffffff')+'" stroke="#35563e" stroke-width="2.5"/>';
  }
  return '<svg class="frac-svg" viewBox="0 0 140 140" role="img" aria-label="'+label+'">'+slices+'</svg>';
}
