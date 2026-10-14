/* Final interaction fixes: stable quantity modal/cart + auth toast + modal subtotal */
(()=>{
  const key='td-preview-auth-v1';
  const toastKey='td-auth-toast-v1';
  const shownKey='td-login-ref-toast-shown-v1';

  function injectStableOverlayStyles(){
    if(document.getElementById('tdFinalFixesStyles'))return;
    const style=document.createElement('style');
    style.id='tdFinalFixesStyles';
    style.textContent=`
      html{scrollbar-gutter:stable!important}

      body.td-qty-open,
      body.td-cart-open,
      body[data-td-cart-locked="true"]{overflow:visible!important;padding-right:0!important;position:static!important;width:auto!important;top:auto!important;touch-action:auto!important}

      body.td-qty-open .site-header{position:sticky!important;top:0!important;left:auto!important;right:auto!important;width:100%!important;z-index:5190!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:none!important}
      body.td-qty-open .site-nav{position:relative!important;z-index:5191!important;opacity:1!important;visibility:visible!important;transform:none!important}
      body.td-qty-open .td-qty-modal{position:fixed!important;inset:0!important;z-index:5200!important}
      body.td-qty-open .td-qty-backdrop{z-index:5200!important}
      body.td-qty-open .td-qty-panel{z-index:5210!important}

      body.td-cart-open .site-header{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:7190!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:none!important}
      body.td-cart-open .site-nav{position:relative!important;z-index:7191!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:none!important}
      body.td-cart-open .td-cart-drawer{position:fixed!important;inset:0!important;z-index:7200!important;visibility:visible!important}
      body.td-cart-open .td-cart-backdrop{z-index:7200!important}
      body.td-cart-open .td-cart-panel{z-index:7210!important}

      .td-qty-panel{width:min(460px,calc(100vw - 44px))!important;padding:34px 34px 30px!important;border-radius:26px!important;gap:16px!important;overflow:visible!important}
      .td-qty-kicker{display:none!important}
      .td-qty-title{margin:0 74px 0 0!important;min-height:auto!important;font-size:34px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.06em!important;display:block!important}
      .td-qty-close{top:28px!important;right:28px!important;width:58px!important;height:58px!important;border-radius:50%!important;background:#f2eff9!important;color:var(--purple,#6633CC)!important}
      .td-qty-meta{margin:0!important;color:#6f6a78!important;font-size:14px!important;font-weight:850!important;line-height:1.2!important;letter-spacing:-.02em!important}
      .td-qty-info-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:18px!important;margin-top:22px!important;margin-bottom:4px!important}
      .td-qty-subtotal{margin:0!important;text-align:right!important;color:var(--ink,#09070d)!important;line-height:1!important;font-weight:900!important;font-size:22px!important;letter-spacing:-.035em!important;white-space:nowrap!important}
      .td-qty-subtotal span{display:inline!important;font-size:14px!important;font-weight:900!important;text-transform:none!important;letter-spacing:-.02em!important;color:#6f6a78!important;margin:0 5px 0 0!important}
      .td-qty-subtotal strong{display:inline!important;font:inherit!important;color:var(--ink,#09070d)!important}
      .td-qty-row{grid-template-columns:58px minmax(0,1fr) 58px!important;gap:12px!important;margin-top:2px!important}
      .td-qty-step,.td-qty-input{height:58px!important;border-radius:18px!important}
      .td-qty-input{font-size:22px!important;font-weight:950!important;background:#fbfaff!important;border:1px solid #eeeaf3!important;color:var(--ink,#09070d)!important}
      .td-qty-submit{height:62px!important;border-radius:999px!important;margin-top:8px!important;font-size:15px!important;letter-spacing:.055em!important}

      @media(max-width:760px){
        .td-qty-panel{width:100%!important;max-width:100%!important;padding:30px 22px 28px!important;border-radius:26px 26px 0 0!important}
        .td-qty-title{font-size:30px!important;margin-right:64px!important}
        .td-qty-close{top:24px!important;right:22px!important;width:52px!important;height:52px!important}
        .td-qty-info-row{grid-template-columns:minmax(0,1fr) auto!important;gap:12px!important;margin-top:20px!important}
        .td-qty-subtotal{font-size:18px!important}
        .td-qty-subtotal span{font-size:12px!important}
        .td-qty-row{grid-template-columns:54px minmax(0,1fr) 54px!important;gap:10px!important}
        .td-qty-step,.td-qty-input{height:54px!important}
      }
    `;
    document.head.append(style);
  }

  function showToast(message){
    const notice=document.getElementById('notice');
    if(!notice||!message)return;
    notice.textContent=message;
    notice.classList.add('show');
    window.clearTimeout(notice._tdToastTimer);
    notice._tdToastTimer=window.setTimeout(()=>notice.classList.remove('show'),2600);
  }

  function isSigned(){
    try{return sessionStorage.getItem(key)==='true'}catch{return false}
  }

  function authToastOnLoad(){
    let msg='';
    try{msg=sessionStorage.getItem(toastKey)||'';sessionStorage.removeItem(toastKey)}catch{}
    if(!msg&&isSigned()&&/login\.html(?:$|[?#])/i.test(document.referrer||'')){
      try{
        if(sessionStorage.getItem(shownKey)!=='true'){
          msg='Successfully logged in';
          sessionStorage.setItem(shownKey,'true');
        }
      }catch{msg='Successfully logged in'}
    }
    if(msg)window.setTimeout(()=>showToast(msg),350);
  }

  function bindLogoutToast(){
    document.addEventListener('click',event=>{
      const link=event.target.closest?.('.td-burger-login');
      if(!link)return;
      if(isSigned()){
        try{sessionStorage.removeItem(shownKey)}catch{}
        window.setTimeout(()=>showToast('Successfully logged out'),420);
      }
    },true);
  }

  function bindLoginToastFlag(){
    document.addEventListener('submit',event=>{
      if(event.target?.id!=='loginForm')return;
      try{sessionStorage.setItem(toastKey,'Successfully logged in');sessionStorage.removeItem(shownKey)}catch{}
    },true);
  }

  function moneyValue(value){
    return Number(String(value||'').replace(/[^0-9.]/g,''))||0;
  }

  function formatMoney(value){
    return '$'+Number(value||0).toFixed(2);
  }

  function updateQtySubtotal(modal){
    if(!modal)return;
    const qty=Math.max(1,parseInt(modal.querySelector('.td-qty-input')?.value,10)||1);
    const price=moneyValue(modal.dataset.price||modal.querySelector('.td-qty-meta')?.textContent||'0');
    const total=price*qty;
    const strong=modal.querySelector('.td-qty-subtotal strong');
    if(strong)strong.textContent=formatMoney(total);
  }

  function ensureQtySubtotal(){
    const modal=document.getElementById('tdQuantityModal');
    const panel=modal?.querySelector('.td-qty-panel');
    const meta=modal?.querySelector('.td-qty-meta');
    const row=modal?.querySelector('.td-qty-row');
    if(!modal||!panel||!meta||!row)return;

    let info=panel.querySelector('.td-qty-info-row');
    if(!info){
      info=document.createElement('div');
      info.className='td-qty-info-row';
      meta.parentNode.insertBefore(info,meta);
      info.append(meta);
      const subtotal=document.createElement('p');
      subtotal.className='td-qty-subtotal';
      subtotal.innerHTML='<span>Subtotal:</span><strong>$0.00</strong>';
      info.append(subtotal);
    }else{
      const label=info.querySelector('.td-qty-subtotal span');
      if(label)label.textContent='Subtotal:';
    }
    updateQtySubtotal(modal);
  }

  function bindQtySubtotal(){
    document.addEventListener('click',event=>{
      if(event.target.closest?.('.td-qty-step,[data-step],#productCarousel .add,#dealsProducts .add,#bestSellerProducts .add')){
        requestAnimationFrame(()=>ensureQtySubtotal());
        setTimeout(ensureQtySubtotal,40);
      }
    },true);
    document.addEventListener('input',event=>{
      if(event.target?.classList?.contains('td-qty-input'))updateQtySubtotal(document.getElementById('tdQuantityModal'));
    },true);
    const observer=new MutationObserver(()=>ensureQtySubtotal());
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-price']});
    setTimeout(ensureQtySubtotal,200);
  }

  injectStableOverlayStyles();
  authToastOnLoad();
  bindLogoutToast();
  bindLoginToastFlag();
  bindQtySubtotal();
})();
