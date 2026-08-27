// Τα δικά σου κλειδιά Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCnlza3LeY9oDCUVxQ0ag-11vigcjf6RV0",
  authDomain: "photos-fbb91.firebaseapp.com",
  databaseURL: "https://photos-fbb91-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "photos-fbb91",
  storageBucket: "photos-fbb91.firebasestorage.app",
  messagingSenderId: "564601708050",
  appId: "1:564601708050:web:7b75eed88836803bd902cb"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentThemeId = "";
let allThemes = {};
let allPhotos = [];
let editMode = {}; 
let photoLimit = 1000;
let photosListenerRef = null;

// --- UI ΒΟΗΘΗΤΙΚΑ (Toasts, Lightbox, Tabs) ---
function showToast(msg, isError = false) {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) toast.style.background = 'var(--danger)';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  // ΚΑΘΑΡΙΣΜΟΣ: Ξετσεκάρουμε τα checkboxes για να αποφύγουμε ακούσιες ενέργειες από κρυφές καρτέλες
  document.querySelectorAll('.cb-bulk').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[id^="selectAll-"]').forEach(cb => cb.checked = false);

  const targetTab = document.getElementById(tabId);
  if(targetTab) targetTab.classList.add('active');
  
  const targetBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
  if(targetBtn) targetBtn.classList.add('active');
}

// --- ΣΥΝΔΕΣΗ (AUTH) ---
firebase.auth().onAuthStateChanged((user) => {
  // Αποκλεισμός ανώνυμων χρηστών που προέρχονται από το μαθητικό widget
  if (user && !user.isAnonymous) {
    let loginEl = document.getElementById("login-screen");
    let adminEl = document.getElementById("admin-panel");
    if(loginEl) loginEl.style.display = "none";
    if(adminEl) adminEl.style.display = "block";
    loadAdminData();
  } else {
    let loginEl = document.getElementById("login-screen");
    let adminEl = document.getElementById("admin-panel");
    if(loginEl) loginEl.style.display = "block";
    if(adminEl) adminEl.style.display = "none";
  }
});

function loginAdmin() {
  const email = document.getElementById("admin-email").value;
  const pass = document.getElementById("admin-pass").value;
  firebase.auth().signInWithEmailAndPassword(email, pass).catch(() => showToast("Λάθος Email ή Κωδικός!", true));
}

// --- ΦΟΡΤΩΣΗ ΔΕΔΟΜΕΝΩΝ ΑΠΟ FIREBASE ---
function loadAdminData() {
  db.ref("album_settings/current_theme").off(); // Καθαρισμός παλιού ακροατή
  db.ref("album_settings/current_theme").on("value", snap => {
    let theme = snap.val();
    currentThemeId = theme ? theme.id : "";
    let themeNameEl = document.getElementById("active-theme-name");
    if(themeNameEl) themeNameEl.innerText = theme ? theme.name : "Κανένα";
    renderThemes();
  });

 db.ref("album_settings/themes").off(); // Καθαρισμός παλιού ακροατή
  db.ref("album_settings/themes").on("value", snap => {
    allThemes = snap.val() || {};
    renderThemes();
    renderPhotos(); 
  });

  fetchPhotosWithLimit();
} 

// Παγκόσμιες μεταβλητές ψηλά, δίπλα στο `let photosListenerRef = null;`
let pendingListenerRef = null;
let latestSnapData = null;
let pendingSnapData = null;

function fetchPhotosWithLimit() {
  if (photosListenerRef) photosListenerRef.off();
  if (pendingListenerRef) pendingListenerRef.off(); // Καθαρίζουμε και τον 2ο ακροατή
  
  // Κεντρική συνάρτηση που ενώνει τα 2 ζωντανά ρεύματα δεδομένων
  const mergeAndRender = () => {
      if (!latestSnapData || !pendingSnapData) return;
      
      let pendingMap = {};
      if (pendingSnapData.exists()) pendingSnapData.forEach(c => { pendingMap[c.key] = c.val(); });
      
      allPhotos = [];
      if (latestSnapData.exists()) {
          latestSnapData.forEach(child => {
            let p = child.val(); p.key = child.key;
            allPhotos.push(p);
            delete pendingMap[child.key]; 
          });
      }
      
      Object.keys(pendingMap).forEach(key => { let p = pendingMap[key]; p.key = key; allPhotos.push(p); });
      
      // ΔΙΟΡΘΩΣΗ (βλέπε Bug 2): Ασφαλής ταξινόμηση ASCII
      allPhotos.sort((a, b) => a.key > b.key ? -1 : (a.key < b.key ? 1 : 0));
      
      renderPhotos();
      
      let loadBtn = document.getElementById('load-more-btn');
      if(loadBtn) loadBtn.style.display = (latestSnapData.numChildren() >= photoLimit) ? 'inline-block' : 'none';
  };

  // Μόνιμος Ακροατής #1 (Οι τελευταίες φωτογραφίες)
  photosListenerRef = db.ref("album_photos").orderByKey().limitToLast(photoLimit);
  photosListenerRef.on("value", snap => {
      latestSnapData = snap;
      mergeAndRender();
  });

  // Μόνιμος Ακροατής #2 (ΟΛΕΣ οι εκκρεμότητες, παρακολουθούνται ζωντανά 24/7)
  pendingListenerRef = db.ref("album_photos").orderByChild("status").equalTo("pending");
  pendingListenerRef.on("value", snap => {
      pendingSnapData = snap;
      mergeAndRender();
  });
}

function loadMorePhotos() {
  photoLimit += 40; 
  fetchPhotosWithLimit();
}

