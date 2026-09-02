(() => {
  "use strict";

let selectedFile = null;
let isSubmitting = false; 
let currentRotation = 0; 
let activeYouTubeId = null;

// Ασφαλής εγγραφή (Escape HTML)
// Ασφαλής εγγραφή και απόδοση βασικού Markdown (Bold, Italic, Bullets)
window.escapeHTML = (str) => {
  if (!str) return "";
  let escaped = String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
  
  // Επαναφορά των ετικετών μορφοποίησης που δημιουργούν τα κουμπιά του κειμενογράφου
  escaped = escaped.replace(/&lt;(\/?)(b|i|u|strong|em|ul|li|div|br)(\s*\/?)&gt;/gi, '<$1$2$3>');

  // Μετατροπή Markdown syntax σε ασφαλές HTML
  escaped = escaped
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• (.*$)/gim, '<li>$1</li>');

  return escaped.replace(/\n/g, '<br>'); 
};

// Απευθείας οπτική μορφοποίηση (Πραγματικό Bold/Italic/Bullets)
window.applyTextFormat = (type) => {
  document.getElementById('p-content').focus();
  
  if (type === 'bold') {
    document.execCommand('bold', false, null);
  } else if (type === 'italic') {
    document.execCommand('italic', false, null);
  } else if (type === 'bullet') {
    document.execCommand('insertUnorderedList', false, null);
  }
  
  // Trigger για να πιάσει την αλλαγή το Auto-save
  document.getElementById('p-content').dispatchEvent(new Event('input'));
};

// Εισαγωγή Emojis
window.insertTextAtCursor = (text) => {
  document.getElementById('p-content').focus();
  document.execCommand('insertText', false, text);
  document.getElementById('p-content').dispatchEvent(new Event('input'));
};


// --- ΛΕΙΤΟΥΡΓΙΑ 1: Αυτόματη Αποθήκευση στο παρασκήνιο (Auto-save) ---
window.saveDraft = () => {
    if(isSubmitting) return;
    const draft = {
        author: document.getElementById('p-author').value,
        title: document.getElementById('p-title').value,
        content: document.getElementById('p-content').innerHTML,
        yt: document.getElementById('p-youtube').value
    };
    localStorage.setItem('post_draft', JSON.stringify(draft));
};

const loadDraft = () => {
    try {
        const draft = JSON.parse(localStorage.getItem('post_draft'));
        if (draft) {
            if(draft.author) document.getElementById('p-author').value = draft.author;
            if(draft.title) document.getElementById('p-title').value= draft.title;
            if(draft.content) document.getElementById('p-content').innerHTML = draft.content;
            if(draft.yt) {
                document.getElementById('p-youtube').value = draft.yt;
                window.handleYouTubeInput();
            }
            // Trigger στα πεδία για να υπολογιστούν οι μετρητές χαρακτήρων
            ['p-author', 'p-title', 'p-content'].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.dispatchEvent(new Event('input'));
            });
        }
    } catch(e) {}
};

// --- ΛΕΙΤΟΥΡΓΙΑ 2: Φωνητική Υπαγόρευση ---
let recognition = null;
let isRecording = false;

window.toggleDictation = () => {
    const micBtn = document.getElementById('p-mic-btn');
    const micText = document.getElementById('p-mic-text');
    if (!recognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if(typeof Swal !== 'undefined') Swal.fire('Λυπούμαστε', 'Ο browser σας δεν υποστηρίζει φωνητική υπαγόρευση. Δοκιμάστε Google Chrome.', 'info');
            else alert("Ο browser σας δεν υποστηρίζει φωνητική υπαγόρευση.");
            return;
        }
        recognition = new SpeechRecognition();
        recognition.lang = 'el-GR'; // Γλώσσα Ελληνικά
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            micBtn.style.color = '#e74c3c';
            micText.innerText = "Ακούει...";
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
            }
            if (finalTranscript) {
                const el = document.getElementById('p-content');
                el.value += finalTranscript;
                el.dispatchEvent(new Event('input')); // Για να δουλέψει και το Auto-save
            }
        };

        recognition.onerror = (e) => stopDictation();
        recognition.onend = () => {
            if (isRecording) { try { recognition.start(); } catch(e) { stopDictation(); } } 
            else { stopDictation(); }
        };
    }

    if (isRecording) {
        isRecording = false;
        recognition.stop();
    } else {
        try { recognition.start(); } catch(e){}
    }

    function stopDictation() {
        isRecording = false;
        micBtn.style.color = '#7f8c8d';
        micText.innerText = "Υπαγόρευση";
    }
};

