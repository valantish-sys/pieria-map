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
    return new Promise((resolve, reject) => { // ⚠️ Προσθήκη reject
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
            
            canvas.toBlob(blob => { resolve(blob || file); }, "image/jpeg", 0.85); // 85% Ποιότητα JPG
        }).catch(() => resolve(file));
    });
};

function previewParentImage(event) {
    selectedFile = event.target.files[0];
    if (selectedFile) {
        // Έλεγχος ότι είναι εικόνα (jpg, png κλπ)
        if (!selectedFile.type.startsWith('image/')) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Παρακαλώ επιλέξτε μόνο εικόνες.' });
            else alert("Παρακαλώ επιλέξτε μόνο εικόνες.");
            document.getElementById('p-image').value = '';
            selectedFile = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('p-img-preview');
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(selectedFile);
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

    // --- RATE LIMITING (Anti-Spam 3/ημέρα) ---
    const spamKey = 'parent_posts_count';
    const today = new Date().toDateString();
    let userPosts = { date: today, count: 0 };
    try {
        let stored = localStorage.getItem(spamKey);
        if (stored) {
            let parsed = JSON.parse(stored);
            if (parsed.date === today) userPosts.count = parsed.count;
        }
    } catch(e) {}

    if (userPosts.count >= 3) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Όριο Ημέρας', text: 'Έχετε στείλει ήδη 3 αναρτήσεις σήμερα. Δοκιμάστε ξανά αύριο!' });
        else alert('Έχετε στείλει ήδη 3 αναρτήσεις σήμερα.');
        return;
    }

    // --- XSS ESCAPE (Καθαρισμός) ---
    const author = window.escapeHTML(rawAuthor);
    const title = window.escapeHTML(rawTitle);
    const content = window.escapeHTML(rawContent);

    isSubmitting = true;
    btn.disabled = true;
    btn.innerHTML = "Επεξεργασία... ⏳";

    let imageUrl = null;

  try {
        // Κλείδωμα ESC στο SweetAlert (allowEscapeKey: false)
        if (selectedFile) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Επεξεργασία & Ανέβασμα...', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
                
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
                imageUrl = cloudData.secure_url;
            } else if (cloudData.error) {
                throw new Error(cloudData.error.message);
            }
        } else {
             if (typeof Swal !== 'undefined') Swal.fire({ title: 'Αποστολή...', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
        }

        const newPostRef = window.dbAnartiseis.ref("parent_posts").push();
        await newPostRef.set({
            author: author,
            title: title,
            content: content,
            status: "pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            ...(imageUrl && { imageUrl: imageUrl })
        });

        // Ανανέωση Rate Limit τοπικά
        userPosts.count++;
        try { localStorage.setItem(spamKey, JSON.stringify(userPosts)); } catch(e) {}

        // --- ΕΙΔΟΠΟΙΗΣΗ EMAIL (Web3Forms) ---
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
                message: `Ο χρήστης "${author}" μόλις έστειλε μια νέα ανάρτηση!\n\nΤίτλος: ${title}\nΚείμενο: ${content}\n\nΕικόνα: ${imageUrl ? imageUrl : "Χωρίς φωτογραφία"}\n\nΜπες στο διαχειριστικό για έγκριση!`,
                botcheck: false
            })
        }).catch(error => console.log("Το email ειδοποίησης απέτυχε:", error));

        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'success', title: 'Εστάλη!', text: 'Η ανάρτησή σας στάλθηκε και αναμένει έγκριση.' }).then(() => {
                window.location.reload(); 
            });
        } else {
            alert("Εστάλη επιτυχώς!");
            window.location.reload();
        }

  } catch (error) {
        console.error(error);
        let errorMsg = 'Υπήρξε πρόβλημα κατά την αποστολή. Δοκιμάστε ξανά.';
        if (error.name === 'AbortError') errorMsg = 'Αργή σύνδεση! Το ανέβασμα ακυρώθηκε.';
        
        // 🛡️ Διαχείριση του νέου σφάλματος για παλιές συσκευές
        if (error.message === 'old_device') errorMsg = 'Η συσκευή ή ο περιηγητής σας είναι πολύ παλιός. Αδυναμία συμπίεσης εικόνας.';

        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Σφάλμα', text: errorMsg });
        else alert(errorMsg);
        
      isSubmitting = false;
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
        
        // 🧹 ΑΣΦΑΛΕΙΑ 3: Καθαρισμός του input αν αποτύχει η αποστολή
        document.getElementById('p-image').value = '';
        selectedFile = null;
    }
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

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.background = 'rgba(30, 108, 255, 0.1)';
            dropZone.style.borderColor = '#2ecc71';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.background = 'rgba(255,255,255,0.5)';
            dropZone.style.borderColor = '#1e6cff';
        });
    });

    dropZone.addEventListener('drop', e => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Παρακαλώ επιλέξτε μόνο εικόνες.' });
            return;
        }

        // Αυτόματη μεταφορά της εικόνας στο input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        previewParentImage({ target: fileInput });
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPostDragAndDrop);
} else {
    initPostDragAndDrop();
}
