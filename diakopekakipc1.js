(() => {
    "use strict";

    const CONFIG = Object.freeze({
        messageDelay: 7000,
        storageKey: "holidayShownMsgs",
      jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/diakopeka.json'
    });

  

    const DOM = {};
const DataEngine = {
        messagesArray: [],
        fetchMessages: async () => {
            try {
                const response = await fetch(CONFIG.jsonUrl);
                const data = await response.json();
                DataEngine.messagesArray = data.messages || [];
            } catch (e) {
                console.warn("Το JSON με τα μηνύματα (Desktop) δεν φόρτωσε.");
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
        }
    };

    const CoreEngine = {
        update: () => {
            if (!DOM.display || !DOM.icon) return;

            const now = new Date();
            const year = now.getFullYear();

            const easterDate = Utils.getOrthodoxEaster(year);
            const easterStart = new Date(easterDate.getTime());
            easterStart.setDate(easterStart.getDate() - 8);
            easterStart.setHours(0, 0, 0, 0);
            
            const easterEnd = new Date(easterStart.getTime());
            easterEnd.setDate(easterStart.getDate() + 16);
            easterEnd.setHours(23, 59, 59, 999);

            const summerStart = new Date(year, 5, 16, 0, 0, 0);
            const summerEnd = new Date(year, 8, 10, 23, 59, 59);

            let xmasStart = new Date(year, 11, 24, 0, 0, 0);
            const xmasEnd = new Date(year + (now.getMonth() === 0 ? 0 : 1), 0, 7, 23, 59, 59);
            if (now.getMonth() === 0 && now.getDate() <= 7) {
                xmasStart = new Date(year - 1, 11, 23, 0, 0, 0);
            }

            if ((now >= summerStart && now <= summerEnd) || 
                (now >= xmasStart && now <= xmasEnd) || 
                (now >= easterStart && now <= easterEnd)) {
                
                DOM.icon.innerHTML = "&#10024;"; 
                DOM.display.innerHTML = '<span class="holiday-days">Καλές διακοπές!</span>';
                CoreEngine.updateBattery(now, true, easterStart, easterEnd); 
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
                nextEaster.setDate(nextEaster.getDate() - 9);
                next = { name: "για το Πάσχα 🐣", date: nextEaster, icon: "🐣" };
            }

            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const targetDate = new Date(next.date.getFullYear(), next.date.getMonth(), next.date.getDate());
            const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

            DOM.icon.innerHTML = next.icon;
            DOM.display.innerHTML = `<span class="holiday-days">Μένουν ${diffDays} ημέρες</span> ${next.name}`;

            CoreEngine.updateBattery(now, false, easterStart, easterEnd);
        },

        updateBattery: (now, isHoliday, easterStart, easterEnd) => {
            if (!DOM.batFill || !DOM.batText) return;

            const dayOfYear = Utils.getDayOfYear(now);
            const easterStartDay = Utils.getDayOfYear(easterStart);
            let batLevel = 50;
            const m = now.getMonth() + 1, d = now.getDate();
            const isEaster = (now >= easterStart && now <= easterEnd);
            const isSummer = (m >= 6 && d >= 16) || (m >= 7 && m <= 8) || (m === 9 && d <= 10);
            const isXmas = (m === 12 && d >= 23) || (m === 1 && d <= 7);

            if (isSummer) {
                const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                batLevel = 5 + ((dayOfYear - summerStartDay) * 1.31); 
            } else if (isXmas) {
                const xmasDay = (dayOfYear >= 357) ? (dayOfYear - 356) : (dayOfYear + 9);
                batLevel = 50 + (xmasDay * 1.87); 
            } else if (isEaster) {
                batLevel = 40 + ((dayOfYear - easterStartDay + 1) * 1.87);
            } else {
                if (dayOfYear >= 244 && dayOfYear <= 356) batLevel = 100 - ((dayOfYear - 243) * 0.47);
                else if (dayOfYear >= 8 && dayOfYear < easterStartDay) batLevel = 80 - ((dayOfYear - 7) * 0.37);
                else batLevel = 70 - ((dayOfYear - (easterStartDay + 15)) * 1.85); 
            }

            batLevel = Math.max(5, Math.min(100, Math.round(batLevel)));

            DOM.batFill.style.width = batLevel + '%';
            DOM.batText.innerHTML = `Μπαταρία Δασκάλων: ${batLevel}% ${isHoliday ? '<span class="charging-icon">⚡</span>' : ''}`;
            
            if (batLevel <= 20) {
                DOM.batFill.style.background = ''; 
                DOM.batFill.style.boxShadow = 'none';
                DOM.batFill.classList.add('battery-low-alert');
            } else {
                DOM.batFill.classList.remove('battery-low-alert');
                if (batLevel <= 50) {
                    DOM.batFill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)'; 
                    DOM.batFill.style.boxShadow = '0 0 10px rgba(246, 211, 101, 0.5)';
                } else {
                    DOM.batFill.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'; 
                    DOM.batFill.style.boxShadow = '0 0 10px rgba(67, 233, 123, 0.5)';
                }
            }
        }
    };

    const MessageManager = {
        isShowing: false,
        timeout: null,

        show: (e) => {
            e.stopPropagation(); 
            if (MessageManager.isShowing || DataEngine.messagesArray.length === 0) return;
            
            MessageManager.isShowing = true;
            DOM.mainContent.style.display = 'none';
            DOM.secretBox.style.display = 'block';
            
            let shown = Utils.safeStorageGet(CONFIG.storageKey);
            if (shown.length >= DataEngine.messagesArray.length) shown = []; 
            
            const available = DataEngine.messagesArray.map((_, i) => i).filter(i => !shown.includes(i));
            const randomIdx = available[Math.floor(Math.random() * available.length)];
            
            shown.push(randomIdx);
            Utils.safeStorageSet(CONFIG.storageKey, shown);
            
            DOM.secretBox.innerHTML = DataEngine.messagesArray[randomIdx];

            clearTimeout(MessageManager.timeout);
            MessageManager.timeout = setTimeout(MessageManager.hide, CONFIG.messageDelay);
        },

        hide: (e) => {
            if (e && e.target && e.target.closest && e.target.closest('#holiday-secret-message')) return;
            if (!MessageManager.isShowing) return;
            clearTimeout(MessageManager.timeout);
            DOM.secretBox.style.display = 'none';
            DOM.mainContent.style.display = 'block';
            MessageManager.isShowing = false;
        }
    };

    const App = {
        init: async () => { // <--- Προστέθηκε το async
            DOM.widgetBox = document.getElementById('holiday-widget-box');
            if (!DOM.widgetBox) return;

            DOM.mainContent = document.getElementById('holiday-main-content');
            DOM.secretBox = document.getElementById('holiday-secret-message');
            DOM.display = document.getElementById('h-countdown');
            DOM.icon = document.getElementById('h-icon');
            DOM.batFill = document.getElementById('bat-fill');
            DOM.batText = document.getElementById('bat-text');

            // --- Κατεβάζει τα μηνύματα από το JSON ---
            await DataEngine.fetchMessages();

            CoreEngine.update();

            DOM.widgetBox.addEventListener('click', MessageManager.show);
            document.addEventListener('click', MessageManager.hide, { passive: true });
            document.addEventListener('touchstart', MessageManager.hide, { passive: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();
