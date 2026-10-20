const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers.cjs');
test('title demonstration cannot grant purchases, spend tokens or overwrite any camper save',()=>{
  const a=load(),before=JSON.stringify([...a.data]),profile=JSON.stringify(a.profile),p=a.Camp3D.introProfile();
  assert.notEqual(p.id,a.profile.id);assert.equal(p.name,'Wildwood');assert.equal(a.Yard.ensure(p).pitch,'soccer');
  p.shop.push('goal-neon');p.camp.design.slots.trail='tent';
  const fresh=a.Camp3D.introProfile();assert.equal(fresh.camp.design.slots.trail,'campfire');assert.ok(!fresh.shop.includes('goal-neon'));
  assert.equal(JSON.stringify(a.profile),profile);assert.equal(JSON.stringify([...a.data]),before);assert.equal(a.App.profile,a.profile);
});
test('intro camera and every decorative animation freeze under pause or reduced motion and resume without a jump',()=>{
  const a=load(),host=a.doc.getElementById('intro-world'),b=a.doc.getElementById('btn-intro-motion');host.closest=()=>null;
  let o;a.Camp3D.mount=(h,k,p,options)=>{o=options;};a.Camp3D.intro();
  let rendered=0,moved=0;const v=Object.create(a.WildView.prototype);Object.assign(v,{dead:false,time:0,options:o,anim:[()=>moved++],orbit(){},renderer:{render(){rendered++;}}});
  v.tick(.2);assert.equal(o.elapsed,.2);assert.equal(moved,1);const pose=JSON.stringify([v.yaw,v.pitch,v.distance]);
  b.onclick();assert.equal(b.getAttribute('aria-pressed'),'true');for(let i=0;i<20;i++)v.tick(.2);
  assert.equal(o.elapsed,.2);assert.equal(moved,1);assert.equal(JSON.stringify([v.yaw,v.pitch,v.distance]),pose);
  b.onclick();v.tick(.1);assert.ok(Math.abs(o.elapsed-.3)<1e-10);assert.equal(moved,2);
  a.Living.media={matches:true};v.tick(.2);assert.ok(Math.abs(o.elapsed-.3)<1e-10);assert.equal(moved,2);assert.equal(b.disabled,true);assert.equal(b.textContent,'Still scenery');
  a.Living.media.matches=false;v.tick(.1);assert.equal(b.disabled,false);assert.equal(moved,3);assert.equal(rendered,24);
});
test('a long-running intro keeps a finite, bounded camera path',()=>{
  const a=load();for(let t=0;t<=7200;t+=.5){const p=a.Camp3D.introPose(t);assert.ok(p.yaw>=.05-1e-10&&p.yaw<=.95);assert.ok(p.pitch>=.615&&p.pitch<=.705);assert.ok(p.distance>=39&&p.distance<=45);}
});
test('leaving during delayed graphics loading cannot create a hidden renderer',async()=>{
  const a=load(),host=a.doc.getElementById('intro-world');let frame,resolve,hidden=false;
  a.window.requestAnimationFrame=fn=>{frame=fn;};host.isConnected=true;host.closest=()=>({classList:{contains:()=>hidden}});
  a.Camp3D.load=()=>new Promise(r=>{resolve=r;});a.Camp3D.mount(host,'camp',a.Camp3D.introProfile(),{cinematic:true});
  assert.equal(host._mountPending,true);const pending=frame();hidden=true;resolve({});await pending;
  assert.equal(a.Camp3D.views.size,0);assert.equal(host._mountPending,false);assert.equal(host._view,undefined);
});
