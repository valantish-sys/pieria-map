(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = Object.freeze({
    // ΕΔΩ ΒΑΖΕΙΣ ΤΟ LINK ΤΟΥ JSON ΑΡΧΕΙΟΥ ΣΟΥ
    jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/grifakivasi.json' 
  });

  // Λίστα με τα πιθανά IDs (και για Mobile και για PC)
  const WIDGETS_CONFIG = [
    { boxId: "daily-riddle-box-mobile", qId: "daily-riddle-question-mobile", aId: "daily-riddle-answer-mobile" },
    { boxId: "daily-riddle-box", qId: "daily-riddle-question", aId: "daily-riddle-answer" }
  ];

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
        console.warn("Το JSON με τους γρίφους δεν φόρτωσε.");
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
    init: async () => { 
      // Ελέγχει ποια widgets υπάρχουν ενεργά στο HTML (PC, Mobile ή και τα δύο)
      const activeWidgets = WIDGETS_CONFIG.map(conf => ({
        box: document.getElementById(conf.boxId),
        question: document.getElementById(conf.qId),
        answer: document.getElementById(conf.aId)
      })).filter(w => w.box && w.question && w.answer);

      // Αν δεν βρει κανένα από τα δύο, σταματάει
      if (activeWidgets.length === 0) return;

      // --- ΚΑΤΕΒΑΖΕΙ ΤΟΥΣ ΓΡΙΦΟΥΣ ΜΙΑ ΦΟΡΑ ---
      await DataEngine.fetchRiddles();
      if (DataEngine.riddlesArray.length === 0) return;

      // Εφαρμόζει τη λογική σε ΟΣΑ widgets βρήκε
      activeWidgets.forEach(widget => {
        RiddleManager.loadDaily(widget.question, widget.answer);
        RiddleManager.setupEvents(widget.box);
      });
    },

   loadDaily: (questionElement, answerElement) => {
      const today = new Date();
      // Υπολογισμός ημερών για να δείχνει τον ίδιο γρίφο όλη μέρα
      const localMs = today.getTime() - (today.getTimezoneOffset() * 60000);
      const daysPassed = Math.floor(localMs / 86400000);
      
      // Επιλέγει γρίφο από το Array που κατέβασε
      const todaysRiddle = DataEngine.riddlesArray[daysPassed % DataEngine.riddlesArray.length];
      
      // Βάζει το κείμενο στο συγκεκριμένο widget
      questionElement.textContent = todaysRiddle.q;
      answerElement.textContent = todaysRiddle.a;
    },

    // Παίρνει ως παράμετρο το ΣΥΓΚΕΚΡΙΜΕΝΟ box που δέχεται κλικ/keydown
    toggleBlur: (boxElement) => {
      const isClear = boxElement.classList.toggle("is-clear");
      boxElement.setAttribute("aria-expanded", String(isClear));
    },

    setupEvents: (boxElement) => {
      // Τα events μπαίνουν ανεξάρτητα στο κάθε box
      boxElement.addEventListener("click", () => RiddleManager.toggleBlur(boxElement));
      
      boxElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          RiddleManager.toggleBlur(boxElement);
        } else if (e.key === "Escape") {
          boxElement.classList.remove("is-clear");
          boxElement.setAttribute("aria-expanded", "false");
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
