/* Frontend preview session. Never stores credentials or grants real authentication. */
const previewSessionKey='td-preview-auth-v1';
const previewSignedIn=(()=>{
 try{return sessionStorage.getItem(previewSessionKey)==='true'}
 catch{return false}
})();
document.body.dataset.authPreview=String(previewSignedIn);

const heroVideo=document.querySelector('.hero-video-media');
if(heroVideo){
 heroVideo.defaultPlaybackRate=0.8;
 heroVideo.playbackRate=0.8;
}

/* Header Shopping For context. The cart badge and quantities are managed by
   landing-build.js, keyed by the selected shopping account. */
 const shoppingUserSelect=document.getElementById('shoppingUser');
 const shoppingCartButton=document.getElementById('shoppingCart');
 const shoppingCartCount=document.getElementById('cartCount');

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
const menuAuthLink=document.getElementById('menuAuthLink');
if(menuAuthLink){
 menuAuthLink.firstChild.textContent=previewSignedIn?'Log out (demo)':'Login / Create Account';
 if(previewSignedIn)menuAuthLink.href='./index.html';
 menuAuthLink.addEventListener('click',event=>{
  if(!previewSignedIn)return;
  event.preventDefault();
  try{sessionStorage.removeItem(previewSessionKey)}catch{}
  window.location.assign('./index.html');
 });
}

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
  if(!quickShopLink||!shoppingNavDivider||!shoppingUserBlock||!mobileMenuContent)return;
  setMobileMenuOpen(false);
  if(mobileNavMedia.matches){
    mobileMenuContent.append(shoppingUserBlock,quickShopLink,shoppingNavDivider);
  }else{
    shoppingNavControls.insertBefore(quickShopLink,mobileMenuToggle);
    shoppingNavControls.insertBefore(shoppingNavDivider,mobileMenuToggle);
    shoppingNavControls.insertBefore(shoppingUserBlock,mobileMenuToggle);
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
    mobileUserTrigger.focus({preventScroll:true});
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
  if(!event.target.closest('.mobile-user-sheet-grab,.mobile-user-sheet-header'))return;
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

const products=Array.from({length:8},(_,i)=>({item:'#'+(48720+i),name:'Product name'}));

/* Request Price: reliably open auth on desktop even inside draggable carousels.
   Normal middle-click / command-click continues to use the native anchor. */
document.addEventListener('click',event=>{
  const target=event.target;
  const link=target instanceof Element?target.closest('a.request-price-link'):null;
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  window.location.assign(link.href);
},true);

class ProductCard {
 static render(product,index){
  return `<article class="card"><div class="picture" aria-label="Product image placeholder"></div><div class="card-info"><div class="item">Item ${product.item}</div><h2 class="product-title">${product.name}</h2><div class="purchase"><a class="request-price-link" href="./login.html" aria-label="Request price for item ${product.item}">Request Price <svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-chevron-right" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a><button class="add" type="button" aria-label="Add product to cart" data-index="${index}"><svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button></div></div></article>`;
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
  // Only intercept the wheel for an explicit HORIZONTAL gesture
  // (trackpad swipe or Shift+wheel). Vertical wheel always scrolls the page.
  const horizontal=event.shiftKey?event.deltaY:event.deltaX;
  if(!event.shiftKey&&Math.abs(horizontal)<=Math.abs(event.deltaY))return;
  const raw=horizontal;
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
  if(event.pointerType!=='mouse'||event.target.closest('a, button, input, select, textarea'))return;
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

// Overlaid arrow controls use the same 40px circle as product-card plus actions.
function installCarouselArrows(slider,label){
 const wrap=slider.element.closest('.carousel-wrap');
 if(!wrap||wrap.querySelector('.carousel-arrow'))return;
 const create=direction=>{
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='carousel-arrow '+(direction<0?'carousel-arrow-prev':'carousel-arrow-next');
  btn.setAttribute('aria-label',(direction<0?'Previous ':'Next ')+label);
  btn.innerHTML=direction<0
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  btn.addEventListener('click',()=>{
   if(slider.advance)slider.advance(direction);
   else slider.animateTo(slider.element.scrollLeft+direction*slider.step());
  });
  return btn;
 };
 const prev=create(-1),next=create(1);
 wrap.append(prev,next);
 if(!slider.advance){
  const sync=()=>{
   const max=slider.max(),left=slider.element.scrollLeft;
   prev.disabled=left<1;next.disabled=left>=max-1;
   prev.hidden=max<2;next.hidden=max<2;
  };
  slider.element.addEventListener('scroll',sync,{passive:true});
  window.addEventListener('resize',sync);
  sync();
 }
}

const carousel=new ProductCarousel(document.getElementById('productCarousel'),products,document.getElementById('progress'));
installCarouselArrows(carousel,'products');
let noticeTimer;
function notify(message){const el=document.getElementById('notice');el.textContent=message;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),2300)}
carousel.element.addEventListener('click',event=>{if(event.target.closest('.add'))notify('Product added — demo only')});



// Brand cards share the carousel's scrolling, progress and responsive behavior.
class BrandCard {
 static render(brand,index){return `<article class="card brand-card"><div class="brand-picture"><img class="brand-logo-img" src="${brand.image}" alt="${brand.name} logo" loading="lazy" decoding="async" width="640" height="640"></div><div class="brand-info"><h3 class="brand-name">${brand.name}</h3></div></article>`;}
}
const brands=[
 {name:"Airheads",image:'./assets/brands/v2/01-airheads.webp'},
 {name:"Altoids",image:'./assets/brands/v2/02-altoids.webp'},
 {name:"Barebells",image:'./assets/brands/v2/03-barebells.webp'},
 {name:"Giannos",image:'./assets/brands/v2/04-giannos.webp'},
 {name:"Hersheys",image:'./assets/brands/v2/05-hersheys.webp'},
 {name:"Ice Breakers",image:'./assets/brands/v2/06-ice-breakers.webp'},
 {name:"Jolly Rancher",image:'./assets/brands/v2/07-jolly-rancher.webp'},
 {name:"Kidsmania",image:'./assets/brands/v2/08-kidsmania.webp'},
 {name:"Kinder",image:'./assets/brands/v2/09-kinder.webp'},
 {name:"M&M's",image:'./assets/brands/v2/10-m-m-s.webp'},
 {name:"Nerds",image:'./assets/brands/v2/11-nerds.webp'},
 {name:"Oreo",image:'./assets/brands/v2/12-oreo.webp'},
 {name:"Pringles",image:'./assets/brands/v2/13-pringles.webp'},
 {name:"Quest Protein",image:'./assets/brands/v2/14-quest-protein.webp'},
 {name:"Reese's",image:'./assets/brands/v2/15-reese-s.webp'},
 {name:"Sour Patch Kids",image:'./assets/brands/v2/16-sour-patch-kids.webp'},
 {name:"Trolli",image:'./assets/brands/v2/17-trolli.webp'},
 {name:"Cheez-It",image:'./assets/brands/v2/18-cheez-it.webp'},
 {name:"Haribo",image:'./assets/brands/v2/19-haribo.webp'},
 {name:"Hi-Chew",image:'./assets/brands/v2/20-hi-chew.webp'},
 {name:"Hostess",image:'./assets/brands/v2/21-hostess.webp'},
 {name:"Mentos",image:'./assets/brands/v2/22-mentos.webp'},
 {name:"Milka",image:'./assets/brands/v2/23-milka.webp'},
 {name:"Planters",image:'./assets/brands/v2/24-planters.webp'},
 {name:"RAW",image:'./assets/brands/v2/25-raw.webp'},
 {name:"Trident",image:'./assets/brands/v2/26-trident.webp'},
 {name:"VELO",image:'./assets/brands/v2/27-velo.webp'},
 {name:"ZYN",image:'./assets/brands/v2/28-zyn.webp'},
 {name:"Mike and Ike",image:'./assets/brands/v2/29-mike-and-ike.webp'},
 {name:"Starburst",image:'./assets/brands/v2/30-starburst.webp'},
 {name:"Takis",image:'./assets/brands/v2/31-takis.webp'},
 {name:"Tic Tac",image:'./assets/brands/v2/32-tic-tac.webp'},
 {name:"Tide",image:'./assets/brands/v2/33-tide.webp'},
 {name:"Trojan",image:'./assets/brands/v2/34-trojan.webp'},
 {name:"Twix",image:'./assets/brands/v2/35-twix.webp'},
 {name:"Advil",image:'./assets/brands/v2/36-advil.webp'},
 {name:"ALP",image:'./assets/brands/v2/37-alp.webp'},
 {name:"Always",image:'./assets/brands/v2/38-always.webp'},
 {name:"Amos",image:'./assets/brands/v2/39-amos.webp'},
 {name:"AXE",image:'./assets/brands/v2/40-axe.webp'},
 {name:"Davids Seeds",image:'./assets/brands/v2/41-davids-seeds.webp'},
 {name:"Duracell",image:'./assets/brands/v2/42-duracell.webp'},
 {name:"Keebler",image:'./assets/brands/v2/43-keebler.webp'},
 {name:"KIND",image:'./assets/brands/v2/44-kind.webp'},
 {name:"Lays",image:'./assets/brands/v2/45-lays.webp'},
 {name:"Lenny & Larrys",image:'./assets/brands/v2/46-lenny-larrys.webp'},
 {name:"Lifesavers",image:'./assets/brands/v2/47-lifesavers.webp'},
 {name:"Listerine",image:'./assets/brands/v2/48-listerine.webp'},
 {name:"Loacker",image:'./assets/brands/v2/49-loacker.webp'},
 {name:"Nutella",image:'./assets/brands/v2/50-nutella.webp'},
 {name:"One Bar",image:'./assets/brands/v2/51-one-bar.webp'},
 {name:"Pop Tarts",image:'./assets/brands/v2/52-pop-tarts.webp'},
 {name:"Popcorners",image:'./assets/brands/v2/53-popcorners.webp'},
 {name:"Red Bull",image:'./assets/brands/v2/54-red-bull.webp'},
 {name:"Ritter Sport",image:'./assets/brands/v2/55-ritter-sport.webp'},
 {name:"Sahale",image:'./assets/brands/v2/56-sahale.webp'},
 {name:"Skittles",image:'./assets/brands/v2/57-skittles.webp'},
 {name:"Slim Jim",image:'./assets/brands/v2/58-slim-jim.webp'},
 {name:"Snickers",image:'./assets/brands/v2/59-snickers.webp'},
 {name:"Sour Power Straws",image:'./assets/brands/v2/60-sour-power-straws.webp'},
 {name:"Swedish Fish",image:'./assets/brands/v2/61-swedish-fish.webp'},
 {name:"True Pinless",image:'./assets/brands/v2/62-true-pinless.webp'},
 {name:"Tylenol",image:'./assets/brands/v2/63-tylenol.webp'}
];
// 63 randomly ordered brand cards loop seamlessly through three matching copies.
class LoopingBrandCarousel extends ProductCarousel {
 constructor(element,items,progress,renderCard){
  const order=[...items];
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  super(element,[...order,...order,...order],progress,renderCard);
  this.element.classList.add('is-infinite-carousel');
  this.cycle=()=>this.element.scrollWidth/3;
  this.element.scrollLeft=this.cycle();this.target=this.element.scrollLeft;
  this.hoverPaused=false;this.focusPaused=false;this.touchUntil=0;this.manualUntil=0;this.lastTick=0;
  this.element.addEventListener('scroll',()=>this.recenter(),{passive:true});
  const area=this.element.closest('.carousel-wrap');
  area.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')this.hoverPaused=true});
  area.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')this.hoverPaused=false});
  area.addEventListener('focusin',()=>{this.focusPaused=true});
  area.addEventListener('focusout',()=>{this.focusPaused=area.contains(document.activeElement)});
  area.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')this.touchUntil=performance.now()+3500});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   // Suspend animation while the brand rail is outside the viewport.
   this.isVisible=false;
   if('IntersectionObserver' in window){
    const visibility=new IntersectionObserver(entries=>{
     this.isVisible=entries[0]?.isIntersecting===true;
     this.lastTick=0;
    },{rootMargin:'100px 0px'});
    visibility.observe(this.element);
   }else{this.isVisible=true}
   const loop=now=>{
    if(!this.lastTick)this.lastTick=now;
    const elapsed=Math.min(64,now-this.lastTick);this.lastTick=now;
    if(this.isVisible&&!document.hidden&&!this.hoverPaused&&!this.focusPaused&&!this.drag&&now>this.manualUntil&&now>this.touchUntil&&!this.frame){
     this.element.scrollLeft+=elapsed*.085;
    }
    requestAnimationFrame(loop);
   };
   requestAnimationFrame(loop);
  }
 }
 recenter(){
  const span=this.cycle();if(!span)return;
  const x=this.element.scrollLeft;
  if(x<span*.55){this.element.scrollLeft=x+span;this.target+=span}
  else if(x>span*2.45){this.element.scrollLeft=x-span;this.target-=span}
 }
 advance(direction){this.manualUntil=performance.now()+2800;this.animateTo(this.element.scrollLeft+direction*this.step())}
 reset(){this.manualUntil=performance.now()+2800;this.animateTo(this.cycle())}
}
const brandCarousel=new LoopingBrandCarousel(document.getElementById('brandCarousel'),brands,document.getElementById('brandProgress'),BrandCard.render);
installCarouselArrows(brandCarousel,'brands');
brandCarousel.element.addEventListener('click',event=>{const link=event.target.closest('[data-brand]');if(link){event.preventDefault();notify('Brand page — demo only')}});
['viewAllBrands','mobileViewAllBrands'].forEach(id=>document.getElementById(id)?.addEventListener('click',event=>{event.preventDefault();brandCarousel.reset();notify('Showing all 63 brands')}));

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
 static render(category){return `<article class="card category-card"><div class="category-visual"><img class="category-image" src="${category.image}" alt="${category.name} products" loading="lazy" decoding="async" width="480" height="480"></div><div class="category-footer"><span>${category.name}</span></div></article>`;}
}
const categories=[
 {name:'Candy',icon:'candy',image:'./assets/categories/01-candy.webp'},
 {name:'Chips & Snacks',icon:'nutrition',image:'./assets/categories/02-chips-snacks.webp'},
 {name:'Chocolate',icon:'cookie',image:'./assets/categories/03-chocolate.webp'},
 {name:'Coffee',icon:'coffee',image:'./assets/categories/04-coffee.webp'},
 {name:'European Products',icon:'shopping_bag',image:'./assets/categories/05-european-products.webp'},
 {name:'Grocery',icon:'shopping_basket',image:'./assets/categories/06-grocery.webp'},
 {name:'Variety Packs',icon:'inventory_2',image:'./assets/categories/07-variety-packs-purple.webp'},
 {name:'Olive Oil',icon:'water_drop',image:'./assets/categories/08-olive-oil.webp'},
 {name:'Tools',icon:'handyman',image:'./assets/categories/09-tools.webp'},
 {name:'Health & Beauty',icon:'health_and_beauty',image:'./assets/categories/10-health-beauty.webp'},
 {name:'Cleaning',icon:'cleaning_services',image:'./assets/categories/11-cleaning.webp'},
 {name:'Personal Care',icon:'spa',image:'./assets/categories/12-personal-care.webp'},
 {name:'Nutrition',icon:'fitness_center',image:'./assets/categories/13-nutrition.webp'},
 {name:'Tobacco Accessories',icon:'package_2',image:'./assets/categories/14-tobacco-accessories.webp'},
 {name:'Popcorn & Pretzels',icon:'fastfood',image:'./assets/categories/15-popcorn-pretzels.webp'}
];
const categoryCarousel=new ProductCarousel(document.getElementById('categoryCarousel'),categories,document.getElementById('categoryProgress'),CategoryCard.render);
installCarouselArrows(categoryCarousel,'product categories');



/* Featured sections reuse the New Arrivals product carousel and card rendering. */
const dealsHost=document.getElementById('dealsProducts');
const sellersHost=document.getElementById('bestSellerProducts');
if(dealsHost&&sellersHost){
 const dealsCarousel=new ProductCarousel(dealsHost,products.slice(0,2),document.getElementById('dealsProgress'),(product,i)=>ProductCard.render(product,i));
 const sellersCarousel=new ProductCarousel(sellersHost,products.slice(2,4),document.getElementById('bestSellerProgress'),(product,i)=>ProductCard.render(product,i+2));
 installCarouselArrows(dealsCarousel,'top deals');
 installCarouselArrows(sellersCarousel,'best sellers');
 [dealsCarousel,sellersCarousel].forEach(slider=>{
  slider.element.addEventListener('click',event=>{
   if(event.target.closest('.add'))notify('Product added — demo only');
  });
 });
}
