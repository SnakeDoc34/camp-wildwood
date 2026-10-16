/* Milestone 3: independent oracles for Chapters 12-15 and the Festival.
   Answers are re-derived from the displayed visuals/questions, and the
   renderers are checked for honesty (the picture must match the data). */
const test=require('node:test'),assert=require('node:assert/strict');
const {load,solve}=require('./helpers.cjs');
const fmtT=(h,m)=>h+':'+String(m).padStart(2,'0');

test('renderers draw exactly what the data says',()=>{
  const a=load();
  const clock=a.clockSVG(3,25);
  assert.ok(clock.includes('aria-label="Clock showing 3:25"'));
  const rad=x=>(x-90)*Math.PI/180,ma=25*6,ha=3*30+25*0.5;
  assert.ok(clock.includes((80+52*Math.cos(rad(ma))).toFixed(1)),'minute hand angle exact');
  assert.ok(clock.includes((80+36*Math.cos(rad(ha))).toFixed(1)),'hour hand angle exact');
  const bars=a.barGraphSVG([{label:'A',value:3},{label:'B',value:6}]);
  const heights=[...bars.matchAll(/<rect x="\d+" y="[\d.]+" width="40" height="([\d.]+)"/g)].map(m=>Number(m[1]));
  assert.equal(heights[1]/heights[0],2,'bar heights proportional to values');
  const picto=a.pictoSVG([{label:'A',value:6},{label:'B',value:4}],'🐟',2);
  assert.equal((picto.match(/🐟/g)||[]).length,7,'rows show 3+2 symbols; key line and aria-label name the symbol once each');
  const frac=a.fractionSVG({parts:4,shaded:1,shape:'bar'});
  assert.ok(frac.includes('aria-label="1 of 4 equal parts shaded"'));
});

test('chapter 12: 28000 time problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch12-'))){
    for(let i=0;i<4000;i++){
      const p=f.gen();count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid: '+JSON.stringify(p).slice(0,160));
      if(fid==='ch12-read'||fid==='ch12-read5')assert.equal(p.answer,fmtT(p.visual.h,p.visual.min),fid);
      if(fid==='ch12-past')assert.equal(Number(p.answer),p.visual.min,fid);
      if(fid==='ch12-elapsed'){
        const times=[...p.html.matchAll(/(\d+):(\d{2})/g)].map(m=>Number(m[1])*60+Number(m[2]));
        let diff=times[1]-times[0];if(diff<=0)diff+=12*60;
        assert.equal(Number(p.answer),diff,fid+' displayed times vs answer');
      }
      if(fid==='ch12-endtime'){
        const st=p.html.match(/starts at (\d+):(\d{2})/),dur=Number(p.html.match(/lasts (\d+) minutes/)[1]);
        let end=(Number(st[1])*60+Number(st[2]))+dur,h=Math.floor(end/60);if(h>12)h-=12;
        assert.equal(p.answer,fmtT(h,end%60),fid);
      }
      if(fid==='ch12-ampm')assert.ok(['a.m.','p.m.'].includes(p.answer));
      if(fid==='ch12-ampm-clock'){
        assert.ok(p.answer.startsWith(fmtT(p.visual.h,p.visual.min)+' '),fid+' time matches clock');
        const morning=/breakfast|bus to school|Waking up|Almost time for lunch/.test(p.html);
        assert.equal(p.answer.endsWith('a.m.'),morning,fid+' suffix matches activity: '+p.html);
      }
    }
  }
  assert.equal(count,28000);
});

