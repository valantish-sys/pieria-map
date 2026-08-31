import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, runTransaction, get, goOffline, goOnline } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

(() => {
    "use strict";

    // 3. Βάζουμε τα κλειδιά της Firebase ΕΔΩ ΜΕΣΑ για προστασία
    const firebaseConfig = {
        apiKey: "AIzaSyCttOvFgyR8YjqKH7eXdTppKhpk8yZwZ1E",
        authDomain: "blogreactions-67b67.firebaseapp.com",
        databaseURL: "https://blogreactions-67b67-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "blogreactions-67b67",
        storageBucket: "blogreactions-67b67.firebasestorage.app",
        messagingSenderId: "277069394931",
        appId: "1:277069394931:web:ddda8ab07bcf106dec1886"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    // ==========================================
    // 1. CONFIGURATION & STATE
    // ==========================================
    const CONFIG = Object.freeze({
       SELECTORS: {
            // Αφαιρέθηκε το .date-outer διότι συγχωνεύει καταστροφικά τα άρθρα της ίδιας ημέρας
            ARTICLE_CONTAINER: '.post-outer, .post, article, .blog-post, .mobile-post-outer',
            POST_LINK: 'h3 a, .post-title a, .entry-title a, a[href*=".html"]',
            POST_BODY: '.post-body, .entry-content, .post-footer',
            READ_MORE_TRIGGER: '.jump-link, .mobile-index-arrow, .mobile-link-button'
        },
        LABELS: {
            READ_MORE: '<span class="icon">🔍</span> ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ',
            LOADING: '<span class="icon">⏳</span> ΦΟΡΤΩΣΗ...',
            CLOSE: '<span class="icon">✖</span> ΚΛΕΙΣΙΜΟ'
        },
     DEBOUNCE_MS: 250,
        // Αποθηκεύει το πραγματικό αρχικό URL (π.χ. σελίδα 2 ή ετικέτα) για να το επαναφέρει σωστά στο κλείσιμο!
        BASE_URL: window.location.pathname + window.location.search
    });

    const Utils = {
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => { clearTimeout(timeout); func(...args); };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        cleanString: (str) => {
            return str.replace(/["'«»“”‘’]/g, '').replace(/\s+/g, ' ').trim();
        },
   getPostPath: (container) => {
            try { 
                // 1. Δοκιμάζουμε ΠΡΩΤΑ να πάρουμε το ID από τον τίτλο (h3 a, .post-title a)
                // Αυτό λειτουργεί τέλεια στην Αρχική σελίδα, αλλά ΚΑΙ στα Σχετικά Άρθρα (Sidebar)
                const titleLink = container.querySelector('h3 a, .post-title a, .entry-title a');
                if (titleLink && titleLink.href) {
                    const url = new URL(titleLink.href);
                    url.hash = ''; 
                    return url.pathname;
                }

            // Τότε δίνουμε το URL του browser, ΜΟΝΟ εφόσον αυτό το container είναι το ΚΕΝΤΡΙΚΟ
                if (window.location.pathname.includes('.html') && container.querySelector(CONFIG.SELECTORS.POST_BODY)) {
                    return window.location.pathname;
                }

                // 3. Fallback ασφαλείας
                const anyLink = container.querySelector(CONFIG.SELECTORS.POST_LINK);
                if (anyLink && anyLink.href && !anyLink.closest(CONFIG.SELECTORS.POST_BODY)) {
                    const url = new URL(anyLink.href);
                    url.hash = '';
                    return url.pathname;
                }

                return null;
            } catch(e) { return null; }
        }
    };

    // ==========================================
    // 3. LIGHTBOX ENGINE (Αυτόνομο Module)
    // ==========================================
    class LightboxEngine {
        constructor() {
            this.galleryData = [];
            this.currentIndex = 0;
            this.overlay = null;
            this.touchStartX = 0;
            
            // Binding για να μπορούμε να αφαιρέσουμε τον Listener (Memory Leak Fix)
            this.handleKeydown = this.handleKeydown.bind(this);
            this.close = this.close.bind(this);
        }

        init(mediaNodes) {
            this.galleryData = [];
            mediaNodes.forEach((node) => {
                const tag = node.tagName.toLowerCase();
          if (tag === 'img') {
                    // Ανάκτηση της πραγματικής πηγής ακόμα και σε εικόνες αναμονής (Lazy-Loaded)
                    const realSrc = node.getAttribute('data-src') || node.getAttribute('data-original-src') || node.src;
                    
                    if (realSrc.includes('tracker') || realSrc.includes('blank.gif')) return;
                    
                    // Απορρίπτουμε βάσει πλάτους ΜΟΝΟ αν η εικόνα έχει όντως φορτώσει και δεν έχει lazy-load data.
                    if (!node.hasAttribute('data-src') && !node.hasAttribute('data-original-src') && node.naturalWidth > 0 && node.naturalWidth < 40) return;
                    
                    let src = realSrc;
                    const pLink = node.closest('a');
                  if (pLink && pLink.href && (pLink.href.match(/\.(jpe?g|png|gif|webp)(\?.*)?$/i) || pLink.href.includes('googleusercontent.com/img/') || pLink.href.includes('bp.blogspot.com/'))) src = pLink.href;
                    
                    this.galleryData.push({ type: 'image', src: src, thumb: node.src, el: node });
                    
                    // Απενεργοποίηση default link και Event Delegation trigger
                   
                    node.style.cursor = 'zoom-in';
                    node.dataset.lightboxIndex = this.galleryData.length - 1;
                    
        } else if (tag === 'iframe') {
                    let vidSrc = node.src.startsWith('//') ? 'https:' + node.src : node.src;
                    
                    // Αποκλεισμός εκπαιδευτικών εργαλείων (Forms, PDFs, Wordwall). Επιτρέπονται ΑΥΣΤΗΡΑ μόνο βίντεο πλατφόρμες.
                    if (!vidSrc.match(/youtube(?:-nocookie)?\.com|youtu\.be|vimeo\.com|dailymotion\.com/i)) return;
                    
           let thumbSrc = 'https://via.placeholder.com/150x100/333333/FFFFFF?text=VIDEO';
                    // ΔΙΟΡΘΩΣΗ: Προσθήκη υποστήριξης 'shorts' στη Regex και υποχρεωτική μετατροπή σε ασφαλές 'embed' URL
                    const ytMatch = vidSrc.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                  if (ytMatch && ytMatch[1]) {
                        thumbSrc = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                        
                        let extraParams = "?autoplay=1"; // Άμεση αναπαραγωγή για αποφυγή διπλού κλικ
                        const timeMatch = vidSrc.match(/[?&](t|start)=([^&]+)/i);
                        const listMatch = vidSrc.match(/[?&]list=([^&]+)/i);
                        
                        // Μετατροπή μορφής 1m20s σε δευτερόλεπτα
                        if (timeMatch) {
                            let tStr = timeMatch[2], seconds = 0;
                            if (tStr.includes('m')) {
                                let parts = tStr.split('m');
                                seconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
                            } else {
                                seconds = parseInt(tStr) || 0;
                            }
                            if (seconds > 0) extraParams += `&start=${seconds}`;
                        }
                        if (listMatch) extraParams += `&list=${listMatch[1]}`;
                        
                        vidSrc = `https://www.youtube.com/embed/${ytMatch[1]}${extraParams}`;
                    }
                    
                    this.galleryData.push({ type: 'video', src: vidSrc, thumb: thumbSrc, el: node });
                }
            });
        }

   // Η ΝΕΑ δυναμική μέθοδος open (The Patch)
        open(clickedElement) {
            // ΔΙΟΡΘΩΣΗ: Αποτροπή διπλού tap (το οποίο προκαλεί διπλό pushState και μολύνει / "σπάει" το ιστορικό)
            if (document.body.classList.contains('lb-active')) return;
            
            // 1. Βρίσκουμε ΟΛΟΚΛΗΡΟ το άρθρο (περίληψη + fetch) για να συλλέξουμε ΟΛΕΣ τις εικόνες
            const wrapper = clickedElement.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
if (!wrapper) return;
// Στοχεύουμε ΜΟΝΟ το κυρίως κείμενο για να μην ρουφάει εικονίδια Share, Avatars ή Σχετικά Άρθρα
// Στοχεύουμε δυναμικά το κυρίως κείμενο χρησιμοποιώντας τον επιλογέα από το CONFIG
const bodySelectors = CONFIG.SELECTORS.POST_BODY.split(',').map(s => `${s.trim()} img, ${s.trim()} iframe`).join(', ');
const mediaNodes = Array.from(wrapper.querySelectorAll(`${bodySelectors}, .scrollable-article-area img, .scrollable-article-area iframe`));
            this.init(mediaNodes);

            if (this.galleryData.length === 0) return;

         // 3. Βρίσκουμε ποια ακριβώς εικόνα πατήθηκε για να ξεκινήσουμε από αυτή
            this.currentIndex = this.galleryData.findIndex(item => item.el === clickedElement);
            if (this.currentIndex === -1) return; // Ακύρωση ανοίγματος αν η εικόνα απορρίφθηκε από το φίλτρο

        // 4. Εμφάνιση
            this.buildDOM();
            this.bindEvents();
            this.updateMedia();
            
            // Προσθήκη εικονικού ιστορικού αποκλειστικά για το Lightbox
            try { window.history.pushState({ lightbox: true }, '', window.location.href); } catch(e) {}
        }

       buildDOM() {
            // Αποτροπή δημιουργίας "ζόμπι" επικαλύψεων σε περίπτωση διπλού tap στο κινητό
            const existingOverlay = document.querySelector('.my-custom-lightbox');
            if (existingOverlay) existingOverlay.remove();

  this.overlay = document.createElement('div');
            this.overlay.className = 'my-custom-lightbox';
            // ΑΦΑΙΡΕΘΗΚΕ το touch-action: pinch-zoom διότι κλειδώνει τη μετακίνηση (panning) με 1 δάχτυλο!
            
            let html = `<div class="my-custom-lightbox-close">&times;</div>`;
            if (this.galleryData.length > 1) {
                html += `
                    <div class="my-custom-lightbox-counter"><span id="lb-current-idx">${this.currentIndex + 1}</span> / ${this.galleryData.length}</div>
                    <div class="my-custom-lightbox-prev">&#10094;</div>
                    <div class="my-custom-lightbox-next">&#10095;</div>
                `;
            }
            html += `<div class="my-custom-lightbox-img-container"></div>`;

            if (this.galleryData.length > 1) {
                html += `<div class="my-custom-lightbox-thumbnails">`;
                this.galleryData.forEach((gItem, tIndex) => {
                    const videoClass = gItem.type === 'video' ? 'is-video-thumb' : '';
                    html += `<div class="thumb-wrapper ${videoClass}" data-index="${tIndex}"><img src="${gItem.thumb}" class="my-lb-thumb"></div>`;
                });
                html += `</div>`;
            }

            this.overlay.innerHTML = html;
            document.body.classList.add("lb-active");
            document.body.appendChild(this.overlay);
            
            // Trigger reflow for transition
            requestAnimationFrame(() => this.overlay.classList.add('show'));
        }

        updateMedia() {
            const containerDiv = this.overlay.querySelector('.my-custom-lightbox-img-container');
            const counterSpan = this.overlay.querySelector('#lb-current-idx');
            const thumbWrappers = this.overlay.querySelectorAll('.thumb-wrapper');

         containerDiv.style.opacity = '0';
            
            // Ακύρωση προηγούμενης εντολής για αποφυγή "σπασίματος" σε γρήγορα Swipe / Κλικ
            if (this.mediaTimeout) clearTimeout(this.mediaTimeout);
            
        // ΑΚΑΡΙΑΙΑ ενημέρωση της διεπαφής (Αριθμός & Μικρογραφία) έξω από την καθυστέρηση!
            if (counterSpan) counterSpan.innerText = this.currentIndex + 1;
            thumbWrappers.forEach(t => t.classList.remove('active'));
            if (thumbWrappers[this.currentIndex]) {
                thumbWrappers[this.currentIndex].classList.add('active');
                thumbWrappers[this.currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }

          this.mediaTimeout = setTimeout(() => {
                if (!this.overlay) return; // Αποτροπή crash αν έκλεισε το Lightbox στο ενδιάμεσο
                const currentMedia = this.galleryData[this.currentIndex];
                
            if (currentMedia.type === 'image') {
                    // Προσθήκη draggable="false" ώστε να μην κλειδώνει το Swipe από το αυτόματο "σύρσιμο" του browser
                    containerDiv.innerHTML = `<img src="${currentMedia.src}" class="my-lb-media" alt="Gallery Image" draggable="false">`;
                } else {
                    containerDiv.innerHTML = `<iframe src="${currentMedia.src}" class="my-lb-media" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                }
                
                containerDiv.style.opacity = '1';
            }, 200);
        }

        bindEvents() {
            document.addEventListener('keydown', this.handleKeydown);
            
         const containerDiv = this.overlay.querySelector('.my-custom-lightbox-img-container');
           
           // ΔΙΟΡΘΩΣΗ: Αποτρέπουμε τον browser από το να κάνει "Πίσω" (Native Gesture) όταν ο χρήστης κάνει Swipe
           this.overlay.addEventListener('touchmove', e => {
               if (!e.target.closest('.my-custom-lightbox-thumbnails') && !(window.visualViewport && window.visualViewport.scale > 1.05)) {
                   if (e.cancelable) e.preventDefault();
               }
           }, { passive: false });
           
            // Εφαρμογή των events σε ΟΛΟ το overlay, ώστε το swipe να δουλεύει ακόμα και πάνω στο μαύρο κενό!
        this.overlay.addEventListener('touchstart', e => {
                // Εξαίρεση της μπάρας μικρογραφιών: Το σκρολάρισμά τους ΔΕΝ πρέπει να αλλάζει την κεντρική φωτογραφία
                if (e.target.closest('.my-custom-lightbox-thumbnails')) {
                    this.touchStartX = null;
                    return;
                }
                
                if (e.touches && e.touches.length > 1) {
                    this.touchStartX = null; // Διαγραφή παλιών συντεταγμένων λόγω Multi-Touch
                    return; 
                }
                this.touchStartX = e.changedTouches[0].screenX;
                this.touchStartY = e.changedTouches[0].screenY;
            }, {passive: true});
            
         this.overlay.addEventListener('touchend', e => {
                if (e.touches && e.touches.length > 0) return;
                if (this.touchStartX === null) return; // Ακύρωση του Swipe αν προηγήθηκε Zoom
                
                if (e.changedTouches && e.changedTouches.length > 1) return; 
                this.handleSwipe(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
            }, {passive: true});
}
     handleKeydown(e) {
            // ΔΙΟΡΘΩΣΗ: Προσθήκη preventDefault() για να αποτραπεί η ακούσια οριζόντια κύλιση 
            // του βασικού άρθρου στο παρασκήνιο, όταν ο χρήστης αλλάζει φωτογραφίες.
            if (e.key === 'ArrowRight') { e.preventDefault(); this.navigate(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.navigate(-1); }
            if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        }

       handleSwipe(touchEndX, touchEndY) {
            const swipeThreshold = 50;
            const diffX = touchEndX - this.touchStartX;
            const diffY = touchEndY - this.touchStartY;
            
  // Μετακίνηση ελέγχου στην αρχή! Ολική αποτροπή Swipe (και αλλαγής εικόνας ΚΑΙ κλεισίματος) όταν υπάρχει ζουμ.
            if (window.visualViewport && window.visualViewport.scale > 1.05) return;

         // ΟΛΙΚΗ αποτροπή (τόσο αλλαγής εικόνας όσο και κλεισίματος) όταν ο χρήστης έχει κάνει ζουμ!
            if (window.visualViewport && window.visualViewport.scale > 1.05) return;

            if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
                // Κλείσιμο του Lightbox αν ο χρήστης σύρει το δάχτυλο έντονα κάθετα (Standard Mobile UX)
                if (Math.abs(diffY) > swipeThreshold) this.close();
                return;
            }

            if (diffX < -swipeThreshold) this.navigate(1);
            if (diffX > swipeThreshold) this.navigate(-1);
        }

        navigate(direction) {
            this.currentIndex += direction;
            if (this.currentIndex < 0) this.currentIndex = this.galleryData.length - 1;
            if (this.currentIndex >= this.galleryData.length) this.currentIndex = 0;
            this.updateMedia();
        }

   close(isPopState = false) {
            if (!this.overlay) return;
            const overlayToRemove = this.overlay;
            
            // Αν το κλείσιμο έγινε με το "Χ" ή με Swipe, "καθαρίζουμε" χειροκίνητα το εικονικό ιστορικό
            if (!isPopState && window.history.state && window.history.state.lightbox) {
                window.history.back();
            }
            this.overlay = null; // Αποδεσμεύουμε τη μεταβλητή για να μην επηρεαστεί νεότερο άνοιγμα

            overlayToRemove.classList.remove('show');
            document.body.classList.remove("lb-active");
            document.removeEventListener('keydown', this.handleKeydown);
            
            setTimeout(() => {
                if (overlayToRemove && overlayToRemove.parentNode) overlayToRemove.remove();
            }, 300);
        }
    }

    // Instantiation του κεντρικού Lightbox
    const AppLightbox = new LightboxEngine();


    // ==========================================
    // 4. ARTICLE ENGINE (Αυτόνομο Module)
    // ==========================================
    class ArticleEngine {
        static scan() {
            document.querySelectorAll(CONFIG.SELECTORS.ARTICLE_CONTAINER).forEach(post => {
                // GUARD: Αν έχει ήδη κλάση 'processed' ή βρει ήδη το κουμπί, σταμάτα!
                if (post.classList.contains('article-processed') || post.querySelector('.custom-read-more')) return;
                
             const linkElem = post.querySelector(CONFIG.SELECTORS.POST_LINK);
                const postBody = post.querySelector(CONFIG.SELECTORS.POST_BODY); // Χρήση του δυναμικού επιλογέα!
                if (!linkElem || !postBody) return;

              const moreTriggers = post.querySelectorAll(CONFIG.SELECTORS.READ_MORE_TRIGGER);
                
              // Αν ΔΕΝ υπάρχει κόψιμο στο άρθρο, το μαρκάρουμε ως ολοκληρωμένο και φεύγουμε.
                if (moreTriggers.length === 0) {
                    post.classList.add('article-processed');
                    return;
                }
                
                // Απόκρυψη ΟΛΩΝ των αυθεντικών κουμπιών για να μην υπάρχουν διπλότυπα
                moreTriggers.forEach(trigger => trigger.style.display = 'none');

             // Κατάργηση της βίαιης μετακίνησης κόμβων γιατί εξαφανίζει τις διαφημίσεις! Μαρκάρουμε απευθείας το postBody.
                if (!postBody.classList.contains('summary-wrapper')) {
                    postBody.classList.add('summary-wrapper');
                }

            // Δημιουργία Κουμπιού
                const btn = document.createElement('div');
                btn.className = 'custom-read-more';
                btn.dataset.url = linkElem.href;
                btn.innerHTML = CONFIG.LABELS.READ_MORE;
                postBody.appendChild(btn);
                
                // Σημειώνουμε το post ότι επεξεργάστηκε
                post.classList.add('article-processed');
            });
        }

        static async handleInteraction(btn) {
            // GUARD: Αν ο χρήστης πατήσει γρήγορα πολλές φορές, σταματάμε τα διπλά κλικ!
            if (btn.classList.contains('is-loading')) return;

            const post = btn.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
            const wrapper = post.querySelector('.fetched-content-wrapper');
            const url = btn.dataset.url;

            // TOGGLE: Αν είναι ήδη ανοιχτό, κλείστο
            if (btn.dataset.loaded === "true" && wrapper) {
                if (wrapper.classList.contains('is-open')) {
                    ArticleEngine.close(post, btn);
                } else {
                    ArticleEngine.open(post, btn, wrapper, url);
                }
                return;
            }

            // FETCH: Αν δεν έχει φορτωθεί, φέρτο
            btn.classList.add('is-loading');
            btn.innerHTML = CONFIG.LABELS.LOADING;

         try {
                const resp = await fetch(url);
                // Αν η σελίδα έχει διαγραφεί ή σφάλμα, πετάμε Error για να πάει ο χρήστης στο fallback
                if (!resp.ok) throw new Error("HTTP Status: " + resp.status);
                const html = await resp.text();
               const doc = new DOMParser().parseFromString(html, 'text/html');
                // Πρέπει να χρησιμοποιείται ο δυναμικός επιλογέας από τα Settings
                const fetchedBody = doc.querySelector(CONFIG.SELECTORS.POST_BODY);
                
                // Προστασία: Αν δεν εντοπιστεί περιεχόμενο, πετάμε σφάλμα για να γίνει Fallback redirect 
                if (!fetchedBody) throw new Error("Δεν εντοπίστηκε περιεχόμενο.");

             ArticleEngine.processFetchedContent(fetchedBody, post.querySelector('.summary-wrapper'));

          // Επαναφορά Εικόνων ΚΑΙ Βίντεο (iframes) που έχουν παγιδευτεί από το Lazy Load του Blogger
                fetchedBody.querySelectorAll('img, iframe').forEach(el => {
                    const realSrc = el.getAttribute('data-src') || el.getAttribute('data-original-src');
                    if (realSrc && el.src !== realSrc) {
                        el.src = realSrc;
                        if (el.tagName.toLowerCase() === 'img') el.removeAttribute('srcset');
                    }
                });

            const div = document.createElement('div');
                div.className = 'fetched-content-wrapper';
                div.innerHTML = `<div class="fetched-content-inner"><div class="scrollable-article-area">${fetchedBody.innerHTML}</div></div>`;
                
                // Προστασία διάταξης: Εισάγουμε το νέο κείμενο ΠΑΝΩ από το widget ψηφοφορίας, ώστε το widget να καταλήγει πάντα στον πάτο!
                const fbWidget = btn.parentNode.querySelector('.smart-feedback-container');
                if (fbWidget) {
                    btn.parentNode.insertBefore(div, fbWidget);
                } else {
                    btn.parentNode.insertBefore(div, btn);
                }
                btn.dataset.loaded = "true";

                // Init Lightbox για το νέο περιεχόμενο
                div.querySelectorAll('.scrollable-article-area img').forEach(img => img.style.cursor = 'zoom-in');

                const originalWrite = document.write;
                document.write = function() { console.warn('Αποτράπηκε document.write από widget'); };

            const executeScriptsSequentially = async () => {
                    const scripts = Array.from(div.querySelectorAll('script'));
                    for (const oldScript of scripts) {
                        // ΔΙΟΡΘΩΣΗ: Αφαίρεση του ελέγχου `includes('document.write')`. 
                        // Το document.write έχει ΗΔΗ εξουδετερωθεί με ασφάλεια. Διαγράφοντας ολόκληρο 
                        // το script καταστρέφονται εκπαιδευτικά widgets που το περιέχουν έστω και σε σχόλια!
                        
                        await new Promise(resolve => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                            newScript.innerHTML = oldScript.innerHTML;
                            
                           let resolved = false;
                            const safeResolve = () => { if (!resolved) { resolved = true; resolve(); } };
                            
                            // Timeout ασφαλείας 4 δευτερολέπτων για να μην κολλήσει το άρθρο αιωνίως λόγω πεσμένων servers!
                            const fallbackTimeout = setTimeout(safeResolve, 4000);

                            if (newScript.hasAttribute('src')) {
                                newScript.onload = () => { clearTimeout(fallbackTimeout); safeResolve(); };
                                newScript.onerror = () => { clearTimeout(fallbackTimeout); safeResolve(); };
                            }
                            
                            if (oldScript.parentNode) oldScript.parentNode.replaceChild(newScript, oldScript);
                            
                            if (!newScript.hasAttribute('src')) { clearTimeout(fallbackTimeout); safeResolve(); }
                        });
                    }
              };
            await executeScriptsSequentially();
                
                // ΕΠΑΝΑΦΟΡΑ του document.write για να μην καταρρεύσουν τα widgets της πλαϊνής στήλης του blog!
                document.write = originalWrite;
                
           // Social Plugins & Embeds (Προσθήκη υποστήριξης για δυναμικά Tweets & Instagram)
                if (window.FB && window.FB.XFBML) window.FB.XFBML.parse(div);
                if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(div);
                if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();

                // Άνοιγμα με μικρή καθυστέρηση για το CSS transition
                requestAnimationFrame(() => ArticleEngine.open(post, btn, div, url));

  } catch(err) {
                console.error("Article Fetch Error:", err);
                btn.classList.remove('is-loading'); 
                
                btn.innerHTML = '<span class="icon">🔄</span> ΑΝΑΚΑΤΕΥΘΥΝΣΗ...';
                window.location.href = url;
                
                // Επαναφορά του αρχικού κειμένου λίγο μετά, ώστε αν ο χρήστης επιστρέψει 
                // με το πλήκτρο "Πίσω" (BFCache), το κουμπί να δείχνει ξανά σωστά!
                setTimeout(() => { btn.innerHTML = CONFIG.LABELS.READ_MORE; }, 1000);
            }
        }
static processFetchedContent(fetchedBody, summaryWrap) {
            // Το 'script' αφαιρέθηκε από τη διαγραφή ώστε να επιβιώσουν και να εκτελεστούν τα social media embeds
            fetchedBody.querySelectorAll('a[name="more"], [id^="more-"], .jump-link').forEach(n => n.remove());

       // Αλγόριθμος "Χειρουργικής Αφαίρεσης" TreeWalker
            const clone = summaryWrap.cloneNode(true);
            const rmBtn = clone.querySelector('.custom-read-more');
            if (rmBtn) rmBtn.remove(); // Αφαιρούμε το κουμπί από τον κλώνο για να γίνει σωστή ταύτιση κειμένου
      clone.querySelectorAll('script, style').forEach(el => el.remove());
          let summaryCleanText = clone.textContent.replace(/[\s\.\…]+$/, '').trim();
          let words = summaryCleanText.split(/\s+/);
            let textToMatch = words.join(' ');
            let cleanTextToMatch = Utils.cleanString(textToMatch);

         let walker = document.createTreeWalker(fetchedBody, NodeFilter.SHOW_TEXT, {
              acceptNode: function(node) {
                  if (node.parentNode && (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE')) {
                      return NodeFilter.FILTER_REJECT;
                  }
                  return NodeFilter.FILTER_ACCEPT;
              }
          }, false);
            let runningText = "";
            let nodesToRemove = [];
            let stopNow = false;

            while (walker.nextNode() && !stopNow) {
                let node = walker.currentNode;
                let nodeText = node.nodeValue;
                for (let i = 0; i < nodeText.length; i++) {
                    runningText += nodeText[i];
                    let currentCompare = Utils.cleanString(runningText);
                    
                if (cleanTextToMatch.startsWith(currentCompare)) {
                        continue;
                    } else {
                        // Αφαιρούμε το ελαττωματικό lastWord.length για να κοπεί το κείμενο στο σωστό σημείο
                        node.nodeValue = nodeText.substring(i);
                        stopNow = true;
                        break;
                    }
                }
                if (!stopNow) nodesToRemove.push(node);
            }
            
            nodesToRemove.forEach(n => { if (n.parentNode) n.nodeValue = ""; });

      // Προστασία Media (Αφαίρεση διπλότυπων)
            const summaryMedia = Array.from(summaryWrap.querySelectorAll('img, iframe'));
            fetchedBody.querySelectorAll('img, iframe').forEach(m => {
                const getFilename = (url) => { try { return new URL(url).pathname.split('/').pop().split('=')[0]; } catch(e) { return url; } };
                
                const duplicateIndex = summaryMedia.findIndex(sm => {
                    if (sm.tagName !== m.tagName) return false;
                    const smSrc = sm.getAttribute('data-src') || sm.src;
                    const mSrc = m.getAttribute('data-src') || m.src;
                    if (!mSrc || mSrc.includes('data:image') || mSrc.includes('blank.gif')) return false;
                    
                    // Για iframes (πχ Google Forms) απαιτείται απόλυτη ταύτιση όλου του URL
                    if (m.tagName.toLowerCase() === 'iframe') return smSrc === mSrc;
                    return getFilename(smSrc) === getFilename(mSrc);
                });
                
               if (duplicateIndex !== -1) {
                    summaryMedia.splice(duplicateIndex, 1);
                    
                    const parentA = m.closest('a');
                    // ΔΙΟΡΘΩΣΗ: Αν η εικόνα ήταν μόνη της μέσα σε έναν σύνδεσμο, διαγράφουμε ολόκληρο 
                    // τον σύνδεσμο για να μην δημιουργηθούν αόρατα "νεκρά" σημεία και κενά.
                    if (parentA && parentA.children.length === 1 && parentA.textContent.trim() === '') {
                        parentA.remove();
                    } else {
                        m.remove();
                    }
                }
            });
          
        }

      static open(post, btn, wrapper, url) {
            wrapper.classList.add('is-open'); 
            
        // Επαναφορά των βίντεο που είχαν διακοπεί στο κλείσιμο, ΜΟΝΟ εφόσον ο χρήστης ανοίξει ξανά το άρθρο
            wrapper.querySelectorAll('iframe').forEach(ifr => {
                if (ifr.dataset.tempSrc && !ifr.hasAttribute('src')) ifr.setAttribute('src', ifr.dataset.tempSrc);
            });
          btn.classList.remove('is-loading');
            btn.innerHTML = CONFIG.LABELS.CLOSE;
            post.classList.add('is-expanded');
           try {
                const safeUrl = new URL(url, window.location.origin);
                // ΔΙΟΡΘΩΣΗ: Προσθήκη history μόνο αν δεν βρισκόμαστε ΗΔΗ σε αυτό το URL (δηλαδή επιστροφή με το "Πίσω")
                if (window.location.pathname !== safeUrl.pathname) {
                    window.history.pushState({art:url}, '', safeUrl.pathname + safeUrl.search); 
                }
            } catch(e) {}
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

      static close(post, btn, isPopState = false) {
            const wrapper = post.querySelector('.fetched-content-wrapper');
            if (wrapper) {
          wrapper.classList.remove('is-open');
       // Στοχεύουμε ΑΥΣΤΗΡΑ μόνο γνωστές πλατφόρμες πολυμέσων (βίντεο/ήχου).
         // Απαγορεύεται η κλωνοποίηση σε εκπαιδευτικές φόρμες για να μην χάνονται οι απαντήσεις των μαθητών!
         wrapper.querySelectorAll('iframe').forEach(ifr => {
                    if (ifr.hasAttribute('src') && ifr.src.match(/youtube(?:-nocookie)?\.com|youtu\.be|vimeo\.com|dailymotion\.com|soundcloud\.com/i)) {
                        ifr.dataset.tempSrc = ifr.src;
                        // Η κλωνοποίηση σταματά τον ήχο ΑΚΑΡΙΑΙΑ, αποτρέποντας την εγγραφή "about:blank" στο History API!
                        const clone = ifr.cloneNode(true);
                        clone.removeAttribute('src');
                        ifr.parentNode.replaceChild(clone, ifr);
                    }
                });
                
                // ΣΤΑΜΑΤΑΜΕ υποχρεωτικά και τα απευθείας ανεβασμένα αρχεία ήχου/βίντεο (HTML5 Media)
                if (wrapper) {
                    wrapper.querySelectorAll('audio, video').forEach(media => media.pause());
                }
            }
            if (btn) btn.innerHTML = CONFIG.LABELS.READ_MORE;
            if (post) post.classList.remove('is-expanded');

           // Αλλάζουμε URL μόνο αν το έκλεισε ο χρήστης χειροκίνητα με κλικ
            if (!isPopState && window.location.pathname !== "/") {
                // ΔΙΟΡΘΩΣΗ: Χρήση replaceState αντί για pushState, ώστε να μην προστίθεται περιττή εγγραφή.
                window.history.replaceState(null, '', CONFIG.BASE_URL);
            }
        }

       static closeAllOpened(e) {
            const isPopState = e && e.type === 'popstate';
            document.querySelectorAll('.fetched-content-wrapper.is-open').forEach(wrapper => {
                const post = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                const btn = post.querySelector('.custom-read-more');
                
             // Προστασία: Αν πατήθηκε το "Πίσω" και το άρθρο ταυτίζεται με το τρέχον ενεργό URL, ΜΗΝ το κλείσεις!
                // Αφαιρούμε τα # (hashes) για να μην κλείνει το άρθρο κατά την πλοήγηση σε εσωτερικούς συνδέσμους/υποσημειώσεις!
                if (isPopState && btn && btn.dataset.url.split('#')[0] === window.location.href.split('#')[0]) return;
                
                ArticleEngine.close(post, btn, isPopState);
            });
        }
    }

    // ==========================================
    // 5. FEEDBACK ENGINE (Αυτόνομο Module)
    // ==========================================
    class FeedbackEngine {
        static scan() {
            // Αρχικοποίηση Observer για το Lazy Loading
            if (!this.observer) {
                this.observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const div = entry.target;
                            const safePostId = div.dataset.postid;
                            
        
                            obs.unobserve(div); 
                            
                          // Βοηθητική συνάρτηση για την ενημέρωση του UI
                            const updateUI = (snapshot) => {
                                let d = { love: 0, funny: 0, wow: 0 };
                                // Ελέγχουμε αν υπάρχει έγκυρη απάντηση από τη βάση, αλλιώς κρατάμε τα μηδενικά
                                if (snapshot && typeof snapshot.val === 'function') {
                                    d = snapshot.val() || d;
                                }
                                const sLove = div.querySelector('.count-love'); if (sLove && sLove.innerText === '-') sLove.innerText = d.love || 0;
                                const sFunny = div.querySelector('.count-funny'); if (sFunny && sFunny.innerText === '-') sFunny.innerText = d.funny || 0;
                                const sWow = div.querySelector('.count-wow'); if (sWow && sWow.innerText === '-') sWow.innerText = d.wow || 0;
                            };

                            // Έξυπνος μηχανισμός Retry (Προσπαθεί για 8 δευτερόλεπτα)
                            const fetchReactions = async (attempts = 0) => {
                                try {
                                    // Promise.race: Αν η Firebase "κολλήσει" και δεν απαντήσει σε 2 δευτερόλεπτα, πετάει Timeout!
                                    const snapshot = await Promise.race([
                                        get(ref(db, 'reactions/' + safePostId)),
                                        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
                                    ]);
                                    updateUI(snapshot);
                                } catch (err) {
                                    if (attempts < 3) {
                                        // Αν απέτυχε, ξαναπροσπαθεί αμέσως. (Σύνολο 4 προσπάθειες x 2 δευτ. = 8 δευτερόλεπτα)
                                        fetchReactions(attempts + 1);
                                    } else {
                                        console.warn(`Κόλλησε η επικοινωνία στο άρθρο ${safePostId}. Επαναφορά Firebase (Hard Reset)...`);
                                        
                                        // 1. Κλείνει βίαια τη σύνδεση του browser με τη Firebase
                                        goOffline(db);
                                        
                                        setTimeout(() => {
                                            // 2. Επαναφέρει τη σύνδεση αναγκάζοντας τη Firebase να συνδεθεί από το μηδέν
                                            goOnline(db);
                                            
                                            // 3. Τελευταία απεγνωσμένη προσπάθεια μετά την επανασύνδεση
                                            Promise.race([
                                                get(ref(db, 'reactions/' + safePostId)),
                                                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
                                            ]).then(updateUI).catch(() => updateUI(null)); 
                                            // Αν αποτύχει οριστικά (π.χ. κομμένο ίντερνετ), το null θα βάλει "0" για να μην μείνουν οι άσχημες παύλες.
                                        }, 1000); // Δίνουμε 1 δευτερόλεπτο στη Firebase να κλείσει και να ανοίξει σωστά
                                    }
                                }
                            };

                            fetchReactions(); // Εκκίνηση του μηχανισμού
                        }
                    });
                }, { rootMargin: '200px' }); // Φορτώνει λίγο πριν μπει στην οθόνη
            }

            document.querySelectorAll(CONFIG.SELECTORS.ARTICLE_CONTAINER).forEach(container => {
                if (container.querySelector('.smart-feedback-container')) return;

                const postId = Utils.getPostPath(container);
                if (!postId || postId === '/' || postId.length < 3) return;

             const safePostId = decodeURIComponent(postId).replace(/[\.\#\$\[\]\/]/g, '_');
                const target = container.querySelector(CONFIG.SELECTORS.POST_BODY);
                
                // ΠΡΟΣΤΑΣΙΑ: Αποτροπή έγχυσης Emojis σε μικρά Widgets της πλαϊνής στήλης!
                if (!target) return;
                
                let hasVoted = false;
                try { hasVoted = localStorage.getItem('feedback_' + safePostId); } catch(e) {}
                const div = document.createElement('div');
                div.className = `smart-feedback-container ${hasVoted ? 'voted' : ''}`;
                
                // Προσθήκη κενού προς τα κάτω για ωραία στοίχιση πάνω από το "Διαβάστε Περισσότερα"
                div.style.marginBottom = "15px"; 
                div.dataset.postid = safePostId;

                const btnStyle = hasVoted ? "opacity: 0.8; pointer-events: none;" : "";
                
                // Δημιουργούμε το div με παύλες αρχικά, μέχρι να τα φέρει το Lazy Load
                div.innerHTML = `
             <div class="smart-feedback-buttons" style="${btnStyle}" data-postid="${safePostId}">
                        <!-- Προσθήκη type="button" για αποτροπή ακούσιας ανανέωσης σελίδας (form submit) -->
                        <button type="button" class="smart-feedback-btn" data-type="love"><span>❤️</span><span class="count-love">-</span></button>
                        <button type="button" class="smart-feedback-btn" data-type="funny"><span>😂</span><span class="count-funny">-</span></button>
                        <button type="button" class="smart-feedback-btn" data-type="wow"><span>😮</span><span class="count-wow">-</span></button>
                    </div>`;
                
              const readMoreBtn = target.querySelector('.custom-read-more');
                if (readMoreBtn) {
                    target.insertBefore(div, readMoreBtn);
                } else {
                    target.appendChild(div);
                }
                
                // Ξεκινάμε την παρακολούθηση (Lazy Load)
                this.observer.observe(div);
            });
        }

       static handleReaction(btn) {
            const mainContainer = btn.closest('.smart-feedback-container');
            if (mainContainer.classList.contains('voted')) return; // Απόλυτη JS προστασία ενάντια σε πολλαπλές ψήφους με το Enter

            // --- ΠΡΟΣΘΗΚΗ ΑΜΕΣΗΣ ΔΟΝΗΣΗΣ ΓΙΑ ΤΙΣ ΑΝΤΙΔΡΑΣΕΙΣ ---
            if (navigator.vibrate) navigator.vibrate(15);
            
            const btnContainer = btn.closest('.smart-feedback-buttons');
        
            const safePostId = btnContainer.dataset.postid;
            const type = btn.dataset.type;
            const spanCount = btn.querySelector('span:last-child');
            const emojiSymbol = btn.querySelector('span:first-child').innerText;
            
         // --- ΕΦΕ PARTICLES (Emojis που πετάγονται!) ---
            for (let i = 0; i < 4; i++) {
                const particle = document.createElement('div');
                particle.innerText = emojiSymbol;
                // Χρήση 'fixed' για να μην αλλάξει ποτέ το πλάτος της σελίδας και να μην τιναχτεί η οθόνη του κινητού
                particle.style.position = 'fixed';
                particle.style.left = `${btn.getBoundingClientRect().left + 15}px`;
                particle.style.top = `${btn.getBoundingClientRect().top}px`;
                particle.style.fontSize = '24px';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';
                particle.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
               document.body.appendChild(particle);

                // Χρήση μικρής καθυστέρησης (αντί για rAF) για να αναγκαστεί ο browser να εκτελέσει το CSS animation!
                setTimeout(() => {
                    particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -${Math.random() * 50 + 40}px) scale(1.5)`;
                    particle.style.opacity = '0';
                }, 20);
                setTimeout(() => particle.remove(), 800);
            }
            // ----------------------------------------------

     spanCount.innerText = "..";
            btnContainer.style.pointerEvents = 'none'; 
            
         // ΑΜΕΣΟ (Σύγχρονο) κλείδωμα πριν φύγει το αίτημα δικτύου, για 100% προστασία από spamming
mainContainer.classList.add('voted');
mainContainer.dataset.justVoted = "true";

            const reactionRef = ref(db, 'reactions/' + safePostId + '/' + type);
            const totalRef = ref(db, 'stats/total_reactions');
       // Εκτελούμε τον καθολικό μετρητή και ΕΚΠΕΜΠΟΥΜΕ σήμα για τον συγχρονισμό εξωτερικών Widgets (π.χ. Slider)
            runTransaction(totalRef, (currentTotal) => { return (currentTotal || 0) + 1; })
            .then(res => {
                if (res.committed) window.dispatchEvent(new CustomEvent('totalReactionSync', { detail: { newTotal: res.snapshot.val() } }));
            }).catch(() => {});

          // Περιμένουμε ΑΥΣΤΗΡΑ μόνο την ψήφο του άρθρου για την ενημέρωση του UI
            runTransaction(reactionRef, (currentCount) => { return (currentCount || 0) + 1; })
            .then((result) => {
                // Προστασία API: Ακύρωση του συγχρονισμού UI αν η Firebase απέρριψε την εγγραφή (αποτροπή ψευδούς reactionSync)
                if (!result.committed) throw new Error("Transaction not committed by Firebase");
                // Το νέο νούμερο που μόλις καταγράφηκε στη βάση
                const newCount = result.snapshot.val();
                spanCount.innerText = newCount;
                
              try { localStorage.setItem('feedback_' + safePostId, 'voted'); } catch(e) {}
                mainContainer.classList.add('voted');
                btnContainer.style.opacity = "0.8";

                // ΕΚΠΟΜΠΗ ΣΗΜΑΤΟΣ (Στέλνουμε το νέο αριθμό ώστε να τον ακούσει το Slider)
                window.dispatchEvent(new CustomEvent('reactionSync', {
                    detail: { safePostId, type, newCount }
                }));
            })
       .catch((error) => {
                console.error("Σφάλμα Firebase:", error);
                btnContainer.style.pointerEvents = 'auto'; 
                mainContainer.classList.remove('voted'); // Ξεκλείδωμα για να επιτραπεί η δοκιμή ξανά σε σφάλμα
                if (mainContainer.dataset) delete mainContainer.dataset.justVoted; // Απεγκλωβισμός του state για να συνεχίσει το Lazy Load!
                spanCount.innerText = "!";
            });
        }
    }

    const AppController = {
        init: () => {
            // Αρχική Σάρωση
         ArticleEngine.scan();  // 1ο: Απομονώνει πρώτα την καθαρή περίληψη
            FeedbackEngine.scan();

            // Setup Global Events & Observers
            AppController.setupGlobalDelegation();
            document.addEventListener('newPostsLoaded', () => {
                FeedbackEngine.scan(); 
                ArticleEngine.scan();  
            });
            
     // Popstate για back button του Browser
            window.addEventListener('popstate', (e) => {
              if (document.body.classList.contains('lb-active')) {
                    AppLightbox.close(true); 
                    return; 
                }
                ArticleEngine.closeAllOpened(e);
                
                // ΔΙΟΡΘΩΣΗ: Άνοιγμα ξανά του άρθρου αν ο χρήστης πατήσει το πλήκτρο "Πίσω"
                if (e.state && e.state.art) {
                    const btn = document.querySelector(`.custom-read-more[data-url="${e.state.art}"]`);
                    if (btn) {
                        const wrapper = btn.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER).querySelector('.fetched-content-wrapper');
                        if (!wrapper || !wrapper.classList.contains('is-open')) ArticleEngine.handleInteraction(btn);
                    }
                }
            });
            window.addEventListener('reactionSync', (e) => {
                const { safePostId, type, newCount } = e.detail;
                
                // ΣΥΓΧΡΟΝΙΣΜΟΣ ΤΟΠΙΚΗΣ ΜΝΗΜΗΣ: Αποθηκεύουμε την ψήφο ώστε το Feed να τη θυμάται μετά από Refresh/Navigation
                try { localStorage.setItem('feedback_' + safePostId, 'voted'); } catch(err) {}
                
                // Ψάχνουμε τα Emojis στα κλασικά άρθρα (Feed) και τα συγχρονίζουμε
                document.querySelectorAll('.smart-feedback-buttons').forEach(btnContainer => {
                    if (btnContainer.dataset.postid === safePostId) {
                     const mainContainer = btnContainer.closest('.smart-feedback-container');
                        if (mainContainer) {
                            mainContainer.classList.add('voted');
                            mainContainer.dataset.justVoted = "true"; // Αποτροπή διαγραφής της νέας ψήφου από το Lazy Load
                        }
                        btnContainer.style.pointerEvents = 'none';
                        btnContainer.style.opacity = '0.8';
                        
                        const countSpan = btnContainer.querySelector(`.smart-feedback-btn[data-type="${type}"] span:last-child`);
                        // Αλλάζουμε νούμερο μόνο αν δεν ψηφίζει ο χρήστης εκείνη τη στιγμή
                        if (countSpan && countSpan.innerText !== '..') {
                            countSpan.textContent = newCount;
                        }
                    }
                });
            });
            // ------------------------------------------------
        },

        setupGlobalDelegation: () => {
            // ΕΝΑ ΚΑΙ ΜΟΝΑΔΙΚΟ click listener στο document!
            document.addEventListener('click', (e) => {
                
            // 1. Click σε Smart Feedback Button
                const feedbackBtn = e.target.closest('.smart-feedback-btn');
                if (feedbackBtn) {
                    // ΠΡΟΣΤΑΣΙΑ: Εκτέλεση μόνο αν το κλικ ανήκει στο Feed, αποτρέποντας crash αν το Slider χρησιμοποιεί την ίδια κλάση.
                    if (!feedbackBtn.closest('.smart-feedback-container')) return;
                    e.preventDefault(); e.stopPropagation();
                    FeedbackEngine.handleReaction(feedbackBtn);
                    return;
                }

              // 2. Click σε Read More Button
                const readMoreBtn = e.target.closest('.custom-read-more');
                if (readMoreBtn) {
                    e.preventDefault(); e.stopPropagation();
                    
                   // Κλείσιμο των υπόλοιπων ανοιχτών άρθρων για εξοικονόμηση μνήμης (RAM) στο κινητό!
                    document.querySelectorAll('.fetched-content-wrapper.is-open').forEach(wrapper => {
                        const post = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                        if (post && !post.contains(readMoreBtn)) { 
                            // ΔΙΟΡΘΩΣΗ: Πέρασμα του true (ως isPopState) για αθόρυβο κλείσιμο χωρίς μόλυνση ιστορικού
                            ArticleEngine.close(post, post.querySelector('.custom-read-more'), true);
                        }
                    });
                    
                    ArticleEngine.handleInteraction(readMoreBtn);
                    return;
                }

               // 3. Click σε εικόνα/βίντεο (Lightbox)
                const lightboxImg = e.target.closest('.fetched-content-wrapper img, .post-body img, .entry-content img');
               if (lightboxImg) {
                  const parentLink = lightboxImg.closest('a');
                    const isBloggerImage = parentLink && parentLink.href && (parentLink.href.match(/\.(jpe?g|png|gif|webp)(\?.*)?$/i) || parentLink.href.includes('googleusercontent.com/img/') || parentLink.href.includes('bp.blogspot.com/'));
                    
                    if (parentLink && parentLink.href) {
                        // Αν είναι εξωτερικό link Ή αν περιέχει εσωτερικό anchor link (εξαιρείται το απλό '#')
                        const isAnchor = parentLink.href.includes('#') && parentLink.getAttribute('href') !== '#';
                        if (!isBloggerImage || isAnchor) return; 
                    }

                    e.preventDefault(); e.stopPropagation();
                    AppLightbox.open(lightboxImg); 
                    return;
                }
                
                // 4. Click μέσα στο Lightbox Navigation
                const lbNext = e.target.closest('.my-custom-lightbox-next');
                const lbPrev = e.target.closest('.my-custom-lightbox-prev');
                const lbClose = e.target.closest('.my-custom-lightbox-close');
                const lbThumb = e.target.closest('.thumb-wrapper');
                
                if (document.body.classList.contains('lb-active')) {
                    if (lbNext) { e.stopPropagation(); AppLightbox.navigate(1); }
                    else if (lbPrev) { e.stopPropagation(); AppLightbox.navigate(-1); }
                    else if (lbClose) { AppLightbox.close(); }
                    else if (lbThumb) { 
                        e.stopPropagation(); 
                        AppLightbox.currentIndex = parseInt(lbThumb.dataset.index, 10); 
                        AppLightbox.updateMedia(); 
                    }
                    // Click στο background κλείνει το lightbox
                    else if (e.target.classList.contains('my-custom-lightbox') || e.target.classList.contains('my-custom-lightbox-img-container')) {
                        AppLightbox.close();
                    }
                    return;
                }

              // 5. Smart Close Άρθρου (Click εκτός ανοιχτού άρθρου)
                const openWrappers = document.querySelectorAll('.fetched-content-wrapper.is-open');
                if (openWrappers.length > 0) {
                    // Ελέγχουμε αν το κλικ έγινε ΜΕΣΑ σε ΟΠΟΙΟΔΗΠΟΤΕ από τα ανοιχτά άρθρα
                    const clickedInsideAny = Array.from(openWrappers).some(wrapper => {
                        const currentPost = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                        return currentPost && currentPost.contains(e.target);
                    });
                // Διατήρηση State: Αποτροπή κλεισίματος αν το κλικ γίνει σε πλαϊνή στήλη, Widget ή Slider!
                    const isOutsideWidget = e.target.closest('aside, .sidebar, .widget, .slider');
                    if (!clickedInsideAny && !isOutsideWidget) {
                        ArticleEngine.closeAllOpened();
                    }
                }
            });
        }
    };

    // Boot App
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
    }

})();
