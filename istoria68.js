(function() {
    "use strict";

    var mythologyMapUrl = "https://dimperist.blogspot.com/p/blog-page_214.html?m=1";
    var mythologyOpenNewTab = false;

    var modal = document.getElementById("peristasiExplorerModal");
    var modalBody = document.getElementById("pexpModalBody");
    var zoomOverlay = document.getElementById("pexpImgZoom");
    var zoomTarget = document.getElementById("pexpImgZoomTarget");
    var zoomCap = document.getElementById("pexpImgZoomCap");
    if (!modal) return;

  var histModalOpen = false;
    var histZoomOpen = false;
    var histMapOpen = false;
    var ignorePopCount = 0;
    var ignorePopTimer = null;
   var lastFocusedEl = null;
    var explorerInited = false;
    var ensureExplorerInit = function() {};
    var stepPopulationMilestone = null;
    var capsuleOpen = false;
    var mirrorModalBox = null;
    var subBtns = [];
    var subJourney = null;
    var subToday = null;
   var routePhotos = [];
    var currentStopIdx = 0;
    var renderStop = function() {};
    var selectDestination = function() {};
    var setCompassDirection = function() {};
    var curZoneIdx = 1;
    var selectZone = function() {};
    var loadLiveTemperatures = function() {};
    var renderChurch = function() {};
    var bodyScrollLocked = false;
    var savedBodyPadRight = "";

    function escAttr(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function safeHistoryBack(steps) {
      var n = steps || 1;
      if (n <= 0) return;
      ignorePopCount++;
      if (ignorePopTimer) clearTimeout(ignorePopTimer);
      ignorePopTimer = setTimeout(function() { ignorePopCount = 0; }, 350);
      try {
        if (n === 1) window.history.back();
        else window.history.go(-n);
      } catch (e) {
        ignorePopCount = Math.max(0, ignorePopCount - 1);
      }
    }

    function lockBodyScroll() {
      if (bodyScrollLocked) return;
      var sbw = window.innerWidth - document.documentElement.clientWidth;
      savedBodyPadRight = document.body.style.paddingRight || "";
      if (sbw > 0) {
        var curPad = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = (curPad + sbw) + "px";
      }
      document.body.style.overflow = "hidden";
      bodyScrollLocked = true;
    }

    function unlockBodyScroll() {
      if (!bodyScrollLocked) return;
      if (modal.classList.contains("is-open") || isMapZoomed || isRegMapZoomed || (zoomOverlay && zoomOverlay.classList.contains("is-open"))) {
        return;
      }
      document.body.style.overflow = "";
      document.body.style.paddingRight = savedBodyPadRight;
      bodyScrollLocked = false;
    }
    function runAfterBack(didBack, fn) {
      if (!didBack) {
        requestAnimationFrame(fn);
        return;
      }
      var done = false;
      var finish = function() {
        if (done) return;
        done = true;
        window.removeEventListener("popstate", finish);
        requestAnimationFrame(function() { requestAnimationFrame(fn); });
      };
      window.addEventListener("popstate", finish);
      setTimeout(finish, 220);
    }

    try {
      if (window.history.state && (window.history.state.pexpModal || window.history.state.pexpZoom || window.history.state.pfacMapZoom || window.history.state.pregMapZoom)) {
        window.history.replaceState(null, "", window.location.href);
      }
    } catch (e) {}

    function on(id, evt, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener(evt, fn);
    }

 var popTimer = null;
    var routeTimer = null;
    var currentTab = "population";
    var selectDestByStep = null;
    var routeReady = false;
    var elevReady = false;
    var churchesReady = false;
    var weatherLoaded = false;
    var churchesData = [];
    var currentChurchIdx = 0;

  var closeRootBubble = function() {};
    var triggerRootBubble = function() {};
    var closeCapsuleMode = function() {};
    var resetCapsuleView = function() {};
    var openMirrorInModal = function() {};
   var stopCartGame = function() {};
    var stopOlympusGame = function() {};
    var stopCratesGame = function() {};
    var hasActiveSubGame = function() { return false; };
    var isOlympusGuessing = function() { return false; };
 var openPopulationAtYear = function(yr) {
      ensureExplorerInit();
      openPopulationAtYear(yr);
    };
   var closeRegMapZoom = function() {};
    var pauseHeroVideo = function() {};
   var stopMap1922Anim = function() {};
    var stepMap1922Spot = null;
    var clearMap1922Spot = null;
    var isMap1922Active = function() { return false; };
    var openCratesInModal = function() {};
    var openCartGameInModal = function() {};
    var stepRegPinFn = null;
    var activeRootKey = "";
    var mirrorOpen = false;
    var cratesGameOpen = false;
    var isRegMapZoomed = false;
    var histRegMapOpen = false;

   function scrollInsideModal(el) {
      if (!el) return;
      if (modalBody && modalBody.contains(el)) {
        var bRect = modalBody.getBoundingClientRect();
        var eRect = el.getBoundingClientRect();
        var scaleY = (modalBody.clientHeight > 0) ? (bRect.height / modalBody.clientHeight) : 1;
        var targetTop = Math.max(0, modalBody.scrollTop + (eRect.top - bRect.top) / (scaleY || 1) - 12);
        if (modalBody.scrollTo) modalBody.scrollTo({ top: targetTop, behavior: "smooth" });
        else modalBody.scrollTop = targetTop;
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    if (!document.getElementById("pexpInteractiveStyles")) {
      var extraCss = document.createElement("style");
      extraCss.id = "pexpInteractiveStyles";
      extraCss.textContent =
        ".pexp-stop-toprow{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}" +
        ".pexp-stop-toprow .pexp-stop-badge{margin:0!important}" +
        ".pexp-route-play-btn{border:1px solid #93c5fd;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:12.5px;padding:5px 12px;border-radius:999px;cursor:pointer;transition:all .2s;white-space:nowrap}" +
        ".pexp-route-play-btn:hover{background:#dbeafe}" +
        ".pexp-route-play-btn.is-playing{background:#1e6cff;border-color:#1e6cff;color:#fff}" +
        "#pexpSubToday .pexp-vehicles-grid{grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}" +
        ".pexp-vehicle-card--1922{background:#fffbeb!important;border-color:#fcd34d!important}" +
        ".pexp-vehicle-card--1922 .pexp-vehicle-val{color:#b45309!important}" +
        ".pexp-speed-track{display:block;width:100%;height:6px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;margin-top:8px}" +
        ".pexp-speed-fill{display:block;height:100%;width:0;border-radius:999px;transition:width .45s cubic-bezier(.22,1,.36,1)}" +
        ".pexp-fill-car{background:#059669}.pexp-fill-bike{background:#0284c7}.pexp-fill-walk{background:#d97706}.pexp-fill-cart{background:#b45309}" +
        ".pexp-zoom-nav{position:fixed;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(15,23,42,.72);color:#fff;font-size:24px;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:100020;user-select:none}" +
        ".pexp-zoom-nav:hover{background:rgba(30,108,255,.9)}" +
        ".pexp-zoom-prev{left:14px}.pexp-zoom-next{right:14px}" +
        ".pexp-zoom-close{position:fixed;top:16px;right:18px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(15,23,42,.72);color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:100021}" +
        ".pexp-zoom-close:hover{background:rgba(220,38,38,.85)}" +
        ".pexp-church-photo{height:310px!important;object-fit:contain!important;background:linear-gradient(180deg,#dbeafe 0%,#eff6ff 100%)!important;padding:6px}" +
        ".pexp-house-big,.pexp-root-badge{cursor:pointer;transition:transform .18s,box-shadow .18s}" +
        ".pexp-house-big:hover,.pexp-root-badge:hover{transform:translateY(-2px) scale(1.07)}" +
        ".pexp-root-badge.is-selected{box-shadow:0 0 0 3px rgba(30,108,255,.35)}" +
        ".pexp-roots-hint{font-size:12px;color:#475569;text-align:center;margin:8px 0 4px;font-weight:600}" +
        ".pexp-root-pop{margin-top:10px;padding:12px 14px;border-radius:14px;border:2px solid var(--r-border,#93c5fd);background:var(--r-bg,#eff6ff);color:#1e293b;text-align:left}" +
        ".pexp-root-pop-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}" +
        ".pexp-root-pop-title{font-weight:800;font-size:14px;color:var(--r-accent,#1d4ed8)}" +
        ".pexp-root-pop-close{border:none;background:rgba(15,23,42,.08);color:#334155;width:26px;height:26px;border-radius:50%;cursor:pointer;font-weight:700}" +
        ".pexp-root-pop-desc{font-size:13.5px;line-height:1.5;margin-bottom:8px}" +
        ".pexp-root-pop-tags{display:flex;flex-wrap:wrap;gap:6px}" +
        ".pexp-root-pop-tag{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#fff;border:1px solid var(--r-border,#93c5fd);color:#334155}" +
        ".pexp-root-pop-cta{margin-top:9px;border:none;background:var(--r-accent,#1e6cff);color:#fff;font-size:12.5px;font-weight:700;padding:6px 13px;border-radius:999px;cursor:pointer}" +
        ".school-history-wrapper a.image-link img{cursor:zoom-in}" +
        ".pexp-tl-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}" +
        ".pexp-tl-bridge-btn{display:inline-flex;align-items:center;gap:5px;border:1.5px solid #93c5fd;background:#eff6ff;color:#1d4ed8;font-size:12.5px;font-weight:700;padding:5px 13px;border-radius:999px;cursor:pointer;transition:all .2s;font-family:inherit}" +
        ".pexp-tl-bridge-btn:hover{background:#1e6cff;border-color:#1e6cff;color:#fff;transform:translateY(-1px)}" +
        ".pexp-capsule-stone{background:linear-gradient(135deg,#eef2ff 0%,#fef3c7 100%)!important;border-color:#818cf8!important;color:#3730a3!important;font-weight:800!important}" +
        ".pexp-capsule-stone.is-active{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)!important;border-color:#4f46e5!important;color:#fff!important}" +
        ".pexp-mirror-stone{background:linear-gradient(135deg,#fffbeb 0%,#eff6ff 100%)!important;border-color:#f59e0b!important;color:#92400e!important;font-weight:800!important}" +
        ".pexp-mirror-stone.is-active{background:linear-gradient(135deg,#d97706 0%,#1e6cff 100%)!important;border-color:#d97706!important;color:#fff!important}" +
        ".pexp-capsule-box{margin-top:12px;padding:14px;border-radius:16px;border:2px solid #a5b4fc;background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%);color:#1e293b;text-align:left}" +
        ".pexp-caps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:8px;margin:10px 0}" +
        ".pexp-caps-item{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border-radius:12px;border:2px solid #cbd5e1;background:#fff;color:#1e293b;text-align:left;cursor:pointer;transition:all .18s;font-family:inherit}" +
        ".pexp-caps-item:hover{border-color:#818cf8;transform:translateY(-1px)}" +
        ".pexp-caps-item.is-picked{border-color:#4f46e5;background:#eef2ff;box-shadow:0 0 0 2px rgba(79,70,229,.18)}" +
        ".pexp-caps-item strong{font-size:13px;color:#1e1b4b}" +
        ".pexp-caps-item span{font-size:12px;color:#475569;line-height:1.35}" +
        ".pexp-caps-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:6px}" +
        ".pexp-caps-seal-btn{border:none;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#fff;font-weight:800;font-size:13px;padding:8px 16px;border-radius:999px;cursor:pointer;transition:opacity .2s}" +
        ".pexp-caps-seal-btn:disabled{opacity:.45;cursor:not-allowed}" +
        ".pexp-caps-sealed{margin-top:6px;padding:12px 14px;border-radius:14px;border:2px solid #fcd34d;background:#fffbeb;color:#78350f}" +
        ".pexp-game-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:10px 0}" +
        ".pexp-game-trigger{border:1.5px solid #93c5fd;background:#eff6ff;color:#1d4ed8;font-weight:800;font-size:13px;padding:7px 14px;border-radius:999px;cursor:pointer;transition:all .2s;font-family:inherit}" +
        ".pexp-game-trigger:hover{background:#dbeafe;transform:translateY(-1px)}" +
        ".pexp-game-trigger.is-active{background:#1e6cff;border-color:#1e6cff;color:#fff}" +
        ".pexp-game-trigger--green{border-color:#6ee7b7;background:#ecfdf5;color:#047857}" +
        ".pexp-game-trigger--green:hover{background:#d1fae5}" +
        ".pexp-game-trigger--green.is-active{background:#059669;border-color:#059669;color:#fff}" +
        ".pexp-game-trigger--amber{border-color:#fcd34d;background:#fffbeb;color:#b45309}" +
        ".pexp-game-trigger--amber:hover{background:#fef3c7}" +
        ".pexp-game-trigger--amber.is-active{background:#d97706;border-color:#d97706;color:#fff}" +
        ".pexp-pack-card{margin:10px 0 12px;padding:14px;border-radius:16px;border:2px solid var(--pk-border,#93c5fd);background:var(--pk-bg,#eff6ff);color:#1e293b;text-align:left}" +
        ".pexp-pack-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:10px 0}" +
        ".pexp-pack-item{display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:12px;border:2px solid #cbd5e1;background:#fff;color:#1e293b;font-weight:700;font-size:13px;text-align:left;cursor:pointer;transition:all .18s;font-family:inherit}" +
        ".pexp-pack-item:hover{border-color:#60a5fa;transform:translateY(-1px)}" +
        ".pexp-pack-item.is-right{border-color:#10b981;background:#ecfdf5;color:#065f46}" +
        ".pexp-pack-item.is-wrong{border-color:#fca5a5;background:#fef2f2;color:#991b1b;opacity:.85}" +
        ".pexp-pack-item.is-dim{opacity:.48;cursor:default}" +
        ".pexp-pack-msg{margin-top:6px;padding:9px 12px;border-radius:11px;background:#fff;border:1px solid rgba(15,23,42,.1);font-size:13px;line-height:1.45}" +
        ".pexp-oly-banner{margin:8px 0 10px;padding:12px 14px;border-radius:15px;border:2px solid #6ee7b7;background:linear-gradient(180deg,#ecfdf5 0%,#f0fdf4 100%);color:#064e3b;text-align:left}" +
        ".pexp-oly-q{font-size:14.5px;font-weight:800;color:#0f172a;margin:4px 0 8px}" +
        ".pexp-oly-fb{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:8px 11px;border-radius:10px;background:#fff;border:1px solid #bbf7d0;font-size:13px;font-weight:600;color:#1e293b}" +
        ".pexp-oly-fb.is-warn{background:#fffbeb;border-color:#fcd34d;color:#92400e}" +
        ".pexp-oly-fb.is-win{background:#dcfce7;border-color:#4ade80;color:#14532d}" +
        "#pexpProfileSvg.is-game-target .pexp-zone-hit{cursor:pointer}" +
        "#pexpProfileSvg.is-game-target .pexp-zone-hit:hover{filter:brightness(1.06)}" +
        ".pexp-mirror-box{margin-top:12px;padding:14px;border-radius:16px;border:2px solid #fbbf24;background:linear-gradient(180deg,#fffbeb 0%,#eff6ff 100%);color:#1e293b;text-align:left}" +
        ".pexp-mirror-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin:8px 0 10px}" +
        ".pexp-mirror-modes,.pexp-mirror-tabs{display:flex;flex-wrap:wrap;gap:6px}" +
        ".pexp-mirror-pill{border:1.5px solid #cbd5e1;background:#fff;color:#334155;font-size:12px;font-weight:800;padding:5px 11px;border-radius:999px;cursor:pointer;transition:all .18s;font-family:inherit}" +
        ".pexp-mirror-pill:hover{border-color:#60a5fa}" +
        ".pexp-mirror-pill.is-active{background:#1e6cff;border-color:#1e6cff;color:#fff}" +
        ".pexp-mirror-tab{border:1.5px solid #fcd34d;background:#fff;color:#78350f;font-size:12.5px;font-weight:800;padding:6px 12px;border-radius:11px;cursor:pointer;transition:all .18s;font-family:inherit}" +
        ".pexp-mirror-tab:hover{background:#fef3c7}" +
        ".pexp-mirror-tab.is-active{background:#d97706;border-color:#d97706;color:#fff}" +
        ".pexp-mirror-pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:8px}" +
        ".pexp-era-card{padding:12px 14px;border-radius:14px;border:2px solid #e2e8f0;background:#fff}" +
        ".pexp-era-1926{background:#fffbeb;border-color:#fcd34d;color:#78350f}" +
        ".pexp-era-2026{background:#eff6ff;border-color:#93c5fd;color:#1e3a8a}" +
        ".pexp-era-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px}" +
        ".pexp-era-yr{font-size:12px;font-weight:900;padding:2px 9px;border-radius:999px}" +
        ".pexp-era-1926 .pexp-era-yr{background:#fde68a;color:#92400e}" +
        ".pexp-era-2026 .pexp-era-yr{background:#dbeafe;color:#1d4ed8}" +
        ".pexp-era-icons{font-size:20px;letter-spacing:3px}" +
        ".pexp-era-title{font-size:14px;font-weight:800;margin:0 0 5px}" +
        ".pexp-era-desc{font-size:13px;line-height:1.48;margin:0}" +
       ".pfac-mirror-btn{display:inline-flex;align-items:center;gap:6px;margin-top:10px;border:2px solid #f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);color:#92400e;font-weight:800;font-size:13px;padding:8px 15px;border-radius:999px;cursor:pointer;transition:all .2s;font-family:inherit}" +
        ".pfac-mirror-btn:hover{background:#fde68a;transform:translateY(-1px)}" +
        ".pfac-card-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}" +
        ".pfac-card-actions .pfac-mirror-btn{margin-top:0}" +
        ".pfac-show-map-btn{display:inline-flex;align-items:center;gap:6px;border:1.8px solid #86efac;background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);color:#166534;font-weight:800;font-size:12.8px;padding:7px 14px;border-radius:999px;cursor:pointer;transition:all .2s;font-family:inherit}" +
        ".pfac-show-map-btn:hover{background:#bbf7d0;border-color:#22c55e;transform:translateY(-1px)}" +
        ".pexp-compass-card{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px;margin:10px 0 14px;padding:14px;border-radius:18px;border:2px solid #bae6fd;background:linear-gradient(135deg,#f0f9ff 0%,#ffffff 100%);text-align:left}" +
        ".pexp-compass-svg-col{flex:0 0 210px;display:flex;justify-content:center}" +
        ".pexp-compass-svg{width:206px;height:206px;display:block;user-select:none}" +
        ".pexp-comp-pt{cursor:pointer;transition:opacity .18s}" +
        ".pexp-comp-pt:hover{opacity:.85}" +
        ".pexp-needle-spin{transition:transform .55s cubic-bezier(.34,1.45,.64,1)}" +
        ".pexp-compass-info{flex:1 1 240px;min-width:220px}" +
        ".pexp-compass-badge{display:inline-block;font-size:12px;font-weight:800;color:#0369a1;background:#e0f2fe;padding:3px 10px;border-radius:999px;margin-bottom:6px}" +
        ".pexp-compass-title{font-size:15px;font-weight:900;color:#0f172a;margin:0 0 6px}" +
        ".pexp-compass-desc{font-size:13px;line-height:1.5;color:#334155;margin:0 0 10px}" +
        ".pexp-compass-btns{display:flex;flex-wrap:wrap;gap:6px}" +
        ".pexp-comp-chip{border:1.5px solid #cbd5e1;background:#fff;color:#1e293b;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;transition:all .18s;font-family:inherit}" +
        ".pexp-comp-chip:hover{border-color:#38bdf8;background:#f0f9ff}" +
        ".pexp-comp-chip.is-active{background:#0284c7;border-color:#0284c7;color:#fff}" +
       ".pfac-map-modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:100015;background:rgba(15,23,42,.82);display:none;align-items:center;justify-content:center;padding:14px}" +
        ".pfac-map-modal-bg.is-open{display:flex}" +
        ".pfac-map-wrap{margin:10px 0 14px;padding:14px;border-radius:18px;border:2px solid #86efac;background:linear-gradient(180deg,#f0fdf4 0%,#ffffff 100%)}" +
        ".pfac-map-wrap.is-zoomed{width:min(96vw,1140px);max-height:92vh;overflow-y:auto;margin:0;box-shadow:0 24px 60px rgba(0,0,0,.5)}" +
        ".pfac-map-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;font-size:13.5px;color:#14532d}" +
        ".pfac-map-head-right{display:flex;flex-wrap:wrap;align-items:center;gap:8px}" +
        ".pfac-map-zoom-btn{border:1.5px solid #16a34a;background:#dcfce7;color:#14532d;font-size:12.5px;font-weight:800;padding:5px 12px;border-radius:999px;cursor:pointer;font-family:inherit;transition:background .18s}" +
        ".pfac-map-zoom-btn:hover{background:#bbf7d0}" +
        ".pfac-map-wrap.is-zoomed .pfac-map-zoom-btn{border-color:#fca5a5;background:#fef2f2;color:#991b1b}" +
        ".pfac-map-svg{width:100%;height:auto;display:block;border-radius:14px;border:2px solid #86efac;background:#ecfdf5;cursor:zoom-in}" +
       ".pfac-map-wrap.is-zoomed .pfac-map-svg{cursor:default;max-height:calc(92vh - 135px);width:auto;max-width:100%;margin:0 auto}" +
       ".pfac-map-node{cursor:pointer}" +
        ".pfac-map-node>circle{transition:stroke-width .15s}" +
        ".pfac-map-node:hover>circle{stroke-width:4.5px}" +
        ".pfac-map-lbl{paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-width:3.5px;stroke-linejoin:round;font-family:system-ui,-apple-system,sans-serif}" +
        ".pfac-map-road-lbl{paint-order:stroke;stroke:#cbd5e1;stroke-width:4px;stroke-linejoin:round;font-family:system-ui,-apple-system,sans-serif}" +
       ".pfac-map-status{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding:9px 13px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;font-size:13.5px;font-weight:700;text-align:left}" +
        ".pfac-map-goto-btn{border:none;background:#1e6cff;color:#fff;font-size:12px;font-weight:800;padding:5px 12px;border-radius:999px;cursor:pointer;font-family:inherit}" +
        ".pexp-era-photo{width:100%;height:148px;object-fit:cover;border-radius:10px;margin-bottom:8px;border:1.5px solid rgba(15,23,42,.12);cursor:zoom-in;background:#f1f5f9;display:block}" +
        ".pexp-root-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;margin:8px 0 10px}" +
        ".pexp-root-fig{margin:0;background:#fff;border:1.5px solid var(--r-border,#93c5fd);border-radius:11px;overflow:hidden;cursor:zoom-in;transition:transform .16s}" +
        ".pexp-root-fig:hover{transform:translateY(-2px)}" +
        ".pexp-root-fig img{width:100%;height:104px;object-fit:cover;display:block;background:#f1f5f9}" +
        ".pexp-root-fig span{display:block;padding:4px 7px;font-size:11.5px;font-weight:700;color:#334155;line-height:1.25}" +
        ".pexp-comp-media{flex:0 0 210px;max-width:100%}" +
        ".pexp-comp-photo{width:210px;max-width:100%;height:138px;object-fit:cover;border-radius:13px;border:2px solid #bae6fd;cursor:zoom-in;display:block;background:#e0f2fe}" +
        ".pexp-comp-cap{font-size:11.5px;font-weight:700;color:#0369a1;margin-top:4px;text-align:center}" +
        ".pexp-tag-photo{cursor:pointer;transition:transform .15s,box-shadow .15s}" +
        ".pexp-tag-photo:hover{transform:translateY(-1px);box-shadow:0 3px 8px rgba(15,23,42,.12)}" +
        ".pexp-oly-win-wrap{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1 1 240px}" +
        ".pexp-oly-win-thumb{width:66px;height:66px;object-fit:cover;border-radius:10px;border:2px solid #4ade80;cursor:zoom-in;flex-shrink:0;background:#fff}" +
        ".pfac-photo-row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;margin:8px 0 10px}" +
        ".pfac-card-photo-wrap{flex:0 0 235px;max-width:100%}" +
        ".pfac-card-photo{width:235px;max-width:100%;height:152px;object-fit:cover;border-radius:13px;border:2px solid var(--pfac-border,#93c5fd);cursor:zoom-in;display:block;background:#f8fafc}" +
        ".pfac-card-photo-cap{font-size:11.5px;color:#475569;font-weight:700;margin-top:4px;text-align:center}" +
        ".pfac-story-col{flex:1 1 250px;min-width:210px}" +
       ".pfac-map-thumb{width:64px;height:46px;object-fit:cover;border-radius:8px;border:1.5px solid #93c5fd;cursor:zoom-in;flex-shrink:0;background:#fff}" +
        ".pfac-map-status-left{display:flex;align-items:center;gap:10px;flex:1 1 240px;min-width:0;max-width:100%}" +
        "#pexpImgZoom{z-index:2147483647!important}" +
        ".pfac-portals-wrap{margin:18px 0 8px;text-align:left}" +
        ".pfac-portals-heading{font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px;text-align:center}" +
        ".pfac-portals-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:14px}" +
        "a.pfac-portal-card{display:flex;flex-direction:column;justify-content:space-between;padding:15px 16px;border-radius:18px;text-decoration:none!important;transition:transform .2s,box-shadow .2s;box-shadow:0 6px 18px rgba(15,23,42,.07)}" +
        "a.pfac-portal-card:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(15,23,42,.13)}" +
        "a.pfac-portal-card--geo{background:linear-gradient(135deg,#eff6ff 0%,#ecfdf5 100%);border:2px solid #60a5fa;color:#0f172a!important}" +
        "a.pfac-portal-card--myth{background:linear-gradient(135deg,#fffbeb 0%,#f5f3ff 100%);border:2px solid #f59e0b;color:#0f172a!important}" +
        ".pfac-portal-top{display:flex;align-items:center;gap:8px;margin-bottom:7px}" +
        ".pfac-portal-icon{font-size:24px;line-height:1}" +
        ".pfac-portal-kicker{font-size:11px;font-weight:900;letter-spacing:.4px;padding:3px 9px;border-radius:999px}" +
        ".pfac-portal-card--geo .pfac-portal-kicker{background:#dbeafe;color:#1d4ed8}" +
        ".pfac-portal-card--myth .pfac-portal-kicker{background:#fef3c7;color:#b45309}" +
        ".pfac-portal-title{font-size:16px;font-weight:900;color:#0f172a;margin-bottom:5px;line-height:1.28}" +
        ".pfac-portal-desc{font-size:13px;line-height:1.45;color:#334155;margin-bottom:12px}" +
        ".pfac-portal-cta{display:inline-flex;align-items:center;align-self:flex-start;font-size:12.5px;font-weight:800;padding:6px 13px;border-radius:999px;color:#fff!important}" +
       ".pfac-portal-card--geo .pfac-portal-cta{background:linear-gradient(135deg,#1e6cff 0%,#0284c7 100%)}" +
       ".pfac-portal-card--myth .pfac-portal-cta{background:linear-gradient(135deg,#d97706 0%,#7c3aed 100%)}" +
        ".pexp-crates-box{margin:10px 0 14px;padding:15px;border-radius:18px;border:2px solid #f59e0b;background:linear-gradient(180deg,#fffbeb 0%,#fefce8 100%);color:#1e293b;text-align:left}" +
        ".pexp-crates-sub{font-size:13px;line-height:1.48;color:#475569;margin-bottom:8px}" +
        ".pexp-crates-prog{display:inline-block;font-size:12px;font-weight:800;color:#92400e;background:#fde68a;padding:3px 10px;border-radius:999px;margin-bottom:10px}" +
        ".pexp-crates-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin-bottom:10px}" +
        ".pexp-crate-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 8px;border-radius:14px;border:2px solid #d97706;background:linear-gradient(180deg,#fef3c7 0%,#fde68a 100%);color:#78350f;cursor:pointer;transition:all .18s;font-family:inherit;text-align:center;box-shadow:0 3px 0 #d97706}" +
        ".pexp-crate-btn:hover{transform:translateY(-2px);filter:brightness(1.03)}" +
        ".pexp-crate-btn.is-opened{background:linear-gradient(180deg,#ffffff 0%,#eff6ff 100%);border-color:#60a5fa;color:#1e3a8a;box-shadow:0 3px 0 #93c5fd}" +
        ".pexp-crate-btn.is-current{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.22);transform:translateY(-2px)}" +
        ".pexp-crate-ico{font-size:24px;line-height:1.1}" +
        ".pexp-crate-num{font-size:12.5px;font-weight:900;line-height:1.2}" +
        ".pexp-crate-state{font-size:11px;font-weight:700;opacity:.88}" +
        ".pexp-crate-reveal{padding:12px 14px;border-radius:14px;background:#ffffff;border:1.5px solid #fcd34d;box-shadow:0 4px 12px rgba(15,23,42,.05)}" +
        ".pexp-crate-rev-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px}" +
        ".pexp-crate-rev-title{font-size:14.5px;font-weight:900;color:#0f172a;margin:0}" +
        ".pexp-crate-rev-range{font-size:11.5px;font-weight:800;color:#92400e;background:#fef3c7;padding:2px 9px;border-radius:999px}" +
        ".pexp-crate-rev-desc{font-size:13.5px;line-height:1.52;color:#334155;margin:0 0 8px}" +
        ".pexp-crate-rev-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}" +
        ".pexp-crate-badge{font-size:12px;font-weight:800;color:#4338ca;background:#eef2ff;border:1px solid #c7d2fe;padding:3px 10px;border-radius:999px}" +
       ".pexp-crates-win{margin-top:10px;padding:12px 14px;border-radius:14px;border:2px solid #4ade80;background:linear-gradient(135deg,#ecfdf5 0%,#f0fdf4 100%);color:#14532d;font-size:13px;line-height:1.48}" +
      ".pexp-modal-body,#pexpModalBody,#pexpImgZoom,.pfac-map-modal-bg,.pfac-map-wrap.is-zoomed{overscroll-behavior:contain!important;touch-action:auto!important}" +
       "@media (max-width:720px){.pexp-modal-topbar{flex-wrap:nowrap!important;align-items:center;gap:8px}#pexpTabs{flex:1 1 auto;min-width:0;display:flex;flex-wrap:nowrap!important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;padding-bottom:2px}#pexpTabs.has-fade-r{-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent 100%);mask-image:linear-gradient(90deg,#000 88%,transparent 100%)}#pexpTabs.has-fade-l{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%)}#pexpTabs.has-fade-l.has-fade-r{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 90%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 90%,transparent 100%)}#pexpTabs::-webkit-scrollbar{display:none}#pexpTabs .pexp-tab-btn{flex:0 0 auto;white-space:nowrap;font-size:12.5px;padding:7px 11px}#pexpCloseBtn{flex-shrink:0}}" +
       "@keyframes pregDashFlow{to{stroke-dashoffset:-28}}" +
        "@keyframes pregBridgeWave{0%{box-shadow:0 0 0 0 rgba(30,108,255,.65)}100%{box-shadow:0 0 0 36px rgba(30,108,255,0)}}" +
        ".pfac-map-modal-bg{z-index:2147483644!important}" +
      ".preg-modal-bg{position:fixed;inset:0;z-index:2147483644;background:rgba(15,23,42,.84);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:12px;overscroll-behavior:contain!important;touch-action:auto!important}" +
        ".preg-modal-bg.is-open{display:flex}" +
        ".preg-wrap{margin:6px 0 26px;padding:15px;border-radius:22px;border:2px solid #93c5fd;background:linear-gradient(180deg,#f0f9ff 0%,#ffffff 100%);box-shadow:0 10px 28px rgba(15,23,42,.07);text-align:left;box-sizing:border-box}" +
        ".preg-wrap.is-zoomed{width:min(96vw,1480px);max-height:93vh;overflow-y:auto;margin:0;box-shadow:0 26px 65px rgba(0,0,0,.52);overscroll-behavior:contain!important;touch-action:auto!important}" +
          ".preg-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}" +
        ".preg-head-title{font-size:15px;font-weight:900;color:#0f172a;display:flex;align-items:center;gap:6px}" +
        ".preg-head-actions{display:flex;flex-wrap:wrap;align-items:center;gap:7px}" +
        ".preg-head-hint{font-size:12px;font-weight:700;color:#0369a1}" +
        ".preg-wrap.is-zoomed .preg-head-hint{display:none}" +
        ".preg-act-btn{appearance:none;border:1.5px solid #60a5fa;background:#eff6ff;color:#1d4ed8;font-family:inherit;font-size:12px;font-weight:800;padding:5px 12px;border-radius:999px;cursor:pointer;transition:all .18s}" +
        ".preg-act-btn:hover{background:#1e6cff;border-color:#1e6cff;color:#fff;transform:translateY(-1px)}" +
        ".preg-act-btn--bridge{border-color:#10b981;background:#ecfdf5;color:#047857}" +
        ".preg-act-btn--bridge:hover{background:#059669;border-color:#059669;color:#fff}" +
        ".preg-wrap.is-zoomed .preg-zoom-modal-btn{border-color:#fca5a5;background:#fef2f2;color:#991b1b}" +
        ".preg-wrap.is-zoomed .preg-zoom-modal-btn:hover{background:#fee2e2;border-color:#f87171;color:#7f1d1d;transform:none}" +
        ".preg-layers{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}" +
        ".preg-layer-btn{appearance:none;border:1.5px solid #cbd5e1;background:#fff;color:#334155;font-family:inherit;font-size:12.5px;font-weight:800;padding:6px 12px;border-radius:999px;cursor:pointer;transition:all .18s}" +
        ".preg-layer-btn:hover{border-color:#60a5fa;background:#f8fafc}" +
        ".preg-layer-btn.is-active{background:#1e6cff;border-color:#1e6cff;color:#fff;box-shadow:0 4px 12px rgba(30,108,255,.26)}" +
        ".preg-layer-note{display:none;margin-bottom:10px;padding:8px 12px;border-radius:12px;background:#fffbeb;border:1.5px solid #fcd34d;color:#78350f;font-size:12.5px;font-weight:700;line-height:1.45}" +
        ".preg-layer-note.is-vis{display:block}" +
      ".preg-stage{position:relative;width:100%;aspect-ratio:552/339;border-radius:16px;overflow:hidden;border:2px solid #bae6fd;background:#dbeafe;user-select:none;cursor:zoom-in;touch-action:auto!important}" +
       ".preg-wrap.is-zoomed .preg-stage{cursor:default}" +
        "@media (min-width:701px){.preg-wrap.is-zoomed .preg-stage{width:min(100%,calc((92vh - 165px) * 1.63));margin:0 auto}}" +
        ".preg-viewport{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0;will-change:transform;transition:transform .48s cubic-bezier(.22,1,.36,1)}" +
        ".preg-viewport.is-pieria-zoom{transform:translate3d(-6%,-35%,0) scale(1.65)}" +
        ".preg-viewport img.preg-base-img{display:block;width:100%;height:100%;object-fit:fill;margin:0;border-radius:0;border:none;box-shadow:none}" +
        ".preg-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}" +
        ".preg-flow-line{animation:pregDashFlow 1.15s linear infinite}" +
        ".preg-wrap.is-paused .preg-flow-line{animation-play-state:paused!important}" +
        ".preg-zoom-pill{position:absolute;top:10px;left:10px;z-index:9;appearance:none;border:1.5px solid rgba(255,255,255,.85);background:rgba(15,23,42,.76);color:#fff;font-family:inherit;font-size:11.5px;font-weight:800;padding:5px 11px;border-radius:999px;cursor:pointer;backdrop-filter:blur(4px);box-shadow:0 3px 10px rgba(0,0,0,.22);transition:all .18s}" +
        ".preg-zoom-pill:hover{background:#1e6cff}" +
        ".preg-zoom-pill.is-active{background:#0284c7;border-color:#bae6fd}" +
        ".preg-pin{position:absolute;width:28px;height:28px;transform:translate(-50%,-50%);z-index:5;appearance:none;border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:left .48s cubic-bezier(.22,1,.36,1),top .48s cubic-bezier(.22,1,.36,1),transform .18s,opacity .2s}" +
        '.preg-pin::before{content:"";position:absolute;inset:-8px;border-radius:50%}' +
          ".preg-pin--home{width:33px;height:33px;z-index:6}" +
        ".preg-wrap.is-zoomed .preg-pin{width:32px;height:32px}" +
        ".preg-wrap.is-zoomed .preg-pin--home{width:38px;height:38px}" +
        ".preg-pin:hover{z-index:10;transform:translate(-50%,-50%) scale(1.12)}" +
        ".preg-pin.is-selected{z-index:11}" +
        ".preg-pin.is-hidden-layer{opacity:0;pointer-events:none;transform:translate(-50%,-50%) scale(.4)}" +
        ".preg-pin-dot{width:100%;height:100%;border-radius:50%;background:var(--pp-bg,#1e6cff);border:2.5px solid #fff;box-shadow:0 3px 10px rgba(15,23,42,.34);display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;transition:transform .18s,box-shadow .18s}" +
        ".preg-pin--home .preg-pin-dot{font-size:16px;border:2.5px solid #fde047;box-shadow:0 0 0 3px rgba(220,38,38,.28),0 5px 12px rgba(15,23,42,.38)}" +
        ".preg-wrap.is-zoomed .preg-pin-dot{font-size:15.5px}" +
        ".preg-wrap.is-zoomed .preg-pin--home .preg-pin-dot{font-size:18px}" +
        ".preg-pin.is-selected .preg-pin-dot{box-shadow:0 0 0 4px rgba(250,204,21,.92),0 6px 15px rgba(15,23,42,.42);transform:scale(1.12)}" +
        ".preg-pin.is-zoom-bridging .preg-pin-dot{animation:pregBridgeWave .55s ease-out 2}" +
        ".preg-pin-lbl{position:absolute;left:50%;bottom:calc(100% + 7px);transform:translateX(-50%) translateY(3px);background:rgba(15,23,42,.92);color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.28);pointer-events:none;opacity:0;visibility:hidden;transition:opacity .16s,transform .16s}" +
        ".preg-pin--right .preg-pin-lbl{left:calc(100% + 7px);bottom:auto;top:50%;transform:translateY(-50%)}" +
        ".preg-pin.is-selected .preg-pin-lbl{opacity:1;visibility:visible;background:#1e6cff;color:#fff;border:1.5px solid #fff;transform:translateX(-50%) translateY(0)}" +
        ".preg-pin--home.is-selected .preg-pin-lbl{background:#dc2626}" +
        ".preg-pin--right.is-selected .preg-pin-lbl{transform:translateY(-50%)}" +
        "@media (hover:hover){.preg-pin:hover .preg-pin-lbl,.preg-pin:focus-visible .preg-pin-lbl{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}.preg-pin--right:hover .preg-pin-lbl,.preg-pin--right:focus-visible .preg-pin-lbl{transform:translateY(-50%)}}" +
        ".preg-ruler-float{position:absolute;right:10px;bottom:10px;z-index:9;background:rgba(15,23,42,.88);color:#fde047;border:1.5px solid #fde047;font-size:11.5px;font-weight:900;padding:4px 11px;border-radius:999px;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(15,23,42,.32);backdrop-filter:blur(4px);display:none}" +
        ".preg-ruler-float.is-vis{display:inline-flex;align-items:center;gap:5px}" +
        ".preg-quick-strip{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding:2px 0}" +
        ".preg-qchip{appearance:none;border:1.5px solid #cbd5e1;background:#fff;color:#334155;font-family:inherit;font-size:12px;font-weight:800;padding:5px 10px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:all .16s}" +
        ".preg-qchip:hover{border-color:#60a5fa;background:#f0f9ff}" +
        ".preg-qchip.is-active{background:var(--qc-bg,#1e6cff);border-color:var(--qc-bg,#1e6cff);color:#fff;box-shadow:0 3px 10px rgba(15,23,42,.16)}" +
        ".preg-qchip.is-hidden-layer{display:none}" +
        ".preg-panel{margin-top:10px;padding:14px 16px;border-radius:16px;background:#fff;border:2px solid #bfdbfe;box-shadow:0 4px 14px rgba(15,23,42,.04)}" +
      "@media (min-width:1200px){.preg-wrap.is-zoomed .preg-body-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}.preg-wrap.is-zoomed .preg-panel{margin-top:0}}" +
        ".preg-panel-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}" +
        ".preg-panel-title{font-size:15.5px;font-weight:900;color:#0f172a;margin:0}" +
        ".preg-panel-nav{display:flex;align-items:center;gap:6px}" +
        ".preg-step-btn{appearance:none;border:1.5px solid #cbd5e1;background:#f8fafc;color:#1e293b;font-family:inherit;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer}" +
        ".preg-step-btn:hover{border-color:#1e6cff;color:#1e6cff}" +
        ".preg-ruler-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(142px,1fr));gap:8px;margin:8px 0 10px}" +
        ".preg-metric{padding:8px 10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}" +
        ".preg-metric--1922{background:#fffbeb;border-color:#fde68a}" +
        ".preg-metric-lbl{display:block;font-size:11px;font-weight:800;color:#64748b;margin-bottom:2px}" +
        ".preg-metric--1922 .preg-metric-lbl{color:#92400e}" +
        ".preg-metric-val{display:block;font-size:13px;font-weight:900;color:#0f172a;line-height:1.25}" +
        ".preg-metric--1922 .preg-metric-val{color:#b45309}" +
        ".preg-panel-desc{font-size:13.5px;line-height:1.52;color:#334155;margin:0 0 10px;font-weight:600}" +
        ".preg-panel-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px}" +
        ".preg-cta-btn{appearance:none;border:none;background:linear-gradient(135deg,#1e6cff 0%,#0284c7 100%);color:#fff;font-family:inherit;font-size:12.5px;font-weight:800;padding:7px 14px;border-radius:999px;cursor:pointer;transition:transform .16s,box-shadow .16s;box-shadow:0 4px 12px rgba(30,108,255,.25)}" +
        ".preg-cta-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(30,108,255,.34)}" +
        ".preg-cta-btn--sec{background:#ecfdf5;color:#047857;border:1.5px solid #6ee7b7;box-shadow:none}" +
        ".preg-cta-btn--sec:hover{background:#059669;color:#fff;border-color:#059669}" +
        ".pfac-map-wrap.is-bridge-glow{box-shadow:0 0 0 4px #3b82f6,0 16px 36px rgba(30,108,255,.24);transition:box-shadow .35s}" +
        ".pfac-map-macro-btn{border-color:#3b82f6!important;background:#eff6ff!important;color:#1d4ed8!important}" +
        ".pfac-map-macro-btn:hover{background:#dbeafe!important}" +
      "@media (max-width:640px){.preg-wrap{padding:11px 10px}.preg-head-hint{display:none}.preg-pin{width:24px;height:24px}.preg-pin--home{width:28px;height:28px}.preg-pin-dot{font-size:12px;border-width:2px}.preg-pin--home .preg-pin-dot{font-size:14px}.preg-pin-lbl{font-size:10px;padding:2px 7px}.preg-zoom-pill{font-size:10.5px;padding:4px 8px;top:7px;left:7px}.preg-ruler-float{display:none!important}.preg-quick-strip{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:3px}.preg-quick-strip::-webkit-scrollbar{display:none}}" +
        ".pexp-mult-pill{background:#ecfdf5;border:2px solid #34d399;color:#065f46;font-size:.9rem;font-weight:900;padding:6px 13px;border-radius:999px;box-shadow:0 3px 10px rgba(16,185,129,.14);white-space:nowrap}" +
        ".pexp-meadow-scene{transition:background .45s ease,border-color .45s ease}" +
        '.pexp-meadow-scene[data-era="1924"]{background:linear-gradient(180deg,#e0f2fe 0%,#fef3c7 41%,#fde68a 42%,#d9f99d 100%)!important;border-color:#f59e0b!important}' +
        '.pexp-meadow-scene[data-era="1965"]{background:linear-gradient(180deg,#dbeafe 0%,#e0f2fe 41%,#dcfce7 42%,#bbf7d0 100%)!important;border-color:#60a5fa!important}' +
        '.pexp-meadow-scene[data-era="1981"]{background:linear-gradient(180deg,#bae6fd 0%,#e0f2fe 41%,#bbf7d0 42%,#86efac 100%)!important;border-color:#0284c7!important}' +
        '.pexp-meadow-scene[data-era="2006"]{background:linear-gradient(180deg,#dbeafe 0%,#eff6ff 40%,#a7f3d0 41%,#6ee7b7 100%)!important;border-color:#10b981!important}' +
        ".pexp-era-strip{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px;padding:8px 12px;border-radius:14px;background:rgba(255,255,255,.84);border:1.5px solid rgba(15,23,42,.1);backdrop-filter:blur(4px)}" +
        ".pexp-era-now{font-size:12.5px;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:6px}" +
        ".pexp-era-steps{display:flex;flex-wrap:wrap;gap:5px}" +
        ".pexp-era-step{appearance:none;border:1.5px solid #cbd5e1;background:#fff;color:#475569;font-family:inherit;font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:999px;cursor:pointer;opacity:.62;transition:all .18s}" +
        ".pexp-era-step:hover{opacity:1;border-color:#60a5fa;transform:translateY(-1px)}" +
        ".pexp-era-step.is-reached{opacity:.95;color:#0f172a;border-color:#93c5fd}" +
        ".pexp-era-step.is-current{opacity:1;background:#1e6cff;border-color:#1e6cff;color:#fff;box-shadow:0 3px 8px rgba(30,108,255,.28)}" +
        '.pexp-lm-school[data-sera="1924"]{background:#ffedd5!important;border:2px solid #ea580c!important}' +
        '.pexp-lm-school[data-sera="1965"]{background:#f1f5f9!important;border:2px solid #475569!important}' +
        '.pexp-lm-school[data-sera="1981"]{background:#e0f2fe!important;border:2px solid #0284c7!important}' +
        '.pexp-lm-school[data-sera="2006"]{background:#fef9c3!important;border:2.5px solid #eab308!important;box-shadow:0 0 0 3px rgba(250,204,21,.4),0 5px 12px rgba(15,23,42,.12)!important}' +
        ".pexp-lm-extra{background:#ecfdf5!important;border:2px solid #10b981!important}" +
        ".pexp-race-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin:0 0 14px;padding:10px 14px;border-radius:16px;background:linear-gradient(135deg,#fffbeb 0%,#eff6ff 100%);border:2px solid #93c5fd}" +
        ".pexp-race-btn{appearance:none;border:none;background:linear-gradient(135deg,#1e6cff 0%,#059669 100%);color:#fff;font-family:inherit;font-size:13px;font-weight:900;padding:8px 16px;border-radius:999px;cursor:pointer;box-shadow:0 4px 12px rgba(30,108,255,.28);transition:transform .16s,filter .16s;white-space:nowrap}" +
        ".pexp-race-btn:hover{transform:translateY(-1px);filter:brightness(1.05)}" +
        ".pexp-race-btn.is-running{background:linear-gradient(135deg,#dc2626 0%,#d97706 100%)}" +
        ".pexp-race-msg{font-size:12.5px;font-weight:800;color:#1e293b;text-align:center;flex:1 1 240px;line-height:1.4}" +
        "#pexpSubToday .pexp-speed-track{position:relative;height:9px;overflow:visible;background:rgba(148,163,184,.28);margin:12px 6px 6px 0}" +
        "#pexpSubToday .pexp-speed-fill.is-racing{transition:none!important}" +
        ".pexp-race-runner{position:absolute;top:50%;left:0;transform:translate(-50%,-50%);font-size:14px;line-height:1;pointer-events:none;display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}" +
       ".pexp-race-runner.is-vis{display:block}" +
        ".pexp-race-flag{position:absolute;right:-6px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1;opacity:.85;pointer-events:none;display:none}" +
        ".pexp-race-flag.is-vis{display:block}" +
        ".pexp-race-badge{display:block;min-height:18px;font-size:11.5px;font-weight:800;color:#64748b;margin-top:4px}" +
       ".pexp-vehicle-card.is-finished{border-color:#34d399!important;box-shadow:0 8px 20px rgba(16,185,129,.16)!important}" +
        ".pexp-vehicle-card.is-finished .pexp-race-badge{color:#047857}" +
      ".pfac-map-wrap,.pfac-map-wrap *,.preg-wrap,.preg-wrap *{box-sizing:border-box}" +
        ".pfac-map-wrap,.preg-wrap{font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#1e293b;line-height:1.5}" +
        ".pfac-map-wrap.is-zoomed .pfac-map-head-right>span{display:none}" +
        "#peristasiExplorerModal.pexp-modal-overlay{height:100vh!important;height:100dvh!important}" +
        "#peristasiExplorerModal .pexp-modal-box{max-height:91vh!important;max-height:91dvh!important}" +
        "#pexpChurchMainImg.pexp-church-photo{height:310px!important;object-fit:contain!important;background:linear-gradient(180deg,#dbeafe 0%,#eff6ff 100%)!important;padding:6px!important}" +
        "#pexpImgZoom.pexp-img-zoom img{max-height:80vh!important;max-height:80dvh!important}" +
        ".pfac-map-wrap.is-zoomed{max-height:92vh!important;max-height:92dvh!important}" +
        ".pfac-map-wrap.is-zoomed .pfac-map-svg{max-height:calc(92vh - 135px)!important;max-height:calc(92dvh - 135px)!important}" +
        ".preg-wrap.is-zoomed{max-height:93vh!important;max-height:93dvh!important}" +
       "@media (min-width:701px){.preg-wrap.is-zoomed .preg-stage{width:min(100%,calc((92dvh - 165px) * 1.63))}}" +
        ".preg-pin::before{inset:-4px}" +
        ".preg-pin.is-selected::before{display:none}" +
        ".preg-pin.is-out-zoom{opacity:0!important;pointer-events:none!important}" +
        ".preg-pin:hover{z-index:12}" +
        "#pexpRouteThumbs{grid-template-columns:repeat(5,minmax(0,1fr))!important}" +
        "#pexpChurchThumbs{grid-template-columns:repeat(2,minmax(0,1fr))!important}" +
       "#pexpPopChips{display:flex!important;flex-wrap:wrap!important;gap:6px!important}" +
        "#pexpPopChips .pexp-year-stone[data-year]{flex:1 1 calc(14.28% - 6px)!important;min-width:84px}" +
        ".pexp-mirror-stone,.pexp-capsule-stone{flex:1 1 calc(50% - 6px)!important;padding:8px 10px!important}" +
        ".pexp-slider{min-height:32px}" +
        "@media (max-width:768px){.school-history-wrapper,.village-identity,.info-card,.pexp-modal-overlay,.preg-modal-bg,.pexp-era-strip,.preg-zoom-pill,.preg-ruler-float{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.village-identity{background:rgba(241,245,249,.9)!important}.info-card{background:rgba(255,255,255,.95)!important}.pexp-modal-overlay,.preg-modal-bg{background:rgba(15,23,42,.88)!important}.preg-pin{width:18px!important;height:18px!important}.preg-pin--home{width:22px!important;height:22px!important}.preg-wrap.is-zoomed .preg-pin{width:24px!important;height:24px!important}.preg-wrap.is-zoomed .preg-pin--home{width:29px!important;height:29px!important}.preg-pin-dot{font-size:9.5px!important;border-width:1.5px!important}.preg-pin--home .preg-pin-dot{font-size:11px!important;border-width:2px!important}.preg-wrap.is-zoomed .preg-pin-dot{font-size:12px!important}.preg-wrap.is-zoomed .preg-pin--home .preg-pin-dot{font-size:14px!important}.preg-pin-lbl{font-size:8.5px!important;padding:1.5px 6px!important;bottom:calc(100% + 4px)!important;border-width:1px!important}.preg-pin--right .preg-pin-lbl{left:calc(100% + 5px)!important;bottom:auto!important}.preg-zoom-pill{font-size:9px!important;padding:3px 7px!important;top:6px!important;left:6px!important;border-width:1px!important}.preg-ruler-float{font-size:9px!important;padding:3px 7px!important;right:6px!important;bottom:6px!important}.preg-layer-note{font-size:11px!important;padding:6px 10px!important}}" +
        "@media (max-width:720px){#peristasiExplorerModal .pexp-modal-box{max-height:94vh!important;max-height:94dvh!important}#pexpPopChips .pexp-year-stone[data-year]{flex:1 1 calc(20% - 6px)!important;min-width:55px}.pexp-mirror-stone,.pexp-capsule-stone{flex:1 1 100%!important}}" +
          "@media (max-width:640px){#pexp-pane-population .pexp-kid-heading{margin-bottom:10px}#pexp-pane-population .pexp-kid-heading h3{font-size:1.08rem}#pexp-pane-population .pexp-kid-heading p{font-size:.86rem}.pexp-meadow-scene{padding:10px!important;margin-bottom:10px!important;border-radius:18px!important}.pexp-sky-stats{display:grid!important;grid-template-columns:1fr 1fr;gap:6px!important;margin-bottom:8px!important}.pexp-big-year,.pexp-big-pop,.pexp-mult-pill,.pexp-bus-pill{font-size:.84rem!important;padding:5px 8px!important;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pexp-era-strip{padding:6px 8px;margin-bottom:8px;gap:5px}.pexp-era-now{font-size:11.5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.pexp-era-steps{width:100%;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px}.pexp-era-steps::-webkit-scrollbar{display:none}.pexp-era-step{flex:0 0 auto;font-size:11px;padding:3px 8px}.pexp-houses-grid{min-height:110px!important;align-content:center;gap:5px!important;padding:4px 2px!important}.pexp-house-big{width:30px!important;height:30px!important;font-size:16px!important;border-radius:9px!important}.pexp-roots-bar{margin-top:8px!important;padding-top:8px!important;gap:5px!important}.pexp-root-badge{font-size:11px!important;padding:4px 9px!important}.pexp-time-controls{padding:10px 12px!important;margin-bottom:10px!important}.pexp-slider-line{flex-direction:row!important;align-items:center!important;gap:10px!important;margin-bottom:10px!important}.pexp-play-btn{font-size:12.5px!important;padding:8px 12px!important}#pexpSubToday .pexp-vehicles-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}#pexpSubToday .pexp-vehicle-card{padding:10px 8px!important;border-radius:14px!important}#pexpSubToday .pexp-vehicle-emoji{font-size:24px!important;margin-bottom:2px!important}#pexpSubToday .pexp-vehicle-val{font-size:.98rem!important}.pexp-comp-media,.pfac-card-photo-wrap{flex:1 1 100%!important;width:100%!important}.pexp-comp-photo,.pfac-card-photo{width:100%!important;height:168px!important}#pexpChurchMainImg.pexp-church-photo{height:220px!important}.pexp-nature-top{flex-wrap:wrap!important;gap:6px!important}#pexpZoneAlt{order:-1;flex:1 1 100%;text-align:center}.pexp-nature-top .pexp-mini-pill{flex:1 1 42%;text-align:center}.pexp-big-nav{flex-wrap:nowrap!important;gap:8px!important}.pexp-big-nav .pexp-nav-btn{flex:1 1 0;padding:8px 10px!important;font-size:12.5px!important;text-align:center;white-space:nowrap}.pexp-mirror-tabs{flex-wrap:nowrap!important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;width:100%;padding-bottom:2px}.pexp-mirror-tabs::-webkit-scrollbar{display:none}.pexp-mirror-tab{flex:0 0 auto;white-space:nowrap}.pfac-map-head-right>span{display:none}.pexp-zoom-close{top:max(14px,env(safe-area-inset-top,14px));right:14px}.pexp-zoom-nav{width:38px;height:38px;font-size:21px}.pexp-zoom-prev{left:8px}.pexp-zoom-next{right:8px}}";
      extraCss.textContent +=
        "@keyframes pvidPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}" +
        "@keyframes pfacWarnPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}" +
        ".video-container{position:relative;overflow:hidden;background:#0f172a}" +
        ".video-container iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
        ".video-container.is-offscreen .pvid-play-circle{animation-play-state:paused}" +
        ".pvid-facade{position:absolute;inset:0;width:100%;height:100%;border:none;padding:0;margin:0;background:#0f172a;cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:inherit;-webkit-tap-highlight-color:transparent}" +
        ".pvid-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease,filter .35s ease}" +
        ".pvid-facade:hover .pvid-poster{transform:scale(1.04);filter:brightness(1.05)}" +
        ".pvid-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.48) 0%,rgba(15,23,42,.16) 46%,rgba(15,23,42,.68) 100%);pointer-events:none}" +
       ".pvid-kicker{position:absolute;top:12px;left:12px;max-width:calc(100% - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:2;background:rgba(15,23,42,.82);color:#fde047;border:1.5px solid rgba(253,224,71,.65);font-size:12px;font-weight:800;padding:4px 11px;border-radius:999px;pointer-events:none}" +
        ".pvid-center{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 12px;text-align:center}" +
        ".pvid-play-circle{width:68px;height:48px;border-radius:14px;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);border:2.5px solid #fff;box-shadow:0 8px 24px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;animation:pvidPulse 2.2s ease-in-out infinite}" +
        ".pvid-play-tri{width:0;height:0;border-style:solid;border-width:10px 0 10px 18px;border-color:transparent transparent transparent #fff;margin-left:4px}" +
        ".pvid-play-lbl{background:rgba(15,23,42,.86);color:#fff;font-size:13px;font-weight:800;padding:5px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.32);box-shadow:0 4px 12px rgba(0,0,0,.3)}" +
        ".pvid-missions{margin-top:10px;padding:11px 13px;border-radius:15px;background:linear-gradient(135deg,#f0f9ff 0%,#fffbeb 100%);border:1.5px solid #93c5fd;text-align:left;box-sizing:border-box}" +
        ".pvid-m-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px;font-size:12.5px;font-weight:800;color:#0f172a}" +
        ".pvid-m-count{background:#dbeafe;color:#1d4ed8;font-size:11.5px;font-weight:900;padding:2px 9px;border-radius:999px}" +
        ".pvid-m-count.is-done{background:#dcfce7;color:#15803d}" +
        ".pvid-m-grid{display:flex;flex-wrap:wrap;gap:6px}" +
        ".pvid-m-btn{appearance:none;border:1.5px solid #cbd5e1;background:#fff;color:#1e293b;font-family:inherit;font-size:12px;font-weight:800;padding:6px 11px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all .18s}" +
        ".pvid-m-btn:hover{border-color:#60a5fa;background:#eff6ff}" +
        ".pvid-m-btn.is-found{background:#ecfdf5;border-color:#10b981;color:#065f46;box-shadow:0 2px 8px rgba(16,185,129,.15)}" +
        ".pvid-m-note{display:none;margin-top:8px;padding:7px 11px;border-radius:11px;background:#fff;border:1px solid #bae6fd;font-size:12px;font-weight:700;color:#1e293b;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}" +
        ".pvid-m-note.is-vis{display:flex}" +
        ".pvid-m-jump{appearance:none;border:none;background:#1e6cff;color:#fff;font-family:inherit;font-size:11.5px;font-weight:800;padding:4px 11px;border-radius:999px;cursor:pointer;white-space:nowrap}" +
        ".pexp-cent-banner{margin:12px 0 6px;border-radius:16px;overflow:hidden;border:2px solid #f59e0b;background:linear-gradient(180deg,#fffbeb 0%,#eff6ff 100%);box-shadow:0 6px 18px rgba(15,23,42,.08);cursor:pointer;transition:transform .2s,box-shadow .2s;text-align:left}" +
        ".pexp-cent-banner:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(15,23,42,.13)}" +
        ".pexp-cent-svg{width:100%;height:auto;display:block}" +
        ".pexp-cent-cap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:9px 13px;background:#fff;border-top:1.5px solid #fde68a;font-size:12.5px;color:#1e293b}" +
        ".pexp-cent-cta{background:linear-gradient(135deg,#d97706 0%,#1e6cff 100%);color:#fff;font-size:11.5px;font-weight:800;padding:4px 11px;border-radius:999px;white-space:nowrap}" +
        ".pexp-tl-bridge-btn--gold{border-color:#f59e0b!important;background:#fffbeb!important;color:#92400e!important}" +
        ".pexp-tl-bridge-btn--gold:hover{background:#d97706!important;border-color:#d97706!important;color:#fff!important}" +
       ".pfac-map-status{overflow:hidden}" +
        ".pfac-map-status-body{min-width:0;max-width:100%;flex:1 1 0%;overflow-wrap:anywhere}" +
        ".pfac-walk-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:6px;max-width:100%}" +
        ".pfac-step-pill{display:inline-flex;align-items:center;gap:4px;max-width:100%;background:#ffffff;border:1.5px solid #60a5fa;color:#1d4ed8;font-size:12px;font-weight:900;padding:3px 10px;border-radius:999px;white-space:nowrap}" +
        ".pfac-safety-pill{display:inline-flex;align-items:center;gap:5px;max-width:100%;background:#fffbeb;border:1.5px solid #f59e0b;color:#92400e;font-size:11.8px;font-weight:800;padding:3px 10px;border-radius:999px;line-height:1.35}" +
       ".pfac-safety-pill--cross{background:#fef2f2;border-color:#ef4444;color:#991b1b}" +
        ".pvid-m-right{display:inline-flex;align-items:center;gap:6px}" +
        ".pvid-m-reset{appearance:none;border:1px solid #cbd5e1;background:#fff;color:#475569;font-family:inherit;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px;cursor:pointer}" +
        ".pvid-m-reset:hover{border-color:#60a5fa;color:#1d4ed8}" +
        ".pfac-cross-anim{transform-box:fill-box;transform-origin:center;animation:pfacWarnPulse .9s ease-in-out 4}" +
       "@media (min-width:1200px){.preg-wrap.is-zoomed{padding:11px 15px}.preg-wrap.is-zoomed .preg-stage{width:min(100%,calc((93dvh - 122px) * 1.63))}}" +
        "@media (max-width:640px){.pvid-kicker{font-size:10.5px;padding:3px 8px;top:8px;left:8px;max-width:calc(100% - 16px)}.pvid-center{padding-top:14px;gap:7px}.pvid-play-circle{width:54px;height:38px;border-radius:12px}.pvid-play-tri{border-width:8px 0 8px 14px}.pvid-play-lbl{font-size:11.5px;padding:4px 11px}.pvid-m-btn{flex:1 1 100%;justify-content:flex-start}.pexp-cent-cap{font-size:11.8px;padding:8px 10px}.pfac-map-status-left{align-items:flex-start;flex-basis:100%}.pfac-step-pill{white-space:normal;border-radius:10px;line-height:1.3}.pfac-safety-pill{border-radius:10px;white-space:normal}}" +
      "#peristasiExplorerModal,.pexp-modal-overlay,.pexp-modal-box,.pexp-modal-body,#pexpModalBody,.pexp-pane,#pexpImgZoom,.pfac-map-modal-bg,.pfac-map-wrap,.pfac-map-wrap.is-zoomed,.pfac-map-svg,.preg-modal-bg,.preg-wrap,.preg-wrap.is-zoomed,.preg-stage,.preg-viewport{overscroll-behavior:auto!important;touch-action:auto!important}" +
        ".pexp-slider{touch-action:auto!important}" +
        ".pfac-map-title-group{display:flex;flex-wrap:wrap;align-items:center;gap:8px}" +
        ".pfac-exp-wrap{display:inline-flex;align-items:center;gap:5px}" +
        ".pfac-exp-badge{display:inline-flex;align-items:center;gap:4px;background:#dcfce7;border:1.5px solid #86efac;color:#166534;font-size:12px;font-weight:800;padding:3px 10px;border-radius:999px;white-space:nowrap}" +
        ".pfac-exp-badge.is-done{background:linear-gradient(135deg,#16a34a 0%,#059669 100%);border-color:#15803d;color:#fff}" +
       ".pfac-exp-reset{appearance:none;border:1px solid #86efac;background:#fff;color:#166534;font-family:inherit;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px;cursor:pointer}" +
        ".pfac-exp-reset:hover{border-color:#16a34a;background:#f0fdf4}" +
        ".pfac-exp-win{display:none;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px;padding:9px 13px;border-radius:12px;border:2px solid #4ade80;background:linear-gradient(135deg,#dcfce7 0%,#f0fdf4 100%);color:#14532d;font-size:13px;font-weight:800;text-align:left}" +
        ".pfac-exp-win.is-vis{display:flex}" +
        ".pfac-exp-win-close{appearance:none;border:none;background:rgba(20,83,45,.1);color:#14532d;width:24px;height:24px;border-radius:50%;font-weight:900;cursor:pointer;flex-shrink:0}" +
      ".pexp-zoom-img-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;line-height:0}" +
        ".pexp-tabs-wrap{position:relative;flex:1 1 auto;min-width:0;display:flex;align-items:center}" +
        ".pexp-tabs-more-btn{display:inline-flex;position:absolute;right:2px;top:50%;transform:translateY(-50%);z-index:4;opacity:0;pointer-events:none;transition:opacity .18s;appearance:none;border:1.5px solid #93c5fd;background:rgba(239,246,255,.96);color:#1d4ed8;width:28px;height:30px;border-radius:999px;font-size:20px;font-weight:900;line-height:1;cursor:pointer;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(30,108,255,.22)}" +
        ".pexp-tabs-more-btn.is-vis{opacity:1;pointer-events:auto}" +
        "@keyframes ptl22PinPulse{0%{transform:scale(.9);opacity:.72}75%,100%{transform:scale(1.52);opacity:0}}" +
        ".ptl22-wrap,.ptl22-wrap *{box-sizing:border-box}" +
        ".ptl22-wrap{margin-top:16px;padding:12px;border-radius:18px;border:2px solid #cbd5e1;background:linear-gradient(180deg,#f8fafc 0%,#fffbeb 100%);box-shadow:0 6px 18px rgba(15,23,42,.06);text-align:left}" +
        ".ptl22-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}" +
        ".ptl22-play-btn{appearance:none;border:none;background:linear-gradient(135deg,#1d4ed8 0%,#0284c7 100%);color:#fff;font-family:inherit;font-size:12.5px;font-weight:900;padding:7px 14px;border-radius:999px;cursor:pointer;box-shadow:0 4px 12px rgba(29,78,216,.26);transition:transform .16s,filter .16s;white-space:nowrap}" +
        ".ptl22-play-btn:hover{transform:translateY(-1px);filter:brightness(1.06)}" +
        ".ptl22-play-btn.is-playing{background:linear-gradient(135deg,#d97706 0%,#dc2626 100%)}" +
        ".ptl22-zoom-btn{appearance:none;border:1.5px solid #94a3b8;background:#fff;color:#1e293b;font-family:inherit;font-size:12px;font-weight:800;padding:6px 12px;border-radius:999px;cursor:pointer;transition:all .16s;white-space:nowrap}" +
        ".ptl22-zoom-btn:hover{border-color:#1e6cff;color:#1e6cff;background:#eff6ff}" +
        ".ptl22-stage{position:relative;width:100%;border-radius:13px;overflow:hidden;border:1.5px solid #cbd5e1;background:#fff;user-select:none}" +
        ".ptl22-stage a.image-link{margin:0!important;display:block!important}" +
        ".ptl22-stage img.responsive-img,.ptl22-stage a.image-link:hover img.responsive-img{width:100%!important;height:auto!important;margin:0!important;border:none!important;border-radius:0!important;box-shadow:none!important;transform:none!important;filter:none!important;display:block!important}" +
        ".ptl22-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}" +
        ".ptl22-hit-zone{position:absolute;appearance:none;border:none;background:transparent;padding:0;margin:0;cursor:pointer;z-index:4;-webkit-tap-highlight-color:transparent}" +
        ".ptl22-pin{position:absolute;width:26px;height:26px;transform:translate(-50%,-50%);z-index:6;appearance:none;border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:transform .18s,opacity .22s}" +
        '.ptl22-pin::before{content:"";position:absolute;inset:-6px;border-radius:50%}' +
        ".ptl22-stage.is-animating .ptl22-pin{opacity:.42}" +
        ".ptl22-pin:hover{z-index:9;transform:translate(-50%,-50%) scale(1.14)}" +
        ".ptl22-pin.is-active{z-index:10;opacity:1!important}" +
        ".ptl22-pin-dot{position:relative;width:100%;height:100%;border-radius:50%;background:var(--p22-bg,#1d4ed8);color:#fff;border:2px solid #fff;box-shadow:0 3px 8px rgba(15,23,42,.28);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;line-height:1}" +
        '.ptl22-pin-dot::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--p22-bg,#1d4ed8);opacity:0;pointer-events:none;will-change:transform,opacity;animation:ptl22PinPulse 2.4s ease-out infinite}' +
        ".ptl22-wrap.is-paused .ptl22-pin-dot::after,.ptl22-stage.is-animating .ptl22-pin-dot::after,.ptl22-pin.is-active .ptl22-pin-dot::after{animation:none!important;opacity:0!important}" +
        ".ptl22-pin.is-active .ptl22-pin-dot{box-shadow:0 0 0 3.5px #fde047,0 5px 14px rgba(15,23,42,.38);transform:scale(1.12)}" +
        ".ptl22-token{position:absolute;left:0;top:0;width:27px;height:27px;transform:translate3d(0,0,0) translate(-50%,-50%);will-change:transform;border-radius:50%;background:#fff;border:2px solid #1d4ed8;box-shadow:0 4px 12px rgba(15,23,42,.28);display:none;align-items:center;justify-content:center;font-size:14px;line-height:1;pointer-events:none;z-index:8}" +
        ".ptl22-token--cart{border-color:#d97706;background:#fffbeb}" +
        ".ptl22-token--pieria{border-color:#059669;background:#ecfdf5}" +
        ".ptl22-token.is-vis{display:flex}" +
        ".ptl22-reunion{position:absolute;transform:translate(-50%,-100%);background:#fef3c7;color:#92400e;border:2px solid #f59e0b;font-size:11px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 12px rgba(15,23,42,.22);pointer-events:none;z-index:9;display:none}" +
        ".ptl22-reunion.is-vis{display:inline-block}" +
        ".ptl22-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}" +
        ".ptl22-chip{appearance:none;border:1.5px solid #cbd5e1;background:#fff;color:#334155;font-family:inherit;font-size:11.8px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:all .16s}" +
        ".ptl22-chip:hover{border-color:#60a5fa;background:#eff6ff}" +
        ".ptl22-chip.is-active{background:var(--p22-c,#1d4ed8);border-color:var(--p22-c,#1d4ed8);color:#fff}" +
        ".ptl22-card{margin-top:9px;padding:11px 13px;border-radius:14px;background:#fff;border:1.5px solid #fde68a;color:#1e293b;min-width:0;max-width:100%;overflow-wrap:anywhere}" +
        ".ptl22-card--hint{background:#f8fafc;border-color:#cbd5e1;font-size:12.5px;font-weight:700;color:#334155;line-height:1.45}" +
        ".ptl22-card--live{background:linear-gradient(135deg,#eff6ff 0%,#fffbeb 100%);border-color:#60a5fa;font-size:13px;font-weight:800;color:#0f172a;line-height:1.45}" +
        ".ptl22-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}" +
        ".ptl22-card-title{font-size:14px;font-weight:900;color:#0f172a;margin:0}" +
        ".ptl22-card-nav{display:inline-flex;align-items:center;gap:5px;flex-shrink:0}" +
        ".ptl22-mini-btn{appearance:none;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;width:26px;height:26px;border-radius:50%;font-size:12px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0}" +
        ".ptl22-mini-btn:hover{border-color:#1e6cff;color:#1e6cff}" +
        ".ptl22-card-desc{font-size:13px;line-height:1.5;color:#334155;margin:0 0 9px;font-weight:600}" +
        ".ptl22-cta{appearance:none;border:none;background:var(--p22-c,#1d4ed8);color:#fff;font-family:inherit;font-size:12px;font-weight:800;padding:6px 13px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(15,23,42,.16);max-width:100%}" +
        ".ptl22-cta:hover{filter:brightness(1.07)}" +
        "@media (max-width:640px){.ptl22-wrap{padding:9px 8px}.ptl22-play-btn,.ptl22-zoom-btn{font-size:11.5px;padding:6px 11px}.ptl22-pin{width:20px;height:20px}.ptl22-pin-dot{font-size:10px;border-width:1.5px}.ptl22-token{width:22px;height:22px;font-size:12px}.ptl22-reunion{font-size:9.5px;padding:2px 7px}.ptl22-chips{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}.ptl22-chips::-webkit-scrollbar{display:none}}" +
        ".preg-stage.is-pieria-active{cursor:grab}.preg-stage.is-panning{cursor:grabbing}" +
        ".preg-stage.is-panning .preg-viewport,.preg-stage.is-panning .preg-pin{transition:none!important}" +
        ".preg-wrap.is-zoomed .preg-ruler-float.is-vis{display:inline-flex!important}";
     extraCss.textContent +=
        "@media (max-width:768px){" +
          ".preg-pin--home{width:18px!important;height:18px!important}" +
          ".preg-wrap.is-zoomed .preg-pin--home{width:24px!important;height:24px!important}" +
          ".preg-pin--home .preg-pin-dot{font-size:9.5px!important;border:1.5px solid #fde047!important;box-shadow:0 2px 6px rgba(15,23,42,.32)!important}" +
          ".preg-pin.is-selected .preg-pin-dot{box-shadow:0 0 0 2px rgba(250,204,21,.92),0 3px 8px rgba(15,23,42,.36)!important;transform:scale(1.04)!important}" +
          ".preg-pin--home.is-selected .preg-pin-dot{box-shadow:0 2px 7px rgba(15,23,42,.36)!important;transform:none!important}" +
          ".preg-wrap.is-zoomed .preg-pin--home .preg-pin-dot{font-size:12px!important}" +
        "}";
      (document.body || document.head).appendChild(extraCss);
    }

    var noThumbUrls = {};
    function optImg(url, maxDim) {
      if (!url || typeof url !== "string" || url.indexOf("data:") === 0 || noThumbUrls[url]) return url;
      var sz = maxDim || 640;
      if (url.indexOf("blogger.googleusercontent.com") !== -1 || url.indexOf("bp.blogspot.com") !== -1) {
        return url
          .replace(/\/(s\d+|w\d+(?:-h\d+)?)\//, "/s" + sz + "/")
          .replace(/=(s\d+|w\d+(?:-h\d+)?)(?=$|[?&])/, "=s" + sz);
      }
      var wStep = (sz <= 330) ? 330 : (sz <= 640 ? 500 : (sz <= 960 ? 960 : 1280));
      if (url.indexOf("Special:FilePath/") !== -1) {
        if (url.indexOf("width=") !== -1) {
          return url.replace(/([?&]width=)\d+/, "$1" + wStep);
        }
        return url + (url.indexOf("?") === -1 ? "?" : "&") + "width=" + wStep;
      }
      var wmMatch = url.match(/^https?:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f]\/[0-9a-f]{2})\/([^/?#]+\.(?:jpe?g|png|webp))$/i);
      if (wmMatch && wmMatch[1] && wmMatch[2]) {
        if (sz > 640) {
          return "https://commons.wikimedia.org/wiki/Special:FilePath/" + wmMatch[2] + "?width=" + wStep;
        }
        if (wmMatch[2].indexOf("Jankaea") !== -1) return url;
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/" + wmMatch[1] + "/" + wmMatch[2] + "/" + wStep + "px-" + wmMatch[2];
      }
      return url;
    }

    function optZoomUrl(url) {
      if (!url || typeof url !== "string") return url;
      if (url.indexOf("wikimedia.org/") !== -1) return optImg(url, 1280);
      if (url.indexOf("blogger.googleusercontent.com") !== -1 || url.indexOf("bp.blogspot.com") !== -1) {
        var maxZ = (window.innerWidth && window.innerWidth <= 700) ? 1200 : 1600;
        return optImg(url, maxZ);
      }
      return url;
    }
    function cleanRawUrl(url) {
      if (!url || typeof url !== "string") return url;
      if (url.indexOf("Special:FilePath/") !== -1) return url.replace(/[?&]width=\d+/, "");
      return url;
    }

    var preloadedUrls = {};
    var preloadPool = [];
    function preloadImg(url) {
      if (!url || preloadedUrls[url] || url.indexOf("data:") === 0) return;
      preloadedUrls[url] = true;
      var loadTask = function() {
        var im = new Image();
        im.decoding = "async";
        im.src = url;
        preloadPool.push(im);
        if (preloadPool.length > 14) preloadPool.shift();
      };
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(loadTask, { timeout: 600 });
      } else {
        setTimeout(loadTask, 140);
      }
    }

    function upgradeTwinMapsPortal() {
      var oldMapLink = document.querySelector('.facilities-list a[href="#HTML39"]');
      if (!oldMapLink || document.getElementById("pfacMapsPortal")) return;
      var oldWrap = oldMapLink.closest(".facilities-list > div") || oldMapLink.parentNode;
      var prevBr = oldWrap.previousElementSibling;
      if (prevBr && prevBr.id !== "pfacStage" && prevBr.textContent.trim() === "" && !prevBr.querySelector("img,svg,button")) {
        prevBr.style.display = "none";
      }
      var nextBr = oldWrap.nextElementSibling;
      if (nextBr && nextBr.textContent.trim() === "" && !nextBr.querySelector("img,svg,button")) {
        nextBr.style.display = "none";
      }

      var cleanMythUrl = (mythologyMapUrl || "").trim();
      var hasMythUrl = !!(cleanMythUrl && cleanMythUrl !== "#");

      var portalWrap = document.createElement("div");
      portalWrap.id = "pfacMapsPortal";
      portalWrap.className = "pfac-portals-wrap";
      portalWrap.innerHTML =
        '<div class="pfac-portals-heading">\uD83E\uDDED Συνέχισε την Εξερεύνηση στην Πιερία:</div>' +
        '<div class="pfac-portals-grid">' +
          '<a href="#HTML39" class="pfac-portal-card pfac-portal-card--geo" id="pfacPortalGeo">' +
            '<div>' +
              '<div class="pfac-portal-top">' +
                '<span class="pfac-portal-icon">\uD83D\uDDFA\uFE0F</span>' +
                '<span class="pfac-portal-kicker">ΓΕΩΓΡΑΦΙΑ ΠΙΕΡΙΑΣ</span>' +
              '</div>' +
              '<div class="pfac-portal-title">Χάρτης Πόλεων &amp; Χωριών Πιερίας</div>' +
              '<div class="pfac-portal-desc">Βρες την Περίσταση, την Κατερίνη και όλα τα χωριά του νομού μας από το βουνό έως τη θάλασσα!</div>' +
            '</div>' +
            '<span class="pfac-portal-cta">\uD83D\uDC47 Δες τον Χάρτη Πιερίας \u279C</span>' +
          '</a>' +
          '<a href="#" class="pfac-portal-card pfac-portal-card--myth" id="pfacPortalMyth">' +
            '<div>' +
              '<div class="pfac-portal-top">' +
                '<span class="pfac-portal-icon">\u26A1</span>' +
                '<span class="pfac-portal-kicker">ΙΣΤΟΡΙΑ, ΜΥΘΟΛΟΓΙΑ &amp; ΟΛΥΜΠΟΣ</span>' +
              '</div>' +
              '<div class="pfac-portal-title">Ιστορικός, Μυθολογικός Χάρτης της Πιερίας</div>' +
              '<div class="pfac-portal-desc">Ανακάλυψε την ιστορία της Πιερίας, τους 12 Θεούς του Ολύμπου, τον Ορφέα και τις 9 Πιερίδες Μούσες!</div>' +
            '</div>' +
            '<span class="pfac-portal-cta" id="pfacPortalMythCta">\u2728 Εξερεύνησε την Πιερία \u279C</span>' +
          '</a>' +
        '</div>';

      oldWrap.parentNode.replaceChild(portalWrap, oldWrap);

      var geoLinkEl = document.getElementById("pfacPortalGeo");
      if (geoLinkEl) {
        geoLinkEl.addEventListener("click", function(e) {
          var gTarget = document.getElementById("HTML39");
          if (gTarget) {
            e.preventDefault();
            gTarget.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }

      var mythLinkEl = document.getElementById("pfacPortalMyth");
      var mythCtaEl = document.getElementById("pfacPortalMythCta");
      var getVisibleMythWidget = function() {
        var w = document.getElementById("HTML40");
        if (!w || window.getComputedStyle(w).display === "none") return null;
        return (w.getClientRects && w.getClientRects().length > 0) ? w : null;
      };

     var syncMythPortalLink = function() {
        if (!mythLinkEl) return null;
        var topW = getVisibleMythWidget();
        if (topW) {
          mythLinkEl.setAttribute("href", "#HTML40");
          mythLinkEl.removeAttribute("target");
          mythLinkEl.removeAttribute("rel");
          if (mythCtaEl) mythCtaEl.textContent = "\uD83D\uDC46 Ανέβα στον Χάρτη Πιερίας \u279C";
          return topW;
        }
        if (hasMythUrl) {
          mythLinkEl.setAttribute("href", cleanMythUrl);
          if (mythologyOpenNewTab && cleanMythUrl.charAt(0) !== "#") {
            mythLinkEl.setAttribute("target", "_blank");
            mythLinkEl.setAttribute("rel", "noopener noreferrer");
          } else {
            mythLinkEl.removeAttribute("target");
            mythLinkEl.removeAttribute("rel");
          }
          if (mythCtaEl) mythCtaEl.textContent = "\u2728 Εξερεύνησε την Πιερία \u279C";
        } else {
          mythLinkEl.setAttribute("href", "#");
        }
        return null;
      };

      if (mythLinkEl) {
        syncMythPortalLink();
        var mythResizeRaf = 0;
        window.addEventListener("resize", function() {
          if (mythResizeRaf) return;
          mythResizeRaf = requestAnimationFrame(function() {
            mythResizeRaf = 0;
            syncMythPortalLink();
          });
        }, { passive: true });

        mythLinkEl.addEventListener("click", function(e) {
          var topWidget = syncMythPortalLink();
          if (topWidget) {
            e.preventDefault();
            topWidget.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          if (!hasMythUrl) {
            e.preventDefault();
            if (mythCtaEl) mythCtaEl.textContent = "\uD83D\uDD17 Δήλωσε το link στο mythologyMapUrl!";
            return;
          }
          if (cleanMythUrl.charAt(0) === "#") {
            var mTarget = document.getElementById(cleanMythUrl.slice(1));
            if (mTarget) {
              e.preventDefault();
              mTarget.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        });
      }
    }

    function openSinglePhotoZoom(src, caption, cachedThumb) {
      if (!src) return;
      var th = (cachedThumb && cachedThumb !== src) ? cachedThumb : "";
      openZoomWithList([{ src: src, thumb: th, caption: caption || "" }], 0);
    }

   var oldSchoolImgUrl = (function() {
      var tlBoxes = document.querySelectorAll(".school-history-wrapper .timeline-event");
      for (var i = 0; i < tlBoxes.length; i++) {
        var dt = tlBoxes[i].querySelector(".timeline-date");
        var txt = dt ? dt.textContent : "";
      if (txt.indexOf("1952") !== -1 || txt.indexOf("1965") !== -1) {
          var lnk = tlBoxes[i].querySelector("a.image-link");
          var im = tlBoxes[i].querySelector("a.image-link img");
          var url = (lnk && lnk.getAttribute("href")) || (im && im.src) || "";
          if (url) return url;
        }
      }
      return "https://commons.wikimedia.org/wiki/Special:FilePath/Schiefertafel_Wien_um_1900_%C3%96MV.jpg?width=700";
    })();

    var katina1947ImgUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhIF5CIP9A7kJ0I9F_RQ6YXW4wd6dBxUQ3Byp5X8dK7OrDRxO2hWXjSMFHZ1ay716TcIfN3AJGAhUhLO-w17d9sc3n1ptSTQCh2WOY6hrVeUZVQSqPwM4uKnHz-1f4-tqyZN3XR8mlxHSSCF_65y2WRHRaptQ4YSP4A_paCiGk5l2LbhDxRvGo7pfPkPuQ/s1600/2026-11-21%2019_02_23-NVIDIA%20GeForce%20Overlay.png";

    var schoolMirrorScenes = [
      {
        tab: "\uD83C\uDFEB 1. Η Αίθουσα",
        oldIcons: "\uD83E\uDDF1 \uD83D\uDD25 \uD83E\uDEB5",
        oldImg: katina1947ImgUrl,
        oldCap: "Αρχείο 1947: Η δασκάλα Κατίνα Κουζώνη μπροστά στην παλιά πόρτα του πρώτου σχολείου μας (κτίριο 1926\u20131963)",
        oldTitle: "Πρώτες Αίθουσες, Συνδιδασκαλία & Ξυλόσομπα",
        oldDesc: "Από το πλίνθινο σχολείο στο πρώτο διδακτήριο των 3 αιθουσών (όπου βλέπουμε στην παλιά πόρτα τη δασκάλα Κατίνα Κουζώνη το 1947)! Δύο-τρεις τάξεις έκαναν μάθημα μαζί σε ξύλινα θρανία και ζεσταίνονταν με την ξυλόσομπα, όπου κάθε παιδί έφερνε κι ένα κούτσουρο από το σπίτι.",
        newIcons: "\uD83C\uDFEB \uD83D\uDDA5\uFE0F \uD83C\uDFA8",
        newImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        newCap: "Το σύγχρονο 12/θέσιο Δημοτικό Σχολείο Περίστασης από ψηλά",
        newTitle: "12/θέσιο Σύγχρονο Διδακτήριο",
        newDesc: "Μεγάλο, φωτεινό σχολείο με πέτρινο κτίριο και νέα πτέρυγα! Έχουμε 12 τμήματα, διαδραστικούς πίνακες, εργαστήριο υπολογιστών, αίθουσα ζωγραφικής, μουσικής, ολοήμερου και μεγάλη αίθουσα εκδηλώσεων!"
      },
      {
        tab: "\uD83C\uDF92 2. Η Σχολική Τσάντα",
        oldIcons: "\uD83E\uDDF6 \uD83E\uDEA8 \uD83D\uDCD6",
        oldImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhcEUaBY8PftMjGFOyj3Fg_5giM6hTahPv7h8jVMItriMpHW8C_xHIb4stMUeBaOqAfxv_b2zV3FQTv1rN3u2klU49F20PfBU2ZvtTiJVYEpRiOWMKPEhNnjI6hNSWvkQP_G6WLSnitUa8FjlfTtJjki39AOwbKzixAm7_ktzEhw67jFdX7jfG4wFURhKs/s1600/Gemini_Generated_Image_qbyp72qbyp72qbyp.jpg",
        oldCap: "Αναπαράσταση 1926: Το υφαντό ταγάρι, η μαύρη πέτρινη πλάκα, το πετροκοντύλι, το σφουγγαράκι και το Αναγνωστικό",
        oldTitle: "Υφαντό Ταγάρι, Πλάκα & Κοντύλι",
        oldDesc: "Κρεμούσαν στον ώμο το μάλλινο υφαντό «ταγάρι» της γιαγιάς! Μέσα είχε τη μαύρη πέτρινη πλάκα, το πετροκοντύλι για να γράφουν, ένα βρεγμένο σφουγγαράκι για να σβήνουν και ένα μόνο Αναγνωστικό.",
        newIcons: "\uD83C\uDF92 \uD83E\uDD16 \uD83D\uDCDA",
        newImg: "https://commons.wikimedia.org/wiki/Special:FilePath/Lego_Mindstorms_EV3_Robot.jpg?width=700",
        newCap: "Εκπαιδευτική ρομποτική, υπολογιστές & σύγχρονα βιβλία",
        newTitle: "Βιβλία, Ψηφιακή Βιβλιοθήκη & Ρομποτική",
        newDesc: "Ανατομική πολύχρωμη τσάντα με τετράδια και χρώματα, Δανειστική Βιβλιοθήκη, Ψηφιακή Βιβλιοθήκη με 350 δωρεάν παιδικά βιβλία και σετ εκπαιδευτικής ρομποτικής!"
      },
     {
        tab: "\u26BD 3. Το Διάλειμμα",
        oldIcons: "\uD83E\uDDF6 \uD83C\uDF33 \u26FA",
        oldImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjMt1pxULcgnZ1lPimWm5oR0-iXRu2GIcfdtFrjeCWKuiLaoTxoGPabVyLO41ehpUhJ5y5TxsgS1ygvCdHye2pZ0cWXXnGKP7z1iJ-i6H4dHZIkFH8_UGun98SIA6hFR0B-8qUq_ndNaFgu2GvS7GNoLjKeJgHPT9wznHl9DtDFItXW5xH8BJumhZI6ZeU/s1600/Gemini_Generated_Image_zbziagzbziagzbzi.jpg",
        oldCap: "Αναπαράσταση (1926\u20131950): Πάνινο τόπι, βόλοι, κουτσό και οι Πρόσκοποι της Περίστασης κάτω από τον μεγάλο Πλάτανο",
      oldTitle: "Πάνινο Τόπι, Βόλοι & ο Μεγάλος Πλάτανος",
        oldDesc: "Στη χωμάτινη αυλή, δίπλα στον μεγάλο Πλάτανο του χωριού, έπαιζαν βόλους, κουτσό και «τόπι» από δεμένα πανιά, ενώ μεταπολεμικά μετά το μάθημα οι δάσκαλοι οργάνωναν τους Προσκόπους της Περίστασης!",
        newIcons: "\uD83C\uDFC0 \uD83C\uDFD0 \u265F\uFE0F",
        newImg: "https://commons.wikimedia.org/wiki/Special:FilePath/ChessStartingPosition.jpg?width=700",
        newCap: "Σκάκι & ομαδικά αθλήματα: 2η θέση στα Δημοτικά Κατερίνης!",
        newTitle: "Γήπεδα, Γυμναστήριο & Πρωτιές στο Σκάκι",
        newDesc: "Μεγάλη ασφαλής αυλή με γήπεδα μπάσκετ, ποδοσφαίρου και βόλεϊ, κλειστό γυμναστήριο και σκακιέρες \u2014 με το σχολείο μας στη 2η θέση στο σκάκι ανάμεσα στα Δημοτικά όλης της Κατερίνης!"
      },
      {
        tab: "\uD83D\uDD14 4. Μάθημα & Κολατσιό",
        oldIcons: "\uD83D\uDD14 \uD83E\uDD5B \uD83C\uDF5E",
        oldImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEif9jhbPtJ64CABghvVb5yfOyfZM3VpMni1gjNYMe9sl1rRusfn8O-0rx4_WKUGWChvme2S2xOeiyInMd6kUq2-zFpRsksuljjhKLxCCLpC9dDyIAYkVLexPXG8ksMok3ZlKesOHuwOR0_MXnhggrFbDUkxFxYpr2YLFFFG2jmQ2OXb6NOYuUEtosHYrCc/s1600/Gemini_Generated_Image_x60qc9x60qc9x60q.jpg",
        oldCap: "Αναπαράσταση (1926\u20131940): Ο δάσκαλος χτυπά το μπρούτζινο κουδούνι χειρός και τα παιδιά γράφουν με πένα και μελάνι",
        oldTitle: "Κουδούνι Χειρός, Καζάνι Γάλα & Σταφιδόψωμο",
        oldDesc: "Ο δάσκαλος χτυπούσε το μπρούτζινο κουδούνι και τα παιδιά έγραφαν με πένα και μελάνι! Τρώγανε ζυμωτό ψωμί, ενώ μεταπολεμικά έπιναν ζεστό γάλα από καζάνι με σταφιδόψωμο που έφερνε μαθητής με τα πόδια από την Κατερίνη για μια χούφτα σταφίδες!",
        newIcons: "\uD83C\uDF0D \uD83C\uDFCA \uD83C\uDF4E",
        newImg: "https://commons.wikimedia.org/wiki/Special:FilePath/Olympic_Size_Swimming_Pool_(2069924837).jpg?width=700",
        newCap: "Μαθήματα κολύμβησης, ξένες γλώσσες και ολοήμερο σχολείο",
        newTitle: "Ξένες Γλώσσες, Κολύμβηση & Ολοήμερο",
        newDesc: "Μαθαίνουμε Αγγλικά, Γαλλικά ή Γερμανικά, πηγαίνουμε κολύμβηση και εκπαιδευτικές εκδρομές στη φύση, κάνουμε ομαδικά projects και τρώμε ζεστό φαγητό στο Ολοήμερο!"
      }
    ];

    function renderSchoolMirror(stageEl, onClose) {
      if (!stageEl) return;
      var curScene = 0;
      var viewMode = "both";

     stageEl._stepMirror = function(dir) {
        if (!stageEl || stageEl.style.display === "none" || !stageEl.innerHTML) return false;
        curScene = (curScene + dir + schoolMirrorScenes.length) % schoolMirrorScenes.length;
        draw();
        return true;
      };

      function draw() {
        var sc = schoolMirrorScenes[curScene];
        var tabsHtml = schoolMirrorScenes.map(function(s, i) {
          return '<button type="button" class="pexp-mirror-tab' + (i === curScene ? ' is-active' : '') + '" data-m-tab="' + i + '">' + s.tab + '</button>';
        }).join("");

        var card1926 =
          '<div class="pexp-era-card pexp-era-1926">' +
            '<div class="pexp-era-head">' +
              '<span class="pexp-era-yr">\uD83D\uDD70\uFE0F 1926 \u2022 Πριν 100 Χρόνια</span>' +
              '<span class="pexp-era-icons">' + sc.oldIcons + '</span>' +
            '</div>' +
            '<img class="pexp-era-photo" src="' + optImg(sc.oldImg, 640) + '" data-full-src="' + escAttr(sc.oldImg) + '" alt="' + escAttr(sc.oldCap) + '" data-m-zoom="0" loading="lazy"/>' +
            '<h5 class="pexp-era-title">' + sc.oldTitle + '</h5>' +
            '<p class="pexp-era-desc">' + sc.oldDesc + '</p>' +
          '</div>';

        var card2026 =
          '<div class="pexp-era-card pexp-era-2026">' +
            '<div class="pexp-era-head">' +
              '<span class="pexp-era-yr">\uD83D\uDE80 2026 \u2022 Σήμερα στο 12/Θ</span>' +
              '<span class="pexp-era-icons">' + sc.newIcons + '</span>' +
            '</div>' +
            '<img class="pexp-era-photo" src="' + optImg(sc.newImg, 640) + '" data-full-src="' + escAttr(sc.newImg) + '" alt="' + escAttr(sc.newCap) + '" data-m-zoom="1" loading="lazy"/>' +
            '<h5 class="pexp-era-title">' + sc.newTitle + '</h5>' +
            '<p class="pexp-era-desc">' + sc.newDesc + '</p>' +
          '</div>';

        var pairHtml = "";
        if (viewMode === "1926") pairHtml = card1926;
        else if (viewMode === "2026") pairHtml = card2026;
        else pairHtml = card1926 + card2026;

        stageEl.innerHTML =
          '<div class="pexp-mirror-box">' +
            '<div class="pexp-root-pop-top">' +
              '<span class="pexp-root-pop-title" style="color:#b45309">\uD83E\uDE9E Καθρέφτης Εκατονταετηρίδας: Μία Μέρα στο Σχολείο (1926 vs 2026)</span>' +
              '<button type="button" class="pexp-root-pop-close" data-m-close="1" title="Κλείσιμο">\u2715</button>' +
            '</div>' +
            '<div class="pexp-mirror-bar">' +
              '<div class="pexp-mirror-tabs">' + tabsHtml + '</div>' +
              '<div class="pexp-mirror-modes">' +
                '<button type="button" class="pexp-mirror-pill' + (viewMode === 'both' ? ' is-active' : '') + '" data-m-mode="both">\u2696\uFE0F Δίπλα-Δίπλα</button>' +
                '<button type="button" class="pexp-mirror-pill' + (viewMode === '1926' ? ' is-active' : '') + '" data-m-mode="1926">\uD83D\uDD70\uFE0F 1926</button>' +
                '<button type="button" class="pexp-mirror-pill' + (viewMode === '2026' ? ' is-active' : '') + '" data-m-mode="2026">\uD83D\uDE80 2026</button>' +
              '</div>' +
            '</div>' +
            '<div class="pexp-mirror-pair">' + pairHtml + '</div>' +
          '</div>';
       stageEl.querySelectorAll(".pexp-era-photo").forEach(function(im) {
          im.onerror = handleImgFallback;
        });
        var nextSc = schoolMirrorScenes[(curScene + 1) % schoolMirrorScenes.length];
        if (nextSc) {
          preloadImg(optImg(nextSc.oldImg, 640));
          preloadImg(optImg(nextSc.newImg, 640));
        }
      }

      stageEl.onclick = function(e) {
        e.stopPropagation();
        if (e.target.closest("[data-m-close]")) {
          if (onClose) onClose();
          return;
        }
        var tBtn = e.target.closest("[data-m-tab]");
        if (tBtn) {
          curScene = Number(tBtn.getAttribute("data-m-tab"));
          draw();
          return;
        }
       var zPic = e.target.closest("[data-m-zoom]");
        if (zPic) {
          var scNow = schoolMirrorScenes[curScene];
          var oldPre = /\b(19|20)\d{2}\b/.test(scNow.oldCap) ? "" : "1926 \u2022 ";
          var newPre = /\b(19|20)\d{2}\b/.test(scNow.newCap) ? "" : "2026 \u2022 ";
          openZoomWithList([
            { src: scNow.oldImg, thumb: optImg(scNow.oldImg, 640), caption: oldPre + scNow.oldCap },
            { src: scNow.newImg, thumb: optImg(scNow.newImg, 640), caption: newPre + scNow.newCap }
          ], Number(zPic.getAttribute("data-m-zoom")));
          return;
        }
        var mBtn = e.target.closest("[data-m-mode]");
        if (mBtn) {
          viewMode = mBtn.getAttribute("data-m-mode");
          draw();
        }
      };

      draw();
    }

    function shuffleList(arr) {
      var copy = arr.slice();
      for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = copy[i];
        copy[i] = copy[j];
        copy[j] = tmp;
      }
      return copy;
    }

    function renderPackChallenge(stageEl, cfg) {
      if (!stageEl) return;
      var deck = shuffleList(cfg.items);
      var found = 0;
      var tried = {};

      function draw(lastMsg, isDone) {
        var cardsHtml = deck.map(function(it, idx) {
          var st = tried[idx];
          var cls = "pexp-pack-item";
          var mark = "";
          if (st === "ok") { cls += " is-right"; mark = " \u2705"; }
          else if (st === "no") { cls += " is-wrong"; mark = " \u2715"; }
          else if (isDone) { cls += " is-dim"; }
          return '<button type="button" class="' + cls + '" data-pk="' + idx + '">' +
            '<span style="font-size:20px">' + it.icon + '</span>' +
            '<span>' + it.name + mark + '</span>' +
          '</button>';
        }).join("");

        var replayBtn = isDone
          ? ' <button type="button" class="pexp-root-pop-cta" data-pk-replay="1" style="margin-top:6px">\uD83D\uDD04 Παίξε ξανά</button>'
          : '';

        stageEl.innerHTML =
          '<div class="pexp-pack-card" style="--pk-accent:' + cfg.accent + ';--pk-border:' + cfg.border + ';--pk-bg:' + cfg.bg + ';">' +
            '<div class="pexp-root-pop-top">' +
              '<span class="pexp-root-pop-title" style="color:' + cfg.accent + '">' + cfg.title + ' (' + found + '/3)</span>' +
              '<button type="button" class="pexp-root-pop-close" data-pk-close="1" title="Κλείσιμο">\u2715</button>' +
            '</div>' +
            '<div style="font-size:13px;color:#334155">' + cfg.subtitle + '</div>' +
            '<div class="pexp-pack-grid">' + cardsHtml + '</div>' +
            '<div class="pexp-pack-msg">' + lastMsg + replayBtn + '</div>' +
          '</div>';
      }

      stageEl.onclick = function(e) {
        if (e.target.closest("[data-pk-close]")) {
          if (cfg.onClose) cfg.onClose();
          return;
        }
        if (e.target.closest("[data-pk-replay]")) {
          deck = shuffleList(cfg.items);
          found = 0;
          tried = {};
          draw("\uD83D\uDC46 Πάτησε πάνω στα 3 σωστά αντικείμενα!", false);
          return;
        }
        var btn = e.target.closest("[data-pk]");
        if (!btn || found >= 3) return;
        var idx = Number(btn.getAttribute("data-pk"));
        var item = deck[idx];
        if (!item) return;
        if (tried[idx]) {
          draw((item.ok ? "\u2705 " : "\uD83D\uDCA1 ") + item.why, false);
          return;
        }
        if (item.ok) {
          tried[idx] = "ok";
          found++;
          if (found >= 3) {
            draw(cfg.winText, true);
          } else {
            draw("\u2705 " + item.why + " (Βρήκες " + found + " από 3!)", false);
          }
        } else {
          tried[idx] = "no";
          draw("\uD83D\uDCA1 " + item.why, false);
        }
      };

      draw("\uD83D\uDC46 Πάτησε πάνω στα 3 σωστά αντικείμενα!", false);
    }

    function hasHorizontalScroll(node, stopAt) {
      while (node && node !== stopAt && node !== document.body) {
        if (node.nodeType === 1 && node.scrollWidth > node.clientWidth + 6) {
          var ov = window.getComputedStyle(node).overflowX;
          if (ov === "auto" || ov === "scroll") return true;
        }
        node = node.parentNode;
      }
      return false;
    }

 function isPinchZoomed() {
      return !!(window.visualViewport && window.visualViewport.scale > 1.02);
    }

   function findClosestEl(nodeList, clientX, clientY, maxDist, subSel) {
      if (!nodeList || typeof clientX !== "number" || typeof clientY !== "number") return null;
      if (clientX === 0 && clientY === 0) return null;
      var best = null, bestD2 = maxDist * maxDist;
      for (var i = 0; i < nodeList.length; i++) {
        var el = nodeList[i];
        if (el.classList.contains("is-hidden-layer") || el.classList.contains("is-out-zoom")) continue;
        var boxEl = (subSel && el.querySelector(subSel)) || el;
        var r = boxEl.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        var dx = clientX - (r.left + r.width / 2);
        var dy = clientY - (r.top + r.height / 2);
        var d2 = dx * dx + dy * dy;
        if (d2 <= bestD2) {
          bestD2 = d2;
          best = el;
        }
      }
      return best;
    }

    function bindSwipe(el, onSwipeLeft, onSwipeRight) {
      if (!el) return;
      var sx = 0, sy = 0, multi = false, ignore = false;
      el.addEventListener("touchstart", function(e) {
        if (e.touches.length > 1 || isPinchZoomed()) { multi = true; return; }
        var tgt = e.target;
        var tag = tgt && tgt.tagName ? tgt.tagName.toLowerCase() : "";
       var inSubBox = !!(tgt && tgt.closest && tgt.closest(".pexp-mirror-box,.pexp-crates-box,.pexp-pack-card,.pexp-compass-svg"));
        ignore = (tag === "input" || tag === "select" || tag === "textarea" || inSubBox || hasHorizontalScroll(tgt, el));
        multi = false;
        sx = e.touches[0].screenX;
        sy = e.touches[0].screenY;
      }, { passive: true });

      el.addEventListener("touchmove", function(e) {
        if (e.touches.length > 1 || isPinchZoomed()) multi = true;
      }, { passive: true });

      el.addEventListener("touchend", function(e) {
        if (multi || ignore || e.touches.length > 0 || isPinchZoomed()) return;
        var dx = e.changedTouches[0].screenX - sx;
        var dy = e.changedTouches[0].screenY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          if (dx < 0 && onSwipeLeft) onSwipeLeft();
          else if (dx > 0 && onSwipeRight) onSwipeRight();
        }
      }, { passive: true });
    }

    var fallbackSvg = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="15">Εικόνα Πιερίας</text></svg>'
    );

function handleImgFallback() {
      var full = cleanRawUrl(this.getAttribute("data-full-src"));
      if (full) noThumbUrls[full] = true;
      if (full && this.getAttribute("data-tried-full") !== full) {
        this.setAttribute("data-tried-full", full);
        if (this.src !== full) {
          this.src = full;
          return;
        }
      }
      if (this.src !== fallbackSvg) this.src = fallbackSvg;
    }
    modal.querySelectorAll("img").forEach(function(img) {
      if (img === zoomTarget) return;
      img.addEventListener("error", handleImgFallback);
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src") && img.src.indexOf("data:image/") !== 0) {
        handleImgFallback.call(img);
      }
    });

    /* Μεγέθυνση φωτογραφίας με πλοήγηση (κουμπιά, swipe, βελάκια) */
    var zoomList = [];
    var zoomIdx = 0;
    var zoomLoadToken = 0;
   var zoomPrevBtn = null;
    var zoomNextBtn = null;
    var zoom1922Patch = null;

    var blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    function closeZoom(fromPopState) {
      if (!zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
      zoomOverlay.classList.remove("is-open");
      unlockBodyScroll();
      var needBack = (!fromPopState && histZoomOpen);
      histZoomOpen = false;
      if (needBack) safeHistoryBack(1);
    }

    if (zoomOverlay) {
      if (zoomTarget && zoomTarget.parentNode === zoomOverlay) {
        var zoomImgWrap = document.createElement("div");
        zoomImgWrap.className = "pexp-zoom-img-wrap";
        zoomOverlay.insertBefore(zoomImgWrap, zoomTarget);
        zoomImgWrap.appendChild(zoomTarget);
        var zPatchTmp = document.createElement("div");
        zPatchTmp.innerHTML =
          '<svg id="pexpZoom1922Patch" viewBox="0 0 1000 568" preserveAspectRatio="none" style="display:none;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:14px" aria-hidden="true">' +
            '<defs><filter id="pexpZ22Soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.9"/></filter></defs>' +
            '<polygon points="823,160 845,159 846,181 822,182" fill="#ecebe3" filter="url(#pexpZ22Soft)"/>' +
            '<path d="M 844,168 Q 833,174 820,179" fill="none" stroke="#c3873b" stroke-width="3.2" stroke-dasharray="7,5" stroke-linecap="round"/>' +
            '<circle cx="849" cy="166.5" r="5.3" fill="#1e293b"/>' +
            '<polygon points="644,244 676,242 676,269 644,282" fill="#ffffff"/>' +
            '<path d="M 677,253.8 L 643,268.5" fill="none" stroke="#244f7c" stroke-width="3.5" stroke-linecap="round"/>' +
            '<polygon points="650,265.5 660.2,254.4 659.2,261.5 665.1,265.8" fill="#244f7c"/>' +
          '</svg>';
        zoom1922Patch = zPatchTmp.firstElementChild;
        if (zoom1922Patch) zoomImgWrap.appendChild(zoom1922Patch);
      }
      var zoomCloseBtn = document.createElement("button");
      zoomCloseBtn.type = "button";
      zoomCloseBtn.className = "pexp-zoom-close";
      zoomCloseBtn.setAttribute("aria-label", "Κλείσιμο");
      zoomCloseBtn.textContent = "\u2715";

      zoomPrevBtn = document.createElement("button");
      zoomPrevBtn.type = "button";
      zoomPrevBtn.className = "pexp-zoom-nav pexp-zoom-prev";
      zoomPrevBtn.setAttribute("aria-label", "Προηγούμενη φωτογραφία");
      zoomPrevBtn.textContent = "\u2039";

      zoomNextBtn = document.createElement("button");
      zoomNextBtn.type = "button";
      zoomNextBtn.className = "pexp-zoom-nav pexp-zoom-next";
      zoomNextBtn.setAttribute("aria-label", "Επόμενη φωτογραφία");
      zoomNextBtn.textContent = "\u203A";

      zoomOverlay.appendChild(zoomCloseBtn);
      zoomOverlay.appendChild(zoomPrevBtn);
      zoomOverlay.appendChild(zoomNextBtn);

    var zDownPt = null;
      var zMulti = false;
      zoomOverlay.addEventListener("touchstart", function(e) {
        if (e.touches && e.touches.length > 1) zMulti = true;
      }, { passive: true });
      zoomOverlay.addEventListener("touchmove", function(e) {
        if (e.touches && e.touches.length > 1) zMulti = true;
      }, { passive: true });
      zoomOverlay.addEventListener("pointerdown", function(e) {
        if (e.isPrimary === false) { zMulti = true; zDownPt = null; return; }
        zMulti = false;
        zDownPt = { x: e.clientX, y: e.clientY };
      }, { passive: true });
      zoomCloseBtn.addEventListener("click", function(e) { e.stopPropagation(); closeZoom(false); });
      zoomPrevBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(-1); });
      zoomNextBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(1); });
      zoomOverlay.addEventListener("click", function(e) {
        if (zMulti || isPinchZoomed() || !zDownPt) return;
        if (Math.abs(e.clientX - zDownPt.x) > 8 || Math.abs(e.clientY - zDownPt.y) > 8) return;
        closeZoom(false);
      });
      bindSwipe(zoomOverlay, function() { stepZoom(1); }, function() { stepZoom(-1); });
    }

  function openZoomWithList(list, startIndex) {
      if (!list || !list.length || !zoomOverlay) return;
      pauseHeroVideo();
      stopMap1922Anim();
      var wasOpen = zoomOverlay.classList.contains("is-open");
      zoomList = list;
      zoomIdx = (startIndex >= 0 && startIndex < list.length) ? startIndex : 0;
      if (document.body.lastElementChild !== zoomOverlay) {
        document.body.appendChild(zoomOverlay);
      }
      renderZoomItem();
      zoomOverlay.classList.add("is-open");
      lockBodyScroll();

      if (!wasOpen && !histZoomOpen) {
        histZoomOpen = true;
        try {
          var nextState = { pexpZoom: true };
          if (histModalOpen || modal.classList.contains("is-open")) nextState.pexpModal = true;
          if (histMapOpen || isMapZoomed) nextState.pfacMapZoom = true;
          if (histRegMapOpen || isRegMapZoomed) nextState.pregMapZoom = true;
          window.history.pushState(nextState, "", window.location.href);
        } catch (e) {}
      }
    }

  function renderZoomItem() {
      var item = zoomList[zoomIdx];
      if (!item) return;
      if (zoom1922Patch) {
        var is1922Map = !!(item.src && item.src.indexOf("AVvXsEi1JSEGe8aI6RfIJmm0ndGCeqlKRd4e6V_G8uyh2GHVv5fEh") !== -1);
        zoom1922Patch.style.display = is1922Map ? "block" : "none";
      }
      if (zoomTarget) {
        var token = ++zoomLoadToken;
        var fullUrl = optZoomUrl(item.src);
        var rawClean = cleanRawUrl(item.src);
        var previewUrl = item.thumb || "";
        var zErrStep = 0;
        zoomTarget.onerror = function() {
          if (zErrStep === 0 && rawClean && rawClean !== fullUrl) {
            zErrStep = 1;
            this.src = rawClean;
          } else if (zErrStep <= 1 && previewUrl && previewUrl !== rawClean) {
            zErrStep = 2;
            this.src = previewUrl;
          } else {
            this.onerror = null;
            this.src = fallbackSvg;
          }
        };

        var probe = new Image();
        probe.src = fullUrl;
        if (probe.complete && probe.naturalWidth > 0) {
          zoomTarget.src = fullUrl;
        } else if (previewUrl && previewUrl !== fullUrl && previewUrl.indexOf("data:image/gif") !== 0) {
          zoomTarget.src = previewUrl;
          probe.decoding = "async";
          probe.onload = function() {
            if (token === zoomLoadToken && zoomTarget) zoomTarget.src = fullUrl;
          };
          probe.onerror = function() {
            if (token === zoomLoadToken && rawClean && rawClean !== fullUrl && zoomTarget) {
              zoomTarget.src = rawClean;
            }
          };
        } else if (zoomTarget.src !== fullUrl) {
          zoomTarget.src = blankGif;
          zoomTarget.src = fullUrl;
        }
      }
      if (zoomCap) {
        var countSuffix = zoomList.length > 1 ? " (" + (zoomIdx + 1) + "/" + zoomList.length + ")" : "";
        zoomCap.textContent = (item.caption || "") + countSuffix;
      }
      var navDisp = zoomList.length > 1 ? "flex" : "none";
      if (zoomPrevBtn) zoomPrevBtn.style.display = navDisp;
      if (zoomNextBtn) zoomNextBtn.style.display = navDisp;

      if (zoomList.length > 1) {
        var nextZItem = zoomList[(zoomIdx + 1) % zoomList.length];
        var prevZItem = zoomList[(zoomIdx - 1 + zoomList.length) % zoomList.length];
        if (nextZItem && nextZItem.src) preloadImg(optZoomUrl(nextZItem.src));
        if (prevZItem && prevZItem.src) preloadImg(optZoomUrl(prevZItem.src));
      }
    }

    function stepZoom(dir) {
      if (zoomList.length <= 1) return;
      zoomIdx = (zoomIdx + dir + zoomList.length) % zoomList.length;
      renderZoomItem();
    }

    modal.addEventListener("click", function(e) {
      var zImg = e.target.closest(".pexp-zoomable");
      if (!zImg) return;
      var zFullAttr = zImg.getAttribute("data-full-src") || "";
      if ((!zImg.src || zImg.src.indexOf("data:image/") === 0) && !zFullAttr) return;
      e.stopPropagation();

      if (zImg.id === "pexpRouteMainImg" && typeof routePhotos !== "undefined" && routePhotos.length) {
        var rList = routePhotos.map(function(p) { return { src: p.src, thumb: optImg(p.src, 640), caption: p.alt || "" }; });
        var rIdx = 0;
        var curFull = zFullAttr || zImg.src;
        for (var i = 0; i < routePhotos.length; i++) {
          if (curFull === routePhotos[i].src || zImg.src === routePhotos[i].src) {
            rIdx = i;
            break;
          }
        }
        openZoomWithList(rList, rIdx);
      } else if (zImg.id === "pexpChurchMainImg" && churchesData.length) {
        var cList = churchesData.map(function(c) { return { src: c.img, thumb: optImg(c.img, 640), caption: c.caption }; });
        openZoomWithList(cList, currentChurchIdx);
      } else {
        var scope = zImg.closest(".pexp-pane") || modal;
        var candidates = scope.querySelectorAll(".pexp-zoomable");
        var gList = [];
        var gIdx = 0;
        candidates.forEach(function(el) {
          var elFull = el.getAttribute("data-full-src") || "";
          var hasRealSrc = !!(el.src && el.src.indexOf("data:image/") !== 0);
          if ((hasRealSrc || elFull) && el.offsetParent !== null) {
            if (el === zImg) gIdx = gList.length;
            gList.push({
              src: elFull || el.src,
              thumb: hasRealSrc ? el.src : "",
              caption: el.alt || ""
            });
          }
        });
        openZoomWithList(gList, gIdx);
      }
    });

   var historyWrap = document.querySelector(".school-history-wrapper") || document;
    var pageImageLinks = historyWrap.querySelectorAll(".timeline-event a.image-link");
    pageImageLinks.forEach(function(link, clickedIdx) {
      var initIm = link.querySelector("img");
     if (initIm && !initIm.style.aspectRatio && !link.closest(".tl-dual-card")) {
        var dimM = (initIm.getAttribute("src") || "").match(/\/w(\d+)-h(\d+)\//);
        if (dimM && dimM[1] && dimM[2]) initIm.style.aspectRatio = dimM[1] + " / " + dimM[2];
      }
      link.addEventListener("click", function(e) {
        var img = link.querySelector("img");
        var fullHref = link.getAttribute("href");
        if (!fullHref && (!img || !img.src)) return;
        e.preventDefault();

        var pList = [];
        pageImageLinks.forEach(function(lnk) {
          var im = lnk.querySelector("img");
          var srcUrl = lnk.getAttribute("href") || (im ? im.src : "");
          var thumbUrl = im ? im.src : "";
          var altTxt = im && im.alt ? im.alt.trim() : "";
          var evBox = lnk.closest(".timeline-event");
          var dateEl = evBox ? evBox.querySelector(".timeline-date") : null;
          var dateTxt = dateEl ? dateEl.textContent.trim() : "";
         var hasYr = /\b(19|20)\d{2}\b/.test(altTxt);
          var capTxt = (dateTxt && altTxt && !hasYr) ? (dateTxt + " \u2022 " + altTxt) : (altTxt || dateTxt);
          pList.push({ src: srcUrl, thumb: thumbUrl, caption: capTxt });
        });

      openZoomWithList(pList, clickedIdx);
      });
    });

  var openCentennialMirror = function() {
      window.openPeristasiModal("population", false);
      openMirrorInModal();
    };

   var timelineEvents = historyWrap.querySelectorAll(".timeline-event");
    var tlDefaultYears = [1924, 1926, 1947, 1965, 1981];
    timelineEvents.forEach(function(evEl, idx) {
      if (evEl.querySelector(".pexp-tl-actions")) return;
      var dateSpan = evEl.querySelector(".timeline-date");
      var dateTxt = dateSpan ? dateSpan.textContent : "";
      var targetYr = tlDefaultYears[idx] || 1924;
     if (dateTxt.indexOf("1952") !== -1 || dateTxt.indexOf("1965") !== -1) targetYr = 1965;
      else if (dateTxt.indexOf("1947") !== -1 || dateTxt.indexOf("1950") !== -1) targetYr = 1947;
      else if (dateTxt.indexOf("1925") !== -1 || dateTxt.indexOf("1926") !== -1) targetYr = 1926;
      else if (dateTxt.indexOf("1981") !== -1) targetYr = 1981;
      else if (dateTxt.indexOf("1922") !== -1 || dateTxt.indexOf("1924") !== -1) targetYr = 1924;

      if (targetYr === 1926 && !evEl.querySelector("a.image-link, .pexp-cent-banner")) {
        var centCard = document.createElement("div");
        centCard.className = "pexp-cent-banner";
        centCard.setAttribute("role", "button");
        centCard.setAttribute("tabindex", "0");
        centCard.setAttribute("aria-label", "1926 έως 2026: 100 Χρόνια Σχολείο - Άνοιγμα Καθρέφτη Εκατονταετηρίδας");
        centCard.innerHTML =
          '<svg class="pexp-cent-svg" viewBox="0 0 640 210" shape-rendering="geometricPrecision" role="img" aria-hidden="true">' +
            '<defs>' +
              '<linearGradient id="pcentOldBg" x1="0%" y1="0%" x2="0%" y2="100%">' +
                '<stop offset="0%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/>' +
              '</linearGradient>' +
              '<linearGradient id="pcentNewBg" x1="0%" y1="0%" x2="0%" y2="100%">' +
                '<stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#dcfce7"/>' +
              '</linearGradient>' +
            '</defs>' +
            '<rect x="0" y="0" width="320" height="210" fill="url(#pcentOldBg)"/>' +
            '<rect x="320" y="0" width="320" height="210" fill="url(#pcentNewBg)"/>' +
            '<path d="M 0,168 L 320,168 L 320,210 L 0,210 Z" fill="#f59e0b" opacity="0.22"/>' +
            '<path d="M 320,168 L 640,168 L 640,210 L 320,210 Z" fill="#22c55e" opacity="0.24"/>' +
            '<rect x="14" y="12" width="188" height="22" rx="11" fill="#92400e"/>' +
            '<text x="108" y="27" text-anchor="middle" fill="#fffbeb" font-size="11" font-weight="900">1925\u20131926 \u2022 Πρώτες Ρίζες</text>' +
            '<rect x="36" y="106" width="58" height="62" rx="3" fill="#ffffff" stroke="#b45309" stroke-width="2"/>' +
            '<path d="M 36,106 Q 65,78 94,106 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1.5"/>' +
            '<line x1="65" y1="72" x2="65" y2="86" stroke="#b45309" stroke-width="2.2"/>' +
            '<line x1="60" y1="77" x2="70" y2="77" stroke="#b45309" stroke-width="2.2"/>' +
            '<rect x="57" y="136" width="16" height="32" rx="8" fill="#92400e"/>' +
            '<rect x="116" y="114" width="138" height="54" rx="3" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>' +
            '<polygon points="108,114 185,80 262,114" fill="#dc2626" stroke="#991b1b" stroke-width="1.8"/>' +
            '<rect x="228" y="82" width="11" height="20" fill="#78350f"/>' +
            '<rect x="130" y="128" width="22" height="20" rx="2" fill="#bae6fd" stroke="#92400e" stroke-width="1.5"/>' +
            '<rect x="162" y="128" width="22" height="20" rx="2" fill="#bae6fd" stroke="#92400e" stroke-width="1.5"/>' +
            '<rect x="220" y="128" width="22" height="20" rx="2" fill="#bae6fd" stroke="#92400e" stroke-width="1.5"/>' +
            '<rect x="193" y="132" width="18" height="36" rx="2" fill="#92400e"/>' +
            '<text x="148" y="191" text-anchor="middle" fill="#78350f" font-size="11.5" font-weight="900">\u26EA Αη-Γιώργης &amp; Σχολείο 3 Αιθουσών</text>' +
            '<rect x="432" y="12" width="194" height="22" rx="11" fill="#1d4ed8"/>' +
            '<text x="529" y="27" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900">2026 \u2022 12/θέσιο Δημοτικό μας</text>' +
            '<rect x="386" y="92" width="118" height="76" rx="4" fill="#f8fafc" stroke="#475569" stroke-width="2"/>' +
            '<polygon points="380,92 445,64 510,92" fill="#dc2626" stroke="#991b1b" stroke-width="1.8"/>' +
            '<line x1="445" y1="42" x2="445" y2="64" stroke="#334155" stroke-width="2"/>' +
            '<rect x="446" y="43" width="18" height="12" rx="1.5" fill="#2563eb"/>' +
            '<line x1="446" y1="49" x2="464" y2="49" stroke="#ffffff" stroke-width="2"/>' +
            '<rect x="398" y="103" width="18" height="16" rx="2" fill="#93c5fd" stroke="#475569" stroke-width="1.3"/>' +
            '<rect x="424" y="103" width="18" height="16" rx="2" fill="#93c5fd" stroke="#475569" stroke-width="1.3"/>' +
            '<rect x="450" y="103" width="18" height="16" rx="2" fill="#93c5fd" stroke="#475569" stroke-width="1.3"/>' +
            '<rect x="476" y="103" width="18" height="16" rx="2" fill="#93c5fd" stroke="#475569" stroke-width="1.3"/>' +
            '<rect x="398" y="128" width="18" height="16" rx="2" fill="#93c5fd" stroke="#475569" stroke-width="1.3"/>' +
            '<rect x="476" y="128" width="18" height="16" rx="2" fill="#93c5fd" stroke="#475569" stroke-width="1.3"/>' +
            '<rect x="435" y="132" width="22" height="36" rx="3" fill="#1e6cff"/>' +
            '<rect x="504" y="106" width="96" height="62" rx="4" fill="#fef9c3" stroke="#d97706" stroke-width="2"/>' +
            '<polygon points="500,106 552,83 606,106" fill="#ea580c" stroke="#c2410c" stroke-width="1.6"/>' +
            '<rect x="516" y="118" width="20" height="16" rx="2" fill="#bae6fd" stroke="#d97706" stroke-width="1.3"/>' +
            '<rect x="544" y="118" width="20" height="16" rx="2" fill="#bae6fd" stroke="#d97706" stroke-width="1.3"/>' +
            '<rect x="572" y="118" width="20" height="16" rx="2" fill="#bae6fd" stroke="#d97706" stroke-width="1.3"/>' +
            '<circle cx="618" cy="144" r="14" fill="#22c55e"/>' +
            '<rect x="615" y="154" width="6" height="14" fill="#78350f"/>' +
            '<text x="492" y="191" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="900">\uD83C\uDFEB Πέτρινο Κτίριο, Νέα Πτέρυγα &amp; Αυλή</text>' +
            '<line x1="320" y1="0" x2="320" y2="210" stroke="#ffffff" stroke-width="3" stroke-dasharray="6,5"/>' +
            '<circle cx="320" cy="105" r="40" fill="#ffffff" stroke="#f59e0b" stroke-width="4"/>' +
            '<circle cx="320" cy="105" r="34" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>' +
            '<text x="320" y="95" text-anchor="middle" fill="#b45309" font-size="15" font-weight="900">\uD83C\uDF82 100</text>' +
            '<text x="320" y="111" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="900">ΧΡΟΝΙΑ</text>' +
            '<text x="320" y="125" text-anchor="middle" fill="#64748b" font-size="9.5" font-weight="800">1926\u20132026</text>' +
          '</svg>' +
          '<div class="pexp-cent-cap">' +
            '<span>\uD83E\uDE9E <strong>1926 \u2013 2026: Ένας αιώνας σχολείο στην ίδια αυλή!</strong></span>' +
            '<span class="pexp-cent-cta">Σύγκρινε 1926 vs 2026 \u279C</span>' +
          '</div>';
        centCard.addEventListener("click", openCentennialMirror);
        centCard.addEventListener("keydown", function(e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCentennialMirror();
          }
        });
        evEl.appendChild(centCard);
      }

      var actWrap = document.createElement("div");
      actWrap.className = "pexp-tl-actions";

     var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pexp-tl-bridge-btn";
      btn.textContent = "\u23F3 Δες το χωριό το " + targetYr;
      btn.addEventListener("click", function() {
        openPopulationAtYear(targetYr);
      });
      actWrap.appendChild(btn);

      if (idx === 0 && targetYr === 1924) {
        var btnRoute = document.createElement("button");
        btnRoute.type = "button";
        btnRoute.className = "pexp-tl-bridge-btn";
        btnRoute.textContent = "\u26F5 Δες το Ταξίδι του 1922";
        btnRoute.addEventListener("click", function() {
          window.openPeristasiModal("route", false);
        });
        actWrap.appendChild(btnRoute);
      }

      if (targetYr === 1926) {
        var btnMir = document.createElement("button");
        btnMir.type = "button";
        btnMir.className = "pexp-tl-bridge-btn pexp-tl-bridge-btn--gold";
        btnMir.textContent = "\uD83E\uDE9E 100 Χρόνια: 1926 vs 2026";
        btnMir.addEventListener("click", openCentennialMirror);
        actWrap.appendChild(btnMir);
      }

      if (targetYr === 1947) {
        var btnSkot = document.createElement("button");
        btnSkot.type = "button";
        btnSkot.className = "pexp-tl-bridge-btn";
        btnSkot.textContent = "\uD83D\uDFE7 Ρίζες Σκοτεινών & Βλάχων";
        btnSkot.addEventListener("click", function() {
          openPopulationAtYear(1947);
          triggerRootBubble("vlach", false);
        });
        actWrap.appendChild(btnSkot);
      }

      if (dateTxt.indexOf("Σήμερα") !== -1) {
        var btnToday = document.createElement("button");
        btnToday.type = "button";
        btnToday.className = "pexp-tl-bridge-btn";
        btnToday.textContent = "\u23F3 Δες το χωριό σήμερα (2021)";
        btnToday.addEventListener("click", function() {
          openPopulationAtYear(2021);
        });
        actWrap.appendChild(btnToday);
      }

      evEl.appendChild(actWrap);
    });

    /* Εναλλαγή Καρτελών */
    var tabBtns = modal.querySelectorAll("#pexpTabs .pexp-tab-btn");
    var panes = {
      population: document.getElementById("pexp-pane-population"),
      route: document.getElementById("pexp-pane-route"),
      elevation: document.getElementById("pexp-pane-elevation"),
      churches: document.getElementById("pexp-pane-churches")
    };

    function stopPopAutoplay() {
      if (popTimer) {
        clearInterval(popTimer);
        popTimer = null;
        var playBtn = document.getElementById("pexpPlayBtn");
        if (playBtn) playBtn.textContent = "\u25B6\uFE0F Παίξε την Ιστορία!";
      }
    }

   var cancelRouteAnim = function() {};
    var stopSpeedRace = function() {};

    function stopRouteAutoplay() {
      if (routeTimer) {
        clearInterval(routeTimer);
        routeTimer = null;
      }
      cancelRouteAnim();
      stopSpeedRace(true);
      var rBtn = document.getElementById("pexpPlayRouteBtn");
      if (rBtn) {
        rBtn.textContent = "\u25B6\uFE0F Παίξε το Ταξίδι!";
        rBtn.classList.remove("is-playing");
      }
    }

var tabsStripEl = document.getElementById("pexpTabs");
    var tabsMoreBtn = null;
    if (tabsStripEl && tabsStripEl.parentNode && !document.getElementById("pexpTabsMoreBtn")) {
      var tabsWrapEl = document.createElement("div");
      tabsWrapEl.className = "pexp-tabs-wrap";
      tabsStripEl.parentNode.insertBefore(tabsWrapEl, tabsStripEl);
      tabsWrapEl.appendChild(tabsStripEl);

      tabsMoreBtn = document.createElement("button");
      tabsMoreBtn.type = "button";
      tabsMoreBtn.id = "pexpTabsMoreBtn";
      tabsMoreBtn.className = "pexp-tabs-more-btn";
      tabsMoreBtn.tabIndex = -1;
      tabsMoreBtn.setAttribute("aria-label", "Περισσότερες καρτέλες δεξιά");
      tabsMoreBtn.title = "Δες και τις υπόλοιπες καρτέλες";
      tabsMoreBtn.textContent = "\u203A";
      tabsWrapEl.appendChild(tabsMoreBtn);
      tabsMoreBtn.addEventListener("click", function() {
        var step = Math.max(130, Math.round(tabsStripEl.clientWidth * 0.65));
        if (tabsStripEl.scrollTo) tabsStripEl.scrollTo({ left: tabsStripEl.scrollLeft + step, behavior: "smooth" });
        else tabsStripEl.scrollLeft += step;
      });
    }
    function syncTabsFadeHint() {
      if (!tabsStripEl) return;
      var maxSc = tabsStripEl.scrollWidth - tabsStripEl.clientWidth;
      var hasR = maxSc > 6 && tabsStripEl.scrollLeft < maxSc - 6;
      tabsStripEl.classList.toggle("has-fade-l", maxSc > 6 && tabsStripEl.scrollLeft > 6);
      tabsStripEl.classList.toggle("has-fade-r", hasR);
      if (tabsMoreBtn) {
        tabsMoreBtn.classList.toggle("is-vis", hasR);
        tabsMoreBtn.tabIndex = hasR ? 0 : -1;
      }
    }
    if (tabsStripEl) {
      tabsStripEl.addEventListener("scroll", syncTabsFadeHint, { passive: true });
      window.addEventListener("resize", function() { requestAnimationFrame(syncTabsFadeHint); }, { passive: true });
    }

    function activateTab(tabName, skipAutoInit) {
      if (!panes[tabName]) tabName = "population";
      stopPopAutoplay();
      stopRouteAutoplay();
      stopCartGame();
      stopOlympusGame();
      stopCratesGame();
      closeRootBubble();
      resetCapsuleView();
      currentTab = tabName;

      var activeTabEl = null;
      tabBtns.forEach(function(b) {
        var isAct = (b.getAttribute("data-tab") === tabName);
        b.classList.toggle("is-active", isAct);
        if (isAct) activeTabEl = b;
      });
      if (tabsStripEl && activeTabEl && tabsStripEl.scrollWidth > tabsStripEl.clientWidth) {
        var targetScroll = Math.max(0, activeTabEl.offsetLeft - (tabsStripEl.clientWidth - activeTabEl.offsetWidth) / 2);
        if (tabsStripEl.scrollTo) tabsStripEl.scrollTo({ left: targetScroll, behavior: "smooth" });
        else tabsStripEl.scrollLeft = targetScroll;
      }
      syncTabsFadeHint();
      Object.keys(panes).forEach(function(k) {
        if (panes[k]) panes[k].classList.toggle("is-active", k === tabName);
      });
      if (modalBody) modalBody.scrollTop = 0;

      if (tabName === "route") {
        if (!skipAutoInit && !routeReady) renderStop(0);
      } else if (tabName === "elevation") {
        if (!skipAutoInit && !elevReady) selectZone(1);
        if (!weatherLoaded) loadLiveTemperatures();
      } else if (tabName === "churches") {
        if (!skipAutoInit && !churchesReady) renderChurch(0);
      }
    }

    tabBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        activateTab(btn.getAttribute("data-tab"), false);
      });
    });

 document.addEventListener("visibilitychange", function() {
      if (document.hidden) {
        stopPopAutoplay();
        stopRouteAutoplay();
        stopNeighborhoodWalkAnim();
        stopMap1922Anim();
        pauseHeroVideo();
      }
    });

    window.openPeristasiModal = function(initialTab, skipAutoInit) {
      ensureExplorerInit();
      pauseHeroVideo();
      stopMap1922Anim();
      if (!modal.classList.contains("is-open") && document.activeElement && document.activeElement !== document.body) {
        lastFocusedEl = document.activeElement;
      }
      var replaceTopEntry = (histZoomOpen || histMapOpen || histRegMapOpen) && !histModalOpen;
      histZoomOpen = false;
      if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        zoomOverlay.classList.remove("is-open");
      }
      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      if (zoomOverlay && document.body.lastElementChild !== zoomOverlay) document.body.appendChild(zoomOverlay);

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      lockBodyScroll();
      if (isMapZoomed) closeMapZoom(true);
      if (isRegMapZoomed) closeRegMapZoom(true);
      if (!skipAutoInit && initialTab === "route" && subBtns && subBtns[0] && subJourney && subJourney.style.display === "none") {
        subBtns[0].click();
      }
      activateTab(initialTab || "population", !!skipAutoInit);

      requestAnimationFrame(function() {
        syncTabsFadeHint();
        var focusTarget = modal.querySelector("#pexpTabs .pexp-tab-btn.is-active") || document.getElementById("pexpCloseBtn");
        if (focusTarget && focusTarget.focus) {
          try { focusTarget.focus({ preventScroll: true }); } catch (err) { focusTarget.focus(); }
        }
      });

      try {
        if (replaceTopEntry) {
          histModalOpen = true;
          window.history.replaceState({ pexpModal: true }, "", window.location.href);
        } else if (!histModalOpen) {
          histModalOpen = true;
          window.history.pushState({ pexpModal: true }, "", window.location.href);
        }
      } catch (e) {}
    };

    window.openChurchesModal = function() {
      window.openPeristasiModal("churches");
    };

    function closePeristasiModal(fromPopState) {
      if (!modal.classList.contains("is-open")) return;
      stopPopAutoplay();
      stopRouteAutoplay();
      stopCartGame();
      stopOlympusGame();
      stopCratesGame();
      closeRootBubble();
      resetCapsuleView();

      if (zoomOverlay) zoomOverlay.classList.remove("is-open");
      if (modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      unlockBodyScroll();

      if (lastFocusedEl && typeof lastFocusedEl.focus === "function" && document.contains(lastFocusedEl)) {
        var toFocus = lastFocusedEl;
        lastFocusedEl = null;
        requestAnimationFrame(function() {
          try { toFocus.focus({ preventScroll: true }); } catch (err) { toFocus.focus(); }
        });
      }

      var stepsBack = 0;
      if (!fromPopState) {
        if (histZoomOpen) stepsBack++;
        if (histModalOpen) stepsBack++;
      }
      histZoomOpen = false;
      histModalOpen = false;
      if (stepsBack > 0) safeHistoryBack(stepsBack);
    }

    on("pexpCloseBtn", "click", function() { closePeristasiModal(false); });
   var modalBackdropDown = false;
    modal.addEventListener("pointerdown", function(e) {
      modalBackdropDown = (e.isPrimary !== false && e.target === modal);
    }, { passive: true });
    modal.addEventListener("click", function(e) {
      if (modalBackdropDown && !isPinchZoomed() && e.target === modal) closePeristasiModal(false);
      modalBackdropDown = false;
    });
   function trapFocusIn(container, ev) {
      var nodes = container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      var list = [];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) {
          var cs = window.getComputedStyle(el);
          if (cs.visibility !== "hidden" && cs.pointerEvents !== "none") list.push(el);
        }
      }
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (ev.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          ev.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !container.contains(document.activeElement)) {
        ev.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", function(e) {
      if (e.key === "Tab") {
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
          trapFocusIn(zoomOverlay, e);
        } else if (modal.classList.contains("is-open")) {
          trapFocusIn(modal, e);
        }
        return;
      }

      if (e.key === "Escape") {
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
          closeZoom(false);
        } else if (isRegMapZoomed) {
          closeRegMapZoom(false);
        } else if (isMapZoomed) {
          closeMapZoom(false);
        } else if (modal.classList.contains("is-open") && hasActiveSubGame()) {
          closeRootBubble();
          resetCapsuleView();
          stopCartGame();
          stopOlympusGame();
          stopCratesGame();
        } else if (modal.classList.contains("is-open")) {
          closePeristasiModal(false);
        } else if (isMap1922Active() && clearMap1922Spot) {
          clearMap1922Spot();
        } else if (activeFacIdx !== -1) {
          var openMir = document.getElementById("pfacMirrorStage");
          if (openMir && openMir.style.display === "block") {
            openMir.style.display = "none";
            openMir.innerHTML = "";
          } else {
            closeFacilityCard();
          }
        }
        return;
      }

      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      var dir = (e.key === "ArrowRight") ? 1 : -1;

      if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        if (zoomList.length > 1) {
          e.preventDefault();
          stepZoom(dir);
        }
        return;
      }

      if (modal.classList.contains("is-open")) {
        if (currentTab === "route") {
          e.preventDefault();
          if (subToday && subToday.style.display === "block") {
            if (selectDestByStep) selectDestByStep(dir);
          } else {
            stopRouteAutoplay();
            renderStop(currentStopIdx + dir, false);
          }
        } else if (currentTab === "elevation") {
          if (isOlympusGuessing()) return;
          e.preventDefault();
          selectZone(curZoneIdx + dir);
        } else if (currentTab === "churches") {
          e.preventDefault();
          renderChurch(currentChurchIdx + dir);
       } else if (currentTab === "population") {
          if (capsuleOpen) return;
          e.preventDefault();
          if (mirrorOpen && mirrorModalBox && mirrorModalBox._stepMirror) {
            mirrorModalBox._stepMirror(dir);
          } else if (stepPopulationMilestone) {
            stepPopulationMilestone(dir);
          }
        }
        return;
      }

      if (isRegMapZoomed) {
        e.preventDefault();
        if (stepRegPinFn) stepRegPinFn(dir);
        return;
      }

      if (isMapZoomed) {
        e.preventDefault();
        openFacilityCard(activeFacIdx === -1 ? 0 : activeFacIdx + dir, false);
        return;
      }

     var wrap22 = document.getElementById("ptl22Wrap");
      if (wrap22 && isMap1922Active() && stepMap1922Spot) {
        var r22 = wrap22.getBoundingClientRect();
        if (r22.bottom > 0 && r22.top < window.innerHeight) {
          e.preventDefault();
          stepMap1922Spot(dir);
          return;
        }
      }

      if (activeFacIdx !== -1 && pfacStage) {
        var stRect = pfacStage.getBoundingClientRect();
        if (stRect.bottom > 0 && stRect.top < window.innerHeight) {
          e.preventDefault();
          var inlineMir = document.getElementById("pfacMirrorStage");
          if (inlineMir && inlineMir.style.display === "block" && inlineMir._stepMirror) {
            inlineMir._stepMirror(dir);
          } else {
            openFacilityCard(activeFacIdx + dir, false);
          }
        }
      }
    });

    window.addEventListener("popstate", function() {
      if (ignorePopCount > 0) {
        ignorePopCount--;
        if (modal.classList.contains("is-open") && !(window.history.state && window.history.state.pexpModal)) {
          histModalOpen = true;
          try { window.history.replaceState({ pexpModal: true }, "", window.location.href); } catch (e) {}
        }
        return;
      }
      var st = window.history.state || {};
      if (!st.pexpZoom) {
        histZoomOpen = false;
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) closeZoom(true);
      }
      if (!st.pexpModal) {
        histModalOpen = false;
        if (modal.classList.contains("is-open")) closePeristasiModal(true);
      }
      if (!st.pfacMapZoom) {
        histMapOpen = false;
        if (isMapZoomed) closeMapZoom(true);
      }
      if (!st.pregMapZoom) {
        histRegMapOpen = false;
        if (isRegMapZoomed) closeRegMapZoom(true);
      }
      if ((st.pexpModal && !modal.classList.contains("is-open")) ||
          (st.pexpZoom && !(zoomOverlay && zoomOverlay.classList.contains("is-open"))) ||
          (st.pfacMapZoom && !isMapZoomed) ||
          (st.pregMapZoom && !isRegMapZoomed)) {
        try { window.history.replaceState(null, "", window.location.href); } catch (e) {}
      }
    });
    document.querySelectorAll(".pexp-card-trigger").forEach(function(card) {
      card.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

 ensureExplorerInit = function() {
      if (explorerInited) return;
      explorerInited = true;

    var censusData = [
      { year: 1924, pop: 500, story: "1923\u20131924: Οι πρώτες 130 οικογένειες προσφύγων (~500 ψυχές) από την Περίσταση και τα Λούπιδα της Ανατολικής Θράκης ριζώνουν στη θέση «Λημέρι»! Φτιάχνουν τα πρώτα σπιτάκια, τον Αη-Γιώργη και το πρώτο μικρό πλίνθινο σχολείο." },
      { year: 1926, pop: 560, story: "1926: Η Περίσταση γίνεται αυτόνομη Κοινότητα (τότε ανήκαμε στον Νομό Θεσσαλονίκης!) και ιδρύεται επίσημα στη σημερινή του θέση το σχολείο μας με 3 αίθουσες \u2014 η αρχή 100 χρόνων ιστορίας (1926\u20132026)!" },
      { year: 1928, pop: 616, story: "1928: Στο χωριό ζουν πια 166 προσφυγικές οικογένειες (616 κάτοικοι)! Κρατούν ζωντανό το έθιμο της εικόνας του Αγίου Μόδεστου, που φιλοξενείται από σπίτι σε σπίτι." },
      { year: 1940, pop: 936, story: "1940: Το χωριό μεγαλώνει στους 936 κατοίκους. Στον Β' Παγκόσμιο Πόλεμο φιλοξενούνται εδώ Νεοζηλανδοί στρατιώτες, ενώ στην Κατοχή το χωριό θρηνεί 14 ήρωες κατοίκους." },
      { year: 1947, pop: 1010, story: "1947: Οικογένειες από τα ορεινά Σκοτεινά (Μόρνα/Φωτεινά) φιλοξενούνται μέσα στις αίθουσες του σχολείου μας! Για να μη χαθεί η χρονιά, η δασκάλα Κατίνα Κουζώνη κάνει μάθημα στα παιδιά έξω στα «Αλώνια», καθισμένα οκλαδόν στο χώμα!" },
     { year: 1951, pop: 1071, story: "1951: Ξεπερνάμε τους 1.000 κατοίκους και ανήκουμε πια στον νέο Νομό Πιερίας (από το 1949)! Στα μεταπολεμικά αυτά χρόνια ο διευθυντής Κώστας Μοσχίδης με τους δασκάλους Κ. Κουζώνη, Φ. Μέλιο και Ι. Πάππα οργανώνουν συσσίτια και τους Προσκόπους." },
      { year: 1961, pop: 1130, story: "1961: Με 1.130 κατοίκους (καθώς αρκετοί νέοι φεύγουν τότε μετανάστες στη Γερμανία), ξεκινά η προσπάθεια για το νέο πέτρινο σχολείο μας (θεμελιώθηκε το 1960 και το ισόγειό του χτίστηκε το 1963)!" },
      { year: 1965, pop: 1148, story: "1965: Ολοκληρώνεται ο Α' όροφος πάνω από το πέτρινο ισόγειο (1963) και τα παιδιά μπαίνουν στο διώροφο πέτρινο σχολείο μας, ενώ φτάνουν και οι πρώτες οικογένειες Ποντίων!" },
      { year: 1971, pop: 1176, story: "1971: Το χωριό φτάνει τους 1.176 κατοίκους, ενώ ήδη από το 1968 παίζουν μπάλα οι δύο πρώτες ποδοσφαιρικές μας ομάδες, ο «Όλυμπος» και η «Αναγέννηση»!" },
      { year: 1981, pop: 1491, story: "1981: Φτάνουμε τους 1.491 κατοίκους! Οι δύο ομάδες έχουν ενωθεί στην Α.Ε. Περίστασης (από το 1978), ενώ ιδρύεται το Γυμνάσιο που φιλοξενείται τα πρώτα χρόνια στο σχολείο μας." },
     { year: 1991, pop: 1730, story: "1991: Νέες οικογένειες Ποντίων από τη Γεωργία, την Αρμενία, τη Ρωσία και το Καζακστάν —μαζί με οικογένειες από τα Βαλκάνια— ριζώνουν στην Περίσταση και το σχολείο μας γεμίζει παιδιά (1.730 κάτοικοι)!" },
     { year: 2001, pop: 2232, story: "2001: Το χωριό ξεπερνά τις 2.200 ψυχές (στον Δήμο Παραλίας το 1997\u20132010), ενώ ήδη από το 1998 ο Σύλλογος Ανατολικοθρακών Περίστασης κρατά ζωντανή την παράδοση!" },
      { year: 2006, pop: 2389, story: "2006: Εγκαινιάζεται η σύγχρονη νέα πτέρυγα του σχολείου μας (τότε 10/θέσιο, με Τμήμα Ένταξης από το 2004, πριν προαχθεί σε 12/θέσιο το 2012) με υπολογιστές, βιβλιοθήκη και ολοήμερο!" },
      { year: 2011, pop: 2545, story: "2011: Το μεγάλο ρεκόρ της Περίστασης με 2.545 κατοίκους (\u00D75,1 φορές περισσότεροι από τους πρώτους οικιστές)! Το χωριό μας ανήκει πλέον στον Δήμο Κατερίνης." },
      { year: 2021, pop: 2367, story: "2021 \u2013 Σήμερα (2.367 κάτοικοι): Ένα ζωντανό, μεγάλο χωριό με Παιδικό Σταθμό, Νηπιαγωγείο, το 12/θέσιο Δημοτικό μας, Γυμνάσιο και γήπεδα, όπου Θρακιώτες, Πόντιοι, Βλάχοι και Σκοτεινιώτες είμαστε μια αγκαλιά!" }
    ];

    var popSlider = document.getElementById("pexpPopSlider");
    if (popSlider) {
      popSlider.min = "1924";
      popSlider.max = "2021";
      popSlider.value = "1924";
    }
    var yearVal = document.getElementById("pexpYearVal");
    var popVal = document.getElementById("pexpPopVal");
    var scaleVal = document.getElementById("pexpScaleVal");
    var multVal = document.getElementById("pexpMultVal");
    if (!multVal && popVal && popVal.parentNode) {
      multVal = document.createElement("span");
      multVal.id = "pexpMultVal";
      multVal.className = "pexp-mult-pill";
      popVal.insertAdjacentElement("afterend", multVal);
    }
    var housesGrid = document.getElementById("pexpHousesGrid");
    var popStory = document.getElementById("pexpPopStory");
    var popChipsWrap = document.getElementById("pexpPopChips");

    if (popChipsWrap) {
     [
        { yr: 1926, label: "\uD83C\uDF82 1926" },
        { yr: 1947, label: "1947" },
        { yr: 1965, label: "\uD83C\uDFDB\uFE0F 1965" },
        { yr: 1981, label: "1981" },
        { yr: 2006, label: "\uD83C\uDFEB 2006" }
      ].forEach(function(ms) {
        if (popChipsWrap.querySelector('[data-year="' + ms.yr + '"]')) return;
        var stBtn = document.createElement("button");
        stBtn.type = "button";
        stBtn.className = "pexp-year-stone";
        stBtn.setAttribute("data-year", String(ms.yr));
        stBtn.textContent = ms.label;
        var existing = popChipsWrap.querySelectorAll(".pexp-year-stone[data-year]");
        var inserted = false;
        for (var i = 0; i < existing.length; i++) {
          if (Number(existing[i].getAttribute("data-year")) > ms.yr) {
            popChipsWrap.insertBefore(stBtn, existing[i]);
            inserted = true;
            break;
          }
        }
        if (!inserted) popChipsWrap.appendChild(stBtn);
      });
    }
    var popChips = document.querySelectorAll("#pexpPopChips .pexp-year-stone[data-year]");
    var playBtn = document.getElementById("pexpPlayBtn");
    var rootVlach = document.getElementById("pexpRootVlach");
    var rootPontic = document.getElementById("pexpRootPontic");
    var meadowSceneBox = panes.population ? panes.population.querySelector(".pexp-meadow-scene") : null;
    var eraNowEl = null;
    var eraStepBtns = [];

    if (housesGrid && housesGrid.parentNode && !document.getElementById("pexpLandscapeStrip")) {
      var lStrip = document.createElement("div");
      lStrip.id = "pexpLandscapeStrip";
      lStrip.className = "pexp-era-strip";
      lStrip.innerHTML =
        '<span class="pexp-era-now" id="pexpEraNowTxt"></span>' +
        '<div class="pexp-era-steps">' +
          '<button type="button" class="pexp-era-step" data-era-jump="1924">\uD83E\uDDF1 1924 Πλίνθινο</button>' +
          '<button type="button" class="pexp-era-step" data-era-jump="1965">\uD83C\uDFDB\uFE0F 1965 Πέτρινο</button>' +
          '<button type="button" class="pexp-era-step" data-era-jump="1981">\u26BD 1981 Γήπεδα &amp; Γυμν.</button>' +
          '<button type="button" class="pexp-era-step" data-era-jump="2006">\uD83C\uDFEB 2006 Νέα Πτέρυγα</button>' +
        '</div>';
      housesGrid.parentNode.insertBefore(lStrip, housesGrid);
      eraNowEl = document.getElementById("pexpEraNowTxt");
      eraStepBtns = lStrip.querySelectorAll(".pexp-era-step");
    }

    var lmSchoolEl = null;
    var lm1981El = null;
    var lm2006El = null;
    if (housesGrid) {
      housesGrid.innerHTML =
        '<span class="pexp-house-big pexp-house-landmark" data-lm="church" title="Ι.Ν. Αγίου Γεωργίου (από το 1924)">\u26EA</span>' +
        '<span class="pexp-house-big pexp-house-landmark pexp-lm-school" id="pexpLmSchool" data-lm="school" data-sera="1924" title="1924: Πρώτο Πλίνθινο Σχολείο">\uD83E\uDDF1</span>' +
        '<span class="pexp-house-big pexp-house-landmark pexp-lm-extra" id="pexpLm1981" data-lm="gym1981" style="display:none" title="1981: Γήπεδα &amp; Γυμνάσιο Περίστασης">\u26BD</span>' +
        '<span class="pexp-house-big pexp-house-landmark pexp-lm-extra" id="pexpLm2006" data-lm="wing2006" style="display:none" title="2006: Νέα Πτέρυγα &amp; Εργαστήρια Σχολείου">\uD83D\uDDA5\uFE0F</span>';
      lmSchoolEl = document.getElementById("pexpLmSchool");
      lm1981El = document.getElementById("pexpLm1981");
      lm2006El = document.getElementById("pexpLm2006");
    }

    var numFmt = (typeof Intl !== "undefined" && Intl.NumberFormat) ? new Intl.NumberFormat("el-GR") : null;
    var renderedHouseCount = 0;
    var curMeadowEra = "";

    function getPopForYear(yr) {
      if (yr <= censusData[0].year) {
        return { pop: censusData[0].pop, story: censusData[0].story };
      }
      for (var i = 0; i < censusData.length - 1; i++) {
        var a = censusData[i], b = censusData[i + 1];
        if (yr >= a.year && yr <= b.year) {
          var ratio = (yr - a.year) / (b.year - a.year);
          var pop = Math.round(a.pop + ratio * (b.pop - a.pop));
          var closest = (yr - a.year <= b.year - yr) ? a : b;
          return { pop: pop, story: closest.story };
        }
      }
      var last = censusData[censusData.length - 1];
      return { pop: last.pop, story: last.story };
    }

    function renderPopulation(yr) {
      if (!housesGrid) return;
      closeCapsuleMode();
      var info = getPopForYear(yr);
      var formattedPop = numFmt ? numFmt.format(info.pop) : info.pop.toLocaleString("el-GR");

     var isOfficialCensus = [1928, 1940, 1951, 1961, 1971, 1981, 1991, 2001, 2011, 2021].indexOf(yr) !== -1;
      if (yearVal) yearVal.textContent = "\uD83D\uDCC5 " + yr;
      if (popVal) popVal.textContent = (isOfficialCensus ? "" : "~") + formattedPop + " κάτοικοι";

      if (multVal) {
        var mult = info.pop / censusData[0].pop;
        if (yr <= 1924 || mult < 1.15) {
          multVal.textContent = "\uD83C\uDF31 Αφετηρία (\u00D71)";
        } else {
          var multStr = (Math.round(mult * 10) / 10).toFixed(1).replace(".0", "").replace(".", ",");
          multVal.textContent = "\uD83D\uDCC8 \u00D7" + multStr + " φορές μεγαλύτερο!";
        }
      }

      var buses = Math.max(3, Math.round(info.pop / 50));
      if (scaleVal) scaleVal.textContent = "\uD83D\uDE8C Όσο " + buses + " σχολικά λεωφορεία!";

      var newEra = (yr >= 2006) ? "2006" : (yr >= 1981 ? "1981" : (yr >= 1965 ? "1965" : "1924"));
      if (newEra !== curMeadowEra) {
        curMeadowEra = newEra;
        if (meadowSceneBox) meadowSceneBox.setAttribute("data-era", newEra);
        if (lmSchoolEl) {
          lmSchoolEl.setAttribute("data-sera", newEra);
          if (newEra === "1924") {
            lmSchoolEl.textContent = "\uD83E\uDDF1";
            lmSchoolEl.title = "1924\u20131964: Πλίνθινο & Πρώτο Σχολείο";
          } else if (newEra === "1965") {
            lmSchoolEl.textContent = "\uD83C\uDFDB\uFE0F";
            lmSchoolEl.title = "1965: Διώροφο Πέτρινο Διδακτήριο";
          } else if (newEra === "1981") {
            lmSchoolEl.textContent = "\uD83C\uDFEB";
            lmSchoolEl.title = "1981: Πέτρινο Σχολείο & Συστέγαση Γυμνασίου";
          } else {
            lmSchoolEl.textContent = "\uD83C\uDFEB";
            lmSchoolEl.title = "2006\u2013Σήμερα: Νέα Πτέρυγα (2006) & 12/θέσιο (από το 2012)!";
          }
        }
        if (lm1981El) lm1981El.style.display = (yr >= 1981) ? "inline-flex" : "none";
        if (lm2006El) lm2006El.style.display = (yr >= 2006) ? "inline-flex" : "none";

       if (eraNowEl) {
          var eraMapTxt = {
            "1924": "\uD83E\uDDF1 Εποχή 1924\u20131964: Πρώτο σχολείο, χωράφια & χωματόδρομοι",
            "1965": "\uD83C\uDFDB\uFE0F Εποχή 1965\u20131980: Διώροφο πέτρινο διδακτήριο!",
            "1981": "\u26BD Εποχή 1981\u20132005: Προστίθενται Γήπεδα (Α.Ε.Π.) & Γυμνάσιο!",
            "2006": "\uD83C\uDFEB\u2728 Εποχή 2006+: Νέα Πτέρυγα, Ολοήμερο & 12/θέσιο (από το 2012)!"
          };
          eraNowEl.textContent = eraMapTxt[newEra];
        }
        eraStepBtns.forEach(function(b) {
          var stepYr = Number(b.getAttribute("data-era-jump"));
          b.classList.toggle("is-reached", yr >= stepYr);
          b.classList.toggle("is-current", String(stepYr) === newEra);
        });
      }

      var targetHouses = Math.max(1, Math.ceil(info.pop / 150));

      if (renderedHouseCount < targetHouses) {
        var frag = document.createDocumentFragment();
        while (renderedHouseCount < targetHouses) {
          var span = document.createElement("span");
          span.className = "pexp-house-big pexp-dyn-house pexp-h-thrace";
          span.textContent = "\uD83C\uDFE0";
          frag.appendChild(span);
          renderedHouseCount++;
        }
        housesGrid.appendChild(frag);
      } else {
        while (renderedHouseCount > targetHouses) {
          var lastEl = housesGrid.lastElementChild;
          if (!lastEl || !lastEl.classList.contains("pexp-dyn-house")) break;
          housesGrid.removeChild(lastEl);
          renderedHouseCount--;
        }
      }

      var hIdx = 0;
      for (var k = 0; k < housesGrid.children.length; k++) {
        var hEl = housesGrid.children[k];
        if (!hEl.classList.contains("pexp-dyn-house")) continue;
        var cls = "pexp-h-thrace";
        var ic = "\uD83C\uDFE0";
        var ttl = "Σπίτι Θρακιωτών";
        if (yr >= 1947 && hIdx >= 5 && hIdx < 7) {
          cls = "pexp-h-vlach";
          ic = "\uD83C\uDFE1";
          ttl = "Σπίτι Σκοτεινιωτών & Βλάχων";
       } else if (yr >= 1965 && hIdx >= 7 && hIdx < 12) {
          cls = "pexp-h-pontic";
          ic = "\uD83C\uDFD8\uFE0F";
          ttl = "Σπίτι Ποντίων";
        }
        var fullCls = "pexp-house-big pexp-dyn-house " + cls;
        if (hEl.className !== fullCls) {
          hEl.className = fullCls;
          hEl.textContent = ic;
          hEl.title = ttl;
        }
        hIdx++;
      }

      if (rootVlach) rootVlach.classList.toggle("is-unlocked", yr >= 1947);
      if (rootPontic) rootPontic.classList.toggle("is-unlocked", yr >= 1965);
      if ((activeRootKey === "vlach" && yr < 1947) ||
          (activeRootKey === "pontic" && yr < 1965) ||
          (activeRootKey === "gym1981" && yr < 1981) ||
          (activeRootKey === "wing2006" && yr < 2006)) {
        closeRootBubble();
      }

   if (popStory && popStory.textContent !== info.story) popStory.textContent = info.story;
      popChips.forEach(function(ch) {
        ch.classList.toggle("is-active", Number(ch.getAttribute("data-year")) === yr);
      });
    }

    if (popSlider) {
      popSlider.addEventListener("input", function() {
        stopPopAutoplay();
        renderPopulation(Number(popSlider.value));
      });
    }
    popChips.forEach(function(ch) {
      ch.addEventListener("click", function() {
        stopPopAutoplay();
        var y = Number(ch.getAttribute("data-year"));
        if (popSlider) popSlider.value = y;
        renderPopulation(y);
      });
    });

   if (playBtn && popSlider) {
      playBtn.addEventListener("click", function() {
       if (popTimer) {
          stopPopAutoplay();
          return;
        }
        closeRootBubble();
        var cur = Number(popSlider.value);
        if (cur >= 2021) {
          cur = 1924;
          popSlider.value = cur;
          renderPopulation(cur);
        }
        playBtn.textContent = "\u23F8\uFE0F Παύση";
        popTimer = setInterval(function() {
          cur += 1;
          if (cur >= 2021) {
            cur = 2021;
            stopPopAutoplay();
          }
          popSlider.value = cur;
          renderPopulation(cur);
        }, 65);
      });
    }
 renderPopulation(1924);

  stepPopulationMilestone = function(dir) {
      stopPopAutoplay();
      closeRootBubble();
      resetCapsuleView();
      var curYr = popSlider ? Number(popSlider.value) : 1924;
      var targetYr = curYr;
      if (dir > 0) {
        targetYr = censusData[0].year;
        for (var i = 0; i < censusData.length; i++) {
          if (censusData[i].year > curYr) { targetYr = censusData[i].year; break; }
        }
      } else {
        targetYr = censusData[censusData.length - 1].year;
        for (var j = censusData.length - 1; j >= 0; j--) {
          if (censusData[j].year < curYr) { targetYr = censusData[j].year; break; }
        }
      }
      if (popSlider) popSlider.value = targetYr;
      renderPopulation(targetYr);
    }

    openPopulationAtYear = function(yr) {
      window.openPeristasiModal("population");
      stopPopAutoplay();
      if (popSlider) popSlider.value = yr;
      renderPopulation(yr);
    };

    /* Χρονοκάψουλα 2026 -> 2126 (100 Χρόνια Σχολείο) */
    var capsuleVisions = [
      { icon: "\uD83C\uDF33", title: "Ηλιακό & Καταπράσινο Σχολείο", desc: "Αίθουσες μέσα σε κήπους με δέντρα, λουλούδια και καθαρή ενέργεια από τον ήλιο!" },
      { icon: "\uD83E\uDD16", title: "Εργαστήριο Ρομποτικής & Αστρονομίας", desc: "Ρομπότ-βοηθοί στα πειράματα και τηλεσκόπιο που κοιτά τα αστέρια πάνω από τον Όλυμπο!" },
      { icon: "\uD83D\uDEB2", title: "Ποδηλατόδρομοι Βουνό\u2013Θάλασσα", desc: "Καταπράσινοι δρόμοι από την Περίσταση μέχρι την Παραλία και τον Ενιπέα!" },
      { icon: "\uD83C\uDFAD", title: "Ζωντανά Έθιμα & Χοροί το 2126", desc: "Θρακιώτικοι, ποντιακοί και βλάχικοι χοροί να αντηχούν στην αυλή μας και μετά από 200 χρόνια!" },
      { icon: "\uD83D\uDCDA", title: "Ολογραφική Παιδική Βιβλιοθήκη", desc: "Χιλιάδες βιβλία που ζωντανεύουν τρισδιάστατα την ιστορία μπροστά στα μάτια των παιδιών!" },
      { icon: "\uD83E\uDDA9", title: "Καταφύγιο Πελαργών & Φύσης", desc: "Φωλιές πουλιών, καθαρά νερά και προστασία κάθε ζώου στον κάμπο μας!" }
    ];

  var capsuleBtn = null;
    var capsuleBox = null;
    capsuleOpen = false;
    var capsulePicks = [];
    var capsuleSealed = false;

    try {
      var savedCaps = JSON.parse(localStorage.getItem("pexp_capsule_2126") || "null");
      if (Array.isArray(savedCaps) && savedCaps.length === 3) {
        capsulePicks = savedCaps;
        capsuleSealed = true;
      }
    } catch (e) {}

    var mirrorStoneBtn = null;
    mirrorModalBox = null;

    if (popChipsWrap && panes.population) {
      mirrorStoneBtn = document.createElement("button");
      mirrorStoneBtn.type = "button";
      mirrorStoneBtn.className = "pexp-year-stone pexp-mirror-stone";
      mirrorStoneBtn.textContent = "\uD83E\uDE9E 1926 vs 2026: Σχολική Μέρα";
      popChipsWrap.appendChild(mirrorStoneBtn);

      capsuleBtn = document.createElement("button");
      capsuleBtn.type = "button";
      capsuleBtn.className = "pexp-year-stone pexp-capsule-stone";
      capsuleBtn.textContent = "\uD83D\uDE80 2026\u20132126: Το Μέλλον μας";
      popChipsWrap.appendChild(capsuleBtn);

      mirrorModalBox = document.createElement("div");
      mirrorModalBox.style.display = "none";
      panes.population.appendChild(mirrorModalBox);

      capsuleBox = document.createElement("div");
      capsuleBox.className = "pexp-capsule-box";
      capsuleBox.style.display = "none";
      panes.population.appendChild(capsuleBox);

      closeCapsuleMode = function() {
        if (capsuleOpen) {
          capsuleOpen = false;
          if (capsuleBtn) capsuleBtn.classList.remove("is-active");
          if (capsuleBox) capsuleBox.style.display = "none";
        }
        if (mirrorOpen) {
          mirrorOpen = false;
          if (mirrorStoneBtn) mirrorStoneBtn.classList.remove("is-active");
          if (mirrorModalBox) {
            mirrorModalBox.style.display = "none";
            mirrorModalBox.innerHTML = "";
          }
        }
      };

      resetCapsuleView = function() {
        if (capsuleOpen || mirrorOpen) {
          renderPopulation(popSlider ? Number(popSlider.value) : 2021);
        }
      };

      openMirrorInModal = function() {
        if (mirrorOpen) {
          renderPopulation(1926);
          return;
        }
        stopPopAutoplay();
        closeRootBubble();
        if (popSlider) popSlider.value = 1926;
        renderPopulation(1926);

        mirrorOpen = true;
        popChips.forEach(function(ch) { ch.classList.remove("is-active"); });
        mirrorStoneBtn.classList.add("is-active");
        mirrorModalBox.style.display = "block";
        renderSchoolMirror(mirrorModalBox, function() {
          renderPopulation(1926);
        });
        requestAnimationFrame(function() {
          scrollInsideModal(mirrorModalBox);
        });
      };

      mirrorStoneBtn.addEventListener("click", openMirrorInModal);

      var drawCapsuleBox = function(hintMsg) {
        if (!capsuleBox) return;
        if (capsuleSealed && capsulePicks.length === 3) {
          var chosenHtml = capsulePicks.map(function(idx) {
            var v = capsuleVisions[idx];
            return v ? '<span class="pexp-root-pop-tag">' + v.icon + ' ' + v.title + '</span>' : '';
          }).join("");

          capsuleBox.innerHTML =
            '<div class="pexp-root-pop-top">' +
              '<span class="pexp-root-pop-title" style="color:#4338ca">\uD83D\uDCDC Χρονοκάψουλα 12/Θ Δημοτικού (2026 \u2192 2126)</span>' +
              '<button type="button" class="pexp-root-pop-close" data-caps-close="1" title="Κλείσιμο">\u2715</button>' +
            '</div>' +
            '<div class="pexp-caps-sealed">' +
              '<strong>\uD83C\uDF1F Η Χρονοκάψουλά σου Σφραγίστηκε!</strong>' +
              '<p style="margin:6px 0 8px;font-size:13px;line-height:1.45">Όταν το σχολείο μας κλείσει 200 χρόνια ζωής το 2126, τα παιδιά της Περίστασης θα βρουν μέσα τις 3 ευχές σου:</p>' +
              '<div class="pexp-root-pop-tags">' + chosenHtml + '</div>' +
              '<button type="button" class="pexp-root-pop-cta" data-caps-reset="1" style="background:#b45309;margin-top:10px">\uD83D\uDD04 Άλλαξε τις 3 Ευχές σου</button>' +
            '</div>';
          return;
        }

        var gridHtml = capsuleVisions.map(function(v, i) {
          var picked = capsulePicks.indexOf(i) !== -1;
          return '<button type="button" class="pexp-caps-item' + (picked ? ' is-picked' : '') + '" data-caps-idx="' + i + '">' +
            '<strong>' + v.icon + ' ' + v.title + (picked ? ' \u2705' : '') + '</strong>' +
            '<span>' + v.desc + '</span>' +
          '</button>';
        }).join("");

        var statusTxt = hintMsg || ("Επέλεξες " + capsulePicks.length + " από 3 όνειρα για το 2126");
        capsuleBox.innerHTML =
          '<div class="pexp-root-pop-top">' +
            '<span class="pexp-root-pop-title" style="color:#4338ca">\uD83D\uDE80 Χρονοκάψουλα Εκατονταετηρίδας (2026 \u2192 2126)</span>' +
            '<button type="button" class="pexp-root-pop-close" data-caps-close="1" title="Κλείσιμο">\u2715</button>' +
          '</div>' +
          '<div style="font-size:13px;color:#334155">Διάλεξε τα <strong>3 αγαπημένα σου όνειρα</strong> για το χωριό και το σχολείο μας σε 100 χρόνια από σήμερα:</div>' +
          '<div class="pexp-caps-grid">' + gridHtml + '</div>' +
          '<div class="pexp-caps-foot">' +
            '<span style="font-size:12.5px;font-weight:700;color:#4338ca">' + statusTxt + '</span>' +
            '<button type="button" class="pexp-caps-seal-btn" data-caps-seal="1"' + (capsulePicks.length === 3 ? '' : ' disabled') + '>\uD83D\uDD12 Σφράγισε τη Χρονοκάψουλα!</button>' +
          '</div>';
      };

      capsuleBtn.addEventListener("click", function() {
        if (capsuleOpen) {
          renderPopulation(2021);
          return;
        }
        stopPopAutoplay();
        closeRootBubble();
        if (popSlider) popSlider.value = 2021;
        renderPopulation(2021);

        capsuleOpen = true;
        popChips.forEach(function(ch) { ch.classList.remove("is-active"); });
        capsuleBtn.classList.add("is-active");

       if (yearVal) yearVal.textContent = "\uD83D\uDE80 2026 \u2192 2126";
        if (popVal) popVal.textContent = "100 Χρόνια Σχολείο!";
        if (multVal) multVal.textContent = "\uD83C\uDF1F 4 Γενιές Μαθητών!";
        if (scaleVal) scaleVal.textContent = "\u2728 Πλάθουμε τον επόμενο αιώνα!";
        if (popStory) {
          popStory.textContent = "1926\u20132026: Ένας αιώνας από την επίσημη ίδρυση του σχολείου μας! Τώρα η σκυτάλη περνάει σε εσάς: φτιάξε παρακάτω τη Χρονοκάψουλα της Περίστασης για τους μαθητές του 2126!";
        }

        capsuleBox.style.display = "block";
        drawCapsuleBox();
        requestAnimationFrame(function() {
          scrollInsideModal(capsuleBox);
        });
      });

      capsuleBox.addEventListener("click", function(e) {
        if (e.target.closest("[data-caps-close]")) {
          renderPopulation(2021);
          return;
        }
        if (e.target.closest("[data-caps-reset]")) {
          capsuleSealed = false;
          capsulePicks = [];
          try { localStorage.removeItem("pexp_capsule_2126"); } catch (err) {}
          drawCapsuleBox();
          return;
        }
        if (e.target.closest("[data-caps-seal]")) {
          if (capsulePicks.length === 3) {
            capsuleSealed = true;
            try { localStorage.setItem("pexp_capsule_2126", JSON.stringify(capsulePicks)); } catch (err) {}
            drawCapsuleBox();
          }
          return;
        }
        var itemBtn = e.target.closest("[data-caps-idx]");
        if (!itemBtn) return;
        var idx = Number(itemBtn.getAttribute("data-caps-idx"));
        var pos = capsulePicks.indexOf(idx);
        if (pos !== -1) {
          capsulePicks.splice(pos, 1);
          drawCapsuleBox();
        } else if (capsulePicks.length < 3) {
          capsulePicks.push(idx);
          drawCapsuleBox();
        } else {
          drawCapsuleBox("\uD83D\uDCA1 Έχεις ήδη 3 επιλογές! Πάτησε «Σφράγισε» ή ξε-επέλεξε μία.");
        }
      });
    }

 var rootsCatalog = {
      thrace: {
        title: "\uD83D\uDFE6 Ρίζες από την Ανατολική Θράκη (1922\u20131924)",
        accent: "#1d4ed8", border: "#93c5fd", bg: "#eff6ff",
        desc: "Οι πρόσφυγες προπαππούδες μας από την παλιά Περίσταση και τα Λούπιδα της Προποντίδας έφεραν το έθιμο της εικόνας του Αγίου Μόδεστου, τη θρακιώτικη γκάιντα, τον ζωηρό χορό «Ζωναράδικο» και τις νόστιμες θρακιώτικες πίτες!",
        photos: [
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi1JSEGe8aI6RfIJmm0ndGCeqlKRd4e6V_G8uyh2GHVv5fEh_v3Y9acuwAmAND-tnDGaec6zejzhFjppbwBYDcVUjE_5NeSLXKjE6b8v8n8uOggSh4N0c6zlAgGBlngsRW_ibwGX5Hlm-BTaccRC3sZqxehZ1oQKWK0A2q5J3muhflSXoqU9mfPNq0X0vk/s1600/2026-11-21%2017_23_00-NVIDIA%20GeForce%20Overlay.png", cap: "Χάρτης διαδρομής 1922\u20131924: Από την Περίσταση Θράκης στη Νέα Περίσταση" },
          { src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/%C5%9Eark%C3%B6yden_Marmara_Adas%C4%B1.jpg", cap: "Η ακτή της παλιάς Περίστασης στην Προποντίδα" },
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/20091212_Gkaintes_Didymoteixo_Evros_1.jpg?width=640", cap: "Παραδοσιακές Θρακιώτικες Γκάιντες" }
        ],
        tags: ["\uD83D\uDDBC\uFE0F Έθιμο Αγ. Μόδεστου", "\uD83D\uDC83 Χορός Ζωναράδικο", "\uD83E\uDD67 Θρακιώτικες Πίτες & Κουσκούσι"]
      },
     vlach: {
        minYear: 1947,
        title: "\uD83D\uDFE7 Σκοτεινά (Φωτεινά) Πιερίας & Βλάχοι (1947\u20131951)",
        accent: "#c2410c", border: "#fdba74", bg: "#fff7ed",
        desc: "Το 1947\u20131950 το χωριό μας φιλοξένησε τους εκτοπισμένους των Σκοτεινών (Φωτεινών), με τα παιδιά να κάνουν μάθημα στα «Αλώνια» \u2014 όπου ένα 12χρονο βοσκόπουλο είπε απ' έξω τη «Βαρκούλα του ψαρά» και μπήκε κατευθείαν στη Δ' τάξη! Αρκετές οικογένειες Σκοτεινιωτών και Βλάχων ρίζωσαν μόνιμα εδώ, φέρνοντας τα υφαντά και τους χορούς των Πιερίων!",
        photos: [
          { src: katina1947ImgUrl, cap: "Αρχείο 1947: Η δασκάλα Κατίνα Κουζώνη στην παλιά πόρτα του σχολείου μας" },
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC2oGO1eaGcRERDFqhGg82xAwsMzVqlYzgQIhutf_uSjWgQdTYqtIUcknhSlkrVktahq9IhiEg4Gw5Pp2K0GOv5NjRWmdo7ECxl1qdhyphenhyphenkEYz8ddnwxCB_PFWzecjSvh68eFEi_eAhuYYVv9-eFPW6RDDoyGTjOAnsksSXyVyvPV_iOmyNVldCllA2TVbM/s1600/Gemini_Generated_Image_bm97m7bm97m7bm97.jpg", cap: "Αναπαράσταση 1947: Το μάθημα στα «Αλώνια» & το καζάνι με το γάλα στον Πλάτανο" },
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stone_bridge_of_old_Morna.jpg?width=640", cap: "Το πέτρινο γεφύρι της παλιάς Μόρνας (Σκοτεινά/Φωτεινά Πιερίας)" }
        ],
        tags: ["\uD83C\uDF33 Υπαίθριο Μάθημα στα Αλώνια (1947)", "\u26F0\uFE0F Παράδοση Πιερίων", "\uD83E\uDDF6 Υφαντά & Κύκλιοι Χοροί"]
      },
     pontic: {
        minYear: 1965,
        title: "\uD83D\uDFE9 Ελληνισμός του Πόντου (1924, 1965 & 1990)",
        accent: "#047857", border: "#6ee7b7", bg: "#ecfdf5",
        desc: "Από τις πρώτες οικογένειες του 1924 έως τους Πόντιους συγχωριανούς μας από την πρώην Σοβιετική Ένωση (μετά το 1965 και το 1987\u20131996), ζωντάνεψαν τις γειτονιές με την ποντιακή λύρα (κεμεντζέ), τους χορούς «Τικ», «Κότσαρι» και «Σέρα» και τα νόστιμα πιροσκί και ωτία!",
        photos: [
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kemenches,Flute_and_Drum_from_Pontus_Benaki.jpg?width=640", cap: "Ποντιακές λύρες (κεμεντζέδες) & νταούλι (Μουσείο Μπενάκη)" },
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/2_Pontic_Female_Folk_Costumes_Benaki.jpg?width=640", cap: "Αυθεντικές Ποντιακές παραδοσιακές φορεσιές" }
        ],
        tags: ["\uD83C\uDFBB Ποντιακή Λύρα", "\uD83D\uDD25 Χοροί Σέρα & Κότσαρι", "\uD83E\uDD5F Πιροσκί, Ωτία & Σορβάς"]
      },
      church: {
        title: "\u26EA Ι.Ν. Αγίου Γεωργίου & Μοδέστου (από το 1924)",
        accent: "#4f46e5", border: "#a5b4fc", bg: "#eef2ff",
        desc: "Το πρώτο ιερό κτίσμα που έφτιαξαν οι πρόσφυγες μόλις έφτασαν εδώ, για να στεγάσουν τα 18 κιβώτια με τα ιερά κειμήλια της Προποντίδας!",
        photos: [
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpoIvD-uW-PJidxwFEyZqvdrRrE8_XY7mvNoHvKQQXl9w69-O04hyphenhyphenuOqUqNnul-f19sMorQDWZUL8nxfPoRaORl5RauIy-ak1pEjsFv0LCcLLIn4sPuA0BaFe1QofqCxXxGxijUqSO5HBOU7jxpO78M0U7MPs8kjoJ2BAplETfQMZBt55Jp1cNq7K_MwY/s1600/2026-06-28%2020_49_56-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png", cap: "Ιερός Ναός Αγ. Γεωργίου & Μοδέστου Περίστασης" }
        ],
        tags: ["\uD83D\uDCE6 Κειμήλια 1922", "\uD83D\uDD14 Καρδιά της Ενορίας"],
        ctaTab: "churches",
        ctaText: "\u26EA Δες την Καρτέλα των Εκκλησιών \u279C"
      },
      school: {
        title: "\uD83C\uDFEB 100 Χρόνια Δημοτικό Σχολείο (1926\u20132026)",
        accent: "#0284c7", border: "#7dd3fc", bg: "#f0f9ff",
        desc: "Από το πρώτο πλίνθινο διδακτήριο του 1924 (2 αίθουσες) και το επίσημο σχολείο 3 αιθουσών του 1926, στους δασκάλους μας όπως η Κατίνα Κουζώνη και ο Κώστας Μοσχίδης («και τα γράμματα είναι δουλειά!»), στο πέτρινο κτίριο του 1965 και στο σημερινό 12/θέσιο!",
        photos: [
          { src: katina1947ImgUrl, cap: "1947: Η δασκάλα Κατίνα Κουζώνη στην παλιά πόρτα του πρώτου σχολείου (1926\u20131963)" },
          { src: oldSchoolImgUrl, cap: "1965: Το διώροφο πέτρινο διδακτήριο του σχολείου μας" },
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png", cap: "Σήμερα: Το σύγχρονο 12/θέσιο Δημοτικό Σχολείο μας" }
        ],
       tags: ["\uD83C\uDF82 100 Χρόνια Παιδείας", "\uD83D\uDCD6 4 Γενιές Μαθητών", "\u26FA Πρόσκοποι & Μεγάλος Πλάτανος"]
      },
      gym1981: {
        minYear: 1981,
        title: "\u26BD\uD83D\uDCDA 1981: Γυμνάσιο & Αθλητισμός στην Περίσταση",
        accent: "#059669", border: "#6ee7b7", bg: "#ecfdf5",
        desc: "Από το 1981 το σχολείο μας φιλοξενεί το νεοϊδρυθέν Γυμνάσιο Περίστασης (έως το 1994 που απέκτησε το δικό του κτίριο), ενώ οι γειτονιές αποκτούν γήπεδα και η Α.Ε. Περίστασης (από το 1978) ενώνει όλο το χωριό!",
        photos: [
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhem0YTAbyft3JVlU9TGnM6JTH0vezjswsuumIS0CJ5ssqZX_MiEAfYjwSzz0qjazangq56oBm_zsEiQoODZwDz4FJmiCq-AAxI4srFAveSfug5HhXoLi421BUJcYAeJf7Np-Mc2Irjp6t0TqaZn4yp2H0Rt9L6CfaTZS00Fd8VUEXaVw8I0dD-rQxq9PA/s1964/2026-11-20%2022_55_31-NVIDIA%20GeForce%20Overlay.png", cap: "Το Γήπεδο της Α.Ε. Περίστασης" }
        ],
        tags: ["\uD83D\uDCDA Ίδρυση Γυμνασίου (1981)", "\u26BD Ένωση Α.Ε.Π. (1978)", "\uD83C\uDFC0 Αθλητικές Αυλές"]
      },
     wing2006: {
        minYear: 2006,
        title: "\uD83D\uDDA5\uFE0F\u2728 2005\u20132012: Νέα Πτέρυγα & Προαγωγή σε 12/θέσιο",
        accent: "#d97706", border: "#fcd34d", bg: "#fffbeb",
        desc: "Με τη νέα πτέρυγα του 2005\u20132006 (και το Τμήμα Ένταξης από το 2004) το 10/θέσιο τότε σχολείο μας αποκτά εργαστήριο υπολογιστών, βιβλιοθήκη, ολοήμερο και αίθουσα εκδηλώσεων, και το 2012 προάγεται σε 12/θέσιο!",
        photos: [
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png", cap: "Το σύγχρονο 12/θέσιο Δημοτικό Σχολείο Περίστασης" }
        ],
        tags: ["\uD83D\uDDA5\uFE0F Εργαστήριο Η/Υ & Ρομποτική", "\uD83E\uDD1D Τμήμα Ένταξης (2004)", "\uD83C\uDFEB 12/θέσιο Ολοήμερο (2012)"]
      }
    };

    var meadowScene = panes.population ? panes.population.querySelector(".pexp-meadow-scene") : null;
    var rootsBar = panes.population ? panes.population.querySelector(".pexp-roots-bar") : null;
    var rootThrace = document.getElementById("pexpRootThrace");
    var rootBubble = null;

    if (rootsBar && meadowScene) {
      var rHint = document.createElement("div");
      rHint.className = "pexp-roots-hint";
      rHint.textContent = "\uD83D\uDC46 Πάτησε πάνω σε ένα σπιτάκι ή στις ρίζες για να δεις έθιμα & παραδόσεις!";
      meadowScene.insertBefore(rHint, rootsBar);

      rootBubble = document.createElement("div");
      rootBubble.style.display = "none";
      meadowScene.appendChild(rootBubble);

      [rootThrace, rootVlach, rootPontic].forEach(function(el) {
        if (el) { el.setAttribute("role", "button"); el.tabIndex = 0; }
      });

      closeRootBubble = function() {
        activeRootKey = "";
        if (rootBubble) { rootBubble.style.display = "none"; rootBubble.innerHTML = ""; }
        [rootThrace, rootVlach, rootPontic].forEach(function(el) {
          if (el) el.classList.remove("is-selected");
        });
      };

      var openRootBubble = function(key, toggleIfSame) {
        var data = rootsCatalog[key];
        if (!data || !rootBubble) return;
        if (toggleIfSame && activeRootKey === key) {
          closeRootBubble();
          return;
        }
       stopPopAutoplay();
        resetCapsuleView();
        if (data.minYear && popSlider && Number(popSlider.value) < data.minYear) {
          popSlider.value = data.minYear;
          renderPopulation(data.minYear);
        }
        activeRootKey = key;
        if (rootThrace) rootThrace.classList.toggle("is-selected", key === "thrace");
        if (rootVlach) rootVlach.classList.toggle("is-selected", key === "vlach");
        if (rootPontic) rootPontic.classList.toggle("is-selected", key === "pontic");

        var tagsHtml = data.tags.map(function(t) {
          return '<span class="pexp-root-pop-tag">' + t + '</span>';
        }).join("");
        var ctaHtml = data.ctaTab
          ? '<button type="button" class="pexp-root-pop-cta" data-goto-tab="' + data.ctaTab + '">' + data.ctaText + '</button>'
          : '';

        rootBubble.className = "pexp-root-pop";
        rootBubble.style.setProperty("--r-accent", data.accent);
        rootBubble.style.setProperty("--r-border", data.border);
        rootBubble.style.setProperty("--r-bg", data.bg);
        rootBubble.style.display = "block";
      var galleryHtml = "";
        if (data.photos && data.photos.length) {
          galleryHtml = '<div class="pexp-root-gallery">' + data.photos.map(function(ph, pIdx) {
            return '<figure class="pexp-root-fig" data-root-photo="' + pIdx + '">' +
              '<img src="' + optImg(ph.src, 320) + '" data-full-src="' + escAttr(ph.src) + '" alt="' + escAttr(ph.cap) + '" loading="lazy"/>' +
              '<span>\uD83D\uDD0D ' + ph.cap + '</span>' +
            '</figure>';
          }).join("") + '</div>';
        }

        rootBubble.innerHTML =
          '<div class="pexp-root-pop-top">' +
            '<span class="pexp-root-pop-title">' + data.title + '</span>' +
            '<button type="button" class="pexp-root-pop-close" data-close-root="1" title="Κλείσιμο">\u2715</button>' +
          '</div>' +
          '<div class="pexp-root-pop-desc">' + data.desc + '</div>' +
          galleryHtml +
          '<div class="pexp-root-pop-tags">' + tagsHtml + '</div>' +
          ctaHtml;

        rootBubble.querySelectorAll("img").forEach(function(im) {
          im.onerror = handleImgFallback;
        });
        requestAnimationFrame(function() {
          if (modalBody && rootBubble.getBoundingClientRect().bottom > modalBody.getBoundingClientRect().bottom) {
            scrollInsideModal(rootBubble);
          }
        });
      };
      triggerRootBubble = openRootBubble;

      var detectRootTarget = function(target) {
        if (target.closest("#pexpRootThrace")) return { key: "thrace", badge: true };
        if (target.closest("#pexpRootVlach")) return { key: "vlach", badge: true };
        if (target.closest("#pexpRootPontic")) return { key: "pontic", badge: true };
        if (target.closest(".pexp-h-thrace")) return { key: "thrace", badge: false };
        if (target.closest(".pexp-h-vlach")) return { key: "vlach", badge: false };
        if (target.closest(".pexp-h-pontic")) return { key: "pontic", badge: false };
       var lm = target.closest(".pexp-house-landmark");
        if (lm) {
          var lmKey = lm.getAttribute("data-lm");
          if (lmKey) return { key: lmKey, badge: true };
          var isChurch = lm.textContent.indexOf("\u26EA") !== -1;
          return { key: isChurch ? "church" : "school", badge: true };
        }
        return null;
      };

      meadowScene.addEventListener("click", function(e) {
        var eraJumpBtn = e.target.closest("[data-era-jump]");
        if (eraJumpBtn) {
          stopPopAutoplay();
          var jYr = Number(eraJumpBtn.getAttribute("data-era-jump"));
          if (popSlider) popSlider.value = jYr;
          renderPopulation(jYr);
          return;
        }
        if (e.target.closest("[data-close-root]")) { closeRootBubble(); return; }
       var rFig = e.target.closest("[data-root-photo]");
        if (rFig && activeRootKey && rootsCatalog[activeRootKey] && rootsCatalog[activeRootKey].photos) {
          var rPhotos = rootsCatalog[activeRootKey].photos.map(function(p) {
            return { src: p.src, thumb: optImg(p.src, 320), caption: p.cap };
          });
          openZoomWithList(rPhotos, Number(rFig.getAttribute("data-root-photo")));
          return;
        }
        var gotoBtn = e.target.closest("[data-goto-tab]");
        if (gotoBtn) { activateTab(gotoBtn.getAttribute("data-goto-tab")); return; }
        var hit = detectRootTarget(e.target);
        if (hit) openRootBubble(hit.key, hit.badge || activeRootKey === hit.key);
      });

      meadowScene.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          var hit = detectRootTarget(e.target);
          if (hit) {
            e.preventDefault();
            openRootBubble(hit.key, true);
          }
        }
      });
    }

 /* ================= 2. ΤΟ ΤΑΞΙΔΙ ΤΟΥ 1922 & ΣΗΜΕΡΙΝΕΣ ΑΠΟΣΤΑΣΕΙΣ ================= */
    subBtns = document.querySelectorAll("#pexpRouteSubSwitch .pexp-subswitch-btn");
    subJourney = document.getElementById("pexpSubJourney");
    subToday = document.getElementById("pexpSubToday");

    var subTodayReady = false;
    var ensureCompassImg = function() {};

    subBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        stopRouteAutoplay();
        stopCartGame();
        var target = btn.getAttribute("data-sub");
        subBtns.forEach(function(b) { b.classList.toggle("is-active", b === btn); });
        if (subJourney) subJourney.style.display = (target === "journey") ? "block" : "none";
        if (subToday) subToday.style.display = (target === "today") ? "block" : "none";
       if (target === "journey" && !routeReady) renderStop(0);
        if (target === "today" && !subTodayReady) {
          subTodayReady = true;
          ensureCompassImg();
        }
      });
    });

    routePhotos = [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/%C5%9Eark%C3%B6yden_Marmara_Adas%C4%B1.jpg",
        alt: "1. Η ακτή της παλιάς Περίστασης (Σάρκιοϊ) στην Προποντίδα"
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/Evros_river.jpg?width=800",
        alt: "2. Ο ποταμός Έβρος: το πέρασμα των ~300 ανδρών με τα κάρα και τα ζώα στη Δυτική Θράκη"
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/20160513_026_kavala.jpg?width=800",
        alt: "3. Δρόμος Θράκης & Καβάλας (κάρα) και Αιγαίο Πέλαγος (τα ατμόπλοια «Ωραία Ελλάς» & «Αθήναι»)"
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/8/88/Greek_mother_%26_child_waiting_in_camp_at_Salonica_for_continuation_of_journey_from_the_Caucasus_to_Thrace_LCCN2001705752.jpg",
        alt: "4. Μητέρα με παιδί σε προσφυγικό καταυλισμό της Θεσσαλονίκης (1922\u20131923)"
      },
      {
        src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        alt: "5. Η σημερινή Περίσταση Πιερίας και το 12/Θ Δημοτικό Σχολείο μας"
      }
    ];

    var routeStops = [
      {
        cx: 567, cy: 128, photoIdx: 0,
        badge: "Σταθμός 1 από 5 \u2022 20 Οκτ. 1922",
        title: "1. Η Παλιά Περίσταση στην Προποντίδα",
        path: "M 567,128",
        story: "Μια ζωντανή κωμόπολη ~9.000 κατοίκων δίπλα στην Προποντίδα, με αμπέλια, καράβια και σπουδαία σχολεία! Στις 20 Οκτωβρίου 1922 οι προπαππούδες μας αναγκάστηκαν να αφήσουν τα σπίτια τους."
      },
      {
        cx: 482, cy: 81, photoIdx: 1,
        badge: "Σταθμός 2 από 5 \u2022 ~100 χλμ.",
        title: "2. Περνώντας τον Ποταμό Έβρο",
        path: "M 567,128 L 482,81",
        story: "Περίπου 300 άνδρες ξεκίνησαν από τη στεριά για να σώσουν τα ζώα και τα κάρα των οικογενειών, περνώντας με κόπο τον μεγάλο ποταμό Έβρο."
      },
      {
        cx: 278, cy: 78, photoIdx: 2,
        badge: "Σταθμός 3 από 5 \u2022 ~300 χλμ.",
        title: "3. Δρόμος Καβάλας & Ατμόπλοια στο Αιγαίο",
        path: "M 567,128 L 482,81 L 278,78",
        story: "Ενώ τα κάρα διέσχιζαν τη Θράκη και την Καβάλα, τα γυναικόπαιδα ταξίδευαν απευθείας στο Αιγαίο με τα ατμόπλοια «Ωραία Ελλάς» και «Αθήναι», φυλάγοντας σαν κόρη οφθαλμού 18 κιβώτια με ιερά κειμήλια!"
      },
     {
        cx: 121, cy: 124, photoIdx: 3,
        badge: "Σταθμός 4 από 5 \u2022 ~435 χλμ.",
        title: "4. Αντάμωμα στη Θεσσαλονίκη (22 Οκτ. 1922)",
        path: "M 567,128 L 482,81 L 278,78 L 121,124",
        story: "Στις 22 Οκτωβρίου 1922 έφτασαν τα πλοία στη Θεσσαλονίκη και αργότερα αντάμωσαν με τη φάλαγγα των κάρων! Από εκεί, 130 οικογένειες ξεκίνησαν νότια για τον κάμπο της Κατερίνης."
      },
      {
        cx: 78, cy: 180, photoIdx: 4,
        badge: "Σταθμός 5 από 5 \u2022 ~500 χλμ. συνολικά",
        title: "5. Νέα Περίσταση Πιερίας: Το Νέο μας Σπίτι!",
        path: "M 567,128 L 482,81 L 278,78 L 121,124 L 78,180",
        story: "Το 1923\u20131924 ρίζωσαν στη θέση «Λημέρι» (μαζί με Θρακιώτες από τα Λούπιδα)! Έχτισαν τον Αη-Γιώργη και το σχολείο μας και έδωσαν στο χωριό το όνομα της αγαπημένης τους πατρίδας: Περίσταση!"
      }
    ];

  var brokenRouteSvg = document.getElementById("pexpRouteSvg");
    if (brokenRouteSvg && brokenRouteSvg.parentNode) {
      var tmpRouteWrap = document.createElement("div");
      tmpRouteWrap.innerHTML =
        '<svg id="pexpRouteSvg" viewBox="0 0 660 250" style="width:100%;height:auto;display:block" shape-rendering="geometricPrecision" role="img" aria-label="Χάρτης διαδρομής από την Περίσταση Προποντίδας στην Περίσταση Πιερίας">' +
          '<rect width="660" height="250" fill="#dff0ff"></rect>' +
          '<path d="M 0,0 L 660,0 L 660,65 L 610,73 L 590,110 L 567,128 L 519,161 L 467,214 L 460,204 L 520,135 L 458,127 L 454,106 L 434,92 L 357,76 L 321,87 L 278,78 L 218,102 L 239,153 L 269,202 L 232,164 L 215,173 L 232,230 L 200,182 L 164,184 L 168,228 L 143,176 L 118,148 L 121,124 L 100,133 L 82,150 L 84,181 L 80,207 L 95,245 L 0,250 Z" fill="#ecfdf5" stroke="#86efac" stroke-width="2"></path>' +
          '<path d="M 468,232 L 492,199 L 533,161 L 587,158 L 660,164 L 660,250 L 455,250 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"></path>' +
          '<ellipse cx="303" cy="118" rx="11" ry="8" fill="#ecfdf5" stroke="#86efac"></ellipse>' +
          '<ellipse cx="403" cy="153" rx="9" ry="6" fill="#ecfdf5" stroke="#86efac"></ellipse>' +
          '<ellipse cx="621" cy="132" rx="12" ry="6" fill="#ecfdf5" stroke="#86efac"></ellipse>' +
          '<text x="562" y="150" fill="#1d4ed8" font-size="10.5" font-weight="800">Προποντίδα</text>' +
          '<text x="305" y="210" fill="#1d4ed8" font-size="11.5" font-weight="800">Αιγαίο Πέλαγος</text>' +
         '<path id="pexpSeaPath" d="M 567,128 Q 515,175 460,218 Q 340,246 240,236 Q 130,224 102,165 L 121,124" fill="none" stroke="#60a5fa" stroke-width="3.6" stroke-dasharray="7,5"></path>' +
          '<path id="pexpSeaActive" d="M 567,128 Q 515,175 460,218 Q 340,246 240,236 Q 130,224 102,165 L 121,124" fill="none" stroke="#1e6cff" stroke-width="4" stroke-linecap="round"></path>' +
          '<path id="pexpLandBg" d="M 567,128 L 482,81 L 278,78 L 121,124 L 78,180" fill="none" stroke="#f59e0b" stroke-opacity="0.48" stroke-width="4.5" stroke-dasharray="8,5" stroke-linecap="round"></path>' +
          '<path id="pexpLandActive" d="M 567,128" fill="none" stroke="#f59e0b" stroke-width="5.5" stroke-linecap="round"></path>' +
          '<circle id="pexpActiveRing" class="pexp-pulse-ring" cx="567" cy="128" r="18" fill="none" stroke="#dc2626" stroke-width="3"></circle>' +
         '<g class="pexp-pin" data-stop="0" transform="translate(567,128)">' +
            '<circle r="26" fill="transparent"></circle>' +
            '<circle r="12" fill="#dc2626" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="900">1</text>' +
            '<text x="-8" y="-16" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="900">Παλιά Περίσταση</text>' +
          '</g>' +
          '<g class="pexp-pin" data-stop="1" transform="translate(482,81)">' +
            '<circle r="26" fill="transparent"></circle>' +
            '<circle r="11" fill="#f59e0b" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text y="4" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">2</text>' +
            '<text x="-6" y="-15" text-anchor="middle" fill="#1e293b" font-size="10.5" font-weight="800">Ποταμός Έβρος</text>' +
          '</g>' +
          '<g class="pexp-pin" data-stop="2" transform="translate(278,78)">' +
            '<circle r="26" fill="transparent"></circle>' +
            '<circle r="11" fill="#f59e0b" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text y="4" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">3</text>' +
            '<text x="0" y="-15" text-anchor="middle" fill="#1e293b" font-size="10.5" font-weight="800">Θράκη &amp; Καβάλα</text>' +
          '</g>' +
          '<g class="pexp-pin" data-stop="3" transform="translate(121,124)">' +
            '<circle r="26" fill="transparent"></circle>' +
            '<circle r="11" fill="#1e6cff" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text y="4" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">4</text>' +
            '<text x="28" y="-14" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="900">Θεσσαλονίκη</text>' +
          '</g>' +
          '<g class="pexp-pin" data-stop="4" transform="translate(78,180)">' +
            '<circle r="26" fill="transparent"></circle>' +
            '<circle r="12" fill="#10b981" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="900">5</text>' +
            '<text x="8" y="25" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="900">Νέα Περίσταση!</text>' +
          '</g>' +
          '<g id="pexpReunionBadge" style="display:none;pointer-events:none" transform="translate(121,90)">' +
            '<rect x="-46" y="-10" width="92" height="19" rx="9.5" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.8"></rect>' +
            '<text y="3" text-anchor="middle" fill="#92400e" font-size="9.8" font-weight="900">\uD83E\uDD1D Αντάμωμα!</text>' +
          '</g>' +
          '<g id="pexpBoatToken" style="pointer-events:none" transform="translate(108,138)">' +
            '<circle r="11.5" fill="#eff6ff" stroke="#1e6cff" stroke-width="2.2"></circle>' +
            '<text y="4.5" text-anchor="middle" font-size="12.5">\u26F5</text>' +
          '</g>' +
          '<g id="pexpCartToken" style="pointer-events:none" transform="translate(62,169)">' +
            '<circle r="11.5" fill="#fffbeb" stroke="#d97706" stroke-width="2.2"></circle>' +
            '<text y="4.5" text-anchor="middle" font-size="12.5">\uD83D\uDC34</text>' +
          '</g>' +
        '</svg>';
      if (tmpRouteWrap.firstElementChild) {
        brokenRouteSvg.parentNode.replaceChild(tmpRouteWrap.firstElementChild, brokenRouteSvg);
      }
    }

  currentStopIdx = 0;
    var curRouteMode = "both";
    var landActive = document.getElementById("pexpLandActive");
    var landBg = document.getElementById("pexpLandBg");
    var seaPath = document.getElementById("pexpSeaPath");
    var seaActive = document.getElementById("pexpSeaActive");
    var boatToken = document.getElementById("pexpBoatToken");
    var cartToken = document.getElementById("pexpCartToken");
    var reunionBadge = document.getElementById("pexpReunionBadge");
    var activeRing = document.getElementById("pexpActiveRing");
    var mainRouteImg = document.getElementById("pexpRouteMainImg");
    var routeThumbStrip = document.getElementById("pexpRouteThumbs");
    var thumbBtns = [];
    function ensureRouteThumbs() {
      if (thumbBtns.length || !routeThumbStrip || routePhotos.length !== 5) return;
      routeThumbStrip.innerHTML = routePhotos.map(function(ph, i) {
        return '<button type="button" class="pexp-thumb-btn' + (i === currentStopIdx ? ' is-active' : '') + '" data-photo="' + i + '" title="' + escAttr(ph.alt) + '">' +
        '</button>';
      }).join("");
      routeThumbStrip.querySelectorAll("img").forEach(function(im) {
        im.onerror = handleImgFallback;
      });
      thumbBtns = routeThumbStrip.querySelectorAll(".pexp-thumb-btn");
      thumbBtns.forEach(function(b) {
        b.addEventListener("click", function() {
          setRoutePhoto(Number(b.getAttribute("data-photo")));
        });
      });
    }
    var stopBadge = document.getElementById("pexpStopBadge");
    var stopTitle = document.getElementById("pexpRouteStopTitle");
    var routeStory = document.getElementById("pexpRouteStory");
    var routePins = document.querySelectorAll("#pexpRouteSvg .pexp-pin");
    var routeModes = document.querySelectorAll("#pexpRouteModes .pexp-mini-pill");

    function setRoutePhoto(pIdx) {
      ensureRouteThumbs();
      var ph = routePhotos[pIdx] || routePhotos[0];
      if (mainRouteImg) {
        mainRouteImg.setAttribute("data-full-src", ph.src);
        mainRouteImg.src = optImg(ph.src, 640);
        mainRouteImg.alt = ph.alt;
      }
      thumbBtns.forEach(function(b, i) {
        b.classList.toggle("is-active", i === pIdx);
      });
      var nextPh = routePhotos[(pIdx + 1) % routePhotos.length];
      if (nextPh) preloadImg(optImg(nextPh.src, 640));
    }

    var cachedSeaLen = 0;
    function getSeaTotalLen() {
      if (!cachedSeaLen && seaActive && seaActive.getTotalLength) {
        try { cachedSeaLen = seaActive.getTotalLength(); } catch (e) {}
      }
      return cachedSeaLen || 542;
    }

    function quadPt(p0, p1, p2, t) {
      var mt = 1 - t;
      return {
        x: mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
        y: mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]
      };
    }

    function getSeaPoint(u) {
      var cl = Math.max(0, Math.min(1, u));
      if (cl <= 0.29) return quadPt([567, 128], [515, 175], [460, 218], cl / 0.29);
      if (cl <= 0.74) return quadPt([460, 218], [340, 246], [240, 236], (cl - 0.29) / 0.45);
      if (cl <= 0.94) return quadPt([240, 236], [130, 224], [102, 165], (cl - 0.74) / 0.20);
      var lt = (cl - 0.94) / 0.06;
      return { x: 102 + lt * (121 - 102), y: 165 + lt * (124 - 165) };
    }

    function getLandPointAndPath(sFloat) {
      var s = Math.max(0, Math.min(4, sFloat));
      var idx = Math.min(3, Math.floor(s));
      var frac = s - idx;
      var a = routeStops[idx], b = routeStops[idx + 1];
      var cx = a.cx + frac * (b.cx - a.cx);
      var cy = a.cy + frac * (b.cy - a.cy);
      var d = "M " + routeStops[0].cx + "," + routeStops[0].cy;
      for (var i = 1; i <= idx; i++) {
        d += " L " + routeStops[i].cx + "," + routeStops[i].cy;
      }
      if (frac > 0.001) {
        d += " L " + cx.toFixed(1) + "," + cy.toFixed(1);
      }
      return { x: cx, y: cy, d: d };
    }

    function syncRouteTokens(sFloat, seaU, showReunion) {
      var lp = getLandPointAndPath(sFloat);
      if (landActive) landActive.setAttribute("d", lp.d);

      if (seaActive) {
        var sLen = getSeaTotalLen();
        seaActive.style.strokeDasharray = sLen + " " + sLen;
        seaActive.style.strokeDashoffset = String(Math.max(0, sLen * (1 - seaU)));
      }

      if (cartToken) {
        var kx = lp.x, ky = lp.y - 14;
        if (sFloat <= 0.02) { kx = 553; ky = 120; }
        else if (Math.abs(sFloat - 3) < 0.03) { kx = 105; ky = 113; }
        else if (sFloat >= 3.98) { kx = 62; ky = 169; }
        cartToken.setAttribute("transform", "translate(" + kx.toFixed(1) + "," + ky.toFixed(1) + ")");
      }

      if (boatToken) {
        var sp = getSeaPoint(seaU);
        var bx = sp.x, by = sp.y;
        if (seaU <= 0.02) { bx = 577; by = 140; }
        else if (seaU >= 0.98) { bx = 108; by = 139; }
        boatToken.setAttribute("transform", "translate(" + bx.toFixed(1) + "," + by.toFixed(1) + ")");
        boatToken.style.opacity = (sFloat > 3.1) ? "0.85" : "1";
      }

      if (reunionBadge) {
        reunionBadge.style.display = (showReunion && curRouteMode === "both") ? "" : "none";
      }
    }

    var seaProgressByStop = [0, 0.32, 0.68, 1, 1];

  renderStop = function(idx) {
      routeReady = true;
      currentStopIdx = (idx + routeStops.length) % routeStops.length;
      var st = routeStops[currentStopIdx];

      syncRouteTokens(currentStopIdx, seaProgressByStop[currentStopIdx], currentStopIdx === 3);

      if (activeRing) {
        activeRing.setAttribute("cx", st.cx);
        activeRing.setAttribute("cy", st.cy);
      }
      if (stopBadge) stopBadge.textContent = st.badge;
      if (stopTitle) stopTitle.textContent = st.title;
      if (routeStory) routeStory.textContent = st.story;
      setRoutePhoto(st.photoIdx);
     routePins.forEach(function(p, i) {
        p.style.opacity = i <= currentStopIdx ? "1" : "0.8";
      });
    }

    routePins.forEach(function(pin) {
      pin.setAttribute("role", "button");
      pin.setAttribute("tabindex", "0");
      pin.addEventListener("click", function() {
        stopRouteAutoplay();
        renderStop(Number(pin.getAttribute("data-stop")));
      });
      pin.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          stopRouteAutoplay();
          renderStop(Number(pin.getAttribute("data-stop")));
        }
      });
    });
    on("pexpPrevStop", "click", function() {
      stopRouteAutoplay();
      renderStop(currentStopIdx - 1);
    });
    on("pexpNextStop", "click", function() {
      stopRouteAutoplay();
      renderStop(currentStopIdx + 1);
    });

    var routePlayBtn = document.getElementById("pexpPlayRouteBtn");
    if (!routePlayBtn && stopBadge && stopBadge.parentNode) {
      var topRow = document.createElement("div");
      topRow.className = "pexp-stop-toprow";
      stopBadge.parentNode.insertBefore(topRow, stopBadge);
      topRow.appendChild(stopBadge);

      routePlayBtn = document.createElement("button");
      routePlayBtn.type = "button";
      routePlayBtn.id = "pexpPlayRouteBtn";
      routePlayBtn.className = "pexp-route-play-btn";
      routePlayBtn.textContent = "\u25B6\uFE0F Παίξε το Ταξίδι!";
      topRow.appendChild(routePlayBtn);
    }

    var routeRafId = null;
    var routeHoldTimer = null;
    var isJourneyPlaying = false;
    var pausedLegStop = -1;
    var pausedLegFrac = 0;

    var baseRenderStop = renderStop;
    renderStop = function(idx) {
      pausedLegStop = -1;
      pausedLegFrac = 0;
      baseRenderStop(idx);
    };

    cancelRouteAnim = function() {
      isJourneyPlaying = false;
      if (routeRafId) { cancelAnimationFrame(routeRafId); routeRafId = null; }
      if (routeHoldTimer) { clearTimeout(routeHoldTimer); routeHoldTimer = null; }
    };

    if (routePlayBtn) {
      routePlayBtn.addEventListener("click", function() {
        if (isJourneyPlaying || routeTimer) {
          stopRouteAutoplay();
          return;
        }
        if (curRouteMode !== "both" && routeModes.length) {
          routeModes[0].click();
        }
        if (currentStopIdx >= routeStops.length - 1) {
          renderStop(0);
        }
        isJourneyPlaying = true;
        routePlayBtn.textContent = "\u23F8\uFE0F Παύση";
        routePlayBtn.classList.add("is-playing");

        var legDurations = [1750, 1950, 2000, 1650];
        var runLeg = function(fromStop, resumeFrac) {
          if (!isJourneyPlaying || !modal.classList.contains("is-open") || (subJourney && subJourney.style.display === "none")) {
            stopRouteAutoplay();
            return;
          }
          var toStop = fromStop + 1;
          if (toStop >= routeStops.length) {
            stopRouteAutoplay();
            return;
          }
          var dur = legDurations[fromStop] || 1800;
          var seaFrom = seaProgressByStop[fromStop];
          var seaTo = seaProgressByStop[toStop];
          var startFrac = (typeof resumeFrac === "number" && resumeFrac > 0 && resumeFrac < 1) ? resumeFrac : 0;
          var t0 = performance.now() - startFrac * dur;

          var stepFrame = function(now) {
            if (!isJourneyPlaying) return;
            var p = Math.min(1, (now - t0) / dur);
            pausedLegStop = fromStop;
            pausedLegFrac = p;
            var ease = 0.5 - 0.5 * Math.cos(Math.PI * p);
            var curS = fromStop + ease;
            var curSea = seaFrom + ease * (seaTo - seaFrom);
            syncRouteTokens(curS, curSea, false);

            var lp = getLandPointAndPath(curS);
            if (activeRing) {
              activeRing.setAttribute("cx", lp.x.toFixed(1));
              activeRing.setAttribute("cy", lp.y.toFixed(1));
            }

            if (p < 1) {
              routeRafId = requestAnimationFrame(stepFrame);
            } else {
              routeRafId = null;
              renderStop(toStop);
              if (toStop >= routeStops.length - 1) {
                stopRouteAutoplay();
              } else {
                var pauseMs = (toStop === 3) ? 1350 : 850;
                routeHoldTimer = setTimeout(function() { runLeg(toStop, 0); }, pauseMs);
              }
            }
          };

          routeRafId = requestAnimationFrame(stepFrame);
        };

        if (pausedLegStop === currentStopIdx && pausedLegFrac > 0 && pausedLegFrac < 1) {
          runLeg(currentStopIdx, pausedLegFrac);
        } else {
          routeHoldTimer = setTimeout(function() { runLeg(currentStopIdx, 0); }, 350);
        }
      });
    }

   bindSwipe(
      subJourney || panes.route,
      function() { stopRouteAutoplay(); renderStop(currentStopIdx + 1, false); },
      function() { stopRouteAutoplay(); renderStop(currentStopIdx - 1, false); }
    );

    if (subJourney) {
      var cartBarWrap = document.createElement("div");
      cartBarWrap.className = "pexp-game-bar";
      var cartTrigBtn = document.createElement("button");
      cartTrigBtn.type = "button";
      cartTrigBtn.className = "pexp-game-trigger pexp-game-trigger--amber";
      cartTrigBtn.textContent = "\uD83D\uDEDE Δοκιμασία: Ετοίμασε το Κάρο του 1922!";
      cartBarWrap.appendChild(cartTrigBtn);

      var cartGameStage = document.createElement("div");
      cartGameStage.style.display = "none";
      subJourney.appendChild(cartBarWrap);
      subJourney.appendChild(cartGameStage);

      var cartChallengeCfg = {
        title: "\uD83D\uDEDE Ετοίμασε το Κάρο του 1922",
        subtitle: "Χωράνε μόνο <strong>3 πράγματα</strong> για το μεγάλο ταξίδι στην Πιερία. Ποια 3 έπαιρναν μαζί τους οι πρόσφυγες;",
        accent: "#b45309", border: "#fcd34d", bg: "#fffbeb",
        winText: "\uD83C\uDF1F Συγκινητικό! Με πίστη (εικονίσματα), ζεστασιά (κουβέρτες) και ελπίδα για το αύριο (σπόρους), οι προπαππούδες μας ρίζωσαν στη Νέα Περίσταση!",
        items: [
          { icon: "\uD83D\uDDBC\uFE0F", name: "Ιερά Εικονίσματα", ok: true, why: "Τα εικονίσματα και τα κειμήλια ήταν η ψυχή και η παρηγοριά κάθε οικογένειας στο ταξίδι!" },
          { icon: "\uD83E\uDDF6", name: "Μάλλινες Κουβέρτες", ok: true, why: "Ο Οκτώβριος του 1922 ήταν κρύος και οι οικογένειες κοιμόντουσαν στην ύπαιθρο δίπλα στα κάρα!" },
          { icon: "\uD83C\uDF3E", name: "Σπόροι για Σπορά", ok: true, why: "Φύλαγαν σπόρους σιταριού για να σπείρουν τα πρώτα τους χωράφια στη νέα πατρίδα!" },
          { icon: "\uD83D\uDCFA", name: "Τηλεόραση", ok: false, why: "Το 1922 δεν υπήρχαν ακόμα τηλεοράσεις ούτε ηλεκτρικό ρεύμα στα χωριά!" },
          { icon: "\uD83C\uDFAE", name: "Κονσόλα Παιχνιδιών", ok: false, why: "Τότε τα παιδιά έπαιζαν στην αλάνα με βόλους, τόπι και πάνινες κούκλες!" },
          { icon: "\uD83C\uDFD6\uFE0F", name: "Φουσκωτό Θαλάσσης", ok: false, why: "Στο κάρο έμπαιναν μόνο όσα κρατούσαν ζωντανή την οικογένεια στον δύσκολο δρόμο της προσφυγιάς." }
        ],
      onClose: function() {
          cartGameStage.style.display = "none";
          cartGameStage.innerHTML = "";
          cartTrigBtn.classList.remove("is-active");
        }
      };

     stopCartGame = cartChallengeCfg.onClose;
      openCartGameInModal = function() {
        if (cartGameStage.style.display !== "block") {
          cartTrigBtn.classList.add("is-active");
          cartGameStage.style.display = "block";
          renderPackChallenge(cartGameStage, cartChallengeCfg);
        }
        requestAnimationFrame(function() {
          scrollInsideModal(cartGameStage);
        });
      };

      cartTrigBtn.addEventListener("click", function() {
        if (cartGameStage.style.display === "block") {
          cartChallengeCfg.onClose();
          return;
        }
        cartTrigBtn.classList.add("is-active");
        cartGameStage.style.display = "block";
        renderPackChallenge(cartGameStage, cartChallengeCfg);
        requestAnimationFrame(function() {
          scrollInsideModal(cartGameStage);
        });
      });
    }

   routeModes.forEach(function(btn) {
      btn.addEventListener("click", function() {
        routeModes.forEach(function(b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var m = btn.getAttribute("data-mode") || "both";
        curRouteMode = m;
        var showSea = (m !== "land");
        var showLand = (m !== "sea");
        if (seaPath) seaPath.style.display = showSea ? "block" : "none";
        if (seaActive) seaActive.style.display = showSea ? "block" : "none";
        if (boatToken) boatToken.style.display = showSea ? "block" : "none";
        if (landBg) landBg.style.display = showLand ? "block" : "none";
        if (landActive) landActive.style.display = showLand ? "block" : "none";
        if (cartToken) cartToken.style.display = showLand ? "block" : "none";
        if (reunionBadge) reunionBadge.style.display = (m === "both" && currentStopIdx === 3) ? "" : "none";
      });
    });

   /* Σημερινές Αποστάσεις, Πυξίδα της Αυλής μας & Κάρο του 1922 */
    var localDests = {
      katerini: {
        dir: "W",
        walk: "36 λεπτά", walkPct: 80,
        bike: "10 λεπτά", bikePct: 22,
        car:  "5 λεπτά",  carPct: 11,
        cart: "~45 λεπτά", cartPct: 100,
        note: "Στον παλιό χωματόδρομο, το βοϊδόκαρο χρειαζόταν 9 φορές περισσότερο χρόνο από το σημερινό αυτοκίνητο!"
      },
      paralia: {
        dir: "E",
        walk: "1 ώρα",    walkPct: 80,
        bike: "16 λεπτά", bikePct: 21,
        car:  "7 λεπτά",  carPct: 9,
        cart: "~1 ώρα & 15 λεπτά", cartPct: 100,
        note: "Ανάμεσα από χωράφια και αμμόλοφους μέχρι τη θάλασσα του Θερμαϊκού!"
      },
      olympus: {
        dir: "SW",
        walk: "2 μέρες ορειβασία", walkPct: 100,
        bike: "1 ώρα (έως Λιτόχωρο)", bikePct: 24,
        car:  "25 λεπτά (έως Λιτόχωρο)", carPct: 10,
        cart: "~6 ώρες (έως Λιτόχωρο)", cartPct: 72,
        note: "Ολόκληρο πρωινό ταξίδι στις πλαγιές του Ολύμπου για ξύλα και εμπόριο!"
      },
     thess: {
        dir: "NE",
        walk: "14 ώρες",  walkPct: 65,
        bike: "3,5 ώρες", bikePct: 22,
        car:  "50 λεπτά", carPct: 6,
        cart: "2 μέρες (με διανυκτέρευση)", cartPct: 100,
        note: "Έτσι ακριβώς κατέβηκαν το 1923\u20131924 οι πρόσφυγες προπαππούδες μας από τη Θεσσαλονίκη στην Περίσταση!"
      }
    };

    var compassPoints = {
      N: {
        angle: 0, dest: null,
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/%CE%91%CE%B5%CF%81%CE%BF%CF%86%CF%89%CF%84%CE%BF%CE%B3%CF%81%CE%B1%CF%86%CE%AF%CE%B1_%CE%9A%CE%BF%CF%81%CE%B9%CE%BD%CE%BF%CF%8D.jpg?width=750",
        cap: "Βόρεια: Ο Κορινός Πιερίας από ψηλά (προς Κίτρος & Πύδνα)",
        badge: "\uD83E\uDDED Κατεύθυνση: ΒΟΡΡΑΣ (Β)",
        title: "\u2B06\uFE0F Βόρεια (Β) \u2022 Κορινός & Κίτρος",
        desc: "Η κόκκινη μύτη της πυξίδας κοιτάζει πάντα τον Βορρά! Αν σταθείς στην αυλή του σχολείου μας και κοιτάξεις Βόρεια, βρίσκονται ο Κορινός, το Κίτρος και η Αρχαία Πύδνα."
      },
      NE: {
        angle: 45, dest: "thess",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/White_Tower_of_Thessaloniki.jpg?width=750",
        cap: "Βορειοανατολικά: Ο Λευκός Πύργος στη Θεσσαλονίκη",
        badge: "\uD83E\uDDED Κατεύθυνση: ΒΟΡΕΙΟΑΝΑΤΟΛΙΚΑ (ΒΑ)",
        title: "\uD83D\uDDFC Βορειοανατολικά (ΒΑ) \u279C Θεσσαλονίκη (68 χλμ)",
        desc: "Ανάμεσα στον Βορρά (Β) και την Ανατολή (Α), ακολουθώντας την ακτή του Θερμαϊκού προς τα πάνω, βρίσκεται η Θεσσαλονίκη!"
      },
      E: {
        angle: 90, dest: "paralia",
        img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Beach_Paralia_Katerini_-_panoramio.jpg",
        cap: "Ανατολικά: Η Παραλία Κατερίνης στον Θερμαϊκό Κόλπο",
        badge: "\uD83E\uDDED Κατεύθυνση: ΑΝΑΤΟΛΗ (Α)",
        title: "\uD83C\uDF0A Ανατολικά (Α) \u279C Παραλία & Θερμαϊκός (5 χλμ)",
        desc: "Κοιτάζοντας Ανατολικά από την αυλή μας (5 χλμ.) βρίσκεται η θάλασσα της Παραλίας και η Καλλιθέα! Από εκεί ανατέλλει κάθε πρωί ο ήλιος μέσα από τον Θερμαϊκό Κόλπο!"
      },
      S: {
        angle: 180, dest: null,
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Platamon_Castle_01.jpg?width=750",
        cap: "Νότια: Το Κάστρο του Πλαταμώνα στη Νότια Πιερία",
        badge: "\uD83E\uDDED Κατεύθυνση: ΝΟΤΟΣ (Ν)",
        title: "\u2600\uFE0F Νότια (Ν) \u2022 Κάμπος Πιερίας & Πλαταμώνας",
        desc: "Απέναντι ακριβώς από τον Βορρά βρίσκεται ο Νότος! Κάθε μεσημέρι ο ήλιος λάμπει ψηλά στον Νότο, πάνω από τον κάμπο της Πιερίας και το Κάστρο του Πλαταμώνα."
      },
      SW: {
        angle: 225, dest: "olympus",
        img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mount_Olympus_from_Litochoro.jpg",
        cap: "Νοτιοδυτικά: Ο Όλυμπος & το Λιτόχωρο",
        badge: "\uD83E\uDDED Κατεύθυνση: ΝΟΤΙΟΔΥΤΙΚΑ (ΝΔ)",
        title: "\uD83C\uDFD4\uFE0F Νοτιοδυτικά (ΝΔ) \u279C Όλυμπος (24 χλμ)",
        desc: "Ανάμεσα στον Νότο (Ν) και τη Δύση (Δ) υψώνεται περήφανος ο Όλυμπος με τον Μύτικα (2.918 μ.) και το Λιτόχωρο στους πρόποδές του!"
      },
      W: {
        angle: 270, dest: "katerini",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/202505_Parko_Evangelikon_Katerini.jpg?width=750",
        cap: "Δυτικά: Καταπράσινο πάρκο στην πόλη της Κατερίνης",
        badge: "\uD83E\uDDED Κατεύθυνση: ΔΥΣΗ (Δ)",
        title: "\uD83C\uDFD9\uFE0F Δυτικά (Δ) \u279C Κατερίνη (3 χλμ)",
        desc: "Στην αντίθετη πλευρά από τη θάλασσα, μόλις 3 χλμ. Δυτικά από το σχολείο μας, βρίσκεται η πόλη της Κατερίνης και πίσω της τα Πιέρια Όρη, όπου δύει (βασιλεύει) ο ήλιος!"
      }
    };

    var wEl = document.getElementById("pexpTimeWalk");
    var bEl = document.getElementById("pexpTimeBike");
    var cEl = document.getElementById("pexpTimeCar");
    var destGridEl = document.getElementById("pexpDestBtns");
    var destBtns = document.querySelectorAll("#pexpDestBtns .pexp-dest-btn");
    var destKeys = ["katerini", "paralia", "olympus", "thess"];
    var curDestIdx = 0;

    var compassNeedleEl = null;
    var compassBadgeEl = null;
    var compassTitleEl = null;
    var compassDescEl = null;
    var compassImgEl = null;
    var compassCapEl = null;
    var compassChips = [];
    var compassSvgPts = [];
    var curNeedleAngle = 270;
    var curCompassKey = "W";

    if (subToday && destGridEl) {
      var compCard = document.createElement("div");
      compCard.className = "pexp-compass-card";
      compCard.innerHTML =
        '<div class="pexp-compass-svg-col">' +
          '<svg class="pexp-compass-svg" viewBox="0 0 240 240" role="img" aria-label="Διαδραστική Πυξίδα Σχολείου Περίστασης">' +
            '<circle cx="120" cy="120" r="112" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2.5"/>' +
            '<circle cx="120" cy="120" r="88" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5" stroke-dasharray="4,4"/>' +
            '<line x1="120" y1="36" x2="120" y2="204" stroke="#e2e8f0" stroke-width="1.5"/>' +
            '<line x1="36" y1="120" x2="204" y2="120" stroke="#e2e8f0" stroke-width="1.5"/>' +
            '<line x1="62" y1="62" x2="178" y2="178" stroke="#f1f5f9" stroke-width="1.5"/>' +
            '<line x1="178" y1="62" x2="62" y2="178" stroke="#f1f5f9" stroke-width="1.5"/>' +
            '<g transform="translate(120,120)">' +
              '<g class="pexp-needle-spin" id="pexpCompassNeedle" style="transform:rotate(270deg)">' +
                '<polygon points="0,-62 10,0 -10,0" fill="#ef4444"/>' +
                '<polygon points="0,56 10,0 -10,0" fill="#94a3b8"/>' +
              '</g>' +
            '</g>' +
            '<circle cx="120" cy="120" r="20" fill="#eff6ff" stroke="#1e6cff" stroke-width="2.5"/>' +
            '<text x="120" y="126" text-anchor="middle" font-size="16">\uD83C\uDFEB</text>' +
       '<g class="pexp-comp-pt" data-cdir="N">' +
              '<circle cx="120" cy="24" r="24" fill="transparent"/>' +
              '<circle cx="120" cy="24" r="17" fill="#dc2626" stroke="#fff" stroke-width="2"/>' +
              '<text x="120" y="29" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Β</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="S">' +
              '<circle cx="120" cy="216" r="24" fill="transparent"/>' +
              '<circle cx="120" cy="216" r="17" fill="#0f766e" stroke="#fff" stroke-width="2"/>' +
              '<text x="120" y="221" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Ν</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="E">' +
              '<circle cx="216" cy="120" r="24" fill="transparent"/>' +
              '<circle cx="216" cy="120" r="18" fill="#0284c7" stroke="#fff" stroke-width="2"/>' +
              '<text x="216" y="125" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Α</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="W">' +
              '<circle cx="24" cy="120" r="24" fill="transparent"/>' +
              '<circle cx="24" cy="120" r="18" fill="#d97706" stroke="#fff" stroke-width="2"/>' +
              '<text x="24" y="125" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Δ</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="NE">' +
              '<circle cx="187" cy="53" r="23" fill="transparent"/>' +
              '<circle cx="187" cy="53" r="15" fill="#4f46e5" stroke="#fff" stroke-width="2"/>' +
              '<text x="187" y="57" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">ΒΑ</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="SW">' +
              '<circle cx="53" cy="187" r="23" fill="transparent"/>' +
              '<circle cx="53" cy="187" r="15" fill="#7c3aed" stroke="#fff" stroke-width="2"/>' +
              '<text x="53" y="191" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">ΝΔ</text>' +
            '</g>' +
          '</svg>' +
        '</div>' +
        '<div class="pexp-compass-info">' +
          '<span class="pexp-compass-badge" id="pexpCompBadge"></span>' +
          '<h4 class="pexp-compass-title" id="pexpCompTitle"></h4>' +
          '<p class="pexp-compass-desc" id="pexpCompDesc"></p>' +
          '<div class="pexp-compass-btns">' +
            '<button type="button" class="pexp-comp-chip" data-cdir="W">Δ \u2022 Κατερίνη \uD83C\uDFD9\uFE0F</button>' +
            '<button type="button" class="pexp-comp-chip" data-cdir="E">Α \u2022 Παραλία \uD83C\uDF0A</button>' +
            '<button type="button" class="pexp-comp-chip" data-cdir="SW">ΝΔ \u2022 Όλυμπος \uD83C\uDFD4\uFE0F</button>' +
            '<button type="button" class="pexp-comp-chip" data-cdir="NE">ΒΑ \u2022 Θεσσαλονίκη \uD83D\uDDFC</button>' +
            '<button type="button" class="pexp-comp-chip" data-cdir="N">Β \u2022 Κορινός & Κίτρος</button>' +
            '<button type="button" class="pexp-comp-chip" data-cdir="S">Ν \u2022 Πλαταμώνας</button>' +
          '</div>' +
        '</div>' +
      '<div class="pexp-comp-media">' +
          '<img class="pexp-comp-photo" id="pexpCompImg" src="' + blankGif + '" alt="" loading="lazy"/>' +
          '<div class="pexp-comp-cap" id="pexpCompCap"></div>' +
        '</div>';

      destGridEl.parentNode.insertBefore(compCard, destGridEl);
      compassNeedleEl = document.getElementById("pexpCompassNeedle");
      compassBadgeEl = document.getElementById("pexpCompBadge");
      compassTitleEl = document.getElementById("pexpCompTitle");
      compassDescEl = document.getElementById("pexpCompDesc");
      compassImgEl = document.getElementById("pexpCompImg");
      compassCapEl = document.getElementById("pexpCompCap");
      compassChips = compCard.querySelectorAll(".pexp-comp-chip");
      compassSvgPts = compCard.querySelectorAll(".pexp-comp-pt");

     if (compassImgEl) {
        compassImgEl.onerror = handleImgFallback;
      }

      compCard.addEventListener("click", function(e) {
        if (e.target.closest("#pexpCompImg")) {
          var orderKeys = ["W", "E", "SW", "NE", "N", "S"];
          var cList = orderKeys.map(function(k) {
            return { src: compassPoints[k].img, thumb: optImg(compassPoints[k].img, 640), caption: compassPoints[k].cap };
          });
          var sIdx = orderKeys.indexOf(curCompassKey);
          openZoomWithList(cList, sIdx !== -1 ? sIdx : 0);
          return;
        }
        var hit = e.target.closest("[data-cdir]");
        if (!hit) return;
        setCompassDirection(hit.getAttribute("data-cdir"), false);
      });
    }

   setCompassDirection = function(dirKey, fromDestSelect) {
      curCompassKey = compassPoints[dirKey] ? dirKey : "W";
      var pt = compassPoints[curCompassKey];
      var delta = ((pt.angle - (curNeedleAngle % 360)) + 540) % 360 - 180;
      curNeedleAngle += delta;

      if (compassNeedleEl) {
        compassNeedleEl.style.transform = "rotate(" + curNeedleAngle + "deg)";
      }
      if (compassBadgeEl) compassBadgeEl.textContent = pt.badge;
      if (compassTitleEl) compassTitleEl.textContent = pt.title;
      if (compassDescEl) compassDescEl.textContent = pt.desc;
   ensureCompassImg = function() {
        var curPt = compassPoints[curCompassKey];
        if (compassImgEl && curPt && curPt.img) {
          compassImgEl.setAttribute("data-full-src", curPt.img);
          compassImgEl.src = optImg(curPt.img, 640);
          compassImgEl.alt = curPt.cap;
        }
      };
      if (subTodayReady) ensureCompassImg();
      if (compassCapEl) compassCapEl.textContent = "\uD83D\uDD0D " + pt.cap;

      compassChips.forEach(function(ch) {
        ch.classList.toggle("is-active", ch.getAttribute("data-cdir") === dirKey);
      });
      compassSvgPts.forEach(function(g) {
        g.style.opacity = (g.getAttribute("data-cdir") === dirKey) ? "1" : "0.78";
      });

      if (!fromDestSelect && pt.dest) {
        selectDestination(pt.dest, true);
      }
    }

   function attachSpeedBar(el, cls, runnerEmoji) {
      if (!el || !el.parentNode) return null;
      var track = document.createElement("span");
      track.className = "pexp-speed-track";
      var fill = document.createElement("span");
      fill.className = "pexp-speed-fill " + cls;
      var runner = document.createElement("span");
      runner.className = "pexp-race-runner";
      runner.textContent = runnerEmoji || "\u2022";
      var flag = document.createElement("span");
      flag.className = "pexp-race-flag";
      flag.textContent = "\uD83C\uDFC1";
      track.appendChild(fill);
      track.appendChild(runner);
      track.appendChild(flag);
      el.insertAdjacentElement("afterend", track);

      var badge = document.createElement("span");
      badge.className = "pexp-race-badge";
      track.insertAdjacentElement("afterend", badge);
      return { fill: fill, runner: runner, flag: flag, badge: badge, card: el.closest(".pexp-vehicle-card") };
    }

    var vehiclesGrid = wEl ? wEl.closest(".pexp-vehicles-grid") : null;
    var cartTimeEl = document.getElementById("pexpTimeCart1922");
    if (vehiclesGrid && !cartTimeEl) {
      var cartCard = document.createElement("div");
      cartCard.className = "pexp-vehicle-card pexp-vehicle-card--1922";
      cartCard.innerHTML =
        '<span class="pexp-vehicle-emoji">\uD83D\uDC34</span>' +
        '<span class="pexp-vehicle-lbl">Κάρο του 1922</span>' +
        '<span class="pexp-vehicle-val" id="pexpTimeCart1922"></span>';
      vehiclesGrid.appendChild(cartCard);
      cartTimeEl = document.getElementById("pexpTimeCart1922");
    }

    var raceBtnEl = null;
    var raceMsgEl = null;
    if (vehiclesGrid && vehiclesGrid.parentNode && !document.getElementById("pexpRaceBar")) {
      var rBar = document.createElement("div");
      rBar.id = "pexpRaceBar";
      rBar.className = "pexp-race-bar";
      rBar.innerHTML =
        '<button type="button" class="pexp-race-btn" id="pexpRaceBtn">\uD83C\uDFC1 Δες τα να ξεκινούν μαζί!</button>' +
        '<span class="pexp-race-msg" id="pexpRaceMsg">\uD83D\uDEA6 Πάτησε τη σημαία για να δεις πόσο γρήγορα φτάνει το αυτοκίνητο ενώ το κάρο του 1922 μόλις ξεκινά!</span>';
      vehiclesGrid.parentNode.insertBefore(rBar, vehiclesGrid);
      raceBtnEl = document.getElementById("pexpRaceBtn");
      raceMsgEl = document.getElementById("pexpRaceMsg");
    }

    var wTrack = attachSpeedBar(wEl, "pexp-fill-walk", "\uD83D\uDEB6");
    var bTrack = attachSpeedBar(bEl, "pexp-fill-bike", "\uD83D\uDEB2");
    var cTrack = attachSpeedBar(cEl, "pexp-fill-car", "\uD83D\uDE97");
    var cartTrack = attachSpeedBar(cartTimeEl, "pexp-fill-cart", "\uD83D\uDC34");
    var allTracks = [wTrack, bTrack, cTrack, cartTrack];
    var cartNoteEl = subToday ? subToday.querySelector(".pexp-kid-story-text") : null;

    var raceSpecs = {
      katerini: {
        warpAt: 99999,
        car:  { real: 750,  fin: 750,  done: "\uD83E\uDD47 1ο! Έφτασε (5')" },
        bike: { real: 1500, fin: 1500, done: "\uD83E\uDD48 2ο! Έφτασε (10')" },
        walk: { real: 5400, fin: 5400, done: "\uD83E\uDD49 3ο! Έφτασε (36')" },
        cart: { real: 6750, fin: 6750, done: "\uD83C\uDFC1 4ο! Έφτασε (~45')" },
        carHitMsg: "\uD83E\uDD47 Το αυτοκίνητο έφτασε κιόλας στην Κατερίνη (5'), ενώ το κάρο του 1922 είναι μόλις στο 11% (~330 μ.)!",
        endMsg: "\uD83C\uDFC1 Τερμάτισαν όλα! Το αυτοκίνητο έφτασε 9 φορές πιο γρήγορα από το βοϊδόκαρο του 1922!"
      },
      paralia: {
        warpAt: 99999,
        car:  { real: 665,  fin: 665,  done: "\uD83E\uDD47 1ο! Στη θάλασσα (7')" },
        bike: { real: 1520, fin: 1520, done: "\uD83E\uDD48 2ο! Έφτασε (16')" },
        walk: { real: 5700, fin: 5700, done: "\uD83E\uDD49 3ο! Έφτασε (1 ώρα)" },
        cart: { real: 7125, fin: 7125, done: "\uD83C\uDFC1 4ο! Έφτασε (1ώ 15')" },
        carHitMsg: "\uD83E\uDD47 Το αυτοκίνητο έφτασε κιόλας στην Παραλία (7'), ενώ το κάρο του 1922 μόλις βγήκε στα χωράφια (9%)!",
        endMsg: "\uD83C\uDFC1 Μετά από 1 ώρα & 15' έφτασε και το κάρο — πάνω από 10 φορές πιο αργά από σήμερα!"
      },
      olympus: {
        warpAt: 2000,
        warpMsg: "\u23E9 Επιτάχυνση χρόνου: περνούν ώρες στις πλαγιές του Ολύμπου...",
        car:  { real: 700,   fin: 700,  done: "\uD83E\uDD47 1ο! Λιτόχωρο (25')" },
        bike: { real: 1680,  fin: 1680, done: "\uD83E\uDD48 2ο! Λιτόχωρο (1 ώρα)" },
        cart: { real: 10080, fin: 5200, done: "\uD83E\uDD49 3ο! Μετά από ~6 ώρες!" },
        walk: { real: 40000, fin: 7000, done: "\uD83C\uDFD4\uFE0F Κορυφή (2 μέρες)!" },
        carHitMsg: "\uD83E\uDD47 Το αυτοκίνητο έφτασε στο Λιτόχωρο (25'), ενώ το κάρο του 1922 έχει κάνει μόλις το 7% του δρόμου!",
        endMsg: "\uD83C\uDFC1 25 λεπτά με αυτοκίνητο έως τους πρόποδες, έναντι 6 ολόκληρων ωρών με το κάρο του 1922!"
      },
      thess: {
        warpAt: 3100,
        warpMsg: "\u23E9 Επιτάχυνση χρόνου: περνούν μερόνυχτα στον δρόμο της προσφυγιάς...",
        car:  { real: 700,   fin: 700,  done: "\uD83E\uDD47 1ο! Θεσσαλονίκη (50')" },
        bike: { real: 2940,  fin: 2940, done: "\uD83E\uDD48 2ο! Έφτασε (3,5 ώρες)" },
        walk: { real: 11760, fin: 5400, done: "\uD83E\uDD49 3ο! Έφτασε (14 ώρες)" },
        cart: { real: 40320, fin: 7200, done: "\uD83C\uDFC1 4ο! Μετά από 2 μέρες!" },
        carHitMsg: "\uD83E\uDD47 Το αυτοκίνητο έφτασε στον Λευκό Πύργο (50'), ενώ το κάρο του 1922 δεν έφτασε ούτε στον Κορινό (2%)!",
        endMsg: "\uD83C\uDFC1 Μετά από 2 μέρες έφτασε και το κάρο του 1922 — σκέψου τον κόπο των προπαππούδων μας!"
      }
    };

    var raceRafId = null;

    function calcRacePct(elapsed, specItem, warpAt) {
      if (elapsed >= specItem.fin) return 100;
      if (specItem.fin <= warpAt || elapsed <= warpAt) {
        return Math.min(100, (elapsed / specItem.real) * 100);
      }
      var pctAtWarp = (warpAt / specItem.real) * 100;
      var u = Math.min(1, (elapsed - warpAt) / (specItem.fin - warpAt));
      var uSmooth = u * (0.4 + 0.6 * u);
      return Math.min(100, pctAtWarp + uSmooth * (100 - pctAtWarp));
    }

    function applyStaticBars(d) {
      if (wTrack) wTrack.fill.style.width = d.walkPct + "%";
      if (bTrack) bTrack.fill.style.width = d.bikePct + "%";
      if (cTrack) cTrack.fill.style.width = d.carPct + "%";
      if (cartTrack) cartTrack.fill.style.width = d.cartPct + "%";
    }

    stopSpeedRace = function(restoreDefault) {
      if (raceRafId) {
        cancelAnimationFrame(raceRafId);
        raceRafId = null;
      }
      if (raceBtnEl) {
        raceBtnEl.classList.remove("is-running");
        raceBtnEl.textContent = "\uD83C\uDFC1 Δες τα να ξεκινούν μαζί!";
      }
      allTracks.forEach(function(tr) {
        if (!tr) return;
        tr.fill.classList.remove("is-racing");
        tr.runner.classList.remove("is-vis");
        if (restoreDefault) {
          if (tr.flag) tr.flag.classList.remove("is-vis");
          tr.badge.textContent = "";
          if (tr.card) tr.card.classList.remove("is-finished");
        }
      });
      if (restoreDefault) {
        if (raceMsgEl) {
          raceMsgEl.textContent = "\uD83D\uDEA6 Πάτησε τη σημαία για να δεις πόσο γρήγορα φτάνει το αυτοκίνητο ενώ το κάρο του 1922 μόλις ξεκινά!";
        }
        var curD = localDests[destKeys[curDestIdx]];
        if (curD) applyStaticBars(curD);
      }
    };

    if (raceBtnEl) {
      raceBtnEl.addEventListener("click", function() {
        if (raceRafId) {
          stopSpeedRace(true);
          return;
        }
        var key = destKeys[curDestIdx] || "katerini";
        var sp = raceSpecs[key] || raceSpecs.katerini;
        var entries = [
          { tr: wTrack, cfg: sp.walk },
          { tr: bTrack, cfg: sp.bike },
          { tr: cTrack, cfg: sp.car },
          { tr: cartTrack, cfg: sp.cart }
        ];

       entries.forEach(function(en) {
          if (!en.tr) return;
          en.tr.fill.classList.add("is-racing");
          en.tr.fill.style.width = "0%";
          en.tr.runner.style.left = "0%";
          en.tr.runner.classList.add("is-vis");
          if (en.tr.flag) en.tr.flag.classList.add("is-vis");
          en.tr.badge.textContent = "0%";
          if (en.tr.card) en.tr.card.classList.remove("is-finished");
        });

        raceBtnEl.classList.add("is-running");
        raceBtnEl.textContent = "\u23F9\uFE0F Επαναφορά";
        if (raceMsgEl) raceMsgEl.textContent = "\uD83D\uDEA6 Ξεκίνησαν όλα ταυτόχρονα από την αυλή του 12/Θ Δημοτικού!";

        var maxFin = Math.max(sp.car.fin, sp.bike.fin, sp.walk.fin, sp.cart.fin);
        var announcedCar = false;
        var announcedWarp = false;
        var tStart = performance.now();

        var tickRace = function(now) {
          if (!modal.classList.contains("is-open")) {
            stopSpeedRace(true);
            return;
          }
          var elapsed = now - tStart;

          entries.forEach(function(en) {
            if (!en.tr) return;
            var pct = calcRacePct(elapsed, en.cfg, sp.warpAt);
            en.tr.fill.style.width = pct.toFixed(1) + "%";
            en.tr.runner.style.left = pct.toFixed(1) + "%";
            if (pct >= 100) {
              en.tr.badge.textContent = en.cfg.done;
              if (en.tr.card) en.tr.card.classList.add("is-finished");
            } else {
              en.tr.badge.textContent = Math.max(1, Math.round(pct)) + "% της διαδρομής";
            }
          });

          if (!announcedCar && elapsed >= sp.car.fin) {
            announcedCar = true;
            if (raceMsgEl) raceMsgEl.textContent = sp.carHitMsg;
          } else if (sp.warpMsg && !announcedWarp && elapsed >= sp.warpAt + 250) {
            announcedWarp = true;
            if (raceMsgEl) raceMsgEl.textContent = sp.warpMsg;
          }

          if (elapsed < maxFin) {
            raceRafId = requestAnimationFrame(tickRace);
          } else {
            raceRafId = null;
            if (raceMsgEl) raceMsgEl.textContent = sp.endMsg;
            if (raceBtnEl) {
              raceBtnEl.classList.remove("is-running");
              raceBtnEl.textContent = "\uD83C\uDFC1 Ξεκίνα πάλι μαζί!";
            }
          }
        };

        raceRafId = requestAnimationFrame(tickRace);
      });
    }

   selectDestination = function(key, fromCompass) {
      stopSpeedRace(true);
      var idx = destKeys.indexOf(key);
      curDestIdx = idx !== -1 ? idx : 0;
      var d = localDests[destKeys[curDestIdx]];

      if (wEl) wEl.textContent = d.walk;
      if (bEl) bEl.textContent = d.bike;
      if (cEl) cEl.textContent = d.car;
      if (cartTimeEl) cartTimeEl.textContent = d.cart;
      if (cartNoteEl) cartNoteEl.textContent = d.note;
      applyStaticBars(d);

      destBtns.forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-dest") === destKeys[curDestIdx]);
      });

      if (!fromCompass && d.dir) {
        setCompassDirection(d.dir, true);
      }
    }

    selectDestByStep = function(step) {
      var next = (curDestIdx + step + destKeys.length) % destKeys.length;
      selectDestination(destKeys[next], false);
    };

    destBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        selectDestination(btn.getAttribute("data-dest"), false);
      });
    });

    bindSwipe(
      subToday,
      function() { selectDestByStep(1); },
      function() { selectDestByStep(-1); }
    );

    selectDestination("katerini", false);

   /* ================= 3. ΑΠΟ ΤΗ ΘΑΛΑΣΣΑ ΣΤΟΝ ΟΛΥΜΠΟ ================= */
    var olympusZones = [
      {
        cx: 75, cy: 188,
        alt: "Επίπεδο 1/5 \u2022 Υψόμετρο: 0 μέτρα",
        title: "\uD83C\uDF0A 1. Παραλία Κατερίνης: Εκεί που Ξεκινά το Μέτρημα!",
        desc: "Μόλις 5 χλμ. από το σχολείο μας είναι η θάλασσα του Θερμαϊκού. Από την επιφάνεια της θάλασσας (0 μέτρα) μετράμε το ύψος κάθε βουνού στη Γη!",
        img1: "https://upload.wikimedia.org/wikipedia/commons/1/11/Beach_Paralia_Katerini_-_panoramio.jpg",
        cap1: "\uD83C\uDF0A Παραλία Κατερίνης (0 μ.): Η χρυσή αμμουδιά μας δίπλα στον Θερμαϊκό Κόλπο",
        img2: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Beach_Paralia_Katerini_-_panoramio_%281%29.jpg",
        cap2: "\uD83C\uDFD6\uFE0F Θερμαϊκός Κόλπος (0 μ.): Από την επιφάνεια της θάλασσας ξεκινά το μέτρημα του υψομέτρου!",
        caption: "\uD83D\uDD0D Πάτησε στις φωτογραφίες για να τις δεις μεγάλες!",
        flora: ["\uD83C\uDF3C Κρίνος της θάλασσας", "\uD83C\uDFD6\uFE0F Αμμοθίνες"],
        fauna: ["\uD83D\uDC26 Γλάροι", "\uD83D\uDC22 Χελώνα Caretta caretta", "\uD83D\uDC2C Δελφίνια"],
        fact: "\uD83D\uDCA1 Το ήξερες; Ο λευκός «κρίνος της θάλασσας» ανθίζει το καλοκαίρι μέσα στην καυτή άμμο χωρίς καθόλου πότισμα!"
      },
      {
        cx: 238, cy: 140,
        alt: "Επίπεδο 2/5 \u2022 Υψόμετρο: 26 μέτρα",
        title: "\uD83C\uDFE1 2. Περίσταση: Το Χωριό μας στον Κάμπο!",
        desc: "Εδώ είμαστε εμείς! Η Περίσταση βρίσκεται στα 26 μέτρα ύψος από τη θάλασσα (όσο δύο διώροφα σχολεία!), μέσα σε έναν εύφορο κάμπο 11.000 στρεμμάτων που μοιράστηκε στους πρόσφυγες προπαππούδες μας!",
        img1: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0NL2aawSLfkOnNV8J_9cVNawgSBmkVdzSEmpkmtqgdjoNP8QO4rzJBrKxqEAJTnZ-RTHENX00Lq9rocWbrupB52YSzieFEytgLDhciFXms3NW1Maua0S1bRE_FuJjxBsca7xPHBsvBJY4DRestQzEGob8FU_CW_2u9EaYTuK6jhNC_nRXQgPR6M4pAAE/s1600/2025-10-25%2010_58_15-NVIDIA%20GeForce%20Overlay.png",
        cap1: "\uD83C\uDFE1 Η Περίσταση Πιερίας (26 μ.) ανάμεσα στην Κατερίνη, τη θάλασσα και τον Όλυμπο",
        img2: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Dion_view_of_Olympus.jpg",
        cap2: "\uD83C\uDF3E Ο εύφορος κάμπος της Πιερίας στους πρόποδες του χιονισμένου Ολύμπου",
        caption: "\uD83D\uDD0D Η Περίσταση από ψηλά & ο κάμπος μας κάτω από τον Όλυμπο",
        flora: ["\uD83E\uDD5D Ακτινίδια & Ροδάκινα", "\uD83C\uDF3E Σιτάρι & Βαμβάκι", "\uD83C\uDF3D Καλαμπόκι"],
        fauna: ["\uD83E\uDDA9 Πελαργοί στις κολώνες", "\uD83E\uDD8A Αλεπούδες", "\uD83D\uDC22 Χελώνες & Χελιδόνια"],
        fact: "\uD83D\uDCA1 Το ήξερες; Κάθε άνοιξη οι πελαργοί πετούν χιλιάδες χιλιόμετρα από την Αφρική για να φτιάξουν φωλιά στα χωριά μας!"
      },
      {
        cx: 388, cy: 126,
        alt: "Επίπεδο 3/5 \u2022 Υψόμετρο: 300 έως 1.100 μέτρα",
        title: "\uD83D\uDCA7 3. Χαράδρα Ενιπέα: Καταρράκτες & Δάση!",
        desc: "Ανεβαίνοντας στον Όλυμπο συναντάμε το ποτάμι του Ενιπέα με παγωμένους καταρράκτες, ξύλινα γεφυράκια και πυκνά δάση από οξιές και πεύκα.",
        img1: "https://upload.wikimedia.org/wikipedia/commons/9/96/%CE%9A%CE%B1%CF%84%CE%B1%CF%81%CE%B1%CE%BA%CF%84%CE%B7%CF%82_%CE%95%CE%BD%CE%B9%CF%80%CE%B5%CE%B1.jpg",
        cap1: "\uD83D\uDCA7 Χαράδρα Ενιπέα (300\u20131.100 μ.): Παγωμένοι καταρράκτες μέσα στα δάση του Ολύμπου",
        img2: "https://upload.wikimedia.org/wikipedia/commons/7/76/JankaeaHeldreichii30.jpg",
        cap2: "\uD83C\uDF38 Γιάνκεα (Jankaea heldreichii): Το σπάνιο μωβ λουλούδι του Ολύμπου από την Εποχή των Παγετώνων!",
        caption: "\uD83D\uDD0D Καταρράκτης στον Ενιπέα & το σπάνιο μωβ λουλούδι Γιάνκεα",
        flora: ["\uD83C\uDF33 Οξιές & Πλατάνια", "\uD83C\uDF32 Μαύρη Πεύκη", "\uD83C\uDF38 Λουλούδι Γιάνκεα"],
        fauna: ["\uD83E\uDD8C Ζαρκάδια", "\uD83D\uDC3F\uFE0F Σκιουράκια", "\uD83E\uDD8B Σπάνιες Πεταλούδες"],
        fact: "\uD83D\uDCA1 Το ήξερες; Το μωβ λουλούδι «Γιάνκεα» ζει μόνο στα βράχια του Ολύμπου από την Εποχή των Παγετώνων!"
      },
      {
        cx: 525, cy: 56,
        alt: "Επίπεδο 4/5 \u2022 Υψόμετρο: 1.100 έως 2.500 μέτρα",
        title: "\uD83C\uDF32 4. Το Δάσος με τα Γιγάντια Ρόμπολα!",
        desc: "Ψηλά στις πλαγιές φυτρώνει το Ρόμπολο, ένα πανίσχυρο πεύκο που αντέχει τους κεραυνούς, το βαθύ χιόνι και τους δυνατούς ανέμους!",
        img1: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Prionia_olympos_greece_IMG_7601.jpg",
        cap1: "\uD83C\uDF32 Τα πυκνά ορεινά δάση στα Πριόνια (1.100 μ.) στον Όλυμπο",
        img2: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mount_Olympus_from_Litochoro.jpg",
        cap2: "\u26F0\uFE0F Οι ψηλές πλαγιές του Ολύμπου (έως 2.500 μ.) όπου μεγαλώνουν τα αιωνόβια Ρόμπολα",
        caption: "\uD83D\uDD0D Τα δάση στα Πριόνια & οι ψηλές πλαγιές του Ολύμπου",
        flora: ["\uD83C\uDF32 Αιωνόβια Ρόμπολα", "\uD83C\uDF3F Ορεινά αγριολούλουδα"],
        fauna: ["\uD83E\uDD85 Αετοί", "\uD83D\uDC3B Καφέ Αρκούδα", "\uD83D\uDC17 Αγριογούρουνα"],
        fact: "\uD83D\uDCA1 Το ήξερες; Τα ρόμπολα του Ολύμπου σκαρφαλώνουν έως τα 2.750 μέτρα \u2014 είναι το πιο ψηλό δάσος σε όλη την Ευρώπη!"
      },
      {
        cx: 682, cy: 24,
        alt: "Επίπεδο 5/5 \u2022 Υψόμετρο: 2.918 μέτρα (Κορυφή!)",
        title: "\uD83C\uDFD4\uFE0F 5. Μύτικας (2.918 μ.): Πάνω από τα Σύννεφα!",
        desc: "Φτάσαμε στην πιο ψηλή κορυφή της Ελλάδας! Από τον Ιούλιο του 2026 ο Όλυμπος προστατεύεται επίσημα ως Μνημείο Παγκόσμιας Κληρονομιάς της UNESCO.",
        img1: "https://upload.wikimedia.org/wikipedia/commons/0/00/Mytikas_at_sunset_%28Olympus_mt.%29.jpg",
        cap1: "\uD83C\uDFD4\uFE0F Κορυφή Μύτικας (2.918 μ.): Το ψηλότερο σημείο της Ελλάδας στο ηλιοβασίλεμα!",
        img2: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Rupicapra_rupicapra_balcanica%2C_Olympus.jpg",
        cap2: "\uD83D\uDC10 Το Αγριόγιδο του Ολύμπου: Ισορροπεί στους πιο απότομους βράχους των κορυφών!",
        caption: "\uD83D\uDD0D Η κορυφή Μύτικας & το Αγριόγιδο του Ολύμπου",
        flora: ["\uD83C\uDF3C 23 μοναδικά λουλούδια που ζουν μόνο στον Όλυμπο!"],
        fauna: ["\uD83D\uDC10 Αγριόγιδο του Ολύμπου", "\uD83E\uDD85 Χρυσαετός", "\uD83D\uDC26 Πετροπέρδικα"],
        fact: "\uD83D\uDCA1 Το ήξερες; Το αγριόγιδο σκαρφαλώνει στους πιο απότομους γκρεμούς χωρίς να γλιστράει ποτέ!"
      }
    ];

   var brokenProfileSvg = document.getElementById("pexpProfileSvg");
    if (brokenProfileSvg && brokenProfileSvg.parentNode) {
      var tmpProfWrap = document.createElement("div");
      tmpProfWrap.innerHTML =
        '<svg id="pexpProfileSvg" viewBox="0 0 760 265" style="width:100%;height:auto;display:block" shape-rendering="geometricPrecision" role="img" aria-label="Διαδραστική ζωγραφιά από την Παραλία Κατερίνης και την Περίσταση έως τον Μύτικα">' +
          '<circle cx="88" cy="42" r="21" fill="#fde047"></circle>' +
          '<ellipse cx="585" cy="42" rx="44" ry="13" fill="#ffffff" opacity="0.9"></ellipse>' +
          '<g class="pexp-zone-hit" data-zone="0">' +
            '<rect x="0" y="0" width="160" height="265" fill="transparent"></rect>' +
            '<path d="M 0,208 Q 45,201 90,208 Q 120,213 150,206 L 150,265 L 0,265 Z" fill="#0ea5e9"></path>' +
            '<path d="M 138,206 L 166,201 L 166,265 L 138,265 Z" fill="#fde68a"></path>' +
            '<circle cx="75" cy="188" r="15" fill="#0284c7" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="75" y="192" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">0μ</text>' +
            '<text x="75" y="242" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">\uD83C\uDF0A Παραλία</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="1">' +
            '<rect x="160" y="0" width="155" height="265" fill="transparent"></rect>' +
            '<path d="M 155,202 L 315,190 L 315,265 L 155,265 Z" fill="#86efac"></path>' +
            '<rect x="210" y="175" width="17" height="15" fill="#fff" stroke="#dc2626" stroke-width="1.5"></rect>' +
            '<polygon points="208,175 218.5,165 229,175" fill="#dc2626"></polygon>' +
            '<rect x="233" y="170" width="13" height="20" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"></rect>' +
            '<polygon points="231,170 239.5,160 248,170" fill="#1d4ed8"></polygon>' +
            '<rect x="252" y="176" width="17" height="14" fill="#fff" stroke="#dc2626" stroke-width="1.5"></rect>' +
            '<polygon points="250,176 260.5,166 271,176" fill="#dc2626"></polygon>' +
            '<circle cx="238" cy="140" r="16" fill="#10b981" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="238" y="144" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">26μ</text>' +
            '<text x="238" y="232" text-anchor="middle" fill="#14532d" font-size="12" font-weight="900">\uD83C\uDFE1 Περίσταση!</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="2">' +
            '<rect x="315" y="0" width="140" height="265" fill="transparent"></rect>' +
            '<path d="M 315,190 L 455,132 L 455,265 L 315,265 Z" fill="#4ade80"></path>' +
            '<path d="M 412,150 Q 392,182 365,212" fill="none" stroke="#2563eb" stroke-width="4.5" stroke-linecap="round"></path>' +
            '<circle cx="355" cy="164" r="11" fill="#15803d"></circle>' +
            '<circle cx="430" cy="134" r="12" fill="#15803d"></circle>' +
            '<circle cx="388" cy="126" r="16" fill="#1e6cff" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="388" y="130" text-anchor="middle" fill="#fff" font-size="10" font-weight="900">800μ</text>' +
            '<text x="386" y="232" text-anchor="middle" fill="#064e3b" font-size="11.5" font-weight="900">\uD83D\uDCA7 Ενιπέας</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="3">' +
            '<rect x="455" y="0" width="140" height="265" fill="transparent"></rect>' +
            '<path d="M 455,132 L 595,68 L 595,265 L 455,265 Z" fill="#65a30d"></path>' +
            '<polygon points="485,100 475,124 495,124" fill="#14532d"></polygon>' +
            '<polygon points="525,81 515,106 535,106" fill="#14532d"></polygon>' +
            '<polygon points="565,66 556,88 574,88" fill="#14532d"></polygon>' +
            '<circle cx="525" cy="56" r="16" fill="#ea580c" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="525" y="60" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="900">2.000μ</text>' +
            '<text x="525" y="232" text-anchor="middle" fill="#1a2e05" font-size="11.5" font-weight="900">\uD83C\uDF32 Ρόμπολα</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="4">' +
            '<rect x="595" y="0" width="165" height="265" fill="transparent"></rect>' +
            '<path d="M 595,68 L 650,38 L 682,25 L 714,45 L 760,92 L 760,265 L 595,265 Z" fill="#64748b"></path>' +
            '<polygon points="682,25 656,57 673,53 683,61 695,51 710,56" fill="#f8fafc"></polygon>' +
            '<circle cx="682" cy="24" r="16" fill="#7c3aed" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="682" y="28" text-anchor="middle" fill="#fff" font-size="9" font-weight="900">2.918μ</text>' +
            '<text x="678" y="232" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="900">\uD83C\uDFD4\uFE0F Μύτικας</text>' +
          '</g>' +
          '<circle id="pexpZoneRing" class="pexp-pulse-ring" cx="238" cy="140" r="22" fill="none" stroke="#facc15" stroke-width="4"></circle>' +
        '</svg>';
      if (tmpProfWrap.firstElementChild) {
        brokenProfileSvg.parentNode.replaceChild(tmpProfWrap.firstElementChild, brokenProfileSvg);
      }
    }

   curZoneIdx = 1;
    var zRing = document.getElementById("pexpZoneRing");
    var zImg1 = document.getElementById("pexpZoneImg1");
    var zImg2 = document.getElementById("pexpZoneImg2");
    var zCap = document.getElementById("pexpZoneCaption");
    var zAlt = document.getElementById("pexpZoneAlt");
    var zTitle = document.getElementById("pexpZoneTitle");
    var zDesc = document.getElementById("pexpZoneDesc");
    var zFlora = document.getElementById("pexpZoneFlora");
    var zFauna = document.getElementById("pexpZoneFauna");
    var zFact = document.getElementById("pexpZoneFact");
    var zHits = document.querySelectorAll("#pexpProfileSvg .pexp-zone-hit");

   var naturePhotoCatalog = [
      { match: "Κρίνος", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Flowers_of_the_beach.jpg?width=750", cap: "Κρίνος της θάλασσας (Pancratium maritimum): ανθίζει στην καυτή άμμο της Παραλίας!" },
      { match: "Caretta", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Loggerhead_sea_turtle_(Caretta_caretta)_(9458090981).jpg?width=750", cap: "Θαλάσσια χελώνα Caretta caretta στα νερά της Μεσογείου & του Θερμαϊκού" },
      { match: "Δελφίνια", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tursiops_truncatus_01.jpg?width=750", cap: "Δελφίνι στα ανοιχτά νερά του Αιγαίου & του Θερμαϊκού" },
      { match: "Ακτινίδια", src: "https://commons.wikimedia.org/wiki/Special:FilePath/-Kiwi_-Actinidia_Deliciosa_-Fruit_-Green_(cropped).jpg?width=750", cap: "Ακτινίδια Πιερίας: η πιο διάσημη καλλιέργεια στον κάμπο της Περίστασης!" },
      { match: "Πελαργοί", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ciconia_ciconia_(aka).jpg?width=750", cap: "Λευκός Πελαργός: έρχεται κάθε άνοιξη στις κολώνες των χωριών μας!" },
      { match: "Αλεπούδες", src: "https://commons.wikimedia.org/wiki/Special:FilePath/European_red_fox_(Vulpes_vulpes).jpg?width=750", cap: "Κόκκινη αλεπού της ελληνικής υπαίθρου" },
      { match: "Γιάνκεα", src: "https://upload.wikimedia.org/wikipedia/commons/7/76/JankaeaHeldreichii30.jpg", cap: "Γιάνκεα του Ολύμπου (Jankaea heldreichii): ζει εδώ από την Εποχή των Παγετώνων!" },
      { match: "Ζαρκάδια", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Roe_deer_(Capreolus_capreolus)_male_Dobruja.jpg?width=750", cap: "Ζαρκάδι μέσα στα δάση του Ολύμπου" },
      { match: "Σκιουράκια", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sciurus_vulgaris_(AM_LM426).jpg?width=750", cap: "Κόκκινος σκίουρος στα δέντρα της Χαράδρας του Ενιπέα" },
      { match: "Ρόμπολα", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pinus_heldreichii.jpg?width=750", cap: "Αιωνόβιο Ρόμπολο (Pinus heldreichii): το ψηλότερο δάσος της Ευρώπης!" },
      { match: "Αρκούδα", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brown_bear_1101_01.jpg?width=750", cap: "Καφέ αρκούδα στα ορεινά δάση" },
      { match: "Αγριόγιδο", src: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Rupicapra_rupicapra_balcanica%2C_Olympus.jpg", cap: "Το Αγριόγιδο του Ολύμπου στις απότομες πλαγιές!" },
      { match: "Αετ", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Eagle_(Aquila_chrysaetos)_(13668207994).jpg?width=750", cap: "Χρυσαετός πάνω από τις ψηλές κορυφές του Ολύμπου" },
      { match: "Χρυσαετός", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Eagle_(Aquila_chrysaetos)_(13668207994).jpg?width=750", cap: "Χρυσαετός πάνω από τις ψηλές κορυφές του Ολύμπου" }
    ];
    function findSpeciesPhoto(label) {
      for (var i = 0; i < naturePhotoCatalog.length; i++) {
        if (label.indexOf(naturePhotoCatalog[i].match) !== -1) return i;
      }
      return -1;
    }

    function buildNatureTagHtml(label, baseCls) {
      var spIdx = findSpeciesPhoto(label);
      if (spIdx === -1) return '<span class="' + baseCls + '">' + label + '</span>';
      return '<span class="' + baseCls + ' pexp-tag-photo" data-sp-idx="' + spIdx + '" role="button" tabindex="0" title="Πάτησε για φωτογραφία!">' + label + ' \uD83D\uDCF7</span>';
    }

   if (panes.elevation) {
      panes.elevation.addEventListener("click", function(e) {
        var spTag = e.target.closest("[data-sp-idx]");
        if (!spTag) return;
        var sp = naturePhotoCatalog[Number(spTag.getAttribute("data-sp-idx"))];
        if (sp) openSinglePhotoZoom(sp.src, sp.cap, "");
      });
    }

 selectZone = function(idx) {
      elevReady = true;
      curZoneIdx = (idx + olympusZones.length) % olympusZones.length;
      var z = olympusZones[curZoneIdx];
      if (zRing) {
        zRing.setAttribute("cx", z.cx);
        zRing.setAttribute("cy", z.cy);
      }
      if (zAlt) zAlt.textContent = z.alt;
      if (zTitle) zTitle.textContent = z.title;
      if (zDesc) zDesc.textContent = z.desc;
      if (zImg1) { zImg1.setAttribute("data-full-src", z.img1); zImg1.src = optImg(z.img1, 640); zImg1.alt = z.cap1 || z.title; }
      if (zImg2) { zImg2.setAttribute("data-full-src", z.img2); zImg2.src = optImg(z.img2, 640); zImg2.alt = z.cap2 || z.title; }
      if (zCap) zCap.textContent = z.caption + " (\uD83D\uDCF7 Πάτησε και στις ετικέτες με κάμερα!)";
      if (zFlora) zFlora.innerHTML = z.flora.map(function(f) { return buildNatureTagHtml(f, "pexp-tag-flora"); }).join("");
      if (zFauna) zFauna.innerHTML = z.fauna.map(function(a) { return buildNatureTagHtml(a, "pexp-tag-fauna"); }).join("");
      if (zFact) zFact.textContent = z.fact;

      zHits.forEach(function(h, i) { h.style.opacity = (i === curZoneIdx) ? "1" : "0.78"; });

      var nextZ = olympusZones[(curZoneIdx + 1) % olympusZones.length];
      var prevZ = olympusZones[(curZoneIdx - 1 + olympusZones.length) % olympusZones.length];
      if (nextZ) { preloadImg(optImg(nextZ.img1, 640)); preloadImg(optImg(nextZ.img2, 640)); }
      if (prevZ) { preloadImg(optImg(prevZ.img1, 640)); preloadImg(optImg(prevZ.img2, 640)); }
    }

    var profileSvg = document.getElementById("pexpProfileSvg");
    var elevMapCard = profileSvg ? profileSvg.closest(".pexp-map-card") : null;
    var olyGameActive = false;
    var olyPackActive = false;
    var olyDeck = [];
    var olyRound = 0;
    var olyWaitingNext = false;
    var olyEcoBtn = null;
    var olyPackBtn = null;
    var olyStage = null;

   var olyPoolByZone = [
      [
        { icon: "\uD83D\uDC22", name: "Χελώνα Caretta caretta", zone: 0, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Loggerhead_sea_turtle_(Caretta_caretta)_(9458090981).jpg?width=600", note: "Κολυμπά στα νερά του Θερμαϊκού και βγαίνει στην αμμουδιά της Παραλίας!" },
        { icon: "\uD83C\uDF3C", name: "Κρίνος της θάλασσας", zone: 0, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Flowers_of_the_beach.jpg?width=600", note: "Ανθίζει μέσα στην καυτή άμμο της Παραλίας χωρίς καθόλου πότισμα!" }
      ],
      [
        { icon: "\uD83E\uDDA9", name: "Πελαργός", zone: 1, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Ciconia_ciconia_(aka).jpg?width=600", note: "Έρχεται κάθε άνοιξη από την Αφρική και φτιάχνει φωλιά στις κολώνες της Περίστασης!" },
        { icon: "\uD83E\uDD5D", name: "Ακτινίδια & Ροδάκινα", zone: 1, img: "https://commons.wikimedia.org/wiki/Special:FilePath/-Kiwi_-Actinidia_Deliciosa_-Fruit_-Green_(cropped).jpg?width=600", note: "Καλλιεργούνται στα εύφορα χωράφια του κάμπου γύρω από το χωριό μας!" }
      ],
      [
        { icon: "\uD83C\uDF38", name: "Μωβ λουλούδι Γιάνκεα", zone: 2, img: "https://upload.wikimedia.org/wikipedia/commons/7/76/JankaeaHeldreichii30.jpg", note: "Ζει στα σκιερά βράχια της Χαράδρας του Ενιπέα από την Εποχή των Παγετώνων!" },
        { icon: "\uD83E\uDD8C", name: "Ζαρκάδι", zone: 2, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Roe_deer_(Capreolus_capreolus)_male_Dobruja.jpg?width=600", note: "Ζει στα πυκνά δάση από οξιές και πεύκα δίπλα στα νερά του Ενιπέα!" }
      ],
      [
        { icon: "\uD83C\uDF32", name: "Αιωνόβιο Ρόμπολο", zone: 3, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Pinus_heldreichii.jpg?width=600", note: "Το πανίσχυρο πεύκο στα 2.000μ που αντέχει τους κεραυνούς και το βαθύ χιόνι!" },
        { icon: "\uD83D\uDC3B", name: "Καφέ Αρκούδα", zone: 3, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Brown_bear_1101_01.jpg?width=600", note: "Κινείται στα ψηλά, ήσυχα ορεινά δάση στις πλαγιές του Ολύμπου!" }
      ],
      [
        { icon: "\uD83D\uDC10", name: "Αγριόγιδο του Ολύμπου", zone: 4, img: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Rupicapra_rupicapra_balcanica%2C_Olympus.jpg", note: "Σκαρφαλώνει στους πιο απότομους γκρεμούς στις ψηλές κορυφές (2.918μ)!" },
        { icon: "\uD83E\uDD85", name: "Χρυσαετός", zone: 4, img: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Eagle_(Aquila_chrysaetos)_(13668207994).jpg?width=600", note: "Πετάει περήφανα πάνω από τα σύννεφα στην κορυφή του Μύτικα!" }
      ]
    ];

    var zoneShortLabels = [
      "\uD83C\uDF0A Παραλία (0μ)",
      "\uD83C\uDFE1 Περίσταση (26μ)",
      "\uD83D\uDCA7 Ενιπέας (800μ)",
      "\uD83C\uDF32 Ρόμπολα (2.000μ)",
      "\uD83C\uDFD4\uFE0F Μύτικας (2.918μ)"
    ];

   var natureCard = panes.elevation ? panes.elevation.querySelector(".pexp-nature-card") : null;

    function setOlyAnswerCardVisible(vis) {
      if (zRing) zRing.style.display = vis ? "" : "none";
      if (natureCard) natureCard.style.display = vis ? "" : "none";
    }

   hasActiveSubGame = function() {
      return !!(activeRootKey || capsuleOpen || mirrorOpen || olyGameActive || olyPackActive || cratesGameOpen ||
        (typeof cartGameStage !== "undefined" && cartGameStage && cartGameStage.style.display === "block"));
    };

   isOlympusGuessing = function() {
      return !!(olyGameActive || olyPackActive);
    };

    if (panes.elevation && elevMapCard) {
      var olyBar = document.createElement("div");
      olyBar.className = "pexp-game-bar";

      olyEcoBtn = document.createElement("button");
      olyEcoBtn.type = "button";
      olyEcoBtn.className = "pexp-game-trigger pexp-game-trigger--green";
      olyEcoBtn.textContent = "\uD83C\uDFAE Παίξε στον Όλυμπο: Βρες το Σπίτι τους!";

      olyPackBtn = document.createElement("button");
      olyPackBtn.type = "button";
      olyPackBtn.className = "pexp-game-trigger";
      olyPackBtn.textContent = "\uD83C\uDF92 Δοκιμασία: Σακίδιο Ολύμπου!";

      olyBar.appendChild(olyEcoBtn);
      olyBar.appendChild(olyPackBtn);

      olyStage = document.createElement("div");
      olyStage.style.display = "none";

      elevMapCard.parentNode.insertBefore(olyBar, elevMapCard);
      elevMapCard.parentNode.insertBefore(olyStage, elevMapCard);

    stopOlympusGame = function() {
        olyGameActive = false;
        olyPackActive = false;
        olyWaitingNext = false;
        setOlyAnswerCardVisible(true);
        if (profileSvg) profileSvg.classList.remove("is-game-target");
        if (olyEcoBtn) {
          olyEcoBtn.classList.remove("is-active");
          olyEcoBtn.textContent = "\uD83C\uDFAE Παίξε στον Όλυμπο: Βρες το Σπίτι τους!";
        }
        if (olyPackBtn) olyPackBtn.classList.remove("is-active");
        if (olyStage) {
          olyStage.style.display = "none";
          olyStage.innerHTML = "";
          olyStage.onclick = null;
        }
      };

      var drawOlyRound = function(fbHtml, fbCls) {
        if (!olyStage) return;
        var q = olyDeck[olyRound];
        if (!q) return;
        olyStage.innerHTML =
          '<div class="pexp-oly-banner">' +
            '<div class="pexp-root-pop-top">' +
              '<span class="pexp-root-pop-title" style="color:#047857">\uD83C\uDFAF Γύρος ' + (olyRound + 1) + ' από ' + olyDeck.length + ' \u2022 Βάλε τα Ζώα & τα Φυτά στο Σπίτι τους!</span>' +
              '<button type="button" class="pexp-root-pop-close" data-oly-close="1" title="Κλείσιμο">\u2715</button>' +
            '</div>' +
           '<div class="pexp-oly-q">Πού ζει ή φυτρώνει: ' + q.icon + ' «' + q.name + '»;</div>' +
            '<div class="pexp-oly-fb' + (fbCls ? ' ' + fbCls : '') + '">' + fbHtml + '</div>' +
          '</div>';
        olyStage.querySelectorAll("img").forEach(function(im) {
          im.onerror = function() { this.style.display = "none"; };
        });
      };
      var startOlyEcoGame = function() {
        stopOlympusGame();
        olyGameActive = true;
        olyRound = 0;
        olyWaitingNext = false;
        olyDeck = shuffleList(olyPoolByZone.map(function(pair) {
          return pair[Math.floor(Math.random() * pair.length)];
        }));
       setOlyAnswerCardVisible(false);
        if (profileSvg) profileSvg.classList.add("is-game-target");
        olyEcoBtn.classList.add("is-active");
        olyStage.style.display = "block";
        drawOlyRound("\uD83D\uDC47 Πάτησε απευθείας πάνω στη σωστή περιοχή της ζωγραφιάς από κάτω!", "");

       olyStage.onclick = function(e) {
          if (e.target.closest("[data-oly-close]")) {
            stopOlympusGame();
         } else if (e.target.closest("[data-oly-zoom]")) {
            var curQ = olyDeck[olyRound];
            if (curQ && curQ.img) openSinglePhotoZoom(curQ.img, curQ.name + " \u2022 " + curQ.note, optImg(curQ.img, 330));
          } else if (e.target.closest("[data-oly-next]")) {
            olyRound++;
            olyWaitingNext = false;
            setOlyAnswerCardVisible(false);
            drawOlyRound("\uD83D\uDC47 Πάτησε πάνω στη σωστή ζώνη της ζωγραφιάς!", "");
          } else if (e.target.closest("[data-oly-replay]")) {
            startOlyEcoGame();
          }
        };
      };
      var olyPackCfg = {
        title: "\uD83C\uDF92 Ετοίμασε το Σακίδιο για τον Μύτικα (2.918μ)",
        subtitle: "Ανεβαίνουμε στην πιο ψηλή κορυφή της Ελλάδας! Διάλεξε τα <strong>3 σωστά εφόδια</strong> ορειβάτη:",
        accent: "#1d4ed8", border: "#93c5fd", bg: "#eff6ff",
        winText: "\uD83C\uDFC6 Άψογος/η ορειβάτης! Με γερά μποτάκια, αντιανεμικό μπουφάν και παγούρι με νερό, ανεβαίνουμε με ασφάλεια στον Όλυμπο!",
        items: [
          { icon: "\uD83E\uDD7E", name: "Ορειβατικά Μποτάκια", ok: true, why: "Απαραίτητα στα πέτρινα μονοπάτια του Ολύμπου για να μη γλιστράμε!" },
          { icon: "\uD83E\uDDE5", name: "Αντιανεμικό Μπουφάν", ok: true, why: "Στα 2.918μ έχει ~18\u00B0C περισσότερο κρύο από την Περίσταση ακόμα και το καλοκαίρι!" },
          { icon: "\uD83D\uDCA7", name: "Παγούρι με Νερό", ok: true, why: "Πάνω από το δάσος των Ρόμπολων δεν υπάρχουν πηγές, οπότε έχουμε πάντα νερό μαζί μας!" },
          { icon: "\uD83E\uDE74", name: "Σαγιονάρες Παραλίας", ok: false, why: "Οι σαγιονάρες είναι τέλειες για την Παραλία Κατερίνης (0μ), αλλά επικίνδυνες στα βράχια!" },
          { icon: "\uD83C\uDFD6\uFE0F", name: "Ομπρέλα Θαλάσσης", ok: false, why: "Με τους δυνατούς ανέμους στις κορυφές, η ομπρέλα θαλάσσης θα πετούσε σαν χαρταετός!" },
          { icon: "\uD83D\uDEF9", name: "Πατίνι Δρόμου", ok: false, why: "Τα μονοπάτια του Ενιπέα έχουν ξύλινα γεφυράκια, ρίζες και σκαλοπάτια!" }
        ],
        onClose: function() {
          stopOlympusGame();
        }
      };

      olyEcoBtn.addEventListener("click", function() {
        if (olyGameActive) stopOlympusGame();
        else startOlyEcoGame();
      });

      olyPackBtn.addEventListener("click", function() {
        if (olyPackActive) {
          stopOlympusGame();
          return;
        }
        stopOlympusGame();
        olyPackActive = true;
        olyPackBtn.classList.add("is-active");
        olyStage.style.display = "block";
        renderPackChallenge(olyStage, olyPackCfg);
      });

      zHits.forEach(function(h) {
        h.addEventListener("click", function() {
          var clickedZone = Number(h.getAttribute("data-zone"));
          if (!olyGameActive) {
            selectZone(clickedZone);
            return;
          }
          if (olyWaitingNext) return;
          var q = olyDeck[olyRound];
          if (!q) return;

       if (clickedZone === q.zone) {
            olyWaitingNext = true;
            setOlyAnswerCardVisible(true);
            selectZone(clickedZone);
           var winThumb = q.img
              ? '<img class="pexp-oly-win-thumb" src="' + optImg(q.img, 330) + '" alt="' + q.name + '" data-oly-zoom="1" title="Πάτησε για μεγέθυνση!"/>'
              : '';
            if (olyRound < olyDeck.length - 1) {
              drawOlyRound(
                '<div class="pexp-oly-win-wrap">' + winThumb + '<span>\u2705 Μπράβο! Σωστά στη ζώνη «' + zoneShortLabels[clickedZone] + '»! ' + q.note + '</span></div>' +
                '<button type="button" class="pexp-root-pop-cta" data-oly-next="1" style="background:#059669;margin:0">Επόμενο (' + (olyRound + 2) + '/5) \u279C</button>',
                "is-win"
              );
            } else {
              drawOlyRound(
                '<div class="pexp-oly-win-wrap">' + winThumb + '<span>\uD83C\uDFC6 5 στα 5! Έβαλες όλα τα ζώα και τα φυτά από το κύμα έως τον Μύτικα στο σωστό τους σπίτι!</span></div>' +
                '<button type="button" class="pexp-root-pop-cta" data-oly-replay="1" style="background:#059669;margin:0">\uD83D\uDD04 Παίξε ξανά</button>',
                "is-win"
              );
            }
          } else {
            var dirHint = (clickedZone < q.zone)
              ? "Ψάξε πιο ψηλά στο βουνό! \u2B06\uFE0F"
              : "Ψάξε πιο χαμηλά προς τη θάλασσα! \u2B07\uFE0F";
            drawOlyRound(
              '<span>\uD83E\uDD14 Εδώ είναι «' + zoneShortLabels[clickedZone] + '» \u2014 ' + dirHint + '</span>',
              "is-warn"
            );
          }
        });
      });
    } else {
      zHits.forEach(function(h) {
        h.addEventListener("click", function() { selectZone(Number(h.getAttribute("data-zone"))); });
      });
    }

   on("pexpZonePrev", "click", function() { if (!isOlympusGuessing()) selectZone(curZoneIdx - 1); });
    on("pexpZoneNext", "click", function() { if (!isOlympusGuessing()) selectZone(curZoneIdx + 1); });
    bindSwipe(
      panes.elevation,
      function() { if (!isOlympusGuessing()) selectZone(curZoneIdx + 1); },
      function() { if (!isOlympusGuessing()) selectZone(curZoneIdx - 1); }
    );

 var weatherFetching = false;
    function applyLiveTempVal(val, tempPill) {
      weatherLoaded = true;
      var tPeristasi = Math.round(val);
      var tMytikas = Math.round(val - 18.8);
      tempPill.textContent = "\uD83C\uDF21\uFE0F Τώρα: Περίσταση (26μ) " + tPeristasi + "\u00B0C  \u2022  Κορυφή Μύτικα (2.918μ) ~" + tMytikas + "\u00B0C!";
    }
  loadLiveTemperatures = function() {
      if (weatherLoaded || weatherFetching || typeof window.fetch !== "function") return;
      var tempPill = document.getElementById("pexpLiveTemp");
      if (!tempPill) return;
      try {
        var wCache = JSON.parse(sessionStorage.getItem("pexp_temp_cache") || "null");
        if (wCache && typeof wCache.t === "number" && (Date.now() - wCache.ts) < 1200000) {
          applyLiveTempVal(wCache.t, tempPill);
          return;
        }
      } catch (e) {}
      weatherFetching = true;
      var ctrl = (typeof AbortController === "function") ? new AbortController() : null;
      var tOut = ctrl ? setTimeout(function() { ctrl.abort(); }, 6000) : null;
      fetch("https://api.open-meteo.com/v1/forecast?latitude=40.2741&longitude=22.5396&current=temperature_2m&timezone=auto", ctrl ? { signal: ctrl.signal } : undefined)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
          if (tOut) clearTimeout(tOut);
          weatherFetching = false;
          if (data && data.current && typeof data.current.temperature_2m === "number") {
            applyLiveTempVal(data.current.temperature_2m, tempPill);
            try { sessionStorage.setItem("pexp_temp_cache", JSON.stringify({ t: data.current.temperature_2m, ts: Date.now() })); } catch (e) {}
          }
        })
        .catch(function() {
          if (tOut) clearTimeout(tOut);
          weatherFetching = false;
        });
    }

   /* ================= 3Β. ΟΙ ΕΚΚΛΗΣΙΕΣ ΜΑΣ (4η ΚΑΡΤΕΛΑ) ================= */
    var cMainImg = document.getElementById("pexpChurchMainImg");
    var cBadge = document.getElementById("pexpChurchBadge");
    var cTitle = document.getElementById("pexpChurchTitle");
    var cStory = document.getElementById("pexpChurchStory");
    var cTags = document.getElementById("pexpChurchTags");
    var cFact = document.getElementById("pexpChurchFact");
    var cThumbStrip = document.getElementById("pexpChurchThumbs");
    var cThumbs = [];
    function ensureChurchThumbs() {
      if (cThumbs.length || !cThumbStrip || !churchesData.length) return;
      cThumbStrip.innerHTML = churchesData.map(function(ch, i) {
        return '<button type="button" class="pexp-thumb-btn' + (i === 0 ? ' is-active' : '') + '" data-church="' + i + '" title="' + escAttr(ch.caption) + '">' +
          '<img src="' + optImg(ch.img, 320) + '" data-full-src="' + escAttr(ch.img) + '" alt="' + escAttr(ch.caption) + '" loading="lazy" decoding="async"/>' +
        '</button>';
      }).join("");
      cThumbStrip.querySelectorAll("img").forEach(function(im) {
        im.onerror = handleImgFallback;
      });
      cThumbs = cThumbStrip.querySelectorAll(".pexp-thumb-btn");
      cThumbs.forEach(function(btn) {
        btn.addEventListener("click", function() {
          renderChurch(Number(btn.getAttribute("data-church")));
        });
      });
    }

    renderChurch = function(idx) {
      if (!churchesData.length) return;
      ensureChurchThumbs();
      churchesReady = true;
      currentChurchIdx = (idx + churchesData.length) % churchesData.length;
      var ch = churchesData[currentChurchIdx];
      if (cMainImg) {
        cMainImg.setAttribute("data-full-src", ch.img);
        cMainImg.src = optImg(ch.img, 640);
        cMainImg.alt = ch.caption;
      }
      var nextCh = churchesData[(currentChurchIdx + 1) % churchesData.length];
      if (nextCh) preloadImg(optImg(nextCh.img, 640));
      if (cBadge) cBadge.textContent = ch.badge;
      if (cTitle) cTitle.textContent = ch.title;
      if (cStory) cStory.textContent = ch.story;
      if (cTags) {
        cTags.innerHTML = ch.tags.map(function(t) {
          return '<span class="pexp-tag-flora">' + t + '</span>';
        }).join("");
      }
      if (cFact) cFact.textContent = ch.fact;
      cThumbs.forEach(function(btn, i) {
        btn.classList.toggle("is-active", i === currentChurchIdx);
      });
    };
   on("pexpPrevChurch", "click", function() { renderChurch(currentChurchIdx - 1); });
    on("pexpNextChurch", "click", function() { renderChurch(currentChurchIdx + 1); });
    bindSwipe(
      panes.churches,
      function() { renderChurch(currentChurchIdx + 1); },
      function() { renderChurch(currentChurchIdx - 1); }
    );

    var churchShowcase = panes.churches ? panes.churches.querySelector(".pexp-stop-showcase") : null;
    if (panes.churches && churchShowcase) {
      var cratesBar = document.createElement("div");
      cratesBar.className = "pexp-game-bar";

      var cratesTrigBtn = document.createElement("button");
      cratesTrigBtn.type = "button";
      cratesTrigBtn.className = "pexp-game-trigger pexp-game-trigger--amber";
      cratesTrigBtn.textContent = "\uD83D\uDCE6 Εξερεύνηση 1922: Άνοιξε τα 18 Κιβώτια της Μνήμης!";
      cratesBar.appendChild(cratesTrigBtn);

      var cratesStage = document.createElement("div");
      cratesStage.style.display = "none";

      churchShowcase.parentNode.insertBefore(cratesBar, churchShowcase);
      churchShowcase.parentNode.insertBefore(cratesStage, churchShowcase);

      var memoryCratesData = [
        {
          range: "Κιβώτια 1\u20134 από 18",
          short: "Άγιος Μόδεστος",
          icon: "\uD83D\uDDBC\uFE0F",
          title: "1. Η Ιερή Εικόνα του Αγίου Μοδέστου",
          desc: "Προστάτης των γεωργών και των ζώων που όργωναν τα χωράφια! Οι πρόσφυγες τύλιξαν με υφαντά την εικόνα του για να μη χτυπηθεί στο ταξίδι και την έφεραν στον νέο ναό του Αγίου Γεωργίου & Μοδέστου.",
          badge: "\uD83D\uDCC5 Γιορτάζει στις 16 Δεκεμβρίου"
        },
        {
          range: "Κιβώτια 5\u201311 από 18",
          short: "Ιερά Κειμήλια",
          icon: "\uD83D\uDD6F\uFE0F",
          title: "2. Τα Ιερά Κειμήλια της Προποντίδας",
          desc: "Εικόνες, ασημένια καντήλια, σταυροί και ιερά σκεύη από τις εκκλησίες της παλιάς Περίστασης ταξίδεψαν με τα ατμόπλοια «Ωραία Ελλάς» και «Αθήναι» έως τη Θεσσαλονίκη και από εκεί στον κάμπο της Πιερίας.",
          badge: "\u26EA Φυλάσσονται στον Αη-Γιώργη από το 1924"
        },
        {
          range: "Κιβώτια 12\u201315 από 18",
          short: "Παλιά Βιβλία",
          icon: "\uD83D\uDCD6",
          title: "3. Τα Παλιά Βιβλία & η Αγάπη για τα Γράμματα",
          desc: "Μαζί με τα παλιά λειτουργικά βιβλία, οι προπαππούδες μας έφεραν την παράδοση των σπουδαίων σχολείων της Ανατολικής Θράκης \u2014 γι' αυτό μόλις έφτασαν έχτισαν αμέσως το πρώτο πλίνθινο σχολείο μας!",
          badge: "\uD83C\uDFEB Η ρίζα για τα 100 χρόνια του Σχολείου μας"
        },
        {
          range: "Κιβώτια 16\u201317 από 18",
          short: "Το Όνομά μας",
          icon: "\uD83C\uDFE1",
          title: "4. Το Όνομα του Χωριού μας: «Περίσταση»",
          desc: "Ο πιο ακριβός θησαυρός δεν είχε βάρος: έφεραν μαζί τους το όνομα της αξέχαστης πατρίδας τους στην Προποντίδα και βάφτισαν το νέο τους σπίτι στην Πιερία «Περίσταση»!",
          badge: "\uD83D\uDDFA\uFE0F Από την Προποντίδα στην Πιερία"
        },
        {
          range: "Κιβώτιο 18 από 18",
          short: "Ζωντανό Έθιμο",
          icon: "\uD83E\uDD1D",
          title: "5. Το Έθιμο της Φιλοξενίας της Εικόνας",
          desc: "Κράτησαν ζωντανό το θρακιώτικο έθιμο όπου κάθε Δεκέμβριο η εικόνα του Αγίου Μοδέστου φιλοξενείται με αγάπη από σπίτι σε σπίτι, ενώνοντας όλες τις γειτονιές του χωριού μας!",
          badge: "\uD83C\uDF1F Αναβιώνει κάθε χρόνο έως σήμερα!"
        }
      ];

     var openedCrates = {};
      var curCrateIdx = -1;
      try {
        var savedCrates = JSON.parse(localStorage.getItem("pexp_crates_1922") || "null");
        if (savedCrates && typeof savedCrates === "object") openedCrates = savedCrates;
      } catch (e) {}

      var countOpenedCrates = function() {
        var c = 0;
        for (var i = 0; i < memoryCratesData.length; i++) {
          if (openedCrates[i]) c++;
        }
        return c;
      };

     var drawCratesBox = function() {
        try { localStorage.setItem("pexp_crates_1922", JSON.stringify(openedCrates)); } catch (e) {}
        var openedCount = countOpenedCrates();
        var gridHtml = memoryCratesData.map(function(cr, idx) {
          var isOp = !!openedCrates[idx];
          var isCur = (idx === curCrateIdx);
          var cls = "pexp-crate-btn" + (isOp ? " is-opened" : "") + (isCur ? " is-current" : "");
          return '<button type="button" class="' + cls + '" data-crate-idx="' + idx + '">' +
            '<span class="pexp-crate-ico">' + (isOp ? cr.icon : "\uD83D\uDCE6") + '</span>' +
            '<span class="pexp-crate-num">' + (isOp ? cr.short : ("Κιβώτιο " + (idx + 1))) + '</span>' +
            '<span class="pexp-crate-state">' + (isOp ? "\uD83D\uDD13 Ανοίχτηκε" : "\uD83D\uDD12 Πάτησε εδώ") + '</span>' +
          '</button>';
        }).join("");

        var revealHtml = "";
        if (curCrateIdx >= 0 && memoryCratesData[curCrateIdx]) {
          var cur = memoryCratesData[curCrateIdx];
          var nextBtnHtml = (openedCount < memoryCratesData.length)
            ? '<button type="button" class="pexp-root-pop-cta" data-crate-next="1" style="background:#d97706;margin:0">Άνοιξε επόμενο κιβώτιο \u279C</button>'
            : '';
          revealHtml =
            '<div class="pexp-crate-reveal">' +
              '<div class="pexp-crate-rev-head">' +
                '<h5 class="pexp-crate-rev-title">' + cur.icon + ' ' + cur.title + '</h5>' +
                '<span class="pexp-crate-rev-range">' + cur.range + '</span>' +
              '</div>' +
              '<p class="pexp-crate-rev-desc">' + cur.desc + '</p>' +
              '<div class="pexp-crate-rev-foot">' +
                '<span class="pexp-crate-badge">' + cur.badge + '</span>' +
                nextBtnHtml +
              '</div>' +
            '</div>';
        } else {
          revealHtml =
            '<div class="pexp-crate-reveal" style="text-align:center;color:#78350f;font-weight:700;font-size:13px">' +
              '\uD83D\uDC46 Πάτησε πάνω σε οποιοδήποτε ξύλινο κιβώτιο για να δεις τι έσωσαν οι πρόσφυγες το 1922!' +
            '</div>';
        }

        var winBannerHtml = (openedCount === memoryCratesData.length)
          ? '<div class="pexp-crates-win">' +
              '<strong>\uD83C\uDF1F Ξεκλείδωσες και τα 18 Κιβώτια της Μνήμης!</strong><br/>' +
              'Όλα έφτασαν ασφαλή στη Νέα Περίσταση Πιερίας \u2014 κι έτσι η πίστη, τα γράμματα, το όνομα και τα έθιμα των προπαππούδων μας συνεχίζουν να ζουν σήμερα μέσα από εσάς! ' +
              '<button type="button" class="pexp-root-pop-cta" data-crate-reset="1" style="background:#059669;margin-top:8px">\uD83D\uDD04 Κλείδωσε ξανά τα κιβώτια</button>' +
            '</div>'
          : '';

        cratesStage.innerHTML =
          '<div class="pexp-crates-box">' +
            '<div class="pexp-root-pop-top">' +
              '<span class="pexp-root-pop-title" style="color:#b45309">\uD83D\uDCE6 Τα 18 Ξύλινα Κιβώτια της Μνήμης (Οκτώβριος 1922)</span>' +
              '<button type="button" class="pexp-root-pop-close" data-crate-close="1" title="Κλείσιμο">\u2715</button>' +
            '</div>' +
            '<div class="pexp-crates-sub">Φεύγοντας από την Προποντίδα μέσα σε 15 μέρες, οι Περιστασιανοί έσωσαν όσα αγαπούσαν σε <strong>18 ξύλινα κιβώτια</strong>. Ανακάλυψε τους 5 μεγάλους θησαυρούς τους:</div>' +
            '<span class="pexp-crates-prog">\uD83D\uDD13 Άνοιξες ' + openedCount + ' από ' + memoryCratesData.length + ' μέρη της συλλογής</span>' +
            '<div class="pexp-crates-grid">' + gridHtml + '</div>' +
            revealHtml +
            winBannerHtml +
          '</div>';
      };

     stopCratesGame = function() {
        cratesGameOpen = false;
        cratesTrigBtn.classList.remove("is-active");
        cratesStage.style.display = "none";
        cratesStage.innerHTML = "";
      };

      openCratesInModal = function() {
        if (!cratesGameOpen) {
          cratesGameOpen = true;
          cratesTrigBtn.classList.add("is-active");
          cratesStage.style.display = "block";
          drawCratesBox();
        }
        requestAnimationFrame(function() {
          scrollInsideModal(cratesStage);
        });
      };

      cratesTrigBtn.addEventListener("click", function() {
        if (cratesGameOpen) {
          stopCratesGame();
          return;
        }
        cratesGameOpen = true;
        cratesTrigBtn.classList.add("is-active");
        cratesStage.style.display = "block";
        drawCratesBox();
      });

      cratesStage.addEventListener("click", function(e) {
        if (e.target.closest("[data-crate-close]")) {
          stopCratesGame();
          return;
        }
        if (e.target.closest("[data-crate-reset]")) {
          openedCrates = {};
          curCrateIdx = -1;
          drawCratesBox();
          return;
        }
        if (e.target.closest("[data-crate-next]")) {
          for (var k = 0; k < memoryCratesData.length; k++) {
            var cand = (curCrateIdx + 1 + k) % memoryCratesData.length;
            if (!openedCrates[cand]) {
              openedCrates[cand] = true;
              curCrateIdx = cand;
              drawCratesBox();
              break;
            }
          }
          return;
        }
       var cBtn = e.target.closest("[data-crate-idx]");
        if (cBtn) {
          var idx = Number(cBtn.getAttribute("data-crate-idx"));
          openedCrates[idx] = true;
          curCrateIdx = idx;
          drawCratesBox();
        }
      });
    }

    }; /* Τέλος ensureExplorerInit */

    churchesData = [
      {
        badge: "Εκκλησία 1 από 2 \u2022 Κέντρο Περίστασης",
        title: "\u26EA 1. Ιερός Ναός Αγ. Γεωργίου & Αγ. Μοδέστου",
        img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpoIvD-uW-PJidxwFEyZqvdrRrE8_XY7mvNoHvKQQXl9w69-O04hyphenhyphenuOqUqNnul-f19sMorQDWZUL8nxfPoRaORl5RauIy-ak1pEjsFv0LCcLLIn4sPuA0BaFe1QofqCxXxGxijUqSO5HBOU7jxpO78M0U7MPs8kjoJ2BAplETfQMZBt55Jp1cNq7K_MwY/s1600/2026-06-28%2020_49_56-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png",
        caption: "Ιερός Ναός Αγίου Γεωργίου και Αγίου Μοδέστου Περίστασης",
        story: "Μόλις εγκαταστάθηκαν οι πρώτοι πρόσφυγες το 1923\u20131924, το πρώτο τους μέλημα — μαζί με το πλίνθινο σχολείο — ήταν να χτίσουν την εκκλησία του Αη-Γιώργη! Εδώ φυλάσσονται με αγάπη τα ιερά κειμήλια της ιστορικής Μητρόπολης Μυριοφύτου και Περιστάσεως, που ταξίδεψαν το 1922 σε 18 ξύλινα κιβώτια από την Προποντίδα.",
        tags: [
          "\uD83D\uDCC5 23 Απριλίου (ή Δευτέρα Πάσχα) \u2022 Αγ. Γεωργίου",
          "\uD83D\uDCC5 16 Δεκεμβρίου \u2022 Αγ. Μοδέστου",
          "\uD83D\uDDBC\uFE0F Ιερά Κειμήλια Προποντίδας (1922)"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Ο Άγιος Μόδεστος είναι ο προστάτης των γεωργών και των ζώων! Κάθε Δεκέμβριο αναβιώνει το παλιό θρακιώτικο έθιμο όπου η εικόνα του Αγίου φιλοξενείται από σπίτι σε σπίτι!"
      },
      {
        badge: "Εκκλησία 2 από 2 \u2022 Ιστορικό Εξωκκλήσι",
        title: "\uD83C\uDF38 2. Εξωκκλήσι Παναγίας Ζωοδόχου Πηγής",
        img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirhu5w5w8mTAO71RZQFCOFdv_zyb0gZMYiTfDEczPbV1-vnQRzSt0HMEjpQfG5i1LZQWD1BNmBJGnXl7tU-5cCnKgfe1fc6vVJZi9dYFx8Qxn6__uLdb8Geed7_haGxJ37WD7slapAKjONWd4knhs4B0lq5cvEBMOF9HoBs_hG7gmVffhz922OmFSgb2M/s1600/2026-06-28%2020_52_12-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png",
        caption: "Εξωκκλήσι Παναγίας Ζωοδόχου Πηγής Περίστασης",
        story: "Μέσα στα δέντρα του κάμπου μας βρίσκεται η Παναγία Ζωοδόχος Πηγή, ένα παλιό μοναστήρι που υπήρχε εδώ πριν ακόμα έρθουν οι πρόσφυγες το 1923! Κάθε άνοιξη μετά το Πάσχα, μικροί και μεγάλοι ανταμώνουν εδώ στη φύση για το μεγάλο πανηγύρι.",
        tags: [
          "\uD83D\uDCC5 Παρασκευή της Διακαινησίμου (μετά το Πάσχα)",
          "\uD83C\uDFDB\uFE0F Παλιό Μονήδριο (πριν το 1923)",
          "\uD83C\uDF3F Ανοιξιάτικο Πανηγύρι στη Φύση"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Το 1941, στον Β' Παγκόσμιο Πόλεμο, εδώ στη Ζωοδόχο Πηγή είχαν στήσει το στρατόπεδό τους οι Νεοζηλανδοί Σύμμαχοι στρατιώτες, τους οποίους φρόντισαν με αγάπη οι κάτοικοι του χωριού μας!"
      }
    ];

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(function() { ensureExplorerInit(); }, { timeout: 1500 });
    } else {
      setTimeout(ensureExplorerInit, 600);
    }

    /* ================= 4. ΠΑΙΔΙΚΕΣ ΚΑΡΤΕΣ ΥΠΟΔΟΜΩΝ & ΦΟΡΕΩΝ ================= */

    /* ================= 4. ΠΑΙΔΙΚΕΣ ΚΑΡΤΕΣ ΥΠΟΔΟΜΩΝ & ΦΟΡΕΩΝ ================= */
    /* ================= 4. ΠΑΙΔΙΚΕΣ ΚΑΡΤΕΣ ΥΠΟΔΟΜΩΝ & ΦΟΡΕΩΝ ================= */
    /* ΕΔΩ μπορείς να επικολλήσεις απευθείας links εικόνων από άρθρα του Δήμου Κατερίνης ή τοπικών sites!
       Αν μείνουν κενά ("") ή αν κάποιο link αλλάξει στο μέλλον, φορτώνει αυτόματα η εφεδρική εικόνα! */
    var customFacilityPhotos = {
      dimotiko: "",     // 0: 12/Θ Δημοτικό (έχει ήδη τη δική σας αεροφωτογραφία)
      gymnasio: "",     // 1: Γυμνάσιο Περίστασης
      nipiagogeio: "",  // 2: 3/Θ Νηπιαγωγείο Περίστασης
      paidikos: "",     // 3: Δημοτικός Παιδικός Σταθμός Περίστασης
      kleistoT9: "",    // 4: Κλειστό Γυμναστήριο Τ9 Κατερίνης/Περίστασης
      syllogoi: "",     // 5: Μνημείο Προσφύγων / Πλ. Ανατολικής Θράκης / Σύλλογοι
      gipedoAep: ""     // 6: Γήπεδο Α.Ε. Περίστασης
    };

    var facilitiesData = [
      {
        icon: "\uD83C\uDFEB",
        img: customFacilityPhotos.dimotiko || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        imgCap: "Το 12/θέσιο Δημοτικό Σχολείο Περίστασης (Μακεδονίας 13)",
        accent: "#1e6cff", border: "#93c5fd", soft: "#eff6ff",
        badge: "\uD83C\uDF82 100 Χρόνια Σχολείο (1926\u20132026) \u2022 Μακεδονίας 13",
        title: "Το 12/θέσιο Δημοτικό Σχολείο μας!",
        story: "Το σχολείο μας κλείνει έναν ολόκληρο αιώνα ζωής! Από το 1926 μέχρι σήμερα, τέσσερις γενιές παιδιών της Περίστασης έμαθαν εδώ γράμματα, έπαιξαν στη μεγάλη μας αυλή και έκαναν τους καλύτερούς τους φίλους.",
        tags: [
          "\uD83D\uDCD6 Δανειστική & Ψηφιακή Βιβλιοθήκη",
          "\uD83E\uDD16 Υπολογιστές & Ρομποτική",
          "\uD83C\uDFCA Σκάκι & Κολύμβηση",
          "\uD83E\uDD1D Τμήμα Ένταξης & Ολοήμερο"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Έως το 1949 το σχολείο μας ανήκε στον Νομό Θεσσαλονίκης (δεν υπήρχε ακόμη Νομός Πιερίας)! Σήμερα διαθέτει Ψηφιακή Βιβλιοθήκη 350 βιβλίων και έχει κατακτήσει τη 2η θέση στο σκάκι στα Δημοτικά Κατερίνης!"
      },
       {
        icon: "\uD83D\uDCDA",
        img: customFacilityPhotos.gymnasio || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAfZQkygm2xNzKOLcqEseDlLIkugIjWypu9vUVnzZydKU2JPqRQA10mmKerWeNa2I8um3J2Zgz-A6S9QJUIy098gExMi-oF8w1uF6YPrOqgzrNFDtPLCt1vFc7xpx_XRqxPGFfkc_KfJQPFKOqMQjBWUorefK_3qeOP1r9cXUlgAykvCdXUyhtub7b6W4/s1600/2026-11-21%2017_51_18-NVIDIA%20GeForce%20Overlay.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAfZQkygm2xNzKOLcqEseDlLIkugIjWypu9vUVnzZydKU2JPqRQA10mmKerWeNa2I8um3J2Zgz-A6S9QJUIy098gExMi-oF8w1uF6YPrOqgzrNFDtPLCt1vFc7xpx_XRqxPGFfkc_KfJQPFKOqMQjBWUorefK_3qeOP1r9cXUlgAykvCdXUyhtub7b6W4/s1600/2026-11-21%2017_51_18-NVIDIA%20GeForce%20Overlay.png",
        imgCap: "Γυμνάσιο Περίστασης \u2022 Εργαστήρια Πειραμάτων & Τεχνολογίας",
        accent: "#4f46e5", border: "#a5b4fc", soft: "#eef2ff",
        badge: "\uD83D\uDD2C Το Επόμενο Σχολείο μας \u2022 Ολύμπου 2",
        title: "Γυμνάσιο Περίστασης: Εκεί που Μεγαλώνουμε!",
        story: "Μόλις τελειώσουμε την ΣΤ' Δημοτικού, μας περιμένει το Γυμνάσιο του χωριού μας! Ιδρύθηκε το 1981 (μέχρι τότε τα παιδιά πήγαιναν καθημερινά στην Κατερίνη, ενώ έως το 1994 φιλοξενήθηκε στο δικό μας σχολείο) και σήμερα έχει δικό του μεγάλο κτίριο με 14 αίθουσες.",
        tags: [
          "\uD83E\uDDEA 3 Εργαστήρια Πειραμάτων & Τεχνολογίας",
          "\uD83C\uDF0D Αγγλικά, Γαλλικά & Γερμανικά",
          "\uD83C\uDFC3 Μεγάλη Αυλή & Σκάμμα Άλματος",
          "\uD83D\uDC9A Εθελοντικές Δράσεις & Βιβλιοθήκη"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Στο Γυμνάσιο της Περίστασης έρχονται παιδιά από 5 περιοχές (Περίσταση, Σταθμό, Καλλιθέα, Παραλία και Ολυμπιακή Ακτή), οπότε θα γνωρίσεις ακόμα περισσότερους φίλους!"
      },
      {
        icon: "\uD83E\uDDF8",
        img: customFacilityPhotos.nipiagogeio || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgD1JAT71dp7bYkfE5m1etpzRaR6L9uHoiJkCICbUpNpJZKaSkzdSPsXOFUZe0R4FNF-oCHHBG5J822NI9IZVepN4JiprqMZ0Ikuio7CeFjED75BvfbqXFTf_-QZeyt6Q2NUTKrlEXuOiJKd55WciZLiO94UAHw8Um60Ro3ObrvbmRZ8OEg2bcsnad2JOc/s1841/2026-11-20%2022_43_09-NVIDIA%20GeForce%20Overlay.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgD1JAT71dp7bYkfE5m1etpzRaR6L9uHoiJkCICbUpNpJZKaSkzdSPsXOFUZe0R4FNF-oCHHBG5J822NI9IZVepN4JiprqMZ0Ikuio7CeFjED75BvfbqXFTf_-QZeyt6Q2NUTKrlEXuOiJKd55WciZLiO94UAHw8Um60Ro3ObrvbmRZ8OEg2bcsnad2JOc/s1841/2026-11-20%2022_43_09-NVIDIA%20GeForce%20Overlay.png",
        imgCap: "3/θέσιο Νηπιαγωγείο Περίστασης \u2022 Δημιουργία, Ζωγραφική & Παιχνίδι",
        accent: "#db2777", border: "#f9a8d4", soft: "#fdf2f8",
        badge: "\uD83C\uDFA8 Από το 1978 \u2022 Αγίου Γεωργίου 2",
        title: "3/θέσιο Νηπιαγωγείο: Τα Πρώτα μας Βήματα!",
        story: "Θυμάσαι τις πρώτες σου ζωγραφιές και τα πρώτα τραγούδια; Στο Νηπιαγωγείο της Περίστασης, με τις 3 φωτεινές τάξεις και την όμορφη αυλή, τα παιδιά 4 έως 6 ετών ετοιμάζονται με παιχνίδι και χαρά για το Δημοτικό!",
        tags: [
          "\uD83C\uDFB2 3 Φωτεινές Τάξεις Παιχνιδιού",
          "\uD83C\uDF33 Ασφαλής Αυλή 500 τ.μ.",
          "\uD83D\uDD24 Δημιουργικά Αγγλικά",
          "\uD83C\uDF89 Γιορτές & Παρελάσεις"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Σχεδόν όλοι οι μαθητές και οι μαθήτριες του Δημοτικού μας ξεκίνησαν τη σχολική τους ζωή από αυτήν ακριβώς την αυλή!"
      },
     {
        icon: "\uD83D\uDC76",
        img: customFacilityPhotos.paidikos || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirHtILoGD9_Tg5O6-chTXSgcX7I-Vz78KGZN6oF2UfwEuH7X1UQM6GfuxQikzRXCFyfjtJNkHBTC7VoWqQB892QW4Eq8dHWII08gLwrkaQrkeh9vVsOlOjOVIJZem3RMuRWl2dPULf-f3JOnj6UUchx6zEOnncNQ1b5slvcuxu2RH2GzFFzl7_GVqb3hw/s1600/2026-11-20%2022_48_27-NVIDIA%20GeForce%20Overlay.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirHtILoGD9_Tg5O6-chTXSgcX7I-Vz78KGZN6oF2UfwEuH7X1UQM6GfuxQikzRXCFyfjtJNkHBTC7VoWqQB892QW4Eq8dHWII08gLwrkaQrkeh9vVsOlOjOVIJZem3RMuRWl2dPULf-f3JOnj6UUchx6zEOnncNQ1b5slvcuxu2RH2GzFFzl7_GVqb3hw/s1600/2026-11-20%2022_48_27-NVIDIA%20GeForce%20Overlay.png",
        imgCap: "Δημοτικός Παιδικός Σταθμός Περίστασης \u2022 Η Πρώτη Αγκαλιά",
        accent: "#0284c7", border: "#7dd3fc", soft: "#f0f9ff",
        badge: "\uD83C\uDF7C Για τα πιο Μικρά Παιδάκια \u2022 Ολύμπου 2",
        title: "Δημοτικός Παιδικός Σταθμός: Η Πρώτη Αγκαλιά!",
        story: "Δίπλα στο Γυμνάσιο βρίσκεται το πιο γλυκό σχολείο της γειτονιάς μας! Εδώ τα μικρότερα παιδάκια του χωριού (πριν ακόμα πάνε Νηπιαγωγείο) μαθαίνουν να μοιράζονται, να τραγουδούν, να ζωγραφίζουν και να παίζουν ομαδικά.",
        tags: [
          "\uD83C\uDFB5 Τραγούδι & Παραμύθια",
          "\uD83E\uDD1D Ομαδικό Παιχνίδι & Φιλία",
          "\uD83C\uDF4E Φροντίδα & Υγιεινό Φαγητό",
          "\uD83D\uDC3E Δράσεις Αγάπης για τα Ζώα"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Η Περίσταση είναι από τα λίγα χωριά που έχουν όλες τις βαθμίδες: ένα παιδί ξεκινά από τον Παιδικό Σταθμό και φτάνει έως τα 15 του χρόνια στη δική του γειτονιά!"
      },
      {
        icon: "\u26BD",
        img: customFacilityPhotos.kleistoT9 || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhTrfOEeUF71XBy7LThTeyeTTZ8_ouC4FX7QkdMKWuNKqdYtlskoahoOrITsHtiRfEnDzm1DYLbhrgQQ0YCRRo1Q8sEN3NUc1U0Xkhu5dx9-3wZBqojMaEPnMTkpZ7uWxj_oIfz7HOMcCLuA0ewnnxN-QFAMkZVlmsXXlrnSbbQlG1nOFJJoMhSSHmb8VU/s1600/2026-11-20%2022_50_34-NVIDIA%20GeForce%20Overlay.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhTrfOEeUF71XBy7LThTeyeTTZ8_ouC4FX7QkdMKWuNKqdYtlskoahoOrITsHtiRfEnDzm1DYLbhrgQQ0YCRRo1Q8sEN3NUc1U0Xkhu5dx9-3wZBqojMaEPnMTkpZ7uWxj_oIfz7HOMcCLuA0ewnnxN-QFAMkZVlmsXXlrnSbbQlG1nOFJJoMhSSHmb8VU/s1600/2026-11-20%2022_50_34-NVIDIA%20GeForce%20Overlay.png",
        imgCap: "Κλειστό Γυμναστήριο Τ9 & Αθλητικές Εγκαταστάσεις Περίστασης",
        accent: "#059669", border: "#6ee7b7", soft: "#ecfdf5",
        badge: "\uD83C\uDFC5 2 Μεγάλα Αθλητικά Κέντρα \u2022 2.000+ Θέσεις!",
        title: "Οι Αθλητικές Εγκαταστάσεις της Γειτονιάς μας!",
        story: "Το χωριό μας αγαπάει πολύ τον αθλητισμό! Έχουμε το μεγάλο Γήπεδο Ποδοσφαίρου με σκεπαστή κερκίδα 1.000 θέσεων, αλλά και το Κλειστό Γυμναστήριο Τ9 (άνω των 1.000 θέσεων) για μπάσκετ, βόλεϊ και μεγάλους αγώνες!",
        tags: [
          "\u26BD Γήπεδο 1.000 Θέσεων",
          "\uD83C\uDFC0 Κλειστό Γυμναστήριο Τ9 (1.000+ Θέσεις)",
          "\uD83C\uDFBE Γήπεδα 5x5 & Τένις 1 χλμ.",
          "\u267F Ανελκυστήρες & Πρόσβαση για Όλους"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Το Κλειστό Γυμναστήριο Τ9 είναι το μοναδικό κλειστό γήπεδο σε όλη την Πιερία που μπορεί να φιλοξενήσει αγώνες επαγγελματικών κατηγοριών και πανελλήνια πρωταθλήματα!"
      },
      {
        icon: "\uD83C\uDFAD",
        img: customFacilityPhotos.syllogoi || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiPSih4FL7iCSgjnyoYvhyphenhyphenXPgy521JHyXarbMewj9HUEtzjS3fl1JT5r6PPMeZJKvW4Rdj4Lbijb-M3OnhbK8sCA-o7__liwPXTurBr9TPx9Cwx3PHKu18vtKcEA1ZrpD3TUUyY5lVQZnd9C6YBpQM0ZIvaRBImKmfpRm6gXHjK9AG_VfUohGmCgPNSB98/s1600/2026-11-20%2022_53_01-Android%20Device.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiPSih4FL7iCSgjnyoYvhyphenhyphenXPgy521JHyXarbMewj9HUEtzjS3fl1JT5r6PPMeZJKvW4Rdj4Lbijb-M3OnhbK8sCA-o7__liwPXTurBr9TPx9Cwx3PHKu18vtKcEA1ZrpD3TUUyY5lVQZnd9C6YBpQM0ZIvaRBImKmfpRm6gXHjK9AG_VfUohGmCgPNSB98/s1600/2026-11-20%2022_53_01-Android%20Device.png",
        imgCap: "Σύλλογος Ανατολικοθρακών & Εύξεινος Λέσχη Περίστασης",
        accent: "#d97706", border: "#fcd34d", soft: "#fffbeb",
        badge: "\uD83D\uDC83 Παράδοση & Χορός \u2022 Ολύμπου 2 & Μακεδονίας 1",
        title: "Οι Πολιτιστικοί Σύλλογοι του Χωριού μας!",
        story: "Δίπλα στον παιδικό σταθμό βρίσκεται ο Σύλλογος Ανατολικοθρακών (από το 1998) με χορευτικά τμήματα για παιδιά και μεγάλους, ενώ στην οδό Μακεδονίας 1 η Εύξεινος Λέσχη Περίστασης κρατά ζωντανή την ποντιακή παράδοση!",
        tags: [
          "\uD83D\uDC5F Παιδικά Χορευτικά Τμήματα",
          "\uD83C\uDF1F Το Έθιμο του Αγίου Μόδεστου",
          "\uD83C\uDFB6 Θρακιώτικοι & Ποντιακοί Χοροί"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Ήδη από το 1958 ο διευθυντής του σχολείου μας Κώστας Μοσχίδης κατέγραψε και διέσωσε σε βιβλίο τα θρακιώτικα έθιμα της Νέας Περίστασης, τα οποία κρατούν ολοζώντανα σήμερα οι Σύλλογοί μας!"
      },
      {
        icon: "\uD83C\uDFC6",
        img: customFacilityPhotos.gipedoAep || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhem0YTAbyft3JVlU9TGnM6JTH0vezjswsuumIS0CJ5ssqZX_MiEAfYjwSzz0qjazangq56oBm_zsEiQoODZwDz4FJmiCq-AAxI4srFAveSfug5HhXoLi421BUJcYAeJf7Np-Mc2Irjp6t0TqaZn4yp2H0Rt9L6CfaTZS00Fd8VUEXaVw8I0dD-rQxq9PA/s1964/2026-11-20%2022_55_31-NVIDIA%20GeForce%20Overlay.png",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhem0YTAbyft3JVlU9TGnM6JTH0vezjswsuumIS0CJ5ssqZX_MiEAfYjwSzz0qjazangq56oBm_zsEiQoODZwDz4FJmiCq-AAxI4srFAveSfug5HhXoLi421BUJcYAeJf7Np-Mc2Irjp6t0TqaZn4yp2H0Rt9L6CfaTZS00Fd8VUEXaVw8I0dD-rQxq9PA/s1964/2026-11-20%2022_55_31-NVIDIA%20GeForce%20Overlay.png",
        imgCap: "Γήπεδο Περίστασης & Ακαδημία Ποδοσφαίρου Α.Ε.Π.",
        accent: "#dc2626", border: "#fca5a5", soft: "#fef2f2",
        badge: "\u26BD Ιστορική Ομάδα από το 1968 & 1978 \u2022 Γήπεδο Περίστασης",
        title: "Α.Ε. Περίστασης: Η Ομάδα της Καρδιάς μας!",
        story: "Το 1968 το χωριό μας είχε δύο ομάδες, τον «Όλυμπο» και την «Αναγέννηση». Το 1978 ένωσαν τις δυνάμεις τους και γεννήθηκε η Α.Ε. Περίστασης! Έχει παιδική Ακαδημία ποδοσφαίρου και έχει κατακτήσει σπουδαία κύπελλα και πρωταθλήματα στην Πιερία (όπως το 2014 και το 2026!).",
        tags: [
          "\uD83E\uDD1D Ένωση 2 Ομάδων το 1978",
          "\uD83E\uDD47 Πρωταθλήτρια Πιερίας (2014 & 2026)",
          "\uD83D\uDC66 Παιδική Ακαδημία Ποδοσφαίρου",
          "\u2B50 Φυτώριο Μεγάλων Παικτών"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Από τα παιδικά τμήματα της Α.Ε. Περίστασης ξεκίνησαν να παίζουν μπάλα ο διεθνής ποδοσφαιριστής της Εθνικής Ελλάδας Αλέξανδρος Τζιόλης και ο επαγγελματίας Κώστας Γιαννούλης!"
      }
    ];

    var pfacListEl = document.getElementById("pfacPillsList");
    var pfacPills = document.querySelectorAll("#pfacPillsList li[data-fac]");
    var pfacStage = document.getElementById("pfacStage");
    var activeFacIdx = -1;

   var facMapMeta = [
      {
        cx: 548, cy: 178, steps: 0, crossRoad: false, crossPt: null,
        pts: [[548, 178]],
        safety: "\uD83D\uDEB8 Μπροστά από την αυλή μας περνά η οδός Μακεδονίας \u2014 περνάμε πάντα από τη διάβαση!",
        walk: "\uD83D\uDCCD Είμαστε εδώ! Το 12/θέσιο Δημοτικό Σχολείο μας στην οδό Μακεδονίας 13!"
      },
      {
        cx: 426, cy: 66, steps: 480, crossRoad: false, crossPt: [426, 248],
        pts: [[548, 178], [548, 248], [426, 248], [426, 66]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας \u279C Ολύμπου: Περπατάμε στο πεζοδρόμιο & προσέχουμε στη διασταύρωση!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Γυμνάσιο (Ολύμπου 2): ~6 λεπτά με τα πόδια!"
      },
      {
        cx: 612, cy: 68, steps: 320, crossRoad: false, crossPt: [676, 248],
        pts: [[548, 178], [548, 248], [676, 248], [676, 68], [612, 68]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας \u279C Αγ. Γεωργίου: Περπατάμε στο πεζοδρόμιο & ελέγχουμε στη γωνία!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C 3/Θ Νηπιαγωγείο (Αγ. Γεωργίου 2): ~4 λεπτά με τα πόδια!"
      },
      {
        cx: 352, cy: 104, steps: 400, crossRoad: false, crossPt: [426, 248],
        pts: [[548, 178], [548, 248], [426, 248], [426, 104], [352, 104]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας \u279C Ολύμπου: Κρατάμε το χέρι των μικρότερων παιδιών στο πεζοδρόμιο!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Παιδικός Σταθμός (Ολύμπου 2): ~5 λεπτά με τα πόδια!"
      },
      {
        cx: 88, cy: 110, steps: 2200, crossRoad: false, crossPt: [548, 248],
        pts: [[548, 178], [548, 248], [88, 248], [88, 110]],
        safety: "\uD83D\uDEB8 Μεγάλη διαδρομή προς Κατερίνη \u2014 πάμε πάντα με συνοδό στο πεζοδρόμιο ή με αυτοκίνητο!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Κλειστό Γυμναστήριο Τ9: ~20 λεπτά περπάτημα (ή 3' με \uD83D\uDE97)!"
      },
      {
        cx: 232, cy: 108, steps: 410, crossRoad: false, crossPt: [232, 248],
        pts: [[548, 178], [548, 248], [232, 248], [232, 108]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας: Προχωράμε στο πεζοδρόμιο & ελέγχουμε προσεκτικά στη διασταύρωση!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Σύλλογοι: ~5 λεπτά στην οδό Μακεδονίας!"
      },
     {
        cx: 865, cy: 96, steps: 430, crossRoad: true, crossPt: [676, 248],
        pts: [[548, 178], [548, 248], [768, 248], [768, 96], [865, 96]],
        safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΑΓ. ΓΕΩΡΓΙΟΥ: Ελέγχουμε αριστερά-δεξιά στη διασταύρωση (τη μπάλα την κρατάμε στην τσάντα)!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Γήπεδο Α.Ε. Περίστασης: ~5 λεπτά με τα πόδια!"
      }
    ];

    var mapWalkPath = null;
    var mapPulseRing = null;
    var mapWalkerEl = null;
    var mapWalkerFlipEl = null;
    var mapCrossAlertEl = null;
    var mapCrossIconEl = null;
    var walkAnimRaf = null;
    var activeSpecialNode = "";
    var mapStatusEl = null;
    var mapWrap = null;
    var mapModalBg = null;
    var mapPlaceholder = null;
    var mapZoomBtn = null;
    var isMapZoomed = false;
    var lastMapMsg = "\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 13) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!";
    var lastMapAction = "";
    var lastMapThumb = "";
    var lastMapThumbCap = "";
    var lastWalkMeta = null;

    function stopNeighborhoodWalkAnim() {
      if (walkAnimRaf) {
        cancelAnimationFrame(walkAnimRaf);
        walkAnimRaf = null;
      }
    }

    function setMapStatusHtml(msg, actionType, thumbUrl, thumbCap, walkMeta) {
      lastMapMsg = msg;
      lastMapAction = actionType || "";
      lastMapThumb = thumbUrl || "";
      lastMapThumbCap = thumbCap || "";
      lastWalkMeta = walkMeta || null;
      if (!mapStatusEl) return;
      var extraBtn = "";
     if (lastMapAction === "card") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-card="1">' + (isMapZoomed ? "\uD83D\uDCD6 Δες την Κάρτα \u279C" : "\uD83D\uDCD6 Δες την Κάρτα \u2193") + '</button>';
      } else if (lastMapAction === "churches") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-churches="1">\u26EA Άνοιξε τις Εκκλησίες \u279C</button>';
      }
     var thumbHtml = lastMapThumb
        ? '<img class="pfac-map-thumb" src="' + optImg(lastMapThumb, 320) + '" alt="' + escAttr(lastMapThumbCap) + '" data-map-thumb-zoom="1" title="Πάτησε για μεγέθυνση!"/>'
        : '';

      var metaHtml = "";
      if (lastWalkMeta) {
        var stTxt = lastWalkMeta.steps > 0
          ? ("\uD83D\uDC63 ~" + lastWalkMeta.steps + " παιδικά βήματα")
          : "\uD83C\uDFEB Αφετηρία: Αυλή Σχολείου (0 βήματα)";
        var sfCls = "pfac-safety-pill" + (lastWalkMeta.crossRoad ? " pfac-safety-pill--cross" : "");
        metaHtml =
          '<div class="pfac-walk-meta">' +
            '<span class="pfac-step-pill" id="pfacLiveStepBadge">' + stTxt + '</span>' +
            (lastWalkMeta.safety ? '<span class="' + sfCls + '">' + lastWalkMeta.safety + '</span>' : '') +
          '</div>';
      }

      mapStatusEl.innerHTML =
        '<div class="pfac-map-status-left">' +
          thumbHtml +
          '<div class="pfac-map-status-body"><div>' + msg + '</div>' + metaHtml + '</div>' +
        '</div>' +
        extraBtn;

      var thEl = mapStatusEl.querySelector("img");
      if (thEl) {
        thEl.onerror = function() { if (this.src !== fallbackSvg) this.src = fallbackSvg; };
      }
    }

    function runNeighborhoodWalk(cfg) {
      stopNeighborhoodWalkAnim();
      var pts = cfg.pts || [[548, 178]];
      if (mapPulseRing) {
        mapPulseRing.setAttribute("cx", String(cfg.cx));
        mapPulseRing.setAttribute("cy", String(cfg.cy));
        mapPulseRing.setAttribute("stroke", cfg.color || "#1e6cff");
        mapPulseRing.style.display = "";
      }

     if (mapCrossAlertEl) {
        if (cfg.crossPt) {
          mapCrossAlertEl.setAttribute("transform", "translate(" + cfg.crossPt[0] + "," + cfg.crossPt[1] + ")");
          if (mapCrossIconEl) mapCrossIconEl.textContent = cfg.crossRoad ? "\uD83D\uDEA6" : "\uD83D\uDEB8";
          mapCrossAlertEl.style.display = "";
          var cAnimG = mapCrossAlertEl.firstElementChild;
          if (cAnimG) {
            cAnimG.classList.remove("pfac-cross-anim");
            void mapCrossAlertEl.getBoundingClientRect();
            cAnimG.classList.add("pfac-cross-anim");
          }
        } else {
          mapCrossAlertEl.style.display = "none";
        }
      }

      if (pts.length < 2) {
        if (mapWalkPath) mapWalkPath.setAttribute("d", "");
        if (mapWalkerEl) {
          mapWalkerEl.style.display = "";
          mapWalkerEl.setAttribute("transform", "translate(592,184)");
          if (mapWalkerFlipEl) mapWalkerFlipEl.setAttribute("transform", "scale(1,1)");
        }
        return;
      }

      var segs = [];
      var totalLen = 0;
      for (var i = 0; i < pts.length - 1; i++) {
        var dx = pts[i + 1][0] - pts[i][0];
        var dy = pts[i + 1][1] - pts[i][1];
        var len = Math.sqrt(dx * dx + dy * dy);
        segs.push({ x0: pts[i][0], y0: pts[i][1], dx: dx, dy: dy, len: len, start: totalLen });
        totalLen += len;
      }

      var walkerStopDist = Math.max(0, totalLen - 25);
      var dur = Math.min(1300, Math.max(680, totalLen * 2.0));
      var stepBadgeEl = document.getElementById("pfacLiveStepBadge");
      var targetSteps = cfg.steps || 0;
      var t0 = performance.now();

      var pointAt = function(dist) {
        var d = Math.max(0, Math.min(totalLen, dist));
        for (var k = 0; k < segs.length; k++) {
          var sg = segs[k];
          if (d <= sg.start + sg.len || k === segs.length - 1) {
            var u = sg.len > 0 ? Math.min(1, (d - sg.start) / sg.len) : 1;
            return { x: sg.x0 + sg.dx * u, y: sg.y0 + sg.dy * u, dx: sg.dx };
          }
        }
        return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], dx: 0 };
      };

      var partialPath = function(dist) {
        var d = Math.max(0, Math.min(totalLen, dist));
        var pathStr = "M " + pts[0][0] + "," + pts[0][1];
        for (var k = 0; k < segs.length; k++) {
          var sg = segs[k];
          if (d >= sg.start + sg.len) {
            pathStr += " L " + (sg.x0 + sg.dx) + "," + (sg.y0 + sg.dy);
          } else if (d > sg.start) {
            var u = sg.len > 0 ? (d - sg.start) / sg.len : 0;
            pathStr += " L " + (sg.x0 + sg.dx * u).toFixed(1) + "," + (sg.y0 + sg.dy * u).toFixed(1);
            break;
          } else {
            break;
          }
        }
        return pathStr;
      };

      if (mapWalkerEl) mapWalkerEl.style.display = "";

      var frame = function(now) {
        var p = Math.min(1, (now - t0) / dur);
        var ease = 0.5 - 0.5 * Math.cos(Math.PI * p);

        if (mapWalkPath) {
          mapWalkPath.setAttribute("d", partialPath(ease * totalLen));
        }

        if (mapWalkerEl) {
          var wp = pointAt(Math.min(ease * totalLen, walkerStopDist));
          var bob = (p < 1) ? Math.sin(p * Math.PI * 10) * 2.2 : 0;
          mapWalkerEl.setAttribute("transform", "translate(" + wp.x.toFixed(1) + "," + (wp.y + bob).toFixed(1) + ")");
          if (mapWalkerFlipEl && Math.abs(wp.dx) > 1) {
            mapWalkerFlipEl.setAttribute("transform", wp.dx > 0 ? "scale(-1,1)" : "scale(1,1)");
          }
        }

        if (!stepBadgeEl || !stepBadgeEl.isConnected) {
          stepBadgeEl = document.getElementById("pfacLiveStepBadge");
        }
        if (stepBadgeEl && targetSteps > 0) {
          var curSt = (p >= 1) ? targetSteps : Math.max(5, Math.round((ease * targetSteps) / 5) * 5);
          stepBadgeEl.textContent = "\uD83D\uDC63 ~" + curSt + " παιδικά βήματα";
        }

        if (p < 1) {
          walkAnimRaf = requestAnimationFrame(frame);
        } else {
          walkAnimRaf = null;
        }
      };

      walkAnimRaf = requestAnimationFrame(frame);
    }

    function openMapZoom() {
      if (isMapZoomed || !mapWrap) return;
      pauseHeroVideo();
      if (isRegMapZoomed) closeRegMapZoom(true);
      if (!mapModalBg) {
        mapModalBg = document.createElement("div");
        mapModalBg.className = "pfac-map-modal-bg";
        document.body.appendChild(mapModalBg);
        var mapBgDown = false;
        mapModalBg.addEventListener("pointerdown", function(e) {
          mapBgDown = (e.isPrimary !== false && e.target === mapModalBg);
        }, { passive: true });
        mapModalBg.addEventListener("click", function(e) {
          if (mapBgDown && !isPinchZoomed() && e.target === mapModalBg) closeMapZoom(false);
          mapBgDown = false;
        });
      }
      if (!mapPlaceholder) {
        mapPlaceholder = document.createElement("div");
      }
      if (mapWrap.parentNode) {
        mapWrap.parentNode.insertBefore(mapPlaceholder, mapWrap);
      }
     isMapZoomed = true;
      mapModalBg.appendChild(mapWrap);
      mapWrap.classList.add("is-zoomed");
      mapModalBg.classList.add("is-open");
      lockBodyScroll();
      if (mapZoomBtn) mapZoomBtn.textContent = "\u2715 Κλείσιμο Μεγέθυνσης";
      setMapStatusHtml(lastMapMsg, lastMapAction, lastMapThumb, lastMapThumbCap, lastWalkMeta);

      if (!histMapOpen) {
        histMapOpen = true;
        try {
          window.history.pushState({ pfacMapZoom: true }, "", window.location.href);
        } catch (e) {}
      }
    }

    function closeMapZoom(fromPopState) {
      if (!isMapZoomed || !mapWrap) return;
      isMapZoomed = false;
      mapWrap.classList.remove("is-zoomed");
      if (mapModalBg) mapModalBg.classList.remove("is-open");
      if (mapPlaceholder && mapPlaceholder.parentNode) {
        mapPlaceholder.parentNode.insertBefore(mapWrap, mapPlaceholder);
      }
      unlockBodyScroll();
      if (mapZoomBtn) mapZoomBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";
      setMapStatusHtml(lastMapMsg, lastMapAction, lastMapThumb, lastMapThumbCap, lastWalkMeta);

      var needMapBack = (!fromPopState && histMapOpen);
      histMapOpen = false;
      if (needMapBack) safeHistoryBack(1);
    }

    var validFacExpKeys = ["fac0", "fac1", "fac2", "fac3", "fac4", "fac5", "fac6", "church", "square"];
    var exploredFacNodes = {};
    try {
      var savedFacExp = JSON.parse(localStorage.getItem("pfac_explored_9") || "null");
      if (savedFacExp && typeof savedFacExp === "object") exploredFacNodes = savedFacExp;
    } catch (e) {}

   function syncFacExploredBadge(justCompletedAll) {
      var badgeEl = document.getElementById("pfacExpBadge");
      var rstEl = document.getElementById("pfacExpReset");
      var winEl = document.getElementById("pfacExpWinBanner");
      var cnt = 0;
      for (var i = 0; i < validFacExpKeys.length; i++) {
        if (exploredFacNodes[validFacExpKeys[i]]) cnt++;
      }
      if (badgeEl) {
        badgeEl.textContent = (cnt === 9 ? "\uD83C\uDFC6 " : "\uD83D\uDDFA\uFE0F ") + "Εξερεύνησες " + cnt + "/9 σημεία" + (cnt === 9 ? "!" : "");
        badgeEl.classList.toggle("is-done", cnt === 9);
      }
      if (rstEl) rstEl.style.display = cnt > 0 ? "inline-block" : "none";
      if (winEl) {
        if (cnt < 9) winEl.classList.remove("is-vis");
        else if (justCompletedAll) winEl.classList.add("is-vis");
      }
      if (mapWrap) {
        mapWrap.querySelectorAll(".pfac-map-node").forEach(function(nd) {
          var key = nd.hasAttribute("data-map-church") ? "church"
            : (nd.hasAttribute("data-map-square") ? "square" : ("fac" + nd.getAttribute("data-map-fac")));
          var chk = nd.querySelector(".pfac-node-check");
          var isExp = !!exploredFacNodes[key];
          if (isExp && !chk) {
            var circ = nd.querySelector("circle");
            if (circ) {
              var cx = parseFloat(circ.getAttribute("cx")) || 0;
              var cy = parseFloat(circ.getAttribute("cy")) || 0;
              var r = parseFloat(circ.getAttribute("r")) || 22;
              var svgNs = "http://www.w3.org/2000/svg";
              chk = document.createElementNS(svgNs, "g");
              chk.setAttribute("class", "pfac-node-check");
              chk.setAttribute("transform", "translate(" + (cx + r * 0.72).toFixed(1) + "," + (cy - r * 0.68).toFixed(1) + ")");
              chk.style.pointerEvents = "none";
              var bgC = document.createElementNS(svgNs, "circle");
              bgC.setAttribute("r", "8.5");
              bgC.setAttribute("fill", "#16a34a");
              bgC.setAttribute("stroke", "#ffffff");
              bgC.setAttribute("stroke-width", "2");
              var tick = document.createElementNS(svgNs, "path");
              tick.setAttribute("d", "M -3.5,0.2 L -0.9,2.8 L 3.8,-2.4");
              tick.setAttribute("fill", "none");
              tick.setAttribute("stroke", "#ffffff");
              tick.setAttribute("stroke-width", "2.2");
              tick.setAttribute("stroke-linecap", "round");
              tick.setAttribute("stroke-linejoin", "round");
              chk.appendChild(bgC);
              chk.appendChild(tick);
              nd.appendChild(chk);
            }
          } else if (chk) {
            chk.style.display = isExp ? "" : "none";
          }
        });
      }
    }

    function markFacExplored(key) {
      if (!key || validFacExpKeys.indexOf(key) === -1) return;
      var wasNew = !exploredFacNodes[key];
      if (wasNew) {
        exploredFacNodes[key] = true;
        try { localStorage.setItem("pfac_explored_9", JSON.stringify(exploredFacNodes)); } catch (e) {}
      }
      var allDone = true;
      for (var i = 0; i < validFacExpKeys.length; i++) {
        if (!exploredFacNodes[validFacExpKeys[i]]) { allDone = false; break; }
      }
      syncFacExploredBadge(wasNew && allDone);
    }

    if (pfacListEl && pfacListEl.parentNode && !document.getElementById("pfacMapSvg")) {
      mapWrap = document.createElement("div");
      mapWrap.className = "pfac-map-wrap";
      mapWrap.innerHTML =
        '<div class="pfac-map-head">' +
          '<div class="pfac-map-title-group">' +
            '<strong>\uD83D\uDDFA\uFE0F Παιδικός Χάρτης της Γειτονιάς μας</strong>' +
            '<span class="pfac-exp-wrap">' +
              '<span class="pfac-exp-badge" id="pfacExpBadge">\uD83D\uDDFA\uFE0F Εξερεύνησες 0/9 σημεία</span>' +
              '<button type="button" class="pfac-exp-reset" id="pfacExpReset" style="display:none" title="Μηδενισμός εξερεύνησης">\u21BA</button>' +
            '</span>' +
          '</div>' +
          '<div class="pfac-map-head-right">' +
            '<span style="font-size:12.5px;color:#166534">\uD83D\uDC46 Πάτησε σε κτίριο για διαδρομή &amp; βήματα ή στον χάρτη για μεγέθυνση!</span>' +
            '<button type="button" class="pfac-map-zoom-btn pfac-map-macro-btn" id="pfacToMacroBtn">\uD83D\uDDFA\uFE0F Χάρτης Νομού \u2191</button>' +
            '<button type="button" class="pfac-map-zoom-btn" id="pfacMapZoomBtn">\uD83D\uDD0D Μεγέθυνση Χάρτη</button>' +
          '</div>' +
        '</div>' +
        '<div class="pfac-exp-win" id="pfacExpWinBanner">' +
          '<span>\uD83C\uDFC6 Μπράβο! Εξερεύνησες και τα 9 σημεία της γειτονιάς μας \u2014 είσαι Επίσημος Ξεναγός της Περίστασης!</span>' +
          '<button type="button" class="pfac-exp-win-close" data-exp-win-close="1" title="Κλείσιμο">\u2715</button>' +
        '</div>' +
        '<svg class="pfac-map-svg" id="pfacMapSvg" viewBox="0 0 960 410" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" role="img" aria-label="Σχηματικός χάρτης υποδομών Περίστασης">' +
          '<rect width="960" height="410" fill="#ecfdf5"/>' +
          '<rect x="24" y="62" width="128" height="122" rx="16" fill="#dcfce7" stroke="#86efac" stroke-width="2"/>' +
          '<rect x="162" y="62" width="140" height="128" rx="16" fill="#fef3c7" stroke="#fcd34d" stroke-width="2"/>' +
          '<rect x="312" y="18" width="158" height="148" rx="18" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2"/>' +
          '<rect x="476" y="120" width="144" height="96" rx="16" fill="#dbeafe" stroke="#60a5fa" stroke-width="2.2"/>' +
          '<rect x="552" y="20" width="110" height="92" rx="16" fill="#fdf2f8" stroke="#f9a8d4" stroke-width="2"/>' +
          '<rect x="792" y="46" width="146" height="118" rx="16" fill="#dcfce7" stroke="#4ade80" stroke-width="2"/>' +
          '<rect x="808" y="60" width="114" height="68" rx="6" fill="none" stroke="#86efac" stroke-width="1.6"/>' +
          '<rect x="456" y="292" width="140" height="104" rx="16" fill="#eef2ff" stroke="#a5b4fc" stroke-width="2"/>' +
          '<rect x="646" y="292" width="156" height="104" rx="16" fill="#fef9c3" stroke="#fde047" stroke-width="2"/>' +
          '<path d="M 88,248 L 88,110 M 232,248 L 232,108 M 426,392 L 426,66 M 426,104 L 352,104 M 548,248 L 548,178 M 676,248 L 676,56 M 676,68 L 612,68 M 768,248 L 768,64 M 676,96 L 865,96 M 526,248 L 526,336 M 621,248 L 621,392 M 724,248 L 724,336 M 836,248 L 836,392 M 836,363 L 938,363" fill="none" stroke="#94a3b8" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M 621,169 L 768,169" fill="none" stroke="#94a3b8" stroke-width="22" stroke-linecap="butt"/>' +
          '<path d="M 22,248 L 938,248" stroke="#94a3b8" stroke-width="32" stroke-linecap="round"/>' +
          '<path d="M 88,248 L 88,110 M 232,248 L 232,108 M 426,392 L 426,66 M 426,104 L 352,104 M 548,248 L 548,178 M 676,248 L 676,56 M 676,68 L 612,68 M 768,248 L 768,64 M 676,96 L 865,96 M 526,248 L 526,336 M 621,248 L 621,392 M 724,248 L 724,336 M 836,248 L 836,392 M 836,363 L 938,363" fill="none" stroke="#cbd5e1" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M 621,169 L 768,169" fill="none" stroke="#cbd5e1" stroke-width="18" stroke-linecap="butt"/>' +
          '<path d="M 22,248 L 938,248" stroke="#cbd5e1" stroke-width="28" stroke-linecap="round"/>' +
          '<path d="M 36,248 L 924,248" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="9,9"/>' +
         '<g opacity="0.88" stroke="#ffffff" stroke-width="3.2" stroke-linecap="butt">' +
            '<line x1="528" y1="236" x2="546" y2="236"/><line x1="528" y1="242" x2="546" y2="242"/><line x1="528" y1="248" x2="546" y2="248"/><line x1="528" y1="254" x2="546" y2="254"/><line x1="528" y1="260" x2="546" y2="260"/>' +
            '<line x1="715" y1="236" x2="733" y2="236"/><line x1="715" y1="242" x2="733" y2="242"/><line x1="715" y1="248" x2="733" y2="248"/><line x1="715" y1="254" x2="733" y2="254"/><line x1="715" y1="260" x2="733" y2="260"/>' +
            '<line x1="668.5" y1="219" x2="668.5" y2="233"/><line x1="673.5" y1="219" x2="673.5" y2="233"/><line x1="678.5" y1="219" x2="678.5" y2="233"/><line x1="683.5" y1="219" x2="683.5" y2="233"/>' +
          '</g>' +
          '<text class="pfac-map-road-lbl" x="328" y="253" text-anchor="middle" fill="#1e293b" font-size="13" font-weight="900">ΟΔΟΣ ΜΑΚΕΔΟΝΙΑΣ</text>' +
          '<text class="pfac-map-road-lbl" x="426" y="182" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="800" transform="rotate(-90 426 182)">Οδός Ολύμπου</text>' +
          '<text class="pfac-map-road-lbl" x="676" y="176" text-anchor="middle" fill="#334155" font-size="11.5" font-weight="800" transform="rotate(-90 676 176)">Αγ. Γεωργίου</text>' +
          '<text class="pfac-map-lbl" x="26" y="222" text-anchor="start" fill="#b45309" font-size="13" font-weight="900">\u2B05 Κατερίνη (Δ)</text>' +
          '<text class="pfac-map-lbl" x="934" y="222" text-anchor="end" fill="#0369a1" font-size="13" font-weight="900">Παραλία (Α) \u27A1</text>' +
          '<circle cx="924" cy="30" r="19" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>' +
          '<text x="924" y="35" text-anchor="middle" fill="#dc2626" font-size="12.5" font-weight="900">Β\u2191</text>' +
          '<rect x="74" y="322" width="292" height="34" rx="17" fill="#dcfce7" stroke="#86efac" stroke-width="1.8"/>' +
          '<text x="220" y="344" text-anchor="middle" fill="#166534" font-size="13" font-weight="800">\uD83C\uDF33 Γειτονιές &amp; Κάμπος Περίστασης</text>' +
          '<path id="pfacMapWalkLine" d="" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10,7"/>' +
          '<circle id="pfacMapPulse" cx="548" cy="178" r="29" fill="none" stroke="#1e6cff" stroke-width="4" style="display:none"/>' +
          '<g class="pfac-map-node" data-map-fac="4" role="button" tabindex="0">' +
            '<circle cx="88" cy="110" r="22" fill="#059669" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="88" y="117" text-anchor="middle" font-size="18">\uD83C\uDFC0</text>' +
            '<text class="pfac-map-lbl" x="88" y="152" text-anchor="middle" fill="#064e3b" font-size="12.5" font-weight="900">Κλειστό Γυμναστ.</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="5" role="button" tabindex="0">' +
            '<circle cx="232" cy="108" r="22" fill="#d97706" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="232" y="115" text-anchor="middle" font-size="18">\uD83C\uDFAD</text>' +
            '<text class="pfac-map-lbl" x="232" y="164" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">Σύλλογοι</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="3" role="button" tabindex="0">' +
            '<circle cx="352" cy="104" r="21" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="352" y="111" text-anchor="middle" font-size="17.5">\uD83D\uDC76</text>' +
            '<text class="pfac-map-lbl" x="352" y="144" text-anchor="middle" fill="#0c4a6e" font-size="12" font-weight="900">Παιδικός Σταθμός</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="1" role="button" tabindex="0">' +
            '<circle cx="426" cy="66" r="22" fill="#4f46e5" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="426" y="73" text-anchor="middle" font-size="18">\uD83D\uDCDA</text>' +
            '<text class="pfac-map-lbl" x="426" y="36" text-anchor="middle" fill="#1e1b4b" font-size="13" font-weight="900">Γυμνάσιο</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="2" role="button" tabindex="0">' +
            '<circle cx="612" cy="68" r="21" fill="#db2777" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="612" y="75" text-anchor="middle" font-size="17.5">\uD83E\uDDF8</text>' +
            '<text class="pfac-map-lbl" x="612" y="106" text-anchor="middle" fill="#831843" font-size="12" font-weight="900">3/Θ Νηπιαγωγείο</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="6" role="button" tabindex="0">' +
            '<circle cx="865" cy="96" r="22" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="865" y="103" text-anchor="middle" font-size="18">\uD83C\uDFC6</text>' +
            '<text class="pfac-map-lbl" x="865" y="142" text-anchor="middle" fill="#7f1d1d" font-size="12.5" font-weight="900">Γήπεδο Α.Ε.Π.</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="0" role="button" tabindex="0">' +
            '<circle cx="548" cy="178" r="25" fill="#1e6cff" stroke="#fde047" stroke-width="4"/>' +
            '<text x="548" y="186" text-anchor="middle" font-size="21">\uD83C\uDFEB</text>' +
            '<rect x="472" y="124" width="152" height="23" rx="11.5" fill="#1e6cff"/>' +
            '<text x="548" y="140" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="900">\u2B50 12/Θ Δημοτικό μας!</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-church="1" role="button" tabindex="0">' +
            '<circle cx="526" cy="336" r="22" fill="#4f46e5" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="526" y="343" text-anchor="middle" font-size="18">\u26EA</text>' +
            '<text class="pfac-map-lbl" x="526" y="378" text-anchor="middle" fill="#312e81" font-size="13" font-weight="900">Αη-Γιώργης</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-square="1" role="button" tabindex="0">' +
            '<circle cx="724" cy="336" r="22" fill="#16a34a" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="724" y="343" text-anchor="middle" font-size="18">\uD83C\uDF33</text>' +
            '<text class="pfac-map-lbl" x="724" y="378" text-anchor="middle" fill="#14532d" font-size="13" font-weight="900">Πλατεία</text>' +
          '</g>' +
          '<g id="pfacCrossAlert" style="display:none;pointer-events:none" transform="translate(537,248)">' +
            '<g class="pfac-cross-anim">' +
              '<circle cy="-24" r="13" fill="#fef3c7" stroke="#dc2626" stroke-width="2.2"/>' +
              '<text id="pfacCrossIcon" y="-19" text-anchor="middle" font-size="13">\uD83D\uDEB8</text>' +
            '</g>' +
          '</g>' +
          '<g id="pfacStudentWalker" style="pointer-events:none" transform="translate(592,184)">' +
            '<circle r="15" fill="#ffffff" stroke="#1e6cff" stroke-width="2.6"/>' +
            '<g id="pfacWalkerFlip"><text y="5.5" text-anchor="middle" font-size="15.5">\uD83D\uDEB6</text></g>' +
          '</g>' +
        '</svg>' +
        '<div class="pfac-map-status" id="pfacMapStatus"><span>\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 13) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!</span></div>';

      pfacListEl.parentNode.insertBefore(mapWrap, pfacListEl);
      mapWalkPath = document.getElementById("pfacMapWalkLine");
      mapPulseRing = document.getElementById("pfacMapPulse");
      mapWalkerEl = document.getElementById("pfacStudentWalker");
      mapWalkerFlipEl = document.getElementById("pfacWalkerFlip");
      mapCrossAlertEl = document.getElementById("pfacCrossAlert");
      mapCrossIconEl = document.getElementById("pfacCrossIcon");
     mapStatusEl = document.getElementById("pfacMapStatus");
      mapZoomBtn = document.getElementById("pfacMapZoomBtn");
      syncFacExploredBadge();

      if (mapZoomBtn) {
        mapZoomBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (isMapZoomed) closeMapZoom(false);
          else openMapZoom();
        });
      }

      var triggerMapNode = function(node) {
        if (!node) return;
        if (node.hasAttribute("data-map-church")) {
          markFacExplored("church");
          if (activeSpecialNode === "church") {
            window.openPeristasiModal("churches");
            return;
          }
          closeFacilityCard();
          activeSpecialNode = "church";
          var chMsg = "\u26EA Διαδρομή από το Δημοτικό \u279C Ι.Ν. Αγίου Γεωργίου & Μοδέστου: απέναντι από την αυλή μας! (Ξαναπάτησε για τις Εκκλησίες)";
          var chImg = churchesData[0] ? churchesData[0].img : "";
          var chCap = churchesData[0] ? churchesData[0].caption : "";
          var chWalkMeta = {
            steps: 150,
            crossRoad: true,
            safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Σταματάμε, κοιτάμε αριστερά-δεξιά-αριστερά & περνάμε απέναντι!"
          };
          setMapStatusHtml(chMsg, "churches", chImg, chCap, chWalkMeta);
          runNeighborhoodWalk({
            cx: 526, cy: 336, color: "#4f46e5", steps: 150,
            crossRoad: true, crossPt: [537, 248],
            pts: [[548, 178], [548, 248], [526, 248], [526, 336]]
          });
          return;
        }
        if (node.hasAttribute("data-map-square")) {
          markFacExplored("square");
          closeFacilityCard();
          activeSpecialNode = "square";
          var sqWalkMeta = {
            steps: 210,
            crossRoad: true,
            safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Ελέγχουμε προσεκτικά και τις δύο κατευθύνσεις στη διάβαση!"
          };
          setMapStatusHtml("\uD83C\uDF33 Διαδρομή από το Δημοτικό \u279C Πλατεία Χωριού: ~2 λεπτά με τα πόδια για βόλτα και παιχνίδι!", "", "", "", sqWalkMeta);
          runNeighborhoodWalk({
            cx: 724, cy: 336, color: "#16a34a", steps: 210,
            crossRoad: true, crossPt: [724, 248],
            pts: [[548, 178], [548, 248], [724, 248], [724, 336]]
          });
          return;
        }
        if (node.hasAttribute("data-map-fac")) {
          activeSpecialNode = "";
          var fIdx = Number(node.getAttribute("data-map-fac"));
          if (fIdx === activeFacIdx) {
            syncNeighborhoodMap(fIdx);
            return;
          }
          openFacilityCard(fIdx, false);
        }
      };

      var mapNodeEls = mapWrap.querySelectorAll(".pfac-map-node");
      var pfacDownPt = null;
      var pfacMultiTouch = false;
      mapWrap.addEventListener("touchstart", function(e) {
        pfacMultiTouch = !!(e.touches && e.touches.length > 1);
      }, { passive: true });
      mapWrap.addEventListener("touchmove", function(e) {
        if (e.touches && e.touches.length > 1) pfacMultiTouch = true;
      }, { passive: true });
      mapWrap.addEventListener("pointerdown", function(e) {
        if (e.isPrimary === false) { pfacMultiTouch = true; pfacDownPt = null; return; }
        pfacMultiTouch = false;
        pfacDownPt = { x: e.clientX, y: e.clientY };
      }, { passive: true });

    mapWrap.addEventListener("click", function(e) {
        if (e.target.closest("[data-exp-win-close]")) {
          e.stopPropagation();
          var wEl = document.getElementById("pfacExpWinBanner");
          if (wEl) wEl.classList.remove("is-vis");
          return;
        }
        if (e.target.closest("#pfacExpReset")) {
          e.stopPropagation();
          exploredFacNodes = {};
          try { localStorage.removeItem("pfac_explored_9"); } catch (err) {}
          syncFacExploredBadge();
          return;
        }
        if (e.target.closest("[data-map-thumb-zoom]") && lastMapThumb) {
          e.stopPropagation();
          openSinglePhotoZoom(lastMapThumb, lastMapThumbCap, optImg(lastMapThumb, 320));
          return;
        }
        if (e.target.closest("[data-map-goto-card]")) {
          if (activeFacIdx === -1) openFacilityCard(0, false);
          if (isMapZoomed) {
            var hadMapHist = histMapOpen;
            closeMapZoom(false);
            if (pfacStage) {
              runAfterBack(hadMapHist, function() {
                pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
              });
            }
          } else if (pfacStage) {
            pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          return;
        }
        if (e.target.closest("[data-map-goto-churches]")) {
          window.openPeristasiModal("churches");
          return;
        }
       var draggedMap = !!(pfacDownPt && (Math.abs(e.clientX - pfacDownPt.x) > 6 || Math.abs(e.clientY - pfacDownPt.y) > 6));
        if (!draggedMap && !pfacMultiTouch) {
          var nd = e.target.closest(".pfac-map-node");
          if (!nd && e.target.closest("#pfacMapSvg")) {
            nd = findClosestEl(mapNodeEls, e.clientX, e.clientY, 22, "circle");
          }
          if (nd) {
            triggerMapNode(nd);
            return;
          }
        }
        if (!isMapZoomed && !pfacMultiTouch && !draggedMap && !isPinchZoomed() && e.target.closest("#pfacMapSvg")) {
          openMapZoom();
        }
      });

      mapWrap.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          var nd = e.target.closest(".pfac-map-node");
          if (nd) {
            e.preventDefault();
            triggerMapNode(nd);
          }
        }
      });
    }

   function syncNeighborhoodMap(idx, skipMark) {
      if (!mapWalkPath || !mapPulseRing || !mapStatusEl) return;
      activeSpecialNode = "";
      if (idx < 0 || !facMapMeta[idx]) {
        stopNeighborhoodWalkAnim();
        mapWalkPath.setAttribute("d", "");
        mapPulseRing.style.display = "none";
        if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
        if (mapWalkerEl) {
          mapWalkerEl.style.display = "";
          mapWalkerEl.setAttribute("transform", "translate(592,184)");
        }
        setMapStatusHtml("\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 13) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!", "", "", "", null);
        return;
      }
      if (!skipMark) markFacExplored("fac" + idx);
      var m = facMapMeta[idx];
      var fItem = facilitiesData[idx];
      setMapStatusHtml(m.walk, "card", fItem.img, fItem.imgCap || fItem.title, {
        steps: m.steps,
        crossRoad: m.crossRoad,
        safety: m.safety
      });
      runNeighborhoodWalk({
        cx: m.cx, cy: m.cy, color: fItem.accent,
        steps: m.steps, crossRoad: m.crossRoad, crossPt: m.crossPt, pts: m.pts
      });
    }

    function closeFacilityCard() {
      activeFacIdx = -1;
      if (pfacStage) pfacStage.innerHTML = "";
      pfacPills.forEach(function(li) {
        li.classList.remove("is-active");
      });
      syncNeighborhoodMap(-1);
    }

    function openFacilityCard(idx, shouldScroll) {
      if (!pfacStage) return;
      var cleanIdx = (idx + facilitiesData.length) % facilitiesData.length;

     if (cleanIdx === activeFacIdx && shouldScroll) {
        var stR = pfacStage.getBoundingClientRect();
        var isCardVis = (stR.height > 0 && stR.top < window.innerHeight - 70 && stR.bottom > 70);
        if (isCardVis) {
          closeFacilityCard();
        } else {
          pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }
      activeFacIdx = cleanIdx;
      var item = facilitiesData[cleanIdx];

      pfacPills.forEach(function(li) {
        var isCurrent = (Number(li.getAttribute("data-fac")) === cleanIdx);
        li.classList.toggle("is-active", isCurrent);
        if (isCurrent) {
          li.style.setProperty("--pfac-accent", item.accent);
        }
      });

      syncNeighborhoodMap(cleanIdx);

      var tagsHtml = item.tags.map(function(t) {
        return '<span class="pfac-tag">' + t + '</span>';
      }).join("");

     var cardThumbSrc = optImg(item.img, 640);
     var photoBlockHtml = item.img
        ? '<div class="pfac-card-photo-wrap">' +
            '<img class="pfac-card-photo" id="pfacCardImg" src="' + cardThumbSrc + '" alt="' + escAttr(item.imgCap || item.title) + '" loading="lazy"/>' +
            '<div class="pfac-card-photo-cap">\uD83D\uDD0D Πάτησε για μεγέθυνση</div>' +
          '</div>'
        : '';

     var stepMeta = facMapMeta[cleanIdx];
      var showOnMapLbl = (cleanIdx === 0)
        ? "\uD83D\uDCCD Δες το Σχολείο μας στον Παιδικό Χάρτη \u2191"
        : ("\uD83D\uDCCD Δες τη διαδρομή" + (stepMeta && stepMeta.steps ? " (~" + stepMeta.steps + " βήματα)" : "") + " στον Χάρτη \u2191");
      var mirrorExtraHtml =
        '<div class="pfac-card-actions">' +
          '<button type="button" class="pfac-show-map-btn" id="pfacShowOnMapBtn">' + showOnMapLbl + '</button>' +
          (cleanIdx === 0 ? '<button type="button" class="pfac-mirror-btn" id="pfacOpenMirrorBtn">\uD83E\uDE9E Μία Μέρα στο Σχολείο: 1926 vs 2026 (Καθρέφτης 100 Χρόνων!)</button>' : '') +
        '</div>' +
        (cleanIdx === 0 ? '<div id="pfacMirrorStage" style="display:none"></div>' : '');

      pfacStage.innerHTML =
        '<div class="pfac-card" style="--pfac-accent:' + item.accent + '; --pfac-border:' + item.border + '; --pfac-soft:' + item.soft + ';">' +
          '<div class="pfac-top">' +
            '<span class="pfac-badge">' + item.badge + '</span>' +
            '<button type="button" class="pfac-close" id="pfacCloseBtn" title="Κλείσιμο">\u2715</button>' +
          '</div>' +
          '<div class="pfac-title-row">' +
            '<span class="pfac-big-icon">' + item.icon + '</span>' +
            '<h4 class="pfac-title">' + item.title + '</h4>' +
          '</div>' +
          '<div class="pfac-photo-row">' +
            photoBlockHtml +
            '<div class="pfac-story-col">' +
              '<div class="pfac-story">' + item.story + '</div>' +
              '<div class="pfac-tags" style="margin-top:8px">' + tagsHtml + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="pfac-fact">' + item.fact + '</div>' +
          mirrorExtraHtml +
          '<div class="pfac-nav">' +
            '<button type="button" class="pfac-nav-btn" id="pfacPrevBtn">\u2B05\uFE0F Προηγούμενο</button>' +
            '<span class="pfac-count">' + (cleanIdx + 1) + ' από ' + facilitiesData.length + '</span>' +
            '<button type="button" class="pfac-nav-btn" id="pfacNextBtn">Επόμενο \u27A1\uFE0F</button>' +
          '</div>' +
        '</div>';

     var cardImgEl = document.getElementById("pfacCardImg");
      if (cardImgEl) {
        var cErrStep = 0;
        cardImgEl.onerror = function() {
          if (cErrStep === 0 && item.img && item.img !== cardThumbSrc) {
            cErrStep = 1;
            this.src = item.img;
          } else if (cErrStep <= 1 && item.fallbackImg && item.fallbackImg !== item.img) {
            cErrStep = 2;
            this.src = item.fallbackImg;
          } else {
            this.onerror = null;
            if (this.parentNode) this.parentNode.style.display = "none";
          }
        };
      }

      var nextFac = facilitiesData[(cleanIdx + 1) % facilitiesData.length];
      var prevFac = facilitiesData[(cleanIdx - 1 + facilitiesData.length) % facilitiesData.length];
      if (nextFac && nextFac.img) preloadImg(optImg(nextFac.img, 640));
      if (prevFac && prevFac.img) preloadImg(optImg(prevFac.img, 640));

      if (shouldScroll) {
        requestAnimationFrame(function() {
          var rect = pfacStage.getBoundingClientRect();
          var limitBottom = (modalBody && modalBody.contains(pfacStage))
            ? modalBody.getBoundingClientRect().bottom
            : window.innerHeight;
          if (rect.bottom > limitBottom) {
            pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      }
    }

    if (pfacStage) {
      pfacStage.addEventListener("click", function(e) {
        if (e.target.closest("#pfacCardImg") && activeFacIdx >= 0) {
          var fList = facilitiesData.map(function(f) {
            return { src: f.img, thumb: optImg(f.img, 640), caption: f.imgCap || f.title };
          });
          openZoomWithList(fList, activeFacIdx);
          return;
        }
        var btn = e.target.closest("button");
        if (!btn) return;
       if (btn.id === "pfacCloseBtn") closeFacilityCard();
        else if (btn.id === "pfacPrevBtn") openFacilityCard(activeFacIdx - 1, false);
        else if (btn.id === "pfacNextBtn") openFacilityCard(activeFacIdx + 1, false);
        else if (btn.id === "pfacShowOnMapBtn") {
          if (mapWrap && activeFacIdx !== -1) {
            mapWrap.scrollIntoView({ behavior: "smooth", block: "center" });
            mapWrap.classList.add("is-bridge-glow");
            setTimeout(function() { mapWrap.classList.remove("is-bridge-glow"); }, 1900);
            var replayIdx = activeFacIdx;
            setTimeout(function() {
              if (activeFacIdx === replayIdx) syncNeighborhoodMap(replayIdx, true);
            }, 340);
          }
        } else if (btn.id === "pfacOpenMirrorBtn") {
          var mStage = document.getElementById("pfacMirrorStage");
          if (!mStage) return;
          if (mStage.style.display === "block") {
            mStage.style.display = "none";
            mStage.innerHTML = "";
          } else {
            mStage.style.display = "block";
            renderSchoolMirror(mStage, function() {
              mStage.style.display = "none";
              mStage.innerHTML = "";
            });
            requestAnimationFrame(function() {
              mStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          }
        }
      });
      bindSwipe(
        pfacStage,
        function() { if (activeFacIdx !== -1) openFacilityCard(activeFacIdx + 1, false); },
        function() { if (activeFacIdx !== -1) openFacilityCard(activeFacIdx - 1, false); }
      );
    }

    pfacPills.forEach(function(li) {
      li.addEventListener("click", function() {
        openFacilityCard(Number(li.getAttribute("data-fac")), true);
      });
      li.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFacilityCard(Number(li.getAttribute("data-fac")), true);
        }
      });
    });

  function upgradeRegionalMap() {
      var oldLink = document.querySelector(".village-identity > a.image-link");
      if (!oldLink || document.getElementById("pregMapWrap")) return;
      var origImg = oldLink.querySelector("img");
      var origImgSrc = origImg ? (origImg.getAttribute("data-src") || origImg.getAttribute("src") || "") : "";
      var fullMapUrl = oldLink.getAttribute("href") || origImgSrc;
      var fallbackMapUrl = (origImgSrc && origImgSrc.indexOf("data:") !== 0) ? origImgSrc : fullMapUrl;
      if (!fullMapUrl) return;
     var isSmallViewport = !!(window.matchMedia && window.matchMedia("(max-width: 700px)").matches);
      var crispMapUrl = optImg(fullMapUrl, isSmallViewport ? 960 : 1280);
      var hiResMapUrl = optImg(fullMapUrl, isSmallViewport ? 1440 : 2000);

      var Z_SCALE = 1.65, Z_TX = -6.0, Z_TY = -35.0;
     var schoolOrigin = { x: 33.4, y: 41.8 };
      var regPins = [
        {
          id: "school",
          icon: "\uD83C\uDFEB",
          short: "12/Θ Δημοτικό",
          color: "#dc2626",
          home: true,
          inPieria: true,
          px: 33.4, py: 41.8,
          layers: ["neighbors", "ancestors", "horizon"],
          title: "\uD83D\uDCCD 12/Θ Δημοτικό Σχολείο Περίστασης (Η Κόκκινη Πινέζα μας!)",
          dist: "0 χλμ (Αφετηρία!)",
          dir: "\uD83C\uDFAF Κέντρο Κάμπου (26μ)",
          today: "3 χλμ Κατερίνη \u2022 5 χλμ Θάλασσα",
          old1922: "Ρίζωμα προσφύγων 1923\u20131924",
          floatTxt: "\uD83C\uDFEB Αφετηρία: Περίσταση (26μ)",
          desc: "Εδώ χτυπάει η καρδιά του χωριού μας από το 1926! Βρισκόμαστε σε ένα μοναδικό σημείο της Πιερίας: ανάμεσα στην Κατερίνη, την αμμουδιά του Θερμαϊκού και τις κορυφές του Ολύμπου.",
          ctaText: "\uD83E\uDE9E Δες το Σχολείο: 1926 vs 2026 \u279C",
          secondBridge: true,
          action: function() {
            window.openPeristasiModal("population", false);
            openMirrorInModal();
          }
        },
        {
          id: "katerini",
          icon: "\uD83C\uDFD9\uFE0F",
          short: "Κατερίνη",
          color: "#d97706",
          inPieria: true,
          px: 27.4, py: 42.0,
          layers: ["neighbors"],
          title: "\uD83C\uDFD9\uFE0F Κατερίνη: Η Πρωτεύουσα του Νομού μας",
          dist: "3 χλμ",
          dir: "\u2B05\uFE0F Δυτικά (Δ)",
          today: "5 λεπτά (10' με ποδήλατο)",
          old1922: "~45 λεπτά με βοϊδόκαρο",
          floatTxt: "\uD83D\uDCCF Κατερίνη: 3 χλμ \u2022 Δυτικά (5')",
          desc: "Μόλις 3 χιλιόμετρα δυτικά από την αυλή μας βρίσκεται το κέντρο της Κατερίνης! Η οδός Μακεδονίας που περνά μπροστά από το σχολείο μας μάς συνδέει απευθείας με την πόλη.",
          ctaText: "\uD83D\uDEB2 Σύγκρινε Ταχύτητες & Πυξίδα \u279C",
          action: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[1]) subBtns[1].click();
            selectDestination("katerini", false);
          }
        },
        {
          id: "paralia",
          icon: "\uD83C\uDFD6\uFE0F",
          short: "Παραλία",
          color: "#0284c7",
          inPieria: true,
          px: 36.4, py: 55.8,
          layers: ["neighbors", "horizon"],
          title: "\uD83C\uDF0A Παραλία Κατερίνης (Θερμαϊκός Κόλπος)",
          dist: "5 χλμ",
          dir: "\u27A1\uFE0F Ανατολικά (Α)",
          today: "7 λεπτά (16' με ποδήλατο)",
          old1922: "~1 ώρα & 15' ανάμεσα στα χωράφια",
          floatTxt: "\uD83D\uDCCF Παραλία: 5 χλμ \u2022 Ανατολικά (7')",
          desc: "Πέντε χιλιόμετρα ανατολικά ξεκινά η θάλασσα του Θερμαϊκού (0 μέτρα)! Το ήξερες; Όταν ιδρύθηκε η Κοινότητα Περίστασης το 1926, είχε στην αρχή μαζί της και την Παραλία και την Καλλιθέα (έως το 1927\u20131930)!",
          ctaText: "\uD83C\uDF0A Εξερεύνησε τη Ζώνη Θάλασσας (0μ) \u279C",
          action: function() {
            window.openPeristasiModal("elevation", true);
            selectZone(0);
          }
        },
        {
          id: "olympus",
          icon: "\uD83C\uDFD4\uFE0F",
          short: "Όλυμπος (2.918μ)",
          color: "#7c3aed",
          inPieria: true,
          px: 28.5, py: 60.8,
          layers: ["neighbors", "horizon"],
          title: "\uD83C\uDFD4\uFE0F Όλυμπος & Λιτόχωρο (Μύτικας 2.918 μ.)",
          dist: "24 χλμ (Λιτόχωρο)",
          dir: "\u2199\uFE0F Νοτιοδυτικά (ΝΔ)",
          today: "25 λεπτά με αυτοκίνητο",
          old1922: "~6 ώρες με βοϊδόκαρο!",
          floatTxt: "\uD83D\uDCCF Όλυμπος: 24 χλμ \u2022 ΝΔ (25')",
          desc: "Το ψηλότερο βουνό της Ελλάδας και Μνημείο Παγκόσμιας Κληρονομιάς της UNESCO υψώνεται περήφανο νοτιοδυτικά από την αυλή μας, με τον Ενιπέα, τα ρόμπολα και τον χιονισμένο Μύτικα!",
          ctaText: "\uD83C\uDFD4\uFE0F Ανέβα από το Κύμα στον Μύτικα \u279C",
          action: function() {
            window.openPeristasiModal("elevation", true);
            selectZone(4);
          }
        },
        {
          id: "skoteina",
          icon: "\uD83C\uDF32",
          short: "Φωτεινά / Σκοτεινά",
          color: "#ea580c",
          inPieria: true,
          px: 21.2, py: 47.0,
          layers: ["ancestors"],
          title: "\uD83C\uDF32 Φωτεινά / Σκοτεινά \u2013 Παλιά Μόρνα (Πιέρια Όρη)",
          dist: "34 χλμ",
          dir: "\u2B05\uFE0F Δυτικά (Πιέρια Όρη)",
          today: "~40 λεπτά ορεινή διαδρομή",
          old1922: "Ολόκληρη μέρα πορεία (1947)",
          floatTxt: "\uD83D\uDCCF Φωτεινά (Σκοτεινά): 34 χλμ \u2022 Πιέρια Όρη",
          desc: "Ψηλά στα δάση των Πιερίων βρίσκονται τα σημερινά Φωτεινά (Σκοτεινά / Μόρνα). Το 1947 οι οικογένειές τους φιλοξενήθηκαν στο σχολείο μας και έσμιξαν στην Περίσταση με τους Θρακιώτες, τους Βλάχους και τους Πόντιους!",
          ctaText: "\uD83D\uDFE7 Δες το 1947 & τις Ρίζες τους \u279C",
          action: function() {
            openPopulationAtYear(1947);
            triggerRootBubble("vlach", false);
          }
        },
        {
          id: "korinos",
          icon: "\uD83C\uDFFA",
          short: "Κορινός & Πύδνα",
          color: "#059669",
          lblRight: true,
          inPieria: true,
          px: 35.4, py: 26.5,
          layers: ["neighbors", "ancestors"],
          title: "\uD83C\uDFFA Κορινός, Αλυκές Κίτρους & Αρχαία Πύδνα",
          dist: "8 έως 18 χλμ",
          dir: "\u2B06\uFE0F Βόρεια (Β)",
          today: "10\u201318 λεπτά με αυτοκίνητο",
          old1922: "~2,5 ώρες στον βόρειο δρόμο",
          floatTxt: "\uD83D\uDCCF Κορινός & Πύδνα: 8\u201318 χλμ \u2022 Βόρεια",
          desc: "Βόρεια από το χωριό μας βρίσκονται ο Κορινός, οι Αλυκές Κίτρους και η Αρχαία Πύδνα — το παραθαλάσσιο πέρασμα απ' όπου κατέβηκαν οι πρόσφυγες ερχόμενοι από τη Θεσσαλονίκη!",
          ctaText: "\uD83E\uDDED Γύρισε την Πυξίδα στον Βορρά \u279C",
          action: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[1]) subBtns[1].click();
            setCompassDirection("N", false);
          }
        },
        {
          id: "platamonas",
          icon: "\uD83C\uDFF0",
          short: "Πλαταμώνας",
          color: "#0f766e",
          inPieria: true,
          px: 38.2, py: 75.5,
          layers: ["neighbors"],
          title: "\uD83C\uDFF0 Κάστρο Πλαταμώνα (Νότια Πιερία)",
          dist: "38 χλμ",
          dir: "\u2B07\uFE0F Νότια (Ν)",
          today: "30 λεπτά με αυτοκίνητο",
          old1922: "~8 ώρες ταξίδι στον κάμπο",
          floatTxt: "\uD83D\uDCCF Πλαταμώνας: 38 χλμ \u2022 Νότια (30')",
          desc: "Στο νότιο άκρο της Πιερίας, εκεί όπου οι πρόποδες του Ολύμπου αγγίζουν το Αιγαίο Πέλαγος, υψώνεται από τα βυζαντινά χρόνια το πετρόχτιστο Κάστρο του Πλαταμώνα!",
          ctaText: "\uD83E\uDDED Γύρισε την Πυξίδα στον Νότο \u279C",
          action: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[1]) subBtns[1].click();
            setCompassDirection("S", false);
          }
        },
        {
          id: "thess",
          icon: "\uD83D\uDDFC",
          short: "Θεσσαλονίκη",
          color: "#1e6cff",
          lblRight: true,
          inPieria: false,
          px: 48.5, py: 9.2,
          layers: ["ancestors", "horizon"],
          title: "\uD83D\uDDFC Θεσσαλονίκη (Σταθμός Ανταμώματος 1922)",
          dist: "68 χλμ (42 χλμ θάλασσα)",
          dir: "\u2197\uFE0F Βορειοανατολικά (ΒΑ)",
          today: "50 λεπτά με αυτοκίνητο",
          old1922: "2 μέρες με κάρο (ή με καράβι!)",
          floatTxt: "\uD83D\uDCCF Θεσσαλονίκη: 68 χλμ \u2022 ΒΑ (50')",
          desc: "Εδώ συναντήθηκαν τον Οκτώβριο του 1922 οι Περιστασιανοί πρόσφυγες από την Προποντίδα (κάρα & καράβια με τα 18 κιβώτια κειμηλίων) πριν κατηφορίσουν για το νέο μας χωριό στην Πιερία!",
          ctaText: "\u26F5 Δες τον 4ο Σταθμό του 1922 \u279C",
          action: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[0]) subBtns[0].click();
            renderStop(3);
          }
        },
        {
          id: "chalkidiki",
          icon: "\uD83C\uDF05",
          short: "Χαλκιδική",
          color: "#0369a1",
          inPieria: false,
          px: 66.5, py: 62.5,
          layers: ["horizon"],
          title: "\uD83C\uDF05 Χαλκιδική: Η Χερσόνησος Κασσάνδρας στον Ορίζοντα!",
          dist: "~45 χλμ πάνω από το κύμα",
          dir: "\u2198\uFE0F Ανατολικά-ΝΑ (Θερμαϊκός)",
          today: "~1 ώρα & 45' γύρω από τον κόλπο",
          old1922: "Πέρασμα καραβιών του Αιγαίου",
          floatTxt: "\uD83D\uDD2D Χαλκιδική: ~45 χλμ πάνω από τη θάλασσα",
          desc: "Τις καθαρές μέρες που φυσάει βοριάς (Βαρδάρης), αν σταθείς στην Παραλία Κατερίνης βλέπεις πεντακάθαρα απέναντι από τον Θερμαϊκό Κόλπο τη Χαλκιδική και τη χερσόνησο της Κασσάνδρας!",
          ctaText: "\uD83D\uDD2D Άναψε την Ακτίνα Ορίζοντα \u279C",
          action: function() {
            if (curLayer !== "horizon") {
              applyRegLayer("horizon", 8);
            } else {
              window.openPeristasiModal("elevation", true);
              selectZone(0);
            }
          }
        }
      ];

      var layerNotes = {
        all: "",
        neighbors: "\uD83D\uDCCD Οι Γείτονές μας (Ζουμ στην Πιερία): Η Περίσταση βρίσκεται ακριβώς ανάμεσα στην Κατερίνη (3 χλμ), την Παραλία (5 χλμ) και τον Όλυμπο (24 χλμ)!",
        ancestors: "\u26F5 Οι Δρόμοι των Προγόνων μας: Δες πώς έφτασαν οι Θρακιώτες & Πόντιοι μέσω Θεσσαλονίκης (1922\u20131924, στεριά & θάλασσα) και οι οικογένειες από τα Φωτεινά/Σκοτεινά Πιερίων (1947)!",
        horizon: "\uD83D\uDD2D Τι βλέπουμε στον ορίζοντα; Από την αμμουδιά της Παραλίας το βλέμμα ταξιδεύει πάνω από τον Θερμαϊκό έως τη Θεσσαλονίκη (ΒΑ) και τη Χαλκιδική (Α-ΝΑ), ενώ πίσω μας υψώνεται ο Μύτικας!"
      };

     var sx = function(p) { return Math.round(p * 10); };
      var sy = function(p) { return Math.round(p * 6.14); };
      var pinsHtml = regPins.map(function(p, idx) {
        var extraCls = (p.home ? " preg-pin--home" : "") + (p.lblRight ? " preg-pin--right" : "") + (idx === 0 ? " is-selected" : "");
        return '<button type="button" class="preg-pin' + extraCls + '" data-rpin="' + idx + '" style="left:' + p.px + '%;top:' + p.py + '%;--pp-bg:' + p.color + '" aria-label="' + p.short + '">' +
          '<span class="preg-pin-dot">' + p.icon + '</span>' +
          '<span class="preg-pin-lbl">' + p.short + '</span>' +
        '</button>';
      }).join("");

      var quickChipsHtml = regPins.map(function(p, idx) {
        return '<button type="button" class="preg-qchip' + (idx === 0 ? ' is-active' : '') + '" data-rchip="' + idx + '" style="--qc-bg:' + p.color + '">' +
          '<span>' + p.icon + '</span><span>' + p.short + '</span>' +
        '</button>';
      }).join("");

      var regWrap = document.createElement("div");
      regWrap.className = "preg-wrap";
      regWrap.id = "pregMapWrap";
      regWrap.innerHTML =
        '<div class="preg-head">' +
          '<div class="preg-head-title">\uD83E\uDDED Ζωντανός Χάρτης Περίστασης, Πιερίας &amp; Θερμαϊκού</div>' +
          '<div class="preg-head-actions">' +
            '<span class="preg-head-hint">\uD83D\uDC46 Πάτησε σε πινέζα ή στον χάρτη για μεγέθυνση!</span>' +
            '<button type="button" class="preg-act-btn preg-act-btn--bridge" id="pregBridgeDownBtn">\uD83C\uDFD8\uFE0F Από τον Νομό \u279C Στη Γειτονιά μας \u2193</button>' +
            '<button type="button" class="preg-act-btn preg-zoom-modal-btn" id="pregFullImgBtn">\uD83D\uDD0D Μεγέθυνση Χάρτη</button>' +
          '</div>' +
        '</div>' +
        '<div class="preg-layers" id="pregLayerBtns">' +
          '<button type="button" class="preg-layer-btn is-active" data-rlayer="all">\uD83C\uDF1F Όλα τα Σημεία (9)</button>' +
          '<button type="button" class="preg-layer-btn" data-rlayer="neighbors">\uD83D\uDCCD Οι Γείτονές μας</button>' +
          '<button type="button" class="preg-layer-btn" data-rlayer="ancestors">\u26F5 Οι Δρόμοι των Προγόνων μας</button>' +
          '<button type="button" class="preg-layer-btn" data-rlayer="horizon">\uD83D\uDD2D Τι βλέπουμε στον ορίζοντα;</button>' +
        '</div>' +
        '<div class="preg-layer-note" id="pregLayerNote"></div>' +
        '<div class="preg-body-grid">' +
          '<div class="preg-map-col">' +
            '<div class="preg-stage" id="pregStage">' +
              '<div class="preg-viewport" id="pregViewport">' +
                '<img class="preg-base-img" id="pregBaseImg" src="' + crispMapUrl + '" alt="Διαδραστικός Χάρτης Περίστασης και Πιερίας" loading="lazy" decoding="async"/>' +
               '<svg class="preg-svg" viewBox="0 0 1000 614" preserveAspectRatio="none" aria-hidden="true">' +
                  '<defs>' +
                    '<linearGradient id="pregHorizonGrad" x1="0%" y1="50%" x2="100%" y2="50%">' +
                      '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.34"/>' +
                      '<stop offset="100%" stop-color="#fde047" stop-opacity="0.08"/>' +
                    '</linearGradient>' +
                  '</defs>' +
                  '<g id="pregLayerNeighbors" style="display:none">' +
                    '<circle cx="334" cy="257" r="28" fill="rgba(16,185,129,0.10)" stroke="#10b981" stroke-width="2" vector-effect="non-scaling-stroke" stroke-dasharray="5,5"/>' +
                    '<circle cx="334" cy="257" r="108" fill="rgba(30,108,255,0.05)" stroke="#3b82f6" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-dasharray="7,6"/>' +
                  '</g>' +
                  '<g id="pregLayerAncestors" style="display:none">' +
                    '<path d="M 485,56 Q 412,54 365,116 Q 354,163 346,208 L 334,257" fill="none" stroke="#ffffff" stroke-width="6" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<path class="preg-flow-line" d="M 485,56 Q 412,54 365,116 Q 354,163 346,208 L 334,257" fill="none" stroke="#d97706" stroke-width="3.6" vector-effect="non-scaling-stroke" stroke-dasharray="9,5" stroke-linecap="round"/>' +
                    '<path d="M 485,56 Q 452,212 364,343 L 334,257" fill="none" stroke="#ffffff" stroke-width="5.5" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<path class="preg-flow-line" d="M 485,56 Q 452,212 364,343 L 334,257" fill="none" stroke="#1e6cff" stroke-width="3.4" vector-effect="non-scaling-stroke" stroke-dasharray="8,6" stroke-linecap="round"/>' +
                    '<path d="M 212,289 Q 273,278 334,257" fill="none" stroke="#ffffff" stroke-width="5.5" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<path class="preg-flow-line" d="M 212,289 Q 273,278 334,257" fill="none" stroke="#ea580c" stroke-width="3.4" vector-effect="non-scaling-stroke" stroke-dasharray="8,6" stroke-linecap="round"/>' +
                  '</g>' +
                  '<g id="pregLayerHorizon" style="display:none">' +
                    '<path d="M 364,343 L 485,56 Q 618,205 665,384 Z" fill="url(#pregHorizonGrad)" stroke="none"/>' +
                    '<line class="preg-flow-line" x1="364" y1="343" x2="485" y2="56" stroke="#0284c7" stroke-width="2.8" vector-effect="non-scaling-stroke" stroke-dasharray="7,7"/>' +
                    '<line class="preg-flow-line" x1="364" y1="343" x2="665" y2="384" stroke="#0369a1" stroke-width="2.8" vector-effect="non-scaling-stroke" stroke-dasharray="7,7"/>' +
                    '<line x1="334" y1="257" x2="285" y2="373" stroke="#7c3aed" stroke-width="2.8" vector-effect="non-scaling-stroke" stroke-dasharray="6,5"/>' +
                  '</g>' +
                  '<g id="pregRulerSvg" style="display:none">' +
                    '<line id="pregRulerHalo" x1="334" y1="257" x2="334" y2="257" stroke="#ffffff" stroke-width="6" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<line id="pregRulerLine" class="preg-flow-line" x1="334" y1="257" x2="334" y2="257" stroke="#dc2626" stroke-width="3.5" vector-effect="non-scaling-stroke" stroke-dasharray="9,5" stroke-linecap="round"/>' +
                    '<circle id="pregRulerEnd" cx="334" cy="257" r="5.5" fill="#fde047" stroke="#0f172a" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
                  '</g>' +
                '</svg>' +
              '</div>' +
              '<button type="button" class="preg-zoom-pill" id="pregZoomPieriaBtn">\uD83D\uDD0D Ζουμ στην Πιερία</button>' +
              '<div class="preg-ruler-float" id="pregRulerFloat"></div>' +
              pinsHtml +
            '</div>' +
            '<div class="preg-quick-strip" id="pregQuickStrip">' + quickChipsHtml + '</div>' +
          '</div>' +
          '<div class="preg-panel" id="pregPanel" aria-live="polite"></div>' +
        '</div>';

      oldLink.parentNode.replaceChild(regWrap, oldLink);

      var stageEl = document.getElementById("pregStage");
      var baseImgEl = document.getElementById("pregBaseImg");
      var hiResLoaded = false;

      var syncStageAspect = function() {
        if (baseImgEl && baseImgEl.naturalWidth > 0 && baseImgEl.naturalHeight > 0 && stageEl) {
          stageEl.style.aspectRatio = baseImgEl.naturalWidth + " / " + baseImgEl.naturalHeight;
        }
      };

      var ensureHiResMap = function() {
        if (hiResLoaded || !baseImgEl || !hiResMapUrl || hiResMapUrl === baseImgEl.src) return;
        hiResLoaded = true;
        var hr = new Image();
        hr.decoding = "async";
        hr.onload = function() {
          baseImgEl.src = hiResMapUrl;
          syncStageAspect();
        };
        hr.src = hiResMapUrl;
      };

      if (baseImgEl) {
        baseImgEl.addEventListener("load", syncStageAspect);
        if (baseImgEl.complete) syncStageAspect();
        baseImgEl.onerror = function() {
          if (fallbackMapUrl && this.src !== fallbackMapUrl) this.src = fallbackMapUrl;
        };
      }

      var viewportEl = document.getElementById("pregViewport");
      var zoomPieriaBtn = document.getElementById("pregZoomPieriaBtn");
      var zoomModalBtn = document.getElementById("pregFullImgBtn");
      var pinEls = regWrap.querySelectorAll(".preg-pin");
      var qChipEls = regWrap.querySelectorAll(".preg-qchip");
      var qStripEl = document.getElementById("pregQuickStrip");
      var layerBtnEls = regWrap.querySelectorAll(".preg-layer-btn");
      var layerNoteEl = document.getElementById("pregLayerNote");
      var gNeighbors = document.getElementById("pregLayerNeighbors");
      var gAncestors = document.getElementById("pregLayerAncestors");
      var gHorizon = document.getElementById("pregLayerHorizon");
      var rulerSvgG = document.getElementById("pregRulerSvg");
      var rulerHalo = document.getElementById("pregRulerHalo");
      var rulerLine = document.getElementById("pregRulerLine");
      var rulerEnd = document.getElementById("pregRulerEnd");
      var rulerFloat = document.getElementById("pregRulerFloat");
      var panelEl = document.getElementById("pregPanel");

     var curPinIdx = 0;
      var curLayer = "all";
      var pieriaZoomed = false;
      var pieriaTx = Z_TX;
      var pieriaTy = Z_TY;
      var minPieriaPan = 100 - 100 * Z_SCALE;
      var panMovedReg = false;
      var regModalBg = null;
      var regPlaceholder = null;
      var stageDownPt = null;
      var multiTouchReg = false;

      function applyPieriaViewport() {
        if (!viewportEl) return;
        viewportEl.style.transform = pieriaZoomed
          ? ("translate3d(" + pieriaTx.toFixed(2) + "%," + pieriaTy.toFixed(2) + "%,0) scale(" + Z_SCALE + ")")
          : "";
      }

     if (stageEl) {
        var tPanOn = false, tStartX = 0, tStartY = 0, tLastX = 0, tLastY = 0;
        var panRect = null, panRaf = 0;
        var schedulePanRender = function() {
          if (panRaf) return;
          panRaf = requestAnimationFrame(function() {
            panRaf = 0;
            applyPieriaViewport();
            syncPinPositions();
          });
        };

        stageEl.addEventListener("touchstart", function(e) {
          if (e.touches && e.touches.length > 1) {
            multiTouchReg = true;
            tPanOn = false;
            stageEl.classList.remove("is-panning");
            return;
          }
          multiTouchReg = false;
          if (!pieriaZoomed || isPinchZoomed() || !e.touches || !e.touches[0] || e.target.closest("#pregZoomPieriaBtn")) {
            tPanOn = false;
            return;
          }
          tPanOn = true;
          panMovedReg = false;
          panRect = stageEl.getBoundingClientRect();
          tStartX = tLastX = e.touches[0].clientX;
          tStartY = tLastY = e.touches[0].clientY;
        }, { passive: true });

       stageEl.addEventListener("touchmove", function(e) {
          if (e.touches && e.touches.length > 1) {
            multiTouchReg = true;
            tPanOn = false;
            stageEl.classList.remove("is-panning");
            return;
          }
          if (!tPanOn || !pieriaZoomed || isPinchZoomed() || !e.touches || !e.touches[0]) return;
          var cx = e.touches[0].clientX;
          var cy = e.touches[0].clientY;
          if (!panMovedReg) {
            var dx0 = cx - tStartX, dy0 = cy - tStartY;
            if (Math.abs(dx0) < 5 && Math.abs(dy0) < 5) return;
            if (!isRegMapZoomed && Math.abs(dy0) > Math.abs(dx0) * 0.9 &&
                ((dy0 < 0 && pieriaTy <= minPieriaPan + 0.8) || (dy0 > 0 && pieriaTy >= -0.8))) {
              tPanOn = false;
              stageEl.classList.remove("is-panning");
              return;
            }
            panMovedReg = true;
            stageEl.classList.add("is-panning");
          }
          if (panRect && panRect.width > 0 && panRect.height > 0) {
            var nextTx = Math.max(minPieriaPan, Math.min(0, pieriaTx + ((cx - tLastX) / panRect.width) * 100));
            var nextTy = Math.max(minPieriaPan, Math.min(0, pieriaTy + ((cy - tLastY) / panRect.height) * 100));
            var movedMap = (Math.abs(nextTx - pieriaTx) > 0.01 || Math.abs(nextTy - pieriaTy) > 0.01);
            if (movedMap || isRegMapZoomed) {
              if (e.cancelable) e.preventDefault();
            }
            if (movedMap) {
              pieriaTx = nextTx;
              pieriaTy = nextTy;
              schedulePanRender();
            }
          }
          tLastX = cx;
          tLastY = cy;
        }, { passive: false });

        var endTouchPan = function() {
          tPanOn = false;
          stageEl.classList.remove("is-panning");
        };
        stageEl.addEventListener("touchend", endTouchPan, { passive: true });
        stageEl.addEventListener("touchcancel", endTouchPan, { passive: true });

        var mPanOn = false, mStartX = 0, mStartY = 0, mLastX = 0, mLastY = 0;
        var onWinMouseMove = function(e) {
          if (!mPanOn || !pieriaZoomed) return;
          if (!panMovedReg) {
            if (Math.abs(e.clientX - mStartX) < 4 && Math.abs(e.clientY - mStartY) < 4) return;
            panMovedReg = true;
            stageEl.classList.add("is-panning");
          }
          if (panRect && panRect.width > 0 && panRect.height > 0) {
            pieriaTx = Math.max(minPieriaPan, Math.min(0, pieriaTx + ((e.clientX - mLastX) / panRect.width) * 100));
            pieriaTy = Math.max(minPieriaPan, Math.min(0, pieriaTy + ((e.clientY - mLastY) / panRect.height) * 100));
            schedulePanRender();
          }
          mLastX = e.clientX;
          mLastY = e.clientY;
        };
        var onWinMouseUp = function() {
          window.removeEventListener("mousemove", onWinMouseMove);
          window.removeEventListener("mouseup", onWinMouseUp);
          if (!mPanOn) return;
          mPanOn = false;
          stageEl.classList.remove("is-panning");
        };
        stageEl.addEventListener("mousedown", function(e) {
          if (e.button !== 0 || !pieriaZoomed || e.target.closest("#pregZoomPieriaBtn")) return;
          mPanOn = true;
          panMovedReg = false;
          panRect = stageEl.getBoundingClientRect();
          mStartX = mLastX = e.clientX;
          mStartY = mLastY = e.clientY;
          window.addEventListener("mousemove", onWinMouseMove);
          window.addEventListener("mouseup", onWinMouseUp);
        });

        stageEl.addEventListener("pointerdown", function(e) {
          if (e.isPrimary === false) { multiTouchReg = true; stageDownPt = null; return; }
          multiTouchReg = false;
          stageDownPt = { x: e.clientX, y: e.clientY };
        }, { passive: true });
      }

      function openRegMapZoom() {
        if (isRegMapZoomed || !regWrap) return;
        pauseHeroVideo();
        regWrap.classList.remove("is-paused");
        if (isMapZoomed) closeMapZoom(true);
        ensureHiResMap();
        if (!regModalBg) {
          regModalBg = document.createElement("div");
          regModalBg.className = "preg-modal-bg";
          document.body.appendChild(regModalBg);
          var regBgDown = false;
          regModalBg.addEventListener("pointerdown", function(e) {
            regBgDown = (e.isPrimary !== false && e.target === regModalBg);
          }, { passive: true });
          regModalBg.addEventListener("click", function(e) {
            if (regBgDown && !isPinchZoomed() && e.target === regModalBg) closeRegMapZoom(false);
            regBgDown = false;
          });
        }
        if (!regPlaceholder) regPlaceholder = document.createElement("div");
        if (regWrap.parentNode) regWrap.parentNode.insertBefore(regPlaceholder, regWrap);

        isRegMapZoomed = true;
        regModalBg.appendChild(regWrap);
        regWrap.classList.add("is-zoomed");
        regModalBg.classList.add("is-open");
        lockBodyScroll();
        if (zoomModalBtn) zoomModalBtn.textContent = "\u2715 Κλείσιμο Μεγέθυνσης";

        if (!histRegMapOpen) {
          histRegMapOpen = true;
          try {
            window.history.pushState({ pregMapZoom: true }, "", window.location.href);
          } catch (e) {}
        }
      }

      closeRegMapZoom = function(fromPopState) {
        if (!isRegMapZoomed || !regWrap) return;
        isRegMapZoomed = false;
        regWrap.classList.remove("is-zoomed");
        if (regModalBg) regModalBg.classList.remove("is-open");
        if (regPlaceholder && regPlaceholder.parentNode) {
          regPlaceholder.parentNode.insertBefore(regWrap, regPlaceholder);
        }
        unlockBodyScroll();
        if (zoomModalBtn) zoomModalBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";

        var needBack = (!fromPopState && histRegMapOpen);
        histRegMapOpen = false;
        if (needBack) safeHistoryBack(1);
      };

      function isPinInCurrentLayer(i) {
        return (curLayer === "all") || (regPins[i].layers.indexOf(curLayer) !== -1);
      }

     function syncPinPositions() {
        pinEls.forEach(function(btn, i) {
          var p = regPins[i];
          var lx = pieriaZoomed ? (pieriaTx + p.px * Z_SCALE) : p.px;
          var ly = pieriaZoomed ? (pieriaTy + p.py * Z_SCALE) : p.py;
          btn.style.left = lx.toFixed(2) + "%";
          btn.style.top = ly.toFixed(2) + "%";
          var outFrame = pieriaZoomed && (lx < 2 || lx > 98 || ly < 2 || ly > 98);
          btn.classList.toggle("is-out-zoom", outFrame);
        });
      }

      function setPieriaZoom(enable) {
        pieriaZoomed = !!enable;
        if (pieriaZoomed) {
          pieriaTx = Z_TX;
          pieriaTy = Z_TY;
          ensureHiResMap();
        }
        if (stageEl) stageEl.classList.toggle("is-pieria-active", pieriaZoomed);
        if (viewportEl) viewportEl.classList.toggle("is-pieria-zoom", pieriaZoomed);
        applyPieriaViewport();
        if (zoomPieriaBtn) {
          zoomPieriaBtn.classList.toggle("is-active", pieriaZoomed);
          zoomPieriaBtn.textContent = pieriaZoomed ? "\uD83D\uDDFA\uFE0F Όλος ο Χάρτης" : "\uD83D\uDD0D Ζουμ στην Πιερία";
        }
        syncPinPositions();
      }

      function getVisibleIndices() {
        var arr = [];
        for (var i = 0; i < regPins.length; i++) {
          if (isPinInCurrentLayer(i)) arr.push(i);
        }
        return arr.length ? arr : [0];
      }

      function stepRegPin(dir) {
        var vis = getVisibleIndices();
        var pos = vis.indexOf(curPinIdx);
        if (pos === -1) pos = 0;
        var nextIdx = vis[(pos + dir + vis.length) % vis.length];
        selectRegPin(nextIdx);
      }
      stepRegPinFn = stepRegPin;

      function bridgeToNeighborhoodMap() {
        var wasZoomed = isRegMapZoomed;
        var hadHist = histRegMapOpen;
        if (wasZoomed) closeRegMapZoom(false);
        selectRegPin(0);
        var homePin = pinEls[0];
        if (homePin && !wasZoomed) {
          homePin.classList.remove("is-zoom-bridging");
          void homePin.offsetWidth;
          homePin.classList.add("is-zoom-bridging");
        }
       var jumpFn = function() {
          if (!mapWrap) return;
          closeFacilityCard();
          syncNeighborhoodMap(0, true);
          setMapStatusHtml(
            "\uD83D\uDD2D Ζουμάραμε στην κόκκινη πινέζα της Περίστασης! Τώρα βλέπεις από κοντά τους δρόμους γύρω από την οδό Μακεδονίας 13!",
            "card",
            facilitiesData[0] ? facilitiesData[0].img : "",
            facilitiesData[0] ? facilitiesData[0].title : "",
            { steps: 0, crossRoad: false, safety: facMapMeta[0] ? facMapMeta[0].safety : "" }
          );
          mapWrap.scrollIntoView({ behavior: "smooth", block: "center" });
          mapWrap.classList.add("is-bridge-glow");
          setTimeout(function() { mapWrap.classList.remove("is-bridge-glow"); }, 2200);
        };
        if (wasZoomed) runAfterBack(hadHist, jumpFn);
        else setTimeout(jumpFn, 260);
      }

      function selectRegPin(idx, keepZoom) {
        curPinIdx = (idx + regPins.length) % regPins.length;
        var p = regPins[curPinIdx];

      if (!keepZoom && pieriaZoomed && !p.inPieria) {
          setPieriaZoom(false);
        } else if (pieriaZoomed) {
          var curLx = pieriaTx + p.px * Z_SCALE;
          var curLy = pieriaTy + p.py * Z_SCALE;
          if (curLx < 10 || curLx > 90 || curLy < 12 || curLy > 88) {
            pieriaTx = Math.max(minPieriaPan, Math.min(0, 50 - p.px * Z_SCALE));
            pieriaTy = Math.max(minPieriaPan, Math.min(0, 50 - p.py * Z_SCALE));
            applyPieriaViewport();
            syncPinPositions();
          }
        }

        pinEls.forEach(function(btn, i) {
          btn.classList.toggle("is-selected", i === curPinIdx);
        });

        var activeChipEl = null;
        qChipEls.forEach(function(ch, i) {
          var isAct = (i === curPinIdx);
          ch.classList.toggle("is-active", isAct);
          if (isAct) activeChipEl = ch;
        });
        if (qStripEl && activeChipEl && qStripEl.scrollWidth > qStripEl.clientWidth) {
          var scLeft = Math.max(0, activeChipEl.offsetLeft - (qStripEl.clientWidth - activeChipEl.offsetWidth) / 2);
          if (qStripEl.scrollTo) qStripEl.scrollTo({ left: scLeft, behavior: "smooth" });
          else qStripEl.scrollLeft = scLeft;
        }

        if (!p.home && rulerSvgG && rulerHalo && rulerLine && rulerEnd) {
          var x1 = sx(schoolOrigin.x), y1 = sy(schoolOrigin.y);
          var x2 = sx(p.px), y2 = sy(p.py);
          rulerHalo.setAttribute("x1", x1); rulerHalo.setAttribute("y1", y1);
          rulerHalo.setAttribute("x2", x2); rulerHalo.setAttribute("y2", y2);
          rulerLine.setAttribute("x1", x1); rulerLine.setAttribute("y1", y1);
          rulerLine.setAttribute("x2", x2); rulerLine.setAttribute("y2", y2);
          rulerLine.setAttribute("stroke", p.color);
          rulerEnd.setAttribute("cx", x2); rulerEnd.setAttribute("cy", y2);
          rulerSvgG.style.display = "";
        } else if (rulerSvgG) {
          rulerSvgG.style.display = "none";
        }

        if (rulerFloat) {
          if (p.floatTxt) {
            rulerFloat.textContent = p.floatTxt;
            rulerFloat.classList.add("is-vis");
          } else {
            rulerFloat.classList.remove("is-vis");
          }
        }

        if (panelEl) {
          var visList = getVisibleIndices();
          var visPos = visList.indexOf(curPinIdx);
          var countLabel = (visPos !== -1 ? (visPos + 1) : 1) + "/" + visList.length;

          var secBridgeHtml = p.secondBridge
            ? '<button type="button" class="preg-cta-btn preg-cta-btn--sec" data-preg-bridge="1">\uD83C\uDFD8\uFE0F Ζουμ στους Δρόμους της Γειτονιάς μας \u2193</button>'
            : '';

          panelEl.innerHTML =
            '<div class="preg-panel-top">' +
              '<h4 class="preg-panel-title">' + p.title + '</h4>' +
              '<div class="preg-panel-nav">' +
                '<button type="button" class="preg-step-btn" data-preg-step="-1" title="Προηγούμενο σημείο">\u2B05\uFE0F</button>' +
                '<span style="font-size:11.5px;font-weight:800;color:#64748b">' + countLabel + '</span>' +
                '<button type="button" class="preg-step-btn" data-preg-step="1" title="Επόμενο σημείο">\u27A1\uFE0F</button>' +
              '</div>' +
            '</div>' +
            '<div class="preg-ruler-grid">' +
              '<div class="preg-metric"><span class="preg-metric-lbl">\uD83D\uDCCF Χάρακας Απόστασης</span><span class="preg-metric-val">' + p.dist + '</span></div>' +
              '<div class="preg-metric"><span class="preg-metric-lbl">\uD83E\uDDED Κατεύθυνση από Σχολείο</span><span class="preg-metric-val">' + p.dir + '</span></div>' +
              '<div class="preg-metric"><span class="preg-metric-lbl">\uD83D\uDE97 Σήμερα</span><span class="preg-metric-val">' + p.today + '</span></div>' +
              '<div class="preg-metric preg-metric--1922"><span class="preg-metric-lbl">\uD83D\uDEDE Εποχή Προγόνων</span><span class="preg-metric-val">' + p.old1922 + '</span></div>' +
            '</div>' +
            '<p class="preg-panel-desc">' + p.desc + '</p>' +
           '<div class="preg-panel-foot">' +
              '<button type="button" class="preg-cta-btn" data-preg-cta="1">' + ((p.id === "chalkidiki" && curLayer === "horizon") ? "\uD83C\uDF0A Εξερεύνησε τη Ζώνη Θάλασσας (0μ) \u279C" : p.ctaText) + '</button>' +
              secBridgeHtml +
            '</div>';
        }
      }

      function applyRegLayer(layerName, autoPinIdx) {
        curLayer = layerName || "all";
        layerBtnEls.forEach(function(b) {
          b.classList.toggle("is-active", b.getAttribute("data-rlayer") === curLayer);
        });
        if (gNeighbors) gNeighbors.style.display = (curLayer === "neighbors") ? "" : "none";
        if (gAncestors) gAncestors.style.display = (curLayer === "ancestors") ? "" : "none";
        if (gHorizon) gHorizon.style.display = (curLayer === "horizon") ? "" : "none";

        if (layerNoteEl) {
          var noteTxt = layerNotes[curLayer] || "";
          layerNoteEl.textContent = noteTxt;
          layerNoteEl.classList.toggle("is-vis", !!noteTxt);
        }

        pinEls.forEach(function(btn, i) {
          btn.classList.toggle("is-hidden-layer", !isPinInCurrentLayer(i));
        });
        qChipEls.forEach(function(ch, i) {
          ch.classList.toggle("is-hidden-layer", !isPinInCurrentLayer(i));
        });

        setPieriaZoom(curLayer === "neighbors");

        if (typeof autoPinIdx === "number") {
          selectRegPin(autoPinIdx, true);
        } else if (curLayer === "neighbors") {
          selectRegPin(0, true);
        } else if (curLayer === "ancestors") {
          selectRegPin(7, true);
        } else if (curLayer === "horizon") {
          selectRegPin(8, true);
        } else {
          selectRegPin(0, true);
        }
      }

      regWrap.addEventListener("click", function(e) {
        if (e.target.closest("#pregZoomPieriaBtn")) {
          if (!pieriaZoomed && !regPins[curPinIdx].inPieria) {
            selectRegPin(0, true);
          }
          setPieriaZoom(!pieriaZoomed);
          return;
        }
        if (e.target.closest("#pregFullImgBtn")) {
          e.stopPropagation();
          if (isRegMapZoomed) closeRegMapZoom(false);
          else openRegMapZoom();
          return;
        }
        if (e.target.closest("#pregBridgeDownBtn") || e.target.closest("[data-preg-bridge]")) {
          bridgeToNeighborhoodMap();
          return;
        }
        var lBtn = e.target.closest("[data-rlayer]");
        if (lBtn) {
          var targetLayer = lBtn.getAttribute("data-rlayer");
          applyRegLayer(targetLayer === curLayer && curLayer !== "all" ? "all" : targetLayer);
          return;
        }
       var cBtn = e.target.closest("[data-rchip]");
        if (cBtn) {
          selectRegPin(Number(cBtn.getAttribute("data-rchip")));
          return;
        }
        var stBtn = e.target.closest("[data-preg-step]");
        if (stBtn) {
          stepRegPin(Number(stBtn.getAttribute("data-preg-step")));
          return;
        }
        if (e.target.closest("[data-preg-cta]")) {
          var curP = regPins[curPinIdx];
          if (curP && curP.action) curP.action();
          return;
        }
       var draggedReg = !!(panMovedReg || (stageDownPt && (Math.abs(e.clientX - stageDownPt.x) > 6 || Math.abs(e.clientY - stageDownPt.y) > 6)));
        panMovedReg = false;
        if (e.target.closest("#pregStage")) {
          if (!draggedReg && !multiTouchReg) {
            var hitRad = (!isRegMapZoomed && !pieriaZoomed && window.innerWidth <= 768) ? 28 : 30;
            var hitPin = findClosestEl(pinEls, e.clientX, e.clientY, hitRad, ".preg-pin-dot") || e.target.closest("[data-rpin]");
            if (hitPin) {
              selectRegPin(Number(hitPin.getAttribute("data-rpin")));
              return;
            }
            if (!isRegMapZoomed && !isPinchZoomed()) {
              openRegMapZoom();
            }
          }
        }
      });

      bindSwipe(
        panelEl,
        function() { stepRegPin(1); },
        function() { stepRegPin(-1); }
      );

      var toMacroBtn = document.getElementById("pfacToMacroBtn");
      if (toMacroBtn) {
        toMacroBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var wasNZoomed = isMapZoomed;
          var hadNHist = histMapOpen;
          if (wasNZoomed) closeMapZoom(false);
          runAfterBack(wasNZoomed && hadNHist, function() {
            regWrap.scrollIntoView({ behavior: "smooth", block: "center" });
            selectRegPin(0);
            if (pinEls[0]) {
              pinEls[0].classList.remove("is-zoom-bridging");
              void pinEls[0].offsetWidth;
              pinEls[0].classList.add("is-zoom-bridging");
            }
          });
        });
      }

      if (typeof window.IntersectionObserver === "function") {
        var regVisObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(en) {
            regWrap.classList.toggle("is-paused", !en.isIntersecting);
          });
        }, { threshold: 0.05 });
        regVisObs.observe(regWrap);
      }

      selectRegPin(0);
    }

    function upgradeHeroVideo() {
      var heroBox = document.querySelector(".school-history-wrapper .video-hero") || document.querySelector(".video-hero");
      if (!heroBox || document.getElementById("pvidMissionsBar")) return;
      var vidCont = heroBox.querySelector(".video-container");
      var origFrame = vidCont ? vidCont.querySelector("iframe") : null;
      if (!vidCont || !origFrame) return;

      var rawSrc = origFrame.getAttribute("data-src") || origFrame.getAttribute("src") || "";
      var vidTitle = origFrame.getAttribute("title") || "Πανοραμική απεικόνιση του σχολείου και της περιοχής";
      var ytMatch = rawSrc.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (!ytMatch || !ytMatch[1]) return;
      var vidId = ytMatch[1];

      var activeYtFrame = null;
      var ytLoaded = false;
      var pendingYtPause = false;
      var schoolFallbackPoster = facilitiesData[0] ? optImg(facilitiesData[0].img, 960) : "";

      var sendYtPauseCmd = function() {
        if (!activeYtFrame || !activeYtFrame.contentWindow) return;
        try {
          activeYtFrame.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*');
          activeYtFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":[]}', '*');
        } catch (e) {}
      };

      pauseHeroVideo = function() {
        if (!activeYtFrame) return;
        if (!ytLoaded) {
          pendingYtPause = true;
          return;
        }
        sendYtPauseCmd();
      };

      var facadeBtn = document.createElement("button");
      facadeBtn.type = "button";
      facadeBtn.className = "pvid-facade";
     facadeBtn.setAttribute("aria-label", "Αναπαραγωγή βίντεο: " + vidTitle);
      facadeBtn.innerHTML =
        '<img class="pvid-poster" src="https://i.ytimg.com/vi/' + vidId + '/maxresdefault.jpg" alt="' + escAttr(vidTitle) + '" decoding="async"/>' +
        '<span class="pvid-shade"></span>' +
        '<span class="pvid-kicker">\uD83D\uDE81 Πτήση πάνω από το Σχολείο &amp; την Περίσταση</span>' +
        '<span class="pvid-center">' +
          '<span class="pvid-play-circle"><span class="pvid-play-tri"></span></span>' +
          '<span class="pvid-play-lbl">\u25B6\uFE0F Πάτησε για Πανοραμική Πτήση!</span>' +
        '</span>';

      var posterEl = facadeBtn.querySelector(".pvid-poster");
      if (posterEl) {
        posterEl.onload = function() {
          if (this.naturalWidth > 0 && this.naturalWidth <= 140 && this.src.indexOf("maxresdefault") !== -1) {
            this.src = "https://i.ytimg.com/vi/" + vidId + "/hqdefault.jpg";
          }
        };
        posterEl.onerror = function() {
          if (this.src.indexOf("maxresdefault") !== -1) {
            this.src = "https://i.ytimg.com/vi/" + vidId + "/hqdefault.jpg";
          } else if (schoolFallbackPoster && this.src !== schoolFallbackPoster) {
            this.src = schoolFallbackPoster;
          }
        };
        if (posterEl.complete) {
          if (posterEl.naturalWidth === 0) posterEl.onerror();
          else posterEl.onload();
        }
      }

      facadeBtn.addEventListener("click", function() {
        var originParam = (window.location && window.location.origin && window.location.origin.indexOf("http") === 0)
          ? ("&origin=" + encodeURIComponent(window.location.origin))
          : "";
        var newFrame = document.createElement("iframe");
        ytLoaded = false;
        pendingYtPause = false;
        newFrame.addEventListener("load", function() {
          ytLoaded = true;
          try {
            if (newFrame.contentWindow) {
              newFrame.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*');
            }
          } catch (e) {}
          var mustPause = pendingYtPause || document.hidden || modal.classList.contains("is-open") ||
            isMapZoomed || isRegMapZoomed || (zoomOverlay && zoomOverlay.classList.contains("is-open")) ||
            vidCont.classList.contains("is-offscreen");
          if (mustPause) {
            pendingYtPause = false;
            sendYtPauseCmd();
            setTimeout(sendYtPauseCmd, 450);
          }
        });
        newFrame.src = "https://www.youtube.com/embed/" + vidId + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1" + originParam;
        newFrame.title = vidTitle;
        newFrame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        newFrame.setAttribute("allowfullscreen", "");
        activeYtFrame = newFrame;
        vidCont.innerHTML = "";
        vidCont.appendChild(newFrame);
      });

      vidCont.innerHTML = "";
      vidCont.appendChild(facadeBtn);

      if (typeof window.IntersectionObserver === "function") {
        var vidObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(en) {
            vidCont.classList.toggle("is-offscreen", !en.isIntersecting);
            if (!en.isIntersecting) pauseHeroVideo();
          });
        }, { threshold: 0 });
        vidObs.observe(vidCont);
      }

      var missionsList = [
        {
          label: "1. Το πέτρινο κτίριο & τη νέα πτέρυγα",
          icon: "\uD83C\uDFEB",
          msg: "\u2705 Μπράβο! Το πέτρινο διδακτήριο του 1965 ενώνεται στην ίδια αυλή με τη νέα πτέρυγα του 2006!",
          cta: "\uD83E\uDE9E Δες 1926 vs 2026 \u279C",
          go: function() { window.openPeristasiModal("population", false); openMirrorInModal(); }
        },
        {
          label: "2. Τον Αη-Γιώργη",
          icon: "\u26EA",
          msg: "\u2705 Σωστά! Ο Ι.Ν. Αγίου Γεωργίου & Μοδέστου βρίσκεται ακριβώς απέναντι από το σχολείο μας!",
          cta: "\u26EA Δες τον Ναό \u279C",
          go: function() { window.openPeristasiModal("churches", false); }
        },
        {
          label: "3. Τον Όλυμπο",
          icon: "\uD83C\uDFD4\uFE0F",
          msg: "\u2705 Τέλεια ματιά! Στον ορίζοντα νοτιοδυτικά υψώνονται οι κορυφές του Ολύμπου (2.918 μ.)!",
          cta: "\uD83C\uDFD4\uFE0F Ανέβα στον Μύτικα \u279C",
          go: function() { window.openPeristasiModal("elevation", true); selectZone(4); }
        }
      ];

      var foundMissions = {};
      var lastMissionIdx = -1;
      try {
        var savedMis = JSON.parse(localStorage.getItem("pexp_sky_missions") || "null");
        if (savedMis && typeof savedMis === "object") foundMissions = savedMis;
      } catch (e) {}

      var mBar = document.createElement("div");
      mBar.id = "pvidMissionsBar";
      mBar.className = "pvid-missions";
      mBar.innerHTML =
        '<div class="pvid-m-head">' +
          '<span>\uD83D\uDD2D Αποστολή από Ψηλά \u2014 Εντόπισε στο βίντεο &amp; πάτησε:</span>' +
          '<span class="pvid-m-right">' +
            '<span class="pvid-m-count" id="pvidMCount">0/3</span>' +
            '<button type="button" class="pvid-m-reset" id="pvidMReset" style="display:none" title="Μηδενισμός αποστολών">\u21BA</button>' +
          '</span>' +
        '</div>' +
        '<div class="pvid-m-grid">' +
          missionsList.map(function(m, i) {
            return '<button type="button" class="pvid-m-btn" data-vmis="' + i + '">' +
              '<span data-vmis-ico="1">' + m.icon + '</span><span>' + m.label + '</span>' +
            '</button>';
          }).join("") +
        '</div>' +
        '<div class="pvid-m-note" id="pvidMNote"></div>';

      vidCont.insertAdjacentElement("afterend", mBar);

      var mCountEl = document.getElementById("pvidMCount");
      var mResetEl = document.getElementById("pvidMReset");
      var mNoteEl = document.getElementById("pvidMNote");
      var mBtnEls = mBar.querySelectorAll(".pvid-m-btn");

      var syncMissionButtons = function() {
        var cnt = 0;
        mBtnEls.forEach(function(b, i) {
          var isOn = !!foundMissions[i];
          if (isOn) cnt++;
          b.classList.toggle("is-found", isOn);
          var ico = b.querySelector("[data-vmis-ico]");
          if (ico) ico.textContent = isOn ? "\u2705" : missionsList[i].icon;
        });
        if (mCountEl) {
          mCountEl.textContent = cnt + "/3";
          mCountEl.classList.toggle("is-done", cnt === 3);
        }
        if (mResetEl) {
          mResetEl.style.display = cnt > 0 ? "inline-block" : "none";
        }
        return cnt;
      };
      syncMissionButtons();

      mBar.addEventListener("click", function(e) {
        if (e.target.closest("#pvidMReset")) {
          foundMissions = {};
          lastMissionIdx = -1;
          try { localStorage.removeItem("pexp_sky_missions"); } catch (err) {}
          syncMissionButtons();
          if (mNoteEl) mNoteEl.classList.remove("is-vis");
          return;
        }
        if (e.target.closest("[data-vmis-go]") && lastMissionIdx >= 0 && missionsList[lastMissionIdx]) {
          missionsList[lastMissionIdx].go();
          return;
        }
        var mBtn = e.target.closest("[data-vmis]");
        if (!mBtn) return;
        var idx = Number(mBtn.getAttribute("data-vmis"));
        var wasJustCompleted = (!foundMissions[idx]);
        foundMissions[idx] = true;
        lastMissionIdx = idx;
        try { localStorage.setItem("pexp_sky_missions", JSON.stringify(foundMissions)); } catch (err) {}

        var totalFound = syncMissionButtons();

        if (mNoteEl) {
          var prefixWin = (totalFound === 3 && wasJustCompleted)
            ? "<strong>\uD83C\uDF1F 3 στα 3!</strong> "
            : "";
          mNoteEl.innerHTML =
            '<span>' + prefixWin + missionsList[idx].msg + '</span>' +
            '<button type="button" class="pvid-m-jump" data-vmis-go="1">' + missionsList[idx].cta + '</button>';
          mNoteEl.classList.add("is-vis");
        }
      });
    }

   function upgrade1922TimelineMap() {
      var tlEvents = document.querySelectorAll(".school-history-wrapper .timeline-event");
      var ev1922 = null;
      for (var i = 0; i < tlEvents.length; i++) {
        var dtEl = tlEvents[i].querySelector(".timeline-date");
        if (dtEl && dtEl.textContent.indexOf("1922") !== -1) {
          ev1922 = tlEvents[i];
          break;
        }
      }
      if (!ev1922 || document.getElementById("ptl22Wrap")) return;
      var origLink = ev1922.querySelector("a.image-link");
      var origImg = origLink ? origLink.querySelector("img") : null;
      if (!origLink || !origImg) return;

      var oldCapDiv = origLink.nextElementSibling;
      if (oldCapDiv && !oldCapDiv.classList.contains("pexp-tl-actions")) {
        oldCapDiv.style.display = "none";
      }

      var hotspots = [
        {
          badge: "1",
          short: "1. Περίσταση Θράκης",
          px: 84.9, py: 29.3,
          color: "#b45309",
          title: "\uD83C\uDFDB\uFE0F 1. Περίσταση Ανατολικής Θράκης (20/10/1922)",
          desc: "Η ακμαία πατρίδα στην ακτή της Προποντίδας (~9.000 κάτοικοι) με τα σπουδαία σχολεία, τα αμπέλια και τη ναυτιλία! Μέσα σε λίγες μέρες τον Οκτώβριο του 1922 οι προπαππούδες μας μάζεψαν τα ιερά κειμήλια και πήραν τον δρόμο της προσφυγιάς.",
          cta: "\u26F5 Δες τον 1ο Σταθμό στην Εξερεύνηση \u279C",
          go: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[0]) subBtns[0].click();
            renderStop(0);
          }
        },
        {
          badge: "\u26F5",
          short: "2. Ατμόπλοια & Κειμήλια",
          px: 90.8, py: 44.5,
          color: "#1d4ed8",
          title: "\u26F5 2. Τα Ατμόπλοια «Ωραία Ελλάς» & «Αθήναι»",
          desc: "Τα γυναικόπαιδα και οι γέροντες ταξίδεψαν από τη θάλασσα (Προποντίδα \u2192 Ελλήσποντος \u2192 Αιγαίο) φυλάγοντας σαν κόρη οφθαλμού τα 18 ξύλινα κιβώτια με τις εικόνες και τα ιερά κειμήλια της παλιάς Περίστασης!",
          cta: "\uD83D\uDCE6 Άνοιξε τα 18 Κιβώτια Κειμηλίων! \u279C",
          go: function() {
            window.openPeristasiModal("churches", false);
            openCratesInModal();
          }
        },
        {
          badge: "\uD83D\uDEDE",
          short: "3. Φάλαγγα Κάρων",
          px: 43.2, py: 29.8,
          color: "#d97706",
          title: "\uD83D\uDEDE 3. Η Φάλαγγα των Κάρων (~300 Άνδρες)",
          desc: "Περίπου 300 άνδρες ξεκίνησαν οδικώς μέσα στο φθινοπωρινό κρύο για να σώσουν τα κάρα και τα ζώα των οικογενειών, διασχίζοντας επί εβδομάδες τον Έβρο, τη Θράκη και την Καβάλα (~435 χλμ.)!",
          cta: "\uD83D\uDEDE Ετοίμασε το Κάρο του 1922! \u279C",
          go: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[0]) subBtns[0].click();
            renderStop(2);
            openCartGameInModal();
          }
        },
        {
          badge: "\uD83E\uDD1D",
          short: "4. Θεσσαλονίκη",
          px: 23.3, py: 38.3,
          color: "#4f46e5",
          title: "\uD83E\uDD1D 4. Θεσσαλονίκη: Το Μεγάλο Αντάμωμα",
          desc: "Στις 22/10/1922 έφτασαν πρώτα τα ατμόπλοια στο λιμάνι της Θεσσαλονίκης και αργότερα κατέφθασε από τη στεριά η φάλαγγα των κάρων! Μετά το συγκινητικό αντάμωμα, 130 οικογένειες κατηφόρισαν για την Πιερία.",
          cta: "\uD83D\uDDFA\uFE0F Δες το Αντάμωμα στον Χάρτη \u279C",
          go: function() {
            window.openPeristasiModal("route", true);
            if (subBtns && subBtns[0]) subBtns[0].click();
            renderStop(3);
          }
        },
        {
          badge: "\uD83C\uDFE1",
          short: "5. Νέα Περίσταση",
          px: 20.3, py: 59.8,
          color: "#059669",
          title: "\uD83C\uDFE1 5. Νέα Περίσταση Πιερίας (1923\u20131924)",
          desc: "Το 1923\u20131924 οι πρώτες 130 οικογένειες (~500 κάτοικοι) ρίζωσαν στη θέση «Λημέρι» μαζί με Θρακιώτες από τα Λούπιδα —και αργότερα Βλάχους, Σκοτεινιώτες και Πόντιους— χτίζοντας αμέσως τον Αη-Γιώργη και το σχολείο μας!",
          cta: "\u23F3 Δες το Χωριό μας το 1924 \u279C",
          go: function() {
            openPopulationAtYear(1924);
          }
        }
      ];

      var wrap = document.createElement("div");
      wrap.id = "ptl22Wrap";
      wrap.className = "ptl22-wrap";

      var pinsHtml = hotspots.map(function(h, idx) {
        return '<button type="button" class="ptl22-pin" data-hspot="' + idx + '" style="left:' + h.px + '%;top:' + h.py + '%;--p22-bg:' + h.color + '" aria-label="' + escAttr(h.short) + '" title="' + escAttr(h.short) + '">' +
          '<span class="ptl22-pin-dot">' + h.badge + '</span>' +
        '</button>';
      }).join("");

      var chipsHtml = hotspots.map(function(h, idx) {
        return '<button type="button" class="ptl22-chip" data-hchip="' + idx + '" style="--p22-c:' + h.color + '">' + h.short + '</button>';
      }).join("");

      var defaultHintHtml = '\uD83D\uDDFA\uFE0F <strong>Διαδραστικός Χάρτης 1922\u20131924:</strong> Πάτησε στα σημεία <strong>1\u20135</strong> (ή πάνω στο καράβι και στα κάρα), πάτησε <strong>«\u25B6\uFE0F Δες το ταξίδι να ζωντανεύει»</strong> ή πάτησε στον χάρτη για μεγέθυνση!';

      wrap.innerHTML =
        '<div class="ptl22-bar">' +
          '<button type="button" class="ptl22-play-btn" id="ptl22PlayBtn">\u25B6\uFE0F Δες το ταξίδι να ζωντανεύει</button>' +
          '<button type="button" class="ptl22-zoom-btn" id="ptl22ZoomBtn">\uD83D\uDD0D Μεγέθυνση</button>' +
        '</div>' +
        '<div class="ptl22-stage" id="ptl22Stage">' +
          '<svg class="ptl22-svg" viewBox="0 0 1000 568" preserveAspectRatio="none" aria-hidden="true">' +
            '<defs>' +
              '<filter id="ptl22LandSoft" x="-20%" y="-20%" width="140%" height="140%">' +
                '<feGaussianBlur stdDeviation="0.9"/>' +
              '</filter>' +
            '</defs>' +
            /* Αόρατη διόρθωση #1: Κάλυψη ανάποδης πορτοκαλί μύτης βέλους στην Περίσταση Θράκης & συνέχιση διακεκομμένης γραμμής */
            '<polygon points="823,160 845,159 846,181 822,182" fill="#ecebe3" filter="url(#ptl22LandSoft)"/>' +
            '<path d="M 844,168 Q 833,174 820,179" fill="none" stroke="#c3873b" stroke-width="3.2" stroke-dasharray="7,5" stroke-linecap="round"/>' +
            '<circle cx="849" cy="166.5" r="5.3" fill="#1e293b"/>' +
            /* Αόρατη διόρθωση #2: Κάλυψη ανάποδης μπλε μύτης βέλους στο Αιγαίο & σωστό βελάκι προς Θεσσαλονίκη */
            '<polygon points="644,244 676,242 676,269 644,282" fill="#ffffff"/>' +
            '<path d="M 677,253.8 L 643,268.5" fill="none" stroke="#244f7c" stroke-width="3.5" stroke-linecap="round"/>' +
            '<polygon points="650,265.5 660.2,254.4 659.2,261.5 665.1,265.8" fill="#244f7c"/>' +
            /* Φωτεινές γραμμές κίνησης «Στεριά vs Θάλασσα» */
            '<g id="ptl22AnimGroup" style="opacity:0;transition:opacity .25s">' +
              '<path id="ptl22SeaAnim" d="M 850,174 Q 838,214 776,242 Q 752,255 723,241 Q 698,244 666,258 L 535,317 Q 425,382 348,398 Q 252,402 224,312 Q 214,274 220,238 L 233,218" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round"/>' +
              '<path id="ptl22LandAnim" d="M 849,166.5 Q 792,202 738,197 Q 706,188 686,181 Q 658,198 632,197 Q 578,162 518,151 Q 468,158 430,170 Q 392,162 355,157 Q 286,162 233,218" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>' +
              '<path id="ptl22PieriaAnim" d="M 233,218 Q 186,242 180,295 Q 179,322 187,332 L 203,340" fill="none" stroke="#059669" stroke-width="5.2" stroke-linecap="round"/>' +
            '</g>' +
          '</svg>' +
          /* Αόρατες ζώνες αφής πάνω στο ατμόπλοιο και στα 3 κάρα ώστε να μένουν καθαρά τα σχέδια */
          '<button type="button" class="ptl22-hit-zone" data-hspot="1" style="left:87%;top:31%;width:9.5%;height:11.5%" aria-label="Ατμόπλοια 1922" title="Ατμόπλοια «Ωραία Ελλάς» &amp; «Αθήναι»"></button>' +
          '<button type="button" class="ptl22-hit-zone" data-hspot="2" style="left:32%;top:21%;width:35%;height:14%" aria-label="Φάλαγγα Κάρων 1922" title="Η Φάλαγγα των Κάρων στη Θράκη"></button>' +
          '<div class="ptl22-reunion" id="ptl22Reunion" style="left:23.3%;top:33.5%">\uD83E\uDD1D Αντάμωμα!</div>' +
          '<span class="ptl22-token" id="ptl22SeaTok">\u26F5</span>' +
          '<span class="ptl22-token ptl22-token--cart" id="ptl22LandTok">\uD83D\uDC0E</span>' +
          '<span class="ptl22-token ptl22-token--pieria" id="ptl22PieriaTok">\uD83C\uDFE1</span>' +
          pinsHtml +
        '</div>' +
        '<div class="ptl22-chips" id="ptl22Chips">' + chipsHtml + '</div>' +
        '<div class="ptl22-card ptl22-card--hint" id="ptl22Card" aria-live="polite">' + defaultHintHtml + '</div>';

      origLink.parentNode.insertBefore(wrap, origLink);
      var stageEl = document.getElementById("ptl22Stage");
      stageEl.insertBefore(origLink, stageEl.firstChild);

      var playBtn = document.getElementById("ptl22PlayBtn");
      var zoomBtn = document.getElementById("ptl22ZoomBtn");
      var animGroup = document.getElementById("ptl22AnimGroup");
      var seaPathEl = document.getElementById("ptl22SeaAnim");
      var landPathEl = document.getElementById("ptl22LandAnim");
      var pieriaPathEl = document.getElementById("ptl22PieriaAnim");
      var seaTok = document.getElementById("ptl22SeaTok");
      var landTok = document.getElementById("ptl22LandTok");
      var pieriaTok = document.getElementById("ptl22PieriaTok");
      var reunionEl = document.getElementById("ptl22Reunion");
      var cardEl = document.getElementById("ptl22Card");
      var chipsStrip = document.getElementById("ptl22Chips");
      var pinBtns = stageEl.querySelectorAll(".ptl22-pin");
      var chipBtns = wrap.querySelectorAll(".ptl22-chip");

      var activeSpot = -1;
      var animRaf = null;
      var isAnimRunning = false;
      var seaLen = 0, landLen = 0, pieriaLen = 0;

      function ensureLengths() {
        if (!seaLen && seaPathEl && seaPathEl.getTotalLength) {
          try {
            seaLen = seaPathEl.getTotalLength();
            landLen = landPathEl.getTotalLength();
            pieriaLen = pieriaPathEl.getTotalLength();
          } catch (e) {}
        }
        seaLen = seaLen || 890;
        landLen = landLen || 660;
        pieriaLen = pieriaLen || 145;
      }

     var stageW = 600, stageH = 340;
      function measureStage22() {
        if (!stageEl) return;
        stageW = stageEl.clientWidth || 600;
        stageH = stageEl.clientHeight || 340;
      }

      function initDash22(pathEl, len) {
        if (!pathEl) return;
        pathEl.style.strokeDasharray = len + " " + len;
        pathEl.style.strokeDashoffset = String(len);
      }

      function setStrokeFrac(pathEl, len, frac) {
        if (!pathEl) return;
        pathEl.style.strokeDashoffset = String(len * (1 - Math.max(0, Math.min(1, frac))));
      }

      function placeTokenAt(tokEl, pathEl, len, frac) {
        if (!tokEl || !pathEl || !pathEl.getPointAtLength) return;
        try {
          var pt = pathEl.getPointAtLength(Math.max(0, Math.min(1, frac)) * len);
          var tx = (pt.x / 1000) * stageW;
          var ty = (pt.y / 568) * stageH;
          tokEl.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) translate(-50%,-50%)";
        } catch (e) {}
      }

      stopMap1922Anim = function(keepTrails) {
        if (animRaf) {
          cancelAnimationFrame(animRaf);
          animRaf = null;
        }
        isAnimRunning = false;
        stageEl.classList.remove("is-animating");
        if (playBtn) {
          playBtn.classList.remove("is-playing");
          playBtn.textContent = keepTrails ? "\uD83D\uDD04 Ξαναπαίξε το ταξίδι" : "\u25B6\uFE0F Δες το ταξίδι να ζωντανεύει";
        }
        if (!keepTrails) {
          if (animGroup) animGroup.style.opacity = "0";
          if (seaTok) seaTok.classList.remove("is-vis");
          if (landTok) landTok.classList.remove("is-vis");
          if (pieriaTok) pieriaTok.classList.remove("is-vis");
          if (reunionEl) reunionEl.classList.remove("is-vis");
        }
      };

      function clearHotspot() {
        activeSpot = -1;
        pinBtns.forEach(function(b) { b.classList.remove("is-active"); });
        chipBtns.forEach(function(c) { c.classList.remove("is-active"); });
        if (cardEl) {
          cardEl.className = "ptl22-card ptl22-card--hint";
          cardEl.innerHTML = defaultHintHtml;
        }
      }

      function selectHotspot(idx) {
        stopMap1922Anim(false);
        var clean = (idx + hotspots.length) % hotspots.length;
        activeSpot = clean;
        var h = hotspots[clean];

        pinBtns.forEach(function(b, i) { b.classList.toggle("is-active", i === clean); });
        var actChip = null;
        chipBtns.forEach(function(c, i) {
          var isAct = (i === clean);
          c.classList.toggle("is-active", isAct);
          if (isAct) actChip = c;
        });
        if (chipsStrip && actChip && chipsStrip.scrollWidth > chipsStrip.clientWidth) {
          var scLeft = Math.max(0, actChip.offsetLeft - (chipsStrip.clientWidth - actChip.offsetWidth) / 2);
          if (chipsStrip.scrollTo) chipsStrip.scrollTo({ left: scLeft, behavior: "smooth" });
          else chipsStrip.scrollLeft = scLeft;
        }

        if (cardEl) {
          cardEl.className = "ptl22-card";
          cardEl.style.borderColor = h.color;
          cardEl.style.setProperty("--p22-c", h.color);
          cardEl.innerHTML =
            '<div class="ptl22-card-top">' +
              '<h4 class="ptl22-card-title">' + h.title + '</h4>' +
              '<div class="ptl22-card-nav">' +
                '<button type="button" class="ptl22-mini-btn" data-p22-step="-1" title="Προηγούμενο">\u2039</button>' +
                '<button type="button" class="ptl22-mini-btn" data-p22-step="1" title="Επόμενο">\u203A</button>' +
                '<button type="button" class="ptl22-mini-btn" data-p22-close="1" title="Κλείσιμο">\u2715</button>' +
              '</div>' +
            '</div>' +
            '<p class="ptl22-card-desc">' + h.desc + '</p>' +
            '<button type="button" class="ptl22-cta" data-p22-cta="1">' + h.cta + '</button>';
        }
      }

     function startMap1922Anim() {
        stopMap1922Anim(false);
        activeSpot = -1;
        pinBtns.forEach(function(b) { b.classList.remove("is-active"); });
        chipBtns.forEach(function(c) { c.classList.remove("is-active"); });

        ensureLengths();
        measureStage22();
        isAnimRunning = true;
        stageEl.classList.add("is-animating");
        if (playBtn) {
          playBtn.classList.add("is-playing");
          playBtn.textContent = "\u23F8\uFE0F Παύση";
        }
        initDash22(seaPathEl, seaLen);
        initDash22(landPathEl, landLen);
        initDash22(pieriaPathEl, pieriaLen);
        placeTokenAt(seaTok, seaPathEl, seaLen, 0);
        placeTokenAt(landTok, landPathEl, landLen, 0);
        if (animGroup) animGroup.style.opacity = "0.92";
        if (seaTok) seaTok.classList.add("is-vis");
        if (landTok) landTok.classList.add("is-vis");
        if (pieriaTok) pieriaTok.classList.remove("is-vis");
        if (reunionEl) reunionEl.classList.remove("is-vis");

        var phaseShown = 0;
        var seaDone = false, landDone = false, pieriaShown = false;
        var setLivePhase = function(ph, html) {
          if (phaseShown === ph || !cardEl) return;
          phaseShown = ph;
          cardEl.className = "ptl22-card ptl22-card--live";
          cardEl.style.borderColor = "";
          cardEl.innerHTML = html;
        };

        var t0 = performance.now();
        var totalMs = 5600;

        var step = function(now) {
          if (!isAnimRunning) return;
          var el = now - t0;

          if (!seaDone) {
            var uSea = Math.min(1, el / 2100);
            var eSea = 0.5 - 0.5 * Math.cos(Math.PI * uSea);
            setStrokeFrac(seaPathEl, seaLen, eSea);
            placeTokenAt(seaTok, seaPathEl, seaLen, eSea);
            if (uSea >= 1) seaDone = true;
          }

          if (!landDone) {
            var uLand = Math.min(1, el / 3700);
            var eLand = 0.5 - 0.5 * Math.cos(Math.PI * uLand);
            setStrokeFrac(landPathEl, landLen, eLand);
            placeTokenAt(landTok, landPathEl, landLen, eLand);
            if (uLand >= 1) landDone = true;
          }

          if (el < 2100) {
            setLivePhase(1, "\u26F5 <strong>20\u201322 Οκτ. 1922:</strong> Τα ατμόπλοια με τα γυναικόπαιδα &amp; τα 18 κιβώτια κειμηλίων διασχίζουν το Αιγαίο, ενώ οι ~300 άνδρες ξεκινούν αργά με τα κάρα στη Θράκη...");
          } else if (el < 3650) {
            setLivePhase(2, "\uD83D\uDEDE <strong>Πορεία στη Θράκη:</strong> Τα πλοία έφτασαν ήδη στη Θεσσαλονίκη και περιμένουν, ενώ τα κάρα περνούν με κόπο τον Έβρο και την Καβάλα!");
          } else if (el < 4250) {
            if (reunionEl) reunionEl.classList.add("is-vis");
            setLivePhase(3, "\uD83E\uDD1D <strong>Αντάμωμα στη Θεσσαλονίκη!</strong> Η φάλαγγα των κάρων φτάνει οδικώς και οι οικογένειες των Περιστασιανών ξανασμίγουν!");
          } else {
            if (!pieriaShown) {
              pieriaShown = true;
              if (seaTok) seaTok.classList.remove("is-vis");
              if (landTok) landTok.classList.remove("is-vis");
              if (pieriaTok) pieriaTok.classList.add("is-vis");
            }
            var uPieria = Math.min(1, (el - 4250) / 1350);
            var ePieria = 0.5 - 0.5 * Math.cos(Math.PI * uPieria);
            setStrokeFrac(pieriaPathEl, pieriaLen, ePieria);
            placeTokenAt(pieriaTok, pieriaPathEl, pieriaLen, ePieria);
            setLivePhase(4, "\uD83C\uDFE1 <strong>1923\u20131924 \u2022 Νέα Περίσταση Πιερίας:</strong> Οι πρώτες 130 οικογένειες (~500 κάτοικοι) κατεβαίνουν στην Πιερία και ριζώνουν στη θέση «Λημέρι»!");
          }

          if (el < totalMs) {
            animRaf = requestAnimationFrame(step);
          } else {
            animRaf = null;
            if (animGroup) animGroup.style.opacity = "0.72";
            stopMap1922Anim(true);
            if (cardEl) {
              cardEl.className = "ptl22-card ptl22-card--live";
              cardEl.innerHTML = "\u2728 <strong>Το ταξίδι ολοκληρώθηκε!</strong> Πάτησε τώρα στα σημεία <strong>1 έως 5</strong> πάνω στον χάρτη για να ανοίξεις τα 18 κιβώτια και τις ιστορίες κάθε σταθμού!";
            }
          }
        };

        animRaf = requestAnimationFrame(step);
      }

      isMap1922Active = function() { return isAnimRunning || activeSpot !== -1; };
      clearMap1922Spot = function() { stopMap1922Anim(false); clearHotspot(); };
      stepMap1922Spot = function(dir) { if (activeSpot !== -1) selectHotspot(activeSpot + dir); };

      window.addEventListener("resize", function() {
        if (isAnimRunning) measureStage22();
      }, { passive: true });

      if (typeof window.IntersectionObserver === "function") {
        var map22Obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(en) {
            wrap.classList.toggle("is-paused", !en.isIntersecting);
            if (!en.isIntersecting && isAnimRunning) {
              stopMap1922Anim(false);
              clearHotspot();
            }
          });
        }, { threshold: 0.05 });
        map22Obs.observe(wrap);
      }

      if (playBtn) {
        playBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (isAnimRunning) {
            stopMap1922Anim(false);
            clearHotspot();
          } else {
            startMap1922Anim();
          }
        });
      }

      if (zoomBtn) {
        zoomBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          stopMap1922Anim(false);
          origLink.click();
        });
      }

      var downPt = null, multiTouch = false;
      stageEl.addEventListener("touchstart", function(e) {
        multiTouch = !!(e.touches && e.touches.length > 1);
      }, { passive: true });
      stageEl.addEventListener("touchmove", function(e) {
        if (e.touches && e.touches.length > 1) multiTouch = true;
      }, { passive: true });
      stageEl.addEventListener("pointerdown", function(e) {
        if (e.isPrimary === false) { multiTouch = true; downPt = null; return; }
        multiTouch = false;
        downPt = { x: e.clientX, y: e.clientY };
      }, { passive: true });

      stageEl.addEventListener("click", function(e) {
        if (!e.isTrusted) return;
        if (e.detail === 0) {
          var kbHit = e.target.closest("[data-hspot]");
          if (kbHit) {
            e.preventDefault();
            e.stopPropagation();
            var kIdx = Number(kbHit.getAttribute("data-hspot"));
            if (kIdx === activeSpot) clearHotspot();
            else selectHotspot(kIdx);
          }
          return;
        }
        var dragged = !!(downPt && (Math.abs(e.clientX - downPt.x) > 6 || Math.abs(e.clientY - downPt.y) > 6));
        downPt = null;
        if (multiTouch || dragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        var hit = e.target.closest("[data-hspot]") || findClosestEl(pinBtns, e.clientX, e.clientY, 22, ".ptl22-pin-dot");
        if (hit) {
          e.preventDefault();
          e.stopPropagation();
          var hIdx = Number(hit.getAttribute("data-hspot"));
          if (hIdx === activeSpot) clearHotspot();
          else selectHotspot(hIdx);
          return;
        }
        if (isPinchZoomed()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      wrap.addEventListener("click", function(e) {
        var chip = e.target.closest("[data-hchip]");
        if (chip) {
          var cIdx = Number(chip.getAttribute("data-hchip"));
          if (cIdx === activeSpot) clearHotspot();
          else selectHotspot(cIdx);
          return;
        }
        var stBtn = e.target.closest("[data-p22-step]");
        if (stBtn && activeSpot !== -1) {
          selectHotspot(activeSpot + Number(stBtn.getAttribute("data-p22-step")));
          return;
        }
        if (e.target.closest("[data-p22-close]")) {
          clearHotspot();
          return;
        }
        if (e.target.closest("[data-p22-cta]") && activeSpot >= 0 && hotspots[activeSpot]) {
          hotspots[activeSpot].go();
        }
      });
    }

    upgrade1922TimelineMap();
    upgradeHeroVideo();
    upgradeRegionalMap();
    upgradeTwinMapsPortal();
  })();