function renderThemes() {
  const list = document.getElementById("theme-list");
  const filter = document.getElementById("theme-filter");
  const bulkMoveSelect = document.getElementById("bulk-move-theme");
  
  if(!list || !filter) return;

  const oldFilter = filter.value;
  const oldBulkMove = bulkMoveSelect ? bulkMoveSelect.value : "";
  
  list.innerHTML = "";
  filter.innerHTML = '<option value="all">Όλα τα Θέματα</option>';
  if (bulkMoveSelect) bulkMoveSelect.innerHTML = '<option value="">-- Μεταφορά σε Θέμα --</option>';
  
let hasThemes = false;
  let themesCount = 0; // <--- ΝΕΑ ΜΕΤΑΒΛΗΤΗ
  
  for (let key in allThemes) {
    hasThemes = true;
    themesCount++; // <--- ΑΥΞΗΣΗ ΚΑΤΑ 1
    let t = allThemes[key];
    let isCurrent = (key === currentThemeId);
    let isArchived = t.archived === true;
    
   let safeName = t.name ? t.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    filter.innerHTML += `<option value="${key}">${safeName} ${isArchived ? '(Αρχειοθετημένο)' : ''}</option>`;
    if (bulkMoveSelect && !isArchived) bulkMoveSelect.innerHTML += `<option value="${key}">${safeName}</option>`;

    
let badge = isCurrent ? '<span class="theme-status" style="background:var(--success);">ΕΝΕΡΓΟ</span>' : (isArchived ? '<span class="theme-status" style="background:var(--gray);">ΑΡΧΕΙΟΘΕΤΗΜΕΝΟ</span>' : '');
    let btns = '';
if (!isCurrent) btns += `<button class="btn btn-success" style="padding: 8px 12px; margin-right: 5px;" onclick="setActiveTheme('${key}')">⭐ Ορισμός Ενεργό</button>`;
    if (!isCurrent && !isArchived) btns += `<button class="btn btn-outline" style="color:var(--dark); border-color:#ccc; padding: 8px 12px; margin-right: 5px;" onclick="archiveTheme('${key}')">📦 Αρχειοθέτηση</button>`;
    if (isArchived) btns += `<button class="btn btn-outline" style="color:var(--primary); border-color:#ccc; padding: 8px 12px; margin-right: 5px;" onclick="unarchiveTheme('${key}')">♻️ Επαναφορά</button>`;
    if (!isCurrent) btns += `<button class="btn btn-danger" style="padding: 8px 12px;" onclick="deleteTheme('${key}')">🗑️ Διαγραφή</button>`;
    
    list.innerHTML += `
      <div class="theme-item" ondragover="event.preventDefault()" ondrop="dropPhoto(event, '${key}')" ${isCurrent ? 'style="border-left: 4px solid var(--success);"' : ''}>
      <div><strong style="font-size:16px;">${safeName}</strong> ${badge}</div>
        <div>${btns}</div>
      </div>
    `;
  }
  if (!hasThemes) list.innerHTML = "<p style='color:#888;'>Δεν υπάρχουν θέματα.</p>";
  
 // Αφαιρέθηκε η περιττή διπλοτυπία που επιβάρυνε τον browser
  if (document.querySelector(`#theme-filter option[value="${oldFilter}"]`)) filter.value = oldFilter;
  if (bulkMoveSelect && document.querySelector(`#bulk-move-theme option[value="${oldBulkMove}"]`)) bulkMoveSelect.value = oldBulkMove;

  // ΝΕΟΣ ΚΩΔΙΚΑΣ: Ενημέρωση badge Θεμάτων
  const themesBadge = document.getElementById("themes-badge");
  if(themesBadge) {
      themesBadge.innerText = themesCount;
      themesBadge.style.display = themesCount > 0 ? "inline-block" : "none";
  }
}

