(() => {
  'use strict';
  if (window.self !== window.top) return;

  // ==========================================
  // 1. Ρυθμίσεις & Σταθερές
  // ==========================================
  const CONFIG = {
    BP_MOBILE_LARGE: 9999,
    FAB_HIDE_DELAY: 5000,
    TTS_LANG: 'el-GR'
  };

  // ==========================================
  // 2. DOM Caching
  // ==========================================
  const el = id => document.getElementById(id);
  
  const DOM = {
    html: document.documentElement,
    body: document.body,
    sPop: el('search-pop'),
    aMenu: el('a11y-menu'),
    libMenu: el('lib-options'),
    contactMenu: el('contact-options'),
shareMenu: el('share-options'),
    gtContainer: el('google_translate_element'),
    aTts: el('a11y-btn-tts'),
    aTranslate: el('a11y-btn-translate'),
    aReset: el('a11y-btn-reset'),
    aPrint: el('a11y-btn-print'),
    aClose: el('a11y-close-btn'),
    aBtns: document.querySelectorAll('.a11y-grid button[data-class]'),
    speedDialBtn: el('main-master-fab'),
    speedDialMenu: el('sub-fabs-menu'),
    overlay: el('fab-overlay')
  };

  // ==========================================
  // 3. Βοηθητικές Συναρτήσεις
  // ==========================================
  const safeBind = (id, event, cb, opts = false) => {
    const node = typeof id === 'string' ? el(id) : id;
    node?.addEventListener(event, cb, opts);
  };

  const closeAllMenus = (exceptNode = null) => {
    const menus = [
      { node: DOM.sPop, cls: 'is-open' },
      { node: DOM.aMenu, cls: 'is-open' },
      { node: DOM.libMenu, cls: 'show' },
      { node: DOM.contactMenu, cls: 'show' },
{ node: DOM.shareMenu, cls: 'show' }
    ];
    menus.forEach(({ node, cls }) => {
      if (node && node !== exceptNode) node.classList.remove(cls);
    });
  };

  window.toggleSpeedDial = (forceClose = false) => {
    if(!DOM.speedDialMenu || !DOM.speedDialBtn || !DOM.overlay) return;
    const isOpening = !DOM.speedDialMenu.classList.contains('is-open') && !forceClose;
    
    DOM.speedDialMenu.classList.toggle('is-open', isOpening);
    DOM.speedDialBtn.classList.toggle('is-open', isOpening);
    DOM.overlay.classList.toggle('is-active', isOpening);
  };

  const toggleMenu = (e, menuNode, isMobile, activeCls = 'is-open') => {
    e?.preventDefault();
    e?.stopPropagation();
    
    closeAllMenus(menuNode); 
    if (isMobile) window.toggleSpeedDial(true); // Κλείνει το speed dial αν ανοίξει υπο-μενού
    
    if (menuNode) {
      menuNode.classList.toggle('mobile-pos', isMobile);
      menuNode.classList.toggle(activeCls);
    }
  };

  // ==========================================
  // 4. Events & Listeners
  // ==========================================
  safeBind('search-fab', 'click', (e) => toggleMenu(e, DOM.sPop, false));
  
  safeBind('a11y-fab', 'click', (e) => toggleMenu(e, DOM.aMenu, false));
  safeBind('a11y-fab-mob', 'click', (e) => toggleMenu(e, DOM.aMenu, true));
  safeBind(DOM.aClose, 'click', () => DOM.aMenu?.classList.remove('is-open'));

  safeBind('lib-fab', 'click', (e) => toggleMenu(e, DOM.libMenu, false, 'show'));
  safeBind('lib-fab-mob', 'click', (e) => toggleMenu(e, DOM.libMenu, true, 'show'));

// Speed Dial Events
  safeBind('main-master-fab', 'click', () => {
    // --- ΠΡΟΣΘΗΚΗ ΔΟΝΗΣΗΣ (Haptic Feedback) ---
    if (navigator.vibrate) navigator.vibrate(10); // Ελαφρύ "τακ" 10ms
    
    window.toggleSpeedDial();
    
    // ΠΡΟΣΘΗΚΗ: Αν ο χρήστης πατήσει το κουμπί, κρύβουμε το tooltip αμέσως
    // και το καταγράφουμε για να μην ξαναβγεί ποτέ.
    const t = el('fab-welcome-tooltip');
    if (t) {
      t.classList.remove('show-tooltip');
      localStorage.setItem('has_seen_school_menu_tooltip', 'true');
    }
  });

  safeBind('fab-overlay', 'click', () => {
    window.toggleSpeedDial(true);
    closeAllMenus();
  });

// Share Event
  const handleShare = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const shareData = { title: document.title, url: window.location.href };

    // Σύγχρονη εκτέλεση του fallback (ΠΡΙΝ τα await) αλλιώς το iOS Safari μπλοκάρει
    // την αντιγραφή θεωρώντας ότι χάθηκε το "User Gesture Context"!
    if (!navigator.share && (!navigator.clipboard || !window.isSecureContext)) {
      const textarea = document.createElement('textarea');
      textarea.value = shareData.url;
      Object.assign(textarea.style, { position: 'fixed', top: '-9999px', left: '-9999px', opacity: '0' });
      DOM.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        alert('Ο σύνδεσμος αντιγράφηκε στο πρόχειρο!');
      } catch (copyErr) {
        console.error('Αποτυχία αντιγραφής:', copyErr);
      } finally {
        textarea.remove();
      }
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        alert('Ο σύνδεσμος αντιγράφηκε στο πρόχειρο!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share Error:', err);
    }
  };
    
  // 1. Το κουμπί (Speed Dial) πλέον ανοίγει το Νέο Μενού:
  safeBind('share-master-fab', 'click', (e) => toggleMenu(e, DOM.shareMenu, false, 'show'));
  safeBind('share-master-fab-mob', 'click', (e) => toggleMenu(e, DOM.shareMenu, true, 'show'));

  // 2. Το κουμπί "Κοινοποίηση" ΜΕΣΑ στο μενού εκτελεί το Share:
  safeBind('btn-do-share', 'click', (e) => {
    DOM.shareMenu?.classList.remove('show');
    handleShare(e);
  });

  // 3. Το κουμπί "Εκτύπωση" ΜΕΣΑ στο μενού εκτελεί την Εκτύπωση:
  safeBind('btn-do-print', 'click', () => {
    DOM.shareMenu?.classList.remove('show');
    window.print();
  });

  // ==========================================
  // 5. Προσβασιμότητα & TTS
  // ==========================================
  safeBind(DOM.aPrint, 'click', () => {
    DOM.aMenu?.classList.remove('is-open');
    window.print();
  });

  const applySetting = (btn, cls, key, active) => {
    DOM.html.classList.toggle(cls, active);
    btn.classList.toggle('is-active', active);
    active ? localStorage.setItem(key, 'true') : localStorage.removeItem(key);
  };

  DOM.aBtns?.forEach(btn => {
    const { class: cls, key } = btn.dataset;
    if (!cls || !key) return;
    if (localStorage.getItem(key) === 'true') applySetting(btn, cls, key, true);
    safeBind(btn, 'click', () => applySetting(btn, cls, key, !DOM.html.classList.contains(cls)));
  });

  safeBind(DOM.aReset, 'click', () => {
    DOM.aBtns?.forEach(btn => applySetting(btn, btn.dataset.class, btn.dataset.key, false));
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (window.ttsKeepAlive) clearInterval(window.ttsKeepAlive); // <-- ΠΡΟΣΘΗΚΗ ΕΔΩ
    }
    if (DOM.aTts) {
      DOM.aTts.classList.remove('is-active');
      const ttsIcon = DOM.aTts.querySelector('.icon');
      if (ttsIcon) ttsIcon.innerHTML = '🔊';
    }
    

    // Επαναφορά της μετάφρασης
    const proxySelect = document.getElementById('a11y-lang-select');
    if (proxySelect) {
      proxySelect.style.display = 'none';
      DOM.aTranslate?.classList.remove('is-active');
      const realCombo = document.querySelector('select.goog-te-combo');
      if (realCombo) {
        realCombo.value = ''; // Επιστρέφει στην αρχική γλώσσα
        realCombo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        proxySelect.value = '';
      }
    }
  });

