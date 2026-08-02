(() => {
    "use strict";

    // ==========================================
    // 1. ΡΥΘΜΙΣΕΙΣ (CONFIG) & ΔΕΔΟΜΕΝΑ
    // ==========================================
    const CONFIG = Object.freeze({
        // ΒΑΛΕ ΕΔΩ ΤΟ CDN LINK ΤΟΥ ΝΕΟΥ ΣΟΥ JSON (π.χ. https://cdn.jsdelivr.net/gh/...)
        jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/questionsDbpc1.json" 
    });

    // Εδώ θα αποθηκευτούν δυναμικά οι ερωτήσεις μόλις κατέβουν
    let QUESTIONS_DB = []; 

    // ==========================================
    // 2. DOM & UTILS
    // ==========================================
    const DOM = {
        display: document.getElementById("question-display"),
        feedback: document.getElementById("quiz-feedback"),
        iconSpan: document.getElementById("q-icon"),
        expBox: document.getElementById("explanation-box"),
        expText: document.getElementById("explanation-text"),
        btnRow: document.getElementById("action-buttons"),
        stats: document.getElementById("quiz-stats"),
        qContainer: document.getElementById("question-container")
    };

    const Utils = {
        // Αλγόριθμος Fisher-Yates για ανακάτεμα
        shuffleArray: (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        }
    };

    // ==========================================
    // 3. ΛΟΓΙΚΗ ΤΟΥ ΚΟΥΙΖ (QUIZ ENGINE)
    // ==========================================
    const QuizEngine = {
        state: {
            questions: [],
            index: 0,
            score: 0,
            current: null
        },

        init: () => {
            if (QUESTIONS_DB.length === 0) return;
            QuizEngine.state.questions = Utils.shuffleArray(QUESTIONS_DB);
            QuizEngine.loadNext();
        },

        loadNext: () => {
            const s = QuizEngine.state;
            
            // Αν τελειώσουν οι ερωτήσεις, τις ανακατεύουμε ξανά από την αρχή
            if (s.index >= s.questions.length) {
                s.questions = Utils.shuffleArray(QUESTIONS_DB);
                s.index = 0;
            }

            s.current = s.questions[s.index];
            s.index++;

            DOM.display.innerHTML = s.current.text; 
            DOM.iconSpan.innerHTML = s.current.icon;
            DOM.feedback.innerHTML = ""; 
            DOM.expBox.style.display = "none"; 
            DOM.btnRow.style.display = "flex";
            DOM.stats.innerHTML = `Σκορ: <strong>${s.score}</strong>`;

            // Επαναφορά των Animations
            DOM.qContainer.classList.remove("question-anim");
            DOM.iconSpan.classList.remove("question-anim");
            void DOM.qContainer.offsetWidth; // Trigger reflow 
            DOM.qContainer.classList.add("question-anim");
            DOM.iconSpan.classList.add("question-anim");
        },

        processChoice: (userChoice) => {
            const s = QuizEngine.state;
            DOM.btnRow.style.display = "none";
            
            if (userChoice === s.current.type) { 
                s.score++; 
                DOM.feedback.innerHTML = "Σωστά! ✅"; 
                DOM.feedback.style.color = "#27ae60"; 
            } else { 
                DOM.feedback.innerHTML = "Λάθος! ❌"; 
                DOM.feedback.style.color = "#e74c3c"; 
            }
            
            DOM.expText.innerHTML = s.current.exp; 
            DOM.expBox.style.display = "block";
            DOM.stats.innerHTML = `Σκορ: <strong>${s.score}</strong>`;
        }
    };

    // ==========================================
    // 4. ΕΚΚΙΝΗΣΗ ΕΦΑΡΜΟΓΗΣ (APP)
    // ==========================================
    const App = {
        init: async () => {
            if (!DOM.display || !DOM.btnRow) return;

            // --- FETCH ΛΟΓΙΚΗ ΑΠΟ ΤΟ CDN ---
            try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Αποτυχία λήψης δεδομένων.");
                
                // ΝΕΟΣ ΚΩΔΙΚΑΣ: Διαβάζουμε το JSON και στοχεύουμε ακριβώς τον πίνακα "questionsDb"
                const fetchedData = await response.json();
                QUESTIONS_DB = fetchedData.questionsDb; 

            } catch (error) {
                console.error("Το API (Quiz) απέτυχε. Φόρτωση Fallback:", error);
                // Fallback ασφαλείας αν κοπεί το ίντερνετ
                QUESTIONS_DB = [
                    { 
                        text: "Αδυναμία φόρτωσης ερωτήσεων. Παρακαλώ ελέγξτε τη σύνδεσή σας στο διαδίκτυο.", 
                        type: "truth", 
                        icon: "⚠️", 
                        exp: "Δοκιμάστε να ανανεώσετε τη σελίδα (F5)." 
                    }
                ];
            }

            // Αφού κατέβουν τα δεδομένα, ξεκινάει η μηχανή
            QuizEngine.init();

            // --- EVENT LISTENERS ---
            DOM.btnRow.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn || !btn.dataset.choice) return;
                QuizEngine.processChoice(btn.dataset.choice);
            });

            DOM.expBox.addEventListener("click", (e) => {
                const nextBtn = e.target.closest("button");
                if (nextBtn && nextBtn.dataset.action === "next") {
                    QuizEngine.loadNext();
                }
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }

})();
