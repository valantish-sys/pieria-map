(() => {
    "use strict";

    const CONFIG = Object.freeze({
        feedUrl: 'https://dimperist.blogspot.com/feeds/posts/default?alt=json&max-results=500',
        tooltipDelay: 200,
        quotesJsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/hmeroquotes1.json'
    });

    const DOM = {
        calendarEl: document.getElementById('calendar'),
        container: document.getElementById('calendar-container'),
        monthLabel: document.getElementById('monthLabel'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        overlay: null,
        tooltip: null,
      yearOverlay: null,
        diceBtn: null,
        todayBtn: null
    };

    const Utils = {
        cleanTitle: (rawStr) => {
            if (!rawStr) return 'Χωρίς τίτλο';
            return rawStr
                .replace(/&laquo;|&#171;|\u00C2\u00AB|\u00A4\u00C3/g, '«')
                .replace(/&raquo;|&#187;|\u00C2\u00BB|\u00A5\u00C3/g, '»')
                .replace(/&ldquo;|&rdquo;|&#8220;|&#8221;|&quot;/g, '"')
                .replace(/&lsquo;|&rsquo;|&#8216;|&#8217;|&#39;/g, "'")
                .replace(/&#183;|&middot;/g, '·')
                .replace(/&ndash;|&#8211;/g, '-')
                .replace(/&mdash;|&#8212;/g, '—')
                .replace(/&amp;/g, '&')
                .replace(/&nbsp;/g, ' ')
                .trim();
        },
       getQuote: () => {
            // 1. Ασφάλεια: Αν το ίντερνετ πέσει ή το JSON λείπει
            if (!DataEngine.quotesArray || DataEngine.quotesArray.length === 0) {
                return "Μια υπέροχη μέρα σε περιμένει!";
            }

            // 2. Η κανονική λογική
            let used = [];
            try { used = JSON.parse(localStorage.getItem('usedQuotes')) || []; } catch(e) {}
            
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
        quotesArray: [], // Αποθηκεύει τα δεδομένα από το JSON
       fetchData: async () => {
            let startIndex = 1;
            const maxResults = 150; // Μικρές, ελαφριές παρτίδες
            let hasMore = true;
            
            // Μετατρέπουμε αυτόματα το link του CONFIG σε 'summary' για να μην "κρασάρει" το Blogger
            let baseUrl = CONFIG.feedUrl.split('?')[0].replace('/default', '/summary');

            while (hasMore) {
                try {
                    const currentUrl = `${baseUrl}?alt=json&max-results=${maxResults}&start-index=${startIndex}`;
                    const response = await fetch(currentUrl);
                    const data = await response.json();

                    if (data.feed?.entry && data.feed.entry.length > 0) {
                        data.feed.entry.forEach(post => {
                            const dateStr = post.published.$t.split('T')[0];
                            const linkObj = post.link.find(l => l.rel === 'alternate');
                            
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
                        
                        // Αν φέρει λιγότερα από 150 άρθρα, φτάσαμε στην αρχή του blog
                        if (data.feed.entry.length < maxResults) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false; 
                    }
                } catch (e) {
                    console.warn("Σφάλμα φόρτωσης feed (PC):", e);
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

    const UIEngine = {
        hideTimeout: null,
        currentHoveredFrame: null,
        init: () => {
            if (document.getElementById('calendar-overlay')) return; 
            DOM.overlay = document.createElement('div');
            DOM.overlay.id = 'calendar-overlay';
            document.body.appendChild(DOM.overlay);

            DOM.tooltip = document.createElement('div');
            DOM.tooltip.id = 'calendar-tooltip';
            document.body.appendChild(DOM.tooltip);

            DOM.overlay.addEventListener('click', UIEngine.closeTooltip);
            DOM.tooltip.addEventListener('mouseenter', () => clearTimeout(UIEngine.hideTimeout));
            DOM.tooltip.addEventListener('mouseleave', () => { 
                UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
            });
        },
       showTooltip: (cellFrame, posts, isModal) => {
            clearTimeout(UIEngine.hideTimeout);
            DOM.tooltip.innerHTML = '';
            
            // Κοντέινερ με scrollbar και Flexbox για ομορφιά
            const listContainer = document.createElement('div');
            listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding: 5px;';

            posts.forEach(p => {
                let a = document.createElement('a');
                a.href = p.url;
                a.className = 'tooltip-title-link';
                // Στυλ Flexbox: εικόνα και κείμενο δίπλα-δίπλα
                a.style.cssText = 'display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 8px; border-radius: 8px; background: rgba(0,0,0,0.02); color: #333; transition: background 0.2s, transform 0.2s;';
                
                // Hover effect για τα άρθρα (ειδικά για το PC)
                a.onmouseover = function() { 
                    this.style.background = 'rgba(0,0,0,0.06)'; 
                    this.style.transform = 'translateY(-2px)'; 
                };
                a.onmouseout = function() { 
                    this.style.background = 'rgba(0,0,0,0.02)'; 
                    this.style.transform = 'translateY(0)';
                };

                let iconHtml = '';
                if (p.thumbnail) {
                    iconHtml = `<img src="${p.thumbnail}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
                } else if (p.url === 'javascript:void(0);') {
                    // Θετικό μήνυμα
                    iconHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #fff3cd; border-radius: 8px; font-size: 24px; flex-shrink: 0;">✨</div>`;
                } else {
                    // Άρθρο χωρίς εικόνα
                    iconHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #e9ecef; border-radius: 8px; font-size: 20px; flex-shrink: 0;">📝</div>`;
                }

                a.innerHTML = `${iconHtml}<span style="font-size: 14px; font-weight: 600; line-height: 1.3;">${p.title}</span>`;
                listContainer.appendChild(a);
            });

            DOM.tooltip.appendChild(listContainer);
            DOM.tooltip.style.display = 'block';
            DOM.tooltip.style.visibility = 'hidden';

            // Σταθερό στυλ Tooltip για να υπολογίζεται σωστά το κέντρο στο hover
            const tooltipStyle = `width: 320px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);`;

            if (isModal) {
                // Όταν κάνει ΚΛΙΚ το ανοίγεις Modal (στο κέντρο)
                DOM.overlay.style.display = 'block';
                DOM.tooltip.style.cssText = `display: block; visibility: visible; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; z-index: 10000; ${tooltipStyle}`;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    DOM.overlay.style.opacity = '1';
                    DOM.tooltip.style.opacity = '1';
                    DOM.tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
                }));
            } else {
                // Όταν κάνει HOVER το ανοίγεις δίπλα στο κουτάκι της ημέρας
                // Εφαρμόζουμε κρυφά τα στυλ για να πάρουμε το σωστό ύψος
                DOM.tooltip.style.cssText = `display: block; visibility: hidden; position: absolute; z-index: 9999; ${tooltipStyle}`;
                const rect = cellFrame.getBoundingClientRect();
                const topPos = rect.top + window.scrollY - DOM.tooltip.offsetHeight + 10;
                const leftPos = rect.left + window.scrollX + (rect.width / 2) - (DOM.tooltip.offsetWidth / 2);
                
                // Εφαρμογή της τελικής θέσης
                DOM.tooltip.style.cssText = `display: block; visibility: visible; position: absolute; transform: none; opacity: 0; z-index: 9999; top: ${topPos}px; left: ${leftPos}px; ${tooltipStyle}`;
                
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    DOM.tooltip.style.opacity = '1';
                }));
            }
        },
        closeTooltip: () => {
            UIEngine.currentHoveredFrame = null;
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
    // 🔥 ADVANCED ENGINE (PC Edition - Zoom, Ρουλέτα & Μαγνήτης)
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
            DOM.monthLabel.title = 'Προβολή Έτους';

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

            // Events (Χωρίς δονήσεις στο PC)
            DOM.diceBtn.addEventListener('click', AdvancedEngine.playRoulette);
            DOM.monthLabel.addEventListener('click', () => {
                if (!AdvancedEngine.isSpinning) AdvancedEngine.toggleYearView();
            });
            DOM.todayBtn.addEventListener('click', () => {
                if (AdvancedEngine.isSpinning) return;
                CalendarEngine.calendar.today();
                if (AdvancedEngine.isYearView) AdvancedEngine.toggleYearView();
            });

            // Ενεργοποίηση του Μαγνήτη για το ποντίκι!
            AdvancedEngine.setupMagneticDots();
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
          AdvancedEngine.currentYearView = year;
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
                e.stopPropagation(); AdvancedEngine.renderYearView(year - 1);
            });
            document.getElementById('nextYearBtn').addEventListener('click', (e) => {
                e.stopPropagation(); AdvancedEngine.renderYearView(year + 1);
            });

            DOM.yearOverlay.querySelectorAll('.year-month-box').forEach(box => {
                box.addEventListener('click', () => {
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

                if (spins >= maxSpins) {
                    clearInterval(spinInterval);
                    CalendarEngine.calendar.gotoDate(targetDate);
                    DOM.calendarEl.classList.remove('roulette-blur');
                    DOM.diceBtn.classList.remove('spinning');
                    
                    setTimeout(() => {
                        AdvancedEngine.isSpinning = false;
                        const cell = DOM.calendarEl.querySelector(`.fc-day[data-date="${targetDateStr}"] .fc-daygrid-day-frame`);
                        if (cell) UIEngine.showTooltip(cell, DataEngine.postsByDate[targetDateStr], true);
                    }, 400); 
                }
            }, 120);
        },

        setupMagneticDots: () => {
            DOM.container.addEventListener('mousemove', (e) => {
                if (AdvancedEngine.isSpinning || AdvancedEngine.isYearView) return;
                const frame = e.target.closest('.fc-daygrid-day-frame.has-posts');
                
                // Καθαρισμός προηγούμενων
                document.querySelectorAll('.post-dot').forEach(dot => {
                    if (frame && frame.contains(dot)) return;
                    dot.style.transform = '';
                    dot.style.background = '';
                    dot.style.boxShadow = '';
                });

                if (frame) {
                    const dot = frame.querySelector('.post-dot');
                    if (dot) {
                        const rect = frame.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        
                        const dx = e.clientX - centerX;
                        const dy = e.clientY - centerY;

                        // 30% δύναμη έλξης προς το ποντίκι
                        const moveX = dx * 0.3;
                        const moveY = dy * 0.3;
                        
                        dot.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.4)`;
                        dot.style.background = '#4A90E2';
                        dot.style.boxShadow = '0 0 10px 3px rgba(74, 144, 226, 0.6)';
                    }
                }
            });

            DOM.container.addEventListener('mouseleave', () => {
                document.querySelectorAll('.post-dot').forEach(dot => {
                    dot.style.transform = '';
                    dot.style.background = '';
                    dot.style.boxShadow = '';
                });
            });
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
            // --- ΛΟΓΙΚΗ ANIMATION ΑΛΛΑΓΗΣ ΜΗΝΑ ---
            let isAnimating = false;

            const changeMonthAnimated = (direction) => {
                if (isAnimating || !DOM.calendarEl || (typeof AdvancedEngine !== 'undefined' && AdvancedEngine.isSpinning)) return;

                if (typeof AdvancedEngine !== 'undefined' && AdvancedEngine.isYearView) {
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

            // Σύνδεση των βελών με το animation
            if (DOM.prevBtn) DOM.prevBtn.addEventListener('click', () => changeMonthAnimated('prev'));
            if (DOM.nextBtn) DOM.nextBtn.addEventListener('click', () => changeMonthAnimated('next'));
            if (!DOM.container) return;

            // --- ΠΡΟΣΘΗΚΗ ΛΕΙΤΟΥΡΓΙΑΣ "ΕΞΥΠΝΟΥ" SWIPE (Για οθόνες αφής στο PC) ---
            let touchstartX = 0;
            let startY = 0;

            DOM.container.addEventListener('touchstart', (e) => {
                touchstartX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });

            DOM.container.addEventListener('touchend', (e) => {
                const touchendX = e.changedTouches[0].screenX;
                const diffX = touchendX - touchstartX;
                const touchstartY = e.changedTouches[0].screenY || 0;
                const diffY = e.changedTouches[0].screenY - startY;

                // Αλλαγή μήνα μόνο αν η κίνηση είναι οριζόντια και όχι κάθετη
                if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
                    if (diffX < -50) changeMonthAnimated('next');
                    else if (diffX > 50) changeMonthAnimated('prev');
                }
            }, { passive: true });
            // --- ΤΕΛΟΣ ΠΡΟΣΘΗΚΗΣ SWIPE ---
          

            // --- ΔΙΑΤΗΡΗΣΗ ΥΠΑΡΧΟΥΣΑΣ ΛΟΓΙΚΗΣ ΣΟΥ (HOVER / CLICK) ---
            const handleCellInteraction = (frame, type) => {
              if (typeof AdvancedEngine !== 'undefined' && (AdvancedEngine.isSpinning || AdvancedEngine.isYearView)) return;
                const cell = frame.closest('.fc-daygrid-day');
                if (!cell) return;
                const dateStr = cell.dataset.date;
                const todayStr = Utils.getTodayStr();
                const posts = DataEngine.postsByDate[dateStr];

                if (!posts && dateStr > todayStr) return;

                let content = posts;
                if (!posts) {
                    if (!frame.dataset.quote) frame.dataset.quote = Utils.getQuote();
                    content = [{ title: frame.dataset.quote, url: 'javascript:void(0);' }];
                }

                if (type === 'click') {
                    if (posts && posts.length === 1) window.open(posts[0].url, '_self'); 
                    else UIEngine.showTooltip(frame, content, true);
                } else if (type === 'hover') {
                    UIEngine.showTooltip(frame, content, false);
                }
            };

            DOM.container.addEventListener('click', (e) => {
                const frame = e.target.closest('.fc-daygrid-day-frame');
                if (frame) { e.preventDefault(); handleCellInteraction(frame, 'click'); }
            });

            DOM.container.addEventListener('mouseover', (e) => {
                const frame = e.target.closest('.fc-daygrid-day-frame');
                if (frame) {
                    clearTimeout(UIEngine.hideTimeout); 
                    if (frame !== UIEngine.currentHoveredFrame) {
                        UIEngine.currentHoveredFrame = frame;
                        handleCellInteraction(frame, 'hover');
                    }
                }
            });

            DOM.container.addEventListener('mouseout', (e) => {
                const frame = e.target.closest('.fc-daygrid-day-frame');
                const toTooltip = DOM.tooltip && DOM.tooltip.contains(e.relatedTarget);
                if (frame && !frame.contains(e.relatedTarget) && !toTooltip) {
                    UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
                }
            });
        }
    };

    const AppController = {
        init: () => {
            UIEngine.init();
            
            // Περιμένει το global script του FullCalendar να φορτώσει
            const waitForCalendar = setInterval(async () => {
                if (window.FullCalendar) {
                    clearInterval(waitForCalendar);
                  await DataEngine.fetchQuotes();
                    await DataEngine.fetchData();
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
