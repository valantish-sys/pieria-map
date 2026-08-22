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
      tidioIdleTimer = setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !isTidioOpen) {
          elements.forEach(el => {
            if (el) el.classList.add('tidio-sleep');
          });
        }
      }, 5000); 
    }

   let isHiddenByScroll = false; 
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

    // 1. Ακούμε τις υπόλοιπες κινήσεις (Αφαιρέσαμε το scroll από εδώ)
    ['mousemove', 'touchstart', 'keydown'].forEach(evt => 
      window.addEventListener(evt, function() {
        // Αν έχει κρυφτεί επειδή ο χρήστης κατεβαίνει, ΔΕΝ το ξυπνάμε από τυχόν άγγιγμα στην οθόνη
        if (!isHiddenByScroll) {
          wakeUpTidio();
        }
      }, { passive: true })
    );

    // 2. ΝΕΟΣ ΕΞΥΠΝΟΣ ΜΗΧΑΝΙΣΜΟΣ ΜΟΝΟ ΓΙΑ ΤΟ SCROLL (Εξαφάνιση προς τα κάτω, Εμφάνιση προς τα πάνω)
    window.addEventListener('scroll', function() {
      if (isTidioOpen) return; // Αν το chat είναι ανοιχτό, δεν το κρύβουμε ποτέ!

      let currentScroll = window.scrollY || document.documentElement.scrollTop;
      const isMobile = window.innerWidth <= 1500;

      // Αν φτάσει τέρμα πάνω στην οθόνη, το εμφανίζουμε πάντα
      if (currentScroll <= 0) {
        isHiddenByScroll = false;
        wakeUpTidio();
        lastScrollTop = currentScroll;
        return;
      }

      // Ανοχή 5px για να μην τρεμοπαίζει με το παραμικρό κούνημα του δαχτύλου
      if (currentScroll > lastScrollTop + 5) {
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
      else if (currentScroll < lastScrollTop - 5) {
        // --- SCROLL ΠΡΟΣ ΤΑ ΠΑΝΩ ---
        isHiddenByScroll = false; // Το "ξεκλειδώνουμε"
        wakeUpTidio(); // Το εμφανίζουμε (και η συνάρτηση ξεκινάει πάλι τον χρόνο των 5 δευτερολέπτων κανονικά)
      }

      // Αποθήκευση της νέας θέσης (το <= 0 αποτρέπει σφάλματα "αναπήδησης" στα iPhone/Safari)
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }, { passive: true });
    
    // ----------------------------------------------------
    // Κεντρική Διαχείριση του Tidio API (Όταν φορτώσει πλήρως)
    // ----------------------------------------------------
    function onTidioChatApiReady() {
      wakeUpTidio(); 
      
      window.tidioChatApi.on("open", function() {
        isTidioOpen = true; 
        wakeUpTidio(); 
        
        // Μηχανισμός Disclaimer (ΑΥΣΤΗΡΑ ΜΙΑ ΦΟΡΑ)
        if (!localStorage.getItem('tidio_disclaimer_sent')) {
          window.tidioChatApi.messageFromOperator('⚠️ ΠΡΟΣΟΧΗ: Ο παρών AI βοηθός απαντά μόνο σε γενικές πληροφορίες για το σχολείο. Μην πληκτρολογείτε προσωπικά δεδομένα (ονόματα, τηλέφωνα, βαθμούς, ιατρικά θέματα).');
          localStorage.setItem('tidio_disclaimer_sent', 'true');
        }
      });

      window.tidioChatApi.on("close", function() {
        isTidioOpen = false;
        wakeUpTidio(); 
      });
    }

    if (window.tidioChatApi) {
      window.tidioChatApi.on('ready', onTidioChatApiReady);
    } else {
      document.addEventListener('tidioChat-ready', onTidioChatApiReady);
    }
  })();