test('chapter 13: 24000 capacity problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  const UNIT_FIT={'a swimming pool':'gallons','a bathtub':'gallons','a jug of milk from the store':'gallons','a fish tank':'gallons','a big pot of soup':'quarts','a pitcher of lemonade':'quarts','a can of paint':'quarts','a bottle of water':'liters','a canteen on a hike':'liters','a big soda bottle':'liters'};
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch13-'))){
    for(let i=0;i<4000;i++){
      const p=f.gen();count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid');
      if(fid==='ch13-amount'){
        const want=p.visual.a.level===p.visual.b.level?'They have the same':(p.visual.a.level>p.visual.b.level?'The left jug':'The right jug');
        assert.equal(p.answer,want,fid);
      }
      if(fid==='ch13-capacity'){
        const nums=[...p.html.matchAll(/holds (\d+) cups/g)].map(m=>Number(m[1]));
        const names=[...p.html.matchAll(/(a bucket|a pot|a watering can|a fish tank|a mug|a bathtub|a teapot|a water bottle)/g)].map(m=>m[1]);
        assert.equal(p.answer,nums[0]>nums[1]?names[0]:names[1],fid);
      }
      if(fid==='ch13-unit-fit'){
        const item=Object.keys(UNIT_FIT).find(k=>p.html.includes(k));
        assert.equal(p.answer,UNIT_FIT[item],fid+': '+item);
      }
      if(fid==='ch13-convert'){
        const n=Number(p.html.match(/(\d+) (gallons|quarts)/)[1]),unit=p.html.match(/(\d+) (gallons|quarts)/)[2];
        assert.equal(Number(p.answer),unit==='gallons'?n*4:n/4,fid);
      }
      if(fid==='ch13-read-jug')assert.equal(Number(p.answer),p.visual.level/100*Number(p.html.match(/holds (\d+) liters/)[1]),fid);
      if(fid==='ch13-fill'){
        const nums=[...p.html.matchAll(/(\d+) liters/g)].map(m=>Number(m[1]));
        assert.equal(Number(p.answer),nums[0]-nums[1],fid);
      }
    }
  }
  assert.equal(count,24000);
});

test('chapter 14: 24000 graph problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch14-'))){
    for(let i=0;i<4000;i++){
      const p=f.gen();count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid: '+JSON.stringify(p).slice(0,160));
      const data=p.visual.data;
      if(fid==='ch14-picto-read'||fid==='ch14-bar-read'){
        const d=data.find(x=>p.html.includes('for '+x.label+'?'));
        assert.equal(Number(p.answer),d.value,fid);
      }
      if(fid==='ch14-picto-symbols'){
        const d=data.find(x=>p.html.includes(x.label+' has'));
        assert.equal(Number(p.answer),d.value/p.visual.per,fid);
      }
      if(fid==='ch14-bar-most'){
        const vals=data.map(x=>x.value),extreme=p.html.includes('most')?Math.max(...vals):Math.min(...vals);
        assert.equal(data.find(x=>x.label===p.answer).value,extreme,fid);
      }
      if(fid==='ch14-diff'){
        const m=p.html.match(/does (.+) have than (.+)\?/);
        const big=data.find(x=>x.label===m[1]),small=data.find(x=>x.label===m[2]);
        assert.equal(Number(p.answer),big.value-small.value,fid);
        assert.ok(big.value>small.value,fid+' named order');
      }
      if(fid==='ch14-total')assert.equal(Number(p.answer),p.math.a+p.math.b,fid);
    }
  }
  assert.equal(count,24000);
});

