(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = Object.freeze({
    // [ΒΑΛΕ ΕΔΩ ΤΟΝ ΣΥΝΔΕΣΜΟ ΣΟΥ ΓΙΑ ΤΟ JSON]
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/kidsFactsMob.json", 
    
    factElementId: "fact-text-mob",
    flipInnerId: "flip-inner-mob",
    flippedClass: "is-flipped",
    // ΠΡΟΣΟΧΗ: Βάλε εδώ τον ΜΙΣΟ χρόνο από το CSS transition σου (σε milliseconds). 
    // Αν το CSS σου λέει "transition: transform 0.6s;", βάλε εδώ 300. 
    // Έτσι η αλλαγή θα γίνει ακριβώς στις 90 μοίρες!
    flipMidpointMs: 350 
  });

  // ==========================================
  // 2. STATE 
  // ==========================================
  const STATE = {
    factsArray: [], // Θα γεμίσει δυναμικά από το JSON
    shuffledFacts: [],
    currentIndex: 0
  };

  // ==========================================
  // 3. UTILS (Εργαλεία)
  // ==========================================
  const Utils = {
    // Ο περίφημος αλγόριθμος Fisher-Yates
    // Ανακατεύει τον πίνακα μία φορά, εξαιρετικά γρήγορα και με τέλεια τυχαιότητα
    shuffleArray: (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  };

  // ==========================================
  // 4. MANAGER (Λογική & DOM)
  // ==========================================
  const FlipManager = {
    el: {},

    init: async () => {
      FlipManager.el.fact = document.getElementById(CONFIG.factElementId);
      FlipManager.el.flipInner = document.getElementById(CONFIG.flipInnerId);

      // Ασφάλεια: Αν δεν βρει τα στοιχεία, σταματάει χωρίς error
      if (!FlipManager.el.fact || !FlipManager.el.flipInner) return;

      // --- ΝΕΟΣ ΚΩΔΙΚΑΣ: Λήψη του JSON (Fetch API) ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα δικτύου κατά τη λήψη του JSON.");
        const data = await response.json();
        
        // Υποθέτουμε ότι το JSON έχει ένα κλειδί "kidsFactsMob" που περιέχει τον πίνακα.
        // Αν το JSON σου είναι απευθείας πίνακας, άλλαξέ το σε: STATE.factsArray = data;
        STATE.factsArray = data.kidsFactsMob || [];

      } catch (error) {
        console.error("Αποτυχία φόρτωσης δεδομένων:", error);
        FlipManager.el.fact.innerHTML = "Δε βρέθηκαν πληροφορίες. Δοκίμασε ξανά αργότερα!";
        return; // Σταματάμε την εκτέλεση αν αποτύχει η λήψη
      }
      // ------------------------------------------------

      // Αν υπάρχουν δεδομένα, ανακατεύουμε την "τράπουλα" κατά το φόρτωμα
      if (STATE.factsArray.length > 0) {
        STATE.shuffledFacts = Utils.shuffleArray(STATE.factsArray);
        STATE.currentIndex = 0;
        FlipManager.updateDOM(); // Φορτώνει το πρώτο χωρίς delay
      }

      FlipManager.setupEvents();
    },

    // Τραβάει το επόμενο "χαρτί" χωρίς να κόβει/ράβει τον πίνακα
    getNextFact: () => {
      if (STATE.shuffledFacts.length === 0) return "";
      
      const fact = STATE.shuffledFacts[STATE.currentIndex];
      STATE.currentIndex++;

      // Αν φτάσαμε στο τελευταίο fact, ξανα-ανακατεύουμε την τράπουλα και πάμε από την αρχή
      if (STATE.currentIndex >= STATE.shuffledFacts.length) {
        STATE.shuffledFacts = Utils.shuffleArray(STATE.factsArray);
        STATE.currentIndex = 0;
      }

      return fact;
    },

    updateDOM: () => {
      const nextFact = FlipManager.getNextFact();
      if (nextFact) {
        FlipManager.el.fact.innerHTML = nextFact;
      }
    },

    toggle: () => {
      const { flipInner } = FlipManager.el;
      const isCurrentlyFlipped = flipInner.classList.contains(CONFIG.flippedClass);
      const willBeFlipped = !isCurrentlyFlipped;

      // 1. Γυρίζουμε την κάρτα άμεσα και ομαλά
      window.requestAnimationFrame(() => {
        flipInner.classList.toggle(CONFIG.flippedClass, willBeFlipped);
        flipInner.setAttribute("aria-pressed", String(willBeFlipped));
      });

      // 2. Αλλάζουμε το κείμενο ΣΤΟ ΤΥΦΛΟ ΣΗΜΕΙΟ (90 μοίρες) 
      //    μόνο όταν η κάρτα ανοίγει για να δείξει τη νέα πληροφορία.
      if (willBeFlipped) {
        setTimeout(() => {
          FlipManager.updateDOM();
        }, CONFIG.flipMidpointMs);
      }
    },

    setupEvents: () => {
      const { flipInner } = FlipManager.el;

      // Mouse & Touch
      flipInner.addEventListener("click", FlipManager.toggle);

      // Keyboard (Προσβασιμότητα)
      flipInner.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          FlipManager.toggle();
        } else if (e.key === "Escape") {
          window.requestAnimationFrame(() => {
            flipInner.classList.remove(CONFIG.flippedClass);
            flipInner.setAttribute("aria-pressed", "false");
          });
        }
      });
    }
  };

  // ==========================================
  // 5. ΕΚΚΙΝΗΣΗ
  // ==========================================
  document.addEventListener("DOMContentLoaded", FlipManager.init);

})();
