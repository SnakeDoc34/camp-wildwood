/* Camp Wildwood — Trailhead: the compact Dimensions Math 2A foundations
   that 2B builds on (place value, number bonds, renaming, first
   multiplication). A bonus ramp: it never gates Chapter 8 or the Festival. */
'use strict';

Object.assign(window.FAMILIES,{
  /* --- Build a number from hundreds, tens, and ones --- */
  'trail-pv-build':{gen(){
    const h=R.int(1,9),t=R.int(0,9),o=R.int(0,9),n=h*100+t*10+o;
    return problem({math:{type:'value',value:n},
      html:'What number is made of '+h+' hundred'+(h>1?'s':'')+', '+t+' ten'+(t===1?'':'s')+', and '+o+' one'+(o===1?'':'s')+'?',answer:String(n),
      choices:mcqChoices(n,[h*100+o*10+t,t*100+h*10+o,n+10,n-10]),answerUnit:'',
      hint:'Hundreds first, then tens, then ones: '+h+'00 + '+t+'0 + '+o+'.',
      guide:'Write the hundreds digit, then the tens digit, then the ones digit.',
      explain:h+' hundreds + '+t+' tens + '+o+' ones = '+n+'.',speak:'What number is that?',key:'pb|'+n});
  }},
  /* --- The value of a digit (the digit must appear exactly once: with a
     repeated digit, like the 8s in 688, two answers would both be right) --- */
  'trail-pv-digit':{gen(){
    const h=R.int(1,9),t=R.int(1,9),o=R.int(0,9);
    if(h===t||t===o||h===o)return this.gen();
    const n=h*100+t*10+o;
    const place=R.choice([['hundreds',h*100,h],['tens',t*10,t],['ones',o,o]].filter(p=>p[2]!==0));
    return problem({math:{type:'value',value:place[1]},
      html:'In the number '+n+', what is the value of the digit '+place[2]+'?',answer:String(place[1]),
      choices:mcqChoices(place[1],[place[2],place[1]*10,place[1]/10]),
      hint:'The digit sits in the '+place[0]+' place. Its place gives its value!',
      guide:'Find where the digit '+place[2]+' is sitting: hundreds, tens, or ones?',
      explain:'The digit '+place[2]+' is in the '+place[0]+' place, so it is worth '+place[1]+'.',
      speak:'What is the value of the digit?',key:'pd|'+n+'|'+place[0]});
  }},
  /* --- Expanded form: find the missing part --- */
  'trail-pv-expand':{gen(){
    const h=R.int(1,9),t=R.int(1,9),o=R.int(1,9),n=h*100+t*10+o;
    const miss=R.choice(['tens','ones','hundreds']);
    const ans=miss==='tens'?t*10:miss==='ones'?o:h*100;
    const shown=n+' = '+(miss==='hundreds'?'__':h*100)+' + '+(miss==='tens'?'__':t*10)+' + '+(miss==='ones'?'__':o);
    return problem({math:{type:'value',value:ans},
      html:shown+'<br>What number is missing?',answer:String(ans),
      choices:mcqChoices(ans,[ans===t*10?t:ans===o?o:h,ans*10,ans+1]),
      hint:'Split '+n+' into hundreds, tens, and ones.',
      guide:n+' = '+h*100+' + '+t*10+' + '+o+'. Which part is missing?',
      explain:'The missing part is '+ans+'.',speak:'What number is missing?',key:'pe|'+n+'|'+miss});
  }},
  /* --- Compare two numbers to 1,000 --- */
  'trail-pv-compare':{gen(){
    let a=R.int(105,998),b=R.int(105,998);while(b===a)b=R.int(105,998);
    const big=Math.max(a,b);
    return problem({math:{type:'text',answer:String(big)},
      html:'Which number is greater: '+a+' or '+b+'?',answer:String(big),choices:R.shuffle([String(a),String(b)]),
      hint:'Compare the hundreds first. If they match, compare the tens, then the ones.',
      guide:'Place value tells you: check hundreds, then tens, then ones.',
      explain:big+' is greater. Compare place by place!',speak:'Which number is greater?',key:'pc|'+a+'|'+b});
  }},
  /* --- Number bonds to 10 and 20 --- */
  'trail-bond10':{gen(){
    const whole=R.choice([10,20]),part=R.int(1,whole-1);
    return problem({math:{type:'subtract',a:whole,b:part},
      html:part+' + ? = '+whole+'<br>What is the missing part?',answer:String(whole-part),choices:null,
      hint:'Number bonds are partners that make the whole. Count on from '+part+' to '+whole+'.',
      guide:'Think of the bond family for '+whole+'.',
      explain:part+' + '+(whole-part)+' = '+whole+'. They are number-bond partners!',
      speak:'What is the missing part?',key:'b1|'+whole+'|'+part});
  }},
  /* --- Number bonds to 100 --- */
  'trail-bond100':{gen(){
    const part=R.f()<.5?R.choice([10,20,30,40,50,60,70,80,90]):R.int(15,85);
    return problem({math:{type:'subtract',a:100,b:part},
      html:part+' + ? = 100<br>What is the missing part?',answer:String(100-part),choices:null,
      hint:'Count up from '+part+' to 100. Bonds to 100 are the secret of making $1 too!',
      guide:'First count to the next ten, then by tens to 100.',
      explain:part+' + '+(100-part)+' = 100.',speak:'What is the missing part?',key:'b2|'+part});
  }},
  /* --- Three-part bonds --- */
  'trail-bond3':{gen(){
    const whole=R.choice([20,30,50,100]),a=R.int(2,whole-8);let b=R.int(2,whole-a-2);
    const ans=whole-a-b;
    return problem({math:{type:'value',value:ans},
      html:a+' + '+b+' + ? = '+whole+'<br>What is the missing part?',answer:String(ans),choices:mcqChoices(ans,[ans+2,ans-2,ans+10]),
      hint:'Add the two parts you know first: '+a+' + '+b+' = '+(a+b)+'. Then find the bond to '+whole+'.',
      guide:'A whole can split into three parts, not just two!',
      explain:a+' + '+b+' = '+(a+b)+', and '+(a+b)+' + '+ans+' = '+whole+'.',
      speak:'What is the missing part?',key:'b3|'+whole+'|'+a+'|'+b});
  }},
  /* --- Adding with renaming --- */
  'trail-add-rename':{gen(){
    let a=R.int(118,799),b=R.int(115,999-a);
    if((a%10)+(b%10)<10||a+b>1000)return this.gen();
    return problem({math:{type:'add',a,b},
      html:a+' + '+b+' = ?',answer:String(a+b),choices:null,
      hint:'Add the ones first. '+(a%10)+' + '+(b%10)+' is 10 or more, so rename: carry a ten!',
      guide:'Ones first, rename if they make a ten, then tens, then hundreds.',
      explain:a+' + '+b+' = '+(a+b)+'. The ones made a new ten — that is renaming.',
      speak:'What is '+a+' plus '+b+'?',key:'ar|'+a+'|'+b});
  }},
  /* --- Subtracting with renaming --- */
  'trail-sub-rename':{gen(){
    let a=R.int(205,989),b=R.int(112,a-50);
    if((a%10)>=(b%10))return this.gen();
    return problem({math:{type:'subtract',a,b},
      html:a+' − '+b+' = ?',answer:String(a-b),choices:null,
      hint:'Not enough ones? Rename: trade 1 ten for 10 ones, then subtract.',
      guide:'Ones first. If the top ones digit is too small, trade a ten.',
      explain:a+' − '+b+' = '+(a-b)+'. We traded a ten for ones — renaming!',
      speak:'What is '+a+' minus '+b+'?',key:'sr|'+a+'|'+b});
  }},
  /* --- Word problems with renaming --- */
  'trail-word-rename':{gen(){
    const ctx=[['A ranger collects','pinecones','finds','more pinecones'],['A camper picks','apples','picks','more apples'],['The troop gathers','stones','gathers','more stones']];
    const c=R.choice(ctx);
    if(R.f()<.5){
      let a=R.int(128,699),b=R.int(115,999-a);if((a%10)+(b%10)<10||a+b>1000)return this.gen();
      return problem({math:{type:'add',a,b},
        html:c[0]+' '+a+' '+c[1]+'. Then '+c[2]+' '+b+' '+c[3]+'.<br>How many '+c[1]+' in all?',answer:String(a+b),choices:null,
        hint:'“In all” means add. Watch the ones — they make a new ten!',
        guide:'Set it up as '+a+' + '+b+' and add with renaming.',
        explain:a+' + '+b+' = '+(a+b)+'.',speak:'How many in all?',key:'wr|a|'+a+'|'+b});
    }
    let a=R.int(305,899),b=R.int(118,a-80);if((a%10)>=(b%10))return this.gen();
    return problem({math:{type:'subtract',a,b},
      html:c[0]+' '+a+' '+c[1]+'. '+b+' are given away.<br>How many '+c[1]+' are left?',answer:String(a-b),choices:null,
      hint:'Giving away means subtract — and you will need to rename (trade a ten).',
      guide:'Set it up as '+a+' − '+b+'.',
      explain:a+' − '+b+' = '+(a-b)+'.',speak:'How many are left?',key:'wr|s|'+a+'|'+b});
  }},
  /* --- Skip counting by 2s, 5s, 10s --- */
  'trail-skip':{gen(){
    const k=R.choice([2,5,10]),start=k*R.int(1,9);
    const seq=[0,1,2,3].map(i=>start+i*k),ans=start+4*k;
    return problem({math:{type:'value',value:ans},
      html:'Count by '+k+'s: '+seq.join(', ')+', ?<br>What comes next?',answer:String(ans),choices:mcqChoices(ans,[ans+k,ans-k,ans+1]),
      hint:'Each step adds '+k+'.',
      guide:'Say the chant: '+seq.join(', ')+', ... keep going!',
      explain:'Counting by '+k+'s: the next number is '+ans+'.',speak:'What comes next?',key:'sk|'+k+'|'+start});
  }},
  /* --- x2, x5, x10 facts and their division partners --- */
  'trail-facts':{gen(){
    const k=R.choice([2,5,10]),n=R.int(2,9),div=R.f()<.35;
    if(div)return problem({math:{type:'divide',total:k*n,divisor:k},
      html:(k*n)+' ÷ '+k+' = ?',answer:String(n),choices:null,
      hint:'Think multiplication: '+k+' × ? = '+(k*n)+'.',
      guide:'Division is multiplication backwards!',explain:k+' × '+n+' = '+(k*n)+', so '+(k*n)+' ÷ '+k+' = '+n+'.',
      speak:'What is '+(k*n)+' divided by '+k+'?',key:'fd|'+k+'|'+n});
    return problem({math:{type:'multiply',a:k,b:n},
      html:k+' × '+n+' = ?',answer:String(k*n),choices:null,
      hint:'Skip count by '+k+'s, '+n+' times.',
      guide:'Chant it: count '+n+' hops of '+k+'.',explain:k+' × '+n+' = '+(k*n)+'. Skip counting gets you there!',
      speak:'What is '+k+' times '+n+'?',key:'fm|'+k+'|'+n});
  }},
  /* --- Equal groups picture (the meaning of multiplication) --- */
  'trail-groups-intro':{gen(){
    const g=R.int(2,6),per=R.choice([2,3,4,5,10]);
    return problem({math:{type:'multiply',a:g,b:per},
      html:'How many ⭐ in all?<br>There are '+g+' groups of '+per+'.',answer:String(g*per),choices:null,
      visual:{type:'groups',groups:g,per,item:'⭐',of:g},
      hint:'Multiplication counts equal groups. Skip count: groups of '+per+'.',
      guide:g+' groups of '+per+' is '+g+' × '+per+'.',
      explain:g+' × '+per+' = '+(g*per)+'.',speak:'How many in all?',key:'gi|'+g+'|'+per});
  }}
});

