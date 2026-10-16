/* Camp Wildwood — Singapore Math strategy vocabulary.
   Every problem family carries a named strategy; every mission teaches its
   strategy at the demonstration, labels it on each problem, and names it
   again in the feedback after the problem is solved. */
'use strict';

const STRATEGY_BLURBS={
  'Place Value Adding':'Add the ones, tens, and hundreds in their own places — no making a new ten or hundred.',
  'Make the Next Ten':'Split a number so the ones make the next ten first. Tens are easy to add!',
  'Make the Next Hundred':'Add up to the next hundred first, then add what is left. Hundreds are easy to add!',
  'Compensation':'Adding 98 or 99? Add 100 instead — it is easier — then take back the extra. Subtracting works the same way in reverse!',
  'Regrouping: Trade a Ten':'When there are not enough ones, trade 1 ten for 10 ones, then subtract.',
  'Subtract in Parts':'Subtract the tens first, then the ones. Big jumps first, small jumps last.',
  'Equal Groups':'Multiplication counts equal groups. Count the groups, count what is in each group.',
  'Repeated Addition':'Multiplication is adding the same number again and again.',
  'Sharing Equally':'Division can mean sharing into equal parts — deal one at a time until all are shared.',
  'Grouping':'Division can mean making groups of a size — count how many groups you can make.',
  'Think Multiplication':'Division and multiplication are partners. Ask: what times the divisor gives the total?',
  'Use a Known Fact':'Build a new fact from one you know: add one more group, or double a fact you trust.',
  'Make $1 with Number Bonds':'Number bonds to 100 cents make a dollar. Find the partner that completes the dollar.',
  'Count On: Biggest First':'Count money by starting with the biggest coins and bills, then count on with the smaller ones.',
  'Trade 100 Cents for $1':'100 cents is the same as 1 dollar. Trade back and forth whenever it helps.',
  'Counting Up for Change':'Start at the price and count up to the money given. What you count is the change!',
  'Compare Dollars, Then Cents':'Compare money place by place: dollars first, then cents.',
  'Count On and Add':'Adding coins: count on from the total you already have.',
  'Place Value Adding (Money)':'Add dollars with dollars and cents with cents — and trade 100 cents for a dollar when the cents reach 100.',
  'Trade $1 to Subtract':'Not enough cents to subtract? Trade 1 dollar for 100 cents, then subtract.',
  'Equal Parts Only':'Fraction parts must be exactly equal. Unequal parts do not count!',
  'Count Shaded, Count All':'A fraction names shaded parts out of all the equal parts. Count the shaded ones, then count them all.',
  'Unit Fractions':'A unit fraction is ONE equal part of a whole: 1/2, 1/3, 1/4. The bottom number tells the size of the parts.',
  'Count the Unit Fractions':'Any fraction counts unit fractions: 3/8 is 1/8 + 1/8 + 1/8 — three eighth-parts.',
  'Numerator over Denominator':'The numerator (top) counts the parts you have. The denominator (bottom) counts all the equal parts.',
  'Shade the Fraction':'Read the fraction, then shade exactly that many equal parts.',
  'Parts That Make 1 Whole':'Fractions with the same denominator can be partners that make exactly 1 whole.',
  'Count Up to 1 Whole':'Count unit fractions until the parts fill the whole — that tells you the missing partner.',
  'Compare the Parts':'Same denominator? More parts wins. Unit fractions? Bigger denominator means smaller parts!',
  'Between 0 and 1':'Every fraction in this chapter lives between 0 and 1 whole on the number line.',
  'Count by 5s Around the Clock':'The minute hand moves number to number. Each number is 5 minutes — count by 5s, then by 1s.',
  'Minutes Past the Hour':'The minutes hand tells how many minutes have passed since the hour began.',
  'Count On: Jump to the Hour':'For elapsed time, count on from the start: jump to the next hour first, then count the extra minutes.',
  'Count On from the Start':'End time = start time plus the minutes that pass. Count on carefully past the hour.',
  'Two Halves of a Day':'a.m. is midnight to noon. p.m. is noon to midnight. The activity tells you which half!',
  'Compare the Levels':'Same-size containers? The higher water level means more water.',
  'Capacity Means What It Holds':'Capacity measures how much a container can hold when it is completely full.',
  'Pick the Right Unit':'Huge amounts take gallons. Middle amounts take quarts or liters. Picture the water first!',
  'Trade Units: 4 Quarts in a Gallon':'1 gallon trades for exactly 4 quarts — multiply by 4, or group by 4.',
  'Read the Measure':'Compare the water level with the full mark to find how much is in the jug.',
  'Count Up to Fill':'Missing-part thinking: count up from what the tank has to what it holds.',
  'Read the Key First':'In a picture graph, the key tells what each symbol is worth. Read it before you count!',
  'Work Backwards from the Key':'Divide the value by the key to find how many symbols are drawn.',
  'Read the Scale':'Follow the top of the bar across to the scale and read its number.',
  'Compare the Bar Heights':'The tallest bar has the most. The shortest bar has the least.',
  'How Many More: Subtract':'Comparing two amounts? Subtract the smaller from the bigger to find how many more.',
  'Altogether: Add':'Combining amounts? Add them to find the total.',
  'Trace the Edge':'Trace the edge of the shape. If you return to the start with no gaps, the shape is closed.',
  'Count Each Side':'Run your finger along the shape and count every side, one at a time.',
  'Name by the Number of Sides':'Polygons are named by counting their sides: 3 triangle, 5 pentagon, 8 octagon.',
  'Sides and Corners Match':'Every polygon has exactly as many corners as it has sides.',
  'Parts of a Circle':'A semicircle is half a circle. A quarter-circle is half of a semicircle.',
  'Parts Build the Whole':'Put the parts together: 2 semicircles or 4 quarter-circles make a whole circle.',
  'Find the Repeating Unit':'Patterns repeat a unit again and again. Find the unit and you know what comes next.',
  'Watch It Grow by One':'In a growing pattern, each shape has one more side than the one before.',
  'Name the Solid':'Solids are named by their look: round like a ball, pointy like a hat, flat-sided like a box, or like a can.',
  'Faces, Edges, and Corners':'Faces are flat sides, edges are where faces meet, and corners are where edges meet.',
  'Place Value: Hundreds, Tens, Ones':'Every digit has a place, and its place gives its value: hundreds, tens, then ones.',
  'Number Bonds':'A whole splits into parts. Know the whole and one part, and the other part is the whole minus the part.',
  'Renaming':'Trade 10 ones for 1 ten when a place overflows — or 1 ten for 10 ones when you run short. The value never changes.',
  'Skip Counting':'Count by 2s, 5s, or 10s to multiply fast. Each hop adds the same amount.'
};

