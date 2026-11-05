// Batch 3 geometry only; animation and state ownership remain in the existing engine.
export function createBatch3Parts(THREE,assemblyModel,registry){
 const materials=new Map();const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.45}));return materials.get(color);};
 function piece(id,parent=assemblyModel){const g=new THREE.Group();g.name=id;parent.add(g);registry.set(id,{object:g});return g;}
 function mesh(g,geo,color,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
 function box(g,w,h,d,color,x=0,y=0,z=0){return mesh(g,new THREE.BoxGeometry(w,h,d),color,x,y,z);}
 function stud(g,color,x,y,z){return mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),color,x,y,z);}
 const group=piece('front-hinge-group'),brick=piece('hinge-white-brick',group);
 const shape=new THREE.Shape();shape.moveTo(-0.78,-0.48);shape.lineTo(0.78,-0.48);shape.lineTo(0.78,0.48);shape.lineTo(-0.78,0.48);shape.closePath();
 const hole=new THREE.Path();hole.absarc(0,0,0.21,0,Math.PI*2,true);shape.holes.push(hole);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:0.76,bevelEnabled:false,curveSegments:28});geo.translate(0,0,-0.38);mesh(brick,geo,0xf4f1e8);
 for(const x of [-0.4,0.4])stud(brick,0xf4f1e8,x,0.555,0);
 const pin=piece('hinge-blue-pin',group);const shaft=mesh(pin,new THREE.CylinderGeometry(0.16,0.16,0.9,24),0x286ca6);shaft.rotation.x=Math.PI/2;
 box(pin,0.32,0.10,0.48,0x286ca6,0,0,0.28);box(pin,0.10,0.32,0.48,0x286ca6,0,0,0.28);
 const link=piece('hinge-gray-link',group);
 const ring=mesh(link,new THREE.TorusGeometry(0.23,0.08,12,32),0x707477);box(link,0.32,0.56,0.24,0x707477,0,0.3,0);
 const bar=mesh(link,new THREE.CylinderGeometry(0.12,0.12,1.56,24),0x707477,0,0.64,0);bar.rotation.z=Math.PI/2;
 for(const id of ['battery-tile-left','battery-tile-right']){
  const g=piece(id);box(g,0.76,0.24,1.56,0x71bfd4);
  for(const x of [-0.3,0.3])box(g,0.018,0.008,1.32,0xe7f4f5,x,0.125,0);
  for(const z of [-0.66,0.66])box(g,0.6,0.008,0.018,0xe7f4f5,0,0.125,z);
  box(g,0.26,0.01,0.045,0xffffff,0,0.13,0.4);box(g,0.045,0.01,0.26,0xffffff,0,0.13,0.4);
  box(g,0.26,0.01,0.045,0xffffff,0,0.13,-0.46);
  const icon=mesh(g,new THREE.TorusGeometry(0.13,0.025,8,24),0xe4eb70,0,0.13,-0.05);icon.rotation.x=Math.PI/2;
 }
 for(const id of ['front-round-left','front-round-right']){
  const g=piece(id);mesh(g,new THREE.CylinderGeometry(0.37,0.37,0.24,32),0x9b9ea1);stud(g,0x9b9ea1,0,0.195,0);
  const edge=mesh(g,new THREE.TorusGeometry(0.365,0.016,8,32),0x707477);edge.rotation.x=Math.PI/2;
 }
 // The PDF repeats the same arch piece; reuse its geometry without changing the originals.
 for(const side of ['left','right']){
  const g=registry.get(`rear-arch-${side}`).object.clone(true);g.name=`front-arch-${side}`;assemblyModel.add(g);registry.set(g.name,{object:g});
 }
 for(const [side,sign] of [['left',-1],['right',1]]){
  const g=piece(`blue-side-${side}`);box(g,0.24,1.56,3.16,0x71bfd4);
  for(const y of [-0.4,0.4])for(const z of [-1.2,-0.4,0.4,1.2]){const m=stud(g,0x71bfd4,sign*0.195,y,z);m.rotation.z=Math.PI/2;}
 }
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#f5d21c';ctx.fillRect(0,0,512,256);
 ctx.fillStyle='#222222';ctx.font='bold 100px sans-serif';ctx.textAlign='center';ctx.fillText('TAXI',256,150);
 ctx.fillRect(0,228,512,28);
 for(const [x,h] of [[8,56],[38,84],[64,43],[98,31],[365,28],[395,64],[425,100],[463,82],[489,35]])ctx.fillRect(x,228-h,22,h);
 const print=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(canvas),roughness:0.45});
 for(const [side,sign] of [['left',-1],['right',1]]){
  const g=piece(`taxi-sign-${side}`);box(g,0.24,1.56,3.16,0xf5d21c);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(3.16,1.56),print);face.position.x=sign*0.121;face.rotation.y=sign*Math.PI/2;g.add(face);
 }

 for(const side of ['left','right']){
  const g=piece(`side-rail-${side}`);box(g,0.76,0.24,6.36,0xf1c600);
  for(let i=0;i<8;i++)stud(g,0xf1c600,0,0.195,(i-3.5)*0.8);
 }

 const trim=piece('front-black-bar');box(trim,3.16,0.24,0.76,0x252a2b);
 for(const x of [-1.2,1.2])stud(trim,0x252a2b,x,0.195,0);
 for(const [side,sign] of [['left',-1],['right',1]]){
  const g=piece(`front-quarter-${side}`),p=new THREE.Shape();p.moveTo(-0.38,-0.38);p.lineTo(0.38,-0.38);p.absarc(-0.38,-0.38,0.76,0,Math.PI/2,false);p.closePath();
  const geo=new THREE.ExtrudeGeometry(p,{depth:0.24,bevelEnabled:false,curveSegments:24});geo.rotateX(Math.PI/2);geo.translate(0,0.12,0);if(sign<0)geo.rotateY(Math.PI);mesh(g,geo,0x252a2b);
 }

 const legs=piece('traveler-legs');box(legs,1.08,0.25,0.5,0xafc7dc,0,1.0,0);
 for(const x of [-0.28,0.28]){box(legs,0.48,0.8,0.45,0xafc7dc,x,0.5,0);box(legs,0.48,0.22,0.66,0xafc7dc,x,0.21,0.10);}
 const torso=piece('traveler-torso');box(torso,1.0,1.0,0.52,0xf2f1e8);
 mesh(torso,new THREE.CylinderGeometry(0.17,0.17,0.22,20),0xf2f1e8,0,0.61,0);
 for(const sign of [-1,1]){
  const arm=mesh(torso,new THREE.CylinderGeometry(0.18,0.2,0.85,20),0xf5d21c,sign*0.67,-0.04,0);arm.rotation.z=sign*0.42;
  mesh(torso,new THREE.TorusGeometry(0.19,0.075,10,24,Math.PI*1.6),0xf5d21c,sign*0.85,-0.43,0.08);
  for(const y of [-0.25,0.2]){const leaf=box(torso,0.35,0.075,0.018,0x78a845,sign*0.23,y,0.27);leaf.rotation.z=sign*0.5;}
 }
 const head=piece('traveler-head');mesh(head,new THREE.CylinderGeometry(0.42,0.42,0.8,32),0xf5d21c);stud(head,0xf5d21c,0,0.475,0);
 for(const x of [-0.14,0.14])mesh(head,new THREE.SphereGeometry(0.045,12,8),0x292929,x,0.07,0.398);
 box(head,0.18,0.035,0.025,0xad4261,0,-0.16,0.405);
 const hair=piece('traveler-hair');const cap=mesh(hair,new THREE.SphereGeometry(0.48,24,16),0x515355);cap.scale.y=0.65;
 for(let row=0;row<3;row++)for(let j=0;j<10;j++){
  const a=j*Math.PI/5+row*0.3,r=0.40-row*0.09;
  mesh(hair,new THREE.SphereGeometry(0.14,10,8),0x66696b,Math.cos(a)*r,row*0.14-0.10,Math.sin(a)*r);
 }
 for(const [id,color,w] of [['traveler-case',0x333638,0.9],['traveler-bag',0x855333,0.76]]){
  const g=piece(id);box(g,w,0.9,0.36,color);
  const handle=mesh(g,new THREE.TorusGeometry(0.16,0.045,8,24),color,0,0.58,0);
  for(const x of [-w*0.32,w*0.32])box(g,0.04,0.85,0.018,0x222222,x,0,0.19);
 }

 for(const [side,sign] of [['left',-1],['right',1]]){
  const g=piece(`front-l-${side}`);box(g,1.56,0.24,0.76,0xf1c600,0,0,0.4);box(g,0.76,0.24,0.8,0xf1c600,-sign*0.4,0,-0.38);
  for(const x of [-0.4,0.4])stud(g,0xf1c600,x,0.195,0.4);stud(g,0xf1c600,-sign*0.4,0.195,-0.4);
 }

}
