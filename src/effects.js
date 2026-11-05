const $ = id => document.getElementById(id);
let confettiFrame;
export function confetti(){
  cancelAnimationFrame(confettiFrame);
  const canvas=$('confetti'),ctx=canvas.getContext('2d');
  canvas.width=innerWidth;canvas.height=innerHeight;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const colors=['#789b70','#e3bc62','#c8dcae','#668f9a'];
  const pieces=Array.from({length:80},()=>({x:innerWidth/2,y:innerHeight*.43,vx:(Math.random()-.5)*11,vy:-Math.random()*9-2,color:colors[Math.floor(Math.random()*colors.length)],angle:Math.random()*6}));
  const start=performance.now();let last=start;
  function frame(now){const dt=Math.min((now-last)/16.67,3);last=now;ctx.clearRect(0,0,canvas.width,canvas.height);const t=(now-start)/1700;if(t>=1)return;ctx.globalAlpha=1-t;
    for(const p of pieces){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.16*dt;p.angle+=.07*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.fillRect(-3,-4,6,8);ctx.restore();}confettiFrame=requestAnimationFrame(frame);
  }confettiFrame=requestAnimationFrame(frame);
}
