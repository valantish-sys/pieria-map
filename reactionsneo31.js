import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
   import { getDatabase, ref, runTransaction, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
    // ΕΝΑΡΞΗ ΤΗΣ ΕΦΑΡΜΟΓΗΣ ΣΟΥ
    // ==========================================
    (() => {
        "use strict";

        // ==========================================
        // 1. CONFIGURATION & STATE (Αφαιρέθηκε το API FEEDBACK)
        // ==========================================
        const CONFIG = Object.freeze({
            SELECTORS: {
                ARTICLE_CONTAINER: '.post-outer, .post, article, .blog-post, .mobile-post-outer, .date-outer',
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
            BASE_URL: window.location.origin + '/'
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
                if (window.location.pathname.includes('.html')) return window.location.pathname;
                const linkElem = container.querySelector(CONFIG.SELECTORS.POST_LINK);
                try { 
                    if (!linkElem || !linkElem.href) return null;
                    const url = new URL(linkElem.href);
                    url.hash = ''; // Σβήνει το # για αποφυγή Fatal Error στο Slider
                    return url.pathname;
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
                    let src = node.src;
                    const pLink = node.closest('a');
                    if (pLink && pLink.href && pLink.href.match(/\.(jpe?g|png|gif|webp)(\?.*)?$/i)) src = pLink.href;
                    
                    this.galleryData.push({ type: 'image', src: src, thumb: node.src, el: node });
                    
                    // Απενεργοποίηση default link και Event Delegation trigger
                    if(pLink) pLink.addEventListener('click', e => e.preventDefault());
                    node.style.cursor = 'zoom-in';
                    node.dataset.lightboxIndex = this.galleryData.length - 1;
                    
                } else if (tag === 'iframe') {
                    let vidSrc = node.src.startsWith('//') ? 'https:' + node.src : node.src;
                    let thumbSrc = 'https://via.placeholder.com/150x100/333333/FFFFFF?text=VIDEO';
                    const ytMatch = vidSrc.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                    if (ytMatch && ytMatch[1]) thumbSrc = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                    
                    this.galleryData.push({ type: 'video', src: vidSrc, thumb: thumbSrc, el: node });
                }
            });
        }

        // Η ΝΕΑ δυναμική μέθοδος open (The Patch)
        open(clickedElement) {
            // 1. Βρίσκουμε το άρθρο στο οποίο ανήκει η εικόνα που πατήθηκε
            const wrapper = clickedElement.closest('.fetched-content-wrapper');
            if (!wrapper) return;

            // 2. Μαζεύουμε ΟΛΑ τα media αυτού του συγκεκριμένου άρθρου on-the-fly
            const mediaNodes = Array.from(wrapper.querySelectorAll('.scrollable-article-area img, .scrollable-article-area iframe'));
            this.init(mediaNodes); 

            if (this.galleryData.length === 0) return;

            // 3. Βρίσκουμε ποια ακριβώς εικόνα πατήθηκε για να ξεκινήσουμε από αυτή
            this.currentIndex = this.galleryData.findIndex(item => item.el === clickedElement);
            if (this.currentIndex === -1) this.currentIndex = 0;

            // 4. Εμφάνιση
            this.buildDOM();
            this.bindEvents();
            this.updateMedia();
        }

        buildDOM() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'my-custom-lightbox';
            
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
            
            setTimeout(() => {
                const currentMedia = this.galleryData[this.currentIndex];
                
                if (currentMedia.type === 'image') {
                    containerDiv.innerHTML = `<img src="${currentMedia.src}" class="my-lb-media" alt="Gallery Image">`;
                } else {
                    containerDiv.innerHTML = `<iframe src="${currentMedia.src}" class="my-lb-media" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                }

                if (counterSpan) counterSpan.innerText = this.currentIndex + 1;
                
                thumbWrappers.forEach(t => t.classList.remove('active'));
                if (thumbWrappers[this.currentIndex]) {
                    thumbWrappers[this.currentIndex].classList.add('active');
                    thumbWrappers[this.currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
                
                containerDiv.style.opacity = '1';
            }, 200);
        }

       bindEvents() {
            document.addEventListener('keydown', this.handleKeydown);
            
            const containerDiv = this.overlay.querySelector('.my-custom-lightbox-img-container');
            containerDiv.addEventListener('touchstart', e => {
                if (e.touches && e.touches.length > 1) return; // Αγνόησε το Multi-touch (zoom)
                this.touchStartX = e.changedTouches[0].screenX;
            }, {passive: true});
            
            containerDiv.addEventListener('touchend', e => {
                if (e.changedTouches && e.changedTouches.length > 1) return; // Αγνόησε το Multi-touch
                this.handleSwipe(e.changedTouches[0].screenX);
            }, {passive: true});
        }

        handleKeydown(e) {
            if (e.key === 'ArrowRight') this.navigate(1);
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'Escape') this.close();
        }

        handleSwipe(touchEndX) {
            const swipeThreshold = 50;
            if (touchEndX < this.touchStartX - swipeThreshold) this.navigate(1);
            if (touchEndX > this.touchStartX + swipeThreshold) this.navigate(-1);
        }

        navigate(direction) {
            this.currentIndex += direction;
            if (this.currentIndex < 0) this.currentIndex = this.galleryData.length - 1;
            if (this.currentIndex >= this.galleryData.length) this.currentIndex = 0;
            this.updateMedia();
        }

        close() {
            this.overlay.classList.remove('show');
            document.body.classList.remove("lb-active");
            
            // GARBAGE COLLECTION: Αφαίρεση του listener για αποφυγή Memory Leak!
            document.removeEventListener('keydown', this.handleKeydown);
            
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) this.overlay.remove();
                this.overlay = null;
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
            // Αρχικοποίηση Observer για το Lazy Loading
            if (!this.observer) {
                this.observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const div = entry.target;
                            const safePostId = div.dataset.postid;
                            
                            // Παίρνουμε τα δεδομένα (get) ΜΟΝΟ όταν το άρθρο φανεί στην οθόνη
                            get(ref(db, 'reactions/' + safePostId)).then((snapshot) => {
                                const d = snapshot.val() || { love: 0, funny: 0, wow: 0 };
                                div.querySelector('.count-love').innerText = d.love || 0;
                                div.querySelector('.count-funny').innerText = d.funny || 0;
                                div.querySelector('.count-wow').innerText = d.wow || 0;
                            }).catch(err => console.error("Firebase get Error:", err));
                            
                            obs.unobserve(div); // Τέλος παρακολούθησης γι' αυτό το post
                        }
                    });
                }, { rootMargin: '200px' }); // Φορτώνει λίγο πριν μπει στην οθόνη
            }

            document.querySelectorAll(CONFIG.SELECTORS.ARTICLE_CONTAINER).forEach(container => {
                if (container.querySelector('.smart-feedback-container')) return;

                const postId = Utils.getPostPath(container);
                if (!postId || postId === '/' || postId.length < 3) return;

                const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
                let target = container.querySelector(CONFIG.SELECTORS.POST_BODY) || container;
                
                const hasVoted = localStorage.getItem('feedback_' + safePostId);
                const div = document.createElement('div');
                div.className = `smart-feedback-container ${hasVoted ? 'voted' : ''}`;
                
                // Προσθήκη κενού προς τα κάτω για ωραία στοίχιση πάνω από το "Διαβάστε Περισσότερα"
                div.style.marginBottom = "15px"; 
                div.dataset.postid = safePostId;

                const btnStyle = hasVoted ? "opacity: 0.8; pointer-events: none;" : "";
                
                // Δημιουργούμε το div με παύλες αρχικά, μέχρι να τα φέρει το Lazy Load
                div.innerHTML = `
                    <div class="smart-feedback-buttons" style="${btnStyle}" data-postid="${safePostId}">
                        <button class="smart-feedback-btn" data-type="love"><span>❤️</span><span class="count-love">-</span></button>
                        <button class="smart-feedback-btn" data-type="funny"><span>😂</span><span class="count-funny">-</span></button>
                        <button class="smart-feedback-btn" data-type="wow"><span>😮</span><span class="count-wow">-</span></button>
                    </div>`;
                
                target.appendChild(div);
                
                // Ξεκινάμε την παρακολούθηση (Lazy Load)
                this.observer.observe(div);
            });
        }

       static handleReaction(btn) {
            if (navigator.vibrate) navigator.vibrate(15);
            
            const btnContainer = btn.closest('.smart-feedback-buttons');
            const mainContainer = btn.closest('.smart-feedback-container');
            const safePostId = btnContainer.dataset.postid;
            const type = btn.dataset.type;
            const spanCount = btn.querySelector('span:last-child');
            const emojiSymbol = btn.querySelector('span:first-child').innerText;
            
            // --- ΕΦΕ PARTICLES (Emojis που πετάγονται!) ---
            for (let i = 0; i < 4; i++) {
                const particle = document.createElement('div');
                particle.innerText = emojiSymbol;
                particle.style.position = 'absolute';
                particle.style.left = `${btn.getBoundingClientRect().left + window.scrollX + 15}px`;
                particle.style.top = `${btn.getBoundingClientRect().top + window.scrollY}px`;
                particle.style.fontSize = '24px';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';
                particle.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                document.body.appendChild(particle);

                requestAnimationFrame(() => {
                    particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -${Math.random() * 50 + 40}px) scale(1.5)`;
                    particle.style.opacity = '0';
                });
                setTimeout(() => particle.remove(), 800);
            }
            // ----------------------------------------------

            spanCount.innerText = "..";
            btnContainer.style.pointerEvents = 'none'; 

            const reactionRef = ref(db, 'reactions/' + safePostId + '/' + type);
            const totalRef = ref(db, 'stats/total_reactions');
            
            Promise.all([
                runTransaction(reactionRef, (currentCount) => { return (currentCount || 0) + 1; }),
                runTransaction(totalRef, (currentTotal) => { return (currentTotal || 0) + 1; })
            ])
            .then((results) => {
                // Το νέο νούμερο που μόλις καταγράφηκε στη βάση
                const newCount = results[0].snapshot.val(); 
                spanCount.innerText = newCount;
                
                localStorage.setItem('feedback_' + safePostId, 'voted');
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
                spanCount.innerText = "!";
            });
        }

        static processFetchedContent(fetchedBody, summaryWrap) {
            fetchedBody.querySelectorAll('a[name="more"], [id^="more-"], .jump-link, script').forEach(n => n.remove());

            // Αλγόριθμος "Χειρουργικής Αφαίρεσης" TreeWalker
            let summaryCleanText = summaryWrap.textContent.replace(/[\s\.\…]+$/, '').trim();
            let words = summaryCleanText.split(/\s+/);
            let lastWord = words.pop() || ""; 
            let textToMatch = words.join(' '); 
            let cleanTextToMatch = Utils.cleanString(textToMatch);

            let walker = document.createTreeWalker(fetchedBody, NodeFilter.SHOW_TEXT, null, false);
            let runningText = "";
            let nodesToRemove = [];
            let stopNow = false;

            while (walker.nextNode() && !stopNow) {
                let node = walker.currentNode;
                let nodeText = node.nodeValue;
                for (let i = 0; i < nodeText.length; i++) {
                    runningText += nodeText[i];
                    let currentCompare = Utils.cleanString(runningText);
                    
                    if (cleanTextToMatch.startsWith(currentCompare) || currentCompare.startsWith(cleanTextToMatch)) {
                        continue;
                    } else {
                        node.nodeValue = nodeText.substring(i - lastWord.length);
                        stopNow = true;
                        break;
                    }
                }
                if (!stopNow) nodesToRemove.push(node);
            }
            
            nodesToRemove.forEach(n => { if (n.parentNode) n.nodeValue = ""; });

            // Προστασία Media (Αφαίρεση διπλότυπων)
            fetchedBody.querySelectorAll('img, iframe').forEach(m => {
                if (summaryWrap.querySelector(`${m.tagName}[src="${m.src}"]`)) m.remove();
            });
        }

        static open(post, btn, wrapper, url) {
            wrapper.classList.add('is-open'); 
            btn.classList.remove('is-loading');
            btn.innerHTML = CONFIG.LABELS.CLOSE;
            post.classList.add('is-expanded');
            window.history.pushState({art:url}, '', url); 
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // 2. Στην close (πρόσθεσε την 3η παράμετρο):
static close(post, btn, isPopState = false) {
    const wrapper = post.querySelector('.fetched-content-wrapper');
    if (wrapper) wrapper.classList.remove('is-open');
    if (btn) btn.innerHTML = CONFIG.LABELS.READ_MORE;
    if (post) post.classList.remove('is-expanded');

    // Αλλάζουμε URL μόνο αν το έκλεισε ο χρήστης χειροκίνητα με κλικ
    if (!isPopState && window.location.pathname !== "/") {
        window.history.pushState(null, '', CONFIG.BASE_URL);
    }
}

        static closeAllOpened(e) {
    const isPopState = e && e.type === 'popstate';
    document.querySelectorAll('.fetched-content-wrapper.is-open').forEach(wrapper => {
        const post = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
        const btn = post.querySelector('.custom-read-more');
        ArticleEngine.close(post, btn, isPopState);
    });
}
    }
// ==========================================
    // 5. FEEDBACK ENGINE (Αυτόνομο Module)
    // ==========================================
    class FeedbackEngine {
        static scan() {
            document.querySelectorAll(CONFIG.SELECTORS.ARTICLE_CONTAINER).forEach(container => {
                if (container.querySelector('.smart-feedback-container')) return;

                const postId = Utils.getPostPath(container);
                if (!postId || postId === '/' || postId.length < 3) return;

                // ΤΟ FIX: Προστέθηκε το \/ για να σβήνει και τις κάθετες γραμμές του Blogger!
                const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');

                let target = container.querySelector(CONFIG.SELECTORS.POST_BODY) || container;
                
                const hasVoted = localStorage.getItem('feedback_' + safePostId);
                const div = document.createElement('div');
                div.className = `smart-feedback-container ${hasVoted ? 'voted' : ''}`;
                const btnStyle = hasVoted ? "opacity: 0.8; pointer-events: none;" : "";

                div.innerHTML = `
                    <div class="smart-feedback-buttons" style="${btnStyle}" data-postid="${safePostId}">
                        <button class="smart-feedback-btn" data-type="love"><span>❤️</span><span class="count-love">0</span></button>
                        <button class="smart-feedback-btn" data-type="funny"><span>😂</span><span class="count-funny">0</span></button>
                        <button class="smart-feedback-btn" data-type="wow"><span>😮</span><span class="count-wow">0</span></button>
                    </div>`;
                
                target.appendChild(div);

                const postRef = ref(db, 'reactions/' + safePostId);
                onValue(postRef, (snapshot) => {
                    const d = snapshot.val() || { love: 0, funny: 0, wow: 0 };
                    div.querySelector('.count-love').innerText = d.love || 0;
                    div.querySelector('.count-funny').innerText = d.funny || 0;
                    div.querySelector('.count-wow').innerText = d.wow || 0;
                });
            });
        }

        static handleReaction(btn) {
            // --- ΠΡΟΣΘΗΚΗ ΑΜΕΣΗΣ ΔΟΝΗΣΗΣ ΓΙΑ ΤΙΣ ΑΝΤΙΔΡΑΣΕΙΣ ---
            if (navigator.vibrate) navigator.vibrate(15);
            
            const btnContainer = btn.closest('.smart-feedback-buttons');
            const mainContainer = btn.closest('.smart-feedback-container');
            const safePostId = btnContainer.dataset.postid;
            const type = btn.dataset.type;
            const span = btn.querySelector('span:last-child');
            
            span.innerText = "..";
            btnContainer.style.pointerEvents = 'none'; 

            const reactionRef = ref(db, 'reactions/' + safePostId + '/' + type);
            const totalRef = ref(db, 'stats/total_reactions');
            
            Promise.all([
                runTransaction(reactionRef, (currentCount) => { return (currentCount || 0) + 1; }),
                runTransaction(totalRef, (currentTotal) => { return (currentTotal || 0) + 1; })
            ])
            .then(() => {
                localStorage.setItem('feedback_' + safePostId, 'voted');
                mainContainer.classList.add('voted');
                btnContainer.style.opacity = "0.8";
            })
            .catch((error) => {
                console.error("Σφάλμα Firebase:", error);
                btnContainer.style.pointerEvents = 'auto'; 
                span.innerText = "!";
            });
        }
    }
    const AppController = {
        init: () => {
            // Αρχική Σάρωση
            FeedbackEngine.scan();
            ArticleEngine.scan();

            // Setup Global Events & Observers
            AppController.setupGlobalDelegation();
            document.addEventListener('newPostsLoaded', () => {
    FeedbackEngine.scan(); // 1ο: Φτιάχνει τα Emoji
    ArticleEngine.scan();  // 2ο: Φτιάχνει το Κουμπί (άρα θα μπει αναγκαστικά από κάτω!)
});
            
            // Popstate για back button του Browser
            window.addEventListener('popstate', ArticleEngine.closeAllOpened);
          // Popstate για back button του Browser
            window.addEventListener('popstate', ArticleEngine.closeAllOpened);

            // --- ΕΔΩ ΤΟΠΟΘΕΤΕΙΣ ΤΟΝ ΑΚΡΟΑΤΗ ΑΠΟ ΤΟ SLIDER ---
            window.addEventListener('reactionSync', (e) => {
                const { safePostId, type, newCount } = e.detail;
                
                // Ψάχνουμε τα Emojis στα κλασικά άρθρα (Feed) και τα συγχρονίζουμε
                document.querySelectorAll('.smart-feedback-buttons').forEach(btnContainer => {
                    if (btnContainer.dataset.postid === safePostId) {
                        const mainContainer = btnContainer.closest('.smart-feedback-container');
                        if (mainContainer) mainContainer.classList.add('voted');
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
        },

        setupGlobalDelegation: () => {
            // ΕΝΑ ΚΑΙ ΜΟΝΑΔΙΚΟ click listener στο document!
            document.addEventListener('click', (e) => {
                
                // 1. Click σε Smart Feedback Button
                const feedbackBtn = e.target.closest('.smart-feedback-btn');
                if (feedbackBtn) {
                    e.preventDefault(); e.stopPropagation();
                    FeedbackEngine.handleReaction(feedbackBtn);
                    return;
                }

                // 2. Click σε Read More Button
                const readMoreBtn = e.target.closest('.custom-read-more');
                if (readMoreBtn) {
                    e.preventDefault(); e.stopPropagation();
                    ArticleEngine.handleInteraction(readMoreBtn);
                    return;
                }

                // ΑΛΛΑΞΕ ΤΟ "3. Click σε εικόνα/βίντεο" σε αυτό:
                const lightboxImg = e.target.closest('.fetched-content-wrapper .scrollable-article-area img');
                if (lightboxImg) {
                    e.preventDefault(); e.stopPropagation();
                    AppLightbox.open(lightboxImg); // Περνάμε ολόκληρο το στοιχείο (DOM element), όχι απλά έναν αριθμό!
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
                const openWrapper = document.querySelector('.fetched-content-wrapper.is-open');
                if (openWrapper) {
                    const currentPost = openWrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                    if (currentPost && !currentPost.contains(e.target)) {
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
