(function() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
document.getElementById('dynamic-day-icon').innerText = currentDay;
  const dateKey = currentMonth + "-" + currentDay;

  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  document.getElementById('eort-date').innerText = today.toLocaleDateString('el-GR', dateOptions);

  // Συναρτήσεις Πάσχα
  function getOrthodoxEaster(year) {
    const a = year % 19, b = year % 4, c = year % 7;
    const d = (19 * a + 15) % 30;
    const e = (2 * b + 4 * c + 6 * d + 6) % 7;
    let date = new Date(year, 2, 22);
    date.setDate(date.getDate() + (d + e + 13));
    return date;
  }
  const easter = getOrthodoxEaster(currentYear);
  const diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(easter.getFullYear(), easter.getMonth(), easter.getDate())) / (1000 * 60 * 60 * 24));

  // ==========================================
  // 1. ΠΑΓΚΟΣΜΙΕΣ ΗΜΕΡΕΣ & ΓΕΓΟΝΟΤΑ
  // ==========================================
  const worldDays = {
    "1-4": "📖 Παγκόσμια Ημέρα Γραφής/Κώδικα Μπράιγ", "1-21": "🫂 Παγκόσμια Ημέρα Αγκαλιάς", "1-24": "🌍 Διεθνής Ημέρα Εκπαίδευσης", "1-27": "🕯️ Διεθνής Ημέρα Μνήμης Θυμάτων Ολοκαυτώματος", "1-26": "⚡ Διεθνής Ημέρα Καθαρής Ενέργειας", "1-28": "🛡️ Ευρωπαϊκή Ημέρα Προστασίας των Προσωπικών Δεδομένων", "2-2": "🦆 Παγκόσμια Ημέρα Υγροτόπων", "2-4": "🎗️ Παγκόσμια Ημέρα κατά του Καρκίνου",  "2-9": "🇬🇷 Παγκόσμια Ημέρα Ελληνικής Γλώσσας", "2-10": "🍲 Παγκόσμια Ημέρα για τα όσπρια / 💍 Παγκόσμια Ημέρα του Γάμου", "2-11": "👩‍🔬 Διεθνής Ημέρα για τις Γυναίκες στην Επιστήμη  / 🚑 Ευρωπαϊκή Ημέρα του 112 / 🤒 Παγκόσμια Ημέρα Ασθενούς", "2-13": "📻 Παγκόσμια Ημέρα Ραδιοφώνου", "2-14": "🫀 Παγκόσμια Ημέρα Συγγενών Καρδιοπαθειών", "2-15": "🎗️ Παγκόσμια Ημέρα κατά του Παιδικού Καρκίνου", "2-20": "⚖️ Παγκόσμια Ημέρα Κοινωνικής Δικαιοσύνης", "2-21": "🗣️ Παγκόσμια Ημέρα Μητρικής Γλώσσας/ 🗺️ Παγκόσμια Ημέρα του Ξεναγού", "2-22": "🤔 Παγκόσμια Ημέρα Σκέψης / ⚖️ Ευρωπαϊκή Ημέρα για τα Θύματα Εγκληματικών Πράξεων", "2-28": "🧬 Παγκόσμια Ημέρα Σπάνιων Παθήσεων", "3-1": "🚫 Ημέρα Μηδενικών Διακρίσεων", "3-3": "🦁 Παγκόσμια Ημέρα Άγριας ζωής / 👂 Παγκόσμια Ημέρα Ακοής", "3-4": "⚖️ Παγκόσμια Ημέρα Παχυσαρκίας",  "3-5": "🕊️ Διεθνής Ημέρα Ενημέρωσης για τον Αφοπλισμό", "3-6": "🛑 Παγκόσμια Ημέρα κατά της Βίας", "3-8": "👩 Διεθνής Ημέρα της Γυναίκας", "3-11": "🧪 Παγκόσμια Ημέρα Χημείας", "3-12": "💻 Παγκόσμια Ημέρα κατά της Λογοκρισίας στο Διαδίκτυο", "3-14": "🔢 Παγκόσμια Ημέρα της Σταθεράς Π", "3-15": "🛒 Παγκόσμια Ημέρα Καταναλωτή / 🗣️Ημέρα Λόγου / ⚖️ Ημέρα Προστασίας Ανθρωπίνων Δικαιωμάτων & Πολιτικών Ελευθεριών", "3-18": "♻️ Παγκόσμια Ημέρα Ανακύκλωσης",  "3-20": "😊 Διεθνής Ημέρα Ευτυχίας / 🦷Ημέρα Στοματικής Υγείας / 🎭Διεθνής Ημέρα Θεάτρου για τα παιδιά ♈ /Διεθνής Ημέρα Αστρολογίας / 🇫🇷 Διεθνής Ημέρα Γαλλοφωνίας / 🥩 Διεθνής Ημέρα Χωρίς Κρέας ", "3-21": "📜 Παγκόσμια Ημέρα Ποίησης /🚫 Κατά Ρατσισμού / 🌳Ημέρα Δασών/ 🎭 Κουκλοθέατρου", "3-22": "💧 Παγκόσμια Ημέρα για το Νερό", "3-23": "⛅ Παγκόσμια Ημέρα Μετεωρολογίας", "3-24": "🫁 Παγκόσμια Ημέρα κατά της Φυματίωσης /💡 Δικαίωμα στην Αλήθεια", "3-25": "⛓️ Διεθνής Ημέρα Μνήμης Θυμάτων Δουλεμπορίου", "3-27": "🎭 Παγκόσμια Ημέρα Θεάτρου / 🤝 Διεθνής Ημέρα Κοινωνικής Εργασίας", "3-28": "👥 Παγκόσμια Ημέρα Θεάτρου Σκιών", "3-30": "♻️ Διεθνής Ημέρα Μηδενικής Σπατάλης", "4-1": "🤡 Πρωταπριλιά", "4-2": "🧩 Παγκόσμια Ημέρα Παιδικού Βιβλίου", "4-4": "🐕 Παγκόσμια Ημέρα Αδέσποτων Ζώων / 💣 Διεθνής Ημέρα κατά των Ναρκών", "4-5": "🧠 Διεθνής Ημέρα Συνείδησης", "4-6": "🕯️Ημέρα Μνήμης Θρακικού Ελληνισμού/🏅 Παγκόσμια Ημέρα Αθλητισμού", "4-7": "⚕️ Παγκόσμια Ημέρα Υγείας", "4-8": "⛺ Ημέρα του Έθνους των Ρομά", "4-11": "🧠 Παγκόσμια Ημέρα κατά της Ασθενείας Πάρκινσον", "4-12": "🚀 Διεθνής Ημέρα της Πτήσης στο Διάστημα / 🛣️ Παγκόσμια Ημέρα για τα Παιδιά του Δρόμου", "4-15": "🎨 Παγκόσμια Ημέρα Τέχνης", "4-16": "🗣️ Παγκόσμια Ημέρα Φωνής", "4-17": "🚜 Παγκόσμια Ημέρα Αγροτικής Πάλης", "4-18": "🏛️ Παγκόσμια Ημέρα Πολιτιστικής Κληρονομιάς", "4-20": "🇨🇳 Ημέρα Κινέζικης Γλώσσας", "4-21": "💡 Παγκόσμια Ημέρα Δημιουργικότητας", "4-22": "🌍 Διεθνής Ημέρα της Γης", "4-23": "📚 Παγκόσμια Ημέρα Βιβλίου / 🇬🇧 Ημέρα Αγγλικής Γλώσσας", "4-24": "🐭 Παγκόσμια Ημέρα Κατάργησης Πειραμάτων σε Ζώα", "4-25": "🦟 Παγκόσμια Ημέρα κατά της Ελονοσίας", "4-26": "©️ Παγκόσμια Ημέρα Πνευματικής Ιδιοκτησίας", "4-27": "✏️ Παγκόσμια Ημέρα Σχεδίου (Design)", "4-28": "👷 Παγκόσμια Ημέρα για την Υγεία στην Εργασία/ 🕯️ Διεθνής Ημέρα Μνήμης Εργατών", "4-29": "💃 Παγκόσμια Ημέρα Χορού / ☣️ Ημέρα Μνήμης για τα Θύματα του Χημικού Πολέμου / 🛡️ Παγκόσμια Ημέρα Ανοσολογίας", "4-30": "🎷 Διεθνής Ημέρα Τζαζ", "5-1": "🛠️ Διεθνής Ημέρα Εργατών",  "5-2": "🐟 Παγκόσμια Ημέρα Τόνου", "5-3": "📰 Παγκόσμια Ημέρα Ελευθεροτυπίας", "5-4": "🚒 Διεθνής Ημέρα Πυροσβεστών", "5-5": "👶 Διεθνής Ημέρα Μαιών", "5-8": "➕ Παγκόσμια Ημέρα Ερυθρού Σταυρού", "5-9": "🇪🇺 Ημέρα της Ευρώπης",  "5-11": "🦅 Παγκόσμια Ημέρα Αποδημητικών Πτηνών", "5-12": "🩺 Διεθνής Ημέρα Αδελφών Νοσοκόμων", "5-15": "👨‍👩‍👧‍👦 Διεθνής Ημέρα Οικογένειας", "5-17": "🏳️‍🌈 Διεθνής Ημέρα κατά της Ομοφοβίας/🛰️ Ημέρα Τηλεπικοινωνιών", "5-18": "🖼️ Παγκόσμια Ημέρα Μουσείων", "5-19": "🩺 Παγκόσμια Ημέρα κατά της Ηπατίτιδας / 🕯️ Ημέρα Μνήμης Γενοκτονίας Ποντίων", "5-20": "🐝 Παγκόσμια Ημέρα Μέλισσας", "5-21": "🌍 Παγκόσμια Ημέρα Πολιτισμού", "5-22": "🌿 Παγκόσμια Ημέρα Βιοποικιλότητας", "5-24": "🏞️ Ευρωπαϊκή Ημέρα Πάρκων", "5-25": "👧 Διεθνής Ημέρα Εξαφανισμένων Παιδιών / ⚽ Παγκόσμια Ημέρα Ποδοσφαίρου", "5-31": "🚭 Παγκόσμια Ημέρα κατά του Καπνίσματος", "6-1": "👨‍👩‍👦 Παγκόσμια Ημέρα Γονέων / 🥛 Παγκόσμια Ημέρα Γάλακτος", "6-3": "🚲 Παγκόσμια Ημέρα Ποδηλάτου", "6-4": "🧒 Διεθνής Ημέρα κατά της Επιθετικότητας εναντίον Αθώων Παιδιών", "6-5": "🌳 Παγκόσμια Ημέρα Περιβάλλοντος", "6-7": "🍽️ Παγκόσμια Ημέρα για την Ασφάλεια Τροφίμων", "6-8": "🌊 Παγκόσμια Ημέρα Ωκεανών", "6-11": "🧸 Διεθνής Ημέρα Παιχνιδιού", "6-12": "🚸 Παγκόσμια Ημέρα κατά της Παιδικής Εργασίας", "6-14": "🩸 Παγκόσμια Ημέρα Εθελοντή Αιμοδότη", "6-15": "🧓 Παγκόσμια Ημέρα Ενημέρωσης για την Κακοποίηση των Ηλικιωμένων/ Παγκόσμια Ημέρα Γονιμότητας / 🌬️ Παγκόσμια Ημέρα Ανέμου", "6-17": "🌵 Παγκόσμια Ημέρα κατά της Ξηρασίας και της Ερημοποίησης", "6-20": "🚶 Παγκόσμια Ημέρα Προσφύγων", "6-21": "🎵 Ευρωπαϊκή Ημέρα Μουσικής", "6-23": "🏅 Ολυμπιακή Ημέρα / 🏛️ Ημέρα των Ηνωμένων Εθνών για τη Δημόσια Υπηρεσία", "6-25": "⚓ Ημέρα των Ναυτικών", "6-26": "🚫 Παγκόσμια Ημέρα κατά των Ναρκωτικών / ⛓️ Διεθνής Ημέρα κατά των Βασανιστηρίων", "6-27": "🏢 Διεθνής Ημέρα Μικρομεσαίων Επιχειρήσεων / 🦻 Διεθνής Ημέρα Κώφωσης και Τυφλότητας", "6-30": "☄️ Διεθνής Ημέρα Αστεροϊδών / 🏛️ Διεθνής Ημέρα Κοινοβουλευτισμού", "7-11": "👥 Παγκόσμια Ημέρα Πληθυσμού", "7-12": "🕊️ Διεθνής Ημέρα Ελπίδας", "7-17": "⚖️ Παγκόσμια Ημέρα Διεθνούς Δικαιοσύνης", "7-18": "✊ Διεθνής Ημέρα Νέλσον Μαντέλα", "7-20": "♟️ Παγκόσμια Ημέρα Σκακιού", "7-25": "🏊 Παγκόσμια Ημέρα Πρόληψης των Πνιγμών /⚖️ Δικαστική Ευημερία", "7-28": "🩺 Παγκόσμια Ημέρα κατά της Ηπατίτιδας", "7-30": "🤝 Διεθνής Ημέρα Φιλίας", "8-1": "🤱 Παγκόσμια Ημέρα (Εβδομάδα) Μητρικού Θηλασμού", "8-9": "🏕️ Παγκόσμια Ημέρα Ιθαγενών Λαών", "8-12": "🧑‍🦱 Παγκόσμια Ημέρα Νεολαίας", "8-19": "📸 Παγκόσμια Ημέρα Φωτογραφίας / 🤝 Παγκόσμια Ανθρωπιστική Ημέρα", "8-21": "🕯️ Διεθνής Ημέρα Μνήμης Θυμάτων Τρομοκρατίας", "8-23": "⛓️ Παγκόσμια Ημέρα για την Υπενθύμιση του Δουλεμπορίου και της Κατάργησής του",  "8-27": "🌊 Παγκόσμια Ημέρα Λιμνών", "8-30": "❓ Διεθνής Ημέρα Εξαφανισμένων",  "9-5": "🤝 Διεθνής Ημέρα Φιλανθρωπίας", "9-8": "📖 Διεθνής Ημέρα Εγγραμματισμού", "9-15": "🗳️ Διεθνής Ημέρα Δημοκρατίας", "9-16": "🛡️ Διεθνής Ημέρα για το Όζον", "9-17": "🏥 Διεθνής Ημέρα Ασφάλειας Ασθενών", "9-20": "🧹 Παγκόσμια Ημέρα Καθαριότητας", "9-21": "🕊️ Διεθνής Ημέρα Ειρήνης / 🧠 Παγκόσμια Ημέρα Αλτσχάιμερ", "9-22": "🚫🚗 Παγκόσμια Ημέρα Χωρίς Αυτοκίνητο", "9-26": "🗣️ Ευρωπαϊκή Ημέρα Γλωσσών", "9-27": "✈️ Παγκόσμια Ημέρα Τουρισμού", "9-29": "❤️ Παγκόσμια Ημέρα Καρδιάς", "9-30": "🗣️ Διεθνής Ημέρα Μετάφρασης", "10-1": "🧓 Παγκόσμια Ημέρα Τρίτης Ηλικίας", "10-2": "☮️ Διεθνής Ημέρα Μη Βίας", "10-4": "🐾 Παγκόσμια Ημέρα των Ζώων", "10-5": "👨‍🏫 Παγκόσμια Ημέρα Εκπαιδευτικών", "10-9": "✉️ Παγκόσμια Ημέρα Ταχυδρομείων", "10-10": "🧠 Παγκόσμια Ημέρα Ψυχικής Υγείας / ⚖️ Παγκόσμια Ημέρα κατά της Θανατικής Ποινής", "10-11": "👧 Διεθνής Ημέρα Κοριτσιού", "10-13": "🌪️ Διεθνής Ημέρα Μείωσης Φυσικών Καταστροφών", "10-15": "🧼 Παγκόσμια Ημέρα Πλυσίματος Χεριών / 🦯 Διεθνής Ημέρα του Λευκού Μπαστουνιού / 👩‍🌾 Διεθνής Ημέρας Αγρότισσας",  "10-16": "🇬🇷 Απελευθέρωση Κατερίνης / 🍎 Παγκόσμια Ημέρα Διατροφής / 🦴 Παγκόσμια Ημέρα Σπονδυλικής Στήλης", "10-17": "📉 Διεθνής Ημέρα Εξάλειψης Φτώχειας", "10-24": "🇺🇳 Ημέρα Ηνωμένων Εθνών / 🌊 Μεσογειακή Ημέρα Ακτών", "10-27": "🎞️ Παγκόσμια Ημέρα Οπτικοακουστικής Κληρονομιάς", "10-28": "🎬 Διεθνής Ημέρα Κινουμένου Σχεδίου", "10-29": "🤝 Διεθνής Ημέρα Φροντίδας και Στήριξης", "10-31": "🏦 Παγκόσμια Ημέρα Αποταμίευσης", "11-9": "🚫 Διεθνής Ημέρα κατά του Φασισμού και του Αντισημιτισμού", "11-10": "🔬 Παγκόσμια Ημέρα Επιστήμης για την Ειρήνη και την Ανάπτυξη", "11-13": "🤗 Παγκόσμια Ημέρα Καλοσύνης",  "11-14": "🩸 Παγκόσμια Ημέρα Διαβήτη", "11-16": "🤝 Διεθνής Ημέρα Ανεκτικότητας / 🥗 Διεθνής Ημέρα Μεσογειακής Διατροφής", "11-19": "👨 Παγκόσμια Ημέρα Ανδρών", "11-20": "👦👧 Παγκόσμια Ημέρα Δικαιωμάτων Παιδιού", "11-21": "📺 Παγκόσμια Ημέρα Τηλεόρασης / 👋 Παγκόσμια Ημέρα Χαιρετισμού", "11-25": "🛑 Διεθνής Ημέρα κατά της Βίας κατά των Γυναικών", "12-1": "🎗️ Παγκόσμια Ημέρα κατά του AIDS", "12-2": "⛓️ Διεθνής Ημέρα για την Κατάργηση της Δουλείας", "12-3": "♿ Παγκόσμια Ημέρα Ατόμων με Αναπηρία", "12-5": "🙋 Παγκόσμια Ημέρα Εθελοντισμού", "12-7": "✈️ Διεθνής Ημέρα Πολιτικής Αεροπορίας", "12-9": "⚖️ Παγκόσμια Ημέρα κατά της Διαφθοράς/ 🕯️ Διεθνής Ημέρα Μνήμης Θυμάτων Γενοκτονίας", "12-10": "🕊️ Παγκόσμια Ημέρα Ανθρωπίνων Δικαιωμάτων / ©️ Παγκόσμια Ημέρα Ιδιοκτησίας", "12-11": "👶 Παγκόσμια Ημέρα Παιδιού (UNICEF) / ⛰️ Διεθνής Ημέρα Βουνών", "12-14": "❤️ Παγκόσμια Ημέρα Αγάπης",  "12-18": "🚶 Διεθνής Ημέρα Μεταναστών", "12-20": "🤝 Διεθνής Ημέρα Ανθρώπινης Αλληλεγγύης"
  };