function renderPhotos() {
  const grids = {
    pending: document.getElementById("pending-photos"),
    approved: document.getElementById("approved-photos"),
    trashed: document.getElementById("trashed-photos")
  };
  let gridIdx = { pending: 0, approved: 0, trashed: 0 }; // ΝΕΟ
 let themeFilterEl = document.getElementById("theme-filter");
  const themeFilter = themeFilterEl ? themeFilterEl.value : "all";
  
  let pendingCount = 0; let approvedCount = 0; 
  let trashedCount = 0; let totalApprovedCount = 0; // <--- ΝΕΕΣ ΜΕΤΑΒΛΗΤΕΣ
  const activeKeys = new Set();

if (document.getElementById("pending-empty")) document.getElementById("pending-empty").remove();
  if (document.getElementById("approved-empty")) document.getElementById("approved-empty").remove();
  if (document.getElementById("trashed-empty")) document.getElementById("trashed-empty").remove();

  allPhotos.forEach(photo => {
    if (!photo || !photo.url) return; // Προστασία από εγγραφές χωρίς εικόνα που κρασάρουν το σύστημα
  let tData = allThemes[photo.theme_id];
    let themeName = tData && tData.name ? tData.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "Παλιό/Διαγραμμένο Θέμα";
    let angleParam = photo.angle ? `a_${photo.angle},` : '';
    let thumbUrl = photo.url.replace('/upload/', `/upload/${angleParam}w_400,q_auto,f_auto/`);
    
 let safeCaption = photo.caption ? photo.caption.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;") : "";
    let captionHtml = "";
  if (editMode[photo.key]) {
      captionHtml = `
        <div style="width:100%; display:flex; flex-direction:column;">
          <textarea id="edit-input-${photo.key}" class="caption-input" rows="2" maxlength="150" placeholder="Γράψε λεζάντα...">${safeCaption.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}</textarea>
          <div style="display:flex; gap:5px;">
            <button class="btn btn-success" style="flex:1; padding:5px; font-size:12px;" onclick="saveCaption('${photo.key}')">💾 OK</button>
            <button class="btn btn-gray" style="flex:1; padding:5px; font-size:12px;" onclick="cancelCaption('${photo.key}')">Άκυρο</button>
          </div>
        </div>`;
 } else {
   let dispCaption = photo.caption ? `💬 "${safeCaption.replace(/\n/g, '<br>')}"` : "(Χωρίς λεζάντα)";
      let style = photo.caption ? "font-style:italic;" : "font-style:italic; color:#aaa;";
      captionHtml = `
        <div style="padding-right: 25px; ${style}">${dispCaption}</div>
        <button class="edit-icon" onclick="startCaptionEdit('${photo.key}')" title="Διόρθωση Λεζάντας">✏️</button>`;
    }

    let isVisible = true;
    let targetGrid = null;
    let buttonsHtml = '';

if (photo.status === "pending") {
      pendingCount++; targetGrid = grids.pending;
      buttonsHtml = `
        <button class="btn btn-success btn-block" onclick="approvePhoto('${photo.key}')">✔️ Έγκριση</button>
        <button class="btn btn-danger btn-block" onclick="deletePhoto('${photo.key}')">❌ Διαγραφή</button>
      `;
  } else if (photo.status === "approved") {
      totalApprovedCount++; // <--- Μετράει ΟΛΕΣ τις εγκεκριμένες για το badge
      if (themeFilter === "all" || photo.theme_id === themeFilter) {
        approvedCount++; targetGrid = grids.approved;
        buttonsHtml = `<button class="btn btn-outline btn-block" onclick="deletePhoto('${photo.key}', true)">🗑️ Απόσυρση (Στον Κάδο)</button>`;
      } else {
        isVisible = false;
      }
} else if (photo.status === "trashed") {
      trashedCount++; // <--- Μετράει πόσες είναι στον κάδο
      targetGrid = grids.trashed;
      buttonsHtml = `
        <div style="display:flex; gap:5px; margin-top:5px;">
          <button class="btn btn-success" style="flex:1;" onclick="restorePhoto('${photo.key}')">♻️ Επαναφορά</button>
          <button class="btn btn-danger" style="flex:1;" onclick="hardDeletePhoto('${photo.key}')">🔥 Οριστική</button>
        </div>`;
    }

    if (isVisible) activeKeys.add(photo.key);

    let cardId = `photo-card-${photo.key}`;
    let existingCard = document.getElementById(cardId);

    if (!isVisible || !targetGrid) {
      if (existingCard) existingCard.remove();
      return; 
    }
let innerHtml = `
      <!-- ΔΙΟΡΘΩΣΗ: Δυναμική ακύρωση του "Επιλογή Όλων" αν ο χρήστης ξε-τικάρει χειροκίνητα μία κάρτα -->
      <input type="checkbox" class="cb-bulk chk-${photo.status}" value="${photo.key}" onchange="if(!this.checked){ let sAll = document.getElementById('selectAll-${photo.status}'); if(sAll) sAll.checked = false; }">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; margin-top:25px;">
        <span class="theme-badge" ${photo.status === 'approved' ? 'style="background:#eafaf1; color:var(--success);"' : ''}>📁 ${themeName}</span>
        <button onclick="rotatePhoto('${photo.key}')" title="Περιστροφή 90°" style="background:white; border:1px solid #ccc; border-radius:4px; cursor:pointer; padding:2px 6px; box-shadow:0 1px 3px rgba(0,0,0,0.1); position:relative; z-index:11;">↻</button>
      </div>
   <img src="${thumbUrl}" draggable="false" onclick="openAdminLightbox('${photo.key}')" loading="lazy" title="Κλικ για μεγέθυνση (Slideshow)" style="cursor:pointer;">
      <div class="caption-box">${captionHtml}</div>
      ${buttonsHtml}
    `;

 if (existingCard) {
      existingCard.draggable = !editMode[photo.key];
      
      // 1. Προσωρινή αποθήκευση εστίασης ΠΡΙΝ το appendChild, ανεξάρτητα από το αν άλλαξε το HTML
      let editInput = document.getElementById(`edit-input-${photo.key}`);
      let isFocused = editInput ? (document.activeElement === editInput) : false;
      let currentEditText = editInput ? editInput.value : null;
      let caretStart = editInput && isFocused ? editInput.selectionStart : null;
      let caretEnd = editInput && isFocused ? editInput.selectionEnd : null;

      if (existingCard.dataset.content !== innerHtml) {
        let cb = existingCard.querySelector('.cb-bulk');
        // 2. Διατήρηση του τικ ΜΟΝΟ αν η φωτογραφία παραμένει στην ίδια καρτέλα (ίδιο status)
        let isChecked = (cb && cb.classList.contains(`chk-${photo.status}`)) ? cb.checked : false;
        
        existingCard.innerHTML = innerHtml;
        existingCard.dataset.content = innerHtml;
        
        let newCb = existingCard.querySelector('.cb-bulk');
        if (newCb) newCb.checked = isChecked;
        
        if (currentEditText !== null) {
            let newEditInput = document.getElementById(`edit-input-${photo.key}`);
            if (newEditInput) newEditInput.value = currentEditText;
        }
      }

     if (photo.status === 'approved') existingCard.style.borderTop = "4px solid var(--success)";
      else existingCard.style.borderTop = "none";
      
      // ΔΙΟΡΘΩΣΗ: Αλλάζουμε θέση στην κάρτα ΜΟΝΟ αν δεν βρίσκεται ήδη στη σωστή (αποτροπή DOM Thrashing)
      let currentType = photo.status;
      let expectedNode = targetGrid.children[gridIdx[currentType]];
      if (expectedNode !== existingCard) {
          targetGrid.insertBefore(existingCard, expectedNode || null);
      }
      gridIdx[currentType]++;

      // 3. Επαναφορά εστίασης ΑΥΣΤΗΡΑ ΜΕΤΑ την τοποθέτηση
      if (isFocused) {
          let finalEditInput = document.getElementById(`edit-input-${photo.key}`);
          if (finalEditInput) {
              finalEditInput.focus();
              if (caretStart !== null) finalEditInput.setSelectionRange(caretStart, caretEnd);
          }
      }
  } else {
      let newCard = document.createElement('div');
      newCard.className = 'photo-card';
      newCard.id = cardId;
      newCard.draggable = !editMode[photo.key]; // Απε
      newCard.ondragstart = (event) => dragStart(event, photo.key);
      if (photo.status === 'approved') newCard.style.borderTop = "4px solid var(--success)";
      
     newCard.innerHTML = innerHtml;
      newCard.dataset.content = innerHtml;
      
      // ΔΙΟΡΘΩΣΗ: Ακριβής τοποθέτηση για τις νέες κάρτες
      let currentType = photo.status;
      targetGrid.insertBefore(newCard, targetGrid.children[gridIdx[currentType]] || null);
      gridIdx[currentType]++;
    }
  });

  document.querySelectorAll('.photo-card').forEach(card => {
    let key = card.id.replace('photo-card-', '');
    if (!activeKeys.has(key)) card.remove();
  });

 const pendingBadge = document.getElementById("pending-badge");
  if(pendingBadge) {
      if (pendingCount > 0) {
        pendingBadge.innerText = pendingCount; 
        pendingBadge.style.display = "inline-block";
      } else {
        pendingBadge.style.display = "none";
        if (grids.pending) grids.pending.innerHTML = `<div id="pending-empty" class="empty-state"><span style="font-size:40px;">☕</span><br><br><strong>Όλα καθαρά!</strong><br>Δεν υπάρχουν νέες φωτογραφίες προς έγκριση.</div>`;
      }
  }

  // ΝΕΟΣ ΚΩΔΙΚΑΣ: Ενημέρωση Εγκεκριμένων
  const approvedBadge = document.getElementById("approved-badge");
  if(approvedBadge) {
      approvedBadge.innerText = totalApprovedCount;
      approvedBadge.style.display = totalApprovedCount > 0 ? "inline-block" : "none";
  }

  // ΝΕΟΣ ΚΩΔΙΚΑΣ: Ενημέρωση Κάδου
  const trashBadge = document.getElementById("trash-badge");
  if(trashBadge) {
      trashBadge.innerText = trashedCount;
      trashBadge.style.display = trashedCount > 0 ? "inline-block" : "none";
  }
  
if (approvedCount === 0 && grids.approved) {
    grids.approved.innerHTML = `<div id="approved-empty" class="empty-state">Δεν βρέθηκαν εγκεκριμένες φωτογραφίες.</div>`;
  }

if (trashedCount === 0 && grids.trashed) {
    grids.trashed.innerHTML = `<div id="trashed-empty" class="empty-state">Ο κάδος είναι άδειος.</div>`;
  }

  // Αποσυγχρονισμός Checkbox: Απεπιλογή αν προστεθούν νέες φωτογραφίες ζωντανά
  ['pending', 'approved', 'trashed'].forEach(type => {
      let sAll = document.getElementById(`selectAll-${type}`);
      if (sAll && sAll.checked) {
          let totalCount = document.querySelectorAll(`.chk-${type}`).length;
          let checkedCount = document.querySelectorAll(`.chk-${type}:checked`).length;
          if (totalCount !== checkedCount) sAll.checked = false;
      }
  });

 let statPending = document.getElementById('stat-pending-dash');
  if (statPending) {
    statPending.innerText = pendingCount;
    let statApp = document.getElementById('stat-approved-dash');
    if(statApp) statApp.innerText = totalApprovedCount;
    let statTot = document.getElementById('stat-total');
    if(statTot) statTot.innerText = allPhotos.filter(p => p.status !== 'trashed').length;
  }
  
  // ΔΙΟΡΘΩΣΗ: Ζωντανός συγχρονισμός του Admin Lightbox ώστε να συμβαδίζει με τη Firebase
  let adminLb = document.getElementById('admin-panel-lightbox');
  if (adminLb && adminLb.style.display === 'flex' && adminLbPhotos.length > 0) {
      let currentKey = adminLbPhotos[adminLbIndex].key;
      let activeTab = document.querySelector('.tab-content.active') ? document.querySelector('.tab-content.active').id : "";
      let tFilter = document.getElementById("theme-filter") ? document.getElementById("theme-filter").value : "all";
      
      adminLbPhotos = allPhotos.filter(p => {
          if (activeTab === 'tab-pending' && p.status === 'pending') return true;
          if (activeTab === 'tab-approved' && p.status === 'approved') return (tFilter === 'all' || p.theme_id === tFilter);
          if (activeTab === 'tab-trash' && p.status === 'trashed') return true;
          return false;
      });

     let newIndex = adminLbPhotos.findIndex(p => p.key === currentKey);
      if (newIndex !== -1) {
          adminLbIndex = newIndex;
          renderAdminLightbox();
      } else {
          if (adminLbPhotos.length > 0) { 
              // ΔΙΟΡΘΩΣΗ: Αν η φώτο μόλις εγκρίθηκε/διεγράφη, ΜΕΙΝΕ στο ίδιο index (για να δεις αμέσως την επόμενη)!
              if (adminLbIndex >= adminLbPhotos.length) adminLbIndex = adminLbPhotos.length - 1;
              renderAdminLightbox(); 
          }
          else closeAdminLightbox();
      }
  }
}

