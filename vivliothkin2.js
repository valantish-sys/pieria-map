(() => {
    "use strict";

    // [ΔΙΟΡΘΩΣΗ] Χρήση συνάρτησης (getter) για να πάρουμε τα στοιχεία 
    // ΜΟΝΟ όταν τα χρειαστούμε (δηλαδή αφού έχει φορτώσει το DOM).
    const getDOM = () => ({
        box: document.getElementById("video-widget-box-mobile"),
        iframe: document.getElementById("flipbook-iframe-mobile"),
        ytPlayer: document.getElementById("yt-player-mobile")
    });

    // 1. Λειτουργία Πλήρους Οθόνης Βιβλιοθήκης (Mobile)
    window.openLibraryFullscreenMobile = () => {
        const { iframe: fIframe } = getDOM();
        if (!fIframe) return;

        if (fIframe.requestFullscreen) {
            fIframe.requestFullscreen();
        } else if (fIframe.webkitRequestFullscreen) { // Safari / Chrome
            fIframe.webkitRequestFullscreen();
        } else if (fIframe.mozRequestFullScreen) { // [ΒΕΛΤΙΩΣΗ] Προσθήκη για Firefox
            fIframe.mozRequestFullScreen();
        } else if (fIframe.msRequestFullscreen) { // IE11
            fIframe.msRequestFullscreen();
        }
    };

    // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής (Mobile)
    const initMobileApp = () => {
        const { box, ytPlayer } = getDOM();
        
        if (!box) return;
        
        const subBtn = box.querySelector('.video-sub-action');
        if (subBtn) {
            subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
        }

        const setupPlayer = () => {
            // [ΒΕΛΤΙΩΣΗ] Βεβαιωνόμαστε ότι υπάρχει το στοιχείο που θα υποδεχθεί το iframe
            if (!ytPlayer) return;

            new YT.Player('yt-player-mobile', { 
                events: {
                    'onStateChange': (e) => {
                        // e.data === 1 σημαίνει ότι το βίντεο παίζει (YT.PlayerState.PLAYING)
                        if (e.data === 1 && subBtn) subBtn.classList.add('is-hidden');
                    }
                }
            });
        };

        // Ασφαλής Φόρτωση YouTube API
        if (window.YT && window.YT.Player) {
            setupPlayer();
        } else {
            window.ytReadyCallbacks = window.ytReadyCallbacks || [];
            window.ytReadyCallbacks.push(setupPlayer);

            if (!window.ytApiLoading) {
                window.ytApiLoading = true;
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                
                // [ΔΙΟΡΘΩΣΗ] Αποθηκεύουμε τυχόν προηγούμενο callback 
                // για να μην "σπάσουμε" άλλα scripts / plugins της σελίδας.
                const existingOnReady = window.onYouTubeIframeAPIReady;
                
                window.onYouTubeIframeAPIReady = () => {
                    if (typeof existingOnReady === 'function') {
                        existingOnReady(); // Εκτελούμε πρώτα το παλιό callback (αν υπήρχε)
                    }
                    window.ytReadyCallbacks.forEach(cb => cb());
                    window.ytReadyCallbacks = []; // Καθαρισμός του array μετά την εκτέλεση
                };
            }
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMobileApp);
    } else {
        initMobileApp();
    }
})();
