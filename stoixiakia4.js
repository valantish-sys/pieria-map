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
      primaryBtn: "Δείτε εδώ 🚀",
      themeColor: "#3b82f6" // Ακαδημαϊκό Μπλε
    },
    "Μαθητές/τριες": { 
      icon: "👧👦🌟", 
      text: "Εδώ θα ανακαλύψετε όλες τις δράσεις, γιορτές και δραστηριότητες των παιδιών. Δείτε τις δημιουργίες τους!",
      primaryBtn: "Δείτε εδώ 🚀",
      themeColor: "#f97316" // Χαρούμενο Πορτοκαλί
    },
    "Εκπαιδευτικοί": { 
      icon: "👩‍🏫👨‍🏫💡", 
      text: "Γνωρίστε το προσωπικό του σχολείου και διαβάστε χρήσιμα άρθρα για το σχολείο, την υγεία, την ψυχολογία και το παιχνίδι.",
      primaryBtn: "Εκπαιδευτικοί 👩‍🏫",
      secondaryBtn: { text: "Άρθρα 📖", url: "https://dimperist.blogspot.com/p/blog-page_89.html" },
      themeColor: "#10b981" // Πράσινο της Γνώσης
    },
    "Βιβλιοθήκη": { 
      icon: "📚🪄", 
      text: "Ταξιδέψτε στον μαγικό κόσμο των βιβλίων! Επισκεφθείτε τη σχολική βιβλιοθήκη, βρείτε νέους θησαυρούς και αγαπήστε το διάβασμα.",
      primaryBtn: "Δείτε εδώ 🚀",
      themeColor: "#8b5cf6" // Μαγικό Μωβ
    },
    "Υλικό": { 
      icon: "📝🦉", 
      text: "Ένας θησαυρός γνώσης! Βρείτε χρήσιμο εκπαιδευτικό υλικό, σημειώσεις και βοηθήματα για όλες τις τάξεις. Εξερευνήστε το υλικό μας!",
      primaryBtn: "Δείτε εδώ 🚀",
      themeColor: "#0ea5e9" // Φρέσκο Γαλάζιο
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
      modalOverlay.style.setProperty('--theme-color', data.themeColor || '#a90e0e');
  
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

    // --- NATIVE SWIPE-TO-DISMISS (ΓΙΑ ΚΙΝΗΤΑ) ---
    const modalBox = modalOverlay.querySelector('.glass-modal-box');
    let touchStartY = 0;
    let currentY = 0;
    let isDragging = false;

    if (modalBox) {
      modalBox.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        isDragging = true;
        // Αφαιρούμε το animation για ακαριαία απόκριση στο δάχτυλο
        modalBox.style.transition = 'none'; 
      }, { passive: true });

      modalBox.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diffY = currentY - touchStartY;

        // Επιτρέπουμε σύρσιμο ΜΟΝΟ προς τα κάτω
        if (diffY > 0) {
          // Το -15vh είναι η αρχική θέση που έχεις στο CSS σου
          modalBox.style.transform = `translateY(calc(-15vh + ${diffY}px)) scale(1)`;
        }
      }, { passive: true });

      modalBox.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const diffY = currentY - touchStartY;

        // Επαναφέρουμε την ομαλότητα του CSS
        modalBox.style.transition = ''; 

        if (diffY > 80) { 
          // Αν το έσυρε αρκετά κάτω, κλείνουμε το modal
          closeModal();
          // Κρυφή επαναφορά θέσης αφότου κλείσει, για να είναι σωστό στο επόμενο άνοιγμα
          setTimeout(() => { modalBox.style.transform = ''; }, 300);
        } else {
          // Διαφορετικά, ελατήριο (snap back) στην αρχική του θέση
          modalBox.style.transform = '';
        }
      });
    }

    // EVENT DELEGATION: Ένας ακροατής (listener) στο document, αντί για πολλούς (Μέγιστη ταχύτητα)
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-glass-card, .stat-link');
      if (!card) return;

      const url = card.getAttribute('href');
      // Αγνοούμε τις κάρτες χωρίς href (επιτρέπουμε την κανονική τους συμπεριφορά)
      if (card.classList.contains('stat-glass-card') && (!url || url === '#')) return;

      e.preventDefault(); 
      // Haptic Feedback: Απειροελάχιστη δόνηση (15ms) αν το υποστηρίζει το κινητό
      if (navigator.vibrate) navigator.vibrate(15);
      // Optional Chaining (?.) για αποφυγή σφαλμάτων (errors)
      const label = card.querySelector('.stat-label')?.textContent.trim() || "";
      if (modalData[label]) openModal(label, url, card);
    });
  };
