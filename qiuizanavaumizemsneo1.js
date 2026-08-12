import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCZdNDOmQr_IAFMHBP_fWsSUxutJ7uAB4k",
    authDomain: "quiz-12bf7.firebaseapp.com",
    projectId: "quiz-12bf7",
    databaseURL: "https://quiz-12bf7-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "quiz-12bf7.firebasestorage.app",
    messagingSenderId: "508851875370",
    appId: "1:508851875370:web:c00fe0201a00596a595d53"
  };

  const ANSWERS_PAGE_URL = "https://dimperist.blogspot.com/p/blog-page_597.html"; // <-- ΒΑΛΕ ΕΔΩ ΤΟ URL

  const appMobile = initializeApp(firebaseConfig, "mobileApp");
  const dbMobile = getDatabase(appMobile);

  const QUESTIONS_DB = [
      { text: "Ποια ήταν η πιο αστεία ή η πιο ενδιαφέρουσα στιγμή από την τελευταία μας εκπαιδευτική επίσκεψη;", emoji: "🚌😆" },
      { text: "Ποια ήταν η αγαπημένη σας δραστηριότητα ή το πιο ενδιαφέρον πράγμα που ανακαλύψαμε αυτή την εβδομάδα στην τάξη;", emoji: "💡🏫" }, 
      { text: "Αν ξυπνούσατε ένα πρωί και μιλούσατε άπταιστα μια γλώσσα εξωγήινων, ποιο θα ήταν το πρώτο πράγμα που θα προσπαθούσατε να τους πείτε;", emoji: "👽🛸" },
      { text: "Ποιο είναι το πιο περίεργο ταλέντο που έχετε;", emoji: "🤹‍♂️🤪" }
  ];

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - startOfYear + (startOfYear.getTimezoneOffset() - today.getTimezoneOffset()) * 60000) / 86400000); 
  const dailyQ = QUESTIONS_DB[dayOfYear % QUESTIONS_DB.length];
  const dayKey = `day_${dayOfYear}`;

  const w = document.getElementById('mobile-quiz-wrapper');

  if (w) {
      if (document.getElementById('q-text-mobile')) document.getElementById('q-text-mobile').innerText = dailyQ.text;
      if (document.getElementById('q-emoji-mobile')) document.getElementById('q-emoji-mobile').innerText = dailyQ.emoji;

      // Έλεγχος αν η συσκευή έχει ήδη ψηφίσει
      if (localStorage.getItem(`voted_${dayKey}`)) {
          showVotedUI();
      } else {
          enableForms(); 
      }

      function showVotedUI() {
          const btnOpen = document.getElementById('open-form-btn-mobile');
          const form = document.getElementById('quiz-form-mobile');
          const viewBtn = document.getElementById('view-answers-btn-mobile');
          
          if (btnOpen) btnOpen.style.display = 'none';
          if (form) form.style.display = 'none';
          if (viewBtn) {
              viewBtn.style.display = 'inline-block';
              viewBtn.onclick = () => window.location.href = ANSWERS_PAGE_URL;
          }
      }

      function enableForms() {
          const btnOpen = document.getElementById('open-form-btn-mobile');
          const form = document.getElementById('quiz-form-mobile');
          const btnSubmit = document.getElementById('quiz-submit-btn-mobile');
          const successMsg = document.getElementById('quiz-success-msg-mobile');

          if (btnOpen) {
              btnOpen.onclick = () => { btnOpen.style.display = 'none'; form.style.display = 'block'; };
          }

          if (btnSubmit) {
              btnSubmit.onclick = async () => {
                  const age = document.getElementById('quiz-age-mobile').value.trim();
                  const text = document.getElementById('quiz-answer-mobile').value.trim();
                  
                  if (!age || !text) { alert("Παρακαλώ συμπληρώστε Ηλικία και Απάντηση!"); return; }
                  
                  btnSubmit.innerText = "Αποστολή...";
                  btnSubmit.disabled = true;

                  try {
                      // Στέλνουμε τα δεδομένα κατευθείαν με έναν νέο μοναδικό κωδικό (push)
                      const newAnswerRef = push(ref(dbMobile, `answers/${dayKey}`));
                      await set(newAnswerRef, {
                          age: age, answer: text, status: 'pending', timestamp: Date.now()
                      });
                      
                      // Κλειδώνουμε το widget για τη σημερινή μέρα σε αυτό το κινητό
                      localStorage.setItem(`voted_${dayKey}`, "true");
                      
                      document.getElementById('quiz-age-mobile').style.display = 'none';
                      document.getElementById('quiz-answer-mobile').style.display = 'none';
                      btnSubmit.style.display = 'none';
                      
                      if (successMsg) successMsg.style.display = 'block';

                      setTimeout(() => { showVotedUI(); }, 2500);
                  } catch(e) {
                      alert("Σφάλμα! (Αν μόλις άλλαξες τα Rules, περίμενε 1 λεπτό).");
                      btnSubmit.innerText = "🚀 Αποστολή";
                      btnSubmit.disabled = false;
                  }
              };
          }
      }
  }
