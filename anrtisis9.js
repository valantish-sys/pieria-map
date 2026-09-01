let selectedFile = null;
let isSubmitting = false; // Προστασία από διπλά (spam) κλικ

// 1. Προστασία XSS: Καθαρίζει τα κείμενα από κακόβουλα html/scripts
window.escapeHTML = (str) => {
  if (!str) return "";
  let escaped = String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
  return escaped.replace(/\n/g, '<br>'); 
};

// 2. Τοπική Συμπίεση Εικόνας (Canvas)
const compressImageLocally = async (file) => {
    return new Promise((resolve, reject) => { 
        // 🍏 Παράκαμψη τοπικής συμπίεσης για iPhone (HEIC) γιατί το Canvas θα κρασάρει
        if (file.name.toLowerCase().match(/\.(heic|heif)$/)) return resolve(file);

        // 🛡️ ΑΣΦΑΛΕΙΑ 2: Ακύρωση ανεβάσματος αντί για τεράστιο αρχείο σε παλιές συσκευές
        if (typeof window.createImageBitmap !== "function") return reject(new Error('old_device'));

        window.createImageBitmap(file).then(img => {
            const canvas = document.createElement("canvas");
            const MAX_DIM = 1200; // Μικραίνει τις τεράστιες εικόνες
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
            
            ctx.fillStyle = "#ffffff"; // Λευκό φόντο για προστασία διάφανων PNG
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
          // 🛡️ ΠΡΟΣΤΑΣΙΑ ΜΝΗΜΗΣ 2: Αν "σκάσει" το canvas, ΔΕΝ στέλνουμε το τεράστιο αρχείο!
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
            return;
        }

       // 🧠 ΠΡΟΣΤΑΣΙΑ ΜΝΗΜΗΣ 1: Χρήση URL Object αντί για βαρύ Base64 string
        const img = document.getElementById('p-img-preview');
        
        // Απελευθέρωση μνήμης αν υπήρχε ήδη προηγούμενη εικόνα φορτωμένη
        if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        
       img.src = URL.createObjectURL(selectedFile);
        img.style.display = 'block';
    } else {
        // 🧹 Αν πατήσει "Άκυρο", πρέπει να εξαφανίσουμε την εικόνα από την οθόνη!
        if (img && img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        if (img) {
            img.src = '';
            img.style.display = 'none';
        }
    }
}

function initParentForm() {
    // ΕΞΥΠΝΗ ΑΝΑΜΟΝΗ: Περιμένει με ασφάλεια να φορτώσει η Firebase από το <head> του Blogger
    if (typeof firebase === 'undefined' || !firebase.database) {
        setTimeout(initParentForm, 100);
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
    if (isSubmitting) return; // Αποτροπή διπλού κλικ

    // 📱 UX 2: Μικρή δόνηση (Haptic Feedback) στα κινητά κατά το πάτημα
    const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
    if (isMobile && navigator.vibrate) navigator.vibrate(50);

    const rawAuthor = document.getElementById('p-author').value.trim();
    const rawTitle = document.getElementById('p-title').value.trim();
    const rawContent = document.getElementById('p-content').value.trim();
    const btn = document.getElementById('p-submit-btn');

  if (!rawAuthor || !rawTitle || !rawContent) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Ελλιπή στοιχεία', text: 'Όνομα, Τίτλος και Κείμενο είναι υποχρεωτικά!' });
        else alert('Όνομα, Τίτλος και Κείμενο είναι υποχρεωτικά!');
        return;
    }

    // 📡 ΣΥΜΒΑΤΟΤΗΤΑ 1: Ακαριαίος έλεγχος Internet
    if (!navigator.onLine) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Εκτός Σύνδεσης', text: 'Δεν έχετε πρόσβαση στο internet αυτή τη στιγμή.' });
        else alert('Εκτός Σύνδεσης! Ελέγξτε το δίκτυό σας.');
        return;
    }

    if (!window.dbAnartiseis) {
        alert("Παρακαλώ περιμένετε 1 δευτερόλεπτο να φορτώσει η σελίδα και δοκιμάστε ξανά.");
        return;
    }

  // ⏱️ ΑΝΑΒΑΘΜΙΣΜΕΝΟ RATE LIMITING (2/ημέρα με Αντίστροφη Μέτρηση)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let postTimestamps = [];
    
    try {
        let stored = JSON.parse(localStorage.getItem('parent_posts_timestamps') || '[]');
        if (!Array.isArray(stored)) stored = [];
        // Κρατάμε μόνο όσες αναρτήσεις έγιναν τις τελευταίες 24 ώρες
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
        return; // Ακυρώνει την αποστολή!
    }

    // --- XSS ESCAPE (Καθαρισμός) ---
    const author = window.escapeHTML(rawAuthor);
    const title = window.escapeHTML(rawTitle);
    const content = window.escapeHTML(rawContent);

  isSubmitting = true;
    btn.disabled = true;
    btn.innerHTML = "Επεξεργασία... ⏳";
    
   // 🔒 Ολικό Κλείδωμα Input (Αποτρέπουμε την αλλαγή κειμένων την ώρα που ανεβαίνει η φωτογραφία)
    document.getElementById('p-image').disabled = true;
    document.getElementById('p-author').readOnly = true;
    document.getElementById('p-title').readOnly = true;
    document.getElementById('p-content').readOnly = true;
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.7";

    let imageUrl = null;

  try {
        // Κλείδωμα ESC στο SweetAlert (allowEscapeKey: false)
        if (selectedFile) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Επεξεργασία & Ανέβασμα...', allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
                
                // ⏳ UX 1: Καθησυχασμός χρήστη αν αργεί η σύνδεση
                setTimeout(() => {
                    if (isSubmitting) Swal.update({ title: 'Αργό Ίντερνετ ⏳', html: 'Το αρχείο είναι μεγάλο ή η σύνδεση σας καθυστερεί...' });
                }, 8000); 
            }
            
            // Συμπίεση Εικόνας
            const compressedBlob = await compressImageLocally(selectedFile);
            
            const formData = new FormData();
            formData.append("file", compressedBlob, "post_image.jpg");
            formData.append("upload_preset", "anartisis"); 

            const CLOUD_NAME = "h5dkbv63"; 
            
            // AbortController: Ακύρωση αν κολλήσει το ίντερνετ πάνω από 45 δευτερόλεπτα
            const uploadAbort = new AbortController();
            const uploadTimeout = setTimeout(() => uploadAbort.abort(), 45000);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST", body: formData, signal: uploadAbort.signal
            });
            clearTimeout(uploadTimeout);
            const cloudData = await cloudRes.json();
            
         if (cloudData.secure_url) {
                // 🚀 BΕΛΤΙΣΤΟΠΟΙΗΣΗ CLOUDINARY: Εφαρμόζουμε webp, q_auto και το όριο 1600px κατευθείαν στο URL!
                imageUrl = cloudData.secure_url.replace('/upload/', '/upload/c_limit,w_1600,f_auto,q_auto/');
            } else if (cloudData.error) {
                throw new Error(cloudData.error.message);
            }
        } else {
             if (typeof Swal !== 'undefined') Swal.fire({ title: 'Αποστολή...', allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
        }

       const newPostRef = window.dbAnartiseis.ref("parent_posts").push();
        
        // ⚡ UX: Αφαιρούμε το await. Κάνουμε background αποθήκευση!
        const firebasePushPromise = newPostRef.set({
            author: author,
            title: title,
            content: content,
            status: "pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            ...(imageUrl && { imageUrl: imageUrl })
        });

       let isUploadSlow = false;
        let slowUploadTimer = setTimeout(() => {
            isUploadSlow = true;
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'info', title: 'Αργό Ίντερνετ ⏳', text: 'Παρακαλώ περιμένετε να ολοκληρωθεί η αποθήκευση...', showConfirmButton: false });
        }, 10000); // 10 δευτερόλεπτα ανοχή

        // 🔒 ΠΡΟΣΤΑΣΙΑ ΔΕΔΟΜΕΝΩΝ: Πρέπει να ΜΠΕΙ await! Διαφορετικά, αν ο χρήστης κλείσει την καρτέλα, η ανάρτηση χάνεται!
        await newPostRef.set({
            author: author,
            title: title,
            content: content,
            status: "pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            ...(imageUrl && { imageUrl: imageUrl })
        });
        
        clearTimeout(slowUploadTimer); // Καθαρίζει το χρονόμετρο μόνο όταν πραγματικά σωθεί η ανάρτηση!

        // 🛡️ ΔΙΟΡΘΩΣΗ BUG: Χρησιμοποιούμε τον σωστό πίνακα 'postTimestamps' (που ορίσαμε στην αρχή της συνάρτησης)
        postTimestamps.push(Date.now());
        try { localStorage.setItem('parent_posts_timestamps', JSON.stringify(postTimestamps)); } catch(e) {}

        // --- ΕΙΔΟΠΟΙΗΣΗ EMAIL (Web3Forms) ---
        // --- ΕΙΔΟΠΟΙΗΣΗ EMAIL (Web3Forms) ΜΕ ANTI-SPAM ---
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
                  // 🛠️ Στο email χρησιμοποιούμε τις αρχικές "raw" μεταβλητές που δεν περιέχουν HTML κώδικα!
                    message: `Ο χρήστης "${rawAuthor}" μόλις έστειλε μια νέα ανάρτηση!\n\nΤίτλος: ${rawTitle}\nΚείμενο: ${rawContent}\n\nΕικόνα: ${imageUrl ? imageUrl : "Χωρίς φωτογραφία"}\n\nΜπες στο διαχειριστικό για έγκριση!`,
                    botcheck: false
                })
          }).catch(error => console.log("Το email ειδοποίησης απέτυχε:", error));
        } else {
            console.warn("Anti-Spam: Αποτράπηκε αποστολή υπερβολικών emails.");
        }

        // --- ΝΕΟ: ΕΠΙΤΥΧΙΑ & ΚΑΘΑΡΙΣΜΟΣ ΦΟΡΜΑΣ ---
        
      // 1. Μήνυμα Επιτυχίας (Προσαρμοσμένο βάσει της εικόνας αναμνήσεων)
        if (typeof Swal !== 'undefined') {
            Swal.fire({ 
                icon: 'success', 
                title: 'Η ανάρτηση στάλθηκε! 📸', 
                text: 'Το κείμενο και η φωτογραφία στάλθηκαν. Σε λίγα λεπτά θα εμφανιστούν!', 
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2ecc71', // Το πράσινο χρώμα της εικόνας σου
                allowOutsideClick: false
            });
        } else {
            alert('Η ανάρτηση στάλθηκε για έγκριση!');
        }

        // 2. Άδειασμα των πεδίων
        document.getElementById('p-author').value = '';
        document.getElementById('p-title').value = '';
        document.getElementById('p-content').value = '';
        document.getElementById('p-image').value = '';
        selectedFile = null;

        // 3. Επαναφορά προεπισκόπησης εικόνας
        const imgPrev = document.getElementById('p-img-preview');
        if (imgPrev && imgPrev.src && imgPrev.src.startsWith('blob:')) {
            URL.revokeObjectURL(imgPrev.src);
            imgPrev.src = '';
            imgPrev.style.display = 'none';
        }

        // 4. Ξεκλείδωμα input και κουμπιού
        document.getElementById('p-image').disabled = false;
        document.getElementById('p-author').readOnly = false;
        document.getElementById('p-title').readOnly = false;
        document.getElementById('p-content').readOnly = false;
        
        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
        isSubmitting = false;

        // 5. Επαναφορά των μετρητών χαρακτήρων 
        ['p-author', 'p-title', 'p-content'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.dispatchEvent(new Event('input')); 
        });

} catch (error) {
        console.error(error);
        let errorMsg = 'Υπήρξε πρόβλημα κατά την αποστολή. Δοκιμάστε ξανά.';
        
        // Στοχευμένα μηνύματα (Από το Άλμπουμ)
        if (error.name === 'AbortError') errorMsg = 'Αργή σύνδεση! Το ανέβασμα ακυρώθηκε.';
        if (error.message === 'old_device') errorMsg = 'Η συσκευή σας είναι πολύ παλιά για επεξεργασία εικόνας.';
        if (error.message === 'memory_fail') errorMsg = 'Η εικόνα είναι πολύ βαριά και η συσκευή ξέμεινε από μνήμη.';

        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Σφάλμα', text: errorMsg });
        else alert(errorMsg);
        
        isSubmitting = false;
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
        
    
  }