// --- ΛΕΙΤΟΥΡΓΙΑ 3: Διαχείριση YouTube & Εξώφυλλο (Thumbnail) ---
window.handleYouTubeInput = () => {
    const url = document.getElementById('p-youtube').value;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    
    const imgPrev = document.getElementById('p-img-preview');
    const removeBtn = document.getElementById('p-remove-img-btn');
    const rotateBtn = document.getElementById('p-rotate-img-btn');
    const dropLabel = document.getElementById('p-drop-label');
    
    if (match && match[1]) {
        activeYouTubeId = match[1];
        
        // Καθαρίζουμε τυχόν επιλεγμένη φωτογραφία
        document.getElementById('p-image').value = '';
        selectedFile = null;
        currentRotation = 0;
        
        imgPrev.src = `https://img.youtube.com/vi/${activeYouTubeId}/hqdefault.jpg`;
        imgPrev.style.display = 'block';
        imgPrev.style.transform = `rotate(0deg)`; 
        
        removeBtn.style.display = 'block';
        rotateBtn.style.display = 'none'; 
        dropLabel.value = '🎥 Επιλέχθηκε Βίντεο';
        document.getElementById('p-drop-zone').style.opacity = '0.7';
    } else {
        activeYouTubeId = null;
        if (!selectedFile) {
            imgPrev.style.display = 'none';
            removeBtn.style.display = 'none';
            rotateBtn.style.display = 'none';
        }
        dropLabel.value = '📸 Επιλογή Φωτογραφίας <span class="quantum-desktop-txt">(ή σύρετε το αρχείο εδώ)</span>';
        document.getElementById('p-drop-zone').style.opacity = '1';
    }
    window.saveDraft();
};

// --- ΛΕΙΤΟΥΡΓΙΑ 4: Οπτική Περιστροφή Εικόνας ---
window.rotatePreviewImage = (e) => {
    e.stopPropagation();
    currentRotation = (currentRotation + 90) % 360;
    document.getElementById('p-img-preview').style.transform = `rotate(${currentRotation}deg)`;
};

window.removePreviewData = (event) => {
    if(event) event.stopPropagation();
    document.getElementById('p-image').value = '';
    document.getElementById('p-youtube').value= ''; 
    selectedFile = null;
    activeYouTubeId = null;
    currentRotation = 0;
    
    const imgPrev = document.getElementById('p-img-preview');
    if (imgPrev && imgPrev.src && imgPrev.src.startsWith('blob:')) URL.revokeObjectURL(imgPrev.src);
    if (imgPrev) {
        imgPrev.src = '';
        imgPrev.style.display = 'none';
        imgPrev.style.transform = `rotate(0deg)`;
    }
    
    document.getElementById('p-remove-img-btn').style.display = 'none';
    document.getElementById('p-rotate-img-btn').style.display = 'none';
    document.getElementById('p-drop-label').value = '📸 Επιλογή Φωτογραφίας <span class="quantum-desktop-txt">(ή σύρετε το αρχείο εδώ)</span>';
    document.getElementById('p-drop-zone').style.opacity = '1';
    
    window.saveDraft();
};

