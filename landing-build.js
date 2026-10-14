/* ==========================================================================
   True Distributors — Landing build (clean rewrite)
   Pricing, add-to-cart modal, cart drawer, burger overlay, auth state.
   No full-screen page-transition overlay. No infinite requestAnimationFrame
   loops that can starve the main thread or block vertical scroll.
   ========================================================================== */
(() => {
  "use strict";

  const AUTH_KEY = "td-preview-auth-v1";
  const RAIL_SEL = "#productCarousel,#dealsProducts,#bestSellerProducts";
  const CARD_SEL =
    "#productCarousel .card,#dealsProducts .card,#bestSellerProducts .card";
  const ADD_SEL =
    "#productCarousel .add,#dealsProducts .add,#bestSellerProducts .add";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const signed = () => {
    try { return sessionStorage.getItem(AUTH_KEY) === "true"; } catch { return false; }
  };
  const money = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
  const show = (el, v) => el && el.style.setProperty("display", v, "important");

  /* Lock background scrolling without changing body positioning or
     resetting scrollY. This keeps the sticky header in place. */
  const lockedOverlays = new Set();
  const lockBody = (cls) => {
    lockedOverlays.add(cls);
    document.body.classList.add(cls, "td-locked");
  };
  const unlockBody = (cls) => {
    lockedOverlays.delete(cls);
    document.body.classList.remove(cls);
    if (!lockedOverlays.size) document.body.classList.remove("td-locked");
  };
  const toast = (msg) => {
    if (typeof notify === "function") return notify(msg);
    const n = $("#notice");
    if (!n) return;
    n.textContent = msg;
    n.classList.add("show");
    setTimeout(() => n.classList.remove("show"), 2300);
  };

  const icon = {
    x: '<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-x" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    minus: '<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-minus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" class="lucide-icon lucide-trash-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  };

  /* ----- Runtime styles (modal, cart, burger overlay) ---------------- */
  const runtimeStyles = () => {
    if ($("#tdRuntimeStyles")) return;
    const s = document.createElement("style");
    s.id = "tdRuntimeStyles";
    s.textContent = `
:root{--td-ease:cubic-bezier(.22,1,.36,1);--td-fast:.22s;--td-mid:.34s;--td-slow:.42s}

/* Scrollbar always reserved so content never shifts horizontally when any
   overlay opens. The JS-managed body-lock below pins the vertical scroll
   position too, so the page behind the modal doesn't jump at all. */
html{scrollbar-gutter:stable}
body.td-locked{overflow:clip;touch-action:none}
body.td-cart-open .site-header{position:sticky!important;top:0;z-index:1000!important;visibility:visible!important;opacity:1!important}
body.td-login-menu-open .site-header{position:sticky!important;top:0;z-index:2700!important;visibility:visible!important}
body.td-login-menu-open .mobile-menu-toggle{position:relative!important;z-index:2701!important;display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
body.td-login-menu-open .mobile-menu-toggle .mobile-menu-open-icon{display:none!important}
body.td-login-menu-open .mobile-menu-toggle .mobile-menu-close-icon{display:block!important}

/* ===== Unified page-transition (fade + subtle lift) =====
   Same tokens used by every overlay so navigation feels consistent.
   Entering: body starts hidden, fades in once JS clears the class.
   Leaving:  internal link click sets "leaving" → fade out, then navigate.
   Fallback: without JS the body stays visible — safety timeouts also clear
   the class after 600ms so a slow frame never leaves the page blank. */
body{opacity:1;transform:none;transition:opacity var(--td-slow) var(--td-ease),transform var(--td-slow) var(--td-ease)}
body.td-pt-entering{opacity:0;transform:translateY(8px)}
body.td-pt-leaving{opacity:0;transform:translateY(-8px);transition:opacity var(--td-mid) var(--td-ease),transform var(--td-mid) var(--td-ease)}
@media(prefers-reduced-motion:reduce){
 body,body.td-pt-entering,body.td-pt-leaving{opacity:1!important;transform:none!important;transition:none!important}
}

/* Quantity modal */
.td-qty-modal{position:fixed;inset:0;z-index:5200;visibility:hidden;pointer-events:none}
.td-qty-modal.is-open{visibility:visible;pointer-events:auto}
.td-qty-backdrop{position:absolute;inset:0;background:rgba(8,7,11,.44);opacity:0;transition:opacity var(--td-fast) ease}
.td-qty-modal.is-open .td-qty-backdrop{opacity:1}
.td-qty-panel{position:absolute;left:50%;top:50%;width:min(460px,calc(100vw - 44px));padding:34px;background:#fff;color:var(--ink);border-radius:26px;display:flex;flex-direction:column;gap:16px;opacity:0;transform:translate(-50%,-44%) scale(.97);box-shadow:0 26px 70px rgba(8,7,11,.24);transition:opacity var(--td-fast) ease,transform var(--td-mid) var(--td-ease)}
.td-qty-modal.is-open .td-qty-panel{opacity:1;transform:translate(-50%,-50%) scale(1)}
.td-qty-close{position:absolute;top:32px;right:34px;display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;border-radius:0;background:transparent;color:var(--purple);cursor:pointer}
.td-qty-close svg{width:26px;height:26px;stroke-width:2.5}
.td-qty-title{margin:0 48px 0 0;min-height:32px;font:950 32px/1 var(--font);letter-spacing:-.055em}
.td-qty-product-image{width:100%;aspect-ratio:1/1;height:auto;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:18px;background:#f5f4f8}
.td-qty-product-image[hidden]{display:none}
.td-qty-product-image .picture{width:100%;height:100%;min-height:0;flex:1;border:0;margin:0;border-radius:18px}
.td-qty-product-image img{display:block;width:100%;height:100%;object-fit:contain}
.td-qty-info-row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;column-gap:12px;row-gap:8px;margin-top:18px;margin-bottom:6px}
.td-qty-meta{margin:0;color:#6f6a78;font:750 13px/1.3 var(--font);letter-spacing:-.02em;white-space:nowrap}
.td-qty-subtotal{margin:0 0 0 auto;display:flex;align-items:baseline;gap:6px;text-align:right;color:var(--ink);white-space:nowrap}
.td-qty-subtotal span{display:inline;font:850 14px/1.2 var(--font);color:#09070d;letter-spacing:-.02em}
.td-qty-subtotal strong{display:inline;font:850 14px/1.2 var(--font);letter-spacing:-.02em;color:var(--ink)}
.td-qty-row{display:grid;grid-template-columns:58px minmax(0,1fr) 58px;gap:12px;margin-top:4px}
.td-qty-step{display:grid;place-items:center;height:58px;border:0;border-radius:18px;background:var(--purple);color:#fff;cursor:pointer;transition:background var(--td-fast) ease}
.td-qty-step:hover{background:#4b21a6}
.td-qty-step svg{width:18px;height:18px;stroke-width:3}
.td-qty-input{height:58px;border:1px solid #eeeaf3;border-radius:18px;background:#fbfaff;color:var(--ink);font:950 22px var(--font);text-align:center}
.td-qty-input::-webkit-outer-spin-button,.td-qty-input::-webkit-inner-spin-button{appearance:none;margin:0}
.td-qty-submit{min-height:62px;border:0;border-radius:999px;background:var(--purple);color:#fff;font:900 15px var(--font);letter-spacing:.055em;text-transform:uppercase;margin-top:4px;cursor:pointer;transition:background var(--td-fast) ease}
.td-qty-submit:hover{background:#4b21a6}

/* Cart drawer */
.td-cart-drawer{position:fixed;inset:0;z-index:2147483647!important;visibility:hidden;pointer-events:none}
.td-cart-drawer.is-open{visibility:visible;pointer-events:auto}
.td-cart-backdrop{position:absolute;inset:0;background:rgba(8,7,11,.42);opacity:0;transition:opacity var(--td-fast) ease}
.td-cart-drawer.is-open .td-cart-backdrop{opacity:1}
.td-cart-panel{position:absolute;top:0;right:0;width:min(430px,100vw);height:100%;display:flex;flex-direction:column;gap:20px;padding:30px;background:#fff;color:var(--ink);box-shadow:-24px 0 60px rgba(8,7,11,.18);transform:translateX(104%);transition:transform var(--td-mid) var(--td-ease)}
.td-cart-drawer.is-open .td-cart-panel{transform:translateX(0)}
.td-cart-close{position:absolute;top:20px;right:22px;display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:50%;background:#f2eff9;color:var(--purple);cursor:pointer}
.td-cart-close svg{width:24px;height:24px;stroke-width:2.5}
.td-cart-panel h2{margin:0 50px 4px 0;font:900 34px/1 var(--font);letter-spacing:-.055em}
.td-cart-items{flex:1;display:flex;flex-direction:column;gap:12px;overflow:auto;min-height:0;padding-right:4px}
.td-cart-empty{color:#77717f;font:650 14px/1.5 var(--font)}
.td-cart-item{display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid #eeeaf3;border-radius:16px;padding:14px;background:#faf9fd}
.td-cart-item-main{min-width:0;display:flex;flex-direction:column;gap:6px}
.td-cart-item strong{font:850 14px/1.25 var(--font)}
.td-cart-item span{font:700 12px var(--font);color:var(--purple)}
.td-cart-qty{display:inline-flex;align-items:center;gap:8px;margin-top:2px}
.td-cart-qty button{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:50%;background:var(--purple);color:#fff;cursor:pointer;transition:background var(--td-fast) ease}
.td-cart-qty button:hover{background:#4b21a6}
.td-cart-qty button svg{width:14px;height:14px;stroke-width:3}
.td-cart-qty em{min-width:22px;text-align:center;font:900 13px var(--font);font-style:normal}
.td-cart-item-side{display:flex;flex-direction:column;align-items:flex-end;gap:12px;flex:none}
.td-cart-item b{font:900 15px var(--font);white-space:nowrap}
.td-cart-remove{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:50%;background:#e13d3d;color:#fff;cursor:pointer;transition:background var(--td-fast) ease}
.td-cart-remove:hover{background:#c92f2f}
.td-cart-remove svg{width:16px;height:16px;stroke-width:2.6}
.td-cart-total{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #eeeaf3;padding-top:18px;font:800 15px var(--font)}
.td-cart-total strong{font:950 24px var(--font);letter-spacing:-.04em}
.td-cart-checkout{min-height:54px;border:0;border-radius:999px;background:var(--purple);color:#fff;font:900 14px var(--font);letter-spacing:.04em;text-transform:uppercase;cursor:pointer;transition:background var(--td-fast) ease}
.td-cart-checkout:hover{background:#4b21a6}

/* Burger full-screen purple menu — smooth open/close with clip-path */
.mobile-menu-panel.td-login-panel{position:fixed!important;inset:0!important;z-index:2500!important;width:100vw!important;height:100dvh!important;background:var(--purple)!important;color:#fff!important;padding:0!important;overflow:hidden!important;display:grid!important;grid-template-rows:1fr!important;visibility:hidden;clip-path:inset(0 0 100% 0);transition:clip-path var(--td-mid) var(--td-ease),visibility 0s linear var(--td-mid)}
body.td-login-menu-open .mobile-menu-panel.td-login-panel{visibility:visible;clip-path:inset(0 0 0 0);transition:clip-path var(--td-mid) var(--td-ease),visibility 0s}
.mobile-menu-panel.td-login-panel .mobile-menu-reveal{height:100%!important;overflow:hidden!important}
.mobile-menu-panel.td-login-panel .mobile-menu-content{width:min(620px,calc(100% - 44px))!important;height:100%!important;margin:0 auto!important;padding:92px 0 42px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;transform:none!important;gap:0!important}
.mobile-menu-panel.td-login-panel .shopping-user,.mobile-menu-panel.td-login-panel .quick-shop-button,.mobile-menu-panel.td-login-panel .shopping-nav-separator,.mobile-menu-panel.td-login-panel .menu-auth-link{display:none!important}
/* Header + nav items transition smoothly in and out with the menu */
.site-header{transition:background var(--td-mid) var(--td-ease),border-color var(--td-mid) var(--td-ease)}
.site-nav-logo,.header-search-toggle,.shopping-cart-button,.quick-shop-button,.shopping-nav-separator,.shopping-user{transition:opacity var(--td-fast) var(--td-ease)}
.mobile-menu-toggle{transition:color var(--td-fast) var(--td-ease)}
body.td-login-menu-open .site-header{background:var(--purple)!important;border-bottom-color:transparent!important}
body.td-login-menu-open .site-nav-logo,body.td-login-menu-open .header-search-toggle,body.td-login-menu-open .shopping-cart-button,body.td-login-menu-open .quick-shop-button,body.td-login-menu-open .shopping-nav-separator,body.td-login-menu-open .shopping-user{opacity:0!important;pointer-events:none!important}
body.td-login-menu-open .mobile-menu-toggle{color:#fff!important}
.td-burger-nav{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
.td-burger-link{color:#fff!important;text-decoration:none!important;font:950 clamp(30px,4.2vw,52px) var(--font);letter-spacing:.035em;line-height:1.05;text-align:center;opacity:0;transform:translateY(14px);transition:opacity var(--td-fast) ease,transform var(--td-mid) var(--td-ease)}
body.td-login-menu-open .td-burger-link{opacity:1;transform:translateY(0)}
body.td-login-menu-open .td-burger-link:nth-child(1){transition-delay:.08s}
body.td-login-menu-open .td-burger-link:nth-child(2){transition-delay:.12s}
body.td-login-menu-open .td-burger-link:nth-child(3){transition-delay:.16s}
body.td-login-menu-open .td-burger-link:nth-child(4){transition-delay:.20s}
body.td-login-menu-open .td-burger-link:nth-child(5){transition-delay:.24s}
body.td-login-menu-open .td-burger-link:nth-child(6){transition-delay:.28s}
.td-burger-link:hover,.td-burger-link:focus-visible{opacity:.75;outline:none}
@media(max-width:760px){
 body.td-cart-open .site-header{z-index:1000!important}
 body.td-cart-open .td-cart-drawer{z-index:9000!important;inset:0!important}
 body.td-cart-open .td-cart-panel{height:100dvh;max-height:100dvh;padding-top:max(26px,env(safe-area-inset-top));padding-bottom:max(22px,env(safe-area-inset-bottom))}
 body.td-cart-open .td-cart-close{z-index:1;top:max(18px,env(safe-area-inset-top));right:22px;visibility:visible;opacity:1;pointer-events:auto}
}
@media(max-width:760px){.td-burger-nav{gap:18px}.td-burger-link{font-size:38px}.td-cart-panel{width:100vw;padding:26px 22px}.td-qty-panel{left:0;right:0;top:auto;bottom:0;width:100%;max-width:none;border-radius:26px 26px 0 0;padding:30px 22px 28px;transform:translateY(105%);opacity:1}.td-qty-modal.is-open .td-qty-panel{transform:translateY(0)}.td-qty-title{font-size:28px;margin-right:42px}.td-qty-close{top:29px;right:22px}.td-qty-info-row{margin-top:18px}.td-qty-meta{font-size:12px}.td-qty-subtotal span{font-size:14px}.td-qty-subtotal strong{font-size:14px}}
@media(prefers-reduced-motion:reduce){.td-qty-backdrop,.td-qty-panel,.td-cart-backdrop,.td-cart-panel,.td-burger-link{transition:none!important}}
`;
    document.head.append(s);
  };

  /* ----- Pricing on cards ------------------------------------------- */
  const pricing = () => {
    $$(CARD_SEL).forEach((card, i) => {
      const purchase = $(".purchase", card);
      const request = $(".request-price-link", card);
      if (!purchase || !request) return;
      const off = card.closest("#dealsProducts") ? 100 : card.closest("#bestSellerProducts") ? 200 : 0;
      const old = (19.99 + (off + i) * 0.75).toFixed(2);
      const now = (12.99 + (off + i) * 0.55).toFixed(2);
      if (card.dataset.priced !== "1") {
        card.dataset.priced = "1";
        const d = document.createElement("div");
        d.className = "prices td-product-prices";
        d.innerHTML = `<span class="old">$${old}</span><span class="new-price" data-product-price>$${now}</span>`;
        purchase.insertBefore(d, request);
      }
      const add = $(".add", card);
      if (add) {
        add.dataset.name = $(".product-title", card)?.textContent?.trim() || "Product name";
        add.dataset.item = $(".item", card)?.textContent?.replace(/^Item\s*/, "").trim() || "#" + (48720 + i);
        add.dataset.price = "$" + now;
        add.setAttribute("aria-label", "Choose quantity and add product to cart");
      }
    });
    productState();
  };

  const productState = () => {
    const s = signed();
    $$(CARD_SEL).forEach((card) => {
      show($(".request-price-link", card), s ? "none" : "inline-flex");
      show($(".add", card), s ? "grid" : "none");
      show($(".prices", card), s ? "flex" : "none");
      show($(".old", card), s ? "block" : "none");
      show($(".new-price,[data-product-price]", card), s ? "block" : "none");
    });
    show($("#shoppingCart"), s ? "inline-grid" : "none");
  };

  /* ----- Quantity modal --------------------------------------------- */
  let qtyModal;
  const buildQty = () => {
    if (qtyModal) return qtyModal;
    qtyModal = document.createElement("aside");
    qtyModal.id = "tdQuantityModal";
    qtyModal.className = "td-qty-modal";
    qtyModal.setAttribute("aria-hidden", "true");
    qtyModal.innerHTML = `
      <div class="td-qty-backdrop" data-close></div>
      <section class="td-qty-panel" role="dialog" aria-modal="true">
        <button class="td-qty-close" type="button" data-close aria-label="Close">${icon.x}</button>
        <h2 class="td-qty-title">Product name</h2>
        <div class="td-qty-product-image" aria-label="Product image"></div>
        <div class="td-qty-info-row">
          <p class="td-qty-meta"></p>
          <p class="td-qty-subtotal"><span>Subtotal:</span><strong>$0.00</strong></p>
        </div>
        <div class="td-qty-row">
          <button class="td-qty-step" type="button" data-step="-1" aria-label="Decrease">${icon.minus}</button>
          <input class="td-qty-input" type="number" min="1" step="1" value="1">
          <button class="td-qty-step" type="button" data-step="1" aria-label="Increase">${icon.plus}</button>
        </div>
        <button class="td-qty-submit" type="button">Add to cart</button>
      </section>`;
    document.body.append(qtyModal);
    qtyModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) return closeQty();
      const st = e.target.closest("[data-step]");
      if (st) {
        const input = $(".td-qty-input", qtyModal);
        input.value = String(Math.max(1, (parseInt(input.value, 10) || 1) + +st.dataset.step));
        updateSubtotal();
      }
      if (e.target.closest(".td-qty-submit")) {
        const q = Math.max(1, parseInt($(".td-qty-input", qtyModal).value, 10) || 1);
        addCart({ key: qtyModal.dataset.item, name: qtyModal.dataset.name, item: qtyModal.dataset.item, price: qtyModal.dataset.price, qty: q });
        closeQty();
        toast("Product added to cart");
      }
    });
    qtyModal.addEventListener("input", (e) => {
      if (e.target.classList.contains("td-qty-input")) updateSubtotal();
    });
    return qtyModal;
  };
  const updateSubtotal = () => {
    if (!qtyModal) return;
    const q = Math.max(1, parseInt($(".td-qty-input", qtyModal).value, 10) || 1);
    const price = money(qtyModal.dataset.price || "0");
    const strong = $(".td-qty-subtotal strong", qtyModal);
    if (strong) strong.textContent = "$" + (price * q).toFixed(2);
  };
  const openQty = (btn) => {
    if (!signed()) { window.location.assign("./login.html"); return; }
    const m = buildQty();
    m.dataset.name = btn.dataset.name || "Product name";
    m.dataset.item = btn.dataset.item || "Item";
    m.dataset.price = btn.dataset.price || "$0.00";
    $(".td-qty-title", m).textContent = m.dataset.name;
    // Show the exact visual from the clicked product card, without inventing assets.
    const imageHost = $(".td-qty-product-image", m);
    const sourceVisual = btn.closest(".card")?.querySelector(".picture");
    imageHost.replaceChildren();
    if (sourceVisual) imageHost.append(sourceVisual.cloneNode(true));
    imageHost.hidden = !sourceVisual;
    $(".td-qty-meta", m).textContent = `${m.dataset.item} · ${m.dataset.price}`;
    $(".td-qty-input", m).value = "1";
    updateSubtotal();
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    lockBody("td-qty-open");
  };
  const closeQty = () => {
    const m = $("#tdQuantityModal");
    if (!m || !m.classList.contains("is-open")) return;
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    unlockBody("td-qty-open");
  };

  /* ----- Cart drawer ------------------------------------------------- */
  const cart = [];
  let cartDrawer;
  const buildCart = () => {
    if (cartDrawer) return cartDrawer;
    cartDrawer = document.createElement("aside");
    cartDrawer.id = "tdCartDrawer";
    cartDrawer.className = "td-cart-drawer";
    cartDrawer.setAttribute("aria-hidden", "true");
    cartDrawer.innerHTML = `
      <div class="td-cart-backdrop" data-close></div>
      <section class="td-cart-panel" role="dialog" aria-modal="true">
        <button class="td-cart-close" type="button" data-close aria-label="Close cart">${icon.x}</button>
        <h2>Cart</h2>
        <div class="td-cart-items"></div>
        <div class="td-cart-total"><span>Total</span><strong>$0.00</strong></div>
        <button class="td-cart-checkout" type="button">Checkout</button>
      </section>`;
    document.body.append(cartDrawer);
    cartDrawer.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) return closeCart();
      const rm = e.target.closest("[data-remove]");
      if (rm) { cart.splice(+rm.dataset.remove, 1); renderCart(); badge(); return; }
      const q = e.target.closest("[data-qty]");
      if (q) { const it = cart[+q.dataset.qty]; if (it) { it.qty = Math.max(1, it.qty + +q.dataset.step); renderCart(); badge(); } }
    });
    return cartDrawer;
  };
  const addCart = (x) => {
    const found = cart.find((i) => i.key === x.key);
    if (found) found.qty += x.qty; else cart.push(x);
    renderCart();
    badge();
  };
  const badge = () => {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    const b = $("#cartCount");
    const btn = $("#shoppingCart");
    if (b) { b.textContent = String(n); b.hidden = n === 0; }
    if (btn) btn.setAttribute("aria-label", `Shopping cart, ${n} ${n === 1 ? "item" : "items"}`);
  };
  const renderCart = () => {
    const d = buildCart();
    const list = $(".td-cart-items", d);
    const total = $(".td-cart-total strong", d);
    if (!cart.length) { list.innerHTML = '<p class="td-cart-empty">Your cart is empty.</p>'; total.textContent = "$0.00"; return; }
    list.innerHTML = cart.map((i, x) => `
      <div class="td-cart-item">
        <div class="td-cart-item-main">
          <strong>${i.name}</strong><span>${i.item}</span>
          <div class="td-cart-qty">
            <button type="button" data-qty="${x}" data-step="-1" aria-label="Decrease">${icon.minus}</button>
            <em>${i.qty}</em>
            <button type="button" data-qty="${x}" data-step="1" aria-label="Increase">${icon.plus}</button>
          </div>
        </div>
        <div class="td-cart-item-side">
          <button class="td-cart-remove" type="button" data-remove="${x}" aria-label="Remove">${icon.trash}</button>
          <b>$${(money(i.price) * i.qty).toFixed(2)}</b>
        </div>
      </div>`).join("");
    total.textContent = "$" + cart.reduce((s, i) => s + money(i.price) * i.qty, 0).toFixed(2);
  };
  const openCart = () => {
    if (!signed()) { window.location.assign("./login.html"); return; }
    const d = buildCart();
    renderCart();
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
    lockBody("td-cart-open");
  };
  const closeCart = () => {
    const d = $("#tdCartDrawer");
    if (!d || !d.classList.contains("is-open")) return;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    unlockBody("td-cart-open");
  };

  /* ----- Burger overlay (purple full-screen) ------------------------ */
  const toggle = $("#mobileMenuToggle");
  const panel = $("#mobileMenuPanel");
  const content = $("#mobileMenuContent");
  const isMenuOpen = () => !!(panel?.classList.contains("is-open") || toggle?.getAttribute("aria-expanded") === "true");
  const closeMenu = () => {
    if (!isMenuOpen()) return;
    if (typeof setMobileMenuOpen === "function") setMobileMenuOpen(false, true);
    else panel?.classList.remove("is-open");
    unlockBody("td-login-menu-open");
  };
  const burgerState = () => {
    const a = content?.querySelector(".td-burger-login");
    if (!a) return;
    const s = signed();
    a.textContent = s ? "Logout" : "Login";
    a.href = s ? "#logout" : "./login.html";
  };
  const buildBurger = () => {
    if (!content) return;
    content.querySelector("#menuAuthLink")?.remove();
    let n = content.querySelector(".td-burger-nav");
    if (!n) { n = document.createElement("nav"); n.className = "td-burger-nav"; content.prepend(n); }
    n.innerHTML = [
      '<a class="td-burger-link" href="#top">Home</a>',
      '<a class="td-burger-link" href="#new-title">New Arrivals</a>',
      '<a class="td-burger-link" href="#brands-title">Brands</a>',
      '<a class="td-burger-link" href="#categories-title">Products</a>',
      '<a class="td-burger-link td-burger-contact" href="#footer">Contact us</a>',
      '<a class="td-burger-link td-burger-login" href="./login.html">Login</a>',
    ].join("");
    if (n.dataset.bound === "1") return burgerState();
    n.dataset.bound = "1";
    n.addEventListener("click", (e) => {
      const a = e.target.closest("a"); if (!a) return;
      if (a.classList.contains("td-burger-login") && signed()) {
        e.preventDefault();
        try { sessionStorage.removeItem(AUTH_KEY); } catch {}
        sync(); closeCart(); closeMenu(); return;
      }
      if (a.getAttribute("href")?.startsWith("#")) setTimeout(closeMenu, 0);
    });
    burgerState();
  };
  const syncMenuClass = () => {
    const open = isMenuOpen();
    const wasOpen = document.body.classList.contains("td-login-menu-open");
    panel?.classList.toggle("td-login-panel", true);
    if (open && !wasOpen) lockBody("td-login-menu-open");
    else if (!open && wasOpen) unlockBody("td-login-menu-open");
    if (open) buildBurger();
    burgerState();
  };

  /* ----- Auth sync -------------------------------------------------- */
  const sync = () => {
    document.body.dataset.authPreview = String(signed());
    burgerState();
    productState();
    if (!signed()) closeCart();
    badge();
  };

  /* ----- Page transitions ------------------------------------------- */
  const pageTransitions = () => {
    // Enter: start hidden, clear on next frame so CSS animates it in.
    document.body.classList.add("td-pt-entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.remove("td-pt-entering"));
    });
    // Safety: show the page after 600ms no matter what.
    setTimeout(() => document.body.classList.remove("td-pt-entering"), 600);

    // Back-button / bfcache: reset state so returning doesn't show a stale fade.
    window.addEventListener("pageshow", (e) => {
      document.body.classList.remove("td-pt-leaving", "td-pt-entering", "td-login-menu-open");
      if (e.persisted) {
        // Restored from bfcache — replay the entry animation briefly.
        document.body.classList.add("td-pt-entering");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => document.body.classList.remove("td-pt-entering"));
        });
      }
    });

    // Leave: intercept same-origin link clicks → fade out, then navigate.
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
      } catch { return; }
      e.preventDefault();
      document.body.classList.add("td-pt-leaving");
      setTimeout(() => { window.location.href = a.href; }, 260);
    }, true);
  };

  /* ----- Boot ------------------------------------------------------- */
  runtimeStyles();
  pageTransitions();
  buildBurger();
  pricing();
  sync();
  syncMenuClass();

  // Hook into add buttons + cart button globally
  document.addEventListener("click", (e) => {
    const add = e.target.closest(ADD_SEL);
    if (add) { e.preventDefault(); e.stopImmediatePropagation(); openQty(add); return; }
    const cartBtn = e.target.closest("#shoppingCart");
    if (cartBtn) { e.preventDefault(); e.stopImmediatePropagation(); openCart(); }
  }, true);

  // Escape closes overlays
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("#tdQuantityModal")?.classList.contains("is-open")) closeQty();
    if ($("#tdCartDrawer")?.classList.contains("is-open")) closeCart();
    if (isMenuOpen()) closeMenu();
  });

  // Watch for class changes on the burger panel
  if (panel) new MutationObserver(syncMenuClass).observe(panel, { attributes: true, attributeFilter: ["class", "aria-hidden"] });

  // Re-apply pricing when carousels re-render
  $$(RAIL_SEL).forEach((r) =>
    new MutationObserver(() => { pricing(); productState(); }).observe(r, { childList: true })
  );
})();
