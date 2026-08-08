(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION & STATE (PC)
  // ==========================================
  const CONFIG = Object.freeze({
    // Το νέο σου "API" από το GitHub
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/historyFactsPc3.json",
    defaultFact: "Κάθε μέρα είναι μια ευκαιρία να μελετήσουμε το παρελθόν και να χτίσουμε ένα καλύτερο μέλλον.",
    storagePrefix: "daily_mission_pc_",
    animDelay: 50,
    initDelay: 200
  });

  // Εδώ θα αποθηκευτεί το JSON μόλις κατέβει
  let DATA = null; 

  // ==========================================
  // 2. UTILS & HELPERS
  // ==========================================
  const Utils = {
    generateMission: (factText) => {
      const text = factText.toLowerCase();
      let category = 'default';

      // Ελέγχουμε με ασφάλεια αν υπάρχει το keywordsMap (σε περίπτωση σφάλματος δικτύου)
      if (DATA && DATA.keywordsMap) {
        for (const [key, keywords] of Object.entries(DATA.keywordsMap)) {
          if (keywords.some(kw => text.includes(kw))) {
            category = key;
            break;
          }
        }
      }
      
      const missionsList = (DATA && DATA.dynamicMissionsPC && DATA.dynamicMissionsPC[category]) 
                           ? DATA.dynamicMissionsPC[category] 
                           : (DATA && DATA.dynamicMissionsPC && DATA.dynamicMissionsPC['default']) 
                              ? DATA.dynamicMissionsPC['default'] 
                              : ["Μοιράσου τη γνώση! Πες το σημερινό ιστορικό γεγονός σε έναν φίλο."]; // Τελικό Fallback

      return missionsList[Math.floor(Math.random() * missionsList.length)];
    },

    getDateKey: () => {
      const today = new Date();
      return `${today.getMonth()}-${today.getDate()}`;
    },

    cleanOldStorage: (currentKey) => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CONFIG.storagePrefix) && key !== currentKey) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // ==========================================
  // 3. WIDGET MANAGER (PC VERSION)
  // ==========================================
  const WidgetManagerPC = {
    // Η συνάρτηση έγινε async για να περιμένει το αρχείο
    init: async () => {
      const factElement = document.getElementById("history-fact-pc");
      if (!factElement) return;

      // --- ΝΕΟΣ ΚΩΔΙΚΑΣ: Λήψη του JSON (Fetch API) ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα κατά τη λήψη των δεδομένων.");
        DATA = await response.json(); // Μετατροπή του αρχείου σε JavaScript Object
      } catch (error) {
        console.error("Το API απέτυχε. Φόρτωση Fallback:", error);
        // Προστασία αν δεν έχει ίντερνετ ο χρήστης
        DATA = {
          historyFactsPc: {},
          dynamicMissionsPC: {},
          keywordsMap: {}
        };
      }
      // ------------------------------------------------

      const dateKey = Utils.getDateKey();
      const currentFact = DATA.historyFactsPc[dateKey] || CONFIG.defaultFact;
      const storageKey = `${CONFIG.storagePrefix}${dateKey}`;

      // 1. Καθάρισμα παλιών δεδομένων
      Utils.cleanOldStorage(storageKey);

      // 2. Φόρτωση ή δημιουργία της σημερινής αποστολής
      const missionTextElement = document.getElementById("mission-text-pc");
      if (missionTextElement) {
        let savedMission = localStorage.getItem(storageKey);
        if (!savedMission) {
          savedMission = Utils.generateMission(currentFact);
          // Δοκιμάζουμε να σώσουμε στο storage (μπορεί να είναι κλειδωμένο π.χ. Safari Private)
          try {
            localStorage.setItem(storageKey, savedMission);
          } catch (e) {
            console.warn("Το localStorage δεν είναι διαθέσιμο.");
          }
        }
        missionTextElement.innerHTML = savedMission;
      }

      // 3. Εμφάνιση του Ιστορικού Γεγονότος με Fade-In
      factElement.style.opacity = '0';
      factElement.innerHTML = currentFact;

      setTimeout(() => {
        window.requestAnimationFrame(() => {
          factElement.style.transition = "opacity 0.5s ease";
          factElement.style.opacity = '1';
        });
      }, CONFIG.animDelay);
    },

    toggleContainer: (event) => {
      if (event) event.stopPropagation();
      const container = document.getElementById("mission-container-pc");
      if (container) container.classList.toggle("open");
    },

    setupOutsideClick: () => {
      document.addEventListener("click", (event) => {
        const wrapper = document.getElementById("history-wrapper-container-pc");
        const container = document.getElementById("mission-container-pc");
        
        if (wrapper && !wrapper.contains(event.target)) {
          if (container && container.classList.contains("open")) {
            container.classList.remove("open");
          }
        }
      }, { passive: true });
    }
  };

  // ==========================================
  // 4. ΕΚΚΙΝΗΣΗ ΛΕΙΤΟΥΡΓΙΩΝ
  // ==========================================
  window.toggleMissionPC = WidgetManagerPC.toggleContainer;

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      WidgetManagerPC.init();
      WidgetManagerPC.setupOutsideClick();
    }, CONFIG.initDelay);
  });

})();
