/* Real perspective 3D scenes, locally bundled Three.js (MIT). Math is DOM/SVG. */
'use strict';
const Camp3D={
  T:null,SVG:null,noWebGL:false,loading:null,views:new Set(),raf:0,last:0,
  load(){return this.loading||(this.loading=Promise.all([import('../../vendor/three.module.min.js'),import('../../vendor/addons/SVGRenderer.js')]).then(([t,svg])=>{this.SVG=svg.SVGRenderer;return this.T=t;}));},
  mount(host,kind,p,options={}){
    if(!window.requestAnimationFrame)return; // Node mechanics adapter / no graphics surface.
    window.requestAnimationFrame(async()=>{
      this.sweep();if(!host.isConnected)return;
      try{const T=await this.load();if(!host.isConnected)return;const v=new WildView(T,host,kind,p,options);this.views.add(v);host._view=v;host.setAttribute('data-renderer',v.mode);this.run();}
      catch(err){host.setAttribute('data-renderer','fallback');const note=host.querySelector('.world-loading');if(note)note.textContent='3D is unavailable on this device. Use the camp and game controls below.';console.warn('Camp 3D unavailable:',err.message);}
    });
  },
  sweep(){for(const v of this.views)if(!v.host.isConnected||v.host.closest('.screen')?.classList.contains('hidden')){v.dispose();this.views.delete(v);}},
  run(){if(this.raf)return;const tick=stamp=>{
    this.raf=0;this.sweep();if(!this.views.size){this.last=0;return;}
    this.raf=window.requestAnimationFrame(tick);if(stamp-this.last<([...this.views].some(v=>v.mode==='webgl')?33:66))return;const dt=Math.min(.08,(stamp-(this.last||stamp))/1000);this.last=stamp;if(document.hidden)return;
    for(const v of this.views){if(document.documentElement.classList.contains('playing-camp-game')&&!v.host.closest('.arcade-playing'))continue;const r=v.host.getBoundingClientRect();if(r.bottom>0&&r.top<window.innerHeight&&r.width>0)v.tick(dt);}
  };this.raf=window.requestAnimationFrame(tick);},
  refresh(){for(const v of this.views)if(v.kind==='camp')v.rebuild();},
  stopGames(){for(const v of [...this.views])if(v.kind!=='camp'){v.dispose();this.views.delete(v);}},
  controls(host){
    const row=el('div','world-camera-controls');
    for(const[label,action]of [['↶','left'],['↷','right'],['＋','in'],['−','out'],['⌂','reset']]){
      const b=el('button','camera-btn',label);b.setAttribute('aria-label',({left:'Rotate camp left',right:'Rotate camp right',in:'Zoom into camp',out:'Zoom out of camp',reset:'Reset camp camera'})[action]);
      b.onclick=()=>host._view?.cameraAction(action);row.appendChild(b);
    }host.appendChild(row);
  },
  camp(p,editable,daylight){
    const wrap=el('div','camp-world');const stage=el('div','world-stage camp-stage');
    stage.setAttribute('aria-label','Interactive 3D woodland camp');stage.appendChild(el('span','world-loading','Growing your 3D woodland…'));wrap.appendChild(stage);
    const top=el('div','world-topline','<span class="world-label">WILDWOOD · YOUR 3D CAMP</span>');
    const light=el('button','world-light','');const label=()=>({morning:'☀ Daylight',golden:'◒ Sunset',night:'☾ Night lights'})[stage.getAttribute('data-daylight')];
    stage.setAttribute('data-daylight',daylight||Yard.ensure(p).timeOfDay);light.textContent=label();light.setAttribute('aria-label','Change campsite lighting');
    light.onclick=()=>{const d=Yard.ensure(p),times=['morning','golden','night'];d.timeOfDay=times[(times.indexOf(stage.getAttribute('data-daylight'))+1)%3];stage.setAttribute('data-daylight',d.timeOfDay);light.textContent=label();Store.persist();stage._view?.rebuild();};top.appendChild(light);wrap.appendChild(top);
    this.controls(stage);wrap.appendChild(el('p','world-help',editable?'Drag to look around · Tap a glowing plot to place your selected item · Pinch or use ＋ / − to zoom':'Drag to explore your camp in 360° · Pinch or use ＋ / − to zoom'));
    // Equivalent native controls remain available for keyboard and non-WebGL devices.
    const plots=el('div','plot-controls');if(!editable)plots.classList.add('hidden');
    for(const slot of YARD_SLOTS){const id=Yard.ensure(p).slots[slot.id],it=Yard.item(id),b=el('button','plot-btn',esc(slot.name)+'<small>'+esc(it?.name||'Open plot')+'</small>');b.id='plot-'+slot.id;b.setAttribute('aria-label',slot.name+': '+(it?.name||'empty')+(Yard.selected?'. Place '+Yard.item(Yard.selected).name:''));b.onclick=()=>this.selectPlot(p,slot.id);plots.appendChild(b);}wrap.appendChild(plots);
    this.mount(stage,'camp',p,{editable});return wrap;
  },
  selectPlot(p,id){
    const d=Yard.ensure(p),item=d.slots[id];
    if(Yard.selected){const name=Yard.item(Yard.selected).name;Yard.place(p,Yard.selected,id);Yard.selected=null;Yard.message=name+' placed. Your camp is saved.';Audio2.pop();}
    else if(item){Yard.selected=item;Yard.message=Yard.item(item).name+' selected. Pick a plot, rotate it, or change its size.';}
    else Yard.message='Pick something from your backpack, then choose a plot.';
    Yard.renderDesigner(p);document.getElementById('plot-'+id)?.focus?.();
  }
};
class WildView{
  constructor(T,host,kind,p,options){
    this.T=T;this.host=host;this.kind=kind;this.p=p;this.options=options;this.dead=false;this.time=0;this.materials=new Map();this.anim=[];
    this.mode='webgl';try{if(Camp3D.noWebGL)throw new Error('Software renderer selected');this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch(e){Camp3D.noWebGL=true;this.mode='svg3d';this.renderer=new Camp3D.SVG();this.renderer.setPrecision(2);}this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
    if(this.renderer.shadowMap){this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;}this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
    this.canvas=this.renderer.domElement;this.canvas.classList.add('world-canvas');this.canvas.setAttribute('aria-label',kind==='camp'?'3D campsite. Drag to orbit. Use the camera buttons to rotate or zoom.':kind==='soccer'?'3D soccer field with moving goalkeeper and ball':'3D creek with canoe and approaching gates');this.canvas.setAttribute('role','img');host.appendChild(this.canvas);
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.dispose();host.setAttribute('data-renderer','fallback');const note=host.querySelector('.world-loading');if(note)note.textContent='3D paused. Game controls remain available. Reload to try 3D again.';});
    this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(kind==='camp'?39:48,1,.1,160);const saved=Yard.ensure(p).camera;this.yaw=saved?.yaw??.55;this.pitch=saved?.pitch??.76;this.distance=saved?.distance??42;this.target=new T.Vector3(0,0,0);this.rebuild();
    if(kind==='camp')this.pointer();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();host.querySelector('.world-loading')?.classList.add('hidden');
  }
  m(color,extra={}){const key=String(color)+JSON.stringify(extra);if(!this.materials.has(key))this.materials.set(key,new this.T.MeshStandardMaterial({color,roughness:.82,metalness:0,...extra}));return this.materials.get(key);}
  mesh(geometry,color,x=0,y=0,z=0,parent=this.root,extra={}){const o=new this.T.Mesh(geometry,this.m(color,extra));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  box(w,h,d,c,x,y,z,parent){return this.mesh(new this.T.BoxGeometry(w,h,d),c,x,y,z,parent);}
  sphere(r,c,x,y,z,parent){return this.mesh(new this.T.SphereGeometry(r,16,10),c,x,y,z,parent);}
  cylinder(rt,rb,h,c,x,y,z,parent){return this.mesh(new this.T.CylinderGeometry(rt,rb,h,12),c,x,y,z,parent);}
  line(points,c,width=.035,parent=this.root){const T=this.T;if(width<.02){const o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color:c}));parent.add(o);return o;}const curve=new T.CurvePath();for(let j=1;j<points.length;j++)curve.add(new T.LineCurve3(new T.Vector3(...points[j-1]),new T.Vector3(...points[j])));return this.mesh(new T.TubeGeometry(curve,Math.max(4,points.length*3),width,5,false),c,0,0,0,parent);}
  group(x=0,y=0,z=0,parent=this.root){const g=new this.T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  clear(){
    if(!this.root)return;const geometries=new Set(),textures=new Set(),allMaterials=new Set();this.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){allMaterials.add(m);if(m.map)textures.add(m.map);}});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());for(const m of allMaterials)m.dispose();this.materials.clear();this.scene.remove(this.root);this.anim=[];
  }
  rebuild(){
    if(this.dead)return;this.clear();this.scene.traverse(o=>{if(o.isLight&&o.shadow)o.shadow.dispose();});const T=this.T;this.scene.clear();this.root=new T.Group();this.scene.add(this.root);this.materials.clear();this.anim=[];this.pickables=[];
    const day=this.host.getAttribute('data-daylight')||Yard.ensure(this.p).timeOfDay,night=day==='night',gold=day==='golden';
    const sky=night?'#17283e':gold?'#b7a2a4':'#b8d6d5';this.scene.background=new T.Color(sky);this.scene.fog=new T.Fog(sky,48,110);
    this.scene.add(new T.HemisphereLight(night?'#9cbbe3':'#fff3d1',night?'#344641':'#63834c',night?1.6:2.5));
    if(this.mode==='svg3d')this.scene.add(new T.AmbientLight('#d7e6e0',night?.4:.65));
    const sun=new T.DirectionalLight(gold?'#ffd6a0':night?'#b8d4ff':'#fff0d5',this.mode==='svg3d'?(night?.7:1):night?1.4:3);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.normalBias=.035;this.scene.add(sun);
    if(this.kind==='camp')this.buildCamp(night);else if(this.kind==='soccer')this.buildSoccer();else this.buildCanoe();
  }
  tree(x,z,scale=1){
    const T=this.T,g=this.group(x,0,z);this.cylinder(.16,.24,1.5,'#805941',0,.75,0,g);
    for(let j=0;j<3;j++){const crown=this.mesh(new T.ConeGeometry(1.1-j*.21,1.8,7),'#2c6951',0,1.7+j*.65,0,g);crown.rotation.y=j*.6;}
    g.scale.setScalar(scale);this.anim.push(t=>{if(!Living.isCalm())g.rotation.z=Math.sin(t*.65+x)*.018;});return g;
  }
  goal(x,z,scale=1,color='#fff3d4',parent=this.root){
    const g=this.group(x,.04,z,parent);g.scale.setScalar(scale);
    this.line([[-3.4,0,0],[-3.4,2.5,0],[3.4,2.5,0],[3.4,0,0]],color,.09,g);
    this.line([[-3.4,0,0],[-3.4,0,-1.25],[-3.4,2.5,0]],color,.045,g);this.line([[3.4,0,0],[3.4,0,-1.25],[3.4,2.5,0]],color,.045,g);
    for(let i=0;i<=12;i++){const xx=-3.4+i*6.8/12;this.line([[xx,0,-1.25],[xx,2.5,-.05]],'#c8dbcb',.014,g);}
    for(let j=0;j<=5;j++){const yy=j*.5;this.line([[-3.4,yy,-1.25+yy*.48],[3.4,yy,-1.25+yy*.48]],'#c8dbcb',.014,g);}return g;
  }
  buildPitch(x=0,z=1,w=8,d=11,parent=this.root,arena=false){
    const T=this.T,design=Yard.ensure(this.p),g=this.group(x,0,z,parent),theme=CampStyle.team(design.team);
    this.box(w+.6,.16,d+.6,'#42684c',0,.02,0,g).renderOrder=-82;
    const striped=Yard.owns(this.p,'pitch-stripes')&&design.striped;
    for(let i=0;i<(striped?8:1);i++)this.box(w,.035,d/(striped?8:1),striped&&i%2?'#4c9662':'#6fa76b',0,.12,-d/2+d/(striped?16:2)+i*d/(striped?8:1),g).renderOrder=-80;
    const lines=this.group(0,.15,0,g),paint='#f7f1d4';this.line([[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,0,-d/2]],paint,.035,lines);this.line([[-w/2,0,0],[w/2,0,0]],paint,.035,lines);
    const circle=[];for(let i=0;i<=40;i++)circle.push([Math.cos(i/40*Math.PI*2)*w*.15,0,Math.sin(i/40*Math.PI*2)*w*.15]);this.line(circle,paint,.027,lines);
    for(const side of [-1,1]){const zz=side*d/2;this.line([[-w*.27,0,zz],[-w*.27,0,zz-side*d*.17],[w*.27,0,zz-side*d*.17],[w*.27,0,zz]],paint,.03,lines);if(!arena){const goal=this.goal(0,zz,w/11,Yard.owns(this.p,'goal-neon')&&design.neon?'#86efd0':'#fff3d4',g);if(side===1)goal.rotation.y=Math.PI;}}
    for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2]){this.cylinder(.025,.025,.8,'#ede4c8',xx,.5,zz,g);const f=this.box(.4,.24,.025,theme,xx+.17,.82,zz,g);this.anim.push(t=>{if(!Living.isCalm())f.rotation.y=Math.sin(t*2+xx)*.12;});}
    if(design.teamName){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle=theme;ctx.fillRect(0,0,512,96);ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff6dc';ctx.fillText(design.teamName.toUpperCase().slice(0,16),256,62);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sign=this.mesh(new T.BoxGeometry(4,.65,.1),'#ffffff',0,.6,d/2+1.2,g);sign.material=new T.MeshStandardMaterial({map:texture,roughness:.8});}
    if(Yard.owns(this.p,'stadium-lights')&&design.floodlights)for(const xx of [-w/2-1,w/2+1]){this.cylinder(.05,.09,4,'#697e7c',xx,2,0,g);this.box(.9,.3,.35,'#2d4f4f',xx,4,0,g);for(let j=-1;j<=1;j++)this.mesh(new T.BoxGeometry(.18,.18,.07),'#fff0bd',xx+j*.25,4,.2,g,{emissive:'#ffd48a',emissiveIntensity:2});}
    if(Yard.owns(this.p,'grandstand')&&design.stands)for(const side of [-1,1]){for(let j=0;j<3;j++){this.box(1.1,.22,d*.48,theme,side*(w/2+1.1+j*.35),.35+j*.3,0,g);for(let k=-1;k<=1;k++)this.cylinder(.055,.055,.6+j*.3,'#7b6147',side*(w/2+1.1+j*.35),.1+j*.15,k*d*.17,g);}}
    lines.traverse(o=>o.renderOrder=-70);return g;
  }
  cabin(x,z){
    const T=this.T,g=this.group(x,0,z),d=Yard.ensure(this.p),roof=CampStyle.roof(d.roof);
    this.box(5,.3,3.8,'#796347',0,.16,0,g);this.box(4.4,2.25,3.2,'#c19864',0,1.35,0,g);
    for(let j=0;j<7;j++)this.box(4.52,.045,3.28,'#a17951',0,.42+j*.31,0,g);
    const shape=new T.Shape();shape.moveTo(-2.65,0);shape.lineTo(0,1.65);shape.lineTo(2.65,0);shape.closePath();const r=this.mesh(new T.ExtrudeGeometry(shape,{depth:4,bevelEnabled:false}),roof,0,2.4,-2,g);r.castShadow=true;
    this.box(.85,1.7,.09,'#614b39',0,1.05,1.65,g);this.sphere(.06,'#edc66c',.27,1.05,1.72,g);
    for(const xx of [-1.35,1.35]){this.box(.9,.85,.09,'#fff0b4',xx,1.5,1.66,g);this.box(1.04,.09,.17,'#6c5540',xx,1.02,1.7,g);this.box(.055,.86,.12,'#866747',xx,1.5,1.73,g);this.box(.9,.055,.12,'#866747',xx,1.5,1.73,g);}
    this.box(.5,1.5,.65,'#8b7660',1.4,3.35,-.6,g);this.box(2.2,.18,.8,'#a7865b',0,.24,2.1,g);this.box(1.7,.12,.55,'#a7865b',0,.1,2.65,g);return g;
  }
  item(id,x,z,rotation=0,scale=1){
    const T=this.T,g=this.group(x,.16,z);g.rotation.y=rotation;g.scale.setScalar(scale);
    if(id==='sapling'){const tree=this.tree(0,0,.65);this.root.remove(tree);g.add(tree);}
    else if(id==='stones'){for(let j=0;j<3;j++)this.mesh(new T.DodecahedronGeometry(.42+j*.08,0),'#a1aa9c',j*.6-.6,.22,j%2*.4,g);}
    else if(id==='tent'){const color=CampStyle.tent(Yard.ensure(this.p).tentColor),shape=new T.Shape();shape.moveTo(-1.2,0);shape.lineTo(0,1.65);shape.lineTo(1.2,0);shape.closePath();this.mesh(new T.ExtrudeGeometry(shape,{depth:2.2,bevelEnabled:false}),color,0,.1,-1.1,g);const door=this.box(.75,1.1,.025,'#3b4d45',0,.65,1.12,g);this.line([[-1.2,.2,1.2],[-1.8,.03,1.8]],'#e1d4b1',.025,g);this.line([[1.2,.2,1.2],[1.8,.03,1.8]],'#e1d4b1',.025,g);}
    else if(id==='bench'){for(let j=0;j<3;j++)this.box(2,.13,.21,'#be8b58',0,.7,j*.23,g);this.box(2,.6,.12,'#be8b58',0,1.1,-.1,g);for(const xx of [-.7,.7])this.box(.1,.7,.7,'#615848',xx,.3,.2,g);}
    else if(id==='flag-red'||id==='sign'){this.cylinder(.06,.08,2.5,'#8b6749',0,1.25,0,g);this.box(id==='sign'?1.6:1.1,id==='sign'?.6:.7,.07,id==='sign'?'#c9a16a':'#d97155',.45,2,0,g);}
    else if(id==='canoe')this.canoeMesh(g);
    else if(id==='flowers'){this.box(1.8,.32,.9,'#9c6c45',0,.2,0,g);this.box(1.6,.04,.7,'#655d3c',0,.38,0,g);for(let j=0;j<5;j++){const xx=(j-2)*.3;this.cylinder(.025,.025,.65,'#4c7a4d',xx,.68,0,g);this.sphere(.2,j%2?'#f5c76e':'#d985a2',xx,1,0,g);}}
    else if(id==='campfire'){for(let j=0;j<9;j++)this.mesh(new T.DodecahedronGeometry(.24,0),'#939b8c',Math.cos(j/9*6.28)*.75,.2,Math.sin(j/9*6.28)*.75,g);for(let j=0;j<3;j++){const log=this.cylinder(.12,.14,1.25,'#835a38',0,.25,0,g);log.rotation.z=Math.PI/2;log.rotation.y=j*1.05;}const flame=this.mesh(new T.ConeGeometry(.44,1.3,7),'#f8b451',0,.9,0,g,{emissive:'#e87a30',emissiveIntensity:1.3});this.mesh(new T.ConeGeometry(.24,.8,7),'#ffe3a0',0,.7,.15,g,{emissive:'#ffce69',emissiveIntensity:1.5});this.anim.push(t=>{if(!Living.isCalm())flame.scale.set(1+Math.sin(t*9)*.08,1+Math.sin(t*12)*.12,1);});}
    else if(id==='lanterns'||id==='fairy-lights'){for(const xx of [-1.1,1.1])this.cylinder(.05,.07,2.2,'#8c6b4a',xx,1.1,0,g);this.line([[-1.1,2.2,0],[0,1.75,0],[1.1,2.2,0]],'#4c5b45',.025,g);for(let j=0;j<5;j++)this.mesh(new T.SphereGeometry(id==='lanterns'?.2:.11,12,8),'#ffe2a0',-1+j*.5,1.8+Math.abs(j-2)*.13,0,g,{emissive:'#ffc476',emissiveIntensity:1.7});}
    return g;
  }
  canoeMesh(parent){
    const T=this.T,g=this.group(0,0,0,parent);const hull=this.mesh(new T.SphereGeometry(1,24,12),'#bd7c4d',0,.35,0,g);hull.scale.set(.6,.35,1.65);const inside=this.mesh(new T.SphereGeometry(1,24,8),'#dfb57e',0,.5,0,g);inside.scale.set(.47,.12,1.4);for(const zz of [-.55,.55])this.box(.9,.08,.18,'#926344',0,.57,zz,g);const paddle=this.cylinder(.035,.035,2.1,'#755537',.5,.85,0,g);paddle.rotation.z=.8;this.box(.24,.55,.07,'#a37047',1.07,.25,0,g);return g;
  }
  buildCamp(night){
    const T=this.T,d=Yard.ensure(this.p);this.target.set(0,.3,0);
    const land=this.mesh(new T.CylinderGeometry(16,14.5,1.8,64),'#82684c',0,-1.05,0);land.receiveShadow=true;land.renderOrder=-100;const grass=this.mesh(new T.CylinderGeometry(16,16,.18,64),'#8baf78',0,-.08,0);grass.renderOrder=-99;
    const river=this.box(3,.09,26,'#75b8bd',-10.2,.05,0);river.renderOrder=-90;river.material=this.m('#75b8bd',{roughness:.25,metalness:.2});
    for(let j=0;j<9;j++){const ripple=this.box(1+.3*(j%3),.015,.035,'#bde2d6',-10.2,.12,-10+j*2.6);ripple.renderOrder=-89;this.anim.push(t=>{if(!Living.isCalm())ripple.position.z=-12+(j*2.7+t*.4)%24;});}
    for(let j=0;j<8;j++)this.box(.42,.08,2,'#b49061',-11.6+j*.43,.27,-3.8);
    for(let j=0;j<3;j++){const cloud=this.group(-14+j*13,10+j%2*2,-18);for(let k=0;k<3;k++)this.sphere(1.5+k*.15,night?'#506478':'#f5efda',k*1.7,0,0,cloud);cloud.scale.y=.45;this.anim.push(t=>{if(!Living.isCalm())cloud.position.x=-14+j*13+Math.sin(t*.1+j)*1.3;});}
    this.cabin(0,-8.2);if(d.pitch==='soccer')this.buildPitch(1.2,1,8,10);else{this.box(8,.05,10,'#a8bf80',1.2,.05,1).renderOrder=-80;for(let j=0;j<5;j++)this.box(.35,.06,.28,'#789765',-1+j*.9,.1,1);}
    for(let j=0;j<24;j++){const theta=j/24*Math.PI*2,rr=13.3+(j%3)*.65;this.tree(Math.cos(theta)*rr,Math.sin(theta)*rr,.65+(j%4)*.13);}
    this.pickables=[];
    for(const slot of YARD_SLOTS){const x=(slot.x-50)*.28,z=(slot.y-50)*.28,id=d.slots[slot.id];if(id){const tr=d.transforms[id]||{rotation:0,scale:1};this.item(id,x,z,tr.rotation*Math.PI/180,tr.scale);}
      if(this.options.editable){const tile=this.mesh(new T.CylinderGeometry(1,1,.06,24),id?'#d4bc83':'#b8de9b',x,.09,z,this.root,{transparent:true,opacity:Yard.selected?.9:.55});tile.userData.plot=slot.id;this.pickables.push(tile);if(Yard.selected){const ring=this.mesh(new T.TorusGeometry(1.05,.05,5,32),'#fff0b0',x,.2,z);ring.rotation.x=-Math.PI/2;}}
    }
    const fox=this.group(4,.3,8.3);this.sphere(.42,'#d58b50',0,.5,0,fox);this.sphere(.45,'#df9456',0,1.05,.1,fox);for(const xx of [-.25,.25]){this.mesh(new T.ConeGeometry(.18,.45,4),'#bb6d42',xx,1.45,.1,fox);this.sphere(.045,'#263e35',xx*.7,1.13,.49,fox);}this.sphere(.2,'#fff1d2',0,.95,.46,fox);this.sphere(.07,'#273b33',0,1.01,.61,fox);
    if(night){const pts=[];for(let j=0;j<35;j++)pts.push(Math.sin(j*7.13)*12,1+(j%6)*.6,Math.cos(j*5.2)*11);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));this.root.add(new T.Points(geo,new T.PointsMaterial({color:'#ffeab0',size:.09})));}
    this.orbit();
  }
  buildSoccer(){
    const T=this.T;this.buildPitch(0,0,11,19,this.root,true);for(const side of [-1,1])for(let j=0;j<6;j++)this.tree(side*(9+j%2),-10+j*4,.9);
    this.goal(0,-8.5,1.2,Yard.ensure(this.p).neon?'#87edd5':'#fff6df');
    this.ball=this.sphere(.29,'#fff8e7',0,.4,6.5);for(let j=0;j<6;j++){const spot=this.mesh(new T.CircleGeometry(.1,5),'#344c43',Math.sin(j)*.27,.05,Math.cos(j)*.27,this.ball);spot.lookAt(0,0,0);}
    this.keeper=this.group(0,0,-8);const kit=CampStyle.team(Yard.ensure(this.p).team);this.box(.7,.85,.35,kit,0,1.1,0,this.keeper);this.sphere(.25,'#ebbf8c',0,1.85,0,this.keeper);for(const side of [-1,1]){this.box(.18,.65,.2,'#233e40',side*.23,.39,0,this.keeper);const arm=this.box(.2,.8,.2,kit,side*.55,1.28,0,this.keeper);arm.rotation.z=side*.65;this.sphere(.14,'#fff6df',side*.82,1,0,this.keeper);}
    this.aimRing=this.mesh(new T.TorusGeometry(.17,.025,5,20),'#b6ffe4',0,1,-8.3);
    this.canvas.addEventListener('pointerdown',e=>{if(!this.options.onAim)return;const bounds=this.canvas.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),this.camera);const hit=ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,0,1),8.3),new T.Vector3());if(hit&&Math.abs(hit.x)<4.1&&hit.y>=0&&hit.y<3)this.options.onAim(Math.max(-1,Math.min(1,hit.x/3.65)),Math.max(0,Math.min(1,(hit.y-.55)/1.8)));});
    this.targetRing=this.mesh(new T.TorusGeometry(.38,.055,6,32),'#ffd76f',2.8,1.9,-8.35);this.camera.position.set(0,4.1,13.3);this.camera.lookAt(0,1,-5);this.options.onReady?.(this);
  }
  buildCanoe(){
    const T=this.T;this.box(12,.3,65,'#6aaeb5',0,-.2,-13);for(const side of [-1,1]){this.box(9,.5,65,'#86a671',side*10,-.15,-13);for(let j=0;j<9;j++)this.tree(side*(7+j%3),10-j*6,.9+(j%3)*.2);}
    this.boat=this.group(0,.05,5);this.canoeMesh(this.boat);this.boat.rotation.y=Math.PI;this.camera.position.set(0,5.5,13);this.camera.lookAt(0,.2,-10);this.gates=[];
    for(let j=0;j<6;j++){const gate=this.group(0,0,-j*8-5);for(const xx of [-1.2,1.2]){this.cylinder(.065,.065,2.2,'#f9dc8e',xx,1,0,gate);this.box(.35,.4,.03,'#e4a660',xx+.15,1.7,0,gate);}this.gates.push(gate);}
    this.options.onReady?.(this);
  }
  pointer(){
    const c=this.canvas;let start=null,last=null,moved=false,points=new Map(),pinch=null;
    c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);points.set(e.pointerId,[e.clientX,e.clientY]);if(points.size===1){start=[e.clientX,e.clientY];last=start;moved=false;}else{moved=true;const a=[...points.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);}});
    c.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,[e.clientX,e.clientY]);if(points.size===2){const a=[...points.values()],dist=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch)this.distance=Math.max(20,Math.min(55,this.distance*pinch/Math.max(1,dist)));pinch=dist;this.orbit();return;}if(!last)return;const dx=e.clientX-last[0],dy=e.clientY-last[1];if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>7)moved=true;this.yaw-=dx*.008;this.pitch=Math.max(.35,Math.min(1.25,this.pitch+dy*.005));last=[e.clientX,e.clientY];this.orbit();});
    const finish=e=>{points.delete(e.pointerId);if(!moved&&this.options.editable&&e.type==='pointerup'){const r=c.getBoundingClientRect(),ray=new this.T.Raycaster();ray.setFromCamera(new this.T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);const hit=ray.intersectObjects(this.pickables)[0];if(hit)Camp3D.selectPlot(this.p,hit.object.userData.plot);}last=null;pinch=null;if(e.type==='pointerup')this.saveCamera();};c.addEventListener('pointerup',finish);c.addEventListener('pointercancel',e=>{moved=true;finish(e);});
    c.addEventListener('wheel',e=>{e.preventDefault();this.distance=Math.max(20,Math.min(55,this.distance+e.deltaY*.025));this.orbit();},{passive:false});
  }
  orbit(){this.camera.position.set(Math.sin(this.yaw)*Math.cos(this.pitch)*this.distance,Math.sin(this.pitch)*this.distance,Math.cos(this.yaw)*Math.cos(this.pitch)*this.distance);this.camera.lookAt(this.target);}
  cameraAction(action){if(action==='left')this.yaw-=Math.PI/6;if(action==='right')this.yaw+=Math.PI/6;if(action==='in')this.distance=Math.max(20,this.distance-4);if(action==='out')this.distance=Math.min(55,this.distance+4);if(action==='reset'){this.yaw=.55;this.pitch=.76;this.distance=42;}this.orbit();this.saveCamera();}
  saveCamera(){Yard.ensure(this.p).camera={yaw:this.yaw,pitch:this.pitch,distance:this.distance};Store.persist();}
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.fov=this.kind==='camp'&&w/h<1.3?53:this.kind==='camp'?39:48;this.camera.updateProjectionMatrix();}
  tick(dt){if(this.dead)return;this.time+=dt;for(const fn of this.anim)fn(this.time);this.options.update?.(this,dt);this.renderer.render(this.scene,this.camera);}
  dispose(){if(this.dead)return;this.dead=true;this.resizeObserver?.disconnect();this.clear();this.renderer.dispose?.();this.renderer.forceContextLoss?.();this.canvas.remove();}
}
