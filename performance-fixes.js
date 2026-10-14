/* Performance guard: prevent heavy brand loops and missing PNG image fallbacks */
(()=>{
  const BRAND_PATH='/assets/brands/v2/';
  const nativeRAF=window.requestAnimationFrame.bind(window);
  const nativeCancelRAF=window.cancelAnimationFrame?.bind(window);

  function toWebpBrandSrc(value){
    const src=String(value||'');
    if(!src.includes(BRAND_PATH))return value;
    return src.replace(/\.png(\?.*)?$/i,'.webp$1');
  }

  // landing-build previously tried PNG variants first. PNG files are not present,
  // so the browser made many failing image requests before falling back to WEBP.
  try{
    const desc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
    if(desc?.set&&desc?.get&&!HTMLImageElement.prototype.__tdBrandSrcGuard){
      Object.defineProperty(HTMLImageElement.prototype,'__tdBrandSrcGuard',{value:true});
      Object.defineProperty(HTMLImageElement.prototype,'src',{
        configurable:true,
        enumerable:desc.enumerable,
        get:desc.get,
        set(value){
          try{
            this.loading=this.loading||'lazy';
            this.decoding=this.decoding||'async';
          }catch{}
          desc.set.call(this,toWebpBrandSrc(value));
        }
      });
    }
  }catch{}

  // Stop only the old heavy BRANDS animation loop. It rewrote inline styles for
  // every brand card on every animation frame and could freeze the page near BRANDS.
  window.requestAnimationFrame=function(callback){
    try{
      const src=Function.prototype.toString.call(callback);
      if(src.includes('normalizeBrands()')&&src.includes('brandLoopId')){
        return -1001;
      }
    }catch{}
    return nativeRAF(callback);
  };
  if(nativeCancelRAF){
    window.cancelAnimationFrame=function(id){
      if(id===-1001)return;
      return nativeCancelRAF(id);
    };
  }

  function prepImages(root=document){
    root.querySelectorAll?.('img').forEach(img=>{
      try{
        img.loading=img.closest('.hero-video')?'eager':'lazy';
        img.decoding='async';
        const src=img.getAttribute('src')||'';
        const fixed=toWebpBrandSrc(src);
        if(fixed!==src)img.setAttribute('src',fixed);
      }catch{}
    });
  }

  function normalizeBrandStatic(){
    const rail=document.getElementById('brandCarousel');
    if(!rail)return;
    rail.classList.remove('is-infinite-carousel');
    rail.removeAttribute('data-infinite');
    rail.style.scrollSnapType='none';
    rail.style.scrollBehavior='auto';
    rail.querySelectorAll('.brand-card').forEach(card=>{
      if(card.dataset.tdPerfReady==='true')return;
      card.dataset.tdPerfReady='true';
      card.style.background='#fff';
      card.style.backgroundColor='#fff';
      card.style.transform='none';
      card.style.scrollSnapAlign='none';
      card.querySelectorAll('.brand-picture,.brand-logo-img').forEach(el=>{
        el.style.background='#fff';
        el.style.backgroundColor='#fff';
        el.style.mixBlendMode='normal';
      });
    });
    const bar=document.getElementById('brandProgress');
    if(bar){bar.style.display='none';bar.parentElement&&(bar.parentElement.style.display='none')}
  }

  function startLightBrandScroll(){
    const rail=document.getElementById('brandCarousel');
    if(!rail||rail.dataset.tdLightScroll==='true')return;
    rail.dataset.tdLightScroll='true';
    let paused=false;
    const wrap=rail.closest('.carousel-wrap')||rail;
    wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')paused=true},{passive:true});
    wrap.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')paused=false},{passive:true});
    window.setInterval(()=>{
      if(paused||document.hidden)return;
      const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
      if(max<=1)return;
      if(rail.scrollLeft>=max-2){
        rail.scrollTo({left:0,behavior:'smooth'});
        return;
      }
      rail.scrollLeft+=1;
    },32);
  }

  function init(){
    prepImages();
    normalizeBrandStatic();
    startLightBrandScroll();
    const observer=new MutationObserver(mutations=>{
      let needsBrands=false;
      for(const m of mutations){
        m.addedNodes?.forEach(node=>{
          if(node.nodeType!==1)return;
          prepImages(node);
          if(node.id==='brandCarousel'||node.querySelector?.('#brandCarousel,.brand-card'))needsBrands=true;
        });
      }
      if(needsBrands){normalizeBrandStatic();startLightBrandScroll()}
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