const wd = document.getElementById('eort-world-day');
  let worldDayContent = [];

  // Έλεγχος σταθερών ημερών
  if (worldDays[dateKey]) {
    worldDayContent.push(worldDays[dateKey]);
  }

  // 2. Κινητή: Παγκόσμια Ημέρα Ύπνου
  const equinox = new Date(currentYear, 2, 20); 
  let offset = ((equinox.getDay() + 1) % 7) + 1; // Βρίσκει πόσες μέρες ακριβώς πρέπει να πάμε πίσω
  const sleepDayDate = new Date(currentYear, 2, 20 - offset);
  
  if (currentDay === sleepDayDate.getDate() && (currentMonth - 1) === sleepDayDate.getMonth()) {
    worldDayContent.push("💤 Παγκόσμια Ημέρα Ύπνου");
  }
  // Κινητή: Παγκόσμια Ημέρα Αφήγησης (Ισημερία)
  let storytellingDay = Math.floor(20.25 - (currentYear - 2000) * 0.0025);
  if (currentMonth === 3 && currentDay === storytellingDay) worldDayContent.push("📖 Παγκόσμια Ημέρα Αφήγησης");

  // Κινητή: Γιορτή της Μητέρας
  let motherDay = 1 + (7 - new Date(currentYear, 4, 1).getDay()) % 7 + 7;
  if (currentMonth === 5 && currentDay === motherDay) {
    worldDayContent.push("🌸 Γιορτή της Μητέρας");
  }

  // Κινητή: Γιορτή του Πατέρα
  let fatherDay = 1 + (7 - new Date(currentYear, 5, 1).getDay()) % 7 + 14;
  if (currentMonth === 6 && currentDay === fatherDay) {
    worldDayContent.push("👔 Γιορτή του Πατέρα");
  }

  // Κινητή: Ημέρα Ασφαλούς Διαδικτύου
  let saferInternetDay = (1 + (9 - new Date(currentYear, 1, 1).getDay()) % 7) + 7;
  if (currentMonth === 2 && currentDay === saferInternetDay) {
    worldDayContent.push("🔒 Ημέρα Ασφαλούς Διαδικτύου");
  }

  // Κινητή: Παγκόσμια Ημέρα Χαμόγελου
  let smileDay = 1 + (12 - new Date(currentYear, 9, 1).getDay()) % 7;
  if (currentMonth === 10 && currentDay === smileDay) {
    worldDayContent.push("😁 Παγκόσμια Ημέρα Χαμόγελου");
  }
