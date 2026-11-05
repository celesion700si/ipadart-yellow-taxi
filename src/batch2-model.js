// Geometry for the second bounded batch; all motion remains in segment data.
export function createBatch2Parts(THREE,assemblyModel,registry){
  const materials=new Map();
  const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.45}));return materials.get(color);};
  function piece(id){const g=new THREE.Group();g.name=id;assemblyModel.add(g);registry.set(id,{object:g});return g;}
  function mesh(g,geometry,color,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
  const seat=piece('center-curved-seat'),profile=new THREE.Shape();
  profile.moveTo(-0.78,0);profile.lineTo(0.78,0);profile.lineTo(0.78,0.12);
  profile.bezierCurveTo(0.78,0.48,0.15,0.96,-0.4,0.96);profile.lineTo(-0.78,0.96);profile.closePath();
  const geometry=new THREE.ExtrudeGeometry(profile,{depth:1.56,bevelEnabled:false,curveSegments:24});geometry.rotateY(-Math.PI/2);geometry.translate(0.78,0,0);
  mesh(seat,geometry,0xad7549);
  for(const x of [-0.4,0.4]){
    mesh(seat,new THREE.CylinderGeometry(0.24,0.24,0.15,24),0xad7549,x,1.035,-0.4);
    mesh(seat,new THREE.CylinderGeometry(0.14,0.14,0.012,24),0x333639,x,1.116,-0.4);
  }
  function stud(g,color,x,z){mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),color,x,0.195,z);}
  function plate(id,nx,nz,color){const g=piece(id);mesh(g,new THREE.BoxGeometry(nx*0.8-0.04,0.24,nz*0.8-0.04),color);
    for(let x=0;x<nx;x++)for(let z=0;z<nz;z++)stud(g,color,(x-(nx-1)/2)*0.8,(z-(nz-1)/2)*0.8);return g;}
  function footprint(g,p,color){const shape=new THREE.ExtrudeGeometry(p,{depth:0.24,bevelEnabled:false,curveSegments:24});shape.rotateX(Math.PI/2);shape.translate(0,0.12,0);mesh(g,shape,color);}
  const bumperGroup=piece('front-bumper-group');
  function bumperPiece(id){const g=piece(id);bumperGroup.add(g);return g;}
  for(const id of ['bumper-bottom','bumper-top']){
    const g=bumperPiece(id),p=new THREE.Shape();p.moveTo(-2.38,-0.78);p.lineTo(2.38,-0.78);
    p.quadraticCurveTo(2.38,0.78,1.58,0.78);p.lineTo(-1.58,0.78);p.quadraticCurveTo(-2.38,0.78,-2.38,-0.78);p.closePath();
    footprint(g,p,0x252a2b);for(const x of [-2,-1.2,-0.4,0.4,1.2,2])stud(g,0x252a2b,x,-0.4);
    for(const x of [-1.2,-0.4,0.4,1.2])stud(g,0x252a2b,x,0.4);
  }
  for(const [side,id] of [[-1,'bumper-wedge-left'],[1,'bumper-wedge-right']]){
    const g=bumperPiece(id),p=new THREE.Shape();p.moveTo(side*-0.78,-0.78);p.lineTo(side*0.78,-0.78);p.lineTo(side*0.78,0);p.lineTo(side*0.22,0.78);p.lineTo(side*-0.78,0.78);p.closePath();
    footprint(g,p,0xf1c600);for(const [x,z] of [[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4]])stud(g,0xf1c600,x*side,z);
  }
  bumperGroup.add(plate('bumper-spine',2,6,0xf1c600));
  plate('front-white-spacer',2,1,0xf4f1e8);
  material(0xe5a14a).transparent=true;material(0xe5a14a).opacity=0.82;
  plate('amber-light-left',2,1,0xe5a14a);plate('amber-light-right',2,1,0xe5a14a);
  material(0xe8f3f7).transparent=true;material(0xe8f3f7).opacity=0.78;
  for(const [side,id] of [[-1,'clear-light-left'],[1,'clear-light-right']]){
    const g=piece(id),p=new THREE.Shape();p.moveTo(side*-0.78,-0.38);p.lineTo(side*0.78,-0.38);p.lineTo(side*0.22,0.38);p.lineTo(side*-0.78,0.38);p.closePath();footprint(g,p,0xe8f3f7);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g.children[0].geometry),new THREE.LineBasicMaterial({color:0xa1b0b8}));g.add(edges);
  }
  const trim=piece('front-trim');mesh(trim,new THREE.BoxGeometry(1.56,0.24,0.76),0x252a2b);
  for(const x of [-0.4,0.4]){const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.35,0.005,0.36)),new THREE.LineBasicMaterial({color:0xc3c7c8}));outline.position.set(x,0.126,0);trim.add(outline);}
  // The source already supplies the steering wheel and stand as one unit.
  const steering=piece('steering-wheel-unit');mesh(steering,new THREE.BoxGeometry(1.56,0.24,0.76),0x9b9ea1);
  mesh(steering,new THREE.BoxGeometry(0.32,0.96,0.25),0x9b9ea1,0,0.60,0.08);
  const wheel=new THREE.Group();wheel.position.set(0,1.18,-0.12);wheel.rotation.x=Math.PI/6;steering.add(wheel);
  mesh(wheel,new THREE.TorusGeometry(0.45,0.065,12,40),0x252a2b);
  const hub=mesh(wheel,new THREE.CylinderGeometry(0.13,0.13,0.16,24),0x9b9ea1);hub.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;const spoke=mesh(wheel,new THREE.BoxGeometry(0.34,0.065,0.07),0x9b9ea1,Math.cos(angle)*0.24,Math.sin(angle)*0.24,0);spoke.rotation.z=angle;}
}