function startCaptionEdit(id) { 
  editMode[id] = true; 
  renderPhotos(); 

  // ΠΡΟΣΘΗΚΗ: Αυτόματη εστίαση (Autofocus) ώστε ο Admin να ξεκινάει κατευθείαν να γράφει
  setTimeout(() => {
    let el = document.getElementById(`edit-input-${id}`);
    if(el) {
      el.focus();
      // Τοποθετεί τον κέρσορα στο τέλος του υπάρχοντος κειμένου
      el.selectionStart = el.selectionEnd = el.value.length; 
    }
  }, 10);
}
function cancelCaption(id) { editMode[id] = false; renderPhotos(); }
function saveCaption(id) {
  let el = document.getElementById(`edit-input-${id}`);
  if(!el) return;
  let val = el.value.trim();
  
  editMode[id] = false; 
  
  // Τοπική ενημέρωση μνήμης για άμεση αλλαγή χωρίς τρεμόπαιγμα
  let photo = allPhotos.find(p => p.key === id);
  if (photo) photo.caption = val;
  
  renderPhotos(); 

 db.ref("album_photos/" + id + "/caption").set(val).then(() => {
    showToast("Η λεζάντα αποθηκεύτηκε!");
  }).catch(err => {
    // ΔΙΟΡΘΩΣΗ: Ενημέρωση του χρήστη αν κοπεί από τους κανόνες ασφαλείας της Firebase
    showToast("Αποτυχία! Μήπως ξεπεράσατε τους 150 χαρακτήρες;", true);
    
    // Επαναφορά της τοπικής μνήμης στην αρχική λεζάντα για να μην δείχνει ψέματα η οθόνη
    db.ref("album_photos/" + id).once("value").then(snap => {
        let p = allPhotos.find(x => x.key === id);
        if(p && snap.exists()) { p.caption = snap.val().caption; renderPhotos(); }
    });
  });
  // Το renderPhotos() καλείται πλέον αυτόματα από τον real-time listener της Firebase
}

