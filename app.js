const hero=document.querySelector('.hero');
const lightSwitch=document.querySelector('#light-switch');

function setLight(on){
  hero.dataset.light=on?'on':'off';
  lightSwitch.setAttribute('aria-checked',String(on));
  lightSwitch.setAttribute('aria-label',on?'Turn chandelier light off':'Turn chandelier light on');
}

lightSwitch.addEventListener('click',()=>{
  setLight(hero.dataset.light!=='on');
});

setLight(false);
