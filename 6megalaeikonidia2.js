(() => {
  'use strict';

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

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        alert('Ο σύνδεσμος αντιγράφηκε στο πρόχειρο!');
      } else {
        throw new Error('Fallback Needed');
      }
    } catch (err) {
      if (err.name === 'AbortError') return; 
      const textarea = document.createElement('textarea');
      textarea.value = shareData.url;
      Object.assign(textarea.style, { position: 'fixed', top: '-9999px', left: '-9999px', opacity: '0' });
      DOM.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Ο σύνδεσμος αντιγράφηκε στο πρόχειρο!');
      } catch (copyErr) {
        console.error('Αποτυχία αντιγραφής:', copyErr);
      } finally {
        textarea.remove();
      }
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
   if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
  const speech = new SpeechSynthesisUtterance();
  speech.lang = CONFIG.TTS_LANG; // Είναι ήδη ορισμένο σε 'el-GR'

  safeBind(DOM.aTts, 'click', () => {
    const btnIcon = DOM.aTts.querySelector('.icon');
    
    // Αν ήδη διαβάζει, το σταματάμε
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      DOM.aTts.classList.remove('is-active');
     if (btnIcon) btnIcon.innerHTML = '🔊';
      return;
    }

    // Ψάχνουμε ΜΟΝΟ το κείμενο του άρθρου (κλάση του Blogger)
    // Αν δεν βρει άρθρο, προσπαθεί να διαβάσει το γενικό περιεχόμενο.
    const article = document.querySelector('.post-body, .entry-content, article');
    const textToRead = article ? article.innerText : document.querySelector('.main-wrapper, body').innerText;

    if (!textToRead || !textToRead.trim()) return;

    speech.text = textToRead;
    
    // Όταν τελειώσει η ανάγνωση, το κουμπί επανέρχεται στην αρχική του μορφή
    speech.onend = () => {
      DOM.aTts.classList.remove('is-active');
      if (btnIcon) btnIcon.innerHTML = '🔊';
    };

    // Ξεκινάμε την ανάγνωση και αλλάζουμε το εικονίδιο σε Stop
    window.speechSynthesis.speak(speech);
    DOM.aTts.classList.add('is-active');
   if (btnIcon) btnIcon.innerHTML = '⏹️';
  });

  const handleTranslate = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const proxySelect = document.getElementById('a11y-lang-select');
    if (!proxySelect) return;
    
    const isHidden = proxySelect.style.display === 'none';
    proxySelect.style.display = isHidden ? 'block' : 'none';
    DOM.aTranslate?.classList.toggle('is-active', isHidden);
    
    if (isHidden) {
      const syncLanguages = () => {
        // Ψάχνει να βρει το κρυφό αυθεντικό μενού του άλλου gadget
        const realCombo = document.querySelector('select.goog-te-combo');
        if (realCombo && realCombo.options.length > 0) {
          if (proxySelect.children.length <= 1) { 
            // Αντιγράφει όλες τις γλώσσες στον καθρέφτη μας
            proxySelect.innerHTML = realCombo.innerHTML; 
            proxySelect.value = realCombo.value;
            
            // Όταν επιλέγεις γλώσσα, δίνει την εντολή στο αυθεντικό!
            proxySelect.onchange = (ev) => {
              realCombo.value = ev.target.value;
              realCombo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            };
          }
        } else {
          // Αν δεν έχει προλάβει να φορτώσει η Google, δείχνει αυτό και ξαναπροσπαθεί
          proxySelect.innerHTML = '<option value="">⏳ Φόρτωση γλωσσών...</option>';
          setTimeout(syncLanguages, 500); 
        }
      };
      syncLanguages();
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
  // 7. Auto-hide στο Scroll (Μόνο για το κεντρικό wrapper πλέον)
  // ==========================================
  const initMobileFabs = () => {
    const speedDialWrapper = el('mobile-speed-dial');
    if (!speedDialWrapper) return;

    // ΠΡΟΣΘΗΚΗ: Αν υπάρχει ποντίκι, σταματάμε εδώ και δεν εξαφανίζεται
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      speedDialWrapper.classList.remove('fabs-hidden');
      return;
    }

    let hideTimeout;
    let isVisible = true;
    let ticking = false;

    const setVisibility = (show) => {
      // 1. Μην κρύβεις το κουμπί αν το speed dial μενού είναι ανοιχτό!
      if (DOM.speedDialMenu?.classList.contains('is-open')) return; 
      
      // 2. ΠΡΟΣΘΗΚΗ: Μην κρύβεις το κουμπί αν φαίνεται το συννεφάκι (onboarding)
      const t = el('fab-welcome-tooltip');
      if (!show && t && t.classList.contains('show-tooltip')) return;

      if (isVisible === show) return; 
      isVisible = show;
      speedDialWrapper.classList.toggle('fabs-hidden', !show);
    };

    const handleActivity = () => {
      if (window.innerWidth > CONFIG.BP_MOBILE_LARGE) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisibility(true);
          clearTimeout(hideTimeout);
          hideTimeout = setTimeout(() => setVisibility(false), CONFIG.FAB_HIDE_DELAY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const opts = { passive: true };
  ['scroll', 'touchstart', 'click', 'mousemove'].forEach(evt => window.addEventListener(evt, handleActivity, opts));
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('.fetched-content-wrapper')) handleActivity();
    }, opts);

    hideTimeout = setTimeout(() => setVisibility(false), CONFIG.FAB_HIDE_DELAY);
  };
  initMobileFabs();
