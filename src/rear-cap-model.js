// Geometry only: one 1x4 plate and two mirrored quarter-round 1x1 tiles.
// All assembly poses and ordering are supplied by segment data.
export function createRearCapParts(THREE,assemblyModel,registry){
  const yellow=new THREE.MeshStandardMaterial({color:0xf1c600,roughness:0.38});
  function mesh(geometry,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,yellow);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);}
  function part(id){const object=new THREE.Group();object.name=id;assemblyModel.add(object);registry.set(id,{object});return object;}
  const bar=part('rear-cap-bar');mesh(new THREE.BoxGeometry(3.16,0.24,0.76),bar);
  for(const x of [-1.2,-0.4,0.4,1.2])mesh(new THREE.CylinderGeometry(0.24,0.24,0.15,28),bar,x,0.195,0);
  for(const [side,name] of [[-1,'left'],[1,'right']]){
    const cap=part(`rear-cap-${name}`),shape=new THREE.Shape();
    shape.moveTo(side*-0.38,-0.38);shape.lineTo(side*0.38,-0.38);
    shape.absarc(side*-0.38,-0.38,0.76,side<0?Math.PI:0,Math.PI/2,side<0);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:0.24,bevelEnabled:false,curveSegments:24});
    geometry.rotateX(Math.PI/2);geometry.translate(0,0.12,0);
    mesh(geometry,cap);
  }
}
