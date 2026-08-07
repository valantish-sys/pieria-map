(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Δράσεις 14-25"], 
        fallbackImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
    });

    const DOM = {};

    const Utils = {
        cleanText: (htmlStr) => {
            let temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            return (temp.textContent || temp.innerText || "").replace(/\s+/g, ' ').trim();
        }
    };

    const MobileDataEngine = {
      isFetching: false,
        fetchPosts: async () => {
            if (MobileDataEngine.isFetching) return; // <-- 2. ΑΝ ΦΟΡΤΩΝΕΙ ΗΔΗ, ΑΓΝΟΗΣΕ ΤΟ ΚΛΙΚ/SWIPE
            MobileDataEngine.isFetching = true;      // <-- 3. ΚΛΕΙΔΩΣΕ ΤΟ

            try {
                const randomLabel = CONFIG.labels[Math.floor(Math.random() * CONFIG.labels.length)];
                const encodedLabel = encodeURIComponent(randomLabel);

                const metaUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`;
                const metaRes = await fetch(metaUrl);
                const metaData = await metaRes.json();

                const totalPosts = parseInt(metaData.feed.openSearch$totalResults.$t, 10);
                if (totalPosts === 0) throw new Error("Δεν βρέθηκαν αναρτήσεις.");

                const randomIndex = Math.floor(Math.random() * totalPosts) + 1;

                const finalUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=${randomIndex}`;
                const finalRes = await fetch(finalUrl);
                const finalData = await finalRes.json();

                MobileDataEngine.processSingleEntry(finalData.feed.entry[0]);

            } catch (err) {
                console.warn('Χρονοκάψουλα Mobile:', err.message);
                if (DOM.title) DOM.title.innerText = "Σφάλμα Φόρτωσης";
                if (DOM.desc) DOM.desc.innerText = "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.";
            } finally {
                MobileDataEngine.isFetching = false; // <-- 4. ΠΡΟΣΘΕΣΕ ΤΟ FINALLY (Ξεκλειδώνει ό,τι κι αν γίνει)
            }
        },

        processSingleEntry: (entry) => {
            if (!entry) return;
            
            const title = entry.title.$t || 'Χωρίς Τίτλο';
            const postLink = entry.link.find(l => l.rel === 'alternate')?.href || '#';

            let imgSrc = CONFIG.fallbackImg;
            if (entry.media$thumbnail) {
                imgSrc = entry.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?\//, "/s600/");
            } else if (entry.content?.$t) {
                const imgMatch = entry.content.$t.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imgSrc = imgMatch[1];
            }

            let desc = entry.snippet || Utils.cleanText(entry.content?.$t || "");
            if (desc.length > 80) desc = desc.substring(0, 80) + '...';

            const pubDate = new Date(entry.published.$t);
            const months = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];
            const dateStr = `${months[pubDate.getMonth()]} ${pubDate.getFullYear()}`;
            
            const yearsAgo = new Date().getFullYear() - pubDate.getFullYear();
            let badgeText = yearsAgo === 0 ? "Πρόσφατο" : yearsAgo === 1 ? "Πέρυσι" : `${yearsAgo} Χρόνια Πριν`;

            MobileUIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

    const MobileUIEngine = {
        updateCard: (img, title, desc, badge, date, link) => {
            if (!DOM.widget) return;
            DOM.img.src = img;
            DOM.title.innerText = title;
            DOM.desc.innerText = desc || "Διαβάστε περισσότερα...";
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
        }, // <--- 1. ΠΡΟΣΟΧΗ: ΕΔΩ ΒΑΛΑΜΕ ΚΟΜΜΑ ΓΙΑ ΝΑ ΣΥΝΕΧΙΣΕΙ!

        createArrowHint: (engineRef) => {
            if (!DOM.widget || document.getElementById('stc-arrow')) return;
            
            const arrow = document.createElement('div');
            arrow.id = 'stc-arrow';
            arrow.innerHTML = '&#10095;'; 
            
            arrow.style.cssText = `
                position: absolute;
                right: 15px;
                top: 50%;
                margin-top: -20px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 26px;
                cursor: pointer;
                z-index: 20;
                user-select: none;
                padding: 10px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            `;
            
            arrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                engineRef.triggerReRoll();
            });

            DOM.widget.appendChild(arrow);
            DOM.arrow = arrow;
            
            arrow.animate([
                { transform: 'translateX(0)', opacity: 0.5 },
                { transform: 'translateX(6px)', opacity: 1 },
                { transform: 'translateX(0)', opacity: 0.5 }
            ], {
                duration: 1500,
                iterations: Infinity,
                easing: 'ease-in-out'
            });
        }
    }; // <--- 2. ΕΔΩ ΚΛΕΙΝΕΙ ΟΡΙΣΤΙΚΑ ΤΟ MobileUIEngine (ΜΕΤΑ ΤΟ ΒΕΛΑΚΙ)
  const SwipeEngine = {
        startX: 0,
        startY: 0,
        
        init: () => {
            if (!DOM.widget) return;
            
            // Καταγράφουμε πού ακούμπησε το δάχτυλο
            DOM.widget.addEventListener('touchstart', (e) => {
                SwipeEngine.startX = e.changedTouches[0].screenX;
                SwipeEngine.startY = e.changedTouches[0].screenY;
            }, { passive: true }); // Senior tip: passive true = ομαλό σκρολάρισμα (60fps) χωρίς κολλήματα!
            
            // Υπολογίζουμε την κίνηση όταν σηκωθεί το δάχτυλο
            DOM.widget.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].screenX;
                const endY = e.changedTouches[0].screenY;
                
                const deltaX = SwipeEngine.startX - endX; // Θετικό = σύρσιμο προς αριστερά
                const deltaY = Math.abs(SwipeEngine.startY - endY); // Κάθετη κίνηση
                
                // Έλεγχος: Κινήθηκε αριστερά > 50px ΚΑΙ η κίνηση ήταν οριζόντια (όχι κάθετο σκρολάρισμα);
                if (deltaX > 50 && deltaX > deltaY) {
                    SwipeEngine.triggerReRoll();
                }
            }, { passive: true });
        },
        
        triggerReRoll: () => {
            if (MobileDataEngine.isFetching) return;
            if (DOM.arrow) DOM.arrow.remove(); 
            DOM.arrow = null;
            // Άμεσο οπτικό feedback: Χαμηλώνουμε τη φωτεινότητα για να καταλάβει ο χρήστης ότι το swipe έπιασε!
            DOM.widget.style.transition = "opacity 0.3s";
            DOM.widget.style.opacity = "0.5";
            DOM.title.innerText = "Αναζήτηση μνήμης...";
            
            // Ζητάμε επιτόπου νέα μνήμη. Όταν τελειώσει (finally), την εμφανίζουμε!
            MobileDataEngine.fetchPosts().finally(() => {
                DOM.widget.style.opacity = "1"; // Επαναφορά
                MobileUIEngine.createDust();    // Ρίχνουμε και φρέσκια αστερόσκονη στο νέο άρθρο!
            });
        }
    };

    const MobileApp = {
        init: () => {
            DOM.widget = document.getElementById("stc-widget-mobile");
            if (!DOM.widget) return;

            DOM.img = document.getElementById("stc-image-mobile");
            DOM.title = document.getElementById("stc-title-mobile");
            DOM.desc = document.getElementById("stc-desc-mobile");
            DOM.badge = document.getElementById("stc-badge-mobile");
            DOM.date = document.getElementById("stc-date-mobile");
            DOM.btnLink = document.getElementById("stc-btn-link-mobile");

            MobileDataEngine.fetchPosts();
            MobileUIEngine.createDust();
          MobileUIEngine.createArrowHint(SwipeEngine);
          SwipeEngine.init();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }
})();
