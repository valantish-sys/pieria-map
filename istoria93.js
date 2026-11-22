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
    var lastZoomFocusEl = null;
    var lastMapFocusEl = null;
    var lastRegFocusEl = null;
    var popPaneInited = false;
    var routePaneInited = false;
    var elevPaneInited = false;
    var churchesPaneInited = false;
    var initPopPane = function() {};
    var initRoutePane = function() {};
    var initElevPane = function() {};
    var initChurchesPane = function() {};
    var refreshCompassSun = function() {};
    var stopGrowTour = function() {};
    var bridgeJumpTimer = null;
    var mapReplayTimer = null;
    var stepPopulationMilestone = null;
    var capsuleOpen = false;
    var mirrorModalBox = null;
    var subBtns = [];
    var subJourney = null;
    var subToday = null;
   var lastZoomTriggerEl = null;
    var routePhotos = [];
    var currentStopIdx = 0;
    var renderStop = function() {};
    var stepRouteStop = function(d) { renderStop(currentStopIdx + d); };
    var resetRouteModeToBoth = function() {};
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

    var resizeHandlers = [];
    var centralResizeRaf = 0;
    var prevResizeW = window.innerWidth;
    var prevResizeH = window.innerHeight;
    function addResizeTask(fn) {
      resizeHandlers.push(fn);
    }
    window.addEventListener("resize", function() {
      var cw = window.innerWidth, ch = window.innerHeight;
      if (cw === prevResizeW && ch === prevResizeH) return;
      if (centralResizeRaf) return;
      centralResizeRaf = requestAnimationFrame(function() {
        centralResizeRaf = 0;
        var nw = window.innerWidth, nh = window.innerHeight;
        var wChanged = (nw !== prevResizeW);
        var hChanged = (nh !== prevResizeH);
        prevResizeW = nw;
        prevResizeH = nh;
       for (var i = 0; i < resizeHandlers.length; i++) {
          resizeHandlers[i](wChanged, hChanged);
        }
      });
    }, { passive: true });

    var sharedVisObs = null;
    var sharedVisMap = (typeof WeakMap === "function") ? new WeakMap() : null;
    function observeVisibility(el, cb) {
      if (!el || typeof window.IntersectionObserver !== "function") return;
      if (!sharedVisMap) {
        var fallbackObs = new IntersectionObserver(function(entries) {
          for (var i = 0; i < entries.length; i++) cb(entries[i].isIntersecting);
        }, { threshold: 0 });
        fallbackObs.observe(el);
        return;
      }
      if (!sharedVisObs) {
        sharedVisObs = new IntersectionObserver(function(entries) {
          for (var i = 0; i < entries.length; i++) {
            var fn = sharedVisMap.get(entries[i].target);
            if (fn) fn(entries[i].isIntersecting);
          }
        }, { threshold: 0 });
      }
      sharedVisMap.set(el, cb);
      sharedVisObs.observe(el);
    }

  function syncPendingOverlayState() {
      var curSt = window.history.state || {};
      var hasOverlaySt = !!(curSt.pexpModal || curSt.pexpZoom || curSt.pfacMapZoom || curSt.pregMapZoom);
      try {
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
          var zSt = { pexpZoom: true };
          var underModal = modal.classList.contains("is-open");
          var underMap = isMapZoomed;
          var underReg = isRegMapZoomed;
          if (underModal) { zSt.pexpModal = true; histModalOpen = true; }
          if (underMap) { zSt.pfacMapZoom = true; histMapOpen = true; }
          if (underReg) { zSt.pregMapZoom = true; histRegMapOpen = true; }
          histZoomOpen = true;
          if (!curSt.pexpZoom) {
            var validUnder = (underModal && curSt.pexpModal) || (underMap && curSt.pfacMapZoom) || (underReg && curSt.pregMapZoom);
            if (validUnder) {
              window.history.pushState(zSt, "", window.location.href);
            } else if (underModal || underMap || underReg) {
              var baseSt = underModal ? { pexpModal: true } : (underMap ? { pfacMapZoom: true } : { pregMapZoom: true });
              if (hasOverlaySt) window.history.replaceState(baseSt, "", window.location.href);
              else window.history.pushState(baseSt, "", window.location.href);
              window.history.pushState(zSt, "", window.location.href);
            } else if (hasOverlaySt) {
              window.history.replaceState(zSt, "", window.location.href);
            } else {
              window.history.pushState(zSt, "", window.location.href);
            }
          }
        } else if (modal.classList.contains("is-open")) {
          histModalOpen = true;
          if (!curSt.pexpModal || curSt.pexpZoom || curSt.pfacMapZoom || curSt.pregMapZoom) {
            if (hasOverlaySt) window.history.replaceState({ pexpModal: true }, "", window.location.href);
            else window.history.pushState({ pexpModal: true }, "", window.location.href);
          }
        } else if (isMapZoomed) {
          histMapOpen = true;
          if (!curSt.pfacMapZoom || curSt.pexpZoom || curSt.pexpModal || curSt.pregMapZoom) {
            if (hasOverlaySt) window.history.replaceState({ pfacMapZoom: true }, "", window.location.href);
            else window.history.pushState({ pfacMapZoom: true }, "", window.location.href);
          }
        } else if (isRegMapZoomed) {
          histRegMapOpen = true;
          if (!curSt.pregMapZoom || curSt.pexpZoom || curSt.pexpModal || curSt.pfacMapZoom) {
            if (hasOverlaySt) window.history.replaceState({ pregMapZoom: true }, "", window.location.href);
            else window.history.pushState({ pregMapZoom: true }, "", window.location.href);
          }
        }
      } catch (e) {}
    }

    function safeHistoryBack(steps) {
      var n = steps || 1;
      if (n <= 0) return;
      ignorePopCount++;
      if (ignorePopTimer) clearTimeout(ignorePopTimer);
      ignorePopTimer = setTimeout(function() {
        if (ignorePopCount > 0) {
          ignorePopCount = 0;
          syncPendingOverlayState();
        }
      }, 350);
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
      document.body.classList.add("pexp-overlay-open");
      bodyScrollLocked = true;
    }

    function unlockBodyScroll() {
      if (!bodyScrollLocked) return;
      if (modal.classList.contains("is-open") || isMapZoomed || isRegMapZoomed || (zoomOverlay && zoomOverlay.classList.contains("is-open"))) {
        return;
      }
      document.body.style.overflow = "";
      document.body.style.paddingRight = savedBodyPadRight;
      document.body.classList.remove("pexp-overlay-open", "pexp-zoom-open");
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
    var isOlympusGuessing = function() { return false; };
    var openPopulationAtYear = function(yr) {
      var prevFn = openPopulationAtYear;
      initPopPane(yr);
      if (openPopulationAtYear !== prevFn) openPopulationAtYear(yr);
    };
    var closeRegMapZoom = function() {};
   var pauseHeroVideo = function() {};
    var stopRegQuiz = function() {};
    var isRegQuizActive = function() { return false; };
    var isRegQuizGuessing = function() { return false; };
    var stopMap1922Anim = function() {};
    var stepMap1922Spot = null;
    var clearMap1922Spot = null;
    var isMap1922Active = function() { return false; };
    var openCratesInModal = function() {};
    var openCartGameInModal = function() {};
 var stepRegPinFn = null;
    var stepNeighborhoodNodeFn = null;
  var getRouteZoomGallery = null;
    var getElevZoomGallery = null;
    var syncRouteMapOnShow = function() {};
    var syncElevMapOnShow = function() {};
    var isNeighborhoodBusy = function() { return false; };
    var resetNeighborhoodMap = function() {};
    var switchRouteSub = function() {};
    var focusChurchOnNeighborhoodMap = function() {
      var prev = focusChurchOnNeighborhoodMap;
      upgradeNeighborhoodMap();
      if (focusChurchOnNeighborhoodMap !== prev) focusChurchOnNeighborhoodMap();
    };
    var activeRootKey = "";
    var mirrorOpen = false;
    var cartGameOpen = false;
    var olyStageOpen = false;
    var cratesGameOpen = false;
    var hasActiveSubGame = function() {
      return !!(activeRootKey || capsuleOpen || mirrorOpen || cartGameOpen || olyStageOpen || cratesGameOpen);
    };
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
        ".pfac-card{scroll-margin-top:14px}" +
        ".pfac-map-grow-btn{border-color:#c084fc!important;background:linear-gradient(135deg,#faf5ff 0%,#fdf2f8 100%)!important;color:#6b21a8!important}" +
        ".pfac-map-grow-btn:hover{background:#f3e8ff!important}" +
        ".pfac-map-grow-btn.is-playing{background:linear-gradient(135deg,#7c3aed 0%,#db2777 100%)!important;border-color:#7c3aed!important;color:#fff!important}" +
        ".pexp-sun-live{display:flex;align-items:center;gap:6px;margin:0 0 8px;padding:6px 10px;border-radius:11px;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);border:1.5px solid #fcd34d;color:#92400e;font-size:12px;font-weight:800;line-height:1.35;cursor:pointer;transition:transform .15s}" +
        ".pexp-sun-live:hover{transform:translateY(-1px)}" +
        ".pexp-sun-live.is-night{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-color:#475569;color:#e2e8f0}" +
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
       ".preg-viewport{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0;transition:transform .48s cubic-bezier(.22,1,.36,1)}" +
        ".preg-viewport.is-pieria-zoom{will-change:transform;transform:translate3d(-6%,-35%,0) scale(1.65)}" +
      ".preg-viewport img.preg-base-img{display:block;width:100%;height:100%;object-fit:fill;margin:0;border-radius:0;border:none;box-shadow:none;-webkit-user-drag:none;user-select:none;pointer-events:none}" +
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
       ".preg-qstrip-wrap{position:relative;display:flex;align-items:center;min-width:0;max-width:100%;margin-top:10px}" +
        ".preg-quick-strip{flex:1 1 auto;min-width:0;width:100%;display:flex;flex-wrap:nowrap!important;gap:6px;margin-top:0!important;padding:3px 2px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}" +
        ".preg-quick-strip::-webkit-scrollbar{display:none}" +
        "@media (hover:hover){.preg-quick-strip.is-scrollable{cursor:grab}}" +
        ".preg-quick-strip.has-fade-r{-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent 100%);mask-image:linear-gradient(90deg,#000 88%,transparent 100%)}" +
        ".preg-quick-strip.has-fade-l{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 100%)}" +
        ".preg-quick-strip.has-fade-l.has-fade-r{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 88%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 88%,transparent 100%)}" +
        ".preg-qstrip-nav{display:none;position:absolute;top:50%;transform:translateY(-50%);z-index:4;appearance:none;border:1.5px solid #93c5fd;background:rgba(255,255,255,.96);color:#1d4ed8;width:26px;height:26px;border-radius:999px;font-size:18px;font-weight:900;line-height:1;cursor:pointer;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(15,23,42,.16);transition:background .16s,color .16s}" +
        ".preg-qstrip-nav:hover{background:#1e6cff;border-color:#1e6cff;color:#fff}" +
        ".preg-qstrip-prev{left:2px}.preg-qstrip-next{right:2px}" +
        ".preg-qstrip-nav.is-vis{display:inline-flex}" +
        ".preg-qchip{flex:0 0 auto;appearance:none;border:1.5px solid #cbd5e1;background:#fff;color:#334155;font-family:inherit;font-size:12px;font-weight:800;padding:5px 10px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:all .16s}" +
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
        ".pexp-race-reset-btn{appearance:none;border:1.5px solid #64748b;background:#fff;color:#334155;font-family:inherit;font-size:12px;font-weight:800;padding:7px 13px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:all .16s}" +
        ".pexp-race-reset-btn:hover{border-color:#1e6cff;color:#1e6cff;background:#eff6ff}" +
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
      "#pexpImgZoom.pexp-img-zoom img{max-width:min(94vw,1200px)!important;transition:opacity .16s ease}" +
        ".pfac-map-wrap.is-zoomed{max-height:92vh!important;max-height:92dvh!important}" +
        ".pfac-map-wrap.is-zoomed .pfac-map-svg{max-height:calc(92vh - 210px)!important;max-height:calc(92dvh - 210px)!important}" +
        ".preg-wrap.is-zoomed{max-height:93vh!important;max-height:93dvh!important}" +
        ".preg-pin::before{inset:-4px}" +
        ".preg-pin.is-selected::before{display:none}" +
        ".preg-pin.is-out-zoom{opacity:0!important;pointer-events:none!important}" +
        ".preg-pin:hover{z-index:12}" +
        "#pexpRouteThumbs{grid-template-columns:repeat(auto-fit,minmax(44px,1fr))!important}" +
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
     "@media (max-width:640px){.pvid-kicker{font-size:10.5px;padding:3px 8px;top:8px;left:8px;max-width:calc(100% - 16px)}.pvid-center{padding-top:14px;gap:7px}.pvid-play-circle{width:54px;height:38px;border-radius:12px}.pvid-play-tri{border-width:8px 0 8px 14px}.pvid-play-lbl{font-size:11.5px;padding:4px 11px}.pvid-m-btn{flex:1 1 100%;justify-content:flex-start}.pexp-cent-cap{font-size:11.8px;padding:8px 10px}.pfac-map-status-left{align-items:flex-start;flex-basis:100%}.pfac-step-pill{white-space:normal;border-radius:10px;line-height:1.3}.pfac-safety-pill{border-radius:10px;white-space:normal}}" +
        ".pexp-pane,.pfac-map-wrap:not(.is-zoomed),.pfac-map-svg,.preg-wrap:not(.is-zoomed),.preg-stage,.preg-viewport{overscroll-behavior:auto!important;touch-action:auto!important}" +
        "#peristasiExplorerModal,.pexp-modal-overlay,.pexp-modal-box,.pexp-modal-body,#pexpModalBody,#pexpImgZoom,.pfac-map-modal-bg,.pfac-map-wrap.is-zoomed,.preg-modal-bg,.preg-wrap.is-zoomed{overscroll-behavior:contain!important;touch-action:auto!important}" +
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
   ".pexp-zoom-img-wrap{position:relative;display:inline-flex;flex:0 1 auto;min-height:0;max-width:min(94vw,1200px);align-items:center;justify-content:center;line-height:0}" +
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
      ".ptl22-stage{position:relative;width:100%;aspect-ratio:1000/568;border-radius:13px;overflow:hidden;border:1.5px solid #cbd5e1;background:#fff;user-select:none}" +
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
     extraCss.textContent +=
       "@keyframes pexpPulseRingGpu{0%,100%{transform:scale(.92);opacity:.95}50%{transform:scale(1.22);opacity:.38}}" +
        ".pexp-pulse-ring,#pfacMapPulse{pointer-events:none!important}" +
        ".pexp-pulse-ring{transform-box:fill-box;transform-origin:center;will-change:transform,opacity;animation:pexpPulseRingGpu 1.6s infinite ease-in-out!important}" +
        '.pexp-tab-btn[data-tab="churches"].is-active{background:linear-gradient(135deg,#b91c1c 0%,#991b1b 100%)!important;border-color:#991b1b!important;color:#fff!important;box-shadow:0 5px 14px rgba(169,14,14,.32)!important}' +
        "#pexp-pane-churches .pexp-stop-showcase{background:linear-gradient(180deg,#fff1f2 0%,#fffbeb 100%)!important;border-color:#fecdd3!important}" +
        "#pexpChurchBadge{background:#ffe4e6!important;color:#9f1239!important;border:1px solid #fecdd3}" +
        "#pexp-pane-churches .pexp-thumb-btn.is-active{border-color:#be123c!important}" +
        "#pexp-pane-churches .pexp-nav-btn{border-color:#be123c!important;color:#9f1239!important}" +
        "#pexp-pane-churches .pexp-nav-btn--primary{background:linear-gradient(135deg,#be123c 0%,#9f1239 100%)!important;color:#fff!important}" +
        "#pexpChurchMainImg.pexp-church-photo{background:linear-gradient(180deg,#fff1f2 0%,#fef3c7 100%)!important}" +
        "#pexp-pane-churches .pexp-zoom-hint{color:#9f1239!important}" +
        "#pexp-pane-churches .pexp-tag-flora{border-color:#fda4af!important;color:#9f1239!important;background:#fff!important}" +
        ".pexp-zoom-jump-btn{margin-top:9px;appearance:none;border:1.5px solid #fde047;background:linear-gradient(135deg,#1e40af 0%,#0284c7 100%);color:#fff;font-family:inherit;font-size:12.5px;font-weight:800;padding:7px 15px;border-radius:999px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45);display:none;align-items:center;gap:6px;z-index:100022;transition:transform .16s,filter .16s}" +
       ".pexp-zoom-jump-btn:hover{transform:translateY(-1px);filter:brightness(1.08)}" +
      ".pexp-zoom-jump-btn.is-vis{display:inline-flex;flex-shrink:0}" +
        "#pexpImgZoom{height:100vh!important;height:100dvh!important;max-height:100dvh!important;padding:14px 18px!important;box-sizing:border-box!important;outline:none}" +
        "#pexpImgZoomCap{flex-shrink:0;max-width:min(92vw,920px)}" +
        "#pexpImgZoom.pexp-img-zoom img{flex:0 1 auto;min-height:0!important;width:auto!important;height:auto!important;max-height:min(80vh,calc(100vh - 92px))!important;max-height:min(80dvh,calc(100dvh - 92px))!important;object-fit:contain!important}" +
        "#pexpImgZoom.has-jump-btn img{max-height:min(74vh,calc(100vh - 142px))!important;max-height:min(74dvh,calc(100dvh - 142px))!important}" +
        "@media (max-height:520px){#pexpImgZoom{padding:8px 52px!important}#pexpImgZoomCap{font-size:12px!important;line-height:1.32!important;margin-top:6px!important}.pexp-zoom-jump-btn{margin-top:6px!important;padding:5px 12px!important;font-size:11.8px!important}#pexpImgZoom.pexp-img-zoom img{max-width:min(84vw,1200px)!important;max-height:calc(100vh - 76px)!important;max-height:calc(100dvh - 76px)!important}#pexpImgZoom.has-jump-btn img{max-height:calc(100vh - 116px)!important;max-height:calc(100dvh - 116px)!important}}" +
        "@media (max-width:640px){.pfac-map-head{gap:6px;margin-bottom:8px}.pfac-map-title-group{width:100%;justify-content:space-between;gap:6px}.pfac-map-head-right{width:100%;gap:5px}.pfac-map-zoom-btn{flex:1 1 auto;text-align:center;font-size:11.2px;padding:5px 8px}}" +
     ".pfac-map-frame{position:relative;width:100%}" +
        ".pfac-map-scroll{position:relative;z-index:1;width:100%;touch-action:auto!important}" +
        ".pfac-street-zoom-pill{display:none}" +
        "@media (max-width:720px),(max-width:960px) and (max-height:520px){.pfac-map-wrap.is-zoomed{padding:10px!important;width:96vw!important}.pfac-map-wrap.is-zoomed .pfac-street-zoom-pill{display:inline-flex;align-items:center;gap:4px;position:absolute;left:8px;top:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.92);background:rgba(15,23,42,.78);color:#fff;font-family:inherit;font-size:10.8px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.24)}.pfac-map-wrap.is-zoomed .pfac-street-zoom-pill.is-active{background:#0284c7;border-color:#bae6fd}.pfac-map-wrap.is-zoomed .pfac-map-scroll{overflow:hidden;border-radius:14px;border:2px solid #86efac;background:#ecfdf5}.pfac-map-wrap.is-zoomed .pfac-map-svg{width:100%!important;min-width:0!important;max-width:100%!important;max-height:none!important;height:auto!important;border:none!important;border-radius:0!important;margin:0 auto!important}.pfac-map-wrap.is-zoomed .pfac-map-scroll.is-mobile-zoom{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain!important;scrollbar-width:thin}.pfac-map-wrap.is-zoomed .pfac-map-scroll.is-mobile-zoom .pfac-map-svg{min-width:680px!important;max-width:none!important;margin:0!important}}" +
        "@media (max-width:960px) and (max-height:520px){.pfac-map-wrap.is-zoomed .pfac-map-scroll:not(.is-mobile-zoom) .pfac-map-svg{width:auto!important;max-height:56vh!important;max-height:56dvh!important}.pfac-map-wrap.is-zoomed .pfac-map-scroll.is-mobile-zoom{overflow-y:auto!important;max-height:58vh!important;max-height:58dvh!important}.pfac-map-wrap.is-zoomed .pfac-map-head{margin-bottom:6px!important}.pfac-map-wrap.is-zoomed .pfac-map-status{margin-top:6px!important;padding:7px 10px!important}}" +
       ".pexp-pop-curve-wrap{margin:0 0 9px;padding:6px 10px 4px;border-radius:12px;background:rgba(255,255,255,.82);border:1.5px solid #dbeafe}" +
        ".pexp-pop-curve-head{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:11.2px;font-weight:800;color:#1e40af;margin-bottom:2px}" +
        ".pexp-pop-curve-svg{width:100%;height:auto;max-height:88px;display:block;cursor:pointer;user-select:none}" +
        ".pexp-comp-sun{transition:transform .45s cubic-bezier(.22,1,.36,1)}" +
        ".pexp-sun-modes{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 8px}" +
        ".pexp-sun-mbtn{appearance:none;border:1px solid #fcd34d;background:#fffbeb;color:#92400e;font-family:inherit;font-size:11px;font-weight:800;padding:3px 8px;border-radius:999px;cursor:pointer;transition:all .15s}" +
        ".pexp-sun-mbtn:hover{background:#fef3c7}" +
        ".pexp-sun-mbtn.is-active{background:#d97706;border-color:#d97706;color:#fff}" +
        "#pexpLiveTemp{flex:1 1 100%!important;white-space:normal!important;line-height:1.35;text-align:center}" +
        ".pfac-grow-steps{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}" +
        ".pfac-grow-step{appearance:none;border:1.5px solid #d8b4fe;background:#fff;color:#6b21a8;font-family:inherit;font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:999px;cursor:pointer;transition:all .15s}" +
        ".pfac-grow-step:hover{background:#f3e8ff}" +
        ".pfac-grow-step.is-active{background:#7c3aed;border-color:#7c3aed;color:#fff;box-shadow:0 2px 6px rgba(124,58,237,.25)}" +
        ".preg-panel-media-row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;margin:8px 0 10px}" +
        ".preg-panel-photo-wrap{flex:0 0 185px;max-width:100%}" +
        ".preg-panel-photo{width:185px;max-width:100%;height:118px;object-fit:cover;border-radius:12px;border:2px solid #93c5fd;cursor:zoom-in;display:block;background:#eff6ff}" +
        ".preg-panel-photo-cap{font-size:10.8px;font-weight:700;color:#0369a1;margin-top:3px;text-align:center}" +
       ".preg-panel-media-row .preg-panel-desc{flex:1 1 210px;min-width:0;margin:0}" +
        "@media (min-width:1200px){.preg-wrap.is-zoomed .preg-panel-photo-wrap{flex:1 1 100%}.preg-wrap.is-zoomed .preg-panel-photo{width:100%;height:122px}}" +
        "@media (max-width:640px){.preg-panel-photo-wrap{flex:1 1 100%}.preg-panel-photo{width:100%;height:144px}.pexp-pop-curve-head span:last-child{display:none}}";
      extraCss.textContent +=
        ".pexp-mirror-pill--curtain{border-color:#f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#eff6ff 100%);color:#92400e}" +
        ".pexp-mirror-pill--curtain:hover{border-color:#d97706;background:#fef3c7}" +
        ".pexp-mirror-pill--curtain.is-active{background:linear-gradient(135deg,#d97706 0%,#1e6cff 100%)!important;border-color:#d97706!important;color:#fff!important}" +
        ".pexp-curtain-wrap{margin:8px 0 10px}" +
        ".pexp-curtain-stage{position:relative;width:100%;height:265px;border-radius:14px;overflow:hidden;border:2px solid #93c5fd;background:#0f172a;user-select:none;-webkit-user-select:none;touch-action:pan-y;cursor:ew-resize}" +
        ".pexp-curtain-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;background:#f1f5f9}" +
        ".pexp-curtain-old-layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;clip-path:inset(0 calc(100% - var(--cpos,50%)) 0 0);-webkit-clip-path:inset(0 calc(100% - var(--cpos,50%)) 0 0);will-change:clip-path}" +
        ".pexp-curtain-badge{position:absolute;top:10px;z-index:3;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:900;pointer-events:none;box-shadow:0 3px 10px rgba(0,0,0,.28);transition:opacity .18s}" +
        ".pexp-curtain-badge--old{left:10px;background:rgba(254,243,199,.95);color:#92400e;border:1.5px solid #f59e0b}" +
        ".pexp-curtain-badge--new{right:10px;background:rgba(219,234,254,.95);color:#1e40af;border:1.5px solid #3b82f6}" +
        ".pexp-curtain-divider{position:absolute;top:0;bottom:0;left:var(--cpos,50%);width:3px;transform:translateX(-50%);background:#ffffff;box-shadow:0 0 10px rgba(15,23,42,.55);z-index:4;pointer-events:none}" +
        ".pexp-curtain-handle{appearance:none;position:absolute;top:50%;left:var(--cpos,50%);transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;border:2.5px solid #ffffff;background:linear-gradient(135deg,#d97706 0%,#1e6cff 100%);color:#ffffff;font-size:15px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(15,23,42,.45);z-index:5;cursor:ew-resize;padding:0;font-family:inherit}" +
        ".pexp-curtain-handle:focus-visible{outline:3px solid #fde047;outline-offset:2px}" +
        ".pexp-curtain-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;font-size:12px;font-weight:700;color:#475569}" +
        ".pexp-curtain-zoom-btn{appearance:none;border:1.5px solid #93c5fd;background:#ffffff;color:#1d4ed8;font-family:inherit;font-size:11.8px;font-weight:800;padding:4px 11px;border-radius:999px;cursor:pointer;transition:all .16s}" +
        ".pexp-curtain-zoom-btn:hover{background:#eff6ff;border-color:#1e6cff}" +
        ".pexp-mirror-swipe-hint{display:none;font-size:11.5px;font-weight:700;color:#92400e;text-align:center;margin-top:8px}" +
        "@media (max-width:720px){.pexp-mirror-swipe-hint{display:block}}" +
        ".pfac-map-status-right{display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px;flex-shrink:0}" +
        ".pfac-mode-switch{display:inline-flex;align-items:center;background:#ffffff;border:1.5px solid #93c5fd;border-radius:999px;padding:2px;gap:2px}" +
        ".pfac-mode-btn{appearance:none;border:none;background:transparent;color:#334155;font-family:inherit;font-size:11.8px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;transition:all .16s;white-space:nowrap}" +
        ".pfac-mode-btn:hover{color:#0f172a;background:#f1f5f9}" +
        ".pfac-mode-btn.is-active{background:#1e6cff;color:#ffffff;box-shadow:0 2px 6px rgba(30,108,255,.25)}" +
        '.pfac-mode-btn[data-pfac-tmode="bike"].is-active{background:#0284c7;color:#ffffff;box-shadow:0 2px 6px rgba(2,132,199,.28)}' +
       ".pfac-step-pill--bike{border-color:#38bdf8;color:#0369a1;background:#f0f9ff}" +
        ".pfac-safety-pill--bike{background:#ecfeff;border-color:#06b6d4;color:#0e7490}" +
        "@media (max-width:640px){.pexp-curtain-stage{height:205px}.pfac-map-status-right{width:100%;justify-content:space-between}}" +
        "body.pexp-overlay-open .preg-wrap:not(.is-zoomed) .preg-flow-line," +
        "body.pexp-zoom-open .preg-wrap .preg-flow-line," +
        "body.pexp-overlay-open .pvid-play-circle," +
        "body.pexp-zoom-open .pexp-pulse-ring," +
      ".pexp-pane:not(.is-active) .pexp-pulse-ring{animation-play-state:paused!important}" +
        "body.pexp-overlay-open .ptl22-pin-dot::after{animation:none!important;opacity:0!important}" +
       "#pexpDestBtns{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px}" +
        "@media (max-width:640px){#pexpDestBtns{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px}#pexpDestBtns .pexp-dest-btn{font-size:12.2px!important;padding:8px 8px!important}}" +
        ".preg-map-frame{position:relative;width:100%}" +
        ".preg-map-scroll{position:relative;z-index:1;width:100%;touch-action:auto!important}" +
        ".preg-zoom-pill,.preg-ruler-float{z-index:16!important}" +
        ".preg-wrap.is-zoomed .preg-stage.is-pieria-active{cursor:grab}" +
        ".preg-wrap.is-zoomed .preg-stage.is-panning{cursor:grabbing}" +
        "@media (min-width:721px) and (min-height:521px){.preg-wrap.is-zoomed .preg-map-frame{width:min(100%,calc((92vh - 195px) * 1.63));width:min(100%,calc((92dvh - 195px) * 1.63));margin:0 auto}.preg-wrap.is-zoomed .preg-stage{width:100%!important;margin:0!important}}" +
        "@media (min-width:1200px) and (min-height:521px){.preg-wrap.is-zoomed{padding:11px 15px}.preg-wrap.is-zoomed .preg-map-frame{width:min(100%,calc((93dvh - 196px) * 1.63))}.preg-wrap.is-zoomed.has-layer-note .preg-map-frame{width:min(100%,calc((93dvh - 242px) * 1.63))}}" +
        "@media (max-width:720px),(max-width:960px) and (max-height:520px){" +
          ".preg-wrap.is-zoomed{padding:10px!important;width:96vw!important}" +
          ".preg-wrap.is-zoomed .preg-map-frame{width:100%!important;margin:0!important}" +
          ".preg-wrap.is-zoomed .preg-map-scroll{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain!important;overscroll-behavior-y:auto!important;scrollbar-width:thin;border-radius:16px;border:2px solid #bae6fd;background:#dbeafe}" +
          ".preg-wrap.is-zoomed.has-pieria-zoom .preg-map-scroll{overflow-y:auto;max-height:56vh;max-height:56dvh}" +
          ".preg-wrap.is-zoomed .preg-stage{width:100%!important;min-width:680px!important;max-width:none!important;border:none!important;border-radius:0!important;margin:0!important;cursor:default}" +
          ".preg-wrap.is-zoomed .preg-stage.is-pieria-active{width:100%!important;min-width:1060px!important}" +
          ".preg-wrap.is-zoomed .preg-viewport.is-pieria-zoom{will-change:auto!important;transform:none!important}" +
          ".preg-wrap.is-zoomed .preg-pin{width:28px!important;height:28px!important}" +
          ".preg-wrap.is-zoomed .preg-pin--home{width:33px!important;height:33px!important}" +
          ".preg-wrap.is-zoomed .preg-pin-dot{font-size:13.5px!important;border-width:2px!important}" +
          ".preg-wrap.is-zoomed .preg-pin--home .preg-pin-dot{font-size:15.5px!important;border-width:2.5px!important}" +
          ".preg-wrap.is-zoomed .preg-pin-lbl{font-size:10.5px!important;padding:2.5px 8px!important}" +
          ".preg-wrap.is-zoomed .preg-zoom-pill{font-size:10.5px!important;padding:4px 9px!important;top:8px!important;left:8px!important}" +
          ".preg-wrap.is-zoomed .preg-ruler-float{font-size:10px!important;padding:3.5px 9px!important;right:12px!important;bottom:12px!important}" +
        "}" +
        "@media (max-width:960px) and (max-height:520px){.preg-wrap.is-zoomed .preg-map-scroll{overflow-y:auto!important;max-height:58vh!important;max-height:58dvh!important}}" +
        ".pexp-rmodes-wrap{position:relative;display:flex;align-items:center;min-width:0;max-width:100%}" +
        ".pexp-rmodes-more{display:none;position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:4;appearance:none;border:1.5px solid #93c5fd;background:rgba(239,246,255,.97);color:#1d4ed8;width:26px;height:26px;border-radius:999px;font-size:18px;font-weight:900;line-height:1;cursor:pointer;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 6px rgba(30,108,255,.2)}" +
        ".pexp-route-map-frame{position:relative;width:100%}" +
        ".pexp-route-map-scroll{position:relative;z-index:1;width:100%;touch-action:auto!important}" +
        ".pexp-route-zoom-pill{display:none}" +
        "@media (max-width:720px){" +
          ".pexp-map-bar{flex-direction:column!important;align-items:stretch!important;gap:6px!important}" +
          ".pexp-rmodes-wrap{width:100%}" +
          "#pexpRouteModes{flex:1 1 auto;min-width:0;width:100%;display:flex!important;flex-wrap:nowrap!important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px!important;padding:1px 6px 2px 0}" +
          "#pexpRouteModes::-webkit-scrollbar{display:none}" +
          "#pexpRouteModes .pexp-mini-pill{flex:0 0 auto;white-space:nowrap;font-size:12px!important;padding:5px 11px!important}" +
          "#pexpRouteModes.has-fade-r{-webkit-mask-image:linear-gradient(90deg,#000 86%,transparent 100%);mask-image:linear-gradient(90deg,#000 86%,transparent 100%)}" +
          "#pexpRouteModes.has-fade-l{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%)}" +
          "#pexpRouteModes.has-fade-l.has-fade-r{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 86%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 86%,transparent 100%)}" +
          ".pexp-rmodes-more.is-vis{display:inline-flex}" +
          ".pexp-route-zoom-pill{display:inline-flex;align-items:center;gap:4px;position:absolute;left:8px;top:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.9);background:rgba(15,23,42,.78);color:#fff;font-family:inherit;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.24)}" +
          ".pexp-route-zoom-pill.is-active{background:#0284c7;border-color:#bae6fd}" +
          ".pexp-route-map-scroll.is-mobile-zoom{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain!important;scrollbar-width:thin;border-radius:12px;border:1.5px solid #bae6fd;background:#dff0ff}" +
          ".pexp-route-map-scroll.is-mobile-zoom #pexpRouteSvg{width:660px!important;max-width:none!important;height:auto!important}" +
        "}" +
       ".pexp-elev-map-frame{position:relative;width:100%}" +
        ".pexp-elev-map-scroll{position:relative;z-index:1;width:100%;touch-action:auto!important}" +
        ".pexp-elev-zoom-pill,.pexp-elev-pan-hint{display:none}" +
        ".pexp-zone-hit:focus{outline:none}" +
        ".pexp-zone-hit:focus-visible circle{stroke:#fde047!important;stroke-width:4px!important}" +
        "@media (max-width:720px){" +
          ".pexp-elev-zoom-pill{display:inline-flex;align-items:center;gap:4px;position:absolute;left:8px;top:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.9);background:rgba(15,23,42,.78);color:#fff;font-family:inherit;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.24)}" +
          ".pexp-elev-zoom-pill.is-active{background:#0284c7;border-color:#bae6fd}" +
          ".pexp-elev-pan-hint{display:inline-flex;align-items:center;gap:3px;position:absolute;right:8px;top:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.9);background:rgba(109,40,217,.85);color:#fff;font-family:inherit;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:opacity .18s}" +
          ".pexp-elev-pan-hint.is-vis{opacity:1;pointer-events:auto}" +
          ".pexp-elev-map-scroll.is-mobile-zoom{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain!important;scrollbar-width:thin;border-radius:14px;border:1.5px solid #bae6fd;background:linear-gradient(180deg,#bae6fd 0%,#e0f2fe 65%,#ecfdf5 100%)}" +
          ".pexp-elev-map-scroll.is-mobile-zoom #pexpProfileSvg{width:720px!important;max-width:none!important;height:auto!important;border:none!important;border-radius:0!important;margin:0!important}" +
        "}" +
        "@media (hover:hover) and (max-width:720px){.pexp-route-map-scroll.is-mobile-zoom,.pexp-elev-map-scroll.is-mobile-zoom{cursor:grab}}" +
        "@media (hover:hover) and (max-width:720px),(hover:hover) and (max-width:960px) and (max-height:520px){.pfac-map-wrap.is-zoomed .pfac-map-scroll,.preg-wrap.is-zoomed .preg-map-scroll,.preg-wrap.is-zoomed .preg-stage{cursor:grab}}" +
        ".is-drag-scrolling,.is-drag-scrolling *{cursor:grabbing!important;user-select:none!important;-webkit-user-select:none!important}" +
        ".ptl22-hit-zone:focus,.ptl22-stage a.image-link:focus{outline:none}" +
        "@keyframes pexpOlyBounceUp{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,-5px)}}" +
        "@keyframes pexpOlyBounceDown{0%,100%{transform:translate(0,0)}50%{transform:translate(-5px,5px)}}" +
        ".pexp-oly-arrow-up{animation:pexpOlyBounceUp .75s ease-in-out 3}" +
        ".pexp-oly-arrow-down{animation:pexpOlyBounceDown .75s ease-in-out 3}" +
       "#pexpChurchMapBridgeBtn{margin-top:10px;border-color:#fda4af!important;background:#fff1f2!important;color:#9f1239!important}" +
        "#pexpChurchMapBridgeBtn:hover{background:#be123c!important;border-color:#be123c!important;color:#fff!important}" +
        ".ptl22-map-frame{position:relative;width:100%}" +
        ".ptl22-map-scroll{position:relative;z-index:1;width:100%;touch-action:auto!important}" +
        ".ptl22-stage img.responsive-img{-webkit-user-drag:none;user-select:none}" +
        ".ptl22-scroll-zoom-pill,.ptl22-pan-hint{display:none}" +
        "@media (max-width:720px){" +
          ".ptl22-scroll-zoom-pill{display:inline-flex;align-items:center;gap:4px;position:absolute;left:8px;top:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.9);background:rgba(15,23,42,.78);color:#fff;font-family:inherit;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.24)}" +
          ".ptl22-scroll-zoom-pill.is-active{background:#0284c7;border-color:#bae6fd}" +
          ".ptl22-pan-hint{display:inline-flex;align-items:center;gap:3px;position:absolute;left:8px;bottom:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.9);background:rgba(5,150,105,.88);color:#fff;font-family:inherit;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:opacity .18s}" +
          ".ptl22-pan-hint.is-vis{opacity:1;pointer-events:auto}" +
          ".ptl22-map-scroll.is-mobile-zoom{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain!important;scrollbar-width:thin;border-radius:13px;border:1.5px solid #cbd5e1;background:#fff}" +
          ".ptl22-map-scroll.is-mobile-zoom .ptl22-stage{width:680px!important;max-width:none!important;border:none!important;border-radius:0!important;margin:0!important}" +
          ".ptl22-stage a.image-link img{cursor:default}" +
          ".ptl22-map-scroll.is-mobile-zoom .ptl22-pin{width:26px!important;height:26px!important}" +
          ".ptl22-map-scroll.is-mobile-zoom .ptl22-pin-dot{font-size:12px!important;border-width:2px!important}" +
          ".ptl22-map-scroll.is-mobile-zoom .ptl22-token{width:27px!important;height:27px!important;font-size:14px!important}" +
          ".ptl22-map-scroll.is-mobile-zoom .ptl22-reunion{font-size:11px!important;padding:3px 9px!important}" +
          ".ptl22-chips{flex-wrap:nowrap!important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}" +
          ".ptl22-chips::-webkit-scrollbar{display:none}" +
          ".ptl22-chips.has-fade-r{-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent 100%);mask-image:linear-gradient(90deg,#000 88%,transparent 100%)}" +
          ".ptl22-chips.has-fade-l{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%)}" +
          ".ptl22-chips.has-fade-l.has-fade-r{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 88%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 88%,transparent 100%)}" +
        "}" +
      "@media (hover:hover) and (max-width:720px){.ptl22-map-scroll.is-mobile-zoom,.ptl22-map-scroll.is-mobile-zoom a.image-link img{cursor:grab}}" +
        ".preg-pin.is-gpu-pos{left:0!important;top:0!important;will-change:transform;transition:opacity .2s!important}" +
        ".preg-stage.is-zoom-anim .preg-pin.is-gpu-pos{transition:transform .48s cubic-bezier(.22,1,.36,1),opacity .2s!important}" +
        ".preg-pin.is-gpu-pos:hover .preg-pin-dot{transform:scale(1.12)}" +
        ".preg-pin.is-gpu-pos.is-hidden-layer .preg-pin-dot{transform:scale(.4)}" +
        ".pexp-route-pan-hint{display:none}" +
       ".preg-head{flex-direction:column;align-items:stretch;gap:7px;margin-bottom:9px}" +
        ".preg-head-actions{width:100%;display:flex;flex-wrap:wrap;gap:7px}" +
        ".preg-act-btn{flex:1 1 auto;text-align:center;white-space:nowrap;padding:6px 11px}" +
        "@media (min-width:960px){.preg-wrap.is-zoomed .preg-head{flex-direction:row;align-items:center;justify-content:space-between}.preg-wrap.is-zoomed .preg-head-actions{width:auto;flex:0 0 auto}.preg-wrap.is-zoomed .preg-act-btn{flex:0 0 auto}}" +
        ".preg-layers-wrap{position:relative;display:flex;align-items:center;min-width:0;max-width:100%;margin-bottom:10px;padding:4px;border-radius:14px;background:#e8f1fb;border:1.5px solid #cfe0f5}" +
        "#pregLayerBtns{flex:1 1 auto;min-width:0;width:100%;display:flex!important;flex-wrap:nowrap!important;gap:4px!important;margin-bottom:0!important;padding:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}" +
        "#pregLayerBtns::-webkit-scrollbar{display:none}" +
        "#pregLayerBtns .preg-layer-btn{flex:1 0 auto;text-align:center;white-space:nowrap;border:1.5px solid transparent;background:transparent;color:#334155;border-radius:10px;padding:6px 10px;font-size:12.5px;box-shadow:none}" +
        "#pregLayerBtns .preg-layer-btn:hover{background:rgba(255,255,255,.78);border-color:transparent;color:#0f172a}" +
        "#pregLayerBtns .preg-layer-btn.is-active{background:#1e6cff;border-color:#1e6cff;color:#fff;box-shadow:0 3px 9px rgba(30,108,255,.24)}" +
        "#pregLayerBtns.has-fade-r{-webkit-mask-image:linear-gradient(90deg,#000 86%,transparent 100%);mask-image:linear-gradient(90deg,#000 86%,transparent 100%)}" +
        "#pregLayerBtns.has-fade-l{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%)}" +
        "#pregLayerBtns.has-fade-l.has-fade-r{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 86%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 86%,transparent 100%)}" +
        ".preg-layers-more{display:none;position:absolute;right:4px;top:50%;transform:translateY(-50%);z-index:4;appearance:none;border:1.5px solid #93c5fd;background:rgba(239,246,255,.97);color:#1d4ed8;width:26px;height:26px;border-radius:999px;font-size:18px;font-weight:900;line-height:1;cursor:pointer;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 6px rgba(30,108,255,.2)}" +
        ".preg-layers-more.is-vis{display:inline-flex}" +
        ".preg-act-btn--quiz{border-color:#f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);color:#b45309}" +
        ".preg-act-btn--quiz:hover{background:#d97706;border-color:#d97706;color:#fff}" +
        ".preg-act-btn--quiz.is-active{background:linear-gradient(135deg,#d97706 0%,#ea580c 100%);border-color:#c2410c;color:#fff;box-shadow:0 4px 12px rgba(217,119,6,.28)}" +
        ".preg-quiz-box{margin:0 0 10px;padding:11px 13px;border-radius:16px;border:2px solid #fbbf24;background:linear-gradient(180deg,#fffbeb 0%,#f0fdf4 100%);box-shadow:0 4px 14px rgba(15,23,42,.06)}" +
        ".preg-quiz-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}" +
        ".preg-quiz-kicker{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:900;color:#b45309;flex-wrap:wrap}" +
        ".preg-quiz-dots{display:inline-flex;align-items:center;gap:4px}" +
        ".preg-quiz-dot{width:8px;height:8px;border-radius:50%;background:#fde68a;border:1px solid #f59e0b}" +
        ".preg-quiz-dot.is-done{background:#10b981;border-color:#059669}" +
        ".preg-quiz-dot.is-cur{background:#d97706;border-color:#92400e;transform:scale(1.22)}" +
        ".preg-quiz-q{font-size:14px;font-weight:800;color:#0f172a;line-height:1.38;margin:0 0 8px}" +
        ".preg-quiz-fb{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:7px 10px;border-radius:11px;background:#fff;border:1.5px solid #fde68a;font-size:12.5px;font-weight:700;color:#334155;line-height:1.38}" +
        ".preg-quiz-fb.is-warn{background:#fef2f2;border-color:#fca5a5;color:#991b1b}" +
        ".preg-quiz-fb.is-win{background:#dcfce7;border-color:#4ade80;color:#14532d}" +
        ".preg-quiz-win-row{display:flex;align-items:center;gap:9px;flex:1 1 210px;min-width:0}" +
        ".preg-quiz-thumb{width:54px;height:42px;object-fit:cover;border-radius:8px;border:2px solid #4ade80;flex-shrink:0;cursor:zoom-in;background:#fff}" +
        ".preg-quiz-next-btn{appearance:none;border:none;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#fff;font-family:inherit;font-size:12.5px;font-weight:900;padding:7px 14px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(5,150,105,.28);white-space:nowrap}" +
     "#pfacPillsList{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:8px!important;max-width:720px;margin:12px auto 8px!important;padding:0!important;list-style:none!important}" +
        "#pfacPillsList li{padding:8px 14px!important;margin:0!important;font-size:14.6px!important;font-weight:800!important;line-height:1.3!important;border-radius:999px!important;display:inline-flex!important;align-items:center!important;gap:5px!important;white-space:nowrap!important}" +
        "#pfacPillsList li::before,#pfacPillsList li::after{content:none!important;display:none!important}" +
      "@media (max-width:640px){#pfacPillsList{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;width:100%!important;max-width:100%!important}#pfacPillsList li{width:100%!important;min-width:0!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-height:44px!important;padding:9px clamp(5px,2vw,10px)!important;font-size:clamp(11.4px,3.35vw,13.6px)!important;line-height:1.22!important;border-radius:16px!important;white-space:normal!important;overflow-wrap:break-word!important}#pfacPillsList li[data-fac='0']{grid-column:1/-1!important;min-height:46px!important;padding:10px 14px!important;font-size:clamp(13px,3.8vw,14.8px)!important}}" +
        ".preg-wrap.is-quiz-mode .preg-qstrip-wrap,.preg-wrap.is-quiz-mode .preg-panel-nav,.preg-wrap.is-quiz-mode #pregZoomPieriaBtn,.preg-wrap.is-quiz-guessing .preg-panel,.preg-wrap.is-quiz-guessing .preg-ruler-float{display:none!important}" +
        ".preg-wrap.is-quiz-guessing .preg-pin-lbl{display:none!important}" +
        "@media (min-width:1200px){.preg-wrap.is-zoomed.is-quiz-guessing .preg-body-grid{grid-template-columns:minmax(0,1fr)!important}}" +
        "@keyframes pregWrongShake{0%,100%{transform:translateX(0) scale(1)}25%{transform:translateX(-4px) scale(1.1)}75%{transform:translateX(4px) scale(1.1)}}" +
        ".preg-pin.is-quiz-wrong .preg-pin-dot{animation:pregWrongShake .34s ease-in-out 2;box-shadow:0 0 0 4px rgba(239,68,68,.88)!important}" +
        "@media (max-width:768px){" +
          ".preg-wrap.is-quiz-mode .preg-layers-wrap{display:none}" +
          ".preg-wrap.is-quiz-guessing:not(.is-zoomed) .preg-pin{width:21px!important;height:21px!important}" +
          ".preg-wrap.is-quiz-guessing:not(.is-zoomed) .preg-pin-dot{font-size:10.8px!important}" +
        "}" +
       "@media (max-width:720px){" +
          ".pexp-route-pan-hint{display:inline-flex;align-items:center;gap:3px;position:absolute;left:8px;bottom:8px;z-index:6;appearance:none;border:1.5px solid rgba(255,255,255,.9);background:rgba(5,150,105,.88);color:#fff;font-family:inherit;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:opacity .18s}" +
          ".pexp-route-pan-hint.is-vis{opacity:1;pointer-events:auto}" +
        "}" +
        "@media (max-width:640px){" +
          ".pexp-delta-extra{display:none}" +
          ".pexp-pop-curve-head span:last-child{display:inline!important;color:#047857;white-space:nowrap}" +
          ".preg-head-actions{width:100%;gap:5px}" +
          ".preg-act-btn{flex:1 1 auto;text-align:center;font-size:11.3px;padding:5px 8px}" +
       ".preg-layers-wrap{padding:3px;border-radius:12px}" +
          "#pregLayerBtns{justify-content:flex-start!important;padding:0 26px 0 6px!important}" +
          "#pregLayerBtns .preg-layer-btn{flex:0 0 auto!important;font-size:11.8px!important;padding:5px 9px!important;border-radius:9px}" +
          ".preg-quiz-box{padding:9px 10px;margin-bottom:8px}" +
          ".preg-quiz-q{font-size:13px;margin-bottom:6px}" +
          ".preg-quiz-fb{font-size:12px;padding:6px 9px}" +
          ".preg-quiz-next-btn{width:100%;text-align:center;padding:8px 12px}" +
        "}" +
        "#pregMapWrap .preg-layers-wrap #pregLayerBtns,#pregMapWrap .preg-quick-strip{justify-content:flex-start!important;flex-wrap:nowrap!important;overflow-x:auto!important;width:100%!important;min-width:0!important}" +
        "#pregMapWrap .preg-layers-wrap #pregLayerBtns .preg-layer-btn,#pregMapWrap .preg-qchip{margin:0!important;flex:0 0 auto!important}" +
        ".pexp-tabs-more-btn.is-left,.pexp-rmodes-more.is-left,.preg-layers-more.is-left{right:auto!important;left:2px!important}" +
        ".pfac-map-wrap.is-zoomed .pfac-map-scroll:not(.is-mobile-zoom){cursor:default!important}" +
        "@media (hover:hover){#pexpTabs.is-scrollable,#pexpRouteModes.is-scrollable,#pregLayerBtns.is-scrollable,#ptl22Chips.is-scrollable{cursor:grab}}";
      (document.body || document.head).appendChild(extraCss);
    }

    var noThumbUrls = {};
    function cleanRawUrl(url) {
      if (!url || typeof url !== "string") return url;
      if (url.indexOf("Special:FilePath/") !== -1) return url.replace(/[?&]width=\d+/, "");
      return url;
    }

    function optImg(url, maxDim) {
      if (!url || typeof url !== "string" || url.indexOf("data:") === 0) return url;
      var rawClean = cleanRawUrl(url);
      if (noThumbUrls[url] || (rawClean && noThumbUrls[rawClean])) return rawClean || url;
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

   var preloadedUrls = {};
    var preloadPool = [];
    var preloadQueue = [];
    function pumpPreloadQueue() {
      while (preloadPool.length < 4 && preloadQueue.length > 0) {
        var nextUrl = preloadQueue.shift();
        var im = new Image();
        var release = (function(imgObj) {
          return function() {
            imgObj.onload = imgObj.onerror = null;
            var ix = preloadPool.indexOf(imgObj);
            if (ix !== -1) preloadPool.splice(ix, 1);
            pumpPreloadQueue();
          };
        })(im);
        im.onload = release;
        im.onerror = release;
        im.decoding = "async";
        preloadPool.push(im);
        im.src = nextUrl;
      }
    }
    function preloadImg(url) {
      if (!url || preloadedUrls[url] || url.indexOf("data:") === 0) return;
      var conn = navigator && (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
      if (conn && (conn.saveData || (conn.effectiveType && /2g/.test(conn.effectiveType)))) return;
      preloadedUrls[url] = true;
      var enqueueTask = function() {
        if (preloadQueue.length >= 10) preloadQueue.shift();
        preloadQueue.push(url);
        pumpPreloadQueue();
      };
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(enqueueTask, { timeout: 600 });
      } else {
        setTimeout(enqueueTask, 140);
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

      var rawMythUrl = (mythologyMapUrl || "").trim();
      var cleanMythUrl = (!/[?&]m=1\b/.test(window.location.search || ""))
        ? rawMythUrl.replace(/([?&])m=1(&|$)/, function(_, p1, p2) { return p2 ? p1 : ""; }).replace(/[?&]$/, "")
        : rawMythUrl;
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
        addResizeTask(function(wChanged) {
          if (wChanged) syncMythPortalLink();
        });

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
      var curtainPct = 50;

      stageEl._stepMirror = function(dir) {
        if (!stageEl || stageEl.style.display === "none" || !stageEl.innerHTML) return false;
        curScene = (curScene + dir + schoolMirrorScenes.length) % schoolMirrorScenes.length;
        draw();
        return true;
      };

      if (!stageEl._mirrorSwipeBound) {
        stageEl._mirrorSwipeBound = true;
        var msx = 0, msy = 0, mMulti = false, mIgnore = false;
        stageEl.addEventListener("touchstart", function(e) {
          if (e.touches.length > 1 || isPinchZoomed()) { mMulti = true; return; }
          var tgt = e.target;
          var inCurtain = !!(tgt && tgt.closest && tgt.closest(".pexp-curtain-stage"));
          mIgnore = inCurtain || hasHorizontalScroll(tgt, stageEl);
          mMulti = false;
          msx = e.touches[0].screenX;
          msy = e.touches[0].screenY;
        }, { passive: true });
        stageEl.addEventListener("touchmove", function(e) {
          if (e.touches.length > 1 || isPinchZoomed()) mMulti = true;
        }, { passive: true });
        stageEl.addEventListener("touchend", function(e) {
          if (mMulti || mIgnore || e.touches.length > 0 || isPinchZoomed()) return;
          var dx = e.changedTouches[0].screenX - msx;
          var dy = e.changedTouches[0].screenY - msy;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2 && stageEl._stepMirror) {
            stageEl._stepMirror(dx < 0 ? 1 : -1);
          }
        }, { passive: true });
      }

      function bindCurtainStage(cStage) {
        if (!cStage) return;
        var oldBadge = cStage.querySelector(".pexp-curtain-badge--old");
        var newBadge = cStage.querySelector(".pexp-curtain-badge--new");
        var handleEl = cStage.querySelector(".pexp-curtain-handle");
        var zoomBtn = stageEl.querySelector(".pexp-curtain-zoom-btn");

        var applyPct = function(val) {
          curtainPct = Math.max(2, Math.min(98, val));
          cStage.style.setProperty("--cpos", curtainPct.toFixed(1) + "%");
          if (oldBadge) oldBadge.style.opacity = curtainPct < 14 ? "0" : "1";
          if (newBadge) newBadge.style.opacity = curtainPct > 86 ? "0" : "1";
          if (handleEl) handleEl.setAttribute("aria-valuenow", String(Math.round(curtainPct)));
          if (zoomBtn) zoomBtn.setAttribute("data-m-zoom", curtainPct < 50 ? "1" : "0");
        };
        applyPct(curtainPct);

        var updateFromClientX = function(clientX, rect) {
          if (!rect || !rect.width) return;
          applyPct(((clientX - rect.left) / rect.width) * 100);
        };

       var dragging = false;
        var activePtrId = null;
        var cRect = null;
        cStage.addEventListener("pointerdown", function(e) {
          if (e.isPrimary === false || e.pointerType === "touch") return;
          if (e.pointerType === "mouse" && e.button !== 0) return;
          dragging = true;
          activePtrId = e.pointerId;
          cRect = cStage.getBoundingClientRect();
          updateFromClientX(e.clientX, cRect);
          if (cStage.setPointerCapture) {
            try { cStage.setPointerCapture(e.pointerId); } catch (err) {}
          }
        });
        cStage.addEventListener("pointermove", function(e) {
          if (!dragging || e.pointerId !== activePtrId) return;
          updateFromClientX(e.clientX, cRect || cStage.getBoundingClientRect());
        });
        var stopDrag = function(e) {
          if (dragging && (!e || e.pointerId === activePtrId)) {
            dragging = false;
            activePtrId = null;
          }
        };
        cStage.addEventListener("pointerup", stopDrag);
        cStage.addEventListener("pointercancel", stopDrag);

        var tsx = 0, tsy = 0, tLock = 0;
        cStage.addEventListener("touchstart", function(e) {
          if (!e.touches || e.touches.length !== 1 || isPinchZoomed()) { tLock = -1; return; }
          cRect = cStage.getBoundingClientRect();
          tsx = e.touches[0].clientX;
          tsy = e.touches[0].clientY;
          tLock = e.target.closest(".pexp-curtain-handle") ? 1 : 0;
        }, { passive: true });
        cStage.addEventListener("touchmove", function(e) {
          if (tLock === -1 || !e.touches || e.touches.length !== 1) return;
          var cx = e.touches[0].clientX;
          var cy = e.touches[0].clientY;
          if (tLock === 0) {
            var dx = Math.abs(cx - tsx), dy = Math.abs(cy - tsy);
            if (dx < 5 && dy < 5) return;
            tLock = (dx >= dy * 0.85) ? 1 : -1;
          }
          if (tLock === 1) {
            if (e.cancelable) e.preventDefault();
            updateFromClientX(cx, cRect || cStage.getBoundingClientRect());
          }
        }, { passive: false });
        cStage.addEventListener("touchend", function(e) {
          if (tLock === 0 && !isPinchZoomed() && e.changedTouches && e.changedTouches.length === 1) {
            var ex = e.changedTouches[0].clientX;
            var ey = e.changedTouches[0].clientY;
            if (Math.abs(ex - tsx) < 8 && Math.abs(ey - tsy) < 8) {
              updateFromClientX(ex, cRect || cStage.getBoundingClientRect());
            }
          }
          tLock = 0;
        }, { passive: true });

        if (handleEl) {
          handleEl.addEventListener("keydown", function(e) {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              e.stopPropagation();
              applyPct(curtainPct + (e.key === "ArrowRight" ? 5 : -5));
            }
          });
        }
      }

      function draw() {
        var sc = schoolMirrorScenes[curScene];
        var isCurtain = (viewMode === "curtain");
        var tabsHtml = schoolMirrorScenes.map(function(s, i) {
          return '<button type="button" class="pexp-mirror-tab' + (i === curScene ? ' is-active' : '') + '" data-m-tab="' + i + '">' + s.tab + '</button>';
        }).join("");

        var photo1926Html = isCurtain
          ? ''
          : '<img class="pexp-era-photo" src="' + optImg(sc.oldImg, 640) + '" data-full-src="' + escAttr(sc.oldImg) + '" alt="' + escAttr(sc.oldCap) + '" data-m-zoom="0" loading="lazy"/>';

        var photo2026Html = isCurtain
          ? ''
          : '<img class="pexp-era-photo" src="' + optImg(sc.newImg, 640) + '" data-full-src="' + escAttr(sc.newImg) + '" alt="' + escAttr(sc.newCap) + '" data-m-zoom="1" loading="lazy"/>';

        var card1926 =
          '<div class="pexp-era-card pexp-era-1926">' +
            '<div class="pexp-era-head">' +
              '<span class="pexp-era-yr">\uD83D\uDD70\uFE0F 1926 \u2022 Πριν 100 Χρόνια</span>' +
              '<span class="pexp-era-icons">' + sc.oldIcons + '</span>' +
            '</div>' +
            photo1926Html +
            '<h5 class="pexp-era-title">' + sc.oldTitle + '</h5>' +
            '<p class="pexp-era-desc">' + sc.oldDesc + '</p>' +
          '</div>';

        var card2026 =
          '<div class="pexp-era-card pexp-era-2026">' +
            '<div class="pexp-era-head">' +
              '<span class="pexp-era-yr">\uD83D\uDE80 2026 \u2022 Σήμερα στο 12/Θ</span>' +
              '<span class="pexp-era-icons">' + sc.newIcons + '</span>' +
            '</div>' +
            photo2026Html +
            '<h5 class="pexp-era-title">' + sc.newTitle + '</h5>' +
            '<p class="pexp-era-desc">' + sc.newDesc + '</p>' +
          '</div>';

        var curtainHtml = isCurtain
          ? '<div class="pexp-curtain-wrap">' +
              '<div class="pexp-curtain-stage" style="--cpos:' + curtainPct.toFixed(1) + '%">' +
                '<img class="pexp-curtain-img" src="' + optImg(sc.newImg, 960) + '" data-full-src="' + escAttr(sc.newImg) + '" alt="' + escAttr(sc.newCap) + '"/>' +
                '<div class="pexp-curtain-old-layer">' +
                  '<img class="pexp-curtain-img" src="' + optImg(sc.oldImg, 960) + '" data-full-src="' + escAttr(sc.oldImg) + '" alt="' + escAttr(sc.oldCap) + '"/>' +
                '</div>' +
                '<span class="pexp-curtain-badge pexp-curtain-badge--old">\uD83D\uDD70\uFE0F 1926\u20131947</span>' +
                '<span class="pexp-curtain-badge pexp-curtain-badge--new">\uD83D\uDE80 2026</span>' +
                '<div class="pexp-curtain-divider"></div>' +
                '<button type="button" class="pexp-curtain-handle" role="slider" aria-label="Σύρε τον χρόνο ανάμεσα στο 1926 και το 2026" aria-valuemin="2" aria-valuemax="98" aria-valuenow="' + Math.round(curtainPct) + '">\u2194</button>' +
              '</div>' +
              '<div class="pexp-curtain-bar">' +
                '<span>\u2728 Σύρε τη γραμμή αριστερά-δεξιά για να αποκαλύψεις το 2026 πίσω από το 1926!</span>' +
                '<button type="button" class="pexp-curtain-zoom-btn" data-m-zoom="' + (curtainPct < 50 ? '1' : '0') + '">\uD83D\uDD0D Μεγέθυνση 1926 &amp; 2026</button>' +
              '</div>' +
            '</div>'
          : '';

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
                '<button type="button" class="pexp-mirror-pill pexp-mirror-pill--curtain' + (isCurtain ? ' is-active' : '') + '" data-m-mode="curtain">\u2728 Σύρε 1926 \u2194 2026</button>' +
                '<button type="button" class="pexp-mirror-pill' + (viewMode === '1926' ? ' is-active' : '') + '" data-m-mode="1926">\uD83D\uDD70\uFE0F 1926</button>' +
                '<button type="button" class="pexp-mirror-pill' + (viewMode === '2026' ? ' is-active' : '') + '" data-m-mode="2026">\uD83D\uDE80 2026</button>' +
              '</div>' +
            '</div>' +
            curtainHtml +
            '<div class="pexp-mirror-pair">' + pairHtml + '</div>' +
            '<div class="pexp-mirror-swipe-hint">\uD83D\uDC48 Σύρε αριστερά-δεξιά στις κάρτες για αλλαγή σκηνής (' + (curScene + 1) + '/' + schoolMirrorScenes.length + ') \uD83D\uDC49</div>' +
          '</div>';

        stageEl.querySelectorAll(".pexp-era-photo, .pexp-curtain-img").forEach(function(im) {
          im.onerror = handleImgFallback;
        });

        if (isCurtain) {
          bindCurtainStage(stageEl.querySelector(".pexp-curtain-stage"));
        }

        var tabsBox = stageEl.querySelector(".pexp-mirror-tabs");
        var actTab = tabsBox ? tabsBox.querySelector(".pexp-mirror-tab.is-active") : null;
        if (tabsBox && actTab && tabsBox.scrollWidth > tabsBox.clientWidth) {
          var tLeft = Math.max(0, actTab.offsetLeft - (tabsBox.clientWidth - actTab.offsetWidth) / 2);
          if (tabsBox.scrollTo) tabsBox.scrollTo({ left: tLeft, behavior: "smooth" });
          else tabsBox.scrollLeft = tLeft;
        }

        var nextSc = schoolMirrorScenes[(curScene + 1) % schoolMirrorScenes.length];
        if (nextSc) {
          preloadImg(optImg(nextSc.oldImg, isCurtain ? 960 : 640));
          preloadImg(optImg(nextSc.newImg, isCurtain ? 960 : 640));
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
          var thumbDim = (viewMode === "curtain") ? 960 : 640;
          openZoomWithList([
            { src: scNow.oldImg, thumb: optImg(scNow.oldImg, thumbDim), caption: oldPre + scNow.oldCap },
            { src: scNow.newImg, thumb: optImg(scNow.newImg, thumbDim), caption: newPre + scNow.newCap }
          ], Number(zPic.getAttribute("data-m-zoom")));
          return;
        }
        var mBtn = e.target.closest("[data-m-mode]");
        if (mBtn) {
          var nextMode = mBtn.getAttribute("data-m-mode");
          if (nextMode === "curtain" && viewMode !== "curtain") curtainPct = 50;
          viewMode = nextMode;
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
      var rawAttr = this.getAttribute("data-full-src") || "";
      var full = cleanRawUrl(rawAttr);
      if (full && this.getAttribute("data-tried-full") !== full) {
        this.setAttribute("data-tried-full", full);
        noThumbUrls[full] = true;
        if (rawAttr) noThumbUrls[rawAttr] = true;
        if (this.src !== full) {
          this.src = full;
          return;
        }
      }
      if (full) delete noThumbUrls[full];
      if (rawAttr) delete noThumbUrls[rawAttr];
      if (this.src !== fallbackSvg) this.src = fallbackSvg;
    }
   function bindDragScroll(scrollEl, onUserDrag) {
      if (!scrollEl || scrollEl._dragScrollBound) return;
      scrollEl._dragScrollBound = true;
      var isDown = false, didDrag = false;
      var sx = 0, sy = 0, sl = 0, st = 0;
      var suppressClickUntil = 0;

      scrollEl.addEventListener("dragstart", function(e) { e.preventDefault(); });

      var onMove = function(e) {
        if (!isDown) return;
        var dx = e.clientX - sx;
        var dy = e.clientY - sy;
        if (!didDrag) {
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
          didDrag = true;
          scrollEl.classList.add("is-drag-scrolling");
          if (onUserDrag) onUserDrag();
        }
        if (e.cancelable) e.preventDefault();
        scrollEl.scrollLeft = sl - dx;
        scrollEl.scrollTop = st - dy;
      };

      var onUp = function() {
        if (!isDown) return;
        isDown = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("blur", onUp);
        scrollEl.classList.remove("is-drag-scrolling");
        if (didDrag) {
          suppressClickUntil = performance.now() + 140;
          didDrag = false;
        }
      };

      scrollEl.addEventListener("mousedown", function(e) {
        if (e.button !== 0) return;
        var canX = scrollEl.scrollWidth > scrollEl.clientWidth + 2;
        var canY = scrollEl.scrollHeight > scrollEl.clientHeight + 2;
        if (!canX && !canY) return;
        isDown = true;
        didDrag = false;
        sx = e.clientX;
        sy = e.clientY;
        sl = scrollEl.scrollLeft;
        st = scrollEl.scrollTop;
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        window.addEventListener("blur", onUp);
      });

      scrollEl.addEventListener("click", function(e) {
        if (performance.now() < suppressClickUntil) {
          suppressClickUntil = 0;
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }

    function bindDoubleTapZoom(targetEl, ignoreSel, onZoomAt) {
      if (!targetEl || targetEl._dblZoomBound) return;
      targetEl._dblZoomBound = true;
      var lastTapTime = 0, lastTapX = 0, lastTapY = 0, lastDblExec = 0;
      var tStartX = 0, tStartY = 0, tMulti = false;

   targetEl.addEventListener("dblclick", function(e) {
        if (isPinchZoomed() || performance.now() - lastDblExec < 400) return;
        if (ignoreSel && e.target.closest(ignoreSel)) return;
        if (!onZoomAt(e.clientX, e.clientY)) return;
        e.preventDefault();
        e.stopPropagation();
        lastDblExec = performance.now();
      });
      targetEl.addEventListener("touchstart", function(e) {
        if (!e.touches || e.touches.length !== 1 || isPinchZoomed()) { tMulti = true; return; }
        tMulti = false;
        tStartX = e.touches[0].clientX;
        tStartY = e.touches[0].clientY;
      }, { passive: true });

      targetEl.addEventListener("touchmove", function(e) {
        if (!e.touches || e.touches.length > 1) tMulti = true;
      }, { passive: true });

      targetEl.addEventListener("touchend", function(e) {
        if (tMulti || isPinchZoomed() || !e.changedTouches || e.changedTouches.length !== 1) {
          lastTapTime = 0;
          return;
        }
        if (ignoreSel && e.target.closest(ignoreSel)) {
          lastTapTime = 0;
          return;
        }
        var cx = e.changedTouches[0].clientX;
        var cy = e.changedTouches[0].clientY;
        if (Math.abs(cx - tStartX) > 10 || Math.abs(cy - tStartY) > 10) {
          lastTapTime = 0;
          return;
        }
      var now = performance.now();
        if (now - lastTapTime < 300 && Math.abs(cx - lastTapX) < 28 && Math.abs(cy - lastTapY) < 28) {
          lastTapTime = 0;
          if (onZoomAt(cx, cy)) {
            lastDblExec = now;
            if (e.cancelable) e.preventDefault();
          }
        } else {
          lastTapTime = now;
          lastTapX = cx;
          lastTapY = cy;
        }
      }, { passive: false });
    }

    /* Μεγέθυνση φωτογραφίας με πλοήγηση (κουμπιά, swipe, βελάκια) */
    var zoomList = [];
    var zoomIdx = 0;
    var zoomLoadToken = 0;
    var zoomCloseBtn = null;
    var zoomPrevBtn = null;
    var zoomNextBtn = null;
    var zoomJumpBtn = null;
    var zoom1922Patch = null;

  var blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var activeZoomProbe = null;

    function abortZoomProbe() {
      if (activeZoomProbe) {
        activeZoomProbe.onload = null;
        activeZoomProbe.onerror = null;
        activeZoomProbe.src = blankGif;
        activeZoomProbe = null;
      }
    }

    function releaseZoomImgMemory() {
      zoomLoadToken++;
      abortZoomProbe();
      zoomList = [];
      if (zoom1922Patch) zoom1922Patch.style.display = "none";
      if (zoomTarget) {
        zoomTarget.onload = null;
        zoomTarget.onerror = null;
        zoomTarget.src = blankGif;
      }
    }

    function closeZoom(fromPopState) {
      if (!zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
      lastZoomTriggerEl = null;
      if (zoomOverlay.contains(document.activeElement) && document.activeElement.blur) {
        document.activeElement.blur();
      }
      zoomOverlay.classList.remove("is-open");
      document.body.classList.remove("pexp-zoom-open");
      releaseZoomImgMemory();
      unlockBodyScroll();
      if (lastZoomFocusEl && typeof lastZoomFocusEl.focus === "function" && document.contains(lastZoomFocusEl)) {
        var zf = lastZoomFocusEl;
        lastZoomFocusEl = null;
        requestAnimationFrame(function() {
          if (document.contains(zf) && (!zoomOverlay || !zoomOverlay.classList.contains("is-open"))) {
            try { zf.focus({ preventScroll: true }); } catch (err) { zf.focus(); }
          }
        });
      } else {
        lastZoomFocusEl = null;
      }
      var needBack = (!fromPopState && histZoomOpen);
      histZoomOpen = false;
      if (needBack) safeHistoryBack(1);
    }

    if (zoomOverlay) {
      zoomOverlay.tabIndex = -1;
      if (zoomTarget && zoomTarget.parentNode === zoomOverlay) {
        var zoomImgWrap = document.createElement("div");
        zoomImgWrap.className = "pexp-zoom-img-wrap";
        zoomOverlay.insertBefore(zoomImgWrap, zoomTarget);
        zoomImgWrap.appendChild(zoomTarget);
        var zPatchTmp = document.createElement("div");
      zPatchTmp.innerHTML =
          '<svg id="pexpZoom1922Patch" viewBox="0 0 1000 568" preserveAspectRatio="xMidYMid meet" style="display:none;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:14px" aria-hidden="true">' +
            '<polygon points="823,160 845,159 846,181 822,182" fill="#ecebe3" stroke="#ecebe3" stroke-width="2.2" stroke-linejoin="round"/>' +
            '<path d="M 844,168 Q 833,174 820,179" fill="none" stroke="#c3873b" stroke-width="3.2" stroke-dasharray="7,5" stroke-linecap="round"/>' +
            '<circle cx="849" cy="166.5" r="5.3" fill="#1e293b"/>' +
            '<polygon points="644,244 676,242 676,269 644,282" fill="#ffffff"/>' +
            '<path d="M 677,253.8 L 643,268.5" fill="none" stroke="#244f7c" stroke-width="3.5" stroke-linecap="round"/>' +
            '<polygon points="650,265.5 660.2,254.4 659.2,261.5 665.1,265.8" fill="#244f7c"/>' +
          '</svg>';
        zoom1922Patch = zPatchTmp.firstElementChild;
        if (zoom1922Patch) zoomImgWrap.appendChild(zoom1922Patch);
      }

      zoomJumpBtn = document.createElement("button");
      zoomJumpBtn.type = "button";
      zoomJumpBtn.id = "pexpZoomJumpBtn";
      zoomJumpBtn.className = "pexp-zoom-jump-btn";
      zoomOverlay.appendChild(zoomJumpBtn);
     zoomJumpBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        var curIt = zoomList[zoomIdx];
        if (curIt && typeof curIt.jumpFn === "function") {
          if (zoomJumpBtn.blur) zoomJumpBtn.blur();
          curIt.jumpFn();
        }
      });

     zoomCloseBtn = document.createElement("button");
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
      stopPopAutoplay();
      stopRouteAutoplay();
      stopGrowTour();
      stopMap1922Anim();
     var wasOpen = zoomOverlay.classList.contains("is-open");
      var trigEl = lastZoomTriggerEl;
      lastZoomTriggerEl = null;
      if (!wasOpen) {
        if (document.activeElement && document.activeElement !== document.body && !zoomOverlay.contains(document.activeElement)) {
          lastZoomFocusEl = document.activeElement;
        } else if (trigEl && document.contains(trigEl)) {
          lastZoomFocusEl = trigEl;
        } else if (modal.classList.contains("is-open")) {
          lastZoomFocusEl = modal.querySelector("#pexpTabs .pexp-tab-btn.is-active") || document.getElementById("pexpCloseBtn");
        } else if (isRegMapZoomed) {
          lastZoomFocusEl = document.getElementById("pregFullImgBtn");
        } else if (isMapZoomed && mapZoomBtn) {
          lastZoomFocusEl = mapZoomBtn;
        } else {
          lastZoomFocusEl = null;
        }
      }
      zoomList = list;
      zoomIdx = (startIndex >= 0 && startIndex < list.length) ? startIndex : 0;
      if (document.body.lastElementChild !== zoomOverlay) {
        document.body.appendChild(zoomOverlay);
      }
      renderZoomItem();
      zoomOverlay.classList.add("is-open");
      document.body.classList.add("pexp-zoom-open");
      lockBodyScroll();
      if (!wasOpen) {
        if (document.activeElement && document.activeElement !== document.body && !zoomOverlay.contains(document.activeElement) && document.activeElement.blur) {
          document.activeElement.blur();
        }
        try { zoomOverlay.focus({ preventScroll: true }); } catch (err) {}
        requestAnimationFrame(function() {
          if (zoomOverlay.classList.contains("is-open") && zoomCloseBtn && zoomCloseBtn.focus) {
            try { zoomCloseBtn.focus({ preventScroll: true }); } catch (err) { zoomCloseBtn.focus(); }
          }
        });
      }

      if (!wasOpen && !histZoomOpen) {
        histZoomOpen = true;
        if (ignorePopCount === 0) {
          try {
            var nextState = { pexpZoom: true };
            if (histModalOpen || modal.classList.contains("is-open")) nextState.pexpModal = true;
            if (histMapOpen || isMapZoomed) nextState.pfacMapZoom = true;
            if (histRegMapOpen || isRegMapZoomed) nextState.pregMapZoom = true;
            window.history.pushState(nextState, "", window.location.href);
          } catch (e) {}
        }
      }
    }

 function renderZoomItem() {
      var item = zoomList[zoomIdx];
      if (!item) return;
      var is1922Map = !!(item.src && item.src.indexOf("AVvXsEi1JSEGe8aI6RfIJmm0ndGCeqlKRd4e6V_G8uyh2GHVv5fEh") !== -1);
      if (zoom1922Patch) zoom1922Patch.style.display = "none";
      if (zoomTarget) {
        var token = ++zoomLoadToken;
        var fullUrl = optZoomUrl(item.src);
        var rawClean = cleanRawUrl(item.src);
        var previewUrl = item.thumb || "";
        var zErrStep = 0;
        zoomTarget.onload = function() {
          if (token === zoomLoadToken && this.src !== blankGif) {
            this.style.opacity = "1";
            if (zoom1922Patch) {
              zoom1922Patch.style.display = (is1922Map && this.src !== fallbackSvg) ? "block" : "none";
            }
          }
        };
       zoomTarget.onerror = function() {
          this.style.opacity = "1";
          if (zErrStep === 0 && rawClean && rawClean !== fullUrl && this.src !== rawClean) {
            zErrStep = 1;
            this.src = rawClean;
          } else if (zErrStep <= 1 && previewUrl && this.src !== previewUrl) {
            zErrStep = 2;
            this.src = previewUrl;
          } else {
            this.onerror = null;
            if (zoom1922Patch) zoom1922Patch.style.display = "none";
            this.src = fallbackSvg;
          }
        };

        abortZoomProbe();
        var probe = new Image();
        probe.src = fullUrl;
        if (probe.complete && probe.naturalWidth > 0) {
          zoomTarget.style.opacity = "1";
          zoomTarget.src = fullUrl;
        } else {
          activeZoomProbe = probe;
          var hasCachedPreview = false;
          if (previewUrl && previewUrl !== fullUrl && previewUrl.indexOf("data:image/") !== 0) {
            var thumbProbe = new Image();
            thumbProbe.src = previewUrl;
            hasCachedPreview = !!(thumbProbe.complete && thumbProbe.naturalWidth > 0);
          }
          if (hasCachedPreview) {
            zoomTarget.style.opacity = "1";
            zoomTarget.src = previewUrl;
          } else {
            zoomTarget.style.opacity = "0";
            zoomTarget.src = blankGif;
          }
          probe.decoding = "async";
          probe.onload = function() {
            if (activeZoomProbe === probe) activeZoomProbe = null;
            if (token === zoomLoadToken && zoomTarget) {
              zoomTarget.src = fullUrl;
              zoomTarget.style.opacity = "1";
            }
          };
          probe.onerror = function() {
            if (activeZoomProbe === probe) activeZoomProbe = null;
            if (token === zoomLoadToken && zoomTarget) {
              zoomTarget.style.opacity = "1";
              if (rawClean && rawClean !== fullUrl) zoomTarget.src = rawClean;
              else if (hasCachedPreview && previewUrl) zoomTarget.src = previewUrl;
              else zoomTarget.src = fallbackSvg;
            }
          };
        }
        if (is1922Map && zoom1922Patch && zoomTarget.complete && zoomTarget.naturalWidth > 1 && zoomTarget.src !== blankGif) {
          zoom1922Patch.style.display = "block";
        }
      }
      if (zoomCap) {
        var countSuffix = zoomList.length > 1 ? " (" + (zoomIdx + 1) + "/" + zoomList.length + ")" : "";
        zoomCap.textContent = (item.caption || "") + countSuffix;
      }
      var showJump = !!(item.jumpLbl && typeof item.jumpFn === "function" && !modal.classList.contains("is-open"));
      if (zoomOverlay) zoomOverlay.classList.toggle("has-jump-btn", showJump);
      if (zoomJumpBtn) {
        zoomJumpBtn.textContent = showJump ? item.jumpLbl : "";
        zoomJumpBtn.classList.toggle("is-vis", showJump);
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
        if (typeof getRouteZoomGallery === "function") {
          var rg = getRouteZoomGallery();
          openZoomWithList(rg.list, rg.idx);
        } else {
          var rList = routePhotos.map(function(p) { return { src: p.src, thumb: optImg(p.src, 640), caption: p.alt || "" }; });
          openZoomWithList(rList, currentStopIdx);
        }
     } else if ((zImg.id === "pexpZoneImg1" || zImg.id === "pexpZoneImg2") && typeof getElevZoomGallery === "function") {
        var eg = getElevZoomGallery(zImg.id === "pexpZoneImg2" ? 1 : 0);
        openZoomWithList(eg.list, eg.idx);
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
    var cachedTimelineZoomList = null;
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

        if (!cachedTimelineZoomList) {
          cachedTimelineZoomList = [];
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
            var jLbl = "", jFn = null;
            if (dateTxt.indexOf("1922") !== -1) {
              jLbl = "\u26F5 Ταξίδεψε στη Διαδρομή του 1922 \u279C";
              jFn = function() { window.openPeristasiModal("route", false); };
            } else if (dateTxt.indexOf("1947") !== -1) {
              jLbl = "\u23F3 Ταξίδεψε στο Χωριό του 1947 \u279C";
              jFn = function() { openPopulationAtYear(1947); triggerRootBubble("vlach", false); };
            } else if (dateTxt.indexOf("1952") !== -1 || dateTxt.indexOf("1965") !== -1) {
              jLbl = "\u23F3 Ταξίδεψε στο Πέτρινο Σχολείο (1965) \u279C";
              jFn = function() { openPopulationAtYear(1965); };
            } else if (dateTxt.indexOf("1981") !== -1 || dateTxt.indexOf("Σήμερα") !== -1) {
              jLbl = "\uD83E\uDE9E Σύγκρινε το Σχολείο: 1926 vs 2026 \u279C";
              jFn = function() { openCentennialMirror(); };
            }
            cachedTimelineZoomList.push({ src: srcUrl, thumb: thumbUrl, caption: capTxt, jumpLbl: jLbl, jumpFn: jFn });
          });
        }

        lastZoomTriggerEl = link;
        openZoomWithList(cachedTimelineZoomList, clickedIdx);
      });
    });

 var openCentennialMirror = function() {
      initPopPane(1926);
      window.openPeristasiModal("population", true);
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

        var btnFacToday = document.createElement("button");
        btnFacToday.type = "button";
        btnFacToday.className = "pexp-tl-bridge-btn";
        btnFacToday.textContent = "\uD83C\uDFEB Ξενάγηση στο Σχολείο & τις Υποδομές \u2193";
        btnFacToday.addEventListener("click", function() {
          if (activeFacIdx !== 0) openFacilityCard(0, false);
          scrollToFacilityCard(true);
        });
        actWrap.appendChild(btnFacToday);
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
        cancelAnimationFrame(popTimer);
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
        var maxSc = tabsStripEl.scrollWidth - tabsStripEl.clientWidth;
        var goRight = tabsStripEl.scrollLeft < maxSc - 6;
        var step = Math.max(130, Math.round(tabsStripEl.clientWidth * 0.65));
        var nextLeft = goRight ? (tabsStripEl.scrollLeft + step) : 0;
        if (tabsStripEl.scrollTo) tabsStripEl.scrollTo({ left: nextLeft, behavior: "smooth" });
        else tabsStripEl.scrollLeft = nextLeft;
      });
    }
    function syncTabsFadeHint() {
      if (!tabsStripEl) return;
      var maxSc = tabsStripEl.scrollWidth - tabsStripEl.clientWidth;
      var canSc = maxSc > 6;
      var hasL = canSc && tabsStripEl.scrollLeft > 6;
      var hasR = canSc && tabsStripEl.scrollLeft < maxSc - 6;
      tabsStripEl.classList.toggle("is-scrollable", canSc);
      tabsStripEl.classList.toggle("has-fade-l", hasL);
      tabsStripEl.classList.toggle("has-fade-r", hasR);
      if (tabsMoreBtn) {
        var showBtn = hasR || hasL;
        tabsMoreBtn.classList.toggle("is-vis", showBtn);
        tabsMoreBtn.classList.toggle("is-left", !hasR && hasL);
        tabsMoreBtn.tabIndex = showBtn ? 0 : -1;
        tabsMoreBtn.textContent = hasR ? "\u203A" : "\u2039";
        tabsMoreBtn.title = hasR ? "Δες και τις υπόλοιπες καρτέλες" : "Επιστροφή στις πρώτες καρτέλες";
        tabsMoreBtn.setAttribute("aria-label", tabsMoreBtn.title);
      }
    }
  if (tabsStripEl) {
      tabsStripEl.addEventListener("scroll", syncTabsFadeHint, { passive: true });
      bindDragScroll(tabsStripEl);
      addResizeTask(function(wChanged) {
        if (wChanged && modal.classList.contains("is-open")) syncTabsFadeHint();
      });
    }

   function activateTab(tabName, skipAutoInit) {
      if (!panes[tabName]) tabName = "population";
      if (tabName === "population") initPopPane();
      else if (tabName === "route") initRoutePane();
      else if (tabName === "elevation") initElevPane();
      else if (tabName === "churches") initChurchesPane();

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
        if (subToday && subToday.style.display === "block") refreshCompassSun();
        if (!skipAutoInit && !routeReady) renderStop(0);
        syncRouteMapOnShow();
    } else if (tabName === "elevation") {
        if (!skipAutoInit && !elevReady) selectZone(1);
        syncElevMapOnShow();
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
        stopGrowTour();
        stopNeighborhoodWalkAnim();
        stopMap1922Anim();
        pauseHeroVideo();
      }
    });

 window.openPeristasiModal = function(initialTab, skipAutoInit) {
      pauseHeroVideo();
      stopGrowTour();
      stopRegQuiz();
      stopMap1922Anim();
     if (!modal.classList.contains("is-open")) {
        if (document.activeElement && document.activeElement !== document.body && (!zoomOverlay || !zoomOverlay.contains(document.activeElement))) {
          lastFocusedEl = document.activeElement;
        } else if (lastZoomFocusEl && document.contains(lastZoomFocusEl)) {
          lastFocusedEl = lastZoomFocusEl;
        } else if (lastZoomTriggerEl && document.contains(lastZoomTriggerEl)) {
          lastFocusedEl = lastZoomTriggerEl;
        }
      }
      lastZoomFocusEl = null;
      lastZoomTriggerEl = null;
      var hadTwoHistAbove = histZoomOpen && (histMapOpen || histRegMapOpen) && !histModalOpen;
      var replaceTopEntry = (histZoomOpen || histMapOpen || histRegMapOpen) && !histModalOpen;
      histZoomOpen = false;
      if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        zoomOverlay.classList.remove("is-open");
        document.body.classList.remove("pexp-zoom-open");
        releaseZoomImgMemory();
      }
      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      if (zoomOverlay && document.body.lastElementChild !== zoomOverlay) document.body.appendChild(zoomOverlay);

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      lockBodyScroll();
      if (isMapZoomed) closeMapZoom(true);
      if (isRegMapZoomed) closeRegMapZoom(true);
      if (initialTab === "route") {
        initRoutePane();
        resetRouteModeToBoth(!skipAutoInit);
      }
     if (!skipAutoInit && initialTab === "route" && subJourney && subJourney.style.display === "none") {
        switchRouteSub("journey", false);
      }
      activateTab(initialTab || "population", !!skipAutoInit);

      requestAnimationFrame(function() {
        syncTabsFadeHint();
        var focusTarget = modal.querySelector("#pexpTabs .pexp-tab-btn.is-active") || document.getElementById("pexpCloseBtn");
        if (focusTarget && focusTarget.focus) {
          try { focusTarget.focus({ preventScroll: true }); } catch (err) { focusTarget.focus(); }
        }
      });

   var wasModalHist = histModalOpen;
      histModalOpen = true;
      if (hadTwoHistAbove) {
        safeHistoryBack(1);
      } else if (ignorePopCount === 0) {
        try {
          if (replaceTopEntry) {
            window.history.replaceState({ pexpModal: true }, "", window.location.href);
          } else if (!wasModalHist) {
            window.history.pushState({ pexpModal: true }, "", window.location.href);
          }
        } catch (e) {}
      }
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

     if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        zoomOverlay.classList.remove("is-open");
        releaseZoomImgMemory();
      }
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
  function isTrapNodeVis(el) {
      if (!el || (el.offsetWidth <= 0 && el.offsetHeight <= 0 && el.getClientRects().length === 0)) return false;
      var cs = window.getComputedStyle(el);
      return cs.visibility !== "hidden" && cs.pointerEvents !== "none";
    }
    function trapFocusIn(container, ev) {
      var nodes = container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      var act = document.activeElement;
      var inside = container.contains(act);
      var first = null, last = null, i;
      if (ev.shiftKey) {
        for (i = 0; i < nodes.length; i++) {
          if (isTrapNodeVis(nodes[i])) { first = nodes[i]; break; }
        }
        if (!first || (inside && act !== first)) return;
        for (i = nodes.length - 1; i >= 0; i--) {
          if (isTrapNodeVis(nodes[i])) { last = nodes[i]; break; }
        }
        if (last) { ev.preventDefault(); last.focus(); }
      } else {
        for (i = nodes.length - 1; i >= 0; i--) {
          if (isTrapNodeVis(nodes[i])) { last = nodes[i]; break; }
        }
        if (!last || (inside && act !== last)) return;
        for (i = 0; i < nodes.length; i++) {
          if (isTrapNodeVis(nodes[i])) { first = nodes[i]; break; }
        }
        if (first) { ev.preventDefault(); first.focus(); }
      }
    }

 document.addEventListener("keydown", function(e) {
      if ((e.key === "Enter" || e.key === " ") && zoomOverlay && zoomOverlay.classList.contains("is-open") && !zoomOverlay.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        if (zoomCloseBtn && zoomCloseBtn.focus) {
          try { zoomCloseBtn.focus({ preventScroll: true }); } catch (err) { zoomCloseBtn.focus(); }
        }
        return;
      }
      if (e.key === "Tab") {
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
          trapFocusIn(zoomOverlay, e);
        } else if (modal.classList.contains("is-open")) {
          trapFocusIn(modal, e);
        } else if (isRegMapZoomed) {
          var rw = document.getElementById("pregMapWrap");
          if (rw) trapFocusIn(rw, e);
        } else if (isMapZoomed && mapWrap) {
          trapFocusIn(mapWrap, e);
        }
        return;
      }

     if (e.key === "Escape") {
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
          closeZoom(false);
        } else if (isRegMapZoomed && isRegQuizActive()) {
          stopRegQuiz();
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
        } else {
          var facVis = !!(activeFacIdx !== -1 && pfacStage && pfacStage.getBoundingClientRect().bottom > 0 && pfacStage.getBoundingClientRect().top < window.innerHeight);
          var closeFacOrMir = function() {
            var openMir = document.getElementById("pfacMirrorStage");
            if (openMir && openMir.style.display === "block") {
              openMir.style.display = "none";
              openMir.innerHTML = "";
            } else {
              closeFacilityCard();
            }
          };
          if (facVis) closeFacOrMir();
          else if (isRegQuizActive()) stopRegQuiz();
          else if (isNeighborhoodBusy()) resetNeighborhoodMap();
          else if (isMap1922Active() && clearMap1922Spot) clearMap1922Spot();
          else if (activeFacIdx !== -1) closeFacOrMir();
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
            stepRouteStop(dir);
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
        if (isRegQuizGuessing()) return;
        e.preventDefault();
        if (stepRegPinFn) stepRegPinFn(dir);
        return;
      }

      if (isMapZoomed) {
        e.preventDefault();
        if (stepNeighborhoodNodeFn) stepNeighborhoodNodeFn(dir);
        else openFacilityCard(activeFacIdx === -1 ? 0 : activeFacIdx + dir, false);
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
        if (ignorePopCount === 0) {
          if (ignorePopTimer) { clearTimeout(ignorePopTimer); ignorePopTimer = null; }
          syncPendingOverlayState();
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

initPopPane = function(initialYr) {
      if (popPaneInited) return;
      popPaneInited = true;

    var censusData = [
      { year: 1924, pop: 500, story: "1923\u20131924: Οι πρώτες 130 οικογένειες προσφύγων (~500 ψυχές) από την Περίσταση και τα Λούπιδα της Ανατολικής Θράκης ριζώνουν στη θέση «Λημέρι»! Φτιάχνουν τα πρώτα σπιτάκια, τον Αη-Γιώργη και το πρώτο μικρό πλίνθινο σχολείο." },
      { year: 1926, pop: 560, story: "1926: Η Περίσταση γίνεται αυτόνομη Κοινότητα (τότε ανήκαμε στον Νομό Θεσσαλονίκης!) και ιδρύεται επίσημα στη σημερινή του θέση το σχολείο μας με 3 αίθουσες \u2014 η αρχή 100 χρόνων ιστορίας (1926\u20132026)!" },
      { year: 1928, pop: 616, story: "1928: Στο χωριό ζουν πια 166 προσφυγικές οικογένειες (616 κάτοικοι)! Κρατούν ζωντανό το έθιμο της εικόνας του Αγίου Μόδεστου, που φιλοξενείται από σπίτι σε σπίτι." },
      { year: 1940, pop: 936, story: "1940: Το χωριό μεγαλώνει στους 936 κατοίκους. Στον Β' Παγκόσμιο Πόλεμο φιλοξενούνται εδώ Νεοζηλανδοί στρατιώτες, ενώ στην Κατοχή το χωριό θρηνεί 14 ήρωες κατοίκους." },
      { year: 1947, pop: 1010, story: "1947: Οικογένειες από τα ορεινά Σκοτεινά (Μόρνα/Φωτεινά) φιλοξενούνται μέσα στις αίθουσες του σχολείου μας! Για να μη χαθεί η χρονιά, η δασκάλα Κατίνα Κουζώνη κάνει μάθημα στα παιδιά έξω στα «Αλώνια», καθισμένα οκλαδόν στο χώμα!" },
     { year: 1951, pop: 1071, story: "1951: Ξεπερνάμε τους 1.000 κατοίκους και ανήκουμε πια στον νέο Νομό Πιερίας (από το 1949)! Στα μεταπολεμικά αυτά χρόνια ο διευθυντής Κώστας Μοσχίδης με τους δασκάλους Κ. Κουζώνη, Φ. Μέλιο και Ι. Πάππα οργανώνουν συσσίτια και τους Προσκόπους." },
      { year: 1961, pop: 1130, story: "1961: Με 1.130 κατοίκους (καθώς αρκετοί νέοι φεύγουν τότε μετανάστες στη Γερμανία), ξεκινά η προσπάθεια για το νέο πέτρινο σχολείο μας (θεμελιώθηκε το 1960 και το ισόγειό του χτίστηκε το 1963)!" },
      { year: 1965, pop: 1148, story: "1965: Ολοκληρώνεται ο Α' όροφος πάνω από το πέτρινο ισόγειο (1963) και τα παιδιά μπαίνουν στο διώροφο πέτρινο σχολείο μας, ενώ φτάνουν και οι οικογένειες Ποντίων!" },
      { year: 1971, pop: 1176, story: "1971: Το χωριό φτάνει τους 1.176 κατοίκους, ενώ ήδη από το 1968 παίζουν μπάλα οι δύο πρώτες ποδοσφαιρικές μας ομάδες, ο «Όλυμπος» και η «Αναγέννηση»!" },
     { year: 1981, pop: 1491, story: "1981: Φτάνουμε τους 1.491 κατοίκους! Το σχολείο μας γίνεται 7/θέσιο, υπάρχει ήδη η Α.Ε. Περίστασης (από το 1978) και ιδρύεται το Γυμνάσιο που συστεγάζεται εδώ." },
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
    var popChipsByYear = {};
    var activePopChipEl = null;
    popChips.forEach(function(ch) {
      popChipsByYear[Number(ch.getAttribute("data-year"))] = ch;
      if (ch.classList.contains("is-active")) activePopChipEl = ch;
    });
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
    var lastRenderedPopYear = -1;
    var curveClipRect = null;
    var curveDot = null;
    var curveLiveLbl = null;
    var cxOfYr = function(y) { return 20 + ((y - 1924) / 97) * 560; };
    var cyOfPop = function(p) { return 54 - ((p - 350) / 2350) * 40; };

    if (popSlider && !document.getElementById("pexpPopCurveSvg")) {
      var sliderLineEl = popSlider.closest(".pexp-slider-line") || popSlider.parentNode;
      if (sliderLineEl && sliderLineEl.parentNode) {
        var polyPts = censusData.map(function(d) {
          return cxOfYr(d.year).toFixed(1) + "," + cyOfPop(d.pop).toFixed(1);
        }).join(" ");
        var areaD = "M 20,56 L " + polyPts.replace(/ /g, " L ") + " L 580,56 Z";
        var curveWrap = document.createElement("div");
        curveWrap.className = "pexp-pop-curve-wrap";
        curveWrap.innerHTML =
          '<div class="pexp-pop-curve-head">' +
            '<span>\uD83D\uDCC8 Καμπύλη<span class="pexp-delta-extra"> Αύξησης Χωριού</span> (1924\u20132021)</span>' +
            '<span id="pexpPopCurveLbl">1924: Αφετηρία (~500)</span>' +
          '</div>' +
          '<svg class="pexp-pop-curve-svg" id="pexpPopCurveSvg" viewBox="0 0 600 62" role="img" aria-label="Καμπύλη αύξησης πληθυσμού Περίστασης 1924 έως 2021">' +
            '<defs>' +
              '<clipPath id="pexpPopCurveClip"><rect id="pexpPopClipRect" x="0" y="0" width="20" height="62"/></clipPath>' +
              '<linearGradient id="pexpPopAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
                '<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.34"/>' +
                '<stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>' +
              '</linearGradient>' +
            '</defs>' +
            '<line x1="20" y1="56" x2="580" y2="56" stroke="#cbd5e1" stroke-width="1.5"/>' +
            '<path d="' + areaD + '" fill="#f1f5f9"/>' +
            '<polyline points="' + polyPts + '" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-dasharray="5,4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<g clip-path="url(#pexpPopCurveClip)">' +
              '<path d="' + areaD + '" fill="url(#pexpPopAreaGrad)"/>' +
              '<polyline points="' + polyPts + '" fill="none" stroke="#1e6cff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</g>' +
            '<circle cx="522.3" cy="16.6" r="3" fill="#10b981"/>' +
            '<text x="516" y="11" text-anchor="end" fill="#047857" font-size="9.5" font-weight="800">Ρεκόρ 2011 (2.545)</text>' +
            '<circle id="pexpPopCurveDot" cx="20" cy="51.4" r="5.5" fill="#1e6cff" stroke="#ffffff" stroke-width="2.2"/>' +
          '</svg>';
        sliderLineEl.parentNode.insertBefore(curveWrap, sliderLineEl);
        curveClipRect = document.getElementById("pexpPopClipRect");
        curveDot = document.getElementById("pexpPopCurveDot");
        curveLiveLbl = document.getElementById("pexpPopCurveLbl");
        var curveSvgEl = document.getElementById("pexpPopCurveSvg");
       if (curveSvgEl) {
          curveSvgEl.addEventListener("click", function(e) {
            if (isPinchZoomed()) return;
            var r = curveSvgEl.getBoundingClientRect();
            if (!r.width || !r.height) return;
            var scaleSvg = Math.min(r.width / 600, r.height / 62);
            var padX = (r.width - 600 * scaleSvg) * 0.5;
            var svgX = scaleSvg > 0 ? ((e.clientX - r.left - padX) / scaleSvg) : 20;
            var clickedYr = Math.max(1924, Math.min(2021, Math.round(1924 + ((svgX - 20) / 560) * 97)));
            stopPopAutoplay();
            if (popSlider) popSlider.value = clickedYr;
            renderPopulation(clickedYr);
          });
        }
      }
    }

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

    var lastHouseStateKey = "";
    var multLeadNode = null, multExtraNode = null, multTailNode = null;

   function renderPopulation(yr) {
      if (!housesGrid) return;
      closeCapsuleMode();
      lastRenderedPopYear = yr;
      var info = getPopForYear(yr);
      var formattedPop = numFmt ? numFmt.format(info.pop) : info.pop.toLocaleString("el-GR");

      var isOfficialCensus = [1928, 1940, 1951, 1961, 1971, 1981, 1991, 2001, 2011, 2021].indexOf(yr) !== -1;
      if (yearVal) yearVal.textContent = "\uD83D\uDCC5 " + yr;
      if (popVal) popVal.textContent = (isOfficialCensus ? "" : "~") + formattedPop + " κάτοικοι";
      if (curveClipRect && curveDot) {
        var curCx = cxOfYr(yr).toFixed(1);
        var curCy = cyOfPop(info.pop).toFixed(1);
        curveClipRect.setAttribute("width", curCx);
        curveDot.setAttribute("cx", curCx);
        curveDot.setAttribute("cy", curCy);
      }
     var diffFromStart = info.pop - censusData[0].pop;
      var diffFmt = diffFromStart > 0 ? ("+" + (numFmt ? numFmt.format(diffFromStart) : diffFromStart.toLocaleString("el-GR"))) : "0";
      if (curveLiveLbl) {
        curveLiveLbl.textContent = (yr <= 1924 || diffFromStart <= 0)
          ? ("1924: Αφετηρία (~" + formattedPop + ")")
          : (yr + ": " + diffFmt + " κάτ. από το '24");
      }

      if (multVal) {
        if (!multLeadNode || multLeadNode.parentNode !== multVal) {
          multVal.textContent = "";
          multLeadNode = document.createTextNode("");
          multExtraNode = document.createElement("span");
          multExtraNode.className = "pexp-delta-extra";
          multTailNode = document.createTextNode("");
          multVal.appendChild(multLeadNode);
          multVal.appendChild(multExtraNode);
          multVal.appendChild(multTailNode);
        }
        var mult = info.pop / censusData[0].pop;
        if (yr <= 1924 || diffFromStart <= 0) {
          multLeadNode.nodeValue = "\uD83C\uDF31 Αφετηρία";
          multExtraNode.textContent = " 1924";
          multTailNode.nodeValue = " (\u00D71)";
        } else {
          var multStr = (Math.round(mult * 10) / 10).toFixed(1).replace(".0", "").replace(".", ",");
          multLeadNode.nodeValue = "\uD83D\uDCC8 " + diffFmt + " κάτ.";
          multExtraNode.textContent = " από το 1924";
          multTailNode.nodeValue = " (\u00D7" + multStr + ")";
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
      var rootWave = (yr >= 1965) ? 2 : (yr >= 1947 ? 1 : 0);
      var houseStateKey = targetHouses + "|" + rootWave;

      if (houseStateKey !== lastHouseStateKey) {
        lastHouseStateKey = houseStateKey;
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
          if (rootWave >= 1 && hIdx >= 5 && hIdx < 7) {
            cls = "pexp-h-vlach";
            ic = "\uD83C\uDFE1";
            ttl = "Σπίτι Σκοτεινιωτών & Βλάχων";
         } else if (rootWave >= 2 && hIdx >= 7 && hIdx < 12) {
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

        if (rootVlach) rootVlach.classList.toggle("is-unlocked", rootWave >= 1);
        if (rootPontic) rootPontic.classList.toggle("is-unlocked", rootWave >= 2);
      }
      if ((activeRootKey === "vlach" && yr < 1947) ||
          (activeRootKey === "pontic" && yr < 1965) ||
          (activeRootKey === "gym1981" && yr < 1981) ||
          (activeRootKey === "wing2006" && yr < 2006)) {
        closeRootBubble();
      }

  if (popStory && popStory.textContent !== info.story) popStory.textContent = info.story;
      var nextChipEl = popChipsByYear[yr] || null;
      if (activePopChipEl !== nextChipEl) {
        if (activePopChipEl) activePopChipEl.classList.remove("is-active");
        if (nextChipEl) nextChipEl.classList.add("is-active");
        activePopChipEl = nextChipEl;
      }
    }

   if (popSlider) {
      popSlider.addEventListener("input", function() {
        var nextYr = Number(popSlider.value);
        if (nextYr === lastRenderedPopYear && !capsuleOpen && !mirrorOpen) return;
        stopPopAutoplay();
        renderPopulation(nextYr);
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
        var lastPopTick = performance.now();
       var stepPopAnim = function(now) {
          if (!popTimer) return;
          if (now - lastPopTick >= 65) {
            var rawSteps = Math.floor((now - lastPopTick) / 65);
            var steps = Math.min(3, rawSteps);
            lastPopTick = (rawSteps > 3) ? now : (lastPopTick + steps * 65);
            cur = Math.min(2021, cur + steps);
            popSlider.value = cur;
            renderPopulation(cur);
            if (cur >= 2021) {
              stopPopAutoplay();
              return;
            }
          }
          popTimer = requestAnimationFrame(stepPopAnim);
        };
        popTimer = requestAnimationFrame(stepPopAnim);
      });
    }
var startPopYr = (typeof initialYr === "number") ? initialYr : 1924;
    if (popSlider) popSlider.value = startPopYr;
    renderPopulation(startPopYr);

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
    };

    openPopulationAtYear = function(yr) {
      initPopPane(yr);
      window.openPeristasiModal("population", true);
      stopPopAutoplay();
      if (popSlider) popSlider.value = yr;
      if (lastRenderedPopYear !== yr || capsuleOpen || mirrorOpen) {
        renderPopulation(yr);
      }
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
        if (activePopChipEl) { activePopChipEl.classList.remove("is-active"); activePopChipEl = null; }
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
        if (activePopChipEl) { activePopChipEl.classList.remove("is-active"); activePopChipEl = null; }
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
          { src: "https://www.searchculture.gr/aggregator/thumbnails/edm-record/iape/000102-11641_1356", cap: "Αρχείο 1920 (ΙΑΠΕ): Έλληνες κάτοικοι & Πρόσκοποι στην παλιά Περίσταση Θράκης πριν το 1922" },
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
            return '<figure class="pexp-root-fig" data-root-photo="' + pIdx + '" role="button" tabindex="0">' +
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
          var rFig = e.target.closest("[data-root-photo]");
          if (rFig) {
            e.preventDefault();
            rFig.click();
            return;
          }
          var hit = detectRootTarget(e.target);
          if (hit) {
            e.preventDefault();
            openRootBubble(hit.key, true);
          }
        }
      });
    }
    }; /* Τέλος initPopPane */

    /* ================= 2. ΤΟ ΤΑΞΙΔΙ ΤΟΥ 1922 & ΣΗΜΕΡΙΝΕΣ ΑΠΟΣΤΑΣΕΙΣ ================= */
    initRoutePane = function() {
      if (routePaneInited) return;
      routePaneInited = true;

    subBtns = document.querySelectorAll("#pexpRouteSubSwitch .pexp-subswitch-btn");
    subJourney = document.getElementById("pexpSubJourney");
    subToday = document.getElementById("pexpSubToday");

   var subTodayReady = false;
    var subTodayInited = false;
    var ensureCompassImg = function() {};
    var ensureSubTodayInited = function() {};

    switchRouteSub = function(target, skipDefault) {
      stopRouteAutoplay();
      stopCartGame();
      subBtns.forEach(function(b) { b.classList.toggle("is-active", b.getAttribute("data-sub") === target); });
      if (subJourney) subJourney.style.display = (target === "journey") ? "block" : "none";
      if (subToday) subToday.style.display = (target === "today") ? "block" : "none";
      if (target === "journey") {
        if (!skipDefault && !routeReady) renderStop(0);
        syncRouteMapOnShow();
      }
     if (target === "today") {
        var wasTodayInited = subTodayInited;
        subTodayReady = true;
        if (!skipDefault) ensureSubTodayInited();
        if (wasTodayInited) {
          if (!skipDefault) ensureCompassImg();
          refreshCompassSun();
        }
      }
    };

    subBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        switchRouteSub(btn.getAttribute("data-sub"), false);
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
        src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVNLwdEAQdFOOm_CojhLMJJEVVO9Ud3s38C0cBfgmxC1aJI-tE3Jga7S6zJMbuh0I8i7edEvMxVOKnCNKc32FTCglidEiRWpWANNBIP-lr6DNebS-rBa2N5FvRF2tbcovIEqOjjiEYecaEsnDW162EFZ6ZZSmN1704CUebTWiGxtV6c-42fKE1jRg7MUo/s1600/i_899251998_kavala_1743x752.jpg",
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
        '<div class="pexp-route-map-frame" id="pexpRouteMapFrame">' +
          '<div class="pexp-route-map-scroll is-mobile-zoom" id="pexpRouteMapScroll">' +
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
                '<text id="pexpPin3Num" y="4" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">4</text>' +
                '<text x="28" y="-14" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="900">Θεσσαλονίκη</text>' +
              '</g>' +
              '<g class="pexp-pin" data-stop="4" transform="translate(78,180)">' +
                '<circle r="26" fill="transparent"></circle>' +
                '<circle r="12" fill="#10b981" stroke="#fff" stroke-width="2.5"></circle>' +
                '<text id="pexpPin4Num" y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="900">5</text>' +
                '<text x="8" y="25" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="900">Νέα Περίσταση!</text>' +
              '</g>' +
              '<g id="pexpSeaMidPin" role="button" tabindex="0" style="display:none;cursor:pointer" transform="translate(272,233)">' +
                '<circle r="26" fill="transparent"></circle>' +
                '<circle r="11" fill="#1e6cff" stroke="#fff" stroke-width="2.5"></circle>' +
                '<text y="4" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">2</text>' +
                '<text x="0" y="-15" text-anchor="middle" fill="#1e3a8a" font-size="10.5" font-weight="900">Αιγαίο &amp; Κειμήλια</text>' +
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
            '</svg>' +
          '</div>' +
          '<button type="button" class="pexp-route-zoom-pill is-active" id="pexpRouteZoomBtn">\uD83D\uDDFA\uFE0F Όλος ο Χάρτης</button>' +
          '<button type="button" class="pexp-route-pan-hint" id="pexpRoutePanLeftBtn" tabindex="-1">\u2039 Προς Πιερία</button>' +
        '</div>';
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
    if (mainRouteImg) mainRouteImg.onerror = handleImgFallback;
    var routeThumbStrip = document.getElementById("pexpRouteThumbs");
    var thumbBtns = [];
   function ensureRouteThumbs() {
      if (thumbBtns.length || !routeThumbStrip || routePhotos.length !== 5) return;
      routeThumbStrip.innerHTML = routePhotos.map(function(ph, i) {
        return '<button type="button" class="pexp-thumb-btn' + (i === currentStopIdx ? ' is-active' : '') + '" data-photo="' + i + '" title="' + escAttr(ph.alt) + '">' +
          '<img src="' + optImg(ph.src, 320) + '" data-full-src="' + escAttr(ph.src) + '" alt="' + escAttr(ph.alt) + '" loading="lazy" decoding="async"/>' +
        '</button>';
      }).join("");
      routeThumbStrip.querySelectorAll("img").forEach(function(im) {
        im.onerror = handleImgFallback;
      });
      thumbBtns = routeThumbStrip.querySelectorAll(".pexp-thumb-btn");
     thumbBtns.forEach(function(b) {
        b.addEventListener("click", function() {
          stopRouteAutoplay();
          renderStop(Number(b.getAttribute("data-photo")));
        });
      });
    }
  var stopBadge = document.getElementById("pexpStopBadge");
    var stopTitle = document.getElementById("pexpRouteStopTitle");
    var routeStory = document.getElementById("pexpRouteStory");
    var routePins = document.querySelectorAll("#pexpRouteSvg .pexp-pin");
    var pin3NumEl = document.getElementById("pexpPin3Num");
    var pin4NumEl = document.getElementById("pexpPin4Num");
    var routeModesStrip = document.getElementById("pexpRouteModes");
    var routeBarStrong = routeModesStrip && routeModesStrip.parentNode ? routeModesStrip.parentNode.querySelector("strong") : null;
    var routeModes = document.querySelectorAll("#pexpRouteModes .pexp-mini-pill");
    var rModesMoreBtn = null;

   function syncRouteModesFade() {
      if (!routeModesStrip) return;
      var maxSc = routeModesStrip.scrollWidth - routeModesStrip.clientWidth;
      var canSc = maxSc > 6;
      var hasL = canSc && routeModesStrip.scrollLeft > 6;
      var hasR = canSc && routeModesStrip.scrollLeft < maxSc - 6;
      routeModesStrip.classList.toggle("is-scrollable", canSc);
      routeModesStrip.classList.toggle("has-fade-l", hasL);
      routeModesStrip.classList.toggle("has-fade-r", hasR);
      if (rModesMoreBtn) {
        var showBtn = hasR || hasL;
        rModesMoreBtn.classList.toggle("is-vis", showBtn);
        rModesMoreBtn.classList.toggle("is-left", !hasR && hasL);
        rModesMoreBtn.tabIndex = showBtn ? 0 : -1;
        rModesMoreBtn.textContent = hasR ? "\u203A" : "\u2039";
        rModesMoreBtn.setAttribute("aria-label", hasR ? "Περισσότερες επιλογές διαδρομής" : "Επιστροφή στην αρχή");
      }
    }

    if (routeModesStrip && routeModesStrip.parentNode && !document.getElementById("pexpRModesMore")) {
      var rmWrap = document.createElement("div");
      rmWrap.className = "pexp-rmodes-wrap";
      routeModesStrip.parentNode.insertBefore(rmWrap, routeModesStrip);
      rmWrap.appendChild(routeModesStrip);
      rModesMoreBtn = document.createElement("button");
      rModesMoreBtn.type = "button";
      rModesMoreBtn.id = "pexpRModesMore";
      rModesMoreBtn.className = "pexp-rmodes-more";
      rModesMoreBtn.tabIndex = -1;
      rModesMoreBtn.setAttribute("aria-label", "Περισσότερες επιλογές διαδρομής");
      rModesMoreBtn.textContent = "\u203A";
      rmWrap.appendChild(rModesMoreBtn);
      rModesMoreBtn.addEventListener("click", function() {
        var maxSc = routeModesStrip.scrollWidth - routeModesStrip.clientWidth;
        var goRight = routeModesStrip.scrollLeft < maxSc - 6;
        var st = Math.max(120, Math.round(routeModesStrip.clientWidth * 0.65));
        var nextLeft = goRight ? (routeModesStrip.scrollLeft + st) : 0;
        if (routeModesStrip.scrollTo) routeModesStrip.scrollTo({ left: nextLeft, behavior: "smooth" });
        else routeModesStrip.scrollLeft = nextLeft;
      });
      routeModesStrip.addEventListener("scroll", syncRouteModesFade, { passive: true });
      bindDragScroll(routeModesStrip);
    }

   var routeMapScrollEl = document.getElementById("pexpRouteMapScroll");
    var routeZoomBtn = document.getElementById("pexpRouteZoomBtn");
    var routePanLeftBtn = document.getElementById("pexpRoutePanLeftBtn");
    var lastRouteFocusX = 567;
    var routeScrollUserAbort = false;

    function getRouteMapScrollLeft(scEl, svgX) {
      var sw = scEl.scrollWidth, cw = scEl.clientWidth;
      if (sw <= cw + 4) return 0;
      var px = ((typeof svgX === "number" ? svgX : 567) / 660) * sw;
      return Math.max(0, Math.min(sw - cw, Math.round(px - cw / 2)));
    }

    function syncRoutePanHint() {
      if (!routePanLeftBtn || !routeMapScrollEl) return;
      var maxSc = routeMapScrollEl.scrollWidth - routeMapScrollEl.clientWidth;
      var showL = routeMapScrollEl.classList.contains("is-mobile-zoom") && !isJourneyPlaying && maxSc > 20 && routeMapScrollEl.scrollLeft > 90;
      routePanLeftBtn.classList.toggle("is-vis", showL);
      routePanLeftBtn.tabIndex = showL ? 0 : -1;
    }

    function scrollRouteMapToX(svgX, smooth) {
      if (!routeMapScrollEl) return;
      if (routeMapScrollEl.clientWidth === 0) {
        requestAnimationFrame(function() {
          if (routeMapScrollEl && routeMapScrollEl.scrollWidth > routeMapScrollEl.clientWidth + 4) {
            routeMapScrollEl.scrollLeft = getRouteMapScrollLeft(routeMapScrollEl, svgX);
            syncRoutePanHint();
          }
        });
        return;
      }
      if (routeMapScrollEl.scrollWidth <= routeMapScrollEl.clientWidth + 4) {
        syncRoutePanHint();
        return;
      }
      var tLeft = getRouteMapScrollLeft(routeMapScrollEl, svgX);
      if (smooth && typeof routeMapScrollEl.scrollTo === "function") {
        try {
          routeMapScrollEl.scrollTo({ left: tLeft, behavior: "smooth" });
          return;
        } catch (e) {}
      }
      routeMapScrollEl.scrollLeft = tLeft;
      syncRoutePanHint();
    }

    if (routeMapScrollEl) {
      var rMapTouchX = 0, rMapTouchY = 0, rMapMoved = false, rMapMulti = false, rMapSuppressUntil = 0;
      routeMapScrollEl.addEventListener("scroll", syncRoutePanHint, { passive: true });
      routeMapScrollEl.addEventListener("touchstart", function(e) {
        if (!e.touches || e.touches.length > 1) { rMapMulti = true; return; }
        rMapMulti = false;
        rMapMoved = false;
        rMapTouchX = e.touches[0].clientX;
        rMapTouchY = e.touches[0].clientY;
      }, { passive: true });
      routeMapScrollEl.addEventListener("touchmove", function(e) {
        if (!e.touches || e.touches.length > 1) { rMapMulti = true; return; }
        var dx = Math.abs(e.touches[0].clientX - rMapTouchX);
        var dy = Math.abs(e.touches[0].clientY - rMapTouchY);
        if (dx > 8 || dy > 8) rMapMoved = true;
        if (isJourneyPlaying && dx > 10) routeScrollUserAbort = true;
      }, { passive: true });
      routeMapScrollEl.addEventListener("touchend", function() {
        if (rMapMulti || rMapMoved) rMapSuppressUntil = performance.now() + 320;
        rMapMulti = false;
        rMapMoved = false;
      }, { passive: true });
      routeMapScrollEl.addEventListener("click", function(e) {
        if (e.detail !== 0 && (isPinchZoomed() || performance.now() < rMapSuppressUntil)) {
          rMapSuppressUntil = 0;
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      routeMapScrollEl.addEventListener("wheel", function() {
        if (isJourneyPlaying) routeScrollUserAbort = true;
      }, { passive: true });
      bindDragScroll(routeMapScrollEl, function() {
        if (isJourneyPlaying) routeScrollUserAbort = true;
      });
    }

    var toggleRouteMobileZoom = function(focusSvgX) {
      if (!routeMapScrollEl || !routeZoomBtn) return;
      var nextOn = !routeMapScrollEl.classList.contains("is-mobile-zoom");
      routeMapScrollEl.classList.toggle("is-mobile-zoom", nextOn);
      routeZoomBtn.classList.toggle("is-active", nextOn);
      routeZoomBtn.textContent = nextOn ? "\uD83D\uDDFA\uFE0F Όλος ο Χάρτης" : "\uD83D\uDD0D Ζουμ Χάρτη";
      if (nextOn) {
        var targetX = (typeof focusSvgX === "number") ? focusSvgX : lastRouteFocusX;
        requestAnimationFrame(function() {
          scrollRouteMapToX(targetX, false);
          syncRoutePanHint();
        });
      } else {
        routeMapScrollEl.scrollLeft = 0;
        syncRoutePanHint();
      }
    };

    if (routeZoomBtn && routeMapScrollEl) {
      routeZoomBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleRouteMobileZoom(lastRouteFocusX);
      });
      var routeSvgForDbl = document.getElementById("pexpRouteSvg");
      if (routeSvgForDbl) {
        bindDoubleTapZoom(routeSvgForDbl, ".pexp-pin, #pexpSeaMidPin", function(clientX) {
          if (window.innerWidth > 720 || isJourneyPlaying) return false;
          var r = routeSvgForDbl.getBoundingClientRect();
          var tapX = (r.width > 0) ? (((clientX - r.left) / r.width) * 660) : lastRouteFocusX;
          toggleRouteMobileZoom(tapX);
          return true;
        });
      }
    }

    if (routePanLeftBtn && routeMapScrollEl) {
      routePanLeftBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        stopRouteAutoplay();
        renderStop(4);
      });
    }

    syncRouteMapOnShow = function() {
      requestAnimationFrame(function() {
        syncRouteModesFade();
        if (!isJourneyPlaying) scrollRouteMapToX(lastRouteFocusX, false);
        syncRoutePanHint();
      });
    };

    addResizeTask(function(wChanged) {
      if (wChanged && modal.classList.contains("is-open") && currentTab === "route") {
        syncRouteMapOnShow();
      }
    });

    function syncRoutePinNumbers() {
      var isSea = (curRouteMode === "sea");
      if (pin3NumEl) pin3NumEl.textContent = isSea ? "3" : "4";
      if (pin4NumEl) pin4NumEl.textContent = isSea ? "4" : "5";
      if (routeBarStrong) {
        routeBarStrong.textContent = isSea
          ? "\uD83D\uDC46 Πάτησε στους αριθμούς 1 έως 4 πάνω στον χάρτη:"
          : "\uD83D\uDC46 Πάτησε στους αριθμούς 1 έως 5 πάνω στον χάρτη:";
      }
    }

   function getRoutePhotoCaption(pIdx, mode) {
      var ph = routePhotos[pIdx] || routePhotos[0];
      if (mode === "sea") {
        if (pIdx === 0) return "1. Η ακτή της παλιάς Περίστασης (Σάρκιοϊ) στην Προποντίδα (20 Οκτ. 1922)";
        if (pIdx === 2) return "2. Ατμόπλοια «Ωραία Ελλάς» & «Αθήναι»: Το ταξίδι στο Αιγαίο με τα 18 κιβώτια κειμηλίων";
        if (pIdx === 3) return "3. Άφιξη των πλοίων στη Θεσσαλονίκη (22 Οκτ. 1922) — προσφυγικός καταυλισμός";
        if (pIdx === 4) return "4. Νέα Περίσταση Πιερίας: Το νέο μας σπίτι και το 12/Θ Δημοτικό Σχολείο μας";
      } else if (mode === "land" && pIdx === 2) {
        return "3. Οδική πορεία των ~300 ανδρών με τα κάρα στους δρόμους της Θράκης & της Καβάλας";
      }
      return ph.alt;
    }

    function syncRouteThumbsForMode() {
      ensureRouteThumbs();
      thumbBtns.forEach(function(b, i) {
        if (i === 1) b.style.display = (curRouteMode === "sea") ? "none" : "";
        var cap = getRoutePhotoCaption(i, curRouteMode);
        b.title = cap;
        var im = b.querySelector("img");
        if (im) im.alt = cap;
      });
    }

    getRouteZoomGallery = function() {
      var order = (curRouteMode === "sea") ? [0, 2, 3, 4] : [0, 1, 2, 3, 4];
      var list = order.map(function(sIdx) {
        var ph = routePhotos[sIdx];
        return { src: ph.src, thumb: optImg(ph.src, 640), caption: getRoutePhotoCaption(sIdx, curRouteMode) };
      });
      var pos = order.indexOf(currentStopIdx);
      return { list: list, idx: pos !== -1 ? pos : 0 };
    };

    function setRoutePhoto(pIdx) {
      syncRouteThumbsForMode();
      var ph = routePhotos[pIdx] || routePhotos[0];
      var cap = getRoutePhotoCaption(pIdx, curRouteMode);
      if (mainRouteImg) {
        mainRouteImg.removeAttribute("data-tried-full");
        mainRouteImg.setAttribute("data-full-src", ph.src);
        mainRouteImg.src = optImg(ph.src, 640);
        mainRouteImg.alt = cap;
      }
      thumbBtns.forEach(function(b, i) {
        b.classList.toggle("is-active", i === pIdx);
      });
      var nextIdx = (curRouteMode === "sea" && pIdx === 0) ? 2 : ((pIdx + 1) % routePhotos.length);
      var nextPh = routePhotos[nextIdx];
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
      if (landActive) {
        if (curRouteMode === "sea") {
          if (sFloat > 3.001) {
            var f4 = Math.min(1, sFloat - 3);
            landActive.setAttribute("d", "M 121,124 L " + (121 + f4 * (78 - 121)).toFixed(1) + "," + (124 + f4 * (180 - 124)).toFixed(1));
            landActive.style.display = "block";
          } else {
            landActive.setAttribute("d", "");
          }
        } else {
          landActive.setAttribute("d", lp.d);
        }
      }

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

var seaMidPin = document.getElementById("pexpSeaMidPin");
    if (seaMidPin) {
      seaMidPin.addEventListener("focus", function() {
        if (!isJourneyPlaying) scrollRouteMapToX(272, true);
      });
      seaMidPin.addEventListener("click", function() {
        stopRouteAutoplay();
        renderStop(2);
      });
      seaMidPin.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          stopRouteAutoplay();
          renderStop(2);
        }
      });
    }

    stepRouteStop = function(dir) {
      if (curRouteMode === "sea") {
        var seaOrder = [0, 2, 3, 4];
        var pos = seaOrder.indexOf(currentStopIdx);
        if (pos === -1) pos = 0;
        renderStop(seaOrder[(pos + dir + seaOrder.length) % seaOrder.length]);
      } else {
        renderStop(currentStopIdx + dir);
      }
    };

   renderStop = function(idx) {
      var wasRouteReady = routeReady;
      routeReady = true;
      if (!isJourneyPlaying) routeScrollUserAbort = false;
      currentStopIdx = (idx + routeStops.length) % routeStops.length;
      if (curRouteMode === "sea" && currentStopIdx === 1) currentStopIdx = 2;
      var st = routeStops[currentStopIdx];

      syncRouteTokens(currentStopIdx, seaProgressByStop[currentStopIdx], currentStopIdx === 3);

      var rCx = st.cx, rCy = st.cy;
      var bTxt = st.badge, tTxt = st.title, sTxt = st.story;

      if (curRouteMode === "sea") {
        if (currentStopIdx === 0) {
          bTxt = "Σταθμός 1 από 4 (Θάλασσα) \u2022 20 Οκτ. 1922";
        } else if (currentStopIdx === 2) {
          rCx = 272; rCy = 233;
          bTxt = "Σταθμός 2 από 4 (Θάλασσα) \u2022 Αιγαίο Πέλαγος";
          tTxt = "2. Ατμόπλοια «Ωραία Ελλάς» & «Αθήναι» (18 Κιβώτια)";
          sTxt = "Τα γυναικόπαιδα ταξιδεύουν από την Προποντίδα και τον Ελλήσποντο στο Αιγαίο με τα ατμόπλοια «Ωραία Ελλάς» και «Αθήναι», κρατώντας ασφαλή τα 18 ξύλινα κιβώτια με τα ιερά κειμήλια της Περίστασης!";
        } else if (currentStopIdx === 3) {
          bTxt = "Σταθμός 3 από 4 (Θάλασσα) \u2022 22 Οκτ. 1922";
          tTxt = "3. Άφιξη Πλοίων στο Λιμάνι της Θεσσαλονίκης";
        } else if (currentStopIdx === 4) {
          bTxt = "Σταθμός 4 από 4 \u2022 Νέα Πατρίδα";
          tTxt = "4. Νέα Περίσταση Πιερίας: Το Νέο μας Σπίτι!";
        }
      } else if (curRouteMode === "land" && currentStopIdx === 2) {
        tTxt = "3. Οδική Πορεία σε Θράκη & Καβάλα";
        sTxt = "Οι ~300 άνδρες με τα κάρα και τα ζώα διασχίζουν επί εβδομάδες τους δύσβατους δρόμους της Θράκης και της Καβάλας με προορισμό τη Θεσσαλονίκη!";
      }

     syncRoutePinNumbers();
      lastRouteFocusX = rCx;
      if (activeRing) {
        activeRing.setAttribute("cx", rCx);
        activeRing.setAttribute("cy", rCy);
      }
     if (!isJourneyPlaying) {
        scrollRouteMapToX(rCx, wasRouteReady);
      }
      if (stopBadge) stopBadge.textContent = bTxt;
      if (stopTitle) stopTitle.textContent = tTxt;
      if (routeStory) routeStory.textContent = sTxt;
      setRoutePhoto(st.photoIdx);
      if (thumbBtns && thumbBtns[1]) {
        thumbBtns[1].style.display = (curRouteMode === "sea") ? "none" : "";
      }
      routePins.forEach(function(p, i) {
        p.style.opacity = i <= currentStopIdx ? "1" : "0.8";
      });
      if (seaMidPin) {
        seaMidPin.style.opacity = currentStopIdx >= 2 ? "1" : "0.82";
      }
    };

    routePins.forEach(function(pin) {
      pin.setAttribute("role", "button");
      pin.setAttribute("tabindex", "0");
      pin.addEventListener("focus", function() {
        var stIdx = Number(pin.getAttribute("data-stop"));
        if (!isJourneyPlaying && routeStops[stIdx]) scrollRouteMapToX(routeStops[stIdx].cx, true);
      });
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
      stepRouteStop(-1);
    });
    on("pexpNextStop", "click", function() {
      stopRouteAutoplay();
      stepRouteStop(1);
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
      syncRoutePanHint();
    };

    if (routePlayBtn) {
      routePlayBtn.addEventListener("click", function() {
        if (isJourneyPlaying || routeTimer) {
          stopRouteAutoplay();
          return;
        }
        routeScrollUserAbort = false;
        if (currentStopIdx >= routeStops.length - 1) {
          renderStop(0);
          scrollRouteMapToX(567, false);
        }
        isJourneyPlaying = true;
        syncRoutePanHint();
        routePlayBtn.textContent = "\u23F8\uFE0F Παύση";
        routePlayBtn.classList.add("is-playing");

        var legDurations = [1750, 1950, 2000, 1650];
        var runLeg = function(fromStop, resumeFrac) {
          if (!isJourneyPlaying || !modal.classList.contains("is-open") || (subJourney && subJourney.style.display === "none")) {
            stopRouteAutoplay();
            return;
          }
          var toStop = (curRouteMode === "sea" && fromStop === 0) ? 2 : (fromStop + 1);
          if (toStop >= routeStops.length) {
            stopRouteAutoplay();
            return;
          }
         var legPanDone = false, legPanStartP = 0, legPanDelta = 0;
          var dur = (curRouteMode === "sea" && fromStop === 0) ? 2200 : (legDurations[fromStop] || 1800);
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
            var curS = fromStop + ease * (toStop - fromStop);
            var curSea = seaFrom + ease * (seaTo - seaFrom);
            syncRouteTokens(curS, curSea, false);

            var lp = getLandPointAndPath(curS);
            var spRing = getSeaPoint(curSea);
            if (activeRing) {
              if (curRouteMode === "sea" && curS <= 3) {
                activeRing.setAttribute("cx", spRing.x.toFixed(1));
                activeRing.setAttribute("cy", spRing.y.toFixed(1));
              } else {
                activeRing.setAttribute("cx", lp.x.toFixed(1));
                activeRing.setAttribute("cy", lp.y.toFixed(1));
              }
            }

            var vehX = (curRouteMode === "land" || curS > 3)
              ? lp.x
              : (curRouteMode === "sea" ? spRing.x : (lp.x + spRing.x) * 0.5);
            lastRouteFocusX = vehX;
            if (routeMapScrollEl && !routeScrollUserAbort && routeMapScrollEl.scrollWidth > routeMapScrollEl.clientWidth + 4) {
              var idealL = getRouteMapScrollLeft(routeMapScrollEl, vehX);
              if (!legPanDone) {
                legPanDone = true;
                legPanStartP = p;
                legPanDelta = routeMapScrollEl.scrollLeft - idealL;
              }
              var remS = Math.max(0.05, Math.min(0.45, 1 - legPanStartP));
              var catchU = (p >= 1) ? 0 : Math.max(0, 1 - (p - legPanStartP) / remS);
              routeMapScrollEl.scrollLeft = Math.round(idealL + legPanDelta * catchU * catchU);
            }

            if (p < 1) {
              routeRafId = requestAnimationFrame(stepFrame);
            } else {
              routeRafId = null;
              renderStop(toStop);
              if (toStop >= routeStops.length - 1) {
                stopRouteAutoplay();
              } else {
                var pauseMs = (toStop === 3) ? 1350 : 900;
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
      function() { stopRouteAutoplay(); stepRouteStop(1); },
      function() { stopRouteAutoplay(); stepRouteStop(-1); }
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
          cartGameOpen = false;
          cartGameStage.style.display = "none";
          cartGameStage.innerHTML = "";
          cartTrigBtn.classList.remove("is-active");
        }
      };

      stopCartGame = cartChallengeCfg.onClose;
      openCartGameInModal = function() {
        if (cartGameStage.style.display !== "block") {
          cartGameOpen = true;
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
        cartGameOpen = true;
        cartTrigBtn.classList.add("is-active");
        cartGameStage.style.display = "block";
        renderPackChallenge(cartGameStage, cartChallengeCfg);
        requestAnimationFrame(function() {
          scrollInsideModal(cartGameStage);
        });
      });
    }

 resetRouteModeToBoth = function(rerender) {
      if (curRouteMode === "both") return;
      curRouteMode = "both";
      routeModes.forEach(function(b) {
        b.classList.toggle("is-active", (b.getAttribute("data-mode") || "both") === "both");
      });
      if (seaPath) seaPath.style.display = "block";
      if (seaActive) seaActive.style.display = "block";
      if (boatToken) boatToken.style.display = "block";
      if (landBg) {
        landBg.setAttribute("d", "M 567,128 L 482,81 L 278,78 L 121,124 L 78,180");
        landBg.style.display = "block";
      }
      if (landActive) landActive.style.display = "block";
      if (cartToken) cartToken.style.display = "block";
      if (routePins[1]) routePins[1].style.display = "";
      if (routePins[2]) routePins[2].style.display = "";
     if (seaMidPin) seaMidPin.style.display = "none";
      if (thumbBtns && thumbBtns[1]) thumbBtns[1].style.display = "";
      syncRoutePinNumbers();
      if (routeModesStrip) routeModesStrip.scrollLeft = 0;
      syncRouteModesFade();
      if (rerender && routeReady) renderStop(currentStopIdx);
    };

    routeModes.forEach(function(btn) {
      btn.addEventListener("click", function() {
        stopRouteAutoplay();
        routeModes.forEach(function(b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        if (routeModesStrip && routeModesStrip.scrollWidth > routeModesStrip.clientWidth) {
          var tSc = Math.max(0, btn.offsetLeft - (routeModesStrip.clientWidth - btn.offsetWidth) / 2);
          if (routeModesStrip.scrollTo) routeModesStrip.scrollTo({ left: tSc, behavior: "smooth" });
          else routeModesStrip.scrollLeft = tSc;
        }
        var m = btn.getAttribute("data-mode") || "both";
        curRouteMode = m;
        var showSea = (m !== "land");
        var showLand = (m !== "sea");
        if (seaPath) seaPath.style.display = showSea ? "block" : "none";
        if (seaActive) seaActive.style.display = showSea ? "block" : "none";
        if (boatToken) boatToken.style.display = showSea ? "block" : "none";
        if (landBg) {
          landBg.setAttribute("d", m === "sea" ? "M 121,124 L 78,180" : "M 567,128 L 482,81 L 278,78 L 121,124 L 78,180");
          landBg.style.display = "block";
        }
        if (landActive) landActive.style.display = (showLand || currentStopIdx > 3) ? "block" : "none";
        if (cartToken) cartToken.style.display = showLand ? "block" : "none";
        if (routePins[1]) routePins[1].style.display = (m === "sea") ? "none" : "";
        if (routePins[2]) routePins[2].style.display = (m === "sea") ? "none" : "";
        if (seaMidPin) seaMidPin.style.display = (m === "sea") ? "block" : "none";
        if (reunionBadge) reunionBadge.style.display = (m === "both" && currentStopIdx === 3) ? "" : "none";
        renderStop(currentStopIdx);
      });
    });

  /* Σημερινές Αποστάσεις, Πυξίδα της Αυλής μας & Κάρο του 1922 */
    selectDestination = function(key, fromCompass) {
      var wasInited = subTodayInited;
      ensureSubTodayInited(key);
      if (wasInited) selectDestination(key, fromCompass);
    };
    setCompassDirection = function(dirKey, fromDestSelect) {
      var wasInited = subTodayInited;
      var initKey = (dirKey === "N") ? "korinos" : (dirKey === "S" ? "platamonas" : (dirKey === "E" ? "paralia" : (dirKey === "SW" ? "olympus" : (dirKey === "NE" ? "thess" : "katerini"))));
      ensureSubTodayInited(initKey);
      if (wasInited) setCompassDirection(dirKey, fromDestSelect);
    };

    ensureSubTodayInited = function(initialDestKey) {
      if (subTodayInited) return;
      subTodayInited = true;

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
      },
      korinos: {
        dir: "N",
        walk: "1 ώρα & 40 λεπτά", walkPct: 74,
        bike: "25 λεπτά", bikePct: 19,
        car:  "10 λεπτά", carPct: 7,
        cart: "~2 έως 2,5 ώρες", cartPct: 100,
        note: "Από τον βόρειο δρόμο της Πύδνας, του Κίτρους και του Κορινού κατέβηκαν το 1923\u20131924 οι πρόσφυγες ερχόμενοι από τη Θεσσαλονίκη!"
      },
      platamonas: {
        dir: "S",
        walk: "7,5 ώρες", walkPct: 90,
        bike: "2 ώρες",   bikePct: 24,
        car:  "30 λεπτά", carPct: 6,
        cart: "~8 ώρες",  cartPct: 100,
        note: "Διασχίζοντας όλον τον νότιο κάμπο της Πιερίας δίπλα στις πλαγιές του Ολύμπου μέχρι το βυζαντινό Κάστρο του Πλαταμώνα!"
      }
    };

    var compassPoints = {
      N: {
        angle: 0, dest: "korinos",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/%CE%91%CE%B5%CF%81%CE%BF%CF%86%CF%89%CF%84%CE%BF%CE%B3%CF%81%CE%B1%CF%86%CE%AF%CE%B1_%CE%9A%CE%BF%CF%81%CE%B9%CE%BD%CE%BF%CF%8D.jpg?width=750",
        cap: "Βόρεια: Ο Κορινός Πιερίας από ψηλά (προς Κίτρος & Πύδνα)",
        badge: "\uD83E\uDDED Κατεύθυνση: ΒΟΡΡΑΣ (Β)",
        title: "\u2B06\uFE0F Βόρεια (Β) \u279C Κορινός & Κίτρος (8 χλμ)",
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
        angle: 180, dest: "platamonas",
        img: "https://commons.wikimedia.org/wiki/Special:FilePath/Platamon_Castle_01.jpg?width=750",
        cap: "Νότια: Το Κάστρο του Πλαταμώνα στη Νότια Πιερία",
        badge: "\uD83E\uDDED Κατεύθυνση: ΝΟΤΟΣ (Ν)",
        title: "\u2600\uFE0F Νότια (Ν) \u279C Κάμπος & Πλαταμώνας (38 χλμ)",
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
    if (destGridEl && !destGridEl.querySelector('[data-dest="korinos"]')) {
      [
        { key: "korinos", label: "\uD83C\uDFFA Κορινός (8 χλμ)" },
        { key: "platamonas", label: "\uD83C\uDFF0 Πλαταμώνας (38 χλμ)" }
      ].forEach(function(it) {
        var nb = document.createElement("button");
        nb.type = "button";
        nb.className = "pexp-dest-btn";
        nb.setAttribute("data-dest", it.key);
        nb.textContent = it.label;
        destGridEl.appendChild(nb);
      });
    }
    var destBtns = document.querySelectorAll("#pexpDestBtns .pexp-dest-btn");
    var destKeys = ["katerini", "paralia", "olympus", "thess", "korinos", "platamonas"];
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
            '<path id="pexpSunArc" d="M 176,120 A 56,56 0 0,1 64,120" fill="none" stroke="#fcd34d" stroke-width="2" stroke-dasharray="4,4" opacity="0.75"/>' +
            '<g transform="translate(120,120)">' +
              '<g class="pexp-needle-spin" id="pexpCompassNeedle" style="transform:rotate(270deg)">' +
                '<polygon points="0,-62 10,0 -10,0" fill="#ef4444"/>' +
                '<polygon points="0,56 10,0 -10,0" fill="#94a3b8"/>' +
              '</g>' +
            '</g>' +
            '<circle cx="120" cy="120" r="20" fill="#eff6ff" stroke="#1e6cff" stroke-width="2.5"/>' +
            '<text x="120" y="126" text-anchor="middle" font-size="16">\uD83C\uDFEB</text>' +
            '<g class="pexp-comp-sun" id="pexpCompassSun" transform="translate(176,120)" style="cursor:pointer" role="button" tabindex="0" aria-label="Ζωντανή θέση του ήλιου">' +
              '<circle id="pexpSunBg" r="12.5" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>' +
              '<text id="pexpSunIcon" y="4.5" text-anchor="middle" font-size="13">\u2600\uFE0F</text>' +
            '</g>' +
           '<g class="pexp-comp-pt" data-cdir="N" role="button" tabindex="0" aria-label="Βορράς">' +
              '<circle cx="120" cy="24" r="24" fill="transparent"/>' +
              '<circle cx="120" cy="24" r="17" fill="#dc2626" stroke="#fff" stroke-width="2"/>' +
              '<text x="120" y="29" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Β</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="S" role="button" tabindex="0" aria-label="Νότος">' +
              '<circle cx="120" cy="216" r="24" fill="transparent"/>' +
              '<circle cx="120" cy="216" r="17" fill="#0f766e" stroke="#fff" stroke-width="2"/>' +
              '<text x="120" y="221" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Ν</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="E" role="button" tabindex="0" aria-label="Ανατολή">' +
              '<circle cx="216" cy="120" r="24" fill="transparent"/>' +
              '<circle cx="216" cy="120" r="18" fill="#0284c7" stroke="#fff" stroke-width="2"/>' +
              '<text x="216" y="125" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Α</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="W" role="button" tabindex="0" aria-label="Δύση">' +
              '<circle cx="24" cy="120" r="24" fill="transparent"/>' +
              '<circle cx="24" cy="120" r="18" fill="#d97706" stroke="#fff" stroke-width="2"/>' +
              '<text x="24" y="125" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Δ</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="NE" role="button" tabindex="0" aria-label="Βορειοανατολικά">' +
              '<circle cx="187" cy="53" r="23" fill="transparent"/>' +
              '<circle cx="187" cy="53" r="15" fill="#4f46e5" stroke="#fff" stroke-width="2"/>' +
              '<text x="187" y="57" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">ΒΑ</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="SW" role="button" tabindex="0" aria-label="Νοτιοδυτικά">' +
              '<circle cx="53" cy="187" r="23" fill="transparent"/>' +
              '<circle cx="53" cy="187" r="15" fill="#7c3aed" stroke="#fff" stroke-width="2"/>' +
              '<text x="53" y="191" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">ΝΔ</text>' +
            '</g>' +
          '</svg>' +
        '</div>' +
      '<div class="pexp-compass-info">' +
          '<span class="pexp-compass-badge" id="pexpCompBadge"></span>' +
          '<div class="pexp-sun-live" id="pexpSunLivePill" role="button" tabindex="0" title="Πάτησε για να δεις την πορεία του ήλιου!"></div>' +
          '<div class="pexp-sun-modes" id="pexpSunModes">' +
            '<button type="button" class="pexp-sun-mbtn is-active" data-smode="live">\uD83D\uDD52 Τώρα</button>' +
            '<button type="button" class="pexp-sun-mbtn" data-smode="morning">\uD83C\uDF05 Πρωί (08:15)</button>' +
            '<button type="button" class="pexp-sun-mbtn" data-smode="noon">\u2600\uFE0F Μεσημέρι (13:15)</button>' +
            '<button type="button" class="pexp-sun-mbtn" data-smode="sunset">\uD83C\uDF07 Δειλινό</button>' +
          '</div>' +
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

   var srByM = [7.65, 7.25, 6.55, 6.85, 6.20, 5.95, 6.15, 6.60, 7.10, 7.60, 7.25, 7.65];
      var ssByM = [17.35, 17.95, 18.55, 20.10, 20.65, 21.00, 20.90, 20.35, 19.55, 18.75, 17.20, 17.05];
      var sunTargetDir = "E";
      var curSunMode = "live";
      var sunModeBtns = compCard.querySelectorAll(".pexp-sun-mbtn");
      var sunModeOrder = ["live", "morning", "noon", "sunset"];
      var sunG = document.getElementById("pexpCompassSun");
      var sunBg = document.getElementById("pexpSunBg");
      var sunIc = document.getElementById("pexpSunIcon");
      var sunArc = document.getElementById("pexpSunArc");
      var sunPill = document.getElementById("pexpSunLivePill");
      var athensTimeFmt = null;
      try {
        if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
          athensTimeFmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Athens", hour: "numeric", minute: "numeric", month: "numeric", hour12: false
          });
        }
      } catch (e) {}

     refreshCompassSun = function(modeOverride) {
        if (modeOverride) curSunMode = modeOverride;
        sunModeBtns.forEach(function(b) {
          b.classList.toggle("is-active", b.getAttribute("data-smode") === curSunMode);
        });

        if (!sunG || !sunPill) return;

        var now = new Date();
        var hh = now.getHours(), mm = now.getMinutes(), mo = now.getMonth();
        if (athensTimeFmt && athensTimeFmt.formatToParts) {
          try {
            var pts = athensTimeFmt.formatToParts(now);
            var pH = -1, pM = 0, pMo = -1;
            for (var i = 0; i < pts.length; i++) {
              if (pts[i].type === "hour") pH = Number(pts[i].value) % 24;
              else if (pts[i].type === "minute") pM = Number(pts[i].value);
              else if (pts[i].type === "month") pMo = Number(pts[i].value) - 1;
            }
            if (pH >= 0) { hh = pH; mm = pM; }
            if (pMo >= 0 && pMo < 12) mo = pMo;
          } catch (e) {}
        }
        var pad2 = function(n) { return (n < 10 ? "0" : "") + n; };
        var fmtDec = function(d) {
          var h = Math.floor(d), m = Math.round((d - h) * 60);
          if (m === 60) { h++; m = 0; }
          return pad2(h) + ":" + pad2(m);
        };
        var sr = srByM[mo] || 7.0;
        var ss = ssByM[mo] || 18.5;
        var dec = hh + mm / 60;
        var prefixLbl = "\u2600\uFE0F Τώρα (" + pad2(hh) + ":" + pad2(mm) + "): Ο ήλιος είναι ";

        if (curSunMode === "morning") {
          dec = Math.max(sr + 0.35, 8.25);
          prefixLbl = "\uD83C\uDF05 Πρωινό Κουδούνι (08:15): Ο ήλιος ανεβαίνει ";
        } else if (curSunMode === "noon") {
          dec = 13.25;
          prefixLbl = "\u2600\uFE0F Μεσημέρι (13:15): Ο ήλιος λάμπει ";
        } else if (curSunMode === "sunset") {
          dec = ss - 0.45;
          prefixLbl = "\uD83C\uDF07 Δειλινό (~" + fmtDec(dec) + "): Ο ήλιος βασιλεύει ";
        }

        if (curSunMode === "live" && (dec < sr || dec > ss)) {
          sunTargetDir = "E";
          sunG.setAttribute("transform", "translate(120,64)");
          if (sunBg) { sunBg.setAttribute("fill", "#1e293b"); sunBg.setAttribute("stroke", "#94a3b8"); }
          if (sunIc) sunIc.textContent = "\uD83C\uDF19";
          if (sunArc) sunArc.style.opacity = "0.25";
          sunPill.classList.add("is-night");
          sunPill.textContent = "\uD83C\uDF19 Τώρα (" + pad2(hh) + ":" + pad2(mm) + "): Είναι νύχτα στην αυλή μας! Ανατολή ~" + fmtDec(sr) + " στην Παραλία (Α)!";
        } else {
          var u = Math.max(0, Math.min(1, (dec - sr) / (ss - sr)));
          var ang = 90 + u * 180;
          var rad = (ang - 90) * Math.PI / 180;
          var sx = (120 + 56 * Math.cos(rad)).toFixed(1);
          var sy = (120 + 56 * Math.sin(rad)).toFixed(1);
          sunG.setAttribute("transform", "translate(" + sx + "," + sy + ")");
          if (sunBg) { sunBg.setAttribute("fill", "#fef3c7"); sunBg.setAttribute("stroke", "#f59e0b"); }
          if (sunIc) sunIc.textContent = (u < 0.14 || u > 0.86) ? "\uD83C\uDF05" : "\u2600\uFE0F";
          if (sunArc) sunArc.style.opacity = "0.85";
          sunPill.classList.remove("is-night");

          var skyWhere = "";
          if (ang < 135) {
            sunTargetDir = "E";
            skyWhere = "Ανατολικά (Α \u2022 Παραλία & Θερμαϊκός)";
          } else if (ang < 205) {
            sunTargetDir = "S";
            skyWhere = "Νότια (Ν \u2022 ψηλά πάνω από τον κάμπο & Πλαταμώνα)";
          } else if (ang < 242) {
            sunTargetDir = "SW";
            skyWhere = "Νοτιοδυτικά (ΝΔ \u2022 πάνω από τον Όλυμπο)";
          } else {
            sunTargetDir = "W";
            skyWhere = "Δυτικά (Δ \u2022 προς Κατερίνη & Πιέρια Όρη)";
          }
          sunPill.textContent = prefixLbl + skyWhere + "!";
        }
      };
      refreshCompassSun("live");

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
        var smBtn = e.target.closest("[data-smode]");
        if (smBtn) {
          refreshCompassSun(smBtn.getAttribute("data-smode"));
          if (sunTargetDir) setCompassDirection(sunTargetDir, false);
          return;
        }
        if (e.target.closest("#pexpCompassSun") || e.target.closest("#pexpSunLivePill")) {
          if (curCompassKey === sunTargetDir) {
            var nextM = sunModeOrder[(sunModeOrder.indexOf(curSunMode) + 1) % sunModeOrder.length];
            refreshCompassSun(nextM);
          } else {
            refreshCompassSun(curSunMode);
          }
          if (sunTargetDir) setCompassDirection(sunTargetDir, false);
          return;
        }
      var hit = e.target.closest("[data-cdir]");
        if (!hit) return;
        setCompassDirection(hit.getAttribute("data-cdir"), false);
      });

      compCard.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          var kbEl = e.target.closest("#pexpCompassSun, #pexpSunLivePill, .pexp-comp-pt");
          if (kbEl) {
            e.preventDefault();
            kbEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
        }
      });
    }

  ensureCompassImg = function() {
      var curPt = compassPoints[curCompassKey];
      if (compassImgEl && curPt && curPt.img) {
        compassImgEl.removeAttribute("data-tried-full");
        compassImgEl.setAttribute("data-full-src", curPt.img);
        compassImgEl.src = optImg(curPt.img, 640);
        compassImgEl.alt = curPt.cap;
      }
    };

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
    var raceResetBtnEl = null;
    var raceMsgEl = null;
    if (vehiclesGrid && vehiclesGrid.parentNode && !document.getElementById("pexpRaceBar")) {
      var rBar = document.createElement("div");
      rBar.id = "pexpRaceBar";
      rBar.className = "pexp-race-bar";
      rBar.innerHTML =
        '<button type="button" class="pexp-race-btn" id="pexpRaceBtn">\uD83C\uDFC1 Δες τα να ξεκινούν μαζί!</button>' +
        '<button type="button" class="pexp-race-reset-btn" id="pexpRaceResetBtn" style="display:none">\u21A9\uFE0F Σύγκριση Χρόνου</button>' +
        '<span class="pexp-race-msg" id="pexpRaceMsg">\uD83D\uDEA6 Πάτησε τη σημαία για να δεις πόσο γρήγορα φτάνει το αυτοκίνητο ενώ το κάρο του 1922 μόλις ξεκινά!</span>';
      vehiclesGrid.parentNode.insertBefore(rBar, vehiclesGrid);
      raceBtnEl = document.getElementById("pexpRaceBtn");
      raceResetBtnEl = document.getElementById("pexpRaceResetBtn");
      raceMsgEl = document.getElementById("pexpRaceMsg");
      if (raceResetBtnEl) {
        raceResetBtnEl.addEventListener("click", function() { stopSpeedRace(true); });
      }
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
      },
      korinos: {
        warpAt: 2100,
        warpMsg: "\u23E9 Επιτάχυνση χρόνου: πορεία στον βόρειο δρόμο προς Κορινό & Κίτρος...",
        car:  { real: 700,  fin: 700,  done: "\uD83E\uDD47 1ο! Κορινός (10')" },
        bike: { real: 1750, fin: 1750, done: "\uD83E\uDD48 2ο! Έφτασε (25')" },
        walk: { real: 7000, fin: 5200, done: "\uD83E\uDD49 3ο! Έφτασε (1ώ 40')" },
        cart: { real: 9450, fin: 6800, done: "\uD83C\uDFC1 4ο! Έφτασε (~2–2,5ώ)" },
        carHitMsg: "\uD83E\uDD47 Το αυτοκίνητο έφτασε κιόλας στον Κορινό (10'), ενώ το κάρο του 1922 είναι μόλις στο 7% της διαδρομής!",
        endMsg: "\uD83C\uDFC1 10 λεπτά σήμερα με αυτοκίνητο έως τον Κορινό, έναντι 2+ ωρών στον βόρειο δρόμο του 1922!"
      },
      platamonas: {
        warpAt: 2900,
        warpMsg: "\u23E9 Επιτάχυνση χρόνου: περνούν ώρες στον νότιο κάμπο της Πιερίας...",
        car:  { real: 700,   fin: 700,  done: "\uD83E\uDD47 1ο! Πλαταμώνας (30')" },
        bike: { real: 2800,  fin: 2800, done: "\uD83E\uDD48 2ο! Έφτασε (2 ώρες)" },
        walk: { real: 10500, fin: 5600, done: "\uD83E\uDD49 3ο! Έφτασε (7,5 ώρες)" },
        cart: { real: 11200, fin: 6800, done: "\uD83C\uDFC1 4ο! Έφτασε (~8 ώρες)" },
        carHitMsg: "\uD83E\uDD47 Το αυτοκίνητο έφτασε στο Κάστρο του Πλαταμώνα (30'), ενώ το κάρο του 1922 έχει κάνει μόλις το 6%!",
        endMsg: "\uD83C\uDFC1 30 λεπτά σήμερα έως τον Πλαταμώνα, ενώ το βοϊδόκαρο ήθελε ~8 ολόκληρες ώρες στον κάμπο!"
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
        if (raceResetBtnEl) raceResetBtnEl.style.display = "none";
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

       if (raceResetBtnEl) raceResetBtnEl.style.display = "none";
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
            if (raceResetBtnEl) raceResetBtnEl.style.display = "inline-block";
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

  selectDestination(initialDestKey || "katerini", false);
    };
    }; /* Τέλος initRoutePane */

    /* ================= 3. ΑΠΟ ΤΗ ΘΑΛΑΣΣΑ ΣΤΟΝ ΟΛΥΜΠΟ ================= */
    initElevPane = function() {
      if (elevPaneInited) return;
      elevPaneInited = true;

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
        '<div class="pexp-elev-map-frame" id="pexpElevMapFrame">' +
          '<div class="pexp-elev-map-scroll is-mobile-zoom" id="pexpElevMapScroll">' +
            '<svg id="pexpProfileSvg" viewBox="0 0 760 265" style="width:100%;height:auto;display:block" shape-rendering="geometricPrecision" role="img" aria-label="Διαδραστική ζωγραφιά από την Παραλία Κατερίνης και την Περίσταση έως τον Μύτικα">' +
              '<circle cx="325" cy="36" r="20" fill="#fde047"></circle>' +
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
         '<g id="pexpOlyHintArrow" style="display:none;pointer-events:none">' +
                '<g id="pexpOlyHintAnim">' +
                  '<rect id="pexpOlyHintBg" x="-68" y="-14" width="136" height="26" rx="13" fill="#fffbeb" stroke="#d97706" stroke-width="2.2"></rect>' +
                  '<polygon id="pexpOlyHintTip" points="-6,12 6,12 0,19" fill="#d97706"></polygon>' +
                  '<text id="pexpOlyHintTxt" y="3" text-anchor="middle" fill="#92400e" font-size="11.5" font-weight="900"></text>' +
                '</g>' +
              '</g>' +
            '</svg>' +
          '</div>' +
          '<button type="button" class="pexp-elev-zoom-pill is-active" id="pexpElevZoomBtn">\uD83D\uDDFA\uFE0F Όλο το Βουνό</button>' +
          '<button type="button" class="pexp-elev-pan-hint" id="pexpElevPanRightBtn" tabindex="-1">\uD83C\uDFD4\uFE0F Μύτικας \u203A</button>' +
        '</div>';
      if (tmpProfWrap.firstElementChild) {
        brokenProfileSvg.parentNode.replaceChild(tmpProfWrap.firstElementChild, brokenProfileSvg);
      }
    }

   curZoneIdx = 1;
    var zRing = document.getElementById("pexpZoneRing");
  var zImg1 = document.getElementById("pexpZoneImg1");
    var zImg2 = document.getElementById("pexpZoneImg2");
    if (zImg1) zImg1.onerror = handleImgFallback;
    if (zImg2) zImg2.onerror = handleImgFallback;
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
      panes.elevation.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          var spTag = e.target.closest("[data-sp-idx]");
          if (spTag) {
            e.preventDefault();
            spTag.click();
          }
        }
      });
    }

