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

  const ANSWERS_PAGE_URL = "https://dimperist.blogspot.com/p/blog-page_597.html"; // <-- Μην ξεχάσεις να βάλεις το σωστό URL της σελίδας σου!

  // ΕΔΩ αρχικοποιούμε το Firebase με το όνομα "pcApp" για να μην κάνει conflict με το "mobileApp"!
  const appPC = initializeApp(firebaseConfig, "pcApp");
  const dbPC = getDatabase(appPC);

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

  const wPC = document.getElementById('pc-quiz-wrapper');

  if (wPC) {
      if (document.getElementById('q-text-pc')) document.getElementById('q-text-pc').innerText = dailyQ.text;
      if (document.getElementById('q-emoji-pc')) document.getElementById('q-emoji-pc').innerText = dailyQ.emoji;

      // Έλεγχος αν ο χρήστης ψήφισε
      if (localStorage.getItem(`voted_${dayKey}`)) {
          showVotedUIPC();
      } else {
          enableFormsPC(); 
      }

      function showVotedUIPC() {
          const btnOpen = document.getElementById('open-form-btn-pc');
          const form = document.getElementById('quiz-form-pc');
          const viewBtn = document.getElementById('view-answers-btn-pc');
          
          if (btnOpen) btnOpen.style.display = 'none';
          if (form) form.style.display = 'none';
          if (viewBtn) {
              viewBtn.style.display = 'inline-block';
              viewBtn.onclick = () => window.location.href = ANSWERS_PAGE_URL;
          }
      }

      function enableFormsPC() {
          const btnOpen = document.getElementById('open-form-btn-pc');
          const form = document.getElementById('quiz-form-pc');
          const btnSubmit = document.getElementById('quiz-submit-btn-pc');
          const successMsg = document.getElementById('quiz-success-msg-pc');

          // ΕΔΩ ΕΙΝΑΙ Η ΕΝΤΟΛΗ ΠΟΥ ΑΝΟΙΓΕΙ ΤΟ ΣΥΡΤΑΡΙ (Αλλάζει το display σε block)
          if (btnOpen) {
              btnOpen.onclick = () => { 
                  btnOpen.style.display = 'none'; 
                  if (form) form.style.display = 'block'; 
              };
          }

          if (btnSubmit) {
              btnSubmit.onclick = async () => {
                  const age = document.getElementById('quiz-age-pc').value.trim();
                  const text = document.getElementById('quiz-answer-pc').value.trim();
                  
                  if (!age || !text) { alert("Παρακαλώ συμπληρώστε Ηλικία και Απάντηση!"); return; }
                  
                  btnSubmit.innerText = "Αποστολή...";
                  btnSubmit.disabled = true;

                  try {
                      // Αποστολή στο Firebase
                      const newAnswerRef = push(ref(dbPC, `answers/${dayKey}`));
                      await set(newAnswerRef, {
                          age: age, answer: text, status: 'pending', timestamp: Date.now()
                      });
                      
                      localStorage.setItem(`voted_${dayKey}`, "true"); // Κλειδώνει την ψήφο
                      
                      document.getElementById('quiz-age-pc').style.display = 'none';
                      document.getElementById('quiz-answer-pc').style.display = 'none';
                      btnSubmit.style.display = 'none';
                      
                      if (successMsg) successMsg.style.display = 'block';

                      setTimeout(() => { showVotedUIPC(); }, 2500);
                  } catch(e) {
                      alert("Σφάλμα κατά την αποστολή. Δοκίμασε ξανά.");
                      btnSubmit.innerText = "🚀 Αποστολή";
                      btnSubmit.disabled = false;
                  }
              };
          }
      }
  }
