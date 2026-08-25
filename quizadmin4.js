 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
  import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

  const app = initializeApp({
    apiKey: "AIzaSyCZdNDOmQr_IAFMHBP_fWsSUxutJ7uAB4k", 
    authDomain: "quiz-12bf7.firebaseapp.com",
    projectId: "quiz-12bf7", 
    databaseURL: "https://quiz-12bf7-default-rtdb.europe-west1.firebasedatabase.app" 
  });
  const auth = getAuth(app);
  const db = getDatabase(app);

  // Τραβάμε τις ερωτήσεις δυναμικά από το εξωτερικό JSON
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/quiz.json";
  
let QUESTIONS_DB = [];
 try {
     // Ίδια πολιτική cache-busting με τα άλλα widgets για απόλυτο συγχρονισμό!
     const response = await fetch(JSON_URL + "?t=" + new Date().getTime(), { cache: "no-store" });
     QUESTIONS_DB = await response.json();
 } catch (error) {
      console.error("Σφάλμα φόρτωσης ερωτήσεων:", error);
      QUESTIONS_DB = [{ text: "Σφάλμα φόρτωσης. Ελέγξτε το αρχείο JSON.", emoji: "⚠️" }];
  }

  let allData = {};

  document.getElementById('login-btn').onclick = () => {
      document.getElementById('login-error').style.display = 'none'; // Κρύβει το προηγούμενο λάθος
      signInWithEmailAndPassword(auth, document.getElementById('admin-email').value, document.getElementById('admin-pass').value)
      .catch(e => {
          document.getElementById('login-error').style.display = 'block'; // Εμφανίζει το κείμενο αντί για alert
      });
  };
  
  document.getElementById('logout-btn').onclick = () => signOut(auth);

  onAuthStateChanged(auth, user => {
      if (user && !user.isAnonymous) {
          document.getElementById('login-sec').style.display = 'none';
          document.getElementById('dashboard-sec').style.display = 'block';
          loadData();
      } else {
          document.getElementById('login-sec').style.display = 'block';
          document.getElementById('dashboard-sec').style.display = 'none';
      }
  });

  window.switchTab = (event, tabId) => {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      if(event) event.currentTarget.classList.add('active');
  };

 function loadData() {
    onValue(ref(db, 'answers'), (snapshot) => {
        allData = snapshot.val() || {};
        
        // Αποτροπή αντικατάστασης του DOM εάν ο δάσκαλος πληκτρολογεί εκείνη τη στιγμή
        const isEditing = document.querySelector('.edit-box[style*="display: block"]');
        if (!isEditing) {
            renderAll();
        }
    });
}

// Διορθωμένες συναρτήσεις (Περιλαμβάνουν ΚΑΙ τη λύση του Σφάλματος 1):
window.toggleEdit = (day, uid) => {
    const eBox = document.getElementById(`edit-${day}-${uid}`);
    const tBox = document.getElementById(`txt-${day}-${uid}`);
    const aBox = document.getElementById(`act-${day}-${uid}`);
    const errBox = document.getElementById(`err-${day}-${uid}`);
    
    if(eBox.style.display === 'block') {
        eBox.style.display = 'none'; tBox.style.display = 'block'; if (aBox) aBox.style.display = 'flex';
        if(errBox) errBox.style.display = 'none';
        
        // Αν κλείσαμε το τελευταίο ανοιχτό edit, κάνουμε render για να πάρουμε τυχόν live ενημερώσεις 
        if (!document.querySelector('.edit-box[style*="display: block"]')) renderAll();
    } else {
        eBox.style.display = 'block'; tBox.style.display = 'none'; if (aBox) aBox.style.display = 'none';
    }
};

window.saveEdit = (day, uid) => {
    const newTxt = document.getElementById(`input-${day}-${uid}`).value.trim();
    const errBox = document.getElementById(`err-${day}-${uid}`);
    if(!newTxt) {
        if(errBox) errBox.style.display = 'block';
        return;
    }
    if(errBox) errBox.style.display = 'none';
    
    // Κλείνουμε το πλαίσιο ΠΡΙΝ το update, ώστε το onValue να επιτρέψει την εκτέλεση της renderAll()
    document.getElementById(`edit-${day}-${uid}`).style.display = 'none';
    update(ref(db, `answers/${day}/${uid}`), { answer: newTxt, status: 'approved' });
};

