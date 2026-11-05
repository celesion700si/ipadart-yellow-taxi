// Ordered segment states and animation stages; PDF pages never drive navigation.
export function createAssemblyPlayer(segments, model, onChange) {
  let currentSegmentIndex=0, stateIndex=0, animation=null;
  const current=()=>segments[currentSegmentIndex];
  const snapshot=()=>({currentSegmentIndex, currentState:current().states[stateIndex], stateIndex,
    animating:!!animation, targetState:animation?.stage.to,
    progress:Math.round((currentSegmentIndex+(current().states[stateIndex]===current().completionState?1:0))/segments.length*100)});
  function applySegmentState() {
    segments.forEach((segment,index)=>{
      const state=index<currentSegmentIndex?segment.completionState:index===currentSegmentIndex?segment.states[stateIndex]:segment.initialState;
      model.setSegmentState(segment.id,index<=currentSegmentIndex,state);
    });
    model.showGuides(current().id,current().states[stateIndex]);
  }
  function notify(reason){onChange(snapshot(),reason);}
  function resetSegment(index=currentSegmentIndex, nextStateIndex=0){
    animation=null;currentSegmentIndex=index;stateIndex=nextStateIndex;applySegmentState();notify('state');
  }
  function playStage(stage,now=performance.now()){
    if(animation||!stage)return;
    stateIndex=current().states.indexOf(stage.from);applySegmentState();
    animation={stage,start:now};notify('play');
  }
  function playSegment(now=performance.now()){
    const stage=current().animationStages.find(s=>s.from===current().states[stateIndex]);
    playStage(stage,now);
  }
  function tick(now){
    if(!animation)return;
    const {stage,start}=animation;
    const t=Math.max(0,Math.min((now-start)/stage.duration,1));
    model.animateSegment(current().id,stage,t);
    if(t===1){stateIndex=current().states.indexOf(stage.to);animation=null;applySegmentState();notify('settled');}
  }
  function goPrevious(){
    if(animation)return;
    if(stateIndex>0)resetSegment(currentSegmentIndex,stateIndex-1);
    else if(currentSegmentIndex>0)resetSegment(currentSegmentIndex-1);
  }
  function goNext(){
    if(animation)return;
    if(current().states[stateIndex]!==current().completionState)playSegment();
    else if(currentSegmentIndex<segments.length-1)resetSegment(currentSegmentIndex+1);
    else notify('end');
  }
  function replayCurrentSegment(now=performance.now()){
    // At a settled state, replay the action which produced it. At the initial state, play the first action.
    const to=current().states[Math.max(stateIndex,1)];
    playStage(current().animationStages.find(s=>s.to===to),now);
  }
  return {snapshot,applySegmentState,playSegment,resetSegment,goPrevious,goNext,replayCurrentSegment,restart:()=>resetSegment(0),tick};
}
