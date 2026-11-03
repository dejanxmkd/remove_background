/* Header interactions for the customer dashboard prototype. */
(function(){
  const account=document.getElementById('dashboardAccount');
  const menu=document.getElementById('dashboardAccountMenu');
  const store=document.getElementById('dashboardAccountStore');
  const key='td-active-shopping-for-v1';
  const choices=['Fresh Market','City Grocers'];
  let current=choices[0];
  try{const saved=localStorage.getItem(key);if(choices.includes(saved))current=saved;}catch{}
  function sync(){
    store.textContent=current;
    for(const button of menu.querySelectorAll('[data-shop]'))button.setAttribute('aria-current',String(button.dataset.shop===current));
  }
  function closeMenu(){menu.hidden=true;account.setAttribute('aria-expanded','false');}
  sync();
  account.addEventListener('click',()=>{
    const open=menu.hidden;menu.hidden=!open;account.setAttribute('aria-expanded',String(open));
  });
  menu.addEventListener('click',e=>{
    const button=e.target.closest('[data-shop]');if(!button)return;
    current=button.dataset.shop;
    try{localStorage.setItem(key,current)}catch{}
    sync();closeMenu();
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.dashboard-account'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  document.getElementById('dashboardSearch').addEventListener('submit',e=>{
    e.preventDefault();window.location.assign('./index.html#new-title');
  });
  const notifications=document.getElementById('dashboardNotifications');
  notifications.addEventListener('click',()=>{
    notifications.title='Notifications will appear here when connected to the account system';
  });
})();