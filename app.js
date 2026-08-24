const hero=document.querySelector('.hero');
const lightSwitch=document.querySelector('#light-switch');
const story=document.querySelector('#scroll-story');
const frameA=document.querySelector('#sequence-frame-a');
const frameB=document.querySelector('#sequence-frame-b');
let flashTimer;
let rafId=null;
let targetProgress=0;
let smoothProgress=0;
let lastTime=performance.now();

const frames=Array.from({length:10},(_,i)=>`./frame_${String(i+1).padStart(2,'0')}.png`);
const preloadedFrames=frames.map(src=>{
  const img=new Image();
  img.decoding='async';
  img.src=src;
  return img;
});

function setLight(on){
  hero.dataset.light=on?'on':'off';
  lightSwitch.setAttribute('aria-checked',String(on));
  lightSwitch.setAttribute('aria-label',on?'Turn chandelier light off':'Turn chandelier light on');
  hero.classList.remove('is-switching');
  void hero.offsetWidth;
  hero.classList.add('is-switching');
  clearTimeout(flashTimer);
  flashTimer=setTimeout(()=>hero.classList.remove('is-switching'),760);
}

lightSwitch.addEventListener('click',()=>setLight(hero.dataset.light!=='on'));

function clamp(v,min,max){return Math.min(max,Math.max(min,v));}

function readTargetProgress(){
  if(!story)return 0;
  const rect=story.getBoundingClientRect();
  const scrollable=Math.max(1,story.offsetHeight-window.innerHeight);
  const travelled=clamp(-rect.top,0,scrollable);
  const raw=travelled/scrollable;
  const sequenceStart=.055;
  const sequenceEnd=.945;
  return clamp((raw-sequenceStart)/(sequenceEnd-sequenceStart),0,1);
}

function render(progress){
  const sequenceOpacity=clamp(progress/.105,0,1);
  const uiOpacity=1-clamp(progress/.145,0,1);

  const eased=progress*progress*(3-2*progress);
  const position=eased*(frames.length-1);
  const index=Math.floor(position);
  const nextIndex=Math.min(frames.length-1,index+1);
  const local=position-index;
  const blend=local*local*(3-2*local);

  const srcA=frames[index];
  const srcB=frames[nextIndex];
  if(frameA.getAttribute('src')!==srcA)frameA.setAttribute('src',srcA);
  if(frameB.getAttribute('src')!==srcB)frameB.setAttribute('src',srcB);

  story.style.setProperty('--sequence-opacity',sequenceOpacity.toFixed(4));
  story.style.setProperty('--ui-opacity',uiOpacity.toFixed(4));
  story.style.setProperty('--frame-blend',blend.toFixed(4));
}

function animate(now){
  const dt=Math.min(34,Math.max(8,now-lastTime));
  lastTime=now;

  const smoothing=1-Math.pow(.82,dt/16.67);
  smoothProgress+=(targetProgress-smoothProgress)*smoothing;

  if(Math.abs(targetProgress-smoothProgress)<0.00008){
    smoothProgress=targetProgress;
  }

  render(smoothProgress);

  if(Math.abs(targetProgress-smoothProgress)>0.00008){
    rafId=requestAnimationFrame(animate);
  }else{
    rafId=null;
  }
}

function onScroll(){
  targetProgress=readTargetProgress();
  if(rafId===null){
    lastTime=performance.now();
    rafId=requestAnimationFrame(animate);
  }
}

window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',()=>{
  targetProgress=readTargetProgress();
  smoothProgress=targetProgress;
  render(smoothProgress);
});
window.addEventListener('load',()=>{
  targetProgress=readTargetProgress();
  smoothProgress=targetProgress;
  render(smoothProgress);
});

hero.dataset.light='off';
targetProgress=readTargetProgress();
smoothProgress=targetProgress;
render(smoothProgress);
