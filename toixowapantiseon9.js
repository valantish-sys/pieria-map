import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

  // ==========================================================
  // ⚙️ ΡΥΘΜΙΣΕΙΣ LOAD MORE (Μπορείς να τις αλλάξεις όποτε θες)
  // ==========================================================
  const isMobile = window.innerWidth <= 768; // Έλεγχος αν είναι κινητό
  
  const CARDS_INITIAL = isMobile ? 2 : 6;  // Πόσες δείχνει αρχικά: 2 στο Κινητό, 6 στο PC
  const CARDS_LOAD_MORE = 10;              // Πόσες νέες κάρτες προσθέτει πατώντας "Load More"
  // ==========================================================

 const firebaseConfig = {
    apiKey: "AIzaSyCZdNDOmQr_IAFMHBP_fWsSUxutJ7uAB4k", 
    authDomain: "quiz-12bf7.firebaseapp.com",
    projectId: "quiz-12bf7", 
    databaseURL: "https://quiz-12bf7-default-rtdb.europe-west1.firebasedatabase.app"
  };
  
  // 🛡️ Έλεγχος: Αν το "WallApp" υπάρχει ήδη (π.χ. 2ο widget στην ίδια οθόνη), 
  // το επαναχρησιμοποιεί! Έτσι δεν κρασάρει ποτέ το blog.
  const app = getApps().find(a => a.name === "WallApp") ? getApp("WallApp") : initializeApp(firebaseConfig, "WallApp");
  const db = getDatabase(app);

  // Τραβάμε τις ερωτήσεις δυναμικά από το εξωτερικό JSON
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/quiz.json"; // <-- Βάλε ακριβώς το ΙΔΙΟ link με τον 1ο κώδικα!
  