const FAMILY_STRATEGY={
  'ch8-equiv-add-ones':'Place Value Adding','ch8-add-ones':'Make the Next Ten',
  'ch8-equiv-add-tens':'Place Value Adding','ch8-add-tens':'Make the Next Hundred',
  'ch8-make100':'Make the Next Hundred','ch8-add-comp':'Compensation',
  'ch8-sub-bridge':'Regrouping: Trade a Ten','ch8-sub-tens':'Subtract in Parts','ch8-sub-comp':'Compensation',
  'ch9-groups3':'Equal Groups','ch9-mult3':'Repeated Addition','ch9-div3-deal':'Sharing Equally',
  'ch9-div3-group':'Grouping','ch9-div3a':'Think Multiplication','ch9-div3b':'Think Multiplication',
  'ch9-groups4':'Equal Groups','ch9-mult4':'Repeated Addition','ch9-div4-deal':'Sharing Equally',
  'ch9-div4-group':'Grouping','ch9-div4a':'Think Multiplication','ch9-div4b':'Think Multiplication',
  'ch9-near':'Use a Known Fact','ch9-near3':'Use a Known Fact','ch9-near4':'Use a Known Fact',
  'ch10-make1':'Make $1 with Number Bonds','ch10-count':'Count On: Biggest First','ch10-convert':'Trade 100 Cents for $1',
  'ch10-change':'Counting Up for Change','ch10-change-big':'Counting Up for Change','ch10-compare':'Compare Dollars, Then Cents',
  'ch10-add-coins':'Count On and Add','ch10-add':'Place Value Adding (Money)','ch10-sub-coins':'Subtract in Parts',
  'ch10-sub':'Trade $1 to Subtract',
  'ch11-parts':'Equal Parts Only','ch11-name24':'Count Shaded, Count All','ch11-unit':'Unit Fractions',
  'ch11-count-unit':'Count the Unit Fractions','ch11-name':'Numerator over Denominator','ch11-shade':'Shade the Fraction',
  'ch11-whole':'Parts That Make 1 Whole','ch11-whole-count':'Count Up to 1 Whole','ch11-compare':'Compare the Parts',
  'ch11-between':'Between 0 and 1',
  'ch12-read5':'Count by 5s Around the Clock','ch12-read':'Count by 5s Around the Clock','ch12-past':'Minutes Past the Hour',
  'ch12-elapsed':'Count On: Jump to the Hour','ch12-endtime':'Count On from the Start','ch12-ampm':'Two Halves of a Day',
  'ch12-ampm-clock':'Two Halves of a Day',
  'ch13-amount':'Compare the Levels','ch13-capacity':'Capacity Means What It Holds','ch13-unit-fit':'Pick the Right Unit',
  'ch13-convert':'Trade Units: 4 Quarts in a Gallon','ch13-read-jug':'Read the Measure','ch13-fill':'Count Up to Fill',
  'ch14-picto-read':'Read the Key First','ch14-picto-symbols':'Work Backwards from the Key','ch14-bar-read':'Read the Scale',
  'ch14-bar-most':'Compare the Bar Heights','ch14-diff':'How Many More: Subtract','ch14-total':'Altogether: Add',
  'ch15-open':'Trace the Edge','ch15-count-sides':'Count Each Side','ch15-name':'Name by the Number of Sides',
  'ch15-sides-corners':'Sides and Corners Match','ch15-identify':'Parts of a Circle','ch15-combine':'Parts Build the Whole',
  'ch15-pattern-next':'Find the Repeating Unit','ch15-pattern-grow':'Watch It Grow by One','ch15-solid-name':'Name the Solid',
  'ch15-solid-attrs':'Faces, Edges, and Corners',
  'trail-pv-build':'Place Value: Hundreds, Tens, Ones','trail-pv-digit':'Place Value: Hundreds, Tens, Ones',
  'trail-pv-expand':'Place Value: Hundreds, Tens, Ones','trail-pv-compare':'Place Value: Hundreds, Tens, Ones',
  'trail-bond10':'Number Bonds','trail-bond100':'Number Bonds','trail-bond3':'Number Bonds',
  'trail-add-rename':'Renaming','trail-sub-rename':'Renaming','trail-word-rename':'Renaming',
  'trail-skip':'Skip Counting','trail-facts':'Skip Counting','trail-groups-intro':'Equal Groups'
};

