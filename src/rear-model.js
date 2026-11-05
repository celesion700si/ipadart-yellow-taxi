// Six source pieces only. All belong to one permanent group, including while exploded.
export function createRearSubassembly(THREE,assemblyModel,registry){
  const rearSubassemblyGroup=new THREE.Group();rearSubassemblyGroup.name='rear-subassembly-group';assemblyModel.add(rearSubassemblyGroup);
  const black=new THREE.MeshStandardMaterial({color:0x252a2b,roughness:0.36});
  const white=new THREE.MeshStandardMaterial({color:0xf4f1e8,roughness:0.48});
  const yellow=new THREE.MeshStandardMaterial({color:0xf1c600,roughness:0.38});
  function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  function stud(parent,material,x,y,z){mesh(new THREE.CylinderGeometry(0.24,0.24,0.15,28),material,parent,x,y,z);}
  function piece(id){
    const object=new THREE.Group();object.name=id;rearSubassemblyGroup.add(object);
    registry.set(id,{object});return object;
  }
  // Local X is across the car. +Z is the direction the black ramps face (towards the cabin).
  const bar=piece('rear-bar');
  mesh(new THREE.BoxGeometry(4.76,0.24,0.76),black,bar);
  for(let i=0;i<6;i++)stud(bar,black,(i-2.5)*0.8,0.195,0);
  const small=piece('rear-white');
  mesh(new THREE.BoxGeometry(1.56,0.24,0.76),white,small);
  for(const x of [-0.4,0.4])stud(small,white,x,0.195,0);
  for(const [side,name] of [[-1,'left'],[1,'right']]){
    const ramp=piece(`rear-ramp-${name}`);
    // Extruded curved side profile, 1 x 3 studs; rear raised stud and smooth inward ramp.
    const profile=new THREE.Shape();
    profile.moveTo(-0.38,0);profile.lineTo(1.98,0);profile.lineTo(1.98,0.2);
    profile.bezierCurveTo(1.15,0.28,0.55,0.65,0.38,0.96);
    profile.lineTo(-0.38,0.96);profile.closePath();
    const geometry=new THREE.ExtrudeGeometry(profile,{depth:0.76,bevelEnabled:false,curveSegments:24});
    // Profile horizontal axis maps to +Z, extrusion maps to -X.
    geometry.rotateY(-Math.PI/2);geometry.translate(0.38,0,0);
    mesh(geometry,black,ramp);stud(ramp,black,0,1.035,0);
    const curved=piece(`rear-yellow-${name}`);
    // Simplified curved wall with an open concave inner face, like the reference.
    const footprint=new THREE.Shape();
    footprint.moveTo(-0.78,-0.38);footprint.lineTo(0.78,-0.38);footprint.lineTo(0.78,0.12);
    footprint.quadraticCurveTo(0.78,0.38,0.45,0.38);footprint.lineTo(0.31,0.38);
    footprint.lineTo(0.31,0.12);footprint.quadraticCurveTo(0,-0.12,-0.31,0.12);
    footprint.lineTo(-0.31,0.38);footprint.lineTo(-0.45,0.38);
    footprint.quadraticCurveTo(-0.78,0.38,-0.78,0.12);footprint.closePath();
    const wall=new THREE.ExtrudeGeometry(footprint,{depth:0.96,bevelEnabled:false,curveSegments:20});
    wall.rotateX(Math.PI/2);wall.translate(0,0.96,0);mesh(wall,yellow,curved);
    for(const x of [-0.4,0.4]){
      stud(curved,yellow,x,1.035,0);
      // Recessed centers are surfaces of the same piece, not additional assembly parts.
      mesh(new THREE.CylinderGeometry(0.15,0.15,0.012,24),black,curved,x,1.112,0);
    }
  }
  registry.set(rearSubassemblyGroup.name,{object:rearSubassemblyGroup});
  return rearSubassemblyGroup;
}