// Μνήμης Θυμάτων Τροχαίων Ατυχημάτων (3η Κυριακή Νοεμβρίου)
let firstSunNov = 1 + (0 - new Date(currentYear, 10, 1).getDay() + 7) % 7;
if (currentMonth === 11 && currentDay === (firstSunNov + 14)) {
    worldDayContent.push("🚗 Παγκόσμια Ημέρα Μνήμης Θυμάτων Τροχαίων Ατυχημάτων");
}
let lastSatApr = 30 - (new Date(currentYear, 3, 30).getDay() - 6 + 7) % 7;
  if (currentMonth === 4 && currentDay === lastSatApr) {
      worldDayContent.push("⚕️ Παγκόσμια Ημέρα Κτηνιατρικής");
  }
// -- ΣΕΠΤΕΜΒΡΙΟΣ --
  // 256η ημέρα του έτους (Παγκόσμια Ημέρα Προγραμματιστή)
  // Ελέγχουμε αν είναι δίσεκτο έτος για να δούμε αν είναι 12 ή 13 Σεπτεμβρίου.
  let isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
  let programmerDay = isLeapYear ? 12 : 13;
  if (currentMonth === 9 && currentDay === programmerDay) {
      worldDayContent.push("💻 Παγκόσμια Ημέρα Προγραμματιστή");
  }
