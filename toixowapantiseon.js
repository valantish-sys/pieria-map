 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

  // ==========================================================
  // ⚙️ ΡΥΘΜΙΣΕΙΣ LOAD MORE (Μπορείς να τις αλλάξεις όποτε θες)
  // ==========================================================
  const isMobile = window.innerWidth <= 768; // Έλεγχος αν είναι κινητό
  
  const CARDS_INITIAL = isMobile ? 2 : 6;  // Πόσες δείχνει αρχικά: 2 στο Κινητό, 6 στο PC
  const CARDS_LOAD_MORE = 10;              // Πόσες νέες κάρτες προσθέτει πατώντας "Load More"
  // ==========================================================

  const app = initializeApp({
    apiKey: "AIzaSyCZdNDOmQr_IAFMHBP_fWsSUxutJ7uAB4k", 
    authDomain: "quiz-12bf7.firebaseapp.com",
    projectId: "quiz-12bf7", 
    databaseURL: "https://quiz-12bf7-default-rtdb.europe-west1.firebasedatabase.app"
  }, "WallApp"); // <--- ΑΥΤΟ ΤΟ "WallApp" ΛΥΝΕΙ ΤΟΝ ΠΟΛΕΜΟ ΤΩΝ ΣΥΝΔΕΣΕΩΝ!
  const db = getDatabase(app);

  // Τραβάμε τις ερωτήσεις δυναμικά από το εξωτερικό JSON
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/quiz.json"; // <-- Βάλε ακριβώς το ΙΔΙΟ link με τον 1ο κώδικα!
  
  let QUESTIONS_DB = [];
  try {
      const response = await fetch(JSON_URL);
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
                      
                      // 🛡️ ΑΣΠΙΔΑ 1: Αν ο αριθμός χαλάσει (NaN) ή είναι αρνητικός, τον κάνουμε 0 για να μην κρασάρει ποτέ!
                      const safeDayNum = isNaN(dayNum) || dayNum < 0 ? 0 : dayNum;
                      const qIndex = safeDayNum % QUESTIONS_DB.length;

                      if (!groupedQuestions[qIndex]) { groupedQuestions[qIndex] = []; }

                      const dayData = daySnap.val();
                      if (dayData) {
                          for (let uid in dayData) {
                              if (dayData[uid] && dayData[uid].status === 'approved') {
                                  groupedQuestions[qIndex].push(dayData[uid]);
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
                  
                  // 🛡️ ΑΣΠΙΔΑ 3: Πάντα βάζει μια ερώτηση, ακόμα κι αν χαθεί ο δείκτης (έτσι δεν κρασάρει το emoji)
                  const safeQData = QUESTIONS_DB[qIndex] || QUESTIONS_DB[0] || { text: "Απαντήσεις Μαθητών", emoji: "💬" };

                  masterGroups.push({
                      id: qStrIndex,
                      qData: safeQData,
                      answers: answersArr,
                      latestTime: latestTime
                  });
              }
          });

          masterGroups.sort((a, b) => b.latestTime - a.latestTime);
          
          currentVisibleCount = CARDS_INITIAL; 
          renderGrid(masterGroups, false); 
          
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
          container.innerHTML = "<p style='text-align:center; grid-column:1/-1; color:#777; font-weight:bold;'>Δεν υπάρχουν ακόμα απαντήσεις.</p>";
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
          card.innerHTML = `
              <div class="q-card-top">
                  <div class="q-card-emoji">${group.qData.emoji}</div>
                  <div class="q-badge">💬 ${group.answers.length}</div>
              </div>
              <div class="q-card-title">${group.qData.text}</div>
              <div class="q-card-time">Τελευταία απάντηση: ${dateStr}</div>
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

  const searchInput = document.getElementById('search-input');
  if(searchInput) {
      searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase().trim();
          
          if (term === "") {
              renderGrid(masterGroups, false);
          } else {
              const filtered = masterGroups.filter(g => g.qData.text.toLowerCase().includes(term));
              renderGrid(filtered, true);
          }
      });
  }

  window.openAnswersView = (qIndex) => {
      const group = masterGroups.find(g => g.id === String(qIndex));
      if (!group) return;

      document.getElementById('view-grid').style.display = 'none';
      document.getElementById('view-answers').style.display = 'block';
      //window.scrollTo(0, 0); 

      document.getElementById('active-q-emoji').innerHTML = group.qData.emoji;
      document.getElementById('active-q-text').innerHTML = group.qData.text;

      const ansContainer = document.getElementById('active-answers-container');
      ansContainer.innerHTML = "";
      
      group.answers.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      group.answers.forEach(ans => {
          const div = document.createElement('div');
          div.className = 'public-card';
          div.innerHTML = `
              <span class="public-age">👤 Ετών: ${escapeHtml(ans.age)}</span>
              <div class="public-text">"${escapeHtml(ans.answer)}"</div>
          `;
          ansContainer.appendChild(div);
      });
  };

  window.goBack = () => {
      document.getElementById('view-answers').style.display = 'none';
      document.getElementById('view-grid').style.display = 'block';
      //window.scrollTo(0, 0); 
  };

  function escapeHtml(unsafe) {
      return (unsafe || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
