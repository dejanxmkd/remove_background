/* Landing build: purple burger login + brand auto-rotation/logo balancing */
(function(){
  const sessionKey='td-preview-auth-v1';
  const toggle=document.getElementById('mobileMenuToggle');
  const panel=document.getElementById('mobileMenuPanel');
  const content=document.getElementById('mobileMenuContent');

  function menuIsOpen(){
    return !!(panel?.classList.contains('is-open') || toggle?.getAttribute('aria-expanded')==='true');
  }

  function syncMenuClass(){
    const open=menuIsOpen();
    document.body.classList.toggle('td-login-menu-open',open);
    panel?.classList.toggle('td-login-panel',true);
    if(open) ensureLoginForm();
  }

  function ensureLoginForm(){
    if(!content)return null;
    let form=content.querySelector('.td-login-form');
    if(form)return form;
    form=document.createElement('form');
    form.className='td-login-form';
    form.innerHTML=[
      '<h2 class="td-login-title">Log in</h2>',
      '<p class="td-login-subtitle">Demo login. Enter any username and password.</p>',
      '<input class="td-login-user" name="username" autocomplete="username" placeholder="Username or email" aria-label="Username or email">',
      '<input class="td-login-pass" name="password" type="password" autocomplete="current-password" placeholder="Password" aria-label="Password">',
      '<button type="submit">Log in</button>',
      '<p class="td-login-status" role="status" aria-live="polite"></p>'
    ].join('');
    form.addEventListener('submit',event=>{
      event.preventDefault();
      try{sessionStorage.setItem(sessionKey,'true')}catch{}
      document.body.dataset.authPreview='true';
      const user=form.querySelector('.td-login-user')?.value.trim() || 'Demo user';
      const status=form.querySelector('.td-login-status');
      if(status)status.textContent=`Logged in as ${user}`;
      const oldLink=document.getElementById('menuAuthLink');
      if(oldLink)oldLink.firstChild.textContent='Log out (demo)';
    });
    content.append(form);
    return form;
  }

  function focusLoginWhenOpen(){
    if(!menuIsOpen())return;
    window.setTimeout(()=>{
      const input=content?.querySelector('.td-login-user');
      if(input && window.matchMedia('(min-width:761px)').matches) input.focus({preventScroll:true});
    },180);
  }

  function classifyBrandLogos(){
    document.querySelectorAll('.brand-logo-img').forEach(img=>{
      if(img.dataset.tdBalanced==='true')return;
      const name=(img.getAttribute('alt')||'').toLowerCase();
      img.dataset.tdBalanced='true';
      if(/jolly|sour patch|quest|ice breakers|david|lenny|lifesavers|ritter|sour power|swedish|true pinless|mike|pop tarts|popcorners/.test(name)){
        img.classList.add('td-logo-wide');
      }
      if(/m&m|oreo|raw|velo|zyn|alp|axe|kind|tide|twix|advil|tic tac/.test(name)){
        img.classList.add('td-logo-compact');
      }
      if(/hershey|kinder|pringles|takis|red bull|nutella|loacker|trident|skittles|snickers/.test(name)){
        img.classList.add('td-logo-large');
      }
      if(/trojan|always|tylenol|mentos|barebells/.test(name)){
        img.classList.add('td-logo-small');
      }
      if(/hostess|haribo|cheez|hi-chew|planters|duracell|keebler|one bar/.test(name)){
        img.classList.add('td-logo-tall');
      }
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

  ensureLoginForm();
  syncMenuClass();
  classifyBrandLogos();
  installBrandAutoRotate();

  toggle?.addEventListener('click',()=>{
    window.setTimeout(()=>{syncMenuClass();focusLoginWhenOpen()},0);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') window.setTimeout(syncMenuClass,0);
  },true);

  if(panel){
    new MutationObserver(()=>{syncMenuClass();focusLoginWhenOpen()}).observe(panel,{attributes:true,attributeFilter:['class','aria-hidden']});
  }
  const brandRail=document.getElementById('brandCarousel');
  if(brandRail){
    new MutationObserver(classifyBrandLogos).observe(brandRail,{childList:true,subtree:true});
  }
})();
