(() => {
  "use strict";

    const radioFirebaseConfig = {
    apiKey: "AIzaSyBgMaOIrweK1TEbftuqRxe4MR5vnQ8YSwE",
    authDomain: "radio-a01e3.firebaseapp.com",
    projectId: "radio-a01e3",
    storageBucket: "radio-a01e3.firebasestorage.app",
    messagingSenderId: "60074075391",
    appId: "1:60074075391:web:c3da8f4de9e770022618ca",
    measurementId: "G-SVR0SLHGWJ",
    databaseURL: "https://radio-a01e3-default-rtdb.europe-west1.firebasedatabase.app"
  };

 // Δηλώνουμε τις μεταβλητές κενές, για να τις γεμίσουμε με απόλυτη ασφάλεια αργότερα
  let radioApp;
  let radioDb;

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
    targetVolume: 1,
    isFading: false,
    playToken: 0
  };

  // --- JUKEBOX MANAGER ---
  const JukeboxManager = {
    // 1. Δημιουργούμε ένα άδειο αντικείμενο για το DOM
    dom: {},
    // --- 0. ΚΟΥΜΠΙ ΕΠΑΝΑΛΗΨΗΣ (LOOP TOGGLE) ---
    toggleLoop: () => {
      if (navigator.vibrate) navigator.vibrate(10); 
      
      // Κυκλική εναλλαγή (0 -> 1 -> 2 -> 0)
      STATE.loopModeIndex = (STATE.loopModeIndex + 1) % 3;
      const idx = STATE.loopModeIndex;
      const els = JukeboxManager.dom;
      
     if (els.loopBtn) {
        els.loopBtn.innerHTML = `${CONFIG.icons[idx]} Επανάληψη: ${CONFIG.loopModes[idx]}`;
        els.loopBtn.className = CONFIG.loopClasses[idx];
      }
      
      // ΝΕΟ: Ενεργοποιούμε το εγγενές (native) gapless loop του browser 
      // ΜΟΝΟ όταν επιλέγεται το "Ένα τραγούδι" (idx === 2)
      if (els.player) {
          els.player.loop = (idx === 2);
      }
    },
// --- 1. ΟΜΑΛΗ ΜΕΤΑΒΑΣΗ (FADE IN/OUT) - BULLETPROOF ---
    fadeAudio: (targetVolume, duration) => {
      return new Promise((resolve) => {
        const player = JukeboxManager.dom.player;
        if (!player) return resolve();
        
        clearInterval(STATE.fadeInterval);
        
        // ΝΕΟ: Αν το tab/οθόνη είναι στο παρασκήνιο, ακυρώνουμε το fade 
        // για να αποφύγουμε σιγή 15 δευτερολέπτων λόγω throttling του browser!
        if (document.hidden) {
            STATE.isFading = false;
            try { player.volume = targetVolume; } catch(e) {}
            return resolve();
        }

        STATE.isFading = true; // Κλειδώνουμε: Τον ήχο τον αλλάζει ο υπολογιστής!
        
        try { player.volume = player.volume; } catch(e) {
           STATE.isFading = false;
           return resolve(); 
        }
        
        const steps = 15; // Πιο γρήγορα βήματα (Για να προλαβαίνει τα γρήγορα Swipes)
        const stepTime = duration / steps;
        const volumeStep = (targetVolume - player.volume) / steps;
        let currentStep = 0;

       STATE.fadeInterval = setInterval(() => {
          // ΝΕΟ: Αν το tab πάει στο background ΚΑΤΑ ΤΗ ΔΙΑΡΚΕΙΑ του fade, ολοκλήρωσε το ακαριαία
          // για να αποτρέψεις το background throttling του browser (σιγή 15 δευτερολέπτων).
          if (document.hidden) {
              clearInterval(STATE.fadeInterval);
              try { player.volume = targetVolume; } catch(e) {}
              STATE.isFading = false;
              return resolve();
          }

          currentStep++;
          let newVol = player.volume + volumeStep;
          if (newVol > 1) newVol = 1;
          if (newVol < 0) newVol = 0;
          
          player.volume = newVol;

          if (currentStep >= steps || (volumeStep > 0 && newVol >= targetVolume) || (volumeStep < 0 && newVol <= targetVolume)) {
            clearInterval(STATE.fadeInterval);
            player.volume = targetVolume;
            STATE.isFading = false; // Ξεκλειδώνουμε!
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
     navigator.mediaSession.setActionHandler('play', () => JukeboxManager.dom.player.play().catch(()=>{}));
        navigator.mediaSession.setActionHandler('pause', () => JukeboxManager.dom.player.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => JukeboxManager.playNextOrPrev(1));
        navigator.mediaSession.setActionHandler('previoustrack', () => JukeboxManager.playNextOrPrev(-1));
      }
    },
    // --- 3. ΑΙΣΘΗΤΗΡΕΣ (ΜΑΓΝΗΤΙΚΑ ΚΟΥΜΠΙΑ & ΓΥΡΟΣΚΟΠΙΟ) ---
   // ΜΕΤΑ:
   // ΜΕΤΑ:
   setupSensors: () => {
      // Α. ΜΑΓΝΗΤΙΚΑ ΚΟΥΜΠΙΑ (Desktop)
      const buttons = document.querySelectorAll('.playlist-btn, .extra-track-btn');
      
      // ΑΛΛΑΓΗ: Τα εφαρμόζουμε αυστηρά μόνο σε συσκευές που υποστηρίζουν hover (ποντίκι). 
      // Αλλιώς, στις οθόνες αφής τα κουμπιά θα κολλήσουν μετατοπισμένα!
    if (window.matchMedia("(hover: hover)").matches) {
          buttons.forEach(btn => {
            let magnetTimeout;
            let cachedRect = null; // ΝΕΟ: Αποθήκευση διαστάσεων στη μνήμη

            // Υπολογίζουμε τις διαστάσεις ΜΟΝΟ μια φορά, όταν το ποντίκι μπαίνει στο κουμπί
          let cachedCenterX, cachedCenterY;

            // Υπολογίζουμε τις διαστάσεις ΜΟΝΟ μια φορά, όταν το ποντίκι μπαίνει στο κουμπί
            btn.addEventListener('mouseenter', () => {
                const currentTransform = btn.style.transform;
                btn.style.transform = 'none';
                const rect = btn.getBoundingClientRect();
                
                // Υπολογίζουμε το απόλυτο κέντρο σε σχέση με όλο το έγγραφο (προσθέτοντας το scroll)
                cachedCenterX = rect.left + window.scrollX + rect.width / 2;
                cachedCenterY = rect.top + window.scrollY + rect.height / 2;
                
                btn.style.transform = currentTransform;
            });

            btn.addEventListener('mousemove', (e) => {
              clearTimeout(magnetTimeout);
              if (!cachedCenterX) return; // Fallback ασφαλείας
         
              // Χρησιμοποιούμε τα pageX/pageY για τέλεια ακρίβεια ανεξάρτητα από το scroll του χρήστη!
              const x = e.pageX - cachedCenterX;
              const y = e.pageY - cachedCenterY;
          
          btn.dataset.tx = x * 0.3;
          btn.dataset.ty = y * 0.3;
          
          btn.style.transition = 'transform 0.1s ease-out';
          btn.style.transform = `translate(${btn.dataset.tx}px, ${btn.dataset.ty}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.dataset.tx = 0;
          btn.dataset.ty = 0;
          // Ελαστική αναπήδηση (Bouncy Effect) όταν το ποντίκι φεύγει
          btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          btn.style.transform = 'translate(0px, 0px)';
          
          // Καθαρίζουμε το inline CSS μετά από 0.5s για να μην χαλάσει τα hover χρώματα του CSS σου
         magnetTimeout = setTimeout(() => { 
            btn.style.transition = ''; 
            btn.style.transform = ''; 
          }, 500);
        });
      });
        }

    // Β. ΓΥΡΟΣΚΟΠΙΚΟ PARALLAX (Κινητά/Tablets)
      const container = document.querySelector('.jukebox-container');
      
      if (window.DeviceOrientationEvent && container) {
        
   // 1. Βάζουμε τη λογική του γυροσκοπίου σε μια συνάρτηση
        let isTicking = false; // Μηχανισμός Throttling για τα καρέ της οθόνης
        const handleOrientation = (e) => {
          
          if (e.beta == null || e.gamma == null) return;
          if (container.dataset.isSwiping === 'true') return;

          if (!isTicking) {
              window.requestAnimationFrame(() => {
                  let tiltX = Math.max(-2, Math.min(2, (e.beta - 45) / 3));
                  let tiltY = Math.max(-2, Math.min(2, e.gamma / 3));

                  // Αφαιρούμε το transition ώστε να εφαρμόζεται ακαριαία χωρίς να φρακάρει η GPU
                  container.style.transition = 'none';
                  container.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
                  container.style.boxShadow = `${tiltY}px ${tiltX}px 32px rgba(0, 0, 0, 0.1)`;
                  isTicking = false;
              });
              isTicking = true;
          }
        };

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Ακυρώθηκε η κλήση στο iOS. Η εμφάνιση του συστημικού popup καταναλώνει 
            // το κλικ (user gesture) και μπλοκάρει/απαγορεύει την αναπαραγωγή του Safari!
            return;
        } else {
            // Android & PC: Δεν απαιτούν άδεια, συνδέονται απευθείας
            window.addEventListener('deviceorientation', handleOrientation);
        }
      }
    },

    // --- 4. ΖΩΝΤΑΝΟΣ ΠΑΛΜΟΣ (ΑΛΗΘΙΝΟ FIREBASE PRESENCE) ---
    setupPulse: () => {
      const header = document.querySelector('.juke-header');
      if (!header) return;
      
      const pulseDiv = document.createElement('div');
      pulseDiv.style.cssText = 'font-size: 13px; color: #e74c3c; font-weight: 600; text-align: center; margin-bottom: 12px; margin-top: -5px;';
      header.parentNode.insertBefore(pulseDiv, header.nextSibling);

     if (!document.getElementById('pulse-css')) {
          const style = document.createElement('style');
          style.id = 'pulse-css';
          style.innerHTML = `@keyframes pulseAnim { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`;
          document.head.appendChild(style);
      }

      // --- 1. ΑΣΠΙΔΑ BOTS (Λύση για PageSpeed / Ghost Listeners) ---
      const isBot = navigator.webdriver || /bot|crawler|spider|lighthouse|pagespeed|gtmetrix|ptst|headless|chrome-lighthouse/i.test(navigator.userAgent);
      
      if (isBot) {
          pulseDiv.innerHTML = `<span style="display: inline-block;">🤖</span> Αναμονή... (Ανίχνευση Bot)`;
          return; // Σταματάει την εκτέλεση! Το ρομπότ δεν εγγράφεται ΠΟΤΕ στο Firebase.
      }
      // --------------------------------------------------------------

      pulseDiv.innerHTML = `<span style="display: inline-block;">⏳</span> Σύνδεση με Live Server...`;
// Η συνάρτηση που κάνει την πραγματική σύνδεση
      const connectFirebase = () => {
        try {
          // ΑΡΧΙΚΟΠΟΙΗΣΗ ΜΕ ΑΣΦΑΛΕΙΑ ΕΔΩ:
          radioApp = !firebase.apps.find(app => app.name === 'radioApp')
            ? firebase.initializeApp(radioFirebaseConfig, 'radioApp')
            : firebase.app('radioApp');
          
          radioDb = firebase.database(radioApp);
          const db = radioDb;
          
        const listenersRef = db.ref('jukebox_active_listeners');
          const connectedRef = db.ref('.info/connected'); 

          // ΝΕΟ: Timeout προστασίας αν το Firewall του σχολείου μπλοκάρει τη ζωντανή σύνδεση
          let connectionTimeout = setTimeout(() => {
              if (pulseDiv) pulseDiv.innerHTML = `<span style="display: inline-block;">📻</span> Live Ραδιόφωνο`;
          }, 8000);

     let myConnectionRef = null;
          let forceDisconnect = () => { if (myConnectionRef) try { myConnectionRef.remove(); } catch(e){} };

          connectedRef.on('value', (snap) => {
             if (snap.val() === true) {
               clearTimeout(connectionTimeout); // Η σύνδεση πέτυχε, ακυρώνουμε το timeoutconst listenersRef = db.ref('jukebox_active_listeners');
               if (myConnectionRef) { forceDisconnect(); } // Καθαρισμός προηγούμενης (νεκρής) σύνδεσης

               myConnectionRef = listenersRef.push(); 
               myConnectionRef.onDisconnect().remove();
               myConnectionRef.set(true);

             window.removeEventListener('beforeunload', forceDisconnect);
               window.addEventListener('beforeunload', forceDisconnect);
               
               // ΔΙΑΓΡΑΦΗΚΑΝ τα pagehide / pageshow. 
               // Όσο το audio παίζει με κλειδωμένη οθόνη, η σύνδεση παραμένει ζωντανή.
               // Το .onDisconnect() του Firebase θα αναλάβει μόνο του τη σωστή διαγραφή όταν κλείσει εντελώς το tab/browser.
             }
          });

          // 2. Ακούμε ζωντανά τις αλλαγές
          listenersRef.on('value', (snapshot) => {
             const total = snapshot.numChildren() || 0; 
             const word = total === 1 ? 'ακούει τώρα' : 'ακούνε τώρα';
             pulseDiv.innerHTML = `<span style="animation: pulseAnim 2s infinite; display: inline-block;">🔴</span> ${total} ${word}`;
          });

        } catch(e) {
          console.error("Σφάλμα Firebase:", e);
          pulseDiv.innerHTML = `<span style="animation: pulseAnim 2s infinite; display: inline-block;">🔴</span> Live Ραδιόφωνο`;
        }
      };

    let attempts = 0;
      const checkAndConnect = () => {
          // ΔΙΟΡΘΩΣΗ 1: Ελέγχουμε αυστηρά αν έχει φορτώσει ΚΑΙ η Βάση Δεδομένων
          if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') {
              connectFirebase();
          } else if (attempts < 20) { // Δοκιμάζει 20 φορές (σύνολο 10 δευτερόλεπτα αναμονής)
              attempts++;
              setTimeout(checkAndConnect, 500);
          } else {
              // ΔΙΟΡΘΩΣΗ 2: Καθαρό Fallback μήνυμα αν μπλοκαριστεί πλήρως από AdBlockers / Firewalls
              pulseDiv.innerHTML = `<span style="display: inline-block;">📻</span> Live Ραδιόφωνο`;
          }
      };
      checkAndConnect();
    },

   
    // --- 6. PICTURE-IN-PICTURE (Mini Player) ---
    setupPiP: () => {
       // Ελέγχουμε αν υπάρχει PiP ΚΑΙ αν ο browser υποστηρίζει captureStream (αλλιώς το κρύβουμε)
        if (!document.pictureInPictureEnabled || !document.createElement('canvas').captureStream) return;
        
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
        const video = document.createElement('video'); 
        video.muted = true;
        
        // ΝΕΟ (Ασπίδα iOS): Αποτρέπει την αναγκαστική, μαύρη πλήρη οθόνη (Fullscreen) στα iPhone!
        video.playsInline = true;
        video.setAttribute('playsinline', ''); 

       let isPipOpening = false; // ΝΕΟ: Ασπίδα για να μην παίζει μουσική μόνο του κατά το άνοιγμα

     video.addEventListener('play', () => { 
            if (!isPipOpening && JukeboxManager.dom.player.paused) JukeboxManager.dom.player.play().catch(()=>{}); 
        });
        video.addEventListener('pause', () => { 
            // Μην κλείσεις τη μουσική αν το παραθυράκι του PiP ΔΕΝ υπάρχει πια (δηλ. αν πατήθηκε το "X")
            if (document.pictureInPictureElement === video && !JukeboxManager.dom.player.paused) {
                JukeboxManager.dom.player.pause(); 
            }
        });

      // Συγχρονισμός Σελίδας -> PiP (ΔΙΟΡΘΩΣΗ: Εκτέλεση μόνο όταν το PiP είναι ανοιχτό!)
        JukeboxManager.dom.player.addEventListener('play', () => { 
            if (document.pictureInPictureElement === video && video.paused) video.play().catch(()=>{}); 
        });
        JukeboxManager.dom.player.addEventListener('pause', () => { 
            if (document.pictureInPictureElement === video && !video.paused) video.pause(); 
        });

        let drawInterval;
        const drawFrame = () => { 
           ctx.fillStyle = '#1e272e'; ctx.fillRect(0, 0, 400, 200);
           // ΜΕΤΑ:
           ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
           ctx.font = '22px Arial'; ctx.fillText('📻 Radio Δ.Σ. Περίστασης', 200, 50);
           const els = JukeboxManager.dom;
           // ΑΛΛΑΓΗ: Το textContent σταματάει το Layout Thrashing (Τεράστια εξοικονόμηση μπαταρίας/CPU)
         const trackName = els.textTarget ? els.textTarget.textContent : '';
           ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#e74c3c';
           ctx.fillText(trackName, 200, 110, 380);
       // ΝΕΟ: Συγχρονίζουμε το PiP αυστηρά με την κλάση is-playing του κεντρικού player για να σταματάει στο Buffering!
           const isPlaying = els.visualizer && els.visualizer.classList.contains(CONFIG.visualizerClass);
           
           if (isPlaying && els.player && !els.player.ended) {
               ctx.fillStyle = '#ffffff';
               for(let i=0; i<6; i++) { let h = 10 + Math.random() * 25; ctx.fillRect(145 + (i*20), 180 - h, 10, h); }
           }
        };

      pipBtn.addEventListener('click', async () => {
        if (isPipOpening) return;
           // Ελέγχουμε αυστηρά αν το PiP που είναι ήδη ανοιχτό είναι το δικό μας κρυφό βίντεο!
           if (document.pictureInPictureElement === video) { 
               await document.exitPictureInPicture(); 
               return; 
           }
        // ΝΕΟ: Ζωγραφίζουμε το πρώτο καρέ ΠΡΙΝ ζητήσουμε το stream, αλλιώς Firefox/Safari βγάζουν μαύρη οθόνη ή Error!
           drawFrame();

           if (!video.srcObject) video.srcObject = canvas.captureStream(15);
      
           clearInterval(drawInterval);
           drawInterval = setInterval(drawFrame, 100);

           isPipOpening = true;
           try { 
               await video.play(); 
               // Αν η μουσική ήταν σε Παύση, βάζουμε παύση και στο βίντεο αμέσως, ώστε 
               // το εικονίδιο στο PiP να δείχνει "Play" και να μη ξεκινήσει η μουσική
            if (JukeboxManager.dom.player.paused) {
                   video.pause();
               }
               await video.requestPictureInPicture(); 
           } catch(e) { 
               clearInterval(drawInterval);
               video.pause(); // ΝΕΟ: Αν το PiP αποτύχει ή μπλοκαριστεί, σταματάμε αμέσως το κρυφό βίντεο!
               console.warn("PiP blocked by browser", e); 
           } finally {
               setTimeout(() => { isPipOpening = false; }, 100);
           }
        });

     video.addEventListener('leavepictureinpicture', () => {
            clearInterval(drawInterval);
            // ΑΛΛΑΓΗ: Απλώς κάνουμε παύση το βίντεο. Η καταστροφή των tracks 
            // ΑΦΑΙΡΕΘΗΚΕ διότι προκαλεί μόνιμη μαύρη οθόνη αν ο χρήστης ξανανοίξει το PiP!
            video.pause();
        });
    },
    // --- 7. TINDER-STYLE SWIPE NAVIGATION ---
    setupSwipeSupport: () => {
      const container = document.querySelector('.jukebox-container');
      if (!container) return;

      // Απαγορεύει στον browser να αλλάξει σελίδα (History Back/Forward) όταν κάνουμε Swipe!
      container.style.touchAction = 'pan-y';

      let startX = 0;
      let startY = 0; // ΝΕΟ
      let currentX = 0;
      let isDragging = false;
    let isVerticalScrolling = false; 
      let isHorizontalSwiping = false; // ΝΕΟ: Ασπίδα για τα "στραβά" swipes
      let isAnimatingSwipe = false; 
      let snapBackTimeout = null; 
      const SWIPE_THRESHOLD = 90;

  const handleDragStart = (e) => {
        if (isAnimatingSwipe) return;
        clearTimeout(snapBackTimeout); 
        
        // ΝΕΟ: Επαναφέρουμε την ασπίδα ΠΡΙΝ τον έλεγχο εξαιρέσεων! Αλλιώς, αν ο 
        // χρήστης είχε κάνει scroll νωρίτερα, το επόμενο κλικ στα "Επιπλέον Τραγούδια" θα μπλοκαριστεί.
        container.dataset.hasMoved = 'false'; 
        
        if (e.target.closest('.loop-btn, #toggle-more-btn, audio, .extra-tracks-wrapper, input')) return;
        
        container.dataset.isSwiping = 'true';
        
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY; 
        isDragging = true;
        isVerticalScrolling = false; 
        isHorizontalSwiping = false; // ΝΕΟ: Επαναφορά σε κάθε νέο άγγιγμα
        
        container.style.setProperty('transition', 'none', 'important');
      };

      const handleDragMove = (e) => {
        if (!isDragging || isVerticalScrolling) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY; // ΝΕΟ
        currentX = clientX - startX;
        const currentY = clientY - startY; // ΝΕΟ
  
    if (Math.abs(currentX) < 10 && Math.abs(currentY) < 10) return;
      container.dataset.hasMoved = 'true'; // ΝΕΟ: Καταγράφουμε ότι υπήρξε πραγματική κίνηση (όχι απλό κλικ)

        // ΝΕΟ: Αν το πρώτο 10px ξεπέρασμα έγινε οριζόντια, ΚΛΕΙΔΩΝΟΥΜΕ το swipe.
        if (!isHorizontalSwiping && !isVerticalScrolling && Math.abs(currentX) > Math.abs(currentY)) {
            isHorizontalSwiping = true;
        }
  
       // ΑΛΛΑΓΗ: Προστέθηκε ο έλεγχος !isHorizontalSwiping ώστε να αγνοηθεί η προσπάθεια μετατροπής σε scroll
       if (!isHorizontalSwiping && !isVerticalScrolling && Math.abs(currentY) > Math.abs(currentX) && Math.abs(currentY) > 10) {
            isVerticalScrolling = true;
            container.style.transition = '';
            container.style.transform = '';
            container.style.opacity = '1'; // ΑΛΛΑΓΗ: Επαναφέρουμε την ορατότητα, αλλιώς μένει διάφανο!
            return;
        }
        
        const resistance = currentX * 0.4;
        const tilt = currentX * 0.05;
        
        container.style.setProperty('transform', `translateX(${resistance}px) rotate(${tilt}deg)`, 'important');
        const opacity = Math.max(0.5, 1 - Math.abs(currentX) / 300);
        container.style.opacity = opacity.toString();
      };

     const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        // ΑΦΑΙΡΕΘΗΚΕ: ΜΗΝ ελευθερώνεις το isSwiping εδώ. Καταστρέφει το οπτικό animation της κάρτας!
        
        if (isVerticalScrolling) {
            currentX = 0;
            container.style.opacity = '1';
            container.dataset.isSwiping = 'false'; // Απελευθερώνουμε ΕΔΩ μόνο αν ακυρώθηκε το swipe λόγω scroll
            return;
        }

        container.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease', 'important');

        if (currentX < -SWIPE_THRESHOLD) {
          JukeboxManager.playNextOrPrev(1);
          animateSwipeOut('left');
        } else if (currentX > SWIPE_THRESHOLD) {
          JukeboxManager.playNextOrPrev(-1);
          animateSwipeOut('right');
      } else {
          container.style.setProperty('transform', 'translateX(0px) rotate(0deg)', 'important');
          container.style.opacity = '1';
          
          snapBackTimeout = setTimeout(() => { // ΝΕΟ: Ανάθεση του timeout στη μεταβλητή
              container.style.transition = '';
              container.style.transform = '';
              container.dataset.isSwiping = 'false'; // ΚΡΙΣΙΜΟ: Ελευθερώνουμε το γυροσκόπιο ΜΟΝΟ ΑΦΟΥ τελειώσει το animation των 400ms!
          }, 400);
        }
        
        currentX = 0; 
      };

  const animateSwipeOut = (direction) => {
         isAnimatingSwipe = true; 
         
         // ΝΕΟ: Κλειδώνουμε το οριζόντιο overflow της σελίδας για να μην εμφανιστεί σπασμωδικά μπάρα κύλισης στο blog!
         const originalOverflow = document.body.style.overflowX;
         document.body.style.overflowX = 'hidden';

         const moveOut = direction === 'right' ? window.innerWidth : -window.innerWidth;
         container.style.setProperty('transform', `translateX(${moveOut}px) rotate(${direction === 'right' ? 15 : -15}deg)`, 'important');
         container.style.opacity = '0';

         setTimeout(() => {
            container.style.setProperty('transition', 'none', 'important');
            container.style.setProperty('transform', `translateX(${-moveOut}px) rotate(0deg)`, 'important');
            
            // Το onHidden() διαγράφηκε γιατί το τραγούδι άλλαξε με ασφάλεια πριν το timeout
            
            setTimeout(() => {
               container.style.setProperty('transition', 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease', 'important');
               container.style.setProperty('transform', 'translateX(0px) rotate(0deg)', 'important');
               container.style.opacity = '1';
               
            setTimeout(() => {
                  container.style.transition = '';
                  container.style.transform = '';
                  isAnimatingSwipe = false; 
                  container.dataset.isSwiping = 'false'; // ΚΡΙΣΙΜΟ: Αν δεν το βάλεις εδώ, μετά την πρώτη αλλαγή τραγουδιού το Parallax νεκρώνει για πάντα!
                  
                  // ΝΕΟ: Επαναφορά του layout του Blog στην αρχική του κατάσταση
                  document.body.style.overflowX = originalOverflow;
               }, 500);
            }, 50);
         }, 400); // ΔΙΟΡΘΩΣΗ: Πρέπει να συγχρονιστεί απόλυτα με τα 400ms του CSS transition (transform 0.4s) για να μην "σπάει" η εικόνα!
      };

      // Συνδέουμε τα Events για Οθόνες Αφής (Touch / Κινητά)
      container.addEventListener('touchstart', handleDragStart, { passive: true });
      container.addEventListener('touchmove', handleDragMove, { passive: true });
      container.addEventListener('touchend', handleDragEnd);
      container.addEventListener('touchcancel', handleDragEnd);

   // Συνδέουμε τα Events για Ποντίκι (Για να μπορείς να το δοκιμάσεις και στο PC)
      container.addEventListener('dragstart', (e) => e.preventDefault()); // ΝΕΟ: Αποτρέπει το μόνιμο "πάγωμα" του swipe στους υπολογιστές!
      container.addEventListener('mousedown', handleDragStart);
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('mouseleave', handleDragEnd);
    },

   // 7Β. Η βοηθητική λογική για Swipe & Loop (Εύρεση τραγουδιού)
    playNextOrPrev: (direction) => {
      const allBtns = Array.from(document.querySelectorAll('.playlist-btn[data-url], .extra-track-btn[data-url]'));
      const activeBtn = document.querySelector('.track-active');
      
      if (allBtns.length === 0) return;
      
     // Αν δεν παίζει τίποτα και ζητήσουμε το Προηγούμενο (-1), το index ξεκινάει από 0 για να βρει το τελευταίο
      let currentIndex = activeBtn ? allBtns.indexOf(activeBtn) : (direction === 1 ? -1 : 0);
      let attempts = 0;
      
      while (attempts < allBtns.length) {
         // Προχωράμε μπρος ή πίσω κυκλικά
         currentIndex = (currentIndex + direction + allBtns.length) % allBtns.length;
       const targetBtn = allBtns[currentIndex];
         const targetUrl = targetBtn.dataset.url || "";
         // ΝΕΟ: Fallback κείμενο και για την αυτόματη εναλλαγή!
         const targetName = targetBtn.dataset.name || targetBtn.textContent.trim() || "Άγνωστο Κομμάτι";
         
    // Αν το κουμπί έχει πραγματικό link (http) και όχι "LINK_3", παίξ'το!
        if (targetUrl.trim() !== "" && !targetUrl.includes('LINK_')) {
       
            if (targetBtn === activeBtn && !JukeboxManager.dom.player.ended) return;
        
            JukeboxManager.playTrack(targetBtn, targetUrl, targetName);
            break;
         }
         attempts++;
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

    // ΔΙΟΡΘΩΣΗ: Σεβόμαστε τη μνήμη του browser, ΑΛΛΑ προστατεύουμε από το κόλλημα της σίγασης.
      // Αν ο χρήστης ανανέωσε τη σελίδα πάνω στο Fade-In, ο browser αποθηκεύει ένταση κοντά στο 0.
      if (els.player.volume > 0.05 && els.player.volume <= 1) {
          STATE.targetVolume = els.player.volume;
      } else {
          STATE.targetVolume = 1; // Επαναφορά στο 100% 
          try { els.player.volume = 1; } catch(e) {}
      }

      // Συγχρονισμός του native loop μόλις φορτώσει το script
      els.player.loop = (STATE.loopModeIndex === 2);

   // Events
      els.player.addEventListener('ended', JukeboxManager.handleTrackEnd);
      
      // ΝΕΟ: Ενημέρωση της οθόνης αν πέσει το ίντερνετ ή η μετάδοση του σταθμού
      els.player.addEventListener('error', () => {
          if (els.textTarget) els.textTarget.textContent = "⚠️ Σφάλμα Δικτύου / Αποτυχία";
          if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
          STATE.isFading = false;
      });

      // ΑΛΛΑΓΗ: Το 'play' έγινε 'playing' για να μην κινείται το visualizer κατά τη διάρκεια του buffering!
      els.player.addEventListener('playing', () => { if (els.visualizer) els.visualizer.classList.add(CONFIG.visualizerClass); });
      els.player.addEventListener('pause', () => { if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass); });
      // ΔΙΟΡΘΩΣΗ: Όταν κάνει buffering (αναμονή φόρτωσης), σταματάμε το visualizer!
      els.player.addEventListener('waiting', () => { if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass); });
      
      if (els.loopBtn) els.loopBtn.addEventListener('click', JukeboxManager.toggleLoop);

      if (els.moreBtn) {
        els.moreBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          els.wrapper.classList.toggle('open');
        });
      }

      document.addEventListener('click', JukeboxManager.handleGlobalClick);
 // 1. Αποθήκευση της έντασης ΜΟΝΟ αν ο χρήστης την αλλάξει με το χέρι
      els.player.addEventListener('volumechange', (e) => {
         // ΔΙΟΡΘΩΣΗ: Επαναφορά του ελέγχου !STATE.isFading.
         // Το e.isTrusted επιστρέφει true ΚΑΙ στις αλλαγές μέσω JS στο audio.volume!
         if (!STATE.isFading && els.player.volume >= 0 && els.player.volume <= 1) {
             STATE.targetVolume = els.player.volume;
         }
      });
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
      
  // ΜΕΤΑ:
      if (button && button.classList.contains('track-active')) {
          // ΝΕΟ: Αν υπήρξε διακοπή δικτύου, το stream σπάει (error). 
          // Το load() "ανασταίνει" το ραδιόφωνο και το συνδέει ξανά!
          if (els.player.error) els.player.load();
          
          if (els.player.paused) {
             if (els.player.ended) els.player.currentTime = 0;
            // ΑΛΛΑΓΗ: Ρίχνουμε την ένταση στο 0 πριν παίξει, αλλιώς το Fade-In ΔΕΝ θα δουλέψει!
             clearInterval(STATE.fadeInterval);
             STATE.isFading = true;
             
             // ΝΕΟ: Αναβάθμιση του playToken και στην επαναλειτουργία (Resume), για να 
             // μην ακυρωθεί βίαια το Fade-In αν ο χρήστης πατήσει γρήγορα άλλο τραγούδι!
             STATE.playToken++;
             const currentToken = STATE.playToken;

             try { els.player.volume = 0; } catch(e) {}
             
             els.player.play().then(() => {
                 if (currentToken !== STATE.playToken) return;
                 JukeboxManager.fadeAudio(STATE.targetVolume, 600);
             }).catch(()=>{ 
                 if (currentToken !== STATE.playToken) return;
                 STATE.isFading = false;
                 try { els.player.volume = STATE.targetVolume; } catch(e) {}
             });
          } else {
             // ΔΙΟΡΘΩΣΗ: Αν παίζει ήδη, κάνουμε Παύση
             els.player.pause();
             clearInterval(STATE.fadeInterval); // ΑΛΛΑΓΗ: Πρέπει να σκοτώσουμε το φάντασμα interval!
             STATE.isFading = false;
          }
          return;
      }
      
      const executeChange = () => {
        els.player.pause();
        
      // ΔΙΟΡΘΩΣΗ (iOS): Το src μπαίνει απευθείας στο audio, OXI στο <source>!
        els.player.src = url;
        els.player.load();

        // ΝΕΟ: Χρήση textContent αντί για innerHTML για απόλυτη προστασία από σύμβολα < ή >
        if (els.textTarget) els.textTarget.textContent = name;
        if (typeof JukeboxManager.setupMediaSession === 'function') JukeboxManager.setupMediaSession(name);

        clearInterval(STATE.fadeInterval);
        STATE.isFading = true; 
        
        // ΔΙΟΡΘΩΣΗ (Race Condition): Ταυτότητα στην τρέχουσα εντολή
        STATE.playToken++;
        const currentToken = STATE.playToken;

    try { 
            els.player.volume = 0; 
            // ΝΕΟ: Αφαιρούμε τη σίγαση (mute) ώστε το νέο κομμάτι να ακουστεί 
            // σίγουρα, ακόμα κι αν ο χρήστης το είχε κάνει mute νωρίτερα!
            els.player.muted = false;
        } catch(e) {}
        
        els.player.play().then(() => {
          if (currentToken !== STATE.playToken) return; // Ακύρωση αν πατήθηκε άλλο ενδιάμεσα
          JukeboxManager.fadeAudio(STATE.targetVolume, 600); 
       // ΜΕΤΑ:
        }).catch(err => {
          if (currentToken !== STATE.playToken) return; // ΜΗΝ ξεκλειδώνεις αν ανήκει σε παλιό κλικ!

          if (err.name === 'AbortError') {
              // ΑΛΛΑΓΗ: Πρέπει να επαναφέρουμε την ένταση, αλλιώς ο player παγιδεύεται στο 0 (σίγαση)!
              try { els.player.volume = STATE.targetVolume; } catch(e) {}
              STATE.isFading = false; 
              return;
          }

          console.warn("Η αυτόματη αναπαραγωγή μπλοκαρίστηκε.");
          if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
          try { els.player.volume = STATE.targetVolume; } catch(e) {}
          STATE.isFading = false;
        });
        
        document.querySelectorAll('.playlist-btn, .extra-track-btn').forEach(btn => btn.classList.remove('track-active'));
        if (button) button.classList.add('track-active');
      };

      executeChange();
    },

  handleTrackEnd: () => {
      const els = JukeboxManager.dom;

      if (STATE.loopModeIndex === 1) {
        // Λειτουργία 1: "Όλη η λίστα" - Πάμε στο επόμενο
        JukeboxManager.playNextOrPrev(1);
      } else if (STATE.loopModeIndex === 0) {
        // ΝΕΟ: Λειτουργία 0 "Κλειστή" - Το τραγούδι τελείωσε. Το 'pause' δεν πυροδοτείται, άρα κλείνουμε το Visualizer χειροκίνητα!
        if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
      }
    },

handleGlobalClick: (e) => {
      // ΝΕΟ: Αν ο χρήστης μόλις ολοκλήρωσε σύρσιμο (swipe/scroll), αγνοούμε το 'click' του browser!
      const container = document.querySelector('.jukebox-container');
      if (container && container.dataset.hasMoved === 'true') {
          container.dataset.hasMoved = 'false';
          // ΔΙΟΡΘΩΣΗ: Ακυρώνουμε το κλικ ΜΟΝΟ αν προέρχεται μέσα από το ραδιόφωνο. 
          // Έτσι ΔΕΝ σπάμε την πλοήγηση στους υπόλοιπους συνδέσμους (links) του Blog!
          if (container.contains(e.target)) {
              e.preventDefault();
          }
          return;
      }

      const els = JukeboxManager.dom;
      
      // Στοχεύουμε ΑΥΣΤΗΡΑ μόνο τα στοιχεία του Jukebox για να μην σπάσουμε το υπόλοιπο site
     const trackBtn = e.target.closest('.playlist-btn[data-url], .extra-track-btn[data-url]');
      if (trackBtn) {
     const url = trackBtn.dataset.url;
        // ΝΕΟ: Fallback κείμενο αν ξεχαστεί το data-name στο HTML
        const name = trackBtn.dataset.name || trackBtn.textContent.trim() || "Άγνωστο Κομμάτι";
        
        // ΑΛΛΑΓΗ: Αφαιρέθηκε η απαίτηση ύπαρξης του "name" από τον έλεγχο
        if (url && url.trim() !== "" && !url.includes('LINK_')) {
             JukeboxManager.playTrack(trackBtn, url, name);
        }
        
        // ΑΛΛΑΓΗ (Bug 2): Πρέπει να κλείσουμε το μενού αφού επιλέχθηκε τραγούδι!
        if (els.wrapper && els.wrapper.classList.contains('open')) {
            els.wrapper.classList.remove('open');
        }
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

;(() => {
  "use strict";

 // ==========================================
  // 1. CONFIGURATION (Ρυθμίσεις & Δεδομένα)
  // ==========================================
  const CONFIG = { // Προσοχή: Αφαιρέθηκε το Object.freeze
    schedule: [
      { start: "08:15", end: "09:00", name: "1η Διδακτική", type: "class", nextIsBreak: false },
      { start: "09:00", end: "09:40", name: "2η Διδακτική", type: "class", nextIsBreak: true },
      { start: "09:40", end: "10:00", name: "1ο Διάλειμμα", type: "break" },
      { start: "10:00", end: "10:45", name: "3η Διδακτική", type: "class", nextIsBreak: false },
      { start: "10:45", end: "11:30", name: "4η Διδακτική", type: "class", nextIsBreak: true },
      { start: "11:30", end: "11:45", name: "2ο Διάλειμμα", type: "break" },
      { start: "11:45", end: "12:25", name: "5η Διδακτική", type: "class", nextIsBreak: true },
      { start: "12:25", end: "12:35", name: "3ο Διάλειμμα", type: "break" },
      { start: "12:35", end: "13:15", name: "6η Διδακτική", type: "class", nextIsBreak: false }
    ],
    timeThresholds: {
      afternoon: 13 * 60 + 15,
      evening: 17 * 60,
      nightStart: 21,
      nightEnd: 8
    },
    radarMessages: {} // Άδειο αντικείμενο! Θα γεμίσει δυναμικά από το JSON
  };

const STATE = {
    isShowingRadar: false,
    radarTimeout: null,
    usedMessages: {},
    lastMessageIndex: {},
    // --- ΝΕΕΣ ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΤΑ ΕΦΕ ---
   isHovering: false,       // Για το Pause on Hover
    typewriterInterval: null, // Για τη γραφομηχανή
    gyroEnabled: false,
    gyroTicking: false       // [FIX] Κλειδαριά προστασίας για το memory leak του γυροσκοπίου
  };

  const DOM = {
    mainEl: null, subEl: null, progBg: null, progFill: null,
    liveDot: null, trackerTitle: null, trackerBox: null, minimap: null
  };

  const Utils = {
  timeToMins: (timeStr) => {
      // [FIX] Χρήση Regex: Επιτρέπει την ώρα να γραφτεί είτε με ":" είτε με "." και προστατεύει από ολικό κρασάρισμα!
      const [hours, minutes] = timeStr.split(/[:.]/);
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    },

    getHolidayStatus: (now) => {
      const year = now.getFullYear(), month = now.getMonth(), date = now.getDate();

      if (month === 9 && date === 28) return { main: "28η Οκτωβρίου 🇬🇷", sub: "Ζήτω η 28η Οκτωβρίου! Το σχολείο είναι κλειστό." };
      if (month === 10 && date === 17) return { main: "17η Νοεμβρίου 🎗️", sub: "Επέτειος Πολυτεχνείου. Ημέρα μνήμης." };
      if (month === 2 && date === 25) return { main: "25η Μαρτίου 🇬🇷", sub: "Ζήτω η 25η Μαρτίου! Χρόνια Πολλά!" };
      if (month === 4 && date === 1) return { main: "Πρωτομαγιά 🌺", sub: "Καλό μήνα! Το σχολείο είναι κλειστό σήμερα." };

      if ((month === 11 && date >= 24) || (month === 0 && date <= 7)) return { main: "Καλά Χριστούγεννα! 🎄✨", sub: "Καλές γιορτές και ευτυχισμένο το νέο έτος!" };
      if ((month === 5 && date >= 16) || month === 6 || month === 7 || (month === 8 && date <= 10)) return { main: "Καλό Καλοκαίρι! ☀️⛱️", sub: "Ραντεβού τον Σεπτέμβριο! Καλές βουτιές!" };

      const a = year % 19, b = year % 4, c = year % 7;
      const d = (19 * a + 15) % 30, e = (2 * b + 4 * c + 6 * d + 6) % 7;
      let pDay = 22 + d + e + 13, pMonth = 3;
      if (pDay > 31) { pDay -= 31; pMonth = 4; if (pDay > 30) { pDay -= 30; pMonth = 5; } }
      
      // [FIX] Ασφαλής υπολογισμός χωρίς 86400000ms (Αντιμετώπιση Daylight Saving Time)
      const easterStart = new Date(year, pMonth - 1, pDay - 6);
      const easterEnd = new Date(year, pMonth - 1, pDay + 7, 23, 59, 59);

      if (now >= easterStart && now <= easterEnd) {
        return { main: "Καλό Πάσχα! 🐣🌷", sub: "Το σχολείο είναι κλειστό για τις διακοπές του Πάσχα." };
      }

      const cleanMonday = new Date(year, pMonth - 1, pDay - 48);
      if (date === cleanMonday.getDate() && month === cleanMonday.getMonth()) return { main: "Καθαρά Δευτέρα 🪁", sub: "Καλά Κούλουμα! Το σχολείο είναι κλειστό." };

      const holySpirit = new Date(year, pMonth - 1, pDay + 50);
      if (date === holySpirit.getDate() && month === holySpirit.getMonth()) return { main: "Αγίου Πνεύματος 🙏", sub: "Τριήμερο Αγίου Πνεύματος. Το σχολείο είναι κλειστό." };

      return null;
    }
  };

 const AppManager = {
    init: () => {
      // --- ΝΕΟ: Φόρτωση δεδομένων από το JSON στο παρασκήνιο ---
      fetch("https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/live.json")
        .then(response => response.json())
        .then(data => {
          CONFIG.radarMessages = data.radarMessages;
        })
        .catch(error => console.error("Σφάλμα φόρτωσης δεδομένων ραντάρ:", error));
      // --------------------------------------------------------

      DOM.mainEl = document.getElementById("bell-main");
      DOM.subEl = document.getElementById("bell-sub");
      DOM.progBg = document.getElementById("bell-progress-bg");
      DOM.progFill = document.getElementById("bell-progress-fill");
      DOM.liveDot = document.getElementById("liveDot");
      DOM.trackerTitle = document.getElementById("trackerTitle");
      DOM.trackerBox = document.getElementById('bellTracker');
      DOM.minimap = document.getElementById('dayMinimap');
      if (DOM.minimap) AppManager.buildMiniMap();

      if (!DOM.mainEl) return;

      AppManager.startClockSync();

      if (DOM.trackerBox) {
        DOM.trackerBox.style.cursor = 'pointer';
        DOM.trackerBox.addEventListener('click', AppManager.handleRadarTrigger);
        
        // --- ΝΕΟ: Event Listeners για Pause on Hover ---
        DOM.trackerBox.addEventListener('mouseenter', () => STATE.isHovering = true);
        DOM.trackerBox.addEventListener('mouseleave', () => STATE.isHovering = false);
       DOM.trackerBox.addEventListener('touchstart', () => {
            if (STATE.touchTimeout) clearTimeout(STATE.touchTimeout);
            STATE.isHovering = true;
        }, {passive: true});
        DOM.trackerBox.addEventListener('touchend', () => {
            STATE.touchTimeout = setTimeout(() => STATE.isHovering = false, 2000);
        }, {passive: true});
      }

      document.addEventListener('click', AppManager.handleGlobalClick);
    },

    startClockSync: () => {
      AppManager.updateTracker();
      const now = new Date();
      const msUntilNextSec = 1000 - now.getMilliseconds();
      
      setTimeout(() => {
        AppManager.updateTracker();
        // --- ΝΕΟ: Ενημέρωση κάθε 1 ΔΕΥΤΕΡΟΛΕΠΤΟ αντί για 1 λεπτό! ---
        setInterval(AppManager.updateTracker, 1000);
      }, msUntilNextSec);
    },

   updateTracker: () => {
      if (STATE.isShowingRadar) return;

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const currentSecs = now.getSeconds(); // --- ΝΕΟ: Παίρνουμε και τα δευτερόλεπτα ---
      const totalCurrentSecs = currentMins * 60 + currentSecs; // Συνολικά δευτερόλεπτα ημέρας
      const day = now.getDay();
      if (DOM.trackerBox) {
          const schoolStartSecs = Utils.timeToMins(CONFIG.schedule[0].start) * 60;
          const schoolEndSecs = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end) * 60;
          
          let progress = 0;
          if (totalCurrentSecs >= schoolEndSecs) {
              progress = 1; // 100% (Απόγευμα/Σχόλασμα)
          } else if (totalCurrentSecs > schoolStartSecs) {
              progress = (totalCurrentSecs - schoolStartSecs) / (schoolEndSecs - schoolStartSecs);
          }
          
          // Μαθηματική παρεμβολή από Ψυχρό Λευκό (245,250,255) σε Θερμό Amber (255,220,180)
          const r = Math.round(245 + (10 * progress));
          const g = Math.round(250 - (30 * progress));
          const b = Math.round(255 - (75 * progress));
          
          // Στέλνουμε τη νέα θερμοκρασία στο CSS
          DOM.trackerBox.style.setProperty('--circadian-rgb', `${r}, ${g}, ${b}`);
      }
      DOM.subEl.style.color = "";
      DOM.progBg.style.display = "none";
      DOM.liveDot.classList.remove("paused");
      DOM.trackerTitle.innerHTML = "Live Ωράριο";
      DOM.progFill.className = "bell-progress-fill"; // Καθαρίζουμε τα προηγούμενα χρώματα
   

      const holiday = Utils.getHolidayStatus(now);
      if (holiday) {
        DOM.mainEl.innerHTML = holiday.main;
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = holiday.sub;
        DOM.liveDot.classList.add("paused");
        DOM.trackerTitle.innerHTML = "Σχολική Αργία";
        if (DOM.minimap) DOM.minimap.style.display = "none";
        return;
      }
      
      if (day === 0 || day === 6) {
        DOM.mainEl.innerHTML = "Καλό Σαββατοκύριακο!";
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = "Το σχολείο είναι κλειστό.";
        DOM.liveDot.classList.add("paused");
        if (DOM.minimap) DOM.minimap.style.display = "none";
        return;
      }
if (DOM.minimap) DOM.minimap.style.display = "flex";
      AppManager.updateMiniMap(totalCurrentSecs);
      const schoolStartSecs = Utils.timeToMins(CONFIG.schedule[0].start) * 60;
      const schoolEndSecs = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end) * 60;

      if (totalCurrentSecs < schoolStartSecs) {
        DOM.mainEl.innerHTML = "Καλημέρα!";
        DOM.mainEl.style.color = "#2c3e50";
        const diffSecs = schoolStartSecs - totalCurrentSecs;
        
    // --- ΝΕΟ: Δευτερόλεπτα το πρωί! ---
        if (diffSecs <= 60) {
            const secWord = diffSecs === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα';
            DOM.subEl.innerHTML = `Το κουδούνι χτυπάει σε <span style="color:#e74c3c; font-weight:bold;">${diffSecs} ${secWord}!</span>`;
        } else {
            DOM.subEl.innerHTML = `Το κουδούνι χτυπάει σε ${Math.ceil(diffSecs / 60)} λεπτά.`;
        }
        return;
      }
      if (totalCurrentSecs >= schoolEndSecs) {
        DOM.mainEl.innerHTML = "Σχόλασμα!";
        DOM.mainEl.style.color = "rgba(17, 17, 17, 0.68)";
        DOM.subEl.innerHTML = "Τα μαθήματα ολοκληρώθηκαν για σήμερα.";
        return;
      }

      for (let i = 0; i < CONFIG.schedule.length; i++) {
        const periodStartSecs = Utils.timeToMins(CONFIG.schedule[i].start) * 60;
        const periodEndSecs = Utils.timeToMins(CONFIG.schedule[i].end) * 60;

        if (totalCurrentSecs >= periodStartSecs && totalCurrentSecs < periodEndSecs) {
          DOM.mainEl.innerHTML = `Τρέχουσα: ${CONFIG.schedule[i].name}`;
          DOM.mainEl.style.color = "#2c3e50";
          
          const secsLeft = periodEndSecs - totalCurrentSecs;
          const minsLeft = Math.ceil(secsLeft / 60);
          
        // --- ΝΕΟ: Αντίστροφη μέτρηση με δευτερόλεπτα την ώρα του μαθήματος! ---
          let timeMsg = "";
          if (secsLeft <= 60) {
              const secWord = secsLeft === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα';
              timeMsg = `σε <span style="color:#e74c3c; font-weight:bold;">${secsLeft} ${secWord}!</span>`;
          } else {
              timeMsg = `σε ${minsLeft} λεπτά`;
          }
          
          if (CONFIG.schedule[i].type === "class") {
              if (i === CONFIG.schedule.length - 1) DOM.subEl.innerHTML = `Σχόλασμα ${timeMsg}`;
              else if (CONFIG.schedule[i].nextIsBreak) DOM.subEl.innerHTML = `Το διάλειμμα ξεκινά ${timeMsg}`;
              else DOM.subEl.innerHTML = `Η επόμενη ώρα ξεκινά ${timeMsg}`;
          } else {
              DOM.subEl.innerHTML = `Μπαίνουμε στις τάξεις ${timeMsg}`;
          }
          
          const percentage = ((totalCurrentSecs - periodStartSecs) / (periodEndSecs - periodStartSecs)) * 100;
          DOM.progBg.style.display = "block";
          
          // --- ΝΕΟ: Χρωματική Αγωνία Μπάρας ---
          if (secsLeft <= 300) { // Τελευταία 5 λεπτά
              DOM.progFill.classList.add("danger");
          } else if (percentage >= 50) {
              DOM.progFill.classList.add("warning");
          } else {
              DOM.progFill.classList.add("safe");
          }

          window.requestAnimationFrame(() => {
              DOM.progFill.style.width = `${percentage}%`;
          });
          return;
        }
      }
    },
    // --- ΝΕΟ: Χτίσιμο του Mini-Map 1 φορά στην αρχή ---
    buildMiniMap: () => {
      if (!DOM.minimap) return;
      DOM.minimap.innerHTML = '';
      
      CONFIG.schedule.forEach(slot => {
        const seg = document.createElement('div');
        
        // Ξεκινάνε όλα ως "future". Αν είναι διάλειμμα, παίρνει και την κλάση "break"
        seg.className = `minimap-segment future ${slot.type === 'break' ? 'break' : ''}`;
        
        // ΜΑΓΕΙΑ (Flex-Grow): Το πλάτος της γραμμής είναι αναλογικό της διάρκειας των λεπτών!
        const duration = Utils.timeToMins(slot.end) - Utils.timeToMins(slot.start);
        seg.style.flexGrow = duration; 
        
        DOM.minimap.appendChild(seg);
      });
    },

    // --- ΝΕΟ: Ενημέρωση χρωμάτων του Mini-Map ---
    updateMiniMap: (totalCurrentSecs) => {
      if (!DOM.minimap || DOM.minimap.children.length === 0) return;

      Array.from(DOM.minimap.children).forEach((seg, index) => {
        const slot = CONFIG.schedule[index];
        const startSecs = Utils.timeToMins(slot.start) * 60;
        const endSecs = Utils.timeToMins(slot.end) * 60;

        // Κρατάμε τη βάση (αν είναι break ή όχι)
        const baseClass = `minimap-segment ${slot.type === 'break' ? 'break' : ''}`;

        // Αλλάζουμε το State
        if (totalCurrentSecs >= endSecs) {
          seg.className = `${baseClass} past`;
        } else if (totalCurrentSecs >= startSecs && totalCurrentSecs < endSecs) {
          seg.className = `${baseClass} current`;
        } else {
          seg.className = `${baseClass} future`;
        }
      });
    }, // <--- ΜΗΝ ξεχάσεις το κόμμα εδώ στο τέλος!
    initGyro: async () => {
      if (STATE.gyroEnabled || !window.DeviceOrientationEvent) return;

      const startListening = () => {
        window.addEventListener('deviceorientation', AppManager.handleGyro);
        STATE.gyroEnabled = true;
      };

     // iOS 13+ απαιτεί ρητή άδεια με Promise (Ασφαλής έλεγχος για αποφυγή ReferenceError σε PC)
      if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') startListening();
        } catch (e) {
          console.warn("Δεν δόθηκε άδεια γυροσκοπίου (απαιτείται HTTPS).");
        }
      } else {
        // Android / Παλαιότερα iOS
        startListening();
      }
    },

    handleGyro: (event) => {
      if (!DOM.progFill) return;
      
      let gamma = event.gamma; // Κλίση αριστερά-δεξιά (-90 έως 90)
      if (gamma === null) return; // Για Desktop (αγνοείται)

      // "Κόφτης": Δεν θέλουμε να "χυθεί" εκτός οθόνης αν το γυρίσει ανάποδα (max 30 μοίρες)
      gamma = Math.max(-30, Math.min(30, gamma));
      
      // Βαρύτητα: Γέρνουμε ανάποδα (-) από την κλίση της συσκευής
      const tilt = (gamma * -0.6).toFixed(1);

    // [FIX] Αληθινή βελτιστοποίηση με Throttling. Αποτρέπει την υπερθέρμανση της συσκευής στα 120Hz!
      if (!STATE.gyroTicking) {
          STATE.gyroTicking = true;
          window.requestAnimationFrame(() => {
              DOM.progFill.style.setProperty('--gyro-tilt', `${tilt}deg`);
              STATE.gyroTicking = false; // Απελευθερώνει την κλειδαριά ΜΟΝΟ όταν το frame όντως ζωγραφιστεί στην οθόνη
          });
      }
    },

   handleRadarTrigger: (e) => {
      e.stopPropagation();
      
      // --- ΠΡΟΣΘΗΚΗ ΔΟΝΗΣΗΣ ΓΙΑ ΤΟ ΡΑΝΤΑΡ ---
      if (navigator.vibrate) navigator.vibrate(15); 
     AppManager.initGyro();
      
      // Αν το ραντάρ είναι ήδη ανοιχτό και σαρώνει το λέιζερ, αγνόησε το κλικ
      if (DOM.trackerBox && DOM.trackerBox.querySelector('.radar-sweep-line')) return;

      // Αν είναι ήδη ανοιχτό, καθαρίζουμε τα προηγούμενα για να βγάλει νέο μήνυμα
      if (STATE.isShowingRadar) {
          clearTimeout(STATE.radarTimeout);
          clearInterval(STATE.typewriterInterval);
      }

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const hour = now.getHours();
      const day = now.getDay();
      
      let catName = 'class';
      if (Utils.getHolidayStatus(now)) catName = 'holiday';
      else if (day === 0 || day === 6) catName = 'weekend';
      else if (hour >= CONFIG.timeThresholds.nightStart || hour < CONFIG.timeThresholds.nightEnd) catName = 'night';
    else if (currentMins >= CONFIG.timeThresholds.evening) catName = 'evening';
      // [FIX] Δυναμικός έλεγχος: Το απόγευμα δεν ξεκινάει ποτέ αν δεν έχει τελειώσει η τελευταία ώρα του πίνακα schedule
      else if (currentMins >= Math.max(CONFIG.timeThresholds.afternoon, Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end))) catName = 'afternoon';
      else {
          let currentType = 'break'; // [FIX] Πριν χτυπήσει το πρωινό κουδούνι, θεωρούμε ότι είμαστε στην αυλή!
          for (let i = 0; i < CONFIG.schedule.length; i++) {
              if (currentMins >= Utils.timeToMins(CONFIG.schedule[i].start) && currentMins < Utils.timeToMins(CONFIG.schedule[i].end)) {
                  currentType = CONFIG.schedule[i].type;
                  break;
              }
          }
          catName = (currentType === 'break') ? 'break' : 'class';
      }

      const activeArray = CONFIG.radarMessages[catName] || ["Σσσς! Το ραντάρ ξεκουράζεται."];
      if (activeArray.length === 0) activeArray.push("Σσσς! Το ραντάρ ξεκουράζεται."); 
      
      if (!STATE.usedMessages[catName]) STATE.usedMessages[catName] = [];
      
     if (STATE.usedMessages[catName].length >= activeArray.length) {
          // [FIX] Αν υπάρχει μόνο 1 μήνυμα, καθαρίζουμε εντελώς το ιστορικό για να μην γίνει undefined το randomIndex και κρασάρει
          STATE.usedMessages[catName] = (activeArray.length > 1 && STATE.lastMessageIndex[catName] !== undefined) 
              ? [STATE.lastMessageIndex[catName]] 
              : [];
      }
      
      const availableIndexes = activeArray.map((_, i) => i).filter(i => !STATE.usedMessages[catName].includes(i));
      // [FIX] Ασφαλής επιλογή ακόμα και αν το διαθέσιμο array μείνει πρακτικά άδειο
      const randomIndex = availableIndexes.length > 0 ? availableIndexes[Math.floor(Math.random() * availableIndexes.length)] : 0;
      
      STATE.usedMessages[catName].push(randomIndex);
      STATE.lastMessageIndex[catName] = randomIndex;
      const targetMessage = activeArray[randomIndex];
      
      STATE.isShowingRadar = true;

      // --- ΝΕΟ: Εφέ Σάρωσης (Radar Sweep) ---
      let sweepLine = document.createElement("div");
      sweepLine.className = "radar-sweep-line";
      if (DOM.trackerBox) DOM.trackerBox.appendChild(sweepLine);

      DOM.mainEl.innerHTML = "📡 Ανίχνευση...";
      DOM.mainEl.style.color = "#2ecc71"; // Πράσινο της σάρωσης
      DOM.subEl.innerHTML = "Συντονισμός...";
      DOM.subEl.style.color = "rgba(17, 17, 17, 0.68)"; 

      // Περιμένουμε 1.2s για να τελειώσει το Sweep Laser και μετά πετάμε το μήνυμα
      setTimeout(() => {
          if (sweepLine.parentNode) sweepLine.remove(); // Διαγράφουμε το λέιζερ
          if (!STATE.isShowingRadar) return; // Αν έχει κλείσει εν τω μεταξύ
          
          DOM.mainEl.innerHTML = "🎯 Στόχος εντοπίστηκε!";
          DOM.mainEl.style.color = "#a90e0e";
          DOM.subEl.style.color = "#1e6cff"; 
          
         // --- ΝΕΟ: Εφέ Γραφομηχανής (Typewriter) ---
          DOM.subEl.innerHTML = '<span class="typewriter-cursor"></span>';
          
       let charIndex = 0;
          
          // [FIX] Ασφαλής χρήση Intl.Segmenter με Fallback προστασία. Αποτρέπει το "Ολικό Πάγωμα" 
          // του Widget σε παλαιότερα κινητά (π.χ. iOS < 16.4) ή browsers (Firefox < 125).
          let msgChars;
          if (window.Intl && typeof Intl.Segmenter === 'function') {
              const segmenter = new Intl.Segmenter('el', { granularity: 'grapheme' });
              msgChars = Array.from(segmenter.segment(targetMessage)).map(s => s.segment);
          } else {
              // Ασφαλής εναλλακτική για παλιές συσκευές ώστε να μην κρασάρει η εφαρμογή
              msgChars = Array.from(targetMessage); 
          }
          
          STATE.typewriterInterval = setInterval(() => {
              if (charIndex < msgChars.length) {
                  DOM.subEl.innerHTML = msgChars.slice(0, charIndex + 1).join('') + '<span class="typewriter-cursor"></span>';
                  charIndex++;
              } else {
                  clearInterval(STATE.typewriterInterval);
                  DOM.subEl.innerHTML = targetMessage; // Αφαιρεί τον κέρσορα
                  
                  // --- ΝΕΟ: Pause on Hover (Έλεγχος αν το ποντίκι είναι πάνω) ---
                  const checkHoverAndClose = () => {
                      if (STATE.isHovering) {
                          STATE.radarTimeout = setTimeout(checkHoverAndClose, 1000); // Ξανατσέκαρε σε 1 sec
                      } else {
                          STATE.isShowingRadar = false;
                          AppManager.updateTracker();
                      }
                  };
                  
                  STATE.radarTimeout = setTimeout(checkHoverAndClose, 7000);
              }
          }, 35); // Ταχύτητα πληκτρολόγησης

      }, 1200);
    },

    handleGlobalClick: (e) => {
      if (STATE.isShowingRadar && (!DOM.trackerBox || !DOM.trackerBox.contains(e.target))) {
        clearTimeout(STATE.radarTimeout);
        clearInterval(STATE.typewriterInterval);
        
        // Καθαρισμός γραμμής σάρωσης αν υπάρχει
        const sweep = DOM.trackerBox ? DOM.trackerBox.querySelector('.radar-sweep-line') : null;
        if (sweep) sweep.remove();

        STATE.isShowingRadar = false;
        AppManager.updateTracker();
      }
    }
  };

  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", AppManager.init);
  } else {
      AppManager.init();
  }
})();

;(() => {
  "use strict";
const CONFIG = Object.freeze({
    maxBasePosts: 15,
    targetDate: new Date("2021-09-11T00:00:00Z"),
    autoSlideIntervalMs: 3000, 
    animLockMs: 500,
    
    feedPopularUrl: "/feeds/posts/default/-/" + encodeURIComponent("δημοφιλή") + "?alt=json&max-results=15",
  feedLabelsUrl: "/feeds/posts/default/-/" + "Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι|Γενικά".split('|').map(encodeURIComponent).join('|') + "?alt=json&max-results=50",
    
    safeImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdYTGP-KF_2ZHc7ykgjO533JVSDXYPsg36Oi3XC0Z6UN-yEKAhpbsK5PME3r9Q_WeAXn-c20sWAmLR65slEVQSaYaDVKLuYQtaqbjuGyH71VxJxgZqWx5vG1JSCOFlqWswSphTn6Zup1d8Uz9Ie2Tq9CQeHmWBPusLJ7rc_bPJkiau4W47iSy6cSp60N4/s800/Gemini_Generated_Image_1itzx51itzx51itz.png"
    // (Τα στατικά IDs διαγράφηκαν γιατί τα βρίσκει αυτόματα!)
  });

  const DATA = Object.freeze({
    candidatePostsFor16: [
      { title: "Τα όρια δεν είναι φράχτες", link: "https://dimperist.blogspot.com/p/blog-page_8.html", image: "" },
    { title: "Αόρατος γονιός", link: "https://dimperist.blogspot.com/p/blog-page_1.html", image: "" },
    { title: "Πώς θα μεγαλώσουμε αυτόνομα και ανεξάρτητα παιδιά", link: "https://dimperist.blogspot.com/p/blog-page_13.html", image: "" },
    { title: "Τρόποι μείωσης της χρήσης οθονών από τα παιδιά", link: "https://dimperist.blogspot.com/p/blog-page.html", image: "" },
    { title: "10 τρόποι για να εκτιμά το παιδί τον εαυτό του", link: "https://dimperist.blogspot.com/p/10.html", image: "" },
    { title: "Τι κάνω όταν το παιδί μου θυμώνει;", link: "https://dimperist.blogspot.com/p/blog-page_86.html", image: "" },
    { title: "Παιδικές φοβίες: Αιτίες και Τρόποι Αντιμετώπισης", link: "https://dimperist.blogspot.com/p/blog-page_32.html", image: "" },
    { title: "Συναισθηματική ανάπτυξη & \"αρνητικά\" συναισθήματα", link: "https://dimperist.blogspot.com/p/blog-page_43.html", image: "" },
    { title: "Γράμμα παιδιού", link: "https://dimperist.blogspot.com/p/blog-page_71.html", image: "" },
    { title: "Το παιδί μου αντιμιλά, τι να κάνω;", link: "https://dimperist.blogspot.com/p/blog-page_98.html", image: "" },
    { title: "10 Συμβουλές για να αγαπήσουν τα «πρωτάκια» το σχολείο", link: "https://dimperist.blogspot.com/p/10_19.html", image: "" },
    { title: "Συμβουλές για καλύτερη επιστροφή στο σχολείο", link: "https://dimperist.blogspot.com/p/blog-page_19.html", image: "" },
    { title: "Οργάνωση μελέτης του παιδιού", link: "https://dimperist.blogspot.com/p/blog-page_20.html", image: "" },
    { title: "Πώς να κάνουν τα παιδιά να αγαπήσουν τα βιβλία", link: "https://dimperist.blogspot.com/p/blog-page_29.html", image: "" },
    { title: "Τι ΝΑ κάνετε και τι να ΜΗΝ κάνετε με το διάβασμα", link: "https://dimperist.blogspot.com/p/blog-page_64.html", image: "" },
    { title: "Bullying - Σχολικός Εκφοβισμός", link: "https://dimperist.blogspot.com/p/bullying.html", image: "" },
    { title: "Παιδική παχυσαρκία: Πρόληψη και σωστές διατροφικές συνήθειες", link: "https://dimperist.blogspot.com/p/blog-page_85.html", image: "" },
{ title: "Η άσκηση ως τρόπος ζωής", link: "https://dimperist.blogspot.com/2026/01/blog-post_14.html", image: "" },
{ title: "Ανακαλύψετε το σωστό άθλημα για το παιδί σας", link: "https://dimperist.blogspot.com/2026/02/blog-post_5.html", image: "" },
{ title: "Προστατεύομαι από τους σεισμούς", link: "https://dimperist.blogspot.com/p/blog-page_59.html", image: "" },
    { title: "Ενθαρρύνουμε τη δημιουργικότητα των παιδιών", link: "https://dimperist.blogspot.com/p/blog-page_41.html", image: "" },
    { title: "Η σημασία του παιχνιδιού στην ανάπτυξη", link: "https://dimperist.blogspot.com/p/blog-page_83.html", image: "" },
    { title: "Δραστηριότητες που αναπτύσσουν τις μαθησιακές δεξιότητες", link: "https://dimperist.blogspot.com/p/blog-page_56.html", image: "" }
    ]
  });

 const STATE = {
    sliderPosts: []
  };

  // ==========================================
  // 3. UTILITIES (Εργαλεία)
  // ==========================================
  const Utils = {
    extractMedia: (entry) => {
     let imageUrl = "";
      let isVideo = false;
      // Έλεγχος και στο summary για συμβατότητα με ιστολόγια που χρησιμοποιούν "Σύντομη Ροή"
      const content = (entry.content && entry.content.$t) ? entry.content.$t : (entry.summary && entry.summary.$t ? entry.summary.$t : "");

      try {
  // Προσθήκη υποστήριξης για το youtube-nocookie.com (που χρησιμοποιούν τα σχολεία λόγω GDPR)
       const ytRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:shorts\/|[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        const ytMatch = content.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
          return { imageUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`, isVideo: true };
        }

      // Καλύπτει διπλά (") και μονά (') εισαγωγικά, τα οποία συχνά προκύπτουν από αντιγραφή-επικόλληση
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
        const imgMatch = content.match(imgRegex);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
         if (imageUrl.includes("blogger.googleusercontent.com") || imageUrl.includes("bp.blogspot.com")) {
            // Καλύπτει και τα σύγχρονα formats της Google (π.χ. =s320)
            imageUrl = imageUrl.replace(/\/s[0-9]+(-b|-c|-w)?\//, '/s800/').replace(/=(?:w[0-9]+-h[0-9]+|s[0-9]+)(-c)?/, '=s800');
          }
          return { imageUrl, isVideo: false };
        }

      if (entry.media$thumbnail && entry.media$thumbnail.url) {
          // Καλύπτει και τα σύγχρονα formats μεγεθών της Google (π.χ. =w72-h72) για αποφυγή θολών εικόνων
          imageUrl = entry.media$thumbnail.url.replace(/\/s[0-9]+(-b|-c|-w)?\//, '/s800/').replace(/=(?:w[0-9]+-h[0-9]+|s[0-9]+)[a-z0-9-]*/i, '=s800');
          return { imageUrl, isVideo: false };
        }
      } catch (err) {}

      return { imageUrl: CONFIG.safeImage, isVideo: false };
    },

    getLink: (entry) => {
      const linkObj = entry.link.find(l => l.rel === "alternate");
      // [FIX] Αποτροπή απότομου άλματος στην κορυφή της σελίδας
      return linkObj ? linkObj.href : "javascript:void(0)"; 
    }
  };

 // ==========================================
  // 4. API MANAGER (Σύγχρονες Κλήσεις Δεδομένων)
  // ==========================================
  const ApiManager = {
    fetchData: async () => {
     try {
        const [popularRes, labelsRes] = await Promise.all([
          fetch(CONFIG.feedPopularUrl).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(CONFIG.feedLabelsUrl).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

       if (popularRes) ApiManager.processPopularPosts(popularRes);
        ApiManager.processWeeklyPick(labelsRes);
        
        // Η Έξυπνη Λούπα: Βρίσκει ταυτόχρονα το Desktop και το Mobile HTML!
        ["-desktop", "-mobile"].forEach(suffix => SliderManager.buildWidget(suffix));
        
      } catch (error) {
        ["-desktop", "-mobile"].forEach(suffix => {
          const container = document.getElementById(`slider-content${suffix}`);
          if (container) container.innerHTML = "<p style='text-align:center; padding:20px; color:#a90e0e;'>Σφάλμα φόρτωσης αναρτήσεων.</p>";
        });
      }
    },

   processPopularPosts: (json) => {
      // Ασφαλής ανάγνωση για να μην κρασάρει αν το json ή το feed λείπουν
      const entries = (json && json.feed && json.feed.entry) ? json.feed.entry : [];
      for (const entry of entries) {
        if (STATE.sliderPosts.length >= CONFIG.maxBasePosts) break;
        
        const publishedDate = new Date(entry.published.$t);
        if (publishedDate >= CONFIG.targetDate) {
          const media = Utils.extractMedia(entry);
          STATE.sliderPosts.push({
            title: entry.title.$t,
            link: Utils.getLink(entry),
            image: media.imageUrl,
            isVideo: media.isVideo
          });
        }
      }
    },

processWeeklyPick: (json) => {
      let candidates = [...DATA.candidatePostsFor16];
      // Ασφαλής ανάγνωση αν το API αποτύχει
      const entries = (json && json.feed && json.feed.entry) ? json.feed.entry : [];
      entries.forEach(entry => {
        const media = Utils.extractMedia(entry);
        candidates.push({
          title: entry.title.$t,
          link: Utils.getLink(entry),
          image: media.imageUrl,
          isVideo: media.isVideo
        });
      });

   const weekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
      const weeklyPick = candidates[weekNum % candidates.length];

      const weeklyPostObj = {
        title: "⭐ " + weeklyPick.title,
        link: weeklyPick.link,
        image: weeklyPick.image || CONFIG.safeImage,
        isVideo: weeklyPick.isVideo || false
      };

    // Εναρμόνιση των ορίων με τη ρύθμιση CONFIG.maxBasePosts, καταργώντας τους στατικούς αριθμούς
      const targetIndex = Math.min(CONFIG.maxBasePosts, STATE.sliderPosts.length);
      STATE.sliderPosts.splice(targetIndex, 0, weeklyPostObj);

      if (STATE.sliderPosts.length > CONFIG.maxBasePosts + 1) {
        STATE.sliderPosts = STATE.sliderPosts.slice(0, CONFIG.maxBasePosts + 1);
      }
    }
  };

 // ==========================================
  // 5. SLIDER MANAGER (UI & DOM - Universal)
  // ==========================================
  const SliderManager = {
    buildWidget: (suffix) => {
      // Στοχεύει δυναμικά το -desktop ή το -mobile
      const container = document.getElementById(`slider-content${suffix}`);
      const wrapper = document.getElementById(`custom-post-slider${suffix}`);
      if (!container || !wrapper) return; // Αν δεν το βρει, πάει στο επόμενο!

      const arrowPrev = wrapper.querySelector('.arrow-prev');
      const arrowNext = wrapper.querySelector('.arrow-next');

      if (STATE.sliderPosts.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις.</p>";
        if (arrowPrev) arrowPrev.classList.add('hidden-arrow');
        if (arrowNext) arrowNext.classList.add('hidden-arrow');
        return;
      }

      const fragment = document.createDocumentFragment();

      STATE.sliderPosts.forEach((post, index) => {
        const slide = document.createElement('div');
        slide.className = `slide-item ${index === 0 ? "active" : ""}`;
        
        // 1. Lazy loading στις κρυφές διαφάνειες
        const loadingAttr = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
        const videoBadge = post.isVideo ? `<div class="video-badge">&#9654;</div>` : "";
        

        const safeTitle = post.title
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        slide.innerHTML = `
          <a href="${post.link}" class="slide-link">
            ${videoBadge}
            <div class="slide-counter">${index + 1} / ${STATE.sliderPosts.length}</div>
          <img src="${post.image}" alt="${safeTitle}" onerror="this.onerror=null; this.src='${CONFIG.safeImage}';" ${loadingAttr}>
            <div class="slide-title-wrapper">
              <div class="slide-title">${safeTitle}</div>
            </div>
          </a>
        `;
        fragment.appendChild(slide);
      });

      container.innerHTML = "";
      container.appendChild(fragment);

    const localState = {
        currentIndex: 0,
        autoSlideTimer: null,
        isAnimating: false,
        touchStartX: 0,
        touchStartY: 0,    // ΝΕΟ: Για τον έλεγχο κάθετου scroll
        isSwiping: false,  // ΝΕΟ: Για αποτροπή του αθέλητου κλικ (Bug 2)
        isHovered: false   // ΝΕΟ: Για το Bug 4 (παρακάτω)
      };

      const showSlide = (index) => {
        const slides = wrapper.querySelectorAll('.slide-item');
        if (slides.length === 0) return;

        slides.forEach(slide => slide.classList.remove("active"));

        if (index >= STATE.sliderPosts.length) localState.currentIndex = 0;
        else if (index < 0) localState.currentIndex = STATE.sliderPosts.length - 1;
        else localState.currentIndex = index;

        slides[localState.currentIndex].classList.add("active");
      };

      const moveSlide = (step) => {
        if (localState.isAnimating) return;
        localState.isAnimating = true;

        showSlide(localState.currentIndex + step);
        resetAutoSlide();

        setTimeout(() => { localState.isAnimating = false; }, CONFIG.animLockMs);
      };

      const startAutoSlide = () => {
        clearInterval(localState.autoSlideTimer);
        localState.autoSlideTimer = setInterval(() => { moveSlide(1); }, CONFIG.autoSlideIntervalMs);
      };

    const resetAutoSlide = () => {
        clearInterval(localState.autoSlideTimer);
        // Ξεκινάει ΞΑΝΑ το auto-slide ΜΟΝΟ αν το ποντίκι ΔΕΝ είναι πάνω στο slider
        if (STATE.sliderPosts.length > 1 && !localState.isHovered) startAutoSlide();
      };

    if (STATE.sliderPosts.length > 1) {
        // Κλειδώνει την περιοχή για να αποτρέψει το "Go Back" gesture των κινητών κατά το swipe του slider
        wrapper.style.touchAction = "pan-y";
        
        if (arrowPrev) {
          arrowPrev.classList.remove('hidden-arrow');
          arrowPrev.onclick = (e) => { e.preventDefault(); moveSlide(-1); }; // Αντικατάσταση event listener με onclick
        }
        if (arrowNext) {
          arrowNext.classList.remove('hidden-arrow');
          arrowNext.onclick = (e) => { e.preventDefault(); moveSlide(1); };  // Αντικατάσταση event listener με onclick
        }
        
        startAutoSlide();

      // Εκτέλεση των συμβάντων hover ΜΟΝΟ σε συσκευές με ποντίκι, αποτρέποντας το πάγωμα σε οθόνες αφής
        if (window.matchMedia("(hover: hover)").matches) {
          wrapper.addEventListener("mouseenter", () => {
            localState.isHovered = true;
            clearInterval(localState.autoSlideTimer);
          }, { passive: true });
          
          wrapper.addEventListener("mouseleave", () => {
            localState.isHovered = false;
            resetAutoSlide();
          }, { passive: true });
        }
        
       wrapper.addEventListener("touchstart", (e) => {
          clearInterval(localState.autoSlideTimer);
          localState.touchStartX = e.changedTouches[0].screenX;
          localState.touchStartY = e.changedTouches[0].screenY;
          localState.isSwiping = false; // Μηδενισμός σε κάθε άγγιγμα
        }, { passive: true });

       wrapper.addEventListener("touchend", (e) => {
          const diffX = localState.touchStartX - e.changedTouches[0].screenX;
          const diffY = localState.touchStartY - e.changedTouches[0].screenY;
          
        // Αποτροπή ακούσιας αλλαγής διαφάνειας κατά το λοξό/πλάγιο κάθετο σκρολάρισμα της σελίδας
          if (Math.abs(diffX) > Math.abs(diffY) * 2 && Math.abs(diffX) > 40) {
            localState.isSwiping = true;
            
        // ΝΕΟ: Αυξημένος χρόνος (400ms) για να καλύψει σίγουρα την καθυστέρηση εικονικού κλικ (ghost click) των κινητών
            setTimeout(() => { localState.isSwiping = false; }, 400);
            if (diffX > 0) moveSlide(1);    
            else moveSlide(-1); 
          }
      resetAutoSlide();
        }, { passive: true });

        // ΝΕΟ FIX: Ξεπαγώνει την αυτόματη εναλλαγή όταν ο browser ακυρώνει την αφή (π.χ. κάθετο σκρολάρισμα)
        wrapper.addEventListener("touchcancel", () => {
          localState.isSwiping = false;
          resetAutoSlide();
        }, { passive: true });

        // FIX Bug 2: Ακύρωση του link (κλικ) αν ο χρήστης μόλις έκανε swipe
        wrapper.addEventListener("click", (e) => {
          if (localState.isSwiping) {
            e.preventDefault();
            localState.isSwiping = false;
          }
        });
      } else {
        if (arrowPrev) arrowPrev.classList.add('hidden-arrow');
        if (arrowNext) arrowNext.classList.add('hidden-arrow');
      }
    }
  };

  // ==========================================
  // 6. ΕΚΚΙΝΗΣΗ
  // ==========================================
 if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ApiManager.fetchData);
  } else {
      ApiManager.fetchData(); // Αν η σελίδα έχει ήδη φορτώσει, ξεκίνα αμέσως!
  }

})();


;(() => {
    "use strict";

   const CONFIG = Object.freeze({
        messageDelay: 7000,
        storageKey: "holidayShownMsgs", // Κοινό κλειδί αποθήκευσης και για τα 2!
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/diakopeka.json'
    });

    // Το DOM πλέον έχει δύο θήκες για να βρει και το κινητό και το PC
    const DOM = { mobile: null, pc: null };
const DataEngine = {
        // ΝΕΟ: Εφεδρικό μήνυμα εξαρχής, για να μην υπάρχει ποτέ "νεκρό κλικ" 
        // όσο περιμένουμε να κατέβει το JSON από τον server.
        messagesArray: ["Μείνε προσηλωμένος στον στόχο σου. Οι διακοπές είναι η ανταμοιβή σου! 🏖️"],
        fetchMessages: async () => {
          try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Bad response"); // Σπρώχνει τα 404/500 errors στο catch
                const data = await response.json();
                
                // Αποτροπή άδειου Array: Αντικαθιστά το εφεδρικό ΜΟΝΟ αν όντως υπάρχουν μηνύματα!
                if (data && data.messages && data.messages.length > 0) {
                    DataEngine.messagesArray = data.messages;
                }
            } catch (e) {
                console.warn("Το JSON με τα μηνύματα δεν φόρτωσε.");
                // Αν πέσει το ίντερνετ, ας δείχνει έστω ένα προεπιλεγμένο μήνυμα:
                DataEngine.messagesArray = ["Μείνε προσηλωμένος στον στόχο σου. Οι διακοπές είναι η ανταμοιβή σου! 🏖️"]; 
            }
        }
    };
    const Utils = {
        getOrthodoxEaster: (year) => {
            const a = year % 19, b = year % 4, c = year % 7;
            const d = (19 * a + 15) % 30;
            const e = (2 * b + 4 * c + 6 * d + 6) % 7;
            const date = new Date(year, 2, 22);
            date.setDate(date.getDate() + (d + e + 13));
            return date;
        },
        getDayOfYear: (dateObj) => {
            const start = new Date(dateObj.getFullYear(), 0, 0);
            const diff = dateObj - start + (start.getTimezoneOffset() - dateObj.getTimezoneOffset()) * 60000;
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        },
        safeStorageGet: (key) => {
            try { return JSON.parse(sessionStorage.getItem(key)) || []; } 
            catch (e) { return []; }
        },
        safeStorageSet: (key, val) => {
            try { sessionStorage.setItem(key, JSON.stringify(val)); } 
            catch (e) {}
        },
      // --- ΝΕΟ 1: Εκθετική Καμπύλη Κούρασης (Bezier) ---
        getBurnoutCurve: (currentDay, startDay, totalDays, startLevel, endLevel) => {
            // Υπολογίζουμε πόσο % της σχολικής περιόδου έχει περάσει (από 0.0 έως 1.0)
            let progress = Math.max(0, Math.min(1, (currentDay - startDay) / totalDays));
            
            // Εδώ γίνεται η μαγεία: Υψώνουμε την πρόοδο στη δύναμη του 2.5
            // Έτσι, στην αρχή της περιόδου δεν καταλαβαίνουν τίποτα, και στο τέλος... καταρρέουν!
            let curve = Math.pow(progress, 2.5);
            
            return startLevel - ((startLevel - endLevel) * curve);
        }
    };

    const CoreEngine = {
        update: () => {
            const now = new Date();
            const year = now.getFullYear();

            // Υπολογισμοί Ημερομηνιών (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
            const easterDate = Utils.getOrthodoxEaster(year);
            const easterStart = new Date(easterDate.getTime());
            easterStart.setDate(easterStart.getDate() - 8);
            easterStart.setHours(0, 0, 0, 0);
            
            const easterEnd = new Date(easterStart.getTime());
            easterEnd.setDate(easterStart.getDate() + 15);
            easterEnd.setHours(23, 59, 59, 999);

            const summerStart = new Date(year, 5, 16, 0, 0, 0);
            const summerEnd = new Date(year, 8, 10, 23, 59, 59);

            let xmasStart = new Date(year, 11, 24, 0, 0, 0);
            const xmasEnd = new Date(year + (now.getMonth() === 0 ? 0 : 1), 0, 7, 23, 59, 59);
            if (now.getMonth() === 0 && now.getDate() <= 7) {
                xmasStart = new Date(year - 1, 11, 24, 0, 0, 0);
            }

            const isHoliday = ((now >= summerStart && now <= summerEnd) || 
                               (now >= xmasStart && now <= xmasEnd) || 
                               (now >= easterStart && now <= easterEnd));

            let nextIcon = "&#10024;";
            let nextText = '<span class="holiday-days">Καλές διακοπές!</span>';

            if (!isHoliday) {
                const targets = [
                    { name: "για τις διακοπές του Πάσχα 🐣", date: easterStart, icon: "🐣" },
                    { name: "για το Καλοκαίρι 🏝️", date: summerStart, icon: "🏝️" }, 
                    { name: "για τα Χριστούγεννα 🎄", date: xmasStart, icon: "🎄" }
                ].sort((a, b) => a.date - b.date);

                let next = targets.find(t => t.date > now);
                if (!next) {
                    const nextEaster = Utils.getOrthodoxEaster(year + 1);
                    nextEaster.setDate(nextEaster.getDate() - 8);
                    next = { name: "για το Πάσχα 🐣", date: nextEaster, icon: "🐣" };
                }

                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const targetDate = new Date(next.date.getFullYear(), next.date.getMonth(), next.date.getDate());
                const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

                nextIcon = next.icon;
                const daysText = diffDays === 1 ? "Μένει 1 ημέρα" : `Μένουν ${diffDays} ημέρες`;
                nextText = `<span class="holiday-days">${daysText}</span> ${next.name}`;
            }

            // Υπολογισμοί Μπαταρίας (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
            const dayOfYear = Utils.getDayOfYear(now);
            const easterStartDay = Utils.getDayOfYear(easterStart);
            let batLevel = 50;
            const m = now.getMonth() + 1, d = now.getDate();
            const isEaster = (now >= easterStart && now <= easterEnd);
            const isSummer = (m === 6 && d >= 16) || (m === 7) || (m === 8) || (m === 9 && d <= 10);
            const isXmas = (m === 12 && d >= 24) || (m === 1 && d <= 7);

            if (isSummer) {
                const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                batLevel = 5 + ((dayOfYear - summerStartDay) * 1.31); 
            } else if (isXmas) {
                const xmasStartCalc = new Date(now.getFullYear() - (m === 1 ? 1 : 0), 11, 22);
                const xmasDay = Math.floor((now - xmasStartCalc) / 86400000);
                batLevel = 50 + (xmasDay * 1.87); 
            } else if (isEaster) {
                batLevel = 40 + ((dayOfYear - easterStartDay + 1) * 1.87);
            } else {
                if (dayOfYear >= 244) {
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 244, 113, 100, 47); 
                } else if (dayOfYear >= 8 && dayOfYear < easterStartDay) {
                    const daysToEaster = easterStartDay - 8;
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 8, daysToEaster, 80, 40); 
                } else {
                    const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                    const daysToSummer = Math.max(1, summerStartDay - (easterStartDay + 15));
                    batLevel = Utils.getBurnoutCurve(dayOfYear, easterStartDay + 15, daysToSummer, 70, 5); 
                }
            }

            batLevel = Math.max(5, Math.min(100, Math.round(batLevel)));
            const batTextHTML = `Μπαταρία Δασκάλων: ${batLevel}% ${isHoliday ? '<span class="charging-icon">⚡</span>' : ''}`;

            const hour = now.getHours();
            const minutes = now.getMinutes();
            const timeInHours = hour + (minutes / 60); 
            const isWeekend = now.getDay() === 0 || now.getDay() === 6;

            let physicsClass = 'physics-home';
            if (isWeekend) {
                physicsClass = 'physics-home';
            } else if (timeInHours >= 8 && timeInHours < 10.5) {
                physicsClass = 'physics-morning';
            } else if (timeInHours >= 10.5 && timeInHours < 12.5) {
                physicsClass = 'physics-midday';
            } else if (timeInHours >= 12.5 && timeInHours < 14.5) {
                physicsClass = 'physics-6th-hour';
            } else {
                physicsClass = 'physics-home';
            }

            // Ενημέρωση όλων των ενεργών Widgets (PC & Κινητό ταυτόχρονα!)
            Object.values(DOM).forEach(widget => {
                if (!widget) return;
                
                widget.icon.innerHTML = nextIcon;
                widget.display.innerHTML = nextText;

                widget.batFill.style.width = batLevel + '%';
                widget.batText.innerHTML = batTextHTML;

                widget.batFill.classList.remove(
                    'battery-charging-fx', 'battery-low-alert', 
                    'physics-home', 'physics-morning', 'physics-midday', 'physics-6th-hour'
                );
                widget.batFill.style.background = '';
                widget.batFill.style.boxShadow = 'none';

                if (isHoliday) {
                    widget.batFill.classList.add('battery-charging-fx');
                } else if (batLevel <= 20) {
                    widget.batFill.classList.add('battery-low-alert');
                } else {
                    if (batLevel <= 50) {
                        widget.batFill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)'; 
                        widget.batFill.style.boxShadow = '0 0 10px rgba(246, 211, 101, 0.5)';
                    } else {
                        widget.batFill.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'; 
                        widget.batFill.style.boxShadow = '0 0 10px rgba(67, 233, 123, 0.5)';
                    }
                    widget.batFill.classList.add(physicsClass);
                }
            });
        }
    };

    const MessageManager = {
        isShowing: { mobile: false, pc: false },
        timeout: { mobile: null, pc: null },

        show: (e, platform) => {
            e.stopPropagation();

            const widget = DOM[platform];
            if (!widget) return;

            // ΑΣΦΑΛΕΙΑ: Αν πατήσουν ΠΑΝΩ στο ίδιο το κείμενο, ΜΗΝ το κλείσεις!
            if (e.target && e.target.closest && (e.target.closest('#holiday-secret-message-mobile') || e.target.closest('#holiday-secret-message'))) return;

            // 1. Ελέγχουμε αν είναι κινητό
            const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

            // 2. Εκτέλεση haptic δόνησης ΜΟΝΟ αν πατήθηκε το widget του κινητού
            if (isTouch && platform === 'mobile' && navigator.vibrate) {
                navigator.vibrate(50);
            }

            // ΝΕΟ: Αν το μήνυμα είναι ανοιχτό, ΚΛΕΙΣΤΟ αμέσως! (Toggle)
            if (MessageManager.isShowing[platform]) {
                MessageManager.hide(null, platform);
                return;
            }
            if (DataEngine.messagesArray.length === 0) return;
            
            MessageManager.isShowing[platform] = true;
            widget.mainContent.style.display = 'none';
            widget.secretBox.style.display = 'block';
            
            let shown = Utils.safeStorageGet(CONFIG.storageKey);
            if (shown.length >= DataEngine.messagesArray.length) shown = []; 
            
            const available = DataEngine.messagesArray.map((_, i) => i).filter(i => !shown.includes(i));
            const randomIdx = available[Math.floor(Math.random() * available.length)];
            
            shown.push(randomIdx);
            Utils.safeStorageSet(CONFIG.storageKey, shown);
            
            widget.secretBox.innerHTML = DataEngine.messagesArray[randomIdx];

            clearTimeout(MessageManager.timeout[platform]);
            MessageManager.timeout[platform] = setTimeout(() => MessageManager.hide(null, platform), CONFIG.messageDelay);
        },
        
       hide: (e, specificPlatform) => {
            if (e && e.target && e.target.closest && (e.target.closest('#holiday-secret-message-mobile') || e.target.closest('#holiday-secret-message'))) return;
            
            const platforms = specificPlatform ? [specificPlatform] : ['mobile', 'pc'];

            platforms.forEach(platform => {
                if (!MessageManager.isShowing[platform]) return;
                const widget = DOM[platform];
                if (widget) {
                    clearTimeout(MessageManager.timeout[platform]);
                    widget.secretBox.style.display = 'none';
                    widget.mainContent.style.display = ''; // Αφαίρεση του inline style ώστε να ανακτήσει τον έλεγχο το flex/grid του CSS
                    MessageManager.isShowing[platform] = false;
                }
            });
        }
    };

    const App = {
        init: () => {
            const setups = [
                { platform: 'mobile', suffix: '-mobile' },
                { platform: 'pc', suffix: '' }
            ];

            setups.forEach(({ platform, suffix }) => {
                const widgetBox = document.getElementById(`holiday-widget-box${suffix}`);
                if (widgetBox) {
                    DOM[platform] = {
                        widgetBox: widgetBox,
                        mainContent: document.getElementById(`holiday-main-content${suffix}`),
                        secretBox: document.getElementById(`holiday-secret-message${suffix}`),
                        display: document.getElementById(`h-countdown${suffix}`),
                        icon: document.getElementById(`h-icon${suffix}`),
                        batFill: document.getElementById(`bat-fill${suffix}`),
                        batText: document.getElementById(`bat-text${suffix}`)
                    };
                    
                    widgetBox.addEventListener('click', (e) => MessageManager.show(e, platform));
                    widgetBox.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
                }
            });

           if (!DOM.mobile && !DOM.pc) return; // Δεν βρέθηκε κανένα widget

            CoreEngine.update(); // Αρχικός υπολογισμός
            setInterval(CoreEngine.update, 60000); // ΖΩΝΤΑΝΗ ενημέρωση κάθε 1 λεπτό για αλλαγή ώρας/ημερών!
            DataEngine.fetchMessages();

           document.addEventListener('click', MessageManager.hide, { passive: true });
            // ΔΙΕΓΡΑΨΑ το touchstart event στο document. 
            // Αν το αφήσεις, η παραμικρή προσπάθεια για scroll της σελίδας από τον χρήστη θα κρύβει ακαριαία το widget.
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();

;(() => {
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
        // FIX: Αν το link είναι λάθος (π.χ. 404), πετάει Error για να πάει στο catch!
        if (!response.ok) throw new Error("HTTP Error"); 
        
        const data = await response.json();
        DataEngine.riddlesArray = data.riddlesDb || [];
        
        // FIX: Αν το JSON κατέβει αλλά είναι άδειο, πετάει Error για να δείξει τη "Χτένα"
        if (DataEngine.riddlesArray.length === 0) throw new Error("Empty Array");
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
      // FIX: Κάνει το στοιχείο ικανό να πατηθεί με το πληκτρολόγιο (tabindex) και διορθώνει τα κλικ στα iPhone (role)
      boxElement.setAttribute("tabindex", "0");
      boxElement.setAttribute("role", "button");


      boxElement.addEventListener("click", () => {
        // Αν ο χρήστης έχει επιλέξει (μαρκάρει) κείμενο, αγνοούμε το κλικ για να μην κλείσει ο γρίφος
        if (window.getSelection().toString().trim().length > 0) return;
        
        RiddleManager.toggleBlur(boxElement);
      });
      
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

;(() => {
  "use strict";

  // Το ακριβές JSON σου
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/kidsFactsMob.json";
  let globalFacts = [];

  // Εργαλείο: Ανακάτεμα του πίνακα
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Ενεργοποιεί κάθε κάρτα αυτόνομα
  const setupWidget = (suffix) => {
    const inner = document.getElementById(`kf-inner-${suffix}`);
    const textEl = document.getElementById(`kf-fact-${suffix}`);
    const wrapper = document.getElementById(`kf-wrapper-${suffix}`);

  if (!inner || !textEl || !wrapper) return;

    // FIX: Ενεργοποιεί το focus για το πληκτρολόγιο (tabindex) και λύνει το "νεκρό" κλικ στα iPhone
    inner.setAttribute("tabindex", "0");
    inner.setAttribute("role", "button");

    // Τοπική μνήμη για την κάθε κάρτα
    let shuffled = shuffleArray(globalFacts);
    let index = 0;
    let updateTimer = null;

    // Συνάρτηση που αλλάζει το κείμενο χρησιμοποιώντας ΠΑΝΤΑ το innerHTML
    const updateText = () => {
      if (index >= shuffled.length) {
        shuffled = shuffleArray(globalFacts);
        index = 0;
      }
      textEl.innerHTML = shuffled[index];
      index++;
    };

    // Αρχική φόρτωση του πρώτου κειμένου
    updateText();

    // Η Λογική της Περιστροφής
  // Η Λογική της Περιστροφής
    const toggleFlip = () => {
      const isFlipped = inner.classList.contains("kf-is-flipped");
      const willBeFlipped = !isFlipped;
      
      inner.classList.toggle("kf-is-flipped", willBeFlipped);
      inner.setAttribute("aria-pressed", String(willBeFlipped));

      // FIX: Ακυρώνουμε προηγούμενο timer αν γίνει απανωτό κλικ (Spam Click)
      if (updateTimer) clearTimeout(updateTimer);

      // FIX: Αλλάζουμε το κείμενο ΜΟΝΟ όταν η κάρτα ΚΛΕΙΝΕΙ (!willBeFlipped), 
      // ώστε να ετοιμαστεί κρυφά το επόμενο fact χωρίς να "κάψουμε" το τωρινό!
      if (!willBeFlipped) {
        updateTimer = setTimeout(updateText, 350);
      }
    };

  // Κλικ με το ποντίκι / δάχτυλο
    inner.addEventListener("click", () => {
      // Αν ο χρήστης έχει επιλέξει (μαρκάρει) κείμενο, αγνοούμε το κλικ για να μη γυρίσει η κάρτα απότομα
      if (window.getSelection().toString().trim().length > 0) return;
      
      toggleFlip();
    });

   // Κλικ με το πληκτρολόγιο (Προσβασιμότητα)
    inner.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "Escape") {
        if (inner.classList.contains("kf-is-flipped")) {
          toggleFlip(); // Χρησιμοποιούμε τη σωστή συνάρτηση για να κλείσει και να ανανεωθεί σωστά
        }
      }
    });

 
  };

  // Εκκίνηση (Κατεβάζει το JSON και ξεκινάει τις κάρτες)
  const init = async () => {
    try {
      const response = await fetch(JSON_URL);
      if (response.ok) {
        const data = await response.json();
        // Διαβάζει αποκλειστικά το kidsFactsMob
        globalFacts = data.kidsFactsMob || [];
      }
   } catch (e) {
      console.error("Σφάλμα φόρτωσης δεδομένων:", e);
    }
    
    // FIX: Αν το JSON αποτύχει ή είναι άδειο, βάζουμε το μήνυμα ως "μοναδική πληροφορία" (fact)
    // Έτσι η κάρτα συνεχίζει να λειτουργεί κανονικά και ο χρήστης, γυρίζοντάς την, βλέπει το μήνυμα!
    if (globalFacts.length === 0) {
      globalFacts = ["Δε βρέθηκαν πληροφορίες αυτή τη στιγμή. Δοκιμάστε ξανά αργότερα!"];
    }

    // Ενεργοποιεί ταυτόχρονα το κινητό και το PC!
    setupWidget("mob");
    setupWidget("desk");
  };

  // Τρέχει μόλις φορτώσει η σελίδα
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

;(() => {
    "use strict";
const CONFIG = Object.freeze({
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/questionsDbpc2.json' // <-- Πρόσθεσε εδώ το link σου!
    });

   
const DataEngine = {
        questionsArray: [],
        fetchQuestions: async () => {
              try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Αποτυχία λήψης δεδομένων.");
                const data = await response.json();
                
                DataEngine.questionsArray = data.questionsDb || [];
                
                // ΔΙΟΡΘΩΣΗ: Προστασία από άδειο array ή λάθος όνομα κλειδιού στο JSON
                if (DataEngine.questionsArray.length === 0) {
                    throw new Error("Το JSON είναι άδειο ή δομικά μη έγκυρο.");
                }
            } catch (error) {
                console.error("Το API (Quiz) απέτυχε. Φόρτωση Fallback:", error);
               DataEngine.questionsArray = [
                    { 
                        text: "Αδυναμία φόρτωσης ερωτήσεων. Παρακαλώ ελέγξτε τη σύνδεσή σας στο διαδίκτυο.", 
                        type: "error", // Αλλάζουμε τον τύπο 
                        icon: "⚠️", 
                        exp: "Δοκιμάστε να ανανεώσετε τη σελίδα (F5).",
                        isError: true // ΔΙΟΡΘΩΣΗ: Προσθήκη flag για να το αναγνωρίζει το UI ως σφάλμα
                    }
                ];
            }
        }
    };
    const Utils = {
        shuffleArray: (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        }
    };

   // 2. Η Έξυπνη Μηχανή (Δημιουργεί ανεξάρτητο Quiz για PC και Κινητό)
    const initQuizWidget = (suffix) => {
        const localDOM = {
            display: document.getElementById(`question-display${suffix}`),
            feedback: document.getElementById(`quiz-feedback${suffix}`),
            iconSpan: document.getElementById(`q-icon${suffix}`),
            expBox: document.getElementById(`explanation-box${suffix}`),
            expText: document.getElementById(`explanation-text${suffix}`),
            btnRow: document.getElementById(`action-buttons${suffix}`),
            stats: document.getElementById(`quiz-stats${suffix}`),
            qContainer: document.getElementById(`question-container${suffix}`)
        };

        // Αν δεν βρει το συγκεκριμένο widget στη σελίδα, απλά το αγνοεί!
     if (Object.values(localDOM).some(el => el === null)) return;

        // Ξεχωριστό "σκορ" και πρόοδος για κάθε widget!
        const state = { questions: [], index: 0, score: 0, current: null };

       const loadNext = () => {
            if (state.index >= state.questions.length) {
                state.questions = Utils.shuffleArray(DataEngine.questionsArray);
                state.index = 0;
                state.score = 0; // ΔΙΟΡΘΩΣΗ: Μηδενισμός του σκορ στην επανεκκίνηση του quiz!
            }

            state.current = state.questions[state.index];
            state.index++;

          localDOM.display.innerHTML = state.current.text; 
            localDOM.iconSpan.innerHTML = state.current.icon || ""; // ΔΙΟΡΘΩΣΗ: Αποτρέπει την εκτύπωση της λέξης 'undefined'
            localDOM.feedback.innerHTML = "";
            localDOM.stats.innerHTML = `Σκορ: <strong>${state.score}</strong>`;

            // ΔΙΟΡΘΩΣΗ: Αν είναι μήνυμα σφάλματος, κρύψε τα κουμπιά και δείξε κατευθείαν την εξήγηση
            if (state.current.isError) {
                localDOM.btnRow.style.display = "none";
                localDOM.expText.innerHTML = state.current.exp;
                localDOM.expBox.style.display = "block";
            } else {
                localDOM.btnRow.style.display = "flex";
                localDOM.expBox.style.display = "none"; 
            }

            localDOM.qContainer.classList.remove("question-anim");
            localDOM.iconSpan.classList.remove("question-anim");
            void localDOM.qContainer.offsetWidth; // Trigger reflow 
            localDOM.qContainer.classList.add("question-anim");
            localDOM.iconSpan.classList.add("question-anim");
        };

        const processChoice = (userChoice) => {
            localDOM.btnRow.style.display = "none";
            
            // ΔΙΟΡΘΩΣΗ: Ασφαλής σύγκριση! Αποτρέπει σφάλματα από booleans, κεφαλαία ή τυχαία κενά στο JSON.
            const safeUserChoice = String(userChoice).trim().toLowerCase();
            const safeCorrectChoice = String(state.current.type).trim().toLowerCase();

            if (safeUserChoice === safeCorrectChoice) { 
                state.score++;
                localDOM.feedback.innerHTML = "Σωστά! ✅"; 
                localDOM.feedback.style.color = "#27ae60"; 
            } else { 
                localDOM.feedback.innerHTML = "Λάθος! ❌"; 
                localDOM.feedback.style.color = "#e74c3c"; 
            }
            
           // ΔΙΟΡΘΩΣΗ: Αν η ερώτηση δεν έχει επεξήγηση, δείχνει προεπιλεγμένο μήνυμα αντί για 'undefined'
            localDOM.expText.innerHTML = state.current.exp || "Δεν υπάρχει επιπλέον εξήγηση."; 
            localDOM.expBox.style.display = "block";
            localDOM.stats.innerHTML = `Σκορ: <strong>${state.score}</strong>`;
        };

        // Αρχικοποίηση
        state.questions = Utils.shuffleArray(DataEngine.questionsArray);
        if (state.questions.length > 0) {
            loadNext();
        }

        // Event Listeners ΜΟΝΟ για το συγκεκριμένο widget
        localDOM.btnRow.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn || !btn.dataset.choice) return;
            processChoice(btn.dataset.choice);
        });

        localDOM.expBox.addEventListener("click", (e) => {
            const nextBtn = e.target.closest("button");
            if (nextBtn && nextBtn.dataset.action === "next") {
                loadNext();
            }
        });
    };

    // 3. ΕΚΚΙΝΗΣΗ (Universal App)
    const UniversalApp = {
        init: async () => {
            // Κατεβάζουμε το JSON ΜΟΝΟ ΜΙΑ ΦΟΡΑ από το internet
            await DataEngine.fetchQuestions();

            // Η Έξυπνη Λούπα: Το κενό "" είναι για το PC, το "-mobile" για το κινητό!
            const platforms = ["", "-mobile"];
            platforms.forEach(suffix => initQuizWidget(suffix));
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", UniversalApp.init);
    } else {
        UniversalApp.init();
    }

})();

;(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Διαπαιδαγώγηση", "Ψυχολογία", "Σχολείο", "Υγεία", "Παιχνίδι", "Σελίδες", "Γενικά"],
        maxResults: 3,
        defaultEmoji: "📌"
    });

    const Utils = {
        parseTitle: (rawTitle) => {
            let emoji = CONFIG.defaultEmoji;
            let text = rawTitle.trim();
          // Υποστηρίζει πλέον και τα σύνθετα Emojis (επαγγέλματα, χρώμα δέρματος) χωρίς να τα κόβει
            const emojiMatch = text.match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}\u200D\uFE0F\p{Emoji_Modifier}]+)\s*(.*)/u);
            if (emojiMatch) {
                emoji = emojiMatch[1];
                text = emojiMatch[2];
            }
            return { emoji, text };
        }
    };

    const App = {
        widgets: [],
        seenUrls: new Set(), // Κοινή μνήμη για να αποφεύγουμε διπλότυπα
        
        init: () => {
            // 1. Δήλωση των διαθέσιμων widgets (PC & Mobile)
            const widgetConfigs = [
                { hub: "smart-hub", toggle: "hub-toggle", content: "hub-content", dynamic: "dynamic-posts-container" },
                { hub: "smart-hub-mobile", toggle: "hub-toggle-mobile", content: "hub-content-mobile", dynamic: "dynamic-posts-container-mobile" }
            ];

            // 2. Έξυπνη αναζήτηση στη σελίδα (Κρατάει μόνο όσα υπάρχουν στο HTML)
            widgetConfigs.forEach(conf => {
                const hubEl = document.getElementById(conf.hub);
                if (hubEl) {
                    App.widgets.push({
                        hub: hubEl,
                        toggle: document.getElementById(conf.toggle),
                        content: document.getElementById(conf.content),
                        dynamicContainer: document.getElementById(conf.dynamic)
                    });
                }
            });

            if (App.widgets.length === 0) return; // Αν δε βρει κανένα, δεν κάνει τίποτα.

            App.setupUI();
            App.recordExistingLinks();
            App.fetchPosts();
        },

       setupUI: () => {
            // 3. Ανεξάρτητα συρτάρια
            App.widgets.forEach(w => {
                if (w.toggle && w.content) {
                    w.toggle.addEventListener('click', (e) => {
                        // Αφαιρέθηκε το e.stopPropagation() για να μην "μπλοκάρει" το κλείσιμο άλλων μενού στο blog
                        w.content.classList.toggle("open");
                        w.toggle.classList.toggle("active");
                    });
                }
            });

            // Κλείσιμο κλικάροντας/αγγίζοντας αλλού (FIX για τα iPhone/iPad που δεν πιάνουν το click)
            ['click', 'touchstart'].forEach(eventType => {
                window.addEventListener(eventType, (e) => {
                    App.widgets.forEach(w => {
                        if (w.content?.classList.contains('open') && w.hub && !w.hub.contains(e.target)) {
                            w.content.classList.remove('open');
                            w.toggle?.classList.remove('active');
                        }
                    });
                }, { passive: true });
            });
        },

        recordExistingLinks: () => {
            // 4. Καταγραφή υπαρχόντων links και από τα δύο widgets 
            App.widgets.forEach(w => {
                const existingLinks = w.hub.querySelectorAll('.hub-links a');
                existingLinks.forEach(a => App.seenUrls.add(a.href.split('?')[0].split('#')[0]));
            });
        },

        fetchPosts: async () => {
            try {
                // 5. Κατέβασμα δεδομένων ΜΟΝΟ 1 ΦΟΡΑ (Ταχύτητα)
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                    return fetch(url)
                        .then(res => res.ok ? res.json() : null)
                        .catch(() => null); // Αν μια ετικέτα αποτύχει, δεν καταστρέφει τις άλλες
                });

                const results = await Promise.all(promises);
                const listItems = []; // Προσωρινή αποθήκη για τα <li>

                results.forEach(data => {
                    if (!data || !data.feed || !data.feed.entry) return;
                    data.feed.entry.forEach(entry => {
                        const linkObj = entry.link.find(l => l.rel === 'alternate');
                        if (!linkObj) return;

                        const cleanLink = linkObj.href.split('?')[0].split('#')[0];
                        if (App.seenUrls.has(cleanLink)) return;
                        
                        App.seenUrls.add(cleanLink);
                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                       const li = document.createElement('li');
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx"></span></a>`;
                        // FIX: Αλλαγή σε innerHTML για να μεταφράζονται σωστά τα &quot; και &amp; του Blogger
                        li.querySelector('.hub-tx').innerHTML = text;
                        listItems.push(li); // Το αποθηκεύουμε στη μνήμη
                    });
                });

                // 6. Κλωνοποίηση (Copy-Paste) του κάθε άρθρου στα ενεργά widgets
                if (listItems.length > 0) {
                    App.widgets.forEach(w => {
                        if (w.dynamicContainer) {
                            const fragment = document.createDocumentFragment();
                            listItems.forEach(li => {
                                fragment.appendChild(li.cloneNode(true)); // cloneNode = ασφαλής κλωνοποίηση
                            });
                            w.dynamicContainer.appendChild(fragment);
                        }
                    });
                }
            } catch (err) {}
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();


