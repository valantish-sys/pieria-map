
// --- 2. ΤΑ ΚΛΕΙΔΙΑ FIREBASE ---
const firebaseConfigPub = {
  apiKey: "AIzaSyCnlza3LeY9oDCUVxQ0ag-11vigcjf6RV0",
  authDomain: "photos-fbb91.firebaseapp.com",
  databaseURL: "https://photos-fbb91-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "photos-fbb91",
  storageBucket: "photos-fbb91.firebasestorage.app",
  messagingSenderId: "564601708050",
  appId: "1:564601708050:web:7b75eed88836803bd902cb"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfigPub);
const dbPub = firebase.database();
const authPub = firebase.auth(); // Ενεργοποίηση Auth

let currentUserUid = null;

// --- ΑΟΡΑΤΗ ΣΥΝΔΕΣΗ Ή "GUEST" FALLBACK ---
const getGuestUid = () => {
  try {
    let uid = localStorage.getItem("guest_fallback_uid");
    if (!uid) {
      uid = "guest_" + Date.now();
      localStorage.setItem("guest_fallback_uid", uid);
    }
    return uid;
  } catch (e) {
    return "guest_" + Date.now();
  }
};

let authPromise = new Promise((resolve) => {
  let fallbackTimer = setTimeout(() => {
    if (!currentUserUid) {
      currentUserUid = getGuestUid();
      resolve(currentUserUid);
    }
  }, 2000);

  authPub.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(() => authPub.setPersistence(firebase.auth.Auth.Persistence.NONE))
    .then(() => {
     authPub.onAuthStateChanged(user => {
        if (user) {
          clearTimeout(fallbackTimer);
          
          // Ελέγχουμε αν ο Firefox μας είχε βάλει προσωρινά ως Guest (λόγω καθυστέρησης)
          let wasGuest = (currentUserUid && currentUserUid.startsWith("guest_"));
          
          currentUserUid = user.uid;
          resolve(user.uid);
          
          // ΑΥΤΟΜΑΤΗ ΕΠΑΝΑΦΟΡΤΩΣΗ: Αν ο Firefox μόλις τώρα συνδέθηκε, ξαναζητάμε τις φώτο!
          if (wasGuest && typeof initAlbumSettings === "function") {
              initAlbumSettings();
          }
        } else {
          authPub.signInAnonymously().catch(err => {
            clearTimeout(fallbackTimer);
            if (!currentUserUid) {
               currentUserUid = getGuestUid();
               resolve(currentUserUid);
            }
          });
        }
      });
    })
    .catch(err => {
       clearTimeout(fallbackTimer);
       if (!currentUserUid) {
          currentUserUid = getGuestUid();
          resolve(currentUserUid);
       }
    });
});

let activeThemeId = "";
let currentViewId = "";
let currentDbLimit = window.innerWidth <= 768 ? 1 : 3;
let activeQuery = null;
let newPhotoListener = null;
// --- 🛡️ ΜΗΧΑΝΙΣΜΟΣ ΑΣΦΑΛΕΙΑΣ ΦΟΡΤΩΣΗΣ (WATCHDOG) ---
let loadingWatchdog = null;

