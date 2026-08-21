(() => {
    "use strict";

   const CONFIG = Object.freeze({
       feedUrl: 'https://dimperist.blogspot.com/feeds/posts/summary?alt=json&max-results=500',
       quotesJsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/hmeroquotes1.json',
       tooltipDelay: 200 // Προστέθηκε από την έκδοση του PC!
    });

    // Το στατικό DOM καταργήθηκε εντελώς. Θα δημιουργείται δυναμικά!

    const Utils = {
      cleanTitle: (rawStr) => {
            if (!rawStr) return 'Χωρίς τίτλο';
            // FIX: Προστέθηκαν τα < και > (ως &lt; και &gt;) ώστε να μη σπάει το .innerHTML και εξαφανίζεται το κείμενο
            return rawStr.replace(/&laquo;|&#171;|\u00C2\u00AB|\u00A4\u00C3/g, '«').replace(/&raquo;|&#187;|\u00C2\u00BB|\u00A5\u00C3/g, '»').replace(/&ldquo;|&rdquo;|&#8220;|&#8221;|&quot;/g, '"').replace(/&lsquo;|&rsquo;|&#8216;|&#8217;|&#39;/g, "'").replace(/&#183;|&middot;/g, '·').replace(/&ndash;|&#8211;/g, '-').replace(/&mdash;|&#8212;/g, '—').replace(/&amp;/g, '&').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&nbsp;/g, ' ').trim();
        },
        getQuote: () => {
            // 1. Προστασία: Αν δεν έχει φορτώσει το ίντερνετ ή το JSON
            if (!DataEngine.quotesArray || DataEngine.quotesArray.length === 0) {
                return "Μια υπέροχη μέρα σε περιμένει!"; // Το default μήνυμα
            }

            // 2. Η κανονική λογική, πλέον τραβάει από το DataEngine.quotesArray
          let used = [];
           try { used = JSON.parse(localStorage.getItem('usedQuotes')) || []; } catch(e) {}
            
            // FIX: Προστασία από κατεστραμμένα δεδομένα ή null. Αν δεν είναι Λίστα, τη μηδενίζουμε με το ζόρι για να μη σκάσει η JS.
            if (!Array.isArray(used)) used = [];
            
            if (used.length >= DataEngine.quotesArray.length) used = [];
            
            const usedSet = new Set(used);
            const available = [];
            
            for (let i = 0; i < DataEngine.quotesArray.length; i++) {
                if (!usedSet.has(i)) available.push(i);
            }
            
            if (available.length === 0) {
                used = [];
                for (let i = 0; i < DataEngine.quotesArray.length; i++) available.push(i);
            }
            
            const randomIndex = available[Math.floor(Math.random() * available.length)];
            used.push(randomIndex);
            
           try { localStorage.setItem('usedQuotes', JSON.stringify(used)); } catch(e) {}
            
            return DataEngine.quotesArray[randomIndex];
        },
        getTodayStr: () => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
    };

    const DataEngine = {
        postsByDate: {},
      quotesArray: [],
       fetchData: async () => {
            let startIndex = 1;
            const maxResults = 150; // Μικρές "ανάλαφρες" παρτίδες
            let hasMore = true;
            
            // Παίρνουμε το καθαρό link και βάζουμε αναγκαστικά summary
            let baseUrl = CONFIG.feedUrl.split('?')[0].replace('/default', '/summary');

            while (hasMore) {
                try {
                    const currentUrl = `${baseUrl}?alt=json&max-results=${maxResults}&start-index=${startIndex}`;
                    const response = await fetch(currentUrl);
                    const data = await response.json();

                    if (data.feed?.entry && data.feed.entry.length > 0) {
                        data.feed.entry.forEach(post => {
                           const dateStr = post.published.$t.split('T')[0];
                            // FIX: Optional Chaining (?.). Αν δεν υπάρχουν links, δεν κρασάρει ολόκληρο το Ημερολόγιο
                            const linkObj = post.link?.find(l => l.rel === 'alternate');
                            
                            let thumbUrl = null;
                            if (post.media$thumbnail && post.media$thumbnail.url) {
                                thumbUrl = post.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?\//, '/s150-c/');
                            }

                            if (!DataEngine.postsByDate[dateStr]) DataEngine.postsByDate[dateStr] = [];
                            DataEngine.postsByDate[dateStr].push({
                                title: Utils.cleanTitle(post.title?.$t),
                                url: linkObj ? linkObj.href : '#',
                                thumbnail: thumbUrl
                            });
                        });
                        
                        startIndex += data.feed.entry.length;
                        
                 
                       const totalResults = parseInt(data.feed.openSearch$totalResults?.$t || 0, 10);
                       // FIX: Σταματάει αυτόματα αν το πακέτο είναι μικρότερο από το maxResults. Γλιτώνει 1 άχρηστο και αργό HTTP Request!
                        if (startIndex > totalResults || data.feed.entry.length < maxResults) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false; 
                    }
                } catch (e) {
                    console.warn("Σφάλμα φόρτωσης:", e);
                    hasMore = false;
                }
            }
        },
      fetchQuotes: async () => {
            try {
                const response = await fetch(CONFIG.quotesJsonUrl);
                const data = await response.json();
                DataEngine.quotesArray = data.quotes || [];
            } catch (e) {
                console.warn("Το JSON με τα αποφθέγματα δεν φόρτωσε.");
                DataEngine.quotesArray = [];
            }
        }
    };

    // =========================================================
    // Έξυπνη Μηχανή (Κοινό Tooltip UI)
    // =========================================================
    const UIEngine = {
        overlay: null,
        tooltip: null,
        hideTimeout: null,
        fadeTimeout: null,
        isModalActive: false,
        currentHoveredFrame: null,

      init: () => {
            // FIX: Αν υπάρχουν ήδη, απλά συνδέουμε τις μεταβλητές. Το τυφλό 'return' άφηνε το tooltip null και κράσαρε το JS.
            if (document.getElementById('calendar-overlay')) {
                UIEngine.overlay = document.getElementById('calendar-overlay');
                UIEngine.tooltip = document.getElementById('calendar-tooltip');
                return;
            }
            
           UIEngine.overlay = document.createElement('div');
            UIEngine.overlay.id = 'calendar-overlay';
            UIEngine.overlay.className = 'calendar-overlay-class'; // Κρατάμε την κλάση του Mobile
            
            // FIX: Απαγορεύει το σύρσιμο του μαύρου φόντου να σκρολάρει το blog από πίσω (IOS Scroll Bleed)!
            UIEngine.overlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            
            document.body.appendChild(UIEngine.overlay);

            UIEngine.tooltip = document.createElement('div');
            UIEngine.tooltip.id = 'calendar-tooltip'; // Κρατάμε το αυθεντικό ID
            UIEngine.tooltip.className = 'calendar-tooltip-class';
            document.body.appendChild(UIEngine.tooltip);

           // FIX: Προσθήκη touchstart γιατί τα iPhone αγνοούν τα click στα απλά div!
            ['click', 'touchstart'].forEach(evt => {
                UIEngine.overlay.addEventListener(evt, (e) => {
                    UIEngine.closeTooltip();
                }, { passive: true });
            });
            UIEngine.tooltip.addEventListener('mouseenter', () => clearTimeout(UIEngine.hideTimeout));
           UIEngine.tooltip.addEventListener('mouseleave', () => { 
                if (UIEngine.isModalActive) return; // ΔΙΟΡΘΩΣΗ: Προστατεύει το Modal από το να κλείσει άκυρα με το ποντίκι!
                UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
            });
        // Κλείσιμο του Modal με το Escape (ESC)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && UIEngine.isModalActive) UIEngine.closeTooltip();
            });

            // FIX: Καθαρίζει ορφανά Tooltips στο PC/Tablets αν ο χρήστης αλλάξει μέγεθος παραθύρου ή γυρίσει την οθόνη.
            if (!window.hasCalendarResizeListener) {
                window.addEventListener('resize', () => {
                    if (UIEngine.tooltip && UIEngine.tooltip.style.opacity === '1') UIEngine.closeTooltip();
                }, { passive: true });
                window.hasCalendarResizeListener = true;
            }

            // FIX: Προστασία BFCache των Browsers. Αν ο χρήστης πατήσει το "Πίσω", το Modal κλείνει.
            window.addEventListener('pageshow', (e) => {
                if (e.persisted && UIEngine.isModalActive) UIEngine.closeTooltip();
            });
        },

        showTooltip: (cellFrame, posts, isModal, isPC) => {
            UIEngine.isModalActive = isModal;
            clearTimeout(UIEngine.hideTimeout);
            clearTimeout(UIEngine.fadeTimeout); 
            UIEngine.tooltip.innerHTML = '';
            
        const listContainer = document.createElement('div');
            // FIX: overscroll-behavior: contain. Εγκλωβίζει 100% το σκρολ στο Modal. Αν τερματίσει η λίστα, ΔΕΝ σκρολάρει η σελίδα από πίσω!
            listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding: 5px; overscroll-behavior: contain;';

           posts.forEach(p => {
                let a = document.createElement('a');
                a.href = p.url;
                a.className = 'tooltip-title-link';
                
                // FIX: Αν είναι απόφθεγμα, του κόβουμε το ποντίκι (pointer-events) για να μη νομίζουν ότι πατιέται
                const isQuote = (p.url === 'javascript:void(0);');
                const pointerCSS = isQuote ? 'pointer-events: none;' : '';
                
                a.style.cssText = `display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 8px; border-radius: 8px; background: rgba(0,0,0,0.02); color: #333; transition: background 0.2s, transform 0.2s; ${pointerCSS}`;
                
                if (isPC && !isQuote) { // FIX: Απενεργοποίηση των Hover effects στα αποφθέγματα
                    a.onmouseover = function() { 
                        this.style.background = 'rgba(0,0,0,0.06)'; 
                        this.style.transform = 'translateY(-2px)'; 
                    };
                    a.onmouseout = function() { 
                        this.style.background = 'rgba(0,0,0,0.02)'; 
                        this.style.transform = 'translateY(0)';
                    };
                }

                let iconHtml = '';
                if (p.thumbnail) {
                    iconHtml = `<img src="${p.thumbnail}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
                } else if (p.url === 'javascript:void(0);') {
                    iconHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #fff3cd; border-radius: 8px; font-size: 24px; flex-shrink: 0;">✨</div>`;
                } else {
                    iconHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #e9ecef; border-radius: 8px; font-size: 20px; flex-shrink: 0;">📝</div>`;
                }

                a.innerHTML = `${iconHtml}<span style="font-size: 14px; font-weight: 600; line-height: 1.3;">${p.title}</span>`;
                listContainer.appendChild(a);
            });

            UIEngine.tooltip.appendChild(listContainer);
            UIEngine.tooltip.style.display = 'block';
            UIEngine.tooltip.style.visibility = 'hidden';

            const tooltipStyle = isPC 
                ? `width: 320px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);` 
                : `width: 90vw; max-width: 320px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);`;

            if (isModal || !isPC) {
                UIEngine.overlay.style.display = 'block';
                UIEngine.tooltip.style.cssText = `display: block; visibility: visible; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; z-index: 10000; ${tooltipStyle}`;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    UIEngine.overlay.style.opacity = '1';
                    UIEngine.tooltip.style.opacity = '1';
                    UIEngine.tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
                }));
           } else {
               UIEngine.overlay.style.display = 'none'; // FIX: Καθαρίζει το "αόρατο τείχος" αν ακυρωθεί βίαια το κλείσιμό του από επόμενο hover!
                UIEngine.tooltip.style.cssText = `display: block; visibility: hidden; position: absolute; z-index: 9999; ${tooltipStyle}`;
                const rect = cellFrame.getBoundingClientRect();
                
                let topPos = rect.top + window.scrollY - UIEngine.tooltip.offsetHeight + 10;
                let leftPos = rect.left + window.scrollX + (rect.width / 2) - (UIEngine.tooltip.offsetWidth / 2);
                
               // FIX: Τείχος προστασίας για να μην βγαίνει ΠΟΤΕ εκτός οθόνης!
                const maxLeft = document.body.clientWidth - UIEngine.tooltip.offsetWidth - 10;
                if (leftPos > maxLeft) leftPos = maxLeft;
                if (leftPos < 10) leftPos = 10; // Το "leftPos < 10" πρέπει να είναι τελευταίο για να σώζει αρνητικά maxLeft.
                
                if (topPos < window.scrollY + 10) topPos = rect.bottom + window.scrollY + 10; // Αν κόβεται πάνω
                
                // FIX: Αν το tooltip βγαίνει κάτω από την οθόνη (π.χ. hover στην τελευταία σειρά)
                const maxTop = window.scrollY + window.innerHeight - UIEngine.tooltip.offsetHeight - 10;
                if (topPos > maxTop) topPos = maxTop;
                
                UIEngine.tooltip.style.cssText = `display: block; visibility: visible; position: absolute; transform: none; opacity: 0; z-index: 9999; top: ${topPos}px; left: ${leftPos}px; ${tooltipStyle}`;
                
                // Το animation σου παραμένει απολύτως ανέπαφο!
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    UIEngine.tooltip.style.opacity = '1';
                }));
            }
        },

        closeTooltip: () => {
            UIEngine.isModalActive = false;
            UIEngine.currentHoveredFrame = null;
            if(!UIEngine.overlay || !UIEngine.tooltip) return;
            
           UIEngine.overlay.style.opacity = '0';
            UIEngine.tooltip.style.opacity = '0';
            
            clearTimeout(UIEngine.fadeTimeout); // FIX: Σκοτώνει τα διπλά/ορφανά timeouts στα κινητά
            UIEngine.fadeTimeout = setTimeout(() => {
                UIEngine.overlay.style.display = 'none';
                UIEngine.tooltip.style.display = 'none';
            }, 300);
        }
    };

    // ==========================================
    // 4. ΕΡΓΟΣΤΑΣΙΟ ΗΜΕΡΟΛΟΓΙΩΝ (Factory Pattern)
    // ==========================================
    // Αυτό εγγυάται ότι αν υπάρχουν 2 ημερολόγια στη σελίδα (PC & Κινητό), 
    // δεν θα "μπλέξουν" ποτέ οι μεταβλητές τους!
    const CalendarWidget = (suffix) => {
        const isPC = suffix === '';
        
        const self = {
            isTouchMode: false,
            calendar: null,
            isYearView: false,
            currentYearView: new Date().getFullYear(),
            isSpinning: false,
            isAnimating: false,
            els: {
                calendarEl: document.getElementById(`calendar${suffix}`),
                container: document.getElementById(`calendar-container${suffix}`),
                monthLabel: document.getElementById(`monthLabel${suffix}`),
                prevBtn: document.getElementById(`prevBtn${suffix}`),
                nextBtn: document.getElementById(`nextBtn${suffix}`),
                yearOverlay: null,
                diceBtn: null,
                todayBtn: null
            },

            init: () => {
                if (!self.els.calendarEl) return false;
                
                // --- Δημιουργία Advanced Στοιχείων ---
                self.els.diceBtn = document.createElement('button');
                self.els.diceBtn.innerHTML = '🎲';
                self.els.diceBtn.className = 'advanced-btn dice-btn';
                self.els.diceBtn.title = 'Τυχαίο Άρθρο (Ρουλέτα)';

                self.els.todayBtn = document.createElement('button');
                self.els.todayBtn.innerHTML = '↺ Σήμερα';
                self.els.todayBtn.className = 'advanced-btn today-anchor-btn';

                self.els.monthLabel.classList.add('month-zoom-label');
                if (isPC) self.els.monthLabel.title = 'Προβολή Έτους';

                const titleWrapper = document.createElement('div');
                titleWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center;';
                self.els.monthLabel.parentNode.insertBefore(titleWrapper, self.els.monthLabel);
                titleWrapper.appendChild(self.els.monthLabel);
                titleWrapper.appendChild(self.els.diceBtn);

                self.els.container.style.position = 'relative';
                self.els.container.appendChild(self.els.todayBtn);

             self.els.yearOverlay = document.createElement('div');
                // Βγάζουμε εντελώς το suffix ώστε το ID να είναι ακριβώς όπως το ψάχνει το CSS σου!
                self.els.yearOverlay.id = 'year-view-overlay'; 
                self.els.container.appendChild(self.els.yearOverlay);
              

                // --- Εκκίνηση FullCalendar ---
                const todayStr = Utils.getTodayStr();
                self.calendar = new window.FullCalendar.Calendar(self.els.calendarEl, {
                    locale: 'el', 
                    initialView: 'dayGridMonth',
                    headerToolbar: false,
                    height: '100%',
                    contentHeight: '100%',
                    displayEventTime: false,
                    events: [], 
                    datesSet: (info) => {
                        if (!self.els.monthLabel || self.isYearView) return; 
                       // FIX: Απομόνωση μήνα για να αποφύγουμε τη Γενική Πτώση των iOS συσκευών
                        const mStr = info.view.currentStart.toLocaleString('el-GR', { month: 'long' });
                        const yStr = info.view.currentStart.getFullYear();
                        self.els.monthLabel.textContent = mStr.charAt(0).toUpperCase() + mStr.slice(1) + ' ' + yStr;
                        self.updateTimeAnchor(info.view.currentStart);
                    },
                    dayCellDidMount: (info) => {
                        const cellDateStr = info.el.dataset.date; 
                        const frame = info.el.querySelector('.fc-daygrid-day-frame');
                        if (!frame) return;
                        frame.style.position = 'relative'; 

                      // FIX: Καθαρισμός ανακυκλωμένων DOM από τον προηγούμενο μήνα πριν μπουν τα νέα!
                        frame.classList.remove('has-posts');
                        const oldDot = frame.querySelector('.post-dot');
                        if (oldDot) oldDot.remove();
                        const oldEmoji = frame.querySelector('.day-indicator-emoji');
                        if (oldEmoji) oldEmoji.remove();

                        if (DataEngine.postsByDate[cellDateStr]) {
                            frame.classList.add('has-posts');
                            if (!frame.querySelector('.post-dot')) {
                                let dot = document.createElement('div');
                                dot.className = 'post-dot';
                                dot.style.pointerEvents = 'none'; 
                                frame.appendChild(dot);
                            }
                       } else {
                            // FIX: Δυναμικός έλεγχος ημερομηνίας. Αν το tab μείνει ανοιχτό 2 μέρες, δεν θα δείχνει λάθος το "Σήμερα"!
                            const realToday = Utils.getTodayStr(); 
                            if (cellDateStr <= realToday) {
                                if (!frame.querySelector('.day-indicator-emoji')) {
                                    let indicator = document.createElement('div');
                                    indicator.className = 'day-indicator-emoji';
                                    indicator.innerHTML = (cellDateStr < realToday) ? '💤' : '✨'; 
                                    indicator.style.cssText = 'position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); opacity: 0.25; font-size: 20px; pointer-events: none;';
                                    frame.appendChild(indicator);
                                }
                            }
                        }
                    }
                });
                
                self.calendar.render();
                self.setupEvents();
                return true;
            },

            updateTimeAnchor: (date) => {
                const now = new Date();
                const isCurrentMonth = (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());
                if (!isCurrentMonth && !self.isYearView) self.els.todayBtn.classList.add('visible');
                else self.els.todayBtn.classList.remove('visible');
            },

           toggleYearView: () => {
                if (self.isSpinning) return;
                self.isYearView = !self.isYearView;
                
                // FIX: Κλείνει οποιοδήποτε Tooltip έχει μείνει ανοιχτό (από Hover), για να μην σκεπάζει τους μήνες του Έτους!
                if (self.isYearView) UIEngine.closeTooltip();

                if (self.isYearView) {
                    self.currentYearView = self.calendar.getDate().getFullYear();
                    self.renderYearView(self.currentYearView);
                    self.els.yearOverlay.classList.add('active');
                    self.els.todayBtn.classList.remove('visible');
                } else {
                    self.els.yearOverlay.classList.remove('active');
                   const d = self.calendar.getDate();
                    const mStr = d.toLocaleString('el-GR', { month: 'long' });
                    self.els.monthLabel.textContent = mStr.charAt(0).toUpperCase() + mStr.slice(1) + ' ' + d.getFullYear();
                    self.updateTimeAnchor(d);
                }
            },

            renderYearView: (year) => {
                self.currentYearView = year;
                self.els.monthLabel.textContent = `Έτος ${year}`;
                
                let html = `
                    <div class="year-header">
                        <button id="prevYearBtn${suffix}" class="year-nav-btn">&#10094;</button>
                        <span>${year}</span>
                        <button id="nextYearBtn${suffix}" class="year-nav-btn">&#10095;</button>
                    </div>
                    <div class="year-grid">
                `;
                const months = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];
                let maxPosts = 1;
                const postCounts = new Array(12).fill(0);
                
                Object.keys(DataEngine.postsByDate).forEach(d => {
                    if (d.startsWith(year.toString())) {
                        const m = parseInt(d.split('-')[1]) - 1;
                        postCounts[m] += DataEngine.postsByDate[d].length;
                        if (postCounts[m] > maxPosts) maxPosts = postCounts[m];
                    }
                });

                months.forEach((name, index) => {
                    const count = postCounts[index];
                    let intensityClass = '';
                    if (count > 0) {
                        const ratio = count / maxPosts;
                        if (ratio > 0.6) intensityClass = 'high';
                        else if (ratio > 0.2) intensityClass = 'med';
                    }
                    html += `<div class="year-month-box ${count > 0 ? 'has-data ' + intensityClass : ''}" data-month="${index}">
                                <span class="ym-name">${name}</span>
                                ${count > 0 ? `<span class="ym-count">${count} άρθρ.</span>` : ''}
                             </div>`;
                });
                html += `</div>`;
                self.els.yearOverlay.innerHTML = html;

                document.getElementById(`prevYearBtn${suffix}`).addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    if (!isPC && navigator.vibrate) navigator.vibrate(10);
                    self.renderYearView(year - 1);
                });
                document.getElementById(`nextYearBtn${suffix}`).addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    if (!isPC && navigator.vibrate) navigator.vibrate(10);
                    self.renderYearView(year + 1);
                });

                self.els.yearOverlay.querySelectorAll('.year-month-box').forEach(box => {
                    box.addEventListener('click', () => {
                        if (!isPC && navigator.vibrate) navigator.vibrate(15);
                        const m = box.dataset.month;
                        self.calendar.gotoDate(new Date(year, m, 1));
                        self.toggleYearView();
                    });
                });
            },

          playRoulette: () => {
                if (self.isSpinning || self.isAnimating) return; // FIX: Κλείδωμα
                const dates = Object.keys(DataEngine.postsByDate);
                if (dates.length === 0) return;
                
                if (self.isYearView) self.toggleYearView();

                self.isSpinning = true;
                self.els.diceBtn.classList.add('spinning');
                self.els.calendarEl.classList.add('roulette-blur');

              const targetDateStr = dates[Math.floor(Math.random() * dates.length)];
                
                // ΔΙΟΡΘΩΣΗ: Αναγκαστική μετατροπή σε τοπική ώρα, ώστε το έτος/μήνας/μέρα να είναι ολόσωστα 100% σε κάθε χώρα
                const [ty, tm, td] = targetDateStr.split('-');
                const targetDate = new Date(ty, tm - 1, td);

               let spins = 0;
                const maxSpins = 10;
                const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
                
                const spinInterval = setInterval(() => {
                    spins++;
                    const randomYear = targetDate.getFullYear() - Math.floor(Math.random() * 3);
                    const randomMonth = Math.floor(Math.random() * 12);
                    
                    // FIX: Οπτική ψευδαίσθηση! (Γλιτώνουμε εκατοντάδες DOM repaints που "κολλάνε" τα κινητά)
                    if (self.els.monthLabel) self.els.monthLabel.textContent = `${monthNames[randomMonth]} ${randomYear}`;
                    
                    if (!isPC && navigator.vibrate) navigator.vibrate(5); 

                    if (spins >= maxSpins) {
                        clearInterval(spinInterval);
                        self.calendar.gotoDate(targetDate); // Πραγματικό render ΜΟΝΟ μια φορά στο τέλος
                        self.els.calendarEl.classList.remove('roulette-blur');
                        self.els.diceBtn.classList.remove('spinning');
                        
                        if (!isPC && navigator.vibrate) navigator.vibrate([20, 40, 20]);
                        
                      setTimeout(() => {
                            self.isSpinning = false;
                            const cell = self.els.calendarEl.querySelector(`.fc-day[data-date="${targetDateStr}"] .fc-daygrid-day-frame`);
                            
                            // FIX: Αφαιρέθηκε ο ελαττωματικός έλεγχος (cell || !isPC) που νέκρωνε τη ρουλέτα στα PC. 
                            // Τώρα ανοίγει ΠΡΑΓΜΑΤΙΚΑ 100% στο body αν δεν βρει το κουτάκι!
                            UIEngine.showTooltip(cell || document.body, DataEngine.postsByDate[targetDateStr], true, isPC);
                        }, 400);
                    }
                }, 120);
            },

            changeMonthAnimated: (direction) => {
                if (self.isAnimating || !self.els.calendarEl || self.isSpinning) return;

                if (!isPC && navigator.vibrate) navigator.vibrate(10);

                if (self.isYearView) {
                    const newYear = self.currentYearView + (direction === 'next' ? 1 : -1);
                    self.renderYearView(newYear);
                    return;
                }

                self.isAnimating = true;
                const outClass = direction === 'next' ? 'cal-out-left' : 'cal-out-right';
                const inClass = direction === 'next' ? 'cal-in-right' : 'cal-in-left';

                self.els.calendarEl.classList.add(outClass);

                setTimeout(() => {
                    if (direction === 'next') self.calendar.next();
                    else self.calendar.prev();
                    
                    self.els.calendarEl.classList.remove(outClass);
                    self.els.calendarEl.classList.add(inClass);

                    setTimeout(() => {
                        self.els.calendarEl.classList.remove(inClass);
                        self.isAnimating = false;
                    }, 200);
                }, 150); 
            },

            setupEvents: () => {
                // UI Buttons
                self.els.diceBtn.addEventListener('click', () => {
                    if (!isPC && navigator.vibrate) navigator.vibrate(15);
                    self.playRoulette();
                });
              self.els.monthLabel.addEventListener('click', () => {
                    // FIX: Απαγορεύεται να ανοίξει η Προβολή Έτους αν το Ημερολόγιο βρίσκεται ήδη σε κίνηση αλλαγής μήνα.
                    if (!self.isSpinning && !self.isAnimating) {
                        if (!isPC && navigator.vibrate) navigator.vibrate(10);
                        self.toggleYearView();
                    }
                });
                self.els.todayBtn.addEventListener('click', () => {
                    if (self.isSpinning || self.isAnimating) return; // FIX: Κλείδωμα
                    if (!isPC && navigator.vibrate) navigator.vibrate(15);
                    self.calendar.today();
                    if (self.isYearView) self.toggleYearView();
                });
                if (self.els.prevBtn) self.els.prevBtn.addEventListener('click', () => self.changeMonthAnimated('prev'));
                if (self.els.nextBtn) self.els.nextBtn.addEventListener('click', () => self.changeMonthAnimated('next'));

           let touchstartX = 0, startY = 0, isSwiping = false, swipeTimeout = null; // FIX: Προσθήκη swipeTimeout

                self.els.container.addEventListener('touchstart', (e) => {
                    self.isTouchMode = true; 
                    isSwiping = false; // Μηδενισμός σε κάθε νέο άγγιγμα
                    touchstartX = e.changedTouches[0].screenX;
                    startY = e.changedTouches[0].screenY;
                }, { passive: true });

                self.els.container.addEventListener('touchend', (e) => {
                    const diffX = e.changedTouches[0].screenX - touchstartX;
                    const diffY = e.changedTouches[0].screenY - startY;

         
                    if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
                        isSwiping = true;
                        clearTimeout(swipeTimeout); // FIX: Διαγραφή παλιού χρονομέτρου σε γρήγορα απανωτά swipes
                        swipeTimeout = setTimeout(() => isSwiping = false, 350); 
                    }

                  
                 // FIX: Απαγορεύεται το swipe-αλλαγή μήνα αν το Modal ή η Προβολή Έτους είναι ανοιχτά
                    if (UIEngine.isModalActive || self.isYearView) return;

                  // FIX: Απαγορεύεται το swipe αν η ρουλέτα γυρίζει, το modal είναι ανοιχτό ή ήδη αλλάζει μήνα!
                    if (self.isSpinning || self.isAnimating || UIEngine.isModalActive) return; 

                   // Επαναφορά της ελαστικής λογικής του Mobile:
                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        if (diffX < -40) self.changeMonthAnimated('next');
                        else if (diffX > 40) self.changeMonthAnimated('prev');
                    }
                }, { passive: true });

                // Cell interaction (Click / Hover)
             const handleCellInteraction = (frame, type, e = null) => {
                    if (self.isSpinning || self.isYearView) return;
                    const cell = frame.closest('.fc-daygrid-day');
                    if (!cell) return;
                    const dateStr = cell.dataset.date;
                   const todayStr = Utils.getTodayStr();
                    const posts = DataEngine.postsByDate[dateStr];

                    if (!posts && dateStr > todayStr) {
                        // FIX: Αν ο χρήστης PC κουνήσει το ποντίκι από γεμάτη μέρα σε μελλοντική (άδεια), 
                        // κλείνουμε το παλιό Tooltip για να μην μείνει "παγωμένο" στην οθόνη!
                        if (type === 'hover') UIEngine.closeTooltip();
                        return;
                    }

                    let content = posts;
                    if (!posts) {
                        // FIX: Αποθήκευση στη RAM με βάση την ημερομηνία, όχι στο ανακυκλώσιμο HTML
                        if (!DataEngine.quotesByDate) DataEngine.quotesByDate = {};
                        if (!DataEngine.quotesByDate[dateStr]) DataEngine.quotesByDate[dateStr] = Utils.getQuote();
                        
                        content = [{ title: DataEngine.quotesByDate[dateStr], url: 'javascript:void(0);' }];
                    }

                    if (type === 'click') {
                        if (!isPC && navigator.vibrate) navigator.vibrate(10);
                        
                        // Στο PC (mouse), αν έχει 1 άρθρο ανοίγει κατευθείαν το Link! Στην αφή, ανοίγει Modal.
                       if (posts && posts.length === 1 && !self.isTouchMode && isPC) {
                            // FIX: Ελέγχουμε αν πατούσε Ctrl ή Cmd(Mac). Αν ναι, πάει σε νέα καρτέλα!
                            if (e && (e.ctrlKey || e.metaKey)) {
                                window.open(posts[0].url, '_blank');
                            } else {
                                window.open(posts[0].url, '_self'); 
                            }
                        } else {
                            UIEngine.showTooltip(frame, content, true, isPC);
                        }
                    } else if (type === 'hover' && isPC) {
                        UIEngine.showTooltip(frame, content, false, isPC);
                    }
                };

             self.els.container.addEventListener('click', (e) => {
                    if (isSwiping) { e.preventDefault(); return; } 
                    const frame = e.target.closest('.fc-daygrid-day-frame');
                    // FIX: Το event 'e' περνάει μέσα στη συνάρτηση
                    if (frame) { e.preventDefault(); handleCellInteraction(frame, 'click', e); } 
                });

                if (isPC) {
                   self.els.container.addEventListener('mouseover', (e) => {
                        // FIX: Αν το Modal είναι ανοιχτό στο κέντρο, απαγορεύεται το hover άλλων ημερών να το διαγράψει!
                        if (self.isTouchMode || UIEngine.isModalActive) return; 
                        const frame = e.target.closest('.fc-daygrid-day-frame');
                        if (frame) {
                            clearTimeout(UIEngine.hideTimeout); 
                            if (frame !== UIEngine.currentHoveredFrame) {
                                UIEngine.currentHoveredFrame = frame;
                                handleCellInteraction(frame, 'hover');
                            }
                        }
                    });

                  self.els.container.addEventListener('mouseout', (e) => {
                        // FIX: Αν το Modal είναι ανοιχτό, απαγορεύεται το mouseout να ξεκινήσει χρονόμετρο κλεισίματος!
                        if (self.isTouchMode || UIEngine.isModalActive) return;
                        const frame = e.target.closest('.fc-daygrid-day-frame');
                        const toTooltip = UIEngine.tooltip && UIEngine.tooltip.contains(e.relatedTarget);
                        if (frame && !frame.contains(e.relatedTarget) && !toTooltip) {
                            UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
                        }
                    });

                    // Μαγνήτης Ποντικιού (Τρέχει μόνο σε Desktop) - 0% Lag / Caching
                    let activeMagnetDot = null;

                    self.els.container.addEventListener('mousemove', (e) => {
                        // FIX: Αν κουνηθεί φυσικό ποντίκι (movementX), ξεκλειδώνουμε τα Υβριδικά Laptops από το Touch Mode
                        if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) self.isTouchMode = false;

                        if (UIEngine.isModalActive || self.isSpinning || self.isYearView || self.isTouchMode) return;
                        const frame = e.target.closest('.fc-daygrid-day-frame.has-posts');
                        const dot = frame ? frame.querySelector('.post-dot') : null;
                        
                        // FIX: Καθαρίζουμε ΜΟΝΟ την προηγούμενη ενεργή τελεία. Τέλος το βαρύ querySelectorAll.
                        if (activeMagnetDot && activeMagnetDot !== dot) {
                            activeMagnetDot.style.transform = ''; activeMagnetDot.style.background = ''; activeMagnetDot.style.boxShadow = '';
                        }
                        
                        activeMagnetDot = dot;

                        if (dot && frame) {
                            const rect = frame.getBoundingClientRect();
                            const dx = e.clientX - (rect.left + rect.width / 2);
                            const dy = e.clientY - (rect.top + rect.height / 2);
                            dot.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px) scale(1.4)`;
                            dot.style.background = '#4A90E2';
                            dot.style.boxShadow = '0 0 10px 3px rgba(74, 144, 226, 0.6)';
                        }
                    });

                    self.els.container.addEventListener('mouseleave', () => {
                        if (activeMagnetDot) {
                            activeMagnetDot.style.transform = ''; activeMagnetDot.style.background = ''; activeMagnetDot.style.boxShadow = '';
                            activeMagnetDot = null;
                        }
                    });
                }
            }
        };

        return self;
    };

    // ==========================================
    // 5. ΕΚΚΙΝΗΣΗ (MAIN CONTROLLER)
    // ==========================================
   const AppController = {
        init: () => {
            // FIX: Προστασία έναντι Blogger AJAX Themes. Αν έχει ήδη τρέξει 1 φορά, μπλοκάρει τη 2η εκτέλεση που θα διπλασίαζε τα άρθρα!
            if (window.calendarWidgetHasRun) return;
            window.calendarWidgetHasRun = true;

            UIEngine.init();
            
            // Ψάχνει ποια ημερολόγια υπάρχουν στη σελίδα (του κινητού, του PC, ή και τα 2)
            const suffixes = ['-mobile', ''];
            const activeWidgets = [];

          suffixes.forEach(suffix => {
                const container = document.getElementById(`calendar-container${suffix}`);
                const calEl = document.getElementById(`calendar${suffix}`);
                
                // FIX: Προστασία AJAX! Φορτώνει ΜΟΝΟ αν δεν έχει ήδη ζωγραφιστεί το ημερολόγιο (δηλαδή δεν έχει την κλάση .fc). 
                // Προστατεύει από διπλασιασμό, αλλά δεν νεκρώνει τη σελίδα στα δυναμικά Themes!
                if (container && calEl && !calEl.classList.contains('fc')) {
                    activeWidgets.push(CalendarWidget(suffix));
                }
            });

           if (activeWidgets.length === 0) return;

            let attempts = 0; // FIX: Μετρητής προσπαθειών
            const waitForCalendar = setInterval(async () => {
                attempts++;
                if (window.FullCalendar) {
                    clearInterval(waitForCalendar);
                    
                   // FIX: Κατεβάζει τα δεδομένα ΜΟΝΟ αν είναι άδεια, γλιτώνοντας άσκοπα requests/lag στα AJAX themes!
                    if (Object.keys(DataEngine.postsByDate).length === 0) {
                        await Promise.all([
                            DataEngine.fetchData(),
                            DataEngine.fetchQuotes()
                        ]);
                    }
                    
                    // Ενεργοποιεί όσα ημερολόγια βρήκε
                   activeWidgets.forEach(widget => widget.init());
                } else if (attempts > 100) {
                    // FIX: Μετά από 10 δευτερόλεπτα εγκαταλείπει, προστατεύοντας το CPU/Μπαταρία
                    clearInterval(waitForCalendar);
                }
            }, 100);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
    }
})();
