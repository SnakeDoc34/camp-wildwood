(function(root){
 'use strict';
 const INTERVALS=[0,1,3,7,14,30];
 const day=(date=new Date())=>{const d=new Date(date); return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);};
 const key=(a,b)=>[a,b].sort((x,y)=>x-y).join('x');
 function blank(){return {version:1,coins:0,tables:[2,5,10],facts:{},daily:{},owned:[],placed:{},sound:false};}
 function factsFor(tables){const seen=new Set(),out=[]; for(const a of tables)for(let b=0;b<=12;b++){const k=key(a,b);if(!seen.has(k)){seen.add(k);out.push({a,b,key:k});}}return out;}
 function record(p,k){return p.facts[k]||(p.facts[k]={stage:0,due:0,lastDay:null,lastAdvance:null,attempts:0,correct:0,lapses:0});}
 class Session{
  constructor(profile,opts={}){
   this.p=profile;this.today=opts.today??day();this.random=opts.random||Math.random;this.turn=0;this.history=[];this.streak=0;this.correct=0;this.assisted=0;this.earned=0;this.limit=18;this.current=null;
   const all=factsFor(profile.tables.length?profile.tables:[2,5,10]);
   const order=(arr)=>arr.map(f=>({f,n:this.random()})).sort((a,b)=>a.n-b.n).map(x=>x.f);
   const due=order(all.filter(f=>profile.facts[f.key]&&profile.facts[f.key].due<=this.today)).sort((a,b)=>record(profile,a.key).stage-record(profile,b.key).stage);
   const fresh=order(all.filter(f=>!profile.facts[f.key]));
   const known=order(all.filter(f=>profile.facts[f.key]&&profile.facts[f.key].due>this.today));
   // Keep a small working set, with at most three new families unless fillers are needed.
   let chosen=[...due.slice(0,5),...fresh.slice(0,3)];
   for(const f of [...known,...due,...fresh])if(chosen.length<8&&!chosen.some(x=>x.key===f.key))chosen.push(f);
   this.cards=chosen.map((f,i)=>({...f,last:-100,ready:i,wins:0,seen:0}));
  }
  next(){
   if(this.turn>=this.limit)return null;
   const eligible=this.cards.filter(c=>this.turn-c.last>=4);
   const due=eligible.filter(c=>c.ready<=this.turn).sort((a,b)=>a.ready-b.ready||a.last-b.last);
   const c=due[0]||eligible.sort((a,b)=>a.seen-b.seen||a.last-b.last)[0];
   if(!c)throw new Error('Not enough distinct fact families for spaced practice.');
   // Reversed factors belong to one memory family, so they cannot evade the delay.
   const reverse=c.seen>0&&this.random()<.5;
   this.current={card:c,a:reverse?c.b:c.a,b:reverse?c.a:c.b,hinted:false};return this.current;
  }
  answer(value){
   if(!this.current||!Number.isInteger(value)||value<0||value>999)return null;
   const {card:c,a,b,hinted}=this.current,ok=value===a*b,independent=ok&&!hinted,r=record(this.p,c.key);
   c.last=this.turn;c.seen++;r.attempts++;r.lastDay=this.today;
   if(independent){r.correct++;c.wins++;this.correct++;this.streak++;c.ready=this.turn+(c.wins===1?6:9);
    if(r.lastAdvance!==this.today&&r.due<=this.today){r.stage=Math.min(5,r.stage+1);r.lastAdvance=this.today;r.due=this.today+INTERVALS[r.stage];}
   }else{this.streak=0;c.wins=0;c.ready=this.turn+4;r.lapses++;r.stage=Math.max(0,r.stage-1);r.due=this.today;if(hinted)this.assisted++;}
   const reward=independent?3+Math.min(2,Math.floor(this.streak/3)):1;
   this.p.coins+=reward;this.earned+=reward;
   const daily=this.p.daily[this.today]||(this.p.daily[this.today]={count:0,correct:0,bonus:false});daily.count++;if(independent)daily.correct++;
   let bonus=0;if(daily.count>=18&&!daily.bonus){daily.bonus=true;bonus=15;this.p.coins+=15;this.earned+=15;}
   this.history.push(c.key);this.turn++;this.current=null;
   return {ok,independent,hinted,reward,bonus,a,b,answer:a*b,streak:this.streak};
  }
 }
 const api={day,key,blank,factsFor,record,Session,INTERVALS};root.MeadowEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
