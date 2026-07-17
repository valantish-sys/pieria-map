(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================
  const CONFIG = Object.freeze({
    showThreshold: 1400, // Στα πόσα pixels scroll να εμφανιστεί (από 400 το πήγες 1400)
    debounceDelay: 150
  });

  // ==========================================
  // 2. DOM CACHE
  // ==========================================
  const DOM = {
    btn: null,
    progressCircle: null
  };

  // ==========================================
  // 3. UTILITIES
  // ==========================================
  const Utils = {
    debounce: (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    }
  };

  // ==========================================
  // 4. BACK TO TOP MANAGER
  // ==========================================
  const ScrollManager = {
    ticking: false, // Flag για το requestAnimationFrame

    init: () => {
      ScrollManager.buildDOM();
      ScrollManager.setupEvents();
      ScrollManager.updateUI(); // Αρχικός υπολογισμός
    },

    buildDOM: () => {
      let btn = document.querySelector('.toTopBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'toTopBtn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Επιστροφή στην κορυφή');
        
        btn.innerHTML = `
          <svg viewBox="0 0 100 100">
            <circle class="bg-circle" cx="50" cy="50" r="45" />
            <circle class="progress-circle" cx="50" cy="50" r="45" 
                    pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" />
          </svg>
          <svg class="arrow-icon" viewBox="0 0 24 24">
            <path d="m16 12-4-4-4 4M12 16V8"/>
          </svg>`;
        
        document.body.appendChild(btn);
      }

      DOM.btn = btn;
      DOM.progressCircle = btn.querySelector('.progress-circle');
    },

    updateUI: () => {
      const scrollY = window.scrollY;
      
      // Αποτροπή διαίρεσης με το μηδέν (Αν η σελίδα είναι μικρότερη από την οθόνη, βάζουμε 1)
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      
      // Υπολογισμός Προόδου με αυστηρά όρια από 0 έως 100
      const progress = Math.max(0, Math.min(100, (scrollY / docHeight) * 100));
      
      if (DOM.progressCircle) {
        DOM.progressCircle.style.strokeDashoffset = 100 - progress;
      }

      // Εμφάνιση / Απόκρυψη
      if (scrollY > CONFIG.showThreshold) {
        DOM.btn.classList.add('show');
      } else {
        DOM.btn.classList.remove('show');
      }

      ScrollManager.ticking = false; // Ελευθερώνουμε το flag για το επόμενο καρέ
    },

    // Ο controller που προστατεύει τον browser από το σπαμάρισμα των scroll events
    onScroll: () => {
      if (!ScrollManager.ticking) {
        window.requestAnimationFrame(ScrollManager.updateUI);
        ScrollManager.ticking = true;
      }
    },

    scrollToTop: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setupEvents: () => {
      window.addEventListener('scroll', ScrollManager.onScroll, { passive: true });
      window.addEventListener('resize', Utils.debounce(ScrollManager.updateUI, CONFIG.debounceDelay), { passive: true });
      DOM.btn.addEventListener('click', ScrollManager.scrollToTop);
    }
  };

  // ==========================================
  // 5. BOOTSTRAP
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ScrollManager.init);
  } else {
    ScrollManager.init();
  }

})();
