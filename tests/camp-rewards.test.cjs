const test=require('node:test'),assert=require('node:assert/strict');
const {load,button,solve}=require('./helpers.cjs');
const clickEvent={stopPropagation(){}};
const buy=(a,id)=>a.doc.getElementById('shop-list').children.find(c=>c.getAttribute('data-item')===id).querySelector('button');
function complete(a,id,challenge=false){
  a.Engine.start(id);
  while(a.Engine.steps[a.Engine.idx]&&!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();
  for(let i=0;i<6;i++){solve(a,a.Engine.steps[a.Engine.idx]);a.Engine.next();}
  button(a.doc.getElementById('mission-body'),challenge?'Take the challenge':'Skip for now').onclick();
  if(challenge){solve(a,a.Engine.steps[a.Engine.idx]);a.Engine.next();}
}

test('old purchases become placed objects without changing earned progress or balance',()=>{
  const legacy={profiles:{old:{id:'old',name:'Old',tokens:7,camp:{lodge:2,field:1},shop:['flag-red','flowers','lanterns','sign'],targets:{'ch8-adding-ones':{done:true,badge:true}},missionsDone:{'ch8-adding-ones':true},report:[]}}};
  const a=load({'campWildwood.v1':JSON.stringify(legacy)}),p=a.Store.profile('old'),d=a.Yard.ensure(p);
  for(const id of p.shop)assert.ok(Object.values(d.slots).includes(id));
  assert.equal(new Set(Object.values(d.slots)).size,6);assert.equal(p.tokens,7);assert.ok(p.targets['ch8-adding-ones'].badge);
  a.Store.persist();const b=load(Object.fromEntries(a.data));assert.deepEqual(JSON.parse(JSON.stringify(b.Yard.ensure(b.Store.profile('old')))),JSON.parse(JSON.stringify(d)));
});
test('placement swaps objects, preserves replaced inventory, and survives refresh',()=>{
  const a=load(),p=a.profile;p.shop=['flag-red','flowers'];a.Yard.ensure(p);
  assert.ok(a.Yard.place(p,'flag-red','field-left'));assert.ok(a.Yard.place(p,'flowers','field-right'));
  a.Yard.place(p,'flag-red','field-right');assert.equal(p.camp.design.slots['field-left'],'flowers');assert.equal(p.camp.design.slots['field-right'],'flag-red');
  a.Yard.place(p,'stones','field-right');assert.equal(p.camp.design.slots.trail,'flag-red');
  a.Yard.putAway(p,'flowers');assert.ok(p.shop.includes('flowers'));assert.ok(!Object.values(p.camp.design.slots).includes('flowers'));
  a.Yard.place(p,'flowers','field-right');assert.ok(p.shop.includes('flag-red'));assert.ok(!Object.values(p.camp.design.slots).includes('stones'));
  const b=load(Object.fromEntries(a.data)),saved=b.Yard.ensure(b.Store.profile(p.id));assert.equal(saved.slots['field-right'],'flowers');assert.equal(saved.slots.trail,'flag-red');
});
test('unowned, unknown, duplicate, and invalid placements cannot become camp objects',()=>{
  const a=load(),p=a.profile;const d=a.Yard.ensure(p);
  assert.equal(a.Yard.place(p,'lanterns','field-left'),false);assert.equal(a.Yard.place(p,'nothing','field-left'),false);assert.equal(a.Yard.place(p,'sapling','outside'),false);assert.equal(a.Yard.place(p,'soccer-field','field-left'),false);
  d.slots={creek:'sapling',trail:'sapling','field-left':'lanterns',outside:'stones'};
  a.Yard.ensure(p);assert.equal(Object.values(d.slots).length,1);assert.equal(d.slots.creek,'sapling');
});
test('shop checks affordability, installs the soccer kit, and never charges twice',()=>{
  const a=load(),p=a.profile;p.tokens=3;a.Camp.renderShop(p);const blocked=buy(a,'soccer-field');assert.ok(blocked.disabled);blocked.onclick(clickEvent);assert.equal(p.tokens,3);assert.equal(p.shop.length,0);
  p.tokens=4;a.Camp.renderShop(p);const b=buy(a,'soccer-field');b.onclick(clickEvent);b.onclick(clickEvent);
  assert.equal(p.tokens,0);assert.equal(p.shop.length,1);assert.equal(p.camp.design.pitch,'soccer');
  a.App.showDesign('soccer-field');assert.ok(button(a.doc.getElementById('soccer-activity'),'Play goal kick'));
  p.camp.design.pitch='meadow';a.App.showDesign('soccer-field');assert.equal(p.camp.design.pitch,'soccer');
});
test('savings goals persist without reserving or spending tokens',()=>{
  const a=load(),p=a.profile;p.tokens=2;assert.ok(a.Yard.setGoal(p,'tent'));assert.equal(p.tokens,2);
  const box=a.doc.createElement('div');a.Yard.renderGoal(box,p);assert.match(box.textContent,/3 more tokens/);
  const b=load(Object.fromEntries(a.data));assert.equal(b.Yard.goal(b.Store.profile(p.id)).id,'tent');
  assert.equal(a.Yard.setGoal(p,'stones'),false);p.shop.push('tent');assert.equal(a.Yard.setGoal(p,'tent'),false);
  assert.notEqual(a.Yard.goal(p).id,'tent');
});
test('each full replay earns one token; duplicate completion and unfinished replays do not',()=>{
  const a=load(),id='ch8-adding-ones';complete(a,id,true);assert.equal(a.profile.tokens,2);
  a.Engine.renderDone(a.doc.createElement('div'));assert.equal(a.profile.tokens,2);
  complete(a,id,true);assert.equal(a.profile.tokens,3);a.Engine.renderDone(a.doc.createElement('div'));assert.equal(a.profile.tokens,3);
  a.Engine.start(id);a.Engine.renderDone(a.doc.createElement('div'));assert.equal(a.profile.tokens,3);
  complete(a,id);assert.equal(a.profile.tokens,4);assert.match(a.doc.getElementById('mission-body').textContent,/Build my camp/);
});
test('goal kick keeps scores within three shots and never changes the token balance',()=>{
  const a=load(),p=a.profile;p.shop=['soccer-field'];a.Yard.ensure(p);a.Yard.install(p,'soccer-field');p.tokens=11;
  a.Yard.soccer={shots:0,goals:0};assert.ok(a.Yard.kick(p,'center'));assert.ok(a.Yard.kick(p,'right'));assert.ok(a.Yard.kick(p,'right'));
  assert.equal(a.Yard.kick(p,'left'),false);assert.equal(a.Yard.soccer.goals,2);assert.equal(p.camp.design.goals,2);assert.equal(p.camp.design.best,2);assert.equal(p.tokens,11);
  const b=load(Object.fromEntries(a.data)),saved=b.Yard.ensure(b.Store.profile(p.id));assert.equal(saved.goals,2);assert.equal(saved.best,2);
  p.camp.design.pitch='meadow';a.Yard.soccer={shots:0,goals:0};assert.equal(a.Yard.kick(p,'center'),false);
});
test('campers retain separate layouts, savings goals, soccer scores, and purchases',()=>{
  const a=load(),p=a.profile,other=a.newProfileState('Other','🦊');a.Store.saveProfile(other);
  p.shop=['soccer-field','flag-red'];a.Yard.ensure(p);a.Yard.install(p,'soccer-field');a.Yard.place(p,'flag-red','field-right');a.Yard.setGoal(p,'lanterns');
  a.Yard.soccer={shots:0,goals:0};a.Yard.kick(p,'center');
  const d=a.Yard.ensure(other);assert.equal(d.pitch,'meadow');assert.equal(d.goals,0);assert.ok(!Object.values(d.slots).includes('flag-red'));assert.equal(a.Yard.goal(other).id,'soccer-field');
  a.Yard.place(other,'sapling','lodge-left');assert.equal(p.camp.design.slots['field-right'],'flag-red');assert.equal(p.camp.design.goal,'lanterns');
  a.doc.getElementById('shop-message').textContent='Your soccer field is built!';a.App.profile=other;a.App.showShop();
  assert.equal(a.doc.getElementById('shop-message').textContent,'');assert.match(a.doc.getElementById('shop-goal').textContent,/Soccer field kit/);
});
test('the designer uses native item and plot buttons and supports putting items away',()=>{
  const a=load();a.App.showDesign();const inv=a.doc.getElementById('design-inventory');
  const choose=inv.querySelectorAll('button').find(b=>b.getAttribute('aria-label')==='Place Little pine');choose.onclick();
  assert.equal(a.Yard.selected,'sapling');const plot=a.doc.getElementById('plot-lodge-left');assert.equal(plot.tagName,'BUTTON');plot.onclick();assert.equal(a.profile.camp.design.slots['lodge-left'],'sapling');
  a.doc.getElementById('plot-lodge-left').onclick();button(a.doc.getElementById('design-inventory'),'Put selected item away').onclick();assert.ok(!Object.values(a.profile.camp.design.slots).includes('sapling'));
});