;(() => {
    "use strict";

    // 1. CONFIGURATION: Κεντρική διαχείριση (Αποφεύγουμε τα hardcoded strings)
    const CONFIG = Object.freeze({
        SELECTORS: {
            BAR: "#school-alert-bar",
            TEXT: "#alert-text-message",
            CLOSE_BTN: ".alert-close-btn" // Βάλε αυτή την κλάση στο X κουμπί σου
        },
        STORAGE_KEY: "school_alert_dismissed",
        STORAGE_HOURS: 24, // Πόσες ώρες να μην ξαναβγεί αν το κλείσει ο χρήστης
        IGNORE_WORDS: ["ΕΔΩ ΓΡΑΦΕΙΣ"]
    });

    // 2. ENGINE ΚΛΑΣΗ
    class AlertEngine {
        constructor() {
            this.hasInitialized = false;
        }

        init() {
            // Guard: Αποφυγή διπλής εκτέλεσης (από DOMContentLoaded και Load)
            if (this.hasInitialized) return;
            
            const alertBar = document.querySelector(CONFIG.SELECTORS.BAR);
            const alertTextElem = document.querySelector(CONFIG.SELECTORS.TEXT);

            // Error Checking: Αν δεν υπάρχουν τα στοιχεία στο HTML, σταμάτα ομαλά
            if (!alertBar || !alertTextElem) return;

            this.hasInitialized = true;
            const text = alertTextElem.innerText.trim();

            // Έλεγχος αν πρέπει να κρυφτεί (Άδειο, #, λέξεις-κλειδιά, ή αν το έχει ήδη κλείσει)
            if (this.shouldHide(text)) {
                alertBar.style.display = "none";
                return;
            }

            // ΕΞΥΠΝΗ ΜΕΤΑΚΙΝΗΣΗ (στην αρχή του body)
            document.body.insertBefore(alertBar, document.body.firstChild);
            alertBar.style.display = "flex";

            // Event Delegation για το κλείσιμο (χωρίς onclick="" στο HTML)
            alertBar.addEventListener("click", (e) => {
                if (e.target.closest(CONFIG.SELECTORS.CLOSE_BTN)) {
                    this.dismiss(alertBar);
                }
            });
        }

        shouldHide(text) {
            // Αν το έχει κλείσει πρόσφατα
            if (this.checkMemory()) return true;
            // Αν το κείμενο είναι άδειο ή αρχίζει από #
            if (!text || text.startsWith("#")) return true;
            // Αν περιέχει απαγορευμένες λέξεις
            if (CONFIG.IGNORE_WORDS.some(word => text.includes(word))) return true;
            
            return false;
        }

        dismiss(alertBar) {
            alertBar.style.display = "none";
            // Αποθήκευση στο localStorage της τρέχουσας ώρας + διάρκεια
            const expiry = Date.now() + (CONFIG.STORAGE_HOURS * 60 * 60 * 1000);
            localStorage.setItem(CONFIG.STORAGE_KEY, expiry.toString());
        }

        checkMemory() {
            const storedTime = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!storedTime) return false;
            
            // Έλεγχος αν έχει λήξει η "μνήμη" (π.χ. πέρασαν 24 ώρες)
            if (Date.now() > parseInt(storedTime, 10)) {
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                return false;
            }
            return true; // Το θυμάται, άρα κρατάμε τη μπάρα κλειστή
        }
    }

    // 3. BOOTSTRAP: Ασφαλής εκκίνηση
    const app = new AlertEngine();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => app.init());
    } else {
        app.init();
    }
    window.addEventListener("load", () => app.init());

})();