// --- Λειτουργία Text-to-Speech (Ανάγνωση Άρθρου) ---
 // --- Λειτουργία Text-to-Speech (Ανάγνωση Άρθρου) ---
  const isTtsSupported = 'SpeechSynthesisUtterance' in window;

  safeBind(DOM.aTts, 'click', () => {
    if (!isTtsSupported) { alert('Η λειτουργία δεν υποστηρίζεται σε αυτή την εφαρμογή/περιηγητή.'); return; }
    const btnIcon = DOM.aTts.querySelector('.icon');
    
    // Ελέγχουμε ΚΑΙ αν βρίσκεται σε αναμονή (pending), αλλιώς ένα διπλό κλικ σε αργό 
    // κινητό θα προσθέσει πολλαπλές φωνές στην ουρά που θα παίξουν όλες μαζί!
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      if (window.ttsKeepAlive) clearInterval(window.ttsKeepAlive); 
      DOM.aTts.classList.remove('is-active');
      if (btnIcon) btnIcon.innerHTML = '🔊';
      return;
    }

    // Δημιουργία ΦΡΕΣΚΟΥ αντικειμένου, αλλιώς ο Chrome (Desktop) "νεκρώνει" στη 2η ανάγνωση!
    const speech = new SpeechSynthesisUtterance();
    speech.lang = CONFIG.TTS_LANG;

    // Ψάχνουμε ΜΟΝΟ το κείμενο του άρθρου (κλάση του Blogger)
    // Αν δεν βρει άρθρο, προσπαθεί να διαβάσει το γενικό περιεχόμενο.
    const article = document.querySelector('.post-body, .entry-content, article');
    const textToRead = article ? article.innerText : document.querySelector('.main-wrapper, body').innerText;

    if (!textToRead || !textToRead.trim()) return;

    speech.text = textToRead;
    
    // Όταν τελειώσει η ανάγνωση, το κουμπί επανέρχεται στην αρχική του μορφή
   // Όταν τελειώσει η ανάγνωση, το κουμπί επανέρχεται στην αρχική του μορφή
    speech.onend = () => {
      if (window.ttsKeepAlive) clearInterval(window.ttsKeepAlive);
      DOM.aTts.classList.remove('is-active');
      if (btnIcon) btnIcon.innerHTML = '🔊';
    };

    // Ξεκινάμε την ανάγνωση και αλλάζουμε το εικονίδιο σε Stop
    window.speechSynthesis.speak(speech);
    DOM.aTts.classList.add('is-active');
   if (btnIcon) btnIcon.innerHTML = '⏹️';
   
  // ΔΙΟΡΘΩΣΗ: Bypass στο Chrome 15s Timeout Bug
   if (window.ttsKeepAlive) clearInterval(window.ttsKeepAlive);
   window.ttsKeepAlive = setInterval(() => {
     if (window.speechSynthesis.speaking) {
       // Προστασία: Αν ο χρήστης έκανε χειροκίνητα παύση, ΜΗΝ το ξεπαγώνεις με το ζόρι!
       if (!window.speechSynthesis.paused) {
         window.speechSynthesis.pause();
         window.speechSynthesis.resume();
       }
     } else {
       clearInterval(window.ttsKeepAlive);
     }
   }, 14000);
  });
  
let translateTimer;
  let translateAttempts = 0;
  const handleTranslate = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const proxySelect = document.getElementById('a11y-lang-select');
    if (!proxySelect) return;
    
   const isHidden = proxySelect.style.display !== 'block';
    proxySelect.style.display = isHidden ? 'block' : 'none';
    DOM.aTranslate?.classList.toggle('is-active', isHidden);
    
    if (isHidden) {
      clearTimeout(translateTimer);
      translateAttempts = 0;
      
      const syncLanguages = () => {
        const realCombo = document.querySelector('select.goog-te-combo');
        if (realCombo && realCombo.options.length > 0) {
        if (proxySelect.children.length <= 1) { 
            // Αντιγράφει όλες τις γλώσσες στον καθρέφτη μας
            proxySelect.innerHTML = realCombo.innerHTML; 
            
            // Όταν επιλέγεις γλώσσα, δίνει την εντολή στο αυθεντικό!
            proxySelect.onchange = (ev) => {
              realCombo.value = ev.target.value;
              realCombo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            };
          
          // Αυτό πρέπει ΠΑΝΤΑ να εκτελείται όταν ανοίγει, ώστε να συγχρονίζεται 
          // αν ο χρήστης άλλαξε γλώσσα από το banner της Google!
          proxySelect.value = realCombo.value;
            
            // Όταν επιλέγεις γλώσσα, δίνει την εντολή στο αυθεντικό!
            proxySelect.onchange = (ev) => {
              realCombo.value = ev.target.value;
              realCombo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            };
          }
        } else {
          if (translateAttempts >= 15) { // Όριο: Σταματάει μετά από 7.5 δευτερόλεπτα
            proxySelect.innerHTML = '<option value="">❌ Σφάλμα φόρτωσης</option>';
            return;
          }
          translateAttempts++;
          proxySelect.innerHTML = '<option value="">⏳ Φόρτωση γλωσσών...</option>';
          translateTimer = setTimeout(syncLanguages, 500); 
        }
      };
      syncLanguages();
    } else {
      clearTimeout(translateTimer); // Ακύρωση αν το μενού κλείσει πριν φορτώσει
    }
  };
  safeBind(DOM.aTranslate, 'click', handleTranslate);

  // ==========================================
  // 6. Global Clicks (Έξω από μενού)
  // ==========================================
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (DOM.aMenu?.classList.contains('is-open') && !DOM.aMenu.contains(t) && !t.closest('#a11y-fab, #a11y-fab-mob')) DOM.aMenu.classList.remove('is-open');
    if (DOM.sPop?.classList.contains('is-open') && !DOM.sPop.contains(t) && !t.closest('#search-fab, #search-fab-mob')) DOM.sPop.classList.remove('is-open');
    if (DOM.contactMenu?.classList.contains('show') && !DOM.contactMenu.contains(t) && !t.closest('#contact-master-fab, #contact-master-fab-mob')) DOM.contactMenu.classList.remove('show');
    if (DOM.libMenu?.classList.contains('show') && !DOM.libMenu.contains(t) && !t.closest('#lib-fab, #lib-fab-mob')) DOM.libMenu.classList.remove('show');