// 3ο Σάββατο του Σεπτεμβρίου (Καθαρισμού Ακτών / Ελεύθερου Λογισμικού)
  let firstSatSep = 1 + (6 - new Date(currentYear, 8, 1).getDay() + 7) % 7;
  if (currentMonth === 9 && currentDay === (firstSatSep + 14)) {
      worldDayContent.push("🏖️ Παγκόσμια Ημέρα Εθελοντικού Καθαρισμού των Ακτών / 🐧 Παγκόσμια Ημέρα Ελεύθερου Λογισμικού");
  }
// Τελευταία Παρασκευή του Σεπτεμβρίου (Βραδιά του Ερευνητή)
  // Ο Σεπτέμβρης έχει 30 μέρες. Βρίσκουμε το τελευταίο Παρασκευή (5).
  let lastFriSep = 30 - (new Date(currentYear, 8, 30).getDay() - 5 + 7) % 7;
  if (currentMonth === 9 && currentDay === lastFriSep) {
      worldDayContent.push("🔬 Βραδιά του Ερευνητή");
  }
// -- ΟΚΤΩΒΡΙΟΣ --
  // 1ο Σαββατοκύριακο του Οκτωβρίου (Πανευρωπαϊκή Γιορτή των Πουλιών)
  let firstSatOct = 1 + (6 - new Date(currentYear, 9, 1).getDay() + 7) % 7;
  let firstSunOct = 1 + (0 - new Date(currentYear, 9, 1).getDay() + 7) % 7;
  if (currentMonth === 10 && (currentDay === firstSatOct || currentDay === firstSunOct)) {
      worldDayContent.push("🐦 Πανευρωπαϊκή Γιορτή των Πουλιών");
  }
