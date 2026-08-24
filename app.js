const hero=document.querySelector('.hero');
const lightSwitch=document.querySelector('#light-switch');
const story=document.querySelector('#scroll-story');
const motionGif=document.querySelector('#motion-gif');
let flashTimer;
let ticking=false;
let gifStarted=false;

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

lightSwitch.addEventListener('click',()=>{
  setLight(hero.dataset.light!=='on');
});

function updateScrollBlend(){
  ticking=false;
  if(!story)return;

  const rect=story.getBoundingClientRect();
  const scrollable=Math.max(1,story.offsetHeight-window.innerHeight);
  const travelled=Math.min(scrollable,Math.max(0,-rect.top));
  const raw=travelled/scrollable;

  // Keep the hero stable first, then blend continuously into the motion scene.
  const progress=Math.min(1,Math.max(0,(raw-.08)/.76));
  story.style.setProperty('--scroll-progress',progress.toFixed(4));

  if(progress>.025&&!gifStarted&&motionGif){
    const src=motionGif.getAttribute('src').split('?')[0];
    motionGif.setAttribute('src',`${src}?play=${Date.now()}`);
    gifStarted=true;
  }
  if(progress<.01){gifStarted=false;}
}

function requestBlendUpdate(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(updateScrollBlend);
}

window.addEventListener('scroll',requestBlendUpdate,{passive:true});
window.addEventListener('resize',requestBlendUpdate);

hero.dataset.light='off';
updateScrollBlend();