if (DOM.shareMenu?.classList.contains('show') && !DOM.shareMenu.contains(t) && !t.closest('#share-master-fab, #share-master-fab-mob')) DOM.shareMenu.classList.remove('show');
 
  });

  // ==========================================
  // 7. Auto-hide στο Scroll (Έξυπνη Εμφάνιση / Απόκρυψη)
  // ==========================================
 // ==========================================
  // 7. Auto-hide στο Scroll (Έξυπνη Εμφάνιση / Απόκρυψη)
  // ==========================================
  const initMobileFabs = () => {
    const speedDialWrapper = el('mobile-speed-dial');
    if (!speedDialWrapper) return;

    // Αν υπάρχει ποντίκι, σταματάμε εδώ και δεν εξαφανίζεται
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      speedDialWrapper.classList.remove('fabs-hidden');
      return;
    }

    let hideTimeout;
    let isVisible = true;
    let ticking = false;
    let lastScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop);
    
    // ΝΕΟ: Μεταβλητή "μνήμης" που θυμάται αν κατεβαίναμε προς τα κάτω
    let isHiddenByScrollDown = false; 

    const setVisibility = (show) => {
      // 1. Μην κρύβεις το κουμπί αν το speed dial μενού είναι ανοιχτό!
      if (DOM.speedDialMenu?.classList.contains('is-open')) return; 
      
      // 2. Μην κρύβεις το κουμπί αν φαίνεται το συννεφάκι (onboarding)
      const t = el('fab-welcome-tooltip');
      if (!show && t && t.classList.contains('show-tooltip')) return;

      if (isVisible === show) return; 
      isVisible = show;
      speedDialWrapper.classList.toggle('fabs-hidden', !show);
    };

    const handleActivity = (e) => {
      if (window.innerWidth > CONFIG.BP_MOBILE_LARGE) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (e && e.type === 'scroll') {
            const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop);
            const delta = currentScrollY - lastScrollY;
            
            // Ανοχή 10px για να μην εξαφανίζεται/εμφανίζεται με το παραμικρό τρέμουλο
            if (delta > 10) {
              // ⬇️ Scroll προς τα ΚΑΤΩ: Άμεση εξαφάνιση και "κλείδωμα"
              isHiddenByScrollDown = true; 
              setVisibility(false);
              clearTimeout(hideTimeout);
              lastScrollY = currentScrollY;
            } else if (delta < -10) {
              // ⬆️ Scroll προς τα ΠΑΝΩ: Άμεση εμφάνιση και "ξεκλείδωμα"
              isHiddenByScrollDown = false; 
              setVisibility(true);
              clearTimeout(hideTimeout);
              hideTimeout = setTimeout(() => setVisibility(false), CONFIG.FAB_HIDE_DELAY);
              lastScrollY = currentScrollY;
            }

            // Προστασία: Αν φτάσαμε τέρμα πάνω (στην αρχή της σελίδας), ακυρώνουμε τον αποκλεισμό
            if (currentScrollY <= 10) {
               isHiddenByScrollDown = false;
            }
         } else {
            // Για άλλες ενέργειες (άγγιγμα οθόνης, κλικ):
            // ΠΡΕΠΕΙ να ακυρώνεται το "κλείδωμα" του scroll, ώστε ένα απλό tap 
            // στην οθόνη του κινητού να μπορεί να επαναφέρει τα κρυμμένα κουμπιά!
            isHiddenByScrollDown = false;
            setVisibility(true);
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => setVisibility(false), CONFIG.FAB_HIDE_DELAY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

 const opts = { passive: true };
    // Διαβάζουμε το event (e) για να ξεχωρίζει το scroll από το άγγιγμα/κλικ
    // Αφαιρέθηκε πλήρως το touchstart που προκαλεί το διαρκές flickering σε κάθε κύλιση
    ['scroll', 'click', 'mousemove'].forEach(evt => window.addEventListener(evt, handleActivity, opts));

    // Αρχικό ξεκίνημα
    hideTimeout = setTimeout(() => setVisibility(false), CONFIG.FAB_HIDE_DELAY);
  };
  initMobileFabs();
  // ==========================================
  // ΝΕΟ: ΜΑΓΝΗΤΙΚΟ DRAGGABLE SPEED DIAL (AssistiveTouch) - ΔΙΟΡΘΩΜΕΝΟ
  // ==========================================
  const initDraggableDial = () => {
    const dialWrapper = el('mobile-speed-dial');
    const mainBtn = el('main-master-fab');
    if (!dialWrapper || !mainBtn) return;

    // Λειτουργεί ΜΟΝΟ σε συσκευές αφής (Κινητά / Tablets)
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    let isDragging = false, hasMoved = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    // 1. Πιάνουμε τα Touch events (Απλά καταγράφουμε πού έγινε το ταπ, ΔΕΝ πειράζουμε το CSS ακόμα)
    mainBtn.addEventListener('touchstart', (e) => {
      if (DOM.speedDialMenu?.classList.contains('is-open')) return;

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;

      const rect = dialWrapper.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      hasMoved = false;
      isDragging = false;
    }, { passive: true });

    // 2. Όσο το κουνάει το δάχτυλο
    mainBtn.addEventListener('touchmove', (e) => {
      if (DOM.speedDialMenu?.classList.contains('is-open')) return;

      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // Αν κουνηθεί > 10px ΤΟΤΕ θεωρείται Drag (όχι απλό ταπ).
      // ΕΔΩ αποδεσμεύουμε το CSS για να αρχίσει να σέρνεται!
      if (!hasMoved && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        hasMoved = true;
        isDragging = true;
        
        dialWrapper.style.transition = 'none'; // Ακαριαία κίνηση
        dialWrapper.style.setProperty('bottom', 'auto', 'important');
        dialWrapper.style.setProperty('right', 'auto', 'important');
      }

      // Αν όντως το σέρνει, μετακίνησέ το
      if (isDragging) {
        if (e.cancelable) e.preventDefault(); // Σταματάει το scroll της σελίδας
        
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Όρια: Δεν το αφήνουμε να βγει έξω από την οθόνη (αφήνουμε 10px περιθώριο)
        newLeft = Math.max(10, Math.min(newLeft, window.innerWidth - dialWrapper.offsetWidth - 10));
        newTop = Math.max(10, Math.min(newTop, window.innerHeight - dialWrapper.offsetHeight - 10));

        dialWrapper.style.setProperty('left', `${newLeft}px`, 'important');
        dialWrapper.style.setProperty('top', `${newTop}px`, 'important');
      }
    }, { passive: false });

   mainBtn.addEventListener('touchend', () => {
      if (!isDragging) {
        dialWrapper.style.transition = ''; 
        return;
      }

      dialWrapper.style.setProperty('transition', 'transform 0.8s ease, opacity 0.8s ease, left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s ease', 'important');

      const rect = dialWrapper.getBoundingClientRect();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight; // Μετράει το ύψος ΕΚΕΙΝΗ τη στιγμή, σταθερά
      
      const isMobile = window.innerWidth <= 768;
      const paddingX = isMobile ? 9 : 15;
      const paddingBottom = isMobile ? 12 : 55;

      const centerX = rect.left + (rect.width / 2);
      const isRight = centerX > screenW / 2;
      
      const snapX = isRight ? screenW - rect.width - paddingX : paddingX;
      
      // Υπολογίζουμε πού είναι το "πάτωμα"
      const maxTop = screenH - rect.height - paddingBottom;
      const snapY = Math.max(80, Math.min(rect.top, maxTop));

      dialWrapper.style.setProperty('left', `${snapX}px`, 'important');
      dialWrapper.style.setProperty('top', `${snapY}px`, 'important');

      dialWrapper.classList.toggle('is-snapped-right', isRight);

      // ΣΗΜΑΝΤΙΚΟ: Αποθηκεύουμε στη μνήμη αν το έριξε τέρμα κάτω (με 2px ανοχή)
      const isSnappedToBottom = (snapY >= maxTop - 2);
      
     // Υπολογίζουμε το πραγματικό bottom με βάση το ΣΤΑΘΕΡΟ screenH (όχι αυτό μετά από 400ms)
      const finalBottom = screenH - snapY - rect.height;

      // ΔΙΟΡΘΩΣΗ: Απελευθερώνουμε το hasMoved εδώ, ώστε να μην μπλοκάρει επόμενα legitimate clicks
   setTimeout(() => { isDragging = false; hasMoved = false; }, 400);
      

      // ==========================================
      setTimeout(() => {
          if (!isDragging) {
            dialWrapper.style.setProperty('transition', 'transform 0.8s ease, opacity 0.8s ease', 'important');
            
            if (isSnappedToBottom) {
                // 1. Το πέταξε τέρμα κάτω; Ξηλώνουμε τις εντολές της JavaScript!
                // Έτσι, αναλαμβάνει 100% το αρχικό σου CSS (bottom: 12px) 
                // Το CSS ξέρει από μόνο του να ανεβοκατεβαίνει τέλεια με την μπάρα του browser!
                dialWrapper.style.removeProperty('top');
                dialWrapper.style.removeProperty('bottom');
            } else if (snapY > screenH / 2) {
                // 2. Το άφησε κάπου στη μέση αλλά στο κάτω μισό; 
                // Βάζουμε bottom με το σωστό σταθερό νούμερο.
                dialWrapper.style.setProperty('top', 'auto', 'important');
                dialWrapper.style.setProperty('bottom', `${finalBottom}px`, 'important');
            }
            // 3. Αν το άφησε στο πάνω μισό, παραμένει με 'top' (δεν επηρεάζεται από την μπάρα).
          }
      }, 400);
    });

   // Κοριός (Interceptor): Ακυρώνει το κλικ αν προηγήθηκε σύρσιμο
   // Κοριός (Interceptor): Ακυρώνει το κλικ αν προηγήθηκε σύρσιμο
    mainBtn.addEventListener('click', (e) => {
      if (hasMoved || isDragging) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true); 
    
   // ΔΙΟΡΘΩΣΗ: Αν ο χρήστης περιστρέψει τη συσκευή, σβήνουμε τα καρφωμένα pixels ώστε να το σώσει το CSS
    let initialDeviceWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      // Αγνοούμε τις αλλαγές ύψους (απόκρυψη URL bar στο scroll). Αντιδρούμε ΜΟΝΟ στην περιστροφή της συσκευής!
      if (window.innerWidth === initialDeviceWidth) return; 
      initialDeviceWidth = window.innerWidth;

      if (!isDragging && dialWrapper.style.left) {
        dialWrapper.style.removeProperty('left');
        dialWrapper.style.removeProperty('top');
        dialWrapper.style.removeProperty('bottom');
        dialWrapper.classList.remove('is-snapped-right');
      }
    }, { passive: true });
  };
  initDraggableDial();