// ==============================================================
// --- ΑΠΛΕΣ & ΜΑΖΙΚΕΣ ΕΝΕΡΓΕΙΕΣ ΦΩΤΟΓΡΑΦΙΩΝ (ΜΕ SWEETALERT2) ---
// ==============================================================

function approvePhoto(id) { 
  let p = allPhotos.find(x => x.key === id);
  if(p) db.ref("album_photos/" + id).update({ status: "approved", theme_status: p.theme_id + "_approved" }); 
  showToast("Η φωτογραφία εγκρίθηκε!"); 
}

async function deletePhoto(id, isApproved = false) {
  const result = await Swal.fire({
    title: 'Είστε σίγουροι;',
    text: isApproved ? "Να αποσυρθεί η φωτογραφία (στον Κάδο);" : "Να μεταφερθεί στον κάδο;",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Ναι, μεταφορά!',
    cancelButtonText: 'Άκυρο'
  });

if (result.isConfirmed) {
    let p = allPhotos.find(x => x.key === id);
    if(p) db.ref("album_photos/" + id).update({ status: "trashed", theme_status: p.theme_id + "_trashed" });
    showToast("Μεταφέρθηκε στον Κάδο!");
    return true; 
  }
   return false;
}


function restorePhoto(id) {
  let p = allPhotos.find(x => x.key === id);
  if(p) db.ref("album_photos/" + id).update({ status: "pending", theme_status: p.theme_id + "_pending" });
  showToast("Η φωτογραφία επανήλθε!");
}

async function hardDeletePhoto(id) {
  const result = await Swal.fire({
    title: 'Οριστική Διαγραφή!',
    text: "Δεν υπάρχει επιστροφή. Συνέχεια;",
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Ναι, διαγραφή!',
    cancelButtonText: 'Άκυρο'
  });
  
  if (result.isConfirmed) {
    db.ref("album_photos/" + id).remove();
  }
}

async function emptyTrash() {
  const result = await Swal.fire({
    title: 'Σίγουρα;',
    text: "Θες να αδειάσεις τον κάδο; Αυτό δεν αναιρείται!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Ναι, άδειασμα!',
    cancelButtonText: 'Άκυρο'
  });
  
if (result.isConfirmed) {
    db.ref("album_photos").orderByChild("status").equalTo("trashed").once("value", snap => {
      if (!snap.exists()) {
          showToast("Ο κάδος είναι ήδη άδειος!", true);
          return; 
      }

      let updates = {};
      snap.forEach(child => { updates[child.key] = null; });
      db.ref("album_photos").update(updates).then(() => {
          showToast("Ο κάδος άδειασε εντελώς!");
      });
    });
  }
}

function toggleSelectAll(type) {
  let cb = document.getElementById(`selectAll-${type}`);
  if(!cb) return;
  let checked = cb.checked;
  document.querySelectorAll(`.chk-${type}`).forEach(c => c.checked = checked);
}

async function bulkAction(type, action) {
  let cbs = document.querySelectorAll(`.chk-${type}:checked`);
  if(cbs.length === 0) { showToast("Δεν έχεις επιλέξει καμία φωτογραφία!", true); return; }
  
  if(action === 'delete' || action === 'withdraw') {
    const result = await Swal.fire({
      title: 'ΠΡΟΣΟΧΗ',
      text: "Οι επιλεγμένες φωτογραφίες θα μεταφερθούν στον Κάδο. Συνέχεια;",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Ναι, μεταφορά',
      cancelButtonText: 'Άκυρο'
    });
    if (!result.isConfirmed) return; 
  }
  
  let updates = {};
cbs.forEach(cb => {
    let p = allPhotos.find(x => x.key === cb.value);
    if (p) {
      if(action === 'approve') {
        updates[`album_photos/${cb.value}/status`] = "approved";
        updates[`album_photos/${cb.value}/theme_status`] = p.theme_id + "_approved";
      }
      if(action === 'delete' || action === 'withdraw') {
        updates[`album_photos/${cb.value}/status`] = "trashed";
        updates[`album_photos/${cb.value}/theme_status`] = p.theme_id + "_trashed";
      }
    }
  });
  
// Απεπιλογή ΠΡΙΝ το update, ώστε η αστραπιαία ανανέωση να μην τα κρατήσει τσεκαρισμένα
  cbs.forEach(cb => cb.checked = false); 
  let sAll = document.getElementById(`selectAll-${type}`);
  if(sAll) sAll.checked = false;

  db.ref().update(updates).then(() => {
    showToast(`Επιτυχής μαζική ενέργεια σε ${cbs.length} φωτογραφίες!`);
  }).catch(() => {
    showToast("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.", true);
  });
}

function bulkMoveSelected() {
  const themeSelect = document.getElementById("bulk-move-theme");
  const targetThemeId = themeSelect ? themeSelect.value : "";
  
  if (!targetThemeId) {
    showToast("Παρακαλώ επίλεξε ένα θέμα προορισμού από τη λίστα!", true);
    return;
  }

 // Στόχευση στη γενική κλάση `.cb-bulk` για να δουλεύει σε όλες τις καρτέλες
  const selectedPhotos = document.querySelectorAll('.cb-bulk:checked');
  if (selectedPhotos.length === 0) {
    showToast("Δεν έχεις επιλέξει καμία φωτογραφία προς μεταφορά!", true);
    return;
  }

  let updates = {};
 selectedPhotos.forEach(cb => {
    let p = allPhotos.find(x => x.key === cb.value);
    if (p) {
      updates[`album_photos/${cb.value}/theme_id`] = targetThemeId;
      updates[`album_photos/${cb.value}/theme_status`] = targetThemeId + "_" + p.status;
    }
  });

 // Απεπιλογή ΠΡΙΝ το update, ώστε το ακαριαίο DOM re-render της Firebase να μην κρατήσει τα νέα checkboxes τσεκαρισμένα!
  selectedPhotos.forEach(cb => cb.checked = false); 
  document.querySelectorAll('input[id^="selectAll-"]').forEach(el => el.checked = false);
  
  db.ref().update(updates).then(() => {
    if (themeSelect) themeSelect.value = "";
    showToast(`Επιτυχής μεταφορά φωτογραφιών!`);
  }).catch(() => {
    showToast("Σφάλμα κατά τη μεταφορά.", true);
  });
}

