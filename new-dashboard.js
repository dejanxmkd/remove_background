/* The dashboard uses the original storefront navbar markup and styling. */
(function(){
  const $=s=>document.querySelector(s),shop=$('#shoppingUser'),key='td-active-shopping-for-v1';
  if(!shop)return;
  try{const v=localStorage.getItem(key);if(v&&[...shop.options].some(o=>o.value===v))shop.value=v}catch{}
  function update(){
    const selected=shop.options[shop.selectedIndex]?.textContent||shop.value;
    if($('#mobileUserName'))$('#mobileUserName').textContent=selected;
    $('#mobileUserTrigger')?.setAttribute('aria-label','Switch shopping account: '+selected);
    try{localStorage.setItem(key,shop.value)}catch{}
  }
  shop.addEventListener('change',update);update();
  const bell=$('#dashboardNotifications'),notifications=$('#dashboardNotificationsPanel');
  function setNotifications(open){
    if(!bell||!notifications)return;
    notifications.hidden=!open;
    bell.setAttribute('aria-expanded',String(open));
  }
  bell?.addEventListener('click',()=>setNotifications(notifications.hidden));
  document.addEventListener('pointerdown',e=>{
    if(!e.target.closest('.dashboard-notification-wrap'))setNotifications(false);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setNotifications(false)});
  /* Reuse the storefront search behavior: open/close class, responsive positioning,
     outside-click, Escape, mobile keyboard behavior and clear X. */
  const toggle=$('#headerSearchToggle'),panel=$('#headerSearchPanel'),field=$('#headerSearchInput'),clear=$('#headerSearchClear');
  const mobileSearch=window.matchMedia('(max-width:760px)');
  function updateMobileSearchTop(){
    if(!mobileSearch.matches)return;
    const nav=$('.site-nav');
    if(nav)document.documentElement.style.setProperty('--mobile-search-top',Math.max(0,Math.round(nav.getBoundingClientRect().bottom))+'px');
  }
  window.addEventListener('resize',updateMobileSearchTop,{passive:true});
  window.addEventListener('scroll',updateMobileSearchTop,{passive:true});
  mobileSearch.addEventListener('change',updateMobileSearchTop);
  window.visualViewport?.addEventListener('resize',updateMobileSearchTop,{passive:true});
  updateMobileSearchTop();
  function setHeaderSearchOpen(open,restoreFocus=false){
    if(!toggle||!panel)return;
    if(open&&mobileSearch.matches)updateMobileSearchTop();
    panel.classList.toggle('is-open',open);
    panel.inert=!open;
    panel.setAttribute('aria-hidden',String(!open));
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close search':'Open search');
    if(open){
      if(!mobileSearch.matches)field.focus({preventScroll:true});
    }else{
      if(panel.contains(document.activeElement))document.activeElement.blur();
      if(restoreFocus)toggle.focus({preventScroll:true});
    }
  }
  toggle?.addEventListener('click',()=>{
    const next=!panel.classList.contains('is-open');
    if(next){
      const burger=$('#mobileMenuToggle'),mobile=$('#mobileMenuPanel');
      if(burger&&mobile){
        burger.setAttribute('aria-expanded','false');
        burger.setAttribute('aria-label','Open menu');
        mobile.classList.remove('is-open');
        mobile.setAttribute('aria-hidden','true');
        mobile.inert=true;
      }
    }
    setHeaderSearchOpen(next);
  });
  panel?.addEventListener('click',event=>{
    if(!event.target.closest('button')&&event.target!==field)field.focus({preventScroll:true});
  });
  field?.addEventListener('input',()=>{clear.hidden=field.value.length===0});
  clear?.addEventListener('click',()=>{field.value='';clear.hidden=true;field.focus()});
  document.addEventListener('pointerdown',event=>{
    if(!panel?.classList.contains('is-open'))return;
    if(panel.contains(event.target)||toggle.contains(event.target))return;
    setHeaderSearchOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&panel?.classList.contains('is-open'))setHeaderSearchOpen(false,true);
  });
  const burger=$('#mobileMenuToggle'),mobile=$('#mobileMenuPanel');
  burger?.addEventListener('click',()=>{
    const open=burger.getAttribute('aria-expanded')!=='true';
    if(open)setHeaderSearchOpen(false);
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
