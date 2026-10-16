/* Milestone 2: independent oracles for Chapter 10 (money) and Chapter 11
   (fractions). Answers are recomputed from the displayed question and the
   pictured coins/parts — never from the family's own answer key. */
const test=require('node:test'),assert=require('node:assert/strict');
const {load,solve}=require('./helpers.cjs');

const moneyIn=text=>[...text.matchAll(/\$(\d+)\.(\d{2})/g)].map(m=>Number(m[1])*100+Number(m[2]));
const centsOf=text=>{const m=text.match(/(\d+)¢/);return m?Number(m[1]):null;};
const fmt=c=>'$'+Math.floor(c/100)+'.'+String(c%100).padStart(2,'0');
function arithmetic(text){
  const terms=text.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s/g,'').split(/(?=[+-])/);
  return terms.reduce((sum,term)=>{
    const values=term.match(/[+-]?\d+|[*/]/g);let n=Number(values[0]);
    for(let i=1;i<values.length;i+=2)n=values[i]==='*'?n*Number(values[i+1]):n/Number(values[i+1]);
    return sum+n;
  },0);
}
function verifyMoneyEquations(text){
  const clean=text.replace(/\$(\d+)\.(\d{2})/g,(_,d,c)=>String(Number(d)*100+Number(c))).replace(/¢/g,'').replace(/-/g,'−');
  const eq=/(?:\d+|\?)(?:\s*[+−×÷]\s*(?:\d+|\?))*(?:\s*=\s*(?:\d+|\?)(?:\s*[+−×÷]\s*(?:\d+|\?))*)+/g;
  for(const m of clean.matchAll(eq)){
    if(m[0].includes('?'))continue;
    const values=m[0].split('=').map(arithmetic);
    assert.ok(values.every(v=>v===values[0]),'False equation: '+m[0]+' in: '+text);
  }
}
function oracle(fid,p){
  const amounts=moneyIn(p.html);
  switch(fid){
    case 'ch10-make1': return 100-centsOf(p.html);
    case 'ch10-count': return p.visual.coins.reduce((s,c)=>s+c,0);
    case 'ch10-convert': return p.html.includes('is how many cents')?amounts[0]:Number(p.html.match(/(\d+)¢ =/)[1])%100;
    case 'ch10-change': return 100-centsOf(p.html);
    case 'ch10-change-big': return amounts[1]-amounts[0];
    case 'ch10-compare': return p.html.includes('is more')?Math.max(...amounts):Math.min(...amounts);
    case 'ch10-add-coins': return p.visual.coins.reduce((s,c)=>s+c,0);
    case 'ch10-add': return amounts[0]+amounts[1];
    case 'ch10-sub-coins': return amounts[0]-amounts[1];
    case 'ch10-sub': return amounts[0]-amounts[1];
    case 'ch11-parts': return p.html.includes('equal parts is the shape')?p.visual.parts:p.visual.shaded;
    case 'ch11-name24': case 'ch11-name': case 'ch11-unit': return p.visual.shaded+'/'+p.visual.parts;
    case 'ch11-count-unit': return String(p.visual.parts);
    case 'ch11-shade': return String(p.shadeTarget);
    case 'ch11-whole': return (p.visual.parts-p.visual.shaded)+'/'+p.visual.parts;
    case 'ch11-whole-count': return String(p.visual.parts-p.visual.shaded);
    case 'ch11-compare': case 'ch11-between': return null; /* cross-checked below from the two candidate fractions */
    default: throw new Error('No M2 oracle for '+fid);
  }
}

test('chapter 10: 30000 generated money problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch10-'))){
    for(let i=0;i<3000;i++){
      const p=f.gen(),expected=oracle(fid,p);count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid');
      const answerCents=p.moneyText?moneyIn(p.answer)[0]:Number(p.answer);
      assert.equal(answerCents,expected,fid+': '+p.html.replace(/<[^>]+>/g,' ')+' -> '+p.answer);
      if(p.moneyText)assert.equal(p.answer,fmt(expected),fid+' formatting');
      if(p.choices)assert.ok(p.choices.length>=2&&p.choices.length<=4,fid+' choice count');
      verifyMoneyEquations(p.explain);verifyMoneyEquations(p.guide||'');
      assert.ok(expected>=0&&expected<=2000,fid+' within chapter scope');
    }
  }
  assert.equal(count,30000);
});

