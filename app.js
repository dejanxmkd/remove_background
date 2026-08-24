const hero=document.querySelector('.hero');
const lightSwitch=document.querySelector('#light-switch');
const story=document.querySelector('#scroll-story');
const frameA=document.querySelector('#sequence-frame-a');
const frameB=document.querySelector('#sequence-frame-b');
let flashTimer;
let ticking=false;

const frames=Array.from({length:10},(_,i)=>`./frame_${String(i+1).padStart(2,'0')}.png`);
frames.forEach(src=>{const img=new Image();img.src=src;});

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

function updateScrollSequence(){
  ticking=false;
  if(!story)return;

  const rect=story.getBoundingClientRect();
  const scrollable=Math.max(1,story.offsetHeight-window.innerHeight);
  const travelled=clamp(-rect.top,0,scrollable);
  const raw=travelled/scrollable;

  const sequenceStart=.06;
  const sequenceEnd=.94;
  const progress=clamp((raw-sequenceStart)/(sequenceEnd-sequenceStart),0,1);
  const sequenceOpacity=clamp(progress/.10,0,1);
  const uiOpacity=1-clamp(progress/.13,0,1);

  const position=progress*(frames.length-1);
  const index=Math.floor(position);
  const nextIndex=Math.min(frames.length-1,index+1);
  const blend=position-index;

  const srcA=frames[index];
  const srcB=frames[nextIndex];
  if(frameA.getAttribute('src')!==srcA)frameA.setAttribute('src',srcA);
  if(frameB.getAttribute('src')!==srcB)frameB.setAttribute('src',srcB);

  story.style.setProperty('--sequence-opacity',sequenceOpacity.toFixed(4));
  story.style.setProperty('--ui-opacity',uiOpacity.toFixed(4));
  story.style.setProperty('--frame-blend',blend.toFixed(4));
}

function requestSequenceUpdate(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(updateScrollSequence);
}

window.addEventListener('scroll',requestSequenceUpdate,{passive:true});
window.addEventListener('resize',requestSequenceUpdate);
window.addEventListener('load',requestSequenceUpdate);

hero.dataset.light='off';
updateScrollSequence();
