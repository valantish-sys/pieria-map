(() => {
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
          // [FIX] Χρήση Intl.Segmenter για απόλυτα ασφαλή διαχωρισμό των σύνθετων Emojis (ZWJ) χωρίς οπτικά glitches
          const segmenter = new Intl.Segmenter('el', { granularity: 'grapheme' });
          const msgChars = Array.from(segmenter.segment(targetMessage)).map(s => s.segment);
          
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
