(() => {
    "use strict";

    // 1. Ασφαλής ανάκτηση DOM (αποφυγή null)
    const getDOM = () => ({
        box: document.getElementById("video-widget-box"),
        iframe: document.getElementById("flipbook-iframe"),
        ytPlayer: document.getElementById("yt-player")
    });

    // 1. Λειτουργία Πλήρους Οθόνης Βιβλιοθήκης
    window.openLibraryFullscreen = () => {
        const { iframe: fIframe } = getDOM();
        if (!fIframe) return;
        
        if (fIframe.requestFullscreen) {
            fIframe.requestFullscreen();
        } else if (fIframe.webkitRequestFullscreen) {
            fIframe.webkitRequestFullscreen();
        } else if (fIframe.mozRequestFullScreen) { // 3. Υποστήριξη Firefox
            fIframe.mozRequestFullScreen();
        } else if (fIframe.msRequestFullscreen) {
            fIframe.msRequestFullscreen();
        }
    };

    // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής
    const initApp = () => {
        const { box, ytPlayer } = getDOM();
        
        if (!box) return;
        
        const subBtn = box.querySelector('.video-sub-action');
        if (subBtn) {
            subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
        }

        const setupPlayer = () => {
            // 4. Έλεγχος ύπαρξης yt-player
            if (!ytPlayer) return;

            new YT.Player('yt-player', {
                events: {
                    'onStateChange': (e) => {
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
                
                // 2. Προστασία του onYouTubeIframeAPIReady (αποφυγή conflicts με Mobile)
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
