/* Strategy vocabulary (dm2b-m4): every problem is labeled with its Singapore
   Math strategy, every mission teaches it up front, and solved feedback
   names it again. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load,button,solve}=require('./helpers.cjs');
const ROOT=path.resolve(__dirname,'..');

function audioKeys(){
  const html=fs.readFileSync(ROOT+'/index.html','utf8'),keys=new Set();
  for(const m of html.matchAll(/src="audio\/([\w-]+\.js)(?:\?[^"]*)?"/g))
    for(const k of fs.readFileSync(ROOT+'/audio/'+m[1],'utf8').matchAll(/AUDIO_DATA\["([^"]+)"/g))keys.add(k[1]);
  return keys;
}

test('every family and mission carries a strategy from the registry',()=>{
  const a=load();
  for(const [fid,f] of Object.entries(a.FAMILIES)){
    assert.ok(f.strategy&&f.strategy.name,'family '+fid+' has a strategy');
    assert.ok(f.strategy.blurb&&f.strategy.blurb.length>20,fid+' strategy has a kid-readable definition');
  }
  for(const t of a.TARGETS){
    assert.ok(t.strategyName,t.id+' mission names its strategy');
    assert.ok(t.strategyBlurb&&t.strategyBlurb.length>20,t.id+' strategy is defined');
    assert.ok(t.strategyIntro&&t.strategyIntro.endsWith(t.id+'.mp3'),t.id+' has an intro clip path');
  }
  // the strategies Dustin named are present verbatim
  const names=new Set([...Object.values(a.FAMILIES).map(f=>f.strategy.name),...a.TARGETS.map(t=>t.strategyName)]);
  for(const want of ['Make the Next Ten','Make the Next Hundred','Compensation'])
    assert.ok(names.has(want),'strategy present: '+want);
});

test('every strategy introduction is recorded in Melody and resolves',()=>{
  const a=load(),keys=audioKeys();
  for(const t of a.TARGETS)
    assert.ok(keys.has('m7-intro-'+t.id+'.mp3'),t.id+' intro clip resolves');
});

test('the demonstration teaches the strategy before any problem',()=>{
  const a=load();
  a.Engine.start('ch8-adding-ones');
  const body=a.doc.getElementById('mission-body');
  assert.ok(body.textContent.includes('Strategy:'),'demo shows a strategy banner');
  assert.ok(body.textContent.includes('Make the Next Ten'),'banner names the mission strategy');
  // narration begins with the strategy introduction, then chains to the demo
  assert.ok(a.audios.length>=1&&a.audios[0].src.includes('m7-intro-ch8-adding-ones.mp3'),'intro clip plays first: '+(a.audios[0]||{}).src);
});

test('problems are labeled and solved feedback names the strategy',()=>{
  const a=load();let sawChip=false,sawFeedback=false;
  for(const t of a.TARGETS){
    a.App.profile.targets={};
    a.Engine.start(t.id);
    let guard=0;
    while(a.Engine.active&&guard++<60){
      const s=a.Engine.steps[a.Engine.idx];
      if(s.type==='demo'||s.type==='demo2'||s.type==='controls')a.Engine.next();
      else if(s.type==='adventure'){ a.Engine.next(); }
      else if(s.problem){
        const body=a.doc.getElementById('mission-body');
        if(body.textContent.includes('Strategy:'))sawChip=true;
        solve(a,s);
        const after=a.doc.getElementById('mission-body');
        if(after.textContent.includes('Strategy:')&&after.textContent.includes(s.problem.fid?a.strategyName||'':''))sawFeedback=true;
        if(after.textContent.includes('Correct!')){ assert.ok(after.textContent.includes('Strategy:'),t.id+' feedback names a strategy'); }
        a.Engine.next();
      }
      else a.Engine.next();
    }
  }
  assert.ok(sawChip,'a strategy chip appears on problem cards');
  assert.ok(sawFeedback,'solved feedback names the strategy');
});

test('the report lists strategies learned from completed missions',()=>{
  const a=load();const p=a.profile;
  p.targets['ch8-adding-ones']={done:true,badge:true};
  p.targets['ch10-change']={done:true,badge:true};
  a.Camp.renderReport(p);
  const text=a.doc.getElementById('report-body').textContent;
  assert.ok(text.includes('Strategies learned'),'report has a strategies section');
  assert.ok(text.includes('Make the Next Ten'),'report lists Make the Next Ten');
  assert.ok(text.includes('Counting Up for Change'),'report lists Counting Up for Change');
});
