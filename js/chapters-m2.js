/* Camp Wildwood — Milestone 2 content: Chapter 10 Money (Trading Post).
   Amounts are handled in cents; fmtMoney renders dollars-and-cents notation.
   Chapter 11 is appended in the same file. Stable IDs preserve saved camps. */
'use strict';

function coinsFor(cents){
  const out=[];let rest=cents;
  for(const c of [25,10,5,1]){ while(rest>=c){ out.push(c); rest-=c; } }
  return out;
}
function moneyMCQ(answer,distractors){
  const out=[fmtMoney(answer)],seen=new Set(out);
  for(const d of R.shuffle(distractors)){
    if(out.length>=4)break;
    if(Number.isInteger(d)&&d>=0){ const t=fmtMoney(d); if(!seen.has(t)){ out.push(t); seen.add(t); } }
  }
  for(let d=answer+10;out.length<4;d+=10){ const t=fmtMoney(d); if(!seen.has(t)){ out.push(t); seen.add(t); } }
  return R.shuffle(out);
}
function moneyProblem(fields){ fields.moneyText=true; return problem(fields); }

Object.assign(window.FAMILIES,{
  /* --- Making $1: complements of 100 cents --- */
  'ch10-make1':{gen(){
    const a=R.choice([5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95]),ans=100-a;
    return problem({math:{type:'missing-addend',a,total:100},
      html:'You have '+a+'¢.<br>How much more do you need to make $1?',answer:String(ans),
      choices:mcqChoices(ans,[100-a+10,100-a-10,a]),answerUnit:'cents',visual:{type:'money',coins:coinsFor(a)},
      hint:'A dollar is 100 cents. Count up from '+a+'¢ to 100¢.',
      guide:'First count up to the next ten, then count the tens to 100.',
      explain:a+'¢ + '+ans+'¢ = 100¢ = $1. The missing part is '+ans+'¢.',
      speak:'You have '+a+' cents. How much more do you need to make one dollar?',key:String(a)});
  }},
  /* --- Counting money: bills and coins up to $20 --- */
  'ch10-count':{gen(){
    const style=R.choice(['coins','mixed','bills']);
    let coins=[];
    if(style==='coins'){ coins=coinsFor(R.choice([25,50,75])*1+R.int(0,24)); coins=coinsFor(coins.reduce((s,c)=>s+c,0)); }
    else if(style==='mixed'){ const bill=R.choice([100,500]); coins=[bill,...coinsFor(R.int(1,19)*5)]; }
    else { coins=[R.choice([100,500,1000]),R.choice([100,500])]; if(R.f()<.5)coins.push(...coinsFor(R.int(1,19)*5)); }
    const total=coins.reduce((s,c)=>s+c,0);
    return moneyProblem({math:{type:'money',op:'count',cents:total},
      html:'How much money is this?',answer:fmtMoney(total),
      choices:moneyMCQ(total,[total+10,total-10,total+25,total-25,Math.floor(total/100)*100+(total%100===0?10:(total%100<10?total%100+90:total%100-9))]),
      visual:{type:'money',coins},
      hint:'Count on from the biggest bill or coin.',
      guide:'Start with the largest value, then add each coin: count by 25s, 10s, 5s, and 1s.',
      explain:'Counting on gives '+fmtMoney(total)+'.',speak:'How much money is this?',key:coins.join(',')});
  }},
  /* --- Conversions between cents and dollars-and-cents --- */
  'ch10-convert':{gen(){
    const dollars=R.int(1,9),cents=R.choice([5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95]),total=dollars*100+cents;
    if(R.f()<.5){
      return problem({math:{type:'money',op:'convert',cents:total},
        html:fmtMoney(total)+' is how many cents?',answer:String(total),choices:null,answerUnit:'cents',
        hint:'Each dollar is 100 cents.',guide:dollars+' dollars = '+(dollars*100)+' cents. Add '+cents+' more cents.',
        explain:fmtMoney(total)+' = '+(dollars*100)+'¢ + '+cents+'¢ = '+total+'¢.',speak:fmtMoney(total)+' is how many cents?',key:'c'+total});
    }
    return problem({math:{type:'money',op:'convert',cents},
      html:total+'¢ = '+fmtMoney(dollars*100)+' and how many more cents?',answer:String(cents),choices:null,answerUnit:'cents',
      hint:'Take away the whole dollars first.',guide:total+'¢ − '+(dollars*100)+'¢ for the '+dollars+' dollars leaves the extra cents.',
      explain:total+'¢ = '+fmtMoney(total)+'. After '+dollars+' whole dollars, '+cents+'¢ are left.',speak:total+' cents is '+dollars+' dollars and how many more cents?',key:'d'+total});
  }},
  /* --- Making change from $1 (guided, cents answer) --- */
  'ch10-change':{gen(){
    const price=R.choice([15,25,30,35,40,45,55,60,65,70,75,80,85,90,95]),ans=100-price;
    return problem({math:{type:'money',op:'change',a:100,b:price},
      html:'A sticker costs '+price+'¢. You pay with $1.<br>How much change do you get?',answer:String(ans),
      choices:mcqChoices(ans,[ans+10,ans-10,price]),answerUnit:'cents',visual:{type:'money',coins:[100]},
      hint:'Change is what is left of the dollar. Count up from '+price+'¢ to 100¢.',
      guide:'Count up: '+price+'¢ to the next ten, then to 100¢. Add the two jumps.',
      explain:'100¢ − '+price+'¢ = '+ans+'¢ of change.',speak:'A sticker costs '+price+' cents. You pay with one dollar. How much change?',key:String(price)});
  }},
  /* --- Making change from $5 or $10 (money entry) --- */
  'ch10-change-big':{gen(){
    const pay=R.choice([500,1000]),price=R.int(21,95)*5+(R.f()<.5?0:0),p2=Math.min(price,pay-25),ans=pay-p2;
    return problem({math:{type:'money',op:'change',a:pay,b:p2},moneyEntry:true,
      html:'A camp T-shirt costs '+fmtMoney(p2)+'. You pay with '+fmtMoney(pay)+'.<br>How much change do you get?',answer:String(ans),answerText:fmtMoney(ans),choices:null,
      hint:'Count up from '+fmtMoney(p2)+' to '+fmtMoney(pay)+'.',
      guide:'First count up to the next whole dollar, then count the dollars.',
      explain:fmtMoney(pay)+' − '+fmtMoney(p2)+' = '+fmtMoney(ans)+' of change.',speak:'The T-shirt costs '+fmtMoney(p2)+'. You pay with '+fmtMoney(pay)+'. How much change?',key:pay+'|'+p2});
  }},
  /* --- Comparing money --- */
  'ch10-compare':{gen(){
    const pick=R.f()<.5?'more':'less';
    let a=R.int(21,95)*10+R.choice([0,5]),b=a;
    while(b===a)b=R.int(21,95)*10+R.choice([0,5]);
    const ans=pick==='more'?Math.max(a,b):Math.min(a,b);
    return moneyProblem({math:{type:'money',op:'compare',a,b,pick:pick==='more'?'more':'less'},
      html:'Which amount is '+pick+'?<br>'+fmtMoney(a)+' or '+fmtMoney(b),answer:fmtMoney(ans),
      choices:R.shuffle([fmtMoney(a),fmtMoney(b)]),
      hint:'Compare the dollars first. If the dollars are equal, compare the cents.',
      guide:'Look at the dollars, then the cents, one place at a time.',
      explain:fmtMoney(ans)+' is '+pick+' than '+fmtMoney(ans===a?b:a)+'.',speak:'Which amount is '+pick+': '+fmtMoney(a)+' or '+fmtMoney(b)+'?',key:pick+'|'+a+'|'+b});
  }},
  /* --- Adding money with coin pictures (guided, choices) --- */
  'ch10-add-coins':{gen(){
    const a=R.int(11,39)*5,b=R.int(11,39)*5,total=a+b;
    return moneyProblem({math:{type:'money',op:'add',a,b},
      html:'Add the two groups of coins.<br>How much money altogether?',answer:fmtMoney(total),
      choices:moneyMCQ(total,[total+10,total-10,total+5]),visual:{type:'money',coins:[...coinsFor(a),...coinsFor(b)]},
      hint:'Count all the coins together, biggest first.',
      guide:'The first group is '+fmtMoney(a)+'. Count on by the second group to '+fmtMoney(total)+'.',
      explain:fmtMoney(a)+' + '+fmtMoney(b)+' = '+fmtMoney(total)+'.',speak:'Add the two groups of coins. How much altogether?',key:'g'+a+'|'+b});
  }},
  /* --- Adding money within $10 (money entry) --- */
  'ch10-add':{gen(){
    const a=R.int(105,600),b=R.int(105,995-a),total=a+b;
    const items=[['A muffin costs ','A juice costs '],['A cap costs ','A whistle costs '],['A kite costs ','A ball costs ']];
    const pair=R.choice(items);
    return problem({math:{type:'money',op:'add',a,b},moneyEntry:true,
      html:pair[0]+fmtMoney(a)+'. '+pair[1]+fmtMoney(b)+'.<br>How much do they cost altogether?',answer:String(total),answerText:fmtMoney(total),choices:null,
      hint:'Add the dollars, then add the cents. Watch for 100 cents making a new dollar.',
      guide:'Cents first: '+(a%100)+'¢ + '+(b%100)+'¢ = '+((a%100)+(b%100))+'¢. Then add the dollars.',
      explain:fmtMoney(a)+' + '+fmtMoney(b)+' = '+fmtMoney(total)+'.',speak:'How much do they cost altogether?',key:a+'|'+b});
  }},
  /* --- Subtracting money with coin pictures (guided, choices) --- */
  'ch10-sub-coins':{gen(){
    const a=R.int(30,95)*5,b=R.int(5,Math.floor(a/5)-1)*5,diff=a-b;
    return moneyProblem({math:{type:'money',op:'sub',a,b},
      html:'You have '+fmtMoney(a)+'. You spend '+fmtMoney(b)+' on a snack.<br>How much is left?',answer:fmtMoney(diff),
      choices:moneyMCQ(diff,[diff+10,diff-10,a]),visual:{type:'money',coins:coinsFor(a)},
      hint:'Count back from '+fmtMoney(a)+', or count up from '+fmtMoney(b)+'.',
      guide:'Start at '+fmtMoney(b)+' and count up to '+fmtMoney(a)+'. The jump is what is left.',
      explain:fmtMoney(a)+' − '+fmtMoney(b)+' = '+fmtMoney(diff)+'.',speak:'How much money is left?',key:'s'+a+'|'+b});
  }},
  /* --- Subtracting money within $10 (money entry) --- */
  'ch10-sub':{gen(){
    const a=R.int(200,1000),b=R.int(105,a-50),diff=a-b;
    return problem({math:{type:'money',op:'sub',a,b},moneyEntry:true,
      html:'You have '+fmtMoney(a)+'. You buy a game for '+fmtMoney(b)+'.<br>How much money do you have left?',answer:String(diff),answerText:fmtMoney(diff),choices:null,
      hint:'Subtract the dollars, then the cents — or count up like making change.',
      guide:'Count up from '+fmtMoney(b)+' to '+fmtMoney(a)+'. That jump is the amount left.',
      explain:fmtMoney(a)+' − '+fmtMoney(b)+' = '+fmtMoney(diff)+'.',speak:'How much money is left?',key:a+'|'+b});
  }}
});

