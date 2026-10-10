const heroVideo=document.querySelector('.hero-video-media');
if(heroVideo){
 heroVideo.defaultPlaybackRate=0.8;
 heroVideo.playbackRate=0.8;
}

/* Header shopping context and cart indicator. Counts are per selected demo user. */
const shoppingUserSelect=document.getElementById('shoppingUser');
const shoppingCartButton=document.getElementById('shoppingCart');
const shoppingCartCount=document.getElementById('cartCount');
const shoppingCartTotals=Object.create(null);

function updateShoppingCartBadge(){
  if(!shoppingUserSelect||!shoppingCartButton||!shoppingCartCount)return;
  const count=shoppingCartTotals[shoppingUserSelect.value]||0;
  shoppingCartCount.textContent=String(count);
  shoppingCartCount.hidden=count===0;
  shoppingCartButton.setAttribute('aria-label',`Shopping cart, ${count} ${count===1?'item':'items'} for ${shoppingUserSelect.value}`);
}
shoppingUserSelect?.addEventListener('change',updateShoppingCartBadge);
document.addEventListener('click',event=>{
  if(!event.target.closest('.card .add')||!shoppingUserSelect)return;
  const user=shoppingUserSelect.value;
  shoppingCartTotals[user]=(shoppingCartTotals[user]||0)+1;
  updateShoppingCartBadge();
});
shoppingCartButton?.addEventListener('click',()=>{
  const count=shoppingCartTotals[shoppingUserSelect.value]||0;
  notify(`${shoppingUserSelect.value}: ${count} ${count===1?'item':'items'} in cart`);
});
updateShoppingCartBadge();

/* One set of account controls is moved into the mobile burger panel;
   this preserves the current shopping account and cart state on resize. */
const mobileMenuToggle=document.getElementById('mobileMenuToggle');
const mobileMenuPanel=document.getElementById('mobileMenuPanel');
const mobileMenuContent=document.getElementById('mobileMenuContent');
const shoppingNavControls=document.querySelector('.shopping-nav-controls');
const quickShopLink=shoppingNavControls?.querySelector('.quick-shop-button');
const shoppingNavDivider=shoppingNavControls?.querySelector('.shopping-nav-separator');
const shoppingUserBlock=shoppingNavControls?.querySelector('.shopping-user');
const mobileNavMedia=window.matchMedia('(max-width:760px)');
function setMobileMenuOpen(open,restoreFocus=false){
  if(!mobileMenuPanel||!mobileMenuToggle)return;
  mobileMenuPanel.classList.toggle('is-open',open);
  mobileMenuPanel.inert=!open;
  mobileMenuPanel.setAttribute('aria-hidden',String(!open));
  mobileMenuToggle.setAttribute('aria-expanded',String(open));
  mobileMenuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');
  if(!open&&mobileMenuPanel.contains(document.activeElement))document.activeElement.blur();
  if(!open&&restoreFocus)mobileMenuToggle.focus();
}
function syncShoppingNavLayout(){
  if(!quickShopLink||!shoppingNavDivider||!shoppingUserBlock)return;
  setMobileMenuOpen(false);
  if(mobileNavMedia.matches){
    mobileMenuContent.append(shoppingUserBlock,quickShopLink,shoppingNavDivider);
  }else{
    shoppingNavControls.append(quickShopLink,shoppingNavDivider,shoppingUserBlock);
  }
}
mobileNavMedia.addEventListener('change',syncShoppingNavLayout);
syncShoppingNavLayout();
mobileMenuToggle?.addEventListener('click',()=>{
  const next=!mobileMenuPanel.classList.contains('is-open');
  if(next&&typeof setHeaderSearchOpen==='function')setHeaderSearchOpen(false);
  setMobileMenuOpen(next);
});
document.addEventListener('pointerdown',event=>{
  if(!mobileMenuPanel?.classList.contains('is-open'))return;
  if(mobileUserSheet?.classList.contains('is-open'))return;
  if(mobileMenuPanel.contains(event.target)||mobileMenuToggle.contains(event.target))return;
  setMobileMenuOpen(false);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!mobileUserSheet?.classList.contains('is-open')&&mobileMenuPanel?.classList.contains('is-open'))setMobileMenuOpen(false,true);
});
quickShopLink?.addEventListener('click',()=>setMobileMenuOpen(false));

/* Bottom-sheet account chooser for mobile; desktop keeps the native select.
   The same select remains the source of truth for cart totals per account. */
const mobileUserTrigger=document.getElementById('mobileUserTrigger');
const mobileUserName=document.getElementById('mobileUserName');
const mobileUserSheet=document.getElementById('mobileUserSheet');
const mobileUserSheetDialog=mobileUserSheet?.querySelector('.mobile-user-sheet-dialog');
const mobileUserOptions=document.getElementById('mobileUserOptions');
const mobileUserBackdrop=document.getElementById('mobileUserBackdrop');
const userCheckSvg='<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>';

