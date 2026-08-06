(() => {
    "use strict";

    const CONFIG = Object.freeze({
        feedUrl: 'https://dimperist.blogspot.com/feeds/posts/default?alt=json&max-results=500',
       quotesJsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/hmeroquotes1.json',
    });

    const DOM = {
        calendarEl: document.getElementById('calendar-mobile'),
        container: document.getElementById('calendar-container-mobile'),
        monthLabel: document.getElementById('monthLabel-mobile'),
        prevBtn: document.getElementById('prevBtn-mobile'),
        nextBtn: document.getElementById('nextBtn-mobile'),
        overlay: null,
        tooltip: null,
      yearOverlay: null,
        diceBtn: null,
        todayBtn: null
    };

    const Utils = {
        cleanTitle: (rawStr) => {
            if (!rawStr) return 'Χωρίς τίτλο';
            return rawStr.replace(/&laquo;|&#171;|\u00C2\u00AB|\u00A4\u00C3/g, '«').replace(/&raquo;|&#187;|\u00C2\u00BB|\u00A5\u00C3/g, '»').replace(/&ldquo;|&rdquo;|&#8220;|&#8221;|&quot;/g, '"').replace(/&lsquo;|&rsquo;|&#8216;|&#8217;|&#39;/g, "'").replace(/&#183;|&middot;/g, '·').replace(/&ndash;|&#8211;/g, '-').replace(/&mdash;|&#8212;/g, '—').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
        },
        getQuote: () => {
            // 1. Προστασία: Αν δεν έχει φορτώσει το ίντερνετ ή το JSON
            if (!DataEngine.quotesArray || DataEngine.quotesArray.length === 0) {
                return "Μια υπέροχη μέρα σε περιμένει!"; // Το default μήνυμα
            }

            // 2. Η κανονική λογική, πλέον τραβάει από το DataEngine.quotesArray
            let used = [];
            try { used = JSON.parse(localStorage.getItem('usedQuotesMobile')) || []; } catch(e) {}
            
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
            
            try { localStorage.setItem('usedQuotesMobile', JSON.stringify(used)); } catch(e) {}
            
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
            try {
                const response = await fetch(CONFIG.feedUrl);
                const data = await response.json();
                if (data.feed?.entry) {
                    data.feed.entry.forEach(post => {
                        const dateStr = post.published.$t.split('T')[0];
                        const linkObj = post.link.find(l => l.rel === 'alternate');
                        
                        // Εδώ τραβάμε την εικόνα και τη μεγαλώνουμε σε 150px
                        let thumbUrl = null;
                        if (post.media$thumbnail && post.media$thumbnail.url) {
                            thumbUrl = post.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?\//, '/s150-c/');
                        }

                        if (!DataEngine.postsByDate[dateStr]) DataEngine.postsByDate[dateStr] = [];
                        DataEngine.postsByDate[dateStr].push({
                            title: Utils.cleanTitle(post.title?.$t),
                            url: linkObj ? linkObj.href : '#',
                            thumbnail: thumbUrl // Αποθηκεύουμε την εικόνα
                        });
                    });
                }
            } catch (e) {}
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

    const UIEngine = {
        init: () => {
            if (document.getElementById('calendar-overlay-mobile')) return;
            DOM.overlay = document.createElement('div');
            DOM.overlay.id = 'calendar-overlay-mobile';
            DOM.overlay.className = 'calendar-overlay-class'; // Για να πιάσει το CSS σου
            document.body.appendChild(DOM.overlay);

            DOM.tooltip = document.createElement('div');
            DOM.tooltip.id = 'calendar-tooltip-mobile';
            DOM.tooltip.className = 'calendar-tooltip-class'; // Για να πιάσει το CSS σου
            document.body.appendChild(DOM.tooltip);

            DOM.overlay.addEventListener('click', UIEngine.closeTooltip);
        },
        showTooltip: (posts) => {
            DOM.tooltip.innerHTML = '';
            
            const listContainer = document.createElement('div');
            listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding: 5px;';

            posts.forEach(p => {
                let a = document.createElement('a');
                a.href = p.url;
                a.className = 'tooltip-title-link';
                // Στυλ Flexbox για να μπουν εικόνα και τίτλος δίπλα-δίπλα
                a.style.cssText = 'display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 8px; border-radius: 8px; background: rgba(0,0,0,0.02); color: #333; transition: background 0.2s;';
                
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

            DOM.tooltip.appendChild(listContainer);

            DOM.overlay.style.display = 'block';
            DOM.tooltip.style.cssText = `display: block; visibility: visible; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; z-index:10000; width: 90vw; max-width: 320px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);`;
            
            requestAnimationFrame(() => requestAnimationFrame(() => {
                DOM.overlay.style.opacity = '1';
                DOM.tooltip.style.opacity = '1';
                DOM.tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
            }));
        },
        closeTooltip: () => {
            if(!DOM.overlay || !DOM.tooltip) return;
            DOM.overlay.style.opacity = '0';
            DOM.tooltip.style.opacity = '0';
            setTimeout(() => {
                DOM.overlay.style.display = 'none';
                DOM.tooltip.style.display = 'none';
            }, 300);
        }
    };
  // =========================================================
    // 🔥 ADVANCED ENGINE (Mobile Edition - Ρουλέτα & Zoom)
    // =========================================================
    const AdvancedEngine = {
        isYearView: false,
        currentYearView: new Date().getFullYear(),
        isSpinning: false,

        init: () => {
            if (!DOM.container || !DOM.monthLabel) return;

            DOM.diceBtn = document.createElement('button');
            DOM.diceBtn.innerHTML = '🎲';
            DOM.diceBtn.className = 'advanced-btn dice-btn';
            DOM.diceBtn.title = 'Τυχαίο Άρθρο (Ρουλέτα)';

            DOM.todayBtn = document.createElement('button');
            DOM.todayBtn.innerHTML = '↺ Σήμερα';
            DOM.todayBtn.className = 'advanced-btn today-anchor-btn';

            DOM.monthLabel.classList.add('month-zoom-label');

            const titleWrapper = document.createElement('div');
            titleWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center;';
            DOM.monthLabel.parentNode.insertBefore(titleWrapper, DOM.monthLabel);
            titleWrapper.appendChild(DOM.monthLabel);
            titleWrapper.appendChild(DOM.diceBtn);

            DOM.container.style.position = 'relative';
            DOM.container.appendChild(DOM.todayBtn);

            DOM.yearOverlay = document.createElement('div');
            DOM.yearOverlay.id = 'year-view-overlay';
            DOM.container.appendChild(DOM.yearOverlay);

            // Events με Haptic Feedback (Δονήσεις)
            DOM.diceBtn.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate(15);
                AdvancedEngine.playRoulette();
            });
            DOM.monthLabel.addEventListener('click', () => {
                if (!AdvancedEngine.isSpinning) {
                    if (navigator.vibrate) navigator.vibrate(10);
                    AdvancedEngine.toggleYearView();
                }
            });
            DOM.todayBtn.addEventListener('click', () => {
                if (AdvancedEngine.isSpinning) return;
                if (navigator.vibrate) navigator.vibrate(15);
                CalendarEngine.calendar.today();
                if (AdvancedEngine.isYearView) AdvancedEngine.toggleYearView();
            });
        },

        updateTimeAnchor: (date) => {
            if (!DOM.todayBtn) return;
            const now = new Date();
            const isCurrentMonth = (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());
            if (!isCurrentMonth && !AdvancedEngine.isYearView) DOM.todayBtn.classList.add('visible');
            else DOM.todayBtn.classList.remove('visible');
        },

        toggleYearView: () => {
            if (AdvancedEngine.isSpinning) return;
            AdvancedEngine.isYearView = !AdvancedEngine.isYearView;
            
            if (AdvancedEngine.isYearView) {
                AdvancedEngine.currentYearView = CalendarEngine.calendar.getDate().getFullYear();
                AdvancedEngine.renderYearView(AdvancedEngine.currentYearView);
                DOM.yearOverlay.classList.add('active');
                DOM.todayBtn.classList.remove('visible');
            } else {
                DOM.yearOverlay.classList.remove('active');
                const d = CalendarEngine.calendar.getDate();
                const monthName = d.toLocaleString('el-GR', { month: 'long', year: 'numeric' });
                DOM.monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                AdvancedEngine.updateTimeAnchor(d);
            }
        },

        renderYearView: (year) => {
            DOM.monthLabel.textContent = `Έτος ${year}`;
            
            let html = `
                <div class="year-header">
                    <button id="prevYearBtn" class="year-nav-btn">&#10094;</button>
                    <span>${year}</span>
                    <button id="nextYearBtn" class="year-nav-btn">&#10095;</button>
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
            DOM.yearOverlay.innerHTML = html;

            document.getElementById('prevYearBtn').addEventListener('click', (e) => {
                e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(10); AdvancedEngine.renderYearView(year - 1);
            });
            document.getElementById('nextYearBtn').addEventListener('click', (e) => {
                e.stopPropagation(); if (navigator.vibrate) navigator.vibrate(10); AdvancedEngine.renderYearView(year + 1);
            });

            DOM.yearOverlay.querySelectorAll('.year-month-box').forEach(box => {
                box.addEventListener('click', () => {
                    if (navigator.vibrate) navigator.vibrate(15);
                    const m = box.dataset.month;
                    CalendarEngine.calendar.gotoDate(new Date(year, m, 1));
                    AdvancedEngine.toggleYearView();
                });
            });
        },

        playRoulette: () => {
            if (AdvancedEngine.isSpinning) return;
            const dates = Object.keys(DataEngine.postsByDate);
            if (dates.length === 0) return;
            
            if (AdvancedEngine.isYearView) AdvancedEngine.toggleYearView();

            AdvancedEngine.isSpinning = true;
            DOM.diceBtn.classList.add('spinning');
            DOM.calendarEl.classList.add('roulette-blur');

            const targetDateStr = dates[Math.floor(Math.random() * dates.length)];
            const targetDate = new Date(targetDateStr);

            let spins = 0;
            const maxSpins = 10;
            const spinInterval = setInterval(() => {
                spins++;
                const randomYear = targetDate.getFullYear() - Math.floor(Math.random() * 3);
                const randomMonth = Math.floor(Math.random() * 12);
                CalendarEngine.calendar.gotoDate(new Date(randomYear, randomMonth, 1));
                
                if (navigator.vibrate) navigator.vibrate(5); 

                if (spins >= maxSpins) {
                    clearInterval(spinInterval);
                    CalendarEngine.calendar.gotoDate(targetDate);
                    DOM.calendarEl.classList.remove('roulette-blur');
                    DOM.diceBtn.classList.remove('spinning');
                    
                    if (navigator.vibrate) navigator.vibrate([20, 40, 20]); // Jackpot!
                    
                    setTimeout(() => {
                        AdvancedEngine.isSpinning = false;
                        // Η ΕΙΔΙΚΗ ΠΡΟΣΑΡΜΟΓΗ ΓΙΑ ΤΟ ΚΙΝΗΤΟ: Καλεί το tooltip μόνο με τα άρθρα!
                        UIEngine.showTooltip(DataEngine.postsByDate[targetDateStr]);
                    }, 400); 
                }
            }, 120);
        }
    };

    const CalendarEngine = {
        calendar: null,
        init: () => {
            if (!DOM.calendarEl) return;
            const todayStr = Utils.getTodayStr();

            CalendarEngine.calendar = new window.FullCalendar.Calendar(DOM.calendarEl, {
                locale: 'el', 
                initialView: 'dayGridMonth',
                headerToolbar: false,
                height: '100%',
                contentHeight: '100%',
                displayEventTime: false,
                events: [], 
                
                datesSet: (info) => {
                    if (!DOM.monthLabel) return;
                    if (typeof AdvancedEngine !== 'undefined' && AdvancedEngine.isYearView) return; 
                    
                    const monthName = info.view.currentStart.toLocaleString('el-GR', { month: 'long', year: 'numeric' });
                    DOM.monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    if (typeof AdvancedEngine !== 'undefined') AdvancedEngine.updateTimeAnchor(info.view.currentStart);
                },
                dayCellDidMount: (info) => {
                    const cellDateStr = info.el.dataset.date; 
                    const frame = info.el.querySelector('.fc-daygrid-day-frame');
                    if (!frame) return;
                    frame.style.position = 'relative'; 

                    if (DataEngine.postsByDate[cellDateStr]) {
                        frame.classList.add('has-posts');
                        let dot = document.createElement('div');
                        dot.className = 'post-dot';
                        dot.style.pointerEvents = 'none'; 
                        frame.appendChild(dot);
                    } else if (cellDateStr <= todayStr) {
                        let indicator = document.createElement('div');
                        indicator.innerHTML = (cellDateStr < todayStr) ? '💤' : '✨'; 
                        indicator.style.cssText = 'position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); opacity: 0.25; font-size: 20px; pointer-events: none;';
                        frame.appendChild(indicator);
                    }
                }
            });
            CalendarEngine.calendar.render();
          if (typeof AdvancedEngine !== 'undefined') AdvancedEngine.init();
            CalendarEngine.setupEvents();
        },
        setupEvents: () => {
            let isAnimating = false;

            const changeMonthAnimated = (direction) => {
                if (isAnimating || !DOM.calendarEl || (typeof AdvancedEngine !== 'undefined' && AdvancedEngine.isSpinning)) return;

                if (typeof AdvancedEngine !== 'undefined' && AdvancedEngine.isYearView) {
                    if (navigator.vibrate) navigator.vibrate(10);
                    const newYear = AdvancedEngine.currentYearView + (direction === 'next' ? 1 : -1);
                    AdvancedEngine.renderYearView(newYear);
                    return;
                }

                isAnimating = true;
                // ... (ο υπόλοιπος κώδικας "const calEl = ..." μένει ίδιος)

                const calEl = DOM.calendarEl;
                const outClass = direction === 'next' ? 'cal-out-left' : 'cal-out-right';
                const inClass = direction === 'next' ? 'cal-in-right' : 'cal-in-left';

                // 1. Έναρξη animation εξόδου
                calEl.classList.add(outClass);

                // 2. Αναμονή 150ms να "φύγει" ο μήνας, αλλαγή στο παρασκήνιο και animation εισόδου
                setTimeout(() => {
                    if (direction === 'next') CalendarEngine.calendar.next();
                    else CalendarEngine.calendar.prev();
                    
                    calEl.classList.remove(outClass);
                    calEl.classList.add(inClass);

                    // 3. Καθαρισμός κλάσεων μετά από 200ms
                    setTimeout(() => {
                        calEl.classList.remove(inClass);
                        isAnimating = false;
                    }, 200);
                }, 150); 
            };

            // Σύνδεση με τα κουμπιά του μήνα
            if (DOM.prevBtn) DOM.prevBtn.addEventListener('click', () => changeMonthAnimated('prev'));
            if (DOM.nextBtn) DOM.nextBtn.addEventListener('click', () => changeMonthAnimated('next'));
            
            if (!DOM.container) return;

            // Λογική κλικ ημερών (Παραμένει ίδια)
            DOM.container.addEventListener('click', (e) => {
              if (typeof AdvancedEngine !== 'undefined' && (AdvancedEngine.isSpinning || AdvancedEngine.isYearView)) return; // Αποτροπή κλικ
                const frame = e.target.closest('.fc-daygrid-day-frame');
                if (!frame) return;
                
                e.preventDefault();
                const cell = frame.closest('.fc-daygrid-day');
                const dateStr = cell.dataset.date;
                const todayStr = Utils.getTodayStr();
                const posts = DataEngine.postsByDate[dateStr];

                if (!posts && dateStr > todayStr) return;

                if (navigator.vibrate) navigator.vibrate(10); 

                let content = posts;
                if (!posts) {
                    if (!frame.dataset.quote) frame.dataset.quote = Utils.getQuote();
                    content = [{ title: frame.dataset.quote, url: 'javascript:void(0);' }];
                }
                
                UIEngine.showTooltip(content);
            });

            // Λογική Swipe (Συνδεδεμένη με το νέο animation)
            let startX = 0, startY = 0;
            DOM.container.addEventListener('touchstart', e => {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });

            DOM.container.addEventListener('touchend', e => {
                const diffX = e.changedTouches[0].screenX - startX;
                const diffY = e.changedTouches[0].screenY - startY;
                
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < -40) {
                        if (navigator.vibrate) navigator.vibrate(15);
                        changeMonthAnimated('next');
                    } else if (diffX > 40) {
                        if (navigator.vibrate) navigator.vibrate(15);
                        changeMonthAnimated('prev');
                    }
                }
            }, { passive: true });
        }
    };

    const AppController = {
        init: () => {
            UIEngine.init();
            
            const waitForCalendar = setInterval(async () => {
                if (window.FullCalendar) {
                    clearInterval(waitForCalendar);
                    await DataEngine.fetchData();
                  await DataEngine.fetchQuotes();
                    CalendarEngine.init();
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