;(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = Object.freeze({
    showThreshold: 1400, // Στα πόσα pixels scroll να εμφανιστεί (από 400 το πήγες 1400)
    debounceDelay: 150
  });

  // ==========================================
  // 2. DOM CACHE
  // ==========================================
  const DOM = {
    btn: null,
    progressCircle: null
  };

  // ==========================================
  // 3. UTILITIES
  // ==========================================
  const Utils = {
    debounce: (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    }
  };

  // ==========================================
  // 4. BACK TO TOP MANAGER
  // ==========================================
  const ScrollManager = {
    ticking: false, // Flag για το requestAnimationFrame

    init: () => {
      ScrollManager.buildDOM();
      ScrollManager.setupEvents();
      ScrollManager.updateUI(); // Αρχικός υπολογισμός
    },

    buildDOM: () => {
      let btn = document.querySelector('.toTopBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'toTopBtn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Επιστροφή στην κορυφή');
        
        btn.innerHTML = `
          <svg viewBox="0 0 100 100">
            <circle class="bg-circle" cx="50" cy="50" r="45" />
            <circle class="progress-circle" cx="50" cy="50" r="45" 
                    pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" />
          </svg>
          <svg class="arrow-icon" viewBox="0 0 24 24">
            <path d="m16 12-4-4-4 4M12 16V8"/>
          </svg>`;
        
        document.body.appendChild(btn);
      }

      DOM.btn = btn;
      DOM.progressCircle = btn.querySelector('.progress-circle');
    },

    updateUI: () => {
      const scrollY = window.scrollY;
      
      // Αποτροπή διαίρεσης με το μηδέν (Αν η σελίδα είναι μικρότερη από την οθόνη, βάζουμε 1)
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      
      // Υπολογισμός Προόδου με αυστηρά όρια από 0 έως 100
      const progress = Math.max(0, Math.min(100, (scrollY / docHeight) * 100));
      
      if (DOM.progressCircle) {
        DOM.progressCircle.style.strokeDashoffset = 100 - progress;
      }

      // Εμφάνιση / Απόκρυψη
      if (scrollY > CONFIG.showThreshold) {
        DOM.btn.classList.add('show');
      } else {
        DOM.btn.classList.remove('show');
      }

      ScrollManager.ticking = false; // Ελευθερώνουμε το flag για το επόμενο καρέ
    },

    // Ο controller που προστατεύει τον browser από το σπαμάρισμα των scroll events
    onScroll: () => {
      if (!ScrollManager.ticking) {
        window.requestAnimationFrame(ScrollManager.updateUI);
        ScrollManager.ticking = true;
      }
    },

    scrollToTop: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setupEvents: () => {
      window.addEventListener('scroll', ScrollManager.onScroll, { passive: true });
      window.addEventListener('resize', Utils.debounce(ScrollManager.updateUI, CONFIG.debounceDelay), { passive: true });
      DOM.btn.addEventListener('click', ScrollManager.scrollToTop);
    }
  };

  // ==========================================
  // 5. BOOTSTRAP
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ScrollManager.init);
  } else {
    ScrollManager.init();
  }

})();


