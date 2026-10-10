const heroVideo=document.querySelector('.hero-video-media');
if(heroVideo){
 heroVideo.defaultPlaybackRate=0.8;
 heroVideo.playbackRate=0.8;
}

const products=Array.from({length:8},(_,i)=>({item:'#'+(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));

class ProductCard {
 static render(product,index){
  return `<article class="card"><div class="picture" aria-label="Product image placeholder"></div><div class="card-info"><div class="item">Item ${product.item}</div><h2 class="product-title">${product.name}</h2><div class="purchase"><div class="prices"><span class="old">$${product.original}</span><strong class="new-price">$${product.price}</strong></div><button class="add" type="button" aria-label="Add product to cart" data-index="${index}"><span class="material-symbols-outlined" aria-hidden="true">add</span></button></div></div></article>`;
 }
}

class ProductCarousel {
 constructor(element,items,progress,renderCard=ProductCard.render){
  this.element=element;this.items=items;this.progress=progress;this.track=progress.parentElement;
  this.target=0;this.frame=0;this.wheelTimer=0;this.drag=null;
  element.innerHTML=items.map((item,i)=>renderCard(item,i)).join('');
  element.addEventListener('scroll',()=>this.updateProgress(),{passive:true});
  element.addEventListener('wheel',e=>this.onWheel(e),{passive:false});
  element.addEventListener('pointerdown',e=>this.onPointerDown(e));
  element.addEventListener('pointermove',e=>this.onPointerMove(e));
  element.addEventListener('pointerup',()=>this.endDrag());
  element.addEventListener('pointercancel',()=>this.endDrag());
  element.addEventListener('keydown',e=>this.onKeyDown(e));
  window.addEventListener('resize',()=>{this.stop();this.updateProgress()});
  this.updateProgress();
 }
 max(){return Math.max(0,this.element.scrollWidth-this.element.clientWidth)}
 step(){const card=this.element.querySelector('.card');return card?card.getBoundingClientRect().width+(parseFloat(getComputedStyle(this.element).columnGap)||0):this.element.clientWidth}
 updateProgress(){
  const max=this.max(),visible=Math.min(1,this.element.clientWidth/this.element.scrollWidth);
  const ratio=max?Math.max(0,Math.min(1,this.element.scrollLeft/max)):0;
  this.progress.style.width=(visible*100)+'%';
  this.progress.style.transform=`translateX(${this.track.clientWidth*(1-visible)*ratio}px)`;
  this.track.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
 }
 stop(){cancelAnimationFrame(this.frame);this.frame=0;clearTimeout(this.wheelTimer);this.target=this.element.scrollLeft;this.element.style.scrollSnapType=''}
 animateTo(position){
  this.target=Math.max(0,Math.min(this.max(),position));
  this.element.style.scrollSnapType='none';
  if(!this.frame)this.frame=requestAnimationFrame(()=>this.tick());
 }
 tick(){
  const delta=this.target-this.element.scrollLeft;
  if(Math.abs(delta)<.6){
   this.element.scrollLeft=this.target;this.frame=0;
   return;
  }
  this.element.scrollLeft+=delta*.13;
  this.frame=requestAnimationFrame(()=>this.tick());
 }
 settle(){
  const max=this.max(),step=this.step();
  const nearest=Math.max(0,Math.min(max,Math.round(this.target/step)*step));
  // The last position is an exact edge alignment, never a clipped final card.
  const position=max-nearest<step*.5?max:nearest;
  this.animateTo(position);
 }
 onWheel(event){
  if(event.ctrlKey||matchMedia('(max-width:760px)').matches)return;
  const raw=Math.abs(event.deltaY)>=Math.abs(event.deltaX)?event.deltaY:event.deltaX;
  if(Math.abs(raw)<.5)return;
  const delta=raw*(event.deltaMode===1?18:event.deltaMode===2?this.element.clientWidth:1);
  const base=this.frame?this.target:this.element.scrollLeft;
  if((delta<0&&base<=0)||(delta>0&&base>=this.max()))return;
  event.preventDefault();
  this.animateTo(base+delta);
  clearTimeout(this.wheelTimer);
  this.wheelTimer=setTimeout(()=>this.settle(),160);
 }
 onPointerDown(event){
  if(event.pointerType!=='mouse'||event.target.closest('button'))return;
  this.stop();this.drag={x:event.clientX,left:this.element.scrollLeft};
  this.element.style.scrollSnapType='none';this.element.setPointerCapture(event.pointerId);
 }
 onPointerMove(event){if(this.drag)this.element.scrollLeft=this.drag.left-(event.clientX-this.drag.x)}
 endDrag(){
  if(!this.drag)return;
  this.drag=null;this.target=this.element.scrollLeft;this.settle();
 }
 onKeyDown(event){
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();
  this.animateTo(this.element.scrollLeft+(event.key==='ArrowRight'?1:-1)*this.step());
  clearTimeout(this.wheelTimer);this.wheelTimer=setTimeout(()=>this.settle(),300);
 }
 reset(){this.animateTo(0)}
}

const carousel=new ProductCarousel(document.getElementById('productCarousel'),products,document.getElementById('progress'));
let noticeTimer;
function notify(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),2300)}
carousel.element.addEventListener('click',event=>{if(event.target.closest('.add'))notify('Product added — demo only')});
['viewAll','mobileViewAll'].forEach(id=>document.getElementById(id)?.addEventListener('click',event=>{event.preventDefault();carousel.reset();notify('Showing all 8 placeholder products')}));


