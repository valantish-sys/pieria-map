(() => {
    "use strict";

    const CONFIG = Object.freeze({
        storageKey: "newsletter_subscribed",
        hideDays: 30, // Πόσες μέρες θα θυμάται την εγγραφή το κινητό
        popAt: 4      // Στο 4ο κλικ το μπαλόνι σκάει
    });

    // Τα 20 Θετικά Μηνύματα
    const MESSAGES = [
        "Είσαι φανταστικός! 🌟", "Τέλεια μέρα! ☀️", "Σούπερ! 🚀", 
        "Μπράβο σου! 👏", "Καταπληκτικά! 🎉", "Είσαι αστέρι! ⭐", 
        "Χαμογέλα! 😁", "Υπέροχα! 🌈", "Είσαι ήρωας! 🦸‍♂️", 
        "Μαγικό! 🪄", "Μοναδικός! 🦄", "Έσκισες! ⚡", 
        "Συνέχισε έτσι! 💪", "Πανέξυπνο! 🧠", "Απίθανο! 🏆", 
        "Δώσε 5! ✋", "Τρομερό! 💥", "Είσαι κορυφή! 🥇", 
        "Ασυναγώνιστος! 🦁", "Τέλεια βολή! 🎯"
    ];

    let balloonClicks = 0;
    let isFlipped = false;

    const WidgetManager = {
        init: () => {
            const path = window.location.pathname;
            if (path !== '/' && path !== '/index.html') return;

            const wrapper = document.getElementById('mobile-newsletter-wrapper');
            if (!wrapper) return;

            wrapper.classList.add('show-on-home');

            const hideUntil = localStorage.getItem(CONFIG.storageKey);
            const now = new Date().getTime();
            
            // Αν ΕΧΕΙ κάνει εγγραφή, γυρνάμε αυτόματα την κάρτα στο Μπαλόνι
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                WidgetManager.flipCard(true);
            } else {
                WidgetManager.flipCard(false);
            }

            WidgetManager.setupToggle();
            WidgetManager.setupNewsletter();
            WidgetManager.setupBalloon();
        },

        setupToggle: () => {
            const btn = document.getElementById("widget-toggle-btn");
            btn.addEventListener("click", () => {
                WidgetManager.flipCard();
            });
        },

        flipCard: (forceFlip = null) => {
            const flipper = document.getElementById("widget-flipper");
            const btn = document.getElementById("widget-toggle-btn");
            
            if (forceFlip !== null) {
                isFlipped = forceFlip;
            } else {
                isFlipped = !isFlipped;
            }

            if (isFlipped) {
                flipper.classList.add("flipped");
                btn.innerHTML = "✉️"; // Όταν παίζει δείχνει φακελάκι για επιστροφή
                btn.title = "Επιστροφή στην εγγραφή";
            } else {
                flipper.classList.remove("flipped");
                btn.innerHTML = "🎈"; // Όταν είναι στο newsletter, δείχνει μπαλόνι
                btn.title = "Παιχνίδι Μπαλονιού";
            }
        },

        setupNewsletter: () => {
            const input = document.getElementById("nl-input");
            const noticeWrapper = document.getElementById("nl-notice-wrapper");
            const submitBtn = document.getElementById("nl-submit-btn");
            const form = document.getElementById("nl-form");
            const icon = document.getElementById("nl-icon");

            input?.addEventListener("focus", () => {
                noticeWrapper?.classList.add("open");
            }, { once: true });

            input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) {
                    submitBtn?.removeAttribute("disabled");
                } else {
                    submitBtn?.setAttribute("disabled", "true");
                }
            });

            form?.addEventListener("submit", () => {
                if (icon) {
                    icon.innerHTML = "✈️";
                    icon.classList.add("fly-away");
                }
                if (submitBtn) {
                    submitBtn.innerHTML = "Στάλθηκε! 🚀";
                    submitBtn.style.backgroundColor = "#27ae60";
                }
                
                // Αποθήκευση στη μνήμη του κινητού 
                const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());

                // Το Μαγικό: Μετά από 2.5 δευτερόλεπτα η κάρτα γυρίζει ΑΥΤΟΜΑΤΑ στο Μπαλόνι!
                setTimeout(() => {
                    WidgetManager.flipCard(true);
                }, 2500);
            });
        },

        setupBalloon: () => {
            const balloon = document.getElementById("balloon-element");
            const msg = document.getElementById("balloon-msg");
            
            if(!balloon) return;

            balloon.addEventListener("click", () => {
                balloonClicks++;
                
                if (balloonClicks < CONFIG.popAt) {
                    // Φουσκώνει!
                    const scale = 1 + (balloonClicks * 0.25);
                    balloon.style.transform = `scale(${scale})`;
                } else {
                    // ΣΚΑΕΙ!
                    balloon.style.display = "none";
                    
                    WidgetManager.fireConfetti(); 
                    
                    // Διάλεξε 1 τυχαίο από τα 20 μηνύματα
                    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
                    msg.innerText = randomMsg;
                    msg.style.display = "block";

                    // Επαναφορά του μπαλονιού μετά από 4 δευτερόλεπτα
                    setTimeout(() => {
                        balloonClicks = 0;
                        balloon.style.transform = "scale(1)";
                        balloon.style.display = "block";
                        msg.style.display = "none";
                        document.getElementById("confetti-area").innerHTML = ""; 
                    }, 4000);
                }
            });
        },

        fireConfetti: () => {
            const area = document.getElementById("confetti-area");
            const colors = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#ff69b4"];
            
            for (let i = 0; i < 40; i++) {
                const conf = document.createElement("div");
                conf.classList.add("confetti");
                conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Υπολογισμός τυχαίας έκρηξης 360 μοιρών
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 80 + 40; 
                const tx = Math.cos(angle) * distance + "px";
                const ty = Math.sin(angle) * distance + "px";
                
                conf.style.setProperty("--tx", tx);
                conf.style.setProperty("--ty", ty);
                
                area.appendChild(conf);
            }
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', WidgetManager.init);
    } else {
        WidgetManager.init();
    }
})();
