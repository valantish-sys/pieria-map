(() => {
  "use strict";

  const CONFIG = Object.freeze({
    // Το JSON σου διαβάζεται κανονικά από εδώ
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

  const FlipManager = {
    init: async () => {
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα δικτύου.");
        const data = await response.json();
        
        // Αναγνωρίζει ακριβώς τη δομή του JSON σου
        STATE.factsArray = data.kidsFactsMob || data.kidsFactsDesk || data || [];
      } catch (error) {
        console.error("Σφάλμα φόρτωσης:", error);
      }

      ["-mob", "-desk"].forEach(suffix => FlipManager.buildWidget(suffix));
    },

    buildWidget: (suffix) => {
      // 1. Βρίσκουμε το σωστό Wrapper (αποτρέπει το μπέρδεμα στο Blogger)
      const wrapperId = suffix === "-desk" ? "desktop-flip-wrapper" : "mobile-flip-wrapper";
      const wrapper = document.getElementById(wrapperId);
      
      if (!wrapper) return;

      // 2. Ψάχνουμε τα στοιχεία ΜΕΣΑ στον wrapper για να είμαστε 100% σίγουροι
      const flipInner = wrapper.querySelector('.flip-inner');
      const factEl = wrapper.querySelector('[id^="fact-text"]');
      const flipCard = wrapper.querySelector('.flip-container');

      if (!factEl || !flipInner) return;

      if (STATE.factsArray.length === 0) {
        factEl.innerHTML = "Δε βρέθηκαν πληροφορίες.";
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
          // Η ΛΥΣΗ: Το innerHTML χρησιμοποιείται ΠΛΕΟΝ ΠΑΝΤΟΥ (Και PC και Mobile)
          factEl.innerHTML = nextFact;
        }
      };

      const toggle = () => {
        const isCurrentlyFlipped = flipInner.classList.contains(CONFIG.flippedClass);
        const willBeFlipped = !isCurrentlyFlipped;

        window.requestAnimationFrame(() => {
          flipInner.classList.toggle(CONFIG.flippedClass, willBeFlipped);
          flipInner.setAttribute("aria-pressed", String(willBeFlipped));
        });

        if (willBeFlipped) {
          setTimeout(updateDOM, CONFIG.flipMidpointMs);
        }
      };

      // Αρχικό φόρτωμα δεδομένων
      updateDOM();

      // Events
      flipInner.addEventListener("click", toggle);

      flipInner.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        } else if (e.key === "Escape") {
          window.requestAnimationFrame(() => {
            flipInner.classList.remove(CONFIG.flippedClass);
            flipInner.setAttribute("aria-pressed", "false");
          });
          if (suffix === "-desk") {
            setTimeout(updateDOM, CONFIG.flipMidpointMs);
          }
        }
      });

      // Hover Event αποκλειστικά για το Desktop
      if (suffix === "-desk" && flipCard) {
        flipCard.addEventListener("mouseleave", () => {
          if (flipInner.classList.contains(CONFIG.flippedClass)) return;
          if (localState.updateTimer) clearTimeout(localState.updateTimer);

          localState.updateTimer = setTimeout(() => {
            if (!flipInner.classList.contains(CONFIG.flippedClass)) {
              updateDOM();
            }
          }, CONFIG.flipMidpointMs);
        });
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FlipManager.init);
  } else {
    FlipManager.init();
  }

})();
