// Geometry only: each registry entry is one source piece, with no animation logic.
export function createBatchParts(THREE,assemblyModel,registry){
  const materials=new Map();
  const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.45}));return materials.get(color);};
  function piece(id){const g=new THREE.Group();g.name=id;assemblyModel.add(g);registry.set(id,{object:g});return g;}
  function mesh(g,geometry,color,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
  // Curved upper surface, raised toward -Z. Origin lies at bottom center.
  function curved(id,width,depth,height,color){
    const g=piece(id),p=new THREE.Shape();p.moveTo(-depth/2,0);p.lineTo(depth/2,0);p.lineTo(depth/2,0.12);
    p.bezierCurveTo(depth/2,0.45*height,0,0.95*height,-depth/2,height);p.closePath();
    const geometry=new THREE.ExtrudeGeometry(p,{depth:width,bevelEnabled:false,curveSegments:24});
    geometry.rotateY(-Math.PI/2);geometry.translate(width/2,0,0);mesh(g,geometry,color);return g;
  }
  curved('rear-seat-cushion',1.56,0.76,0.96,0xad7549);
  function arch(id){
    const g=piece(id),p=new THREE.Shape();
    p.moveTo(-1.58,0);p.lineTo(-1.58,2.74);p.lineTo(1.58,2.74);p.lineTo(1.58,0);p.lineTo(1.30,0);
    p.absellipse(0,0,1.30,2.28,0,Math.PI,false,0);p.lineTo(-1.58,0);
    const geometry=new THREE.ExtrudeGeometry(p,{depth:1.56,bevelEnabled:false,curveSegments:32});
    geometry.rotateY(-Math.PI/2);geometry.translate(0.78,0,0);mesh(g,geometry,0xf1c600);
    for(const x of [-0.4,0.4])for(const z of [-1.2,-0.4,0.4,1.2])mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),0xf1c600,x,2.815,z);
    return g;
  }
  arch('rear-arch-left');arch('rear-arch-right');
  function plate(id,nx,nz,color,studs=true){
    const g=piece(id);mesh(g,new THREE.BoxGeometry(nx*0.8-0.04,0.24,nz*0.8-0.04),color);
    if(studs)for(let x=0;x<nx;x++)for(let z=0;z<nz;z++)mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),color,(x-(nx-1)/2)*0.8,0.195,(z-(nz-1)/2)*0.8);
    return g;
  }
  for(const id of ['tail-light-left','tail-light-right']){
    const g=plate(id,1,2,0xc72b36);for(const m of g.children){m.material=material(0xc72b36);m.material.transparent=true;m.material.opacity=0.83;}
  }
  const trim=plate('tail-trim',2,1,0x252a2b,false);
  for(const x of [-0.4,0.4]){
    const outline=new THREE.EdgesGeometry(new THREE.BoxGeometry(0.35,0.005,0.36));
    const line=new THREE.LineSegments(outline,new THREE.LineBasicMaterial({color:0xc3c7c8}));line.position.set(x,0.126,0);trim.add(line);
  }
  for(const [side,id] of [[-1,'tail-corner-left'],[1,'tail-corner-right']]){
    const g=piece(id),p=new THREE.Shape();p.moveTo(side*-0.38,-0.78);p.lineTo(side*0.38,-0.78);p.lineTo(side*0.38,0);p.lineTo(side*-0.38,0.78);p.closePath();
    const geometry=new THREE.ExtrudeGeometry(p,{depth:0.24,bevelEnabled:false});geometry.rotateX(Math.PI/2);geometry.translate(0,0.12,0);
    mesh(g,geometry,0xc72b36);
  }
  plate('rear-support-left',1,3,0x707477);plate('rear-support-right',1,3,0x707477);
  for(const id of ['round-left-front','round-right-front','round-left-rear','round-right-rear']){
    const g=piece(id);mesh(g,new THREE.CylinderGeometry(0.30,0.30,0.24,32),0x9b9ea1);
    mesh(g,new THREE.CylinderGeometry(0.20,0.20,0.15,24),0x9b9ea1,0,0.195,0);
    const ring=mesh(g,new THREE.TorusGeometry(0.295,0.016,8,32),0x707477);ring.rotation.x=Math.PI/2;
  }
  for(const [side,label] of [[-1,'left'],[1,'right']])for(const end of ['front','rear']){
    const g=piece(`bracket-${label}-${end}`),color=0x9b9ea1;
    mesh(g,new THREE.BoxGeometry(0.96,0.24,1.56),color,side*0.08,0,0);
    mesh(g,new THREE.BoxGeometry(0.16,1.56,1.56),color,side*0.50,0,0);
    for(const z of [-0.4,0.4]){
      mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),color,0,0.195,z);
      for(const y of [-0.4,0.4]){
        const stud=mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),color,side*0.655,y,z);stud.rotation.z=Math.PI/2;
        const hole=mesh(g,new THREE.CylinderGeometry(0.13,0.13,0.012,24),0x333639,side*0.738,y,z);hole.rotation.z=Math.PI/2;
      }
    }
  }
  for(const [side,label] of [[-1,'left'],[1,'right']]){
    for(const end of ['front','rear']){
      const g=plate(`side-panel-${label}-${end}`,1,2,0x707477,false);
      // Thin upright wall sits just inside the existing outward-facing bracket wall.
      mesh(g,new THREE.BoxGeometry(0.12,0.96,1.56),0x707477,side*0.32,0.6,0);
    }
    const g=plate(`jumper-${label}`,1,2,0xad7549,false);
    mesh(g,new THREE.CylinderGeometry(0.24,0.24,0.15,24),0xad7549,0,0.195,0);
    mesh(g,new THREE.CylinderGeometry(0.14,0.14,0.012,24),0x333639,0,0.277,0);
  }
}
