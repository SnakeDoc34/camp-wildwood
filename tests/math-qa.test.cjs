const test=require('node:test'),assert=require('node:assert/strict');
const {load,button,solve}=require('./helpers.cjs');

function displayedAnswer(fid,p){
  const n=p.html.match(/\d+/g).map(Number);
  if(fid==='ch8-equiv-add-ones'||fid==='ch8-equiv-add-tens')return n[0]+n[1]-n[2];
  if(fid==='ch8-make100')return n[1]-n[0];
  if(fid.startsWith('ch8-add'))return n[0]+n[1];
  if(fid.startsWith('ch8-sub'))return n[0]-n[1];
  if(fid.includes('-groups')||fid.includes('-mult'))return n[0]*n[1];
  if(fid.includes('-div'))return n[0]/n[1];
  if(fid.startsWith('ch9-near'))return n[2]*n[3]-n[0]*n[1];
  throw new Error('No independent oracle for '+fid);
}
function arithmetic(text){
  const terms=text.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s/g,'').split(/(?=[+-])/);
  return terms.reduce((sum,term)=>{
    const values=term.match(/[+-]?\d+|[*/]/g);let n=Number(values[0]);
    for(let i=1;i<values.length;i+=2)n=values[i]==='*'?n*Number(values[i+1]):n/Number(values[i+1]);
    return sum+n;
  },0);
}
function verifyEquations(text){
  text=text.replace(/-/g,'−');
  const eq=/(?:\d+|\?)(?:\s*[+−×÷]\s*(?:\d+|\?))*(?:\s*=\s*(?:\d+|\?)(?:\s*[+−×÷]\s*(?:\d+|\?))*)+/g;
  for(const m of text.matchAll(eq)){
    if(m[0].includes('?'))continue;
    const values=m[0].split('=').map(arithmetic);assert.ok(values.every(v=>v===values[0]),'False equation: '+m[0]);
  }
}

