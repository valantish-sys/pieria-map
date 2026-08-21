(() => {
  "use strict";

  // ==========================================
  // 1. ΔΥΝΑΜΙΚΟΣ ΕΛΕΓΧΟΣ ΑΡΧΙΚΗΣ ΣΕΛΙΔΑΣ
  // ==========================================
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
  // 2. CONFIGURATION & STATE
  // ==========================================
  const CONFIG = Object.freeze({
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/kidsFactsMob.json", 
    flippedClass: "is-flipped",
    flipMidpointMs: 350 
  });

  const STATE = { factsArray: [] };

  const Utils = {
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
  // 3. MANAGER
  // ==========================================
  const FlipManager = {
    init: async () => {
      // --- Λήψη του JSON ΜΙΑ ΦΟΡΑ ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (response.ok) {
          const data = await response.json();
          STATE.factsArray = data.kidsFactsMob || data.kidsFactsDesk || data || [];
        }
      } catch (error) {
        console.error("Σφάλμα φόρτωσης JSON:", error);
      }

      // --- Η ΛΥΣΗ ΓΙΑ ΤΟ BLOGGER ---
      // Βρίσκουμε ΟΛΑ τα περιτυλίγματα (wrappers) που υπάρχουν στη σελίδα
      const allWrappers = document.querySelectorAll('#mobile-flip-wrapper, #desktop-flip-wrapper');
      
      // Ενεργοποιούμε το κάθε ένα ξεχωριστά!
      allWrappers.forEach(wrapper => {
        FlipManager.buildWidget(wrapper);
      });
    },

    buildWidget: (wrapper) => {
      // Ψάχνουμε τα στοιχεία ΜΕΣΑ στο τρέχον κουτί, ώστε να μην μπερδεύονται μεταξύ τους!
      const el = {
        fact: wrapper.querySelector('[id^="fact-text"]'), // Πιάνει αυτόματα και το mob και το desk
        flipInner: wrapper.querySelector('.flip-inner'),
        flipCard: wrapper.querySelector('.flip-container')
      };

      if (!el.fact || !el.flipInner) return;

      if (STATE.factsArray.length === 0) {
        el.fact.innerHTML = "Δε βρέθηκαν πληροφορίες.";
        return;
      }

      const localState = {
        shuffledFacts: Utils.shuffleArray(STATE.factsArray),
        currentIndex: 0,
        updateTimer: null
      };

      const getNextFact = () => {
        if (localState.shuffledFacts.length === 0) return "";
        const fact = localState.shuffledFacts[localState.currentIndex];
        localState.currentIndex++;
        
        if (localState.currentIndex >= localState.shuffledFacts.length) {
          localState.shuffledFacts = Utils.shuffleArray(STATE.factsArray);
          localState.currentIndex = 0;
        }
        return fact;
      };

      const updateDOM = () => {
        const nextFact = getNextFact();
        if (nextFact) {
          el.fact.innerHTML = nextFact;
        }
      };

      const toggle = () => {
        const isCurrentlyFlipped = el.flipInner.classList.contains(CONFIG.flippedClass);
        const willBeFlipped = !isCurrentlyFlipped;

        window.requestAnimationFrame(() => {
          el.flipInner.classList.toggle(CONFIG.flippedClass, willBeFlipped);
          el.flipInner.setAttribute("aria-pressed", String(willBeFlipped));
        });

        if (willBeFlipped) {
          setTimeout(updateDOM, CONFIG.flipMidpointMs);
        }
      };

      // --- ΑΡΧΙΚΗ ΕΝΗΜΕΡΩΣΗ (Σβήνει το "Φόρτωση...") ---
      updateDOM();

      // --- EVENTS ---
      el.flipInner.addEventListener("click", toggle);
      
      el.flipInner.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        } else if (e.key === "Escape") {
          window.requestAnimationFrame(() => {
            el.flipInner.classList.remove(CONFIG.flippedClass);
            el.flipInner.setAttribute("aria-pressed", "false");
          });
          if (wrapper.id === 'desktop-flip-wrapper') {
            setTimeout(updateDOM, CONFIG.flipMidpointMs);
          }
        }
      });

      // --- HOVER (Μόνο για τα Desktop Wrappers) ---
      if (wrapper.id === 'desktop-flip-wrapper' && el.flipCard) {
        el.flipCard.addEventListener("mouseleave", () => {
          if (el.flipInner.classList.contains(CONFIG.flippedClass)) return;
          if (localState.updateTimer) clearTimeout(localState.updateTimer);

          localState.updateTimer = setTimeout(() => {
            if (!el.flipInner.classList.contains(CONFIG.flippedClass)) {
              updateDOM();
            }
          }, CONFIG.flipMidpointMs);
        });
      }
    }
  };

  // ==========================================
  // ΕΚΚΙΝΗΣΗ
  // ==========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FlipManager.init);
  } else {
    FlipManager.init();
  }

})();
