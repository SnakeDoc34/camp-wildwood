/* Camp Wildwood — Milestone 1 content: 12 skill targets + parameterized problem families */
'use strict';

function mcqChoices(answer, distractors){
  const set=new Set([String(answer)]), out=[String(answer)];
  for(const d of R.shuffle(distractors.map(String))){ if(out.length>=4) break; if(!set.has(d)){ set.add(d); out.push(d); } }
  let k=3;
  while(out.length<4){ const d=String(Number(answer)+k); k++; if(!set.has(d)){ set.add(d); out.push(d); } }
  return R.shuffle(out);
}
function entryKeys(a,b){ return a+'|'+b; }

/* ================= PROBLEM FAMILIES ================= */
window.FAMILIES = {
  /* --- Ch 8: adding ones, bridge through ten: 459 + 6 = 460 + __ --- */
  'ch8-equiv-add-ones':{ gen(){
    const a=R.int(1,9)*100 + R.int(0,9)*10 + 9, b=R.int(2,9), ans=b-1;
    return { html:a+' + '+b+' = '+(a+1)+' + <span class="blank">?</span>', answer:String(ans),
      choices:mcqChoices(ans,[b,b+1,ans+1,ans+2]),
      hint:'Make ten first: '+a+' needs 1 to reach '+(a+1)+'. Where did that 1 come from?',
      explain:a+' + '+b+' = '+(a+1)+' + '+ans+' = '+(a+b)+'. Split '+b+' into 1 and '+ans+'.',
      speak:a+' plus '+b+' equals '+(a+1)+' plus what?', key:entryKeys(a,b),
      guide:'First: '+a+' needs 1 more to make '+(a+1)+'. Take that 1 from '+b+'.' };
  }},
  'ch8-add-ones':{ gen(){
    const a=R.int(1,9)*100 + R.int(0,9)*10 + 9, b=R.int(2,9);
    return { html:a+' + '+b+' = <span class="blank">?</span>', answer:String(a+b), choices:null,
      hint:'Bridge through '+(a+1)+': '+(a+1)+' + '+(b-1)+'.',
      explain:(a+1)+' + '+(b-1)+' = '+(a+b)+'.', speak:a+' plus '+b+' equals what?', key:'c'+entryKeys(a,b) };
  }},
  /* --- Ch 8: adding tens: 360 + 80 = __ + 40 --- */
  'ch8-equiv-add-tens':{ gen(){
    const a=R.int(11,99)*10, b=R.int(2,9)*10, c=b/2, ans=a+b-c;
    return { html:a+' + '+b+' = <span class="blank">?</span> + '+c, answer:String(ans),
      choices:mcqChoices(ans,[a+b,a,c]),
      hint:'Move '+c+' over to make a friendly hundred: '+a+' + '+c+' = '+(a+c)+'.',
      explain:a+' + '+b+' = '+(a+c)+' + '+c+' = '+(a+b)+'.',
      speak:a+' plus '+b+' equals what plus '+c+'?', key:entryKeys(a,b) };
  }},
  'ch8-add-tens':{ gen(){
    const a=R.int(11,99)*10, b=R.int(2,9)*10;
    return { html:a+' + '+b+' = <span class="blank">?</span>', answer:String(a+b), choices:null,
      hint:'Add the tens: '+(a/10)+' tens + '+(b/10)+' tens = '+((a+b)/10)+' tens.',
      explain:(a/10)+' tens + '+(b/10)+' tens = '+((a+b)/10)+' tens = '+(a+b)+'.',
      speak:a+' plus '+b+' equals what?', key:'c'+entryKeys(a,b) };
  }},
  /* --- Ch 8: making 100 --- */
  'ch8-make100':{ gen(){
    const a=R.int(11,99); if(a%10===0) return window.FAMILIES['ch8-make100'].gen();
    const ans=100-a;
    return { html:a+' + <span class="blank">?</span> = 100', answer:String(ans),
      choices:mcqChoices(ans,[ans+10,ans-10,100-a+1]),
      hint:'What does '+a+' need to reach 100?',
      explain:a+' + '+ans+' = 100. Hundred-pairs!',
      speak:a+' plus what equals 100?', key:String(a),
      guide:'Count up from '+a+' to 100.' };
  }},
  /* --- Ch 8: adding 97/98/99 (compensation) --- */
  'ch8-add-comp':{ gen(){
    const a=R.int(100,999), k=R.choice([97,98,99]), back=100-k, ans=a+k;
    return { html:a+' + '+k+' = <span class="blank">?</span>', answer:String(ans), choices:null,
      hint:'Add 100 to get '+(a+100)+', then take back the extra '+back+'.',
      explain:a+' + 100 = '+(a+100)+', minus '+back+' = '+ans+'. Compensation!',
      speak:a+' plus '+k+' equals what?', key:entryKeys(a,k),
      guide:'Step 1: add 100 → '+(a+100)+'. Step 2: undo the extra '+back+'.' };
  }},
  /* --- Ch 8: subtracting ones/tens with bridging --- */
  'ch8-sub-bridge':{ gen(){
    const ones=R.int(1,8), a=R.int(1,9)*100+R.int(0,9)*10+ones, b=R.int(ones+1,9);
    return { html:a+' − '+b+' = <span class="blank">?</span>', answer:String(a-b), choices:null,
      hint:'Jump back '+ones+' to '+(a-ones)+', then back '+(b-ones)+' more.',
      explain:a+' − '+ones+' = '+(a-ones)+', then − '+(b-ones)+' = '+(a-b)+'.',
      speak:a+' minus '+b+' equals what?', key:entryKeys(a,b),
      guide:'First jump back to the friendly number '+(a-ones)+'.' };
  }},
  'ch8-sub-tens':{ gen(){
    const a=R.int(11,99)*10, b=R.int(2,9)*10;
    return { html:a+' − '+b+' = <span class="blank">?</span>', answer:String(a-b), choices:null,
      hint:'Subtract the tens: '+(a/10)+' tens − '+(b/10)+' tens.',
      explain:(a/10)+' tens − '+(b/10)+' tens = '+((a-b)/10)+' tens = '+(a-b)+'.',
      speak:a+' minus '+b+' equals what?', key:'t'+entryKeys(a,b) };
  }},
  /* --- Ch 8: subtracting 97/98/99 (compensation flips) --- */
  'ch8-sub-comp':{ gen(){
    const a=R.int(150,999), k=R.choice([97,98,99]), back=100-k, ans=a-k;
    return { html:a+' − '+k+' = <span class="blank">?</span>', answer:String(ans), choices:null,
      hint:'Subtract 100 to get '+(a-100)+', then give back the extra '+back+'.',
      explain:a+' − 100 = '+(a-100)+', plus '+back+' = '+ans+'. The fix flips!',
      speak:a+' minus '+k+' equals what?', key:entryKeys(a,k),
      guide:'Step 1: subtract 100 → '+(a-100)+'. Step 2: return the extra '+back+'.' };
  }},
  /* --- Ch 9: groups of 3 --- */
  'ch9-groups3':{ gen(){
    const g=R.int(2,10), ans=3*g;
    return { html:g+' sticks, 3 marshmallows on each.<br>How many marshmallows?', answer:String(ans),
      choices:mcqChoices(ans,[ans+3,ans-3,3*(g+1)]),
      visual:{type:'groups',groups:g,per:3},
      hint:'Count by threes, '+g+' times.',
      explain:g+' groups of 3: '+Array.from({length:g},(_,i)=>3*(i+1)).join(', ')+' = '+ans+'.',
      speak:g+' sticks with 3 marshmallows each. How many in all?', key:String(g) };
  }},
  /* --- Ch 9: ×3 facts --- */
  'ch9-mult3':{ gen(){
    const k=R.int(1,10), flip=R.f()<0.5, ans=3*k;
    const q=flip? '3 × '+k : k+' × 3';
    return { html:q+' = <span class="blank">?</span>', answer:String(ans),
      choices:mcqChoices(ans,[ans+3,ans-3,3*(k+1)]),
      hint:'Skip-count by 3, '+k+' jumps.',
      explain:k+' threes = '+ans+'.',
      speak:q.replace('×','times')+' equals what?', key:(flip?'a':'b')+k };
  }},
  /* --- Ch 9: ÷3 guided dealing --- */
  'ch9-div3-deal':{ gen(){
    const g=R.int(2,9), total=3*g;
    return { kind:'deal', total, groups:3, answer:String(g),
      html:'Deal '+total+' equally. Tap the pile!', hint:'One for each group, round and round.',
      explain:total+' shared among 3 groups = '+g+' each. '+total+' ÷ 3 = '+g+'.',
      speak:'Share '+total+' into 3 equal groups. How many in each?', key:'d'+g };
  }},
  'ch9-div3a':{ gen(){
    const g=R.int(2,10), total=3*g;
    return { html:total+' marshmallows, 3 on each stick.<br>How many sticks?', answer:String(g),
      choices:mcqChoices(g,[g+1,g-1,total]),
      hint:'How many 3s fit in '+total+'? Count by 3s.',
      explain:total+' ÷ 3 = '+g+' sticks.',
      speak:total+' marshmallows, 3 per stick. How many sticks?', key:'a'+g };
  }},
  'ch9-div3b':{ gen(){
    const g=R.int(2,10), total=3*g;
    return { html:'Share '+total+' cones equally among 3 groups.<br>Each group gets…', answer:String(g),
      choices:mcqChoices(g,[g+1,g-1,total]),
      hint:'Deal them out: one per group, round and round.',
      explain:total+' ÷ 3 = '+g+' per group.',
      speak:'Share '+total+' among 3 groups. How many in each?', key:'b'+g };
  }},
  /* --- Ch 9: groups of 4 --- */
  'ch9-groups4':{ gen(){
    const g=R.int(2,10), ans=4*g;
    return { html:g+' tents, 4 campers in each.<br>How many campers?', answer:String(ans),
      choices:mcqChoices(ans,[ans+4,ans-4,4*(g+1)]),
      visual:{type:'groups',groups:g,per:4},
      hint:'Count by fours, '+g+' times.',
      explain:g+' groups of 4 = '+ans+'.',
      speak:g+' tents with 4 campers each. How many in all?', key:String(g) };
  }},
  'ch9-mult4':{ gen(){
    const k=R.int(1,10), flip=R.f()<0.5, ans=4*k;
    const q=flip? '4 × '+k : k+' × 4';
    return { html:q+' = <span class="blank">?</span>', answer:String(ans),
      choices:mcqChoices(ans,[ans+4,ans-4,4*(k+1)]),
      hint:'Skip-count by 4, '+k+' jumps.',
      explain:k+' fours = '+ans+'.',
      speak:q.replace('×','times')+' equals what?', key:(flip?'a':'b')+k };
  }},
  'ch9-div4-deal':{ gen(){
    const g=R.int(2,8), total=4*g;
    return { kind:'deal', total, groups:4, answer:String(g),
      html:'Deal '+total+' equally. Tap the pile!', hint:'One for each group, round and round.',
      explain:total+' shared among 4 groups = '+g+' each. '+total+' ÷ 4 = '+g+'.',
      speak:'Share '+total+' into 4 equal groups. How many in each?', key:'d'+g };
  }},
  'ch9-div4a':{ gen(){
    const g=R.int(2,10), total=4*g;
    return { html:total+' balls, 4 in each bag.<br>How many bags?', answer:String(g),
      choices:mcqChoices(g,[g+1,g-1,total]),
      hint:'How many 4s fit in '+total+'?',
      explain:total+' ÷ 4 = '+g+' bags.',
      speak:total+' balls, 4 per bag. How many bags?', key:'a'+g };
  }},
  'ch9-div4b':{ gen(){
    const g=R.int(2,10), total=4*g;
    return { html:'Share '+total+' apples equally among 4 baskets.<br>Each basket gets…', answer:String(g),
      choices:mcqChoices(g,[g+1,g-1,total]),
      hint:'Deal them out: one per basket, round and round.',
      explain:total+' ÷ 4 = '+g+' per basket.',
      speak:'Share '+total+' among 4 baskets. How many in each?', key:'b'+g };
  }},
  /* --- Ch 9: near-facts: 6 × 4 is __ less than 7 × 4 --- */
  'ch9-near':{ gen(){
    const n=R.int(2,9), k=R.choice([3,4]);
    return { html:n+' × '+k+' is <span class="blank">?</span> less than '+(n+1)+' × '+k+'.', answer:String(k),
      choices:mcqChoices(k,[1,n,k+1]),
      hint:'One more group of '+k+' adds exactly '+k+'.',
      explain:(n+1)+' × '+k+' = '+(n*k+k)+', and '+n+' × '+k+' = '+n*k+'. Difference: '+k+'.',
      speak:n+' times '+k+' is how much less than '+(n+1)+' times '+k+'?', key:entryKeys(n,k) };
  }},
};

