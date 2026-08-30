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
       // 1. Προσθήκη κενών πριν από block-level στοιχεία για αποφυγή συγχώνευσης λέξεων
            // Προστέθηκαν tags λιστών (ul, ol) και πινάκων (table, tr, td, th)
            const spacedStr = htmlStr.replace(/<\/?(p|div|br|h[1-6]|li|blockquote|table|tr|th|td|ul|ol)[^>]*>/gi, ' ');
            const doc = new DOMParser().parseFromString(spacedStr, 'text/html');
            
            // 2. Αφαίρεση tags κώδικα (scripts/styles) για να μην εμφανίζονται μέσα στην περίληψη
            doc.querySelectorAll('script, style').forEach(el => el.remove());
            
            return (doc.body.textContent || doc.body.innerText || "").replace(/\s+/g, ' ').trim();
        }
    };

   const MobileDataEngine = {
      isFetching: false,
      validLabels: null, // ΝΕΟ: Αποθηκεύει τις ετικέτες δυναμικά 
       fetchPosts: async (retryCount = 0) => {
            // ΝΕΟ: Επιτρέπουμε να τρέξει ξανά (bypass) μόνο αν κάνει αυτόματη επανακλήρωση (retry)
            if (MobileDataEngine.isFetching && retryCount === 0) return;
            MobileDataEngine.isFetching = true;

            try {
                // --- ΝΕΟ: 1. Δυναμική εύρεση ετικετών (εκτελείται αόρατα μόνο την 1η φορά) ---
                if (!MobileDataEngine.validLabels) {
                    const catRes = await fetch('/feeds/posts/summary?alt=json&max-results=0');
                    const catData = await catRes.json();
                    const allCategories = catData.feed.category || [];
                    
                    MobileDataEngine.validLabels = allCategories
                        .map(c => c.term)
                        .filter(term => {
                            // Αφαιρούμε τόνους και μετατρέπουμε σε πεζά (π.χ. Δράσεις 2026 -> δρασεις 2026)
                            const cleanTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                            // Το "δρασει" πιάνει "δράσεις", "δρασεις", κτλ. αγνοώντας το τελικό σίγμα (ς)
                            return cleanTerm.includes("δρασει");
                        });

                    // Αν δεν βρει τίποτα, κρατάει την αρχική ετικέτα του CONFIG ως ασφάλεια
                    if (MobileDataEngine.validLabels.length === 0) {
                        MobileDataEngine.validLabels = CONFIG.labels;
                    }
                }

                // Επιλογή τυχαίας ετικέτας από αυτές που βρήκε δυναμικά
                const randomLabel = MobileDataEngine.validLabels[Math.floor(Math.random() * MobileDataEngine.validLabels.length)];
                const encodedLabel = encodeURIComponent(randomLabel);
                // ----------------------------------------------------------------------------

                // 1. Παίρνουμε το συνολικό αριθμό άρθρων
                const metaUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`;
                const metaRes = await fetch(metaUrl);
                const metaData = await metaRes.json();

                const totalPosts = parseInt(metaData.feed.openSearch$totalResults.$t, 10);
                if (totalPosts === 0) throw new Error("Δεν βρέθηκαν αναρτήσεις.");

                // Πλέον ΔΕΝ βάζουμε όριο στο maxAllowedIndex. Παίρνουμε ΟΛΟ το εύρος.
            // Πλέον ΔΕΝ βάζουμε όριο στο maxAllowedIndex. Παίρνουμε ΟΛΟ το εύρος.
                let randomIndex = Math.floor(Math.random() * totalPosts) + 1;
                
                // Αποτροπή εμφάνισης του ίδιου άρθρου δύο φορές συνεχόμενα (αν υπάρχουν πάνω από 1 άρθρα)
                if (totalPosts > 1 && randomIndex === MobileDataEngine.lastIndex) {
                    randomIndex = (randomIndex % totalPosts) + 1;
                }
                MobileDataEngine.lastIndex = randomIndex;
                
                let currentIndex = randomIndex;
                let publishedMax = "";

                // 2. Το "Κόλπο": Όσο ο στόχος μας είναι πάνω από 500, κάνουμε άλματα.
                while (currentIndex > 500) {
                    let skipUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=500`;
                    if (publishedMax) skipUrl += `&published-max=${encodeURIComponent(publishedMax)}`;

                    const skipRes = await fetch(skipUrl);
                    const skipData = await skipRes.json();
                    
                 if (!skipData.feed?.entry || skipData.feed.entry.length === 0) {
                        // Το Blogger μέτρησε διεγραμμένα άρθρα. Ακυρώνουμε τα άλματα και πάμε στο 1ο (πρόσφατο) άρθρο.
                        currentIndex = 1;
                        publishedMax = "";
                        break;
                    }

                    // Αποθηκεύουμε την ημερομηνία της 500ής ανάρτησης για το επόμενο βήμα
                    publishedMax = skipData.feed.entry[0].published.$t;
                    // Αφαιρούμε 499 (όχι 500), γιατί το published-max θα φέρει 1η την ανάρτηση που μόλις βρήκαμε
                    currentIndex -= 499; 
                }

                // 3. Το τελικό request με το υπόλοιπο (που πλέον είναι σίγουρα <= 500)
                let finalUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=${currentIndex}`;
                if (publishedMax) finalUrl += `&published-max=${encodeURIComponent(publishedMax)}`;

                const finalRes = await fetch(finalUrl);
                const finalData = await finalRes.json();

          let entry = finalData.feed?.entry?.[0];
                if (!entry) {
                    // Fallback Ασφαλείας: Φορτώνουμε εγγυημένα την 1η ανάρτηση αν χτυπήσαμε σε "ghost post"
                    const safeRes = await fetch(`/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`);
                    const safeData = await safeRes.json();
                    entry = safeData.feed?.entry?.[0];
                    if (!entry) throw new Error("Δεν βρέθηκαν καθόλου αναρτήσεις.");
                }

                const pubDate = new Date(entry.published.$t);
                const diffDays = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
     
                if (diffDays <= 365) {
            
                    if (Math.random() > 0.10 && retryCount < 10) {
                        return await MobileDataEngine.fetchPosts(retryCount + 1); // Αθόρυβη νέα κλήρωση!
                    }
                }
                // -------------------------------------------------------------

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
                MobileDataEngine.isFetching = false;
            }
        },

      processSingleEntry: (entry) => {
            if (!entry) return;
            
            // Η έτοιμη συνάρτηση Utils.cleanText αποκωδικοποιεί τα HTML Entities με ασφάλεια
            const title = Utils.cleanText(entry.title?.$t) || 'Χωρίς Τίτλο';
          // Ασφαλής πλοήγηση στον πίνακα link με χρήση Optional Chaining (?.)
            const postLink = entry.link?.find(l => l.rel === 'alternate')?.href || '#';

            let imgSrc = CONFIG.fallbackImg;
       if (entry.media$thumbnail) {
                // Νέα, σύγχρονη Regex που πιάνει όλες τις παραλλαγές διαστάσεων (και τις παλιές και τις νέες)
                imgSrc = entry.media$thumbnail.url.replace(/\/(s\d+|w\d+-h\d+)[^\/]*\//, "/s600/");
                // Αναβάθμιση ανάλυσης για τις μικρογραφίες ενσωματωμένων βίντεο YouTube (από 120p σε 480p)
              // Αναβάθμιση ανάλυσης για τις μικρογραφίες ενσωματωμένων βίντεο YouTube (από 120p σε 480p)
                if (imgSrc.includes('youtube.com') || imgSrc.includes('ytimg.com')) {
                    // ΝΕΟ: Η κάθετος (/) διασφαλίζει ότι αντικαθίσταται αυστηρά ΜΟΝΟ το ακριβές αρχείο
                    imgSrc = imgSrc.replace('/default.jpg', '/hqdefault.jpg');
                }
         } else if (entry.content?.$t) {
                // Επιτρέπουμε τόσο τα μονά όσο και τα διπλά εισαγωγικά, καθιστώντας την αναζήτηση case-insensitive (i)
                const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                if (imgMatch) imgSrc = imgMatch[1];
            }

            // Αυτόματη μετατροπή σε HTTPS για αποφυγή σφαλμάτων Mixed Content σε αναρτήσεις παλιών ετών
            imgSrc = imgSrc.replace(/^http:\/\//i, 'https://');

          // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
        // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
            let desc = Utils.cleanText(entry.summary?.$t || entry.content?.$t || "");
            if (desc.length > 80) {
                // Εύρεση του τελευταίου κενού διαστήματος πριν τον 80ο χαρακτήρα για να μην κόβονται λέξεις
                const lastSpace = desc.lastIndexOf(' ', 80);
                desc = desc.substring(0, lastSpace > 0 ? lastSpace : 80) + '...';
            }
            const pubDate = new Date(entry.published.$t);
            const months = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];
            const dateStr = `${months[pubDate.getMonth()]} ${pubDate.getFullYear()}`;
            
         // Υπολογισμός με βάση τις πραγματικές ημέρες, ώστε τα άρθρα της ίδιας σχολικής χρονιάς να μην εμφανίζονται ως "Πέρυσι" τον χειμώνα
         // Υπολογισμός με βάση τις πραγματικές ημέρες, ώστε τα άρθρα της ίδιας σχολικής χρονιάς να μην εμφανίζονται ως "Πέρυσι" τον χειμώνα
            const diffDays = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
            const yearsAgo = Math.max(0, Math.floor(diffDays / 365.25)); // ΝΕΟ: Αποτροπή παραγωγής αρνητικών αριθμών (-1)
            let badgeText = yearsAgo === 0 ? "Πρόσφατο" : yearsAgo === 1 ? "Πέρυσι" : `${yearsAgo} Χρόνια Πριν`;

            MobileUIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

 const MobileUIEngine = {
        updateCard: (img, title, desc, badge, date, link) => {
            DOM.imgs.forEach(el => {
                el.src = img;
                // ΝΕΟ: Αν η εικόνα του άρθρου είναι διεγραμμένη/σπασμένη (Error 404), φορτώνει αυτόματα το fallback
                el.onerror = () => {
                    el.src = CONFIG.fallbackImg;
                    el.onerror = null; // Αποτροπή ατέρμονου βρόχου αν σπάσει τυχαία και το fallback
                };
            });
            DOM.titles.forEach(el => el.innerText = title);
            DOM.descs.forEach(el => el.innerText = desc || "Διαβάστε περισσότερα...");
            DOM.badges.forEach(el => el.innerText = badge);
            DOM.dates.forEach(el => el.innerText = date);
            DOM.btnLinks.forEach(el => el.href = link);
        },

     createDust: () => {
            DOM.widgets.forEach(widget => {
                // Εγκλωβίζει τα στοιχεία αυστηρά εντός του widget αποτρέποντας τα scrollbars
                widget.style.overflow = "hidden"; 
                widget.style.position = "relative"; 
                
                widget.querySelectorAll('.stc-dust').forEach(el => el.remove());
                const fragment = document.createDocumentFragment();
              for (let i = 0; i < 15; i++) {
                    let dust = document.createElement("div");
                    dust.className = "stc-dust";
                    dust.style.pointerEvents = "none"; // Κάνει τη σκόνη "διαπερατή", αποτρέποντας το μπλοκάρισμα των κλικ
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
                
                // Προστατευτικός έλεγχος υποστήριξης για να μην καταρρέει το script σε παλιές συσκευές
                if (typeof arrow.animate === 'function') {
                    arrow.animate([
                        { transform: 'translateX(0)', opacity: 0.5 },
                        { transform: 'translateX(6px)', opacity: 1 },
                        { transform: 'translateX(0)', opacity: 0.5 }
                    ], { duration: 1500, iterations: Infinity, easing: 'ease-in-out' });
                }
            });
        }
    };
const SwipeEngine = {
        startX: 0,
        startY: 0,
        isDragging: false, // <-- Προστέθηκε για το PC!
        isZooming: false, // <-- ΝΕΟ: Παρακολούθηση κατάστασης ζουμ
        
  init: () => {
            DOM.widgets.forEach(widget => {
                // Επιτρέπει το κάθετο scroll ΚΑΙ τη μεγέθυνση (pinch-to-zoom)
                widget.style.touchAction = "pan-y pinch-zoom";
                
             // --- 1. ΑΦΗ (ΚΙΝΗΤΟ) ---
                widget.addEventListener('touchstart', (e) => {
                    if (e.touches.length > 1) {
                        SwipeEngine.isZooming = true;
                        return; // Ακύρωση ανίχνευσης αν χρησιμοποιούνται πολλά δάχτυλα (π.χ. Ζουμ)
                    }
                    SwipeEngine.isZooming = false; // Επαναφορά σε κανονικό άγγιγμα
                    SwipeEngine.startX = e.changedTouches[0].screenX;
                    SwipeEngine.startY = e.changedTouches[0].screenY;
                }, { passive: true });
                
             widget.addEventListener('touchend', (e) => {
                    // Ενσωμάτωση του ελέγχου isZooming για πλήρη αποτροπή swipe αν προηγήθηκε ζουμ
                    if (e.changedTouches.length > 1 || e.touches.length > 0 || SwipeEngine.isZooming) return; 
                    
                    const endX = e.changedTouches[0].screenX;
                    const endY = e.changedTouches[0].screenY;
                    
                   // ΜΕΣΑ ΣΤΟ touchend (ΚΙΝΗΤΟ)
                    const deltaX = Math.abs(SwipeEngine.startX - endX);
                    const deltaY = Math.abs(SwipeEngine.startY - endY);
                    
                    // Απαιτούμε η οριζόντια κίνηση (swipe) να είναι τουλάχιστον διπλάσια από την κάθετη (scroll)
                    if (deltaX > 50 && deltaX > deltaY * 2) SwipeEngine.triggerReRoll();
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
           const deltaX = Math.abs(SwipeEngine.startX - e.pageX);
                const deltaY = Math.abs(SwipeEngine.startY - e.pageY);
                // Ακυρώνουμε την αλλαγή αν ο χρήστης απλώς μαρκάρει κείμενο προς αντιγραφή
                const hasSelectedText = window.getSelection().toString().trim().length > 0;
                if (deltaX > 80 && deltaX > deltaY && !hasSelectedText) SwipeEngine.triggerReRoll();
            });
        },
        
      triggerReRoll: () => {
            if (MobileDataEngine.isFetching) return;
            
            DOM.widgets.forEach(widget => {
          
                widget.style.transition = "opacity 0.3s";
                widget.style.opacity = "0.5";
                widget.style.pointerEvents = "none"; // Αποτροπή κλικ κατά τη διάρκεια της φόρτωσης
            });
            
            DOM.titles.forEach(title => title.innerText = "Αναζήτηση μνήμης...");
            
            MobileDataEngine.fetchPosts().finally(() => {
                DOM.widgets.forEach(widget => {
                    widget.style.opacity = "1";
                    widget.style.pointerEvents = ""; // Επαναφορά της δυνατότητας κλικ μόλις ολοκληρωθεί
                });
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
