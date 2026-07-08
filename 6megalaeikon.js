(function(){
  // Βασικά Στοιχεία & Μενού
  const sPop = document.getElementById('search-pop'),
        aMenu = document.getElementById('a11y-menu'),
        libMenu = document.getElementById('lib-options'),
        contactMenu = document.getElementById('contact-options'),
        aClose = document.getElementById('a11y-close-btn'),
        aReset = document.getElementById('a11y-btn-reset'),
        aPrint = document.getElementById('a11y-btn-print'),
        aTts = document.getElementById('a11y-btn-tts'),
        aTranslate = document.getElementById('a11y-btn-translate'),
        gtContainer = document.getElementById('google_translate_element'),
        aBtns = document.querySelectorAll('.a11y-grid button[data-class]'),
        htmlEl = document.documentElement;

  // Βοηθητική συνάρτηση για το πού ανοίγουν τα μενού
  function toggleMenuPos(menu, isMobile) {
    if(isMobile) { menu.classList.add('mobile-pos'); }
    else { menu.classList.remove('mobile-pos'); }
  }

  // Λειτουργίες Αναζήτησης (Και για τα δύο κουμπιά)
  function handleSearch(e, isMobile) {
    e.stopPropagation();
    toggleMenuPos(sPop, isMobile);
    sPop.classList.toggle('is-open');
  }
  const sFab = document.getElementById('search-fab'), sFabMob = document.getElementById('search-fab-mob');
  if(sFab) sFab.onclick = (e) => handleSearch(e, false);
  if(sFabMob) sFabMob.onclick = (e) => handleSearch(e, true);

  // Λειτουργίες Προσβασιμότητας (Και για τα δύο κουμπιά)
  function handleA11y(e, isMobile) {
    e.stopPropagation();
    toggleMenuPos(aMenu, isMobile);
    aMenu.classList.toggle('is-open');
  }
  const aFab = document.getElementById('a11y-fab'), aFabMob = document.getElementById('a11y-fab-mob');
  if(aFab) aFab.onclick = (e) => handleA11y(e, false);
  if(aFabMob) aFabMob.onclick = (e) => handleA11y(e, true);
  if(aClose) aClose.onclick = () => aMenu.classList.remove('is-open');

  // Λειτουργίες Βιβλιοθήκης (Και για τα δύο κουμπιά)
  function handleLib(e, isMobile) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenuPos(libMenu, isMobile);
    libMenu.classList.toggle('show');
    if(contactMenu) contactMenu.classList.remove('show');
    sPop.classList.remove('is-open');
  }
  const libFab = document.getElementById('lib-fab'), libFabMob = document.getElementById('lib-fab-mob');
  if(libFab) libFab.addEventListener('click', (e) => handleLib(e, false));
  if(libFabMob) libFabMob.addEventListener('click', (e) => handleLib(e, true));

  // Λειτουργία Μοιράσματος (Και για τα δύο κουμπιά)
  function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const shareData = { title: document.title, url: window.location.href };
    if (navigator.share) {
      navigator.share(shareData).catch(function(err) { console.log(err); });
    } else {
      const el = document.createElement('textarea'); el.value = window.location.href;
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
      alert('Ο σύνδεσμος αντιγράφηκε στο πρόχειρο!');
    }
  }
  const shareBtn = document.getElementById('share-master-fab'), shareBtnMob = document.getElementById('share-master-fab-mob');
  if(shareBtn) shareBtn.addEventListener('click', handleShare);
  if(shareBtnMob) shareBtnMob.addEventListener('click', handleShare);

  // Εσωτερικές λειτουργίες Προσβασιμότητας (Εκτύπωση, TTS, κτλ παραμένουν ανέπαφες)
  if (aPrint) { aPrint.onclick = () => { aMenu.classList.remove('is-open'); window.print(); }; }
  if (aTts) {
    const synth = window.speechSynthesis;
    aTts.onclick = () => {
      if (synth.speaking) { synth.cancel(); aTts.classList.remove('is-active'); } 
      else {
        const contentBox = document.querySelector('.post-body, .entry-content, article, main') || document.body;
        const textToRead = contentBox.innerText;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'el-GR';
        utterance.onend = () => { aTts.classList.remove('is-active'); };
        synth.speak(utterance); aTts.classList.add('is-active');
      }
    };
  }

  // MOBILE/ΓΕΝΙΚΟ (το αφήνουμε όπως ήταν)
  if (aTranslate && gtContainer) {
    aTranslate.onclick = () => {
      if (gtContainer.style.display === 'none') {
        gtContainer.style.display = 'block'; aTranslate.classList.add('is-active');
        if (!window.googleTranslateElementInit) {
          window.googleTranslateElementInit = function() { new google.translate.TranslateElement({ pageLanguage: 'el' }, 'google_translate_element'); };
          const script = document.createElement('script'); script.type = 'text/javascript';
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          document.body.appendChild(script);
        }
      } else {
        gtContainer.style.display = 'none'; aTranslate.classList.remove('is-active');
      }
    };
  }

  function applySetting(btn, cls, key, active) {
    if(active) { htmlEl.classList.add(cls); btn.classList.add('is-active'); localStorage.setItem(key, 'true'); } 
    else { htmlEl.classList.remove(cls); btn.classList.remove('is-active'); localStorage.removeItem(key); }
  }

  /* ✅ ΜΟΝΟ ΕΝΑ forEach (έβγαλα το διπλό) */
  aBtns.forEach(btn => {
    const cls = btn.dataset.class, key = btn.dataset.key;
    if(localStorage.getItem(key) === 'true') applySetting(btn, cls, key, true);
    btn.onclick = () => { 
      const isActive = htmlEl.classList.contains(cls); 
      applySetting(btn, cls, key, !isActive); 
    };
  });

  /* ✅ Desktop fix για το click της Μετάφρασης (ΔΕΝ πειράζει mobile) */
  (function fixTranslateDesktopClick(){
    const btn = document.getElementById('a11y-btn-translate');
    const gtContainer = document.getElementById('google_translate_element');
    if (!btn || !gtContainer) return;

    function isDesktop() { return window.matchMedia('(min-width: 1169px)').matches; }

    btn.addEventListener('click', function(e){
      if (!isDesktop()) return;   // mobile untouched
      e.preventDefault();
      e.stopPropagation();

      if (gtContainer.style.display === 'none') {
        gtContainer.style.display = 'block';
        btn.classList.add('is-active');

        if (!window.__gtLoaded) {
          window.__gtLoaded = true;
          window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({ pageLanguage: 'el' }, 'google_translate_element');
          };
          const script = document.createElement('script');
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          document.body.appendChild(script);
        }
      } else {
        gtContainer.style.display = 'none';
        btn.classList.remove('is-active');
      }
    }, true);
  })();

  /* reset */
  aReset.onclick = () => {
    aBtns.forEach(btn => applySetting(btn, btn.dataset.class, btn.dataset.key, false));
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (aTts) aTts.classList.remove('is-active');
    if (gtContainer) { 
      gtContainer.style.display = 'none'; 
      if (aTranslate) aTranslate.classList.remove('is-active'); 
    }
  };

  // Κλείσιμο όλων των μενού αν γίνει κλικ αλλού
  document.addEventListener('click', function(e) {
    if(!aMenu.contains(e.target) && e.target !== aFab && e.target !== aFabMob) aMenu.classList.remove('is-open');
    if(!sPop.contains(e.target) && e.target !== sFab && e.target !== sFabMob) sPop.classList.remove('is-open');
    if (contactMenu && !contactMenu.contains(e.target) && e.target.id !== 'contact-master-fab' && e.target.id !== 'contact-master-fab-mob') contactMenu.classList.remove('show');
    if (libMenu && !libMenu.contains(e.target) && e.target !== libFab && e.target !== libFabMob && (!libFab || !libFab.contains(e.target)) && (!libFabMob || !libFabMob.contains(e.target))) libMenu.classList.remove('show');
  });

})();