// --- Έλεγχος και Εμφάνιση Tooltip ΜΙΑ ΦΟΡΑ ---
  const tooltip = el('fab-welcome-tooltip');
  const tooltipKey = 'has_seen_school_menu_tooltip';

if (tooltip && !localStorage.getItem(tooltipKey)) {
    // 1. Περιμένει 2 δευτερόλεπτα πριν το εμφανίσει
    setTimeout(() => {
      // Διπλός έλεγχος localStorage: Αν ο χρήστης πάτησε το κουμπί μέσα 
      // σε αυτά τα 2 δευτερόλεπτα, ακύρωσε την εμφάνιση εντελώς!
      // Χρήση Optional Chaining (?.) για αποφυγή Fatal Error αν το μενού λείπει
      if (!DOM.speedDialMenu?.classList.contains('is-open') && !localStorage.getItem(tooltipKey)) {
        tooltip.classList.add('show-tooltip');
      }
    }, 2000);

    // 2. Το εξαφανίζει μετά από 12 δευτερόλεπτα (2s delay + 8s ορατό)
    setTimeout(() => {
      tooltip.classList.remove('show-tooltip');
      // Αποθηκεύει ότι το είδαν, ώστε να μην ξαναβγεί ποτέ
      localStorage.setItem(tooltipKey, 'true');
    }, 12000);
  }
