// One simplified gray upright panel, with rear recess and two hollow-looking studs.
// Meshes below describe one physical piece; motion lives entirely in segment data.
export function createRearPanel(THREE,assemblyModel,registry){
  const object=new THREE.Group();object.name='rear-gray-panel';assemblyModel.add(object);
  const gray=new THREE.MeshStandardMaterial({color:0xa7aaad,roughness:0.45});
  const recess=new THREE.MeshStandardMaterial({color:0x333639,roughness:0.6});
  function mesh(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;object.add(m);}
  // Front face points toward +Z (the cabin); the open back faces the existing ramps.
  mesh(new THREE.BoxGeometry(1.56,1.68,0.18),gray,0,0,0.29);
  for(const y of [-0.96,0.96])mesh(new THREE.BoxGeometry(1.56,0.24,0.76),gray,0,y,0);
  for(const x of [-0.4,0.4]){
    mesh(new THREE.CylinderGeometry(0.24,0.24,0.15,28),gray,x,1.155,0);
    mesh(new THREE.CylinderGeometry(0.15,0.15,0.012,24),recess,x,1.232,0);
  }
  registry.set(object.name,{object});
}
