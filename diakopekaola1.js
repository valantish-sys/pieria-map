(() => {
    "use strict";

   const CONFIG = Object.freeze({
        messageDelay: 7000,
        storageKey: "holidayShownMsgs", // Κοινό κλειδί αποθήκευσης και για τα 2!
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/diakopeka.json'
    });

    // Το DOM πλέον έχει δύο θήκες για να βρει και το κινητό και το PC
    const DOM = { mobile: null, pc: null };
const DataEngine = {
        // ΝΕΟ: Εφεδρικό μήνυμα εξαρχής, για να μην υπάρχει ποτέ "νεκρό κλικ" 
        // όσο περιμένουμε να κατέβει το JSON από τον server.
        messagesArray: ["Μείνε προσηλωμένος στον στόχο σου. Οι διακοπές είναι η ανταμοιβή σου! 🏖️"],
        fetchMessages: async () => {
          try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Bad response"); // Σπρώχνει τα 404/500 errors στο catch
                const data = await response.json();
                
                // Αποτροπή άδειου Array: Αντικαθιστά το εφεδρικό ΜΟΝΟ αν όντως υπάρχουν μηνύματα!
                if (data && data.messages && data.messages.length > 0) {
                    DataEngine.messagesArray = data.messages;
                }
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

    const CoreEngine = {
        update: () => {
            const now = new Date();
            const year = now.getFullYear();

            // Υπολογισμοί Ημερομηνιών (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
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

            const isHoliday = ((now >= summerStart && now <= summerEnd) || 
                               (now >= xmasStart && now <= xmasEnd) || 
                               (now >= easterStart && now <= easterEnd));

            let nextIcon = "&#10024;";
            let nextText = '<span class="holiday-days">Καλές διακοπές!</span>';

            if (!isHoliday) {
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

                nextIcon = next.icon;
                const daysText = diffDays === 1 ? "Μένει 1 ημέρα" : `Μένουν ${diffDays} ημέρες`;
                nextText = `<span class="holiday-days">${daysText}</span> ${next.name}`;
            }

            // Υπολογισμοί Μπαταρίας (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
            const dayOfYear = Utils.getDayOfYear(now);
            const easterStartDay = Utils.getDayOfYear(easterStart);
            let batLevel = 50;
            const m = now.getMonth() + 1, d = now.getDate();
            const isEaster = (now >= easterStart && now <= easterEnd);
            const isSummer = (m === 6 && d >= 16) || (m === 7) || (m === 8) || (m === 9 && d <= 10);
            const isXmas = (m === 12 && d >= 24) || (m === 1 && d <= 7);

            if (isSummer) {
                const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                batLevel = 5 + ((dayOfYear - summerStartDay) * 1.31); 
            } else if (isXmas) {
                const xmasStartCalc = new Date(now.getFullYear() - (m === 1 ? 1 : 0), 11, 22);
                const xmasDay = Math.floor((now - xmasStartCalc) / 86400000);
                batLevel = 50 + (xmasDay * 1.87); 
            } else if (isEaster) {
                batLevel = 40 + ((dayOfYear - easterStartDay + 1) * 1.87);
            } else {
                if (dayOfYear >= 244) {
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 244, 113, 100, 47); 
                } else if (dayOfYear >= 8 && dayOfYear < easterStartDay) {
                    const daysToEaster = easterStartDay - 8;
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 8, daysToEaster, 80, 40); 
                } else {
                    const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                    const daysToSummer = Math.max(1, summerStartDay - (easterStartDay + 15));
                    batLevel = Utils.getBurnoutCurve(dayOfYear, easterStartDay + 15, daysToSummer, 70, 5); 
                }
            }

            batLevel = Math.max(5, Math.min(100, Math.round(batLevel)));
            const batTextHTML = `Μπαταρία Δασκάλων: ${batLevel}% ${isHoliday ? '<span class="charging-icon">⚡</span>' : ''}`;

            const hour = now.getHours();
            const minutes = now.getMinutes();
            const timeInHours = hour + (minutes / 60); 
            const isWeekend = now.getDay() === 0 || now.getDay() === 6;

            let physicsClass = 'physics-home';
            if (isWeekend) {
                physicsClass = 'physics-home';
            } else if (timeInHours >= 8 && timeInHours < 10.5) {
                physicsClass = 'physics-morning';
            } else if (timeInHours >= 10.5 && timeInHours < 12.5) {
                physicsClass = 'physics-midday';
            } else if (timeInHours >= 12.5 && timeInHours < 14.5) {
                physicsClass = 'physics-6th-hour';
            } else {
                physicsClass = 'physics-home';
            }

            // Ενημέρωση όλων των ενεργών Widgets (PC & Κινητό ταυτόχρονα!)
            Object.values(DOM).forEach(widget => {
                if (!widget) return;
                
                widget.icon.innerHTML = nextIcon;
                widget.display.innerHTML = nextText;

                widget.batFill.style.width = batLevel + '%';
                widget.batText.innerHTML = batTextHTML;

                widget.batFill.classList.remove(
                    'battery-charging-fx', 'battery-low-alert', 
                    'physics-home', 'physics-morning', 'physics-midday', 'physics-6th-hour'
                );
                widget.batFill.style.background = '';
                widget.batFill.style.boxShadow = 'none';

                if (isHoliday) {
                    widget.batFill.classList.add('battery-charging-fx');
                } else if (batLevel <= 20) {
                    widget.batFill.classList.add('battery-low-alert');
                } else {
                    if (batLevel <= 50) {
                        widget.batFill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)'; 
                        widget.batFill.style.boxShadow = '0 0 10px rgba(246, 211, 101, 0.5)';
                    } else {
                        widget.batFill.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'; 
                        widget.batFill.style.boxShadow = '0 0 10px rgba(67, 233, 123, 0.5)';
                    }
                    widget.batFill.classList.add(physicsClass);
                }
            });
        }
    };

    const MessageManager = {
        isShowing: { mobile: false, pc: false },
        timeout: { mobile: null, pc: null },

        show: (e, platform) => {
            e.stopPropagation();

            const widget = DOM[platform];
            if (!widget) return;

            // ΑΣΦΑΛΕΙΑ: Αν πατήσουν ΠΑΝΩ στο ίδιο το κείμενο, ΜΗΝ το κλείσεις!
            if (e.target && e.target.closest && (e.target.closest('#holiday-secret-message-mobile') || e.target.closest('#holiday-secret-message'))) return;

            // 1. Ελέγχουμε αν είναι κινητό
            const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

            // 2. Εκτέλεση haptic δόνησης ΜΟΝΟ αν πατήθηκε το widget του κινητού
            if (isTouch && platform === 'mobile' && navigator.vibrate) {
                navigator.vibrate(50);
            }

            // ΝΕΟ: Αν το μήνυμα είναι ανοιχτό, ΚΛΕΙΣΤΟ αμέσως! (Toggle)
            if (MessageManager.isShowing[platform]) {
                MessageManager.hide(null, platform);
                return;
            }
            if (DataEngine.messagesArray.length === 0) return;
            
            MessageManager.isShowing[platform] = true;
            widget.mainContent.style.display = 'none';
            widget.secretBox.style.display = 'block';
            
            let shown = Utils.safeStorageGet(CONFIG.storageKey);
            if (shown.length >= DataEngine.messagesArray.length) shown = []; 
            
            const available = DataEngine.messagesArray.map((_, i) => i).filter(i => !shown.includes(i));
            const randomIdx = available[Math.floor(Math.random() * available.length)];
            
            shown.push(randomIdx);
            Utils.safeStorageSet(CONFIG.storageKey, shown);
            
            widget.secretBox.innerHTML = DataEngine.messagesArray[randomIdx];

            clearTimeout(MessageManager.timeout[platform]);
            MessageManager.timeout[platform] = setTimeout(() => MessageManager.hide(null, platform), CONFIG.messageDelay);
        },
        
        hide: (e, specificPlatform) => {
            if (e && e.target && e.target.closest && (e.target.closest('#holiday-secret-message-mobile') || e.target.closest('#holiday-secret-message'))) return;
            
            const platforms = specificPlatform ? [specificPlatform] : ['mobile', 'pc'];

            platforms.forEach(platform => {
                if (!MessageManager.isShowing[platform]) return;
                const widget = DOM[platform];
                if (widget) {
                    clearTimeout(MessageManager.timeout[platform]);
                    widget.secretBox.style.display = 'none';
                    widget.mainContent.style.display = 'block';
                    MessageManager.isShowing[platform] = false;
                }
            });
        }
    };

    const App = {
        init: () => {
            const setups = [
                { platform: 'mobile', suffix: '-mobile' },
                { platform: 'pc', suffix: '' }
            ];

            setups.forEach(({ platform, suffix }) => {
                const widgetBox = document.getElementById(`holiday-widget-box${suffix}`);
                if (widgetBox) {
                    DOM[platform] = {
                        widgetBox: widgetBox,
                        mainContent: document.getElementById(`holiday-main-content${suffix}`),
                        secretBox: document.getElementById(`holiday-secret-message${suffix}`),
                        display: document.getElementById(`h-countdown${suffix}`),
                        icon: document.getElementById(`h-icon${suffix}`),
                        batFill: document.getElementById(`bat-fill${suffix}`),
                        batText: document.getElementById(`bat-text${suffix}`)
                    };
                    
                    widgetBox.addEventListener('click', (e) => MessageManager.show(e, platform));
                    widgetBox.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
                }
            });

           if (!DOM.mobile && !DOM.pc) return; // Δεν βρέθηκε κανένα widget

            CoreEngine.update(); // Αρχικός υπολογισμός
            setInterval(CoreEngine.update, 60000); // ΖΩΝΤΑΝΗ ενημέρωση κάθε 1 λεπτό για αλλαγή ώρας/ημερών!
            DataEngine.fetchMessages();

           document.addEventListener('click', MessageManager.hide, { passive: true });
            // ΔΙΕΓΡΑΨΑ το touchstart event στο document. 
            // Αν το αφήσεις, η παραμικρή προσπάθεια για scroll της σελίδας από τον χρήστη θα κρύβει ακαριαία το widget.
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();
