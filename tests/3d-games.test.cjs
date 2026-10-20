const test=require('node:test'),assert=require('node:assert/strict');
const {load,button}=require('./helpers.cjs');
test('soccer resolves controlled goals, saves, weak shots and shots over the bar',()=>{
  const a=load(),base={aimX:.8,aimY:.85,power:.65,keeperX:-2};
  assert.equal(a.SoccerRules.resolve(base).goal,true);
  assert.equal(a.SoccerRules.resolve({...base,aimX:0,aimY:.2,keeperX:0}).outcome,'saved');
  assert.equal(a.SoccerRules.resolve({...base,power:.2}).outcome,'short');
  assert.equal(a.SoccerRules.resolve({...base,power:1}).outcome,'high');
  assert.equal(a.SoccerRules.resolve({...base,power:NaN}),null);
  assert.equal(a.SoccerRules.resolve({...base,aimX:5}),null);
  for(let x=-10;x<=10;x++)for(let y=0;y<=10;y++)for(let power=0;power<=10;power++){
    const r=a.SoccerRules.resolve({aimX:x/10,aimY:y/10,power:power/10,keeperX:0});assert.ok(r);assert.equal(r.goal,r.outcome==='goal');assert.ok(Number.isFinite(r.x)&&Number.isFinite(r.y));
  }
});
test('purchases install field styles without occupying plots or charging twice',()=>{
  const a=load(),p=a.profile;p.shop=['soccer-field'];a.Yard.ensure(p);p.tokens=100;
  for(const id of ['pitch-stripes','goal-neon','stadium-lights','grandstand','team-blue']){
    a.Camp.renderShop(p);const row=a.doc.getElementById('shop-list').children.find(e=>e.getAttribute('data-item')===id),b=row.querySelector('button'),before=p.tokens;
    b.onclick({stopPropagation(){}});b.onclick({stopPropagation(){}});assert.equal(p.tokens,before-a.Yard.item(id).cost);assert.equal(a.Yard.place(p,id,'field-left'),false);assert.ok(!Object.values(p.camp.design.slots).includes(id));
  }
  const d=a.Yard.ensure(p);for(const k of ['striped','neon','floodlights','stands'])assert.equal(d[k],true);assert.equal(d.team,'lagoon');
  const b=load(Object.fromEntries(a.data)),saved=b.Yard.ensure(b.Store.profile(p.id));assert.equal(saved.team,'lagoon');assert.equal(saved.floodlights,true);
});
test('locked colors cannot be selected and invalid customization is sanitized',()=>{
  const a=load(),p=a.profile,d=a.Yard.ensure(p);assert.equal(a.CampStyle.set(p,'team','lagoon'),false);assert.equal(a.CampStyle.set(p,'roof','slate'),true);assert.equal(a.CampStyle.set(p,'team','gold'),true);
  d.team='sunset';d.neon=true;d.camera={yaw:NaN,pitch:9,distance:0};d.transforms={sapling:{rotation:0,scale:9}};a.Yard.ensure(p);assert.equal(d.team,'forest');assert.equal(d.neon,false);assert.equal(d.camera,undefined);assert.equal(d.transforms.sapling,undefined);
});
test('object rotations, scales, extra plots and team nickname persist independently per camper',()=>{
  const a=load(),p=a.profile,other=a.newProfileState('Other','🦊');a.Store.saveProfile(other);const d=a.Yard.ensure(p);
  assert.equal(a.YARD_SLOTS.length,10);assert.ok(a.Yard.place(p,'sapling','west-woods'));assert.ok(a.CampStyle.transform(p,'sapling','rotate'));assert.ok(a.CampStyle.transform(p,'sapling',1.2));d.teamName='Pine Rangers';a.Store.persist();
  const b=load(Object.fromEntries(a.data)),saved=b.Yard.ensure(b.Store.profile(p.id));assert.equal(saved.transforms.sapling.rotation,45);assert.equal(saved.transforms.sapling.scale,1.2);assert.equal(saved.slots['west-woods'],'sapling');assert.equal(saved.teamName,'Pine Rangers');assert.equal(b.Yard.ensure(b.Store.profile(other.id)).teamName,'Wildwood FC');
});
test('canoe has seeded eight-gate rounds, safe steering, bounded scores and no token mutations',()=>{
  const a=load(),s=a.CanoeRules.create(1234),same=a.CanoeRules.create(1234),tokens=a.profile.tokens;
  assert.deepEqual([...s.gates],[...same.gates]);assert.equal(s.gates.length,8);assert.equal(a.CanoeRules.cross(s),false);s.phase='running';
  assert.equal(a.CanoeRules.steer(s,8),false);for(let i=0;i<8;i++){a.CanoeRules.steer(s,s.gates[i]);assert.equal(a.CanoeRules.cross(s),true);}assert.equal(s.phase,'done');assert.equal(s.score,8);assert.equal(a.CanoeRules.cross(s),false);assert.equal(a.CanoeRules.steer(s,1),false);assert.equal(a.profile.tokens,tokens);
});
test('soccer UI exposes two difficulties, six targets, a steady-power option and unique shot lifecycle',()=>{
  const a=load(),p=a.profile;p.shop=['soccer-field'];a.Yard.ensure(p);a.Yard.install(p,'soccer-field');a.App.showDesign();const box=a.doc.getElementById('soccer-activity');assert.ok(button(box,'Play goal kick'));assert.ok(button(box,'Ranger challenge'));
  button(box,'Play goal kick').onclick();assert.equal(box.querySelectorAll('.aim-btn').length,6);button(box,'Use steady power').onclick();assert.equal(a.CampPlay.soccer.steady,true);button(box,'KICK!').onclick();assert.equal(a.CampPlay.soccer.phase,'flight');assert.equal(a.CampPlay.soccer.shots,1);assert.ok(button(box,'KICK!').disabled);assert.ok(box.querySelector('.arcade-playing'));button(box,'✕ Back to camp designer').onclick();assert.equal(a.CampPlay.soccer,null);assert.equal(p.tokens,0);assert.ok(button(box,'Play goal kick'));
});
test('shot settlement completes without rendering frames and pays a goal exactly once',()=>{
  const a=load(),p=a.profile;p.shop=['soccer-field'];a.Yard.ensure(p);a.Yard.install(p,'soccer-field');a.App.showDesign();const box=a.doc.getElementById('soccer-activity');button(box,'Play goal kick').onclick();button(box,'KICK!').onclick();
  const settle=[...a.timers.values()].find(t=>t.ms===1250);assert.ok(settle);settle.f();assert.equal(p.camp.design.goals,1);assert.equal(a.CampPlay.soccer.phase,'result');settle.f();assert.equal(p.camp.design.goals,1);assert.ok(button(box,'Next shot →'));assert.equal(p.tokens,0);
});
test('canoe progress and pause use a clock independent of rendered frames',()=>{
  const a=load(),p=a.profile,timers=new Map();let id=0;a.window.setInterval=f=>{timers.set(++id,f);return id;};a.window.clearInterval=n=>timers.delete(n);p.shop=['canoe'];a.Yard.ensure(p);a.App.showDesign();
  const box=a.doc.getElementById('chapter-activities');button(box,'Start creek run').onclick();box.querySelector('.canoe-stage').isConnected=true;
  const s=a.CampPlay.canoe;a.CanoeRules.steer(s,s.gates[0]);for(let i=0;i<45;i++)[...timers.values()][0]?.();assert.equal(s.index,1);
  button(box,'Pause creek run').onclick();const before=s.progress;for(let i=0;i<10;i++)[...timers.values()][0]?.();assert.equal(s.progress,before);button(box,'Resume creek run').onclick();
  while(s.phase==='running'){a.CanoeRules.steer(s,s.gates[s.index]);const index=s.index;for(let i=0;i<50&&s.index===index;i++)[...timers.values()][0]?.();}
  assert.equal(s.phase,'done');assert.equal(s.score,8);assert.equal(p.camp.design.canoeBest,8);assert.equal(p.tokens,0);assert.equal(timers.size,0);
});
test('canoe can launch after leaving a soccer game without stale activity state',()=>{
  const a=load(),p=a.profile;p.shop=['canoe','soccer-field'];a.Yard.ensure(p);a.Yard.install(p,'soccer-field');a.App.showDesign();
  const soccer=a.doc.getElementById('soccer-activity');button(soccer,'Play goal kick').onclick();button(soccer,'✕ Back to camp designer').onclick();
  button(a.doc.getElementById('chapter-activities'),'Start creek run').onclick();assert.equal(a.CampPlay.canoe.phase,'running');assert.ok(a.doc.getElementById('chapter-activities').querySelector('.canoe-playing'));
});
