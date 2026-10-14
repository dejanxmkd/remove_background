(()=>{
  'use strict';

  const AUTH_KEY='td-preview-auth-v1';
  const rails='#productCarousel,#dealsProducts,#bestSellerProducts';
  const cards='#productCarousel .card,#dealsProducts .card,#bestSellerProducts .card';
  const addButtons='#productCarousel .add,#dealsProducts .add,#bestSellerProducts .add';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const signed=()=>{try{return sessionStorage.getItem(AUTH_KEY)==='true'}catch{return false}};
  const money=v=>Number(String(v||'').replace(/[^0-9.]/g,''))||0;
  const show=(el,value)=>el&&el.style.setProperty('display',value,'important');
  const icon={
    x:'<svg class="lucide-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    plus:'<svg class="lucide-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    minus:'<svg class="lucide-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>'
  };

  const toast=message=>{
    const el=$('#notice');
    if(!el)return;
    el.textContent=message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>el.classList.remove('show'),2200);
  };

  const syncAuth=()=>{
    const isAuth=signed();
    document.body.dataset.authPreview=String(isAuth);
    $$('.td-auth-link').forEach(link=>{
      link.textContent=isAuth?'Logout':'Login';
      link.href=isAuth?'#logout':'./login.html';
    });
    $$(cards).forEach(card=>{
      show($('.request-price-link',card),isAuth?'none':'inline-flex');
      show($('.add',card),isAuth?'grid':'none');
      show($('.prices',card),isAuth?'flex':'none');
      show($('.old',card),isAuth?'block':'none');
      show($('.new-price,[data-product-price]',card),isAuth?'block':'none');
    });
    show($('#shoppingCart'),isAuth?'inline-grid':'none');
    if(!isAuth)Cart.close();
  };

  const Menu={
    init(){
      const content=$('#mobileMenuContent');
      const panel=$('#mobileMenuPanel');
      if(!content||!panel)return;
      content.replaceChildren(this.nav());
      const sync=()=>document.body.classList.toggle('td-menu-open',panel.classList.contains('is-open'));
      sync();
      new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['class']});
      content.addEventListener('click',event=>{
        const auth=event.target.closest('.td-auth-link');
        if(auth&&signed()){
          event.preventDefault();
          try{sessionStorage.removeItem(AUTH_KEY)}catch{}
          syncAuth();
          if(typeof window.setMobileMenuOpen==='function')window.setMobileMenuOpen(false);
        }
      });
    },
    nav(){
      const nav=document.createElement('nav');
      nav.className='td-menu-nav';
      nav.setAttribute('aria-label','Mobile menu');
      nav.innerHTML=[
        ['#top','Home',''],
        ['#new-title','Link name',''],
        ['#brands-title','Link name',''],
        ['#categories-title','Link name',''],
        ['#footer','Contact us','td-contact-link'],
        ['./login.html','Login','td-auth-link']
      ].map(([href,label,cls])=>`<a class="td-menu-link ${cls}" href="${href}">${label}</a>`).join('');
      return nav;
    }
  };

  const Products={
    init(){
      this.enhance();
      $$(rails).forEach(rail=>new MutationObserver(()=>this.enhance()).observe(rail,{childList:true,subtree:true}));
      document.addEventListener('click',event=>{
        const add=event.target.closest(addButtons);
        if(!add)return;
        event.preventDefault();
        Qty.open(add.dataset.productId);
      },true);
    },
    enhance(){
      $$(cards).forEach((card,index)=>{
        const purchase=$('.purchase',card),request=$('.request-price-link',card),add=$('.add',card);
        if(!purchase||!request||!add)return;
        const section=card.closest('#dealsProducts')?100:card.closest('#bestSellerProducts')?200:0;
        const old=(19.99+(section+index)*0.75).toFixed(2);
        const price=(12.99+(section+index)*0.55).toFixed(2);
        if(!$('.td-price-block',card)){
          const prices=document.createElement('div');
          prices.className='prices td-price-block';
          prices.innerHTML=`<span class="old">$${old}</span><span class="new-price" data-product-price>$${price}</span>`;
          purchase.insertBefore(prices,request);
        }
        const item=$('.item',card)?.textContent?.replace(/^Item\s*/,'').trim()||`#${48720+index}`;
        const name=$('.product-title',card)?.textContent?.trim()||'Product name';
        const id=`${item}-${card.closest('.carousel')?.id||'products'}`.replace(/\s+/g,'-');
        card.dataset.productId=id;
        Object.assign(add.dataset,{productId:id,name,item,price:`$${price}`});
      });
      syncAuth();
    },
    get(id){
      const add=$$(addButtons).find(btn=>btn.dataset.productId===id);
      if(!add)return null;
      return {id,name:add.dataset.name||'Product name',item:add.dataset.item||'Item',price:add.dataset.price||'$0.00'};
    }
  };

  const Qty={
    init(){
      if(this.el)return;
      this.el=document.createElement('aside');
      this.el.className='td-sheet td-qty-sheet';
      this.el.setAttribute('aria-hidden','true');
      this.el.innerHTML=`<button class="td-backdrop" type="button" data-close aria-label="Close"></button><section class="td-panel td-qty-panel" role="dialog" aria-modal="true"><button class="td-icon-btn" type="button" data-close aria-label="Close">${icon.x}</button><p class="td-kicker">Add to cart</p><h2 class="td-title">Product name</h2><p class="td-muted"></p><div class="td-qty"><button type="button" data-step="-1">${icon.minus}</button><input type="number" min="1" step="1" value="1" inputmode="numeric"><button type="button" data-step="1">${icon.plus}</button></div><button class="td-primary" type="button" data-submit>Add to cart</button></section>`;
      document.body.append(this.el);
      this.el.addEventListener('click',event=>{
        if(event.target.closest('[data-close]'))this.close();
        const step=event.target.closest('[data-step]');
        if(step)this.qty(this.qty()+Number(step.dataset.step));
        if(event.target.closest('[data-submit]'))this.submit();
      });
    },
    qty(value){
      const input=$('input',this.el);
      if(value===undefined)return Math.max(1,parseInt(input.value,10)||1);
      input.value=String(Math.max(1,value));
    },
    open(id){
      if(!signed()){location.assign('./login.html');return}
      const product=Products.get(id);
      if(!product)return;
      this.init();
      this.product=product;
      $('.td-title',this.el).textContent=product.name;
      $('.td-muted',this.el).textContent=`${product.item} · ${product.price}`;
      this.qty(1);
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden','false');
    },
    close(){
      this.el?.classList.remove('is-open');
      this.el?.setAttribute('aria-hidden','true');
    },
    submit(){
      if(!this.product)return;
      Cart.add({...this.product,qty:this.qty()});
      this.close();
      toast('Product added to cart');
    }
  };

  const Cart={
    items:[],
    init(){
      if(this.el)return;
      this.el=document.createElement('aside');
      this.el.className='td-sheet td-cart-drawer';
      this.el.setAttribute('aria-hidden','true');
      this.el.innerHTML=`<button class="td-backdrop" type="button" data-close aria-label="Close cart"></button><section class="td-panel td-cart-panel" role="dialog" aria-modal="true"><button class="td-icon-btn" type="button" data-close aria-label="Close cart">${icon.x}</button><h2 class="td-title">Cart</h2><div class="td-cart-list"></div><div class="td-total"><span>Total</span><strong>$0.00</strong></div><button class="td-primary" type="button">Checkout</button></section>`;
      document.body.append(this.el);
      this.el.addEventListener('click',event=>{
        if(event.target.closest('[data-close]'))this.close();
        const remove=event.target.closest('[data-remove]');
        if(remove)this.remove(Number(remove.dataset.remove));
        const step=event.target.closest('[data-cart-step]');
        if(step)this.step(Number(step.dataset.cartStep),Number(step.dataset.step));
      });
      $('#shoppingCart')?.addEventListener('click',event=>{event.preventDefault();this.open()},true);
    },
    add(item){
      const existing=this.items.find(row=>row.id===item.id);
      existing?existing.qty+=item.qty:this.items.push(item);
      this.render();
      this.badge();
    },
    remove(i){this.items.splice(i,1);this.render();this.badge()},
    step(i,delta){if(this.items[i]){this.items[i].qty=Math.max(1,this.items[i].qty+delta);this.render();this.badge()}},
    open(){
      if(!signed()){location.assign('./login.html');return}
      this.init();this.render();
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden','false');
    },
    close(){this.el?.classList.remove('is-open');this.el?.setAttribute('aria-hidden','true')},
    render(){
      this.init();
      const list=$('.td-cart-list',this.el),total=$('.td-total strong',this.el);
      if(!this.items.length){list.innerHTML='<p class="td-empty">Your cart is empty.</p>';total.textContent='$0.00';return}
      list.innerHTML=this.items.map((item,i)=>`<article class="td-cart-item"><div><strong>${item.name}</strong><span>${item.item}</span><div class="td-mini-qty"><button type="button" data-cart-step="${i}" data-step="-1">${icon.minus}</button><em>${item.qty}</em><button type="button" data-cart-step="${i}" data-step="1">${icon.plus}</button></div></div><aside><button type="button" data-remove="${i}" aria-label="Remove ${item.name}">${icon.x}</button><b>$${(money(item.price)*item.qty).toFixed(2)}</b></aside></article>`).join('');
      total.textContent='$'+this.items.reduce((sum,item)=>sum+money(item.price)*item.qty,0).toFixed(2);
    },
    badge(){
      const count=this.items.reduce((sum,item)=>sum+item.qty,0);
      const badge=$('#cartCount'),button=$('#shoppingCart');
      if(badge){badge.textContent=String(count);badge.hidden=count===0}
      if(button)button.setAttribute('aria-label',`Shopping cart, ${count} ${count===1?'item':'items'}`);
    }
  };

  const Brands={
    init(){
      const rail=$('#brandCarousel');
      if(!rail)return;
      const normalize=()=>{
        const seen=new Set();
        $$('.brand-card',rail).forEach(card=>{
          const name=($('.brand-name',card)?.textContent||'').trim().toLowerCase();
          if(seen.has(name))card.remove();else seen.add(name);
        });
        rail.scrollLeft=0;
        const progress=$('#brandProgress');
        if(progress){progress.style.transform='translateX(0)';progress.style.width='0%'}
        $$('.brand-logo-img',rail).forEach(img=>{
          const src=img.getAttribute('src')||'';
          if(src.endsWith('.webp')){
            const webp=src;
            img.onerror=()=>{img.onerror=null;img.src=webp};
            img.src=src.replace(/\.webp$/,'.png');
          }
        });
      };
      setTimeout(normalize,80);
      new MutationObserver(normalize).observe(rail,{childList:true,subtree:true});
      setInterval(()=>{
        const max=rail.scrollWidth-rail.clientWidth;
        if(max<2)return;
        const card=$('.brand-card',rail);
        const gap=parseFloat(getComputedStyle(rail).columnGap)||18;
        const step=card?card.getBoundingClientRect().width+gap:rail.clientWidth*.7;
        if(rail.scrollLeft>=max-step*.4)rail.scrollTo({left:0,behavior:'smooth'});
        else rail.scrollBy({left:step,behavior:'smooth'});
      },3400);
    }
  };

  const init=()=>{
    try{
      Menu.init();Products.init();Qty.init();Cart.init();Brands.init();syncAuth();
    }catch(error){console.error('Landing build failed:',error)}
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();