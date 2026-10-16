/* Camp Wildwood — Milestone 3 content: Chapters 12-15 and the Festival.
   Built one chapter at a time; stable IDs preserve saved camps. */
'use strict';

function fmtTime(h,min){ return h+':'+String(min).padStart(2,'0'); }
function timeMCQ(h,min){
  const correct=fmtTime(h,min),set=new Set([correct]),out=[correct];
  const traps=[fmtTime(h,(min+5)%60),fmtTime(h,(min+55)%60),fmtTime(h===12?1:h+1,min),fmtTime(h===1?12:h-1,min),fmtTime(h,(60-min)%60)];
  for(const t of R.shuffle(traps)){ if(out.length>=4)break; if(!set.has(t)){ out.push(t); set.add(t); } }
  return R.shuffle(out);
}
function textMCQ(answer,distractors){
  const out=[answer],seen=new Set(out);
  for(const d of R.shuffle(distractors)){ if(out.length>=4)break; if(d&&d!==answer&&!seen.has(d)){ out.push(d); seen.add(d); } }
  return R.shuffle(out);
}

Object.assign(window.FAMILIES,{
  /* --- Reading the clock: five-minute steps (guided) --- */
  'ch12-read5':{gen(){
    const h=R.int(1,12),min=R.choice([0,5,10,15,20,25,30,35,40,45,50,55]);
    return problem({math:{type:'clock',h,min},
      html:'What time does the clock show?',answer:fmtTime(h,min),choices:timeMCQ(h,min),
      visual:{type:'clock',h,min},
      hint:'The short hand tells the hour. The long hand tells the minutes.',
      guide:'Find the hour first. Then count by 5s around the clock for the minutes.',
      explain:'The clock shows '+fmtTime(h,min)+'.',speak:'What time does the clock show?',key:'r5|'+h+'|'+min});
  }},
  /* --- Reading the clock: any minute --- */
  'ch12-read':{gen(){
    const h=R.int(1,12),min=R.f()<.5?R.choice([0,15,30,45]):R.int(1,59);
    return problem({math:{type:'clock',h,min},
      html:'What time does the clock show?',answer:fmtTime(h,min),choices:timeMCQ(h,min),
      visual:{type:'clock',h,min},
      hint:'Count by 5s to the number before the long hand, then count single minutes.',
      guide:'The long hand moves one small mark for each minute.',
      explain:'The clock shows '+fmtTime(h,min)+'.',speak:'What time does the clock show?',key:'r|'+h+'|'+min});
  }},
  /* --- Minutes past the hour --- */
  'ch12-past':{gen(){
    const h=R.int(1,12),min=R.choice([5,10,15,20,25,30,35,40,45,50,55]);
    return problem({math:{type:'value',value:min},
      html:'The clock shows '+fmtTime(h,min)+'.<br>How many minutes past '+h+' is it?',answer:String(min),choices:null,
      visual:{type:'clock',h,min},
      hint:'The minutes are the time since the hour began.',
      guide:'Count by 5s from the top (0) to the long hand.',
      explain:fmtTime(h,min)+' is '+min+' minutes past '+h+'.',speak:'How many minutes past '+h+' is it?',key:'p|'+h+'|'+min});
  }},
  /* --- Elapsed time --- */
  'ch12-elapsed':{gen(){
    const h1=R.int(1,11),m1=R.choice([0,5,10,15,20,25,30,35,40,45,50]);
    const dur=R.choice([10,15,20,25,30,35,40,45,50,55,60,70,80,90]);
    const from=h1*60+m1,to=from+dur,h2=Math.floor(to/60),m2=to%60,endH=h2>12?h2-12:h2;
    const acts=[['Maya starts a hike','Maya starts hiking'],['Tom starts reading','Tom starts reading'],['A cake goes into the oven','The cake goes into the oven']];
    const act=R.choice(acts);
    return problem({math:{type:'minutes',from,to},
      html:act[0]+' at '+fmtTime(h1,m1)+'. It ends at '+fmtTime(endH,m2)+'.<br>How many minutes pass?',answer:String(dur),choices:null,answerUnit:'minutes',
      visual:{type:'clock',h:h1,min:m1},
      hint:'Count on from '+fmtTime(h1,m1)+' to '+fmtTime(endH,m2)+'.',
      guide:'Count first to the next hour, then count the extra minutes.',
      explain:'From '+fmtTime(h1,m1)+' to '+fmtTime(endH,m2)+' is '+dur+' minutes.',speak:'How many minutes pass?',key:'e|'+from+'|'+to});
  }},
  /* --- End time given start and duration --- */
  'ch12-endtime':{gen(){
    const h1=R.int(1,11),m1=R.choice([0,5,10,15,20,30,35,40,45,50]);
    const dur=R.choice([10,15,20,25,30,40,45,50]);
    const from=h1*60+m1,to=from+dur;let h2=Math.floor(to/60);const m2=to%60;if(h2>12)h2-=12;
    return problem({math:{type:'clock',h:h2,min:m2},
      html:'A nature walk starts at '+fmtTime(h1,m1)+' and lasts '+dur+' minutes.<br>What time does it end?',answer:fmtTime(h2,m2),choices:timeMCQ(h2,m2),
      visual:{type:'clock',h:h1,min:m1},
      hint:'Count on '+dur+' minutes from '+fmtTime(h1,m1)+'.',
      guide:'Add the minutes first. If they pass 60, a new hour begins.',
      explain:fmtTime(h1,m1)+' + '+dur+' minutes = '+fmtTime(h2,m2)+'.',speak:'What time does the walk end?',key:'et|'+from+'|'+dur});
  }},
  /* --- A.M. or P.M. from an activity --- */
  'ch12-ampm':{gen(){
    const bank=[
      ['Eating breakfast before school','a.m.'],['Waking up when the sun rises','a.m.'],['Morning chores on the farm','a.m.'],
      ['A rooster crows at sunrise','a.m.'],['Brushing teeth right before bed','p.m.'],['Watching the sunset','p.m.'],
      ['Eating dinner with family','p.m.'],['The stars twinkle in a dark sky','p.m.'],['Doing homework after school','p.m.'],
      ['Afternoon swimming at the lake','p.m.'],['The moon is high in the night sky','p.m.'],['Getting ready for school in the morning','a.m.']];
    const pick=R.choice(bank);
    return problem({math:{type:'text',answer:pick[1]},
      html:pick[0]+'.<br>Is this a.m. or p.m.?',answer:pick[1],choices:['a.m.','p.m.'],
      hint:'a.m. is the morning, from midnight to noon. p.m. is from noon to midnight.',
      guide:'Picture the activity. Is the sun coming up, or is the day winding down?',
      explain:pick[0]+' happens in the '+(pick[1]==='a.m.'?'morning (a.m.)':'afternoon, evening, or night (p.m.)')+'.',
      speak:pick[0]+'. Is this a.m. or p.m.?',key:'ap|'+pick[0]});
  }},
  /* --- The full time with a.m./p.m. --- */
  'ch12-ampm-clock':{gen(){
    const bank=[
      [7,0,'Eating breakfast','a.m.'],[8,30,'Riding the bus to school','a.m.'],[6,45,'Waking up','a.m.'],
      [7,30,'Eating dinner','p.m.'],[8,15,'Reading a bedtime story','p.m.'],[3,30,'Playing outside after school','p.m.'],
      [12,30,'Eating lunch','p.m.'],[9,0,'Watching stars before bed','p.m.'],[11,45,'Almost time for lunch','a.m.']];
    const b=R.choice(bank),ans=fmtTime(b[0],b[1])+' '+b[3],other=fmtTime(b[0],b[1])+' '+(b[3]==='a.m.'?'p.m.':'a.m.');
    return problem({math:{type:'text',answer:ans},
      html:'The clock shows the time for: '+b[2]+'.<br>What is the time?',answer:ans,choices:R.shuffle([ans,other]),
      visual:{type:'clock',h:b[0],min:b[1]},
      hint:'Read the clock, then decide: morning (a.m.) or later in the day (p.m.)?',
      guide:'The clock says '+fmtTime(b[0],b[1])+'. The activity tells you which half of the day.',
      explain:b[2]+' at '+ans+'.',speak:'What is the time?',key:'ac|'+b[0]+'|'+b[1]+'|'+b[3]});
  }}
});

