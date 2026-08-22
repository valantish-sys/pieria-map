(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Σύνδεσμοι"],
        maxResults: 53,
        defaultEmoji: "📌"
    });

   const DOM = {};

  const Utils = {
        parseTitle: (rawTitle) => {
            let emoji = CONFIG.defaultEmoji;
            let text = rawTitle.trim();
            // Προστέθηκαν modifiers και ZWJ ώστε να μην κόβονται στη μέση τα σύνθετα emojis (π.χ. 👨‍💻, ❤️)
            const emojiMatch = text.match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\u200D\uFE0F\u{E0020}-\u{E007F}]+)\s*(.*)/u);
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
                        if (DataEngine.seenUrls.has(cleanLink)) return;
                        
                        DataEngine.seenUrls.add(cleanLink);
                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                       const li = document.createElement('li');
                        // Βάζουμε μόνο τα σίγουρα HTML στοιχεία
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx"></span></a>`;
                        // Προσθέτουμε τον τίτλο με απόλυτη ασφάλεια (ως απλό κείμενο)
                        li.querySelector('.hub-tx').textContent = text;
                        fragment.appendChild(li);
                    });
                });
                DOM.dynamicContainer.appendChild(fragment);
            } catch (err) {}
        }
    };

   const UIManager = {
        toggleMenu: (e) => {
            // Αφαιρέθηκε το e.stopPropagation() για να μην εμποδίζει άλλα στοιχεία της σελίδας να κλείνουν ομαλά
            if (DOM.content && DOM.toggle) {
                DOM.content.classList.toggle("open");
                DOM.toggle.classList.toggle("active");
            }
        },
        closeMenu: (e) => {
            // Προστασία: Αν το κλικ έγινε πάνω στο ίδιο το κουμπί toggle, αγνόησέ το (το χειρίζεται η toggleMenu)
            if (DOM.toggle && DOM.toggle.contains(e.target)) return;

            if (DOM.content?.classList.contains('open') && DOM.hub && !DOM.hub.contains(e.target)) {
                DOM.content.classList.remove('open');
                DOM.toggle?.classList.remove('active');
            }
        }
    };

    const App = {
        init: () => {
            // 1. Γεμίζουμε το DOM με τα στοιχεία του hub2 ΑΦΟΥ έχει φορτώσει η σελίδα
            DOM.hub = document.getElementById("smart-hub2");
            DOM.content = document.getElementById("hub-content2");
            DOM.toggle = document.getElementById("hub-toggle2");
            DOM.dynamicContainer = document.getElementById("dynamic-posts-container2");

            if (!DOM.hub) return;

            // 2. Δένουμε το κουμπί απευθείας μέσω Javascript (καταργεί το onclick του HTML)
           if (DOM.toggle) DOM.toggle.addEventListener('click', UIManager.toggleMenu);

            DataEngine.init();
            // Η προσθήκη του touchstart επιτρέπει το κλείσιμο του μενού με πάτημα στο κενό στα iPhone/iPad
            ['click', 'touchstart'].forEach(evt => 
                window.addEventListener(evt, UIManager.closeMenu, { passive: true })
            );
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();
