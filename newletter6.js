(() => {
    "use strict";

    const CONFIG = Object.freeze({
        storageKey: "newsletter_subscribed",
        hideDays: 30 
    });

    const NewsletterManager = {
        init: () => {
            // Αν θες να φαίνεται μόνο στην αρχική του blog, βγάλε τα // από την επόμενη γραμμή
            // const path = window.location.pathname;
            // if (path !== '/' && path !== '/index.html') return;

            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            const box = document.getElementById('mobile-newsletter-box');
            if (!wrapper || !box) return;

            // Έλεγχος μνήμης: Αν το έχεις ήδη δοκιμάσει, σβήσε τα cookies σου για να το δεις
            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            if (hideUntil && now < parseInt(hideUntil, 10)) { return; }

            // Εμφανίζουμε το κουτί κανονικά
            wrapper.style.display = ''; 
            wrapper.classList.add('show-on-home');
            
            NewsletterManager.setupInteractions(wrapper, box);
        },

        setupInteractions: (wrapper, box) => {
            const input = document.getElementById("nl-input");
            const noticeWrapper = document.getElementById("nl-notice-wrapper");
            const submitBtn = document.getElementById("nl-submit-btn");
            const icon = document.getElementById("nl-icon");
            const form = document.getElementById("nl-form");

            input?.addEventListener("focus", () => {
                noticeWrapper?.classList.add("open");
            }, { once: true });

            input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) {
                    submitBtn?.removeAttribute("disabled");
                } else {
                    submitBtn?.setAttribute("disabled", "true");
                }
            });

            form?.addEventListener("submit", () => {
                // 1. Το εικονίδιο αλλάζει σε αεροπλάνο, αλλά ΔΕΝ πετάει, μένει εκεί!
                if (icon) {
                    icon.innerHTML = "✈️"; 
                }
                
                // 2. Το κουμπί γίνεται πράσινο χωρίς να πειράξουμε τη φόρμα
                if (submitBtn) {
                    submitBtn.innerHTML = "Στάλθηκε! 🚀";
                    submitBtn.style.backgroundColor = "#27ae60"; 
                    submitBtn.style.color = "#ffffff";
                }
                
                // 3. ΔΕΝ ΕΞΑΦΑΝΙΖΟΥΜΕ ΤΙΠΟΤΑ. Το κουτί μένει όπως είναι στην οθόνη.
                
                // Αποθηκεύουμε στη μνήμη ώστε την *επόμενη φορά* που θα μπει στο blog (αύριο π.χ.) να μην το δει
                const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', NewsletterManager.init);
    } else {
        NewsletterManager.init();
    }
})();
