import { speakNarration, stopNarration, startMusic, setMusicVolume, setMusicMuted, completionSound, pauseAudio } from './audio.js';
import { assemblySegments } from './segments.js';
import { createScene } from './scene.js';
import { createAssemblyModel } from './model.js';
import { createAssemblyPlayer } from './player.js';
import { confetti } from './effects.js';
const $ = id => document.getElementById(id);
try {
  const [THREE, {OrbitControls}] = await Promise.all([import('three'),import('three/addons/controls/OrbitControls.js')]);
  initialize(THREE,OrbitControls);
} catch(error) {
  console.error(error);
  $('loadStatus').textContent='3D 載入失敗：請確認 CDN 網路連線及瀏覽器 WebGL 支援。';
  $('start').textContent='無法載入 3D';
}
function initialize(THREE,OrbitControls) {
  const {scene,renderer,camera,controls,resetView,recommendFrame,updateFraming}=createScene(THREE,OrbitControls,$('viewport'));
  const model=createAssemblyModel(THREE,scene);
  let started=false,completed=false,lastSegmentIndex=0;
  const player=createAssemblyPlayer(assemblySegments,model,(state,reason)=>{
    completed=false;$('done').hidden=true;
    updateUI(state);
    if(state.currentSegmentIndex!==lastSegmentIndex){
      lastSegmentIndex=state.currentSegmentIndex;
      recommendFrame(assemblySegments[lastSegmentIndex].cameraFraming);
    }
    if(reason==='end') {
      $('subtitle').textContent='此 prototype 目前到這一步。';
      speakNarration('此 prototype 目前到這一步。');
    } else if(reason==='state'||reason==='play') {
      const segment=assemblySegments[state.currentSegmentIndex];
      const phase=reason==='play'?state.targetState:state.currentState;
      if(!speakNarration(segment.narration[phase]))$('audioStatus').textContent='此瀏覽器不支援旁白';
    }
  });
  function updateUI(state=player.snapshot()) {
    const {currentSegmentIndex:index,currentState,animating,progress}=state;
    const segment=assemblySegments[index];
    const textPhase=animating?state.targetState:currentState;
    const stage=animating?segment.animationStages.find(s=>s.to===state.targetState):null;
    const reference=stage?.thumbnail||segment.thumbnail[currentState];
    $('stepLabel').textContent=`組裝 ${index+1} / ${assemblySegments.length}`;
    $('stepNumber').textContent=segment.stateLabels[currentState];
    if(animating)$('stepNumber').textContent='正在組裝';
    $('title').textContent=segment.headings[textPhase];
    $('subtitle').textContent=segment.subtitle[textPhase];
    $('partsLabel').textContent=segment.partsLabel;
    $('edition').textContent=segment.edition;
    $('percent').textContent=`${progress}%`;$('progress').setAttribute('aria-valuenow',progress);$('progress').firstElementChild.style.width=`${progress}%`;
    $('previous').disabled=!started||animating||(index===0&&state.stateIndex===0);
    $('replay').disabled=!started||animating;
    $('next').hidden=false;$('next').disabled=!started||animating;
    $('finish').hidden=!started||index!==assemblySegments.length-1||currentState!==segment.completionState||animating||completed;
    $('restart').disabled=!started;$('resetView').disabled=!started;
    $('pageNumber').textContent=reference.page;$('reference').hidden=!started;
    // Lightweight state labels aid inspection without driving navigation by page number.
    $('viewport').dataset.segment=segment.id;$('viewport').dataset.state=animating?'animating':currentState;
  }
  player.applySegmentState();
  $('start').disabled=false;$('start').textContent='開始組裝 →';$('loadStatus').textContent='拖曳觀察 · 跟著步驟完成';
  $('start').onclick=()=>{started=true;$('welcome').hidden=true;startMusic().then(ok=>{if(!ok)$('audioStatus').textContent='音樂未啟用';}).catch(()=>{$('audioStatus').textContent='音樂未啟用';});player.restart();};
  $('next').onclick=()=>player.goNext();$('previous').onclick=()=>player.goPrevious();
  $('replay').onclick=()=>player.replayCurrentSegment();
  $('restart').onclick=$('doneRestart').onclick=()=>{stopNarration();player.restart();resetView();};
  $('resetView').onclick=resetView;
  $('finish').onclick=()=>{if(completed)return;completed=true;updateUI();$('done').hidden=false;completionSound();confetti();};
  let muted=false;
  $('mute').onclick=()=>{muted=!muted;setMusicMuted(muted);$('mute').textContent=muted?'音樂：靜音':'音樂：開';$('mute').setAttribute('aria-pressed',muted);if(started&&!muted)startMusic().catch(()=>{});};
  $('volume').oninput=event=>setMusicVolume(Number(event.target.value)/100);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAudio();else if(started)startMusic().catch(()=>{});});
  renderer.setAnimationLoop(now=>{player.tick(now);updateFraming(now);controls.update();renderer.render(scene,camera);});
}
