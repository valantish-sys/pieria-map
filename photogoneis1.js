// --- 1. ΤΑ ΣΤΟΙΧΕΙΑ CLOUDINARY ---
const CLOUD_NAME = "drx2a5ane"; 
const UPLOAD_PRESET = "school_album"; 

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

// --- ΑΟΡΑΤΗ ΣΥΝΔΕΣΗ ΧΡΗΣΤΗ ΓΙΑ ΤΟ RATE LIMITING ---
authPub.onAuthStateChanged(user => {
  if (user) {
    currentUserUid = user.uid; // Αποθηκεύουμε το μοναδικό κρυφό ID του
  } else {
    authPub.signInAnonymously().catch(err => console.error("Auth Error:", err));
  }
});
let activeThemeId = "";
let currentViewId = "";
let currentDbLimit = window.innerWidth <= 768 ? 1 : 3;
let activeQuery = null;
let newPhotoListener = null;

// Φόρτωση Θεμάτων
dbPub.ref("album_settings").on("value", snap => {
  const data = snap.val();
  if(!data || !data.current_theme) return;
  
  activeThemeId = data.current_theme.id;
  if(!currentViewId) currentViewId = activeThemeId;

  const selector = document.getElementById("theme-selector");
  if (!selector) return;
  selector.innerHTML = "";
  
  if(data.themes[activeThemeId]) {
    selector.innerHTML += `<option value="${activeThemeId}">✨ Τρέχον: ${data.themes[activeThemeId].name}</option>`;
  }
  
  let archiveGroup = `<optgroup label="🗂️ Αρχείο (Παλαιότερα)">`;
  let hasArchive = false;
  
  // Ταξινομούμε τα παλιά θέματα χρονολογικά
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
  document.getElementById("display-theme").innerText = data.themes[currentViewId].name;
  
  loadPhotos();
});

window.changeTheme = function() {
  currentViewId = document.getElementById("theme-selector").value;
currentDbLimit = window.innerWidth <= 768 ? 1 : 3; // Επαναφορά ορίου
  
  const btn = document.getElementById("btn-upload");
  if (currentViewId === activeThemeId) {
      btn.style.display = "flex";
  } else {
      btn.style.display = "none";
  }
  
  dbPub.ref("album_settings/themes/" + currentViewId).once("value", snap => {
    document.getElementById("display-theme").innerText = snap.val().name;
  });
  loadPhotos();
}

