(() => {
    "use strict";

    const CONFIG = Object.freeze({
        storageKey: "newsletter_subscribed",
        hideDays: 30 // Πόσες μέρες δεν θα ξαναεμφανιστεί (στις επόμενες επισκέψεις)
    });

    const NewsletterManager = {
        init: () => {
            const path = window.location.pathname;
            
            // Guard Clause: Αν δεν είμαστε στην αρχική, σταμάτα αμέσως!
            if (path !== '/' && path !== '/index.html') return;

            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            const box = document.getElementById('mobile-newsletter-box');
            if (!wrapper || !box) return;

            // Έλεγχος Μνήμης: Έχει κάνει εγγραφή τις τελευταίες 30 μέρες;
            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                return; // Δεν έχουν περάσει 30 μέρες, δεν εμφανίζεται καν.
            }

            // Εμφάνιση
            wrapper.classList.add('show-on-home');
            
            // Ενεργοποίηση Εφέ
            NewsletterManager.setupInteractions(wrapper, box);
        },

        setupInteractions: (wrapper, box) => {
            const input = document.getElementById("nl-input");
            const noticeWrapper = document.getElementById("nl-notice-wrapper");
            const submitBtn = document.getElementById("nl-submit-btn");
            const icon = document.getElementById("nl-icon");
            const form = document.getElementById("nl-form");

            // Α. Κρυφή Προειδοποίηση (Slide-down στο 1ο κλικ)
            input?.addEventListener("focus", () => {
                noticeWrapper?.classList.add("open");
            }, { once: true });

            // Β. Έξυπνο Κουμπί (Ελέγχει αν υπάρχει "@" και ".")
            input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) {
                    submitBtn?.removeAttribute("disabled");
                } else {
                    submitBtn?.setAttribute("disabled", "true");
                }
            });

            // Γ. Εφέ Απογείωσης στο Submit ✈️
            form?.addEventListener("submit", (e) => {
                
                if (icon) {
                    icon.innerHTML = "✈️";
                    requestAnimationFrame(() => icon.classList.add("fly-away"));
                }
                
                if (submitBtn) {
                    submitBtn.innerHTML = "Η εγγραφή στάλθηκε! 🚀";
                    submitBtn.style.backgroundColor = "#27ae60"; // Πράσινο επιτυχίας
                }
                
                // Αποθηκεύουμε την εγγραφή στη μνήμη για 30 μέρες, 
                // ΧΩΡΙΣ να κλείσουμε/εξαφανίσουμε το παράθυρο αυτή τη στιγμή.
                const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());
            });
        }
    };

    // Bulletproof Φόρτωση
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', NewsletterManager.init);
    } else {
        NewsletterManager.init();
    }
})();