window.TARGETS.push(
 {id:'ch10-making-1',chapter:'ch10',title:'Making $1',art:'🪙',blurb:'Find the missing part of a dollar.',audio:'audio/m3-ch10-making-1.mp3',controlsAudio:'audio/m4-controls-ch10-making-1.mp3',
  demoCaption:'A dollar is 100 cents. Suppose you have 65 cents. How much more makes a dollar? Count up: 65 needs 5 to reach 70, then 30 more to reach 100. 5 + 30 = 35. So 65 cents + 35 cents = 100 cents = 1 dollar. Making $1 is making 100!',demoVisual:{kind:'hundred',a:65},
  teachingNote:'Coins that make $1 on their own: 4 quarters, 10 dimes, 20 nickels, or 100 pennies. Any mix that totals 100¢ also works.',
  controls:'Tap an answer choice. The question asks for cents — the amount still needed to reach 100¢.',guidedFamilies:['ch10-make1'],families:['ch10-make1'],adventureFamilies:['ch10-make1','ch10-convert']},
 {id:'ch10-counting',chapter:'ch10',title:'Counting Money',art:'💵',blurb:'Count bills and coins to $20.',audio:'audio/m3-ch10-counting.mp3',controlsAudio:'audio/m4-controls-ch10-counting.mp3',
  demoCaption:'Count money from the biggest value down. A $1 bill: $1.00. A quarter: $1.25. Another quarter: $1.50. A dime: $1.60. A nickel: $1.65. A penny: $1.66. Count bills first, then quarters, dimes, nickels, and pennies.',demoVisual:{kind:'money',coins:[100,25,25,10,5,1],total:166,countBy:'$1.00, $1.25, $1.50, $1.60, $1.65, $1.66'},
  teachingNote:'A dime is worth 10¢ even though it is smaller than a nickel. The coin’s name and number — not its size — tell its value.',
  controls:'Look at the bills and coins, add them up, and tap the total. Every amount is written with a dollar sign and two cents digits.',guidedFamilies:['ch10-count'],families:['ch10-count'],adventureFamilies:['ch10-count','ch10-make1']},
 {id:'ch10-change',chapter:'ch10',title:'Making Change',art:'🧾',blurb:'Count up to find the change.',audio:'audio/m3-ch10-change.mp3',controlsAudio:'audio/m4-controls-ch10-change.mp3',
  demoCaption:'A sticker costs 65 cents. You pay with $1. Your change is what is left of the dollar. Count up from 65 to 100: 65 to 70 is 5, and 70 to 100 is 30. 5 + 30 = 35. Your change is 35 cents. Counting up is the change-making strategy!',demoVisual:{kind:'hundred',a:65},
  demo2:{caption:'Bigger change works the same way. A T-shirt costs $3.75. You pay with $5. Count up: $3.75 to $4.00 is 25 cents. $4.00 to $5.00 is 1 dollar. 25 cents + $1 = $1.25 change. Always count up from the price to the amount you paid.',audio:'audio/m3-ch10-change-demo2.mp3',visual:{kind:'money',coins:[100,25],total:125,countBy:'25¢ makes $4.00, then $1 more makes $5.00 — $1.25'}},
  teachingNote:'Change for a price and the price together equal the money you paid. You can always check change by adding it back to the price.',
  controls:'For small change, tap the number of cents. For bigger change, type the amount — the box shows dollars and cents as you type.',guidedFamilies:['ch10-change'],families:['ch10-change','ch10-change-big','ch10-convert'],adventureFamilies:['ch10-change-big','ch10-convert']},
 {id:'ch10-comparing',chapter:'ch10',title:'Comparing Money',art:'⚖️',blurb:'Which amount is more or less?',audio:'audio/m3-ch10-comparing.mp3',controlsAudio:'audio/m4-controls-ch10-comparing.mp3',
  demoCaption:'Compare money place by place. $1.25 and $1.52. The dollars are equal: both are $1. Now compare the cents: 52 cents is more than 25 cents. So $1.52 is more. Dollars first, then cents!',demoVisual:{kind:'money-compare',a:{coins:[100,25],total:125},b:{coins:[100,25,25,1,1],total:152},note:'Same dollars — the cents decide.'},
  controls:'Tap the amount the question asks for — the one that is more, or the one that is less. Read the question carefully!',guidedFamilies:['ch10-compare'],families:['ch10-compare'],adventureFamilies:['ch10-compare','ch10-count']},
 {id:'ch10-adding',chapter:'ch10',title:'Adding Money',art:'➕',blurb:'Add prices within $10.',audio:'audio/m3-ch10-adding.mp3',controlsAudio:'audio/m4-controls-ch10-adding.mp3',
  demoCaption:'Add $2.75 and $1.85. Add the cents first: 75 + 85 = 160 cents. 160 cents is $1.60 — a new dollar! Add the dollars: $2 + $1 = $3. Put it together: $3 + $1.60 = $4.60. Cents first, then dollars, and regroup 100 cents as a dollar.',demoVisual:{kind:'steps',lines:['$2.75 + $1.85','Cents: 75¢ + 85¢ = 160¢ = $1.60','Dollars: $2 + $1 = $3','Total: $3 + $1.60 = $4.60']},
  teachingNote:'You can also add the dollars first and then the cents. Both orders work — just remember that 100¢ regroups into $1.',
  controls:'Type the total amount. Type cents and watch the box turn them into dollars and cents — 460 becomes $4.60.',guidedFamilies:['ch10-add-coins'],families:['ch10-add-coins','ch10-add'],adventureFamilies:['ch10-add','ch10-change-big']},
 {id:'ch10-subtracting',chapter:'ch10',title:'Subtracting Money',art:'➖',blurb:'Find what is left within $10.',audio:'audio/m3-ch10-subtracting.mp3',controlsAudio:'audio/m4-controls-ch10-subtracting.mp3',
  demoCaption:'You have $4.50 and spend $1.25. Subtract the dollars: $4 − $1 = $3. Subtract the cents: 50¢ − 25¢ = 25¢. You have $3.25 left. Dollars, then cents — just like adding, in reverse.',demoVisual:{kind:'steps',lines:['$4.50 − $1.25','Dollars: $4 − $1 = $3','Cents: 50¢ − 25¢ = 25¢','Left: $3.25']},
  demo2:{caption:'When the cents are tricky, count up instead — the change method. You pay $5 for a $3.75 game. Count up from $3.75: to $4.00 is 25 cents, to $5.00 is 1 dollar. The jump is $1.25, so $5.00 − $3.75 = $1.25. Subtracting money and making change are the same idea!',audio:'audio/m3-ch10-subtracting-demo2.mp3',visual:{kind:'steps',lines:['$5.00 − $3.75','Count up: $3.75 → $4.00 is 25¢','$4.00 → $5.00 is $1','Change: $1.25']}},
  teachingNote:'Check subtraction by adding: what is left + what you spent = what you started with.',
  controls:'Type the amount left. Type cents and watch the box turn them into dollars and cents.',guidedFamilies:['ch10-sub-coins'],families:['ch10-sub-coins','ch10-sub'],adventureFamilies:['ch10-sub','ch10-add']}
);
const M2_OWNERS={'ch10-make1':'ch10-making-1','ch10-count':'ch10-counting','ch10-convert':'ch10-change','ch10-change':'ch10-change','ch10-change-big':'ch10-change','ch10-compare':'ch10-comparing','ch10-add-coins':'ch10-adding','ch10-add':'ch10-adding','ch10-sub-coins':'ch10-subtracting','ch10-sub':'ch10-subtracting'};
for(const [fid,owner] of Object.entries(M2_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;

/* ================= Chapter 11: Fractions (Picnic Grove) ================= */
const ORDINALS={2:'half',3:'third',4:'fourth',5:'fifth',6:'sixth',7:'seventh',8:'eighth',9:'ninth',10:'tenth'};
const ORDINALS_PL={2:'halves',3:'thirds',4:'fourths',5:'fifths',6:'sixths',7:'sevenths',8:'eighths',9:'ninths',10:'tenths'};
function fracMCQ(answer,distractors){
  const out=[answer],seen=new Set(out);
  for(const d of R.shuffle(distractors||[])){
    if(out.length>=4)break;
    if(d&&d!==answer&&!seen.has(d)&&/^\d+\/\d+$/.test(d)){out.push(d);seen.add(d);}
  }
  const nd=answer.split('/').map(Number),n=nd[0],den=nd[1];
  for(const cand of [(n+1)+'/'+den,n+'/'+(den+1),(n+2)+'/'+den,'1/'+den,den+'/'+n]){
    if(out.length>=4)break; if(!seen.has(cand)){out.push(cand);seen.add(cand);}
  }
  return R.shuffle(out);
}
function nameFraction(dens){
  return function(){
    const den=R.choice(dens),num=R.int(1,den),shape=R.f()<.5?'circle':'bar';
    return problem({math:{type:'fraction',num,den},
      html:'What fraction of the shape is shaded?',answer:num+'/'+den,
      choices:fracMCQ(num+'/'+den,[(num-1)+'/'+den,(num+1)+'/'+den,num+'/'+(den+1),den+'/'+num]),
      visual:{type:'fraction',parts:den,shaded:num,shape},
      hint:'Count two things: the equal parts in all, then the shaded parts.',
      guide:'The bottom number is how many equal parts the whole is cut into. The top number is how many are shaded.',
      explain:num+' of '+den+' equal parts are shaded: '+num+'/'+den+'.',
      speak:'What fraction of the shape is shaded?',key:den+'|'+num+'|'+shape});
  };
}

Object.assign(window.FAMILIES,{
  /* --- Count the equal parts and the shaded parts --- */
  'ch11-parts':{gen(){
    const den=R.choice([2,3,4,5,6,8]),num=R.int(1,den),askParts=R.f()<.5,shape=R.f()<.5?'circle':'bar';
    const ans=askParts?den:num;
    return problem({math:{type:'fraction-count',num:ans,den},
      html:askParts?'How many equal parts is the shape cut into?':'How many parts are shaded?',answer:String(ans),choices:null,
      visual:{type:'fraction',parts:den,shaded:num,shape},
      hint:'Count carefully, one part at a time.',
      guide:askParts?'Count every part of the whole, shaded or not.':'Count only the orange parts.',
      explain:askParts?'The whole is cut into '+den+' equal parts.':'Exactly '+num+' part'+(num===1?' is':'s are')+' shaded.',
      speak:askParts?'How many equal parts is the shape cut into?':'How many parts are shaded?',key:den+'|'+num+'|'+(askParts?'p':'s')});
  }},
  'ch11-name24':{gen:nameFraction([2,4])},
  /* --- Unit fractions: one part of an equal whole --- */
  'ch11-unit':{gen(){
    const den=R.int(2,10),shape=R.f()<.5?'circle':'bar';
    return problem({math:{type:'fraction',num:1,den},
      html:'One equal part is shaded.<br>What fraction is it?',answer:'1/'+den,
      choices:fracMCQ('1/'+den,['1/'+(den-1),'1/'+(den+1),'2/'+den,den+'/1']),
      visual:{type:'fraction',parts:den,shaded:1,shape},
      hint:'A unit fraction has 1 on top. The bottom is the number of equal parts.',
      guide:'The whole is cut into '+den+' equal parts, and 1 is shaded.',
      explain:'One of '+den+' equal parts is 1/'+den+' — one '+ORDINALS[den]+'.',
      speak:'One equal part is shaded. What fraction is it?',key:'u'+den+'|'+shape});
  }},
  /* --- How many unit fractions make the whole? --- */
  'ch11-count-unit':{gen(){
    const den=R.int(2,10);
    return problem({math:{type:'fraction-count',num:den,den},
      html:'How many one-'+ORDINALS_PL[den]+' make 1 whole?',answer:String(den),choices:null,
      visual:{type:'fraction',parts:den,shaded:den,shape:'bar'},
      hint:'Count the equal parts in the bar.',
      guide:'Each part is one '+ORDINALS[den]+'. The whole bar has '+den+' of them.',
      explain:den+' one-'+ORDINALS_PL[den]+' make 1 whole: '+den+'/'+den+' = 1.',
      speak:'How many one-'+ORDINALS_PL[den]+' make one whole?',key:'cu'+den});
  }},
  /* --- Writing fractions (any denominator to tenths) --- */
  'ch11-name':{gen:nameFraction([2,3,4,5,6,7,8,9,10])},
  /* --- Shade it yourself --- */
  'ch11-shade':{gen(){
    const den=R.choice([4,5,6,8,10]),num=R.int(1,den-1);
    return problem({math:{type:'fraction-shade',num,den},kind:'shade',parts:den,shadeTarget:num,
      html:'Tap parts to shade <b>'+num+'/'+den+'</b> of the bar.',answer:String(num),answerText:num+' of '+den+' parts shaded',
      choices:null,
      hint:'You need exactly '+num+' shaded parts out of '+den+'.',
      guide:'Tap a part to shade it. Tap again to unshade it.',
      explain:num+'/'+den+' means '+num+' of '+den+' equal parts.',
      speak:'Shade '+num+' of '+den+' equal parts.',key:'sh'+den+'|'+num});
  }},
  /* --- Two fractions that make 1 whole (fraction answer) --- */
  'ch11-whole':{gen(){
    const den=R.int(3,10),num=R.int(1,den-1),rest=den-num,shape=R.f()<.5?'circle':'bar';
    return problem({math:{type:'fraction-whole',num,den},
      html:num+'/'+den+' is shaded.<br>What fraction is NOT shaded? Together they make 1 whole.',answer:rest+'/'+den,
      choices:fracMCQ(rest+'/'+den,[num+'/'+den,(rest+1)+'/'+den,(rest-1)+'/'+den,rest+'/'+(den+1)]),
      visual:{type:'fraction',parts:den,shaded:num,shape},
      hint:'Count the parts that are not shaded.',
      guide:'The whole has '+den+' parts. '+num+' are shaded, so '+(den-num)+' are not.',
      explain:num+'/'+den+' + '+rest+'/'+den+' = '+den+'/'+den+' = 1 whole.',
      speak:'What fraction is not shaded? Together they make one whole.',key:'w'+den+'|'+num});
  }},
  /* --- Two fractions that make 1 whole (missing parts count) --- */
  'ch11-whole-count':{gen(){
    const den=R.int(3,10),num=R.int(1,den-1),rest=den-num;
    return problem({math:{type:'fraction-count',num:rest,den},
      html:'The bar has '+den+' equal parts. '+num+' of them make '+num+'/'+den+'.<br>How many more parts make 1 whole?',answer:String(rest),choices:null,
      visual:{type:'fraction',parts:den,shaded:num,shape:'bar'},
      hint:'The whole needs '+den+' parts in all.',
      guide:'Count from '+num+' up to '+den+'.',
      explain:num+' + '+rest+' = '+den+', so '+num+'/'+den+' + '+rest+'/'+den+' = 1 whole.',
      speak:'How many more parts make one whole?',key:'wc'+den+'|'+num});
  }},
  /* --- Comparing fractions in pairs --- */
  'ch11-compare':{gen(){
    const pick=R.f()<.5?'larger':'smaller';
    if(R.f()<.5){
      const a=R.int(2,9);let b=R.int(2,10);while(b===a)b=R.int(2,10);
      const bigger='1/'+Math.min(a,b),smaller='1/'+Math.max(a,b);
      return problem({math:{type:'fraction-compare',aNum:1,aDen:a,bNum:1,bDen:b,pick},
        html:'Which fraction is '+pick+'?',answer:pick==='larger'?bigger:smaller,
        choices:R.shuffle([bigger,smaller]),visual:null,
        hint:'Both tops are 1, so compare the parts. More parts means each part is smaller.',
        guide:'Cutting the same whole into more parts makes tinier parts.',
        explain:bigger+' is larger than '+smaller+': fewer parts, bigger pieces.',
        speak:'Which fraction is '+pick+': one over '+a+', or one over '+b+'?',key:'uc'+a+'|'+b+'|'+pick});
    }
    const den=R.int(3,10);let n1=R.int(1,den-1),n2=R.int(1,den-1);while(n2===n1)n2=R.int(1,den-1);
    const bigger=Math.max(n1,n2)+'/'+den,smaller=Math.min(n1,n2)+'/'+den;
    return problem({math:{type:'fraction-compare',aNum:n1,aDen:den,bNum:n2,bDen:den,pick},
      html:'Which fraction is '+pick+'?',answer:pick==='larger'?bigger:smaller,
      choices:R.shuffle([bigger,smaller]),visual:null,
      hint:'The bottoms are the same, so the parts are the same size. Compare the tops.',
      guide:'Same-size parts: more parts shaded means a bigger fraction.',
      explain:bigger+' is larger than '+smaller+': same parts, more of them.',
      speak:'Which fraction is '+pick+': '+n1+' over '+den+', or '+n2+' over '+den+'?',key:'sc'+den+'|'+n1+'|'+n2+'|'+pick});
  }},
  /* --- Between two unit fractions --- */
  'ch11-between':{gen(){
    const mid=R.int(4,8),lo=R.int(2,mid-1);let hi=R.int(mid+1,10);
    const answer='1/'+mid;
    return problem({math:{type:'fraction',num:1,den:mid},
      html:'Which fraction is more than 1/'+hi+' and less than 1/'+lo+'?',answer,
      choices:fracMCQ(answer,['1/'+lo,'1/'+hi,'1/'+(hi+2)]),
      hint:'Unit fractions get smaller as the bottom number grows.',
      guide:'Order them by their bottoms: 1/'+lo+' is biggest, 1/'+hi+' is smallest. The answer sits between.',
      explain:'1/'+lo+' > 1/'+mid+' > 1/'+hi+'. More parts means smaller parts.',
      speak:'Which fraction is between one over '+hi+' and one over '+lo+'?',key:'bt'+lo+'|'+mid+'|'+hi});
  }}
});

window.TARGETS.push(
 {id:'ch11-halves',chapter:'ch11',title:'Halves and Fourths',art:'🍕',blurb:'Equal parts of a whole.',audio:'audio/m3-ch11-halves.mp3',controlsAudio:'audio/m4-controls-ch11-halves.mp3',
  demoCaption:'A fraction names equal parts of one whole. Cut a pie into 4 equal parts. Each part is exactly the same size — that is one fourth, written 1/4. The bottom number 4 says how many equal parts. The top number 1 says how many parts we mean. If the parts were not equal, we could not call them fourths!',demoVisual:{kind:'fraction',shape:'circle',parts:4,shaded:1,note:'4 equal parts. One of them is 1/4.'},
  teachingNote:'Equal parts are the big idea of this chapter. A shape cut into 4 unequal pieces does not show fourths, no matter how it looks at first glance.',
  controls:'First count the equal parts, then count the shaded ones. Tap the matching answer.',guidedFamilies:['ch11-parts'],families:['ch11-parts','ch11-name24'],adventureFamilies:['ch11-name24','ch11-unit']},
 {id:'ch11-unit',chapter:'ch11',title:'Unit Fractions',art:'1️⃣',blurb:'One part: halves to tenths.',audio:'audio/m3-ch11-unit.mp3',controlsAudio:'audio/m4-controls-ch11-unit.mp3',
  demoCaption:'A unit fraction is just ONE part of a whole. One of 3 equal parts is 1/3 — one third. One of 6 equal parts is 1/6 — one sixth. Watch the wholes: both are the same size, but 6 parts are smaller pieces than 3 parts. More parts, smaller pieces!',demoVisual:{kind:'fraction-compare',a:{parts:3,shaded:1,shape:'bar'},b:{parts:6,shaded:1,shape:'bar'},note:'Same whole. 1/3 is a bigger piece than 1/6.'},
  teachingNote:'Unit fractions to tenths: 1/2 half, 1/3 third, 1/4 fourth, 1/5 fifth, 1/6 sixth, 1/7 seventh, 1/8 eighth, 1/9 ninth, 1/10 tenth.',
  controls:'Count the equal parts in the whole. One shaded part is 1 over that number. Tap the fraction.',guidedFamilies:['ch11-unit'],families:['ch11-unit','ch11-count-unit'],adventureFamilies:['ch11-unit','ch11-name24']},
 {id:'ch11-writing',chapter:'ch11',title:'Writing Fractions',art:'✏️',blurb:'Name any shaded part to tenths.',audio:'audio/m3-ch11-writing.mp3',controlsAudio:'audio/m4-controls-ch11-writing.mp3',
  demoCaption:'Write a fraction in two counts. A bar is cut into 10 equal parts, and 3 are shaded. Count all the parts first: 10 — that is the bottom number, the denominator. Count the shaded parts: 3 — that is the top number, the numerator. 3 of 10 parts: 3/10!',demoVisual:{kind:'fraction',shape:'bar',parts:10,shaded:3,note:'Bottom: 10 parts in all. Top: 3 shaded. 3/10.'},
  demo2:{caption:'Try a circle. It is cut into 8 equal parts and 5 are shaded. All the parts: 8, the denominator. Shaded parts: 5, the numerator. The fraction is 5/8. Two counts, every time: all the parts, then the shaded parts.',audio:'audio/m3-ch11-writing-demo2.mp3',visual:{kind:'fraction',shape:'circle',parts:8,shaded:5,note:'8 equal parts, 5 shaded: 5/8.'}},
  teachingNote:'Denominator down (all the parts), numerator up (the parts we mean). Say it as “3 out of 10 equal parts.”',
  controls:'Some questions ask you to tap parts of the bar yourself to shade the fraction. Tap a part to shade or unshade it, then check.',guidedFamilies:['ch11-shade'],families:['ch11-name','ch11-shade'],adventureFamilies:['ch11-name','ch11-count-unit']},
 {id:'ch11-whole',chapter:'ch11',title:'Making 1 Whole',art:'🧩',blurb:'Partners that complete the whole.',audio:'audio/m3-ch11-whole.mp3',controlsAudio:'audio/m4-controls-ch11-whole.mp3',
  demoCaption:'Fractions can partner up to make 1 whole. A bar of 7 equal parts has 2 shaded: that is 2/7. The 5 unshaded parts are 5/7. Together: 2/7 + 5/7 = 7/7 — all 7 parts — 1 whole! The partner of a fraction is whatever is left of the whole.',demoVisual:{kind:'fraction',shape:'bar',parts:7,shaded:2,note:'2/7 + 5/7 = 7/7 = 1 whole.'},
  teachingNote:'The two partners always share the same denominator, and their numerators add to it: for sevenths, the pairs are 1/7+6/7, 2/7+5/7, 3/7+4/7.',
  controls:'Count the parts that are NOT shaded — that is the partner fraction. Tap it, or type how many more parts are needed.',guidedFamilies:['ch11-whole-count'],families:['ch11-whole','ch11-whole-count'],adventureFamilies:['ch11-whole','ch11-name']},
 {id:'ch11-comparing',chapter:'ch11',title:'Comparing Fractions',art:'📊',blurb:'Bigger parts or more parts?',audio:'audio/m3-ch11-comparing.mp3',controlsAudio:'audio/m4-controls-ch11-comparing.mp3',
  demoCaption:'Compare 2/5 and 4/5. The bottoms match, so every part is the same size — fifths. Then it is simple: 4 parts is more than 2 parts, so 4/5 is larger. When denominators match, just compare the numerators — the top numbers!',demoVisual:{kind:'fraction-compare',a:{parts:5,shaded:2,shape:'bar'},b:{parts:5,shaded:4,shape:'bar'},note:'Same parts — 4 of them beats 2 of them.'},
  demo2:{caption:'Unit fractions flip the thinking. Compare 1/4 and 1/8. Both tops are 1 — a single part. But eighths are smaller parts: cutting a whole into 8 makes tinier pieces than cutting it into 4. So 1/4 is larger than 1/8. With unit fractions, the bigger bottom number names the smaller fraction!',audio:'audio/m3-ch11-comparing-demo2.mp3',visual:{kind:'fraction-compare',a:{parts:4,shaded:1,shape:'bar'},b:{parts:8,shaded:1,shape:'bar'},note:'One part each — fourths are bigger pieces than eighths.'}},
  teachingNote:'Two rules cover this chapter: same denominator → compare numerators; unit fractions → the smaller denominator is the larger fraction.',
  controls:'Tap the larger or smaller fraction — read the question carefully, it changes! Picture the parts if you are unsure.',guidedFamilies:['ch11-compare'],families:['ch11-compare','ch11-between'],adventureFamilies:['ch11-between','ch11-whole']}
);
Object.assign(M2_OWNERS,{'ch11-parts':'ch11-halves','ch11-name24':'ch11-halves','ch11-unit':'ch11-unit','ch11-count-unit':'ch11-unit','ch11-name':'ch11-writing','ch11-shade':'ch11-writing','ch11-whole':'ch11-whole','ch11-whole-count':'ch11-whole','ch11-compare':'ch11-comparing','ch11-between':'ch11-comparing'});
for(const [fid,owner] of Object.entries(M2_OWNERS))if(window.FAMILIES[fid])window.FAMILIES[fid].owner=owner;
