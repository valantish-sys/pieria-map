(() => {
    "use strict";

    const NewsletterManager = {
        init: () => {
            const path = window.location.pathname;
            
            // 1. Guard Clause (Αν δεν είμαστε στην αρχική, σταμάτα αμέσως)
            if (path !== '/' && path !== '/index.html') return;

            // 2. Optional Chaining (Βρες το και αν υπάρχει, βάλε την κλάση)
            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            wrapper?.classList.add('show-on-home');
        }
    };

    // 3. Bulletproof Φόρτωση (Τρέχει σωστά όπου κι αν το βάλεις)
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', NewsletterManager.init);
    } else {
        NewsletterManager.init();
    }
})();
