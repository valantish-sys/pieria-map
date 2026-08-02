(() => {
  "use strict";

  // ==========================================
  // 1. ΔΥΝΑΜΙΚΟΣ ΕΛΕΓΧΟΣ ΑΡΧΙΚΗΣ ΣΕΛΙΔΑΣ
  // ==========================================
  // Εκτελείται αμέσως, πριν καν φορτώσει το DOM, 
  // για να μην υπάρξει καθόλου οπτικό "αναβοσβήσιμο" (FOUC).
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const hideStyle = document.createElement('style');
    hideStyle.innerHTML = `
      @media (min-width: 368px) and (max-width: 1000px) {
        #desktop-flip-wrapper { display: none !important; }
      }
    `;
    document.head.appendChild(hideStyle);
  }

  // ==========================================
  // 2. CONFIGURATION (Σταθερές Desktop)
  // ==========================================
  const CONFIG = Object.freeze({
    // [ΒΑΛΕ ΕΔΩ ΤΟΝ ΣΥΝΔΕΣΜΟ ΣΟΥ ΓΙΑ ΤΟ JSON]
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/kidsFactsDesk.json", 

    factElementId: "fact-text-desk",
    flipInnerId: "flip-inner-desk",
    flipCardId: "my-flip-card-desk",
    flippedClass: "is-flipped",
    // Το μισό του 700ms για να αλλάζει το κείμενο ακριβώς όταν η κάρτα είναι στις 90 μοίρες
    flipMidpointMs: 350 
  });

  // ==========================================
  // 3. STATE (Μνήμη)
  // ==========================================
  const STATE = {
    factsArray: [], // Θα γεμίσει δυναμικά από το JSON
    shuffledFacts: [],
    currentIndex: 0,
    updateTimer: null
  };

  // ==========================================
  // 4. UTILS (Εργαλεία)
  // ==========================================
  const Utils = {
    // Ο αλγόριθμος Fisher-Yates (Ανακάτεμα "Τράπουλας")
    shuffleArray: (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    
    // Ασφαλής αποκωδικοποίηση HTML Entities
    decodeHTML: (str) => {
      const txt = document.createElement("textarea");
      txt.innerHTML = str;
      return txt.value;
    }
  };

  // ==========================================
  // 5. WIDGET MANAGER (Η λογική)
  // ==========================================
  const DesktopFlipManager = {
    el: {},

    init: async () => {
      DesktopFlipManager.el.fact = document.getElementById(CONFIG.factElementId);
      DesktopFlipManager.el.flipInner = document.getElementById(CONFIG.flipInnerId);
      DesktopFlipManager.el.flipCard = document.getElementById(CONFIG.flipCardId);

      // Ασφάλεια: Σταματάει χωρίς σφάλμα αν λείπουν τα HTML στοιχεία
      if (!DesktopFlipManager.el.fact || !DesktopFlipManager.el.flipInner || !DesktopFlipManager.el.flipCard) return;

      // --- ΝΕΟΣ ΚΩΔΙΚΑΣ: Λήψη του JSON (Fetch API) ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα δικτύου κατά τη λήψη του JSON.");
        const data = await response.json();
        
        // Υποθέτουμε ότι το JSON έχει ένα κλειδί "kidsFactsDesk" που περιέχει τον πίνακα.
        STATE.factsArray = data.kidsFactsDesk || [];

      } catch (error) {
        console.error("Αποτυχία φόρτωσης δεδομένων (Desktop):", error);
        DesktopFlipManager.el.fact.innerText = "Δε βρέθηκαν πληροφορίες. Δοκίμασε ξανά αργότερα!";
        return; // Σταματάμε αν αποτύχει η λήψη
      }
      // ------------------------------------------------

      if (STATE.factsArray.length > 0) {
        STATE.shuffledFacts = Utils.shuffleArray(STATE.factsArray);
        STATE.currentIndex = 0;
        DesktopFlipManager.updateDOM(); // Αρχική φόρτωση χωρίς delay
      }

      DesktopFlipManager.setupEvents();
    },

    getNextFact: () => {
      if (STATE.shuffledFacts.length === 0) return "";
      
      const fact = STATE.shuffledFacts[STATE.currentIndex];
      STATE.currentIndex++;

      // Αν δείξαμε και το τελευταίο, ανακατεύουμε ξανά την αρχική πηγή
      if (STATE.currentIndex >= STATE.shuffledFacts.length) {
        STATE.shuffledFacts = Utils.shuffleArray(STATE.factsArray);
        STATE.currentIndex = 0;
      }
      return fact;
    },

    updateDOM: () => {
      const nextFact = DesktopFlipManager.getNextFact();
      if (nextFact) {
        DesktopFlipManager.el.fact.innerText = Utils.decodeHTML(nextFact);
      }
    },

    toggle: () => {
      const { flipInner } = DesktopFlipManager.el;
      const isCurrentlyFlipped = flipInner.classList.contains(CONFIG.flippedClass);
      const willBeFlipped = !isCurrentlyFlipped;

      window.requestAnimationFrame(() => {
        flipInner.classList.toggle(CONFIG.flippedClass, willBeFlipped);
        flipInner.setAttribute("aria-pressed", String(willBeFlipped));
      });

      // Αν η κάρτα ανοίγει με κλικ, αλλάζουμε το κείμενο στο τυφλό σημείο
      if (willBeFlipped) {
        setTimeout(DesktopFlipManager.updateDOM, CONFIG.flipMidpointMs);
      }
    },

    setupEvents: () => {
      const { flipInner, flipCard } = DesktopFlipManager.el;

      // ----------------------------------------
      // Mouse Leave (Για το CSS Hover effect)
      // ----------------------------------------
      flipCard.addEventListener("mouseleave", () => {
        // Αν η κάρτα κλειδώθηκε ανοιχτή με κλικ, αγνοούμε το mouseleave
        if (flipInner.classList.contains(CONFIG.flippedClass)) return;

        if (STATE.updateTimer) clearTimeout(STATE.updateTimer);

        // Αλλάζει το κείμενο στις 90 μοίρες καθώς κλείνει, για να είναι έτοιμο στο επόμενο hover!
        STATE.updateTimer = setTimeout(() => {
          if (!flipInner.classList.contains(CONFIG.flippedClass)) {
            DesktopFlipManager.updateDOM();
          }
        }, CONFIG.flipMidpointMs);
      });

      // ----------------------------------------
      // Click & Keyboard (Για πλήρη προσβασιμότητα)
      // ----------------------------------------
      flipInner.addEventListener("click", DesktopFlipManager.toggle);

      flipInner.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          DesktopFlipManager.toggle();
        } else if (e.key === "Escape") {
          window.requestAnimationFrame(() => {
            flipInner.classList.remove(CONFIG.flippedClass);
            flipInner.setAttribute("aria-pressed", "false");
          });
          // Ανανεώνει το κείμενο καθώς κλείνει
          setTimeout(DesktopFlipManager.updateDOM, CONFIG.flipMidpointMs);
        }
      });
    }
  };

  // ==========================================
  // 6. ΕΚΚΙΝΗΣΗ
  // ==========================================
  document.addEventListener("DOMContentLoaded", DesktopFlipManager.init);

})();
