/* Trailhead (dm2b-m5): independent oracles for the 2A foundation families,
   plus placement gating and Festival scoping. Answers are re-derived from
   the displayed question text, never from the generator's own math fields.
   The Trailhead is a bonus ramp: it must never gate Chapter 8 or the
   Festival, and the Festival still counts only the 37 2B missions. */
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers.cjs');

function locked(){ const a=load(); a.Settings.unlockAll=false; return a; }
function markDone(a,id){ a.profile.targets[id]={attempts:[],done:true,badge:false}; }
const TRAIL=['trail-place','trail-bonds','trail-regroup','trail-mult'];
const CORE_COUNT=37;

test('trailhead: 39000 problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('trail-'))){
    for(let i=0;i<3000;i++){
      const p=f.gen();count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid: '+JSON.stringify(p).slice(0,160));
      const txt=p.html.replace(/<br>/g,' ');
      if(fid==='trail-pv-build'){
        const m=txt.match(/made of (\d+) hundreds?, (\d+) tens?, and (\d+) ones?\?/);
        assert.ok(m,fid+' parse: '+txt);
        assert.equal(Number(p.answer),Number(m[1])*100+Number(m[2])*10+Number(m[3]),fid);
        assert.ok(p.choices.map(String).includes(p.answer),fid+' choices contain answer');
      }
      if(fid==='trail-pv-digit'){
        const m=txt.match(/In the number (\d+), what is the value of the digit (\d+)\?/);
        assert.ok(m,fid+' parse: '+txt);
        const n=String(m[1]).padStart(3,'0'),d=m[2];
        const hits=[...n].filter(c=>c===d).length;
        assert.equal(hits,1,fid+' asked digit appears exactly once (else two answers are right): '+n);
        const idx=n.indexOf(d);
        assert.equal(Number(p.answer),Number(d)*[100,10,1][idx],fid);
      }
      if(fid==='trail-pv-expand'){
        const eq=txt.split('What number is missing?')[0];
        const m=eq.match(/(\d+) = ([\d_]+) \+ ([\d_]+) \+ ([\d_]+)/);
        assert.ok(m,fid+' parse: '+eq);
        const shown=[m[2],m[3],m[4]].filter(x=>x!=='__').reduce((s,x)=>s+Number(x),0);
        assert.equal(Number(p.answer),Number(m[1])-shown,fid);
        assert.ok(p.choices.map(String).includes(p.answer),fid+' choices contain answer');
      }
      if(fid==='trail-pv-compare'){
        const m=txt.match(/greater: (\d+) or (\d+)\?/);
        assert.ok(m,fid+' parse: '+txt);
        assert.notEqual(m[1],m[2],fid+' never asks about a tie');
        assert.equal(Number(p.answer),Math.max(Number(m[1]),Number(m[2])),fid);
      }
      if(fid==='trail-bond10'||fid==='trail-bond100'){
        const m=txt.match(/(\d+) \+ \? = (\d+)/);
        assert.ok(m,fid+' parse: '+txt);
        assert.equal(Number(p.answer),Number(m[2])-Number(m[1]),fid);
      }
      if(fid==='trail-bond3'){
        const m=txt.match(/(\d+) \+ (\d+) \+ \? = (\d+)/);
        assert.ok(m,fid+' parse: '+txt);
        assert.equal(Number(p.answer),Number(m[3])-Number(m[1])-Number(m[2]),fid);
        assert.ok(Number(p.answer)>0,fid+' missing part is positive');
        assert.ok(p.choices.map(String).includes(p.answer),fid+' choices contain answer');
      }
      if(fid==='trail-add-rename'){
        const m=txt.match(/(\d+) \+ (\d+) = \?/);
        assert.ok(m,fid+' parse: '+txt);
        const x=Number(m[1]),y=Number(m[2]);
        assert.ok((x%10)+(y%10)>=10,fid+' always needs renaming in the ones: '+x+'+'+y);
        assert.ok(x+y<=1000,fid+' stays within 1,000');
        assert.equal(Number(p.answer),x+y,fid);
      }
      if(fid==='trail-sub-rename'){
        const m=txt.match(/(\d+) − (\d+) = \?/);
        assert.ok(m,fid+' parse: '+txt);
        const x=Number(m[1]),y=Number(m[2]);
        assert.ok((x%10)<(y%10),fid+' always needs a trade in the ones: '+x+'-'+y);
        assert.equal(Number(p.answer),x-y,fid);
        assert.ok(Number(p.answer)>0,fid+' answer positive');
      }
      if(fid==='trail-word-rename'){
        const nums=[...txt.matchAll(/\d+/g)].map(x=>Number(x[0]));
        assert.equal(nums.length,2,fid+' shows exactly two numbers: '+txt);
        const[x,y]=nums;
        if(txt.includes('in all')){
          assert.ok((x%10)+(y%10)>=10,fid+' add variant needs renaming');
          assert.equal(Number(p.answer),x+y,fid);
        }else{
          assert.ok(txt.includes('are left'),fid+' subtract variant wording: '+txt);
          assert.ok((x%10)<(y%10),fid+' subtract variant needs a trade');
          assert.equal(Number(p.answer),x-y,fid);
        }
      }
      if(fid==='trail-skip'){
        const m=txt.match(/Count by (\d+)s: (\d+), (\d+), (\d+), (\d+), \?/);
        assert.ok(m,fid+' parse: '+txt);
        const k=Number(m[1]),seq=[2,3,4,5].map(j=>Number(m[j]));
        assert.ok([2,5,10].includes(k),fid+' only 2s, 5s, 10s');
        for(let j=1;j<4;j++)assert.equal(seq[j]-seq[j-1],k,fid+' even steps');
        assert.equal(Number(p.answer),seq[3]+k,fid);
      }
      if(fid==='trail-facts'){
        if(txt.includes('×')){
          const m=txt.match(/(\d+) × (\d+) = \?/);
          assert.ok(m,fid+' parse: '+txt);
          assert.ok([2,5,10].includes(Number(m[1])),fid+' first factor is a 2A table');
          assert.equal(Number(p.answer),Number(m[1])*Number(m[2]),fid);
        }else{
          const m=txt.match(/(\d+) ÷ (\d+) = \?/);
          assert.ok(m,fid+' parse: '+txt);
          assert.ok([2,5,10].includes(Number(m[2])),fid+' divisor is a 2A table');
          assert.equal(Number(p.answer)*Number(m[2]),Number(m[1]),fid+' division inverts the fact');
        }
      }
      if(fid==='trail-groups-intro'){
        assert.equal(Number(p.answer),p.visual.groups*p.visual.per,fid+' picture count');
        assert.ok(txt.includes(p.visual.groups+' groups of '+p.visual.per),fid+' words match picture');
      }
    }
  }
  assert.equal(count,39000);
});

