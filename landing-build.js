/* True Distributors landing interaction layer
   Components: design tokens, auth state, burger menu, product auth, quantity sheet, cart drawer, brand carousel, page transitions. */
(()=>{
  'use strict';

  const SELECTORS={
    productRails:'#productCarousel,#dealsProducts,#bestSellerProducts',
    productCards:'#productCarousel .card,#dealsProducts .card,#bestSellerProducts .card',
    addButtons:'#productCarousel .add,#dealsProducts .add,#bestSellerProducts .add',
    brandRail:'#brandCarousel'
  };
  const AUTH_KEY='td-preview-auth-v1';
  const money=value=>Number(String(value||'').replace(/[^0-9.]/g,''))||0;
  const isSignedIn=()=>{try{return sessionStorage.getItem(AUTH_KEY)==='true'}catch{return false}};
  const setDisplay=(el,value)=>el&&el.style.setProperty('display',value,'important');
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));

  const Notify={
    show(message){
      if(typeof window.notify==='function'){window.notify(message);return}
      const el=$('#notice');
      if(!el)return;
      el.textContent=message;
      el.classList.add('show');
      clearTimeout(this.timer);
      this.timer=setTimeout(()=>el.classList.remove('show'),2200);
    }
  };

  const Auth={
    sync(){
      const signed=isSignedIn();
      document.body.dataset.authPreview=String(signed);
      ProductCards.syncVisibility();
      BurgerMenu.syncAuthLabel();
      CartDrawer.syncHeader();
      if(!signed)CartDrawer.close();
    },
    logout(){
      try{sessionStorage.removeItem(AUTH_KEY)}catch{}
      this.sync();
    }
  };

  const PageTransition={
    init(){
      if($('#tdPageTransition'))return;
      const overlay=document.createElement('div');
      overlay.id='tdPageTransition';
      overlay.className='td-page-transition is-loading';
      document.body.append(overlay);
      requestAnimationFrame(()=>overlay.classList.add('is-ready'));
      window.addEventListener('pageshow',()=>overlay.classList.add('is-ready'));
      document.addEventListener('click',event=>{
        const link=event.target.closest('a[href]');
        if(!link||event.defaultPrevented)return;
        const href=link.getAttribute('href')||'';
        if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:'))return;
        if(link.target==='_blank'||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();
        overlay.classList.remove('is-ready');
        overlay.classList.add('is-leaving');
        setTimeout(()=>{window.location.assign(link.href)},360);
      },true);
    }
  };

  const BurgerMenu={
    toggle:$('#mobileMenuToggle'),
    panel:$('#mobileMenuPanel'),
    content:$('#mobileMenuContent'),
    init(){
      if(!this.toggle||!this.panel||!this.content)return;
      this.build();
      this.panel.classList.add('td-menu-panel');
      this.toggle.addEventListener('click',event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        this.isOpen()?this.close():this.open();
      },true);
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.isOpen())this.close()});
      document.addEventListener('pointerdown',event=>{
        if(!this.isOpen())return;
        if(this.panel.contains(event.target)||this.toggle.contains(event.target))return;
        this.close();
      });
      this.syncAuthLabel();
    },
    isOpen(){return this.panel?.classList.contains('is-open')},
    build(){
      this.content.querySelector('#menuAuthLink')?.remove();
      let nav=this.content.querySelector('.td-menu-nav');
      if(!nav){
        nav=document.createElement('nav');
        nav.className='td-menu-nav';
        nav.setAttribute('aria-label','Main menu');
        this.content.replaceChildren(nav);
      }
      nav.innerHTML=[
        ['#top','Home',''],
        ['#new-title','Link name',''],
        ['#brands-title','Link name',''],
        ['#categories-title','Link name',''],
        ['#footer','Contact us','td-menu-contact'],
        ['./login.html','Login','td-menu-auth']
      ].map(([href,label,cls])=>`<a class="td-menu-link ${cls}" href="${href}">${label}</a>`).join('');
      nav.addEventListener('click',event=>{
        const link=event.target.closest('a');
        if(!link)return;
        if(link.classList.contains('td-menu-auth')&&isSignedIn()){
          event.preventDefault();
          Auth.logout();
          this.close();
          return;
        }
        if((link.getAttribute('href')||'').startsWith('#')){
          setTimeout(()=>this.close(),40);
        }
      });
    },
    syncAuthLabel(){
      const link=this.content?.querySelector('.td-menu-auth');
      if(!link)return;
      const signed=isSignedIn();
      link.textContent=signed?'Logout':'Login';
      link.href=signed?'#logout':'./login.html';
    },
    open(){
      this.build();
      this.panel.classList.remove('is-closing');
      this.panel.classList.add('is-open','is-opening');
      this.panel.inert=false;
      this.panel.setAttribute('aria-hidden','false');
      this.toggle.setAttribute('aria-expanded','true');
      this.toggle.setAttribute('aria-label','Close menu');
      document.body.classList.add('td-menu-open');
      setTimeout(()=>this.panel.classList.remove('is-opening'),460);
    },
    close(){
      if(!this.isOpen())return;
      this.panel.classList.remove('is-opening');
      this.panel.classList.add('is-closing');
      document.body.classList.add('td-menu-closing');
      setTimeout(()=>{
        this.panel.classList.remove('is-open','is-closing');
        this.panel.inert=true;
        this.panel.setAttribute('aria-hidden','true');
        this.toggle.setAttribute('aria-expanded','false');
        this.toggle.setAttribute('aria-label','Open menu');
        document.body.classList.remove('td-menu-open','td-menu-closing');
      },360);
    }
  };

  const ProductCards={
    init(){
      this.enhanceAll();
      this.observe();
      document.addEventListener('click',event=>{
        const add=event.target.closest(SELECTORS.addButtons);
        if(!add)return;
        event.preventDefault();
        event.stopImmediatePropagation();
        QuantitySheet.open(add.dataset.productId);
      },true);
    },
    rails(){return $$(SELECTORS.productRails)},
    cards(){return $$(SELECTORS.productCards)},
    sectionOffset(card){
      if(card.closest('#dealsProducts'))return 100;
      if(card.closest('#bestSellerProducts'))return 200;
      return 0;
    },
    enhanceAll(){
      this.cards().forEach((card,index)=>this.enhance(card,index));
      this.syncVisibility();
    },
    enhance(card,index){
      const purchase=$('.purchase',card);
      const request=$('.request-price-link',card);
      const add=$('.add',card);
      if(!purchase||!request||!add)return;
      const offset=this.sectionOffset(card);
      const base=offset+index;
      const oldPrice=(19.99+base*.75).toFixed(2);
      const price=(12.99+base*.55).toFixed(2);
      if(!$('.td-price-block',card)){
        const prices=document.createElement('div');
        prices.className='prices td-price-block';
        prices.innerHTML=`<span class="old">$${oldPrice}</span><span class="new-price" data-product-price>$${price}</span>`;
        purchase.insertBefore(prices,request);
      }
      const item=$('.item',card)?.textContent?.replace(/^Item\s*/,'').trim()||`#${48720+index}`;
      const name=$('.product-title',card)?.textContent?.trim()||'Product name';
      const id=`${item}-${card.closest('.carousel')?.id||'products'}`.replace(/\s+/g,'-');
      card.dataset.productId=id;
      add.dataset.productId=id;
      add.dataset.name=name;
      add.dataset.item=item;
      add.dataset.price=`$${price}`;
      add.setAttribute('aria-label',`Choose quantity for ${name}`);
    },
    getProduct(id){
      const add=$$(`${SELECTORS.addButtons}[data-product-id="${CSS.escape(id)}"]`)[0];
      if(!add)return null;
      return {id,name:add.dataset.name||'Product name',item:add.dataset.item||'Item',price:add.dataset.price||'$0.00'};
    },
    syncVisibility(){
      const signed=isSignedIn();
      this.cards().forEach(card=>{
        setDisplay($('.request-price-link',card),signed?'none':'inline-flex');
        setDisplay($('.add',card),signed?'grid':'none');
        setDisplay($('.prices',card),signed?'flex':'none');
        setDisplay($('.old',card),signed?'block':'none');
        setDisplay($('.new-price,[data-product-price]',card),signed?'block':'none');
      });
      setDisplay($('#shoppingCart'),signed?'inline-grid':'none');
    },
    observe(){
      this.rails().forEach(rail=>new MutationObserver(()=>this.enhanceAll()).observe(rail,{childList:true,subtree:true}));
    }
  };

  const QuantitySheet={
    el:null,
    product:null,
    init(){
      if(this.el)return;
      this.el=document.createElement('aside');
      this.el.id='tdQuantitySheet';
      this.el.className='td-sheet td-qty-sheet';
      this.el.setAttribute('aria-hidden','true');
      this.el.innerHTML=`
        <button class="td-sheet-backdrop" type="button" data-close aria-label="Close"></button>
        <section class="td-sheet-panel td-qty-panel" role="dialog" aria-modal="true" aria-labelledby="tdQtyTitle">
          <button class="td-icon-button td-sheet-close" type="button" data-close aria-label="Close">×</button>
          <p class="td-kicker">Add to cart</p>
          <h2 class="td-sheet-title" id="tdQtyTitle">Product name</h2>
          <p class="td-muted td-qty-meta"></p>
          <div class="td-qty-control">
            <button type="button" data-step="-1">−</button>
            <input type="number" min="1" step="1" value="1" inputmode="numeric">
            <button type="button" data-step="1">+</button>
          </div>
          <button class="td-primary-button" type="button" data-submit>Add to cart</button>
        </section>`;
      document.body.append(this.el);
      this.el.addEventListener('click',event=>{
        if(event.target.closest('[data-close]'))this.close();
        const step=event.target.closest('[data-step]');
        if(step)this.setQty(this.qty()+Number(step.dataset.step));
        if(event.target.closest('[data-submit]'))this.submit();
      });
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.isOpen())this.close()});
    },
    isOpen(){return this.el?.classList.contains('is-open')},
    qty(){return Math.max(1,parseInt($('input',this.el).value,10)||1)},
    setQty(value){$('input',this.el).value=String(Math.max(1,value))},
    open(productId){
      if(!isSignedIn()){window.location.assign('./login.html');return}
      this.init();
      const product=ProductCards.getProduct(productId);
      if(!product)return;
      this.product=product;
      $('.td-sheet-title',this.el).textContent=product.name;
      $('.td-qty-meta',this.el).textContent=`${product.item} · ${product.price}`;
      this.setQty(1);
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden','false');
      document.body.classList.add('td-sheet-open');
    },
    close(){
      if(!this.el)return;
      this.el.classList.remove('is-open');
      this.el.setAttribute('aria-hidden','true');
      document.body.classList.remove('td-sheet-open');
    },
    submit(){
      if(!this.product)return;
      CartDrawer.add({...this.product,qty:this.qty()});
      this.close();
      Notify.show('Product added to cart');
    }
  };

  const CartDrawer={
    el:null,
    items:[],
    init(){
      if(this.el)return;
      this.el=document.createElement('aside');
      this.el.id='tdCartDrawer';
      this.el.className='td-sheet td-cart-drawer';
      this.el.setAttribute('aria-hidden','true');
      this.el.innerHTML=`
        <button class="td-sheet-backdrop" type="button" data-close aria-label="Close cart"></button>
        <section class="td-sheet-panel td-cart-panel" role="dialog" aria-modal="true" aria-labelledby="tdCartTitle">
          <button class="td-icon-button td-sheet-close" type="button" data-close aria-label="Close cart">×</button>
          <h2 class="td-sheet-title" id="tdCartTitle">Cart</h2>
          <div class="td-cart-list"></div>
          <div class="td-cart-total"><span>Total</span><strong>$0.00</strong></div>
          <button class="td-primary-button" type="button">Checkout</button>
        </section>`;
      document.body.append(this.el);
      this.el.addEventListener('click',event=>{
        if(event.target.closest('[data-close]'))this.close();
        const remove=event.target.closest('[data-remove]');
        if(remove)this.remove(Number(remove.dataset.remove));
        const step=event.target.closest('[data-cart-step]');
        if(step)this.changeQty(Number(step.dataset.cartStep),Number(step.dataset.step));
      });
      $('#shoppingCart')?.addEventListener('click',event=>{event.preventDefault();this.open()},true);
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.isOpen())this.close()});
    },
    isOpen(){return this.el?.classList.contains('is-open')},
    add(item){
      const existing=this.items.find(row=>row.id===item.id);
      if(existing)existing.qty+=item.qty;
      else this.items.push(item);
      this.render();
      this.syncHeader();
    },
    remove(index){this.items.splice(index,1);this.render();this.syncHeader()},
    changeQty(index,delta){
      const item=this.items[index];
      if(!item)return;
      item.qty=Math.max(1,item.qty+delta);
      this.render();
      this.syncHeader();
    },
    open(){
      if(!isSignedIn()){window.location.assign('./login.html');return}
      this.init();
      this.render();
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden','false');
      document.body.classList.add('td-sheet-open');
    },
    close(){
      if(!this.el)return;
      this.el.classList.remove('is-open');
      this.el.setAttribute('aria-hidden','true');
      document.body.classList.remove('td-sheet-open');
    },
    total(){return this.items.reduce((sum,item)=>sum+money(item.price)*item.qty,0)},
    render(){
      this.init();
      const list=$('.td-cart-list',this.el);
      const total=$('.td-cart-total strong',this.el);
      if(!this.items.length){
        list.innerHTML='<p class="td-empty">Your cart is empty.</p>';
        total.textContent='$0.00';
        return;
      }
      list.innerHTML=this.items.map((item,index)=>`
        <article class="td-cart-item">
          <div class="td-cart-copy"><strong>${item.name}</strong><span>${item.item}</span>
            <div class="td-mini-qty"><button type="button" data-cart-step="${index}" data-step="-1">−</button><em>${item.qty}</em><button type="button" data-cart-step="${index}" data-step="1">+</button></div>
          </div>
          <div class="td-cart-side"><button type="button" data-remove="${index}" aria-label="Remove ${item.name}">×</button><b>$${(money(item.price)*item.qty).toFixed(2)}</b></div>
        </article>`).join('');
      total.textContent=`$${this.total().toFixed(2)}`;
    },
    syncHeader(){
      const count=this.items.reduce((sum,item)=>sum+item.qty,0);
      const badge=$('#cartCount');
      const button=$('#shoppingCart');
      if(badge){badge.textContent=String(count);badge.hidden=count===0}
      if(button)button.setAttribute('aria-label',`Shopping cart, ${count} ${count===1?'item':'items'}`);
    }
  };

  const BrandCarousel={
    init(){
      this.rail=$(SELECTORS.brandRail);
      if(!this.rail)return;
      this.dedupe();
      this.preferPng();
      this.reset();
      this.autoplay();
      new MutationObserver(()=>{this.dedupe();this.preferPng();this.resetProgress()}).observe(this.rail,{childList:true,subtree:true});
      window.addEventListener('load',()=>this.reset());
    },
    dedupe(){
      const seen=new Set();
      $$('.brand-card',this.rail).forEach(card=>{
        const name=($('.brand-name',card)?.textContent||card.textContent||'').trim().toLowerCase();
        if(seen.has(name))card.remove(); else seen.add(name);
      });
    },
    preferPng(){
      $$('.brand-logo-img',this.rail).forEach(img=>{
        if(img.dataset.pngReady==='1')return;
        const src=img.getAttribute('src')||'';
        if(!src.endsWith('.webp'))return;
        img.dataset.pngReady='1';
        const fallback=src;
        img.addEventListener('error',()=>{if(img.dataset.fallback!=='1'){img.dataset.fallback='1';img.src=fallback}},{once:true});
        img.src=src.replace(/\.webp(\?.*)?$/,'.png$1');
      });
    },
    reset(){
      this.rail.scrollLeft=0;
      this.resetProgress();
      setTimeout(()=>{this.rail.scrollLeft=0;this.resetProgress()},80);
    },
    resetProgress(){
      const progress=$('#brandProgress');
      if(!progress)return;
      const visible=this.rail.scrollWidth?Math.min(1,this.rail.clientWidth/this.rail.scrollWidth):1;
      progress.style.width=`${visible*100}%`;
      progress.style.transform='translateX(0px)';
      progress.closest('.progress')?.setAttribute('aria-valuenow','0');
    },
    autoplay(){
      if(this.rail.dataset.tdComponentAuto==='1')return;
      this.rail.dataset.tdComponentAuto='1';
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      let paused=false;
      const wrap=this.rail.closest('.carousel-wrap')||this.rail;
      wrap.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')paused=true});
      wrap.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')paused=false});
      setInterval(()=>{
        if(paused||document.hidden)return;
        const max=Math.max(0,this.rail.scrollWidth-this.rail.clientWidth);
        const card=$('.brand-card',this.rail);
        const gap=parseFloat(getComputedStyle(this.rail).columnGap)||18;
        const step=card?card.getBoundingClientRect().width+gap:this.rail.clientWidth*.7;
        if(max<2)return;
        if(this.rail.scrollLeft>=max-step*.35)this.rail.scrollTo({left:0,behavior:'smooth'});
        else this.rail.scrollBy({left:step,behavior:'smooth'});
      },3400);
    }
  };

  function init(){
    PageTransition.init();
    BurgerMenu.init();
    ProductCards.init();
    QuantitySheet.init();
    CartDrawer.init();
    BrandCarousel.init();
    Auth.sync();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();