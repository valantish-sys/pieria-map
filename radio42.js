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
            btn.addEventListener('mouseenter', () => {
                const currentTransform = btn.style.transform;
                btn.style.transform = 'none';
                cachedRect = btn.getBoundingClientRect();
                btn.style.transform = currentTransform;
            });

            btn.addEventListener('mousemove', (e) => {
              clearTimeout(magnetTimeout);
              if (!cachedRect) return; // Fallback ασφαλείας
         
              // Ταχύτατος υπολογισμός χωρίς καμία επιβάρυνση στη CPU
              const x = e.clientX - cachedRect.left - cachedRect.width / 2;
              const y = e.clientY - cachedRect.top - cachedRect.height / 2;
          
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
         // ΔΙΟΡΘΩΣΗ: Χρήση του e.isTrusted αντί για τον έλεγχο isFading.
         // Εγγυάται ότι η αλλαγή έγινε από τον χρήστη και επιτρέπει τη ρύθμιση έντασης ΚΑΙ κατά το Buffering!
         if (e.isTrusted && els.player.volume >= 0 && els.player.volume <= 1) {
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
