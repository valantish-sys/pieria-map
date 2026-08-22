// Φόρτωση Tidio με καθυστέρηση 4.5 δευτερολέπτων για τέλειο PageSpeed
  // Φόρτωση Tidio: 1. Με την πρώτη κίνηση Ή 2. Αυτόματα στα 4.5 δευτερόλεπτα
  (function() {
    let tidioLoaded = false;
    let fallbackTimer;

    function loadTidio() {
        if (tidioLoaded) return;
        tidioLoaded = true;
        
        // Ακυρώνουμε το χρονόμετρο αν ο χρήστης κουνηθεί νωρίτερα
        clearTimeout(fallbackTimer); 

        const tidioScript = document.createElement('script');
        tidioScript.src = "//code.tidio.co/hngqwerm5vgx38y1czvjsc2xz3glech2.js";
        tidioScript.async = true;
        document.body.appendChild(tidioScript);

        // Cleanup
        ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(e => window.removeEventListener(e, loadTidio));
    }
    
    // 1. Περιμένουμε την πρώτη κίνηση του χρήστη (αν κουνηθεί, το chat φορτώνει αμέσως)
    ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(e => window.addEventListener(e, loadTidio, { passive: true, once: true }));
    
    // 2. ΝΕΟ: Αν περάσουν 4.5 δευτερόλεπτα και ο χρήστης ΔΕΝ έχει κάνει καμία κίνηση, το φορτώνουμε αυτόματα!
    fallbackTimer = setTimeout(loadTidio, 4500); 
})();

  (function() {
    let tidioIdleTimer;
    let isTidioOpen = false; // Παρακολουθεί αν το chat είναι ανοιχτό
    
    // Συνάρτηση που ξυπνάει το Tidio και διαχειρίζεται το χρονόμετρο
    function wakeUpTidio() {
      const elements = [
        document.getElementById('tidio-chat-iframe'),
        document.querySelector('iframe[title="Tidio Chat"]'),
        document.getElementById('tidio-chat')
      ];
      
      // Ξύπνημα (αφαίρεση διαφάνειας)
      elements.forEach(el => {
        if (el) el.classList.remove('tidio-sleep');
      });
      
      clearTimeout(tidioIdleTimer);
      
      // ΑΝ ΤΟ CHAT ΕΙΝΑΙ ΑΝΟΙΧΤΟ: Σταματάμε εδώ! Δεν μπαίνει χρονόμετρο.
      if (isTidioOpen) return;
      
      // ΑΝ ΤΟ CHAT ΕΙΝΑΙ ΚΛΕΙΣΤΟ: Χρονόμετρο 5 δευτερολέπτων για ύπνο (μόνο στα κινητά)
    // ΑΝ ΤΟ CHAT ΕΙΝΑΙ ΚΛΕΙΣΤΟ: Χρονόμετρο 5 δευτερολέπτων για ύπνο (μόνο στα κινητά)
      tidioIdleTimer = setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !isTidioOpen) {
          // ΝΕΟ: Αναζητούμε τα στοιχεία *τη στιγμή* που τρέχει το χρονόμετρο, 
          // καθώς 5 δευτερόλεπτα πριν πιθανότατα δεν είχαν προλάβει να φορτώσουν!
          const currentElements = [
            document.getElementById('tidio-chat-iframe'),
            document.querySelector('iframe[title="Tidio Chat"]'),
            document.getElementById('tidio-chat')
          ];
          currentElements.forEach(el => {
            if (el) el.classList.add('tidio-sleep');
          });
        }
      }, 5000);
    }

   let isHiddenByScroll = false; 
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

   let interactionThrottle = false; // ΝΕΟ: Ελέγχει τη συχνότητα εκτέλεσης (throttling)

    // 1. Ακούμε τις υπόλοιπες κινήσεις (Αφαιρέσαμε το scroll από εδώ)
 // 1. Ακούμε τις υπόλοιπες κινήσεις (Αφαιρέσαμε το scroll από εδώ)
    // ΝΕΟ: Αλλαγή του touchstart σε click για να μην φλασάρει το widget στην έναρξη του scroll
    ['mousemove', 'click', 'keydown'].forEach(evt => 
      window.addEventListener(evt, function() {
        // Αν έχει κρυφτεί επειδή ο χρήστης κατεβαίνει, ΔΕΝ το ξυπνάμε από τυχόν άγγιγμα στην οθόνη
        if (!isHiddenByScroll) {
          if (interactionThrottle) return; // Αποτροπή εκτέλεσης δεκάδες φορές το δευτερόλεπτο

          wakeUpTidio();

          // Επιτρέπουμε επόμενη κλήση μόνο μετά από 250ms (δραματική εξοικονόμηση CPU)
          interactionThrottle = true;
          setTimeout(() => interactionThrottle = false, 250);
        }
      }, { passive: true })
    );

    // 2. ΝΕΟΣ ΕΞΥΠΝΟΣ ΜΗΧΑΝΙΣΜΟΣ ΜΟΝΟ ΓΙΑ ΤΟ SCROLL (Εξαφάνιση προς τα κάτω, Εμφάνιση προς τα πάνω)
   // 2. ΝΕΟΣ ΕΞΥΠΝΟΣ ΜΗΧΑΝΙΣΜΟΣ ΜΟΝΟ ΓΙΑ ΤΟ SCROLL (Εξαφάνιση προς τα κάτω, Εμφάνιση προς τα πάνω)
    window.addEventListener('scroll', function() {
      let currentScroll = window.scrollY || document.documentElement.scrollTop;
      
      if (isTidioOpen) {
        // Κρατάμε το ιστορικό θέσης συγχρονισμένο για να μην υπάρξει σφάλμα άλματος μόλις κλείσει το chat
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        return; 
      }
      const isMobile = window.innerWidth <= 1300; // ή 768 βάσει της 1ης διόρθωσης

      // Αποτροπή του iOS "rubber-band" effect (αναπήδηση) στο τέλος της σελίδας
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (currentScroll > maxScroll) currentScroll = maxScroll;
      if (currentScroll < 0) currentScroll = 0;

      // Αν φτάσει τέρμα πάνω στην οθόνη, το εμφανίζουμε πάντα

      // Αν φτάσει τέρμα πάνω στην οθόνη, το εμφανίζουμε πάντα
      if (currentScroll <= 0) {
        isHiddenByScroll = false;
        wakeUpTidio();
        lastScrollTop = currentScroll;
        return;
      }

    // Ανοχή 5px: Αν η συνολική μετακίνηση είναι μικρότερη από 5px, αγνοούμε 
      // το event εντελώς, ώστε να λειτουργήσει σωστά ο εντοπισμός στο αργό scroll.
      if (Math.abs(currentScroll - lastScrollTop) <= 5) {
        return; 
      }

      if (currentScroll > lastScrollTop) {
        // --- SCROLL ΠΡΟΣ ΤΑ ΚΑΤΩ ---
        if (isMobile && !isHiddenByScroll) {
          isHiddenByScroll = true; // "Κλειδώνουμε" την εμφάνιση
          clearTimeout(tidioIdleTimer); // Σταματάμε το χρονόμετρο των 5s
          
          // Το εξαφανίζουμε άμεσα
          const elements = [
            document.getElementById('tidio-chat-iframe'),
            document.querySelector('iframe[title="Tidio Chat"]'),
            document.getElementById('tidio-chat')
          ];
          elements.forEach(el => {
            if (el) el.classList.add('tidio-sleep');
          });
        }
      } 
      else {
        // --- SCROLL ΠΡΟΣ ΤΑ ΠΑΝΩ ---
        isHiddenByScroll = false; // Το "ξεκλειδώνουμε"
        wakeUpTidio(); // Το εμφανίζουμε (και η συνάρτηση ξεκινάει πάλι τον χρόνο των 5 δευτερολέπτων κανονικά)
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
    

    function onTidioChatApiReady() {
      // Αν το API φορτώσει ενώ ο χρήστης ΗΔΗ σκρολάρει προς τα κάτω, 
      // του επιβάλλουμε κατευθείαν 'tidio-sleep' για να μην "σπάσει" ο μηχανισμός.
      if (isHiddenByScroll) {
        const elements = [
          document.getElementById('tidio-chat-iframe'),
          document.querySelector('iframe[title="Tidio Chat"]'),
          document.getElementById('tidio-chat')
        ];
        elements.forEach(el => {
          if (el) el.classList.add('tidio-sleep');
        });
      } else {
        wakeUpTidio(); 
      }
      
      window.tidioChatApi.on("open", function() {
        isTidioOpen = true; 
        wakeUpTidio(); 
        
     // Μηχανισμός Disclaimer (ΑΥΣΤΗΡΑ ΜΙΑ ΦΟΡΑ ΑΝΑ ΕΠΙΣΚΕΨΗ / SESSION)
        if (!sessionStorage.getItem('tidio_disclaimer_sent')) {
          window.tidioChatApi.messageFromOperator('⚠️ ΠΡΟΣΟΧΗ: Ο παρών AI βοηθός απαντά μόνο σε γενικές πληροφορίες για το σχολείο. Μην πληκτρολογείτε προσωπικά δεδομένα (ονόματα, τηλέφωνα, βαθμούς, ιατρικά θέματα).');
          sessionStorage.setItem('tidio_disclaimer_sent', 'true');
        }
        });
     window.tidioChatApi.on("close", function() {
        isTidioOpen = false;
        wakeUpTidio(); 
      });

      // Αν έρθει μήνυμα από το Bot/Εκπρόσωπο όσο το chat "κοιμάται", το ξυπνάμε αναγκαστικά
      window.tidioChatApi.on("messageFromOperator", function() {
        isHiddenByScroll = false;
        wakeUpTidio(); 
      });
    }

    if (window.tidioChatApi) {
      window.tidioChatApi.on('ready', onTidioChatApiReady);
    } else {
      document.addEventListener('tidioChat-ready', onTidioChatApiReady);
    }
  })();
