(function() {
  "use strict";

  var rootEl = document.getElementById("pzoodExplorerRoot");
  var mapMount = document.getElementById("pzoodMapMount");
  var pillsListEl = document.getElementById("pzoodPillsList");
  var stageEl = document.getElementById("pzoodStage");
  var zoomOverlay = document.getElementById("pzoodImgZoom");
  var zoomImgWrap = document.getElementById("pzoodZoomImgWrap");
  var zoomTarget = document.getElementById("pzoodImgZoomTarget");
  var zoomCap = document.getElementById("pzoodImgZoomCap");
  var zoomCloseBtn = document.getElementById("pzoodZoomCloseBtn");
  var zoomPrevBtn = document.getElementById("pzoodZoomPrevBtn");
  var zoomNextBtn = document.getElementById("pzoodZoomNextBtn");
  if (!rootEl || !mapMount) return;

 var photoOldChurch = "https://katerini-experience.gr/wp-content/gallery/panagia-zoodoxou-pigis/IMG_0111.jpg";
  var photoGroveArea = "https://katerini-experience.gr/wp-content/gallery/panagia-zoodoxou-pigis/IMG_0114.jpg";
  var photoShrinePan = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirhu5w5w8mTAO71RZQFCOFdv_zyb0gZMYiTfDEczPbV1-vnQRzSt0HMEjpQfG5i1LZQWD1BNmBJGnXl7tU-5cCnKgfe1fc6vVJZi9dYFx8Qxn6__uLdb8Geed7_haGxJ37WD7slapAKjONWd4knhs4B0lq5cvEBMOF9HoBs_hG7gmVffhz922OmFSgb2M/s1600/2026-06-28%2020_52_12-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png";
var photoBridge = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjOcmzU-NnawNxk_aj5PhHzLa6CwYP0XAD-Nvv5IUe9yq8lyVGZrWl9KKPnXvCOCTX7j7sKwOpBt0o_r77RaLH0KGvMxuOUQW1liKN4pS50U8uLky4h5-2G68BQMJHVy8d5wC1yiXjo_-ednb0vYelsk-5TKrSmzmlVjrvjqxLStF-Oyy-k2eyt5_yDGfY/s320/2026-11-26%2016_00_47-Android%20Device.png";
  var photoPlayground = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgcjNMsAOWFFttyvBXVfBh1HxiHUrIXzvMx3akImL4AN5NDKlQO194wO-Ss_N_DID6ml2chmQKLrqENWWKefB-0Lr08L2v7AXrZ2HpavjSkyoeHTROTAPBXfm4jaA5n53ISPfHR_OTQXGmgijhvLtWAnYHnBvxDRJFKTwQFPcYWRAWtTjk8uLynunQJDnM/s320/2026-11-26%2020_25_00-NVIDIA%20GeForce%20Overlay.png";
  var photoCourtyard = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirT_N-Mvaqg2g5hH63wHRh6OgUs_BzJxyBx2tC0lJA2gtLZEdUOc-_0C3wuFk1CqcpLLKmG8kbMD3KqKFpq_fSkefoNCDqnJM0Gbr7lt-GwMGhRBwW57PpDUrmfkfG51nvWucNWiSA7HYLzpUN-XXkUQET5yfvyAu30JK0Q_ElmB2W_XjnADPHoW7PCGs/s320/78da233d-0335-4a6f-b467-14bbb5e6f306.webp";

var photoPomona = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEga9R5KGtNkBdJlS29dV-Ys8gPJJn428E5IDLDF9OLlFoTHLIvTSCLWDYHu0ys6izbOtY6C_0hTTKp2GwofYFw0rrvhZ-YOsDCw26gSERjYH7NhH1pj0A4AQQUKkh88DNjY2oBlHbrQ44tRvWWqWAShq8W6FdZNR_evjEMufdGmguPsJ9dvGe96_UeE2Ts/s320/2026-11-27%2015_16_08-NVIDIA%20GeForce%20Overlay.png";
  var photoKrini = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhGqeMeZMC0tgPWpQ6ZWekA8EUe1SMOdROjmQEhnex9E22xTslMivd5YBGvjN9mjdGTHOYKXDFtbxVz0Hp-Q-zqjFdmZkj1FpU57ImvkIQ9rWygHeADzofC6w7iH3yOanYoJ-EKBEQ3s7YZWHObtI-MJ33ia2D9_BlREbzrDKMoLL1m_k_hqF3tYgQb1SQ/s320/2026-11-27%2015_19_34-NVIDIA%20GeForce%20Overlay.png";

  var customZoodPhotos = {
    piliPlatoma:    photoShrinePan,   // 0: Πέτρινη Τοξωτή Πύλη & Πλάτωμα
    paliosNaos:     photoOldChurch,   // 1: Παλιός Πέτρινος Ναός (Βόρεια/Πάνω)
    kainouriosNaos: photoShrinePan,   // 2: Καινούριος Ναός (Νότια/Κάτω)
    archontariki:   photoCourtyard,   // 3: Αυλόγυρος, Αρχονταρίκι & Κεντρικός Πλάτανος
    gefyraKanali:   photoBridge,      // 4: Μικρή Γέφυρα & Κανάλι Νερού
    paidikiChara:   photoPlayground,  // 5: Παιδική Χαρά (Νότια του καναλιού)
    alsosPlatanion: photoGroveArea,   // 6: Άλσος Αιωνόβιων Πλατανιών
    panigiri:       photoShrinePan,   // 7: Πανήγυρη Διακαινησίμου & Μυστήρια
    pomona:         photoPomona,      // 8: Κτίριο Πομόνας (Γεώτρηση 200μ)
    krini:          photoKrini        // 9: Παραδοσιακή Κρήνη (Νερό Ολύμπου)
  };

  /* Συμπληρωματικοί κανόνες CSS για λεπτομέρειες κάρτας/κουρτίνας/κινητών */
  var styleTag = document.getElementById("pzoodInteractiveStyles");
  var extraRules =
    ".pzood-era-icons{font-size:19px;letter-spacing:2px}" +
    ".pzood-era-title{font-size:14.5px;font-weight:900;margin:0 0 5px;color:#0f172a}" +
    ".pzood-era-desc{font-size:13px;line-height:1.5;margin:0;color:#334155}" +
    ".pzood-curtain-wrap{margin:8px 0 10px}" +
    ".pzood-curtain-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;font-size:12px;font-weight:700;color:#475569}" +
    ".pzood-curtain-zoom-btn{appearance:none;border:1.5px solid #93c5fd;background:#fff;color:#1d4ed8;font-family:inherit;font-size:11.8px;font-weight:800;padding:4px 11px;border-radius:999px;cursor:pointer}" +
    ".pzood-curtain-zoom-btn:hover{background:#eff6ff;border-color:#1e6cff}" +
    ".pzood-mirror-pill--curtain{border-color:#f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#eff6ff 100%);color:#92400e}" +
    ".pzood-mirror-pill--curtain.is-active{background:linear-gradient(135deg,#d97706 0%,#1e6cff 100%)!important;border-color:#d97706!important;color:#fff!important}" +
    ".pzood-status-yr{display:inline-flex;align-items:center;gap:3px;margin-left:5px;padding:1.5px 8px;border-radius:999px;background:#fffbeb;border:1px solid #f59e0b;color:#92400e;font-size:11.3px;font-weight:900;white-space:nowrap}" +
    ".pzood-map-wrap.is-era-past .pzood-map-scroll{border-color:#d97706!important;background:#fef9c3!important}" +
    ".pzood-street-zoom-pill.is-overview{border-color:#2563eb!important;background:#dbeafe!important;color:#1d4ed8!important}" +
   "@media (max-width:720px),(max-width:960px) and (max-height:520px){" +
      ".pzood-map-wrap.is-zoomed .pzood-map-scroll:not(.is-mobile-zoom){width:min(100%,calc(58dvh * 2.0435))!important;margin:0 auto!important}" +
      ".pzood-map-wrap.is-zoomed .pzood-map-scroll.is-mobile-zoom{overflow-y:auto!important;max-height:60dvh!important}" +
      ".pzood-map-wrap.is-det-mode.is-zoomed #pzoodDetectiveBtn{grid-column:1/-1}" +
    "}" +
    "@keyframes pzoodCandleFlicker{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.24) translateY(-.8px);opacity:1}}" +
    "@keyframes pzoodBellSwing{0%,100%{transform:rotate(0deg)}25%{transform:rotate(14deg)}75%{transform:rotate(-14deg)}}" +
    "@keyframes pzoodFlagWave{0%,100%{transform:translateY(0)}50%{transform:translateY(1.6px)}}" +
    ".pzood-candle-glow,.pzood-bell-waves,.pzood-fx-panigiri{opacity:0;pointer-events:none;transition:opacity .25s ease}" +
    ".pzood-candle-flame{transform-box:fill-box;transform-origin:center bottom}" +
    ".pzood-bell-unit{transform-box:fill-box;transform-origin:50% 10%}" +
    '#pzoodMapSvg[data-active-fx="old-church"] .pzood-candle-glow,#pzoodMapSvg[data-active-fx="panigiri"] .pzood-candle-glow{opacity:1}' +
    '#pzoodMapSvg[data-active-fx="old-church"] .pzood-candle-flame,#pzoodMapSvg[data-active-fx="panigiri"] .pzood-candle-flame{animation:pzoodCandleFlicker .85s ease-in-out infinite}' +
    '#pzoodMapSvg[data-active-fx="new-church"] .pzood-bell-waves,#pzoodMapSvg[data-active-fx="panigiri"] .pzood-bell-waves{opacity:1}' +
    '#pzoodMapSvg[data-active-fx="new-church"] .pzood-bell-unit,#pzoodMapSvg[data-active-fx="panigiri"] .pzood-bell-unit{animation:pzoodBellSwing .85s ease-in-out infinite}' +
    '#pzoodMapSvg[data-active-fx="panigiri"] .pzood-fx-panigiri{opacity:1}' +
    '#pzoodMapSvg[data-active-fx="panigiri"] .pzood-bunting{animation:pzoodFlagWave 1.6s ease-in-out infinite}' +
    ".pzood-amea-path{opacity:.52;transition:opacity .22s ease,stroke-width .22s ease}" +
    ".pzood-amea-badge{opacity:.8;transition:opacity .22s ease,transform .22s ease;transform-box:fill-box;transform-origin:center}" +
    '#pzoodMapSvg[data-active-fx="amea"] .pzood-amea-path{opacity:1;stroke-width:3.4px}' +
    '#pzoodMapSvg[data-active-fx="amea"] .pzood-amea-badge{opacity:1;transform:scale(1.08)}' +
".pzood-map-wrap.is-paused .pzood-candle-flame,.pzood-map-wrap.is-paused .pzood-bell-unit,.pzood-map-wrap.is-paused .pzood-bunting,.pzood-map-wrap.is-paused .pzood-pulse-ring,.pzood-map-wrap.is-paused .pzood-water-shimmer,.pzood-map-wrap.is-paused .pzood-cross-anim," +
    "body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-candle-flame,body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-bell-unit,body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-bunting,body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-pulse-ring,body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-water-shimmer,body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-cross-anim," +
    "body.pexp-zoom-open .pzood-candle-flame,body.pexp-zoom-open .pzood-bell-unit,body.pexp-zoom-open .pzood-bunting,body.pexp-zoom-open .pzood-pulse-ring,body.pexp-zoom-open .pzood-water-shimmer,body.pexp-zoom-open .pzood-cross-anim," +
    "body.pzood-zoom-open .pzood-candle-flame,body.pzood-zoom-open .pzood-bell-unit,body.pzood-zoom-open .pzood-bunting,body.pzood-zoom-open .pzood-pulse-ring,body.pzood-zoom-open .pzood-water-shimmer,body.pzood-zoom-open .pzood-cross-anim{animation-play-state:paused!important}" +
    ".pzood-map-wrap.is-zoomed{margin:0!important;overscroll-behavior:contain}" +
    ".pzood-map-scroll{overscroll-behavior:contain}" +
 "#pzoodImgZoom.is-open{touch-action:none}" +
    ".pzood-exit-hit{fill:transparent!important;stroke:none!important}" +
    "@keyframes pzoodWaterGpu{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(36px,0,0)}}" +
    "#pzoodMapSvg .pzood-water-shimmer{stroke-dashoffset:0!important;will-change:transform;animation:pzoodWaterGpu 2.4s linear infinite}" +
   "@media (max-width:960px),(hover:none),(pointer:coarse),(any-pointer:coarse){" +
      "#pzoodMapSvg{shape-rendering:auto}" +
      ".pzood-water-shimmer,.pzood-pump-flow{stroke-linecap:butt}" +
      ".pzood-pulse-ring{animation-iteration-count:3!important}" +
      ".pzood-map-wrap.is-walking .pzood-water-shimmer,.pzood-map-wrap.is-walking .pzood-pump-flow,.pzood-map-wrap.is-walking .pzood-candle-flame,.pzood-map-wrap.is-walking .pzood-bell-unit,.pzood-map-wrap.is-walking .pzood-bunting," +
      ".pzood-map-wrap.is-touch-busy .pzood-water-shimmer,.pzood-map-wrap.is-touch-busy .pzood-pump-flow,.pzood-map-wrap.is-touch-busy .pzood-pulse-ring,.pzood-map-wrap.is-touch-busy .pzood-cross-anim,.pzood-map-wrap.is-touch-busy .pzood-candle-flame,.pzood-map-wrap.is-touch-busy .pzood-bell-unit,.pzood-map-wrap.is-touch-busy .pzood-bunting{animation-play-state:paused!important}" +
    "}" +
    "@media (prefers-reduced-motion:reduce){" +
      ".pzood-water-shimmer,.pzood-pulse-ring,.pzood-candle-flame,.pzood-bell-unit,.pzood-bunting,.pzood-cross-anim{animation:none!important}" +
    "}" +
    ".pzood-curtain-stage.is-intro-sweep .pzood-curtain-handle{box-shadow:0 0 0 5px rgba(250,204,21,.55),0 6px 16px rgba(15,23,42,.48)}" +
    ".pzood-mirror-swipe-hint{display:none;font-size:11.5px;font-weight:700;color:#92400e;text-align:center;margin-top:8px}" +
    "@media (max-width:720px){.pzood-mirror-swipe-hint{display:block}}" +
    "@keyframes pzoodRevealIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
    ".pzood-root{margin:16px 0 18px;scroll-margin-top:14px}" +
    ".pzood-root.is-revealing{animation:pzoodRevealIn .32s cubic-bezier(.22,1,.36,1)}" +
    ".pzood-modal-bg{z-index:2147483644!important}" +
    "#pzoodImgZoom{z-index:2147483647!important}" +
    ".pzood-map-wrap.is-bridge-glow{box-shadow:0 0 0 4px #10b981,0 16px 36px rgba(16,185,129,.25)!important;transition:box-shadow .35s}" +
    ".pzood-bridge-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px;padding:10px 14px;border-radius:16px;background:linear-gradient(135deg,#fdf2f8 0%,#ecfdf5 100%);border:2px solid #f9a8d4;box-shadow:0 4px 14px rgba(15,23,42,.06)}" +
    ".pzood-bridge-kicker{font-size:13.5px;font-weight:900;color:#831843;display:flex;align-items:center;gap:6px}" +
    ".pzood-bridge-actions{display:flex;flex-wrap:wrap;align-items:center;gap:6px}" +
    ".pzood-bridge-up-btn{appearance:none;border:1.5px solid #16a34a;background:#f0fdf4;color:#166534;font-family:inherit;font-size:12px;font-weight:800;padding:5px 12px;border-radius:999px;cursor:pointer;transition:all .16s}" +
    ".pzood-bridge-up-btn:hover{background:#16a34a;color:#fff}" +
    ".pzood-bridge-hide-btn{appearance:none;border:1.5px solid #fda4af;background:#fff1f2;color:#9f1239;font-family:inherit;font-size:12px;font-weight:800;padding:5px 12px;border-radius:999px;cursor:pointer;transition:all .16s}" +
    ".pzood-bridge-hide-btn:hover{background:#e11d48;border-color:#e11d48;color:#fff}" +
   ".pzood-village-btn{border-color:#3b82f6!important;background:#eff6ff!important;color:#1d4ed8!important}" +
    ".pzood-village-btn:hover{background:#dbeafe!important}" +
    "@media (max-width:640px){.pzood-bridge-bar{padding:9px 10px}.pzood-bridge-kicker{width:100%;font-size:12.6px}.pzood-bridge-actions{width:100%;display:grid;grid-template-columns:1fr auto;gap:6px}.pzood-bridge-up-btn,.pzood-bridge-hide-btn{text-align:center;justify-content:center}}" +
  ".pzood-map-wrap.is-det-mode #pzoodBackToVillageBtn{display:none!important}" +
    "@media (max-width:720px),(max-width:960px) and (max-height:520px){.pzood-map-wrap.is-zoomed #pzoodBackToVillageBtn{display:none!important}}" +
    "@keyframes pzoodPumpGpu{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(10px,0,0)}}" +
    "#pzoodMapSvg .pzood-pump-flow{stroke-dashoffset:0!important;will-change:transform;animation:pzoodPumpGpu .65s linear infinite}" +
   ".pzood-pump-splash,.pzood-krini-splash{opacity:.85;transition:opacity .22s ease}" +
    '#pzoodMapSvg[data-active-fx="pomona"] .pzood-pump-splash,#pzoodMapSvg[data-active-fx="krini"] .pzood-krini-splash{opacity:1}' +
   ".pexp-dual-viewport.is-sliding .pzood-water-shimmer,.pexp-dual-viewport.is-sliding .pzood-pump-flow,.pexp-dual-viewport.is-sliding .pzood-pulse-ring,.pexp-dual-viewport.is-sliding .pzood-candle-flame,.pexp-dual-viewport.is-sliding .pzood-bell-unit,.pexp-dual-viewport.is-sliding .pzood-bunting," +
    ".pzood-map-wrap.is-paused .pzood-pump-flow,body.pexp-overlay-open .pzood-map-wrap:not(.is-zoomed) .pzood-pump-flow,body.pexp-zoom-open .pzood-pump-flow,body.pzood-zoom-open .pzood-pump-flow{animation-play-state:paused!important;will-change:auto}" +
    "@media (prefers-reduced-motion:reduce){.pzood-pump-flow{animation:none!important}}" +
    ".pzood-pills-heading{margin:18px 0 8px!important;padding-top:14px;border-top:2px dashed #cbd5e1;color:#64748b!important;font-size:.92em!important;font-weight:600!important}" +
    "#pzoodPillsList{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:8px!important;max-width:720px!important;margin:10px auto 8px!important;padding:0!important;list-style:none!important}" +
    "#pzoodPillsList li{background:rgba(30,108,255,.08)!important;color:#1e6cff!important;border:1px solid rgba(30,108,255,.15)!important;padding:8px 14px!important;margin:0!important;font-size:14.6px!important;font-weight:800!important;line-height:1.3!important;border-radius:999px!important;display:inline-flex!important;align-items:center!important;gap:5px!important;white-space:nowrap!important;box-shadow:none!important;user-select:none;-webkit-tap-highlight-color:transparent;transition:all .25s ease!important}" +
    "#pzoodPillsList li:hover{background:#1e6cff!important;color:#ffffff!important;border-color:#1e6cff!important;transform:translateY(-2px);box-shadow:0 5px 15px rgba(30,108,255,.3)!important}" +
    "#pzoodPillsList li.is-active{background:var(--pz-accent,#1e6cff)!important;color:#ffffff!important;border-color:var(--pz-accent,#1e6cff)!important;transform:translateY(-2px) scale(1.03);box-shadow:0 8px 18px rgba(15,23,42,.16)!important}" +
    "@media (max-width:640px){#pzoodPillsList{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;width:100%!important;max-width:100%!important}#pzoodPillsList li{width:100%!important;min-width:0!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-height:44px!important;padding:9px clamp(5px,2vw,10px)!important;font-size:clamp(11.4px,3.35vw,13.6px)!important;line-height:1.22!important;border-radius:16px!important;white-space:normal!important;overflow-wrap:break-word!important}}";
  if (styleTag) {
    styleTag.textContent += extraRules;
  } else {
    var dynStyle = document.createElement("style");
    dynStyle.textContent = extraRules;
    (document.head || document.body).appendChild(dynStyle);
  }

  var blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  var fallbackSvg = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="100%" height="100%" fill="#ecfdf5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#166534" font-family="sans-serif" font-weight="bold" font-size="16">Παναγία Ζωοδόχος Πηγή Περίστασης</text></svg>'
  );
  var grFmt = (typeof Intl !== "undefined" && Intl.NumberFormat) ? new Intl.NumberFormat("el-GR") : null;
  function fmtNum(n) { return grFmt ? grFmt.format(n) : String(n); }

  function escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

 function optImg(url, sz) {
    if (!url || typeof url !== "string" || url.indexOf("data:") === 0) return url;
    var d = sz || 640;
    if (url.indexOf("blogger.googleusercontent.com") !== -1 || url.indexOf("bp.blogspot.com") !== -1) {
      var bSz = d <= 640 ? 640 : d;
      return url
        .replace(/\/(s\d+|w\d+(?:-h\d+)?)(?:-[A-Za-z0-9_-]+)?\//, "/s" + bSz + "-rw/")
        .replace(/=(s\d+|w\d+(?:-h\d+)?)(?:-[A-Za-z0-9_-]+)?(?=$|[?&])/, "=s" + bSz + "-rw");
    }
    return url;
  }

  function stripRwParam(url) {
    return url ? url.replace(/-rw(?=\/|$|[?&])/, "") : "";
  }

  function handleImgError() {
    if (this.src && this.src.indexOf("-rw") !== -1 && this.getAttribute("data-tried-norw") !== "1") {
      var noRw = stripRwParam(this.src);
      if (noRw && noRw !== this.src) {
        this.setAttribute("data-tried-norw", "1");
        this.src = noRw;
        return;
      }
    }
    var full = this.getAttribute("data-full-src") || "";
    if (full && this.src !== full && this.getAttribute("data-tried-full") !== "1") {
      this.setAttribute("data-tried-full", "1");
      this.src = full;
      return;
    }
    var fb = this.getAttribute("data-fallback-src") || "";
    if (fb && this.src !== fb && this.getAttribute("data-tried-fb") !== "1") {
      this.setAttribute("data-tried-fb", "1");
      this.src = fb;
      return;
    }
    if (this.src !== fallbackSvg) this.src = fallbackSvg;
  }

  function shuffleList(arr) {
    var c = arr.slice();
    for (var i = c.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c;
  }

  function isPinchZoomed() {
    return !!(window.visualViewport && window.visualViewport.scale > 1.02);
  }

  /* =========================================================================
     ΔΕΔΟΜΕΝΑ ΣΗΜΕΙΩΝ ΠΡΟΣΚΥΝΗΜΑΤΟΣ (8 ΚΑΡΤΕΣ & ΔΙΑΔΡΟΜΕΣ ΣΗΜΕΡΑ)
     ========================================================================= */
  var spotsData = [
    {
      key: "spot0",
      icon: "\u26E9\uFE0F",
      img: customZoodPhotos.piliPlatoma,
      fallbackImg: photoGroveArea,
      imgCap: "Η είσοδος και το καταπράσινο περιβάλλον της Παναγίας Ζωοδόχου Πηγής Περίστασης",
      accent: "#0284c7", border: "#7dd3fc", soft: "#f0f9ff",
      badge: "\uD83D\uDCCD Ζωοδόχου Πηγής Τέρμα, Περίσταση 601 00",
      eraTag: "\u267F Επίπεδος Χώρος & Πρόσβαση ΑμεΑ",
      title: "Πέτρινη Τοξωτή Πύλη & Μεγάλο Πλάτωμα",
      milestones: ["Παλιό Μονύδριο (πριν το 1923)", "Ενορία Αγ. Γεωργίου Περίστασης", "Σήμερα Άνετο Πλάτωμα & Πύλη"],
      story: "Φτάνοντας από τον δρόμο της Περίστασης (ή από την Κατερίνη μέσω της μικρής γέφυρας), ο δρόμος ανοίγει σε ένα μεγάλο, άνετο πλάτωμα στάθμευσης. Ακριβώς μπροστά μας υψώνεται η χαρακτηριστική πέτρινη τοξωτή πύλη του μαντρότοιχου, που μας καλωσορίζει στους δύο ναούς της Παναγίας!",
      tags: [
        "\u26E9\uFE0F Πέτρινη Τοξωτή Πύλη",
        "\uD83C\uDD7F\uFE0F Άνετο Πλάτωμα Εισόδου",
        "\u267F Πλήρης Πρόσβαση ΑμεΑ",
        "\u26EA Παρεκκλήσι Αγ. Γεωργίου Περίστασης"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Στους χάρτες το προσκύνημα καταγράφεται και ως «Μονή Παναγίας» (Ζωοδόχου Πηγής Τέρμα), επειδή εδώ υπήρχε παλιό μονύδριο πριν ακόμη έρθουν οι πρόσφυγες το 1923!",
      hasMirror: true
    },
    {
      key: "spot1",
      icon: "\uD83C\uDFDB\uFE0F",
      img: customZoodPhotos.paliosNaos,
      fallbackImg: photoShrinePan,
      imgCap: "Ο ιστορικός Παλιός Πέτρινος Ναός στη βόρεια (πάνω) πλευρά με το ξύλινο χαγιάτι και τη χαμηλή θύρα",
      accent: "#b45309", border: "#fcd34d", soft: "#fffbeb",
      badge: "\uD83E\uDEA8 Βόρεια (Πάνω) Πλευρά \u2022 Ιστορικό Εκκλησάκι",
      eraTag: "\uD83D\uDD70\uFE0F Πριν το 1923",
      title: "Ο Παλιός Πέτρινος Ναός: Το Ιστορικό Εκκλησάκι",
      milestones: ["Παλιό Λιθόκτιστο Εκκλησάκι", "Ξύλινο Προστώο (Χαγιάτι)", "Χαμηλή Θύρα Ευλάβειας"],
      story: "Στη βόρεια (πάνω) πλευρά του συγκροτήματος, ακριβώς κολλητά στον νεότερο ναό, στέκει ο χαμηλός παραδοσιακός λιθόκτιστος ναός με τετράρριχτη κεραμοσκεπή και σκεπαστό προστώο (χαγιάτι) σε ξύλινους στύλους. Εκατέρωθεν της εισόδου βρίσκονται δύο ξυλόγλυπτα προσκυνητάρια (Ζωοδόχου Πηγής & Αγίου Γεωργίου) και πέτρινα μανουάλια.",
      tags: [
        "\uD83E\uDEB5 Σκεπαστό Χαγιάτι με Ξύλινους Στύλους",
        "\uD83D\uDEAA Χαμηλή Θύρα Ταπεινότητας",
        "\uD83D\uDD6F\uFE0F Πέτρινα Μανουάλια & 2 Προσκυνητάρια",
        "\uD83D\uDDBC\uFE0F Σκούρο Ξύλινο Τέμπλο 2 Σειρών"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Η είσοδος του παλιού ναού είναι επίτηδες χαμηλή, όπως στις παλιές εκκλησίες, ώστε κάθε προσκυνητής να σκύβει ευλαβικά μπαίνοντας στο κατανυκτικό εσωτερικό με τους ασβεστωμένους πέτρινους τοίχους και τα ξύλινα στασίδια!",
      hasMirror: true
    },
    {
      key: "spot2",
      icon: "\u26EA",
      img: customZoodPhotos.kainouriosNaos,
      fallbackImg: photoOldChurch,
      imgCap: "Το συγκρότημα της Παναγίας Ζωοδόχου Πηγής με τον Καινούριο Ναό στη νότια (κάτω) πλευρά",
      accent: "#4f46e5", border: "#a5b4fc", soft: "#eef2ff",
      badge: "\u26EA Νότια (Κάτω) Πλευρά \u2022 Σε Επαφή με τον Παλιό",
      eraTag: "\uD83D\uDD14 Πλινθόκτιστος Τρούλος & Καμπαναριό",
      title: "Ο Καινούριος Ναός της Ζωοδόχου Πηγής",
      milestones: ["Κολλητά στον Παλιό Ναό", "Οκταγωνικός Πλινθόκτιστος Τρούλος", "Τρίτοξος Νάρθηκας & Καμπαναριό"],
      story: "Ακριβώς νότια (κάτω) και σε επαφή με τον παλιό ναό υψώνεται ο λευκός, ευρύχωρος νεότερος ναός! Ξεχωρίζει για τον οκταγωνικό πλινθόκτιστο τρούλο με τα κόκκινα τούβλα, τον τρίτοξο νάρθηκα (στοά) με κίονες σε βαθύ κεραμιδί χρώμα, το ενσωματωμένο καμπαναριό και τις εξωτερικές αγιογραφίες πάνω από την κεντρική θύρα.",
      tags: [
        "\uD83E\uDDF1 Οκταγωνικός Πλινθόκτιστος Τρούλος",
        "\uD83C\uDFDB\uFE0F Τρίτοξος Νάρθηκας (Κεραμιδί Κίονες)",
        "\u2728 Λευκό Ανάγλυφο Τέμπλο & Μαρμάρινοι Κίονες",
        "\uD83D\uDDBC\uFE0F Παλιά Φορητή Εικόνα Ζωοδόχου Πηγής"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Πάνω από τη δυτική είσοδο στο εσωτερικό δεσπόζει η μεγάλη αγιογραφία της Παναγίας ως Ζωοδόχου Πηγής, ενώ σε προσκυνητάρι φυλάσσεται η παλαιά φορητή εικόνα της Χάρης της!",
      hasMirror: true
    },
   {
      key: "spot3",
      icon: "\uD83C\uDFE1",
      img: customZoodPhotos.archontariki,
      fallbackImg: photoGroveArea,
      imgCap: "Ο επίπεδος αυλόγυρος με τον κεντρικό πλάτανο, το κυκλικό παγκάκι και το κεραμοσκεπές αρχονταρίκι",
      accent: "#15803d", border: "#86efac", soft: "#f0fdf4",
      badge: "\uD83C\uDF33 Εντός Πετρόκτιστου Περιβόλου",
      eraTag: "\uD83E\uDE91 Κυκλικό Παγκάκι Πλατάνου",
      title: "Αυλόγυρος, Αρχονταρίκι & Κεντρικός Πλάτανος",
      milestones: ["Πετρόκτιστος Μαντρότοιχος", "Κεντρικός Πλάτανος με Παγκάκι", "Κεραμοσκεπές Αρχονταρίκι"],
      story: "Μέσα στον περιποιημένο πέτρινο μαντρότοιχο απλώνεται μια γαλήνια, επίπεδη αυλή. Στο κέντρο της δεσπόζει ο μεγάλος πλάτανος με το χαρακτηριστικό κυκλικό παγκάκι γύρω από τον κορμό του, ενώ απέναντι από τους δύο ναούς βρίσκεται το κεραμοσκεπές αρχονταρίκι (βοηθητικό κτίριο) με τη βεράντα του.",
      tags: [
        "\uD83C\uDF33 Κυκλικό Παγκάκι στον Πλάτανο",
        "\uD83C\uDFE1 Αρχονταρίκι με Βεράντα",
        "\uD83E\uDEA8 Περιποιημένος Πέτρινος Μαντρότοιχος",
        "\u267F Επίπεδη Αυλή Φιλική σε Όλους"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Τις ζεστές ανοιξιάτικες και καλοκαιρινές μέρες, η παχιά σκιά του πλατάνου στον αυλόγυρο προσφέρει φυσική δροσιά σε όλους τους προσκυνητές!"
    },
    {
      key: "spot4",
      icon: "\uD83C\uDF09",
      img: customZoodPhotos.gefyraKanali,
      fallbackImg: photoGroveArea,
      imgCap: "Η μικρή γέφυρα πάνω από το κανάλι νερού στη διασταύρωση προς Κατερίνη και το μονοπάτι της Παιδικής Χαράς",
      accent: "#0369a1", border: "#7dd3fc", soft: "#e0f2fe",
      badge: "\uD83D\uDCA7 Κανάλι Νερού & Διασταύρωση Κατερίνης",
      eraTag: "\uD83C\uDF09 Πέρασμα προς Παιδική Χαρά",
      title: "Μικρή Γέφυρα & Κανάλι Νερού",
      milestones: ["Κανάλι Άρδευσης Κάμπου", "Μικρή Γέφυρα Διασταύρωσης", "Μονοπάτι προς Παιδική Χαρά"],
      story: "Παράλληλα και νότια από τον κεντρικό δρόμο κυλάει το κανάλι νερού του κάμπου! Εκεί όπου ο καμπυλωτός δρόμος από την Κατερίνη συναντά τον δρόμο της Περίστασης, υπάρχει η μικρή γέφυρα πάνω από το κανάλι — το ασφαλές πέρασμα για να συνεχίσουμε από το μονοπάτι στο γρασίδι έως την Παιδική Χαρά!",
      tags: [
        "\uD83D\uDCA7 Κανάλι Νερού δίπλα στον Δρόμο",
        "\uD83C\uDF09 Μικρή Γέφυρα στη Διασταύρωση",
        "\uD83D\uDEB6 Πέρασμα προς το Μονοπάτι Γρασιδιού",
        "\uD83D\uDEA6 Προσοχή στη Διασταύρωση «Τ»"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Το τρεχούμενο νερό του κάμπου κρατάει όλο τον χρόνο καταπράσινα τα αιωνόβια πλατάνια που αγκαλιάζουν την Παναγία της Περίστασης!"
    },
    {
      key: "spot5",
      icon: "\uD83D\uDEDD",
      img: customZoodPhotos.paidikiChara,
      fallbackImg: photoShrinePan,
      imgCap: "Ο χώρος αναψυχής κάτω από τα πλατάνια απέναντι από το προσκύνημα",
      accent: "#e11d48", border: "#fda4af", soft: "#fff1f2",
      badge: "\uD83C\uDFA0 Νότια του Καναλιού (Κάτω από την Εκκλησία)",
      eraTag: "\uD83D\uDC63 Μέσω Γέφυρας & Μονοπατιού",
      title: "Η Παιδική Χαρά κάτω από τα Δέντρα!",
      milestones: ["Περνάμε τη Μικρή Γέφυρα", "Μονοπάτι στο Γρασίδι", "Ασφαλής Περιφραγμένος Χώρος"],
      story: "Απέναντι από το προσκύνημα, στη νότια όχθη του καναλιού μέσα στη δροσιά των δέντρων, βρίσκεται η περιφραγμένη Παιδική Χαρά! Για να φτάσουμε εκεί από την εκκλησία, περπατάμε έως τη μικρή γέφυρα της διασταύρωσης, περνάμε πάνω από το κανάλι και ακολουθούμε το όμορφο μονοπάτι πάνω στο γρασίδι!",
      tags: [
        "\uD83D\uDEDD Τσουλήθρα, Κούνιες & Τραμπάλα",
        "\uD83C\uDF09 Πρόσβαση από τη Μικρή Γέφυρα",
        "\uD83C\uDF3F Μονοπάτι δίπλα στο Κανάλι",
        "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 Αγαπημένο Σημείο Οικογενειών"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Μετά τον εκκλησιασμό, τα βαφτίσια ή το ανοιξιάτικο πανηγύρι, η Παιδική Χαρά γεμίζει παιδικές φωνές και παιχνίδι κάτω από τη σκιά των πλατανιών!"
    },
   {
      key: "spot6",
      icon: "\uD83C\uDF33",
      img: customZoodPhotos.alsosPlatanion,
      fallbackImg: photoShrinePan,
      imgCap: "Τα αιωνόβια πλατάνια που αγκαλιάζουν την Παναγία της Περίστασης",
      accent: "#059669", border: "#6ee7b7", soft: "#ecfdf5",
      badge: "\uD83C\uDF3F ~3 χλμ από Κατερίνη \u2022 1,2 χλμ από Περίσταση",
      eraTag: "\uD83C\uDF0F Ιστορικό Καταφύγιο 1941",
      title: "Το Άλσος με τα Αιωνόβια Πλατάνια",
      milestones: ["Φυσική Όαση Κάμπου", "Στρατόπεδο Συμμάχων ANZAC (1941)", "Σήμερα Χώρος Περιπάτου & Γαλήνης"],
      story: "Ολόκληρο το εξωκλήσι βρίσκεται φωλιασμένο μέσα σε ένα καταπράσινο άλσος με πανύψηλα αιωνόβια πλατάνια, λίγο πριν τα παράλια της Πιερίας. Την άνοιξη του 1941, κάτω από αυτές τις πυκνές φυλλωσιές έκρυψαν τις σκηνές τους οι Νεοζηλανδοί Σύμμαχοι στρατιώτες, τους οποίους φρόντισαν με ζυμωτό ψωμί οι κάτοικοι της Περίστασης!",
      tags: [
        "\uD83C\uDF33 Αιωνόβια Πλατάνια Υπαίθρου",
        "\uD83D\uDC26 Κελαηδίσματα & Φυσική Δροσιά",
        "\u26FA Μνήμη Νεοζηλανδών Συμμάχων (1941)",
        "\uD83D\uDEB2 Ιδανική Ποδηλατάδα από το Χωριό"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Πάτησε το κουμπί «\uD83D\uDD70\uFE0F Άνοιξη 1941» πάνω στον χάρτη για να δεις πώς ήταν εδώ το κρυφό στρατόπεδο των Νεοζηλανδών κάτω από τα πλατάνια!",
      jumpTo1941: true
    },
    {
      key: "spot7",
      icon: "\uD83C\uDF38",
      img: customZoodPhotos.panigiri,
      fallbackImg: photoGroveArea,
      imgCap: "Το αγαπημένο προσκύνημα της Παναγίας Ζωοδόχου Πηγής στις ανοιξιάτικες γιορτές",
      accent: "#db2777", border: "#f9a8d4", soft: "#fdf2f8",
      badge: "\uD83D\uDCC5 Παρασκευή της Διακαινησίμου (Μετά το Πάσχα)",
      eraTag: "\uD83D\uDC8D Γάμοι & Βαπτίσεις στη Φύση",
      title: "Πανήγυρη Ζωοδόχου Πηγής & Ιερά Μυστήρια",
      milestones: ["Πέμπτη: Μέγας Εσπερινός & Αρτοκλασία", "Παρασκευή Διακαινησίμου: Πανήγυρη", "Άνοιξη\u2013Καλοκαίρι: Γάμοι & Βαπτίσεις"],
      story: "Το προσκύνημα πανηγυρίζει πανηγυρικά την Παρασκευή της Διακαινησίμου (την πρώτη Παρασκευή μετά το Πάσχα)! Την παραμονή τελείται Μέγας Πανηγυρικός Εσπερινός με αρτοκλασία και ανήμερα πανηγυρική Θεία Λειτουργία με πλήθος πιστών από την Περίσταση και την Κατερίνη, ενώ όλη την άνοιξη και το καλοκαίρι φιλοξενεί γάμους και βαπτίσεις.",
      tags: [
        "\uD83C\uDF38 Παρασκευή της Διακαινησίμου",
        "\uD83C\uDF5E Μέγας Εσπερινός με Αρτοκλασία",
        "\uD83D\uDC90 Αγαπημένο Ξωκλήσι Γάμων & Βαπτίσεων",
        "\uD83E\uDD1D Αντάμωμα Περίστασης & Κατερίνης"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; «Ζωοδόχος Πηγή» ονομάζεται η Παναγία μας επειδή είναι η πηγή της Ζωής — γι' αυτό και η μεγάλη της γιορτή γίνεται μέσα στην ανθισμένη πασχαλινή άνοιξη!"
    },
    {
      key: "spot8",
      icon: "\uD83D\uDCA6",
      img: customZoodPhotos.pomona,
      fallbackImg: photoGroveArea,
      imgCap: "Το μικρό κτίριο της πομόνας (γεώτρηση 200 μ.) δίπλα στο κανάλι νερού πάνω από την Παιδική Χαρά",
      accent: "#0891b2", border: "#67e8f9", soft: "#ecfeff",
      badge: "\uD83D\uDCA6 Γεώτρηση 200 μέτρων Βάθους \u2022 Όχθη Καναλιού",
      eraTag: "\u2699\uFE0F Έως 20 Αγρότες Συγχρόνως!",
      title: "Κτίριο Πομόνας: Νερό από 200 Μέτρα Βάθος!",
      milestones: ["Γεώτρηση 200 μ. Βάθους", "Έως 20 Αγρότες Ταυτόχρονα", "Σωλήνα που Γεμίζει το Κανάλι"],
      story: "Λίγο πιο πάνω από την Παιδική Χαρά, ακριβώς δίπλα στη νότια όχθη του καναλιού, βρίσκεται το μικρό κτίριο της «πομόνας» (αντλιοστάσιο άρδευσης)! Αντλεί καθαρό νερό από βάθος 200 μέτρων κάτω από τη γη για να ποτίζονται τα χωράφια του κάμπου και έχει τόσο δυνατό μηχάνημα που μπορούσε να δώσει νερό μέχρι και σε 20 αγρότες συγχρόνως!",
      tags: [
        "\u2B07\uFE0F 200 Μέτρα Βάθος Γεώτρησης",
        "\uD83D\uDE9C Πότισμα σε έως 20 Αγρότες Μαζί",
        "\uD83D\uDCA6 Σωλήνα Εκτόνωσης στο Κανάλι",
        "\uD83C\uDF3E Δροσιά στον Κάμπο Περίστασης"
      ],
     fact: "\uD83D\uDCA1 Το ήξερες; Επειδή το μηχάνημα της πομόνας ήταν πανίσχυρο, όταν δεν ζητούσαν πολλοί αγρότες νερό ταυτόχρονα, έριχνε μια μεγάλη ποσότητα νερού από τη σωλήνα κατευθείαν μέσα στο κανάλι και το γέμιζε νερό!"
    },
    {
      key: "spot9",
      icon: "\uD83D\uDEB0",
      img: customZoodPhotos.krini,
      fallbackImg: photoGroveArea,
      imgCap: "Η παραδοσιακή κρήνη δίπλα στη μικρή γέφυρα με το γάργαρο τρεχούμενο νερό από τον Όλυμπο",
      accent: "#0d9488", border: "#5eead4", soft: "#f0fdfa",
      badge: "\uD83D\uDEB0 Δίπλα στη Μικρή Γέφυρα \u2022 Τρεχούμενο Νερό",
      eraTag: "\uD83C\uDFD4\uFE0F Νερό από τον Όλυμπο",
      title: "Η Κρήνη με το Τρεχούμενο Νερό του Ολύμπου",
      milestones: ["Τρεχούμενο Νερό Ολύμπου", "Κάτοικοι Γύρω Περιοχών (έως τέλη 20ού αι.)", "Ζωντανό Σημείο Μνήμης"],
      story: "Ανάμεσα στα δέντρα, ακριβώς αριστερά από τη μικρή γέφυρα πάνω από τον δρόμο της Κατερίνης, στέκει η ιστορική κρήνη του προσκυνήματος! Μέχρι και το τέλος του 20ού αιώνα, πολλοί κάτοικοι από διάφορες περιοχές τριγύρω έρχονταν εδώ για να γεμίσουν και να πάρουν νερό, επειδή κατέβαινε δροσερό και συνεχώς τρεχούμενο από τον Όλυμπο!",
      tags: [
        "\uD83C\uDFD4\uFE0F Φυσικό Νερό από τον Όλυμπο",
        "\uD83D\uDCA7 Συνεχώς Τρεχούμενο Νερό",
        "\uD83E\uDED9 Κάτοικοι απ' Όλες τις Γύρω Περιοχές",
        "\uD83D\uDCC5 Υδροληψία έως τα Τέλη του 20ού Αιώνα"
      ],
      fact: "\uD83D\uDCA1 Το ήξερες; Τόσο την εποχή του 1941 όσο και μέχρι τα τέλη του 20ού αιώνα, το φημισμένο τρεχούμενο νερό της κρήνης ξεδιψούσε προσκυνητές, γεωργούς και οικογένειες από ολόκληρη τη γύρω περιοχή!",
      jumpTo1941Idx: 5
    }
  ];

  /* Συντεταγμένες & διαδρομές πάνω στο SVG (viewBox 0 0 940 460) */
  var spotMapMeta = [
    {
      cx: 636, cy: 156, steps: 0, meters: 0, bikeTime: "0 λεπτά", crossRoad: false, crossPt: null,
      pts: [[636, 156]], walkerPt: [604, 172],
      safety: "\u26E9\uFE0F Είμαστε στο μεγάλο επίπεδο πλάτωμα μπροστά στην πέτρινη τοξωτή πύλη (πρόσβαση & για ΑμεΑ)!",
      bikeSafety: "\uD83E\uDE96 Κατεβαίνουμε από το ποδήλατο στο πλάτωμα πριν περάσουμε την πέτρινη τοξωτή πύλη!",
      walk: "\uD83D\uDCCD Αφετηρία: Πέτρινη Τοξωτή Πύλη & Πλάτωμα (Ζωοδόχου Πηγής Τέρμα)!",
      bike: "\uD83D\uDEB2 Αφετηρία: Πλάτωμα εισόδου Παναγίας Περίστασης \u2014 φοράμε πάντα κράνος!"
    },
    {
      cx: 842, cy: 76, steps: 45, meters: 30, bikeTime: "Πεζοί στην αυλή", crossRoad: false, crossPt: null,
      pts: [[636, 156], [696, 150], [742, 112], [756, 78], [842, 76]],
      safety: "\uD83D\uDEAA Περνάμε την τοξωτή πύλη & σκύβουμε ευλαβικά στη χαμηλή θύρα του Παλιού Πέτρινου Ναού!",
      bikeSafety: "\uD83D\uDEB6 Αφήνουμε το ποδήλατο έξω στο πλάτωμα & μπαίνουμε πεζοί στον αυλόγυρο!",
      walk: "\uD83D\uDC63 Πύλη \u279C Παλιός Πέτρινος Ναός (βόρεια/πάνω πλευρά, με το ξύλινο χαγιάτι)!",
      bike: "\uD83C\uDFDB\uFE0F Πύλη \u279C Παλιός Πέτρινος Ναός (περπατάμε ήσυχα μέσα στον αυλόγυρο)!"
    },
    {
      cx: 842, cy: 154, steps: 40, meters: 26, bikeTime: "Πεζοί στην αυλή", crossRoad: false, crossPt: null,
      pts: [[636, 156], [744, 154], [842, 154]],
      safety: "\u267F Επίπεδη διαδρομή στον αυλόγυρο έως τον τρίτοξο νάρθηκα του Καινούριου Ναού!",
      bikeSafety: "\uD83D\uDEB6 Στον αυλόγυρο κινούμαστε πάντα πεζοί με σεβασμό στους προσκυνητές!",
      walk: "\uD83D\uDC63 Πύλη \u279C Καινούριος Ναός (νότια/κάτω πλευρά, κολλητά στον Παλιό Ναό)!",
      bike: "\u26EA Πύλη \u279C Καινούριος Ναός (με τον πλινθόκτιστο τρούλο & το καμπαναριό)!"
    },
    {
      cx: 718, cy: 92, steps: 30, meters: 20, bikeTime: "Πεζοί στην αυλή", crossRoad: false, crossPt: null,
      pts: [[636, 156], [698, 152], [718, 92]],
      safety: "\uD83C\uDF33 Ξεκούραση στο κυκλικό παγκάκι του πλατάνου & στη βεράντα του αρχονταρικιού!",
      bikeSafety: "\uD83C\uDF33 Δροσερή στάση στη σκιά του κεντρικού πλατάνου της αυλής!",
      walk: "\uD83D\uDC63 Πύλη \u279C Αρχονταρίκι & Κυκλικό Παγκάκι Πλατάνου στον αυλόγυρο!",
      bike: "\uD83C\uDFE1 Πύλη \u279C Αρχονταρίκι & Κεντρικός Πλάτανος μέσα στον πέτρινο περίβολο!"
    },
    {
      cx: 442, cy: 262, steps: 145, meters: 95, bikeTime: "~1 λεπτό", crossRoad: true, crossPt: [442, 220],
      pts: [[636, 156], [584, 220], [442, 220], [442, 262]],
      safety: "\uD83D\uDEA6 ΔΙΑΣΤΑΥΡΩΣΗ & ΓΕΦΥΡΑ: Ελέγχουμε για οχήματα από Κατερίνη/Περίσταση & κρατιόμαστε μακριά απ' το κανάλι!",
      bikeSafety: "\uD83D\uDEA6 Κόβουμε ταχύτητα στη διασταύρωση «Τ» πριν περάσουμε τη μικρή γέφυρα του καναλιού!",
      walk: "\uD83D\uDC63 Πλάτωμα \u279C Μικρή Γέφυρα πάνω από το Κανάλι Νερού (~145 βήματα)!",
      bike: "\uD83D\uDEB2 Πλάτωμα \u279C Μικρή Γέφυρα & Κανάλι Νερού (~1 λεπτό)!"
    },
    {
      cx: 692, cy: 352, steps: 265, meters: 175, bikeTime: "~1,5 λεπτό", crossRoad: true, crossPt: [442, 262],
      pts: [[636, 156], [584, 220], [442, 220], [442, 286], [648, 286], [692, 352]],
      safety: "\uD83C\uDF09 Περνάμε ασφαλώς από τη Μικρή Γέφυρα του καναλιού & συνεχίζουμε από το μονοπάτι στο γρασίδι!",
      bikeSafety: "\uD83E\uDE96 Περνάμε προσεκτικά τη γέφυρα της διασταύρωσης & κυλάμε αργά στο μονοπάτι γρασιδιού!",
      walk: "\uD83D\uDC63 Πλάτωμα \u279C Μικρή Γέφυρα \u279C Μονοπάτι Γρασιδιού \u279C Παιδική Χαρά!",
      bike: "\uD83D\uDEB2 Μέσω της Μικρής Γέφυρας & του μονοπατιού φτάνουμε στην Παιδική Χαρά (~1,5')!"
    },
    {
      cx: 256, cy: 118, steps: 240, meters: 160, bikeTime: "~1 λεπτό", crossRoad: false, crossPt: [360, 220],
      pts: [[636, 156], [584, 220], [256, 220], [256, 118]],
      safety: "\uD83D\uDEB8 Περπατάμε στην άκρη του δρόμου Περίστασης πριν μπούμε κάτω από τα πλατάνια!",
      bikeSafety: "\uD83E\uDE96 Κράνος & προσοχή στα αυτοκίνητα στον δρόμο προς Περίσταση!",
      walk: "\uD83D\uDC63 Πλάτωμα \u279C Άλσος Αιωνόβιων Πλατανιών (~240 βήματα στη δροσιά)!",
      bike: "\uD83D\uDEB2 Πλάτωμα \u279C Άλσος Αιωνόβιων Πλατανιών (~1 λεπτό)!"
    },
   {
      cx: 524, cy: 148, steps: 65, meters: 42, bikeTime: "~0,5 λεπτό", crossRoad: false, crossPt: null,
      pts: [[636, 156], [580, 170], [524, 148]],
      safety: "\uD83C\uDF38 Τις μέρες του Πανηγυριού της Διακαινησίμου το πλάτωμα πεζοδρομείται από πλήθος προσκυνητών!",
      bikeSafety: "\uD83D\uDEB6 Στις γιορτές & τα μυστήρια κατεβαίνουμε από το ποδήλατο ανάμεσα στον κόσμο!",
      walk: "\uD83C\uDF38 Στο μεγάλο πλάτωμα για τον Εσπερινό με Αρτοκλασία & το Πανηγύρι της Διακαινησίμου!",
      bike: "\uD83C\uDF38 Χώρος Πανήγυρης Διακαινησίμου, Γάμων & Βαπτίσεων μπροστά στην Πύλη!"
    },
   {
      cx: 808, cy: 334, steps: 310, meters: 205, bikeTime: "~1,5 λεπτό", crossRoad: true, crossPt: [442, 262],
      pts: [[636, 156], [584, 220], [442, 220], [442, 284], [788, 284]],
      safety: "\uD83D\uDCA6 Περνάμε από τη Μικρή Γέφυρα & μένουμε σε απόσταση από την όχθη εκεί που ρίχνει νερό η σωλήνα!",
      bikeSafety: "\uD83E\uDE96 Περνάμε προσεκτικά τη γέφυρα & προσέχουμε την όχθη του καναλιού κοντά στην πομόνα!",
      walk: "\uD83D\uDC63 Πλάτωμα \u279C Μικρή Γέφυρα \u279C Μονοπάτι Όχθης \u279C Κτίριο Πομόνας (200 μ. βάθος)!",
      bike: "\uD83D\uDEB2 Μέσω της Μικρής Γέφυρας φτάνουμε στο κτίριο της Πομόνας δίπλα στο κανάλι (~1,5')!"
    },
    {
      cx: 276, cy: 297, steps: 205, meters: 135, bikeTime: "~1 λεπτό", crossRoad: true, crossPt: [442, 262],
      pts: [[636, 156], [584, 220], [442, 220], [442, 284], [340, 284]],
      safety: "\uD83C\uDF09 Περνάμε προσεκτικά τη Μικρή Γέφυρα και στρίβουμε δεξιά στο μονοπάτι ανάμεσα στα δέντρα!",
      bikeSafety: "\uD83E\uDE96 Κόβουμε ταχύτητα στη γέφυρα του καναλιού πριν φτάσουμε στην Κρήνη!",
      walk: "\uD83D\uDEB0 Πλάτωμα \u279C Μικρή Γέφυρα \u279C Κρήνη με Τρεχούμενο Νερό Ολύμπου!",
      bike: "\uD83D\uDEB2 Μέσω της Μικρής Γέφυρας φτάνουμε στην Κρήνη με το νερό του Ολύμπου (~1')!"
    }
  ];
  /* Σκηνές Καθρέφτη-Κουρτίνας: Παλιός Πέτρινος Ναός vs Καινούριος Ναός */
  var churchMirrorScenes = [
    {
      tab: "\uD83C\uDFDB\uFE0F 1. Πρόσοψη & Είσοδος",
      oldYr: "\uD83E\uDEA8 Παλιός Ναός (Βόρεια)",
      oldIcons: "\uD83E\uDEA8 \uD83E\uDEB5 \uD83D\uDEAA",
      oldImg: photoOldChurch,
      oldCap: "Ο Παλιός Πέτρινος Ναός (αριστερά/βόρεια) με την τετράρριχτη κεραμοσκεπή, το ξύλινο χαγιάτι και τη χαμηλή θύρα",
      oldTitle: "Λιθόκτιστος με Χαγιάτι & Χαμηλή Θύρα",
      oldDesc: "Χαμηλό πέτρινο εκκλησάκι με τετράρριχτη κεραμοσκεπή, σκεπαστό προστώο (χαγιάτι) σε ξύλινους στύλους και χαμηλή θύρα ώστε ο προσκυνητής να σκύβει ευλαβικά μπαίνοντας!",
      newYr: "\u26EA Καινούριος Ναός (Νότια)",
      newIcons: "\uD83E\uDDF1 \uD83D\uDD14 \u26EA",
      newImg: photoShrinePan,
      newCap: "Ο Καινούριος Ναός (δεξιά/νότια, σε επαφή με τον παλιό) με τον πλινθόκτιστο τρούλο, τον τρίτοξο νάρθηκα και το καμπαναριό",
      newTitle: "Πλινθόκτιστος Τρούλος & Τρίτοξος Νάρθηκας",
      newDesc: "Λευκός ναός σε επαφή με τον παλιό, με οκταγωνικό τρούλο από κόκκινα τούβλα, τρίτοξο νάρθηκα με βαθύ κεραμιδί κίονες, ενσωματωμένο καμπαναριό και εξωτερικές αγιογραφίες!"
    },
    {
      tab: "\uD83D\uDD6F\uFE0F 2. Εσωτερικό & Τέμπλο",
      oldYr: "\uD83D\uDD6F\uFE0F Κατάνυξη Παλιού Ναού",
      oldIcons: "\uD83D\uDD6F\uFE0F \uD83E\uDEB5 \uD83D\uDDBC\uFE0F",
      oldImg: photoOldChurch,
      oldCap: "Τα ξυλόγλυπτα προσκυνητάρια (Ζωοδόχου Πηγής & Αγ. Γεωργίου) και τα πέτρινα μανουάλια στην είσοδο του Παλιού Ναού",
      oldTitle: "Ασβεστωμένοι Τοίχοι & Σκούρο Ξύλινο Τέμπλο",
      oldDesc: "Αυθεντική κατανυκτική ατμόσφαιρα με ασβεστωμένους πέτρινους τοίχους, ξύλινη οροφή, παραδοσιακά ξύλινα στασίδια και παλαιό σκούρο ξύλινο τέμπλο με δύο σειρές εικόνων.",
      newYr: "\u2728 Άνεση Νέου Ναού",
      newIcons: "\u2728 \uD83C\uDFDB\uFE0F \uD83D\uDDBC\uFE0F",
      newImg: photoShrinePan,
      newCap: "Ο ευρύχωρος Καινούριος Ναός που καλύπτει τις ανάγκες των πιστών στις πανηγύρεις και τα μυστήρια",
      newTitle: "Λευκό Ανάγλυφο Τέμπλο & Μαρμάρινοι Κίονες",
      newDesc: "Φωτεινός και ευρύχωρος, με λευκό ανάγλυφο τέμπλο, μαρμάρινους κίονες, πολυέλαιο, τη μεγάλη τοιχογραφία της Ζωοδόχου Πηγής και την παλαιά φορητή εικόνα σε προσκυνητάρι!"
    },
    {
      tab: "\uD83C\uDF33 3. Πριν το 1923 & 1941 vs Σήμερα",
      oldYr: "\uD83D\uDD70\uFE0F Παλιό Μονύδριο & 1941",
      oldIcons: "\u26FA \uD83C\uDF5E \uD83C\uDF33",
      oldImg: photoGroveArea,
      oldCap: "Τα αιωνόβια πλατάνια του παλιού μοναστηριού όπου στρατοπέδευσαν την άνοιξη του 1941 οι Νεοζηλανδοί Σύμμαχοι",
      oldTitle: "Παλιό Μοναστήρι & Καταφύγιο Συμμάχων (1941)",
      oldDesc: "Υπήρχε ήδη πριν το 1923 ως παλιό μονύδριο στον κάμπο! Την άνοιξη του 1941 κάτω από τα πλατάνια του έστησαν τις σκηνές τους οι Νεοζηλανδοί Σύμμαχοι (ANZAC), τρώγοντας ζυμωτό ψωμί από τις οικογένειες της Περίστασης.",
     newYr: "\uD83C\uDF38 Σήμερα στο Προσκύνημα",
      newIcons: "\uD83C\uDF38 \uD83D\uDEDD \u267F",
      newImg: photoCourtyard,
      newCap: "Σήμερα: Ο περιποιημένος αυλόγυρος με το αρχονταρίκι, το κυκλικό παγκάκι του πλατάνου και τους δύο ναούς στον ίδιο περίβολο",
      newTitle: "Πανήγυρη Διακαινησίμου, Μυστήρια & Οικογένειες",
      newDesc: "Αγαπημένο παρεκκλήσι του Αγ. Γεωργίου Περίστασης, με μεγάλη πανήγυρη την Παρασκευή της Διακαινησίμου, γάμους, βαπτίσεις, πρόσβαση ΑμεΑ και παιδική χαρά κάτω από τα δέντρα!"
    }
  ];

  /* Ιστορικοί Σταθμοί Εποχής «Άνοιξη 1941» */
  var hist1941Stops = [
    {
      cx: 842, cy: 78, color: "#b45309", steps: 0, meters: 0, bikeTime: "0 λεπτά",
      crossRoad: false, crossPt: null, pts: [[842, 78]], walkerPt: [792, 92],
      modernSpot: 1,
      chip: "1. \uD83C\uDFDB\uFE0F Παλιό Μονύδριο",
      img: photoOldChurch,
      cap: "Το ιστορικό πέτρινο εκκλησάκι της Παναγίας Ζωοδόχου Πηγής (υπήρχε ήδη πριν το 1923)",
      walk: "\uD83C\uDFDB\uFE0F <strong>Το Παλιό Μονύδριο (πριν το 1923 &amp; 1941):</strong> Τότε υπήρχε μόνο ο χαμηλός πέτρινος ναός με το ξύλινο χαγιάτι (ο καινούριος ναός δεν είχε χτιστεί ακόμη)!",
      bike: "\uD83D\uDC34 <strong>Το Παλιό Μονύδριο στον Κάμπο:</strong> Οι πρόσφυγες του 1923\u20131924 το βρήκαν εδώ ανάμεσα στα πλατάνια και το αγάπησαν αμέσως!",
      safety: "\uD83D\uDD6F\uFE0F Χαμηλή θύρα ευλάβειας, ασβεστωμένοι πέτρινοι τοίχοι & πέτρινα μανουάλια!",
      bikeSafety: "\uD83D\uDC0E Χωματόδρομος ανάμεσα στα μποστάνια του κάμπου από την Περίσταση (1,2 χλμ)!"
    },
    {
      cx: 268, cy: 118, color: "#059669", steps: 260, meters: 170, bikeTime: "~3 λεπτά",
      crossRoad: false, crossPt: null, pts: [[760, 128], [620, 218], [268, 218], [268, 118]],
      modernSpot: 6,
      chip: "2. \u26FA Στρατόπεδο ANZAC",
      img: photoGroveArea,
      cap: "Άνοιξη 1941: Κάτω από τα πυκνά πλατάνια της Ζωοδόχου Πηγής κρύφτηκαν οι σκηνές των Νεοζηλανδών Συμμάχων",
      walk: "\u26FA <strong>Κρυφό Στρατόπεδο Νεοζηλανδών (Μάρτιος\u2013Απρίλιος 1941):</strong> Στρατιώτες της 2ης Μεραρχίας Νέας Ζηλανδίας (~17.500 χλμ. μακριά απ' την πατρίδα τους!) έστησαν εδώ τις σκηνές τους!",
      bike: "\u26FA <strong>Στρατόπεδο Συμμάχων ANZAC (1941):</strong> 35 φορές μακρύτερα από το ταξίδι του 1922 ταξίδεψαν οι Νεοζηλανδοί για να σταθούν δίπλα στην Ελλάδα!",
      safety: "\uD83C\uDF33 Οι πυκνές φυλλωσιές των πλατανιών έκρυβαν τις σκηνές από τα εχθρικά αεροπλάνα!",
      bikeSafety: "\uD83C\uDF0F 17.500 χλμ. από τη Νέα Ζηλανδία έως τα πλατάνια της Περίστασης!"
    },
   {
      cx: 562, cy: 158, color: "#d97706", steps: 1800, meters: 1200, bikeTime: "~15 λεπτά",
      crossRoad: false, crossPt: null, pts: [[56, 220], [508, 220], [562, 158]],
      modernSpot: 0,
      chip: "3. \uD83C\uDF5E Ζυμωτό Ψωμί",
      img: photoShrinePan,
      cap: "Απρίλιος 1941: Το ξέφωτο όπου οι κάτοικοι της Περίστασης έφερναν ζεστό ζυμωτό ψωμί στους Συμμάχους",
      walk: "\uD83C\uDF5E <strong>Το Ζυμωτό Ψωμί της Ανθρωπιάς (1941):</strong> Οι οικογένειες της Περίστασης —άνθρωποι της προσφυγιάς— έφερναν από τον πάνω χωματόδρομο ζεστό ζυμωτό ψωμί και αυγά στους νεαρούς στρατιώτες!",
      bike: "\uD83D\uDC34 <strong>Μοιρασμένο Ψωμί απ' το Υστέρημα (1941):</strong> Με καλάθια και κάρα κατέβαιναν οι Περιστασιανοί για να φροντίσουν σαν δικά τους παιδιά τους Νεοζηλανδούς!",
      safety: "\uD83E\uDD1D Ακόμη και δεκαετίες μετά στη Νέα Ζηλανδία, οι βετεράνοι θυμόντουσαν το ψωμί της Πιερίας!",
      bikeSafety: "\uD83D\uDC9B Ιστορία αλληλεγγύης που ενώνει την Περίσταση με την άλλη άκρη της Γης!"
    },
    {
      cx: 442, cy: 262, color: "#0284c7", steps: 175, meters: 115, bikeTime: "~2 λεπτά",
      crossRoad: true, crossPt: [442, 220], pts: [[760, 128], [610, 220], [442, 220], [442, 262]],
      modernSpot: 4,
     chip: "4. \uD83C\uDF09 Γεφυράκι & Νερό",
      img: customZoodPhotos.gefyraKanali,
      cap: "Η μικρή γέφυρα πάνω από το κανάλι νερού στη διασταύρωση προς την Κατερίνη",
      walk: "\uD83D\uDCA7 <strong>Παλιό Γεφυράκι &amp; Κανάλι Νερού (1941):</strong> Δίπλα στο δροσερό νερό του κάμπου περνούσε το γεφυράκι του χωματόδρομου που ένωνε την Κατερίνη με το εξωκλήσι!",
      bike: "\uD83D\uDC34 <strong>Πέρασμα Γέφυρας προς Κατερίνη (1941):</strong> Από εδώ περνούσαν τα κάρα των γεωργών πάνω από το αυλάκι νερού!",
      safety: "\uD83D\uDCA7 Το νερό πότιζε τα μποστάνια, τα χωράφια και τα μεγάλα πλατάνια του μοναστηριού!",
      bikeSafety: "\uD83D\uDC0E Προσεκτικό πέρασμα των ζώων και των κάρων πάνω από το στενό γεφυράκι!"
    },
    {
      cx: 692, cy: 352, color: "#15803d", steps: 280, meters: 185, bikeTime: "~3,5 λεπτά",
      crossRoad: true, crossPt: [442, 262], pts: [[760, 128], [610, 220], [442, 220], [442, 286], [648, 286], [692, 352]],
      modernSpot: 5,
      chip: "5. \uD83C\uDF3F Νότιο Καταφύγιο",
      img: photoGroveArea,
      cap: "Η νότια όχθη του καναλιού κάτω από τα δέντρα (εκεί όπου σήμερα βρίσκεται η Παιδική Χαρά)",
      walk: "\uD83C\uDF3F <strong>Νότιο Άλσος Πλατανιών (1941):</strong> Εκεί όπου σήμερα παίζουν τα παιδιά στην Παιδική Χαρά, το 1941 απλωνόταν πυκνό άλσος που προστάτευε τον καταυλισμό στη νότια όχθη του καναλιού!",
      bike: "\uD83C\uDF3F <strong>Από τις Σκηνές του 1941 στις Κούνιες του Σήμερα:</strong> Πάτησε «Πού πέφτει αυτό σήμερα;» για να δεις πώς μεταμορφώθηκε αυτό ακριβώς το σημείο!",
     safety: "\uD83D\uDD4A\uFE0F Σήμερα στο ίδιο ειρηνικό ξέφωτο αντηχούν μόνο παιδικά γέλια!",
      bikeSafety: "\uD83C\uDF09 Πρόσβαση περνώντας το γεφυράκι της διασταύρωσης και το μονοπάτι της όχθης!"
    },
   {
      cx: 276, cy: 297, color: "#0d9488", steps: 215, meters: 140, bikeTime: "~2,5 λεπτά",
      crossRoad: true, crossPt: [442, 262], pts: [[760, 128], [610, 220], [442, 220], [442, 284], [340, 284]],
      modernSpot: 9,
      chip: "6. \uD83D\uDEB0 Κρήνη Ολύμπου",
      img: customZoodPhotos.krini,
      cap: "Η κρήνη με το τρεχούμενο νερό από τον Όλυμπο — σημείο υδροληψίας κατοίκων όλης της γύρω περιοχής έως τα τέλη του 20ού αιώνα",
      walk: "\uD83D\uDEB0 <strong>Η Κρήνη με το Νερό του Ολύμπου (1941 &amp; 20ός αι.):</strong> Με γάργαρο τρεχούμενο νερό από τον Όλυμπο ξεδιψούσε τους στρατιώτες του 1941, ενώ έως και τα τέλη του 20ού αιώνα κάτοικοι από διάφορες γύρω περιοχές έρχονταν εδώ για να πάρουν νερό!",
      bike: "\uD83D\uDC34 <strong>Κρήνη Νερού Ολύμπου:</strong> Εδώ σταματούσαν κάρα και οικογένειες απ' όλη τη γύρω περιοχή (μέχρι και τα τέλη του 20ού αιώνα!) για να γεμίσουν δοχεία με τρεχούμενο νερό!",
      safety: "\uD83C\uDFD4\uFE0F Καθαρό, δροσερό και ασταμάτητα τρεχούμενο νερό που κατέβαινε από τον Όλυμπο!",
      bikeSafety: "\uD83E\uDED9 Σημείο δροσιάς για γεωργούς, περαστικούς και κατοίκους πολλών γειτονικών περιοχών!"
    }
  ];
  /* =========================================================================
     ΚΑΤΑΣΤΑΣΗ ΧΑΡΤΗ, ΚΛΕΙΔΩΜΑ SCROLL & ΙΣΤΟΡΙΚΟ ΠΕΡΙΗΓΗΤΗ (BACK BUTTON)
     ========================================================================= */
  var mapWrap = null;
  var mapModalBg = null;
  var mapPlaceholder = null;
  var mapZoomBtn = null;
  var mapStatusEl = null;
  var mapWalkBgPath = null;
  var mapWalkPath = null;
  var mapPulseRing = null;
 var mapWalkerEl = null;
  var mapWalkerFlipEl = null;
  var mapCrossAlertEl = null;
  var mapCrossIconEl = null;
  var mapScrollEl = null;
  var mapModernNodes = null;
  var mapHistNodes = null;
  var mapExitNodes = null;

  var activeSpotIdx = -1;
  var tourActiveSpotIdx = -1;
  var activeSpecialKey = "";
  var isPastEra = false;
  var activeHistIdx = 0;
  var spatialBridgeHistIdx = -1;
  var travelMode = "walk";

  var isMapZoomed = false;
  var histMapZoom = false;
  var histImgZoom = false;
  var ignorePopCount = 0;
  var lastMapFocusEl = null;
  var lastZoomFocusEl = null;
  var streetZoomOn = true;
  var lastTargetX = 636;
  var lastTargetY = 156;
  var walkAnimRaf = null;
  var activeWalkSnap = null;
 var mapScrollAbort = false;
  var walkDimsDirty = true;
  var cachedScW = 0, cachedCW = 0, cachedScH = 0, cachedCH = 0;
  var tourTimer = null;
  var isModernTourRunning = false;
  var isHistTourRunning = false;
  var curTourStage = -1;

 var ownScrollLocked = false;
  var savedOverflow = "";
  var savedBodyPadRight = "";
  var bdTouchX = 0, bdTouchY = 0, bdLastX = 0, bdLastY = 0, bdMulti = false;

var bdDirX = 0, bdDirY = 0;
  function trackBdTouchStart(e) {
    if (!e.touches || e.touches.length > 1) { bdMulti = true; return; }
    bdMulti = false;
    bdDirX = bdDirY = 0;
    bdTouchX = bdLastX = e.touches[0].clientX;
    bdTouchY = bdLastY = e.touches[0].clientY;
  }

  function checkNodeAxis(node, d, isX) {
    var over = isX ? (node.scrollWidth > node.clientWidth + 1) : (node.scrollHeight > node.clientHeight + 1);
    if (!over) return false;
    var cs = window.getComputedStyle(node);
    var ov = isX ? cs.overflowX : cs.overflowY;
    if (ov !== "auto" && ov !== "scroll") return false;
    return isX
      ? ((d < 0 && node.scrollLeft > 0) || (d > 0 && Math.ceil(node.scrollLeft + node.clientWidth) < node.scrollWidth))
      : ((d < 0 && node.scrollTop > 0) || (d > 0 && Math.ceil(node.scrollTop + node.clientHeight) < node.scrollHeight));
  }

  function canScrollInsideBox(startNode, rootBox, stepX, stepY) {
    var ax = Math.abs(stepX), ay = Math.abs(stepY);
    if (ax === 0 && ay === 0) return true;
    var horizFirst = ax >= ay;
    var secOk = horizFirst ? (ay >= 1.5 && ay >= ax * 0.35) : (ax >= 1.5 && ax >= ay * 0.35);
    var node = (startNode && startNode.nodeType === 1) ? startNode : (startNode ? startNode.parentElement : null);
    while (node && node !== document.body && node !== document.documentElement) {
      if (horizFirst) {
        if (ax > 0 && checkNodeAxis(node, stepX, true)) return true;
        if (secOk && checkNodeAxis(node, stepY, false)) return true;
      } else {
        if (ay > 0 && checkNodeAxis(node, stepY, false)) return true;
        if (secOk && checkNodeAxis(node, stepX, true)) return true;
      }
      if (node === rootBox) break;
      node = node.parentElement;
    }
    return false;
  }

  function preventBdScroll(e) {
    if (e.ctrlKey || isPinchZoomed()) return;
    if (e.type === "touchmove" && (bdMulti || !e.touches || e.touches.length > 1 || (typeof e.scale === "number" && Math.abs(e.scale - 1) > 0.02))) {
      bdMulti = true;
      return;
    }
    if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    var rawT = e.target;
    var t = (rawT && rawT.nodeType === 1) ? rawT : (rawT ? rawT.parentElement : null);
    var box = (t && t.closest) ? t.closest(".pzood-map-wrap.is-zoomed") : null;
    if (!box) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (t.closest("input, select, textarea, .pzood-curtain-stage")) return;
    var stepX = 0, stepY = 0;
    if (e.type === "touchmove") {
      var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      stepX = bdLastX - cx;
      stepY = bdLastY - cy;
      bdLastX = cx;
      bdLastY = cy;
      if (stepX !== 0 || stepY !== 0) {
        bdDirX = stepX;
        bdDirY = stepY;
      } else {
        stepX = bdDirX;
        stepY = bdDirY;
      }
    } else if (e.type === "wheel") {
      stepX = e.deltaX || 0;
      stepY = e.deltaY || 0;
    }
    if ((stepX !== 0 || stepY !== 0) && !canScrollInsideBox(t, box, stepX, stepY)) {
      if (e.cancelable) e.preventDefault();
    }
  }

 var bdListenersBound = false;
  function bindBdScrollGuard() {
    if (bdListenersBound) return;
    document.addEventListener("touchstart", trackBdTouchStart, { passive: true });
    document.addEventListener("wheel", preventBdScroll, { passive: false });
    document.addEventListener("touchmove", preventBdScroll, { passive: false });
    bdListenersBound = true;
  }
  function unbindBdScrollGuard() {
    if (!bdListenersBound) return;
    document.removeEventListener("touchstart", trackBdTouchStart);
    document.removeEventListener("wheel", preventBdScroll);
    document.removeEventListener("touchmove", preventBdScroll);
    bdListenersBound = false;
  }

  function lockPageScroll() {
    document.body.classList.add("pzood-overlay-open");
    bindBdScrollGuard();
    if (ownScrollLocked || document.body.classList.contains("pexp-overlay-open")) return;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    savedBodyPadRight = document.body.style.paddingRight || "";
    if (sbw > 0) {
      var curPad = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = (curPad + sbw) + "px";
    }
    var scEl = document.scrollingElement || document.documentElement;
    savedOverflow = scEl.style.overflow || "";
    scEl.style.overflow = "hidden";
    ownScrollLocked = true;
  }

  function unlockPageScroll() {
    if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
      lockPageScroll();
      if (!ownScrollLocked) {
        requestAnimationFrame(function() {
          if (zoomOverlay && zoomOverlay.classList.contains("is-open")) lockPageScroll();
        });
      }
      return;
    }
    if (isMapZoomed && ownScrollLocked) return;
    document.body.classList.remove("pzood-overlay-open", "pzood-zoom-open");
    unbindBdScrollGuard();
    if (!ownScrollLocked) return;
    if (!document.body.classList.contains("pexp-overlay-open")) {
      var scEl = document.scrollingElement || document.documentElement;
      scEl.style.overflow = savedOverflow;
      document.body.style.paddingRight = savedBodyPadRight;
    }
    ownScrollLocked = false;
  }

 function isFocusableVis(el, rootBox) {
    if (!el || (el.closest && el.closest('[aria-hidden="true"], [inert], .is-paused'))) return false;
    var rects = el.getClientRects();
    if (!rects || !rects.length || (rects[0].width <= 0 && rects[0].height <= 0)) return false;
    if (rootBox && mapWrap && rootBox !== mapWrap && !mapWrap.contains(el)) {
      var br = rootBox.getBoundingClientRect();
      var r = rects[0];
      if (r.right <= br.left + 2 || r.left >= br.right - 2 || r.bottom <= br.top + 2 || r.top >= br.bottom - 2) return false;
    }
    var cs = window.getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.pointerEvents !== "none";
  }

  function trapFocusIn(container, ev) {
    var nodes = container.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])');
    if (!nodes.length) return;
    var act = document.activeElement, inside = container.contains(act), first = null, last = null, i;
    for (i = 0; i < nodes.length; i++) { if (isFocusableVis(nodes[i], container)) { first = nodes[i]; break; } }
    for (i = nodes.length - 1; i >= 0; i--) { if (isFocusableVis(nodes[i], container)) { last = nodes[i]; break; } }
    if (!first || !last) return;
    if (ev.shiftKey) {
      if (!inside || act === first) { ev.preventDefault(); last.focus(); }
    } else {
      if (!inside || act === last) { ev.preventDefault(); first.focus(); }
    }
  }

 function findClosestSvgNode(nodeList, clientX, clientY, maxDist) {
    if (!nodeList || !nodeList.length || typeof clientX !== "number" || typeof clientY !== "number") return null;
    if (clientX === 0 && clientY === 0) return null;
    var svg = nodeList[0].ownerSVGElement;
    if (!svg || !svg.viewBox || !svg.viewBox.baseVal || !svg.viewBox.baseVal.width) return null;
    var sr = svg.getBoundingClientRect();
    if (!sr.width || !sr.height) return null;
    var bdKey = Math.round(sr.width);
    if (svg._bdKey !== bdKey) {
      var cs = window.getComputedStyle(svg);
      svg._bw = parseFloat(cs.borderLeftWidth) || 0;
      svg._bt = parseFloat(cs.borderTopWidth) || 0;
      svg._bdKey = bdKey;
    }
    var iw = sr.width - svg._bw * 2, ih = sr.height - svg._bt * 2;
    var vb = svg.viewBox.baseVal;
    var sc = Math.min(iw / vb.width, ih / vb.height);
    var ox = sr.left + svg._bw + (iw - vb.width * sc) * 0.5;
    var oy = sr.top + svg._bt + (ih - vb.height * sc) * 0.5;
    var best = null, bestD2 = maxDist * maxDist;
   for (var i = 0; i < nodeList.length; i++) {
      var nd = nodeList[i];
      var pt = nd._svgPt, bx = nd._svgBox, dx = 0, dy = 0;
      if (!pt && !bx) {
        var c = nd._hitCircle || (nd._hitCircle = nd.querySelector("circle"));
        if (c) {
          pt = nd._svgPt = [parseFloat(c.getAttribute("cx")) || 0, parseFloat(c.getAttribute("cy")) || 0];
        } else {
          var rEl = nd.querySelector("rect");
          if (rEl) {
            var rx = parseFloat(rEl.getAttribute("x")) || 0, ry = parseFloat(rEl.getAttribute("y")) || 0;
            bx = nd._svgBox = [rx, ry, rx + (parseFloat(rEl.getAttribute("width")) || 0), ry + (parseFloat(rEl.getAttribute("height")) || 0)];
          }
        }
      }
      if (pt) {
        dx = clientX - (ox + pt[0] * sc);
        dy = clientY - (oy + pt[1] * sc);
      } else if (bx) {
        dx = clientX - Math.max(ox + bx[0] * sc, Math.min(ox + bx[2] * sc, clientX));
        dy = clientY - Math.max(oy + bx[1] * sc, Math.min(oy + bx[3] * sc, clientY));
      } else {
        continue;
      }
      var d2 = dx * dx + dy * dy;
      if (d2 <= bestD2) { bestD2 = d2; best = nd; }
    }
    return best;
  }

  function syncSvgActiveFx() {
    var svgEl = document.getElementById("pzoodMapSvg");
    if (!svgEl) return;
    var fx = "";
    if (detActive && !detWaiting) {
      fx = "";
    } else if (activeSpecialKey !== "") {
      fx = "";
   } else if (isPastEra) {
      fx = (activeHistIdx === 0) ? "old-church" : ((activeHistIdx === 5) ? "krini" : "");
    } else {
      var sp = activeSpotIdx !== -1 ? activeSpotIdx : tourActiveSpotIdx;
      if (sp === 0 || sp === 3) fx = "amea";
      else if (sp === 1) fx = "old-church";
      else if (sp === 2) fx = "new-church";
      else if (sp === 7) fx = "panigiri";
      else if (sp === 8) fx = "pomona";
      else if (sp === 9) fx = "krini";
    }
    if (fx) svgEl.setAttribute("data-active-fx", fx);
    else svgEl.removeAttribute("data-active-fx");
  }

var safeBackTimer = 0;
  function safeBack(steps) {
    var n = steps || 1;
    if (n <= 0) return;
    ignorePopCount++;
    if (safeBackTimer) clearTimeout(safeBackTimer);
    safeBackTimer = setTimeout(function() {
      safeBackTimer = 0;
      ignorePopCount = 0;
    }, 450);
    try {
      if (n === 1) window.history.back();
      else window.history.go(-n);
    } catch (e) {
      ignorePopCount = Math.max(0, ignorePopCount - 1);
      if (ignorePopCount === 0 && safeBackTimer) {
        clearTimeout(safeBackTimer);
        safeBackTimer = 0;
      }
    }
  }

  function runAfterBack(didBack, fn) {
    if (!didBack) { requestAnimationFrame(fn); return; }
    var done = false;
    var finish = function(fromTimeout) {
      if (!fromTimeout && ignorePopCount > 0) return;
      if (done) return;
      done = true;
      window.removeEventListener("popstate", onPop);
      requestAnimationFrame(function() { requestAnimationFrame(fn); });
    };
    var onPop = function() { finish(false); };
    window.addEventListener("popstate", onPop);
    setTimeout(function() { finish(true); }, 240);
  }
  try {
    if (window.history.state && (window.history.state.pzoodMapZoom || window.history.state.pzoodZoom)) {
      var cleanSt = Object.assign({}, window.history.state);
      delete cleanSt.pzoodMapZoom;
      delete cleanSt.pzoodZoom;
      window.history.replaceState(Object.keys(cleanSt).length ? cleanSt : null, "", window.location.href);
    }
  } catch (e) {}

 var allExpKeys = ["spot0", "spot1", "spot2", "spot3", "spot4", "spot5", "spot6", "spot7", "spot8", "spot9"];
  var exploredMap = {};
  var gamesWon = {};
  try {
    var svExp = JSON.parse(localStorage.getItem("pzood_explored_8") || "null");
    if (svExp && typeof svExp === "object") exploredMap = svExp;
    var svWon = JSON.parse(localStorage.getItem("pzood_games_won") || "null");
    if (svWon && typeof svWon === "object") gamesWon = svWon;
  } catch (e) {}

  /* =========================================================================
     ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ ΑΦΗΣ (SWIPE, DRAG-SCROLL, DOUBLE-TAP)
     ========================================================================= */
  var lastTouchTs = 0;
  document.addEventListener("touchstart", function() { lastTouchTs = performance.now(); }, { passive: true });

  function bindDragScroll(scEl, onDragStart) {
    if (!scEl || scEl._pzDragBound) return;
    scEl._pzDragBound = true;
    var down = false, dragged = false, sx = 0, sy = 0, sl = 0, st = 0, supUntil = 0;
    var onMove = function(e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!dragged) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        dragged = true;
        scEl.classList.add("is-drag-scrolling");
        if (onDragStart) onDragStart();
      }
      if (e.cancelable) e.preventDefault();
      scEl.scrollLeft = sl - dx;
      scEl.scrollTop = st - dy;
    };
    var onUp = function() {
      if (!down) return;
      down = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      scEl.classList.remove("is-drag-scrolling");
      if (dragged) { supUntil = performance.now() + 140; dragged = false; }
    };
    scEl.addEventListener("mousedown", function(e) {
      if (e.button !== 0 || performance.now() - lastTouchTs < 600) return;
      if (scEl.scrollWidth <= scEl.clientWidth + 2 && scEl.scrollHeight <= scEl.clientHeight + 2) return;
      down = true; dragged = false;
      sx = e.clientX; sy = e.clientY; sl = scEl.scrollLeft; st = scEl.scrollTop;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });
    scEl.addEventListener("click", function(e) {
      if (performance.now() < supUntil) { supUntil = 0; e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  function bindDoubleTap(el, ignoreSel, cb) {
    if (!el || el._pzDblBound) return;
    el._pzDblBound = true;
    var lastT = 0, lx = 0, ly = 0, sx = 0, sy = 0, multi = false, lastExec = 0;
    el.addEventListener("dblclick", function(e) {
      if (isPinchZoomed() || performance.now() - lastExec < 380) return;
      if (ignoreSel && e.target.closest(ignoreSel)) return;
      if (cb(e.clientX, e.clientY)) { e.preventDefault(); e.stopPropagation(); lastExec = performance.now(); }
    });
    el.addEventListener("touchstart", function(e) {
      if (!e.touches || e.touches.length !== 1 || isPinchZoomed()) { multi = true; return; }
      multi = false; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener("touchmove", function(e) {
      if (!e.touches || e.touches.length > 1) multi = true;
    }, { passive: true });
    el.addEventListener("touchend", function(e) {
      if (multi || isPinchZoomed() || !e.changedTouches || e.changedTouches.length !== 1) { lastT = 0; return; }
      if (ignoreSel && e.target.closest(ignoreSel)) { lastT = 0; return; }
      var cx = e.changedTouches[0].clientX, cy = e.changedTouches[0].clientY;
      if (Math.abs(cx - sx) > 10 || Math.abs(cy - sy) > 10) { lastT = 0; return; }
      var now = performance.now();
      if (now - lastT < 300 && Math.abs(cx - lx) < 28 && Math.abs(cy - ly) < 28) {
        lastT = 0;
        if (cb(cx, cy)) { lastExec = now; if (e.cancelable) e.preventDefault(); }
      } else {
        lastT = now; lx = cx; ly = cy;
      }
    }, { passive: false });
  }

function hasInnerHorizScroll(startEl, stopEl) {
    var nd = (startEl && startEl.nodeType === 1) ? startEl : (startEl ? startEl.parentElement : null);
    while (nd && nd !== stopEl && nd !== document.body) {
      if (nd.scrollWidth > nd.clientWidth + 2) {
        var ox = window.getComputedStyle(nd).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
      }
      nd = nd.parentElement;
    }
    return false;
  }

  function bindSwipe(el, onLeft, onRight) {
    if (!el) return;
    var sx = 0, sy = 0, lx = 0, ly = 0, multi = false, ignore = false, lock = 0, supUntil = 0;
    var ignSel = (el.classList && el.classList.contains("pzood-mirror-pair"))
      ? ".pzood-curtain-stage, .pzood-chips-row, input, button"
      : ".pzood-curtain-stage, .pzood-mirror-box, .pzood-chips-row, input, button";
    el.addEventListener("touchstart", function(e) {
      if (!e.touches || e.touches.length > 1 || isPinchZoomed()) { multi = true; lock = 0; return; }
      var t = e.target;
      ignore = !!((t && t.closest && t.closest(ignSel)) || hasInnerHorizScroll(t, el));
      multi = false; lock = 0;
      sx = lx = e.touches[0].clientX; sy = ly = e.touches[0].clientY;
    }, { passive: true });
   el.addEventListener("touchmove", function(e) {
      if (!e.touches || e.touches.length > 1 || isPinchZoomed()) { multi = true; lock = 0; return; }
      if (multi || ignore) return;
      lx = e.touches[0].clientX; ly = e.touches[0].clientY;
      var dx = Math.abs(lx - sx), dy = Math.abs(ly - sy);
      if (lock === 0) {
        if (dy >= 7 && dy > dx * 1.05) lock = -1;
        else if (dx >= 7 && dx > dy * 1.15) lock = 1;
      }
      if (lock === 1 && e.cancelable) e.preventDefault();
    }, { passive: false });
    el.addEventListener("touchend", function(e) {
      if (e.touches && e.touches.length > 0) { multi = true; lock = 0; return; }
      if (multi || ignore || lock === -1 || isPinchZoomed()) { multi = false; lock = 0; return; }
      var ch = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      var dx = (ch ? ch.clientX : lx) - sx, dy = (ch ? ch.clientY : ly) - sy;
      lock = 0;
      if (Math.abs(dx) >= 30 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        supUntil = performance.now() + 320;
        if (dx < 0 && onLeft) onLeft();
        else if (dx > 0 && onRight) onRight();
      }
    }, { passive: true });
    el.addEventListener("touchcancel", function() {
      multi = false; lock = 0;
    }, { passive: true });
    el.addEventListener("click", function(e) {
      if (performance.now() < supUntil) { supUntil = 0; e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* =========================================================================
     LIGHTBOX ΦΩΤΟΓΡΑΦΙΩΝ ΜΕ ΛΕΠΤΟΜΕΡΕΣ ΖΟΥΜ ΕΩΣ 3,5x (ΡΟΔΕΛΑ, ΔΙΠΛΟ ΤΑΠ, PINCH)
     ========================================================================= */
 var zoomList = [];
  var zoomIdx = 0;
  var zScale = 1, zTx = 0, zTy = 0, zAnimT = 0, zSuppressClose = 0;
  var resetZoomGesture = null;

  function clampPhotoPan(s, tx, ty) {
    if (!zoomTarget || !zoomImgWrap || s <= 1.01) return { x: 0, y: 0 };
    var bw = zoomTarget.offsetWidth || 0, bh = zoomTarget.offsetHeight || 0;
    if (!bw || !bh) return { x: 0, y: 0 };
    var wr = zoomImgWrap.getBoundingClientRect();
    var cx0 = wr.left + wr.width * 0.5, cy0 = wr.top + wr.height * 0.5;
    var vw = window.innerWidth || 800, vh = window.innerHeight || 600;
    var hw = bw * s * 0.5, hh = bh * s * 0.5, pad = 16;
    return {
      x: Math.max(Math.min(0, (vw - pad) - cx0 - hw), Math.min(Math.max(0, hw - cx0 + pad), tx)),
      y: Math.max(Math.min(0, (vh - pad) - cy0 - hh), Math.min(Math.max(0, hh - cy0 + pad), ty))
    };
  }

  function applyPhotoDetailZoom(s, tx, ty, anim) {
    if (!zoomTarget || !zoomOverlay) return;
    var clS = Math.max(1, Math.min(3.5, s));
    if (clS <= 1.01) { clS = 1; tx = 0; ty = 0; }
    else { var cl = clampPhotoPan(clS, tx, ty); tx = cl.x; ty = cl.y; }
    zScale = clS; zTx = tx; zTy = ty;
    var isDet = clS > 1.01;
    zoomOverlay.classList.toggle("is-detail-zoomed", isDet);
    if (!isDet) zoomOverlay.classList.remove("is-panning-zoom");
    if (zAnimT) { clearTimeout(zAnimT); zAnimT = 0; }
    if (anim) {
      zoomTarget.classList.add("is-zoom-anim");
      zAnimT = setTimeout(function() { if (zoomTarget) zoomTarget.classList.remove("is-zoom-anim"); }, 240);
    } else {
      zoomTarget.classList.remove("is-zoom-anim");
    }
    zoomTarget.style.transform = isDet ? ("translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + clS.toFixed(3) + ")") : "";
  }

  function zoomPhotoAtPt(nextS, cx, cy, anim) {
    if (!zoomTarget || !zoomImgWrap) return;
    var clS = Math.max(1, Math.min(3.5, nextS));
    if (clS <= 1.01) { applyPhotoDetailZoom(1, 0, 0, anim); return; }
    var wr = zoomImgWrap.getBoundingClientRect();
    var cx0 = wr.left + wr.width * 0.5, cy0 = wr.top + wr.height * 0.5;
    var ratio = clS / (zScale || 1);
    applyPhotoDetailZoom(clS, cx - cx0 - (cx - cx0 - zTx) * ratio, cy - cy0 - (cy - cy0 - zTy) * ratio, anim);
  }

 function renderZoomPhoto() {
    var it = zoomList[zoomIdx];
    if (!it || !zoomTarget) return;
    if (resetZoomGesture) resetZoomGesture();
    applyPhotoDetailZoom(1, 0, 0, false);
    var suffix = zoomList.length > 1 ? " (" + (zoomIdx + 1) + "/" + zoomList.length + ")" : "";
    if (zoomCap) zoomCap.textContent = (it.caption || "") + suffix;
    zoomTarget.alt = it.caption || "";
    if (zoomImgWrap) zoomImgWrap.classList.add("is-loading");
    zoomTarget.style.opacity = "0";
    zoomTarget.onload = function() {
      if (zoomImgWrap) zoomImgWrap.classList.remove("is-loading");
      zoomTarget.style.opacity = "1";
    };
 var fullOpt = optImg(it.src, 1600);
    var noRwOpt = stripRwParam(fullOpt);
    var triedNoRw = false, triedOrig = false, triedFb = false;
    zoomTarget.onerror = function() {
      if (!triedNoRw && noRwOpt && noRwOpt !== fullOpt && zoomTarget.src !== noRwOpt) {
        triedNoRw = true;
        zoomTarget.src = noRwOpt;
        return;
      }
      if (!triedOrig && it.src && it.src !== fullOpt && zoomTarget.src !== it.src) {
        triedOrig = true;
        zoomTarget.src = it.src;
        return;
      }
      if (!triedFb && it.fallbackSrc && zoomTarget.src !== it.fallbackSrc) {
        triedFb = true;
        zoomTarget.src = it.fallbackSrc;
        return;
      }
      if (zoomImgWrap) zoomImgWrap.classList.remove("is-loading");
      zoomTarget.style.opacity = "1";
      zoomTarget.src = fallbackSvg;
    };
    zoomTarget.src = fullOpt;
    var navDisp = zoomList.length > 1 ? "flex" : "none";
    if (zoomPrevBtn) zoomPrevBtn.style.display = navDisp;
    if (zoomNextBtn) zoomNextBtn.style.display = navDisp;
  }

 function openPhotoZoom(list, startIdx, trigEl) {
    if (!zoomOverlay || !list || !list.length) return;
    var rawIdx = (startIdx >= 0 && startIdx < list.length) ? startIdx : 0;
    var clickedItem = list[rawIdx] || list[0];
    var dedupList = [];
    var seenBySrc = {};
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it || !it.src) continue;
      if (typeof seenBySrc[it.src] === "undefined") {
        seenBySrc[it.src] = dedupList.length;
        dedupList.push({ src: it.src, fallbackSrc: it.fallbackSrc || "", caption: it.caption || "" });
      }
    }
    var mappedIdx = 0;
    if (clickedItem && clickedItem.src && typeof seenBySrc[clickedItem.src] === "number") {
      mappedIdx = seenBySrc[clickedItem.src];
      if (clickedItem.caption) dedupList[mappedIdx].caption = clickedItem.caption;
      if (clickedItem.fallbackSrc) dedupList[mappedIdx].fallbackSrc = clickedItem.fallbackSrc;
    }
 if (window.peristasiBridge && window.peristasiBridge.pauseHeroVideo) window.peristasiBridge.pauseHeroVideo();
    clearZoodPendingTimers();
    stopAllTours();
    stopWalkAnim(true);
    var wasOpen = zoomOverlay.classList.contains("is-open");
    if (!wasOpen) {
      lastZoomFocusEl = trigEl || document.activeElement;
      if (zoomOverlay.parentNode !== document.body) document.body.appendChild(zoomOverlay);
    }
    zoomList = dedupList.length ? dedupList : list;
    zoomIdx = mappedIdx;
    renderZoomPhoto();
    zoomOverlay.classList.add("is-open");
    zoomOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("pzood-zoom-open");
    lockPageScroll();
    if (!wasOpen) {
      requestAnimationFrame(function() {
        if (zoomCloseBtn && zoomCloseBtn.focus) {
          try { zoomCloseBtn.focus({ preventScroll: true }); } catch (e) { zoomCloseBtn.focus(); }
        }
      });
     var syncZoomHist = function() {
        if (histImgZoom || !zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
        if (ignorePopCount > 0) { runAfterBack(true, syncZoomHist); return; }
        histImgZoom = true;
        try {
          var st = Object.assign({}, window.history.state || {}, { pzoodZoom: true });
          if (isMapZoomed && !(window.peristasiBridge && window.peristasiBridge.hasDualStage)) st.pzoodMapZoom = true;
          window.history.pushState(st, "", window.location.href);
        } catch (e) {}
      };
      syncZoomHist();
    }
  }

 function closePhotoZoom(fromPop) {
    if (!zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
    if (resetZoomGesture) resetZoomGesture();
    applyPhotoDetailZoom(1, 0, 0, false);
    zoomOverlay.classList.remove("is-open");
    zoomOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pzood-zoom-open");
    if (zoomTarget) { zoomTarget.onload = null; zoomTarget.onerror = null; zoomTarget.src = blankGif; }
    zoomList = [];
    unlockPageScroll();
    if (lastZoomFocusEl && document.contains(lastZoomFocusEl) && lastZoomFocusEl.focus) {
      var f = lastZoomFocusEl; lastZoomFocusEl = null;
      requestAnimationFrame(function() { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } });
    }
    var needBack = (!fromPop && histImgZoom);
    histImgZoom = false;
    if (needBack) safeBack();
  }

  function stepPhotoZoom(dir) {
    if (zoomList.length <= 1) return;
    zoomIdx = (zoomIdx + dir + zoomList.length) % zoomList.length;
    renderZoomPhoto();
  }

 if (zoomOverlay) {
    zoomOverlay.setAttribute("role", "dialog");
    zoomOverlay.setAttribute("aria-modal", "true");
    zoomOverlay.setAttribute("aria-label", "Μεγέθυνση φωτογραφίας");
    if (zoomTarget) zoomTarget.draggable = false;
    if (zoomCloseBtn) zoomCloseBtn.addEventListener("click", function(e) { e.stopPropagation(); closePhotoZoom(false); });
    if (zoomPrevBtn) zoomPrevBtn.addEventListener("click", function(e) { e.stopPropagation(); stepPhotoZoom(-1); });
    if (zoomNextBtn) zoomNextBtn.addEventListener("click", function(e) { e.stopPropagation(); stepPhotoZoom(1); });

    var zDownPt = null;
    var zPtrId = null, zMousePan = false, zMoved = false, zSx = 0, zSy = 0, zOx = 0, zOy = 0;
  var zMulti = false, zPinch = false, zDist0 = 0, zMx0 = 0, zMy0 = 0, zSc0 = 1, zPx0 = 0, zPy0 = 0, zCx0 = 0, zCy0 = 0;
    var zTPan = false, zTSx = 0, zTSy = 0, zTOx = 0, zTOy = 0, zSwipeX = 0, zSwipeY = 0, zLastTap = 0, zTapX = 0, zTapY = 0, zLastDblTouch = 0;
    zoomOverlay.addEventListener("gesturestart", function(e) { zMulti = true; if (e.cancelable) e.preventDefault(); }, { passive: false });
    zoomOverlay.addEventListener("gesturechange", function(e) { if (e.cancelable) e.preventDefault(); }, { passive: false });

    zoomOverlay.addEventListener("wheel", function(e) {
      if (!zoomOverlay.classList.contains("is-open")) return;
      if (e.cancelable) e.preventDefault();
      var d = -e.deltaY * (e.deltaMode === 1 ? 28 : 1);
      if (!d) return;
      var nextS = zScale * Math.exp(Math.max(-0.45, Math.min(0.45, d * 0.0022)));
      if (nextS <= 1.01 && zScale <= 1.01) return;
      zoomPhotoAtPt(nextS, e.clientX, e.clientY, false);
    }, { passive: false });

    zoomOverlay.addEventListener("dblclick", function(e) {
      if (performance.now() - zLastDblTouch < 550 || performance.now() - lastTouchTs < 550) return;
      if (e.target && e.target.closest && e.target.closest("button")) return;
      e.preventDefault();
      zSuppressClose = performance.now() + 320;
      if (zScale > 1.05) applyPhotoDetailZoom(1, 0, 0, true);
      else zoomPhotoAtPt(2.25, e.clientX, e.clientY, true);
    });
  zoomOverlay.addEventListener("pointerdown", function(e) {
      zDownPt = (e.isPrimary !== false) ? { x: e.clientX, y: e.clientY } : null;
      if (e.pointerType === "mouse" && e.button === 0 && zScale > 1.01 && !(e.target.closest && e.target.closest("button"))) {
        zMousePan = true; zMoved = false; zPtrId = e.pointerId;
        zSx = e.clientX; zSy = e.clientY; zOx = zTx; zOy = zTy;
        if (zoomOverlay.setPointerCapture) { try { zoomOverlay.setPointerCapture(e.pointerId); } catch (err) {} }
      }
    });
   resetZoomGesture = function() {
      if (zPtrId !== null && zoomOverlay.releasePointerCapture) {
        try { zoomOverlay.releasePointerCapture(zPtrId); } catch (err) {}
      }
      zDownPt = null; zPtrId = null; zMousePan = false; zMoved = false;
      zMulti = false; zPinch = false; zTPan = false; zLastTap = 0;
      zoomOverlay.classList.remove("is-panning-zoom");
    };
    window.addEventListener("blur", function() {
      if (zoomOverlay.classList.contains("is-open") && resetZoomGesture) resetZoomGesture();
    });

    zoomOverlay.addEventListener("pointermove", function(e) {
      if (!zMousePan || e.pointerId !== zPtrId) return;
      if (typeof e.buttons === "number" && e.buttons === 0) { endMPan(e); return; }
      var dx = e.clientX - zSx, dy = e.clientY - zSy;
      if (!zMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      zMoved = true; zoomOverlay.classList.add("is-panning-zoom");
      applyPhotoDetailZoom(zScale, zOx + dx, zOy + dy, false);
    });
    var endMPan = function(e) {
      if (!zMousePan || (e && e.pointerId !== zPtrId)) return;
      if (zMoved) zSuppressClose = performance.now() + 260;
      zMousePan = false; zMoved = false; zPtrId = null;
      zoomOverlay.classList.remove("is-panning-zoom");
    };
    zoomOverlay.addEventListener("pointerup", endMPan);
    zoomOverlay.addEventListener("pointercancel", endMPan);
    zoomOverlay.addEventListener("lostpointercapture", endMPan);

   zoomOverlay.addEventListener("touchstart", function(e) {
      if (!e.touches) return;
      if (e.touches.length >= 2) {
        zMulti = true; zPinch = true; zTPan = false; zLastTap = 0;
        var t0 = e.touches[0], t1 = e.touches[1];
        zDist0 = Math.max(20, Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY));
        zMx0 = (t0.clientX + t1.clientX) * 0.5; zMy0 = (t0.clientY + t1.clientY) * 0.5;
        zSc0 = zScale || 1; zPx0 = zTx; zPy0 = zTy;
        var wr = zoomImgWrap ? zoomImgWrap.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        zCx0 = wr.left + wr.width * 0.5; zCy0 = wr.top + wr.height * 0.5;
        return;
      }
      if (e.touches.length === 1 && !isPinchZoomed()) {
        zMulti = false; zPinch = false; zMoved = false;
        zTSx = zSwipeX = e.touches[0].clientX; zTSy = zSwipeY = e.touches[0].clientY;
        if (zScale > 1.01 && !(e.target.closest && e.target.closest("button"))) {
          zTPan = true; zTOx = zTx; zTOy = zTy;
        } else {
          zTPan = false;
        }
      }
    }, { passive: true });

    zoomOverlay.addEventListener("touchmove", function(e) {
      if (!e.touches) return;
      if (e.touches.length >= 2 && zPinch) {
        zMulti = true;
        if (e.cancelable) e.preventDefault();
        var t0 = e.touches[0], t1 = e.touches[1];
        var dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        var mx = (t0.clientX + t1.clientX) * 0.5, my = (t0.clientY + t1.clientY) * 0.5;
        var nextS = Math.max(1, Math.min(3.5, zSc0 * (dist / zDist0)));
        var u = (zMx0 - zCx0 - zPx0) / zSc0, v = (zMy0 - zCy0 - zPy0) / zSc0;
        applyPhotoDetailZoom(nextS, mx - zCx0 - u * nextS, my - zCy0 - v * nextS, false);
        return;
      }
      if (e.touches.length === 1) {
        var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
        var dx = cx - zTSx, dy = cy - zTSy;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) zMoved = true;
        if (zTPan && zScale > 1.01) {
          if (e.cancelable) e.preventDefault();
          applyPhotoDetailZoom(zScale, zTOx + dx, zTOy + dy, false);
        } else if (zScale <= 1.01 && Math.abs(dx) > 14 && e.cancelable) {
          e.preventDefault();
        }
      }
    }, { passive: false });

   zoomOverlay.addEventListener("touchend", function(e) {
      var remTouches = e.touches ? e.touches.length : 0;
      if (zPinch) {
        zSuppressClose = performance.now() + 380;
        if (remTouches >= 2) {
          var rt0 = e.touches[0], rt1 = e.touches[1];
          zDist0 = Math.max(20, Math.hypot(rt1.clientX - rt0.clientX, rt1.clientY - rt0.clientY));
          zMx0 = (rt0.clientX + rt1.clientX) * 0.5; zMy0 = (rt0.clientY + rt1.clientY) * 0.5;
          zSc0 = zScale || 1; zPx0 = zTx; zPy0 = zTy;
          return;
        }
        if (remTouches === 1) {
          zPinch = false; zMoved = false;
          if (zScale <= 1.02) {
            zTPan = false;
            applyPhotoDetailZoom(1, 0, 0, true);
          } else {
            zTSx = e.touches[0].clientX; zTSy = e.touches[0].clientY;
            zTOx = zTx; zTOy = zTy;
            zTPan = true;
          }
          return;
        }
        zPinch = false; zTPan = false; zMulti = false; zMoved = false;
        if (zScale <= 1.02) applyPhotoDetailZoom(1, 0, 0, true);
        return;
      }
      if (zTPan && zMoved) {
        zSuppressClose = performance.now() + 320;
        zTPan = false; zMoved = false;
        if (remTouches === 0) {
          zMulti = false;
          if (zScale <= 1.02) applyPhotoDetailZoom(1, 0, 0, true);
        }
        return;
      }
      zTPan = false;
      if (zMulti || isPinchZoomed() || !e.changedTouches || e.changedTouches.length !== 1) {
        if (remTouches === 0) {
          zMulti = false;
          if (zScale > 1 && zScale <= 1.02) applyPhotoDetailZoom(1, 0, 0, true);
        }
        zLastTap = 0;
        return;
      }
      var ch = e.changedTouches[0];
      var dx = ch.clientX - zSwipeX, dy = ch.clientY - zSwipeY;
      if (zScale <= 1.01 && Math.abs(dx) >= 32 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        zSuppressClose = performance.now() + 340;
        stepPhotoZoom(dx < 0 ? 1 : -1);
        return;
      }
      if (!zMoved && e.target && e.target.closest && e.target.closest("#pzoodImgZoomTarget")) {
        var now = performance.now();
       if (now - zLastTap < 300 && Math.abs(ch.clientX - zTapX) < 28 && Math.abs(ch.clientY - zTapY) < 28) {
          zLastTap = 0; zLastDblTouch = now; zSuppressClose = now + 360;
          if (e.cancelable) e.preventDefault();
          if (zScale > 1.05) applyPhotoDetailZoom(1, 0, 0, true);
          else zoomPhotoAtPt(2.25, ch.clientX, ch.clientY, true);
        } else {
          zLastTap = now; zTapX = ch.clientX; zTapY = ch.clientY;
        }
      } else {
        zLastTap = 0;
      }
    }, { passive: false });

    zoomOverlay.addEventListener("touchcancel", function() {
      zMulti = false; zPinch = false; zTPan = false; zLastTap = 0;
    }, { passive: true });

  zoomOverlay.addEventListener("click", function(e) {
      if (zMulti || isPinchZoomed() || !zDownPt || performance.now() < zSuppressClose) return;
      if (Math.abs(e.clientX - zDownPt.x) > 12 || Math.abs(e.clientY - zDownPt.y) > 12) return;
      if (e.target && e.target.closest && e.target.closest("#pzoodImgZoomTarget, button")) return;
      closePhotoZoom(false);
    });
  }

 function renderChurchMirror(hostEl, onClose) {
    if (!hostEl) return;
    var curSc = 0;
    var vMode = "curtain";
    var cPct = 50;
    var introRaf = 0;

    function cancelIntro() {
      if (introRaf) { cancelAnimationFrame(introRaf); introRaf = 0; }
      var cs = hostEl.querySelector(".pzood-curtain-stage.is-intro-sweep");
      if (cs) cs.classList.remove("is-intro-sweep");
    }

    function runIntro(cStage) {
      cancelIntro();
      if (!cStage || !cStage._setPct) return;
      cStage.classList.add("is-intro-sweep");
      var t0 = performance.now(), dur = 920;
      var tick = function(now) {
        if (!cStage.isConnected || vMode !== "curtain") { cancelIntro(); return; }
        var p = Math.min(1, (now - t0) / dur);
        var u = 0.5 - 0.5 * Math.cos(Math.PI * p);
        cStage._setPct(50 - 22 * Math.sin(u * Math.PI * 2));
        if (p < 1) introRaf = requestAnimationFrame(tick);
        else { introRaf = 0; cStage._setPct(50); cStage.classList.remove("is-intro-sweep"); }
      };
      introRaf = requestAnimationFrame(tick);
    }

   var mirRefs = null;

   function syncMirImg(im, optSrc, fullSrc, altTxt, fbSrc) {
      im.alt = altTxt || "";
      if (im._rawSrc === fullSrc && im._optSrc === optSrc) return;
      im._rawSrc = fullSrc;
      im._optSrc = optSrc;
      im.removeAttribute("data-tried-norw");
      im.removeAttribute("data-tried-full");
      im.removeAttribute("data-tried-fb");
      im.setAttribute("data-full-src", fullSrc || "");
      if (fbSrc) im.setAttribute("data-fallback-src", fbSrc);
      else im.removeAttribute("data-fallback-src");
      im.src = optSrc;
    }

    hostEl._disposeMirror = function() {
      cancelIntro();
      mirRefs = null;
      hostEl._stepMirror = null;
      hostEl._disposeMirror = null;
      hostEl.onclick = null;
      hostEl.onkeydown = null;
    };

    function bindCurtain(cStage) {
      if (!cStage) return;
      var bOld = cStage.querySelector(".pzood-curtain-badge--old");
      var bNew = cStage.querySelector(".pzood-curtain-badge--new");
      var hdl = cStage.querySelector(".pzood-curtain-handle");
      var zBtn = hostEl.querySelector(".pzood-curtain-zoom-btn");
      var setPct = function(v) {
        cPct = Math.max(2, Math.min(98, v));
        cStage.style.setProperty("--zcpos", cPct.toFixed(1) + "%");
        if (bOld) bOld.style.opacity = cPct < 14 ? "0" : "1";
        if (bNew) bNew.style.opacity = cPct > 86 ? "0" : "1";
        if (hdl) hdl.setAttribute("aria-valuenow", String(Math.round(cPct)));
        if (zBtn) zBtn.setAttribute("data-zm-pic", cPct < 50 ? "1" : "0");
      };
      cStage._setPct = setPct;
      setPct(cPct);
      var fromX = function(clientX) {
        var r = cStage.getBoundingClientRect();
        if (r.width > 0) setPct(((clientX - r.left) / r.width) * 100);
      };
      var drag = false, pid = null;
      cStage.addEventListener("pointerdown", function(e) {
        if (e.pointerType === "touch" || (e.pointerType === "mouse" && e.button !== 0)) return;
        cancelIntro();
        drag = true; pid = e.pointerId; fromX(e.clientX);
        if (cStage.setPointerCapture) { try { cStage.setPointerCapture(pid); } catch (err) {} }
      });
    cStage.addEventListener("pointermove", function(e) {
        if (!drag || e.pointerId !== pid) return;
        if (typeof e.buttons === "number" && e.buttons === 0) { drag = false; pid = null; return; }
        fromX(e.clientX);
      });
      var endD = function(e) { if (drag && (!e || e.pointerId === pid)) { drag = false; pid = null; } };
      cStage.addEventListener("pointerup", endD);
      cStage.addEventListener("pointercancel", endD);
      cStage.addEventListener("lostpointercapture", endD);

      var tsx = 0, tsy = 0, tLock = 0;
      cStage.addEventListener("touchstart", function(e) {
        cancelIntro();
        if (!e.touches || e.touches.length !== 1 || isPinchZoomed()) { tLock = -1; return; }
        tsx = e.touches[0].clientX; tsy = e.touches[0].clientY;
        tLock = e.target.closest(".pzood-curtain-handle") ? 1 : 0;
      }, { passive: true });
      cStage.addEventListener("touchmove", function(e) {
        if (tLock === -1 || !e.touches || e.touches.length !== 1) return;
        var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
        if (tLock === 0) {
          var dx = Math.abs(cx - tsx), dy = Math.abs(cy - tsy);
          if (dx < 5 && dy < 5) return;
          tLock = dx >= dy * 0.85 ? 1 : -1;
        }
        if (tLock === 1) { if (e.cancelable) e.preventDefault(); fromX(cx); }
      }, { passive: false });
      cStage.addEventListener("touchend", function(e) {
        if (tLock === 0 && !isPinchZoomed() && e.changedTouches && e.changedTouches.length === 1) {
          var ex = e.changedTouches[0].clientX, ey = e.changedTouches[0].clientY;
          if (Math.abs(ex - tsx) < 8 && Math.abs(ey - tsy) < 8) fromX(ex);
        }
        tLock = 0;
      }, { passive: true });
      cStage.addEventListener("touchcancel", function() { tLock = 0; }, { passive: true });
      if (hdl) {
        hdl.addEventListener("keydown", function(e) {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            cancelIntro();
            e.preventDefault(); e.stopPropagation();
            setPct(cPct + (e.key === "ArrowRight" ? 5 : -5));
          }
        });
      }
    }

    function syncModeOnly(playSweep) {
      var mBox = hostEl.querySelector(".pzood-mirror-box");
      if (!mBox) { drawMirror(); return; }
      mBox.className = "pzood-mirror-box is-mode-" + vMode;
      mBox.querySelectorAll("[data-zm-mode]").forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-zm-mode") === vMode);
      });
      var cSt = mBox.querySelector(".pzood-curtain-stage");
      if (vMode === "curtain") {
        if (cSt && cSt._setPct) cSt._setPct(cPct);
        if (playSweep && cSt) runIntro(cSt);
      } else {
        cancelIntro();
      }
    }

  function drawMirror() {
      cancelIntro();
      var sc = churchMirrorScenes[curSc];
      var mirSz = window.innerWidth <= 680 ? 640 : 960;
      var oldUrl = optImg(sc.oldImg, mirSz);
      var newUrl = optImg(sc.newImg, mirSz);
      var i;

      if (!mirRefs || !mirRefs.box.isConnected) {
        var tabsHtml = churchMirrorScenes.map(function(s, idx) {
          return '<button type="button" class="pzood-mirror-tab' + (idx === curSc ? ' is-active' : '') + '" data-zm-tab="' + idx + '">' + s.tab + '</button>';
        }).join("");

        hostEl.innerHTML =
          '<div class="pzood-mirror-box is-mode-' + vMode + '">' +
            '<div class="pzood-mirror-top">' +
              '<strong style="color:#b45309;font-size:14px">\u26EA Σύγκριση Δίπλα-Δίπλα: Παλιός Πέτρινος vs Καινούριος Ναός</strong>' +
              '<button type="button" class="pzood-icon-close" data-zm-close="1" title="Κλείσιμο">\u2715</button>' +
            '</div>' +
            '<div class="pzood-mirror-bar">' +
              '<div class="pzood-mirror-tabs">' + tabsHtml + '</div>' +
              '<div class="pzood-mirror-modes">' +
                '<button type="button" class="pzood-mirror-pill pzood-mirror-pill--curtain' + (vMode === "curtain" ? " is-active" : "") + '" data-zm-mode="curtain">\u2728 Σύρε Παλιό \u2194 Νέο</button>' +
                '<button type="button" class="pzood-mirror-pill' + (vMode === "both" ? " is-active" : "") + '" data-zm-mode="both">\u2696\uFE0F Και οι 2</button>' +
                '<button type="button" class="pzood-mirror-pill' + (vMode === "old" ? " is-active" : "") + '" data-zm-mode="old">\uD83C\uDFDB\uFE0F Παλιός</button>' +
                '<button type="button" class="pzood-mirror-pill' + (vMode === "new" ? " is-active" : "") + '" data-zm-mode="new">\u26EA Καινούριος</button>' +
              '</div>' +
            '</div>' +
            '<div class="pzood-curtain-wrap">' +
              '<div class="pzood-curtain-stage" style="--zcpos:' + cPct.toFixed(1) + '%">' +
                '<img class="pzood-curtain-img" decoding="async" src="' + blankGif + '" alt=""/>' +
                '<div class="pzood-curtain-old-layer">' +
                  '<img class="pzood-curtain-img" decoding="async" src="' + blankGif + '" alt=""/>' +
                '</div>' +
                '<span class="pzood-curtain-badge pzood-curtain-badge--old"></span>' +
                '<span class="pzood-curtain-badge pzood-curtain-badge--new"></span>' +
                '<div class="pzood-curtain-divider"></div>' +
                '<button type="button" class="pzood-curtain-handle" role="slider" aria-label="Σύγκριση Παλιού και Καινούριου Ναού" aria-valuemin="2" aria-valuemax="98" aria-valuenow="' + Math.round(cPct) + '">\u2194</button>' +
              '</div>' +
              '<div class="pzood-curtain-bar">' +
                '<span>\u2728 Σύρε τη λαβή αριστερά-δεξιά για να συγκρίνεις τους δύο ναούς!</span>' +
                '<button type="button" class="pzood-curtain-zoom-btn" data-zm-pic="0">\uD83D\uDD0D Μεγέθυνση Φωτογραφιών</button>' +
              '</div>' +
            '</div>' +
            '<div class="pzood-mirror-pair">' +
              '<div class="pzood-era-card pzood-era-old">' +
                '<div class="pzood-era-head"><span class="pzood-era-yr"></span><span class="pzood-era-icons"></span></div>' +
                '<img class="pzood-era-photo" loading="lazy" decoding="async" src="' + blankGif + '" alt="" data-zm-pic="0" tabindex="0" role="button"/>' +
                '<h5 class="pzood-era-title"></h5>' +
                '<p class="pzood-era-desc"></p>' +
              '</div>' +
              '<div class="pzood-era-card pzood-era-new">' +
                '<div class="pzood-era-head"><span class="pzood-era-yr"></span><span class="pzood-era-icons"></span></div>' +
                '<img class="pzood-era-photo" loading="lazy" decoding="async" src="' + blankGif + '" alt="" data-zm-pic="1" tabindex="0" role="button"/>' +
                '<h5 class="pzood-era-title"></h5>' +
                '<p class="pzood-era-desc"></p>' +
              '</div>' +
            '</div>' +
            '<div class="pzood-mirror-swipe-hint"></div>' +
          '</div>';

        hostEl.querySelectorAll("img").forEach(function(im) { im.onerror = handleImgError; });
        var boxEl = hostEl.querySelector(".pzood-mirror-box");
        var cStageEl = boxEl.querySelector(".pzood-curtain-stage");
        var cImgs = cStageEl.querySelectorAll(".pzood-curtain-img");
        var oldCardEl = boxEl.querySelector(".pzood-era-old");
        var newCardEl = boxEl.querySelector(".pzood-era-new");
        var pairEl = boxEl.querySelector(".pzood-mirror-pair");
        bindCurtain(cStageEl);
        if (pairEl) {
          bindSwipe(pairEl, function() { hostEl._stepMirror(1); }, function() { hostEl._stepMirror(-1); });
        }
        mirRefs = {
          box: boxEl,
          tabsStrip: boxEl.querySelector(".pzood-mirror-tabs"),
          tabs: boxEl.querySelectorAll("[data-zm-tab]"),
          modes: boxEl.querySelectorAll("[data-zm-mode]"),
          cStage: cStageEl,
          cNewImg: cImgs[0],
          cOldImg: cImgs[1],
          bOld: cStageEl.querySelector(".pzood-curtain-badge--old"),
          bNew: cStageEl.querySelector(".pzood-curtain-badge--new"),
          oldYr: oldCardEl.querySelector(".pzood-era-yr"),
          oldIcons: oldCardEl.querySelector(".pzood-era-icons"),
          oldPhoto: oldCardEl.querySelector(".pzood-era-photo"),
          oldTitle: oldCardEl.querySelector(".pzood-era-title"),
          oldDesc: oldCardEl.querySelector(".pzood-era-desc"),
          newYr: newCardEl.querySelector(".pzood-era-yr"),
          newIcons: newCardEl.querySelector(".pzood-era-icons"),
          newPhoto: newCardEl.querySelector(".pzood-era-photo"),
          newTitle: newCardEl.querySelector(".pzood-era-title"),
          newDesc: newCardEl.querySelector(".pzood-era-desc"),
          hint: boxEl.querySelector(".pzood-mirror-swipe-hint")
        };
      }

      mirRefs.box.className = "pzood-mirror-box is-mode-" + vMode;
      for (i = 0; i < mirRefs.tabs.length; i++) {
        mirRefs.tabs[i].classList.toggle("is-active", i === curSc);
      }
      for (i = 0; i < mirRefs.modes.length; i++) {
        mirRefs.modes[i].classList.toggle("is-active", mirRefs.modes[i].getAttribute("data-zm-mode") === vMode);
      }

     var oldFb = sc.oldImg === photoShrinePan ? photoGroveArea : photoShrinePan;
      var newFb = sc.newImg === photoOldChurch ? photoShrinePan : photoOldChurch;
      syncMirImg(mirRefs.cNewImg, newUrl, sc.newImg, sc.newCap, newFb);
      syncMirImg(mirRefs.cOldImg, oldUrl, sc.oldImg, sc.oldCap, oldFb);
      mirRefs.bOld.textContent = sc.oldYr;
      mirRefs.bNew.textContent = sc.newYr;
      if (mirRefs.cStage._setPct) mirRefs.cStage._setPct(cPct);

      mirRefs.oldYr.textContent = sc.oldYr;
      mirRefs.oldIcons.textContent = sc.oldIcons;
      syncMirImg(mirRefs.oldPhoto, oldUrl, sc.oldImg, sc.oldCap, oldFb);
      mirRefs.oldTitle.textContent = sc.oldTitle;
      mirRefs.oldDesc.textContent = sc.oldDesc;

      mirRefs.newYr.textContent = sc.newYr;
      mirRefs.newIcons.textContent = sc.newIcons;
      syncMirImg(mirRefs.newPhoto, newUrl, sc.newImg, sc.newCap, newFb);
      mirRefs.newTitle.textContent = sc.newTitle;
      mirRefs.newDesc.textContent = sc.newDesc;

      mirRefs.hint.textContent = "\uD83D\uDC48 Σύρε αριστερά-δεξιά στις κάρτες για αλλαγή σκηνής (" + (curSc + 1) + "/" + churchMirrorScenes.length + ") \uD83D\uDC49";

      var actTab = mirRefs.tabs[curSc];
      if (mirRefs.tabsStrip && actTab && mirRefs.tabsStrip.scrollWidth > mirRefs.tabsStrip.clientWidth + 4) {
        mirRefs.tabsStrip.scrollLeft = Math.max(0, actTab.offsetLeft - (mirRefs.tabsStrip.clientWidth - actTab.offsetWidth) / 2);
      }
    }

    hostEl._stepMirror = function(dir, fromKb) {
      curSc = (curSc + dir + churchMirrorScenes.length) % churchMirrorScenes.length;
      drawMirror();
      if (fromKb) {
        var nt = hostEl.querySelector(".pzood-mirror-tab.is-active");
        if (nt && nt.focus) { try { nt.focus({ preventScroll: true }); } catch (err) { nt.focus(); } }
      }
    };

    hostEl.onkeydown = function(e) {
      if ((e.key === "Enter" || e.key === " ") && e.target && e.target.hasAttribute && e.target.hasAttribute("data-zm-pic")) {
        e.preventDefault();
        e.target.click();
      }
    };

    hostEl.onclick = function(e) {
      e.stopPropagation();
      var isKb = (e.detail === 0);
      if (e.target.closest("[data-zm-close]")) {
        if (hostEl._disposeMirror) hostEl._disposeMirror();
        if (onClose) onClose(isKb);
        return;
      }
      var tBtn = e.target.closest("[data-zm-tab]");
      if (tBtn) {
        var nextSc = Number(tBtn.getAttribute("data-zm-tab")) || 0;
        if (nextSc !== curSc) {
          curSc = nextSc;
          drawMirror();
          if (isKb) {
            var actB = hostEl.querySelector(".pzood-mirror-tab.is-active");
            if (actB && actB.focus) { try { actB.focus({ preventScroll: true }); } catch (err) { actB.focus(); } }
          }
        }
        return;
      }
      var mBtn = e.target.closest("[data-zm-mode]");
      if (mBtn) {
        var nextM = mBtn.getAttribute("data-zm-mode") || "both";
        var enterCurtain = (nextM === "curtain" && vMode !== "curtain");
        if (enterCurtain) cPct = 50;
        vMode = nextM;
        syncModeOnly(enterCurtain);
        return;
      }
      var zPic = e.target.closest("[data-zm-pic]");
      if (zPic) {
        var sc = churchMirrorScenes[curSc];
        openPhotoZoom([
          { src: sc.oldImg, fallbackSrc: photoShrinePan, caption: sc.oldCap },
          { src: sc.newImg, fallbackSrc: photoOldChurch, caption: sc.newCap }
        ], Number(zPic.getAttribute("data-zm-pic")) || 0, zPic);
      }
    };

    drawMirror();
    if (vMode === "curtain") runIntro(hostEl.querySelector(".pzood-curtain-stage"));
  }

  /* =========================================================================
     ΣΧΕΔΙΑΣΗ ΔΙΑΔΡΑΣΤΙΚΟΥ ΠΑΙΔΙΚΟΥ ΧΑΡΤΗ ΖΩΟΔΟΧΟΥ ΠΗΓΗΣ (SVG 940x460)
     ========================================================================= */
  function isMobileMapVp() {
    return window.innerWidth <= 720 || (window.innerWidth <= 960 && window.innerHeight <= 520);
  }
  function isMobileScrollZoom() {
    return isMapZoomed && streetZoomOn && isMobileMapVp();
  }

 function scrollZoomedMapTo(svgX, svgY, smooth) {
    if (!isMapZoomed) return;
    var mSc = mapScrollEl || (mapScrollEl = document.getElementById("pzoodMapScroll"));
    if (!mSc) return;
    var sw = mSc.scrollWidth, cw = mSc.clientWidth;
    var sh = mSc.scrollHeight, ch = mSc.clientHeight;
    if (sw <= cw + 4 && sh <= ch + 4) return;
    var tx = sw > cw + 4 ? Math.max(0, Math.min(sw - cw, Math.round((svgX / 940) * sw - cw / 2))) : 0;
    var ty = sh > ch + 4 ? Math.max(0, Math.min(sh - ch, Math.round((svgY / 460) * sh - ch / 2))) : 0;
    if (smooth && mSc.scrollTo) {
      try { mSc.scrollTo({ left: tx, top: ty, behavior: "smooth" }); return; } catch (e) {}
    }
    mSc.scrollLeft = tx;
    mSc.scrollTop = ty;
  }

 var curWalkerFlip = 1;
  function setWalkerPos(x, y, flipSign) {
    if (!mapWalkerEl) return;
    if (mapWalkerEl.hasAttribute("transform")) mapWalkerEl.removeAttribute("transform");
    mapWalkerEl.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    if (flipSign && flipSign !== curWalkerFlip && mapWalkerFlipEl) {
      curWalkerFlip = flipSign;
      mapWalkerFlipEl.setAttribute("transform", flipSign < 0 ? "scale(-1,1)" : "scale(1,1)");
    }
  }

  function stopWalkAnim(snapToEnd) {
    if (walkAnimRaf) { cancelAnimationFrame(walkAnimRaf); walkAnimRaf = null; }
    if (mapWrap) mapWrap.classList.remove("is-walking");
    var snap = activeWalkSnap;
    activeWalkSnap = null;
    if (snapToEnd && typeof snap === "function") snap();
  }

  function syncWalkerAppearance() {
    var isBike = (travelMode === "bike");
    if (mapWalkerEl) {
      var c = mapWalkerEl.querySelector("circle");
      if (c) c.setAttribute("stroke", isPastEra ? "#b45309" : (isBike ? "#0284c7" : "#16a34a"));
    }
    if (mapWalkerFlipEl) {
      var t = mapWalkerFlipEl.querySelector("text");
      if (t) t.textContent = isBike ? (isPastEra ? "\uD83D\uDC34" : "\uD83D\uDEB2") : "\uD83D\uDEB6";
    }
    var strokeCol = isPastEra ? "#b45309" : (isBike ? "#0284c7" : "#f59e0b");
    if (mapWalkPath) mapWalkPath.setAttribute("stroke", strokeCol);
    if (mapWalkBgPath) mapWalkBgPath.setAttribute("stroke", strokeCol);
  }

 function runMapWalk(cfg) {
    stopWalkAnim(false);
    syncWalkerAppearance();
    syncSvgActiveFx();
    mapScrollAbort = false;
    walkDimsDirty = true;
    if (typeof cfg.cx === "number") lastTargetX = cfg.cx;
    if (typeof cfg.cy === "number") lastTargetY = cfg.cy;
    var isBike = (travelMode === "bike");
    var pts = cfg.pts || [[636, 156]];

  var crossAnimEl = null;
    if (mapPulseRing) {
      mapPulseRing.setAttribute("cx", String(cfg.cx));
      mapPulseRing.setAttribute("cy", String(cfg.cy));
      mapPulseRing.setAttribute("stroke", cfg.color || "#16a34a");
      mapPulseRing.style.display = "";
      mapPulseRing.style.animation = "none";
    }

    if (mapCrossAlertEl) {
      if (cfg.crossPt) {
        mapCrossAlertEl.setAttribute("transform", "translate(" + cfg.crossPt[0] + "," + cfg.crossPt[1] + ")");
        if (mapCrossIconEl) mapCrossIconEl.textContent = isPastEra ? "\uD83D\uDC0E" : (cfg.crossRoad ? "\uD83D\uDEA6" : (isBike ? "\uD83E\uDE96" : "\uD83D\uDEB8"));
        mapCrossAlertEl.style.display = "";
        crossAnimEl = mapCrossAlertEl.firstElementChild;
        if (crossAnimEl) crossAnimEl.classList.remove("pzood-cross-anim");
      } else {
        mapCrossAlertEl.style.display = "none";
      }
    }

    if (mapPulseRing || crossAnimEl) {
      void (mapPulseRing || crossAnimEl).getBoundingClientRect();
      if (mapPulseRing) mapPulseRing.style.animation = "";
      if (crossAnimEl) crossAnimEl.classList.add("pzood-cross-anim");
    }

    if (pts.length < 2) {
      if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
      if (mapWalkPath) { mapWalkPath.style.strokeDasharray = ""; mapWalkPath.style.strokeDashoffset = ""; mapWalkPath.setAttribute("d", ""); }
      if (mapWalkerEl) {
        var wp0 = cfg.walkerPt || [604, 172];
        mapWalkerEl.style.display = "";
        setWalkerPos(wp0[0], wp0[1], 1);
      }
      scrollZoomedMapTo(lastTargetX, lastTargetY, true);
      return;
    }

    var segs = [], totalLen = 0, fullD = "M " + pts[0][0] + "," + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
      var len = Math.sqrt(dx * dx + dy * dy);
      segs.push({ x0: pts[i][0], y0: pts[i][1], dx: dx, dy: dy, len: len, start: totalLen });
      fullD += " L " + pts[i + 1][0] + "," + pts[i + 1][1];
      totalLen += len;
    }

    var stopDist = Math.max(0, totalLen - 22);
    var baseDur = cfg.dur || Math.min(3600, Math.max(1850, totalLen * 5.8));
    var dur = isBike ? (isPastEra ? Math.round(baseDur * 1.1) : Math.max(1200, Math.round(baseDur * 0.65))) : baseDur;
    var dashLen = Math.ceil(totalLen) + 2;

    if (mapWrap) mapWrap.classList.add("is-walking");
    if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", fullD);
    if (mapWalkPath) {
      mapWalkPath.setAttribute("d", fullD);
      mapWalkPath.style.strokeDasharray = dashLen + " " + (dashLen + 16);
      mapWalkPath.style.strokeDashoffset = String(dashLen);
    }
    if (mapWalkerEl) mapWalkerEl.style.display = "";

    var pointAt = function(d) {
      var cl = Math.max(0, Math.min(totalLen, d));
      for (var k = 0; k < segs.length; k++) {
        var sg = segs[k];
        if (cl <= sg.start + sg.len || k === segs.length - 1) {
          var u = sg.len > 0 ? Math.min(1, (cl - sg.start) / sg.len) : 1;
          return { x: sg.x0 + sg.dx * u, y: sg.y0 + sg.dy * u, dx: sg.dx };
        }
      }
      return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], dx: 0 };
    };

    var stepBadge = document.getElementById("pzoodLiveStepBadge");
    var targetSteps = cfg.steps || 0, targetMeters = cfg.meters || 0, targetBikeTime = cfg.bikeTime || "";

    activeWalkSnap = function() {
      if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
      if (mapWalkPath) mapWalkPath.style.strokeDashoffset = "0";
      var ep = pointAt(stopDist);
      setWalkerPos(ep.x, ep.y, Math.abs(ep.dx) > 1 ? (ep.dx > 0 ? -1 : 1) : 0);
      var bNow = document.getElementById("pzoodLiveStepBadge");
      if (bNow) {
        if (isBike && targetMeters > 0) {
          bNow.textContent = (isPastEra ? "\uD83D\uDC34 " : "\uD83D\uDEB2 ") + targetBikeTime + " (~" + fmtNum(targetMeters) + " μ.)";
        } else if (!isBike && targetSteps > 0) {
          bNow.textContent = "\uD83D\uDC63 ~" + fmtNum(targetSteps) + " παιδικά βήματα";
        }
      }
    };

   var bobCycles = Math.max(6, Math.round(dur / 125) * 2);
    var t0 = performance.now();
    var lastBadgeVal = -1;

    var frame = function(now) {
      var p = Math.min(1, (now - t0) / dur);
      var ease = 0.5 - 0.5 * Math.cos(Math.PI * p);
      var wp = pointAt(Math.min(ease * totalLen, stopDist));

      if (isMapZoomed && !mapScrollAbort) {
        if (!mapScrollEl) mapScrollEl = document.getElementById("pzoodMapScroll");
        if (mapScrollEl && (walkDimsDirty || !cachedCW)) {
          cachedScW = mapScrollEl.scrollWidth;
          cachedCW = mapScrollEl.clientWidth;
          cachedScH = mapScrollEl.scrollHeight;
          cachedCH = mapScrollEl.clientHeight;
          walkDimsDirty = false;
        }
      }

      if (mapWalkPath) mapWalkPath.style.strokeDashoffset = p >= 1 ? "0" : ((1 - ease) * dashLen).toFixed(1);
      if (p >= 1 && mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");

      if (mapWalkerEl) {
        var bob = p < 1 ? Math.sin(p * Math.PI * bobCycles) * (isBike ? 1.0 : 2.1) : 0;
        setWalkerPos(wp.x, wp.y + bob, Math.abs(wp.dx) > 1 ? (wp.dx > 0 ? -1 : 1) : 0);
      }

      if (isMapZoomed && !mapScrollAbort && mapScrollEl) {
        if (cachedScW > cachedCW + 4) {
          var fx = wp.x + ease * (lastTargetX - wp.x);
          mapScrollEl.scrollLeft = Math.max(0, Math.min(cachedScW - cachedCW, Math.round((fx / 940) * cachedScW - cachedCW / 2)));
        }
        if (cachedScH > cachedCH + 4) {
          var fy = wp.y + ease * (lastTargetY - wp.y);
          mapScrollEl.scrollTop = Math.max(0, Math.min(cachedScH - cachedCH, Math.round((fy / 460) * cachedScH - cachedCH / 2)));
        }
      }

      if (!stepBadge || !stepBadge.isConnected) stepBadge = document.getElementById("pzoodLiveStepBadge");
      if (stepBadge) {
        if (isBike && targetMeters > 0) {
          var cm = p >= 1 ? targetMeters : Math.max(5, Math.round((ease * targetMeters) / 5) * 5);
          var mKey = p >= 1 ? -2 : cm;
          if (mKey !== lastBadgeVal) {
            lastBadgeVal = mKey;
            var ico = isPastEra ? "\uD83D\uDC34 " : "\uD83D\uDEB2 ";
            stepBadge.textContent = p >= 1 ? (ico + targetBikeTime + " (~" + fmtNum(cm) + " μ.)") : (ico + "~" + fmtNum(cm) + " μ. ...");
          }
        } else if (!isBike && targetSteps > 0) {
          var cs = p >= 1 ? targetSteps : Math.max(5, Math.round((ease * targetSteps) / 5) * 5);
          if (cs !== lastBadgeVal) {
            lastBadgeVal = cs;
            stepBadge.textContent = "\uD83D\uDC63 ~" + fmtNum(cs) + " παιδικά βήματα";
          }
        }
      }

      if (p < 1) {
        walkAnimRaf = requestAnimationFrame(frame);
      } else {
        walkAnimRaf = null;
        activeWalkSnap = null;
        if (mapWrap) mapWrap.classList.remove("is-walking");
        if (typeof cfg.onArrive === "function") cfg.onArrive();
      }
    };
    walkAnimRaf = requestAnimationFrame(frame);
  }
  /* =========================================================================
     ΜΠΑΡΑ ΚΑΤΑΣΤΑΣΗΣ ΧΑΡΤΗ & BADGE ΕΞΕΡΕΥΝΗΣΗΣ
     ========================================================================= */
  var curStatusThumb = "", curStatusCap = "", curStatusFallback = "", curStatusAction = "";

  function setStatusBar(msgHtml, actionType, thumbUrl, thumbCap, walkMeta, extraHtml, fallbackUrl) {
    if (!mapStatusEl) return;
    curStatusThumb = thumbUrl || "";
    curStatusCap = thumbCap || "";
    curStatusFallback = fallbackUrl || "";
    curStatusAction = actionType || "";
    var isBike = (travelMode === "bike");

    if (!mapStatusEl._refs) {
      mapStatusEl.innerHTML =
        '<div class="pzood-map-status-left">' +
          '<img class="pzood-map-thumb" style="display:none" data-zthumb-zoom="1" tabindex="0" role="button" title="Πάτησε για μεγέθυνση!"/>' +
          '<div class="pzood-map-status-body">' +
            '<div class="pzood-status-msg"></div>' +
            '<div class="pzood-walk-meta" style="display:none">' +
              '<span class="pzood-step-pill" id="pzoodLiveStepBadge"></span>' +
              '<span class="pzood-safety-pill"></span>' +
            '</div>' +
            '<div class="pzood-status-extra"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pzood-map-status-right">' +
          '<div class="pzood-mode-switch" role="group" aria-label="Τρόπος μετακίνησης">' +
            '<button type="button" class="pzood-mode-btn is-active" data-zmode="walk">\uD83D\uDEB6 Πόδια</button>' +
            '<button type="button" class="pzood-mode-btn" data-zmode="bike">\uD83D\uDEB2 Ποδήλατο</button>' +
          '</div>' +
          '<button type="button" class="pzood-map-goto-btn" style="display:none"></button>' +
        '</div>';
      var th = mapStatusEl.querySelector(".pzood-map-thumb");
      if (th) th.onerror = handleImgError;
      var wm = mapStatusEl.querySelector(".pzood-walk-meta");
      mapStatusEl._refs = {
        thumb: th,
        msg: mapStatusEl.querySelector(".pzood-status-msg"),
        meta: wm,
        step: wm.children[0],
        safety: wm.children[1],
        extra: mapStatusEl.querySelector(".pzood-status-extra"),
        walkBtn: mapStatusEl.querySelector('[data-zmode="walk"]'),
        bikeBtn: mapStatusEl.querySelector('[data-zmode="bike"]'),
        actBtn: mapStatusEl.querySelector(".pzood-map-goto-btn")
      };
    }

   var r = mapStatusEl._refs;
    if (curStatusThumb) {
      if (r.thumb._rawSrc !== curStatusThumb || r.thumb._fbSrc !== curStatusFallback) {
        r.thumb._rawSrc = curStatusThumb;
        r.thumb._fbSrc = curStatusFallback;
        r.thumb.removeAttribute("data-tried-norw");
        r.thumb.removeAttribute("data-tried-full");
        r.thumb.removeAttribute("data-tried-fb");
        r.thumb.setAttribute("data-full-src", curStatusThumb);
        if (curStatusFallback) r.thumb.setAttribute("data-fallback-src", curStatusFallback);
        else r.thumb.removeAttribute("data-fallback-src");
        r.thumb.src = optImg(curStatusThumb, 320);
      }
      r.thumb.alt = curStatusCap;
      r.thumb.style.display = "";
    } else {
      r.thumb.style.display = "none";
    }

    r.msg.innerHTML = msgHtml;

    if (walkMeta) {
      var stCls = "pzood-step-pill" + (isBike && !isPastEra ? " pzood-step-pill--bike" : "");
      var stTxt = "";
      if (isBike && isPastEra) {
        stTxt = walkMeta.meters > 0 ? ("\uD83D\uDC34 " + walkMeta.bikeTime + " με κάρο (~" + fmtNum(walkMeta.meters) + " μ.)") : "\uD83D\uDC34 Αφετηρία: Παλιό Μονύδριο";
      } else if (isBike) {
        stTxt = walkMeta.meters > 0 ? ("\uD83D\uDEB2 " + walkMeta.bikeTime + " (~" + fmtNum(walkMeta.meters) + " μ.)") : ("\uD83D\uDEB2 " + (walkMeta.bikeTime || "Αφετηρία: Πλάτωμα Πύλης"));
      } else {
        stTxt = walkMeta.steps > 0 ? ("\uD83D\uDC63 ~" + fmtNum(walkMeta.steps) + " παιδικά βήματα") : "\u26E9\uFE0F Αφετηρία: Πέτρινη Πύλη (0 βήματα)";
      }
      r.step.className = stCls;
      r.step.textContent = stTxt;
      var sfTxt = isBike ? (walkMeta.bikeSafety || walkMeta.safety) : walkMeta.safety;
      var sfCls = "pzood-safety-pill" + (walkMeta.crossRoad ? " pzood-safety-pill--cross" : (isBike && !isPastEra ? " pzood-safety-pill--bike" : ""));
      r.safety.className = sfCls;
      r.safety.textContent = sfTxt || "";
      r.safety.style.display = sfTxt ? "" : "none";
      r.meta.style.display = "";
    } else {
      r.meta.style.display = "none";
    }

   r.extra.innerHTML = extraHtml || "";
    var chipsRow = r.extra.querySelector(".pzood-chips-row");
    if (chipsRow) {
      bindDragScroll(chipsRow);
      requestAnimationFrame(function() {
        var actC = chipsRow.querySelector(".is-active");
        if (actC && chipsRow.scrollWidth > chipsRow.clientWidth + 6) {
          chipsRow.scrollLeft = Math.max(0, actC.offsetLeft - (chipsRow.clientWidth - actC.offsetWidth) / 2);
        }
      });
    }
    r.bikeBtn.textContent = isPastEra ? "\uD83D\uDC34 Κάρο" : "\uD83D\uDEB2 Ποδήλατο";
    r.walkBtn.classList.toggle("is-active", !isBike);
    r.bikeBtn.classList.toggle("is-active", isBike);

   if (curStatusAction === "card") {
      r.actBtn.textContent = isMapZoomed ? "\uD83D\uDCD6 Δες την Κάρτα \u279C" : "\uD83D\uDCD6 Δες την Κάρτα \u2193";
      r.actBtn.style.display = "";
    } else if (curStatusAction === "mirror") {
      r.actBtn.textContent = "\u26EA Σύγκρινε Παλιό \u2194 Νέο Ναό \u2193";
      r.actBtn.style.display = "";
    } else if (curStatusAction === "photo") {
      r.actBtn.textContent = "\uD83D\uDCF7 Δες Φωτογραφίες Μεγάλες \u279C";
      r.actBtn.style.display = "";
   } else if (curStatusAction === "bridge-village") {
      r.actBtn.textContent = isPastEra ? "\u2B05 Χάρτης Χωριού (1924\u201350)" : "\u2B05 Χάρτης Γειτονιάς";
      r.actBtn.style.display = "";
    } else if (curStatusAction === "bridge-katerini") {
      r.actBtn.textContent = "\uD83E\uDDED Ταχύτητες & Πυξίδα (Κατερίνη) \u279C";
      r.actBtn.style.display = "";
    } else if (curStatusAction === "bridge-kampos") {
      r.actBtn.textContent = "\uD83C\uDF0A Από το Κύμα στον Όλυμπο \u279C";
      r.actBtn.style.display = "";
    } else {
      r.actBtn.style.display = "none";
    }

   if (mapExitNodes) {
      mapExitNodes.forEach(function(sg) {
        sg.classList.toggle("is-active", activeSpecialKey === ("exit-" + sg.getAttribute("data-zexit")));
      });
    }
  }

  var justCompletedAll8 = false;
  function syncExploredUI(showWin) {
    var badge = document.getElementById("pzoodExpBadge");
    var rst = document.getElementById("pzoodExpReset");
    var win = document.getElementById("pzoodExpWinBanner");
    var cnt = 0;
    for (var i = 0; i < allExpKeys.length; i++) {
      if (exploredMap[allExpKeys[i]]) cnt++;
    }
   var totExp = allExpKeys.length;
    if (badge) {
      badge.textContent = (cnt === totExp ? "\uD83C\uDFC6 " : "\uD83D\uDDFA\uFE0F ") + "Εξερεύνησες " + cnt + "/" + totExp + " σημεία" + (cnt === totExp ? "!" : "");
      badge.classList.toggle("is-done", cnt === totExp);
    }
    if (rst) rst.style.display = cnt > 0 ? "inline-block" : "none";
    if (win) {
      if (cnt < totExp) win.classList.remove("is-vis");
      else if (showWin) win.classList.add("is-vis");
    }
   if (mapModernNodes) {
      mapModernNodes.forEach(function(nd) {
        var spIdx = nd.getAttribute("data-zmap-spot");
        var isExp = !!exploredMap["spot" + spIdx];
        var chk = nd.querySelector(".pzood-node-check");
        if (isExp && !chk) {
          var circ = nd.querySelector("circle");
          if (circ) {
            var cx = parseFloat(circ.getAttribute("cx")) || 0;
            var cy = parseFloat(circ.getAttribute("cy")) || 0;
            var r = parseFloat(circ.getAttribute("r")) || 20;
            var ns = "http://www.w3.org/2000/svg";
            chk = document.createElementNS(ns, "g");
            chk.setAttribute("class", "pzood-node-check");
            chk.setAttribute("transform", "translate(" + (cx + r * 0.72).toFixed(1) + "," + (cy - r * 0.68).toFixed(1) + ")");
            chk.style.pointerEvents = "none";
            var bg = document.createElementNS(ns, "circle");
            bg.setAttribute("r", "8"); bg.setAttribute("fill", "#16a34a"); bg.setAttribute("stroke", "#fff"); bg.setAttribute("stroke-width", "2");
            var tk = document.createElementNS(ns, "path");
            tk.setAttribute("d", "M -3.4,0.2 L -0.8,2.7 L 3.6,-2.3");
            tk.setAttribute("fill", "none"); tk.setAttribute("stroke", "#fff"); tk.setAttribute("stroke-width", "2.1"); tk.setAttribute("stroke-linecap", "round");
            chk.appendChild(bg); chk.appendChild(tk); nd.appendChild(chk);
          }
        } else if (chk) {
          chk.style.display = isExp ? "" : "none";
        }
      });
    }
  }

  function markSpotExplored(spotIdx) {
    justCompletedAll8 = false;
    var k = "spot" + spotIdx;
    if (allExpKeys.indexOf(k) === -1 || exploredMap[k]) return;
    exploredMap[k] = true;
    try { localStorage.setItem("pzood_explored_8", JSON.stringify(exploredMap)); } catch (e) {}
    var done = allExpKeys.every(function(ek) { return !!exploredMap[ek]; });
    justCompletedAll8 = done;
    syncExploredUI(done);
  }

  /* =========================================================================
     ΞΕΝΑΓΗΣΕΙΣ (ΣΗΜΕΡΑ & ΑΝΟΙΞΗ 1941) & ΚΟΥΙΖ ΝΤΕΤΕΚΤΙΒ
     ========================================================================= */
  function stopAllTours(resetStage) {
    if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; }
    isModernTourRunning = false;
    isHistTourRunning = false;
    if (resetStage) curTourStage = -1;
    var mBtn = document.getElementById("pzoodModernTourBtn");
    var hBtn = document.getElementById("pzoodHistTourBtn");
    if (mBtn) {
      mBtn.classList.remove("is-playing");
      mBtn.textContent = (!isPastEra && curTourStage !== -1) ? "\uD83D\uDD04 Ξαναδές Ξενάγηση!" : "\uD83C\uDF38 Ξενάγηση Προσκυνήματος!";
    }
    if (hBtn) {
      hBtn.classList.remove("is-playing");
      hBtn.textContent = (isPastEra && curTourStage !== -1) ? "\uD83D\uDD04 Ξαναδές το 1941!" : "\u25B6\uFE0F Ξενάγηση Άνοιξης 1941!";
    }
  }

  var modernTourStages = [
    { spotIdx: 0, dur: 0, msg: "\u26E9\uFE0F <strong>Στάση 1/5 \u2022 Πέτρινη Τοξωτή Πύλη:</strong> Φτάνουμε από την Περίσταση στο μεγάλο πλάτωμα μπροστά στην τοξωτή πύλη του περιβόλου!", pts: [[636, 156]], walkerPt: [604, 172] },
    { spotIdx: 1, dur: 2600, msg: "\uD83C\uDFDB\uFE0F <strong>Στάση 2/5 \u2022 Παλιός Πέτρινος Ναός (Πάνω/Βόρεια):</strong> Σκύβουμε ευλαβικά στη χαμηλή θύρα κάτω από το ξύλινο χαγιάτι με τα πέτρινα μανουάλια!", pts: [[636, 156], [696, 150], [756, 78], [842, 76]] },
    { spotIdx: 2, dur: 2200, msg: "\u26EA <strong>Στάση 3/5 \u2022 Καινούριος Ναός (Κάτω/Νότια):</strong> Ακριβώς δίπλα σε επαφή υψώνεται ο λευκός ναός με τον πλινθόκτιστο τρούλο &amp; τον τρίτοξο νάρθηκα!", pts: [[842, 76], [750, 84], [750, 154], [842, 154]] },
    { spotIdx: 3, dur: 2200, msg: "\uD83C\uDFE1 <strong>Στάση 4/5 \u2022 Αρχονταρίκι &amp; Κεντρικός Πλάτανος:</strong> Ξεκούραση στο κυκλικό παγκάκι γύρω από τον πλάτανο &amp; στη βεράντα του αρχονταρικιού!", pts: [[842, 154], [734, 154], [718, 92]] },
    { spotIdx: 5, dur: 4400, msg: "\uD83D\uDEDD <strong>Στάση 5/5 \u2022 Μικρή Γέφυρα \u279C Παιδική Χαρά:</strong> Περνάμε τη γέφυρα του καναλιού στη διασταύρωση και συνεχίζουμε από το μονοπάτι στο γρασίδι!", pts: [[718, 92], [696, 150], [636, 156], [584, 220], [442, 220], [442, 286], [648, 286], [692, 352]], crossPt: [442, 262], crossRoad: true }
  ];

  var modernTourLabels = ["1. \u26E9\uFE0F Πύλη", "2. \uD83C\uDFDB\uFE0F Παλιός Ναός", "3. \u26EA Νέος Ναός", "4. \uD83C\uDFE1 Πλάτανος", "5. \uD83D\uDEDD Παιδική Χαρά"];

  function showModernTourStage(sIdx) {
    var st = modernTourStages[sIdx];
    if (!st) return;
    curTourStage = sIdx;
    activeSpotIdx = -1;
    activeSpecialKey = "";
    tourActiveSpotIdx = st.spotIdx;
    if (stageEl) stageEl.innerHTML = "";
    updatePillsActive(-1);
    markSpotExplored(st.spotIdx);
    justCompletedAll8 = false;
    var sp = spotsData[st.spotIdx];
    var sm = spotMapMeta[st.spotIdx];
    var chips = '<div class="pzood-chips-row">' + modernTourLabels.map(function(lbl, i) {
      return '<button type="button" class="pzood-step-chip' + (i === sIdx ? ' is-active' : '') + '" data-ztour-step="' + i + '">' + lbl + '</button>';
    }).join("") + '</div>';
    setStatusBar(st.msg, "card", sp.img, sp.imgCap, sm, chips, sp.fallbackImg);
    runMapWalk({
      dur: st.dur || 1000, cx: sm.cx, cy: sm.cy, color: sp.accent,
      steps: sm.steps, meters: sm.meters, bikeTime: sm.bikeTime,
      crossRoad: !!st.crossRoad, crossPt: st.crossPt || null, pts: st.pts, walkerPt: st.walkerPt
    });
  }

  function startModernTour() {
    clearZoodPendingTimers();
    if (isDetActive()) stopDetective(false, true);
    if (isPastEra) setMapEra(false, true);
    stopAllTours(true);
    isModernTourRunning = true;
    var mBtn = document.getElementById("pzoodModernTourBtn");
    if (mBtn) { mBtn.classList.add("is-playing"); mBtn.textContent = "\u23F9\uFE0F Σταμάτα Ξενάγηση"; }
   var nextStep = function(idx) {
      if (!isModernTourRunning || idx >= modernTourStages.length) return;
      showModernTourStage(idx);
      var rawDur = modernTourStages[idx].dur || 1300;
      var effDur = (travelMode === "bike" && modernTourStages[idx].dur) ? Math.max(1200, Math.round(rawDur * 0.65)) : rawDur;
      var waitMs = effDur + 2500;
      if (idx < modernTourStages.length - 1) {
        tourTimer = setTimeout(function() { nextStep(idx + 1); }, waitMs);
      } else {
        tourTimer = setTimeout(function() {
          if (!isModernTourRunning) return;
          stopWalkAnim(false);
          if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
          if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
          if (mapWalkPath) {
            mapWalkPath.style.strokeDasharray = "";
            mapWalkPath.style.strokeDashoffset = "";
            mapWalkPath.setAttribute("d", "M 636,156 L 696,150 L 756,78 L 842,76 M 750,84 L 750,154 L 842,154 M 696,150 L 718,92 M 636,156 L 584,220 L 442,220 L 442,286 L 648,286 L 692,352");
          }
          lastTargetX = 640; lastTargetY = 215;
          scrollZoomedMapTo(640, 215, true);
          stopAllTours(false);
        }, waitMs);
      }
    };
    nextStep(0);
  }

 function buildHistChips(selIdx) {
    return '<div class="pzood-chips-row">' +
      hist1941Stops.map(function(hs, i) {
        return '<button type="button" class="pzood-hist-chip' + (i === selIdx ? ' is-active' : '') + '" data-zhist-chip="' + i + '">' + hs.chip + '</button>';
      }).join("") +
      '<button type="button" class="pzood-hist-chip" data-zbridge="anzac-modal">\uD83C\uDF0F Τα 3 Βήματα ANZAC (17.500 χλμ.) \u279C</button>' +
      (selIdx >= 0 ? '<button type="button" class="pzood-hist-chip pzood-hist-chip--where" data-zhist-where="1">\uD83D\uDCCD Πού πέφτει αυτό σήμερα; \u279C</button>' : '') +
    '</div>';
  }

function selectHistStop(hIdx, fromBridge) {
    clearZoodPendingTimers();
    var cl = (hIdx + hist1941Stops.length) % hist1941Stops.length;
    activeHistIdx = cl;
    activeSpecialKey = "";
    spatialBridgeHistIdx = -1;
    var hs = hist1941Stops[cl];
    var isCart = (travelMode === "bike");
    var pre = fromBridge ? "\uD83D\uDE80\u2794\uD83D\uDD70\uFE0F <strong>Στο ίδιο σημείο την Άνοιξη του 1941:</strong> " : "";
   setStatusBar(
      pre + (isCart ? hs.bike : hs.walk),
      "photo",
      hs.img,
      hs.cap,
      { steps: hs.steps, meters: hs.meters, bikeTime: hs.bikeTime, crossRoad: hs.crossRoad, safety: hs.safety, bikeSafety: hs.bikeSafety },
      detWaiting ? "" : buildHistChips(cl),
      hs.img === photoShrinePan ? photoGroveArea : photoShrinePan
    );
    runMapWalk({
      cx: hs.cx, cy: hs.cy, color: hs.color,
      steps: hs.steps, meters: hs.meters, bikeTime: hs.bikeTime,
      crossRoad: hs.crossRoad, crossPt: hs.crossPt, pts: hs.pts, walkerPt: hs.walkerPt
    });
  }

 function startHist1941Tour() {
    clearZoodPendingTimers();
    if (isDetActive()) stopDetective(false, true);
    if (!isPastEra) setMapEra(true, true);
    stopAllTours(true);
    isHistTourRunning = true;
    var hBtn = document.getElementById("pzoodHistTourBtn");
    if (hBtn) { hBtn.classList.add("is-playing"); hBtn.textContent = "\u23F9\uFE0F Σταμάτα (1941)"; }
   var runH = function(idx) {
      if (!isHistTourRunning || idx >= hist1941Stops.length) return;
      curTourStage = idx;
      selectHistStop(idx, false);
     var wMs = (idx === 0 ? 1500 : (idx === 2 || idx === 5 ? 3400 : 2800)) + 2600;
      if (idx < hist1941Stops.length - 1) {
        tourTimer = setTimeout(function() { runH(idx + 1); }, wMs);
      } else {
        tourTimer = setTimeout(function() {
          if (!isHistTourRunning) return;
          stopWalkAnim(false);
          if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
          if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
          if (mapWalkPath) {
            mapWalkPath.style.strokeDasharray = "";
            mapWalkPath.style.strokeDashoffset = "";
            mapWalkPath.setAttribute("d", "M 56,220 L 620,218 L 760,128 L 842,78 M 268,218 L 268,118 M 442,220 L 442,286 L 648,286 L 692,352 M 442,284 L 340,284");
          }
          lastTargetX = 520; lastTargetY = 220;
          scrollZoomedMapTo(520, 220, true);
          stopAllTours(false);
        }, wMs);
      }
    };
    runH(0);
  }

  /* Ντετέκτιβ Παναγίας (Κουίζ Γεωγραφίας & Ιστορίας) */
  var detActive = false, detWaiting = false, detRound = 0, detDeck = [], detMode = "mix", wasPastBeforeDet = false, detWrongT = 0;

  var detModernPool = [
    { era: "modern", spotIdx: 1, cx: 842, cy: 76, q: "\uD83C\uDFDB\uFE0F Γρίφος (Σήμερα): Πού βρίσκεται ο χαμηλός λιθόκτιστος ναός με το ξύλινο χαγιάτι και τη χαμηλή θύρα όπου σκύβουμε ευλαβικά;", note: "Στον Παλιό Πέτρινο Ναό, στη βόρεια (πάνω) πλευρά του συγκροτήματος!" },
    { era: "modern", spotIdx: 2, cx: 842, cy: 154, q: "\u26EA Γρίφος (Σήμερα): Ποιος ναός έχει οκταγωνικό πλινθόκτιστο τρούλο με κόκκινα τούβλα, τρίτοξο νάρθηκα και ενσωματωμένο καμπαναριό;", note: "Ο Καινούριος Ναός, χτισμένος νότια (κάτω) και ακριβώς σε επαφή με τον Παλιό Ναό!" },
    { era: "modern", spotIdx: 5, cx: 692, cy: 352, q: "\uD83D\uDEDD Γρίφος (Σήμερα): Πού φτάνουν τα παιδιά περνώντας τη μικρή γέφυρα του καναλιού και ακολουθώντας το μονοπάτι στο γρασίδι;", note: "Στην Παιδική Χαρά, στη νότια όχθη του καναλιού κάτω από τα δέντρα!" },
    { era: "modern", spotIdx: 4, cx: 442, cy: 262, q: "\uD83C\uDF09 Γρίφος (Σήμερα): Πού συναντά ο καμπυλωτός δρόμος από την Κατερίνη το κανάλι νερού και τον δρόμο της Περίστασης;", note: "Στη Μικρή Γέφυρα του καναλιού!" },
    { era: "modern", spotIdx: 3, cx: 718, cy: 92, q: "\uD83C\uDFE1 Γρίφος (Σήμερα): Πού βρίσκεται το κυκλικό παγκάκι γύρω από τον μεγάλο πλάτανο και το κεραμοσκεπές αρχονταρίκι με βεράντα;", note: "Μέσα στον επίπεδο, περιποιημένο αυλόγυρο απέναντι από τους δύο ναούς!" },
   { era: "modern", spotIdx: 0, cx: 636, cy: 156, q: "\u26E9\uFE0F Γρίφος (Σήμερα): Από ποιο σημείο με πέτρινο τόξο μπαίνουμε από το μεγάλο πλάτωμα μέσα στον περίβολο των δύο ναών;", note: "Από τη χαρακτηριστική Πέτρινη Τοξωτή Πύλη της εισόδου!" },
   { era: "modern", spotIdx: 8, cx: 808, cy: 334, q: "\uD83D\uDCA6 Γρίφος (Σήμερα): Ποιο μικρό κτίριο δίπλα στο κανάλι αντλεί νερό από 200 μέτρα βάθος για έως 20 αγρότες μαζί και ρίχνει νερό με σωλήνα στο κανάλι;", note: "Το κτίριο της Πομόνας, πάνω-δεξιά από την Παιδική Χαρά!" },
  { era: "modern", spotIdx: 9, cx: 276, cy: 297, q: "\uD83D\uDEB0 Γρίφος (Σήμερα): Από ποια κρήνη δίπλα στη μικρή γέφυρα έπαιρναν έως και τα τέλη του 20ού αιώνα κάτοικοι απ' όλη τη γύρω περιοχή τρεχούμενο νερό από τον Όλυμπο;", note: "Από την ιστορική Κρήνη ανάμεσα στα δέντρα, αριστερά από τη μικρή γέφυρα!" }
  ];

  var detPastPool = [
    { era: "past", histIdx: 1, cx: 268, cy: 118, q: "\u26FA Γρίφος (Άνοιξη 1941): Πού έστησαν τις καμουφλαρισμένες σκηνές τους οι Νεοζηλανδοί Σύμμαχοι (ANZAC) για να μη φαίνονται από τα εχθρικά αεροπλάνα;", note: "Κάτω από τα πυκνά αιωνόβια πλατάνια του άλσους!" },
    { era: "past", histIdx: 2, cx: 562, cy: 158, q: "\uD83C\uDF5E Γρίφος (Άνοιξη 1941): Πού κατέφθαναν οι οικογένειες της Περίστασης φέρνοντας ζεστό ζυμωτό ψωμί και αυγά στους στρατιώτες από τη Νέα Ζηλανδία;", note: "Στο ξέφωτο της εισόδου από τον πάνω χωματόδρομο της Περίστασης!" },
    { era: "past", histIdx: 0, cx: 842, cy: 78, q: "\uD83D\uDD6F\uFE0F Γρίφος (1923\u20131941): Ποιο ιστορικό κτίσμα προϋπήρχε εδώ ως παλιό μονύδριο πριν ακόμη χτιστεί ο νεότερος ναός;", note: "Το Παλιό Πέτρινο Εκκλησάκι της Ζωοδόχου Πηγής!" },
    { era: "past", histIdx: 3, cx: 442, cy: 262, q: "\uD83D\uDCA7 Γρίφος (1941): Από ποιο πέρασμα πάνω από το κανάλι νερού περνούσε ο παλιός χωματόδρομος προς την Κατερίνη;", note: "Από το παλιό Γεφυράκι της διασταύρωσης δίπλα στο δροσερό κανάλι!" },
   { era: "past", histIdx: 5, cx: 276, cy: 297, q: "\uD83D\uDEB0 Γρίφος (1941 & 20ός αι.): Πού έτρεχε ασταμάτητα δροσερό νερό από τον Όλυμπο, απ' όπου έπαιρναν νερό κάτοικοι πολλών γύρω περιοχών έως τα τέλη του 20ού αιώνα;", note: "Στην Κρήνη δίπλα στο γεφυράκι του καναλιού!" }
  ];

  function isDetActive() {
    var stg = document.getElementById("pzoodQuizStage");
    return !!(stg && stg.style.display === "block");
  }

  function syncDetBtnText() {
    var b = document.getElementById("pzoodDetectiveBtn");
    if (b && !isDetActive()) {
      b.textContent = "\uD83D\uDD75\uFE0F Ντετέκτιβ Παναγίας!" + (gamesWon.det ? " \uD83C\uDFC6" : "");
    }
  }

  function clearDetWrong() {
    if (detWrongT) { clearTimeout(detWrongT); detWrongT = null; }
    if (mapWrap) mapWrap.querySelectorAll(".is-det-wrong").forEach(function(el) { el.classList.remove("is-det-wrong"); });
  }

  function getCompassHint(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    if (Math.abs(dx) >= Math.abs(dy) * 1.25) {
      return dx > 0 ? "Ψάξε πιο Ανατολικά (προς τα δεξιά, στους ναούς)! \u27A1\uFE0F" : "Ψάξε πιο Δυτικά (προς τα αριστερά στον χάρτη)! \u2B05\uFE0F";
    }
    if (Math.abs(dy) >= Math.abs(dx) * 1.25) {
      return dy < 0 ? "Ψάξε πιο Βόρεια (πάνω από το κανάλι)! \u2B06\uFE0F" : "Ψάξε πιο Νότια (κάτω, προς το κανάλι & την απέναντι όχθη)! \u2B07\uFE0F";
    }
    return dy < 0 ? "Ψάξε πιο πάνω στον χάρτη! \u2197\uFE0F" : "Ψάξε πιο κάτω στον χάρτη! \u2198\uFE0F";
  }

  function drawDetBox(fbHtml, fbCls, allDone) {
    var stg = document.getElementById("pzoodQuizStage");
    var q = detDeck[detRound];
    if (!stg || !q) return;
    var dots = detDeck.map(function(_, i) {
      var c = "pzood-det-dot" + (allDone || i < detRound || (i === detRound && detWaiting) ? " is-done" : (i === detRound ? " is-cur" : ""));
      return '<span class="' + c + '"></span>';
    }).join("");
    stg.innerHTML =
      '<div class="pzood-det-box">' +
        '<div class="pzood-det-top">' +
          '<span class="pzood-det-kicker">' +
            '<span>\uD83D\uDD75\uFE0F Γρίφος ' + (detRound + 1) + '/' + detDeck.length + '</span>' +
            '<span class="pzood-det-dots">' + dots + '</span>' +
          '</span>' +
          '<div class="pzood-det-modes" role="group" aria-label="Εποχή γρίφων">' +
            '<button type="button" class="pzood-det-mpill' + (detMode === "past" ? " is-active" : "") + '" data-zdet-mode="past">\uD83D\uDD70\uFE0F 1941</button>' +
            '<button type="button" class="pzood-det-mpill' + (detMode === "modern" ? " is-active" : "") + '" data-zdet-mode="modern">\uD83D\uDE80 Σήμερα</button>' +
            '<button type="button" class="pzood-det-mpill' + (detMode === "mix" ? " is-active" : "") + '" data-zdet-mode="mix">\uD83C\uDF1F Όλα</button>' +
          '</div>' +
          '<button type="button" class="pzood-icon-close" data-zdet-close="1" title="Κλείσιμο">\u2715</button>' +
        '</div>' +
        '<p class="pzood-det-q">' + q.q + '</p>' +
        '<div class="pzood-det-fb' + (fbCls ? " " + fbCls : "") + '">' + fbHtml + '</div>' +
      '</div>';
    stg.querySelectorAll("img").forEach(function(im) { im.onerror = handleImgError; });
  }

 function getDetPrompt() {
    return isMobileScrollZoom()
      ? "\uD83D\uDC47 Σύρε τον χάρτη &amp; πάτησε στο σωστό σημείο!"
      : "\uD83D\uDC47 Πάτησε απευθείας πάνω στο σωστό σημείο του χάρτη!";
  }

 function setDetGuessStatus(q) {
    if (!q) return;
    setStatusBar(
      "\uD83D\uDD75\uFE0F <strong>Ντετέκτιβ Παναγίας (" + (q.era === "past" ? "Άνοιξη 1941" : "Σήμερα") + "):</strong> Διάβασε τον γρίφο πάνω από τον χάρτη &amp; πάτησε στο σωστό σημείο!",
      "", "", "", null, ""
    );
  }

  function prepDetRound() {
    clearDetWrong();
    var q = detDeck[detRound];
    if (!q || !mapWrap) return;
    if (q.era === "past" && !isPastEra) setMapEra(true, true);
    else if (q.era === "modern" && isPastEra) setMapEra(false, true);
    activeSpecialKey = "";
    spatialBridgeHistIdx = -1;
    tourActiveSpotIdx = -1;
    stopWalkAnim(false);
    syncSvgActiveFx();
    if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
    if (mapWalkPath) mapWalkPath.setAttribute("d", "");
    if (mapPulseRing) mapPulseRing.style.display = "none";
    if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
    if (mapWalkerEl) mapWalkerEl.style.display = "none";
    setDetGuessStatus(q);
    mapWrap.classList.add("is-det-mode", "is-det-guessing", "has-det-box");
    walkDimsDirty = true;
    if (isMobileScrollZoom()) scrollZoomedMapTo(470, 230, true);
  }

 function startDetective(modeOverride, keepSaved) {
    clearZoodPendingTimers();
    stopAllTours(true);
    if (!keepSaved && !isDetActive()) wasPastBeforeDet = isPastEra;
    closeSpotCard(true);
    var wBan = document.getElementById("pzoodExpWinBanner");
    if (wBan) wBan.classList.remove("is-vis");
    detMode = modeOverride || (isPastEra ? "past" : "mix");
    if (detMode === "past") detDeck = shuffleList(detPastPool);
    else if (detMode === "modern") detDeck = shuffleList(detModernPool).slice(0, 5);
    else detDeck = shuffleList(shuffleList(detModernPool).slice(0, 3).concat(shuffleList(detPastPool).slice(0, 2)));
    detRound = 0; detWaiting = false; detActive = true;
    var b = document.getElementById("pzoodDetectiveBtn");
    if (b) { b.classList.add("is-active"); b.textContent = "\u2715 Έξοδος Ντετέκτιβ"; }
    var stg = document.getElementById("pzoodQuizStage");
    if (stg) stg.style.display = "block";
    prepDetRound();
    drawDetBox(getDetPrompt(), "", false);
    requestAnimationFrame(function() {
      if (isMapZoomed && mapWrap) {
        if (mapWrap.scrollTo) mapWrap.scrollTo({ top: 0, behavior: "smooth" });
        else mapWrap.scrollTop = 0;
      } else if (stg && mapWrap) {
        var dr = stg.getBoundingClientRect();
        if (dr.top < 8 || dr.bottom > window.innerHeight - 80) {
          mapWrap.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  function stopDetective(restoreFocus, skipRestore) {
    clearDetWrong();
    var wasOpen = isDetActive();
   detActive = false; detWaiting = false;
    walkDimsDirty = true;
    if (mapWrap) mapWrap.classList.remove("is-det-mode", "is-det-guessing", "has-det-box");
    var stg = document.getElementById("pzoodQuizStage");
    if (stg) { stg.style.display = "none"; stg.innerHTML = ""; }
    var b = document.getElementById("pzoodDetectiveBtn");
    if (b) { b.classList.remove("is-active"); syncDetBtnText(); }
    if (wasOpen && !skipRestore) {
      if (isPastEra !== wasPastBeforeDet) setMapEra(wasPastBeforeDet, true);
      if (isPastEra) selectHistStop(activeHistIdx, false);
      else syncModernMap(-1, true);
    }
    if (restoreFocus && b && b.focus) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
  }

function advanceDetRound(focusFirstNode) {
    if (!detActive || !detWaiting) return;
    detRound++;
    detWaiting = false;
    prepDetRound();
    drawDetBox(getDetPrompt(), "", false);
    if (focusFirstNode && mapWrap) {
      requestAnimationFrame(function() {
        var fn = mapWrap.querySelector(isPastEra ? ".pzood-hist-node" : ".pzood-map-node");
        if (fn && fn.focus) { try { fn.focus({ preventScroll: true }); } catch (e) { fn.focus(); } }
      });
    }
  }

  function handleDetNodeTap(tap) {
    if (!detActive || !tap) return;
    if (detWaiting) {
      var stgW = document.getElementById("pzoodQuizStage");
      if (isMapZoomed && mapWrap) {
        if (mapWrap.scrollTo) mapWrap.scrollTo({ top: 0, behavior: "smooth" });
        else mapWrap.scrollTop = 0;
      } else if (stgW) {
        var qr = stgW.getBoundingClientRect();
        if (qr.top < 8 || qr.bottom > window.innerHeight - 20) {
          stgW.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
      return;
    }
    var q = detDeck[detRound];
    if (!q) return;
    var ok = (q.era === "past") ? (tap.histIdx === q.histIdx) : (tap.spotIdx === q.spotIdx);
    if (ok) {
      clearDetWrong();
      var isLast = (detRound >= detDeck.length - 1);
      mapWrap.classList.remove("is-det-guessing");
      if (isLast) {
        detActive = false; detWaiting = false;
        gamesWon.det = 1;
        try { localStorage.setItem("pzood_games_won", JSON.stringify(gamesWon)); } catch (e) {}
      } else {
        detWaiting = true;
      }
      var phSrc = "", phCap = "", phFb = "";
      if (q.era === "past") {
        selectHistStop(q.histIdx, false);
        phSrc = hist1941Stops[q.histIdx].img;
        phCap = hist1941Stops[q.histIdx].cap;
        phFb = phSrc === photoShrinePan ? photoGroveArea : photoShrinePan;
      } else {
        syncModernMap(q.spotIdx, true);
        tourActiveSpotIdx = q.spotIdx;
        syncSvgActiveFx();
        phSrc = spotsData[q.spotIdx].img;
        phCap = spotsData[q.spotIdx].imgCap;
        phFb = spotsData[q.spotIdx].fallbackImg || photoShrinePan;
      }
      var thHtml = phSrc ? '<img class="pzood-det-thumb" src="' + optImg(phSrc, 320) + '" data-full-src="' + escAttr(phSrc) + '" data-fallback-src="' + escAttr(phFb) + '" alt="' + escAttr(tap.label) + '" data-zdet-zoom="1" tabindex="0" role="button"/>' : '';
      if (!isLast) {
        drawDetBox(
          '<div class="pzood-det-win-row">' + thHtml + '<span>\u2705 <strong>Σωστά! (' + tap.label + ')</strong> ' + q.note + '</span></div>' +
          '<button type="button" class="pzood-det-next-btn" data-zdet-next="1">Επόμενος (' + (detRound + 2) + '/' + detDeck.length + ') \u279C</button>',
          "is-win", false
        );
      } else {
        drawDetBox(
          '<div class="pzood-det-win-row">' + thHtml + '<span>\uD83C\uDFC6 <strong>Άριστα!</strong> Ξεκλείδωσες όλα τα μυστικά της Παναγίας Ζωοδόχου Πηγής!</span></div>' +
          '<button type="button" class="pzood-det-next-btn" data-zdet-replay="1">\uD83D\uDD04 Παίξε ξανά</button>',
          "is-win", true
        );
      }
    } else {
      clearDetWrong();
      if (tap.el) {
        void tap.el.getBoundingClientRect();
        tap.el.classList.add("is-det-wrong");
        detWrongT = setTimeout(clearDetWrong, 750);
      }
     drawDetBox('<span>\uD83E\uDD14 Εδώ είναι «' + tap.label + '» \u2014 ' + getCompassHint(tap.cx, tap.cy, q.cx, q.cy) + '</span>', "is-warn", false);
      if (isMobileScrollZoom()) {
        scrollZoomedMapTo(tap.cx * 0.55 + q.cx * 0.45, tap.cy * 0.55 + q.cy * 0.45, true);
      }
    }
  }

  /* =========================================================================
     ΜΕΓΕΘΥΝΣΗ ΧΑΡΤΗ (MODAL) & ΕΝΑΛΛΑΓΗ ΕΠΟΧΗΣ (ΣΗΜΕΡΑ / 1941)
     ========================================================================= */
var mapZoomOpenedAt = 0;
  var zoodRevealGraceUntil = 0;
  var autoVillagePending = false;
  var autoVillageFromKb = false;
  var arrivalWalkTimer = null;
  var pendingModalReturn = null;
  var modalReturnWatcherBound = false;
  var modalWasSeenOpen = false;
  var inPopstateTick = false;

  window.addEventListener("popstate", function() {
    inPopstateTick = true;
    setTimeout(function() { inPopstateTick = false; }, 0);
  }, true);

  function clearZoodPendingTimers() {
    autoVillagePending = false;
    if (arrivalWalkTimer) { clearTimeout(arrivalWalkTimer); arrivalWalkTimer = null; }
  }

  function isZoodSceneSelected() {
    return !!(rootEl && rootEl.style.display !== "none" && rootEl.getAttribute("aria-hidden") !== "true");
  }

  function isCoveredByMainOverlay() {
    if (document.body.classList.contains("pexp-zoom-open")) return true;
    var mainM = document.getElementById("peristasiExplorerModal");
    if (mainM && mainM.classList.contains("is-open")) return true;
    return !!document.querySelector(".preg-modal-bg.is-open, .ptl22-modal-bg.is-open");
  }

  function isZoodRootVisible() {
    return !!(isZoodSceneSelected() && rootEl.getClientRects().length > 0 && window.getComputedStyle(rootEl).visibility !== "hidden");
  }

  function applyModalReturnState(ret) {
    if (!ret || !isZoodSceneSelected()) return;
    var mainM = document.getElementById("peristasiExplorerModal");
    if (mainM && mainM.classList.contains("is-open")) return;
    if (mapWrap) mapWrap.classList.remove("is-paused");
    if (ret.wasZoomed) {
      lastTargetX = ret.targetX;
      lastTargetY = ret.targetY;
      if (!isMapZoomed) {
        openMapModal(mapZoomBtn);
      }
      requestAnimationFrame(function() {
        scrollZoomedMapTo(ret.targetX, ret.targetY, false);
        var zFocus = (ret.focusEl && document.contains(ret.focusEl) && isFocusableVis(ret.focusEl))
          ? ret.focusEl
          : mapZoomBtn;
        if (zFocus && zFocus.focus) {
          try { zFocus.focus({ preventScroll: true }); } catch (err) { zFocus.focus(); }
        }
      });
    } else {
      if (typeof ret.scrollY === "number" && Math.abs((window.scrollY || window.pageYOffset || 0) - ret.scrollY) > 10) {
        window.scrollTo(0, ret.scrollY);
      }
      if (ret.focusEl && document.contains(ret.focusEl) && isFocusableVis(ret.focusEl)) {
        try { ret.focusEl.focus({ preventScroll: true }); } catch (err) { ret.focusEl.focus(); }
      }
    }
  }

  function bindMainModalReturnWatcher() {
    if (modalReturnWatcherBound || typeof MutationObserver !== "function") return;
    var mainM = document.getElementById("peristasiExplorerModal");
    if (!mainM) return;
    modalReturnWatcherBound = true;
    modalWasSeenOpen = mainM.classList.contains("is-open");

    mainM.addEventListener("click", function(e) {
      if (e.target && e.target.closest && e.target.closest("#pexpChurchMapBridgeBtn, [data-anzac-map], #pexpZoodFullMapBtn, [data-anzac-zood41], [data-jump-zood-1941]")) {
        pendingModalReturn = null;
      }
    }, true);

    var mObs = new MutationObserver(function() {
      var nowOpen = mainM.classList.contains("is-open");
      if (nowOpen) {
        modalWasSeenOpen = true;
        return;
      }
      if (!modalWasSeenOpen) return;
      modalWasSeenOpen = false;
      if (!pendingModalReturn) return;
      var ret = pendingModalReturn;
      pendingModalReturn = null;
      if (inPopstateTick) {
        requestAnimationFrame(function() {
          requestAnimationFrame(function() { applyModalReturnState(ret); });
        });
      } else {
        var settled = false;
        var finishRet = function() {
          if (settled) return;
          settled = true;
          window.removeEventListener("popstate", finishRet);
          requestAnimationFrame(function() {
            requestAnimationFrame(function() { applyModalReturnState(ret); });
          });
        };
        window.addEventListener("popstate", finishRet);
        setTimeout(finishRet, 370);
      }
    });
    mObs.observe(mainM, { attributes: true, attributeFilter: ["class"] });
  }

  function runBridgeToMain(fn, keepDualZoom) {
    clearZoodPendingTimers();
    if (isDetActive()) stopDetective(false, true);
    stopAllTours(false);
    stopWalkAnim(true);
    var steps = 0;
    if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
      if (histImgZoom) { steps++; histImgZoom = false; }
      lastZoomFocusEl = null;
      closePhotoZoom(true);
    }
    var hasDual = !!(window.peristasiBridge && window.peristasiBridge.hasDualStage);
    if (isMapZoomed && !hasDual) {
      if (histMapZoom) { steps++; histMapZoom = false; }
      lastMapFocusEl = null;
      closeMapModal(true);
    }
    if (steps === 0) {
      if (isMapZoomed && hasDual && !keepDualZoom) {
        lastMapFocusEl = null;
        var dualDidBack = closeMapModal(false, true);
        runAfterBack(dualDidBack, fn);
        return;
      }
      fn();
      return;
    }
    safeBack(steps);
    runAfterBack(true, function() {
      if (isMapZoomed && hasDual && !keepDualZoom) {
        lastMapFocusEl = null;
        var dBack = closeMapModal(false, true);
        runAfterBack(dBack, fn);
        return;
      }
      fn();
    });
  }

  function execZoodBridgeKey(bKey, fromKb, fromWalk, trigEl) {
    if (!window.peristasiBridge) return;
    if (bKey === "village") {
      pendingModalReturn = null;
      runBridgeToMain(function() {
        window.peristasiBridge.jumpToVillageMap({
          era1941: isPastEra,
          travelMode: travelMode,
          fromWalk: !!fromWalk,
          fromKb: !!fromKb
        });
      }, true);
      return;
    }
    var isModalBridge = (bKey !== "macro-katerini" && bKey !== "macro-paralia");
    if (isModalBridge) {
      var fCand = (trigEl && document.contains(trigEl)) ? trigEl : document.activeElement;
      pendingModalReturn = {
        wasZoomed: isMapZoomed,
        targetX: lastTargetX,
        targetY: lastTargetY,
        spotIdx: activeSpotIdx,
        fromKb: !!fromKb,
        focusEl: (fCand && fCand !== document.body) ? fCand : null,
        scrollY: window.scrollY || window.pageYOffset || 0
      };
      bindMainModalReturnWatcher();
    } else {
      pendingModalReturn = null;
    }
    runBridgeToMain(function() {
      if (bKey === "churches-0") window.peristasiBridge.openChurchesModal(0, false);
      else if (bKey === "churches-1") window.peristasiBridge.openChurchesModal(1, false);
      else if (bKey === "anzac-modal") window.peristasiBridge.openChurchesModal(1, true);
      else if (bKey === "year-1940") window.peristasiBridge.openYear(1940);
      else if (bKey === "route-katerini") window.peristasiBridge.openRouteToKaterini();
      else if (bKey === "elev-sea") window.peristasiBridge.openElevationZone(0);
      else if (bKey === "macro-katerini") window.peristasiBridge.jumpToRegionalPin(1, !!fromKb);
      else if (bKey === "macro-paralia") window.peristasiBridge.jumpToRegionalPin(2, !!fromKb);
    }, true);
  }

  function openMapModal(trigFocusEl) {
    if (isMapZoomed || !mapWrap) return;
    var candFocus = trigFocusEl || document.activeElement;
    if (window.peristasiBridge && typeof window.peristasiBridge.openDualMapZoom === "function") {
      window.peristasiBridge.openDualMapZoom(candFocus);
      return;
    }
    mapZoomOpenedAt = performance.now();
    if (window.peristasiBridge) {
      if (window.peristasiBridge.pauseHeroVideo) window.peristasiBridge.pauseHeroVideo();
      if (window.peristasiBridge.closeMapZooms) window.peristasiBridge.closeMapZooms(true);
    }
    if (candFocus && candFocus !== document.body) lastMapFocusEl = candFocus;
    if (!mapModalBg) {
      mapModalBg = document.createElement("div");
      mapModalBg.className = "pzood-modal-bg";
      document.body.appendChild(mapModalBg);
      var bgDown = false;
      mapModalBg.addEventListener("pointerdown", function(e) { bgDown = (e.isPrimary !== false && e.target === mapModalBg); }, { passive: true });
      mapModalBg.addEventListener("click", function(e) { if (bgDown && !isPinchZoomed() && e.target === mapModalBg) closeMapModal(false); bgDown = false; });
    }
    if (!mapPlaceholder) mapPlaceholder = document.createElement("div");
    if (mapWrap.parentNode) {
      var mwCs = window.getComputedStyle(mapWrap);
      mapPlaceholder.style.height = mapWrap.offsetHeight + "px";
      mapPlaceholder.style.marginTop = mwCs.marginTop;
      mapPlaceholder.style.marginBottom = mwCs.marginBottom;
      mapPlaceholder.style.display = "block";
      mapWrap.parentNode.insertBefore(mapPlaceholder, mapWrap);
    }
    isMapZoomed = true;
    walkDimsDirty = true;
    mapWrap.classList.remove("is-paused");
    mapModalBg.appendChild(mapWrap);
    mapWrap.classList.add("is-zoomed");
    mapModalBg.classList.add("is-open");
    lockPageScroll();
    if (mapZoomBtn) {
      mapZoomBtn.textContent = "\u2715 Κλείσιμο";
      requestAnimationFrame(function() {
        scrollZoomedMapTo(lastTargetX, lastTargetY, false);
        try { mapZoomBtn.focus({ preventScroll: true }); } catch (e) { mapZoomBtn.focus(); }
      });
    }
   if (mapStatusEl && mapStatusEl._refs && curStatusAction === "card") {
      mapStatusEl._refs.actBtn.textContent = "\uD83D\uDCD6 Δες την Κάρτα \u279C";
    }
    if (detActive && !detWaiting) {
      var dFbIn = document.querySelector("#pzoodQuizStage .pzood-det-fb:not(.is-warn):not(.is-win)");
      if (dFbIn) dFbIn.innerHTML = getDetPrompt();
    }
   var syncMapHist = function() {
      if (histMapZoom || !isMapZoomed || (window.peristasiBridge && window.peristasiBridge.hasDualStage)) return;
      if (ignorePopCount > 0) { runAfterBack(true, syncMapHist); return; }
      histMapZoom = true;
      try {
        var st = Object.assign({}, window.history.state || {}, { pzoodMapZoom: true });
        window.history.pushState(st, "", window.location.href);
      } catch (e) {}
    };
    syncMapHist();
  }

function closeMapModal(fromPop, clearRestoreFocus) {
    if (!isMapZoomed || !mapWrap) return false;
    if (window.peristasiBridge && typeof window.peristasiBridge.closeDualMapZoom === "function") {
      if (clearRestoreFocus) lastMapFocusEl = null;
      return !!window.peristasiBridge.closeDualMapZoom(!!fromPop, !!clearRestoreFocus);
    }
    if (clearRestoreFocus) lastMapFocusEl = null;
    isMapZoomed = false;
    walkDimsDirty = true;
    mapWrap.classList.remove("is-zoomed");
    if (mapModalBg) mapModalBg.classList.remove("is-open");
    if (mapPlaceholder && mapPlaceholder.parentNode) {
      mapPlaceholder.parentNode.insertBefore(mapWrap, mapPlaceholder);
      mapPlaceholder.style.display = "none";
    }
    var mSc = document.getElementById("pzoodMapScroll");
    if (mSc) { mSc.scrollLeft = 0; mSc.scrollTop = 0; }
    unlockPageScroll();
    if (mapZoomBtn) mapZoomBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";
   if (mapStatusEl && mapStatusEl._refs && curStatusAction === "card") {
      mapStatusEl._refs.actBtn.textContent = "\uD83D\uDCD6 Δες την Κάρτα \u2193";
    }
    if (detActive && !detWaiting) {
      var dFbOut = document.querySelector("#pzoodQuizStage .pzood-det-fb:not(.is-warn):not(.is-win)");
      if (dFbOut) dFbOut.innerHTML = getDetPrompt();
    }
    if (lastMapFocusEl && document.contains(lastMapFocusEl) && lastMapFocusEl.focus) {
      var mf = lastMapFocusEl; lastMapFocusEl = null;
      requestAnimationFrame(function() { try { mf.focus({ preventScroll: true }); } catch (e) { mf.focus(); } });
    }
   var needBack = (!fromPop && histMapZoom);
    histMapZoom = false;
    if (needBack) safeBack();
    return needBack;
  }

var exitOriginSpotIdx = -1;
  function showExitRoute(exitKey, autoGoVillage, fromKb) {
    if (arrivalWalkTimer) { clearTimeout(arrivalWalkTimer); arrivalWalkTimer = null; }
    stopAllTours(true);
    var nextKey = "exit-" + exitKey;
    var curSp = activeSpotIdx !== -1 ? activeSpotIdx : (tourActiveSpotIdx !== -1 ? tourActiveSpotIdx : (activeSpecialKey === nextKey ? exitOriginSpotIdx : -1));
    exitOriginSpotIdx = curSp;
    activeSpecialKey = nextKey;
    var isPer = (exitKey === "peristasi");
    var isKat = (exitKey === "katerini");
    autoVillagePending = !!(isPer && autoGoVillage && window.peristasiBridge);
    autoVillageFromKb = !!fromKb;
    if (autoVillagePending) zoodRevealGraceUntil = performance.now() + 2800;
    tourActiveSpotIdx = -1;
    spatialBridgeHistIdx = -1;
    var msg = "", meta = null, pts = [], cx = 60, cy = 220, col = "#16a34a", crPt = null, crRoad = false;

    if (isPer) {
      cx = 56; cy = 220; col = "#16a34a";
     msg = autoVillagePending
        ? (isPastEra
            ? "\uD83C\uDF5E <strong>Πάνω Χωματόδρομος προς Περίσταση (~1,2 χλμ):</strong> Επιστρέφουμε στο χωριό μας \u2014 μόλις φτάσουμε περνάμε αυτόματα στον Ιστορικό Χάρτη (1924\u20131950)!"
            : (travelMode === "bike" ? "\uD83D\uDEB2" : "\uD83C\uDFE1") + " <strong>Δρόμος προς Περίσταση (~1,2 χλμ):</strong> Επιστρέφουμε στο χωριό μας \u2014 μόλις φτάσουμε περνάμε αυτόματα στον Χάρτη της Γειτονιάς!")
        : (isPastEra
            ? "\uD83C\uDF5E <strong>Πάνω Χωματόδρομος από Περίσταση (~1,2 χλμ):</strong> Από αυτόν τον δρόμο έρχονταν οι οικογένειες του χωριού το 1941 φέρνοντας ζεστό ζυμωτό ψωμί στους Νεοζηλανδούς Συμμάχους!"
            : "\uD83C\uDFE1 <strong>Κεντρικός Δρόμος από Περίσταση (~1,2 χλμ):</strong> Από εδώ ερχόμαστε απευθείας από το χωριό μας και τον ενοριακό Ι.Ν. Αγίου Γεωργίου (~4' με ποδήλατο, ~15' πεζοί)!");
      meta = {
        steps: 1800, meters: 1200, bikeTime: isPastEra ? "~15 λεπτά" : "~4 λεπτά", crossRoad: false,
        safety: "\uD83D\uDEB8 Στον αγροτικό δρόμο βαδίζουμε πάντα στην άκρη με συνοδό!",
        bikeSafety: "\uD83E\uDE96 Ποδηλατάδα 1,2 χλμ από την Περίσταση \u2014 πάντα με κράνος & συνοδό!"
      };
     if (isPastEra) {
        pts = activeHistIdx === 1 ? [[268, 118], [268, 220], [56, 220]]
          : (activeHistIdx === 2 ? [[562, 158], [508, 220], [56, 220]]
          : (activeHistIdx === 3 ? [[442, 262], [442, 220], [56, 220]]
          : (activeHistIdx === 4 ? [[692, 352], [648, 286], [442, 286], [442, 220], [56, 220]]
         : (activeHistIdx === 5 ? [[340, 284], [442, 284], [442, 220], [56, 220]]
          : [[760, 128], [610, 220], [56, 220]]))));
      } else {
        pts = curSp === 6 ? [[256, 118], [256, 220], [56, 220]]
          : (curSp === 4 ? [[442, 262], [442, 220], [56, 220]]
          : (curSp === 5 ? [[692, 352], [648, 286], [442, 286], [442, 220], [56, 220]]
          : (curSp === 8 ? [[788, 284], [442, 284], [442, 220], [56, 220]]
          : (curSp === 9 ? [[340, 284], [442, 284], [442, 220], [56, 220]]
          : [[636, 156], [584, 220], [56, 220]]))));
      }
    } else if (isKat) {
      cx = 54; cy = 384; col = "#d97706"; crPt = [442, 262]; crRoad = true;
      msg = isPastEra
        ? "\uD83D\uDC34 <strong>Κάτω Χωματόδρομος προς Κατερίνη (~3 χλμ):</strong> Περνούσε το γεφυράκι του καναλιού και συνέχιζε ανάμεσα στα χωράφια έως την Κατερίνη (~45' με κάρο)!"
        : "\uD83C\uDFD9\uFE0F <strong>Κάτω Δρόμος προς Κατερίνη (~3 χλμ):</strong> Περνάει πάνω από τη μικρή γέφυρα του καναλιού και οδηγεί στο κέντρο της Κατερίνης (~5' με αυτοκίνητο, ~10' με ποδήλατο)!";
      meta = {
        steps: 4500, meters: 3000, bikeTime: isPastEra ? "~45 λεπτά" : "~10 λεπτά", crossRoad: true,
        safety: "\uD83D\uDEA6 Περνάμε προσεκτικά τη διασταύρωση και τη μικρή γέφυρα του καναλιού!",
        bikeSafety: "\uD83E\uDE96 Προς Κατερίνη (3 χλμ): Κόβουμε ταχύτητα στη γέφυρα & κινούμαστε δεξιά!"
      };
      pts = [[636, 156], [584, 220], [442, 220], [442, 276], [365, 332], [220, 368], [54, 384]];
    } else {
      cx = 904; cy = 220; col = "#0284c7";
      msg = "\uD83C\uDF3E <strong>Ανατολικός Δρόμος προς Κάμπο &amp; Παράλια:</strong> Συνεχίζει κάτω από τον πέτρινο περίβολο της εκκλησίας προς τα εύφορα χωράφια και την ακτή του Θερμαϊκού!";
      meta = {
        steps: 600, meters: 400, bikeTime: "~1,5 λεπτό", crossRoad: false,
        safety: "\uD83C\uDF3F Ήσυχη διαδρομή δίπλα στο κανάλι νερού και τον πέτρινο μαντρότοιχο!",
        bikeSafety: "\uD83E\uDE96 Ήρεμη βόλτα δίπλα στα πλατάνια και το κανάλι νερού!"
      };
      pts = [[636, 156], [636, 220], [904, 220]];
    }
 var exPhoto = isKat ? customZoodPhotos.gefyraKanali : photoGroveArea;
    var exCap = isKat ? "Η μικρή γέφυρα του καναλιού στον δρόμο προς Κατερίνη" : "Το καταπράσινο τοπίο της Παναγίας Περίστασης";
    var hasMain = !!window.peristasiBridge;
    var actType = !hasMain ? "photo" : (isPer ? "bridge-village" : (isKat ? "bridge-katerini" : "bridge-kampos"));
    var extraExitHtml = "";
    if (hasMain) {
      if (isPer) {
        extraExitHtml = '<div class="pzood-chips-row">' +
          (isPastEra
            ? '<button type="button" class="pzood-hist-chip" data-zbridge="anzac-modal">\uD83C\uDF0F Αφιέρωμα ANZAC 1941 (3 Βήματα) \u279C</button>' +
              '<button type="button" class="pzood-hist-chip" data-zbridge="year-1940">\u23F3 Το Χωριό το 1940 \u279C</button>'
            : '<button type="button" class="pzood-step-chip" data-zbridge="churches-0">\u26EA Ι.Ν. Αγίου Γεωργίου &amp; Κειμήλια \u279C</button>') +
        '</div>';
      } else if (isKat) {
        extraExitHtml = '<div class="pzood-chips-row">' +
          '<button type="button" class="pzood-step-chip" data-zbridge="macro-katerini">\uD83D\uDDFA\uFE0F Δες την Κατερίνη στον Χάρτη Πιερίας \u2191</button>' +
        '</div>';
      } else {
        extraExitHtml = '<div class="pzood-chips-row">' +
          '<button type="button" class="pzood-step-chip" data-zbridge="macro-paralia">\uD83D\uDDFA\uFE0F Δες την Παραλία στον Χάρτη Πιερίας \u2191</button>' +
        '</div>';
      }
    } else if (isPastEra) {
      extraExitHtml = buildHistChips(-1);
    }
   setStatusBar(msg, actType, exPhoto, exCap, meta, extraExitHtml, photoGroveArea);
    runMapWalk({
      dur: autoVillagePending ? 1650 : undefined,
      cx: cx, cy: cy, color: col, steps: meta.steps, meters: meta.meters,
      bikeTime: meta.bikeTime, crossRoad: crRoad, crossPt: crPt, pts: pts,
      onArrive: autoVillagePending ? function() {
        if (autoVillagePending && activeSpecialKey === "exit-peristasi") {
          var kb = autoVillageFromKb;
          autoVillagePending = false;
          execZoodBridgeKey("village", kb, true);
        }
      } : null
    });
  }

 function showWhereTodayFrom1941(hIdx) {
    clearZoodPendingTimers();
    var hs = hist1941Stops[hIdx] || hist1941Stops[0];
    var mIdx = hs.modernSpot;
    var sp = spotsData[mIdx];
    var sm = spotMapMeta[mIdx];
    stopAllTours(true);
    activeSpecialKey = "";
    tourActiveSpotIdx = mIdx;
    spatialBridgeHistIdx = hIdx;
    var backChip = '<div class="pzood-chips-row">' +
      '<button type="button" class="pzood-step-chip" data-zback-1941="' + hIdx + '">\uD83D\uDD70\uFE0F Ξαναδές αυτό το σημείο την Άνοιξη του 1941</button>' +
    '</div>';
    setStatusBar(
      "\uD83D\uDD70\uFE0F\u2794\uD83D\uDE80 <strong>Πού πέφτει αυτό σήμερα;</strong> Στο ίδιο σημείο βρίσκεται σήμερα: <strong>" + sp.title + "</strong>!",
      "card", sp.img, sp.imgCap, sm, backChip, sp.fallbackImg
    );
    runMapWalk({
      cx: sm.cx, cy: sm.cy, color: sp.accent,
      steps: sm.steps, meters: sm.meters, bikeTime: sm.bikeTime,
      crossRoad: sm.crossRoad, crossPt: sm.crossPt, pts: sm.pts, walkerPt: sm.walkerPt
    });
  }

  function setMapEra(toPast, skipSync, useSpatialBridge) {
    var nextPast = !!toPast;
    if (isPastEra === nextPast && !skipSync) return;
    var prevHist = activeHistIdx;
    var prevModern = activeSpotIdx !== -1 ? activeSpotIdx : tourActiveSpotIdx;
   stopAllTours(true);
    isPastEra = nextPast;
    walkDimsDirty = true;
    if (mapWrap) mapWrap.classList.toggle("is-era-past", isPastEra);
   var mBtn = document.getElementById("pzoodEraModernBtn");
    var pBtn = document.getElementById("pzoodEraPastBtn");
    var vBtn = document.getElementById("pzoodBackToVillageBtn");
    var ttl = document.getElementById("pzoodMapMainTitle");
    var hnt = document.getElementById("pzoodMapHintSpan");
    if (mBtn) { mBtn.classList.toggle("is-active", !isPastEra); mBtn.setAttribute("aria-pressed", !isPastEra ? "true" : "false"); }
    if (pBtn) { pBtn.classList.toggle("is-active", isPastEra); pBtn.setAttribute("aria-pressed", isPastEra ? "true" : "false"); }
    if (vBtn) vBtn.textContent = isPastEra ? "\u2B05 Χωριό (1924\u201350)" : "\u2B05 Χάρτης Γειτονιάς";
    if (ttl) {
      ttl.textContent = isPastEra
        ? "\uD83D\uDD70\uFE0F Παναγία Ζωοδόχος Πηγή: Άνοιξη 1941 (ANZAC)"
        : "\uD83D\uDDFA\uFE0F Χάρτης Παναγίας Ζωοδόχου Πηγής Περίστασης";
    }
    if (hnt) {
      hnt.style.color = isPastEra ? "#92400e" : "#166534";
      hnt.textContent = isPastEra
        ? "\uD83D\uDC46 Πάτησε στις σκηνές του 1941 ή στην «Ξενάγηση Άνοιξης 1941»!"
        : "\uD83D\uDC46 Πάτησε στους 2 ναούς, τη γέφυρα ή την παιδική χαρά!";
    }
    syncWalkerAppearance();
    if (isPastEra) {
      var wBan = document.getElementById("pzoodExpWinBanner");
      if (wBan) wBan.classList.remove("is-vis");
      closeSpotCard(true);
      if (!skipSync) {
        var mappedH = 0;
        if (prevModern === 6) mappedH = 1;
        else if (prevModern === 0 || prevModern === 7) mappedH = 2;
     else if (prevModern === 4) mappedH = 3;
        else if (prevModern === 5 || prevModern === 8) mappedH = 4;
        else if (prevModern === 9) mappedH = 5;
        selectHistStop(mappedH, prevModern !== -1);
      }
    } else if (!skipSync) {
      if (useSpatialBridge) showWhereTodayFrom1941(prevHist);
      else syncModernMap(-1, true);
    }
  }

 function syncModernMap(spotIdx, skipMark) {
    clearZoodPendingTimers();
    if (isPastEra) setMapEra(false, true);
    stopAllTours(true);
    spatialBridgeHistIdx = -1;
    tourActiveSpotIdx = -1;
    activeSpecialKey = "";
    syncWalkerAppearance();
    var isBike = (travelMode === "bike");

  if (spotIdx < 0 || !spotMapMeta[spotIdx]) {
      stopWalkAnim(false);
      syncSvgActiveFx();
      lastTargetX = 636; lastTargetY = 156;
      if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
      if (mapWalkPath) mapWalkPath.setAttribute("d", "");
      if (mapPulseRing) mapPulseRing.style.display = "none";
      if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
     if (mapWalkerEl) {
        mapWalkerEl.style.display = "";
        setWalkerPos(604, 172, 1);
      }
      var idle = isBike
        ? "\uD83D\uDEB2 Αφετηρία το Πλάτωμα της Τοξωτής Πύλης \u2014 πάτησε σε σημείο του χάρτη!"
        : "\u26E9\uFE0F Αφετηρία η Πέτρινη Τοξωτή Πύλη \u2014 πάτησε στους 2 ναούς, τη γέφυρα ή την Παιδική Χαρά!";
      setStatusBar(idle, "", "", "", null);
      return;
    }

    if (!skipMark) markSpotExplored(spotIdx);
    var sp = spotsData[spotIdx];
    var sm = spotMapMeta[spotIdx];
    var msg = (isBike ? sm.bike : sm.walk) + ' <span class="pzood-status-yr">' + sp.eraTag + '</span>';
    setStatusBar(msg, "card", sp.img, sp.imgCap, sm, "", sp.fallbackImg);
    runMapWalk({
      cx: sm.cx, cy: sm.cy, color: sp.accent,
      steps: sm.steps, meters: sm.meters, bikeTime: sm.bikeTime,
      crossRoad: sm.crossRoad, crossPt: sm.crossPt, pts: sm.pts, walkerPt: sm.walkerPt
    });
  }

if (pillsListEl) {
    pillsListEl.innerHTML =
      '<li data-zspot="0" title="Πέτρινη Τοξωτή Πύλη &amp; Πλάτωμα">\u26E9\uFE0F Πέτρινη Πύλη</li>' +
      '<li data-zspot="1" title="Παλιός Πέτρινος Ναός">\uD83C\uDFDB\uFE0F Παλιός Ναός</li>' +
      '<li data-zspot="2" title="Καινούριος Ναός Ζωοδόχου Πηγής">\u26EA Καινούριος Ναός</li>' +
      '<li data-zspot="3" title="Αυλόγυρος, Αρχονταρίκι &amp; Πλάτανος">\uD83C\uDFE1 Αρχονταρίκι</li>' +
      '<li data-zspot="4" title="Μικρή Γέφυρα &amp; Κανάλι Νερού">\uD83C\uDF09 Μικρή Γέφυρα</li>' +
      '<li data-zspot="5" title="Παιδική Χαρά">\uD83D\uDEDD Παιδική Χαρά</li>' +
      '<li data-zspot="6" title="Άλσος Αιωνόβιων Πλατανιών">\uD83C\uDF33 Άλσος Πλατανιών</li>' +
      '<li data-zspot="7" title="Πανήγυρη Διακαινησίμου &amp; Μυστήρια">\uD83C\uDF38 Πανήγυρη</li>' +
      '<li data-zspot="8" title="Κτίριο Πομόνας (Γεώτρηση 200μ)">\uD83D\uDCA6 Πομόνα (200μ)</li>' +
      '<li data-zspot="9" title="Κρήνη με Τρεχούμενο Νερό Ολύμπου">\uD83D\uDEB0 Κρήνη Ολύμπου</li>';
  }
  var pillEls = pillsListEl ? pillsListEl.querySelectorAll("li[data-zspot]") : [];

  function updatePillsActive(idx) {
    pillEls.forEach(function(li) {
      var cur = Number(li.getAttribute("data-zspot")) === idx;
      li.classList.toggle("is-active", cur);
      li.setAttribute("aria-expanded", cur ? "true" : "false");
      if (cur && spotsData[idx]) li.style.setProperty("--pz-accent", spotsData[idx].accent);
    });
  }

 function clearZoodStageDom() {
    var mHost = document.getElementById("pzoodMirrorStage");
    if (mHost && mHost._disposeMirror) mHost._disposeMirror();
    if (stageEl) stageEl.innerHTML = "";
  }

  function closeSpotCard(skipMapReset, restorePillFocus) {
    var prev = activeSpotIdx;
    activeSpotIdx = -1;
    clearZoodStageDom();
    updatePillsActive(-1);
    if (!skipMapReset) syncModernMap(-1, true);
    if (restorePillFocus && prev >= 0 && pillEls[prev] && pillEls[prev].focus) {
      try { pillEls[prev].focus({ preventScroll: true }); } catch (e) { pillEls[prev].focus(); }
    }
  }

 function openSpotCard(idx, shouldScroll) {
    ensureZoodMounted();
    if (isDetActive()) stopDetective(false, true);
    if (isPastEra) setMapEra(false, true);
    var cl = (idx + spotsData.length) % spotsData.length;
    if (cl === activeSpotIdx && shouldScroll && stageEl) {
      var r = stageEl.getBoundingClientRect();
      if (r.height > 0 && r.top < window.innerHeight - 60 && r.bottom > 60) {
        closeSpotCard(false, false);
      } else {
        stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    activeSpotIdx = cl;
    var sp = spotsData[cl];
    var sm = spotMapMeta[cl];
    updatePillsActive(cl);
    syncModernMap(cl, false);

    if (!stageEl) return;
    var msHtml = sp.milestones.map(function(m, mi) {
      var last = mi === sp.milestones.length - 1;
      return (mi > 0 ? '<span class="pzood-ms-arr" aria-hidden="true">\u279C</span>' : '') +
        '<span class="pzood-ms-step' + (last ? ' is-now' : '') + '">' + m + '</span>';
    }).join("");

    var tagsHtml = sp.tags.map(function(t) { return '<span class="pzood-tag">' + t + '</span>'; }).join("");
    var showMapLbl = cl === 0
      ? "\uD83D\uDCCD Δες την Πέτρινη Πύλη στον Χάρτη \u2191"
      : "\uD83D\uDCCD Δες τη διαδρομή (~" + fmtNum(sm.steps) + " βήματα) στον Χάρτη \u2191";

   var extraBtnHtml = "";
    if (sp.hasMirror) {
      extraBtnHtml = '<button type="button" class="pzood-compare-btn" id="pzoodOpenMirrorBtn">\u26EA Σύγκρινε Δίπλα-Δίπλα: Παλιός vs Καινούριος Ναός!</button>';
  } else if (sp.jumpTo1941) {
      extraBtnHtml = '<button type="button" class="pzood-compare-btn" data-zcard-1941="1">\uD83D\uDD70\uFE0F Δες εδώ το Κρυφό Στρατόπεδο του 1941 (ANZAC) \u2191</button>';
    } else if (typeof sp.jumpTo1941Idx === "number") {
      extraBtnHtml = '<button type="button" class="pzood-compare-btn" data-zcard-1941="' + sp.jumpTo1941Idx + '">\uD83D\uDD70\uFE0F Δες την Κρήνη και στην Άνοιξη του 1941 \u2191</button>';
    }
    if (window.peristasiBridge) {
      if (cl === 0 || cl === 7) {
        extraBtnHtml += '<button type="button" class="pzood-compare-btn" data-zbridge="churches-0">\u26EA Δες και τον Ενοριακό Ι.Ν. Αγ. Γεωργίου \u279C</button>';
      } else if (cl === 6) {
        extraBtnHtml += '<button type="button" class="pzood-compare-btn" data-zbridge="anzac-modal">\uD83C\uDF0F Τα 3 Βήματα των Νεοζηλανδών (1941) \u279C</button>';
      }
    }

   var prevFocusId = stageEl.contains(document.activeElement) ? (document.activeElement.id || "pzoodNextBtn") : "";
    var prevMir = document.getElementById("pzoodMirrorStage");
    if (prevMir && prevMir._disposeMirror) prevMir._disposeMirror();

    stageEl.innerHTML =
      '<div class="pzood-card" style="--pz-accent:' + sp.accent + ';--pz-border:' + sp.border + ';--pz-soft:' + sp.soft + '">' +
        '<div class="pzood-card-top">' +
          '<div class="pzood-top-badges">' +
            '<span class="pzood-badge">' + sp.badge + '</span>' +
            '<span class="pzood-era-pill">' + sp.eraTag + '</span>' +
          '</div>' +
          '<button type="button" class="pzood-icon-close" id="pzoodCardCloseBtn" title="Κλείσιμο">\u2715</button>' +
        '</div>' +
        '<div class="pzood-title-row">' +
          '<span class="pzood-big-icon">' + sp.icon + '</span>' +
          '<h4 class="pzood-title">' + sp.title + '</h4>' +
        '</div>' +
        '<div class="pzood-milestones"><span class="pzood-ms-lbl">\u23F3 Στοιχεία &amp; Ιστορία:</span>' + msHtml + '</div>' +
        '<div class="pzood-photo-row">' +
          '<div class="pzood-card-photo-wrap">' +
            '<img class="pzood-card-photo" id="pzoodCardImg" src="' + optImg(sp.img, 640) + '" data-full-src="' + escAttr(sp.img) + '" data-fallback-src="' + escAttr(sp.fallbackImg || "") + '" alt="' + escAttr(sp.imgCap) + '" tabindex="0" role="button"/>' +
            '<div class="pzood-card-photo-cap">\uD83D\uDD0D Πάτησε για μεγέθυνση (έως 3,5\u00D7)</div>' +
          '</div>' +
          '<div class="pzood-story-col">' +
            '<div class="pzood-story">' + sp.story + '</div>' +
            '<div class="pzood-tags">' + tagsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pzood-fact">' + sp.fact + '</div>' +
        '<div class="pzood-card-actions">' +
          '<button type="button" class="pzood-show-map-btn" id="pzoodShowOnMapBtn">' + showMapLbl + '</button>' +
          extraBtnHtml +
        '</div>' +
        '<div id="pzoodMirrorStage" style="display:none"></div>' +
        '<div class="pzood-nav">' +
          '<button type="button" class="pzood-nav-btn" id="pzoodPrevBtn">\u2B05\uFE0F Προηγούμενο</button>' +
          '<span class="pzood-count">' + (cl + 1) + ' από ' + spotsData.length + '</span>' +
          '<button type="button" class="pzood-nav-btn" id="pzoodNextBtn">Επόμενο \u27A1\uFE0F</button>' +
        '</div>' +
      '</div>';

   var cIm = document.getElementById("pzoodCardImg");
    if (cIm) cIm.onerror = handleImgError;

    if (prevFocusId) {
      var nextFEl = document.getElementById(prevFocusId) || document.getElementById("pzoodNextBtn") || document.getElementById("pzoodCardCloseBtn");
      if (nextFEl && nextFEl.focus) { try { nextFEl.focus({ preventScroll: true }); } catch (err) { nextFEl.focus(); } }
    }

    var winFirst = justCompletedAll8;
    justCompletedAll8 = false;
    if (shouldScroll) {
      requestAnimationFrame(function() {
        if (winFirst) {
          var wb = document.getElementById("pzoodExpWinBanner");
          if (wb && wb.classList.contains("is-vis")) { wb.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
        }
        var cr = stageEl.getBoundingClientRect();
        if (cr.bottom > window.innerHeight || cr.top < 0) {
          stageEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }
  }

  /* =========================================================================
     ΚΑΤΑΣΚΕΥΗ DOM & SVG ΧΑΡΤΗ
     ========================================================================= */
  function buildZoodochosMap() {
    mapWrap = document.createElement("div");
    mapWrap.className = "pzood-map-wrap";
    mapWrap.id = "pzoodMapWrap";

    mapWrap.innerHTML =
      '<div class="pzood-map-head">' +
        '<div class="pzood-map-title-group">' +
          '<strong id="pzoodMapMainTitle">\uD83D\uDDFA\uFE0F Χάρτης Παναγίας Ζωοδόχου Πηγής Περίστασης</strong>' +
          '<span class="pzood-exp-wrap" id="pzoodExpWrap">' +
        '<span class="pzood-exp-badge" id="pzoodExpBadge">\uD83D\uDDFA\uFE0F Εξερεύνησες 0/10 σημεία</span>' +
            '<button type="button" class="pzood-exp-reset" id="pzoodExpReset" style="display:none" title="Μηδενισμός εξερεύνησης">\u21BA</button>' +
          '</span>' +
          '<span class="pzood-past-badge" id="pzoodPastBadge">\uD83D\uDCDC Άνοιξη 1941 \u2022 Μονύδριο &amp; Νεοζηλανδοί ANZAC</span>' +
        '</div>' +
        '<div class="pzood-map-head-right">' +
          '<span class="pzood-hint-span" id="pzoodMapHintSpan" style="font-size:12.4px;color:#166534">\uD83D\uDC46 Πάτησε στους 2 ναούς, τη γέφυρα ή την παιδική χαρά!</span>' +
          '<div class="pzood-era-seg" role="group" aria-label="Επιλογή εποχής χάρτη">' +
            '<button type="button" class="pzood-era-seg-btn is-active" id="pzoodEraModernBtn" aria-pressed="true">\uD83D\uDE80 Σήμερα</button>' +
            '<button type="button" class="pzood-era-seg-btn" id="pzoodEraPastBtn" aria-pressed="false">\uD83D\uDD70\uFE0F Άνοιξη 1941</button>' +
          '</div>' +
          '<button type="button" class="pzood-btn pzood-det-btn" id="pzoodDetectiveBtn">\uD83D\uDD75\uFE0F Ντετέκτιβ Παναγίας!</button>' +
         '<button type="button" class="pzood-btn pzood-hist-tour-btn" id="pzoodHistTourBtn">\u25B6\uFE0F Ξενάγηση Άνοιξης 1941!</button>' +
          '<button type="button" class="pzood-btn pzood-tour-btn" id="pzoodModernTourBtn">\uD83C\uDF38 Ξενάγηση Προσκυνήματος!</button>' +
          '<button type="button" class="pzood-btn pzood-village-btn" id="pzoodBackToVillageBtn"' + (window.peristasiBridge ? '' : ' style="display:none"') + '>\u2B05 Χάρτης Γειτονιάς</button>' +
          '<button type="button" class="pzood-btn pzood-street-zoom-pill" id="pzoodStreetZoomBtn">\uD83D\uDDFA\uFE0F Δες Όλο το Άλσος</button>' +
          '<button type="button" class="pzood-btn" id="pzoodMapZoomBtn">\uD83D\uDD0D Μεγέθυνση Χάρτη</button>' +
        '</div>' +
      '</div>' +
 '<div class="pzood-exp-win" id="pzoodExpWinBanner">' +
        '<span>\uD83C\uDFC6 Μπράβο! Εξερεύνησες και τα 10 σημεία της Παναγίας της Περίστασης!</span>' +
        '<button type="button" class="pzood-icon-close" data-zwin-close="1" title="Κλείσιμο">\u2715</button>' +
      '</div>' +
      '<div id="pzoodQuizStage" style="display:none" aria-live="polite"></div>' +
      '<div class="pzood-map-frame">' +
        '<div class="pzood-map-scroll is-mobile-zoom" id="pzoodMapScroll">' +
          '<svg class="pzood-map-svg" id="pzoodMapSvg" viewBox="0 0 940 460" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" role="img" aria-label="Διαδραστικός χάρτης Παναγίας Ζωοδόχου Πηγής Περίστασης">' +
            '<rect class="pzood-svg-bg" width="940" height="460" fill="#ecfdf5"/>' +

           /* Απαλές χλοερές ζώνες άλσους */
            '<ellipse cx="315" cy="96" rx="295" ry="86" fill="#dcfce7" opacity="0.72"/>' +
            '<ellipse cx="475" cy="396" rx="445" ry="62" fill="#dcfce7" opacity="0.78"/>' +

            /* ==================== ΣΤΡΩΜΑ: ΣΗΜΕΡΑ ==================== */
            '<g class="pzood-era-modern">' +
              /* Ασφαλτόδρομοι & Μεγάλο Πλάτωμα (Πάρκινγκ) μπροστά στην Τοξωτή Πύλη */
              '<path d="M 484,220 C 492,220 498,118 526,118 L 672,118 L 672,224 L 484,224 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="3.5" stroke-linejoin="round"/>' +
              '<path d="M 18,220 L 922,220" stroke="#94a3b8" stroke-width="32" stroke-linecap="round"/>' +
              '<path d="M 24,384 Q 230,368 365,332 Q 436,312 442,276 L 442,220" fill="none" stroke="#94a3b8" stroke-width="28" stroke-linecap="round"/>' +
              '<path d="M 18,220 L 922,220" stroke="#cbd5e1" stroke-width="26" stroke-linecap="round"/>' +
              '<path d="M 488,220 C 496,220 502,121 528,121 L 670,121 L 670,222 L 488,222 Z" fill="#cbd5e1"/>' +
              '<path d="M 24,384 Q 230,368 365,332 Q 436,312 442,276 L 442,220" fill="none" stroke="#cbd5e1" stroke-width="22" stroke-linecap="round"/>' +
              /* Διαγραμμίσεις δρόμων & θέσεις στάθμευσης πλατώματος */
              '<path d="M 34,220 L 482,220 M 680,220 L 910,220" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="9,9"/>' +
              '<path d="M 38,382 Q 230,366 362,331 Q 428,312 442,282" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="8,8"/>' +
              '<g stroke="#f8fafc" stroke-width="2" opacity="0.85">' +
                '<line x1="538" y1="122" x2="538" y2="140"/><line x1="564" y1="122" x2="564" y2="140"/><line x1="590" y1="122" x2="590" y2="140"/><line x1="616" y1="122" x2="616" y2="140"/>' +
              '</g>' +
              '<text x="580" y="198" text-anchor="middle" fill="#475569" font-size="11.2" font-weight="800">Πλάτωμα &amp; Πρόσβαση \u267F</text>' +
              '<text class="pzood-road-lbl" x="235" y="224" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="900">ΟΔΟΣ ΖΩΟΔΟΧΟΥ ΠΗΓΗΣ (ΑΠΟ ΠΕΡΙΣΤΑΣΗ)</text>' +
              '<text class="pzood-road-lbl" x="238" y="366" text-anchor="middle" fill="#1e293b" font-size="11.5" font-weight="900" transform="rotate(-9 238 366)">ΔΡΟΜΟΣ ΠΡΟΣ ΚΑΤΕΡΙΝΗ</text>' +
              '<text class="pzood-road-lbl" x="804" y="224" text-anchor="middle" fill="#334155" font-size="11" font-weight="800">Ζωοδόχου Πηγής Τέρμα</text>' +
            '</g>' +

            /* ==================== ΣΤΡΩΜΑ: ΑΝΟΙΞΗ 1941 (ΧΩΜΑΤΟΔΡΟΜΟΙ) ==================== */
            '<g class="pzood-era-past">' +
              '<path d="M 492,220 C 502,220 510,132 540,132 L 672,132 L 672,222 Z" fill="#e6ccb2" stroke="#b08968" stroke-width="3"/>' +
              '<path d="M 18,220 L 922,220" stroke="#b08968" stroke-width="28" stroke-linecap="round"/>' +
              '<path d="M 24,384 Q 230,368 365,332 Q 436,312 442,276 L 442,220" fill="none" stroke="#b08968" stroke-width="24" stroke-linecap="round"/>' +
              '<path d="M 18,220 L 922,220" stroke="#e6ccb2" stroke-width="22" stroke-linecap="round"/>' +
              '<path d="M 24,384 Q 230,368 365,332 Q 436,312 442,276 L 442,220" fill="none" stroke="#e6ccb2" stroke-width="18" stroke-linecap="round"/>' +
              '<path d="M 34,216 L 906,216 M 34,224 L 906,224" stroke="#c69f73" stroke-width="1.4" stroke-dasharray="10,8"/>' +
              '<text class="pzood-past-road-lbl" x="250" y="224" text-anchor="middle" fill="#5c3a1e" font-size="11.5" font-weight="900">ΧΩΜΑΤΟΔΡΟΜΟΣ ΑΠΟ ΠΕΡΙΣΤΑΣΗ (1941)</text>' +
              '<text class="pzood-past-road-lbl" x="238" y="366" text-anchor="middle" fill="#5c3a1e" font-size="11.2" font-weight="900" transform="rotate(-9 238 366)">ΧΩΜΑΤΟΔΡΟΜΟΣ ΚΑΤΕΡΙΝΗΣ</text>' +
            '</g>' +

           /* ==================== ΚΑΝΑΛΙ ΝΕΡΟΥ & ΜΙΚΡΗ ΓΕΦΥΡΑ (ΚΟΙΝΑ) ==================== */
            '<rect x="16" y="246" width="908" height="30" rx="4" fill="#94a3b8"/>' +
            '<rect x="16" y="249" width="908" height="24" fill="#0ea5e9"/>' +
            '<svg x="26" y="249" width="886" height="24" viewBox="0 0 886 24" overflow="hidden" pointer-events="none">' +
              '<path class="pzood-water-shimmer" d="M -72,8 L 922,8 M -56,17 L 922,17" stroke="#bae6fd" stroke-width="2.2" stroke-dasharray="16,20" stroke-linecap="round"/>' +
            '</svg>' +
            '<text class="pzood-water-lbl" x="242" y="265" text-anchor="middle" fill="#ffffff" font-size="11.2" font-weight="900">\uD83D\uDCA7 ΚΑΝΑΛΙ ΝΕΡΟΥ</text>' +
        '<text class="pzood-water-lbl" x="716" y="265" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="800">\uD83D\uDCA7 Κανάλι Νερού</text>' +

            /* Η Μικρή Γέφυρα πάνω από το κανάλι στη διασταύρωση (x=442, y=261) */
            '<g pointer-events="none">' +
              '<rect x="424" y="243" width="36" height="36" rx="3" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>' +
              '<rect x="421" y="243" width="5" height="36" rx="2" fill="#f59e0b" stroke="#92400e" stroke-width="1.4"/>' +
              '<rect x="458" y="243" width="5" height="36" rx="2" fill="#f59e0b" stroke="#92400e" stroke-width="1.4"/>' +
              '<line x1="442" y1="246" x2="442" y2="276" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="4,4"/>' +
            '</g>' +

         /* Μονοπάτι στο γρασίδι από τη Μικρή Γέφυρα προς Κρήνη & Παιδική Χαρά */
            '<path d="M 342,284 L 442,284 L 646,284 L 646,298" fill="none" stroke="#86efac" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M 342,284 L 442,284 L 646,284 L 646,298" fill="none" stroke="#15803d" stroke-width="2.1" stroke-dasharray="5,6" stroke-linecap="round"/>' +
           /* ==================== ΑΙΩΝΟΒΙΑ ΠΛΑΤΑΝΙΑ ΓΥΡΩ ΑΠΟ ΤΟ ΠΡΟΣΚΥΝΗΜΑ ==================== */
            '<g pointer-events="none">' +
              /* Πλατάνια Βόρεια (Πάνω — μαζί με +5 νέα διάσπαρτα σε διάφορα βάθη) */
              '<g fill="#78350f">' +
                '<rect x="39" y="120" width="6" height="16" rx="2"/><rect x="125" y="67" width="7" height="17" rx="2"/>' +
                '<rect x="221" y="62" width="7" height="16" rx="2"/><rect x="389" y="66" width="7" height="17" rx="2"/>' +
                '<rect x="609" y="59" width="7" height="16" rx="2"/>' +
                '<rect x="86" y="132" width="7" height="18" rx="2"/><rect x="164" y="124" width="8" height="20" rx="2"/>' +
                '<rect x="252" y="138" width="8" height="18" rx="2"/><rect x="344" y="128" width="7" height="19" rx="2"/>' +
                '<rect x="428" y="132" width="7" height="18" rx="2"/><rect x="526" y="76" width="7" height="18" rx="2"/>' +
              '</g>' +
              '<g fill="#16a34a" stroke="#14532d" stroke-width="1.5">' +
                '<circle cx="128" cy="54" r="20"/><circle cx="115" cy="60" r="13"/><circle cx="141" cy="60" r="13"/>' +
                '<circle cx="224" cy="48" r="21"/><circle cx="210" cy="54" r="14"/><circle cx="238" cy="54" r="14"/>' +
                '<circle cx="392" cy="52" r="20"/><circle cx="379" cy="58" r="13"/><circle cx="405" cy="58" r="13"/>' +
                '<circle cx="612" cy="46" r="19"/><circle cx="599" cy="52" r="13"/><circle cx="625" cy="52" r="13"/>' +
              '</g>' +
              '<g fill="#22c55e" stroke="#15803d" stroke-width="1.6">' +
                '<circle cx="42" cy="108" r="17"/><circle cx="31" cy="113" r="12"/><circle cx="53" cy="113" r="12"/>' +
                '<circle cx="89" cy="118" r="22"/><circle cx="76" cy="124" r="15"/><circle cx="103" cy="124" r="15"/>' +
                '<circle cx="168" cy="108" r="24"/><circle cx="152" cy="115" r="16"/><circle cx="184" cy="115" r="16"/>' +
                '<circle cx="256" cy="122" r="25"/><circle cx="239" cy="128" r="17"/><circle cx="273" cy="128" r="17"/>' +
                '<circle cx="348" cy="114" r="22"/><circle cx="334" cy="120" r="15"/><circle cx="362" cy="120" r="15"/>' +
                '<circle cx="432" cy="118" r="21"/><circle cx="419" cy="124" r="14"/><circle cx="445" cy="124" r="14"/>' +
                '<circle cx="529" cy="62" r="20"/><circle cx="516" cy="68" r="14"/><circle cx="542" cy="68" r="14"/>' +
              '</g>' +
              /* Πλατάνια πίσω/δεξιά από την εκκλησία */
              '<g fill="#16a34a" stroke="#14532d" stroke-width="1.5">' +
                '<circle cx="776" cy="22" r="16"/><circle cx="826" cy="20" r="18"/><circle cx="880" cy="22" r="15"/>' +
                '<circle cx="926" cy="78" r="14"/><circle cx="928" cy="134" r="15"/>' +
              '</g>' +
           /* Δέντρα ανάμεσα στο κανάλι και τον δρόμο Κατερίνης + Πετρόχτιστη Κρήνη Ολύμπου */
              '<g fill="#78350f">' +
                '<rect x="33" y="333" width="6" height="15" rx="2"/><rect x="82" y="322" width="6" height="15"/>' +
                '<rect x="174" y="316" width="6" height="15"/><rect x="225" y="311" width="6" height="14"/>' +
                '<rect x="387" y="301" width="6" height="13" rx="2"/>' +
              '</g>' +
              '<g fill="#4ade80" stroke="#16a34a" stroke-width="1.5">' +
                '<circle cx="36" cy="322" r="16"/><circle cx="26" cy="326" r="11"/><circle cx="46" cy="326" r="11"/>' +
                '<circle cx="85" cy="310" r="17"/><circle cx="177" cy="304" r="16"/><circle cx="228" cy="300" r="15"/>' +
                '<circle cx="390" cy="291" r="13"/><circle cx="381" cy="295" r="8.5"/><circle cx="399" cy="295" r="8.5"/>' +
              '</g>' +
              /* ΠΑΡΑΔΟΣΙΑΚΗ ΠΕΤΡΙΝΗ ΚΡΗΝΗ ΜΕ ΤΡΕΧΟΥΜΕΝΟ ΝΕΡΟ ΟΛΥΜΠΟΥ (ΣΗΜΕΡΑ & 1941) */
              '<g>' +
                '<rect x="312" y="287" width="28" height="23" rx="2" fill="#e7e5e4" stroke="#78350f" stroke-width="1.7"/>' +
                '<path d="M 309,288 Q 326,279 343,288 Z" fill="#b45309" stroke="#7c2d12" stroke-width="1.3"/>' +
                '<path d="M 318,310 V 295 A 8,6.5 0 0,1 334,295 V 310 Z" fill="#d6d3d1" stroke="#a8a29e" stroke-width="1.1"/>' +
                '<path d="M 315,294 h 5 M 332,294 h 5" stroke="#a8a29e" stroke-width="1.2" stroke-linecap="round"/>' +
                '<rect x="324" y="295" width="4" height="3" rx="1" fill="#475569"/>' +
                '<rect x="308" y="309" width="36" height="8" rx="2.5" fill="#d6d3d1" stroke="#57534e" stroke-width="1.5"/>' +
                '<ellipse cx="326" cy="312.5" rx="13.5" ry="2.2" fill="#0ea5e9"/>' +
                '<g class="pzood-krini-splash">' +
                  '<path d="M 326,298 V 312.5" stroke="#38bdf8" stroke-width="3.4" stroke-linecap="round"/>' +
                  '<ellipse cx="326" cy="312.5" rx="7" ry="1.8" fill="#bae6fd"/>' +
                  '<ellipse cx="326" cy="312.5" rx="3.5" ry="1" fill="#ffffff"/>' +
                '</g>' +
                '<svg x="322" y="298" width="8" height="15" viewBox="0 0 8 15" overflow="hidden" pointer-events="none">' +
                  '<g transform="translate(4,0) rotate(90)">' +
                    '<path class="pzood-pump-flow" d="M -12,0 L 18,0" stroke="#ffffff" stroke-width="2" stroke-dasharray="3.5,6.5" stroke-linecap="round"/>' +
                  '</g>' +
                '</svg>' +
              '</g>' +
              /* Δέντρα Νότια (Κάτω πλευρά & γύρω από την Παιδική Χαρά — μαζί με +3 νέα διάσπαρτα) */
              '<g fill="#78350f">' +
                '<rect x="118" y="432" width="6" height="16"/><rect x="216" y="426" width="6" height="16"/>' +
                '<rect x="318" y="418" width="6" height="16"/><rect x="418" y="412" width="6" height="16"/>' +
                '<rect x="465" y="363" width="7" height="16" rx="2"/><rect x="518" y="356" width="7" height="16"/>' +
                '<rect x="536" y="426" width="6" height="16"/><rect x="571" y="390" width="6" height="15" rx="2"/>' +
                '<rect x="638" y="434" width="6" height="15"/><rect x="744" y="434" width="6" height="15"/>' +
               '<rect x="805" y="425" width="7" height="16" rx="2"/><rect x="883" y="356" width="7" height="17"/>' +
                '<rect x="866" y="418" width="6" height="16"/>' +
              '</g>' +
              '<g fill="#16a34a" stroke="#14532d" stroke-width="1.5">' +
                '<circle cx="468" cy="350" r="19"/><circle cx="456" cy="355" r="13"/><circle cx="480" cy="355" r="13"/>' +
                '<circle cx="574" cy="378" r="16"/><circle cx="564" cy="383" r="11"/><circle cx="584" cy="383" r="11"/>' +
                '<circle cx="808" cy="412" r="18"/><circle cx="796" cy="417" r="12"/><circle cx="820" cy="417" r="12"/>' +
              '</g>' +
              '<g fill="#22c55e" stroke="#15803d" stroke-width="1.5">' +
                '<circle cx="121" cy="419" r="18"/><circle cx="219" cy="413" r="19"/>' +
                '<circle cx="321" cy="405" r="18"/><circle cx="421" cy="399" r="19"/>' +
                '<circle cx="521" cy="342" r="20"/><circle cx="539" cy="413" r="17"/>' +
                '<circle cx="641" cy="422" r="16"/><circle cx="747" cy="422" r="16"/>' +
                '<circle cx="886" cy="342" r="21"/><circle cx="869" cy="405" r="18"/>' +
              '</g>' +
            '</g>' +

            /* Πυξίδα Βορρά */
            '<circle cx="38" cy="34" r="18" fill="#ffffff" stroke="#86efac" stroke-width="2"/>' +
            '<text x="38" y="39" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="900">Β\u2191</text>' +

            /* ==================== ΠΕΤΡΟΚΤΙΣΤΟΣ ΠΕΡΙΒΟΛΟΣ, ΠΥΛΗ & ΔΥΟ ΝΑΟΙ ==================== */
            '<g pointer-events="none">' +
              /* Πετρόκτιστος Μαντρότοιχος */
              '<rect x="672" y="30" width="242" height="168" rx="16" fill="#fffbeb" stroke="#d97706" stroke-width="4"/>' +
              '<rect x="676" y="34" width="234" height="160" rx="13" fill="#fef9c3" stroke="#fcd34d" stroke-width="1.4" stroke-dasharray="6,4"/>' +

              /* Διαδρομή Ομαλής Πρόσβασης ΑμεΑ / Καροτσιού στον Επίπεδο Αυλόγυρο */
              '<g class="pzood-era-modern">' +
                '<path class="pzood-amea-path" d="M 608,160 L 672,156 L 758,154 M 696,155 Q 726,150 766,84" fill="none" stroke="#0284c7" stroke-width="2.3" stroke-dasharray="4,4" stroke-linecap="round"/>' +
                '<g class="pzood-amea-badge" transform="translate(716,181)">' +
                  '<rect x="-27" y="-8" width="54" height="16" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.3"/>' +
                  '<text y="3.5" text-anchor="middle" fill="#0369a1" font-size="9" font-weight="900">\u267F Επίπεδο</text>' +
                '</g>' +
              '</g>' +

              /* Πέτρινη Τοξωτή Πύλη Εισόδου */
              '<rect x="665" y="138" width="14" height="36" rx="3" fill="#fde68a" stroke="#b45309" stroke-width="2"/>' +
              '<path d="M 663,140 Q 672,126 681,140" fill="#ea580c" stroke="#9a3412" stroke-width="1.8"/>' +
              '<line x1="672" y1="122" x2="672" y2="131" stroke="#92400e" stroke-width="2"/>' +
              '<line x1="668.5" y1="125.5" x2="675.5" y2="125.5" stroke="#92400e" stroke-width="2"/>' +

             /* Κεραμοσκεπές Αρχονταρίκι με Βεράντα & Κεντρικός Πλάτανος με Κυκλικό Παγκάκι (Σήμερα) */
              '<g class="pzood-era-modern">' +
                '<rect x="686" y="44" width="60" height="24" rx="3" fill="#ffffff" stroke="#b45309" stroke-width="1.5"/>' +
                '<polygon points="683,44 716,35 749,44" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>' +
                '<line x1="690" y1="68" x2="742" y2="68" stroke="#d97706" stroke-width="3"/>' +
                '<circle cx="722" cy="122" r="18" fill="#fde68a" stroke="#b45309" stroke-width="2"/>' +
                '<circle cx="722" cy="122" r="13" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>' +
                '<circle cx="722" cy="122" r="4" fill="#78350f"/>' +
              '</g>' +

              /* 5 Σκόρπια Δέντρα στην Αυλή του Παλιού Μονυδρίου (Άνοιξη 1941) */
              '<g class="pzood-era-past">' +
                '<g fill="#78350f">' +
                  '<rect x="701" y="69" width="6" height="14" rx="1.5"/>' +
                  '<rect x="733" y="114" width="7" height="15" rx="1.5"/>' +
                  '<rect x="699" y="168" width="6" height="13" rx="1.5"/>' +
                  '<rect x="789" y="152" width="6" height="14" rx="1.5"/>' +
                  '<rect x="869" y="159" width="6" height="14" rx="1.5"/>' +
                '</g>' +
                '<g fill="#16a34a" stroke="#14532d" stroke-width="1.4">' +
                  '<circle cx="704" cy="59" r="14"/><circle cx="695" cy="63" r="9.5"/><circle cx="713" cy="63" r="9.5"/>' +
                  '<circle cx="792" cy="142" r="14"/><circle cx="783" cy="146" r="9.5"/><circle cx="801" cy="146" r="9.5"/>' +
                '</g>' +
                '<g fill="#22c55e" stroke="#15803d" stroke-width="1.4">' +
                  '<circle cx="736.5" cy="103" r="16"/><circle cx="726" cy="108" r="11"/><circle cx="747" cy="108" r="11"/>' +
                  '<circle cx="702" cy="159" r="13"/><circle cx="693.5" cy="163" r="9"/><circle cx="710.5" cy="163" r="9"/>' +
                  '<circle cx="872" cy="149" r="14.5"/><circle cx="862.5" cy="153" r="10"/><circle cx="881.5" cy="153" r="10"/>' +
                '</g>' +
              '</g>' +

              /* 1. Ο ΠΑΛΙΟΣ ΠΕΤΡΙΝΟΣ ΝΑΟΣ (Πάνω / Βόρεια πλευρά — με ζωντανή φλόγα στα πέτρινα μανουάλια) */
              '<g>' +
                '<rect x="768" y="54" width="20" height="54" rx="2" fill="#fef3c7" stroke="#92400e" stroke-width="1.6"/>' +
                '<line x1="772" y1="58" x2="772" y2="104" stroke="#78350f" stroke-width="2.4"/>' +
                '<line x1="772" y1="73" x2="778" y2="73" stroke="#78350f" stroke-width="2"/>' +
                '<line x1="772" y1="90" x2="778" y2="90" stroke="#78350f" stroke-width="2"/>' +
                '<rect x="786" y="50" width="108" height="62" rx="3" fill="#e7e5e4" stroke="#78350f" stroke-width="2"/>' +
                '<path d="M 794,62 h 14 M 820,58 h 16 M 856,64 h 16 M 802,98 h 16 M 862,96 h 14" stroke="#a8a29e" stroke-width="1.6" stroke-linecap="round"/>' +
                '<polygon points="765,52 802,38 878,38 898,52" fill="#b45309" stroke="#7c2d12" stroke-width="1.5"/>' +
                '<rect x="784" y="75" width="7" height="14" rx="3" fill="#78350f"/>' +
                '<rect x="780" y="65" width="5" height="7" rx="1" fill="#d97706"/>' +
                '<rect x="780" y="92" width="5" height="7" rx="1" fill="#d97706"/>' +
                '<circle cx="775" cy="69" r="2.4" fill="#78716c"/><circle cx="775" cy="67.5" r="1.5" fill="#facc15"/>' +
                '<circle cx="775" cy="97" r="2.4" fill="#78716c"/><circle cx="775" cy="95.5" r="1.5" fill="#facc15"/>' +
                '<g class="pzood-candle-glow">' +
                  '<circle cx="775" cy="66.5" r="8.5" fill="#fde047" opacity="0.48"/>' +
                  '<circle cx="775" cy="94.5" r="8.5" fill="#fde047" opacity="0.48"/>' +
                  '<path class="pzood-candle-flame" d="M 775,60.5 C 772.4,64.8 773,68.2 775,68.2 C 777,68.2 777.6,64.8 775,60.5 Z" fill="#f97316"/>' +
                  '<circle class="pzood-candle-flame" cx="775" cy="66.2" r="1.4" fill="#fef08a"/>' +
                  '<path class="pzood-candle-flame" d="M 775,88.5 C 772.4,92.8 773,96.2 775,96.2 C 777,96.2 777.6,92.8 775,88.5 Z" fill="#f97316"/>' +
                  '<circle class="pzood-candle-flame" cx="775" cy="94.2" r="1.4" fill="#fef08a"/>' +
                '</g>' +
                '<line x1="840" y1="31" x2="840" y2="40" stroke="#78350f" stroke-width="2"/>' +
                '<line x1="836.5" y1="34.5" x2="843.5" y2="34.5" stroke="#78350f" stroke-width="2"/>' +
              '</g>' +

              /* 2. Ο ΚΑΙΝΟΥΡΙΟΣ ΝΑΟΣ (Κάτω / Νότια πλευρά — με κινούμενη καμπάνα στο καμπαναριό) */
              '<g class="pzood-era-modern">' +
                '<rect x="760" y="116" width="22" height="68" rx="3" fill="#fff1f2" stroke="#9f1239" stroke-width="1.6"/>' +
                '<path d="M 762,124 Q 770,118 778,124 M 762,148 Q 770,142 778,148 M 762,172 Q 770,166 778,172" fill="none" stroke="#be123c" stroke-width="2"/>' +
                '<g fill="#9f1239"><circle cx="764" cy="128" r="2.3"/><circle cx="764" cy="144" r="2.3"/><circle cx="764" cy="160" r="2.3"/><circle cx="764" cy="176" r="2.3"/></g>' +
                '<rect x="780" y="112" width="122" height="76" rx="4" fill="#ffffff" stroke="#4f46e5" stroke-width="2.2"/>' +
                '<polygon points="776,114 841,103 906,114" fill="#dc2626" stroke="#991b1b" stroke-width="1.3"/>' +
                /* Ενσωματωμένο Καμπαναριό με καμπάνα & ηχητικά κύματα */
                '<rect x="772" y="101" width="16" height="19" rx="2" fill="#ffffff" stroke="#4f46e5" stroke-width="1.6"/>' +
                '<rect x="775.5" y="105" width="9" height="11" rx="4.5" fill="#1e1b4b"/>' +
                '<polygon points="770,101 780,92 790,101" fill="#dc2626"/>' +
                '<line x1="780" y1="86.5" x2="780" y2="92.5" stroke="#4f46e5" stroke-width="1.6"/>' +
                '<line x1="777.5" y1="89" x2="782.5" y2="89" stroke="#4f46e5" stroke-width="1.6"/>' +
                '<g class="pzood-bell-unit">' +
                  '<path d="M 780,106 C 777.2,106 776.6,110 775.8,113.2 L 784.2,113.2 C 783.4,110 782.8,106 780,106 Z" fill="#fbbf24" stroke="#b45309" stroke-width="0.8"/>' +
                  '<circle cx="780" cy="114.4" r="1.3" fill="#fde047"/>' +
                '</g>' +
                '<g class="pzood-bell-waves" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round">' +
                  '<path d="M 768,105 Q 764,110 768,115 M 792,105 Q 796,110 792,115"/>' +
                '</g>' +
                '<rect x="782" y="141" width="8" height="18" rx="4" fill="#92400e"/>' +
                '<circle cx="793" cy="150" r="4" fill="#fde68a" stroke="#d97706" stroke-width="1"/>' +
                /* Οκταγωνικός Πλινθόκτιστος Τρούλος */
                '<polygon points="824,138 836,128 854,128 866,138 866,156 854,166 836,166 824,156" fill="#ea580c" stroke="#9a3412" stroke-width="1.8"/>' +
                '<circle cx="845" cy="147" r="12" fill="#dc2626" stroke="#fed7aa" stroke-width="1.5"/>' +
                '<g fill="#fef08a"><rect x="843" y="137" width="4" height="5" rx="2"/><rect x="843" y="152" width="4" height="5" rx="2"/><rect x="835" y="145" width="5" height="4" rx="2"/><rect x="850" y="145" width="5" height="4" rx="2"/></g>' +
                '<line x1="845" y1="141" x2="845" y2="153" stroke="#ffffff" stroke-width="2"/>' +
                '<line x1="839" y1="147" x2="851" y2="147" stroke="#ffffff" stroke-width="2"/>' +
              '</g>' +

              /* ΓΙΟΡΤΙΝΟ ΣΚΗΝΙΚΟ ΠΑΝΗΓΥΡΗΣ ΔΙΑΚΑΙΝΗΣΙΜΟΥ & ΜΥΣΤΗΡΙΩΝ (Σημείο 8) */
              '<g class="pzood-era-modern">' +
                '<g class="pzood-fx-panigiri">' +
                  /* Γιρλάντες με πολύχρωμα σημαιάκια σε πλάτωμα & αυλόγυρο */
                  '<g class="pzood-bunting">' +
                    '<path d="M 504,124 Q 584,138 666,128" fill="none" stroke="#b45309" stroke-width="1.3"/>' +
                    '<polygon points="522,127 527,136 532,128" fill="#2563eb"/>' +
                    '<polygon points="546,130 551,139 556,131" fill="#ec4899"/>' +
                    '<polygon points="570,132 575,141 580,132" fill="#f59e0b"/>' +
                    '<polygon points="594,132 599,141 604,132" fill="#10b981"/>' +
                    '<polygon points="618,131 623,140 628,130" fill="#ef4444"/>' +
                    '<polygon points="642,130 647,138 652,129" fill="#8b5cf6"/>' +
                    '<path d="M 678,134 Q 722,102 768,62 M 678,138 Q 720,138 760,124" fill="none" stroke="#b45309" stroke-width="1.3"/>' +
                    '<polygon points="698,121 703,129 707,116" fill="#ec4899"/>' +
                    '<polygon points="724,101 729,109 733,95" fill="#2563eb"/>' +
                    '<polygon points="748,80 753,88 757,74" fill="#f59e0b"/>' +
                    '<polygon points="704,137 709,145 714,136" fill="#10b981"/>' +
                    '<polygon points="734,133 739,141 744,131" fill="#ef4444"/>' +
                  '</g>' +
                  /* Ανθοστολισμός Εισόδου (Γάμοι, Βαπτίσεις & Πανήγυρη) */
                  '<circle cx="659" cy="140" r="5.5" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>' +
                  '<circle cx="657" cy="138" r="2.2" fill="#f472b6"/><circle cx="661" cy="141" r="2" fill="#ffffff"/>' +
                  '<circle cx="659" cy="172" r="5.5" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>' +
                  '<circle cx="657" cy="170" r="2.2" fill="#f472b6"/><circle cx="661" cy="173" r="2" fill="#ffffff"/>' +
                  /* Τραπέζι Αρτοκλασίας (5 Άρτοι) στο Πλάτωμα */
                  '<g transform="translate(580,144)">' +
                    '<rect x="-15" y="-4" width="30" height="11" rx="2.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3"/>' +
                    '<line x1="-11" y1="7" x2="-11" y2="12" stroke="#78350f" stroke-width="2"/>' +
                    '<line x1="11" y1="7" x2="11" y2="12" stroke="#78350f" stroke-width="2"/>' +
                    '<ellipse cx="0" cy="-4.5" rx="11" ry="3.2" fill="#fde047" stroke="#b45309" stroke-width="1"/>' +
                    '<circle cx="-5.5" cy="-6" r="2.6" fill="#d97706"/><circle cx="0" cy="-6.8" r="2.8" fill="#b45309"/><circle cx="5.5" cy="-6" r="2.6" fill="#d97706"/>' +
                    '<circle cx="-2.8" cy="-8.8" r="2.4" fill="#ea580c"/><circle cx="2.8" cy="-8.8" r="2.4" fill="#ea580c"/>' +
                  '</g>' +
                '</g>' +
              '</g>' +

              /* ΠΑΙΔΙΚΗ ΧΑΡΑ (Κάτω από την εκκλησία, νότια του καναλιού — Κόκκινο πλαίσιο όπως στο σχέδιο) */
              '<g class="pzood-era-modern">' +
                '<rect x="602" y="298" width="180" height="114" rx="14" fill="#fff1f2" stroke="#ef4444" stroke-width="3"/>' +
                '<rect x="610" y="306" width="164" height="98" rx="10" fill="#dcfce7" stroke="#fda4af" stroke-width="1.4" stroke-dasharray="5,4"/>' +
                /* Τσουλήθρα */
                '<path d="M 624,344 L 628,320 h 7 M 623,336 h 6 M 625,328 h 6" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round"/>' +
                '<path d="M 634,320 C 642,320 644,341 654,343" fill="none" stroke="#ef4444" stroke-width="4.2" stroke-linecap="round"/>' +
                /* Κούνιες */
                '<path d="M 726,344 L 734,316 L 758,316 L 766,344" fill="none" stroke="#0284c7" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<line x1="741" y1="316" x2="741" y2="336" stroke="#475569" stroke-width="1.5"/>' +
                '<line x1="751" y1="316" x2="751" y2="336" stroke="#475569" stroke-width="1.5"/>' +
                '<rect x="737" y="336" width="8" height="3.5" rx="1.5" fill="#f59e0b"/>' +
                '<rect x="747" y="336" width="8" height="3.5" rx="1.5" fill="#f59e0b"/>' +
                /* Τραμπάλα */
                '<polygon points="652,392 646,383 658,383" fill="#7c3aed"/>' +
                '<line x1="634" y1="386" x2="670" y2="379" stroke="#eab308" stroke-width="3.4" stroke-linecap="round"/>' +
               '<text class="pzood-map-lbl" x="692" y="401" text-anchor="middle" fill="#be123c" font-size="11.8" font-weight="900">ΠΑΙΔΙΚΗ ΧΑΡΑ</text>' +
              '</g>' +

              /* ΜΙΚΡΟ ΚΤΙΡΙΟ ΠΟΜΟΝΑΣ (200μ ΒΑΘΟΣ) & ΣΩΛΗΝΑ ΠΟΥ ΡΙΧΝΕΙ ΝΕΡΟ ΣΤΟ ΚΑΝΑΛΙ */
              '<g class="pzood-era-modern">' +
                '<path d="M 646,284 L 790,284" fill="none" stroke="#86efac" stroke-width="9" stroke-linecap="round"/>' +
                '<path d="M 646,284 L 790,284" fill="none" stroke="#15803d" stroke-width="2" stroke-dasharray="5,6" stroke-linecap="round"/>' +
                '<rect x="789" y="309" width="38" height="4" rx="1.5" fill="#94a3b8"/>' +
                '<rect x="792" y="286" width="32" height="24" rx="2.5" fill="#f8fafc" stroke="#0369a1" stroke-width="1.8"/>' +
                '<polygon points="789,286 808,278 827,286" fill="#ea580c" stroke="#9a3412" stroke-width="1.4"/>' +
                '<rect x="796" y="294" width="8" height="15" rx="1" fill="#cbd5e1" stroke="#475569" stroke-width="1.2"/>' +
                '<rect x="808" y="292" width="12" height="9" rx="1.2" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.1"/>' +
                '<path d="M 810,295 h 8 M 810,298 h 8" stroke="#0369a1" stroke-width="1"/>' +
                '<path d="M 814,282 V 259 Q 814,255 809,255 L 801,255" fill="none" stroke="#475569" stroke-width="4.6" stroke-linecap="butt"/>' +
                '<path d="M 814,281 V 259 Q 814,255 809,255 L 802,255" fill="none" stroke="#cbd5e1" stroke-width="1.7" stroke-linecap="butt"/>' +
                '<rect x="799.5" y="252.2" width="3" height="5.6" rx="1" fill="#334155"/>' +
                '<g class="pzood-pump-splash">' +
                  '<ellipse cx="785" cy="267" rx="8" ry="3" fill="#bae6fd"/>' +
                  '<ellipse cx="785" cy="267" rx="4.4" ry="1.6" fill="#ffffff"/>' +
                  '<path d="M 800,255 L 785,267" fill="none" stroke="#38bdf8" stroke-width="4.2" stroke-linecap="round"/>' +
                '</g>' +
                '<svg x="784" y="254" width="16" height="14" viewBox="0 0 16 14" overflow="hidden" pointer-events="none">' +
                  '<g transform="translate(16,1) rotate(141.34)">' +
                    '<path class="pzood-pump-flow" d="M -10,0 L 20,0" stroke="#ffffff" stroke-width="2.1" stroke-dasharray="4,6" stroke-linecap="round"/>' +
                  '</g>' +
                '</svg>' +
              '</g>' +

              /* ΣΚΗΝΕΣ ΝΕΟΖΗΛΑΝΔΩΝ ΣΥΜΜΑΧΩΝ ANZAC (Άνοιξη 1941) */
              '<g class="pzood-era-past">' +
                /* Σκηνές στο βόρειο άλσος πλατανιών */
                '<polygon points="196,158 216,130 236,158" fill="#65a30d" stroke="#365314" stroke-width="2"/>' +
                '<polygon points="216,130 222,158 210,158" fill="#3f6212"/>' +
                '<polygon points="296,156 316,128 336,156" fill="#65a30d" stroke="#365314" stroke-width="2"/>' +
                '<polygon points="316,128 322,156 310,156" fill="#3f6212"/>' +
                /* Σκηνές στη νότια όχθη (εκεί όπου σήμερα είναι η Παιδική Χαρά) */
                '<rect x="606" y="302" width="172" height="104" rx="16" fill="#ecfccb" stroke="#84cc16" stroke-width="2" stroke-dasharray="6,4"/>' +
                '<polygon points="630,366 650,338 670,366" fill="#65a30d" stroke="#365314" stroke-width="2"/>' +
                '<polygon points="714,366 734,338 754,366" fill="#65a30d" stroke="#365314" stroke-width="2"/>' +
              '</g>' +
            '</g>' +

          /* Γραμμή Βημάτων & Παλμός Επιλογής */
            '<path id="pzoodMapWalkBg" d="" fill="none" stroke="#f59e0b" stroke-opacity="0.38" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10,7" style="pointer-events:none"/>' +
            '<path id="pzoodMapWalkLine" d="" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10,7" style="pointer-events:none"/>' +
            '<circle id="pzoodMapPulse" class="pzood-pulse-ring" cx="636" cy="156" r="27" fill="none" stroke="#0284c7" stroke-width="4" style="display:none"/>' +

        '<g class="pzood-exit-sign" data-zexit="peristasi" role="button" tabindex="0" aria-label="Δρόμος προς Περίσταση 1,2 χιλιόμετρα">' +
              '<rect class="pzood-exit-hit" x="10" y="164" width="166" height="48" rx="14" fill="transparent"/>' +
              '<rect x="16" y="176" width="154" height="25" rx="12.5" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>' +
              '<text x="93" y="193" text-anchor="middle" fill="#15803d" font-size="11.2" font-weight="900">\u2B05 Προς Περίσταση (1,2 χλμ)</text>' +
            '</g>' +
            '<g class="pzood-exit-sign" data-zexit="katerini" role="button" tabindex="0" aria-label="Δρόμος προς Κατερίνη 3 χιλιόμετρα">' +
              '<rect class="pzood-exit-hit" x="10" y="392" width="164" height="48" rx="14" fill="transparent"/>' +
              '<rect x="16" y="404" width="152" height="25" rx="12.5" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>' +
              '<text x="92" y="421" text-anchor="middle" fill="#b45309" font-size="11.2" font-weight="900">\u2B05 Προς Κατερίνη (3 χλμ)</text>' +
            '</g>' +
           '<g class="pzood-exit-sign" data-zexit="kampos" role="button" tabindex="0" aria-label="Ανατολικά προς Κάμπο και Παράλια">' +
              '<rect class="pzood-exit-hit" x="833" y="272" width="104" height="44" rx="12" fill="transparent"/>' +
              '<rect x="836" y="282" width="98" height="24" rx="12" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.8"/>' +
              '<text x="885" y="298" text-anchor="middle" fill="#0369a1" font-size="10.2" font-weight="900">Κάμπος / Ακτή \u27A1</text>' +
            '</g>' +

            /* ==================== ΔΙΑΔΡΑΣΤΙΚΟΙ ΚΟΜΒΟΙ: ΣΗΜΕΡΑ (0..7) ==================== */
            '<g class="pzood-era-modern">' +
              '<g class="pzood-map-node" data-zmap-spot="6" role="button" tabindex="0" aria-label="Άλσος Αιωνόβιων Πλατανιών">' +
                '<rect x="188" y="76" width="136" height="84" rx="14" fill="transparent"/>' +
                '<circle cx="256" cy="118" r="21" fill="#059669" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="256" y="125" text-anchor="middle" font-size="18">\uD83C\uDF33</text>' +
                '<text class="pzood-map-lbl" x="256" y="156" text-anchor="middle" fill="#064e3b" font-size="12" font-weight="900">Άλσος Πλατανιών</text>' +
              '</g>' +
              '<g class="pzood-map-node" data-zmap-spot="7" role="button" tabindex="0" aria-label="Πανήγυρη Διακαινησίμου και Μυστήρια">' +
                '<rect x="478" y="114" width="92" height="72" rx="12" fill="transparent"/>' +
                '<circle cx="524" cy="148" r="19" fill="#db2777" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="524" y="155" text-anchor="middle" font-size="16.5">\uD83C\uDF38</text>' +
                '<text class="pzood-map-lbl" x="524" y="182" text-anchor="middle" fill="#831843" font-size="11.2" font-weight="900">Πανήγυρη</text>' +
              '</g>' +
              '<g class="pzood-map-node" data-zmap-spot="0" role="button" tabindex="0" aria-label="Πέτρινη Τοξωτή Πύλη και Πλάτωμα">' +
                '<rect x="590" y="120" width="82" height="76" rx="12" fill="transparent"/>' +
                '<circle cx="636" cy="156" r="22" fill="#0284c7" stroke="#fde047" stroke-width="3.5"/>' +
                '<text x="636" y="163" text-anchor="middle" font-size="18">\u26E9\uFE0F</text>' +
                '<text class="pzood-map-lbl" x="636" y="114" text-anchor="middle" fill="#0c4a6e" font-size="11.5" font-weight="900">\u2B50 Πέτρινη Πύλη</text>' +
              '</g>' +
              '<g class="pzood-map-node" data-zmap-spot="3" role="button" tabindex="0" aria-label="Αρχονταρίκι και Κεντρικός Πλάτανος">' +
                '<rect x="680" y="42" width="78" height="96" rx="12" fill="transparent"/>' +
                '<circle cx="718" cy="92" r="19" fill="#15803d" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="718" y="99" text-anchor="middle" font-size="16.5">\uD83C\uDFE1</text>' +
                '<text class="pzood-map-lbl" x="718" y="156" text-anchor="middle" fill="#14532d" font-size="10.8" font-weight="900">Αρχονταρίκι</text>' +
              '</g>' +
              '<g class="pzood-map-node" data-zmap-spot="1" role="button" tabindex="0" aria-label="Παλιός Πέτρινος Ναός - Βόρεια Πλευρά">' +
                '<rect x="768" y="38" width="136" height="72" rx="12" fill="transparent"/>' +
                '<circle cx="842" cy="76" r="20" fill="#b45309" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="842" y="83" text-anchor="middle" font-size="17">\uD83C\uDFDB\uFE0F</text>' +
                '<text class="pzood-map-lbl" x="842" y="106" text-anchor="middle" fill="#78350f" font-size="11.4" font-weight="900">Παλιός Ναός</text>' +
              '</g>' +
              '<g class="pzood-map-node" data-zmap-spot="2" role="button" tabindex="0" aria-label="Καινούριος Ναός - Νότια Πλευρά">' +
                '<rect x="764" y="114" width="142" height="78" rx="12" fill="transparent"/>' +
                '<circle cx="842" cy="154" r="21" fill="#4f46e5" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="842" y="161" text-anchor="middle" font-size="17.5">\u26EA</text>' +
                '<text class="pzood-map-lbl" x="842" y="187" text-anchor="middle" fill="#312e81" font-size="11.4" font-weight="900">Καινούριος Ναός</text>' +
              '</g>' +
              '<g class="pzood-map-node" data-zmap-spot="4" role="button" tabindex="0" aria-label="Μικρή Γέφυρα και Κανάλι Νερού">' +
                '<rect x="392" y="228" width="100" height="72" rx="12" fill="transparent"/>' +
                '<circle cx="442" cy="262" r="20" fill="#0369a1" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="442" y="269" text-anchor="middle" font-size="17">\uD83C\uDF09</text>' +
                '<text class="pzood-map-lbl" x="442" y="301" text-anchor="middle" fill="#0c4a6e" font-size="11.5" font-weight="900">Μικρή Γέφυρα</text>' +
              '</g>' +
            '<g class="pzood-map-node" data-zmap-spot="5" role="button" tabindex="0" aria-label="Παιδική Χαρά">' +
                '<rect x="602" y="298" width="180" height="114" rx="14" fill="transparent"/>' +
                '<circle cx="692" cy="352" r="22" fill="#e11d48" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="692" y="359" text-anchor="middle" font-size="18.5">\uD83D\uDEDD</text>' +
              '</g>' +
             '<g class="pzood-map-node" data-zmap-spot="8" role="button" tabindex="0" aria-label="Κτίριο Πομόνας - Γεώτρηση 200 μέτρων">' +
                '<rect x="785" y="276" width="46" height="94" rx="12" fill="transparent"/>' +
                '<circle cx="808" cy="334" r="19" fill="#0891b2" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="808" y="341" text-anchor="middle" font-size="16.5">\uD83D\uDCA6</text>' +
                '<text class="pzood-map-lbl" x="808" y="364" text-anchor="middle" fill="#0e7490" font-size="11.2" font-weight="900">Πομόνα</text>' +
              '</g>' +
             '<g class="pzood-map-node" data-zmap-spot="9" role="button" tabindex="0" aria-label="Παραδοσιακή Κρήνη με τρεχούμενο νερό από τον Όλυμπο">' +
                '<rect x="255" y="276" width="90" height="58" rx="12" fill="transparent"/>' +
                '<circle cx="276" cy="297" r="18" fill="#0d9488" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="276" y="303.5" text-anchor="middle" font-size="15.5">\uD83D\uDEB0</text>' +
                '<text class="pzood-map-lbl" x="276" y="326" text-anchor="middle" fill="#115e59" font-size="11.2" font-weight="900">Κρήνη</text>' +
              '</g>' +
            '</g>' +

            /* ==================== ΔΙΑΔΡΑΣΤΙΚΟΙ ΚΟΜΒΟΙ: ΑΝΟΙΞΗ 1941 (0..5) ==================== */
            '<g class="pzood-era-past">' +
              '<g class="pzood-hist-node" data-zmap-hist="0" role="button" tabindex="0" aria-label="Παλιό Μονύδριο Ζωοδόχου Πηγής">' +
                '<rect x="760" y="38" width="146" height="84" rx="14" fill="transparent"/>' +
                '<circle cx="842" cy="78" r="23" fill="#b45309" stroke="#fde047" stroke-width="3.5"/>' +
                '<text x="842" y="85" text-anchor="middle" font-size="18.5">\uD83C\uDFDB\uFE0F</text>' +
                '<text class="pzood-map-lbl" x="842" y="116" text-anchor="middle" fill="#78350f" font-size="11.6" font-weight="900">\u2B50 Παλιό Μονύδριο</text>' +
              '</g>' +
              '<g class="pzood-hist-node" data-zmap-hist="1" role="button" tabindex="0" aria-label="Στρατόπεδο Νεοζηλανδών Συμμάχων 1941">' +
                '<rect x="190" y="76" width="156" height="92" rx="14" fill="transparent"/>' +
                '<circle cx="268" cy="118" r="22" fill="#059669" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="268" y="125" text-anchor="middle" font-size="18">\u26FA</text>' +
                '<text class="pzood-map-lbl" x="268" y="158" text-anchor="middle" fill="#064e3b" font-size="11.6" font-weight="900">Σκηνές ANZAC (1941)</text>' +
              '</g>' +
              '<g class="pzood-hist-node" data-zmap-hist="2" role="button" tabindex="0" aria-label="Ζυμωτό Ψωμί Κατοίκων Περίστασης 1941">' +
                '<rect x="506" y="122" width="112" height="78" rx="14" fill="transparent"/>' +
                '<circle cx="562" cy="158" r="21" fill="#d97706" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="562" y="165" text-anchor="middle" font-size="17.5">\uD83C\uDF5E</text>' +
                '<text class="pzood-map-lbl" x="562" y="194" text-anchor="middle" fill="#78350f" font-size="11.4" font-weight="900">Ζυμωτό Ψωμί (' + "'41" + ')</text>' +
              '</g>' +
              '<g class="pzood-hist-node" data-zmap-hist="3" role="button" tabindex="0" aria-label="Παλιό Γεφυράκι και Κανάλι Νερού">' +
                '<rect x="392" y="228" width="100" height="72" rx="12" fill="transparent"/>' +
                '<circle cx="442" cy="262" r="20" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="442" y="269" text-anchor="middle" font-size="17">\uD83C\uDF09</text>' +
                '<text class="pzood-map-lbl" x="442" y="301" text-anchor="middle" fill="#0c4a6e" font-size="11.4" font-weight="900">Παλιό Γεφυράκι</text>' +
              '</g>' +
              '<g class="pzood-hist-node" data-zmap-hist="4" role="button" tabindex="0" aria-label="Νότιο Καταφύγιο Πλατανιών 1941">' +
                '<rect x="606" y="302" width="172" height="104" rx="14" fill="transparent"/>' +
                '<circle cx="692" cy="352" r="21" fill="#15803d" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="692" y="359" text-anchor="middle" font-size="17.5">\uD83C\uDF3F</text>' +
                '<text class="pzood-map-lbl" x="692" y="392" text-anchor="middle" fill="#14532d" font-size="11.4" font-weight="900">Νότιο Καταφύγιο</text>' +
              '</g>' +
             '<g class="pzood-hist-node" data-zmap-hist="5" role="button" tabindex="0" aria-label="Κρήνη με τρεχούμενο νερό Ολύμπου">' +
                '<rect x="255" y="276" width="90" height="58" rx="12" fill="transparent"/>' +
                '<circle cx="276" cy="297" r="18" fill="#0d9488" stroke="#ffffff" stroke-width="3"/>' +
                '<text x="276" y="303.5" text-anchor="middle" font-size="15.5">\uD83D\uDEB0</text>' +
                '<text class="pzood-map-lbl" x="276" y="326" text-anchor="middle" fill="#115e59" font-size="11.2" font-weight="900">Κρήνη (' + "'41" + ')</text>' +
              '</g>' +
            '</g>' +

            /* Σήμανση Προσοχής (Γέφυρα / Διασταύρωση) & Περιηγητής */
            '<g id="pzoodCrossAlert" style="display:none;pointer-events:none" transform="translate(442,262)">' +
              '<g class="pzood-cross-anim">' +
                '<circle cy="-24" r="13" fill="#fef3c7" stroke="#dc2626" stroke-width="2.2"/>' +
                '<text id="pzoodCrossIcon" y="-19" text-anchor="middle" font-size="13">\uD83D\uDEA6</text>' +
              '</g>' +
            '</g>' +
            '<g id="pzoodStudentWalker" style="pointer-events:none" transform="translate(604,172)">' +
              '<circle r="15" fill="#ffffff" stroke="#16a34a" stroke-width="2.6"/>' +
              '<g id="pzoodWalkerFlip"><text y="5.5" text-anchor="middle" font-size="15.5">\uD83D\uDEB6</text></g>' +
            '</g>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="pzood-map-status" id="pzoodMapStatus"></div>';

    mapMount.appendChild(mapWrap);

    mapWalkBgPath = document.getElementById("pzoodMapWalkBg");
    mapWalkPath = document.getElementById("pzoodMapWalkLine");
    mapPulseRing = document.getElementById("pzoodMapPulse");
    mapWalkerEl = document.getElementById("pzoodStudentWalker");
    mapWalkerFlipEl = document.getElementById("pzoodWalkerFlip");
    mapCrossAlertEl = document.getElementById("pzoodCrossAlert");
    mapCrossIconEl = document.getElementById("pzoodCrossIcon");
   mapStatusEl = document.getElementById("pzoodMapStatus");
    mapZoomBtn = document.getElementById("pzoodMapZoomBtn");
    mapScrollEl = document.getElementById("pzoodMapScroll");
    mapModernNodes = mapWrap.querySelectorAll(".pzood-map-node");
    mapHistNodes = mapWrap.querySelectorAll(".pzood-hist-node");
    mapExitNodes = mapWrap.querySelectorAll(".pzood-exit-sign");

    syncExploredUI(false);
    syncDetBtnText();
    syncModernMap(-1, true);

    var mScrollBox = mapScrollEl;
    var svgEl = document.getElementById("pzoodMapSvg");
    var streetZoomBtn = document.getElementById("pzoodStreetZoomBtn");

    if (mScrollBox) {
      var mTx = 0, mTy = 0;
      mScrollBox.addEventListener("touchstart", function(e) {
        if (e.touches && e.touches[0]) { mTx = e.touches[0].clientX; mTy = e.touches[0].clientY; }
      }, { passive: true });
      mScrollBox.addEventListener("touchmove", function(e) {
        if (walkAnimRaf && e.touches && e.touches[0] && (Math.abs(e.touches[0].clientX - mTx) > 6 || Math.abs(e.touches[0].clientY - mTy) > 6)) {
          mapScrollAbort = true;
        }
      }, { passive: true });
      mScrollBox.addEventListener("wheel", function() { if (walkAnimRaf) mapScrollAbort = true; }, { passive: true });
      bindDragScroll(mScrollBox, function() { if (walkAnimRaf) mapScrollAbort = true; });
    }

    function toggleStreetZoom(fx, fy) {
      streetZoomOn = !streetZoomOn;
      walkDimsDirty = true;
      if (mScrollBox) mScrollBox.classList.toggle("is-mobile-zoom", streetZoomOn);
      if (streetZoomBtn) {
        streetZoomBtn.classList.toggle("is-overview", !streetZoomOn);
        streetZoomBtn.textContent = streetZoomOn ? "\uD83D\uDDFA\uFE0F Δες Όλο το Άλσος" : "\uD83D\uDD0D Κοντινό Ζουμ";
      }
      if (streetZoomOn) {
        requestAnimationFrame(function() { scrollZoomedMapTo(fx || lastTargetX, fy || lastTargetY, false); });
      } else if (mScrollBox) {
        mScrollBox.scrollLeft = 0; mScrollBox.scrollTop = 0;
      }
    }

   if (svgEl) {
      bindDoubleTap(svgEl, ".pzood-map-node, .pzood-hist-node, .pzood-exit-sign", function(cx, cy) {
        if (!isMapZoomed || performance.now() - mapZoomOpenedAt < 350) return false;
        if (isMobileMapVp()) {
          var r = svgEl.getBoundingClientRect();
          var tx = r.width > 0 ? ((cx - r.left) / r.width) * 940 : lastTargetX;
          var ty = r.height > 0 ? ((cy - r.top) / r.height) * 460 : lastTargetY;
          toggleStreetZoom(tx, ty);
          return true;
        }
        if (!isDetActive()) {
          closeMapModal(false);
          return true;
        }
        return false;
      });
    }

    if (mapStatusEl) {
      bindSwipe(
        mapStatusEl,
        function() {
          if (detActive && detWaiting) { advanceDetRound(false); return; }
          stepMapNode(1);
        },
        function() { stepMapNode(-1); }
      );
    }

    var downPt = null, mapMultiTouch = false, touchStartX = 0, touchStartY = 0, touchMoved = false, suppressClickUntil = 0;
    var riverBusyT = 0, riverBusyOn = false, fingerDownOnMap = false, lastRiverBumpTs = 0;
   var coarsePtrMq = window.matchMedia ? window.matchMedia("(pointer: coarse), (any-pointer: coarse), (hover: none)") : null;
    var isTouchMobEnv = function() {
      return isMobileMapVp() || !!(coarsePtrMq && coarsePtrMq.matches) || ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    };
    var bumpMobileRiverPause = function(holdMs) {
      if (!mapWrap || mapWrap.classList.contains("is-paused") || !isTouchMobEnv()) return;
      var now = performance.now();
      if (holdMs > 0 && riverBusyOn && riverBusyT && now - lastRiverBumpTs < 80) return;
      lastRiverBumpTs = now;
      if (!riverBusyOn) {
        riverBusyOn = true;
        mapWrap.classList.add("is-touch-busy");
      }
      if (riverBusyT) { clearTimeout(riverBusyT); riverBusyT = 0; }
      if (holdMs > 0) {
        riverBusyT = setTimeout(function() {
          riverBusyT = 0;
          riverBusyOn = false;
          if (mapWrap) mapWrap.classList.remove("is-touch-busy");
        }, holdMs);
      }
    };
    if (mScrollBox) {
      mScrollBox.addEventListener("scroll", function() {
        if (!fingerDownOnMap && (!walkAnimRaf || mapScrollAbort)) bumpMobileRiverPause(220);
      }, { passive: true });
    }
    mapWrap.addEventListener("scroll", function() {
      if (isMapZoomed) bumpMobileRiverPause(220);
    }, { passive: true });
    window.addEventListener("scroll", function() {
      if (!fingerDownOnMap && !isMapZoomed) bumpMobileRiverPause(220);
    }, { passive: true });
    if (window.visualViewport) {
      var onVvMove = function() { bumpMobileRiverPause(240); };
      window.visualViewport.addEventListener("scroll", onVvMove, { passive: true });
      window.visualViewport.addEventListener("resize", onVvMove, { passive: true });
    }
    document.addEventListener("touchmove", function() {
      if (!fingerDownOnMap && isZoodSceneSelected()) bumpMobileRiverPause(220);
    }, { passive: true });

    mapWrap.addEventListener("touchstart", function(e) {
      fingerDownOnMap = true;
      bumpMobileRiverPause(0);
      if (!e.touches || e.touches.length > 1) { mapMultiTouch = true; return; }
      suppressClickUntil = 0;
      mapMultiTouch = false;
      touchMoved = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    mapWrap.addEventListener("touchmove", function(e) {
      if (!e.touches || e.touches.length > 1) { mapMultiTouch = true; return; }
      if (Math.abs(e.touches[0].clientX - touchStartX) > 14 || Math.abs(e.touches[0].clientY - touchStartY) > 14) {
        touchMoved = true;
      }
    }, { passive: true });
    mapWrap.addEventListener("touchend", function(e) {
      if (e.touches && e.touches.length > 0) {
        mapMultiTouch = true;
        suppressClickUntil = performance.now() + 320;
        return;
      }
      fingerDownOnMap = false;
      bumpMobileRiverPause(220);
      if (mapMultiTouch || touchMoved) suppressClickUntil = performance.now() + 260;
      mapMultiTouch = false;
      touchMoved = false;
    }, { passive: true });
    mapWrap.addEventListener("touchcancel", function() {
      fingerDownOnMap = false;
      bumpMobileRiverPause(180);
      mapMultiTouch = false;
      touchMoved = false;
      downPt = null;
    }, { passive: true });
    mapWrap.addEventListener("pointerdown", function(e) {
      if (e.isPrimary === false) { mapMultiTouch = true; downPt = null; return; }
      mapMultiTouch = false;
      if (e.pointerType !== "touch") touchMoved = false;
      downPt = { x: e.clientX, y: e.clientY };
    }, { passive: true });
    mapWrap.addEventListener("pointercancel", function() {
      downPt = null;
    }, { passive: true });

   mapWrap.addEventListener("click", function(e) {
      var backVilBtn = e.target.closest("#pzoodBackToVillageBtn");
      if (backVilBtn) {
        e.stopPropagation();
        if (isDetActive()) stopDetective(false, true);
        execZoodBridgeKey("village", e.detail === 0, true, backVilBtn);
        return;
      }
      var mapBrBtn = e.target.closest("[data-zbridge]");
      if (mapBrBtn) {
        e.stopPropagation();
        execZoodBridgeKey(mapBrBtn.getAttribute("data-zbridge"), e.detail === 0, false, mapBrBtn);
        return;
      }
      if (e.target.closest("#pzoodMapZoomBtn")) {
        e.stopPropagation();
        if (isMapZoomed) closeMapModal(false);
        else openMapModal();
        return;
      }
      if (e.target.closest("#pzoodStreetZoomBtn")) {
        e.stopPropagation();
        toggleStreetZoom(lastTargetX, lastTargetY);
        return;
      }
     if (e.target.closest("#pzoodEraModernBtn")) {
        e.stopPropagation();
        var wasDetMod = isDetActive();
        if (wasDetMod) stopDetective(false, true);
        if (isPastEra) setMapEra(false);
        else if (wasDetMod) syncModernMap(-1, true);
        return;
      }
      if (e.target.closest("#pzoodEraPastBtn")) {
        e.stopPropagation();
        var wasDetPast = isDetActive();
        if (wasDetPast) stopDetective(false, true);
        if (!isPastEra) setMapEra(true);
        else if (wasDetPast) selectHistStop(activeHistIdx, false);
        return;
      }
      if (e.target.closest("#pzoodModernTourBtn")) {
        e.stopPropagation();
        if (isModernTourRunning) { stopAllTours(true); syncModernMap(-1, true); }
        else startModernTour();
        return;
      }
      if (e.target.closest("#pzoodHistTourBtn")) {
        e.stopPropagation();
        if (isHistTourRunning) { stopAllTours(true); selectHistStop(0, false); }
        else startHist1941Tour();
        return;
      }
      if (e.target.closest("#pzoodDetectiveBtn")) {
        e.stopPropagation();
        if (isDetActive()) stopDetective(false, false);
        else startDetective();
        return;
      }
      if (e.target.closest("[data-zdet-close]")) {
        e.stopPropagation();
        stopDetective(e.detail === 0, false);
        return;
      }
      var dmBtn = e.target.closest("[data-zdet-mode]");
      if (dmBtn) {
        e.stopPropagation();
        startDetective(dmBtn.getAttribute("data-zdet-mode"), true);
        return;
      }
      if (e.target.closest("[data-zdet-next]")) {
        e.stopPropagation();
        advanceDetRound(e.detail === 0);
        return;
      }
     if (e.target.closest("[data-zdet-replay]")) {
        e.stopPropagation();
        var isKbRep = (e.detail === 0);
        startDetective(detMode, true);
        if (isKbRep) {
          requestAnimationFrame(function() {
            var fn0 = mapWrap.querySelector(isPastEra ? ".pzood-hist-node" : ".pzood-map-node");
            if (fn0 && fn0.focus) { try { fn0.focus({ preventScroll: true }); } catch (err) { fn0.focus(); } }
          });
        }
        return;
      }
     if (e.target.closest("[data-zdet-zoom]")) {
        e.stopPropagation();
        var dq = detDeck[detRound];
        if (dq) {
          if (dq.era === "past") {
            var hIm = hist1941Stops[dq.histIdx].img;
            openPhotoZoom([{ src: hIm, fallbackSrc: hIm === photoShrinePan ? photoGroveArea : photoShrinePan, caption: hist1941Stops[dq.histIdx].cap }], 0, e.target);
          } else {
            openPhotoZoom([{ src: spotsData[dq.spotIdx].img, fallbackSrc: spotsData[dq.spotIdx].fallbackImg || photoShrinePan, caption: spotsData[dq.spotIdx].imgCap }], 0, e.target);
          }
        }
        return;
      }
      if (e.target.closest("[data-zwin-close]")) {
        e.stopPropagation();
        var wb = document.getElementById("pzoodExpWinBanner");
        if (wb) wb.classList.remove("is-vis");
        return;
      }
      if (e.target.closest("#pzoodExpReset")) {
        e.stopPropagation();
        exploredMap = {};
        try { localStorage.removeItem("pzood_explored_8"); } catch (err) {}
        syncExploredUI(false);
        return;
      }
      var zmBtn = e.target.closest("[data-zmode]");
      if (zmBtn) {
        e.stopPropagation();
        var nextM = zmBtn.getAttribute("data-zmode") || "walk";
        if (travelMode !== nextM) {
          travelMode = nextM;
          if (isModernTourRunning || isHistTourRunning) stopAllTours(false);
          syncWalkerAppearance();
          if (detActive && !detWaiting) {
            setDetGuessStatus(detDeck[detRound]);
          } else if (isPastEra) {
            if (activeSpecialKey.indexOf("exit-") === 0) showExitRoute(activeSpecialKey.slice(5), autoVillagePending, autoVillageFromKb);
            else selectHistStop(activeHistIdx, false);
          } else if (spatialBridgeHistIdx !== -1) {
            showWhereTodayFrom1941(spatialBridgeHistIdx);
          } else if (curTourStage !== -1 && !isModernTourRunning) {
            showModernTourStage(curTourStage);
          } else if (activeSpecialKey.indexOf("exit-") === 0) {
            showExitRoute(activeSpecialKey.slice(5), autoVillagePending, autoVillageFromKb);
          } else {
            var keepTourSp = tourActiveSpotIdx;
            syncModernMap(activeSpotIdx !== -1 ? activeSpotIdx : keepTourSp, true);
            if (activeSpotIdx === -1 && keepTourSp !== -1) {
              tourActiveSpotIdx = keepTourSp;
              syncSvgActiveFx();
            }
          }
        }
        return;
      }
      if (e.target.closest("[data-zthumb-zoom]") && curStatusThumb) {
        e.stopPropagation();
        if (isPastEra && !activeSpecialKey) {
          var hList = hist1941Stops.map(function(h) { return { src: h.img, fallbackSrc: h.img === photoShrinePan ? photoGroveArea : photoShrinePan, caption: h.cap }; });
          openPhotoZoom(hList, activeHistIdx, e.target);
        } else {
          var sIdx = activeSpotIdx >= 0 ? activeSpotIdx : tourActiveSpotIdx;
          if (sIdx >= 0) {
            var sList = spotsData.map(function(s) { return { src: s.img, fallbackSrc: s.fallbackImg, caption: s.imgCap }; });
            openPhotoZoom(sList, sIdx, e.target);
          } else {
            openPhotoZoom([{ src: curStatusThumb, fallbackSrc: curStatusFallback, caption: curStatusCap }], 0, e.target);
          }
        }
        return;
      }
     var gotoBtnEl = e.target.closest(".pzood-map-goto-btn");
      if (gotoBtnEl) {
        e.stopPropagation();
        if (curStatusAction === "bridge-village") { execZoodBridgeKey("village", e.detail === 0, true, gotoBtnEl); return; }
        if (curStatusAction === "bridge-katerini") { execZoodBridgeKey("route-katerini", e.detail === 0, false, gotoBtnEl); return; }
        if (curStatusAction === "bridge-kampos") { execZoodBridgeKey("elev-sea", e.detail === 0, false, gotoBtnEl); return; }
        if (curStatusAction === "photo") {
          if (isPastEra && !activeSpecialKey) {
            var hL = hist1941Stops.map(function(h) { return { src: h.img, fallbackSrc: h.img === photoShrinePan ? photoGroveArea : photoShrinePan, caption: h.cap }; });
            openPhotoZoom(hL, activeHistIdx, e.target);
          } else {
            openPhotoZoom([{ src: curStatusThumb || photoGroveArea, fallbackSrc: curStatusFallback, caption: curStatusCap }], 0, e.target);
          }
          return;
        }
      var isKbCard = (e.detail === 0);
        var wantMir = (curStatusAction === "mirror");
        var targetIdx = activeSpotIdx !== -1 ? activeSpotIdx : (tourActiveSpotIdx !== -1 ? tourActiveSpotIdx : (wantMir ? 1 : 0));
        if (activeSpotIdx === -1 || (wantMir && !spotsData[activeSpotIdx].hasMirror)) openSpotCard(wantMir ? 1 : targetIdx, false);
        if (wantMir) {
          var mBtnOpen = document.getElementById("pzoodOpenMirrorBtn");
          var mHostOpen = document.getElementById("pzoodMirrorStage");
          if (mBtnOpen && mHostOpen && mHostOpen.style.display !== "block") mBtnOpen.click();
        }
        if (isMapZoomed) {
          lastMapFocusEl = null;
          var didBack = closeMapModal(false, true);
          runAfterBack(didBack, function() {
            if (stageEl) stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
            if (isKbCard) {
              var cBtn = document.getElementById("pzoodCardCloseBtn");
              if (cBtn && cBtn.focus) { try { cBtn.focus({ preventScroll: true }); } catch (err) { cBtn.focus(); } }
            }
          });
        } else if (stageEl) {
          stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
          if (isKbCard) {
            var cBtn2 = document.getElementById("pzoodCardCloseBtn");
            if (cBtn2 && cBtn2.focus) { try { cBtn2.focus({ preventScroll: true }); } catch (err) { cBtn2.focus(); } }
          }
        }
        return;
      }
     var tStep = e.target.closest("[data-ztour-step]");
      if (tStep) {
        e.stopPropagation();
        if (isDetActive()) stopDetective(false, true);
        stopAllTours(false);
        showModernTourStage(Number(tStep.getAttribute("data-ztour-step")) || 0);
        return;
      }
      var hChip = e.target.closest("[data-zhist-chip]");
      if (hChip) {
        e.stopPropagation();
        if (isDetActive()) stopDetective(false, true);
        stopAllTours(true);
        selectHistStop(Number(hChip.getAttribute("data-zhist-chip")) || 0, false);
        return;
      }
      if (e.target.closest("[data-zhist-where]")) {
        e.stopPropagation();
        if (isDetActive()) stopDetective(false, true);
        setMapEra(false, false, true);
        return;
      }
      var back41 = e.target.closest("[data-zback-1941]");
      if (back41) {
        e.stopPropagation();
        if (isDetActive()) stopDetective(false, true);
        var bIdx = Number(back41.getAttribute("data-zback-1941")) || 0;
        setMapEra(true, true);
        selectHistStop(bIdx, true);
        return;
      }

      var draggedMap = (e.detail !== 0) && !!((performance.now() < suppressClickUntil) || touchMoved || (downPt && (Math.abs(e.clientX - downPt.x) > 14 || Math.abs(e.clientY - downPt.y) > 14)));
      downPt = null;
      if (draggedMap || mapMultiTouch) return;

   var triggerExitSign = function(signEl, isKb) {
        var exKey = signEl.getAttribute("data-zexit") || "peristasi";
        if (detActive) {
          handleDetNodeTap({
            spotIdx: -1, histIdx: -1,
          cx: exKey === "kampos" ? 885 : 92,
            cy: exKey === "katerini" ? 416 : (exKey === "kampos" ? 294 : 188),
            label: exKey === "katerini" ? "Δρόμος Κατερίνης" : (exKey === "kampos" ? "Προς Κάμπο" : "Δρόμος Περίστασης"),
            el: signEl
          });
          return;
        }
        if (isDetActive()) stopDetective(false, true);
        if (window.peristasiBridge && activeSpecialKey === ("exit-" + exKey)) {
          execZoodBridgeKey(exKey === "peristasi" ? "village" : (exKey === "katerini" ? "route-katerini" : "elev-sea"), isKb, exKey === "peristasi", signEl);
          return;
        }
        closeSpotCard(true);
        showExitRoute(exKey, exKey === "peristasi", isKb);
      };

      var exSign = e.target.closest("[data-zexit]");
      if (exSign) {
        e.stopPropagation();
        triggerExitSign(exSign, e.detail === 0);
        return;
      }

     var onSvgTap = !!(e.detail !== 0 && e.target.closest("#pzoodMapSvg"));
      if (isPastEra) {
        var hNode = e.target.closest(".pzood-hist-node") || (onSvgTap ? findClosestSvgNode(mapHistNodes, e.clientX, e.clientY, 34) : null);
        if (hNode) {
          e.stopPropagation();
          var hi = Number(hNode.getAttribute("data-zmap-hist")) || 0;
          if (detActive) {
            handleDetNodeTap({ histIdx: hi, cx: hist1941Stops[hi].cx, cy: hist1941Stops[hi].cy, label: hist1941Stops[hi].chip.replace(/^\d+\.\s*/, ""), el: hNode });
            return;
          }
          if (isDetActive()) stopDetective(false, true);
          if (!isHistTourRunning && hi === activeHistIdx && !activeSpecialKey) {
            var hGal = hist1941Stops.map(function(h) { return { src: h.img, fallbackSrc: h.img === photoShrinePan ? photoGroveArea : photoShrinePan, caption: h.cap }; });
            openPhotoZoom(hGal, hi, hNode);
          } else {
            stopAllTours(true);
            selectHistStop(hi, false);
          }
          return;
        }
      } else {
        var mNode = e.target.closest(".pzood-map-node") || (onSvgTap ? findClosestSvgNode(mapModernNodes, e.clientX, e.clientY, 34) : null);
        if (mNode) {
          e.stopPropagation();
          var si = Number(mNode.getAttribute("data-zmap-spot")) || 0;
          if (detActive) {
            handleDetNodeTap({ spotIdx: si, cx: spotMapMeta[si].cx, cy: spotMapMeta[si].cy, label: spotsData[si].title.split(":")[0], el: mNode });
            return;
          }
          if (isDetActive()) stopDetective(false, true);
          stopAllTours(true);
          if (si === activeSpotIdx) syncModernMap(si, true);
          else openSpotCard(si, false);
          return;
        }
      }

     if (onSvgTap) {
        var nearEx = findClosestSvgNode(mapExitNodes, e.clientX, e.clientY, 22);
        if (!nearEx && activeSpecialKey.indexOf("exit-") === 0 && mapPulseRing && mapPulseRing.style.display !== "none") {
          var pRect = mapPulseRing.getBoundingClientRect();
          if (pRect.width > 0 && pRect.height > 0) {
            var pdx = e.clientX - (pRect.left + pRect.width * 0.5);
            var pdy = e.clientY - (pRect.top + pRect.height * 0.5);
            if (pdx * pdx + pdy * pdy <= 1296) {
              nearEx = mapWrap.querySelector('[data-zexit="' + activeSpecialKey.slice(5) + '"]');
            }
          }
        }
        if (nearEx) {
          e.stopPropagation();
          triggerExitSign(nearEx, false);
          return;
        }
      }

    if (!isDetActive() && !isMapZoomed && !isPinchZoomed() && e.target.closest("#pzoodMapSvg")) {
        openMapModal();
      }
    });

    mapWrap.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        var kbTarget = e.target.closest(".pzood-map-node, .pzood-hist-node, .pzood-exit-sign, [data-zthumb-zoom], [data-zdet-zoom]");
        if (kbTarget) {
          e.preventDefault();
          kbTarget.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      }
    });

    var photosPreloaded = false, mapIsVis = true, gracePauseT = 0;
    var pauseOffscreenMap = function() {
      gracePauseT = 0;
      if (!mapIsVis && !isMapZoomed) {
        if (performance.now() <= zoodRevealGraceUntil) {
          gracePauseT = setTimeout(pauseOffscreenMap, Math.ceil(zoodRevealGraceUntil - performance.now()) + 40);
          return;
        }
        if (riverBusyT) { clearTimeout(riverBusyT); riverBusyT = 0; }
        riverBusyOn = false;
        mapWrap.classList.remove("is-touch-busy");
        mapWrap.classList.add("is-paused");
        stopAllTours(false);
        stopWalkAnim(true);
      }
    };
    if (typeof window.IntersectionObserver === "function") {
      var visObs = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var vis = entries[i].isIntersecting;
          mapIsVis = vis;
         if (vis) {
            if (gracePauseT) { clearTimeout(gracePauseT); gracePauseT = 0; }
            if (isZoodSceneSelected()) mapWrap.classList.remove("is-paused");
            if (!photosPreloaded && isZoodSceneSelected()) {
              photosPreloaded = true;
              var conn = navigator && (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
              if (!conn || (!conn.saveData && !/2g|3g/.test(conn.effectiveType || ""))) {
                var runPre = function() {
                var preList = isTouchMobEnv()
                    ? [optImg(photoShrinePan, 640)]
                    : [photoOldChurch, photoGroveArea, optImg(photoShrinePan, 640), optImg(photoCourtyard, 640), optImg(photoBridge, 640), optImg(photoPlayground, 640), optImg(photoPomona, 640), optImg(photoKrini, 640)];
                  preList.forEach(function(u) {
                    if (!u) return;
                    var im = new Image();
                    im.decoding = "async";
                    im.src = u;
                  });
                };
                if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(runPre, { timeout: 1100 });
                else setTimeout(runPre, 300);
              }
            }
          } else if (!isMapZoomed) {
            pauseOffscreenMap();
          }
        }
      }, { threshold: 0 });
      visObs.observe(mapWrap);
    }
  }

 function isZoodBusy() {
    return !!(isPastEra || isModernTourRunning || isHistTourRunning || curTourStage !== -1 || activeSpecialKey !== "" || tourActiveSpotIdx !== -1 || spatialBridgeHistIdx !== -1);
  }

  function resetZoodMap() {
    if (isHistTourRunning) {
      stopAllTours(true);
      selectHistStop(0, false);
    } else if (isPastEra) {
      setMapEra(false, true);
      syncModernMap(-1, true);
    } else {
      syncModernMap(-1, true);
    }
  }

  function stepMapNode(dir, focusKind) {
    if (detActive) return;
    if (isDetActive()) stopDetective(false, true);
    stopAllTours(true);
    var focusEl = null;
   if (isPastEra) {
      if (focusKind === "map") {
        var hOrd = ["h0", "h1", "h2", "h3", "h4", "h5", "exit-peristasi", "exit-katerini", "exit-kampos"];
        var curHK = activeSpecialKey ? activeSpecialKey : ("h" + activeHistIdx);
        var hp = hOrd.indexOf(curHK);
        if (hp === -1) hp = 0;
        var nextHK = hOrd[(hp + dir + hOrd.length) % hOrd.length];
        if (nextHK.indexOf("exit-") === 0) {
          showExitRoute(nextHK.slice(5));
          focusEl = mapWrap ? mapWrap.querySelector('[data-zexit="' + nextHK.slice(5) + '"]') : null;
        } else {
          selectHistStop(Number(nextHK.slice(1)), false);
          focusEl = mapWrap ? mapWrap.querySelector('[data-zmap-hist="' + activeHistIdx + '"]') : null;
        }
      } else {
        selectHistStop(activeHistIdx + dir, false);
      }
 } else if (focusKind === "map") {
      var mOrd = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "exit-peristasi", "exit-katerini", "exit-kampos"];
      var curMK = activeSpecialKey ? activeSpecialKey : ("s" + (activeSpotIdx !== -1 ? activeSpotIdx : (tourActiveSpotIdx !== -1 ? tourActiveSpotIdx : (dir > 0 ? 9 : 1))));
      var mp = mOrd.indexOf(curMK);
      if (mp === -1) mp = 0;
      var nextMK = mOrd[(mp + dir + mOrd.length) % mOrd.length];
    if (nextMK.indexOf("exit-") === 0) {
        showExitRoute(nextMK.slice(5));
        closeSpotCard(true);
        focusEl = mapWrap ? mapWrap.querySelector('[data-zexit="' + nextMK.slice(5) + '"]') : null;
      } else {
        openSpotCard(Number(nextMK.slice(1)), false);
        focusEl = mapWrap ? mapWrap.querySelector('[data-zmap-spot="' + activeSpotIdx + '"]') : null;
      }
    } else {
      var base = activeSpotIdx !== -1 ? activeSpotIdx : (tourActiveSpotIdx !== -1 ? tourActiveSpotIdx : (dir > 0 ? -1 : 0));
      openSpotCard(base + dir, false);
      if (focusKind === "pill" && activeSpotIdx >= 0 && pillEls[activeSpotIdx]) {
        focusEl = pillEls[activeSpotIdx];
      }
    }
    if (focusEl && focusEl.focus) {
      try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); }
    }
  }

  /* =========================================================================
     ΣΥΝΔΕΣΗ ΛΙΣΤΑΣ PILLS, ΚΑΡΤΑΣ (#pzoodStage) & ΠΛΗΚΤΡΟΛΟΓΙΟΥ
     ========================================================================= */
  pillEls.forEach(function(li) {
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-expanded", "false");
    li.addEventListener("click", function() {
      openSpotCard(Number(li.getAttribute("data-zspot")) || 0, true);
    });
    li.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSpotCard(Number(li.getAttribute("data-zspot")) || 0, true);
      }
    });
  });

  if (stageEl) {
    stageEl.addEventListener("click", function(e) {
      if (e.target.closest("#pzoodCardImg") && activeSpotIdx >= 0) {
        var gal = spotsData.map(function(s) { return { src: s.img, fallbackSrc: s.fallbackImg, caption: s.imgCap }; });
        openPhotoZoom(gal, activeSpotIdx, e.target);
        return;
      }
      if (e.target.closest("#pzoodCardCloseBtn")) {
        closeSpotCard(false, e.detail === 0);
        return;
      }
      if (e.target.closest("#pzoodPrevBtn")) {
        openSpotCard(activeSpotIdx - 1, false);
        return;
      }
      if (e.target.closest("#pzoodNextBtn")) {
        openSpotCard(activeSpotIdx + 1, false);
        return;
      }
  if (e.target.closest("#pzoodShowOnMapBtn") && mapWrap && activeSpotIdx !== -1) {
        var curIdx = activeSpotIdx;
        var isKbShow = (e.detail === 0);
        var mapScrollTarget = (mapWrap.closest && mapWrap.closest("#pexpDualMapStage")) || mapWrap;
        clearZoodPendingTimers();
        zoodRevealGraceUntil = performance.now() + 1800;
        mapWrap.classList.remove("is-paused");
        mapScrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        mapWrap.classList.add("is-bridge-glow");
        setTimeout(function() { if (mapWrap) mapWrap.classList.remove("is-bridge-glow"); }, 1900);
        arrivalWalkTimer = setTimeout(function() {
          arrivalWalkTimer = null;
          if (isZoodSceneSelected() && !isDetActive() && activeSpotIdx === curIdx) {
            syncModernMap(curIdx, true);
            if (isKbShow && mapWrap) {
              var mNd = mapWrap.querySelector('[data-zmap-spot="' + curIdx + '"]') || mapZoomBtn;
              if (mNd && mNd.focus) { try { mNd.focus({ preventScroll: true }); } catch (err) { mNd.focus(); } }
            }
          }
        }, 320);
        return;
      }
      if (e.target.closest("#pzoodOpenMirrorBtn")) {
        var mHost = document.getElementById("pzoodMirrorStage");
        if (!mHost) return;
      if (mHost.style.display === "block") {
          if (mHost._disposeMirror) mHost._disposeMirror();
          mHost.style.display = "none";
          mHost.innerHTML = "";
        } else {
          mHost.style.display = "block";
          renderChurchMirror(mHost, function(restoreF) {
            mHost.style.display = "none";
            mHost.innerHTML = "";
            if (restoreF) {
              var ob = document.getElementById("pzoodOpenMirrorBtn");
              if (ob && ob.focus) { try { ob.focus({ preventScroll: true }); } catch (err) { ob.focus(); } }
            }
          });
          requestAnimationFrame(function() { mHost.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
        }
        return;
      }
     var cardBrBtn = e.target.closest("[data-zbridge]");
      if (cardBrBtn) {
        e.stopPropagation();
        execZoodBridgeKey(cardBrBtn.getAttribute("data-zbridge"), e.detail === 0, false, cardBrBtn);
        return;
      }
  var zCard41Btn = e.target.closest("[data-zcard-1941]");
   if (zCard41Btn && mapWrap) {
        var isKb41 = (e.detail === 0);
        var targetH41 = Number(zCard41Btn.getAttribute("data-zcard-1941")) || 1;
        var mapScrollTarget41 = (mapWrap.closest && mapWrap.closest("#pexpDualMapStage")) || mapWrap;
        clearZoodPendingTimers();
        closeSpotCard(true);
        zoodRevealGraceUntil = performance.now() + 1800;
        mapWrap.classList.remove("is-paused");
        mapScrollTarget41.scrollIntoView({ behavior: "smooth", block: "start" });
        mapWrap.classList.add("is-bridge-glow");
        setTimeout(function() { if (mapWrap) mapWrap.classList.remove("is-bridge-glow"); }, 1900);
        arrivalWalkTimer = setTimeout(function() {
          arrivalWalkTimer = null;
          if (!isZoodSceneSelected() || isDetActive()) return;
          setMapEra(true, true);
          selectHistStop(targetH41, true);
          if (isKb41 && mapWrap) {
            var hNd = mapWrap.querySelector('[data-zmap-hist="' + targetH41 + '"]') || mapZoomBtn;
            if (hNd && hNd.focus) { try { hNd.focus({ preventScroll: true }); } catch (err) { hNd.focus(); } }
          }
        }, 320);
      }
    });

    stageEl.addEventListener("keydown", function(e) {
      if ((e.key === "Enter" || e.key === " ") && e.target && e.target.id === "pzoodCardImg") {
        e.preventDefault();
        e.target.click();
      }
    });

    bindSwipe(
      stageEl,
      function() { if (activeSpotIdx !== -1) openSpotCard(activeSpotIdx + 1, false); },
      function() { if (activeSpotIdx !== -1) openSpotCard(activeSpotIdx - 1, false); }
    );
  }

function isZoodActiveScene() {
    return isZoodSceneSelected() && !isCoveredByMainOverlay();
  }

  document.addEventListener("keydown", function(e) {
    if (e.key !== "Escape") return;
    if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closePhotoZoom(false);
      return;
    }
    if (document.body.classList.contains("pexp-zoom-open")) return;
    if (isMapZoomed && isZoodActiveScene() && isDetActive()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      stopDetective(true, false);
    }
  }, true);

  document.addEventListener("keydown", function(e) {
    var zoomIsOpen = !!(zoomOverlay && zoomOverlay.classList.contains("is-open"));
    if (!zoomIsOpen) {
      if (document.body.classList.contains("pexp-zoom-open")) return;
      if (!isMapZoomed && document.body.classList.contains("pexp-overlay-open")) return;
      if (!isZoodActiveScene()) return;
    }
    if (e.key === "Tab") {
      if (zoomIsOpen) trapFocusIn(zoomOverlay, e);
      else if (isMapZoomed && mapWrap) trapFocusIn(mapWrap.closest("#pexpDualMapStage") || mapWrap, e);
      return;
    }
    if (zoomIsOpen && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "_" || e.key === "0")) {
      e.preventDefault();
      var mx = (window.innerWidth || 800) * 0.5, my = (window.innerHeight || 600) * 0.5;
      if (e.key === "0") applyPhotoDetailZoom(1, 0, 0, true);
      else zoomPhotoAtPt(zScale * ((e.key === "-" || e.key === "_") ? 0.78 : 1.32), mx, my, true);
      return;
    }
    if (e.key === "Escape") {
      if (zoomIsOpen) { e.preventDefault(); e.stopImmediatePropagation(); closePhotoZoom(false); return; }
      if (isMapZoomed && isDetActive()) { e.preventDefault(); e.stopImmediatePropagation(); stopDetective(true, false); return; }
      if (isMapZoomed) { e.preventDefault(); e.stopImmediatePropagation(); closeMapModal(false); return; }
      var mHost = document.getElementById("pzoodMirrorStage");
      if (mHost && mHost.style.display === "block") {
        e.preventDefault();
        e.stopImmediatePropagation();
        var hadMirFocus = mHost.contains(document.activeElement);
        if (mHost._disposeMirror) mHost._disposeMirror();
        mHost.style.display = "none";
        mHost.innerHTML = "";
        if (hadMirFocus) {
          var mirOpenBtn = document.getElementById("pzoodOpenMirrorBtn");
          if (mirOpenBtn && mirOpenBtn.focus) { try { mirOpenBtn.focus({ preventScroll: true }); } catch (err) { mirOpenBtn.focus(); } }
        }
        return;
      }
      if (isDetActive()) { e.preventDefault(); e.stopImmediatePropagation(); stopDetective(!!(mapWrap && mapWrap.contains(document.activeElement)), false); return; }
      if (activeSpotIdx !== -1) { e.preventDefault(); e.stopImmediatePropagation(); closeSpotCard(false, !!(stageEl && stageEl.contains(document.activeElement))); return; }
      if (isZoodBusy()) { e.preventDefault(); e.stopImmediatePropagation(); resetZoodMap(); return; }
    }
   if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var tgtEl = (e.target && e.target.nodeType === 1) ? e.target : (e.target ? e.target.parentElement : null);
    var tag = tgtEl && tgtEl.tagName ? tgtEl.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (tgtEl && tgtEl.isContentEditable)) return;
    var dir = e.key === "ArrowRight" ? 1 : -1;
    var onMapSvgNode = !!(tgtEl && tgtEl.closest && tgtEl.closest(".pzood-map-node, .pzood-hist-node, .pzood-exit-sign"));
    var onPillNode = !!(pillsListEl && pillsListEl.contains(tgtEl));
    var fKind = onMapSvgNode ? "map" : (onPillNode ? "pill" : "");
    if (zoomIsOpen) {
      if (zoomList.length > 1) { e.preventDefault(); stepPhotoZoom(dir); }
      return;
    }
    if (isMapZoomed) {
      if (dir > 0 && detActive && detWaiting) { e.preventDefault(); advanceDetRound(true); return; }
      if (!detActive) { e.preventDefault(); stepMapNode(dir, fKind); }
      return;
    }
   var dualBoxEl = (mapWrap && mapWrap.closest) ? mapWrap.closest("#pexpDualMapStage") : null;
    if (rootEl.contains(tgtEl) || (mapWrap && mapWrap.contains(tgtEl)) || (dualBoxEl && dualBoxEl.contains(tgtEl))) {
      var mStg = document.getElementById("pzoodMirrorStage");
      if (mStg && mStg.style.display === "block" && mStg._stepMirror && (mStg.contains(tgtEl) || (stageEl && stageEl.contains(tgtEl)))) {
        e.preventDefault();
        mStg._stepMirror(dir, true);
      } else if (dir > 0 && detActive && detWaiting) {
        e.preventDefault();
        advanceDetRound(true);
      } else if (!detActive) {
        e.preventDefault();
        stepMapNode(dir, fKind);
      }
    }
  });

  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      stopAllTours(false);
      stopWalkAnim(true);
    }
  });

  window.addEventListener("resize", function() {
    walkDimsDirty = true;
    if (isMapZoomed && !walkAnimRaf) {
      scrollZoomedMapTo(lastTargetX, lastTargetY, false);
    }
    if (zoomOverlay && zoomOverlay.classList.contains("is-open") && zScale > 1.01) {
      applyPhotoDetailZoom(zScale, zTx, zTy, false);
    }
  }, { passive: true });

window.addEventListener("popstate", function() {
    if (ignorePopCount > 0) {
      ignorePopCount--;
      if (ignorePopCount === 0 && safeBackTimer) {
        clearTimeout(safeBackTimer);
        safeBackTimer = 0;
      }
      return;
    }
    var st = window.history.state || {};
    if (!st.pzoodZoom && zoomOverlay && zoomOverlay.classList.contains("is-open")) {
      histImgZoom = false;
      closePhotoZoom(true);
    }
   if (!st.pzoodMapZoom && isMapZoomed && (histMapZoom || !(window.peristasiBridge && window.peristasiBridge.hasDualStage))) {
      histMapZoom = false;
      closeMapModal(true);
    }
  });

function ensureBridgeHeaderBar() {
    var backBtn = document.getElementById("pzoodBackToVillageBtn");
    if (backBtn) backBtn.style.display = window.peristasiBridge ? "" : "none";
    if (!window.peristasiBridge) return;
    if (window.peristasiBridge.hasDualStage) {
      var oldBar = document.getElementById("pzoodBridgeBar");
      if (oldBar && oldBar.parentNode) oldBar.parentNode.removeChild(oldBar);
      return;
    }
    if (!rootEl || document.getElementById("pzoodBridgeBar")) return;
    var bar = document.createElement("div");
    bar.id = "pzoodBridgeBar";
    bar.className = "pzood-bridge-bar";
    bar.innerHTML =
      '<div class="pzood-bridge-kicker">\uD83C\uDF38 Ειδικός Χάρτης Προσκυνήματος: Παναγία Ζωοδόχος Πηγή (~1,2 χλμ από το Σχολείο)</div>' +
      '<div class="pzood-bridge-actions">' +
        '<button type="button" class="pzood-bridge-up-btn" data-pzood-go-village="1">\u2B05 Πίσω στον Χάρτη Γειτονιάς</button>' +
      '</div>';
    rootEl.insertBefore(bar, rootEl.firstChild);
    bar.addEventListener("click", function(e) {
      if (e.target.closest("[data-pzood-go-village]")) {
        execZoodBridgeKey("village", e.detail === 0, true);
      }
    });
  }

  function ensureZoodMounted() {
    if (!mapWrap) buildZoodochosMap();
    ensureBridgeHeaderBar();
    return mapWrap;
  }

function syncHostZoomState(zoomed) {
    var nextZ = !!zoomed;
    var sceneOn = isZoodSceneSelected();
    isMapZoomed = nextZ;
    walkDimsDirty = true;
    if (nextZ) {
      mapZoomOpenedAt = performance.now();
      if (mapWrap) {
        if (sceneOn) mapWrap.classList.remove("is-paused");
        else mapWrap.classList.add("is-paused");
        mapWrap.classList.add("is-zoomed");
      }
      if (mapZoomBtn) mapZoomBtn.textContent = "\u2715 Κλείσιμο";
      if (mapStatusEl && mapStatusEl._refs && curStatusAction === "card") {
        mapStatusEl._refs.actBtn.textContent = "\uD83D\uDCD6 Δες την Κάρτα \u279C";
      }
    } else {
      if (mapWrap) {
        mapWrap.classList.remove("is-zoomed");
        if (!sceneOn) mapWrap.classList.add("is-paused");
      }
      var mSc = document.getElementById("pzoodMapScroll");
      if (mSc) { mSc.scrollLeft = 0; mSc.scrollTop = 0; }
      unlockPageScroll();
      if (mapZoomBtn) mapZoomBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";
      if (mapStatusEl && mapStatusEl._refs && curStatusAction === "card") {
        mapStatusEl._refs.actBtn.textContent = "\uD83D\uDCD6 Δες την Κάρτα \u2193";
      }
    }
    if (detActive && !detWaiting) {
      var dFb = document.querySelector("#pzoodQuizStage .pzood-det-fb:not(.is-warn):not(.is-win)");
      if (dFb) dFb.innerHTML = getDetPrompt();
    }
  }

 function setZoodPillsVisible(vis, animateIn) {
    if (!rootEl) return;
    if (vis) {
      var wasHid = !isZoodRootVisible();
      rootEl.style.display = "block";
      rootEl.setAttribute("aria-hidden", "false");
      ensureZoodMounted();
      if (wasHid && animateIn !== false) {
        rootEl.classList.remove("is-revealing");
        void rootEl.offsetWidth;
        rootEl.classList.add("is-revealing");
      }
      if (mapWrap) mapWrap.classList.remove("is-paused");
   } else {
      pendingModalReturn = null;
      clearZoodPendingTimers();
      if (isDetActive()) stopDetective(false, true);
      stopAllTours(true);
      stopWalkAnim(false);
      closeSpotCard(true, false);
      if (mapWrap) {
        mapWrap.classList.remove("is-touch-busy");
        mapWrap.classList.add("is-paused");
      }
      rootEl.style.display = "none";
      rootEl.setAttribute("aria-hidden", "true");
      rootEl.classList.remove("is-revealing");
    }
  }

 function prepareZoodSlideIn(opts) {
    var o = opts || {};
    pendingModalReturn = null;
    clearZoodPendingTimers();
    zoodRevealGraceUntil = performance.now() + 3200;
    ensureZoodMounted();
    if (o.travelMode === "walk" || o.travelMode === "bike") travelMode = o.travelMode;
    if (isDetActive()) stopDetective(false, true);
    stopAllTours(true);
    stopWalkAnim(false);
    if (mapWrap) mapWrap.classList.remove("is-paused");

    if (o.era === "1941") {
      setMapEra(true, true);
      var hTarget = typeof o.histIdx === "number" ? ((o.histIdx % hist1941Stops.length) + hist1941Stops.length) % hist1941Stops.length : 1;
      var hs = hist1941Stops[hTarget] || hist1941Stops[1];
      activeHistIdx = hTarget;
      activeSpecialKey = "";
      spatialBridgeHistIdx = -1;
      syncWalkerAppearance();
      syncSvgActiveFx();
      if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
      if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
      if (mapWalkPath) mapWalkPath.setAttribute("d", "");
      if (mapPulseRing) {
        mapPulseRing.setAttribute("cx", String(hs.cx));
        mapPulseRing.setAttribute("cy", String(hs.cy));
        mapPulseRing.setAttribute("stroke", hs.color);
        mapPulseRing.style.display = "";
      }
     var hsFb = hs.img === photoShrinePan ? photoGroveArea : photoShrinePan;
      if (o.fromVillageWalk !== false) {
        if (mapWalkerEl) {
          mapWalkerEl.style.display = "";
          setWalkerPos(56, 220, -1);
        }
        lastTargetX = 56;
        lastTargetY = 220;
        setStatusBar(
          "\uD83C\uDF5E <strong>Φτάσαμε από τον χωματόδρομο της Περίστασης (~1,2 χλμ):</strong> " + (travelMode === "bike" ? hs.bike : hs.walk),
          "photo", hs.img, hs.cap,
          { steps: 1800, meters: 1200, bikeTime: "~15 λεπτά", crossRoad: !!hs.crossRoad, safety: hs.safety, bikeSafety: hs.bikeSafety },
          buildHistChips(hTarget), hsFb
        );
       var arrPts = hTarget === 0 ? [[56, 220], [620, 218], [760, 128], [842, 78]]
          : (hTarget === 1 ? [[56, 220], [268, 218], [268, 118]]
          : (hTarget === 3 ? [[56, 220], [442, 220], [442, 262]]
          : (hTarget === 4 ? [[56, 220], [442, 220], [442, 286], [648, 286], [692, 352]]
        : (hTarget === 5 ? [[56, 220], [442, 220], [442, 284], [340, 284]]
          : [[56, 220], [508, 220], [562, 158]]))));
        return function() {
          runMapWalk({
            dur: 1750, cx: hs.cx, cy: hs.cy, color: hs.color,
            steps: 1800, meters: 1200, bikeTime: "~15 λεπτά",
            crossRoad: !!hs.crossRoad, crossPt: hs.crossPt || null,
            pts: arrPts
          });
        };
      }
      if (mapWalkerEl) {
        var hWp0 = hs.walkerPt || (hs.pts && hs.pts[0]) || [792, 92];
        mapWalkerEl.style.display = "";
        setWalkerPos(hWp0[0], hWp0[1], 1);
      }
      setStatusBar(
        "\uD83D\uDE80\u2794\uD83D\uDD70\uFE0F <strong>Στο ίδιο σημείο την Άνοιξη του 1941:</strong> " + (travelMode === "bike" ? hs.bike : hs.walk),
        "photo", hs.img, hs.cap,
        { steps: hs.steps, meters: hs.meters, bikeTime: hs.bikeTime, crossRoad: hs.crossRoad, safety: hs.safety, bikeSafety: hs.bikeSafety },
        buildHistChips(hTarget), hsFb
      );
      lastTargetX = hs.cx;
      lastTargetY = hs.cy;
      return function() { selectHistStop(hTarget, true); };
    }

    if (typeof o.spotIdx === "number") {
      setMapEra(false, true);
      var clSp = ((o.spotIdx % spotsData.length) + spotsData.length) % spotsData.length;
      var smSp = spotMapMeta[clSp] || spotMapMeta[0];
      openSpotCard(clSp, false);
      stopWalkAnim(false);
      if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
      if (mapWalkPath) mapWalkPath.setAttribute("d", "");
      if (mapWalkerEl) {
        var spWp0 = smSp.walkerPt || (smSp.pts && smSp.pts[0]) || [604, 172];
        mapWalkerEl.style.display = "";
        setWalkerPos(spWp0[0], spWp0[1], 1);
      }
      lastTargetX = smSp.cx;
      lastTargetY = smSp.cy;
      return function() {
        syncModernMap(clSp, true);
        if (o.scrollToCard && o.noScroll !== true && !isMapZoomed && window.peristasiBridge && typeof window.peristasiBridge.switchDualScene === "function" && stageEl && stageEl.firstElementChild) {
          stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
    }

    if (o.startTour) {
      if (isPastEra) setMapEra(false, true);
      closeSpotCard(true, false);
      syncModernMap(-1, true);
      lastTargetX = 636;
      lastTargetY = 156;
      return function() { startModernTour(); };
    }

   if (o.fromVillageWalk === false || o.inPlaceSlide === false) {
      if (isPastEra) setMapEra(false, true);
      closeSpotCard(true, false);
      syncModernMap(-1, true);
      lastTargetX = 636;
      lastTargetY = 156;
      return null;
    }

    if (isPastEra) setMapEra(false, true);
    closeSpotCard(true, false);
    stopAllTours(true);
    stopWalkAnim(false);
    activeSpecialKey = "";
    spatialBridgeHistIdx = -1;
    tourActiveSpotIdx = 0;
    markSpotExplored(0);
    justCompletedAll8 = false;
    syncWalkerAppearance();
    syncSvgActiveFx();
    var sp0 = spotsData[0];
    var sm0 = spotMapMeta[0];
    if (mapCrossAlertEl) mapCrossAlertEl.style.display = "none";
    if (mapWalkBgPath) mapWalkBgPath.setAttribute("d", "");
    if (mapWalkPath) mapWalkPath.setAttribute("d", "");
    if (mapWalkerEl) {
          mapWalkerEl.style.display = "";
          setWalkerPos(56, 220, -1);
        }
    if (mapPulseRing) {
      mapPulseRing.setAttribute("cx", "636");
      mapPulseRing.setAttribute("cy", "156");
      mapPulseRing.setAttribute("stroke", sp0.accent);
      mapPulseRing.style.display = "";
    }
    lastTargetX = 56;
    lastTargetY = 220;
    setStatusBar(
      (travelMode === "bike" ? "\uD83D\uDEB2" : "\u26E9\uFE0F") + " <strong>Φτάσαμε από την Περίσταση (~1,2 χλμ)</strong> στο πλάτωμα &amp; την Πέτρινη Τοξωτή Πύλη! <span class=\"pzood-status-yr\">" + sp0.eraTag + "</span>",
      "card", sp0.img, sp0.imgCap,
      { steps: 1800, meters: 1200, bikeTime: "~4 λεπτά", crossRoad: false, safety: sm0.safety, bikeSafety: sm0.bikeSafety },
      "", sp0.fallbackImg
    );
    return function() {
      runMapWalk({
        dur: 1700, cx: 636, cy: 156, color: sp0.accent,
        steps: 1800, meters: 1200, bikeTime: "~4 λεπτά",
        crossRoad: false, crossPt: null,
        pts: [[56, 220], [584, 220], [636, 156]]
      });
    };
  }

 function closeZoodOverlays(fromExternal) {
    var steps = 0;
    if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
      if (!fromExternal && histImgZoom) steps++;
      histImgZoom = false;
      closePhotoZoom(true);
    }
    if (isMapZoomed && !(window.peristasiBridge && window.peristasiBridge.hasDualStage)) {
      if (!fromExternal && histMapZoom) steps++;
      histMapZoom = false;
      closeMapModal(true);
    }
    if (!fromExternal && steps > 0) {
      safeBack(steps);
    } else if (fromExternal) {
      try {
        if (window.history.state && (window.history.state.pzoodZoom || window.history.state.pzoodMapZoom)) {
          var cleanSt = Object.assign({}, window.history.state);
          delete cleanSt.pzoodZoom;
          delete cleanSt.pzoodMapZoom;
          window.history.replaceState(Object.keys(cleanSt).length ? cleanSt : null, "", window.location.href);
        }
      } catch (e) {}
    }
  }
 function hideZoodSection(scrollToVillage, fromKb) {
    if (window.peristasiBridge && typeof window.peristasiBridge.switchDualScene === "function") {
      window.peristasiBridge.switchDualScene("village", {
        era1941: isPastEra,
        travelMode: travelMode,
        fromWalk: true,
        fromKb: !!fromKb,
        inPlaceSlide: true,
        noScroll: !scrollToVillage
      });
      return;
    }
    setZoodPillsVisible(false);
  }

  function revealZoodSection(opts) {
    var o = opts || {};
    if (window.peristasiBridge && typeof window.peristasiBridge.switchDualScene === "function") {
      window.peristasiBridge.switchDualScene("zood", o);
      return;
    }
    var runAfter = prepareZoodSlideIn(o);
    setZoodPillsVisible(true, true);
    requestAnimationFrame(function() {
      if (runAfter) {
        arrivalWalkTimer = setTimeout(function() { arrivalWalkTimer = null; runAfter(); }, 220);
      }
      if (o.noScroll !== true) {
        var scrollTarget = (o.scrollToCard && stageEl && stageEl.firstElementChild) ? stageEl : rootEl;
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (mapWrap) {
        mapWrap.classList.add("is-bridge-glow");
        setTimeout(function() { if (mapWrap) mapWrap.classList.remove("is-bridge-glow"); }, 2200);
      }
      if (o.fromKb) {
        var fTarget = (mapWrap && mapWrap.querySelector(o.era === "1941" ? ".pzood-hist-node" : '[data-zmap-spot="0"]')) || document.getElementById("pzoodMapZoomBtn");
        if (fTarget && fTarget.focus) { try { fTarget.focus({ preventScroll: true }); } catch (err) { fTarget.focus(); } }
      }
    });
  }

 if (isZoodRootVisible()) {
    ensureZoodMounted();
  }
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      if (isZoodRootVisible()) ensureZoodMounted();
    });
  }
  window.addEventListener("load", function() {
    if (isZoodRootVisible()) ensureZoodMounted();
  });

 window.pzoodWidget = {
    reveal: revealZoodSection,
    hide: hideZoodSection,
    cancelModalReturn: function() { pendingModalReturn = null; },
    isVisible: isZoodRootVisible,
    closeOverlays: closeZoodOverlays,
    ensureMounted: ensureZoodMounted,
    getMapWrap: ensureZoodMounted,
    syncHostZoom: syncHostZoomState,
    setPillsVisible: setZoodPillsVisible,
    prepareSlideIn: prepareZoodSlideIn,
    snapCameraToTarget: function() {
      walkDimsDirty = true;
      scrollZoomedMapTo(lastTargetX, lastTargetY, false);
    },
    focusInitialNode: function(era1941) {
      var fTarget = (mapWrap && mapWrap.querySelector(era1941 ? ".pzood-hist-node" : '[data-zmap-spot="0"]')) || document.getElementById("pzoodMapZoomBtn");
      if (fTarget && fTarget.focus) { try { fTarget.focus({ preventScroll: true }); } catch (err) { fTarget.focus(); } }
    },
    getState: function() {
      return { isPastEra: isPastEra, travelMode: travelMode };
    },
    hasInlineOpen: function() {
      if (!isZoodRootVisible()) return false;
      var mHost = document.getElementById("pzoodMirrorStage");
      return !!((mHost && mHost.style.display === "block") || isDetActive() || activeSpotIdx !== -1 || isZoodBusy());
    },
    openSpot: function(idx, scroll) {
      revealZoodSection({ spotIdx: typeof idx === "number" ? idx : 0, noScroll: scroll === false, scrollToCard: scroll !== false });
    },
    openMapModal: function() {
      if (window.peristasiBridge && typeof window.peristasiBridge.switchDualScene === "function") {
        window.peristasiBridge.switchDualScene("zood", { noScroll: true, inPlaceSlide: false, fromVillageWalk: false });
        requestAnimationFrame(openMapModal);
        return;
      }
      if (!isZoodRootVisible()) revealZoodSection({ era: "modern", noScroll: true, fromVillageWalk: false });
      else ensureZoodMounted();
      requestAnimationFrame(openMapModal);
    },
    startTour: function() { revealZoodSection({ startTour: true }); },
    show1941: function(histIdx) { revealZoodSection({ era: "1941", histIdx: typeof histIdx === "number" ? histIdx : 1 }); }
  };
})();