const TARGET_STRATEGY={
  'ch8-adding-ones':'Make the Next Ten','ch8-adding-tens':'Make the Next Hundred','ch8-making-100':'Make the Next Hundred',
  'ch8-adding-98':'Compensation','ch8-subtracting':'Regrouping: Trade a Ten','ch8-subtracting-98':'Compensation',
  'ch9-groups-3':'Equal Groups','ch9-multiply-3':'Repeated Addition','ch9-divide-3':'Sharing Equally',
  'ch9-groups-4':'Equal Groups','ch9-multiply-4':'Repeated Addition','ch9-divide-4':'Sharing Equally',
  'ch10-making-1':'Make $1 with Number Bonds','ch10-counting':'Count On: Biggest First','ch10-change':'Counting Up for Change',
  'ch10-comparing':'Compare Dollars, Then Cents','ch10-adding':'Place Value Adding (Money)','ch10-subtracting':'Trade $1 to Subtract',
  'ch11-halves':'Equal Parts Only','ch11-unit':'Unit Fractions','ch11-writing':'Numerator over Denominator',
  'ch11-whole':'Parts That Make 1 Whole','ch11-comparing':'Compare the Parts',
  'ch12-telling':'Count by 5s Around the Clock','ch12-intervals':'Count On: Jump to the Hour','ch12-ampm':'Two Halves of a Day',
  'ch13-comparing':'Compare the Levels','ch13-units':'Pick the Right Unit','ch13-measuring':'Read the Measure',
  'ch14-picture':'Read the Key First','ch14-bar':'Read the Scale','ch14-questions':'How Many More: Subtract',
  'ch15-sides':'Trace the Edge','ch15-polygons':'Name by the Number of Sides','ch15-circles':'Parts of a Circle',
  'ch15-patterns':'Find the Repeating Unit','ch15-solids':'Name the Solid',
  'trail-place':'Place Value: Hundreds, Tens, Ones','trail-bonds':'Number Bonds','trail-regroup':'Renaming','trail-mult':'Skip Counting'
};

for(const [fid,name] of Object.entries(FAMILY_STRATEGY))
  if(window.FAMILIES[fid]) window.FAMILIES[fid].strategy={name, blurb:STRATEGY_BLURBS[name]||''};
for(const t of window.TARGETS){
  const name=TARGET_STRATEGY[t.id];
  if(name){ t.strategyName=name; t.strategyBlurb=STRATEGY_BLURBS[name]||''; t.strategyIntro=t.introFile||('audio/m7-intro-'+t.id+'.mp3'); }
}
window.strategyForProblem=function(pr){
  const fam=pr&&window.FAMILIES[pr.fid];
  return fam&&fam.strategy?fam.strategy:null;
};
