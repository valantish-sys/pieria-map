(() => {
    "use strict";

    const CONFIG = Object.freeze({
        weather: {
            lat: 40.2711,
            lon: 22.5044,
            url: "https://api.open-meteo.com/v1/forecast?latitude=40.2711&longitude=22.5044&hourly=temperature_2m,apparent_temperature,weather_code&timezone=auto&forecast_days=3"
        },
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/eortvasi2.json' 
    });
  const DataEngineAPI = {
        dictionaries: { fixedNames: {}, fixedHolidays: {}, worldDays: {} },
        fetchData: async () => {
            try {
                // Προσθέτουμε time param για να μη διαβάζει παλιά cache
                const response = await fetch(CONFIG.jsonUrl + "?v=" + new Date().getTime());
                if (!response.ok) throw new Error("Σφάλμα HTTP");
                const data = await response.json();
                
                DataEngineAPI.dictionaries = {
                    fixedNames: data.fixedNames || {},
                    fixedHolidays: data.fixedHolidays || {},
                    worldDays: data.worldDays || {}
                };
            } catch (e) {
                console.warn("Το JSON με το Εορτολόγιο (Desktop) δεν φόρτωσε σωστά:", e);
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

    const DateEngine = {
        today: new Date(),
        viewDate: new Date(), // ΝΕΟ: Η ημερομηνία που ελέγχει ο χρήστης
        
        init: function() {
            // Υπολογισμοί με βάση το viewDate αντί για το today
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
        
        // Συνάρτηση για αλλαγή ημέρας από τα βελάκια
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
                isLighthouseDay: (this.m === 8 && (this.d === Utils.getNthDayOfMonth(y, 8, 6, 3) || this.d === Utils.getNthDayOfMonth(y, 8, 0, 3))),
                isHospiceDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 6, 2)),
                isNoiseDay: (this.m === 4 && this.d === Utils.getLastDayOfMonth(y, 4, 3))
            };
        }
    };

    const HolidayEngine = {
        getWorldDays: () => {
            let days = [];
            if (DataEngineAPI.dictionaries.worldDays[DateEngine.dateKey]) days.push(DataEngineAPI.dictionaries.worldDays[DateEngine.dateKey]);
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

            if (DataEngineAPI.dictionaries.fixedHolidays[DateEngine.dateKey]) {
                holidays.push(DataEngineAPI.dictionaries.fixedHolidays[DateEngine.dateKey]);
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
            
            return DataEngineAPI.dictionaries.fixedNames[DateEngine.dateKey] || "";
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

    const WeatherEngine = {
        fetchWithRetry: async (retries = 3) => {
            try {
                const response = await fetch(CONFIG.weather.url);
                if (!response.ok) throw new Error("HTTP error");
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

    const UIEngine = {
        renderHeader: () => {
            const hIcon = document.getElementById('dynamic-day-icon');
            const hDate = document.getElementById('eort-date');
            const mIcon = document.getElementById('main-icon');
            
            if(hIcon) hIcon.innerText = DateEngine.d;
            if(hDate) {
                const diffDays = Utils.getDaysDiff(DateEngine.viewDate, DateEngine.today);
                let prefix = "";
                if (diffDays === 0) prefix = "Σήμερα, ";
                else if (diffDays === 1) prefix = "Αύριο, ";
                else if (diffDays === -1) prefix = "Χθες, ";
                else if (diffDays > 1) prefix = `Σε ${diffDays} μέρες, `;
                else if (diffDays < -1) prefix = `Πριν ${Math.abs(diffDays)} μέρες, `;
                
                hDate.innerText = prefix + DateEngine.viewDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });
            }
            if(mIcon && DateEngine.diffFromEaster === -48) mIcon.innerText = "🪁";
        },
        renderHolidays: () => {
            const worldDays = HolidayEngine.getWorldDays();
            const wdDiv = document.getElementById('eort-world-day');
            if(wdDiv) { wdDiv.innerHTML = worldDays.join(" / "); wdDiv.style.display = worldDays.length ? "block" : "none"; }

            const holidays = HolidayEngine.getHolidays();
            const hDiv = document.getElementById('eort-holiday');
            if(hDiv) { hDiv.innerHTML = holidays.join("<br>"); hDiv.style.display = holidays.length ? "block" : "none"; }

            const names = HolidayEngine.getNames();
            const nDiv = document.getElementById('eort-names');
            if(nDiv) {
                if (names) { nDiv.innerHTML = "<b>Γιορτάζουν:</b><br>" + names; nDiv.style.display = "block"; } 
                else { nDiv.style.display = "none"; }
            }

            const schoolStr = HolidayEngine.getSchoolHolidays();
            const sDiv = document.getElementById('eort-school');
            if(sDiv) { sDiv.innerText = schoolStr; sDiv.style.display = schoolStr ? "block" : "none"; }
        },
        renderWeather: async () => {
            const container = document.getElementById('hub-weather-container');
            if(!container) return;
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
                    
                    // ΝΕΟ: Αισθητή θερμοκρασία στις 08:00 το πρωί
                    // Δυναμική Αίσθηση: Τρέχουσα ώρα για 'Σήμερα', 08:00 για τις επόμενες μέρες
let feelsLikeHour = 8;
let feelsLikeText = "Αίσθηση 8πμ";

if (i === 0) {
    feelsLikeHour = new Date().getHours(); // Παίρνει την τρέχουσα ώρα του υπολογιστή/κινητού
    feelsLikeText = "Τωρινή αίσθηση";
}
const currentFeelsLike = Math.round(data.hourly.apparent_temperature[baseIndex + feelsLikeHour]);
                    
                    const mainCodeRaw = data.hourly.weather_code[baseIndex + 12];
                    const mainCode = codes[mainCodeRaw] || "🌤️";
                    const hoverContent = WeatherEngine.getDayTypeContent(data, i);

                    // Δυναμικό Φόντο ανάλογα τον σημερινό καιρό (και ώρα)
                    if (i === 0) {
                        const widgetBox = document.getElementById('eortologio-widget-box');
                        if (widgetBox) {
                            // Προσθέσαμε και το bg-weather-night στην αφαίρεση
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
                container.innerHTML = wHtml;
            } catch (error) {
                container.innerHTML = "<div style='font-size:10px;color:#888;width:100%;text-align:center;'>Η υπηρεσία καιρού είναι προσωρινά μη διαθέσιμη.</div>";
            }
        }
    };

    const AppController = {
        init: async () => { // <--- Έγινε async
            const eortBox = document.getElementById("eortologio-widget-box");
            if (!eortBox) return;

            // --- ΚΑΤΕΒΑΖΕΙ ΤΑ ΔΕΔΟΜΕΝΑ (Γιορτές/Ονόματα) ΑΠΟ ΤΟ JSON ---
            await DataEngineAPI.fetchData();

            DateEngine.init();
            UIEngine.renderHeader();
            UIEngine.renderHolidays();
            UIEngine.renderWeather();
          const prevBtn = document.getElementById('eort-prev-day');
            const nextBtn = document.getElementById('eort-next-day');
            
            if (prevBtn) prevBtn.addEventListener('click', () => {
                DateEngine.changeDay(-1);
                UIEngine.renderHeader();
                UIEngine.renderHolidays();
            });
            
            if (nextBtn) nextBtn.addEventListener('click', () => {
                DateEngine.changeDay(1);
                UIEngine.renderHeader();
                UIEngine.renderHolidays();
            });
          // --- ΠΡΟΣΘΗΚΗ ΛΕΙΤΟΥΡΓΙΑΣ SWIPE ΓΙΑ ΤΟ ΕΟΡΤΟΛΟΓΙΟ ---
            let touchstartX = 0;
            let touchendX = 0;

            const handleSwipe = () => {
                const swipeThreshold = 50; // Ελάχιστη απόσταση σε pixels
                if (touchendX < touchstartX - swipeThreshold) {
                    // Swipe αριστερά -> Επόμενη μέρα
                    DateEngine.changeDay(1);
                    UIEngine.renderHeader();
                    UIEngine.renderHolidays();
                }
                if (touchendX > touchstartX + swipeThreshold) {
                    // Swipe δεξιά -> Προηγούμενη μέρα
                    DateEngine.changeDay(-1);
                    UIEngine.renderHeader();
                    UIEngine.renderHolidays();
                }
            };

            if (eortBox) {
                eortBox.addEventListener('touchstart', (e) => {
                    touchstartX = e.changedTouches[0].screenX;
                }, { passive: true });

                eortBox.addEventListener('touchend', (e) => {
                    touchendX = e.changedTouches[0].screenX;
                    handleSwipe();
                }, { passive: true });
            }
            // --- ΤΕΛΟΣ ΠΡΟΣΘΗΚΗΣ SWIPE ---
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
      // Κουμπιά Επόμενη / Προηγούμενη Μέρα    
    }
})();
