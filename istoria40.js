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
    var openPopulationAtYear = function() {};
    var closeRegMapZoom = function() {};
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
        var targetTop = Math.max(0, modalBody.scrollTop + (eRect.top - bRect.top) - 12);
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
        ".pfac-map-node circle{transition:stroke-width .15s}" +
        ".pfac-map-node:hover circle{stroke-width:4.5px}" +
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
        ".pfac-map-status-left{display:flex;align-items:center;gap:10px;flex:1 1 240px}" +
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
       ".pexp-modal-body,#pexpModalBody,#pexpImgZoom,.pfac-map-modal-bg,.pfac-map-wrap.is-zoomed{overscroll-behavior:auto!important;touch-action:auto!important}" +
       "@media (max-width:720px){.pexp-modal-topbar{flex-wrap:nowrap!important;align-items:center;gap:8px}#pexpTabs{flex:1 1 auto;min-width:0;display:flex;flex-wrap:nowrap!important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;padding-bottom:2px}#pexpTabs.has-fade-r{-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent 100%);mask-image:linear-gradient(90deg,#000 88%,transparent 100%)}#pexpTabs.has-fade-l{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%)}#pexpTabs.has-fade-l.has-fade-r{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 90%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 90%,transparent 100%)}#pexpTabs::-webkit-scrollbar{display:none}#pexpTabs .pexp-tab-btn{flex:0 0 auto;white-space:nowrap;font-size:12.5px;padding:7px 11px}#pexpCloseBtn{flex-shrink:0}}" +
       "@keyframes pregDashFlow{to{stroke-dashoffset:-28}}" +
        "@keyframes pregBridgeWave{0%{box-shadow:0 0 0 0 rgba(30,108,255,.65)}100%{box-shadow:0 0 0 36px rgba(30,108,255,0)}}" +
        ".pfac-map-modal-bg{z-index:2147483644!important}" +
        ".preg-modal-bg{position:fixed;inset:0;z-index:2147483644;background:rgba(15,23,42,.84);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:12px;overscroll-behavior:auto!important;touch-action:auto!important}" +
        ".preg-modal-bg.is-open{display:flex}" +
        ".preg-wrap{margin:6px 0 26px;padding:15px;border-radius:22px;border:2px solid #93c5fd;background:linear-gradient(180deg,#f0f9ff 0%,#ffffff 100%);box-shadow:0 10px 28px rgba(15,23,42,.07);text-align:left;box-sizing:border-box}" +
        ".preg-wrap.is-zoomed{width:min(96vw,1480px);max-height:93vh;overflow-y:auto;margin:0;box-shadow:0 26px 65px rgba(0,0,0,.52);overscroll-behavior:auto!important;touch-action:auto!important}" +
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
       ".preg-stage{position:relative;width:100%;aspect-ratio:1000/527;border-radius:16px;overflow:hidden;border:2px solid #bae6fd;background:#dbeafe;user-select:none;cursor:zoom-in;touch-action:auto!important}" +
       ".preg-wrap.is-zoomed .preg-stage{cursor:default}" +
        "@media (min-width:701px){.preg-wrap.is-zoomed .preg-stage{width:min(100%,calc((92vh - 165px) * 1.89));margin:0 auto}}" +
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
        ".pexp-race-flag{position:absolute;right:-6px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1;opacity:.65;pointer-events:none}" +
        ".pexp-race-badge{display:block;min-height:18px;font-size:11.5px;font-weight:800;color:#64748b;margin-top:4px}" +
       ".pexp-vehicle-card.is-finished{border-color:#34d399!important;box-shadow:0 8px 20px rgba(16,185,129,.16)!important}" +
        ".pexp-vehicle-card.is-finished .pexp-race-badge{color:#047857}" +
        ".pexp-modal-overlay{height:100vh!important;height:100dvh!important}" +
        ".pexp-modal-box{max-height:91vh!important;max-height:91dvh!important}" +
        ".pexp-img-zoom img{max-height:80vh!important;max-height:80dvh!important}" +
        ".pfac-map-wrap.is-zoomed{max-height:92vh!important;max-height:92dvh!important}" +
        ".pfac-map-wrap.is-zoomed .pfac-map-svg{max-height:calc(92vh - 135px)!important;max-height:calc(92dvh - 135px)!important}" +
        ".preg-wrap.is-zoomed{max-height:93vh!important;max-height:93dvh!important}" +
        "@media (min-width:701px){.preg-wrap.is-zoomed .preg-stage{width:min(100%,calc((92dvh - 165px) * 1.89))}}" +
        ".preg-pin::before{inset:-4px}" +
        ".preg-pin.is-selected::before{display:none}" +
        ".preg-pin:hover{z-index:12}" +
        "#pexpRouteThumbs{grid-template-columns:repeat(5,minmax(0,1fr))!important}" +
        "#pexpChurchThumbs{grid-template-columns:repeat(2,minmax(0,1fr))!important}" +
        "#pexpPopChips{grid-template-columns:repeat(6,minmax(0,1fr))!important}" +
        ".pexp-mirror-stone,.pexp-capsule-stone{grid-column:span 3!important;padding:8px 10px!important}" +
        ".pexp-slider{min-height:30px;touch-action:pan-y}" +
        "@media (max-width:768px){.school-history-wrapper,.village-identity,.info-card,.pexp-modal-overlay,.preg-modal-bg,.pexp-era-strip,.preg-zoom-pill,.preg-ruler-float{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.village-identity{background:rgba(241,245,249,.9)!important}.info-card{background:rgba(255,255,255,.95)!important}.pexp-modal-overlay,.preg-modal-bg{background:rgba(15,23,42,.88)!important}}" +
        "@media (max-width:720px){.pexp-modal-box{max-height:94vh!important;max-height:94dvh!important}#pexpPopChips{grid-template-columns:repeat(4,minmax(0,1fr))!important}.pexp-mirror-stone,.pexp-capsule-stone{grid-column:1/-1!important}}" +
        "@media (max-width:640px){#pexp-pane-population .pexp-kid-heading{margin-bottom:10px}#pexp-pane-population .pexp-kid-heading h3{font-size:1.08rem}#pexp-pane-population .pexp-kid-heading p{font-size:.86rem}.pexp-meadow-scene{padding:10px!important;margin-bottom:10px!important;border-radius:18px!important}.pexp-sky-stats{display:grid!important;grid-template-columns:1fr 1fr;gap:6px!important;margin-bottom:8px!important}.pexp-big-year,.pexp-big-pop,.pexp-mult-pill,.pexp-bus-pill{font-size:.84rem!important;padding:5px 8px!important;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pexp-era-strip{padding:6px 8px;margin-bottom:8px;gap:5px}.pexp-era-now{font-size:11.5px;line-height:1.3}.pexp-era-steps{width:100%;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px}.pexp-era-steps::-webkit-scrollbar{display:none}.pexp-era-step{flex:0 0 auto;font-size:11px;padding:3px 8px}.pexp-houses-grid{min-height:66px!important;gap:6px!important;padding:4px 2px!important}.pexp-house-big{width:34px!important;height:34px!important;font-size:18px!important;border-radius:10px!important}.pexp-roots-bar{margin-top:8px!important;padding-top:8px!important;gap:5px!important}.pexp-root-badge{font-size:11px!important;padding:4px 9px!important}.pexp-time-controls{padding:10px 12px!important;margin-bottom:10px!important}.pexp-slider-line{flex-direction:row!important;align-items:center!important;gap:10px!important;margin-bottom:10px!important}.pexp-play-btn{font-size:12.5px!important;padding:8px 12px!important}#pexpSubToday .pexp-vehicles-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}#pexpSubToday .pexp-vehicle-card{padding:10px 8px!important;border-radius:14px!important}#pexpSubToday .pexp-vehicle-emoji{font-size:24px!important;margin-bottom:2px!important}#pexpSubToday .pexp-vehicle-val{font-size:.98rem!important}.pexp-comp-media,.pfac-card-photo-wrap{flex:1 1 100%!important;width:100%!important}.pexp-comp-photo,.pfac-card-photo{width:100%!important;height:168px!important}.preg-pin{width:21px!important;height:21px!important}.preg-pin--home{width:26px!important;height:26px!important}.preg-pin-dot{font-size:11px!important}.preg-pin--home .preg-pin-dot{font-size:13px!important}.pexp-zoom-close{top:max(14px,env(safe-area-inset-top,14px));right:14px}.pexp-zoom-nav{width:38px;height:38px;font-size:21px}.pexp-zoom-prev{left:8px}.pexp-zoom-next{right:8px}}";
      document.head.appendChild(extraCss);
    }

    function optImg(url, maxDim) {
      if (!url || typeof url !== "string" || url.indexOf("data:") === 0) return url;
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
      var wmMatch = url.match(/^https?:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[0-9a-f]\/[0-9a-f]{2}\/([^?#]+)$/i);
      if (wmMatch && wmMatch[1]) {
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + wmMatch[1] + "?width=" + wStep;
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
        if (txt.indexOf("1952") !== -1 || txt.indexOf("1965") !== -1 || txt.indexOf("1925") !== -1) {
          var lnk = tlBoxes[i].querySelector("a.image-link");
          var im = tlBoxes[i].querySelector("a.image-link img");
          var url = (lnk && lnk.getAttribute("href")) || (im && im.src) || "";
          if (url) return url;
        }
      }
      return "https://commons.wikimedia.org/wiki/Special:FilePath/Schiefertafel_Wien_um_1900_%C3%96MV.jpg?width=700";
    })();

    var schoolMirrorScenes = [
      {
        tab: "\uD83C\uDFEB 1. Η Αίθουσα",
        oldIcons: "\uD83E\uDDF1 \uD83D\uDD25 \uD83E\uDEB5",
        oldImg: oldSchoolImgUrl,
        oldCap: "Το παλιό ιστορικό διδακτήριο του Δημοτικού Σχολείου Περίστασης",
        oldTitle: "Πλίνθινη Αίθουσα & Ξυλόσομπα",
        oldDesc: "Μικρή τάξη με τούβλα από χώμα και άχυρο! Δύο-τρεις τάξεις έκαναν μάθημα μαζί (συνδιδασκαλία) σε ξύλινα θρανία και ζεσταίνονταν με την ξυλόσομπα, όπου κάθε παιδί έφερνε κι ένα κούτσουρο από το σπίτι.",
        newIcons: "\uD83C\uDFEB \uD83D\uDDA5\uFE0F \uD83C\uDFA8",
        newImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        newCap: "Το σύγχρονο 12/θέσιο Δημοτικό Σχολείο Περίστασης από ψηλά",
        newTitle: "12/θέσιο Σύγχρονο Διδακτήριο",
        newDesc: "Μεγάλο, φωτεινό σχολείο με πέτρινο κτίριο και νέα πτέρυγα! Έχουμε 12 τμήματα, διαδραστικούς πίνακες, εργαστήριο υπολογιστών, αίθουσα ζωγραφικής, μουσικής, ολοήμερου και μεγάλη αίθουσα εκδηλώσεων!"
      },
      {
        tab: "\uD83C\uDF92 2. Η Σχολική Τσάντα",
        oldIcons: "\uD83E\uDDF6 \uD83E\uDEA8 \uD83D\uDCD6",
        oldImg: "https://commons.wikimedia.org/wiki/Special:FilePath/Schiefertafel_Wien_um_1900_%C3%96MV.jpg?width=700",
        oldCap: "Παλιά μαύρη πέτρινη πλάκα γραφής μαθητή (περίπου 1900\u20131926)",
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
        oldIcons: "\uD83E\uDDF6 \uD83C\uDFC3 \uD83E\uDEA8",
        oldImg: "https://commons.wikimedia.org/wiki/Special:FilePath/Marbles.JPG?width=700",
        oldCap: "Γυάλινοι βόλοι: το αγαπημένο παιχνίδι στην αλάνα του παλιού σχολείου",
        oldTitle: "Πάνινο Τόπι & Βόλοι στην Αλάνα",
        oldDesc: "Στη χωμάτινη αυλή έπαιζαν γυάλινους βόλους, κουτσό χαραγμένο με κεραμίδι στο χώμα, σχοινάκι, τυφλόμυγα και ποδόσφαιρο με «τόπι» φτιαγμένο από παλιά πανιά δεμένα σφιχτά!",
        newIcons: "\uD83C\uDFC0 \uD83C\uDFD0 \u265F\uFE0F",
        newImg: "https://commons.wikimedia.org/wiki/Special:FilePath/ChessStartingPosition.jpg?width=700",
        newCap: "Σκάκι & ομαδικά αθλήματα: 2η θέση στα Δημοτικά Κατερίνης!",
        newTitle: "Γήπεδα, Γυμναστήριο & Πρωτιές στο Σκάκι",
        newDesc: "Μεγάλη ασφαλής αυλή με γήπεδα μπάσκετ, ποδοσφαίρου και βόλεϊ, κλειστό γυμναστήριο και σκακιέρες \u2014 με το σχολείο μας στη 2η θέση στο σκάκι ανάμεσα στα Δημοτικά όλης της Κατερίνης!"
      },
      {
        tab: "\uD83D\uDD14 4. Μάθημα & Κολατσιό",
        oldIcons: "\uD83D\uDD14 \uD83D\uDD8B\uFE0F \uD83C\uDF5E",
        oldImg: "https://commons.wikimedia.org/wiki/Special:FilePath/Handbell.jpg?width=700",
        oldCap: "Παραδοσιακό μπρούτζινο κουδούνι χειρός του δασκάλου",
        oldTitle: "Μπρούτζινο Κουδούνι, Μελάνι & Ψωμί",
        oldDesc: "Ο δάσκαλος χτυπούσε το κουδούνι με το χέρι! Τα μεγαλύτερα παιδιά έγραφαν καλλιγραφία με πένα και μελανοδοχείο, πότιζαν τον σχολικό κήπο και έτρωγαν ζυμωτό ψωμί με τυρί ή ελιές.",
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
            '<img class="pexp-era-photo" src="' + optImg(sc.oldImg, 640) + '" data-full-src="' + sc.oldImg + '" alt="' + sc.oldCap + '" data-m-zoom="0" loading="lazy"/>' +
            '<h5 class="pexp-era-title">' + sc.oldTitle + '</h5>' +
            '<p class="pexp-era-desc">' + sc.oldDesc + '</p>' +
          '</div>';

        var card2026 =
          '<div class="pexp-era-card pexp-era-2026">' +
            '<div class="pexp-era-head">' +
              '<span class="pexp-era-yr">\uD83D\uDE80 2026 \u2022 Σήμερα στο 12/Θ</span>' +
              '<span class="pexp-era-icons">' + sc.newIcons + '</span>' +
            '</div>' +
            '<img class="pexp-era-photo" src="' + optImg(sc.newImg, 640) + '" data-full-src="' + sc.newImg + '" alt="' + sc.newCap + '" data-m-zoom="1" loading="lazy"/>' +
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
          openZoomWithList([
            { src: scNow.oldImg, thumb: optImg(scNow.oldImg, 640), caption: "1926 \u2022 " + scNow.oldCap },
            { src: scNow.newImg, thumb: optImg(scNow.newImg, 640), caption: "2026 \u2022 " + scNow.newCap }
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
      return !!(window.visualViewport && window.visualViewport.scale > 1.05);
    }

    function findClosestEl(nodeList, clientX, clientY, maxDist, subSel) {
      if (!nodeList || typeof clientX !== "number" || typeof clientY !== "number") return null;
      if (clientX === 0 && clientY === 0) return null;
      var best = null, bestD2 = maxDist * maxDist;
      for (var i = 0; i < nodeList.length; i++) {
        var el = nodeList[i];
        if (el.classList.contains("is-hidden-layer")) continue;
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
        var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
        ignore = (tag === "input" || tag === "select" || tag === "textarea" || hasHorizontalScroll(e.target, el));
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

    var blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

   function closeZoom(fromPopState) {
      if (!zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
      zoomOverlay.classList.remove("is-open");
      if (!modal.classList.contains("is-open") && !isMapZoomed && !isRegMapZoomed) {
        document.body.style.overflow = "";
      }
      var needBack = (!fromPopState && histZoomOpen);
      histZoomOpen = false;
      if (needBack) {
        try { window.history.back(); } catch (e) {}
      }
    }

    if (zoomOverlay) {
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
      zoomOverlay.addEventListener("pointerdown", function(e) {
        zDownPt = (e.isPrimary !== false) ? { x: e.clientX, y: e.clientY } : null;
      }, { passive: true });
      zoomCloseBtn.addEventListener("click", function(e) { e.stopPropagation(); closeZoom(false); });
      zoomPrevBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(-1); });
      zoomNextBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(1); });
      zoomOverlay.addEventListener("click", function(e) {
        if (isPinchZoomed()) return;
        if (zDownPt && (Math.abs(e.clientX - zDownPt.x) > 8 || Math.abs(e.clientY - zDownPt.y) > 8)) return;
        closeZoom(false);
      });
      bindSwipe(zoomOverlay, function() { stepZoom(1); }, function() { stepZoom(-1); });

    function openZoomWithList(list, startIndex) {
      if (!list || !list.length || !zoomOverlay) return;
      var wasOpen = zoomOverlay.classList.contains("is-open");
      zoomList = list;
      zoomIdx = (startIndex >= 0 && startIndex < list.length) ? startIndex : 0;
      if (document.body.lastElementChild !== zoomOverlay) {
        document.body.appendChild(zoomOverlay);
      }
      renderZoomItem();
      zoomOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";

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
      if (zoomTarget) {
        var token = ++zoomLoadToken;
        var fullUrl = optZoomUrl(item.src);
        var rawClean = cleanRawUrl(item.src);
        var previewUrl = item.thumb || "";
        zoomTarget.onerror = function() {
          if (rawClean && this.src !== rawClean) {
            this.src = rawClean;
          } else if (previewUrl && this.src !== previewUrl) {
            this.src = previewUrl;
          } else if (this.src !== fallbackSvg) {
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
          var capTxt = (dateTxt && altTxt) ? (dateTxt + " \u2022 " + altTxt) : (altTxt || dateTxt);
          pList.push({ src: srcUrl, thumb: thumbUrl, caption: capTxt });
        });

      openZoomWithList(pList, clickedIdx);
      });
    });

   var timelineEvents = historyWrap.querySelectorAll(".timeline-event");
    var tlDefaultYears = [1924, 1926, 1965, 1981];
    timelineEvents.forEach(function(evEl, idx) {
      if (evEl.querySelector(".pexp-tl-actions")) return;
      var dateSpan = evEl.querySelector(".timeline-date");
      var dateTxt = dateSpan ? dateSpan.textContent : "";
      var targetYr = tlDefaultYears[idx] || 1924;
      if (dateTxt.indexOf("1952") !== -1 || dateTxt.indexOf("1965") !== -1) targetYr = 1965;
      else if (dateTxt.indexOf("1925") !== -1 || dateTxt.indexOf("1926") !== -1) targetYr = 1926;
      else if (dateTxt.indexOf("1981") !== -1) targetYr = 1981;
      else if (dateTxt.indexOf("1922") !== -1 || dateTxt.indexOf("1924") !== -1) targetYr = 1924;

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
    function syncTabsFadeHint() {
      if (!tabsStripEl) return;
      var maxSc = tabsStripEl.scrollWidth - tabsStripEl.clientWidth;
      tabsStripEl.classList.toggle("has-fade-l", maxSc > 6 && tabsStripEl.scrollLeft > 6);
      tabsStripEl.classList.toggle("has-fade-r", maxSc > 6 && tabsStripEl.scrollLeft < maxSc - 6);
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
        if (!skipAutoInit && !routeReady) renderStop(4);
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
      }
    });

    window.openPeristasiModal = function(initialTab, skipAutoInit) {
      var replaceTopEntry = (histZoomOpen || histMapOpen || histRegMapOpen) && !histModalOpen;
      histZoomOpen = false;
      if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        zoomOverlay.classList.remove("is-open");
      }
      if (isMapZoomed) closeMapZoom(true);
      if (isRegMapZoomed) closeRegMapZoom(true);
      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      if (zoomOverlay && document.body.lastElementChild !== zoomOverlay) document.body.appendChild(zoomOverlay);

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (!skipAutoInit && initialTab === "route" && subBtns && subBtns[0] && subJourney && subJourney.style.display === "none") {
        subBtns[0].click();
      }
      activateTab(initialTab || "population", !!skipAutoInit);

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
      document.body.style.overflow = "";

      var stepsBack = 0;
      if (!fromPopState) {
        if (histZoomOpen) stepsBack++;
        if (histModalOpen) stepsBack++;
      }
      histZoomOpen = false;
      histModalOpen = false;
      if (stepsBack > 0) {
        try { window.history.go(-stepsBack); } catch (e) {}
      }
    }

    on("pexpCloseBtn", "click", function() { closePeristasiModal(false); });
    var modalBackdropDown = false;
    modal.addEventListener("mousedown", function(e) {
      modalBackdropDown = (e.target === modal);
    });
    modal.addEventListener("click", function(e) {
      if (modalBackdropDown && e.target === modal) closePeristasiModal(false);
      modalBackdropDown = false;
    });
   document.addEventListener("keydown", function(e) {
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
        } else if (activeFacIdx !== -1) {
          closeFacilityCard();
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
        } else if (currentTab === "population" && activeFacIdx !== -1 && modal.contains(pfacStage)) {
          e.preventDefault();
          openFacilityCard(activeFacIdx + dir, false);
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

      if (activeFacIdx !== -1 && pfacStage) {
        var stRect = pfacStage.getBoundingClientRect();
        if (stRect.bottom > 0 && stRect.top < window.innerHeight) {
          e.preventDefault();
          openFacilityCard(activeFacIdx + dir, false);
        }
      }
    });
    window.addEventListener("popstate", function() {
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
    });

    document.querySelectorAll(".pexp-card-trigger").forEach(function(card) {
      card.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

   var censusData = [
      { year: 1924, pop: 130, story: "1924: Οι πρώτοι 130 Περιστασιανοί πρόσφυγες από την Ανατολική Θράκη φτάνουν εδώ! Φτιάχνουν τα πρώτα τους σπιτάκια, την εκκλησία του Αη-Γιώργη και το πρώτο μικρό πλίνθινο σχολείο." },
      { year: 1926, pop: 375, story: "1926: Στεγάζεται στη σημερινή του θέση το νέο σχολείο μας με 3 αίθουσες, γραφείο και αποθήκη \u2014 η αρχή μιας ιστορίας 100 χρόνων (1926\u20132026)!" },
      { year: 1928, pop: 616, story: "1928: Στο χωριό ζουν πια 166 προσφυγικές οικογένειες (616 κάτοικοι)! Φέρνουν μαζί τους και το όμορφο έθιμο της εικόνας του Αγίου Μόδεστου, που φιλοξενείται από σπίτι σε σπίτι." },
      { year: 1940, pop: 936, story: "1940: Το χωριό μεγαλώνει στα 936 άτομα και τα χωράφια γεμίζουν ζωή. Στον Β' Παγκόσμιο Πόλεμο φιλοξενούνται εδώ Νεοζηλανδοί στρατιώτες, ενώ στην Κατοχή το χωριό θρηνεί 14 ήρωες κατοίκους." },
      { year: 1951, pop: 1071, story: "1951: Ξεπερνάμε τους 1.000 κατοίκους! Στην Περίσταση έρχονται να ζήσουν οικογένειες από τα ορεινά Σκοτεινά Πιερίας, καθώς και οικογένειες Βλάχων." },
      { year: 1961, pop: 1130, story: "1961: Με 1.130 κατοίκους, θεμελιώνεται το νέο διδακτήριο του σχολείου μας που χτίζεται με πέτρα!" },
      { year: 1965, pop: 1148, story: "1965: Ολοκληρώνεται ο Α' όροφος πάνω από το πέτρινο ισόγειο (1963) και τα παιδιά μπαίνουν στο επιβλητικό διώροφο πέτρινο σχολείο μας!" },
      { year: 1971, pop: 1176, story: "1971: Έρχονται στο χωριό μας Έλληνες Πόντιοι από την πρώην Σοβιετική Ένωση! Παράλληλα φτιάχνονται οι δύο πρώτες ποδοσφαιρικές ομάδες, ο «Όλυμπος» και η «Αναγέννηση»." },
      { year: 1981, pop: 1491, story: "1981: Φτάνουμε τους 1.491 κατοίκους! Οι δύο ομάδες ενώνονται στην αγαπημένη μας Α.Ε. Περίστασης (Α.Ε.Π.) και στο σχολείο μας φιλοξενείται και το Γυμνάσιο." },
      { year: 1991, pop: 1730, story: "1991: Νέες οικογένειες Ποντίων από τη Γεωργία, την Αρμενία, τη Ρωσία και το Καζακστάν ριζώνουν στην Περίσταση και οι γειτονιές γεμίζουν παιδιά (1.730 κάτοικοι)!" },
      { year: 2001, pop: 2232, story: "2001: Το χωριό ξεπερνά τις 2.200 ψυχές και ιδρύεται ο Πολιτιστικός Σύλλογος Ανατολικοθρακών Περίστασης!" },
      { year: 2006, pop: 2389, story: "2006: Προστίθεται η σύγχρονη νέα πτέρυγα του 12/θέσιου Δημοτικού μας, με αίθουσες υπολογιστών, βιβλιοθήκης, εκδηλώσεων και ολοήμερου!" },
      { year: 2011, pop: 2545, story: "2011: Το μεγάλο ρεκόρ της Περίστασης με 2.545 κατοίκους (\u00D719,6 φορές περισσότεροι από το 1924)! Το χωριό μας ανήκει πλέον στον Δήμο Κατερίνης." },
      { year: 2021, pop: 2367, story: "Σήμερα (2.367 κάτοικοι): Ένα ζωντανό, μεγάλο χωριό με Παιδικό Σταθμό, Νηπιαγωγείο, το 12/θέσιο Δημοτικό μας, Γυμνάσιο και γήπεδα, όπου Θρακιώτες, Πόντιοι, Βλάχοι και Σκοτεινιώτες είμαστε μια αγκαλιά!" }
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
        '<span class="pexp-house-big pexp-house-landmark pexp-lm-extra" id="pexpLm2006" data-lm="wing2006" style="display:none" title="2006: Νέα Πτέρυγα &amp; Εργαστήρια 12/Θ">\uD83D\uDDA5\uFE0F</span>';
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

      if (yearVal) yearVal.textContent = "\uD83D\uDCC5 " + yr;
      if (popVal) popVal.textContent = formattedPop + " κάτοικοι";

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
            lmSchoolEl.title = "2006\u2013Σήμερα: 12/θέσιο Σχολείο με Νέα Πτέρυγα!";
          }
        }
        if (lm1981El) lm1981El.style.display = (yr >= 1981) ? "inline-flex" : "none";
        if (lm2006El) lm2006El.style.display = (yr >= 2006) ? "inline-flex" : "none";

        if (eraNowEl) {
          var eraMapTxt = {
            "1924": "\uD83E\uDDF1 Τοπίο 1924: Πλίνθινο σχολείο, πρώτα χωράφια & χωματόδρομοι",
            "1965": "\uD83C\uDFDB\uFE0F Τοπίο 1965: Χτίζεται με πέτρα το διώροφο διδακτήριο!",
            "1981": "\u26BD Τοπίο 1981: Προστίθενται Γήπεδα (Α.Ε.Π.) & Γυμνάσιο!",
            "2006": "\uD83C\uDFEB\u2728 Τοπίο 2006+: Νέα Πτέρυγα, εργαστήρια & σύγχρονο 12/Θ!"
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
        } else if (yr >= 1965 && hIdx >= 7) {
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

      if (popStory) popStory.textContent = info.story;
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
    var capsuleOpen = false;
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
    var mirrorModalBox = null;

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
          popStory.textContent = "1926\u20132026: Ένας αιώνας από το πρώτο μας σχολείο! Τώρα η σκυτάλη περνάει σε εσάς: φτιάξε παρακάτω τη Χρονοκάψουλα της Περίστασης για τους μαθητές του 2126!";
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
        desc: "Οι πρόσφυγες προπαππούδες μας από την παλιά Περίσταση της Προποντίδας έφεραν το έθιμο της εικόνας του Αγίου Μόδεστου, τη θρακιώτικη γκάιντα, τον ζωηρό χορό «Ζωναράδικο» και τις νόστιμες θρακιώτικες πίτες!",
        photos: [
          { src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/%C5%9Eark%C3%B6yden_Marmara_Adas%C4%B1.jpg", cap: "Η ακτή της παλιάς Περίστασης στην Προποντίδα" },
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/20091212_Gkaintes_Didymoteixo_Evros_1.jpg?width=640", cap: "Παραδοσιακές Θρακιώτικες Γκάιντες" }
        ],
        tags: ["\uD83D\uDDBC\uFE0F Έθιμο Αγ. Μόδεστου", "\uD83D\uDC83 Χορός Ζωναράδικο", "\uD83E\uDD67 Θρακιώτικες Πίτες & Κουσκούσι"]
      },
      vlach: {
        minYear: 1951,
        title: "\uD83D\uDFE7 Σκοτεινά Πιερίας & Βλάχοι (1947\u20131951)",
        accent: "#c2410c", border: "#fdba74", bg: "#fff7ed",
        desc: "Οι οικογένειες από τα ορεινά Σκοτεινά (Μόρνα) και οι Βλάχοι έφεραν την αγάπη για το βουνό των Πιερίων, τους λεβέντικους κυκλικούς χορούς στα πανηγύρια, την τέχνη των υφαντών και τις παραδοσιακές χορτόπιτες!",
        photos: [
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stone_bridge_of_old_Morna.jpg?width=640", cap: "Το πέτρινο γεφύρι της παλιάς Μόρνας (Σκοτεινά Πιερίας)" },
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Loom_2,_Lesbos_(Skala_Sykamias).jpg?width=640", cap: "Παραδοσιακός ξύλινος αργαλειός & υφαντά" }
        ],
        tags: ["\u26F0\uFE0F Ορεινή Παράδοση Πιερίων", "\uD83E\uDDF6 Υφαντά & Κεντήματα", "\uD83C\uDFB6 Κύκλιοι Χοροί"]
      },
      pontic: {
        minYear: 1971,
        title: "\uD83D\uDFE9 Ελληνισμός του Πόντου (1965 & 1990)",
        accent: "#047857", border: "#6ee7b7", bg: "#ecfdf5",
        desc: "Οι Πόντιοι συγχωριανοί μας ζωντάνεψαν τις γειτονιές με τον ήχο της ποντιακής λύρας (κεμεντζέ), τους περήφανους χορούς «Τικ», «Κότσαρι» και «Σέρα» και αγαπημένα εδέσματα όπως τα πιροσκί και τα ωτία!",
        photos: [
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kemenches,Flute_and_Drum_from_Pontus_Benaki.jpg?width=640", cap: "Ποντιακές λύρες (κεμεντζέδες) & νταούλι (Μουσείο Μπενάκη)" },
          { src: "https://commons.wikimedia.org/wiki/Special:FilePath/2_Pontic_Female_Folk_Costumes_Benaki.jpg?width=640", cap: "Αυθεντικές Ποντιακές παραδοσιακές φορεσιές" }
        ],
        tags: ["\uD83C\uDFBB Ποντιακή Λύρα", "\uD83D\uDD25 Χοροί Σέρα & Κοτσαρί", "\uD83E\uDD5F Πιροσκί, Ωτία & Σορβάς"]
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
        desc: "Από το πρώτο μικρό πλίνθινο σχολείο με τις 2 αίθουσες, στο πέτρινο διδακτήριο του 1965 και στο σημερινό 12/θέσιο σχολείο μας!",
        photos: [
          { src: oldSchoolImgUrl, cap: "Το παλιό ιστορικό διδακτήριο του σχολείου μας" },
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png", cap: "Το σημερινό 12/θέσιο Δημοτικό Σχολείο μας" }
        ],
       tags: ["\uD83C\uDF82 100 Χρόνια Παιδείας", "\uD83D\uDCD6 4 Γενιές Μαθητών"]
      },
      gym1981: {
        minYear: 1981,
        title: "\u26BD\uD83D\uDCDA 1981: Γυμνάσιο & Αθλητισμός στην Περίσταση",
        accent: "#059669", border: "#6ee7b7", bg: "#ecfdf5",
        desc: "Από το 1981 το σχολείο μας φιλοξενεί το νεοϊδρυθέν Γυμνάσιο Περίστασης (έως το 1992 που απέκτησε δικό του κτίριο), ενώ οι γειτονιές αποκτούν γήπεδα και η Α.Ε. Περίστασης ενώνει όλο το χωριό!",
        photos: [
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhem0YTAbyft3JVlU9TGnM6JTH0vezjswsuumIS0CJ5ssqZX_MiEAfYjwSzz0qjazangq56oBm_zsEiQoODZwDz4FJmiCq-AAxI4srFAveSfug5HhXoLi421BUJcYAeJf7Np-Mc2Irjp6t0TqaZn4yp2H0Rt9L6CfaTZS00Fd8VUEXaVw8I0dD-rQxq9PA/s1964/2026-11-20%2022_55_31-NVIDIA%20GeForce%20Overlay.png", cap: "Το Γήπεδο της Α.Ε. Περίστασης" }
        ],
        tags: ["\uD83D\uDCDA Ίδρυση Γυμνασίου (1981)", "\u26BD Ένωση Α.Ε.Π.", "\uD83C\uDFC0 Αθλητικές Αυλές"]
      },
      wing2006: {
        minYear: 2006,
        title: "\uD83D\uDDA5\uFE0F\u2728 2005\u20132006: Νέα Πτέρυγα & Σύγχρονο 12/θέσιο",
        accent: "#d97706", border: "#fcd34d", bg: "#fffbeb",
        desc: "Με τη νέα πτέρυγα του 2005\u20132006 το σχολείο μας αποκτά εργαστήριο υπολογιστών, βιβλιοθήκη, αίθουσες ζωγραφικής, ολοήμερου και εκδηλώσεων, λειτουργώντας πλέον ως σύγχρονο 12/θέσιο!",
        photos: [
          { src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png", cap: "Το σύγχρονο 12/θέσιο Δημοτικό Σχολείο Περίστασης" }
        ],
        tags: ["\uD83D\uDDA5\uFE0F Εργαστήριο Η/Υ & Ρομποτική", "\uD83D\uDCDA Ψηφιακή Βιβλιοθήκη", "\uD83C\uDFEB Ολοήμερο 12/Θ"]
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
              '<img src="' + optImg(ph.src, 320) + '" data-full-src="' + ph.src + '" alt="' + ph.cap + '" loading="lazy"/>' +
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
    var subBtns = document.querySelectorAll("#pexpRouteSubSwitch .pexp-subswitch-btn");
    var subJourney = document.getElementById("pexpSubJourney");
    var subToday = document.getElementById("pexpSubToday");

   subBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        stopRouteAutoplay();
        stopCartGame();
        var target = btn.getAttribute("data-sub");
        subBtns.forEach(function(b) { b.classList.toggle("is-active", b === btn); });
        if (subJourney) subJourney.style.display = (target === "journey") ? "block" : "none";
        if (subToday) subToday.style.display = (target === "today") ? "block" : "none";
        if (target === "journey" && !routeReady) renderStop(4);
      });
    });

   var routePhotos = [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/%C5%9Eark%C3%B6yden_Marmara_Adas%C4%B1.jpg",
        alt: "1. Η ακτή της παλιάς Περίστασης (Σάρκιοϊ) στην Προποντίδα"
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/Evros_river.jpg?width=800",
        alt: "2. Ο ποταμός Έβρος: το πέρασμα των οικογενειών στη Δυτική Θράκη"
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/20160513_026_kavala.jpg?width=800",
        alt: "3. Λιμάνι Καβάλας & Αιγαίο: το ταξίδι με τα πλοία και τα 18 κιβώτια κειμηλίων"
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
        badge: "Σταθμός 1 από 5 \u2022 Αφετηρία",
        title: "1. Η Παλιά Περίσταση στην Προποντίδα",
        path: "M 567,128",
        story: "Εδώ ζούσαν οι προπαππούδες μας δίπλα στη θάλασσα της Προποντίδας! Είχαν αμπέλια, καράβια και σπουδαίους δασκάλους, μέχρι τον Οκτώβριο του 1922 που έπρεπε μέσα σε 15 μέρες να αφήσουν τα σπίτια τους."
      },
      {
        cx: 482, cy: 81, photoIdx: 1,
        badge: "Σταθμός 2 από 5 \u2022 ~100 χλμ.",
        title: "2. Περνώντας τον Ποταμό Έβρο",
        path: "M 567,128 L 482,81",
        story: "Όσες οικογένειες ξεκίνησαν από τη στεριά φόρτωσαν στα κάρα λίγα ρούχα, κουβέρτες και εικονίσματα και πέρασαν με κόπο τον μεγάλο ποταμό Έβρο."
      },
      {
        cx: 278, cy: 78, photoIdx: 2,
        badge: "Σταθμός 3 από 5 \u2022 ~300 χλμ.",
        title: "3. Από τη Θράκη & με Καράβια στο Αιγαίο",
        path: "M 567,128 L 482,81 L 278,78",
        story: "Άλλοι προχωρούσαν στον δρόμο προς την Καβάλα και άλλοι ταξίδευαν με πλοία στο Αιγαίο, κουβαλώντας μαζί τους 18 ξύλινα κιβώτια με τα ιερά κειμήλια των εκκλησιών τους!"
      },
      {
        cx: 121, cy: 124, photoIdx: 3,
        badge: "Σταθμός 4 από 5 \u2022 ~460 χλμ.",
        title: "4. Αντάμωμα στη Θεσσαλονίκη (22 Οκτ. 1922)",
        path: "M 567,128 L 482,81 L 278,78 L 121,124",
        story: "Στη Θεσσαλονίκη συναντήθηκαν όσοι ήρθαν με τα πλοία και όσοι ήρθαν με τα κάρα. Κάποιες οικογένειες έμειναν εκεί, ενώ οι δικοί μας συνέχισαν νότια για την Πιερία!"
      },
      {
        cx: 78, cy: 180, photoIdx: 4,
        badge: "Σταθμός 5 από 5 \u2022 ~500 χλμ. συνολικά",
        title: "5. Νέα Περίσταση Πιερίας: Το Νέο μας Σπίτι!",
        path: "M 567,128 L 482,81 L 278,78 L 121,124 L 78,180",
        story: "Το 1924 ρίζωσαν στον εύφορο κάμπο της Κατερίνης! Έχτισαν τον Αη-Γιώργη και το σχολείο μας και έδωσαν στο χωριό το όνομα της αγαπημένης τους πατρίδας: Περίσταση!"
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
          '<path id="pexpSeaPath" d="M 567,128 Q 515,175 460,218 Q 340,246 240,236 Q 130,224 102,165 L 121,124" fill="none" stroke="#93c5fd" stroke-width="3.5" stroke-dasharray="7,5"></path>' +
          '<path id="pexpSeaActive" d="M 567,128 Q 515,175 460,218 Q 340,246 240,236 Q 130,224 102,165 L 121,124" fill="none" stroke="#1e6cff" stroke-width="4" stroke-linecap="round"></path>' +
          '<path id="pexpLandBg" d="M 567,128 L 482,81 L 278,78 L 121,124 L 78,180" fill="none" stroke="#fde68a" stroke-width="5" stroke-linecap="round"></path>' +
          '<path id="pexpLandActive" d="M 567,128 L 482,81 L 278,78 L 121,124 L 78,180" fill="none" stroke="#f59e0b" stroke-width="5.5" stroke-linecap="round"></path>' +
          '<circle id="pexpActiveRing" class="pexp-pulse-ring" cx="78" cy="180" r="18" fill="none" stroke="#dc2626" stroke-width="3"></circle>' +
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

    var currentStopIdx = 4;
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
   if (routeThumbStrip && routePhotos.length === 5) {
      routeThumbStrip.innerHTML = routePhotos.map(function(ph, i) {
        return '<button type="button" class="pexp-thumb-btn' + (i === 4 ? ' is-active' : '') + '" data-photo="' + i + '" title="' + ph.alt + '">' +
          '<img src="' + optImg(ph.src, 320) + '" data-full-src="' + ph.src + '" alt="' + ph.alt + '" loading="lazy" decoding="async"/>' +
        '</button>';
      }).join("");
      routeThumbStrip.querySelectorAll("img").forEach(function(im) {
        im.onerror = handleImgFallback;
      });
    }
    var thumbBtns = document.querySelectorAll("#pexpRouteThumbs .pexp-thumb-btn");
    var stopBadge = document.getElementById("pexpStopBadge");
    var stopTitle = document.getElementById("pexpRouteStopTitle");
    var routeStory = document.getElementById("pexpRouteStory");
    var routePins = document.querySelectorAll("#pexpRouteSvg .pexp-pin");
    var routeModes = document.querySelectorAll("#pexpRouteModes .pexp-mini-pill");

    function setRoutePhoto(pIdx) {
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

    thumbBtns.forEach(function(b) {
      b.addEventListener("click", function() {
        setRoutePhoto(Number(b.getAttribute("data-photo")));
      });
    });

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

   function renderStop(idx) {
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
        p.style.opacity = i <= currentStopIdx ? "1" : "0.6";
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
        note: "Έτσι ακριβώς ήρθαν το 1922 οι πρόσφυγες προπαππούδες μας από τη Θεσσαλονίκη στην Περίσταση!"
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
              '<circle cx="120" cy="24" r="17" fill="#dc2626" stroke="#fff" stroke-width="2"/>' +
              '<text x="120" y="29" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Β</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="S">' +
              '<circle cx="120" cy="216" r="17" fill="#0f766e" stroke="#fff" stroke-width="2"/>' +
              '<text x="120" y="221" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Ν</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="E">' +
              '<circle cx="216" cy="120" r="18" fill="#0284c7" stroke="#fff" stroke-width="2"/>' +
              '<text x="216" y="125" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Α</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="W">' +
              '<circle cx="24" cy="120" r="18" fill="#d97706" stroke="#fff" stroke-width="2"/>' +
              '<text x="24" y="125" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Δ</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="NE">' +
              '<circle cx="187" cy="53" r="15" fill="#4f46e5" stroke="#fff" stroke-width="2"/>' +
              '<text x="187" y="57" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">ΒΑ</text>' +
            '</g>' +
            '<g class="pexp-comp-pt" data-cdir="SW">' +
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
          '<img class="pexp-comp-photo" id="pexpCompImg" src="" alt="" loading="lazy"/>' +
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

    function setCompassDirection(dirKey, fromDestSelect) {
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
     if (compassImgEl && pt.img) {
        compassImgEl.setAttribute("data-full-src", pt.img);
        compassImgEl.src = optImg(pt.img, 640);
        compassImgEl.alt = pt.cap;
      }
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
      return { fill: fill, runner: runner, badge: badge, card: el.closest(".pexp-vehicle-card") };
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

    function selectDestination(key, fromCompass) {
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
        img2: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Beach_Paralia_Katerini_-_panoramio_%281%29.jpg",
        caption: "\uD83D\uDD0D Πάτησε στις φωτογραφίες για να τις δεις μεγάλες!",
        flora: ["\uD83C\uDF3C Κρίνος της θάλασσας", "\uD83C\uDFD6\uFE0F Αμμοθίνες"],
        fauna: ["\uD83D\uDC26 Γλάροι", "\uD83D\uDC22 Χελώνα Caretta caretta", "\uD83D\uDC2C Δελφίνια"],
        fact: "\uD83D\uDCA1 Το ήξερες; Ο λευκός «κρίνος της θάλασσας» ανθίζει το καλοκαίρι μέσα στην καυτή άμμο χωρίς καθόλου πότισμα!"
      },
      {
        cx: 238, cy: 140,
        alt: "Επίπεδο 2/5 \u2022 Υψόμετρο: 26 μέτρα",
        title: "\uD83C\uDFE1 2. Περίσταση: Το Χωριό μας στον Κάμπο!",
        desc: "Εδώ είμαστε εμείς! Η Περίσταση βρίσκεται στα 26 μέτρα ύψος από τη θάλασσα \u2014 περίπου όσο δύο διώροφα σχολεία το ένα πάνω στο άλλο!",
        img1: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0NL2aawSLfkOnNV8J_9cVNawgSBmkVdzSEmpkmtqgdjoNP8QO4rzJBrKxqEAJTnZ-RTHENX00Lq9rocWbrupB52YSzieFEytgLDhciFXms3NW1Maua0S1bRE_FuJjxBsca7xPHBsvBJY4DRestQzEGob8FU_CW_2u9EaYTuK6jhNC_nRXQgPR6M4pAAE/s1600/2025-10-25%2010_58_15-NVIDIA%20GeForce%20Overlay.png",
        img2: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Dion_view_of_Olympus.jpg",
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
        img2: "https://upload.wikimedia.org/wikipedia/commons/7/76/JankaeaHeldreichii30.jpg",
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
        img2: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mount_Olympus_from_Litochoro.jpg",
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
        img2: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Rupicapra_rupicapra_balcanica%2C_Olympus.jpg",
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
            '<path d="M 0,208 Q 45,201 90,208 Q 120,213 150,206 L 150,265 L 0,265 Z" fill="#0ea5e9"></path>' +
            '<path d="M 138,206 L 166,201 L 166,265 L 138,265 Z" fill="#fde68a"></path>' +
            '<circle cx="75" cy="188" r="15" fill="#0284c7" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="75" y="192" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="900">0μ</text>' +
            '<text x="75" y="242" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">\uD83C\uDF0A Παραλία</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="1">' +
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
            '<path d="M 315,190 L 455,132 L 455,265 L 315,265 Z" fill="#4ade80"></path>' +
            '<path d="M 412,150 Q 392,182 365,212" fill="none" stroke="#2563eb" stroke-width="4.5" stroke-linecap="round"></path>' +
            '<circle cx="355" cy="164" r="11" fill="#15803d"></circle>' +
            '<circle cx="430" cy="134" r="12" fill="#15803d"></circle>' +
            '<circle cx="388" cy="126" r="16" fill="#1e6cff" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="388" y="130" text-anchor="middle" fill="#fff" font-size="10" font-weight="900">800μ</text>' +
            '<text x="386" y="232" text-anchor="middle" fill="#064e3b" font-size="11.5" font-weight="900">\uD83D\uDCA7 Ενιπέας</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="3">' +
            '<path d="M 455,132 L 595,68 L 595,265 L 455,265 Z" fill="#65a30d"></path>' +
            '<polygon points="485,100 475,124 495,124" fill="#14532d"></polygon>' +
            '<polygon points="525,81 515,106 535,106" fill="#14532d"></polygon>' +
            '<polygon points="565,66 556,88 574,88" fill="#14532d"></polygon>' +
            '<circle cx="525" cy="56" r="16" fill="#ea580c" stroke="#fff" stroke-width="2.5"></circle>' +
            '<text x="525" y="60" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="900">2.000μ</text>' +
            '<text x="525" y="232" text-anchor="middle" fill="#1a2e05" font-size="11.5" font-weight="900">\uD83C\uDF32 Ρόμπολα</text>' +
          '</g>' +
          '<g class="pexp-zone-hit" data-zone="4">' +
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

    var curZoneIdx = 1;
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

   function selectZone(idx) {
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
      if (zImg1) { zImg1.setAttribute("data-full-src", z.img1); zImg1.src = optImg(z.img1, 640); zImg1.alt = z.title; }
      if (zImg2) { zImg2.setAttribute("data-full-src", z.img2); zImg2.src = optImg(z.img2, 640); zImg2.alt = z.title; }
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
   function loadLiveTemperatures() {
      if (weatherLoaded || weatherFetching || typeof window.fetch !== "function") return;
      var tempPill = document.getElementById("pexpLiveTemp");
      if (!tempPill) return;
      weatherFetching = true;
      fetch("https://api.open-meteo.com/v1/forecast?latitude=40.2741&longitude=22.5396&current=temperature_2m&timezone=auto")
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
          weatherFetching = false;
          if (data && data.current && typeof data.current.temperature_2m === "number") {
            weatherLoaded = true;
            var tPeristasi = Math.round(data.current.temperature_2m);
            var tMytikas = Math.round(data.current.temperature_2m - 18.8);
            tempPill.textContent = "\uD83C\uDF21\uFE0F Τώρα: Περίσταση (26μ) " + tPeristasi + "\u00B0C  \u2022  Κορυφή Μύτικα (2.918μ) ~" + tMytikas + "\u00B0C!";
          }
        })
       .catch(function() {
          weatherFetching = false;
        });
    }

    /* ================= 3Β. ΟΙ ΕΚΚΛΗΣΙΕΣ ΜΑΣ (4η ΚΑΡΤΕΛΑ) ================= */
    churchesData = [
      {
        badge: "Εκκλησία 1 από 2 \u2022 Κέντρο Περίστασης",
        title: "\u26EA 1. Ιερός Ναός Αγ. Γεωργίου & Αγ. Μοδέστου",
        img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpoIvD-uW-PJidxwFEyZqvdrRrE8_XY7mvNoHvKQQXl9w69-O04hyphenhyphenuOqUqNnul-f19sMorQDWZUL8nxfPoRaORl5RauIy-ak1pEjsFv0LCcLLIn4sPuA0BaFe1QofqCxXxGxijUqSO5HBOU7jxpO78M0U7MPs8kjoJ2BAplETfQMZBt55Jp1cNq7K_MwY/s1600/2026-06-28%2020_49_56-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png",
        caption: "Ιερός Ναός Αγίου Γεωργίου και Αγίου Μοδέστου Περίστασης",
        story: "Μόλις εγκαταστάθηκαν οι πρώτοι πρόσφυγες το 1924, το πρώτο τους μέλημα — μαζί με το πλίνθινο σχολείο — ήταν να χτίσουν την εκκλησία του Αη-Γιώργη! Εδώ φυλάσσονται με αγάπη τα ιερά κειμήλια και οι εικόνες που ταξίδεψαν το 1922 μέσα σε 18 ξύλινα κιβώτια από την παλιά Περίσταση της Προποντίδας.",
        tags: [
          "\uD83D\uDCC5 23 Απριλίου (ή Δευτέρα Πάσχα) \u2022 Αγ. Γεωργίου",
          "\uD83D\uDCC5 16 Δεκεμβρίου \u2022 Αγ. Μοδέστου",
          "\uD83D\uDDBC\uFE0F Ιερά Κειμήλια Προποντίδας (1922)"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Ο Άγιος Μόδεστος είναι ο προστάτης των γεωργών και των ζώων! Κάθε Δεκέμβριο αναβιώνει το παλιό θρακιώτικο έθιμο όπου η εικόνα του Αγίου φιλοξενείται από σπίτι σε σπίτι!"
      },
      {
        badge: "Εκκλησία 2 από 2 \u2022 Εξωκκλήσι",
        title: "\uD83C\uDF38 2. Εξωκκλήσι Παναγίας Ζωοδόχου Πηγής",
        img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirhu5w5w8mTAO71RZQFCOFdv_zyb0gZMYiTfDEczPbV1-vnQRzSt0HMEjpQfG5i1LZQWD1BNmBJGnXl7tU-5cCnKgfe1fc6vVJZi9dYFx8Qxn6__uLdb8Geed7_haGxJ37WD7slapAKjONWd4knhs4B0lq5cvEBMOF9HoBs_hG7gmVffhz922OmFSgb2M/s1600/2026-06-28%2020_52_12-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png",
        caption: "Εξωκκλήσι Παναγίας Ζωοδόχου Πηγής Περίστασης",
        story: "Μέσα στο πράσινο και τα δέντρα του κάμπου μας βρίσκεται το όμορφο εξωκκλήσι της Παναγίας Ζωοδόχου Πηγής! Είναι ένα ήσυχο, φωτεινό καταφύγιο στη φύση, όπου μικροί και μεγάλοι ανάβουν το κεράκι τους και ανταμώνουν όλοι μαζί κάθε άνοιξη μετά το Πάσχα.",
        tags: [
          "\uD83D\uDCC5 Παρασκευή της Διακαινησίμου (μετά το Πάσχα)",
          "\uD83C\uDF3F Ανοιξιάτικο Πανηγύρι στη Φύση",
          "\uD83D\uDD6F\uFE0F Αγίασμα & Προσκύνημα"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Η γιορτή της Ζωοδόχου Πηγής πέφτει πάντα την πρώτη Παρασκευή μετά την Κυριακή του Πάσχα, γεμίζοντας το εξωκκλήσι μας οικογένειες, παιδιά και ανοιξιάτικα λουλούδια!"
      }
    ];

    var cMainImg = document.getElementById("pexpChurchMainImg");
    var cBadge = document.getElementById("pexpChurchBadge");
    var cTitle = document.getElementById("pexpChurchTitle");
    var cStory = document.getElementById("pexpChurchStory");
    var cTags = document.getElementById("pexpChurchTags");
    var cFact = document.getElementById("pexpChurchFact");
  var cThumbStrip = document.getElementById("pexpChurchThumbs");
    if (cThumbStrip && churchesData.length) {
      cThumbStrip.innerHTML = churchesData.map(function(ch, i) {
        return '<button type="button" class="pexp-thumb-btn' + (i === 0 ? ' is-active' : '') + '" data-church="' + i + '" title="' + ch.caption + '">' +
          '<img src="' + optImg(ch.img, 320) + '" data-full-src="' + ch.img + '" alt="' + ch.caption + '" loading="lazy" decoding="async"/>' +
        '</button>';
      }).join("");
      cThumbStrip.querySelectorAll("img").forEach(function(im) {
        im.onerror = handleImgFallback;
      });
    }
    var cThumbs = document.querySelectorAll("#pexpChurchThumbs .pexp-thumb-btn");

   function renderChurch(idx) {
      if (!churchesData.length) return;
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
    }

    cThumbs.forEach(function(btn) {
      btn.addEventListener("click", function() {
        renderChurch(Number(btn.getAttribute("data-church")));
      });
    });
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
          desc: "Εικόνες, ασημένια καντήλια, σταυροί και ιερά σκεύη από τις εκκλησίες της παλιάς Περίστασης ταξίδεψαν με τα καράβια στο Αιγαίο έως τη Θεσσαλονίκη και από εκεί στον κάμπο της Πιερίας.",
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
        imgCap: "Το 12/θέσιο Δημοτικό Σχολείο Περίστασης (Μακεδονίας 15)",
        accent: "#1e6cff", border: "#93c5fd", soft: "#eff6ff",
        badge: "\uD83C\uDF82 100 Χρόνια Σχολείο (1926\u20132026) \u2022 Μακεδονίας 15",
        title: "Το 12/θέσιο Δημοτικό Σχολείο μας!",
        story: "Το σχολείο μας κλείνει έναν ολόκληρο αιώνα ζωής! Από το 1926 μέχρι σήμερα, τέσσερις γενιές παιδιών της Περίστασης έμαθαν εδώ γράμματα, έπαιξαν στη μεγάλη μας αυλή και έκαναν τους καλύτερούς τους φίλους.",
        tags: [
          "\uD83D\uDCD6 Δανειστική & Ψηφιακή Βιβλιοθήκη",
          "\uD83E\uDD16 Υπολογιστές & Ρομποτική",
          "\uD83C\uDFCA Σκάκι & Κολύμβηση",
          "\uD83C\uDFC0 Γήπεδα & Αίθουσα Εκδηλώσεων"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Το σχολείο μας έχει δική του Ψηφιακή Βιβλιοθήκη με 350 δωρεάν παιδικά βιβλία, ενώ στο σκάκι έχουμε κατακτήσει τη 2η θέση ανάμεσα στα Δημοτικά όλης της Κατερίνης!"
      },
      {
        icon: "\uD83D\uDCDA",
        img: customFacilityPhotos.gymnasio || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCIgZNc_pFIm-Rizfxco7o6WikZeme8Jkk_riWhA51A6Tl7l9RIPUsJZFYP5QKgw2wWpXlgfNLaQiaOUn3itVxud17Zh0Vtg9E0s3O7mmsDFCHF_Y_n7psE74ALm4yvXAhLiJwpYUVP8qLhyIrLMv5q6Ach5vEUkCoqgvHtOuLANxs0mCoc7CyN-KgviY/s1600/%CE%A3%CF%84%CE%BF-%CE%93%CF%85%CE%BC%CE%BD%CE%AC%CF%83%CE%B9%CE%BF-%CE%A0%CE%B5%CF%81%CE%AF%CF%83%CF%84%CE%B1%CF%83%CE%B7%CF%82-%CF%83%CF%84%CE%B7%CE%BD-%CE%9A%CE%B1%CF%84%CE%B5%CF%81%CE%AF%CE%BD%CE%B7-%CE%B3%CE%BF%CE%BD%CE%B5%CE%AF%CF%82-%CE%B5%CF%80%CE%B9%CF%84%CE%AD%CE%B8%CE%B7%CE%BA%CE%B1%CE%BD-%CF%83%CE%B5-%CE%BA%CE%B1%CE%B8%CE%B7%CE%B3%CE%B7%CF%84%CE%AE-%CF%84%CE%BF%CF%85-%CF%80%CE%B1%CE%B9%CE%B4%CE%B9%CE%BF%CF%8D-%CF%84%CE%BF%CF%85%CF%82-%CE%BA%CE%B1%CE%B9-%CE%BC%CE%B5%CF%84%CE%AC-%CF%84%CE%BF%CF%85-%CE%AD%CE%BA%CE%B1%CE%BD%CE%B1%CE%BD-%CE%BC%CE%AE%CE%BD%CF%85%CF%83%CE%B7-40993.webp",
        fallbackImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCIgZNc_pFIm-Rizfxco7o6WikZeme8Jkk_riWhA51A6Tl7l9RIPUsJZFYP5QKgw2wWpXlgfNLaQiaOUn3itVxud17Zh0Vtg9E0s3O7mmsDFCHF_Y_n7psE74ALm4yvXAhLiJwpYUVP8qLhyIrLMv5q6Ach5vEUkCoqgvHtOuLANxs0mCoc7CyN-KgviY/s1600/%CE%A3%CF%84%CE%BF-%CE%93%CF%85%CE%BC%CE%BD%CE%AC%CF%83%CE%B9%CE%BF-%CE%A0%CE%B5%CF%81%CE%AF%CF%83%CF%84%CE%B1%CF%83%CE%B7%CF%82-%CF%83%CF%84%CE%B7%CE%BD-%CE%9A%CE%B1%CF%84%CE%B5%CF%81%CE%AF%CE%BD%CE%B7-%CE%B3%CE%BF%CE%BD%CE%B5%CE%AF%CF%82-%CE%B5%CF%80%CE%B9%CF%84%CE%AD%CE%B8%CE%B7%CE%BA%CE%B1%CE%BD-%CF%83%CE%B5-%CE%BA%CE%B1%CE%B8%CE%B7%CE%B3%CE%B7%CF%84%CE%AE-%CF%84%CE%BF%CF%85-%CF%80%CE%B1%CE%B9%CE%B4%CE%B9%CE%BF%CF%8D-%CF%84%CE%BF%CF%85%CF%82-%CE%BA%CE%B1%CE%B9-%CE%BC%CE%B5%CF%84%CE%AC-%CF%84%CE%BF%CF%85-%CE%AD%CE%BA%CE%B1%CE%BD%CE%B1%CE%BD-%CE%BC%CE%AE%CE%BD%CF%85%CF%83%CE%B7-40993.webp",
        imgCap: "Γυμνάσιο Περίστασης \u2022 Εργαστήρια Πειραμάτων & Τεχνολογίας",
        accent: "#4f46e5", border: "#a5b4fc", soft: "#eef2ff",
        badge: "\uD83D\uDD2C Το Επόμενο Σχολείο μας \u2022 Ολύμπου 2",
        title: "Γυμνάσιο Περίστασης: Εκεί που Μεγαλώνουμε!",
        story: "Μόλις τελειώσουμε την ΣΤ' Δημοτικού, μας περιμένει το Γυμνάσιο του χωριού μας! Ιδρύθηκε το 1981 (τα πρώτα χρόνια φιλοξενήθηκε στο δικό μας σχολείο) και από το 1994 έχει το δικό του μεγάλο κτίριο με 14 αίθουσες.",
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
        badge: "\uD83D\uDC83 Παράδοση & Χορός \u2022 Πλ. Ανατολικής Θράκης & Μακεδονίας 1",
        title: "Οι Πολιτιστικοί Σύλλογοι του Χωριού μας!",
        story: "Στην Πλατεία Ανατολικής Θράκης βρίσκεται ο Σύλλογος Ανατολικοθρακών (από το 1998) με 4 χορευτικά τμήματα για παιδιά και μεγάλους, Μνημείο Προσφύγων, ενώ στην οδό Μακεδονίας 1 η Εύξεινος Λέσχη Περίστασης κρατά ζωντανή την ποντιακή παράδοση!",
        tags: [
          "\uD83D\uDC5F Παιδικά Χορευτικά Τμήματα",
          "\uD83C\uDFFA Μνημείο Προσφύγων",
          "\uD83C\uDF1F Το Έθιμο του Αγίου Μόδεστου",
          "\uD83C\uDFB6 Θρακιώτικοι & Ποντιακοί Χοροί"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Κάθε Δεκέμβριο στη γιορτή του Αγίου Μόδεστου (προστάτη των γεωργών και των ζώων) τηρείται το παλιό θρακιώτικο έθιμο όπου η εικόνα του Αγίου φιλοξενείται από σπίτι σε σπίτι!"
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
      { cx: 548, cy: 178, path: "M 548,178 L 548,178",                                      walk: "\uD83D\uDCCD Είμαστε εδώ! Το 12/θέσιο Δημοτικό Σχολείο μας στην οδό Μακεδονίας 15!" },
      { cx: 426, cy: 66,  path: "M 548,178 L 548,248 L 426,248 L 426,66",                   walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Γυμνάσιο (Ολύμπου 2): ~6 λεπτά με τα πόδια!" },
      { cx: 612, cy: 68,  path: "M 548,178 L 548,248 L 676,248 L 676,68 L 612,68",          walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C 3/Θ Νηπιαγωγείο (Αγ. Γεωργίου 2): ~4 λεπτά με τα πόδια!" },
      { cx: 352, cy: 104, path: "M 548,178 L 548,248 L 426,248 L 426,104 L 352,104",        walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Παιδικός Σταθμός (Ολύμπου 2): ~5 λεπτά με τα πόδια!" },
      { cx: 88,  cy: 110, path: "M 548,178 L 548,248 L 88,248 L 88,110",                    walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Κλειστό Γυμναστήριο Τ9: ~7 λεπτά στην οδό Μακεδονίας!" },
      { cx: 232, cy: 108, path: "M 548,178 L 548,248 L 232,248 L 232,108",                  walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Πλ. Ανατολικής Θράκης & Σύλλογοι: ~5 λεπτά στην οδό Μακεδονίας!" },
      { cx: 865, cy: 96,  path: "M 548,178 L 548,248 L 768,248 L 768,96 L 865,96",          walk: "\uD83D\uDC63 Διαδρομή από το Δημοτικό \u279C Γήπεδο Α.Ε. Περίστασης: ~5 λεπτά με τα πόδια!" }
    ];

    var mapWalkPath = null;
    var mapPulseRing = null;
    var mapStatusEl = null;
    var mapWrap = null;
    var mapModalBg = null;
    var mapPlaceholder = null;
   var mapZoomBtn = null;
    var isMapZoomed = false;
    var lastMapMsg = "\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 15) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!";
    var lastMapAction = "";

   var lastMapThumb = "";
    var lastMapThumbCap = "";

    function setMapStatusHtml(msg, actionType, thumbUrl, thumbCap) {
      lastMapMsg = msg;
      lastMapAction = actionType || "";
      lastMapThumb = thumbUrl || "";
      lastMapThumbCap = thumbCap || "";
      if (!mapStatusEl) return;
      var extraBtn = "";
      if (isMapZoomed && lastMapAction === "card") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-card="1">\uD83D\uDCD6 Δες την Κάρτα \u279C</button>';
      } else if (isMapZoomed && lastMapAction === "churches") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-churches="1">\u26EA Άνοιξε τις Εκκλησίες \u279C</button>';
      }
      var thumbHtml = lastMapThumb
        ? '<img class="pfac-map-thumb" src="' + optImg(lastMapThumb, 320) + '" alt="' + lastMapThumbCap + '" data-map-thumb-zoom="1" title="Πάτησε για μεγέθυνση!"/>'
        : '';
      mapStatusEl.innerHTML = '<div class="pfac-map-status-left">' + thumbHtml + '<span>' + msg + '</span></div>' + extraBtn;
      var thEl = mapStatusEl.querySelector("img");
      if (thEl) {
        thEl.onerror = function() { if (this.src !== fallbackSvg) this.src = fallbackSvg; };
      }
    }

  function openMapZoom() {
      if (isMapZoomed || !mapWrap) return;
      if (isRegMapZoomed) closeRegMapZoom(true);
      if (!mapModalBg) {
        mapModalBg = document.createElement("div");
        mapModalBg.className = "pfac-map-modal-bg";
        document.body.appendChild(mapModalBg);
        var mapBgDown = false;
        mapModalBg.addEventListener("mousedown", function(e) {
          mapBgDown = (e.target === mapModalBg);
        });
        mapModalBg.addEventListener("click", function(e) {
          if (mapBgDown && e.target === mapModalBg) closeMapZoom(false);
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
      document.body.style.overflow = "hidden";
      if (mapZoomBtn) mapZoomBtn.textContent = "\u2715 Κλείσιμο Μεγέθυνσης";
      setMapStatusHtml(lastMapMsg, lastMapAction, lastMapThumb, lastMapThumbCap);

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
     if (!modal.classList.contains("is-open") && !isRegMapZoomed && !(zoomOverlay && zoomOverlay.classList.contains("is-open"))) {
        document.body.style.overflow = "";
      }
      if (mapZoomBtn) mapZoomBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";
      setMapStatusHtml(lastMapMsg, lastMapAction, lastMapThumb, lastMapThumbCap);

      var needMapBack = (!fromPopState && histMapOpen);
      histMapOpen = false;
      if (needMapBack) {
        try { window.history.back(); } catch (e) {}
      }
    }

    if (pfacListEl && pfacListEl.parentNode && !document.getElementById("pfacMapSvg")) {
      mapWrap = document.createElement("div");
      mapWrap.className = "pfac-map-wrap";
      mapWrap.innerHTML =
        '<div class="pfac-map-head">' +
          '<strong>\uD83D\uDDFA\uFE0F Παιδικός Χάρτης της Γειτονιάς μας</strong>' +
         '<div class="pfac-map-head-right">' +
            '<span style="font-size:12.5px;color:#166534">\uD83D\uDC46 Πάτησε σε κτίριο για διαδρομή ή στον χάρτη για μεγέθυνση!</span>' +
            '<button type="button" class="pfac-map-zoom-btn pfac-map-macro-btn" id="pfacToMacroBtn">\uD83D\uDDFA\uFE0F Χάρτης Νομού \u2191</button>' +
            '<button type="button" class="pfac-map-zoom-btn" id="pfacMapZoomBtn">\uD83D\uDD0D Μεγέθυνση Χάρτη</button>' +
          '</div>' +
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
            '<text class="pfac-map-lbl" x="232" y="148" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">Πλ. Ανατ. Θράκης</text>' +
           '<text class="pfac-map-lbl" x="232" y="164" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">&amp; Σύλλογοι</text>' +
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
        '</svg>' +
        '<div class="pfac-map-status" id="pfacMapStatus"><span>\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 15) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!</span></div>';

      pfacListEl.parentNode.insertBefore(mapWrap, pfacListEl);
      mapWalkPath = document.getElementById("pfacMapWalkLine");
      mapPulseRing = document.getElementById("pfacMapPulse");
      mapStatusEl = document.getElementById("pfacMapStatus");
      mapZoomBtn = document.getElementById("pfacMapZoomBtn");

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
          closeFacilityCard();
          if (mapWalkPath) mapWalkPath.setAttribute("d", "M 548,178 L 548,248 L 526,248 L 526,336");
          if (mapPulseRing) {
            mapPulseRing.setAttribute("cx", "526");
            mapPulseRing.setAttribute("cy", "336");
            mapPulseRing.setAttribute("stroke", "#4f46e5");
            mapPulseRing.style.display = "";
          }
          var chMsg = "\u26EA Διαδρομή από το Δημοτικό \u279C Ι.Ν. Αγίου Γεωργίου & Μοδέστου: δίπλα στην αυλή μας!";
          var chImg = churchesData[0] ? churchesData[0].img : "";
          var chCap = churchesData[0] ? churchesData[0].caption : "";
          setMapStatusHtml(chMsg, "churches", chImg, chCap);
          if (!isMapZoomed) {
            window.openPeristasiModal("churches");
          }
          return;
        }
        if (node.hasAttribute("data-map-square")) {
          closeFacilityCard();
          if (mapWalkPath) mapWalkPath.setAttribute("d", "M 548,178 L 548,248 L 724,248 L 724,336");
          if (mapPulseRing) {
            mapPulseRing.setAttribute("cx", "724");
            mapPulseRing.setAttribute("cy", "336");
            mapPulseRing.setAttribute("stroke", "#16a34a");
            mapPulseRing.style.display = "";
          }
          setMapStatusHtml("\uD83C\uDF33 Διαδρομή από το Δημοτικό \u279C Πλατεία Χωριού: ~2 λεπτά με τα πόδια για βόλτα και παιχνίδι!", "");
          return;
        }
        if (node.hasAttribute("data-map-fac")) {
          var fIdx = Number(node.getAttribute("data-map-fac"));
          if (isMapZoomed && fIdx === activeFacIdx) {
            syncNeighborhoodMap(fIdx);
            return;
          }
          openFacilityCard(fIdx, !isMapZoomed);
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
        if (e.pointerType === "mouse") pfacMultiTouch = false;
        if (e.isPrimary === false) { pfacMultiTouch = true; pfacDownPt = null; return; }
        pfacDownPt = { x: e.clientX, y: e.clientY };
      }, { passive: true });

      mapWrap.addEventListener("click", function(e) {
        if (e.target.closest("[data-map-thumb-zoom]") && lastMapThumb) {
          e.stopPropagation();
          openSinglePhotoZoom(lastMapThumb, lastMapThumbCap, optImg(lastMapThumb, 320));
          return;
        }
        if (e.target.closest("[data-map-goto-card]")) {
          var hadMapHist = histMapOpen;
          closeMapZoom(false);
          if (pfacStage) {
            runAfterBack(hadMapHist, function() {
              pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          }
          return;
        }
        if (e.target.closest("[data-map-goto-churches]")) {
          window.openPeristasiModal("churches");
          return;
        }
        var draggedMap = !!(pfacDownPt && (Math.abs(e.clientX - pfacDownPt.x) > 6 || Math.abs(e.clientY - pfacDownPt.y) > 6));
        var nd = e.target.closest(".pfac-map-node");
        if (!nd && !draggedMap && !pfacMultiTouch && e.target.closest("#pfacMapSvg")) {
          nd = findClosestEl(mapNodeEls, e.clientX, e.clientY, 22, "circle");
        }
        if (nd) {
          triggerMapNode(nd);
          return;
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

    function syncNeighborhoodMap(idx) {
      if (!mapWalkPath || !mapPulseRing || !mapStatusEl) return;
      if (idx < 0 || !facMapMeta[idx]) {
        mapWalkPath.setAttribute("d", "");
        mapPulseRing.style.display = "none";
        setMapStatusHtml("\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 15) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!", "", "", "");
        return;
      }
      var m = facMapMeta[idx];
      var fItem = facilitiesData[idx];
      mapWalkPath.setAttribute("d", m.path);
      mapPulseRing.setAttribute("cx", String(m.cx));
      mapPulseRing.setAttribute("cy", String(m.cy));
      mapPulseRing.setAttribute("stroke", fItem.accent);
      mapPulseRing.style.display = "";
      setMapStatusHtml(m.walk, "card", fItem.img, fItem.imgCap || fItem.title);
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
        closeFacilityCard();
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
            '<img class="pfac-card-photo" id="pfacCardImg" src="' + cardThumbSrc + '" alt="' + (item.imgCap || item.title) + '" loading="lazy"/>' +
            '<div class="pfac-card-photo-cap">\uD83D\uDD0D Πάτησε για μεγέθυνση</div>' +
          '</div>'
        : '';

      var mirrorExtraHtml = (cleanIdx === 0)
        ? '<div><button type="button" class="pfac-mirror-btn" id="pfacOpenMirrorBtn">\uD83E\uDE9E Μία Μέρα στο Σχολείο: 1926 vs 2026 (Καθρέφτης 100 Χρόνων!)</button></div>' +
          '<div id="pfacMirrorStage" style="display:none"></div>'
        : '';

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
        cardImgEl.onerror = function() {
          if (item.img && this.src !== item.img) {
            this.src = item.img;
          } else if (item.fallbackImg && this.src !== item.fallbackImg) {
            this.src = item.fallbackImg;
          } else if (this.parentNode) {
            this.parentNode.style.display = "none";
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
        else if (btn.id === "pfacOpenMirrorBtn") {
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
      var fullMapUrl = oldLink.getAttribute("href") || (origImg ? origImg.src : "");
      var fallbackMapUrl = origImg ? origImg.src : fullMapUrl;
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
          old1922: "Ρίζωμα προσφύγων το 1924",
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
          px: 29.0, py: 42.2,
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
          px: 35.8, py: 46.8,
          layers: ["neighbors", "horizon"],
          title: "\uD83C\uDF0A Παραλία Κατερίνης (Θερμαϊκός Κόλπος)",
          dist: "5 χλμ",
          dir: "\u27A1\uFE0F Ανατολικά (Α)",
          today: "7 λεπτά (16' με ποδήλατο)",
          old1922: "~1 ώρα & 15' ανάμεσα στα χωράφια",
          floatTxt: "\uD83D\uDCCF Παραλία: 5 χλμ \u2022 Ανατολικά (7')",
          desc: "Πέντε χιλιόμετρα ανατολικά ξεκινά η θάλασσα του Θερμαϊκού (υψόμετρο 0 μέτρα)! Από την αμμουδιά της Παραλίας ανατέλλει ο ήλιος και φαίνονται απέναντι η Θεσσαλονίκη και η Χαλκιδική.",
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
          short: "Σκοτεινά (Πιέρια)",
          color: "#ea580c",
          inPieria: true,
          px: 21.2, py: 45.5,
          layers: ["ancestors"],
          title: "\uD83C\uDF32 Σκοτεινά / Παλιά Μόρνα (Πιέρια Όρη)",
          dist: "34 χλμ",
          dir: "\u2B05\uFE0F Δυτικά (Πιέρια Όρη)",
          today: "~40 λεπτά ορεινή διαδρομή",
          old1922: "Ολόκληρη μέρα πορεία (1947)",
          floatTxt: "\uD83D\uDCCF Σκοτεινά: 34 χλμ \u2022 Πιέρια Όρη",
          desc: "Ψηλά στα δάση των Πιερίων βρίσκονται τα Σκοτεινά (Μόρνα). Μετά το 1947, οικογένειες από τα Σκοτεινά κατέβηκαν στον κάμπο και έσμιξαν στην Περίσταση με τους Θρακιώτες, τους Βλάχους και τους Πόντιους!",
          ctaText: "\uD83D\uDFE7 Δες τις Ρίζες Σκοτεινών & Βλάχων \u279C",
          action: function() {
            openPopulationAtYear(1951);
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
          px: 35.2, py: 31.8,
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
        ancestors: "\u26F5 Οι Δρόμοι των Προγόνων μας: Δες πώς έφτασαν οι Θρακιώτες & Πόντιοι μέσω Θεσσαλονίκης (1922\u20131924, στεριά & θάλασσα) και οι οικογένειες από τα Σκοτεινά Πιερίων (1947)!",
        horizon: "\uD83D\uDD2D Τι βλέπουμε στον ορίζοντα; Από την αμμουδιά της Παραλίας το βλέμμα ταξιδεύει πάνω από τον Θερμαϊκό έως τη Θεσσαλονίκη (ΒΑ) και τη Χαλκιδική (Α-ΝΑ), ενώ πίσω μας υψώνεται ο Μύτικας!"
      };

      var sx = function(p) { return Math.round(p * 10); };
      var sy = function(p) { return Math.round(p * 5.27); };
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
                '<svg class="preg-svg" viewBox="0 0 1000 527" preserveAspectRatio="none" aria-hidden="true">' +
                  '<defs>' +
                    '<linearGradient id="pregHorizonGrad" x1="0%" y1="50%" x2="100%" y2="50%">' +
                      '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.34"/>' +
                      '<stop offset="100%" stop-color="#fde047" stop-opacity="0.08"/>' +
                    '</linearGradient>' +
                  '</defs>' +
                  '<g id="pregLayerNeighbors" style="display:none">' +
                    '<circle cx="334" cy="220" r="28" fill="rgba(16,185,129,0.10)" stroke="#10b981" stroke-width="2" vector-effect="non-scaling-stroke" stroke-dasharray="5,5"/>' +
                    '<circle cx="334" cy="220" r="105" fill="rgba(30,108,255,0.05)" stroke="#3b82f6" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-dasharray="7,6"/>' +
                  '</g>' +
                  '<g id="pregLayerAncestors" style="display:none">' +
                    '<path d="M 485,48 Q 412,46 370,108 Q 355,140 352,168 L 334,220" fill="none" stroke="#ffffff" stroke-width="6" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<path class="preg-flow-line" d="M 485,48 Q 412,46 370,108 Q 355,140 352,168 L 334,220" fill="none" stroke="#d97706" stroke-width="3.6" vector-effect="non-scaling-stroke" stroke-dasharray="9,5" stroke-linecap="round"/>' +
                    '<path d="M 485,48 Q 450,158 358,247 L 334,220" fill="none" stroke="#ffffff" stroke-width="5.5" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<path class="preg-flow-line" d="M 485,48 Q 450,158 358,247 L 334,220" fill="none" stroke="#1e6cff" stroke-width="3.4" vector-effect="non-scaling-stroke" stroke-dasharray="8,6" stroke-linecap="round"/>' +
                    '<path d="M 212,240 Q 273,234 334,220" fill="none" stroke="#ffffff" stroke-width="5.5" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<path class="preg-flow-line" d="M 212,240 Q 273,234 334,220" fill="none" stroke="#ea580c" stroke-width="3.4" vector-effect="non-scaling-stroke" stroke-dasharray="8,6" stroke-linecap="round"/>' +
                  '</g>' +
                  '<g id="pregLayerHorizon" style="display:none">' +
                    '<path d="M 358,247 L 485,48 Q 645,168 725,368 Z" fill="url(#pregHorizonGrad)" stroke="#0284c7" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-dasharray="6,5"/>' +
                    '<line class="preg-flow-line" x1="358" y1="247" x2="485" y2="48" stroke="#0284c7" stroke-width="2.8" vector-effect="non-scaling-stroke" stroke-dasharray="7,7"/>' +
                    '<line class="preg-flow-line" x1="358" y1="247" x2="665" y2="329" stroke="#0369a1" stroke-width="2.8" vector-effect="non-scaling-stroke" stroke-dasharray="7,7"/>' +
                    '<line x1="334" y1="220" x2="285" y2="320" stroke="#7c3aed" stroke-width="2.8" vector-effect="non-scaling-stroke" stroke-dasharray="6,5"/>' +
                  '</g>' +
                  '<g id="pregRulerSvg" style="display:none">' +
                    '<line id="pregRulerHalo" x1="334" y1="220" x2="334" y2="220" stroke="#ffffff" stroke-width="6" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' +
                    '<line id="pregRulerLine" class="preg-flow-line" x1="334" y1="220" x2="334" y2="220" stroke="#dc2626" stroke-width="3.5" vector-effect="non-scaling-stroke" stroke-dasharray="9,5" stroke-linecap="round"/>' +
                    '<circle id="pregRulerEnd" cx="334" cy="220" r="5.5" fill="#fde047" stroke="#0f172a" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
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
      var regModalBg = null;
      var regPlaceholder = null;
     var stageDownPt = null;
      var multiTouchReg = false;

      if (stageEl) {
        stageEl.addEventListener("touchstart", function(e) {
          multiTouchReg = !!(e.touches && e.touches.length > 1);
        }, { passive: true });
        stageEl.addEventListener("touchmove", function(e) {
          if (e.touches && e.touches.length > 1) multiTouchReg = true;
        }, { passive: true });
        stageEl.addEventListener("pointerdown", function(e) {
          if (e.pointerType === "mouse") multiTouchReg = false;
          if (e.isPrimary === false) { multiTouchReg = true; stageDownPt = null; return; }
          stageDownPt = { x: e.clientX, y: e.clientY };
        }, { passive: true });
      }

      function openRegMapZoom() {
        if (isRegMapZoomed || !regWrap) return;
        if (isMapZoomed) closeMapZoom(true);
        ensureHiResMap();
        if (!regModalBg) {
          regModalBg = document.createElement("div");
          regModalBg.className = "preg-modal-bg";
          document.body.appendChild(regModalBg);
          var regBgDown = false;
          regModalBg.addEventListener("mousedown", function(e) {
            regBgDown = (e.target === regModalBg);
          });
          regModalBg.addEventListener("click", function(e) {
            if (regBgDown && e.target === regModalBg) closeRegMapZoom(false);
            regBgDown = false;
          });
        }
        if (!regPlaceholder) regPlaceholder = document.createElement("div");
        if (regWrap.parentNode) regWrap.parentNode.insertBefore(regPlaceholder, regWrap);

        isRegMapZoomed = true;
        regModalBg.appendChild(regWrap);
        regWrap.classList.add("is-zoomed");
        regModalBg.classList.add("is-open");
        document.body.style.overflow = "hidden";
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
        if (!modal.classList.contains("is-open") && !isMapZoomed && !(zoomOverlay && zoomOverlay.classList.contains("is-open"))) {
          document.body.style.overflow = "";
        }
        if (zoomModalBtn) zoomModalBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";

        var needBack = (!fromPopState && histRegMapOpen);
        histRegMapOpen = false;
        if (needBack) {
          try { window.history.back(); } catch (e) {}
        }
      };

      function isPinInCurrentLayer(i) {
        return (curLayer === "all") || (regPins[i].layers.indexOf(curLayer) !== -1);
      }

      function syncPinPositions() {
        pinEls.forEach(function(btn, i) {
          var p = regPins[i];
          var lx = pieriaZoomed ? (Z_TX + p.px * Z_SCALE) : p.px;
          var ly = pieriaZoomed ? (Z_TY + p.py * Z_SCALE) : p.py;
          btn.style.left = lx.toFixed(2) + "%";
          btn.style.top = ly.toFixed(2) + "%";
        });
      }

      function setPieriaZoom(enable) {
        pieriaZoomed = !!enable;
        if (pieriaZoomed) ensureHiResMap();
        if (viewportEl) viewportEl.classList.toggle("is-pieria-zoom", pieriaZoomed);
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
          syncNeighborhoodMap(0);
          setMapStatusHtml(
            "\uD83D\uDD2D Ζουμάραμε στην κόκκινη πινέζα της Περίστασης! Τώρα βλέπεις από κοντά τους δρόμους γύρω από την οδό Μακεδονίας 15!",
            "card",
            facilitiesData[0] ? facilitiesData[0].img : "",
            facilitiesData[0] ? facilitiesData[0].title : ""
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
              '<div class="preg-metric preg-metric--1922"><span class="preg-metric-lbl">\uD83D\uDEDE Εποχή Προγόνων (1922)</span><span class="preg-metric-val">' + p.old1922 + '</span></div>' +
            '</div>' +
            '<p class="preg-panel-desc">' + p.desc + '</p>' +
            '<div class="preg-panel-foot">' +
              '<button type="button" class="preg-cta-btn" data-preg-cta="1">' + p.ctaText + '</button>' +
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
        var draggedReg = !!(stageDownPt && (Math.abs(e.clientX - stageDownPt.x) > 6 || Math.abs(e.clientY - stageDownPt.y) > 6));
        if (e.target.closest("#pregStage")) {
          var nearPin = (!draggedReg && !multiTouchReg)
            ? findClosestEl(pinEls, e.clientX, e.clientY, 26, ".preg-pin-dot")
            : null;
          var hitPin = nearPin || e.target.closest("[data-rpin]");
          if (hitPin) {
            selectRegPin(Number(hitPin.getAttribute("data-rpin")));
            return;
          }
          if (!isRegMapZoomed && !multiTouchReg && !draggedReg && !isPinchZoomed()) {
            openRegMapZoom();
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

    upgradeRegionalMap();
    upgradeTwinMapsPortal();
  })();
