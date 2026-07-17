(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION
    // ==========================================
    const CONFIG = Object.freeze({
        mobileBreakpoint: 768,
        mobileBaseId: "video-mobile-base",
        mobileBaseClass: "widget",
        debounceDelay: 150
    });

    // ==========================================
    // 2. DOM CACHE (Αποθήκευση στοιχείων για ταχύτητα)
    // ==========================================
    const DOM = {
        videoBox: document.getElementById("video-widget-box"),
        mainParent: document.getElementById("video-container-main"),
        iframe: document.getElementById("flipbook-iframe"),
        mobileBase: null
    };

    // ==========================================
    // 3. UTILITIES
    // ==========================================
    const Utils = {
        debounce: (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }
    };

    // ==========================================
    // 4. LAYOUT MANAGER (Διαχείριση Μετακίνησης)
    // ==========================================
    const LayoutManager = {
        getOrCreateBase: () => {
            if (DOM.mobileBase) return DOM.mobileBase;
            
            let base = document.getElementById(CONFIG.mobileBaseId);
            if (!base) {
                base = document.createElement("div");
                base.id = CONFIG.mobileBaseId;
                base.className = CONFIG.mobileBaseClass;
            }
            DOM.mobileBase = base;
            return base;
        },

        move: () => {
            if (!DOM.videoBox || !DOM.mainParent) return;

            if (window.innerWidth <= CONFIG.mobileBreakpoint) {
                // ΚΙΝΗΤΟ / TABLET: Βρίσκουμε το στόχο (HTML18)
                let target = document.getElementById("holiday-glass-base") || document.getElementById("HTML18");
                if (target) {
                    const base = LayoutManager.getOrCreateBase();
                    // Βάζουμε τη βάση του κινητού σωστά από κάτω
                    if (base.parentNode !== target.parentNode || base.previousSibling !== target) {
                        target.after(base);
                    }
                    // Μεταφέρουμε το βίντεο μέσα στη βάση
                    if (DOM.videoBox.parentNode !== base) {
                        base.appendChild(DOM.videoBox);
                    }
                }
            } else {
                // PC: Επιστροφή στην αρχική του θέση (μέσα στο mainParent)
                if (DOM.videoBox.parentNode !== DOM.mainParent) {
                    DOM.mainParent.appendChild(DOM.videoBox);
                }
                // Καθαρισμός της κινητής βάσης αν υπάρχει
                if (DOM.mobileBase?.parentNode) {
                    DOM.mobileBase.remove();
                }
            }
        }
    };

    // ==========================================
    // 5. VIDEO ENGINE (Διαχείριση Fullscreen)
    // ==========================================
    const VideoEngine = {
        openFullscreen: () => {
            // Διαβάζει το iframe ξανά αν δεν είχε φορτώσει αρχικά
            const currentIframe = DOM.iframe || document.getElementById("flipbook-iframe");
            if (!currentIframe) return;

            if (currentIframe.requestFullscreen) {
                currentIframe.requestFullscreen();
            } else if (currentIframe.webkitRequestFullscreen) { /* Safari */
                currentIframe.webkitRequestFullscreen();
            } else if (currentIframe.msRequestFullscreen) { /* IE11 */
                currentIframe.msRequestFullscreen();
            }
        },

        init: () => {
            // 1. Εκθέτουμε τη συνάρτηση στο global scope για να δουλεύει το onclick του HTML
            window.openLibraryFullscreen = VideoEngine.openFullscreen;

            // 2. Αρχική τοποθέτηση
            LayoutManager.move();

            // 3. Ασφαλής παρακολούθηση resize
            window.addEventListener("resize", Utils.debounce(LayoutManager.move, CONFIG.debounceDelay), { passive: true });

            // 4. Η ΣΩΣΤΗ εναλλακτική για τα τυφλά setTimeout.
            // Όταν το Blogger τελειώσει να φορτώνει όλα τα Widgets, τοποθέτησέ το ξανά αν χρειαστεί.
            window.addEventListener("load", LayoutManager.move);
        }
    };

    // ==========================================
    // 6. BOOTSTRAP (Εκκίνηση)
    // ==========================================
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", VideoEngine.init);
    } else {
        VideoEngine.init();
    }

})();