window.delForever = (day, uid) => {
    const btn = document.getElementById(`delbtn-${day}-${uid}`);
    if(btn.innerText.includes("Σίγουρα;")) {
        remove(ref(db, `answers/${day}/${uid}`));
    } else {
        const originalText = btn.innerText;
        const originalBg = btn.style.background;
        btn.innerText = "⚠️ Σίγουρα; (Πάτα ξανά)";
        btn.style.background = "#c0392b";
        setTimeout(() => { 
            if(document.getElementById(`delbtn-${day}-${uid}`)) { 
                btn.innerText = originalText; 
                btn.style.background = originalBg; 
            }
        }, 3000);
    }
};

  function renderAll() {
      let htmlPen="", htmlApp="", htmlTra="";
      let cPen=0, cApp=0, cTra=0;
      
     const daysArr = [];
      for(let day in allData) {
          // ΝΕΟ: Δέχεται τους φακέλους αρκεί να ΠΕΡΙΕΧΟΥΝ το 'day_', 
          // οπότε πιάνει και το σκέτο 'day_250' και το νέο 'year_2026_day_250'
          if (day.includes('day_')) daysArr.push({ id: day, data: allData[day] });
      }
      
   // Έξυπνη ταξινόμηση: Πρώτα συγκρίνει το Σχολικό Έτος και μετά την Ημέρα
daysArr.sort((a, b) => {
    // Βοηθητική συνάρτηση που πιάνει και τα δύο πρόθεματα
    const getYear = (id) => id.includes('schoolYear_') ? parseInt(id.split('schoolYear_')[1]) : (id.includes('year_') ? parseInt(id.split('year_')[1]) : 0);
    
    const yearA = getYear(a.id);
    const yearB = getYear(b.id);
          
          const numA = parseInt(a.id.split('day_')[1]) || 0;
          const numB = parseInt(b.id.split('day_')[1]) || 0;

          // Αν τα έτη διαφέρουν, βάζει το νεότερο έτος πιο πάνω
          if (yearA !== yearB) {
              return yearB - yearA;
          }
          // Αν είναι στο ίδιο έτος, βάζει τη μεγαλύτερη μέρα πιο πάνω
          return numB - numA;
      });

      daysArr.forEach(dayObj => {
          const dayId = dayObj.id;
       // ΝΕΟ: Κόβει σωστά τον αριθμό ακόμα κι αν το ID είναι 'year_2026_day_250'
       const dayNum = parseInt(dayId.split('day_')[1]) || 1;
       const qLength = Math.max(1, QUESTIONS_DB.length); // Αποτροπή διαίρεσης με το 0

       // Αναζήτηση του αποθηκευμένου qIndex από την πρώτη διαθέσιμη απάντηση της ημέρας
       let savedQIndex = null;
       for (let uid in dayObj.data) {
           if (dayObj.data[uid].qIndex !== undefined) {
               savedQIndex = dayObj.data[uid].qIndex;
               break;
           }
       }
       
       // Χρήση του ιστορικού qIndex. Αν δεν υπάρχει, fallback στον μαθηματικό τύπο
       const qIndex = savedQIndex !== null ? savedQIndex : Math.max(0, dayNum - 1) % qLength; 
       const qText = QUESTIONS_DB[qIndex] ? QUESTIONS_DB[qIndex].text : "Άγνωστη Ερώτηση";

          const ansArr = [];
          for(let uid in dayObj.data) {
              ansArr.push({ uid: uid, ...dayObj.data[uid] });
          }
          
          ansArr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          ansArr.forEach(ans => {
              const safeAns = escapeHtml(ans.answer);
              const timeStr = ans.timestamp ? new Date(ans.timestamp).toLocaleString('el-GR') : '';

              const cardBase = `
                  <div class="card-top">
                      <span>👤 Ετών: ${escapeHtml(ans.age)}</span>
                      <span>⏰ ${timeStr} | Ημέρα: ${dayNum}</span>
                  </div>
                  <div class="card-q">Ερώτηση: ${qText}</div>
                 <div class="card-text" id="txt-${dayId}-${ans.uid}">${safeAns}</div>

<div class="edit-box" id="edit-${dayId}-${ans.uid}">
    <textarea class="edit-area" id="input-${dayId}-${ans.uid}">${safeAns}</textarea>
    <div id="err-${dayId}-${ans.uid}" class="edit-error">Το κείμενο δεν μπορεί να είναι κενό!</div>
    <button class="btn btn-dark" onclick="saveEdit('${dayId}', '${ans.uid}')">💾 Αποθήκευση & Έγκριση</button>
    <button class="btn" style="background:#95a5a6;" onclick="toggleEdit('${dayId}', '${ans.uid}')">Ακύρωση</button>
</div>
              `;

              if(ans.status === 'pending') {
                  cPen++;
                  htmlPen += `
                      <div class="ans-card pending">
                          ${cardBase}
                        <div class="actions-row" id="act-${dayId}-${ans.uid}">
                              <button class="btn btn-green" onclick="chStatus('${dayId}', '${ans.uid}', 'approved')">✔️ Έγκριση</button>
                             <button class="btn btn-blue" onclick="toggleEdit('${dayId}', '${ans.uid}')">✏️ Επεξεργασία</button>
                              <button class="btn btn-red" onclick="chStatus('${dayId}', '${ans.uid}', 'trashed')">🗑️ Κάδος</button>
                          </div>
                      </div>`;
              } else if(ans.status === 'approved') {
                  cApp++;
                  htmlApp += `
                      <div class="ans-card approved">
                          ${cardBase}
                         <div class="actions-row" id="act-${dayId}-${ans.uid}">
                           <button class="btn btn-blue" onclick="toggleEdit('${dayId}', '${ans.uid}')">✏️ Επεξεργασία</button>
                              <button class="btn btn-orange" onclick="chStatus('${dayId}', '${ans.uid}', 'pending')">🔙 Σε Εκκρεμότητα</button>
                              <button class="btn btn-red" onclick="chStatus('${dayId}', '${ans.uid}', 'trashed')">🗑️ Κάδος</button>
                          </div>
                      </div>`;
              } else if(ans.status === 'trashed') {
                  cTra++;
                  htmlTra += `
                      <div class="ans-card trashed">
                          ${cardBase}
                         <div class="actions-row" id="act-${dayId}-${ans.uid}">
                              <button class="btn btn-orange" onclick="chStatus('${dayId}', '${ans.uid}', 'pending')">♻️ Επαναφορά</button>
                           <button class="btn btn-red" id="delbtn-${dayId}-${ans.uid}" style="background:#000;" onclick="delForever('${dayId}', '${ans.uid}')">❌ Οριστική Διαγραφή</button>
                          </div>
                      </div>`;
              }
          });
      });

      document.getElementById('list-pending').innerHTML = htmlPen || "<p style='color:#777; text-align:center; font-weight:bold; padding:20px;'>Δεν υπάρχουν εκκρεμότητες! 🎉</p>";
      document.getElementById('list-approved').innerHTML = htmlApp || "<p style='color:#777; text-align:center; padding:20px;'>Δεν υπάρχουν εγκεκριμένες απαντήσεις.</p>";
      document.getElementById('list-trash').innerHTML = htmlTra || "<p style='color:#777; text-align:center; padding:20px;'>Ο κάδος είναι άδειος.</p>";

      document.getElementById('c-pen').innerText = cPen;
      document.getElementById('c-app').innerText = cApp;
      document.getElementById('c-tra').innerText = cTra;
      
      document.getElementById('s-tot').innerText = cPen + cApp + cTra;
      document.getElementById('s-pen').innerText = cPen;
      document.getElementById('s-app').innerText = cApp;
      document.getElementById('s-tra').innerText = cTra;
// ΝΕΟ: Εμφάνιση/Απόκρυψη κουμπιών μαζικών ενεργειών αν υπάρχουν στοιχεία
      if (document.getElementById('btn-approve-all')) document.getElementById('btn-approve-all').style.display = cPen > 0 ? 'inline-block' : 'none';
      if (document.getElementById('btn-empty-trash')) document.getElementById('btn-empty-trash').style.display = cTra > 0 ? 'inline-block' : 'none';
  }

  window.chStatus = (day, uid, st) => update(ref(db, `answers/${day}/${uid}`), { status: st });
  
