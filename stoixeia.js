document.addEventListener("DOMContentLoaded", function() {
  // 1. Αρχικοποίηση Μετρητών
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(c => c.innerText = "0"); 
  const easeOutSeptic = t => 1 - Math.pow(1 - t, 7);
  const animateCounters = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetElement = entry.target;
        const targetNum = parseInt(targetElement.getAttribute('data-target'), 10);
        const customSpeed = parseInt(targetElement.getAttribute('data-speed'), 10) || 50;
        const duration = (targetNum * (1000 / customSpeed)) * 1.5;
        let startTime = null;
        const updateCount = (currentTime) => {
          if (!startTime) startTime = currentTime;
          let progress = duration > 0 ? Math.min((currentTime - startTime) / duration, 1) : 1;
          if (progress < 1) {
            targetElement.innerText = Math.floor(targetNum * easeOutSeptic(progress));
            requestAnimationFrame(updateCount); 
          } else {
            targetElement.innerText = targetNum;
          }
        };
        requestAnimationFrame(updateCount); 
        observer.unobserve(targetElement);    
      }
    });
  };
  const observer = new IntersectionObserver(animateCounters, { threshold: 0.5 });
  counters.forEach(counter => observer.observe(counter));

  // 2. Ρυθμίσεις Modal
  const modalData = {
    "Τμήματα": { icon: "🏫✨", text: "Καλώς ήρθατε! Περιηγηθείτε στα μονοπάτια της ιστορίας του σχολείου, του χωριού μας και της Πιερίας μέσα από τους χάρτες και όχι μόνο! Πατήστε τον παρακάτω σύνδεσμο για να ξεκινήσετε την εξερεύνηση!" },
    "Μαθητές/τριες": { icon: "👧👦🌟", text: "Εδώ θα ανακαλύψετε όλες τις δράσεις, γιορτές και δραστηριότητες των παιδιών. Δείτε τις δημιουργίες τους!" },
    "Εκπαιδευτικοί": { 
  icon: "👩‍🏫👨‍🏫💡", 
  text: "Γνωρίστε το προσωπικό του σχολείου και διαβάστε χρήσιμα άρθρα για το σχολείο, την υγεία, την ψυχολογία και το παιχνίδι." 
},
    "Βιβλιοθήκη": { icon: "📚🪄", text: "Ταξιδέψτε στον μαγικό κόσμο των βιβλίων! Επισκεφθείτε τη σχολική βιβλιοθήκη, βρείτε νέους θησαυρούς και αγαπήστε το διάβασμα." },
    "Υλικό": { icon: "📝🦉", text: "Ένας θησαυρός γνώσης! Βρείτε χρήσιμο εκπαιδευτικό υλικό, σημειώσεις και βοηθήματα για όλες τις τάξεις. Εξερευνήστε το υλικό μας!" }
  };
  
  const modalOverlay = document.getElementById('glassModal');
  
  // 👉 Η ΛΥΣΗ ΓΙΑ ΤΟ Z-INDEX: Μεταφορά του Modal στο <body> της σελίδας
  if (modalOverlay) {
    document.body.appendChild(modalOverlay);
  }

  const modalIcon = document.getElementById('modalIcon');
  const modalText = document.getElementById('modalText');
  const modalBtn = document.getElementById('modalBtn');

  // 3. Διαχείριση Κλικ (Ισχύει για όλες τις συσκευές - PC και Κινητά)
  document.querySelectorAll('.stat-glass-card, .stat-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.classList.contains('stat-glass-card') && !this.getAttribute('href')) return;

      e.preventDefault(); // Μπλοκάρουμε την άμεση πλοήγηση παντού για να ανοίξει το συννεφάκι
      
      const label = this.querySelector('.stat-label').textContent.trim();
      const url = this.getAttribute('href');

      if (modalData[label]) {
  modalIcon.innerHTML = modalData[label].icon;
  modalText.innerHTML = modalData[label].text;

  // Ρύθμιση 1ου Κουμπιού (Βασικό)
  modalBtn.setAttribute('href', url);
  modalBtn.setAttribute('target', '_self');
  // Αν είμαστε στους Εκπαιδευτικούς αλλάζουμε το κείμενο του 1ου κουμπιού
  modalBtn.innerHTML = label === "Εκπαιδευτικοί" ? "Εκπαιδευτικοί 👩‍🏫" : "Δείτε εδώ 🚀";

  // Ρύθμιση 2ου Κουμπιού (Άρθρα)
  const modalBtn2 = document.getElementById('modalBtn2');
  if (label === "Εκπαιδευτικοί") {
    modalBtn2.setAttribute('href', 'https://dimperist.blogspot.com/p/blog-page_89.html');
    modalBtn2.style.display = 'inline-block'; // Το εμφανίζουμε
  } else {
    modalBtn2.style.display = 'none'; // Το κρύβουμε για τις άλλες κάρτες
  }

  modalOverlay.classList.add('active'); 
}
    });
  });

  // Συνάρτηση για κλείσιμο
  window.closeGlassModal = function() { modalOverlay.classList.remove('active'); };
  
  // Κλείσιμο αν ο χρήστης πατήσει στο σκοτεινό φόντο
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeGlassModal();
  });
});
