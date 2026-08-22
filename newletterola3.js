(() => {
    "use strict";

    const CONFIG = {
        storageKey: "mobi_glass_subscribed_v3", 
        hideDays: 30
    };

    // 1. Δημιουργούμε τη συνάρτηση που δέχεται το πρόθεμα ('mobi' ή 'desk')
    function initWidget(prefix) {
        
        // 2. Κάνουμε τα IDs δυναμικά βάζοντας το prefix μπροστά
        const DOM = {
            wrapper: document.getElementById(`${prefix}-glass-wrapper`),
            toggleBtn: document.getElementById(`${prefix}-toggle-btn`),
            formView: document.getElementById(`${prefix}-form-view`),
            scratchView: document.getElementById(`${prefix}-scratch-view`),
            
            input: document.getElementById(`${prefix}-glass-input`),
            noticeWrap: document.getElementById(`${prefix}-glass-notice-wrap`),
            submitBtn: document.getElementById(`${prefix}-glass-submit-btn`),
            icon: document.getElementById(`${prefix}-glass-icon`),
            form: document.getElementById(`${prefix}-glass-form`),

            canvas: document.getElementById(`${prefix}-scratch-canvas`),
            bgImage: document.getElementById(`${prefix}-scratch-bg`),
            postTitle: document.getElementById(`${prefix}-scratch-title-overlay`),
            postLink: document.getElementById(`${prefix}-scratch-link`),
            area: document.getElementById(`${prefix}-scratch-area`)
        };

        // 3. Αν δεν βρει το HTML του συγκεκριμένου widget στη σελίδα, σταματάει
        if (!DOM.wrapper) return;

        // 4. Όλες οι μεταβλητές μπαίνουν ΕΔΩ ΜΕΣΑ, ώστε το κάθε widget να έχει τις δικές του!
        let scratchCtx = null;
        let isDrawing = false;
        let isRevealed = false; 
        let currentView = 'form';
        let listenersAdded = false;

        const WidgetManager = {
        init: () => {
            const path = window.location.pathname;
            if (path !== '/' && path !== '/index.html') return;
            if (!DOM.wrapper) return;
            DOM.wrapper.style.display = 'block';

            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            
            // Αν είναι γραμμένος βλέπει κατευθείαν το Ξυστό!
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                WidgetManager.setView('scratch');
            } else {
                WidgetManager.setView('form');
            }

            DOM.toggleBtn.addEventListener('click', () => {
                WidgetManager.setView(currentView === 'form' ? 'scratch' : 'form');
            });

            WidgetManager.setupForm();
        },

        setView: (view) => {
            currentView = view;
            if (view === 'scratch') {
                DOM.formView.style.display = 'none';
                DOM.scratchView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '✏️';
                DOM.toggleBtn.title = 'Εγγραφή στα νέα / Επεξεργασία';
                
                // Φορτώνει νέο Ξυστό αν το προηγούμενο έχει αποκαλυφθεί
                if (isRevealed || !scratchCtx) {
                    ScratchManager.initCanvas();
                    ScratchManager.fetchPost();
                }
            } else {
                DOM.scratchView.style.display = 'none';
                DOM.formView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '🎁';
                DOM.toggleBtn.title = 'Παίξε το Ξυστό!';
            }
        },

        setupForm: () => {
          DOM.input?.addEventListener("focus", () => {
                DOM.noticeWrap?.classList.add(`${prefix}-open`); // Δυναμικό Class
            }, { once: true });

            DOM.input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) DOM.submitBtn?.removeAttribute("disabled");
                else DOM.submitBtn?.setAttribute("disabled", "true");
            });

         DOM.form?.addEventListener("submit", (e) => {
                e.preventDefault(); // ΚΡΙΣΙΜΟ: Σταματάει την αυτόματη ανανέωση της σελίδας!
                
                // Η δόνηση λειτουργεί ΜΟΝΟ αν το prefix είναι 'mobi'
                if (prefix === 'mobi' && navigator.vibrate) navigator.vibrate([50,50,50]);
                
                if (DOM.icon) {
                    DOM.icon.innerHTML = "✈️";
                    DOM.icon.classList.add(`${prefix}-fly-away`); // Δυναμικό Class
                }

                const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());

                setTimeout(() => {
                   if (DOM.icon) {
                        DOM.icon.innerHTML = "✉️";
                        DOM.icon.classList.remove(`${prefix}-fly-away`); // Δυναμικό Class
                    }
                    if (DOM.submitBtn) {
                        // Δυναμικό ID στο βελάκι
                        DOM.submitBtn.innerHTML = `Εγγραφή <span id="${prefix}-glass-arrow">➔</span>`;
                    }
                    DOM.input.value = "";
                    DOM.submitBtn.setAttribute("disabled", "true");

                    WidgetManager.setView('scratch');
                }, 2000);
            });
        }
    };

    const ScratchManager = {
        initCanvas: () => {
            // Μικρή καθυστέρηση για να ανοίξει σωστά το block πριν πάρει διαστάσεις
            setTimeout(() => {
                if(!DOM.canvas || !DOM.area) return;
                
                DOM.canvas.style.display = 'block';
                DOM.canvas.style.opacity = '1';
                DOM.postTitle.style.opacity = "0";
                isRevealed = false;

                const rect = DOM.area.getBoundingClientRect();
                DOM.canvas.width = rect.width;
                DOM.canvas.height = rect.height;
                
                scratchCtx = DOM.canvas.getContext('2d', { willReadFrequently: true });
                
                // Ασημένιο γέμισμα λαχνού
                const gradient = scratchCtx.createLinearGradient(0, 0, DOM.canvas.width, DOM.canvas.height);
                gradient.addColorStop(0, '#bdc3c7');
                gradient.addColorStop(0.5, '#e0e0e0');
                gradient.addColorStop(1, '#95a5a6');
                scratchCtx.fillStyle = gradient;
                scratchCtx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
                
                // Υφή Ξυστού (κουκκίδες)
                for (let i = 0; i < 1500; i++) {
                    scratchCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)';
                    scratchCtx.fillRect(Math.random() * DOM.canvas.width, Math.random() * DOM.canvas.height, 2, 2);
                }
                
                // Κείμενο
                scratchCtx.fillStyle = '#444';
                scratchCtx.font = 'bold 28px sans-serif';
                scratchCtx.textAlign = 'center';
                scratchCtx.textBaseline = 'middle';
                scratchCtx.fillText('\u2728 ΞΥΣΕ ΕΔΩ \u2728', DOM.canvas.width / 2, DOM.canvas.height / 2);

              // Ρυθμίσεις Γόμας
                scratchCtx.globalCompositeOperation = 'destination-out';
                scratchCtx.lineJoin = 'round';
                scratchCtx.lineCap = 'round';
                // Αν είναι desk βάζει 50, αλλιώς 40
                scratchCtx.lineWidth = prefix === 'desk' ? 50 : 40;

                // Βάζουμε τα events μόνο την πρώτη φορά!
                if (!listenersAdded) {
                    DOM.canvas.addEventListener('mousedown', ScratchManager.startDraw);
                    DOM.canvas.addEventListener('touchstart', ScratchManager.startDraw, { passive: false }); // SOS για κινητά
                    
                    window.addEventListener('mouseup', ScratchManager.stopDraw);
                    window.addEventListener('touchend', ScratchManager.stopDraw);
                    
                    DOM.canvas.addEventListener('mousemove', ScratchManager.draw);
                    DOM.canvas.addEventListener('touchmove', ScratchManager.draw, { passive: false });
                    listenersAdded = true;
                }
            }, 50);
        },

        getMousePos: (evt) => {
            const rect = DOM.canvas.getBoundingClientRect();
            let clientX, clientY;
            if (evt.touches) {
                clientX = evt.touches[0].clientX;
                clientY = evt.touches[0].clientY;
            } else {
                clientX = evt.clientX;
                clientY = evt.clientY;
            }
            return { x: clientX - rect.left, y: clientY - rect.top };
        },

        startDraw: (e) => {
            if (isRevealed) return;
            if (e.cancelable) e.preventDefault(); // Κλειδώνει το σκρολάρισμα
            isDrawing = true;
            const pos = ScratchManager.getMousePos(e);
            scratchCtx.beginPath();
            scratchCtx.moveTo(pos.x, pos.y);
            // Σβήνει και με ένα απλό πάτημα (touch tap)
            scratchCtx.lineTo(pos.x + 1, pos.y + 1);
            scratchCtx.stroke();
        },

       stopDraw: () => { 
            if (!isDrawing) return; // Σταματάει την εκτέλεση αν ο χρήστης δεν ακούμπησε ΑΥΤΟΝ τον καμβά
            isDrawing = false; 
            ScratchManager.checkReveal();
        },

        draw: (e) => {
            if (!isDrawing || isRevealed) return;
            if (e.cancelable) e.preventDefault(); 
            const pos = ScratchManager.getMousePos(e);
            scratchCtx.lineTo(pos.x, pos.y);
            scratchCtx.stroke();
            
            // Ελέγχουμε κάθε τόσο αν ξύστηκε αρκετά
            if (Math.random() < 0.1) ScratchManager.checkReveal();
        },

    checkReveal: () => {
            // Προσθήκη ελέγχου διαστάσεων για αποφυγή IndexSizeError
            if (isRevealed || !scratchCtx || DOM.canvas.width === 0 || DOM.canvas.height === 0) return;
            const pixels = scratchCtx.getImageData(0, 0, DOM.canvas.width, DOM.canvas.height).data;
            let clearPixels = 0;
            
            // Ελέγχουμε 1 στα 16 pixels (ελαφρύτερο για τη μνήμη του κινητού)
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) clearPixels++;
            }
            
            const totalToCheck = pixels.length / 16;
            
            // Αν έχει ξύσει περίπου το 40%, η εικόνα αποκαλύπτεται ολόκληρη μόνη της!
            if ((clearPixels / totalToCheck) * 100 > 80) {
                isRevealed = true;
                DOM.canvas.style.transition = 'opacity 0.6s ease';
                DOM.canvas.style.opacity = '0';
                DOM.postTitle.style.opacity = "1"; 
                setTimeout(() => DOM.canvas.style.display = 'none', 600);
            }
        },

        // --- Ανάκτηση δεδομένων Blogger API ---
      // --- Ανάκτηση δεδομένων Blogger API σε ΔΟΣΕΙΣ ---
        fetchPost: () => {
            DOM.postTitle.innerHTML = "Φόρτωση δράσης... 🔍";
            DOM.bgImage.style.backgroundImage = "none";
            DOM.postLink.href = "#";

            let allEntries = [];

            // 1. Αναδρομική συνάρτηση που φέρνει 250 άρθρα τη φορά
            const fetchBatch = (startIndex) => {
                fetch(`/feeds/posts/default?q=δράσεις&alt=json&max-results=250&start-index=${startIndex}`)
                    .then(r => r.json())
                    .then(data => {
                        const entries = data.feed?.entry || [];
                        allEntries = allEntries.concat(entries); // Προσθέτουμε τα νέα άρθρα στη λίστα

                        // Αν έφερε ακριβώς 250, υπάρχουν κι άλλα. Ζητάμε την επόμενη δόση!
                        if (entries.length === 250) {
                            fetchBatch(startIndex + 250);
                        } else {
                            // Αν έφερε λιγότερα (ή καθόλου), σημαίνει ότι τελειώσαμε. Προχωράμε!
                            processPosts();
                        }
                    })
                    .catch(err => {
                        console.error("Blogger API Error:", err);
                        // Αν χτυπήσει σφάλμα αλλά έχουμε ήδη φέρει κάποια άρθρα, τα δείχνουμε κανονικά
                        if (allEntries.length > 0) {
                            processPosts();
                        } else {
                            DOM.postTitle.innerHTML = "Σφάλμα φόρτωσης.";
                        }
                    });
            };

            // 2. Η επεξεργασία γίνεται ΜΟΝΟ όταν έχουν κατέβει πλέον όλα τα άρθρα
            const processPosts = () => {
                const actionPosts = allEntries.filter(entry => {
                    if (!entry.category) return false;
                    return entry.category.some(cat => {
                        const term = cat.term.toLowerCase();
                        return term.includes("δράσ") || term.includes("δρασ"); 
                    });
                });

                if (actionPosts.length > 0) {
                    const randomPost = actionPosts[Math.floor(Math.random() * actionPosts.length)];
                    DOM.postTitle.innerHTML = randomPost.title.$t || "Σχολική Δράση";

                    const linkObj = randomPost.link.find(l => l.rel === "alternate");
                    if (linkObj) DOM.postLink.href = linkObj.href;

                    let imgUrl = "";
                    if (randomPost.media$thumbnail?.url) {
                        imgUrl = randomPost.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?/, "/s600");
                    } else if (randomPost.content?.$t) { 
                        const imgMatch = randomPost.content.$t.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) imgUrl = imgMatch[1];
                    }

                    if (imgUrl) {
                        DOM.bgImage.style.backgroundImage = `url('${imgUrl}')`;
                    } else {
                        DOM.bgImage.style.backgroundColor = '#34495e';
                    }
                } else {
                    DOM.postTitle.innerHTML = "Δεν βρέθηκαν δράσεις!";
                    DOM.bgImage.style.backgroundColor = '#27ae60';
                }
            };

            // 3. Ξεκινάμε ζητώντας την 1η δόση, αρχίζοντας από το 1ο άρθρο
            fetchBatch(1);
        }
    }; // <-- Εδώ κλείνει το ScratchManager

        // Τρέχουμε την αρχικοποίηση του συγκεκριμένου widget!
        WidgetManager.init();

    } // <-- ΕΔΩ ΚΛΕΙΝΕΙ Η function initWidget(prefix) { ΠΟΥ ΑΝΟΙΞΑΜΕ ΣΤΟ ΒΗΜΑ 1

    // Φτιάχνουμε μια συνάρτηση που τρέχει και τα δύο (κινητό και υπολογιστή)
    function startWidgets() {
        initWidget('mobi');
        initWidget('desk');
    }

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', startWidgets);
    } else {
        startWidgets();
    }
})();
