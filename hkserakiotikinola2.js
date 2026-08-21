(() => {
  "use strict";

  // ==========================================
  // 1. ΔΥΝΑΜΙΚΟΣ ΕΛΕΓΧΟΣ ΑΡΧΙΚΗΣ ΣΕΛΙΔΑΣ (FOUC)
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

  const STATE = {
    factsArray: [] // Εδώ αποθηκεύονται τα δεδομένα
  };

  // ==========================================
  // 3. UTILS (Εργαλεία)
  // ==========================================
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
  // 4. MANAGER (Έξυπνη Λογική & DOM)
  // ==========================================
  const FlipManager = {
    init: async () => {
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα δικτύου.");
        const data = await response.json();

        STATE.factsArray = data.kidsFactsMob || data.kidsFactsDesk || data || [];
      } catch (error) {
        console.error("Αποτυχία φόρτωσης δεδομένων:", error);
      }

      // Λούπα κατασκευής για PC και Mobile
      ["-mob", "-desk"].forEach(suffix => FlipManager.buildWidget(suffix));
    },

    buildWidget: (suffix) => {
      const el = {
        fact: document.getElementById(`fact-text${suffix}`),
        flipInner: document.getElementById(`flip-inner${suffix}`),
        // Ασφαλής έλεγχος ώστε να μην ψάχνει id="null" στα κινητά
        flipCard: suffix === "-desk" ? document.getElementById(`my-flip-card${suffix}`) : null
      };

      if (!el.fact || !el.flipInner) return;

      if (STATE.factsArray.length === 0) {
        el.fact.innerHTML = "Δε βρέθηκαν πληροφορίες. Δοκίμασε ξανά αργότερα!";
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
          // Πλέον χρησιμοποιούμε innerHTML σε PC και Mobile για να μην χάνονται tags (πχ. <br>)
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

      updateDOM();

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
          if (suffix === "-desk") {
            setTimeout(updateDOM, CONFIG.flipMidpointMs);
          }
        }
      });

      if (suffix === "-desk" && el.flipCard) {
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
  // 5. ΕΚΚΙΝΗΣΗ
  // ==========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FlipManager.init);
  } else {
    FlipManager.init();
  }

})();
