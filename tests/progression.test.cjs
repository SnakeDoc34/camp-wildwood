/* dm2b-qa3: trail-order locks, teacher override, second demonstrations,
   recorded-narration coverage, and the publisher's lesson sequence. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers.cjs');
const ROOT=path.resolve(__dirname,'..');

const EXPECTED_ORDER=[
  'trail-place','trail-bonds','trail-regroup','trail-mult',
  'ch8-adding-ones','ch8-adding-tens','ch8-making-100','ch8-adding-98',
  'ch8-subtracting','ch8-subtracting-98',
  'ch9-groups-3','ch9-multiply-3','ch9-divide-3',
  'ch9-groups-4','ch9-multiply-4','ch9-divide-4',
  'ch10-making-1','ch10-counting','ch10-change','ch10-comparing','ch10-adding','ch10-subtracting',
  'ch11-halves','ch11-unit','ch11-writing','ch11-whole','ch11-comparing',
  'ch12-telling','ch12-intervals','ch12-ampm',
  'ch13-comparing','ch13-units','ch13-measuring',
  'ch14-picture','ch14-bar','ch14-questions',
  'ch15-sides','ch15-polygons','ch15-circles','ch15-patterns','ch15-solids'
];
const DEMO2=['ch8-adding-tens','ch8-adding-98','ch8-subtracting-98','ch9-divide-3','ch9-divide-4',
  'ch10-change','ch10-subtracting','ch11-writing','ch11-comparing','ch12-intervals','trail-regroup'];

function locked(){ const a=load(); a.Settings.unlockAll=false; return a; }
function markDone(a,id){ a.profile.targets[id]={attempts:[],done:true,badge:false}; }

test('targets follow the publisher lesson order, Trailhead foundations first',()=>{
  const a=load();
  assert.equal(a.TARGETS.map(t=>t.id).join(','),EXPECTED_ORDER.join(','));
});

test('locked by default: the first Trailhead mission and the first Chapter 8 mission are open',()=>{
  const a=locked(),p=a.profile;
  for(const t of a.TARGETS){
    assert.equal(a.Camp.isTargetUnlocked(p,t),t.id==='ch8-adding-ones'||t.id==='trail-place',t.id);
  }
  assert.equal(a.Camp.isChapterUnlocked(p,'trail'),true);
  assert.equal(a.Camp.isChapterUnlocked(p,'ch8'),true);
  assert.equal(a.Camp.isChapterUnlocked(p,'ch9'),false);
  a.Engine.start('ch8-adding-tens');
  assert.equal(a.Engine.active,false,'Engine.start refuses a locked mission');
});

test('finishing a mission unlocks exactly the next one',()=>{
  const a=locked(),p=a.profile;
  markDone(a,'ch8-adding-ones');
  const byId=id=>a.TARGETS.find(t=>t.id===id);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch8-adding-tens')),true);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch8-making-100')),false);
  a.Engine.start('ch8-adding-tens');
  assert.equal(a.Engine.active,true);
});

test('Chapter 9 opens only when every Chapter 8 mission is done',()=>{
  const a=locked(),p=a.profile;
  for(const id of EXPECTED_ORDER.filter(id=>id.startsWith('ch8-')).slice(0,5))markDone(a,id);
  assert.equal(a.Camp.isChapterUnlocked(p,'ch9'),false);
  markDone(a,'ch8-subtracting-98');
  assert.equal(a.Camp.isChapterUnlocked(p,'ch9'),true);
  const byId=id=>a.TARGETS.find(t=>t.id===id);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch9-groups-3')),true);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch9-multiply-3')),false);
});

test('an in-progress mission can always be resumed, even if an earlier one is redone',()=>{
  const a=locked(),p=a.profile;
  p.activeMissions={'ch9-divide-4':{version:a.Engine.VERSION,idx:0,steps:[{type:'demo'}]}};
  const t=a.TARGETS.find(x=>x.id==='ch9-divide-4');
  assert.equal(a.Camp.isTargetUnlocked(p,t),true);
});

test('teacher override opens everything and the choice is saved on the device',()=>{
  const a=locked(),p=a.profile;
  a.Settings.setUnlockAll(true);
  for(const t of a.TARGETS)assert.equal(a.Camp.isTargetUnlocked(p,t),true,t.id);
  assert.deepEqual(JSON.parse(a.data.get('campWildwood.settings')),{unlockAll:true});
  a.Settings.setUnlockAll(false);
  assert.deepEqual(JSON.parse(a.data.get('campWildwood.settings')),{unlockAll:false});
});

test('the hardest skills have a second, mathematically consistent demonstration',()=>{
  const a=load();
  for(const id of DEMO2){
    const t=a.TARGETS.find(x=>x.id===id);
    assert.ok(t.demo2,id+' has demo2');
    assert.ok(t.demo2.caption.length>40,id+' demo2 caption');
    const v=t.demo2.visual;
    if(v.kind==='comp'){
      const result=v.op==='+'?v.a+v.k:v.a-v.k;
      assert.ok(t.demo2.caption.includes(String(result)),id+' demo2 result '+result);
    }else if(v.kind==='shift'||v.kind==='bridge'){
      assert.ok(t.demo2.caption.includes(String(v.a+v.b)),id+' demo2 total');
      assert.equal((v.a+v.move)%100,0,id+' demo2 lands on a whole hundred');
    }else if(v.kind==='division'){
      assert.equal(v.total%v.divisor,0,id+' demo2 divides evenly');
      assert.ok(t.demo2.caption.includes(String(v.total/v.divisor)),id+' demo2 quotient');
    }
  }
  for(const t of a.TARGETS){
    if(!DEMO2.includes(t.id))assert.equal(t.demo2,undefined,t.id+' has no demo2');
  }
});

test('second demonstrations appear in the mission flow before practice',()=>{
  const a=load();
  for(const id of DEMO2){
    a.Engine.start(id);
    assert.equal(a.Engine.steps.slice(0,3).map(s=>s.type).join(','),'demo,demo2,controls',id);
    assert.equal(a.Engine.steps.filter(s=>s.problem).length,6,id+' still assigns six problems');
    a.Engine.next(); // -> demo2 renders
    assert.equal(a.Engine.steps[a.Engine.idx].type,'demo2');
    a.Engine.next(); // -> controls
    assert.equal(a.Engine.steps[a.Engine.idx].type,'controls');
    a.Engine.suspend();
  }
  a.Engine.start('ch8-adding-ones');
  assert.equal(a.Engine.steps.slice(0,2).map(s=>s.type).join(','),'demo,controls');
});

test('every demonstration is backed by a recorded Melody clip that resolves',()=>{
  const keys=new Set();
  for(const f of fs.readdirSync(path.join(ROOT,'audio'))){
    if(!f.endsWith('.js'))continue;
    const text=fs.readFileSync(path.join(ROOT,'audio',f),'utf8');
    for(const m of text.matchAll(/AUDIO_DATA\["([^"]+)"\]/g))keys.add(m[1]);
  }
  // Mirror the player's lookup, including the legacy doubled-prefix clips.
  const resolves=src=>{const n=String(src).split('/').pop();return keys.has(n)||keys.has('m1-'+n);};
  const a=load();
  for(const t of a.TARGETS){
    assert.ok(t.audio,t.id+' has recorded narration');
    assert.ok(resolves(t.audio),t.id+' clip resolves: '+t.audio);
    if(t.demo2)assert.ok(resolves(t.demo2.audio),t.id+' demo2 clip resolves: '+t.demo2.audio);
    assert.ok(t.controlsAudio,t.id+' has recorded instructions');
    assert.ok(resolves(t.controlsAudio),t.id+' instructions clip resolves: '+t.controlsAudio);
  }
});
