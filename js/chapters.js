/* Dimensions Math 2B Chapters 8 and 9. Stable target IDs preserve saved camps. */
'use strict';

function mcqChoices(answer,distractors){
  const out=[String(answer)],seen=new Set(out);
  for(const value of R.shuffle(distractors)){
    const n=Number(value),text=String(n);
    if(out.length===4)break;
    if(Number.isInteger(n)&&n>=0&&!seen.has(text)){out.push(text);seen.add(text);}
  }
  for(let n=Number(answer)+1;out.length<4;n++)if(!seen.has(String(n)))out.push(String(n));
  return R.shuffle(out);
}
function entryKeys(a,b){return a+'|'+b;}
function additionBridge(a,b,unit){
  const move=unit-a%unit,land=a+move,rest=b-move;
  return {move,land,rest,result:a+b};
}
function knownFact(groups,size){
  const result=groups*size;
  if(groups===1)return {hint:'One group has '+size+' objects.',explain:'1 × '+size+' = '+size+'.'};
  if(groups===2)return {hint:'Double '+size+' to find two equal groups.',explain:'2 × '+size+' = '+size+' + '+size+' = '+result+'.'};
  if(groups===4||groups===8){
    const half=groups/2,halfTotal=half*size;
    return {hint:'Double the total for '+half+' groups of '+size+'.',explain:half+' × '+size+' = '+halfTotal+'. Double '+halfTotal+': '+halfTotal+' + '+halfTotal+' = '+result+'.'};
  }
  if(groups===5||groups===10)return {hint:'Use the '+groups+' times table you already learned.',explain:groups+' × '+size+' = '+result+'. This is a known fact.'};
  if(groups===9)return {hint:'Start with 10 groups of '+size+', then remove one group.',explain:'10 × '+size+' = '+10*size+'. '+10*size+' − '+size+' = '+result+'.'};
  const base=groups===3?2:5,extra=groups-base,baseTotal=base*size,extraTotal=extra*size;
  return {hint:'Use '+base+' groups of '+size+', then add '+extra+' more '+(extra===1?'group':'groups')+'.',explain:base+' × '+size+' = '+baseTotal+'. Add '+extra+' × '+size+' = '+extraTotal+'. '+baseTotal+' + '+extraTotal+' = '+result+'.'};
}
function problem(fields){
  if(!fields.hints)fields.hints=[fields.hint,fields.guide||fields.hint,fields.explain];
  fields.hint=fields.hints[0];return fields;
}
function groupsProblem(size){
  const groups=R.int(2,10),answer=groups*size,items=size===3?'marshmallows':'campers',places=size===3?'sticks':'tents',fact=knownFact(groups,size);
  return problem({math:{type:'multiply',a:groups,b:size},html:groups+' '+places+', '+size+' '+items+(size===3?' on each.':' in each.')+'<br>How many '+items+' altogether?',answer:String(answer),
    choices:mcqChoices(answer,[answer+size,answer-size,groups+size]),visual:{type:'groups',groups,per:size,unit:items},
    hint:'There are '+groups+' equal groups with '+size+' in each group.',guide:fact.hint,
    explain:groups+' × '+size+' = '+answer+' '+items+'. '+fact.explain,speak:groups+' '+places+' with '+size+' '+items+' each. How many '+items+' altogether?',key:String(groups)});
}
function multiplyProblem(size){
  const groups=R.int(1,10),flip=R.f()<.5,a=flip?size:groups,b=flip?groups:size,fact=knownFact(groups,size);
  return problem({math:{type:'multiply',a,b},html:a+' × '+b+' = <span class="blank">?</span>',answer:String(a*b),
    choices:mcqChoices(a*b,[a*b+size,a*b-size,a+b]),hint:(flip?'Use the equal fact '+groups+' × '+size+'. ':'')+fact.hint,
    guide:flip?'You can use '+groups+' × '+size+' because changing the order keeps the same total. '+fact.hint:fact.hint,
    explain:(flip?a+' × '+b+' = '+groups+' × '+size+'. ':'')+fact.explain,speak:a+' times '+b+' equals what?',key:(flip?'a':'b')+groups});
}
function divisionProblem(divisor,meaning,deal){
  const quotient=R.int(2,10),total=divisor*quotient,sharing=meaning==='sharing';
  const html=sharing?'Share '+total+' counters equally among '+divisor+' groups.<br>How many counters in each group?':total+' counters, '+divisor+' in each group.<br>How many groups can you make?';
  const unit=sharing?'counters per group':'groups';
  const firstHint=sharing?'The '+divisor+' groups are known. Find the number in each group.':'The '+divisor+' counters in each group are known. Find the number of groups.';
  const related=sharing?divisor+' × ? = '+total:'? × '+divisor+' = '+total;
  const factHint='Use a related multiplication fact: '+related+'. Which number makes the total '+total+'?';
  const check=sharing?divisor+' × '+quotient:quotient+' × '+divisor;
  const explanation=total+' ÷ '+divisor+' = '+quotient+' '+unit+'. Check: '+check+' = '+total+'.';
  return problem({math:{type:'divide',total,divisor,meaning},kind:deal?(sharing?'deal':'grouping'):undefined,total,groups:divisor,
    html,answer:String(quotient),choices:deal?null:mcqChoices(quotient,[quotient+1,quotient-1,total]),answerUnit:unit,
    hint:firstHint,hints:[firstHint,factHint,explanation],
    guide:deal?(sharing?'Give one counter to every group in each round. Keep the groups equal.':'Make groups with exactly '+divisor+' counters each. Count the groups.'):factHint,
    explain:explanation,speak:html.replace(/<br>/g,' '),key:(deal?'d':sharing?'b':'a')+quotient});
}
function nearFact(size){
  const groups=R.int(2,9);
  return problem({math:{type:'difference',a:groups,b:size,c:groups+1,d:size},
    html:groups+' × '+size+' is <span class="blank">?</span> less than '+(groups+1)+' × '+size+'.',answer:String(size),
    choices:mcqChoices(size,[1,groups,size+1]),hint:'Compare the groups. The second expression has one extra group of '+size+'.',
    explain:(groups+1)+' × '+size+' = '+(groups+1)*size+'. '+groups+' × '+size+' = '+groups*size+'. The difference is one group: '+size+'.',
    speak:groups+' times '+size+' is how much less than '+(groups+1)+' times '+size+'?',key:entryKeys(groups,size)});
}

