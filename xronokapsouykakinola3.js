(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Δράσεις 14-25"], 
        fallbackImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
    });

    const DOM = {};

   const Utils = {
        cleanText: (htmlStr) => {
            if (!htmlStr) return "";
            // Ο DOMParser διαβάζει το HTML χωρίς να ενεργοποιεί λήψεις (downloads) πολυμέσων
            const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
            return (doc.body.textContent || doc.body.innerText || "").replace(/\s+/g, ' ').trim();
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

                // 1. ΤΕΛΟΣ ΤΟ ΟΡΙΟ ΤΩΝ 500! Τώρα η ρουλέτα βρίσκει τυχαίο αριθμό ως το πραγματικό σύνολο (π.χ. 800)
                const randomIndex = Math.floor(Math.random() * totalPosts) + 1;

                const finalUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=${randomIndex}`;
                const finalRes = await fetch(finalUrl);
                const finalData = await finalRes.json();

                // 2. ΑΣΦΑΛΕΙΑ (Blogger Bug): Αν ο τυχαίος αριθμός έπεσε σε διεγραμμένο/πρόχειρο άρθρο, 
                // το finalData θα είναι κενό. Για να μην κρασάρει, δείχνουμε αθόρυβα το πιο πρόσφατο 
                // άρθρο (το οποίο το έχουμε ήδη κατεβασμένο έτοιμο στο metaData)!
                const entry = (finalData.feed && finalData.feed.entry) ? finalData.feed.entry[0] : metaData.feed.entry[0];

                MobileDataEngine.processSingleEntry(entry);

       } catch (err) {
                console.warn('Χρονοκάψουλα:', err.message);
                MobileUIEngine.updateCard(
                    CONFIG.fallbackImg, 
                    "Σφάλμα Φόρτωσης", 
                    "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.", 
                    "Σφάλμα", 
                    "--", 
                    "#"
                );
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

          // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
            let desc = Utils.cleanText(entry.summary?.$t || entry.content?.$t || "");
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
            DOM.imgs.forEach(el => el.src = img);
            DOM.titles.forEach(el => el.innerText = title);
            DOM.descs.forEach(el => el.innerText = desc || "Διαβάστε περισσότερα...");
            DOM.badges.forEach(el => el.innerText = badge);
            DOM.dates.forEach(el => el.innerText = date);
            DOM.btnLinks.forEach(el => el.href = link);
        },

        createDust: () => {
            DOM.widgets.forEach(widget => {
                widget.querySelectorAll('.stc-dust').forEach(el => el.remove());
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
                widget.appendChild(fragment);
            });
        },

        createArrowHint: (engineRef) => {
            DOM.widgets.forEach(widget => {
                if (widget.querySelector('.stc-arrow')) return; 
                
                const arrow = document.createElement('div');
                arrow.className = 'stc-arrow'; // Το κάναμε class αντί για id για να παίζει παντού
                arrow.innerHTML = '&#10095;'; 
                
                arrow.style.cssText = `
                    position: absolute; right: 15px; top: 50%; margin-top: -20px;
                    color: rgba(255, 255, 255, 0.8); font-size: 26px; cursor: pointer;
                    z-index: 20; user-select: none; padding: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                `;
                
                arrow.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    engineRef.triggerReRoll();
                });

                widget.appendChild(arrow);
                
                arrow.animate([
                    { transform: 'translateX(0)', opacity: 0.5 },
                    { transform: 'translateX(6px)', opacity: 1 },
                    { transform: 'translateX(0)', opacity: 0.5 }
                ], { duration: 1500, iterations: Infinity, easing: 'ease-in-out' });
            });
        }
    };
 const SwipeEngine = {
        startX: 0,
        startY: 0,
        isDragging: false, // <-- Προστέθηκε για το PC!
        
      init: () => {
            DOM.widgets.forEach(widget => {
                // Μπλοκάρει τα native οριζόντια gestures (πίσω/μπροστά) του browser
                widget.style.touchAction = "pan-y";
                
                // --- 1. ΑΦΗ (ΚΙΝΗΤΟ) ---
                widget.addEventListener('touchstart', (e) => {
                    SwipeEngine.startX = e.changedTouches[0].screenX;
                    SwipeEngine.startY = e.changedTouches[0].screenY;
                }, { passive: true });
                
                widget.addEventListener('touchend', (e) => {
                    const endX = e.changedTouches[0].screenX;
                    const endY = e.changedTouches[0].screenY;
                   // ΜΕΣΑ ΣΤΟ touchend (ΚΙΝΗΤΟ)
                    const deltaX = Math.abs(SwipeEngine.startX - endX);
                    const deltaY = Math.abs(SwipeEngine.startY - endY);
                    if (deltaX > 50 && deltaX > deltaY) SwipeEngine.triggerReRoll();
                }, { passive: true });

                // --- 2. ΠΟΝΤΙΚΙ (ΥΠΟΛΟΓΙΣΤΗΣ) ---
                widget.style.cursor = "grab";
                widget.style.userSelect = "none";
                widget.ondragstart = () => false;

                widget.addEventListener('mousedown', (e) => {
                    if (e.target.closest('a') || e.button !== 0) return;
                    SwipeEngine.isDragging = true;
                    SwipeEngine.startX = e.pageX;
                    SwipeEngine.startY = e.pageY;
                    widget.style.cursor = "grabbing";
                });
            });

            // Το mouseup μπαίνει στο window για να μην κολλάει αν βγει το ποντίκι έξω
            window.addEventListener('mouseup', (e) => {
                if (!SwipeEngine.isDragging) return;
                SwipeEngine.isDragging = false;
                
                DOM.widgets.forEach(w => w.style.cursor = "grab");
                
             // ΜΕΣΑ ΣΤΟ mouseup (ΥΠΟΛΟΓΙΣΤΗΣ)
                const deltaX = Math.abs(SwipeEngine.startX - e.pageX);
                const deltaY = Math.abs(SwipeEngine.startY - e.pageY);
                if (deltaX > 80 && deltaX > deltaY) SwipeEngine.triggerReRoll();
            });
        },
        
        triggerReRoll: () => {
            if (MobileDataEngine.isFetching) return;
            
            DOM.widgets.forEach(widget => {
                //const arrow = widget.querySelector('.stc-arrow');
                //if (arrow) arrow.remove();
                widget.style.transition = "opacity 0.3s";
                widget.style.opacity = "0.5";
            });
            
            DOM.titles.forEach(title => title.innerText = "Αναζήτηση μνήμης...");
            
            MobileDataEngine.fetchPosts().finally(() => {
                DOM.widgets.forEach(widget => widget.style.opacity = "1");
                MobileUIEngine.createDust(); 
            });
        }
    };

   const MobileApp = {
        init: () => {
            // Χρησιμοποιούμε querySelectorAll για να πιάσουμε ΚΑΙ του PC ΚΑΙ του κινητού
            DOM.widgets = document.querySelectorAll("#stc-widget, #stc-widget-mobile");
            if (DOM.widgets.length === 0) return;

            DOM.imgs = document.querySelectorAll("#stc-image, #stc-image-mobile");
            DOM.titles = document.querySelectorAll("#stc-title, #stc-title-mobile");
            DOM.descs = document.querySelectorAll("#stc-desc, #stc-desc-mobile");
            DOM.badges = document.querySelectorAll("#stc-badge, #stc-badge-mobile");
            DOM.dates = document.querySelectorAll("#stc-date, #stc-date-mobile");
            DOM.btnLinks = document.querySelectorAll("#stc-btn-link, #stc-btn-link-mobile");

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