initParentForm();
// --- ΜΗΧΑΝΙΣΜΟΣ DRAG & DROP ---
const initPostDragAndDrop = () => {
    // 🛡️ ΑΣΦΑΛΕΙΑ 1: Μπλοκάρισμα πλοήγησης σε ΟΛΗ τη σελίδα αν ο χρήστης "αστοχήσει"
    window.addEventListener('dragover', e => e.preventDefault(), false);
    window.addEventListener('drop', e => e.preventDefault(), false);

    const dropZone = document.getElementById('p-drop-zone');
    const fileInput = document.getElementById('p-image');
    if (!dropZone || !fileInput) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });

   // 🎨 UX: Ο μηχανισμός dragCounter από το Άλμπουμ που σταματάει το Flicker
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
        if (isSubmitting) return; // 🔒 Μπλοκάρισμα Drop αν έχει ήδη ξεκινήσει το ανέβασμα!
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const isImage = file.type.startsWith('image/');
        const isHeicOrWebp = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);
        
        if (!isImage && !isHeicOrWebp) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Ρίξτε μόνο εικόνες (jpg, png, webp, heic).' });
            return;
        }

        // Αυτόματη μεταφορά της εικόνας στο input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        previewParentImage({ target: fileInput });
    });
};

// --- ΝΕΟ: ΟΡΙΑ ΧΑΡΑΚΤΗΡΩΝ ΚΑΙ ΑΝΤΙΣΤΡΟΦΗ ΜΕΤΡΗΣΗ ---
const initCharCounters = () => {
    // Ορίζουμε πόσους χαρακτήρες επιτρέπουμε σε κάθε πεδίο
    const limits = { 'p-author': 40, 'p-title': 100, 'p-content': 1500 };
    
    for (const [id, max] of Object.entries(limits)) {
        const el = document.getElementById(id);
        if (!el) continue;
        
        el.setAttribute('maxlength', max); // Κλειδώνει την πληκτρολόγηση αυτόματα
        
        // Δημιουργία του μετρητή γραφικά
        const counter = document.createElement('div');
        counter.style.cssText = "text-align: right; font-size: 11px; color: #7f8c8d; margin-top: 4px; font-weight: bold;";
        counter.innerText = `${max} χαρακτήρες έμειναν`;
        el.parentNode.insertBefore(counter, el.nextSibling); // Το βάζει κάτω από το πεδίο
        
        // Ενημέρωση καθώς πληκτρολογεί
      // Ενημέρωση καθώς πληκτρολογεί
        el.addEventListener('input', () => {
            const remain = max - el.value.length;
            counter.innerText = `${remain} χαρακτήρες έμειναν`;
            // Αν πλησιάζει στο τέλος (κάτω από 10%), το κάνουμε κόκκινο!
            counter.style.color = remain <= (max * 0.1) ? '#e74c3c' : '#7f8c8d';
        });
        
        // 🔄 Εκβιάζουμε έναν αρχικό υπολογισμό, ώστε να διαβάσει αμέσως 
        // τυχόν κείμενα που έχουν μπει αυτόματα από Autofill ή από το κουμπί Back!
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
