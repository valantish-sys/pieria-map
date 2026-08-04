(() => {
  "use strict";

  // --- CONFIGURATION ---
  const CONFIG = Object.freeze({
    loopModes: ['Κλειστή', 'Όλη η λίστα', 'Ένα τραγούδι'],
    loopClasses: ['loop-btn', 'loop-btn active-loop-all', 'loop-btn active-loop-one'],
    icons: ['🔁', '🔁', '🔂'], // <--- Μπήκε το κόμμα!
    visualizerClass: 'is-playing'
  });

  const STATE = {
    loopModeIndex: 1
  };

  // --- JUKEBOX MANAGER ---
  const JukeboxManager = {
    // 1. Δημιουργούμε ένα άδειο αντικείμενο για το DOM
    dom: {},

    init: () => {
      // 2. Βρίσκουμε τα στοιχεία ΤΩΡΑ που έχει φορτώσει η σελίδα! (Απόλυτη ασφάλεια)
      JukeboxManager.dom = {
        player: document.getElementById('main-juke-player'),
        source: document.getElementById('juke-audio-source'),
        display: document.getElementById('juke-track-display'),
        textTarget: document.getElementById('juke-text-target'), // <-- ΠΡΟΣΘΕΣΕ ΑΥΤΗ ΤΗ ΓΡΑΜΜΗ
        visualizer: document.getElementById('juke-visualizer'),
        wrapper: document.getElementById('extra-tracks-wrapper'),
        loopBtn: document.getElementById('loop-btn'),
        moreBtn: document.getElementById('toggle-more-btn')
      };

      const els = JukeboxManager.dom;
      if (!els.player) return; // Αν λείπει το widget, σταματάμε ομαλά

      // Events
      els.player.addEventListener('ended', JukeboxManager.handleTrackEnd);
      els.player.addEventListener('play', () => { if (els.visualizer) els.visualizer.classList.add(CONFIG.visualizerClass); });
      els.player.addEventListener('pause', () => { if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass); });
      
      if (els.loopBtn) els.loopBtn.addEventListener('click', JukeboxManager.toggleLoop);

      if (els.moreBtn) {
        els.moreBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          els.wrapper.classList.toggle('open');
        });
      }

      document.addEventListener('click', JukeboxManager.handleGlobalClick);
    },

    playTrack: (button, url, name) => {
      const els = JukeboxManager.dom;
      
      // 1. Σταματάμε το τρέχον, φορτώνουμε το νέο
      els.player.pause();
      els.source.src = url;
      els.player.load();
      
      // 2. Ενημερώνουμε τον τίτλο (στο νέο textTarget span)
      if (els.textTarget) els.textTarget.innerHTML = name;

      // 3. ΕΝΕΡΓΟΠΟΙΗΣΗ VISUALIZER
      if (els.visualizer) {
        // Προσθέτουμε την κλάση CSS που το εμφανίζει και το κουνάει
        els.visualizer.classList.add(CONFIG.visualizerClass); 
      }
      
      // 4. Ξεκινάμε την αναπαραγωγή
      els.player.play().catch(err => {
         console.warn("Η αυτόματη αναπαραγωγή μπλοκαρίστηκε.");
         // Αν μπλοκαριστεί, αφαιρούμε τις μπάρες
         if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
      });
      
      // 5. Διαχείριση ενεργών κουμπιών
      document.querySelectorAll('.playlist-btn, .extra-track-btn').forEach(btn => btn.classList.remove('track-active'));
      button.classList.add('track-active');
    },

    toggleLoop: () => {
      STATE.loopModeIndex = (STATE.loopModeIndex + 1) % 3;
      const idx = STATE.loopModeIndex;
      const els = JukeboxManager.dom;
      
      if (els.loopBtn) {
        els.loopBtn.innerHTML = `${CONFIG.icons[idx]} Επανάληψη: ${CONFIG.loopModes[idx]}`;
        els.loopBtn.className = CONFIG.loopClasses[idx];
      }
    },

    handleTrackEnd: () => {
      const els = JukeboxManager.dom;
      
      if (STATE.loopModeIndex === 2) {
        els.player.currentTime = 0;
        els.player.play().catch(() => {});
      } else if (STATE.loopModeIndex === 1) {
        const allBtns = Array.from(document.querySelectorAll('.playlist-btn[data-url], .extra-track-btn[data-url]'));
        const activeBtn = document.querySelector('.track-active');
        
        if (!activeBtn || allBtns.length === 0) return;

        let nextIndex = (allBtns.indexOf(activeBtn) + 1) % allBtns.length;
        let attempts = 0;
        
        while (attempts < allBtns.length) {
          const nextBtn = allBtns[nextIndex];
          const nextUrl = nextBtn.dataset.url || "";
          
          if (nextUrl.includes('http')) {
            // Άμεση κλήση της συνάρτησης, χωρίς ψεύτικα .click() !
            JukeboxManager.playTrack(nextBtn, nextUrl, nextBtn.dataset.name);
            break;
          }
          nextIndex = (nextIndex + 1) % allBtns.length;
          attempts++;
        }
      }
    },

    handleGlobalClick: (e) => {
      const els = JukeboxManager.dom;
      
      const trackBtn = e.target.closest('[data-url]');
      if (trackBtn) {
        const url = trackBtn.dataset.url;
        const name = trackBtn.dataset.name;
        if (url && name) JukeboxManager.playTrack(trackBtn, url, name);
        return; 
      }

      if (els.wrapper && els.wrapper.classList.contains('open')) {
         if (!els.wrapper.contains(e.target) && (!els.moreBtn || !els.moreBtn.contains(e.target))) {
           els.wrapper.classList.remove('open');
         }
      }
    }
  };

  // Bulletproof Φόρτωση
  if (document.readyState === "loading") {
      document.addEventListener('DOMContentLoaded', JukeboxManager.init);
  } else {
      JukeboxManager.init();
  }

})();
