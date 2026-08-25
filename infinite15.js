const initInfiniteScroll = () => {

    const path = window.location.pathname;
    if (path.match(/\/\d{4}\/\d{2}\/.*\.html/) || path.match(/\/p\/.*\.html/)) return;
  
  const postsContainer = document.querySelector('.widget.Blog') || document.querySelector('.blog-posts') || document.querySelector('#main') || document.querySelector('.main-inner');
    const loadMoreBtn = document.querySelector('.blog-pager-older-link a') || document.querySelector('.blog-pager-older-link');
    
    if (!postsContainer || !loadMoreBtn) return;

   // ΔΙΟΡΘΩΣΗ BUG 1: Αφαιρέθηκε το παγκόσμιο μπλοκάρισμα για να λειτουργούν τα πλαϊνά widgets.
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
                /* ΔΙΟΡΘΩΣΗ BUG 7: transform: none, αλλιώς σπάνε τα position: sticky μέσα στο άρθρο! */
                transform: none;
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
    sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none; visibility: hidden; margin: 0; padding: 0; clear: both; grid-column: 1 / -1;';
    postsContainer.appendChild(sentinel);
    const endOfPosts = () => {

       // Προστασία πλοήγησης: Κρύβουμε αυστηρά ΜΟΝΟ το δοχείο των παλαιότερων αναρτήσεων 
        // ώστε να παραμείνει ορατό το κουμπί των "Νεότερων Αναρτήσεων" και της "Αρχικής".
        if (loadMoreBtn.parentElement && (loadMoreBtn.parentElement.classList.contains('blog-pager-older-link') || loadMoreBtn.parentElement.id === 'blog-pager-older-link')) {
            loadMoreBtn.parentElement.style.display = 'none';
        }
        
        loadMoreBtn.style.display = 'none';
        sentinel.remove();     // Διαγραφή από το DOM (Εξοικονόμηση πόρων)
        observer.disconnect(); // Σταματάμε να "ακούμε" το scroll
    };
  // 5. Βελτιστοποιημένη Φόρτωση με Async/Await
    const loadNextPage = async () => {
      
        const currentHref = loadMoreBtn.getAttribute('data-safe-url') || loadMoreBtn.href || (loadMoreBtn.querySelector('a') ? loadMoreBtn.querySelector('a').href : null);
        if (isFetching || !currentHref) return;
        
        loadMoreBtn.setAttribute('data-safe-url', currentHref);
        isFetching = true;
        let hasError = false; 
        observer.unobserve(sentinel);
        const nextUrl = currentHref;
    
        loadMoreBtn.classList.add('infinite-btn-loading');
        loadMoreBtn.innerHTML = '<span aria-live="polite">⏳ Φόρτωση επόμενων...</span>';

        try {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Network response error: ${response.status}`);
            
            const html = await response.text();
    
            const doc = new DOMParser().parseFromString(html, "text/html");
            
        const newDocContainer = doc.querySelector('.widget.Blog') || doc.querySelector('.blog-posts') || doc.querySelector('#main') || doc.querySelector('.main-inner');
            // Προσθήκη επιλογέων για το Blogger Mobile Theme και απλά custom themes
            const rawNewPosts = newDocContainer ? newDocContainer.querySelectorAll('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer') : [];
         
            const postsArray = Array.from(rawNewPosts).filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer'));
            
            if (postsArray.length > 0) {
                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 1: Χρήση DocumentFragment (Μηδενικό reflow - άριστο Performance)
                const fragment = document.createDocumentFragment();

                postsArray.forEach(post => {
                    post.classList.add('infinite-post-hidden');
            
                    post.querySelectorAll('script').forEach(oldScript => {
           
                    // ΝΕΑ ΔΙΟΡΘΩΣΗ: Έλεγχος για διπλότυπα εργαλεία ΟΧΙ ΜΟΝΟ στη ζωντανή σελίδα, 
                        // αλλά ΚΑΙ μέσα στο ίδιο το "πακέτο" των νέων άρθρων (fragment).
                        if (oldScript.src && (Array.from(document.scripts).some(s => s.src === oldScript.src) || Array.from(fragment.querySelectorAll('script')).some(s => s.src === oldScript.src))) {
                            oldScript.remove();
                            return;
                        }

                       const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
              
                 if (newScript.src) {
                            newScript.async = false;
                            newScript.textContent = oldScript.textContent;
                        } else {
                            // Αναγνώριση του τύπου του script
                            const scriptType = (oldScript.getAttribute('type') || '').toLowerCase();
                            const isExecutableJS = !scriptType || scriptType === 'text/javascript' || scriptType === 'application/javascript' || scriptType === 'module';

                            if (isExecutableJS && oldScript.textContent.trim() !== '') {
                                // ΝΕΑ ΔΙΟΡΘΩΣΗ (BLOB): Μετατροπή των εσωτερικών scripts σε εικονικά εξωτερικά.
                                // Αναγκάζει τον browser να περιμένει να κατέβουν πρώτα οι βιβλιοθήκες!
                                const blob = new Blob([oldScript.textContent], { type: 'text/javascript' });
                                newScript.src = URL.createObjectURL(blob);
                                newScript.async = false; 
                            } else {
                                // Τα JSON-LD (SEO) και τα HTML Templates παραμένουν άθικτα,
                                // και χωρίς τα άγκιστρα {} της αρχικής έκδοσης!
                                newScript.textContent = oldScript.textContent;
                            }
                        }
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                    
                   fragment.appendChild(post);
                });

               // ΔΙΟΡΘΩΣΗ BUG 5: Πλήρης κάλυψη WebP/srcset, YouTube Iframes, και Backgrounds
                fragment.querySelectorAll('img[data-src], img[data-original], img[b\\:lazy-src], img[data-srcset], source[data-srcset], iframe[data-src], [data-bg]').forEach(el => {
                    const realSrc = el.getAttribute('data-src') || el.getAttribute('data-original') || el.getAttribute('b:lazy-src');
                    const realSrcset = el.getAttribute('data-srcset');
                    const realBg = el.getAttribute('data-bg');

                    if (realSrc && el.tagName !== 'SOURCE') {
                        el.src = realSrc;
                        el.removeAttribute('data-src'); el.removeAttribute('data-original'); el.removeAttribute('b:lazy-src');
                    }
                    if (realSrcset) {
                        el.srcset = realSrcset;
                        el.removeAttribute('data-srcset');
                    }
                    if (realBg) {
                        el.style.backgroundImage = `url('${realBg}')`;
                        el.removeAttribute('data-bg');
                    }
                    // Απεγκλωβισμός από CSS του Theme που κρύβει την εικόνα αν έχει την κλάση lazy
                    el.classList.remove('lazy', 'lazyload', 'lazy-hidden');
                    el.classList.add('lazyloaded');
                });

            // ΔΙΟΡΘΩΣΗ 2Γ: Βάζουμε τα νέα άρθρα ακριβώς κάτω από το τελευταίο υπάρχον άρθρο.
                const rawCurrentPosts = postsContainer.querySelectorAll('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer');
            
                const currentPostsArray = Array.from(rawCurrentPosts).filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer'));
                const lastPost = currentPostsArray[currentPostsArray.length - 1];
       
                if (typeof document.write === 'function' && !window.isDocWriteSafeguarded) {
                    document.write = function() { console.warn('Αποτράπηκε page wipe από καθυστερημένο document.write'); };
                    document.writeln = function() {};
                    window.isDocWriteSafeguarded = true; // Κλειδώνει οριστικά για όση ώρα ο χρήστης είναι στη σελίδα
                }

              if (lastPost) {
                    lastPost.after(fragment);
                } else {
                    // Εισαγωγή των νέων άρθρων ΠΡΙΝ από τον αισθητήρα, ώστε 
                    // το sentinel να παραμένει πάντα στον απόλυτο πάτο του δοχείου.
                    postsContainer.insertBefore(fragment, sentinel);
                }

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

           
          document.dispatchEvent(new CustomEvent('newPostsLoaded'));
               
               // ΝΕΑ ΔΙΟΡΘΩΣΗ: Δυναμικός επαναϋπολογισμός ύψους για διατάξεις πλέγματος (Masonry/Grid) 
               // κάθε φορά που ολοκληρώνεται η φόρτωση μιας αργής φωτογραφίας, αποτρέποντας την επικάλυψη.
               postsArray.forEach(post => {
                   post.querySelectorAll('img').forEach(img => {
                       if (!img.complete) {
                           img.addEventListener('load', () => window.dispatchEvent(new Event('resize')));
                       }
                   });
               });

               setTimeout(() => {
                   // Η προηγούμενη διόρθωση παραμένει άθικτη εδώ
                   if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') window.twttr.widgets.load();
                   if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') window.instgrm.Embeds.process();
                   if (window.FB && window.FB.XFBML && typeof window.FB.XFBML.parse === 'function') window.FB.XFBML.parse();
                   
                   window.dispatchEvent(new Event('resize')); 
               }, 500);
                const newLink = doc.querySelector('.blog-pager-older-link a') || doc.querySelector('.blog-pager-older-link [href]') || doc.querySelector('.blog-pager-older-link');
                
                // Προσθήκη .getAttribute('href') για αποφυγή σφαλμάτων "about:blank" από τον DOMParser
                const newHref = newLink ? (newLink.getAttribute('href') || newLink.href || (newLink.querySelector('a') ? newLink.querySelector('a').getAttribute('href') || newLink.querySelector('a').href : null)) : null;

              if (newHref && newHref !== nextUrl) {
    
                    loadMoreBtn.innerHTML = originalBtnText; 

                    loadMoreBtn.href = newHref;
                    if (loadMoreBtn.querySelector('a')) loadMoreBtn.querySelector('a').href = newHref;
                    
                    // ΚΡΙΣΙΜΗ ΔΙΟΡΘΩΣΗ: Ενημερώνουμε το data-safe-url για να μην διαβάζει τα παλιά άρθρα!
                    loadMoreBtn.setAttribute('data-safe-url', newHref);
                    
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
     
        rootMargin: '1000px'
    });

  observer.observe(sentinel);
};

// ΝΕΑ ΔΙΟΡΘΩΣΗ: Ασφαλής εκκίνηση. Ελέγχει αν η σελίδα έχει ΗΔΗ φορτώσει 
// (π.χ. λόγω Cookie Banners). Αν ναι, εκτελείται άμεσα.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInfiniteScroll);
} else {
    initInfiniteScroll();
}