function syncMobileUserLabel(){
  if(!shoppingUserSelect||!mobileUserName||!mobileUserTrigger)return;
  mobileUserName.textContent=shoppingUserSelect.selectedOptions[0]?.textContent||shoppingUserSelect.value;
  mobileUserTrigger.setAttribute('aria-label','Switch shopping account: '+mobileUserName.textContent);
}
function renderMobileUserOptions(){
  if(!shoppingUserSelect||!mobileUserOptions)return;
  mobileUserOptions.replaceChildren();
  for(const option of shoppingUserSelect.options){
    const button=document.createElement('button');
    button.type='button';
    button.className='mobile-user-option';
    button.dataset.user=option.value;
    button.setAttribute('aria-pressed',String(option.value===shoppingUserSelect.value));
    const name=document.createElement('span');
    name.textContent=option.textContent;
    button.append(name);
    button.insertAdjacentHTML('beforeend',userCheckSvg);
    mobileUserOptions.append(button);
  }
}
function setMobileUserSheetOpen(open,restoreFocus=true){
  if(!mobileUserSheet||!mobileNavMedia.matches)return;
  mobileUserSheet.classList.toggle('is-open',open);
  mobileUserSheet.inert=!open;
  mobileUserSheet.setAttribute('aria-hidden',String(!open));
  document.body.classList.toggle('mobile-user-sheet-active',open);
  if(open){
    renderMobileUserOptions();
    mobileUserOptions.querySelector('button')?.focus({preventScroll:true});
  }else if(restoreFocus&&mobileMenuPanel?.classList.contains('is-open')){
    mobileUserTrigger.focus();
  }
}
shoppingUserSelect?.addEventListener('change',syncMobileUserLabel);
syncMobileUserLabel();
mobileUserTrigger?.addEventListener('click',()=>setMobileUserSheetOpen(true));
mobileUserOptions?.addEventListener('click',event=>{
  const button=event.target.closest('.mobile-user-option');
  if(!button||!shoppingUserSelect)return;
  shoppingUserSelect.value=button.dataset.user;
  shoppingUserSelect.dispatchEvent(new Event('change',{bubbles:true}));
  setMobileUserSheetOpen(false);
});
mobileUserBackdrop?.addEventListener('click',()=>setMobileUserSheetOpen(false));

/* iOS-friendly swipe-to-dismiss: drag anywhere on the sheet downward
   (including the grab line and header). Upward gestures still scroll options. */
const mobileUserDragHandle=mobileUserSheet?.querySelector('.mobile-user-sheet-grab');
let mobileUserDrag=null;
function beginStoreSheetDrag(y){
  if(!mobileUserSheet?.classList.contains('is-open')||!mobileUserSheetDialog)return;
  mobileUserDrag={startY:y,startTime:performance.now(),distance:0,active:false};
}
function moveStoreSheetDrag(y,event){
  if(!mobileUserDrag||!mobileUserSheetDialog)return;
  const delta=y-mobileUserDrag.startY;
  // Only downward movement from the top; never hijack upward list scrolling.
  if(!mobileUserDrag.active){
    if(delta<=10||mobileUserSheetDialog.scrollTop>0)return;
    mobileUserDrag.active=true;
    mobileUserSheet.classList.add('is-dragging');
  }
  const distance=Math.max(0,delta);
  mobileUserDrag.distance=distance;
  mobileUserSheetDialog.style.transform=`translate3d(0,${distance}px,0)`;
  if(event.cancelable)event.preventDefault();
}
function endStoreSheetDrag(cancelled=false){
  if(!mobileUserDrag||!mobileUserSheetDialog)return;
  const {distance,startTime,active}=mobileUserDrag;
  const elapsed=Math.max(1,performance.now()-startTime);
  mobileUserDrag=null;
  mobileUserSheet.classList.remove('is-dragging');
  const dismiss=!cancelled&&active&&(distance>=75||(distance>=24&&distance/elapsed>.5));
  if(dismiss)setMobileUserSheetOpen(false);
  mobileUserSheetDialog.style.removeProperty('transform');
}
// Safari frequently cancels pointer capture during a vertical swipe.
// Native non-passive Touch Events work reliably for this modal.
mobileUserSheetDialog?.addEventListener('touchstart',event=>{
  if(event.touches.length!==1)return;
  beginStoreSheetDrag(event.touches[0].clientY);
},{passive:true});
mobileUserSheetDialog?.addEventListener('touchmove',event=>{
  if(event.touches.length!==1)return;
  moveStoreSheetDrag(event.touches[0].clientY,event);
},{passive:false});
mobileUserSheetDialog?.addEventListener('touchend',()=>endStoreSheetDrag());
mobileUserSheetDialog?.addEventListener('touchcancel',()=>endStoreSheetDrag(true));
// Mouse / stylus support without competing with touch handlers.
mobileUserSheetDialog?.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||event.button!==0)return;
  beginStoreSheetDrag(event.clientY);
  mobileUserSheetDialog.setPointerCapture(event.pointerId);
});
mobileUserSheetDialog?.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||!mobileUserDrag)return;
  moveStoreSheetDrag(event.clientY,event);
});
mobileUserSheetDialog?.addEventListener('pointerup',event=>{
  if(event.pointerType!=='touch')endStoreSheetDrag();
});
mobileUserSheetDialog?.addEventListener('pointercancel',event=>{
  if(event.pointerType!=='touch')endStoreSheetDrag(true);
});

