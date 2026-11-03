/* The dashboard uses the original storefront navbar markup and styling. */
(function(){
  const $=s=>document.querySelector(s),shop=$('#shoppingUser'),key='td-active-shopping-for-v1',cartKey='td-delivery-carts-v1';
  if(!shop)return;
  try{const v=localStorage.getItem(key);if(v&&[...shop.options].some(o=>o.value===v))shop.value=v}catch{}
  const count=$('#cartCount');
  function update(){
    const selected=shop.options[shop.selectedIndex]?.textContent||shop.value;
    if($('#mobileUserName'))$('#mobileUserName').textContent=selected;
    $('#mobileUserTrigger')?.setAttribute('aria-label','Switch shopping account: '+selected);
    try{localStorage.setItem(key,shop.value)}catch{}
    let n=0;try{const carts=JSON.parse(localStorage.getItem(cartKey)||'{}');const items=carts?.[shop.value];if(Array.isArray(items))n=items.reduce((sum,i)=>sum+(Number(i.qty)||0),0)}catch{}
    if(count){count.textContent=n;count.hidden=n===0}
    $('#shoppingCart')?.setAttribute('aria-label','Shopping cart, '+n+' items for '+shop.value);
  }
  shop.addEventListener('change',update);update();
  $('#shoppingCart')?.addEventListener('click',()=>location.assign('./index.html'));
  const toggle=$('#headerSearchToggle'),panel=$('#headerSearchPanel'),field=$('#headerSearchInput'),clear=$('#headerSearchClear');
  function search(open){panel.setAttribute('aria-hidden',String(!open));panel.inert=!open;toggle.setAttribute('aria-expanded',String(open));if(open)field.focus()}
  toggle?.addEventListener('click',()=>search(toggle.getAttribute('aria-expanded')!=='true'));
  field?.addEventListener('input',()=>{clear.hidden=!field.value});
  clear?.addEventListener('click',()=>{field.value='';clear.hidden=true;field.focus()});
  field?.addEventListener('keydown',e=>{if(e.key==='Escape')search(false);if(e.key==='Enter'){e.preventDefault();location.assign('./index.html#new-title')}});
  const burger=$('#mobileMenuToggle'),mobile=$('#mobileMenuPanel');
  burger?.addEventListener('click',()=>{
    const open=burger.getAttribute('aria-expanded')!=='true';
    burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    mobile.classList.toggle('is-open',open);mobile.setAttribute('aria-hidden',String(!open));mobile.inert=!open;
  });
  const userBtn=$('#mobileUserTrigger'),sheet=$('#mobileUserSheet'),opts=$('#mobileUserOptions');
  function closeSheet(){sheet.classList.remove('is-open');sheet.setAttribute('aria-hidden','true');sheet.inert=true;}
  userBtn?.addEventListener('click',()=>{
    opts.replaceChildren();
    [...shop.options].forEach(o=>{const b=document.createElement('button');b.type='button';b.textContent=o.textContent;b.dataset.user=o.value;b.setAttribute('aria-pressed',String(o.value===shop.value));opts.append(b)});
    sheet.classList.add('is-open');sheet.setAttribute('aria-hidden','false');sheet.inert=false;
  });
  opts?.addEventListener('click',e=>{const b=e.target.closest('[data-user]');if(!b)return;shop.value=b.dataset.user;shop.dispatchEvent(new Event('change',{bubbles:true}));closeSheet()});
  $('#mobileUserBackdrop')?.addEventListener('click',closeSheet);
})();