window.TARGETS.push(
 {id:'trail-place',chapter:'trail',title:'Place Value to 1,000',art:'🔢',blurb:'Hundreds, tens, and ones — and what each digit is worth.',audio:'audio/m8-trail-place.mp3',controlsAudio:'audio/m9-controls-trail-place.mp3',introFile:'audio/m10-intro-trail-place.mp3',
  demoCaption:'Every digit has a place, and its place gives its value! In 472, the 4 sits in the hundreds place, so it is worth 400. The 7 sits in the tens place, worth 70. The 2 sits in the ones place, worth 2. Put them together: 400 + 70 + 2 = 472. Always read a number by its places!',demoVisual:{kind:'steps',lines:['472 is 4 hundreds + 7 tens + 2 ones','4 is worth 400 · 7 is worth 70 · 2 is worth 2']},
  teachingNote:'Comparing numbers uses the same idea: compare hundreds first, then tens, then ones — the first place that differs decides.',
  controls:'Build numbers from hundreds, tens, and ones — or tap the value of a digit. Remember: the place makes the value!',guidedFamilies:['trail-pv-build'],families:['trail-pv-build','trail-pv-digit','trail-pv-expand','trail-pv-compare'],adventureFamilies:['trail-pv-digit','trail-pv-compare']},
 {id:'trail-bonds',chapter:'trail',title:'Number Bonds',art:'🧩',blurb:'Partners that make 10, 20, and 100.',audio:'audio/m8-trail-bonds.mp3',controlsAudio:'audio/m9-controls-trail-bonds.mp3',introFile:'audio/m10-intro-trail-bonds.mp3',
  demoCaption:'A number bond shows two parts that make a whole. 7 and 3 are partners: 7 + 3 = 10. Bigger wholes have bonds too: 30 + 70 = 100. If you know one part and the whole, the missing part is the whole minus the part. Number bonds are the engine inside almost every strategy at camp!',demoVisual:{kind:'steps',lines:['7 + 3 = 10 · 30 + 70 = 100','Whole − part = the missing part']},
  teachingNote:'Bonds to 100 are the same bonds that make $1 in the Trading Post — 65¢ needs 35¢ — so this mission secretly prepares the money chapter.',
  controls:'One part of the bond is missing. Type the partner that makes the whole. Count up if you need to!',guidedFamilies:['trail-bond10'],families:['trail-bond10','trail-bond100','trail-bond3'],adventureFamilies:['trail-bond100','trail-bond3']},
 {id:'trail-regroup',chapter:'trail',title:'Adding & Subtracting with Renaming',art:'✏️',blurb:'The written method, with trading tens.',audio:'audio/m8-trail-regroup.mp3',controlsAudio:'audio/m9-controls-trail-regroup.mp3',introFile:'audio/m10-intro-trail-regroup.mp3',
  demoCaption:'Add 268 + 157 step by step. Ones first: 8 + 7 = 15 — that makes a new ten! Write 5, and rename the extra ten above the tens place. Tens: 6 + 5 + the renamed 1 = 12 — rename again! Hundreds: 2 + 1 + 1 = 4. The answer is 425. Renaming means trading 10 ones for 1 ten (or back again) whenever a place overflows.',demoVisual:{kind:'steps',lines:['268 + 157: ones 8 + 7 = 15 → write 5, rename a ten','tens 6 + 5 + 1 = 12 → rename again · hundreds 2 + 1 + 1 = 4','Answer: 425']},
  demo2:{caption:'Subtraction renames the other way. In 452 − 178, look at the ones: 2 is too small to subtract 8. Trade 1 ten for 10 ones: the ones become 12, and 12 − 8 = 4. Now the tens: 4 tens are left, too small to subtract 7. Trade 1 hundred for 10 tens: 14 − 7 = 7. Hundreds: 3 − 1 = 2. The answer is 274.',audio:'audio/m8-trail-regroup-demo2.mp3',visual:{kind:'steps',lines:['452 − 178: trade a ten → 12 − 8 = 4','trade a hundred → 14 − 7 = 7 · hundreds 3 − 1 = 2','Answer: 274']}},
  teachingNote:'Singapore Math calls this renaming (many books say regrouping). The trade never changes the value — 1 ten is exactly 10 ones.',
  controls:'Add or subtract, ones first. When the ones overflow or run short, trade between ones and tens.',guidedFamilies:['trail-add-rename'],families:['trail-add-rename','trail-sub-rename','trail-word-rename'],adventureFamilies:['trail-sub-rename','trail-word-rename']},
 {id:'trail-mult',chapter:'trail',title:'First Multiplication',art:'✖️',blurb:'Skip counting and the ×2, ×5, ×10 facts.',audio:'audio/m8-trail-mult.mp3',controlsAudio:'audio/m9-controls-trail-mult.mp3',introFile:'audio/m10-intro-trail-mult.mp3',
  demoCaption:'Multiplication counts equal groups. Here are 4 groups of 5 apples. Skip count by 5s: 5, 10, 15, 20 — there are 20 apples. We write it 4 × 5 = 20. The first facts to master are ×2, ×5, and ×10 — and skip counting is the trail that leads to all of them!',demoVisual:{kind:'groups',groups:4,per:5,item:'🍎',of:4},
  teachingNote:'×10 facts end in 0, ×5 facts end in 5 or 0, and ×2 facts are the doubles — patterns that make the facts easy to remember.',
  controls:'Skip count to finish the pattern, or answer the fact. For division, think multiplication backwards!',guidedFamilies:['trail-skip'],families:['trail-skip','trail-facts','trail-groups-intro'],adventureFamilies:['trail-facts','trail-groups-intro']}
);
const TRAIL_OWNERS={'trail-pv-build':'trail-place','trail-pv-digit':'trail-place','trail-pv-expand':'trail-place','trail-pv-compare':'trail-place','trail-bond10':'trail-bonds','trail-bond100':'trail-bonds','trail-bond3':'trail-bonds','trail-add-rename':'trail-regroup','trail-sub-rename':'trail-regroup','trail-word-rename':'trail-regroup','trail-skip':'trail-mult','trail-facts':'trail-mult','trail-groups-intro':'trail-mult'};
for(const [fid,owner] of Object.entries(TRAIL_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;
/* Trailhead missions belong at the front of the trail. */
(function(){
  const rank=c=>c==='trail'?-1:parseInt(String(c).slice(2),10)||0;
  window.TARGETS.sort((a,b)=>rank(a.chapter)-rank(b.chapter));
})();
