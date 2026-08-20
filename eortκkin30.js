(() => {
    "use strict";

    const CONFIG = Object.freeze({
        weather: {
            lat: 40.2711,
            lon: 22.5044,
            url: "https://api.open-meteo.com/v1/forecast?latitude=40.2711&longitude=22.5044&hourly=temperature_2m,apparent_temperature,weather_code&timezone=auto&forecast_days=3"
        },
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/eortvasi3.json'
    });
  const DataEngine = {
        dictionaries: { fixedNames: {}, fixedHolidays: {}, worldDays: {} },
       fetchData: async () => {
            try {
                const cacheBuster = Math.floor(Date.now() / 3600000);
                const response = await fetch(CONFIG.jsonUrl + "?v=" + cacheBuster);
                const data = await response.json();
                DataEngine.dictionaries = data;
            } catch (e) {
                console.warn("Το JSON με το Εορτολόγιο δεν φόρτωσε.");
            }
        }
    };

    const Utils = {
        getNthDayOfMonth: (year, month, dayOfWeek, n) => {
            const firstDay = new Date(year, month - 1, 1).getDay();
            const offset = (dayOfWeek - firstDay + 7) % 7;
            return 1 + offset + (n - 1) * 7;
        },
        getLastDayOfMonth: (year, month, dayOfWeek) => {
            const d = new Date(year, month, 0); 
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
        getDaysDiff: (date1, date2) => {
            const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
            const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
            return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
        }
    };

    const MobileDateEngine = {
        today: new Date(),
        viewDate: new Date(), // ΝΕΟ: Ημερομηνία που βλέπει ο χρήστης
        
        init: function() {
            this.y = this.viewDate.getFullYear();
            this.m = this.viewDate.getMonth() + 1;
            this.d = this.viewDate.getDate();
            this.dateKey = `${this.m}-${this.d}`;
            
            this.easter = Utils.getOrthodoxEaster(this.y);
            this.diffFromEaster = Utils.getDaysDiff(this.viewDate, this.easter);
            this.isLeapYear = (this.y % 4 === 0 && this.y % 100 !== 0) || (this.y % 400 === 0);
            this.isGeorgeMoved = (this.easter >= new Date(this.y, 3, 23));

            this.calculateMovableWorldDays();
        },
        
        changeDay: function(offset) {
            this.viewDate.setDate(this.viewDate.getDate() + offset);
            this.init(); 
        },
        calculateMovableWorldDays: function() {
            const y = this.y;
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
                isLighthouseDay: (this.m === 8 && this.d === Utils.getNthDayOfMonth(y, 8, 0, 3)),
                isHospiceDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 6, 2)),
                isNoiseDay: (this.m === 4 && this.d === Utils.getLastDayOfMonth(y, 4, 3)),
                
                // ΝΕΕΣ ΠΡΟΣΘΗΚΕΣ ΚΙΝΗΤΩΝ ΗΜΕΡΩΝ (MOBILE)
                isMarriageDay: (this.m === 2 && this.d === Utils.getNthDayOfMonth(y, 2, 0, 2)),
                isMigratoryBirdDay: ((this.m === 5 || this.m === 10) && this.d === Utils.getNthDayOfMonth(y, this.m, 6, 2)),
               // ΠΡΟΣΘΗΚΗ: Πρέπει να είναι μετά τη 13η (14 έως 20)
                isMacedonianStruggle: (this.m === 10 && this.d >= 14 && this.d <= 20 && new Date(y, 9, this.d).getDay() === 0),
                isSummerTime: (this.m === 3 && this.d === Utils.getLastDayOfMonth(y, 3, 0)),
                isWinterTime: (this.m === 10 && this.d === Utils.getLastDayOfMonth(y, 10, 0))
            };
        }
    };

    const MobileHolidayEngine = {
        getWorldDays: () => {
            let days = [];
            if (DataEngine.dictionaries.worldDays[MobileDateEngine.dateKey]) {
                days.push(DataEngine.dictionaries.worldDays[MobileDateEngine.dateKey]);
            }
            const mov = MobileDateEngine.movableDays;
            
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
            if (mov.isBuyNothingDay) days.push("🛍️ Παγκόσμια Ημέρα Αγοραστικής Αποχής / 🛒 Black Friday");
            if (mov.isMaritimeDay) days.push("⚓ Παγκόσμια Ναυτική Ημέρα");
            if (mov.isLighthouseDay) days.push("🗼 Παγκόσμια Ημέρα Φάρων");
            if (mov.isHospiceDay) days.push("🏥 Παγκόσμια Ημέρα Ξενώνων και Παρηγορητικής Φροντίδας");
            if (mov.isNoiseDay) days.push("🤫 Διεθνής Ημέρα κατά του Θορύβου");
            if (mov.isMarriageDay) days.push("💍 Παγκόσμια Ημέρα του Γάμου");
            if (mov.isMigratoryBirdDay) days.push("🦅 Παγκόσμια Ημέρα Αποδημητικών Πτηνών");
            if (mov.isSummerTime) days.push("⏰ Έναρξη Θερινής Ώρας (+1 ώρα)");
            if (mov.isWinterTime) days.push("⏰ Έναρξη Χειμερινής Ώρας (-1 ώρα)");

            return days;
        },

        getHolidays: () => {
            let holidays = [];
            const diff = MobileDateEngine.diffFromEaster;
            
            if (diff === -70) holidays.push("📖 Κυριακή Τελώνου και Φαρισαίου (Αρχή Τριωδίου)");
            else if (diff === -59) holidays.push("🍖 Τσικνοπέμπτη!");
            else if (diff === -57) holidays.push("🕯️ Α' Ψυχοσάββατο");
            else if (diff === -49) holidays.push("🎭 Κυριακή της Αποκριάς (Τυρινής)");
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
            else if (diff === 48) holidays.push("🕯️ Β' Ψυχοσάββατο (προ Πεντηκοστής)");
            else if (diff === 49) holidays.push("🔥 Πεντηκοστή");
            else if (diff === 50) holidays.push("🕊️ Αγίου Πνεύματος (Αργία)");
            else if (diff === 56) holidays.push("⛪ Κυριακή των Αγίων Πάντων");

            if (MobileDateEngine.movableDays.isMacedonianStruggle) {
                holidays.push("🇬🇷 Ημέρα Μακεδονικού Αγώνα");
            }

            if (DataEngine.dictionaries.fixedHolidays[MobileDateEngine.dateKey]) {
                holidays.push(DataEngine.dictionaries.fixedHolidays[MobileDateEngine.dateKey]);
            }
            return holidays;
        },

        getNames: () => {
            const diff = MobileDateEngine.diffFromEaster;
            const isMoved = MobileDateEngine.isGeorgeMoved; // Πάσχα >= 23 Απριλίου
            const isMarkMoved = MobileDateEngine.easter >= new Date(MobileDateEngine.y, 3, 24); // Πάσχα >= 24 Απριλίου

            let names = [];

            // 1. Κινητές (Με βάση το Πάσχα)
            if (diff === -43) names.push("Θεόδωρος, Θεοδώρα (Αγ. Θεοδώρων)");
            else if (diff === -8) names.push("Λάζαρος, Λάζος (Του Λαζάρου)");
            else if (diff === -7) names.push("Βάιος, Βαΐα, Δάφνη (Των Βαΐων)");
            else if (diff === 0) names.push("Αναστάσιος, Αναστασία, Λάμπρος, Πασχάλης");
            else if (diff === 1 && isMoved) names.push("Γιώργος, Γεωργία, Ελισάβετ");
            else if (diff === 2) names.push("Ραφαήλ, Νικόλαος, Ειρήνη (Λέσβου)" + (isMarkMoved ? ", Μάρκος" : ""));
            else if (diff === 5) names.push("Ζωή, Πηγή, Ζωοδόχος (Ζωοδόχου Πηγής)");
            else if (diff === 7) names.push("Θωμάς (Του Θωμά)");
            else if (diff === 50) names.push("Τριάδα, Τριαντάφυλλος, Τριανταφυλλιά");
            else if (diff === 56) names.push("Πανταζής, Πάντος (Αγίων Πάντων)");

          
           // 2. Σταθερές που μετακινούνται
            if (MobileDateEngine.dateKey === "4-23") {
                if (!isMoved) names.push("Γιώργος, Γεωργία");
            }
            if (MobileDateEngine.dateKey === "4-24") {
                if (!isMoved) names.push("Ελισάβετ");
            }
            if (MobileDateEngine.dateKey === "4-25") {
                names.push(isMarkMoved ? "Νίκη" : "Μάρκος, Νίκη");
            }

            // 3. Υπόλοιπες Σταθερές (JSON) - Πλέον εκτελείται πάντα!
            const fixed = DataEngine.dictionaries.fixedNames[MobileDateEngine.dateKey];
            if (fixed) names.push(fixed);
            // Επιστρέφει ενωμένες τυχόν ταυτόχρονες γιορτές (π.χ. Πάσχα ΚΑΙ Ειρήνης)
            return names.join(" / ");
        },
      
        getSchoolHolidays: () => {
            const m = MobileDateEngine.m;
            const d = MobileDateEngine.d;
            const diff = MobileDateEngine.diffFromEaster;
            if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return " \u26C4\uFE0F Σχολικές Διακοπές Χριστουγέννων";
            if (diff >= -8 && diff <= 7) return " \uD83D\uDC30\uFE0F Σχολικές Διακοπές Πάσχα";
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) return " \u2600\uFE0F Θερινές Σχολικές Διακοπές";
        },
};
    const MobileWeatherEngine = {
        fetchWithRetry: async (retries = 3) => {
            try {
                const response = await fetch(CONFIG.weather.url);
                if (!response.ok) throw new Error("HTTP error");
                return await response.json();
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return MobileWeatherEngine.fetchWithRetry(retries - 1);
                }
                throw error;
            }
        },
        getDayTypeContent: (data, dayOffset) => {
            const dDate = new Date();
            dDate.setDate(MobileDateEngine.today.getDate() + dayOffset);
            const m = dDate.getMonth() + 1;
            const d = dDate.getDate();
            const dayOfWeek = dDate.getDay();
            const realEaster = Utils.getOrthodoxEaster(dDate.getFullYear()); // Βρίσκει το πραγματικό Πάσχα του Καιρού
const diffFromEaster = Utils.getDaysDiff(dDate, realEaster);
            const schoolHolidays = ["10-28", "11-17", "11-25", "1-30", "3-25", "5-1"];
            const isHoliday = schoolHolidays.includes(`${m}-${d}`) || diffFromEaster === -48 || diffFromEaster === 50;

            if (isHoliday) return '<span class="sch-msg">🇬🇷 Χρόνια</span><span class="sch-msg">Πολλά!</span>';
            if (diffFromEaster >= -8 && diffFromEaster <= 7) return '<span class="sch-msg">🐰 Καλό</span><span class="sch-msg">Πάσχα!</span>';
            if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return '<span class="sch-msg">🎄 Καλές</span><span class="sch-msg">Γιορτές!</span>';
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) return '<span class="sch-msg">🏖️ Καλό</span><span class="sch-msg">Καλο-<br>καίρι!</span>';
            if (dayOfWeek === 0 || dayOfWeek === 6) return '<span class="sch-msg">🎈 Καλό</span><span class="sch-msg">Σ/Κ!</span>';

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

          let alertHtml = "";
            if (snowWarnings.length > 0) {
                const badges = snowWarnings.map(t => `<span class="snow-badge">Διάλειμμα ${t}</span>`).join('');
                alertHtml = `<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:6px;"><span class="sch-msg" style="font-size:22px; margin-bottom:2px; animation: bounce 2s infinite; color:#1e6cff;">❄️</span><span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px; color:#1e6cff;">ΧΙΟΝΟΠΤΩΣΗ ΣΤΑ ΔΙΑΛΕΙΜΜΑΤΑ:</span><div class="snow-list">${badges}</div></div>`;
            } else if (rainWarnings.length > 0) {
                const badges = rainWarnings.map(t => `<span class="rain-badge">Διάλειμμα ${t}</span>`).join('');
                alertHtml = `<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:6px;"><span class="sch-msg" style="font-size:20px; margin-bottom:2px; animation: bounce 2s infinite;">☔</span><span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px;">ΒΡΟΧΗ ΣΤΑ ΔΙΑΛΕΙΜΜΑΤΑ:</span><div class="rain-list">${badges}</div></div>`;
            }

            const getHourData = (h) => {
                const temp = Math.round(data.hourly.temperature_2m[baseIndex + h]);
                const icon = codes[data.hourly.weather_code[baseIndex + h]] || "🌤️";
                return `${icon} ${temp}°`;
            };

            // ΠΡΟΣΘΗΚΗ: Το alertHtml μπαίνει στην αρχή, ώστε να εμφανίζονται και οι θερμοκρασίες
            return `${alertHtml}
                    <span class="sch-time">🔔 09:40 ${getHourData(10)}</span>
                    <span class="sch-time">🔔 11:30 ${getHourData(11)}</span>
                    <span class="sch-time">🔔 12:25 ${getHourData(12)}</span>
                    <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🎒 13:15 ${getHourData(13)}</span>`;
            
        }
    };

    const MobileUIEngine = {
        renderHeader: () => {
            const hIcon = document.getElementById('dynamic-day-icon-mobile');
            const hDate = document.getElementById('eort-date-mobile');

            if(hIcon) hIcon.innerText = MobileDateEngine.d;
           if(hDate) {
                const diffDays = Utils.getDaysDiff(MobileDateEngine.viewDate, MobileDateEngine.today);
                let prefix = "";
                
                if (diffDays === 0) prefix = "Σήμερα, ";
                else if (diffDays === 1) prefix = "Αύριο, ";
                else if (diffDays === -1) prefix = "Χθες, ";
                else if (diffDays > 1) prefix = `Σε ${diffDays} μέρες, `;
                else if (diffDays < -1) prefix = `Πριν ${Math.abs(diffDays)} μέρες, `;
                
                const baseDateStr = MobileDateEngine.viewDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });
                
                // Ο ΚΑΝΟΝΑΣ ΤΩΝ 5 ΗΜΕΡΩΝ ΓΙΑ ΤΟ ΚΙΝΗΤΟ
                if (Math.abs(diffDays) >= 5) {
                    hDate.innerHTML = `${prefix}${baseDateStr} <span class="return-to-today-badge">(↺)</span>`;
                    hDate.classList.add('is-returnable');
                    hDate.title = "Επιστροφή στο Σήμερα";
                } else {
                    hDate.innerHTML = prefix + baseDateStr; // SOS: Εδώ πλέον είναι innerHTML, όχι innerText
                    hDate.classList.remove('is-returnable');
                    hDate.title = "";
                }
            }
        },
        renderHolidays: () => {
            const worldDays = MobileHolidayEngine.getWorldDays();
            const wdDiv = document.getElementById('eort-world-day-mobile');
            if(wdDiv) { wdDiv.innerHTML = worldDays.join(" / "); wdDiv.style.display = worldDays.length ? "block" : "none"; }

            const holidays = MobileHolidayEngine.getHolidays();
            const hDiv = document.getElementById('eort-holiday-mobile');
            if(hDiv) { hDiv.innerHTML = holidays.join("<br>"); hDiv.style.display = holidays.length ? "block" : "none"; }

            const names = MobileHolidayEngine.getNames();
            const nDiv = document.getElementById('eort-names-mobile');
            if(nDiv) {
                if (names) { nDiv.innerHTML = "<b>Γιορτάζουν:</b><br>" + names; nDiv.style.display = "block"; } 
                else { nDiv.style.display = "none"; }
            }

            const schoolStr = MobileHolidayEngine.getSchoolHolidays();
            const sDiv = document.getElementById('eort-school-mobile');
            if(sDiv) { sDiv.innerText = schoolStr; sDiv.style.display = schoolStr ? "block" : "none"; }
        },
        renderWeather: async () => {
            const container = document.getElementById('hub-weather-container-mobile');
            if(!container) return;
            try {
                const data = await MobileWeatherEngine.fetchWithRetry();
                const codes = {
                    0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
                    61:"🌧️", 63:"🌧️", 65:"🌧️", 71:"❄️", 73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️",
                    81:"🌧️", 82:"🌧️", 95:"⛈️", 96:"⛈️", 99:"⛈️"
                };
                const daysArr = ['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ'];
                let wHtml = '';

                for(let i=0; i<3; i++) {
                    const dDate = new Date();
                    dDate.setDate(MobileDateEngine.today.getDate() + i);
                    const dName = (i===0) ? "Σήμερα" : (i===1 ? "Αύριο" : daysArr[dDate.getDay()]);
                    const baseIndex = i * 24;
                    const dayTemps = data.hourly.temperature_2m.slice(baseIndex, baseIndex + 24);
                    const maxTemp = Math.round(Math.max(...dayTemps));
                    const minTemp = Math.round(Math.min(...dayTemps));
                    
                    // ΝΕΟ: Αισθητή θερμοκρασία 8πμ
                    // Δυναμική Αίσθηση (Κινητό): Τρέχουσα ώρα για 'Σήμερα', 08:00 για τις επόμενες μέρες
let feelsLikeHour = 8;
let feelsLikeText = "Αίσθηση 8πμ";

if (i === 0) {
    feelsLikeHour = new Date().getHours();
    feelsLikeText = "Αίσθηση";
}
const currentFeelsLike = Math.round(data.hourly.apparent_temperature[baseIndex + feelsLikeHour]); 
                    
                    const mainCodeRaw = data.hourly.weather_code[baseIndex + 12];
                    const mainCode = codes[mainCodeRaw] || "🌤️";
                    const hoverContent = MobileWeatherEngine.getDayTypeContent(data, i);

                   // Δυναμικό Φόντο
                    if (i === 0) {
                        const widgetBox = document.getElementById('eortologio-widget-box-mobile');
                        if (widgetBox) {
                            widgetBox.classList.remove('bg-weather-sun', 'bg-weather-rain', 'bg-weather-snow', 'bg-weather-night');
                            
                            const currentHour = new Date().getHours();
                            const isNight = (currentHour >= 20 || currentHour < 6);
                            
                            // Παίρνουμε τον καιρό της ΤΡΕΧΟΥΣΑΣ ώρας για το φόντο!
                            const currentCode = data.hourly.weather_code[currentHour];

                            if ([71,73,75,77].includes(currentCode)) {
                                widgetBox.classList.add('bg-weather-snow');
                            } else if ([51,53,55,61,63,65,80,81,82,95,96,99].includes(currentCode)) {
                                widgetBox.classList.add('bg-weather-rain');
                            } else if (isNight) {
                                widgetBox.classList.add('bg-weather-night');
                            } else {
                                widgetBox.classList.add('bg-weather-sun');
                            }
                        }
                    // --- ΝΕΟ: ΕΞΥΠΝΟΣ ΣΥΜΒΟΥΛΟΣ (Μπήκε ΜΕΣΑ στο if (i === 0) !) ---
                        const advisorBox = document.getElementById('smart-weather-advisor-mobile');
                        if (advisorBox) {
                            const hourNow = new Date().getHours();
                            
                            // 1. ΠΕΡΙΟΔΟΣ "ΣΙΓΗΣ" (02:00 έως 05:59 τα ξημερώματα)
                            if (hourNow >= 2 && hourNow < 6) {
                                advisorBox.style.display = 'none';
                            } else {
                                let hasRain = false, hasSnow = false;
                                let checkTemp = 0;
                                let msg = "", icon = "", borderColor = "", bgColor = "";
                                
                                // 2. ΛΕΙΤΟΥΡΓΙΑ "ΣΗΜΕΡΑ" (06:00 το πρωί έως 15:59 το απόγευμα)
                                if (hourNow >= 6 && hourNow < 16) {
                                    // Έλεγχος για βροχή/χιόνι ΜΟΝΙΜΑ από τις 06:00 έως τις 14:00 (2 το μεσημέρι)
                                    for (let h = 6; h <= 14; h++) {
                                        const code = data.hourly.weather_code[baseIndex + h];
                                        if ([51,53,55,61,63,65,80,81,82,95,96,99].includes(code)) hasRain = true;
                                        if ([71,73,75,77].includes(code)) hasSnow = true;
                                    }

                                    // Παίρνουμε την αισθητή θερμοκρασία ΑΚΡΙΒΩΣ για την τρέχουσα ώρα
                                    checkTemp = data.hourly.apparent_temperature[baseIndex + hourNow];

                                    if (hasSnow) {
                                        icon = "⛄"; msg = "Προσοχή για χιόνι! Ντύσου σαν κρεμμύδι 🧅!"; 
                                        borderColor = "#1e6cff"; bgColor = "rgba(30, 108, 255, 0.1)";
                                    } else if (hasRain) {
                                        icon = "☔"; msg = "Προσοχή για βροχή! Μην ξεχάσεις την ομπρέλα σου!"; 
                                        borderColor = "#3b82f6"; bgColor = "rgba(59, 130, 246, 0.1)";
                                    } else if (checkTemp < 7) {
                                        icon = "🧣"; msg = "Έχει παγωνιά έξω! Σκούφος και γάντια απαραίτητα!"; 
                                        borderColor = "#0ea5e9"; bgColor = "rgba(14, 165, 233, 0.1)";
                                    } else if (checkTemp > 21) {
                                        icon = "☀️"; msg = "Ζεστούλα έξω! Μην ξεχάσεις το παγούρι με το νερό σου!"; 
                                        borderColor = "#f59e0b"; bgColor = "rgba(245, 158, 11, 0.1)";
                                    } else {
                                        icon = "🌤️"; msg = "Ιδανικός καιρός αυτή τη στιγμή για παιχνίδι!"; 
                                        borderColor = "#10b981"; bgColor = "rgba(16, 185, 129, 0.1)";
                                    }
                                } 
                                // 3. ΛΕΙΤΟΥΡΓΙΑ "ΑΥΡΙΟ" (16:00 το απόγευμα έως 01:59 το βράδυ)
                                else {
                                    // Έξυπνος κανόνας: Από 00:00 έως 01:59 έχει ήδη αλλάξει η μέρα ημερολογιακά.
                                    // Άρα το "Αύριο" για το παιδί, είναι το "Σήμερα" για τον υπολογιστή (baseIndex).
                                    // Ενώ από 16:00 έως 23:59 το "Αύριο" είναι ρεαλιστικά στην επόμενη μέρα (+24 ώρες).
                                    const tomorrowIndex = (hourNow >= 16) ? baseIndex + 24 : baseIndex;

                                    // Έλεγχος για βροχή/χιόνι για ΑΥΡΙΟ σταθερά από τις 06:00 έως τις 14:00 (Μόνιμη προειδοποίηση)
                                    for (let h = 6; h <= 14; h++) {
                                        const code = data.hourly.weather_code[tomorrowIndex + h];
                                        if ([51,53,55,61,63,65,80,81,82,95,96,99].includes(code)) hasRain = true;
                                        if ([71,73,75,77].includes(code)) hasSnow = true;
                                    }
                                    
                                    // Παίρνουμε την αισθητή θερμοκρασία για ΑΥΡΙΟ ακριβώς στις 08:00 το πρωί
                                    checkTemp = data.hourly.apparent_temperature[tomorrowIndex + 8];

                                    if (hasSnow) {
                                        icon = "⛄"; msg = "Αύριο περιμένουμε χιόνι! Ετοίμασε ζεστά ρούχα 🧅!"; 
                                        borderColor = "#1e6cff"; bgColor = "rgba(30, 108, 255, 0.1)";
                                    } else if (hasRain) {
                                        icon = "☔"; msg = "Αύριο δίνει βροχή! Μην ξεχάσεις την ομπρέλα σου!"; 
                                        borderColor = "#3b82f6"; bgColor = "rgba(59, 130, 246, 0.1)";
                                    } else if (checkTemp < 7) {
                                        icon = "🧣"; msg = "Αύριο το πρωί θα έχει παγωνιά! Ετοίμασε σκούφο και γάντια!"; 
                                        borderColor = "#0ea5e9"; bgColor = "rgba(14, 165, 233, 0.1)";
                                    } else if (checkTemp > 21) {
                                        icon = "☀️"; msg = "Αύριο θα κάνει ζέστη! Μην ξεχάσεις το παγούρι σου!"; 
                                        borderColor = "#f59e0b"; bgColor = "rgba(245, 158, 11, 0.1)";
                                    } else {
                                        icon = "🌤️"; msg = "Αύριο φαίνεται ιδανικός καιρός για παιχνίδι!"; 
                                        borderColor = "#10b981"; bgColor = "rgba(16, 185, 129, 0.1)";
                                    }
                                }
                                
                                // Εμφάνιση του κουτιού με τα δεδομένα
                                advisorBox.innerHTML = `<span class="smart-advisor-icon">${icon}</span> <div class="smart-advisor-text">${msg}</div>`;
                                advisorBox.style.borderLeftColor = borderColor;
                                advisorBox.style.background = bgColor;
                                advisorBox.style.display = 'flex';
                            }
                        }
                    } // <-- ΤΕΛΟΣ του if (i === 0)

                    wHtml += `
                        <div class="c-day-card ${i===0 ? 'today' : ''}">
                            <div class="c-day-inner">
                                <div class="c-day-front">
                                    <span class="c-day-name">${dName}</span>
                                    <span class="c-day-icon">${mainCode}</span>
                                    <div class="c-day-temps"><span class="c-max">${maxTemp}°</span> <span>${minTemp}°</span></div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-weight: 700;">${feelsLikeText}: <span style="color:#a90e0e;">${currentFeelsLike}°</span></div>
                                </div>
                                <div class="c-day-back">${hoverContent}</div>
                            </div>
                        </div>`;
                }
                container.innerHTML = wHtml;
            } catch (error) {
                container.innerHTML = "<div style='font-size:10px;color:#888;width:100%;text-align:center;'>Η υπηρεσία καιρού είναι προσωρινά μη διαθέσιμη.</div>";
            }
        }
    };
