(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION & SETTINGS
    // ==========================================
    const CONFIG = Object.freeze({
        labels: ["Διαπαιδαγώγηση", "Ψυχολογία", "Σχολείο", "Υγεία", "Παιχνίδι", "Σελίδες", "Γενικά"],
        maxResults: 3,
        mobileBreakpoint: 768,
        debounceDelay: 150,
        defaultEmoji: "📌"
    });

    // ==========================================
    // 2. DOM CACHE (Αποθήκευση στοιχείων στη μνήμη)
    // ==========================================
    const DOM = {
        hub: document.getElementById("smart-hub"),
        content: document.getElementById("hub-content"),
        toggle: document.getElementById("hub-toggle"),
        dynamicContainer: document.getElementById("dynamic-posts-container"),
        origLoc: document.getElementById("smarthub-original-location"),
        mobileWrapper: null
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
        },
        // Εξαγωγή Emoji από τον τίτλο
        parseTitle: (rawTitle) => {
            let emoji = CONFIG.defaultEmoji;
            let text = rawTitle.trim();
            const emojiMatch = text.match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}]+)\s*(.*)/u);
            if (emojiMatch) {
                emoji = emojiMatch[1];
                text = emojiMatch[2];
            }
            return { emoji, text };
        }
    };

    // ==========================================
    // 4. DATA ENGINE (Αυτόματο Τράβηγμα Αναρτήσεων)
    // ==========================================
    const DataEngine = {
        seenUrls: new Set(),

        init: () => {
            if (!DOM.dynamicContainer) return;
            DataEngine.recordExistingLinks();
            DataEngine.fetchPosts();
        },

        recordExistingLinks: () => {
            if (!DOM.hub) return;
            const existingLinks = DOM.hub.querySelectorAll('.hub-links a');
            existingLinks.forEach(a => {
                DataEngine.seenUrls.add(a.href.split('?')[0].split('#')[0]);
            });
        },

        fetchPosts: async () => {
            try {
                // Ταυτόχρονο κατέβασμα όλων των κατηγοριών
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                    return fetch(url).then(res => res.json());
                });

                const results = await Promise.all(promises);
                const fragment = document.createDocumentFragment();

                results.forEach(data => {
                    if (!data.feed?.entry) return;
                    
                    data.feed.entry.forEach(entry => {
                        const linkObj = entry.link.find(l => l.rel === 'alternate');
                        if (!linkObj) return;

                        const cleanLink = linkObj.href.split('?')[0].split('#')[0];
                        if (DataEngine.seenUrls.has(cleanLink)) return;
                        
                        DataEngine.seenUrls.add(cleanLink);

                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <a href="${linkObj.href}">
                                <span class="hub-ic">${emoji}</span>
                                <span class="hub-tx">${text}</span>
                            </a>
                        `;
                        fragment.appendChild(li);
                    });
                });

                // Προσθήκη όλων μαζί στο DOM για μέγιστη ταχύτητα
                DOM.dynamicContainer.appendChild(fragment);

            } catch (err) {
                console.warn('Smart Hub 1: Πρόβλημα φόρτωσης δυναμικών συνδέσμων.', err);
            }
        }
    };

    // ==========================================
    // 5. UI & LAYOUT MANAGER (Διαχείριση Μενού & Κινητών)
    // ==========================================
    const UIManager = {
        toggleMenu: (e) => {
            if (e) e.stopPropagation();
            if (DOM.content && DOM.toggle) {
                DOM.content.classList.toggle("open");
                DOM.toggle.classList.toggle("active");
            }
        },

        closeMenu: (e) => {
            if (DOM.content?.classList.contains('open') && DOM.hub && !DOM.hub.contains(e.target)) {
                DOM.content.classList.remove('open');
                DOM.toggle?.classList.remove('active');
            }
        },

        getOrCreateWrapper: () => {
            if (DOM.mobileWrapper) return DOM.mobileWrapper;
            
            let wrapper = document.getElementById("smarthub-mobile-wrapper");
            if (!wrapper) {
                // 1. Δημιουργία Wrapper
                wrapper = document.createElement("div");
                wrapper.id = "smarthub-mobile-wrapper";
                wrapper.style.cssText = `
                    margin: 30px 0 !important;
                    padding: 20px 0 0 0 !important;
                    position: relative !important;
                    width: 100% !important;
                    display: block !important;
                    clear: both !important;
                    background: transparent !important;
                `;
                
                // 2. Δημιουργία Full-Width Γραμμής (Bleed-out effect)
                let fullWidthLine = document.createElement("div");
                fullWidthLine.id = "smarthub-full-line";
                fullWidthLine.style.cssText = `
                    position: absolute !important;
                    top: 0 !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: 94vw !important;
                    border-top: 7px solid #e5e7eb !important; 
                    background: transparent !important;
                    pointer-events: none !important;
                `;
                
                wrapper.appendChild(fullWidthLine);
            }
            DOM.mobileWrapper = wrapper;
            return wrapper;
        },

        moveLayout: () => {
            if (!DOM.hub) return;

            if (window.innerWidth <= CONFIG.mobileBreakpoint) {
                // Κινητό: Ψάχνει το στόχο (Slider ή HTML29)
                let target = document.getElementById("slider-wrapper-mobile") || document.getElementById("HTML29");
                if (target) {
                    const wrapper = UIManager.getOrCreateWrapper();
                    
                    if (wrapper.parentNode !== target.parentNode || wrapper.previousSibling !== target) {
                        target.after(wrapper);
                    }
                    if (DOM.hub.parentNode !== wrapper) {
                        wrapper.appendChild(DOM.hub);
                    }
                }
            } else {
                // Desktop: Επαναφορά στην αρχική θέση
                if (DOM.origLoc?.parentNode && DOM.hub.parentNode !== DOM.origLoc.parentNode) {
                    DOM.origLoc.parentNode.insertBefore(DOM.hub, DOM.origLoc.nextSibling);
                }
                if (DOM.mobileWrapper?.parentNode) {
                    DOM.mobileWrapper.remove();
                }
            }
        }
    };

    // ==========================================
    // 6. BOOTSTRAP (Εκκίνηση & Event Listeners)
    // ==========================================
    const App = {
        init: () => {
            if (!DOM.hub) return;

            // 1. Εκκίνηση Φόρτωσης Δεδομένων
            DataEngine.init();

            // 2. Event Listeners (Menu)
            if (DOM.toggle) DOM.toggle.addEventListener('click', UIManager.toggleMenu);
            window.addEventListener('click', UIManager.closeMenu, { passive: true });

            // 3. Event Listeners (Layout Movement)
            UIManager.moveLayout();
            window.addEventListener("resize", Utils.debounce(UIManager.moveLayout, CONFIG.debounceDelay), { passive: true });
            
            // Ασφαλής επανέλεγχος όταν φορτώσουν όλα τα widgets
            window.addEventListener("load", UIManager.moveLayout, { once: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }

})();
