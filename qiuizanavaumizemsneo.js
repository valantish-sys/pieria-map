 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
  import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCZdNDOmQr_IAFMHBP_fWsSUxutJ7uAB4k",
    authDomain: "quiz-12bf7.firebaseapp.com",
    projectId: "quiz-12bf7",
    databaseURL: "https://quiz-12bf7-default-rtdb.firebaseio.com", // Προστέθηκε για να δουλέψει σωστά η βάση!
    storageBucket: "quiz-12bf7.firebasestorage.app",
    messagingSenderId: "508851875370",
    appId: "1:508851875370:web:c00fe0201a00596a595d53"
  };

  const ANSWERS_PAGE_URL = "https://dimperist.blogspot.com/p/blog-page_597.html"; // <-- ΒΑΛΕ ΕΔΩ ΤΟ URL ΤΗΣ ΣΕΛΙΔΑΣ ΤΩΝ ΑΠΑΝΤΗΣΕΩΝ

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

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

  let userUid = null;
  const widgets = document.querySelectorAll('.quiz-widget-instance');

  // Εμφάνιση ερώτησης σε ΟΛΑ τα widgets
  widgets.forEach(w => {
     if (w.querySelector('.q-text')) w.querySelector('.q-text').innerText = dailyQ.text;
     if (w.querySelector('.q-emoji')) w.querySelector('.q-emoji').innerText = dailyQ.emoji;
  });

  // Αθόρυβη σύνδεση
  onAuthStateChanged(auth, user => {
      if (user) { userUid = user.uid; checkVoted(); } 
      else { signInAnonymously(auth); }
  });

  function checkVoted() {
      if (localStorage.getItem(`voted_${dayKey}`)) {
          showVotedUI();
      } else {
          get(child(ref(db), `answers/${dayKey}/${userUid}`)).then(snap => {
              if (snap.exists()) {
                  localStorage.setItem(`voted_${dayKey}`, "true");
                  showVotedUI();
              } else { enableForms(); }
          });
      }
  }

  function showVotedUI() {
      widgets.forEach(w => {
          w.querySelector('.open-form-btn').style.display = 'none';
          w.querySelector('.quiz-form-container').style.display = 'none';
          const viewBtn = w.querySelector('.view-answers-btn');
          viewBtn.style.display = 'inline-block';
          viewBtn.onclick = () => window.location.href = ANSWERS_PAGE_URL;
      });
  }

  function enableForms() {
      widgets.forEach(w => {
          const btnOpen = w.querySelector('.open-form-btn');
          const form = w.querySelector('.quiz-form-container');
          const btnSubmit = w.querySelector('.quiz-submit-btn');
          const successMsg = w.querySelector('.quiz-success-msg');

          btnOpen.onclick = () => { btnOpen.style.display = 'none'; form.style.display = 'block'; };

          btnSubmit.onclick = async () => {
              const age = w.querySelector('.quiz-age').value.trim();
              const text = w.querySelector('.quiz-answer').value.trim();
              if (!age || !text) { alert("Παρακαλώ συμπληρώστε Ηλικία και Απάντηση!"); return; }
              
              btnSubmit.innerText = "Αποστολή...";
              btnSubmit.disabled = true;

              try {
                  await set(ref(db, `answers/${dayKey}/${userUid}`), {
                      age: age, answer: text, status: 'pending', timestamp: Date.now()
                  });
                  localStorage.setItem(`voted_${dayKey}`, "true");
                  w.querySelector('.quiz-age').style.display = 'none';
                  w.querySelector('.quiz-answer').style.display = 'none';
                  btnSubmit.style.display = 'none';
                  successMsg.style.display = 'block';

                  setTimeout(() => { showVotedUI(); }, 2500);
              } catch(e) {
                  alert("Σφάλμα! Δοκίμασε ξανά.");
                  btnSubmit.innerText = "🚀 Αποστολή";
                  btnSubmit.disabled = false;
              }
          };
      });
  }
