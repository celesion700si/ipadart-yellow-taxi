// Shared local-space translation + shortest-path quaternion rotation, without a Three.js import.
export const smoothstep=t=>t*t*(3-2*t);
export const easingFunctions={smoothstep,linear:t=>t};
function quaternion([x=0,y=0,z=0]=[]){
  const c1=Math.cos(x/2),c2=Math.cos(y/2),c3=Math.cos(z/2),s1=Math.sin(x/2),s2=Math.sin(y/2),s3=Math.sin(z/2);
  return [s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3+s1*s2*c3,c1*c2*c3-s1*s2*s3];
}
function slerp(a,b,t){
  let dot=a.reduce((s,v,i)=>s+v*b[i],0);
  if(dot<0){b=b.map(v=>-v);dot=-dot;}
  let result;
  if(dot>0.9995)result=a.map((v,i)=>v+(b[i]-v)*t);
  else{const angle=Math.acos(Math.min(1,dot)),sin=Math.sin(angle);result=a.map((v,i)=>(v*Math.sin((1-t)*angle)+b[i]*Math.sin(t*angle))/sin);}
  const length=Math.hypot(...result);return result.map(v=>v/length);
}
export function applyPose(track,state){
  const pose=track.poses[state];track.object.position.set(...pose.position);
  track.object.quaternion.set(...quaternion(pose.rotation));
}
export function interpolatePose(track,from,to,progress,window=[0,1],easing='smoothstep'){
  const t=Math.max(0,Math.min((progress-window[0])/(window[1]-window[0]),1));
  const eased=easingFunctions[easing](t),a=track.poses[from],b=track.poses[to];
  track.object.position.set(...a.position.map((value,i)=>value+(b.position[i]-value)*eased));
  track.object.quaternion.set(...slerp(quaternion(a.rotation),quaternion(b.rotation),eased));
}
