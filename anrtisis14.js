let selectedFile = null;
let isSubmitting = false; 


window.escapeHTML = (str) => {
  if (!str) return "";
  let escaped = String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
  return escaped.replace(/\n/g, '<br>'); 
};


const compressImageLocally = async (file) => {
    return new Promise((resolve, reject) => { 
       
        if (file.name.toLowerCase().match(/\.(heic|heif)$/)) return resolve(file);

        if (typeof window.createImageBitmap !== "function") return resolve(file);

        window.createImageBitmap(file).then(img => {
            const canvas = document.createElement("canvas");
            const MAX_DIM = 1200; 
            let width = img.width; let height = img.height;
            
            if (width > height && width > MAX_DIM) { 
                height = Math.round(height * (MAX_DIM / width)); width = MAX_DIM; 
            } else if (height >= width && height > MAX_DIM) { 
                width = Math.round(width * (MAX_DIM / height)); height = MAX_DIM; 
            }
            
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
          ctx.fillStyle = "#ffffff"; 
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            if (typeof img.close === 'function') img.close(); 
     
            canvas.toBlob(blob => {
                if (!blob) return reject(new Error('memory_fail'));
                resolve(blob); 
            }, "image/jpeg", 0.85); 
        }).catch(() => reject(new Error('old_device')));
    });
};

function previewParentImage(event) {
    selectedFile = event.target.files[0];
    const img = document.getElementById('p-img-preview');
    
    if (selectedFile) {

        const isImage = selectedFile.type.startsWith('image/');
        const isHeicOrWebp = selectedFile.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);
        
       if (!isImage && !isHeicOrWebp) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Επιτρέπονται μόνο εικόνες (jpg, png, webp, heic).' });
            else alert("Επιτρέπονται μόνο εικόνες (jpg, png, webp, heic).");
            document.getElementById('p-image').value = '';
            selectedFile = null;
      
            const imgPrev = document.getElementById('p-img-preview');
            if (imgPrev && imgPrev.src && imgPrev.src.startsWith('blob:')) URL.revokeObjectURL(imgPrev.src);
            if (imgPrev) {
                imgPrev.src = '';
                imgPrev.style.display = 'none';
            }
            return;
        }

        const img = document.getElementById('p-img-preview');

        if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        
   img.src = URL.createObjectURL(selectedFile);
        img.style.display = 'block';
        // Εμφανίζει το κουμπί διαγραφής
        if (document.getElementById('p-remove-img-btn')) document.getElementById('p-remove-img-btn').style.display = 'block';
    } else {
        // Κρύβει το κουμπί διαγραφής
        if (document.getElementById('p-remove-img-btn')) document.getElementById('p-remove-img-btn').style.display = 'none';
        
        if (img && img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        if (img) {
            img.src = '';
            img.style.display = 'none';
        }
    }
}

function initParentForm(retries = 0) {
 
   if (typeof firebase === 'undefined' || !firebase.database) {
        if (retries > 200) return; 
        setTimeout(() => initParentForm(retries + 1), 100);
        return;
    }
    
    const anartiseisConfig = {
        apiKey: "AIzaSyBYFxqAvOo0T91L2bFrJ6kA_MnI4uR-sAA",
        authDomain: "anartiseis-7cad1.firebaseapp.com",
        databaseURL: "https://anartiseis-7cad1-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "anartiseis-7cad1"
    };

    let anartiseisApp;
    try {
        anartiseisApp = firebase.app("AnartiseisApp");
    } catch (e) {
        anartiseisApp = firebase.initializeApp(anartiseisConfig, "AnartiseisApp");
    }
    window.dbAnartiseis = anartiseisApp.database();
}

