const products=Array.from({length:8},(_,i)=>({item:'#'+String(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));
const rail=document.getElementById('productCarousel');
const progress=document.getElementById('progress');
const track=progress.parentElement;
rail.innerHTML=products.map((p,i)=>'<article class="card"><div class="picture shade-'+(i+1)+'"></div><div class="card-info"><div class="item">Item '+p.item+'</div><h2 class="product-title">'+p.name+'</h2><div class="purchase"><div class="prices"><span class="old">$'+p.original+'</span><strong class="new-price">$'+p.price+'</strong></div><button type="button" class="add" aria-label="Add product to cart" data-index="'+i+'"><span class="material-symbols-outlined" aria-hidden="true">add</span></button></div></div></article>').join('');
function updateProgress(){
 const max=rail.scrollWidth-rail.clientWidth;
 const visibleFraction=rail.clientWidth/rail.scrollWidth;
 const fraction=max>0?Math.max(0,Math.min(1,rail.scrollLeft/max)):0;
 progress.style.width=(visibleFraction*100)+'%';
 progress.style.transform='translateX('+(fraction*((track.clientWidth)*(1-visibleFraction)))+'px)';
 track.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
}
rail.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
let drag=null;
rail.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='mouse'||e.target.closest('button'))return;
 drag={x:e.clientX,left:rail.scrollLeft,moved:false};rail.classList.add('dragging');rail.setPointerCapture(e.pointerId);
});
rail.addEventListener('pointermove',e=>{
 if(!drag)return;
 const dx=e.clientX-drag.x;
 if(Math.abs(dx)>3)drag.moved=true;
 rail.scrollLeft=drag.left-dx;
});
function endDrag(){if(!drag)return;const moved=drag.moved;drag=null;rail.classList.remove('dragging');if(moved){const card=rail.querySelector('.card');const step=card.getBoundingClientRect().width+18;rail.scrollTo({left:Math.round(rail.scrollLeft/step)*step,behavior:'smooth'});}}
rail.addEventListener('pointerup',endDrag);rail.addEventListener('pointercancel',endDrag);
let lastWheelMove=0;
function stepSize(){const card=rail.querySelector('.card');return card?card.getBoundingClientRect().width+18:rail.clientWidth}
function scrollToCard(direction){
 const step=stepSize(),max=rail.scrollWidth-rail.clientWidth;
 const current=Math.round(rail.scrollLeft/step);
 const target=Math.max(0,Math.min(max,(current+direction)*step));
 rail.scrollTo({left:target,behavior:'smooth'});
}
rail.addEventListener('wheel',e=>{
 if(e.ctrlKey)return;
 const delta=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
 if(Math.abs(delta)<0.5)return;
 const max=rail.scrollWidth-rail.clientWidth;
 const direction=Math.sign(delta);
 const atStart=rail.scrollLeft<=1;
 const atEnd=rail.scrollLeft>=max-1;
 if(max<=1||(direction<0&&atStart)||(direction>0&&atEnd))return;
 e.preventDefault();
 const now=performance.now();
 if(now-lastWheelMove<430)return;
 lastWheelMove=now;
 scrollToCard(direction);
},{passive:false});
rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const card=rail.querySelector('.card');const step=card.getBoundingClientRect().width+18;rail.scrollBy({left:e.key==='ArrowRight'?step:-step,behavior:'smooth'})}});
rail.scrollLeft=0;
updateProgress();
let timeout;
function notice(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>el.classList.remove('show'),2300)}
rail.addEventListener('click',e=>{if(e.target.closest('.add'))notice('Product added — demo only')});
document.getElementById('viewAll').addEventListener('click',e=>{e.preventDefault();rail.scrollTo({left:0,behavior:'smooth'});notice('Showing all 8 placeholder products')});