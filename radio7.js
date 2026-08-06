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
    loopModeIndex: 1,
    fadeInterval: null,
    targetVolume: 1
  };

  // --- JUKEBOX MANAGER ---
  const JukeboxManager = {
    // 1. Δημιουργούμε ένα άδειο αντικείμενο για το DOM
    dom: {},
// --- 1. ΟΜΑΛΗ ΜΕΤΑΒΑΣΗ (FADE IN/OUT) ---
    fadeAudio: (targetVolume, duration) => {
      return new Promise((resolve) => {
        const player = JukeboxManager.dom.player;
        if (!player) return resolve();
        
        clearInterval(STATE.fadeInterval);
        
        // Προστασία (Fallback) για παλιά iOS που μπλοκάρουν την αλλαγή έντασης μέσω JS
        try { player.volume = player.volume; } catch(e) { return resolve(); }
        
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = (targetVolume - player.volume) / steps;
        let currentStep = 0;

        STATE.fadeInterval = setInterval(() => {
          currentStep++;
          let newVol = player.volume + volumeStep;
          if (newVol > 1) newVol = 1;
          if (newVol < 0) newVol = 0;
          
          player.volume = newVol;

          if (currentStep >= steps || (volumeStep > 0 && newVol >= targetVolume) || (volumeStep < 0 && newVol <= targetVolume)) {
            clearInterval(STATE.fadeInterval);
            player.volume = targetVolume;
            resolve();
          }
        }, stepTime);
      });
    },

    // --- 2. ΟΘΟΝΗ ΚΛΕΙΔΩΜΑΤΟΣ (MEDIA SESSION) ---
    setupMediaSession: (title) => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title,
          artist: 'Δ.Σ. Περίστασης',
          album: 'Radio & Podcast',
          artwork: [
            // Βάλε το URL ενός λογοτύπου (π.χ. .png 512x512) για να φαίνεται στην οθόνη του κινητού!
            { src: 'https://cdn-icons-png.flaticon.com/512/1256/1256083.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.setActionHandler('play', () => JukeboxManager.dom.player.play());
        navigator.mediaSession.setActionHandler('pause', () => JukeboxManager.dom.player.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => JukeboxManager.handleTrackEnd());
      }
    },
    // --- 3. ΑΙΣΘΗΤΗΡΕΣ (ΜΑΓΝΗΤΙΚΑ ΚΟΥΜΠΙΑ & ΓΥΡΟΣΚΟΠΙΟ) ---
    setupSensors: () => {
      // Α. ΜΑΓΝΗΤΙΚΑ ΚΟΥΜΠΙΑ (Desktop)
      const buttons = document.querySelectorAll('.playlist-btn, .extra-track-btn');
      
      buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          // Βρίσκουμε πόσο απέχει το ποντίκι από το κέντρο του κουμπιού
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          // Το κουμπί ακολουθεί το ποντίκι (το 0.3 είναι η "δύναμη" του μαγνήτη)
          btn.style.transition = 'transform 0.1s ease-out';
          btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          // Ελαστική αναπήδηση (Bouncy Effect) όταν το ποντίκι φεύγει
          btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          btn.style.transform = 'translate(0px, 0px)';
          
          // Καθαρίζουμε το inline CSS μετά από 0.5s για να μην χαλάσει τα hover χρώματα του CSS σου
          setTimeout(() => { 
            btn.style.transition = ''; 
            btn.style.transform = ''; 
          }, 500);
        });
      });

      // Β. ΓΥΡΟΣΚΟΠΙΚΟ PARALLAX (Κινητά/Tablets)
      const container = document.querySelector('.jukebox-container');
      if (window.DeviceOrientationEvent && container) {
        window.addEventListener('deviceorientation', (e) => {
          if (!e.beta || !e.gamma) return;

          // e.beta (μπρος-πίσω κλίση), e.gamma (αριστερά-δεξιά κλίση)
          // -45 μοίρες γιατί κρατάμε διαγώνια το κινητό στα χέρια, όχι κάθετα
          let tiltX = e.beta - 45; 
          let tiltY = e.gamma;

          // Περιορίζουμε στις 15 μοίρες max για να μην αναποδογυρίσει ολόκληρο το widget!
          tiltX = Math.max(-15, Math.min(15, tiltX));
          tiltY = Math.max(-15, Math.min(15, tiltY));

          // Εφαρμόζουμε 3D κλίση στο κεντρικό γυαλί και μετατοπίζουμε τη σκιά του
          container.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
          container.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
          container.style.boxShadow = `${tiltY}px ${tiltX}px 32px rgba(0, 0, 0, 0.1)`;
        });
      }
    },

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
      // 1. Αποθήκευση της νέας έντασης αν ο χρήστης την αλλάξει από τον Player
      els.player.addEventListener('volumechange', () => {
         if (els.player.volume > 0 && els.player.volume <= 1) STATE.targetVolume = els.player.volume;
      });
       // Ενεργοποίηση Αισθητήρων (Μαγνήτης & Parallax)
      JukeboxManager.setupSensors();
    },

    playTrack: (button, url, name) => {
      if (navigator.vibrate) navigator.vibrate(15); 
      const els = JukeboxManager.dom;
      
      const executeChange = () => {
        els.player.pause();
        els.source.src = url;
        els.player.load();

        if (els.textTarget) els.textTarget.innerHTML = name;
        if (els.visualizer) els.visualizer.classList.add(CONFIG.visualizerClass);

        JukeboxManager.setupMediaSession(name); // Ενημέρωση κινητού

        try { els.player.volume = 0; } catch(e) {} // Αρχικά αθόρυβο
        
        els.player.play().then(() => {
          JukeboxManager.fadeAudio(STATE.targetVolume, 600); // Απαλό Fade In (600ms)
        }).catch(err => {
          console.warn("Η αυτόματη αναπαραγωγή μπλοκαρίστηκε από τον browser.");
          if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
          try { els.player.volume = STATE.targetVolume; } catch(e) {}
        });
        
        // Οπτική ενημέρωση κουμπιών
        document.querySelectorAll('.playlist-btn, .extra-track-btn').forEach(btn => btn.classList.remove('track-active'));
        if (button) button.classList.add('track-active');
      };

      // Αν έπαιζε ήδη, κάνε Fade Out 400ms πρώτα. Αλλιώς ξεκίνα κατευθείαν.
      if (!els.player.paused && els.player.currentTime > 0) {
        STATE.targetVolume = els.player.volume || 1; 
        JukeboxManager.fadeAudio(0, 400).then(executeChange);
      } else {
        STATE.targetVolume = els.player.volume || 1;
        executeChange();
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