window.TARGETS.push(
 {id:'ch12-telling',chapter:'ch12',title:'Telling Time',art:'🕰️',blurb:'Read the clock to the minute.',audio:'audio/m5-ch12-telling.mp3',controlsAudio:'audio/m6-controls-ch12-telling.mp3',
  demoCaption:'A clock has two hands. The short hand tells the hour: it is just past 3. The long hand tells the minutes. It points at the 5. Count by 5s: 5, 10, 15, 20, 25. The time is 3:25. Each number on the clock is worth 5 minutes!',demoVisual:{kind:'clock',h:3,min:25,note:'Hour hand near 3. Minute hand on the 5: 25 minutes.'},
  teachingNote:'Half past is :30, quarter past is :15, and quarter to the next hour is :45. The hour hand creeps forward between numbers as minutes pass.',
  controls:'Look at the clock and tap the time it shows. Hour first (short hand), then minutes (long hand — count by 5s, then by 1s).',guidedFamilies:['ch12-read5'],families:['ch12-read5','ch12-read','ch12-past'],adventureFamilies:['ch12-read','ch12-elapsed']},
 {id:'ch12-intervals',chapter:'ch12',title:'Time Intervals',art:'⏱️',blurb:'How much time has passed?',audio:'audio/m5-ch12-intervals.mp3',controlsAudio:'audio/m6-controls-ch12-intervals.mp3',
  demoCaption:'How much time passes from 2:15 to 2:55? Count on: from 2:15 to 2:55 is 40 minutes — count by 5s or jump: 15 to 55 is 40. Counting on from the start time to the end time gives the elapsed time.',demoVisual:{kind:'clock-pair',a:{h:2,min:15},b:{h:2,min:55},note:'2:15 to 2:55: 40 minutes pass.'},
  demo2:{caption:'Intervals can cross the hour. From 3:45 to 4:20, count on: 3:45 to 4:00 is 15 minutes. 4:00 to 4:20 is 20 more. 15 + 20 = 35 minutes. Jumping to the next hour first makes hard intervals easy!',audio:'audio/m5-ch12-intervals-demo2.mp3',visual:{kind:'clock-pair',a:{h:3,min:45},b:{h:4,min:20},note:'3:45 → 4:00 is 15. 4:00 → 4:20 is 20. Total 35.'}},
  teachingNote:'Elapsed time also works in whole hours: from 9:00 to 12:00 is 3 hours. Always count on from the start — never count the start time itself.',
  controls:'For elapsed questions, type the number of minutes. For end-time questions, tap the clock time when the activity finishes.',guidedFamilies:['ch12-elapsed'],families:['ch12-elapsed','ch12-endtime'],adventureFamilies:['ch12-endtime','ch12-read']},
 {id:'ch12-ampm',chapter:'ch12',title:'A.M. and P.M.',art:'🌞',blurb:'Which half of the day is it?',audio:'audio/m5-ch12-ampm.mp3',controlsAudio:'audio/m6-controls-ch12-ampm.mp3',
  demoCaption:'Every day has two halves. a.m. runs from midnight to noon — the morning, when the sun rises and we eat breakfast. p.m. runs from noon to midnight — afternoon play, dinner, sunsets, and bedtime. Breakfast at 7:00 is 7:00 a.m. Dinner at 7:00 is 7:00 p.m. Same clock, different halves!',demoVisual:{kind:'steps',lines:['Midnight → noon: a.m. (morning)','Noon → midnight: p.m. (afternoon & night)','Breakfast 7:00 a.m. · Dinner 7:00 p.m.']},
  teachingNote:'Noon itself is 12:00 p.m. and midnight is 12:00 a.m. The letters come from Latin: ante meridiem (before midday) and post meridiem (after midday).',
  controls:'Read the activity and decide which half of the day it belongs to. Tap a.m. or p.m., or the full time with the right letters.',guidedFamilies:['ch12-ampm'],families:['ch12-ampm','ch12-ampm-clock'],adventureFamilies:['ch12-ampm-clock','ch12-endtime']}
);
const M3_OWNERS={'ch12-read5':'ch12-telling','ch12-read':'ch12-telling','ch12-past':'ch12-telling','ch12-elapsed':'ch12-intervals','ch12-endtime':'ch12-intervals','ch12-ampm':'ch12-ampm','ch12-ampm-clock':'ch12-ampm'};
for(const [fid,owner] of Object.entries(M3_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;

/* ================= Chapter 13: Capacity (Water Works) ================= */
Object.assign(window.FAMILIES,{
  /* --- Which container has more water right now? --- */
  'ch13-amount':{gen(){
    const opts=[[25,75],[75,25],[50,100],[100,50],[25,50],[60,30]];
    const pair=R.choice(opts),moreFirst=pair[0]>pair[1];
    const ans=pair[0]===pair[1]?'They have the same':(moreFirst?'The left jug':'The right jug');
    return problem({math:{type:'text',answer:ans},
      html:'Which jug has more water?',answer:ans,choices:['The left jug','The right jug','They have the same'],
      visual:{type:'containers2',a:{level:pair[0],caption:'Left jug'},b:{level:pair[1],caption:'Right jug'}},
      hint:'Compare the water levels. Higher water in the same-size jugs means more water.',
      guide:'Both jugs are the same size. Look at which water line is higher.',
      explain:ans==='They have the same'?'The water levels match.':ans+' has the higher water line.',
      speak:'Which jug has more water?',key:'am|'+pair.join('|')});
  }},
  /* --- Which container can hold more (capacity in cups)? --- */
  'ch13-capacity':{gen(){
    const items=[['a bucket',12],['a pot',8],['a watering can',10],['a fish tank',40],['a mug',2],['a bathtub',80],['a teapot',6],['a water bottle',4]];
    const a=R.choice(items);let b=R.choice(items);while(b===a)b=R.choice(items);
    const ans=a[1]>b[1]?a[0]:b[0];
    return problem({math:{type:'text',answer:ans},
      html:'When full, '+a[0]+' holds '+a[1]+' cups of water, and '+b[0]+' holds '+b[1]+' cups.<br>Which one can hold more water?',answer:ans,choices:R.shuffle([a[0],b[0]]),
      hint:'Capacity means how much a container can hold when it is full.',
      guide:'Compare the two numbers of cups.',
      explain:ans+' holds more: '+(a[1]>b[1]?a[1]:b[1])+' cups beats '+(a[1]>b[1]?b[1]:a[1])+' cups.',
      speak:'Which one can hold more water?',key:'cap|'+a[0]+'|'+b[0]});
  }},
  /* --- Which unit fits the job? --- */
  'ch13-unit-fit':{gen(){
    const bank=[
      ['the water in a swimming pool','gallons'],['the water in a bathtub','gallons'],['a jug of milk from the store','gallons'],
      ['the water in a fish tank','gallons'],['a big pot of soup','quarts'],['a pitcher of lemonade','quarts'],
      ['a can of paint','quarts'],['a bottle of water','liters'],['a canteen on a hike','liters'],['a big soda bottle','liters']];
    const pick=R.choice(bank);
    return problem({math:{type:'text',answer:pick[1]},
      html:'Which unit fits best for measuring '+pick[0]+'?',answer:pick[1],choices:['liters','quarts','gallons'],
      hint:'Gallons measure big amounts. Quarts are smaller. Liters are used all over the world.',
      guide:'Picture how much water it is. A whole bathtub is many gallons!',
      explain:'We measure '+pick[0]+' in '+pick[1]+'.',speak:'Which unit fits best?',key:'uf|'+pick[0]});
  }},
  /* --- Gallons and quarts: 1 gallon = 4 quarts --- */
  'ch13-convert':{gen(){
    if(R.f()<.5){ const g=R.int(2,9);
      return problem({math:{type:'value',value:g*4},
        html:g+' gallons = how many quarts?',answer:String(g*4),choices:null,answerUnit:'quarts',
        hint:'1 gallon = 4 quarts. Multiply.',
        guide:g+' × 4 = '+(g*4)+'.',explain:g+' gallons = '+(g*4)+' quarts, because each gallon holds 4 quarts.',
        speak:g+' gallons is how many quarts?',key:'cv|g'+g});
    }
    const q=R.choice([8,12,16,20,24,28,32,36,40]);
    return problem({math:{type:'value',value:q/4},
      html:q+' quarts = how many gallons?',answer:String(q/4),choices:null,answerUnit:'gallons',
      hint:'Group the quarts into 4s — each group of 4 is a gallon.',
      guide:q+' ÷ 4 = '+(q/4)+'.',explain:q+' quarts = '+(q/4)+' gallons, because 4 quarts make 1 gallon.',
      speak:q+' quarts is how many gallons?',key:'cv|q'+q});
  }},
  /* --- Reading a measuring jug --- */
  'ch13-read-jug':{gen(){
    const caps=[[2,50],[2,100],[4,25],[4,50],[4,75],[5,20],[5,40],[5,60],[5,80],[10,10],[10,50],[10,90]];
    const c=R.choice(caps),cap=c[0],level=c[1],amount=cap*level/100;
    return problem({math:{type:'value',value:amount},
      html:'This jug holds '+cap+' liters when full.<br>How many liters of water are in it now?',answer:String(amount),
      choices:mcqChoices(amount,[amount+1,amount-1,cap]),answerUnit:'liters',
      visual:{type:'container',level,caption:'Full = '+cap+' liters'},
      hint:'Look where the water reaches compared with the full mark.',
      guide:level===100?'The jug is full.':level===50?'The jug is half full. Half of '+cap+' liters is '+amount+'.':'The water is at '+level+' of 100 parts of the way up.',
      explain:'The jug holds '+amount+' liters of water now.',speak:'How many liters of water are in the jug?',key:'rj|'+cap+'|'+level});
  }},
  /* --- How much more to fill it? --- */
  'ch13-fill':{gen(){
    const cap=R.choice([10,15,20,25,30,40,50]),now=R.int(2,cap-2),ans=cap-now;
    return problem({math:{type:'subtract',a:cap,b:now},
      html:'A water tank holds '+cap+' liters. It has '+now+' liters in it.<br>How many more liters will fill it?',answer:String(ans),choices:null,answerUnit:'liters',
      hint:'Count up from '+now+' to '+cap+'.',
      guide:'This is a missing part: '+now+' + ? = '+cap+'.',
      explain:cap+' − '+now+' = '+ans+' more liters fill the tank.',speak:'How many more liters will fill the tank?',key:'fl|'+cap+'|'+now});
  }}
});

window.TARGETS.push(
 {id:'ch13-comparing',chapter:'ch13',title:'Comparing Capacity',art:'🪣',blurb:'Which holds more water?',audio:'audio/m5-ch13-comparing.mp3',controlsAudio:'audio/m6-controls-ch13-comparing.mp3',
  demoCaption:'Capacity is how much a container can hold. These jugs are the same size. The left jug is filled halfway. The right jug is nearly full. The right jug has more water in it. When jugs are the same size, the higher water line means more water!',demoVisual:{kind:'containers2',a:{level:50,caption:'Left jug'},b:{level:90,caption:'Right jug'},note:'Same jugs — the higher line holds more.'},
  teachingNote:'A tall, thin bottle can hold less than a short, wide pot. To be sure which holds more, pour one into the other or measure both with the same cup.',
  controls:'Look at the two jugs and tap which one has more water — or which container can hold more when it is full.',guidedFamilies:['ch13-amount'],families:['ch13-amount','ch13-capacity'],adventureFamilies:['ch13-capacity','ch13-read-jug']},
 {id:'ch13-units',chapter:'ch13',title:'Units of Capacity',art:'🧴',blurb:'Liters, quarts, and gallons.',audio:'audio/m5-ch13-units.mp3',controlsAudio:'audio/m6-controls-ch13-units.mp3',
  demoCaption:'We measure water with units. A liter is about a big water bottle. A quart is a little less than a liter. A gallon is the biggest: one gallon holds 4 quarts — picture 4 quart jars pouring into one big gallon jug. Bathtubs and pools are measured in gallons!',demoVisual:{kind:'steps',lines:['1 gallon = 4 quarts','A liter ≈ a big water bottle','Small amounts: quarts · Big amounts: gallons']},
  teachingNote:'In much of the world, liters do all the measuring. In the United States we also use quarts and gallons: 4 quarts = 1 gallon.',
  controls:'Choose the unit that fits the job, or convert: multiply gallons by 4 to get quarts, and group quarts by 4 to get gallons.',guidedFamilies:['ch13-unit-fit'],families:['ch13-unit-fit','ch13-convert'],adventureFamilies:['ch13-convert','ch13-fill']},
 {id:'ch13-measuring',chapter:'ch13',title:'Measuring Capacity',art:'🌡️',blurb:'Read the jug and fill the tank.',audio:'audio/m5-ch13-measuring.mp3',controlsAudio:'audio/m6-controls-ch13-measuring.mp3',
  demoCaption:'A measuring jug tells you how much water you have. This jug holds 4 liters when full, and the water reaches exactly halfway. Half of 4 liters is 2 liters. Read the level, compare it with full, and you know the amount!',demoVisual:{kind:'container',level:50,caption:'Full = 4 liters',note:'Half full: 2 liters.'},
  teachingNote:'To find how much more a tank needs, count up from what it has to what it holds — the same missing-part thinking as making $1.',
  controls:'For jug questions, tap the number of liters in the jug. For tank questions, type how many more liters will fill it.',guidedFamilies:['ch13-read-jug'],families:['ch13-read-jug','ch13-fill'],adventureFamilies:['ch13-fill','ch13-convert']}
);
Object.assign(M3_OWNERS,{'ch13-amount':'ch13-comparing','ch13-capacity':'ch13-comparing','ch13-unit-fit':'ch13-units','ch13-convert':'ch13-units','ch13-read-jug':'ch13-measuring','ch13-fill':'ch13-measuring'});
for(const [fid,owner] of Object.entries(M3_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;

/* ================= Chapter 14: Graphs (Fishing Dock) ================= */
const GRAPH_THEMES=[
  {symbol:'🐟',unit:'fish',cats:['Trout','Bass','Perch','Pike'],title:'Fish caught at the dock'},
  {symbol:'🍎',unit:'apples',cats:['Red','Green','Yellow','Crab'],title:'Apples picked'},
  {symbol:'🐦',unit:'birds',cats:['Finch','Wren','Jay','Owl'],title:'Birds seen at camp'},
  {symbol:'📚',unit:'books',cats:['Ana','Ben','Cleo','Dan'],title:'Books read this week'}
];
function pictoData(per,maxSym){
  const theme=R.choice(GRAPH_THEMES);
  const cats=R.shuffle([...theme.cats]).slice(0,3);
  const data=cats.map(label=>{ const syms=R.int(1,maxSym||6); return {label,value:syms*per,syms}; });
  return {theme,data,per};
}
function barData(maxV){
  const theme=R.choice(GRAPH_THEMES);
  const cats=R.shuffle([...theme.cats]).slice(0,4);
  return {theme,data:cats.map(label=>({label,value:R.int(1,maxV||9)}))};
}
Object.assign(window.FAMILIES,{
  /* --- Read a scaled picture graph --- */
  'ch14-picto-read':{gen(){
    const per=R.choice([2,5]),g=pictoData(per),d=R.choice(g.data);
    return problem({math:{type:'value',value:d.value},
      html:g.theme.title+'.<br>How many '+g.theme.unit+' for '+d.label+'?',answer:String(d.value),
      choices:mcqChoices(d.value,[d.value+g.per,d.value-g.per,d.syms]),answerUnit:g.theme.unit,
      visual:{type:'picto',data:g.data,symbol:g.theme.symbol,per},
      hint:'Each '+g.theme.symbol+' stands for '+per+'. Count the symbols, then count by '+per+'s.',
      guide:d.label+' has '+d.syms+' symbols. '+d.syms+' × '+per+' = '+d.value+'.',
      explain:d.label+': '+d.syms+' symbols × '+per+' = '+d.value+' '+g.theme.unit+'.',
      speak:'How many '+g.theme.unit+' for '+d.label+'?',key:'pr|'+per+'|'+d.label+'|'+d.value});
  }},
  /* --- How many symbols? --- */
  'ch14-picto-symbols':{gen(){
    const per=R.choice([2,5,10]),g=pictoData(per),d=R.choice(g.data);
    return problem({math:{type:'value',value:d.syms},
      html:g.theme.title+'. Each '+g.theme.symbol+' = '+per+'.<br>'+d.label+' has '+d.value+' '+g.theme.unit+'. How many '+g.theme.symbol+' symbols are drawn?',answer:String(d.syms),
      choices:mcqChoices(d.syms,[d.syms+1,d.syms-1,d.value]),answerUnit:'symbols',
      visual:{type:'picto',data:g.data,symbol:g.theme.symbol,per},
      hint:'Divide the value into groups of '+per+'.',
      guide:d.value+' ÷ '+per+' = '+d.syms+' symbols.',
      explain:d.value+' '+g.theme.unit+' make '+d.syms+' symbols of '+per+'.',
      speak:'How many symbols are drawn for '+d.label+'?',key:'ps|'+per+'|'+d.label+'|'+d.syms});
  }},
  /* --- Read a bar graph (scale of 1) --- */
  'ch14-bar-read':{gen(){
    const g=barData(),d=R.choice(g.data);
    return problem({math:{type:'value',value:d.value},
      html:g.theme.title+'.<br>How many '+g.theme.unit+' for '+d.label+'?',answer:String(d.value),
      choices:mcqChoices(d.value,[d.value+1,d.value-1,d.value+2]),answerUnit:g.theme.unit,
      visual:{type:'bargraph',data:g.data},
      hint:'Find the bar for '+d.label+' and read its height on the scale.',
      guide:'Each step up the scale is 1.',
      explain:'The '+d.label+' bar reaches '+d.value+'.',speak:'How many '+g.theme.unit+' for '+d.label+'?',key:'br|'+d.label+'|'+d.value});
  }},
  /* --- Most and least on a bar graph --- */
  'ch14-bar-most':{gen(){
    const g=barData();let sorted=[...g.data].sort((x,y)=>y.value-x.value);
    if(sorted[0].value===sorted[1].value||sorted[sorted.length-1].value===sorted[sorted.length-2].value)return this.gen();
    const pick=R.f()<.5?'most':'least',d=pick==='most'?sorted[0]:sorted[sorted.length-1];
    return problem({math:{type:'text',answer:d.label},
      html:g.theme.title+'.<br>Which has the '+pick+'?',answer:d.label,choices:R.shuffle(g.data.map(x=>x.label)),
      visual:{type:'bargraph',data:g.data},
      hint:'The tallest bar has the most. The shortest bar has the least.',
      guide:'Compare the heights of all the bars.',
      explain:d.label+' has the '+pick+': '+d.value+'.',speak:'Which has the '+pick+'?',key:'bm|'+pick+'|'+d.label});
  }},
  /* --- Difference questions --- */
  'ch14-diff':{gen(){
    const g=barData();const a=R.choice(g.data);let b=R.choice(g.data);if(b===a||b.value===a.value)return this.gen();
    const big=a.value>b.value?a:b,small=a.value>b.value?b:a,diff=big.value-small.value;
    return problem({math:{type:'difference',a:small.value,b:1,c:big.value,d:1},
      html:g.theme.title+'.<br>How many more '+g.theme.unit+' does '+big.label+' have than '+small.label+'?',answer:String(diff),
      choices:mcqChoices(diff,[diff+1,diff-1,big.value]),answerUnit:g.theme.unit,
      visual:{type:'bargraph',data:g.data},
      hint:'Find both bars, then subtract the smaller number from the bigger one.',
      guide:big.label+' has '+big.value+'. '+small.label+' has '+small.value+'. Subtract.',
      explain:big.value+' − '+small.value+' = '+diff+' more.',speak:'How many more does '+big.label+' have than '+small.label+'?',key:'df|'+big.label+'|'+small.label});
  }},
  /* --- Total questions --- */
  'ch14-total':{gen(){
    const per=R.choice([1,2,5]),g=per===1?barData():pictoData(per);
    const a=R.choice(g.data);let b=R.choice(g.data);if(b===a)return this.gen();
    const total=a.value+b.value;
    return problem({math:{type:'add',a:a.value,b:b.value},
      html:g.theme.title+'.<br>How many '+g.theme.unit+' do '+a.label+' and '+b.label+' have altogether?',answer:String(total),
      choices:mcqChoices(total,[total+per,total-per,Math.abs(a.value-b.value)]),answerUnit:g.theme.unit,
      visual:per===1?{type:'bargraph',data:g.data}:{type:'picto',data:g.data,symbol:g.theme.symbol,per},
      hint:'Read both numbers from the graph, then add them.',
      guide:a.label+' has '+a.value+'. '+b.label+' has '+b.value+'. Add them.',
      explain:a.value+' + '+b.value+' = '+total+'.',speak:'How many altogether?',key:'tt|'+a.label+'|'+b.label+'|'+total});
  }}
});

window.TARGETS.push(
 {id:'ch14-picture',chapter:'ch14',title:'Picture Graphs',art:'🖼️',blurb:'Each symbol stands for more than 1.',audio:'audio/m5-ch14-picture.mp3',controlsAudio:'audio/m6-controls-ch14-picture.mp3',
  demoCaption:'A picture graph uses symbols — and each symbol can stand for more than 1! Here each fish stands for 2 fish. Trout has 3 symbols: 2, 4, 6 — that is 6 fish. Always read the key first: it tells you what each symbol is worth!',demoVisual:{kind:'picto',data:[{label:'Trout',value:6},{label:'Bass',value:4},{label:'Perch',value:8}],symbol:'🐟',per:2,note:'Key: each 🐟 = 2 fish. Count by 2s.'},
  teachingNote:'If a row shows half a symbol in some graphs, it means half the key value. Our camp graphs use whole symbols only.',
  controls:'Read the key first — what is each symbol worth? Count the symbols for the row, then count by that number.',guidedFamilies:['ch14-picto-read'],families:['ch14-picto-read','ch14-picto-symbols'],adventureFamilies:['ch14-picto-symbols','ch14-total']},
 {id:'ch14-bar',chapter:'ch14',title:'Bar Graphs',art:'📊',blurb:'Read the heights of the bars.',audio:'audio/m5-ch14-bar.mp3',controlsAudio:'audio/m6-controls-ch14-bar.mp3',
  demoCaption:'A bar graph uses bars and a scale. Our scale counts by 1: each step up is one more. Find the bar, follow its top across to the scale, and read the number. The Bass bar reaches 4, so 4 bass were caught. Tallest bar means most!',demoVisual:{kind:'bargraph',data:[{label:'Trout',value:6},{label:'Bass',value:4},{label:'Perch',value:7},{label:'Pike',value:2}],note:'Scale of 1: read each bar top on the number line.'},
  teachingNote:'Always check the scale before reading a graph — a scale of 1 is easy, but other graphs count by 2s, 5s, or 10s, like our picture graphs.',
  controls:'Find the right bar, read its height, and tap the number — or tap which bar has the most or the least.',guidedFamilies:['ch14-bar-read'],families:['ch14-bar-read','ch14-bar-most'],adventureFamilies:['ch14-bar-most','ch14-diff']},
 {id:'ch14-questions',chapter:'ch14',title:'Graph Questions',art:'❓',blurb:'Compare and combine graph data.',audio:'audio/m5-ch14-questions.mp3',controlsAudio:'audio/m6-controls-ch14-questions.mp3',
  demoCaption:'Graphs answer questions. Perch has 7 and Bass has 4. How many more perch? Subtract: 7 − 4 = 3 more. How many altogether? Add: 7 + 4 = 11. Read the two numbers off the graph first — then decide: comparing means subtract, combining means add!',demoVisual:{kind:'bargraph',data:[{label:'Trout',value:6},{label:'Bass',value:4},{label:'Perch',value:7},{label:'Pike',value:2}],note:'More than → subtract. Altogether → add.'},
  teachingNote:'The words are the clue: “how many more” asks for a difference; “altogether” or “in all” asks for a total.',
  controls:'Read both numbers from the graph first. Then add for altogether questions, or subtract for how-many-more questions.',guidedFamilies:['ch14-diff'],families:['ch14-diff','ch14-total'],adventureFamilies:['ch14-total','ch14-picto-symbols']}
);
Object.assign(M3_OWNERS,{'ch14-picto-read':'ch14-picture','ch14-picto-symbols':'ch14-picture','ch14-bar-read':'ch14-bar','ch14-bar-most':'ch14-bar','ch14-diff':'ch14-questions','ch14-total':'ch14-questions'});
for(const [fid,owner] of Object.entries(M3_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;

/* ================= Chapter 15: Shapes (Woodland Workshop) ================= */
const POLY_NAMES={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'};
Object.assign(window.FAMILIES,{
  /* --- Open or closed? --- */
  'ch15-open':{gen(){
    const kinds=[[{kind:'open'},'Open'],[{kind:'polygon',sides:5},'Closed'],[{kind:'circle'},'Closed'],[{kind:'polygon',sides:3},'Closed'],[{kind:'open'},'Open'],[{kind:'semicircle'},'Closed']];
    const pick=R.choice(kinds);
    return problem({math:{type:'text',answer:pick[1]},
      html:'Is this shape open or closed?',answer:pick[1],choices:['Open','Closed'],
      visual:{type:'shape',...pick[0]},
      hint:'A closed shape has no gaps — you could fill it with water and none would leak out.',
      guide:'Trace the edge with your eyes. Do you come back to where you started?',
      explain:'This shape is '+pick[1].toLowerCase()+'.',speak:'Is this shape open or closed?',key:'op|'+pick[0].kind+'|'+(pick[0].sides||'')});
  }},
  /* --- Count straight or curved sides --- */
  'ch15-count-sides':{gen(){
    const shapes=[
      {spec:{kind:'polygon',sides:3},straight:3,curved:0,name:'triangle'},
      {spec:{kind:'polygon',sides:4},straight:4,curved:0,name:'quadrilateral'},
      {spec:{kind:'polygon',sides:6},straight:6,curved:0,name:'hexagon'},
      {spec:{kind:'circle'},straight:0,curved:1,name:'circle'},
      {spec:{kind:'semicircle'},straight:1,curved:1,name:'semicircle'},
      {spec:{kind:'curved-sides'},straight:0,curved:2,name:'leaf shape'}];
    const s=R.choice(shapes),askStraight=R.f()<.6,ans=askStraight?s.straight:s.curved;
    return problem({math:{type:'value',value:ans},
      html:'How many '+(askStraight?'straight':'curved')+' sides does this shape have?',answer:String(ans),choices:null,
      visual:{type:'shape',...s.spec},
      hint:'Run your finger along each side. Straight sides are flat like a ruler.',
      guide:'Count one side at a time, all the way around.',
      explain:'The '+s.name+' has '+s.straight+' straight and '+s.curved+' curved side'+(s.curved===1?'':'s')+'.',
      speak:'How many '+(askStraight?'straight':'curved')+' sides?',key:'cs|'+s.name+'|'+(askStraight?'s':'c')});
  }},
  /* --- Name the polygon --- */
  'ch15-name':{gen(){
    const sides=R.choice([3,4,5,6,7,8]),name=POLY_NAMES[sides];
    return problem({math:{type:'text',answer:name},
      html:'What is this polygon called?',answer:name,
      choices:textMCQ(name,Object.values(POLY_NAMES)),
      visual:{type:'shape',kind:'polygon',sides},
      hint:'Count the sides. The name tells how many!',
      guide:'3 triangle · 4 quadrilateral · 5 pentagon · 6 hexagon · 7 heptagon · 8 octagon.',
      explain:sides+' sides make a '+name+'.',speak:'What is this polygon called?',key:'nm|'+sides});
  }},
  /* --- Sides and corners of a named polygon --- */
  'ch15-sides-corners':{gen(){
    const sides=R.choice([3,4,5,6,8]),askSides=R.f()<.5;
    return problem({math:{type:'value',value:sides},
      html:'How many '+(askSides?'sides':'corners')+' does a '+POLY_NAMES[sides]+' have?',answer:String(sides),choices:null,
      hint:'A polygon has the same number of sides and corners.',
      guide:'Picture the shape and count around it.',
      explain:'A '+POLY_NAMES[sides]+' has '+sides+' sides and '+sides+' corners.',
      speak:'How many '+(askSides?'sides':'corners')+' does a '+POLY_NAMES[sides]+' have?',key:'sc|'+sides+'|'+(askSides?'s':'c')});
  }},
  /* --- Name circle parts --- */
  'ch15-identify':{gen(){
    const kinds=[[{kind:'semicircle'},'semicircle'],[{kind:'quarter'},'quarter-circle'],[{kind:'circle'},'circle']];
    const pick=R.choice(kinds);
    return problem({math:{type:'text',answer:pick[1]},
      html:'What is this shape?',answer:pick[1],choices:['semicircle','quarter-circle','circle'],
      visual:{type:'shape',...pick[0]},
      hint:'A semicircle is half a circle. A quarter-circle is half of that again.',
      guide:'Compare it with a whole circle. How much of the circle is there?',
      explain:'This is a '+pick[1]+'.',speak:'What is this shape?',key:'id|'+pick[1]});
  }},
  /* --- How many parts make a whole circle? --- */
  'ch15-combine':{gen(){
    const bank=[['semicircles',2],['quarter-circles',4]];
    const pick=R.choice(bank);
    const extra=pick[0]==='quarter-circles'&&R.f()<.4;
    if(extra)return problem({math:{type:'value',value:2},
      html:'How many quarter-circles make a semicircle?',answer:'2',choices:null,
      hint:'A semicircle is half a circle. A quarter-circle is half of a semicircle.',
      guide:'Two quarters make a half — the same with circles.',explain:'2 quarter-circles = 1 semicircle.',
      speak:'How many quarter-circles make a semicircle?',key:'cb|qs'});
    return problem({math:{type:'value',value:pick[1]},
      html:'How many '+pick[0]+' make one whole circle?',answer:String(pick[1]),choices:null,
      hint:pick[0]==='semicircles'?'Semi means half. Two halves make a whole.':'Quarter means one of 4 equal parts.',
      guide:'Put the parts together in your mind until the circle is complete.',
      explain:pick[1]+' '+pick[0]+' make 1 whole circle.',speak:'How many '+pick[0]+' make one whole circle?',key:'cb|'+pick[0]});
  }},
  /* --- What comes next in the pattern? --- */
  'ch15-pattern-next':{gen(){
    const tri={kind:'polygon',sides:3},sq={kind:'polygon',sides:4},cir={kind:'circle'},pent={kind:'polygon',sides:5};
    const units=[[tri,sq],[cir,tri],[sq,pent,cir],[tri,tri,sq]];
    const unit=R.choice(units),items=[];
    while(items.length<6)items.push(...unit);
    const shown=items.slice(0,6),missingSpec=items[6]||unit[0];
    const nameOf=s=>s.kind==='circle'?'circle':POLY_NAMES[s.sides];
    const ans=nameOf(missingSpec);
    return problem({math:{type:'text',answer:ans},
      html:'What shape comes next in the pattern?',answer:ans,
      choices:textMCQ(ans,['triangle','quadrilateral','pentagon','circle']),
      visual:{type:'pattern',items:[...shown,missingSpec],missing:6},
      hint:'Find the part that repeats. The pattern starts over again and again.',
      guide:'Say the shapes in order until you hear the repeating part.',
      explain:'The repeating unit is '+unit.map(nameOf).join(', ')+'. Next comes '+ans+'.',
      speak:'What shape comes next?',key:'pn|'+unit.map(nameOf).join(',')+'|'+items.length});
  }},
  /* --- Growing pattern: sides increase by 1 --- */
  'ch15-pattern-grow':{gen(){
    const start=R.choice([3,4]);
    const items=[0,1,2,3].map(i=>({kind:'polygon',sides:start+i}));
    const ans=POLY_NAMES[start+4];
    return problem({math:{type:'text',answer:ans},
      html:'These polygons are growing. What polygon comes next?',answer:ans,
      choices:textMCQ(ans,Object.values(POLY_NAMES)),
      visual:{type:'pattern',items:[...items,{kind:'polygon',sides:start+4}],missing:4},
      hint:'Count the sides of each polygon. What is the pattern?',
      guide:'Each polygon has one more side than the one before.',
      explain:'Sides go '+(start)+', '+(start+1)+', '+(start+2)+', '+(start+3)+', so next is '+(start+4)+': a '+ans+'.',
      speak:'What polygon comes next?',key:'pg|'+start});
  }},
  /* --- Name the solid --- */
  'ch15-solid-name':{gen(){
    const solids=[['cube','🧊'],['sphere','🔮'],['cylinder','🥫'],['cone','🎉']];
    const pick=R.choice(solids);
    return problem({math:{type:'text',answer:pick[0]},
      html:'What is this solid shape?',answer:pick[0],choices:textMCQ(pick[0],solids.map(s=>s[0])),
      visual:{type:'shape',kind:'solid',solid:pick[0]},
      hint:'Is it round like a ball, pointy like a party hat, or flat-sided like a box?',
      guide:'A sphere is perfectly round. A cylinder is like a can. A cone has a point. A cube is like a block.',
      explain:'This solid is a '+pick[0]+'.',speak:'What is this solid shape?',key:'sn|'+pick[0]});
  }},
  /* --- Solid attributes --- */
  'ch15-solid-attrs':{gen(){
    const bank=[
      ['How many faces does a cube have?',6,'A cube has 6 faces.'],
      ['How many edges does a cube have?',12,'A cube has 12 edges.'],
      ['How many corners does a cube have?',8,'A cube has 8 corners.'],
      ['How many corners does a sphere have?',0,'A sphere has 0 corners — it is perfectly round.'],
      ['How many corners does a cylinder have?',0,'A cylinder has 0 corners.'],
      ['How many flat faces does a cone have?',1,'A cone has 1 flat face — the round base.']];
    const pick=R.choice(bank);
    return problem({math:{type:'value',value:pick[1]},
      html:pick[0],answer:String(pick[1]),choices:null,
      hint:'Faces are the flat sides. Edges are where faces meet. Corners are the pointy spots.',
      guide:'Picture the solid and count carefully, one at a time.',
      explain:pick[2],speak:pick[0],key:'sa|'+pick[0]});
  }}
});

window.TARGETS.push(
 {id:'ch15-sides',chapter:'ch15',title:'Straight and Curved Sides',art:'〰️',blurb:'Open and closed shapes.',audio:'audio/m5-ch15-sides.mp3',controlsAudio:'audio/m6-controls-ch15-sides.mp3',
  demoCaption:'Shapes can have straight sides, curved sides, or both. A closed shape has no gaps — trace its edge and you come back to the start. An open shape has a gap. A circle is closed with one curved side. A semicircle has one straight side and one curved side!',demoVisual:{kind:'shapes-row',shapes:[{kind:'open',label:'open'},{kind:'polygon',sides:4,label:'closed: straight'},{kind:'semicircle',label:'closed: both'}],note:'Trace the edge: does it come back to the start?'},
  teachingNote:'“Side” means one edge of a shape. Polygons have only straight sides; circles and semicircles bring in curves.',
  controls:'Decide if the shape is open or closed, or count its straight or curved sides. Type the number for counting questions.',guidedFamilies:['ch15-open'],families:['ch15-open','ch15-count-sides'],adventureFamilies:['ch15-count-sides','ch15-name']},
 {id:'ch15-polygons',chapter:'ch15',title:'Polygons',art:'🔷',blurb:'Name shapes by their sides.',audio:'audio/m5-ch15-polygons.mp3',controlsAudio:'audio/m6-controls-ch15-polygons.mp3',
  demoCaption:'A polygon is a closed shape with straight sides. Count the sides and you know its name: 3 sides a triangle, 4 a quadrilateral, 5 a pentagon, 6 a hexagon, 7 a heptagon, 8 an octagon — like a stop sign! A polygon always has the same number of corners as sides.',demoVisual:{kind:'shapes-row',shapes:[{kind:'polygon',sides:3,label:'triangle · 3'},{kind:'polygon',sides:5,label:'pentagon · 5'},{kind:'polygon',sides:6,label:'hexagon · 6'},{kind:'polygon',sides:8,label:'octagon · 8'}],note:'Count sides to name the polygon.'},
  teachingNote:'Quadrilateral is the family name for all 4-sided polygons — squares and rectangles are special quadrilaterals.',
  controls:'Count the sides of the polygon and tap its name, or type how many sides or corners a named polygon has.',guidedFamilies:['ch15-name'],families:['ch15-name','ch15-sides-corners'],adventureFamilies:['ch15-sides-corners','ch15-pattern-grow']},
 {id:'ch15-circles',chapter:'ch15',title:'Semicircles and Quarter-circles',art:'◑',blurb:'Halves and quarters of a circle.',audio:'audio/m5-ch15-circles.mp3',controlsAudio:'audio/m6-controls-ch15-circles.mp3',
  demoCaption:'Cut a circle in half and you get a semicircle — semi means half. Cut a semicircle in half and you get a quarter-circle. Two semicircles make a whole circle, and 4 quarter-circles do too. These are fractions wearing shape costumes!',demoVisual:{kind:'shapes-row',shapes:[{kind:'semicircle',label:'semicircle'},{kind:'quarter',label:'quarter-circle'},{kind:'circle',label:'whole circle'}],note:'2 semicircles = 1 circle. 4 quarter-circles = 1 circle.'},
  teachingNote:'Combining shapes makes new shapes: two quarter-circles can make a semicircle or a whole new design — builders and artists use this idea constantly.',
  controls:'Name the circle part shown, or type how many of them make a whole circle.',guidedFamilies:['ch15-identify'],families:['ch15-identify','ch15-combine'],adventureFamilies:['ch15-combine','ch15-pattern-next']},
 {id:'ch15-patterns',chapter:'ch15',title:'Patterns',art:'🔁',blurb:'Find what repeats — and what grows.',audio:'audio/m5-ch15-patterns.mp3',controlsAudio:'audio/m6-controls-ch15-patterns.mp3',
  demoCaption:'A pattern has a part that repeats: triangle, square, triangle, square — the unit is triangle-square, so a triangle comes next. Other patterns GROW: triangle, quadrilateral, pentagon — each shape gains a side, so a hexagon comes next. First find the rule, then the next shape is easy!',demoVisual:{kind:'pattern',items:[{kind:'polygon',sides:3},{kind:'polygon',sides:4},{kind:'polygon',sides:3},{kind:'polygon',sides:4},{kind:'polygon',sides:3}],note:'Unit: triangle, square. It repeats!'},
  teachingNote:'Saying the pattern out loud (“triangle, square, triangle, square”) is the fastest way to hear its repeating unit.',
  controls:'Look at the shapes and find the repeating part or the growing rule. Tap the shape that comes next.',guidedFamilies:['ch15-pattern-next'],families:['ch15-pattern-next','ch15-pattern-grow'],adventureFamilies:['ch15-pattern-grow','ch15-solid-name']},
 {id:'ch15-solids',chapter:'ch15',title:'Solid Shapes',art:'🧊',blurb:'Cubes, spheres, cylinders, cones.',audio:'audio/m5-ch15-solids.mp3',controlsAudio:'audio/m6-controls-ch15-solids.mp3',
  demoCaption:'Solid shapes are 3D — they take up space. A cube is like a block: 6 flat faces, 12 edges, 8 corners. A sphere is perfectly round like a ball, with no corners at all. A cylinder is like a can, and a cone is like a party hat with one point. Flat faces, edges, and corners describe every solid!',demoVisual:{kind:'shapes-row',shapes:[{kind:'solid',solid:'cube',label:'cube'},{kind:'solid',solid:'sphere',label:'sphere'},{kind:'solid',solid:'cylinder',label:'cylinder'},{kind:'solid',solid:'cone',label:'cone'}],note:'Cube: 6 faces, 12 edges, 8 corners. Sphere: 0 corners.'},
  teachingNote:'Faces are flat sides, edges are where two faces meet, and corners (vertices) are where edges meet. Curved surfaces, like a sphere’s, are not faces.',
  controls:'Name the solid shown, or type how many faces, edges, or corners it has.',guidedFamilies:['ch15-solid-name'],families:['ch15-solid-name','ch15-solid-attrs'],adventureFamilies:['ch15-solid-attrs','ch15-sides-corners']}
);
Object.assign(M3_OWNERS,{'ch15-open':'ch15-sides','ch15-count-sides':'ch15-sides','ch15-name':'ch15-polygons','ch15-sides-corners':'ch15-polygons','ch15-identify':'ch15-circles','ch15-combine':'ch15-circles','ch15-pattern-next':'ch15-patterns','ch15-pattern-grow':'ch15-patterns','ch15-solid-name':'ch15-solids','ch15-solid-attrs':'ch15-solids'});
for(const [fid,owner] of Object.entries(M3_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;
