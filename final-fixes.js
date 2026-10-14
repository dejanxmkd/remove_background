/* Final interaction fixes: stable quantity modal + auth toast */
(()=>{
  const key='td-preview-auth-v1';
  const toastKey='td-auth-toast-v1';
  const shownKey='td-login-ref-toast-shown-v1';

  function injectStableModalStyles(){
    if(document.getElementById('tdFinalFixesStyles'))return;
    const style=document.createElement('style');
    style.id='tdFinalFixesStyles';
    style.textContent=`
      html{scrollbar-gutter:stable!important}
      body.td-qty-open{overflow:visible!important;padding-right:0!important;position:static!important;width:auto!important;top:auto!important}
      body.td-qty-open .site-header{position:sticky!important;top:0!important;left:auto!important;right:auto!important;width:100%!important;z-index:5190!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:none!important}
      body.td-qty-open .site-nav{position:relative!important;z-index:5191!important;opacity:1!important;visibility:visible!important;transform:none!important}
      body.td-qty-open .td-qty-modal{position:fixed!important;inset:0!important;z-index:5200!important}
      body.td-qty-open .td-qty-backdrop{z-index:5200!important}
      body.td-qty-open .td-qty-panel{z-index:5210!important}
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

  injectStableModalStyles();
  authToastOnLoad();
  bindLogoutToast();
  bindLoginToastFlag();
})();
