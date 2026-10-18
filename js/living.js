/* Living Camp: decorative scenery and optional, exact mathematical work mats.
   No frame loop, network dependency, reward multiplier, or answer-key changes. */
'use strict';
const Living={
  media:null,
  isCalm(){return Boolean(Settings.calmVisuals||this.media?.matches);},
  applyMotion(){
    const root=document.documentElement;if(root)root.classList.toggle('calm-visuals',this.isCalm());
  },
  init(){
    this.media=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
    this.media?.addEventListener?.('change',()=>this.applyMotion());this.applyMotion();
    document.addEventListener('visibilitychange',()=>{
      if(document.documentElement)document.documentElement.classList.toggle('camp-paused',document.hidden);
    });
  },
  fox(mood){
    return '<svg class="fox-art '+(mood==='happy'?'fox-happy':'')+'" viewBox="0 0 140 140" aria-hidden="true" focusable="false">'+
      '<ellipse cx="70" cy="128" rx="44" ry="7" fill="#254c3c" opacity=".15"/>'+
      '<path class="fox-tail" d="M94 113Q145 123 121 72Q132 109 97 93" fill="#cd7340" stroke="#87482e" stroke-width="3"/><path d="M121 72Q132 87 126 99L116 90Z" fill="#fff2d5"/>'+
      '<path d="M41 121Q33 78 69 79Q104 79 98 121Z" fill="#d28248" stroke="#87482e" stroke-width="3"/><path d="M56 119Q46 98 70 92Q91 103 84 120Z" fill="#fff2d5"/>'+
      '<path d="M33 50 32 10 59 31Q74 24 84 32L111 12 107 53Q118 80 71 94Q23 83 33 50Z" fill="#df8c50" stroke="#87482e" stroke-width="3"/>'+
      '<path d="m40 38-1-15 14 13m37 0 15-13-1 17" fill="#8b4c36"/>'+
      '<path d="M33 57Q46 53 69 77Q89 52 109 56Q106 81 71 91Q38 84 33 57Z" fill="#fff2d5"/>'+
      (mood==='happy'?'<path d="m45 57q7-9 14 0m24 0q7-9 14 0" stroke="#493b33" stroke-width="4" fill="none" stroke-linecap="round"/>':'<g class="fox-eyes" fill="#493b33"><ellipse cx="52" cy="54" rx="4" ry="6"/><ellipse cx="90" cy="54" rx="4" ry="6"/></g>')+
      '<path d="m62 73 18 0-9 9Z" fill="#493b33"/><path d="M71 81v5" stroke="#493b33" stroke-width="2"/><path d="M45 124h17m20 0h15" stroke="#87482e" stroke-width="5" stroke-linecap="round"/>'+ '</svg>';
  },
  sky(){
    return '<svg class="living-sky" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true" focusable="false"><circle class="camp-sun" cx="825" cy="48" r="28" fill="#ffe5a0"/><g class="camp-stars" fill="#fff2c3">'+[60,160,285,430,560,650,735,940].map((x,i)=>'<circle cx="'+x+'" cy="'+(18+i%3*21)+'" r="2"/>').join('')+'</g><path d="M0 130 130 52 240 120 385 29 530 127 660 61 800 139 920 75 1000 124V220H0Z" fill="#739b90"/><path d="M0 156 150 103 292 166 460 102 680 176 847 110 1000 172V220H0Z" fill="#487e70"/><g class="camp-cloud" fill="#fffcdf" opacity=".7"><ellipse cx="230" cy="60" rx="60" ry="12"/><ellipse cx="210" cy="51" rx="25" ry="17"/></g></svg>';
  },
  decorate(scene,p,editable){
    scene.appendChild(el('div','yard-horizon',this.sky()));
    const mist=el('div','yard-mist');mist.setAttribute('aria-hidden','true');scene.appendChild(mist);
    const flies=el('div','camp-fireflies');flies.setAttribute('aria-hidden','true');
    for(let i=0;i<9;i++){const dot=el('i');dot.style.left=(8+i*10)+'%';dot.style.top=(35+i%4*14)+'%';dot.style.animationDelay=(-i*.63)+'s';flies.appendChild(dot);}scene.appendChild(flies);
    const time=el('button','daylight-switch','');
    const label=()=>({morning:'☀ Morning',golden:'🌅 Golden hour',night:'☾ Starry night'})[scene.getAttribute('data-daylight')];
    time.textContent=label();time.setAttribute('aria-label','Change campsite lighting. Current: '+label());
    time.onclick=()=>{
      const d=Yard.ensure(p),times=['morning','golden','night'];d.timeOfDay=times[(times.indexOf(scene.getAttribute('data-daylight'))+1)%3];Store.persist();
      scene.setAttribute('data-daylight',d.timeOfDay);time.textContent=label();time.setAttribute('aria-label','Change campsite lighting. Current: '+label());Audio2.pop();
    };
    scene.appendChild(time);
    const friend=el('button','yard-friend',this.fox('idle'));
    friend.setAttribute('aria-label','Say hello to your fox helper');
    friend.onclick=()=>{Audio2.pop();friend.innerHTML=this.fox('happy');toast(editable?'Your fox loves this camp. Place your next discovery!':'Ready for a trail? Every finished mission earns a camp token.');};scene.appendChild(friend);
  },
  progress(engine){
    const practice=engine.steps.filter(s=>s.type==='guided'||s.type==='independent'),done=practice.filter(s=>s.solved).length;
    return {done,total:practice.length,time:done>=practice.length&&done>0?'night':done>=Math.ceil(practice.length/2)&&done>0?'golden':'morning'};
  },
  mission(engine){
    const box=document.getElementById('mission-outlook');if(!box)return;
    box.innerHTML='';const p=this.progress(engine),s=engine.steps[engine.idx];
    box.className='mission-outlook';box.setAttribute('data-daylight',p.time);
    box.appendChild(el('div','outlook-landscape',this.sky()));
    const mood=s.solved||s.type==='done'?'happy':s.mistakes||s.hintsUsed?'think':'idle';
    const friend=el('div','mission-friend',this.fox(mood));friend.id='mission-friend';friend.setAttribute('data-mood',mood);box.appendChild(friend);
    const copy=el('div','outlook-copy');copy.appendChild(el('span','eyebrow','A day at Camp Wildwood'));
    const msg=mood==='happy'?'Nice thinking! Your camp is growing.':mood==='think'?'Take your time. We can work it out together.':s.type==='demo'||s.type==='demo2'?'Watch, listen, then try it together.':'One step at a time, ranger.';
    const text=el('strong',null,msg);text.id='companion-message';copy.appendChild(text);
    copy.appendChild(el('small',null,p.done+' / '+p.total+' practice questions complete · '+({morning:'Morning trail',golden:'Golden hour',night:'Campfire time'})[p.time]));box.appendChild(copy);
  },
  react(mood){
    const fox=document.getElementById('mission-friend'),msg=document.getElementById('companion-message');
    if(fox){fox.innerHTML=this.fox(mood);fox.setAttribute('data-mood',mood);}
    if(msg)msg.textContent=mood==='think'?'Take your time. We can work it out together.':'Nice thinking! Your camp is growing.';
  }
};