// Global Συνάρτηση για το Κουμπί Επικοινωνίας (Τώρα δέχεται και isMobile)
window.toggleContactMenu = function(e, isMobile) {
  e.stopPropagation();
  const contactMenu = document.getElementById('contact-options');
  const libMenu = document.getElementById('lib-options');
  const sPop = document.getElementById('search-pop');

  if(isMobile) { contactMenu.classList.add('mobile-pos'); }
  else { contactMenu.classList.remove('mobile-pos'); }

  contactMenu.classList.toggle('show');
  if(libMenu) libMenu.classList.remove('show');
  if(sPop) sPop.classList.remove('is-open');
};
// Νέα συνάρτηση για το κουμπί "Προγραμματισμός Ραντεβού"
window.triggerContactMenu = function(e) {
  e.preventDefault(); 
  
  // Έλεγχος για το αν είμαστε σε οθόνη κινητού/tablet ή PC
  let isMobileLayout = window.innerWidth <= 1168;
  
  // Άνοιγμα του μενού επικοινωνίας
  window.toggleContactMenu(e, isMobileLayout);

  // Αν είμαστε σε PC, κάνε ομαλή κύλιση (scroll) τέρμα πάνω για να φανεί το μενού
  if (!isMobileLayout) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};
(function() {
    const mobileFabs = [
        'search-fab-mob', 'lib-fab-mob', 'contact-master-fab-mob', 
        'fb-fab-mob', 'yt-fab-mob', 'a11y-fab-mob', 'share-master-fab-mob'
    ];

    let hideTimeout;

    function hideFabs() {
        mobileFabs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('fabs-hidden');
        });
    }

    function showFabs() {
        if (window.innerWidth > 1300) return;

        mobileFabs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('fabs-hidden');
        });

        clearTimeout(hideTimeout);
        // Ο χρόνος τρέχει ΠΑΝΤΑ, ακόμα και αν το άρθρο είναι ανοιχτό
        hideTimeout = setTimeout(hideFabs, 2000);
    }

    // Event Listeners για τη δραστηριότητα του χρήστη
    ['mousedown', 'scroll', 'touchstart', 'click'].forEach(evt => {
        window.addEventListener(evt, showFabs, { passive: true });
    });

    // Επειδή το άρθρο "κλέβει" τα events (stopPropagation), 
    // προσθέτουμε έναν listener ΚΑΙ πάνω στο πλαίσιο του άρθρου αν υπάρχει
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.fetched-content-wrapper')) {
            showFabs(); // Αν σκρολάρει μέσα στο άρθρο, εμφάνισέ τα και ξεκίνα το 4ευρω πάλι
        }
    }, { passive: true });

    // Αρχικό κλείσιμο μετά από 4 δευτερόλεπτα
    hideTimeout = setTimeout(hideFabs, 2000);
})();
window.handleSearchFromLib = function(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // 1. Κλείνει το μενού της βιβλιοθήκης
  document.getElementById('lib-options').classList.remove('show');
  
  // 2. Ανοίγει το search pop (χρησιμοποιώντας την υπάρχουσα λογική)
  const isMobile = window.innerWidth <= 868;
  const sPop = document.getElementById('search-pop');
  
  if(isMobile) { sPop.classList.add('mobile-pos'); }
  else { sPop.classList.remove('mobile-pos'); }
  
  sPop.classList.add('is-open');
};
