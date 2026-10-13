/* True Distributors mobile menu demo login + brand carousel polish */
(function(){
  const sessionKey='td-preview-auth-v1';
  const toggle=document.getElementById('mobileMenuToggle');
  const panel=document.getElementById('mobileMenuPanel');
  const content=document.getElementById('mobileMenuContent');

  function syncMenuState(){
    const open=toggle?.getAttribute('aria-expanded')==='true' || panel?.classList.contains('is-open');
    document.body.classList.toggle('td-menu-open',!!open);
  }

  function ensureLoginForm(){
    if(!content || content.querySelector('.td-menu-login'))return;
    const form=document.createElement('form');
    form.className='td-menu-login';
    form.innerHTML=`
      <h2 class="td-menu-login-title">Log in</h2>
      <p class="td-menu-login-caption">Demo access. Enter any user and password.</p>
      <input name="username" autocomplete="username" placeholder="Username" aria-label="Username">
      <input name="password" type="password" autocomplete="current-password" placeholder="Password" aria-label="Password">
      <button type="submit">Enter</button>
      <p class="td-menu-login-status" role="status" aria-live="polite"></p>`;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      try{sessionStorage.setItem(sessionKey,'true')}catch{}
      document.body.dataset.authPreview='true';
      const status=form.querySelector('.td-menu-login-status');
      if(status)status.textContent='Logged in — demo mode';
      const oldLink=document.getElementById('menuAuthLink');
      if(oldLink)oldLink.firstChild.textContent='Log out (demo)';
    });
    content.append(form);
  }

  function classifyBrandLogos(){
    document.querySelectorAll('.brand-logo-img:not([data-td-sized])').forEach(img=>{
      const name=(img.getAttribute('alt')||'').toLowerCase();
      img.dataset.tdSized='true';
      if(/m&m|oreo|raw|velo|zyn|alp|axe|kind|tide|twix|advil/.test(name)) img.classList.add('logo-compact');
      if(/jolly|sour patch|quest|ice breakers|david|lenny|lifesavers|ritter|sour power|swedish|true pinless|mike/.test(name)) img.classList.add('logo-wide');
      if(/hershey|kinder|pringles|takis|red bull|nutella|loacker|trident/.test(name)) img.classList.add('logo-large');
      if(/trojan|always|tylenol/.test(name)) img.classList.add('logo-small');
    });
  }

  function installBrandAutoStep(){
    const rail=document.getElementById('brandCarousel');
    if(!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let paused=false;
    const wrap=rail.closest('.carousel-wrap')||rail;
    wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')paused=true});
    wrap.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')paused=false});
    wrap.addEventListener('focusin',()=>paused=true);
    wrap.addEventListener('focusout',()=>{paused=wrap.contains(document.activeElement)});
    setInterval(()=>{
      if(paused || document.hidden || rail.matches(':active'))return;
      const card=rail.querySelector('.brand-card');
      const gap=parseFloat(getComputedStyle(rail).columnGap)||18;
      const step=card ? card.getBoundingClientRect().width + gap : rail.clientWidth*.72;
      rail.scrollBy({left:step,behavior:'smooth'});
    },3200);
  }

  ensureLoginForm();
  classifyBrandLogos();
  installBrandAutoStep();
  syncMenuState();

  toggle?.addEventListener('click',()=>setTimeout(()=>{ensureLoginForm();syncMenuState()},0));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setTimeout(syncMenuState,0)},true);
  if(panel){
    new MutationObserver(()=>{ensureLoginForm();syncMenuState()}).observe(panel,{attributes:true,attributeFilter:['class','aria-hidden']});
  }
  const brandRail=document.getElementById('brandCarousel');
  if(brandRail){
    new MutationObserver(classifyBrandLogos).observe(brandRail,{childList:true,subtree:true});
  }
})();
