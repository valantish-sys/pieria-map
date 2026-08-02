(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION & STATE (MOBILE)
  // ==========================================
  const CONFIG = Object.freeze({
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/historyFactsMobile.json",
    defaultFact: "Κάθε μέρα είναι μια ευκαιρία να μελετήσουμε το παρελθόν και να χτίσουμε ένα καλύτερο μέλλον.",
    storagePrefix: "daily_mission_mobile_",
    animDelay: 50,
    initDelay: 200
  });

  // Κενή μεταβλητή που θα γεμίσει δυναμικά από το API
  let DATA = null;

  // ==========================================
  // 2. UTILS & HELPERS
  // ==========================================
  const Utils = {
    // Κομψή αναζήτηση της κατάλληλης αποστολής με ασφάλεια (Fail-safe)
    generateMission: (factText) => {
      const text = factText.toLowerCase();
      let category = 'default';

      // Σαρώνει τις κατηγορίες μόνο αν τα δεδομένα έχουν φορτώσει σωστά
      if (DATA && DATA.keywordsMap) {
        for (const [key, keywords] of Object.entries(DATA.keywordsMap)) {
          if (keywords.some(kw => text.includes(kw))) {
            category = key;
            break;
          }
        }
      }
      
      // Ασφαλής ανάγνωση του Array των αποστολών
      const missionsList = (DATA && DATA.missions && DATA.missions[category])
                           ? DATA.missions[category]
                           : (DATA && DATA.missions && DATA.missions['default'])
                              ? DATA.missions['default']
                              : ["Μοιράσου τη γνώση! Πες το σημερινό ιστορικό γεγονός σε έναν φίλο."]; // Τελικό Fallback

      return missionsList[Math.floor(Math.random() * missionsList.length)];
    },

    getDateKey: () => {
      const today = new Date();
      return `${today.getMonth()}-${today.getDate()}`;
    },

    // Καθαρίζει τον browser του κινητού από παλιές αποστολές για εξοικονόμηση χώρου
    cleanOldStorage: (currentKey) => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CONFIG.storagePrefix) && key !== currentKey) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // ==========================================
  // 3. WIDGET MANAGER
  // ==========================================
  const WidgetManager = {
    init: async () => {
      const factElement = document.getElementById("history-fact-mobile");
      if (!factElement) return;

      // --- ΝΕΟΣ ΚΩΔΙΚΑΣ: Λήψη του JSON (Fetch API) ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα κατά τη λήψη των δεδομένων.");
        DATA = await response.json(); 
      } catch (error) {
        console.error("Το API (Mobile) απέτυχε. Φόρτωση Fallback:", error);
        // Προστασία αν δεν έχει ίντερνετ ο χρήστης στο κινητό
        DATA = {
          historyFactsMobile: {},
          missions: {},
          keywordsMap: {}
        };
      }
      // ------------------------------------------------

      const dateKey = Utils.getDateKey();
      
      // Ασφαλής ανάγνωση του σημερινού γεγονότος
      const currentFact = (DATA && DATA.historyFactsMobile && DATA.historyFactsMobile[dateKey])
                          ? DATA.historyFactsMobile[dateKey]
                          : CONFIG.defaultFact;

      const storageKey = `${CONFIG.storagePrefix}${dateKey}`;

      // 1. Καθάρισμα παλιών δεδομένων
      Utils.cleanOldStorage(storageKey);

      // Κρύβουμε το στοιχείο αρχικά για το fade in
      factElement.style.opacity = '0';
      factElement.innerHTML = currentFact;

      const missionElement = document.getElementById("mission-text-mobile");
      if (missionElement) {
        let savedMission = localStorage.getItem(storageKey);

        if (!savedMission) {
          savedMission = Utils.generateMission(currentFact);
          // Ασφαλής αποθήκευση (για περιπτώσεις Safari Private Mode στο iOS)
          try {
            localStorage.setItem(storageKey, savedMission);
          } catch (e) {
            console.warn("Το localStorage δεν είναι διαθέσιμο στο κινητό.");
          }
        }
        missionElement.innerHTML = savedMission;
      }

      // Ομαλό Fade-in χωρίς lag
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          factElement.style.transition = "opacity 0.5s ease";
          factElement.style.opacity = '1';
        });
      }, CONFIG.animDelay);
    },

    // Λειτουργία Toggling για το κινητό (προσβάσιμη & με stopPropagation)
    toggleContainer: (event) => {
      if (event) event.stopPropagation();
      const container = document.getElementById("mission-container-mobile");
      if (container) container.classList.toggle("open");
    },

    // Διαχείριση κλεισίματος όταν γίνεται click έξω
    setupOutsideClick: () => {
      document.addEventListener("click", (event) => {
        const wrapper = document.getElementById("history-wrapper-container-mobile");
        const container = document.getElementById("mission-container-mobile");
        
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
  // Εξάγουμε το toggle function παγκοσμίως (window)
  window.toggleMissionMobile = WidgetManager.toggleContainer;

  document.addEventListener("DOMContentLoaded", () => {
    // Χρησιμοποιούμε καθυστέρηση για να μην μπλοκάρουμε το κύριο νήμα (main thread) στο κινητό
    setTimeout(() => {
      WidgetManager.init();
      WidgetManager.setupOutsideClick();
    }, CONFIG.initDelay);
  });

})();
