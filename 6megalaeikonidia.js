(() => {
  'use strict'; // Ενεργοποίηση αυστηρής λειτουργίας για ταχύτητα στον V8 Engine (Chrome/Safari)

  // ==========================================
  // 1. Ρυθμίσεις & Σταθερές (Configuration)
  // ==========================================
  const CONFIG = {
    BP_DESKTOP: 1169,
    BP_MOBILE_LARGE: 1300,
    BP_MOBILE_MENU: 1168,
    BP_MOBILE_SEARCH: 868,
    FAB_HIDE_DELAY: 2000,
    TTS_LANG: 'el-GR'
  };

  // ==========================================
  // 2. DOM Caching (Εύρεση στοιχείων ΜΟΝΟ 1 φορά)
  // ==========================================
  const el = id => document.getElementById(id);
  
  const DOM = {
    html: document.documentElement,
    body: document.body,
    sPop: el('search-pop'),
    aMenu: el('a11y-menu'),
    libMenu: el('lib-options'),
    contactMenu: el('contact-options'),
    gtContainer: el('google_translate_element'),
    aTts: el('a11y-btn-tts'),
    aTranslate: el('a11y-btn-translate'),
    aReset: el('a11y-btn-reset'),
    aPrint: el('a11y-btn-print'),
    aClose: el('a11y-close-btn'),
    aBtns: document.querySelectorAll('.a11y-grid button[data-class]')
  };

  // ==========================================
  // 3. Βοηθητικές Συναρτήσεις & Κεντρικός Ελεγκτής Μενού
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
      { node: DOM.contactMenu, cls: 'show' }
    ];
    menus.forEach(({ node, cls }) => {
      if (node && node !== exceptNode) node.classList.remove(cls);
    });
  };

  const toggleMenu = (e, menuNode, isMobile, activeCls = 'is-open') => {
    e?.preventDefault();
    e?.stopPropagation();
    
    closeAllMenus(menuNode); // Κλείνει όλα τα υπόλοιπα μενού αυτόματα!
    
    if (menuNode) {
      menuNode.classList.toggle('mobile-pos', isMobile);
      menuNode.classList.toggle(activeCls);
    }
  };

  // ==========================================
  // 4. Ανάθεση Μενού (Event Listeners)
  // ==========================================
  safeBind('search-fab', 'click', (e) => toggleMenu(e, DOM.sPop, false));
  safeBind('search-fab-mob', 'click', (e) => toggleMenu(e, DOM.sPop, true));

  safeBind('a11y-fab', 'click', (e) => toggleMenu(e, DOM.aMenu, false));
  safeBind('a11y-fab-mob', 'click', (e) => toggleMenu(e, DOM.aMenu, true));
  safeBind(DOM.aClose, 'click', () => DOM.aMenu?.classList.remove('is-open'));

  safeBind('lib-fab', 'click', (e) => toggleMenu(e, DOM.libMenu, false, 'show'));
  safeBind('lib-fab-mob', 'click', (e) => toggleMenu(e, DOM.libMenu, true, 'show'));

  // ==========================================
  // 5. Κοινοποίηση (Modern Async/Await Web Share API)
  // ==========================================
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
      if (err.name === 'AbortError') return; // Αγνόησε αν ο χρήστης απλά ακύρωσε στο κινητό
      
      // Απόλυτα αόρατο Fallback (χωρίς layout shifts & τρέμουλο)
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
  safeBind('share-master-fab', 'click', handleShare);
  safeBind('share-master-fab-mob', 'click', handleShare);

  // ==========================================
  // 6. Λειτουργίες Προσβασιμότητας (A11y & LocalStorage)
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
    DOM.aTts?.classList.remove('is-active');
    if (DOM.gtContainer) {
      DOM.gtContainer.style.display = 'none';
      DOM.aTranslate?.classList.remove('is-active');
    }
  });

  // Text-To-Speech (Βελτιστοποιημένη Ανάγνωση χωρίς κομπιάσματα)
  if (DOM.aTts && 'speechSynthesis' in window) {
    const synth = window.speechSynthesis;
    safeBind(DOM.aTts, 'click', () => {
      if (synth.speaking || synth.pending) {
        synth.cancel();
        DOM.aTts.classList.remove('is-active');
      } else {
        const contentBox = document.querySelector('.post-body, .entry-content, article, main') || DOM.body;
        const cleanText = contentBox.innerText.replace(/\s+/g, ' ').trim(); // Καθαρισμός διπλών κενών/γραμμών
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = CONFIG.TTS_LANG;
        
        utterance.onend = () => DOM.aTts.classList.remove('is-active');
        utterance.onerror = () => DOM.aTts.classList.remove('is-active'); // Προστασία αν "σκάσει" το API της συσκευής
        
        synth.speak(utterance);
        DOM.aTts.classList.add('is-active');
      }
    });
  }

  // Google Translate (Ασύγχρονο Lazy Load)
  const handleTranslate = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!DOM.gtContainer) return;

    const isHidden = DOM.gtContainer.style.display === 'none' || !DOM.gtContainer.style.display;
    DOM.gtContainer.style.display = isHidden ? 'block' : 'none';
    DOM.aTranslate?.classList.toggle('is-active', isHidden);

    if (isHidden && !window.__gtLoaded) {
      window.__gtLoaded = true;
      window.googleTranslateElementInit = () => {
        new google.translate.TranslateElement({ pageLanguage: 'el' }, 'google_translate_element');
      };
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true; // Non-blocking!
      DOM.body.appendChild(script);
    }
  };
  safeBind(DOM.aTranslate, 'click', handleTranslate);

  // ==========================================
  // 7. Global Click (Κλείσιμο μενού αν πατηθεί κλικ αλλού)
  // ==========================================
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (DOM.aMenu?.classList.contains('is-open') && !DOM.aMenu.contains(t) && !t.closest('#a11y-fab, #a11y-fab-mob')) DOM.aMenu.classList.remove('is-open');
    if (DOM.sPop?.classList.contains('is-open') && !DOM.sPop.contains(t) && !t.closest('#search-fab, #search-fab-mob')) DOM.sPop.classList.remove('is-open');
    if (DOM.contactMenu?.classList.contains('show') && !DOM.contactMenu.contains(t) && !t.closest('#contact-master-fab, #contact-master-fab-mob')) DOM.contactMenu.classList.remove('show');
    if (DOM.libMenu?.classList.contains('show') && !DOM.libMenu.contains(t) && !t.closest('#lib-fab, #lib-fab-mob')) DOM.libMenu.classList.remove('show');
  });

  // ==========================================
  // 8. Υπερ-Βελτιστοποιημένα Mobile FABs (Scroll Logic)
  // ==========================================
  const initMobileFabs = () => {
    const fabIds = ['search-fab-mob', 'lib-fab-mob', 'contact-master-fab-mob', 'fb-fab-mob', 'yt-fab-mob', 'a11y-fab-mob', 'share-master-fab-mob'];
    const mobileFabs = fabIds.map(el).filter(Boolean); // Κρατάει μόνο όσα υπάρχουν στο HTML
    
    if (!mobileFabs.length) return;

    let hideTimeout;
    let isVisible = true;
    let ticking = false;

    const setVisibility = (show) => {
      if (isVisible === show) return; // Επέμβαση στο DOM ΜΟΝΟ αν αλλάξει η κατάσταση
      isVisible = show;
      mobileFabs.forEach(fab => fab.classList.toggle('fabs-hidden', !show));
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

    // { passive: true } Λέει στον browser να σκρολάρει ακαριαία, αγνοώντας το script!
    const opts = { passive: true };
    ['scroll', 'touchstart', 'click'].forEach(evt => window.addEventListener(evt, handleActivity, opts));
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('.fetched-content-wrapper')) handleActivity();
    }, opts);

    // Αρχική απόκρυψη κατά το φόρτωμα
    hideTimeout = setTimeout(() => setVisibility(false), CONFIG.FAB_HIDE_DELAY);
  };

  initMobileFabs();

})();

