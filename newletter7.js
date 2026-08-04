(() => {
    "use strict";

    const NewsletterManager = {
        init: () => {
            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            const box = document.getElementById('mobile-newsletter-box');
            if (!wrapper || !box) return;

            // Το κουτί παραμένει πάντα ορατό!
            wrapper.style.display = 'flex'; 
            wrapper.classList.add('show-on-home');
            
            NewsletterManager.setupInteractions(wrapper, box);
        },

        setupInteractions: (wrapper, box) => {
            const input = document.getElementById("nl-input");
            const noticeWrapper = document.getElementById("nl-notice-wrapper");
            const submitBtn = document.getElementById("nl-submit-btn");
            const icon = document.getElementById("nl-icon");
            const form = document.getElementById("nl-form");

            // 1. Εμφάνιση της κρυφής προειδοποίησης στο 1ο κλικ
            input?.addEventListener("focus", () => {
                noticeWrapper?.classList.add("open");
            }, { once: true });

            // 2. Ενεργοποίηση κουμπιού ΜΟΝΟ αν γράψουν email (με @ και .)
            input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) {
                    submitBtn?.removeAttribute("disabled");
                } else {
                    submitBtn?.setAttribute("disabled", "true");
                }
            });

            // 3. Συμπεριφορά όταν πατηθεί το "Εγγραφή"
            form?.addEventListener("submit", () => {
                // Το εικονίδιο γίνεται αεροπλάνο
                if (icon) {
                    icon.innerHTML = "✈️"; 
                }
                
                // Το κουμπί γίνεται πράσινο
                if (submitBtn) {
                    submitBtn.innerHTML = "Στάλθηκε! 🚀";
                    submitBtn.style.backgroundColor = "#27ae60"; 
                    submitBtn.style.color = "#ffffff";
                }
                
                // (Αφαιρέθηκε η μνήμη: Το κουτί δεν πρόκειται να κρυφτεί ποτέ)
            });
        }
    };

    // Ασφαλής φόρτωση
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', NewsletterManager.init);
    } else {
        NewsletterManager.init();
    }
})();
