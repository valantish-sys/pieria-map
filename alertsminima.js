/**
 * ============================================================================
 * ALERT ENGINE (Senior Edition)
 * ============================================================================
 */
(() => {
    "use strict";

    // 1. CONFIGURATION: Κεντρική διαχείριση (Αποφεύγουμε τα hardcoded strings)
    const CONFIG = Object.freeze({
        SELECTORS: {
            BAR: "#school-alert-bar",
            TEXT: "#alert-text-message",
            CLOSE_BTN: ".alert-close-btn" // Βάλε αυτή την κλάση στο X κουμπί σου
        },
        STORAGE_KEY: "school_alert_dismissed",
        STORAGE_HOURS: 24, // Πόσες ώρες να μην ξαναβγεί αν το κλείσει ο χρήστης
        IGNORE_WORDS: ["ΕΔΩ ΓΡΑΦΕΙΣ"]
    });

    // 2. ENGINE ΚΛΑΣΗ
    class AlertEngine {
        constructor() {
            this.hasInitialized = false;
        }

        init() {
            // Guard: Αποφυγή διπλής εκτέλεσης (από DOMContentLoaded και Load)
            if (this.hasInitialized) return;
            
            const alertBar = document.querySelector(CONFIG.SELECTORS.BAR);
            const alertTextElem = document.querySelector(CONFIG.SELECTORS.TEXT);

            // Error Checking: Αν δεν υπάρχουν τα στοιχεία στο HTML, σταμάτα ομαλά
            if (!alertBar || !alertTextElem) return;

            this.hasInitialized = true;
            const text = alertTextElem.innerText.trim();

            // Έλεγχος αν πρέπει να κρυφτεί (Άδειο, #, λέξεις-κλειδιά, ή αν το έχει ήδη κλείσει)
            if (this.shouldHide(text)) {
                alertBar.style.display = "none";
                return;
            }

            // ΕΞΥΠΝΗ ΜΕΤΑΚΙΝΗΣΗ (στην αρχή του body)
            document.body.insertBefore(alertBar, document.body.firstChild);
            alertBar.style.display = "flex";

            // Event Delegation για το κλείσιμο (χωρίς onclick="" στο HTML)
            alertBar.addEventListener("click", (e) => {
                if (e.target.closest(CONFIG.SELECTORS.CLOSE_BTN)) {
                    this.dismiss(alertBar);
                }
            });
        }

        shouldHide(text) {
            // Αν το έχει κλείσει πρόσφατα
            if (this.checkMemory()) return true;
            // Αν το κείμενο είναι άδειο ή αρχίζει από #
            if (!text || text.startsWith("#")) return true;
            // Αν περιέχει απαγορευμένες λέξεις
            if (CONFIG.IGNORE_WORDS.some(word => text.includes(word))) return true;
            
            return false;
        }

        dismiss(alertBar) {
            alertBar.style.display = "none";
            // Αποθήκευση στο localStorage της τρέχουσας ώρας + διάρκεια
            const expiry = Date.now() + (CONFIG.STORAGE_HOURS * 60 * 60 * 1000);
            localStorage.setItem(CONFIG.STORAGE_KEY, expiry.toString());
        }

        checkMemory() {
            const storedTime = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!storedTime) return false;
            
            // Έλεγχος αν έχει λήξει η "μνήμη" (π.χ. πέρασαν 24 ώρες)
            if (Date.now() > parseInt(storedTime, 10)) {
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                return false;
            }
            return true; // Το θυμάται, άρα κρατάμε τη μπάρα κλειστή
        }
    }

    // 3. BOOTSTRAP: Ασφαλής εκκίνηση
    const app = new AlertEngine();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => app.init());
    } else {
        app.init();
    }
    window.addEventListener("load", () => app.init());

})();