function loadPhotos(isLoadMore = false) {
  const grid = document.getElementById("masonry-grid");
  if (!grid) return;
  const emptyState = document.getElementById("empty-state");
  const btnLoadMore = document.getElementById("btn-load-more");

  if (activeQuery) activeQuery.off();
  
 // 1. ΑΛΗΘΙΝΟ PAGINATION: Ζητάμε (όριο + 1) με .once() 
  activeQuery = dbPub.ref("album_photos")
    .orderByChild("theme_id")
    .equalTo(currentViewId)
    .limitToLast(currentDbLimit + 1);

  activeQuery.once("value", snap => {
      let allFetched = [];
      snap.forEach(child => {
        if(child.val().status === "approved") {
          let photoData = child.val(); photoData.id = child.key;
          allFetched.push(photoData);
        }
      });
      allFetched.reverse();

      // Αν έφερε όσες ζητήσαμε (+1), σημαίνει ότι υπάρχουν κι άλλες στη βάση!
      let hasMore = allFetched.length > currentDbLimit;
      let photos = hasMore ? allFetched.slice(0, currentDbLimit) : allFetched;
      
      window.albumPhotosList = photos;
      const newDbIds = photos.map(p => p.id);
      
      Array.from(grid.children).forEach(el => {
          if (!newDbIds.includes(el.dataset.id)) el.remove();
      });

      photos.forEach((photo, index) => {
        let existingEl = grid.querySelector(`[data-id="${photo.id}"]`);

        if (existingEl) {
          existingEl.onclick = () => openAlbumLightbox(index);
          existingEl.className = "polaroid-item"; // Καταργούμε το hidden-photo εντελώς!
        } else {
          let optimizedUrl = photo.url.replace('/upload/', '/upload/q_auto,f_auto,w_600/');
          let captionHtml = photo.caption ? `<div class="polaroid-caption">${photo.caption}</div>` : "";
          
          let newDiv = document.createElement('div');
          newDiv.className = 'polaroid-item';
          newDiv.dataset.id = photo.id;
          newDiv.onclick = () => openAlbumLightbox(index);
          
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

      // 2. ΤΕΛΟΣ ΤΟ ΣΦΥΡΟΚΟΠΗΜΑ: Ακούμε live ΜΟΝΟ για τη 1 νέα προσθήκη!
      if (!isLoadMore) {
        if (newPhotoListener) newPhotoListener.off();
        newPhotoListener = dbPub.ref("album_photos")
            .orderByChild("theme_id")
            .equalTo(currentViewId)
            .limitToLast(1);

        newPhotoListener.on("child_added", newSnap => {
            let photoData = newSnap.val();
            // Αν μπήκε νέα φώτο και ΔΕΝ την έχουμε ήδη στην οθόνη:
            if (photoData.status === "approved" && !window.albumPhotosList.some(p => p.id === newSnap.key)) {
                photoData.id = newSnap.key;
                window.albumPhotosList.unshift(photoData); // Μπαίνει πρώτη στη μνήμη
                
                let optimizedUrl = photoData.url.replace('/upload/', '/upload/q_auto,f_auto,w_600/');
                let captionHtml = photoData.caption ? `<div class="polaroid-caption">${photoData.caption}</div>` : "";
                
                let newDiv = document.createElement('div');
                newDiv.className = 'polaroid-item';
                newDiv.dataset.id = photoData.id;
                newDiv.style.animationDelay = '0s'; // Χωρίς delay για να σκάσει αμέσως!
                newDiv.innerHTML = `<img src="${optimizedUrl}" loading="lazy" alt="Σχολική Ανάμνηση">${captionHtml}`;
                
                grid.prepend(newDiv); // Μπαίνει Live ΠΡΩΤΗ στην οθόνη!
                
                // Φτιάχνουμε ξανά τα νούμερα στο Lightbox για να μη χαλάσει η σειρά
                Array.from(grid.children).forEach((el, idx) => el.onclick = () => openAlbumLightbox(idx));
                
                grid.style.display = "block";
                emptyState.style.display = "none";
            }
        });
      }
  });
}

window.showMorePhotos = function() {
  const btnLoadMore = document.getElementById("btn-load-more");
  btnLoadMore.innerText = "Φόρτωση... \u23F3";
  
  currentDbLimit += window.innerWidth <= 768 ? 4 : 9; 
  loadPhotos(true); // Περνάμε true για να μην παίξουν τα animation delay ξανά
  
  setTimeout(() => { btnLoadMore.innerText = "Δείτε όλες τις αναμνήσεις 👇"; }, 1000);
}

// Συνάρτηση που ελέγχει το όριο απευθείας από τη Firebase
async function canUserUpload() {
  if (!currentUserUid) {
    Swal.fire({ icon: 'info', title: 'Σύνδεση...', text: 'Ασφαλής σύνδεση. Παρακαλώ περίμενε 1-2 δευτερόλεπτα.' });
    return false;
  }
  
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const snap = await dbPub.ref(`user_uploads/${currentUserUid}`).once('value');
  let timestamps = [];
  let updates = {};
  
  if (snap.exists()) {
    snap.forEach(child => {
      let time = child.val();
      if (now - time < ONE_DAY) {
        timestamps.push(time);
      } else {
        updates[child.key] = null; // Επιλέγουμε να διαγράψουμε όσα έληξαν (πάνω από 24ωρο)
      }
    });
  }
  
  // Εκκαθάριση παλιών εγγραφών
  if (Object.keys(updates).length > 0) {
    dbPub.ref(`user_uploads/${currentUserUid}`).update(updates);
  }
  
  // Έλεγχος ορίου 2 φωτογραφιών
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
window.checkUploadLimit = async function() {
  if (navigator.vibrate) navigator.vibrate(50);
  const isAllowed = await canUserUpload();
  if (isAllowed) {
    document.getElementById('file-upload').click();
  }
}

window.uploadImage = async function(event) {
  const file = event.target.files[0];
  if(!file) return;
  
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
      <input id="swal-input-caption" class="swal2-input" placeholder="Γράψε αν θέλεις μια λεζάντα! ✍️" maxlength="50" oninput="document.getElementById('live-caption').innerText = this.value" autocomplete="off">
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
      const MAX_WIDTH = 1200;
      let width = img.width; let height = img.height;
      if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("upload_preset", UPLOAD_PRESET);

        fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if(data.secure_url) {
            dbPub.ref("album_photos").push({
              url: data.secure_url,
              caption: userCaption || "",
              theme_id: activeThemeId,
              status: "pending",
              timestamp: Date.now()
            });
            
            // --- ΑΡΧΗ ΚΩΔΙΚΑ WEB3FORMS ΓΙΑ EMAIL ---
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: "50fa03f9-5c1e-4e99-867e-fdb1b1886565",
                    subject: "Νέα Φωτογραφία στο Άλμπουμ! 📸",
                    from_name: "Σχολικό Blog",
                    message: `Γεια σου! Κάποιος μόλις ανέβασε μια νέα φωτογραφία. Λεζάντα: "${userCaption || "Χωρίς Λεζάντα"}". Μπες στην κρυφή σελίδα διαχειριστή για να την εγκρίνεις ή να τη διαγράψεις.`
                })
            }).catch(error => console.log("Το email ειδοποίησης απέτυχε:", error));
            // --- ΤΕΛΟΣ ΚΩΔΙΚΑ WEB3FORMS ---
            
            // Καταγραφή ανεβάσματος ΑΠΕΥΘΕΙΑΣ στον Server (Firebase) αντί για LocalStorage
            if (currentUserUid) {
                dbPub.ref(`user_uploads/${currentUserUid}`).push(Date.now());
            }
            
            Swal.fire({
              icon: 'success',
              title: 'Η ανάμνηση στάλθηκε! 📸',
              text: 'Η φωτογραφία στάλθηκε. Σε λίγα λεπτά θα εμφανιστεί!',
              confirmButtonColor: '#2ecc71'
            });
          }
        })
        .catch(err => {
          Swal.fire({ icon: 'error', title: 'Σφάλμα', text: 'Υπήρξε πρόβλημα. Δοκιμάστε ξανά.', confirmButtonColor: '#e74c3c' });
        });
     }, "image/webp", 0.85); 
  }).catch(err => console.error("Σφάλμα ανάγνωσης εικόνας:", err));
  
  document.getElementById('file-upload').value = '';
}