// --- Έλεγχος και Εμφάνιση Tooltip ΜΙΑ ΦΟΡΑ ---
  const tooltip = el('fab-welcome-tooltip');
  const tooltipKey = 'has_seen_school_menu_tooltip';

  if (tooltip && !localStorage.getItem(tooltipKey)) {
    // 1. Περιμένει 2 δευτερόλεπτα πριν το εμφανίσει
    setTimeout(() => {
      if (!DOM.speedDialMenu.classList.contains('is-open')) {
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

  const fetchDefinition = async (word, x, y) => {
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

  // Όταν ο χρήστης επιλέγει (μαρκάρει) μια λέξη
 // Κεντρική συνάρτηση επιλογής (Λειτουργεί σε Ποντίκι & Οθόνη Αφής)
  // Κεντρική συνάρτηση επιλογής
  const handleSelection = () => {
    if (!document.documentElement.classList.contains('a11y-glossary')) return;

    const selection = window.getSelection();
    let word = selection.toString().trim();
    word = word.replace(/^[.,:;"'«»()!\?]+|[.,:;"'«»()!\?]+$/g, '');

    if (word.length >= 3 && word.length <= 30 && word.split(/\s+/).length <= 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top;

      fetchDefinition(word, x, y);
    } else {
      closeGlossary();
    }
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
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#smart-btn-animations');
    if (btn) {
      setTimeout(() => {
        const isPaused = document.documentElement.classList.contains('a11y-no-animations');
        
        // 1. Έλεγχος & "Χάκινγκ" Μεγάλου Slider (Slider 1)
        if (window.SliderManager) {
          // Τοποθετούμε τον "Κοριό": Αντικαθιστούμε το resume με δικό μας!
          if (!window.SliderManager._a11yPatched) {
            const originalResume = window.SliderManager.resume; // Κρατάμε το αυθεντικό
            
            // Φτιάχνουμε τον φύλακα
            window.SliderManager.resume = function(force) {
              // Αν το κουμπί είναι πατημένο, ΑΓΝΟΗΣΕ την εντολή εκκίνησης!
              if (document.documentElement.classList.contains('a11y-no-animations')) {
                return; 
              }
              // Αλλιώς, άστο να δουλέψει κανονικά
              originalResume.call(this, force);
            };
            window.SliderManager._a11yPatched = true; // Σημάδι ότι μπήκε ο κοριός
          }

          // Εκτελούμε την παύση ή την εκκίνηση τώρα
          if (isPaused) {
            window.SliderManager.pause();
          } else {
            window.SliderManager.resume(true);
          }
        }

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
})();

// ==========================================
// 8. Global Συναρτήσεις HTML onclick
// ==========================================
window.toggleContactMenu = (e, isMobile) => {
  e?.stopPropagation();
  document.getElementById('lib-options')?.classList.remove('show');
  document.getElementById('search-pop')?.classList.remove('is-open');
  document.getElementById('a11y-menu')?.classList.remove('is-open');
  
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
