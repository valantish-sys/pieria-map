(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION (Ρυθμίσεις & Δεδομένα)
  // ==========================================
  const CONFIG = Object.freeze({
    schedule: [
      { start: "08:15", end: "09:00", name: "1η Διδακτική", type: "class", nextIsBreak: false },
      { start: "09:00", end: "09:40", name: "2η Διδακτική", type: "class", nextIsBreak: true },
      { start: "09:40", end: "10:00", name: "1ο Διάλειμμα", type: "break" },
      { start: "10:00", end: "10:45", name: "3η Διδακτική", type: "class", nextIsBreak: false },
      { start: "10:45", end: "11:30", name: "4η Διδακτική", type: "class", nextIsBreak: true },
      { start: "11:30", end: "11:45", name: "2ο Διάλειμμα", type: "break" },
      { start: "11:45", end: "12:25", name: "5η Διδακτική", type: "class", nextIsBreak: false },
      { start: "12:25", end: "12:35", name: "3ο Διάλειμμα", type: "break" },
      { start: "12:35", end: "13:15", name: "6η Διδακτική", type: "class", nextIsBreak: false } // [FIX] Όχι nextIsBreak εδώ!
    ],
    timeThresholds: {
      afternoon: 13 * 60 + 15,
      evening: 17 * 60,
      nightStart: 21,
      nightEnd: 8
    },
    // Η βάση δεδομένων σου (Επικόλλησε εδώ τα δικά σου)
   radarMessages: {
      class: [
    "Εξηγούν το μάθημα, ενώ κάποιος ρωτάει: 'Κύριε, πότε χτυπάει;' ⏳",
    "Γράφουν στον πίνακα και μαντεύουν ποιος ψιθυρίζει στο τρίτο θρανίο! 👀",
    "Μοιράζουν απλόχερα γνώση... και ίσως καμιά εργασία για το σπίτι! 📝",
    "Βοηθούν να λυθεί εκείνη η δύσκολη άσκηση πριν τελειώσει η ώρα! 🔢",
    "Κάνουν ερωτήσεις και χαίρονται όταν βλέπουν όλα τα χέρια ψηλά! 🙋‍♂️🙋‍♀️",
    "Ακούνε την κλασική δικαιολογία: 'Κύριε, το τετράδιο το ξέχασα στο σπίτι!' 📓🤷‍♂️",
    "Προσπαθούν να εξηγήσουν τη θεωρία ενώ κάποιος ξύνει το μολύβι του με τις ώρες! ✏️🗑️",
    "Ανοίγουν το παράθυρο για να μπει λίγος αέρας και να ξυπνήσουν οι πίσω σειρές! 🪟💨",
"Παρατηρούν ότι όλη η τάξη κοιτάζει το ρολόι, οπότε λένε: 'Αφήστε το, θα το συνεχίσουμε αύριο!' ⌚",
    "Μοιράζουν φωτοτυπίες και εύχονται να μην μπερδευτούν τα χαρτιά πάνω στα θρανία! 📄",
    "Επιβραβεύουν την προσπάθεια της τάξης και χαμογελούν με ένα αστείο που είπε μία συμμαθήτρια! 😊"
],
      break: ["Εφημερία στην αυλή: Κάνουν τον διαιτητή, τον νοσοκόμο και τον ειρηνοποιό! ⚽🩹",
    "Τρέχουν στο γραφείο για φωτοτυπίες σε χρόνο ρεκόρ! 🖨️🏃‍♂️",
    "Προσπαθούν να φάνε το κολατσιό τους πριν ακουστεί πάλι το κουδούνι! 🥪🔔",
    "Αναζητούν 5 λεπτά ησυχίας, αλλά η αυλή έχει 100 ντεσιμπέλ! 📢",
    "Πίνουν δύο γουλιές καφέ και αμέσως τους φωνάζουν: 'Κυρία, ο Γιώργος με έσπρωξε!' ☕🏃‍♀️",
    "Κάνουν βόλτες στους διαδρόμους για να βεβαιωθούν ότι κανείς δεν τρέχει επικίνδυνα! 🏃‍♂️🚫",
    "Κοιτάζουν το ρολόι και αναρωτιούνται πώς πέρασαν κιόλας αυτά τα 15 λεπτά! 🕒🤯",
"Μαζεύουν τις μπάλες που έφυγαν κατά λάθος από το γήπεδο και έπεσαν στα λουλούδια! ⚽🌸",
    "Προσπαθούν να πείσουν τους μαθητές να μπουν στην τάξη, ενώ εκείνοι θέλουν 'μόνο 1 λεπτό ακόμα'! 🏃‍♂️",
    "Συζητούν με συναδέλφους για το πόσο γρήγορα περνάει η μέρα στο σχολείο! 🗣️"
],
      afternoon: ["Επιστρέφουν σπίτι, τρώνε και ελπίζουν να μην έχουν πολλά τετράδια για διόρθωμα! 🍝🙏",
    "Κάνουν ένα μικρό διάλειμμα για ξεκούραση πριν την προετοιμασία της αυριανής μέρας. 🛋️",
    "Πίνουν τον απογευματινό καφέ τους προσπαθώντας να θυμηθούν πού έβαλαν τους μαρκαδόρους! ☕💭",
    "Σκέφτονται ποιοι μαθητές χρειάζονται λίγη παραπάνω βοήθεια ή ενθάρρυνση αύριο. 🧠❤️",
    "Απολαμβάνουν λίγη απόλυτη ησυχία πριν ξεκινήσει ο επόμενος γύρος υποχρεώσεων. 🧘‍♂️✨",
"Προγραμματίζουν τις δράσεις της επόμενης σχολικής γιορτής στον υπολογιστή! 🎭",
    "Καθαρίζουν το γραφείο τους από τα χαρτιά της ημέρας για να είναι έτοιμοι για αύριο! 🧹"],
      evening: ["Διορθώνουν τετράδια με το κόκκινο στιλό και πολλή υπομονή... 📝🖍️",
    "Ψάχνουν στο ίντερνετ έξυπνες ιδέες για να σας κάνουν το αυριανό μάθημα πιο ωραίο! 💻💡",
    "Φτιάχνουν το πρόγραμμα της επόμενης μέρας και ετοιμάζουν την τσάντα τους. 📋🎒",
    "Συμπληρώνουν βαθμολογίες, απουσίες και γράφουν παρατηρήσεις με πολλή προσοχή. 📊🖋️",
    "Απαντούν σε email γονέων και οργανώνουν τις αυριανές παρουσιάσεις. 💻📧",
    "Κλείνουν επιτέλους τα βιβλία για να δουν λίγη τηλεόραση ή να χαλαρώσουν. 📺📚",
"Προετοιμάζουν το ψηφιακό υλικό για την αυριανή διδασκαλία στον υπολογιστή! 🖱️",
    "Αναρωτιούνται αν οι μαθητές θα καταλάβουν την έκπληξη που τους ετοιμάζουν! 🎁",
    "Βάζουν τάξη στις σημειώσεις τους για να μην ψάχνονται αύριο το πρωί! 📂"],
      night: ["Σσσς! Οι δάσκαλοι κοιμούνται. Φορτίζουν τη μπαταρία τους στο 100% για αύριο! 😴🔋",
    "Ονειρεύονται μια τάξη που όλοι κάθονται ήσυχα... (Μάλλον επιστημονική φαντασία!) 🌌🛌",
    "Ανακτούν δυνάμεις για να αντιμετωπίσουν αύριο πάλι τα 'ξεχασμένα' τετράδια! 🌙💤",
    "Το μυαλό τους πάει για ύπνο, αλλά η αυριανή εισαγωγή στο μάθημα παίζει ακόμα στο repeat! 🧠🔄",
    "Κλειστά κινητά, κλειστά βιβλία, ώρα για την απαραίτητη νυχτερινή ξεκούραση. 🛌🌟",
"Ξεχνάνε το ξυπνητήρι... αλλά το σχολικό άγχος τους ξυπνάει πριν από αυτό! ⏰",
    "Προσπαθούν να θυμηθούν αν έκλεισαν τα φώτα στην τάξη! 💡",
    "Απολαμβάνουν το όνειρο ότι το κουδούνι δεν χτύπησε ποτέ! 🔔💤"],
      weekend: ["Αποτοξίνωση από το κουδούνι! Έχουν βάλει το ξυπνητήρι στο αθόρυβο. 🔕🛋️",
    "Ξεκουράζουν τη φωνή τους, γιατί από Δευτέρα έχει πάλι ομιλία και φασαρία! 🤫🎶",
    "Προσπαθούν να μην σκεφτούν το σχολείο... αλλά σίγουρα θυμούνται αστεία σας! 🚲🌳",
    "Βγαίνουν για μια βόλτα ή έναν καφέ με φίλους, χωρίς να ακούνε φωνές και τρεχαλητά! 🏙️☕",
    "Κάνουν τα ψώνια της εβδομάδας, βλέπουν τις οικογένειές τους και γεμίζουν μπαταρίες. 🛒☀️",
"Πηγαίνουν μια βόλτα στη φύση για να ξεχάσουν το 'Κυρία, ο Γιώργος...' 🌿",
    "Διαβάζουν ένα βιβλίο που δεν έχει καμία σχέση με σχολικό εγχειρίδιο! 📖",
    "Απολαμβάνουν τον ύπνο της Κυριακής μέχρι αργά, χωρίς να ανησυχούν για την 1η ώρα! 😴"
],
      holiday: ["Λειτουργία 'Μην Ενοχλείτε'. Η μπαταρία γεμίζει... Τα λέμε όταν ανοίξουν τα σχολεία! 🏖️🍹",
    "Χωρίς ξυπνητήρια, χωρίς προγράμματα! Απολαμβάνουν ελεύθερο χρόνο και ηρεμία. 🌅🕶️",
    "Αδειάζουν το μυαλό τους από τις ασκήσεις και γεμίζουν με όμορφες στιγμές ξεγνοιασιάς! 🍉🏕️",
    "Ταξιδεύουν, ξεκουράζονται και ξεχνούν για λίγο τι σημαίνει 'ώρα για μάθημα'! ✈️🌍",
"Εξερευνούν μέρη που δεν έχουν 'μαθητές' να τους ρωτάνε 'Τι ώρα φεύγουμε;' 🗺️",
    "Ετοιμάζουν τη βαλίτσα τους και αφήνουν τα τετράδια στο κάτω ράφι! 🧳",
    "Απολαμβάνουν τον ήλιο και τη θάλασσα, μακριά από τον πίνακα και τον μαρκαδόρο! 🌊"]
    }
  });

const STATE = {
    isShowingRadar: false,
    radarTimeout: null,
    usedMessages: {},
    lastMessageIndex: {},
    // --- ΝΕΕΣ ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΤΑ ΕΦΕ ---
    isHovering: false,       // Για το Pause on Hover
    typewriterInterval: null, // Για τη γραφομηχανή
  gyroEnabled: false
  };

  const DOM = {
    mainEl: null, subEl: null, progBg: null, progFill: null,
    liveDot: null, trackerTitle: null, trackerBox: null, minimap: null
  };

  const Utils = {
    timeToMins: (timeStr) => {
      const [hours, minutes] = timeStr.split(":");
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
        DOM.trackerBox.addEventListener('touchstart', () => STATE.isHovering = true, {passive: true});
        DOM.trackerBox.addEventListener('touchend', () => setTimeout(() => STATE.isHovering = false, 2000), {passive: true});
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
      
      DOM.subEl.style.color = "";
      DOM.progBg.style.display = "none";
      DOM.liveDot.classList.remove("paused");
      DOM.trackerTitle.innerHTML = "Live Ωράριο";
      DOM.progFill.className = "bell-progress-fill"; // Καθαρίζουμε τα προηγούμενα χρώματα
     // --- ΝΕΟ: Εμφάνιση και ενημέρωση του Mini-Map ---
      if (DOM.minimap) DOM.minimap.style.display = "flex";
      AppManager.updateMiniMap(totalCurrentSecs);

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

      const schoolStartSecs = Utils.timeToMins(CONFIG.schedule[0].start) * 60;
      const schoolEndSecs = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end) * 60;

      if (totalCurrentSecs < schoolStartSecs) {
        DOM.mainEl.innerHTML = "Καλημέρα!";
        DOM.mainEl.style.color = "#2c3e50";
        const diffSecs = schoolStartSecs - totalCurrentSecs;
        
        // --- ΝΕΟ: Δευτερόλεπτα το πρωί! ---
        if (diffSecs <= 60) {
            DOM.subEl.innerHTML = `Το κουδούνι χτυπάει σε <span style="color:#e74c3c; font-weight:bold;">${diffSecs} δευτερόλεπτα!</span>`;
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
              timeMsg = `σε <span style="color:#e74c3c; font-weight:bold;">${secsLeft} δευτερόλεπτα!</span>`;
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

      // iOS 13+ απαιτεί ρητή άδεια με Promise
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
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

      // Βελτιστοποίηση με requestAnimationFrame για απόλυτο 60fps χωρίς lag
      window.requestAnimationFrame(() => {
        DOM.progFill.style.setProperty('--gyro-tilt', `${tilt}deg`);
      });
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
      else if (currentMins >= CONFIG.timeThresholds.afternoon) catName = 'afternoon';
      else {
          let currentType = 'class';
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
          STATE.usedMessages[catName] = STATE.lastMessageIndex[catName] !== undefined ? [STATE.lastMessageIndex[catName]] : [];
      }
      
      const availableIndexes = activeArray.map((_, i) => i).filter(i => !STATE.usedMessages[catName].includes(i));
      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      
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
          
          STATE.typewriterInterval = setInterval(() => {
              if (charIndex < targetMessage.length) {
                  DOM.subEl.innerHTML = targetMessage.substring(0, charIndex + 1) + '<span class="typewriter-cursor"></span>';
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
})();live7.js
