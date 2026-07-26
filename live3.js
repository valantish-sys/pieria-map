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
      class: [],
      break: [],
      afternoon: [],
      evening: [],
      night: [],
      weekend: [],
      holiday: []
    }
  });

  const STATE = {
    isShowingRadar: false,
    radarTimeout: null,
    usedMessages: {},
    lastMessageIndex: {} // [FIX] Μνήμη τελευταίου μηνύματος
  };

  const DOM = {
    mainEl: null, subEl: null, progBg: null, progFill: null,
    liveDot: null, trackerTitle: null, trackerBox: null
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

      if (!DOM.mainEl) return;

      AppManager.startClockSync();

      if (DOM.trackerBox) {
        DOM.trackerBox.style.cursor = 'pointer';
        DOM.trackerBox.addEventListener('click', AppManager.handleRadarTrigger);
      }

      document.addEventListener('click', AppManager.handleGlobalClick);
    },

    // [FIX] Ακριβής συγχρονισμός με το ρολόι του υπολογιστή (μηδένιση στο λεπτό)
    startClockSync: () => {
      AppManager.updateTracker(); // Τρέχει άμεσα
      const now = new Date();
      const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      
      setTimeout(() => {
        AppManager.updateTracker();
        setInterval(AppManager.updateTracker, 60000);
      }, msUntilNextMinute);
    },

    updateTracker: () => {
      if (STATE.isShowingRadar) return;

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const day = now.getDay();
      
      DOM.subEl.style.color = "";
      DOM.progBg.style.display = "none";
      DOM.liveDot.classList.remove("paused");
      DOM.trackerTitle.innerHTML = "Live Ωράριο";

      const holiday = Utils.getHolidayStatus(now);
      if (holiday) {
        DOM.mainEl.innerHTML = holiday.main;
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = holiday.sub;
        DOM.liveDot.classList.add("paused");
        DOM.trackerTitle.innerHTML = "Σχολική Αργία";
        return;
      }
      
      if (day === 0 || day === 6) {
        DOM.mainEl.innerHTML = "Καλό Σαββατοκύριακο!";
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = "Το σχολείο είναι κλειστό.";
        DOM.liveDot.classList.add("paused");
        return;
      }

      const schoolStart = Utils.timeToMins(CONFIG.schedule[0].start);
      const schoolEnd = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end);

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
      if (activeArray.length === 0) activeArray.push("Σσσς! Το ραντάρ ξεκουράζεται."); 
      
      if (!STATE.usedMessages[catName]) STATE.usedMessages[catName] = [];
      
      // [FIX] Όταν κάνει reset, κρατάμε εκτός το τελευταίο μήνυμα για να μην ξαναπαίξει αμέσως
      if (STATE.usedMessages[catName].length >= activeArray.length) {
          STATE.usedMessages[catName] = STATE.lastMessageIndex[catName] !== undefined ? [STATE.lastMessageIndex[catName]] : [];
      }
      
      const availableIndexes = activeArray.map((_, i) => i).filter(i => !STATE.usedMessages[catName].includes(i));
      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      
      STATE.usedMessages[catName].push(randomIndex);
      STATE.lastMessageIndex[catName] = randomIndex;
      
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

  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", AppManager.init);
  } else {
      AppManager.init();
  }
})();