// ==========================================
// --- ΔΙΑΧΕΙΡΙΣΗ ΘΕΜΑΤΩΝ ---
// ==========================================

function setNewTheme() {
  let el = document.getElementById("new-theme-name");
  if(!el) return;
  const name = el.value.trim();
  if(!name) return;
  const themeId = "theme_" + Date.now();
  db.ref("album_settings/themes/" + themeId).set({ name: name, timestamp: Date.now(), archived: false });
  setActiveTheme(themeId, name);
  el.value = "";
  showToast("Το νέο θέμα δημιουργήθηκε!");
}

function setActiveTheme(id, providedName = "") {
  // Ανάκτηση του καθαρού ονόματος από τη μνήμη ή χρήση του ονόματος που μόλις δόθηκε
  const cleanName = allThemes[id] ? allThemes[id].name : providedName;
  db.ref("album_settings/current_theme").set({ id: id, name: cleanName });
  db.ref("album_settings/themes/" + id + "/archived").set(false);
  showToast("Το θέμα είναι πλέον ενεργό!");
}

function unarchiveTheme(id) {
  db.ref("album_settings/themes/" + id + "/archived").set(false);
  showToast("Το θέμα επανήλθε από το αρχείο.");
}

// Η σωστή και μοναδική πλέον συνάρτηση archiveTheme
async function archiveTheme(id) {
  const result = await Swal.fire({
    title: 'Αρχειοθέτηση Θέματος;',
    text: "Οι γονείς δεν θα μπορούν να ανεβάσουν σε αυτό, αλλά οι παλιές φωτογραφίες κρατούν το όνομά τους. Συνέχεια;",
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3498db',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Ναι, αρχειοθέτηση',
    cancelButtonText: 'Άκυρο'
  });
  
  if (result.isConfirmed) {
    db.ref("album_settings/themes/" + id + "/archived").set(true);
    if(id === currentThemeId) db.ref("album_settings/current_theme").remove();
    showToast("Το θέμα αρχειοθετήθηκε.");
  }
}

async function deleteTheme(id) {
  const result = await Swal.fire({
    title: 'Οριστική Διαγραφή;',
    text: "Το θέμα θα διαγραφεί οριστικά! Οι φωτογραφίες του θα εμφανίζονται πλέον ως 'Παλιό/Διαγραμμένο Θέμα'. Δεν υπάρχει επιστροφή. Συνέχεια;",
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Ναι, διαγραφή!',
    cancelButtonText: 'Άκυρο'
  });
  
  if (result.isConfirmed) {
    db.ref("album_settings/themes/" + id).remove();
    if(id === currentThemeId) db.ref("album_settings/current_theme").remove(); // Για λόγους ασφαλείας
    showToast("Το θέμα διαγράφηκε οριστικά.");
  }
}

function rotatePhoto(id) {
  let photo = allPhotos.find(p => p.key === id);
  if (!photo) return;
  let newAngle = ((photo.angle || 0) + 90) % 360;
  photo.angle = newAngle; // Τοπική ενημέρωση ώστε τα γρήγορα συνεχόμενα κλικ να λειτουργούν σωστά
  db.ref("album_photos/" + id + "/angle").set(newAngle);
}

function dragStart(ev, photoId) {
  ev.dataTransfer.setData("photoId", photoId);
}
function dropPhoto(ev, newThemeId) {
  ev.preventDefault();
  let photoId = ev.dataTransfer.getData("photoId");
  if(photoId && newThemeId) {
    let p = allPhotos.find(x => x.key === photoId);
    if(p) {
      db.ref("album_photos/" + photoId).update({ theme_id: newThemeId, theme_status: newThemeId + "_" + p.status });
      showToast("Το θέμα άλλαξε επιτυχώς!");
    }
  }
}


// ==========================================
// --- ADMIN LIGHTBOX LOGIC ---
// ==========================================
let adminLbPhotos = [];
let adminLbIndex = 0;

function openAdminLightbox(key) {
  const activeTabEl = document.querySelector('.tab-content.active');
  const activeTab = activeTabEl ? activeTabEl.id : "";
  const themeFilterEl = document.getElementById("theme-filter");
  const themeFilter = themeFilterEl ? themeFilterEl.value : "all";

  adminLbPhotos = allPhotos.filter(p => {
    if (activeTab === 'tab-pending' && p.status === 'pending') return true;
    if (activeTab === 'tab-approved' && p.status === 'approved') return (themeFilter === 'all' || p.theme_id === themeFilter);
    if (activeTab === 'tab-trash' && p.status === 'trashed') return true;
    return false;
  });

  adminLbIndex = adminLbPhotos.findIndex(p => p.key === key);
  if (adminLbIndex === -1) return;

  renderAdminLightbox();
  let lb = document.getElementById('admin-panel-lightbox');
  if(lb) lb.style.display = 'flex';
  document.addEventListener('keydown', adminLightboxKeyHandler);
}

function renderAdminLightbox() {
  // ΠΡΟΣΘΗΚΗ: Μπλοκάρισμα της αντικατάστασης του UI από ζωντανές ενημερώσεις της Firebase όσο διαρκεί η θόλωση
  if (typeof isBlurMode !== 'undefined' && isBlurMode) return;

  if (adminLbPhotos.length === 0) { closeAdminLightbox(); return; }
  
  let p = adminLbPhotos[adminLbIndex];
let angleParam = p.angle ? `a_${p.angle}/` : '';
  let fullUrl = p.url.replace('/upload/', `/upload/${angleParam}w_1920,c_limit,q_auto,f_auto/`);
  
  let imgEl = document.getElementById('admin-panel-lightbox-img');
  if(imgEl) imgEl.src = fullUrl;
  
  let counterEl = document.getElementById('admin-lightbox-counter');
  if(counterEl) counterEl.innerText = `${adminLbIndex + 1} / ${adminLbPhotos.length}`;
  
  let captionEl = document.getElementById('admin-lightbox-caption');
  if(captionEl) captionEl.innerText = p.caption ? `💬 "${p.caption}"` : "";
  
  let actionsDiv = document.getElementById('admin-panel-lightbox-actions');
  if(actionsDiv) {
      let actionsHtml = '';
      
      if (p.status === 'pending') {
        actionsHtml += `
          <button class="btn btn-success" style="font-size:18px; padding:12px 24px;" onclick="lbAction('${p.key}', 'approve')">✔️ Έγκριση (Enter)</button>
          <button class="btn btn-danger" style="font-size:18px; padding:12px 24px;" onclick="lbAction('${p.key}', 'delete')">❌ Στον Κάδο (Del)</button>`;
      }
      
      actionsHtml += `<button class="btn" style="background-color: #f39c12; color: white; font-size:18px; padding:12px 24px; font-weight: bold; margin-left: 10px;" onclick="toggleBlurMode('${p.key}')">🎭 Εργαλείο Θόλωσης</button>`;
      
      actionsDiv.innerHTML = actionsHtml;
  }
}

