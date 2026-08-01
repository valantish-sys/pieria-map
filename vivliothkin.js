(() => {
    "use strict";

    const DOM = {
        box: document.getElementById("video-widget-box-mobile"),
        iframe: document.getElementById("flipbook-iframe-mobile")
    };

    // 1. Λειτουργία Πλήρους Οθόνης Βιβλιοθήκης (Mobile)
    window.openLibraryFullscreenMobile = () => {
        const fIframe = DOM.iframe;
        if (!fIframe) return;
        if (fIframe.requestFullscreen) fIframe.requestFullscreen();
        else if (fIframe.webkitRequestFullscreen) fIframe.webkitRequestFullscreen();
        else if (fIframe.msRequestFullscreen) fIframe.msRequestFullscreen();
    };

    // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής (Mobile)
    const initMobileApp = () => {
        if (!DOM.box) return;
        
        const subBtn = DOM.box.querySelector('.video-sub-action');
        if (subBtn) {
            subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
        }

        const setupPlayer = () => {
            new YT.Player('yt-player-mobile', { // Στοχεύει το mobile iframe
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
                
                window.onYouTubeIframeAPIReady = () => {
                    window.ytReadyCallbacks.forEach(cb => cb());
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
