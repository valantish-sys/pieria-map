document.addEventListener("DOMContentLoaded", () => {
    // 1. Αποφυγή εκτέλεσης σε μεμονωμένα άρθρα (Blogger posts)
    // ΔΙΟΡΘΩΣΗ 3: Χρήση Regex για να αποκλείουμε τα άρθρα (/\d{4}\/\d{2}\/.*\.html/) και τις στατικές σελίδες (/p/.*\.html/), 
    // αλλά ΝΑ ΕΠΙΤΡΕΠΟΥΜΕ το Infinite Scroll στις σελίδες Αρχείου (..._archive.html).
    const path = window.location.pathname;
    if (path.match(/\/\d{4}\/\d{2}\/.*\.html/) || path.match(/\/p\/.*\.html/)) return;

    // 2. Έξυπνη επιλογή στοιχείων DOM

    // 2. Έξυπνη επιλογή στοιχείων DOM
   const postsContainer = document.querySelector('.blog-posts') || document.querySelector('#main') || document.querySelector('.main-inner');
    const loadMoreBtn = document.querySelector('.blog-pager-older-link a') || document.querySelector('.blog-pager-older-link');
    
    if (!postsContainer || !loadMoreBtn) return;

    if (typeof document.write === 'function') {
        document.write = function() {};
        document.writeln = function() {};
    }

    let isFetching = false;
    const originalBtnText = loadMoreBtn.innerHTML;
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isFetching) loadNextPage();
    });
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
        let hasError = false; // ΝΕΟ: Έλεγχος αποτυχίας για αποφυγή κρασαρίσματος
        observer.unobserve(sentinel);
        const nextUrl = loadMoreBtn.href;
        
        // Οπτική ένδειξη & Προστασία από spam clicks
        loadMoreBtn.classList.add('infinite-btn-loading');
        loadMoreBtn.innerHTML = '<span aria-live="polite">⏳ Φόρτωση επόμενων...</span>';

        try {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Network response error: ${response.status}`);
            
            const html = await response.text();
            
            // Parsing στο background
           // Parsing στο background
            const doc = new DOMParser().parseFromString(html, "text/html");
            
            // ΔΙΟΡΘΩΣΗ 2A: Βρίσκουμε αυστηρά το container της νέας σελίδας για να μην τραβήξουμε κατά λάθος 
            // τα μικρά άρθρα από τα πλαϊνά Widgets (Sidebar) που χαλάνε τη ροή!
           // ΔΙΟΡΘΩΣΗ 2A: Βρίσκουμε αυστηρά το container της νέας σελίδας για να μην τραβήξουμε κατά λάθος 
            // τα μικρά άρθρα από τα πλαϊνά Widgets (Sidebar) που χαλάνε τη ροή!
            const newDocContainer = doc.querySelector('.blog-posts') || doc.querySelector('#main') || doc.querySelector('.main-inner');
            const rawNewPosts = newDocContainer ? newDocContainer.querySelectorAll('.date-outer, .post-outer, article.post') : [];
            
            // ΝΕΑ ΔΙΟΡΘΩΣΗ 1Α: (Αποτροπή DOM Shredding). Φιλτράρουμε ώστε να κρατήσουμε ΜΟΝΟ 
            // τα εξωτερικά "κουτιά". Αν το .post-outer είναι ήδη μέσα στο .date-outer, το αγνοούμε!
            const postsArray = Array.from(rawNewPosts).filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post'));
            
            if (postsArray.length > 0) {
                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 1: Χρήση DocumentFragment (Μηδενικό reflow - άριστο Performance)
                const fragment = document.createDocumentFragment();

                postsArray.forEach(post => {
                    post.classList.add('infinite-post-hidden');
                    
                   // ΔΙΟΡΘΩΣΗ 2Β: Κλωνοποιούμε τα <script> ώστε να αναγκάσουμε τον Browser να τα εκτελέσει.
                    // Χωρίς αυτό, τα AdSense, Video Embeds & Share Buttons μένουν νεκρά/λευκά κενά.
                    post.querySelectorAll('script').forEach(oldScript => {
                        // ΝΕΑ ΔΙΟΡΘΩΣΗ 2: Προστασία από "Script Bomb". Αν το script είναι εξωτερικό αρχείο (src) 
                        // και υπάρχει ΗΔΗ στη σελίδα, το πετάμε. Απαγορεύεται να το κατεβάσει/τρέξει 20 φορές!
                        if (oldScript.src && document.querySelector(`script[src="${oldScript.src}"]`)) {
                            oldScript.remove();
                            return;
                        }

                       const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        
                        // ΝΕΑ ΔΙΟΡΘΩΣΗ 2 (BUG 2): Επιβολή αυστηρής σειράς εκτέλεσης. 
                        // Απενεργοποιούμε την ασύγχρονη συμπεριφορά, ώστε τα εξωτερικά αρχεία να κατέβουν ΠΡΙΝ 
                        // τρέξουν τα inline scripts. Αλλιώς τα sliders/galleries του άρθρου θα σπάσουν (ReferenceError).
                        if (newScript.src) {
                            newScript.async = false;
                        }
                        
                        newScript.textContent = oldScript.textContent;
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                    
                   fragment.appendChild(post);
                });

                // ΝΕΑ ΔΙΟΡΘΩΣΗ 3 (BUG 3): Ενεργοποίηση εικόνων στα Premium Themes / Lazy Load.
                // Ανταλλάσσουμε το data-src με το κανονικό src. Χωρίς αυτό, στα themes 
                // που έχουν Lazy Load, τα νέα άρθρα θα φορτώνουν με αόρατες/κενές φωτογραφίες!
                fragment.querySelectorAll('img[data-src], img[data-original], img[b\\:lazy-src]').forEach(img => {
                    const realSrc = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('b:lazy-src');
                    if (realSrc) {
                        img.src = realSrc;
                        img.removeAttribute('data-src');
                        img.removeAttribute('data-original');
                        img.removeAttribute('b:lazy-src');
                    }
                });

                // ΔΙΟΡΘΩΣΗ 2Γ: Βάζουμε τα νέα άρθρα ακριβώς κάτω από το τελευταίο υπάρχον άρθρο.
                const rawCurrentPosts = postsContainer.querySelectorAll('.date-outer, .post-outer, article.post');
                
                // ΝΕΑ ΔΙΟΡΘΩΣΗ 1Β: Ίδιο φίλτρο και στο υπάρχον DOM. Χωρίς αυτό, η νέα σελίδα 
                // θα "σφηνώσει" ΜΕΣΑ στο τελευταίο άρθρο αντί να μπει από κάτω του!
                const currentPostsArray = Array.from(rawCurrentPosts).filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post'));
                const lastPost = currentPostsArray[currentPostsArray.length - 1];
                
                if (lastPost) {
                    lastPost.after(fragment);
                } else {
                    postsContainer.appendChild(fragment);
                }

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
            hasError = true; // Καταγράφουμε το σφάλμα
            // FAIL-SAFE / ERROR RECOVERY: Επιτρέπει στον χρήστη να ξαναπροσπαθήσει χωρίς να σπάσει η σελίδα
            loadMoreBtn.innerHTML = '⚠️ Σφάλμα σύνδεσης. Πατήστε για επανάληψη.';
            
     } finally {
            // Εκτελείται ΠΑΝΤΑ (Επαναφορά μεταβλητών & CSS)
            loadMoreBtn.classList.remove('infinite-btn-loading');
            
            // ΝΕΑ ΔΙΟΡΘΩΣΗ 3: Αποτροπή "Πολυβόλου" (Rapid-Fire Fetching).
            // Δίνουμε ένα μικρό χρονικό περιθώριο (500ms) στον Browser να απλώσει το ύψος των άρθρων,
            // ώστε το sentinel να σπρωχτεί προς τα κάτω. Αλλιώς, θα τραβήξει όλες τις σελίδες αστραπιαία.
            setTimeout(() => {
                isFetching = false;
                if (sentinel.parentNode && !hasError) observer.observe(sentinel);
            }, 500);
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