function navAdminLightbox(step) {
  if (typeof isBlurMode !== 'undefined' && isBlurMode) {
    cancelBlurMode();
  }

  adminLbIndex += step;
  if (adminLbIndex < 0) adminLbIndex = adminLbPhotos.length - 1;
  if (adminLbIndex >= adminLbPhotos.length) adminLbIndex = 0;
  renderAdminLightbox();
}

function closeAdminLightbox() {
  if (typeof isBlurMode !== 'undefined' && isBlurMode) cancelBlurMode(); 
  let lb = document.getElementById('admin-panel-lightbox');
  if(lb) lb.style.display = 'none';
  document.removeEventListener('keydown', adminLightboxKeyHandler);
}

function adminLightboxKeyHandler(e) {
  let lb = document.getElementById('admin-panel-lightbox');
  if (!lb || lb.style.display !== 'flex') return;
  
  if (typeof Swal !== 'undefined' && Swal.isVisible()) return;

  // Το Escape πρέπει να εκτελείται πρώτο, για να μπορεί να ακυρώσει τη λειτουργία θόλωσης!
  if (e.key === 'Escape') {
      if (typeof isBlurMode !== 'undefined' && isBlurMode) cancelBlurMode();
      else closeAdminLightbox();
      return;
  }
  
  // Τώρα μπλοκάρουμε τα υπόλοιπα πλήκτρα αν είμαστε σε λειτουργία θόλωσης
  if (typeof isBlurMode !== 'undefined' && isBlurMode) return; 

  if (e.key === 'ArrowRight') { e.preventDefault(); navAdminLightbox(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); navAdminLightbox(-1); }
  
  let p = adminLbPhotos[adminLbIndex];
  if (p && p.status === 'pending') {
    if (e.key === 'Enter') { e.preventDefault(); lbAction(p.key, 'approve'); }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); lbAction(p.key, 'delete'); }
  }
}

async function lbAction(key, action) {
  let photo = allPhotos.find(p => p.key === key);
  if (!photo || !photo.url) {
      showToast("Η φωτογραφία έχει ήδη διαγραφεί/αλλοιωθεί!", true);
      closeAdminLightbox();
      return;
  }
  
if (action === 'approve') {
    approvePhoto(key);
  } else if (action === 'delete') {
    await deletePhoto(key);
  }
  // ΔΙΟΡΘΩΣΗ: Αφαιρέθηκε το επικίνδυνο χειροκίνητο splice! Η ζωντανή `renderPhotos` (μέσω Firebase) θα κάνει την ασφαλή εναλλαγή αστραπιαία χωρίς να σπάει τα indexes.
}

// ==========================================
// --- ΕΡΓΑΛΕΙΟ ΘΟΛΩΣΗΣ ΠΡΟΣΩΠΩΝ (FACE BLUR) ---
// ==========================================
const CLOUD_NAME = "drx2a5ane"; 
const UPLOAD_PRESET = "school_album"; 

let isBlurMode = false;
let blurCanvas, blurCtx;
let backupCanvas = document.createElement('canvas'); 
let backupCtx = backupCanvas.getContext('2d');

let isDrawingBlur = false;
let startX, startY;
let currentRect = null;
let currentPhotoKeyBlur = null;

function toggleBlurMode(key) {
    currentPhotoKeyBlur = key;
    isBlurMode = true;
    
    // 1. Δείχνουμε το μήνυμα φόρτωσης αμέσως (η κανονική εικόνα παραμένει ορατή από πίσω μέχρι να κατέβει η νέα)
    let actionsDiv = document.getElementById('admin-panel-lightbox-actions');
    if(actionsDiv) {
        actionsDiv.innerHTML = `<span style="color:white; font-size:16px;">⏳ Φόρτωση εργαλείου θόλωσης...</span>`;
    }
    
    blurCanvas = document.getElementById('blur-canvas');
    if(!blurCanvas) return;
    
    blurCtx = blurCanvas.getContext('2d');
    blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
    
    let p = adminLbPhotos.find(photo => photo.key === key);
    let angleParam = p.angle ? `a_${p.angle}/` : '';
    let fullUrl = p.url.replace('/upload/', `/upload/${angleParam}w_1920,c_limit,q_auto,f_auto/`);
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
    
   let imgObj = new Image();
    imgObj.crossOrigin = "Anonymous"; 
    
    // ΝΕΟ: Απεγκλωβισμός του Admin σε περίπτωση που η εικόνα κοπεί από το δίκτυο
    imgObj.onerror = function() {
        cancelBlurMode();
        showToast("Σφάλμα φόρτωσης. Ελέγξτε τη σύνδεσή σας ή τυχόν Adblockers.", true);
    };

  imgObj.onload = function() {
        // Προστασία: Αν ο Admin ακύρωσε ή άλλαξε εικόνα κατά τη διάρκεια της φόρτωσης, ακυρώνουμε!
        if (!isBlurMode || currentPhotoKeyBlur !== key) return;

     
        let imgEl = document.getElementById('admin-panel-lightbox-img');
        if(imgEl) imgEl.style.display = 'none';
        blurCanvas.style.display = 'block';

        blurCanvas.width = imgObj.width;
        blurCanvas.height = imgObj.height;
        backupCanvas.width = imgObj.width;
        backupCanvas.height = imgObj.height;
        
        blurCtx.drawImage(imgObj, 0, 0);
        backupCtx.drawImage(imgObj, 0, 0); 

        // Β. Εμφανίζουμε τα κουμπιά (Αντικαθιστούν το "Φόρτωση...")
        if(actionsDiv) {
            actionsDiv.innerHTML = `
                <span style="color:white; align-self:center; font-size:15px; margin-right:15px;">👇 Κάνε κλικ & σύρε πάνω σε ένα πρόσωπο (μπορείς πολλά).</span>
                <button class="btn btn-success" style="font-size:16px; padding:10px 20px;" id="save-blur-btn" onclick="saveBlurredImage()">💾 Αποθήκευση & Αντικατάσταση</button>
                <button class="btn btn-gray" style="font-size:16px; padding:10px 20px;" onclick="cancelBlurMode()">❌ Ακύρωση</button>
            `;
        }
    };
    imgObj.src = fullUrl;

    blurCanvas.onmousedown = handleBlurDown;
    blurCanvas.onmousemove = handleBlurMove;
    blurCanvas.onmouseup = handleBlurUp;
    blurCanvas.onmouseout = handleBlurUp;
    
    blurCanvas.ontouchstart = (e) => { e.preventDefault(); handleBlurDown(e.touches[0]); };
    blurCanvas.ontouchmove = (e) => { e.preventDefault(); handleBlurMove(e.touches[0]); };
    blurCanvas.ontouchend = handleBlurUp;
}

