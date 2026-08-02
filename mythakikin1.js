(() => {
    "use strict";
const CONFIG = Object.freeze({
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/questionsDbpc2.json' // <-- Πρόσθεσε εδώ το link σου!
    });

    // Στοχεύει τα νέα "-mobile" IDs
    const DOM = {
        display: document.getElementById("question-display-mobile"),
        feedback: document.getElementById("quiz-feedback-mobile"),
        iconSpan: document.getElementById("q-icon-mobile"),
        expBox: document.getElementById("explanation-box-mobile"),
        expText: document.getElementById("explanation-text-mobile"),
        btnRow: document.getElementById("action-buttons-mobile"),
        stats: document.getElementById("quiz-stats-mobile"),
        qContainer: document.getElementById("question-container-mobile")
    };
const DataEngine = {
        questionsArray: [],
        fetchQuestions: async () => {
            try {
                const response = await fetch(CONFIG.jsonUrl);
                const data = await response.json();
                DataEngine.questionsArray = data.questionsDb || [];
            } catch (e) {
                console.warn("Το JSON με τις ερωτήσεις δεν φόρτωσε.");
                DataEngine.questionsArray = [
                    { text: "Οι καμήλες αποθηκεύουν νερό...", type: "myth", icon: "🐪", exp: "Αποθηκεύουν λίπος!" }
                ];
            }
        }
    };
    const Utils = {
        shuffleArray: (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        }
    };

    const MobileQuizEngine = {
        state: {
            questions: [],
            index: 0,
            score: 0,
            current: null
        },

       init: () => {
            if (DataEngine.questionsArray.length === 0) return;
            MobileQuizEngine.state.questions = Utils.shuffleArray(DataEngine.questionsArray);
            MobileQuizEngine.loadNext();
        },

        loadNext: () => {
            const s = MobileQuizEngine.state;
            
            if (s.index >= s.questions.length) {
                s.questions = Utils.shuffleArray(DataEngine.questionsArray);
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

            DOM.qContainer.classList.remove("question-anim");
            DOM.iconSpan.classList.remove("question-anim");
            void DOM.qContainer.offsetWidth; 
            DOM.qContainer.classList.add("question-anim");
            DOM.iconSpan.classList.add("question-anim");
        },

        processChoice: (userChoice) => {
            const s = MobileQuizEngine.state;
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

    const MobileApp = {
        init: async () => { // <--- Έγινε async
            if (!DOM.display || !DOM.btnRow) return;

            // --- ΚΑΤΕΒΑΖΕΙ ΤΙΣ ΕΡΩΤΗΣΕΙΣ ΑΠΟ ΤΟ JSON ---
            await DataEngine.fetchQuestions();

            MobileQuizEngine.init();

            DOM.btnRow.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn || !btn.dataset.choice) return;
                MobileQuizEngine.processChoice(btn.dataset.choice);
            });

            DOM.expBox.addEventListener("click", (e) => {
                const nextBtn = e.target.closest("button");
                if (nextBtn && nextBtn.dataset.action === "next") {
                    MobileQuizEngine.loadNext();
                }
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }

})();