// 1η Δευτέρα του Οκτωβρίου (Κατοικίας & Αρχιτεκτονικής)
  let firstMonOct = 1 + (1 - new Date(currentYear, 9, 1).getDay() + 7) % 7;
  if (currentMonth === 10 && currentDay === firstMonOct) {
      worldDayContent.push("🏘️ Παγκόσμια Ημέρα Κατοικίας / 🏛️ Παγκόσμια Ημέρα Αρχιτεκτονικής");
  }
// 2η Πέμπτη του Οκτωβρίου (Παγκόσμια Ημέρα Όρασης)
  let firstThuOct = 1 + (4 - new Date(currentYear, 9, 1).getDay() + 7) % 7;
  if (currentMonth === 10 && currentDay === (firstThuOct + 7)) {
      worldDayContent.push("👁️ Παγκόσμια Ημέρα Όρασης - Κατά της Τύφλωσης");
  }
// 3η Πέμπτη του Νοεμβρίου (Φιλοσοφίας)
  let firstThuNov = 1 + (4 - new Date(currentYear, 10, 1).getDay() + 7) % 7;
  if (currentMonth === 11 && currentDay === (firstThuNov + 14)) {
      worldDayContent.push("🤔 Παγκόσμια Ημέρα Φιλοσοφίας");
  }
// Παρασκευή μετά την Ημέρα των Ευχαριστιών (Αγοραστικής Αποχής / Buy Nothing Day)
  // Η Ημέρα των Ευχαριστιών είναι η 4η Πέμπτη. Η γιορτή αυτή πέφτει την ακριβώς επόμενη μέρα.
  let buyNothingDay = (firstThuNov + 21) + 1; // 1η Πέμπτη + 21 μέρες = 4η Πέμπτη. +1 = Παρασκευή
  if (currentMonth === 11 && currentDay === buyNothingDay) {
      worldDayContent.push("🛍️ Παγκόσμια Ημέρα Αγοραστικής Αποχής");
  }
// Τελευταία Πέμπτη του Σεπτεμβρίου (Παγκόσμια Ναυτική Ημέρα)
  // Ο Σεπτέμβριος έχει 30 μέρες. Βρίσκουμε την τελευταία Πέμπτη (4).
  let lastThuSep = 30 - (new Date(currentYear, 8, 30).getDay() - 4 + 7) % 7;
  if (currentMonth === 9 && currentDay === lastThuSep) {
      worldDayContent.push("⚓ Παγκόσμια Ναυτική Ημέρα");
  }
// -- ΑΥΓΟΥΣΤΟΣ --
  // 3ο Σαββατοκύριακο του Αυγούστου (Παγκόσμια Ημέρα Φάρων)
  let firstSatAug = 1 + (6 - new Date(currentYear, 7, 1).getDay() + 7) % 7;
  let firstSunAug = 1 + (0 - new Date(currentYear, 7, 1).getDay() + 7) % 7;
  if (currentMonth === 8 && (currentDay === (firstSatAug + 14) || currentDay === (firstSunAug + 14))) {
      worldDayContent.push("🗼 Παγκόσμια Ημέρα Φάρων");
  }
// Κινητή: Παγκόσμια Ημέρα Ξενώνων και Παρηγορητικής Φροντίδας (2ο Σάββατο Οκτωβρίου)
let hospiceSat = (1 + (6 - new Date(currentYear, 9, 1).getDay() + 7) % 7) + 7;
if (currentMonth === 10 && currentDay === hospiceSat) {
    worldDayContent.push("🏥 Παγκόσμια Ημέρα Ξενώνων και Παρηγορητικής Φροντίδας");
}
// Κινητή: Διεθνής Ημέρα κατά του Θορύβου (Τελευταία Τετάρτη του Απριλίου)
let lastWedApr = 30 - (new Date(currentYear, 3, 30).getDay() - 3 + 7) % 7;
if (currentMonth === 4 && currentDay === lastWedApr) {
    worldDayContent.push("🤫 Διεθνής Ημέρα κατά του Θορύβου");
}

  // Εμφάνιση Παγκόσμιων Ημερών
  if (worldDayContent.length > 0) {
    wd.innerHTML = worldDayContent.join(" / ");
    wd.style.display = "block";
  } else {
    wd.style.display = "none";
  }

  // ==========================================
  // 2. ΑΡΓΙΕΣ (Κινητές & Σταθερές)
  // ==========================================
  const fixedHolidays = {
    "1-1": "🎉 Πρωτοχρονιά (Αργία)", "1-6": "🕊️ Θεοφάνεια (Αργία)", "1-30": "🏫 Τριών Ιεραρχών (Σχολική Εορτή)", "3-25": "🇬🇷 25η Μαρτίου (Εθνική Επέτειος) / 🕊️Ευαγγελισμός της Θεοτόκου", "5-1": "🌸 Εργατική Πρωτομαγιά", "8-15": "⛪ Κοίμηση της Θεοτόκου", "10-28": "🇬🇷 28η Οκτωβρίου (Εθνική Επέτειος)", "11-17": "🕊️ Επέτειος του Πολυτεχνείου", "11-25": "⛪ Αγίας Αικατερίνης (Τοπική Αργία Πολιούχου)", "12-18": "⛪ Αγίου Μοδέστου (Τοπική Αργία)", "12-25": "🎄 Χριστούγεννα", "12-26": "🎁 Σύναξη της Θεοτόκου"
  };
let activeHolidays = [];
  
  // Κινητές Αργίες
  if (diff === -59) activeHolidays.push("🍖 Τσικνοπέμπτη!");
  else if (diff === -48) { activeHolidays.push("🪁 Καθαρά Δευτέρα (Αργία)"); document.getElementById('main-icon').innerText = "🪁"; }
  else if (diff === -42) activeHolidays.push("⛪ Κυριακή της Ορθοδοξίας");
