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
        tooltip: null
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
            try {
                const response = await fetch(CONFIG.feedUrl);
                const data = await response.json();
                if (data.feed?.entry) {
                    data.feed.entry.forEach(post => {
                        const dateStr = post.published.$t.split('T')[0];
                        const linkObj = post.link.find(l => l.rel === 'alternate');
                        
                        // ΠΡΟΣΘΗΚΗ: Τραβάμε τη μικρογραφία του άρθρου
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
                    const monthName = info.view.currentStart.toLocaleString('el-GR', { month: 'long', year: 'numeric' });
                    DOM.monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
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
            CalendarEngine.setupEvents();
        },
        setupEvents: () => {
            if (DOM.prevBtn) DOM.prevBtn.addEventListener('click', () => CalendarEngine.calendar.prev());
            if (DOM.nextBtn) DOM.nextBtn.addEventListener('click', () => CalendarEngine.calendar.next());
            if (!DOM.container) return;
          // --- ΠΡΟΣΘΗΚΗ ΛΕΙΤΟΥΡΓΙΑΣ SWIPE ---
            let touchstartX = 0;
            let touchendX = 0;

            const handleSwipe = () => {
                const swipeThreshold = 50; // Ελάχιστη απόσταση σε pixels για να πιάσει το swipe
                if (touchendX < touchstartX - swipeThreshold) {
                    CalendarEngine.calendar.next(); // Swipe αριστερά -> Επόμενος μήνας
                }
                if (touchendX > touchstartX + swipeThreshold) {
                    CalendarEngine.calendar.prev(); // Swipe δεξιά -> Προηγούμενος μήνας
                }
            };

            DOM.container.addEventListener('touchstart', (e) => {
                touchstartX = e.changedTouches[0].screenX;
            }, { passive: true });

            DOM.container.addEventListener('touchend', (e) => {
                touchendX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
            // --- ΤΕΛΟΣ ΠΡΟΣΘΗΚΗΣ SWIPE ---

            const handleCellInteraction = (frame, type) => {
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
