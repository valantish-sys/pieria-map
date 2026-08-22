(() => {
    "use strict";
const CONFIG = Object.freeze({
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/questionsDbpc2.json' // <-- Πρόσθεσε εδώ το link σου!
    });

   
const DataEngine = {
        questionsArray: [],
        fetchQuestions: async () => {
              try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Αποτυχία λήψης δεδομένων.");
                const data = await response.json();
                
                DataEngine.questionsArray = data.questionsDb || [];
                
                // ΔΙΟΡΘΩΣΗ: Προστασία από άδειο array ή λάθος όνομα κλειδιού στο JSON
                if (DataEngine.questionsArray.length === 0) {
                    throw new Error("Το JSON είναι άδειο ή δομικά μη έγκυρο.");
                }
            } catch (error) {
                console.error("Το API (Quiz) απέτυχε. Φόρτωση Fallback:", error);
               DataEngine.questionsArray = [
                    { 
                        text: "Αδυναμία φόρτωσης ερωτήσεων. Παρακαλώ ελέγξτε τη σύνδεσή σας στο διαδίκτυο.", 
                        type: "error", // Αλλάζουμε τον τύπο 
                        icon: "⚠️", 
                        exp: "Δοκιμάστε να ανανεώσετε τη σελίδα (F5).",
                        isError: true // ΔΙΟΡΘΩΣΗ: Προσθήκη flag για να το αναγνωρίζει το UI ως σφάλμα
                    }
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

   // 2. Η Έξυπνη Μηχανή (Δημιουργεί ανεξάρτητο Quiz για PC και Κινητό)
    const initQuizWidget = (suffix) => {
        const localDOM = {
            display: document.getElementById(`question-display${suffix}`),
            feedback: document.getElementById(`quiz-feedback${suffix}`),
            iconSpan: document.getElementById(`q-icon${suffix}`),
            expBox: document.getElementById(`explanation-box${suffix}`),
            expText: document.getElementById(`explanation-text${suffix}`),
            btnRow: document.getElementById(`action-buttons${suffix}`),
            stats: document.getElementById(`quiz-stats${suffix}`),
            qContainer: document.getElementById(`question-container${suffix}`)
        };

        // Αν δεν βρει το συγκεκριμένο widget στη σελίδα, απλά το αγνοεί!
     if (Object.values(localDOM).some(el => el === null)) return;

        // Ξεχωριστό "σκορ" και πρόοδος για κάθε widget!
        const state = { questions: [], index: 0, score: 0, current: null };

       const loadNext = () => {
            if (state.index >= state.questions.length) {
                state.questions = Utils.shuffleArray(DataEngine.questionsArray);
                state.index = 0;
                state.score = 0; // ΔΙΟΡΘΩΣΗ: Μηδενισμός του σκορ στην επανεκκίνηση του quiz!
            }

            state.current = state.questions[state.index];
            state.index++;

          localDOM.display.innerHTML = state.current.text; 
            localDOM.iconSpan.innerHTML = state.current.icon || ""; // ΔΙΟΡΘΩΣΗ: Αποτρέπει την εκτύπωση της λέξης 'undefined'
            localDOM.feedback.innerHTML = "";
            localDOM.stats.innerHTML = `Σκορ: <strong>${state.score}</strong>`;

            // ΔΙΟΡΘΩΣΗ: Αν είναι μήνυμα σφάλματος, κρύψε τα κουμπιά και δείξε κατευθείαν την εξήγηση
            if (state.current.isError) {
                localDOM.btnRow.style.display = "none";
                localDOM.expText.innerHTML = state.current.exp;
                localDOM.expBox.style.display = "block";
            } else {
                localDOM.btnRow.style.display = "flex";
                localDOM.expBox.style.display = "none"; 
            }

            localDOM.qContainer.classList.remove("question-anim");
            localDOM.iconSpan.classList.remove("question-anim");
            void localDOM.qContainer.offsetWidth; // Trigger reflow 
            localDOM.qContainer.classList.add("question-anim");
            localDOM.iconSpan.classList.add("question-anim");
        };

        const processChoice = (userChoice) => {
            localDOM.btnRow.style.display = "none";
            
            // ΔΙΟΡΘΩΣΗ: Ασφαλής σύγκριση! Αποτρέπει σφάλματα από booleans, κεφαλαία ή τυχαία κενά στο JSON.
            const safeUserChoice = String(userChoice).trim().toLowerCase();
            const safeCorrectChoice = String(state.current.type).trim().toLowerCase();

            if (safeUserChoice === safeCorrectChoice) { 
                state.score++;
                localDOM.feedback.innerHTML = "Σωστά! ✅"; 
                localDOM.feedback.style.color = "#27ae60"; 
            } else { 
                localDOM.feedback.innerHTML = "Λάθος! ❌"; 
                localDOM.feedback.style.color = "#e74c3c"; 
            }
            
           // ΔΙΟΡΘΩΣΗ: Αν η ερώτηση δεν έχει επεξήγηση, δείχνει προεπιλεγμένο μήνυμα αντί για 'undefined'
            localDOM.expText.innerHTML = state.current.exp || "Δεν υπάρχει επιπλέον εξήγηση."; 
            localDOM.expBox.style.display = "block";
            localDOM.stats.innerHTML = `Σκορ: <strong>${state.score}</strong>`;
        };

        // Αρχικοποίηση
        state.questions = Utils.shuffleArray(DataEngine.questionsArray);
        if (state.questions.length > 0) {
            loadNext();
        }

        // Event Listeners ΜΟΝΟ για το συγκεκριμένο widget
        localDOM.btnRow.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn || !btn.dataset.choice) return;
            processChoice(btn.dataset.choice);
        });

        localDOM.expBox.addEventListener("click", (e) => {
            const nextBtn = e.target.closest("button");
            if (nextBtn && nextBtn.dataset.action === "next") {
                loadNext();
            }
        });
    };

    // 3. ΕΚΚΙΝΗΣΗ (Universal App)
    const UniversalApp = {
        init: async () => {
            // Κατεβάζουμε το JSON ΜΟΝΟ ΜΙΑ ΦΟΡΑ από το internet
            await DataEngine.fetchQuestions();

            // Η Έξυπνη Λούπα: Το κενό "" είναι για το PC, το "-mobile" για το κινητό!
            const platforms = ["", "-mobile"];
            platforms.forEach(suffix => initQuizWidget(suffix));
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", UniversalApp.init);
    } else {
        UniversalApp.init();
    }

})();