/* --- ΕΞΥΠΝΟΣ ΧΑΙΡΕΤΙΣΜΟΣ --- */
  const initDynamicGreeting = () => {
    const noticeEl = document.querySelector('.stats-notice');
    if (!noticeEl) return;
    
    const hour = new Date().getHours();
    let greeting = "Γεια σας"; let emoji = "👋";

    if (hour >= 5 && hour < 12) { greeting = "Καλημέρα"; emoji = "☀️"; }
    else if (hour >= 12 && hour < 17) { greeting = "Καλό μεσημέρι"; emoji = "🍎"; }
    else if (hour >= 17 && hour < 21) { greeting = "Καλό απόγευμα"; emoji = "☕"; }
    else { greeting = "Καλό βράδυ"; emoji = "🌙"; }

    noticeEl.innerHTML = `👉 <strong>${greeting} ${emoji}</strong> Εξερευνήστε το σχολείο πατώντας στις κάρτες!`;
  };
  /* ========================================================================
     4. 3D MAGNETIC TILT (PARALLAX & DYNAMIC GLARE)
     ======================================================================== */
  const init3DTilt = () => {
    // ΔΙΟΡΘΩΣΗ 1: Αλλάξαμε σε "hover: none" για να δουλεύει 100% και σε Laptops με αφή!
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll('.stat-glass-card');
    
    cards.forEach(card => {
      // Όταν το ποντίκι ΜΠΑΙΝΕΙ στην κάρτα
      card.addEventListener('mouseenter', () => {
        // ΔΙΟΡΘΩΣΗ 2: Σπάμε τα "δεσμά" του CSS! Σβήνουμε το animation 
        // ώστε να δώσουμε τον έλεγχο πίσω στη Javascript.
        card.style.animation = 'none'; 
        card.style.opacity = '1';
        
        card.style.transition = 'none';
      });

      // ΟΣΟ το ποντίκι κινείται ΠΑΝΩ στην κάρτα
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        
        // Συντεταγμένες ποντικιού ως προς την κάρτα
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        
        // Κέντρο της κάρτας
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Υπολογισμός Κλίσης (Max 12 μοίρες). Αντιστρέφουμε για αίσθηση "μαγνήτη".
        const rotateX = ((y - centerY) / centerY) * -12; 
        const rotateY = ((x - centerX) / centerX) * 12;
        
        // Πού θα πέφτει το φως (%)
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        
        // Χρησιμοποιούμε requestAnimationFrame για απόλυτη ομαλότητα
        requestAnimationFrame(() => {
          // Εφαρμόζουμε την τρισδιάστατη περιστροφή + το σήκωμα προς τα πάνω (-8px)
          card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          
          // Στέλνουμε τις συντεταγμένες στο CSS για το φως!
          card.style.setProperty('--glare-x', `${glareX}%`);
          card.style.setProperty('--glare-y', `${glareY}%`);
        });
      });
      
      // Όταν το ποντίκι ΦΕΥΓΕΙ από την κάρτα
      card.addEventListener('mouseleave', () => {
        // Επιστρέφουμε την ελαστικότητα (σαν ελατήριο)
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        // Μηδενίζουμε τις γωνίες
        card.style.transform = 'perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        
        // Κεντράρουμε ξανά το φως
        card.style.setProperty('--glare-x', '50%');
        card.style.setProperty('--glare-y', '50%');
      });
    });
  };
  // Εκκίνηση Εφαρμογής (Οργάνωση σε Functions για καθαρότερη μνήμη)
  initDynamicGreeting();
  initCounters();
  initModal();
  init3DTilt();
});