;(() => {
    "use strict";

    const CONFIG = {
        storageKey: "mobi_glass_subscribed_v3", 
        hideDays: 30
    };

    // 1. Δημιουργούμε τη συνάρτηση που δέχεται το πρόθεμα ('mobi' ή 'desk')
    function initWidget(prefix) {
        
        // 2. Κάνουμε τα IDs δυναμικά βάζοντας το prefix μπροστά
        const DOM = {
            wrapper: document.getElementById(`${prefix}-glass-wrapper`),
            toggleBtn: document.getElementById(`${prefix}-toggle-btn`),
            formView: document.getElementById(`${prefix}-form-view`),
            scratchView: document.getElementById(`${prefix}-scratch-view`),
            
            input: document.getElementById(`${prefix}-glass-input`),
            noticeWrap: document.getElementById(`${prefix}-glass-notice-wrap`),
            submitBtn: document.getElementById(`${prefix}-glass-submit-btn`),
            icon: document.getElementById(`${prefix}-glass-icon`),
            form: document.getElementById(`${prefix}-glass-form`),

            canvas: document.getElementById(`${prefix}-scratch-canvas`),
            bgImage: document.getElementById(`${prefix}-scratch-bg`),
            postTitle: document.getElementById(`${prefix}-scratch-title-overlay`),
            postLink: document.getElementById(`${prefix}-scratch-link`),
            area: document.getElementById(`${prefix}-scratch-area`)
        };

        // 3. Αν δεν βρει το HTML του συγκεκριμένου widget στη σελίδα, σταματάει
        if (!DOM.wrapper) return;

        // 4. Όλες οι μεταβλητές μπαίνουν ΕΔΩ ΜΕΣΑ, ώστε το κάθε widget να έχει τις δικές του!
        let scratchCtx = null;
        let isDrawing = false;
     let isRevealed = false; 
        let currentView = 'form';
       let listenersAdded = false;
        let revealTimeout = null; 
        let cachedEntries = null; // ΝΕΟ: Μνήμη για να μην κατεβάζουμε ξανά τα ίδια άρθρα

     const WidgetManager = {
        init: () => {
       
         if (!DOM.wrapper) return;
            // Αφήνουμε το string κενό ώστε να αφαιρεθεί το inline style
            // και να αφήσουμε τα CSS Media Queries να εμφανίσουν/κρύψουν το σωστό widget!
            DOM.wrapper.style.display = '';

            let hideUntil = null;
            try {
                hideUntil = localStorage.getItem(CONFIG.storageKey);
            } catch(e) { console.warn("To localStorage μπλοκαρίστηκε."); }
            
            const now = new Date().getTime();
            
            // Αν είναι γραμμένος βλέπει κατευθείαν το Ξυστό!
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                WidgetManager.setView('scratch');
            } else {
                WidgetManager.setView('form');
            }

            DOM.toggleBtn.addEventListener('click', () => {
                WidgetManager.setView(currentView === 'form' ? 'scratch' : 'form');
            });

            WidgetManager.setupForm();
        },

        setView: (view) => {
            currentView = view;
            if (view === 'scratch') {
                DOM.formView.style.display = 'none';
                DOM.scratchView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '✏️';
                DOM.toggleBtn.title = 'Εγγραφή στα νέα / Επεξεργασία';
                
                // Φορτώνει νέο Ξυστό αν το προηγούμενο έχει αποκαλυφθεί
                if (isRevealed || !scratchCtx) {
                    ScratchManager.initCanvas();
                    ScratchManager.fetchPost();
                }
            } else {
                DOM.scratchView.style.display = 'none';
                DOM.formView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '🎁';
                DOM.toggleBtn.title = 'Παίξε το Ξυστό!';
            }
        },

        setupForm: () => {
          DOM.input?.addEventListener("focus", () => {
                DOM.noticeWrap?.classList.add(`${prefix}-open`); // Δυναμικό Class
            }, { once: true });

            DOM.input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) DOM.submitBtn?.removeAttribute("disabled");
                else DOM.submitBtn?.setAttribute("disabled", "true");
            });

     DOM.form?.addEventListener("submit", () => {
                if (DOM.submitBtn) DOM.submitBtn.setAttribute("disabled", "true");
                // ΠΡΟΣΟΧΗ: ΔΕΝ βάζουμε e.preventDefault() εδώ!
                if (prefix === 'mobi' && navigator.vibrate) navigator.vibrate([50,50,50]);
                
                if (DOM.icon) {
                    DOM.icon.innerHTML = "✈️";
                    DOM.icon.classList.add(`${prefix}-fly-away`); 
                }

              const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                try {
                    localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());
                } catch(e) { console.warn("To localStorage μπλοκαρίστηκε."); }

                setTimeout(() => {
                   if (DOM.icon) {
                        DOM.icon.innerHTML = "✉️";
                        DOM.icon.classList.remove(`${prefix}-fly-away`); 
                    }
                 if (DOM.submitBtn) {
                        DOM.submitBtn.innerHTML = `Εγγραφή <span id="${prefix}-glass-arrow">➔</span>`;
                        DOM.submitBtn.setAttribute("disabled", "true");
                    }
                    if (DOM.input) {
                        DOM.input.value = "";
                    }

                    WidgetManager.setView('scratch');
                }, 2000);
            });
        }
    };

  const ScratchManager = {
        initCanvas: () => {
            // Μικρή καθυστέρηση για να ανοίξει σωστά το block πριν πάρει διαστάσεις
           setTimeout(() => {
                // Προσθήκη ελέγχου: Ακυρώνει τη δημιουργία του καμβά αν ο χρήστης άλλαξε ξανά προβολή στα 50ms που μεσολάβησαν
                if(!DOM.canvas || !DOM.area || currentView !== 'scratch') return;
            
                if (revealTimeout) clearTimeout(revealTimeout);
                
                DOM.canvas.style.transition = 'none'; 
                DOM.canvas.style.display = 'block';
                DOM.canvas.style.opacity = '1';
                DOM.postTitle.style.opacity = "0";
                isRevealed = false;

                const rect = DOM.area.getBoundingClientRect();
                DOM.canvas.width = rect.width;
                DOM.canvas.height = rect.height;
                
               scratchCtx = DOM.canvas.getContext('2d', { willReadFrequently: true });
                
                // ΚΡΙΣΙΜΟ: Επαναφορά της λειτουργίας σε ζωγραφική. Αλλιώς παραμένει γόμα!
                scratchCtx.globalCompositeOperation = 'source-over';

                // Ασημένιο γέμισμα λαχνού
                const gradient = scratchCtx.createLinearGradient(0, 0, DOM.canvas.width, DOM.canvas.height);
                gradient.addColorStop(0, '#bdc3c7');
                gradient.addColorStop(0.5, '#e0e0e0');
                gradient.addColorStop(1, '#95a5a6');
                scratchCtx.fillStyle = gradient;
                scratchCtx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
                
                // Υφή Ξυστού (κουκκίδες)
                for (let i = 0; i < 1500; i++) {
                    scratchCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)';
                    scratchCtx.fillRect(Math.random() * DOM.canvas.width, Math.random() * DOM.canvas.height, 2, 2);
                }
                
                // Κείμενο
                scratchCtx.fillStyle = '#444';
                scratchCtx.font = 'bold 28px sans-serif';
                scratchCtx.textAlign = 'center';
                scratchCtx.textBaseline = 'middle';
                scratchCtx.fillText('\u2728 ΞΥΣΕ ΕΔΩ \u2728', DOM.canvas.width / 2, DOM.canvas.height / 2);

              // Ρυθμίσεις Γόμας
                scratchCtx.globalCompositeOperation = 'destination-out';
                scratchCtx.lineJoin = 'round';
                scratchCtx.lineCap = 'round';
                // Αν είναι desk βάζει 50, αλλιώς 40
                scratchCtx.lineWidth = prefix === 'desk' ? 50 : 40;

                // Βάζουμε τα events μόνο την πρώτη φορά!
                if (!listenersAdded) {
                    DOM.canvas.addEventListener('mousedown', ScratchManager.startDraw);
                    DOM.canvas.addEventListener('touchstart', ScratchManager.startDraw, { passive: false }); // SOS για κινητά
                    
                    window.addEventListener('mouseup', ScratchManager.stopDraw);
                    window.addEventListener('touchend', ScratchManager.stopDraw);
                    
                    DOM.canvas.addEventListener('mousemove', ScratchManager.draw);
                    DOM.canvas.addEventListener('touchmove', ScratchManager.draw, { passive: false });
                    listenersAdded = true;
                }
            }, 50);
        },

       getMousePos: (evt) => {
            const rect = DOM.canvas.getBoundingClientRect();
            let clientX, clientY;
            if (evt.touches) {
                clientX = evt.touches[0].clientX;
                clientY = evt.touches[0].clientY;
            } else {
                clientX = evt.clientX;
                clientY = evt.clientY;
            }
            
            // Υπολογισμός κλίμακας (scale) για απόλυτη ακρίβεια ακόμα και αν αλλάξει μέγεθος η οθόνη
            const scaleX = DOM.canvas.width / rect.width;
            const scaleY = DOM.canvas.height / rect.height;
            
            return { 
                x: (clientX - rect.left) * scaleX, 
                y: (clientY - rect.top) * scaleY 
            };
        },

        startDraw: (e) => {
            if (isRevealed) return;
            if (e.cancelable) e.preventDefault(); // Κλειδώνει το σκρολάρισμα
            isDrawing = true;
            const pos = ScratchManager.getMousePos(e);
            scratchCtx.beginPath();
            scratchCtx.moveTo(pos.x, pos.y);
            // Σβήνει και με ένα απλό πάτημα (touch tap)
            scratchCtx.lineTo(pos.x + 1, pos.y + 1);
            scratchCtx.stroke();
        },

      stopDraw: () => { 
            if (!isDrawing) return; // Αποτρέπει τη σάρωση αν ο χρήστης δεν ζωγράφιζε στον καμβά!
            isDrawing = false; 
            ScratchManager.checkReveal();
        },

      draw: (e) => {
            if (!isDrawing || isRevealed) return;
            if (e.cancelable) e.preventDefault(); 
            const pos = ScratchManager.getMousePos(e);
            scratchCtx.lineTo(pos.x, pos.y);
            scratchCtx.stroke();
            
            // ΚΡΙΣΙΜΟ: Ξεκινάμε νέο μονοπάτι από το τρέχον σημείο, 
            // ώστε να μην επανασχεδιάζεται όλο το ιστορικό της γραμμής από την αρχή!
            scratchCtx.beginPath();
            scratchCtx.moveTo(pos.x, pos.y);
            
            // Ελέγχουμε κάθε τόσο αν ξύστηκε αρκετά
            
            // Ελέγχουμε κάθε τόσο αν ξύστηκε αρκετά
            if (Math.random() < 0.1) ScratchManager.checkReveal();
        },

       checkReveal: () => {
            // ΚΡΙΣΙΜΟ: Προστασία για το κρυμμένο widget που έχει canvas 0x0 
            if (isRevealed || !scratchCtx || DOM.canvas.width === 0 || DOM.canvas.height === 0) return;
            const pixels = scratchCtx.getImageData(0, 0, DOM.canvas.width, DOM.canvas.height).data;
            let clearPixels = 0;
            
           // Ελέγχουμε 1 στα 16 pixels (ελαφρύτερο για τη μνήμη του κινητού)
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] < 32) clearPixels++; // Προσθήκη ανοχής για τα ημιδιαφανή pixels
            }
            
            const totalToCheck = pixels.length / 16;
  
            if ((clearPixels / totalToCheck) * 100 > 80) { 
                isRevealed = true;
               DOM.canvas.style.transition = 'opacity 0.6s ease';
                DOM.canvas.style.opacity = '0';
                DOM.postTitle.style.opacity = "1"; 
                revealTimeout = setTimeout(() => DOM.canvas.style.display = 'none', 600);
            }
        },

        // --- Ανάκτηση δεδομένων Blogger API ---
       // --- Ανάκτηση δεδομένων Blogger API ---
        fetchPost: () => {
            DOM.postTitle.innerHTML = "Φόρτωση δράσης... 🔍";
            DOM.bgImage.style.backgroundImage = "none";
            DOM.postLink.href = "#";

            let allEntries = []; // Εδώ θα μαζεύουμε όλες τις αναρτήσεις

            // Αναδρομική συνάρτηση για λήψη ανά 250
            const fetchBatch = (startIndex) => {
             fetch(`/feeds/posts/default?q=${encodeURIComponent('δράσεις')}&alt=json&max-results=250&start-index=${startIndex}`)
                    .then(r => r.json())
                    .then(data => {
                        const entries = data.feed?.entry || [];
                        allEntries = allEntries.concat(entries);
                        
               // ΝΕΟ: Επαγγελματικός έλεγχος (όπως ακριβώς στο Ημερολόγιο)
const totalResults = parseInt(data.feed?.openSearch$totalResults?.$t || 0, 10);

// Αν το startIndex + όσα άρθρα κατεβάσαμε ΤΩΡΑ είναι λιγότερα ή ίσα με τα συνολικά
if (startIndex + entries.length <= totalResults && entries.length > 0) {
    // ΣΗΜΑΝΤΙΚΟ: Προσθέτουμε ακριβώς όσα ήρθαν (entries.length), όχι καρφωτά το 250!
    fetchBatch(startIndex + entries.length);
} else {
    // Τελειώσαμε! Προχωράμε στην επεξεργασία όλων των άρθρων.
    processPosts(allEntries);
}
                    })
                    .catch(err => {
                        console.error("Blogger API Error:", err);
                        // Αν χτυπήσει error αλλά έχουμε ήδη κατεβάσει κάποιες από προηγούμενο κύκλο, δούλεψε με αυτές
                        if (allEntries.length > 0) {
                            processPosts(allEntries);
                        } else {
                            DOM.postTitle.innerHTML = "Σφάλμα φόρτωσης.";
                        }
                    });
            };

            // Συνάρτηση επεξεργασίας αφού κατέβουν όλες (αντικαθιστά το παλιό .then)
        const processPosts = (entries) => {
                cachedEntries = entries;
                // Φιλτράρισμα: Αν η λέξη 'δρασ' ή 'δράσ' υπάρχει στις ετικέτες (labels)
                const actionPosts = entries.filter(entry => {
                    if (!entry.category) return false;
                    return entry.category.some(cat => {
                        const term = cat.term.toLowerCase();
                        return term.includes("δράσ") || term.includes("δρασ"); 
                    });
                });

                if (actionPosts.length > 0) {
                    // Τυχαία επιλογή μιας Δράσης
                    const randomPost = actionPosts[Math.floor(Math.random() * actionPosts.length)];
                    
                    DOM.postTitle.innerHTML = randomPost.title.$t || "Σχολική Δράση";

                    // Το link της ανάρτησης
                    const linkObj = randomPost.link.find(l => l.rel === "alternate");
                    if (linkObj) DOM.postLink.href = linkObj.href;

                    // Εύρεση Εικόνας
                    let imgUrl = "";
                    if (randomPost.media$thumbnail?.url) {
                        imgUrl = randomPost.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?/, "/s600");
                 } else if (randomPost.content?.$t) {
                         // Υποστηρίζει πλέον και τα διπλά και τα μονά εισαγωγικά!
                         const imgMatch = randomPost.content.$t.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                         if (imgMatch) imgUrl = imgMatch[1];
                    }

                    if (imgUrl) {
                        DOM.bgImage.style.backgroundImage = `url('${imgUrl}')`;
                    } else {
                        DOM.bgImage.style.backgroundColor = '#34495e';
                    }
                } else {
                    DOM.postTitle.innerHTML = "Δεν βρέθηκαν δράσεις!";
                    DOM.bgImage.style.backgroundColor = '#27ae60';
                }
            };

            if (cachedEntries) {

                setTimeout(() => processPosts(cachedEntries), 60);
            } else {
                fetchBatch(1);
            }
        }
    }; // <-- Εδώ κλείνει το ScratchManager

        // Τρέχουμε την αρχικοποίηση του συγκεκριμένου widget!
        WidgetManager.init();

    } // <-- ΕΔΩ ΚΛΕΙΝΕΙ Η function initWidget(prefix) { ΠΟΥ ΑΝΟΙΞΑΜΕ ΣΤΟ ΒΗΜΑ 1

    // Φτιάχνουμε μια συνάρτηση που τρέχει και τα δύο (κινητό και υπολογιστή)
    function startWidgets() {
        initWidget('mobi');
        initWidget('desk');
    }

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', startWidgets);
    } else {
        startWidgets();
    }
})();


