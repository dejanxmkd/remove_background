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
let frames=[];
let preloadedFrames=[];

const ZIP_SRC='./40_smooth_frames.zip';
const FRAME_COUNT=40;

function frameMime(name){
  const ext=name.split('.').pop().toLowerCase();
  if(ext==='jpg'||ext==='jpeg')return 'image/jpeg';
  if(ext==='webp')return 'image/webp';
  if(ext==='avif')return 'image/avif';
  return 'image/png';
}

function preloadFrame(index){
  if(index<0||index>=frames.length||preloadedFrames[index])return;
  const img=new Image();
  img.decoding='async';
  img.src=frames[index];
  preloadedFrames[index]=img;
}

function preloadSequence(){
  for(let i=0;i<Math.min(10,frames.length);i++)preloadFrame(i);
  const preloadRemaining=()=>{
    for(let i=10;i<frames.length;i++)preloadFrame(i);
  };
  if('requestIdleCallback' in window){
    requestIdleCallback(preloadRemaining,{timeout:1200});
  }else{
    setTimeout(preloadRemaining,250);
  }
}

async function loadSequenceFrames(){
  try{
    const response=await fetch(ZIP_SRC,{cache:'force-cache'});
    if(!response.ok)throw new Error(`Frame ZIP failed to load (${response.status})`);
    const archive=new Uint8Array(await response.arrayBuffer());

    const files=await new Promise((resolve,reject)=>{
      fflate.unzip(archive,(error,data)=>error?reject(error):resolve(data));
    });

    const names=Object.keys(files)
      .filter(name=>!name.startsWith('__MACOSX/')&&!name.endsWith('/')&&/\.(png|jpe?g|webp|avif)$/i.test(name))
      .sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));

    if(names.length!==FRAME_COUNT){
      throw new Error(`Expected ${FRAME_COUNT} frames in ZIP, found ${names.length}`);
    }

    frames=names.map(name=>URL.createObjectURL(new Blob([files[name]],{type:frameMime(name)})));
    preloadedFrames=new Array(frames.length);
    preloadSequence();

    targetProgress=readTargetProgress();
    smoothProgress=targetProgress;
    render(smoothProgress);
  }catch(error){
    console.error('Unable to initialize 40-frame scroll sequence:',error);
  }
}

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
  const sequenceStart=.045;
  const sequenceEnd=.955;
  return clamp((raw-sequenceStart)/(sequenceEnd-sequenceStart),0,1);
}

function render(progress){
  if(!frames.length)return;

  const sequenceOpacity=clamp(progress/.09,0,1);
  const uiOpacity=1-clamp(progress/.13,0,1);

  // The source sequence is already motion-interpolated, so keep frame travel linear.
  // Only blend between adjacent frames to hide discrete frame boundaries.
  const position=progress*(frames.length-1);
  const index=Math.floor(position);
  const nextIndex=Math.min(frames.length-1,index+1);
  for(let i=index-3;i<=nextIndex+4;i++)preloadFrame(i);

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

  // Light inertia smooths wheel/trackpad input without making the animation feel delayed.
  const smoothing=1-Math.pow(.74,dt/16.67);
  smoothProgress+=(targetProgress-smoothProgress)*smoothing;

  if(Math.abs(targetProgress-smoothProgress)<0.00005){
    smoothProgress=targetProgress;
  }

  render(smoothProgress);

  if(Math.abs(targetProgress-smoothProgress)>0.00005){
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
window.addEventListener('beforeunload',()=>{
  frames.forEach(src=>URL.revokeObjectURL(src));
});

hero.dataset.light='off';
loadSequenceFrames();
