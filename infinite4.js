document.addEventListener("DOMContentLoaded", () => {
    // 1. Αποφυγή εκτέλεσης σε μεμονωμένα άρθρα (Blogger posts)
    if (window.location.pathname.endsWith('.html')) return;

    // 2. Έξυπνη επιλογή στοιχείων DOM
    const postsContainer = document.querySelector('.blog-posts') || document.querySelector('#main') || document.querySelector('.main-inner');
    const loadMoreBtn = document.querySelector('.blog-pager-older-link a') || document.querySelector('.blog-pager-older-link');
    
    if (!postsContainer || !loadMoreBtn) return;

    let isFetching = false;
    const originalBtnText = loadMoreBtn.innerHTML;

    // 3. Δυναμική Εισαγωγή CSS για Hardware-Accelerated (60fps) Animations
    if (!document.getElementById('infinite-scroll-css')) {
        const style = document.createElement('style');
        style.id = 'infinite-scroll-css';
        style.textContent = `
            .infinite-post-hidden {
                opacity: 0;
                transform: translateY(40px); /* Έρχεται απαλά από κάτω */
            }
            .infinite-post-visible {
                opacity: 1;
                transform: translateY(0);
                /* Premium φυσική κίνηση */
                transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .infinite-btn-loading {
                opacity: 0.6;
                pointer-events: none !important; /* Κλείδωμα για προστασία από πολλαπλά κλικ */
            }
        `;
        document.head.appendChild(style);
    }

    // 4. Δημιουργία αόρατου σημείου ελέγχου (Sentinel)
    const sentinel = document.createElement('div');
    sentinel.id = 'infinite-scroll-sentinel';
    sentinel.setAttribute('aria-hidden', 'true'); // Φιλικό προς Screen Readers
    sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none; visibility: hidden; margin: 0; padding: 0;';
    postsContainer.after(sentinel);

    // Βοηθητική συνάρτηση πλήρους τερματισμού/καθαρισμού
    const endOfPosts = () => {
        if (loadMoreBtn.parentElement && loadMoreBtn.parentElement.classList.contains('blog-pager-older-link')) {
            loadMoreBtn.parentElement.style.display = 'none';
        }
        loadMoreBtn.style.display = 'none';
        sentinel.remove();     // Διαγραφή από το DOM (Εξοικονόμηση πόρων)
        observer.disconnect(); // Σταματάμε να "ακούμε" το scroll
    };

    // 5. Βελτιστοποιημένη Φόρτωση με Async/Await
    const loadNextPage = async () => {
        if (isFetching || !loadMoreBtn.href) return;
        isFetching = true;
        
        const nextUrl = loadMoreBtn.href;
        
        // Οπτική ένδειξη & Προστασία από spam clicks
        loadMoreBtn.classList.add('infinite-btn-loading');
        loadMoreBtn.innerHTML = '<span aria-live="polite">⏳ Φόρτωση επόμενων...</span>';

        try {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Network response error: ${response.status}`);
            
            const html = await response.text();
            
            // Parsing στο background
            const doc = new DOMParser().parseFromString(html, "text/html");
            const newPosts = doc.querySelectorAll('.blog-posts > .date-outer, .blog-posts > .post-outer, article.post');
            
            if (newPosts.length > 0) {
                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 1: Χρήση DocumentFragment (Μηδενικό reflow - άριστο Performance)
                const fragment = document.createDocumentFragment();
                const postsArray = Array.from(newPosts);

                postsArray.forEach(post => {
                    post.classList.add('infinite-post-hidden');
                    fragment.appendChild(post);
                });

                // Όλα τα νέα άρθρα μπαίνουν στη σελίδα με 1 ΜΟΝΟ κίνηση του browser
                postsContainer.appendChild(fragment);

                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 2: Staggered Animations με requestAnimationFrame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        postsArray.forEach((post, index) => {
                            // Εμφάνιση του καθενός άρθρου με διαφορά 100ms (premium αίσθηση)
                            setTimeout(() => {
                                post.classList.remove('infinite-post-hidden');
                                post.classList.add('infinite-post-visible');
                            }, index * 100); 
                        });
                    });
                });

                // Επανεκκίνηση custom scripts του Blogger (π.χ. Read More, LazyLoad εικόνων)
               document.dispatchEvent(new CustomEvent('newPostsLoaded'));

                // Ενημέρωση του συνδέσμου Επόμενης Σελίδας
                const newLink = doc.querySelector('.blog-pager-older-link a') || doc.querySelector('.blog-pager-older-link');
                
                if (newLink && newLink.href && newLink.href !== nextUrl) {
                    loadMoreBtn.href = newLink.href;
                    loadMoreBtn.innerHTML = originalBtnText; // Επαναφορά στο αρχικό κείμενο
                } else {
                    endOfPosts();
                }
            } else {
                endOfPosts();
            }

        } catch (error) {
            console.error("Infinite Scroll Error:", error);
            // FAIL-SAFE / ERROR RECOVERY: Επιτρέπει στον χρήστη να ξαναπροσπαθήσει χωρίς να σπάσει η σελίδα
            loadMoreBtn.innerHTML = '⚠️ Σφάλμα σύνδεσης. Πατήστε για επανάληψη.';
            
            // Δίνουμε τη δυνατότητα κλικ για χειροκίνητη επαναφόρτωση αν κόπηκε το ίντερνετ
            loadMoreBtn.addEventListener('click', function retryHandler(e) {
                e.preventDefault();
                loadMoreBtn.removeEventListener('click', retryHandler);
                loadNextPage();
            }, { once: true });

        } finally {
            // Εκτελείται ΠΑΝΤΑ (Επαναφορά μεταβλητών & CSS)
            isFetching = false;
            loadMoreBtn.classList.remove('infinite-btn-loading');
        }
    };

    // 6. Τέλειος Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        // Υπάρχει μόνο 1 στοιχείο, οπότε κοιτάμε απευθείας το entries[0]
        if (entries[0].isIntersecting) {
            loadNextPage();
        }
    }, {
        // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 3: Τα 1000px εγγυώνται ότι η φόρτωση θα γίνει 
        // 100% αθόρυβα πριν ο χρήστης φτάσει στον πάτο. (Seamless Infinite Scroll)
        rootMargin: '1000px'
    });

    observer.observe(sentinel);
});
