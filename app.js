const products=Array.from({length:8},(_,i)=>({item:'#'+String(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));
const rail=document.getElementById('productCarousel');
const progress=document.getElementById('progress');
const track=progress.parentElement;
rail.innerHTML=products.map((p,i)=>'<article class="card"><div class="picture"></div><div class="card-info"><div class="item">Item '+p.item+'</div><h2 class="product-title">'+p.name+'</h2><div class="purchase"><div class="prices"><span class="old">$'+p.original+'</span><strong class="new-price">$'+p.price+'</strong></div><button type="button" class="add" aria-label="Add product to cart" data-index="'+i+'"><span class="material-symbols-outlined" aria-hidden="true">add</span></button></div></div></article>').join('');
let index=0;
function gap(){return parseFloat(getComputedStyle(rail).gap)||18;}
function visibleCount(){return matchMedia('(max-width:760px)').matches?1.5:matchMedia('(max-width:1180px)').matches?3:5}
function maxIndex(){return Math.max(0,Math.floor(products.length-visibleCount()))}
function step(){return rail.querySelector('.card').getBoundingClientRect().width+gap()}
function render(){
 index=Math.max(0,Math.min(index,maxIndex()));
 rail.style.transform='translate3d('+(-index*step())+'px,0,0)';
 const viewportCount=visibleCount();
 const share=Math.min(1,viewportCount/products.length);
 const proportion=maxIndex()?index/maxIndex():0;
 const travel=track.clientWidth*(1-share);
 progress.style.width=(share*100)+'%';
 progress.style.transform='translateX('+(travel*proportion)+'px)';
 track.setAttribute('aria-valuenow',String(Math.round(proportion*100)));
}
function move(direction){const next=Math.max(0,Math.min(maxIndex(),index+direction));if(next!==index){index=next;render();return true}return false}
window.addEventListener('resize',render);
let pointer=null;
rail.addEventListener('pointerdown',e=>{
 if(e.target.closest('button'))return;
 pointer={x:e.clientX,y:e.clientY};
 if(e.pointerType==='mouse')rail.setPointerCapture(e.pointerId);
});
rail.addEventListener('pointerup',e=>{
 if(!pointer)return;
 const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
 pointer=null;
 if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1);
});
rail.addEventListener('pointercancel',()=>pointer=null);
let lastWheel=0;
rail.addEventListener('wheel',e=>{
 if(e.ctrlKey)return;
 const delta=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
 if(Math.abs(delta)<1)return;
 const dir=Math.sign(delta);
 if((dir<0&&index===0)||(dir>0&&index===maxIndex()))return;
 e.preventDefault();
 const now=performance.now();
 if(now-lastWheel<430)return;
 lastWheel=now;
 move(dir);
},{passive:false});
rail.addEventListener('keydown',e=>{
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
  e.preventDefault();move(e.key==='ArrowRight'?1:-1);
 }
});
document.fonts?.ready.then(render);render();
let timeout;
function notice(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>el.classList.remove('show'),2300)}
rail.addEventListener('click',e=>{if(e.target.closest('.add'))notice('Product added — demo only')});
['viewAll','mobileViewAll'].forEach(id=>document.getElementById(id)?.addEventListener('click',e=>{e.preventDefault();index=0;render();notice('Showing all 8 placeholder products')}));