/* Optional learning support. Opening a mat marks this attempt as assisted,
   just as Hint does; token rewards are unchanged. Each mat is checkpointed. */
const Backpack={
  values(pr){const m=pr.math;return [...new Set([m.a,m.b,m.total,m.known].filter(n=>Number.isInteger(n)&&n>=0&&n<=1000))];},
  supports(pr){return !['deal','grouping'].includes(pr.kind)&&['add','subtract','equivalent-add','missing-addend','multiply','divide'].includes(pr.math?.type);},
  base(n){return {h:Math.floor(n/100),t:Math.floor(n%100/10),o:n%10,value:n};},
  exchange(mat,from){
    if(!mat||!['h','t','o','ten'].includes(from))return false;
    if(from==='h'&&mat.h>0){mat.h--;mat.t+=10;}
    else if(from==='t'&&mat.t>0){mat.t--;mat.o+=10;}
    else if(from==='o'&&mat.o>=10){mat.o-=10;mat.t++;}
    else if(from==='ten'&&mat.t>=10){mat.t-=10;mat.h++;}
    else return false;
    return true;
  },
  valid(mat,n){return mat&&['h','t','o'].every(k=>Number.isSafeInteger(mat[k])&&mat[k]>=0)&&100*mat.h+10*mat.t+mat.o===n;},
  render(body,pr,step,engine){
    const panel=el('section','math-backpack');panel.setAttribute('aria-label','Camp Backpack work mat');
    panel.appendChild(el('h3',null,'🎒 Camp Backpack'));
    panel.appendChild(el('p','fine','A little support is welcome. This attempt counts as supported practice. You still earn your mission rewards.'));
    const redraw=(focusId)=>{engine.checkpoint();engine.render();if(focusId)document.getElementById(focusId)?.focus?.();};
    if(['multiply','divide'].includes(pr.math.type))this.groups(panel,pr,step,redraw);
    else this.placeValue(panel,pr,step,redraw);
    body.appendChild(panel);
  },
  placeValue(panel,pr,step,redraw){
    const values=this.values(pr);if(!values.length)return;
    const selected=values.includes(step.matValue)?step.matValue:values[0];step.matValue=selected;
    if(!this.valid(step.baseMat,selected))step.baseMat=this.base(selected);
    const m=step.baseMat,row=el('div','row');
    for(const n of values){const b=el('button','hint-btn','Show '+n);b.setAttribute('aria-pressed',String(n===selected));b.id='mat-show-'+n;b.onclick=()=>{step.matValue=n;step.baseMat=this.base(n);redraw(b.id);};row.appendChild(b);}panel.appendChild(row);
    panel.appendChild(el('p','hint','Model a given number. Exchange 1 hundred for 10 tens, or 1 ten for 10 ones. The value stays the same. Use your lesson’s strategy to finish the calculation.'));
    const grid=el('div','place-value-mat');
    for(const [k,label,value] of [['h','Hundreds',100],['t','Tens',10],['o','Ones',1]]){
      const col=el('div','place-value-column');col.appendChild(el('strong',null,label));
      const blocks=el('div','base-blocks');blocks.setAttribute('role','img');blocks.setAttribute('aria-label',m[k]+' '+label.toLowerCase()+', value '+m[k]*value);
      for(let i=0;i<m[k];i++){
        let lines='';if(k!=='o')for(let j=1;j<10;j++)lines+='<path d="M'+j*4+' 0v'+(k==='h'?40:4)+'"/>'+(k==='h'?'<path d="M0 '+j*4+'h40"/>':'');
        blocks.appendChild(el('span','base-block '+k,'<svg viewBox="0 0 '+(k==='o'?'4 4':k==='t'?'40 4':'40 40')+'" aria-hidden="true"><rect width="100%" height="100%"/>'+lines+'</svg>'));
      }
      col.appendChild(blocks);col.appendChild(el('span',null,m[k]+' × '+value));grid.appendChild(col);
    }panel.appendChild(grid);
    const status=el('p','mat-equation',100*m.h+' + '+10*m.t+' + '+m.o+' = '+selected);status.setAttribute('role','status');panel.appendChild(status);
    const controls=el('div','row');
    for(const [k,label,disabled] of [['h','1 hundred → 10 tens',m.h<1],['t','1 ten → 10 ones',m.t<1],['o','10 ones → 1 ten',m.o<10],['ten','10 tens → 1 hundred',m.t<10]]){
      const b=el('button','hint-btn',label);b.disabled=disabled;b.id='mat-exchange-'+k;b.onclick=()=>{if(this.exchange(m,k))redraw(b.id);};controls.appendChild(b);
    }
    const reset=el('button','hint-btn','Reset this number');reset.id='mat-reset-number';reset.onclick=()=>{step.baseMat=this.base(selected);redraw(reset.id);};controls.appendChild(reset);panel.appendChild(controls);
  },
  groups(panel,pr,step,redraw){
    const m=pr.math,multiply=m.type==='multiply';
    const sharing=!multiply&&(pr.kind==='deal'||/share|equally among|equal groups/i.test(pr.html.replace(/<[^>]*>/g,'')))&&pr.kind!=='grouping';
    // Use a neutral related-fact model when the word problem does not explicitly
    // distinguish sharing from grouping. The caption always states the meaning.
    const total=multiply?m.a*m.b:m.total,per=multiply?m.b:m.divisor,limit=multiply?m.a:total/per;
    const key=[multiply?'multiply':sharing?'share':'group',total,per].join(':');
    let state=step.groupMat;
    if(!state||state.key!==key||!Number.isInteger(state.round)||state.round<0||state.round>limit)state=step.groupMat={key,round:0};
    const count=sharing?Array(per).fill(state.round):Array(state.round).fill(per),placed=count.reduce((a,b)=>a+b,0);
    panel.appendChild(el('p','hint',multiply?'Build '+m.a+' groups of '+m.b+'. Each new group must have the same number.':sharing?'Share '+total+' counters equally among '+per+' groups. Deal one counter to every group in each round.':'Use the related grouping fact: put '+per+' counters in each group, using '+total+' counters altogether.'));
    const bins=el('div','diagram-grid');Engine.drawGroups(bins,count);panel.appendChild(bins);
    const caption=multiply?state.round+' groups of '+per+' = '+placed+' counters':placed+' of '+total+' counters placed. '+(total-placed)+' left.';
    const status=el('p','mat-equation',caption);status.setAttribute('role','status');panel.appendChild(status);
    if(state.round===limit&&!multiply)panel.appendChild(el('p','hint',sharing?'All shared: '+state.round+' counters in each group.':'All grouped: '+state.round+' groups.'));
    const row=el('div','row'),next=el('button','mid-btn',sharing?'Deal one round':'Build one group of '+per);next.disabled=state.round>=limit;next.id='mat-build-group';
    next.onclick=()=>{if(state.round<limit){state.round++;Audio2.pop();redraw(state.round===limit?'mat-reset-groups':next.id);}};
    const reset=el('button','hint-btn','Reset counters');reset.id='mat-reset-groups';reset.onclick=()=>{state.round=0;redraw(reset.id);};row.appendChild(next);row.appendChild(reset);panel.appendChild(row);
  }
};
