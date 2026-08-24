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

 // Χρησιμοποιούμε μια κοινή σύνδεση (χωρίς όνομα) για να λειτουργεί τέλεια παντού
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  // Τραβάμε τις ερωτήσεις δυναμικά από το εξωτερικό JSON
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/quiz.json"; // <-- Βάλε εδώ το σωστό link!
  
  let QUESTIONS_DB = [];
  try {
      const response = await fetch(JSON_URL);
      QUESTIONS_DB = await response.json();
  } catch (error) {
      console.error("Σφάλμα φόρτωσης ερωτήσεων:", error);
      QUESTIONS_DB = [{ text: "Σφάλμα φόρτωσης ερωτήσεων. Ανανεώστε τη σελίδα.", emoji: "⚠️" }];
  }

 const today = new Date();
  
 // ΕΞΥΠΝΟΣ ΥΠΟΛΟΓΙΣΜΟΣ ΣΧΟΛΙΚΟΥ ΕΤΟΥΣ (Σεπτέμβριος - Ιούνιος)
 const schoolYear = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;

 // ΛΥΣΗ: Υπολογισμός της ημέρας με ΑΦΕΤΗΡΙΑ την 31η Αυγούστου του εκάστοτε σχολικού έτους
 const startOfSchoolYear = new Date(schoolYear, 8, 0); // Ο μήνας 8 είναι ο Σεπτέμβριος (το 0 σημαίνει την τελευταία μέρα του Αυγούστου)
 const dayOfSchoolYear = Math.floor((today - startOfSchoolYear + (startOfSchoolYear.getTimezoneOffset() - today.getTimezoneOffset()) * 60000) / 86400000); 
 
 const dailyQ = QUESTIONS_DB[dayOfSchoolYear % QUESTIONS_DB.length];
 const dayKey = `schoolYear_${schoolYear}_day_${dayOfSchoolYear}`;

  // ΝΕΟ: Ελέγχουμε και τα δύο widget (Κινητού και PC) ταυτόχρονα!
  const platforms = ['mobile', 'pc'];

  platforms.forEach(platform => {
      const suffix = `-${platform}`; // Δημιουργεί την κατάληξη '-mobile' ή '-pc'
      const wrapperId = `${platform}-quiz-wrapper`; // Ψάχνει το 'mobile-quiz-wrapper' ή 'pc-quiz-wrapper'
      const w = document.getElementById(wrapperId);

      // Αν βρει το συγκεκριμένο widget στη σελίδα, του δίνει ζωή!
      if (w) {
          if (document.getElementById(`q-text${suffix}`)) document.getElementById(`q-text${suffix}`).innerText = dailyQ.text;
          if (document.getElementById(`q-emoji${suffix}`)) document.getElementById(`q-emoji${suffix}`).innerText = dailyQ.emoji;

          enableForms();

          // Αυτή η συνάρτηση υπάρχει για μελλοντική χρήση 
          function showVotedUI() {
              const btnOpen = document.getElementById(`open-form-btn${suffix}`);
              const form = document.getElementById(`quiz-form${suffix}`);
              const viewBtn = document.getElementById(`view-answers-btn${suffix}`);
              const earlyViewBtn = document.getElementById(`early-view-btn${suffix}`);
              
              if (earlyViewBtn) earlyViewBtn.style.display = 'none';
              if (btnOpen) btnOpen.style.display = 'none';
              if (form) form.style.display = 'none';
              if (viewBtn) {
                  viewBtn.style.display = 'inline-block';
                  viewBtn.onclick = () => window.location.href = ANSWERS_PAGE_URL;
              }
          }

          function enableForms() {
              const btnOpen = document.getElementById(`open-form-btn${suffix}`);
              const form = document.getElementById(`quiz-form${suffix}`);
              const btnSubmit = document.getElementById(`quiz-submit-btn${suffix}`);
              const successMsg = document.getElementById(`quiz-success-msg${suffix}`);
              const earlyViewBtn = document.getElementById(`early-view-btn${suffix}`);

              if (earlyViewBtn) {
                  earlyViewBtn.onclick = () => window.location.href = ANSWERS_PAGE_URL;
              }

              if (btnOpen) {
                  btnOpen.onclick = () => { 
                      btnOpen.style.display = 'none'; 
                      if (form) form.style.display = 'block'; 
                      if (earlyViewBtn) earlyViewBtn.style.display = 'none';
                  };
              }

           if (btnSubmit) {
                  // Φτιάχνουμε κοινή συνάρτηση για να καλύπτει ΚΑΙ το Enter ΚΑΙ το Κλικ
                  const handleSubmit = async (e) => {
                      if (e) e.preventDefault(); 
                      
                      // Αποφυγή διπλού submit (π.χ. αν πατηθεί Enter και Κλικ γρήγορα μαζί)
                      if (btnSubmit.disabled) return; 

                      // 1. Δόνηση ΜΟΝΟ για συσκευές αφής (κινητά)
                      const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
                      if (isMobile && navigator.vibrate) {
                          navigator.vibrate(50);
                      }

                      // 2. Πιάνει δυναμικά τα σωστά πεδία (του PC ή του Mobile αντίστοιχα)
                      const ageField = document.getElementById(`quiz-age${suffix}`);
                      const textField = document.getElementById(`quiz-answer${suffix}`);
                      
                      const age = ageField ? ageField.value.trim().substring(0, 3) : "";
                      const text = textField ? textField.value.trim().substring(0, 500) : "";
                      
                      if (!age || !text) { alert("Παρακαλώ συμπληρώστε Ηλικία και Απάντηση!"); return; }
                      
                      btnSubmit.innerText = "Αποστολή...";
                      btnSubmit.disabled = true;

                      try {
                          // 3. Στέλνουμε τα δεδομένα στη βάση
                          const newAnswerRef = push(ref(db, `answers/${dayKey}`));
                          
                          // ΛΥΣΗ ΣΦΑΛΜΑΤΟΣ 2: Βγάζουμε το 'await' για να ΜΗΝ "παγώνει" το UI χωρίς ίντερνετ. 
                          // Το Firebase τα σώζει τοπικά και τα στέλνει αυτόματα μόλις βρει δίκτυο.
                          set(newAnswerRef, {
                              age: age, answer: text, status: 'pending', timestamp: Date.now()
                          });
                          
                          if (ageField) ageField.value = '';
                          if (textField) textField.value = '';
                          
                          const rewardMessages = [
                              "Αποστολή Εξετελέσθη! ✔️ Κέρδισες +10 πόντους Φαντασίας!",
                              "Ξεκλείδωσες τη σημερινή μνήμη! 🗝️ Μπράβο!",
                              "Level Up! 🌟 Η απάντησή σου αποθηκεύτηκε στο σύστημα!",
                              "Τρομερή ιδέα! 🚀 +20XP Δημιουργικότητας!",
                              "Τέλεια! 🎯 Κέρδισες το Χρυσό Αστέρι της ημέρας!"
                          ];
                          
                          const randomMsg = rewardMessages[Math.floor(Math.random() * rewardMessages.length)];
                          
                          if (successMsg) {
                              successMsg.innerText = randomMsg; 
                              successMsg.style.display = 'block';
                          }

                          // 4. Επαναφορά μετά από 3.5 δευτερόλεπτα
                          setTimeout(() => { 
                              if (successMsg) successMsg.style.display = 'none';
                              
                              btnSubmit.innerText = "🚀 Αποστολή";
                              btnSubmit.disabled = false;
                              
                              if (form) form.style.display = 'none';
                              if (btnOpen) btnOpen.style.display = '';
                              if (earlyViewBtn) earlyViewBtn.style.display = '';
                              
                          }, 3500); 
                      } catch(err) {
                          alert("Σφάλμα κατά την αποστολή. Δοκίμασε ξανά.");
                          btnSubmit.innerText = "🚀 Αποστολή";
                          btnSubmit.disabled = false;
                      }
                  };

                  // ΛΥΣΗ ΣΦΑΛΜΑΤΟΣ 1: Δένουμε τη συνάρτηση στο κουμπί (για ποντίκι/αφή) 
                  // ΚΑΙ στη φόρμα για να "πιάσουμε" το πάτημα του Enter!
                  btnSubmit.onclick = handleSubmit;
                  if (form) form.onsubmit = handleSubmit;
              }
          }
      }
  });
