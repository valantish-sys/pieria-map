/**
 * Enterprise-Grade Infinite Scroll for Blogger
 * Architecture: Object-Oriented, GPU-Accelerated, Network-Safe
 */
(() => {
    'use strict';

    class BloggerInfiniteScroll {
        constructor() {
            // 1. Ελέγχουμε αν είμαστε σε σελίδα άρθρου. Το location.pathname είναι
            // ασφαλές γιατί αγνοεί τα query params (π.χ. τα mobile URLs ?m=1 του Blogger)
            const isItemPage = window.location.pathname.endsWith('.html') || 
                               document.body.classList.contains('item-view');
            if (isItemPage) return;

            // 2. DOM Elements (Ενθυλάκωση)
            this.container = document.querySelector('.blog-posts, #main, .main-inner');
            this.loadMoreWrapper = document.querySelector('.blog-pager-older-link');
            // Ψάχνουμε ρητά το <a> tag για να έχουμε το .href με ασφάλεια
            this.loadMoreBtn = this.loadMoreWrapper ? (this.loadMoreWrapper.querySelector('a') || this.loadMoreWrapper) : null;
            
            if (!this.container || !this.loadMoreBtn || !this.loadMoreBtn.href) return;

            // 3. State Management (Το κέντρο ελέγχου μας)
            this.state = {
                isFetching: false,
                hasError: false, // Λύνει το infinite error loop
                originalBtnText: this.loadMoreBtn.innerHTML,
                abortController: null
            };

            this.init();
        }

        init() {
            this.injectCSS();
            this.createSentinel();
            this.setupObserver();
            
            // Memory Leak Prevention: Καθαρισμός αν ο χρήστης αλλάξει σελίδα (BFCache safe)
            window.addEventListener('pagehide', () => this.destroy());
        }

        injectCSS() {
            if (document.getElementById('infinite-scroll-css')) return;
            
            const style = document.createElement('style');
            style.id = 'infinite-scroll-css';
            // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 1: Μηδενική Javascript. Τα animations παίζουν αποκλειστικά από την GPU μέσω Keyframes
            style.textContent = `
                @keyframes slideUpReveal {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .infinite-post-item {
                    opacity: 0; 
                    /* Το forwards κρατάει το opacity:1 όταν τελειώσει η κίνηση */
                    animation: slideUpReveal 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                    will-change: opacity, transform;
                }
                .infinite-btn-loading {
                    opacity: 0.6;
                    pointer-events: none !important;
                    cursor: wait;
                }
                .infinite-btn-error {
                    color: #d32f2f;
                    cursor: pointer;
                    text-decoration: underline;
                }
            `;
            document.head.appendChild(style);
        }

        createSentinel() {
            this.sentinel = document.createElement('div');
            this.sentinel.setAttribute('aria-hidden', 'true');
            // contain: strict - Λέει στον browser ότι αυτό το αόρατο div δεν επηρεάζει το layout των άλλων στοιχείων (Massive CPU boost)
            this.sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none; visibility: hidden; contain: strict; margin: 0; padding: 0;';
            this.container.after(this.sentinel);
        }

        setupObserver() {
            this.observer = new IntersectionObserver((entries) => {
                // Ο Observer "κλειδώνει" αν έχουμε Error ή αν ήδη φορτώνει
                if (entries[0].isIntersecting && !this.state.isFetching && !this.state.hasError) {
                    this.loadNextPage();
                }
            }, {
                rootMargin: '1200px 0px 0px 0px' // Ακούμε 1200px νωρίτερα, μόνο προς τα κάτω
            });

            this.observer.observe(this.sentinel);
        }

        async loadNextPage() {
            if (!this.loadMoreBtn.href) return;
            
            this.state.isFetching = true;
            this.state.hasError = false;
            
            const nextUrl = this.loadMoreBtn.href;
            this.updateUI('loading');

            // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 2: Ακύρωση προηγούμενου "κολλημένου" request (Network Resiliency)
            if (this.state.abortController) this.state.abortController.abort();
            this.state.abortController = new AbortController();

            try {
                const response = await fetch(nextUrl, { 
                    signal: this.state.abortController.signal,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                
                const html = await response.text();
                this.processHTML(html, nextUrl);

            } catch (error) {
                if (error.name === 'AbortError') return; // Αγνοούμε errors από σκόπιμες ακυρώσεις
                
                console.error("[Infinite Scroll Error]:", error);
                this.state.hasError = true; // Αποτρέπει τον Observer από το να σπαμάρει το δίκτυο!
                this.updateUI('error');
            } finally {
                this.state.isFetching = false;
                this.state.abortController = null;
            }
        }

        processHTML(html, nextUrl) {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const newPosts = doc.querySelectorAll('.blog-posts > .date-outer, .blog-posts > .post-outer, article.post');
            
            if (newPosts.length === 0) {
                this.endOfPosts();
                return;
            }

            const fragment = document.createDocumentFragment();
            const postsArray = Array.from(newPosts);
            
            postsArray.forEach((post, index) => {
                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 3: Native Lazy Load ΠΡΙΝ τα στοιχεία μπουν στο DOM. 
                // Εξοικονομεί τεράστιο όγκο MBs data από τον χρήστη!
                post.querySelectorAll('img:not([loading]), iframe:not([loading])').forEach(media => {
                    media.setAttribute('loading', 'lazy');
                });

                post.classList.add('infinite-post-item');
                // Staggering κατευθείαν στο CSS
                post.style.animationDelay = `${index * 80}ms`;
                
                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 4: VRAM Cleanup. Απελευθερώνουμε τη μνήμη της Κάρτας Γραφικών 
                // μόλις τελειώσει η εμφάνιση του κάθε άρθρου!
                post.addEventListener('animationend', () => {
                    post.style.willChange = 'auto';
                }, { once: true });

                fragment.appendChild(post);
            });

            this.container.appendChild(fragment);

            // Αθόρυβο History API update
            window.history.replaceState(null, '', nextUrl);
            
            // Dispatch event με περασμένα δεδομένα, ώστε αν έχεις scripts για διαφημίσεις 
            // να μην ψάχνουν όλη τη σελίδα από την αρχή
            document.dispatchEvent(new CustomEvent('newPostsLoaded', { 
                detail: { newPosts: postsArray, url: nextUrl } 
            }));

            this.updateNextLink(doc, nextUrl);
        }

        updateNextLink(doc, currentUrl) {
            const newLink = doc.querySelector('.blog-pager-older-link a');
            
            if (newLink && newLink.href && newLink.href !== currentUrl) {
                this.loadMoreBtn.href = newLink.href;
                this.updateUI('reset');
            } else {
                this.endOfPosts();
            }
        }

        updateUI(status) {
            if (status === 'loading') {
                this.loadMoreBtn.classList.remove('infinite-btn-error');
                this.loadMoreBtn.classList.add('infinite-btn-loading');
                this.loadMoreBtn.innerHTML = '<span aria-live="polite">⏳ Φόρτωση επόμενων...</span>';
            } else if (status === 'error') {
                this.loadMoreBtn.classList.remove('infinite-btn-loading');
                this.loadMoreBtn.classList.add('infinite-btn-error');
                this.loadMoreBtn.innerHTML = '⚠️ Σφάλμα δικτύου. Πατήστε για επανάληψη.';
                
                // Προσθήκη Event Listener για χειροκίνητη δοκιμή, που ξεκλειδώνει τον Observer
                const retryHandler = (e) => {
                    e.preventDefault();
                    this.loadMoreBtn.removeEventListener('click', retryHandler);
                    this.state.hasError = false;
                    this.loadNextPage();
                };
                this.loadMoreBtn.addEventListener('click', retryHandler, { once: true });
            } else if (status === 'reset') {
                this.loadMoreBtn.classList.remove('infinite-btn-loading', 'infinite-btn-error');
                this.loadMoreBtn.innerHTML = this.state.originalBtnText;
            }
        }

        endOfPosts() {
            if (this.loadMoreWrapper) this.loadMoreWrapper.style.display = 'none';
            if (this.loadMoreBtn) this.loadMoreBtn.style.display = 'none';
            this.destroy();
        }

        destroy() {
            if (this.observer) this.observer.disconnect();
            if (this.sentinel) this.sentinel.remove();
            if (this.state.abortController) this.state.abortController.abort();
        }
    }

    // Ασφαλής εκκίνηση του Module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new BloggerInfiniteScroll());
    } else {
        new BloggerInfiniteScroll();
    }
})();
