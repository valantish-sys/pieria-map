(() => {
  "use strict";

  // --- CONFIGURATION ---
  const CONFIG = Object.freeze({
    loopModes: ['Κλειστή', 'Όλη η λίστα', 'Ένα τραγούδι'],
    loopClasses: ['loop-btn', 'loop-btn active-loop-all', 'loop-btn active-loop-one'],
    icons: ['🔁', '🔁', '🔂']
  });

  const STATE = {
    loopModeIndex: 1 // Ξεκινάει με 1 (Όλη η λίστα)
  };

  // --- JUKEBOX MANAGER ---
  const JukeboxManager = {
    player: document.getElementById('main-juke-player'),
    source: document.getElementById('juke-audio-source'),
    display: document.getElementById('juke-track-display'),
    wrapper: document.getElementById('extra-tracks-wrapper'),
    loopBtn: document.getElementById('loop-btn'),
    moreBtn: document.getElementById('toggle-more-btn'),

    init: () => {
      const JM = JukeboxManager;
      if (!JM.player) return; // Αν λείπει το HTML, σταματάει ήσυχα

      // Event για όταν τελειώνει το τραγούδι
      JM.player.addEventListener('ended', JM.handleTrackEnd);
      
      // Κλικ στο κουμπί της επανάληψης
      if (JM.loopBtn) {
        JM.loopBtn.addEventListener('click', JM.toggleLoop);
      }

      // Κλικ στο κουμπί "Περισσότερα"
      if (JM.moreBtn) {
        JM.moreBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Αποτρέπει το κλείσιμο του μενού αμέσως
          JM.wrapper.classList.toggle('open');
        });
      }

      // Event Delegation: Ένας "έξυπνος" ακροατής για όλα τα κλικ
      document.addEventListener('click', JM.handleGlobalClick);
    },

    playTrack: (button, url, name) => {
      const JM = JukeboxManager;
      
      JM.player.pause();
      JM.source.src = url;
      JM.player.load();
      
      JM.player.play().catch(err => {
         console.warn("Η αυτόματη αναπαραγωγή μπλοκαρίστηκε από τον browser.");
      });
      
      JM.display.innerText = name;
      
      // Καθαρίζουμε το active class από όλα και το βάζουμε σε αυτό που πατήθηκε
      document.querySelectorAll('.playlist-btn, .extra-track-btn').forEach(btn => btn.classList.remove('track-active'));
      button.classList.add('track-active');
    },

    toggleLoop: () => {
      STATE.loopModeIndex = (STATE.loopModeIndex + 1) % 3;
      const idx = STATE.loopModeIndex;
      
      JukeboxManager.loopBtn.innerText = `${CONFIG.icons[idx]} Επανάληψη: ${CONFIG.loopModes[idx]}`;
      JukeboxManager.loopBtn.className = CONFIG.loopClasses[idx];
    },

    handleTrackEnd: () => {
      const JM = JukeboxManager;
      
      if (STATE.loopModeIndex === 2) {
        // Επανάληψη ίδιου τραγουδιού
        JM.player.currentTime = 0;
        JM.player.play();
      } else if (STATE.loopModeIndex === 1) {
        // Επανάληψη όλης της λίστας - Ψάχνει μόνο όσα έχουν data-url
        const allBtns = Array.from(document.querySelectorAll('.playlist-btn[data-url], .extra-track-btn[data-url]'));
        const activeBtn = document.querySelector('.track-active');
        
        if (!activeBtn || allBtns.length === 0) return;

        let nextIndex = (allBtns.indexOf(activeBtn) + 1) % allBtns.length;
        
        // Έλεγχος για το αν το επόμενο κουμπί έχει αληθινό link (π.χ. περιέχει 'http')
        let attempts = 0;
        while (attempts < allBtns.length) {
          const nextUrl = allBtns[nextIndex].dataset.url || "";
          if (nextUrl.includes('http')) {
            allBtns[nextIndex].click(); // Αναπαραγωγή επόμενου
            break;
          }
          nextIndex = (nextIndex + 1) % allBtns.length;
          attempts++;
        }
      }
    },

    handleGlobalClick: (e) => {
      const JM = JukeboxManager;
      
      // 1. Έλεγχος αν πατήθηκε κάποιο τραγούδι
      const trackBtn = e.target.closest('[data-url]');
      if (trackBtn) {
        const url = trackBtn.dataset.url;
        const name = trackBtn.dataset.name;
        if (url && name) {
          JM.playTrack(trackBtn, url, name);
        }
        return; // Βγαίνουμε, δεν χρειάζεται να ελέγξουμε κάτι άλλο
      }

      // 2. Λογική για το κλείσιμο του "Περισσότερα" όταν πατάμε αλλού
      if (JM.wrapper && JM.wrapper.classList.contains('open')) {
         if (!JM.wrapper.contains(e.target) && (!JM.moreBtn || !JM.moreBtn.contains(e.target))) {
           JM.wrapper.classList.remove('open');
         }
      }
    }
  };

  // Εκκίνηση μόλις φορτώσει το HTML
  document.addEventListener('DOMContentLoaded', JukeboxManager.init);

})();
