(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION & STATE (MOBILE)
  // ==========================================
 const CONFIG = Object.freeze({
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/historyFactsMobile6.json",
    defaultFact: "Κάθε μέρα είναι μια ευκαιρία να μελετήσουμε το παρελθόν και να χτίσουμε ένα καλύτερο μέλλον.",
    storagePrefix: "daily_mission_", // Κοινό πρόθεμα για να μοιράζονται την ίδια αποστολή
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
      // --- Λήψη του JSON (Fetch API) ΜΙΑ φορά και για τα 2 ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα κατά τη λήψη των δεδομένων.");
        DATA = await response.json(); 
      } catch (error) {
        console.error("Το API απέτυχε. Φόρτωση Fallback:", error);
        DATA = { historyFactsMobile: {}, missions: {}, keywordsMap: {} };
      }
      // ------------------------------------------------

      const dateKey = Utils.getDateKey();
      
      // Ασφαλής ανάγνωση του σημερινού γεγονότος (από το JSON του κινητού)
      const currentFact = (DATA && DATA.historyFactsMobile && DATA.historyFactsMobile[dateKey])
                          ? DATA.historyFactsMobile[dateKey]
                          : CONFIG.defaultFact;

      const storageKey = `${CONFIG.storagePrefix}${dateKey}`;

      // 1. Καθάρισμα παλιών δεδομένων
      Utils.cleanOldStorage(storageKey);

      // 2. Δημιουργία ή ανάγνωση της αποστολής (κοινή για PC και Κινητό)
      let savedMission = localStorage.getItem(storageKey);
      if (!savedMission) {
        savedMission = Utils.generateMission(currentFact);
        try {
          localStorage.setItem(storageKey, savedMission);
        } catch (e) {
          console.warn("Το localStorage δεν είναι διαθέσιμο.");
        }
      }

      // 3. Εφαρμογή των δεδομένων δυναμικά (mobile και pc)
      const platforms = ['mobile', 'pc'];
      platforms.forEach(platform => {
        const factElement = document.getElementById(`history-fact-${platform}`);
        const missionElement = document.getElementById(`mission-text-${platform}`);
        
        // Αν βρει το κουτάκι του Fact (του PC ή του Mobile), το γεμίζει
        if (factElement) {
          factElement.style.opacity = '0';
          factElement.innerHTML = currentFact;
          
          setTimeout(() => {
            window.requestAnimationFrame(() => {
              factElement.style.transition = "opacity 0.5s ease";
              factElement.style.opacity = '1';
            });
          }, CONFIG.animDelay);
        }

        // Αν βρει το κουτάκι του Mission (του PC ή του Mobile), το γεμίζει
        if (missionElement) {
          missionElement.innerHTML = savedMission;
        }
      });
    },

  // Λειτουργία Toggling δυναμική για PC & Κινητό
    toggleContainer: (event, platform) => {
      if (event) event.stopPropagation();
      
      // --- ΠΡΟΣΘΗΚΗ ΔΟΝΗΣΗΣ ΜΟΝΟ ΑΝ ΕΙΝΑΙ ΑΠΟ ΤΟ ΚΙΝΗΤΟ ---
      if (platform === 'mobile' && navigator.vibrate) navigator.vibrate(15); 
      
      const container = document.getElementById(`mission-container-${platform}`);
      if (container) container.classList.toggle("open");
    },

   // Διαχείριση κλεισίματος όταν γίνεται click έξω (για όλα τα widgets)
    setupOutsideClick: () => {
      document.addEventListener("click", (event) => {
        const platforms = ['mobile', 'pc'];
        platforms.forEach(platform => {
          const wrapper = document.getElementById(`history-wrapper-container-${platform}`);
          const container = document.getElementById(`mission-container-${platform}`);
          
          if (wrapper && !wrapper.contains(event.target)) {
            if (container && container.classList.contains("open")) {
              container.classList.remove("open");
            }
          }
        });
      }, { passive: true });
    }
      };

 // ==========================================
  // 4. ΕΚΚΙΝΗΣΗ ΛΕΙΤΟΥΡΓΙΩΝ
  // ==========================================
  // Εξάγουμε και τα δύο toggle functions παγκοσμίως (window) ώστε να τα βλέπει η HTML του site σου
  window.toggleMissionMobile = (event) => WidgetManager.toggleContainer(event, 'mobile');
  window.toggleMissionPC = (event) => WidgetManager.toggleContainer(event, 'pc');

  document.addEventListener("DOMContentLoaded", () => {
    // Χρησιμοποιούμε καθυστέρηση για να μην μπλοκάρουμε το κύριο νήμα (main thread) στο κινητό
    setTimeout(() => {
      WidgetManager.init();
      WidgetManager.setupOutsideClick();
    }, CONFIG.initDelay);
  });

})();
