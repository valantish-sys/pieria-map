let selectedFile = null;

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
    const author = document.getElementById('p-author').value.trim();
    const title = document.getElementById('p-title').value.trim();
    const content = document.getElementById('p-content').value.trim();
    const btn = document.getElementById('p-submit-btn');

    if (!author || !title || !content) {
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'warning', title: 'Ελλιπή στοιχεία', text: 'Όνομα, Τίτλος και Κείμενο είναι υποχρεωτικά!' });
        else alert('Όνομα, Τίτλος και Κείμενο είναι υποχρεωτικά!');
        return;
    }

    if (!window.dbAnartiseis) {
        alert("Παρακαλώ περιμένετε 1 δευτερόλεπτο να φορτώσει η σελίδα και δοκιμάστε ξανά.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = "Ανέβασμα... ⏳";

    let imageUrl = null;

    try {
        if (selectedFile) {
            if (typeof Swal !== 'undefined') Swal.fire({ title: 'Ανέβασμα Εικόνας...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("upload_preset", "anartisis"); 

            // ΚΑΘΑΡΟ CLOUD NAME ΧΩΡΙΣ ΒΕΛΑΚΙΑ!
            const CLOUD_NAME = "h5dkbv63"; 
            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST", body: formData
            });
            const cloudData = await cloudRes.json();
            
            if (cloudData.secure_url) {
                imageUrl = cloudData.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
            } else if (cloudData.error) {
                throw new Error(cloudData.error.message);
            }
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

        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'success', title: 'Εστάλη!', text: 'Η ανάρτησή σας στάλθηκε και αναμένει έγκριση από το σχολείο.' }).then(() => {
                window.location.reload(); 
            });
        } else {
            alert("Εστάλη επιτυχώς!");
            window.location.reload();
        }

    } catch (error) {
        console.error(error);
        if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Σφάλμα', text: 'Υπήρξε πρόβλημα κατά την αποστολή. Δοκιμάστε ξανά.' });
        else alert("Υπήρξε πρόβλημα. Δοκιμάστε ξανά.");
        btn.disabled = false;
        btn.innerText = "🚀 Αποστολή";
    }
}

initParentForm();
