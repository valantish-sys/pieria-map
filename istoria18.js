
  /* ================= ΠΑΙΔΙΚΟΣ ΕΞΕΡΕΥΝΗΤΗΣ ΠΕΡΙΣΤΑΣΗΣ ================= */
  (function() {
    "use strict";

    var modal = document.getElementById("peristasiExplorerModal");
    var modalBody = document.getElementById("pexpModalBody");
    var zoomOverlay = document.getElementById("pexpImgZoom");
    var zoomTarget = document.getElementById("pexpImgZoomTarget");
    var zoomCap = document.getElementById("pexpImgZoomCap");
    if (!modal) return;

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
    var closeCapsuleMode = function() {};
    var resetCapsuleView = function() {};
    var openMirrorInModal = function() {};
    var stopCartGame = function() {};
    var stopOlympusGame = function() {};
    var hasActiveSubGame = function() { return false; };
    var isOlympusGuessing = function() { return false; };
    var openPopulationAtYear = function() {};
    var activeRootKey = "";
    var mirrorOpen = false;

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
        ".pfac-map-wrap.is-zoomed .pfac-map-svg{cursor:default}" +
        ".pfac-map-node{cursor:pointer}" +
        ".pfac-map-node circle{transition:stroke-width .15s}" +
        ".pfac-map-node:hover circle{stroke-width:4.5px}" +
        ".pfac-map-lbl{paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-width:3.5px;stroke-linejoin:round;font-family:system-ui,-apple-system,sans-serif}" +
        ".pfac-map-road-lbl{paint-order:stroke;stroke:#cbd5e1;stroke-width:4px;stroke-linejoin:round;font-family:system-ui,-apple-system,sans-serif}" +
        ".pfac-map-status{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding:9px 13px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;font-size:13.5px;font-weight:700;text-align:left}" +
        ".pfac-map-goto-btn{border:none;background:#1e6cff;color:#fff;font-size:12px;font-weight:800;padding:5px 12px;border-radius:999px;cursor:pointer;font-family:inherit}";
      document.head.appendChild(extraCss);
    }

    var schoolMirrorScenes = [
      {
        tab: "\uD83C\uDFEB 1. Η Αίθουσα",
        oldIcons: "\uD83E\uDDF1 \uD83D\uDD25 \uD83E\uDEB5",
        oldTitle: "Πλίνθινη Αίθουσα & Ξυλόσομπα",
        oldDesc: "Μικρή τάξη με τούβλα από χώμα και άχυρο! Δύο-τρεις τάξεις έκαναν μάθημα μαζί (συνδιδασκαλία) σε ξύλινα θρανία και ζεσταίνονταν με την ξυλόσομπα, όπου κάθε παιδί έφερνε κι ένα κούτσουρο από το σπίτι.",
        newIcons: "\uD83C\uDFEB \uD83D\uDDA5\uFE0F \uD83C\uDFA8",
        newTitle: "12/θέσιο Σύγχρονο Διδακτήριο",
        newDesc: "Μεγάλο, φωτεινό σχολείο με πέτρινο κτίριο και νέα πτέρυγα! Έχουμε 12 τμήματα, διαδραστικούς πίνακες, εργαστήριο υπολογιστών, αίθουσα ζωγραφικής, μουσικής, ολοήμερου και μεγάλη αίθουσα εκδηλώσεων!"
      },
      {
        tab: "\uD83C\uDF92 2. Η Σχολική Τσάντα",
        oldIcons: "\uD83E\uDDF6 \uD83E\uDEA8 \uD83D\uDCD6",
        oldTitle: "Υφαντό Ταγάρι, Πλάκα & Κοντύλι",
        oldDesc: "Κρεμούσαν στον ώμο το μάλλινο υφαντό «ταγάρι» της γιαγιάς! Μέσα είχε τη μαύρη πέτρινη πλάκα, το πετροκοντύλι για να γράφουν, ένα βρεγμένο σφουγγαράκι για να σβήνουν και ένα μόνο Αναγνωστικό.",
        newIcons: "\uD83C\uDF92 \uD83E\uDD16 \uD83D\uDCDA",
        newTitle: "Βιβλία, Ψηφιακή Βιβλιοθήκη & Ρομποτική",
        newDesc: "Ανατομική πολύχρωμη τσάντα με τετράδια και χρώματα, Δανειστική Βιβλιοθήκη, Ψηφιακή Βιβλιοθήκη με 350 δωρεάν παιδικά βιβλία και σετ εκπαιδευτικής ρομποτικής!"
      },
      {
        tab: "\u26BD 3. Το Διάλειμμα",
        oldIcons: "\uD83E\uDDF6 \uD83C\uDFC3 \uD83E\uDEA8",
        oldTitle: "Πάνινο Τόπι & Βόλοι στην Αλάνα",
        oldDesc: "Στη χωμάτινη αυλή έπαιζαν γυάλινους βόλους, κουτσό χαραγμένο με κεραμίδι στο χώμα, σχοινάκι, τυφλόμυγα και ποδόσφαιρο με «τόπι» φτιαγμένο από παλιά πανιά δεμένα σφιχτά!",
        newIcons: "\uD83C\uDFC0 \uD83C\uDFD0 \u265F\uFE0F",
        newTitle: "Γήπεδα, Γυμναστήριο & Πρωτιές στο Σκάκι",
        newDesc: "Μεγάλη ασφαλής αυλή με γήπεδα μπάσκετ, ποδοσφαίρου και βόλεϊ, κλειστό γυμναστήριο και σκακιέρες \u2014 με το σχολείο μας στη 2η θέση στο σκάκι ανάμεσα στα Δημοτικά όλης της Κατερίνης!"
      },
      {
        tab: "\uD83D\uDD14 4. Μάθημα & Κολατσιό",
        oldIcons: "\uD83D\uDD14 \uD83D\uDD8B\uFE0F \uD83C\uDF5E",
        oldTitle: "Μπρούτζινο Κουδούνι, Μελάνι & Ψωμί",
        oldDesc: "Ο δάσκαλος χτυπούσε το κουδούνι με το χέρι! Τα μεγαλύτερα παιδιά έγραφαν καλλιγραφία με πένα και μελανοδοχείο, πότιζαν τον σχολικό κήπο και έτρωγαν ζυμωτό ψωμί με τυρί ή ελιές.",
        newIcons: "\uD83C\uDF0D \uD83C\uDFCA \uD83C\uDF4E",
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
            '<h5 class="pexp-era-title">' + sc.oldTitle + '</h5>' +
            '<p class="pexp-era-desc">' + sc.oldDesc + '</p>' +
          '</div>';

        var card2026 =
          '<div class="pexp-era-card pexp-era-2026">' +
            '<div class="pexp-era-head">' +
              '<span class="pexp-era-yr">\uD83D\uDE80 2026 \u2022 Σήμερα στο 12/Θ</span>' +
              '<span class="pexp-era-icons">' + sc.newIcons + '</span>' +
            '</div>' +
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

    function bindSwipe(el, onSwipeLeft, onSwipeRight) {
      if (!el) return;
      var sx = 0, sy = 0, multi = false, ignore = false;
      el.addEventListener("touchstart", function(e) {
        if (e.touches.length > 1) { multi = true; return; }
        var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
        ignore = (tag === "input" || tag === "select" || tag === "textarea" || hasHorizontalScroll(e.target, el));
        multi = false;
        sx = e.touches[0].screenX;
        sy = e.touches[0].screenY;
      }, { passive: true });

      el.addEventListener("touchmove", function(e) {
        if (e.touches.length > 1) multi = true;
      }, { passive: true });

      el.addEventListener("touchend", function(e) {
        if (multi || ignore || e.touches.length > 0) return;
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

    modal.querySelectorAll("img").forEach(function(img) {
      img.addEventListener("error", function() {
        if (this.src !== fallbackSvg) this.src = fallbackSvg;
      });
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src") && img.src.indexOf("data:image/") !== 0) {
        img.src = fallbackSvg;
      }
    });

    /* Μεγέθυνση φωτογραφίας με πλοήγηση (κουμπιά, swipe, βελάκια) */
    var zoomList = [];
    var zoomIdx = 0;
    var zoomPrevBtn = null;
    var zoomNextBtn = null;

   var blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    function closeZoom(fromPopState) {
      if (!zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
      zoomOverlay.classList.remove("is-open");
      if (!modal.classList.contains("is-open")) {
        document.body.style.overflow = "";
      }
      if (!fromPopState && window.history.state && window.history.state.pexpZoom) {
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

      zoomCloseBtn.addEventListener("click", function(e) { e.stopPropagation(); closeZoom(false); });
      zoomPrevBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(-1); });
      zoomNextBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(1); });
      zoomOverlay.addEventListener("click", function() { closeZoom(false); });
      bindSwipe(zoomOverlay, function() { stepZoom(1); }, function() { stepZoom(-1); });
    }

    function openZoomWithList(list, startIndex) {
      if (!list || !list.length || !zoomOverlay) return;
      var wasOpen = zoomOverlay.classList.contains("is-open");
      zoomList = list;
      zoomIdx = (startIndex >= 0 && startIndex < list.length) ? startIndex : 0;
      if (zoomOverlay.parentNode !== document.body) {
        document.body.appendChild(zoomOverlay);
      }
      renderZoomItem();
      zoomOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";

      if (!wasOpen) {
        try {
          if (!window.history.state || !window.history.state.pexpZoom) {
            var nextState = { pexpZoom: true };
            if (modal.classList.contains("is-open")) nextState.pexpModal = true;
            window.history.pushState(nextState, "", window.location.href);
          }
        } catch (e) {}
      }
    }

    function renderZoomItem() {
      var item = zoomList[zoomIdx];
      if (!item) return;
      if (zoomTarget) {
        var triedThumb = false;
        zoomTarget.onerror = function() {
          if (!triedThumb && item.thumb && this.src !== item.thumb) {
            triedThumb = true;
            this.src = item.thumb;
          } else if (this.src !== fallbackSvg) {
            this.onerror = null;
            this.src = fallbackSvg;
          }
        };
        if (zoomTarget.src !== item.src) {
          zoomTarget.src = blankGif;
          zoomTarget.src = item.src;
        }
      }
      if (zoomCap) {
        var countSuffix = zoomList.length > 1 ? " (" + (zoomIdx + 1) + "/" + zoomList.length + ")" : "";
        zoomCap.textContent = (item.caption || "") + countSuffix;
      }
      var navDisp = zoomList.length > 1 ? "flex" : "none";
      if (zoomPrevBtn) zoomPrevBtn.style.display = navDisp;
      if (zoomNextBtn) zoomNextBtn.style.display = navDisp;
    }

    function stepZoom(dir) {
      if (zoomList.length <= 1) return;
      zoomIdx = (zoomIdx + dir + zoomList.length) % zoomList.length;
      renderZoomItem();
    }

    modal.addEventListener("click", function(e) {
      var zImg = e.target.closest(".pexp-zoomable");
      if (!zImg || !zImg.src || zImg.src.indexOf("data:image/") === 0) return;
      e.stopPropagation();

      if (zImg.id === "pexpRouteMainImg" && typeof routePhotos !== "undefined" && routePhotos.length) {
        var rList = routePhotos.map(function(p) { return { src: p.src, caption: p.alt || "" }; });
        var rIdx = 0;
        for (var i = 0; i < routePhotos.length; i++) {
          if (zImg.src === routePhotos[i].src || zImg.getAttribute("src") === routePhotos[i].src) {
            rIdx = i;
            break;
          }
        }
        openZoomWithList(rList, rIdx);
      } else if (zImg.id === "pexpChurchMainImg" && churchesData.length) {
        var cList = churchesData.map(function(c) { return { src: c.img, caption: c.caption }; });
        openZoomWithList(cList, currentChurchIdx);
      } else {
        var scope = zImg.closest(".pexp-pane") || modal;
        var candidates = scope.querySelectorAll(".pexp-zoomable");
        var gList = [];
        var gIdx = 0;
        candidates.forEach(function(el) {
          if (el.src && el.src.indexOf("data:image/") !== 0 && el.offsetParent !== null) {
            if (el === zImg) gIdx = gList.length;
            gList.push({ src: el.src, caption: el.alt || "" });
          }
        });
        openZoomWithList(gList, gIdx);
      }
    });

    /* Ενιαίο Lightbox στις ιστορικές φωτογραφίες & τον χάρτη της σελίδας */
    var historyWrap = document.querySelector(".school-history-wrapper") || document;
    var pageImageLinks = historyWrap.querySelectorAll("a.image-link");
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

    /* Ζωντανή Γέφυρα από τα 4 κουτιά της Χρονογραμμής στη Χρονομηχανή */
    var timelineEvents = historyWrap.querySelectorAll(".timeline-event");
    var tlDefaultYears = [1924, 1926, 1961, 1981];
    timelineEvents.forEach(function(evEl, idx) {
      if (evEl.querySelector(".pexp-tl-actions")) return;
      var dateSpan = evEl.querySelector(".timeline-date");
      var dateTxt = dateSpan ? dateSpan.textContent : "";
      var targetYr = tlDefaultYears[idx] || 1924;
      if (dateTxt.indexOf("1952") !== -1 || dateTxt.indexOf("1965") !== -1) targetYr = 1961;
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

    function stopRouteAutoplay() {
      if (routeTimer) {
        clearInterval(routeTimer);
        routeTimer = null;
      }
      var rBtn = document.getElementById("pexpPlayRouteBtn");
      if (rBtn) {
        rBtn.textContent = "\u25B6\uFE0F Παίξε το Ταξίδι!";
        rBtn.classList.remove("is-playing");
      }
    }

   function activateTab(tabName) {
      if (!panes[tabName]) tabName = "population";
      stopPopAutoplay();
      stopRouteAutoplay();
      stopCartGame();
      stopOlympusGame();
      closeRootBubble();
      resetCapsuleView();
      currentTab = tabName;

      tabBtns.forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-tab") === tabName);
      });
      Object.keys(panes).forEach(function(k) {
        if (panes[k]) panes[k].classList.toggle("is-active", k === tabName);
      });
      if (modalBody) modalBody.scrollTop = 0;

      if (tabName === "route" && !routeReady) {
        routeReady = true;
        renderStop(4, false);
      } else if (tabName === "elevation") {
        if (!elevReady) {
          elevReady = true;
          selectZone(1);
        }
        if (!weatherLoaded) loadLiveTemperatures();
      } else if (tabName === "churches" && !churchesReady) {
        churchesReady = true;
        renderChurch(0);
      }
    }

    tabBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        activateTab(btn.getAttribute("data-tab"));
      });
    });

    window.openPeristasiModal = function(initialTab) {
      if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        zoomOverlay.classList.remove("is-open");
      }
      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      if (zoomOverlay && zoomOverlay.parentNode !== document.body) document.body.appendChild(zoomOverlay);

      activateTab(initialTab || "population");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      try {
        if (window.history.state && window.history.state.pexpZoom) {
          window.history.replaceState({ pexpModal: true }, "", window.location.href);
        } else if (!window.history.state || !window.history.state.pexpModal) {
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
      closeRootBubble();
      resetCapsuleView();

      var hadZoomState = !!(window.history.state && window.history.state.pexpZoom);
      if (zoomOverlay) zoomOverlay.classList.remove("is-open");
      if (modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      if (!fromPopState && window.history.state && window.history.state.pexpModal) {
        try { window.history.go(hadZoomState ? -2 : -1); } catch (e) {}
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
        } else if (modal.classList.contains("is-open") && hasActiveSubGame()) {
          closeRootBubble();
          resetCapsuleView();
          stopCartGame();
          stopOlympusGame();
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

      if (activeFacIdx !== -1 && pfacStage) {
        var stRect = pfacStage.getBoundingClientRect();
        if (stRect.bottom > 0 && stRect.top < window.innerHeight) {
          e.preventDefault();
          openFacilityCard(activeFacIdx + dir, false);
        }
      }
    });
   window.addEventListener("popstate", function() {
      if (zoomOverlay && zoomOverlay.classList.contains("is-open") && !(window.history.state && window.history.state.pexpZoom)) {
        closeZoom(true);
      }
      if (modal.classList.contains("is-open") && !(window.history.state && window.history.state.pexpModal)) {
        closePeristasiModal(true);
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
      { year: 1961, pop: 1130, story: "1961: Με 1.130 κατοίκους, όλο το χωριό χαίρεται γιατί χτίζεται από πέτρα το νέο διώροφο διδακτήριο του σχολείου μας (1960\u20131965)!" },
      { year: 1971, pop: 1176, story: "1971: Έρχονται στο χωριό μας Έλληνες Πόντιοι από την πρώην Σοβιετική Ένωση! Παράλληλα φτιάχνονται οι δύο πρώτες ποδοσφαιρικές ομάδες, ο «Όλυμπος» και η «Αναγέννηση»." },
      { year: 1981, pop: 1491, story: "1981: Φτάνουμε τους 1.491 κατοίκους! Οι δύο ομάδες ενώνονται στην αγαπημένη μας Α.Ε. Περίστασης (Α.Ε.Π.) και στο σχολείο μας φιλοξενείται και το Γυμνάσιο." },
      { year: 1991, pop: 1730, story: "1991: Νέες οικογένειες Ποντίων από τη Γεωργία, την Αρμενία, τη Ρωσία και το Καζακστάν ριζώνουν στην Περίσταση και οι γειτονιές γεμίζουν παιδιά (1.730 κάτοικοι)!" },
      { year: 2001, pop: 2232, story: "2001: Το χωριό ξεπερνά τις 2.200 ψυχές! Ιδρύεται ο Σύλλογος Ανατολικοθρακών και λίγο αργότερα (2005\u20132006) προστίθεται η καινούργια πτέρυγα του σχολείου μας." },
      { year: 2011, pop: 2545, story: "2011: Το μεγάλο ρεκόρ της Περίστασης με 2.545 κατοίκους! Το χωριό μας ανήκει πλέον στον Δήμο Κατερίνης." },
      { year: 2021, pop: 2367, story: "Σήμερα (2.367 κάτοικοι): Ένα ζωντανό, μεγάλο χωριό με Παιδικό Σταθμό, Νηπιαγωγείο, το 12/θέσιο Δημοτικό μας, Γυμνάσιο και γήπεδα, όπου Θρακιώτες, Πόντιοι, Βλάχοι και Σκοτεινιώτες είμαστε μια αγκαλιά!" }
    ];

  var popSlider = document.getElementById("pexpPopSlider");
    var yearVal = document.getElementById("pexpYearVal");
    var popVal = document.getElementById("pexpPopVal");
    var scaleVal = document.getElementById("pexpScaleVal");
    var housesGrid = document.getElementById("pexpHousesGrid");
    var popStory = document.getElementById("pexpPopStory");
    var popChipsWrap = document.getElementById("pexpPopChips");

    if (popChipsWrap) {
      [
        { yr: 1926, label: "\uD83C\uDF82 1926" },
        { yr: 1961, label: "1961" },
        { yr: 1981, label: "1981" }
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

    if (housesGrid) {
      housesGrid.innerHTML =
        '<span class="pexp-house-big pexp-house-landmark" title="Ι.Ν. Αγίου Γεωργίου">\u26EA</span>' +
        '<span class="pexp-house-big pexp-house-landmark" title="Το Σχολείο μας">\uD83C\uDFEB</span>';
    }

    var numFmt = (typeof Intl !== "undefined" && Intl.NumberFormat) ? new Intl.NumberFormat("el-GR") : null;
    var renderedHouseCount = 0;

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

      var buses = Math.max(3, Math.round(info.pop / 50));
      if (scaleVal) scaleVal.textContent = "\uD83D\uDE8C Όσο " + buses + " σχολικά λεωφορεία!";

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

      for (var k = 2; k < housesGrid.children.length; k++) {
        var hEl = housesGrid.children[k];
        var hIdx = k - 2;
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
      }

      if (rootVlach) rootVlach.classList.toggle("is-unlocked", yr >= 1947);
      if (rootPontic) rootPontic.classList.toggle("is-unlocked", yr >= 1965);
      if ((activeRootKey === "vlach" && yr < 1947) || (activeRootKey === "pontic" && yr < 1965)) {
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
          mirrorModalBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
        if (scaleVal) scaleVal.textContent = "\u2728 Πλάθουμε τον επόμενο αιώνα!";
        if (popStory) {
          popStory.textContent = "1926\u20132026: Ένας αιώνας από το πρώτο μας σχολείο! Τώρα η σκυτάλη περνάει σε εσάς: φτιάξε παρακάτω τη Χρονοκάψουλα της Περίστασης για τους μαθητές του 2126!";
        }

        capsuleBox.style.display = "block";
        drawCapsuleBox();
        requestAnimationFrame(function() {
          capsuleBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

    /* Διαδραστικά Σπιτάκια & Ρίζες Καταγωγής */
    var rootsCatalog = {
      thrace: {
        title: "\uD83D\uDFE6 Ρίζες από την Ανατολική Θράκη (1922\u20131924)",
        accent: "#1d4ed8", border: "#93c5fd", bg: "#eff6ff",
        desc: "Οι πρόσφυγες προπαππούδες μας από την παλιά Περίσταση της Προποντίδας έφεραν το έθιμο της εικόνας του Αγίου Μόδεστου, τη θρακιώτικη γκάιντα, τον ζωηρό χορό «Ζωναράδικο» και τις νόστιμες θρακιώτικες πίτες!",
        tags: ["\uD83D\uDDBC\uFE0F Έθιμο Αγ. Μόδεστου", "\uD83D\uDC83 Χορός Ζωναράδικο", "\uD83E\uDD67 Θρακιώτικες Πίτες & Κουσκούσι"]
      },
      vlach: {
        minYear: 1951,
        title: "\uD83D\uDFE7 Σκοτεινά Πιερίας & Βλάχοι (1947\u20131951)",
        accent: "#c2410c", border: "#fdba74", bg: "#fff7ed",
        desc: "Οι οικογένειες από τα ορεινά Σκοτεινά (Μόρνα) και οι Βλάχοι έφεραν την αγάπη για το βουνό των Πιερίων, τους λεβέντικους κυκλικούς χορούς στα πανηγύρια, την τέχνη των υφαντών και τις παραδοσιακές χορτόπιτες!",
        tags: ["\u26F0\uFE0F Ορεινή Παράδοση Πιερίων", "\uD83E\uDDF6 Υφαντά & Κεντήματα", "\uD83C\uDFB6 Κύκλιοι Χοροί"]
      },
      pontic: {
        minYear: 1971,
        title: "\uD83D\uDFE9 Ελληνισμός του Πόντου (1965 & 1990)",
        accent: "#047857", border: "#6ee7b7", bg: "#ecfdf5",
        desc: "Οι Πόντιοι συγχωριανοί μας ζωντάνεψαν τις γειτονιές με τον ήχο της ποντιακής λύρας (κεμεντζέ), τους περήφανους χορούς «Τικ», «Κοτσαρί» και «Σέρα» και αγαπημένα εδέσματα όπως τα πιροσκί και τα ωτία!",
        tags: ["\uD83C\uDFBB Ποντιακή Λύρα", "\uD83D\uDD25 Χοροί Σέρα & Κοτσαρί", "\uD83E\uDD5F Πιροσκί, Ωτία & Σορβάς"]
      },
      church: {
        title: "\u26EA Ι.Ν. Αγίου Γεωργίου & Μοδέστου (από το 1924)",
        accent: "#4f46e5", border: "#a5b4fc", bg: "#eef2ff",
        desc: "Το πρώτο ιερό κτίσμα που έφτιαξαν οι πρόσφυγες μόλις έφτασαν εδώ, για να στεγάσουν τα 18 κιβώτια με τα ιερά κειμήλια της Προποντίδας!",
        tags: ["\uD83D\uDCE6 Κειμήλια 1922", "\uD83D\uDD14 Καρδιά της Ενορίας"],
        ctaTab: "churches",
        ctaText: "\u26EA Δες την Καρτέλα των Εκκλησιών \u279C"
      },
      school: {
        title: "\uD83C\uDFEB 100 Χρόνια Δημοτικό Σχολείο (1926\u20132026)",
        accent: "#0284c7", border: "#7dd3fc", bg: "#f0f9ff",
        desc: "Από το πρώτο μικρό πλίνθινο σχολείο με τις 2 αίθουσες, στο πέτρινο διδακτήριο του 1965 και στο σημερινό 12/θέσιο σχολείο μας!",
        tags: ["\uD83C\uDF82 100 Χρόνια Παιδείας", "\uD83D\uDCD6 4 Γενιές Μαθητών"]
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
        rootBubble.innerHTML =
          '<div class="pexp-root-pop-top">' +
            '<span class="pexp-root-pop-title">' + data.title + '</span>' +
            '<button type="button" class="pexp-root-pop-close" data-close-root="1" title="Κλείσιμο">\u2715</button>' +
          '</div>' +
          '<div class="pexp-root-pop-desc">' + data.desc + '</div>' +
          '<div class="pexp-root-pop-tags">' + tagsHtml + '</div>' +
          ctaHtml;
      }

      var detectRootTarget = function(target) {
        if (target.closest("#pexpRootThrace")) return { key: "thrace", badge: true };
        if (target.closest("#pexpRootVlach")) return { key: "vlach", badge: true };
        if (target.closest("#pexpRootPontic")) return { key: "pontic", badge: true };
        if (target.closest(".pexp-h-thrace")) return { key: "thrace", badge: false };
        if (target.closest(".pexp-h-vlach")) return { key: "vlach", badge: false };
        if (target.closest(".pexp-h-pontic")) return { key: "pontic", badge: false };
        var lm = target.closest(".pexp-house-landmark");
        if (lm) {
          var isChurch = lm.textContent.indexOf("\u26EA") !== -1;
          return { key: isChurch ? "church" : "school", badge: true };
        }
        return null;
      }

      meadowScene.addEventListener("click", function(e) {
        if (e.target.closest("[data-close-root]")) { closeRootBubble(); return; }
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
      });
    });

    var routePhotos = [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/%C5%9Eark%C3%B6yden_Marmara_Adas%C4%B1.jpg",
        alt: "Η ακτή της παλιάς Περίστασης (Σάρκιοϊ) στην Προποντίδα"
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/8/88/Greek_mother_%26_child_waiting_in_camp_at_Salonica_for_continuation_of_journey_from_the_Caucasus_to_Thrace_LCCN2001705752.jpg",
        alt: "Μητέρα με παιδί σε προσφυγικό καταυλισμό της Θεσσαλονίκης (1923)"
      },
      {
        src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        alt: "Η σημερινή Περίσταση Πιερίας και το 12/Θ Δημοτικό Σχολείο μας"
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
        cx: 482, cy: 81, photoIdx: 0,
        badge: "Σταθμός 2 από 5 \u2022 ~100 χλμ.",
        title: "2. Περνώντας τον Ποταμό Έβρο",
        path: "M 567,128 L 482,81",
        story: "Όσες οικογένειες ξεκίνησαν από τη στεριά φόρτωσαν στα κάρα λίγα ρούχα, κουβέρτες και εικονίσματα και πέρασαν με κόπο τον μεγάλο ποταμό Έβρο."
      },
      {
        cx: 278, cy: 78, photoIdx: 1,
        badge: "Σταθμός 3 από 5 \u2022 ~300 χλμ.",
        title: "3. Από τη Θράκη & με Καράβια στο Αιγαίο",
        path: "M 567,128 L 482,81 L 278,78",
        story: "Άλλοι προχωρούσαν στον δρόμο προς την Καβάλα και άλλοι ταξίδευαν με πλοία στο Αιγαίο, κουβαλώντας μαζί τους 18 ξύλινα κιβώτια με τα ιερά κειμήλια των εκκλησιών τους!"
      },
      {
        cx: 121, cy: 124, photoIdx: 1,
        badge: "Σταθμός 4 από 5 \u2022 ~460 χλμ.",
        title: "4. Αντάμωμα στη Θεσσαλονίκη (22 Οκτ. 1922)",
        path: "M 567,128 L 482,81 L 278,78 L 121,124",
        story: "Στη Θεσσαλονίκη συναντήθηκαν όσοι ήρθαν με τα πλοία και όσοι ήρθαν με τα κάρα. Κάποιες οικογένειες έμειναν εκεί, ενώ οι δικοί μας συνέχισαν νότια για την Πιερία!"
      },
      {
        cx: 78, cy: 180, photoIdx: 2,
        badge: "Σταθμός 5 από 5 \u2022 ~500 χλμ. συνολικά",
        title: "5. Νέα Περίσταση Πιερίας: Το Νέο μας Σπίτι!",
        path: "M 567,128 L 482,81 L 278,78 L 121,124 L 78,180",
        story: "Το 1924 ρίζωσαν στον εύφορο κάμπο της Κατερίνης! Έχτισαν τον Αη-Γιώργη και το σχολείο μας και έδωσαν στο χωριό το όνομα της αγαπημένης τους πατρίδας: Περίσταση!"
      }
    ];

    var currentStopIdx = 4;
    var landActive = document.getElementById("pexpLandActive");
    var landBg = document.getElementById("pexpLandBg");
    var seaPath = document.getElementById("pexpSeaPath");
    var activeRing = document.getElementById("pexpActiveRing");
    var mainRouteImg = document.getElementById("pexpRouteMainImg");
    var thumbBtns = document.querySelectorAll("#pexpRouteThumbs .pexp-thumb-btn");
    var stopBadge = document.getElementById("pexpStopBadge");
    var stopTitle = document.getElementById("pexpRouteStopTitle");
    var routeStory = document.getElementById("pexpRouteStory");
    var routePins = document.querySelectorAll("#pexpRouteSvg .pexp-pin");
    var routeModes = document.querySelectorAll("#pexpRouteModes .pexp-mini-pill");

    function setRoutePhoto(pIdx) {
      var ph = routePhotos[pIdx] || routePhotos[0];
      if (mainRouteImg) {
        mainRouteImg.src = ph.src;
        mainRouteImg.alt = ph.alt;
      }
      thumbBtns.forEach(function(b, i) {
        b.classList.toggle("is-active", i === pIdx);
      });
    }

    thumbBtns.forEach(function(b) {
      b.addEventListener("click", function() {
        setRoutePhoto(Number(b.getAttribute("data-photo")));
      });
    });

    var origLandDash = landActive ? landActive.getAttribute("stroke-dasharray") : null;
    var landAnimTimer = null;

    function measurePathLen(dStr) {
      if (!landActive || !landActive.getTotalLength) return 0;
      landActive.setAttribute("d", dStr);
      try { return landActive.getTotalLength(); } catch (e) { return 0; }
    }

    function renderStop(idx, animateSegment) {
      var prevIdx = currentStopIdx;
      currentStopIdx = (idx + routeStops.length) % routeStops.length;
      var st = routeStops[currentStopIdx];

      if (landActive) {
        clearTimeout(landAnimTimer);
        if (animateSegment && !origLandDash && currentStopIdx === prevIdx + 1 && landActive.getTotalLength) {
          var prevLen = measurePathLen(routeStops[prevIdx].path);
          var newLen = measurePathLen(st.path);
          if (newLen > prevLen) {
            landActive.style.transition = "none";
            landActive.style.strokeDasharray = newLen + " " + newLen;
            landActive.style.strokeDashoffset = String(newLen - prevLen);
            landActive.getBoundingClientRect();
            landActive.style.transition = "stroke-dashoffset 0.85s ease-out";
            landActive.style.strokeDashoffset = "0";
            landAnimTimer = setTimeout(function() {
              landActive.style.transition = "";
              landActive.style.strokeDasharray = "";
              landActive.style.strokeDashoffset = "";
            }, 900);
          }
        } else {
          landActive.style.transition = "";
          landActive.style.strokeDasharray = origLandDash || "";
          landActive.style.strokeDashoffset = "";
          landActive.setAttribute("d", st.path);
        }
      }

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
        renderStop(Number(pin.getAttribute("data-stop")), false);
      });
      pin.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          stopRouteAutoplay();
          renderStop(Number(pin.getAttribute("data-stop")), false);
        }
      });
    });
    on("pexpPrevStop", "click", function() {
      stopRouteAutoplay();
      renderStop(currentStopIdx - 1, false);
    });
    on("pexpNextStop", "click", function() {
      stopRouteAutoplay();
      renderStop(currentStopIdx + 1, false);
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

    if (routePlayBtn) {
      routePlayBtn.addEventListener("click", function() {
        if (routeTimer) {
          stopRouteAutoplay();
          return;
        }
        if (landActive && landActive.style.display === "none" && routeModes.length) {
          routeModes[0].click();
        }
        if (currentStopIdx >= routeStops.length - 1) {
          renderStop(0, false);
        }
        routePlayBtn.textContent = "\u23F8\uFE0F Παύση";
        routePlayBtn.classList.add("is-playing");
        routeTimer = setInterval(function() {
          if (!modal.classList.contains("is-open") || (subJourney && subJourney.style.display === "none")) {
            stopRouteAutoplay();
            return;
          }
          var nextIdx = currentStopIdx + 1;
          renderStop(nextIdx, true);
          if (nextIdx >= routeStops.length - 1) {
            stopRouteAutoplay();
          }
        }, 3000);
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
          cartGameStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
    }

    routeModes.forEach(function(btn) {
      btn.addEventListener("click", function() {
        routeModes.forEach(function(b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var m = btn.getAttribute("data-mode");
        if (seaPath) seaPath.style.display = (m === "land") ? "none" : "block";
        if (landBg) landBg.style.display = (m === "sea") ? "none" : "block";
        if (landActive) landActive.style.display = (m === "sea") ? "none" : "block";
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
        badge: "\uD83E\uDDED Κατεύθυνση: ΒΟΡΡΑΣ (Β)",
        title: "\u2B06\uFE0F Βόρεια (Β) \u2022 Σταθμός & Κορινός",
        desc: "Η κόκκινη μύτη της πυξίδας κοιτάζει πάντα τον Βορρά! Αν σταθείς στην αυλή του σχολείου μας και κοιτάξεις Βόρεια, βρίσκονται ο Σιδηροδρομικός Σταθμός Κατερίνης και ο Κορινός."
      },
      NE: {
        angle: 45, dest: "thess",
        badge: "\uD83E\uDDED Κατεύθυνση: ΒΟΡΕΙΟΑΝΑΤΟΛΙΚΑ (ΒΑ)",
        title: "\uD83D\uDDFC Βορειοανατολικά (ΒΑ) \u279C Θεσσαλονίκη (68 χλμ)",
        desc: "Ανάμεσα στον Βορρά (Β) και την Ανατολή (Α), ακολουθώντας την ακτή του Θερμαϊκού προς τα πάνω, βρίσκεται η Θεσσαλονίκη!"
      },
      E: {
        angle: 90, dest: "paralia",
        badge: "\uD83E\uDDED Κατεύθυνση: ΑΝΑΤΟΛΗ (Α)",
        title: "\uD83C\uDF0A Ανατολικά (Α) \u279C Παραλία & Θερμαϊκός (5 χλμ)",
        desc: "Κοιτάζοντας Ανατολικά από την αυλή μας (5 χλμ.) βρίσκεται η θάλασσα της Παραλίας! Από εκεί ανατέλλει κάθε πρωί ο ήλιος μέσα από τον Θερμαϊκό Κόλπο!"
      },
      S: {
        angle: 180, dest: null,
        badge: "\uD83E\uDDED Κατεύθυνση: ΝΟΤΟΣ (Ν)",
        title: "\u2600\uFE0F Νότια (Ν) \u2022 Καλλιθέα & Ολυμπιακή Ακτή",
        desc: "Απέναντι ακριβώς από τον Βορρά βρίσκεται ο Νότος! Κάθε μεσημέρι ο ήλιος λάμπει ψηλά στον Νότο, πάνω από την Καλλιθέα, την Ολυμπιακή Ακτή και τον κάμπο της Πιερίας."
      },
      SW: {
        angle: 225, dest: "olympus",
        badge: "\uD83E\uDDED Κατεύθυνση: ΝΟΤΙΟΔΥΤΙΚΑ (ΝΔ)",
        title: "\uD83C\uDFD4\uFE0F Νοτιοδυτικά (ΝΔ) \u279C Όλυμπος (24 χλμ)",
        desc: "Ανάμεσα στον Νότο (Ν) και τη Δύση (Δ) υψώνεται περήφανος ο Όλυμπος με τον Μύτικα (2.918 μ.) και το Λιτόχωρο στους πρόποδές του!"
      },
      W: {
        angle: 270, dest: "katerini",
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
    var compassChips = [];
    var compassSvgPts = [];
    var curNeedleAngle = 270;

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
            '<button type="button" class="pexp-comp-chip" data-cdir="N">Β \u2022 Βορράς</button>' +
            '<button type="button" class="pexp-comp-chip" data-cdir="S">Ν \u2022 Νότος</button>' +
          '</div>' +
        '</div>';

      destGridEl.parentNode.insertBefore(compCard, destGridEl);
      compassNeedleEl = document.getElementById("pexpCompassNeedle");
      compassBadgeEl = document.getElementById("pexpCompBadge");
      compassTitleEl = document.getElementById("pexpCompTitle");
      compassDescEl = document.getElementById("pexpCompDesc");
      compassChips = compCard.querySelectorAll(".pexp-comp-chip");
      compassSvgPts = compCard.querySelectorAll(".pexp-comp-pt");

      compCard.addEventListener("click", function(e) {
        var hit = e.target.closest("[data-cdir]");
        if (!hit) return;
        setCompassDirection(hit.getAttribute("data-cdir"), false);
      });
    }

    function setCompassDirection(dirKey, fromDestSelect) {
      var pt = compassPoints[dirKey] || compassPoints.W;
      var delta = ((pt.angle - (curNeedleAngle % 360)) + 540) % 360 - 180;
      curNeedleAngle += delta;

      if (compassNeedleEl) {
        compassNeedleEl.style.transform = "rotate(" + curNeedleAngle + "deg)";
      }
      if (compassBadgeEl) compassBadgeEl.textContent = pt.badge;
      if (compassTitleEl) compassTitleEl.textContent = pt.title;
      if (compassDescEl) compassDescEl.textContent = pt.desc;

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

    function attachSpeedBar(el, cls) {
      if (!el || !el.parentNode) return null;
      var track = document.createElement("span");
      track.className = "pexp-speed-track";
      var fill = document.createElement("span");
      fill.className = "pexp-speed-fill " + cls;
      track.appendChild(fill);
      el.insertAdjacentElement("afterend", track);
      return fill;
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

    var wBar = attachSpeedBar(wEl, "pexp-fill-walk");
    var bBar = attachSpeedBar(bEl, "pexp-fill-bike");
    var cBar = attachSpeedBar(cEl, "pexp-fill-car");
    var cartBar = attachSpeedBar(cartTimeEl, "pexp-fill-cart");
    var cartNoteEl = subToday ? subToday.querySelector(".pexp-kid-story-text") : null;

    function selectDestination(key, fromCompass) {
      var idx = destKeys.indexOf(key);
      curDestIdx = idx !== -1 ? idx : 0;
      var d = localDests[destKeys[curDestIdx]];

      if (wEl) wEl.textContent = d.walk;
      if (bEl) bEl.textContent = d.bike;
      if (cEl) cEl.textContent = d.car;
      if (wBar) wBar.style.width = d.walkPct + "%";
      if (bBar) bBar.style.width = d.bikePct + "%";
      if (cBar) cBar.style.width = d.carPct + "%";

      if (cartTimeEl) cartTimeEl.textContent = d.cart;
      if (cartNoteEl) cartNoteEl.textContent = d.note;
      if (cartBar) cartBar.style.width = d.cartPct + "%";

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

    function selectZone(idx) {
      curZoneIdx = (idx + olympusZones.length) % olympusZones.length;
      var z = olympusZones[curZoneIdx];
      if (zRing) {
        zRing.setAttribute("cx", z.cx);
        zRing.setAttribute("cy", z.cy);
      }
      if (zAlt) zAlt.textContent = z.alt;
      if (zTitle) zTitle.textContent = z.title;
      if (zDesc) zDesc.textContent = z.desc;
      if (zImg1) { zImg1.src = z.img1; zImg1.alt = z.title; }
      if (zImg2) { zImg2.src = z.img2; zImg2.alt = z.title; }
      if (zCap) zCap.textContent = z.caption;
      if (zFlora) zFlora.innerHTML = z.flora.map(function(f) { return '<span class="pexp-tag-flora">' + f + '</span>'; }).join("");
      if (zFauna) zFauna.innerHTML = z.fauna.map(function(a) { return '<span class="pexp-tag-fauna">' + a + '</span>'; }).join("");
      if (zFact) zFact.textContent = z.fact;

      zHits.forEach(function(h, i) { h.style.opacity = (i === curZoneIdx) ? "1" : "0.78"; });
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
        { icon: "\uD83D\uDC22", name: "Χελώνα Caretta caretta", zone: 0, note: "Κολυμπά στα νερά του Θερμαϊκού και βγαίνει στην αμμουδιά της Παραλίας!" },
        { icon: "\uD83C\uDF3C", name: "Κρίνος της θάλασσας", zone: 0, note: "Ανθίζει μέσα στην καυτή άμμο της Παραλίας χωρίς καθόλου πότισμα!" }
      ],
      [
        { icon: "\uD83E\uDDA9", name: "Πελαργός", zone: 1, note: "Έρχεται κάθε άνοιξη από την Αφρική και φτιάχνει φωλιά στις κολώνες της Περίστασης!" },
        { icon: "\uD83E\uDD5D", name: "Ακτινίδια & Ροδάκινα", zone: 1, note: "Καλλιεργούνται στα εύφορα χωράφια του κάμπου γύρω από το χωριό μας!" }
      ],
      [
        { icon: "\uD83C\uDF38", name: "Μωβ λουλούδι Γιάνκεα", zone: 2, note: "Ζει στα σκιερά βράχια της Χαράδρας του Ενιπέα από την Εποχή των Παγετώνων!" },
        { icon: "\uD83E\uDD8C", name: "Ζαρκάδι", zone: 2, note: "Ζει στα πυκνά δάση από οξιές και πεύκα δίπλα στα νερά του Ενιπέα!" }
      ],
      [
        { icon: "\uD83C\uDF32", name: "Αιωνόβιο Ρόμπολο", zone: 3, note: "Το πανίσχυρο πεύκο στα 2.000μ που αντέχει τους κεραυνούς και το βαθύ χιόνι!" },
        { icon: "\uD83D\uDC3B", name: "Καφέ Αρκούδα", zone: 3, note: "Κινείται στα ψηλά, ήσυχα ορεινά δάση στις πλαγιές του Ολύμπου!" }
      ],
      [
        { icon: "\uD83D\uDC10", name: "Αγριόγιδο του Ολύμπου", zone: 4, note: "Σκαρφαλώνει στους πιο απότομους γκρεμούς στις ψηλές κορυφές (2.918μ)!" },
        { icon: "\uD83E\uDD85", name: "Χρυσαετός", zone: 4, note: "Πετάει περήφανα πάνω από τα σύννεφα στην κορυφή του Μύτικα!" }
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
      return !!(activeRootKey || capsuleOpen || mirrorOpen || olyGameActive || olyPackActive ||
        (typeof cartGameStage !== "undefined" && cartGameStage && cartGameStage.style.display === "block"));
    };

    isOlympusGuessing = function() {
      return !!(olyGameActive && !olyWaitingNext);
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
            if (olyRound < olyDeck.length - 1) {
              drawOlyRound(
                '<span>\u2705 Μπράβο! Σωστά στη ζώνη «' + zoneShortLabels[clickedZone] + '»! ' + q.note + '</span>' +
                '<button type="button" class="pexp-root-pop-cta" data-oly-next="1" style="background:#059669;margin:0">Επόμενο (' + (olyRound + 2) + '/5) \u279C</button>',
                "is-win"
              );
            } else {
              drawOlyRound(
                '<span>\uD83C\uDFC6 5 στα 5! Έβαλες όλα τα ζώα και τα φυτά από το κύμα έως τον Μύτικα στο σωστό τους σπίτι!</span>' +
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
    var cThumbs = document.querySelectorAll("#pexpChurchThumbs .pexp-thumb-btn");

    function renderChurch(idx) {
      if (!churchesData.length) return;
      currentChurchIdx = (idx + churchesData.length) % churchesData.length;
      var ch = churchesData[currentChurchIdx];
      if (cMainImg) { cMainImg.src = ch.img; cMainImg.alt = ch.caption; }
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

    /* ================= 4. ΠΑΙΔΙΚΕΣ ΚΑΡΤΕΣ ΥΠΟΔΟΜΩΝ & ΦΟΡΕΩΝ ================= */
    var facilitiesData = [
      {
        icon: "\uD83C\uDFEB",
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
        accent: "#059669", border: "#6ee7b7", soft: "#ecfdf5",
        badge: "\uD83C\uDFC5 2 Μεγάλα Αθλητικά Κέντρα \u2022 2.000+ Θέσεις!",
        title: "Οι Αθλητικές Εγκαταστάσεις της Γειτονιάς μας!",
        story: "Το χωριό μας αγαπάει πολύ τον αθλητισμό! Έχουμε το μεγάλο Γήπεδο Ποδοσφαίρου με σκεπαστή κερκίδα 1.000 θέσεων, αλλά και δίπλα μας το ανακαινισμένο Κλειστό Γυμναστήριο Τ9 (άνω των 1.000 θέσεων) για μπάσκετ, βόλεϊ και μεγάλους αγώνες!",
        tags: [
          "\u26BD Γήπεδο 1.000 Θέσεων",
          "\uD83C\uDFC0 Κλειστό Γυμναστήριο Τ9 (1.000+ Θέσεις)",
          "\uD83C\uDFBE Γήπεδα 5x5 & Τένις",
          "\u267F Ανελκυστήρες & Πρόσβαση για Όλους"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Το Κλειστό Γυμναστήριο Τ9 είναι το μοναδικό κλειστό γήπεδο σε όλη την Πιερία που μπορεί να φιλοξενήσει αγώνες επαγγελματικών κατηγοριών και πανελλήνια πρωταθλήματα!"
      },
      {
        icon: "\uD83C\uDFAD",
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

    function setMapStatusHtml(msg, actionType) {
      if (!mapStatusEl) return;
      var extraBtn = "";
      if (isMapZoomed && actionType === "card") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-card="1">\uD83D\uDCD6 Δες την Κάρτα \u279C</button>';
      } else if (isMapZoomed && actionType === "churches") {
        extraBtn = '<button type="button" class="pfac-map-goto-btn" data-map-goto-churches="1">\u26EA Άνοιξε τις Εκκλησίες \u279C</button>';
      }
      mapStatusEl.innerHTML = '<span>' + msg + '</span>' + extraBtn;
    }

    function openMapZoom() {
      if (isMapZoomed || !mapWrap) return;
      if (!mapModalBg) {
        mapModalBg = document.createElement("div");
        mapModalBg.className = "pfac-map-modal-bg";
        document.body.appendChild(mapModalBg);
        mapModalBg.addEventListener("click", function(e) {
          if (e.target === mapModalBg) closeMapZoom(false);
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

      try {
        if (!window.history.state || !window.history.state.pfacMapZoom) {
          window.history.pushState({ pfacMapZoom: true }, "", window.location.href);
        }
      } catch (e) {}
    }

    function closeMapZoom(fromPopState) {
      if (!isMapZoomed || !mapWrap) return;
      isMapZoomed = false;
      mapWrap.classList.remove("is-zoomed");
      if (mapModalBg) mapModalBg.classList.remove("is-open");
      if (mapPlaceholder && mapPlaceholder.parentNode) {
        mapPlaceholder.parentNode.insertBefore(mapWrap, mapPlaceholder);
      }
      if (!modal.classList.contains("is-open") && !(zoomOverlay && zoomOverlay.classList.contains("is-open"))) {
        document.body.style.overflow = "";
      }
      if (mapZoomBtn) mapZoomBtn.textContent = "\uD83D\uDD0D Μεγέθυνση Χάρτη";
      if (activeFacIdx >= 0 && facMapMeta[activeFacIdx]) {
        setMapStatusHtml(facMapMeta[activeFacIdx].walk, "");
      }

      if (!fromPopState && window.history.state && window.history.state.pfacMapZoom) {
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
          '<path d="M 88,248 L 88,110 M 232,248 L 232,108 M 426,248 L 426,66 M 426,104 L 352,104 M 548,248 L 548,178 M 676,248 L 676,56 M 676,68 L 612,68 M 768,248 L 768,64 M 768,96 L 865,96 M 526,248 L 526,336 M 724,248 L 724,336" fill="none" stroke="#94a3b8" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M 22,248 L 938,248" stroke="#94a3b8" stroke-width="32" stroke-linecap="round"/>' +
          '<path d="M 88,248 L 88,110 M 232,248 L 232,108 M 426,248 L 426,66 M 426,104 L 352,104 M 548,248 L 548,178 M 676,248 L 676,56 M 676,68 L 612,68 M 768,248 L 768,64 M 768,96 L 865,96 M 526,248 L 526,336 M 724,248 L 724,336" fill="none" stroke="#cbd5e1" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' +
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
          '<text x="220" y="344" text-anchor="middle" fill="#166534" font-size="13" font-weight="800">\uD83C\uDF33 Γειτονιές & Κάμπος Περίστασης</text>' +
          '<path id="pfacMapWalkLine" d="" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10,7"/>' +
          '<circle id="pfacMapPulse" cx="548" cy="178" r="29" fill="none" stroke="#1e6cff" stroke-width="4" style="display:none"/>' +
          '<g class="pfac-map-node" data-map-fac="4" role="button" tabindex="0">' +
            '<circle cx="88" cy="110" r="22" fill="#059669" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="88" y="117" text-anchor="middle" font-size="18">\uD83C\uDFC0</text>' +
            '<text class="pfac-map-lbl" x="88" y="152" text-anchor="middle" fill="#064e3b" font-size="12.5" font-weight="900">Κλειστό Τ9</text>' +
          '</g>' +
          '<g class="pfac-map-node" data-map-fac="5" role="button" tabindex="0">' +
            '<circle cx="232" cy="108" r="22" fill="#d97706" stroke="#ffffff" stroke-width="3"/>' +
            '<text x="232" y="115" text-anchor="middle" font-size="18">\uD83C\uDFAD</text>' +
            '<text class="pfac-map-lbl" x="232" y="148" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">Πλ. Ανατ. Θράκης</text>' +
            '<text class="pfac-map-lbl" x="232" y="164" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">& Σύλλογοι</text>' +
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
          if (mapWalkPath) mapWalkPath.setAttribute("d", "M 548,178 L 548,248 L 526,248 L 526,336");
          if (mapPulseRing) {
            mapPulseRing.setAttribute("cx", "526");
            mapPulseRing.setAttribute("cy", "336");
            mapPulseRing.setAttribute("stroke", "#4f46e5");
            mapPulseRing.style.display = "";
          }
          var chMsg = "\u26EA Διαδρομή από το Δημοτικό \u279C Ι.Ν. Αγίου Γεωργίου & Μοδέστου: δίπλα στην αυλή μας!";
          if (isMapZoomed) {
            setMapStatusHtml(chMsg, "churches");
          } else {
            setMapStatusHtml(chMsg, "");
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

      mapWrap.addEventListener("click", function(e) {
        if (e.target.closest("[data-map-goto-card]")) {
          closeMapZoom(false);
          if (pfacStage) {
            requestAnimationFrame(function() {
              pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          }
          return;
        }
        if (e.target.closest("[data-map-goto-churches]")) {
          closeMapZoom(false);
          window.openPeristasiModal("churches");
          return;
        }
        var nd = e.target.closest(".pfac-map-node");
        if (nd) {
          triggerMapNode(nd);
          return;
        }
        if (!isMapZoomed && e.target.closest("#pfacMapSvg")) {
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

      window.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && isMapZoomed) {
          e.stopImmediatePropagation();
          closeMapZoom(false);
        }
      }, true);

      window.addEventListener("popstate", function() {
        if (isMapZoomed && !(window.history.state && window.history.state.pfacMapZoom)) {
          closeMapZoom(true);
        }
      });
    }

    function syncNeighborhoodMap(idx) {
      if (!mapWalkPath || !mapPulseRing || !mapStatusEl) return;
      if (idx < 0 || !facMapMeta[idx]) {
        mapWalkPath.setAttribute("d", "");
        mapPulseRing.style.display = "none";
        setMapStatusHtml("\uD83C\uDFEB Αφετηρία μας το 12/Θ Δημοτικό (Μακεδονίας 15) \u2014 πάτησε σε οποιοδήποτε κτίριο του χάρτη!", "");
        return;
      }
      var m = facMapMeta[idx];
      mapWalkPath.setAttribute("d", m.path);
      mapPulseRing.setAttribute("cx", String(m.cx));
      mapPulseRing.setAttribute("cy", String(m.cy));
      mapPulseRing.setAttribute("stroke", facilitiesData[idx].accent);
      mapPulseRing.style.display = "";
      setMapStatusHtml(m.walk, "card");
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
          '<div class="pfac-story">' + item.story + '</div>' +
          '<div class="pfac-tags">' + tagsHtml + '</div>' +
          '<div class="pfac-fact">' + item.fact + '</div>' +
          mirrorExtraHtml +
          '<div class="pfac-nav">' +
            '<button type="button" class="pfac-nav-btn" id="pfacPrevBtn">\u2B05\uFE0F Προηγούμενο</button>' +
            '<span class="pfac-count">' + (cleanIdx + 1) + ' από ' + facilitiesData.length + '</span>' +
            '<button type="button" class="pfac-nav-btn" id="pfacNextBtn">Επόμενο \u27A1\uFE0F</button>' +
          '</div>' +
        '</div>';

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
  })();