// --- ΝΕΟ: ΜΑΖΙΚΕΣ ΕΝΕΡΓΕΙΕΣ (Με προστασία διπλού κλικ) ---
  window.approveAll = () => {
      const btn = document.getElementById('btn-approve-all');
      if (btn.innerText.includes("Σίγουρα;")) {
          const updates = {};
          for (let day in allData) {
              if (day.includes('day_')) {
                  for (let uid in allData[day]) {
                      if (allData[day][uid].status === 'pending') updates[`answers/${day}/${uid}/status`] = 'approved';
                  }
              }
          }
          if (Object.keys(updates).length > 0) update(ref(db), updates);
          btn.innerText = "✔️ Μαζική Έγκριση Όλων"; 
      } else {
          const originalText = btn.innerText;
          btn.innerText = "⚠️ Σίγουρα; (Πάτα ξανά)";
          setTimeout(() => { if(document.getElementById('btn-approve-all')) btn.innerText = originalText; }, 3000);
      }
  };

  window.emptyTrash = () => {
      const btn = document.getElementById('btn-empty-trash');
      if (btn.innerText.includes("Σίγουρα;")) {
          const updates = {};
          for (let day in allData) {
              if (day.includes('day_')) {
                  for (let uid in allData[day]) {
                      // Το null στο Firebase διαγράφει οριστικά την εγγραφή!
                      if (allData[day][uid].status === 'trashed') updates[`answers/${day}/${uid}`] = null; 
                  }
              }
          }
          if (Object.keys(updates).length > 0) update(ref(db), updates);
          btn.innerText = "❌ Άδειασμα Κάδου";
          btn.style.background = "#000";
      } else {
          const originalText = btn.innerText;
          const originalBg = btn.style.background;
          btn.innerText = "⚠️ Σίγουρα; (Πάτα ξανά)";
          btn.style.background = "#c0392b";
          setTimeout(() => { 
              if(document.getElementById('btn-empty-trash')) { 
                  btn.innerText = originalText; 
                  btn.style.background = originalBg; 
              }
          }, 3000);
      }
  };
  function escapeHtml(unsafe) {
      return (unsafe || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
