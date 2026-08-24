 let churchSlideIndex = 1;
  const churchModal = document.getElementById("churchesModal");

  function openChurchesModal() {
    // Αυτή η γραμμή βγάζει το modal έξω από το άρθρο και το κεντράρει απόλυτα στην οθόνη
    document.body.appendChild(churchModal); 
    
    churchModal.style.display = "block";
    // Μικρή καθυστέρηση για να παίξει το CSS transition
    setTimeout(() => { churchModal.classList.add("show"); }, 10);
    showChurchSlides(churchSlideIndex);
  }

function closeChurchesModal() {
  churchModal.classList.remove("show");
  setTimeout(() => { 
    // Κρύβει το modal ΜΟΝΟ αν στο ενδιάμεσο δεν προστέθηκε ξανά η κλάση 'show'
    if (!churchModal.classList.contains("show")) {
      churchModal.style.display = "none"; 
    }
  }, 300);
}

  function changeChurchSlide(n) {
    showChurchSlides(churchSlideIndex += n);
  }

  function showChurchSlides(n) {
    let i;
    let slides = document.getElementsByClassName("church-slide");
    if (n > slides.length) {churchSlideIndex = 1}   
    if (n < 1) {churchSlideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
    }
    slides[churchSlideIndex-1].style.display = "block";  
  }

let touchStartX = 0;
let touchStartY = 0; // Νέα μεταβλητή
let touchEndX = 0;
let touchEndY = 0;   // Νέα μεταβλητή

const swipeZone = document.getElementById('churchSwipeArea');

if (swipeZone) {
  swipeZone.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY; // Αποθήκευση κάθετης θέσης
  }, { passive: true });

  swipeZone.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;   // Αποθήκευση κάθετης θέσης
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Ελέγχουμε αν η κίνηση του χρήστη ήταν κυρίως ΟΡΙΖΟΝΤΙΑ και όχι κάθετο scroll
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX < -50) {
      changeChurchSlide(1); // Swipe αριστερά
    } else if (diffX > 50) {
      changeChurchSlide(-1); // Swipe δεξιά
    }
  }
}

  // Κλείσιμο αν πατήσει ο χρήστης εκτός του πλαίσιου της εικόνας (Ασφαλής τρόπος)
  window.addEventListener('click', function(event) {
    if (event.target === churchModal) {
      closeChurchesModal();
    }
  });
