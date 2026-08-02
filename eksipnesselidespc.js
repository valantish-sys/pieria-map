(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Διαπαιδαγώγηση", "Ψυχολογία", "Σχολείο", "Υγεία", "Παιχνίδι", "Σελίδες", "Γενικά"],
        maxResults: 3,
        defaultEmoji: "📌"
    });

    const DOM = {
        hub: document.getElementById("smart-hub"),
        content: document.getElementById("hub-content"),
        toggle: document.getElementById("hub-toggle"),
        dynamicContainer: document.getElementById("dynamic-posts-container")
    };

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
            existingLinks.forEach(a => DataEngine.seenUrls.add(a.href.split('?')[0].split('#')[0]));
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
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx">${text}</span></a>`;
                        fragment.appendChild(li);
                    });
                });
                DOM.dynamicContainer.appendChild(fragment);
            } catch (err) {}
        }
    };

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

    const App = {
        init: () => {
            if (!DOM.hub) return;
            window.toggleSmartHub = UIManager.toggleMenu; // Εξαγωγή για το onclick στο HTML
            DataEngine.init();
            window.addEventListener('click', UIManager.closeMenu, { passive: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();