// --- Χάρακας Ανάγνωσης (Mouse Tracker) ---
  const rulerMask = document.getElementById('reading-ruler-mask');
  document.addEventListener('mousemove', (e) => {
    // Κουνάει τη μάσκα ΜΟΝΟ αν η λειτουργία είναι ενεργοποιημένη
    if (DOM.html.classList.contains('a11y-ruler') && rulerMask) {
      rulerMask.style.top = `${e.clientY}px`;
    }
  }, { passive: true }); // passive: true για να μην ρίχνει καθόλου την απόδοση (framerate) της σελίδας

// ==========================================
  // ΕΞΥΠΝΟ ΛΕΞΙΚΟ (WIKIPEDIA API & SMART SELECTION)
  // ==========================================
  const glossaryTooltip = document.getElementById('smart-glossary-tooltip');
  
  // ΦΙΛΤΡΟ ΑΚΑΤΑΛΛΗΛΩΝ ΛΕΞΕΩΝ (Μαύρη Λίστα - Ελέγχει ΜΟΝΟ τη Βικιπαίδεια)
  const forbiddenWords = [
   // --- 1. ΤΗΛΕΟΠΤΙΚΑ ΚΑΝΑΛΙΑ & REALITY SHOWS ---
    "mega", "ant1", "skai", "alphatv", "starchannel", "opentv",
    "survivor", "masterchef", "gntm", "my style rocks", "power of love",
    "big brother", "the bachelor", "φαρμα", "shopping star", "first dates",

    // --- 2. POP CULTURE, SOCIAL MEDIA & TRAPPERS (Αποσπούν την προσοχή) ---
    "tiktok", "instagram", "facebook", "trapper", "τραπερ",
    "snik", "σνικ", "light", "λαιτ", "trannos", "τραννος", "fy", 
    "ιλουμινατι", "μασον",

    // --- 4. ΒΙΑ, ΕΓΚΛΗΜΑ, ΟΥΣΙΕΣ & ΤΖΟΓΟΣ (Ρίζες) ---
    "ναρκωτικ", "κοκαι", "ηρωιν", "χασισ", "μαριχουαν",
    "αυτοκτον", // πιάνει: αυτοκτονία
    "δολοφον",  // πιάνει: δολοφόνος
    

    // --- 5. ΕΝΗΛΙΚΟ / ΣΕΞΟΥΑΛΙΚΟ ΠΕΡΙΕΧΟΜΕΝΟ & ΚΑΤΑΧΡΗΣΕΙΣ (Ρίζες) ---
    "πορν",     // πιάνει: πορνό, πορνογραφία
    "ερωτικ",   // πιάνει: ερωτικός (μπλοκάρει "ερωτικές ταινίες" κλπ)

    "στριπτ",   // πιάνει: στριπτίζ
    "εσκορτ",   // πιάνει: escort
  ];

  // Βοηθητική: Αφαιρεί τόνους για σωστότερο έλεγχο
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const closeGlossary = () => {
    if (glossaryTooltip) glossaryTooltip.classList.remove('is-visible');
  };

  // Βοηθητική: Ελέγχει αν το κείμενο που έστειλε η Βικιπαίδεια είναι καθαρό
  const textIsSafe = (text) => {
    if (!text) return true;
    const cleanText = removeAccents(text.toLowerCase());
    return !forbiddenWords.some(badWord => cleanText.includes(badWord));
  };

 // ΔΙΟΡΘΩΣΗ 6: Μεταβλητή μνήμης έξω από τη συνάρτηση (θυμάται την τελευταία λέξη)
  let currentWordRequested = '';

  const fetchDefinition = async (word, x, y) => {
    // ΔΙΟΡΘΩΣΗ 6: Καταγράφουμε ποια λέξη ζήτησε ο χρήστης ΤΩΡΑ
    currentWordRequested = word;

    // Έλεγχος οθόνης αφής (για να πάει 70px πιο πάνω)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const offset = isTouch ? 70 : 10;

    // ΝΕΟΣ ΜΗΧΑΝΙΣΜΟΣ: Ενημερώνει το κείμενο ΚΑΙ υπολογίζει τα όρια της οθόνης
    const updateTooltip = (htmlContent) => {
      glossaryTooltip.innerHTML = htmlContent;
      glossaryTooltip.classList.add('is-visible');

      // 1. Μετράει πόσο χώρο πιάνει το συννεφάκι
      const tWidth = glossaryTooltip.offsetWidth;
      
      // 2. Υπολογίζει τα ασφαλή όρια (αφήνοντας 15 pixels αέρα από τις άκρες του κινητού)
      const minX = (tWidth / 2) + 15; 
      const maxX = window.innerWidth - (tWidth / 2) - 15;
      
      // 3. Το safeX "εγκλωβίζει" το συννεφάκι για να μην βγει ΠΟΤΕ εκτός οθόνης!
      const safeX = Math.max(minX, Math.min(x, maxX));

      glossaryTooltip.style.left = `${safeX}px`;
      glossaryTooltip.style.top = `${y - offset}px`; 
      glossaryTooltip.style.transform = `translate(-50%, -100%)`;
    };

    // Ξεκινάει δείχνοντας την αναζήτηση...
    updateTooltip(`<span class="glossary-loading">⏳ Ψάχνω για "${word}"...</span>`);

    try {
      // 1η προσπάθεια: Ακριβής εύρεση
      const exactRes = await fetch(`https://el.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
      
      if (exactRes.ok) {
        const data = await exactRes.json();
        
        // ΔΙΟΡΘΩΣΗ 6: Αν εν τω μεταξύ μάρκαρε άλλη λέξη, ακυρώνουμε την 1η απάντηση
        if (currentWordRequested !== word) return;

        if (data.extract) {
          if (!textIsSafe(data.extract) || !textIsSafe(data.title)) {
             updateTooltip(`<span class="glossary-error">🛡️ Το περιεχόμενο αποκλείστηκε από το σχολικό φίλτρο.</span>`);
             setTimeout(closeGlossary, 4000);
             return;
          }
          // Φορτώνει το κανονικό κείμενο και κεντράρει ξανά σωστά!
          updateTooltip(`<span class="glossary-title">${data.title}</span>${data.extract}`);
          return;
        }
      }

      // 2η προσπάθεια: Αναζήτηση
      const searchRes = await fetch(`https://el.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(word)}&utf8=&format=json&origin=*`);
      const searchData = await searchRes.json();
      
      // ΔΙΟΡΘΩΣΗ 6: Αν εν τω μεταξύ μάρκαρε άλλη λέξη, ακυρώνουμε τη 2η απάντηση
      if (currentWordRequested !== word) return;

      if (searchData.query && searchData.query.search.length > 0) {
        const bestMatch = searchData.query.search[0];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bestMatch.snippet;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";
        
        if (!textIsSafe(cleanText) || !textIsSafe(bestMatch.title)) {
           updateTooltip(`<span class="glossary-error">🛡️ Το περιεχόμενο αποκλείστηκε από το σχολικό φίλτρο.</span>`);
           setTimeout(closeGlossary, 4000);
           return;
        }

        updateTooltip(`<span class="glossary-title">${bestMatch.title}</span>${cleanText}...`);
      } else {
        updateTooltip(`<span class="glossary-error">❌ Δεν βρέθηκε εξήγηση για "${word}".</span>`);
        setTimeout(closeGlossary, 3000);
      }
    } catch (err) {
      updateTooltip(`<span class="glossary-error">⚠️ Σφάλμα σύνδεσης.</span>`);
      setTimeout(closeGlossary, 3000);
    }
  };


 // Κεντρική συνάρτηση επιλογής
  const handleSelection = () => {
    if (!document.documentElement.classList.contains('a11y-glossary')) return;

    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;

    const selection = window.getSelection();
    
    // Αποτροπή νέας αναζήτησης αν ο χρήστης μαρκάρει κείμενο ΜΕΣΑ στο ήδη ανοιχτό συννεφάκι!
    if (selection.rangeCount > 0 && glossaryTooltip && glossaryTooltip.contains(selection.anchorNode)) return;
    let word = selection.toString().trim();
    word = word.replace(/^[.,:;"'«»()!\?]+|[.,:;"'«»()!\?]+$/g, '');

  if (word.length >= 3 && word.length <= 30 && word.split(/\s+/).length <= 2) {
      if (selection.rangeCount === 0) return; 
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top;

      fetchDefinition(word, x, y);
    } 
    // Το else αφαιρέθηκε. Η αποεπιλογή του κειμένου λόγω αγγίγματος ΜΕΣΑ στο συννεφάκι, 
    // δεν πρέπει να προκαλεί βίαιο κλείσιμο!
  };

  // Η ΛΥΣΗ ΓΙΑ ΤΑ ΚΙΝΗΤΑ: Ακούμε την αλλαγή επιλογής, όχι τα κλικ!
  let selectionTimeout;
  document.addEventListener('selectionchange', () => {
    clearTimeout(selectionTimeout);
    // Περιμένουμε 0.6 δευτερόλεπτα αφού ο χρήστης σταματήσει να πειράζει τους δείκτες επιλογής
    selectionTimeout = setTimeout(handleSelection, 600); 
  });

  // Κλείσιμο του συννεφακίου αν ο χρήστης κάνει ταπ/κλικ στο κενό
  const handleCloseClick = (e) => {
    if (glossaryTooltip && !glossaryTooltip.contains(e.target)) closeGlossary();
  };
  document.addEventListener('mousedown', handleCloseClick);
  document.addEventListener('touchstart', handleCloseClick, { passive: true });



// --- Εξωτερικό Τηλεκοντρόλ Παύσης Κινήσεων (Με ενσωματωμένο "Κοριό" / Monkey Patch) ---
  const applySliderPatch = () => {
    if (window.SliderManager) {
      if (!window.SliderManager._a11yPatched) {
        const originalResume = window.SliderManager.resume;
        window.SliderManager.resume = function(force) {
          if (document.documentElement.classList.contains('a11y-no-animations')) return;
          originalResume.call(this, force);
        };
        window.SliderManager._a11yPatched = true;
      }
      document.documentElement.classList.contains('a11y-no-animations') ? window.SliderManager.pause() : window.SliderManager.resume(true);
    }
  };

  // Ο "κοριός" ΠΡΕΠΕΙ να εγκαθίσταται και κατά τη φόρτωση, ώστε να μπλοκάρει τις κινήσεις 
  // αν η ρύθμιση είχε παραμείνει στο localStorage από προηγούμενη επίσκεψη του χρήστη!
  setTimeout(applySliderPatch, 1500);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#smart-btn-animations');
    if (btn) {
      setTimeout(() => {
        const isPaused = document.documentElement.classList.contains('a11y-no-animations');
        
        // 1. Έλεγχος & "Χάκινγκ" Μεγάλου Slider (Slider 1)
        applySliderPatch();

        // 2. Έλεγχος Mobile Slider (Slider 2 - Κόλπο Fake Hover)
        const mobileSlider = document.getElementById('custom-post-slider-mobile');
        if (mobileSlider) {
          if (isPaused) {
            mobileSlider.dispatchEvent(new Event('mouseenter'));
          } else {
            mobileSlider.dispatchEvent(new Event('mouseleave'));
          }
        }

        // 3. Έλεγχος Marquee
        document.querySelectorAll('marquee').forEach(m => {
          isPaused ? m.stop() : m.start();
        });
      }, 50);
    }
  });

  // Ασπίδα προστασίας για το Mobile Slider όταν σκρολάρει ο χρήστης
  document.addEventListener('touchend', (e) => {
    if (document.documentElement.classList.contains('a11y-no-animations')) {
      const mobileSlider = document.getElementById('custom-post-slider-mobile');
      if (mobileSlider && mobileSlider.contains(e.target)) {
        setTimeout(() => mobileSlider.dispatchEvent(new Event('mouseenter')), 10);
      }
    }
  });
  // ==========================================
  // ΝΕΟ: ΖΩΝΤΑΝΗ ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΣΥΝΔΕΣΜΩΝ (Live Link Previews)
  // ==========================================
  const initLinkPreviews = () => {
    // 1. Λειτουργεί ΜΟΝΟ σε συσκευές με ποντίκι (Desktop/Laptop)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // 2. Δημιουργία του "Συννεφακίου" στο DOM (Φορτώνει μόνο 1 φορά)
    const previewBox = document.createElement('div');
    previewBox.id = 'smart-link-preview';
    previewBox.innerHTML = `
      <div class="preview-loader">⏳ Φόρτωση...</div>
      <iframe class="preview-iframe" src="about:blank" tabindex="-1"></iframe>
    `;
    document.body.appendChild(previewBox);

    const iframe = previewBox.querySelector('.preview-iframe');
    let hoverTimer;
    let currentLink = null;

    // 3. Ακούμε πότε το ποντίκι περνάει πάνω από Links
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('.post-body a, .entry-content a, .main-wrapper a');
      if (!link) return;
      if (e.relatedTarget && link.contains(e.relatedTarget)) return;

      const url = link.href;
      
     // Φίλτρο Ασφαλείας: Μόνο εσωτερικά links, όχι άγκυρες (#), όχι αρχεία.
      if (!url || 
          link.hostname !== window.location.hostname || 
          url.includes('#') || 
          url.match(/\.(jpeg|jpg|gif|png|pdf|zip)$/i)) {
          return;
      }

   // ΝΕΟ: Άμεση απόκρυψη του παλιού συννεφακίου αν το ποντίκι πήγε σε ΔΙΑΦΟΡΕΤΙΚΟ link!
      if (currentLink && currentLink !== link && previewBox.classList.contains('is-visible')) {
          previewBox.classList.remove('is-visible');
          iframe.dataset.url = ''; 
          iframe.src = 'about:blank';
      }

      currentLink = link;
      clearTimeout(hoverTimer);
      if (typeof hidePreviewTimer !== 'undefined') clearTimeout(hidePreviewTimer);

      // 4. Καθυστέρηση Πρόθεσης: Το ποντίκι πρέπει να μείνει 600ms ακίνητο
      hoverTimer = setTimeout(() => {
        if (currentLink !== link) return;

        const rect = link.getBoundingClientRect();
        
        // Υπολογισμός Θέσης (Κάτω δεξιά από το ποντίκι / link)
        let topPos = rect.bottom + window.scrollY + 10;
        let leftPos = rect.left + window.scrollX;
        
        // Προστασία: Αν το συννεφάκι βγαίνει έξω δεξιά, σπρώξτο αριστερά
        if (leftPos + 340 > window.innerWidth) {
            leftPos = window.innerWidth - 360; 
        }
        
        // Προστασία: Αν βγαίνει κάτω από την οθόνη, άνοιξέ το ΠΑΝΩ από το link
        if (rect.bottom + 260 > window.innerHeight) {
            topPos = rect.top + window.scrollY - 250;
        }

        previewBox.style.top = `${topPos}px`;
        previewBox.style.left = `${leftPos}px`;
        
 if (iframe.dataset.url !== url) {
    iframe.dataset.url = url;
    iframe.src = url; // Απολύτως ασφαλές έναντι CORS Exceptions
  }
        previewBox.classList.add('is-visible');
      }, 600); 
    });

   let hidePreviewTimer; // ΠΡΟΣΘΗΚΗ: Χρονόμετρο απόκρυψης

    // 5. Όταν το ποντίκι φεύγει από το link
    document.addEventListener('mouseout', (e) => {
      const link = e.target.closest('.post-body a, .entry-content a, .main-wrapper a');
      if (!link) return;
      if (e.relatedTarget && link.contains(e.relatedTarget)) return;
      
      clearTimeout(hoverTimer);
      currentLink = null;
      
      // Αν το ποντίκι πάει ΜΕΣΑ στο iframe του preview, μην το κλείσεις!
      if (e.relatedTarget && previewBox.contains(e.relatedTarget)) return;

    hidePreviewTimer = setTimeout(() => {
        previewBox.classList.remove('is-visible');
        setTimeout(() => { 
          if (!previewBox.classList.contains('is-visible')) {
            iframe.dataset.url = ''; 
            iframe.src = 'about:blank';
          }
        }, 300);
      }, 150);
    });

    // BUG FIX: Αν το ποντίκι προλάβει να μπει ΜΕΣΑ στο συννεφάκι, ακυρώνουμε το κλείσιμο
    previewBox.addEventListener('mouseenter', () => clearTimeout(hidePreviewTimer));

 // Αν το ποντίκι φύγει εντελώς από το συννεφάκι, κλείστο
    previewBox.addEventListener('mouseleave', () => {
        // Χρήση χρονομετρητή ώστε αν το ποντίκι επιστρέψει στο link, να σωθεί το άνοιγμα!
        hidePreviewTimer = setTimeout(() => {
            previewBox.classList.remove('is-visible');
            setTimeout(() => {
            // Προστέθηκε το απαραίτητο άδειασμα του URL που έλειπε + Fix για CORS
            if (!previewBox.classList.contains('is-visible')) {
                iframe.dataset.url = '';
                iframe.src = 'about:blank'; 
            }
        }, 300);
          }, 150);
    });
  };
  
  // Καθυστερημένη εκκίνηση (1.5s) για να μην βαρύνει το φόρτωμα της κύριας σελίδας
  setTimeout(initLinkPreviews, 1500);
  // ==========================================
  // ΝΕΟ: ΕΞΥΠΝΟΣ ΔΥΝΑΜΙΚΟΣ ΧΑΡΤΗΣ ΑΡΘΡΟΥ (Auto-ToC με ScrollSpy)
  // ==========================================
  const initAutoToC = () => {
    // 1. Βρίσκουμε το κυρίως άρθρο (Το .post-body στον Blogger)
    const article = document.querySelector('.post-body, .entry-content, .main-wrapper');
    if (!article) return;

  // 2. Σκανάρουμε για Επικεφαλίδες (Μόνο H2 και H3)
    const rawHeadings = Array.from(article.querySelectorAll('h2, h3'));
    
    // ΔΙΟΡΘΩΣΗ 7: Αλλαγή από innerText σε textContent για να μην παγώνει τον browser στα κινητά (Layout Thrashing)
    const headings = rawHeadings.filter(h => h.textContent.trim().length > 1 && h.offsetParent !== null);
    
    // 3. Ο ΚΑΝΟΝΑΣ ΤΗΣ ΣΙΩΠΗΣ: Κάτω από 3 τίτλους = Μικρό Άρθρο = Καμία ενέργεια!
    if (headings.length < 3) return;

    // 4. Δημιουργία DOM (Κουμπί & Πάνελ στα Δεξιά)
    const tocWrapper = document.createElement('div');
    tocWrapper.id = 'smart-toc-wrapper';
    tocWrapper.innerHTML = `
      <button id="smart-toc-trigger" title="Χάρτης Άρθρου">
        <span class="toc-icon">📑</span>
        <span class="toc-label">Περιεχόμενα</span>
      </button>
      <nav id="smart-toc-panel">
        <div class="toc-header">
          <span>Περιεχόμενα</span>
          <button id="smart-toc-close" title="Κλείσιμο">&times;</button>
        </div>
        <ul id="smart-toc-list"></ul>
      </nav>
    `;
    document.body.appendChild(tocWrapper);

    const tocList = document.getElementById('smart-toc-list');
    const panel = document.getElementById('smart-toc-panel');
    const trigger = document.getElementById('smart-toc-trigger');
    const closeBtn = document.getElementById('smart-toc-close');
    const tocLinks = [];

    // 5. Φτιάχνουμε τα links και βάζουμε "Άγκυρες" (IDs)
    headings.forEach((heading, index) => {
      // Κατασκευή αόρατου ID αν δεν υπάρχει (για να ξέρει πού να πάει το link)
      if (!heading.id) {
        heading.id = 'smart-toc-heading-' + index;
      }

      const li = document.createElement('li');
      // Ξεχωρίζουμε τα h3 (Υποκεφάλαια) βάζοντας κλάση για css εσοχή
      if (heading.tagName.toLowerCase() === 'h3') {
        li.classList.add('toc-subitem');
      }

      const a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent.trim();
      
    // Ομαλό Σύρσιμο (Smooth Scroll)
      a.addEventListener('click', (e) => {
        e.preventDefault();
        
      // Ενημερώνουμε το URL hash αθόρυβα (ReplaceState), ώστε αν ο χρήστης κάνει 
        // Αντιγραφή του Link από την μπάρα, να σταλεί σωστά το συγκεκριμένο κεφάλαιο!
        if (window.history && window.history.replaceState) {
          // Αντικατάσταση με replaceState για να μην γεμίζει άσκοπα το ιστορικό του κουμπιού "Πίσω"
          window.history.replaceState(null, null, '#' + heading.id);
        }

        // Υπολογισμός θέσης αφήνοντας 80px "αέρα" από πάνω
        const targetPos = heading.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        
        // Στα κινητά κλείνουμε το μενού αμέσως μετά το κλικ για να φανεί το άρθρο
        if (window.innerWidth <= 868) {
           panel.classList.remove('is-open');
           tocWrapper.classList.remove('is-open');
        }
      });

      li.appendChild(a);
      tocList.appendChild(li);
      tocLinks.push({ link: a, heading: heading });
    });

    // 6. Λειτουργίες Ανοίγματος / Κλεισίματος
    const toggleToC = () => {
      panel.classList.toggle('is-open');
      tocWrapper.classList.toggle('is-open');
    };
    trigger.addEventListener('click', toggleToC);
    closeBtn.addEventListener('click', toggleToC);

    // Κλείνει αν κάνεις κλικ έξω από αυτό το μενού
    document.addEventListener('click', (e) => {
      if (panel.classList.contains('is-open') && !tocWrapper.contains(e.target)) {
        panel.classList.remove('is-open');
        tocWrapper.classList.remove('is-open');
      }
    });

   // 7. Ο Κατάσκοπος (ScrollSpy) με IntersectionObserver (Μηδέν lag)!
    const observerOptions = {
      // ΔΙΟΡΘΩΣΗ: Αντικατάσταση του -15% με -81px για να ταυτίζεται με το offset του scroll (80px)
      rootMargin: '-81px 0px -50% 0px', 
      threshold: 0
    };

    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Αφαιρούμε το 'active' από όλα τα links
          tocLinks.forEach(item => item.link.classList.remove('toc-active'));
          
          // Βρίσκουμε το σωστό link και το φωτίζουμε
          const activeItem = tocLinks.find(item => item.heading.id === entry.target.id);
          if (activeItem) activeItem.link.classList.add('toc-active');
        }
      });
    }, observerOptions);

    // Βάζουμε τον Κατάσκοπο να παρακολουθεί όλους τους τίτλους
  // Βάζουμε τον Κατάσκοπο να παρακολουθεί όλους τους τίτλους
    headings.forEach(h => headingObserver.observe(h));

    // ΝΕΟ: Αν το URL περιέχει #hash (π.χ. από κοινοποίηση συνδέσμου), κάνουμε ομαλό scroll 
    // αφού πλέον έχουν δημιουργηθεί τα IDs στον κώδικα!
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetHeading = document.getElementById(targetId);
      if (targetHeading && headings.includes(targetHeading)) {
        setTimeout(() => {
          const targetPos = targetHeading.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }, 100); // Μικρή επιπλέον καθυστέρηση για ακρίβεια θέσης
      }
    }
  };

  // Ξεκινάμε με καθυστέρηση (1s) για να προλάβουν να φορτώσουν τα κείμενα του Blogger!
  setTimeout(initAutoToC, 1000);
})();