async function submitParentPost() {
    if (isSubmitting) return; 

    const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
    if (isMobile && navigator.vibrate) navigator.vibrate(50);

    const rawAuthor = document.getElementById('p-author').value.trim();
    const rawTitle = document.getElementById('p-title').value.trim();
    const rawContent = document.getElementById('p-content').value.trim();
    const btn = document.getElementById('p-submit-btn');

if (!rawTitle || !rawContent) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Ελλιπή στοιχεία', text: 'Ο Τίτλος και το Κείμενο είναι υποχρεωτικά!' });
        else alert('Ο Τίτλος και το Κείμενο είναι υποχρεωτικά!');
        return;
    }

    if (!navigator.onLine) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Εκτός Σύνδεσης', text: 'Δεν έχετε πρόσβαση στο internet αυτή τη στιγμή.' });
        else alert('Εκτός Σύνδεσης! Ελέγξτε το δίκτυό σας.');
        return;
    }

    if (!window.dbAnartiseis) {
        alert("Παρακαλώ περιμένετε 1 δευτερόλεπτο να φορτώσει η σελίδα και δοκιμάστε ξανά.");
        return;
    }

    const ONE_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let postTimestamps = [];
    
    try {
        let stored = JSON.parse(localStorage.getItem('parent_posts_timestamps') || '[]');
        if (!Array.isArray(stored)) stored = [];
    
        postTimestamps = stored.filter(time => now - time < ONE_DAY);
        localStorage.setItem('parent_posts_timestamps', JSON.stringify(postTimestamps));
    } catch(e) { postTimestamps = []; }

    if (postTimestamps.length >= 2) {
        const oldestUpload = Math.min(...postTimestamps);
        const unlockTime = oldestUpload + ONE_DAY;

        let timerInterval;
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Τα λέμε αργότερα! ⏳',
                html: `Έχετε ήδη στείλει 2 αναρτήσεις σήμερα.<br>Μπορείτε να στείλετε ξανά σε:<br>
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
        } else {
            alert('Έχετε στείλει ήδη 2 αναρτήσεις σήμερα. Δοκιμάστε ξανά αύριο!');
        }
        return; 
    }

   const author = rawAuthor ? window.escapeHTML(rawAuthor) : "Ανώνυμος";
    const title = window.escapeHTML(rawTitle);
    const content = window.escapeHTML(rawContent);

  isSubmitting = true;
    btn.disabled = true;
    btn.innerHTML = "Επεξεργασία... ⏳";

    document.getElementById('p-image').disabled = true;
    document.getElementById('p-author').readOnly = true;
    document.getElementById('p-title').readOnly = true;
    document.getElementById('p-content').readOnly = true;
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.7";

  let imageUrl = null;
    let slowUploadTimer; 

  try {
      
        if (selectedFile) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Επεξεργασία & Ανέβασμα...', allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
           
                setTimeout(() => {
                    if (isSubmitting) Swal.update({ title: 'Αργό Ίντερνετ ⏳', html: 'Το αρχείο είναι μεγάλο ή η σύνδεση σας καθυστερεί...' });
                }, 8000); 
            }
   
            const compressedBlob = await compressImageLocally(selectedFile);
            
            const formData = new FormData();
            formData.append("file", compressedBlob, "post_image.jpg");
            formData.append("upload_preset", "anartisis"); 

            const CLOUD_NAME = "h5dkbv63"; 
     
            const uploadAbort = new AbortController();
            const uploadTimeout = setTimeout(() => uploadAbort.abort(), 45000);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST", body: formData, signal: uploadAbort.signal
            });
            clearTimeout(uploadTimeout);
            const cloudData = await cloudRes.json();
            
         if (cloudData.secure_url) {
             
                imageUrl = cloudData.secure_url.replace('/upload/', '/upload/c_limit,w_1600,f_auto,q_auto/');
            } else if (cloudData.error) {
                throw new Error(cloudData.error.message);
            }
        } else {
             if (typeof Swal !== 'undefined') Swal.fire({ title: 'Αποστολή...', allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
        }

       const newPostRef = window.dbAnartiseis.ref("parent_posts").push();

        const firebasePushPromise = newPostRef.set({
            author: author,
            title: title,
            content: content,
            status: "pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            ...(imageUrl && { imageUrl: imageUrl })
        });

    let isUploadSlow = false;
      slowUploadTimer = setTimeout(() => { 
            isUploadSlow = true;
            if (typeof Swal !== 'undefined') Swal.fire({ 
                icon: 'info', 
                title: 'Αργό Ίντερνετ ⏳', 
                text: 'Παρακαλώ περιμένετε να ολοκληρωθεί η αποθήκευση...', 
                showConfirmButton: false,
                allowOutsideClick: false, 
                allowEscapeKey: false
            });
        }, 10000);

      let fbTimer;
        const firebaseTimeout = new Promise((_, reject) => {
            fbTimer = setTimeout(() => reject(new Error('firebase_timeout')), 15000);
        });
        await Promise.race([firebasePushPromise, firebaseTimeout]);
        clearTimeout(fbTimer); 
        clearTimeout(slowUploadTimer);
        postTimestamps.push(Date.now());
        try { localStorage.setItem('parent_posts_timestamps', JSON.stringify(postTimestamps)); } catch(e) {}

        const emailKey = 'web3forms_post_emails_sent';
        const todayStr = new Date().toDateString();
        let emailData = { date: todayStr, count: 0 };
        
        try {
            let storedEmail = localStorage.getItem(emailKey);
            if (storedEmail) {
                let parsed = JSON.parse(storedEmail);
                if (parsed.date === todayStr) emailData.count = parsed.count;
            }
        } catch (e) {}
        
        if (emailData.count < 3) {
            emailData.count++;
            try { localStorage.setItem(emailKey, JSON.stringify(emailData)); } catch(e) {}
            
            const k1 = "50fa03f9-";
            const k2 = "5c1e-4e99-";
            const k3 = "867e-fdb1b1886565";
            
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    access_key: k1 + k2 + k3,
                    subject: "📝 Νέα Ανάρτηση προς Έγκριση",
                    from_name: "Φόρμα Ανάρτησης",
        
                    message: `Ο χρήστης "${rawAuthor}" μόλις έστειλε μια νέα ανάρτηση!\n\nΤίτλος: ${rawTitle}\nΚείμενο: ${rawContent}\n\nΕικόνα: ${imageUrl ? imageUrl : "Χωρίς φωτογραφία"}\n\nΜπες στο διαχειριστικό για έγκριση!`,
                    botcheck: false
                })
          }).catch(error => console.log("Το email ειδοποίησης απέτυχε:", error));
        } else {
            console.warn("Anti-Spam: Αποτράπηκε αποστολή υπερβολικών emails.");
        }


        if (typeof Swal !== 'undefined') {
            Swal.fire({ 
                icon: 'success', 
                title: 'Η ανάρτηση στάλθηκε! 📸', 
                text: 'Το κείμενο και η φωτογραφία στάλθηκαν. Σε λίγα λεπτά θα εμφανιστούν!', 
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2ecc71', 
                allowOutsideClick: false
            });
        } else {
            alert('Η ανάρτηση στάλθηκε για έγκριση!');
        }

        document.getElementById('p-author').value = '';
        document.getElementById('p-title').value = '';
        document.getElementById('p-content').value = '';
        document.getElementById('p-image').value = '';
        selectedFile = null;

       
        const imgPrev = document.getElementById('p-img-preview');
        if (imgPrev && imgPrev.src && imgPrev.src.startsWith('blob:')) {
            URL.revokeObjectURL(imgPrev.src);
            imgPrev.src = '';
            imgPrev.style.display = 'none';
        }
  
        document.getElementById('p-image').disabled = false;
        document.getElementById('p-author').readOnly = false;
        document.getElementById('p-title').readOnly = false;
        document.getElementById('p-content').readOnly = false;
        
        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
        isSubmitting = false;

  
        ['p-author', 'p-title', 'p-content'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.dispatchEvent(new Event('input')); 
        });

} catch (error) {
        clearTimeout(slowUploadTimer); 
        console.error(error);
        let errorMsg = 'Υπήρξε πρόβλημα κατά την αποστολή. Δοκιμάστε ξανά.';
        
      
        if (error.name === 'AbortError') errorMsg = 'Αργή σύνδεση! Το ανέβασμα ακυρώθηκε.';
        if (error.message === 'old_device') errorMsg = 'Η συσκευή σας είναι πολύ παλιά για επεξεργασία εικόνας.';
       if (error.message === 'memory_fail') errorMsg = 'Η εικόνα είναι πολύ βαριά και η συσκευή ξέμεινε από μνήμη.';
        if (error.message === 'firebase_timeout') errorMsg = 'Αποτυχία σύνδεσης με τη βάση (πιθανό μπλοκάρισμα δικτύου). Δοκιμάστε ξανά!';

       if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Σφάλμα', text: errorMsg });
        else alert(errorMsg);
        
     
        document.getElementById('p-image').disabled = false;
        document.getElementById('p-author').readOnly = false;
        document.getElementById('p-title').readOnly = false;
        document.getElementById('p-content').readOnly = false;
        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
        
        isSubmitting = false;
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
        
    }
  }

initParentForm();

const initPostDragAndDrop = () => {
 
    window.addEventListener('dragover', e => e.preventDefault(), false);
    window.addEventListener('drop', e => e.preventDefault(), false);

    const dropZone = document.getElementById('p-drop-zone');
    const fileInput = document.getElementById('p-image');
    if (!dropZone || !fileInput) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

 
    let pDragCounter = 0; 

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            if (eventName === 'dragenter') pDragCounter++;
            dropZone.style.background = 'rgba(30, 108, 255, 0.1)';
            dropZone.style.borderColor = '#2ecc71';
        });
    });

  ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            if (eventName === 'dragleave') pDragCounter--;
            
            if (pDragCounter <= 0 || eventName === 'drop') {
                pDragCounter = 0; // Επαναφορά
                dropZone.style.background = 'rgba(255,255,255,0.5)';
                dropZone.style.borderColor = '#1e6cff';
            }
        });
    });

  dropZone.addEventListener('drop', e => {
        if (isSubmitting) return; 
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const isImage = file.type.startsWith('image/');
        const isHeicOrWebp = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);
        
        if (!isImage && !isHeicOrWebp) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Ρίξτε μόνο εικόνες (jpg, png, webp, heic).' });
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        previewParentImage({ target: fileInput });
    });
};


const initCharCounters = () => {

    const limits = { 'p-author': 40, 'p-title': 100, 'p-content': 1500 };
    
  for (const [id, max] of Object.entries(limits)) {
        const el = document.getElementById(id);
        if (!el || el.dataset.counterInit) continue; 
        el.dataset.counterInit = 'true';
        
        el.setAttribute('maxlength', max); 

        const counter = document.createElement('div');
        counter.style.cssText = "text-align: right; font-size: 11px; color: #7f8c8d; margin-top: 4px; font-weight: bold;";
        counter.innerText = `${max} χαρακτήρες έμειναν`;
        el.parentNode.insertBefore(counter, el.nextSibling); 
        
     
       el.addEventListener('input', () => {
            const remain = max - el.value.length;
            counter.innerText = `${remain} χαρακτήρες έμειναν`;
         
            counter.style.color = remain <= (max * 0.1) ? '#e74c3c' : '#7f8c8d';
            
            // ΝΕΟ: Αυτόματο ύψος (Auto-resize) για το πεδίο κειμένου
            if (id === 'p-content') {
                el.style.height = 'auto';
                el.style.height = (el.scrollHeight) + 'px';
            }
        });
        
  
        el.dispatchEvent(new Event('input'));
    }
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initPostDragAndDrop();
        initCharCounters();
    });
} else {
    initPostDragAndDrop(); 
    initCharCounters();
}
// ΝΕΟ: Υποστήριξη Επικόλλησης (Paste) Εικόνας
window.addEventListener('paste', e => {
    if (isSubmitting) return;
    const items = (e.clipboardData || window.clipboardData).items;
    let file = null;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            file = items[i].getAsFile();
            break;
        }
    }
    if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileInput = document.getElementById('p-image');
        fileInput.files = dataTransfer.files;
        previewParentImage({ target: fileInput });
    }
});
