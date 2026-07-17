(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION
    // ==========================================
    const CONFIG = Object.freeze({
        labels: ["Σύνδεσμοι"],
        maxResults: 53,
        defaultEmoji: "📌"
    });

    // ==========================================
    // 2. DOM CACHE (Αποθήκευση στοιχείων)
    // ==========================================
    const DOM = {
        hub: document.getElementById("smart-hub2"),
        content: document.getElementById("hub-content2"),
        toggle: document.getElementById("hub-toggle2"),
        dynamicContainer: document.getElementById("dynamic-posts-container2")
    };

    // ==========================================
    // 3. UTILITIES
    // ==========================================
    const Utils = {
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

        // Καταγράφει τα ήδη υπάρχοντα χειροκίνητα links για αποφυγή διπλότυπων
        recordExistingLinks: () => {
            if (!DOM.hub) return;
            const existingLinks = DOM.hub.querySelectorAll('.hub-links a');
            existingLinks.forEach(a => {
                DataEngine.seenUrls.add(a.href.split('?')[0].split('#')[0]);
            });
        },

        fetchPosts: async () => {
            try {
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

                DOM.dynamicContainer.appendChild(fragment);

            } catch (err) {
                console.warn('Smart Hub 2: Πρόβλημα φόρτωσης δυναμικών συνδέσμων.', err);
            }
        }
    };

    // ==========================================
    // 5. INTERACTION MANAGER (Διαχείριση Μενού)
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
        }
    };

    // ==========================================
    // 6. BOOTSTRAP (Εκκίνηση & Event Listeners)
    // ==========================================
    const App = {
        init: () => {
            // Αν λείπει το βασικό DOM, σταματάει
            if (!DOM.hub) return;

            // Εκκίνηση δεδομένων
            DataEngine.init();

            // Event Listeners (Menu)
            if (DOM.toggle) DOM.toggle.addEventListener('click', UIManager.toggleMenu);
            window.addEventListener('click', UIManager.closeMenu, { passive: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }

})();
