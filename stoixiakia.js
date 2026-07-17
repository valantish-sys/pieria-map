document.addEventListener("DOMContentLoaded", () => {
  "use strict"; // Αυστηρή λειτουργία για μέγιστη απόδοση και αποφυγή σιωπηλών λαθών

  /* ========================================================================
     1. ΡΥΘΜΙΣΕΙΣ (DATA-DRIVEN ARCHITECTURE)
     Όλη η λογική βρίσκεται εδώ. Αν στο μέλλον θες να βάλεις 2ο κουμπί 
     στη "Βιβλιοθήκη", απλώς προσθέτεις το "secondaryBtn". Ο κώδικας δεν πειράζεται!
     ======================================================================== */
  const modalData = {
    "Τμήματα": { 
      icon: "🏫✨", 
      text: "Καλώς ήρθατε! Περιηγηθείτε στα μονοπάτια της ιστορίας του σχολείου, του χωριού μας και της Πιερίας μέσα από τους χάρτες και όχι μόνο! Πατήστε τον παρακάτω σύνδεσμο για να ξεκινήσετε την εξερεύνηση!",
      primaryBtn: "Δείτε εδώ 🚀"
    },
    "Μαθητές/τριες": { 
      icon: "👧👦🌟", 
      text: "Εδώ θα ανακαλύψετε όλες τις δράσεις, γιορτές και δραστηριότητες των παιδιών. Δείτε τις δημιουργίες τους!",
      primaryBtn: "Δείτε εδώ 🚀"
    },
    "Εκπαιδευτικοί": { 
      icon: "👩‍🏫👨‍🏫💡", 
      text: "Γνωρίστε το προσωπικό του σχολείου και διαβάστε χρήσιμα άρθρα για το σχολείο, την υγεία, την ψυχολογία και το παιχνίδι.",
      primaryBtn: "Εκπαιδευτικοί 👩‍🏫",
      secondaryBtn: { text: "Άρθρα 📖", url: "https://dimperist.blogspot.com/p/blog-page_89.html" } // <-- Το 2ο κουμπί ορίζεται εδώ δυναμικά!
    },
    "Βιβλιοθήκη": { 
      icon: "📚🪄", 
      text: "Ταξιδέψτε στον μαγικό κόσμο των βιβλίων! Επισκεφθείτε τη σχολική βιβλιοθήκη, βρείτε νέους θησαυρούς και αγαπήστε το διάβασμα.",
      primaryBtn: "Δείτε εδώ 🚀"
    },
    "Υλικό": { 
      icon: "📝🦉", 
      text: "Ένας θησαυρός γνώσης! Βρείτε χρήσιμο εκπαιδευτικό υλικό, σημειώσεις και βοηθήματα για όλες τις τάξεις. Εξερευνήστε το υλικό μας!",
      primaryBtn: "Δείτε εδώ 🚀"
    }
  };

  /* ========================================================================
     2. ΜΕΤΡΗΤΕΣ (COUNTERS) - ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ ΑΠΟΔΟΣΗΣ (60 FPS)
     ======================================================================== */
  const initCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    // Το textContent είναι πολύ πιο γρήγορο από το innerText γιατί αποφεύγει το CSS Reflow του Browser
    counters.forEach(c => c.textContent = "0"); 
    
    const easeOutSeptic = t => 1 - Math.pow(1 - t, 7);

    const animateCounters = (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const targetElement = entry.target;
        // Ασφαλής ανάγνωση δεδομένων με fallback (|| 0)
        const targetNum = parseInt(targetElement.getAttribute('data-target'), 10) || 0;
        const customSpeed = parseInt(targetElement.getAttribute('data-speed'), 10) || 50;
        
        // Ορίζουμε όρια (Ελάχιστο 1s - Μέγιστο 3s). 
        // Προστατεύει αν βάλεις έναν τεράστιο αριθμό (π.χ. 50.000) από το να μετράει ατελείωτα.
        const calculatedDuration = (targetNum * (1000 / customSpeed)) * 1.5;
        const duration = Math.max(1000, Math.min(calculatedDuration, 3000));
        
        let startTime = null;

        const updateCount = (currentTime) => {
          if (!startTime) startTime = currentTime;
          const progress = duration > 0 ? Math.min((currentTime - startTime) / duration, 1) : 1;
          
          if (progress < 1) {
            targetElement.textContent = Math.floor(targetNum * easeOutSeptic(progress));
            requestAnimationFrame(updateCount); 
          } else {
            targetElement.textContent = targetNum; // Εξασφάλιση απόλυτης ακρίβειας στο τέλος
          }
        };

        if (targetNum > 0) requestAnimationFrame(updateCount); 
        observer.unobserve(targetElement); // Σταματάμε την παρακολούθηση της κάρτας για εξοικονόμηση μνήμης RAM
      });
    };

    // Μικρότερο threshold (0.2) για καλύτερη απόκριση στο scroll στα κινητά (στις μεγάλες κάρτες)
    const observer = new IntersectionObserver(animateCounters, { threshold: 0.2 });
    counters.forEach(counter => observer.observe(counter));
  };

  /* ========================================================================
     3. MODAL (UI, UX, ACCESSIBILITY & BULLETPROOFING)
     ======================================================================== */
  const initModal = () => {
    const modalOverlay = document.getElementById('glassModal');
    if (!modalOverlay) return; // Fail-safe: Αν λείπει το Modal από μια σελίδα, ο κώδικας δεν κρασάρει ποτέ!

    // Η ΛΥΣΗ ΓΙΑ ΤΟ Z-INDEX: Μεταφορά στο <body>
    document.body.appendChild(modalOverlay);

    // Caching: Βρίσκουμε τα στοιχεία 1 φορά (ο παλιός κώδικας έψαχνε το modalBtn2 σε κάθε κλικ!)
    const modalIcon = document.getElementById('modalIcon');
    const modalText = document.getElementById('modalText');
    const modalBtn = document.getElementById('modalBtn');
    const modalBtn2 = document.getElementById('modalBtn2');
    
    let lastFocusedElement = null; // Για Προσβασιμότητα (Accessibility)

    const openModal = (label, url, triggerElement) => {
      const data = modalData[label];
      if (!data) return;

      lastFocusedElement = triggerElement;

      // Εισαγωγή Δεδομένων με textContent (Αποτρέπει κακόβουλες επιθέσεις XSS)
      if (modalIcon) modalIcon.innerHTML = data.icon; 
      if (modalText) modalText.innerHTML = data.text;

      // Ρύθμιση 1ου Κουμπιού
      if (modalBtn) {
        modalBtn.setAttribute('href', url || '#');
        modalBtn.innerHTML = data.primaryBtn || "Δείτε εδώ 🚀";
      }

      // Ρύθμιση 2ου Κουμπιού (Δυναμικά)
      if (modalBtn2) {
        if (data.secondaryBtn) {
          modalBtn2.setAttribute('href', data.secondaryBtn.url);
          modalBtn2.innerHTML = data.secondaryBtn.text;
          modalBtn2.style.display = 'inline-block';
        } else {
          modalBtn2.style.display = 'none';
        }
      }

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // [Premium UX]: Κλειδώνει το scroll της πίσω σελίδας (Τέλειο για κινητά)
      
      // Accessibility: Πάει αυτόματα το Focus στο 1ο κουμπί
      setTimeout(() => modalBtn?.focus(), 50);
    };

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Ξεκλειδώνει το scroll
      if (lastFocusedElement) lastFocusedElement.focus(); // Επιστρέφει το focus στην κάρτα που είχε πατηθεί
    };

    // Εξαγωγή για inline onclick="..." (αν υπάρχει στο HTML σου)
    window.closeGlassModal = closeModal;

    // Κλείσιμο με κλικ στο σκοτεινό φόντο
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // [ΝΕΟ] Κλείσιμο με το πλήκτρο ESC (Standard Web Practice)
    document.addEventListener('keydown', (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains('active')) closeModal();
    });

    // EVENT DELEGATION: Ένας ακροατής (listener) στο document, αντί για πολλούς (Μέγιστη ταχύτητα)
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-glass-card, .stat-link');
      if (!card) return;

      const url = card.getAttribute('href');
      // Αγνοούμε τις κάρτες χωρίς href (επιτρέπουμε την κανονική τους συμπεριφορά)
      if (card.classList.contains('stat-glass-card') && (!url || url === '#')) return;

      e.preventDefault(); 
      
      // Optional Chaining (?.) για αποφυγή σφαλμάτων (errors)
      const label = card.querySelector('.stat-label')?.textContent.trim() || "";
      if (modalData[label]) openModal(label, url, card);
    });
  };

  // Εκκίνηση Εφαρμογής (Οργάνωση σε Functions για καθαρότερη μνήμη)
  initCounters();
  initModal();
});