window.FAMILIES={
  'ch8-equiv-add-ones':{gen(){
    const b=R.int(2,9),move=R.int(1,b-1),a=R.int(10,98)*10+10-move,s=additionBridge(a,b,10);
    return problem({math:{type:'equivalent-add',a,b,known:s.land},html:a+' + '+b+' = '+s.land+' + <span class="blank">?</span>',answer:String(s.rest),
      choices:mcqChoices(s.rest,[b,b+move,s.rest+1]),hint:'Find how many '+a+' needs to reach the next ten, '+s.land+'.',
      guide:'Split '+b+' into '+s.move+' and the remaining part. Use '+s.move+' to reach '+s.land+'.',
      explain:a+' + '+b+' = '+s.land+' + '+s.rest+' = '+s.result+'. The parts '+s.move+' and '+s.rest+' add to '+b+'.',speak:a+' plus '+b+' equals '+s.land+' plus what?',key:entryKeys(a,b)});
  }},
  'ch8-add-ones':{gen(){
    const b=R.int(1,9),a=R.int(100,1000-b),move=10-a%10,bridges=b>=move;
    return problem({math:{type:'add',a,b},html:a+' + '+b+' = <span class="blank">?</span>',answer:String(a+b),choices:null,
      hint:bridges?'Split '+b+' to make the next ten first.':'Add the ones. The other place values stay the same.',
      guide:bridges?'Use '+move+' of the '+b+' to reach '+(a+move)+', then add the remaining '+(b-move)+'.':'There are '+a%10+' ones. Add '+b+' more ones.',
      explain:bridges?a+' + '+move+' = '+(a+move)+'. '+(a+move)+' + '+(b-move)+' = '+(a+b)+'.':a+' + '+b+' = '+(a+b)+'.',speak:a+' plus '+b+' equals what?',key:'c'+entryKeys(a,b)});
  }},
  'ch8-equiv-add-tens':{gen(){
    const a=R.int(1,8)*100+R.int(1,9)*10,move=100-a%100,b=R.int(move/10,9)*10,s=additionBridge(a,b,100);
    return problem({math:{type:'equivalent-add',a,b,known:s.rest},html:a+' + '+b+' = <span class="blank">?</span> + '+s.rest,answer:String(s.land),
      choices:mcqChoices(s.land,[a+b,a,s.land+10]),hint:'Make the next hundred first. How much does '+a+' need?',
      guide:'Split '+b+' into '+s.move+' and '+s.rest+'. Add '+s.move+' to '+a+' to make a whole hundred.',
      explain:a+' + '+s.move+' = '+s.land+'. '+s.land+' + '+s.rest+' = '+s.result+'.',speak:a+' plus '+b+' equals what plus '+s.rest+'?',key:entryKeys(a,b)});
  }},
  'ch8-add-tens':{gen(){
    const b=R.int(1,9)*10,a=R.int(100,1000-b),ones=a%10,tens=Math.floor(a/10)%10,hundreds=Math.floor(a/100)*100,newTens=tens+b/10;
    return problem({math:{type:'add',a,b},html:a+' + '+b+' = <span class="blank">?</span>',answer:String(a+b),choices:null,
      hint:'Add '+b/10+' tens to '+tens+' tens. Keep the '+ones+' ones.',
      guide:tens+' tens + '+b/10+' tens = '+newTens+' tens. Combine that with '+hundreds+' and '+ones+' ones.',
      explain:hundreds+' + '+newTens*10+' + '+ones+' = '+(a+b)+'. '+newTens+' tens is '+newTens*10+'.',speak:a+' plus '+b+' equals what?',key:'c'+entryKeys(a,b)});
  }},
  'ch8-make100':{gen(){
    const a=R.int(10,99),answer=100-a,next=10*Math.ceil(a/10),first=next-a;
    return problem({math:{type:'missing-addend',a,total:100},html:a+' + <span class="blank">?</span> = 100',answer:String(answer),
      choices:mcqChoices(answer,[answer+10,answer-10,answer+1]),hint:'Think of the parts that make the whole, 100.',
      guide:first?'First add '+first+' to reach '+next+'. Then count the tens to 100.':'Count the tens from '+a+' to 100.',
      explain:a+' + '+answer+' = 100. The missing part is '+answer+'.',speak:a+' plus what equals 100?',key:String(a)});
  }},
  'ch8-add-comp':{gen(){
    const b=R.choice([97,98,99]),a=R.int(100,1000-b),extra=100-b;
    return problem({math:{type:'add',a,b},html:a+' + '+b+' = <span class="blank">?</span>',answer:String(a+b),choices:null,
      hint:b+' is '+extra+' less than 100. Add 100, then subtract the extra '+extra+'.',guide:a+' + 100 = '+(a+100)+'. Adding 100 added '+extra+' too many, so subtract '+extra+'.',
      explain:a+' + '+b+' = '+a+' + 100 − '+extra+' = '+(a+b)+'.',speak:a+' plus '+b+' equals what?',key:entryKeys(a,b)});
  }},
  'ch8-sub-bridge':{gen(){
    const ones=R.int(1,8),a=R.int(10,99)*10+ones,b=R.int(ones+1,9);
    return problem({math:{type:'subtract',a,b},html:a+' − '+b+' = <span class="blank">?</span>',answer:String(a-b),choices:null,
      hint:'Split '+b+' so the first jump lands on '+(a-ones)+'.',guide:'Subtract '+ones+' to reach '+(a-ones)+'. You still need to subtract '+(b-ones)+'.',
      explain:a+' − '+ones+' = '+(a-ones)+'. '+(a-ones)+' − '+(b-ones)+' = '+(a-b)+'.',speak:a+' minus '+b+' equals what?',key:entryKeys(a,b)});
  }},
  'ch8-sub-tens':{gen(){
    const a=R.int(2,9)*100+R.int(1,8)*10,b=R.int(a%100/10+1,9)*10,first=a%100;
    return problem({math:{type:'subtract',a,b},html:a+' − '+b+' = <span class="blank">?</span>',answer:String(a-b),choices:null,
      hint:'Split '+b+' to reach the previous hundred first.',guide:'Subtract '+first+' to reach '+(a-first)+'. Then subtract the remaining '+(b-first)+'.',
      explain:a+' − '+first+' = '+(a-first)+'. '+(a-first)+' − '+(b-first)+' = '+(a-b)+'.',speak:a+' minus '+b+' equals what?',key:'t'+entryKeys(a,b)});
  }},
  'ch8-sub-comp':{gen(){
    const a=R.int(100,999),b=R.choice([97,98,99]),extra=100-b;
    return problem({math:{type:'subtract',a,b},html:a+' − '+b+' = <span class="blank">?</span>',answer:String(a-b),choices:null,
      hint:'Subtracting 100 removes '+extra+' too many. Add '+extra+' back.',guide:a+' − 100 = '+(a-100)+'. Put back the extra '+extra+' that was removed.',
      explain:a+' − '+b+' = '+a+' − 100 + '+extra+' = '+(a-b)+'.',speak:a+' minus '+b+' equals what?',key:entryKeys(a,b)});
  }},
  'ch9-groups3':{gen(){return groupsProblem(3);}},'ch9-mult3':{gen(){return multiplyProblem(3);}},
  'ch9-div3-deal':{gen(){return divisionProblem(3,'sharing',true);}},'ch9-div3-group':{gen(){return divisionProblem(3,'grouping',true);}},'ch9-div3a':{gen(){return divisionProblem(3,'grouping',false);}},'ch9-div3b':{gen(){return divisionProblem(3,'sharing',false);}},
  'ch9-groups4':{gen(){return groupsProblem(4);}},'ch9-mult4':{gen(){return multiplyProblem(4);}},
  'ch9-div4-deal':{gen(){return divisionProblem(4,'sharing',true);}},'ch9-div4-group':{gen(){return divisionProblem(4,'grouping',true);}},'ch9-div4a':{gen(){return divisionProblem(4,'grouping',false);}},'ch9-div4b':{gen(){return divisionProblem(4,'sharing',false);}},
  'ch9-near':{gen(){return nearFact(R.choice([3,4]));}},'ch9-near3':{gen(){return nearFact(3);}},'ch9-near4':{gen(){return nearFact(4);}}
};

