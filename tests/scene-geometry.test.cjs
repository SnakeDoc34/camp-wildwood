const test=require('node:test'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const {load}=require('./helpers.cjs');
test('real Three.js geometry builds camp, soccer and canoe scenes with valid meshes and pickable plots',async()=>{
  const T=await import(pathToFileURL(path.join(__dirname,'../vendor/three.module.min.js')).href);
  const a=load(),p=a.profile;p.shop=a.SHOP_ITEMS.map(i=>i.id);const d=a.Yard.ensure(p);d.pitch='soccer';
  const original=a.doc.createElement.bind(a.doc);a.doc.createElement=tag=>{const e=original(tag);if(tag==='canvas')e.getContext=()=>({fillRect(){},fillText(){}});return e;};
  const v=Object.create(a.WildView.prototype);Object.assign(v,{T,host:{getAttribute:()=> 'golden'},kind:'camp',mode:'svg3d',p,options:{editable:true},dead:false,root:null,canvas:a.doc.createElement('svg'),scene:new T.Scene(),materials:new Map(),anim:[],target:new T.Vector3(),camera:new T.PerspectiveCamera(),yaw:.55,pitch:.76,distance:35});
  for(const kind of ['camp','soccer','canoe']){
    v.kind=kind;v.rebuild();v.scene.updateMatrixWorld(true);let meshes=0;
    v.scene.traverse(o=>{if(o.isMesh){meshes++;const b=o.geometry.attributes.position;assert.ok(b?.count>0);for(const n of b.array)assert.ok(Number.isFinite(n));for(const n of o.matrixWorld.elements)assert.ok(Number.isFinite(n));}});
    assert.ok(meshes>40,kind);if(kind==='camp'){assert.equal(v.pickables.length,10);assert.equal(new Set(v.pickables.map(o=>o.userData.plot)).size,10);}
    if(kind==='soccer'){assert.ok(v.ball);assert.ok(v.keeper);assert.ok(v.targetRing);}if(kind==='canoe')assert.equal(v.gates.length,6);
  }
  v.clear();assert.equal(v.materials.size,0);
});
