(() => {
    "use strict";

    const DOM = {
        box: document.getElementById("video-widget-box"),
        iframe: document.getElementById("flipbook-iframe")
    };

    // 1. Λειτουργία Πλήρους Οθόνης Βιβλιοθήκης
    window.openLibraryFullscreen = () => {
        const fIframe = DOM.iframe;
        if (!fIframe) return;
        if (fIframe.requestFullscreen) fIframe.requestFullscreen();
        else if (fIframe.webkitRequestFullscreen) fIframe.webkitRequestFullscreen();
        else if (fIframe.msRequestFullscreen) fIframe.msRequestFullscreen();
    };

    // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής
    const initApp = () => {
        if (!DOM.box) return;
        
        // Ψάχνει το κουμπί ΜΟΝΟ μέσα στο δικό του κουτί
        const subBtn = DOM.box.querySelector('.video-sub-action');
        if (subBtn) {
            subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
        }

        const setupPlayer = () => {
            new YT.Player('yt-player', {
                events: {
                    'onStateChange': (e) => {
                        if (e.data === 1 && subBtn) subBtn.classList.add('is-hidden');
                    }
                }
            });
        };

        // Ασφαλής Φόρτωση YouTube API (ώστε να μη συγκρούεται με το Mobile)
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
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
})();
