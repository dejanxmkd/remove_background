const products=Array.from({length:8},(_,i)=>({item:'#'+(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));

class ProductCard {
 static render(product,index){
  return `<article class="card"><div class="picture" aria-label="Product image placeholder"></div><div class="card-info"><div class="item">Item ${product.item}</div><h2 class="product-title">${product.name}</h2><div class="purchase"><div class="prices"><span class="old">$${product.original}</span><strong class="new-price">$${product.price}</strong></div><button class="add" type="button" aria-label="Add product to cart" data-index="${index}"><span class="material-symbols-outlined" aria-hidden="true">add</span></button></div></div></article>`;
 }
}

class ProductCarousel {
 constructor(element,items,progress){
  this.element=element;this.items=items;this.progress=progress;
  this.track=progress.parentElement;
  this.target=0;this.frame=0;this.settleTimer=0;this.drag=null;
  element.innerHTML=items.map(ProductCard.render).join('');
  element.addEventListener('scroll',()=>this.updateProgress(),{passive:true});
  element.addEventListener('wheel',e=>this.onWheel(e),{passive:false});
  element.addEventListener('pointerdown',e=>this.onPointerDown(e));
  element.addEventListener('pointermove',e=>this.onPointerMove(e));
  element.addEventListener('pointerup',e=>this.onPointerUp(e));
  element.addEventListener('pointercancel',()=>this.endDrag());
  element.addEventListener('keydown',e=>this.onKeyDown(e));
  window.addEventListener('resize',()=>{this.stopAnimation();this.updateProgress()});
  this.updateProgress();
 }
 max(){return Math.max(0,this.element.scrollWidth-this.element.clientWidth)}
 step(){
  const card=this.element.querySelector('.card');
  return card?card.getBoundingClientRect().width+parseFloat(getComputedStyle(this.element).gap||18):this.element.clientWidth;
 }
 updateProgress(){
  const max=this.max();const visible=Math.min(1,this.element.clientWidth/this.element.scrollWidth);
  const ratio=max?Math.min(1,Math.max(0,this.element.scrollLeft/max)):0;
  this.progress.style.width=(visible*100)+'%';
  this.progress.style.transform=`translateX(${this.track.clientWidth*(1-visible)*ratio}px)`;
  this.track.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
 }
 stopAnimation(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;clearTimeout(this.settleTimer);this.element.style.scrollSnapType='';this.target=this.element.scrollLeft}
 animate(){
  const diff=this.target-this.element.scrollLeft;
  if(Math.abs(diff)<.45){this.element.scrollLeft=this.target;this.frame=0;this.scheduleSnap();return}
  this.element.scrollLeft+=diff*.16;
  this.frame=requestAnimationFrame(()=>this.animate());
 }
 animateTo(value){
  this.target=Math.max(0,Math.min(this.max(),value));
  this.element.style.scrollSnapType='none';
  clearTimeout(this.settleTimer);
  if(!this.frame)this.frame=requestAnimationFrame(()=>this.animate());
 }
 scheduleSnap(){
  clearTimeout(this.settleTimer);
  this.settleTimer=setTimeout(()=>{
   const step=this.step();
   const snapped=Math.min(this.max(),Math.max(0,Math.round(this.element.scrollLeft/step)*step));
   if(Math.abs(snapped-this.element.scrollLeft)>1){
    this.animateTo(snapped);
   }else{this.element.style.scrollSnapType='';}
  },110);
 }
 onWheel(event){
  if(event.ctrlKey||matchMedia('(max-width:760px)').matches)return;
  const delta=Math.abs(event.deltaY)>Math.abs(event.deltaX)?event.deltaY:event.deltaX;
  if(!delta)return;
  const pixels=event.deltaMode===1?delta*18:event.deltaMode===2?delta*this.element.clientWidth:delta;
  const base=this.frame?this.target:this.element.scrollLeft;
  if((pixels<0&&base<=0)||(pixels>0&&base>=this.max()))return;
  event.preventDefault();
  this.animateTo(base+pixels*1.05);
 }
 onPointerDown(event){
  if(event.pointerType!=='mouse'||event.target.closest('button'))return;
  this.stopAnimation();this.drag={x:event.clientX,start:this.element.scrollLeft};
  this.element.style.scrollSnapType='none';
  this.element.setPointerCapture(event.pointerId);
 }
 onPointerMove(event){if(!this.drag)return;this.element.scrollLeft=this.drag.start-(event.clientX-this.drag.x)}
 onPointerUp(){this.endDrag()}
 endDrag(){if(!this.drag)return;this.drag=null;this.scheduleSnap()}
 onKeyDown(event){
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();this.animateTo(this.element.scrollLeft+(event.key==='ArrowRight'?1:-1)*this.step());
 }
 reset(){this.animateTo(0)}
}

const carousel=new ProductCarousel(document.getElementById('productCarousel'),products,document.getElementById('progress'));
let noticeTimer;
function notify(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),2300)}
carousel.element.addEventListener('click',event=>{if(event.target.closest('.add'))notify('Product added — demo only')});
['viewAll','mobileViewAll'].forEach(id=>document.getElementById(id)?.addEventListener('click',event=>{event.preventDefault();carousel.reset();notify('Showing all 8 placeholder products')}));