var liveBaseTempC = null;
    var zoneTempNames = [
      "Παραλία (0μ)",
      "Περίσταση (26μ)",
      "Χαράδρα Ενιπέα (~800μ)",
      "Δάσος Ρόμπολων (~2.000μ)",
      "Κορυφή Μύτικας (2.918μ)"
    ];
    var zoneTempOffsets = [0.2, 0, -5.0, -12.8, -18.8];
    function getOlympusWearTip(tC) {
      if (tC <= 0) return "\uD83E\uDDE4 Σκούφος, γάντια & χοντρό μπουφάν!";
      if (tC <= 9) return "\uD83E\uDDE5 Χοντρό μπουφάν (αρκετό κρύο!)";
      if (tC <= 16) return "\uD83E\uDDF6 Ζακέτα ή αντιανεμικό μπουφάν";
      if (tC <= 24) return "\uD83D\uDC55 Άνετο μπλουζάκι";
      return "\uD83E\uDDE2 Καπέλο, κοντομάνικο & δροσερό νερό!";
    }
    function updateZoneLiveTempPill() {
      if (liveBaseTempC === null) return;
      var tempPill = document.getElementById("pexpLiveTemp");
      if (!tempPill) return;
      var tPeristasi = Math.round(liveBaseTempC);
      var tZone = Math.round(liveBaseTempC + (zoneTempOffsets[curZoneIdx] || 0));
      var tip = getOlympusWearTip(tZone);
      if (curZoneIdx === 1) {
        var tMyt = Math.round(liveBaseTempC - 18.8);
        tempPill.textContent = "\uD83C\uDF21\uFE0F Τώρα στην Περίσταση (26μ): " + tPeristasi + "\u00B0C \u2022 " + tip + " (Μύτικας: ~" + tMyt + "\u00B0C)";
      } else {
        tempPill.textContent = "\uD83C\uDF21\uFE0F Τώρα εδώ \u2014 " + zoneTempNames[curZoneIdx] + ": ~" + tZone + "\u00B0C (Περίσταση: " + tPeristasi + "\u00B0C) \u2022 " + tip;
      }
    }

   var profileSvg = document.getElementById("pexpProfileSvg");
    var elevMapCard = profileSvg ? profileSvg.closest(".pexp-map-card") : null;
    var elevMapScrollEl = document.getElementById("pexpElevMapScroll");
    var elevZoomBtn = document.getElementById("pexpElevZoomBtn");
    var elevPanRightBtn = document.getElementById("pexpElevPanRightBtn");
    var olyGameActive = false;
    var olyPackActive = false;
    var olyDeck = [];
    var olyRound = 0;
    var olyWaitingNext = false;
    var olyEcoBtn = null;
    var olyPackBtn = null;
    var olyStage = null;
    var lastElevFocusX = 238;
    var lastOlyHintX = -1;
    var elevShowRaf = 0;

    function getElevMapScrollLeft(scEl, svgX) {
      var sw = scEl.scrollWidth, cw = scEl.clientWidth;
      if (sw <= cw + 4) return 0;
      var px = ((typeof svgX === "number" ? svgX : 238) / 760) * sw;
      return Math.max(0, Math.min(sw - cw, Math.round(px - cw / 2)));
    }

    function syncElevPanHint() {
      if (!elevPanRightBtn || !elevMapScrollEl) return;
      var maxSc = elevMapScrollEl.scrollWidth - elevMapScrollEl.clientWidth;
      var showR = elevMapScrollEl.classList.contains("is-mobile-zoom") && maxSc > 20 && elevMapScrollEl.scrollLeft < maxSc - 105;
      elevPanRightBtn.classList.toggle("is-vis", showR);
      elevPanRightBtn.tabIndex = showR ? 0 : -1;
    }

    function scrollElevMapToX(svgX, smooth) {
      if (!elevMapScrollEl) return;
      if (elevMapScrollEl.clientWidth === 0) {
        syncElevMapOnShow();
        return;
      }
      if (elevMapScrollEl.scrollWidth <= elevMapScrollEl.clientWidth + 4) {
        syncElevPanHint();
        return;
      }
      var tLeft = getElevMapScrollLeft(elevMapScrollEl, svgX);
      if (smooth && typeof elevMapScrollEl.scrollTo === "function") {
        try {
          elevMapScrollEl.scrollTo({ left: tLeft, behavior: "smooth" });
          return;
        } catch (e) {}
      }
      elevMapScrollEl.scrollLeft = tLeft;
      syncElevPanHint();
    }

    syncElevMapOnShow = function() {
      if (elevShowRaf) cancelAnimationFrame(elevShowRaf);
      elevShowRaf = requestAnimationFrame(function() {
        elevShowRaf = 0;
        var targetX = (olyGameActive && !olyWaitingNext) ? (lastOlyHintX > 0 ? lastOlyHintX : 380) : lastElevFocusX;
        scrollElevMapToX(targetX, false);
        syncElevPanHint();
      });
    };

    var toggleElevMobileZoom = function(focusSvgX) {
      if (!elevMapScrollEl || !elevZoomBtn) return;
      var nextOn = !elevMapScrollEl.classList.contains("is-mobile-zoom");
      elevMapScrollEl.classList.toggle("is-mobile-zoom", nextOn);
      elevZoomBtn.classList.toggle("is-active", nextOn);
      elevZoomBtn.textContent = nextOn ? "\uD83D\uDDFA\uFE0F Όλο το Βουνό" : "\uD83D\uDD0D Ζουμ Βουνού";
      if (nextOn) {
        var targetX = (typeof focusSvgX === "number")
          ? focusSvgX
          : ((olyGameActive && !olyWaitingNext) ? (lastOlyHintX > 0 ? lastOlyHintX : 380) : lastElevFocusX);
        requestAnimationFrame(function() {
          scrollElevMapToX(targetX, false);
          syncElevPanHint();
        });
      } else {
        elevMapScrollEl.scrollLeft = 0;
        syncElevPanHint();
      }
    };

    if (elevMapScrollEl) {
      var elvStartX = 0, elvStartY = 0, elvMoved = false, elvMulti = false, elvSuppressUntil = 0;
      elevMapScrollEl.addEventListener("scroll", syncElevPanHint, { passive: true });
      elevMapScrollEl.addEventListener("touchstart", function(e) {
        if (!e.touches || e.touches.length > 1) { elvMulti = true; return; }
        elvMulti = false;
        elvMoved = false;
        elvStartX = e.touches[0].clientX;
        elvStartY = e.touches[0].clientY;
      }, { passive: true });
      elevMapScrollEl.addEventListener("touchmove", function(e) {
        if (!e.touches || e.touches.length > 1) { elvMulti = true; return; }
        if (Math.abs(e.touches[0].clientX - elvStartX) > 8 || Math.abs(e.touches[0].clientY - elvStartY) > 8) {
          elvMoved = true;
        }
      }, { passive: true });
      elevMapScrollEl.addEventListener("touchend", function() {
        if (elvMulti || elvMoved) elvSuppressUntil = performance.now() + 320;
        elvMulti = false;
        elvMoved = false;
      }, { passive: true });
      elevMapScrollEl.addEventListener("click", function(e) {
        if (e.detail !== 0 && (isPinchZoomed() || performance.now() < elvSuppressUntil)) {
          elvSuppressUntil = 0;
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      bindDragScroll(elevMapScrollEl);
    }

    if (elevZoomBtn && elevMapScrollEl) {
      elevZoomBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleElevMobileZoom();
      });
      if (profileSvg) {
        bindDoubleTapZoom(profileSvg, "", function(clientX) {
          if (window.innerWidth > 720 || olyGameActive) return false;
          var r = profileSvg.getBoundingClientRect();
          var tapX = (r.width > 0) ? (((clientX - r.left) / r.width) * 760) : lastElevFocusX;
          toggleElevMobileZoom(tapX);
          return true;
        });
      }
    }

    if (elevPanRightBtn && elevMapScrollEl) {
      elevPanRightBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        if (olyGameActive) scrollElevMapToX(682, true);
        else selectZone(4);
      });
    }

  addResizeTask(function(wChanged) {
      if (wChanged && modal.classList.contains("is-open") && currentTab === "elevation") {
        syncElevMapOnShow();
      }
    });

    getElevZoomGallery = function(startIdx) {
      var z = olympusZones[curZoneIdx] || olympusZones[0];
      var list = [];
      if (z.img1) list.push({ src: z.img1, thumb: optImg(z.img1, 640), caption: z.cap1 || z.title });
      if (z.img2) list.push({ src: z.img2, thumb: optImg(z.img2, 640), caption: z.cap2 || z.title });
      return { list: list, idx: (startIdx === 1 && list.length > 1) ? 1 : 0 };
    };

    selectZone = function(idx) {
      var wasElevReady = elevReady;
      elevReady = true;
      curZoneIdx = (idx + olympusZones.length) % olympusZones.length;
      var z = olympusZones[curZoneIdx];
      lastElevFocusX = z.cx;
      if (zRing) {
        zRing.setAttribute("cx", z.cx);
        zRing.setAttribute("cy", z.cy);
      }
      if (!elevShowRaf) {
        var canSmooth = wasElevReady && modal.classList.contains("is-open") && panes.elevation && panes.elevation.classList.contains("is-active");
        scrollElevMapToX(z.cx, canSmooth);
      }
      if (zAlt) zAlt.textContent = z.alt;
      if (zTitle) zTitle.textContent = z.title;
      if (zDesc) zDesc.textContent = z.desc;
     if (zImg1) { zImg1.removeAttribute("data-tried-full"); zImg1.setAttribute("data-full-src", z.img1); zImg1.src = optImg(z.img1, 640); zImg1.alt = z.cap1 || z.title; }
      if (zImg2) { zImg2.removeAttribute("data-tried-full"); zImg2.setAttribute("data-full-src", z.img2); zImg2.src = optImg(z.img2, 640); zImg2.alt = z.cap2 || z.title; }
      if (zCap) zCap.textContent = z.caption + " (\uD83D\uDCF7 Πάτησε και στις ετικέτες με κάμερα!)";
      if (zFlora) zFlora.innerHTML = z.flora.map(function(f) { return buildNatureTagHtml(f, "pexp-tag-flora"); }).join("");
      if (zFauna) zFauna.innerHTML = z.fauna.map(function(a) { return buildNatureTagHtml(a, "pexp-tag-fauna"); }).join("");
      if (zFact) zFact.textContent = z.fact;

      zHits.forEach(function(h, i) { h.style.opacity = (i === curZoneIdx) ? "1" : "0.78"; });

     updateZoneLiveTempPill();
      var nextZ = olympusZones[(curZoneIdx + 1) % olympusZones.length];
      var prevZ = olympusZones[(curZoneIdx - 1 + olympusZones.length) % olympusZones.length];
      if (nextZ) { preloadImg(optImg(nextZ.img1, 640)); preloadImg(optImg(nextZ.img2, 640)); }
      if (prevZ) { preloadImg(optImg(prevZ.img1, 640)); preloadImg(optImg(prevZ.img2, 640)); }
    };

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
    var zPrevBtn = document.getElementById("pexpZonePrev");
    var zNextBtn = document.getElementById("pexpZoneNext");
    var olyInlineNextBtn = null;
    if (zNextBtn && zNextBtn.parentNode) {
      olyInlineNextBtn = document.createElement("button");
      olyInlineNextBtn.type = "button";
      olyInlineNextBtn.className = "pexp-root-pop-cta";
      olyInlineNextBtn.style.cssText = "display:none;background:#059669;margin:0";
      zNextBtn.parentNode.appendChild(olyInlineNextBtn);
    }

    function syncOlyNavControls() {
      if (zPrevBtn) zPrevBtn.style.display = olyGameActive ? "none" : "";
      if (zNextBtn) zNextBtn.style.display = olyGameActive ? "none" : "";
      if (olyInlineNextBtn) {
        if (olyGameActive && olyWaitingNext) {
          olyInlineNextBtn.textContent = "Επόμενο (" + (olyRound + 2) + "/5) \u279C";
          olyInlineNextBtn.style.display = "inline-block";
        } else {
          olyInlineNextBtn.style.display = "none";
        }
      }
    }

    function setOlyAnswerCardVisible(vis) {
      if (zRing) zRing.style.display = vis ? "" : "none";
      if (natureCard) natureCard.style.display = vis ? "" : "none";
      syncOlyNavControls();
    }

  isOlympusGuessing = function() {
      return !!olyGameActive;
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

    var olyHintEl = document.getElementById("pexpOlyHintArrow");
      var olyHintAnim = document.getElementById("pexpOlyHintAnim");
      var olyHintBg = document.getElementById("pexpOlyHintBg");
      var olyHintTip = document.getElementById("pexpOlyHintTip");
      var olyHintTxt = document.getElementById("pexpOlyHintTxt");
      var olyHintTimer = null;

     var getOlyRoundPrompt = function(isFirst) {
        var isZoomSc = !!(elevMapScrollEl && elevMapScrollEl.scrollWidth > elevMapScrollEl.clientWidth + 8);
        if (isZoomSc) {
          return isFirst
            ? "\uD83D\uDC47 Σύρε το βουνό αριστερά-δεξιά (0μ \u2194 2.918μ) & πάτησε στη σωστή ζώνη!"
            : "\uD83D\uDC47 Σύρε το βουνό & πάτησε πάνω στη σωστή ζώνη!";
        }
        return isFirst
          ? "\uD83D\uDC47 Πάτησε απευθείας πάνω στη σωστή περιοχή της ζωγραφιάς από κάτω!"
          : "\uD83D\uDC47 Πάτησε πάνω στη σωστή ζώνη της ζωγραφιάς!";
      };

      var hideOlyHintArrow = function() {
        if (olyHintTimer) { clearTimeout(olyHintTimer); olyHintTimer = null; }
        lastOlyHintX = -1;
        if (olyHintEl) olyHintEl.style.display = "none";
      };

     var showOlyHintArrow = function(clickedIdx, goHigher) {
        var cz = olympusZones[clickedIdx];
        if (!cz || !olyHintEl || !olyHintAnim) return;
        hideOlyHintArrow();
        var placeBelow = (cz.cy < 72);
        var hx = Math.max(74, Math.min(686, cz.cx));
        var hy = placeBelow ? (cz.cy + 38) : Math.max(24, cz.cy - 34);
        lastOlyHintX = hx;
        olyHintEl.setAttribute("transform", "translate(" + hx + "," + hy + ")");
        if (olyHintBg) {
          olyHintBg.setAttribute("fill", goHigher ? "#fffbeb" : "#f0f9ff");
          olyHintBg.setAttribute("stroke", goHigher ? "#d97706" : "#0284c7");
        }
        if (olyHintTip) {
          olyHintTip.setAttribute("points", placeBelow ? "-6,-14 6,-14 0,-21" : "-6,12 6,12 0,19");
          olyHintTip.setAttribute("fill", goHigher ? "#d97706" : "#0284c7");
        }
        if (olyHintTxt) {
          olyHintTxt.setAttribute("fill", goHigher ? "#92400e" : "#075985");
          olyHintTxt.textContent = goHigher ? "\u2B06\uFE0F Πιο ψηλά! \u2197" : "\u2199 Πιο χαμηλά! \u2B07\uFE0F";
        }
        olyHintAnim.setAttribute("class", "");
        olyHintEl.style.display = "";
        void olyHintEl.getBoundingClientRect();
        olyHintAnim.setAttribute("class", goHigher ? "pexp-oly-arrow-up" : "pexp-oly-arrow-down");
        if (elevMapScrollEl && elevMapScrollEl.scrollWidth > elevMapScrollEl.clientWidth + 4) {
          var sw = elevMapScrollEl.scrollWidth, cw = elevMapScrollEl.clientWidth;
          var k = sw / 760;
          var neighborIdx = Math.max(0, Math.min(olympusZones.length - 1, clickedIdx + (goHigher ? 1 : -1)));
          var neighborX = olympusZones[neighborIdx].cx;
          var minPx = Math.min(hx - 72, neighborX - 42) * k;
          var maxPx = Math.max(hx + 72, neighborX + 42) * k;
          var curL = elevMapScrollEl.scrollLeft;
          var nextL = curL;
          if (goHigher && maxPx > curL + cw - 10) {
            nextL = Math.min(sw - cw, Math.round(maxPx - cw + 14));
            if (minPx < nextL + 6) nextL = Math.max(0, Math.round(minPx - 6));
          } else if (!goHigher && minPx < curL + 10) {
            nextL = Math.max(0, Math.round(minPx - 14));
            if (maxPx > nextL + cw - 6) nextL = Math.min(sw - cw, Math.round(maxPx - cw + 6));
          }
          if (Math.abs(nextL - curL) > 4) {
            if (typeof elevMapScrollEl.scrollTo === "function") {
              try { elevMapScrollEl.scrollTo({ left: nextL, behavior: "smooth" }); } catch (err) { elevMapScrollEl.scrollLeft = nextL; }
            } else {
              elevMapScrollEl.scrollLeft = nextL;
            }
          }
        }
        olyHintTimer = setTimeout(hideOlyHintArrow, 2400);
      };

      var advanceOlyRound = function() {
        if (!olyGameActive || !olyWaitingNext) return;
        hideOlyHintArrow();
        olyRound++;
        olyWaitingNext = false;
        setOlyAnswerCardVisible(false);
        scrollElevMapToX(380, true);
        drawOlyRound(getOlyRoundPrompt(false), "");
        if (olyStage) scrollInsideModal(olyStage);
      };
      if (olyInlineNextBtn) {
        olyInlineNextBtn.addEventListener("click", advanceOlyRound);
      }

      stopOlympusGame = function() {
        var wasGuessing = olyGameActive;
        hideOlyHintArrow();
        olyGameActive = false;
        olyPackActive = false;
        olyWaitingNext = false;
        olyStageOpen = false;
        setOlyAnswerCardVisible(true);
        if (wasGuessing && panes.elevation && panes.elevation.classList.contains("is-active")) {
          scrollElevMapToX(lastElevFocusX, true);
        }
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
        olyStageOpen = true;
        olyRound = 0;
        olyWaitingNext = false;
        olyDeck = shuffleList(olyPoolByZone.map(function(pair) {
          return pair[Math.floor(Math.random() * pair.length)];
        }));
      setOlyAnswerCardVisible(false);
        if (profileSvg) profileSvg.classList.add("is-game-target");
        olyEcoBtn.classList.add("is-active");
        olyStage.style.display = "block";
        scrollElevMapToX(380, true);
        drawOlyRound(getOlyRoundPrompt(true), "");
       olyStage.onclick = function(e) {
          if (e.target.closest("[data-oly-close]")) {
            stopOlympusGame();
         } else if (e.target.closest("[data-oly-zoom]")) {
            var curQ = olyDeck[olyRound];
            if (curQ && curQ.img) openSinglePhotoZoom(curQ.img, curQ.name + " \u2022 " + curQ.note, optImg(curQ.img, 330));
        } else if (e.target.closest("[data-oly-next]")) {
            advanceOlyRound();
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
        olyStageOpen = true;
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
        if (olyWaitingNext) {
            if (olyStage) scrollInsideModal(olyStage);
            return;
          }
          var q = olyDeck[olyRound];
          if (!q) return;

         if (clickedZone === q.zone) {
            hideOlyHintArrow();
            selectZone(clickedZone);
            var winThumb = q.img
              ? '<img class="pexp-oly-win-thumb" src="' + optImg(q.img, 330) + '" alt="' + escAttr(q.name) + '" data-oly-zoom="1" title="Πάτησε για μεγέθυνση!"/>'
              : '';
            if (olyRound < olyDeck.length - 1) {
              olyWaitingNext = true;
              setOlyAnswerCardVisible(true);
              drawOlyRound(
                '<div class="pexp-oly-win-wrap">' + winThumb + '<span>\u2705 Μπράβο! Σωστά στη ζώνη «' + zoneShortLabels[clickedZone] + '»! ' + q.note + '</span></div>' +
                '<button type="button" class="pexp-root-pop-cta" data-oly-next="1" style="background:#059669;margin:0">Επόμενο (' + (olyRound + 2) + '/5) \u279C</button>',
                "is-win"
              );
              if (modalBody && olyStage && olyStage.getBoundingClientRect().top < modalBody.getBoundingClientRect().top + 8) {
                scrollInsideModal(olyStage);
              }
           } else {
              olyGameActive = false;
              olyWaitingNext = false;
              setOlyAnswerCardVisible(true);
              if (profileSvg) profileSvg.classList.remove("is-game-target");
              if (olyEcoBtn) olyEcoBtn.classList.remove("is-active");
              drawOlyRound(
                '<div class="pexp-oly-win-wrap">' + winThumb + '<span>\uD83C\uDFC6 5 στα 5! Έβαλες όλα τα ζώα και τα φυτά από το κύμα έως τον Μύτικα στο σωστό τους σπίτι!</span></div>' +
                '<button type="button" class="pexp-root-pop-cta" data-oly-replay="1" style="background:#059669;margin:0">\uD83D\uDD04 Παίξε ξανά</button>',
                "is-win"
              );
              requestAnimationFrame(function() {
                if (olyStage) scrollInsideModal(olyStage);
              });
            }
         } else {
            var goUp = (clickedZone < q.zone);
            showOlyHintArrow(clickedZone, goUp);
            var dirHint = goUp
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

   zHits.forEach(function(h, zIdx) {
      h.setAttribute("role", "button");
      h.setAttribute("tabindex", "0");
      if (zoneShortLabels[zIdx]) h.setAttribute("aria-label", zoneShortLabels[zIdx]);
      h.addEventListener("focus", function() {
        if (olympusZones[zIdx] && (!olyGameActive || olyWaitingNext)) {
          scrollElevMapToX(olympusZones[zIdx].cx, true);
        }
      });
      h.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          h.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      });
    });

    on("pexpZonePrev", "click", function() { if (!isOlympusGuessing()) selectZone(curZoneIdx - 1); });
    on("pexpZoneNext", "click", function() { if (!isOlympusGuessing()) selectZone(curZoneIdx + 1); });
    bindSwipe(
      panes.elevation,
      function() { if (!isOlympusGuessing()) selectZone(curZoneIdx + 1); },
      function() { if (!isOlympusGuessing()) selectZone(curZoneIdx - 1); }
    );

var weatherFetching = false;
    function applyLiveTempVal(val) {
      weatherLoaded = true;
      liveBaseTempC = val;
      updateZoneLiveTempPill();
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
    };
    }; /* Τέλος initElevPane */

    /* ================= 3Β. ΟΙ ΕΚΚΛΗΣΙΕΣ ΜΑΣ (4η ΚΑΡΤΕΛΑ) ================= */
    initChurchesPane = function() {
      if (churchesPaneInited) return;
      churchesPaneInited = true;

  var cMainImg = document.getElementById("pexpChurchMainImg");
    if (cMainImg) cMainImg.onerror = handleImgFallback;
    var cBadge = document.getElementById("pexpChurchBadge");
    var cTitle = document.getElementById("pexpChurchTitle");
    var cStory = document.getElementById("pexpChurchStory");
    var cTags = document.getElementById("pexpChurchTags");
   var cFact = document.getElementById("pexpChurchFact");
    var cMapBridgeBtn = null;
    if (cFact && cFact.parentNode && !document.getElementById("pexpChurchMapBridgeBtn")) {
      cMapBridgeBtn = document.createElement("button");
      cMapBridgeBtn.type = "button";
      cMapBridgeBtn.id = "pexpChurchMapBridgeBtn";
      cMapBridgeBtn.className = "pexp-tl-bridge-btn";
      cMapBridgeBtn.textContent = "\uD83D\uDCCD Δες τη διαδρομή από το Σχολείο μας στον Παιδικό Χάρτη \u2193";
      cFact.insertAdjacentElement("afterend", cMapBridgeBtn);
      cMapBridgeBtn.addEventListener("click", function() {
        var hadModalHist = histZoomOpen || histModalOpen;
        lastFocusedEl = null;
        closePeristasiModal(false);
        runAfterBack(hadModalHist, function() {
          focusChurchOnNeighborhoodMap();
        });
      });
    }
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
        cMainImg.removeAttribute("data-tried-full");
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
      if (cMapBridgeBtn) {
        cMapBridgeBtn.style.display = (currentChurchIdx === 0) ? "inline-flex" : "none";
      }
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

    var saveCratesProgress = function() {
        try { localStorage.setItem("pexp_crates_1922", JSON.stringify(openedCrates)); } catch (e) {}
      };

      var drawCratesBox = function() {
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
              (openedCount === memoryCratesData.length
                ? '\u2728 Έχεις ήδη ξεκλειδώσει όλα τα κιβώτια! Πάτησε σε όποιο θέλεις από πάνω για να ξαναδιαβάσεις την ιστορία του.'
                : '\uD83D\uDC46 Πάτησε πάνω σε οποιοδήποτε ξύλινο κιβώτιο για να δεις τι έσωσαν οι πρόσφυγες το 1922!') +
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
          try { localStorage.removeItem("pexp_crates_1922"); } catch (err) {}
          drawCratesBox();
          return;
        }
        var scrollCrateRevealIntoView = function(justCompletedAll) {
          requestAnimationFrame(function() {
            var targetEl = (justCompletedAll && cratesStage.querySelector(".pexp-crates-win")) || cratesStage.querySelector(".pexp-crate-reveal");
            if (!targetEl || !modalBody) return;
            var bRect = modalBody.getBoundingClientRect();
            var tRect = targetEl.getBoundingClientRect();
            if (tRect.bottom > bRect.bottom - 10) {
              var scaleY = (modalBody.clientHeight > 0) ? (bRect.height / modalBody.clientHeight) : 1;
              var nextTop = Math.max(0, modalBody.scrollTop + (tRect.bottom - bRect.bottom) / (scaleY || 1) + 18);
              if (modalBody.scrollTo) modalBody.scrollTo({ top: nextTop, behavior: "smooth" });
              else modalBody.scrollTop = nextTop;
            }
          });
        };
        if (e.target.closest("[data-crate-next]")) {
          for (var k = 0; k < memoryCratesData.length; k++) {
            var cand = (curCrateIdx + 1 + k) % memoryCratesData.length;
            if (!openedCrates[cand]) {
              var prevCnt = countOpenedCrates();
              openedCrates[cand] = true;
              curCrateIdx = cand;
              saveCratesProgress();
              drawCratesBox();
              scrollCrateRevealIntoView(prevCnt < memoryCratesData.length && countOpenedCrates() === memoryCratesData.length);
              break;
            }
          }
          return;
        }
        var cBtn = e.target.closest("[data-crate-idx]");
        if (cBtn) {
          var prevCnt2 = countOpenedCrates();
          var idx = Number(cBtn.getAttribute("data-crate-idx"));
          var wasLocked = !openedCrates[idx];
          openedCrates[idx] = true;
          curCrateIdx = idx;
          if (wasLocked) saveCratesProgress();
          drawCratesBox();
          scrollCrateRevealIntoView(prevCnt2 < memoryCratesData.length && countOpenedCrates() === memoryCratesData.length);
        }
      });
    }

 }; /* Τέλος initChurchesPane */

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
        cx: 548, cy: 178, steps: 0, meters: 0, bikeTime: "0 λεπτά", crossRoad: false, crossPt: null,
        pts: [[548, 178]],
        safety: "\uD83D\uDEB8 Μπροστά από την αυλή μας περνά η οδός Μακεδονίας \u2014 περνάμε πάντα από τη διάβαση!",
        bikeSafety: "\uD83E\uDE96 Κανόνας Ποδηλάτη: Φοράμε πάντα κράνος & κατεβαίνουμε από το ποδήλατο στην πύλη και στη διάβαση!",
        walk: "\uD83D\uDCCD Είμαστε εδώ! Το 12/θέσιο Δημοτικό Σχολείο μας στην οδό Μακεδονίας 13!",
        bike: "\uD83D\uDCCD Είμαστε εδώ! Το 12/θέσιο Δημοτικό μας (Μακεδονίας 13) \u2014 αφετηρία για βόλτα με το ποδήλατο!"
      },
      {
        cx: 426, cy: 66, steps: 480, meters: 310, bikeTime: "~2 λεπτά", crossRoad: false, crossPt: [426, 248],
        pts: [[548, 178], [548, 248], [426, 248], [426, 66]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας \u279C Ολύμπου: Περπατάμε στο πεζοδρόμιο & προσέχουμε στη διασταύρωση!",
        bikeSafety: "\uD83E\uDE96 Μακεδονίας \u279C Ολύμπου: Φοράμε κράνος, κινούμαστε στη δεξιά άκρη & βγάζουμε χέρι πριν στρίψουμε!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Γυμνάσιο (Ολύμπου 2): ~6 λεπτά με τα πόδια!",
        bike: "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Γυμνάσιο (Ολύμπου 2): ~2 λεπτά με ποδήλατο!"
      },
      {
        cx: 612, cy: 68, steps: 320, meters: 210, bikeTime: "~1,5 λεπτό", crossRoad: false, crossPt: [676, 248],
        pts: [[548, 178], [548, 248], [676, 248], [676, 68], [612, 68]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας \u279C Αγ. Γεωργίου: Περπατάμε στο πεζοδρόμιο & ελέγχουμε στη γωνία!",
        bikeSafety: "\uD83E\uDE96 Μακεδονίας \u279C Αγ. Γεωργίου: Κράνος, δεξιά άκρη & κόβουμε ταχύτητα στη διασταύρωση!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C 3/Θ Νηπιαγωγείο (Αγ. Γεωργίου 2): ~4 λεπτά με τα πόδια!",
        bike: "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C 3/Θ Νηπιαγωγείο (Αγ. Γεωργίου 2): ~1,5 λεπτό με ποδήλατο!"
      },
      {
        cx: 352, cy: 104, steps: 400, meters: 260, bikeTime: "~1,5 λεπτό", crossRoad: false, crossPt: [426, 248],
        pts: [[548, 178], [548, 248], [426, 248], [426, 104], [352, 104]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας \u279C Ολύμπου: Κρατάμε το χέρι των μικρότερων παιδιών στο πεζοδρόμιο!",
        bikeSafety: "\uD83E\uDE96 Μακεδονίας \u279C Ολύμπου: Κράνος, δεξιά άκρη & δίνουμε πάντα προτεραιότητα στους πεζούς!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Παιδικός Σταθμός (Ολύμπου 2): ~5 λεπτά με τα πόδια!",
        bike: "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Παιδικός Σταθμός (Ολύμπου 2): ~1,5 λεπτό με ποδήλατο!"
      },
      {
        cx: 88, cy: 110, steps: 2200, meters: 1450, bikeTime: "~6 λεπτά", crossRoad: false, crossPt: [548, 248],
        pts: [[548, 178], [548, 248], [88, 248], [88, 110]],
        safety: "\uD83D\uDEB8 Μεγάλη διαδρομή προς Κατερίνη \u2014 πάμε πάντα με συνοδό στο πεζοδρόμιο ή με αυτοκίνητο!",
        bikeSafety: "\uD83E\uDE96 Προς Κλειστό Τ9 (1,45 χλμ): Πάντα με κράνος, συνοδό ενήλικα, δεξιά άκρη & ανακλαστικά!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Κλειστό Γυμναστήριο Τ9: ~20 λεπτά περπάτημα (ή 3' με \uD83D\uDE97)!",
        bike: "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Κλειστό Γυμναστήριο Τ9: μόλις ~6 λεπτά με ποδήλατο (αντί για 20' πεζοί)!"
      },
      {
        cx: 232, cy: 108, steps: 410, meters: 270, bikeTime: "~1,5 λεπτό", crossRoad: false, crossPt: [232, 248],
        pts: [[548, 178], [548, 248], [232, 248], [232, 108]],
        safety: "\uD83D\uDEB8 Οδός Μακεδονίας: Προχωράμε στο πεζοδρόμιο & ελέγχουμε προσεκτικά στη διασταύρωση!",
        bikeSafety: "\uD83E\uDE96 Οδός Μακεδονίας: Κράνος, ποδηλατούμε σε ευθεία γραμμή δεξιά & ελέγχουμε στη διασταύρωση!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Σύλλογοι: ~5 λεπτά στην οδό Μακεδονίας!",
        bike: "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Σύλλογοι: ~1,5 λεπτό με ποδήλατο στην οδό Μακεδονίας!"
      },
      {
        cx: 865, cy: 96, steps: 430, meters: 280, bikeTime: "~2 λεπτά", crossRoad: true, crossPt: [676, 248],
        pts: [[548, 178], [548, 248], [768, 248], [768, 96], [865, 96]],
        safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΑΓ. ΓΕΩΡΓΙΟΥ: Ελέγχουμε αριστερά-δεξιά στη διασταύρωση (τη μπάλα την κρατάμε στην τσάντα)!",
        bikeSafety: "\uD83D\uDEA6 ΔΙΑΣΤΑΥΡΩΣΗ ΑΓ. ΓΕΩΡΓΙΟΥ: Κράνος, κατεβαίνουμε στη διάβαση & έχουμε τη μπάλα στο σακίδιο!",
        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Γήπεδο Α.Ε. Περίστασης: ~5 λεπτά με τα πόδια!",
        bike: "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Γήπεδο Α.Ε. Περίστασης: ~2 λεπτά με ποδήλατο!"
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
    var pfacTravelMode = "walk";
    var curGrowStageIdx = -1;
    var refreshActiveMapRoute = function() {};
    var lastMapMsg = "\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 13) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!";
    var lastMapAction = "";
    var lastMapThumb = "";
    var lastMapThumbCap = "";
    var lastWalkMeta = null;
    var lastMapExtraHtml = "";
    var growActiveFacIdx = -1;

    function syncWalkerTokenMode() {
      var isBike = (pfacTravelMode === "bike");
      if (mapWalkerEl) {
        var cEl = mapWalkerEl.querySelector("circle");
        if (cEl) cEl.setAttribute("stroke", isBike ? "#0284c7" : "#1e6cff");
      }
      if (mapWalkerFlipEl) {
        var tEl = mapWalkerFlipEl.querySelector("text");
        if (tEl) tEl.textContent = isBike ? "\uD83D\uDEB2" : "\uD83D\uDEB6";
      }
      if (mapWalkPath) {
        mapWalkPath.setAttribute("stroke", isBike ? "#0284c7" : "#f59e0b");
      }
    }

    function setPfacTravelMode(nextMode) {
      if (nextMode !== "walk" && nextMode !== "bike") return;
      if (pfacTravelMode === nextMode) return;
      pfacTravelMode = nextMode;
      syncWalkerTokenMode();
      if (activeFacIdx > 0) {
        var showBtn = document.getElementById("pfacShowOnMapBtn");
        var sm = facMapMeta[activeFacIdx];
        if (showBtn && sm) {
          showBtn.textContent = (pfacTravelMode === "bike")
            ? ("\uD83D\uDEB2 Δες τη διαδρομή" + (sm.bikeTime ? " (" + sm.bikeTime + " με ποδήλατο)" : "") + " στον Χάρτη \u2191")
            : ("\uD83D\uDCCD Δες τη διαδρομή" + (sm.steps ? " (~" + sm.steps + " βήματα)" : "") + " στον Χάρτη \u2191");
        }
      }
      refreshActiveMapRoute();
    }

    var lastMapTargetX = 548;
    var lastMapTargetY = 178;
    var mapScrollUserAbort = false;

    function getZoomedMapScrollLeft(mSc, svgX) {
      var sw = mSc.scrollWidth;
      var cw = mSc.clientWidth;
      if (sw <= cw + 4) return 0;
      var px = ((typeof svgX === "number" ? svgX : 548) / 960) * sw;
      return Math.max(0, Math.min(sw - cw, Math.round(px - cw / 2)));
    }

    function getZoomedMapScrollTop(mSc, svgY) {
      var sh = mSc.scrollHeight;
      var ch = mSc.clientHeight;
      if (sh <= ch + 4) return 0;
      var py = ((typeof svgY === "number" ? svgY : 178) / 410) * sh;
      return Math.max(0, Math.min(sh - ch, Math.round(py - ch / 2)));
    }

   var wasPfacMobScroll = false;
    var pfacStreetZoom = true;
    var pfacZoomOpenedAt = 0;
    function isPfacMobileViewport() {
      return window.innerWidth <= 720 || (window.innerWidth <= 960 && window.innerHeight <= 520);
    }
    function isPfacMobileScrollZoom() {
      return isMapZoomed && pfacStreetZoom && isPfacMobileViewport();
    }

    function scrollZoomedMapToX(svgX, smooth, svgY) {
      if (!isMapZoomed) return;
      wasPfacMobScroll = isPfacMobileScrollZoom();
      var mSc = document.getElementById("pfacMapScroll");
      if (!mSc) return;
      var canX = mSc.scrollWidth > mSc.clientWidth + 4;
      var canY = mSc.scrollHeight > mSc.clientHeight + 4;
      if (!canX && !canY) return;
      var targetLeft = canX ? getZoomedMapScrollLeft(mSc, svgX) : 0;
      var targetTop = canY ? getZoomedMapScrollTop(mSc, typeof svgY === "number" ? svgY : lastMapTargetY) : 0;
      if (smooth && typeof mSc.scrollTo === "function") {
        try {
          mSc.scrollTo({ left: targetLeft, top: targetTop, behavior: "smooth" });
          return;
        } catch (e) {}
      }
      if (canX) mSc.scrollLeft = targetLeft;
      if (canY) mSc.scrollTop = targetTop;
    }

    function stopNeighborhoodWalkAnim() {
      if (walkAnimRaf) {
        cancelAnimationFrame(walkAnimRaf);
        walkAnimRaf = null;
      }
    }

    function setMapStatusHtml(msg, actionType, thumbUrl, thumbCap, walkMeta, extraBarHtml) {
      lastMapMsg = msg;
      lastMapAction = actionType || "";
      lastMapThumb = thumbUrl || "";
      lastMapThumbCap = thumbCap || "";
      lastWalkMeta = walkMeta || null;
      lastMapExtraHtml = extraBarHtml || "";
      if (!mapStatusEl) return;
      var isBike = (pfacTravelMode === "bike");
     var extraBtn = "";
      if (lastMapAction === "card") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-card="1">' + (isMapZoomed ? "\uD83D\uDCD6 Δες την Κάρτα \u279C" : "\uD83D\uDCD6 Δες την Κάρτα \u2193") + '</button>';
      } else if (lastMapAction === "churches") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-churches="1">\u26EA Άνοιξε τις Εκκλησίες \u279C</button>';
      } else if (lastMapAction === "train") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-train="1">\uD83D\uDCF7 Δες 3 Φωτογραφίες (1920s) \u279C</button>';
      }

      var modeSwitchHtml =
        '<div class="pfac-mode-switch" role="group" aria-label="Επιλογή μετακίνησης">' +
          '<button type="button" class="pfac-mode-btn' + (!isBike ? ' is-active' : '') + '" data-pfac-tmode="walk">\uD83D\uDEB6 Πόδια</button>' +
          '<button type="button" class="pfac-mode-btn' + (isBike ? ' is-active' : '') + '" data-pfac-tmode="bike">\uD83D\uDEB2 Ποδήλατο</button>' +
        '</div>';

      var thumbHtml = lastMapThumb
        ? '<img class="pfac-map-thumb" src="' + optImg(lastMapThumb, 320) + '" alt="' + escAttr(lastMapThumbCap) + '" data-map-thumb-zoom="1" title="Πάτησε για μεγέθυνση!"/>'
        : '';

      var metaHtml = "";
      if (lastWalkMeta) {
        var stTxt = "";
        var stCls = "pfac-step-pill";
        var safetyTxt = lastWalkMeta.safety || "";
        var sfCls = "pfac-safety-pill";
        if (isBike) {
          stCls += " pfac-step-pill--bike";
          stTxt = (lastWalkMeta.meters && lastWalkMeta.meters > 0)
            ? ("\uD83D\uDEB2 " + (lastWalkMeta.bikeTime || "") + " με ποδήλατο (~" + lastWalkMeta.meters + " μ.)")
            : "\uD83D\uDEB2 Αφετηρία: Αυλή Σχολείου (φοράμε κράνος \uD83E\uDE96)";
          safetyTxt = lastWalkMeta.bikeSafety || (lastWalkMeta.steps === 0 && facMapMeta[0] ? facMapMeta[0].bikeSafety : safetyTxt);
          sfCls += lastWalkMeta.crossRoad ? " pfac-safety-pill--cross" : " pfac-safety-pill--bike";
        } else {
          stTxt = lastWalkMeta.steps > 0
            ? ("\uD83D\uDC63 ~" + lastWalkMeta.steps + " παιδικά βήματα")
            : "\uD83C\uDFEB Αφετηρία: Αυλή Σχολείου (0 βήματα)";
          if (lastWalkMeta.crossRoad) sfCls += " pfac-safety-pill--cross";
        }
        metaHtml =
          '<div class="pfac-walk-meta">' +
            '<span class="' + stCls + '" id="pfacLiveStepBadge">' + stTxt + '</span>' +
            (safetyTxt ? '<span class="' + sfCls + '">' + safetyTxt + '</span>' : '') +
          '</div>';
      }

      mapStatusEl.innerHTML =
        '<div class="pfac-map-status-left">' +
          thumbHtml +
          '<div class="pfac-map-status-body"><div>' + msg + '</div>' + metaHtml + lastMapExtraHtml + '</div>' +
        '</div>' +
        '<div class="pfac-map-status-right">' + modeSwitchHtml + extraBtn + '</div>';

      var thEl = mapStatusEl.querySelector("img");
      if (thEl) {
        thEl.onerror = function() { if (this.src !== fallbackSvg) this.src = fallbackSvg; };
      }
    }

    function runNeighborhoodWalk(cfg) {
      stopNeighborhoodWalkAnim();
      syncWalkerTokenMode();
     mapScrollUserAbort = false;
      if (typeof cfg.cx === "number") lastMapTargetX = cfg.cx;
      if (typeof cfg.cy === "number") lastMapTargetY = cfg.cy;
      var isBike = (pfacTravelMode === "bike");
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
          if (mapCrossIconEl) mapCrossIconEl.textContent = cfg.crossRoad ? "\uD83D\uDEA6" : (isBike ? "\uD83E\uDE96" : "\uD83D\uDEB8");
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
          var wPt = cfg.walkerPt || [592, 184];
          mapWalkerEl.style.display = "";
          mapWalkerEl.setAttribute("transform", "translate(" + wPt[0] + "," + wPt[1] + ")");
          if (mapWalkerFlipEl) mapWalkerFlipEl.setAttribute("transform", "scale(1,1)");
        }
        scrollZoomedMapToX(lastMapTargetX, true);
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
      var baseDur = cfg.dur || Math.min(1300, Math.max(680, totalLen * 2.0));
      var dur = isBike ? Math.max(420, Math.round(baseDur * 0.62)) : baseDur;
      var stepBadgeEl = document.getElementById("pfacLiveStepBadge");
      var targetSteps = cfg.steps || 0;
      var targetMeters = cfg.meters || 0;
      var targetBikeTime = cfg.bikeTime || "";
     var mSc = null;
      var panInitDone = false;
      var panInitDelta = 0;
      var panInitDeltaY = 0;
      var panStartP = 0;
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

        var wp = pointAt(Math.min(ease * totalLen, walkerStopDist));
        if (mapWalkerEl) {
          var bob = (p < 1) ? Math.sin(p * Math.PI * (isBike ? 6 : 10)) * (isBike ? 1.0 : 2.2) : 0;
          mapWalkerEl.setAttribute("transform", "translate(" + wp.x.toFixed(1) + "," + (wp.y + bob).toFixed(1) + ")");
          if (mapWalkerFlipEl && Math.abs(wp.dx) > 1) {
            mapWalkerFlipEl.setAttribute("transform", wp.dx > 0 ? "scale(-1,1)" : "scale(1,1)");
          }
        }

       if (isMapZoomed && !mapScrollUserAbort) {
          if (!mSc) mSc = document.getElementById("pfacMapScroll");
          if (mSc) {
            var canPanX = mSc.scrollWidth > mSc.clientWidth + 4;
            var canPanY = mSc.scrollHeight > mSc.clientHeight + 4;
            if (canPanX || canPanY) {
              var focusX = wp.x + ease * (lastMapTargetX - wp.x);
              var focusY = wp.y + ease * (lastMapTargetY - wp.y);
              var idealLeft = canPanX ? getZoomedMapScrollLeft(mSc, focusX) : 0;
              var idealTop = canPanY ? getZoomedMapScrollTop(mSc, focusY) : 0;
              if (!panInitDone) {
                panInitDone = true;
                panStartP = p;
                panInitDelta = mSc.scrollLeft - idealLeft;
                panInitDeltaY = mSc.scrollTop - idealTop;
              }
              var remSpan = Math.max(0.05, Math.min(0.4, 1 - panStartP));
              var catchUp = (p >= 1) ? 0 : Math.max(0, 1 - (p - panStartP) / remSpan);
              if (canPanX) mSc.scrollLeft = Math.round(idealLeft + panInitDelta * catchUp * catchUp);
              if (canPanY) mSc.scrollTop = Math.round(idealTop + panInitDeltaY * catchUp * catchUp);
            }
          }
        }

        if (!stepBadgeEl || !stepBadgeEl.isConnected) {
          stepBadgeEl = document.getElementById("pfacLiveStepBadge");
        }
        if (stepBadgeEl) {
          if (isBike && targetMeters > 0) {
            var curM = (p >= 1) ? targetMeters : Math.max(10, Math.round((ease * targetMeters) / 10) * 10);
            stepBadgeEl.textContent = (p >= 1)
              ? ("\uD83D\uDEB2 " + targetBikeTime + " με ποδήλατο (~" + curM + " μ.)")
              : ("\uD83D\uDEB2 ~" + curM + " μ. με ποδήλατο...");
          } else if (!isBike && targetSteps > 0) {
            var curSt = (p >= 1) ? targetSteps : Math.max(5, Math.round((ease * targetSteps) / 5) * 5);
            stepBadgeEl.textContent = "\uD83D\uDC63 ~" + curSt + " παιδικά βήματα";
          }
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
      pfacZoomOpenedAt = performance.now();
      pauseHeroVideo();
      if (document.activeElement && document.activeElement !== document.body) {
        lastMapFocusEl = document.activeElement;
      }
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
      if (mapZoomBtn) {
        mapZoomBtn.textContent = "\u2715 Κλείσιμο Μεγέθυνσης";
        requestAnimationFrame(function() {
          scrollZoomedMapToX(lastMapTargetX, false);
          try { mapZoomBtn.focus({ preventScroll: true }); } catch (err) { mapZoomBtn.focus(); }
        });
      }
     var gotoBtnZ = mapStatusEl ? mapStatusEl.querySelector("[data-map-goto-card]") : null;
      if (gotoBtnZ) gotoBtnZ.textContent = "\uD83D\uDCD6 Δες την Κάρτα \u279C";

      if (!histMapOpen) {
        histMapOpen = true;
        if (ignorePopCount === 0) {
          try {
            window.history.pushState({ pfacMapZoom: true }, "", window.location.href);
          } catch (e) {}
        }
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
    var mScOut = document.getElementById("pfacMapScroll");
      if (mScOut) { mScOut.scrollLeft = 0; mScOut.scrollTop = 0; }
      unlockBodyScroll();
    if (mapZoomBtn) mapZoomBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";
      var gotoBtnU = mapStatusEl ? mapStatusEl.querySelector("[data-map-goto-card]") : null;
      if (gotoBtnU) gotoBtnU.textContent = "\uD83D\uDCD6 Δες την Κάρτα \u2193";

      if (lastMapFocusEl && !modal.classList.contains("is-open") && !isRegMapZoomed && !(zoomOverlay && zoomOverlay.classList.contains("is-open")) && document.contains(lastMapFocusEl)) {
        var mf = lastMapFocusEl;
        lastMapFocusEl = null;
        requestAnimationFrame(function() {
          try { mf.focus({ preventScroll: true }); } catch (err) { mf.focus(); }
        });
      }

      var needMapBack = (!fromPopState && histMapOpen);
      histMapOpen = false;
      if (needMapBack) safeHistoryBack(1);
    }

   var decauvillePhotos = [
      { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEidJS0ohrHAx1j7G8I8h1U1zRHLAO1S4KjLQ2wJCeuB61XVVt2-afo1UERCZ3_Tk4eNjKKRwnmq-lIj8yQIvh_ApM9nEZMvRGt7BVq3kBEAcYdj9nJWcPrIUVJBGgiEgXwx4JWCXPUv3jI/s1600/1.jpg", thumb: "", caption: "1918\u20131930s: Το τρενάκι «Ντεκοβίλ» των λιγνιτωρυχείων που περνούσε λοξά μέσα από την Περίσταση (οδός Δημοσθένους) προς τη θάλασσα" },
      { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgwuwafbjYk60WYXUQRyrAzRqWGEDIt5S10qdwoPEizAWwCpOsJK7eocoHyL8NJ-PFaJ2mVGh7dW1P517aSgA8e_Jc0-KpYzpFSeql_aUk03kzg-9rntvdZ73n49dlupfEZabfQ0Akf6Sw/s1600/2+dranista-railway.+2.jpg", thumb: "", caption: "1920s: Συρμός της στενής γραμμής Ντεκοβίλ (Μοσχοπόταμος \u2192 Σταθμός \u2192 Περίσταση \u2192 Παραλία)" },
      { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiPARZuDIrYzkT55r-GoeOJGFod76ksWV3N_2ZFaF1RM22Y6glcihpXXbvg-83sRXjQrWkKTdwOQp7WsIct8lzZC0VZdUZiTMeZ4ZdM6JFmMZElKveT-IT5_zZYraNQfQb_EyqCTsdoHIY/s1600/3+________+______+____________________+____________+______+________________+________+______________+______+__________________.jpg", thumb: "", caption: "1920s\u20131930s: Η παλιά ξύλινη προβλήτα στην Παραλία Κατερίνης όπου κατέληγε το τρενάκι" }
    ];

    var validFacExpKeys = ["fac0", "fac1", "fac2", "fac3", "fac4", "fac5", "fac6", "church", "square", "train"];
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
     var totalPts = validFacExpKeys.length;
      if (badgeEl) {
        badgeEl.textContent = (cnt === totalPts ? "\uD83C\uDFC6 " : "\uD83D\uDDFA\uFE0F ") + "Εξερεύνησες " + cnt + "/" + totalPts + " σημεία" + (cnt === totalPts ? "!" : "");
        badgeEl.classList.toggle("is-done", cnt === totalPts);
      }
      if (rstEl) rstEl.style.display = cnt > 0 ? "inline-block" : "none";
      if (winEl) {
        if (cnt < totalPts) winEl.classList.remove("is-vis");
        else if (justCompletedAll) winEl.classList.add("is-vis");
      }
      if (mapWrap) {
        mapWrap.querySelectorAll(".pfac-map-node").forEach(function(nd) {
          var key = nd.hasAttribute("data-map-church") ? "church"
            : (nd.hasAttribute("data-map-square") ? "square"
            : (nd.hasAttribute("data-map-train") ? "train" : ("fac" + nd.getAttribute("data-map-fac"))));
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

   var justUnlockedAll9Fac = false;
    function markFacExplored(key) {
      justUnlockedAll9Fac = false;
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
      justUnlockedAll9Fac = !!(wasNew && allDone);
      syncFacExploredBadge(justUnlockedAll9Fac);
    }

   var jumpToMacroMap = function() {};

    function upgradeNeighborhoodMap() {
      if (!pfacListEl || !pfacListEl.parentNode || document.getElementById("pfacMapSvg")) return;
      mapWrap = document.createElement("div");
      mapWrap.className = "pfac-map-wrap";
      mapWrap.innerHTML =
        '<div class="pfac-map-head">' +
          '<div class="pfac-map-title-group">' +
            '<strong>\uD83D\uDDFA\uFE0F Παιδικός Χάρτης της Γειτονιάς μας</strong>' +
            '<span class="pfac-exp-wrap">' +
              '<span class="pfac-exp-badge" id="pfacExpBadge">\uD83D\uDDFA\uFE0F Εξερεύνησες 0/10 σημεία</span>' +
              '<button type="button" class="pfac-exp-reset" id="pfacExpReset" style="display:none" title="Μηδενισμός εξερεύνησης">\u21BA</button>' +
            '</span>' +
          '</div>' +
        '<div class="pfac-map-head-right">' +
            '<span style="font-size:12.5px;color:#166534">\uD83D\uDC46 Πάτησε σε κτίριο για διαδρομή &amp; βήματα ή στον χάρτη για μεγέθυνση!</span>' +
            '<button type="button" class="pfac-map-zoom-btn pfac-map-grow-btn" id="pfacGrowJourneyBtn">\uD83C\uDF92 Διαδρομή 2\u201315 ετών!</button>' +
            '<button type="button" class="pfac-map-zoom-btn pfac-map-macro-btn" id="pfacToMacroBtn">\uD83D\uDDFA\uFE0F Χάρτης Νομού \u2191</button>' +
            '<button type="button" class="pfac-map-zoom-btn" id="pfacMapZoomBtn">\uD83D\uDD0D Μεγέθυνση Χάρτη</button>' +
          '</div>' +
        '</div>' +
     '<div class="pfac-exp-win" id="pfacExpWinBanner">' +
       '<span>\uD83C\uDFC6 Μπράβο! Εξερεύνησες και τα 10 σημεία της γειτονιάς μας \u2014 είσαι Επίσημος Ξεναγός της Περίστασης!</span>' +
          '<button type="button" class="pfac-exp-win-close" data-exp-win-close="1" title="Κλείσιμο">\u2715</button>' +
        '</div>' +
        '<div class="pfac-map-frame">' +
        '<div class="pfac-map-scroll is-mobile-zoom" id="pfacMapScroll">' +
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
         '<path d="M 32,304 L 402,368" fill="none" stroke="#78350f" stroke-width="6" stroke-dasharray="3,6" opacity="0.42"/>' +
          '<path d="M 32,304 L 402,368" fill="none" stroke="#92400e" stroke-width="1.8" opacity="0.55"/>' +
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
          '<g class="pfac-map-node" data-map-train="1" role="button" tabindex="0">' +
            '<circle cx="220" cy="336" r="22" fill="#92400e" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="220" y="343" text-anchor="middle" font-size="18">\uD83D\uDE82</text>' +
            '<text class="pfac-map-lbl" x="220" y="378" text-anchor="middle" fill="#78350f" font-size="12.5" font-weight="900">Παλιό Τρενάκι (1920s)</text>' +
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
        '</div>' +
        '<button type="button" class="pfac-street-zoom-pill is-active" id="pfacStreetZoomBtn">\uD83D\uDDFA\uFE0F Όλη η Γειτονιά</button>' +
        '</div>' +
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

      var growJourneyBtn = document.getElementById("pfacGrowJourneyBtn");
      var growTourTimer = null;
      var isGrowTourRunning = false;

      stopGrowTour = function() {
        if (growTourTimer) {
          clearTimeout(growTourTimer);
          growTourTimer = null;
        }
        isGrowTourRunning = false;
        if (growJourneyBtn) {
          growJourneyBtn.classList.remove("is-playing");
          growJourneyBtn.textContent = "\uD83C\uDF92 Διαδρομή 2\u201315 ετών!";
        }
      };

      var growStages = [
        {
          delay: 0, facKey: "fac3", facIdx: 3,
          msg: "\uD83D\uDC76 <strong>Στάση 1/4 (2\u20134 ετών) \u2022 Παιδικός Σταθμός:</strong> Το ταξίδι μας ξεκινά στην οδό Ολύμπου 2 με παιχνίδι, τραγούδια και τους πρώτους φίλους!",
          bikeMsg: "\uD83D\uDC76 <strong>Στάση 1/4 (2\u20134 ετών) \u2022 Παιδικός Σταθμός:</strong> Το ταξίδι μας ξεκινά στην οδό Ολύμπου 2 (αργότερα με βοηθητικές ρόδες & κράνος)!",
          meta: { steps: 0, meters: 0, bikeTime: "0 λεπτά", crossRoad: false, safety: "\uD83C\uDF92 Μεγαλώνουμε στην ίδια γειτονιά (Σχολείο 1 από 4)", bikeSafety: "\uD83E\uDE96 Μεγαλώνουμε στην ίδια γειτονιά \u2014 πάντα με κράνος! (Σχολείο 1 από 4)" },
          walkCfg: { cx: 352, cy: 104, color: "#0284c7", steps: 0, meters: 0, bikeTime: "0 λεπτά", crossRoad: false, crossPt: null, pts: [[352, 104]], walkerPt: [380, 114] }
        },
        {
          delay: 3600, facKey: "fac2", facIdx: 2,
          msg: "\uD83E\uDDF8 <strong>Στάση 2/4 (4\u20136 ετών) \u2022 3/Θ Νηπιαγωγείο:</strong> Περπατάμε έως την οδό Αγ. Γεωργίου 2 για τις πρώτες μας ζωγραφιές!",
          bikeMsg: "\uD83E\uDDF8 <strong>Στάση 2/4 (4\u20136 ετών) \u2022 3/Θ Νηπιαγωγείο:</strong> Σε ~2 λεπτά με ποδήλατο φτάνουμε στην οδό Αγ. Γεωργίου 2!",
          meta: { steps: 460, meters: 300, bikeTime: "~2 λεπτά", crossRoad: true, safety: "\uD83D\uDEA6 Περνάμε προσεκτικά τη διάβαση στην Αγ. Γεωργίου! (Σχολείο 2 από 4)", bikeSafety: "\uD83D\uDEA6 Φοράμε κράνος & κατεβαίνουμε στη διάβαση Αγ. Γεωργίου! (Σχολείο 2 από 4)" },
          walkCfg: { dur: 2400, cx: 612, cy: 68, color: "#db2777", steps: 460, meters: 300, bikeTime: "~2 λεπτά", crossRoad: true, crossPt: [676, 248], pts: [[352, 104], [426, 104], [426, 248], [676, 248], [676, 68], [612, 68]] }
        },
        {
          delay: 5000, facKey: "fac0", facIdx: 0,
          msg: "\uD83C\uDFEB <strong>Στάση 3/4 (6\u201312 ετών) \u2022 12/Θ Δημοτικό μας:</strong> Έξι αξέχαστα χρόνια στην οδό Μακεδονίας 13 με γράμματα, ρομποτική, σκάκι και παιχνίδι!",
          bikeMsg: "\uD83C\uDFEB <strong>Στάση 3/4 (6\u201312 ετών) \u2022 12/Θ Δημοτικό μας:</strong> ~1,5 λεπτό με ποδήλατο έως την αυλή μας στην οδό Μακεδονίας 13!",
          meta: { steps: 320, meters: 210, bikeTime: "~1,5 λεπτό", crossRoad: false, safety: "\uD83C\uDF1F Η καρδιά των σχολικών μας χρόνων! (Σχολείο 3 από 4)", bikeSafety: "\uD83E\uDE96 Κράνος, δεξιά άκρη & κατεβαίνουμε στην πύλη του σχολείου! (Σχολείο 3 από 4)" },
          walkCfg: { dur: 2100, cx: 548, cy: 178, color: "#1e6cff", steps: 320, meters: 210, bikeTime: "~1,5 λεπτό", crossRoad: false, crossPt: [548, 248], pts: [[612, 68], [676, 68], [676, 248], [548, 248], [548, 178]] }
        },
        {
          delay: 4800, facKey: "fac1", facIdx: 1,
          msg: "\uD83C\uDF93 <strong>Στάση 4/4 (12\u201315 ετών) \u2022 Γυμνάσιο Περίστασης:</strong> Από τα 2 έως τα 15 μας χρόνια μεγαλώνουμε με ασφάλεια στην ίδια αγαπημένη γειτονιά!",
          bikeMsg: "\uD83C\uDF93 <strong>Στάση 4/4 (12\u201315 ετών) \u2022 Γυμνάσιο Περίστασης:</strong> Σε ~2 λεπτά με ποδήλατο φτάνουμε στο Γυμνάσιο (Ολύμπου 2)!",
          meta: { steps: 480, meters: 310, bikeTime: "~2 λεπτά", crossRoad: false, safety: "\uD83C\uDFC6 Και οι 4 βαθμίδες λίγα λεπτά με τα πόδια! (Σχολείο 4 από 4)", bikeSafety: "\uD83E\uDE96 Κράνος, δεξιά άκρη & προσοχή στις διασταυρώσεις! (Σχολείο 4 από 4)" },
          walkCfg: { dur: 2200, cx: 426, cy: 66, color: "#4f46e5", steps: 480, meters: 310, bikeTime: "~2 λεπτά", crossRoad: false, crossPt: [426, 248], pts: [[548, 178], [548, 248], [426, 248], [426, 66]] }
        }
      ];

      var growStepLabels = [
        "1. \uD83D\uDC76 Παιδικός",
        "2. \uD83E\uDDF8 Νηπιαγωγείο",
        "3. \uD83C\uDFEB Δημοτικό",
        "4. \uD83C\uDF93 Γυμνάσιο"
      ];

      function buildGrowStepsBar(activeSIdx) {
        return '<div class="pfac-grow-steps">' + growStepLabels.map(function(lbl, i) {
          return '<button type="button" class="pfac-grow-step' + (i === activeSIdx ? ' is-active' : '') + '" data-grow-step="' + i + '">' + lbl + '</button>';
        }).join("") + '</div>';
      }

      function showGrowStage(sIdx, isManual) {
        var st = growStages[sIdx];
        if (!st) return;
        curGrowStageIdx = sIdx;
        activeFacIdx = -1;
        activeSpecialNode = "";
        growActiveFacIdx = st.facIdx;
        if (pfacStage) pfacStage.innerHTML = "";
        pfacPills.forEach(function(li) { li.classList.remove("is-active"); });
        var fIt = facilitiesData[st.facIdx];
        markFacExplored(st.facKey);
        var stageMsg = (pfacTravelMode === "bike" && st.bikeMsg) ? st.bikeMsg : st.msg;
        setMapStatusHtml(stageMsg, "card", fIt ? fIt.img : "", fIt ? fIt.title : "", st.meta, buildGrowStepsBar(sIdx));
        var wCfg = st.walkCfg;
        if (isManual && wCfg.dur) {
          wCfg = {
            dur: 1200, cx: wCfg.cx, cy: wCfg.cy, color: wCfg.color,
            steps: wCfg.steps, meters: wCfg.meters, bikeTime: wCfg.bikeTime,
            crossRoad: wCfg.crossRoad, crossPt: wCfg.crossPt, pts: wCfg.pts
          };
        }
        runNeighborhoodWalk(wCfg);
      }

      function startGrowTour() {
        stopGrowTour();
        if (mapReplayTimer) { clearTimeout(mapReplayTimer); mapReplayTimer = null; }
        isGrowTourRunning = true;
        if (growJourneyBtn) {
          growJourneyBtn.classList.add("is-playing");
          growJourneyBtn.textContent = "\u23F9\uFE0F Σταμάτα (2\u201315 ετών)";
        }

        var runStage = function(sIdx) {
          if (!isGrowTourRunning || sIdx >= growStages.length) return;
          var st = growStages[sIdx];
          showGrowStage(sIdx, false);
          if (sIdx < growStages.length - 1) {
            growTourTimer = setTimeout(function() { runStage(sIdx + 1); }, growStages[sIdx + 1].delay);
          } else {
            var finishWait = (st.walkCfg.dur || 2200) + 2600;
            growTourTimer = setTimeout(function() {
              if (!isGrowTourRunning) return;
              stopNeighborhoodWalkAnim();
              if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
             if (mapWalkPath) {
                mapWalkPath.setAttribute("d", "M 352,104 L 426,104 L 426,66 M 426,104 L 426,248 L 676,248 L 676,68 L 612,68 M 548,248 L 548,178");
              }
             lastMapTargetX = 482;
              lastMapTargetY = 158;
              scrollZoomedMapToX(482, true, 158);
              stopGrowTour();
              if (growJourneyBtn) growJourneyBtn.textContent = "\uD83D\uDD04 Ξαναδές 2\u201315 ετών!";
            }, finishWait);
          }
        };

        runStage(0);
      }

      if (growJourneyBtn) {
        growJourneyBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (isGrowTourRunning) {
            stopGrowTour();
            syncNeighborhoodMap(-1);
          } else {
            startGrowTour();
          }
        });
      }

      if (mapZoomBtn) {
        mapZoomBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (isMapZoomed) closeMapZoom(false);
          else openMapZoom();
        });
      }

      function showSpecialMapNode(kind) {
        curGrowStageIdx = -1;
        growActiveFacIdx = -1;
        activeSpecialNode = kind;
        var isBike = (pfacTravelMode === "bike");
        if (kind === "church") {
          var chMsg = isBike
            ? "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Ι.Ν. Αγίου Γεωργίου & Μοδέστου: ~1 λεπτό με ποδήλατο! (Ξαναπάτησε για τις Εκκλησίες)"
            : "\u26EA Διαδρομή από το Δημοτικό \u279C Ι.Ν. Αγίου Γεωργίου & Μοδέστου: απέναντι από την αυλή μας! (Ξαναπάτησε για τις Εκκλησίες)";
          var chImg = churchesData[0] ? churchesData[0].img : "";
          var chCap = churchesData[0] ? churchesData[0].caption : "";
          var chMeta = {
            steps: 150, meters: 95, bikeTime: "~1 λεπτό",
            crossRoad: true,
            safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Σταματάμε, κοιτάμε αριστερά-δεξιά-αριστερά & περνάμε απέναντι!",
            bikeSafety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Φοράμε κράνος, κατεβαίνουμε από το ποδήλατο & περνάμε τη διάβαση πεζοί!"
          };
          setMapStatusHtml(chMsg, "churches", chImg, chCap, chMeta);
          runNeighborhoodWalk({
            cx: 526, cy: 336, color: "#4f46e5", steps: 150, meters: 95, bikeTime: "~1 λεπτό",
            crossRoad: true, crossPt: [537, 248],
            pts: [[548, 178], [548, 248], [526, 248], [526, 336]]
          });
       } else if (kind === "square") {
          var sqMsg = isBike
            ? "\uD83D\uDEB2 Διαδρομή από το Δημοτικό \u279C Πλατεία Χωριού: ~1 λεπτό με ποδήλατο για βόλτα στην πλατεία!"
            : "\uD83C\uDF33 Διαδρομή από το Δημοτικό \u279C Πλατεία Χωριού: ~2 λεπτά με τα πόδια για βόλτα και παιχνίδι!";
          var sqMeta = {
            steps: 210, meters: 135, bikeTime: "~1 λεπτό",
            crossRoad: true,
            safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Ελέγχουμε προσεκτικά και τις δύο κατευθύνσεις στη διάβαση!",
            bikeSafety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΠΡΟΣ ΠΛΑΤΕΙΑ: Κράνος, κατεβαίνουμε στη διάβαση & προσέχουμε τους πεζούς στην πλατεία!"
          };
          setMapStatusHtml(sqMsg, "", "", "", sqMeta);
          runNeighborhoodWalk({
            cx: 724, cy: 336, color: "#16a34a", steps: 210, meters: 135, bikeTime: "~1 λεπτό",
            crossRoad: true, crossPt: [724, 248],
            pts: [[548, 178], [548, 248], [724, 248], [724, 336]]
          });
        } else if (kind === "train") {
          var trMsg = "\uD83D\uDE82 <strong>Ίχνη Ιστορίας (1918\u20131930s) \u2022 Τρενάκι «Ντεκοβίλ»:</strong> Από εδώ (οδός Δημοσθένους) περνούσε λοξά το παλιό τρενάκι του λιγνίτη για την προβλήτα της Παραλίας!";
          var trMeta = {
            steps: 490, meters: 320, bikeTime: "~2 λεπτά",
            crossRoad: true,
            safety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Περνάμε προσεκτικά απέναντι προς την οδό Δημοσθένους!",
            bikeSafety: "\uD83D\uDEA6 ΔΙΑΒΑΣΗ ΟΔΟΥ ΜΑΚΕΔΟΝΙΑΣ: Κράνος & κατεβαίνουμε από το ποδήλατο στη διάβαση!"
          };
          setMapStatusHtml(trMsg, "train", decauvillePhotos[0].src, decauvillePhotos[0].caption, trMeta);
          runNeighborhoodWalk({
            cx: 220, cy: 336, color: "#92400e", steps: 490, meters: 320, bikeTime: "~2 λεπτά",
            crossRoad: true, crossPt: [232, 248],
            pts: [[548, 178], [548, 248], [232, 248], [220, 336]]
          });
        }
      }

     refreshActiveMapRoute = function() {
        if (curGrowStageIdx !== -1) {
          showGrowStage(curGrowStageIdx, !isGrowTourRunning);
        } else if (activeSpecialNode) {
          showSpecialMapNode(activeSpecialNode);
        } else if (activeFacIdx === -1 && growActiveFacIdx !== -1) {
          var savedBridgeIdx = growActiveFacIdx;
          syncNeighborhoodMap(savedBridgeIdx, true);
          growActiveFacIdx = savedBridgeIdx;
        } else {
          syncNeighborhoodMap(activeFacIdx, true);
        }
      };

    stepNeighborhoodNodeFn = function(dir) {
        var order = ["fac0", "fac1", "fac2", "fac3", "fac4", "fac5", "fac6", "church", "square", "train"];
        var curKey = activeSpecialNode
          ? activeSpecialNode
          : ("fac" + (activeFacIdx !== -1 ? activeFacIdx : (growActiveFacIdx !== -1 ? growActiveFacIdx : 0)));
        var pos = order.indexOf(curKey);
        if (pos === -1) pos = 0;
        var nextKey = order[(pos + dir + order.length) % order.length];
       if (nextKey === "church" || nextKey === "square" || nextKey === "train") {
          markFacExplored(nextKey);
          closeFacilityCard(true);
          showSpecialMapNode(nextKey);
        } else {
          openFacilityCard(Number(nextKey.slice(3)), false);
        }
      };

      focusChurchOnNeighborhoodMap = function() {
        stopGrowTour();
        markFacExplored("church");
        closeFacilityCard(true);
        showSpecialMapNode("church");
        if (mapWrap) {
          mapWrap.scrollIntoView({ behavior: "smooth", block: "center" });
          mapWrap.classList.add("is-bridge-glow");
          setTimeout(function() { if (mapWrap) mapWrap.classList.remove("is-bridge-glow"); }, 2000);
        }
      };

     var triggerMapNode = function(node) {
        if (!node) return;
        stopGrowTour();
        if (node.hasAttribute("data-map-church")) {
          markFacExplored("church");
          if (activeSpecialNode === "church") {
            window.openPeristasiModal("churches");
            return;
          }
          closeFacilityCard(true);
          showSpecialMapNode("church");
          return;
        }
        if (node.hasAttribute("data-map-square")) {
          markFacExplored("square");
          closeFacilityCard(true);
          showSpecialMapNode("square");
          return;
        }
        if (node.hasAttribute("data-map-train")) {
          markFacExplored("train");
          if (activeSpecialNode === "train") {
            openZoomWithList(decauvillePhotos, 0);
            return;
          }
          closeFacilityCard(true);
          showSpecialMapNode("train");
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
      var pfacTouchX = 0, pfacTouchY = 0, pfacTouchMoved = false, pfacSuppressUntil = 0;
      mapWrap.addEventListener("touchstart", function(e) {
        if (!e.touches || e.touches.length > 1) { pfacMultiTouch = true; return; }
        pfacMultiTouch = false;
        pfacTouchMoved = false;
        pfacTouchX = e.touches[0].clientX;
        pfacTouchY = e.touches[0].clientY;
      }, { passive: true });
      mapWrap.addEventListener("touchmove", function(e) {
        if (!e.touches || e.touches.length > 1) { pfacMultiTouch = true; return; }
        if (Math.abs(e.touches[0].clientX - pfacTouchX) > 8 || Math.abs(e.touches[0].clientY - pfacTouchY) > 8) {
          pfacTouchMoved = true;
        }
      }, { passive: true });
      mapWrap.addEventListener("touchend", function() {
        if (pfacMultiTouch || pfacTouchMoved) pfacSuppressUntil = performance.now() + 320;
        pfacTouchMoved = false;
      }, { passive: true });
      mapWrap.addEventListener("pointerdown", function(e) {
        if (e.isPrimary === false) { pfacMultiTouch = true; pfacDownPt = null; return; }
        pfacMultiTouch = false;
        pfacDownPt = { x: e.clientX, y: e.clientY };
      }, { passive: true });

      mapWrap.addEventListener("click", function(e) {
        if (e.target.closest("#pfacToMacroBtn")) {
          e.stopPropagation();
          jumpToMacroMap();
          return;
        }
        var tModeBtn = e.target.closest("[data-pfac-tmode]");
        if (tModeBtn) {
          e.stopPropagation();
          setPfacTravelMode(tModeBtn.getAttribute("data-pfac-tmode"));
          return;
        }
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
          if (activeSpecialNode === "train") {
            openZoomWithList(decauvillePhotos, 0);
          } else {
            openSinglePhotoZoom(lastMapThumb, lastMapThumbCap, optImg(lastMapThumb, 320));
          }
          return;
        }
        var gStepBtn = e.target.closest("[data-grow-step]");
        if (gStepBtn) {
          e.stopPropagation();
          stopGrowTour();
          if (growJourneyBtn) growJourneyBtn.textContent = "\uD83D\uDD04 Ξαναδές 2\u201315 ετών!";
          showGrowStage(Number(gStepBtn.getAttribute("data-grow-step")), true);
          return;
        }
        if (e.target.closest("[data-map-goto-card]")) {
          if (activeFacIdx === -1) {
            openFacilityCard(growActiveFacIdx !== -1 ? growActiveFacIdx : 0, false);
          }
          if (isMapZoomed) {
            var hadMapHist = histMapOpen;
            closeMapZoom(false);
            runAfterBack(hadMapHist, function() { scrollToFacilityCard(true); });
          } else {
            scrollToFacilityCard(true);
          }
          return;
        }
        if (e.target.closest("[data-map-goto-churches]")) {
          window.openPeristasiModal("churches");
          return;
        }
        if (e.target.closest("[data-map-goto-train]")) {
          e.stopPropagation();
          openZoomWithList(decauvillePhotos, 0);
          return;
        }
      var draggedMap = !!((e.detail !== 0 && performance.now() < pfacSuppressUntil) || pfacTouchMoved || (pfacDownPt && (Math.abs(e.clientX - pfacDownPt.x) > 6 || Math.abs(e.clientY - pfacDownPt.y) > 6)));
        pfacDownPt = null;
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

    isNeighborhoodBusy = function() {
        return !!(isGrowTourRunning || activeSpecialNode || curGrowStageIdx !== -1 || growActiveFacIdx !== -1);
      };
      resetNeighborhoodMap = function() {
        syncNeighborhoodMap(-1);
      };

    var mScrollBox = document.getElementById("pfacMapScroll");
      if (mScrollBox) {
        mScrollBox.addEventListener("touchmove", function(e) {
          if (walkAnimRaf && pfacDownPt && e.touches && e.touches[0] &&
              (Math.abs(e.touches[0].clientX - pfacDownPt.x) > 10 || Math.abs(e.touches[0].clientY - pfacDownPt.y) > 10)) {
            mapScrollUserAbort = true;
          }
        }, { passive: true });
        mScrollBox.addEventListener("wheel", function() {
          if (walkAnimRaf) mapScrollUserAbort = true;
        }, { passive: true });
        bindDragScroll(mScrollBox, function() {
          if (walkAnimRaf) mapScrollUserAbort = true;
        });
      }
     var streetZoomBtn = document.getElementById("pfacStreetZoomBtn");
      var pfacSvgEl = document.getElementById("pfacMapSvg");
      var togglePfacStreetZoom = function(focusSvgX, focusSvgY) {
        pfacStreetZoom = !pfacStreetZoom;
        if (mScrollBox) mScrollBox.classList.toggle("is-mobile-zoom", pfacStreetZoom);
        if (streetZoomBtn) {
          streetZoomBtn.classList.toggle("is-active", pfacStreetZoom);
          streetZoomBtn.textContent = pfacStreetZoom ? "\uD83D\uDDFA\uFE0F Όλη η Γειτονιά" : "\uD83D\uDD0D Ζουμ Δρόμων";
        }
        if (pfacStreetZoom) {
          var tx = (typeof focusSvgX === "number") ? focusSvgX : lastMapTargetX;
          var ty = (typeof focusSvgY === "number") ? focusSvgY : lastMapTargetY;
          requestAnimationFrame(function() {
            scrollZoomedMapToX(tx, false, ty);
          });
        } else if (mScrollBox) {
          mScrollBox.scrollLeft = 0;
          mScrollBox.scrollTop = 0;
        }
      };
      if (streetZoomBtn) {
        streetZoomBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          togglePfacStreetZoom(lastMapTargetX, lastMapTargetY);
        });
      }
      if (pfacSvgEl) {
        bindDoubleTapZoom(pfacSvgEl, ".pfac-map-node, #pfacStreetZoomBtn", function(clientX, clientY) {
          if (!isMapZoomed || !isPfacMobileViewport() || performance.now() - pfacZoomOpenedAt < 350) return false;
          var r = pfacSvgEl.getBoundingClientRect();
          var tapX = (r.width > 0) ? (((clientX - r.left) / r.width) * 960) : lastMapTargetX;
          var tapY = (r.height > 0) ? (((clientY - r.top) / r.height) * 410) : lastMapTargetY;
          togglePfacStreetZoom(tapX, tapY);
          return true;
        });
      }

      observeVisibility(mapWrap, function(isVis) {
        if (!isVis && !isMapZoomed) {
          stopGrowTour();
          stopNeighborhoodWalkAnim();
        }
      });

      addResizeTask(function(wChanged) {
        if (!isMapZoomed) { wasPfacMobScroll = false; return; }
        var nowMob = isPfacMobileScrollZoom();
        var modeFlipped = (nowMob !== wasPfacMobScroll);
        wasPfacMobScroll = nowMob;
        if ((wChanged || modeFlipped) && !walkAnimRaf) {
          scrollZoomedMapToX(lastMapTargetX, false);
        }
      });

      syncNeighborhoodMap(activeFacIdx, true);
    }

    function scrollToFacilityCard(forceTop) {
      if (!pfacStage) return;
      var cardEl = pfacStage.firstElementChild || pfacStage;
      var r = cardEl.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 700;
      var blk = (forceTop || r.height > vh - 40) ? "start" : "nearest";
      cardEl.scrollIntoView({ behavior: "smooth", block: blk });
    }

    function syncNeighborhoodMap(idx, skipMark) {
      if (bridgeJumpTimer) { clearTimeout(bridgeJumpTimer); bridgeJumpTimer = null; }
      if (mapReplayTimer) { clearTimeout(mapReplayTimer); mapReplayTimer = null; }
      stopGrowTour();
      growActiveFacIdx = -1;
      curGrowStageIdx = -1;
      if (!mapWalkPath || !mapPulseRing || !mapStatusEl) return;
      activeSpecialNode = "";
      syncWalkerTokenMode();
      var isBike = (pfacTravelMode === "bike");
      if (idx < 0 || !facMapMeta[idx]) {
        stopNeighborhoodWalkAnim();
        lastMapTargetX = 548;
        lastMapTargetY = 178;
        mapWalkPath.setAttribute("d", "");
        mapPulseRing.style.display = "none";
        if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
        if (mapWalkerEl) {
          mapWalkerEl.style.display = "";
          mapWalkerEl.setAttribute("transform", "translate(592,184)");
        }
        scrollZoomedMapToX(548, true);
        var idleMsg = isBike
          ? "\uD83D\uDEB2 Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 13) \u2014 φοράμε κράνος & πατάμε σε κτίριο του χάρτη!"
          : "\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 13) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!";
        setMapStatusHtml(idleMsg, "", "", "", null);
        return;
      }
      if (!skipMark) markFacExplored("fac" + idx);
      var m = facMapMeta[idx];
      var fItem = facilitiesData[idx];
      setMapStatusHtml(isBike ? m.bike : m.walk, "card", fItem.img, fItem.imgCap || fItem.title, {
        steps: m.steps,
        meters: m.meters,
        bikeTime: m.bikeTime,
        crossRoad: m.crossRoad,
        safety: m.safety,
        bikeSafety: m.bikeSafety
      });
      runNeighborhoodWalk({
        cx: m.cx, cy: m.cy, color: fItem.accent,
        steps: m.steps, meters: m.meters, bikeTime: m.bikeTime,
        crossRoad: m.crossRoad, crossPt: m.crossPt, pts: m.pts
      });
    }

   function closeFacilityCard(skipMapReset) {
      activeFacIdx = -1;
      if (pfacStage) pfacStage.innerHTML = "";
      pfacPills.forEach(function(li) {
        li.classList.remove("is-active");
      });
      if (!skipMapReset) syncNeighborhoodMap(-1);
    }

  function openFacilityCard(idx, shouldScroll) {
      if (!pfacStage) return;
      upgradeNeighborhoodMap();
      var cleanIdx = (idx + facilitiesData.length) % facilitiesData.length;

   if (cleanIdx === activeFacIdx && shouldScroll) {
        var stR = pfacStage.getBoundingClientRect();
        var isCardVis = (stR.height > 0 && stR.top < window.innerHeight - 70 && stR.bottom > 70);
        if (isCardVis) {
          closeFacilityCard();
        } else {
          scrollToFacilityCard(true);
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
        : (pfacTravelMode === "bike"
            ? ("\uD83D\uDEB2 Δες τη διαδρομή" + (stepMeta && stepMeta.bikeTime ? " (" + stepMeta.bikeTime + " με ποδήλατο)" : "") + " στον Χάρτη \u2191")
            : ("\uD83D\uDCCD Δες τη διαδρομή" + (stepMeta && stepMeta.steps ? " (~" + stepMeta.steps + " βήματα)" : "") + " στον Χάρτη \u2191"));
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
        var showWinFirst = justUnlockedAll9Fac;
        justUnlockedAll9Fac = false;
        requestAnimationFrame(function() {
          if (showWinFirst) {
            var winBannerEl = document.getElementById("pfacExpWinBanner");
            if (winBannerEl && winBannerEl.classList.contains("is-vis")) {
              winBannerEl.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
          }
          var rect = pfacStage.getBoundingClientRect();
          var limitBottom = (modalBody && modalBody.contains(pfacStage))
            ? modalBody.getBoundingClientRect().bottom
            : window.innerHeight;
         if (rect.bottom > limitBottom || rect.top < 0) {
            scrollToFacilityCard(false);
          }
        });
      }
    }

   function stepFacilityCard(step) {
      if (activeFacIdx === -1) return;
      openFacilityCard(activeFacIdx + step, false);
      requestAnimationFrame(function() {
        if (!pfacStage) return;
        var cardEl = pfacStage.firstElementChild || pfacStage;
        var r = cardEl.getBoundingClientRect();
        if (r.top < 8 || r.top > window.innerHeight - 80) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
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
        else if (btn.id === "pfacPrevBtn") stepFacilityCard(-1);
        else if (btn.id === "pfacNextBtn") stepFacilityCard(1);
      else if (btn.id === "pfacShowOnMapBtn") {
          if (mapWrap && activeFacIdx !== -1) {
            mapWrap.scrollIntoView({ behavior: "smooth", block: "center" });
            mapWrap.classList.add("is-bridge-glow");
            setTimeout(function() { mapWrap.classList.remove("is-bridge-glow"); }, 1900);
            var replayIdx = activeFacIdx;
            if (mapReplayTimer) clearTimeout(mapReplayTimer);
           mapReplayTimer = setTimeout(function() {
              mapReplayTimer = null;
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
        function() { stepFacilityCard(1); },
        function() { stepFacilityCard(-1); }
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
          img: facilitiesData[0] ? facilitiesData[0].img : "",
          imgCap: "Το 12/θέσιο Δημοτικό Σχολείο Περίστασης από ψηλά (Μακεδονίας 13)",
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
            openCentennialMirror();
          }
        },
        {
          id: "katerini",
          icon: "\uD83C\uDFD9\uFE0F",
          short: "Κατερίνη",
          color: "#d97706",
          inPieria: true,
          px: 27.4, py: 42.0,
          img: "https://commons.wikimedia.org/wiki/Special:FilePath/202505_Parko_Evangelikon_Katerini.jpg?width=750",
          imgCap: "Κατερίνη (3 χλμ Δυτικά): Το καταπράσινο δημοτικό πάρκο στην πόλη μας",
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
            switchRouteSub("today", true);
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
          img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Beach_Paralia_Katerini_-_panoramio.jpg",
          imgCap: "Παραλία Κατερίνης (5 χλμ Ανατολικά): Η αμμουδιά μας στον Θερμαϊκό Κόλπο",
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
          img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mount_Olympus_from_Litochoro.jpg",
          imgCap: "Όλυμπος & Λιτόχωρο (24 χλμ ΝΔ): Οι ψηλές κορυφές έως τον Μύτικα (2.918 μ.)",
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
          img: "https://commons.wikimedia.org/wiki/Special:FilePath/Stone_bridge_of_old_Morna.jpg?width=750",
          imgCap: "Το ιστορικό πέτρινο γεφύρι της παλιάς Μόρνας (Σκοτεινά / Φωτεινά Πιερίας)",
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
          img: "https://commons.wikimedia.org/wiki/Special:FilePath/%CE%91%CE%B5%CF%81%CE%BF%CF%86%CF%89%CF%84%CE%BF%CE%B3%CF%81%CE%B1%CF%86%CE%AF%CE%B1_%CE%9A%CE%BF%CF%81%CE%B9%CE%BD%CE%BF%CF%8D.jpg?width=750",
          imgCap: "Κορινός Πιερίας από ψηλά (Βόρεια προς Αλυκές Κίτρους & Αρχαία Πύδνα)",
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
            switchRouteSub("today", true);
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
          img: "https://commons.wikimedia.org/wiki/Special:FilePath/Platamon_Castle_01.jpg?width=750",
          imgCap: "Το βυζαντινό Κάστρο του Πλαταμώνα στη Νότια Πιερία (38 χλμ Νότια)",
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
            switchRouteSub("today", true);
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
          img: "https://commons.wikimedia.org/wiki/Special:FilePath/White_Tower_of_Thessaloniki.jpg?width=750",
          imgCap: "Θεσσαλονίκη (68 χλμ ΒΑ): Ο Λευκός Πύργος & το λιμάνι ανταμώματος του 1922",
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
            switchRouteSub("journey", true);
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
          img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6NIUbqqG1P0ASKQnropMFOPKeiowu6tNNlnZf0SskjBIs2K-SzuQizB1LxGK8hd4D3gCCI4URUA5UHfyvZHOT7HJCFGXo3MLK1KM-iRUF7eZHeCQu9pQtR2Ujy2J36sorlHnTnQkS6bMAddZ-IYGiV8qeqHwOd-8WYEQn3WQcCtdtApLY87rq9QvtiHE/s1600/2026-11-22%2011_49_56-EON%20TV.png",
          imgCap: "Χαλκιδική: Η χερσόνησος της Κασσάνδρας στον ορίζοντα του Θερμαϊκού",
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
            '<button type="button" class="preg-act-btn preg-act-btn--quiz" id="pregQuizBtn">\uD83C\uDFAF Βρες το στον Χάρτη!</button>' +
            '<button type="button" class="preg-act-btn preg-act-btn--bridge" id="pregBridgeDownBtn" title="Από τον Νομό Πιερίας στους δρόμους της γειτονιάς μας">\uD83C\uDFD8\uFE0F Στη Γειτονιά \u2193</button>' +
            '<button type="button" class="preg-act-btn preg-zoom-modal-btn" id="pregFullImgBtn" title="Μεγέθυνση Χάρτη">\uD83D\uDD0D Μεγέθυνση</button>' +
          '</div>' +
        '</div>' +
        '<div class="preg-layers-wrap">' +
          '<div class="preg-layers" id="pregLayerBtns">' +
            '<button type="button" class="preg-layer-btn is-active" data-rlayer="all" title="Όλα τα Σημεία (9)">\uD83C\uDF1F Όλα (9)</button>' +
            '<button type="button" class="preg-layer-btn" data-rlayer="neighbors" title="Οι Γείτονές μας">\uD83D\uDCCD Γείτονες</button>' +
            '<button type="button" class="preg-layer-btn" data-rlayer="ancestors" title="Οι Δρόμοι των Προγόνων μας">\u26F5 Πρόγονοι</button>' +
            '<button type="button" class="preg-layer-btn" data-rlayer="horizon" title="Τι βλέπουμε στον ορίζοντα;">\uD83D\uDD2D Ορίζοντας</button>' +
          '</div>' +
          '<button type="button" class="preg-layers-more" id="pregLayersMoreBtn" tabindex="-1" aria-label="Περισσότερα φίλτρα χάρτη">\u203A</button>' +
        '</div>' +
        '<div class="preg-layer-note" id="pregLayerNote"></div>' +
        '<div id="pregQuizStage" style="display:none" aria-live="polite"></div>' +
      '<div class="preg-body-grid">' +
          '<div class="preg-map-col">' +
            '<div class="preg-map-frame">' +
              '<div class="preg-map-scroll" id="pregMapScroll">' +
                '<div class="preg-stage" id="pregStage">' +
                  '<div class="preg-viewport" id="pregViewport">' +
               '<img class="preg-base-img" id="pregBaseImg" src="' + crispMapUrl + '" alt="Διαδραστικός Χάρτης Περίστασης και Πιερίας" draggable="false" loading="lazy" decoding="async"/>' +
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
              pinsHtml +
                '</div>' +
              '</div>' +
             '<button type="button" class="preg-zoom-pill" id="pregZoomPieriaBtn">\uD83D\uDD0D Ζουμ στην Πιερία</button>' +
              '<div class="preg-ruler-float" id="pregRulerFloat"></div>' +
            '</div>' +
            '<div class="preg-qstrip-wrap">' +
              '<button type="button" class="preg-qstrip-nav preg-qstrip-prev" id="pregQPrevBtn" tabindex="-1" aria-label="Προηγούμενα σημεία">\u2039</button>' +
              '<div class="preg-quick-strip" id="pregQuickStrip">' + quickChipsHtml + '</div>' +
              '<button type="button" class="preg-qstrip-nav preg-qstrip-next" id="pregQNextBtn" tabindex="-1" aria-label="Περισσότερα σημεία">\u203A</button>' +
            '</div>' +
          '</div>' +
          '<div class="preg-panel" id="pregPanel" aria-live="polite"></div>' +
        '</div>';

      oldLink.parentNode.replaceChild(regWrap, oldLink);

      var stageEl = document.getElementById("pregStage");
      var baseImgEl = document.getElementById("pregBaseImg");
      var hiResLoaded = false;

     var syncStageAspect = function() {
        if (baseImgEl && baseImgEl.naturalWidth > 0 && baseImgEl.naturalHeight > 0 && stageEl) {
          var ratio = baseImgEl.naturalWidth / baseImgEl.naturalHeight;
          if (Math.abs(ratio - (552 / 339)) > 0.02) {
            stageEl.style.aspectRatio = baseImgEl.naturalWidth + " / " + baseImgEl.naturalHeight;
          }
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
      var qPrevBtn = document.getElementById("pregQPrevBtn");
      var qNextBtn = document.getElementById("pregQNextBtn");
      var layerStripEl = document.getElementById("pregLayerBtns");
      var layerMoreBtn = document.getElementById("pregLayersMoreBtn");
      var layerBtnEls = regWrap.querySelectorAll(".preg-layer-btn");
      var layerNoteEl = document.getElementById("pregLayerNote");
      var quizTrigBtn = document.getElementById("pregQuizBtn");
      var quizStageEl = document.getElementById("pregQuizStage");
      var gNeighbors = document.getElementById("pregLayerNeighbors");
      var gAncestors = document.getElementById("pregLayerAncestors");
      var gHorizon = document.getElementById("pregLayerHorizon");
      var rulerSvgG = document.getElementById("pregRulerSvg");
      var rulerHalo = document.getElementById("pregRulerHalo");
      var rulerLine = document.getElementById("pregRulerLine");
      var rulerEnd = document.getElementById("pregRulerEnd");
      var rulerFloat = document.getElementById("pregRulerFloat");
      var panelEl = document.getElementById("pregPanel");

      function syncQStripFade() {
        if (!qStripEl) return;
        var maxSc = qStripEl.scrollWidth - qStripEl.clientWidth;
        var canSc = maxSc > 6;
        var hasL = canSc && qStripEl.scrollLeft > 6;
        var hasR = canSc && qStripEl.scrollLeft < maxSc - 6;
        qStripEl.classList.toggle("is-scrollable", canSc);
        qStripEl.classList.toggle("has-fade-l", hasL);
        qStripEl.classList.toggle("has-fade-r", hasR);
        if (qPrevBtn) {
          qPrevBtn.classList.toggle("is-vis", hasL);
          qPrevBtn.tabIndex = hasL ? 0 : -1;
        }
        if (qNextBtn) {
          qNextBtn.classList.toggle("is-vis", hasR);
          qNextBtn.tabIndex = hasR ? 0 : -1;
        }
      }

      if (qStripEl) {
        qStripEl.addEventListener("scroll", syncQStripFade, { passive: true });
        bindDragScroll(qStripEl);
      }
      if (qPrevBtn && qStripEl) {
        qPrevBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var st = Math.max(150, Math.round(qStripEl.clientWidth * 0.62));
          if (qStripEl.scrollTo) qStripEl.scrollTo({ left: Math.max(0, qStripEl.scrollLeft - st), behavior: "smooth" });
          else qStripEl.scrollLeft = Math.max(0, qStripEl.scrollLeft - st);
        });
      }
      if (qNextBtn && qStripEl) {
        qNextBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var st = Math.max(150, Math.round(qStripEl.clientWidth * 0.62));
          if (qStripEl.scrollTo) qStripEl.scrollTo({ left: qStripEl.scrollLeft + st, behavior: "smooth" });
          else qStripEl.scrollLeft += st;
        });
      }

     function syncOnlyLayersFade() {
        if (!layerStripEl) return;
        var maxSc = layerStripEl.scrollWidth - layerStripEl.clientWidth;
        var canSc = maxSc > 6;
        var hasL = canSc && layerStripEl.scrollLeft > 6;
        var hasR = canSc && layerStripEl.scrollLeft < maxSc - 6;
        layerStripEl.classList.toggle("is-scrollable", canSc);
        layerStripEl.classList.toggle("has-fade-l", hasL);
        layerStripEl.classList.toggle("has-fade-r", hasR);
        if (layerMoreBtn) {
          var showBtn = hasR || hasL;
          layerMoreBtn.classList.toggle("is-vis", showBtn);
          layerMoreBtn.classList.toggle("is-left", !hasR && hasL);
          layerMoreBtn.tabIndex = showBtn ? 0 : -1;
          layerMoreBtn.textContent = hasR ? "\u203A" : "\u2039";
          layerMoreBtn.setAttribute("aria-label", hasR ? "Περισσότερα φίλτρα χάρτη" : "Επιστροφή στην αρχή");
        }
      }
      function syncRegLayersFade() {
        syncOnlyLayersFade();
        syncQStripFade();
      }
     if (layerStripEl) {
        layerStripEl.style.setProperty("display", "flex", "important");
        layerStripEl.style.setProperty("flex-wrap", "nowrap", "important");
        layerStripEl.style.setProperty("justify-content", "flex-start", "important");
        layerStripEl.style.setProperty("overflow-x", "auto", "important");
        layerStripEl.style.setProperty("width", "100%", "important");
        layerStripEl.style.setProperty("min-width", "0", "important");
        if (layerStripEl.parentNode) layerStripEl.parentNode.style.setProperty("justify-content", "flex-start", "important");
        layerStripEl.addEventListener("scroll", syncOnlyLayersFade, { passive: true });
        bindDragScroll(layerStripEl);
      }
      if (layerMoreBtn && layerStripEl) {
        layerMoreBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var maxSc = layerStripEl.scrollWidth - layerStripEl.clientWidth;
          var goRight = layerStripEl.scrollLeft < maxSc - 6;
          var st = Math.max(120, Math.round(layerStripEl.clientWidth * 0.65));
          var nextLeft = goRight ? (layerStripEl.scrollLeft + st) : 0;
          if (layerStripEl.scrollTo) layerStripEl.scrollTo({ left: nextLeft, behavior: "smooth" });
          else layerStripEl.scrollLeft = nextLeft;
        });
      }

      var regMapScrollEl = document.getElementById("pregMapScroll");
      if (regMapScrollEl) bindDragScroll(regMapScrollEl);
      var curPinIdx = 0;
      var curLayer = "all";
      var renderedRegPinIdx = -1;
      var renderedRegLayer = "";
      var pieriaZoomed = false;
      var pieriaTx = Z_TX;
      var pieriaTy = Z_TY;
      var minPieriaPan = 100 - 100 * Z_SCALE;
      var panMovedReg = false;
      var regModalBg = null;
      var regPlaceholder = null;
      var stageDownPt = null;
      var multiTouchReg = false;
      var zoomAnimTimer = null;
      var regQuizActive = false;
      var regQuizWaitingNext = false;
      var regQuizRound = 0;
      var regQuizDeck = [];
      var wrongPinTimer = null;

     var wasRegMobScroll = false;
      var lastRegScrollPctX = schoolOrigin.x;
      var lastRegScrollPctY = schoolOrigin.y;
      var regProgScrollUntil = 0;

      function isRegMobileScrollZoom() {
        if (!isRegMapZoomed) return false;
        return window.innerWidth <= 720 || (window.innerWidth <= 960 && window.innerHeight <= 520);
      }

      if (regMapScrollEl) {
        regMapScrollEl.addEventListener("scroll", function() {
          if (!isRegMobileScrollZoom() || performance.now() <= regProgScrollUntil) return;
          var sw = regMapScrollEl.scrollWidth, cw = regMapScrollEl.clientWidth;
          var sh = regMapScrollEl.scrollHeight, ch = regMapScrollEl.clientHeight;
          if (sw > cw + 4) lastRegScrollPctX = ((regMapScrollEl.scrollLeft + cw / 2) / sw) * 100;
          if (sh > ch + 4) lastRegScrollPctY = ((regMapScrollEl.scrollTop + ch / 2) / sh) * 100;
        }, { passive: true });
      }

      function scrollZoomedRegMapToPct(xPct, yPct, smooth) {
        lastRegScrollPctX = xPct;
        lastRegScrollPctY = yPct;
        if (!isRegMobileScrollZoom() || !regMapScrollEl) return;
        wasRegMobScroll = true;
        regProgScrollUntil = performance.now() + (smooth ? 450 : 80);
        var sw = regMapScrollEl.scrollWidth, cw = regMapScrollEl.clientWidth;
        var sh = regMapScrollEl.scrollHeight, ch = regMapScrollEl.clientHeight;
        var tLeft = sw > cw + 4 ? Math.max(0, Math.min(sw - cw, Math.round((xPct / 100) * sw - cw / 2))) : 0;
        var tTop = sh > ch + 4 ? Math.max(0, Math.min(sh - ch, Math.round((yPct / 100) * sh - ch / 2))) : 0;
        if (smooth && typeof regMapScrollEl.scrollTo === "function") {
          try {
            regMapScrollEl.scrollTo({ left: tLeft, top: tTop, behavior: "smooth" });
            return;
          } catch (e) {}
        }
        regMapScrollEl.scrollLeft = tLeft;
        regMapScrollEl.scrollTop = tTop;
      }

      function scrollZoomedRegMapToPin(idx, smooth) {
        var p = regPins[idx] || regPins[0];
        if (p) scrollZoomedRegMapToPct(p.px, p.py, smooth);
      }

      function applyPieriaViewport() {
        wasRegMobScroll = isRegMobileScrollZoom();
        if (!viewportEl) return;
        viewportEl.style.transform = (pieriaZoomed && !wasRegMobScroll)
          ? ("translate3d(" + pieriaTx.toFixed(2) + "%," + pieriaTy.toFixed(2) + "%,0) scale(" + Z_SCALE + ")")
          : "";
      }

      if (typeof window.ResizeObserver === "function" && stageEl) {
        var regStageRo = new ResizeObserver(function() {
          syncPinPositions();
        });
        regStageRo.observe(stageEl);
      }

      addResizeTask(function(wChanged, hChanged) {
        if (wChanged) syncRegLayersFade();
        if (!isRegMapZoomed) {
          wasRegMobScroll = false;
          if (wChanged) syncPinPositions();
          return;
        }
        var nowMob = isRegMobileScrollZoom();
        var modeFlipped = (nowMob !== wasRegMobScroll);
        wasRegMobScroll = nowMob;
        if (nowMob && !wChanged && !modeFlipped) return;
        if (wChanged || hChanged || modeFlipped) {
          applyPieriaViewport();
          syncPinPositions();
          if (nowMob && (wChanged || modeFlipped)) {
            scrollZoomedRegMapToPct(lastRegScrollPctX, lastRegScrollPctY, false);
          }
        }
      });

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
          panMovedReg = false;
          if (e.touches && e.touches.length > 1) {
            multiTouchReg = true;
            tPanOn = false;
            stageEl.classList.remove("is-panning");
            return;
          }
          multiTouchReg = false;
          if (!pieriaZoomed || isRegMobileScrollZoom() || isPinchZoomed() || !e.touches || !e.touches[0] || e.target.closest("#pregZoomPieriaBtn")) {
            tPanOn = false;
            return;
          }
          tPanOn = true;
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
          if (!tPanOn || !pieriaZoomed || isRegMobileScrollZoom() || isPinchZoomed() || !e.touches || !e.touches[0]) return;
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
          if (panMovedReg) {
            setTimeout(function() { panMovedReg = false; stageDownPt = null; }, 80);
          }
        };
        stageEl.addEventListener("touchend", endTouchPan, { passive: true });
        stageEl.addEventListener("touchcancel", endTouchPan, { passive: true });

        var mPanOn = false, mStartX = 0, mStartY = 0, mLastX = 0, mLastY = 0;
        var onWinMouseMove = function(e) {
          if (!mPanOn || !pieriaZoomed || isRegMobileScrollZoom()) return;
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
       var regZoomOpenedAt = 0;
        stageEl.addEventListener("dragstart", function(e) { e.preventDefault(); });

        var onWinMouseUp = function() {
          window.removeEventListener("mousemove", onWinMouseMove);
          window.removeEventListener("mouseup", onWinMouseUp);
          window.removeEventListener("blur", onWinMouseUp);
          if (!mPanOn) return;
          mPanOn = false;
          stageEl.classList.remove("is-panning");
          if (panMovedReg) {
            setTimeout(function() { panMovedReg = false; stageDownPt = null; }, 80);
          }
        };
        stageEl.addEventListener("mousedown", function(e) {
          if (e.button !== 0 || !pieriaZoomed || isRegMobileScrollZoom() || e.target.closest("#pregZoomPieriaBtn")) return;
          mPanOn = true;
          panMovedReg = false;
          panRect = stageEl.getBoundingClientRect();
          mStartX = mLastX = e.clientX;
          mStartY = mLastY = e.clientY;
          window.addEventListener("mousemove", onWinMouseMove);
          window.addEventListener("mouseup", onWinMouseUp);
          window.addEventListener("blur", onWinMouseUp);
        });

        stageEl.addEventListener("pointerdown", function(e) {
          if (e.isPrimary === false) { multiTouchReg = true; stageDownPt = null; return; }
          multiTouchReg = false;
          panMovedReg = false;
          stageDownPt = { x: e.clientX, y: e.clientY };
        }, { passive: true });

      bindDoubleTapZoom(stageEl, ".preg-pin, #pregZoomPieriaBtn", function(clientX, clientY) {
          if (!isRegMapZoomed || regQuizActive || performance.now() - regZoomOpenedAt < 350) return false;
          var r = stageEl.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          var sxPct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
          var syPct = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
          setPieriaZoom(!pieriaZoomed, sxPct, syPct);
          return true;
        });
      }

      function openRegMapZoom() {
        if (isRegMapZoomed || !regWrap) return;
        regZoomOpenedAt = performance.now();
        pauseHeroVideo();
        stopGrowTour();
        if (document.activeElement && document.activeElement !== document.body) {
          lastRegFocusEl = document.activeElement;
        }
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
        if (stageEl) stageEl.classList.remove("is-zoom-anim");
        regModalBg.appendChild(regWrap);
        regWrap.classList.add("is-zoomed");
        regModalBg.classList.add("is-open");
        lockBodyScroll();
        applyPieriaViewport();
        syncPinPositions();
       if (zoomModalBtn) zoomModalBtn.textContent = "\u2715 Κλείσιμο";
        requestAnimationFrame(function() {
          syncPinPositions();
          syncRegLayersFade();
          if (regQuizActive && !regQuizWaitingNext) scrollZoomedRegMapToPct(38, 42, false);
          else scrollZoomedRegMapToPin(curPinIdx, false);
          if (zoomModalBtn) {
            try { zoomModalBtn.focus({ preventScroll: true }); } catch (err) { zoomModalBtn.focus(); }
          }
        });

        if (!histRegMapOpen) {
          histRegMapOpen = true;
          if (ignorePopCount === 0) {
            try {
              window.history.pushState({ pregMapZoom: true }, "", window.location.href);
            } catch (e) {}
          }
        }
      }

      closeRegMapZoom = function(fromPopState) {
        if (!isRegMapZoomed || !regWrap) return;
        isRegMapZoomed = false;
        if (stageEl) stageEl.classList.remove("is-zoom-anim");
        regWrap.classList.remove("is-zoomed");
        if (regModalBg) regModalBg.classList.remove("is-open");
        if (regPlaceholder && regPlaceholder.parentNode) {
          regPlaceholder.parentNode.insertBefore(regWrap, regPlaceholder);
        }
        if (regMapScrollEl) {
          regMapScrollEl.scrollLeft = 0;
          regMapScrollEl.scrollTop = 0;
        }
        applyPieriaViewport();
        syncPinPositions();
        unlockBodyScroll();
      if (zoomModalBtn) zoomModalBtn.textContent = "\uD83D\uDD0D Μεγέθυνση";
        requestAnimationFrame(function() {
          syncPinPositions();
          syncRegLayersFade();
        });

        if (lastRegFocusEl && !modal.classList.contains("is-open") && !isMapZoomed && !(zoomOverlay && zoomOverlay.classList.contains("is-open")) && document.contains(lastRegFocusEl)) {
          var rf = lastRegFocusEl;
          lastRegFocusEl = null;
          requestAnimationFrame(function() {
            try { rf.focus({ preventScroll: true }); } catch (err) { rf.focus(); }
          });
        }

        var needBack = (!fromPopState && histRegMapOpen);
        histRegMapOpen = false;
        if (needBack) safeHistoryBack(1);
      };

      function isPinInCurrentLayer(i) {
        return (curLayer === "all") || (regPins[i].layers.indexOf(curLayer) !== -1);
      }

     var lastPinPosKey = "";
      function syncPinPositions(force) {
        var useTrans = pieriaZoomed && !isRegMobileScrollZoom();
        var sw = stageEl ? stageEl.clientWidth : 0;
        var sh = stageEl ? stageEl.clientHeight : 0;
        var posKey = sw + "x" + sh + "|" + (useTrans ? (pieriaTx.toFixed(2) + "," + pieriaTy.toFixed(2)) : "0");
        if (!force && posKey === lastPinPosKey) return;
        lastPinPosKey = posKey;
        var canGpu = (sw > 0 && sh > 0);
        pinEls.forEach(function(btn, i) {
          var p = regPins[i];
          var lx = useTrans ? (pieriaTx + p.px * Z_SCALE) : p.px;
          var ly = useTrans ? (pieriaTy + p.py * Z_SCALE) : p.py;
          if (canGpu) {
            btn.classList.add("is-gpu-pos");
            var xPx = (lx / 100) * sw;
            var yPx = (ly / 100) * sh;
            btn.style.transform = "translate3d(" + xPx.toFixed(1) + "px," + yPx.toFixed(1) + "px,0) translate(-50%,-50%)";
          } else {
            btn.classList.remove("is-gpu-pos");
            btn.style.transform = "";
            btn.style.left = lx.toFixed(2) + "%";
            btn.style.top = ly.toFixed(2) + "%";
          }
          var outFrame = useTrans && (lx < 2 || lx > 98 || ly < 2 || ly > 98);
          btn.classList.toggle("is-out-zoom", outFrame);
          var unfocusable = outFrame || btn.classList.contains("is-hidden-layer");
          btn.tabIndex = unfocusable ? -1 : 0;
          if (unfocusable && document.activeElement === btn && btn.blur) btn.blur();
        });
      }

      function setPieriaZoom(enable, focusXPct, focusYPct) {
        var wasZoomed = pieriaZoomed;
        pieriaZoomed = !!enable;
        panMovedReg = false;
        stageDownPt = null;
        var hasFocusPt = (typeof focusXPct === "number" && typeof focusYPct === "number");
        if (pieriaZoomed) {
          pieriaTx = hasFocusPt ? Math.max(minPieriaPan, Math.min(0, 50 - focusXPct * Z_SCALE)) : Z_TX;
          pieriaTy = hasFocusPt ? Math.max(minPieriaPan, Math.min(0, 50 - focusYPct * Z_SCALE)) : Z_TY;
          ensureHiResMap();
        }
        regWrap.classList.toggle("has-pieria-zoom", pieriaZoomed);
        if (stageEl) {
          stageEl.classList.toggle("is-pieria-active", pieriaZoomed);
          if (!isRegMobileScrollZoom() && wasZoomed !== pieriaZoomed) {
            stageEl.classList.add("is-zoom-anim");
            if (zoomAnimTimer) clearTimeout(zoomAnimTimer);
            zoomAnimTimer = setTimeout(function() {
              zoomAnimTimer = null;
              if (stageEl) stageEl.classList.remove("is-zoom-anim");
            }, 500);
          } else {
            stageEl.classList.remove("is-zoom-anim");
          }
        }
        if (viewportEl) viewportEl.classList.toggle("is-pieria-zoom", pieriaZoomed);
        applyPieriaViewport();
        if (zoomPieriaBtn) {
          zoomPieriaBtn.classList.toggle("is-active", pieriaZoomed);
          zoomPieriaBtn.textContent = pieriaZoomed ? "\uD83D\uDDFA\uFE0F Όλος ο Χάρτης" : "\uD83D\uDD0D Ζουμ στην Πιερία";
        }
        syncPinPositions();
        if (isRegMobileScrollZoom()) {
          requestAnimationFrame(function() {
            syncPinPositions();
            if (hasFocusPt) scrollZoomedRegMapToPct(focusXPct, focusYPct, false);
            else scrollZoomedRegMapToPin(curPinIdx, false);
          });
        }
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
          upgradeNeighborhoodMap();
          if (!mapWrap) return;
          closeFacilityCard();
          syncNeighborhoodMap(0, true);
          growActiveFacIdx = 0;
          var m0 = facMapMeta[0];
          setMapStatusHtml(
            "\uD83D\uDD2D Ζουμάραμε στην κόκκινη πινέζα της Περίστασης! Τώρα βλέπεις από κοντά τους δρόμους γύρω από την οδό Μακεδονίας 13!",
            "card",
            facilitiesData[0] ? facilitiesData[0].img : "",
            facilitiesData[0] ? facilitiesData[0].title : "",
            {
              steps: 0, meters: 0, bikeTime: "0 λεπτά", crossRoad: false,
              safety: m0 ? m0.safety : "",
              bikeSafety: m0 ? m0.bikeSafety : ""
            }
          );
          mapWrap.scrollIntoView({ behavior: "smooth", block: "center" });
          mapWrap.classList.add("is-bridge-glow");
          setTimeout(function() { mapWrap.classList.remove("is-bridge-glow"); }, 2200);
        };
        if (bridgeJumpTimer) { clearTimeout(bridgeJumpTimer); bridgeJumpTimer = null; }
        if (wasZoomed) runAfterBack(hadHist, jumpFn);
        else bridgeJumpTimer = setTimeout(function() { bridgeJumpTimer = null; jumpFn(); }, 260);
      }

      function selectRegPin(idx, keepZoom) {
        curPinIdx = (idx + regPins.length) % regPins.length;
        var p = regPins[curPinIdx];

      if (!keepZoom && pieriaZoomed && !p.inPieria && !isRegMobileScrollZoom()) {
          setPieriaZoom(false);
        } else if (pieriaZoomed && !isRegMobileScrollZoom()) {
          var curLx = pieriaTx + p.px * Z_SCALE;
          var curLy = pieriaTy + p.py * Z_SCALE;
          if (curLx < 10 || curLx > 90 || curLy < 12 || curLy > 88) {
            pieriaTx = Math.max(minPieriaPan, Math.min(0, 50 - p.px * Z_SCALE));
            pieriaTy = Math.max(minPieriaPan, Math.min(0, 50 - p.py * Z_SCALE));
            if (stageEl) {
              stageEl.classList.add("is-zoom-anim");
              if (zoomAnimTimer) clearTimeout(zoomAnimTimer);
              zoomAnimTimer = setTimeout(function() {
                zoomAnimTimer = null;
                if (stageEl) stageEl.classList.remove("is-zoom-anim");
              }, 500);
            }
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
       if (qStripEl) {
          if (activeChipEl && qStripEl.scrollWidth > qStripEl.clientWidth + 6) {
            var scLeft = Math.max(0, activeChipEl.offsetLeft - (qStripEl.clientWidth - activeChipEl.offsetWidth) / 2);
            if (qStripEl.scrollTo) qStripEl.scrollTo({ left: scLeft, behavior: "smooth" });
            else qStripEl.scrollLeft = scLeft;
          } else {
            qStripEl.scrollLeft = 0;
          }
          syncQStripFade();
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

      if (panelEl && (curPinIdx !== renderedRegPinIdx || curLayer !== renderedRegLayer)) {
          renderedRegPinIdx = curPinIdx;
          renderedRegLayer = curLayer;
          var visList = getVisibleIndices();
          var visPos = visList.indexOf(curPinIdx);
          var countLabel = (visPos !== -1 ? (visPos + 1) : 1) + "/" + visList.length;

          var secBridgeHtml = p.secondBridge
            ? '<button type="button" class="preg-cta-btn preg-cta-btn--sec" data-preg-bridge="1">\uD83C\uDFD8\uFE0F Ζουμ στους Δρόμους της Γειτονιάς μας \u2193</button>'
            : '';

         var pinMediaHtml = p.img
            ? '<div class="preg-panel-media-row">' +
                '<div class="preg-panel-photo-wrap">' +
                  '<img class="preg-panel-photo" src="' + optImg(p.img, 640) + '" data-full-src="' + escAttr(p.img) + '" alt="' + escAttr(p.imgCap || p.title) + '" data-preg-photo="1" loading="lazy" decoding="async"/>' +
                  '<div class="preg-panel-photo-cap">\uD83D\uDD0D Πάτησε για μεγέθυνση</div>' +
                '</div>' +
                '<p class="preg-panel-desc">' + p.desc + '</p>' +
              '</div>'
            : '<p class="preg-panel-desc">' + p.desc + '</p>';

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
            pinMediaHtml +
            '<div class="preg-panel-foot">' +
              '<button type="button" class="preg-cta-btn" data-preg-cta="1">' + ((p.id === "chalkidiki" && curLayer === "horizon") ? "\uD83C\uDF0A Εξερεύνησε τη Ζώνη Θάλασσας (0μ) \u279C" : p.ctaText) + '</button>' +
              secBridgeHtml +
            '</div>';

          var pImgEl = panelEl.querySelector(".preg-panel-photo");
          if (pImgEl) pImgEl.onerror = handleImgFallback;
         if (visList.length > 1) {
            var nextVisP = regPins[visList[(Math.max(0, visPos) + 1) % visList.length]];
            if (nextVisP && nextVisP.img) preloadImg(optImg(nextVisP.img, 640));
          }
        }
        scrollZoomedRegMapToPin(curPinIdx, true);
      }

     var regQuizPool = [
        { pin: 0, q: "\uD83C\uDFEB Πού βρίσκεται η Περίσταση (26 μ. υψόμετρο) και το 12/Θ Δημοτικό Σχολείο μας στην καρδιά του κάμπου;", note: "Εδώ χτυπά η καρδιά του σχολείου μας στην οδό Μακεδονίας 13 από το 1926!" },
        { pin: 1, q: "\uD83E\uDDED Ποια πόλη είναι η πρωτεύουσα του νομού μας, μόλις 3 χλμ Δυτικά (αριστερά) από το σχολείο μας;", note: "Η Κατερίνη απέχει μόλις 5 λεπτά σήμερα (αλλά ~45 λεπτά με το βοϊδόκαρο του 1922)!" },
        { pin: 2, q: "\uD83C\uDF0A Πού είναι η αμμουδιά μας στον Θερμαϊκό Κόλπο (0 μ. υψόμετρο), 5 χλμ Ανατολικά από την Περίσταση;", note: "Στην Παραλία Κατερίνης ξεκινά το μέτρημα του υψομέτρου (0 μέτρα)!" },
        { pin: 3, q: "\u26F0\uFE0F Πού υψώνεται Νοτιοδυτικά το ψηλότερο βουνό της Ελλάδας (Μύτικας, 2.918 μ.) και το Λιτόχωρο;", note: "Ο Όλυμπος είναι Μνημείο Παγκόσμιας Κληρονομιάς της UNESCO!" },
        { pin: 4, q: "\uD83C\uDF32 Πού βρίσκονται Δυτικά, στα Πιέρια Όρη, τα Φωτεινά (Σκοτεινά) απ' όπου φιλοξενήθηκαν οικογένειες το 1947;", note: "Το 1947 τα παιδιά έκαναν μάθημα στα «Αλώνια» για να στεγαστούν οι οικογένειες των Σκοτεινών!" },
        { pin: 5, q: "\uD83C\uDFFA Ποιο παραθαλάσσιο σημείο βρίσκεται Βόρεια (πάνω, 8\u201318 χλμ), στον δρόμο από τη Θεσσαλονίκη;", note: "Από το πέρασμα της Πύδνας, του Κίτρους και του Κορινού κατέβηκαν οι πρόσφυγες το 1923\u20131924!" },
        { pin: 6, q: "\uD83C\uDFF0 Πού βρίσκεται Νότια (κάτω, 38 χλμ) το βυζαντινό κάστρο εκεί που ο Όλυμπος αγγίζει το Αιγαίο;", note: "Το Κάστρο του Πλαταμώνα στέκει περήφανο στο νότιο άκρο της Πιερίας!" },
        { pin: 7, q: "\u26F5 Σε ποιο μεγάλο λιμάνι Βορειοανατολικά (68 χλμ) αντάμωσαν το 1922 τα ατμόπλοια και τα κάρα των Περιστασιανών;", note: "Στη Θεσσαλονίκη έφτασαν στις 22/10/1922 τα 18 κιβώτια κειμηλίων πριν κατηφορίσουν για την Πιερία!" },
        { pin: 8, q: "\uD83D\uDD2D Ποια χερσόνησο βλέπουμε απέναντι από τον Θερμαϊκό Κόλπο (Ανατολικά-ΝΑ) τις καθαρές μέρες με βοριά;", note: "Απέναντι από την Παραλία, πάνω από το κύμα (~45 χλμ), ξεχωρίζει η Κασσάνδρα Χαλκιδικής!" }
      ];

      function clearWrongPinAnim() {
        if (wrongPinTimer) { clearTimeout(wrongPinTimer); wrongPinTimer = null; }
        pinEls.forEach(function(b) { b.classList.remove("is-quiz-wrong"); });
      }

      function getCompassHintBetween(fromP, toP) {
        var dx = toP.px - fromP.px;
        var dy = toP.py - fromP.py;
        if (Math.abs(dy) >= Math.abs(dx) * 1.25) {
          return dy < 0 ? "Ψάξε πιο Βόρεια (προς τα πάνω)! \u2B06\uFE0F" : "Ψάξε πιο Νότια (προς τα κάτω)! \u2B07\uFE0F";
        }
        if (Math.abs(dx) >= Math.abs(dy) * 1.25) {
          return dx > 0 ? "Ψάξε πιο Ανατολικά (προς τα δεξιά)! \u27A1\uFE0F" : "Ψάξε πιο Δυτικά (προς τα αριστερά)! \u2B05\uFE0F";
        }
        if (dy < 0 && dx > 0) return "Ψάξε πιο Βορειοανατολικά (πάνω δεξιά)! \u2197\uFE0F";
        if (dy < 0 && dx < 0) return "Ψάξε πιο Βορειοδυτικά (πάνω αριστερά)! \u2196\uFE0F";
        if (dy > 0 && dx > 0) return "Ψάξε πιο Νοτιοανατολικά (κάτω δεξιά)! \u2198\uFE0F";
        return "Ψάξε πιο Νοτιοδυτικά (κάτω αριστερά)! \u2199\uFE0F";
      }

     function prepQuizGuessMap() {
        clearWrongPinAnim();
        if (pieriaZoomed) setPieriaZoom(false);
        regWrap.classList.add("is-quiz-mode", "is-quiz-guessing");
        pinEls.forEach(function(b) { b.classList.remove("is-selected"); });
        if (rulerSvgG) rulerSvgG.style.display = "none";
        if (isRegMobileScrollZoom()) scrollZoomedRegMapToPct(38, 42, true);
      }

      function drawRegQuizCard(fbHtml, fbCls, doneAll) {
        if (!quizStageEl) return;
        var q = regQuizDeck[regQuizRound];
        if (!q) return;
        var dotsHtml = regQuizDeck.map(function(_, i) {
          var dCls = "preg-quiz-dot" + (doneAll || i < regQuizRound || (i === regQuizRound && regQuizWaitingNext) ? " is-done" : (i === regQuizRound ? " is-cur" : ""));
          return '<span class="' + dCls + '"></span>';
        }).join("");
        quizStageEl.innerHTML =
          '<div class="preg-quiz-box">' +
            '<div class="preg-quiz-top">' +
              '<span class="preg-quiz-kicker">' +
                '<span>\uD83C\uDFAF Γύρος ' + (regQuizRound + 1) + '/' + regQuizDeck.length + '</span>' +
                '<span class="preg-quiz-dots">' + dotsHtml + '</span>' +
              '</span>' +
              '<button type="button" class="pexp-root-pop-close" data-rquiz-close="1" title="Κλείσιμο παιχνιδιού">\u2715</button>' +
            '</div>' +
            '<p class="preg-quiz-q">' + q.q + '</p>' +
            '<div class="preg-quiz-fb' + (fbCls ? ' ' + fbCls : '') + '">' + fbHtml + '</div>' +
          '</div>';
        quizStageEl.querySelectorAll("img").forEach(function(im) {
          im.onerror = function() { this.style.display = "none"; };
        });
      }

      function getRegQuizPrompt() {
        return isRegMobileScrollZoom()
          ? "\uD83D\uDC47 Σύρε τον χάρτη &amp; πάτησε πάνω στη σωστή πινέζα!"
          : "\uD83D\uDC47 Πάτησε απευθείας πάνω στη σωστή πινέζα του χάρτη!";
      }

      stopRegQuiz = function() {
        clearWrongPinAnim();
        var wasOpen = regWrap.classList.contains("is-quiz-mode") || isRegQuizActive();
        regQuizActive = false;
        regQuizWaitingNext = false;
        regWrap.classList.remove("is-quiz-mode", "is-quiz-guessing");
        if (quizTrigBtn) {
          quizTrigBtn.classList.remove("is-active");
          quizTrigBtn.textContent = "\uD83C\uDFAF Βρες το στον Χάρτη!";
        }
        if (quizStageEl) {
          quizStageEl.style.display = "none";
          quizStageEl.innerHTML = "";
        }
        if (wasOpen) {
          renderedRegPinIdx = -1;
          selectRegPin(curPinIdx, true);
          requestAnimationFrame(function() {
            syncPinPositions();
            syncRegLayersFade();
          });
        }
      };

      isRegQuizActive = function() {
        return !!(quizStageEl && quizStageEl.style.display === "block");
      };
      isRegQuizGuessing = function() {
        return !!regQuizActive;
      };

      function startRegQuiz() {
        clearWrongPinAnim();
        if (curLayer !== "all" || pieriaZoomed) {
          applyRegLayer("all", 0);
        }
        regQuizDeck = shuffleList(regQuizPool).slice(0, 5);
        regQuizRound = 0;
        regQuizWaitingNext = false;
        regQuizActive = true;
        if (quizTrigBtn) {
          quizTrigBtn.classList.add("is-active");
          quizTrigBtn.textContent = "\u2715 Έξοδος Κουίζ";
        }
        if (quizStageEl) quizStageEl.style.display = "block";
        prepQuizGuessMap();
        drawRegQuizCard(getRegQuizPrompt(), "", false);
        requestAnimationFrame(function() {
          syncPinPositions();
          if (isRegMapZoomed) {
            if (regWrap.scrollTo) regWrap.scrollTo({ top: 0, behavior: "smooth" });
            else regWrap.scrollTop = 0;
          } else if (quizStageEl) {
            var qr = quizStageEl.getBoundingClientRect();
            if (qr.top < 8 || qr.bottom > window.innerHeight - 80) {
              regWrap.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        });
      }

      function advanceRegQuizRound() {
        if (!regQuizActive || !regQuizWaitingNext) return;
        regQuizRound++;
        regQuizWaitingNext = false;
        prepQuizGuessMap();
        drawRegQuizCard(getRegQuizPrompt(), "", false);
        requestAnimationFrame(syncPinPositions);
      }

      function handleRegQuizPinTap(clickedIdx) {
        if (!regQuizActive) return;
        if (regQuizWaitingNext) {
          advanceRegQuizRound();
          return;
        }
        var q = regQuizDeck[regQuizRound];
        if (!q) return;
        if (clickedIdx === q.pin) {
          clearWrongPinAnim();
          regWrap.classList.remove("is-quiz-guessing");
          renderedRegPinIdx = -1;
          selectRegPin(clickedIdx, true);
          requestAnimationFrame(syncPinPositions);
          var winP = regPins[clickedIdx];
          var thumbHtml = winP && winP.img
            ? '<img class="preg-quiz-thumb" src="' + optImg(winP.img, 320) + '" alt="' + escAttr(winP.short) + '" data-rquiz-zoom="1" title="Πάτησε για μεγέθυνση!"/>'
            : '';
          if (regQuizRound < regQuizDeck.length - 1) {
            regQuizWaitingNext = true;
            drawRegQuizCard(
              '<div class="preg-quiz-win-row">' + thumbHtml + '<span>\u2705 <strong>Μπράβο! (' + winP.short + ')</strong> ' + q.note + '</span></div>' +
              '<button type="button" class="preg-quiz-next-btn" data-rquiz-next="1">Επόμενο (' + (regQuizRound + 2) + '/' + regQuizDeck.length + ') \u279C</button>',
              "is-win",
              false
            );
          } else {
            regQuizActive = false;
            regQuizWaitingNext = false;
            regWrap.classList.remove("is-quiz-mode");
            if (quizTrigBtn) {
              quizTrigBtn.classList.remove("is-active");
              quizTrigBtn.textContent = "\uD83C\uDFAF Βρες το στον Χάρτη!";
            }
            drawRegQuizCard(
              '<div class="preg-quiz-win-row">' + thumbHtml + '<span>\uD83C\uDFC6 <strong>5 στα 5!</strong> Τα βρήκες όλα από τον Όλυμπο και τα Πιέρια έως τη Θεσσαλονίκη και τη Χαλκιδική!</span></div>' +
              '<button type="button" class="preg-quiz-next-btn" data-rquiz-replay="1">\uD83D\uDD04 Παίξε ξανά</button>',
              "is-win",
              true
            );
            requestAnimationFrame(function() {
              syncPinPositions();
              syncRegLayersFade();
            });
          }
        } else {
          clearWrongPinAnim();
          var wrongBtn = pinEls[clickedIdx];
          if (wrongBtn) {
            void wrongBtn.offsetWidth;
            wrongBtn.classList.add("is-quiz-wrong");
            wrongPinTimer = setTimeout(clearWrongPinAnim, 850);
          }
          var clickedP = regPins[clickedIdx];
          var targetP = regPins[q.pin];
          var hintTxt = getCompassHintBetween(clickedP, targetP);
          drawRegQuizCard(
            '<span>\uD83E\uDD14 Εδώ είναι «' + clickedP.short + '» \u2014 ' + hintTxt + '</span>',
            "is-warn",
            false
          );
          if (isRegMobileScrollZoom() && targetP) {
            scrollZoomedRegMapToPct(clickedP.px * 0.55 + targetP.px * 0.45, clickedP.py * 0.55 + targetP.py * 0.45, true);
          }
        }
      }

      function applyRegLayer(layerName, autoPinIdx) {
        if (isRegQuizActive()) stopRegQuiz();
        curLayer = layerName || "all";
        var actLayerBtn = null;
        layerBtnEls.forEach(function(b) {
          var isAct = (b.getAttribute("data-rlayer") === curLayer);
          b.classList.toggle("is-active", isAct);
          if (isAct) actLayerBtn = b;
        });
       if (layerStripEl) {
          if (actLayerBtn && layerStripEl.scrollWidth > layerStripEl.clientWidth + 4) {
            var lSc = Math.max(0, actLayerBtn.offsetLeft - (layerStripEl.clientWidth - actLayerBtn.offsetWidth) / 2);
            if (layerStripEl.scrollTo) layerStripEl.scrollTo({ left: lSc, behavior: "smooth" });
            else layerStripEl.scrollLeft = lSc;
          } else {
            layerStripEl.scrollLeft = 0;
          }
        }
        syncRegLayersFade();
        if (gNeighbors) gNeighbors.style.display = (curLayer === "neighbors") ? "" : "none";
        if (gAncestors) gAncestors.style.display = (curLayer === "ancestors") ? "" : "none";
        if (gHorizon) gHorizon.style.display = (curLayer === "horizon") ? "" : "none";

        var noteTxt = layerNotes[curLayer] || "";
        regWrap.classList.toggle("has-layer-note", !!noteTxt);
        if (layerNoteEl) {
          layerNoteEl.textContent = noteTxt;
          layerNoteEl.classList.toggle("is-vis", !!noteTxt);
        }

        pinEls.forEach(function(btn, i) {
          var hid = !isPinInCurrentLayer(i);
          btn.classList.toggle("is-hidden-layer", hid);
          if (hid && document.activeElement === btn && btn.blur) btn.blur();
        });
        qChipEls.forEach(function(ch, i) {
          ch.classList.toggle("is-hidden-layer", !isPinInCurrentLayer(i));
        });

        setPieriaZoom(curLayer === "neighbors");
        syncPinPositions(true);

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
        if (e.target.closest("#pregQuizBtn")) {
          e.stopPropagation();
          if (regQuizActive) stopRegQuiz();
          else startRegQuiz();
          return;
        }
        if (e.target.closest("[data-rquiz-close]")) {
          e.stopPropagation();
          stopRegQuiz();
          return;
        }
        if (e.target.closest("[data-rquiz-next]")) {
          e.stopPropagation();
          advanceRegQuizRound();
          return;
        }
        if (e.target.closest("[data-rquiz-replay]")) {
          e.stopPropagation();
          startRegQuiz();
          return;
        }
        if (e.target.closest("[data-rquiz-zoom]")) {
          e.stopPropagation();
          var qNow = regQuizDeck[regQuizRound];
          var rpNow = qNow ? regPins[qNow.pin] : null;
          if (rpNow && rpNow.img) openSinglePhotoZoom(rpNow.img, rpNow.imgCap || rpNow.title, optImg(rpNow.img, 320));
          return;
        }
        if (e.target.closest("[data-preg-photo]")) {
          e.stopPropagation();
          var vInds = getVisibleIndices().filter(function(vi) { return !!regPins[vi].img; });
          if (vInds.length) {
            var zArr = vInds.map(function(vi) {
              var rp = regPins[vi];
              return { src: rp.img, thumb: optImg(rp.img, 640), caption: rp.imgCap || rp.title };
            });
            var startPos = vInds.indexOf(curPinIdx);
            openZoomWithList(zArr, startPos !== -1 ? startPos : 0);
          }
          return;
        }
        if (e.target.closest("#pregZoomPieriaBtn")) {
          if (!pieriaZoomed && !regPins[curPinIdx].inPieria && !isRegMobileScrollZoom()) {
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
          stopRegQuiz();
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
          if (!regQuizActive) selectRegPin(Number(cBtn.getAttribute("data-rchip")));
          return;
        }
        var stBtn = e.target.closest("[data-preg-step]");
        if (stBtn) {
          if (regQuizActive && regQuizWaitingNext) advanceRegQuizRound();
          else if (!regQuizActive) stepRegPin(Number(stBtn.getAttribute("data-preg-step")));
          return;
        }
        if (e.target.closest("[data-preg-cta]")) {
          var curP = regPins[curPinIdx];
          if (curP && curP.action) curP.action();
          return;
        }
        if (e.detail === 0) {
          var kbPin = e.target.closest("[data-rpin]");
          if (kbPin) {
            if (kbPin.classList.contains("is-hidden-layer") || kbPin.classList.contains("is-out-zoom")) return;
            var kPinIdx = Number(kbPin.getAttribute("data-rpin"));
            if (regQuizActive) handleRegQuizPinTap(kPinIdx);
            else selectRegPin(kPinIdx);
            return;
          }
        }
        var draggedReg = !!(panMovedReg || (stageDownPt && (Math.abs(e.clientX - stageDownPt.x) > 6 || Math.abs(e.clientY - stageDownPt.y) > 6)));
        panMovedReg = false;
        stageDownPt = null;
        if (e.target.closest("#pregStage")) {
          if (!draggedReg && !multiTouchReg) {
            var directPin = e.target.closest("[data-rpin]");
            if (directPin && (directPin.classList.contains("is-hidden-layer") || directPin.classList.contains("is-out-zoom"))) {
              directPin = null;
            }
            var hitRad = (!isRegMapZoomed && !pieriaZoomed && window.innerWidth <= 768) ? 28 : 30;
            var hitPin = directPin || findClosestEl(pinEls, e.clientX, e.clientY, hitRad, ".preg-pin-dot");
            if (hitPin) {
              var hPinIdx = Number(hitPin.getAttribute("data-rpin"));
              if (regQuizActive) handleRegQuizPinTap(hPinIdx);
              else selectRegPin(hPinIdx);
              return;
            }
            if (!regQuizActive && !isRegMapZoomed && !isPinchZoomed()) {
              openRegMapZoom();
            }
          }
        }
      });

      bindSwipe(
        panelEl,
        function() { if (!regQuizActive) stepRegPin(1); },
        function() { if (!regQuizActive) stepRegPin(-1); }
      );

     jumpToMacroMap = function() {
        stopGrowTour();
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
      };

     observeVisibility(regWrap, function(isVis) {
        regWrap.classList.toggle("is-paused", !isVis);
      });

     selectRegPin(0);
      requestAnimationFrame(function() {
        syncPinPositions();
        if (layerStripEl) layerStripEl.scrollLeft = 0;
        syncRegLayersFade();
      });
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
  '<img class="pvid-poster" fetchpriority="high" src="https://i.ytimg.com/vi/' + vidId + '/maxresdefault.jpg" alt="' + escAttr(vidTitle) + '" decoding="async"/>' +
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

      observeVisibility(vidCont, function(isVis) {
        vidCont.classList.toggle("is-offscreen", !isVis);
        if (!isVis) pauseHeroVideo();
      });

      var missionsList = [
        {
          label: "1. Το πέτρινο κτίριο & τη νέα πτέρυγα",
          icon: "\uD83C\uDFEB",
          msg: "\u2705 Μπράβο! Το πέτρινο διδακτήριο του 1965 ενώνεται στην ίδια αυλή με τη νέα πτέρυγα του 2006!",
        cta: "\uD83E\uDE9E Δες 1926 vs 2026 \u279C",
          go: function() { openCentennialMirror(); }
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
            switchRouteSub("journey", true);
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
            switchRouteSub("journey", true);
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
            switchRouteSub("journey", true);
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

     var defaultHintHtml = '\uD83D\uDDFA\uFE0F <strong>Διαδραστικός Χάρτης 1922\u20131924:</strong> Πάτησε στα σημεία <strong>1\u20135</strong> (ή πάνω στο καράβι και στα κάρα), πάτησε <strong>«\u25B6\uFE0F Δες το ταξίδι να ζωντανεύει»</strong> ή <strong>«\uD83D\uDD0D Μεγέθυνση»</strong> για πλήρη εικόνα!';

      wrap.innerHTML =
        '<div class="ptl22-bar">' +
          '<button type="button" class="ptl22-play-btn" id="ptl22PlayBtn">\u25B6\uFE0F Δες το ταξίδι να ζωντανεύει</button>' +
          '<button type="button" class="ptl22-zoom-btn" id="ptl22ZoomBtn">\uD83D\uDD0D Μεγέθυνση</button>' +
        '</div>' +
       '<div class="ptl22-map-frame" id="ptl22MapFrame">' +
          '<div class="ptl22-map-scroll" id="ptl22MapScroll">' +
            '<div class="ptl22-stage" id="ptl22Stage">' +
              '<svg class="ptl22-svg" viewBox="0 0 1000 568" preserveAspectRatio="none" aria-hidden="true">' +
                /* Αόρατη διόρθωση #1: Κάλυψη ανάποδης πορτοκαλί μύτης βέλους στην Περίσταση Θράκης & συνέχιση διακεκομμένης γραμμής */
                '<polygon points="823,160 845,159 846,181 822,182" fill="#ecebe3" stroke="#ecebe3" stroke-width="2.2" stroke-linejoin="round"/>' +
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
              '<button type="button" class="ptl22-hit-zone" tabindex="-1" data-hspot="1" style="left:87%;top:31%;width:9.5%;height:11.5%" aria-label="Ατμόπλοια 1922" title="Ατμόπλοια «Ωραία Ελλάς» &amp; «Αθήναι»"></button>' +
              '<button type="button" class="ptl22-hit-zone" tabindex="-1" data-hspot="2" style="left:32%;top:21%;width:35%;height:14%" aria-label="Φάλαγγα Κάρων 1922" title="Η Φάλαγγα των Κάρων στη Θράκη"></button>' +
              '<div class="ptl22-reunion" id="ptl22Reunion" style="left:23.3%;top:33.5%">\uD83E\uDD1D Αντάμωμα!</div>' +
              '<span class="ptl22-token" id="ptl22SeaTok">\u26F5</span>' +
              '<span class="ptl22-token ptl22-token--cart" id="ptl22LandTok">\uD83D\uDC0E</span>' +
              '<span class="ptl22-token ptl22-token--pieria" id="ptl22PieriaTok">\uD83C\uDFE1</span>' +
             pinsHtml +
            '</div>' +
          '</div>' +
          '<button type="button" class="ptl22-scroll-zoom-pill" id="ptl22ScrollZoomBtn">\uD83D\uDD0D Ζουμ Χάρτη</button>' +
          '<button type="button" class="ptl22-pan-hint" id="ptl22PanLeftBtn" tabindex="-1">\u2039 Προς Πιερία</button>' +
        '</div>' +
        '<div class="ptl22-chips" id="ptl22Chips">' + chipsHtml + '</div>' +
        '<div class="ptl22-card ptl22-card--hint" id="ptl22Card" aria-live="polite">' + defaultHintHtml + '</div>';

      origLink.parentNode.insertBefore(wrap, origLink);
      var stageEl = document.getElementById("ptl22Stage");
      origLink.tabIndex = -1;
      origImg.draggable = false;
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

   var map22ScrollEl = document.getElementById("ptl22MapScroll");
      var scrollZoomBtn22 = document.getElementById("ptl22ScrollZoomBtn");
      var panLeftBtn22 = document.getElementById("ptl22PanLeftBtn");
      var activeSpot = -1;
      var animRaf = null;
      var isAnimRunning = false;
      var hasFinishedTrails = false;
      var seaLen = 0, landLen = 0, pieriaLen = 0;
      var lastMap22FocusPct = 84.9;
      var progScroll22Until = 0;
      var map22ScrollUserAbort = false;
      var crispMap22Loaded = false;
      var fullHref22 = origLink.getAttribute("href") || "";
      var curSeaFrac = 0, curLandFrac = 0, curPieriaFrac = 0;

      function ensureCrispMap22() {
        if (crispMap22Loaded || !origImg || !fullHref22 || window.innerWidth > 720) return;
        if (origImg.complete && origImg.naturalWidth >= 820) {
          crispMap22Loaded = true;
          return;
        }
        var crispUrl = optImg(fullHref22, 960);
        if (!crispUrl || crispUrl === origImg.src) {
          crispMap22Loaded = true;
          return;
        }
        crispMap22Loaded = true;
        var hiIm = new Image();
        hiIm.decoding = "async";
        hiIm.onload = function() {
          origImg.src = crispUrl;
        };
        hiIm.src = crispUrl;
      }

      function getMap22ScrollLeft(scEl, xPct) {
        var sw = scEl.scrollWidth, cw = scEl.clientWidth;
        if (sw <= cw + 4) return 0;
        var px = ((typeof xPct === "number" ? xPct : 84.9) / 100) * sw;
        return Math.max(0, Math.min(sw - cw, Math.round(px - cw / 2)));
      }

     function syncChips22Fade() {
        if (!chipsStrip) return;
        var maxSc = chipsStrip.scrollWidth - chipsStrip.clientWidth;
        var canSc = maxSc > 6;
        chipsStrip.classList.toggle("is-scrollable", canSc);
        chipsStrip.classList.toggle("has-fade-l", canSc && chipsStrip.scrollLeft > 6);
        chipsStrip.classList.toggle("has-fade-r", canSc && chipsStrip.scrollLeft < maxSc - 6);
      }

      function syncMap22PanHint() {
        if (!panLeftBtn22 || !map22ScrollEl) return;
        var maxSc = map22ScrollEl.scrollWidth - map22ScrollEl.clientWidth;
        var showL = map22ScrollEl.classList.contains("is-mobile-zoom") && !isAnimRunning && activeSpot === -1 && maxSc > 20 && map22ScrollEl.scrollLeft > 95;
        panLeftBtn22.classList.toggle("is-vis", showL);
        panLeftBtn22.tabIndex = showL ? 0 : -1;
      }

      function scrollMap22ToPct(xPct, smooth) {
        if (!map22ScrollEl) return;
        progScroll22Until = performance.now() + (smooth ? 450 : 80);
        if (map22ScrollEl.clientWidth === 0) {
          requestAnimationFrame(function() {
            if (map22ScrollEl && map22ScrollEl.scrollWidth > map22ScrollEl.clientWidth + 4) {
              progScroll22Until = performance.now() + 80;
              map22ScrollEl.scrollLeft = getMap22ScrollLeft(map22ScrollEl, xPct);
              syncMap22PanHint();
            }
          });
          return;
        }
        if (map22ScrollEl.scrollWidth <= map22ScrollEl.clientWidth + 4) {
          syncMap22PanHint();
          return;
        }
        var tLeft = getMap22ScrollLeft(map22ScrollEl, xPct);
        if (smooth && typeof map22ScrollEl.scrollTo === "function") {
          try {
            map22ScrollEl.scrollTo({ left: tLeft, behavior: "smooth" });
            return;
          } catch (e) {}
        }
        map22ScrollEl.scrollLeft = tLeft;
        syncMap22PanHint();
      }

      function repositionVisibleTokens22() {
        if (seaTok && seaTok.classList.contains("is-vis")) {
          placeTokenAt(seaTok, seaPathEl, seaLen, curSeaFrac);
        }
        if (landTok && landTok.classList.contains("is-vis")) {
          placeTokenAt(landTok, landPathEl, landLen, curLandFrac);
        }
        if (pieriaTok && pieriaTok.classList.contains("is-vis")) {
          placeTokenAt(pieriaTok, pieriaPathEl, pieriaLen, curPieriaFrac);
        }
      }

      function toggleMap22MobileZoom(focusXPct) {
        if (!map22ScrollEl || !scrollZoomBtn22) return;
        var nextOn = !map22ScrollEl.classList.contains("is-mobile-zoom");
        if (typeof focusXPct === "number") {
          lastMap22FocusPct = Math.max(0, Math.min(100, focusXPct));
        }
        if (nextOn && isAnimRunning) map22ScrollUserAbort = false;
        map22ScrollEl.classList.toggle("is-mobile-zoom", nextOn);
        scrollZoomBtn22.classList.toggle("is-active", nextOn);
        scrollZoomBtn22.textContent = nextOn ? "\uD83D\uDDFA\uFE0F Όλος ο Χάρτης" : "\uD83D\uDD0D Ζουμ Χάρτη";
        if (nextOn) ensureCrispMap22();
        requestAnimationFrame(function() {
          measureStage22();
          repositionVisibleTokens22();
          if (nextOn) {
            scrollMap22ToPct(lastMap22FocusPct, false);
          } else {
            map22ScrollEl.scrollLeft = 0;
            syncMap22PanHint();
          }
        });
      }

      if (map22ScrollEl) {
        var m22TouchX = 0;
        map22ScrollEl.addEventListener("scroll", function() {
          syncMap22PanHint();
          if (!isAnimRunning && performance.now() > progScroll22Until && map22ScrollEl.classList.contains("is-mobile-zoom") && map22ScrollEl.scrollWidth > map22ScrollEl.clientWidth + 4) {
            lastMap22FocusPct = ((map22ScrollEl.scrollLeft + map22ScrollEl.clientWidth / 2) / map22ScrollEl.scrollWidth) * 100;
          }
        }, { passive: true });
        map22ScrollEl.addEventListener("touchstart", function(e) {
          if (e.touches && e.touches[0]) m22TouchX = e.touches[0].clientX;
        }, { passive: true });
        map22ScrollEl.addEventListener("touchmove", function(e) {
          if (isAnimRunning && e.touches && e.touches[0] && Math.abs(e.touches[0].clientX - m22TouchX) > 10) {
            map22ScrollUserAbort = true;
          }
        }, { passive: true });
        map22ScrollEl.addEventListener("wheel", function() {
          if (isAnimRunning) map22ScrollUserAbort = true;
        }, { passive: true });
        bindDragScroll(map22ScrollEl, function() {
          if (isAnimRunning) map22ScrollUserAbort = true;
        });
      }

      if (scrollZoomBtn22) {
        scrollZoomBtn22.addEventListener("click", function(e) {
          e.stopPropagation();
          toggleMap22MobileZoom(lastMap22FocusPct);
        });
      }

      if (panLeftBtn22) {
        panLeftBtn22.addEventListener("click", function(e) {
          e.stopPropagation();
          lastMap22FocusPct = 22.0;
          scrollMap22ToPct(22.0, true);
        });
      }

    if (chipsStrip) {
        chipsStrip.addEventListener("scroll", syncChips22Fade, { passive: true });
        bindDragScroll(chipsStrip);
      }

      pinBtns.forEach(function(pb, pIdx) {
        pb.addEventListener("focus", function() {
          if (!isAnimRunning && hotspots[pIdx]) {
            lastMap22FocusPct = hotspots[pIdx].px;
            scrollMap22ToPct(hotspots[pIdx].px, true);
          }
        });
      });

      bindDoubleTapZoom(stageEl, ".ptl22-pin, .ptl22-hit-zone", function(clientX) {
        if (window.innerWidth > 720) return false;
        var r = stageEl.getBoundingClientRect();
        var tapPct = (r.width > 0) ? (((clientX - r.left) / r.width) * 100) : lastMap22FocusPct;
        toggleMap22MobileZoom(tapPct);
        return true;
      });

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

      var stageW = 600, stageH = 341;
      function measureStage22() {
        if (!stageEl) return;
        var nw = stageEl.clientWidth || 600;
        var nh = stageEl.clientHeight || Math.round(nw * 0.568);
        var changed = (nw !== stageW || nh !== stageH);
        stageW = nw;
        stageH = nh;
        if (changed) repositionVisibleTokens22();
      }
      if (typeof window.ResizeObserver === "function" && stageEl) {
        var stage22Ro = new ResizeObserver(function() {
          measureStage22();
        });
        stage22Ro.observe(stageEl);
      }
      var syncAspect22 = function() {
        if (origImg && origImg.naturalWidth > 0 && origImg.naturalHeight > 0 && stageEl) {
          var r22 = origImg.naturalWidth / origImg.naturalHeight;
          if (Math.abs(r22 - (1000 / 568)) > 0.02) {
            stageEl.style.aspectRatio = origImg.naturalWidth + " / " + origImg.naturalHeight;
          }
          measureStage22();
          syncMap22PanHint();
        }
      };
      origImg.addEventListener("load", syncAspect22);
      if (origImg.complete) syncAspect22();

      requestAnimationFrame(function() {
        syncMap22PanHint();
        syncChips22Fade();
      });

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
        if (!tokEl || !pathEl || !pathEl.getPointAtLength) return null;
        try {
          var pt = pathEl.getPointAtLength(Math.max(0, Math.min(1, frac)) * len);
          var tx = (pt.x / 1000) * stageW;
          var ty = (pt.y / 568) * stageH;
          tokEl.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) translate(-50%,-50%)";
          return pt;
        } catch (e) {}
        return null;
      }

      stopMap1922Anim = function(keepTrails) {
        if (animRaf) {
          cancelAnimationFrame(animRaf);
          animRaf = null;
        }
        isAnimRunning = false;
        hasFinishedTrails = !!keepTrails;
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
          if (activeSpot === -1 && cardEl && cardEl.classList.contains("ptl22-card--live")) {
            cardEl.className = "ptl22-card ptl22-card--hint";
            cardEl.style.borderColor = "";
            cardEl.style.removeProperty("--p22-c");
            cardEl.innerHTML = defaultHintHtml;
          }
        }
        syncMap22PanHint();
      };

      function clearHotspot() {
        activeSpot = -1;
        pinBtns.forEach(function(b) { b.classList.remove("is-active"); });
        chipBtns.forEach(function(c) { c.classList.remove("is-active"); });
        if (cardEl) {
          cardEl.className = "ptl22-card ptl22-card--hint";
          cardEl.style.borderColor = "";
          cardEl.style.removeProperty("--p22-c");
          cardEl.innerHTML = defaultHintHtml;
        }
        syncMap22PanHint();
      }

      function selectHotspot(idx) {
        stopMap1922Anim(false);
        var clean = (idx + hotspots.length) % hotspots.length;
        activeSpot = clean;
        var h = hotspots[clean];
        lastMap22FocusPct = h.px;
        scrollMap22ToPct(h.px, true);
        syncMap22PanHint();

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
        map22ScrollUserAbort = false;
        pinBtns.forEach(function(b) { b.classList.remove("is-active"); });
        chipBtns.forEach(function(c) { c.classList.remove("is-active"); });

        ensureLengths();
        measureStage22();
        isAnimRunning = true;
        lastMap22FocusPct = 85.0;
        scrollMap22ToPct(85.0, false);
        syncMap22PanHint();
        stageEl.classList.add("is-animating");
        if (playBtn) {
          playBtn.classList.add("is-playing");
          playBtn.textContent = "\u23F8\uFE0F Παύση";
        }
      curSeaFrac = 0; curLandFrac = 0; curPieriaFrac = 0;
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
        var curSeaX = 850, curLandX = 849, curPieriaX = 233;
        var setLivePhase = function(ph, html) {
          if (phaseShown === ph || !cardEl) return;
          phaseShown = ph;
          cardEl.className = "ptl22-card ptl22-card--live";
          cardEl.style.borderColor = "";
          cardEl.style.removeProperty("--p22-c");
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
            curSeaFrac = eSea;
            setStrokeFrac(seaPathEl, seaLen, eSea);
            var ptSea = placeTokenAt(seaTok, seaPathEl, seaLen, eSea);
            if (ptSea) curSeaX = ptSea.x;
            if (uSea >= 1) { seaDone = true; curSeaFrac = 1; }
          }

          if (!landDone) {
            var uLand = Math.min(1, el / 3700);
            var eLand = 0.5 - 0.5 * Math.cos(Math.PI * uLand);
            curLandFrac = eLand;
            setStrokeFrac(landPathEl, landLen, eLand);
            var ptLand = placeTokenAt(landTok, landPathEl, landLen, eLand);
            if (ptLand) curLandX = ptLand.x;
            if (uLand >= 1) { landDone = true; curLandFrac = 1; }
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
            curPieriaFrac = ePieria;
            setStrokeFrac(pieriaPathEl, pieriaLen, ePieria);
            var ptPieria = placeTokenAt(pieriaTok, pieriaPathEl, pieriaLen, ePieria);
            if (ptPieria) curPieriaX = ptPieria.x;
            setLivePhase(4, "\uD83C\uDFE1 <strong>1923\u20131924 \u2022 Νέα Περίσταση Πιερίας:</strong> Οι πρώτες 130 οικογένειες (~500 κάτοικοι) κατεβαίνουν στην Πιερία και ριζώνουν στη θέση «Λημέρι»!");
          }

          var focusSvgX = (el < 4250) ? ((curSeaX + curLandX) * 0.5) : curPieriaX;
          lastMap22FocusPct = focusSvgX / 10;
          if (map22ScrollEl && !map22ScrollUserAbort && map22ScrollEl.scrollWidth > map22ScrollEl.clientWidth + 4) {
            map22ScrollEl.scrollLeft = getMap22ScrollLeft(map22ScrollEl, lastMap22FocusPct);
          }

          if (el < totalMs) {
            animRaf = requestAnimationFrame(step);
          } else {
            animRaf = null;
            curPieriaFrac = 1;
            setStrokeFrac(pieriaPathEl, pieriaLen, 1);
            placeTokenAt(pieriaTok, pieriaPathEl, pieriaLen, 1);
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

     isMap1922Active = function() { return isAnimRunning || hasFinishedTrails || activeSpot !== -1; };
      clearMap1922Spot = function() { stopMap1922Anim(false); clearHotspot(); };
      stepMap1922Spot = function(dir) { if (activeSpot !== -1) selectHotspot(activeSpot + dir); };

    addResizeTask(function(wChanged) {
        if (!wChanged) return;
        if (map22ScrollEl && map22ScrollEl.classList.contains("is-mobile-zoom")) ensureCrispMap22();
        measureStage22();
        repositionVisibleTokens22();
        if (!isAnimRunning) {
          scrollMap22ToPct(lastMap22FocusPct, false);
        }
        syncChips22Fade();
      });

      observeVisibility(wrap, function(isVis) {
        wrap.classList.toggle("is-paused", !isVis);
        if (!isVis && isAnimRunning) {
          stopMap1922Anim(false);
          clearHotspot();
        }
      });

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

    var downPt = null, multiTouch = false, touchMoved22 = false;
      stageEl.addEventListener("touchstart", function(e) {
        multiTouch = !!(e.touches && e.touches.length > 1);
        touchMoved22 = false;
      }, { passive: true });
      stageEl.addEventListener("touchmove", function(e) {
        if (e.touches && e.touches.length > 1) { multiTouch = true; return; }
        if (downPt && e.touches && e.touches[0] && (Math.abs(e.touches[0].clientX - downPt.x) > 8 || Math.abs(e.touches[0].clientY - downPt.y) > 8)) {
          touchMoved22 = true;
        }
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
        var dragged = !!(touchMoved22 || (downPt && (Math.abs(e.clientX - downPt.x) > 6 || Math.abs(e.clientY - downPt.y) > 6)));
        touchMoved22 = false;
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
        if (isAnimRunning) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (activeSpot !== -1) {
          e.preventDefault();
          e.stopPropagation();
          clearHotspot();
          return;
        }
       if (isPinchZoomed() || window.innerWidth <= 720) {
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

   upgradeHeroVideo();
    upgrade1922TimelineMap();
    upgradeRegionalMap();
    requestAnimationFrame(function() {
      upgradeNeighborhoodMap();
      upgradeTwinMapsPortal();
    });
  })();