else if (diff === -28) activeHolidays.push("✝️ Κυριακή της Σταυροπροσκυνήσεως");
else if (diff === -16) activeHolidays.push("⛪ Παρασκευή του Ακαθίστου Ύμνου");
  else if (diff === -8) activeHolidays.push("🌿 Σάββατο του Λαζάρου");
  else if (diff === -7) activeHolidays.push("🌿 Κυριακή των Βαΐων");
  else if (diff === -2) activeHolidays.push("⛪ Μεγάλη Παρασκευή (Ημιαργία)");
  else if (diff === 0) activeHolidays.push("🕯️ Κυριακή του Πάσχα");
  else if (diff === 1) activeHolidays.push("🥚 Δευτέρα του Πάσχα (Αργία)");
else if (diff === 5) activeHolidays.push("💧 Ζωοδόχου Πηγής");
  else if (diff === 39) activeHolidays.push("⛪ Ανάληψη του Κυρίου");
  else if (diff === 49) activeHolidays.push("🔥 Πεντηκοστή");
  else if (diff === 50) activeHolidays.push("🕊️ Αγίου Πνεύματος (Αργία)");
  else if (diff === 56) activeHolidays.push("⛪ Κυριακή των Αγίων Πάντων");
// Προσθήκη Σταθερών
  if (fixedHolidays[dateKey]) activeHolidays.push(fixedHolidays[dateKey]);

  const hDiv = document.getElementById('eort-holiday');
  if (activeHolidays.length > 0) {
    hDiv.innerHTML = activeHolidays.join("<br>");
    hDiv.style.display = "block";
  } else {
    hDiv.style.display = "none";
  }

  // ==========================================
  // 3. ΟΝΟΜΑΤΟΛΟΓΙΟ
  // ==========================================
  const fixedNames = {
    "1-1": "Βασίλης, Βασιλική", "1-2": "Σίλβεστρος", "1-6": "Φώτης, Φωτεινή, Ουρανία, Ιορδάνης", "1-7": "Γιάννης, Ιωάννα, Πρόδρομος", "1-11": "Θεοδόσιος, Θεοδοσία", "1-12": "Τατιανή", "1-17": "Αντώνης, Αντωνία", "1-18": "Αθανάσιος, Αθανασία, Κύριλλος", "1-20": "Ευθύμιος, Ευθυμία", "1-24": "Ξένη, Ξένια", "1-25": "Γρηγόρης, Μαργαρίτα", "2-1": "Τρύφων", "2-2": "Υπαπαντή (Παναγιώτης, Μαρία)", "2-3": "Σταμάτης, Σταματία", "2-8": "Ζαχαρίας", "2-10": "Χαράλαμπος, Χαρίκλεια", "2-11": "Βλάσης, Βλασία", "2-14": "Βαλεντίνος, Βαλεντίνα", "3-1": "Ευδοκία", "3-9": "Σαράντης", "3-17": "Αλέξιος, Αλεξία", "3-25": "Ευάγγελος, Ευαγγελία", "5-5": "Ειρήνη, Εφραίμ", "5-21": "Κωνσταντίνος, Ελένη", "6-8": "Καλλιόπη", "6-29": "Πέτρος, Παύλος", "6-30": "Απόστολος, Αποστολία", "7-7": "Κυριακή", "7-11": "Όλγα, Έφη (Ευφημία)", "7-17": "Μαρίνα, Αλίκη", "7-20": "Ηλίας", "7-24": "Χριστίνα", "7-26": "Παρασκευή, Εύη", "7-27": "Παντελής", "7-28": "Ειρήνη Χρυσοβαλάντου", "8-6": "Σωτήρης, Σωτηρία", "8-15": "Μαρία, Παναγιώτης, Δέσποινα", "8-30": "Αλέξανδρος, Αλεξάνδρα", "9-1": "Συμεών, Μυρτώ, Αθηνά, Αφροδίτη", "9-14": "✝️ Ύψωση του Τιμίου Σταυρού, Σταύρος, Σταυρούλα / 🕯️ Ημέρα Μνήμης Γενοκτονίας Ελλήνων Μικράς Ασίας", "9-17": "Σοφία, Πίστη, Ελπίδα, Αγάπη", "9-20": "Ευστάθιος, Στάθης, Ευσταθία",  "10-3": "Διονύσης, Διονυσία", "10-13": "🇬🇷 Ημέρα Μακεδονικού Αγώνα", "10-26": "Δημήτρης, Δήμητρα", "11-1": "Αργύρης, Αργυρώ, Κοσμάς, Δαμιανός", "11-8": "Μιχάλης, Άγγελος, Γαβριήλ", "11-9": "Νεκτάριος", "11-11": "Μηνάς", "11-13": "Χρυσόστομος", "11-14": "Φίλιππος, Φιλιππία", "11-21": "Μαρία, Δέσποινα (Εισόδια)", "11-25": "Κατερίνα", "11-26": "Στέλιος, Στέλλα", "11-30": "Ανδρέας, Ανδριανή", "12-4": "Βαρβάρα", "12-5": "Σάββας", "12-6": "Νικόλαος, Νικολέτα", "12-9": "Άννα", "12-12": "Σπυρίδων, Σπυριδούλα", "12-15": "Ελευθέριος, Ελευθερία", "12-25": "Χρήστος, Χρυσή, Μανώλης", "12-27": "Στέφανος, Στεφανία"
  };
let nToDisplay = "";
  const isGeorgeMoved = (easter >= new Date(currentYear, 3, 23));
  
  if (diff === -43) nToDisplay = "Θεόδωρος, Θεοδώρα (Αγ. Θεοδώρων)";
  else if (diff === -8) nToDisplay = "Λάζαρος, Λάζος (Του Λαζάρου)";
  else if (diff === -7) nToDisplay = "Βάιος, Βαΐα, Δάφνη (Των Βαΐων)";
  else if (diff === 0) nToDisplay = "Αναστάσιος, Αναστασία, Λάμπρος, Πασχάλης";
  else if (diff === 1) nToDisplay = isGeorgeMoved ? "Γιώργος, Γεωργία, Ελισάβετ" : "";
  else if (diff === 2) nToDisplay = "Ραφαήλ, Νικόλαος, Ειρήνη (Λέσβου)";
  else if (diff === 5) nToDisplay = "Ζωή, Πηγή, Ζωοδόχος (Ζωοδόχου Πηγής)";
  else if (diff === 7) nToDisplay = "Θωμάς (Του Θωμά)";
  else if (diff === 50) nToDisplay = "Τριάδα, Τριαντάφυλλος, Τριανταφυλλιά";
  else if (diff === 56) nToDisplay = "Πανταζής, Πάντος (Αγίων Πάντων)";
  else {
    if (dateKey === "4-23") nToDisplay = isGeorgeMoved ? "" : "Γιώργος, Γεωργία";
    else if (dateKey === "4-24") nToDisplay = isGeorgeMoved ? "" : "Ελισάβετ"; // Προσθήκη για Ελισάβετ
    else if (fixedNames[dateKey]) nToDisplay = fixedNames[dateKey];
  }