window.TARGETS=[
 {id:'ch8-adding-ones',chapter:'ch8',title:'Adding Ones',art:'🔢',blurb:'Split ones to make the next ten.',audio:'audio/m1-ch8-adding-ones.mp3',
  demoCaption:'Let’s add ones the smart way: make ten first. 459 trail markers, and 6 more arrive. 459 needs 1 more to reach 460. Split 6 into 1 and 5. 459 + 1 = 460, plus 5 more = 465. The ten did the heavy lifting!',demoVisual:{kind:'bridge',a:459,b:6},
  teachingNote:'Choose a strategy that fits the numbers. If the ones do not reach the next ten, you can just add the ones. For example, 452 + 3 = 455.',
  controls:'Tap an answer choice, or use the number pad and tap Check. You can also type on a keyboard. Hint is always available. Read the explanation, then tap Continue.',guidedFamilies:['ch8-equiv-add-ones'],families:['ch8-equiv-add-ones','ch8-add-ones'],adventureFamilies:['ch8-equiv-add-ones','ch8-add-ones']},
 {id:'ch8-adding-tens',chapter:'ch8',title:'Adding Tens',art:'🎯',blurb:'Make a hundred or use known tens facts.',audio:'audio/m2-ch8-adding-tens.mp3',
  demoCaption:'360 plus 80. Split 80 into 40 and 40. Add the first 40 to reach 400. Add the remaining 40 to reach 440. We can also use a known fact: 6 tens plus 8 tens is 14 tens, or 140. The 300 and 140 make 440.',demoVisual:{kind:'shift',a:360,b:80,move:40},
  demo2:{caption:'Watch again with different numbers. 275 + 60. 275 needs 25 to reach 300. Split 60 into 25 and 35. 275 + 25 = 300, plus 35 more = 335. Landing on a whole hundred makes the rest easy.',audio:'audio/m2-ch8-adding-tens-demo2.mp3',visual:{kind:'shift',a:275,b:60,move:25}},
  teachingNote:'40 + 40 = 80. Choose the first part to reach 400. The parts do not have to be equal: for 370 + 80, split 80 into 30 and 50. 370 + 30 = 400, then 400 + 50 = 450.',
  controls:'Find the missing number or total. Tap an answer choice, or use the number pad and Check. The two parts must add to the original amount.',guidedFamilies:['ch8-equiv-add-tens'],families:['ch8-equiv-add-tens','ch8-add-tens'],adventureFamilies:['ch8-equiv-add-tens','ch8-add-tens','ch8-add-ones']},
 {id:'ch8-making-100',chapter:'ch8',title:'Making 100',art:'💯',blurb:'Find the missing part of 100.',audio:'audio/m1-ch8-making-100.mp3',
  demoCaption:'Some pairs are best friends: they make 100. 70 + 30. 60 + 40. When you see a number, ask: what does it need to reach 100? 96 needs 4. Spotting hundred-pairs makes big addition easy.',demoVisual:{kind:'hundred',a:96},
  controls:'Find the missing part of 100. Tap an answer choice. Use Hint to see how to count up to the whole.',guidedFamilies:['ch8-make100'],families:['ch8-make100'],adventureFamilies:['ch8-make100','ch8-equiv-add-tens']},
 {id:'ch8-adding-98',chapter:'ch8',title:'Adding 97, 98, 99',art:'🧮',blurb:'Add 100, then subtract the extra.',audio:'audio/m1-ch8-adding-98.mp3',
  demoCaption:'Adding 98? Add 100 instead — it’s easy — then fix it. 367 + 98. Add 100: 467. But we added 2 too many, so take 2 back: 465. Add the round number, then undo the extra. That’s called compensation.',demoVisual:{kind:'comp',a:367,k:98,op:'+'},
  demo2:{caption:'One more: 458 + 99. Add 100 first: 558. We added 1 too many, so take 1 back: 557. The closer the number is to 100, the smaller the fix.',audio:'audio/m2-ch8-adding-98-demo2.mp3',visual:{kind:'comp',a:458,k:99,op:'+'}},
  teachingNote:'We choose 100 because 97, 98, and 99 are close to it. Keep the answer exact: after adding 100, subtract the extra 3, 2, or 1.',
  controls:'Use the number pad or keyboard to enter the total, then tap Check. Add 100 first and subtract the amount added extra.',guidedFamilies:['ch8-add-comp'],families:['ch8-add-comp'],adventureFamilies:['ch8-add-comp','ch8-equiv-add-tens']},
 {id:'ch8-subtracting',chapter:'ch8',title:'Subtracting Ones & Tens',art:'📉',blurb:'Split the part to land on a ten or hundred.',audio:'audio/m2-ch8-subtracting.mp3',
  demoCaption:'463 minus 7. Split 7 into 3 and 4. Subtract 3 to reach 460, then subtract 4 to reach 456. For tens, try 540 minus 70. Split 70 into 40 and 30. Subtract 40 to reach 500, then subtract 30 to reach 470. In each example, both jumps together subtract the original amount.',demoVisual:{kind:'subtraction',examples:[{a:463,b:7,unit:10},{a:540,b:70,unit:100}]},
  teachingNote:'Another way: subtract from 100. Split the whole 540 into 440 and 100. 100 − 70 = 30. Then 440 + 30 = 470. Both strategies give the same answer; choose a way that helps you.',
  controls:'Type the amount left using the number pad or keyboard, then Check. Think about the first jump and the remaining part.',guidedFamilies:['ch8-sub-bridge','ch8-sub-tens'],families:['ch8-sub-bridge','ch8-sub-tens'],adventureFamilies:['ch8-sub-bridge','ch8-sub-tens']},
 {id:'ch8-subtracting-98',chapter:'ch8',title:'Subtracting 97, 98, 99',art:'🔄',blurb:'Subtract 100, then put back the extra.',audio:'audio/m1-ch8-subtracting-98.mp3',
  demoCaption:'Subtracting 98 works like adding it, but the fix flips. 367 − 98. Subtract 100: 267. We took away 2 too many, so give 2 back: 269. Subtract the round number, then return the extra.',demoVisual:{kind:'comp',a:367,k:98,op:'-'},
  demo2:{caption:'One more: 512 − 97. Subtract 100 first: 412. We took away 3 too many, so give 3 back: 415. When we subtract, the fix flips — we add the extra back.',audio:'audio/m2-ch8-subtracting-98-demo2.mp3',visual:{kind:'comp',a:512,k:97,op:'-'}},
  controls:'Enter the amount left and tap Check. Subtracting 100 takes away too much, so the correction adds the extra back.',guidedFamilies:['ch8-sub-comp'],families:['ch8-sub-comp'],adventureFamilies:['ch8-sub-comp','ch8-sub-tens','ch8-add-comp']},
 {id:'ch9-groups-3',chapter:'ch9',title:'Groups of 3',art:'🍡',blurb:'Build equal groups and notice one more group.',audio:'audio/m1-ch9-groups-3.mp3',
  demoCaption:'Equal groups are the heart of multiplication. 4 sticks, 3 marshmallows on each stick. 4 groups of 3. Count by threes: 3, 6, 9, 12. 12 marshmallows in all.',demoVisual:{kind:'groups',groups:4,per:3},
  controls:'Each counter stands for one object. Find the total in the equal groups and tap an answer choice.',guidedFamilies:['ch9-groups3'],families:['ch9-groups3'],adventureFamilies:['ch9-groups3']},
 {id:'ch9-multiply-3',chapter:'ch9',title:'Multiplication Facts of 3',art:'✖️',blurb:'Use known facts to find a new fact.',audio:'audio/m2-ch9-multiply-3.mp3',
  demoCaption:'Six groups of 3 make 6 times 3. We know 5 times 3 is 15. One more group adds 3, so 15 plus 3 is 18. Six times 3 is 18. The array also has 3 columns of 6, so 3 times 6 has the same total. Use facts you know to find facts you are learning.',demoVisual:{kind:'fact',groups:6,per:3,base:5},
  controls:'Tap an answer choice. Hint can suggest a known fact, doubling, or adding or removing one group.',guidedFamilies:['ch9-mult3'],families:['ch9-mult3'],adventureFamilies:['ch9-mult3','ch9-near3']},
 {id:'ch9-divide-3',chapter:'ch9',title:'Division by 3',art:'🍎',blurb:'Find how many in each group or how many groups.',audio:'audio/m2-ch9-divide-3.mp3',
  demoCaption:'There are two ways to divide 24 by 3. Share 24 counters among 3 equal groups: there are 8 in each group. Or put 3 counters in each group: you make 8 groups. Both answers are 8, but they tell us different things. A related multiplication fact, 3 times 8 equals 24, checks our answer.',demoVisual:{kind:'division',total:24,divisor:3},
  demo2:{caption:'Another look: 18 ÷ 3. Share 18 counters among 3 groups — 6 in each group. Or make groups of 3 — you get 6 groups. The answer is 6 both times, but it names different things. The fact 3 × 6 = 18 checks both.',audio:'audio/m2-ch9-divide-3-demo2.mp3',visual:{kind:'division',total:18,divisor:3}},
  controls:'For sharing, tap Deal one round. For grouping, tap Make one group. Then use the number pad or keyboard and Check. Read whether the question asks for counters in each group or the number of groups.',guidedFamilies:['ch9-div3-deal','ch9-div3-group'],families:['ch9-div3a','ch9-div3b'],adventureFamilies:['ch9-div3a','ch9-div3b']},
 {id:'ch9-groups-4',chapter:'ch9',title:'Groups of 4',art:'⛺',blurb:'Build equal groups of four.',audio:'audio/m1-ch9-groups-4.mp3',
  demoCaption:'Now groups of four. 3 tents, 4 campers in each tent. 4, 8, 12. 3 groups of 4 = 12. Bigger groups, same idea.',demoVisual:{kind:'groups',groups:3,per:4},
  controls:'Each counter stands for one camper. Find the total in the equal groups and tap an answer choice.',guidedFamilies:['ch9-groups4'],families:['ch9-groups4'],adventureFamilies:['ch9-groups4']},
 {id:'ch9-multiply-4',chapter:'ch9',title:'Multiplication Facts of 4',art:'4️⃣',blurb:'Use known facts, doubling, or one more group.',audio:'audio/m2-ch9-multiply-4.mp3',
  demoCaption:'Six groups of 4 make 6 times 4. We know 5 times 4 is 20. Add one more group of 4: 20 plus 4 is 24. Six times 4 is 24. Four columns of 6 have the same total, so 4 times 6 is also 24. You can use doubling and facts for 2, 5, and 10 to help.',demoVisual:{kind:'fact',groups:6,per:4,base:5},
  controls:'Tap an answer choice. Use a known fact to find the new fact; you do not need to count from the beginning each time.',guidedFamilies:['ch9-mult4'],families:['ch9-mult4'],adventureFamilies:['ch9-mult4','ch9-near4']},
 {id:'ch9-divide-4',chapter:'ch9',title:'Division by 4',art:'🧺',blurb:'Keep sharing and grouping distinct.',audio:'audio/m2-ch9-divide-4.mp3',
  demoCaption:'Share 24 counters among 4 groups: each group has 6. Or put 4 counters in every group: you make 6 groups. Both situations use 24 divided by 4. Think of the fact 4 times 6 equals 24. Say what the answer means: 6 counters per group, or 6 groups.',demoVisual:{kind:'division',total:24,divisor:4},
  demo2:{caption:'Another look: 32 ÷ 4. Share 32 counters among 4 groups — 8 in each group. Or make groups of 4 — you get 8 groups. The fact 4 × 8 = 32 checks the answer. Always say what your answer counts: counters in each group, or groups.',audio:'audio/m2-ch9-divide-4-demo2.mp3',visual:{kind:'division',total:32,divisor:4}},
  controls:'For sharing, tap Deal one round. For grouping, tap Make one group. Enter counters in each group or the number of groups, as the question asks. Use Check or tap an answer choice.',guidedFamilies:['ch9-div4-deal','ch9-div4-group'],families:['ch9-div4a','ch9-div4b'],adventureFamilies:['ch9-div4a','ch9-div4b','ch9-div3a']}
];
for(const t of window.TARGETS)for(const fid of [...t.families,...t.guidedFamilies]){
  if(!window.FAMILIES[fid].owner)window.FAMILIES[fid].owner=t.id;
}
window.FAMILIES['ch9-near3'].owner='ch9-multiply-3';
window.FAMILIES['ch9-near4'].owner='ch9-multiply-4';