let QUESTIONS_DB = [];
  try {
      // Προσθήκη timestamp (?t=) και { cache: "no-store" } για να παρακάμπτεται ΠΑΝΤΑ
      // η προσωρινή μνήμη του browser και των CDN. Φέρνει διαρκώς τη νέα ερώτηση.
      const response = await fetch(JSON_URL + "?t=" + new Date().getTime(), { cache: "no-store" });
      QUESTIONS_DB = await response.json();
  } catch (error) {
      console.error("Σφάλμα φόρτωσης ερωτήσεων:", error);
      QUESTIONS_DB = [{ text: "Σφάλμα φόρτωσης ερωτήσεων. Ανανεώστε.", emoji: "⚠️" }];
  }

  let masterGroups = [];      
  let currentVisibleCount = CARDS_INITIAL; 

  onValue(ref(db, 'answers'), (snapshot) => {
      try {
          const groupedQuestions = {};

          snapshot.forEach(daySnap => { 
              if(daySnap.key && daySnap.key.includes('day_')) {
                  const parts = daySnap.key.split('day_');
                  if (parts.length > 1) {
                    const dayNum = parseInt(parts[1], 10); 
                      const safeDayNum = isNaN(dayNum) || dayNum < 0 ? 0 : dayNum;
                   // Αφαίρεση του 1 για απόλυτο συγχρονισμό
 const fallbackQIndex = QUESTIONS_DB.length > 0 ? (Math.max(0, safeDayNum - 1) % QUESTIONS_DB.length) : 0;

                      const dayData = daySnap.val();
                      if (dayData) {
                          for (let uid in dayData) {
                              const ans = dayData[uid];
                              if (ans && ans.status === 'approved') {
                                  // Διαβάζει το σωστό qIndex από τη βάση, αλλιώς χρησιμοποιεί τον τύπο
                                  const actualIndex = ans.qIndex !== undefined ? ans.qIndex : fallbackQIndex;
                                  if (!groupedQuestions[actualIndex]) { groupedQuestions[actualIndex] = []; }
                                  groupedQuestions[actualIndex].push(ans);
                              }
                          }
                      }
                  }
              }
          });
          
          masterGroups = [];
          Object.keys(groupedQuestions).forEach(qStrIndex => {
              const qIndex = parseInt(qStrIndex, 10);
              const answersArr = groupedQuestions[qIndex];
              
              if (answersArr && answersArr.length > 0) {
                  // 🛡️ ΑΣΠΙΔΑ 2: Ασφαλής εύρεση χρόνου (η παλιά εντολή Math.max μπορούσε να κρασάρει σιωπηλά)
                  let latestTime = 0;
                  answersArr.forEach(a => {
                      if (a.timestamp && a.timestamp > latestTime) latestTime = a.timestamp;
                  });
                  
                // 🛡️ ΑΣΠΙΔΑ 3: Αν το JSON μπλοκαριστεί (QUESTIONS_DB.length <= 1), ΔΕΝ βάζουμε 
                  // το μήνυμα σφάλματος σε όλες τις παλιές κάρτες!
                  const safeQData = QUESTIONS_DB[qIndex] || 
                                   (QUESTIONS_DB.length > 1 ? QUESTIONS_DB[0] : { text: "Απαντήσεις Μαθητών", emoji: "💬" });

                  masterGroups.push({
                      id: qStrIndex,
                      qData: safeQData,
                      answers: answersArr,
                      latestTime: latestTime
                  });
              }
          });

         masterGroups.sort((a, b) => b.latestTime - a.latestTime);
          
        
         // Ελέγχουμε αν ο χρήστης έχει ενεργή αναζήτηση τη στιγμή της ενημέρωσης
          const searchInputEl = document.getElementById('search-input');
          // ΔΙΟΡΘΩΣΗ: Αφαίρεση τόνων από την αναζήτηση
          const term = searchInputEl ? removeAccents(searchInputEl.value.toLowerCase()).trim() : "";
          
          if (term === "") {
              renderGrid(masterGroups, false); 
          } else {
              // ΔΙΟΡΘΩΣΗ: Αφαίρεση τόνων και από τον τίτλο κατά τη ζωντανή ενημέρωση!
             // ΝΕΟ: Η αναζήτηση σαρώνει πλέον ΚΑΙ τις ερωτήσεις ΚΑΙ το κείμενο όλων των εγκεκριμένων απαντήσεων!
             const filtered = masterGroups.filter(g => 
                 removeAccents(g.qData.text.toLowerCase()).includes(term) ||
                 g.answers.some(a => removeAccents((a.answer || "").toLowerCase()).includes(term))
             );
          renderGrid(filtered, true);
          }
          
          // (Bug 2) Αν ο χρήστης διαβάζει απαντήσεις εκείνη τη στιγμή, τις ανανεώνουμε ζωντανά!
          if (window.activeQuestionId && document.getElementById('view-answers').style.display === 'block') {
             const activeGroup = masterGroups.find(g => g.id === window.activeQuestionId);
             if (activeGroup) {
                 const ansContainer = document.getElementById('active-answers-container');
                 const currentScrollY = window.scrollY || document.documentElement.scrollTop; // Αποθήκευση θέσης
                 
                activeGroup.answers.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                 
                 ansContainer.innerHTML = "";
                  activeGroup.answers.forEach(ans => {
                      const div = document.createElement('div');
                      div.className = 'public-card';
                      div.innerHTML = `
                          <span class="public-age">👤 Ετών: ${escapeHtml(ans.age)}</span>
                          <div class="public-text" style="white-space: pre-wrap; overflow-wrap: break-word;">"${escapeHtml(ans.answer)}"</div>
                      `;
                      ansContainer.appendChild(div);
                });
                window.scrollTo({ top: currentScrollY, behavior: 'instant' });
              } else {
                  // Η ερώτηση δεν έχει πλέον απαντήσεις. Επιστρέφουμε στο αρχικό μενού.
                  if (typeof window.goBack === 'function') window.goBack();
              }
          }
          
      } catch (error) {
          // 🚨 Η ΑΠΟΛΥΤΗ ΠΑΓΙΔΑ ΣΦΑΛΜΑΤΩΝ: Αν υπάρξει λάθος, εξαφανίζει τη "Φόρτωση..." και τυπώνει το λάθος στην οθόνη!
          console.error("Σφάλμα Τοίχου:", error);
          const container = document.getElementById('q-grid-container');
          if (container) {
              container.innerHTML = `<p style="color:#c0392b; text-align:center; padding:20px; font-weight:bold; grid-column:1/-1;">⚠️ Σφάλμα Τοίχου: ${error.message}</p>`;
          }
      }
  });

  function renderGrid(groupsArray, isSearching) {
      const container = document.getElementById('q-grid-container');
      const loadMoreWrapper = document.getElementById('load-more-wrapper');
      
      if (!container) return;
      container.innerHTML = "";

    if (groupsArray.length === 0) {
          // Δυναμικό, καθησυχαστικό μήνυμα αν η λίστα είναι άδεια λόγω αναζήτησης
          const emptyMsg = isSearching 
              ? "Δε βρέθηκαν αποτελέσματα για την αναζήτησή σας." 
              : "Δεν υπάρχουν ακόμα απαντήσεις.";
              
          container.innerHTML = `<p style='text-align:center; grid-column:1/-1; color:#777; font-weight:bold;'>${emptyMsg}</p>`;
          if(loadMoreWrapper) loadMoreWrapper.style.display = 'none';
          return;
      }

      const limit = isSearching ? groupsArray.length : currentVisibleCount;
      const visibleGroups = groupsArray.slice(0, limit);

      visibleGroups.forEach(group => {
          const dateStr = group.latestTime ? new Date(group.latestTime).toLocaleDateString('el-GR') : "";

        const card = document.createElement('div');
          card.className = 'q-card';
          card.onclick = () => window.openAnswersView(group.id);
          
          // Δυναμική εμφάνιση: Αν δεν υπάρχει ημερομηνία, εμφανίζει μια εναλλακτική λογική φράση
          const timeDisplay = dateStr ? `Τελευταία απάντηση: ${dateStr}` : "Παλαιότερες απαντήσεις";

          card.innerHTML = `
              <div class="q-card-top">
                  <div class="q-card-emoji">${group.qData.emoji}</div>
                  <div class="q-badge">💬 ${group.answers.length}</div>
              </div>
          <div class="q-card-title">${escapeHtml(group.qData.text)}</div>
              <div class="q-card-time">${timeDisplay}</div>
          `;
          container.appendChild(card);
      });

      if (!isSearching && groupsArray.length > currentVisibleCount && loadMoreWrapper) {
          loadMoreWrapper.style.display = 'block';
      } else if (loadMoreWrapper) {
          loadMoreWrapper.style.display = 'none';
      }
  }

  const loadMoreBtn = document.getElementById('load-more-btn');
  if(loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
          currentVisibleCount += CARDS_LOAD_MORE;
          renderGrid(masterGroups, false); 
      });
  }