test('120000 generated answers, choices, and explanation equations agree with displayed questions',()=>{
  const a=load();let count=0;
  // Chapters 8-9 families: integer answers parsed from the displayed question.
  // Chapter 10-11 families have their own oracle in tests/m2.test.cjs.
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch8-')||fid.startsWith('ch9-')))for(let i=0;i<5000;i++){
    const p=f.gen(),expected=displayedAnswer(fid,p);count++;
    assert.equal(Number(p.answer),expected,fid);assert.ok(Number.isInteger(expected)&&expected>=0&&expected<=1000);
    assert.ok(a.MathCheck.valid(p),fid);if(p.choices){assert.equal(p.choices.length,4);assert.ok(p.choices.every(x=>Number(x)>=0));}
    verifyEquations(p.explain);verifyEquations(p.guide||'');
    if(fid==='ch8-equiv-add-tens'){assert.equal(Number(p.answer)%100,0);assert.equal(p.math.known%10,0);}
  }
  assert.equal(count,120000);
});
test('boundary random values preserve valid whole-number operations',()=>{
  const a=load();for(const f of [()=>0,()=>.999999999]){
    a.R.rand=f;for(const[fid,fam]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch8-')||fid.startsWith('ch9-'))){const p=fam.gen();assert.equal(Number(p.answer),displayedAnswer(fid,p));assert.ok(a.MathCheck.valid(p),fid);}
  }
});
test('adding ones uses varied bridges, not an always-add-one rule',()=>{
  const a=load(),moves=new Set();for(let i=0;i<2000;i++){const p=a.FAMILIES['ch8-equiv-add-ones'].gen();moves.add(p.math.known-p.math.a);}
  assert.equal(moves.size,8);
});
test('known-fact strategies are correct for all threes and fours',()=>{
  const a=load();for(const size of [3,4])for(let n=1;n<=10;n++){const f=a.knownFact(n,size);verifyEquations(f.explain);assert.ok(!/skip.count/i.test(f.hint));}
});
test('division coaching uses a missing fact with the correct group meaning',()=>{
  const a=load();
  for(const d of [3,4])for(const suffix of ['a','b','-deal','-group'])for(let i=0;i<100;i++){
    const p=a.FAMILIES['ch9-div'+d+suffix].gen(),sharing=p.math.meaning==='sharing';
    assert.match(p.hints[1],/related multiplication fact/);
    assert.ok(p.hints[1].includes(sharing?d+' × ? = '+p.total:'? × '+d+' = '+p.total));
    assert.ok(p.explain.includes(sharing?d+' × '+p.answer:p.answer+' × '+d));
    assert.equal(p.answerUnit,sharing?'counters per group':'groups');
  }
});
test('additional teaching notes contain valid exact calculations',()=>{
  const a=load();for(const t of a.TARGETS)verifyEquations(t.teachingNote||'');
  assert.match(a.TARGETS.find(t=>t.id==='ch8-subtracting').teachingNote,/subtract from 100/);
});
test('the last hint remains visible after re-render and pause',()=>{
  const a=load();a.Engine.start('ch9-divide-3');a.Engine.idx=4;a.Engine.render();
  const body=a.doc.getElementById('mission-body');
  button(body,'💡 Hint').onclick();button(body,'💡 Hint').onclick();
  const step=a.Engine.steps[4],expected=step.problem.hints[1];a.Engine.render();
  assert.ok(body.textContent.includes(expected));
  a.Engine.suspend();a.Engine.start('ch9-divide-3');
  assert.ok(body.textContent.includes(expected));assert.equal(a.Engine.firstTry,false);
});
test('division diagrams represent both meanings and the same total exactly',()=>{
  const a=load();for(const divisor of [3,4]){
    const box=a.doc.createElement('div'),t=a.TARGETS.find(t=>t.id==='ch9-divide-'+divisor);a.Engine.demoVisual(box,t);
    const panels=box.querySelectorAll('.math-panel');assert.equal(panels.length,2);
    assert.equal(panels[0].querySelectorAll('.math-group').length,divisor);assert.equal(panels[1].querySelectorAll('.math-group').length,24/divisor);
    for(const panel of panels)assert.equal(panel.querySelectorAll('.math-dot').length,24);
    assert.match(panels[0].textContent,/counters per group/);assert.match(panels[1].textContent,/groups/);
  }
});
test('every tutorial displays correct equations and exact counters',()=>{
  const a=load();for(const t of a.TARGETS){
    const box=a.doc.createElement('div');a.Engine.demoVisual(box,t);
    for(const equation of box.querySelectorAll('.math-equation'))verifyEquations(equation.textContent);
    assert.ok(box.textContent.length>0);
    if(['groups','fact'].includes(t.demoVisual.kind))assert.equal(box.querySelectorAll('.math-dot').length,t.demoVisual.groups*t.demoVisual.per);
  }
});
test('guided sharing and grouping expose a usable answer keypad',()=>{
  for(const divisor of [3,4]){
    const a=load();a.Engine.start('ch9-divide-'+divisor);while(!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();
    for(let i=0;i<2;i++){
      const step=a.Engine.steps[a.Engine.idx],pr=step.problem;
      while(step.deal.left>0){const pile=a.doc.getElementById('mission-body').querySelector('.deal-pile');pile.onclick();}
      assert.equal(step.deal.counts.reduce((x,y)=>x+y,0),pr.total);
      assert.equal(step.deal.counts.length,i===0?divisor:Number(pr.answer));
      const body=a.doc.getElementById('mission-body');assert.equal(body.querySelectorAll('.numkey').length,11);
      for(const digit of '0'+pr.answer)button(body,digit).onclick();button(body,'Check').onclick();
      assert.ok(step.solved);button(a.doc.getElementById('mission-body'),'Continue →').onclick();
    }
  }
});
test('a hint-assisted answer never counts as independent evidence',()=>{
  const a=load();a.Engine.start('ch8-adding-ones');a.Engine.idx=4;a.Engine.render();
  button(a.doc.getElementById('mission-body'),'💡 Hint').onclick();const s=a.Engine.steps[4];solve(a,s);
  assert.equal(a.profile.targets['ch8-adding-ones'].attempts[0],false);assert.equal(a.profile.report[0].good,0);
});
test('correct answers wait for Continue and cannot record twice',()=>{
  const a=load();a.Engine.start('ch8-adding-ones');a.Engine.idx=4;a.Engine.render();const s=a.Engine.steps[4];solve(a,s);solve(a,s);
  assert.equal(a.Engine.idx,4);assert.equal(a.profile.report.length,1);
  const next=button(a.doc.getElementById('mission-body'),'Continue →');next.onclick();next.onclick();assert.equal(a.Engine.idx,5);
});
test('badges require five recent trials and two visits',()=>{
  const a=load();a.Engine.start('ch8-adding-ones');
  for(let i=4;i<8;i++){a.Engine.idx=i;a.Engine.firstTry=true;solve(a,a.Engine.steps[i]);}
  a.Engine.idx=9;a.Engine.renderDone(a.doc.getElementById('mission-body'));
  assert.equal(a.profile.targets['ch8-adding-ones'].badge,false);
  a.Engine.start('ch8-adding-ones');a.Engine.idx=4;solve(a,a.Engine.steps[4]);a.Engine.renderDone(a.doc.getElementById('mission-body'));
  assert.equal(a.profile.targets['ch8-adding-ones'].badge,true);
});
test('challenge pools do not introduce an uncompleted different skill',()=>{
  const a=load();for(const t of a.TARGETS){a.Engine.start(t.id);for(const fid of a.Engine.allowedAdventureFamilies())assert.equal(a.FAMILIES[fid].owner,t.id);}
  a.profile.targets['ch9-divide-3']={done:true};a.Engine.start('ch9-divide-4');assert.ok(a.Engine.allowedAdventureFamilies().includes('ch9-div3a'));
});
test('each mission completes and pays both rewards exactly once',()=>{
  const a=load();for(const t of a.TARGETS){
    a.Engine.start(t.id);while(!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();
    for(let i=0;i<6;i++){const s=a.Engine.steps[a.Engine.idx];solve(a,s);a.Engine.next();}
    button(a.doc.getElementById('mission-body'),'Take the challenge').onclick();solve(a,a.Engine.steps[a.Engine.idx]);a.Engine.next();
    assert.ok(a.profile.targets[t.id].done);assert.equal(a.profile.missionsDone[t.id+':adventure'],true);
  }
  assert.equal(a.profile.tokens,a.TARGETS.length*2);a.Engine.renderDone(a.doc.getElementById('mission-body'));assert.equal(a.profile.tokens,a.TARGETS.length*2);
});
test('a refresh resumes the same question, entered digits, and hint state',()=>{
  const a=load();a.Engine.start('ch8-adding-98');while(!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();
  const at=a.Engine.idx,step=a.Engine.steps[at];button(a.doc.getElementById('mission-body'),'1').onclick();button(a.doc.getElementById('mission-body'),'💡 Hint').onclick();a.Engine.suspend();
  const saved=Object.fromEntries(a.data),b=load(saved);b.App.profile=b.Store.profile(a.profile.id);b.Engine.start('ch8-adding-98');
  assert.equal(b.Engine.idx,at);assert.equal(b.Engine.steps[at].problem.key,step.problem.key);assert.equal(b.doc.getElementById('entry-display').value,'1');assert.equal(b.Engine.firstTry,false);
});
test('multiple profiles and multiple paused skills retain separate progress',()=>{
  const a=load();a.profile.tokens=8;a.profile.shop=['flag-red'];a.Engine.start('ch8-adding-ones');a.Engine.next();
  a.Engine.start('ch9-groups-3');assert.ok(a.profile.activeMissions['ch8-adding-ones']);assert.ok(a.profile.activeMissions['ch9-groups-3']);
  const other=a.newProfileState('Other','🦊');a.Store.saveProfile(other);a.App.show('screen-profiles');a.App.profile=other;a.Engine.start('ch8-adding-ones');
  assert.equal(other.tokens,0);assert.equal(a.profile.tokens,8);assert.equal(a.profile.shop.length,1);assert.equal(a.doc.onkeydown,null);
});
test('legacy progress survives normalization and backup recovery',()=>{
  const legacy={profiles:{old:{id:'old',name:'Old',avatar:'🦊',tokens:9,camp:{lodge:2,field:1},shop:['flowers'],targets:{'ch8-adding-ones':{badge:true,done:true,attempts:[true]}},seen:{},missionsDone:{'ch8-adding-ones':true},report:[]}}};
  for(const saved of [{'campWildwood.v1':JSON.stringify(legacy)},{'campWildwood.v1':'broken','campWildwood.v1.backup':JSON.stringify(legacy)}]){
    const a=load(saved),p=a.Store.profile('old');assert.equal(p.tokens,9);assert.equal(p.shop[0],'flowers');assert.ok(p.targets['ch8-adding-ones'].badge);assert.ok(p.activeMissions);
  }
});
test('recorded audio keys resolve; old narration cannot restart after navigation',()=>{
  const a=load();a.window.AUDIO_DATA['m1-m1-ch8-adding-ones.mp3']='data:audio/mpeg;base64,TEST';
  a.Audio2.narrate('audio/m1-ch8-adding-ones.mp3','old');const audio=a.audios[0],timer=[...a.timers.values()].find(x=>x.ms===9000);
  assert.equal(audio.src,'data:audio/mpeg;base64,TEST');a.Audio2.stopNarration();timer.f();audio.onerror();assert.equal(a.speech.length,0);
  a.Audio2.enabled=false;a.Audio2.speak('muted');assert.equal(a.speech.length,0);
  for(const id of ['ch8-adding-tens','ch8-subtracting','ch9-multiply-3','ch9-multiply-4','ch9-divide-3','ch9-divide-4'])assert.match(a.TARGETS.find(t=>t.id===id).audio,/^audio\/m2-.*\.mp3$/);
});
test('repeated purchase callbacks charge only once',()=>{
  const a=load();a.profile.tokens=12;a.Camp.renderShop(a.profile);
  const b=a.doc.getElementById('shop-list').children[0].querySelector('button'),event={stopPropagation(){}};b.onclick(event);b.onclick(event);
  assert.equal(a.profile.tokens,9);assert.equal(a.profile.shop.filter(x=>x==='flag-red').length,1);
});
test('the camp offers only playable trails and exposes no planned trails separately',()=>{
  const a=load();a.Camp.renderHub(a.profile);
  const playable=a.doc.getElementById('camp-map').children;
  assert.equal(playable.length,9);assert.ok(playable.every(e=>e.tagName==='BUTTON'));
  assert.equal(a.doc.getElementById('future-trails-list').children.length,0);
  assert.match(a.doc.getElementById('camp-completion').textContent,/0 of 37/);
  playable[1].onclick();
  const skills=a.doc.getElementById('target-list').children;
  assert.equal(skills.length,6);assert.ok(skills.every(e=>e.tagName==='BUTTON'));
  skills[0].onclick();assert.equal(a.Engine.target.id,'ch8-adding-ones');
});
test('switching campers through the header saves paused work to the original camper',()=>{
  const a=load();const other=a.newProfileState('Second','🦊');a.Store.saveProfile(other);
  a.App.init();a.App.profile=a.Store.profile(a.profile.id);a.Engine.start('ch8-adding-98');while(!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();const at=a.Engine.idx;
  button(a.doc.getElementById('mission-body'),'7').onclick();
  a.doc.getElementById('profile-chip').onclick();
  assert.equal(a.Engine.active,false);assert.equal(a.doc.onkeydown,null);
  assert.equal(a.App.profile.activeMissions['ch8-adding-98'].steps[at].entry,'7');
  const select=a.doc.getElementById('profile-list').children[1].querySelector('.profile-select');select.onclick();
  assert.equal(a.App.profile.id,other.id);assert.equal(a.App.profile.activeMissions['ch8-adding-98'],undefined);
});
test('practice layout separates the question from controls without hiding either division keypad',()=>{
  const a=load();a.Engine.start('ch8-adding-ones');a.Engine.next();a.Engine.next();
  const body=a.doc.getElementById('mission-body');assert.equal(body.querySelectorAll('.question-area').length,1);
  assert.equal(body.querySelectorAll('.answer-area').length,1);assert.equal(body.querySelector('.answer-area').querySelectorAll('.choice-btn').length,4);
  assert.equal(a.doc.getElementById('mission-phase').textContent,'Practice together');
});
