(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION & SETTINGS
    // ==========================================
    const CONFIG = Object.freeze({
        labels: ["Δράσεις 14-25"], // Βάλε κι άλλες αν θες, π.χ. "Γιορτές"
        maxResults: 150,
        fallbackImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80",
        mobileBreakpoint: 768,
        debounceDelay: 150,
        // Ρυθμίσεις Γραμμής (Διαχωριστικό Κινητού)
        separator: {
            thickness: "6px",
            color: "#eaeaea",
            marginTop: "30px",
            marginBottom: "30px",
            width: "102%"
        }
    });

    // ==========================================
    // 2. DOM CACHE (Αποθήκευση στη Μνήμη)
    // ==========================================
    const DOM = {
        widget: null,
        img: null,
        title: null,
        desc: null,
        badge: null,
        date: null,
        btnLink: null,
        origLoc: null,
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
        cleanText: (htmlStr) => {
            let temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            let text = temp.textContent || temp.innerText || "";
            return text.replace(/\s+/g, ' ').trim();
        }
    };

    // ==========================================
    // 4. DATA ENGINE (Λήψη & Επεξεργασία Feeds)
    // ==========================================
    const DataEngine = {
        fetchPosts: async () => {
            try {
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/default/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                    return fetch(url).then(res => res.json());
                });

                const results = await Promise.all(promises);
                let allEntries = [];
                
                results.forEach(data => {
                    if (data.feed?.entry) allEntries = allEntries.concat(data.feed.entry);
                });

                if (!allEntries.length) throw new Error("Δεν βρέθηκαν αναρτήσεις.");

                // Φιλτράρισμα διπλότυπων
                const seenUrls = new Set();
                const uniqueEntries = allEntries.filter(entry => {
                    const link = entry.link.find(l => l.rel === 'alternate')?.href;
                    if (!link || seenUrls.has(link)) return false;
                    seenUrls.add(link);
                    return true;
                });

                DataEngine.processRandomEntry(uniqueEntries);

            } catch (err) {
                console.warn('Χρονοκάψουλα:', err.message);
                if (DOM.title) DOM.title.innerText = "Σφάλμα Φόρτωσης";
                if (DOM.desc) DOM.desc.innerText = "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.";
            }
        },

        processRandomEntry: (entries) => {
            const entry = entries[Math.floor(Math.random() * entries.length)];
            
            // Τίτλος & Link
            const title = entry.title.$t || 'Χωρίς Τίτλο';
            const postLink = entry.link.find(l => l.rel === 'alternate')?.href || '#';

            // Εικόνα
            let imgSrc = CONFIG.fallbackImg;
            if (entry.media$thumbnail) {
                imgSrc = entry.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?\//, "/s600/");
            } else if (entry.content?.$t) {
                const imgMatch = entry.content.$t.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imgSrc = imgMatch[1];
            }

            // Περιγραφή (Snippet)
            let desc = entry.snippet || Utils.cleanText(entry.content?.$t || "");
            if (desc.length > 80) desc = desc.substring(0, 80) + '...';

            // Ημερομηνία & Badge
            const pubDate = new Date(entry.published.$t);
            const months = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];
            const dateStr = `${months[pubDate.getMonth()]} ${pubDate.getFullYear()}`;
            
            const yearsAgo = new Date().getFullYear() - pubDate.getFullYear();
            let badgeText = yearsAgo === 0 ? "Πρόσφατο" : yearsAgo === 1 ? "Πέρυσι" : `${yearsAgo} Χρόνια Πριν`;

            UIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

    // ==========================================
    // 5. UI ENGINE (Οπτικά Εφέ & DOM)
    // ==========================================
    const UIEngine = {
        updateCard: (img, title, desc, badge, date, link) => {
            if (!DOM.widget) return;
            DOM.img.src = img;
            DOM.title.innerText = title;
            DOM.desc.innerText = desc || "Διαβάστε περισσότερα για αυτή τη σχολική στιγμή...";
            DOM.badge.innerText = badge;
            DOM.date.innerText = date;
            DOM.btnLink.href = link;
        },

        createDust: () => {
            if (!DOM.widget) return;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < 15; i++) {
                let dust = document.createElement("div");
                dust.className = "stc-dust";
                
                dust.style.width = dust.style.height = (Math.random() * 4 + 1) + "px";
                dust.style.left = (Math.random() * 100) + "%";
                dust.style.top = (Math.random() * 100) + "%";
                dust.style.animationDuration = (Math.random() * 10 + 5) + "s";
                dust.style.animationDelay = (Math.random() * 5) + "s";
                
                fragment.appendChild(dust);
            }
            DOM.widget.appendChild(fragment);
        }
    };

    // ==========================================
    // 6. LAYOUT MANAGER (Μετακίνηση στα Κινητά)
    // ==========================================
    const LayoutManager = {
        getOrCreateWrapper: () => {
            if (DOM.mobileWrapper) return DOM.mobileWrapper;
            
            let wrapper = document.getElementById("stc-mobile-wrapper");
            if (!wrapper) {
                wrapper = document.createElement("div");
                wrapper.id = "stc-mobile-wrapper";
                wrapper.style.cssText = "margin: 20px 0 !important; width: 100% !important; display: block !important;";
                
                let hrLine = document.createElement("hr");
                const s = CONFIG.separator;
                hrLine.style.cssText = `border: 0; border-top: ${s.thickness} solid ${s.color}; margin-top: ${s.marginTop}; margin-bottom: ${s.marginBottom}; width: ${s.width}; margin-left: auto; margin-right: auto;`;
                
                wrapper.appendChild(hrLine);
            }
            DOM.mobileWrapper = wrapper;
            return wrapper;
        },

        move: () => {
            if (!DOM.origLoc || !DOM.widget) return;

            if (window.innerWidth <= CONFIG.mobileBreakpoint) {
                // Κινητό: Εύρεση Στόχου (smart-hub ή HTML13)
                let target = document.getElementById("smart-hub") || document.getElementById("HTML13");
                if (target) {
                    const wrapper = LayoutManager.getOrCreateWrapper();
                    if (wrapper.parentNode !== target.parentNode || wrapper.previousSibling !== target) {
                        target.after(wrapper);
                    }
                    if (DOM.widget.parentNode !== wrapper) {
                        wrapper.appendChild(DOM.widget);
                    }
                }
            } else {
                // Desktop: Επαναφορά
                if (DOM.widget.parentNode !== DOM.origLoc.parentNode) {
                    DOM.origLoc.parentNode.insertBefore(DOM.widget, DOM.origLoc.nextSibling);
                }
                if (DOM.mobileWrapper?.parentNode) {
                    DOM.mobileWrapper.remove();
                }
            }
        }
    };

    // ==========================================
    // 7. BOOTSTRAP (Εκκίνηση)
    // ==========================================
    const App = {
        init: () => {
            // Αρχικοποίηση DOM Cache
            DOM.widget = document.getElementById("stc-widget");
            DOM.origLoc = document.getElementById("stc-original-location");
            if (!DOM.widget) return;

            DOM.img = document.getElementById("stc-image");
            DOM.title = document.getElementById("stc-title");
            DOM.desc = document.getElementById("stc-desc");
            DOM.badge = document.getElementById("stc-badge");
            DOM.date = document.getElementById("stc-date");
            DOM.btnLink = document.getElementById("stc-btn-link");

            // Εκτέλεση Λειτουργιών
            DataEngine.fetchPosts();
            UIEngine.createDust();
            
            // Τοποθέτηση & Resize
            LayoutManager.move();
            window.addEventListener('resize', Utils.debounce(LayoutManager.move, CONFIG.debounceDelay), { passive: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }

})();
