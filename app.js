const products=Array.from({length:8},(_,i)=>({item:'#'+String(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));
const rail=document.getElementById('productCarousel');
const prev=document.getElementById('prev'),next=document.getElementById('next'),current=document.getElementById('current'),progress=document.getElementById('progress');
let start=0;
function visibleCount(){return window.innerWidth<=760?1:window.innerWidth<=1180?3:5}
function render(){
  const visible=visibleCount();
  start=Math.min(start,Math.max(0,products.length-visible));
  rail.innerHTML=products.slice(start,start+visible).map((p,i)=>'<article class="card"><div class="picture shade-'+((start+i)%8+1)+'"></div><div class="card-info"><div class="item">Item '+p.item+'</div><h2 class="product-title">'+p.name+'</h2><div class="purchase"><div class="prices"><span class="old">$'+p.original+'</span><strong class="new-price">$'+p.price+'</strong></div><button type="button" class="add" aria-label="Add product to cart" data-index="'+(start+i)+'"><span class="material-symbols-outlined" aria-hidden="true">add</span></button></div></div></article>').join('');
  current.textContent=String(start+1).padStart(2,'0');
  progress.style.width=(((start+visible)/products.length)*100)+'%';
  prev.disabled=start===0;
  next.disabled=start+visible>=products.length;
}
prev.addEventListener('click',()=>{start=Math.max(0,start-1);render()});
next.addEventListener('click',()=>{start=Math.min(products.length-visibleCount(),start+1);render()});
window.addEventListener('resize',render);
render();
let timeout;
function notice(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>el.classList.remove('show'),2300)}
rail.addEventListener('click',e=>{if(e.target.closest('.add'))notice('Product added — demo only')});
document.getElementById('viewAll').addEventListener('click',e=>{e.preventDefault();start=0;render();notice('Showing all 8 placeholder products')});