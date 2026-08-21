(() => {
   "use strict";

    // 1. Έξυπνη Λειτουργία Πλήρους Οθόνης (Κοινή για PC & Mobile)
    const triggerFullscreen = (iframeId) => {
        const fIframe = document.getElementById(iframeId);
        if (!fIframe) return;

        if (fIframe.requestFullscreen) {
            fIframe.requestFullscreen();
        } else if (fIframe.webkitRequestFullscreen) { // Safari / Chrome
            fIframe.webkitRequestFullscreen();
        } else if (fIframe.mozRequestFullScreen) { // Firefox
            fIframe.mozRequestFullScreen();
        } else if (fIframe.msRequestFullscreen) { // IE11
            fIframe.msRequestFullscreen();
        } else {
            // ΔΙΟΡΘΩΣΗ & FALLBACK: Αν μπλοκάρουν το Fullscreen (π.χ. iPhone), ανοίγει σε νέα καρτέλα!
            window.open(fIframe.src, '_blank');
        }
    };

    // Κρατάμε και τα δύο ονόματα (PC & Mobile) για να λειτουργούν αυτόματα τα κουμπιά στο HTML σου!
    window.openLibraryFullscreen = () => triggerFullscreen("flipbook-iframe");
    window.openLibraryFullscreenMobile = () => triggerFullscreen("flipbook-iframe-mobile");

   // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής (Κοινός για PC & Mobile)
    const initApp = () => {
        // Λίστα με τα IDs για το PC και το Κινητό αντίστοιχα
        const platforms = [
            { boxId: "video-widget-box", ytId: "yt-player" },
            { boxId: "video-widget-box-mobile", ytId: "yt-player-mobile" }
        ];

        const setupPlayers = () => {
            // Η έξυπνη λούπα: Ελέγχει και το PC και το κινητό!
            platforms.forEach(p => {
                const box = document.getElementById(p.boxId);
                const ytPlayerEl = document.getElementById(p.ytId);
                
                if (!box || !ytPlayerEl) return; // Αν δεν το βρει στη σελίδα, πάει στο επόμενο
                
                const subBtn = box.querySelector('.video-sub-action');
                if (subBtn && !subBtn.dataset.listenerAdded) {
                    subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
                    subBtn.dataset.listenerAdded = "true";
                }

                new YT.Player(p.ytId, { 
                    events: {
                        'onStateChange': (e) => {
                            if (e.data === 1 && subBtn) subBtn.classList.add('is-hidden');
                        }
                    }
                });
            });
        };

        // Ασφαλής Φόρτωση YouTube API
        if (window.YT && window.YT.Player) {
            setupPlayers();
        } else {
            window.ytReadyCallbacks = window.ytReadyCallbacks || [];
            window.ytReadyCallbacks.push(setupPlayers); 

            if (!window.ytApiLoading) {
                window.ytApiLoading = true;
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                
                const existingOnReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (typeof existingOnReady === 'function') {
                        existingOnReady(); 
                    }
                    window.ytReadyCallbacks.forEach(cb => cb());
                    window.ytReadyCallbacks = []; 
                };
            }
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
})();
