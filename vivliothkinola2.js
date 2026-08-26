(() => {
   "use strict";

    // 1. Έξυπνη Λειτουργία Πλήρους Οθόνης (Κοινή για PC & Mobile)
    const triggerFullscreen = (iframeId) => {
        const fIframe = document.getElementById(iframeId);
        if (!fIframe) return;

     const fallbackOpen = () => { 
           if (fIframe.src) {
               const newWin = window.open(fIframe.src, '_blank');
               // Αν ο browser μπλοκάρει το νέο παράθυρο λόγω Popup Blocker, κάνουμε ανακατεύθυνση στην ίδια καρτέλα
               if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                   window.location.href = fIframe.src;
               }
           } 
       };

        if (fIframe.requestFullscreen) {
            const p = fIframe.requestFullscreen();
            // Αν το API υπάρχει αλλά το browser το μπλοκάρει (π.χ. iPhone iframe ή λείπει το allow="fullscreen"), πιάνουμε την αποτυχία!
            if (p && p.catch) p.catch(fallbackOpen);
        } else if (fIframe.webkitRequestFullscreen) { // Safari / Chrome
            const p = fIframe.webkitRequestFullscreen();
            if (p && p.catch) p.catch(fallbackOpen);
        } else if (fIframe.mozRequestFullScreen) { // Firefox
            fIframe.mozRequestFullScreen();
        } else if (fIframe.msRequestFullscreen) { // IE11
            fIframe.msRequestFullscreen();
        } else {
            // FALLBACK αν δεν υποστηρίζεται καθόλου το API (Παλιά iPhones)
            fallbackOpen();
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

       // ΔΙΟΡΘΩΣΗ Α: Ενεργοποιούμε το κλικ στα κουμπιά ΑΜΕΣΩΣ! Έτσι δουλεύουν ακόμα και αν το Adblocker μπλοκάρει το YT API.
        platforms.forEach(p => {
            const box = document.getElementById(p.boxId);
            if (!box) return;
            const subBtn = box.querySelector('.video-sub-action');
            if (subBtn && !subBtn.dataset.listenerAdded) {
                subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
                subBtn.dataset.listenerAdded = "true";
            }
        });

        const setupPlayers = () => {
            // Η έξυπνη λούπα: Ελέγχει και το PC και το κινητό!
            platforms.forEach(p => {
                const box = document.getElementById(p.boxId);
                const ytPlayerEl = document.getElementById(p.ytId);
                
                if (!box || !ytPlayerEl) return; // Αν δεν το βρει στη σελίδα, πάει στο επόμενο
                
                const subBtn = box.querySelector('.video-sub-action');

              const initPlayer = () => {
                    new YT.Player(p.ytId, {
                        events: {
                            'onStateChange': (e) => {
                                if (e.data === 1 && subBtn) subBtn.classList.add('is-hidden');
                            }
                        }
                    });
                };

                // ΔΙΟΡΘΩΣΗ Β: Προσθήκη enablejsapi=1 αν λείπει
                if (ytPlayerEl.tagName.toLowerCase() === 'iframe') {
                    const currentSrc = ytPlayerEl.getAttribute('src') || '';
                    if (currentSrc && !currentSrc.includes('enablejsapi=1')) {
                        // ΠΕΡΙΜΕΝΟΥΜΕ να ολοκληρωθεί η φόρτωση ΠΡΙΝ αρχικοποιηθεί το Player
                        ytPlayerEl.addEventListener('load', initPlayer, { once: true });
                        ytPlayerEl.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'enablejsapi=1';
                        return; // Σταματάμε την τρέχουσα εκτέλεση της λούπας
                    }
                }

                // Αν το API υπήρχε ήδη στο URL, αρχικοποιούμε άμεσα
                initPlayer();
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