;(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Σύνδεσμοι"],
        maxResults: 53,
        defaultEmoji: "📌"
    });

   const DOM = {};

 const Utils = {
        // ΝΕΑ: Ασφαλής αποκωδικοποίηση HTML Entities (π.χ. &amp; γίνεται &)
        decodeHTML: (htmlText) => {
            const doc = new DOMParser().parseFromString(htmlText, "text/html");
            return doc.documentElement.textContent;
        },
        parseTitle: (rawTitle) => {
            let emoji = CONFIG.defaultEmoji;
            // Αποκωδικοποιούμε το κείμενο ΠΡΙΝ ψάξουμε για emoji
            let text = Utils.decodeHTML(rawTitle).trim();
            // Προστέθηκαν modifiers και ZWJ ώστε να μην κόβονται στη μέση τα σύνθετα emojis (π.χ. 👨‍💻, ❤️)
            const emojiMatch = text.match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\u200D\uFE0F\u{E0020}-\u{E007F}]+)\s*(.*)/u);
            if (emojiMatch) {
                emoji = emojiMatch[1];
                text = emojiMatch[2];
            }
            return { emoji, text };
        }
    };

    const DataEngine = {
        seenUrls: new Set(),
        init: () => {
            if (!DOM.dynamicContainer) return;
            DataEngine.recordExistingLinks();
            DataEngine.fetchPosts();
        },
       recordExistingLinks: () => {
            if (!DOM.hub) return;
            const existingLinks = DOM.hub.querySelectorAll('.hub-links a');
            // Κρατάμε ΜΟΝΟ το pathname (π.χ. /2024/01/post.html) για να μην ξεγελιέται από HTTP/HTTPS
            existingLinks.forEach(a => {
                try { DataEngine.seenUrls.add(new URL(a.href).pathname); } catch(e) {}
            });
        },
        fetchPosts: async () => {
            try {
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                   return fetch(url)
                        .then(res => res.ok ? res.json() : null)
                        .catch(err => null);
                });

                const results = await Promise.all(promises);
                const fragment = document.createDocumentFragment();

                results.forEach(data => {
                  if (!data || !data.feed || !data.feed.entry) return;
                    data.feed.entry.forEach(entry => {
                        const linkObj = entry.link.find(l => l.rel === 'alternate');
                        if (!linkObj) return;

                      // Εξάγουμε το pathname για απόλυτη ταύτιση (εφεδρικό το split αν αποτύχει η URL)
                    let cleanLink = linkObj.href;
                    try { cleanLink = new URL(linkObj.href).pathname; } catch(e) { cleanLink = cleanLink.split('?')[0].split('#')[0]; }
                    
                    if (DataEngine.seenUrls.has(cleanLink)) return;
                        
                        DataEngine.seenUrls.add(cleanLink);
                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                       const li = document.createElement('li');
                        // Βάζουμε μόνο τα σίγουρα HTML στοιχεία
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx"></span></a>`;
                        // Προσθέτουμε τον τίτλο με απόλυτη ασφάλεια (ως απλό κείμενο)
                        li.querySelector('.hub-tx').textContent = text;
                        fragment.appendChild(li);
                    });
                });
                DOM.dynamicContainer.appendChild(fragment);
            } catch (err) {}
        }
    };

   const UIManager = {
        toggleMenu: (e) => {
            // Αφαιρέθηκε το e.stopPropagation() για να μην εμποδίζει άλλα στοιχεία της σελίδας να κλείνουν ομαλά
            if (DOM.content && DOM.toggle) {
                DOM.content.classList.toggle("open");
                DOM.toggle.classList.toggle("active");
            }
        },
        closeMenu: (e) => {
            // Προστασία: Αν το κλικ έγινε πάνω στο ίδιο το κουμπί toggle, αγνόησέ το (το χειρίζεται η toggleMenu)
            if (DOM.toggle && DOM.toggle.contains(e.target)) return;

            if (DOM.content?.classList.contains('open') && DOM.hub && !DOM.hub.contains(e.target)) {
                DOM.content.classList.remove('open');
                DOM.toggle?.classList.remove('active');
            }
        }
    };

    const App = {
        init: () => {
            // 1. Γεμίζουμε το DOM με τα στοιχεία του hub2 ΑΦΟΥ έχει φορτώσει η σελίδα
            DOM.hub = document.getElementById("smart-hub2");
            DOM.content = document.getElementById("hub-content2");
            DOM.toggle = document.getElementById("hub-toggle2");
            DOM.dynamicContainer = document.getElementById("dynamic-posts-container2");

            if (!DOM.hub) return;

            // 2. Δένουμε το κουμπί απευθείας μέσω Javascript (καταργεί το onclick του HTML)
           if (DOM.toggle) DOM.toggle.addEventListener('click', UIManager.toggleMenu);

            DataEngine.init();
            // Η προσθήκη του touchstart επιτρέπει το κλείσιμο του μενού με πάτημα στο κενό στα iPhone/iPad
            ['click', 'touchstart'].forEach(evt => 
                window.addEventListener(evt, UIManager.closeMenu, { passive: true })
            );
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();


;(() => {
   "use strict";

    // 1. Έξυπνη Λειτουργία Πλήρους Οθόνης (Κοινή για PC & Mobile)
    const triggerFullscreen = (iframeId) => {
        const fIframe = document.getElementById(iframeId);
        if (!fIframe) return;

     const fallbackOpen = () => { 
           if (fIframe.src) {
               const newWin = window.open(fIframe.src, '_blank');
               // Αν ο browser μπλοκάρει το νέο παράθυρο λόγω Popup Blocker, κάνουμε ανακατεύθυνση στην ίδια καρτέλα
               if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                   window.location.href = fIframe.src;
               }
           } 
       };

        if (fIframe.requestFullscreen) {
            const p = fIframe.requestFullscreen();
            // Αν το API υπάρχει αλλά το browser το μπλοκάρει (π.χ. iPhone iframe ή λείπει το allow="fullscreen"), πιάνουμε την αποτυχία!
            if (p && p.catch) p.catch(fallbackOpen);
        } else if (fIframe.webkitRequestFullscreen) { // Safari / Chrome
            const p = fIframe.webkitRequestFullscreen();
            if (p && p.catch) p.catch(fallbackOpen);
        } else if (fIframe.mozRequestFullScreen) { // Firefox
            fIframe.mozRequestFullScreen();
        } else if (fIframe.msRequestFullscreen) { // IE11
            fIframe.msRequestFullscreen();
        } else {
            // FALLBACK αν δεν υποστηρίζεται καθόλου το API (Παλιά iPhones)
            fallbackOpen();
        }
    };

    // Κρατάμε και τα δύο ονόματα (PC & Mobile) για να λειτουργούν αυτόματα τα κουμπιά στο HTML σου!
    window.openLibraryFullscreen = () => triggerFullscreen("flipbook-iframe");
    window.openLibraryFullscreenMobile = () => triggerFullscreen("flipbook-iframe-mobile");

   // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής (Κοινός για PC & Mobile)
    const initApp = () => {
        // Λίστα με τα IDs για το PC και το Κινητό αντίστοιχα
        const platforms = [
            { boxId: "video-widget-box", ytId: "yt-player" },
            { boxId: "video-widget-box-mobile", ytId: "yt-player-mobile" }
        ];

       // ΔΙΟΡΘΩΣΗ Α: Ενεργοποιούμε το κλικ στα κουμπιά ΑΜΕΣΩΣ! Έτσι δουλεύουν ακόμα και αν το Adblocker μπλοκάρει το YT API.
        platforms.forEach(p => {
            const box = document.getElementById(p.boxId);
            if (!box) return;
            const subBtn = box.querySelector('.video-sub-action');
            if (subBtn && !subBtn.dataset.listenerAdded) {
                subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
                subBtn.dataset.listenerAdded = "true";
            }
        });

        const setupPlayers = () => {
            // Η έξυπνη λούπα: Ελέγχει και το PC και το κινητό!
            platforms.forEach(p => {
                const box = document.getElementById(p.boxId);
                const ytPlayerEl = document.getElementById(p.ytId);
                
                if (!box || !ytPlayerEl) return; // Αν δεν το βρει στη σελίδα, πάει στο επόμενο
                
                const subBtn = box.querySelector('.video-sub-action');

              const initPlayer = () => {
                    new YT.Player(p.ytId, {
                        events: {
                            'onStateChange': (e) => {
                                if (e.data === 1 && subBtn) subBtn.classList.add('is-hidden');
                            }
                        }
                    });
                };

                // ΔΙΟΡΘΩΣΗ Β: Προσθήκη enablejsapi=1 αν λείπει
                if (ytPlayerEl.tagName.toLowerCase() === 'iframe') {
                    const currentSrc = ytPlayerEl.getAttribute('src') || '';
                    if (currentSrc && !currentSrc.includes('enablejsapi=1')) {
                        // ΠΕΡΙΜΕΝΟΥΜΕ να ολοκληρωθεί η φόρτωση ΠΡΙΝ αρχικοποιηθεί το Player
                        ytPlayerEl.addEventListener('load', initPlayer, { once: true });
                        ytPlayerEl.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'enablejsapi=1';
                        return; // Σταματάμε την τρέχουσα εκτέλεση της λούπας
                    }
                }

                // Αν το API υπήρχε ήδη στο URL, αρχικοποιούμε άμεσα
                initPlayer();
            });
        };

        // Ασφαλής Φόρτωση YouTube API
        if (window.YT && window.YT.Player) {
            setupPlayers();
        } else {
            window.ytReadyCallbacks = window.ytReadyCallbacks || [];
            window.ytReadyCallbacks.push(setupPlayers); 

            if (!window.ytApiLoading) {
                window.ytApiLoading = true;
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                
                const existingOnReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (typeof existingOnReady === 'function') {
                        existingOnReady(); 
                    }
                    window.ytReadyCallbacks.forEach(cb => cb());
                    window.ytReadyCallbacks = []; 
                };
            }
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
})();


;(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Δράσεις 14-25"], 
        fallbackImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
    });

    const DOM = {};

   const Utils = {
      cleanText: (htmlStr) => {
            if (!htmlStr) return "";
       // 1. Προσθήκη κενών πριν από block-level στοιχεία για αποφυγή συγχώνευσης λέξεων
            // Προστέθηκαν tags λιστών (ul, ol) και πινάκων (table, tr, td, th)
            const spacedStr = htmlStr.replace(/<\/?(p|div|br|h[1-6]|li|blockquote|table|tr|th|td|ul|ol)[^>]*>/gi, ' ');
            const doc = new DOMParser().parseFromString(spacedStr, 'text/html');
            
            // 2. Αφαίρεση tags κώδικα (scripts/styles) για να μην εμφανίζονται μέσα στην περίληψη
            doc.querySelectorAll('script, style').forEach(el => el.remove());
            
            return (doc.body.textContent || doc.body.innerText || "").replace(/\s+/g, ' ').trim();
        }
    };

    const MobileDataEngine = {
      isFetching: false,
       fetchPosts: async () => {
            if (MobileDataEngine.isFetching) return;
            MobileDataEngine.isFetching = true;

            try {
                const randomLabel = CONFIG.labels[Math.floor(Math.random() * CONFIG.labels.length)];
                const encodedLabel = encodeURIComponent(randomLabel);

                // 1. Παίρνουμε το συνολικό αριθμό άρθρων
                const metaUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`;
                const metaRes = await fetch(metaUrl);
                const metaData = await metaRes.json();

                const totalPosts = parseInt(metaData.feed.openSearch$totalResults.$t, 10);
                if (totalPosts === 0) throw new Error("Δεν βρέθηκαν αναρτήσεις.");

                // Πλέον ΔΕΝ βάζουμε όριο στο maxAllowedIndex. Παίρνουμε ΟΛΟ το εύρος.
            // Πλέον ΔΕΝ βάζουμε όριο στο maxAllowedIndex. Παίρνουμε ΟΛΟ το εύρος.
                let randomIndex = Math.floor(Math.random() * totalPosts) + 1;
                
                // Αποτροπή εμφάνισης του ίδιου άρθρου δύο φορές συνεχόμενα (αν υπάρχουν πάνω από 1 άρθρα)
                if (totalPosts > 1 && randomIndex === MobileDataEngine.lastIndex) {
                    randomIndex = (randomIndex % totalPosts) + 1;
                }
                MobileDataEngine.lastIndex = randomIndex;
                
                let currentIndex = randomIndex;
                let publishedMax = "";

                // 2. Το "Κόλπο": Όσο ο στόχος μας είναι πάνω από 500, κάνουμε άλματα.
                while (currentIndex > 500) {
                    let skipUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=500`;
                    if (publishedMax) skipUrl += `&published-max=${encodeURIComponent(publishedMax)}`;

                    const skipRes = await fetch(skipUrl);
                    const skipData = await skipRes.json();
                    
                 if (!skipData.feed?.entry || skipData.feed.entry.length === 0) {
                        // Το Blogger μέτρησε διεγραμμένα άρθρα. Ακυρώνουμε τα άλματα και πάμε στο 1ο (πρόσφατο) άρθρο.
                        currentIndex = 1;
                        publishedMax = "";
                        break;
                    }

                    // Αποθηκεύουμε την ημερομηνία της 500ής ανάρτησης για το επόμενο βήμα
                    publishedMax = skipData.feed.entry[0].published.$t;
                    // Αφαιρούμε 499 (όχι 500), γιατί το published-max θα φέρει 1η την ανάρτηση που μόλις βρήκαμε
                    currentIndex -= 499; 
                }

                // 3. Το τελικό request με το υπόλοιπο (που πλέον είναι σίγουρα <= 500)
                let finalUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=${currentIndex}`;
                if (publishedMax) finalUrl += `&published-max=${encodeURIComponent(publishedMax)}`;

                const finalRes = await fetch(finalUrl);
                const finalData = await finalRes.json();

             let entry = finalData.feed?.entry?.[0];
                if (!entry) {
                    // Fallback Ασφαλείας: Φορτώνουμε εγγυημένα την 1η ανάρτηση αν χτυπήσαμε σε "ghost post"
                    const safeRes = await fetch(`/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`);
                    const safeData = await safeRes.json();
                    entry = safeData.feed?.entry?.[0];
                    if (!entry) throw new Error("Δεν βρέθηκαν καθόλου αναρτήσεις.");
                }

                MobileDataEngine.processSingleEntry(entry);

            } catch (err) {
                console.warn('Χρονοκάψουλα:', err.message);
                MobileUIEngine.updateCard(
                    CONFIG.fallbackImg, 
                    "Σφάλμα Φόρτωσης", 
                    "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.", 
                    "Σφάλμα", 
                    "--", 
                    "#"
                );
            } finally {
                MobileDataEngine.isFetching = false;
            }
        },

      processSingleEntry: (entry) => {
            if (!entry) return;
            
            // Η έτοιμη συνάρτηση Utils.cleanText αποκωδικοποιεί τα HTML Entities με ασφάλεια
            const title = Utils.cleanText(entry.title?.$t) || 'Χωρίς Τίτλο';
          // Ασφαλής πλοήγηση στον πίνακα link με χρήση Optional Chaining (?.)
            const postLink = entry.link?.find(l => l.rel === 'alternate')?.href || '#';

            let imgSrc = CONFIG.fallbackImg;
       if (entry.media$thumbnail) {
                // Νέα, σύγχρονη Regex που πιάνει όλες τις παραλλαγές διαστάσεων (και τις παλιές και τις νέες)
                imgSrc = entry.media$thumbnail.url.replace(/\/(s\d+|w\d+-h\d+)[^\/]*\//, "/s600/");
                // Αναβάθμιση ανάλυσης για τις μικρογραφίες ενσωματωμένων βίντεο YouTube (από 120p σε 480p)
              // Αναβάθμιση ανάλυσης για τις μικρογραφίες ενσωματωμένων βίντεο YouTube (από 120p σε 480p)
                if (imgSrc.includes('youtube.com') || imgSrc.includes('ytimg.com')) {
                    // ΝΕΟ: Η κάθετος (/) διασφαλίζει ότι αντικαθίσταται αυστηρά ΜΟΝΟ το ακριβές αρχείο
                    imgSrc = imgSrc.replace('/default.jpg', '/hqdefault.jpg');
                }
         } else if (entry.content?.$t) {
                // Επιτρέπουμε τόσο τα μονά όσο και τα διπλά εισαγωγικά, καθιστώντας την αναζήτηση case-insensitive (i)
                const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                if (imgMatch) imgSrc = imgMatch[1];
            }

            // Αυτόματη μετατροπή σε HTTPS για αποφυγή σφαλμάτων Mixed Content σε αναρτήσεις παλιών ετών
            imgSrc = imgSrc.replace(/^http:\/\//i, 'https://');

          // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
        // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
            let desc = Utils.cleanText(entry.summary?.$t || entry.content?.$t || "");
            if (desc.length > 80) {
                // Εύρεση του τελευταίου κενού διαστήματος πριν τον 80ο χαρακτήρα για να μην κόβονται λέξεις
                const lastSpace = desc.lastIndexOf(' ', 80);
                desc = desc.substring(0, lastSpace > 0 ? lastSpace : 80) + '...';
            }
            const pubDate = new Date(entry.published.$t);
            const months = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];
            const dateStr = `${months[pubDate.getMonth()]} ${pubDate.getFullYear()}`;
            
         // Υπολογισμός με βάση τις πραγματικές ημέρες, ώστε τα άρθρα της ίδιας σχολικής χρονιάς να μην εμφανίζονται ως "Πέρυσι" τον χειμώνα
         // Υπολογισμός με βάση τις πραγματικές ημέρες, ώστε τα άρθρα της ίδιας σχολικής χρονιάς να μην εμφανίζονται ως "Πέρυσι" τον χειμώνα
            const diffDays = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
            const yearsAgo = Math.max(0, Math.floor(diffDays / 365.25)); // ΝΕΟ: Αποτροπή παραγωγής αρνητικών αριθμών (-1)
            let badgeText = yearsAgo === 0 ? "Πρόσφατο" : yearsAgo === 1 ? "Πέρυσι" : `${yearsAgo} Χρόνια Πριν`;

            MobileUIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

 const MobileUIEngine = {
        updateCard: (img, title, desc, badge, date, link) => {
            DOM.imgs.forEach(el => {
                el.src = img;
                // ΝΕΟ: Αν η εικόνα του άρθρου είναι διεγραμμένη/σπασμένη (Error 404), φορτώνει αυτόματα το fallback
                el.onerror = () => {
                    el.src = CONFIG.fallbackImg;
                    el.onerror = null; // Αποτροπή ατέρμονου βρόχου αν σπάσει τυχαία και το fallback
                };
            });
            DOM.titles.forEach(el => el.innerText = title);
            DOM.descs.forEach(el => el.innerText = desc || "Διαβάστε περισσότερα...");
            DOM.badges.forEach(el => el.innerText = badge);
            DOM.dates.forEach(el => el.innerText = date);
            DOM.btnLinks.forEach(el => el.href = link);
        },

     createDust: () => {
            DOM.widgets.forEach(widget => {
                // Εγκλωβίζει τα στοιχεία αυστηρά εντός του widget αποτρέποντας τα scrollbars
                widget.style.overflow = "hidden"; 
                widget.style.position = "relative"; 
                
                widget.querySelectorAll('.stc-dust').forEach(el => el.remove());
                const fragment = document.createDocumentFragment();
              for (let i = 0; i < 15; i++) {
                    let dust = document.createElement("div");
                    dust.className = "stc-dust";
                    dust.style.pointerEvents = "none"; // Κάνει τη σκόνη "διαπερατή", αποτρέποντας το μπλοκάρισμα των κλικ
                    dust.style.width = dust.style.height = (Math.random() * 4 + 1) + "px";
                    dust.style.left = (Math.random() * 100) + "%";
                    dust.style.top = (Math.random() * 100) + "%";
                    dust.style.animationDuration = (Math.random() * 10 + 5) + "s";
                    dust.style.animationDelay = (Math.random() * 5) + "s";
                    fragment.appendChild(dust);
                }
                widget.appendChild(fragment);
            });
        },

        createArrowHint: (engineRef) => {
            DOM.widgets.forEach(widget => {
                if (widget.querySelector('.stc-arrow')) return; 
                
                const arrow = document.createElement('div');
                arrow.className = 'stc-arrow'; // Το κάναμε class αντί για id για να παίζει παντού
                arrow.innerHTML = '&#10095;'; 
                
                arrow.style.cssText = `
                    position: absolute; right: 15px; top: 50%; margin-top: -20px;
                    color: rgba(255, 255, 255, 0.8); font-size: 26px; cursor: pointer;
                    z-index: 20; user-select: none; padding: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                `;
                
               arrow.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    engineRef.triggerReRoll();
                });

                widget.appendChild(arrow);
                
                // Προστατευτικός έλεγχος υποστήριξης για να μην καταρρέει το script σε παλιές συσκευές
                if (typeof arrow.animate === 'function') {
                    arrow.animate([
                        { transform: 'translateX(0)', opacity: 0.5 },
                        { transform: 'translateX(6px)', opacity: 1 },
                        { transform: 'translateX(0)', opacity: 0.5 }
                    ], { duration: 1500, iterations: Infinity, easing: 'ease-in-out' });
                }
            });
        }
    };
const SwipeEngine = {
        startX: 0,
        startY: 0,
        isDragging: false, // <-- Προστέθηκε για το PC!
        isZooming: false, // <-- ΝΕΟ: Παρακολούθηση κατάστασης ζουμ
        
  init: () => {
            DOM.widgets.forEach(widget => {
                // Επιτρέπει το κάθετο scroll ΚΑΙ τη μεγέθυνση (pinch-to-zoom)
                widget.style.touchAction = "pan-y pinch-zoom";
                
             // --- 1. ΑΦΗ (ΚΙΝΗΤΟ) ---
                widget.addEventListener('touchstart', (e) => {
                    if (e.touches.length > 1) {
                        SwipeEngine.isZooming = true;
                        return; // Ακύρωση ανίχνευσης αν χρησιμοποιούνται πολλά δάχτυλα (π.χ. Ζουμ)
                    }
                    SwipeEngine.isZooming = false; // Επαναφορά σε κανονικό άγγιγμα
                    SwipeEngine.startX = e.changedTouches[0].screenX;
                    SwipeEngine.startY = e.changedTouches[0].screenY;
                }, { passive: true });
                
             widget.addEventListener('touchend', (e) => {
                    // Ενσωμάτωση του ελέγχου isZooming για πλήρη αποτροπή swipe αν προηγήθηκε ζουμ
                    if (e.changedTouches.length > 1 || e.touches.length > 0 || SwipeEngine.isZooming) return; 
                    
                    const endX = e.changedTouches[0].screenX;
                    const endY = e.changedTouches[0].screenY;
                    
                   // ΜΕΣΑ ΣΤΟ touchend (ΚΙΝΗΤΟ)
                    const deltaX = Math.abs(SwipeEngine.startX - endX);
                    const deltaY = Math.abs(SwipeEngine.startY - endY);
                    
                    // Απαιτούμε η οριζόντια κίνηση (swipe) να είναι τουλάχιστον διπλάσια από την κάθετη (scroll)
                    if (deltaX > 50 && deltaX > deltaY * 2) SwipeEngine.triggerReRoll();
                }, { passive: true });

                // --- 2. ΠΟΝΤΙΚΙ (ΥΠΟΛΟΓΙΣΤΗΣ) ---
                widget.style.cursor = "grab";
                widget.style.userSelect = "none";
                widget.ondragstart = () => false;

                widget.addEventListener('mousedown', (e) => {
                    if (e.target.closest('a') || e.button !== 0) return;
                    SwipeEngine.isDragging = true;
                    SwipeEngine.startX = e.pageX;
                    SwipeEngine.startY = e.pageY;
                    widget.style.cursor = "grabbing";
                });
            });

            // Το mouseup μπαίνει στο window για να μην κολλάει αν βγει το ποντίκι έξω
            window.addEventListener('mouseup', (e) => {
                if (!SwipeEngine.isDragging) return;
                SwipeEngine.isDragging = false;
                
                DOM.widgets.forEach(w => w.style.cursor = "grab");
           const deltaX = Math.abs(SwipeEngine.startX - e.pageX);
                const deltaY = Math.abs(SwipeEngine.startY - e.pageY);
                // Ακυρώνουμε την αλλαγή αν ο χρήστης απλώς μαρκάρει κείμενο προς αντιγραφή
                const hasSelectedText = window.getSelection().toString().trim().length > 0;
                if (deltaX > 80 && deltaX > deltaY && !hasSelectedText) SwipeEngine.triggerReRoll();
            });
        },
        
      triggerReRoll: () => {
            if (MobileDataEngine.isFetching) return;
            
            DOM.widgets.forEach(widget => {
          
                widget.style.transition = "opacity 0.3s";
                widget.style.opacity = "0.5";
                widget.style.pointerEvents = "none"; // Αποτροπή κλικ κατά τη διάρκεια της φόρτωσης
            });
            
            DOM.titles.forEach(title => title.innerText = "Αναζήτηση μνήμης...");
            
            MobileDataEngine.fetchPosts().finally(() => {
                DOM.widgets.forEach(widget => {
                    widget.style.opacity = "1";
                    widget.style.pointerEvents = ""; // Επαναφορά της δυνατότητας κλικ μόλις ολοκληρωθεί
                });
                MobileUIEngine.createDust(); 
            });
        }
    };

   const MobileApp = {
        init: () => {
            // Χρησιμοποιούμε querySelectorAll για να πιάσουμε ΚΑΙ του PC ΚΑΙ του κινητού
            DOM.widgets = document.querySelectorAll("#stc-widget, #stc-widget-mobile");
            if (DOM.widgets.length === 0) return;

            DOM.imgs = document.querySelectorAll("#stc-image, #stc-image-mobile");
            DOM.titles = document.querySelectorAll("#stc-title, #stc-title-mobile");
            DOM.descs = document.querySelectorAll("#stc-desc, #stc-desc-mobile");
            DOM.badges = document.querySelectorAll("#stc-badge, #stc-badge-mobile");
            DOM.dates = document.querySelectorAll("#stc-date, #stc-date-mobile");
            DOM.btnLinks = document.querySelectorAll("#stc-btn-link, #stc-btn-link-mobile");

            MobileDataEngine.fetchPosts();
            MobileUIEngine.createDust();
            MobileUIEngine.createArrowHint(SwipeEngine);
            SwipeEngine.init();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }
})();

;(() => {
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
          // ΔΙΟΡΘΩΣΗ: Ασφαλής μετατροπή του kw σε String πριν εφαρμοστεί το toLowerCase(),
          // αποτρέποντας κρασαρίσματα αν το JSON περιέχει αριθμούς/χρονολογίες.
          if (keywords.some(kw => text.includes(String(kw).toLowerCase()))) {
            category = key;
            break;
          }
        }
      }

      const missionsList = (DATA && DATA.missions && DATA.missions[category] && DATA.missions[category].length > 0)
                           ? DATA.missions[category]
                           : (DATA && DATA.missions && DATA.missions['default'] && DATA.missions['default'].length > 0)
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
      try { // ΚΡΙΣΙΜΟ: Προστασία από Fatal Error (SecurityError) αν ο χρήστης μπλοκάρει τα cookies/storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CONFIG.storagePrefix) && key !== currentKey) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn("Το localStorage δεν είναι προσβάσιμο για εκκαθάριση.");
      }
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
      let savedMission = null;
      try { // ΚΡΙΣΙΜΟ: Προστασία της ανάγνωσης για να μην κρασάρει το widget!
        savedMission = localStorage.getItem(storageKey);
      } catch (e) {}
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
toggleContainer: (event, platform) => {
      if (platform === 'mobile' && navigator.vibrate) navigator.vibrate(15); 
      
      const container = document.getElementById(`mission-container-${platform}`);
      if (container) container.classList.toggle("open");
    },

  // Διαχείριση κλεισίματος όταν γίνεται click έξω (για όλα τα widgets)
    setupOutsideClick: () => {
      // ΚΡΙΣΙΜΟ: Φτιάχνουμε τη λογική του κλεισίματος σε μια σταθερή μεταβλητή (για να μην την ξαναγράφουμε)
      const closeHandler = (event) => {
        // ΔΙΟΡΘΩΣΗ: Ασπίδα προστασίας. Αν το κλικ έγινε πάνω στο κουμπί toggle, 
        // αγνόησέ το εντελώς ώστε να μην κλείσει το μενού ακαριαία!
        if (event.target.closest('[onclick*="toggleMission"]')) return;

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
      };

      // 1. Ακούμε στο 'click' (Για υπολογιστές και Android)
      document.addEventListener("click", closeHandler, { passive: true });
      
      // 2. Ακούμε στο 'touchstart' (ΥΠΟΧΡΕΩΤΙΚΟ για να μη κολλάει ανοιχτό το widget στα iPhone / iPad!)
      document.addEventListener("touchstart", closeHandler, { passive: true });
    }
      };

 // ==========================================
  // 4. ΕΚΚΙΝΗΣΗ ΛΕΙΤΟΥΡΓΙΩΝ
  // ==========================================
  // Εξάγουμε και τα δύο toggle functions παγκοσμίως (window) ώστε να τα βλέπει η HTML του site σου
  window.toggleMissionMobile = (event) => WidgetManager.toggleContainer(event, 'mobile');
  window.toggleMissionPC = (event) => WidgetManager.toggleContainer(event, 'pc');

 const startWidget = () => {
    // Χρησιμοποιούμε καθυστέρηση για να μην μπλοκάρουμε το κύριο νήμα (main thread)
    setTimeout(() => {
      WidgetManager.init();
      WidgetManager.setupOutsideClick();
    }, CONFIG.initDelay);
  };

  // ΚΡΙΣΙΜΟ: Ελέγχει αν η σελίδα έχει ΉΔΗ φορτώσει, αλλιώς περιμένει το event
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWidget);
  } else {
    startWidget();
  }

})();
