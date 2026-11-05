import {createBatchParts} from './batch-model.js';
import {createBatch2Parts} from './batch2-model.js';
import {createBatch3Parts} from './batch3-model.js';
import { plateDefinitions, assemblySegments } from './segments.js';
import { createRearSubassembly } from './rear-model.js';
import { createRearCapParts } from './rear-cap-model.js';
import { createRearPanel } from './rear-panel-model.js';
import { createAssemblyEngine } from './grammar.js';
export function createAssemblyModel(THREE, scene) {
  const assemblyModel = new THREE.Group(); assemblyModel.name='taxi-assembly'; scene.add(assemblyModel);
  const dark = new THREE.MeshStandardMaterial({color:0x252a2b,roughness:0.36});
  const tan = new THREE.MeshStandardMaterial({color:0xd7bc7d,roughness:0.42});
  const rimMaterial = new THREE.MeshStandardMaterial({color:0x6e927c,roughness:0.6});
  function mesh(geometry,material,x,y,z,parent=assemblyModel) { const item = new THREE.Mesh(geometry,material); item.position.set(x,y,z); item.castShadow=true; item.receiveShadow=true; parent.add(item); return item; }
  function box(w,h,d,x,y,z,material=dark,parent=assemblyModel) { return mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent); }
  const floor = mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xeff2e9,roughness:1}),0,-0.06,0,scene); floor.rotation.x=-Math.PI/2; floor.castShadow=false;
  // Longitudinal axis Z, insertion axis X. Lower central plate and raised side rails.
  box(3.4,0.34,9.6,0,0.17,0);
  const holeZ = [-3.2,3.2], holeY = 0.87, railOuter = 1.7;
  for (const side of [-1,1]) {
    // Extrude a real rail with two through-holes, rather than painting circles on a box.
    const shape = new THREE.Shape();
    shape.moveTo(-4.8,0.34);shape.lineTo(4.8,0.34);shape.lineTo(4.8,1.4);shape.lineTo(2.25,1.4);shape.lineTo(2.25,0.93);shape.lineTo(-2.25,0.93);shape.lineTo(-2.25,1.4);shape.lineTo(-4.8,1.4);shape.closePath();
    for (const z of holeZ) { const hole = new THREE.Path();hole.absarc(z,holeY,0.245,0,Math.PI*2,true);shape.holes.push(hole); }
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:0.6,bevelEnabled:false,curveSegments:28});
    // Local X maps to -Z; symmetric hole positions preserve alignment.
    const rail = mesh(geometry,dark,side===1?1.1:-1.7,0,0); rail.rotation.y=Math.PI/2;
    for(let z=-4.4;z<4.5;z+=0.8) {
      const top = Math.abs(z)>2.25?1.4:0.93;
      mesh(new THREE.CylinderGeometry(0.245,0.245,0.15,28),dark,side*1.4,top+0.075,z);
    }
    for (const z of holeZ) {
      const ring = mesh(new THREE.TorusGeometry(0.255,0.028,10,40),rimMaterial,side*(railOuter+0.008),holeY,z); ring.rotation.y=Math.PI/2;
    }
  }
  for(let z=-4.4;z<4.5;z+=0.8) for(const x of [-0.4,0.4]) mesh(new THREE.CylinderGeometry(0.24,0.24,0.13,24),dark,x,0.405,z);
  const connectors=[], guides=new THREE.Group(); assemblyModel.add(guides);
  for(const side of [-1,1]) for(const z of holeZ) {
    const part = new THREE.Group();assemblyModel.add(part);
    const shaft = mesh(new THREE.CylinderGeometry(0.18,0.18,1.1,24),tan,0,0,0,part);shaft.rotation.z=Math.PI/2;
    const collar = mesh(new THREE.CylinderGeometry(0.25,0.25,0.1,28),tan,side*0.13,0,0,part);collar.rotation.z=Math.PI/2;
    // Raised longitudinal ribs give the exposed end an axle-like silhouette.
    for(let angle=0;angle<Math.PI*2;angle+=Math.PI/2) box(0.42,0.06,0.06,side*0.34,Math.cos(angle)*0.17,Math.sin(angle)*0.17,tan,part);
    const endRing = mesh(new THREE.TorusGeometry(0.13,0.025,8,24),tan,side*0.555,0,0,part);endRing.rotation.y=Math.PI/2;
    connectors.push({part});
    const points=[new THREE.Vector3(side*1.76,holeY,z),new THREE.Vector3(side*2.93,holeY,z)];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:0x96a991,dashSize:0.11,gapSize:0.09}));line.computeLineDistances();guides.add(line);
    const arrow=new THREE.ArrowHelper(new THREE.Vector3(-side,0,0),new THREE.Vector3(side*2.6,holeY,z),0.55,0x6d9079,0.18,0.13);guides.add(arrow);
  }

  const registry = new Map();
  connectors.forEach((c,i)=>{c.part.name=`connector-${i}`;registry.set(c.part.name,{object:c.part});});
  const plateGuides=new THREE.Group();assemblyModel.add(plateGuides);
  for(const definition of plateDefinitions) {
    const part=new THREE.Group();part.name=definition.id;assemblyModel.add(part);
    const material=new THREE.MeshStandardMaterial({color:definition.color,roughness:0.48});
    // 2 x 3 brown plates, 2 x 2 white plate. Stud pitch matches the existing chassis.
    box(1.56,0.24,definition.columns*0.8-0.04,0,0,0,material,part);
    for(const x of [-0.4,0.4]) for(let i=0;i<definition.columns;i++) {
      mesh(new THREE.CylinderGeometry(0.24,0.24,0.15,24),material,x,0.195,(i-(definition.columns-1)/2)*0.8,part);
    }
    registry.set(definition.id,{object:part});
    const points=[new THREE.Vector3(0,0.6,definition.z),new THREE.Vector3(0,2.8,definition.z)];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:0x789678,dashSize:0.12,gapSize:0.1}));line.computeLineDistances();plateGuides.add(line);
    plateGuides.add(new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(0,1.5,definition.z),0.7,0x789678,0.18,0.13));
  }
  const rearSubassemblyGroup=createRearSubassembly(THREE,assemblyModel,registry);
  createRearCapParts(THREE,assemblyModel,registry);
  createRearPanel(THREE,assemblyModel,registry);
  createBatchParts(THREE,assemblyModel,registry);
  createBatch2Parts(THREE,assemblyModel,registry);
  createBatch3Parts(THREE,assemblyModel,registry);
  const guideRegistry=new Map([['connector-guides',guides],['plate-guides',plateGuides]]);
  const engine=createAssemblyEngine(assemblySegments,registry,guideRegistry);
  return {assemblyModel,registry,rearSubassemblyGroup,...engine};
}