test('chapter 10: mission order, locks, and camp growth follow the new chapter',()=>{
  const a=load();a.Settings.unlockAll=false;const p=a.profile;
  assert.equal(a.Camp.isChapterUnlocked(p,'ch10'),false);
  for(const t of a.TARGETS.filter(t=>t.chapter==='ch8'||t.chapter==='ch9'))p.targets[t.id]={done:true};
  assert.equal(a.Camp.isChapterUnlocked(p,'ch10'),true);
  const byId=id=>a.TARGETS.find(t=>t.id===id);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch10-making-1')),true);
  assert.equal(a.Camp.isTargetUnlocked(p,byId('ch10-counting')),false);
  a.Settings.unlockAll=true;
  a.Engine.start('ch10-change');
  assert.deepEqual(a.Engine.steps.slice(0,3).map(s=>s.type).join(','),'demo,demo2,controls');
  while(!a.Engine.steps[a.Engine.idx].problem)a.Engine.next();
  for(let i=0;i<6;i++){solve(a,a.Engine.steps[a.Engine.idx]);a.Engine.next();}
  a.Engine.renderDone(a.doc.getElementById('mission-body'));
  assert.equal(p.targets['ch10-change'].done,true);
  assert.ok(p.camp.post>=1,'Trading Post grows after a money mission');
});

test('chapter 10: money entry answers are cents that display as dollars',()=>{
  const a=load();
  for(let i=0;i<200;i++){
    const p=a.FAMILIES['ch10-add'].gen();
    assert.equal(p.answerText,fmt(Number(p.answer)));
    assert.ok(Number(p.answer)<=1000,'adding stays within $10');
    const s=a.FAMILIES['ch10-sub'].gen();
    assert.ok(Number(s.answer)>=0&&Number(s.answer)<=1000,'subtracting stays within $10');
  }
});

function verifyFracEquations(text){
  const clean=text.replace(/-/g,'−');
  const eq=/(?:\d+|\?)(?:\s*[+−×÷/]\s*(?:\d+|\?))*(?:\s*=\s*(?:\d+|\?)(?:\s*[+−×÷/]\s*(?:\d+|\?))*)+/g;
  for(const m of clean.matchAll(eq)){
    if(m[0].includes('?'))continue;
    const values=m[0].split('=').map(arithmetic);
    assert.ok(values.every(v=>Math.abs(v-values[0])<1e-9),'False equation: '+m[0]+' in: '+text);
  }
}
const fracVal=s=>{const[a,b]=s.split('/').map(Number);return a/b;};

test('chapter 11: 30000 generated fraction problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch11-'))){
    for(let i=0;i<3000;i++){
      const p=f.gen();count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid: '+JSON.stringify(p).slice(0,160));
      if(fid==='ch11-compare'){
        assert.equal(p.choices.length,2);
        const[c1,c2]=p.choices.map(fracVal),want=p.html.includes('larger')?Math.max(c1,c2):Math.min(c1,c2);
        assert.equal(fracVal(p.answer),want,fid+' picked the wrong fraction');
      }else if(fid==='ch11-between'){
        const bounds=[...p.html.matchAll(/1\/(\d+)/g)].map(m=>Number(m[1]));
        assert.ok(fracVal(p.answer)<1/Math.min(...bounds)&&fracVal(p.answer)>1/Math.max(...bounds),fid+' answer not between');
        assert.equal(new Set(p.choices).size,4);
      }else{
        assert.equal(String(p.answer),String(oracle(fid,p)),fid+': '+p.html.replace(/<[^>]+>/g,' '));
      }
      if(p.choices)assert.ok(p.choices.includes(p.answer),fid+' answer among choices');
      verifyFracEquations(p.explain);verifyFracEquations(p.guide||'');
    }
  }
  assert.equal(count,30000);
});

