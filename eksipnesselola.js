(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Διαπαιδαγώγηση", "Ψυχολογία", "Σχολείο", "Υγεία", "Παιχνίδι", "Σελίδες", "Γενικά"],
        maxResults: 3,
        defaultEmoji: "📌"
    });

    const Utils = {
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

    const App = {
        widgets: [],
        seenUrls: new Set(), // Κοινή μνήμη για να αποφεύγουμε διπλότυπα
        
        init: () => {
            // 1. Δήλωση των διαθέσιμων widgets (PC & Mobile)
            const widgetConfigs = [
                { hub: "smart-hub", toggle: "hub-toggle", content: "hub-content", dynamic: "dynamic-posts-container" },
                { hub: "smart-hub-mobile", toggle: "hub-toggle-mobile", content: "hub-content-mobile", dynamic: "dynamic-posts-container-mobile" }
            ];

            // 2. Έξυπνη αναζήτηση στη σελίδα (Κρατάει μόνο όσα υπάρχουν στο HTML)
            widgetConfigs.forEach(conf => {
                const hubEl = document.getElementById(conf.hub);
                if (hubEl) {
                    App.widgets.push({
                        hub: hubEl,
                        toggle: document.getElementById(conf.toggle),
                        content: document.getElementById(conf.content),
                        dynamicContainer: document.getElementById(conf.dynamic)
                    });
                }
            });

            if (App.widgets.length === 0) return; // Αν δε βρει κανένα, δεν κάνει τίποτα.

            App.setupUI();
            App.recordExistingLinks();
            App.fetchPosts();
        },

        setupUI: () => {
            // 3. Ανεξάρτητα συρτάρια για αποφυγή conflict
            App.widgets.forEach(w => {
                if (w.toggle && w.content) {
                    w.toggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        w.content.classList.toggle("open");
                        w.toggle.classList.toggle("active");
                    });
                }
            });

            // Κλείσιμο κλικάροντας αλλού
            window.addEventListener('click', (e) => {
                App.widgets.forEach(w => {
                    if (w.content?.classList.contains('open') && w.hub && !w.hub.contains(e.target)) {
                        w.content.classList.remove('open');
                        w.toggle?.classList.remove('active');
                    }
                });
            }, { passive: true });
        },

        recordExistingLinks: () => {
            // 4. Καταγραφή υπαρχόντων links και από τα δύο widgets 
            App.widgets.forEach(w => {
                const existingLinks = w.hub.querySelectorAll('.hub-links a');
                existingLinks.forEach(a => App.seenUrls.add(a.href.split('?')[0].split('#')[0]));
            });
        },

        fetchPosts: async () => {
            try {
                // 5. Κατέβασμα δεδομένων ΜΟΝΟ 1 ΦΟΡΑ (Ταχύτητα)
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                    return fetch(url)
                        .then(res => res.ok ? res.json() : null)
                        .catch(() => null); // Αν μια ετικέτα αποτύχει, δεν καταστρέφει τις άλλες
                });

                const results = await Promise.all(promises);
                const listItems = []; // Προσωρινή αποθήκη για τα <li>

                results.forEach(data => {
                    if (!data || !data.feed || !data.feed.entry) return;
                    data.feed.entry.forEach(entry => {
                        const linkObj = entry.link.find(l => l.rel === 'alternate');
                        if (!linkObj) return;

                        const cleanLink = linkObj.href.split('?')[0].split('#')[0];
                        if (App.seenUrls.has(cleanLink)) return;
                        
                        App.seenUrls.add(cleanLink);
                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx"></span></a>`;
                        li.querySelector('.hub-tx').textContent = text;
                        listItems.push(li); // Το αποθηκεύουμε στη μνήμη
                    });
                });

                // 6. Κλωνοποίηση (Copy-Paste) του κάθε άρθρου στα ενεργά widgets
                if (listItems.length > 0) {
                    App.widgets.forEach(w => {
                        if (w.dynamicContainer) {
                            const fragment = document.createDocumentFragment();
                            listItems.forEach(li => {
                                fragment.appendChild(li.cloneNode(true)); // cloneNode = ασφαλής κλωνοποίηση
                            });
                            w.dynamicContainer.appendChild(fragment);
                        }
                    });
                }
            } catch (err) {}
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();
