const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
class Element{
  constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.children=[];this.parentNode=null;this.style={};this.attrs={};this.className='';this.disabled=false;this.value='';this._html='';}
  set id(v){this._id=v;this.doc.ids.set(v,this);}get id(){return this._id;}
  set innerHTML(v){for(const c of this.children)c.remove();this.children=[];this._html=String(v);}
  get innerHTML(){return this._html;}
  set textContent(v){this.innerHTML=String(v);}get textContent(){return this._html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&')+this.children.map(c=>c.textContent).join('');}
  appendChild(c){c.parentNode=this;this.children.push(c);return c;}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(c=>c!==this);if(this.id&&this.doc.ids.get(this.id)===this)this.doc.ids.delete(this.id);for(const c of [...this.children])c.remove();}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='id')this.id=v;if(k==='class')this.className=v;}
  getAttribute(k){return this.attrs[k]??null;}
  addEventListener(k,f){this['on'+k]=f;}
  get classList(){const e=this;return {contains:c=>e.className.split(/\s+/).includes(c),add(c){if(!this.contains(c))e.className+=' '+c;},remove(c){e.className=e.className.split(/\s+/).filter(x=>x!==c).join(' ');},toggle(c,force){const yes=force===undefined?!this.contains(c):force;yes?this.add(c):this.remove(c);}};}
  querySelectorAll(sel){return this.children.flatMap(c=>[...(c.matches(sel)?[c]:[]),...c.querySelectorAll(sel)]);}
  querySelector(sel){let c=this.querySelectorAll(sel)[0];if(!c&&sel==='button'&&this._html.includes('<button')){c=this.doc.createElement('button');this.appendChild(c);}return c||null;}
  matches(sel){return sel.startsWith('.')?this.classList.contains(sel.slice(1)):this.tagName.toLowerCase()===sel;}
}
function load(saved){
  const doc={ids:new Map(),onkeydown:null,createElement(tag){return new Element(tag,this);},getElementById(id){return this.ids.get(id)||null;},addEventListener(){},querySelectorAll(sel){return [...this.ids.values()].filter(e=>sel==='.screen'&&e.classList.contains('screen'));}};
  const html=fs.readFileSync(ROOT+'/index.html','utf8');
  for(const m of html.matchAll(/<([\w]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const e=doc.createElement(m[1]);e.id=m[2];const cls=m[0].match(/class="([^"]*)"/);if(cls)e.className=cls[1];}
  const data=new Map(saved?Object.entries(saved):[]),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  const timers=new Map();let timerId=0;const speech=[];const audios=[];
  class Audio{constructor(src){this.src=src;this.paused=true;audios.push(this);}pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}}
  const window={scrollTo(){},print(){},AUDIO_DATA:{}};
  const speechSynthesis={cancel(){},getVoices(){return [];},speak(u){speech.push(u.text);}};window.speechSynthesis=speechSynthesis;
  const c=vm.createContext({window,document:doc,localStorage:storage,Audio,speechSynthesis,SpeechSynthesisUtterance:class{constructor(t){this.text=t;}},console,confirm:()=>false,
    setTimeout(f,ms){const id=++timerId;timers.set(id,{f,ms});return id;},clearTimeout(id){timers.delete(id);}});
  for(const f of ['core','yard','camp','engine','chapters','chapters-m2','chapters-m3','strategies','app'])vm.runInContext(fs.readFileSync(ROOT+'/js/'+f+'.js','utf8'),c);
  const api=vm.runInContext('({R,Store,Settings,Audio2,Engine,MathCheck,App,Camp,Yard,SHOP_ITEMS,YARD_SLOTS,newProfileState,FAMILIES:window.FAMILIES,TARGETS:window.TARGETS,knownFact,clockSVG,barGraphSVG,pictoSVG,fractionSVG})',c);
  api.Store.init();api.R.seed(20261012);
  // Mechanics tests run as if a teacher opened every trail from the Report
  // screen; progression.test.cjs opts back into the locked default.
  api.Settings.unlockAll=true;const profile=api.newProfileState('QA','🦝');api.Store.saveProfile(profile);api.App.profile=profile;
  return {...api,doc,data,timers,speech,audios,profile,window};
}
function button(root,text){return root.querySelectorAll('button').find(b=>b.textContent===text);}
function solve(api,step){const pr=step.problem,btn=api.doc.createElement('button');btn.textContent=pr.answer;api.Engine.answer(btn,true,pr,api.doc.createElement('div'),step);}
module.exports={load,button,solve};
