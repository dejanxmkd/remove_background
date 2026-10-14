/* Landing build: purple burger nav + auth pricing/cart drawer + brand auto-rotation */
(function(){
  const sessionKey='td-preview-auth-v1';
  const toggle=document.getElementById('mobileMenuToggle');
  const panel=document.getElementById('mobileMenuPanel');
  const content=document.getElementById('mobileMenuContent');
  const cartItems=[];

  function isPreviewSignedIn(){
    try{return sessionStorage.getItem(sessionKey)==='true'}catch{return false}
  }

  function syncPreviewAuthState(){
    document.body.dataset.authPreview=String(isPreviewSignedIn());
    updateBurgerAuthState();
    syncCartDrawerState();
  }

  function menuIsOpen(){
    return !!(panel?.classList.contains('is-open') || toggle?.getAttribute('aria-expanded')==='true');
  }

  function syncMenuClass(){
    const open=menuIsOpen();
    document.body.classList.toggle('td-login-menu-open',open);
    panel?.classList.toggle('td-login-panel',true);
    if(open) ensureBurgerNav();
    updateBurgerAuthState();
  }

  function updateBurgerAuthState(){
    const authLink=content?.querySelector('.td-burger-login');
    if(!authLink)return;
    const signedIn=isPreviewSignedIn();
    authLink.textContent=signedIn?'Logout':'Login';
    authLink.href=signedIn?'#logout':'./login.html';
    authLink.setAttribute('aria-label',signedIn?'Log out and hide prices':'Open login page');
  }

  function ensureBurgerNav(){
    if(!content)return null;
    let nav=content.querySelector('.td-burger-nav');
    if(nav){updateBurgerAuthState();return nav;}
    const oldAuth=document.getElementById('menuAuthLink');
    if(oldAuth)oldAuth.remove();
    nav=document.createElement('nav');
    nav.className='td-burger-nav';
    nav.setAttribute('aria-label','Mobile menu links');
    nav.innerHTML=[
      '<a class="td-burger-link" href="#new-title">Link name</a>',
      '<a class="td-burger-link" href="#brands-title">Link name</a>',
      '<a class="td-burger-link" href="#categories-title">Link name</a>',
      '<a class="td-burger-link td-burger-contact" href="#contact">Contact us</a>',
      '<a class="td-burger-link td-burger-login" href="./login.html">Login</a>'
    ].join('');
    nav.addEventListener('click',event=>{
      const link=event.target.closest('a');
      if(!link)return;
      if(link.classList.contains('td-burger-login')){
        if(isPreviewSignedIn()){
          event.preventDefault();
          try{sessionStorage.removeItem(sessionKey)}catch{}
          document.body.dataset.authPreview='false';
          updateBurgerAuthState();
          closeCartDrawer();
          if(typeof setMobileMenuOpen==='function')setMobileMenuOpen(false);
          syncMenuClass();
        }
        return;
      }
      window.setTimeout(()=>{
        if(typeof setMobileMenuOpen==='function')setMobileMenuOpen(false);
        syncMenuClass();
      },0);
    });
    content.prepend(nav);
    updateBurgerAuthState();
    return nav;
  }

  function focusFirstMenuLink(){
    if(!menuIsOpen())return;
    window.setTimeout(()=>{
      const first=content?.querySelector('.td-burger-link');
      if(first && window.matchMedia('(min-width:761px)').matches) first.focus({preventScroll:true});
    },180);
  }

  function installProductPricing(){
    document.querySelectorAll('#productCarousel .card').forEach((card,index)=>{
      if(card.dataset.tdPricingReady==='true')return;
      card.dataset.tdPricingReady='true';
      const purchase=card.querySelector('.purchase');
      const request=card.querySelector('.request-price-link');
      if(!purchase || !request)return;
      const oldPrice=(19.99 + index*1.75).toFixed(2);
      const newPrice=(12.99 + index*1.35).toFixed(2);
      const prices=document.createElement('div');
      prices.className='prices td-product-prices';
      prices.innerHTML=`<span class="old">$${oldPrice}</span><span class="new-price" data-product-price>$${newPrice}</span>`;
      purchase.insertBefore(prices,request);
      const add=card.querySelector('.add');
      if(add){
        add.dataset.productName=card.querySelector('.product-title')?.textContent?.trim()||'Product name';
        add.dataset.productItem=card.querySelector('.item')?.textContent?.replace(/^Item\s*/,'').trim()||('#'+(48720+index));
        add.dataset.productPrice='$'+newPrice;
      }
    });
  }

  function ensureCartDrawer(){
    let drawer=document.getElementById('tdCartDrawer');
    if(drawer)return drawer;
    drawer=document.createElement('aside');
    drawer.id='tdCartDrawer';
    drawer.className='td-cart-drawer';
    drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML=[
      '<div class="td-cart-backdrop" data-cart-close></div>',
      '<section class="td-cart-panel" role="dialog" aria-modal="true" aria-labelledby="tdCartTitle">',
        '<button class="td-cart-close" type="button" data-cart-close aria-label="Close cart">×</button>',
        '<h2 id="tdCartTitle">Cart</h2>',
        '<div class="td-cart-items"></div>',
        '<div class="td-cart-total"><span>Total</span><strong>$0.00</strong></div>',
        '<button class="td-cart-checkout" type="button">Checkout demo</button>',
      '</section>'
    ].join('');
    document.body.append(drawer);
    drawer.addEventListener('click',event=>{
      if(event.target.closest('[data-cart-close]'))closeCartDrawer();
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&drawer.classList.contains('is-open'))closeCartDrawer();
    });
    return drawer;
  }

  function renderCartDrawer(){
    const drawer=ensureCartDrawer();
    const list=drawer.querySelector('.td-cart-items');
    const total=drawer.querySelector('.td-cart-total strong');
    if(!list||!total)return;
    if(!cartItems.length){
      list.innerHTML='<p class="td-cart-empty">Your cart is empty.</p>';
      total.textContent='$0.00';
      return;
    }
    list.innerHTML=cartItems.map(item=>`<div class="td-cart-item"><div><strong>${item.name}</strong><span>${item.item}</span></div><b>${item.price}</b></div>`).join('');
    const sum=cartItems.reduce((acc,item)=>acc+Number(item.price.replace(/[^0-9.]/g,'')),0);
    total.textContent='$'+sum.toFixed(2);
  }

  function openCartDrawer(){
    if(!isPreviewSignedIn()){
      window.location.assign('./login.html');
      return;
    }
    const drawer=ensureCartDrawer();
    renderCartDrawer();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('td-cart-open');
  }

  function closeCartDrawer(){
    const drawer=document.getElementById('tdCartDrawer');
    if(!drawer)return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('td-cart-open');
  }

  function syncCartDrawerState(){
    if(!isPreviewSignedIn())closeCartDrawer();
  }

  function installCartDrawer(){
    ensureCartDrawer();
    document.addEventListener('click',event=>{
      const add=event.target.closest('#productCarousel .add');
      if(add){
        if(!isPreviewSignedIn())return;
        cartItems.push({
          name:add.dataset.productName||'Product name',
          item:add.dataset.productItem||'Item',
          price:add.dataset.productPrice||'$0.00'
        });
        renderCartDrawer();
        return;
      }
      const cartButton=event.target.closest('#shoppingCart');
      if(cartButton){
        event.preventDefault();
        openCartDrawer();
      }
    },true);
  }

  function preferPngBrandLogos(){
    document.querySelectorAll('.brand-logo-img').forEach(img=>{
      if(img.dataset.tdPngPreferred==='true')return;
      const current=img.getAttribute('src')||'';
      if(!current.includes('/assets/brands/v2/') || !current.endsWith('.webp'))return;
      const png=current.replace(/\.webp(\?.*)?$/,'.png$1');
      const webp=current;
      img.dataset.tdPngPreferred='true';
      img.dataset.tdWebpFallback=webp;
      img.addEventListener('error',()=>{
        if(img.dataset.tdFallbackApplied==='true')return;
        img.dataset.tdFallbackApplied='true';
        img.src=webp;
      },{once:true});
      img.src=png;
    });
  }

  function classifyBrandLogos(){
    preferPngBrandLogos();
    document.querySelectorAll('.brand-logo-img').forEach(img=>{
      if(img.dataset.tdBalanced==='true')return;
      const name=(img.getAttribute('alt')||'').toLowerCase();
      img.dataset.tdBalanced='true';
      if(/jolly|sour patch|quest|ice breakers|david|lenny|lifesavers|ritter|sour power|swedish|true pinless|mike|pop tarts|popcorners/.test(name))img.classList.add('td-logo-wide');
      if(/m&m|oreo|raw|velo|zyn|alp|axe|kind|tide|twix|advil|tic tac/.test(name))img.classList.add('td-logo-compact');
      if(/hershey|kinder|pringles|takis|red bull|nutella|loacker|trident|skittles|snickers/.test(name))img.classList.add('td-logo-large');
      if(/trojan|always|tylenol|mentos|barebells/.test(name))img.classList.add('td-logo-small');
      if(/hostess|haribo|cheez|hi-chew|planters|duracell|keebler|one bar/.test(name))img.classList.add('td-logo-tall');
    });
  }

  function installBrandAutoRotate(){
    const rail=document.getElementById('brandCarousel');
    if(!rail || rail.dataset.tdAutoRotate==='true')return;
    rail.dataset.tdAutoRotate='true';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let paused=false;
    const wrap=rail.closest('.carousel-wrap') || rail;
    const setPause=value=>{paused=value};
    wrap.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')setPause(true)});
    wrap.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')setPause(false)});
    wrap.addEventListener('focusin',()=>setPause(true));
    wrap.addEventListener('focusout',()=>setPause(wrap.contains(document.activeElement)));
    wrap.addEventListener('touchstart',()=>setPause(true),{passive:true});
    wrap.addEventListener('touchend',()=>window.setTimeout(()=>setPause(false),1800),{passive:true});
    window.setInterval(()=>{
      if(paused || document.hidden || rail.matches(':active'))return;
      const card=rail.querySelector('.brand-card');
      const gap=parseFloat(getComputedStyle(rail).columnGap)||18;
      const step=card ? card.getBoundingClientRect().width + gap : rail.clientWidth*.7;
      rail.scrollBy({left:step,behavior:'smooth'});
    },3400);
  }

  ensureBurgerNav();
  installProductPricing();
  installCartDrawer();
  syncPreviewAuthState();
  syncMenuClass();
  classifyBrandLogos();
  installBrandAutoRotate();

  toggle?.addEventListener('click',()=>window.setTimeout(()=>{syncMenuClass();focusFirstMenuLink()},0));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')window.setTimeout(syncMenuClass,0)},true);

  if(panel){new MutationObserver(()=>{syncMenuClass();focusFirstMenuLink()}).observe(panel,{attributes:true,attributeFilter:['class','aria-hidden']});}
  const brandRail=document.getElementById('brandCarousel');
  if(brandRail){new MutationObserver(classifyBrandLogos).observe(brandRail,{childList:true,subtree:true});}
  const productRail=document.getElementById('productCarousel');
  if(productRail){new MutationObserver(installProductPricing).observe(productRail,{childList:true,subtree:true});}
})();
