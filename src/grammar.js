import {applyPose,interpolatePose,easingFunctions} from './pose.js';
const fail=(segment,message)=>{throw new Error(`Assembly ${segment.id}: ${message}`);};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const samePose=(a,b)=>equal(a.position,b.position)&&equal(a.rotation||[0,0,0],b.rotation||[0,0,0]);
const idsFor=s=>[...s.parts,...(s.groupId?[s.groupId]:[])];
const vector=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
// Grammar contracts are checked once, before any scene is played. No segment IDs here.
export const grammarDefinitions={
  insert(s){
    if(s.states.length!==2||s.animationStages.length!==1||s.animationStages[0].kind!=='insert')fail(s,'INSERT needs one insert stage');
    const axis=['x','y','z'].indexOf(s.insertionAxis);if(axis<0)fail(s,'invalid insertionAxis');
    for(const id of s.parts){const a=s.transforms[id][s.initialState],b=s.transforms[id][s.completionState];
      if(a.position.some((v,i)=>i!==axis&&v!==b.position[i]))fail(s,'INSERT must move only along insertionAxis');
      if(!equal(a.rotation||[0,0,0],b.rotation||[0,0,0]))fail(s,'INSERT orientation must remain fixed');
    }
  },
  place(s){
    if(s.states.length!==2||s.animationStages.length!==1||s.animationStages[0].kind!=='place')fail(s,'PLACE needs one place stage');
    if(s.placementDirection){
      if(!vector(s.placementDirection)||Math.hypot(...s.placementDirection)===0)fail(s,'invalid placementDirection');
      for(const id of s.parts){const a=s.transforms[id][s.initialState].position,b=s.transforms[id][s.completionState].position;
        const d=b.map((v,i)=>v-a[i]),n=Math.hypot(...d),m=Math.hypot(...s.placementDirection);
        if(n&&d.some((v,i)=>Math.abs(v/n-s.placementDirection[i]/m)>1e-8))fail(s,'PLACE direction disagrees with endpoints');
      }
    }
  },
  'build-and-attach'(s){
    if(!s.groupId||s.states.length!==3||s.animationStages.length!==2)fail(s,'BUILD_AND_ATTACH needs a group and three states');
    const [build,attach]=s.animationStages;
    if(build.kind!=='build'||attach.kind!=='attach'||build.tracks.includes(s.groupId)||!equal(attach.tracks,[s.groupId]))fail(s,'build children first; attach only their parent');
    if(!samePose(s.transforms[s.groupId][build.from],s.transforms[s.groupId][build.to]))fail(s,'group must stay fixed during build');
    for(const id of s.parts)if(!samePose(s.transforms[id][attach.from],s.transforms[id][attach.to]))fail(s,'attachment must preserve child-local poses');
  }
};
export function validateSegment(s){
  if(!grammarDefinitions[s.actionType])fail(s,'unsupported actionType');
  if(!s.states?.length||new Set(s.states).size!==s.states.length||s.initialState!==s.states[0]||s.completionState!==s.states.at(-1))fail(s,'invalid ordered states');
  const ids=idsFor(s);if(new Set(ids).size!==ids.length)fail(s,'duplicate part/group ID');
  for(const id of ids)for(const state of s.states){const p=s.transforms?.[id]?.[state];if(!p||!vector(p.position)||(p.rotation&&!vector(p.rotation)))fail(s,`missing/invalid pose ${id}/${state}`);}
  if(s.animationStages.length!==s.states.length-1)fail(s,'one stage required for every state transition');
  s.animationStages.forEach((stage,i)=>{
    if(stage.from!==s.states[i]||stage.to!==s.states[i+1]||!Number.isFinite(stage.duration)||stage.duration<=0||!easingFunctions[stage.easing])fail(s,'invalid animation stage');
    if(!stage.tracks.length||new Set(stage.tracks).size!==stage.tracks.length||stage.tracks.some(id=>!ids.includes(id)))fail(s,'invalid tracks');
    for(const [id,w] of Object.entries(stage.windows||{}))if(!stage.tracks.includes(id)||!Array.isArray(w)||w.length!==2||!w.every(Number.isFinite)||w[0]<0||w[1]>1||w[0]>=w[1])fail(s,'invalid track window');
    for(const id of ids)if(!stage.tracks.includes(id)&&!samePose(s.transforms[id][stage.from],s.transforms[id][stage.to]))fail(s,`unanimated transform change: ${id}`);
  });
  grammarDefinitions[s.actionType](s);return s;
}
export function createAssemblyEngine(segments,registry,guideRegistry=new Map()){
  const data=new Map(),owners=new Set();
  for(const s of segments){
    validateSegment(s);if(data.has(s.id))fail(s,'duplicate segment ID');data.set(s.id,s);
    for(const id of idsFor(s)){
      if(owners.has(id))fail(s,'object is owned by another segment');owners.add(id);
      const track=registry.get(id);if(!track?.object)fail(s,`unregistered object ${id}`);track.poses=s.transforms[id];
    }
    if(s.groupId)for(const id of s.parts){if(registry.get(id).object.parent!==registry.get(s.groupId).object)fail(s,'components must be children of groupId');}
    for(const g of s.guides||[])if(!guideRegistry.has(g.id)||g.states.some(state=>!s.states.includes(state)))fail(s,'invalid guide binding');
  }
  return {
    setSegmentState(id,visible,state){
      const s=data.get(id);for(const partId of idsFor(s)){const track=registry.get(partId);track.object.visible=visible;applyPose(track,state);}
    },
    animateSegment(id,stage,t){
      const s=data.get(id);if(!s.animationStages.includes(stage))fail(s,'stage does not belong to segment');
      for(const trackId of stage.tracks)interpolatePose(registry.get(trackId),stage.from,stage.to,t,stage.windows?.[trackId],stage.easing);
    },
    showGuides(id,state){
      for(const object of guideRegistry.values())object.visible=false;
      for(const g of data.get(id).guides||[])guideRegistry.get(g.id).visible=g.states.includes(state);
    }
  };
}
