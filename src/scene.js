export function createScene(THREE, OrbitControls, viewport) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#eff2e9');
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewport.prepend(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(36,1,0.1,100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 10; controls.maxDistance = 27;
  controls.minPolarAngle = 0.2; controls.maxPolarAngle = Math.PI/2 - 0.035;
  controls.touches.ONE = THREE.TOUCH.ROTATE; controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  const defaultFrame={position:[12,12,16],target:[0,0.45,0]};
  let frame=defaultFrame,framing=null;
  function resetView(){framing=null;camera.position.set(...frame.position);controls.target.set(...frame.target);controls.update();}
  function recommendFrame(recommended){
    const next=recommended||defaultFrame;
    if(next===frame)return;
    frame=next;framing={start:performance.now(),position:camera.position.clone(),target:controls.target.clone()};
  }
  function updateFraming(now){
    if(!framing)return;
    const t=Math.min((now-framing.start)/650,1),eased=t*t*(3-2*t);
    camera.position.lerpVectors(framing.position,new THREE.Vector3(...frame.position),eased);
    controls.target.lerpVectors(framing.target,new THREE.Vector3(...frame.target),eased);
    if(t===1)framing=null;
  }
  controls.addEventListener('start',()=>{framing=null;});
  resetView();
  scene.add(new THREE.HemisphereLight(0xffffff,0x788577,2.5));
  const key = new THREE.DirectionalLight(0xffffff,3.2); key.position.set(4,12,6); key.castShadow = true;
  key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10}); key.shadow.normalBias = 0.035; scene.add(key);
  const fill = new THREE.DirectionalLight(0xe3edff,1.2); fill.position.set(-8,4,-6); scene.add(fill);
  new ResizeObserver(()=>{const {width,height}=viewport.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}).observe(viewport);
  return {scene,renderer,camera,controls,resetView,recommendFrame,updateFraming};
}