function cancelBlurMode() {
    isBlurMode = false;
    let imgEl = document.getElementById('admin-panel-lightbox-img');
    if(imgEl) imgEl.style.display = 'block';
    
    let bc = document.getElementById('blur-canvas');
    if(bc) bc.style.display = 'none';
    
    renderAdminLightbox(); 
}

function getMousePosCanvas(evt) {
    if(!blurCanvas) return {x:0, y:0};
    const rect = blurCanvas.getBoundingClientRect();
    const scaleX = blurCanvas.width / rect.width;
    const scaleY = blurCanvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

function handleBlurDown(e) {
    if (!isBlurMode) return;
    isDrawingBlur = true;
    const pos = getMousePosCanvas(e);
    startX = pos.x;
    startY = pos.y;
    currentRect = null;
}

function handleBlurMove(e) {
    if (!isDrawingBlur || !blurCtx) return;
    const pos = getMousePosCanvas(e);
    
    blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
    blurCtx.drawImage(backupCanvas, 0, 0);
    
    let w = pos.x - startX;
    let h = pos.y - startY;
    
    let cx = startX + w / 2;
    let cy = startY + h / 2;
    let rx = Math.abs(w / 2);
    let ry = Math.abs(h / 2);
    
    blurCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
    blurCtx.strokeStyle = "red";
    blurCtx.lineWidth = Math.max(2, blurCanvas.width / 500);
    
    blurCtx.beginPath();
    blurCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    blurCtx.fill();
    blurCtx.stroke();
    
    currentRect = {x: startX, y: startY, w: w, h: h};
}

function handleBlurUp(e) {
    if (!isDrawingBlur || !blurCtx) return;
    isDrawingBlur = false;
    
    if (!currentRect || Math.abs(currentRect.w) < 10 || Math.abs(currentRect.h) < 10) {
        blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
        blurCtx.drawImage(backupCanvas, 0, 0);
        return; 
    }

    let cx = currentRect.x + currentRect.w / 2;
    let cy = currentRect.y + currentRect.h / 2;
    let rx = Math.abs(currentRect.w / 2);
    let ry = Math.abs(currentRect.h / 2);

    blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
    blurCtx.drawImage(backupCanvas, 0, 0);
    
    blurCtx.save();
    blurCtx.beginPath();
    blurCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    blurCtx.clip(); 
    
    let blurAmount = Math.max(15, blurCanvas.width / 50); 
    blurCtx.filter = `blur(${blurAmount}px)`; 
    
    blurCtx.drawImage(backupCanvas, 0, 0);
    blurCtx.restore();
    
    backupCtx.clearRect(0, 0, backupCanvas.width, backupCanvas.height);
    backupCtx.drawImage(blurCanvas, 0, 0);
}

function saveBlurredImage() {
    let btn = document.getElementById('save-blur-btn');
    if(btn) {
        btn.innerHTML = "⏳ Ανέβασμα...";
        btn.disabled = true;
    }
    showToast("Η ασφαλής εικόνα ανεβαίνει στο Cloudinary...");

    const dataURL = blurCanvas.toDataURL('image/jpeg', 0.85); 
    const formData = new FormData();
    formData.append("file", dataURL);
    formData.append("upload_preset", UPLOAD_PRESET);

   const targetKey = currentPhotoKeyBlur; // Κλείδωμα της τρέχουσας φωτογραφίας (ώστε να μην επηρεαστεί αν αλλάξει)
    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.secure_url) {
            let updates = {};
            updates[`album_photos/${targetKey}/url`] = data.secure_url;
            updates[`album_photos/${targetKey}/angle`] = null; 
            
            db.ref().update(updates).then(() => {
                showToast("Επιτυχία! Αντικαταστάθηκε με την ασφαλή έκδοση.");
                
                let p = allPhotos.find(x => x.key === targetKey);
                if(p) { p.url = data.secure_url; p.angle = null; }
                
                let lbp = adminLbPhotos.find(x => x.key === targetKey);
                if(lbp) { lbp.url = data.secure_url; lbp.angle = null; }
                
                if (currentPhotoKeyBlur === targetKey) cancelBlurMode(); // Κλείσιμο εργαλείου μόνο αν είμαστε ακόμα στην ίδια εικόνα
                renderPhotos(); 
            });
        } else {
            throw new Error("Σφάλμα από Cloudinary");
        }
    })
    .catch(err => {
        console.error(err);
        showToast("Αποτυχία ανεβάσματος. Δοκίμασε ξανά.", true);
        if(btn) {
            btn.innerHTML = "💾 Αποθήκευση & Αντικατάσταση";
            btn.disabled = false;
        }
    });
}
