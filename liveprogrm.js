document.addEventListener("DOMContentLoaded", function() {
  const schedule = [
    { start: "08:15", end: "09:00", name: "1η Διδακτική", type: "class", nextIsBreak: false },
    { start: "09:00", end: "09:40", name: "2η Διδακτική", type: "class", nextIsBreak: true },
    { start: "09:40", end: "10:00", name: "1ο Διάλειμμα", type: "break" },
    { start: "10:00", end: "10:45", name: "3η Διδακτική", type: "class", nextIsBreak: false },
    { start: "10:45", end: "11:30", name: "4η Διδακτική", type: "class", nextIsBreak: true },
    { start: "11:30", end: "11:45", name: "2ο Διάλειμμα", type: "break" },
    { start: "11:45", end: "12:25", name: "5η Διδακτική", type: "class", nextIsBreak: false },
    { start: "12:25", end: "12:35", name: "3ο Διάλειμμα", type: "break" },
    { start: "12:35", end: "13:15", name: "6η Διδακτική", type: "class", nextIsBreak: true }
  ];

  function timeToMins(timeStr) {
    let parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  // Έξυπνος έλεγχος αργιών και διακοπών
  function getHolidayStatus(now) {
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Ιανουάριος, 11 = Δεκέμβριος
    const date = now.getDate();
    const timestamp = now.getTime();

    // 1. Σταθερές Αργίες Έτους
    if (month === 9 && date === 28) return { main: "28η Οκτωβρίου 🇬🇷", sub: "Ζήτω η 28η Οκτωβρίου! Το σχολείο είναι κλειστό." };
    if (month === 10 && date === 17) return { main: "17η Νοεμβρίου 🎗️", sub: "Επέτειος Πολυτεχνείου. Ημέρα μνήμης." };
    if (month === 2 && date === 25) return { main: "25η Μαρτίου 🇬🇷", sub: "Ζήτω η 25η Μαρτίου! Χρόνια Πολλά!" };
    if (month === 4 && date === 1) return { main: "Πρωτομαγιά 🌺", sub: "Καλό μήνα! Το σχολείο είναι κλειστό σήμερα." };

    // 2. Διακοπές Χριστουγέννων (24 Δεκεμβρίου έως 7 Ιανουαρίου)
    if ((month === 11 && date >= 24) || (month === 0 && date <= 7)) {
      return { main: "Καλά Χριστούγεννα! 🎄✨", sub: "Καλές γιορτές και ευτυχισμένο το νέο έτος!" };
    }

    // 3. Διακοπές Καλοκαιριού (16 Ιουνίου έως 10 Σεπτεμβρίου)
    if ((month === 5 && date >= 16) || month === 6 || month === 7 || (month === 8 && date <= 10)) {
      return { main: "Καλό Καλοκαίρι! ☀️⛱️", sub: "Ραντεβού τον Σεπτέμβριο! Καλές βουτιές!" };
    }

    // 4. Υπολογισμός Ορθόδοξου Πάσχα (Αλγόριθμος Meeus/Gauss)
    const a = year % 19;
    const b = year % 4;
    const c = year % 7;
    const d = (19 * a + 15) % 30;
    const e = (2 * b + 4 * c + 6 * d + 6) % 7;
    let julianDays = 22 + d + e;
    let gregorianDays = julianDays + 13; // Διόρθωση ημερολογίου για τον 21ο αιώνα
    
    let pMonth = 3; // Μάρτιος
    let pDay = gregorianDays;
    if (pDay > 31) {
      pDay -= 31;
      pMonth = 4; // Απρίλιος
      if (pDay > 30) {
        pDay -= 30;
        pMonth = 5; // Μάιος
      }
    }
    
    // Η ακριβής ημέρα του Πάσχα (τα μεσάνυχτα)
    const easterSunday = new Date(year, pMonth - 1, pDay, 0, 0, 0);
    
    // Διακοπές Πάσχα: Από Μεγάλη Δευτέρα (Easter - 6 μέρες) έως Κυριακή του Θωμά (Easter + 7 μέρες)
    const easterStart = new Date(easterSunday.getTime() - 6 * 24 * 60 * 60 * 1000).getTime();
    const easterEnd = new Date(easterSunday.getTime() + 7 * 24 * 60 * 60 * 1000);
    easterEnd.setHours(23, 59, 59);
    const easterEndTime = easterEnd.getTime();

    if (timestamp >= easterStart && timestamp <= easterEndTime) {
      return { main: "Καλό Πάσχα! 🐣🌷", sub: "Το σχολείο είναι κλειστό για τις διακοπές του Πάσχα." };
    }

    // Καθαρά Δευτέρα (Easter - 48 μέρες)
    const cleanMonday = new Date(easterSunday.getTime() - 48 * 24 * 60 * 60 * 1000);
    if (date === cleanMonday.getDate() && month === cleanMonday.getMonth()) {
      return { main: "Καθαρά Δευτέρα 🪁", sub: "Καλά Κούλουμα! Το σχολείο είναι κλειστό." };
    }

    // Αγίου Πνεύματος (Easter + 50 μέρες)
    const holySpirit = new Date(easterSunday.getTime() + 50 * 24 * 60 * 60 * 1000);
    if (date === holySpirit.getDate() && month === holySpirit.getMonth()) {
      return { main: "Αγίου Πνεύματος 🙏", sub: "Τριήμερο Αγίου Πνεύματος. Το σχολείο είναι κλειστό." };
    }

    return null; // Αν δεν είναι τίποτα από όλα αυτά, η μέρα είναι κανονική
  }

  function updateTracker() {
    const now = new Date();
    const day = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    const mainEl = document.getElementById("bell-main");
    const subEl = document.getElementById("bell-sub");
subEl.style.color = "";
    const progBg = document.getElementById("bell-progress-bg");
    const progFill = document.getElementById("bell-progress-fill");
    const liveDot = document.getElementById("liveDot");
    const trackerTitle = document.getElementById("trackerTitle");
    
    progBg.style.display = "none";
    liveDot.classList.remove("paused");
    trackerTitle.innerHTML = "Live Ωράριο";

    // 1. Έλεγχος Μεγάλων Διακοπών & Αργιών
    const holiday = getHolidayStatus(now);
    if (holiday) {
      mainEl.innerHTML = holiday.main;
      mainEl.style.color = "#a90e0e";
      subEl.innerHTML = holiday.sub;
      liveDot.classList.add("paused"); // Σταματάει να αναβοσβήνει
      trackerTitle.innerHTML = "Σχολική Αργία";
      return;
    }
    
    // 2. Έλεγχος Σαββατοκύριακου
    if (day === 0 || day === 6) {
      mainEl.innerHTML = "Καλό Σαββατοκύριακο!";
      mainEl.style.color = "#a90e0e";
      subEl.innerHTML = "Το σχολείο είναι κλειστό.";
      liveDot.classList.add("paused");
      return;
    }

    const schoolStart = timeToMins(schedule[0].start);
    const schoolEnd = timeToMins(schedule[schedule.length - 1].end);

    // Πριν την έναρξη των μαθημάτων
    if (currentMins < schoolStart) {
      mainEl.innerHTML = "Καλημέρα!";
      mainEl.style.color = "#2c3e50";
      subEl.innerHTML = "Το κουδούνι χτυπάει σε " + (schoolStart - currentMins) + " λεπτά.";
      return;
    }

    // Μετά το σχόλασμα
    if (currentMins >= schoolEnd) {
      mainEl.innerHTML = "Σχολείο Κλειστό";
      mainEl.style.color = "rgba(17, 17, 17, 0.68)";
      subEl.innerHTML = "Τα μαθήματα ολοκληρώθηκαν για σήμερα.";
      return;
    }

    // 3. Ροή Ωρολογίου Προγράμματος
    for (let i = 0; i < schedule.length; i++) {
      let periodStart = timeToMins(schedule[i].start);
      let periodEnd = timeToMins(schedule[i].end);

      if (currentMins >= periodStart && currentMins < periodEnd) {
        mainEl.innerHTML = "Τρέχουσα: " + schedule[i].name;
        mainEl.style.color = "#2c3e50";
        
        let minsLeft = periodEnd - currentMins;
        
        if (schedule[i].type === "class") {
            if (i === schedule.length - 1) {
                subEl.innerHTML = "Σχόλασμα σε " + minsLeft + " λεπτά";
            } else if (schedule[i].nextIsBreak) {
                subEl.innerHTML = "Το διάλειμμα ξεκινά σε " + minsLeft + " λεπτά";
            } else {
                subEl.innerHTML = "Η επόμενη ώρα ξεκινά σε " + minsLeft + " λεπτά";
            }
        } else {
            subEl.innerHTML = "Μπαίνουμε στις τάξεις σε " + minsLeft + " λεπτά";
        }
        
        // Υπολογισμός Μπάρας Προόδου
        let periodDuration = periodEnd - periodStart;
        let elapsed = currentMins - periodStart;
        let percentage = (elapsed / periodDuration) * 100;
        
        progBg.style.display = "block";
        setTimeout(() => {
            progFill.style.width = percentage + "%";
        }, 100);
        
        return;
      }
    }
  }

  updateTracker();
  setInterval(updateTracker, 60000); // Ανανέωση ανά λεπτό
// === 📡 ΜΥΣΤΙΚΟ ΡΑΝΤΑΡ ΔΑΣΚΑΛΩΝ ===
  const trackerBox = document.getElementById('bellTracker');
  let isShowingRadar = false;
  let radarTimeout;
  let usedMessages = {};

  const msgClass = [
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
  ];

  const msgBreak = [
    "Εφημερία στην αυλή: Κάνουν τον διαιτητή, τον νοσοκόμο και τον ειρηνοποιό! ⚽🩹",
    "Τρέχουν στο γραφείο για φωτοτυπίες σε χρόνο ρεκόρ! 🖨️🏃‍♂️",
    "Προσπαθούν να φάνε το κολατσιό τους πριν ακουστεί πάλι το κουδούνι! 🥪🔔",
    "Αναζητούν 5 λεπτά ησυχίας, αλλά η αυλή έχει 100 ντεσιμπέλ! 📢",
    "Πίνουν δύο γουλιές καφέ και αμέσως τους φωνάζουν: 'Κυρία, ο Γιώργος με έσπρωξε!' ☕🏃‍♀️",
    "Κάνουν βόλτες στους διαδρόμους για να βεβαιωθούν ότι κανείς δεν τρέχει επικίνδυνα! 🏃‍♂️🚫",
    "Κοιτάζουν το ρολόι και αναρωτιούνται πώς πέρασαν κιόλας αυτά τα 15 λεπτά! 🕒🤯",
"Μαζεύουν τις μπάλες που έφυγαν κατά λάθος από το γήπεδο και έπεσαν στα λουλούδια! ⚽🌸",
    "Προσπαθούν να πείσουν τους μαθητές να μπουν στην τάξη, ενώ εκείνοι θέλουν 'μόνο 1 λεπτό ακόμα'! 🏃‍♂️",
    "Συζητούν με συναδέλφους για το πόσο γρήγορα περνάει η μέρα στο σχολείο! 🗣️"
  ];

  const msgAfternoon = [
    "Επιστρέφουν σπίτι, τρώνε και ελπίζουν να μην έχουν πολλά τετράδια για διόρθωμα! 🍝🙏",
    "Κάνουν ένα μικρό διάλειμμα για ξεκούραση πριν την προετοιμασία της αυριανής μέρας. 🛋️",
    "Πίνουν τον απογευματινό καφέ τους προσπαθώντας να θυμηθούν πού έβαλαν τους μαρκαδόρους! ☕💭",
    "Σκέφτονται ποιοι μαθητές χρειάζονται λίγη παραπάνω βοήθεια ή ενθάρρυνση αύριο. 🧠❤️",
    "Απολαμβάνουν λίγη απόλυτη ησυχία πριν ξεκινήσει ο επόμενος γύρος υποχρεώσεων. 🧘‍♂️✨",
"Προγραμματίζουν τις δράσεις της επόμενης σχολικής γιορτής στον υπολογιστή! 🎭",
    "Καθαρίζουν το γραφείο τους από τα χαρτιά της ημέρας για να είναι έτοιμοι για αύριο! 🧹"
  ];

  const msgEvening = [
    "Διορθώνουν τετράδια με το κόκκινο στιλό και πολλή υπομονή... 📝🖍️",
    "Ψάχνουν στο ίντερνετ έξυπνες ιδέες για να σας κάνουν το αυριανό μάθημα πιο ωραίο! 💻💡",
    "Φτιάχνουν το πρόγραμμα της επόμενης μέρας και ετοιμάζουν την τσάντα τους. 📋🎒",
    "Συμπληρώνουν βαθμολογίες, απουσίες και γράφουν παρατηρήσεις με πολλή προσοχή. 📊🖋️",
    "Απαντούν σε email γονέων και οργανώνουν τις αυριανές παρουσιάσεις. 💻📧",
    "Κλείνουν επιτέλους τα βιβλία για να δουν λίγη τηλεόραση ή να χαλαρώσουν. 📺📚",
"Προετοιμάζουν το ψηφιακό υλικό για την αυριανή διδασκαλία στον υπολογιστή! 🖱️",
    "Αναρωτιούνται αν οι μαθητές θα καταλάβουν την έκπληξη που τους ετοιμάζουν! 🎁",
    "Βάζουν τάξη στις σημειώσεις τους για να μην ψάχνονται αύριο το πρωί! 📂"
  ];

  const msgNight = [
    "Σσσς! Οι δάσκαλοι κοιμούνται. Φορτίζουν τη μπαταρία τους στο 100% για αύριο! 😴🔋",
    "Ονειρεύονται μια τάξη που όλοι κάθονται ήσυχα... (Μάλλον επιστημονική φαντασία!) 🌌🛌",
    "Ανακτούν δυνάμεις για να αντιμετωπίσουν αύριο πάλι τα 'ξεχασμένα' τετράδια! 🌙💤",
    "Το μυαλό τους πάει για ύπνο, αλλά η αυριανή εισαγωγή στο μάθημα παίζει ακόμα στο repeat! 🧠🔄",
    "Κλειστά κινητά, κλειστά βιβλία, ώρα για την απαραίτητη νυχτερινή ξεκούραση. 🛌🌟",
"Ξεχνάνε το ξυπνητήρι... αλλά το σχολικό άγχος τους ξυπνάει πριν από αυτό! ⏰",
    "Προσπαθούν να θυμηθούν αν έκλεισαν τα φώτα στην τάξη! 💡",
    "Απολαμβάνουν το όνειρο ότι το κουδούνι δεν χτύπησε ποτέ! 🔔💤"
  ];

  const msgWeekend = [
    "Αποτοξίνωση από το κουδούνι! Έχουν βάλει το ξυπνητήρι στο αθόρυβο. 🔕🛋️",
    "Ξεκουράζουν τη φωνή τους, γιατί από Δευτέρα έχει πάλι ομιλία και φασαρία! 🤫🎶",
    "Προσπαθούν να μην σκεφτούν το σχολείο... αλλά σίγουρα θυμούνται αστεία σας! 🚲🌳",
    "Βγαίνουν για μια βόλτα ή έναν καφέ με φίλους, χωρίς να ακούνε φωνές και τρεχαλητά! 🏙️☕",
    "Κάνουν τα ψώνια της εβδομάδας, βλέπουν τις οικογένειές τους και γεμίζουν μπαταρίες. 🛒☀️",
"Πηγαίνουν μια βόλτα στη φύση για να ξεχάσουν το 'Κυρία, ο Γιώργος...' 🌿",
    "Διαβάζουν ένα βιβλίο που δεν έχει καμία σχέση με σχολικό εγχειρίδιο! 📖",
    "Απολαμβάνουν τον ύπνο της Κυριακής μέχρι αργά, χωρίς να ανησυχούν για την 1η ώρα! 😴"
  ];

  const msgHoliday = [
    "Λειτουργία 'Μην Ενοχλείτε'. Η μπαταρία γεμίζει... Τα λέμε όταν ανοίξουν τα σχολεία! 🏖️🍹",
    "Χωρίς ξυπνητήρια, χωρίς προγράμματα! Απολαμβάνουν ελεύθερο χρόνο και ηρεμία. 🌅🕶️",
    "Αδειάζουν το μυαλό τους από τις ασκήσεις και γεμίζουν με όμορφες στιγμές ξεγνοιασιάς! 🍉🏕️",
    "Ταξιδεύουν, ξεκουράζονται και ξεχνούν για λίγο τι σημαίνει 'ώρα για μάθημα'! ✈️🌍",
"Εξερευνούν μέρη που δεν έχουν 'μαθητές' να τους ρωτάνε 'Τι ώρα φεύγουμε;' 🗺️",
    "Ετοιμάζουν τη βαλίτσα τους και αφήνουν τα τετράδια στο κάτω ράφι! 🧳",
    "Απολαμβάνουν τον ήλιο και τη θάλασσα, μακριά από τον πίνακα και τον μαρκαδόρο! 🌊"
  ];

  if (trackerBox) {
    trackerBox.style.cursor = 'pointer';
    trackerBox.addEventListener('click', function(event) {
      event.stopPropagation();
      if (isShowingRadar) return;

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const hour = now.getHours();
      const day = now.getDay();
      const isHoliday = getHolidayStatus(now);

      let catName = 'class';
      if (isHoliday) catName = 'holiday';
      else if (day === 0 || day === 6) catName = 'weekend';
      else if (hour >= 21 || hour < 8) catName = 'night';
      else if (currentMins >= 1020) catName = 'evening';
      else if (currentMins >= 795) catName = 'afternoon';
      else {
          let currentType = null;
          for (let i = 0; i < schedule.length; i++) {
              if (currentMins >= timeToMins(schedule[i].start) && currentMins < timeToMins(schedule[i].end)) {
                  currentType = schedule[i].type;
                  break;
              }
          }
          catName = (currentType === 'break') ? 'break' : 'class';
      }

      let activeArray = (catName === 'class') ? msgClass : (catName === 'break') ? msgBreak : (catName === 'afternoon') ? msgAfternoon : (catName === 'evening') ? msgEvening : (catName === 'night') ? msgNight : (catName === 'weekend') ? msgWeekend : msgHoliday;

      if (!usedMessages[catName] || usedMessages[catName].length >= activeArray.length) usedMessages[catName] = [];
      let availableIndexes = activeArray.map((_, i) => i).filter(i => !usedMessages[catName].includes(i));
      let randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      
      usedMessages[catName].push(randomIndex);
      let selectedMsg = activeArray[randomIndex];

      isShowingRadar = true;
      document.getElementById("bell-main").innerHTML = "📡 Ραντάρ Δασκάλων...";
      document.getElementById("bell-main").style.color = "#a90e0e";
      document.getElementById("bell-sub").innerHTML = selectedMsg;
document.getElementById("bell-sub").style.color = "#1e6cff"; // <- Βάλε εδώ το χρώμα που θες για το μυστικό!

      clearTimeout(radarTimeout);
      radarTimeout = setTimeout(() => { isShowingRadar = false; updateTracker(); }, 7000);
    });
  }

  ['click', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, function() {
      if (isShowingRadar) {
        clearTimeout(radarTimeout);
        isShowingRadar = false;
        updateTracker();
      }
    });
  });
// ΤΕΛΟΣ ΡΑΝΤΑΡ
}); // <-- ΑΥΤΟ ΤΟ ΚΛΕΙΣΙΜΟ ΕΛΕΙΠΕ
