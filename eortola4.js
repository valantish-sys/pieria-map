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
                if (!response.ok) throw new Error("Σφάλμα HTTP");
                const data = await response.json();
                DataEngine.dictionaries = {
                    fixedNames: data.fixedNames || {},
                    fixedHolidays: data.fixedHolidays || {},
                    worldDays: data.worldDays || {}
                };
            } catch (e) {
                console.warn("Το JSON με το Εορτολόγιο δεν φόρτωσε σωστά:", e);
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
               // ΠΡΟΣΘΗΚΗ: Το σωστό εύρος είναι από την 13η έως και τη 19η
                isMacedonianStruggle: (this.m === 10 && this.d >= 13 && this.d <= 19 && new Date(y, 9, this.d).getDay() === 0),
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
          if (mov.isBuyNothingDay) days.push("🛍️ Παγκόσμια Ημέρα Αγοραστικής Αποχής"); // Διαχωρισμός
            if (mov.isMaritimeDay) days.push("⚓ Παγκόσμια Ναυτική Ημέρα");
            if (mov.isLighthouseDay) days.push("🗼 Παγκόσμια Ημέρα Φάρων");
            if (mov.isHospiceDay) days.push("🏥 Παγκόσμια Ημέρα Ξενώνων και Παρηγορητικής Φροντίδας");
            if (mov.isNoiseDay) days.push("🤫 Διεθνής Ημέρα κατά του Θορύβου");
            if (mov.isMarriageDay) days.push("💍 Παγκόσμια Ημέρα του Γάμου");
            if (mov.isMigratoryBirdDay) days.push("🦅 Παγκόσμια Ημέρα Αποδημητικών Πτηνών");
            if (mov.isSummerTime) days.push("⏰ Έναρξη Θερινής Ώρας (+1 ώρα)");
            if (mov.isWinterTime) days.push("⏰ Έναρξη Χειμερινής Ώρας (-1 ώρα)");
    if (mov.isBuyNothingDay) days.push("🛒 Black Friday"); 
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
            let namesArr = []; 

            const diff = MobileDateEngine.diffFromEaster;
            const isGeorgeMoved = MobileDateEngine.isGeorgeMoved; 
            const isMarkMoved = (MobileDateEngine.easter >= new Date(MobileDateEngine.y, 3, 24)); 

            if (diff === -43) namesArr.push("Θεόδωρος, Θεοδώρα (Αγ. Θεοδώρων)");
            if (diff === -8) namesArr.push("Λάζαρος, Λάζος (Του Λαζάρου)");
            if (diff === -7) namesArr.push("Βάιος, Βαΐα, Δάφνη (Των Βαΐων)");
            if (diff === 0) namesArr.push("Αναστάσιος, Αναστασία, Λάμπρος, Πασχάλης");
            
            if (diff === 1 && isGeorgeMoved) namesArr.push("Γιώργος, Γεωργία, Ελισάβετ");
            if (diff === 2) {
                let tuesdayNames = "Ραφαήλ, Νικόλαος, Ειρήνη (Λέσβου)";
                if (isMarkMoved) tuesdayNames += ", Μάρκος"; 
                namesArr.push(tuesdayNames);
            }
            if (diff === 5) namesArr.push("Ζωή, Πηγή, Ζωοδόχος (Ζωοδόχου Πηγής)");
            if (diff === 7) namesArr.push("Θωμάς (Του Θωμά)");
            if (diff === 50) namesArr.push("Τριάδα, Τριαντάφυλλος, Τριανταφυλλιά");
            if (diff === 56) namesArr.push("Πανταζής, Πάντος (Αγίων Πάντων)");

            if (MobileDateEngine.dateKey === "4-23" && !isGeorgeMoved) namesArr.push("Γιώργος, Γεωργία");
            if (MobileDateEngine.dateKey === "4-24" && !isGeorgeMoved) namesArr.push("Ελισάβετ");
            if (MobileDateEngine.dateKey === "4-25") namesArr.push(isMarkMoved ? "Νίκη" : "Μάρκος, Νίκη"); 

            const fixedNames = DataEngine.dictionaries.fixedNames[MobileDateEngine.dateKey];
            if (fixedNames) namesArr.push(fixedNames);

            return namesArr.filter(Boolean).join(", ");
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
        cachedData: null,
        fetchWithRetry: async (retries = 3) => {
            if (MobileWeatherEngine.cachedData) return MobileWeatherEngine.cachedData;
            try {
                const response = await fetch(CONFIG.weather.url);
                if (!response.ok) throw new Error("HTTP error");
                MobileWeatherEngine.cachedData = await response.json();
                return MobileWeatherEngine.cachedData;
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return MobileWeatherEngine.fetchWithRetry(retries - 1);
                }
                throw error;
            }
        },
      getDayTypeContent: (data, dayOffset) => {
            const dDate = new Date(MobileDateEngine.today);
            dDate.setDate(dDate.getDate() + dayOffset);
            // ΔΙΑΓΡΑΦΗΚΕ Η ΔΕΥΤΕΡΗ (ΛΑΘΟΣ) ΚΛΗΣΗ setDate
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
                56:"🌧️", 57:"🌧️", 61:"🌧️", 63:"🌧️", 65:"🌧️", 66:"🌧️", 67:"🌧️", 71:"❄️",
                73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️", 81:"🌧️", 82:"🌧️", 85:"❄️", 86:"❄️",
                95:"⛈️", 96:"⛈️", 99:"⛈️"
            };
            const baseIndex = dayOffset * 24;
            const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
            const snowCodes = [71, 73, 75, 77, 85, 86];
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
        renderHeader: (suffix) => {
            const hIcon = document.getElementById(`dynamic-day-icon${suffix}`);
            const hDate = document.getElementById(`eort-date${suffix}`);

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
                
                if (Math.abs(diffDays) >= 5) {
                    hDate.innerHTML = `${prefix}${baseDateStr} <span class="return-to-today-badge">(↺)</span>`;
                    hDate.classList.add('is-returnable');
                    hDate.title = "Επιστροφή στο Σήμερα";
                } else {
                    hDate.innerHTML = prefix + baseDateStr; 
                    hDate.classList.remove('is-returnable');
                    hDate.title = "";
                }
            }
        },
        renderHolidays: (suffix) => {
            const worldDays = MobileHolidayEngine.getWorldDays();
            const wdDiv = document.getElementById(`eort-world-day${suffix}`);
            if(wdDiv) { wdDiv.innerHTML = worldDays.join(" / "); wdDiv.style.display = worldDays.length ? "block" : "none"; }

            const holidays = MobileHolidayEngine.getHolidays();
            const hDiv = document.getElementById(`eort-holiday${suffix}`);
            if(hDiv) { hDiv.innerHTML = holidays.join("<br>"); hDiv.style.display = holidays.length ? "block" : "none"; }

            const names = MobileHolidayEngine.getNames();
            const nDiv = document.getElementById(`eort-names${suffix}`);
            if(nDiv) {
                if (names) { nDiv.innerHTML = "<b>Γιορτάζουν:</b><br>" + names; nDiv.style.display = "block"; } 
                else { nDiv.style.display = "none"; }
            }

            const schoolStr = MobileHolidayEngine.getSchoolHolidays();
            const sDiv = document.getElementById(`eort-school${suffix}`);
            if(sDiv) { sDiv.innerText = schoolStr; sDiv.style.display = schoolStr ? "block" : "none"; }
        },
        renderWeather: async () => {
            try {
                const data = await MobileWeatherEngine.fetchWithRetry();
                const codes = {
                    0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
                    56:"🌧️", 57:"🌧️", 61:"🌧️", 63:"🌧️", 65:"🌧️", 66:"🌧️", 67:"🌧️", 71:"❄️",
                    73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️", 81:"🌧️", 82:"🌧️", 85:"❄️", 86:"❄️",
                    95:"⛈️", 96:"⛈️", 99:"⛈️"
                };
                const daysArr = ['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ'];
                let wHtml = '';
                
                let bgClass = '', advisorHtml = '', advBorder = '', advBg = '', advDisplay = 'none';

                for(let i=0; i<3; i++) {
                    const dDate = new Date(MobileDateEngine.today);
                    dDate.setDate(dDate.getDate() + i);
                    const dName = (i===0) ? "Σήμερα" : (i===1 ? "Αύριο" : daysArr[dDate.getDay()]);
                    const baseIndex = i * 24;
                    const dayTemps = data.hourly.temperature_2m.slice(baseIndex, baseIndex + 24);
                    const maxTemp = Math.round(Math.max(...dayTemps));
                    const minTemp = Math.round(Math.min(...dayTemps));
                    
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

                    if (i === 0) {
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMonth = now.getMonth();
                        
                        let sunsetHour = 20; 
                        if ([10, 11, 0, 1].includes(currentMonth)) sunsetHour = 18; 
                        else if ([2, 9].includes(currentMonth)) sunsetHour = 19; 
                        else if ([3, 8].includes(currentMonth)) sunsetHour = 20; 
                        else if ([4, 5, 6, 7].includes(currentMonth)) sunsetHour = 21; 
                        
                        const isNight = (currentHour >= sunsetHour || currentHour < 6);
                        const currentCode = data.hourly.weather_code[currentHour];

                        if ([71,73,75,77,85,86].includes(currentCode)) bgClass = 'bg-weather-snow';
                        else if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(currentCode)) bgClass = 'bg-weather-rain';
                        else if (isNight) bgClass = 'bg-weather-night';
                        else bgClass = 'bg-weather-sun';

                        if (currentHour >= 2 && currentHour < 6) {
                            advDisplay = 'none';
                        } else {
                            let hasRain = false, hasSnow = false, checkTemp = 0;
                            let msg = "", icon = "";
                            
                            if (currentHour >= 6 && currentHour < 16) {
                                for (let h = 6; h <= 14; h++) {
                                    const code = data.hourly.weather_code[baseIndex + h];
                                    if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) hasRain = true;
                                    if ([71,73,75,77,85,86].includes(code)) hasSnow = true;
                                }
                                checkTemp = data.hourly.apparent_temperature[baseIndex + currentHour];

                                if (hasSnow) { icon = "⛄"; msg = "Προσοχή για χιόνι! Ντύσου σαν κρεμμύδι 🧅!"; advBorder = "#1e6cff"; advBg = "rgba(30, 108, 255, 0.1)"; } 
                                else if (hasRain) { icon = "☔"; msg = "Προσοχή για βροχή! Μην ξεχάσεις την ομπρέλα σου!"; advBorder = "#3b82f6"; advBg = "rgba(59, 130, 246, 0.1)"; } 
                                else if (checkTemp < 7) { icon = "🧣"; msg = "Έχει παγωνιά έξω! Σκούφος και γάντια απαραίτητα!"; advBorder = "#0ea5e9"; advBg = "rgba(14, 165, 233, 0.1)"; } 
                                else if (checkTemp > 21) { icon = "☀️"; msg = "Ζεστούλα έξω! Μην ξεχάσεις το παγούρι με το νερό σου!"; advBorder = "#f59e0b"; advBg = "rgba(245, 158, 11, 0.1)"; } 
                                else { icon = "🌤️"; msg = "Ιδανικός καιρός αυτή τη στιγμή για παιχνίδι!"; advBorder = "#10b981"; advBg = "rgba(16, 185, 129, 0.1)"; }
                            } else {
                                const tomorrowIndex = (currentHour >= 16) ? baseIndex + 24 : baseIndex;
                                const textDay = (currentHour < 6) ? "Το πρωί" : "Αύριο";

                                for (let h = 6; h <= 14; h++) {
                                    const code = data.hourly.weather_code[tomorrowIndex + h];
                                    if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) hasRain = true;
                                    if ([71,73,75,77,85,86].includes(code)) hasSnow = true;
                                }
                                checkTemp = data.hourly.apparent_temperature[tomorrowIndex + 8];

                                if (hasSnow) { icon = "⛄"; msg = `${textDay} περιμένουμε χιόνι! Ετοίμασε ζεστά ρούχα 🧅!`; advBorder = "#1e6cff"; advBg = "rgba(30, 108, 255, 0.1)"; } 
                                else if (hasRain) { icon = "☔"; msg = `${textDay} δίνει βροχή! Μην ξεχάσεις την ομπρέλα σου!`; advBorder = "#3b82f6"; advBg = "rgba(59, 130, 246, 0.1)"; } 
                                else if (checkTemp < 7) { icon = "🧣"; msg = `${textDay === "Το πρωί" ? "Σήμερα" : "Αύριο"} το πρωί θα έχει παγωνιά! Ετοίμασε σκούφο/γάντια!`; advBorder = "#0ea5e9"; advBg = "rgba(14, 165, 233, 0.1)"; } 
                                else if (checkTemp > 21) { icon = "☀️"; msg = `${textDay} θα κάνει ζέστη! Μην ξεχάσεις το παγούρι σου!`; advBorder = "#f59e0b"; advBg = "rgba(245, 158, 11, 0.1)"; } 
                                else { icon = "🌤️"; msg = `${textDay} φαίνεται ιδανικός καιρός για παιχνίδι!`; advBorder = "#10b981"; advBg = "rgba(16, 185, 129, 0.1)"; }
                            }
                            
                            advisorHtml = `<span class="smart-advisor-icon">${icon}</span> <div class="smart-advisor-text">${msg}</div>`;
                            advDisplay = 'flex';
                        }
                    }

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

                ['', '-mobile'].forEach(suffix => {
                    const container = document.getElementById(`hub-weather-container${suffix}`);
                    if(container) container.innerHTML = wHtml;

                    const widgetBox = document.getElementById(`eortologio-widget-box${suffix}`);
                    if (widgetBox && bgClass) {
                        widgetBox.classList.remove('bg-weather-sun', 'bg-weather-rain', 'bg-weather-snow', 'bg-weather-night');
                        widgetBox.classList.add(bgClass);
                    }

                    const advisorBox = document.getElementById(suffix === '-mobile' ? 'smart-weather-advisor-mobile' : 'smart-weather-advisor');
                    if (advisorBox) {
                        advisorBox.innerHTML = advisorHtml;
                        advisorBox.style.borderLeftColor = advBorder;
                        advisorBox.style.background = advBg;
                        advisorBox.style.display = advDisplay;
                    }
                });

            } catch (error) {
                ['', '-mobile'].forEach(suffix => {
                    const container = document.getElementById(`hub-weather-container${suffix}`);
                    if (container) container.innerHTML = "<div style='font-size:10px;color:#888;width:100%;text-align:center;'>Η υπηρεσία καιρού είναι προσωρινά μη διαθέσιμη.</div>";
                });
            }
        },
        renderAll: () => {
            ['', '-mobile'].forEach(suffix => {
                if (document.getElementById(`eortologio-widget-box${suffix}`)) {
                    MobileUIEngine.renderHeader(suffix);
                    MobileUIEngine.renderHolidays(suffix);
                }
            });
          
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
            
            // Σπάμε το query του χρήστη σε ανεξάρτητες λέξεις
            const words = q.split(/\s+/).filter(word => word.length > 0);
            
            // Επιστρέφουμε αποτελέσματα ΜΟΝΟ αν ΟΛΕΣ οι λέξεις (.every) υπάρχουν στο index του κινητού
            return MobileSearchEngine.index.filter(item => 
                words.every(w => item.searchKey.includes(w))
            ).slice(0, 8);
        }
    };
    const MobileAppController = {
        init: async () => {
            const hasMobile = document.getElementById("eortologio-widget-box-mobile");
            const hasPC = document.getElementById("eortologio-widget-box");
            if (!hasMobile && !hasPC) return;

           // Fetch data ONCE for both widgets
            await DataEngine.fetchData();
            // ΑΦΑΙΡΕΘΗΚΕ ΤΟ ΠΡΩΤΟ ΠΕΡΙΤΤΟ FETCH (Το renderWeather κάνει ήδη ασφαλή κλήση)

            MobileDateEngine.init();
            MobileUIEngine.renderAll();
            MobileUIEngine.renderWeather();
            let isAnimating = false;
            const animateToDate = (targetDate) => {
                if (isAnimating) return;
                const diff = Utils.getDaysDiff(targetDate, MobileDateEngine.viewDate);
                if (diff === 0) return;
                isAnimating = true;

                const outClass = diff > 0 ? 'anim-slide-out-left' : 'anim-slide-out-right';
                const inClass = diff > 0 ? 'anim-slide-in-right' : 'anim-slide-in-left';

                ['', '-mobile'].forEach(suffix => {
                    const eortBox = document.getElementById(`eortologio-widget-box${suffix}`);
                    if (!eortBox) return;
                    const elements = eortBox.querySelectorAll(`#eort-date${suffix}, .info-box`);
                    elements.forEach(el => {
                        el.classList.remove('anim-slide-in-right', 'anim-slide-in-left', 'anim-slide-out-left', 'anim-slide-out-right');
                        if (el.style.display !== 'none' || el.id === `eort-date${suffix}`) el.classList.add(outClass);
                    });
                });

                setTimeout(() => {
                    MobileDateEngine.viewDate = new Date(targetDate);
                    MobileDateEngine.init();
                    MobileSearchEngine.buildIndex(); 
                    MobileUIEngine.renderAll();

                    ['', '-mobile'].forEach(suffix => {
                        const eortBox = document.getElementById(`eortologio-widget-box${suffix}`);
                        if (!eortBox) return;
                        const elements = eortBox.querySelectorAll(`#eort-date${suffix}, .info-box`);
                        elements.forEach(el => {
                            el.classList.remove(outClass);
                            if (el.style.display !== 'none' || el.id === `eort-date${suffix}`) el.classList.add(inClass);
                        });
                    });
                    isAnimating = false;
                }, 250); 
            };

            const animateAndChangeDay = (offset) => {
                const target = new Date(MobileDateEngine.viewDate);
                target.setDate(target.getDate() + offset);
                animateToDate(target);
            };

            ['', '-mobile'].forEach(suffix => {
                const eortBox = document.getElementById(`eortologio-widget-box${suffix}`);
                if (!eortBox) return;
                
                const searchPrefix = suffix === '-mobile' ? 'mob' : 'pc';
                const searchBox = document.getElementById(`${searchPrefix}-eort-search-box`);
                const searchIcon = document.getElementById(`${searchPrefix}-eort-search-icon`);
                const searchInput = document.getElementById(`${searchPrefix}-eort-search-input`);
                const searchResults = document.getElementById(`${searchPrefix}-eort-search-results`);
                const groupWrap = eortBox.querySelector('.eort-date-search-group');

                const revealSearch = () => {
                    if (searchBox && searchBox.style.display !== 'flex') {
                        searchBox.style.display = 'flex';
                        setTimeout(() => MobileSearchEngine.buildIndex(), 100);
                    }
                };

                const prevBtn = document.getElementById(`eort-prev-day${suffix}`);
                const nextBtn = document.getElementById(`eort-next-day${suffix}`);
                if (prevBtn) prevBtn.addEventListener('click', () => { revealSearch(); animateAndChangeDay(-1); });
                if (nextBtn) nextBtn.addEventListener('click', () => { revealSearch(); animateAndChangeDay(1); });

                const dateEl = document.getElementById(`eort-date${suffix}`);
                if (dateEl) {
                    dateEl.addEventListener('click', () => {
                        if (dateEl.classList.contains('is-returnable')) animateToDate(MobileDateEngine.today);
                    });
                }

                // Swipes
                let touchStartX = 0, touchStartY = 0;
                eortBox.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                    touchStartY = e.changedTouches[0].screenY;
                }, { passive: true });
                
               eortBox.addEventListener('touchend', (e) => {
                    const diffX = touchStartX - e.changedTouches[0].screenX;
                    const diffY = touchStartY - e.changedTouches[0].screenY;
                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        revealSearch();
                        if (diffX > 0) animateAndChangeDay(1); else animateAndChangeDay(-1); 
                    }
                }, { passive: true });

                // Search
                if (searchIcon && searchInput && searchResults) {
                    searchIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        searchBox.classList.toggle('active');
                        if (searchBox.classList.contains('active')) {
                            searchInput.focus();
                            if (groupWrap) groupWrap.classList.add('searching');
                        } else {
                            searchInput.value = ''; searchInput.blur();
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
                            searchInput.value = ''; searchInput.blur();
                            searchResults.classList.remove('show');
                            if (groupWrap) groupWrap.classList.remove('searching');
                            animateToDate(targetDate); 
                        }
                    });

                   } // Κλείσιμο if (searchIcon && searchInput && searchResults)
            }); // <-- Εδώ κλείνει οριστικά η λούπα forEach!

            // --- ΚΑΘΟΛΙΚΟ ΚΛΕΙΣΙΜΟ ΑΝΑΖΗΤΗΣΗΣ (Τρέχει μόνο 1 Φορά για όλα) ---
            const closeAllSearches = () => {
                ['mob', 'pc'].forEach(pref => {
                    const sBox = document.getElementById(`${pref}-eort-search-box`);
                    const sInput = document.getElementById(`${pref}-eort-search-input`);
                    const sResults = document.getElementById(`${pref}-eort-search-results`);
                    if (sBox && sBox.classList.contains('active')) {
                        sBox.classList.remove('active');
                        if (sInput) { sInput.value = ''; sInput.blur(); }
                        if (sResults) sResults.classList.remove('show');
                    }
                });
                document.querySelectorAll('.eort-date-search-group').forEach(g => g.classList.remove('searching'));
            };

            // Κλείνει την αναζήτηση αν κάνεις κλικ οπουδήποτε αλλού (1 καθολικό event)
            document.addEventListener('click', (e) => {
                const isInside = e.target.closest('#mob-eort-search-box') || e.target.closest('#pc-eort-search-box');
                const isIcon = e.target.closest('#mob-eort-search-icon') || e.target.closest('#pc-eort-search-icon');
                if (!isInside && !isIcon) closeAllSearches();
            });

            // Κλείνει την αναζήτηση αν πατήσεις ESC (Προσθήκη για το PC)
            document.addEventListener('keydown', (e) => {
                if (e.key === "Escape") closeAllSearches();
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileAppController.init);
    } else {
        MobileAppController.init();
    }
})();