// --- ΝΕΟ LIGHTBOX ΜΕ SLIDESHOW, ΛΕΖΑΝΤΕΣ & SWIPE ---
let currentLightboxIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

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
                <div id="album-dynamic-caption" style="color: white; font-family: 'Caveat', cursive; font-size: 32px; margin-top: 15px; text-shadow: 0 2px 5px rgba(0,0,0,0.8); text-align: center; max-width: 85vw; word-wrap: break-word;"></div>
            </div>

            <div class="lightbox-arrow1" style="position: absolute; right: 10px; color: white; font-size: 50px; cursor: pointer; padding: 20px; z-index: 10; user-select: none; text-shadow: 0 2px 5px rgba(0,0,0,0.5);" onclick="window.changeLightboxImage(1, event)">&#10095;</div>
        `;
        
        lb.onclick = window.closeAlbumLightbox;
        
        // Touch events για Swipe (Κινητά)
        lb.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
        lb.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) changeLightboxImage(1, e); // Swipe Αριστερά -> Επόμενη
            if (touchEndX - touchStartX > 50) changeLightboxImage(-1, e); // Swipe Δεξιά -> Προηγούμενη
        }, {passive: true});

        document.body.appendChild(lb); 
    }
    
    updateLightboxContent();
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
    img.style.opacity = "0"; cap.style.opacity = "0";
    img.style.transform = step > 0 ? "scale(0.95) translateX(20px)" : "scale(0.95) translateX(-20px)";
    
    setTimeout(() => {
        updateLightboxContent();
        img.style.opacity = "1"; cap.style.opacity = "1";
        img.style.transform = "scale(1) translateX(0)";
    }, 200);
};

window.updateLightboxContent = function() {
    if (window.albumPhotosList && window.albumPhotosList[currentLightboxIndex]) {
        const photo = window.albumPhotosList[currentLightboxIndex];
        const highResUrl = photo.url.replace('/upload/', '/upload/q_auto,f_auto,w_1600/');
        document.getElementById('album-dynamic-img').src = highResUrl;
        document.getElementById('album-dynamic-caption').innerText = photo.caption || "";
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
        if(event.key === "ArrowRight") changeLightboxImage(1);
        if(event.key === "ArrowLeft") changeLightboxImage(-1);
    }
});
// --- DRAG & DROP ΜΗΧΑΝΙΣΜΟΣ ---
const albumBox = document.getElementById('school-album');
const dragOverlay = document.getElementById('drag-overlay');
if (albumBox && dragOverlay) {
// 1. Αποτρέπουμε τον browser να ανοίξει τη φώτο σε νέα καρτέλα
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  albumBox.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// 2. Εμφάνιση της πράσινης οθόνης όταν η φωτογραφία είναι από πάνω
['dragenter', 'dragover'].forEach(eventName => {
  albumBox.addEventListener(eventName, () => dragOverlay.classList.add('active'));
});

// 3. Κρύψιμο της πράσινης οθόνης αν βγει έξω ή "πέσει" η φωτογραφία
['dragleave', 'drop'].forEach(eventName => {
  albumBox.addEventListener(eventName, () => dragOverlay.classList.remove('active'));
});

// 4. Τι γίνεται τη στιγμή που "αφήνει" τη φωτογραφία!
albumBox.addEventListener('drop', async e => {
  const file = e.dataTransfer.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    Swal.fire({ icon: 'warning', title: 'Όπα!', text: 'Ρίξε μόνο εικόνες (jpg, png κλπ)!', confirmButtonColor: '#1e6cff' });
    return;
  }

  // Έλεγχος 2: Αδιαπέραστο όριο μέσω Server!
  const isAllowed = await canUserUpload();
  if (!isAllowed) return; // Το Pop-up με το χρονόμετρο εμφανίστηκε ήδη, άρα σταματάμε εδώ.

  // Αν όλα είναι τέλεια...
  const fakeEvent = { target: { files: [file] } };
  window.uploadImage(fakeEvent);
});
  }
