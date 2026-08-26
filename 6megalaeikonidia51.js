(() => {
  'use strict';
  if (window.self !== window.top) return;

  const initWidget = () => {

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
    
    // ΠΡΟΣΘΗΚΗ: Κλείσιμο του Χάρτη Άρθρου για αποφυγή Overlap στα κινητά!
    const tocPanel = document.getElementById('smart-toc-panel');
    if (tocPanel && tocPanel !== exceptNode) {
      tocPanel.classList.remove('is-open');
      document.getElementById('smart-toc-wrapper')?.classList.remove('is-open');
    }
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
      const isOpening = menuNode.classList.toggle(activeCls);
      
      // ΠΡΟΣΘΗΚΗ: Έξυπνο Auto-Focus στο πεδίο κειμένου
      if (isOpening) {
        const inputField = menuNode.querySelector('input[type="text"], input[type="search"]');
        if (inputField) {
            inputField.focus(); // Σύγχρονη κλήση υποχρεωτική για να ανοίξει το πληκτρολόγιο στα iPhone
            setTimeout(() => inputField.focus(), 100); // Εφεδρεία μετά την ολοκλήρωση του CSS animation
        }
      }
    }
  };

  // ==========================================
  // 4. Events & Listeners
  // ==========================================

  safeBind('search-fab', 'click', (e) => toggleMenu(e, DOM.sPop, false));
  safeBind('search-fab-mob', 'click', (e) => toggleMenu(e, DOM.sPop, true)); // ΠΡΟΣΘΗΚΗ: Ενεργοποιεί την αναζήτηση στα κινητά!
  
  safeBind('a11y-fab', 'click', (e) => toggleMenu(e, DOM.aMenu, false));
  safeBind('a11y-fab-mob', 'click', (e) => toggleMenu(e, DOM.aMenu, true));
  safeBind(DOM.aClose, 'click', () => DOM.aMenu?.classList.remove('is-open'));

  safeBind('lib-fab', 'click', (e) => toggleMenu(e, DOM.libMenu, false, 'show'));
  safeBind('lib-fab-mob', 'click', (e) => toggleMenu(e, DOM.libMenu, true, 'show'));

// Speed Dial Events
  safeBind('main-master-fab', 'click', () => {
    // --- ΠΡΟΣΘΗΚΗ ΔΟΝΗΣΗΣ (Haptic Feedback) ---
    if (navigator.vibrate) navigator.vibrate(10); // Ελαφρύ "τακ" 10ms
    
    closeAllMenus(); // ΠΡΟΣΘΗΚΗ: Κλείνει οποιοδήποτε άλλο μενού ήδη εμφανίζεται στην οθόνη
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
    
    // ΠΡΟΣΘΗΚΗ: Καθαρισμός του Blogger mobile tracker (?m=1) από το URL πριν κοινοποιηθεί
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('m');
    const shareData = { title: document.title, url: cleanUrl.toString() };

    // Σύγχρονη εκτέλεση του fallback (ΠΡΙΝ τα await) αλλιώς το iOS Safari μπλοκάρει
    // την αντιγραφή θεωρώντας ότι χάθηκε το "User Gesture Context"!
  if (!navigator.share && (!navigator.clipboard || !window.isSecureContext)) {
      const textarea = document.createElement('textarea');
      textarea.value = shareData.url;
      textarea.readOnly = true; // Αποτρέπει το άνοιγμα του πληκτρολογίου στα iPhone/iPad
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


 safeBind('btn-do-print', 'click', () => {
    if (DOM.shareMenu) DOM.shareMenu.style.display = 'none'; // Ακαριαία απόκρυψη
    DOM.shareMenu?.classList.remove('show');
    window.print(); 
    setTimeout(() => { if (DOM.shareMenu) DOM.shareMenu.style.display = ''; }, 1000); // Επαναφορά
  });

  safeBind(DOM.aPrint, 'click', () => {
    if (DOM.aMenu) DOM.aMenu.style.display = 'none'; // Ακαριαία απόκρυψη
    DOM.aMenu?.classList.remove('is-open');
    window.print(); 
    setTimeout(() => { if (DOM.aMenu) DOM.aMenu.style.display = ''; }, 1000); // Επαναφορά
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
    
    // ΠΡΟΣΘΗΚΗ: Επανεκκίνηση των JavaScript Animations που είχαν παγώσει
    if (window.SliderManager) window.SliderManager.resume(true);
    const mobileSlider = document.getElementById('custom-post-slider-mobile');
    if (mobileSlider) mobileSlider.dispatchEvent(new Event('mouseleave'));
    document.querySelectorAll('marquee').forEach(m => m.start());

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
    const langListReset = document.getElementById('a11y-lang-list');
    if (langListReset) {
      langListReset.style.display = 'none';
      DOM.aTranslate?.classList.remove('is-active');
     const realCombo = document.querySelector('select.goog-te-combo');
      if (realCombo && realCombo.value) {
        // ΠΡΟΣΘΗΚΗ: Καθαρίζει ριζικά τα cookies και κάνει ασφαλές reload 
        applyLang('el');
      } else if (realCombo) {
        realCombo.value = '';
        realCombo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      }
    }
  });


  const isTtsSupported = 'SpeechSynthesisUtterance' in window;

  // Προστασία: Ακύρωση της φωνής αν ο χρήστης αλλάξει σελίδα, για αποφυγή ανάγνωσης στο παρασκήνιο
  if (isTtsSupported) {
    window.addEventListener('pagehide', () => window.speechSynthesis.cancel());
  }

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
const speech = new SpeechSynthesisUtterance();
    // ΠΡΟΣΘΗΚΗ: Αποθήκευση στο window για την αποτροπή της βίαιης διαγραφής (Garbage Collection)
    window.currentSpeechUtterance = speech; 
    
  const activeLang = document.querySelector('select.goog-te-combo')?.value;
    speech.lang = activeLang ? activeLang : CONFIG.TTS_LANG;
 const article = document.querySelector('.post-body, .entry-content, article');
  
  // ΔΙΟΡΘΩΣΗ: Αφαίρεση του επικίνδυνου fallback (.main-wrapper). Αν δεν βρεθεί άρθρο, σταματάει ασφαλώς στο υπάρχον alert.
  const textToRead = article ? article.innerText : '';

    if (!textToRead || !textToRead.trim()) {
        alert('Δεν βρέθηκε κείμενο άρθρου για ανάγνωση σε αυτή τη σελίδα.');
        return;
    }

    speech.text = textToRead;
    
  // Όταν τελειώσει Ή διακοπεί βίαια η ανάγνωση, το κουμπί επανέρχεται στην αρχική του μορφή
    const resetTtsUI = () => {
      if (window.ttsKeepAlive) clearInterval(window.ttsKeepAlive);
      DOM.aTts.classList.remove('is-active');
      if (btnIcon) btnIcon.innerHTML = '🔊';
    };
    speech.onend = resetTtsUI;
    speech.onerror = resetTtsUI; // ΠΡΟΣΘΗΚΗ: Αποτροπή μόνιμου μπλοκαρίσματος αν αποτύχει η φωνή

    // Ξεκινάμε την ανάγνωση και αλλάζουμε το εικονίδιο σε Stop
    window.speechSynthesis.speak(speech);
    DOM.aTts.classList.add('is-active');
   if (btnIcon) btnIcon.innerHTML = '⏹️';
   
// ΔΙΟΡΘΩΣΗ: Bypass στο Chrome 15s Timeout Bug (Ενεργοποίηση ΜΟΝΟ σε Chromium browsers για αποφυγή βλάβης στο iOS Safari)
   if (window.ttsKeepAlive) clearInterval(window.ttsKeepAlive);
   
   const isChromium = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
   if (isChromium) {
     window.ttsKeepAlive = setInterval(() => {
       if (window.speechSynthesis.speaking) {
        // Προστασία: Αν ο χρήστης έκανε χειροκίνητα παύση, ΜΗΝ το ξεπαγώνεις με το ζόρι!
         if (!window.speechSynthesis.paused) {
           window.speechSynthesis.pause();
           window.speechSynthesis.resume();
         }
       } else {
         clearInterval(window.ttsKeepAlive);
         // ΠΡΟΣΘΗΚΗ: Επαναφορά της εμφάνισης του κουμπιού αν η φωνή διακόπηκε απροσδόκητα
         if (DOM.aTts) {
           DOM.aTts.classList.remove('is-active');
           const btnIcon = DOM.aTts.querySelector('.icon');
           if (btnIcon) btnIcon.innerHTML = '🔊';
         }
       }
     }, 14000);
   }
  });
  
// --- ΝΕΟΣ ΜΗΧΑΝΙΣΜΟΣ GOOGLE TRANSLATE ---
  
  // 1. Αρχικοποίηση του Google Translate Script
  window.googleTranslateElementInit_custom = () => {
    new window.google.translate.TranslateElement({
      pageLanguage: 'el', // Βασική γλώσσα (Ελληνικά)
      autoDisplay: false
    }, 'google_translate_element_custom');
  };

  // ΠΡΟΣΘΗΚΗ: Δυναμική δημιουργία του target element για αποτροπή Fatal Error αν λείπει από το HTML
  if (!document.getElementById('google_translate_element_custom')) {
    const gtCustomDiv = document.createElement('div');
    gtCustomDiv.id = 'google_translate_element_custom';
    gtCustomDiv.style.display = 'none'; // Το κρατάμε αόρατο
    document.body.appendChild(gtCustomDiv);
  }

  const gtScript = document.createElement('script');
  gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit_custom";
  gtScript.async = true;
  document.body.appendChild(gtScript);

 // 2. Συνάρτηση που εφαρμόζει τη γλώσσα (με έξυπνη αναμονή και σωστή επαναφορά)
const applyLang = (lang, retryCount = 0) => {
  if (!lang) return;

if (lang === 'el') {
    // 1. Καθαρίζουμε το cookie του Google Translate
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=." + location.hostname + "; path=/;"; // ΠΡΟΣΘΗΚΗ: Καλύπτει και τα subdomains της Google
    
const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('googtrans'); 
    
    let safeHash = cleanUrl.hash;
    if (safeHash.includes('googtrans')) safeHash = '';
    
    // 3. Επαναφόρτωση με το καθαρό πλέον url
    window.location.assign(cleanUrl.pathname + cleanUrl.search + safeHash);
    return;
  }

  // --- ΔΙΑΧΕΙΡΙΣΗ ΓΙΑ ΤΙΣ ΥΠΟΛΟΙΠΕΣ ΓΛΩΣΣΕΣ ---
  const combo = document.querySelector("select.goog-te-combo");
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    
    // Κλείσιμο της λίστας μετά την επιλογή για ευκολία
    const langList = document.getElementById('a11y-lang-list');
    if (langList) langList.style.display = 'none';
    if (typeof DOM !== 'undefined' && DOM.aTranslate) {
      DOM.aTranslate.classList.remove('is-active');
    }
  } else {
    // Αν δεν έχει φορτώσει ακόμα το select του Google, ξαναδοκιμάζει
    if (retryCount < 10) setTimeout(() => applyLang(lang, retryCount + 1), 500);
  }
};

  // 3. Εμφάνιση / Απόκρυψη του custom μενού
  const handleTranslate = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const langList = document.getElementById('a11y-lang-list');
    if (!langList) return;
    
    const isHidden = langList.style.display !== 'block';
    langList.style.display = isHidden ? 'block' : 'none';
    DOM.aTranslate?.classList.toggle('is-active', isHidden);
  };
  safeBind(DOM.aTranslate, 'click', handleTranslate);

  // 4. Διαχείριση κλικ στις σημαίες
  const langListMenu = document.getElementById('a11y-lang-list');
  if (langListMenu) {
    langListMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('button.a11y-lang-btn');
      if (btn) {
        e.preventDefault();
        applyLang(btn.dataset.lang);
      }
    });
  }

  const handleGlobalOutsideClick = (e) => {
    const t = e.target;
    
    // ΠΡΟΣΘΗΚΗ: Καθαρισμός (κλείσιμο) της λίστας γλωσσών αν ο χρήστης κλείσει το κεντρικό μενού Προσβασιμότητας
    if (DOM.aMenu?.classList.contains('is-open') && !DOM.aMenu.contains(t) && !t.closest('#a11y-fab, #a11y-fab-mob')) {
      DOM.aMenu.classList.remove('is-open');
      const langList = document.getElementById('a11y-lang-list');
      if (langList) langList.style.display = 'none';
      if (DOM.aTranslate) DOM.aTranslate.classList.remove('is-active');
    }
    if (DOM.sPop?.classList.contains('is-open') && !DOM.sPop.contains(t) && !t.closest('#search-fab, #search-fab-mob')) DOM.sPop.classList.remove('is-open');
    if (DOM.contactMenu?.classList.contains('show') && !DOM.contactMenu.contains(t) && !t.closest('#contact-master-fab, #contact-master-fab-mob')) DOM.contactMenu.classList.remove('show');
    if (DOM.libMenu?.classList.contains('show') && !DOM.libMenu.contains(t) && !t.closest('#lib-fab, #lib-fab-mob')) DOM.libMenu.classList.remove('show');
if (DOM.shareMenu?.classList.contains('show') && !DOM.shareMenu.contains(t) && !t.closest('#share-master-fab, #share-master-fab-mob')) DOM.shareMenu.classList.remove('show');
  };

  document.addEventListener('click', handleGlobalOutsideClick);
  // ΣΗΜΑΝΤΙΚΗ ΠΡΟΣΘΗΚΗ: Απεγκλωβίζει τους χρήστες iPhone/iPad
  document.addEventListener('touchstart', handleGlobalOutsideClick, { passive: true });

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
      // ΠΡΟΣΘΗΚΗ: Μην κρύβεις το κουμπί αν ο χρήστης το κρατάει ή το σέρνει!
      if (!show && DOM.speedDialBtn?.classList.contains('is-pressed')) return;

      // 1. Μην κρύβεις τα κουμπιά αν ΟΠΟΙΟΔΗΠΟΤΕ μενού είναι ανοιχτό!
      if (DOM.speedDialMenu?.classList.contains('is-open') ||
          DOM.shareMenu?.classList.contains('show') || 
          DOM.libMenu?.classList.contains('show') || 
          DOM.contactMenu?.classList.contains('show') ||
          DOM.sPop?.classList.contains('is-open') ||
          DOM.aMenu?.classList.contains('is-open')) { // ΠΡΟΣΘΗΚΗ: Προστασία για το Μενού Προσβασιμότητας
          return; 
      }
      
      
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
            // ΔΙΟΡΘΩΣΗ: Αποτροπή βίαιης εμφάνισης στα κινητά κατά το ελαστικό τράβηγμα (iOS Bounce) στον πάτο της σελίδας
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const currentScrollY = Math.max(0, Math.min(window.scrollY || document.documentElement.scrollTop, maxScroll));
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
               setVisibility(true); // ΠΡΟΣΘΗΚΗ: Άμεση και εγγυημένη επαναφορά των κουμπιών στην κορυφή
            }
        } else {
            // Για άλλες ενέργειες (άγγιγμα οθόνης, κλικ, mousemove):
            
            // ΝΕΟ: Αν το κουμπί έχει κρυφτεί ΕΠΕΙΔΗ κατεβαίναμε προς τα κάτω, αγνοούμε το tap!
            if (isHiddenByScrollDown) {
               ticking = false;
               return; 
            }

            // Διαφορετικά (αν ήμασταν σταθεροί, ή είχαμε πάει πάνω και απλά έληξε ο χρόνος):
            // Το tap επαναφέρει το κουμπί κανονικά.
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
    let dragResetTimer; // ΝΕΟ: Ενοποιημένο χρονόμετρο 

// 1. Πιάνουμε τα Touch events (Απλά καταγράφουμε πού έγινε το ταπ, ΔΕΝ πειράζουμε το CSS ακόμα)
   mainBtn.addEventListener('touchstart', (e) => {
      clearTimeout(dragResetTimer); // ΝΕΟ: Ακύρωση της λήξης της προηγούμενης κίνησης αν αγγίξει ξανά
      mainBtn.classList.add('is-pressed'); // ΠΡΟΣΘΗΚΗ: Κλειδώνει το κουμπί όσο πατιέται
      
      // ΠΡΟΣΘΗΚΗ: Εκπομπή τεχνητού mousemove event για να "ξυπνήσει" το Auto-Hide και να μηδενιστούν τα 5 δευτερόλεπτα όσο το κρατάει!
      window.dispatchEvent(new Event('mousemove'));
      
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
        
        // ΔΙΟΡΘΩΣΗ: Προσθήκη 'important' ώστε να αναιρείται επιτυχώς η προηγούμενη CSS κίνηση
        dialWrapper.style.setProperty('transition', 'none', 'important'); 
        dialWrapper.style.setProperty('bottom', 'auto', 'important');
        dialWrapper.style.setProperty('right', 'auto', 'important');
      }

    // ΠΡΟΣΘΗΚΗ: Η αποτροπή του scroll πρέπει να γίνει από το 1ο χιλιοστό, αλλιώς ο browser την ακυρώνει!
      if (e.cancelable) e.preventDefault(); 
      
      // Αν όντως το σέρνει, μετακίνησέ το
      if (isDragging) {
        
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Όρια: Δεν το αφήνουμε να βγει έξω από την οθόνη (αφήνουμε 10px περιθώριο)
        newLeft = Math.max(10, Math.min(newLeft, window.innerWidth - dialWrapper.offsetWidth - 10));
        newTop = Math.max(10, Math.min(newTop, window.innerHeight - dialWrapper.offsetHeight - 10));

        dialWrapper.style.setProperty('left', `${newLeft}px`, 'important');
        dialWrapper.style.setProperty('top', `${newTop}px`, 'important');
      }
    }, { passive: false });

