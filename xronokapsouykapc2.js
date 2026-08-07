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

    const DataEngine = {
      isFetching: false,
        fetchPosts: async () => {
            if (DataEngine.isFetching) return; // <-- 2. ΑΝ ΦΟΡΤΩΝΕΙ, ΑΓΝΟΗΣΕ ΤΟ ΚΛΙΚ
            DataEngine.isFetching = true;      // <-- 3. ΚΛΕΙΔΩΣΕ ΤΟ

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

                DataEngine.processSingleEntry(finalData.feed.entry[0]);

            } catch (err) {
                console.warn('Χρονοκάψουλα:', err.message);
                if (DOM.title) DOM.title.innerText = "Σφάλμα Φόρτωσης";
                if (DOM.desc) DOM.desc.innerText = "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.";
            } finally {
                DataEngine.isFetching = false; // <-- 4. ΠΡΟΣΘΕΣΕ ΤΟ ΞΕΚΛΕΙΔΩΜΑ ΣΤΟ ΤΕΛΟΣ
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

            UIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

    const UIEngine = {
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
        },
      createArrowHint: (engineRef) => {
            if (!DOM.widget || document.getElementById('stc-arrow')) return;
            
            const arrow = document.createElement('div');
            arrow.id = 'stc-arrow';
            arrow.innerHTML = '&#10095;'; // Το μίνιμαλ σύμβολο ❯
            
            // Το στυλ μπαίνει δυναμικά
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
                padding: 10px; /* Μεγάλη περιοχή για να πατιέται εύκολα */
                text-shadow: 0 2px 4px rgba(0,0,0,0.5); /* Για να φαίνεται σε κάθε φόντο */
            `;
            
            // Αν το πατήσει, λειτουργεί σαν swipe!
            arrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                engineRef.triggerReRoll();
            });

            DOM.widget.appendChild(arrow);
            DOM.arrow = arrow;
            
            // Native JS Animation: Πάλλεται απαλά προς τα δεξιά
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
    };
const DragEngine = {
        isDragging: false,
        startX: 0,
        startY: 0,
        
        init: () => {
            if (!DOM.widget) return;
            
            // --- UX BΕΛΤΙΩΣΕΙΣ ---
            DOM.widget.style.cursor = "grab"; // Ανοιχτό χεράκι
            DOM.widget.style.userSelect = "none"; // Μπλοκάρει την επιλογή κειμένου
            DOM.widget.ondragstart = () => false; // Μπλοκάρει το "φάντασμα" της εικόνας!
            
            // 1. Πάτημα (MouseDown)
            DOM.widget.addEventListener('mousedown', (e) => {
                // Αν έκανε κλικ σε Link/Κουμπί ή δεξί κλικ, αγνόησέ το!
                if (e.target.closest('a') || e.button !== 0) return;
                
                DragEngine.isDragging = true;
                DragEngine.startX = e.pageX;
                DragEngine.startY = e.pageY;
                DOM.widget.style.cursor = "grabbing"; // Κλειστό χεράκι (πιάνει)
            });
            
            // 2. Άφημα (MouseUp) 
            // Το βάζουμε στο 'window' ώστε αν σύρει το ποντίκι πολύ γρήγορα και βγει έξω από το κουτί, να μην "κολλήσει" το widget.
            window.addEventListener('mouseup', (e) => {
                if (!DragEngine.isDragging) return;
                
                DragEngine.isDragging = false;
                DOM.widget.style.cursor = "grab"; // Επαναφορά σε ανοιχτό χεράκι
                
                const deltaX = DragEngine.startX - e.pageX; // Θετικό = σύρσιμο αριστερά
                const deltaY = Math.abs(DragEngine.startY - e.pageY); 
                
                // Στο PC βάζουμε 80px (η οθόνη είναι μεγάλη) και ελέγχουμε αν η κίνηση ήταν οριζόντια
                if (deltaX > 80 && deltaX > deltaY) {
                    DragEngine.triggerReRoll();
                }
            });
        },
        
        triggerReRoll: () => {
            if (DataEngine.isFetching) return;
          // --- ΠΡΟΣΘΕΣΕ ΑΥΤΕΣ ΤΙΣ 2 ΓΡΑΜΜΕΣ ---
            if (DOM.arrow) DOM.arrow.remove(); 
            DOM.arrow = null;
            
            DOM.widget.style.transition = "opacity 0.3s";
            DOM.widget.style.opacity = "0.5";
            DOM.title.innerText = "Αναζήτηση μνήμης...";
            
            DataEngine.fetchPosts().finally(() => {
                DOM.widget.style.opacity = "1";
                UIEngine.createDust(); 
            });
        }
    };
    const App = {
        init: () => {
            DOM.widget = document.getElementById("stc-widget");
            if (!DOM.widget) return;

            DOM.img = document.getElementById("stc-image");
            DOM.title = document.getElementById("stc-title");
            DOM.desc = document.getElementById("stc-desc");
            DOM.badge = document.getElementById("stc-badge");
            DOM.date = document.getElementById("stc-date");
            DOM.btnLink = document.getElementById("stc-btn-link");

            DataEngine.fetchPosts();
            UIEngine.createDust();
          UIEngine.createArrowHint(DragEngine);
          DragEngine.init();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();
