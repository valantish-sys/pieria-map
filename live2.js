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
      { start: "12:35", end: "13:15", name: "6η Διδακτική", type: "class", nextIsBreak: true }
    ],
    timeThresholds: {
      afternoon: 13 * 60 + 15, // 13:15 (795 λεπτά)
      evening: 17 * 60,        // 17:00 (1020 λεπτά)
      nightStart: 21,          // 21:00
      nightEnd: 8              // 08:00
    },
    // ΕΔΩ ΒΑΖΕΙΣ ΤΑ ΔΙΚΑ ΣΟΥ ΜΗΝΥΜΑΤΑ (Τη βάση δεδομένων σου)
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
    usedMessages: {}
  };

  // Cached DOM Elements (Για μέγιστη ταχύτητα, δεν ψάχνουμε το DOM συνέχεια)
  const DOM = {
    mainEl: null,
    subEl: null,
    progBg: null,
    progFill: null,
    liveDot: null,
    trackerTitle: null,
    trackerBox: null
  };

  // ==========================================
  // 2. UTILS (Βοηθητικές Συναρτήσεις)
  // ==========================================
  const Utils = {
    timeToMins: (timeStr) => {
      const [hours, minutes] = timeStr.split(":");
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    },

    getHolidayStatus: (now) => {
      const year = now.getFullYear(), month = now.getMonth(), date = now.getDate(), timestamp = now.getTime();

      // Σταθερές Αργίες
      if (month === 9 && date === 28) return { main: "28η Οκτωβρίου 🇬🇷", sub: "Ζήτω η 28η Οκτωβρίου! Το σχολείο είναι κλειστό." };
      if (month === 10 && date === 17) return { main: "17η Νοεμβρίου 🎗️", sub: "Επέτειος Πολυτεχνείου. Ημέρα μνήμης." };
      if (month === 2 && date === 25) return { main: "25η Μαρτίου 🇬🇷", sub: "Ζήτω η 25η Μαρτίου! Χρόνια Πολλά!" };
      if (month === 4 && date === 1) return { main: "Πρωτομαγιά 🌺", sub: "Καλό μήνα! Το σχολείο είναι κλειστό σήμερα." };

      // Χριστούγεννα & Καλοκαίρι
      if ((month === 11 && date >= 24) || (month === 0 && date <= 7)) return { main: "Καλά Χριστούγεννα! 🎄✨", sub: "Καλές γιορτές και ευτυχισμένο το νέο έτος!" };
      if ((month === 5 && date >= 16) || month === 6 || month === 7 || (month === 8 && date <= 10)) return { main: "Καλό Καλοκαίρι! ☀️⛱️", sub: "Ραντεβού τον Σεπτέμβριο! Καλές βουτιές!" };

      // Υπολογισμός Πάσχα (Meeus/Gauss)
      const a = year % 19, b = year % 4, c = year % 7;
      const d = (19 * a + 15) % 30, e = (2 * b + 4 * c + 6 * d + 6) % 7;
      let pDay = 22 + d + e + 13, pMonth = 3;
      if (pDay > 31) { pDay -= 31; pMonth = 4; if (pDay > 30) { pDay -= 30; pMonth = 5; } }
      
      const easterSunday = new Date(year, pMonth - 1, pDay, 0, 0, 0);
      const easterStart = easterSunday.getTime() - 6 * 86400000; // Μεγάλη Δευτέρα
      const easterEnd = easterSunday.getTime() + 7 * 86400000 + 86399000; // Κυριακή Θωμά 23:59:59

      if (timestamp >= easterStart && timestamp <= easterEnd) return { main: "Καλό Πάσχα! 🐣🌷", sub: "Το σχολείο είναι κλειστό για τις διακοπές του Πάσχα." };

      const cleanMonday = new Date(easterSunday.getTime() - 48 * 86400000);
      if (date === cleanMonday.getDate() && month === cleanMonday.getMonth()) return { main: "Καθαρά Δευτέρα 🪁", sub: "Καλά Κούλουμα! Το σχολείο είναι κλειστό." };

      const holySpirit = new Date(easterSunday.getTime() + 50 * 86400000);
      if (date === holySpirit.getDate() && month === holySpirit.getMonth()) return { main: "Αγίου Πνεύματος 🙏", sub: "Τριήμερο Αγίου Πνεύματος. Το σχολείο είναι κλειστό." };

      return null;
    }
  };

  // ==========================================
  // 3. APP MANAGER (Λογική Συστήματος)
  // ==========================================
  const AppManager = {
    init: () => {
      // Βρίσκουμε το DOM ΜΟΝΟ μία φορά
      DOM.mainEl = document.getElementById("bell-main");
      DOM.subEl = document.getElementById("bell-sub");
      DOM.progBg = document.getElementById("bell-progress-bg");
      DOM.progFill = document.getElementById("bell-progress-fill");
      DOM.liveDot = document.getElementById("liveDot");
      DOM.trackerTitle = document.getElementById("trackerTitle");
      DOM.trackerBox = document.getElementById('bellTracker');

      if (!DOM.mainEl) return; // Αν δεν υπάρχει το HTML, σταμάτα.

      AppManager.updateTracker();
      setInterval(AppManager.updateTracker, 60000);

      // Radar Events
      if (DOM.trackerBox) {
        DOM.trackerBox.style.cursor = 'pointer';
        DOM.trackerBox.addEventListener('click', AppManager.handleRadarTrigger);
      }

      document.addEventListener('click', AppManager.handleGlobalClick);
    },

    updateTracker: () => {
      if (STATE.isShowingRadar) return; // Μην κάνεις update αν παίζει το ραντάρ

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const day = now.getDay();
      
      DOM.subEl.style.color = "";
      DOM.progBg.style.display = "none";
      DOM.liveDot.classList.remove("paused");
      DOM.trackerTitle.innerHTML = "Live Ωράριο";

      // 1. Αργίες
      const holiday = Utils.getHolidayStatus(now);
      if (holiday) {
        DOM.mainEl.innerHTML = holiday.main;
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = holiday.sub;
        DOM.liveDot.classList.add("paused");
        DOM.trackerTitle.innerHTML = "Σχολική Αργία";
        return;
      }
      
      // 2. Σαββατοκύριακο
      if (day === 0 || day === 6) {
        DOM.mainEl.innerHTML = "Καλό Σαββατοκύριακο!";
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = "Το σχολείο είναι κλειστό.";
        DOM.liveDot.classList.add("paused");
        return;
      }

      const schoolStart = Utils.timeToMins(CONFIG.schedule[0].start);
      const schoolEnd = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end);

      // Πριν / Μετά το σχολείο
      if (currentMins < schoolStart) {
        DOM.mainEl.innerHTML = "Καλημέρα!";
        DOM.mainEl.style.color = "#2c3e50";
        DOM.subEl.innerHTML = `Το κουδούνι χτυπάει σε ${schoolStart - currentMins} λεπτά.`;
        return;
      }
      if (currentMins >= schoolEnd) {
        DOM.mainEl.innerHTML = "Σχόλασμα!";
        DOM.mainEl.style.color = "rgba(17, 17, 17, 0.68)";
        DOM.subEl.innerHTML = "Τα μαθήματα ολοκληρώθηκαν για σήμερα.";
        return;
      }

      // 3. Τρέχουσα Ώρα
      for (let i = 0; i < CONFIG.schedule.length; i++) {
        const periodStart = Utils.timeToMins(CONFIG.schedule[i].start);
        const periodEnd = Utils.timeToMins(CONFIG.schedule[i].end);

        if (currentMins >= periodStart && currentMins < periodEnd) {
          DOM.mainEl.innerHTML = `Τρέχουσα: ${CONFIG.schedule[i].name}`;
          DOM.mainEl.style.color = "#2c3e50";
          
          const minsLeft = periodEnd - currentMins;
          
          if (CONFIG.schedule[i].type === "class") {
              if (i === CONFIG.schedule.length - 1) DOM.subEl.innerHTML = `Σχόλασμα σε ${minsLeft} λεπτά`;
              else if (CONFIG.schedule[i].nextIsBreak) DOM.subEl.innerHTML = `Το διάλειμμα ξεκινά σε ${minsLeft} λεπτά`;
              else DOM.subEl.innerHTML = `Η επόμενη ώρα ξεκινά σε ${minsLeft} λεπτά`;
          } else {
              DOM.subEl.innerHTML = `Μπαίνουμε στις τάξεις σε ${minsLeft} λεπτά`;
          }
          
          const percentage = ((currentMins - periodStart) / (periodEnd - periodStart)) * 100;
          DOM.progBg.style.display = "block";
          
          // RequestAnimationFrame είναι καλύτερο για performance από setTimeout
          window.requestAnimationFrame(() => {
              DOM.progFill.style.width = `${percentage}%`;
          });
          return;
        }
      }
    },

    handleRadarTrigger: (e) => {
      e.stopPropagation();
      if (STATE.isShowingRadar) return;

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
      
      if (!STATE.usedMessages[catName] || STATE.usedMessages[catName].length >= activeArray.length) {
          STATE.usedMessages[catName] = [];
      }
      
      const availableIndexes = activeArray.map((_, i) => i).filter(i => !STATE.usedMessages[catName].includes(i));
      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      
      STATE.usedMessages[catName].push(randomIndex);
      
      STATE.isShowingRadar = true;
      DOM.mainEl.innerHTML = "📡 Ραντάρ Δασκάλων...";
      DOM.mainEl.style.color = "#a90e0e";
      DOM.subEl.innerHTML = activeArray[randomIndex];
      DOM.subEl.style.color = "#1e6cff"; 

      clearTimeout(STATE.radarTimeout);
      STATE.radarTimeout = setTimeout(() => {
          STATE.isShowingRadar = false;
          AppManager.updateTracker();
      }, 7000);
    },

    handleGlobalClick: (e) => {
      if (STATE.isShowingRadar && (!DOM.trackerBox || !DOM.trackerBox.contains(e.target))) {
        clearTimeout(STATE.radarTimeout);
        STATE.isShowingRadar = false;
        AppManager.updateTracker();
      }
    }
  };

  // Ξεκινάμε
  document.addEventListener("DOMContentLoaded", AppManager.init);

})();