const handleDragEnd = () => {
      mainBtn.classList.remove('is-pressed'); // ΠΡΟΣΘΗΚΗ: Ξεκλειδώνει
      window.dispatchEvent(new Event('mousemove')); // Μηδενίζει το χρονόμετρο για να κρυφτεί κανονικά μετά από 5s
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

      // Ενοποίηση των timers για να αποφευχθεί το race condition σε απανωτά αγγίγματα
      dragResetTimer = setTimeout(() => {
          isDragging = false; 
          hasMoved = false;
          
          if (!isDragging) { // Ο έλεγχος παραμένει για ασφάλεια
            dialWrapper.style.setProperty('transition', 'transform 0.8s ease, opacity 0.8s ease', 'important');
            
            if (isSnappedToBottom) {
                // 1. Το πέταξε τέρμα κάτω; Ξηλώνουμε τις εντολές της JavaScript!
                dialWrapper.style.removeProperty('top');
                dialWrapper.style.removeProperty('bottom');
            } else if (snapY > screenH / 2) {
                // 2. Το άφησε κάπου στη μέση αλλά στο κάτω μισό; 
                dialWrapper.style.setProperty('top', 'auto', 'important');
                dialWrapper.style.setProperty('bottom', `${finalBottom}px`, 'important');
            }
          }
      }, 400);
    }; // Τέλος της handleDragEnd

    // Εφαρμογή ΚΑΙ στη φυσιολογική λήξη (touchend) ΚΑΙ στη βίαιη διακοπή (touchcancel)!
    mainBtn.addEventListener('touchend', handleDragEnd);
    mainBtn.addEventListener('touchcancel', handleDragEnd);

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
        dialWrapper.style.removeProperty('right'); // ΝΕΟ: Διαγραφή του right που έσπαγε την CSS τοποθέτηση!
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
  
      if (!DOM.speedDialMenu?.classList.contains('is-open') && !localStorage.getItem(tooltipKey)) {
        tooltip.classList.add('show-tooltip');
        localStorage.setItem(tooltipKey, 'true'); // ΠΡΟΣΘΗΚΗ: Καταγραφή αμέσως μόλις εμφανιστεί!
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
  
  const updateRuler = (e) => {
    if (DOM.html.classList.contains('a11y-ruler') && rulerMask) {
      // Υποστήριξη τόσο για Ποντίκι (clientY) όσο και για Οθόνες Αφής (touches[0].clientY)
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      rulerMask.style.top = `${y}px`;
    }
  };
  
  document.addEventListener('mousemove', updateRuler, { passive: true });
  document.addEventListener('touchmove', updateRuler, { passive: true }); // ΠΡΟΣΘΗΚΗ: Λειτουργία στα Tablets/Κινητά

// ==========================================
  // ΕΞΥΠΝΟ ΛΕΞΙΚΟ (WIKIPEDIA API & SMART SELECTION)
  // ==========================================
  const glossaryTooltip = document.getElementById('smart-glossary-tooltip');
  
  // ΦΙΛΤΡΟ ΑΚΑΤΑΛΛΗΛΩΝ ΛΕΞΕΩΝ (Μαύρη Λίστα - Ελέγχει ΜΟΝΟ τη Βικιπαίδεια)
  const forbiddenWords = [
   // --- 1. ΤΗΛΕΟΠΤΙΚΑ ΚΑΝΑΛΙΑ & REALITY SHOWS ---
    "mega", "ant1", "skai", "alphatv", "starchannel", "opentv",
    "survivor", "masterchef", "gntm", "my style rocks", "power of love",
    "big brother", "the bachelor", "shopping star", "first dates",

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
    currentWordRequested = ''; // ΠΡΟΣΘΗΚΗ: Καθαρισμός της μνήμης ώστε να ακυρωθούν οι καθυστερημένες αναζητήσεις (fetch)
  };

 // Βοηθητική: Ελέγχει αν το κείμενο που έστειλε η Βικιπαίδεια είναι καθαρό
  const textIsSafe = (text) => {
    if (!text) return true;
    const cleanText = removeAccents(text.toLowerCase());
    return !forbiddenWords.some(badWord => {
      // Χρήση ορίων λέξης (\b) για λατινικούς όρους ώστε να μην μπλοκάρονται π.χ. τα "Megabyte"
      if (/^[a-z]+$/.test(badWord)) {
        return new RegExp(`\\b${badWord}\\b`, 'i').test(cleanText);
      }
      return cleanText.includes(badWord);
    });
  };

let currentWordRequested = '';
  let glossaryTimeout; // ΠΡΟΣΘΗΚΗ: Κεντρική μεταβλητή για το χρονόμετρο

  const fetchDefinition = async (word, x, y) => {
    clearTimeout(glossaryTimeout); // ΠΡΟΣΘΗΚΗ: Ακύρωση του κλεισίματος από προηγούμενες αναζητήσεις

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
    // 3. Το safeX "εγκλωβίζει" το συννεφάκι για να μην βγει ΠΟΤΕ εκτός οθόνης!
      const safeX = Math.max(minX, Math.min(x, maxX));

      glossaryTooltip.style.left = `${safeX}px`;
      glossaryTooltip.style.top = `${y - offset}px`; 
      glossaryTooltip.style.transform = `translate(-50%, -100%)`;
    };

    // Ξεκινάει δείχνοντας την αναζήτηση...
  // Μετατροπή ειδικών συμβόλων (όπως <, >) ώστε να μην εκληφθούν ως HTML κώδικας
    const safeWord = word.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Ξεκινάει δείχνοντας την αναζήτηση...
    updateTooltip(`<span class="glossary-loading">⏳ Ψάχνω για "${safeWord}"...</span>`);

    try {
      // 1η προσπάθεια: Ακριβής εύρεση
      const exactRes = await fetch(`https://el.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
      
      if (exactRes.ok) {
        const data = await exactRes.json();
        
        // ΔΙΟΡΘΩΣΗ 6: Αν εν τω μεταξύ μάρκαρε άλλη λέξη, ακυρώνουμε την 1η απάντηση
        if (currentWordRequested !== word) return;

       if (data.extract) {
          // ΔΙΟΡΘΩΣΗ: Προσθήκη προστασίας των συμβόλων ΚΑΙ στην πρώτη (βασική) απάντηση της Wikipedia
          const safeTitleExact = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeExtractExact = data.extract.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

          if (!textIsSafe(data.extract) || !textIsSafe(data.title)) {
             updateTooltip(`<span class="glossary-error">🛡️ Το περιεχόμενο αποκλείστηκε από το σχολικό φίλτρο.</span>`);
             glossaryTimeout = setTimeout(closeGlossary, 4000);
             return;
          }
          // Φορτώνει το κανονικό κείμενο και κεντράρει ξανά σωστά!
          updateTooltip(`<span class="glossary-title">${safeTitleExact}</span>${safeExtractExact}`);
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
        let cleanText = tempDiv.textContent || tempDiv.innerText || "";
        
        // ΔΙΟΡΘΩΣΗ: Επανα-μετατροπή των συμβόλων ΠΡΙΝ την εισαγωγή στο DOM για αποφυγή σφάλματος HTML/XSS
        cleanText = cleanText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeTitle = bestMatch.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        if (!textIsSafe(cleanText) || !textIsSafe(bestMatch.title)) {
           updateTooltip(`<span class="glossary-error">🛡️ Το περιεχόμενο αποκλείστηκε από το σχολικό φίλτρο.</span>`);
           glossaryTimeout = setTimeout(closeGlossary, 4000);
           return;
        }

        updateTooltip(`<span class="glossary-title">${safeTitle}</span>${cleanText}...`);
   } else {
      updateTooltip(`<span class="glossary-error">❌ Δεν βρέθηκε εξήγηση για "${safeWord}".</span>`);
        glossaryTimeout = setTimeout(closeGlossary, 3000);
      }
    } catch (err) {
      updateTooltip(`<span class="glossary-error">⚠️ Σφάλμα σύνδεσης.</span>`);
   glossaryTimeout = setTimeout(closeGlossary, 3000);
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
    } else if (word.length > 0) {
      // ΠΡΟΣΘΗΚΗ: Κλείσιμο του Λεξικού αν ο χρήστης διευρύνει την επιλογή του δημιουργώντας μεγάλη/άκυρη φράση (Ghost Tooltip Fix)
      closeGlossary();
    }
    // Η αποεπιλογή του κειμένου (word.length === 0) λόγω αγγίγματος ΜΕΣΑ στο συννεφάκι, 
    // συνεχίζει εσκεμμένα να ΜΗΝ προκαλεί βίαιο κλείσιμο!
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
const applySliderPatch = (forceResume = false) => {
    if (window.SliderManager) {
      // ΔΙΟΡΘΩΣΗ: Έλεγχος αν η συνάρτηση resume υπάρχει πραγματικά πριν πειραχτεί (αποφυγή TypeError)
      if (!window.SliderManager._a11yPatched && typeof window.SliderManager.resume === 'function') {
        const originalResume = window.SliderManager.resume;
        window.SliderManager.resume = function(force) {
          if (document.documentElement.classList.contains('a11y-no-animations')) return;
          originalResume.call(this, force);
        };
        window.SliderManager._a11yPatched = true;
      }
   // ΠΡΟΣΘΗΚΗ: Το resume() γίνεται ΜΟΝΟ αν το ζήτησε ρητά ο χρήστης. Αλλιώς ξεπαγώνει βίαια το Slider ενώ το παιδί το στοχεύει.
      if (document.documentElement.classList.contains('a11y-no-animations')) {
         // ΔΙΟΡΘΩΣΗ: Ασφαλής κλήση για να μην παγώσει όλη η σελίδα σε περίπτωση καθυστέρησης φόρτωσης του Slider
         if (typeof window.SliderManager.pause === 'function') window.SliderManager.pause();
      } else if (forceResume === true) {
         if (typeof window.SliderManager.resume === 'function') window.SliderManager.resume(true);
      }
    }
  };
 // αν η ρύθμιση είχε παραμείνει στο localStorage από προηγούμενη επίσκεψη του χρήστη!
  setTimeout(() => {
    applySliderPatch(false);
    
    // ΠΡΟΣΘΗΚΗ: Αν η ρύθμιση είναι ήδη ενεργή κατά τη φόρτωση, παγώνουμε πραγματικά τα κινούμενα στοιχεία
    if (document.documentElement.classList.contains('a11y-no-animations')) {
      const mobileSlider = document.getElementById('custom-post-slider-mobile');
      if (mobileSlider) mobileSlider.dispatchEvent(new Event('mouseenter'));
      document.querySelectorAll('marquee').forEach(m => m.stop());
    }
  }, 1500);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#smart-btn-animations');
    if (btn) {
      setTimeout(() => {
        const isPaused = document.documentElement.classList.contains('a11y-no-animations');
        
        // 1. Έλεγχος & "Χάκινγκ" Μεγάλου Slider (Slider 1)
        applySliderPatch(true);

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

 const previewBox = document.createElement('div');
    previewBox.id = 'smart-link-preview';
    previewBox.innerHTML = `
      <div class="preview-loader">⏳ Φόρτωση...</div>
      <!-- ΠΡΟΣΘΗΚΗ: sandbox (Αποτροπή βίαιης ανακατεύθυνσης) & pointer-events (Αποτροπή απότομου κλεισίματος) -->
      <iframe class="preview-iframe" sandbox="allow-scripts allow-same-origin" style="pointer-events: none;" src="about:blank" tabindex="-1"></iframe>
    `;
    document.body.appendChild(previewBox);

 let iframe = previewBox.querySelector('.preview-iframe');
    let hoverTimer;
    let currentLink = null;

 // 3. Ακούμε πότε το ποντίκι περνάει πάνω από Links
    document.addEventListener('mouseover', (e) => {
      // ΑΦΑΙΡΕΣΗ: Η κλάση .main-wrapper a διαγράφηκε για να μην παρενοχλεί το χρήστη πάνω στα μενού της πλαϊνής μπάρας
      const link = e.target.closest('.post-body a, .entry-content a');
      if (!link) return;
      if (e.relatedTarget && link.contains(e.relatedTarget)) return;

 const url = link.href;
      
      // Αποτροπή Fatal Error αν το link βρίσκεται μέσα σε εικονίδιο/γραφικό SVG
      if (typeof url !== 'string') return;
 // ΠΡΟΣΘΗΚΗ: Έλεγχος ώστε να μπλοκάρονται μόνο οι άγκυρες της ΙΔΙΑΣ σελίδας (αγνοώντας παραμέτρους όπως ?m=1 ή fbclid)
      let isSamePageAnchor = false;
      try {
          const cUrl = new URL(window.location.href);
          const lUrl = new URL(url);
          isSamePageAnchor = !!lUrl.hash && cUrl.pathname === lUrl.pathname && cUrl.origin === lUrl.origin;
      } catch (e) {
          isSamePageAnchor = url.includes('#') && url.split('#')[0] === window.location.href.split('#')[0]; // Fallback
      }

      if (!url || 
          link.hostname !== window.location.hostname || 
          isSamePageAnchor || 
          // ΠΡΟΣΘΗΚΗ: Μπλοκάρισμα εγγράφων Office, πολυμέσων και υποστήριξη URL παραμέτρων (? & #)
          url.match(/\.(jpeg|jpg|gif|png|pdf|zip|doc|docx|xls|xlsx|ppt|pptx|mp3|mp4)(?:[\?#].*)?$/i)) {
          return;
      }

 // ΝΕΟ: Άμεση απόκρυψη του παλιού συννεφακίου αν το ποντίκι πήγε σε ΔΙΑΦΟΡΕΤΙΚΟ link!
      if (currentLink && currentLink !== link && previewBox.classList.contains('is-visible')) {
          previewBox.classList.remove('is-visible');
          // ΠΡΟΣΘΗΚΗ: Αναμονή 300ms για να συγχρονιστεί το άδειασμα με το CSS fade-out (αποφυγή λευκού Flash)
          setTimeout(() => {
              if (!previewBox.classList.contains('is-visible')) {
                  iframe.dataset.url = ''; 
                  if (iframe.contentWindow) {
                      try { iframe.contentWindow.location.replace('about:blank'); } catch(e) { iframe.src = 'about:blank'; }
                  } else {
                      iframe.src = 'about:blank';
                  }
              }
          }, 300);
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
        

        if (rect.left + 340 > window.innerWidth) {
            leftPos = window.scrollX + window.innerWidth - 360; 
        }
        
        // ΠΡΟΣΘΗΚΗ: Διασφαλίζουμε ότι δεν θα βγει ποτέ εκτός οθόνης από τα αριστερά σε μικρά παράθυρα!
        leftPos = Math.max(window.scrollX + 10, leftPos);
        
        // Προστασία: Αν βγαίνει κάτω από την οθόνη, άνοιξέ το ΠΑΝΩ από το link
        if (rect.bottom + 260 > window.innerHeight) {
            topPos = rect.top + window.scrollY - 250;
        }
        
        // ΔΙΟΡΘΩΣΗ: Διασφαλίζουμε ότι το πλαίσιο δεν θα βγει ποτέ ψηλότερα από την αρχή του εγγράφου (ελάχιστο 10px από την κορυφή)
        topPos = Math.max(window.scrollY + 10, topPos);

        previewBox.style.top = `${topPos}px`;
        previewBox.style.left = `${leftPos}px`;
        
if (iframe.dataset.url !== url) {
    const newIframe = document.createElement('iframe');
    newIframe.className = 'preview-iframe';
    newIframe.tabIndex = -1;
    newIframe.sandbox = 'allow-scripts allow-same-origin';
    newIframe.style.pointerEvents = 'none';
    newIframe.dataset.url = url;
    // ΑΦΑΙΡΕΘΗΚΕ Η ΑΠΕΥΘΕΙΑΣ ΑΝΑΘΕΣΗ SRC
    
    // 1. Εισαγωγή του κενού iframe στο DOM
    iframe.replaceWith(newIframe);
    iframe = newIframe;
    
    // 2. Ασφαλής πλοήγηση χωρίς μόλυνση του κεντρικού History (Back Button)
    setTimeout(() => {
        if (iframe.contentWindow) {
            try { iframe.contentWindow.location.replace(url); } catch(e) { iframe.src = url; }
        } else {
            iframe.src = url;
        }
    }, 0);
  }
        previewBox.classList.add('is-visible');
      }, 600); 
    });

   let hidePreviewTimer; // ΠΡΟΣΘΗΚΗ: Χρονόμετρο απόκρυψης

// 5. Όταν το ποντίκι φεύγει από το link
    document.addEventListener('mouseout', (e) => {
      // ΑΦΑΙΡΕΣΗ: Η κλάση .main-wrapper a διαγράφηκε
      const link = e.target.closest('.post-body a, .entry-content a');
      if (!link) return;
      if (e.relatedTarget && link.contains(e.relatedTarget)) return;
      
      clearTimeout(hoverTimer);
      // ΑΦΑΙΡΕΘΗΚΕ: currentLink = null; (η γρήγορη εναλλαγή διαχειρίζεται πλέον αποκλειστικά από το mouseover)
      
      // Αν το ποντίκι πάει ΜΕΣΑ στο iframe του preview, μην το κλείσεις!
      if (e.relatedTarget && previewBox.contains(e.relatedTarget)) return;

    hidePreviewTimer = setTimeout(() => {
        previewBox.classList.remove('is-visible');
        setTimeout(() => { 
          if (!previewBox.classList.contains('is-visible')) {
            iframe.dataset.url = ''; 
          if (iframe.contentWindow) {
        try { iframe.contentWindow.location.replace('about:blank'); } catch(e) { iframe.src = 'about:blank'; }
    } else {
        iframe.src = 'about:blank';
    }
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
               if (iframe.contentWindow) {
        try { iframe.contentWindow.location.replace('about:blank'); } catch(e) { iframe.src = 'about:blank'; }
    } else {
        iframe.src = 'about:blank';
    }
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
    // ΠΡΟΣΘΗΚΗ: Αποτροπή δημιουργίας Χάρτη αν υπάρχουν πολλαπλά άρθρα (π.χ. στην Αρχική Σελίδα ή στις Ετικέτες)
    if (document.querySelectorAll('.post-body, .entry-content').length > 1) return;

    // 1. Βρίσκουμε το κυρίως άρθρο (Το .post-body στον Blogger)
    // ΔΙΟΡΘΩΣΗ: Αφαίρεση του .main-wrapper. Αν δεν υπάρχει καθαρό άρθρο, η λειτουργία πρέπει να σταματάει!
    const article = document.querySelector('.post-body, .entry-content');
    if (!article) return;
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
   if (!heading.id) {

        const safeName = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ]+/g, '-').replace(/^-|-$/g, '');
        heading.id = safeName ? 'toc-' + safeName + '-' + index : 'smart-toc-heading-' + index;
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
      closeAllMenus(panel);
      if (window.innerWidth <= 868 && typeof window.toggleSpeedDial === 'function') {
         window.toggleSpeedDial(true);
      }
      panel.classList.toggle('is-open');
      tocWrapper.classList.toggle('is-open');
    };
    trigger.addEventListener('click', toggleToC);
    closeBtn.addEventListener('click', toggleToC);

   // Κλείνει αν κάνεις κλικ έξω από αυτό το μενού
    const handleTocOutsideClick = (e) => {
      if (panel.classList.contains('is-open') && !tocWrapper.contains(e.target)) {
        panel.classList.remove('is-open');
        tocWrapper.classList.remove('is-open');
      }
    };
    document.addEventListener('click', handleTocOutsideClick);
    document.addEventListener('touchstart', handleTocOutsideClick, { passive: true });

const observerOptions = {
      // ΠΡΟΣΘΗΚΗ: Το margin πρέπει να είναι υποχρεωτικά ΜΙΚΡΟΤΕΡΟ από το offset της κύλισης (80px).
      // Αλλιώς, όταν η σελίδα σταματά στα 80px, το κεφάλαιο βγαίνει εκτός της ζώνης παρακολούθησης!
      rootMargin: '-79px 0px -15% 0px', // Μειώθηκε το κάτω όριο για να εντοπίζει αμέσως τα κεφάλαια στον πάτο της σελίδας
      threshold: 0
    };

   const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(item => item.link.classList.remove('toc-active'));
          const activeItem = tocLinks.find(item => item.heading.id === entry.target.id);
          if (activeItem) activeItem.link.classList.add('toc-active');
     } else if (entry.boundingClientRect.top > 80) {
          // Αν σκρολάρουμε προς τα ΠΑΝΩ, ενεργοποιούμε τον προηγούμενο τίτλο όταν ο τρέχων βγει από την οθόνη
          const index = tocLinks.findIndex(item => item.heading.id === entry.target.id);
          if (index > 0) {
            tocLinks.forEach(item => item.link.classList.remove('toc-active'));
            tocLinks[index - 1].link.classList.add('toc-active');
          }
        }
      });
    }, observerOptions);

  // Βάζουμε τον Κατάσκοπο να παρακολουθεί όλους τους τίτλους
    headings.forEach(h => headingObserver.observe(h));

if (window.location.hash) {
      // Αποκωδικοποίηση (decode) του URL ώστε τα Ελληνικά IDs να αναγνωρίζονται σωστά
      let targetId = '';
      try {
        targetId = decodeURIComponent(window.location.hash.substring(1));
      } catch (e) {
        // Fallback: Αν το URL έχει μολυνθεί από μη έγκυρους χαρακτήρες/trackers, αποφεύγουμε το crash
        targetId = window.location.hash.substring(1);
      }
      const targetHeading = document.getElementById(targetId);
      if (targetHeading && headings.includes(targetHeading)) {
        const doScroll = () => {
          const targetPos = targetHeading.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        };
        // ΠΡΟΣΘΗΚΗ: Αναμονή εγγυημένης φόρτωσης (εικόνες/γραμματοσειρές) αλλιώς η θέση υπολογίζεται λάθος
        if (document.readyState === 'complete') {
          setTimeout(doScroll, 100);
        } else {
          window.addEventListener('load', () => setTimeout(doScroll, 100));
        }
      }
    }
  };
// Απευθείας κλήση, αφού το initWidget τρέχει πλέον με ασφάλεια μετά το DOM
    initAutoToC();
  };

  // Εγγυημένη σύνδεση των κουμπιών αφού φορτώσει πλήρως η σελίδα
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
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
  
  // ΠΡΟΣΘΗΚΗ: Άμεσο κλείσιμο του Χάρτη Άρθρου για αποφυγή επικάλυψης (overlap) στα κινητά
  document.getElementById('smart-toc-panel')?.classList.remove('is-open');
  document.getElementById('smart-toc-wrapper')?.classList.remove('is-open');

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
  
  // ΠΡΟΣΘΗΚΗ: Άμεσο κλείσιμο του Χάρτη Άρθρου για αποφυγή επικάλυψης (overlap) στα κινητά
  document.getElementById('smart-toc-panel')?.classList.remove('is-open');
  document.getElementById('smart-toc-wrapper')?.classList.remove('is-open');

 const sPop = document.getElementById('search-pop');
  if (sPop) {
    const isMobile = window.innerWidth <= 868;
    sPop.classList.toggle('mobile-pos', isMobile);
    sPop.classList.add('is-open');
    
    // ΠΡΟΣΘΗΚΗ: Ίδια λογική Auto-Focus
    const inputField = sPop.querySelector('input[type="text"], input[type="search"]');
    if (inputField) {
        inputField.focus();
        setTimeout(() => inputField.focus(), 100);
    }
    
    if(isMobile && typeof window.toggleSpeedDial === 'function') window.toggleSpeedDial(true);
  }
};
window.triggerContactMenu = (e) => {
  e?.preventDefault();
  const isMobile = window.innerWidth <= 868;
  
  // Ελέγχουμε την κατάσταση του μενού ΠΡΙΝ συμβεί η αλλαγή
  const contactMenu = document.getElementById('contact-options');
  const wasClosed = !contactMenu?.classList.contains('show'); 

  window.toggleContactMenu(e, isMobile);
  
  // Κύλιση στην κορυφή ΜΟΝΟ αν ο χρήστης ΑΝΟΙΓΕΙ το μενού, όχι όταν το κλείνει!
  if (!isMobile && wasClosed) window.scrollTo({ top: 0, behavior: 'smooth' });
};
