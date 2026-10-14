/* Landing build: nav, auth pricing, quantity modal, cart, brands, transitions */
(()=>{
 const key='td-preview-auth-v1';
 const railSel='#productCarousel,#dealsProducts,#bestSellerProducts';
 const cardSel='#productCarousel .card,#dealsProducts .card,#bestSellerProducts .card';
 const addSel='#productCarousel .add,#dealsProducts .add,#bestSellerProducts .add';
 const toggle=document.getElementById('mobileMenuToggle');
 const panel=document.getElementById('mobileMenuPanel');
 const content=document.getElementById('mobileMenuContent');
 const cart=[];
 let brandLock=false,closingMenu=false,cartScrollY=0;
 const signed=()=>{try{return sessionStorage.getItem(key)==='true'}catch{return false}};
 const money=v=>Number(String(v).replace(/[^0-9.]/g,''))||0;
 const show=(el,v)=>el&&el.style.setProperty('display',v,'important');
 const toast=msg=>{if(typeof notify==='function')notify(msg);else{const n=document.getElementById('notice');if(n){n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2300)}}};
 const lockCartScroll=()=>{
  if(document.body.dataset.tdCartLocked==='true')return;
  cartScrollY=window.scrollY||document.documentElement.scrollTop||0;
  const gap=Math.max(0,window.innerWidth-document.documentElement.clientWidth);
  document.body.dataset.tdCartLocked='true';
  document.body.style.setProperty('--td-scrollbar-gap',gap+'px');
  document.body.style.position='fixed';
  document.body.style.top=`-${cartScrollY}px`;
  document.body.style.left='0';
  document.body.style.right='0';
  document.body.style.width='100%';
  if(gap)document.body.style.paddingRight=gap+'px';
 };
 const unlockCartScroll=()=>{
  if(document.body.dataset.tdCartLocked!=='true')return;
  const y=cartScrollY;
  document.body.dataset.tdCartLocked='false';
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.left='';
  document.body.style.right='';
  document.body.style.width='';
  document.body.style.paddingRight='';
  document.body.style.removeProperty('--td-scrollbar-gap');
  window.scrollTo(0,y);
 };
 const icon={
  x:'<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-x" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus:'<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  minus:'<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-minus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  trash:'<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-trash-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>'
 };

 function pageTransition(){
  let t=document.querySelector('.td-page-transition');
  if(!t){t=document.createElement('div');t.className='td-page-transition';document.body.append(t)}
  requestAnimationFrame(()=>document.body.classList.add('td-page-ready'));
  document.addEventListener('click',e=>{
   const a=e.target.closest('a[href]');
   if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;
   const href=a.getAttribute('href')||'';
   if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:'))return;
   e.preventDefault();
   document.body.classList.add('td-page-leaving');
   setTimeout(()=>{window.location.href=a.href},360);
  },true);
 }

 function isMenuOpen(){return !!(panel?.classList.contains('is-open')||toggle?.getAttribute('aria-expanded')==='true')}
 function closeMenuAnimated(){
  if(!isMenuOpen()||closingMenu)return;
  closingMenu=true;
  document.body.classList.add('td-menu-closing');
  setTimeout(()=>{
   if(typeof setMobileMenuOpen==='function')setMobileMenuOpen(false,true);
   else panel?.classList.remove('is-open');
   document.body.classList.remove('td-login-menu-open','td-menu-closing');
   closingMenu=false;
  },300);
 }
 function syncMenuClass(){
  if(closingMenu)return;
  const open=isMenuOpen();
  document.body.classList.toggle('td-login-menu-open',open);
  panel?.classList.toggle('td-login-panel',true);
  if(open){burger();document.body.classList.add('td-menu-opening');setTimeout(()=>document.body.classList.remove('td-menu-opening'),560)}
  burgerState();
 }
 function burgerState(){const a=content?.querySelector('.td-burger-login');if(!a)return;const s=signed();a.textContent=s?'Logout':'Login';a.href=s?'#logout':'./login.html'}
 function burger(){
  if(!content)return;
  content.querySelector('#menuAuthLink')?.remove();
  let n=content.querySelector('.td-burger-nav');
  if(!n){n=document.createElement('nav');n.className='td-burger-nav';content.prepend(n)}
  n.innerHTML=['<a class="td-burger-link" href="#top">Home</a>','<a class="td-burger-link" href="#new-title">Link name</a>','<a class="td-burger-link" href="#brands-title">Link name</a>','<a class="td-burger-link" href="#categories-title">Link name</a>','<a class="td-burger-link td-burger-contact" href="#footer">Contact us</a>','<a class="td-burger-link td-burger-login" href="./login.html">Login</a>'].join('');
  if(n.dataset.bound==='1'){burgerState();return}
  n.dataset.bound='1';
  n.addEventListener('click',e=>{
   const a=e.target.closest('a');if(!a)return;
   if(a.classList.contains('td-burger-login')&&signed()){
    e.preventDefault();try{sessionStorage.removeItem(key)}catch{};sync();closeCart();closeMenuAnimated();return;
   }
   if(a.getAttribute('href')?.startsWith('#'))setTimeout(closeMenuAnimated,0);
  });
  burgerState();
 }

 function sync(){document.body.dataset.authPreview=String(signed());burgerState();productState();if(!signed())closeCart();badge()}
 function pricing(){
  document.querySelectorAll(cardSel).forEach((card,i)=>{
   const purchase=card.querySelector('.purchase'),request=card.querySelector('.request-price-link');
   if(!purchase||!request)return;
   const off=card.closest('#dealsProducts')?100:card.closest('#bestSellerProducts')?200:0;
   const old=(19.99+(off+i)*.75).toFixed(2),now=(12.99+(off+i)*.55).toFixed(2);
   if(card.dataset.priced!=='1'){
    card.dataset.priced='1';
    const d=document.createElement('div');d.className='prices td-product-prices';
    d.innerHTML=`<span class="old">$${old}</span><span class="new-price" data-product-price>$${now}</span>`;
    purchase.insertBefore(d,request);
   }
   const b=card.querySelector('.add');
   if(b){b.dataset.name=card.querySelector('.product-title')?.textContent?.trim()||'Product name';b.dataset.item=card.querySelector('.item')?.textContent?.replace(/^Item\s*/,'').trim()||('#'+(48720+i));b.dataset.price='$'+now;b.setAttribute('aria-label','Choose quantity and add product to cart')}
  });
  productState();
 }
 function productState(){
  const s=signed();
  document.querySelectorAll(cardSel).forEach(card=>{
   show(card.querySelector('.request-price-link'),s?'none':'inline-flex');
   show(card.querySelector('.add'),s?'grid':'none');
   show(card.querySelector('.prices'),s?'flex':'none');
   show(card.querySelector('.old'),s?'block':'none');
   show(card.querySelector('.new-price,[data-product-price]'),s?'block':'none');
  });
  show(document.getElementById('shoppingCart'),s?'inline-grid':'none');
 }

 function qtyModal(){
  let m=document.getElementById('tdQuantityModal');if(m)return m;
  m=document.createElement('aside');m.id='tdQuantityModal';m.className='td-qty-modal';m.setAttribute('aria-hidden','true');
  m.innerHTML='<div class="td-qty-backdrop" data-close></div><section class="td-qty-panel" role="dialog" aria-modal="true"><button class="td-qty-close" type="button" data-close aria-label="Close">'+icon.x+'</button><p class="td-qty-kicker">Add to cart</p><h2 class="td-qty-title">Product name</h2><p class="td-qty-meta"></p><div class="td-qty-row"><button class="td-qty-step" type="button" data-step="-1" aria-label="Decrease quantity">'+icon.minus+'</button><input class="td-qty-input" type="number" min="1" step="1" value="1"><button class="td-qty-step" type="button" data-step="1" aria-label="Increase quantity">'+icon.plus+'</button></div><button class="td-qty-submit" type="button">Add to cart</button></section>';
  document.body.append(m);
  m.addEventListener('click',e=>{
   if(e.target.closest('[data-close]'))closeQty();
   const st=e.target.closest('[data-step]');
   if(st){const input=m.querySelector('.td-qty-input');input.value=String(Math.max(1,(parseInt(input.value,10)||1)+Number(st.dataset.step)))}
   if(e.target.closest('.td-qty-submit')){const q=Math.max(1,parseInt(m.querySelector('.td-qty-input').value,10)||1);addCart({key:m.dataset.item,name:m.dataset.name,item:m.dataset.item,price:m.dataset.price,qty:q});closeQty();toast('Product added to cart')}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('is-open'))closeQty()});
  return m;
 }
 function openQty(b){if(!signed()){location.assign('./login.html');return}const m=qtyModal();m.dataset.name=b.dataset.name||'Product name';m.dataset.item=b.dataset.item||'Item';m.dataset.price=b.dataset.price||'$0.00';m.querySelector('.td-qty-title').textContent=m.dataset.name;m.querySelector('.td-qty-meta').textContent=`${m.dataset.item} · ${m.dataset.price}`;m.querySelector('.td-qty-input').value='1';m.classList.add('is-open');m.setAttribute('aria-hidden','false');document.body.classList.add('td-qty-open')}
 function closeQty(){const m=document.getElementById('tdQuantityModal');if(!m)return;m.classList.remove('is-open');m.setAttribute('aria-hidden','true');document.body.classList.remove('td-qty-open')}

 function drawer(){
  let d=document.getElementById('tdCartDrawer');if(d)return d;
  d=document.createElement('aside');d.id='tdCartDrawer';d.className='td-cart-drawer';d.setAttribute('aria-hidden','true');
  d.innerHTML='<div class="td-cart-backdrop" data-close></div><section class="td-cart-panel" role="dialog" aria-modal="true"><button class="td-cart-close" type="button" data-close aria-label="Close cart">'+icon.x+'</button><h2>Cart</h2><div class="td-cart-items"></div><div class="td-cart-total"><span>Total</span><strong>$0.00</strong></div><button class="td-cart-checkout" type="button">Checkout</button></section>';
  document.body.append(d);
  d.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeCart();const rm=e.target.closest('[data-remove]');if(rm){cart.splice(Number(rm.dataset.remove),1);renderCart();badge()}const q=e.target.closest('[data-qty]');if(q){const it=cart[Number(q.dataset.qty)];if(it){it.qty=Math.max(1,it.qty+Number(q.dataset.step));renderCart();badge()}}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&d.classList.contains('is-open'))closeCart()});
  return d;
 }
 function addCart(x){const old=cart.find(i=>i.key===x.key);old?old.qty+=x.qty:cart.push(x);renderCart();badge()}
 function badge(){const n=cart.reduce((s,i)=>s+i.qty,0),b=document.getElementById('cartCount'),btn=document.getElementById('shoppingCart');if(b){b.textContent=String(n);b.hidden=n===0}if(btn)btn.setAttribute('aria-label',`Shopping cart, ${n} ${n===1?'item':'items'}`)}
 function renderCart(){const d=drawer(),list=d.querySelector('.td-cart-items'),total=d.querySelector('.td-cart-total strong');if(!cart.length){list.innerHTML='<p class="td-cart-empty">Your cart is empty.</p>';total.textContent='$0.00';return}list.innerHTML=cart.map((i,x)=>`<div class="td-cart-item"><div class="td-cart-item-main"><strong>${i.name}</strong><span>${i.item}</span><div class="td-cart-qty"><button type="button" data-qty="${x}" data-step="-1" aria-label="Decrease quantity">${icon.minus}</button><em>${i.qty}</em><button type="button" data-qty="${x}" data-step="1" aria-label="Increase quantity">${icon.plus}</button></div></div><div class="td-cart-item-side"><button class="td-cart-remove" type="button" data-remove="${x}" aria-label="Remove item">${icon.trash}</button><b>$${(money(i.price)*i.qty).toFixed(2)}</b></div></div>`).join('');total.textContent='$'+cart.reduce((s,i)=>s+money(i.price)*i.qty,0).toFixed(2)}
 function openCart(){if(!signed()){location.assign('./login.html');return}const d=drawer();renderCart();lockCartScroll();d.classList.add('is-open');d.setAttribute('aria-hidden','false');document.body.classList.add('td-cart-open')}
 function closeCart(){const d=document.getElementById('tdCartDrawer');if(!d)return;d.classList.remove('is-open');d.setAttribute('aria-hidden','true');document.body.classList.remove('td-cart-open');unlockCartScroll()}

 function pngBrands(){document.querySelectorAll('.brand-logo-img').forEach(img=>{if(img.dataset.tdPngPreferred==='true')return;const src=img.getAttribute('src')||'';if(!src.includes('/assets/brands/v2/')||!src.endsWith('.webp'))return;const webp=src;img.dataset.tdPngPreferred='true';img.addEventListener('error',()=>{if(img.dataset.fallback)return;img.dataset.fallback='1';img.src=webp},{once:true});img.src=src.replace(/\.webp(\?.*)?$/,'.png$1')})}
 function uniqueBrands(){const rail=document.getElementById('brandCarousel');if(!rail||brandLock)return;const all=[...rail.querySelectorAll('.brand-card')];if(!all.length)return;brandLock=true;const seen=new Set();all.forEach(card=>{const name=(card.querySelector('.brand-name')?.textContent||card.textContent||'').trim().toLowerCase();if(seen.has(name))card.remove();else seen.add(name)});brandLock=false}
 function resetBrandProgress(){const rail=document.getElementById('brandCarousel'),bar=document.getElementById('brandProgress');if(rail){rail.scrollTo({left:0,behavior:'auto'});rail.dataset.tdAtStart='true'}if(bar){bar.style.width='20%';bar.style.transform='translateX(0px)';bar.parentElement?.setAttribute('aria-valuenow','0')}}
 function autoBrands(){const rail=document.getElementById('brandCarousel');if(!rail||rail.dataset.tdAutoRotate==='true')return;rail.dataset.tdAutoRotate='true';if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;let paused=false,wrap=rail.closest('.carousel-wrap')||rail;wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')paused=true});wrap.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')paused=false});setInterval(()=>{if(paused||document.hidden)return;uniqueBrands();const max=Math.max(0,rail.scrollWidth-rail.clientWidth),c=rail.querySelector('.brand-card'),gap=parseFloat(getComputedStyle(rail).columnGap)||18,step=c?c.getBoundingClientRect().width+gap:rail.clientWidth*.7;if(max<2)return;if(rail.scrollLeft>=max-step*.35)rail.scrollTo({left:0,behavior:'smooth'});else rail.scrollBy({left:step,behavior:'smooth'})},3400)}

 pageTransition();burger();pricing();drawer();qtyModal();sync();syncMenuClass();uniqueBrands();pngBrands();resetBrandProgress();autoBrands();setTimeout(resetBrandProgress,120);setTimeout(resetBrandProgress,700);
 toggle?.addEventListener('click',e=>{if(isMenuOpen()){e.preventDefault();e.stopImmediatePropagation();closeMenuAnimated();return}setTimeout(()=>{syncMenuClass();content?.querySelector('.td-burger-link')?.focus({preventScroll:true})},0)},true);
 document.addEventListener('click',e=>{const add=e.target.closest(addSel);if(add){e.preventDefault();e.stopImmediatePropagation();openQty(add);return}const cartBtn=e.target.closest('#shoppingCart');if(cartBtn){e.preventDefault();e.stopImmediatePropagation();openCart()}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isMenuOpen())closeMenuAnimated()},true);
 if(panel)new MutationObserver(syncMenuClass).observe(panel,{attributes:true,attributeFilter:['class','aria-hidden']});
 document.querySelectorAll(railSel).forEach(r=>new MutationObserver(()=>{pricing();productState()}).observe(r,{childList:true,subtree:true}));
 const br=document.getElementById('brandCarousel');if(br)new MutationObserver(()=>{uniqueBrands();pngBrands();resetBrandProgress()}).observe(br,{childList:true,subtree:true});
})();