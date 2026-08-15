(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Διαπαιδαγώγηση", "Ψυχολογία", "Σχολείο", "Υγεία", "Παιχνίδι", "Σελίδες", "Γενικά"],
        maxResults: 3,
        defaultEmoji: "📌"
    });

    const DOM = {};

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

    const MobileDataEngine = {
        seenUrls: new Set(),
        init: () => {
            if (!DOM.dynamicContainer) return;
            MobileDataEngine.recordExistingLinks();
            MobileDataEngine.fetchPosts();
        },
        recordExistingLinks: () => {
            if (!DOM.hub) return;
            const existingLinks = DOM.hub.querySelectorAll('.hub-links a');
            existingLinks.forEach(a => MobileDataEngine.seenUrls.add(a.href.split('?')[0].split('#')[0]));
        },
        fetchPosts: async () => {
            try {
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                   return fetch(url)
                        .then(res => res.ok ? res.json() : null)
                        .catch(err => null);
                });

                const results = await Promise.all(promises);
                const fragment = document.createDocumentFragment();

                results.forEach(data => {
                if (!data || !data.feed || !data.feed.entry) return;
                    data.feed.entry.forEach(entry => {
                        const linkObj = entry.link.find(l => l.rel === 'alternate');
                        if (!linkObj) return;

                        const cleanLink = linkObj.href.split('?')[0].split('#')[0];
                        if (MobileDataEngine.seenUrls.has(cleanLink)) return;
                        
                        MobileDataEngine.seenUrls.add(cleanLink);
                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                       const li = document.createElement('li');
                        // Βάζουμε μόνο τα ασφαλή κομμάτια στο HTML
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx"></span></a>`;
                        // Προσθέτουμε τον τίτλο ως απλό, ασφαλές κείμενο
                        li.querySelector('.hub-tx').textContent = text;
                        fragment.appendChild(li);
                    });
                });
                DOM.dynamicContainer.appendChild(fragment);
            } catch (err) {}
        }
    };

    const MobileUIManager = {
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

    const MobileApp = {
        init: () => {
            // 1. Γεμίζουμε το DOM με τα στοιχεία του mobile ΑΦΟΥ έχει φορτώσει η σελίδα
            DOM.hub = document.getElementById("smart-hub-mobile");
            DOM.content = document.getElementById("hub-content-mobile");
            DOM.toggle = document.getElementById("hub-toggle-mobile");
            DOM.dynamicContainer = document.getElementById("dynamic-posts-container-mobile");

            if (!DOM.hub) return;

            // 2. Δένουμε το κουμπί απευθείας μέσω Javascript
            if (DOM.toggle) DOM.toggle.addEventListener('click', MobileUIManager.toggleMenu);

            MobileDataEngine.init();
            window.addEventListener('click', MobileUIManager.closeMenu, { passive: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }
})();