window.previewParentImage = (event) => {
    selectedFile = event.target.files[0];
    
    document.getElementById('p-youtube').value = '';
    activeYouTubeId = null;
    currentRotation = 0;
    
    const img = document.getElementById('p-img-preview');
    img.style.transform = `rotate(0deg)`;
    
    if (selectedFile) {
        const isImage = selectedFile.type.startsWith('image/');
        const isHeicOrWebp = selectedFile.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);
        
        if (!isImage && !isHeicOrWebp) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Επιτρέπονται μόνο εικόνες (jpg, png, webp, heic).' });
            else alert("Επιτρέπονται μόνο εικόνες.");
            window.removePreviewData();
            return;
        }

        if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        img.src = URL.createObjectURL(selectedFile);
        img.style.display = 'block';
        
        document.getElementById('p-remove-img-btn').style.display = 'block';
        document.getElementById('p-rotate-img-btn').style.display = 'block'; 
        document.getElementById('p-drop-label').value = '📸 Επιλέχθηκε Φωτογραφία';
        window.saveDraft();
    } else {
        window.removePreviewData();
    }
};

window.clearAllData = () => {
    if(confirm('Θέλετε να καθαρίσετε όλα τα πεδία και το προσχέδιο;')) {
        document.getElementById('p-title').value=''; 
        document.getElementById('p-content').innerHTML''; 
        document.getElementById('p-author').value=''; 
        window.removePreviewData();
        
        ['p-author', 'p-title', 'p-content', 'p-youtube'].forEach(id => { 
            let el=document.getElementById(id); 
            if(el) el.dispatchEvent(new Event('input')); 
        }); 
        
        localStorage.removeItem('post_draft');
    }
};

// --- ΛΕΙΤΟΥΡΓΙΑ 5: Ζωντανή Προεπισκόπηση ---
window.showLivePreview = () => {
   document.getElementById('modal-author').innerText = document.getElementById('p-author').value.trim() || 'Ανώνυμος';
document.getElementById('modal-title').innerText = document.getElementById('p-title').value.trim() || '[Χωρίς Τίτλο]';
  const rawText = document.getElementById('p-content').innerHTML.trim();
document.getElementById('modal-content').value = rawText ? window.escapeHTML(rawText) : '[Κενό Κείμενο]';
    
    const mediaContainer = document.getElementById('modal-media-container');
    const modalImg = document.getElementById('modal-img');
    const ytIcon = document.getElementById('modal-yt-icon');
    const previewImg = document.getElementById('p-img-preview');
    
    if (previewImg.src && previewImg.style.display !== 'none') {
        mediaContainer.style.display = 'block';
        modalImg.src = previewImg.src;
        modalImg.style.transform = `rotate(${currentRotation}deg)`; // Δείχνει σωστά την περιστροφή
        
        if (activeYouTubeId) ytIcon.style.display = 'block';
        else ytIcon.style.display = 'none';
    } else {
        mediaContainer.style.display = 'none';
        modalImg.src = '';
    }
    
    document.getElementById('p-preview-modal').style.display = 'flex';
};

// Η Πραγματική Περιστροφή εφαρμόζεται πριν το ανέβασμα στον Καμβά (Canvas)
const compressImageLocally = async (file, rotation = 0) => {
    return new Promise((resolve, reject) => { 
        if (file.name.toLowerCase().match(/\.(heic|heif)$/) && rotation === 0) return resolve(file);
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
            
            // Αντιστροφή πλάτους / ύψους αν έχει γυρίσει κάθετα
            if (rotation === 90 || rotation === 270) {
                canvas.width = height; 
                canvas.height = width;
            } else {
                canvas.width = width; 
                canvas.height = height;
            }
            
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = "#ffffff"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            
            if (typeof img.close === 'function') img.close(); 
     
            canvas.toBlob(blob => {
                if (!blob) return reject(new Error('memory_fail'));
                resolve(blob); 
            }, "image/jpeg", 0.85); 
        }).catch(() => reject(new Error('old_device')));
    });
};

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
    try { anartiseisApp = firebase.app("AnartiseisApp"); } catch (e) { anartiseisApp = firebase.initializeApp(anartiseisConfig, "AnartiseisApp"); }
    window.dbAnartiseis = anartiseisApp.database();
}