window.startWatchdog = function() {
  clearTimeout(loadingWatchdog); // Καθαρίζουμε τυχόν προηγούμενο χρονόμετρο
  
  // ΑΥΞΗΣΗ: 15 δευτερόλεπτα (15000ms) για να αντέχει τα "κομπιάσματα" του server της Google
  loadingWatchdog = setTimeout(() => {
    console.warn("Αργή απόκριση Server: Διακοπή Firebase για εξοικονόμηση πόρων.");
    
    // 1. "Σκοτώνουμε" εντελώς τη σύνδεση
    dbPub.ref("album_settings").off();
    if (activeQuery) activeQuery.off();
    
    // 2. Κρύβουμε το "Φόρτωση" και τα κουμπιά
    const grid = document.getElementById("masonry-grid");
    const emptyState = document.getElementById("empty-state");
    const btnLoadMore = document.getElementById("btn-load-more");
    const uploadBtn = document.getElementById("btn-upload");
    
    if (grid) grid.style.display = "none";
    if (btnLoadMore) btnLoadMore.style.display = "none";
    if (uploadBtn) uploadBtn.style.display = "none";
    
    // 3. Σωστό και ειλικρινές μήνυμα
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div style="text-align: center; padding: 25px 15px; border: 1px dashed #ccc; border-radius: 8px; background: #fffaf0;">
          <div style="font-size: 40px; margin-bottom: 10px;">⏳</div>
          <h3 style="color: #333; margin: 0 0 10px 0; font-family: sans-serif;">Καθυστέρηση Διακομιστή</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px; font-family: sans-serif;">
            Ο server της Google άργησε να απαντήσει. Η προσπάθεια σύνδεσης διεκόπη αυτόματα.
          </p>
          <button onclick="location.reload()" style="background: #1e6cff; color: white; border: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            🔄 Επαναφόρτωση
          </button>
        </div>
      `;
    }
  }, 15000); 
};

window.stopWatchdog = function() {
  clearTimeout(loadingWatchdog); // Η φόρτωση πέτυχε!
};
// --- ΤΕΛΟΣ ΜΗΧΑΝΙΣΜΟΥ ΑΣΦΑΛΕΙΑΣ ---
// --- ΑΣΦΑΛΕΙΑ ΛΕΖΑΝΤΑΣ ---
window.escapeHTML = (str) => {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
};
// --- 1. ΔΙΟΡΘΩΣΗ ΓΙΑ ΤΟ ΚΟΛΛΗΜΑ ΤΗΣ ΑΡΧΙΚΗΣ ΦΟΡΤΩΣΗΣ ---
const initAlbumSettings = () => {
  window.startWatchdog();
  dbPub.ref("album_settings").on("value", snap => {
    const data = snap.val();
    
    // ΔΙΟΡΘΩΣΗ: Πρέπει να σταματάει το χρονόμετρο ΑΜΕΣΩΣ αν το άλμπουμ έρθει άδειο!
    if(!data || !data.current_theme) {
      window.stopWatchdog();
      return;
    }
    
    activeThemeId = data.current_theme.id;
    if(!currentViewId) currentViewId = activeThemeId;

    const selector = document.getElementById("theme-selector");
    if (!selector) {
      window.stopWatchdog();
      return; 
    }
    
    selector.innerHTML = "";
    if(data.themes[activeThemeId]) {
      selector.innerHTML += `<option value="${activeThemeId}">✨ Τρέχον: ${data.themes[activeThemeId].name}</option>`;
    }
    
    let archiveGroup = `<optgroup label="🗂️ Αρχείο (Παλαιότερα)">`;
    let hasArchive = false;
    
    const sortedThemes = Object.keys(data.themes)
      .filter(key => key !== activeThemeId)
      .sort((a, b) => data.themes[b].timestamp - data.themes[a].timestamp);

    sortedThemes.forEach(key => {
      archiveGroup += `<option value="${key}">${data.themes[key].name}</option>`;
      hasArchive = true;
    });
    
    archiveGroup += `</optgroup>`;
    if(hasArchive) selector.innerHTML += archiveGroup;
    
   selector.value = currentViewId;
    const displayTheme = document.getElementById("display-theme");
    if (displayTheme) displayTheme.innerText = data.themes[currentViewId].name;
    
    window.loadPhotos();
  }, (error) => {
    // ΝΕΑ ΠΡΟΣΘΗΚΗ: Αν η βάση αρνηθεί την πρόσβαση, σταματάμε αμέσως το 15άρι Watchdog!
    console.error("Σφάλμα πρόσβασης Firebase:", error);
    window.stopWatchdog();
  }); // Εδώ κλείνει το .on της Firebase
};

// Περιμένουμε το DOM να είναι έτοιμο ΚΑΙ το Auth να ολοκληρωθεί!
const startAppSafely = async () => {
  await authPromise; // <-- ΠΡΟΣΘΗΚΗ: Το script "φρενάρει" εδώ μέχρι να τελειώσει το Auth!
  initAlbumSettings();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAppSafely);
} else {
  startAppSafely();
}
// --- ΑΛΛΑΓΗ ΘΕΜΑΤΟΣ ΑΠΟ ΤΟ MENU ---
window.changeTheme = function() {
  const selector = document.getElementById("theme-selector");
  if (!selector) return;

  currentViewId = selector.value;
  currentDbLimit = window.innerWidth <= 768 ? 1 : 3; // Επαναφορά ορίου φόρτωσης
  
  // Κρύβουμε το κουμπί ανέβασματος αν βλέπουμε παλιό (αρχειοθετημένο) άλμπουμ
  const btn = document.getElementById("btn-upload");
  if (btn) {
    if (currentViewId === activeThemeId) {
        btn.style.display = "flex";
    } else {
        btn.style.display = "none";
    }
  }
  
  dbPub.ref("album_settings/themes/" + currentViewId).once("value", snap => {
    const displayTheme = document.getElementById("display-theme");
    if (displayTheme && snap.exists()) {
      displayTheme.innerText = snap.val().name;
    }
  });
  
  window.loadPhotos();
};
window.allFetchedAlbumPhotos = []; // Αποθήκη μνήμης (cache)

// 1. ΔΙΟΡΘΩΜΕΝΗ loadPhotos: Ρωτάει τη Firebase ΜΟΝΟ μια φορά!
window.loadPhotos = function(isLoadMore = false) {
  // Αν πατήσαμε απλά Load More, δεν ξανακατεβάζουμε δεδομένα από το ίντερνετ!
  if (isLoadMore) {
    window.renderPhotos(true);
    return;
  }
window.startWatchdog();
  if (activeQuery) activeQuery.off();
  if (newPhotoListener) { newPhotoListener.off(); newPhotoListener = null; } 

  activeQuery = dbPub.ref("album_photos").orderByChild("status").equalTo("approved");

  activeQuery.on("value", snap => {
      let allFetched = [];
      snap.forEach(child => {
        if(child.val().theme_id === currentViewId) {
          let photoData = child.val(); photoData.id = child.key;
          allFetched.push(photoData);
        }
      });
      window.allFetchedAlbumPhotos = allFetched.reverse();
      
     window.renderPhotos(false); // Ζωγραφίζουμε τα αρχικά!
  }, (error) => {
      // ΝΕΑ ΠΡΟΣΘΗΚΗ: Πιάνουμε το "άκυρο" της βάσης, σταματάμε ΑΜΕΣΩΣ το χρονόμετρο!
      window.stopWatchdog();
      console.error("Η βάση αρνήθηκε την πρόσβαση στις φωτογραφίες:", error);
      
      // Δείχνουμε απλώς ότι το άλμπουμ είναι προσωρινά άδειο (μέχρι να συνδεθεί ο Firefox)
      // και γλιτώνουμε το μεγάλο μήνυμα σφάλματος.
      window.allFetchedAlbumPhotos = [];
      window.renderPhotos(false);
  }); // Εδώ κλείνει το .on του activeQuery
}

// 2. ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Αστραπιαία εμφάνιση 
window.renderPhotos = function(isLoadMore) {
  window.stopWatchdog();
  const grid = document.getElementById("masonry-grid");
  if (!grid) return;
  const emptyState = document.getElementById("empty-state");
  const btnLoadMore = document.getElementById("btn-load-more");

 let allFetched = window.allFetchedAlbumPhotos || [];
  let hasMore = allFetched.length > currentDbLimit;
  let photos = hasMore ? allFetched.slice(0, currentDbLimit) : allFetched;
  
  // ΔΙΟΡΘΩΣΗ: Περνάμε ΟΛΕΣ τις φωτογραφίες στο Lightbox, ώστε ο χρήστης 
  // να μπορεί να κάνει swipe σε όλο το άλμπουμ χωρίς να χρειάζεται να βγει!
  window.albumPhotosList = allFetched; 
  const newDbIds = photos.map(p => p.id);
  
  Array.from(grid.children).forEach(el => {
      if (!newDbIds.includes(el.dataset.id)) el.remove();
  });

  photos.forEach((photo, index) => {
    let existingEl = grid.querySelector(`[data-id="${photo.id}"]`);

    if (existingEl) {
      existingEl.onclick = () => window.openAlbumLightbox(index);
      existingEl.className = "polaroid-item"; 
      if (grid.children[index] !== existingEl) grid.insertBefore(existingEl, grid.children[index] || null);
    } else {
      let optimizedUrl = photo.url.replace('/upload/', '/upload/q_auto,f_auto,w_600/');
      let captionHtml = photo.caption ? `<div class="polaroid-caption">${window.escapeHTML(photo.caption)}</div>` : "";
      
      let newDiv = document.createElement('div');
      newDiv.className = 'polaroid-item';
      newDiv.dataset.id = photo.id;
      newDiv.onclick = () => window.openAlbumLightbox(index);
      
      let delay = (!isLoadMore) ? index * 0.1 : 0;
      newDiv.style.animationDelay = `${delay}s`;
      newDiv.innerHTML = `<img src="${optimizedUrl}" loading="lazy" alt="Σχολική Ανάμνηση">${captionHtml}`;

      if (grid.children[index]) grid.insertBefore(newDiv, grid.children[index]);
      else grid.appendChild(newDiv);
    }
  });

  if (photos.length > 0) {
    grid.style.display = "block";
    emptyState.style.display = "none";
    btnLoadMore.style.display = hasMore ? "block" : "none";
  } else {
    grid.style.display = "none";
    emptyState.style.display = "block";
    btnLoadMore.style.display = "none";
  }
}

// 3. ΑΣΤΡΑΠΙΑΙΟ Load More
window.showMorePhotos = function() {
  const btnLoadMore = document.getElementById("btn-load-more");
  btnLoadMore.innerText = "Φόρτωση... ⏳";
  
  currentDbLimit += window.innerWidth <= 768 ? 4 : 9; 
  window.loadPhotos(true); 
  
  setTimeout(() => { btnLoadMore.innerText = "Δείτε όλες τις αναμνήσεις 👇"; }, 400); // Μικρότερος χρόνος αναμονής
}

window.canUserUpload = async function() {
  if (!currentUserUid) {
    let authDone = false;
    authPromise.then(() => authDone = true);

    // Εμφανίζουμε τη φόρτωση ΜΟΝΟ αν αργήσει η σύνδεση πάνω από 200ms
    setTimeout(() => {
      if (!authDone && !currentUserUid) {
        Swal.fire({ 
          title: 'Ασφαλής σύνδεση...', 
          text: 'Γίνεται προετοιμασία...', 
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => { Swal.showLoading(); } 
        });
      }
   }, 200);
    
    await authPromise;
    Swal.close(); // Διαγραφή του isVisible() ώστε το popup να κλείνει πάντα με ασφάλεια.
  }
  
  if (!currentUserUid) return false;
  
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  let timestamps = [];
  
 // 1. Τοπικός έλεγχος (Η Ασπίδα προστασίας για Firefox)
  try {
    let localData = JSON.parse(localStorage.getItem('local_user_uploads') || '[]');
    if (!Array.isArray(localData)) localData = []; // Βαλβίδα ασφαλείας!
    timestamps = localData.filter(time => now - time < ONE_DAY);
    localStorage.setItem('local_user_uploads', JSON.stringify(timestamps));
  } catch(e) {
    timestamps = [];
  }

  // 2. Έλεγχος από Firebase (Αν δεν κοπεί από τον browser και ΔΕΝ είναι Guest)
  try {
    if (currentUserUid && !currentUserUid.startsWith("guest_")) {
      const snap = await dbPub.ref(`user_uploads/${currentUserUid}`).once('value');
      let needsSync = false;
      if (snap.exists()) {
        snap.forEach(child => {
          let time = child.val();
          if (now - time < ONE_DAY && !timestamps.includes(time)) {
            timestamps.push(time);
            needsSync = true;
          }
        });
      }
      // Ενημερώνουμε την τοπική μνήμη αν βρήκαμε νέα uploads στον Server (Συγχρονισμός)
      if (needsSync) {
        try { localStorage.setItem('local_user_uploads', JSON.stringify(timestamps)); } catch(e) {}
      }
    }
  } catch (e) {
    console.warn("Το Firebase μπλοκαρίστηκε. Συνεχίζουμε βασιζόμενοι μόνο στο τοπικό ιστορικό.");
  }
  
  // 3. Τελικός Έλεγχος
  if (timestamps.length >= 2) {
    const oldestUpload = Math.min(...timestamps);
    const unlockTime = oldestUpload + ONE_DAY;
    
    let timerInterval;
    Swal.fire({
      icon: 'info',
      title: 'Τα λέμε αργότερα! ⏳',
      html: `Έχεις ήδη μοιραστεί 2 φωτογραφίες σήμερα.<br>Μπορείς να ανεβάσεις ξανά σε:<br>
             <div id="swal-countdown" style="font-size: 24px; font-weight: 800; color: #1e6cff; margin-top: 15px;">Υπολογισμός...</div>`,
      confirmButtonColor: '#1e6cff',
      didOpen: () => {
        timerInterval = setInterval(() => {
          const timeLeft = unlockTime - Date.now();
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.close();
          } else {
            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            document.getElementById('swal-countdown').innerText = `${hours}ώ ${minutes}λ ${seconds}δ`;
          }
        }, 1000);
      },
      willClose: () => clearInterval(timerInterval)
    });
    return false;
  }
  
  return true;
}

// Η νέα συνάρτηση που καλείται όταν πατάει το κουμπί Upload
// Η νέα συνάρτηση που καλείται όταν πατάει το κουμπί Upload
window.checkUploadLimit = function() {
  const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

  if (isMobile && navigator.vibrate) {
    navigator.vibrate(50);
  }

  // Ακαριαίο click για να μην μπλοκάρεται από το iOS Safari (απαγορεύεται το await πριν το click)
  document.getElementById('file-upload').click();
}

window.uploadImage = async function(event) {
  const file = event.target.files[0];
  if(!file) return;
  
  // Μεταφορά του ελέγχου εδώ! (Ο έλεγχος γίνεται αφού ανοίξει η συλλογή και διαλέξει αρχείο)
  const isAllowed = await window.canUserUpload();
  if (!isAllowed) {
    document.getElementById('file-upload').value = '';
    return;
  }
  
  // Έλεγχος αρχείου ΠΡΙΝ το pop-up!
  if(!file.type.startsWith('image/')) {
    Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Παρακαλώ επιλέξτε μόνο εικόνες (jpg, png κλπ).', confirmButtonColor: '#1e6cff' });
    document.getElementById('file-upload').value = '';
    return;
  }

  // Δημιουργία τοπικού URL για άμεση προεπισκόπηση
  const previewUrl = URL.createObjectURL(file);

  const { value: userCaption, isConfirmed } = await Swal.fire({
    title: 'Η Polaroid σου! ✨',
    html: `
      <div style="background: #fff; padding: 12px 12px 35px 12px; border-radius: 4px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); max-width: 260px; margin: 10px auto 20px auto; transform: rotate(-2deg); position: relative;">
        <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); font-size: 26px; z-index: 3; filter: drop-shadow(0 3px 3px rgba(0,0,0,0.3));">📌</div>
        <img src="${previewUrl}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 2px; display: block; background: #f4f4f4;">
        <div id="live-caption" style="font-family: 'Caveat', cursive; font-size: 24px; color: #333; text-align: center; margin-top: 10px; min-height: 28px; line-height: 1.2; word-wrap: break-word;"></div>
      </div>
      <input id="swal-input-caption" class="swal2-input" placeholder="Γράψε αν θέλεις μια λεζάντα! ✍️" maxlength="50" oninput="document.getElementById('live-caption').innerHTML = window.escapeHTML(this.value)" autocomplete="off">
    `,
    showCancelButton: true,
    confirmButtonText: 'Ανέβασμα 🚀',
    cancelButtonText: 'Ακύρωση',
    confirmButtonColor: '#1e6cff',
    cancelButtonColor: '#e74c3c',
    preConfirm: () => document.getElementById('swal-input-caption').value
  });

  URL.revokeObjectURL(previewUrl);

  if (!isConfirmed) {
    document.getElementById('file-upload').value = '';
    return; 
  }
  
  // Πανέμορφο loading pop-up
  Swal.fire({
    title: 'Ανεβαίνει...',
    html: 'Παρακαλώ περιμένετε ⏳',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => { Swal.showLoading(); }
  });
  
 // Το createImageBitmap σέβεται αυτόματα την περιστροφή EXIF της κάμερας!
  window.createImageBitmap(file).then(img => {
      const canvas = document.createElement("canvas");
      const MAX_DIM = 1200;
      let width = img.width; let height = img.height;
      if (width > height && width > MAX_DIM) { 
          height = Math.round(height * (MAX_DIM / width)); 
          width = MAX_DIM; 
      } else if (height >= width && height > MAX_DIM) { 
          width = Math.round(width * (MAX_DIM / height)); 
          height = MAX_DIM; 
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
     canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("file", blob, "photo.webp");
  
        
        // ⚠️ ΒΑΛΕ ΕΔΩ ΤΟ URL ΤΟΥ WORKER ΠΟΥ ΕΦΤΙΑΞΕΣ ΣΤΟ CLOUDFLARE ⚠️
        const WORKER_URL = "https://school-album-uploader.valantish.workers.dev";

        // Χτυπάμε τον Worker μας, ΟΧΙ το Cloudinary!
        fetch(WORKER_URL, {
          method: "POST",
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if(data.secure_url) {
            // Ανέβηκε με επιτυχία από τον Worker! Γράφουμε το URL στη Firebase:
            dbPub.ref("album_photos").push({
              url: data.secure_url,
              caption: userCaption || "",
              theme_id: activeThemeId,
              status: "pending",
              timestamp: Date.now()
            });
            
           // --- ΑΡΧΗ ΕΠΑΝΑΦΟΡΑΣ WEB3FORMS & ANTI-BOT ΠΡΟΣΤΑΣΙΑΣ ---
            // 1. Σπάσιμο του κλειδιού για να μην το διαβάζουν αυτόματα τα ρομποτάκια (scrapers)
            const k1 = "50fa03f9-";
            const k2 = "5c1e-4e99-";
            const k3 = "867e-fdb1b1886565";
            
            // 2. Τοπικός έλεγχος (Rate limit) με localStorage για να μπλοκάρει φθηνά spam scripts
           // 2. Τοπικός έλεγχος (Rate limit) με localStorage για να μπλοκάρει φθηνά spam scripts
            const emailKey = 'web3forms_emails_sent';
            const today = new Date().toDateString();
            let emailData = { date: today, count: 0 };
            
            try {
                let stored = localStorage.getItem(emailKey);
                if (stored) {
                    let parsed = JSON.parse(stored);
                    if (parsed.date === today) emailData.count = parsed.count;
                }
            } catch (e) {
                console.warn("Το localStorage είναι κλειδωμένο (Emails).");
            }
            
           // Επιτρέπουμε το πολύ 3 emails τη μέρα από τον ίδιο browser
            if (emailData.count < 3) {
                // ΔΙΟΡΘΩΣΗ: Ακαριαία αύξηση και αποθήκευση ΠΡΙΝ το request για προστασία από spam,
                // και αφαίρεση του setTimeout για να μην ακυρωθεί η αποστολή αν ο χρήστης φύγει.
                emailData.count++;
                try { localStorage.setItem(emailKey, JSON.stringify(emailData)); } catch(e) {}
                
                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        access_key: k1 + k2 + k3,
                        subject: "Νέα Φωτογραφία στο Άλμπουμ! 📸",
                        from_name: "Σχολικό Blog",
                        message: `Γεια σου! Κάποιος μόλις ανέβασε μια νέα φωτογραφία.\n\nΛεζάντα: "${userCaption || "Χωρίς Λεζάντα"}".\nLink προεπισκόπησης: ${data.secure_url}\n\nΜπες στην κρυφή σελίδα διαχειριστή για να την εγκρίνεις ή να τη διαγράψεις.`,
                        botcheck: false
                    })
                }).catch(error => console.log("Το email ειδοποίησης απέτυχε:", error));
            } else {
                console.warn("Anti-Spam: Αποτράπηκε αποστολή υπερβολικών emails από τη συσκευή σου.");
            }
            // --- ΤΕΛΟΣ WEB3FORMS ---
            
          
           // Καταγραφή ανεβάσματος στον Server (Firebase) ΚΑΙ Τοπικά (για τον Firefox)
            const uploadTime = Date.now();
            if (currentUserUid && !currentUserUid.startsWith("guest_")) {
                dbPub.ref(`user_uploads/${currentUserUid}`).push(uploadTime).catch(() => {});
            }
            
            try {
                let localUploads = JSON.parse(localStorage.getItem('local_user_uploads') || '[]');
                if (!Array.isArray(localUploads)) localUploads = []; // Βαλβίδα ασφαλείας
                localUploads.push(uploadTime);
                localStorage.setItem('local_user_uploads', JSON.stringify(localUploads));
            } catch(e) {}
            
            Swal.fire({
              icon: 'success',
              title: 'Η ανάμνηση στάλθηκε! 📸',
              text: 'Η φωτογραφία στάλθηκε. Σε λίγα λεπτά θα εμφανιστεί!',
              confirmButtonColor: '#2ecc71'
            });
          } else {
            Swal.fire({ icon: 'error', title: 'Σφάλμα', text: 'Αποτυχία ανεβάσματος (Cloudflare). Δοκιμάστε ξανά.', confirmButtonColor: '#e74c3c' });
          }
        })
        .catch(err => {
          Swal.fire({ icon: 'error', title: 'Σφάλμα', text: 'Υπήρξε πρόβλημα δικτύου. Δοκιμάστε ξανά.', confirmButtonColor: '#e74c3c' });
        });
      }, "image/webp", 0.85);
 }).catch(err => {
      console.error("Σφάλμα ανάγνωσης εικόνας:", err);
      // Κλείνει το loading αν η εικόνα είναι corrupted
      Swal.fire({ icon: 'error', title: 'Σφάλμα Εικόνας', text: 'Το αρχείο δεν μπορεί να διαβαστεί. Δοκιμάστε άλλη φωτογραφία.', confirmButtonColor: '#e74c3c' });
  });
  
  document.getElementById('file-upload').value = '';
}

// --- ΝΕΟ LIGHTBOX ΜΕ SLIDESHOW, ΛΕΖΑΝΤΕΣ & SWIPE ---
let currentLightboxIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;

window.openAlbumLightbox = function(index) {
    currentLightboxIndex = index;
    let lb = document.getElementById('album-dynamic-lightbox');
    
    if (!lb) {
        lb = document.createElement('div');
        lb.id = 'album-dynamic-lightbox';
        lb.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.92) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; z-index: 2147483647 !important; display: none; justify-content: center !important; align-items: center !important; flex-direction: column; opacity: 0; transition: opacity 0.3s ease;";
        
        lb.innerHTML = `
            <span style="position: absolute; top: 20px; right: 30px; color: white; font-size: 50px; cursor: pointer; text-shadow: 0 2px 10px rgba(0,0,0,0.8); transition: color 0.2s; z-index: 10;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='white'" onclick="window.closeAlbumLightbox()">&times;</span>
            
           <div class="lightbox-arrow1" style="position: absolute; left: 10px; color: white; font-size: 50px; cursor: pointer; padding: 20px; z-index: 10; user-select: none; text-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick="window.changeLightboxImage(-1, event)">&#10094;</div>
            
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                <img id="album-dynamic-img" src="" style="max-width: 85vw !important; max-height: 75vh !important; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); transition: transform 0.3s ease, opacity 0.2s ease;" onclick="event.stopPropagation()" />
               <div id="album-dynamic-caption" onclick="event.stopPropagation()" style="color: white; font-family: 'Caveat', cursive; font-size: 32px; margin-top: 15px; text-shadow: 0 2px 5px rgba(0,0,0,0.8); text-align: center; max-width: 85vw; word-wrap: break-word;"></div>
            </div>

            <div class="lightbox-arrow1" style="position: absolute; right: 10px; color: white; font-size: 50px; cursor: pointer; padding: 20px; z-index: 10; user-select: none; text-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick="window.changeLightboxImage(1, event)">&#10095;</div>
        `;
        
        lb.onclick = window.closeAlbumLightbox;
        
        // Touch events για Swipe (Κινητά)
       // Touch events για Swipe (Κινητά) - Προστασία από κάθετο scroll
        lb.addEventListener('touchstart', e => { 
            touchStartX = e.changedTouches[0].screenX; 
            touchStartY = e.changedTouches[0].screenY; 
        }, {passive: true});
        
        lb.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            
            let diffX = touchStartX - touchEndX;
            let diffY = touchStartY - touchEndY;
            
            // Το Swipe ισχύει μόνο αν η οριζόντια κίνηση (X) είναι > 50px ΚΑΙ
            // είναι μεγαλύτερη από την κάθετη κίνηση (Υ)
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) window.changeLightboxImage(1, e); 
                else window.changeLightboxImage(-1, e); 
            }
        }, {passive: true});

        document.body.appendChild(lb); 
    }
    
    window.updateLightboxContent();
    lb.style.setProperty('display', 'flex', 'important');
    setTimeout(() => { lb.style.opacity = "1"; document.getElementById('album-dynamic-img').style.transform = "scale(1)"; }, 20);
    document.body.style.setProperty('overflow', 'hidden', 'important');
};

window.changeLightboxImage = function(step, event) {
    if(event) event.stopPropagation();
    if(!window.albumPhotosList || window.albumPhotosList.length === 0) return;

    currentLightboxIndex += step;
    
    // Κυκλική εναλλαγή (αν φτάσουν στο τέλος, ξεκινάει από την αρχή!)
    if (currentLightboxIndex < 0) currentLightboxIndex = window.albumPhotosList.length - 1;
    if (currentLightboxIndex >= window.albumPhotosList.length) currentLightboxIndex = 0;
    
    const img = document.getElementById('album-dynamic-img');
    const cap = document.getElementById('album-dynamic-caption');
    
    // Απαλό εφέ εξαφάνισης & κίνησης κατά την αλλαγή
   // Απαλό εφέ εξαφάνισης & κίνησης κατά την αλλαγή
    img.style.opacity = "0"; cap.style.opacity = "0";
    img.style.transform = step > 0 ? "scale(0.95) translateX(20px)" : "scale(0.95) translateX(-20px)";
    
    // ΔΙΟΡΘΩΣΗ: Αν ο χρήστης σπαμάρει το κλικ, ακυρώνουμε το παλιό animation για να μην υπάρξει glitch
    if (window.lightboxTimer) clearTimeout(window.lightboxTimer);

    window.lightboxTimer = setTimeout(() => {
        window.updateLightboxContent();
        img.style.opacity = "1"; cap.style.opacity = "1";
        img.style.transform = "scale(1) translateX(0)";
    }, 200);
};

window.updateLightboxContent = function() {
    if (window.albumPhotosList && window.albumPhotosList[currentLightboxIndex]) {
        const photo = window.albumPhotosList[currentLightboxIndex];
        const highResUrl = photo.url.replace('/upload/', '/upload/q_auto,f_auto,w_1600/');
        document.getElementById('album-dynamic-img').src = highResUrl;
        
        // ΔΙΟΡΘΩΣΗ: Προστέθηκε το window. μπροστά από το escapeHTML για να μην κρασάρει
        document.getElementById('album-dynamic-caption').innerHTML = photo.caption ? window.escapeHTML(photo.caption) : "";
    }
};

window.closeAlbumLightbox = function() {
    const lb = document.getElementById('album-dynamic-lightbox');
    if (lb) {
        lb.style.opacity = "0";
        const img = document.getElementById('album-dynamic-img');
        if (img) img.style.transform = "scale(0.9)";
        setTimeout(() => { lb.style.setProperty('display', 'none', 'important'); }, 300);
    }
    document.body.style.removeProperty('overflow');
};

// Υποστήριξη Πληκτρολογίου
document.addEventListener('keydown', function(event){
    const lb = document.getElementById('album-dynamic-lightbox');
    if(lb && lb.style.display === 'flex') {
        if(event.key === "Escape") window.closeAlbumLightbox();
        if(event.key === "ArrowRight") window.changeLightboxImage(1);
if(event.key === "ArrowLeft") window.changeLightboxImage(-1);
    }
});
// --- DRAG & DROP ΜΗΧΑΝΙΣΜΟΣ ---
document.addEventListener('DOMContentLoaded', () => {
  // ΔΙΟΡΘΩΣΗ: Μπλοκάρισμα της πλοήγησης (να μην ανοίγει η εικόνα) σε όλη τη σελίδα αν ο χρήστης αστοχήσει
  window.addEventListener('dragover', e => e.preventDefault(), false);
  window.addEventListener('drop', e => e.preventDefault(), false);

  const albumBox = document.getElementById('school-album');
  const dragOverlay = document.getElementById('drag-overlay');
  
  if (albumBox && dragOverlay) {
    // 1. Αποτρέπουμε τον browser να ανοίξει τη φώτο...
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      albumBox.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      albumBox.addEventListener(eventName, () => dragOverlay.classList.add('active'));
    });

   albumBox.addEventListener('dragleave', e => {
      // Αποτρέπει το αναβοσβήσιμο αν το ποντίκι περάσει πάνω από εσωτερικά στοιχεία (π.χ. άλλες φώτο)
      if (!e.relatedTarget || !albumBox.contains(e.relatedTarget)) {
        dragOverlay.classList.remove('active');
      }
    });

    albumBox.addEventListener('drop', () => {
      dragOverlay.classList.remove('active');
    });

    albumBox.addEventListener('drop', async e => {
      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        Swal.fire({ icon: 'warning', title: 'Όπα!', text: 'Ρίξε μόνο εικόνες!', confirmButtonColor: '#1e6cff' });
        return;
      }

      const fakeEvent = { target: { files: [file] } };
      window.uploadImage(fakeEvent);
    });
  }
});
