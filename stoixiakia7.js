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

     // Υπολογισμός πάχους scrollbar για αποφυγή βίαιου τινάγματος (Layout Shift)
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // [Premium UX]: Κλειδώνει το scroll της πίσω σελίδας (Τέλειο για κινητά)
      modalOverlay.style.setProperty('--theme-color', data.themeColor || '#a90e0e');
  
    // Accessibility: Πάει αυτόματα το Focus στο 1ο κουμπί, 
      // ΑΛΛΑ αποτρέπουμε το βίαιο scroll (πήδημα) του browser αν το κείμενο είναι μεγάλο
      setTimeout(() => modalBtn?.focus({ preventScroll: true }), 50);
    };

  const closeModal = () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Ξεκλειδώνει το scroll
      document.body.style.paddingRight = ''; // Καθαρισμός του padding
      if (lastFocusedElement) lastFocusedElement.focus(); // Επιστρέφει το focus στην κάρτα που είχε πατηθεί
    };

    // Εξαγωγή για inline onclick="..." (αν υπάρχει στο HTML σου)
    window.closeGlassModal = closeModal;

  // Αποτροπή κλεισίματος όταν ο χρήστης μαρκάρει κείμενο
    let isMouseDownOnOverlay = false;

    modalOverlay.addEventListener('mousedown', (e) => {
      isMouseDownOnOverlay = (e.target === modalOverlay);
    });

    modalOverlay.addEventListener('mouseup', (e) => {
      // Κλείνει ΜΟΝΟ αν το κλικ ξεκίνησε ΚΑΙ τελείωσε στο σκοτεινό φόντο
      if (isMouseDownOnOverlay && e.target === modalOverlay) {
        closeModal();
      }
      isMouseDownOnOverlay = false; // Επαναφορά
    });
    // ΣΗΜΕΙΩΣΗ: Το παλιό event 'click' έχει πλέον αντικατασταθεί πλήρως.

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
        currentY = touchStartY; // ΔΙΟΡΘΩΣΗ: Μηδενισμός για να μην "θυμάται" παλιά swipes σε απλά taps.
        isDragging = true;
        // Αφαιρούμε το animation για ακαριαία απόκριση στο δάχτυλο
        modalBox.style.transition = 'none'; 
      }, { passive: true });

    modalBox.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        // ΔΙΟΡΘΩΣΗ: Αν το κείμενο που αγγίζει δεν είναι τέρμα πάνω, του επιτρέπουμε να κάνει Scroll ελεύθερα.
        let target = e.target;
        let isScrolled = false;
        while (target && target !== modalOverlay) {
          if (target.scrollTop > 0) { isScrolled = true; break; }
          target = target.parentElement;
        }
        if (isScrolled) return;

        currentY = e.touches[0].clientY;
        const diffY = currentY - touchStartY;

        if (diffY > 0) {
          if (e.cancelable) e.preventDefault(); // Αποτρέπει το pull-to-refresh
          modalBox.style.transform = `translateY(calc(-15vh + ${diffY}px)) scale(1)`;
        }
      }, { passive: false }); // ΔΙΟΡΘΩΣΗ: Άλλαξε σε false για να δουλέψει σωστά το e.preventDefault()

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
      const label = card.querySelector('.stat-label')?.textContent.trim() || "";

      // 1. Αν η κάρτα υπάρχει στο σύστημα του Modal, αναλαμβάνει η Javascript:
      if (modalData[label]) {
        e.preventDefault(); 
        if (navigator.vibrate) navigator.vibrate(15);
        openModal(label, url, card);
        return;
      }

      // 2. Αν δεν ανήκει σε Modal, αλλά έχει href="#", αποτρέπουμε το "πήδημα" στην κορυφή.
      if (!url || url === '#') {
        e.preventDefault();
      }
      
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
     let rect; // Κασάρισμα μεταβλητής
      
      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect(); // ΔΙΟΡΘΩΣΗ: Υπολογισμός ΠΡΙΝ παραμορφωθεί η κάρτα
        card.style.animation = 'none'; 
        card.style.opacity = '1';
        card.style.transition = 'none';
      });

      card.addEventListener('mousemove', (e) => {
        if (!rect) return; // Ασφάλεια
        
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
  /* ========================================================================
     5. PREMIUM MICRO-INTERACTIONS (Liquid Ripple & Magnetic Pull)
     ======================================================================== */
  const initButtonFX = () => {
    const modalButtons = document.querySelectorAll('.glass-modal-btn');
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    modalButtons.forEach(btn => {
      /* --- 1. MAGNETIC CURSOR PULL (Μαγνήτης - ΜΟΝΟ για ποντίκι) --- */
     if (!isTouchDevice) {
        let btnRect, centerX, centerY;
        
        btn.addEventListener('mouseenter', () => {
          // ΔΙΟΡΘΩΣΗ: Υπολογισμός κέντρου μόνο κατά την είσοδο. 
          btnRect = btn.getBoundingClientRect();
          centerX = btnRect.left + btnRect.width / 2;
          centerY = btnRect.top + btnRect.height / 2;
        });

        btn.addEventListener('mousemove', (e) => {
          if (!btnRect) return; // Ασφάλεια
          
          const distanceX = e.clientX - centerX;
          const distanceY = e.clientY - centerY;
          
          // Δύναμη Μαγνήτη (0.2 = Το κουμπί ακολουθεί τον κέρσορα κατά 20%)
          const pullX = distanceX * 0.2;
          const pullY = distanceY * 0.2;

          requestAnimationFrame(() => {
            // Μετακινούμε το κουμπί ομαλά προς το ποντίκι!
            btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.02)`;
            btn.style.transition = 'transform 0.1s ease-out'; // Ακαριαία κίνηση
          });
        });

        // Όταν το ποντίκι φεύγει, το κουμπί κάνει "snap" πίσω στη θέση του
        btn.addEventListener('mouseleave', () => {
          requestAnimationFrame(() => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          });
        });
      }

      /* --- 2. LIQUID RIPPLE EFFECT (Υδάτινο Κλικ - Για PC & Κινητά) --- */
      // Χρησιμοποιούμε 'pointerdown' γιατί πιάνει ακαριαία δάχτυλο & ποντίκι
      btn.addEventListener('pointerdown', function(e) {
        const rect = btn.getBoundingClientRect();
        
        // Καθαρίζουμε παλιά κύματα (αν ο χρήστης πατήσει γρήγορα 2-3 φορές)
        const existingRipple = btn.querySelector('.ripple');
        if (existingRipple) existingRipple.remove();

        const circle = document.createElement('span');
        circle.classList.add('ripple');
        
       // ΔΙΟΡΘΩΣΗ 1: Η *ακτίνα* πρέπει να είναι η μέγιστη διάσταση. 
        // Διαφορετικά το κύμα θα κόβεται στη μέση σε πλατιά κουμπιά!
        const radius = Math.max(btn.clientWidth, btn.clientHeight);
        const diameter = radius * 2;
        
        // Βρίσκουμε το ΑΚΡΙΒΕΣ pixel που ακούμπησε το δάχτυλο/ποντίκι
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${clickX - radius}px`;
        circle.style.top = `${clickY - radius}px`;
        
        // ΔΙΟΡΘΩΣΗ 2: Κάνουμε τη "σταγόνα" αόρατη στα κλικ για να μην μπλοκάρει τα γρήγορα απανωτά πατήματα!
        circle.style.pointerEvents = 'none';

        btn.appendChild(circle);

        // Την εξαφανίζουμε από τη μνήμη όταν τελειώσει το animation (600ms)
        setTimeout(() => circle.remove(), 600); 
      });
    });
  };
  // Εκκίνηση Εφαρμογής (Οργάνωση σε Functions για καθαρότερη μνήμη)
  initDynamicGreeting();
  initCounters();
  initModal();
  init3DTilt();
  initButtonFX();
});
