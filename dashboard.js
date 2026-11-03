/* Standalone dashboard header — uses the existing storefront markup and CSS. */
(function(){
  const $=s=>document.querySelector(s);
  const shop=$('#shoppingUser');
  const KEY='td-active-shopping-for-v1';
  const CART='td-delivery-carts-v1';
  try{const prev=localStorage.getItem(KEY);if(prev&&[...shop.options].some(o=>o.value===prev))shop.value=prev;}catch{}
  function syncAccount(){
    const selected=shop.options[shop.selectedIndex]?.textContent||shop.value;
    const name=$('#mobileUserName');if(name)name.textContent=selected;
    const trigger=$('#mobileUserTrigger');if(trigger)trigger.setAttribute('aria-label','Switch shopping account: '+selected);
    try{localStorage.setItem(KEY,shop.value)}catch{}
    updateCartCount();
  }
  function updateCartCount(){
    const badge=$('#cartCount'),btn=$('#shoppingCart');if(!badge)return;
    let count=0;
    try{const carts=JSON.parse(localStorage.getItem(CART)||'{}');const rows=carts?.[shop.value];if(Array.isArray(rows))count=rows.reduce((n,item)=>n+(Number(item.qty)||0),0)}catch{}
    badge.textContent=String(count);badge.hidden=count===0;
    btn?.setAttribute('aria-label','Shopping cart, '+count+' items for '+shop.value);
  }
  shop?.addEventListener('change',syncAccount);syncAccount();
  $('#shoppingCart')?.addEventListener('click',()=>location.assign('./index.html'));
  const mobileToggle=$('#mobileMenuToggle'),mobilePanel=$('#mobileMenuPanel');
  function setMenu(open){
    if(!mobileToggle||!mobilePanel)return;
    mobileToggle.setAttribute('aria-expanded',String(open));
    mobileToggle.setAttribute('aria-label',open?'Close menu':'Open menu');
    mobilePanel.classList.toggle('is-open',open);
    mobilePanel.setAttribute('aria-hidden',String(!open));
    mobilePanel.inert=!open;
    document.body.classList.toggle('td-login-menu-open',open);
  }
  mobileToggle?.addEventListener('click',()=>setMenu(mobileToggle.getAttribute('aria-expanded')!=='true'));
  const sheet=$('#mobileUserSheet'),trigger=$('#mobileUserTrigger'),options=$('#mobileUserOptions');
  function closeSheet(){if(!sheet)return;sheet.classList.remove('is-open');sheet.setAttribute('aria-hidden','true');sheet.inert=true;trigger?.focus()}
  trigger?.addEventListener('click',()=>{
    if(!sheet||!options)return;
    options.replaceChildren();
    [...shop.options].forEach(o=>{
      const b=document.createElement('button');b.type='button';b.dataset.user=o.value;b.textContent=o.textContent;
      b.setAttribute('aria-pressed',String(o.value===shop.value));options.append(b);
    });
    sheet.classList.add('is-open');sheet.setAttribute('aria-hidden','false');sheet.inert=false;
  });
  options?.addEventListener('click',e=>{
    const b=e.target.closest('[data-user]');if(!b)return;
    shop.value=b.dataset.user;shop.dispatchEvent(new Event('change',{bubbles:true}));closeSheet();
  });
  $('#mobileUserBackdrop')?.addEventListener('click',closeSheet);
  const search=$('#headerSearchPanel'),toggle=$('#headerSearchToggle'),field=$('#headerSearchInput'),clear=$('#headerSearchClear');
  function setSearch(open){
    if(!search||!toggle)return;
    search.setAttribute('aria-hidden',String(!open));search.inert=!open;
    toggle.setAttribute('aria-expanded',String(open));
    if(open)field?.focus();
  }
  toggle?.addEventListener('click',()=>setSearch(toggle.getAttribute('aria-expanded')!=='true'));
  field?.addEventListener('input',()=>{if(clear)clear.hidden=!field.value});
  field?.addEventListener('keydown',e=>{
    if(e.key==='Escape'){setSearch(false);toggle?.focus()}
    if(e.key==='Enter'){e.preventDefault();location.assign('./index.html#new-title')}
  });
  clear?.addEventListener('click',()=>{field.value='';clear.hidden=true;field.focus()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheet();setMenu(false)}});
})();
