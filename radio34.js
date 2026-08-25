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
        navigator.mediaSession.setActionHandler('play', () => JukeboxManager.dom.player.play());
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
            btn.addEventListener('mousemove', (e) => {
          clearTimeout(magnetTimeout);
         const rect = btn.getBoundingClientRect();
          
          // ΝΕΟ (Ασπίδα Jitter): Αφαιρούμε την τρέχουσα μετατόπιση για να βρίσκουμε το ΣΤΑΘΕΡΟ κέντρο!
          let tx = parseFloat(btn.dataset.tx || 0);
          let ty = parseFloat(btn.dataset.ty || 0);
          
          const originalLeft = rect.left - tx;
          const originalTop = rect.top - ty;
          
          const x = e.clientX - originalLeft - rect.width / 2;
          const y = e.clientY - originalTop - rect.height / 2;
          
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
        const handleOrientation = (e) => {
          if (!e.beta || !e.gamma) return;
          if (container.dataset.isSwiping === 'true') return;

          let tiltX = Math.max(-2, Math.min(2, (e.beta - 45) / 3));
          let tiltY = Math.max(-2, Math.min(2, e.gamma / 3));

          container.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
          container.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
          container.style.boxShadow = `${tiltY}px ${tiltX}px 32px rgba(0, 0, 0, 0.1)`;
        };

        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            document.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission()
                  .then(permissionState => {
                      if (permissionState === 'granted') {
                          // ΚΡΙΣΙΜΟ (iOS): Στο iPhone το event ΠΡΕΠΕΙ να μπει ΜΕΣΑ στο then της άδειας
                          window.addEventListener('deviceorientation', handleOrientation);
                      }
                  })
                  .catch(() => {});
            }, { once: true });
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

        let myConnectionRef = null;
         let forceDisconnect = () => { if (myConnectionRef) try { myConnectionRef.remove(); } catch(e){} };

         // ΔΙΟΡΘΩΣΗ: Ορίζουμε τη συνάρτηση ΕΞΩ από το συμβάν για να μπορούμε να τη διαγράψουμε σωστά!
         let restoreConnection = () => {
             if (myConnectionRef && document.visibilityState === 'visible') {
                 myConnectionRef.set(true);
             }
         };

         // 1. Μόλις συνδεθεί ή επανασυνδεθεί ο μαθητής
         connectedRef.on('value', (snap) => {
             if (snap.val() === true) {
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
          // Απλός έλεγχος: Περιμένουμε μέχρι να φορτώσει η βιβλιοθήκη του Firebase
          if (typeof firebase !== 'undefined') {
              connectFirebase();
          } else if (attempts < 20) { // Δοκιμάζει 20 φορές (σύνολο 10 δευτερόλεπτα αναμονής)
              attempts++;
              setTimeout(checkAndConnect, 500);
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
        const video = document.createElement('video'); video.muted = true;

       let isPipOpening = false; // ΝΕΟ: Ασπίδα για να μην παίζει μουσική μόνο του κατά το άνοιγμα

        // Συγχρονισμός PiP -> Σελίδας
        video.addEventListener('play', () => { 
            if (!isPipOpening && JukeboxManager.dom.player.paused) JukeboxManager.dom.player.play(); 
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
        const drawFrame = () => { /* (ΚΡΑΤΑ ΤΗ ΔΙΚΗ ΣΟΥ ΣΥΝΑΡΤΗΣΗ drawFrame ΟΠΩΣ ΗΤΑΝ!) */
           ctx.fillStyle = '#1e272e'; ctx.fillRect(0, 0, 400, 200);
           // ΜΕΤΑ:
           ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
           ctx.font = '22px Arial'; ctx.fillText('📻 Radio Δ.Σ. Περίστασης', 200, 50);
           const els = JukeboxManager.dom;
           // ΑΛΛΑΓΗ: Το textContent σταματάει το Layout Thrashing (Τεράστια εξοικονόμηση μπαταρίας/CPU)
           const trackName = els.textTarget ? els.textTarget.textContent : '';
           ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#e74c3c';
           ctx.fillText(trackName, 200, 110, 380);
           if (els.player && !els.player.paused) {
               ctx.fillStyle = '#ffffff';
               for(let i=0; i<6; i++) { let h = 10 + Math.random() * 25; ctx.fillRect(145 + (i*20), 180 - h, 10, h); }
           }
        };

        pipBtn.addEventListener('click', async () => {
           if (document.pictureInPictureElement) { 
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
               console.warn("PiP blocked by browser", e); 
           } finally {
               setTimeout(() => { isPipOpening = false; }, 100);
           }
        });

       video.addEventListener('leavepictureinpicture', () => {
            clearInterval(drawInterval);
            // ΔΙΟΡΘΩΣΗ: Παύση του κρυφού βίντεο και καταστροφή του stream για να σταματήσει να τρώει πόρους!
            video.pause();
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            }
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
      let isVerticalScrolling = false; // ΝΕΟ
      let isAnimatingSwipe = false; // ΝΕΟ
      const SWIPE_THRESHOLD = 90;

     // ΜΕΤΑ:
      const handleDragStart = (e) => {
        if (isAnimatingSwipe) return;
        if (e.target.closest('button, audio, .extra-tracks-wrapper, input')) return;
        
        container.dataset.isSwiping = 'true'; // ΑΛΛΑΓΗ: Ειδοποιούμε το Γυροσκόπιο ότι κάνουμε Swipe!
        
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY; // ΝΕΟ
        isDragging = true;
        isVerticalScrolling = false; // ΝΕΟ
        
        container.style.setProperty('transition', 'none', 'important');
      };

      const handleDragMove = (e) => {
        if (!isDragging || isVerticalScrolling) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY; // ΝΕΟ
        currentX = clientX - startX;
        const currentY = clientY - startY; // ΝΕΟ
        
  
     // ΔΙΟΡΘΩΣΗ: Αφαίρεση του X < 15. Αν η κάθετη κίνηση υπερτερεί της οριζόντιας (και είναι >10px), είναι σίγουρα Scroll!
       if (!isVerticalScrolling && Math.abs(currentY) > Math.abs(currentX) && Math.abs(currentY) > 10) {
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
          
          setTimeout(() => {
              container.style.transition = '';
              container.style.transform = '';
              container.dataset.isSwiping = 'false'; // ΚΡΙΣΙΜΟ: Ελευθερώνουμε το γυροσκόπιο ΜΟΝΟ ΑΦΟΥ τελειώσει το animation των 400ms!
          }, 400);
        }
        
        currentX = 0; 
      };

     // Αντικατάστησε ολόκληρη την animateSwipeOut με αυτή:
      const animateSwipeOut = (direction) => {
         isAnimatingSwipe = true; 

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
         
         // Αν το κουμπί έχει πραγματικό link (http) και όχι "LINK_3", παίξ'το!
        if (targetUrl.trim() !== "" && !targetUrl.includes('LINK_')) {
            JukeboxManager.playTrack(targetBtn, targetUrl, targetBtn.dataset.name);
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

      // Συγχρονισμός του native loop μόλις φορτώσει το script
      els.player.loop = (STATE.loopModeIndex === 2);

    // Events
      els.player.addEventListener('ended', JukeboxManager.handleTrackEnd);
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
      // 1. Αποθήκευση της νέας έντασης αν ο χρήστης την αλλάξει από τον Player
      // 1. Αποθήκευση της έντασης ΜΟΝΟ αν ο χρήστης την αλλάξει με το χέρι
      els.player.addEventListener('volumechange', () => {
         // ΑΛΛΑΓΗ: Το "> 0" έγινε ">= 0" για να αποθηκεύεται και η επιλογή Mute.
         if (!STATE.isFading && els.player.volume >= 0 && els.player.volume <= 1) {
             STATE.targetVolume = els.player.volume;
         }
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
      
      // ΜΕΤΑ:
      if (button && button.classList.contains('track-active')) {
          if (els.player.paused) {
             if (els.player.ended) els.player.currentTime = 0;
             
             // ΑΛΛΑΓΗ: Ρίχνουμε την ένταση στο 0 πριν παίξει, αλλιώς το Fade-In ΔΕΝ θα δουλέψει!
             clearInterval(STATE.fadeInterval);
             STATE.isFading = true;
             try { els.player.volume = 0; } catch(e) {}
             
             els.player.play().then(() => {
                 JukeboxManager.fadeAudio(STATE.targetVolume, 600);
             }).catch(()=>{ 
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

        if (els.textTarget) els.textTarget.innerHTML = name;
        if (typeof JukeboxManager.setupMediaSession === 'function') JukeboxManager.setupMediaSession(name);

        clearInterval(STATE.fadeInterval);
        STATE.isFading = true; 
        
        // ΔΙΟΡΘΩΣΗ (Race Condition): Ταυτότητα στην τρέχουσα εντολή
        STATE.playToken++;
        const currentToken = STATE.playToken;

        try { 
            els.player.volume = 0; 
            els.player.muted = false; // ΔΙΟΡΘΩΣΗ: Απεγκλωβισμός από το Mute!
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
      const els = JukeboxManager.dom;
      
      // Στοχεύουμε ΑΥΣΤΗΡΑ μόνο τα στοιχεία του Jukebox για να μην σπάσουμε το υπόλοιπο site
     const trackBtn = e.target.closest('.playlist-btn[data-url], .extra-track-btn[data-url]');
      if (trackBtn) {
        const url = trackBtn.dataset.url;
        const name = trackBtn.dataset.name;
        
        // ΑΛΛΑΓΗ (Bug 3): Προστέθηκε ο έλεγχος για dummy links (!url.includes('LINK_'))
        if (url && name && url.trim() !== "" && !url.includes('LINK_')) {
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
