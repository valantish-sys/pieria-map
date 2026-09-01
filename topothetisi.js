(function() {
    "use strict";

    // Τρέχει ΜΟΝΟ στην αρχική σελίδα (ή σε ετικέτες). Όχι μέσα σε μεμονωμένο άρθρο.
    if (window.location.pathname.match(/\/\d{4}\/\d{2}\/.*\.html/) || window.location.pathname.match(/\/p\/.*\.html/)) return;

    const appConfig = {
        apiKey: "AIzaSyBYFxqAvOo0T91L2bFrJ6kA_MnI4uR-sAA",
        databaseURL: "https://anartiseis-7cad1-default-rtdb.europe-west1.firebasedatabase.app"
    };

    let cachedFirebasePosts = [];
    let isFetching = false;

    function fetchAndInject() {
        if (isFetching) return;
        isFetching = true;
        
        const injApp = !firebase.apps.find(a => a.name === "AnartiseisApp") ? firebase.initializeApp(appConfig, "AnartiseisApp") : firebase.app("AnartiseisApp");
        
        injApp.database().ref('parent_posts').orderByChild('status').equalTo('approved').once('value').then(snap => {
            cachedFirebasePosts = [];
            if (snap.exists()) {
                snap.forEach(child => { cachedFirebasePosts.push({ id: child.key, ...child.val() }); });
                cachedFirebasePosts.sort((a, b) => b.timestamp - a.timestamp); // Σορτάρισμα: Πιο πρόσφατα πάνω
            }
            placePostsChronologically();
            isFetching = false;
        }).catch(e => {
            console.error(e);
            isFetching = false;
        });
    }

    function placePostsChronologically() {
        const blogContainer = document.querySelector('.widget.Blog') || document.querySelector('.blog-posts') || document.querySelector('#main');
        if (!blogContainer) return;

        // Βρίσκουμε ΜΟΝΟ τα ορατά άρθρα του Blogger
        const visibleBloggerPosts = Array.from(document.querySelectorAll('.date-outer:not(.fb-injected), .post-outer:not(.fb-injected)'))
            .filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post'));

        if (visibleBloggerPosts.length === 0) return;

        // Υπολογισμός χρονικών ορίων (για να ξέρει τι να σφηνώσει στην 1η σελίδα και τι να αφήσει για το Load More)
        let oldestVisibleTime = 0;
        let newestVisibleTime = Date.now();
        const timestamps = visibleBloggerPosts.map(p => {
             const timeEl = p.querySelector('abbr.published');
             return timeEl ? new Date(timeEl.title || timeEl.innerText).getTime() : 0;
        }).filter(t => t > 0);

        if (timestamps.length > 0) {
            oldestVisibleTime = Math.min(...timestamps);
            newestVisibleTime = Math.max(...timestamps);
        }

        const hasOlderLink = document.querySelector('.blog-pager-older-link') && document.querySelector('.blog-pager-older-link').style.display !== 'none';
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '';

        cachedFirebasePosts.forEach(fbPost => {
            if (document.getElementById('fb-post-' + fbPost.id)) return; // Αν έχει μπει, το προσπερνάμε
            
            // Αν το post είναι πιο ΠΑΛΙΟ από το τελευταίο που βλέπουμε ΚΑΙ υπάρχουν κι άλλες σελίδες, θα το βάλει στο Infinite Scroll
            if (fbPost.timestamp < oldestVisibleTime && hasOlderLink) return;
            // Αν δεν είμαστε στην αρχική και το post είναι πιο ΦΡΕΣΚΟ, δεν το βάζουμε
            if (!isHomePage && fbPost.timestamp > newestVisibleTime) return;

            const dateStr = new Date(fbPost.timestamp).toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const imgHtml = fbPost.imageUrl ? `<img src="${fbPost.imageUrl}" loading="lazy" style="max-width: 100%; border-radius: 8px; margin: 15px auto; display: block; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">` : '';

            const fbEl = document.createElement('div');
            fbEl.className = 'date-outer fb-injected';
            fbEl.id = 'fb-post-' + fbPost.id;
            fbEl.setAttribute('data-timestamp', fbPost.timestamp);

            // Μιμείται το ακριβές HTML/CSS των αναρτήσεών σου
            fbEl.innerHTML = `
              <h2 class="date-header"><span>${dateStr}</span></h2>
              <div class="date-posts">
                <div class="post-outer">
                  <div class="post hentry uncustomized-post-template" style="border-left: 5px solid #1e6cff !important; padding: 20px; background: rgba(30,108,255,0.02); border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin-bottom: 25px; animation: fadeUpModern 0.6s ease forwards;">
                    <h3 class="post-title entry-title" style="margin-bottom: 10px;">
                      <span style="color: #1e6cff !important;">👨‍👩‍👧‍👦 ${escapeHTML(fbPost.title)}</span>
                    </h3>
                    <div class="post-header">
                      <div class="post-header-line-1">
                          <span class="post-author" style="color: #555; font-weight: bold; font-size: 13px;">Από: ${escapeHTML(fbPost.author)}</span>
                          <span class="post-labels" style="float: right;">
                            <span style="background: rgba(30,108,255,0.1); color: #1e6cff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">Η Φωνή σου!</span>
                          </span>
                      </div>
                    </div>
                    <div class="post-body entry-content" style="margin-top: 15px; font-size: 110%; line-height: 1.5;">
                      ${imgHtml}
                      <p style="white-space: pre-wrap; margin:0;">${escapeHTML(fbPost.content)}</p>
                      <div style="clear: both;"></div>
                    </div>
                  </div>
                </div>
              </div>
            `;

            // Ευρεση σωστής θέσης (Χρονολογική Ένθεση)
            let inserted = false;
            for (let i = 0; i < visibleBloggerPosts.length; i++) {
                const bPost = visibleBloggerPosts[i];
                const timeEl = bPost.querySelector('abbr.published');
                const bpTime = timeEl ? new Date(timeEl.title || timeEl.innerText).getTime() : 0;
                
                if (fbPost.timestamp > bpTime) {
                    bPost.parentNode.insertBefore(fbEl, bPost);
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                const sentinel = document.getElementById('infinite-scroll-sentinel');
                const pager = document.querySelector('.blog-pager');
                if (sentinel) sentinel.parentNode.insertBefore(fbEl, sentinel);
                else if (pager) pager.parentNode.insertBefore(fbEl, pager);
                else blogContainer.appendChild(fbEl);
            }
        });
    }

    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
    }

    // Τρέχει στην αρχική φόρτωση, και ΞΑΝΑΤΡΕΧΕΙ (Re-Sort) αν το Infinite Scroll κατεβάσει νέα άρθρα!
    document.addEventListener("DOMContentLoaded", fetchAndInject);
    document.addEventListener("newPostsLoaded", () => setTimeout(placePostsChronologically, 500));
})();
