/* True Distributors — requested burger login + brands carousel behavior */
(function(){
  const sessionKey='td-preview-auth-v1';
  const toggle=document.getElementById('mobileMenuToggle');
  const panel=document.getElementById('mobileMenuPanel');
  const content=document.getElementById('mobileMenuContent');

  function isMenuOpen(){
    return toggle?.getAttribute('aria-expanded')==='true' || panel?.classList.contains('is-open');
  }
  function syncMenuState(){
    document.body.classList.toggle('td-menu-open',isMenuOpen());
  }

  function ensureLoginForm(){
    if(!content)return;
    let form=content.querySelector('.td-menu-login');
    if(form)return form;
    form=document.createElement('form');
    form.className='td-menu-login';
    form.setAttribute('autocomplete','on');
    form.innerHTML=`
      <h2 class="td-menu-login-title">Log in</h2>
      <p class="td-menu-login-caption">Demo login. Use any username and password.</p>
      <input name="username" autocomplete="username" placeholder="Username" aria-label="Username" required>
      <input name="password" type="password" autocomplete="current-password" placeholder="Password" aria-label="Password" required>
      <button type="submit">Log in</button>
      <p class="td-menu-login-status" role="status" aria-live="polite"></p>`;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      try{sessionStorage.setItem(sessionKey,'true')}catch{}
      document.body.dataset.authPreview='true';
      const status=form.querySelector('.td-menu-login-status');
      if(status)status.textContent='Logged in — demo mode';
      const oldLink=document.getElementById('menuAuthLink');
      if(oldLink)oldLink.firstChild.textContent='Log out (demo)';
      if(window.notify)window.notify('Logged in — demo mode');
    });
    content.append(form);
    return form;
  }

  function focusLoginWhenOpen(){
    if(!isMenuOpen())return;
    const form=ensureLoginForm();
    setTimeout(()=>form?.querySelector('input')?.focus({preventScroll:true}),140);
  }

  function classifyBrandLogos(){
    const rules=[
      ['logo-extra-wide',/jolly|sour patch|sour power|swedish|ice breakers|true pinless|lenny|lifesavers|david|mike and ike|quest/],
      ['logo-wide',/airheads|barebells|hershey|kidsmania|reese|cheez|hi-chew|hostess|mentos|planters|trident|starburst|takis|trolli|popcorners|ritter|red bull|slim jim/],
      ['logo-large',/kinder|pringles|milka|nutella|loacker|snickers|tylenol|advil/],
      ['logo-compact',/m&m|oreo|raw|velo|zyn|alp|axe|kind|tide|twix|always|amos|duracell|keebler|lays/],
      ['logo-small',/trojan|one bar|tic tac/],
      ['logo-tall',/altoids|giannos|haribo|pop tarts|sahale/]
    ];
    document.querySelectorAll('.brand-logo-img').forEach(img=>{
      const name=(img.getAttribute('alt')||'').toLowerCase();
      img.classList.remove('logo-extra-wide','logo-wide','logo-large','logo-compact','logo-small','logo-tall');
      for(const [className,pattern] of rules){
        if(pattern.test(name)){img.classList.add(className);break;}
      }
      img.dataset.tdSized='true';
    });
  }

  function installBrandsAutoScroll(){
    const rail=document.getElementById('brandCarousel');
    if(!rail || rail.dataset.tdAutoScroll==='true')return;
    rail.dataset.tdAutoScroll='true';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let paused=false;
    let last=performance.now();
    let resumeAt=0;
    const wrap=rail.closest('.carousel-wrap')||rail;
    const pause=()=>{paused=true};
    const resume=()=>{paused=false;resumeAt=performance.now()+900};
    wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')pause()});
    wrap.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')resume()});
    wrap.addEventListener('focusin',pause);
    wrap.addEventListener('focusout',()=>{paused=wrap.contains(document.activeElement);resumeAt=performance.now()+900});
    wrap.addEventListener('pointerdown',()=>{resumeAt=performance.now()+2600},{passive:true});
    wrap.addEventListener('wheel',()=>{resumeAt=performance.now()+1600},{passive:true});

    function tick(now){
      const dt=Math.min(48,now-last);
      last=now;
      if(!paused && !document.hidden && now>resumeAt && !rail.matches(':active')){
        const max=rail.scrollWidth-rail.clientWidth;
        if(max>0){
          rail.scrollLeft+=dt*0.115;
          // If the existing infinite carousel recenters, let it do it. Fallback for normal rails.
          if(rail.scrollLeft>=max-2)rail.scrollLeft=0;
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function boot(){
    ensureLoginForm();
    classifyBrandLogos();
    installBrandsAutoScroll();
    syncMenuState();
  }

  boot();
  window.addEventListener('load',boot,{once:true});
  toggle?.addEventListener('click',()=>setTimeout(()=>{boot();focusLoginWhenOpen()},20));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')setTimeout(syncMenuState,20);
  },true);
  if(panel){
    new MutationObserver(()=>{boot();if(isMenuOpen())ensureLoginForm()}).observe(panel,{attributes:true,attributeFilter:['class','aria-hidden']});
  }
  const brandRail=document.getElementById('brandCarousel');
  if(brandRail){
    new MutationObserver(()=>{classifyBrandLogos();installBrandsAutoScroll()}).observe(brandRail,{childList:true,subtree:true});
  }
})();