// --- ΝΕΟ: ΜΗΧΑΝΗ ΑΝΑΖΗΤΗΣΗΣ (MOBILE) ---
    const MobileSearchEngine = {
       index: [],
        isBuiltForYear: null,
        // ΠΡΟΣΘΗΚΗ: Μετατροπή και του ς σε σ για να "πιάνει" τις βιαστικές πληκτρολογήσεις
        normalize: (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ς/g, "σ") : "",
        buildIndex: () => {
           const y = MobileDateEngine.viewDate.getFullYear();
            if (MobileSearchEngine.isBuiltForYear === y) return; 
            
            MobileSearchEngine.index = [];
            const originalDate = new Date(MobileDateEngine.viewDate); 
            
            const daysInYear = MobileDateEngine.isLeapYear ? 366 : 365;
            for (let i = 0; i < daysInYear; i++) {
                const testDate = new Date(y, 0, i + 1);
                MobileDateEngine.viewDate = testDate;
                MobileDateEngine.init();
                
                let terms = [];
                const names = MobileHolidayEngine.getNames(); if (names) terms.push(names);
                const hols = MobileHolidayEngine.getHolidays(); if (hols.length) terms.push(...hols);
                const wds = MobileHolidayEngine.getWorldDays(); if (wds.length) terms.push(...wds);
                
                const rawText = terms.join(" | ").replace(/<\/?[^>]+(>|$)/g, ""); 
                if (rawText.trim()) {
                    MobileSearchEngine.index.push({
                        targetDate: new Date(testDate),
                        displayDate: testDate.toLocaleDateString('el-GR', { day: 'numeric', month: 'long' }),
                        rawText: rawText,
                        searchKey: MobileSearchEngine.normalize(rawText)
                    });
                }
            }
            MobileDateEngine.viewDate = originalDate;
            MobileDateEngine.init();
            MobileSearchEngine.isBuiltForYear = y;
        },
        search: (query) => {
            const q = MobileSearchEngine.normalize(query);
            if (!q || q.length < 2) return [];
            return MobileSearchEngine.index.filter(item => item.searchKey.includes(q)).slice(0, 8);
        }
    };
    const MobileAppController = {
        init: async () => {
            const eortBox = document.getElementById("eortologio-widget-box-mobile");
            if (!eortBox) return;

            await DataEngine.fetchData();

            MobileDateEngine.init();
            MobileUIEngine.renderHeader();
            MobileUIEngine.renderHolidays();
           MobileUIEngine.renderWeather();
           let isAnimating = false;
           // --- ΝΕΟ: ΕΞΥΠΝΗ ΤΗΛΕΜΕΤΑΦΟΡΑ (Time Travel) ---
            const animateToDate = (targetDate) => {
              if (isAnimating) return;
                const diff = Utils.getDaysDiff(targetDate, MobileDateEngine.viewDate);
                if (diff === 0) return;
                isAnimating = true;
                const outClass = diff > 0 ? 'anim-slide-out-left' : 'anim-slide-out-right';
                const inClass = diff > 0 ? 'anim-slide-in-right' : 'anim-slide-in-left';
                // Στοχεύουμε ΜΟΝΟ τα στοιχεία του Mobile Widget για αποφυγή conflict με το PC
                const elements = eortBox.querySelectorAll('#eort-date-mobile, .info-box');

                elements.forEach(el => {
                    el.classList.remove('anim-slide-in-right', 'anim-slide-in-left', 'anim-slide-out-left', 'anim-slide-out-right');
                    if (el.style.display !== 'none' || el.id === 'eort-date-mobile') {
                        el.classList.add(outClass);
                    }
                });

                setTimeout(() => {
                    MobileDateEngine.viewDate = new Date(targetDate);
                    MobileDateEngine.init();
                    
                    // NΕΟ: Ενημερώνει σιωπηλά το ευρετήριο αν άλλαξε το έτος!
                    MobileSearchEngine.buildIndex(); 
                    
                    MobileUIEngine.renderHeader();
                    MobileUIEngine.renderHolidays();
                 

                    elements.forEach(el => {
                        el.classList.remove(outClass);
                        if (el.style.display !== 'none' || el.id === 'eort-date-mobile') {
                            el.classList.add(inClass);
                        }
                    });
                  isAnimating = false;
                }, 250); 
            };

            const animateAndChangeDay = (offset) => {
                const target = new Date(MobileDateEngine.viewDate);
                target.setDate(target.getDate() + offset);
                animateToDate(target);
            };

            // --- PROGRESSIVE DISCLOSURE ΑΝΑΖΗΤΗΣΗΣ ---
            const searchBox = document.getElementById('mob-eort-search-box');
            
            const revealSearch = () => {
                if (searchBox && searchBox.style.display !== 'flex') {
                    searchBox.style.display = 'flex';
                    // Χτίζουμε τη μηχανή στο background χωρίς να κολλήσει το UI
                    setTimeout(() => MobileSearchEngine.buildIndex(), 100);
                }
            };

            // Events Πλοήγησης (Εμφανίζουν και την αναζήτηση)
            const prevBtn = document.getElementById('eort-prev-day-mobile');
            const nextBtn = document.getElementById('eort-next-day-mobile');
            if (prevBtn) prevBtn.addEventListener('click', () => { revealSearch(); animateAndChangeDay(-1); });
            if (nextBtn) nextBtn.addEventListener('click', () => { revealSearch(); animateAndChangeDay(1); });

            // --- ΚΛΙΚ ΣΤΗΝ ΗΜΕΡΟΜΗΝΙΑ ΓΙΑ ΕΠΙΣΤΡΟΦΗ ---
            const dateEl = document.getElementById('eort-date-mobile');
            if (dateEl) {
                dateEl.addEventListener('click', () => {
                    if (dateEl.classList.contains('is-returnable')) animateToDate(MobileDateEngine.today);
                });
            }

          // --- SWIPE ΓΙΑ ΚΙΝΗΤΟ (Με Εμφάνιση Αναζήτησης) ---
            let touchStartX = 0;
            let touchStartY = 0;
            if (eortBox) {
                eortBox.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                    touchStartY = e.changedTouches[0].screenY;
                }, { passive: true });
                
                eortBox.addEventListener('touchend', (e) => {
                    const touchEndX = e.changedTouches[0].screenX;
                    const touchEndY = e.changedTouches[0].screenY;
                    const diffX = touchStartX - touchEndX;
                    const diffY = touchStartY - touchEndY;
                    
                    // Αλλάζει μέρα ΜΟΝΟ αν η κίνηση ήταν κυρίως οριζόντια (swipe) και όχι κάθετη (scroll)
                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        revealSearch(); // Εμφάνιση φακού στο πρώτο swipe
                        if (diffX > 0) animateAndChangeDay(1); 
                        else animateAndChangeDay(-1); 
                    }
                }, { passive: true });
            }

            // --- LOGIC ΑΝΑΖΗΤΗΣΗΣ (ΜΕ MOBILE IDs) ---
            const searchIcon = document.getElementById('mob-eort-search-icon');
            const searchInput = document.getElementById('mob-eort-search-input');
            const searchResults = document.getElementById('mob-eort-search-results');
            const groupWrap = eortBox.querySelector('.eort-date-search-group');

            if (searchIcon && searchInput && searchResults) {
                searchIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    searchBox.classList.toggle('active');
                    if (searchBox.classList.contains('active')) {
                        searchInput.focus();
                        if (groupWrap) groupWrap.classList.add('searching');
                    } else {
                        searchInput.value = '';
                        searchResults.classList.remove('show');
                        if (groupWrap) groupWrap.classList.remove('searching');
                    }
                });

                searchInput.addEventListener('input', (e) => {
                    const res = MobileSearchEngine.search(e.target.value);
                    if (e.target.value.length >= 2) {
                        if (res.length > 0) {
                            searchResults.innerHTML = res.map(r => 
                                `<div class="search-res-item" data-time="${r.targetDate.getTime()}">
                                    <span class="search-res-date">${r.displayDate}</span>
                                    ${r.rawText.substring(0, 48)}${r.rawText.length > 48 ? '...' : ''}
                                </div>`
                            ).join('');
                        } else {
                            searchResults.innerHTML = '<div class="search-res-item" style="color:#888; pointer-events:none;">Δεν βρέθηκε κάτι...</div>';
                        }
                        searchResults.classList.add('show');
                    } else {
                        searchResults.classList.remove('show');
                    }
                });

               searchResults.addEventListener('click', (e) => {
                    const item = e.target.closest('.search-res-item');
                    if (item && item.getAttribute('data-time')) {
                        const targetDate = new Date(parseInt(item.getAttribute('data-time')));
                        searchBox.classList.remove('active');
                        searchInput.value = '';
                        searchInput.blur(); // ΠΡΟΣΘΗΚΗ: Κλείνει το πληκτρολόγιο
                        searchResults.classList.remove('show');
                        if (groupWrap) groupWrap.classList.remove('searching');
                        
                        animateToDate(targetDate); 
                    }
                });

                document.addEventListener('click', (e) => {
                    if (searchBox && !searchBox.contains(e.target) && searchBox.classList.contains('active')) {
                        searchBox.classList.remove('active');
                        searchInput.value = '';
                        searchInput.blur(); // ΠΡΟΣΘΗΚΗ: Κλείνει το πληκτρολόγιο
                        searchResults.classList.remove('show');
                        if (groupWrap) groupWrap.classList.remove('searching');
                    }
                });
            }
          }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileAppController.init);
    } else {
        MobileAppController.init();
    }
})();
