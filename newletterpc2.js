(() => {
    "use strict";

    const CONFIG = {
        storageKey: "mobi_glass_subscribed_v3", // Ίδιο κλειδί μνήμης με το κινητό!
        hideDays: 30
    };

    const DOM = {
        wrapper: document.getElementById('desk-glass-wrapper'),
        toggleBtn: document.getElementById('desk-toggle-btn'),
        formView: document.getElementById('desk-form-view'),
        scratchView: document.getElementById('desk-scratch-view'),
        
        input: document.getElementById("desk-glass-input"),
        noticeWrap: document.getElementById("desk-glass-notice-wrap"),
        submitBtn: document.getElementById("desk-glass-submit-btn"),
        icon: document.getElementById("desk-glass-icon"),
        form: document.getElementById("desk-glass-form"),

        canvas: document.getElementById("desk-scratch-canvas"),
        bgImage: document.getElementById("desk-scratch-bg"),
        postTitle: document.getElementById("desk-scratch-title-overlay"),
        postLink: document.getElementById("desk-scratch-link"),
        area: document.getElementById("desk-scratch-area")
    };

    let scratchCtx = null;
    let isDrawing = false;
    let isRevealed = false; 
    let currentView = 'form';
    let listenersAdded = false;

    const DeskWidgetManager = {
        init: () => {
            const path = window.location.pathname;
            if (path !== '/' && path !== '/index.html') return;
            if (!DOM.wrapper) return;
            DOM.wrapper.style.display = 'block';

            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                DeskWidgetManager.setView('scratch');
            } else {
                DeskWidgetManager.setView('form');
            }

            DOM.toggleBtn.addEventListener('click', () => {
                DeskWidgetManager.setView(currentView === 'form' ? 'scratch' : 'form');
            });

            DeskWidgetManager.setupForm();
        },

        setView: (view) => {
            currentView = view;
            if (view === 'scratch') {
                DOM.formView.style.display = 'none';
                DOM.scratchView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '✏️';
                DOM.toggleBtn.title = 'Εγγραφή στα νέα / Επεξεργασία';
                
                if (isRevealed || !scratchCtx) {
                    DeskScratchManager.initCanvas();
                    DeskScratchManager.fetchPost();
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
                DOM.noticeWrap?.classList.add("desk-open");
            }, { once: true });

            DOM.input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) DOM.submitBtn?.removeAttribute("disabled");
                else DOM.submitBtn?.setAttribute("disabled", "true");
            });

            DOM.form?.addEventListener("submit", () => {
                if (DOM.icon) {
                    DOM.icon.innerHTML = "✈️";
                    DOM.icon.classList.add("desk-fly-away");
                }
                if (DOM.submitBtn) {
                    DOM.submitBtn.innerHTML = "Στάλθηκε! 🚀";
                    DOM.submitBtn.style.background = "linear-gradient(135deg, #27ae60, #2ecc71)"; 
                }

                const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());

                setTimeout(() => {
                    if (DOM.icon) {
                        DOM.icon.innerHTML = "✉️";
                        DOM.icon.classList.remove("desk-fly-away");
                    }
                    if (DOM.submitBtn) {
                        DOM.submitBtn.innerHTML = 'Εγγραφή <span id="desk-glass-arrow">➔</span>';
                        DOM.submitBtn.style.background = "linear-gradient(135deg, #3498db, #2980b9)";
                    }
                    DOM.input.value = "";
                    DOM.submitBtn.setAttribute("disabled", "true");

                    DeskWidgetManager.setView('scratch');
                }, 2000);
            });
        }
    };

    const DeskScratchManager = {
        initCanvas: () => {
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
                
                const gradient = scratchCtx.createLinearGradient(0, 0, DOM.canvas.width, DOM.canvas.height);
                gradient.addColorStop(0, '#bdc3c7');
                gradient.addColorStop(0.5, '#e0e0e0');
                gradient.addColorStop(1, '#95a5a6');
                scratchCtx.fillStyle = gradient;
                scratchCtx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
                
                for (let i = 0; i < 1500; i++) {
                    scratchCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)';
                    scratchCtx.fillRect(Math.random() * DOM.canvas.width, Math.random() * DOM.canvas.height, 2, 2);
                }
                
                scratchCtx.fillStyle = '#444';
                scratchCtx.font = 'bold 30px sans-serif';
                scratchCtx.textAlign = 'center';
                scratchCtx.textBaseline = 'middle';
                scratchCtx.fillText('\u2728 ΞΥΣΕ ΕΔΩ \u2728', DOM.canvas.width / 2, DOM.canvas.height / 2);

                scratchCtx.globalCompositeOperation = 'destination-out';
                scratchCtx.lineJoin = 'round';
                scratchCtx.lineCap = 'round';
                
                // ΠΙΟ ΠΑΧΥ ΠΙΝΕΛΟ ΓΙΑ ΤΟ ΠΟΝΤΙΚΙ (Desktop)
                scratchCtx.lineWidth = 50; 

                if (!listenersAdded) {
                    DOM.canvas.addEventListener('mousedown', DeskScratchManager.startDraw);
                    DOM.canvas.addEventListener('touchstart', DeskScratchManager.startDraw, { passive: false }); 
                    
                    window.addEventListener('mouseup', DeskScratchManager.stopDraw);
                    window.addEventListener('touchend', DeskScratchManager.stopDraw);
                    
                    DOM.canvas.addEventListener('mousemove', DeskScratchManager.draw);
                    DOM.canvas.addEventListener('touchmove', DeskScratchManager.draw, { passive: false });
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
            if (e.cancelable) e.preventDefault(); 
            isDrawing = true;
            const pos = DeskScratchManager.getMousePos(e);
            scratchCtx.beginPath();
            scratchCtx.moveTo(pos.x, pos.y);
            scratchCtx.lineTo(pos.x + 1, pos.y + 1);
            scratchCtx.stroke();
        },

        stopDraw: () => { 
            isDrawing = false; 
            DeskScratchManager.checkReveal();
        },

        draw: (e) => {
            if (!isDrawing || isRevealed) return;
            if (e.cancelable) e.preventDefault(); 
            const pos = DeskScratchManager.getMousePos(e);
            scratchCtx.lineTo(pos.x, pos.y);
            scratchCtx.stroke();
            
            if (Math.random() < 0.1) DeskScratchManager.checkReveal();
        },

        checkReveal: () => {
            if (isRevealed || !scratchCtx) return;
            const pixels = scratchCtx.getImageData(0, 0, DOM.canvas.width, DOM.canvas.height).data;
            let clearPixels = 0;
            
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) clearPixels++;
            }
            
            const totalToCheck = pixels.length / 16;
            
            if ((clearPixels / totalToCheck) * 100 > 80) {
                isRevealed = true;
                DOM.canvas.style.transition = 'opacity 0.6s ease';
                DOM.canvas.style.opacity = '0';
                DOM.postTitle.style.opacity = "1"; 
                setTimeout(() => DOM.canvas.style.display = 'none', 600);
            }
        },

        fetchPost: () => {
            DOM.postTitle.innerHTML = "Φόρτωση δράσης... 🔍";
            DOM.bgImage.style.backgroundImage = "none";
            DOM.postLink.href = "#";

            fetch('/feeds/posts/summary?q=δράσεις&alt=json&max-results=500')
                .then(r => r.json())
                .then(data => {
                    const entries = data.feed?.entry || [];
                    
                    const actionPosts = entries.filter(entry => {
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
                        } else if (randomPost.summary?.$t) {
                             const imgMatch = randomPost.summary.$t.match(/<img[^>]+src="([^">]+)"/);
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
                })
                .catch(err => {
                    console.error("Blogger API Error:", err);
                    DOM.postTitle.innerHTML = "Σφάλμα φόρτωσης.";
                });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', DeskWidgetManager.init);
    } else {
        DeskWidgetManager.init();
    }
})();
