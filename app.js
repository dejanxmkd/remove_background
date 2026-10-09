const products=Array.from({length:8},(_,i)=>({item:'#'+String(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));
const rail=document.getElementById('productCarousel');
const progress=document.getElementById('progress');
const progressTrack=progress.parentElement;
let start=0;
function visibleCount(){return window.innerWidth<=760?1:window.innerWidth<=1180?3:5}
function render(){
  const visible=visibleCount();
  start=Math.min(Math.max(0,start),Math.max(0,products.length-visible));
  rail.innerHTML=products.slice(start,start+visible).map((p,i)=>'<article class="card"><div class="picture shade-'+((start+i)%8+1)+'"></div><div class="card-info"><div class="item">Item '+p.item+'</div><h2 class="product-title">'+p.name+'</h2><div class="purchase"><div class="prices"><span class="old">$'+p.original+'</span><strong class="new-price">$'+p.price+'</strong></div><button type="button" class="add" aria-label="Add product to cart" data-index="'+(start+i)+'"><span class="material-symbols-outlined" aria-hidden="true">add</span></button></div></div></article>').join('');
  const pct=Math.round(((start+visible)/products.length)*100);
  progress.style.width=pct+'%';
  progressTrack.setAttribute('aria-valuenow',String(pct));
}
function move(delta){const next=Math.max(0,Math.min(products.length-visibleCount(),start+delta));if(next!==start){start=next;render()}}
let dragStart=null;
rail.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragStart={x:e.clientX,y:e.clientY};if(e.pointerType==='mouse')rail.setPointerCapture(e.pointerId)});
rail.addEventListener('pointerup',e=>{if(!dragStart)return;const dx=e.clientX-dragStart.x;const dy=e.clientY-dragStart.y;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1);dragStart=null});
rail.addEventListener('pointercancel',()=>{dragStart=null});
let wheelCooldown=0;
rail.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<4)return;e.preventDefault();const now=performance.now();if(now-wheelCooldown>300){move(e.deltaX>0?1:-1);wheelCooldown=now}},{passive:false});
rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
window.addEventListener('resize',render);
render();
let timeout;
function notice(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>el.classList.remove('show'),2300)}
rail.addEventListener('click',e=>{if(e.target.closest('.add'))notice('Product added — demo only')});
document.getElementById('viewAll').addEventListener('click',e=>{e.preventDefault();start=0;render();notice('Showing all 8 placeholder products')});