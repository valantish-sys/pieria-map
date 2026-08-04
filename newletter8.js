<script>
(() => {
    "use strict";

    const CONFIG = Object.freeze({
        storageKey: "newsletter_subscribed",
        hideDays: 30 // Πόσες μέρες θα θυμάται το κινητό την εγγραφή (οπότε και θα δείχνει την κορδέλα)
    });

    const RibbonManager = {
        init: () => {
            const path = window.location.pathname;
            // Έλεγχος: Αν δεν είμαστε στην αρχική, σταμάτα αμέσως!
            if (path !== '/' && path !== '/index.html') return;

            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            const box = document.getElementById('mobile-newsletter-box');
            const ribbon = document.getElementById('smart-ribbon');
            
            if (!wrapper || !box || !ribbon) return;

            // Εμφανίζουμε το κεντρικό wrapper
            wrapper.style.display = 'block';

            // Έλεγχος Μνήμης: Έχει κάνει εγγραφή;
            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                // Έχει κάνει εγγραφή! Δείχνουμε ΜΟΝΟ την κορδέλα και κρύβουμε τη φόρμα
                box.classList.add("collapsed");
                ribbon.classList.add("active");
            }

            RibbonManager.setupInteractions(box, ribbon);
        },

        setupInteractions: (box, ribbon) => {
            const input = document.getElementById("nl-input");
            const noticeWrapper = document.getElementById("nl-notice-wrapper");
            const submitBtn = document.getElementById("nl-submit-btn");
            const icon = document.getElementById("nl-icon");
            const form = document.getElementById("nl-form");
            const editBtn = document.getElementById("ribbon-edit-btn");

            // 1. Προειδοποίηση στο 1ο κλικ (Slide-down)
            input?.addEventListener("focus", () => {
                noticeWrapper?.classList.add("open");
            }, { once: true });

            // 2. Έξυπνο Κουμπί (Ελέγχει αν γράφτηκε email)
            input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) {
                    submitBtn?.removeAttribute("disabled");
                } else {
                    submitBtn?.setAttribute("disabled", "true");
                }
            });

            // 3. Επαναφορά της Φόρμας (Αν πατήσει το μολυβάκι ✏️ στην Κορδέλα)
            editBtn?.addEventListener("click", () => {
                // Διαγράφουμε τη μνήμη, για να μην ξαναβγεί η κορδέλα σε περίπτωση refresh
                localStorage.removeItem(CONFIG.storageKey);
                
                // Κλείνουμε την κορδέλα & ανοίγουμε τη φόρμα (αντίστροφο animation)
                ribbon.classList.remove("active");
                box.classList.remove("collapsed");
                
                // Επαναφορά κουμπιού & εικονιδίου για να γράψει νέο email
                if (icon) {
                    icon.innerHTML = "✉️";
                    icon.classList.remove("fly-away");
                }
                if (submitBtn) {
                    submitBtn.innerHTML = 'Εγγραφή <span id="nl-arrow">➔</span>';
                    submitBtn.style.backgroundColor = "#3498db";
                }
            });

            // 4. Η ΜΕΤΑΜΟΡΦΩΣΗ κατά την υποβολή της φόρμας!
            form?.addEventListener("submit", () => {
                // Εφέ επιτυχίας
                if (icon) {
                    icon.innerHTML = "✈️";
                    requestAnimationFrame(() => icon.classList.add("fly-away"));
                }
                if (submitBtn) {
                    submitBtn.innerHTML = "Στάλθηκε! 🚀";
                    submitBtn.style.backgroundColor = "#27ae60"; 
                }

                // Αποθήκευση στη μνήμη του κινητού για 30 μέρες
                const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());

                // Μετά από 2.5 δευτερόλεπτα, η φόρμα κλείνει (collapse) και βγαίνει η κορδέλα (active)!
                setTimeout(() => {
                    box.classList.add("collapsed");
                    ribbon.classList.add("active");
                }, 2500);
            });
        }
    };

    // Ασφαλής Φόρτωση
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', RibbonManager.init);
    } else {
        RibbonManager.init();
    }
})();
</script>