test('chapter 15: 40000 shape problems agree with an independent oracle',()=>{
  const a=load();let count=0;
  const NAMES={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'};
  const SIDE_TABLE={'polygon3':[3,0],'polygon4':[4,0],'polygon6':[6,0],'circle':[0,1],'semicircle':[1,1],'curved-sides':[0,2]};
  for(const[fid,f]of Object.entries(a.FAMILIES).filter(([fid])=>fid.startsWith('ch15-'))){
    for(let i=0;i<4000;i++){
      const p=f.gen();count++;
      assert.ok(a.MathCheck.valid(p),fid+' valid: '+JSON.stringify(p).slice(0,160));
      if(fid==='ch15-open'){
        const want=p.visual.kind==='open'?'Open':'Closed';
        assert.equal(p.answer,want,fid);
      }
      if(fid==='ch15-count-sides'){
        const key=p.visual.kind==='polygon'?'polygon'+p.visual.sides:p.visual.kind;
        const t=SIDE_TABLE[key],want=p.html.includes('straight')?t[0]:t[1];
        assert.equal(Number(p.answer),want,fid+': '+key);
      }
      if(fid==='ch15-name')assert.equal(p.answer,NAMES[p.visual.sides],fid);
      if(fid==='ch15-sides-corners'){
        const name=Object.values(NAMES).find(n=>p.html.includes('a '+n+' have'));
        assert.equal(Number(p.answer),Number(Object.keys(NAMES).find(k=>NAMES[k]===name)),fid);
      }
      if(fid==='ch15-identify')assert.equal(p.answer,p.visual.kind==='quarter'?'quarter-circle':p.visual.kind,fid);
      if(fid==='ch15-combine'){
        if(p.html.includes('semicircle?'))assert.equal(p.answer,'2',fid);
        else assert.equal(Number(p.answer),p.html.includes('semicircles')?2:4,fid);
      }
      if(fid==='ch15-pattern-next'){
        const items=p.visual.items,nameOf=s=>s.kind==='circle'?'circle':NAMES[s.sides];
        assert.equal(p.answer,nameOf(items[6]),fid+' next item identity');
        const seq=items.slice(0,6).map(nameOf);
        const repeats=len=>seq.every((s,i)=>s===seq[i%len]);
        assert.ok(repeats(2)||repeats(3),fid+' shown sequence follows a repeating unit');
        assert.equal(nameOf(items[6]),seq[6%(repeats(2)?2:3)],fid+' next continues the unit');
      }
      if(fid==='ch15-pattern-grow'){
        const sides=p.visual.items.map(s=>s.sides);
        for(let i=1;i<4;i++)assert.equal(sides[i],sides[i-1]+1,fid+' grows by 1');
        assert.equal(p.answer,NAMES[sides[3]+1],fid);
      }
      if(fid==='ch15-solid-name')assert.ok(['cube','sphere','cylinder','cone'].includes(p.answer));
      if(fid==='ch15-solid-attrs'){
        const BANK={'faces does a cube':6,'edges does a cube':12,'corners does a cube':8,'corners does a sphere':0,'corners does a cylinder':0,'flat faces does a cone':1};
        const key=Object.keys(BANK).find(k=>p.html.includes(k));
        assert.equal(Number(p.answer),BANK[key],fid+': '+key);
      }
    }
  }
  assert.equal(count,40000);
});

test('festival: completing all 37 missions opens the Festival with a certificate',()=>{
  const a=load();const p=a.profile;
  assert.equal(a.TARGETS.length,41);
  assert.equal(a.Camp.coreTargets().length,37);
  assert.equal(a.Camp.critterList(p).length,41);
  a.Camp.renderHub(p);
  assert.ok(a.doc.getElementById('festival-meter').textContent.includes('0 of 37'));
  for(const t of a.TARGETS)p.targets[t.id]={done:true,badge:true};
  a.Camp.renderHub(p);
  const fm=a.doc.getElementById('festival-meter');
  assert.ok(fm.textContent.includes('ready for the Camp Festival'));
  const btn=[...fm.querySelectorAll('button')].find(b=>b.textContent.includes('Enter the Camp Festival'));
  assert.ok(btn,'festival button appears when complete');
  btn.onclick();
  const body=a.doc.getElementById('festival-body');
  assert.ok(body.textContent.includes('Camp Wildwood Festival'));
  assert.ok(body.textContent.includes('Ranger Certificate'));
  assert.ok(body.textContent.includes('37 woodland friends')||body.textContent.includes('37'));
  assert.equal(a.Camp.critterList(p).filter(c=>c.found).length,41);
  // chapter gating still chains at the far end
  const a2=load();a2.Settings.unlockAll=false;const p2=a2.profile;
  assert.equal(a2.Camp.isChapterUnlocked(p2,'ch15'),false);
  for(const t of a2.TARGETS.filter(t=>t.chapter!=='ch15'))p2.targets[t.id]={done:true};
  assert.equal(a2.Camp.isChapterUnlocked(p2,'ch15'),true);
});