window.submitParentPost = async () => {
    if (isSubmitting) return; 
    
    // Σταματάμε το μικρόφωνο αν τρέχει
    if (isRecording) document.getElementById('p-mic-btn').click(); 

    const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
    if (isMobile && navigator.vibrate) navigator.vibrate(50);

  const rawAuthor = document.getElementById('p-author').value.trim();
const rawTitle = document.getElementById('p-title').value.trim();
    const rawContent = document.getElementById('p-content').innerHTML.trim();
    const btn = document.getElementById('p-submit-btn');

    if (!rawTitle || !rawContent) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Ελλιπή στοιχεία', text: 'Ο Τίτλος και το Κείμενο είναι υποχρεωτικά!' });
        else alert('Ο Τίτλος και το Κείμενο είναι υποχρεωτικά!');
        return;
    }

    if (!navigator.onLine) return alert('Εκτός Σύνδεσης! Ελέγξτε το δίκτυό σας.');
    if (!window.dbAnartiseis) return alert("Παρακαλώ περιμένετε 1 δευτερόλεπτο...");

    const ONE_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let postTimestamps = [];
    try {
        let stored = JSON.parse(localStorage.getItem('parent_posts_timestamps') || '[]');
        postTimestamps = stored.filter(time => now - time < ONE_DAY);
        localStorage.setItem('parent_posts_timestamps', JSON.stringify(postTimestamps));
    } catch(e) { }

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
    btn.value = "Επεξεργασία... ⏳";
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.7";

    // ΠΡΟΣΘΗΚΗ: Κλείδωμα Πεδίων
    document.getElementById('p-image').disabled = true;
    document.getElementById('p-author').readOnly = true;
    document.getElementById('p-title').readOnly = true;
  document.getElementById('p-content').setAttribute('contenteditable', 'false');
    if (document.getElementById('p-youtube')) document.getElementById('p-youtube').readOnly = true;

    let imageUrl = null;
    let slowUploadTimer; // ΠΡΟΣΘΗΚΗ: Το χρειαζόμαστε για τα μηνύματα αργού ίντερνετ

    try {
      if (selectedFile) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Επεξεργασία & Ανέβασμα...', allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
                
                // ΠΡΟΣΘΗΚΗ: Μήνυμα στα 8 δευτερόλεπτα αν αργεί
                setTimeout(() => {
                    if (isSubmitting) Swal.update({ title: 'Αργό Ίντερνετ ⏳', html: 'Το αρχείο είναι μεγάλο ή η σύνδεση σας καθυστερεί...' });
                }, 8000); 
            }
            
            const compressedBlob = await compressImageLocally(selectedFile, currentRotation);
            
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
            } else throw new Error(cloudData.error.message);
        } else {
             if (typeof Swal !== 'undefined') Swal.fire({ title: 'Αποστολή...', allowOutsideClick: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
        }

        const newPostRef = window.dbAnartiseis.ref("parent_posts").push();
        
        const postData = {
            author: author,
            title: title,
            content: content,
            status: "pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        if (imageUrl) postData.imageUrl = imageUrl;
        if (activeYouTubeId) postData.youtubeUrl = `https://www.youtube.com/watch?v=${activeYouTubeId}`;

       const firebasePushPromise = newPostRef.set(postData);

        // ΠΡΟΣΘΗΚΗ: Timer στα 10 δευτερόλεπτα αν αργεί η βάση
        let isUploadSlow = false;
        slowUploadTimer = setTimeout(() => { 
            isUploadSlow = true;
            if (typeof Swal !== 'undefined') Swal.fire({ 
                icon: 'info', title: 'Αργό Ίντερνετ ⏳', text: 'Παρακαλώ περιμένετε να ολοκληρωθεί η αποθήκευση...', 
                showConfirmButton: false, allowOutsideClick: false, allowEscapeKey: false
            });
        }, 10000);

        let fbTimer;
        const firebaseTimeout = new Promise((_, reject) => { fbTimer = setTimeout(() => reject(new Error('firebase_timeout')), 15000); });
        await Promise.race([firebasePushPromise, firebaseTimeout]);
        clearTimeout(fbTimer); 
        clearTimeout(slowUploadTimer); // Καθαρισμός του timer αν πετύχει
        
        postTimestamps.push(Date.now());
        try { localStorage.setItem('parent_posts_timestamps', JSON.stringify(postTimestamps)); } catch(e) {}

        const emailKey = 'web3forms_post_emails_sent';
        const todayStr = new Date().toDateString();
        let emailData = { date: todayStr, count: 0 };
        try {
            let storedEmail = JSON.parse(localStorage.getItem(emailKey));
            if (storedEmail && storedEmail.date === todayStr) emailData.count = storedEmail.count;
        } catch (e) {}
        
       if (emailData.count < 3) {
            emailData.count++;
            localStorage.setItem(emailKey, JSON.stringify(emailData));
            
            let mediaText = imageUrl ? imageUrl : (activeYouTubeId ? `https://www.youtube.com/watch?v=${activeYouTubeId}` : "Χωρίς πολυμέσα");
            
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
                    message: `Ο χρήστης "${rawAuthor}" έστειλε μια νέα ανάρτηση!\n\nΤίτλος: ${rawTitle}\nΚείμενο: ${rawContent}\n\nΠολυμέσα: ${mediaText}`,
                    botcheck: false
                })
            }).catch(error => console.log("Το email ειδοποίησης απέτυχε:", error));
        } else {
            console.warn("Anti-Spam: Αποτράπηκε αποστολή υπερβολικών emails.");
        }

        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Η ανάρτηση στάλθηκε! 📸', text: 'Σε λίγα λεπτά θα εμφανιστεί!', confirmButtonColor: '#2ecc71' });
        else alert('Η ανάρτηση στάλθηκε για έγκριση!');

        // Καθαρισμός όλων (αφαιρεί και το προσχέδιο)
        document.getElementById('p-title').value=''; 
        document.getElementById('p-content').innerHTML=''; 
        document.getElementById('p-author').value=''; 
        window.removePreviewData();
        
        ['p-author', 'p-title', 'p-content', 'p-youtube'].forEach(id => { 
            let el=document.getElementById(id); 
            if(el) el.dispatchEvent(new Event('input')); 
        }); 
       localStorage.removeItem('post_draft');
        
        // --- ΕΔΩ ΜΠΑΙΝΟΥΝ: Ξεκλείδωμα πεδίων μετά από Επιτυχία ---
        document.getElementById('p-image').disabled = false;
        document.getElementById('p-author').readOnly = false;
        document.getElementById('p-title').readOnly = false;
      document.getElementById('p-content').setAttribute('contenteditable', 'true');
        if (document.getElementById('p-youtube')) document.getElementById('p-youtube').readOnly = false;

        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
        isSubmitting = false;

    } catch (error) {
        if (typeof slowUploadTimer !== 'undefined') clearTimeout(slowUploadTimer); // Καθάρισμα του χρονομέτρου
        console.error(error);
        
        // ΠΡΟΣΘΗΚΗ: Αναλυτικά σφάλματα
        let errorMsg = 'Υπήρξε πρόβλημα κατά την αποστολή. Δοκιμάστε ξανά.';
        if (error.name === 'AbortError') errorMsg = 'Αργή σύνδεση! Το ανέβασμα ακυρώθηκε.';
        if (error.message === 'old_device') errorMsg = 'Η συσκευή σας είναι πολύ παλιά για επεξεργασία εικόνας.';
        if (error.message === 'memory_fail') errorMsg = 'Η εικόνα είναι πολύ βαριά και η συσκευή ξέμεινε από μνήμη.';
        if (error.message === 'firebase_timeout') errorMsg = 'Αποτυχία σύνδεσης με τη βάση (πιθανό μπλοκάρισμα δικτύου). Δοκιμάστε ξανά!';

        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Σφάλμα', text: errorMsg });
        else alert(errorMsg);
        
        // ΠΡΟΣΘΗΚΗ: Ξεκλείδωμα των πεδίων μετά από σφάλμα
        document.getElementById('p-image').disabled = false;
        document.getElementById('p-author').readOnly = false;
        document.getElementById('p-title').readOnly = false;
document.getElementById('p-content').setAttribute('contenteditable', 'true');
        if (document.getElementById('p-youtube')) document.getElementById('p-youtube').readOnly = false;

        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
        isSubmitting = false;
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
    }
}

