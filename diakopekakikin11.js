(() => {
    "use strict";

    const CONFIG = Object.freeze({
        messageDelay: 7000,
        storageKey: "holidayShownMsgsMobile", // Διαφορετικό κλειδί αποθήκευσης 
      jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/diakopeka.json'
    });

    const DOM = {};
const DataEngine = {
        // ΝΕΟ: Εφεδρικό μήνυμα εξαρχής, για να μην υπάρχει ποτέ "νεκρό κλικ" 
        // όσο περιμένουμε να κατέβει το JSON από τον server.
        messagesArray: ["Μείνε προσηλωμένος στον στόχο σου. Οι διακοπές είναι η ανταμοιβή σου! 🏖️"],
        fetchMessages: async () => {
            try {
                const response = await fetch(CONFIG.jsonUrl);
                const data = await response.json();
                DataEngine.messagesArray = data.messages || [];
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

    const MobileCoreEngine = {
        update: () => {
            if (!DOM.display || !DOM.icon) return;

            const now = new Date();
            const year = now.getFullYear();

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

            if ((now >= summerStart && now <= summerEnd) || 
                (now >= xmasStart && now <= xmasEnd) || 
                (now >= easterStart && now <= easterEnd)) {
                
                DOM.icon.innerHTML = "&#10024;"; 
                DOM.display.innerHTML = '<span class="holiday-days">Καλές διακοπές!</span>';
                MobileCoreEngine.updateBattery(now, true, easterStart, easterEnd); 
                return;
            }

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

            DOM.icon.innerHTML = next.icon;
            DOM.display.innerHTML = `<span class="holiday-days">Μένουν ${diffDays} ημέρες</span> ${next.name}`;

            MobileCoreEngine.updateBattery(now, false, easterStart, easterEnd);
        },

        updateBattery: (now, isHoliday, easterStart, easterEnd) => {
            if (!DOM.batFill || !DOM.batText) return;

            const dayOfYear = Utils.getDayOfYear(now);
            const easterStartDay = Utils.getDayOfYear(easterStart);
            let batLevel = 50;
            const m = now.getMonth() + 1, d = now.getDate();
            const isEaster = (now >= easterStart && now <= easterEnd);
           // ΔΙΟΡΘΩΣΗ: Αποτροπή "καλοκαιριού" μέσα στον Οκτώβριο/Νοέμβριο
            const isSummer = (m === 6 && d >= 16) || (m === 7) || (m === 8) || (m === 9 && d <= 10);
            const isXmas = (m === 12 && d >= 24) || (m === 1 && d <= 7);

            if (isSummer) {
                const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                batLevel = 5 + ((dayOfYear - summerStartDay) * 1.31); 
            } else if (isXmas) {
                // ΔΙΟΡΘΩΣΗ: Αλάνθαστος υπολογισμός ημερών (από 22 Δεκ) που δεν κολλάει στα Δίσεκτα Έτη!
                const xmasStartCalc = new Date(now.getFullYear() - (m === 1 ? 1 : 0), 11, 22);
                const xmasDay = Math.floor((now - xmasStartCalc) / 86400000);
                batLevel = 50 + (xmasDay * 1.87); 
            } else if (isEaster) {
                batLevel = 40 + ((dayOfYear - easterStartDay + 1) * 1.87);
            } else {
                // --- ΝΕΟ 2: Υπολογισμός με Εκθετική Πτώση (Αληθινή Ψυχολογία) ---
               if (dayOfYear >= 244) {
                    // Σεπτ - Χριστούγεννα (περίπου 113 μέρες). Από 100% πέφτει στο 47%
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 244, 113, 100, 47); 
                } else if (dayOfYear >= 8 && dayOfYear < easterStartDay) {
                    // Ιανουάριος - Πάσχα. Από 80% πέφτει στο 40% (ανάλογα το Πάσχα)
                    const daysToEaster = easterStartDay - 8;
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 8, daysToEaster, 80, 40); 
                } else {
                    // Πάσχα - Καλοκαίρι. Από 70% πέφτει στο 5%
                    const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                    const daysToSummer = Math.max(1, summerStartDay - (easterStartDay + 15));
                    batLevel = Utils.getBurnoutCurve(dayOfYear, easterStartDay + 15, daysToSummer, 70, 5); 
                }
            }

            batLevel = Math.max(5, Math.min(100, Math.round(batLevel)));

            DOM.batFill.style.width = batLevel + '%';
            DOM.batText.innerHTML = `Μπαταρία Δασκάλων: ${batLevel}% ${isHoliday ? '<span class="charging-icon">⚡</span>' : ''}`;
            
      
            DOM.batFill.classList.remove(
                'battery-charging-fx', 'battery-low-alert', 
                'physics-home', 'physics-morning', 'physics-midday', 'physics-6th-hour'
            );
            DOM.batFill.style.background = '';
            DOM.batFill.style.boxShadow = 'none';

            if (isHoliday) {
                // Εάν το σχολείο είναι κλειστό -> Εφέ Φόρτισης (Ραβδώσεις)
                DOM.batFill.classList.add('battery-charging-fx');
            } else if (batLevel <= 20) {
                // Εάν η μπαταρία καταρρέει -> Συναγερμός / Glitch
                DOM.batFill.classList.add('battery-low-alert');
            } else {
                // Κανονική λειτουργία (Χρώματα βάσει %)
                if (batLevel <= 50) {
                    DOM.batFill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)'; 
                    DOM.batFill.style.boxShadow = '0 0 10px rgba(246, 211, 101, 0.5)';
                } else {
                    DOM.batFill.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'; 
                    DOM.batFill.style.boxShadow = '0 0 10px rgba(67, 233, 123, 0.5)';
                }

                // --- ΝΕΟ 3: INTRA-DAY PHYSICS (Το Σύνδρομο της 6ης Ώρας) ---
                const hour = now.getHours();
                const minutes = now.getMinutes();
                const timeInHours = hour + (minutes / 60); // π.χ. το 13:30 γίνεται 13.5
                const isWeekend = now.getDay() === 0 || now.getDay() === 6;

                if (isWeekend) {
                    DOM.batFill.classList.add('physics-home');      // Σαββατοκύριακο: Πάντα χαλαρά
                } else if (timeInHours >= 8 && timeInHours < 10.5) {
                    DOM.batFill.classList.add('physics-morning');   // 08:00 - 10:30 (Πρωινή Ενέργεια)
                } else if (timeInHours >= 10.5 && timeInHours < 12.5) {
                    DOM.batFill.classList.add('physics-midday');    // 10:30 - 12:30 (Πτώση Ρυθμού / Εφημερία)
                } else if (timeInHours >= 12.5 && timeInHours < 14.5) {
                    DOM.batFill.classList.add('physics-6th-hour');  // 12:30 - 14:30 (Σύνδρομο 6ης Ώρας - Σέρνεται)
                } else {
                    DOM.batFill.classList.add('physics-home');      // 14:30+ (Σπίτι / Ανάπαυση)
                }
            }
        }
    };

    const MobileMessageManager = {
        isShowing: false,
        timeout: null,

        show: (e) => {
            e.stopPropagation();

            // ΑΣΦΑΛΕΙΑ: Αν πατήσουν ΠΑΝΩ στο ίδιο το κείμενο, ΜΗΝ το κλείσεις!
            if (e.target && e.target.closest && e.target.closest('#holiday-secret-message-mobile')) return;

            // 1. Ελέγχουμε αν είναι κινητό (συσκευή με αφή ή οθόνη μικρότερη από 768px)
            const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

            // 2. Εκτέλεση haptic δόνησης (50ms) ΜΟΝΟ αν είναι κινητό και υποστηρίζεται
            if (isMobile && navigator.vibrate) {
                navigator.vibrate(50);
            }
           // ΝΕΟ: Αν το μήνυμα είναι ανοιχτό, ΚΛΕΙΣΤΟ αμέσως! (Toggle)
            if (MobileMessageManager.isShowing) {
                MobileMessageManager.hide();
                return;
            }
            if (DataEngine.messagesArray.length === 0) return;
            
            MobileMessageManager.isShowing = true;
            DOM.mainContent.style.display = 'none';
            DOM.secretBox.style.display = 'block';
            
            let shown = Utils.safeStorageGet(CONFIG.storageKey);
            if (shown.length >= DataEngine.messagesArray.length) shown = []; 
            
            const available = DataEngine.messagesArray.map((_, i) => i).filter(i => !shown.includes(i));
            const randomIdx = available[Math.floor(Math.random() * available.length)];
            
            shown.push(randomIdx);
            Utils.safeStorageSet(CONFIG.storageKey, shown);
            
            DOM.secretBox.innerHTML = DataEngine.messagesArray[randomIdx];

            clearTimeout(MobileMessageManager.timeout);
            MobileMessageManager.timeout = setTimeout(MobileMessageManager.hide, CONFIG.messageDelay);
        },
        hide: (e) => {
            if (e && e.target && e.target.closest && e.target.closest('#holiday-secret-message-mobile')) return;
            if (!MobileMessageManager.isShowing) return;
            clearTimeout(MobileMessageManager.timeout);
            DOM.secretBox.style.display = 'none';
            DOM.mainContent.style.display = 'block';
            MobileMessageManager.isShowing = false;
        }
    };

    const MobileApp = {
init: () => {
            DOM.widgetBox = document.getElementById('holiday-widget-box-mobile');
            if (!DOM.widgetBox) return;

            DOM.mainContent = document.getElementById('holiday-main-content-mobile');
            DOM.secretBox = document.getElementById('holiday-secret-message-mobile');
            DOM.display = document.getElementById('h-countdown-mobile');
            DOM.icon = document.getElementById('h-icon-mobile');
            DOM.batFill = document.getElementById('bat-fill-mobile');
            DOM.batText = document.getElementById('bat-text-mobile');

           MobileCoreEngine.update();
            DataEngine.fetchMessages();

            DOM.widgetBox.addEventListener('click', MobileMessageManager.show);
            // ΝΕΟ: Εμποδίζουμε το touchstart να διαρρεύσει στο document ώστε το κλείσιμο του μηνύματος 
            // (toggle) να λειτουργεί άψογα στις οθόνες αφής.
            DOM.widgetBox.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
            document.addEventListener('click', MobileMessageManager.hide, { passive: true });
            document.addEventListener('touchstart', MobileMessageManager.hide, { passive: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }
})();