test('trailhead sits first on the trail but is not part of the 2B core',()=>{
  const a=load();
  assert.equal(a.TARGETS.slice(0,4).map(t=>t.id).join(','),TRAIL.join(','));
  assert.equal(a.TARGETS.length,41);
  assert.equal(a.Camp.coreTargets().length,CORE_COUNT);
  assert.ok(a.Camp.coreTargets().every(t=>t.chapter!=='trail'));
  for(const t of a.TARGETS.filter(t=>t.chapter==='trail'))assert.equal(t.chapter,'trail');
});

test('trailhead and Chapter 8 are both open from the start; the ramp never gates the book',()=>{
  const a=locked(),p=a.profile,byId=id=>a.TARGETS.find(t=>t.id===id);
  assert.equal(a.Camp.isChapterUnlocked(p,'trail'),true);
  assert.equal(a.Camp.isChapterUnlocked(p,'ch8'),true,'Chapter 8 opens with no Trailhead done');
  assert.equal(a.Camp.isChapterUnlocked(p,'ch9'),false);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('trail-place')),true);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch8-adding-ones')),true);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('trail-bonds')),false,'missions inside the Trailhead still unlock in order');
  markDone(a,'trail-place');
  assert.equal(a.Camp.isTargetUnlocked(p,byId('trail-bonds')),true);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('trail-regroup')),false);
  for(const id of TRAIL)markDone(a,id);
  assert.equal(a.Camp.isChapterUnlocked(p,'ch9'),false,'finishing the whole Trailhead does not open Chapter 9');
  a.Engine.start('trail-mult');
  assert.equal(a.Engine.active,true,'a finished Trailhead mission can be replayed');
});

test('the Festival counts only the 37 core missions',()=>{
  const a=locked(),p=a.profile;
  for(const t of a.Camp.coreTargets())markDone(a,t.id);
  a.Camp.renderHub(p);
  assert.match(a.doc.getElementById('festival-meter').innerHTML,/ready for the Camp Festival/,'37 core done, no Trailhead: Festival ready');
  assert.match(a.doc.getElementById('camp-completion').textContent,new RegExp(CORE_COUNT+' of '+CORE_COUNT));
  a.Camp.renderReport(p);
  assert.match(a.doc.getElementById('report-body').innerHTML,/Camp Festival complete/);
  const b=locked(),q=b.profile;
  for(const t of b.Camp.coreTargets().slice(1))markDone(b,t.id);
  for(const id of TRAIL)markDone(b,id);
  b.Camp.renderHub(q);
  assert.match(b.doc.getElementById('festival-meter').innerHTML,/readiness: 36 of 37/,'all Trailhead + 36 core: not ready');
});

test('every trailhead family belongs to its mission and every strategy resolves',()=>{
  const a=load();
  for(const t of a.TARGETS.filter(t=>t.chapter==='trail')){
    assert.ok(t.strategyName&&t.strategyBlurb,t.id+' has a strategy');
    for(const fid of[...t.families,...t.guidedFamilies,...t.adventureFamilies]){
      assert.equal(a.FAMILIES[fid].owner,t.id,fid+' owned by '+t.id);
      assert.ok(a.FAMILIES[fid].strategy,fid+' carries a strategy');
    }
  }
  assert.equal(a.TARGETS.find(t=>t.id==='trail-regroup').demo2.audio,'audio/m8-trail-regroup-demo2.mp3');
});
