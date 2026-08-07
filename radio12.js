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

          // 1. Διαιρούμε με το 3 για να ρίξουμε την ευαισθησία (πιο "βαριά" και ομαλή κίνηση)
          let tiltX = (e.beta - 45) / 3; 
          let tiltY = e.gamma / 3;

          // 2. Κατεβάζουμε το όριο: από 15 που ήταν, το κάνουμε 5 μοίρες max.
          tiltX = Math.max(-4, Math.min(5, tiltX));
          tiltY = Math.max(-4, Math.min(5, tiltY));

          // Εφαρμόζουμε 3D κλίση στο κεντρικό γυαλί και μετατοπίζουμε τη σκιά του
          container.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
          container.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
          container.style.boxShadow = `${tiltY}px ${tiltX}px 32px rgba(0, 0, 0, 0.1)`;
        });
      }
    },
    // --- 4. ΖΩΝΤΑΝΟΣ ΠΑΛΜΟΣ (ΑΛΗΘΙΝΟ FIREBASE PRESENCE) ---
    setupPulse: () => {
      const header = document.querySelector('.juke-header');
      if (!header) return;
      
      const pulseDiv = document.createElement('div');
      pulseDiv.style.cssText = 'font-size: 11px; color: #e74c3c; font-weight: 600; text-align: center; margin-bottom: 12px; margin-top: -5px;';
      header.parentNode.insertBefore(pulseDiv, header.nextSibling);

      if (!document.getElementById('pulse-css')) {
          const style = document.createElement('style');
          style.id = 'pulse-css';
          style.innerHTML = `@keyframes pulseAnim { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`;
          document.head.appendChild(style);
      }

      pulseDiv.innerHTML = `<span style="display: inline-block;">⏳</span> Σύνδεση με Live Server...`;

      // Ελέγχουμε αν έχει φορτωθεί η βάση του Firebase στο HTML
      if (typeof firebase === 'undefined' || typeof firebase.database === 'undefined') {
          pulseDiv.innerHTML = `🔴 1 μαθητής (Λείπει το Firebase RTDB)`;
          console.warn("Το Firebase Realtime Database δεν βρέθηκε στη σελίδα.");
          return;
      }

      try {
        // Καλούμε τη βάση δεδομένων του Firebase
        const db = firebase.database();
        const listenersRef = db.ref('jukebox_active_listeners');
        const connectedRef = db.ref('.info/connected'); // Το ειδικό εργαλείο της Google

        // 1. Μόλις ο μαθητής συνδεθεί στο ίντερνετ/σελίδα
        connectedRef.on('value', (snap) => {
          if (snap.val() === true) {
            // Φτιάχνουμε μια κρυφή, μοναδική εγγραφή για αυτόν
            const myConnectionRef = listenersRef.push(); 

            // Η ΜΑΓΕΙΑ: Αν κλείσει το tab ή πέσει το ίντερνετ, το Firebase τον διαγράφει αυτόματα!
            myConnectionRef.onDisconnect().remove();

            // Βάζουμε την τιμή "true" για να ενεργοποιηθεί η παρουσία του
            myConnectionRef.set(true);
          }
        });

        // 2. Ακούμε ζωντανά (Real-Time) τις αλλαγές στο σύνολο
        listenersRef.on('value', (snapshot) => {
           const total = snapshot.numChildren() || 0; // numChildren = το άθροισμα των ατόμων
           const word = total === 1 ? 'ακούει τώρα' : 'ακούνε τώρα';
           pulseDiv.innerHTML = `<span style="animation: pulseAnim 2s infinite; display: inline-block;">🔴</span> ${total} ${word}`;
        });

      } catch(e) {
        console.warn("Σφάλμα Firebase. Ελέγξτε τις ρυθμίσεις σας.", e);
        pulseDiv.innerHTML = `<span style="animation: pulseAnim 2s infinite; display: inline-block;">🔴</span> Live Ραδιόφωνο`;
      }
    },

   
    // --- 6. PICTURE-IN-PICTURE (Mini Player) ---
    setupPiP: () => {
        if (!document.pictureInPictureEnabled) return;
        
        const loopBtn = document.getElementById('loop-btn');
        if (!loopBtn) return;

        // Φτιάχνουμε δυναμικά το κουμπί PiP δίπλα στο Loop
        const pipBtn = document.createElement('button');
        pipBtn.innerHTML = '📺 Mini Player';
        pipBtn.className = 'loop-btn';
        pipBtn.style.marginRight = '8px';
        loopBtn.parentNode.insertBefore(pipBtn, loopBtn);

        // Το Μυστικό: Αόρατος καμβάς και βίντεο
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 200;
        const ctx = canvas.getContext('2d');
        const video = document.createElement('video'); video.muted = true;

        // Συγχρονισμός: Αν πατήσεις Pause στο αιωρούμενο, ακούει και η σελίδα!
        video.addEventListener('play', () => { if (JukeboxManager.dom.player.paused) JukeboxManager.dom.player.play(); });
        video.addEventListener('pause', () => { if (!JukeboxManager.dom.player.paused) JukeboxManager.dom.player.pause(); });

        let drawInterval;
        const drawFrame = () => {
           // Σκοτεινό μπλε φόντο
           ctx.fillStyle = '#1e272e'; ctx.fillRect(0, 0, 400, 200);
           
           ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
           ctx.font = '22px Arial'; ctx.fillText('📻 Radio Δ.Σ. Περίστασης', 200, 50);
           
           const els = JukeboxManager.dom;
           const trackName = els.textTarget ? els.textTarget.innerText : '';
           ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#e74c3c';
           ctx.fillText(trackName, 200, 110);

           // Ψεύτικο Visualizer που χορεύει στο PiP
           if (els.player && !els.player.paused) {
               ctx.fillStyle = '#ffffff';
               for(let i=0; i<6; i++) {
                   let h = 10 + Math.random() * 25;
                   ctx.fillRect(145 + (i*20), 180 - h, 10, h);
               }
           }
        };

        pipBtn.addEventListener('click', async () => {
            if (document.pictureInPictureElement) { document.exitPictureInPicture(); return; }
            if (!video.srcObject) video.srcObject = canvas.captureStream(15);
            
            drawInterval = setInterval(drawFrame, 100); // Ζωγραφίζει καρέ-καρέ
            try { 
                await video.play(); 
                await video.requestPictureInPicture(); 
            } catch(e) { console.warn("PiP blocked by browser", e); }
        });

        video.addEventListener('leavepictureinpicture', () => clearInterval(drawInterval));
    },
    // --- 7. TINDER-STYLE SWIPE NAVIGATION ---
    setupSwipeSupport: () => {
      const container = document.querySelector('.jukebox-container');
      if (!container) return;

      let startX = 0;
      let currentX = 0;
      let isDragging = false;
      const SWIPE_THRESHOLD = 90; // Πόσα pixels πρέπει να το σύρει για να αλλάξει τραγούδι

      const handleDragStart = (e) => {
        // Εξαιρούμε τα κουμπιά, τον player και την κρυφή λίστα από το swipe για να μην μπερδεύονται τα κλικ
        if (e.target.closest('button, audio, .extra-tracks-wrapper, input')) return;
        
        // Διαβάζει είτε το δάχτυλο (touch) είτε το ποντίκι (mouse)
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        isDragging = true;
        
        // Αφαιρούμε το smooth CSS και το γυροσκόπιο προσωρινά για να "κολλάει" στο χέρι μας
        container.style.setProperty('transition', 'none', 'important');
      };

      const handleDragMove = (e) => {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        currentX = clientX - startX;
        
        // Προσθέτουμε "Βάρος/Αντίσταση" (0.4) και ελαφριά κλίση - Tinder Effect
        const resistance = currentX * 0.4;
        const tilt = currentX * 0.05;
        
        container.style.setProperty('transform', `translateX(${resistance}px) rotate(${tilt}deg)`, 'important');
        
        // Όσο φεύγει από το κέντρο, αρχίζει να ξεθωριάζει
        const opacity = Math.max(0.5, 1 - Math.abs(currentX) / 300);
        container.style.opacity = opacity.toString();
      };

      const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        // Επαναφέρουμε την ομαλή, ελαστική επιστροφή
        container.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease', 'important');

        if (currentX < -SWIPE_THRESHOLD) {
          // Swipe ΑΡΙΣΤΕΡΑ -> Επόμενο Τραγούδι
          JukeboxManager.playNextOrPrev(1);
          animateSwipeOut('left');
        } else if (currentX > SWIPE_THRESHOLD) {
          // Swipe ΔΕΞΙΑ -> Προηγούμενο Τραγούδι
          JukeboxManager.playNextOrPrev(-1);
          animateSwipeOut('right');
        } else {
          // Δεν το τράβηξε αρκετά -> Ακύρωση & Ελαστική Επιστροφή (Snap back)
          container.style.setProperty('transform', 'translateX(0px) rotate(0deg)', 'important');
          container.style.opacity = '1';
          
          // Απελευθέρωση για να παίξει πάλι το Γυροσκόπιο
          setTimeout(() => {
              container.style.transition = '';
              container.style.transform = '';
          }, 400);
        }
        
        currentX = 0; // Μηδενισμός
      };

      // Το Animation που "πετάει" το κουτί εκτός οθόνης και το φέρνει από την άλλη πλευρά
      const animateSwipeOut = (direction) => {
         const moveOut = direction === 'right' ? window.innerWidth : -window.innerWidth;
         container.style.setProperty('transform', `translateX(${moveOut}px) rotate(${direction === 'right' ? 15 : -15}deg)`, 'important');
         container.style.opacity = '0';

         setTimeout(() => {
            // Το φέρνουμε αόρατα στην αντίθετη πλευρά...
            container.style.setProperty('transition', 'none', 'important');
            container.style.setProperty('transform', `translateX(${-moveOut}px) rotate(0deg)`, 'important');
            
            // ...και του λέμε να κάνει δυναμική είσοδο!
            setTimeout(() => {
               container.style.setProperty('transition', 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease', 'important');
               container.style.setProperty('transform', 'translateX(0px) rotate(0deg)', 'important');
               container.style.opacity = '1';
               
               // Απελευθέρωση Γυροσκοπίου
               setTimeout(() => {
                  container.style.transition = '';
                  container.style.transform = '';
               }, 500);
            }, 50);
         }, 300);
      };

      // Συνδέουμε τα Events για Οθόνες Αφής (Touch / Κινητά)
      container.addEventListener('touchstart', handleDragStart, { passive: true });
      container.addEventListener('touchmove', handleDragMove, { passive: true });
      container.addEventListener('touchend', handleDragEnd);
      container.addEventListener('touchcancel', handleDragEnd);

      // Συνδέουμε τα Events για Ποντίκι (Για να μπορείς να το δοκιμάσεις και στο PC)
      container.addEventListener('mousedown', handleDragStart);
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    },

    // 7Β. Η βοηθητική λογική για το Swipe (Εύρεση τραγουδιού)
    playNextOrPrev: (direction) => {
      const allBtns = Array.from(document.querySelectorAll('.playlist-btn[data-url], .extra-track-btn[data-url]'));
      const activeBtn = document.querySelector('.track-active');
      
      if (allBtns.length === 0) return;
      
      let nextIndex = 0;
      if (activeBtn) {
         const currentIndex = allBtns.indexOf(activeBtn);
         // Μαθηματικό trick (modulo) για να κάνει αέναο κύκλο
         nextIndex = (currentIndex + direction + allBtns.length) % allBtns.length;
      }

      const targetBtn = allBtns[nextIndex];
      const targetUrl = targetBtn.dataset.url;
      if (targetUrl && targetUrl.includes('http')) {
         JukeboxManager.playTrack(targetBtn, targetUrl, targetBtn.dataset.name);
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
      // Εκκίνηση "Next-Gen" Λειτουργιών
      JukeboxManager.setupPulse();
      JukeboxManager.setupPiP();
      // Ενεργοποίηση Swipe (Tinder-Style)
      JukeboxManager.setupSwipeSupport();
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