// ==========================================
// 8. Global Συναρτήσεις HTML onclick
// ==========================================
window.toggleContactMenu = (e, isMobile) => {
  e?.stopPropagation();
  document.getElementById('lib-options')?.classList.remove('show');
  document.getElementById('search-pop')?.classList.remove('is-open');
  document.getElementById('a11y-menu')?.classList.remove('is-open');
  document.getElementById('share-options')?.classList.remove('show');
  if(isMobile && typeof window.toggleSpeedDial === 'function') window.toggleSpeedDial(true);

  const contactMenu = document.getElementById('contact-options');
  contactMenu?.classList.toggle('mobile-pos', isMobile);
  contactMenu?.classList.toggle('show');
};

window.handleSearchFromLib = (e) => {
  e?.preventDefault();
  e?.stopPropagation();
  document.getElementById('lib-options')?.classList.remove('show');
  document.getElementById('contact-options')?.classList.remove('show');
  document.getElementById('a11y-menu')?.classList.remove('is-open');
document.getElementById('share-options')?.classList.remove('show');
  const sPop = document.getElementById('search-pop');
  if (sPop) {
    const isMobile = window.innerWidth <= 868;
    sPop.classList.toggle('mobile-pos', isMobile);
    sPop.classList.add('is-open');
    if(isMobile && typeof window.toggleSpeedDial === 'function') window.toggleSpeedDial(true);
  }
};
window.triggerContactMenu = (e) => {
  e?.preventDefault();
  const isMobile = window.innerWidth <= 1368; // Το νέο όριο για τις οθόνες
  window.toggleContactMenu(e, isMobile);
  if (!isMobile) window.scrollTo({ top: 0, behavior: 'smooth' });
};
