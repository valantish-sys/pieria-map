
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
          // Ελέγχουμε αν είχαμε μπει ως επισκέπτες λόγω καθυστέρησης του Firefox
          let wasGuest = (currentUserUid && currentUserUid.startsWith("guest_"));
          currentUserUid = user.uid;
          resolve(user.uid);
          
          // ΜΑΓΙΚΟ: Αν ο Firefox μόλις τώρα ταυτοποιήθηκε στο παρασκήνιο, φορτώνουμε ξανά αυτόματα!
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
// --- 🛡️ ΑΝΑΒΑΘΜΙΣΜΕΝΟΣ ΜΗΧΑΝΙΣΜΟΣ ΑΣΦΑΛΕΙΑΣ ΦΟΡΤΩΣΗΣ (WATCHDOG 2.0) ---
let loadingWatchdog = null;
let stuckWatchdog = null; // Νέο χρονόμετρο για ολικό κόλλημα

window.startWatchdog = function() {
  clearTimeout(loadingWatchdog);
  clearTimeout(stuckWatchdog);
  
  // ΦΑΣΗ 1: Μειώνουμε το χρόνο αναμονής στα 8 δευτερόλεπτα
  loadingWatchdog = setTimeout(() => {
    console.warn("Η σύνδεση καθυστερεί ή κόπηκε. Ενεργοποίηση Watchdog 2.0...");
    
    const grid = document.getElementById("masonry-grid");
    const emptyState = document.getElementById("empty-state");
    const btnLoadMore = document.getElementById("btn-load-more");
    const uploadBtn = document.getElementById("btn-upload");
    
    // 🌟 ΕΞΥΠΝΗ ΠΡΟΣΤΑΣΙΑ: Αν ο χρήστης βλέπει ΗΔΗ φωτογραφίες, ΔΕΝ καταστρέφουμε το UI!
    if (grid && grid.children.length > 0 && window.allFetchedAlbumPhotos && window.allFetchedAlbumPhotos.length > 0) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Αργή Σύνδεση ⏳',
                text: 'Ο συγχρονισμός καθυστερεί, αλλά μπορείτε να δείτε τις φορτωμένες αναμνήσεις.',
                icon: 'warning',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000
            });
        }
        return; // Σταματάμε εδώ για να μη σβήσουμε τις φωτογραφίες!
    }
    
    // Αν η σελίδα είναι άδεια, κρύβουμε τα στοιχεία
    if (grid) grid.style.display = "none";
    if (btnLoadMore) btnLoadMore.style.display = "none";
    if (uploadBtn) uploadBtn.style.display = "none";
    
    if (emptyState) {
      if (!emptyState.dataset.originalHtml) emptyState.dataset.originalHtml = emptyState.innerHTML;
      emptyState.style.display = "block";
      
      // Διαγνωστικός έλεγχος ίντερνετ
      const isOffline = !navigator.onLine;
      
      emptyState.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; border: 2px dashed ${isOffline ? '#e74c3c' : '#f39c12'}; border-radius: 12px; background: #fffdf5; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <style>
            @keyframes pulseWatchdog { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
          </style>
          <div style="font-size: 45px; margin-bottom: 15px; animation: pulseWatchdog 1.5s infinite ease-in-out;">
            ${isOffline ? '📡' : '🦊'}
          </div>
          <h3 style="color: #333; margin: 0 0 10px 0; font-family: sans-serif; font-size: 19px;">
            ${isOffline ? 'Εκτός Σύνδεσης!' : 'Η σύνδεση καθυστερεί...'}
          </h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px; font-family: sans-serif; line-height: 1.5;">
            ${isOffline 
              ? 'Φαίνεται πως δεν έχεις πρόσβαση στο internet αυτή τη στιγμή. Έλεγξε το δίκτυό σου.' 
              : 'Ο browser σου ελέγχει αυστηρά τη σύνδεση ή κάποιο Adblocker την καθυστερεί.<br><b>Η προσπάθεια συνεχίζεται!</b>'}
          </p>
          
          <!-- ΦΑΣΗ 2: Κουμπιά απεγκλωβισμού -->
          <div id="watchdog-recovery" style="display: ${isOffline ? 'block' : 'none'}; margin-top: 15px; border-top: 1px solid #eee; padding-top: 20px;">
             <p style="font-size: 13px; color: #888; margin-bottom: 12px;">Αν η σελίδα έχει κολλήσει εντελώς:</p>
             <button id="btn-watchdog-retry" onclick="window.forceRetryConnection()" style="background: #1e6cff; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; margin-right: 10px; box-shadow: 0 4px 10px rgba(30,108,255,0.3); transition: 0.2s;">
               ⚡ Επανασύνδεση
             </button>
             <button onclick="window.location.reload(true)" style="background: white; color: #333; border: 1px solid #ccc; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s;">
               🔄 Ανανέωση
             </button>
          </div>
        </div>
      `;

      // Αν δεν είναι offline, εμφανίζουμε τα κουμπιά μετά από +7 δευτερόλεπτα (Σύνολο 15s)
      if (!isOffline) {
        stuckWatchdog = setTimeout(() => {
          const recoveryDiv = document.getElementById("watchdog-recovery");
          if (recoveryDiv) recoveryDiv.style.display = "block";
        }, 7000); 
      }
    }
  }, 8000); 
};

window.stopWatchdog = function() {
  clearTimeout(loadingWatchdog); 
  clearTimeout(stuckWatchdog);
  
// Επαναφορά του original empty state HTML (Αν η σύνδεση πέτυχε ενώ έδειχνε το watchdog)
  const emptyState = document.getElementById("empty-state");
  // ΔΙΟΡΘΩΣΗ: Ελέγχουμε τόσο για την αλεπού (αργή σύνδεση) όσο και για τον δορυφόρο (απώλεια σύνδεσης)
  if (emptyState && emptyState.dataset.originalHtml && (emptyState.innerHTML.includes("🦊") || emptyState.innerHTML.includes("📡"))) {
      emptyState.innerHTML = emptyState.dataset.originalHtml;
  }
};

// 🌟 ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Χειροκίνητη επαναφορά (Soft Reset / Απεγκλωβισμός)
window.forceRetryConnection = function() {
    const btn = document.getElementById('btn-watchdog-retry');
    if(btn) {
        btn.innerHTML = 'Προσπάθεια... ⏳';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none'; // Αποτρέπουμε τα spam clicks
    }

    if (!navigator.onLine) {
        setTimeout(() => {
            if(btn) {
                btn.innerHTML = 'Αποτυχία. Ελέγξτε το Ίντερνετ 📡';
                btn.style.background = '#e74c3c';
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        }, 1000);
        return;
    }

    // Κρίσιμο: "Σκοτώνουμε" τις παλιές "κολλημένες" συνδέσεις για να ξεμπουκώσουν τα WebSockets
    if (typeof activeQuery !== 'undefined' && activeQuery) activeQuery.off();
    if (typeof dbPub !== 'undefined') dbPub.ref("album_settings").off();
    
    // Ξανακαλούμε τη βάση από το 0!
    if (typeof initAlbumSettings === "function") {
        initAlbumSettings();
    }
    
    // Αν η βάση δεν απαντήσει ούτε τώρα μετά από 5 δευτερόλεπτα, προτρέπουμε σε Ανανέωση
    setTimeout(() => {
        if (document.getElementById('btn-watchdog-retry')) {
            const retryBtn = document.getElementById('btn-watchdog-retry');
            retryBtn.innerHTML = '🔄 Ανανέωση Σελίδας';
            retryBtn.style.background = '#e74c3c';
            retryBtn.style.opacity = '1';
            retryBtn.style.pointerEvents = 'auto';
            
            // Το κουμπί γίνεται Hard Reload και καθαρίζει την cache της συγκεκριμένης σελίδας
            retryBtn.onclick = () => window.location.reload(true);
        }
    }, 5000);
};
window.escapeHTML = (str) => {
  if (!str) return "";
  let escaped = String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
  return escaped.replace(/\n/g, '<br>'); // Υποστήριξη αλλαγών γραμμής
};
// --- 1. ΔΙΟΡΘΩΣΗ ΓΙΑ ΤΟ ΚΟΛΛΗΜΑ ΤΗΣ ΑΡΧΙΚΗΣ ΦΟΡΤΩΣΗΣ ---
const initAlbumSettings = () => {
  window.startWatchdog();
  // ΔΙΟΡΘΩΣΗ: Κλείνουμε τυχόν παλιό listener για να αποτρέψουμε memory leak σε περίπτωση επανάκλησης!
  dbPub.ref("album_settings").off("value");
  dbPub.ref("album_settings").on("value", snap => {
    const data = snap.val();
    
    // ΔΙΟΡΘΩΣΗ: Πρέπει να σταματάει το χρονόμετρο ΑΜΕΣΩΣ αν το άλμπουμ έρθει άδειο!
  if(!data || !data.themes) {
      window.stopWatchdog();
      return;
    }
    
    // Fallback: Αν το ενεργό άλμπουμ διεγράφη, δείχνουμε το πιο πρόσφατο από το αρχείο
  activeThemeId = data.current_theme ? data.current_theme.id : null;
    
    // ΠΡΟΣΘΗΚΗ: Τοπική μεταβλητή για το UI. Το activeThemeId παραμένει null ώστε να κρυφτεί το κουμπί Upload!
    let initialViewId = activeThemeId; 
    if (!initialViewId) {
      const available = Object.keys(data.themes).sort((a,b) => data.themes[b].timestamp - data.themes[a].timestamp);
      if(available.length > 0) initialViewId = available[0];
      else { window.stopWatchdog(); return; }
    }
    
    if(!currentViewId) currentViewId = initialViewId;
    const selector = document.getElementById("theme-selector");
    if (!selector) {
      window.stopWatchdog();
      return; 
    }
    
   selector.innerHTML = "";
    if(data.themes[activeThemeId]) {
      // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 5: Προστασία από "σπάσιμο" της HTML αν το όνομα του άλμπουμ έχει < ή εισαγωγικά!
      selector.innerHTML += `<option value="${activeThemeId}">✨ Τρέχον: ${window.escapeHTML(data.themes[activeThemeId].name)}</option>`;
    }
    
    let archiveGroup = `<optgroup label="🗂️ Αρχείο (Παλαιότερα)">`;
    let hasArchive = false;
    
    const sortedThemes = Object.keys(data.themes)
      .filter(key => key !== activeThemeId)
      .sort((a, b) => data.themes[b].timestamp - data.themes[a].timestamp);

   sortedThemes.forEach(key => {
      archiveGroup += `<option value="${key}">${window.escapeHTML(data.themes[key].name)}</option>`;
      hasArchive = true;
    });
    
    archiveGroup += `</optgroup>`;
    if(hasArchive) selector.innerHTML += archiveGroup;

   if (!data.themes || !data.themes[currentViewId]) {
       currentViewId = activeThemeId;
   }
   selector.value = currentViewId;
   const displayTheme = document.getElementById("display-theme");
   if (displayTheme && data.themes[currentViewId]) {
       displayTheme.innerText = data.themes[currentViewId].name;
   }
    
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
  window.allFetchedAlbumPhotos = []; 
  
  // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 4: Ακαριαίο καθάρισμα του DOM. Αλλιώς βλέπει "φαντάσματα" του παλιού άλμπουμ όσο περιμένει!
  const grid = document.getElementById("masonry-grid");
  if (grid) grid.innerHTML = "";

  // Κρύβουμε το κουμπί ανέβασματος αν βλέπουμε παλιό (αρχειοθετημένο) άλμπουμ
  
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

window.loadPhotos = function(isLoadMore = false) {
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
      
      let newFetched = allFetched.reverse();
      
      // ΔΙΟΡΘΩΣΗ: Προστασία από live "κλοπή" φωτογραφίας
      if (window.allFetchedAlbumPhotos && window.allFetchedAlbumPhotos.length > 0) {
          let diff = newFetched.length - window.allFetchedAlbumPhotos.length;
          if (diff > 0) currentDbLimit += diff;
      }

      window.allFetchedAlbumPhotos = newFetched;
      window.renderPhotos(false); 
  }, (error) => {
      // ⚠️ ΠΡΟΣΘΗΚΗ: Πιάνουμε το σφάλμα και κλείνουμε αμέσως το Watchdog!
      console.warn("Αναμονή ταυτοποίησης για τις φωτογραφίες...");
      window.stopWatchdog();
  });
}

// 2. ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Αστραπιαία εμφάνιση 
// 2. ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Αστραπιαία εμφάνιση 
window.renderPhotos = function(isLoadMore) {
  window.stopWatchdog();
  const grid = document.getElementById("masonry-grid");
  if (!grid) return;
  const emptyState = document.getElementById("empty-state");
  const btnLoadMore = document.getElementById("btn-load-more");

  // ΔΙΟΡΘΩΣΗ: Επαναφορά του κουμπιού Upload που είχε κρύψει ο Watchdog,
  // ελέγχοντας αν βρισκόμαστε στο τρέχον (ενεργό) άλμπουμ ώστε να μην ξεκλειδώσει το Αρχείο.
  const uploadBtn = document.getElementById("btn-upload");
  if (uploadBtn) {
    uploadBtn.style.display = (currentViewId === activeThemeId) ? "flex" : "none";
  }

 let allFetched = window.allFetchedAlbumPhotos || [];
 let hasMore = allFetched.length > currentDbLimit;
 let photos = hasMore ? allFetched.slice(0, currentDbLimit) : allFetched;
 
 // 🛡️ Αποτροπή Αποσυγχρονισμού. Αν ανέβει νέα φώτο Live όσο το Lightbox είναι ανοιχτό,
 // διορθώνουμε τον δείκτη αλλιώς ο χρήστης θα κάνει swipe σε λάθος φωτογραφίες!
 let lb = document.getElementById('album-dynamic-lightbox');
 if (lb && lb.style.display === 'flex' && window.albumPhotosList && window.albumPhotosList[currentLightboxIndex]) {
     let currentViewingId = window.albumPhotosList[currentLightboxIndex].id;
     window.albumPhotosList = allFetched; 
   let newIndex = window.albumPhotosList.findIndex(p => p.id === currentViewingId);
     if (newIndex !== -1) {
        currentLightboxIndex = newIndex;
        window.updateLightboxContent(); // Ζωντανή οπτική ανανέωση (π.χ. αν ο admin άλλαξε τη λεζάντα!)
     } else {
        // Η εικόνα διαγράφηκε Live! Ομαλό κλείσιμο του Lightbox.
        window.closeAlbumLightbox();
     }
 } else {
     window.albumPhotosList = allFetched; 
 }
 
 const newDbIds = photos.map(p => p.id);
  
  Array.from(grid.children).forEach(el => {
      if (!newDbIds.includes(el.dataset.id)) el.remove();
  });

  photos.forEach((photo, index) => {
    let existingEl = grid.querySelector(`[data-id="${photo.id}"]`);

  if (existingEl) {
        existingEl.onclick = () => window.openAlbumLightbox(index);
        existingEl.className = "polaroid-item"; 
        
        // ΝΕΟ: Ζωντανή ανανέωση του src της εικόνας σε περίπτωση Face Blur ή Περιστροφής
        let angleParam = photo.angle ? `a_${photo.angle},` : '';
        let optimizedUrl = photo.url.replace('/upload/', `/upload/${angleParam}q_auto,f_auto,w_600/`);
        let existingImg = existingEl.querySelector('img');
        if (existingImg && existingImg.src !== optimizedUrl) {
            existingImg.src = optimizedUrl;
        }

        // 🛡️ ΔΙΟΡΘΩΣΗ: Ζωντανή ανανέωση της λεζάντας αν έγινε edit από τη βάση δεδομένων!
        let existingCaption = existingEl.querySelector('.polaroid-caption');
      let safeCaption = photo.caption ? window.escapeHTML(photo.caption) : "";
      
      if (existingCaption) {
          if (!safeCaption) existingCaption.remove();
          else if (existingCaption.innerHTML !== safeCaption) existingCaption.innerHTML = safeCaption;
      } else if (safeCaption) {
          existingEl.insertAdjacentHTML('beforeend', `<div class="polaroid-caption">${safeCaption}</div>`);
      }

      if (grid.children[index] !== existingEl) grid.insertBefore(existingEl, grid.children[index] || null);
    } else {
let angleParam = photo.angle ? `a_${photo.angle},` : '';
let optimizedUrl = photo.url.replace('/upload/', `/upload/${angleParam}q_auto,f_auto,w_600/`);
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
    // ΔΙΟΡΘΩΣΗ: Επαναφορά του κανονικού σχεδιασμού "Άδειου άλμπουμ" αν είχε αλλοιωθεί από τον Watchdog
    if (emptyState.dataset.originalHtml) emptyState.innerHTML = emptyState.dataset.originalHtml;
    emptyState.style.display = "block";
    btnLoadMore.style.display = "none";
  }
}

// 3. ΑΣΤΡΑΠΙΑΙΟ Load More
window.showMorePhotos = function() {
  const btnLoadMore = document.getElementById("btn-load-more");
  // ΔΙΟΡΘΩΣΗ: Προστασία από "Spam" κλικ που κρασάρουν το layout
  if (btnLoadMore.style.pointerEvents === "none") return;

  btnLoadMore.innerText = "Φόρτωση... ⏳";
  btnLoadMore.style.pointerEvents = "none";
  btnLoadMore.style.opacity = "0.7";
  
  currentDbLimit += window.innerWidth <= 768 ? 4 : 9; 
  window.loadPhotos(true); 
  
  setTimeout(() => { 
    btnLoadMore.innerText = "Δείτε όλες τις αναμνήσεις 👇"; 
    btnLoadMore.style.pointerEvents = "auto";
    btnLoadMore.style.opacity = "1";
  }, 400); 
}

window.canUserUpload = async function() {
  if (!currentUserUid) {
    let authDone = false;
    authPromise.then(() => authDone = true);

    // Εμφανίζουμε τη φόρτωση ΜΟΝΟ αν αργήσει η σύνδεση πάνω από 200ms
    // ΔΙΟΡΘΩΣΗ: Αποθήκευση του timer και ακύρωση για αποτροπή SweetAlert Freeze
    let loadingTimer = setTimeout(() => {
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
    clearTimeout(loadingTimer);
    Swal.close();
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

  try {
    if (currentUserUid && !currentUserUid.startsWith("guest_")) {
   
      const snap = await Promise.race([
        dbPub.ref(`user_uploads/${currentUserUid}`).orderByValue().startAt(Date.now() - ONE_DAY).once('value'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
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
  if (isMobile && navigator.vibrate) navigator.vibrate(50);

  // ΔΙΟΡΘΩΣΗ: Τοπικός έλεγχος ΠΡΙΝ ανοίξει η συλλογή. 
  // Αν έχει πιάσει το όριο, δείχνει το popup χωρίς να τον βάζει να ψάχνει άδικα!
try {
    let localData = JSON.parse(localStorage.getItem('local_user_uploads') || '[]');
    if (!Array.isArray(localData)) localData = []; // Προστασία από TypeError
    let recentUploads = localData.filter(time => Date.now() - time < 24 * 60 * 60 * 1000);
    if (recentUploads.length >= 2) {
      window.canUserUpload(); // Εμφανίζει το popup με την αντίστροφη μέτρηση
      return; // Ακυρώνει το κλικ, δεν ανοίγει η συλλογή αρχείων!
    }
  } catch(e) {}

  // Ακαριαίο click για να μην μπλοκάρεται από το iOS Safari
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
  
      <!-- 🛡️ Προσθήκη Enter/Return για κινητά. Χωρίς αυτό, το μπλε Enter του πληκτρολογίου δεν κάνει απολύτως τίποτα! -->
      <input id="swal-input-caption" class="swal2-input" placeholder="Γράψε αν θέλεις μια λεζάντα! ✍️" maxlength="50" oninput="document.getElementById('live-caption').innerHTML = window.escapeHTML(this.value)" onkeydown="if(event.key === 'Enter') Swal.clickConfirm()" autocomplete="off">
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
    allowEscapeKey: false, // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 7: Κλείδωμα του ESC για να μην κλείνουν το loading "σπάζοντας" τη ροή!
    showConfirmButton: false,
    didOpen: () => { Swal.showLoading(); }
  });
  
// 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 8: Πρόληψη μόνιμου "παγώματος" σε παλιά iPhone που δεν υποστηρίζουν createImageBitmap
  if (typeof window.createImageBitmap !== "function") {
      Swal.fire({ icon: 'error', title: 'Παλιά Συσκευή', text: 'Ο περιηγητής σας είναι πολύ παλιός. Δοκιμάστε από άλλη συσκευή.', confirmButtonColor: '#e74c3c' });
      document.getElementById('file-upload').value = '';
      return;
  }

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
      
      // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 6: Γεμίζουμε με λευκό χρώμα ΠΡΙΝ ζωγραφίσουμε, 
      // αλλιώς τα διάφανα λογότυπα/αυτοκόλλητα (.png) θα βγουν με κατάμαυρο φόντο!
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      
      ctx.drawImage(img, 0, 0, width, height);
      
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("file", blob, "photo.jpg"); // 🛡️ Αλλαγή σε JPG
  
        
        // ⚠️ ΒΑΛΕ ΕΔΩ ΤΟ URL ΤΟΥ WORKER ΠΟΥ ΕΦΤΙΑΞΕΣ ΣΤΟ CLOUDFLARE ⚠️
        const WORKER_URL = "https://school-album-uploader.valantish.workers.dev";

        // Χτυπάμε τον Worker μας, ΟΧΙ το Cloudinary!
       // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 3: Προστασία από "Αιώνιο Πάγωμα". Αν κολλήσει το ίντερνετ πάνω από 15s, ακυρώνεται!
      // Χτυπάμε τον Worker μας, ΟΧΙ το Cloudinary!
        const uploadAbort = new AbortController();
        // Αυξάνουμε το όριο στα 45 δευτερόλεπτα. Σε δίκτυα 3G/4G η μεταφορά δεδομένων διαρκεί περισσότερο!
        const uploadTimeout = setTimeout(() => uploadAbort.abort(), 45000);

        // Χτυπάμε τον Worker μας, ΟΧΙ το Cloudinary!
        fetch(WORKER_URL, {
          method: "POST",
          body: formData,
          signal: uploadAbort.signal
        })
        .then(response => { clearTimeout(uploadTimeout); return response.json(); })
        .then(data => {
          if(data.secure_url) {
    
            const firebasePushPromise = dbPub.ref("album_photos").push({
              url: data.secure_url,
              caption: userCaption || "",
              theme_id: activeThemeId,
              status: "pending",
              timestamp: Date.now()
            });

            // 🛡️ ΔΙΟΡΘΩΣΗ: Timeout 10 δευτερολέπτων για να μην μείνει ο χρήστης κλειδωμένος στη φόρτωση για πάντα.
           // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 2: Αφαίρεση του Promise.race! Το Firebase κάνει αυτόματο background sync.
            let isUploadSlow = false;
            let slowUploadTimer = setTimeout(() => {
                isUploadSlow = true;
                Swal.fire({ icon: 'info', title: 'Αργό Ίντερνετ ⏳', text: 'Η φωτογραφία ανεβαίνει με ασφάλεια στο παρασκήνιο...', confirmButtonColor: '#f39c12' });
            }, 10000);

            firebasePushPromise.then(() => {
                clearTimeout(slowUploadTimer);
      
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
                title: isUploadSlow ? 'Επιτέλους ανέβηκε! 📸' : 'Η ανάμνηση στάλθηκε! 📸',
                text: 'Η φωτογραφία στάλθηκε. Σε λίγα λεπτά θα εμφανιστεί!',
                confirmButtonColor: '#2ecc71'
            });
            
            }).catch(err => {
                clearTimeout(slowUploadTimer);
                Swal.fire({ icon: 'error', title: 'Σφάλμα Αποθήκευσης', text: 'Χάθηκε η σύνδεση με τη βάση δεδομένων. Δοκιμάστε ξανά!', confirmButtonColor: '#e74c3c' });
            });
          } else {
            Swal.fire({ icon: 'error', title: 'Σφάλμα', text: 'Αποτυχία ανεβάσματος (Cloudflare). Δοκιμάστε ξανά.', confirmButtonColor: '#e74c3c' });
          }
        })
        .catch(err => {
          clearTimeout(uploadTimeout);
          let errorMsg = err.name === 'AbortError' ? 'Αργή σύνδεση! Το ανέβασμα ακυρώθηκε.' : 'Υπήρξε πρόβλημα δικτύου. Δοκιμάστε ξανά.';
          Swal.fire({ icon: 'error', title: 'Σφάλμα', text: errorMsg, confirmButtonColor: '#e74c3c' });
        });
   
}, "image/jpeg", 0.85);
      
      // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 1: Καθαρίζουμε το input ΜΟΝΟ αφού διαβαστεί η εικόνα!
      document.getElementById('file-upload').value = '';
      
 }).catch(err => {
      console.error("Σφάλμα ανάγνωσης εικόνας:", err);
      Swal.fire({ icon: 'error', title: 'Σφάλμα Εικόνας', text: 'Το αρχείο δεν μπορεί να διαβαστεί. Δοκιμάστε άλλη φωτογραφία.', confirmButtonColor: '#e74c3c' });
      document.getElementById('file-upload').value = ''; // 🛡️ Καθάρισμα και σε περίπτωση σφάλματος
  });
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
      // ΔΙΟΡΘΩΣΗ: Προσθήκη touch-action:none. Χωρίς αυτό, το παραμικρό λάθος στο Swipe θα κάνει Refresh (Pull-to-refresh) τη σελίδα!
        lb.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.92) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; z-index: 2147483647 !important; display: none; justify-content: center !important; align-items: center !important; flex-direction: column; opacity: 0; transition: opacity 0.3s ease; touch-action: none !important; overscroll-behavior: none !important;";
        
        lb.innerHTML = `
            <span style="position: absolute; top: 20px; right: 30px; color: white; font-size: 50px; cursor: pointer; text-shadow: 0 2px 10px rgba(0,0,0,0.8); transition: color 0.2s; z-index: 10;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='white'" onclick="window.closeAlbumLightbox()">&times;</span>
            
           <div class="lightbox-arrow1" style="position: absolute; left: 10px; color: white; font-size: 50px; cursor: pointer; padding: 20px; z-index: 10; user-select: none; text-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick="window.changeLightboxImage(-1, event)">&#10094;</div>
     
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <!-- 🛡️ ΔΙΟΡΘΩΣΗ: Προσθήκη draggable="false" και προστασίας επιλογής user-select -->
        <img id="album-dynamic-img" src="" draggable="false" style="max-width: 85vw !important; max-height: 75vh !important; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); transition: transform 0.3s ease, opacity 0.2s ease; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;" onclick="event.stopPropagation()" />
        <div id="album-dynamic-caption" onclick="event.stopPropagation()" style="color: white; font-family: 'Caveat', cursive; font-size: 32px; margin-top: 15px; text-shadow: 0 2px 5px rgba(0,0,0,0.8); text-align: center; max-width: 85vw; word-wrap: break-word;"></div>
    </div>

            <div class="lightbox-arrow1" style="position: absolute; right: 10px; color: white; font-size: 50px; cursor: pointer; padding: 20px; z-index: 10; user-select: none; text-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick="window.changeLightboxImage(1, event)">&#10095;</div>
        `;
        
        lb.onclick = window.closeAlbumLightbox;
        
      // Touch events για Swipe (Κινητά) - Προστασία από κάθετο scroll
       lb.addEventListener('touchstart', e => { 
           if (e.touches && e.touches.length > 1) return; // Επιτρέπουμε το Pinch-to-zoom
           touchStartX = e.changedTouches[0].screenX; 
           touchStartY = e.changedTouches[0].screenY; 
       }, {passive: true});
       
      lb.addEventListener('touchend', e => {
           if (e.changedTouches && e.changedTouches.length > 1) return; // Επιτρέπουμε το Pinch-to-zoom
           // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 10: Αγνόηση των Swipe αν ξεκίνησαν από την άκρη της οθόνης (< 30px). 
           if (touchStartX < 30 || touchStartX > window.innerWidth - 30) return;

            touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            
            let diffX = touchStartX - touchEndX;
            let diffY = touchStartY - touchEndY;
            
         
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) window.changeLightboxImage(1, e); 
                else window.changeLightboxImage(-1, e); 
            }
            // 🛡️ Κλείσιμο Lightbox με Swipe Up/Down, η νούμερο 1 φυσική κίνηση στα κινητά!
            else if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX)) {
                window.closeAlbumLightbox();
            }
        }, {passive: true});

        document.body.appendChild(lb); 
    }

    window.updateLightboxContent();
    // 🛡️ ΔΙΟΡΘΩΣΗ: Αν ο χρήστης το άνοιξε ξανά πριν προλάβει να κλείσει, ακυρώνουμε την εξαφάνιση!
    if (window.lightboxCloseTimer) clearTimeout(window.lightboxCloseTimer); 

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
    
  img.style.opacity = "0"; cap.style.opacity = "0";
    img.style.transform = step > 0 ? "scale(0.95) translateX(20px)" : "scale(0.95) translateX(-20px)";
    
    // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 11: Μηδενισμός του onload. Αν ο χρήστης κάνει rapid-clicks, 
    // το onload της παλιάς εικόνας μπορεί να εκτελεστεί αργοπορημένα, "σπάζοντας" τη ροή!
    img.onload = null;

    // ΔΙΟΡΘΩΣΗ: Αν ο χρήστης σπαμάρει το κλικ, ακυρώνουμε το παλιό animation για να μην υπάρξει glitch
    if (window.lightboxTimer) clearTimeout(window.lightboxTimer);

   window.lightboxTimer = setTimeout(() => {
        window.updateLightboxContent();
        
        // ΔΙΟΡΘΩΣΗ: Εμφάνιση της νέας εικόνας ΜΟΝΟ όταν έχει κατέβει, αλλιώς φαίνεται η παλιά!
        const revealImage = () => {
            img.style.opacity = "1"; 
            cap.style.opacity = "1";
            img.style.transform = "scale(1) translateX(0)";
        };

      if (img.complete) revealImage();
        else {
            img.onload = revealImage;
            // Απεγκλωβισμός: Αποκαλύπτει το Lightbox ακόμα και αν η εικόνα σπάσει, για να μπορεί να το κλείσει.
            img.onerror = revealImage; 
        }
    }, 200);
};

window.updateLightboxContent = function() {
    if (window.albumPhotosList && window.albumPhotosList[currentLightboxIndex]) {
      const photo = window.albumPhotosList[currentLightboxIndex];
       let angleParam = photo.angle ? `a_${photo.angle},` : '';
const highResUrl = photo.url.replace('/upload/', `/upload/${angleParam}q_auto,f_auto,w_1600/`);
        
        const currentImg = document.getElementById('album-dynamic-img');
        // Αποτροπή Flicker: Ανανεώνουμε το src ΜΟΝΟ αν όντως η εικόνα άλλαξε!
        if (currentImg.getAttribute('src') !== highResUrl) {
            currentImg.src = highResUrl;
        }
        
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
        // 🛡️ ΔΙΟΡΘΩΣΗ: Αποθηκεύουμε το χρονόμετρο για να μπορούμε να το διακόψουμε!
        window.lightboxCloseTimer = setTimeout(() => { lb.style.setProperty('display', 'none', 'important'); }, 300);
    }
    document.body.style.removeProperty('overflow');
};

// Υποστήριξη Πληκτρολογίου
document.addEventListener('keydown', function(event){
    const lb = document.getElementById('album-dynamic-lightbox');
    // 🛡️ ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 9: Προστασία από "Phantom Clicks" αν ο χρήστης πατήσει βελάκια ενώ το lightbox κλείνει!
  if(lb && lb.style.display === 'flex' && lb.style.opacity === "1") {
        if(event.key === "Escape") { event.preventDefault(); window.closeAlbumLightbox(); }
        if(event.key === "ArrowRight") { event.preventDefault(); window.changeLightboxImage(1); }
        if(event.key === "ArrowLeft") { event.preventDefault(); window.changeLightboxImage(-1); }
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

      // ΔΙΟΡΘΩΣΗ: Αποτροπή drag & drop (κρυφού ανεβάσματος) αν ο χρήστης βλέπει παλαιότερο αρχειοθετημένο άλμπουμ!
      if (currentViewId !== activeThemeId) {
        Swal.fire({ icon: 'warning', title: 'Κλειδωμένο Άλμπουμ', text: 'Δεν μπορείς να προσθέσεις φωτογραφίες στο Αρχείο!', confirmButtonColor: '#1e6cff' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        Swal.fire({ icon: 'warning', title: 'Όπα!', text: 'Ρίξε μόνο εικόνες!', confirmButtonColor: '#1e6cff' });
        return;
      }

      const fakeEvent = { target: { files: [file] } };
      window.uploadImage(fakeEvent);
    });
  }
});
