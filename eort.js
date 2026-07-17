(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION & DICTIONARIES
    // ΕΔΩ ΜΠΟΡΕΙΣ ΝΑ ΠΡΟΣΘΕΤΕΙΣ ΟΣΑ ΔΕΔΟΜΕΝΑ ΘΕΛΕΙΣ
    // ==========================================
    const CONFIG = Object.freeze({
        weather: {
            lat: 40.2711,
            lon: 22.5044,
            url: "https://api.open-meteo.com/v1/forecast?latitude=40.2711&longitude=22.5044&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=3"
        },
        layout: {
            breakpoint: 768
        },
        dictionaries: {
            fixedNames: {
                "1-1": "Βασίλης, Βασιλική", "1-2": "Σίλβεστρος", "1-6": "Φώτης, Φωτεινή, Ουρανία, Ιορδάνης", "1-7": "Γιάννης, Ιωάννα, Πρόδρομος", "1-11": "Θεοδόσιος, Θεοδοσία", "1-12": "Τατιανή", "1-17": "Αντώνης, Αντωνία", "1-18": "Αθανάσιος, Αθανασία, Κύριλλος", "1-20": "Ευθύμιος, Ευθυμία", "1-24": "Ξένη, Ξένια", "1-25": "Γρηγόρης, Μαργαρίτα", "2-1": "Τρύφων", "2-2": "Υπαπαντή (Παναγιώτης, Μαρία)", "2-3": "Σταμάτης, Σταματία", "2-8": "Ζαχαρίας", "2-10": "Χαράλαμπος, Χαρίκλεια", "2-11": "Βλάσης, Βλασία", "2-14": "Βαλεντίνος, Βαλεντίνα", "3-1": "Ευδοκία", "3-9": "Σαράντης", "3-17": "Αλέξιος, Αλεξία", "3-25": "Ευάγγελος, Ευαγγελία", "5-5": "Ειρήνη, Εφραίμ", "5-21": "Κωνσταντίνος, Ελένη", "6-8": "Καλλιόπη", "6-29": "Πέτρος, Παύλος", "6-30": "Απόστολος, Αποστολία", "7-7": "Κυριακή", "7-11": "Όλγα, Έφη (Ευφημία)", "7-17": "Μαρίνα, Αλίκη", "7-20": "Ηλίας", "7-24": "Χριστίνα", "7-26": "Παρασκευή, Εύη", "7-27": "Παντελής", "7-28": "Ειρήνη Χρυσοβαλάντου", "8-6": "Σωτήρης, Σωτηρία", "8-15": "Μαρία, Παναγιώτης, Δέσποινα", "8-30": "Αλέξανδρος, Αλεξάνδρα", "9-1": "Συμεών, Μυρτώ, Αθηνά, Αφροδίτη", "9-14": "✝️ Ύψωση του Τιμίου Σταυρού, Σταύρος, Σταυρούλα / 🕯️ Ημέρα Μνήμης Γενοκτονίας Ελλήνων Μικράς Ασίας", "9-17": "Σοφία, Πίστη, Ελπίδα, Αγάπη", "9-20": "Ευστάθιος, Στάθης, Ευσταθία",  "10-3": "Διονύσης, Διονυσία", "10-13": "🇬🇷 Ημέρα Μακεδονικού Αγώνα", "10-26": "Δημήτρης, Δήμητρα", "11-1": "Αργύρης, Αργυρώ, Κοσμάς, Δαμιανός", "11-8": "Μιχάλης, Άγγελος, Γαβριήλ", "11-9": "Νεκτάριος", "11-11": "Μηνάς", "11-13": "Χρυσόστομος", "11-14": "Φίλιππος, Φιλιππία", "11-21": "Μαρία, Δέσποινα (Εισόδια)", "11-25": "Κατερίνα", "11-26": "Στέλιος, Στέλλα", "11-30": "Ανδρέας, Ανδριανή", "12-4": "Βαρβάρα", "12-5": "Σάββας", "12-6": "Νικόλαος, Νικολέτα", "12-9": "Άννα", "12-12": "Σπυρίδων, Σπυριδούλα", "12-15": "Ελευθέριος, Ελευθερία", "12-25": "Χρήστος, Χρυσή, Μανώλης", "12-27": "Στέφανος, Στεφανία"
            },
            fixedHolidays: {
               "1-1": "🎉 Πρωτοχρονιά (Αργία)", "1-6": "🕊️ Θεοφάνεια (Αργία)", "1-30": "🏫 Τριών Ιεραρχών (Σχολική Εορτή)", "3-25": "🇬🇷 25η Μαρτίου (Εθνική Επέτειος) / 🕊️Ευαγγελισμός της Θεοτόκου", "5-1": "🌸 Εργατική Πρωτομαγιά", "8-15": "⛪ Κοίμηση της Θεοτόκου", "10-28": "🇬🇷 28η Οκτωβρίου (Εθνική Επέτειος)", "11-17": "🕊️ Επέτειος του Πολυτεχνείου", "11-25": "⛪ Αγίας Αικατερίνης (Τοπική Αργία Πολιούχου)", "12-18": "⛪ Αγίου Μοδέστου (Τοπική Αργία)", "12-25": "🎄 Χριστούγεννα", "12-26": "🎁 Σύναξη της Θεοτόκου"
            },
            worldDays: {
                "1-4": "📖 Παγκόσμια Ημέρα Γραφής/Κώδικα Μπράιγ", "1-21": "🫂 Παγκόσμια Ημέρα Αγκαλιάς", "1-24": "🌍 Διεθνής Ημέρα Εκπαίδευσης", "1-27": "🕯️ Διεθνής Ημέρα Μνήμης Θυμάτων Ολοκαυτώματος", "1-26": "⚡ Διεθνής Ημέρα Καθαρής Ενέργειας", "1-28": "🛡️ Ευρωπαϊκή Ημέρα Προστασίας των Προσωπικών Δεδομένων", "2-2": "🦆 Παγκόσμια Ημέρα Υγροτόπων", "2-4": "🎗️ Παγκόσμια Ημέρα κατά του Καρκίνου",  "2-9": "🇬🇷 Παγκόσμια Ημέρα Ελληνικής Γλώσσας", "2-10": "🍲 Παγκόσμια Ημέρα για τα όσπρια / 💍 Παγκόσμια Ημέρα του Γάμου", "2-11": "👩‍🔬 Διεθνής Ημέρα για τις Γυναίκες στην Επιστήμη  / 🚑 Ευρωπαϊκή Ημέρα του 112 / 🤒 Παγκόσμια Ημέρα Ασθενούς", "2-13": "📻 Παγκόσμια Ημέρα Ραδιοφώνου", "2-14": "🫀 Παγκόσμια Ημέρα Συγγενών Καρδιοπαθειών", "2-15": "🎗️ Παγκόσμια Ημέρα κατά του Παιδικού Καρκίνου", "2-20": "⚖️ Παγκόσμια Ημέρα Κοινωνικής Δικαιοσύνης", "2-21": "🗣️ Παγκόσμια Ημέρα Μητρικής Γλώσσας/ 🗺️ Παγκόσμια Ημέρα του Ξεναγού", "2-22": "🤔 Παγκόσμια Ημέρα Σκέψης / ⚖️ Ευρωπαϊκή Ημέρα για τα Θύματα Εγκληματικών Πράξεων", "2-28": "🧬 Παγκόσμια Ημέρα Σπάνιων Παθήσεων", "3-1": "🚫 Ημέρα Μηδενικών Διακρίσεων", "3-3": "🦁 Παγκόσμια Ημέρα Άγριας ζωής / 👂 Παγκόσμια Ημέρα Ακοής", "3-4": "⚖️ Παγκόσμια Ημέρα Παχυσαρκίας",  "3-5": "🕊️ Διεθνής Ημέρα Ενημέρωσης για τον Αφοπλισμό", "3-6": "🛑 Παγκόσμια Ημέρα κατά της Βίας", "3-8": "👩 Διεθνής Ημέρα της Γυναίκας", "3-11": "🧪 Παγκόσμια Ημέρα Χημείας", "3-12": "💻 Παγκόσμια Ημέρα κατά της Λογοκρισίας στο Διαδίκτυο", "3-14": "🔢 Παγκόσμια Ημέρα της Σταθεράς Π", "3-15": "🛒 Παγκόσμια Ημέρα Καταναλωτή / 🗣️Ημέρα Λόγου / ⚖️ Ημέρα Προστασίας Ανθρωπίνων Δικαιωμάτων & Πολιτικών Ελευθεριών", "3-18": "♻️ Παγκόσμια Ημέρα Ανακύκλωσης",  "3-20": "😊 Διεθνής Ημέρα Ευτυχίας / 🦷Ημέρα Στοματικής Υγείας / 🎭Διεθνής Ημέρα Θεάτρου για τα παιδιά ♈ /Διεθνής Ημέρα Αστρολογίας / 🇫🇷 Διεθνής Ημέρα Γαλλοφωνίας / 🥩 Διεθνής Ημέρα Χωρίς Κρέας ", "3-21": "📜 Παγκόσμια Ημέρα Ποίησης /🚫 Κατά Ρατσισμού / 🌳Ημέρα Δασών/ 🎭 Κουκλοθέατρου", "3-22": "💧 Παγκόσμια Ημέρα για το Νερό", "3-23": "⛅ Παγκόσμια Ημέρα Μετεωρολογίας", "3-24": "🫁 Παγκόσμια Ημέρα κατά της Φυματίωσης /💡 Δικαίωμα στην Αλήθεια", "3-25": "⛓️ Διεθνής Ημέρα Μνήμης Θυμάτων Δουλεμπορίου", "3-27": "🎭 Παγκόσμια Ημέρα Θεάτρου / 🤝 Διεθνής Ημέρα Κοινωνικής Εργασίας", "3-28": "👥 Παγκόσμια Ημέρα Θεάτρου Σκιών", "3-30": "♻️ Διεθνής Ημέρα Μηδενικής Σπατάλης", "4-1": "🤡 Πρωταπριλιά", "4-2": "🧩 Παγκόσμια Ημέρα Παιδικού Βιβλίου", "4-4": "🐕 Παγκόσμια Ημέρα Αδέσποτων Ζώων / 💣 Διεθνής Ημέρα κατά των Ναρκών", "4-5": "🧠 Διεθνής Ημέρα Συνείδησης", "4-6": "🕯️Ημέρα Μνήμης Θρακικού Ελληνισμού/🏅 Παγκόσμια Ημέρα Αθλητισμού", "4-7": "⚕️ Παγκόσμια Ημέρα Υγείας", "4-8": "⛺ Ημέρα του Έθνους των Ρομά", "4-11": "🧠 Παγκόσμια Ημέρα κατά της Ασθενείας Πάρκινσον", "4-12": "🚀 Διεθνής Ημέρα της Πτήσης στο Διάστημα / 🛣️ Παγκόσμια Ημέρα για τα Παιδιά του Δρόμου", "4-15": "🎨 Παγκόσμια Ημέρα Τέχνης", "4-16": "🗣️ Παγκόσμια Ημέρα Φωνής", "4-17": "🚜 Παγκόσμια Ημέρα Αγροτικής Πάλης", "4-18": "🏛️ Παγκόσμια Ημέρα Πολιτιστικής Κληρονομιάς", "4-20": "🇨🇳 Ημέρα Κινέζικης Γλώσσας", "4-21": "💡 Παγκόσμια Ημέρα Δημιουργικότητας", "4-22": "🌍 Διεθνής Ημέρα της Γης", "4-23": "📚 Παγκόσμια Ημέρα Βιβλίου / 🇬🇧 Ημέρα Αγγλικής Γλώσσας", "4-24": "🐭 Παγκόσμια Ημέρα Κατάργησης Πειραμάτων σε Ζώα", "4-25": "🦟 Παγκόσμια Ημέρα κατά της Ελονοσίας", "4-26": "©️ Παγκόσμια Ημέρα Πνευματικής Ιδιοκτησίας", "4-27": "✏️ Παγκόσμια Ημέρα Σχεδίου (Design)", "4-28": "👷 Παγκόσμια Ημέρα για την Υγεία στην Εργασία/ 🕯️ Διεθνής Ημέρα Μνήμης Εργατών", "4-29": "💃 Παγκόσμια Ημέρα Χορού / ☣️ Ημέρα Μνήμης για τα Θύματα του Χημικού Πολέμου / 🛡️ Παγκόσμια Ημέρα Ανοσολογίας", "4-30": "🎷 Διεθνής Ημέρα Τζαζ", "5-1": "🛠️ Διεθνής Ημέρα Εργατών",  "5-2": "🐟 Παγκόσμια Ημέρα Τόνου", "5-3": "📰 Παγκόσμια Ημέρα Ελευθεροτυπίας", "5-4": "🚒 Διεθνής Ημέρα Πυροσβεστών", "5-5": "👶 Διεθνής Ημέρα Μαιών", "5-8": "➕ Παγκόσμια Ημέρα Ερυθρού Σταυρού", "5-9": "🇪🇺 Ημέρα της Ευρώπης",  "5-11": "🦅 Παγκόσμια Ημέρα Αποδημητικών Πτηνών", "5-12": "🩺 Διεθνής Ημέρα Αδελφών Νοσοκόμων", "5-15": "👨‍👩‍👧‍👦 Διεθνής Ημέρα Οικογένειας", "5-17": "🏳️‍🌈 Διεθνής Ημέρα κατά της Ομοφοβίας/🛰️ Ημέρα Τηλεπικοινωνιών", "5-18": "🖼️ Παγκόσμια Ημέρα Μουσείων", "5-19": "🩺 Παγκόσμια Ημέρα κατά της Ηπατίτιδας / 🕯️ Ημέρα Μνήμης Γενοκτονίας Ποντίων", "5-20": "🐝 Παγκόσμια Ημέρα Μέλισσας", "5-21": "🌍 Παγκόσμια Ημέρα Πολιτισμού", "5-22": "🌿 Παγκόσμια Ημέρα Βιοποικιλότητας", "5-24": "🏞️ Ευρωπαϊκή Ημέρα Πάρκων", "5-25": "👧 Διεθνής Ημέρα Εξαφανισμένων Παιδιών / ⚽ Παγκόσμια Ημέρα Ποδοσφαίρου", "5-31": "🚭 Παγκόσμια Ημέρα κατά του Καπνίσματος", "6-1": "👨‍👩‍👦 Παγκόσμια Ημέρα Γονέων / 🥛 Παγκόσμια Ημέρα Γάλακτος", "6-3": "🚲 Παγκόσμια Ημέρα Ποδηλάτου", "6-4": "🧒 Διεθνής Ημέρα κατά της Επιθετικότητας εναντίον Αθώων Παιδιών", "6-5": "🌳 Παγκόσμια Ημέρα Περιβάλλοντος", "6-7": "🍽️ Παγκόσμια Ημέρα για την Ασφάλεια Τροφίμων", "6-8": "🌊 Παγκόσμια Ημέρα Ωκεανών", "6-11": "🧸 Διεθνής Ημέρα Παιχνιδιού", "6-12": "🚸 Παγκόσμια Ημέρα κατά της Παιδικής Εργασίας", "6-14": "🩸 Παγκόσμια Ημέρα Εθελοντή Αιμοδότη", "6-15": "🧓 Παγκόσμια Ημέρα Ενημέρωσης για την Κακοποίηση των Ηλικιωμένων/ Παγκόσμια Ημέρα Γονιμότητας / 🌬️ Παγκόσμια Ημέρα Ανέμου", "6-17": "🌵 Παγκόσμια Ημέρα κατά της Ξηρασίας και της Ερημοποίησης", "6-20": "🚶 Παγκόσμια Ημέρα Προσφύγων", "6-21": "🎵 Ευρωπαϊκή Ημέρα Μουσικής", "6-23": "🏅 Ολυμπιακή Ημέρα / 🏛️ Ημέρα των Ηνωμένων Εθνών για τη Δημόσια Υπηρεσία", "6-25": "⚓ Ημέρα των Ναυτικών", "6-26": "🚫 Παγκόσμια Ημέρα κατά των Ναρκωτικών / ⛓️ Διεθνής Ημέρα κατά των Βασανιστηρίων", "6-27": "🏢 Διεθνής Ημέρα Μικρομεσαίων Επιχειρήσεων / 🦻 Διεθνής Ημέρα Κώφωσης και Τυφλότητας", "6-30": "☄️ Διεθνής Ημέρα Αστεροϊδών / 🏛️ Διεθνής Ημέρα Κοινοβουλευτισμού", "7-11": "👥 Παγκόσμια Ημέρα Πληθυσμού", "7-12": "🕊️ Διεθνής Ημέρα Ελπίδας", "7-17": "⚖️ Παγκόσμια Ημέρα Διεθνούς Δικαιοσύνης", "7-18": "✊ Διεθνής Ημέρα Νέλσον Μαντέλα", "7-20": "♟️ Παγκόσμια Ημέρα Σκακιού", "7-25": "🏊 Παγκόσμια Ημέρα Πρόληψης των Πνιγμών /⚖️ Δικαστική Ευημερία", "7-28": "🩺 Παγκόσμια Ημέρα κατά της Ηπατίτιδας", "7-30": "🤝 Διεθνής Ημέρα Φιλίας", "8-1": "🤱 Παγκόσμια Ημέρα (Εβδομάδα) Μητρικού Θηλασμού", "8-9": "🏕️ Παγκόσμια Ημέρα Ιθαγενών Λαών", "8-12": "🧑‍🦱 Παγκόσμια Ημέρα Νεολαίας", "8-19": "📸 Παγκόσμια Ημέρα Φωτογραφίας / 🤝 Παγκόσμια Ανθρωπιστική Ημέρα", "8-21": "🕯️ Διεθνής Ημέρα Μνήμης Θυμάτων Τρομοκρατίας", "8-23": "⛓️ Παγκόσμια Ημέρα για την Υπενθύμιση του Δουλεμπορίου και της Κατάργησής του",  "8-27": "🌊 Παγκόσμια Ημέρα Λιμνών", "8-30": "❓ Διεθνής Ημέρα Εξαφανισμένων",  "9-5": "🤝 Διεθνής Ημέρα Φιλανθρωπίας", "9-8": "📖 Διεθνής Ημέρα Εγγραμματισμού", "9-15": "🗳️ Διεθνής Ημέρα Δημοκρατίας", "9-16": "🛡️ Διεθνής Ημέρα για το Όζον", "9-17": "🏥 Διεθνής Ημέρα Ασφάλειας Ασθενών", "9-20": "🧹 Παγκόσμια Ημέρα Καθαριότητας", "9-21": "🕊️ Διεθνής Ημέρα Ειρήνης / 🧠 Παγκόσμια Ημέρα Αλτσχάιμερ", "9-22": "🚫🚗 Παγκόσμια Ημέρα Χωρίς Αυτοκίνητο", "9-26": "🗣️ Ευρωπαϊκή Ημέρα Γλωσσών", "9-27": "✈️ Παγκόσμια Ημέρα Τουρισμού", "9-29": "❤️ Παγκόσμια Ημέρα Καρδιάς", "9-30": "🗣️ Διεθνής Ημέρα Μετάφρασης", "10-1": "🧓 Παγκόσμια Ημέρα Τρίτης Ηλικίας", "10-2": "☮️ Διεθνής Ημέρα Μη Βίας", "10-4": "🐾 Παγκόσμια Ημέρα των Ζώων", "10-5": "👨‍🏫 Παγκόσμια Ημέρα Εκπαιδευτικών", "10-9": "✉️ Παγκόσμια Ημέρα Ταχυδρομείων", "10-10": "🧠 Παγκόσμια Ημέρα Ψυχικής Υγείας / ⚖️ Παγκόσμια Ημέρα κατά της Θανατικής Ποινής", "10-11": "👧 Διεθνής Ημέρα Κοριτσιού", "10-13": "🌪️ Διεθνής Ημέρα Μείωσης Φυσικών Καταστροφών", "10-15": "🧼 Παγκόσμια Ημέρα Πλυσίματος Χεριών / 🦯 Διεθνής Ημέρα του Λευκού Μπαστουνιού / 👩‍🌾 Διεθνής Ημέρας Αγρότισσας",  "10-16": "🇬🇷 Απελευθέρωση Κατερίνης / 🍎 Παγκόσμια Ημέρα Διατροφής / 🦴 Παγκόσμια Ημέρα Σπονδυλικής Στήλης", "10-17": "📉 Διεθνής Ημέρα Εξάλειψης Φτώχειας", "10-24": "🇺🇳 Ημέρα Ηνωμένων Εθνών / 🌊 Μεσογειακή Ημέρα Ακτών", "10-27": "🎞️ Παγκόσμια Ημέρα Οπτικοακουστικής Κληρονομιάς", "10-28": "🎬 Διεθνής Ημέρα Κινουμένου Σχεδίου", "10-29": "🤝 Διεθνής Ημέρα Φροντίδας και Στήριξης", "10-31": "🏦 Παγκόσμια Ημέρα Αποταμίευσης", "11-9": "🚫 Διεθνής Ημέρα κατά του Φασισμού και του Αντισημιτισμού", "11-10": "🔬 Παγκόσμια Ημέρα Επιστήμης για την Ειρήνη και την Ανάπτυξη", "11-13": "🤗 Παγκόσμια Ημέρα Καλοσύνης",  "11-14": "🩸 Παγκόσμια Ημέρα Διαβήτη", "11-16": "🤝 Διεθνής Ημέρα Ανεκτικότητας / 🥗 Διεθνής Ημέρα Μεσογειακής Διατροφής", "11-19": "👨 Παγκόσμια Ημέρα Ανδρών", "11-20": "👦👧 Παγκόσμια Ημέρα Δικαιωμάτων Παιδιού", "11-21": "📺 Παγκόσμια Ημέρα Τηλεόρασης / 👋 Παγκόσμια Ημέρα Χαιρετισμού", "11-25": "🛑 Διεθνής Ημέρα κατά της Βίας κατά των Γυναικών", "12-1": "🎗️ Παγκόσμια Ημέρα κατά του AIDS", "12-2": "⛓️ Διεθνής Ημέρα για την Κατάργηση της Δουλείας", "12-3": "♿ Παγκόσμια Ημέρα Ατόμων με Αναπηρία", "12-5": "🙋 Παγκόσμια Ημέρα Εθελοντισμού", "12-7": "✈️ Διεθνής Ημέρα Πολιτικής Αεροπορίας", "12-9": "⚖️ Παγκόσμια Ημέρα κατά της Διαφθοράς/ 🕯️ Διεθνής Ημέρα Μνήμης Θυμάτων Γενοκτονίας", "12-10": "🕊️ Παγκόσμια Ημέρα Ανθρωπίνων Δικαιωμάτων / ©️ Παγκόσμια Ημέρα Ιδιοκτησίας", "12-11": "👶 Παγκόσμια Ημέρα Παιδιού (UNICEF) / ⛰️ Διεθνής Ημέρα Βουνών", "12-14": "❤️ Παγκόσμια Ημέρα Αγάπης",  "12-18": "🚶 Διεθνής Ημέρα Μεταναστών", "12-20": "🤝 Διεθνής Ημέρα Ανθρώπινης Αλληλεγγύης"
            }
        }
    });

    // ==========================================
    // 2. UTILITIES (Μαθηματικά Εργαλεία Ημερομηνιών)
    // ==========================================
    const Utils = {
        debounce: (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        },
        // Βρίσκει την "n-οστή" ημέρα του μήνα (π.χ. 2η Κυριακή του Μαΐου)
        getNthDayOfMonth: (year, month, dayOfWeek, n) => {
            const firstDay = new Date(year, month - 1, 1).getDay();
            const offset = (dayOfWeek - firstDay + 7) % 7;
            return 1 + offset + (n - 1) * 7;
        },
        // Βρίσκει την Τελευταία ημέρα (π.χ. Τελευταία Παρασκευή) του μήνα
        getLastDayOfMonth: (year, month, dayOfWeek) => {
            const d = new Date(year, month, 0); // Τελευταία μέρα του μήνα
            const offset = (d.getDay() - dayOfWeek + 7) % 7;
            return d.getDate() - offset;
        },
        getOrthodoxEaster: (year) => {
            const a = year % 19, b = year % 4, c = year % 7;
            const d = (19 * a + 15) % 30;
            const e = (2 * b + 4 * c + 6 * d + 6) % 7;
            const easterDate = new Date(year, 2, 22);
            easterDate.setDate(easterDate.getDate() + (d + e + 13));
            return easterDate;
        },
        // Υπολογισμός διαφοράς ημερών χωρίς bugs από την αλλαγή ώρας (DST)
        getDaysDiff: (date1, date2) => {
            const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
            const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
            return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
        }
    };

    // ==========================================
    // 3. DATE ENGINE (Υπολογισμός όλων των κινητών ημερών)
    // ==========================================
    const DateEngine = {
        today: new Date(),
        init: function() {
            this.y = this.today.getFullYear();
            this.m = this.today.getMonth() + 1;
            this.d = this.today.getDate();
            this.dateKey = `${this.m}-${this.d}`;
            
            this.easter = Utils.getOrthodoxEaster(this.y);
            this.diffFromEaster = Utils.getDaysDiff(this.today, this.easter);
            this.isLeapYear = (this.y % 4 === 0 && this.y % 100 !== 0) || (this.y % 400 === 0);
            this.isGeorgeMoved = (this.easter >= new Date(this.y, 3, 23));

            this.calculateMovableWorldDays();
        },

        calculateMovableWorldDays: function() {
            const y = this.y;
            // Υπολογισμός Ισημερίας για Ύπνο και Αφήγηση
            const eq = new Date(y, 2, 20);
            const sleepOffset = ((eq.getDay() + 1) % 7) + 1;
            const sleepDate = new Date(y, 2, 20 - sleepOffset);
            const storytellingDay = Math.floor(20.25 - (y - 2000) * 0.0025);

            this.movableDays = {
                isSleepDay: (this.m === sleepDate.getMonth() + 1 && this.d === sleepDate.getDate()),
                isStorytellingDay: (this.m === 3 && this.d === storytellingDay),
                isMotherDay: (this.m === 5 && this.d === Utils.getNthDayOfMonth(y, 5, 0, 2)),
                isFatherDay: (this.m === 6 && this.d === Utils.getNthDayOfMonth(y, 6, 0, 3)),
                isSaferInternetDay: (this.m === 2 && this.d === Utils.getNthDayOfMonth(y, 2, 2, 2)),
                isSmileDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 5, 1)),
                isTrafficVictimsDay: (this.m === 11 && this.d === Utils.getNthDayOfMonth(y, 11, 0, 3)),
                isVetDay: (this.m === 4 && this.d === Utils.getLastDayOfMonth(y, 4, 6)),
                isProgrammerDay: (this.m === 9 && this.d === (this.isLeapYear ? 12 : 13)),
                isCoastalCleanup: (this.m === 9 && this.d === Utils.getNthDayOfMonth(y, 9, 6, 3)),
                isResearchersNight: (this.m === 9 && this.d === Utils.getLastDayOfMonth(y, 9, 5)),
                isBirdwatch: (this.m === 10 && (this.d === Utils.getNthDayOfMonth(y, 10, 6, 1) || this.d === Utils.getNthDayOfMonth(y, 10, 0, 1))),
                isHabitatArchDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 1, 1)),
                isSightDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 4, 2)),
                isPhilosophyDay: (this.m === 11 && this.d === Utils.getNthDayOfMonth(y, 11, 4, 3)),
                isBuyNothingDay: (this.m === 11 && this.d === (Utils.getNthDayOfMonth(y, 11, 4, 4) + 1)),
                isMaritimeDay: (this.m === 9 && this.d === Utils.getLastDayOfMonth(y, 9, 4)),
                isLighthouseDay: (this.m === 8 && (this.d === Utils.getNthDayOfMonth(y, 8, 6, 3) || this.d === Utils.getNthDayOfMonth(y, 8, 0, 3))),
                isHospiceDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 6, 2)),
                isNoiseDay: (this.m === 4 && this.d === Utils.getLastDayOfMonth(y, 4, 3))
            };
        }
    };

    // ==========================================
    // 4. HOLIDAY ENGINE (Διαχείριση Περιεχομένου Εορτολογίου)
    // ==========================================
    const HolidayEngine = {
        getWorldDays: () => {
            let days = [];
            if (CONFIG.dictionaries.worldDays[DateEngine.dateKey]) days.push(CONFIG.dictionaries.worldDays[DateEngine.dateKey]);
            
            const mov = DateEngine.movableDays;
            if (mov.isSleepDay) days.push("💤 Παγκόσμια Ημέρα Ύπνου");
            if (mov.isStorytellingDay) days.push("📖 Παγκόσμια Ημέρα Αφήγησης");
            if (mov.isMotherDay) days.push("🌸 Γιορτή της Μητέρας");
            if (mov.isFatherDay) days.push("👔 Γιορτή του Πατέρα");
            if (mov.isSaferInternetDay) days.push("🔒 Ημέρα Ασφαλούς Διαδικτύου");
            if (mov.isSmileDay) days.push("😁 Παγκόσμια Ημέρα Χαμόγελου");
            if (mov.isTrafficVictimsDay) days.push("🚗 Παγκόσμια Ημέρα Μνήμης Θυμάτων Τροχαίων Ατυχημάτων");
            if (mov.isVetDay) days.push("⚕️ Παγκόσμια Ημέρα Κτηνιατρικής");
            if (mov.isProgrammerDay) days.push("💻 Παγκόσμια Ημέρα Προγραμματιστή");
            if (mov.isCoastalCleanup) days.push("🏖️ Παγκόσμια Ημέρα Εθελοντικού Καθαρισμού των Ακτών / 🐧 Παγκόσμια Ημέρα Ελεύθερου Λογισμικού");
            if (mov.isResearchersNight) days.push("🔬 Βραδιά του Ερευνητή");
            if (mov.isBirdwatch) days.push("🐦 Πανευρωπαϊκή Γιορτή των Πουλιών");
            if (mov.isHabitatArchDay) days.push("🏘️ Παγκόσμια Ημέρα Κατοικίας / 🏛️ Παγκόσμια Ημέρα Αρχιτεκτονικής");
            if (mov.isSightDay) days.push("👁️ Παγκόσμια Ημέρα Όρασης - Κατά της Τύφλωσης");
            if (mov.isPhilosophyDay) days.push("🤔 Παγκόσμια Ημέρα Φιλοσοφίας");
            if (mov.isBuyNothingDay) days.push("🛍️ Παγκόσμια Ημέρα Αγοραστικής Αποχής");
            if (mov.isMaritimeDay) days.push("⚓ Παγκόσμια Ναυτική Ημέρα");
            if (mov.isLighthouseDay) days.push("🗼 Παγκόσμια Ημέρα Φάρων");
            if (mov.isHospiceDay) days.push("🏥 Παγκόσμια Ημέρα Ξενώνων και Παρηγορητικής Φροντίδας");
            if (mov.isNoiseDay) days.push("🤫 Διεθνής Ημέρα κατά του Θορύβου");

            return days;
        },

        getHolidays: () => {
            let holidays = [];
            const diff = DateEngine.diffFromEaster;

            if (diff === -59) holidays.push("🍖 Τσικνοπέμπτη!");
            else if (diff === -48) holidays.push("🪁 Καθαρά Δευτέρα (Αργία)");
            else if (diff === -42) holidays.push("⛪ Κυριακή της Ορθοδοξίας");
            else if (diff === -28) holidays.push("✝️ Κυριακή της Σταυροπροσκυνήσεως");
            else if (diff === -16) holidays.push("⛪ Παρασκευή του Ακαθίστου Ύμνου");
            else if (diff === -8) holidays.push("🌿 Σάββατο του Λαζάρου");
            else if (diff === -7) holidays.push("🌿 Κυριακή των Βαΐων");
            else if (diff === -2) holidays.push("⛪ Μεγάλη Παρασκευή (Ημιαργία)");
            else if (diff === 0) holidays.push("🕯️ Κυριακή του Πάσχα");
            else if (diff === 1) holidays.push("🥚 Δευτέρα του Πάσχα (Αργία)");
            else if (diff === 5) holidays.push("💧 Ζωοδόχου Πηγής");
            else if (diff === 39) holidays.push("⛪ Ανάληψη του Κυρίου");
            else if (diff === 49) holidays.push("🔥 Πεντηκοστή");
            else if (diff === 50) holidays.push("🕊️ Αγίου Πνεύματος (Αργία)");
            else if (diff === 56) holidays.push("⛪ Κυριακή των Αγίων Πάντων");

            if (CONFIG.dictionaries.fixedHolidays[DateEngine.dateKey]) {
                holidays.push(CONFIG.dictionaries.fixedHolidays[DateEngine.dateKey]);
            }
            return holidays;
        },

        getNames: () => {
            const diff = DateEngine.diffFromEaster;
            const isMoved = DateEngine.isGeorgeMoved;

            if (diff === -43) return "Θεόδωρος, Θεοδώρα (Αγ. Θεοδώρων)";
            if (diff === -8) return "Λάζαρος, Λάζος (Του Λαζάρου)";
            if (diff === -7) return "Βάιος, Βαΐα, Δάφνη (Των Βαΐων)";
            if (diff === 0) return "Αναστάσιος, Αναστασία, Λάμπρος, Πασχάλης";
            if (diff === 1) return isMoved ? "Γιώργος, Γεωργία, Ελισάβετ" : "";
            if (diff === 2) return "Ραφαήλ, Νικόλαος, Ειρήνη (Λέσβου)";
            if (diff === 5) return "Ζωή, Πηγή, Ζωοδόχος (Ζωοδόχου Πηγής)";
            if (diff === 7) return "Θωμάς (Του Θωμά)";
            if (diff === 50) return "Τριάδα, Τριαντάφυλλος, Τριανταφυλλιά";
            if (diff === 56) return "Πανταζής, Πάντος (Αγίων Πάντων)";
            
            if (DateEngine.dateKey === "4-23") return isMoved ? "" : "Γιώργος, Γεωργία";
            if (DateEngine.dateKey === "4-24") return isMoved ? "" : "Ελισάβετ";
            
            return CONFIG.dictionaries.fixedNames[DateEngine.dateKey] || "";
        },

        getSchoolHolidays: () => {
            const m = DateEngine.m;
            const d = DateEngine.d;
            const diff = DateEngine.diffFromEaster;

           if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return " \u26C4\uFE0F Σχολικές Διακοπές Χριστουγέννων";
           if (diff >= -8 && diff <= 7) return " \uD83D\uDC30\uFE0F Σχολικές Διακοπές Πάσχα";
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) return " \u2600\uFE0F Θερινές Σχολικές Διακοπές";
        }
    };

    // ==========================================
    // 5. WEATHER ENGINE (Με αυτόματη επαναπροσπάθεια)
    // ==========================================
    const WeatherEngine = {
        fetchWithRetry: async (retries = 3) => {
            try {
                const response = await fetch(CONFIG.weather.url);
                if (!response.ok) throw new Error("HTTP error " + response.status);
                return await response.json();
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return WeatherEngine.fetchWithRetry(retries - 1);
                }
                throw error;
            }
        },

        getDayTypeContent: (data, dayOffset) => {
            const dDate = new Date();
            dDate.setDate(DateEngine.today.getDate() + dayOffset);
            
            const m = dDate.getMonth() + 1;
            const d = dDate.getDate();
            const dayOfWeek = dDate.getDay();
            const diffFromEaster = Utils.getDaysDiff(dDate, DateEngine.easter);
            
            const schoolHolidays = ["10-28", "11-17", "11-25", "1-30", "3-25", "5-1"];
            const isHoliday = schoolHolidays.includes(`${m}-${d}`) || diffFromEaster === -48 || diffFromEaster === 50;

            if (dayOfWeek === 0 || dayOfWeek === 6) return '<span class="sch-msg">🎈 Καλό</span><span class="sch-msg">Σ/Κ!</span>';
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) return '<span class="sch-msg">🏖️ Καλό</span><span class="sch-msg">Καλο-<br>καίρι!</span>';
            if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return '<span class="sch-msg">🎄 Καλές</span><span class="sch-msg">Γιορτές!</span>';
            if (diffFromEaster >= -8 && diffFromEaster <= 7) return '<span class="sch-msg">🐰 Καλό</span><span class="sch-msg">Πάσχα!</span>';
            if (isHoliday) return '<span class="sch-msg">🇬🇷 Χρόνια</span><span class="sch-msg">Πολλά!</span>';

            // Έλεγχος Καιρού Διαλειμμάτων
            const codes = {
                0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
                61:"🌧️", 63:"🌧️", 65:"🌧️", 71:"❄️", 73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️",
                81:"🌧️", 82:"🌧️", 95:"⛈️", 96:"⛈️", 99:"⛈️"
            };
            
            const baseIndex = dayOffset * 24;
            const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
            const snowCodes = [71, 73, 75, 77];
            let rainWarnings = [], snowWarnings = [];

            [10, 11, 12, 13].forEach(hour => {
                const code = data.hourly.weather_code[baseIndex + hour];
                const timeLabel = hour === 10 ? "09:40" : hour === 11 ? "11:30" : hour === 12 ? "12:25" : "13:15";
                if (rainCodes.includes(code)) rainWarnings.push(timeLabel);
                if (snowCodes.includes(code)) snowWarnings.push(timeLabel);
            });

            if (snowWarnings.length > 0) {
                const badges = snowWarnings.map(t => `<span class="snow-badge">Διάλειμμα ${t}</span>`).join('');
                return `<span class="sch-msg" style="font-size:22px; margin-bottom:2px; animation: bounce 2s infinite; color:#1e6cff;">❄️</span><span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px; color:#1e6cff;">ΧΙΟΝΟΠΤΩΣΗ ΣΤΑ ΔΙΑΛΕΙΜΜΑΤΑ:</span><div class="snow-list">${badges}</div>`;
            } 
            if (rainWarnings.length > 0) {
                const badges = rainWarnings.map(t => `<span class="rain-badge">Διάλειμμα ${t}</span>`).join('');
                return `<span class="sch-msg" style="font-size:20px; margin-bottom:2px; animation: bounce 2s infinite;">☔</span><span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px;">ΒΡΟΧΗ ΣΤΑ ΔΙΑΛΕΙΜΜΑΤΑ:</span><div class="rain-list">${badges}</div>`;
            }

            // Κανονική Μέρα χωρίς φαινόμενα
            const getHourData = (h) => {
                const temp = Math.round(data.hourly.temperature_2m[baseIndex + h]);
                const icon = codes[data.hourly.weather_code[baseIndex + h]] || "🌤️";
                return `${icon} ${temp}°`;
            };

            return `<span class="sch-time">🔔 09:40 ${getHourData(10)}</span>
                    <span class="sch-time">🔔 11:30 ${getHourData(11)}</span>
                    <span class="sch-time">🔔 12:25 ${getHourData(12)}</span>
                    <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🎒 13:15 ${getHourData(13)}</span>`;
        }
    };

    // ==========================================
    // 6. UI & LAYOUT MANAGER (Μόνο ζωγραφίζει, δεν υπολογίζει)
    // ==========================================
    const UIEngine = {
        renderHeader: () => {
            document.getElementById('dynamic-day-icon').innerText = DateEngine.d;
            document.getElementById('eort-date').innerText = DateEngine.today.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });
            if (DateEngine.diffFromEaster === -48) {
                document.getElementById('main-icon').innerText = "🪁";
            }
        },

        renderHolidays: () => {
            const worldDays = HolidayEngine.getWorldDays();
            const wdDiv = document.getElementById('eort-world-day');
            wdDiv.innerHTML = worldDays.join(" / ");
            wdDiv.style.display = worldDays.length ? "block" : "none";

            const holidays = HolidayEngine.getHolidays();
            const hDiv = document.getElementById('eort-holiday');
            hDiv.innerHTML = holidays.join("<br>");
            hDiv.style.display = holidays.length ? "block" : "none";

            const names = HolidayEngine.getNames();
            const nDiv = document.getElementById('eort-names');
            if (names) {
                nDiv.innerHTML = "<b>Γιορτάζουν:</b><br>" + names;
                nDiv.style.display = "block";
            } else {
                nDiv.style.display = "none";
            }

            const schoolStr = HolidayEngine.getSchoolHolidays();
            const sDiv = document.getElementById('eort-school');
            sDiv.innerText = schoolStr;
            sDiv.style.display = schoolStr ? "block" : "none";
        },

        renderWeather: async () => {
            const container = document.getElementById('hub-weather-container');
            try {
                const data = await WeatherEngine.fetchWithRetry();
                const codes = {
                    0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
                    61:"🌧️", 63:"🌧️", 65:"🌧️", 71:"❄️", 73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️",
                    81:"🌧️", 82:"🌧️", 95:"⛈️", 96:"⛈️", 99:"⛈️"
                };
                const daysArr = ['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ'];
                let wHtml = '';

                for(let i=0; i<3; i++) {
                    const dDate = new Date();
                    dDate.setDate(DateEngine.today.getDate() + i);
                    const dName = (i===0) ? "Σήμερα" : (i===1 ? "Αύριο" : daysArr[dDate.getDay()]);
                    
                    const baseIndex = i * 24;
                    const dayTemps = data.hourly.temperature_2m.slice(baseIndex, baseIndex + 24);
                    const maxTemp = Math.round(Math.max(...dayTemps));
                    const minTemp = Math.round(Math.min(...dayTemps));
                    const mainCode = codes[data.hourly.weather_code[baseIndex + 12]] || "🌤️";
                    const hoverContent = WeatherEngine.getDayTypeContent(data, i);

                    wHtml += `
                        <div class="c-day-card ${i===0 ? 'today' : ''}">
                            <div class="c-day-inner">
                                <div class="c-day-front">
                                    <span class="c-day-name">${dName}</span>
                                    <span class="c-day-icon">${mainCode}</span>
                                    <div class="c-day-temps"><span class="c-max">${maxTemp}°</span> <span>${minTemp}°</span></div>
                                </div>
                                <div class="c-day-back">${hoverContent}</div>
                            </div>
                        </div>`;
                }
                container.innerHTML = wHtml;
            } catch (error) {
                container.innerHTML = "<div style='font-size:10px;color:#888;width:100%;text-align:center;'>Η υπηρεσία καιρού είναι προσωρινά μη διαθέσιμη.</div>";
            }
        },

        moveLayout: () => {
            const eortOrig = document.getElementById("eortologio-original-location");
            const eortGadget = document.querySelector(".combined-widget");
            if (!eortOrig || !eortGadget) return;

            let eortBase = document.getElementById("eortologio-mobile-base");
            if (!eortBase) {
                eortBase = Object.assign(document.createElement("div"), {id: "eortologio-mobile-base", className: "widget"});
            }

            if (window.innerWidth <= CONFIG.layout.breakpoint) {
                let target = document.getElementById("bellTracker") || document.getElementById("HTML32");
                if (target) {
                    if (eortBase.parentNode !== target.parentNode) target.after(eortBase);
                    if (eortGadget.parentNode !== eortBase) eortBase.appendChild(eortGadget);
                }
            } else if (eortOrig.parentNode) {
                if (eortGadget.parentNode !== eortOrig.parentNode) eortOrig.parentNode.insertBefore(eortGadget, eortOrig.nextSibling);
                if (eortBase.parentNode) eortBase.parentNode.removeChild(eortBase);
            }
        }
    };

    // ==========================================
    // 7. BOOTSTRAP (Εκκίνηση)
    // ==========================================
    const AppController = {
        init: () => {
            DateEngine.init();
            UIEngine.renderHeader();
            UIEngine.renderHolidays();
            UIEngine.renderWeather(); // Τρέχει ασύγχρονα στο παρασκήνιο

            UIEngine.moveLayout();
            window.addEventListener("resize", Utils.debounce(UIEngine.moveLayout, 150), { passive: true });
            window.addEventListener("load", UIEngine.moveLayout, { once: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
    }

})();