// ==========================================
// 9. Global Συναρτήσεις (Για HTML onclick="" attributes)
// ==========================================
window.toggleContactMenu = (e, isMobile) => {
  e?.stopPropagation();
  // Εδώ κλείνουμε χειροκίνητα τα άλλα, καθώς αυτά ανοίγουν από onclick στο HTML
  document.getElementById('lib-options')?.classList.remove('show');
  document.getElementById('search-pop')?.classList.remove('is-open');
  
  const contactMenu = document.getElementById('contact-options');
  contactMenu?.classList.toggle('mobile-pos', isMobile);
  contactMenu?.classList.toggle('show');
};

window.triggerContactMenu = (e) => {
  e?.preventDefault();
  const isMobile = window.innerWidth <= 1168; // CONFIG.BP_MOBILE_MENU
  window.toggleContactMenu(e, isMobile);
  if (!isMobile) window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.handleSearchFromLib = (e) => {
  e?.preventDefault();
  e?.stopPropagation();
  document.getElementById('lib-options')?.classList.remove('show');
  document.getElementById('contact-options')?.classList.remove('show');
  document.getElementById('a11y-menu')?.classList.remove('is-open');

  const sPop = document.getElementById('search-pop');
  if (sPop) {
    sPop.classList.toggle('mobile-pos', window.innerWidth <= 868); // CONFIG.BP_MOBILE_SEARCH
    sPop.classList.add('is-open');
  }
};