document.addEventListener('keydown',event=>{
  if(!mobileUserSheet?.classList.contains('is-open'))return;
  if(event.key==='Escape'){
    event.preventDefault();event.stopPropagation();
    setMobileUserSheetOpen(false);
  }else if(event.key==='Tab'){
    const buttons=[...mobileUserOptions.querySelectorAll('button')];
    const first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
},true);
mobileNavMedia.addEventListener('change',()=>{
  if(!mobileNavMedia.matches&&mobileUserSheet?.classList.contains('is-open')){
    mobileUserSheet.classList.remove('is-open');
    mobileUserSheet.inert=true;
    mobileUserSheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('mobile-user-sheet-active');
  }
});

/* Sticky-header search: icon turns into a close button and the search bar
   closes on an outside click or Escape. Clear X appears only while typing. */
const headerSearchToggle=document.getElementById('headerSearchToggle');
const headerSearchPanel=document.getElementById('headerSearchPanel');
const headerSearchInput=document.getElementById('headerSearchInput');
const headerSearchClear=document.getElementById('headerSearchClear');
// Anchor the mobile search overlay beneath the fixed-on-scroll navigation.
function updateMobileSearchTop(){
  if(!mobileNavMedia.matches)return;
  const nav=document.querySelector('.site-nav');
  if(nav){
    const bottom=Math.max(0,Math.round(nav.getBoundingClientRect().bottom));
    document.documentElement.style.setProperty('--mobile-search-top',bottom+'px');
  }
}
window.addEventListener('resize',updateMobileSearchTop,{passive:true});
window.addEventListener('scroll',updateMobileSearchTop,{passive:true});
mobileNavMedia.addEventListener('change',updateMobileSearchTop);
window.visualViewport?.addEventListener('resize',updateMobileSearchTop,{passive:true});
updateMobileSearchTop();

function setHeaderSearchOpen(open,restoreFocus=false){
  if(!headerSearchToggle||!headerSearchPanel)return;
  if(open&&mobileNavMedia.matches)updateMobileSearchTop();
  headerSearchPanel.classList.toggle('is-open',open);
  headerSearchPanel.inert=!open;
  headerSearchPanel.setAttribute('aria-hidden',String(!open));
  headerSearchToggle.setAttribute('aria-expanded',String(open));
  headerSearchToggle.setAttribute('aria-label',open?'Close search':'Open search');
  if(open){
    // Only desktop auto-focuses; mobile opens without keyboard or viewport changes.
    if(!mobileNavMedia.matches)headerSearchInput.focus({preventScroll:true});
  }else{
    if(headerSearchPanel.contains(document.activeElement))document.activeElement.blur();
    if(restoreFocus)headerSearchToggle.focus({preventScroll:true});
  }
}
headerSearchToggle?.addEventListener('click',()=>{
  const next=!headerSearchPanel.classList.contains('is-open');
  if(next)setMobileMenuOpen(false);
  setHeaderSearchOpen(next);
});
headerSearchPanel?.addEventListener('click',event=>{
  if(!event.target.closest('button')&&event.target!==headerSearchInput){
    headerSearchInput.focus({preventScroll:true});
  }
});
headerSearchInput?.addEventListener('input',()=>{
  headerSearchClear.hidden=headerSearchInput.value.length===0;
});
headerSearchClear?.addEventListener('click',()=>{
  headerSearchInput.value='';
  headerSearchClear.hidden=true;
  headerSearchInput.focus();
});
document.addEventListener('pointerdown',event=>{
  if(!headerSearchPanel?.classList.contains('is-open'))return;
  if(headerSearchPanel.contains(event.target)||headerSearchToggle.contains(event.target))return;
  setHeaderSearchOpen(false);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&headerSearchPanel?.classList.contains('is-open'))setHeaderSearchOpen(false,true);
});

const products=Array.from({length:8},(_,i)=>({item:'#'+(48720+i),name:'Product name',original:(19.99+i*2).toFixed(2),price:(14.99+i*2).toFixed(2)}));

class ProductCard {
 static render(product,index){
  return `<article class="card"><div class="picture" aria-label="Product image placeholder"></div><div class="card-info"><div class="item">Item ${product.item}</div><h2 class="product-title">${product.name}</h2><div class="purchase"><div class="prices"><span class="old">$${product.original}</span><strong class="new-price">$${product.price}</strong></div><button class="add" type="button" aria-label="Add product to cart" data-index="${index}"><svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button></div></div></article>`;
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

// Uniform section entrance: same restrained upward motion everywhere, no fading.
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const sections=document.querySelectorAll('.hero-video-content,.featured-panel,.new-section,.brands-inner,.categories-inner,.footer-inner');
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  });
 },{threshold:.08,rootMargin:'0px 0px -5% 0px'});
 sections.forEach(section=>{section.classList.add('section-enter');observer.observe(section)});
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
