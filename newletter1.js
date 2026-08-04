(() => {
    "use strict";

    const CONFIG = Object.freeze({
        storageKey: "newsletter_closed_until",
        hideDays: 30 // Πόσες μέρες θα παραμείνει κρυμμένο αν το κλείσουν ή γραφτούν
    });

    const NewsletterManager = {
        init: () => {
            const path = window.location.pathname;
            
            // 1. Guard Clause: Αν δεν είμαστε στην αρχική, σταμάτα αμέσως!
            if (path !== '/' && path !== '/index.html') return;

            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            const box = document.getElementById('mobile-newsletter-box');
            if (!wrapper || !box) return;

            // 2. Έλεγχος Μνήμης: Έχει πατήσει το "Χ" ή έκανε εγγραφή τις τελευταίες 30 μέρες;
            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                return; // Δεν έχουν περάσει 30 μέρες, παραμένει κρυμμένο, η εκτέλεση σταματάει!
            }

            // 3. Εμφάνιση: Περνάμε την κλάση που είχες
            wrapper.classList.add('show-on-home');
            
            // 4. Ενεργοποίηση Εφέ
            NewsletterManager.setupInteractions(wrapper, box);
        },

        hideAndSave: (wrapper, box) => {
            box.style.opacity = "0";
            box.style.transform = "scale(0.9)";
            
            setTimeout(() => { 
                wrapper.classList.remove('show-on-home'); 
                wrapper.style.display = 'none';
            }, 400);

            // Αποθήκευση στη μνήμη για 30 μέρες
            const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
            localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());
        },

        setupInteractions: (wrapper, box) => {
            const closeBtn = document.getElementById("nl-close-btn");
            const input = document.getElementById("nl-input");
            const noticeWrapper = document.getElementById("nl-notice-wrapper");
            const submitBtn = document.getElementById("nl-submit-btn");
            const icon = document.getElementById("nl-icon");
            const form = document.getElementById("nl-form");

            // Α. Λειτουργία Κλεισίματος ("Χ")
            closeBtn?.addEventListener("click", (e) => {
                e.preventDefault();
                NewsletterManager.hideAndSave(wrapper, box);
            });

            // Β. Κρυφή Προειδοποίηση (Slide-down στο 1ο κλικ)
            input?.addEventListener("focus", () => {
                noticeWrapper?.classList.add("open");
            }, { once: true }); // { once: true } = Τρέχει μόνο την πρώτη φορά!

            // Γ. Έξυπνο Κουμπί (Ελέγχει αν υπάρχει "@" και ".")
            input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) {
                    submitBtn?.removeAttribute("disabled");
                } else {
                    submitBtn?.setAttribute("disabled", "true");
                }
            });

            // Δ. Εφέ Απογείωσης στο Submit ✈️
            form?.addEventListener("submit", () => {
                if (icon) {
                    icon.innerHTML = "✈️";
                    requestAnimationFrame(() => icon.classList.add("fly-away"));
                }
                
                if (submitBtn) {
                    submitBtn.innerHTML = "Η εγγραφή στάλθηκε! 🚀";
                    submitBtn.style.backgroundColor = "#27ae60"; // Πράσινο επιτυχίας
                }
                
                // Μετά από 2.5 δευτερόλεπτα, το κρύβουμε για 30 μέρες
                setTimeout(() => {
                    NewsletterManager.hideAndSave(wrapper, box);
                }, 2500);
            });
        }
    };

    // 5. Bulletproof Φόρτωση
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', NewsletterManager.init);
    } else {
        NewsletterManager.init();
    }
})();
