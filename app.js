const hero=document.querySelector('.hero');
const lightSwitch=document.querySelector('#light-switch');
const motionSection=document.querySelector('.motion-scroll');
const motionGif=document.querySelector('#motion-gif');
let flashTimer;
let motionStarted=false;

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

if(motionSection&&motionGif){
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting&&!motionStarted){
        const src=motionGif.getAttribute('src');
        motionGif.setAttribute('src','');
        requestAnimationFrame(()=>motionGif.setAttribute('src',src));
        motionStarted=true;
      }
      if(!entry.isIntersecting&&entry.boundingClientRect.top>0){
        motionStarted=false;
      }
    });
  },{threshold:.08});
  observer.observe(motionSection);
}

hero.dataset.light='off';