/* ================= TARGETS ================= */
window.TARGETS = [
 { id:'ch8-adding-ones', chapter:'ch8', title:'Adding Ones', art:'🔢', blurb:'Bridge through ten to add ones.',
   audio:'audio/m1-ch8-adding-ones.mp3',
   demoCaption:'Let’s add ones the smart way: make ten first. 459 trail markers, and 6 more arrive. 459 needs 1 more to reach 460. Split 6 into 1 and 5. 459 + 1 = 460, plus 5 more = 465. The ten did the heavy lifting!',
   demoVisual:{kind:'bridge',a:459,b:6},
   controls:'Tap a letter to choose, or tap the number pad and then Check. You can tap Hint any time.',
   guidedFamilies:['ch8-equiv-add-ones'], families:['ch8-equiv-add-ones','ch8-add-ones'], adventureFamilies:['ch8-equiv-add-ones','ch8-add-tens'] },
 { id:'ch8-adding-tens', chapter:'ch8', title:'Adding Tens', art:'🎯', blurb:'Tens stick together.',
   audio:'audio/m1-ch8-adding-tens.mp3',
   demoCaption:'Adding tens is like adding ones, one place over. 360 + 80. 80 is 8 tens. 6 tens + 8 tens = 14 tens = 140. 300 + 140 = 440. Tens stick together!',
   demoVisual:{kind:'shift',a:360,b:80,move:40},
   controls:'Tap a letter to choose, or use the number pad and Check.',
   guidedFamilies:['ch8-equiv-add-tens'], families:['ch8-equiv-add-tens','ch8-add-tens'], adventureFamilies:['ch8-equiv-add-tens','ch8-make100'] },
 { id:'ch8-making-100', chapter:'ch8', title:'Making 100', art:'💯', blurb:'Find the hundred-pair.',
   audio:'audio/m1-ch8-making-100.mp3',
   demoCaption:'Some pairs are best friends: they make 100. 70 + 30. 60 + 40. When you see a number, ask: what does it need to reach 100? 96 needs 4. Spotting hundred-pairs makes big addition easy.',
   demoVisual:{kind:'hundred',a:67},
   controls:'Use the number pad to type the missing number, then Check.',
   guidedFamilies:['ch8-make100'], families:['ch8-make100'], adventureFamilies:['ch8-make100','ch8-add-comp'] },
 { id:'ch8-adding-98', chapter:'ch8', title:'Adding 97, 98, 99', art:'🧮', blurb:'Add 100, then fix it.',
   audio:'audio/m1-ch8-adding-98.mp3',
   demoCaption:'Adding 98? Add 100 instead — it’s easy — then fix it. 367 + 98. Add 100: 467. But we added 2 too many, so take 2 back: 465. Add the round number, then undo the extra. That’s called compensation.',
   demoVisual:{kind:'comp',a:367,k:98,op:'+',fix:'− 2',result:465},
   controls:'Type the total with the number pad, then Check. Watch the two steps!',
   guidedFamilies:['ch8-add-comp'], families:['ch8-add-comp'], adventureFamilies:['ch8-add-comp','ch8-sub-comp'] },
 { id:'ch8-subtracting', chapter:'ch8', title:'Subtracting Ones & Tens', art:'📉', blurb:'Jump back to friendly numbers.',
   audio:'audio/m1-ch8-subtracting.mp3',
   demoCaption:'Subtracting? Jump back on the number line. 463 − 7. Jump back 3 to land on 460, then jump 4 more to 456. Land on friendly numbers first, then finish the jump.',
   demoVisual:{kind:'numberline',a:463,b:7},
   controls:'Type the answer with the number pad, then Check.',
   guidedFamilies:['ch8-sub-bridge'], families:['ch8-sub-bridge','ch8-sub-tens'], adventureFamilies:['ch8-sub-bridge','ch8-sub-comp'] },
 { id:'ch8-subtracting-98', chapter:'ch8', title:'Subtracting 97, 98, 99', art:'🔄', blurb:'The fix flips!',
   audio:'audio/m1-ch8-subtracting-98.mp3',
   demoCaption:'Subtracting 98 works like adding it, but the fix flips. 367 − 98. Subtract 100: 267. We took away 2 too many, so give 2 back: 269. Subtract the round number, then return the extra.',
   demoVisual:{kind:'comp',a:367,k:98,op:'-',fix:'+ 2',result:269},
   controls:'Type the answer with the number pad, then Check. Remember: the fix flips!',
   guidedFamilies:['ch8-sub-comp'], families:['ch8-sub-comp'], adventureFamilies:['ch8-sub-comp','ch8-add-comp'] },

 { id:'ch9-groups-3', chapter:'ch9', title:'Groups of 3', art:'🍡', blurb:'Count equal groups of three.',
   audio:'audio/m1-ch9-groups-3.mp3',
   demoCaption:'Equal groups are the heart of multiplication. 4 sticks, 3 marshmallows on each stick. 4 groups of 3. Count by threes: 3, 6, 9, 12. 12 marshmallows in all.',
   demoVisual:{kind:'groups',groups:4,per:3},
   controls:'Tap a letter to choose. Count the groups!',
   guidedFamilies:['ch9-groups3'], families:['ch9-groups3'], adventureFamilies:['ch9-groups3','ch9-mult3'] },
 { id:'ch9-multiply-3', chapter:'ch9', title:'Multiplication Facts of 3', art:'✖️', blurb:'Master the threes.',
   audio:'audio/m1-ch9-multiply-3.mp3',
   demoCaption:'3 × 5 means 5 groups of 3. Count: 3, 6, 9, 12, 15. 3 × 5 = 15. Skip-counting by threes is your multiplication engine.',
   demoVisual:{kind:'skip',seq:[3,6,9,12,15],result:15,label:'3 × 5'},
   controls:'Tap a letter, or type the answer and Check.',
   guidedFamilies:['ch9-mult3'], families:['ch9-mult3'], adventureFamilies:['ch9-mult3','ch9-near'] },
 { id:'ch9-divide-3', chapter:'ch9', title:'Division by 3', art:'🍎', blurb:'Share equally — two meanings.',
   audio:'audio/m1-ch9-divide-3.mp3',
   demoCaption:'Division is sharing equally — or asking how many groups. 27 marshmallows, 3 on each stick. How many sticks? Deal them out by threes: 3, 6, 9, 12, 15, 18, 21, 24, 27 — 9 sticks. 27 ÷ 3 = 9.',
   demoVisual:{kind:'share',total:27,groups:3,per:9},
   controls:'Tap the pile to deal one treat to each group. When the pile is empty, type how many are in each group.',
   guidedFamilies:['ch9-div3-deal'], families:['ch9-div3a','ch9-div3b'], adventureFamilies:['ch9-div3a','ch9-div4a'] },
 { id:'ch9-groups-4', chapter:'ch9', title:'Groups of 4', art:'⛺', blurb:'Count equal groups of four.',
   audio:'audio/m1-ch9-groups-4.mp3',
   demoCaption:'Now groups of four. 3 tents, 4 campers in each tent. 4, 8, 12. 3 groups of 4 = 12. Bigger groups, same idea.',
   demoVisual:{kind:'groups',groups:3,per:4},
   controls:'Tap a letter to choose. Count the groups!',
   guidedFamilies:['ch9-groups4'], families:['ch9-groups4'], adventureFamilies:['ch9-groups4','ch9-mult4'] },
 { id:'ch9-multiply-4', chapter:'ch9', title:'Multiplication Facts of 4', art:'4️⃣', blurb:'Master the fours.',
   audio:'audio/m1-ch9-multiply-4.mp3',
   demoCaption:'4 × 6: 6 groups of 4. 4, 8, 12, 16, 20, 24. 4 × 6 = 24. And 6 × 4 is the same — the groups just trade places.',
   demoVisual:{kind:'skip',seq:[4,8,12,16,20,24],result:24,label:'4 × 6'},
   controls:'Tap a letter, or type the answer and Check.',
   guidedFamilies:['ch9-mult4'], families:['ch9-mult4'], adventureFamilies:['ch9-mult4','ch9-near'] },
 { id:'ch9-divide-4', chapter:'ch9', title:'Division by 4', art:'🧺', blurb:'Share equally — two meanings.',
   audio:'audio/m1-ch9-divide-4.mp3',
   demoCaption:'32 soccer balls, 4 to a bag. How many bags? Count by fours: 4, 8, 12, 16, 20, 24, 28, 32 — 8 bags. 32 ÷ 4 = 8. Division undoes multiplication.',
   demoVisual:{kind:'share',total:32,groups:4,per:8},
   controls:'Tap the pile to deal one to each group. When empty, type how many are in each group.',
   guidedFamilies:['ch9-div4-deal'], families:['ch9-div4a','ch9-div4b'], adventureFamilies:['ch9-div4a','ch9-div3a'] },
];
