const test=require('node:test'),assert=require('node:assert/strict');
const {load,button,solve}=require('./helpers.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
function practice(a,id='ch8-adding-ones'){
  a.Engine.start(id);while(!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();return a.Engine.steps[a.Engine.idx];
}
test('place-value exchanges conserve every whole number from 0 through 1000',()=>{
  const a=load();
  for(let n=0;n<=1000;n++){
    const m=a.Backpack.base(n);assert.ok(a.Backpack.valid(m,n));
    while(m.h){assert.ok(a.Backpack.exchange(m,'h'));assert.ok(a.Backpack.valid(m,n));}
    while(m.t){assert.ok(a.Backpack.exchange(m,'t'));assert.ok(a.Backpack.valid(m,n));}
    assert.equal(m.o,n);assert.equal(a.Backpack.exchange(m,'t'),false);
    while(m.o>=10){a.Backpack.exchange(m,'o');assert.ok(a.Backpack.valid(m,n));}
    while(m.t>=10){a.Backpack.exchange(m,'ten');assert.ok(a.Backpack.valid(m,n));}
    assert.deepEqual(plain(m),plain(a.Backpack.base(n)));
  }
});
test('backpack marks support without changing rewards and its exact blocks survive resume',()=>{
  const a=load(),step=practice(a);solve(a,step);a.Engine.next();solve(a,a.Engine.steps[a.Engine.idx]);a.Engine.next(); // advance to independent
  const work=a.Engine.steps[a.Engine.idx];assert.equal(work.type,'independent');
  const p=work.problem,body=a.doc.getElementById('mission-body');button(body,'🎒 Camp Backpack').onclick();
  assert.equal(work.assisted,true);assert.equal(a.Engine.firstTry,false);assert.ok(work.baseMat);
  if(work.baseMat.h)button(body,'1 hundred → 10 tens').onclick();
  else if(work.baseMat.t)button(body,'1 ten → 10 ones').onclick();
  const mat=plain(work.baseMat),tokens=a.profile.tokens;a.Engine.suspend();
  const b=load(Object.fromEntries(a.data));b.App.profile=b.Store.profile(a.profile.id);b.Engine.start(a.Engine.target.id);
  assert.deepEqual(plain(b.Engine.steps[b.Engine.idx].baseMat),mat);assert.equal(b.Engine.steps[b.Engine.idx].backpackOpen,true);
  solve(b,b.Engine.steps[b.Engine.idx]);assert.equal(b.App.profile.tokens,tokens);assert.equal(b.Engine.steps[b.Engine.idx].independent,false);
  assert.equal(b.App.profile.targets[a.Engine.target.id].attempts.at(-1),false);
  assert.ok(a.Backpack.supports(p));assert.equal(a.Backpack.supports({math:{type:'money'}}),false);
});
test('sharing and grouping counters preserve their meanings and exact totals',()=>{
  const a=load();
  for(const sharing of [true,false])for(const divisor of [3,4])for(let q=1;q<=10;q++){
    const p={math:{type:'divide',total:q*divisor,divisor},kind:sharing?'deal':'grouping',html:'',answer:String(q)};
    const s={},box=a.doc.createElement('div');let renders=0;const draw=()=>{box.innerHTML='';a.Backpack.groups(box,p,s,draw);renders++;};draw();
    for(let i=0;i<q;i++)button(box,sharing?'Deal one round':'Build one group of '+divisor).onclick();
    const groups=box.querySelectorAll('.math-group'),dots=box.querySelectorAll('.math-dot');
    assert.equal(dots.length,q*divisor);assert.equal(groups.length,sharing?divisor:q);
    assert.ok(groups.every(g=>g.querySelectorAll('.math-dot').length===(sharing?q:divisor)));
    assert.ok(button(box,sharing?'Deal one round':'Build one group of '+divisor).disabled);assert.equal(renders,q+1);
  }
});
test('multiplication builds equal groups without giving a total before they are built',()=>{
  const a=load(),p={math:{type:'multiply',a:3,b:4}},s={},box=a.doc.createElement('div');
  const draw=()=>{box.innerHTML='';a.Backpack.groups(box,p,s,draw);};draw();
  assert.match(box.textContent,/0 groups of 4 = 0 counters/);assert.equal(box.querySelectorAll('.math-dot').length,0);
  for(let i=1;i<=3;i++){button(box,'Build one group of 4').onclick();assert.equal(box.querySelectorAll('.math-group').length,i);assert.equal(box.querySelectorAll('.math-dot').length,i*4);}
  button(box,'Reset counters').onclick();assert.equal(s.groupMat.round,0);
});
test('a mission day progresses from completed practice, not mistakes or elapsed time',()=>{
  const a=load(),step=practice(a);let p=a.Living.progress(a.Engine);assert.equal(p.time,'morning');assert.equal(p.total,6);
  step.mistakes=7;step.hintsUsed=4;assert.equal(a.Living.progress(a.Engine).time,'morning');
  const required=a.Engine.steps.filter(s=>s.type==='guided'||s.type==='independent');required.slice(0,3).forEach(s=>s.solved=true);assert.equal(a.Living.progress(a.Engine).time,'golden');
  required.forEach(s=>s.solved=true);assert.equal(a.Living.progress(a.Engine).time,'night');
  assert.equal(a.profile.tokens,0);
});
test('lighting is saved per camper and camp interactions do not spend or award tokens',()=>{
  const a=load(),p=a.profile,other=a.newProfileState('Other','🦊');a.Store.saveProfile(other);p.tokens=11;
  const scene=a.Yard.scene(p,false),b=scene.querySelector('.daylight-switch');b.onclick();b.onclick();assert.equal(a.Yard.ensure(p).timeOfDay,'night');
  assert.equal(a.Yard.ensure(other).timeOfDay,'morning');assert.equal(p.tokens,11);
  const reload=load(Object.fromEntries(a.data));assert.equal(reload.Yard.ensure(reload.Store.profile(p.id)).timeOfDay,'night');
  const reward=a.doc.createElement('div');a.Yard.reward(reward,p,1);assert.equal(reward.querySelector('.camp-yard').getAttribute('data-daylight'),'night');
});
test('calm mode preserves teacher settings, saves, and suppresses decorative confetti',()=>{
  const a=load({'campWildwood.settings':JSON.stringify({unlockAll:true})});assert.equal(a.Settings.calmVisuals,false);
  a.Settings.setCalmVisuals(true);assert.equal(a.Settings.unlockAll,true);assert.equal(a.Living.isCalm(),true);
  solve(a,practice(a));assert.equal(a.doc.getElementById('confetti-layer').children.length,0);
  const b=load(Object.fromEntries(a.data));assert.equal(b.Settings.calmVisuals,true);assert.equal(b.Settings.unlockAll,true);
});
test('new rewards are purchasable once and reload as owned visual objects',()=>{
  const a=load(),p=a.profile;p.tokens=30;
  for(const id of ['campfire','canoe','fairy-lights']){
    a.Camp.renderShop(p);const card=a.doc.getElementById('shop-list').children.find(c=>c.getAttribute('data-item')===id),b=card.querySelector('button'),before=p.tokens;
    b.onclick({stopPropagation(){}});b.onclick({stopPropagation(){}});assert.equal(p.tokens,before-a.Yard.item(id).cost);assert.ok(a.Yard.place(p,id,'field-left'));
  }
  const b=load(Object.fromEntries(a.data)),saved=b.Store.profile(p.id);for(const id of ['campfire','canoe','fairy-lights'])assert.ok(saved.shop.includes(id));
  assert.equal(b.Yard.ensure(saved).slots['field-left'],'fairy-lights');
});
test('Enter on a work-mat button cannot submit a math answer',()=>{
  const a=load(),s=practice(a,'ch8-adding-98');assert.ok(!s.problem.choices);
  const btn=a.doc.createElement('button');a.doc.onkeydown({key:'Enter',target:btn,preventDefault(){throw new Error('native button activation must remain available');}});
  assert.equal(s.mistakes,undefined);assert.equal(s.solved,undefined);
  a.doc.onkeydown({key:'7',target:btn,preventDefault(){}});assert.equal(s.entry,'7');
});