const nCont = document.getElementById('eort-names');
  if (nToDisplay && nToDisplay !== "") {
    nCont.innerHTML = "<b>Γιορτάζουν:</b><br>" + nToDisplay;
    nCont.style.display = "block";
  } else {
    nCont.innerHTML = "";
    nCont.style.display = "none";
  }

  // ==========================================
  // 4. ΣΧΟΛΙΚΕΣ ΔΙΑΚΟΠΕΣ
  // ==========================================
  let sStr = "";
  if ((currentMonth === 12 && currentDay >= 24) || (currentMonth === 1 && currentDay <= 7)) sStr = "⛄ Σχολικές Διακοπές Χριστουγέννων";
  else if (diff >= -8 && diff <= 7) sStr = "🐰 Σχολικές Διακοπές Πάσχα";
  else if ((currentMonth === 6 && currentDay >= 16) || currentMonth === 7 || currentMonth === 8 || (currentMonth === 9 && currentDay <= 10)) sStr = " \u2600\uFE0F Θερινές Σχολικές Διακοπές";

  const sDiv = document.getElementById('eort-school');
  if (sStr) {
    sDiv.innerText = sStr; 
    sDiv.style.display = "block";
  } else {
    sDiv.style.display = "none";
  }

  const lat = 40.2711, lon = 22.5044;
  const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=3";

  function getRefreshedWeather() {
    fetch(weatherUrl)
      .then(function(r) { 
        if (!r.ok) throw new Error(); 
        return r.json(); 
      })
      .then(function(d) {
        const codes = {
          0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
          61:"🌧️", 63:"🌧️", 65:"🌧️", 71:"❄️", 73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️",
          81:"🌧️", 82:"🌧️", 95:"⛈️", 96:"⛈️", 99:"⛈️"
        };
        const daysArr = ['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ'];
        let wHtml = '';

        for(let i=0; i<3; i++) {
          // Υπολογισμός της ημερομηνίας για την κάρτα (0 = Σήμερα, 1 = Αύριο, 2 = Μεθαύριο)
          let dDate = new Date();
          dDate.setDate(today.getDate() + i);
          let dName = (i==0) ? "Σήμερα" : (i==1 ? "Αύριο" : daysArr[dDate.getDay()]);
          
          // Μεταβλητές για τους ελέγχους της συγκεκριμένης ημέρας
          let fM = dDate.getMonth() + 1; // Μήνας (1-12)
          let fD = dDate.getDate();      // Ημέρα (1-31)
          let fDay = dDate.getDay();     // Ημέρα εβδομάδας (0=Κυριακή, 6=Σάββατο)
          let fKey = fM + "-" + fD;
          
          // Διαφορά από το Πάσχα (για να βρίσκουμε τις κινητές αργίες της συγκεκριμένης ημέρας)
          let fEasterDiff = Math.round((new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate()) - new Date(easter.getFullYear(), easter.getMonth(), easter.getDate())) / (1000 * 60 * 60 * 24));

          // Σταθερές σχολικές αργίες (10-28, 11-17 Πολυτεχνείο, 11-25 Αγ. Αικατερίνη, κλπ)
          let schoolHolidays = ["10-28", "11-17", "11-25", "1-30", "3-25", "5-1"];
          // Έλεγχος αν η μέρα είναι σταθερή αργία Ή κινητή (π.χ. -48=Καθαρά Δευτέρα, 50=Αγ. Πνεύματος)
          let isHoliday = schoolHolidays.includes(fKey) || (fEasterDiff === -48) || (fEasterDiff === 50);

          let hoverContent = '';

          // --- ΕΛΕΓΧΟΙ ΗΜΕΡΑΣ (Με σειρά προτεραιότητας) ---

          if (fDay === 0 || fDay === 6) {
            // 1. ΣΑΒΒΑΤΟΚΥΡΙΑΚΟ
            hoverContent = '<span class="sch-msg">🎈 Καλό</span>' +
                           '<span class="sch-msg">Σ/Κ!</span>';
          } 
          else if ((fM === 6 && fD >= 16) || fM === 7 || fM === 8 || (fM === 9 && fD <= 10)) {
            // 2. ΚΑΛΟΚΑΙΡΙ (16 Ιουνίου έως 10 Σεπτεμβρίου)
            hoverContent = '<span class="sch-msg">🏖️ Καλό</span>' +
                           '<span class="sch-msg">Καλο-<br>καίρι!</span>';
          }
          else if ((fM === 12 && fD >= 24) || (fM === 1 && fD <= 7)) {
            // 3. ΧΡΙΣΤΟΥΓΕΝΝΑ (24/12 έως 7/1)
            hoverContent = '<span class="sch-msg">🎄 Καλές</span>' +
                           '<span class="sch-msg">Γιορτές!</span>';
          }
          else if (fEasterDiff >= -8 && fEasterDiff <= 7) {
            // 4. ΠΑΣΧΑ (Από Σάββατο Λαζάρου έως Κυριακή του Θωμά)
            hoverContent = '<span class="sch-msg">🐰 Καλό</span>' +
                           '<span class="sch-msg">Πάσχα!</span>';
          }
          else if (isHoliday) {
            // 5. ΑΡΓΙΕΣ & ΕΘΝΙΚΕΣ ΕΠΕΤΕΙΟΙ
            hoverContent = '<span class="sch-msg">🇬🇷 Χρόνια</span>' +
                           '<span class="sch-msg">Πολλά!</span>';
          }
         else {
            // 6. ΚΑΝΟΝΙΚΗ ΣΧΟΛΙΚΗ ΗΜΕΡΑ - Έλεγχος βροχής στα διαλείμματα
            let baseIndex = i * 24; 
            
            // Κωδικοί καιρού Open-Meteo που σημαίνουν βροχή, ψιχάλα ή καταιγίδα
           // Κωδικοί καιρού Open-Meteo για βροχή και χιόνι
           // Κωδικοί καιρού Open-Meteo για βροχή και χιόνι
            let rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
            let snowCodes = [71, 73, 75, 77];
            
            let rainWarnings = [];
            let snowWarnings = [];

            // Έλεγχος ανά ώρα διαλείμματος (10:00, 11:00, 12:00, 13:00)
            [10, 11, 12, 13].forEach(hour => {
              let code = d.hourly.weather_code[baseIndex + hour];
              let timeLabel = hour === 10 ? "09:40" : hour === 11 ? "11:30" : hour === 12 ? "12:25" : "13:15";
              
              if (rainCodes.includes(code)) rainWarnings.push(timeLabel);
              if (snowCodes.includes(code)) snowWarnings.push(timeLabel);
            });

            if (snowWarnings.length > 0) {
              // ΑΝ ΠΡΟΒΛΕΠΕΤΑΙ ΧΙΟΝΙ
              let snowBadges = snowWarnings.map(time => `<span class="snow-badge">Διάλειμμα ${time}</span>`).join('');
              hoverContent = '<span class="sch-msg" style="font-size:22px; margin-bottom:2px; animation: bounce 2s infinite; color:#1e6cff;">❄️</span>' +
                             '<span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px; color:#1e6cff;">ΧΙΟΝΟΠΤΩΣΗ ΣΤΑ ΔΙΑΛΕΙΜΜΑΤΑ:</span>' +
                             '<div class="snow-list">' + snowBadges + '</div>';
            } 
            else if (rainWarnings.length > 0) {
              // ΑΝ ΠΡΟΒΛΕΠΕΤΑΙ ΒΡΟΧΗ
              let rainBadges = rainWarnings.map(time => `<span class="rain-badge">Διάλειμμα ${time}</span>`).join('');
              hoverContent = '<span class="sch-msg" style="font-size:20px; margin-bottom:2px; animation: bounce 2s infinite;">☔</span>' +
                             '<span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px;">ΒΡΟΧΗ ΣΤΑ ΔΙΑΛΕΙΜΜΑΤΑ:</span>' +
                             '<div class="rain-list">' + rainBadges + '</div>';
            }
            else {
              // ΑΝ ΔΕΝ ΒΡΕΞΕΙ / ΧΙΟΝΙΣΕΙ: Κανονική εμφάνιση με τα διαλείμματα
              let temp10 = Math.round(d.hourly.temperature_2m[baseIndex + 10]);
              let code10 = codes[d.hourly.weather_code[baseIndex + 10]] || "🌤️";
              
              let temp11 = Math.round(d.hourly.temperature_2m[baseIndex + 11]);
              let code11 = codes[d.hourly.weather_code[baseIndex + 11]] || "🌤️";
              
              let temp12 = Math.round(d.hourly.temperature_2m[baseIndex + 12]);
              let code12 = codes[d.hourly.weather_code[baseIndex + 12]] || "🌤️";

              let temp13 = Math.round(d.hourly.temperature_2m[baseIndex + 13]);
              let code13 = codes[d.hourly.weather_code[baseIndex + 13]] || "🌤️";

              hoverContent = '<span class="sch-time">🔔 09:40 ' + code10 + ' ' + temp10 + '°</span>' +
                             '<span class="sch-time">🔔 11:30 ' + code11 + ' ' + temp11 + '°</span>' +
                             '<span class="sch-time">🔔 12:25 ' + code12 + ' ' + temp12 + '°</span>' +
                             '<span class="sch-time" style="color:#a90e0e; margin-top:3px;">🎒 13:15 ' + code13 + ' ' + temp13 + '°</span>';
            }
          }

          // Υπολογισμός Μέγιστης/Ελάχιστης για την μπροστινή όψη (όπως ήταν)
          let baseIndex = i * 24;
          let dayTemps = d.hourly.temperature_2m.slice(baseIndex, baseIndex + 24);
          let maxTemp = Math.round(Math.max(...dayTemps));
          let minTemp = Math.round(Math.min(...dayTemps));
          let mainCode = codes[d.hourly.weather_code[baseIndex + 12]] || "🌤️";

          wHtml += '<div class="c-day-card ' + (i==0?'today':'') + '">' +
                     '<div class="c-day-inner">' +
                       '<div class="c-day-front">' +
                         '<span class="c-day-name">' + dName + '</span>' +
                         '<span class="c-day-icon">' + mainCode + '</span>' +
                         '<div class="c-day-temps"><span class="c-max">' + maxTemp + '°</span> <span>' + minTemp + '°</span></div>' +
                       '</div>' +
                       '<div class="c-day-back">' +
                          hoverContent +
                       '</div>' +
                     '</div>' +
                   '</div>';
        }
        document.getElementById('hub-weather-container').innerHTML = wHtml;
      })
      .catch(function() {
        document.getElementById('hub-weather-container').innerHTML = "<div style='font-size:10px;color:#888;width:100%;text-align:center;'>Πρόβλημα σύνδεσης... επαναφορά</div>";
        setTimeout(getRefreshedWeather, 5000); 
      });
  }

  getRefreshedWeather(); // Εκκίνηση

  const eortOrig = document.getElementById("eortologio-original-location");
  const eortGadget = document.querySelector(".combined-widget");
  let eortBase = document.getElementById("eortologio-mobile-base") || Object.assign(document.createElement("div"), {id:"eortologio-mobile-base", className:"widget"});

  function moveEortologio() {
      if (window.innerWidth <= 768) {
          let target = document.getElementById("bellTracker") || document.getElementById("HTML32");
          if (target) {
              target.after(eortBase);
              eortBase.appendChild(eortGadget);
          }
      } else if (eortOrig && eortOrig.parentNode) {
          eortOrig.parentNode.insertBefore(eortGadget, eortOrig.nextSibling);
          if (eortBase.parentNode) eortBase.parentNode.removeChild(eortBase);
      }
  }

  moveEortologio();
  setTimeout(moveEortologio, 1000); 

  window.addEventListener("resize", moveEortologio);
  window.addEventListener("load", moveEortologio);

})();