test('chapter 11: shade-it-yourself accepts exactly the target count',()=>{
  const a=load();a.Settings.unlockAll=true;
  a.Engine.start('ch11-writing');
  while(!(a.Engine.steps[a.Engine.idx].problem&&a.Engine.steps[a.Engine.idx].problem.kind==='shade'))a.Engine.next();
  const s=a.Engine.steps[a.Engine.idx],pr=s.problem,target=pr.shadeTarget;
  assert.ok(target>=1&&target<pr.parts);
  a.Engine.render();
  const body=a.doc.getElementById('mission-body');
  const segs=body.querySelectorAll('.frac-seg');assert.equal(segs.length,pr.parts);
  for(let i=0;i<target;i++)segs[i].onclick();
  const check=[...body.querySelectorAll('button')].find(b=>b.textContent==='Check my coloring');
  check.onclick();assert.equal(s.solved,true);
  assert.ok(body.querySelector('.feedback').textContent.startsWith('🎉'));
});

test('chapter 11: chapter unlocks after money and grove grows with completions',()=>{
  const a=load();a.Settings.unlockAll=false;const p=a.profile;
  assert.equal(a.Camp.isChapterUnlocked(p,'ch11'),false);
  for(const t of a.TARGETS.filter(t=>t.chapter!=='ch11'&&t.chapter!=='ch12'&&t.chapter!=='ch13'&&t.chapter!=='ch14'&&t.chapter!=='ch15'))p.targets[t.id]={done:true};
  assert.equal(a.Camp.isChapterUnlocked(p,'ch11'),true);
  p.targets['ch11-halves']={done:true};a.Camp.refreshStages(p);
  assert.ok(p.camp.grove>=1,'Picnic Grove grows after a fractions mission');
});

test('rewards: field guide, festival meter, and chapter activities motivate completion',()=>{
  const a=load();const p=a.profile;
  assert.equal(a.Camp.critterList(p).length,41);
  assert.equal(a.Camp.critterList(p).filter(c=>c.found).length,0);
  a.Camp.renderHub(p);
  assert.ok(a.doc.getElementById('festival-meter').textContent.includes('0 of 37'));
  assert.ok(a.doc.getElementById('critter-row').textContent.includes('none yet'));
  a.Camp.renderGuide(p);
  assert.equal(a.doc.getElementById('guide-list').children.length,41);
  assert.ok(a.doc.getElementById('guide-summary').textContent.includes('0 of 41'));
  // activities locked until their chapter is complete
  a.Yard.renderActivities(p);
  const acts=a.doc.getElementById('chapter-activities');
  assert.ok(acts.textContent.includes('Finish every Money mission'));
  assert.ok(acts.textContent.includes('Finish every Fractions mission'));
  // finish ch10 -> chipmunk + friends met, checkout opens and accepts exact change
  for(const t of a.TARGETS.filter(t=>t.chapter==='ch10'))p.targets[t.id]={done:true};
  assert.equal(a.Camp.critterList(p).filter(c=>c.found).length,6);
  a.Camp.renderHub(p);
  assert.ok(a.doc.getElementById('critter-row').textContent.includes('🐿️'));
  a.Yard.checkout=null;a.Yard.renderActivities(p);
  const box=a.doc.getElementById('chapter-activities');
  assert.ok(box.textContent.includes('Trading Post checkout'));
  const c=a.Yard.checkout;let need=c.paid-c.price;
  for(const v of [25,10,5,1]){ let rest=need; const btn=[...box.querySelectorAll('button')].find(b=>b.textContent===v+'¢'); while(rest>=v){ btn.onclick(); rest-=v; } need=rest; }
  [...box.querySelectorAll('button')].find(b=>b.textContent==='Give change').onclick();
  assert.equal(a.Yard.checkout.served,1);
  // finish everything -> festival ready
  for(const t of a.TARGETS)p.targets[t.id]={done:true};
  a.Camp.renderHub(p);
  assert.ok(a.doc.getElementById('festival-meter').textContent.includes('ready for the Camp Festival'));
  assert.equal(a.Camp.critterList(p).filter(c=>c.found).length,41);
});
