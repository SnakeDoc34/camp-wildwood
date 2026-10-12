/* Camp Wildwood — mission engine: demo → controls → guided → independent → adventure */
'use strict';

const Engine = {
  target:null, steps:[], idx:0, firstTry:true, sessionGood:0, sessionTotal:0,

  start(targetId){
    const t = window.TARGETS.find(x=>x.id===targetId);
    if(!t) return;
    this.target=t; this.idx=0; this.firstTry=true; this.sessionGood=0; this.sessionTotal=0;
    // build steps: demo, controls, 2 guided, 4 independent, 1 adventure, done
    this.steps=[{type:'demo'},{type:'controls'}];
    for(let i=0;i<2;i++) this.steps.push({type:'guided', problem:this.freshProblem(t, t.guidedFamilies)});
    for(let i=0;i<4;i++) this.steps.push({type:'independent', problem:this.freshProblem(t, t.families)});
    this.steps.push({type:'adventure'}); this.steps.push({type:'done'});
    App.show('screen-mission'); mascotSay(true);
    this.render();
  },

  /* ---- no-repeat bank ---- */
  freshProblem(t, familyIds){
    const p=App.profile;
    for(let tries=0; tries<40; tries++){
      const fid=R.choice(familyIds);
      const fam=window.FAMILIES[fid];
      const inst=fam.gen();
      const seen=p.seen[fid]||[];
      const inMission=this.steps.some(s=>s.problem&&s.problem.fid===fid&&s.problem.key===inst.key);
      if(!seen.includes(inst.key) && !inMission) return Object.assign({fid},inst);
    }
    // bank exhausted for this profile: reshuffle this family pool
    const fid=R.choice(familyIds); const fam=window.FAMILIES[fid];
    p.seen[fid]=[]; Store.persist();
    const inst=fam.gen(); return Object.assign({fid},inst);
  },
  markSeen(prob){ const p=App.profile; const k=prob.fid+':'+prob.key; const a=p.seen[prob.fid]||(p.seen[prob.fid]=[]); if(!a.includes(prob.key)) a.push(prob.key); },

  /* ---- rendering ---- */
  render(){
    const body=document.getElementById('mission-body'); body.innerHTML='';
    const dots=document.getElementById('mission-progress'); dots.innerHTML='';
    this.steps.forEach((s,i)=>{
      const d=el('span','pdot'+(i<this.idx?' done':i===this.idx?' now':''));
      dots.appendChild(d);
    });
    const step=this.steps[this.idx];
    Audio2.stopNarration();
    if(step.type==='demo') this.renderDemo(body);
    else if(step.type==='controls') this.renderControls(body);
    else if(step.type==='adventure') this.renderAdventureGate(body);
    else if(step.type==='done') this.renderDone(body);
    else this.renderProblem(body, step);
  },
  next(){ this.idx++; this.firstTry=true; this.render(); },

  renderDemo(body){
    const t=this.target;
    body.appendChild(el('h2',null,'🔍 Demonstration: '+esc(t.title)));
    const vis=el('div','demo-visual'); body.appendChild(vis);
    this.demoVisual(vis, t);
    const cap=el('div','caption-box', esc(t.demoCaption)); body.appendChild(cap);
    const row=el('div','row');
    const play=el('button','mid-btn','🔊 Hear it'); play.onclick=()=>Audio2.narrate(t.audio, t.demoCaption);
    const next=el('button','big-btn','Next →'); next.onclick=()=>{Audio2.click(); this.next();};
    row.appendChild(play); row.appendChild(next); body.appendChild(row);
    Audio2.narrate(t.audio, t.demoCaption);
  },
  renderControls(body){
    const t=this.target;
    body.appendChild(el('h2',null,'🎮 How to play'));
    body.appendChild(el('div','caption-box', esc(t.controls)));
    const row=el('div','row');
    const next=el('button','big-btn','Got it — let\u2019s go!'); next.onclick=()=>{Audio2.click(); this.next();};
    row.appendChild(next); body.appendChild(row);
    Audio2.speak(t.controls);
  },
  renderAdventureGate(body){
    body.appendChild(el('h2',null,'⛰️ Adventure challenge'));
    body.appendChild(el('p','hint','A trickier mission mixing what you know. Optional — but it earns a bonus token!'));
    const row=el('div','row');
    const go=el('button','big-btn','Take the challenge'); go.onclick=()=>{ this.steps[this.idx]={type:'adventure-problem', problem:this.freshProblem(this.target,this.target.adventureFamilies)}; this.render(); };
    const skip=el('button','big-btn secondary','Skip for now'); skip.onclick=()=>{ this.next(); };
    row.appendChild(go); row.appendChild(skip); body.appendChild(row);
  },
  renderProblem(body, step){
    const t=this.target, pr=step.problem;
    const label={guided:'Guided practice', independent:'Your turn', 'adventure-problem':'Adventure!'}[step.type];
    body.appendChild(el('h2',null, (step.type==='guided'?'🤝 ':'⭐ ')+label));
    if(step.type==='guided' && pr.guide) body.appendChild(el('div','explain','🧭 '+esc(pr.guide)));
    if(pr.visual) this.problemVisual(body, pr);
    body.appendChild(el('div','problem', pr.html));
    const fb=el('div','feedback'); 
    if(pr.kind==='deal'){ this.renderDeal(body, pr, fb, step); }
    else if(pr.choices){ this.renderChoices(body, pr, fb, step); }
    else { this.renderEntry(body, pr, fb, step); }
    body.appendChild(fb);
    const row=el('div','row');
    const hear=el('button','hint-btn','🔊 Read aloud'); hear.onclick=()=>Audio2.speak(pr.speak||pr.html.replace(/<[^>]+>/g,' '));
    const hint=el('button','hint-btn','💡 Hint'); hint.onclick=()=>{ Audio2.click(); fb.className='feedback retry'; fb.textContent='💡 '+pr.hint; };
    row.appendChild(hear); row.appendChild(hint); body.appendChild(row);
  },
  renderChoices(body, pr, fb, step){
    const wrap=el('div','choices');
    R.shuffle(pr.choices).forEach(ch=>{
      const b=el('button','choice-btn',esc(ch));
      b.onclick=()=>this.answer(b, String(ch)===String(pr.answer), pr, fb, step, wrap);
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  },
  renderEntry(body, pr, fb, step){
    const row=el('div','entry-row');
    const disp=el('div',null,''); disp.id='entry-display'; disp.textContent='';
    row.appendChild(disp);
    const check=el('button','big-btn','Check'); check.onclick=()=>{
      const v=disp.textContent.trim();
      if(!v) return;
      this.answer(check, v===String(pr.answer), pr, fb, step, null, disp);
    };
    row.appendChild(check); body.appendChild(row);
    const pad=el('div','numpad');
    '1234567890'.split('').forEach(d=>{
      const k=el('button','numkey',d);
      k.onclick=()=>{ Audio2.click(); if(disp.textContent.length<6) disp.textContent+=d; };
      pad.appendChild(k);
    });
    const back=el('button','numkey','⌫'); back.onclick=()=>{ disp.textContent=disp.textContent.slice(0,-1); };
    pad.appendChild(back); body.appendChild(pad);
    document.onkeydown=(e)=>{
      if(document.getElementById('screen-mission').classList.contains('hidden')) return;
      if(/^[0-9]$/.test(e.key)&&disp.textContent.length<6) disp.textContent+=e.key;
      else if(e.key==='Backspace') disp.textContent=disp.textContent.slice(0,-1);
      else if(e.key==='Enter') check.onclick();
    };
  },
  renderDeal(body, pr, fb, step){
    // tap-to-deal guided division: pile -> bins, then enter per-group count
    let left=pr.total; const perBin=new Array(pr.groups).fill(0);
    const pile=el('div','deal-pile','🍎'.repeat(Math.min(8,left))+'<br><small>Tap to deal one to each group ('+left+' left)</small>');
    const bins=el('div','demo-visual');
    const binEls=[];
    for(let g=0; g<pr.groups; g++){ const b=el('div','group-bin','<div class="items"></div><div>Group '+(g+1)+'</div>'); bins.appendChild(b); binEls.push(b); }
    body.appendChild(pile); body.appendChild(bins);
    pile.onclick=()=>{
      if(left<=0) return;
      Audio2.pop();
      for(let g=0; g<pr.groups && left>0; g++){ left--; perBin[g]++; binEls[g].querySelector('.items').textContent+='🍎'; }
      pile.innerHTML='🍎'.repeat(Math.min(8,left))+'<br><small>'+(left>0? 'Tap to deal ('+left+' left)' : 'All dealt!')+'</small>';
      if(left===0){
        pile.innerHTML='✅ All dealt!<br><small>How many in each group?</small>';
        const row=el('div','entry-row'); const disp=el('div',null,''); disp.id='entry-display';
        row.appendChild(disp);
        const check=el('button','big-btn','Check');
        check.onclick=()=>this.answer(check, disp.textContent.trim()===String(pr.answer), pr, fb, {type:'guided'}, null, disp);
        row.appendChild(check); body.appendChild(row);
      }
    };
  },
  answer(btn, ok, pr, fb, step, wrap, disp){
    const t=this.target, p=App.profile;
    if(btn.disabled) return;
    if(ok){
      Audio2.good(); confetti(24);
      fb.className='feedback good'; fb.textContent='🎉 '+R.choice(['Great work!','Exactly right!','You got it!','Super!']);
      if(wrap) wrap.querySelectorAll('button').forEach(b=>{ b.disabled=true; if(String(b.textContent)===String(pr.answer)) b.classList.add('correct'); });
      if(disp) disp.style.borderColor='var(--green-500)';
      if(pr.explain) setTimeout(()=>{ const e=el('div','explain','📖 '+pr.explain); fb.after(e); },350);
      this.markSeen(pr);
      // independence evidence: only first-try correct counts
      if(step.type==='independent'||step.type==='adventure-problem'){
        const st=p.targets[t.id]||(p.targets[t.id]={attempts:[],done:false,badge:false});
        st.attempts.push(this.firstTry); if(st.attempts.length>20) st.attempts.shift();
        this.sessionGood++; this.sessionTotal++;
        Camp.addReport(p,{text:t.title+' — '+(step.type==='adventure-problem'?'adventure':'practice'), good:this.firstTry?1:0, total:1});
      }
      document.onkeydown=null;
      setTimeout(()=>this.next(), 1400);
    }else{
      Audio2.bad(); this.firstTry=false;
      fb.className='feedback retry'; fb.textContent='❌ Not quite — '+pr.hint;
      if(wrap){ btn.classList.add('wrong'); btn.disabled=true; }
      if(disp){ disp.textContent=''; disp.style.borderColor='var(--red)'; setTimeout(()=>disp.style.borderColor='',900); }
    }
  },
  renderDone(body){
    const t=this.target, p=App.profile;
    const st=p.targets[t.id]||(p.targets[t.id]={attempts:[],done:false,badge:false});
    st.done=true;
    let newToken=false, newBadge=false;
    if(!p.missionsDone[t.id]){ p.missionsDone[t.id]=true; p.tokens++; newToken=true; }
    if(!st.badge && st.attempts.slice(-5).filter(Boolean).length>=4 && st.attempts.length>=4){ st.badge=true; newBadge=true; }
    Camp.refreshStages(p); Store.persist();
    body.appendChild(el('h2',null,'🏁 Mission complete!'));
    confetti(70); Audio2.good(); setTimeout(()=>Audio2.good(),400);
    let html='<p class="hint">You finished <strong>'+esc(t.title)+'</strong>.</p>';
    if(newToken) html+='<p>🪙 <strong>+1 camp token!</strong> Spend it in the Camp Shop.</p>';
    if(newBadge) html+='<p>🏅 <strong>Badge earned!</strong> You really know this skill.</p>';
    body.appendChild(el('div','caption-box',html));
    const row=el('div','row');
    const again=el('button','mid-btn','🔁 Play again'); again.onclick=()=>this.start(t.id);
    const hub=el('button','big-btn','Back to camp 🗺️'); hub.onclick=()=>{ App.showTargets(t.chapter); };
    row.appendChild(again); row.appendChild(hub); body.appendChild(row);
    mascotSay(true);
  },

  /* ---- demo + problem visuals ---- */
  demoVisual(box, t){
    const v=t.demoVisual||{};
    if(v.kind==='bridge'){
      box.innerHTML='<div style="font-size:2rem;font-weight:800">'+v.a+' + '+v.b+' = <span style="color:var(--blue)">'+(v.a+1)+'</span> + '+(v.b-1)+' = '+(v.a+v.b)+'</div><div class="hint">Make ten first: '+(v.a)+' needs 1 to reach '+(v.a+1)+'</div>';
    }else if(v.kind==='comp'){
      box.innerHTML='<div style="font-size:1.8rem;font-weight:800">'+v.a+' '+(v.op||'+')+' '+v.k+'<br>→ '+v.a+' '+(v.op||'+')+ ' 100 = '+(v.op==='-'? v.a-100 : v.a+100)+'<br>→ fix '+(v.fix)+' = <span style="color:var(--green-700)">'+v.result+'</span></div>';
    }else if(v.kind==='groups'){
      let h='<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">';
      for(let g=0;g<v.groups;g++) h+='<div class="group-bin"><div class="items">'+'🍎'.repeat(Math.min(6,v.per))+(v.per>6?'…':'')+'</div><div>'+v.per+' each</div></div>';
      box.innerHTML=h+'</div><div style="font-size:1.6rem;font-weight:800">'+v.groups+' × '+v.per+' = '+(v.groups*v.per)+'</div>';
    }else if(v.kind==='numberline'){
      box.innerHTML='<div style="font-size:1.8rem;font-weight:800">'+v.a+' − '+v.b+' = '+(v.a-v.b)+'</div><div class="hint">Jump back to friendly numbers first.</div>';
    }else if(v.kind==='shift'){
      box.innerHTML='<div style="font-size:1.8rem;font-weight:800">'+v.a+' + '+v.b+'<br>= '+(v.a+v.move)+' + '+(v.b-v.move)+' = <span style="color:var(--green-700)">'+(v.a+v.b)+'</span></div><div class="hint">Slide '+v.move+' over to make a friendly hundred.</div>';
    }else if(v.kind==='hundred'){
      box.innerHTML='<div style="font-size:2rem;font-weight:800">'+v.a+' + <span style="color:var(--blue)">'+(100-v.a)+'</span> = 100</div><div class="hint">Hundred-pairs are best friends!</div>';
    }else if(v.kind==='skip'){
      box.innerHTML='<div style="font-size:1.5rem;font-weight:800">'+v.seq.join(' → ')+' = <span style="color:var(--green-700)">'+v.result+'</span></div><div class="hint">'+esc(v.label||'')+' — skip-count to the answer.</div>';
    }else if(v.kind==='share'){
      let h='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">';
      for(let g=0;g<v.groups;g++) h+='<div class="group-bin"><div class="items">'+'🍎'.repeat(Math.min(6,v.per))+(v.per>6?'…':'')+'</div><div>'+v.per+' each</div></div>';
      box.innerHTML=h+'</div><div style="font-size:1.6rem;font-weight:800">'+v.total+' ÷ '+v.groups+' = <span style="color:var(--green-700)">'+v.per+'</span></div>';
    }else{
      box.innerHTML='<div style="font-size:3rem">🔍</div>';
    }
  },
  problemVisual(body, pr){
    const v=pr.visual; if(!v) return;
    const box=el('div','demo-visual');
    if(v.type==='groups'){
      let h='';
      for(let g=0;g<v.groups;g++) h+='<div class="group-bin"><div class="items">'+'🍎'.repeat(Math.min(8,v.per))+'</div><div>group</div></div>';
      box.innerHTML=h;
    }
    body.appendChild(box);
  }
};