initParentForm();

// Drag & Drop
const initPostDragAndDrop = () => {
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
                pDragCounter = 0; 
                dropZone.style.background = 'rgba(255,255,255,0.5)';
                dropZone.style.borderColor = '#1e6cff';
            }
        });
    });

    dropZone.addEventListener('drop', e => {
        if (isSubmitting || document.getElementById('p-youtube').value) return; 
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isHeicOrWebp = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);
        
        if (!isImage && !isHeicOrWebp) {
            if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Λάθος Αρχείο', text: 'Μόνο εικόνες επιτρέπονται.' });
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        window.previewParentImage({ target: fileInput });
    });
};

// Μετρητές Χαρακτήρων
const initCharCounters = () => {
    const limits = { 'p-author': 40, 'p-title': 100, 'p-content': 1500 };
    for (const [id, max] of Object.entries(limits)) {
        const el = document.getElementById(id);
        if (!el || el.dataset.counterInit) continue; 
        el.dataset.counterInit = 'true';
        el.setAttribute('maxlength', max); 

        const counter = document.createElement('div');
        counter.style.cssText = "text-align: right; font-size: 11px; color: #7f8c8d; margin-top: 4px; font-weight: bold;";
        el.parentNode.insertBefore(counter, el.nextSibling); 
        
      el.addEventListener('input', () => {
            // Υπολογίζει σωστά και τα <input> (με .value) και τα <div> (με .innerText)
            const textLength = el.value !== undefined ? el.value.length : el.innerText.length;
            const remain = max - textLength;
            counter.innerText = `${remain} χαρακτήρες έμειναν`;
            counter.style.color = remain <= (max * 0.1) ? '#e74c3c' : '#7f8c8d';
            
            if (id === 'p-content') {
                el.style.height = 'auto';
                el.style.height = (el.scrollHeight) + 'px';
            }
            window.saveDraft(); 
        });
        el.dispatchEvent(new Event('input'));
    }
    
    // Αποθήκευση προσχεδίου και στο πεδίο του YouTube
    document.getElementById('p-youtube').addEventListener('input', window.saveDraft);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initPostDragAndDrop();
        initCharCounters();
        loadDraft(); 
    });
} else {
    initPostDragAndDrop(); 
    initCharCounters();
    loadDraft();
}

// Υποστήριξη Paste Εικόνας & YouTube Link
window.addEventListener('paste', e => {
    if (isSubmitting) return;
    
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (pastedText && (pastedText.includes('youtube.com') || pastedText.includes('youtu.be'))) {
        document.getElementById('p-youtube').value = pastedText;
        window.handleYouTubeInput();
        return; 
    }

    const items = (e.clipboardData || window.clipboardData).items;
    let file = null;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) { file = items[i].getAsFile(); break; }
    }
    if (file && !document.getElementById('p-youtube').value) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileInput = document.getElementById('p-image');
        fileInput.files = dataTransfer.files;
        window.previewParentImage({ target: fileInput });
    }
});

})();