// Βοηθητική συνάρτηση που αφαιρεί αυτόματα τους τόνους (ως function για ασφαλή χρήση παντού)
  function removeAccents(str) {
      return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const searchInput = document.getElementById('search-input');
  if(searchInput) {
      searchInput.addEventListener('input', (e) => {
          // Αφαιρούμε τους τόνους από αυτό που πληκτρολογεί ο χρήστης
          const term = removeAccents(e.target.value.toLowerCase()).trim();
          
          if (term === "") {
              renderGrid(masterGroups, false);
          } else {
              // Συγκρίνουμε αφαιρώντας τους τόνους ΚΑΙ από τον τίτλο της κάρτας
           // ΝΕΟ: Η αναζήτηση σαρώνει πλέον ΚΑΙ τις ερωτήσεις ΚΑΙ το κείμενο όλων των εγκεκριμένων απαντήσεων!
             const filtered = masterGroups.filter(g => 
                 removeAccents(g.qData.text.toLowerCase()).includes(term) ||
                 g.answers.some(a => removeAccents((a.answer || "").toLowerCase()).includes(term))
             );
              renderGrid(filtered, true);
          }
      });
  }

window.openAnswersView = (qIndex) => {
      window.activeQuestionId = String(qIndex); // (Bug 2) Αποθήκευση της ανοιχτής ερώτησης
      const group = masterGroups.find(g => g.id === String(qIndex));
      if (!group) return;

      // (Bug 3) Αποθήκευση ύψους κύλισης ΠΡΙΝ κρυφτεί ο τοίχος (αγνοείται στα live updates)
      if (document.getElementById('view-grid').style.display !== 'none') {
          window.savedScrollY = window.scrollY || document.documentElement.scrollTop;
      }

    document.getElementById('view-grid').style.display = 'none';
      const viewAnswers = document.getElementById('view-answers');
      viewAnswers.style.display = 'block';
      
      // Ομαλή μετακίνηση της οθόνης στην κορυφή των απαντήσεων του widget
      viewAnswers.scrollIntoView({ behavior: 'smooth', block: 'start' });

   // Το textContent εκτυπώνει με απόλυτη ασφάλεια τα πάντα ως απλό κείμενο, 
      // αποτρέποντας την ερμηνεία συμβόλων ως HTML.
      document.getElementById('active-q-emoji').textContent = group.qData.emoji;
      document.getElementById('active-q-text').textContent = group.qData.text;

      const ansContainer = document.getElementById('active-answers-container');
      ansContainer.innerHTML = "";
      
      group.answers.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      group.answers.forEach(ans => {
       const div = document.createElement('div');
          div.className = 'public-card';
          div.innerHTML = `
              <span class="public-age">👤 Ετών: ${escapeHtml(ans.age)}</span>
              <div class="public-text" style="white-space: pre-wrap; overflow-wrap: break-word;">"${escapeHtml(ans.answer)}"</div>
          `;
          ansContainer.appendChild(div);
      });
  };

window.goBack = () => {
      window.activeQuestionId = null; // (Bug 2) Καθαρισμός μνήμης ανοιχτής ερώτησης
     document.getElementById('view-answers').style.display = 'none';
      const viewGrid = document.getElementById('view-grid');
      
      // ΛΥΣΗ 1: Χρησιμοποιούμε κενό string ('') για να αφήσουμε το CSS του ιστολογίου να αποφασίσει (π.χ. grid ή flex)
      viewGrid.style.display = ''; 
      
      // ΛΥΣΗ 2: Μικρή καθυστέρηση (10ms) ώστε ο browser να επανασχεδιάσει το DOM πριν μετακινήσει την οθόνη.
      if (window.savedScrollY !== undefined) {
          setTimeout(() => {
              window.scrollTo({ top: window.savedScrollY, behavior: 'instant' });
          }, 10);
      }
  };

function escapeHtml(unsafe) {
      // Χρήση του Nullish Coalescing (??) αντί για (||) ώστε ο αριθμός "0" να τυπώνεται κανονικά!
      return (unsafe ?? "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
