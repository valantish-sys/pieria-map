(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION
    // ==========================================
    const CONFIG = Object.freeze({
        defaultLang: 'el',
        idleTimeout: 10000, // Χρόνος (σε ms) πριν κρυφτεί το κουμπί
        maxRetries: 10,     // Προσπάθειες αν καθυστερήσει η Google
        retryDelay: 500
    });

    // ==========================================
    // 2. DOM CACHE
    // ==========================================
    const DOM = {
        btn: document.getElementById('gt-floating-btn'),
        menu: document.getElementById('gt-languages-modal'),
        combo: null // Το select της Google (το βρίσκει δυναμικά)
    };

    // ==========================================
    // 3. UTILITIES
    // ==========================================
    const Utils = {
        // Αποτρέπει την εξάντληση της CPU στα scroll/mousemove
        throttle: (func, limit) => {
            let inThrottle;
            return (...args) => {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // ==========================================
    // 4. TRANSLATION ENGINE (Με Retry Logic)
    // ==========================================
    // Το callback πρέπει να είναι global για να το "δει" η Google
    window.googleTranslateElementInit_custom = () => {
        new window.google.translate.TranslateElement({
            pageLanguage: CONFIG.defaultLang,
            autoDisplay: false
        }, 'google_translate_element_custom');
    };

    const TranslationEngine = {
        applyLang: (lang, retryCount = 0) => {
            if (!lang) return;
            
            DOM.combo = DOM.combo || document.querySelector("select.goog-te-combo");
            
            if (DOM.combo) {
                DOM.combo.value = lang;
                DOM.combo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                UIManager.closeMenu();
            } else {
                if (retryCount < CONFIG.maxRetries) {
                    setTimeout(() => TranslationEngine.applyLang(lang, retryCount + 1), CONFIG.retryDelay);
                } else {
                    console.warn("Google Translate: Υπέρβαση χρόνου φόρτωσης.");
                }
            }
        }
    };

    // ==========================================
    // 5. UI & INTERACTION MANAGER
    // ==========================================
    const UIManager = {
        idleTimer: null,

        toggleMenu: (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!DOM.menu) return;
            
            const isFlex = DOM.menu.style.display === 'flex';
            DOM.menu.style.display = isFlex ? 'none' : 'flex';
            
            // Αν το μενού ανοίξει, σταματάμε να μετράμε χρόνο για απόκρυψη
            if (!isFlex) {
                UIManager.showButton();
                clearTimeout(UIManager.idleTimer);
            } else {
                UIManager.resetIdleTimer();
            }
        },

        closeMenu: () => {
            if (DOM.menu) DOM.menu.style.display = 'none';
            UIManager.resetIdleTimer();
        },

        relocateElements: () => {
            // Μεταφορά στο τέλος του body για απόλυτη συμβατότητα με fixed positioning
            if (DOM.btn && DOM.btn.parentNode !== document.body) document.body.appendChild(DOM.btn);
            if (DOM.menu && DOM.menu.parentNode !== document.body) document.body.appendChild(DOM.menu);
        },

        hideButton: () => {
            if (DOM.btn && DOM.menu && DOM.menu.style.display !== 'flex') {
                DOM.btn.classList.add('is-hidden');
            }
        },

        showButton: () => {
            if (DOM.btn && DOM.btn.classList.contains('is-hidden')) {
                DOM.btn.classList.remove('is-hidden');
            }
        },

        resetIdleTimer: () => {
            UIManager.showButton();
            clearTimeout(UIManager.idleTimer);
            UIManager.idleTimer = setTimeout(UIManager.hideButton, CONFIG.idleTimeout);
        }
    };

    // ==========================================
    // 6. BOOTSTRAP (Εκκίνηση)
    // ==========================================
    const App = {
        init: () => {
            UIManager.relocateElements();

            // Ασύγχρονη φόρτωση του Google Translate Script
            const gtScript = document.createElement('script');
            gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit_custom";
            gtScript.async = true; 
            gtScript.defer = true;
            document.body.appendChild(gtScript);

            // Event Listeners: Άνοιγμα Μενού
            if (DOM.btn) DOM.btn.addEventListener('click', UIManager.toggleMenu);
            
            // Event Delegation: Κλικ στις γλώσσες (ψάχνει το data-lang)
            if (DOM.menu) {
                DOM.menu.addEventListener('click', (e) => {
                    const langBtn = e.target.closest('[data-lang]');
                    if (langBtn) {
                        e.preventDefault();
                        TranslationEngine.applyLang(langBtn.dataset.lang);
                    }
                });
            }

            // Event Listeners: Κλείσιμο μενού με κλικ απ' έξω
            document.addEventListener('click', (e) => {
                if (DOM.menu && DOM.menu.style.display === 'flex' && !DOM.menu.contains(e.target) && (!DOM.btn || !DOM.btn.contains(e.target))) {
                    UIManager.closeMenu();
                }
            }, { passive: true });

            // Event Listeners: Idle Timer (με throttle 200ms για να μην κολλάει το UI)
            const throttledReset = Utils.throttle(UIManager.resetIdleTimer, 200);
            ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                document.addEventListener(evt, throttledReset, { passive: true });
            });

            // Εκκίνηση χρονομέτρου
            UIManager.resetIdleTimer();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }

})();