// Brand cards share the carousel's scrolling, progress and responsive behavior.
class BrandCard {
 static render(brand,index){return `<article class="card brand-card"><div class="brand-picture"></div><div class="brand-info"><h3 class="brand-name">${brand.name}</h3></div></article>`;}
}
const brands=Array.from({length:8},(_,i)=>({name:'Brand name'}));
const brandCarousel=new ProductCarousel(document.getElementById('brandCarousel'),brands,document.getElementById('brandProgress'),BrandCard.render);
brandCarousel.element.addEventListener('click',event=>{const link=event.target.closest('[data-brand]');if(link){event.preventDefault();notify('Brand page — demo only')}});
['viewAllBrands','mobileViewAllBrands'].forEach(id=>document.getElementById(id)?.addEventListener('click',event=>{event.preventDefault();brandCarousel.reset();notify('Showing all 8 placeholder brands')}));

// Subtle section entrance animations, not applied to individual cards.
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}});
 },{threshold:.12});
 document.querySelectorAll('.section-header,.section-bottom').forEach(el=>{el.classList.add('scroll-reveal');observer.observe(el)});
}


// Small category tiles reuse the shared carousel and progress component.
class CategoryCard {
 static render(category){return `<article class="card category-card"><div class="category-visual" aria-hidden="true"></div><div class="category-footer"><span>${category.name}</span></div></article>`;}
}
const categories=[
 {name:'Candy',icon:'candy'},
 {name:'Chips & Snacks',icon:'nutrition'},
 {name:'Chocolate',icon:'cookie'},
 {name:'Coffee',icon:'coffee'},
 {name:'European Products',icon:'shopping_bag'},
 {name:'Grocery',icon:'shopping_basket'},
 {name:'Variety Packs',icon:'inventory_2'},
 {name:'Olive Oil',icon:'water_drop'},
 {name:'Tools',icon:'handyman'},
 {name:'Health & Beauty',icon:'health_and_beauty'},
 {name:'Cleaning',icon:'cleaning_services'},
 {name:'Personal Care',icon:'spa'},
 {name:'Nutrition',icon:'fitness_center'},
 {name:'Tobacco Accessories',icon:'package_2'},
 {name:'Popcorn & Pretzels',icon:'fastfood'}
];
const categoryCarousel=new ProductCarousel(document.getElementById('categoryCarousel'),categories,document.getElementById('categoryProgress'),CategoryCard.render);

document.querySelectorAll('[data-feature]').forEach(link=>link.addEventListener('click',()=>notify(link.dataset.feature+' collection — preview only')));

/* Featured sections reuse the New Arrivals product carousel and card rendering. */
const dealsHost=document.getElementById('dealsProducts');
const sellersHost=document.getElementById('bestSellerProducts');
if(dealsHost&&sellersHost){
 const dealsCarousel=new ProductCarousel(dealsHost,products.slice(0,2),document.getElementById('dealsProgress'),(product,i)=>ProductCard.render(product,i));
 const sellersCarousel=new ProductCarousel(sellersHost,products.slice(2,4),document.getElementById('bestSellerProgress'),(product,i)=>ProductCard.render(product,i+2));
 [dealsCarousel,sellersCarousel].forEach(slider=>{
  slider.element.addEventListener('click',event=>{
   if(event.target.closest('.add'))notify('Product added — demo only');
  });
 });
}
