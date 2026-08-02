(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = Object.freeze({
    // ΕΔΩ ΒΑΖΕΙΣ ΤΟ ΙΔΙΟ LINK ΤΟΥ JSON ΠΟΥ ΕΒΑΛΕΣ ΚΑΙ ΣΤΟ MOBILE
    jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/grifakivasi.json' 
  });

  // Στοχεύει τα Desktop IDs (χωρίς το "-mobile")
  const DOM = {
    box: document.getElementById("daily-riddle-box"),
    question: document.getElementById("daily-riddle-question"),
    answer: document.getElementById("daily-riddle-answer")
  };

  // ==========================================
  // 2. DATA ENGINE (Λήψη JSON)
  // ==========================================
  const DataEngine = {
    riddlesArray: [],
    fetchRiddles: async () => {
      try {
        const response = await fetch(CONFIG.jsonUrl);
        const data = await response.json();
        // Ψάχνει για το κλειδί "riddlesDb" που έβαλες στο JSON σου
        DataEngine.riddlesArray = data.riddlesDb || [];
      } catch (e) {
        console.warn("Το JSON με τους γρίφους (Desktop) δεν φόρτωσε.");
        // Σε περίπτωση που κοπεί το ίντερνετ, ας δείχνει έστω έναν γρίφο!
        DataEngine.riddlesArray = [
          { q: "Έχει δόντια, αλλά δε δαγκώνει. Τι είναι;", a: "Η χτένα!" }
        ];
      }
    }
  };

  // ==========================================
  // 3. WIDGET MANAGER
  // ==========================================
  const RiddleManager = {
    init: async () => { // <--- Έγινε async
      if (!DOM.box || !DOM.question || !DOM.answer) return;

      // --- ΚΑΤΕΒΑΖΕΙ ΤΟΥΣ ΓΡΙΦΟΥΣ ΠΡΙΝ ΞΕΚΙΝΗΣΕΙ ---
      await DataEngine.fetchRiddles();

      if (DataEngine.riddlesArray.length === 0) return;

      RiddleManager.loadDaily();
      RiddleManager.setupEvents();
    },

    loadDaily: () => {
      const today = new Date();
      // Υπολογισμός ημερών για να δείχνει τον ίδιο γρίφο όλη μέρα
      const localMs = today.getTime() - (today.getTimezoneOffset() * 60000);
      const daysPassed = Math.floor(localMs / 86400000);
      
      // Επιλέγει γρίφο από το Array που κατέβασε
      const todaysRiddle = DataEngine.riddlesArray[daysPassed % DataEngine.riddlesArray.length];
      
      DOM.question.textContent = todaysRiddle.q;
      DOM.answer.textContent = todaysRiddle.a;
    },

    toggleBlur: () => {
      const isClear = DOM.box.classList.toggle("is-clear");
      DOM.box.setAttribute("aria-expanded", String(isClear));
    },

    setupEvents: () => {
      DOM.box.addEventListener("click", RiddleManager.toggleBlur);
      
      DOM.box.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          RiddleManager.toggleBlur();
        } else if (e.key === "Escape") {
          DOM.box.classList.remove("is-clear");
          DOM.box.setAttribute("aria-expanded", "false");
        }
      });
    }
  };

  // ==========================================
  // 4. ΕΚΚΙΝΗΣΗ
  // ==========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", RiddleManager.init);
  } else {
    RiddleManager.init();
  }

})();
