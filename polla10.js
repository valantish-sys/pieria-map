import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, runTransaction, get, goOffline, goOnline } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ==========================================
// 2. Η ΚΟΙΝΗ ΣΥΝΔΕΣΗ FIREBASE (Έξω από τα κουτιά)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCttOvFgyR8YjqKH7eXdTppKhpk8yZwZ1E",
  authDomain: "blogreactions-67b67.firebaseapp.com",
  databaseURL: "https://blogreactions-67b67-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "blogreactions-67b67",
  storageBucket: "blogreactions-67b67.firebasestorage.app",
  messagingSenderId: "277069394931",
  appId: "1:277069394931:web:ddda8ab07bcf106dec1886"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Αυτό το 'db' είναι πλέον το "κοινό εργαλείο" μας!

;(() => {
  "use strict";
  // slide83
  
  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  const CONFIG = Object.freeze({
    feedUrl: "https://dimperist.blogspot.com/feeds/posts/default?alt=json&max-results=106",
    pinnedPostPath: "/2026/06/12.html",
    scriptUrl: "https://script.google.com/macros/s/AKfycbx2gHWrrA3A0MjsQLz30e3NFSpr6BzorfRf08ZR_v5of87VcgQjNSJJ_Re0ivyZYcLTxA/exec",
    reactionHideDelay: 5400,
    sliderNormalDuration: 5000,
    sliderPinnedDuration: 8000
  });

  const DEFAULT_IMAGES = Object.freeze([
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFiu4dVYlPwxK3xtwKSurxCvPBaryI-jgcqysrU2BrKHbxlVOOKiZUT-v7wTK8UbMCfzNUjbA7aNk1e51z093ft3yC6_GkBbHu4I1-3DaxdfK-gbuzazZ0HNSBjrJ2gM_4GBBrRyFabK23uIZmXwgaezpRieBPTBWCE4pCm6kal9nAGG_5wAOsbIR7_Q8/s320/Gemini_Generated_Image_kj2jlbkj2jlbkj2j.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEicnwcf5MtSIS5zph5DxV7oJnr5y7Boimib6Wpq4NGfyLvr7xCU6bU3muKSFERVBVYj0BzVBzI0JORWKuJkbLo4YrCE9S4Efu2Q3MyvOtMtX7ZfIyoZGQ5kqQLHh3ZvjQfaP6xx-RYwEshSLmLnsQxGKnbJnNmJVbVi4JaG-SvM-knJzZWTZ7Y7XreDlME/s320/Gemini_Generated_Image_y8h9zxy8h9zxy8h9.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRiqsHKDiJK_tfJo5VAqpx_s1wASZGYnSNQDfhhFEDYNowBmPGAfUQMjlTTsJSK8Rvg_aL7RSiCgc7Edx6z8W-UnB3jS_8Z5BtW2-K7gkr4dUlOCt7Q1b-n4xGJk86OzxPsWFyymq0AuIEKNcaDKp36RcnUxdcQyF-JtQDQuojBqc_2okh9-w0Bd9o1aM/s320/Gemini_Generated_Image_pa075bpa075bpa07.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh98wnzkmN_Kry_Uvi_NfprZD7n9yq85Pn-ywWbjNMNQ6X7opEGMo3p5C3L5hX9qTRIEXFaRux56pMptwV7Zg-n9nNSWcfpmYBxZ2TfS2ojJHc5gZjd-IZ5ki2jGu8FIcRKUzFSulm8Ac-pVIIe9HTRxHgSg4eso3TjvxW8tAZByBYZNVLFft7EBo7T-H0/s320/Gemini_Generated_Image_ox9wwxox9wwxox9w.png"
  ]);

  const STATE = {
    isTouchDevice: false,
    isPausedByTitle: false,
    isDragging: false,
    wasDragged: false
  };

const REGEX = Object.freeze({

   YT: /(?:embed\/|v=|youtu\.be\/|vi\/|\/v\/|e\/|shorts\/|live\/|watch\?v=)([^#\&\?]{11})/,
    YT_IMG: /img\.youtube\.com\/vi\/([a-zA-Z0-9_-]{11})/,
    IMG_SIZE: /\/(w\d+-h\d+|s\d+)[^\/]*\//,
    FB: /facebook\.com\/(?:plugins\/video|video)/
  });

  const PASSIVE = { passive: true };

  window.addEventListener('touchstart', () => { STATE.isTouchDevice = true; }, { passive: true });
  window.addEventListener('pointermove', (e) => { 
    if (e.pointerType === 'mouse') STATE.isTouchDevice = false; 
  }, { passive: true });

  // 2. Το απόλυτο Haptic Unlocker (Ξεγελάει τα Security Policies του Chrome)
  const unlockHaptics = () => {
    if (navigator.vibrate) navigator.vibrate(2); // Το 2ms καταγράφεται αξιόπιστα από το σύστημα
    
    // Καθαρισμός μνήμης μόλις πιάσει το πρώτο άγγιγμα
    ['click', 'pointerdown', 'touchend'].forEach(evt => 
      window.removeEventListener(evt, unlockHaptics)
    );
  };
  
  // Δένουμε τον "ξεκλειδωτή" σε πολλαπλά events για να "αρπάξουμε" την πρώτη επαφή
  ['click', 'pointerdown', 'touchend'].forEach(evt => 
    window.addEventListener(evt, unlockHaptics, { passive: true })
  );

 // ==========================================
  // 2. UTILS & HELPERS
  // ==========================================
  
  // --- ΝΕΑ ΠΡΟΣΘΗΚΗ: Ορίζουμε τη λογική έξω για εξοικονόμηση μνήμης ---
  const fallbackLogic = function(e) {
    if (this.src.includes('maxresdefault.jpg') && (this.naturalWidth <= 120 || e?.type === 'error')) {
      this.src = this.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
    }
  };

  const Utils = {
    getRandomImg: () => DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],

    upscaleImgUrl: (url) => {
      if (!url || REGEX.FB.test(url)) return Utils.getRandomImg();
      if (url.includes('img.youtube.com')) return url.replace('hqdefault.jpg', 'maxresdefault.jpg');
      if (REGEX.IMG_SIZE.test(url)) {
        return url.replace(REGEX.IMG_SIZE, window.innerWidth <= 868 ? '/s800-rw/' : '/s1600-rw/');
      }
      return url;
    },

    getThumbnailUrl: (url) => {
      if (!url || url.includes('facebook.com')) return url;
      if (url.includes('img.youtube.com')) return url.replace('maxresdefault.jpg', 'hqdefault.jpg');
      if (REGEX.IMG_SIZE.test(url)) return url.replace(REGEX.IMG_SIZE, '/s150-c-rw/');
      return url;
    },

    // --- Η ΔΙΟΡΘΩΣΗ: Απλά καλεί την εξωτερική συνάρτηση ---
    handleImageFallback: (imgEl) => {
      imgEl.onload = fallbackLogic;
      imgEl.onerror = fallbackLogic;
    },

    extractData: (htmlStr) => {
      if (!htmlStr) return { imgs: [Utils.getRandomImg()], text: "", widgetHtml: null };
      
      const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
      
      // ΝΕΟ: Ελέγχει αν υπάρχει το widget. Αν όχι, συνεχίζει 100% κανονικά για τα παλιά posts!
      let widgetHtml = null;
      const widgetNode = doc.querySelector('.smart-widget');
      if (widgetNode) {
          widgetHtml = widgetNode.innerHTML; // Διαβάζει το μενού ΜΑΖΙ με το <style> του
          widgetNode.remove(); // Το κρύβει για να μην το διαβάσει ως απλό κείμενο η ανάρτηση
      }

     // Αποκλεισμός των αόρατων (1x1) tracking pixels του Blogger
      const imgs = Array.from(doc.images)
        .filter(img => img.getAttribute('width') !== '1' && img.getAttribute('height') !== '1' && !img.src.includes('tracker') && !img.src.includes('feedburner'))
        .map(img => img.src)
        .filter(Boolean);
      
      doc.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src || '';
        const match = src.match(REGEX.YT);
        if (match?.[1]) imgs.push(`https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`);
        else if (REGEX.FB.test(src)) imgs.push(src); 
      });
      
      doc.querySelectorAll('style, script').forEach(el => el.remove());
      
      doc.querySelectorAll('a').forEach(a => {
        const txt = a.textContent.trim();
        if (txt) a.replaceWith(`[[[${txt}]]]`);
      });
      
      // --- ΝΕΑ ΠΡΟΣΘΗΚΗ ΓΙΑ ΤΑ ΚΕΝΑ ΣΤΟ ΚΕΙΜΕΝΟ ---
      doc.querySelectorAll('br, p, div, h1, h2, h3, h4, li, blockquote').forEach(el => {
          el.insertAdjacentText('afterend', ' ');
      });
      const fullText = (doc.body.textContent || "").replace(/\s+/g, ' ').trim();
      
      return { 
        imgs: imgs.length ? imgs : [Utils.getRandomImg()], 
        text: fullText,
        widgetHtml: widgetHtml
      };
    },

   buildSafeTextNodes: (text, containerEl) => {
      containerEl.textContent = ''; 
      
      let safeText = text || '';
      
      // 1. Μετράμε πόσα [[[ άνοιξαν και πόσα ]]] έκλεισαν στο συγκεκριμένο κομμάτι κειμένου
      const openCount = (safeText.match(/\[\[\[/g) || []).length;
      const closeCount = (safeText.match(/\]\]\]/g) || []).length;

      // 2. Αν λείπει το κλείσιμο (γιατί κόπηκε από το "..." του slider)
      if (openCount > closeCount) {
        if (safeText.endsWith('...')) {
          safeText = safeText.slice(0, -3) + ']]]...';
        } else {
          safeText += ']]]';
        }
      } 
      // 3. Αν λείπει το άνοιγμα (γιατί είναι η συνέχεια του link στο επόμενο slide κειμένου)
      else if (closeCount > openCount) {
        safeText = '[[[' + safeText;
      }

      // 4. Προχωράμε κανονικά στον διαχωρισμό (τώρα πια είναι ασφαλές και ισορροπημένο)
      const parts = safeText.split(/\[\[\[(.*?)\]\]\]/g);
      const fragment = document.createDocumentFragment();
      
      parts.forEach((part, idx) => {
        if (!part) return;
        if (idx % 2 === 1) { 
          const span = Object.assign(document.createElement('span'), { className: 'fake-link', textContent: part });
          fragment.appendChild(span);
        } else {
          // Καθαρίζουμε αθόρυβα τυχόν σπασμένα brackets αν ξέμειναν ποτέ σε απλό κείμενο
          const cleanPart = part.replace(/\[\[\[|\]\]\]/g, '');
          fragment.appendChild(document.createTextNode(cleanPart));
        }
      });
      
      containerEl.appendChild(fragment);
    },

    forceReflow: (el) => { void el.offsetWidth; },

    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => { inThrottle = false; }, limit);
        }
      };
    }
  };

const NavManager = {
    init: () => {
      const nav = document.querySelector('nav');
      if (!nav) return;
      
      let ticking = false;
      let lastScrollY = window.scrollY; // ΝΕΟ: Αποθηκεύει την προηγούμενη θέση
      let isScrollingDown = false;      // ΝΕΟ: Θυμάται αν ο χρήστης κατεβαίνει
      
      let idleTimeout;
      const resetIdleTimer = Utils.throttle(() => {
        // Αν ο χρήστης έχει κάνει scroll κάτω, η κίνηση του ποντικιού ΔΕΝ εμφανίζει το μενού
        if (isScrollingDown && window.scrollY > 350) return;

       nav.classList.remove('nav-hidden-active');
     clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          // ΔΙΟΡΘΩΣΗ: Στα κινητά ακυρώνουμε τον έλεγχο :hover διότι κολλάει μόνιμα μετά το πρώτο tap
          const isHovered = STATE.isTouchDevice ? false : nav.matches(':hover');
          if (!isHovered && !nav.contains(document.activeElement)) {
            document.querySelector('.nav-fixed')?.classList.add('nav-hidden-active');
          }
        }, 2000);
      }, 200);

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const isScrolled = currentScrollY > 350;
            
            nav.classList.toggle('nav-fixed', isScrolled);
            document.body.classList.toggle('nav-is-fixed', isScrolled);

            if (isScrolled) {
              if (currentScrollY > lastScrollY) {
                // Scroll ΠΡΟΣ ΤΑ ΚΑΤΩ: Κρύβουμε το μενού αμέσως για ελεύθερο διάβασμα
                isScrollingDown = true;
                nav.classList.add('nav-hidden-active');
                clearTimeout(idleTimeout); // Σταματάμε το χρονόμετρο 
              } else if (currentScrollY < lastScrollY) {
                // Scroll ΠΡΟΣ ΤΑ ΠΑΝΩ: Εμφανίζουμε ξανά το μενού
                isScrollingDown = false;
                resetIdleTimer();
              }
            } else {
              // Αν ανέβουμε πάνω από τα 350px (αρχή σελίδας), ακυρώνουμε την απόκρυψη
              isScrollingDown = false;
              nav.classList.remove('nav-hidden-active');
            }

           // Ενημέρωση θέσης (το <= 0 αποτρέπει λάθη με το bounce του Safari στα iPhone)
            lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
            ticking = false;
          
          });
          ticking = true;
        }
      }, PASSIVE);

      // ΣΗΜΑΝΤΙΚΟ: Αφαιρέθηκε η λέξη 'scroll' από εδώ, για να μην συγκρούεται με τη νέα λογική
      ['mousemove', 'touchstart', 'keydown'].forEach(evt => 
        window.addEventListener(evt, resetIdleTimer, PASSIVE)
      );

      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
          document.querySelectorAll('.dropdown-content, .sub-dropdown-content').forEach(d => {
            d.style.display = 'none';
            setTimeout(() => { d.style.display = ''; }, 100);
          });
          resetIdleTimer();
        }
      });
      resetIdleTimer();
    }
  };

  // ==========================================
  // 4. REACTIONS MANAGER (FIREBASE EDITION)
  // ==========================================
  const ReactionsManager = {
    observer: new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
      if (entry.isIntersecting) {
          const rDiv = entry.target;
          observer.unobserve(rDiv);
          rDiv.dataset.fetched = 'true'; // ΝΕΟ: Σφραγίδα ότι τα δεδομένα κατέβηκαν επιτυχώς
          
         const postId = rDiv.dataset.postid;
          if (!postId) return; // Ασφαλής προσπέραση και αποτροπή κατάρρευσης 
          const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
          
        
    const postRef = ref(db, 'reactions/' + safePostId);

       // Βοηθητική συνάρτηση για την ενημέρωση του UI
       const updateUI = (snapshot) => {
         // Η ανάγνωση πρέπει να αποτρέπεται ΜΟΝΟ αν ο χρήστης ψηφίζει εκείνη τη στιγμή.
         if (rDiv.classList.contains('is-voting')) return; 
         
         let d = { love: 0, funny: 0, wow: 0 };
         if (snapshot && typeof snapshot.val === 'function') {
             d = snapshot.val() || d;
         }
         // Βάζουμε if () για προστασία αν το HTML της διαφάνειας καταστραφεί/αλλάξει στο ενδιάμεσο
         const sLove = rDiv.querySelector('.count-love'); if (sLove) sLove.textContent = d.love || 0;
         const sFunny = rDiv.querySelector('.count-funny'); if (sFunny) sFunny.textContent = d.funny || 0;
         const sWow = rDiv.querySelector('.count-wow'); if (sWow) sWow.textContent = d.wow || 0;
       };

       // Έξυπνος μηχανισμός Retry (Προσπαθεί για 8 δευτερόλεπτα)
       const fetchReactions = async (attempts = 0) => {
           try {
               // Αν η Firebase δεν απαντήσει σε 2 δευτερόλεπτα, πετάει Timeout
               const snapshot = await Promise.race([
                   get(postRef),
                   new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
               ]);
               updateUI(snapshot);
           } catch (err) {
               if (attempts < 3) {
                   // Αν απέτυχε, ξαναπροσπαθεί αμέσως (Σύνολο 4 προσπάθειες x 2 δευτ. = 8 δευτερόλεπτα)
                   fetchReactions(attempts + 1);
               } else {
                   console.warn(`Κόλλησε η επικοινωνία στο slider για το άρθρο ${safePostId}. Επαναφορά Firebase (Hard Reset)...`);
                   
                   // 1. Κλείνει βίαια τη σύνδεση του browser με τη Firebase
                   goOffline(db);
                   
                   setTimeout(() => {
                       // 2. Επαναφέρει τη σύνδεση αναγκάζοντας τη Firebase να συνδεθεί από το μηδέν
                       goOnline(db);
                       
                       // 3. Τελευταία απεγνωσμένη προσπάθεια μετά την επανασύνδεση
                       Promise.race([
                           get(postRef),
                           new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
                       ]).then(updateUI).catch(() => updateUI(null)); 
                   }, 1000);
               }
           }
       };

       fetchReactions(); // Εκκίνηση του μηχανισμού
        }
      });
    }, { rootMargin: '50px 0px', threshold: 0.1 }),
    
   handleVote: (btn) => {
      const rDiv = btn.closest('.floating-reactions');
      if (!rDiv || rDiv.classList.contains('is-voting') || rDiv.classList.contains('voted')) return;
      
    const postId = rDiv.dataset.postid;
          if (!postId) return; // Ασφαλής προσπέραση και αποτροπή κατάρρευσης 
          const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
      const type = btn.dataset.type;
      const countSpan = btn.querySelector('span:last-child');
      
      // Αποθηκεύουμε το νούμερο ΠΡΙΝ βάλουμε το ".."
      const prevCount = countSpan.textContent; 
      
      rDiv.classList.add('is-voting', 'voted');
      rDiv.style.pointerEvents = 'none';
      countSpan.textContent = ".."; 
      
      const reactionRef = ref(db, 'reactions/' + safePostId + '/' + type);
      const totalRef = ref(db, 'stats/total_reactions');
      
         runTransaction(reactionRef, (currentCount) => (currentCount || 0) + 1)
      .then((txResult) => {
        // 1. Ενημέρωση UI με ασφάλεια 
        try { localStorage.setItem(`feedback_${safePostId}`, 'voted'); } catch(e) {}
        rDiv.classList.remove('is-voting');
        countSpan.textContent = txResult.snapshot?.val() ?? ((parseInt(prevCount, 10) || 0) + 1);
        window.dispatchEvent(new CustomEvent('reactionSync', { detail: { safePostId, type, newCount: countSpan.textContent } }));
        if (navigator.vibrate) navigator.vibrate(20);

        // --- Εφέ με τα Particles ---
        const emojis = { love: '❤️', funny: '😂', wow: '😮' };
        for (let i = 0; i < 5; i++) {
          const particle = document.createElement('span');
          particle.textContent = emojis[type] || '✨';
          particle.className = 'reaction-particle';
          particle.style.left = `calc(50% + ${(Math.random() - 0.5) * 40}px)`;
          particle.style.animationDelay = `${Math.random() * 0.15}s`;
          btn.appendChild(particle);
          setTimeout(() => particle.remove(), 1000);
        }

        // 2. Στέλνουμε το συνολικό στατιστικό (total) αθόρυβα στο background
        runTransaction(totalRef, (currentTotal) => (currentTotal || 0) + 1).catch(console.warn);
      })
      .catch((error) => {
        // Μπαίνει εδώ μόνο αν αποτύχει η ψήφος του post
        console.error("Σφάλμα Firebase:", error);
        rDiv.classList.remove('is-voting', 'voted');
        rDiv.style.pointerEvents = 'auto';
        countSpan.textContent = prevCount; // Επαναφορά σε περίπτωση που πέσει το ίντερνετ
      });
    }
  };

  // ==========================================
  // 5. LIGHTBOX MANAGER
  // ==========================================
  const LightboxManager = {
    el: document.getElementById('custom-lightbox'),
    img: document.getElementById('lightbox-img'),
    video: document.getElementById('lightbox-video'),
    counter: document.querySelector('.lightbox-counter'),
    download: document.getElementById('lightbox-download'),
    thumbnailsCont: document.querySelector('.lightbox-thumbnails'),
    images: [],
   index: 0,
  videoInterval: null,
    swipeTimeout: null, // Αποθήκευση του timeout
    closeTimeout: null, // ΝΕΟ: Αποθήκευση του χρονομέτρου κλεισίματος
    lastFocus: null,
    
   init: () => {
      const LM = LightboxManager;
      if (!LM.el) return;
      
      Utils.handleImageFallback(LM.img); // ΝΕΟ: Εφαρμογή της ομαλής υποβάθμισης και στη μεγάλη εικόνα του Lightbox
      LM.el.setAttribute("role", "dialog");
      LM.el.setAttribute("aria-label", "Προβολή Εικόνων");
      document.querySelector('.lightbox-close')?.setAttribute("aria-label", "Κλείσιμο");
      document.querySelector('.lightbox-prev')?.setAttribute("aria-label", "Προηγούμενη εικόνα");
      document.querySelector('.lightbox-next')?.setAttribute("aria-label", "Επόμενη εικόνα");

      document.querySelector('.lightbox-close')?.addEventListener('click', LM.close);
      document.querySelector('.lightbox-next')?.addEventListener('click', (e) => { e.stopPropagation(); LM.next(); });
      document.querySelector('.lightbox-prev')?.addEventListener('click', (e) => { e.stopPropagation(); LM.prev(); });
      LM.el.addEventListener('click', (e) => { if (e.target === LM.el) LM.close(); });
      
      LM.thumbnailsCont?.addEventListener('click', (e) => {
        const thumbBtn = e.target.closest('.thumb-img');
        if (thumbBtn) {
          e.stopPropagation();
          LM.index = parseInt(thumbBtn.dataset.index, 10);
          LM.update();
        }
      });

     // --- ΝΕΟ: Ενοποιημένο Swipe (Αριστερά/Δεξιά & Κάτω για κλείσιμο) ---
      let startX = 0, startY = 0, currentX = 0, currentY = 0, isSwipingDown = false;
    LM.el.addEventListener('touchstart', e => {
        if (e.touches.length > 1 || e.target.closest('.lightbox-thumbnails') || (window.visualViewport && window.visualViewport.scale > 1.01)) return;
        clearTimeout(LM.swipeTimeout); // Αγνοούμε το multi-touch για pinch-to-zoom
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX; currentY = startY;
        isSwipingDown = false;
        
        // Αφαιρούμε το CSS transition για να ακολουθεί το δάχτυλο ακαριαία (0ms lag)
        LM.img.style.transition = 'none';
        if (LM.video) LM.video.style.transition = 'none';
        LM.el.style.transition = 'background-color 0s';
      }, PASSIVE);

   LM.el.addEventListener('touchmove', e => {
        if (e.touches.length > 1 || e.target.closest('.lightbox-thumbnails') || (window.visualViewport && window.visualViewport.scale > 1.01)) return;
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        
   const diffX = Math.abs(currentX - startX);
        const diffY = currentY - startY; // Θετικό αν το δάχτυλο πάει προς τα κάτω
        
        // ΔΙΟΡΘΩΣΗ: Σε Fullscreen mode πρέπει ΠΑΝΤΑ να αποτρέπεται το native scrolling του browser 
        // για να μην υπάρχει "rubber-band" bounce effect στα iPhone (π.χ. σε upward swipes).
        if (e.cancelable) e.preventDefault();

        // Αν η κίνηση είναι προς τα κάτω και πιο πολύ κάθετη παρά οριζόντια
       if (diffY > 15 && diffY > diffX) isSwipingDown = true;

       if (isSwipingDown) {
          if (e.cancelable) e.preventDefault(); // Αποτρέπει το ενοχλητικό pull-to-refresh και το σκρολάρισμα
          const safeDiffY = Math.max(0, diffY); // Αποτρέπει το αρνητικό translateY
          
          const opacity = Math.max(0.2, 0.92 - (safeDiffY / window.innerHeight) * 1.5);
          LM.el.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
          
          const activeMedia = LM.video.style.display !== 'none' ? LM.video : LM.img;
          if (activeMedia) activeMedia.style.transform = `translateY(${safeDiffY}px) scale(${1 - (safeDiffY / 2500)})`;
      }
      }, { passive: false });
      
LM.el.addEventListener('touchend', (e) => {
        
        if (e.touches.length > 0 || (e.changedTouches && e.changedTouches.length > 1) || e.target.closest('.lightbox-thumbnails') || (window.visualViewport && window.visualViewport.scale > 1.01)) return;

        const activeMedia = LM.video.style.display !== 'none' ? LM.video : LM.img;

        // ΔΙΟΡΘΩΣΗ: Ακόμα και σε απλό "άγγιγμα" (tap), τα εφέ πρέπει να επαναφέρονται ΠΑΝΤΑ!
        if (startX === currentX && startY === currentY) {
            if (activeMedia) activeMedia.style.transition = '';
            LM.el.style.transition = '';
            return;
        }

        const diffX = startX - currentX; 
        const diffY = currentY - startY;

      if (activeMedia) activeMedia.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        LM.el.style.transition = 'background-color 0.3s ease';

        // ΔΙΟΡΘΩΣΗ: Αποτροπή κλεισίματος του Lightbox αν το swipe ήταν κυρίως οριζόντιο
        if (isSwipingDown && diffY > 120 && diffY > Math.abs(diffX)) {
          LM.close();
        } else {
          // Ελέγχουμε αν ήταν τελικά οριζόντιο swipe
          if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            diffX > 0 ? LM.next() : LM.prev();
          }
          LM.el.style.backgroundColor = '';
          if (activeMedia) activeMedia.style.transform = '';
        }

    LM.swipeTimeout = setTimeout(() => {
          if (activeMedia) activeMedia.style.transition = '';
          LM.el.style.transition = '';
        }, 300);
      });
      
      // ΔΙΟΡΘΩΣΗ: Προστασία επαναφοράς εικόνας και transitions στο Lightbox αν το σύστημα ακυρώσει το σύρσιμο του δαχτύλου
      LM.el.addEventListener('touchcancel', () => {
          const activeMedia = LM.video.style.display !== 'none' ? LM.video : LM.img;
          if (activeMedia) {
              activeMedia.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
              activeMedia.style.transform = '';
          }
          LM.el.style.transition = 'background-color 0.3s ease';
          LM.el.style.backgroundColor = '';
          
          setTimeout(() => {
              if (activeMedia) activeMedia.style.transition = '';
              LM.el.style.transition = '';
          }, 300);
      }, PASSIVE);
      
    document.addEventListener('keydown', (e) => {
        if (!LM.el.classList.contains('active') || e.repeat) return;
        if (e.key === 'Escape') LM.close();
        else if (e.key === 'ArrowRight') LM.next();
        else if (e.key === 'ArrowLeft') LM.prev();
      });
    },
    
  open: (imgs, startIndex = 0) => { // Προσθήκη παραμέτρου startIndex
      const LM = LightboxManager;
      
      clearTimeout(LM.closeTimeout); // ΔΙΟΡΘΩΣΗ 1ου γύρου: Ακύρωση της προηγούμενης εκκαθάρισης αν ο χρήστης βιαστεί

      // ΝΕΟ (ΔΙΟΡΘΩΣΗ 2ου γύρου): Καθαρισμός των styles σε περίπτωση που άνοιξε νέα εικόνα αμέσως μετά από swipe down
      if (LM.img) LM.img.style.transform = '';
      if (LM.video) LM.video.style.transform = '';
      LM.el.style.backgroundColor = '';
      
      LM.lastFocus = document.activeElement; 
      document.body.classList.add('lb-active');
      document.body.style.overflow = 'hidden';
      
      if (window.SliderManager) {
        window.SliderManager.pause();
        if (window.SliderManager.progressBar) {
           window.SliderManager.progressBar.style.transition = 'none';
           window.SliderManager.progressBar.style.width = '0%';
        }
      }
      
    LM.images = imgs.map(img => img.includes('facebook.com') ? img : Utils.upscaleImgUrl(img));
      LM.index = startIndex;
      LM.thumbnailsCont.innerHTML = '';
      
      const fragment = document.createDocumentFragment();
      LM.images.forEach((src, idx) => {
        const thumbBtn = Object.assign(document.createElement('button'), {
          className: 'thumb-img',
          'aria-label': `Προβολή εικόνας ${idx + 1}`
        });
        thumbBtn.dataset.index = idx;
        thumbBtn.style.cssText = 'padding:0; border:none; background-color:transparent; overflow:hidden;';
        
        const match = src.match(REGEX.YT);
        const isFb = REGEX.FB.test(src);
        const videoId = (match?.[1] && !isFb) ? match[1] : null;
        
        const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
                       : isFb ? Utils.getRandomImg() 
                       : Utils.getThumbnailUrl(src); 
        
        const imgInner = Object.assign(document.createElement('img'), {
          src: thumbUrl,
          alt: `Thumbnail ${idx + 1}`,
          loading: "lazy" // Native browser performance
        });
        imgInner.style.cssText = 'width:100%; height:100%; object-fit:cover; pointer-events:none;';
        
        thumbBtn.appendChild(imgInner);
        fragment.appendChild(thumbBtn);

        if (!videoId && !isFb && idx < 3) {
            const preImg = new Image();
            preImg.src = src;
        }
      });
      LM.thumbnailsCont.appendChild(fragment);
      
      LM.update();
      LM.el.classList.add('active');
    },
    
   close: () => {
      const LM = LightboxManager;
      LM.el.classList.remove('active');
      document.body.classList.remove('lb-active');
      document.body.style.overflow = '';
      
   LM.closeTimeout = setTimeout(() => {
        LM.el.style.backgroundColor = '';
        LM.img.style.transform = '';
        if (LM.video) LM.video.style.transform = '';
        if (LM.video) LM.video.removeAttribute('src'); 
      }, 300);

      clearInterval(LM.videoInterval);
      
LM.lastFocus?.focus(); 
      if (!STATE.isPausedByTitle) {
          // Αν σε υπολογιστή το ποντίκι βρίσκεται ακόμα πάνω στο slider, διατηρούμε την παύση
          if (!STATE.isTouchDevice && window.SliderManager?.container.matches(':hover')) {
              window.SliderManager?.resetProgress();
          } else {
              window.SliderManager?.resetProgress(true);
              window.SliderManager?.resume(true);
          }
      } else {
          // Επαναφορά της οπτικής ένδειξης "παύσης" (100%) αφού το Lightbox κλείσει
          if (window.SliderManager?.progressBar) {
              window.SliderManager.progressBar.style.transition = 'none';
              window.SliderManager.progressBar.style.width = '100%';
          }
      }
    },
    
    next: () => { 
      if (navigator.vibrate) navigator.vibrate(10); 
      LightboxManager.index = (LightboxManager.index + 1) % LightboxManager.images.length; 
      LightboxManager.update(); 
    },
    
    prev: () => { 
      if (navigator.vibrate) navigator.vibrate(10); 
      LightboxManager.index = (LightboxManager.index - 1 + LightboxManager.images.length) % LightboxManager.images.length; 
      LightboxManager.update(); 
    },
    
    update: () => {
      const LM = LightboxManager;
      if (!LM.images.length) return;
      
      const currentSrc = LM.images[LM.index];
      const ytMatch = currentSrc.match(REGEX.YT_IMG);
      const isFb = REGEX.FB.test(currentSrc);
      
   if (ytMatch?.[1]) {
        LM.img.style.display = 'none'; 
        LM.video.style.display = 'block';
        // Προσθήκη &rel=0 ώστε να προτείνονται βίντεο ΑΥΣΤΗΡΑ από το κανάλι του σχολείου
        LM.video.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
        LM.download.style.display = 'none';
      } else if (isFb) {
        LM.img.style.display = 'none'; 
        LM.video.style.display = 'block';
        LM.video.src = currentSrc;
        LM.download.style.display = 'none';
    } else {
        LM.video.style.display = 'none'; 
        LM.video.removeAttribute('src');
        LM.img.style.display = 'block';
        LM.img.src = currentSrc;
        LM.download.style.display = 'block';
        
      LM.download.onclick = (e) => {
          e.preventDefault();
          const a = Object.assign(document.createElement('a'), {
            href: currentSrc,
            download: 'sxoleio_photo.jpg',
            target: '_blank'
          });
          document.body.appendChild(a);
          a.click();
          a.remove();
        };
      }
      
      if (LM.counter) LM.counter.textContent = `${LM.index + 1} από ${LM.images.length}`;
      
      LM.thumbnailsCont.querySelectorAll('.thumb-img').forEach((thumb, idx) => {
        const isActive = idx === LM.index;
        thumb.classList.toggle('active', isActive);
        if (isActive) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    }
  };

  // ==========================================
  // 6. SLIDER MANAGER
  // ==========================================
  window.SliderManager = {
    container: document.getElementById('recent-slider'),
    progressBar: null,
    slides: [],
    index: 0,
    interval: null,
    touch: { startX: 0, startY: 0, endX: 0, endY: 0 },
    arrowTimeout: null,
    
    init: async () => {
      const SM = window.SliderManager;
      if (!SM.container) return;
      
      try {
        const res = await fetch(CONFIG.feedUrl);
        const data = await res.json();
        const entries = data.feed?.entry || [];
        
        const pinnedIndex = entries.findIndex(entry => 
          entry.link?.some(l => l.rel === "alternate" && l.href.includes(CONFIG.pinnedPostPath))
        );

        if (pinnedIndex > 0) {
          entries.unshift(entries.splice(pinnedIndex, 1)[0]);
     } else if (pinnedIndex === -1) {
          try {
            const sRes = await fetch(`https://dimperist.blogspot.com/feeds/posts/default?alt=json&path=${CONFIG.pinnedPostPath}`);
            const sData = await sRes.json();
            const fetchedEntry = sData?.feed?.entry?.[0];
            
            if (fetchedEntry) {
              const href = fetchedEntry.link?.find(l => l.rel === "alternate")?.href || "";
              // Βεβαιωνόμαστε ότι το API έφερε το σωστό URL και όχι απλώς το πιο πρόσφατο άρθρο
              if (href.includes(CONFIG.pinnedPostPath)) {
                entries.unshift(fetchedEntry);
              }
            }
          } catch(e) {}
        }
        SM.buildDOM(entries);
      } catch (e) {
        SM.container.innerHTML = '<div class="no-images">Σφάλμα φόρτωσης αναρτήσεων.</div>';
      }
    },
    
   buildDOM: (entries) => {
      const SM = window.SliderManager;
      if (!entries.length) {
        SM.container.innerHTML = '<div class="no-images">Δεν βρέθηκαν αναρτήσεις.</div>';
        return;
      }
      
      SM.container.innerHTML = ''; // ΝΕΟ: Καθαρισμός τυχόν προσωρινού HTML "Φόρτωσης" (Spinners κλπ)
      
      const fragment = document.createDocumentFragment();
      SM.progressBar = Object.assign(document.createElement('div'), { id: 'progress-bar' });
      fragment.appendChild(SM.progressBar);
      
      const chunkSize = (window.innerWidth > 900) ? 330 : 68;

     entries.forEach((entry, idx) => {
        const href = entry.link?.find(l => l.rel === "alternate")?.href || "#";
        const title = entry.title?.$t || "Άρθρο";
        const isPinned = href.includes(CONFIG.pinnedPostPath);
        
       
const postContent = entry.content?.$t || entry.summary?.$t || "";
const { imgs, text: fullText, widgetHtml } = Utils.extractData(postContent);
        
        const textChunks = [];
        if (!fullText) {
          textChunks.push("Δεν υπάρχει κείμενο σε αυτή την ανακοίνωση.");
        } else if (fullText.length <= chunkSize) {
          textChunks.push(fullText);
        } else {
          let i = 0;
          while (i < fullText.length) {
            if (i + chunkSize >= fullText.length) { 
              textChunks.push(fullText.substring(i).trim()); break; 
            }
            const sliceEnd = i + chunkSize;
            const lastSpace = fullText.lastIndexOf(' ', sliceEnd);
            
            if (lastSpace > i) {
              textChunks.push(fullText.substring(i, lastSpace).trim() + "...");
              i = lastSpace + 1;
            } else {
              textChunks.push(fullText.substring(i, sliceEnd).trim() + "...");
              i = sliceEnd;
            }
          }
        }

        const slide = Object.assign(document.createElement(widgetHtml ? 'div' : 'a'), {
          draggable: false,
          className: `slide ${isPinned ? "pinned-contain" : ""}`
        });
        if (!widgetHtml) {
          slide.href = href;
          slide.rel = "noopener";
        }
     slide.setAttribute("aria-hidden", "true"); 
        slide.setAttribute("inert", ""); // Νεκρώνει 100% όλα τα εσωτερικά στοιχεία
        slide.ondragstart = (e) => e.preventDefault();
        
        const imgEl = Object.assign(document.createElement("img"), {
          alt: title, draggable: false
        });
        Utils.handleImageFallback(imgEl);
        imgEl.ondragstart = (e) => e.preventDefault();
        
        if (idx === 0) {
          imgEl.src = Utils.upscaleImgUrl(imgs[0]);
          imgEl.setAttribute("fetchpriority", "high"); 
        } else {
          imgEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
          imgEl.dataset.fullSrc = Utils.upscaleImgUrl(imgs[0]); 
          imgEl.loading = "lazy";
        }
        slide.appendChild(imgEl);
        
        // --- ΝΕΟ: ΕΞΥΠΝΗ ΔΙΑΧΕΙΡΙΣΗ MENU KAI ΑΠΟΤΡΟΠΗ ΣΥΓΚΡΟΥΣΗΣ ID ---
        if (widgetHtml) {
            let safeHtml = widgetHtml;
            const uid = 'w_' + Math.floor(Math.random() * 10000) + '_';
            
            // Μετονομάζει αυτόματα όλα τα ID, FOR και CSS rules του slider
            const idMatches = safeHtml.match(/id="([^"]+)"/g);
            if (idMatches) {
                const uniqueIds = [...new Set(idMatches.map(m => m.split('"')[1]))];
              uniqueIds.forEach(oldId => {
                    const regexId = new RegExp(`id="${oldId}"`, 'g');
                    const regexFor = new RegExp(`for="${oldId}"`, 'g');
                    const regexHref = new RegExp(`href="#${oldId}"`, 'g'); // ΠΡΟΣΘΗΚΗ: Ενημέρωση των Anchor Links
// ΠΡΟΣΘΗΚΗ: Προστέθηκαν τα \+ και \) στο lookahead για να μην σπάνε τα adjacent selectors/pseudo-classes
const regexCss = new RegExp(`#${oldId}(?=[\\s\\:\\,\\[\\{>~\\.\\+\\)]|$)`, 'g');
                    
                    safeHtml = safeHtml.replace(regexId, `id="${uid}${oldId}"`)
                                       .replace(regexFor, `for="${uid}${oldId}"`)
                                       .replace(regexHref, `href="#${uid}${oldId}"`)
                                       .replace(regexCss, `#${uid}${oldId}`);
                });
            }
            // Μετονομάζει και τα name των radio buttons
            const nameMatches = safeHtml.match(/name="([^"]+)"/g);
            if (nameMatches) {
                const uniqueNames = [...new Set(nameMatches.map(m => m.split('"')[1]))];
                uniqueNames.forEach(oldName => {
                    safeHtml = safeHtml.replace(new RegExp(`name="${oldName}"`, 'g'), `name="${uid}${oldName}"`);
                });
            }

            const widgetOverlay = Object.assign(document.createElement("div"), { className: "widget-overlay" });
            widgetOverlay.innerHTML = safeHtml;
            // Αφήνουμε 35px περιθώριο από κάτω για να φανεί η κόκκινη μπάρα του τίτλου
            widgetOverlay.style.cssText = "position: absolute; top: 0; left: 0; right: 0; bottom: 35px; background: rgba(255, 255, 255, 0.95); z-index: 10; overflow-y: auto; overflow-x: hidden; padding: 15px; pointer-events: auto; display: flex; flex-direction: column; border-radius: 10px 10px 0 0;";
            slide.appendChild(widgetOverlay);
        } else {
            // Ο παλιός κώδικας για κανονικές αναρτήσεις
            if (!isPinned && idx < 6) {
              slide.appendChild(Object.assign(document.createElement("div"), {
                className: "new-badge", textContent: "Νέα"
              }));
            }
            const hasVideo = imgs.some(src => src.includes('img.youtube.com') || REGEX.FB.test(src));
            if (imgs.length >= 2 || hasVideo) {
              const zoomBtn = Object.assign(document.createElement("button"), {
                className: "zoom-icon",
                innerHTML: hasVideo ? "▶️" : "🔍"
              });
              zoomBtn.setAttribute("aria-label", hasVideo ? "Αναπαραγωγή βίντεο" : "Προβολή εικόνων");
              zoomBtn.dataset.action = "zoom";
              zoomBtn.style.cssText = 'border:none; outline:none;';
              slide.appendChild(zoomBtn);
            }
        }
        
     
      // --- ΝΕΟ: Η κόκκινη μπάρα τίτλου προστίθεται ΠΑΝΤΑ (και στα menus) ---
      // --- ΝΕΟ: Η κόκκινη μπάρα τίτλου προστίθεται ΠΑΝΤΑ (και στα menus) ---
        const caption = Object.assign(document.createElement("div"), { className: "slide-title" });
        if (widgetHtml) caption.style.zIndex = "20"; // Να είναι πάνω από το overlay
        // Αλλαγή σε innerHTML για να αποκωδικοποιηθούν σωστά τα σύμβολα (π.χ. &amp;, &quot;)
        caption.appendChild(Object.assign(document.createElement("strong"), { innerHTML: title }));
        
        if (!widgetHtml) {
            const descContainer = Object.assign(document.createElement("div"), { className: "slide-desc-container" });
            const descEl = Object.assign(document.createElement("div"), { className: "slide-desc" });
            Utils.buildSafeTextNodes(textChunks[0], descEl);
            descContainer.appendChild(descEl);
            
            if (textChunks.length > 1) {
              const paginationControls = Object.assign(document.createElement("div"), { className: "snippet-pagination" });
              paginationControls.dataset.current = "0";
              
              paginationControls.innerHTML = `
                <button class="snippet-btn disabled" aria-label="Προηγούμενο κείμενο" data-action="prev-snippet">&#10094;</button>
                <button class="snippet-btn" aria-label="Επόμενο κείμενο" data-action="next-snippet">&#10095;</button>
              `;
              descContainer.appendChild(paginationControls);

          let textStartX = 0, textStartY = 0;
              descContainer.addEventListener('touchstart', (e) => { 
                textStartX = e.touches[0].clientX; 
                textStartY = e.touches[0].clientY; 
                // Αφαιρέθηκε το e.stopPropagation() για να "νιώθει" το slider την αφή και να παγώνει το χρόνο
              }, PASSIVE);
            descContainer.addEventListener('touchend', (e) => {
                const diffX = textStartX - e.changedTouches[0].clientX;
                const diffY = textStartY - e.changedTouches[0].clientY;
               if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                  const action = diffX > 0 ? "next-snippet" : "prev-snippet";
                  const btn = descContainer.querySelector(`[data-action="${action}"]`);
                  // ΔΙΟΡΘΩΣΗ: Διακόπτουμε το γενικό swipe του slider ΜΟΝΟ αν υπάρχει διαθέσιμη σελίδα κειμένου. 
                  if (btn && !btn.classList.contains('disabled')) {
                      btn.click();
                      e.stopPropagation();
                  }
                }
              }, PASSIVE);
            }
            caption.appendChild(descContainer);
        }
        
     const postId = (href && href !== "#") ? new URL(href, window.location.origin).pathname : "";
        if (postId?.length > 3) {
            const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
            let isVoted = false;
            try { isVoted = localStorage.getItem(`feedback_${safePostId}`); } catch(e) {}
          const reactDiv = Object.assign(document.createElement("div"), { className: `floating-reactions ${isVoted ? 'voted' : ''}` });
          reactDiv.dataset.postid = postId;
          
         reactDiv.innerHTML = `
            <button class="floating-btn" data-type="love" aria-label="Αγαπώ"><span>❤️</span><span class="count-love">0</span></button>
            <button class="floating-btn" data-type="funny" aria-label="Αστείο"><span>😂</span><span class="count-funny">0</span></button>
            <button class="floating-btn" data-type="wow" aria-label="Ουάου"><span>😮</span><span class="count-wow">0</span></button>
          `;
          // ΔΙΟΡΘΩΣΗ: Παρακολουθείται ΜΟΝΟ η 1η διαφάνεια για αποφυγή Firebase Read Storm
          if (idx === 0) ReactionsManager.observer.observe(reactDiv);
          if (widgetHtml) reactDiv.style.zIndex = "20"; 
          slide.appendChild(reactDiv);
        }
        
        slide.appendChild(caption);
        fragment.appendChild(slide);
        SM.slides.push({ el: slide, imgs, chunks: textChunks });
      });
      
      const navArrows = document.createElement('div');
      navArrows.innerHTML = `
        <button class="slider-arrow left" aria-label="Προηγούμε ανακοίνωση" data-action="prev-slide">&#10094;</button>
        <button class="slider-arrow right" aria-label="Επόμενη ανακοίνωση" data-action="next-slide">&#10095;</button>
      `;
      while (navArrows.firstChild) fragment.appendChild(navArrows.firstChild);
      
      SM.container.appendChild(fragment); 

     if (SM.slides.length > 0) {
        SM.index = 0;
     SM.slides[0].el.classList.add("active");
        SM.slides[0].el.setAttribute("aria-hidden", "false");
        SM.slides[0].el.removeAttribute("inert"); // Ξεκλειδώνει μόνο το ενεργό
        
        [1 % SM.slides.length, (SM.slides.length - 1 + SM.slides.length) % SM.slides.length].forEach(idx => {
           const img = SM.slides[idx]?.el.querySelector("img");
          if (img?.dataset.fullSrc) {
              img.src = img.dataset.fullSrc;
              img.removeAttribute("loading"); // Εξαναγκάζει τον browser να κατεβάσει την εικόνα άμεσα
              delete img.dataset.fullSrc;
          }
        });
      }
      
      SM.setupEvents();
      SM.resetProgress();
      SM.resume();
    },
    
    resetProgress: (force = false) => {
      const SM = window.SliderManager;
      if (!SM.progressBar) return;
      
      SM.progressBar.style.transition = 'none';
      SM.progressBar.style.width = '0%';
      
      if (document.body.classList.contains('lb-active') || (!force && !STATE.isTouchDevice && SM.container.matches(':hover'))) return;
      
    Utils.forceReflow(SM.progressBar);
      window.requestAnimationFrame(() => {
        // Αν εν τω μεταξύ πατήθηκε ο τίτλος (pause), ακυρώνουμε την εκκίνηση της μπάρας
        if (STATE.isPausedByTitle && !force) return;
        const isPinned = SM.slides[SM.index]?.el.classList.contains('pinned-contain');
        const dur = (isPinned ? CONFIG.sliderPinnedDuration : CONFIG.sliderNormalDuration) / 1000;
        SM.progressBar.style.transition = `width ${dur}s linear`;
        SM.progressBar.style.width = '100%';
      });
    },
    
    changeSlide: (newIndex, force) => {
      const SM = window.SliderManager;
      if (STATE.isPausedByTitle) {
        if (SM.progressBar) {
            SM.progressBar.style.transition = 'none';
            SM.progressBar.style.width = '100%';
        }
        return;
      }
      
 const oldSlide = SM.slides[SM.index];
      
   // ΝΕΟ: Σταματάει εντελώς βίντεο/ήχο από τη διαφάνεια που μόλις έκλεισε (Αποτροπή Ghost Audio)
      oldSlide.el.querySelectorAll('video, audio').forEach(media => media.pause());
      oldSlide.el.querySelectorAll('iframe').forEach(ifr => { 
          const currentSrc = ifr.src; 
          // Επαναφόρτωση ΜΟΝΟ αν πρόκειται για βίντεο. Προστατεύουμε Google Forms, Maps, Ημερολόγια κλπ.
          if (/(youtube\.com|youtu\.be|vimeo\.com|facebook\.com)/.test(currentSrc)) {
              ifr.src = ''; 
              ifr.src = currentSrc; 
          }
      });

    // ΝΕΟ: Επαναφορά της σελιδοποίησης (snippets) στην αρχή, ώστε να μην ξεκινάει από τη μέση την επόμενη φορά
      if (oldSlide.chunks && oldSlide.chunks.length > 1) {
          const controls = oldSlide.el.querySelector('.snippet-pagination');
          if (controls && controls.dataset.current !== "0") {
              controls.dataset.current = "0";
              Utils.buildSafeTextNodes(oldSlide.chunks[0], oldSlide.el.querySelector('.slide-desc'));
              controls.querySelector('[data-action="prev-snippet"]').classList.add('disabled');
              controls.querySelector('[data-action="next-snippet"]').classList.remove('disabled');
          }
      }

      oldSlide.el.classList.remove("active");
      oldSlide.el.setAttribute("aria-hidden", "true");
      oldSlide.el.setAttribute("inert", ""); 
      
    SM.index = newIndex;
      const nextSlide = SM.slides[SM.index];
      nextSlide.el.classList.add("active");
      nextSlide.el.setAttribute("aria-hidden", "false");
      nextSlide.el.removeAttribute("inert");

      // ΔΙΟΡΘΩΣΗ: Ανάγνωση δεδομένων μόνο όταν η διαφάνεια έρχεται στο προσκήνιο
    // ΔΙΟΡΘΩΣΗ: Ανάγνωση δεδομένων μόνο όταν η διαφάνεια έρχεται στο προσκήνιο
      const reactDiv = nextSlide.el.querySelector('.floating-reactions');
      // ΝΕΟ: Ελέγχει αν έχουν ήδη αντληθεί τα δεδομένα για αποτροπή ατέρμονου βρόχου (Read Storm)
      if (reactDiv && !reactDiv.dataset.fetched) {
          ReactionsManager.observer.observe(reactDiv);
      }

      const preloadNext = (newIndex + 1) % SM.slides.length;
      const preloadPrev = (newIndex - 1 + SM.slides.length) % SM.slides.length;
      
      [newIndex, preloadNext, preloadPrev].forEach(idx => {
         const img = SM.slides[idx]?.el.querySelector("img");
          if (img?.dataset.fullSrc) {
              img.src = img.dataset.fullSrc;
              img.removeAttribute("loading"); // Εξαναγκάζει τον browser να κατεβάσει την εικόνα άμεσα
              delete img.dataset.fullSrc;
          }
      });

      SM.resetProgress(force);
    },
    
    next: (manual = false) => {
      const SM = window.SliderManager;
      if (STATE.isPausedByTitle && !manual) return;
      if (manual) { STATE.isPausedByTitle = false; SM.showArrows(); }
      
      const force = manual && !(!STATE.isTouchDevice && SM.container.matches(':hover'));
      SM.changeSlide((SM.index + 1) % SM.slides.length, force);
      if (manual && force) SM.resume();
    },
    
    prev: (manual = false) => {
      const SM = window.SliderManager;
      if (STATE.isPausedByTitle && !manual) return;
      if (manual) { STATE.isPausedByTitle = false; SM.showArrows(); }
      
      const force = manual && !(!STATE.isTouchDevice && SM.container.matches(':hover'));
      SM.changeSlide((SM.index - 1 + SM.slides.length) % SM.slides.length, force);
      if (manual && force) SM.resume();
    },
    
    pause: () => clearInterval(window.SliderManager.interval),
    
 resume: (force = false) => {
      const SM = window.SliderManager;
      SM.pause();
      // Προσθήκη προστασίας για Fatal Crash και αποτροπή λούπας όταν υπάρχει μόνο 1 ανάρτηση:
      if (!SM.slides || SM.slides.length <= 1) return; 
      if (!force && STATE.isPausedByTitle) return;
      
      // Προσθήκη "?." πριν το classList για απόλυτη ασφάλεια σε περίπτωση καθυστερημένου render:
      const isPinned = SM.slides[SM.index]?.el?.classList.contains('pinned-contain');
      const dur = isPinned ? CONFIG.sliderPinnedDuration : CONFIG.sliderNormalDuration;
      SM.interval = setTimeout(() => { SM.next(); SM.resume(); }, dur);
    },
    
    showArrows: () => {
      const SM = window.SliderManager;
      SM.container.classList.add('show-arrows');
      clearTimeout(SM.arrowTimeout);
      SM.arrowTimeout = setTimeout(() => SM.container.classList.remove('show-arrows'), 3000);
    },
    
    handleSwipe: () => {
      const SM = window.SliderManager;
      if (SM.touch.endX === 0) { STATE.wasDragged = false; return false; }
      
      const diffX = SM.touch.startX - SM.touch.endX;
      const diffY = SM.touch.startY - SM.touch.endY;
      let swiped = false;
      
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        STATE.wasDragged = true; swiped = true;
        
        // --- ΠΡΟΣΘΗΚΗ ΔΟΝΗΣΗΣ ΣΤΟ SWIPE ---
        if (navigator.vibrate) navigator.vibrate(10); 
        
        diffX > 0 ? SM.next(true) : SM.prev(true);
      } else {
        STATE.wasDragged = false;
      }
      
      SM.touch.endX = 0; SM.touch.endY = 0;
      return swiped;
    },

   setupEvents: () => {
      const SM = window.SliderManager;
      
      // Αποτρέπει το Swipe-to-go-back του browser κατά το οριζόντιο swipe στο slider
      SM.container.style.touchAction = 'pan-y';
      
      if (STATE.isTouchDevice || window.innerWidth <= 768) {
        let hideTimer;
        const resetReactions = () => {
          clearTimeout(hideTimer);
          SM.container.querySelectorAll('.floating-reactions').forEach(r => r.classList.remove('hidden-reactions'));
          hideTimer = setTimeout(() => {
            SM.container.querySelectorAll('.floating-reactions').forEach(r => r.classList.add('hidden-reactions'));
          }, CONFIG.reactionHideDelay);
        };
        resetReactions();
        document.addEventListener('touchstart', resetReactions, PASSIVE);
      }

      // Κεντρικό έξυπνο Event Delegation που δεν προκαλεί lag
      SM.container.addEventListener('click', (e) => {
        if (STATE.wasDragged) {
          e.preventDefault(); e.stopPropagation();
          STATE.wasDragged = false;
          return;
        }

      
       // ΑΝΤΙΚΑΤΑΣΤΗΣΕ ΤΟ ΑΡΧΙΚΟ WIDGET CHECK ΜΕ ΑΥΤΟ:
       if (e.target.closest('.widget-overlay')) {
            STATE.isPausedByTitle = true;
            SM.pause();
            if (SM.progressBar) {
                SM.progressBar.style.transition = 'none';
                SM.progressBar.style.width = '100%';
            }
           // Προστέθηκαν τα summary, details, audio, video για να μη νεκρώνουν τα accordions και τα media players
            if (!e.target.closest('a, button, input, label, select, textarea, summary, details, audio, video')) {
               e.preventDefault(); 
            }
            return; // <-- ΠΡΕΠΕΙ ΝΑ ΜΠΕΙ ΕΔΩ ΞΑΝΑ!
        }
        
        const target = e.target.closest('.floating-btn, [data-action="zoom"], .slider-arrow, .snippet-btn');
        
        if (target) {
          e.preventDefault(); e.stopPropagation();
          
          if (target.classList.contains('floating-btn')) {
            ReactionsManager.handleVote(target);
          } 
         else if (target.dataset.action === 'zoom') {
            const slideObj = SM.slides.find(s => s.el === target.closest('.slide'));
            if (slideObj) {
                // Αν πατήθηκε το Play βρίσκουμε το index του βίντεο, αλλιώς ξεκινάμε από την αρχή
                const isPlayBtn = target.innerHTML.includes('▶️');
                const vIdx = isPlayBtn ? slideObj.imgs.findIndex(src => src.includes('img.youtube.com') || REGEX.FB.test(src)) : 0;
                LightboxManager.open(slideObj.imgs, Math.max(0, vIdx));
            }
          }
          else if (target.classList.contains('slider-arrow')) {
            SM.pause(); STATE.isPausedByTitle = false;
            if (navigator.vibrate) navigator.vibrate(10); // Haptic Click
            target.dataset.action === 'prev-slide' ? SM.prev(true) : SM.next(true);
          } 
    else if (target.classList.contains('snippet-btn') && !target.classList.contains('disabled')) {
            // Παγώνει ο χρόνος για να διαβάσει ο χρήστης τη συνέχεια με την ησυχία του
            STATE.isPausedByTitle = true;
            SM.pause();
            if (SM.progressBar) { SM.progressBar.style.transition = 'none'; SM.progressBar.style.width = '100%'; }

            const slideObj = SM.slides.find(s => s.el === target.closest('.slide'));
            if (!slideObj) return;

            const controls = target.closest('.snippet-pagination');
            const descEl = target.closest('.slide-desc-container').querySelector('.slide-desc');
            let curr = parseInt(controls.dataset.current, 10);
            
            if (target.dataset.action === 'prev-snippet' && curr > 0) curr--;
            else if (target.dataset.action === 'next-snippet' && curr < slideObj.chunks.length - 1) curr++;
            
            controls.dataset.current = curr;
            Utils.buildSafeTextNodes(slideObj.chunks[curr], descEl);
            controls.querySelector('[data-action="prev-snippet"]').classList.toggle('disabled', curr === 0);
            controls.querySelector('[data-action="next-snippet"]').classList.toggle('disabled', curr === slideObj.chunks.length - 1);
          }
          return;
        }

        const caption = e.target.closest('.slide-title');
        if (caption && (STATE.isTouchDevice || window.innerWidth <= 868)) {
          if (!STATE.isPausedByTitle) {
            e.preventDefault(); e.stopPropagation();
            STATE.isPausedByTitle = true;
            SM.pause();
            if (SM.progressBar) {
                SM.progressBar.style.transition = 'none';
                SM.progressBar.style.width = '100%';
            }
          }
        }
      }, true);

   document.addEventListener('click', (e) => {
        // ΝΕΟ: Εξαιρούμε και το '.widget-overlay' για να ΜΗΝ ξεπαγώνει ο χρόνος όταν πατάς τα Tabs
        if (STATE.isPausedByTitle && !e.target.closest('.slide-title') && !e.target.closest('.widget-overlay')) {
          STATE.isPausedByTitle = false;
          SM.resetProgress(true);
          SM.resume();
        }
      });

      const trigArr = Utils.throttle(() => SM.showArrows(), 500);
      window.addEventListener('scroll', trigArr, PASSIVE);
      ['mousedown', 'touchstart'].forEach(evt => document.addEventListener(evt, (e) => { if (!e.target.closest('.slider-arrow')) trigArr(); }, PASSIVE));
      document.addEventListener('mousemove', () => { if (!STATE.isTouchDevice) trigArr(); }, PASSIVE);

      SM.container.addEventListener('mouseenter', () => {
        if (STATE.isTouchDevice) return;
        SM.pause(); SM.showArrows();
        if (SM.progressBar) { SM.progressBar.style.transition = 'none'; SM.progressBar.style.width = '0%'; }
      });

      SM.container.addEventListener('mouseleave', () => {
        if (STATE.isTouchDevice || document.body.classList.contains('lb-active')) return;
        if (STATE.isDragging) {
          STATE.isDragging = false;
          const swiped = SM.handleSwipe();
          if (!STATE.isPausedByTitle) { SM.resume(); if (!swiped) SM.resetProgress(); }
        } else if (!STATE.isPausedByTitle) {
          SM.resume(); SM.resetProgress();
        }
      });

SM.container.addEventListener('touchstart', e => {
        STATE.isTouchDevice = true; STATE.wasDragged = false;
        // Καταγραφή συντεταγμένων ΠΑΝΤΑ, ώστε να είναι εφικτό το μελλοντικό swipe
        SM.touch.startX = e.touches[0].clientX; 
        SM.touch.startY = e.touches[0].clientY;
        SM.touch.endX = 0; 
        SM.touch.endY = 0;

     if (e.target.closest('.widget-overlay')) {
            STATE.isPausedByTitle = true;
            SM.pause();
            if (SM.progressBar) { SM.progressBar.style.transition = 'none'; SM.progressBar.style.width = '100%'; }
        } else {
            SM.showArrows(); SM.pause();
            if (SM.progressBar) { SM.progressBar.style.transition = 'none'; SM.progressBar.style.width = '0%'; }
        }
      }, PASSIVE);

      SM.container.addEventListener('touchmove', e => { 
        SM.touch.endX = e.touches[0].clientX; 
        SM.touch.endY = e.touches[0].clientY; 
      }, PASSIVE);
      
 SM.container.addEventListener('touchend', e => {
   
        SM.handleSwipe();
        if (!STATE.isPausedByTitle) { SM.resume(); SM.resetProgress(true); }
      });

      // ΔΙΟΡΘΩΣΗ: Επαναφορά του Slider όταν το σύστημα (π.χ. Long-Press / Κλήση) ακυρώνει βίαια την αφή 
      SM.container.addEventListener('touchcancel', () => {
        STATE.isDragging = false;
        if (!STATE.isPausedByTitle) { SM.resume(); SM.resetProgress(true); }
      }, PASSIVE);

      SM.container.addEventListener('mousedown', e => {
        if (e.button !== 0 || STATE.isTouchDevice || e.target.closest('.slide-desc-container') || e.target.closest('.widget-overlay')) return;
        STATE.isPausedByTitle = false; STATE.wasDragged = false; STATE.isDragging = true;
        SM.touch.startX = e.clientX; SM.touch.startY = e.clientY;
        SM.touch.endX = 0; SM.touch.endY = 0;
        SM.pause(); 
        if (SM.progressBar) { SM.progressBar.style.transition = 'none'; SM.progressBar.style.width = '0%'; }
      });

      SM.container.addEventListener('mousemove', e => { 
        if (STATE.isDragging) { SM.touch.endX = e.clientX; SM.touch.endY = e.clientY; } 
      });
      
      SM.container.addEventListener('mouseup', () => {
        if (!STATE.isDragging) return;
        STATE.isDragging = false;
        const swiped = SM.handleSwipe();
        const hover = SM.container.matches(':hover');
        if (!hover) SM.resume();
        if (swiped) SM.resetProgress(!hover);
        else if (!hover) SM.resetProgress();
      });

   document.addEventListener('keydown', e => {
        if (document.body.classList.contains('lb-active') || e.repeat) return;
        
        // Προστασία: Εξαίρεση αν ο χρήστης γράφει σε κάποιο ενεργό πεδίο κειμένου
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
        
       if (SM.container.matches(':hover') || SM.container.contains(document.activeElement)) {
          if (e.key === 'ArrowLeft') { e.preventDefault(); SM.prev(true); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); SM.next(true); }
        }
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.SliderManager.pause();
        } else {
            if (!STATE.isPausedByTitle && !document.body.classList.contains('lb-active')) {
                // Προστασία αν το ποντίκι είναι ήδη πάνω στο slider την ώρα που επιστρέφεις στο Tab
                if (!STATE.isTouchDevice && window.SliderManager.container.matches(':hover')) return;
                
                window.SliderManager.resume(true);
                window.SliderManager.resetProgress();
            }
        }
      });

      // ΝΕΟ: Εντοπίζει αλληλεπίδραση σε εξωτερικά iframes (π.χ. Google Forms, YouTube) και παγώνει το slider
      window.addEventListener('blur', () => {
          setTimeout(() => {
              const activeEl = document.activeElement;
              if (activeEl && activeEl.tagName === 'IFRAME' && window.SliderManager.container.contains(activeEl)) {
                  STATE.isPausedByTitle = true;
                  window.SliderManager.pause();
                  if (window.SliderManager.progressBar) {
                      window.SliderManager.progressBar.style.transition = 'none';
                      window.SliderManager.progressBar.style.width = '100%';
                  }
              }
          }, 50);
      });

  // --- ΕΔΩ ΤΟΠΟΘΕΤΕΙΣ ΤΟΝ ΑΚΡΟΑΤΗ ---
      window.addEventListener('reactionSync', (e) => {
          const { safePostId, type, newCount } = e.detail;
          // Ψάχνουμε όλα τα reactions στο slider
          document.querySelectorAll('.floating-reactions').forEach(rDiv => {
             const currentPostId = rDiv.dataset.postid;
              
              // ΠΡΟΣΘΗΚΗ: Αν λείπει το data-postid, προχωράμε στο επόμενο χωρίς να βγάλει σφάλμα
              if (!currentPostId) return; 
              
              // Το κάνουμε και αυτό "safe" για να τα συγκρίνουμε σωστά!
              const currentSafePostId = currentPostId.replace(/[\.\#\$\[\]\/]/g, '_');
              
              if (currentSafePostId === safePostId) {
                  rDiv.classList.add('voted');
                  const countSpan = rDiv.querySelector(`.count-${type}`);
                  if (countSpan) countSpan.textContent = newCount;
              }
          });
      });

    } // <--- ΕΔΩ ΚΛΕΙΝΕΙ Η ΣΥΝΑΡΤΗΣΗ setupEvents
  }; // <--- ΕΔΩ ΚΛΕΙΝΕΙ ΟΛΟ ΤΟ window.SliderManager

  // ==========================================
  // 7. ΕΝΑΡΞΗ ΛΕΙΤΟΥΡΓΙΩΝ
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    NavManager.init();
    LightboxManager.init();
    window.SliderManager?.init();
  });

})();


;(() => {
  "use strict";
// eidisispernane1
const startTicker = () => {
  (async function initNewsTicker() {
    const config = {
      blogUrl: "https://dimperist.blogspot.com",
      maxPosts: 6,
      containerId: "unique-top-ticker-scroll", 
      fallbackLink: "#"
    };

  const tickerContainer = document.getElementById(config.containerId);
    const tickerOuter = document.getElementById("unique-top-ticker-outer"); 
    // Αυστηρός έλεγχος και για τα δύο ώστε να μην νεκρώσει το site αν σβηστεί κατά λάθος το ένα.
    if (!tickerContainer || !tickerOuter) return;

   try {
 
    const timestamp = Math.floor(Date.now() / 300000);
      const feedUrl = `${config.blogUrl}/feeds/posts/default?alt=json&max-results=${config.maxPosts}&_cb=${timestamp}`;
      const response = await fetch(feedUrl);
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const entries = data?.feed?.entry;

    if (!entries || !entries.length) {
        tickerContainer.textContent = "Δεν βρέθηκαν αναρτήσεις.";
        if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
        return;
      }

      const targetCount = Math.max(15, config.maxPosts);
      while (entries.length > 0 && entries.length < targetCount) {
          entries.push(...entries.slice(0, targetCount - entries.length));
      }

      const fragment = document.createDocumentFragment();

      entries.forEach((entry, index) => {
        const rawTitle = entry.title?.$t || "Χωρίς τίτλο";
  
        const txtDecoder = document.createElement("textarea");
        txtDecoder.innerHTML = rawTitle;
        const title = txtDecoder.value;
        const altLink = entry.link?.find(l => l.rel === "alternate");
        const linkHref = altLink?.href || config.fallbackLink;

        const anchor = document.createElement("a");
        anchor.href = linkHref;
        anchor.className = "unique-top-ticker-link"; 
    
        if (entry === entries[0]) {
          // Βάζουμε το σύμβολο με innerHTML, αλλά τον τίτλο αυστηρά ως textNode για απόλυτη ασφάλεια
          anchor.innerHTML = `<span style="color: #ff0000; margin-right: 8px;">⭐</span> `; 
          anchor.appendChild(document.createTextNode(title));
        } else {
          anchor.textContent = title; 
        }

        fragment.appendChild(anchor);
      });

      const clonedFragment = fragment.cloneNode(true);
      clonedFragment.querySelectorAll("a").forEach(anchor => {
        anchor.setAttribute("aria-hidden", "true");
        anchor.setAttribute("tabindex", "-1");
      });

      tickerContainer.replaceChildren(fragment, clonedFragment);

   // ΛΥΣΗ BUG 3: Περιμένουμε τις γραμματοσειρές με όριο (Timeout) 600ms. 
      // Έτσι αν ο browser κολλήσει, ο κώδικας θα προχωρήσει σώζοντας το ticker από μόνιμο πάγωμα.
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 600))
      ]);

      let lastWidth = -1;
      let hasStarted = false; // ΝΕΟ BUG 1: Ελέγχει αν έχει παίξει η είσοδος

      const applyTickerMath = () => {
        const outerWidth = tickerOuter.clientWidth;
        
        // Προστασία από background tabs (Bug 4)
        if (!outerWidth || outerWidth === lastWidth) return; 
        lastWidth = outerWidth;

        // Reset animation για καθαρό υπολογισμό
        tickerContainer.style.animation = 'none';
        void tickerOuter.offsetWidth; 

    
        const firstCloneIndex = tickerContainer.children.length / 2;
        const originalFirst = tickerContainer.children[0];
        const cloneFirst = tickerContainer.children[firstCloneIndex];
        
        const singleSetWidth = (originalFirst && cloneFirst) 
          ? (cloneFirst.getBoundingClientRect().left - originalFirst.getBoundingClientRect().left) 
          : (tickerContainer.scrollWidth / 2);

        // Η δική σου σωστή λύση για τη Σταθερή Ταχύτητα!
        const speed = 60; 
        const loopDuration = singleSetWidth / speed; 
        const entranceDuration = outerWidth / speed; 

       tickerOuter.style.setProperty('--start-pos', `${outerWidth}px`);

        if (!hasStarted) {
          tickerContainer.style.animation = `
            ticker-entrance ${entranceDuration}s linear forwards, 
            ticker-loop ${loopDuration}s linear ${entranceDuration}s infinite
          `;
          hasStarted = true;
        } else {
          tickerContainer.style.animation = `ticker-loop ${loopDuration}s linear infinite`;
        }

        if (!tickerOuter.classList.contains("ticker-loaded")) {
          tickerOuter.classList.add("ticker-loaded");
        }
      };

      // ΛΥΣΗ BUG 3: Αποτροπή σπασίματος κίνησης από πλοήγηση με το πλήκτρο "Tab"
      tickerContainer.addEventListener("scroll", () => {
        if (tickerContainer.scrollLeft > 0) {
          tickerContainer.scrollLeft = 0;
        }
      });

      let resizeTimer;
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          requestAnimationFrame(applyTickerMath);
        }, 150);
      });
      resizeObserver.observe(tickerOuter);

    } catch (error) {
     console.error("News Ticker Error:", error);
      tickerContainer.textContent = "Προσωρινή αδυναμία φόρτωσης ειδήσεων.";
      if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
    }
  })();
};

// ΛΥΣΗ ΝΕΟ BUG 3 (Μέρος Β): Αποτρέπει το "νεκρό Ticker" στον Blogger.
// Αν η σελίδα έχει ήδη φορτώσει, τρέξε το αμέσως! Αλλιώς περίμενε το κλασικό σήμα (DOMContentLoaded).
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startTicker);
} else {
  startTicker();
}
})();

;(() => {
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
    ['scroll', 'touchstart', 'click', 'mousemove'].forEach(evt => window.addEventListener(evt, handleActivity, opts));
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('.fetched-content-wrapper')) handleActivity(e);
    }, opts);

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
      if (!DOM.speedDialMenu.classList.contains('is-open') && !localStorage.getItem(tooltipKey)) {
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

     currentLink = link;
      clearTimeout(hoverTimer);
      // ΔΙΟΡΘΩΣΗ 3: ΠΡΕΠΕΙ να ακυρώνεται η εντολή απόκρυψης που ίσως ξέμεινε από το προηγούμενο τρεμόπαιγμα!
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
        previewBox.classList.remove('is-visible');
        setTimeout(() => { 
            // Προστέθηκε το απαραίτητο άδειασμα του URL που έλειπε + Fix για CORS
            if (!previewBox.classList.contains('is-visible')) {
                iframe.dataset.url = '';
                iframe.src = 'about:blank'; 
            }
        }, 300);
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
        
        // Ενημερώνουμε το URL hash αθόρυβα (PushState), ώστε αν ο χρήστης κάνει 
        // Αντιγραφή του Link από την μπάρα, να σταλεί σωστά το συγκεκριμένο κεφάλαιο!
        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, '#' + heading.id);
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
    headings.forEach(h => headingObserver.observe(h));
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

;(() => {
  'use strict';
  // stoixia
document.addEventListener("DOMContentLoaded", () => {
  "use strict"; 
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
            targetElement.textContent = Math.round(targetNum * easeOutSeptic(progress));
            requestAnimationFrame(updateCount); 
          } else {
            targetElement.textContent = targetNum; // Εξασφάλιση απόλυτης ακρίβειας στο τέλος
          }
        };

        if (targetNum > 0) requestAnimationFrame(updateCount); 
        observer.unobserve(targetElement); // Σταματάμε την παρακολούθηση της κάρτας για εξοικονόμηση μνήμης RAM
      });
    };
// Μηδενικό threshold (0) ώστε να ξεκινάει η μέτρηση ΑΚΑΡΙΑΙΑ με το που μπει ο χρήστης
    const observer = new IntersectionObserver(animateCounters, { threshold: 0 });
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

      // ΔΙΟΡΘΩΣΗ: Αποτροπή δεύτερης εκτέλεσης σε διπλό κλικ (προστασία από Layout Shift)
      if (modalOverlay.classList.contains('active')) return;

      lastFocusedElement = triggerElement;

  // Εισαγωγή Δεδομένων με textContent (Αποτρέπει κακόβουλες επιθέσεις XSS και σπάσιμο κειμένου)
      // ΔΙΟΡΘΩΣΗ: Αντικατάσταση του innerHTML με textContent
      if (modalIcon) modalIcon.textContent = data.icon; 
      if (modalText) modalText.textContent = data.text;

// Ρύθμιση 1ου Κουμπιού
      if (modalBtn) {
        if (url && url !== '#') {
          modalBtn.setAttribute('href', url);
          modalBtn.textContent = data.primaryBtn || "Δείτε εδώ 🚀";
          modalBtn.style.display = 'inline-block';
        } else {
          // ΔΙΟΡΘΩΣΗ: Αν δεν υπάρχει πραγματικό link, το κουμπί κρύβεται εντελώς 
          // για να μην παγιδευτεί ο επισκέπτης πατώντας ένα "νεκρό" κουμπί.
          modalBtn.removeAttribute('href');
          modalBtn.style.display = 'none';
        }
      }
      // Ρύθμιση 2ου Κουμπιού (Δυναμικά)
      if (modalBtn2) {
        if (data.secondaryBtn) {
          modalBtn2.setAttribute('href', data.secondaryBtn.url);
       modalBtn2.textContent = data.secondaryBtn.text;
          modalBtn2.style.display = 'inline-block';
        } else {
          modalBtn2.style.display = 'none';
        }
      }

  // Υπολογισμός πάχους scrollbar για αποφυγή βίαιου τινάγματος (Layout Shift)
      // ΔΙΟΡΘΩΣΗ: Αποτροπή Race Condition στα γρήγορα απανωτά κλικ
      if (document.body.style.overflow !== 'hidden') {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden'; // [Premium UX]: Κλειδώνει το scroll της πίσω σελίδας (Τέλειο για κινητά)
      }

      modalOverlay.classList.add('active');
      modalOverlay.style.setProperty('--theme-color', data.themeColor || '#a90e0e');
  
  // Accessibility: Εστιάζει στο 1ο ορατό κουμπί.
      // ΔΙΟΡΘΩΣΗ: Έλεγχος ορατότητας για αποτροπή εγκλωβισμού της πλοήγησης (Focus Trap)
      setTimeout(() => {
        if (modalBtn && modalBtn.style.display !== 'none') {
          modalBtn.focus({ preventScroll: true });
        } else if (modalBtn2 && modalBtn2.style.display !== 'none') {
          modalBtn2.focus({ preventScroll: true });
        } else {
          modalOverlay.setAttribute('tabindex', '-1');
          modalOverlay.focus({ preventScroll: true });
        }
      }, 50);
    };

const closeModal = () => {
      modalOverlay.classList.remove('active');
      // ΔΙΟΡΘΩΣΗ: Προσθήκη preventScroll ώστε η εστίαση να επιστρέψει αθόρυβα, χωρίς να προκαλέσει αναπήδηση!
      if (lastFocusedElement) lastFocusedElement.focus({ preventScroll: true }); 
      
      // Καθυστέρηση ξεκλειδώματος για να μην τραντάζεται η σελίδα όσο το Modal σβήνει (CSS fade-out)
      setTimeout(() => {
        if (!modalOverlay.classList.contains('active')) {
          document.body.style.overflow = ''; 
          document.body.style.paddingRight = ''; 
        }
      }, 300); // 300ms είναι ο standard χρόνος για CSS transitions
    };

    // Εξαγωγή για inline onclick="..." (αν υπάρχει στο HTML σου)
    window.closeGlassModal = closeModal;

  // Αποτροπή κλεισίματος όταν ο χρήστης μαρκάρει κείμενο
  // Αποτροπή κλεισίματος όταν ο χρήστης μαρκάρει κείμενο
  let isPointerDownOnOverlay = false;

  modalOverlay.addEventListener('pointerdown', (e) => {
    isPointerDownOnOverlay = (e.target === modalOverlay);
  });

  modalOverlay.addEventListener('pointerup', (e) => {
    // Κλείνει ΜΟΝΟ αν το κλικ ξεκίνησε ΚΑΙ τελείωσε στο σκοτεινό φόντο
    if (isPointerDownOnOverlay && e.target === modalOverlay) {
      closeModal();
    }
    isPointerDownOnOverlay = false; // Επαναφορά
  });

    // ΔΙΟΡΘΩΣΗ: Πλήρης αποτροπή παρασκηνιακού scroll (scroll bleed) στα iPhones/iPads
    modalOverlay.addEventListener('touchmove', (e) => {
      if (e.target === modalOverlay && e.cancelable) {
        e.preventDefault();
      }
    }, { passive: false });

    // ΣΗΜΕΙΩΣΗ: Το παλιό event 'click' έχει πλέον αντικατασταθεί πλήρως.
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
// ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 1: Ενημέρωση της τρέχουσας θέσης ΠΑΝΤΑ, αλλιώς 
        // αν ο χρήστης σκρολάρει, κρατάει παλιά θέση και κλείνει βίαια το Modal!
        currentY = e.touches[0].clientY;

      let target = e.target;
        let isScrolled = false;
        while (target && target !== modalOverlay) {
          if (target.scrollTop > 0) { isScrolled = true; break; }
          target = target.parentElement;
        }
        
        if (isScrolled) {
          // Ανανέωση του σημείου εκκίνησης διαρκώς όσο ο χρήστης κάνει scroll.
          // Έτσι, όταν τερματίσει στην κορυφή, το σύρσιμο θα ξεκινήσει ομαλά από το μηδέν.
          touchStartY = currentY; 
          return;
        }

        const diffY = currentY - touchStartY;

      // ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 2: Ακυρώνουμε τον Browser ΑΜΕΣΩΣ (diffY > 0). Αν περιμένουμε τα 10px,
        // οι mobile browsers παρεμβαίνουν και κάνουν Pull-to-Refresh (ανανέωση) στη σελίδα!
        if (diffY > 0 && e.cancelable) {
          e.preventDefault(); 
        }

    // ΔΙΟΡΘΩΣΗ: Αφαίρεση της νεκρής ζώνης των 10px που προκαλούσε τίναγμα (snap). 
      // Πλέον ακολουθεί ρευστά το δάχτυλο από το 1ο χιλιοστό (diffY > 0).
        if (diffY > 0) {
          modalBox.style.transform = `translateY(${diffY}px) scale(1)`;
        } else {
          // ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 3: Αποτρέπει το οπτικό "πάγωμα" αν ο χρήστης σύρει το δάχτυλο πάλι πάνω!
          modalBox.style.transform = '';
        }
      }, { passive: false });

  modalBox.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const diffY = currentY - touchStartY;

        // Επαναφέρουμε την ομαλότητα του CSS
        modalBox.style.transition = ''; 

      if (diffY > 80) { 
          // ΔΙΟΡΘΩΣΗ: Άμεσος καθαρισμός του inline transform ΠΡΙΝ το closeModal, 
          // για να ξεμπλοκάρει το ομαλό CSS animation εξόδου!
          modalBox.style.transform = '';
          // Αν το έσυρε αρκετά κάτω, κλείνουμε το modal
          closeModal();
        } else {
          modalBox.style.transform = '';
        }
      });

      // ΣΟΒΑΡΗ ΔΙΟΡΘΩΣΗ 4: Επαναφορά του Modal αν η αφή διακοπεί βίαια από το Λειτουργικό 
      // Σύστημα (π.χ. κλήση, iOS edge-swipe). Χωρίς αυτό, το Modal εγκλωβίζεται!
      modalBox.addEventListener('touchcancel', () => {
        if (!isDragging) return;
        isDragging = false;
        modalBox.style.transition = '';
        modalBox.style.transform = '';
      });
    }

    // EVENT DELEGATION: Ένας ακροατής (listener) στο document, αντί για πολλούς (Μέγιστη ταχύτητα)
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-glass-card, .stat-link');
      if (!card) return;

    const url = card.getAttribute('href');
      const label = card.querySelector('.stat-label')?.textContent.trim() || "";

      // 1. Αν η κάρτα υπάρχει στο σύστημα του Modal, αναλαμβάνει η Javascript:
     // 1. Αν η κάρτα υπάρχει στο σύστημα του Modal, αναλαμβάνει η Javascript:
      if (modalData[label]) {
        // Επιτρέπουμε το κανονικό άνοιγμα σε νέα καρτέλα αν ο χρήστης κρατάει πατημένο το Ctrl/Cmd/Shift ή κάνει Μεσαίο Κλικ
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

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
 
  const init3DTilt = () => {
    // ΔΙΟΡΘΩΣΗ 1: Αλλάξαμε σε "hover: none" για να δουλεύει 100% και σε Laptops με αφή!
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll('.stat-glass-card');
    
  cards.forEach(card => {
      // Όταν το ποντίκι ΜΠΑΙΝΕΙ στην κάρτα
    let rect, absLeft, absTop, rAfId; // ΝΕΟ: Μεταβλητή μνήμης για την ακύρωση καρέ
      
card.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return; // Προστασία από "κόλλημα" κάρτας σε οθόνες αφής Laptops
        
        // ΔΙΟΡΘΩΣΗ: Διαγράφηκε ο βίαιος μηδενισμός του transform που προκαλούσε 
        // ενοχλητικό τρεμόπαιγμα (flicker) στις γρήγορες κινήσεις του ποντικιού.
        card.style.transition = 'none';

        rect = card.getBoundingClientRect();
        absLeft = rect.left + window.scrollX;
        absTop = rect.top + window.scrollY;

        card.style.animation = 'none'; 
        card.style.opacity = '1';
      });

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' || !rect) return;
        
        // ΔΙΟΡΘΩΣΗ: Χρήση pageX/pageY (περιέχουν το scroll) για να μη σπάει η κλίση αν ο χρήστης ρολάρει!
        const x = e.pageX - absLeft; 
        const y = e.pageY - absTop;
        
        // Κέντρο της κάρτας
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Υπολογισμός Κλίσης (Max 12 μοίρες). Αντιστρέφουμε για αίσθηση "μαγνήτη".
        const rotateX = ((y - centerY) / centerY) * -12; 
        const rotateY = ((x - centerX) / centerX) * 12;
        
        // Πού θα πέφτει το φως (%)
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        
      if (rAfId) cancelAnimationFrame(rAfId); // Ακύρωση προηγούμενου καρέ (Σώζει CPU)

        // Χρησιμοποιούμε requestAnimationFrame για απόλυτη ομαλότητα
        rAfId = requestAnimationFrame(() => {
          // Εφαρμόζουμε την τρισδιάστατη περιστροφή + το σήκωμα προς τα πάνω (-8px)
          card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          
          // Στέλνουμε τις συντεταγμένες στο CSS για το φως!
          card.style.setProperty('--glare-x', `${glareX}%`);
          card.style.setProperty('--glare-y', `${glareY}%`);
        });
      });
      
     card.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'touch') return;
        
        if (rAfId) cancelAnimationFrame(rAfId); // Προστασία Race Condition: Ακυρώνει την τελευταία κλίση ώστε η κάρτα να μην μείνει στραβή!

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

  const initButtonFX = () => {
    const modalButtons = document.querySelectorAll('.glass-modal-btn');
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    modalButtons.forEach(btn => {
      /* --- 1. MAGNETIC CURSOR PULL (Μαγνήτης - ΜΟΝΟ για ποντίκι) --- */
   if (!isTouchDevice) {
      let btnRect, absCenterX, absCenterY, btnRafId;
        
  btn.addEventListener('pointerenter', (e) => {
          if (e.pointerType === 'touch') return; // Ακύρωση μαγνήτη στην αφή για να επιτραπεί το καθαρό κλικ
          
          // ΔΙΟΡΘΩΣΗ: Ακύρωση της προηγούμενης προγραμματισμένης επαναφοράς για αποφυγή οπτικού glitch
          if (btnRafId) cancelAnimationFrame(btnRafId);

          // ΔΙΟΡΘΩΣΗ: Ακαριαία αφαίρεση του animation πριν τη μέτρηση για να μη "δραπετεύει" το κουμπί
          btn.style.transition = 'none';
          btn.style.transform = 'none';

          btnRect = btn.getBoundingClientRect();
          // ΔΙΟΡΘΩΣΗ: Κλείδωμα κέντρου στο συνολικό έγγραφο (για να μην "εκσφενδονιστεί" στο scroll)
          absCenterX = btnRect.left + window.scrollX + (btnRect.width / 2);
          absCenterY = btnRect.top + window.scrollY + (btnRect.height / 2);
        });

        btn.addEventListener('pointermove', (e) => {
          if (e.pointerType === 'touch' || !btnRect) return;

          // ΔΙΟΡΘΩΣΗ: Απόλυτη σταθερότητα με το pageX/pageY
          const distanceX = e.pageX - absCenterX;
          const distanceY = e.pageY - absCenterY;
          
          // Δύναμη Μαγνήτη (0.2 = Το κουμπί ακολουθεί τον κέρσορα κατά 20%)
          const pullX = distanceX * 0.2;
          const pullY = distanceY * 0.2;

        if (btnRafId) cancelAnimationFrame(btnRafId); // Σταματάει το προηγούμενο καρέ

          btnRafId = requestAnimationFrame(() => {
            // Μετακινούμε το κουμπί ομαλά προς το ποντίκι!
            btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.02)`;
            btn.style.transition = 'transform 0.1s ease-out'; // Ακαριαία κίνηση
          });
        });

      // Όταν το ποντίκι φεύγει, το κουμπί κάνει "snap" πίσω στη θέση του
        btn.addEventListener('pointerleave', (e) => {
          if (e.pointerType === 'touch') return;
          if (btnRafId) cancelAnimationFrame(btnRafId); // Καθαρισμός μνήμης

          btnRafId = requestAnimationFrame(() => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          });
        });
      }

   btn.addEventListener('pointerdown', function(e) {
        const rect = btn.getBoundingClientRect();
        
        // Αφαιρέθηκε η βίαιη διαγραφή. Επιτρέπουμε στα κύματα (ripples) να 
        // αλληλεπικαλύπτονται ομαλά σε περίπτωση που ο χρήστης κάνει απανωτά κλικ.
        
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

 })();



;(() => {
  "use strict";
 // RADIO
    const radioFirebaseConfig = {
    apiKey: "AIzaSyBgMaOIrweK1TEbftuqRxe4MR5vnQ8YSwE",
    authDomain: "radio-a01e3.firebaseapp.com",
    projectId: "radio-a01e3",
    storageBucket: "radio-a01e3.firebasestorage.app",
    messagingSenderId: "60074075391",
    appId: "1:60074075391:web:c3da8f4de9e770022618ca",
    measurementId: "G-SVR0SLHGWJ",
    databaseURL: "https://radio-a01e3-default-rtdb.europe-west1.firebasedatabase.app"
  };


  let radioApp;
  let radioDb;

  // --- CONFIGURATION ---
  const CONFIG = Object.freeze({
    loopModes: ['Κλειστή', 'Όλη η λίστα', 'Ένα τραγούδι'],
    loopClasses: ['loop-btn', 'loop-btn active-loop-all', 'loop-btn active-loop-one'],
    icons: ['🔁', '🔁', '🔂'], // <--- Μπήκε το κόμμα!
    visualizerClass: 'is-playing'
  });

  const STATE = {
    loopModeIndex: 1,
    fadeInterval: null,
    targetVolume: 1,
    isFading: false,
    playToken: 0
  };

  // --- JUKEBOX MANAGER ---
  const JukeboxManager = {
    // 1. Δημιουργούμε ένα άδειο αντικείμενο για το DOM
    dom: {},
    // --- 0. ΚΟΥΜΠΙ ΕΠΑΝΑΛΗΨΗΣ (LOOP TOGGLE) ---
    toggleLoop: () => {
      if (navigator.vibrate) navigator.vibrate(10); 
      
      // Κυκλική εναλλαγή (0 -> 1 -> 2 -> 0)
      STATE.loopModeIndex = (STATE.loopModeIndex + 1) % 3;
      const idx = STATE.loopModeIndex;
      const els = JukeboxManager.dom;
      
     if (els.loopBtn) {
        els.loopBtn.innerHTML = `${CONFIG.icons[idx]} Επανάληψη: ${CONFIG.loopModes[idx]}`;
        els.loopBtn.className = CONFIG.loopClasses[idx];
      }
      
      // ΝΕΟ: Ενεργοποιούμε το εγγενές (native) gapless loop του browser 
      // ΜΟΝΟ όταν επιλέγεται το "Ένα τραγούδι" (idx === 2)
      if (els.player) {
          els.player.loop = (idx === 2);
      }
    },
// --- 1. ΟΜΑΛΗ ΜΕΤΑΒΑΣΗ (FADE IN/OUT) - BULLETPROOF ---
    fadeAudio: (targetVolume, duration) => {
      return new Promise((resolve) => {
        const player = JukeboxManager.dom.player;
        if (!player) return resolve();
        
        clearInterval(STATE.fadeInterval);
        
        // ΝΕΟ: Αν το tab/οθόνη είναι στο παρασκήνιο, ακυρώνουμε το fade 
        // για να αποφύγουμε σιγή 15 δευτερολέπτων λόγω throttling του browser!
        if (document.hidden) {
            STATE.isFading = false;
            try { player.volume = targetVolume; } catch(e) {}
            return resolve();
        }

        STATE.isFading = true; // Κλειδώνουμε: Τον ήχο τον αλλάζει ο υπολογιστής!
        
        try { player.volume = player.volume; } catch(e) {
           STATE.isFading = false;
           return resolve(); 
        }
        
        const steps = 15; // Πιο γρήγορα βήματα (Για να προλαβαίνει τα γρήγορα Swipes)
        const stepTime = duration / steps;
        const volumeStep = (targetVolume - player.volume) / steps;
        let currentStep = 0;

       STATE.fadeInterval = setInterval(() => {
          // ΝΕΟ: Αν το tab πάει στο background ΚΑΤΑ ΤΗ ΔΙΑΡΚΕΙΑ του fade, ολοκλήρωσε το ακαριαία
          // για να αποτρέψεις το background throttling του browser (σιγή 15 δευτερολέπτων).
          if (document.hidden) {
              clearInterval(STATE.fadeInterval);
              try { player.volume = targetVolume; } catch(e) {}
              STATE.isFading = false;
              return resolve();
          }

          currentStep++;
          let newVol = player.volume + volumeStep;
          if (newVol > 1) newVol = 1;
          if (newVol < 0) newVol = 0;
          
          player.volume = newVol;

          if (currentStep >= steps || (volumeStep > 0 && newVol >= targetVolume) || (volumeStep < 0 && newVol <= targetVolume)) {
            clearInterval(STATE.fadeInterval);
            player.volume = targetVolume;
            STATE.isFading = false; // Ξεκλειδώνουμε!
            resolve();
          }
        }, stepTime);
      });
    },

    // --- 2. ΟΘΟΝΗ ΚΛΕΙΔΩΜΑΤΟΣ (MEDIA SESSION) ---
    setupMediaSession: (title) => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title,
          artist: 'Δ.Σ. Περίστασης',
          album: 'Radio & Podcast',
          artwork: [
            // Βάλε το URL ενός λογοτύπου (π.χ. .png 512x512) για να φαίνεται στην οθόνη του κινητού!
            { src: 'https://cdn-icons-png.flaticon.com/512/1256/1256083.png', sizes: '512x512', type: 'image/png' }
          ]
        });
     navigator.mediaSession.setActionHandler('play', () => JukeboxManager.dom.player.play().catch(()=>{}));
        navigator.mediaSession.setActionHandler('pause', () => JukeboxManager.dom.player.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => JukeboxManager.playNextOrPrev(1));
        navigator.mediaSession.setActionHandler('previoustrack', () => JukeboxManager.playNextOrPrev(-1));
      }
    },
    // --- 3. ΑΙΣΘΗΤΗΡΕΣ (ΜΑΓΝΗΤΙΚΑ ΚΟΥΜΠΙΑ & ΓΥΡΟΣΚΟΠΙΟ) ---
   // ΜΕΤΑ:
   // ΜΕΤΑ:
   setupSensors: () => {
      // Α. ΜΑΓΝΗΤΙΚΑ ΚΟΥΜΠΙΑ (Desktop)
      const buttons = document.querySelectorAll('.playlist-btn, .extra-track-btn');
      
      // ΑΛΛΑΓΗ: Τα εφαρμόζουμε αυστηρά μόνο σε συσκευές που υποστηρίζουν hover (ποντίκι). 
      // Αλλιώς, στις οθόνες αφής τα κουμπιά θα κολλήσουν μετατοπισμένα!
    if (window.matchMedia("(hover: hover)").matches) {
          buttons.forEach(btn => {
            let magnetTimeout;
            let cachedRect = null; // ΝΕΟ: Αποθήκευση διαστάσεων στη μνήμη

            // Υπολογίζουμε τις διαστάσεις ΜΟΝΟ μια φορά, όταν το ποντίκι μπαίνει στο κουμπί
          let cachedCenterX, cachedCenterY;

            // Υπολογίζουμε τις διαστάσεις ΜΟΝΟ μια φορά, όταν το ποντίκι μπαίνει στο κουμπί
            btn.addEventListener('mouseenter', () => {
                const currentTransform = btn.style.transform;
                btn.style.transform = 'none';
                const rect = btn.getBoundingClientRect();
                
                // Υπολογίζουμε το απόλυτο κέντρο σε σχέση με όλο το έγγραφο (προσθέτοντας το scroll)
                cachedCenterX = rect.left + window.scrollX + rect.width / 2;
                cachedCenterY = rect.top + window.scrollY + rect.height / 2;
                
                btn.style.transform = currentTransform;
            });

            btn.addEventListener('mousemove', (e) => {
              clearTimeout(magnetTimeout);
              if (!cachedCenterX) return; // Fallback ασφαλείας
         
              // Χρησιμοποιούμε τα pageX/pageY για τέλεια ακρίβεια ανεξάρτητα από το scroll του χρήστη!
              const x = e.pageX - cachedCenterX;
              const y = e.pageY - cachedCenterY;
          
          btn.dataset.tx = x * 0.3;
          btn.dataset.ty = y * 0.3;
          
          btn.style.transition = 'transform 0.1s ease-out';
          btn.style.transform = `translate(${btn.dataset.tx}px, ${btn.dataset.ty}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.dataset.tx = 0;
          btn.dataset.ty = 0;
          // Ελαστική αναπήδηση (Bouncy Effect) όταν το ποντίκι φεύγει
          btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          btn.style.transform = 'translate(0px, 0px)';
          
          // Καθαρίζουμε το inline CSS μετά από 0.5s για να μην χαλάσει τα hover χρώματα του CSS σου
         magnetTimeout = setTimeout(() => { 
            btn.style.transition = ''; 
            btn.style.transform = ''; 
          }, 500);
        });
      });
        }

    // Β. ΓΥΡΟΣΚΟΠΙΚΟ PARALLAX (Κινητά/Tablets)
      const container = document.querySelector('.jukebox-container');
      
      if (window.DeviceOrientationEvent && container) {
        
   // 1. Βάζουμε τη λογική του γυροσκοπίου σε μια συνάρτηση
        let isTicking = false; // Μηχανισμός Throttling για τα καρέ της οθόνης
        const handleOrientation = (e) => {
          
          if (e.beta == null || e.gamma == null) return;
          if (container.dataset.isSwiping === 'true') return;

          if (!isTicking) {
              window.requestAnimationFrame(() => {
                  let tiltX = Math.max(-2, Math.min(2, (e.beta - 45) / 3));
                  let tiltY = Math.max(-2, Math.min(2, e.gamma / 3));

                  // Αφαιρούμε το transition ώστε να εφαρμόζεται ακαριαία χωρίς να φρακάρει η GPU
                  container.style.transition = 'none';
                  container.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
                  container.style.boxShadow = `${tiltY}px ${tiltX}px 32px rgba(0, 0, 0, 0.1)`;
                  isTicking = false;
              });
              isTicking = true;
          }
        };

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Ακυρώθηκε η κλήση στο iOS. Η εμφάνιση του συστημικού popup καταναλώνει 
            // το κλικ (user gesture) και μπλοκάρει/απαγορεύει την αναπαραγωγή του Safari!
            return;
        } else {
            // Android & PC: Δεν απαιτούν άδεια, συνδέονται απευθείας
            window.addEventListener('deviceorientation', handleOrientation);
        }
      }
    },

    // --- 4. ΖΩΝΤΑΝΟΣ ΠΑΛΜΟΣ (ΑΛΗΘΙΝΟ FIREBASE PRESENCE) ---
    setupPulse: () => {
      const header = document.querySelector('.juke-header');
      if (!header) return;
      
      const pulseDiv = document.createElement('div');
      pulseDiv.style.cssText = 'font-size: 13px; color: #e74c3c; font-weight: 600; text-align: center; margin-bottom: 12px; margin-top: -5px;';
      header.parentNode.insertBefore(pulseDiv, header.nextSibling);

     if (!document.getElementById('pulse-css')) {
          const style = document.createElement('style');
          style.id = 'pulse-css';
          style.innerHTML = `@keyframes pulseAnim { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`;
          document.head.appendChild(style);
      }

      // --- 1. ΑΣΠΙΔΑ BOTS (Λύση για PageSpeed / Ghost Listeners) ---
      const isBot = navigator.webdriver || /bot|crawler|spider|lighthouse|pagespeed|gtmetrix|ptst|headless|chrome-lighthouse/i.test(navigator.userAgent);
      
      if (isBot) {
          pulseDiv.innerHTML = `<span style="display: inline-block;">🤖</span> Αναμονή... (Ανίχνευση Bot)`;
          return; // Σταματάει την εκτέλεση! Το ρομπότ δεν εγγράφεται ΠΟΤΕ στο Firebase.
      }
      // --------------------------------------------------------------

      pulseDiv.innerHTML = `<span style="display: inline-block;">⏳</span> Σύνδεση με Live Server...`;
// Η συνάρτηση που κάνει την πραγματική σύνδεση
      const connectFirebase = () => {
        try {
          // ΑΡΧΙΚΟΠΟΙΗΣΗ ΜΕ ΑΣΦΑΛΕΙΑ ΕΔΩ:
          radioApp = !firebase.apps.find(app => app.name === 'radioApp')
            ? firebase.initializeApp(radioFirebaseConfig, 'radioApp')
            : firebase.app('radioApp');
          
          radioDb = firebase.database(radioApp);
          const db = radioDb;
          
        const listenersRef = db.ref('jukebox_active_listeners');
          const connectedRef = db.ref('.info/connected'); 

          // ΝΕΟ: Timeout προστασίας αν το Firewall του σχολείου μπλοκάρει τη ζωντανή σύνδεση
          let connectionTimeout = setTimeout(() => {
              if (pulseDiv) pulseDiv.innerHTML = `<span style="display: inline-block;">📻</span> Live Ραδιόφωνο`;
          }, 8000);

     let myConnectionRef = null;
          let forceDisconnect = () => { if (myConnectionRef) try { myConnectionRef.remove(); } catch(e){} };

          connectedRef.on('value', (snap) => {
             if (snap.val() === true) {
               clearTimeout(connectionTimeout); // Η σύνδεση πέτυχε, ακυρώνουμε το timeoutconst listenersRef = db.ref('jukebox_active_listeners');
               if (myConnectionRef) { forceDisconnect(); } // Καθαρισμός προηγούμενης (νεκρής) σύνδεσης

               myConnectionRef = listenersRef.push(); 
               myConnectionRef.onDisconnect().remove();
               myConnectionRef.set(true);

             window.removeEventListener('beforeunload', forceDisconnect);
               window.addEventListener('beforeunload', forceDisconnect);
               
               // ΔΙΑΓΡΑΦΗΚΑΝ τα pagehide / pageshow. 
               // Όσο το audio παίζει με κλειδωμένη οθόνη, η σύνδεση παραμένει ζωντανή.
               // Το .onDisconnect() του Firebase θα αναλάβει μόνο του τη σωστή διαγραφή όταν κλείσει εντελώς το tab/browser.
             }
          });

          // 2. Ακούμε ζωντανά τις αλλαγές
          listenersRef.on('value', (snapshot) => {
             const total = snapshot.numChildren() || 0; 
             const word = total === 1 ? 'ακούει τώρα' : 'ακούνε τώρα';
             pulseDiv.innerHTML = `<span style="animation: pulseAnim 2s infinite; display: inline-block;">🔴</span> ${total} ${word}`;
          });

        } catch(e) {
          console.error("Σφάλμα Firebase:", e);
          pulseDiv.innerHTML = `<span style="animation: pulseAnim 2s infinite; display: inline-block;">🔴</span> Live Ραδιόφωνο`;
        }
      };

    let attempts = 0;
      const checkAndConnect = () => {
          // ΔΙΟΡΘΩΣΗ 1: Ελέγχουμε αυστηρά αν έχει φορτώσει ΚΑΙ η Βάση Δεδομένων
          if (typeof firebase !== 'undefined' && typeof firebase.database === 'function') {
              connectFirebase();
          } else if (attempts < 20) { // Δοκιμάζει 20 φορές (σύνολο 10 δευτερόλεπτα αναμονής)
              attempts++;
              setTimeout(checkAndConnect, 500);
          } else {
              // ΔΙΟΡΘΩΣΗ 2: Καθαρό Fallback μήνυμα αν μπλοκαριστεί πλήρως από AdBlockers / Firewalls
              pulseDiv.innerHTML = `<span style="display: inline-block;">📻</span> Live Ραδιόφωνο`;
          }
      };
      checkAndConnect();
    },

   
    // --- 6. PICTURE-IN-PICTURE (Mini Player) ---
    setupPiP: () => {
       // Ελέγχουμε αν υπάρχει PiP ΚΑΙ αν ο browser υποστηρίζει captureStream (αλλιώς το κρύβουμε)
        if (!document.pictureInPictureEnabled || !document.createElement('canvas').captureStream) return;
        
        const loopBtn = document.getElementById('loop-btn');
        if (!loopBtn) return;

        // Φτιάχνουμε δυναμικά το κουμπί PiP δίπλα στο Loop
        const pipBtn = document.createElement('button');
        pipBtn.innerHTML = '📺 Mini Player';
        pipBtn.className = 'loop-btn';
        pipBtn.style.marginRight = '8px';
        loopBtn.parentNode.insertBefore(pipBtn, loopBtn);

     // Το Μυστικό: Αόρατος καμβάς και βίντεο
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 200;
        const ctx = canvas.getContext('2d');
        const video = document.createElement('video'); 
        video.muted = true;
        
        // ΝΕΟ (Ασπίδα iOS): Αποτρέπει την αναγκαστική, μαύρη πλήρη οθόνη (Fullscreen) στα iPhone!
        video.playsInline = true;
        video.setAttribute('playsinline', ''); 

       let isPipOpening = false; // ΝΕΟ: Ασπίδα για να μην παίζει μουσική μόνο του κατά το άνοιγμα

     video.addEventListener('play', () => { 
            if (!isPipOpening && JukeboxManager.dom.player.paused) JukeboxManager.dom.player.play().catch(()=>{}); 
        });
        video.addEventListener('pause', () => { 
            // Μην κλείσεις τη μουσική αν το παραθυράκι του PiP ΔΕΝ υπάρχει πια (δηλ. αν πατήθηκε το "X")
            if (document.pictureInPictureElement === video && !JukeboxManager.dom.player.paused) {
                JukeboxManager.dom.player.pause(); 
            }
        });

      // Συγχρονισμός Σελίδας -> PiP (ΔΙΟΡΘΩΣΗ: Εκτέλεση μόνο όταν το PiP είναι ανοιχτό!)
        JukeboxManager.dom.player.addEventListener('play', () => { 
            if (document.pictureInPictureElement === video && video.paused) video.play().catch(()=>{}); 
        });
        JukeboxManager.dom.player.addEventListener('pause', () => { 
            if (document.pictureInPictureElement === video && !video.paused) video.pause(); 
        });

        let drawInterval;
        const drawFrame = () => { 
           ctx.fillStyle = '#1e272e'; ctx.fillRect(0, 0, 400, 200);
           // ΜΕΤΑ:
           ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
           ctx.font = '22px Arial'; ctx.fillText('📻 Radio Δ.Σ. Περίστασης', 200, 50);
           const els = JukeboxManager.dom;
           // ΑΛΛΑΓΗ: Το textContent σταματάει το Layout Thrashing (Τεράστια εξοικονόμηση μπαταρίας/CPU)
         const trackName = els.textTarget ? els.textTarget.textContent : '';
           ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#e74c3c';
           ctx.fillText(trackName, 200, 110, 380);
       // ΝΕΟ: Συγχρονίζουμε το PiP αυστηρά με την κλάση is-playing του κεντρικού player για να σταματάει στο Buffering!
           const isPlaying = els.visualizer && els.visualizer.classList.contains(CONFIG.visualizerClass);
           
           if (isPlaying && els.player && !els.player.ended) {
               ctx.fillStyle = '#ffffff';
               for(let i=0; i<6; i++) { let h = 10 + Math.random() * 25; ctx.fillRect(145 + (i*20), 180 - h, 10, h); }
           }
        };

      pipBtn.addEventListener('click', async () => {
        if (isPipOpening) return;
           // Ελέγχουμε αυστηρά αν το PiP που είναι ήδη ανοιχτό είναι το δικό μας κρυφό βίντεο!
           if (document.pictureInPictureElement === video) { 
               await document.exitPictureInPicture(); 
               return; 
           }
        // ΝΕΟ: Ζωγραφίζουμε το πρώτο καρέ ΠΡΙΝ ζητήσουμε το stream, αλλιώς Firefox/Safari βγάζουν μαύρη οθόνη ή Error!
           drawFrame();

           if (!video.srcObject) video.srcObject = canvas.captureStream(15);
      
           clearInterval(drawInterval);
           drawInterval = setInterval(drawFrame, 100);

           isPipOpening = true;
           try { 
               await video.play(); 
               // Αν η μουσική ήταν σε Παύση, βάζουμε παύση και στο βίντεο αμέσως, ώστε 
               // το εικονίδιο στο PiP να δείχνει "Play" και να μη ξεκινήσει η μουσική
            if (JukeboxManager.dom.player.paused) {
                   video.pause();
               }
               await video.requestPictureInPicture(); 
           } catch(e) { 
               clearInterval(drawInterval);
               video.pause(); // ΝΕΟ: Αν το PiP αποτύχει ή μπλοκαριστεί, σταματάμε αμέσως το κρυφό βίντεο!
               console.warn("PiP blocked by browser", e); 
           } finally {
               setTimeout(() => { isPipOpening = false; }, 100);
           }
        });

     video.addEventListener('leavepictureinpicture', () => {
            clearInterval(drawInterval);
            // ΑΛΛΑΓΗ: Απλώς κάνουμε παύση το βίντεο. Η καταστροφή των tracks 
            // ΑΦΑΙΡΕΘΗΚΕ διότι προκαλεί μόνιμη μαύρη οθόνη αν ο χρήστης ξανανοίξει το PiP!
            video.pause();
        });
    },
    // --- 7. TINDER-STYLE SWIPE NAVIGATION ---
    setupSwipeSupport: () => {
      const container = document.querySelector('.jukebox-container');
      if (!container) return;

      // Απαγορεύει στον browser να αλλάξει σελίδα (History Back/Forward) όταν κάνουμε Swipe!
      container.style.touchAction = 'pan-y';

      let startX = 0;
      let startY = 0; // ΝΕΟ
      let currentX = 0;
      let isDragging = false;
    let isVerticalScrolling = false; 
      let isHorizontalSwiping = false; // ΝΕΟ: Ασπίδα για τα "στραβά" swipes
      let isAnimatingSwipe = false; 
      let snapBackTimeout = null; 
      const SWIPE_THRESHOLD = 90;

  const handleDragStart = (e) => {
        if (isAnimatingSwipe) return;
        clearTimeout(snapBackTimeout); 
        
        // ΝΕΟ: Επαναφέρουμε την ασπίδα ΠΡΙΝ τον έλεγχο εξαιρέσεων! Αλλιώς, αν ο 
        // χρήστης είχε κάνει scroll νωρίτερα, το επόμενο κλικ στα "Επιπλέον Τραγούδια" θα μπλοκαριστεί.
        container.dataset.hasMoved = 'false'; 
        
        if (e.target.closest('.loop-btn, #toggle-more-btn, audio, .extra-tracks-wrapper, input')) return;
        
        container.dataset.isSwiping = 'true';
        
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY; 
        isDragging = true;
        isVerticalScrolling = false; 
        isHorizontalSwiping = false; // ΝΕΟ: Επαναφορά σε κάθε νέο άγγιγμα
        
        container.style.setProperty('transition', 'none', 'important');
      };

      const handleDragMove = (e) => {
        if (!isDragging || isVerticalScrolling) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY; // ΝΕΟ
        currentX = clientX - startX;
        const currentY = clientY - startY; // ΝΕΟ
  
    if (Math.abs(currentX) < 10 && Math.abs(currentY) < 10) return;
      container.dataset.hasMoved = 'true'; // ΝΕΟ: Καταγράφουμε ότι υπήρξε πραγματική κίνηση (όχι απλό κλικ)

        // ΝΕΟ: Αν το πρώτο 10px ξεπέρασμα έγινε οριζόντια, ΚΛΕΙΔΩΝΟΥΜΕ το swipe.
        if (!isHorizontalSwiping && !isVerticalScrolling && Math.abs(currentX) > Math.abs(currentY)) {
            isHorizontalSwiping = true;
        }
  
       // ΑΛΛΑΓΗ: Προστέθηκε ο έλεγχος !isHorizontalSwiping ώστε να αγνοηθεί η προσπάθεια μετατροπής σε scroll
       if (!isHorizontalSwiping && !isVerticalScrolling && Math.abs(currentY) > Math.abs(currentX) && Math.abs(currentY) > 10) {
            isVerticalScrolling = true;
            container.style.transition = '';
            container.style.transform = '';
            container.style.opacity = '1'; // ΑΛΛΑΓΗ: Επαναφέρουμε την ορατότητα, αλλιώς μένει διάφανο!
            return;
        }
        
        const resistance = currentX * 0.4;
        const tilt = currentX * 0.05;
        
        container.style.setProperty('transform', `translateX(${resistance}px) rotate(${tilt}deg)`, 'important');
        const opacity = Math.max(0.5, 1 - Math.abs(currentX) / 300);
        container.style.opacity = opacity.toString();
      };

     const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        // ΑΦΑΙΡΕΘΗΚΕ: ΜΗΝ ελευθερώνεις το isSwiping εδώ. Καταστρέφει το οπτικό animation της κάρτας!
        
        if (isVerticalScrolling) {
            currentX = 0;
            container.style.opacity = '1';
            container.dataset.isSwiping = 'false'; // Απελευθερώνουμε ΕΔΩ μόνο αν ακυρώθηκε το swipe λόγω scroll
            return;
        }

        container.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease', 'important');

        if (currentX < -SWIPE_THRESHOLD) {
          JukeboxManager.playNextOrPrev(1);
          animateSwipeOut('left');
        } else if (currentX > SWIPE_THRESHOLD) {
          JukeboxManager.playNextOrPrev(-1);
          animateSwipeOut('right');
      } else {
          container.style.setProperty('transform', 'translateX(0px) rotate(0deg)', 'important');
          container.style.opacity = '1';
          
          snapBackTimeout = setTimeout(() => { // ΝΕΟ: Ανάθεση του timeout στη μεταβλητή
              container.style.transition = '';
              container.style.transform = '';
              container.dataset.isSwiping = 'false'; // ΚΡΙΣΙΜΟ: Ελευθερώνουμε το γυροσκόπιο ΜΟΝΟ ΑΦΟΥ τελειώσει το animation των 400ms!
          }, 400);
        }
        
        currentX = 0; 
      };

  const animateSwipeOut = (direction) => {
         isAnimatingSwipe = true; 
         
         // ΝΕΟ: Κλειδώνουμε το οριζόντιο overflow της σελίδας για να μην εμφανιστεί σπασμωδικά μπάρα κύλισης στο blog!
         const originalOverflow = document.body.style.overflowX;
         document.body.style.overflowX = 'hidden';

         const moveOut = direction === 'right' ? window.innerWidth : -window.innerWidth;
         container.style.setProperty('transform', `translateX(${moveOut}px) rotate(${direction === 'right' ? 15 : -15}deg)`, 'important');
         container.style.opacity = '0';

         setTimeout(() => {
            container.style.setProperty('transition', 'none', 'important');
            container.style.setProperty('transform', `translateX(${-moveOut}px) rotate(0deg)`, 'important');
            
            // Το onHidden() διαγράφηκε γιατί το τραγούδι άλλαξε με ασφάλεια πριν το timeout
            
            setTimeout(() => {
               container.style.setProperty('transition', 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease', 'important');
               container.style.setProperty('transform', 'translateX(0px) rotate(0deg)', 'important');
               container.style.opacity = '1';
               
            setTimeout(() => {
                  container.style.transition = '';
                  container.style.transform = '';
                  isAnimatingSwipe = false; 
                  container.dataset.isSwiping = 'false'; // ΚΡΙΣΙΜΟ: Αν δεν το βάλεις εδώ, μετά την πρώτη αλλαγή τραγουδιού το Parallax νεκρώνει για πάντα!
                  
                  // ΝΕΟ: Επαναφορά του layout του Blog στην αρχική του κατάσταση
                  document.body.style.overflowX = originalOverflow;
               }, 500);
            }, 50);
         }, 400); // ΔΙΟΡΘΩΣΗ: Πρέπει να συγχρονιστεί απόλυτα με τα 400ms του CSS transition (transform 0.4s) για να μην "σπάει" η εικόνα!
      };

      // Συνδέουμε τα Events για Οθόνες Αφής (Touch / Κινητά)
      container.addEventListener('touchstart', handleDragStart, { passive: true });
      container.addEventListener('touchmove', handleDragMove, { passive: true });
      container.addEventListener('touchend', handleDragEnd);
      container.addEventListener('touchcancel', handleDragEnd);

   // Συνδέουμε τα Events για Ποντίκι (Για να μπορείς να το δοκιμάσεις και στο PC)
      container.addEventListener('dragstart', (e) => e.preventDefault()); // ΝΕΟ: Αποτρέπει το μόνιμο "πάγωμα" του swipe στους υπολογιστές!
      container.addEventListener('mousedown', handleDragStart);
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('mouseleave', handleDragEnd);
    },

   // 7Β. Η βοηθητική λογική για Swipe & Loop (Εύρεση τραγουδιού)
    playNextOrPrev: (direction) => {
      const allBtns = Array.from(document.querySelectorAll('.playlist-btn[data-url], .extra-track-btn[data-url]'));
      const activeBtn = document.querySelector('.track-active');
      
      if (allBtns.length === 0) return;
      
     // Αν δεν παίζει τίποτα και ζητήσουμε το Προηγούμενο (-1), το index ξεκινάει από 0 για να βρει το τελευταίο
      let currentIndex = activeBtn ? allBtns.indexOf(activeBtn) : (direction === 1 ? -1 : 0);
      let attempts = 0;
      
      while (attempts < allBtns.length) {
         // Προχωράμε μπρος ή πίσω κυκλικά
         currentIndex = (currentIndex + direction + allBtns.length) % allBtns.length;
       const targetBtn = allBtns[currentIndex];
         const targetUrl = targetBtn.dataset.url || "";
         // ΝΕΟ: Fallback κείμενο και για την αυτόματη εναλλαγή!
         const targetName = targetBtn.dataset.name || targetBtn.textContent.trim() || "Άγνωστο Κομμάτι";
         
    // Αν το κουμπί έχει πραγματικό link (http) και όχι "LINK_3", παίξ'το!
        if (targetUrl.trim() !== "" && !targetUrl.includes('LINK_')) {
       
            if (targetBtn === activeBtn && !JukeboxManager.dom.player.ended) return;
        
            JukeboxManager.playTrack(targetBtn, targetUrl, targetName);
            break;
         }
         attempts++;
      }
    },

    init: () => {
      // 2. Βρίσκουμε τα στοιχεία ΤΩΡΑ που έχει φορτώσει η σελίδα! (Απόλυτη ασφάλεια)
      JukeboxManager.dom = {
        player: document.getElementById('main-juke-player'),
        source: document.getElementById('juke-audio-source'),
        display: document.getElementById('juke-track-display'),
        textTarget: document.getElementById('juke-text-target'), // <-- ΠΡΟΣΘΕΣΕ ΑΥΤΗ ΤΗ ΓΡΑΜΜΗ
        visualizer: document.getElementById('juke-visualizer'),
        wrapper: document.getElementById('extra-tracks-wrapper'),
        loopBtn: document.getElementById('loop-btn'),
        moreBtn: document.getElementById('toggle-more-btn')
      };

    const els = JukeboxManager.dom;
      if (!els.player) return; // Αν λείπει το widget, σταματάμε ομαλά

    // ΔΙΟΡΘΩΣΗ: Σεβόμαστε τη μνήμη του browser, ΑΛΛΑ προστατεύουμε από το κόλλημα της σίγασης.
      // Αν ο χρήστης ανανέωσε τη σελίδα πάνω στο Fade-In, ο browser αποθηκεύει ένταση κοντά στο 0.
      if (els.player.volume > 0.05 && els.player.volume <= 1) {
          STATE.targetVolume = els.player.volume;
      } else {
          STATE.targetVolume = 1; // Επαναφορά στο 100% 
          try { els.player.volume = 1; } catch(e) {}
      }

      // Συγχρονισμός του native loop μόλις φορτώσει το script
      els.player.loop = (STATE.loopModeIndex === 2);

   // Events
      els.player.addEventListener('ended', JukeboxManager.handleTrackEnd);
      
      // ΝΕΟ: Ενημέρωση της οθόνης αν πέσει το ίντερνετ ή η μετάδοση του σταθμού
      els.player.addEventListener('error', () => {
          if (els.textTarget) els.textTarget.textContent = "⚠️ Σφάλμα Δικτύου / Αποτυχία";
          if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
          STATE.isFading = false;
      });

      // ΑΛΛΑΓΗ: Το 'play' έγινε 'playing' για να μην κινείται το visualizer κατά τη διάρκεια του buffering!
      els.player.addEventListener('playing', () => { if (els.visualizer) els.visualizer.classList.add(CONFIG.visualizerClass); });
      els.player.addEventListener('pause', () => { if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass); });
      // ΔΙΟΡΘΩΣΗ: Όταν κάνει buffering (αναμονή φόρτωσης), σταματάμε το visualizer!
      els.player.addEventListener('waiting', () => { if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass); });
      
      if (els.loopBtn) els.loopBtn.addEventListener('click', JukeboxManager.toggleLoop);

      if (els.moreBtn) {
        els.moreBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          els.wrapper.classList.toggle('open');
        });
      }

      document.addEventListener('click', JukeboxManager.handleGlobalClick);
 // 1. Αποθήκευση της έντασης ΜΟΝΟ αν ο χρήστης την αλλάξει με το χέρι
      els.player.addEventListener('volumechange', (e) => {
         // ΔΙΟΡΘΩΣΗ: Επαναφορά του ελέγχου !STATE.isFading.
         // Το e.isTrusted επιστρέφει true ΚΑΙ στις αλλαγές μέσω JS στο audio.volume!
         if (!STATE.isFading && els.player.volume >= 0 && els.player.volume <= 1) {
             STATE.targetVolume = els.player.volume;
         }
      });
      JukeboxManager.setupSensors();
      // Εκκίνηση "Next-Gen" Λειτουργιών
      JukeboxManager.setupPulse();
      JukeboxManager.setupPiP();
      // Ενεργοποίηση Swipe (Tinder-Style)
      JukeboxManager.setupSwipeSupport();
    },

    playTrack: (button, url, name) => {
      if (navigator.vibrate) navigator.vibrate(15); 
      const els = JukeboxManager.dom;
      
  // ΜΕΤΑ:
      if (button && button.classList.contains('track-active')) {
          // ΝΕΟ: Αν υπήρξε διακοπή δικτύου, το stream σπάει (error). 
          // Το load() "ανασταίνει" το ραδιόφωνο και το συνδέει ξανά!
          if (els.player.error) els.player.load();
          
          if (els.player.paused) {
             if (els.player.ended) els.player.currentTime = 0;
            // ΑΛΛΑΓΗ: Ρίχνουμε την ένταση στο 0 πριν παίξει, αλλιώς το Fade-In ΔΕΝ θα δουλέψει!
             clearInterval(STATE.fadeInterval);
             STATE.isFading = true;
             
             // ΝΕΟ: Αναβάθμιση του playToken και στην επαναλειτουργία (Resume), για να 
             // μην ακυρωθεί βίαια το Fade-In αν ο χρήστης πατήσει γρήγορα άλλο τραγούδι!
             STATE.playToken++;
             const currentToken = STATE.playToken;

             try { els.player.volume = 0; } catch(e) {}
             
             els.player.play().then(() => {
                 if (currentToken !== STATE.playToken) return;
                 JukeboxManager.fadeAudio(STATE.targetVolume, 600);
             }).catch(()=>{ 
                 if (currentToken !== STATE.playToken) return;
                 STATE.isFading = false;
                 try { els.player.volume = STATE.targetVolume; } catch(e) {}
             });
          } else {
             // ΔΙΟΡΘΩΣΗ: Αν παίζει ήδη, κάνουμε Παύση
             els.player.pause();
             clearInterval(STATE.fadeInterval); // ΑΛΛΑΓΗ: Πρέπει να σκοτώσουμε το φάντασμα interval!
             STATE.isFading = false;
          }
          return;
      }
      
      const executeChange = () => {
        els.player.pause();
        
      // ΔΙΟΡΘΩΣΗ (iOS): Το src μπαίνει απευθείας στο audio, OXI στο <source>!
        els.player.src = url;
        els.player.load();

        // ΝΕΟ: Χρήση textContent αντί για innerHTML για απόλυτη προστασία από σύμβολα < ή >
        if (els.textTarget) els.textTarget.textContent = name;
        if (typeof JukeboxManager.setupMediaSession === 'function') JukeboxManager.setupMediaSession(name);

        clearInterval(STATE.fadeInterval);
        STATE.isFading = true; 
        
        // ΔΙΟΡΘΩΣΗ (Race Condition): Ταυτότητα στην τρέχουσα εντολή
        STATE.playToken++;
        const currentToken = STATE.playToken;

    try { 
            els.player.volume = 0; 
            // ΝΕΟ: Αφαιρούμε τη σίγαση (mute) ώστε το νέο κομμάτι να ακουστεί 
            // σίγουρα, ακόμα κι αν ο χρήστης το είχε κάνει mute νωρίτερα!
            els.player.muted = false;
        } catch(e) {}
        
        els.player.play().then(() => {
          if (currentToken !== STATE.playToken) return; // Ακύρωση αν πατήθηκε άλλο ενδιάμεσα
          JukeboxManager.fadeAudio(STATE.targetVolume, 600); 
       // ΜΕΤΑ:
        }).catch(err => {
          if (currentToken !== STATE.playToken) return; // ΜΗΝ ξεκλειδώνεις αν ανήκει σε παλιό κλικ!

          if (err.name === 'AbortError') {
              // ΑΛΛΑΓΗ: Πρέπει να επαναφέρουμε την ένταση, αλλιώς ο player παγιδεύεται στο 0 (σίγαση)!
              try { els.player.volume = STATE.targetVolume; } catch(e) {}
              STATE.isFading = false; 
              return;
          }

          console.warn("Η αυτόματη αναπαραγωγή μπλοκαρίστηκε.");
          if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
          try { els.player.volume = STATE.targetVolume; } catch(e) {}
          STATE.isFading = false;
        });
        
        document.querySelectorAll('.playlist-btn, .extra-track-btn').forEach(btn => btn.classList.remove('track-active'));
        if (button) button.classList.add('track-active');
      };

      executeChange();
    },

  handleTrackEnd: () => {
      const els = JukeboxManager.dom;

      if (STATE.loopModeIndex === 1) {
        // Λειτουργία 1: "Όλη η λίστα" - Πάμε στο επόμενο
        JukeboxManager.playNextOrPrev(1);
      } else if (STATE.loopModeIndex === 0) {
        // ΝΕΟ: Λειτουργία 0 "Κλειστή" - Το τραγούδι τελείωσε. Το 'pause' δεν πυροδοτείται, άρα κλείνουμε το Visualizer χειροκίνητα!
        if (els.visualizer) els.visualizer.classList.remove(CONFIG.visualizerClass);
      }
    },

handleGlobalClick: (e) => {
      // ΝΕΟ: Αν ο χρήστης μόλις ολοκλήρωσε σύρσιμο (swipe/scroll), αγνοούμε το 'click' του browser!
      const container = document.querySelector('.jukebox-container');
      if (container && container.dataset.hasMoved === 'true') {
          container.dataset.hasMoved = 'false';
          // ΔΙΟΡΘΩΣΗ: Ακυρώνουμε το κλικ ΜΟΝΟ αν προέρχεται μέσα από το ραδιόφωνο. 
          // Έτσι ΔΕΝ σπάμε την πλοήγηση στους υπόλοιπους συνδέσμους (links) του Blog!
          if (container.contains(e.target)) {
              e.preventDefault();
          }
          return;
      }

      const els = JukeboxManager.dom;
      
      // Στοχεύουμε ΑΥΣΤΗΡΑ μόνο τα στοιχεία του Jukebox για να μην σπάσουμε το υπόλοιπο site
     const trackBtn = e.target.closest('.playlist-btn[data-url], .extra-track-btn[data-url]');
      if (trackBtn) {
     const url = trackBtn.dataset.url;
        // ΝΕΟ: Fallback κείμενο αν ξεχαστεί το data-name στο HTML
        const name = trackBtn.dataset.name || trackBtn.textContent.trim() || "Άγνωστο Κομμάτι";
        
        // ΑΛΛΑΓΗ: Αφαιρέθηκε η απαίτηση ύπαρξης του "name" από τον έλεγχο
        if (url && url.trim() !== "" && !url.includes('LINK_')) {
             JukeboxManager.playTrack(trackBtn, url, name);
        }
        
        // ΑΛΛΑΓΗ (Bug 2): Πρέπει να κλείσουμε το μενού αφού επιλέχθηκε τραγούδι!
        if (els.wrapper && els.wrapper.classList.contains('open')) {
            els.wrapper.classList.remove('open');
        }
        return; 
      }

      if (els.wrapper && els.wrapper.classList.contains('open')) {
         if (!els.wrapper.contains(e.target) && (!els.moreBtn || !els.moreBtn.contains(e.target))) {
           els.wrapper.classList.remove('open');
         }
      }
    }
  };

  // Bulletproof Φόρτωση
  if (document.readyState === "loading") {
      document.addEventListener('DOMContentLoaded', JukeboxManager.init);
  } else {
      JukeboxManager.init();
  }

})();

;(() => {
  "use strict";

  // LIVE
  const CONFIG = { // Προσοχή: Αφαιρέθηκε το Object.freeze
    schedule: [
      { start: "08:15", end: "09:00", name: "1η Διδακτική", type: "class", nextIsBreak: false },
      { start: "09:00", end: "09:40", name: "2η Διδακτική", type: "class", nextIsBreak: true },
      { start: "09:40", end: "10:00", name: "1ο Διάλειμμα", type: "break" },
      { start: "10:00", end: "10:45", name: "3η Διδακτική", type: "class", nextIsBreak: false },
      { start: "10:45", end: "11:30", name: "4η Διδακτική", type: "class", nextIsBreak: true },
      { start: "11:30", end: "11:45", name: "2ο Διάλειμμα", type: "break" },
      { start: "11:45", end: "12:25", name: "5η Διδακτική", type: "class", nextIsBreak: true },
      { start: "12:25", end: "12:35", name: "3ο Διάλειμμα", type: "break" },
      { start: "12:35", end: "13:15", name: "6η Διδακτική", type: "class", nextIsBreak: false }
    ],
    timeThresholds: {
      afternoon: 13 * 60 + 15,
      evening: 17 * 60,
      nightStart: 21,
      nightEnd: 8
    },
    radarMessages: {} // Άδειο αντικείμενο! Θα γεμίσει δυναμικά από το JSON
  };

const STATE = {
    isShowingRadar: false,
    radarTimeout: null,
    usedMessages: {},
    lastMessageIndex: {},
    // --- ΝΕΕΣ ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΤΑ ΕΦΕ ---
   isHovering: false,       // Για το Pause on Hover
    typewriterInterval: null, // Για τη γραφομηχανή
    gyroEnabled: false,
    gyroTicking: false       // [FIX] Κλειδαριά προστασίας για το memory leak του γυροσκοπίου
  };

  const DOM = {
    mainEl: null, subEl: null, progBg: null, progFill: null,
    liveDot: null, trackerTitle: null, trackerBox: null, minimap: null
  };

  const Utils = {
  timeToMins: (timeStr) => {
      // [FIX] Χρήση Regex: Επιτρέπει την ώρα να γραφτεί είτε με ":" είτε με "." και προστατεύει από ολικό κρασάρισμα!
      const [hours, minutes] = timeStr.split(/[:.]/);
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    },

    getHolidayStatus: (now) => {
      const year = now.getFullYear(), month = now.getMonth(), date = now.getDate();

      if (month === 9 && date === 28) return { main: "28η Οκτωβρίου 🇬🇷", sub: "Ζήτω η 28η Οκτωβρίου! Το σχολείο είναι κλειστό." };
      if (month === 10 && date === 17) return { main: "17η Νοεμβρίου 🎗️", sub: "Επέτειος Πολυτεχνείου. Ημέρα μνήμης." };
      if (month === 2 && date === 25) return { main: "25η Μαρτίου 🇬🇷", sub: "Ζήτω η 25η Μαρτίου! Χρόνια Πολλά!" };
      if (month === 4 && date === 1) return { main: "Πρωτομαγιά 🌺", sub: "Καλό μήνα! Το σχολείο είναι κλειστό σήμερα." };

      if ((month === 11 && date >= 24) || (month === 0 && date <= 7)) return { main: "Καλά Χριστούγεννα! 🎄✨", sub: "Καλές γιορτές και ευτυχισμένο το νέο έτος!" };
      if ((month === 5 && date >= 16) || month === 6 || month === 7 || (month === 8 && date <= 10)) return { main: "Καλό Καλοκαίρι! ☀️⛱️", sub: "Ραντεβού τον Σεπτέμβριο! Καλές βουτιές!" };

      const a = year % 19, b = year % 4, c = year % 7;
      const d = (19 * a + 15) % 30, e = (2 * b + 4 * c + 6 * d + 6) % 7;
      let pDay = 22 + d + e + 13, pMonth = 3;
      if (pDay > 31) { pDay -= 31; pMonth = 4; if (pDay > 30) { pDay -= 30; pMonth = 5; } }
      
      // [FIX] Ασφαλής υπολογισμός χωρίς 86400000ms (Αντιμετώπιση Daylight Saving Time)
      const easterStart = new Date(year, pMonth - 1, pDay - 6);
      const easterEnd = new Date(year, pMonth - 1, pDay + 7, 23, 59, 59);

      if (now >= easterStart && now <= easterEnd) {
        return { main: "Καλό Πάσχα! 🐣🌷", sub: "Το σχολείο είναι κλειστό για τις διακοπές του Πάσχα." };
      }

      const cleanMonday = new Date(year, pMonth - 1, pDay - 48);
      if (date === cleanMonday.getDate() && month === cleanMonday.getMonth()) return { main: "Καθαρά Δευτέρα 🪁", sub: "Καλά Κούλουμα! Το σχολείο είναι κλειστό." };

      const holySpirit = new Date(year, pMonth - 1, pDay + 50);
      if (date === holySpirit.getDate() && month === holySpirit.getMonth()) return { main: "Αγίου Πνεύματος 🙏", sub: "Τριήμερο Αγίου Πνεύματος. Το σχολείο είναι κλειστό." };

      return null;
    }
  };

 const AppManager = {
    init: () => {
      // --- ΝΕΟ: Φόρτωση δεδομένων από το JSON στο παρασκήνιο ---
      fetch("https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/live.json")
        .then(response => response.json())
        .then(data => {
          CONFIG.radarMessages = data.radarMessages;
        })
        .catch(error => console.error("Σφάλμα φόρτωσης δεδομένων ραντάρ:", error));
      // --------------------------------------------------------

      DOM.mainEl = document.getElementById("bell-main");
      DOM.subEl = document.getElementById("bell-sub");
      DOM.progBg = document.getElementById("bell-progress-bg");
      DOM.progFill = document.getElementById("bell-progress-fill");
      DOM.liveDot = document.getElementById("liveDot");
      DOM.trackerTitle = document.getElementById("trackerTitle");
      DOM.trackerBox = document.getElementById('bellTracker');
      DOM.minimap = document.getElementById('dayMinimap');
      if (DOM.minimap) AppManager.buildMiniMap();

      if (!DOM.mainEl) return;

      AppManager.startClockSync();

      if (DOM.trackerBox) {
        DOM.trackerBox.style.cursor = 'pointer';
        DOM.trackerBox.addEventListener('click', AppManager.handleRadarTrigger);
        
        // --- ΝΕΟ: Event Listeners για Pause on Hover ---
        DOM.trackerBox.addEventListener('mouseenter', () => STATE.isHovering = true);
        DOM.trackerBox.addEventListener('mouseleave', () => STATE.isHovering = false);
       DOM.trackerBox.addEventListener('touchstart', () => {
            if (STATE.touchTimeout) clearTimeout(STATE.touchTimeout);
            STATE.isHovering = true;
        }, {passive: true});
        DOM.trackerBox.addEventListener('touchend', () => {
            STATE.touchTimeout = setTimeout(() => STATE.isHovering = false, 2000);
        }, {passive: true});
      }

      document.addEventListener('click', AppManager.handleGlobalClick);
    },

    startClockSync: () => {
      AppManager.updateTracker();
      const now = new Date();
      const msUntilNextSec = 1000 - now.getMilliseconds();
      
      setTimeout(() => {
        AppManager.updateTracker();
        // --- ΝΕΟ: Ενημέρωση κάθε 1 ΔΕΥΤΕΡΟΛΕΠΤΟ αντί για 1 λεπτό! ---
        setInterval(AppManager.updateTracker, 1000);
      }, msUntilNextSec);
    },

   updateTracker: () => {
      if (STATE.isShowingRadar) return;

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const currentSecs = now.getSeconds(); // --- ΝΕΟ: Παίρνουμε και τα δευτερόλεπτα ---
      const totalCurrentSecs = currentMins * 60 + currentSecs; // Συνολικά δευτερόλεπτα ημέρας
      const day = now.getDay();
      if (DOM.trackerBox) {
          const schoolStartSecs = Utils.timeToMins(CONFIG.schedule[0].start) * 60;
          const schoolEndSecs = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end) * 60;
          
          let progress = 0;
          if (totalCurrentSecs >= schoolEndSecs) {
              progress = 1; // 100% (Απόγευμα/Σχόλασμα)
          } else if (totalCurrentSecs > schoolStartSecs) {
              progress = (totalCurrentSecs - schoolStartSecs) / (schoolEndSecs - schoolStartSecs);
          }
          
          // Μαθηματική παρεμβολή από Ψυχρό Λευκό (245,250,255) σε Θερμό Amber (255,220,180)
          const r = Math.round(245 + (10 * progress));
          const g = Math.round(250 - (30 * progress));
          const b = Math.round(255 - (75 * progress));
          
          // Στέλνουμε τη νέα θερμοκρασία στο CSS
          DOM.trackerBox.style.setProperty('--circadian-rgb', `${r}, ${g}, ${b}`);
      }
      DOM.subEl.style.color = "";
      DOM.progBg.style.display = "none";
      DOM.liveDot.classList.remove("paused");
      DOM.trackerTitle.innerHTML = "Live Ωράριο";
      DOM.progFill.className = "bell-progress-fill"; // Καθαρίζουμε τα προηγούμενα χρώματα
   

      const holiday = Utils.getHolidayStatus(now);
      if (holiday) {
        DOM.mainEl.innerHTML = holiday.main;
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = holiday.sub;
        DOM.liveDot.classList.add("paused");
        DOM.trackerTitle.innerHTML = "Σχολική Αργία";
        if (DOM.minimap) DOM.minimap.style.display = "none";
        return;
      }
      
      if (day === 0 || day === 6) {
        DOM.mainEl.innerHTML = "Καλό Σαββατοκύριακο!";
        DOM.mainEl.style.color = "#a90e0e";
        DOM.subEl.innerHTML = "Το σχολείο είναι κλειστό.";
        DOM.liveDot.classList.add("paused");
        if (DOM.minimap) DOM.minimap.style.display = "none";
        return;
      }
if (DOM.minimap) DOM.minimap.style.display = "flex";
      AppManager.updateMiniMap(totalCurrentSecs);
      const schoolStartSecs = Utils.timeToMins(CONFIG.schedule[0].start) * 60;
      const schoolEndSecs = Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end) * 60;

      if (totalCurrentSecs < schoolStartSecs) {
        DOM.mainEl.innerHTML = "Καλημέρα!";
        DOM.mainEl.style.color = "#2c3e50";
        const diffSecs = schoolStartSecs - totalCurrentSecs;
        
    // --- ΝΕΟ: Δευτερόλεπτα το πρωί! ---
        if (diffSecs <= 60) {
            const secWord = diffSecs === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα';
            DOM.subEl.innerHTML = `Το κουδούνι χτυπάει σε <span style="color:#e74c3c; font-weight:bold;">${diffSecs} ${secWord}!</span>`;
        } else {
            DOM.subEl.innerHTML = `Το κουδούνι χτυπάει σε ${Math.ceil(diffSecs / 60)} λεπτά.`;
        }
        return;
      }
      if (totalCurrentSecs >= schoolEndSecs) {
        DOM.mainEl.innerHTML = "Σχόλασμα!";
        DOM.mainEl.style.color = "rgba(17, 17, 17, 0.68)";
        DOM.subEl.innerHTML = "Τα μαθήματα ολοκληρώθηκαν για σήμερα.";
        return;
      }

      for (let i = 0; i < CONFIG.schedule.length; i++) {
        const periodStartSecs = Utils.timeToMins(CONFIG.schedule[i].start) * 60;
        const periodEndSecs = Utils.timeToMins(CONFIG.schedule[i].end) * 60;

        if (totalCurrentSecs >= periodStartSecs && totalCurrentSecs < periodEndSecs) {
          DOM.mainEl.innerHTML = `Τρέχουσα: ${CONFIG.schedule[i].name}`;
          DOM.mainEl.style.color = "#2c3e50";
          
          const secsLeft = periodEndSecs - totalCurrentSecs;
          const minsLeft = Math.ceil(secsLeft / 60);
          
        // --- ΝΕΟ: Αντίστροφη μέτρηση με δευτερόλεπτα την ώρα του μαθήματος! ---
          let timeMsg = "";
          if (secsLeft <= 60) {
              const secWord = secsLeft === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα';
              timeMsg = `σε <span style="color:#e74c3c; font-weight:bold;">${secsLeft} ${secWord}!</span>`;
          } else {
              timeMsg = `σε ${minsLeft} λεπτά`;
          }
          
          if (CONFIG.schedule[i].type === "class") {
              if (i === CONFIG.schedule.length - 1) DOM.subEl.innerHTML = `Σχόλασμα ${timeMsg}`;
              else if (CONFIG.schedule[i].nextIsBreak) DOM.subEl.innerHTML = `Το διάλειμμα ξεκινά ${timeMsg}`;
              else DOM.subEl.innerHTML = `Η επόμενη ώρα ξεκινά ${timeMsg}`;
          } else {
              DOM.subEl.innerHTML = `Μπαίνουμε στις τάξεις ${timeMsg}`;
          }
          
          const percentage = ((totalCurrentSecs - periodStartSecs) / (periodEndSecs - periodStartSecs)) * 100;
          DOM.progBg.style.display = "block";
          
          // --- ΝΕΟ: Χρωματική Αγωνία Μπάρας ---
          if (secsLeft <= 300) { // Τελευταία 5 λεπτά
              DOM.progFill.classList.add("danger");
          } else if (percentage >= 50) {
              DOM.progFill.classList.add("warning");
          } else {
              DOM.progFill.classList.add("safe");
          }

          window.requestAnimationFrame(() => {
              DOM.progFill.style.width = `${percentage}%`;
          });
          return;
        }
      }
    },
    // --- ΝΕΟ: Χτίσιμο του Mini-Map 1 φορά στην αρχή ---
    buildMiniMap: () => {
      if (!DOM.minimap) return;
      DOM.minimap.innerHTML = '';
      
      CONFIG.schedule.forEach(slot => {
        const seg = document.createElement('div');
        
        // Ξεκινάνε όλα ως "future". Αν είναι διάλειμμα, παίρνει και την κλάση "break"
        seg.className = `minimap-segment future ${slot.type === 'break' ? 'break' : ''}`;
        
        // ΜΑΓΕΙΑ (Flex-Grow): Το πλάτος της γραμμής είναι αναλογικό της διάρκειας των λεπτών!
        const duration = Utils.timeToMins(slot.end) - Utils.timeToMins(slot.start);
        seg.style.flexGrow = duration; 
        
        DOM.minimap.appendChild(seg);
      });
    },

    // --- ΝΕΟ: Ενημέρωση χρωμάτων του Mini-Map ---
    updateMiniMap: (totalCurrentSecs) => {
      if (!DOM.minimap || DOM.minimap.children.length === 0) return;

      Array.from(DOM.minimap.children).forEach((seg, index) => {
        const slot = CONFIG.schedule[index];
        const startSecs = Utils.timeToMins(slot.start) * 60;
        const endSecs = Utils.timeToMins(slot.end) * 60;

        // Κρατάμε τη βάση (αν είναι break ή όχι)
        const baseClass = `minimap-segment ${slot.type === 'break' ? 'break' : ''}`;

        // Αλλάζουμε το State
        if (totalCurrentSecs >= endSecs) {
          seg.className = `${baseClass} past`;
        } else if (totalCurrentSecs >= startSecs && totalCurrentSecs < endSecs) {
          seg.className = `${baseClass} current`;
        } else {
          seg.className = `${baseClass} future`;
        }
      });
    }, // <--- ΜΗΝ ξεχάσεις το κόμμα εδώ στο τέλος!
    initGyro: async () => {
      if (STATE.gyroEnabled || !window.DeviceOrientationEvent) return;

      const startListening = () => {
        window.addEventListener('deviceorientation', AppManager.handleGyro);
        STATE.gyroEnabled = true;
      };

     // iOS 13+ απαιτεί ρητή άδεια με Promise (Ασφαλής έλεγχος για αποφυγή ReferenceError σε PC)
      if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') startListening();
        } catch (e) {
          console.warn("Δεν δόθηκε άδεια γυροσκοπίου (απαιτείται HTTPS).");
        }
      } else {
        // Android / Παλαιότερα iOS
        startListening();
      }
    },

    handleGyro: (event) => {
      if (!DOM.progFill) return;
      
      let gamma = event.gamma; // Κλίση αριστερά-δεξιά (-90 έως 90)
      if (gamma === null) return; // Για Desktop (αγνοείται)

      // "Κόφτης": Δεν θέλουμε να "χυθεί" εκτός οθόνης αν το γυρίσει ανάποδα (max 30 μοίρες)
      gamma = Math.max(-30, Math.min(30, gamma));
      
      // Βαρύτητα: Γέρνουμε ανάποδα (-) από την κλίση της συσκευής
      const tilt = (gamma * -0.6).toFixed(1);

    // [FIX] Αληθινή βελτιστοποίηση με Throttling. Αποτρέπει την υπερθέρμανση της συσκευής στα 120Hz!
      if (!STATE.gyroTicking) {
          STATE.gyroTicking = true;
          window.requestAnimationFrame(() => {
              DOM.progFill.style.setProperty('--gyro-tilt', `${tilt}deg`);
              STATE.gyroTicking = false; // Απελευθερώνει την κλειδαριά ΜΟΝΟ όταν το frame όντως ζωγραφιστεί στην οθόνη
          });
      }
    },

   handleRadarTrigger: (e) => {
      e.stopPropagation();
      
      // --- ΠΡΟΣΘΗΚΗ ΔΟΝΗΣΗΣ ΓΙΑ ΤΟ ΡΑΝΤΑΡ ---
      if (navigator.vibrate) navigator.vibrate(15); 
     AppManager.initGyro();
      
      // Αν το ραντάρ είναι ήδη ανοιχτό και σαρώνει το λέιζερ, αγνόησε το κλικ
      if (DOM.trackerBox && DOM.trackerBox.querySelector('.radar-sweep-line')) return;

      // Αν είναι ήδη ανοιχτό, καθαρίζουμε τα προηγούμενα για να βγάλει νέο μήνυμα
      if (STATE.isShowingRadar) {
          clearTimeout(STATE.radarTimeout);
          clearInterval(STATE.typewriterInterval);
      }

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const hour = now.getHours();
      const day = now.getDay();
      
      let catName = 'class';
      if (Utils.getHolidayStatus(now)) catName = 'holiday';
      else if (day === 0 || day === 6) catName = 'weekend';
      else if (hour >= CONFIG.timeThresholds.nightStart || hour < CONFIG.timeThresholds.nightEnd) catName = 'night';
    else if (currentMins >= CONFIG.timeThresholds.evening) catName = 'evening';
      // [FIX] Δυναμικός έλεγχος: Το απόγευμα δεν ξεκινάει ποτέ αν δεν έχει τελειώσει η τελευταία ώρα του πίνακα schedule
      else if (currentMins >= Math.max(CONFIG.timeThresholds.afternoon, Utils.timeToMins(CONFIG.schedule[CONFIG.schedule.length - 1].end))) catName = 'afternoon';
      else {
          let currentType = 'break'; // [FIX] Πριν χτυπήσει το πρωινό κουδούνι, θεωρούμε ότι είμαστε στην αυλή!
          for (let i = 0; i < CONFIG.schedule.length; i++) {
              if (currentMins >= Utils.timeToMins(CONFIG.schedule[i].start) && currentMins < Utils.timeToMins(CONFIG.schedule[i].end)) {
                  currentType = CONFIG.schedule[i].type;
                  break;
              }
          }
          catName = (currentType === 'break') ? 'break' : 'class';
      }

      const activeArray = CONFIG.radarMessages[catName] || ["Σσσς! Το ραντάρ ξεκουράζεται."];
      if (activeArray.length === 0) activeArray.push("Σσσς! Το ραντάρ ξεκουράζεται."); 
      
      if (!STATE.usedMessages[catName]) STATE.usedMessages[catName] = [];
      
     if (STATE.usedMessages[catName].length >= activeArray.length) {
          // [FIX] Αν υπάρχει μόνο 1 μήνυμα, καθαρίζουμε εντελώς το ιστορικό για να μην γίνει undefined το randomIndex και κρασάρει
          STATE.usedMessages[catName] = (activeArray.length > 1 && STATE.lastMessageIndex[catName] !== undefined) 
              ? [STATE.lastMessageIndex[catName]] 
              : [];
      }
      
      const availableIndexes = activeArray.map((_, i) => i).filter(i => !STATE.usedMessages[catName].includes(i));
      // [FIX] Ασφαλής επιλογή ακόμα και αν το διαθέσιμο array μείνει πρακτικά άδειο
      const randomIndex = availableIndexes.length > 0 ? availableIndexes[Math.floor(Math.random() * availableIndexes.length)] : 0;
      
      STATE.usedMessages[catName].push(randomIndex);
      STATE.lastMessageIndex[catName] = randomIndex;
      const targetMessage = activeArray[randomIndex];
      
      STATE.isShowingRadar = true;

      // --- ΝΕΟ: Εφέ Σάρωσης (Radar Sweep) ---
      let sweepLine = document.createElement("div");
      sweepLine.className = "radar-sweep-line";
      if (DOM.trackerBox) DOM.trackerBox.appendChild(sweepLine);

      DOM.mainEl.innerHTML = "📡 Ανίχνευση...";
      DOM.mainEl.style.color = "#2ecc71"; // Πράσινο της σάρωσης
      DOM.subEl.innerHTML = "Συντονισμός...";
      DOM.subEl.style.color = "rgba(17, 17, 17, 0.68)"; 

      // Περιμένουμε 1.2s για να τελειώσει το Sweep Laser και μετά πετάμε το μήνυμα
      setTimeout(() => {
          if (sweepLine.parentNode) sweepLine.remove(); // Διαγράφουμε το λέιζερ
          if (!STATE.isShowingRadar) return; // Αν έχει κλείσει εν τω μεταξύ
          
          DOM.mainEl.innerHTML = "🎯 Στόχος εντοπίστηκε!";
          DOM.mainEl.style.color = "#a90e0e";
          DOM.subEl.style.color = "#1e6cff"; 
          
         // --- ΝΕΟ: Εφέ Γραφομηχανής (Typewriter) ---
          DOM.subEl.innerHTML = '<span class="typewriter-cursor"></span>';
          
       let charIndex = 0;
          
          // [FIX] Ασφαλής χρήση Intl.Segmenter με Fallback προστασία. Αποτρέπει το "Ολικό Πάγωμα" 
          // του Widget σε παλαιότερα κινητά (π.χ. iOS < 16.4) ή browsers (Firefox < 125).
          let msgChars;
          if (window.Intl && typeof Intl.Segmenter === 'function') {
              const segmenter = new Intl.Segmenter('el', { granularity: 'grapheme' });
              msgChars = Array.from(segmenter.segment(targetMessage)).map(s => s.segment);
          } else {
              // Ασφαλής εναλλακτική για παλιές συσκευές ώστε να μην κρασάρει η εφαρμογή
              msgChars = Array.from(targetMessage); 
          }
          
          STATE.typewriterInterval = setInterval(() => {
              if (charIndex < msgChars.length) {
                  DOM.subEl.innerHTML = msgChars.slice(0, charIndex + 1).join('') + '<span class="typewriter-cursor"></span>';
                  charIndex++;
              } else {
                  clearInterval(STATE.typewriterInterval);
                  DOM.subEl.innerHTML = targetMessage; // Αφαιρεί τον κέρσορα
                  
                  // --- ΝΕΟ: Pause on Hover (Έλεγχος αν το ποντίκι είναι πάνω) ---
                  const checkHoverAndClose = () => {
                      if (STATE.isHovering) {
                          STATE.radarTimeout = setTimeout(checkHoverAndClose, 1000); // Ξανατσέκαρε σε 1 sec
                      } else {
                          STATE.isShowingRadar = false;
                          AppManager.updateTracker();
                      }
                  };
                  
                  STATE.radarTimeout = setTimeout(checkHoverAndClose, 7000);
              }
          }, 35); // Ταχύτητα πληκτρολόγησης

      }, 1200);
    },

    handleGlobalClick: (e) => {
      if (STATE.isShowingRadar && (!DOM.trackerBox || !DOM.trackerBox.contains(e.target))) {
        clearTimeout(STATE.radarTimeout);
        clearInterval(STATE.typewriterInterval);
        
        // Καθαρισμός γραμμής σάρωσης αν υπάρχει
        const sweep = DOM.trackerBox ? DOM.trackerBox.querySelector('.radar-sweep-line') : null;
        if (sweep) sweep.remove();

        STATE.isShowingRadar = false;
        AppManager.updateTracker();
      }
    }
  };

  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", AppManager.init);
  } else {
      AppManager.init();
  }
})();

;(() => {
    "use strict";
 // eortologio
    const CONFIG = Object.freeze({
        weather: {
            lat: 40.2711,
            lon: 22.5044,
            url: "https://api.open-meteo.com/v1/forecast?latitude=40.2711&longitude=22.5044&hourly=temperature_2m,apparent_temperature,weather_code&timezone=auto&forecast_days=3"
        },
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/eortvasi3.json'
    });
 const DataEngine = {
        dictionaries: { fixedNames: {}, fixedHolidays: {}, worldDays: {} },
        fetchData: async () => {
            try {
                const cacheBuster = Math.floor(Date.now() / 3600000);
                const response = await fetch(CONFIG.jsonUrl + "?v=" + cacheBuster);
                if (!response.ok) throw new Error("Σφάλμα HTTP");
                const data = await response.json();
                DataEngine.dictionaries = {
                    fixedNames: data.fixedNames || {},
                    fixedHolidays: data.fixedHolidays || {},
                    worldDays: data.worldDays || {}
                };
            } catch (e) {
                console.warn("Το JSON με το Εορτολόγιο δεν φόρτωσε σωστά:", e);
            }
        }
    };

    const Utils = {
        getNthDayOfMonth: (year, month, dayOfWeek, n) => {
            const firstDay = new Date(year, month - 1, 1).getDay();
            const offset = (dayOfWeek - firstDay + 7) % 7;
            return 1 + offset + (n - 1) * 7;
        },
        getLastDayOfMonth: (year, month, dayOfWeek) => {
            const d = new Date(year, month, 0); 
            const offset = (d.getDay() - dayOfWeek + 7) % 7;
            return d.getDate() - offset;
        },
        getOrthodoxEaster: (year) => {
            const a = year % 19, b = year % 4, c = year % 7;
            const d = (19 * a + 15) % 30;
            const e = (2 * b + 4 * c + 6 * d + 6) % 7;
            const easterDate = new Date(year, 2, 22);
            easterDate.setDate(easterDate.getDate() + (d + e + 13));
            return easterDate;
        },
        getDaysDiff: (date1, date2) => {
            const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
            const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
            return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
        }
    };

   const MobileDateEngine = {
        today: new Date(),
        viewDate: new Date(), // ΝΕΟ: Ημερομηνία που βλέπει ο χρήστης
        
        init: function() {
            this.today = new Date(); // ΝΕΟ: Δυναμική ανανέωση του "Σήμερα" ώστε να διορθώνεται το Tab Sleeping
            this.y = this.viewDate.getFullYear();
            this.m = this.viewDate.getMonth() + 1;
            this.d = this.viewDate.getDate();
            this.dateKey = `${this.m}-${this.d}`;
            
            this.easter = Utils.getOrthodoxEaster(this.y);
            this.diffFromEaster = Utils.getDaysDiff(this.viewDate, this.easter);
            this.isLeapYear = (this.y % 4 === 0 && this.y % 100 !== 0) || (this.y % 400 === 0);
            this.isGeorgeMoved = (this.easter >= new Date(this.y, 3, 23));

            this.calculateMovableWorldDays();
        },
        
        changeDay: function(offset) {
            this.viewDate.setDate(this.viewDate.getDate() + offset);
            this.init(); 
        },
        calculateMovableWorldDays: function() {
            const y = this.y;
            const eq = new Date(y, 2, 20);
            const sleepOffset = ((eq.getDay() + 1) % 7) + 1;
            const sleepDate = new Date(y, 2, 20 - sleepOffset);
            const storytellingDay = Math.floor(20.25 - (y - 2000) * 0.0025);

            this.movableDays = {
                isSleepDay: (this.m === sleepDate.getMonth() + 1 && this.d === sleepDate.getDate()),
                isStorytellingDay: (this.m === 3 && this.d === storytellingDay),
                isMotherDay: (this.m === 5 && this.d === Utils.getNthDayOfMonth(y, 5, 0, 2)),
                isFatherDay: (this.m === 6 && this.d === Utils.getNthDayOfMonth(y, 6, 0, 3)),
                isSaferInternetDay: (this.m === 2 && this.d === Utils.getNthDayOfMonth(y, 2, 2, 2)),
                isSmileDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 5, 1)),
                isTrafficVictimsDay: (this.m === 11 && this.d === Utils.getNthDayOfMonth(y, 11, 0, 3)),
                isVetDay: (this.m === 4 && this.d === Utils.getLastDayOfMonth(y, 4, 6)),
                isProgrammerDay: (this.m === 9 && this.d === (this.isLeapYear ? 12 : 13)),
                isCoastalCleanup: (this.m === 9 && this.d === Utils.getNthDayOfMonth(y, 9, 6, 3)),
                isResearchersNight: (this.m === 9 && this.d === Utils.getLastDayOfMonth(y, 9, 5)),
          // ΝΕΟ: Εντοπίζει την 1η Κυριακή του Οκτ. και "κλειδώνει" ακριβώς το Σ/Κ, ακόμα κι αν το Σάββατο πέφτει 30 Σεπτεμβρίου!
                isBirdwatch: (() => {
                    const firstSunOct = Utils.getNthDayOfMonth(y, 10, 0, 1);
                    const birdSun = new Date(y, 9, firstSunOct);
                    const birdSat = new Date(y, 9, firstSunOct - 1);
                    return (this.m === birdSun.getMonth() + 1 && this.d === birdSun.getDate()) || 
                           (this.m === birdSat.getMonth() + 1 && this.d === birdSat.getDate());
                })(),
                isHabitatArchDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 1, 1)),
                isSightDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 4, 2)),
                isPhilosophyDay: (this.m === 11 && this.d === Utils.getNthDayOfMonth(y, 11, 4, 3)),
                isBuyNothingDay: (this.m === 11 && this.d === (Utils.getNthDayOfMonth(y, 11, 4, 4) + 1)),
                isMaritimeDay: (this.m === 9 && this.d === Utils.getLastDayOfMonth(y, 9, 4)),
                isLighthouseDay: (this.m === 8 && this.d === Utils.getNthDayOfMonth(y, 8, 0, 3)),
                isHospiceDay: (this.m === 10 && this.d === Utils.getNthDayOfMonth(y, 10, 6, 2)),
                isNoiseDay: (this.m === 4 && this.d === Utils.getLastDayOfMonth(y, 4, 3)),
                
                // ΝΕΕΣ ΠΡΟΣΘΗΚΕΣ ΚΙΝΗΤΩΝ ΗΜΕΡΩΝ (MOBILE)
                isMarriageDay: (this.m === 2 && this.d === Utils.getNthDayOfMonth(y, 2, 0, 2)),
                isMigratoryBirdDay: ((this.m === 5 || this.m === 10) && this.d === Utils.getNthDayOfMonth(y, this.m, 6, 2)),
               // ΠΡΟΣΘΗΚΗ: Πρέπει να είναι μετά τη 13η (14 έως 20)
               // ΠΡΟΣΘΗΚΗ: Το σωστό εύρος είναι από την 13η έως και τη 19η
                isMacedonianStruggle: (this.m === 10 && this.d >= 13 && this.d <= 19 && new Date(y, 9, this.d).getDay() === 0),
                isSummerTime: (this.m === 3 && this.d === Utils.getLastDayOfMonth(y, 3, 0)),
                isWinterTime: (this.m === 10 && this.d === Utils.getLastDayOfMonth(y, 10, 0))
            };
        }
    };

    const MobileHolidayEngine = {
        getWorldDays: () => {
            let days = [];
            if (DataEngine.dictionaries.worldDays[MobileDateEngine.dateKey]) {
                days.push(DataEngine.dictionaries.worldDays[MobileDateEngine.dateKey]);
            }
            const mov = MobileDateEngine.movableDays;
            
            if (mov.isSleepDay) days.push("💤 Παγκόσμια Ημέρα Ύπνου");
            if (mov.isStorytellingDay) days.push("📖 Παγκόσμια Ημέρα Αφήγησης");
            if (mov.isMotherDay) days.push("🌸 Γιορτή της Μητέρας");
            if (mov.isFatherDay) days.push("👔 Γιορτή του Πατέρα");
            if (mov.isSaferInternetDay) days.push("🔒 Ημέρα Ασφαλούς Διαδικτύου");
            if (mov.isSmileDay) days.push("😁 Παγκόσμια Ημέρα Χαμόγελου");
            if (mov.isTrafficVictimsDay) days.push("🚗 Παγκόσμια Ημέρα Μνήμης Θυμάτων Τροχαίων Ατυχημάτων");
            if (mov.isVetDay) days.push("⚕️ Παγκόσμια Ημέρα Κτηνιατρικής");
            if (mov.isProgrammerDay) days.push("💻 Παγκόσμια Ημέρα Προγραμματιστή");
            if (mov.isCoastalCleanup) days.push("🏖️ Παγκόσμια Ημέρα Εθελοντικού Καθαρισμού των Ακτών / 🐧 Παγκόσμια Ημέρα Ελεύθερου Λογισμικού");
            if (mov.isResearchersNight) days.push("🔬 Βραδιά του Ερευνητή");
            if (mov.isBirdwatch) days.push("🐦 Πανευρωπαϊκή Γιορτή των Πουλιών");
            if (mov.isHabitatArchDay) days.push("🏘️ Παγκόσμια Ημέρα Κατοικίας / 🏛️ Παγκόσμια Ημέρα Αρχιτεκτονικής");
            if (mov.isSightDay) days.push("👁️ Παγκόσμια Ημέρα Όρασης - Κατά της Τύφλωσης");
            if (mov.isPhilosophyDay) days.push("🤔 Παγκόσμια Ημέρα Φιλοσοφίας");
          if (mov.isBuyNothingDay) days.push("🛍️ Παγκόσμια Ημέρα Αγοραστικής Αποχής"); // Διαχωρισμός
            if (mov.isMaritimeDay) days.push("⚓ Παγκόσμια Ναυτική Ημέρα");
            if (mov.isLighthouseDay) days.push("🗼 Παγκόσμια Ημέρα Φάρων");
            if (mov.isHospiceDay) days.push("🏥 Παγκόσμια Ημέρα Ξενώνων και Παρηγορητικής Φροντίδας");
            if (mov.isNoiseDay) days.push("🤫 Διεθνής Ημέρα κατά του Θορύβου");
            if (mov.isMarriageDay) days.push("💍 Παγκόσμια Ημέρα του Γάμου");
            if (mov.isMigratoryBirdDay) days.push("🦅 Παγκόσμια Ημέρα Αποδημητικών Πτηνών");
            if (mov.isSummerTime) days.push("⏰ Έναρξη Θερινής Ώρας (+1 ώρα)");
            if (mov.isWinterTime) days.push("⏰ Έναρξη Χειμερινής Ώρας (-1 ώρα)");
    if (mov.isBuyNothingDay) days.push("🛒 Black Friday"); 
            return days;
        },

        getHolidays: () => {
            let holidays = [];
            const diff = MobileDateEngine.diffFromEaster;
            
            if (diff === -70) holidays.push("📖 Κυριακή Τελώνου και Φαρισαίου (Αρχή Τριωδίου)");
            else if (diff === -59) holidays.push("🍖 Τσικνοπέμπτη!");
            else if (diff === -57) holidays.push("🕯️ Α' Ψυχοσάββατο");
            else if (diff === -49) holidays.push("🎭 Κυριακή της Αποκριάς (Τυρινής)");
            else if (diff === -48) holidays.push("🪁 Καθαρά Δευτέρα (Αργία)");
            else if (diff === -42) holidays.push("⛪ Κυριακή της Ορθοδοξίας");
            else if (diff === -28) holidays.push("✝️ Κυριακή της Σταυροπροσκυνήσεως");
            else if (diff === -16) holidays.push("⛪ Παρασκευή του Ακαθίστου Ύμνου");
            else if (diff === -8) holidays.push("🌿 Σάββατο του Λαζάρου");
            else if (diff === -7) holidays.push("🌿 Κυριακή των Βαΐων");
            else if (diff === -2) holidays.push("⛪ Μεγάλη Παρασκευή (Ημιαργία)");
            else if (diff === 0) holidays.push("🕯️ Κυριακή του Πάσχα");
            else if (diff === 1) holidays.push("🥚 Δευτέρα του Πάσχα (Αργία)");
            else if (diff === 5) holidays.push("💧 Ζωοδόχου Πηγής");
            else if (diff === 39) holidays.push("⛪ Ανάληψη του Κυρίου");
            else if (diff === 48) holidays.push("🕯️ Β' Ψυχοσάββατο (προ Πεντηκοστής)");
            else if (diff === 49) holidays.push("🔥 Πεντηκοστή");
            else if (diff === 50) holidays.push("🕊️ Αγίου Πνεύματος (Αργία)");
            else if (diff === 56) holidays.push("⛪ Κυριακή των Αγίων Πάντων");

            if (MobileDateEngine.movableDays.isMacedonianStruggle) {
                holidays.push("🇬🇷 Ημέρα Μακεδονικού Αγώνα");
            }

            if (DataEngine.dictionaries.fixedHolidays[MobileDateEngine.dateKey]) {
                holidays.push(DataEngine.dictionaries.fixedHolidays[MobileDateEngine.dateKey]);
            }
            return holidays;
        },

       getNames: () => {
            let namesArr = []; 

            const diff = MobileDateEngine.diffFromEaster;
            const isGeorgeMoved = MobileDateEngine.isGeorgeMoved; 
            const isMarkMoved = (MobileDateEngine.easter >= new Date(MobileDateEngine.y, 3, 24)); 

            if (diff === -43) namesArr.push("Θεόδωρος, Θεοδώρα (Αγ. Θεοδώρων)");
            if (diff === -8) namesArr.push("Λάζαρος, Λάζος (Του Λαζάρου)");
            if (diff === -7) namesArr.push("Βάιος, Βαΐα, Δάφνη (Των Βαΐων)");
            if (diff === 0) namesArr.push("Αναστάσιος, Αναστασία, Λάμπρος, Πασχάλης");
            
            if (diff === 1 && isGeorgeMoved) namesArr.push("Γιώργος, Γεωργία, Ελισάβετ");
            if (diff === 2) {
                let tuesdayNames = "Ραφαήλ, Νικόλαος, Ειρήνη (Λέσβου)";
                if (isMarkMoved) tuesdayNames += ", Μάρκος"; 
                namesArr.push(tuesdayNames);
            }
            if (diff === 5) namesArr.push("Ζωή, Πηγή, Ζωοδόχος (Ζωοδόχου Πηγής)");
            if (diff === 7) namesArr.push("Θωμάς (Του Θωμά)");
            if (diff === 50) namesArr.push("Τριάδα, Τριαντάφυλλος, Τριανταφυλλιά");
            if (diff === 56) namesArr.push("Πανταζής, Πάντος (Αγίων Πάντων)");

            if (MobileDateEngine.dateKey === "4-23" && !isGeorgeMoved) namesArr.push("Γιώργος, Γεωργία");
            if (MobileDateEngine.dateKey === "4-24" && !isGeorgeMoved) namesArr.push("Ελισάβετ");
            if (MobileDateEngine.dateKey === "4-25") namesArr.push(isMarkMoved ? "Νίκη" : "Μάρκος, Νίκη"); 

            const fixedNames = DataEngine.dictionaries.fixedNames[MobileDateEngine.dateKey];
            if (fixedNames) namesArr.push(fixedNames);

            return namesArr.filter(Boolean).join(", ");
        },
      
        getSchoolHolidays: () => {
            const m = MobileDateEngine.m;
            const d = MobileDateEngine.d;
            const diff = MobileDateEngine.diffFromEaster;
            if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return " \u26C4\uFE0F Σχολικές Διακοπές Χριστουγέννων";
            if (diff >= -8 && diff <= 7) return " \uD83D\uDC30\uFE0F Σχολικές Διακοπές Πάσχα";
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) return " \u2600\uFE0F Θερινές Σχολικές Διακοπές";
        },
};
 const MobileWeatherEngine = {
        cachedData: null,
        lastFetch: 0,
        fetchWithRetry: async (retries = 3) => {
            // Ακύρωση της μνήμης αν έχει περάσει 1 ώρα (3.600.000 ms)
            if (MobileWeatherEngine.cachedData && (Date.now() - MobileWeatherEngine.lastFetch < 3600000)) {
                return MobileWeatherEngine.cachedData;
            }
            try {
                const response = await fetch(CONFIG.weather.url);
                if (!response.ok) throw new Error("HTTP error");
                MobileWeatherEngine.cachedData = await response.json();
                MobileWeatherEngine.lastFetch = Date.now();
                return MobileWeatherEngine.cachedData;
                if (!response.ok) throw new Error("HTTP error");
                MobileWeatherEngine.cachedData = await response.json();
                return MobileWeatherEngine.cachedData;
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return MobileWeatherEngine.fetchWithRetry(retries - 1);
                }
                throw error;
            }
        },
      getDayTypeContent: (data, dayOffset) => {
            const dDate = new Date(MobileDateEngine.today);
            dDate.setDate(dDate.getDate() + dayOffset);
            // ΔΙΑΓΡΑΦΗΚΕ Η ΔΕΥΤΕΡΗ (ΛΑΘΟΣ) ΚΛΗΣΗ setDate
            const m = dDate.getMonth() + 1;
            const d = dDate.getDate();
            const dayOfWeek = dDate.getDay();
            const realEaster = Utils.getOrthodoxEaster(dDate.getFullYear()); // Βρίσκει το πραγματικό Πάσχα του Καιρού
const diffFromEaster = Utils.getDaysDiff(dDate, realEaster);
            const schoolHolidays = ["10-28", "11-17", "11-25", "3-25", "5-1"];
            const isHoliday = schoolHolidays.includes(`${m}-${d}`) || diffFromEaster === -48 || diffFromEaster === 50;

         // Εναλλαγή προγράμματος ανάλογα με το αν η μέρα του μήνα είναι ζυγή ή μονή
            const isEven = (d % 2 === 0);
            
            // Το μυστικό κουτάκι για τέλεια αριστερή στοίχιση (χωρίς ζιγκ-ζαγκ)!
            const wStart = '<div style="display:flex; flex-direction:column; align-items:flex-start;">';
            const wEnd = '</div>';

            if (isHoliday) { // Εθνικές Εορτές & Αργίες
                if (isEven) {
                    return `${wStart}
                            <span class="sch-time">🎈 Άραγμα</span>
                            <span class="sch-time">🎉 Γιορτή</span>
                            <span class="sch-time">🍖 Τραπέζι</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🏃 Βόλτα</span>
                            ${wEnd}`;
                } else {
                    return `${wStart}
                            <span class="sch-time">🇬🇷 Παρέλαση</span>
                            <span class="sch-time">🚶 Περίπατος</span>
                            <span class="sch-time">🍰 Γλυκό</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">💤 Σπίτι</span>
                            ${wEnd}`;
                }
            }
            if (diffFromEaster >= -8 && diffFromEaster <= 7) { // Διακοπές Πάσχα
                if (isEven) {
                    return `${wStart}
                            <span class="sch-time">🥚 Αυγά</span>
                            <span class="sch-time">🍖 Ψήσιμο</span>
                            <span class="sch-time">🍬 Γλυκά</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🧨 Πλατεία</span>
                            ${wEnd}`;
                } else {
                    return `${wStart}
                            <span class="sch-time">🌼 Εξοχή</span>
                            <span class="sch-time">🪁 Παιχνίδι</span>
                            <span class="sch-time">🍰 Τσουρέκι</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🚲 Βόλτα</span>
                            ${wEnd}`;
                }
            }
            if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) { // Διακοπές Χριστουγέννων
                if (isEven) {
                    return `${wStart}
                            <span class="sch-time">🛏️ Πιτζάμες</span>
                            <span class="sch-time">🎄 Κάλαντα</span>
                            <span class="sch-time">🍪 Γλυκά</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🎬 Ταινία</span>
                            ${wEnd}`;
                } else {
                    return `${wStart}
                            <span class="sch-time">☕ Χυμός</span>
                            <span class="sch-time">🎁 Δώρα</span>
                            <span class="sch-time">🎲 Παιχνίδι</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🛌 Ύπνος</span>
                            ${wEnd}`;
                }
            }
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) { // Καλοκαιρινές Διακοπές
                if (isEven) {
                    return `${wStart}
                            <span class="sch-time">🏖️ Μπάνιο</span>
                            <span class="sch-time">🍉 Καρπούζι</span>
                            <span class="sch-time">🚲 Ποδήλατο</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🍦 Παγωτό</span>
                            ${wEnd}`;
                } else {
                    return `${wStart}
                            <span class="sch-time">🕶️ Ήλιος</span>
                            <span class="sch-time">🌊 Βουτιές</span>
                            <span class="sch-time">⚽ Πλατεία</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🥤 Βόλτα</span>
                            ${wEnd}`;
                }
            }
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Απλό Σαββατοκύριακο
                if (isEven) {
                    return `${wStart}
                            <span class="sch-time">📺 Παιδικά</span>
                            <span class="sch-time">⚽ Παιχνίδι</span>
                            <span class="sch-time">🍝 Φαγητό</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">💤 Χουζούρι</span>
                            ${wEnd}`;
                } else {
                    return `${wStart}
                            <span class="sch-time">🥞 Πρωινό</span>
                            <span class="sch-time">🚲 Βόλτα</span>
                            <span class="sch-time">🧩 Παζλ</span>
                            <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🍿 Σινεμά</span>
                            ${wEnd}`;
                }
            }

           const codes = {
                0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
                56:"🌧️", 57:"🌧️", 61:"🌧️", 63:"🌧️", 65:"🌧️", 66:"🌧️", 67:"🌧️", 71:"❄️",
                73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️", 81:"🌧️", 82:"🌧️", 85:"❄️", 86:"❄️",
                95:"⛈️", 96:"⛈️", 99:"⛈️"
            };
            const baseIndex = dayOffset * 24;
            const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
            const snowCodes = [71, 73, 75, 77, 85, 86];
            let rainWarnings = [], snowWarnings = [];

            [10, 11, 12, 13].forEach(hour => {
                const code = data.hourly.weather_code[baseIndex + hour];
                const timeLabel = hour === 10 ? "09:40" : hour === 11 ? "11:30" : hour === 12 ? "12:25" : "13:15";
                if (rainCodes.includes(code)) rainWarnings.push(timeLabel);
                if (snowCodes.includes(code)) snowWarnings.push(timeLabel);
            });

       let alertHtml = "";
            if (snowWarnings.length > 0) {
                const badges = snowWarnings.map(t => `<span class="snow-badge">${t === "13:15" ? "Σχόλασμα" : "Διάλειμμα"} ${t}</span>`).join('');
                // ΕΓΙΝΕ += ΓΙΑ ΝΑ ΜΗΝ ΣΒΗΝΕΙ ΤΥΧΟΝ ΑΛΛΑ ΜΗΝΥΜΑΤΑ
                alertHtml += `<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:6px;"><span class="sch-msg" style="font-size:22px; margin-bottom:2px; animation: bounce 2s infinite; color:#1e6cff;">❄️</span><span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px; color:#1e6cff; text-align:center;">ΧΙΟΝΙ (ΔΙΑΛΕΙΜΜΑΤΑ / ΣΧΟΛΑΣΜΑ):</span><div class="snow-list">${badges}</div></div>`;
            } 
            // ΑΦΑΙΡΕΘΗΚΕ ΤΟ "else", ΜΠΗΚΕ ΕΠΙΣΗΣ "+="
            if (rainWarnings.length > 0) {
                const badges = rainWarnings.map(t => `<span class="rain-badge">${t === "13:15" ? "Σχόλασμα" : "Διάλειμμα"} ${t}</span>`).join('');
                alertHtml += `<div style="display:flex; flex-direction:column; align-items:center; margin-bottom:6px;"><span class="sch-msg" style="font-size:20px; margin-bottom:2px; animation: bounce 2s infinite;">☔</span><span class="sch-msg" style="font-size:9px; line-height:1; margin-bottom:4px; text-align:center;">ΒΡΟΧΗ (ΔΙΑΛΕΙΜΜΑΤΑ / ΣΧΟΛΑΣΜΑ):</span><div class="rain-list">${badges}</div></div>`;
            }
            const getHourData = (h) => {
                const temp = Math.round(data.hourly.temperature_2m[baseIndex + h]);
                const icon = codes[data.hourly.weather_code[baseIndex + h]] || "🌤️";
                return `${icon} ${temp}°`;
            };

        // --- ΕΛΕΓΧΟΣ ΓΙΑ ΤΟ ΑΠΟΓΕΥΜΑ (Μετά τις 14:00) ---
            const currentHour = new Date().getHours();
            
            // ΑΝ ΕΙΝΑΙ Η 1η ΚΑΡΤΑ (dayOffset === 0) ΚΑΙ Η ΩΡΑ ΕΙΝΑΙ 14:00 Ή ΑΡΓΟΤΕΡΑ
            if (dayOffset === 0 && currentHour >= 14) {
                // Εναλλάσσουμε και τα απογεύματα (ζυγή/μονή μέρα) για ποικιλία
                if (isEven) {
                    return `${alertHtml}
                            ${wStart}
                                <span class="sch-time">🍝 Φαγητό ${getHourData(15)}</span>
                                <span class="sch-time">📚 Διάβασμα ${getHourData(17)}</span>
                                <span class="sch-time">⚽ Παιχνίδι ${getHourData(19)}</span>
                                <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🎒 Τσάντα ${getHourData(21)}</span>
                            ${wEnd}`;
                } else {
                    return `${alertHtml}
                            ${wStart}
                                <span class="sch-time">🛋️ Χαλάρωση ${getHourData(15)}</span>
                                <span class="sch-time">📝 Φροντιστήριο ${getHourData(17)}</span>
                                <span class="sch-time">🚲 Βόλτα ${getHourData(19)}</span>
                                <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🛌 Ύπνος ${getHourData(21)}</span>
                            ${wEnd}`;
                }
            }
            
            // ΑΝ ΕΙΝΑΙ ΠΡΩΙ (πριν τις 14:00) Ή ΕΙΝΑΙ Η ΚΑΡΤΑ ΤΟΥ "ΑΥΡΙΟ":
            // Δείχνει τα διαλείμματα (Χωρίς ώρες, όπως ζήτησες, για να χωράνε τέλεια)
            return `${alertHtml}
                    ${wStart}
                        <span class="sch-time">🔔 09:40 ${getHourData(10)}</span>
                        <span class="sch-time">🔔 11:30 ${getHourData(11)}</span>
                        <span class="sch-time">🔔 12:25 ${getHourData(12)}</span>
                        <span class="sch-time" style="color:#a90e0e; margin-top:3px;">🎒 13:15 ${getHourData(13)}</span>
                    ${wEnd}`;
            
        }
    };

    const MobileUIEngine = {
        renderHeader: (suffix) => {
            const hIcon = document.getElementById(`dynamic-day-icon${suffix}`);
            const hDate = document.getElementById(`eort-date${suffix}`);

            if(hIcon) hIcon.innerText = MobileDateEngine.d;
            if(hDate) {
                const diffDays = Utils.getDaysDiff(MobileDateEngine.viewDate, MobileDateEngine.today);
                let prefix = "";
                
                if (diffDays === 0) prefix = "Σήμερα, ";
                else if (diffDays === 1) prefix = "Αύριο, ";
                else if (diffDays === -1) prefix = "Χθες, ";
                else if (diffDays > 1) prefix = `Σε ${diffDays} μέρες, `;
                else if (diffDays < -1) prefix = `Πριν ${Math.abs(diffDays)} μέρες, `;
                
                const baseDateStr = MobileDateEngine.viewDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });
                
                if (Math.abs(diffDays) >= 5) {
                    hDate.innerHTML = `${prefix}${baseDateStr} <span class="return-to-today-badge">(↺)</span>`;
                    hDate.classList.add('is-returnable');
                    hDate.title = "Επιστροφή στο Σήμερα";
                } else {
                    hDate.innerHTML = prefix + baseDateStr; 
                    hDate.classList.remove('is-returnable');
                    hDate.title = "";
                }
            }
        },
        renderHolidays: (suffix) => {
            const worldDays = MobileHolidayEngine.getWorldDays();
            const wdDiv = document.getElementById(`eort-world-day${suffix}`);
            if(wdDiv) { wdDiv.innerHTML = worldDays.join(" / "); wdDiv.style.display = worldDays.length ? "block" : "none"; }

            const holidays = MobileHolidayEngine.getHolidays();
            const hDiv = document.getElementById(`eort-holiday${suffix}`);
            if(hDiv) { hDiv.innerHTML = holidays.join("<br>"); hDiv.style.display = holidays.length ? "block" : "none"; }

            const names = MobileHolidayEngine.getNames();
            const nDiv = document.getElementById(`eort-names${suffix}`);
            if(nDiv) {
                if (names) { nDiv.innerHTML = "<b>Γιορτάζουν:</b><br>" + names; nDiv.style.display = "block"; } 
                else { nDiv.style.display = "none"; }
            }

            const schoolStr = MobileHolidayEngine.getSchoolHolidays();
            const sDiv = document.getElementById(`eort-school${suffix}`);
            if(sDiv) { sDiv.innerText = schoolStr; sDiv.style.display = schoolStr ? "block" : "none"; }
        },
        renderWeather: async () => {
            try {
                const data = await MobileWeatherEngine.fetchWithRetry();
                const codes = {
                    0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️", 45:"🌫️", 48:"🌫️", 51:"🌦️", 53:"🌦️", 55:"🌧️",
                    56:"🌧️", 57:"🌧️", 61:"🌧️", 63:"🌧️", 65:"🌧️", 66:"🌧️", 67:"🌧️", 71:"❄️",
                    73:"❄️", 75:"❄️", 77:"❄️", 80:"🌦️", 81:"🌧️", 82:"🌧️", 85:"❄️", 86:"❄️",
                    95:"⛈️", 96:"⛈️", 99:"⛈️"
                };
                const daysArr = ['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ'];
                let wHtml = '';
                
                let bgClass = '', advisorHtml = '', advBorder = '', advBg = '', advDisplay = 'none';

                for(let i=0; i<3; i++) {
                    const dDate = new Date(MobileDateEngine.today);
                    dDate.setDate(dDate.getDate() + i);
                    const dName = (i===0) ? "Σήμερα" : (i===1 ? "Αύριο" : daysArr[dDate.getDay()]);
                    const baseIndex = i * 24;
                    const dayTemps = data.hourly.temperature_2m.slice(baseIndex, baseIndex + 24);
                    const maxTemp = Math.round(Math.max(...dayTemps));
                    const minTemp = Math.round(Math.min(...dayTemps));
                    
                    let feelsLikeHour = 8;
                    let feelsLikeText = "Αίσθηση 8πμ";

                    if (i === 0) {
                        feelsLikeHour = new Date().getHours();
                        feelsLikeText = "Αίσθηση";
                    }
                    const currentFeelsLike = Math.round(data.hourly.apparent_temperature[baseIndex + feelsLikeHour]); 
                    
                    const mainCodeRaw = data.hourly.weather_code[baseIndex + 12];
                    const mainCode = codes[mainCodeRaw] || "🌤️";
                    const hoverContent = MobileWeatherEngine.getDayTypeContent(data, i);

                    if (i === 0) {
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMonth = now.getMonth();
                        
                        let sunsetHour = 20; 
                        if ([10, 11, 0, 1].includes(currentMonth)) sunsetHour = 18; 
                        else if ([2, 9].includes(currentMonth)) sunsetHour = 19; 
                        else if ([3, 8].includes(currentMonth)) sunsetHour = 20; 
                        else if ([4, 5, 6, 7].includes(currentMonth)) sunsetHour = 21; 
                        
                        const isNight = (currentHour >= sunsetHour || currentHour < 6);
                        const currentCode = data.hourly.weather_code[currentHour];

                        if ([71,73,75,77,85,86].includes(currentCode)) bgClass = 'bg-weather-snow';
                        else if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(currentCode)) bgClass = 'bg-weather-rain';
                        else if (isNight) bgClass = 'bg-weather-night';
                        else bgClass = 'bg-weather-sun';

                        if (currentHour >= 2 && currentHour < 6) {
                            advDisplay = 'none';
                        } else {
                            let hasRain = false, hasSnow = false, checkTemp = 0;
                            let msg = "", icon = "";
                            
                            if (currentHour >= 6 && currentHour < 16) {
                                for (let h = 6; h <= 14; h++) {
                                    const code = data.hourly.weather_code[baseIndex + h];
                                    if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) hasRain = true;
                                    if ([71,73,75,77,85,86].includes(code)) hasSnow = true;
                                }
                                checkTemp = data.hourly.apparent_temperature[baseIndex + currentHour];

                                if (hasSnow) { icon = "⛄"; msg = "Προσοχή για χιόνι! Ντύσου σαν κρεμμύδι 🧅!"; advBorder = "#1e6cff"; advBg = "rgba(30, 108, 255, 0.1)"; } 
                                else if (hasRain) { icon = "☔"; msg = "Προσοχή για βροχή! Μην ξεχάσεις την ομπρέλα σου!"; advBorder = "#3b82f6"; advBg = "rgba(59, 130, 246, 0.1)"; } 
                                else if (checkTemp < 7) { icon = "🧣"; msg = "Έχει παγωνιά έξω! Σκούφος και γάντια απαραίτητα!"; advBorder = "#0ea5e9"; advBg = "rgba(14, 165, 233, 0.1)"; } 
                                else if (checkTemp > 26) { icon = "☀️"; msg = "Ζεστούλα έξω! Μην ξεχάσεις το παγούρι με το νερό σου!"; advBorder = "#f59e0b"; advBg = "rgba(245, 158, 11, 0.1)"; } 
                                else { icon = "🌤️"; msg = "Ιδανικός καιρός αυτή τη στιγμή για παιχνίδι!"; advBorder = "#10b981"; advBg = "rgba(16, 185, 129, 0.1)"; }
                           } else {
                                const tomorrowIndex = (currentHour >= 16) ? baseIndex + 24 : baseIndex;
                                const textDay = (currentHour < 6) ? "Το πρωί" : "Αύριο";

                                for (let h = 6; h <= 14; h++) {
                                    const code = data.hourly.weather_code[tomorrowIndex + h];
                                    if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) hasRain = true;
                                    if ([71,73,75,77,85,86].includes(code)) hasSnow = true;
                                }

                                // ΝΕΟ: Έλεγχος αν από τις 8:00 μέχρι τις 15:00 η θερμοκρασία ξεπεράσει τους 25
                                let willBeHot = false;
                                for (let h = 8; h <= 15; h++) {
                                    if (data.hourly.apparent_temperature[tomorrowIndex + h] > 26) {
                                        willBeHot = true;
                                        break; // Μόλις βρει ότι περνάει τους 25, σταματάει το ψάξιμο
                                    }
                                }

                                checkTemp = data.hourly.apparent_temperature[tomorrowIndex + 8]; // Το κρατάμε για τον έλεγχο του κρύου στις 08:00

                                if (hasSnow) { icon = "⛄"; msg = `${textDay} περιμένουμε χιόνι! Ετοίμασε ζεστά ρούχα 🧅!`; advBorder = "#1e6cff"; advBg = "rgba(30, 108, 255, 0.1)"; } 
                                else if (hasRain) { icon = "☔"; msg = `${textDay} δίνει βροχή! Μην ξεχάσεις την ομπρέλα σου!`; advBorder = "#3b82f6"; advBg = "rgba(59, 130, 246, 0.1)"; } 
                                else if (checkTemp < 7) { icon = "🧣"; msg = `${textDay === "Το πρωί" ? "Σήμερα" : "Αύριο"} το πρωί θα έχει παγωνιά! Ετοίμασε σκούφο/γάντια!`; advBorder = "#0ea5e9"; advBg = "rgba(14, 165, 233, 0.1)"; } 
                                else if (willBeHot) { icon = "☀️"; msg = `${textDay} θα κάνει ζέστη! Μην ξεχάσεις το παγούρι σου!`; advBorder = "#f59e0b"; advBg = "rgba(245, 158, 11, 0.1)"; } 
                                else { icon = "🌤️"; msg = `${textDay} φαίνεται ιδανικός καιρός για παιχνίδι!`; advBorder = "#10b981"; advBg = "rgba(16, 185, 129, 0.1)"; }
                            }
                            
                            advisorHtml = `<span class="smart-advisor-icon">${icon}</span> <div class="smart-advisor-text">${msg}</div>`;
                            advDisplay = 'flex';
                        }
                    }

                    wHtml += `
                        <div class="c-day-card ${i===0 ? 'today' : ''}">
                            <div class="c-day-inner">
                                <div class="c-day-front">
                                    <span class="c-day-name">${dName}</span>
                                    <span class="c-day-icon">${mainCode}</span>
                                    <div class="c-day-temps"><span class="c-max">${maxTemp}°</span> <span>${minTemp}°</span></div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-weight: 700;">${feelsLikeText}: <span style="color:#a90e0e;">${currentFeelsLike}°</span></div>
                                </div>
                                <div class="c-day-back">${hoverContent}</div>
                            </div>
                        </div>`;
                }

                ['', '-mobile'].forEach(suffix => {
                    const container = document.getElementById(`hub-weather-container${suffix}`);
                    if(container) container.innerHTML = wHtml;

                    const widgetBox = document.getElementById(`eortologio-widget-box${suffix}`);
                    if (widgetBox && bgClass) {
                        widgetBox.classList.remove('bg-weather-sun', 'bg-weather-rain', 'bg-weather-snow', 'bg-weather-night');
                        widgetBox.classList.add(bgClass);
                    }

                    const advisorBox = document.getElementById(suffix === '-mobile' ? 'smart-weather-advisor-mobile' : 'smart-weather-advisor');
                    if (advisorBox) {
                        advisorBox.innerHTML = advisorHtml;
                        advisorBox.style.borderLeftColor = advBorder;
                        advisorBox.style.background = advBg;
                        advisorBox.style.display = advDisplay;
                    }
                });

            } catch (error) {
                ['', '-mobile'].forEach(suffix => {
                    const container = document.getElementById(`hub-weather-container${suffix}`);
                    if (container) container.innerHTML = "<div style='font-size:10px;color:#888;width:100%;text-align:center;'>Η υπηρεσία καιρού είναι προσωρινά μη διαθέσιμη.</div>";
                });
            }
        },
        renderAll: () => {
            ['', '-mobile'].forEach(suffix => {
                if (document.getElementById(`eortologio-widget-box${suffix}`)) {
                    MobileUIEngine.renderHeader(suffix);
                    MobileUIEngine.renderHolidays(suffix);
                }
            });
          
        }
    };
// --- ΝΕΟ: ΜΗΧΑΝΗ ΑΝΑΖΗΤΗΣΗΣ (MOBILE) ---
    const MobileSearchEngine = {
       index: [],
        isBuiltForYear: null,
        // ΠΡΟΣΘΗΚΗ: Μετατροπή και του ς σε σ για να "πιάνει" τις βιαστικές πληκτρολογήσεις
        normalize: (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ς/g, "σ") : "",
        buildIndex: () => {
           const y = MobileDateEngine.viewDate.getFullYear();
            if (MobileSearchEngine.isBuiltForYear === y) return; 
            
            MobileSearchEngine.index = [];
            const originalDate = new Date(MobileDateEngine.viewDate); 
            
            const daysInYear = MobileDateEngine.isLeapYear ? 366 : 365;
            for (let i = 0; i < daysInYear; i++) {
                const testDate = new Date(y, 0, i + 1);
                MobileDateEngine.viewDate = testDate;
                MobileDateEngine.init();
                
                let terms = [];
                const names = MobileHolidayEngine.getNames(); if (names) terms.push(names);
                const hols = MobileHolidayEngine.getHolidays(); if (hols.length) terms.push(...hols);
                const wds = MobileHolidayEngine.getWorldDays(); if (wds.length) terms.push(...wds);
                
            const rawText = terms.join(" | ").replace(/<\/?[^>]+(>|$)/g, ""); 
                const displayDateStr = testDate.toLocaleDateString('el-GR', { day: 'numeric', month: 'long' });
                
                // Αφαιρούμε το if για να μπαίνουν ΟΛΕΣ οι μέρες στο index και ενσωματώνουμε την ημερομηνία στο searchKey
                MobileSearchEngine.index.push({
                    targetDate: new Date(testDate),
                    displayDate: displayDateStr,
                    rawText: rawText.trim() ? rawText : "Χωρίς ιδιαίτερες εορτές",
                    searchKey: MobileSearchEngine.normalize(displayDateStr + " " + rawText)
                });
            }
            MobileDateEngine.viewDate = originalDate;
            MobileDateEngine.init();
            MobileSearchEngine.isBuiltForYear = y;
        },
       search: (query) => {
            const q = MobileSearchEngine.normalize(query);
            if (!q || q.length < 2) return [];
            
            // Σπάμε το query του χρήστη σε ανεξάρτητες λέξεις
         // Σπάμε το query του χρήστη σε ανεξάρτητες λέξεις
            const words = q.split(/\s+/).filter(word => word.length > 0);
            
            // ΠΡΟΣΘΗΚΗ: Αν έχουν απομείνει μόνο κενά, διακόπτουμε άμεσα
            if (words.length === 0) return [];
            
            // Επιστρέφουμε αποτελέσματα ΜΟΝΟ αν ΟΛΕΣ οι λέξεις (.every) υπάρχουν στο index του κινητού
            return MobileSearchEngine.index.filter(item => 
                words.every(w => item.searchKey.includes(w))
            ).slice(0, 8);
        }
    };
    const MobileAppController = {
        init: async () => {
            const hasMobile = document.getElementById("eortologio-widget-box-mobile");
            const hasPC = document.getElementById("eortologio-widget-box");
            if (!hasMobile && !hasPC) return;

           // Fetch data ONCE for both widgets
            await DataEngine.fetchData();
            // ΑΦΑΙΡΕΘΗΚΕ ΤΟ ΠΡΩΤΟ ΠΕΡΙΤΤΟ FETCH (Το renderWeather κάνει ήδη ασφαλή κλήση)

            MobileDateEngine.init();
            MobileUIEngine.renderAll();
            MobileUIEngine.renderWeather();
            let isAnimating = false;
            const animateToDate = (targetDate) => {
                if (isAnimating) return;
                const diff = Utils.getDaysDiff(targetDate, MobileDateEngine.viewDate);
                if (diff === 0) return;
                isAnimating = true;

                const outClass = diff > 0 ? 'anim-slide-out-left' : 'anim-slide-out-right';
                const inClass = diff > 0 ? 'anim-slide-in-right' : 'anim-slide-in-left';

                ['', '-mobile'].forEach(suffix => {
                    const eortBox = document.getElementById(`eortologio-widget-box${suffix}`);
                    if (!eortBox) return;
                    const elements = eortBox.querySelectorAll(`#eort-date${suffix}, .info-box`);
                    elements.forEach(el => {
                        el.classList.remove('anim-slide-in-right', 'anim-slide-in-left', 'anim-slide-out-left', 'anim-slide-out-right');
                        if (el.style.display !== 'none' || el.id === `eort-date${suffix}`) el.classList.add(outClass);
                    });
                });

                setTimeout(() => {
                    MobileDateEngine.viewDate = new Date(targetDate);
                   MobileDateEngine.init();
                    MobileSearchEngine.buildIndex(); 
                    MobileUIEngine.renderAll();
                    MobileUIEngine.renderWeather(); // ΝΕΟ: Επανασχεδιασμός του καιρού σε περίπτωση που αλλάξει η μέρα

                    ['', '-mobile'].forEach(suffix => {
                        const eortBox = document.getElementById(`eortologio-widget-box${suffix}`);
                        if (!eortBox) return;
                        const elements = eortBox.querySelectorAll(`#eort-date${suffix}, .info-box`);
                        elements.forEach(el => {
                            el.classList.remove(outClass);
                            if (el.style.display !== 'none' || el.id === `eort-date${suffix}`) el.classList.add(inClass);
                        });
                    });
                    isAnimating = false;
                }, 250); 
            };

            const animateAndChangeDay = (offset) => {
                const target = new Date(MobileDateEngine.viewDate);
                target.setDate(target.getDate() + offset);
                animateToDate(target);
            };

            ['', '-mobile'].forEach(suffix => {
                const eortBox = document.getElementById(`eortologio-widget-box${suffix}`);
                if (!eortBox) return;
                
                const searchPrefix = suffix === '-mobile' ? 'mob' : 'pc';
                const searchBox = document.getElementById(`${searchPrefix}-eort-search-box`);
                const searchIcon = document.getElementById(`${searchPrefix}-eort-search-icon`);
                const searchInput = document.getElementById(`${searchPrefix}-eort-search-input`);
                const searchResults = document.getElementById(`${searchPrefix}-eort-search-results`);
                const groupWrap = eortBox.querySelector('.eort-date-search-group');

                const revealSearch = () => {
                    if (searchBox && searchBox.style.display !== 'flex') {
                        searchBox.style.display = 'flex';
                        setTimeout(() => MobileSearchEngine.buildIndex(), 100);
                    }
                };

                const prevBtn = document.getElementById(`eort-prev-day${suffix}`);
                const nextBtn = document.getElementById(`eort-next-day${suffix}`);
                if (prevBtn) prevBtn.addEventListener('click', () => { revealSearch(); animateAndChangeDay(-1); });
                if (nextBtn) nextBtn.addEventListener('click', () => { revealSearch(); animateAndChangeDay(1); });

                const dateEl = document.getElementById(`eort-date${suffix}`);
                if (dateEl) {
                    dateEl.addEventListener('click', () => {
                        if (dateEl.classList.contains('is-returnable')) animateToDate(MobileDateEngine.today);
                    });
                }

                // Swipes
                let touchStartX = 0, touchStartY = 0;
                eortBox.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                    touchStartY = e.changedTouches[0].screenY;
                }, { passive: true });
                
               eortBox.addEventListener('touchend', (e) => {
                    const diffX = touchStartX - e.changedTouches[0].screenX;
                    const diffY = touchStartY - e.changedTouches[0].screenY;
                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        revealSearch();
                        if (diffX > 0) animateAndChangeDay(1); else animateAndChangeDay(-1); 
                    }
                }, { passive: true });

                // Search
                if (searchIcon && searchInput && searchResults) {
                    searchIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        searchBox.classList.toggle('active');
                        if (searchBox.classList.contains('active')) {
                            searchInput.focus();
                            if (groupWrap) groupWrap.classList.add('searching');
                        } else {
                            searchInput.value = ''; searchInput.blur();
                            searchResults.classList.remove('show');
                            if (groupWrap) groupWrap.classList.remove('searching');
                        }
                    });

                    searchInput.addEventListener('input', (e) => {
                        const res = MobileSearchEngine.search(e.target.value);
                        if (e.target.value.length >= 2) {
                            if (res.length > 0) {
                                searchResults.innerHTML = res.map(r => 
                                    `<div class="search-res-item" data-time="${r.targetDate.getTime()}">
                                        <span class="search-res-date">${r.displayDate}</span>
                                        ${r.rawText.substring(0, 48)}${r.rawText.length > 48 ? '...' : ''}
                                    </div>`
                                ).join('');
                            } else {
                                searchResults.innerHTML = '<div class="search-res-item" style="color:#888; pointer-events:none;">Δεν βρέθηκε κάτι...</div>';
                            }
                            searchResults.classList.add('show');
                        } else {
                            searchResults.classList.remove('show');
                        }
                    });

                    searchResults.addEventListener('click', (e) => {
                        const item = e.target.closest('.search-res-item');
                        if (item && item.getAttribute('data-time')) {
                            const targetDate = new Date(parseInt(item.getAttribute('data-time')));
                            searchBox.classList.remove('active');
                            searchInput.value = ''; searchInput.blur();
                            searchResults.classList.remove('show');
                            if (groupWrap) groupWrap.classList.remove('searching');
                            animateToDate(targetDate); 
                        }
                    });

                   } // Κλείσιμο if (searchIcon && searchInput && searchResults)
            }); // <-- Εδώ κλείνει οριστικά η λούπα forEach!

            // --- ΚΑΘΟΛΙΚΟ ΚΛΕΙΣΙΜΟ ΑΝΑΖΗΤΗΣΗΣ (Τρέχει μόνο 1 Φορά για όλα) ---
            const closeAllSearches = () => {
                ['mob', 'pc'].forEach(pref => {
                    const sBox = document.getElementById(`${pref}-eort-search-box`);
                    const sInput = document.getElementById(`${pref}-eort-search-input`);
                    const sResults = document.getElementById(`${pref}-eort-search-results`);
                    if (sBox && sBox.classList.contains('active')) {
                        sBox.classList.remove('active');
                        if (sInput) { sInput.value = ''; sInput.blur(); }
                        if (sResults) sResults.classList.remove('show');
                    }
                });
                document.querySelectorAll('.eort-date-search-group').forEach(g => g.classList.remove('searching'));
            };

            // Κλείνει την αναζήτηση αν κάνεις κλικ οπουδήποτε αλλού (1 καθολικό event)
            document.addEventListener('click', (e) => {
                const isInside = e.target.closest('#mob-eort-search-box') || e.target.closest('#pc-eort-search-box');
                const isIcon = e.target.closest('#mob-eort-search-icon') || e.target.closest('#pc-eort-search-icon');
                if (!isInside && !isIcon) closeAllSearches();
            });

            // Κλείνει την αναζήτηση αν πατήσεις ESC (Προσθήκη για το PC)
            document.addEventListener('keydown', (e) => {
                if (e.key === "Escape") closeAllSearches();
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileAppController.init);
    } else {
        MobileAppController.init();
    }
})();


;(() => {
    "use strict";
// HMEROLO
   const CONFIG = Object.freeze({
       feedUrl: 'https://dimperist.blogspot.com/feeds/posts/summary?alt=json&max-results=500',
       quotesJsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/hmeroquotes1.json',
       tooltipDelay: 200 
    });

  const Utils = {
        cleanTitle: (rawStr) => {
            if (!rawStr) return 'Χωρίς τίτλο';
            return rawStr.replace(/&laquo;|&#171;|\u00C2\u00AB|\u00A4\u00C3/g, '«').replace(/&raquo;|&#187;|\u00C2\u00BB|\u00A5\u00C3/g, '»').replace(/&ldquo;|&rdquo;|&#8220;|&#8221;|&quot;/g, '"').replace(/&lsquo;|&rsquo;|&#8216;|&#8217;|&#39;/g, "'").replace(/&#183;|&middot;/g, '·').replace(/&ndash;|&#8211;/g, '-').replace(/&mdash;|&#8212;/g, '—').replace(/&amp;/g, '&').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&nbsp;/g, ' ').trim();
        },
        getQuote: () => {
            if (!DataEngine.quotesArray || DataEngine.quotesArray.length === 0) return "Μια υπέροχη μέρα σε περιμένει!";
            let used = [];
            try { used = JSON.parse(localStorage.getItem('usedQuotes')) || []; } catch(e) {}
            if (!Array.isArray(used)) used = [];
            if (used.length >= DataEngine.quotesArray.length) used = [];
            const usedSet = new Set(used);
            const available = [];
            for (let i = 0; i < DataEngine.quotesArray.length; i++) {
                if (!usedSet.has(i)) available.push(i);
            }
            if (available.length === 0) {
                used = [];
                for (let i = 0; i < DataEngine.quotesArray.length; i++) available.push(i);
            }
            const randomIndex = available[Math.floor(Math.random() * available.length)];
            used.push(randomIndex);
            try { localStorage.setItem('usedQuotes', JSON.stringify(used)); } catch(e) {}
            return DataEngine.quotesArray[randomIndex];
        },
        getTodayStr: () => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        },

        // ==========================================
        // 1. Υπολογισμός Ορθόδοξου Πάσχα
        // ==========================================
        getOrthodoxEaster: (year) => {
            const a = year % 4;
            const b = year % 7;
            const c = year % 19;
            const d = (19 * c + 15) % 30;
            const e = (2 * a + 4 * b - d + 34) % 7;
            const month = Math.floor((d + e + 114) / 31);
            const day = ((d + e + 114) % 31) + 1;
            const easter = new Date(year, month - 1, day);
            easter.setDate(easter.getDate() + 13); 
            return easter;
        },

  // ==========================================
        // ΝΕΟ: Εικονίδια για Ημερομηνίες - Ορόσημα
        // ==========================================
        getLandmarkIcon: (date) => {
            const y = date.getFullYear();
            const m = date.getMonth() + 1; // 1-12
            const d = date.getDate();
            
            let events = []; 

           // Σταθερές Εορτές 
           if (m === 1 && d === 1) events.push({ icon: '🎆', name: 'Πρωτοχρονιά' });
            if (m === 1 && d === 6) events.push({ icon: '⛪', name: 'Άγια Θεοφάνια' });
            if (m === 1 && d === 7) events.push({ icon: '⛪', name: 'Αγίου Ιωάννου Προδρόμου' });
            if (m === 1 && d === 30) events.push({ icon: '📖', name: 'Τριών Ιεραρχών' });
            if (m === 3 && d === 25) events.push({ icon: '🇬🇷', name: '25η Μαρτίου' });
            if (m === 5 && d === 1) events.push({ icon: '🌸', name: 'Εργατική Πρωτομαγιά' });
            if (m === 6 && d === 29) events.push({ icon: '🔑', name: 'Αποστόλων Πέτρου και Παύλου' });
          if (m === 6 && d === 30) events.push({ icon: '⛪', name: 'Σύναξις Αγίων 12 Αποστόλων' });
            if (m === 7 && d === 1) events.push({ icon: '⚕️', name: 'Αγίων Αναργύρων (Κοσμά & Δαμιανού)' });
            if (m === 7 && d === 20) events.push({ icon: '⛪', name: 'Προφήτου Ηλιού' });
           if (m === 7 && d === 26) events.push({ icon: '⛪', name: 'Αγίας Παρασκευής' });
           if (m === 7 && d === 28) events.push({ icon: '⛪', name: 'Αγίας Ειρήνης Χρυσοβαλάντου' });
            if (m === 8 && d === 6) events.push({ icon: '⛪', name: 'Μεταμόρφωση του Σωτήρος' });
            if (m === 8 && d === 15) events.push({ icon: '⛪', name: 'Δεκαπενταύγουστος' });
            if (m === 9 && d === 8) events.push({ icon: '🌸', name: 'Γενέθλιον της Θεοτόκου' });
            if (m === 10 && d === 28) events.push({ icon: '🇬🇷', name: '28η Οκτωβρίου' });
            if (m === 11 && d === 17) events.push({ icon: '🕊️', name: '17η Νοεμβρίου' });
            if (m === 12 && d === 18) events.push({ icon: '🐾', name: 'Άγιος Μόδεστος' });
            if (m === 12 && d === 25) events.push({ icon: '🎄', name: 'Χριστούγεννα' });

            // Κινητές Εορτές
           const easter = Utils.getOrthodoxEaster(y);
const utcDate = Date.UTC(y, m - 1, d);
const utcEaster = Date.UTC(easter.getFullYear(), easter.getMonth(), easter.getDate());
const daysDiff = Math.round((utcDate - utcEaster) / (1000 * 60 * 60 * 24));

if (daysDiff === -59) events.push({ icon: '🥩', name: 'Τσικνοπέμπτη' });
if (daysDiff === -48) events.push({ icon: '🪁', name: 'Καθαρά Δευτέρα' });
if (daysDiff === -8)  events.push({ icon: '🌿', name: 'Σάββατο του Λαζάρου' });
 if (daysDiff === -7) events.push({ icon: '🌿', name: 'Κυριακή των Βαΐων' });
if (daysDiff === 0)   events.push({ icon: '🕯️', name: 'Κυριακή του Πάσχα' });
if (daysDiff === 5)   events.push({ icon: '⛪', name: 'Ζωοδόχου Πηγής' });
if (daysDiff === 7)   events.push({ icon: '⛪', name: 'Κυριακή του Θωμά' });
if (daysDiff === 50)  events.push({ icon: '🌿', name: 'Αγίου Πνεύματος' });

          
            if (events.length > 0) {
                return {
                 
                    icon: events.map(e => e.icon).join(''), 
                  
                    name: events.map(e => e.name).join(' & ') 
                };
            }

            return null; 
        },

        // ==========================================
        // 2. Έλεγχος Σχολικής Αργίας / Κλειστού Σχολείου
        // ==========================================
        getHolidayInfo: (date) => {
            const y = date.getFullYear();
            const m = date.getMonth() + 1; // 1-12
            const d = date.getDate();
            const dayOfWeek = date.getDay(); // 0 = Κυριακή, 6 = Σάββατο

          // --- Βοηθητική συνάρτηση: Υπολογίζει αν πέφτει Σ/Κ και επιστρέφει την Παρασκευή ---
            const getCelebDay = (month, targetDay) => {
                const wd = new Date(y, month - 1, targetDay).getDay();
                if (wd === 6) return targetDay - 1; // Αν Σάββατο, πάει Παρασκευή (-1 μέρα)
                if (wd === 0) return targetDay - 2; // Αν Κυριακή, πάει Παρασκευή (-2 μέρες)
                return targetDay; // Αλλιώς (Καθημερινή) μένει στην κανονική της μέρα!
            };

            // 1. Σταθερές Εθνικές Εορτές & Αργίες
            if (m === 10 && d === 28) return '28η Οκτωβρίου (Εθνική Εορτή)';
            if (m === 12 && d === 18) return 'Εορτασμός Αγίου Μοδέστου';
            if (m === 3 && d === 25) return '25η Μαρτίου (Εθνική Εορτή)';
            if (m === 5 && d === 1)  return 'Εργατική Πρωτομαγιά';

            // 2. Σχολικές Γιορτές (Μεταφέρονται αυτόματα στην Παρασκευή αν πέσουν Σ/Κ)
            if (m === 3 && d === getCelebDay(3, 24)) return 'Σχολική Γιορτή 25ης Μαρτίου';
            if (m === 10 && d === getCelebDay(10, 27)) return 'Σχολική Γιορτή 28ης Οκτωβρίου';
            if (m === 11 && d === getCelebDay(11, 17)) return '17η Νοεμβρίου (Σχολική Γιορτή)';
            
       
            if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return 'Διακοπές Χριστουγέννων';

            const easter = Utils.getOrthodoxEaster(y);
 
            const utcDate = Date.UTC(y, m - 1, d);
            const utcEaster = Date.UTC(easter.getFullYear(), easter.getMonth(), easter.getDate());
            const daysDiff = Math.round((utcDate - utcEaster) / (1000 * 60 * 60 * 24));

            if (daysDiff === -48) return 'Καθαρά Δευτέρα';
            if (daysDiff === 50) return 'Αγίου Πνεύματος';
        
            if (daysDiff >= -8 && daysDiff <= 7) return 'Διακοπές Πάσχα';
            if ((m === 6 && d >= 16) || m === 7 || m === 8 || (m === 9 && d <= 10)) return 'Καλοκαιρινές Διακοπές';
            if (dayOfWeek === 0 || dayOfWeek === 6) return 'Σαββατοκύριακο';
            return null; 
        }
    };

    const DataEngine = {
        postsByDate: {},
      quotesArray: [],
       fetchData: async () => {
            let startIndex = 1;
            const maxResults = 150; 
            let hasMore = true;
            
            let baseUrl = CONFIG.feedUrl.split('?')[0].replace('/default', '/summary');

            while (hasMore) {
                try {
                    const currentUrl = `${baseUrl}?alt=json&max-results=${maxResults}&start-index=${startIndex}`;
                    const response = await fetch(currentUrl);
                    const data = await response.json();

                    if (data.feed?.entry && data.feed.entry.length > 0) {
                        data.feed.entry.forEach(post => {
                           const dateStr = post.published.$t.split('T')[0];
                  
                            const linkObj = post.link?.find(l => l.rel === 'alternate');
                            
                            let thumbUrl = null;
                            if (post.media$thumbnail && post.media$thumbnail.url) {
                                thumbUrl = post.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?\//, '/s150-c/');
                            }

                            if (!DataEngine.postsByDate[dateStr]) DataEngine.postsByDate[dateStr] = [];
                            DataEngine.postsByDate[dateStr].push({
                                title: Utils.cleanTitle(post.title?.$t),
                                url: linkObj ? linkObj.href : '#',
                                thumbnail: thumbUrl
                            });
                        });
                        
                        startIndex += data.feed.entry.length;
                        
                     const totalResults = parseInt(data.feed.openSearch$totalResults?.$t || 0, 10);
       
                        if (startIndex > totalResults) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false; 
                    }
                } catch (e) {
                    console.warn("Σφάλμα φόρτωσης:", e);
                    hasMore = false;
                }
            }
        },
      fetchQuotes: async () => {
            try {
                const response = await fetch(CONFIG.quotesJsonUrl);
                const data = await response.json();
                DataEngine.quotesArray = data.quotes || [];
            } catch (e) {
                console.warn("Το JSON με τα αποφθέγματα δεν φόρτωσε.");
                DataEngine.quotesArray = [];
            }
        }
    };

    // =========================================================
    // Έξυπνη Μηχανή (Κοινό Tooltip UI)
    // =========================================================
    const UIEngine = {
        overlay: null,
        tooltip: null,
        hideTimeout: null,
        fadeTimeout: null,
        isModalActive: false,
        currentHoveredFrame: null,

      init: () => {
   
            const oldOverlay = document.getElementById('calendar-overlay');
            const oldTooltip = document.getElementById('calendar-tooltip');
            if (oldOverlay) oldOverlay.remove();
            if (oldTooltip) oldTooltip.remove();
            
            UIEngine.overlay = document.createElement('div');
            UIEngine.overlay.id = 'calendar-overlay';
            UIEngine.overlay.className = 'calendar-overlay-class';
            
          UIEngine.overlay.addEventListener('touchmove', (e) => {
            
                if (UIEngine.isModalActive) {
                    e.preventDefault();
                }
            }, { passive: false });
            document.body.appendChild(UIEngine.overlay);

            UIEngine.tooltip = document.createElement('div');
            UIEngine.tooltip.id = 'calendar-tooltip';
            UIEngine.tooltip.className = 'calendar-tooltip-class';
            document.body.appendChild(UIEngine.tooltip);

            ['click', 'touchstart'].forEach(evt => {
                UIEngine.overlay.addEventListener(evt, (e) => {
                    UIEngine.closeTooltip();
                }, { passive: true });
            });
            
            UIEngine.tooltip.addEventListener('mouseenter', () => clearTimeout(UIEngine.hideTimeout));
            UIEngine.tooltip.addEventListener('mouseleave', () => { 
                if (UIEngine.isModalActive) return;
                UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
            });

            if (window.calKeydownFn) document.removeEventListener('keydown', window.calKeydownFn);
            if (window.calResizeFn) window.removeEventListener('resize', window.calResizeFn);
            if (window.calPageshowFn) window.removeEventListener('pageshow', window.calPageshowFn);

            window.calKeydownFn = (e) => {
                if (e.key === 'Escape' && UIEngine.isModalActive) UIEngine.closeTooltip();
            };
            document.addEventListener('keydown', window.calKeydownFn);

          window.calResizeFn = () => {
          
                if (UIEngine.tooltip && UIEngine.tooltip.style.opacity === '1' && !UIEngine.isModalActive) {
                    UIEngine.closeTooltip();
                }
            };
            window.addEventListener('resize', window.calResizeFn, { passive: true });

            window.calPageshowFn = (e) => {
                if (e.persisted && UIEngine.isModalActive) UIEngine.closeTooltip();
            };
            window.addEventListener('pageshow', window.calPageshowFn);
        },

        showTooltip: (cellFrame, posts, isModal, isPC) => {
            UIEngine.isModalActive = isModal;
            clearTimeout(UIEngine.hideTimeout);
            clearTimeout(UIEngine.fadeTimeout); 
            UIEngine.tooltip.innerHTML = '';
            
        const listContainer = document.createElement('div');
        
            listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding: 5px; overscroll-behavior: contain;';

           posts.forEach(p => {
                let a = document.createElement('a');
                a.href = p.url;
                a.className = 'tooltip-title-link';
     
                const isQuote = (p.url === 'javascript:void(0);');
                const pointerCSS = isQuote ? 'pointer-events: none;' : '';
                
                a.style.cssText = `display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 8px; border-radius: 8px; background: rgba(0,0,0,0.02); color: #333; transition: background 0.2s, transform 0.2s; ${pointerCSS}`;
                
                if (isPC && !isQuote) { 
                    a.onmouseover = function() { 
                        this.style.background = 'rgba(0,0,0,0.06)'; 
                        this.style.transform = 'translateY(-2px)'; 
                    };
                    a.onmouseout = function() { 
                        this.style.background = 'rgba(0,0,0,0.02)'; 
                        this.style.transform = 'translateY(0)';
                    };
                }

                let iconHtml = '';
                if (p.thumbnail) {
                    iconHtml = `<img src="${p.thumbnail}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
                } else if (p.url === 'javascript:void(0);') {
                    iconHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #fff3cd; border-radius: 8px; font-size: 24px; flex-shrink: 0;">✨</div>`;
                } else {
                    iconHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #e9ecef; border-radius: 8px; font-size: 20px; flex-shrink: 0;">📝</div>`;
                }

                a.innerHTML = `${iconHtml}<span style="font-size: 14px; font-weight: 600; line-height: 1.3;">${p.title}</span>`;
                listContainer.appendChild(a);
            });

            UIEngine.tooltip.appendChild(listContainer);
            UIEngine.tooltip.style.display = 'block';
            UIEngine.tooltip.style.visibility = 'hidden';

            const tooltipStyle = isPC 
                ? `width: 320px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);` 
                : `width: 90vw; max-width: 320px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);`;

            if (isModal || !isPC) {
                UIEngine.overlay.style.display = 'block';
                UIEngine.tooltip.style.cssText = `display: block; visibility: visible; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; z-index: 10000; ${tooltipStyle}`;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    UIEngine.overlay.style.opacity = '1';
                    UIEngine.tooltip.style.opacity = '1';
                    UIEngine.tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
                }));
           } else {
               UIEngine.overlay.style.display = 'none'; 
                UIEngine.tooltip.style.cssText = `display: block; visibility: hidden; position: absolute; z-index: 9999; ${tooltipStyle}`;
                const rect = cellFrame.getBoundingClientRect();
                
                let topPos = rect.top + window.scrollY - UIEngine.tooltip.offsetHeight + 10;
                let leftPos = rect.left + window.scrollX + (rect.width / 2) - (UIEngine.tooltip.offsetWidth / 2);
       
                const maxLeft = document.body.clientWidth - UIEngine.tooltip.offsetWidth - 10;
                if (leftPos > maxLeft) leftPos = maxLeft;
                if (leftPos < 10) leftPos = 10; 
                
                if (topPos < window.scrollY + 10) topPos = rect.bottom + window.scrollY + 10; // Αν κόβεται πάνω
       
                const maxTop = window.scrollY + window.innerHeight - UIEngine.tooltip.offsetHeight - 10;
                if (topPos > maxTop) topPos = maxTop;
                
                UIEngine.tooltip.style.cssText = `display: block; visibility: visible; position: absolute; transform: none; opacity: 0; z-index: 9999; top: ${topPos}px; left: ${leftPos}px; ${tooltipStyle}`;
       
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    UIEngine.tooltip.style.opacity = '1';
                }));
            }
        },

        closeTooltip: () => {
            UIEngine.isModalActive = false;
            UIEngine.currentHoveredFrame = null;
            if(!UIEngine.overlay || !UIEngine.tooltip) return;
            
           UIEngine.overlay.style.opacity = '0';
            UIEngine.tooltip.style.opacity = '0';
            
            clearTimeout(UIEngine.fadeTimeout); 
            UIEngine.fadeTimeout = setTimeout(() => {
                UIEngine.overlay.style.display = 'none';
                UIEngine.tooltip.style.display = 'none';
            }, 300);
        }
    };

    // ==========================================
    // 4. ΕΡΓΟΣΤΑΣΙΟ ΗΜΕΡΟΛΟΓΙΩΝ (Factory Pattern)
    // ==========================================

    const CalendarWidget = (suffix) => {
        const isPC = suffix === '';
        
        const self = {
            isTouchMode: false,
            calendar: null,
            isYearView: false,
            currentYearView: new Date().getFullYear(),
            isSpinning: false,
            isAnimating: false,
            els: {
                calendarEl: document.getElementById(`calendar${suffix}`),
                container: document.getElementById(`calendar-container${suffix}`),
                monthLabel: document.getElementById(`monthLabel${suffix}`),
                prevBtn: document.getElementById(`prevBtn${suffix}`),
                nextBtn: document.getElementById(`nextBtn${suffix}`),
                yearOverlay: null,
                diceBtn: null,
                todayBtn: null
            },

            init: () => {
                if (!self.els.calendarEl) return false;
           
                self.els.diceBtn = document.createElement('button');
                self.els.diceBtn.innerHTML = '🎲';
                self.els.diceBtn.className = 'advanced-btn dice-btn';
                self.els.diceBtn.title = 'Τυχαίο Άρθρο (Ρουλέτα)';

                self.els.todayBtn = document.createElement('button');
                self.els.todayBtn.innerHTML = '↺ Σήμερα';
                self.els.todayBtn.className = 'advanced-btn today-anchor-btn';

                self.els.monthLabel.classList.add('month-zoom-label');
                if (isPC) self.els.monthLabel.title = 'Προβολή Έτους';

                const titleWrapper = document.createElement('div');
                titleWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center;';
                self.els.monthLabel.parentNode.insertBefore(titleWrapper, self.els.monthLabel);
                titleWrapper.appendChild(self.els.monthLabel);
                titleWrapper.appendChild(self.els.diceBtn);

                self.els.container.style.position = 'relative';
                self.els.container.appendChild(self.els.todayBtn);

       self.els.yearOverlay = document.createElement('div');
                self.els.yearOverlay.id = 'year-view-overlay'; 
                self.els.container.appendChild(self.els.yearOverlay);

       
                const todayStr = Utils.getTodayStr();
                self.calendar = new window.FullCalendar.Calendar(self.els.calendarEl, {
                    locale: 'el', 
                    initialView: 'dayGridMonth',
                    headerToolbar: false,
                    height: '100%',
                    contentHeight: '100%',
                    displayEventTime: false,
                events: [], 
 
                    dayCellClassNames: (info) => {
                        const classes = [];
                        if (Utils.getHolidayInfo(info.date)) {
                            classes.push('school-holiday-cell');
                        }
                        return classes;
                    },

                    datesSet: (info) => {
                        if (!self.els.monthLabel || self.isYearView) return; 
             
                        const monthsGR = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
                        const mStr = monthsGR[info.view.currentStart.getMonth()];
                        const yStr = info.view.currentStart.getFullYear();
                        self.els.monthLabel.textContent = mStr + ' ' + yStr;
                        self.updateTimeAnchor(info.view.currentStart);
                    },
                    
                  dayCellDidMount: (info) => {
                        const cellDateStr = info.el.dataset.date; 
                        const frame = info.el.querySelector('.fc-daygrid-day-frame');
                        if (!frame) return;
                        frame.style.position = 'relative'; 

                        const holidayName = Utils.getHolidayInfo(info.date);
    
                      if (holidayName) {
                            frame.title = holidayName; 
                        } else {
                            frame.removeAttribute('title');
                        }
                        
                        // === ΝΕΟΣ ΚΩΔΙΚΑΣ: Ζωγραφίζουμε το Σημαδάκι ===
                        const oldLandmark = frame.querySelector('.landmark-icon');
                        if (oldLandmark) oldLandmark.remove(); // Καθαρίζουμε το παλιό αν αλλάξεις μήνα

                        const landmarkData = Utils.getLandmarkIcon(info.date);
                        if (landmarkData) {
                            let iconEl = document.createElement('div');
                            iconEl.className = 'landmark-icon';
                            iconEl.innerHTML = landmarkData.icon;
                            
                            // Βάζουμε το όνομα της γιορτής ώστε αν αφήσεις το ποντίκι πάνω του να το γράφει!
                            iconEl.title = landmarkData.name; 
                            
                            // Το κολλάμε Πάνω-Αριστερά στο κελί
                            iconEl.style.cssText = 'position: absolute; top: 2px; left: 4px; font-size: 15px; z-index: 5; pointer-events: auto; cursor: help;';
                            frame.appendChild(iconEl);
                        }
                        // === ΤΕΛΟΣ ΝΕΟΥ ΚΩΔΙΚΑ ===
                    
                        frame.classList.remove('has-posts');

                        const oldDot = frame.querySelector('.post-dot');
                        if (oldDot) oldDot.remove();
                        const oldEmoji = frame.querySelector('.day-indicator-emoji');
                        if (oldEmoji) oldEmoji.remove();

                        if (DataEngine.postsByDate[cellDateStr]) {
                            frame.classList.add('has-posts');
                            if (!frame.querySelector('.post-dot')) {
                                let dot = document.createElement('div');
                                dot.className = 'post-dot';
                                dot.style.pointerEvents = 'none'; 
                                frame.appendChild(dot);
                            }
                       } else {
                     
                            const realToday = Utils.getTodayStr(); 
                            if (cellDateStr <= realToday) {
                                if (!frame.querySelector('.day-indicator-emoji')) {
                                    let indicator = document.createElement('div');
                                    indicator.className = 'day-indicator-emoji';
                                    indicator.innerHTML = (cellDateStr < realToday) ? '💤' : '✨'; 
                                    indicator.style.cssText = 'position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); opacity: 0.25; font-size: 20px; pointer-events: none;';
                                    frame.appendChild(indicator);
                                }
                            }
                        }
                    }
                });
                
                self.calendar.render();
                self.setupEvents();
                return true;
            },

            updateTimeAnchor: (date) => {
                const now = new Date();
                const isCurrentMonth = (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());
                if (!isCurrentMonth && !self.isYearView) self.els.todayBtn.classList.add('visible');
                else self.els.todayBtn.classList.remove('visible');
            },

           toggleYearView: () => {
                if (self.isSpinning) return;
                self.isYearView = !self.isYearView;
         
                if (self.isYearView) UIEngine.closeTooltip();

                if (self.isYearView) {
                    self.currentYearView = self.calendar.getDate().getFullYear();
                    self.renderYearView(self.currentYearView);
                    self.els.yearOverlay.classList.add('active');
                    self.els.todayBtn.classList.remove('visible');
                } else {
                    self.els.yearOverlay.classList.remove('active');
                  const d = self.calendar.getDate();
                    const monthsGR = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
                    self.els.monthLabel.textContent = monthsGR[d.getMonth()] + ' ' + d.getFullYear();
                    self.updateTimeAnchor(d);
                }
            },

            renderYearView: (year) => {
                self.currentYearView = year;
                self.els.monthLabel.textContent = `Έτος ${year}`;
                
                let html = `
                    <div class="year-header">
                        <button id="prevYearBtn${suffix}" class="year-nav-btn">&#10094;</button>
                        <span>${year}</span>
                        <button id="nextYearBtn${suffix}" class="year-nav-btn">&#10095;</button>
                    </div>
                    <div class="year-grid">
                `;
                const months = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];
                let maxPosts = 1;
                const postCounts = new Array(12).fill(0);
                
                Object.keys(DataEngine.postsByDate).forEach(d => {
                    if (d.startsWith(year.toString())) {
                        const m = parseInt(d.split('-')[1]) - 1;
                        postCounts[m] += DataEngine.postsByDate[d].length;
                        if (postCounts[m] > maxPosts) maxPosts = postCounts[m];
                    }
                });

                months.forEach((name, index) => {
                    const count = postCounts[index];
                    let intensityClass = '';
                    if (count > 0) {
                        const ratio = count / maxPosts;
                        if (ratio > 0.6) intensityClass = 'high';
                        else if (ratio > 0.2) intensityClass = 'med';
                    }
                    html += `<div class="year-month-box ${count > 0 ? 'has-data ' + intensityClass : ''}" data-month="${index}">
                                <span class="ym-name">${name}</span>
                                ${count > 0 ? `<span class="ym-count">${count} άρθρ.</span>` : ''}
                             </div>`;
                });
                html += `</div>`;
                self.els.yearOverlay.innerHTML = html;

                document.getElementById(`prevYearBtn${suffix}`).addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    if (!isPC && navigator.vibrate) navigator.vibrate(10);
                    self.renderYearView(year - 1);
                });
                document.getElementById(`nextYearBtn${suffix}`).addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    if (!isPC && navigator.vibrate) navigator.vibrate(10);
                    self.renderYearView(year + 1);
                });

                self.els.yearOverlay.querySelectorAll('.year-month-box').forEach(box => {
                    box.addEventListener('click', () => {
                        if (!isPC && navigator.vibrate) navigator.vibrate(15);
                        const m = box.dataset.month;
                        self.calendar.gotoDate(new Date(year, m, 1));
                        self.toggleYearView();
                    });
                });
            },

          playRoulette: () => {
                if (self.isSpinning || self.isAnimating) return; 
                const dates = Object.keys(DataEngine.postsByDate);
                if (dates.length === 0) return;
                
                if (self.isYearView) self.toggleYearView();

                self.isSpinning = true;
                self.els.diceBtn.classList.add('spinning');
                self.els.calendarEl.classList.add('roulette-blur');

              const targetDateStr = dates[Math.floor(Math.random() * dates.length)];
       
                const [ty, tm, td] = targetDateStr.split('-');
                const targetDate = new Date(ty, tm - 1, td);

               let spins = 0;
                const maxSpins = 10;
                const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
                
                const spinInterval = setInterval(() => {
                    spins++;
                    const randomYear = targetDate.getFullYear() - Math.floor(Math.random() * 3);
                    const randomMonth = Math.floor(Math.random() * 12);
        
                    if (self.els.monthLabel) self.els.monthLabel.textContent = `${monthNames[randomMonth]} ${randomYear}`;
                    
                    if (!isPC && navigator.vibrate) navigator.vibrate(5); 

                    if (spins >= maxSpins) {
                        clearInterval(spinInterval);
                        self.calendar.gotoDate(targetDate); 
                       self.els.calendarEl.classList.remove('roulette-blur');
                        self.els.diceBtn.classList.remove('spinning');
              
                        if (self.els.monthLabel) {
                            const finalDate = self.calendar.getDate();
                            self.els.monthLabel.textContent = `${monthNames[finalDate.getMonth()]} ${finalDate.getFullYear()}`;
                        }
                        
                        if (!isPC && navigator.vibrate) navigator.vibrate([20, 40, 20]);
                        
                      setTimeout(() => {
                            self.isSpinning = false;
                            const cell = self.els.calendarEl.querySelector(`.fc-day[data-date="${targetDateStr}"] .fc-daygrid-day-frame`);
                 
                            UIEngine.showTooltip(cell || document.body, DataEngine.postsByDate[targetDateStr], true, isPC);
                        }, 400);
                    }
                }, 120);
            },

            changeMonthAnimated: (direction) => {
                if (self.isAnimating || !self.els.calendarEl || self.isSpinning) return;

                if (!isPC && navigator.vibrate) navigator.vibrate(10);

                if (self.isYearView) {
                    const newYear = self.currentYearView + (direction === 'next' ? 1 : -1);
                    self.renderYearView(newYear);
                    return;
                }

                self.isAnimating = true;
                const outClass = direction === 'next' ? 'cal-out-left' : 'cal-out-right';
                const inClass = direction === 'next' ? 'cal-in-right' : 'cal-in-left';

                self.els.calendarEl.classList.add(outClass);

                setTimeout(() => {
                    if (direction === 'next') self.calendar.next();
                    else self.calendar.prev();
                    
                    self.els.calendarEl.classList.remove(outClass);
                    self.els.calendarEl.classList.add(inClass);

                    setTimeout(() => {
                        self.els.calendarEl.classList.remove(inClass);
                        self.isAnimating = false;
                    }, 200);
                }, 150); 
            },

            setupEvents: () => {
            
                self.els.diceBtn.addEventListener('click', () => {
                    if (!isPC && navigator.vibrate) navigator.vibrate(15);
                    self.playRoulette();
                });
              self.els.monthLabel.addEventListener('click', () => {
                 
                    if (!self.isSpinning && !self.isAnimating) {
                        if (!isPC && navigator.vibrate) navigator.vibrate(10);
                        self.toggleYearView();
                    }
                });
                self.els.todayBtn.addEventListener('click', () => {
                    if (self.isSpinning || self.isAnimating) return; 
                    if (!isPC && navigator.vibrate) navigator.vibrate(15);
                    self.calendar.today();
                    if (self.isYearView) self.toggleYearView();
                });
                if (self.els.prevBtn) self.els.prevBtn.addEventListener('click', () => self.changeMonthAnimated('prev'));
                if (self.els.nextBtn) self.els.nextBtn.addEventListener('click', () => self.changeMonthAnimated('next'));

           let touchstartX = 0, startY = 0, isSwiping = false, swipeTimeout = null; 
                self.els.container.addEventListener('touchstart', (e) => {
                    self.isTouchMode = true; 
                    isSwiping = false; 
                    touchstartX = e.changedTouches[0].screenX;
                    startY = e.changedTouches[0].screenY;
                }, { passive: true });

              self.els.container.addEventListener('touchend', (e) => {
                    const diffX = e.changedTouches[0].screenX - touchstartX;
                    const diffY = e.changedTouches[0].screenY - startY;

         
                    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
                        isSwiping = true;
                        clearTimeout(swipeTimeout); 
                        swipeTimeout = setTimeout(() => isSwiping = false, 350); 
                    }

                    if (self.isSpinning || self.isAnimating || UIEngine.isModalActive) return; 

                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        if (diffX < -40) self.changeMonthAnimated('next');
                        else if (diffX > 40) self.changeMonthAnimated('prev');
                    }
                }, { passive: true });

             const handleCellInteraction = (frame, type, e = null) => {
                    if (self.isSpinning || self.isYearView) return;
                    const cell = frame.closest('.fc-daygrid-day');
                    if (!cell) return;
                    const dateStr = cell.dataset.date;
                   const todayStr = Utils.getTodayStr();
                    const posts = DataEngine.postsByDate[dateStr];

                 const cellDateParts = dateStr.split('-');
                    const cellDateObj = new Date(cellDateParts[0], cellDateParts[1] - 1, cellDateParts[2]);
                    const landmarkInfo = Utils.getLandmarkIcon(cellDateObj);
                    const holidayInfo = Utils.getHolidayInfo(cellDateObj);
                    const isImportant = landmarkInfo || (holidayInfo && holidayInfo !== 'Σαββατοκύριακο' && holidayInfo !== 'Καλοκαιρινές Διακοπές');

                    if (!posts && dateStr > todayStr && !isImportant) {
                        if (type === 'hover') UIEngine.closeTooltip();
                        return;
                    }

                    let content = posts;
                    if (!posts) {
                        if (!DataEngine.quotesByDate) DataEngine.quotesByDate = {};
                        if (!DataEngine.quotesByDate[dateStr]) {
                            let prefix = '';
                            if (landmarkInfo) prefix = `<strong style="color:#4A90E2">${landmarkInfo.icon} ${landmarkInfo.name}</strong><br><br>`;
                            else if (isImportant) prefix = `<strong style="color:#4A90E2">📌 ${holidayInfo}</strong><br><br>`;
                            DataEngine.quotesByDate[dateStr] = prefix + Utils.getQuote();
                        }
                        content = [{ title: DataEngine.quotesByDate[dateStr], url: 'javascript:void(0);' }];
                    }

                    if (type === 'click') {
                        if (!isPC && navigator.vibrate) navigator.vibrate(10);
                   
                       if (posts && posts.length === 1 && !self.isTouchMode && isPC) {
        
                            if (e && (e.ctrlKey || e.metaKey)) {
                                window.open(posts[0].url, '_blank');
                            } else {
                                window.open(posts[0].url, '_self'); 
                            }
                        } else {
                            UIEngine.showTooltip(frame, content, true, isPC);
                        }
                    } else if (type === 'hover' && isPC) {
                        UIEngine.showTooltip(frame, content, false, isPC);
                    }
                };

             self.els.container.addEventListener('click', (e) => {
                    if (isSwiping) { e.preventDefault(); return; } 
                    const frame = e.target.closest('.fc-daygrid-day-frame');
       
                    if (frame) { e.preventDefault(); handleCellInteraction(frame, 'click', e); } 
                });

                if (isPC) {
                   self.els.container.addEventListener('mouseover', (e) => {
        
                        if (self.isTouchMode || UIEngine.isModalActive) return; 
                        const frame = e.target.closest('.fc-daygrid-day-frame');
                        if (frame) {
                            clearTimeout(UIEngine.hideTimeout); 
                            if (frame !== UIEngine.currentHoveredFrame) {
                                UIEngine.currentHoveredFrame = frame;
                                handleCellInteraction(frame, 'hover');
                            }
                        }
                    });

                  self.els.container.addEventListener('mouseout', (e) => {
            
                        if (self.isTouchMode || UIEngine.isModalActive) return;
                        const frame = e.target.closest('.fc-daygrid-day-frame');
                        const toTooltip = UIEngine.tooltip && UIEngine.tooltip.contains(e.relatedTarget);
                        if (frame && !frame.contains(e.relatedTarget) && !toTooltip) {
                            UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
                        }
                    });

                    let activeMagnetDot = null;

                    self.els.container.addEventListener('mousemove', (e) => {
                        if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) self.isTouchMode = false;

                        if (UIEngine.isModalActive || self.isSpinning || self.isYearView || self.isTouchMode) return;
                        const frame = e.target.closest('.fc-daygrid-day-frame.has-posts');
                        const dot = frame ? frame.querySelector('.post-dot') : null;
                  
                        if (activeMagnetDot && activeMagnetDot !== dot) {
                            activeMagnetDot.style.transform = ''; activeMagnetDot.style.background = ''; activeMagnetDot.style.boxShadow = '';
                        }
                        
                        activeMagnetDot = dot;

                        if (dot && frame) {
                            const rect = frame.getBoundingClientRect();
                            const dx = e.clientX - (rect.left + rect.width / 2);
                            const dy = e.clientY - (rect.top + rect.height / 2);
                            dot.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px) scale(1.4)`;
                            dot.style.background = '#4A90E2';
                            dot.style.boxShadow = '0 0 10px 3px rgba(74, 144, 226, 0.6)';
                        }
                    });

                    self.els.container.addEventListener('mouseleave', () => {
                        if (activeMagnetDot) {
                            activeMagnetDot.style.transform = ''; activeMagnetDot.style.background = ''; activeMagnetDot.style.boxShadow = '';
                            activeMagnetDot = null;
                        }
                    });
                }
            }
        };

        return self;
    };

    // ==========================================
    // 5. ΕΚΚΙΝΗΣΗ (MAIN CONTROLLER)
    // ==========================================
  const AppController = {
       init: () => {
     
           UIEngine.init();
      
            const suffixes = ['-mobile', ''];
            const activeWidgets = [];

          suffixes.forEach(suffix => {
                const container = document.getElementById(`calendar-container${suffix}`);
                const calEl = document.getElementById(`calendar${suffix}`);
             
                if (container && calEl && !calEl.classList.contains('fc')) {
                    activeWidgets.push(CalendarWidget(suffix));
                }
            });

           if (activeWidgets.length === 0) return;

            let attempts = 0; 
            const waitForCalendar = setInterval(async () => {
                attempts++;
                if (window.FullCalendar) {
                    clearInterval(waitForCalendar);
                    
              
                    if (Object.keys(DataEngine.postsByDate).length === 0) {
                        await Promise.all([
                            DataEngine.fetchData(),
                            DataEngine.fetchQuotes()
                        ]);
                    }
                    
               
                   activeWidgets.forEach(widget => widget.init());
                } else if (attempts > 100) {
            
                    clearInterval(waitForCalendar);
                }
            }, 100);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
    }
})();

;(() => {
  "use strict";
     // DIMOFI
const CONFIG = Object.freeze({
    maxBasePosts: 15,
    targetDate: new Date("2021-09-11T00:00:00Z"),
    autoSlideIntervalMs: 3000, 
    animLockMs: 500,
    
    feedPopularUrl: "/feeds/posts/default/-/" + encodeURIComponent("δημοφιλή") + "?alt=json&max-results=15",
  feedLabelsUrl: "/feeds/posts/default/-/" + "Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι|Γενικά".split('|').map(encodeURIComponent).join('|') + "?alt=json&max-results=50",
    
    safeImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdYTGP-KF_2ZHc7ykgjO533JVSDXYPsg36Oi3XC0Z6UN-yEKAhpbsK5PME3r9Q_WeAXn-c20sWAmLR65slEVQSaYaDVKLuYQtaqbjuGyH71VxJxgZqWx5vG1JSCOFlqWswSphTn6Zup1d8Uz9Ie2Tq9CQeHmWBPusLJ7rc_bPJkiau4W47iSy6cSp60N4/s800/Gemini_Generated_Image_1itzx51itzx51itz.png"
 
  });

  const DATA = Object.freeze({
    candidatePostsFor16: [
      { title: "Τα όρια δεν είναι φράχτες", link: "https://dimperist.blogspot.com/p/blog-page_8.html", image: "" },
    { title: "Αόρατος γονιός", link: "https://dimperist.blogspot.com/p/blog-page_1.html", image: "" },
    { title: "Πώς θα μεγαλώσουμε αυτόνομα και ανεξάρτητα παιδιά", link: "https://dimperist.blogspot.com/p/blog-page_13.html", image: "" },
    { title: "Τρόποι μείωσης της χρήσης οθονών από τα παιδιά", link: "https://dimperist.blogspot.com/p/blog-page.html", image: "" },
    { title: "10 τρόποι για να εκτιμά το παιδί τον εαυτό του", link: "https://dimperist.blogspot.com/p/10.html", image: "" },
    { title: "Τι κάνω όταν το παιδί μου θυμώνει;", link: "https://dimperist.blogspot.com/p/blog-page_86.html", image: "" },
    { title: "Παιδικές φοβίες: Αιτίες και Τρόποι Αντιμετώπισης", link: "https://dimperist.blogspot.com/p/blog-page_32.html", image: "" },
    { title: "Συναισθηματική ανάπτυξη & \"αρνητικά\" συναισθήματα", link: "https://dimperist.blogspot.com/p/blog-page_43.html", image: "" },
    { title: "Γράμμα παιδιού", link: "https://dimperist.blogspot.com/p/blog-page_71.html", image: "" },
    { title: "Το παιδί μου αντιμιλά, τι να κάνω;", link: "https://dimperist.blogspot.com/p/blog-page_98.html", image: "" },
    { title: "10 Συμβουλές για να αγαπήσουν τα «πρωτάκια» το σχολείο", link: "https://dimperist.blogspot.com/p/10_19.html", image: "" },
    { title: "Συμβουλές για καλύτερη επιστροφή στο σχολείο", link: "https://dimperist.blogspot.com/p/blog-page_19.html", image: "" },
    { title: "Οργάνωση μελέτης του παιδιού", link: "https://dimperist.blogspot.com/p/blog-page_20.html", image: "" },
    { title: "Πώς να κάνουν τα παιδιά να αγαπήσουν τα βιβλία", link: "https://dimperist.blogspot.com/p/blog-page_29.html", image: "" },
    { title: "Τι ΝΑ κάνετε και τι να ΜΗΝ κάνετε με το διάβασμα", link: "https://dimperist.blogspot.com/p/blog-page_64.html", image: "" },
    { title: "Bullying - Σχολικός Εκφοβισμός", link: "https://dimperist.blogspot.com/p/bullying.html", image: "" },
    { title: "Παιδική παχυσαρκία: Πρόληψη και σωστές διατροφικές συνήθειες", link: "https://dimperist.blogspot.com/p/blog-page_85.html", image: "" },
{ title: "Η άσκηση ως τρόπος ζωής", link: "https://dimperist.blogspot.com/2026/01/blog-post_14.html", image: "" },
{ title: "Ανακαλύψετε το σωστό άθλημα για το παιδί σας", link: "https://dimperist.blogspot.com/2026/02/blog-post_5.html", image: "" },
{ title: "Προστατεύομαι από τους σεισμούς", link: "https://dimperist.blogspot.com/p/blog-page_59.html", image: "" },
    { title: "Ενθαρρύνουμε τη δημιουργικότητα των παιδιών", link: "https://dimperist.blogspot.com/p/blog-page_41.html", image: "" },
    { title: "Η σημασία του παιχνιδιού στην ανάπτυξη", link: "https://dimperist.blogspot.com/p/blog-page_83.html", image: "" },
    { title: "Δραστηριότητες που αναπτύσσουν τις μαθησιακές δεξιότητες", link: "https://dimperist.blogspot.com/p/blog-page_56.html", image: "" }
    ]
  });

 const STATE = {
    sliderPosts: []
  };

  // ==========================================
  // 3. UTILITIES (Εργαλεία)
  // ==========================================
  const Utils = {
    extractMedia: (entry) => {
     let imageUrl = "";
      let isVideo = false;
      // Έλεγχος και στο summary για συμβατότητα με ιστολόγια που χρησιμοποιούν "Σύντομη Ροή"
      const content = (entry.content && entry.content.$t) ? entry.content.$t : (entry.summary && entry.summary.$t ? entry.summary.$t : "");

      try {
  // Προσθήκη υποστήριξης για το youtube-nocookie.com (που χρησιμοποιούν τα σχολεία λόγω GDPR)
       const ytRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:shorts\/|[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        const ytMatch = content.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
          return { imageUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`, isVideo: true };
        }

      // Καλύπτει διπλά (") και μονά (') εισαγωγικά, τα οποία συχνά προκύπτουν από αντιγραφή-επικόλληση
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
        const imgMatch = content.match(imgRegex);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
         if (imageUrl.includes("blogger.googleusercontent.com") || imageUrl.includes("bp.blogspot.com")) {
            // Καλύπτει και τα σύγχρονα formats της Google (π.χ. =s320)
            imageUrl = imageUrl.replace(/\/s[0-9]+(-b|-c|-w)?\//, '/s800/').replace(/=(?:w[0-9]+-h[0-9]+|s[0-9]+)(-c)?/, '=s800');
          }
          return { imageUrl, isVideo: false };
        }

      if (entry.media$thumbnail && entry.media$thumbnail.url) {
          // Καλύπτει και τα σύγχρονα formats μεγεθών της Google (π.χ. =w72-h72) για αποφυγή θολών εικόνων
          imageUrl = entry.media$thumbnail.url.replace(/\/s[0-9]+(-b|-c|-w)?\//, '/s800/').replace(/=(?:w[0-9]+-h[0-9]+|s[0-9]+)[a-z0-9-]*/i, '=s800');
          return { imageUrl, isVideo: false };
        }
      } catch (err) {}

      return { imageUrl: CONFIG.safeImage, isVideo: false };
    },

    getLink: (entry) => {
      const linkObj = entry.link.find(l => l.rel === "alternate");
      // [FIX] Αποτροπή απότομου άλματος στην κορυφή της σελίδας
      return linkObj ? linkObj.href : "javascript:void(0)"; 
    }
  };

 // ==========================================
  // 4. API MANAGER (Σύγχρονες Κλήσεις Δεδομένων)
  // ==========================================
  const ApiManager = {
    fetchData: async () => {
     try {
        const [popularRes, labelsRes] = await Promise.all([
          fetch(CONFIG.feedPopularUrl).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(CONFIG.feedLabelsUrl).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

       if (popularRes) ApiManager.processPopularPosts(popularRes);
        ApiManager.processWeeklyPick(labelsRes);
        
        // Η Έξυπνη Λούπα: Βρίσκει ταυτόχρονα το Desktop και το Mobile HTML!
        ["-desktop", "-mobile"].forEach(suffix => SliderManager.buildWidget(suffix));
        
      } catch (error) {
        ["-desktop", "-mobile"].forEach(suffix => {
          const container = document.getElementById(`slider-content${suffix}`);
          if (container) container.innerHTML = "<p style='text-align:center; padding:20px; color:#a90e0e;'>Σφάλμα φόρτωσης αναρτήσεων.</p>";
        });
      }
    },

   processPopularPosts: (json) => {
      // Ασφαλής ανάγνωση για να μην κρασάρει αν το json ή το feed λείπουν
      const entries = (json && json.feed && json.feed.entry) ? json.feed.entry : [];
      for (const entry of entries) {
        if (STATE.sliderPosts.length >= CONFIG.maxBasePosts) break;
        
        const publishedDate = new Date(entry.published.$t);
        if (publishedDate >= CONFIG.targetDate) {
          const media = Utils.extractMedia(entry);
          STATE.sliderPosts.push({
            title: entry.title.$t,
            link: Utils.getLink(entry),
            image: media.imageUrl,
            isVideo: media.isVideo
          });
        }
      }
    },

processWeeklyPick: (json) => {
      let candidates = [...DATA.candidatePostsFor16];
      // Ασφαλής ανάγνωση αν το API αποτύχει
      const entries = (json && json.feed && json.feed.entry) ? json.feed.entry : [];
      entries.forEach(entry => {
        const media = Utils.extractMedia(entry);
        candidates.push({
          title: entry.title.$t,
          link: Utils.getLink(entry),
          image: media.imageUrl,
          isVideo: media.isVideo
        });
      });

   const weekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
      const weeklyPick = candidates[weekNum % candidates.length];

      const weeklyPostObj = {
        title: "⭐ " + weeklyPick.title,
        link: weeklyPick.link,
        image: weeklyPick.image || CONFIG.safeImage,
        isVideo: weeklyPick.isVideo || false
      };

    // Εναρμόνιση των ορίων με τη ρύθμιση CONFIG.maxBasePosts, καταργώντας τους στατικούς αριθμούς
      const targetIndex = Math.min(CONFIG.maxBasePosts, STATE.sliderPosts.length);
      STATE.sliderPosts.splice(targetIndex, 0, weeklyPostObj);

      if (STATE.sliderPosts.length > CONFIG.maxBasePosts + 1) {
        STATE.sliderPosts = STATE.sliderPosts.slice(0, CONFIG.maxBasePosts + 1);
      }
    }
  };

 // ==========================================
  // 5. SLIDER MANAGER (UI & DOM - Universal)
  // ==========================================
  const SliderManager = {
    buildWidget: (suffix) => {
      // Στοχεύει δυναμικά το -desktop ή το -mobile
      const container = document.getElementById(`slider-content${suffix}`);
      const wrapper = document.getElementById(`custom-post-slider${suffix}`);
      if (!container || !wrapper) return; // Αν δεν το βρει, πάει στο επόμενο!

      const arrowPrev = wrapper.querySelector('.arrow-prev');
      const arrowNext = wrapper.querySelector('.arrow-next');

      if (STATE.sliderPosts.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις.</p>";
        if (arrowPrev) arrowPrev.classList.add('hidden-arrow');
        if (arrowNext) arrowNext.classList.add('hidden-arrow');
        return;
      }

      const fragment = document.createDocumentFragment();

      STATE.sliderPosts.forEach((post, index) => {
        const slide = document.createElement('div');
        slide.className = `slide-item ${index === 0 ? "active" : ""}`;
        
        // 1. Lazy loading στις κρυφές διαφάνειες
        const loadingAttr = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
        const videoBadge = post.isVideo ? `<div class="video-badge">&#9654;</div>` : "";
        

        const safeTitle = post.title
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        slide.innerHTML = `
          <a href="${post.link}" class="slide-link">
            ${videoBadge}
            <div class="slide-counter">${index + 1} / ${STATE.sliderPosts.length}</div>
          <img src="${post.image}" alt="${safeTitle}" onerror="this.onerror=null; this.src='${CONFIG.safeImage}';" ${loadingAttr}>
            <div class="slide-title-wrapper">
              <div class="slide-title">${safeTitle}</div>
            </div>
          </a>
        `;
        fragment.appendChild(slide);
      });

      container.innerHTML = "";
      container.appendChild(fragment);

    const localState = {
        currentIndex: 0,
        autoSlideTimer: null,
        isAnimating: false,
        touchStartX: 0,
        touchStartY: 0,    // ΝΕΟ: Για τον έλεγχο κάθετου scroll
        isSwiping: false,  // ΝΕΟ: Για αποτροπή του αθέλητου κλικ (Bug 2)
        isHovered: false   // ΝΕΟ: Για το Bug 4 (παρακάτω)
      };

      const showSlide = (index) => {
        const slides = wrapper.querySelectorAll('.slide-item');
        if (slides.length === 0) return;

        slides.forEach(slide => slide.classList.remove("active"));

        if (index >= STATE.sliderPosts.length) localState.currentIndex = 0;
        else if (index < 0) localState.currentIndex = STATE.sliderPosts.length - 1;
        else localState.currentIndex = index;

        slides[localState.currentIndex].classList.add("active");
      };

      const moveSlide = (step) => {
        if (localState.isAnimating) return;
        localState.isAnimating = true;

        showSlide(localState.currentIndex + step);
        resetAutoSlide();

        setTimeout(() => { localState.isAnimating = false; }, CONFIG.animLockMs);
      };

      const startAutoSlide = () => {
        clearInterval(localState.autoSlideTimer);
        localState.autoSlideTimer = setInterval(() => { moveSlide(1); }, CONFIG.autoSlideIntervalMs);
      };

    const resetAutoSlide = () => {
        clearInterval(localState.autoSlideTimer);
        // Ξεκινάει ΞΑΝΑ το auto-slide ΜΟΝΟ αν το ποντίκι ΔΕΝ είναι πάνω στο slider
        if (STATE.sliderPosts.length > 1 && !localState.isHovered) startAutoSlide();
      };

    if (STATE.sliderPosts.length > 1) {
        // Κλειδώνει την περιοχή για να αποτρέψει το "Go Back" gesture των κινητών κατά το swipe του slider
        wrapper.style.touchAction = "pan-y";
        
        if (arrowPrev) {
          arrowPrev.classList.remove('hidden-arrow');
          arrowPrev.onclick = (e) => { e.preventDefault(); moveSlide(-1); }; // Αντικατάσταση event listener με onclick
        }
        if (arrowNext) {
          arrowNext.classList.remove('hidden-arrow');
          arrowNext.onclick = (e) => { e.preventDefault(); moveSlide(1); };  // Αντικατάσταση event listener με onclick
        }
        
        startAutoSlide();

      // Εκτέλεση των συμβάντων hover ΜΟΝΟ σε συσκευές με ποντίκι, αποτρέποντας το πάγωμα σε οθόνες αφής
        if (window.matchMedia("(hover: hover)").matches) {
          wrapper.addEventListener("mouseenter", () => {
            localState.isHovered = true;
            clearInterval(localState.autoSlideTimer);
          }, { passive: true });
          
          wrapper.addEventListener("mouseleave", () => {
            localState.isHovered = false;
            resetAutoSlide();
          }, { passive: true });
        }
        
       wrapper.addEventListener("touchstart", (e) => {
          clearInterval(localState.autoSlideTimer);
          localState.touchStartX = e.changedTouches[0].screenX;
          localState.touchStartY = e.changedTouches[0].screenY;
          localState.isSwiping = false; // Μηδενισμός σε κάθε άγγιγμα
        }, { passive: true });

       wrapper.addEventListener("touchend", (e) => {
          const diffX = localState.touchStartX - e.changedTouches[0].screenX;
          const diffY = localState.touchStartY - e.changedTouches[0].screenY;
          
        // Αποτροπή ακούσιας αλλαγής διαφάνειας κατά το λοξό/πλάγιο κάθετο σκρολάρισμα της σελίδας
          if (Math.abs(diffX) > Math.abs(diffY) * 2 && Math.abs(diffX) > 40) {
            localState.isSwiping = true;
            
        // ΝΕΟ: Αυξημένος χρόνος (400ms) για να καλύψει σίγουρα την καθυστέρηση εικονικού κλικ (ghost click) των κινητών
            setTimeout(() => { localState.isSwiping = false; }, 400);
            if (diffX > 0) moveSlide(1);    
            else moveSlide(-1); 
          }
      resetAutoSlide();
        }, { passive: true });

        // ΝΕΟ FIX: Ξεπαγώνει την αυτόματη εναλλαγή όταν ο browser ακυρώνει την αφή (π.χ. κάθετο σκρολάρισμα)
        wrapper.addEventListener("touchcancel", () => {
          localState.isSwiping = false;
          resetAutoSlide();
        }, { passive: true });

        // FIX Bug 2: Ακύρωση του link (κλικ) αν ο χρήστης μόλις έκανε swipe
        wrapper.addEventListener("click", (e) => {
          if (localState.isSwiping) {
            e.preventDefault();
            localState.isSwiping = false;
          }
        });
      } else {
        if (arrowPrev) arrowPrev.classList.add('hidden-arrow');
        if (arrowNext) arrowNext.classList.add('hidden-arrow');
      }
    }
  };

  // ==========================================
  // 6. ΕΚΚΙΝΗΣΗ
  // ==========================================
 if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ApiManager.fetchData);
  } else {
      ApiManager.fetchData(); // Αν η σελίδα έχει ήδη φορτώσει, ξεκίνα αμέσως!
  }

})();


;(() => {
    "use strict";
 //DIAKOPEK
   const CONFIG = Object.freeze({
        messageDelay: 7000,
        storageKey: "holidayShownMsgs", // Κοινό κλειδί αποθήκευσης και για τα 2!
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/diakopeka.json'
    });

    // Το DOM πλέον έχει δύο θήκες για να βρει και το κινητό και το PC
    const DOM = { mobile: null, pc: null };
const DataEngine = {
        // ΝΕΟ: Εφεδρικό μήνυμα εξαρχής, για να μην υπάρχει ποτέ "νεκρό κλικ" 
        // όσο περιμένουμε να κατέβει το JSON από τον server.
        messagesArray: ["Μείνε προσηλωμένος στον στόχο σου. Οι διακοπές είναι η ανταμοιβή σου! 🏖️"],
        fetchMessages: async () => {
          try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Bad response"); // Σπρώχνει τα 404/500 errors στο catch
                const data = await response.json();
                
                // Αποτροπή άδειου Array: Αντικαθιστά το εφεδρικό ΜΟΝΟ αν όντως υπάρχουν μηνύματα!
                if (data && data.messages && data.messages.length > 0) {
                    DataEngine.messagesArray = data.messages;
                }
            } catch (e) {
                console.warn("Το JSON με τα μηνύματα δεν φόρτωσε.");
                // Αν πέσει το ίντερνετ, ας δείχνει έστω ένα προεπιλεγμένο μήνυμα:
                DataEngine.messagesArray = ["Μείνε προσηλωμένος στον στόχο σου. Οι διακοπές είναι η ανταμοιβή σου! 🏖️"]; 
            }
        }
    };
    const Utils = {
        getOrthodoxEaster: (year) => {
            const a = year % 19, b = year % 4, c = year % 7;
            const d = (19 * a + 15) % 30;
            const e = (2 * b + 4 * c + 6 * d + 6) % 7;
            const date = new Date(year, 2, 22);
            date.setDate(date.getDate() + (d + e + 13));
            return date;
        },
        getDayOfYear: (dateObj) => {
            const start = new Date(dateObj.getFullYear(), 0, 0);
            const diff = dateObj - start + (start.getTimezoneOffset() - dateObj.getTimezoneOffset()) * 60000;
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        },
        safeStorageGet: (key) => {
            try { return JSON.parse(sessionStorage.getItem(key)) || []; } 
            catch (e) { return []; }
        },
        safeStorageSet: (key, val) => {
            try { sessionStorage.setItem(key, JSON.stringify(val)); } 
            catch (e) {}
        },
      // --- ΝΕΟ 1: Εκθετική Καμπύλη Κούρασης (Bezier) ---
        getBurnoutCurve: (currentDay, startDay, totalDays, startLevel, endLevel) => {
            // Υπολογίζουμε πόσο % της σχολικής περιόδου έχει περάσει (από 0.0 έως 1.0)
            let progress = Math.max(0, Math.min(1, (currentDay - startDay) / totalDays));
            
            // Εδώ γίνεται η μαγεία: Υψώνουμε την πρόοδο στη δύναμη του 2.5
            // Έτσι, στην αρχή της περιόδου δεν καταλαβαίνουν τίποτα, και στο τέλος... καταρρέουν!
            let curve = Math.pow(progress, 2.5);
            
            return startLevel - ((startLevel - endLevel) * curve);
        }
    };

    const CoreEngine = {
        update: () => {
            const now = new Date();
            const year = now.getFullYear();

            // Υπολογισμοί Ημερομηνιών (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
            const easterDate = Utils.getOrthodoxEaster(year);
            const easterStart = new Date(easterDate.getTime());
            easterStart.setDate(easterStart.getDate() - 8);
            easterStart.setHours(0, 0, 0, 0);
            
            const easterEnd = new Date(easterStart.getTime());
            easterEnd.setDate(easterStart.getDate() + 15);
            easterEnd.setHours(23, 59, 59, 999);

            const summerStart = new Date(year, 5, 16, 0, 0, 0);
            const summerEnd = new Date(year, 8, 10, 23, 59, 59);

            let xmasStart = new Date(year, 11, 24, 0, 0, 0);
            const xmasEnd = new Date(year + (now.getMonth() === 0 ? 0 : 1), 0, 7, 23, 59, 59);
            if (now.getMonth() === 0 && now.getDate() <= 7) {
                xmasStart = new Date(year - 1, 11, 24, 0, 0, 0);
            }

            const isHoliday = ((now >= summerStart && now <= summerEnd) || 
                               (now >= xmasStart && now <= xmasEnd) || 
                               (now >= easterStart && now <= easterEnd));

            let nextIcon = "&#10024;";
            let nextText = '<span class="holiday-days">Καλές διακοπές!</span>';

            if (!isHoliday) {
                const targets = [
                    { name: "για τις διακοπές του Πάσχα 🐣", date: easterStart, icon: "🐣" },
                    { name: "για το Καλοκαίρι 🏝️", date: summerStart, icon: "🏝️" }, 
                    { name: "για τα Χριστούγεννα 🎄", date: xmasStart, icon: "🎄" }
                ].sort((a, b) => a.date - b.date);

                let next = targets.find(t => t.date > now);
                if (!next) {
                    const nextEaster = Utils.getOrthodoxEaster(year + 1);
                    nextEaster.setDate(nextEaster.getDate() - 8);
                    next = { name: "για το Πάσχα 🐣", date: nextEaster, icon: "🐣" };
                }

                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const targetDate = new Date(next.date.getFullYear(), next.date.getMonth(), next.date.getDate());
                const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

                nextIcon = next.icon;
                const daysText = diffDays === 1 ? "Μένει 1 ημέρα" : `Μένουν ${diffDays} ημέρες`;
                nextText = `<span class="holiday-days">${daysText}</span> ${next.name}`;
            }

            // Υπολογισμοί Μπαταρίας (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
            const dayOfYear = Utils.getDayOfYear(now);
            const easterStartDay = Utils.getDayOfYear(easterStart);
            let batLevel = 50;
            const m = now.getMonth() + 1, d = now.getDate();
            const isEaster = (now >= easterStart && now <= easterEnd);
            const isSummer = (m === 6 && d >= 16) || (m === 7) || (m === 8) || (m === 9 && d <= 10);
            const isXmas = (m === 12 && d >= 24) || (m === 1 && d <= 7);

            if (isSummer) {
                const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                batLevel = 5 + ((dayOfYear - summerStartDay) * 1.31); 
            } else if (isXmas) {
                const xmasStartCalc = new Date(now.getFullYear() - (m === 1 ? 1 : 0), 11, 22);
                const xmasDay = Math.floor((now - xmasStartCalc) / 86400000);
                batLevel = 50 + (xmasDay * 1.87); 
            } else if (isEaster) {
                batLevel = 40 + ((dayOfYear - easterStartDay + 1) * 1.87);
            } else {
                if (dayOfYear >= 244) {
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 244, 113, 100, 47); 
                } else if (dayOfYear >= 8 && dayOfYear < easterStartDay) {
                    const daysToEaster = easterStartDay - 8;
                    batLevel = Utils.getBurnoutCurve(dayOfYear, 8, daysToEaster, 80, 40); 
                } else {
                    const summerStartDay = Utils.getDayOfYear(new Date(now.getFullYear(), 5, 16));
                    const daysToSummer = Math.max(1, summerStartDay - (easterStartDay + 15));
                    batLevel = Utils.getBurnoutCurve(dayOfYear, easterStartDay + 15, daysToSummer, 70, 5); 
                }
            }

            batLevel = Math.max(5, Math.min(100, Math.round(batLevel)));
            const batTextHTML = `Μπαταρία Δασκάλων: ${batLevel}% ${isHoliday ? '<span class="charging-icon">⚡</span>' : ''}`;

            const hour = now.getHours();
            const minutes = now.getMinutes();
            const timeInHours = hour + (minutes / 60); 
            const isWeekend = now.getDay() === 0 || now.getDay() === 6;

            let physicsClass = 'physics-home';
            if (isWeekend) {
                physicsClass = 'physics-home';
            } else if (timeInHours >= 8 && timeInHours < 10.5) {
                physicsClass = 'physics-morning';
            } else if (timeInHours >= 10.5 && timeInHours < 12.5) {
                physicsClass = 'physics-midday';
            } else if (timeInHours >= 12.5 && timeInHours < 14.5) {
                physicsClass = 'physics-6th-hour';
            } else {
                physicsClass = 'physics-home';
            }

            // Ενημέρωση όλων των ενεργών Widgets (PC & Κινητό ταυτόχρονα!)
            Object.values(DOM).forEach(widget => {
                if (!widget) return;
                
                widget.icon.innerHTML = nextIcon;
                widget.display.innerHTML = nextText;

                widget.batFill.style.width = batLevel + '%';
                widget.batText.innerHTML = batTextHTML;

                widget.batFill.classList.remove(
                    'battery-charging-fx', 'battery-low-alert', 
                    'physics-home', 'physics-morning', 'physics-midday', 'physics-6th-hour'
                );
                widget.batFill.style.background = '';
                widget.batFill.style.boxShadow = 'none';

                if (isHoliday) {
                    widget.batFill.classList.add('battery-charging-fx');
                } else if (batLevel <= 20) {
                    widget.batFill.classList.add('battery-low-alert');
                } else {
                    if (batLevel <= 50) {
                        widget.batFill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)'; 
                        widget.batFill.style.boxShadow = '0 0 10px rgba(246, 211, 101, 0.5)';
                    } else {
                        widget.batFill.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'; 
                        widget.batFill.style.boxShadow = '0 0 10px rgba(67, 233, 123, 0.5)';
                    }
                    widget.batFill.classList.add(physicsClass);
                }
            });
        }
    };

    const MessageManager = {
        isShowing: { mobile: false, pc: false },
        timeout: { mobile: null, pc: null },

        show: (e, platform) => {
            e.stopPropagation();

            const widget = DOM[platform];
            if (!widget) return;

            // ΑΣΦΑΛΕΙΑ: Αν πατήσουν ΠΑΝΩ στο ίδιο το κείμενο, ΜΗΝ το κλείσεις!
            if (e.target && e.target.closest && (e.target.closest('#holiday-secret-message-mobile') || e.target.closest('#holiday-secret-message'))) return;

            // 1. Ελέγχουμε αν είναι κινητό
            const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

            // 2. Εκτέλεση haptic δόνησης ΜΟΝΟ αν πατήθηκε το widget του κινητού
            if (isTouch && platform === 'mobile' && navigator.vibrate) {
                navigator.vibrate(50);
            }

            // ΝΕΟ: Αν το μήνυμα είναι ανοιχτό, ΚΛΕΙΣΤΟ αμέσως! (Toggle)
            if (MessageManager.isShowing[platform]) {
                MessageManager.hide(null, platform);
                return;
            }
            if (DataEngine.messagesArray.length === 0) return;
            
            MessageManager.isShowing[platform] = true;
            widget.mainContent.style.display = 'none';
            widget.secretBox.style.display = 'block';
            
            let shown = Utils.safeStorageGet(CONFIG.storageKey);
            if (shown.length >= DataEngine.messagesArray.length) shown = []; 
            
            const available = DataEngine.messagesArray.map((_, i) => i).filter(i => !shown.includes(i));
            const randomIdx = available[Math.floor(Math.random() * available.length)];
            
            shown.push(randomIdx);
            Utils.safeStorageSet(CONFIG.storageKey, shown);
            
            widget.secretBox.innerHTML = DataEngine.messagesArray[randomIdx];

            clearTimeout(MessageManager.timeout[platform]);
            MessageManager.timeout[platform] = setTimeout(() => MessageManager.hide(null, platform), CONFIG.messageDelay);
        },
        
       hide: (e, specificPlatform) => {
            if (e && e.target && e.target.closest && (e.target.closest('#holiday-secret-message-mobile') || e.target.closest('#holiday-secret-message'))) return;
            
            const platforms = specificPlatform ? [specificPlatform] : ['mobile', 'pc'];

            platforms.forEach(platform => {
                if (!MessageManager.isShowing[platform]) return;
                const widget = DOM[platform];
                if (widget) {
                    clearTimeout(MessageManager.timeout[platform]);
                    widget.secretBox.style.display = 'none';
                    widget.mainContent.style.display = ''; // Αφαίρεση του inline style ώστε να ανακτήσει τον έλεγχο το flex/grid του CSS
                    MessageManager.isShowing[platform] = false;
                }
            });
        }
    };

    const App = {
        init: () => {
            const setups = [
                { platform: 'mobile', suffix: '-mobile' },
                { platform: 'pc', suffix: '' }
            ];

            setups.forEach(({ platform, suffix }) => {
                const widgetBox = document.getElementById(`holiday-widget-box${suffix}`);
                if (widgetBox) {
                    DOM[platform] = {
                        widgetBox: widgetBox,
                        mainContent: document.getElementById(`holiday-main-content${suffix}`),
                        secretBox: document.getElementById(`holiday-secret-message${suffix}`),
                        display: document.getElementById(`h-countdown${suffix}`),
                        icon: document.getElementById(`h-icon${suffix}`),
                        batFill: document.getElementById(`bat-fill${suffix}`),
                        batText: document.getElementById(`bat-text${suffix}`)
                    };
                    
                    widgetBox.addEventListener('click', (e) => MessageManager.show(e, platform));
                    widgetBox.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
                }
            });

           if (!DOM.mobile && !DOM.pc) return; // Δεν βρέθηκε κανένα widget

            CoreEngine.update(); // Αρχικός υπολογισμός
            setInterval(CoreEngine.update, 60000); // ΖΩΝΤΑΝΗ ενημέρωση κάθε 1 λεπτό για αλλαγή ώρας/ημερών!
            DataEngine.fetchMessages();

           document.addEventListener('click', MessageManager.hide, { passive: true });
            // ΔΙΕΓΡΑΨΑ το touchstart event στο document. 
            // Αν το αφήσεις, η παραμικρή προσπάθεια για scroll της σελίδας από τον χρήστη θα κρύβει ακαριαία το widget.
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();

;(() => {
  "use strict";


  // GRIF

  const CONFIG = Object.freeze({
    // ΕΔΩ ΒΑΖΕΙΣ ΤΟ LINK ΤΟΥ JSON ΑΡΧΕΙΟΥ ΣΟΥ
    jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/grifakivasi.json' 
  });

  // Λίστα με τα πιθανά IDs (και για Mobile και για PC)
  const WIDGETS_CONFIG = [
    { boxId: "daily-riddle-box-mobile", qId: "daily-riddle-question-mobile", aId: "daily-riddle-answer-mobile" },
    { boxId: "daily-riddle-box", qId: "daily-riddle-question", aId: "daily-riddle-answer" }
  ];

  // ==========================================
  // 2. DATA ENGINE (Λήψη JSON)
  // ==========================================
  const DataEngine = {
    riddlesArray: [],
  fetchRiddles: async () => {
      try {
        const response = await fetch(CONFIG.jsonUrl);
        // FIX: Αν το link είναι λάθος (π.χ. 404), πετάει Error για να πάει στο catch!
        if (!response.ok) throw new Error("HTTP Error"); 
        
        const data = await response.json();
        DataEngine.riddlesArray = data.riddlesDb || [];
        
        // FIX: Αν το JSON κατέβει αλλά είναι άδειο, πετάει Error για να δείξει τη "Χτένα"
        if (DataEngine.riddlesArray.length === 0) throw new Error("Empty Array");
      } catch (e) {
        console.warn("Το JSON με τους γρίφους δεν φόρτωσε.");
        // Σε περίπτωση που κοπεί το ίντερνετ, ας δείχνει έστω έναν γρίφο!
        DataEngine.riddlesArray = [
          { q: "Έχει δόντια, αλλά δε δαγκώνει. Τι είναι;", a: "Η χτένα!" }
        ];
      }
    }
  };

  // ==========================================
  // 3. WIDGET MANAGER
  // ==========================================
  const RiddleManager = {
    init: async () => { 
      // Ελέγχει ποια widgets υπάρχουν ενεργά στο HTML (PC, Mobile ή και τα δύο)
      const activeWidgets = WIDGETS_CONFIG.map(conf => ({
        box: document.getElementById(conf.boxId),
        question: document.getElementById(conf.qId),
        answer: document.getElementById(conf.aId)
      })).filter(w => w.box && w.question && w.answer);

      // Αν δεν βρει κανένα από τα δύο, σταματάει
      if (activeWidgets.length === 0) return;

      // --- ΚΑΤΕΒΑΖΕΙ ΤΟΥΣ ΓΡΙΦΟΥΣ ΜΙΑ ΦΟΡΑ ---
      await DataEngine.fetchRiddles();
      if (DataEngine.riddlesArray.length === 0) return;

      // Εφαρμόζει τη λογική σε ΟΣΑ widgets βρήκε
      activeWidgets.forEach(widget => {
        RiddleManager.loadDaily(widget.question, widget.answer);
        RiddleManager.setupEvents(widget.box);
      });
    },

   loadDaily: (questionElement, answerElement) => {
      const today = new Date();
      // Υπολογισμός ημερών για να δείχνει τον ίδιο γρίφο όλη μέρα
      const localMs = today.getTime() - (today.getTimezoneOffset() * 60000);
      const daysPassed = Math.floor(localMs / 86400000);
      
      // Επιλέγει γρίφο από το Array που κατέβασε
      const todaysRiddle = DataEngine.riddlesArray[daysPassed % DataEngine.riddlesArray.length];
      
      // Βάζει το κείμενο στο συγκεκριμένο widget
      questionElement.textContent = todaysRiddle.q;
      answerElement.textContent = todaysRiddle.a;
    },

    // Παίρνει ως παράμετρο το ΣΥΓΚΕΚΡΙΜΕΝΟ box που δέχεται κλικ/keydown
    toggleBlur: (boxElement) => {
      const isClear = boxElement.classList.toggle("is-clear");
      boxElement.setAttribute("aria-expanded", String(isClear));
    },

    setupEvents: (boxElement) => {
      // FIX: Κάνει το στοιχείο ικανό να πατηθεί με το πληκτρολόγιο (tabindex) και διορθώνει τα κλικ στα iPhone (role)
      boxElement.setAttribute("tabindex", "0");
      boxElement.setAttribute("role", "button");


      boxElement.addEventListener("click", () => {
        // Αν ο χρήστης έχει επιλέξει (μαρκάρει) κείμενο, αγνοούμε το κλικ για να μην κλείσει ο γρίφος
        if (window.getSelection().toString().trim().length > 0) return;
        
        RiddleManager.toggleBlur(boxElement);
      });
      
      boxElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          RiddleManager.toggleBlur(boxElement);
        } else if (e.key === "Escape") {
          boxElement.classList.remove("is-clear");
          boxElement.setAttribute("aria-expanded", "false");
        }
      });
    }
  };

  // ==========================================
  // 4. ΕΚΚΙΝΗΣΗ
  // ==========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", RiddleManager.init);
  } else {
    RiddleManager.init();
  }

})();

;(() => {
  "use strict";

  // hkserES
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/kidsFactsMob.json";
  let globalFacts = [];

  // Εργαλείο: Ανακάτεμα του πίνακα
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Ενεργοποιεί κάθε κάρτα αυτόνομα
  const setupWidget = (suffix) => {
    const inner = document.getElementById(`kf-inner-${suffix}`);
    const textEl = document.getElementById(`kf-fact-${suffix}`);
    const wrapper = document.getElementById(`kf-wrapper-${suffix}`);

  if (!inner || !textEl || !wrapper) return;

    // FIX: Ενεργοποιεί το focus για το πληκτρολόγιο (tabindex) και λύνει το "νεκρό" κλικ στα iPhone
    inner.setAttribute("tabindex", "0");
    inner.setAttribute("role", "button");

    // Τοπική μνήμη για την κάθε κάρτα
    let shuffled = shuffleArray(globalFacts);
    let index = 0;
    let updateTimer = null;

    // Συνάρτηση που αλλάζει το κείμενο χρησιμοποιώντας ΠΑΝΤΑ το innerHTML
    const updateText = () => {
      if (index >= shuffled.length) {
        shuffled = shuffleArray(globalFacts);
        index = 0;
      }
      textEl.innerHTML = shuffled[index];
      index++;
    };

    // Αρχική φόρτωση του πρώτου κειμένου
    updateText();

    // Η Λογική της Περιστροφής
  // Η Λογική της Περιστροφής
    const toggleFlip = () => {
      const isFlipped = inner.classList.contains("kf-is-flipped");
      const willBeFlipped = !isFlipped;
      
      inner.classList.toggle("kf-is-flipped", willBeFlipped);
      inner.setAttribute("aria-pressed", String(willBeFlipped));

      // FIX: Ακυρώνουμε προηγούμενο timer αν γίνει απανωτό κλικ (Spam Click)
      if (updateTimer) clearTimeout(updateTimer);

      // FIX: Αλλάζουμε το κείμενο ΜΟΝΟ όταν η κάρτα ΚΛΕΙΝΕΙ (!willBeFlipped), 
      // ώστε να ετοιμαστεί κρυφά το επόμενο fact χωρίς να "κάψουμε" το τωρινό!
      if (!willBeFlipped) {
        updateTimer = setTimeout(updateText, 350);
      }
    };

  // Κλικ με το ποντίκι / δάχτυλο
    inner.addEventListener("click", () => {
      // Αν ο χρήστης έχει επιλέξει (μαρκάρει) κείμενο, αγνοούμε το κλικ για να μη γυρίσει η κάρτα απότομα
      if (window.getSelection().toString().trim().length > 0) return;
      
      toggleFlip();
    });

   // Κλικ με το πληκτρολόγιο (Προσβασιμότητα)
    inner.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "Escape") {
        if (inner.classList.contains("kf-is-flipped")) {
          toggleFlip(); // Χρησιμοποιούμε τη σωστή συνάρτηση για να κλείσει και να ανανεωθεί σωστά
        }
      }
    });

 
  };

  // Εκκίνηση (Κατεβάζει το JSON και ξεκινάει τις κάρτες)
  const init = async () => {
    try {
      const response = await fetch(JSON_URL);
      if (response.ok) {
        const data = await response.json();
        // Διαβάζει αποκλειστικά το kidsFactsMob
        globalFacts = data.kidsFactsMob || [];
      }
   } catch (e) {
      console.error("Σφάλμα φόρτωσης δεδομένων:", e);
    }
    
    // FIX: Αν το JSON αποτύχει ή είναι άδειο, βάζουμε το μήνυμα ως "μοναδική πληροφορία" (fact)
    // Έτσι η κάρτα συνεχίζει να λειτουργεί κανονικά και ο χρήστης, γυρίζοντάς την, βλέπει το μήνυμα!
    if (globalFacts.length === 0) {
      globalFacts = ["Δε βρέθηκαν πληροφορίες αυτή τη στιγμή. Δοκιμάστε ξανά αργότερα!"];
    }

    // Ενεργοποιεί ταυτόχρονα το κινητό και το PC!
    setupWidget("mob");
    setupWidget("desk");
  };

  // Τρέχει μόλις φορτώσει η σελίδα
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

;(() => {
  // mythakikinola3
    "use strict";
const CONFIG = Object.freeze({
        jsonUrl: 'https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/questionsDbpc2.json' // <-- Πρόσθεσε εδώ το link σου!
    });

   
const DataEngine = {
        questionsArray: [],
        fetchQuestions: async () => {
              try {
                const response = await fetch(CONFIG.jsonUrl);
                if (!response.ok) throw new Error("Αποτυχία λήψης δεδομένων.");
                const data = await response.json();
                
                DataEngine.questionsArray = data.questionsDb || [];
                
                // ΔΙΟΡΘΩΣΗ: Προστασία από άδειο array ή λάθος όνομα κλειδιού στο JSON
                if (DataEngine.questionsArray.length === 0) {
                    throw new Error("Το JSON είναι άδειο ή δομικά μη έγκυρο.");
                }
            } catch (error) {
                console.error("Το API (Quiz) απέτυχε. Φόρτωση Fallback:", error);
               DataEngine.questionsArray = [
                    { 
                        text: "Αδυναμία φόρτωσης ερωτήσεων. Παρακαλώ ελέγξτε τη σύνδεσή σας στο διαδίκτυο.", 
                        type: "error", // Αλλάζουμε τον τύπο 
                        icon: "⚠️", 
                        exp: "Δοκιμάστε να ανανεώσετε τη σελίδα (F5).",
                        isError: true // ΔΙΟΡΘΩΣΗ: Προσθήκη flag για να το αναγνωρίζει το UI ως σφάλμα
                    }
                ];
            }
        }
    };
    const Utils = {
        shuffleArray: (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        }
    };

   // 2. Η Έξυπνη Μηχανή (Δημιουργεί ανεξάρτητο Quiz για PC και Κινητό)
    const initQuizWidget = (suffix) => {
        const localDOM = {
            display: document.getElementById(`question-display${suffix}`),
            feedback: document.getElementById(`quiz-feedback${suffix}`),
            iconSpan: document.getElementById(`q-icon${suffix}`),
            expBox: document.getElementById(`explanation-box${suffix}`),
            expText: document.getElementById(`explanation-text${suffix}`),
            btnRow: document.getElementById(`action-buttons${suffix}`),
            stats: document.getElementById(`quiz-stats${suffix}`),
            qContainer: document.getElementById(`question-container${suffix}`)
        };

        // Αν δεν βρει το συγκεκριμένο widget στη σελίδα, απλά το αγνοεί!
     if (Object.values(localDOM).some(el => el === null)) return;

        // Ξεχωριστό "σκορ" και πρόοδος για κάθε widget!
        const state = { questions: [], index: 0, score: 0, current: null };

       const loadNext = () => {
            if (state.index >= state.questions.length) {
                state.questions = Utils.shuffleArray(DataEngine.questionsArray);
                state.index = 0;
                state.score = 0; // ΔΙΟΡΘΩΣΗ: Μηδενισμός του σκορ στην επανεκκίνηση του quiz!
            }

            state.current = state.questions[state.index];
            state.index++;

          localDOM.display.innerHTML = state.current.text; 
            localDOM.iconSpan.innerHTML = state.current.icon || ""; // ΔΙΟΡΘΩΣΗ: Αποτρέπει την εκτύπωση της λέξης 'undefined'
            localDOM.feedback.innerHTML = "";
            localDOM.stats.innerHTML = `Σκορ: <strong>${state.score}</strong>`;

            // ΔΙΟΡΘΩΣΗ: Αν είναι μήνυμα σφάλματος, κρύψε τα κουμπιά και δείξε κατευθείαν την εξήγηση
            if (state.current.isError) {
                localDOM.btnRow.style.display = "none";
                localDOM.expText.innerHTML = state.current.exp;
                localDOM.expBox.style.display = "block";
            } else {
                localDOM.btnRow.style.display = "flex";
                localDOM.expBox.style.display = "none"; 
            }

            localDOM.qContainer.classList.remove("question-anim");
            localDOM.iconSpan.classList.remove("question-anim");
            void localDOM.qContainer.offsetWidth; // Trigger reflow 
            localDOM.qContainer.classList.add("question-anim");
            localDOM.iconSpan.classList.add("question-anim");
        };

        const processChoice = (userChoice) => {
            localDOM.btnRow.style.display = "none";
            
            // ΔΙΟΡΘΩΣΗ: Ασφαλής σύγκριση! Αποτρέπει σφάλματα από booleans, κεφαλαία ή τυχαία κενά στο JSON.
            const safeUserChoice = String(userChoice).trim().toLowerCase();
            const safeCorrectChoice = String(state.current.type).trim().toLowerCase();

            if (safeUserChoice === safeCorrectChoice) { 
                state.score++;
                localDOM.feedback.innerHTML = "Σωστά! ✅"; 
                localDOM.feedback.style.color = "#27ae60"; 
            } else { 
                localDOM.feedback.innerHTML = "Λάθος! ❌"; 
                localDOM.feedback.style.color = "#e74c3c"; 
            }
            
           // ΔΙΟΡΘΩΣΗ: Αν η ερώτηση δεν έχει επεξήγηση, δείχνει προεπιλεγμένο μήνυμα αντί για 'undefined'
            localDOM.expText.innerHTML = state.current.exp || "Δεν υπάρχει επιπλέον εξήγηση."; 
            localDOM.expBox.style.display = "block";
            localDOM.stats.innerHTML = `Σκορ: <strong>${state.score}</strong>`;
        };

        // Αρχικοποίηση
        state.questions = Utils.shuffleArray(DataEngine.questionsArray);
        if (state.questions.length > 0) {
            loadNext();
        }

        // Event Listeners ΜΟΝΟ για το συγκεκριμένο widget
        localDOM.btnRow.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn || !btn.dataset.choice) return;
            processChoice(btn.dataset.choice);
        });

        localDOM.expBox.addEventListener("click", (e) => {
            const nextBtn = e.target.closest("button");
            if (nextBtn && nextBtn.dataset.action === "next") {
                loadNext();
            }
        });
    };

    // 3. ΕΚΚΙΝΗΣΗ (Universal App)
    const UniversalApp = {
        init: async () => {
            // Κατεβάζουμε το JSON ΜΟΝΟ ΜΙΑ ΦΟΡΑ από το internet
            await DataEngine.fetchQuestions();

            // Η Έξυπνη Λούπα: Το κενό "" είναι για το PC, το "-mobile" για το κινητό!
            const platforms = ["", "-mobile"];
            platforms.forEach(suffix => initQuizWidget(suffix));
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", UniversalApp.init);
    } else {
        UniversalApp.init();
    }

})();

;(() => {
    "use strict";
   // eksipnes
    const CONFIG = Object.freeze({
        labels: ["Διαπαιδαγώγηση", "Ψυχολογία", "Σχολείο", "Υγεία", "Παιχνίδι", "Σελίδες", "Γενικά"],
        maxResults: 3,
        defaultEmoji: "📌"
    });

    const Utils = {
        parseTitle: (rawTitle) => {
            let emoji = CONFIG.defaultEmoji;
            let text = rawTitle.trim();
          // Υποστηρίζει πλέον και τα σύνθετα Emojis (επαγγέλματα, χρώμα δέρματος) χωρίς να τα κόβει
            const emojiMatch = text.match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}\u200D\uFE0F\p{Emoji_Modifier}]+)\s*(.*)/u);
            if (emojiMatch) {
                emoji = emojiMatch[1];
                text = emojiMatch[2];
            }
            return { emoji, text };
        }
    };

    const App = {
        widgets: [],
        seenUrls: new Set(), // Κοινή μνήμη για να αποφεύγουμε διπλότυπα
        
        init: () => {
            // 1. Δήλωση των διαθέσιμων widgets (PC & Mobile)
            const widgetConfigs = [
                { hub: "smart-hub", toggle: "hub-toggle", content: "hub-content", dynamic: "dynamic-posts-container" },
                { hub: "smart-hub-mobile", toggle: "hub-toggle-mobile", content: "hub-content-mobile", dynamic: "dynamic-posts-container-mobile" }
            ];

            // 2. Έξυπνη αναζήτηση στη σελίδα (Κρατάει μόνο όσα υπάρχουν στο HTML)
            widgetConfigs.forEach(conf => {
                const hubEl = document.getElementById(conf.hub);
                if (hubEl) {
                    App.widgets.push({
                        hub: hubEl,
                        toggle: document.getElementById(conf.toggle),
                        content: document.getElementById(conf.content),
                        dynamicContainer: document.getElementById(conf.dynamic)
                    });
                }
            });

            if (App.widgets.length === 0) return; // Αν δε βρει κανένα, δεν κάνει τίποτα.

            App.setupUI();
            App.recordExistingLinks();
            App.fetchPosts();
        },

       setupUI: () => {
            // 3. Ανεξάρτητα συρτάρια
            App.widgets.forEach(w => {
                if (w.toggle && w.content) {
                    w.toggle.addEventListener('click', (e) => {
                        // Αφαιρέθηκε το e.stopPropagation() για να μην "μπλοκάρει" το κλείσιμο άλλων μενού στο blog
                        w.content.classList.toggle("open");
                        w.toggle.classList.toggle("active");
                    });
                }
            });

            // Κλείσιμο κλικάροντας/αγγίζοντας αλλού (FIX για τα iPhone/iPad που δεν πιάνουν το click)
            ['click', 'touchstart'].forEach(eventType => {
                window.addEventListener(eventType, (e) => {
                    App.widgets.forEach(w => {
                        if (w.content?.classList.contains('open') && w.hub && !w.hub.contains(e.target)) {
                            w.content.classList.remove('open');
                            w.toggle?.classList.remove('active');
                        }
                    });
                }, { passive: true });
            });
        },

        recordExistingLinks: () => {
            // 4. Καταγραφή υπαρχόντων links και από τα δύο widgets 
            App.widgets.forEach(w => {
                const existingLinks = w.hub.querySelectorAll('.hub-links a');
                existingLinks.forEach(a => App.seenUrls.add(a.href.split('?')[0].split('#')[0]));
            });
        },

        fetchPosts: async () => {
            try {
                // 5. Κατέβασμα δεδομένων ΜΟΝΟ 1 ΦΟΡΑ (Ταχύτητα)
                const promises = CONFIG.labels.map(label => {
                    const url = `/feeds/posts/summary/-/${encodeURIComponent(label)}?alt=json&max-results=${CONFIG.maxResults}`;
                    return fetch(url)
                        .then(res => res.ok ? res.json() : null)
                        .catch(() => null); // Αν μια ετικέτα αποτύχει, δεν καταστρέφει τις άλλες
                });

                const results = await Promise.all(promises);
                const listItems = []; // Προσωρινή αποθήκη για τα <li>

                results.forEach(data => {
                    if (!data || !data.feed || !data.feed.entry) return;
                    data.feed.entry.forEach(entry => {
                        const linkObj = entry.link.find(l => l.rel === 'alternate');
                        if (!linkObj) return;

                        const cleanLink = linkObj.href.split('?')[0].split('#')[0];
                        if (App.seenUrls.has(cleanLink)) return;
                        
                        App.seenUrls.add(cleanLink);
                        const { emoji, text } = Utils.parseTitle(entry.title.$t || "");
                        
                       const li = document.createElement('li');
                        li.innerHTML = `<a href="${linkObj.href}"><span class="hub-ic">${emoji}</span><span class="hub-tx"></span></a>`;
                        // FIX: Αλλαγή σε innerHTML για να μεταφράζονται σωστά τα &quot; και &amp; του Blogger
                        li.querySelector('.hub-tx').innerHTML = text;
                        listItems.push(li); // Το αποθηκεύουμε στη μνήμη
                    });
                });

                // 6. Κλωνοποίηση (Copy-Paste) του κάθε άρθρου στα ενεργά widgets
                if (listItems.length > 0) {
                    App.widgets.forEach(w => {
                        if (w.dynamicContainer) {
                            const fragment = document.createDocumentFragment();
                            listItems.forEach(li => {
                                fragment.appendChild(li.cloneNode(true)); // cloneNode = ασφαλής κλωνοποίηση
                            });
                            w.dynamicContainer.appendChild(fragment);
                        }
                    });
                }
            } catch (err) {}
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }
})();


;(() => {
    "use strict";

    // ALERT
    const CONFIG = Object.freeze({
        SELECTORS: {
            BAR: "#school-alert-bar",
            TEXT: "#alert-text-message",
            CLOSE_BTN: ".alert-close-btn" // Βάλε αυτή την κλάση στο X κουμπί σου
        },
        STORAGE_KEY: "school_alert_dismissed",
        STORAGE_HOURS: 24, // Πόσες ώρες να μην ξαναβγεί αν το κλείσει ο χρήστης
        IGNORE_WORDS: ["ΕΔΩ ΓΡΑΦΕΙΣ"]
    });

    // 2. ENGINE ΚΛΑΣΗ
    class AlertEngine {
        constructor() {
            this.hasInitialized = false;
        }

        init() {
            // Guard: Αποφυγή διπλής εκτέλεσης (από DOMContentLoaded και Load)
            if (this.hasInitialized) return;
            
            const alertBar = document.querySelector(CONFIG.SELECTORS.BAR);
            const alertTextElem = document.querySelector(CONFIG.SELECTORS.TEXT);

            // Error Checking: Αν δεν υπάρχουν τα στοιχεία στο HTML, σταμάτα ομαλά
            if (!alertBar || !alertTextElem) return;

            this.hasInitialized = true;
            const text = alertTextElem.innerText.trim();

            // Έλεγχος αν πρέπει να κρυφτεί (Άδειο, #, λέξεις-κλειδιά, ή αν το έχει ήδη κλείσει)
            if (this.shouldHide(text)) {
                alertBar.style.display = "none";
                return;
            }

            // ΕΞΥΠΝΗ ΜΕΤΑΚΙΝΗΣΗ (στην αρχή του body)
            document.body.insertBefore(alertBar, document.body.firstChild);
            alertBar.style.display = "flex";

            // Event Delegation για το κλείσιμο (χωρίς onclick="" στο HTML)
            alertBar.addEventListener("click", (e) => {
                if (e.target.closest(CONFIG.SELECTORS.CLOSE_BTN)) {
                    this.dismiss(alertBar);
                }
            });
        }

        shouldHide(text) {
            // Αν το έχει κλείσει πρόσφατα
            if (this.checkMemory()) return true;
            // Αν το κείμενο είναι άδειο ή αρχίζει από #
            if (!text || text.startsWith("#")) return true;
            // Αν περιέχει απαγορευμένες λέξεις
            if (CONFIG.IGNORE_WORDS.some(word => text.includes(word))) return true;
            
            return false;
        }

        dismiss(alertBar) {
            alertBar.style.display = "none";
            // Αποθήκευση στο localStorage της τρέχουσας ώρας + διάρκεια
            const expiry = Date.now() + (CONFIG.STORAGE_HOURS * 60 * 60 * 1000);
            localStorage.setItem(CONFIG.STORAGE_KEY, expiry.toString());
        }

        checkMemory() {
            const storedTime = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!storedTime) return false;
            
            // Έλεγχος αν έχει λήξει η "μνήμη" (π.χ. πέρασαν 24 ώρες)
            if (Date.now() > parseInt(storedTime, 10)) {
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                return false;
            }
            return true; // Το θυμάται, άρα κρατάμε τη μπάρα κλειστή
        }
    }

    // 3. BOOTSTRAP: Ασφαλής εκκίνηση
    const app = new AlertEngine();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => app.init());
    } else {
        app.init();
    }
    window.addEventListener("load", () => app.init());

})();

;(() => {
  "use strict";

  // floatvelosw

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


;(() => {
    "use strict";

    const CONFIG = {
        storageKey: "mobi_glass_subscribed_v3", 
        hideDays: 30
    };

    //newletter
    function initWidget(prefix) {
        
        // 2. Κάνουμε τα IDs δυναμικά βάζοντας το prefix μπροστά
        const DOM = {
            wrapper: document.getElementById(`${prefix}-glass-wrapper`),
            toggleBtn: document.getElementById(`${prefix}-toggle-btn`),
            formView: document.getElementById(`${prefix}-form-view`),
            scratchView: document.getElementById(`${prefix}-scratch-view`),
            
            input: document.getElementById(`${prefix}-glass-input`),
            noticeWrap: document.getElementById(`${prefix}-glass-notice-wrap`),
            submitBtn: document.getElementById(`${prefix}-glass-submit-btn`),
            icon: document.getElementById(`${prefix}-glass-icon`),
            form: document.getElementById(`${prefix}-glass-form`),

            canvas: document.getElementById(`${prefix}-scratch-canvas`),
            bgImage: document.getElementById(`${prefix}-scratch-bg`),
            postTitle: document.getElementById(`${prefix}-scratch-title-overlay`),
            postLink: document.getElementById(`${prefix}-scratch-link`),
            area: document.getElementById(`${prefix}-scratch-area`)
        };

        // 3. Αν δεν βρει το HTML του συγκεκριμένου widget στη σελίδα, σταματάει
        if (!DOM.wrapper) return;

        // 4. Όλες οι μεταβλητές μπαίνουν ΕΔΩ ΜΕΣΑ, ώστε το κάθε widget να έχει τις δικές του!
        let scratchCtx = null;
        let isDrawing = false;
     let isRevealed = false; 
        let currentView = 'form';
       let listenersAdded = false;
        let revealTimeout = null; 
        let cachedEntries = null; // ΝΕΟ: Μνήμη για να μην κατεβάζουμε ξανά τα ίδια άρθρα

     const WidgetManager = {
        init: () => {
       
         if (!DOM.wrapper) return;
            // Αφήνουμε το string κενό ώστε να αφαιρεθεί το inline style
            // και να αφήσουμε τα CSS Media Queries να εμφανίσουν/κρύψουν το σωστό widget!
            DOM.wrapper.style.display = '';

            let hideUntil = null;
            try {
                hideUntil = localStorage.getItem(CONFIG.storageKey);
            } catch(e) { console.warn("To localStorage μπλοκαρίστηκε."); }
            
            const now = new Date().getTime();
            
            // Αν είναι γραμμένος βλέπει κατευθείαν το Ξυστό!
            if (hideUntil && now < parseInt(hideUntil, 10)) {
                WidgetManager.setView('scratch');
            } else {
                WidgetManager.setView('form');
            }

            DOM.toggleBtn.addEventListener('click', () => {
                WidgetManager.setView(currentView === 'form' ? 'scratch' : 'form');
            });

            WidgetManager.setupForm();
        },

        setView: (view) => {
            currentView = view;
            if (view === 'scratch') {
                DOM.formView.style.display = 'none';
                DOM.scratchView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '✏️';
                DOM.toggleBtn.title = 'Εγγραφή στα νέα / Επεξεργασία';
                
                // Φορτώνει νέο Ξυστό αν το προηγούμενο έχει αποκαλυφθεί
                if (isRevealed || !scratchCtx) {
                    ScratchManager.initCanvas();
                    ScratchManager.fetchPost();
                }
            } else {
                DOM.scratchView.style.display = 'none';
                DOM.formView.style.display = 'block';
                DOM.toggleBtn.innerHTML = '🎁';
                DOM.toggleBtn.title = 'Παίξε το Ξυστό!';
            }
        },

        setupForm: () => {
          DOM.input?.addEventListener("focus", () => {
                DOM.noticeWrap?.classList.add(`${prefix}-open`); // Δυναμικό Class
            }, { once: true });

            DOM.input?.addEventListener("input", (e) => {
                const val = e.target.value.trim();
                if (val.includes("@") && val.includes(".")) DOM.submitBtn?.removeAttribute("disabled");
                else DOM.submitBtn?.setAttribute("disabled", "true");
            });

     DOM.form?.addEventListener("submit", () => {
                if (DOM.submitBtn) DOM.submitBtn.setAttribute("disabled", "true");
                // ΠΡΟΣΟΧΗ: ΔΕΝ βάζουμε e.preventDefault() εδώ!
                if (prefix === 'mobi' && navigator.vibrate) navigator.vibrate([50,50,50]);
                
                if (DOM.icon) {
                    DOM.icon.innerHTML = "✈️";
                    DOM.icon.classList.add(`${prefix}-fly-away`); 
                }

              const msToHide = CONFIG.hideDays * 24 * 60 * 60 * 1000;
                try {
                    localStorage.setItem(CONFIG.storageKey, (new Date().getTime() + msToHide).toString());
                } catch(e) { console.warn("To localStorage μπλοκαρίστηκε."); }

                setTimeout(() => {
                   if (DOM.icon) {
                        DOM.icon.innerHTML = "✉️";
                        DOM.icon.classList.remove(`${prefix}-fly-away`); 
                    }
                 if (DOM.submitBtn) {
                        DOM.submitBtn.innerHTML = `Εγγραφή <span id="${prefix}-glass-arrow">➔</span>`;
                        DOM.submitBtn.setAttribute("disabled", "true");
                    }
                    if (DOM.input) {
                        DOM.input.value = "";
                    }

                    WidgetManager.setView('scratch');
                }, 2000);
            });
        }
    };

  const ScratchManager = {
        initCanvas: () => {
            // Μικρή καθυστέρηση για να ανοίξει σωστά το block πριν πάρει διαστάσεις
           setTimeout(() => {
                // Προσθήκη ελέγχου: Ακυρώνει τη δημιουργία του καμβά αν ο χρήστης άλλαξε ξανά προβολή στα 50ms που μεσολάβησαν
                if(!DOM.canvas || !DOM.area || currentView !== 'scratch') return;
            
                if (revealTimeout) clearTimeout(revealTimeout);
                
                DOM.canvas.style.transition = 'none'; 
                DOM.canvas.style.display = 'block';
                DOM.canvas.style.opacity = '1';
                DOM.postTitle.style.opacity = "0";
                isRevealed = false;

                const rect = DOM.area.getBoundingClientRect();
                DOM.canvas.width = rect.width;
                DOM.canvas.height = rect.height;
                
               scratchCtx = DOM.canvas.getContext('2d', { willReadFrequently: true });
                
                // ΚΡΙΣΙΜΟ: Επαναφορά της λειτουργίας σε ζωγραφική. Αλλιώς παραμένει γόμα!
                scratchCtx.globalCompositeOperation = 'source-over';

                // Ασημένιο γέμισμα λαχνού
                const gradient = scratchCtx.createLinearGradient(0, 0, DOM.canvas.width, DOM.canvas.height);
                gradient.addColorStop(0, '#bdc3c7');
                gradient.addColorStop(0.5, '#e0e0e0');
                gradient.addColorStop(1, '#95a5a6');
                scratchCtx.fillStyle = gradient;
                scratchCtx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
                
                // Υφή Ξυστού (κουκκίδες)
                for (let i = 0; i < 1500; i++) {
                    scratchCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)';
                    scratchCtx.fillRect(Math.random() * DOM.canvas.width, Math.random() * DOM.canvas.height, 2, 2);
                }
                
                // Κείμενο
                scratchCtx.fillStyle = '#444';
                scratchCtx.font = 'bold 28px sans-serif';
                scratchCtx.textAlign = 'center';
                scratchCtx.textBaseline = 'middle';
                scratchCtx.fillText('\u2728 ΞΥΣΕ ΕΔΩ \u2728', DOM.canvas.width / 2, DOM.canvas.height / 2);

              // Ρυθμίσεις Γόμας
                scratchCtx.globalCompositeOperation = 'destination-out';
                scratchCtx.lineJoin = 'round';
                scratchCtx.lineCap = 'round';
                // Αν είναι desk βάζει 50, αλλιώς 40
                scratchCtx.lineWidth = prefix === 'desk' ? 50 : 40;

                // Βάζουμε τα events μόνο την πρώτη φορά!
                if (!listenersAdded) {
                    DOM.canvas.addEventListener('mousedown', ScratchManager.startDraw);
                    DOM.canvas.addEventListener('touchstart', ScratchManager.startDraw, { passive: false }); // SOS για κινητά
                    
                    window.addEventListener('mouseup', ScratchManager.stopDraw);
                    window.addEventListener('touchend', ScratchManager.stopDraw);
                    
                    DOM.canvas.addEventListener('mousemove', ScratchManager.draw);
                    DOM.canvas.addEventListener('touchmove', ScratchManager.draw, { passive: false });
                    listenersAdded = true;
                }
            }, 50);
        },

       getMousePos: (evt) => {
            const rect = DOM.canvas.getBoundingClientRect();
            let clientX, clientY;
            if (evt.touches) {
                clientX = evt.touches[0].clientX;
                clientY = evt.touches[0].clientY;
            } else {
                clientX = evt.clientX;
                clientY = evt.clientY;
            }
            
            // Υπολογισμός κλίμακας (scale) για απόλυτη ακρίβεια ακόμα και αν αλλάξει μέγεθος η οθόνη
            const scaleX = DOM.canvas.width / rect.width;
            const scaleY = DOM.canvas.height / rect.height;
            
            return { 
                x: (clientX - rect.left) * scaleX, 
                y: (clientY - rect.top) * scaleY 
            };
        },

        startDraw: (e) => {
            if (isRevealed) return;
            if (e.cancelable) e.preventDefault(); // Κλειδώνει το σκρολάρισμα
            isDrawing = true;
            const pos = ScratchManager.getMousePos(e);
            scratchCtx.beginPath();
            scratchCtx.moveTo(pos.x, pos.y);
            // Σβήνει και με ένα απλό πάτημα (touch tap)
            scratchCtx.lineTo(pos.x + 1, pos.y + 1);
            scratchCtx.stroke();
        },

      stopDraw: () => { 
            if (!isDrawing) return; // Αποτρέπει τη σάρωση αν ο χρήστης δεν ζωγράφιζε στον καμβά!
            isDrawing = false; 
            ScratchManager.checkReveal();
        },

      draw: (e) => {
            if (!isDrawing || isRevealed) return;
            if (e.cancelable) e.preventDefault(); 
            const pos = ScratchManager.getMousePos(e);
            scratchCtx.lineTo(pos.x, pos.y);
            scratchCtx.stroke();
            
            // ΚΡΙΣΙΜΟ: Ξεκινάμε νέο μονοπάτι από το τρέχον σημείο, 
            // ώστε να μην επανασχεδιάζεται όλο το ιστορικό της γραμμής από την αρχή!
            scratchCtx.beginPath();
            scratchCtx.moveTo(pos.x, pos.y);
            
            // Ελέγχουμε κάθε τόσο αν ξύστηκε αρκετά
            
            // Ελέγχουμε κάθε τόσο αν ξύστηκε αρκετά
            if (Math.random() < 0.1) ScratchManager.checkReveal();
        },

       checkReveal: () => {
            // ΚΡΙΣΙΜΟ: Προστασία για το κρυμμένο widget που έχει canvas 0x0 
            if (isRevealed || !scratchCtx || DOM.canvas.width === 0 || DOM.canvas.height === 0) return;
            const pixels = scratchCtx.getImageData(0, 0, DOM.canvas.width, DOM.canvas.height).data;
            let clearPixels = 0;
            
           // Ελέγχουμε 1 στα 16 pixels (ελαφρύτερο για τη μνήμη του κινητού)
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] < 32) clearPixels++; // Προσθήκη ανοχής για τα ημιδιαφανή pixels
            }
            
            const totalToCheck = pixels.length / 16;
  
            if ((clearPixels / totalToCheck) * 100 > 80) { 
                isRevealed = true;
               DOM.canvas.style.transition = 'opacity 0.6s ease';
                DOM.canvas.style.opacity = '0';
                DOM.postTitle.style.opacity = "1"; 
                revealTimeout = setTimeout(() => DOM.canvas.style.display = 'none', 600);
            }
        },

        // --- Ανάκτηση δεδομένων Blogger API ---
       // --- Ανάκτηση δεδομένων Blogger API ---
        fetchPost: () => {
            DOM.postTitle.innerHTML = "Φόρτωση δράσης... 🔍";
            DOM.bgImage.style.backgroundImage = "none";
            DOM.postLink.href = "#";

            let allEntries = []; // Εδώ θα μαζεύουμε όλες τις αναρτήσεις

            // Αναδρομική συνάρτηση για λήψη ανά 250
            const fetchBatch = (startIndex) => {
             fetch(`/feeds/posts/default?q=${encodeURIComponent('δράσεις')}&alt=json&max-results=250&start-index=${startIndex}`)
                    .then(r => r.json())
                    .then(data => {
                        const entries = data.feed?.entry || [];
                        allEntries = allEntries.concat(entries);
                        
               // ΝΕΟ: Επαγγελματικός έλεγχος (όπως ακριβώς στο Ημερολόγιο)
const totalResults = parseInt(data.feed?.openSearch$totalResults?.$t || 0, 10);

// Αν το startIndex + όσα άρθρα κατεβάσαμε ΤΩΡΑ είναι λιγότερα ή ίσα με τα συνολικά
if (startIndex + entries.length <= totalResults && entries.length > 0) {
    // ΣΗΜΑΝΤΙΚΟ: Προσθέτουμε ακριβώς όσα ήρθαν (entries.length), όχι καρφωτά το 250!
    fetchBatch(startIndex + entries.length);
} else {
    // Τελειώσαμε! Προχωράμε στην επεξεργασία όλων των άρθρων.
    processPosts(allEntries);
}
                    })
                    .catch(err => {
                        console.error("Blogger API Error:", err);
                        // Αν χτυπήσει error αλλά έχουμε ήδη κατεβάσει κάποιες από προηγούμενο κύκλο, δούλεψε με αυτές
                        if (allEntries.length > 0) {
                            processPosts(allEntries);
                        } else {
                            DOM.postTitle.innerHTML = "Σφάλμα φόρτωσης.";
                        }
                    });
            };

            // Συνάρτηση επεξεργασίας αφού κατέβουν όλες (αντικαθιστά το παλιό .then)
        const processPosts = (entries) => {
                cachedEntries = entries;
                // Φιλτράρισμα: Αν η λέξη 'δρασ' ή 'δράσ' υπάρχει στις ετικέτες (labels)
                const actionPosts = entries.filter(entry => {
                    if (!entry.category) return false;
                    return entry.category.some(cat => {
                        const term = cat.term.toLowerCase();
                        return term.includes("δράσει") || term.includes("δρασει"); 
                    });
                });

                if (actionPosts.length > 0) {
                    // Τυχαία επιλογή μιας Δράσης
                    const randomPost = actionPosts[Math.floor(Math.random() * actionPosts.length)];
                    
                    DOM.postTitle.innerHTML = randomPost.title.$t || "Σχολική Δράση";

                    // Το link της ανάρτησης
                    const linkObj = randomPost.link.find(l => l.rel === "alternate");
                    if (linkObj) DOM.postLink.href = linkObj.href;

                    // Εύρεση Εικόνας
                    let imgUrl = "";
                    if (randomPost.media$thumbnail?.url) {
                        imgUrl = randomPost.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?/, "/s600");
                 } else if (randomPost.content?.$t) {
                         // Υποστηρίζει πλέον και τα διπλά και τα μονά εισαγωγικά!
                         const imgMatch = randomPost.content.$t.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                         if (imgMatch) imgUrl = imgMatch[1];
                    }

                    if (imgUrl) {
                        DOM.bgImage.style.backgroundImage = `url('${imgUrl}')`;
                    } else {
                        DOM.bgImage.style.backgroundColor = '#34495e';
                    }
                } else {
                    DOM.postTitle.innerHTML = "Δεν βρέθηκαν δράσεις!";
                    DOM.bgImage.style.backgroundColor = '#27ae60';
                }
            };

            if (cachedEntries) {

                setTimeout(() => processPosts(cachedEntries), 60);
            } else {
                fetchBatch(1);
            }
        }
    }; // <-- Εδώ κλείνει το ScratchManager

        // Τρέχουμε την αρχικοποίηση του συγκεκριμένου widget!
        WidgetManager.init();

    } // <-- ΕΔΩ ΚΛΕΙΝΕΙ Η function initWidget(prefix) { ΠΟΥ ΑΝΟΙΞΑΜΕ ΣΤΟ ΒΗΜΑ 1

    // Φτιάχνουμε μια συνάρτηση που τρέχει και τα δύο (κινητό και υπολογιστή)
    function startWidgets() {
        initWidget('mobi');
        initWidget('desk');
    }

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', startWidgets);
    } else {
        startWidgets();
    }
})();

;(() => {
  'use strict';
  const initInfiniteScroll = () => {

    // infinite
  
    if (document.getElementById('infinite-scroll-sentinel')) return;

    const path = window.location.pathname;
    if (path.match(/\/\d{4}\/\d{2}\/.*\.html/) || path.match(/\/p\/.*\.html/)) return;
  
  const postsContainer = document.querySelector('.widget.Blog') || document.querySelector('.blog-posts') || document.querySelector('#main') || document.querySelector('.main-inner');
    const loadMoreBtn = document.querySelector('.blog-pager-older-link a') || document.querySelector('.blog-pager-older-link');
    
    if (!postsContainer || !loadMoreBtn) return;

  // ΔΙΟΡΘΩΣΗ BUG 1: Αφαιρέθηκε το παγκόσμιο μπλοκάρισμα για να λειτουργούν τα πλαϊνά widgets.
    let isFetching = false;
    let resizeDebounceTimer; // ΝΕΑ ΔΙΟΡΘΩΣΗ: Παγκόσμιο χρονόμετρο για να μην συγκρούονται οι αναρτήσεις
    const originalBtnText = loadMoreBtn.innerHTML;
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isFetching) loadNextPage();
    });
    // 3. Δυναμική Εισαγωγή CSS για Hardware-Accelerated (60fps) Animations
    if (!document.getElementById('infinite-scroll-css')) {
        const style = document.createElement('style');
        style.id = 'infinite-scroll-css';
        style.textContent = `
            .infinite-post-hidden {
                opacity: 0;
                transform: translateY(40px); 
            }
          .infinite-post-visible {
                opacity: 1;
              
                transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .infinite-btn-loading {
                opacity: 0.6;
                pointer-events: none !important; 
            }
        `;
        document.head.appendChild(style);
    }

  // 4. Δημιουργία αόρατου σημείου ελέγχου (Sentinel)
    const sentinel = document.createElement('div');
    sentinel.id = 'infinite-scroll-sentinel';
    sentinel.setAttribute('aria-hidden', 'true'); // Φιλικό προς Screen Readers
    sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none; visibility: hidden; margin: 0; padding: 0; clear: both; grid-column: 1 / -1;';
    postsContainer.appendChild(sentinel);
    const endOfPosts = () => {

       // Προστασία πλοήγησης: Κρύβουμε αυστηρά ΜΟΝΟ το δοχείο των παλαιότερων αναρτήσεων 
        // ώστε να παραμείνει ορατό το κουμπί των "Νεότερων Αναρτήσεων" και της "Αρχικής".
        if (loadMoreBtn.parentElement && (loadMoreBtn.parentElement.classList.contains('blog-pager-older-link') || loadMoreBtn.parentElement.id === 'blog-pager-older-link')) {
            loadMoreBtn.parentElement.style.display = 'none';
        }
        
        loadMoreBtn.style.display = 'none';
        sentinel.remove();     // Διαγραφή από το DOM (Εξοικονόμηση πόρων)
        observer.disconnect(); // Σταματάμε να "ακούμε" το scroll
    };
  // 5. Βελτιστοποιημένη Φόρτωση με Async/Await
    const loadNextPage = async () => {
      
        const currentHref = loadMoreBtn.getAttribute('data-safe-url') || loadMoreBtn.href || (loadMoreBtn.querySelector('a') ? loadMoreBtn.querySelector('a').href : null);
        if (isFetching || !currentHref) return;
        
    loadMoreBtn.setAttribute('data-safe-url', currentHref);
        isFetching = true;
        let hasError = false; 
        observer.unobserve(sentinel);
        
        // ΝΕΑ ΔΙΟΡΘΩΣΗ: Αποτροπή μπλοκαρίσματος "Mixed Content" από τον browser. 
        // Αναγκάζει τους παλιούς HTTP συνδέσμους να γίνουν HTTPS.
        let nextUrl = currentHref;
        if (window.location.protocol === 'https:' && nextUrl.startsWith('http://')) {
            nextUrl = nextUrl.replace('http://', 'https://');
        }
    
        loadMoreBtn.classList.add('infinite-btn-loading');
        loadMoreBtn.innerHTML = '<span aria-live="polite">⏳ Φόρτωση επόμενων...</span>';

        try {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Network response error: ${response.status}`);
            
            const html = await response.text();
    
            const doc = new DOMParser().parseFromString(html, "text/html");
            
        const newDocContainer = doc.querySelector('.widget.Blog') || doc.querySelector('.blog-posts') || doc.querySelector('#main') || doc.querySelector('.main-inner');
            // Προσθήκη επιλογέων για το Blogger Mobile Theme και απλά custom themes
            const rawNewPosts = newDocContainer ? newDocContainer.querySelectorAll('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer') : [];
         
            const postsArray = Array.from(rawNewPosts).filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer'));
            
            if (postsArray.length > 0) {
                // ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ 1: Χρήση DocumentFragment (Μηδενικό reflow - άριστο Performance)
                const fragment = document.createDocumentFragment();

                postsArray.forEach(post => {
                    post.classList.add('infinite-post-hidden');
            
                    post.querySelectorAll('script').forEach(oldScript => {
           
                    // ΝΕΑ ΔΙΟΡΘΩΣΗ: Έλεγχος για διπλότυπα εργαλεία ΟΧΙ ΜΟΝΟ στη ζωντανή σελίδα, 
                        // αλλά ΚΑΙ μέσα στο ίδιο το "πακέτο" των νέων άρθρων (fragment).
                        if (oldScript.src && (Array.from(document.scripts).some(s => s.src === oldScript.src) || Array.from(fragment.querySelectorAll('script')).some(s => s.src === oldScript.src))) {
                            oldScript.remove();
                            return;
                        }

                       const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
              
                 if (newScript.src) {
                            newScript.async = false;
                            newScript.textContent = oldScript.textContent;
                        } else {
                            // Αναγνώριση του τύπου του script
                            const scriptType = (oldScript.getAttribute('type') || '').toLowerCase();
                            const isExecutableJS = !scriptType || scriptType === 'text/javascript' || scriptType === 'application/javascript' || scriptType === 'module';

                       if (isExecutableJS && oldScript.textContent.trim() !== '') {
                                // ΝΕΑ ΔΙΟΡΘΩΣΗ (BLOB): Μετατροπή των εσωτερικών scripts σε εικονικά εξωτερικά.
                                // Αναγκάζει τον browser να περιμένει να κατέβουν πρώτα οι βιβλιοθήκες!
                                const blob = new Blob([oldScript.textContent], { type: 'text/javascript' });
                                const blobUrl = URL.createObjectURL(blob);
                                newScript.src = blobUrl;
                                newScript.async = false; 
                                
                                // Απελευθέρωση της μνήμης (Memory Management) μόλις το script εκτελεστεί.
                                newScript.onload = () => URL.revokeObjectURL(blobUrl);
                                newScript.onerror = () => URL.revokeObjectURL(blobUrl);
                            } else {
                                // Τα JSON-LD (SEO) και τα HTML Templates παραμένουν άθικτα,
                                // και χωρίς τα άγκιστρα {} της αρχικής έκδοσης!
                                newScript.textContent = oldScript.textContent;
                            }
                      }
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });

                // ΝΕΑ ΔΙΟΡΘΩΣΗ: Επειδή το Lightbox του Blogger αγνοεί τις νέες εικόνες, 
                    // τις αναγκάζουμε να ανοίγουν σε νέα καρτέλα ώστε να μην χάνεται 
                    // η θέση scrolling. Η παρέμβαση εφαρμόζεται ΜΟΝΟ στις εικόνες, 
                    // για να μην καταστρέφεται η εμπειρία πλοήγησης (Back button) στα κινητά τηλέφωνα.
                    post.querySelectorAll('a[imageanchor="1"], a[href$=".jpg"], a[href$=".png"], a[href$=".jpeg"]').forEach(link => {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    });
                    
                   fragment.appendChild(post);
                });

               // ΔΙΟΡΘΩΣΗ BUG 5: Πλήρης κάλυψη WebP/srcset, YouTube Iframes, και Backgrounds
                fragment.querySelectorAll('img[data-src], img[data-original], img[b\\:lazy-src], img[data-srcset], source[data-srcset], iframe[data-src], [data-bg]').forEach(el => {
                    const realSrc = el.getAttribute('data-src') || el.getAttribute('data-original') || el.getAttribute('b:lazy-src');
                    const realSrcset = el.getAttribute('data-srcset');
                    const realBg = el.getAttribute('data-bg');

                  if (realSrc && el.tagName !== 'SOURCE') {
                        // ΝΕΑ ΔΙΟΡΘΩΣΗ: Εφαρμογή εγγενούς lazy loading ΠΡΙΝ δοθεί το src.
                        // Εμποδίζει το κινητό να κατεβάσει δεκάδες εικόνες ταυτόχρονα.
                        if ((el.tagName === 'IMG' || el.tagName === 'IFRAME') && !el.hasAttribute('loading')) {
                            el.setAttribute('loading', 'lazy');
                        }
                        el.src = realSrc;
                        el.removeAttribute('data-src'); el.removeAttribute('data-original'); el.removeAttribute('b:lazy-src');
                    }
                    if (realSrcset) {
                        el.srcset = realSrcset;
                        el.removeAttribute('data-srcset');
                    }
                    if (realBg) {
                        el.style.backgroundImage = `url('${realBg}')`;
                        el.removeAttribute('data-bg');
                    }
                // Απεγκλωβισμός από CSS του Theme που κρύβει την εικόνα αν έχει την κλάση lazy
                    el.classList.remove('lazy', 'lazyload', 'lazy-hidden');
                    el.classList.add('lazyloaded');
                });

                fragment.querySelectorAll('img:not([loading]), iframe:not([loading])').forEach(el => {
                    el.setAttribute('loading', 'lazy');
                });

                const rawCurrentPosts = postsContainer.querySelectorAll('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer');
            
                const currentPostsArray = Array.from(rawCurrentPosts).filter(post => !post.parentElement.closest('.date-outer, .post-outer, article.post, .post, .mobile-date-outer, .mobile-post-outer'));
                const lastPost = currentPostsArray[currentPostsArray.length - 1];
       
                if (typeof document.write === 'function' && !window.isDocWriteSafeguarded) {
                    document.write = function() { console.warn('Αποτράπηκε page wipe από καθυστερημένο document.write'); };
                    document.writeln = function() {};
                    window.isDocWriteSafeguarded = true; // Κλειδώνει οριστικά για όση ώρα ο χρήστης είναι στη σελίδα
                }

              if (lastPost) {
                    lastPost.after(fragment);
                } else {
                    // Εισαγωγή των νέων άρθρων ΠΡΙΝ από τον αισθητήρα, ώστε 
                    // το sentinel να παραμένει πάντα στον απόλυτο πάτο του δοχείου.
                    postsContainer.insertBefore(fragment, sentinel);
                }

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                       postsArray.forEach((post, index) => {
                            // Εμφάνιση του καθενός άρθρου με διαφορά 100ms (premium αίσθηση)
                            setTimeout(() => {
                                post.classList.remove('infinite-post-hidden');
                                post.classList.add('infinite-post-visible');
                                
                                // Αφαίρεση της κλάσης μόλις ολοκληρωθεί το animation (1 δευτερόλεπτο).
                                // Αυτό απελευθερώνει την ανάρτηση ώστε να λειτουργούν άψογα τα native hover εφέ του θέματος.
                                setTimeout(() => {
                                    post.classList.remove('infinite-post-visible');
                                }, 1000);
                            }, index * 100); 
                        });
                    });
                });

           
        document.dispatchEvent(new CustomEvent('newPostsLoaded'));
           // ΝΕΑ ΔΙΟΡΘΩΣΗ: Δυναμικός επαναϋπολογισμός ύψους για διατάξεις πλέγματος (Masonry/Grid) 
               // με προστασία (Debounce) για την αποφυγή παγώματος (Layout Thrashing) κατά το σκρολάρισμα.
               postsArray.forEach(post => {
                   post.querySelectorAll('img').forEach(img => {
                       if (!img.complete) {
                           img.addEventListener('load', () => {
                               clearTimeout(resizeDebounceTimer);
                               resizeDebounceTimer = setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
                           });
                       }
                   });
               });

             setTimeout(() => {
                   // Η προηγούμενη διόρθωση παραμένει άθικτη εδώ
                   // ΝΕΑ ΔΙΟΡΘΩΣΗ: Στοχευμένη εκτέλεση Social Widgets ΜΟΝΟ στα νέα άρθρα, 
                   // αποτρέποντας το "αναβοσβήσιμο" (flickering) και την υπερφόρτωση συσκευής.
                   postsArray.forEach(post => {
                       if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') window.twttr.widgets.load(post);
                       if (window.FB && window.FB.XFBML && typeof window.FB.XFBML.parse === 'function') window.FB.XFBML.parse(post);
                   });
                   if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') window.instgrm.Embeds.process();
                   
                   window.dispatchEvent(new Event('resize')); 
               }, 500);
                const newLink = doc.querySelector('.blog-pager-older-link a') || doc.querySelector('.blog-pager-older-link [href]') || doc.querySelector('.blog-pager-older-link');
                
                // Προσθήκη .getAttribute('href') για αποφυγή σφαλμάτων "about:blank" από τον DOMParser
                const newHref = newLink ? (newLink.getAttribute('href') || newLink.href || (newLink.querySelector('a') ? newLink.querySelector('a').getAttribute('href') || newLink.querySelector('a').href : null)) : null;

              if (newHref && newHref !== nextUrl) {
    
                    loadMoreBtn.innerHTML = originalBtnText; 

                    loadMoreBtn.href = newHref;
                    if (loadMoreBtn.querySelector('a')) loadMoreBtn.querySelector('a').href = newHref;
                    
                    // ΚΡΙΣΙΜΗ ΔΙΟΡΘΩΣΗ: Ενημερώνουμε το data-safe-url για να μην διαβάζει τα παλιά άρθρα!
                    loadMoreBtn.setAttribute('data-safe-url', newHref);
                    
                } else {
                    endOfPosts();
                }
            } else {
                endOfPosts();
            }

       } catch (error) {
            console.error("Infinite Scroll Error:", error);
            hasError = true; // Καταγράφουμε το σφάλμα
            // FAIL-SAFE / ERROR RECOVERY: Επιτρέπει στον χρήστη να ξαναπροσπαθήσει χωρίς να σπάσει η σελίδα
            loadMoreBtn.innerHTML = '⚠️ Σφάλμα σύνδεσης. Πατήστε για επανάληψη.';
            
     } finally {
            // Εκτελείται ΠΑΝΤΑ (Επαναφορά μεταβλητών & CSS)
            loadMoreBtn.classList.remove('infinite-btn-loading');
     
            setTimeout(() => {
                isFetching = false;
                if (sentinel.parentNode && !hasError) observer.observe(sentinel);
            }, 500);
        }
    };

    // 6. Τέλειος Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        // Υπάρχει μόνο 1 στοιχείο, οπότε κοιτάμε απευθείας το entries[0]
        if (entries[0].isIntersecting) {
            loadNextPage();
        }
    }, {
     
        rootMargin: '1000px'
    });

  observer.observe(sentinel);
};

// ΝΕΑ ΔΙΟΡΘΩΣΗ: Ασφαλής εκκίνηση. Ελέγχει αν η σελίδα έχει ΗΔΗ φορτώσει 
// (π.χ. λόγω Cookie Banners). Αν ναι, εκτελείται άμεσα.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInfiniteScroll);
} else {
    initInfiniteScroll();
}
 })(); 

;(() => {
  'use strict';
  //reactionsneo
    // ==========================================
    // 1. CONFIGURATION & STATE
    // ==========================================
    const CONFIG = Object.freeze({
       SELECTORS: {
            // Αφαιρέθηκε το .date-outer διότι συγχωνεύει καταστροφικά τα άρθρα της ίδιας ημέρας
            ARTICLE_CONTAINER: '.post-outer, .post, article, .blog-post, .mobile-post-outer',
            POST_LINK: 'h3 a, .post-title a, .entry-title a, a[href*=".html"]',
            POST_BODY: '.post-body, .entry-content, .post-footer',
            READ_MORE_TRIGGER: '.jump-link, .mobile-index-arrow, .mobile-link-button'
        },
        LABELS: {
            READ_MORE: '<span class="icon">🔍</span> ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ',
            LOADING: '<span class="icon">⏳</span> ΦΟΡΤΩΣΗ...',
            CLOSE: '<span class="icon">✖</span> ΚΛΕΙΣΙΜΟ'
        },
     DEBOUNCE_MS: 250,
        // Αποθηκεύει το πραγματικό αρχικό URL (π.χ. σελίδα 2 ή ετικέτα) για να το επαναφέρει σωστά στο κλείσιμο!
        BASE_URL: window.location.pathname + window.location.search
    });

    const Utils = {
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => { clearTimeout(timeout); func(...args); };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        cleanString: (str) => {
            return str.replace(/["'«»“”‘’]/g, '').replace(/\s+/g, ' ').trim();
        },
   getPostPath: (container) => {
            try { 
                // 1. Δοκιμάζουμε ΠΡΩΤΑ να πάρουμε το ID από τον τίτλο (h3 a, .post-title a)
                // Αυτό λειτουργεί τέλεια στην Αρχική σελίδα, αλλά ΚΑΙ στα Σχετικά Άρθρα (Sidebar)
                const titleLink = container.querySelector('h3 a, .post-title a, .entry-title a');
                if (titleLink && titleLink.href) {
                    const url = new URL(titleLink.href);
                    url.hash = ''; 
                    return url.pathname;
                }

            // Τότε δίνουμε το URL του browser, ΜΟΝΟ εφόσον αυτό το container είναι το ΚΕΝΤΡΙΚΟ
                if (window.location.pathname.includes('.html') && container.querySelector(CONFIG.SELECTORS.POST_BODY)) {
                    return window.location.pathname;
                }

                // 3. Fallback ασφαλείας
                const anyLink = container.querySelector(CONFIG.SELECTORS.POST_LINK);
                if (anyLink && anyLink.href && !anyLink.closest(CONFIG.SELECTORS.POST_BODY)) {
                    const url = new URL(anyLink.href);
                    url.hash = '';
                    return url.pathname;
                }

                return null;
            } catch(e) { return null; }
        }
    };

    // ==========================================
    // 3. LIGHTBOX ENGINE (Αυτόνομο Module)
    // ==========================================
    class LightboxEngine {
        constructor() {
            this.galleryData = [];
            this.currentIndex = 0;
            this.overlay = null;
            this.touchStartX = 0;
            
            // Binding για να μπορούμε να αφαιρέσουμε τον Listener (Memory Leak Fix)
            this.handleKeydown = this.handleKeydown.bind(this);
            this.close = this.close.bind(this);
        }

        init(mediaNodes) {
            this.galleryData = [];
            mediaNodes.forEach((node) => {
                const tag = node.tagName.toLowerCase();
          if (tag === 'img') {
                    // Ανάκτηση της πραγματικής πηγής ακόμα και σε εικόνες αναμονής (Lazy-Loaded)
                    const realSrc = node.getAttribute('data-src') || node.getAttribute('data-original-src') || node.src;
                    
                    if (realSrc.includes('tracker') || realSrc.includes('blank.gif')) return;
                    
                    // Απορρίπτουμε βάσει πλάτους ΜΟΝΟ αν η εικόνα έχει όντως φορτώσει και δεν έχει lazy-load data.
                    if (!node.hasAttribute('data-src') && !node.hasAttribute('data-original-src') && node.naturalWidth > 0 && node.naturalWidth < 40) return;
                    
                    let src = realSrc;
                    const pLink = node.closest('a');
                  if (pLink && pLink.href && (pLink.href.match(/\.(jpe?g|png|gif|webp)(\?.*)?$/i) || pLink.href.includes('googleusercontent.com/img/') || pLink.href.includes('bp.blogspot.com/'))) src = pLink.href;
                    
                    this.galleryData.push({ type: 'image', src: src, thumb: node.src, el: node });
                    
                    // Απενεργοποίηση default link και Event Delegation trigger
                   
                    node.style.cursor = 'zoom-in';
                    node.dataset.lightboxIndex = this.galleryData.length - 1;
                    
        } else if (tag === 'iframe') {
                    let vidSrc = node.src.startsWith('//') ? 'https:' + node.src : node.src;
                    
                    // Αποκλεισμός εκπαιδευτικών εργαλείων (Forms, PDFs, Wordwall). Επιτρέπονται ΑΥΣΤΗΡΑ μόνο βίντεο πλατφόρμες.
                    if (!vidSrc.match(/youtube(?:-nocookie)?\.com|youtu\.be|vimeo\.com|dailymotion\.com/i)) return;
                    
           let thumbSrc = 'https://via.placeholder.com/150x100/333333/FFFFFF?text=VIDEO';
                    // ΔΙΟΡΘΩΣΗ: Προσθήκη υποστήριξης 'shorts' στη Regex και υποχρεωτική μετατροπή σε ασφαλές 'embed' URL
                    const ytMatch = vidSrc.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                  if (ytMatch && ytMatch[1]) {
                        thumbSrc = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                        
                        let extraParams = "?autoplay=1"; // Άμεση αναπαραγωγή για αποφυγή διπλού κλικ
                        const timeMatch = vidSrc.match(/[?&](t|start)=([^&]+)/i);
                        const listMatch = vidSrc.match(/[?&]list=([^&]+)/i);
                        
                        // Μετατροπή μορφής 1m20s σε δευτερόλεπτα
                        if (timeMatch) {
                            let tStr = timeMatch[2], seconds = 0;
                            if (tStr.includes('m')) {
                                let parts = tStr.split('m');
                                seconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
                            } else {
                                seconds = parseInt(tStr) || 0;
                            }
                            if (seconds > 0) extraParams += `&start=${seconds}`;
                        }
                        if (listMatch) extraParams += `&list=${listMatch[1]}`;
                        
                        vidSrc = `https://www.youtube.com/embed/${ytMatch[1]}${extraParams}`;
                    }
                    
                    this.galleryData.push({ type: 'video', src: vidSrc, thumb: thumbSrc, el: node });
                }
            });
        }

   // Η ΝΕΑ δυναμική μέθοδος open (The Patch)
        open(clickedElement) {
            // ΔΙΟΡΘΩΣΗ: Αποτροπή διπλού tap (το οποίο προκαλεί διπλό pushState και μολύνει / "σπάει" το ιστορικό)
            if (document.body.classList.contains('lb-active')) return;
            
            // 1. Βρίσκουμε ΟΛΟΚΛΗΡΟ το άρθρο (περίληψη + fetch) για να συλλέξουμε ΟΛΕΣ τις εικόνες
            const wrapper = clickedElement.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
if (!wrapper) return;
// Στοχεύουμε ΜΟΝΟ το κυρίως κείμενο για να μην ρουφάει εικονίδια Share, Avatars ή Σχετικά Άρθρα
// Στοχεύουμε δυναμικά το κυρίως κείμενο χρησιμοποιώντας τον επιλογέα από το CONFIG
const bodySelectors = CONFIG.SELECTORS.POST_BODY.split(',').map(s => `${s.trim()} img, ${s.trim()} iframe`).join(', ');
const mediaNodes = Array.from(wrapper.querySelectorAll(`${bodySelectors}, .scrollable-article-area img, .scrollable-article-area iframe`));
            this.init(mediaNodes);

            if (this.galleryData.length === 0) return;

         // 3. Βρίσκουμε ποια ακριβώς εικόνα πατήθηκε για να ξεκινήσουμε από αυτή
            this.currentIndex = this.galleryData.findIndex(item => item.el === clickedElement);
            if (this.currentIndex === -1) return; // Ακύρωση ανοίγματος αν η εικόνα απορρίφθηκε από το φίλτρο

        // 4. Εμφάνιση
            this.buildDOM();
            this.bindEvents();
            this.updateMedia();
            
            // Προσθήκη εικονικού ιστορικού αποκλειστικά για το Lightbox
            try { window.history.pushState({ lightbox: true }, '', window.location.href); } catch(e) {}
        }

       buildDOM() {
            // Αποτροπή δημιουργίας "ζόμπι" επικαλύψεων σε περίπτωση διπλού tap στο κινητό
            const existingOverlay = document.querySelector('.my-custom-lightbox');
            if (existingOverlay) existingOverlay.remove();

  this.overlay = document.createElement('div');
            this.overlay.className = 'my-custom-lightbox';
            // ΑΦΑΙΡΕΘΗΚΕ το touch-action: pinch-zoom διότι κλειδώνει τη μετακίνηση (panning) με 1 δάχτυλο!
            
            let html = `<div class="my-custom-lightbox-close">&times;</div>`;
            if (this.galleryData.length > 1) {
                html += `
                    <div class="my-custom-lightbox-counter"><span id="lb-current-idx">${this.currentIndex + 1}</span> / ${this.galleryData.length}</div>
                    <div class="my-custom-lightbox-prev">&#10094;</div>
                    <div class="my-custom-lightbox-next">&#10095;</div>
                `;
            }
            html += `<div class="my-custom-lightbox-img-container"></div>`;

            if (this.galleryData.length > 1) {
                html += `<div class="my-custom-lightbox-thumbnails">`;
                this.galleryData.forEach((gItem, tIndex) => {
                    const videoClass = gItem.type === 'video' ? 'is-video-thumb' : '';
                    html += `<div class="thumb-wrapper ${videoClass}" data-index="${tIndex}"><img src="${gItem.thumb}" class="my-lb-thumb"></div>`;
                });
                html += `</div>`;
            }

            this.overlay.innerHTML = html;
            document.body.classList.add("lb-active");
            document.body.appendChild(this.overlay);
            
            // Trigger reflow for transition
            requestAnimationFrame(() => this.overlay.classList.add('show'));
        }

        updateMedia() {
            const containerDiv = this.overlay.querySelector('.my-custom-lightbox-img-container');
            const counterSpan = this.overlay.querySelector('#lb-current-idx');
            const thumbWrappers = this.overlay.querySelectorAll('.thumb-wrapper');

         containerDiv.style.opacity = '0';
            
            // Ακύρωση προηγούμενης εντολής για αποφυγή "σπασίματος" σε γρήγορα Swipe / Κλικ
            if (this.mediaTimeout) clearTimeout(this.mediaTimeout);
            
        // ΑΚΑΡΙΑΙΑ ενημέρωση της διεπαφής (Αριθμός & Μικρογραφία) έξω από την καθυστέρηση!
            if (counterSpan) counterSpan.innerText = this.currentIndex + 1;
            thumbWrappers.forEach(t => t.classList.remove('active'));
            if (thumbWrappers[this.currentIndex]) {
                thumbWrappers[this.currentIndex].classList.add('active');
                thumbWrappers[this.currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }

          this.mediaTimeout = setTimeout(() => {
                if (!this.overlay) return; // Αποτροπή crash αν έκλεισε το Lightbox στο ενδιάμεσο
                const currentMedia = this.galleryData[this.currentIndex];
                
            if (currentMedia.type === 'image') {
                    // Προσθήκη draggable="false" ώστε να μην κλειδώνει το Swipe από το αυτόματο "σύρσιμο" του browser
                    containerDiv.innerHTML = `<img src="${currentMedia.src}" class="my-lb-media" alt="Gallery Image" draggable="false">`;
                } else {
                    containerDiv.innerHTML = `<iframe src="${currentMedia.src}" class="my-lb-media" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                }
                
                containerDiv.style.opacity = '1';
            }, 200);
        }

        bindEvents() {
            document.addEventListener('keydown', this.handleKeydown);
            
         const containerDiv = this.overlay.querySelector('.my-custom-lightbox-img-container');
           
           // ΔΙΟΡΘΩΣΗ: Αποτρέπουμε τον browser από το να κάνει "Πίσω" (Native Gesture) όταν ο χρήστης κάνει Swipe
           this.overlay.addEventListener('touchmove', e => {
               if (!e.target.closest('.my-custom-lightbox-thumbnails') && !(window.visualViewport && window.visualViewport.scale > 1.05)) {
                   if (e.cancelable) e.preventDefault();
               }
           }, { passive: false });
           
            // Εφαρμογή των events σε ΟΛΟ το overlay, ώστε το swipe να δουλεύει ακόμα και πάνω στο μαύρο κενό!
        this.overlay.addEventListener('touchstart', e => {
                // Εξαίρεση της μπάρας μικρογραφιών: Το σκρολάρισμά τους ΔΕΝ πρέπει να αλλάζει την κεντρική φωτογραφία
                if (e.target.closest('.my-custom-lightbox-thumbnails')) {
                    this.touchStartX = null;
                    return;
                }
                
                if (e.touches && e.touches.length > 1) {
                    this.touchStartX = null; // Διαγραφή παλιών συντεταγμένων λόγω Multi-Touch
                    return; 
                }
                this.touchStartX = e.changedTouches[0].screenX;
                this.touchStartY = e.changedTouches[0].screenY;
            }, {passive: true});
            
         this.overlay.addEventListener('touchend', e => {
                if (e.touches && e.touches.length > 0) return;
                if (this.touchStartX === null) return; // Ακύρωση του Swipe αν προηγήθηκε Zoom
                
                if (e.changedTouches && e.changedTouches.length > 1) return; 
                this.handleSwipe(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
            }, {passive: true});
}
     handleKeydown(e) {
            // ΔΙΟΡΘΩΣΗ: Προσθήκη preventDefault() για να αποτραπεί η ακούσια οριζόντια κύλιση 
            // του βασικού άρθρου στο παρασκήνιο, όταν ο χρήστης αλλάζει φωτογραφίες.
            if (e.key === 'ArrowRight') { e.preventDefault(); this.navigate(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.navigate(-1); }
            if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        }

       handleSwipe(touchEndX, touchEndY) {
            const swipeThreshold = 50;
            const diffX = touchEndX - this.touchStartX;
            const diffY = touchEndY - this.touchStartY;
            
  // Μετακίνηση ελέγχου στην αρχή! Ολική αποτροπή Swipe (και αλλαγής εικόνας ΚΑΙ κλεισίματος) όταν υπάρχει ζουμ.
            if (window.visualViewport && window.visualViewport.scale > 1.05) return;

         // ΟΛΙΚΗ αποτροπή (τόσο αλλαγής εικόνας όσο και κλεισίματος) όταν ο χρήστης έχει κάνει ζουμ!
            if (window.visualViewport && window.visualViewport.scale > 1.05) return;

            if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
                // Κλείσιμο του Lightbox αν ο χρήστης σύρει το δάχτυλο έντονα κάθετα (Standard Mobile UX)
                if (Math.abs(diffY) > swipeThreshold) this.close();
                return;
            }

            if (diffX < -swipeThreshold) this.navigate(1);
            if (diffX > swipeThreshold) this.navigate(-1);
        }

        navigate(direction) {
            this.currentIndex += direction;
            if (this.currentIndex < 0) this.currentIndex = this.galleryData.length - 1;
            if (this.currentIndex >= this.galleryData.length) this.currentIndex = 0;
            this.updateMedia();
        }

   close(isPopState = false) {
            if (!this.overlay) return;
            const overlayToRemove = this.overlay;
            
            // Αν το κλείσιμο έγινε με το "Χ" ή με Swipe, "καθαρίζουμε" χειροκίνητα το εικονικό ιστορικό
            if (!isPopState && window.history.state && window.history.state.lightbox) {
                window.history.back();
            }
            this.overlay = null; // Αποδεσμεύουμε τη μεταβλητή για να μην επηρεαστεί νεότερο άνοιγμα

            overlayToRemove.classList.remove('show');
            document.body.classList.remove("lb-active");
            document.removeEventListener('keydown', this.handleKeydown);
            
            setTimeout(() => {
                if (overlayToRemove && overlayToRemove.parentNode) overlayToRemove.remove();
            }, 300);
        }
    }

    // Instantiation του κεντρικού Lightbox
    const AppLightbox = new LightboxEngine();


    // ==========================================
    // 4. ARTICLE ENGINE (Αυτόνομο Module)
    // ==========================================
    class ArticleEngine {
        static scan() {
            document.querySelectorAll(CONFIG.SELECTORS.ARTICLE_CONTAINER).forEach(post => {
                // GUARD: Αν έχει ήδη κλάση 'processed' ή βρει ήδη το κουμπί, σταμάτα!
                if (post.classList.contains('article-processed') || post.querySelector('.custom-read-more')) return;
                
             const linkElem = post.querySelector(CONFIG.SELECTORS.POST_LINK);
                const postBody = post.querySelector(CONFIG.SELECTORS.POST_BODY); // Χρήση του δυναμικού επιλογέα!
                if (!linkElem || !postBody) return;

              const moreTriggers = post.querySelectorAll(CONFIG.SELECTORS.READ_MORE_TRIGGER);
                
              // Αν ΔΕΝ υπάρχει κόψιμο στο άρθρο, το μαρκάρουμε ως ολοκληρωμένο και φεύγουμε.
                if (moreTriggers.length === 0) {
                    post.classList.add('article-processed');
                    return;
                }
                
                // Απόκρυψη ΟΛΩΝ των αυθεντικών κουμπιών για να μην υπάρχουν διπλότυπα
                moreTriggers.forEach(trigger => trigger.style.display = 'none');

             // Κατάργηση της βίαιης μετακίνησης κόμβων γιατί εξαφανίζει τις διαφημίσεις! Μαρκάρουμε απευθείας το postBody.
                if (!postBody.classList.contains('summary-wrapper')) {
                    postBody.classList.add('summary-wrapper');
                }

            // Δημιουργία Κουμπιού
                const btn = document.createElement('div');
                btn.className = 'custom-read-more';
                btn.dataset.url = linkElem.href;
                btn.innerHTML = CONFIG.LABELS.READ_MORE;
                postBody.appendChild(btn);
                
                // Σημειώνουμε το post ότι επεξεργάστηκε
                post.classList.add('article-processed');
            });
        }

        static async handleInteraction(btn) {
            // GUARD: Αν ο χρήστης πατήσει γρήγορα πολλές φορές, σταματάμε τα διπλά κλικ!
            if (btn.classList.contains('is-loading')) return;

            const post = btn.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
            const wrapper = post.querySelector('.fetched-content-wrapper');
            const url = btn.dataset.url;

            // TOGGLE: Αν είναι ήδη ανοιχτό, κλείστο
            if (btn.dataset.loaded === "true" && wrapper) {
                if (wrapper.classList.contains('is-open')) {
                    ArticleEngine.close(post, btn);
                } else {
                    ArticleEngine.open(post, btn, wrapper, url);
                }
                return;
            }

            // FETCH: Αν δεν έχει φορτωθεί, φέρτο
            btn.classList.add('is-loading');
            btn.innerHTML = CONFIG.LABELS.LOADING;

         try {
                const resp = await fetch(url);
                // Αν η σελίδα έχει διαγραφεί ή σφάλμα, πετάμε Error για να πάει ο χρήστης στο fallback
                if (!resp.ok) throw new Error("HTTP Status: " + resp.status);
                const html = await resp.text();
               const doc = new DOMParser().parseFromString(html, 'text/html');
                // Πρέπει να χρησιμοποιείται ο δυναμικός επιλογέας από τα Settings
                const fetchedBody = doc.querySelector(CONFIG.SELECTORS.POST_BODY);
                
                // Προστασία: Αν δεν εντοπιστεί περιεχόμενο, πετάμε σφάλμα για να γίνει Fallback redirect 
                if (!fetchedBody) throw new Error("Δεν εντοπίστηκε περιεχόμενο.");

             ArticleEngine.processFetchedContent(fetchedBody, post.querySelector('.summary-wrapper'));

          // Επαναφορά Εικόνων ΚΑΙ Βίντεο (iframes) που έχουν παγιδευτεί από το Lazy Load του Blogger
                fetchedBody.querySelectorAll('img, iframe').forEach(el => {
                    const realSrc = el.getAttribute('data-src') || el.getAttribute('data-original-src');
                    if (realSrc && el.src !== realSrc) {
                        el.src = realSrc;
                        if (el.tagName.toLowerCase() === 'img') el.removeAttribute('srcset');
                    }
                });

            const div = document.createElement('div');
                div.className = 'fetched-content-wrapper';
                div.innerHTML = `<div class="fetched-content-inner"><div class="scrollable-article-area">${fetchedBody.innerHTML}</div></div>`;
                
                // Προστασία διάταξης: Εισάγουμε το νέο κείμενο ΠΑΝΩ από το widget ψηφοφορίας, ώστε το widget να καταλήγει πάντα στον πάτο!
                const fbWidget = btn.parentNode.querySelector('.smart-feedback-container');
                if (fbWidget) {
                    btn.parentNode.insertBefore(div, fbWidget);
                } else {
                    btn.parentNode.insertBefore(div, btn);
                }
                btn.dataset.loaded = "true";

                // Init Lightbox για το νέο περιεχόμενο
                div.querySelectorAll('.scrollable-article-area img').forEach(img => img.style.cursor = 'zoom-in');

                const originalWrite = document.write;
                document.write = function() { console.warn('Αποτράπηκε document.write από widget'); };

            const executeScriptsSequentially = async () => {
                    const scripts = Array.from(div.querySelectorAll('script'));
                    for (const oldScript of scripts) {
                        // ΔΙΟΡΘΩΣΗ: Αφαίρεση του ελέγχου `includes('document.write')`. 
                        // Το document.write έχει ΗΔΗ εξουδετερωθεί με ασφάλεια. Διαγράφοντας ολόκληρο 
                        // το script καταστρέφονται εκπαιδευτικά widgets που το περιέχουν έστω και σε σχόλια!
                        
                        await new Promise(resolve => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                            newScript.innerHTML = oldScript.innerHTML;
                            
                           let resolved = false;
                            const safeResolve = () => { if (!resolved) { resolved = true; resolve(); } };
                            
                            // Timeout ασφαλείας 4 δευτερολέπτων για να μην κολλήσει το άρθρο αιωνίως λόγω πεσμένων servers!
                            const fallbackTimeout = setTimeout(safeResolve, 4000);

                            if (newScript.hasAttribute('src')) {
                                newScript.onload = () => { clearTimeout(fallbackTimeout); safeResolve(); };
                                newScript.onerror = () => { clearTimeout(fallbackTimeout); safeResolve(); };
                            }
                            
                            if (oldScript.parentNode) oldScript.parentNode.replaceChild(newScript, oldScript);
                            
                            if (!newScript.hasAttribute('src')) { clearTimeout(fallbackTimeout); safeResolve(); }
                        });
                    }
              };
            await executeScriptsSequentially();
                
                // ΕΠΑΝΑΦΟΡΑ του document.write για να μην καταρρεύσουν τα widgets της πλαϊνής στήλης του blog!
                document.write = originalWrite;
                
           // Social Plugins & Embeds (Προσθήκη υποστήριξης για δυναμικά Tweets & Instagram)
                if (window.FB && window.FB.XFBML) window.FB.XFBML.parse(div);
                if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(div);
                if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();

                // Άνοιγμα με μικρή καθυστέρηση για το CSS transition
                requestAnimationFrame(() => ArticleEngine.open(post, btn, div, url));

  } catch(err) {
                console.error("Article Fetch Error:", err);
                btn.classList.remove('is-loading'); 
                
                btn.innerHTML = '<span class="icon">🔄</span> ΑΝΑΚΑΤΕΥΘΥΝΣΗ...';
                window.location.href = url;
                
                // Επαναφορά του αρχικού κειμένου λίγο μετά, ώστε αν ο χρήστης επιστρέψει 
                // με το πλήκτρο "Πίσω" (BFCache), το κουμπί να δείχνει ξανά σωστά!
                setTimeout(() => { btn.innerHTML = CONFIG.LABELS.READ_MORE; }, 1000);
            }
        }
static processFetchedContent(fetchedBody, summaryWrap) {
            // Το 'script' αφαιρέθηκε από τη διαγραφή ώστε να επιβιώσουν και να εκτελεστούν τα social media embeds
            fetchedBody.querySelectorAll('a[name="more"], [id^="more-"], .jump-link').forEach(n => n.remove());

       // Αλγόριθμος "Χειρουργικής Αφαίρεσης" TreeWalker
            const clone = summaryWrap.cloneNode(true);
            const rmBtn = clone.querySelector('.custom-read-more');
            if (rmBtn) rmBtn.remove(); // Αφαιρούμε το κουμπί από τον κλώνο για να γίνει σωστή ταύτιση κειμένου
      clone.querySelectorAll('script, style').forEach(el => el.remove());
          let summaryCleanText = clone.textContent.replace(/[\s\.\…]+$/, '').trim();
          let words = summaryCleanText.split(/\s+/);
            let textToMatch = words.join(' ');
            let cleanTextToMatch = Utils.cleanString(textToMatch);

         let walker = document.createTreeWalker(fetchedBody, NodeFilter.SHOW_TEXT, {
              acceptNode: function(node) {
                  if (node.parentNode && (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE')) {
                      return NodeFilter.FILTER_REJECT;
                  }
                  return NodeFilter.FILTER_ACCEPT;
              }
          }, false);
            let runningText = "";
            let nodesToRemove = [];
            let stopNow = false;

            while (walker.nextNode() && !stopNow) {
                let node = walker.currentNode;
                let nodeText = node.nodeValue;
                for (let i = 0; i < nodeText.length; i++) {
                    runningText += nodeText[i];
                    let currentCompare = Utils.cleanString(runningText);
                    
                if (cleanTextToMatch.startsWith(currentCompare)) {
                        continue;
                    } else {
                        // Αφαιρούμε το ελαττωματικό lastWord.length για να κοπεί το κείμενο στο σωστό σημείο
                        node.nodeValue = nodeText.substring(i);
                        stopNow = true;
                        break;
                    }
                }
                if (!stopNow) nodesToRemove.push(node);
            }
            
            nodesToRemove.forEach(n => { if (n.parentNode) n.nodeValue = ""; });

      // Προστασία Media (Αφαίρεση διπλότυπων)
            const summaryMedia = Array.from(summaryWrap.querySelectorAll('img, iframe'));
            fetchedBody.querySelectorAll('img, iframe').forEach(m => {
                const getFilename = (url) => { try { return new URL(url).pathname.split('/').pop().split('=')[0]; } catch(e) { return url; } };
                
                const duplicateIndex = summaryMedia.findIndex(sm => {
                    if (sm.tagName !== m.tagName) return false;
                    const smSrc = sm.getAttribute('data-src') || sm.src;
                    const mSrc = m.getAttribute('data-src') || m.src;
                    if (!mSrc || mSrc.includes('data:image') || mSrc.includes('blank.gif')) return false;
                    
                    // Για iframes (πχ Google Forms) απαιτείται απόλυτη ταύτιση όλου του URL
                    if (m.tagName.toLowerCase() === 'iframe') return smSrc === mSrc;
                    return getFilename(smSrc) === getFilename(mSrc);
                });
                
               if (duplicateIndex !== -1) {
                    summaryMedia.splice(duplicateIndex, 1);
                    
                    const parentA = m.closest('a');
                    // ΔΙΟΡΘΩΣΗ: Αν η εικόνα ήταν μόνη της μέσα σε έναν σύνδεσμο, διαγράφουμε ολόκληρο 
                    // τον σύνδεσμο για να μην δημιουργηθούν αόρατα "νεκρά" σημεία και κενά.
                    if (parentA && parentA.children.length === 1 && parentA.textContent.trim() === '') {
                        parentA.remove();
                    } else {
                        m.remove();
                    }
                }
            });
          
        }

      static open(post, btn, wrapper, url) {
            wrapper.classList.add('is-open'); 
            
        // Επαναφορά των βίντεο που είχαν διακοπεί στο κλείσιμο, ΜΟΝΟ εφόσον ο χρήστης ανοίξει ξανά το άρθρο
            wrapper.querySelectorAll('iframe').forEach(ifr => {
                if (ifr.dataset.tempSrc && !ifr.hasAttribute('src')) ifr.setAttribute('src', ifr.dataset.tempSrc);
            });
          btn.classList.remove('is-loading');
            btn.innerHTML = CONFIG.LABELS.CLOSE;
            post.classList.add('is-expanded');
           try {
                const safeUrl = new URL(url, window.location.origin);
                // ΔΙΟΡΘΩΣΗ: Προσθήκη history μόνο αν δεν βρισκόμαστε ΗΔΗ σε αυτό το URL (δηλαδή επιστροφή με το "Πίσω")
                if (window.location.pathname !== safeUrl.pathname) {
                    window.history.pushState({art:url}, '', safeUrl.pathname + safeUrl.search); 
                }
            } catch(e) {}
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

      static close(post, btn, isPopState = false) {
            const wrapper = post.querySelector('.fetched-content-wrapper');
            if (wrapper) {
          wrapper.classList.remove('is-open');
       // Στοχεύουμε ΑΥΣΤΗΡΑ μόνο γνωστές πλατφόρμες πολυμέσων (βίντεο/ήχου).
         // Απαγορεύεται η κλωνοποίηση σε εκπαιδευτικές φόρμες για να μην χάνονται οι απαντήσεις των μαθητών!
         wrapper.querySelectorAll('iframe').forEach(ifr => {
                    if (ifr.hasAttribute('src') && ifr.src.match(/youtube(?:-nocookie)?\.com|youtu\.be|vimeo\.com|dailymotion\.com|soundcloud\.com/i)) {
                        ifr.dataset.tempSrc = ifr.src;
                        // Η κλωνοποίηση σταματά τον ήχο ΑΚΑΡΙΑΙΑ, αποτρέποντας την εγγραφή "about:blank" στο History API!
                        const clone = ifr.cloneNode(true);
                        clone.removeAttribute('src');
                        ifr.parentNode.replaceChild(clone, ifr);
                    }
                });
                
                // ΣΤΑΜΑΤΑΜΕ υποχρεωτικά και τα απευθείας ανεβασμένα αρχεία ήχου/βίντεο (HTML5 Media)
                if (wrapper) {
                    wrapper.querySelectorAll('audio, video').forEach(media => media.pause());
                }
            }
            if (btn) btn.innerHTML = CONFIG.LABELS.READ_MORE;
            if (post) post.classList.remove('is-expanded');

           // Αλλάζουμε URL μόνο αν το έκλεισε ο χρήστης χειροκίνητα με κλικ
            if (!isPopState && window.location.pathname !== "/") {
                // ΔΙΟΡΘΩΣΗ: Χρήση replaceState αντί για pushState, ώστε να μην προστίθεται περιττή εγγραφή.
                window.history.replaceState(null, '', CONFIG.BASE_URL);
            }
        }

       static closeAllOpened(e) {
            const isPopState = e && e.type === 'popstate';
            document.querySelectorAll('.fetched-content-wrapper.is-open').forEach(wrapper => {
                const post = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                const btn = post.querySelector('.custom-read-more');
                
             // Προστασία: Αν πατήθηκε το "Πίσω" και το άρθρο ταυτίζεται με το τρέχον ενεργό URL, ΜΗΝ το κλείσεις!
                // Αφαιρούμε τα # (hashes) για να μην κλείνει το άρθρο κατά την πλοήγηση σε εσωτερικούς συνδέσμους/υποσημειώσεις!
                if (isPopState && btn && btn.dataset.url.split('#')[0] === window.location.href.split('#')[0]) return;
                
                ArticleEngine.close(post, btn, isPopState);
            });
        }
    }

    // ==========================================
    // 5. FEEDBACK ENGINE (Αυτόνομο Module)
    // ==========================================
    class FeedbackEngine {
        static scan() {
            // Αρχικοποίηση Observer για το Lazy Loading
            if (!this.observer) {
                this.observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const div = entry.target;
                            const safePostId = div.dataset.postid;
                            
        
                            obs.unobserve(div); 
                            
                           // Βοηθητική συνάρτηση για την ενημέρωση του UI
                            const updateUI = (snapshot) => {
                                let d = { love: 0, funny: 0, wow: 0 };
                                // Ελέγχουμε αν υπάρχει έγκυρη απάντηση από τη βάση, αλλιώς κρατάμε τα μηδενικά
                                if (snapshot && typeof snapshot.val === 'function') {
                                    d = snapshot.val() || d;
                                }
                                const sLove = div.querySelector('.count-love'); if (sLove && sLove.innerText === '-') sLove.innerText = d.love || 0;
                                const sFunny = div.querySelector('.count-funny'); if (sFunny && sFunny.innerText === '-') sFunny.innerText = d.funny || 0;
                                const sWow = div.querySelector('.count-wow'); if (sWow && sWow.innerText === '-') sWow.innerText = d.wow || 0;
                            };

                            // Έξυπνος μηχανισμός Retry (Προσπαθεί για 8 δευτερόλεπτα)
                            const fetchReactions = async (attempts = 0) => {
                                try {
                                    // Promise.race: Αν η Firebase "κολλήσει" και δεν απαντήσει σε 2 δευτερόλεπτα, πετάει Timeout!
                                    const snapshot = await Promise.race([
                                        get(ref(db, 'reactions/' + safePostId)),
                                        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
                                    ]);
                                    updateUI(snapshot);
                                } catch (err) {
                                    if (attempts < 3) {
                                        // Αν απέτυχε, ξαναπροσπαθεί αμέσως. (Σύνολο 4 προσπάθειες x 2 δευτ. = 8 δευτερόλεπτα)
                                        fetchReactions(attempts + 1);
                                    } else {
                                        console.warn(`Κόλλησε η επικοινωνία στο άρθρο ${safePostId}. Επαναφορά Firebase (Hard Reset)...`);
                                        
                                        // 1. Κλείνει βίαια τη σύνδεση του browser με τη Firebase
                                        goOffline(db);
                                        
                                        setTimeout(() => {
                                            // 2. Επαναφέρει τη σύνδεση αναγκάζοντας τη Firebase να συνδεθεί από το μηδέν
                                            goOnline(db);
                                            
                                            // 3. Τελευταία απεγνωσμένη προσπάθεια μετά την επανασύνδεση
                                            Promise.race([
                                                get(ref(db, 'reactions/' + safePostId)),
                                                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
                                            ]).then(updateUI).catch(() => updateUI(null)); 
                                            // Αν αποτύχει οριστικά (π.χ. κομμένο ίντερνετ), το null θα βάλει "0" για να μην μείνουν οι άσχημες παύλες.
                                        }, 1000); // Δίνουμε 1 δευτερόλεπτο στη Firebase να κλείσει και να ανοίξει σωστά
                                    }
                                }
                            };

                            fetchReactions(); // Εκκίνηση του μηχανισμού
                        }
                    });
                }, { rootMargin: '200px' }); // Φορτώνει λίγο πριν μπει στην οθόνη
            }

            document.querySelectorAll(CONFIG.SELECTORS.ARTICLE_CONTAINER).forEach(container => {
                if (container.querySelector('.smart-feedback-container')) return;

                const postId = Utils.getPostPath(container);
                if (!postId || postId === '/' || postId.length < 3) return;

             const safePostId = decodeURIComponent(postId).replace(/[\.\#\$\[\]\/]/g, '_');
                const target = container.querySelector(CONFIG.SELECTORS.POST_BODY);
                
                // ΠΡΟΣΤΑΣΙΑ: Αποτροπή έγχυσης Emojis σε μικρά Widgets της πλαϊνής στήλης!
                if (!target) return;
                
                let hasVoted = false;
                try { hasVoted = localStorage.getItem('feedback_' + safePostId); } catch(e) {}
                const div = document.createElement('div');
                div.className = `smart-feedback-container ${hasVoted ? 'voted' : ''}`;
                
                // Προσθήκη κενού προς τα κάτω για ωραία στοίχιση πάνω από το "Διαβάστε Περισσότερα"
                div.style.marginBottom = "15px"; 
                div.dataset.postid = safePostId;

                const btnStyle = hasVoted ? "opacity: 0.8; pointer-events: none;" : "";
                
                // Δημιουργούμε το div με παύλες αρχικά, μέχρι να τα φέρει το Lazy Load
                div.innerHTML = `
             <div class="smart-feedback-buttons" style="${btnStyle}" data-postid="${safePostId}">
                        <!-- Προσθήκη type="button" για αποτροπή ακούσιας ανανέωσης σελίδας (form submit) -->
                        <button type="button" class="smart-feedback-btn" data-type="love"><span>❤️</span><span class="count-love">-</span></button>
                        <button type="button" class="smart-feedback-btn" data-type="funny"><span>😂</span><span class="count-funny">-</span></button>
                        <button type="button" class="smart-feedback-btn" data-type="wow"><span>😮</span><span class="count-wow">-</span></button>
                    </div>`;
                
              const readMoreBtn = target.querySelector('.custom-read-more');
                if (readMoreBtn) {
                    target.insertBefore(div, readMoreBtn);
                } else {
                    target.appendChild(div);
                }
                
                // Ξεκινάμε την παρακολούθηση (Lazy Load)
                this.observer.observe(div);
            });
        }

       static handleReaction(btn) {
            const mainContainer = btn.closest('.smart-feedback-container');
            if (mainContainer.classList.contains('voted')) return; // Απόλυτη JS προστασία ενάντια σε πολλαπλές ψήφους με το Enter

            // --- ΠΡΟΣΘΗΚΗ ΑΜΕΣΗΣ ΔΟΝΗΣΗΣ ΓΙΑ ΤΙΣ ΑΝΤΙΔΡΑΣΕΙΣ ---
            if (navigator.vibrate) navigator.vibrate(15);
            
            const btnContainer = btn.closest('.smart-feedback-buttons');
        
            const safePostId = btnContainer.dataset.postid;
            const type = btn.dataset.type;
            const spanCount = btn.querySelector('span:last-child');
            const emojiSymbol = btn.querySelector('span:first-child').innerText;
            
         // --- ΕΦΕ PARTICLES (Emojis που πετάγονται!) ---
            for (let i = 0; i < 4; i++) {
                const particle = document.createElement('div');
                particle.innerText = emojiSymbol;
                // Χρήση 'fixed' για να μην αλλάξει ποτέ το πλάτος της σελίδας και να μην τιναχτεί η οθόνη του κινητού
                particle.style.position = 'fixed';
                particle.style.left = `${btn.getBoundingClientRect().left + 15}px`;
                particle.style.top = `${btn.getBoundingClientRect().top}px`;
                particle.style.fontSize = '24px';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';
                particle.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
               document.body.appendChild(particle);

                // Χρήση μικρής καθυστέρησης (αντί για rAF) για να αναγκαστεί ο browser να εκτελέσει το CSS animation!
                setTimeout(() => {
                    particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -${Math.random() * 50 + 40}px) scale(1.5)`;
                    particle.style.opacity = '0';
                }, 20);
                setTimeout(() => particle.remove(), 800);
            }
            // ----------------------------------------------

     spanCount.innerText = "..";
            btnContainer.style.pointerEvents = 'none'; 
            
         // ΑΜΕΣΟ (Σύγχρονο) κλείδωμα πριν φύγει το αίτημα δικτύου, για 100% προστασία από spamming
mainContainer.classList.add('voted');
mainContainer.dataset.justVoted = "true";

            const reactionRef = ref(db, 'reactions/' + safePostId + '/' + type);
            const totalRef = ref(db, 'stats/total_reactions');
       // Εκτελούμε τον καθολικό μετρητή και ΕΚΠΕΜΠΟΥΜΕ σήμα για τον συγχρονισμό εξωτερικών Widgets (π.χ. Slider)
            runTransaction(totalRef, (currentTotal) => { return (currentTotal || 0) + 1; })
            .then(res => {
                if (res.committed) window.dispatchEvent(new CustomEvent('totalReactionSync', { detail: { newTotal: res.snapshot.val() } }));
            }).catch(() => {});

          // Περιμένουμε ΑΥΣΤΗΡΑ μόνο την ψήφο του άρθρου για την ενημέρωση του UI
            runTransaction(reactionRef, (currentCount) => { return (currentCount || 0) + 1; })
            .then((result) => {
                // Προστασία API: Ακύρωση του συγχρονισμού UI αν η Firebase απέρριψε την εγγραφή (αποτροπή ψευδούς reactionSync)
                if (!result.committed) throw new Error("Transaction not committed by Firebase");
                // Το νέο νούμερο που μόλις καταγράφηκε στη βάση
                const newCount = result.snapshot.val();
                spanCount.innerText = newCount;
                
              try { localStorage.setItem('feedback_' + safePostId, 'voted'); } catch(e) {}
                mainContainer.classList.add('voted');
                btnContainer.style.opacity = "0.8";

                // ΕΚΠΟΜΠΗ ΣΗΜΑΤΟΣ (Στέλνουμε το νέο αριθμό ώστε να τον ακούσει το Slider)
                window.dispatchEvent(new CustomEvent('reactionSync', {
                    detail: { safePostId, type, newCount }
                }));
            })
       .catch((error) => {
                console.error("Σφάλμα Firebase:", error);
                btnContainer.style.pointerEvents = 'auto'; 
                mainContainer.classList.remove('voted'); // Ξεκλείδωμα για να επιτραπεί η δοκιμή ξανά σε σφάλμα
                if (mainContainer.dataset) delete mainContainer.dataset.justVoted; // Απεγκλωβισμός του state για να συνεχίσει το Lazy Load!
                spanCount.innerText = "!";
            });
        }
    }

    const AppController = {
        init: () => {
            // Αρχική Σάρωση
         ArticleEngine.scan();  // 1ο: Απομονώνει πρώτα την καθαρή περίληψη
            FeedbackEngine.scan();

            // Setup Global Events & Observers
            AppController.setupGlobalDelegation();
            document.addEventListener('newPostsLoaded', () => {
                FeedbackEngine.scan(); 
                ArticleEngine.scan();  
            });
            
     // Popstate για back button του Browser
            window.addEventListener('popstate', (e) => {
              if (document.body.classList.contains('lb-active')) {
                    AppLightbox.close(true); 
                    return; 
                }
                ArticleEngine.closeAllOpened(e);
                
                // ΔΙΟΡΘΩΣΗ: Άνοιγμα ξανά του άρθρου αν ο χρήστης πατήσει το πλήκτρο "Πίσω"
                if (e.state && e.state.art) {
                    const btn = document.querySelector(`.custom-read-more[data-url="${e.state.art}"]`);
                    if (btn) {
                        const wrapper = btn.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER).querySelector('.fetched-content-wrapper');
                        if (!wrapper || !wrapper.classList.contains('is-open')) ArticleEngine.handleInteraction(btn);
                    }
                }
            });
            window.addEventListener('reactionSync', (e) => {
                const { safePostId, type, newCount } = e.detail;
                
                // ΣΥΓΧΡΟΝΙΣΜΟΣ ΤΟΠΙΚΗΣ ΜΝΗΜΗΣ: Αποθηκεύουμε την ψήφο ώστε το Feed να τη θυμάται μετά από Refresh/Navigation
                try { localStorage.setItem('feedback_' + safePostId, 'voted'); } catch(err) {}
                
                // Ψάχνουμε τα Emojis στα κλασικά άρθρα (Feed) και τα συγχρονίζουμε
                document.querySelectorAll('.smart-feedback-buttons').forEach(btnContainer => {
                    if (btnContainer.dataset.postid === safePostId) {
                     const mainContainer = btnContainer.closest('.smart-feedback-container');
                        if (mainContainer) {
                            mainContainer.classList.add('voted');
                            mainContainer.dataset.justVoted = "true"; // Αποτροπή διαγραφής της νέας ψήφου από το Lazy Load
                        }
                        btnContainer.style.pointerEvents = 'none';
                        btnContainer.style.opacity = '0.8';
                        
                        const countSpan = btnContainer.querySelector(`.smart-feedback-btn[data-type="${type}"] span:last-child`);
                        // Αλλάζουμε νούμερο μόνο αν δεν ψηφίζει ο χρήστης εκείνη τη στιγμή
                        if (countSpan && countSpan.innerText !== '..') {
                            countSpan.textContent = newCount;
                        }
                    }
                });
            });
            // ------------------------------------------------
        },

        setupGlobalDelegation: () => {
            // ΕΝΑ ΚΑΙ ΜΟΝΑΔΙΚΟ click listener στο document!
            document.addEventListener('click', (e) => {
                
            // 1. Click σε Smart Feedback Button
                const feedbackBtn = e.target.closest('.smart-feedback-btn');
                if (feedbackBtn) {
                    // ΠΡΟΣΤΑΣΙΑ: Εκτέλεση μόνο αν το κλικ ανήκει στο Feed, αποτρέποντας crash αν το Slider χρησιμοποιεί την ίδια κλάση.
                    if (!feedbackBtn.closest('.smart-feedback-container')) return;
                    e.preventDefault(); e.stopPropagation();
                    FeedbackEngine.handleReaction(feedbackBtn);
                    return;
                }

              // 2. Click σε Read More Button
                const readMoreBtn = e.target.closest('.custom-read-more');
                if (readMoreBtn) {
                    e.preventDefault(); e.stopPropagation();
                    
                   // Κλείσιμο των υπόλοιπων ανοιχτών άρθρων για εξοικονόμηση μνήμης (RAM) στο κινητό!
                    document.querySelectorAll('.fetched-content-wrapper.is-open').forEach(wrapper => {
                        const post = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                        if (post && !post.contains(readMoreBtn)) { 
                            // ΔΙΟΡΘΩΣΗ: Πέρασμα του true (ως isPopState) για αθόρυβο κλείσιμο χωρίς μόλυνση ιστορικού
                            ArticleEngine.close(post, post.querySelector('.custom-read-more'), true);
                        }
                    });
                    
                    ArticleEngine.handleInteraction(readMoreBtn);
                    return;
                }

               // 3. Click σε εικόνα/βίντεο (Lightbox)
                const lightboxImg = e.target.closest('.fetched-content-wrapper img, .post-body img, .entry-content img');
               if (lightboxImg) {
                  const parentLink = lightboxImg.closest('a');
                    const isBloggerImage = parentLink && parentLink.href && (parentLink.href.match(/\.(jpe?g|png|gif|webp)(\?.*)?$/i) || parentLink.href.includes('googleusercontent.com/img/') || parentLink.href.includes('bp.blogspot.com/'));
                    
                    if (parentLink && parentLink.href) {
                        // Αν είναι εξωτερικό link Ή αν περιέχει εσωτερικό anchor link (εξαιρείται το απλό '#')
                        const isAnchor = parentLink.href.includes('#') && parentLink.getAttribute('href') !== '#';
                        if (!isBloggerImage || isAnchor) return; 
                    }

                    e.preventDefault(); e.stopPropagation();
                    AppLightbox.open(lightboxImg); 
                    return;
                }
                
                // 4. Click μέσα στο Lightbox Navigation
                const lbNext = e.target.closest('.my-custom-lightbox-next');
                const lbPrev = e.target.closest('.my-custom-lightbox-prev');
                const lbClose = e.target.closest('.my-custom-lightbox-close');
                const lbThumb = e.target.closest('.thumb-wrapper');
                
                if (document.body.classList.contains('lb-active')) {
                    if (lbNext) { e.stopPropagation(); AppLightbox.navigate(1); }
                    else if (lbPrev) { e.stopPropagation(); AppLightbox.navigate(-1); }
                    else if (lbClose) { AppLightbox.close(); }
                    else if (lbThumb) { 
                        e.stopPropagation(); 
                        AppLightbox.currentIndex = parseInt(lbThumb.dataset.index, 10); 
                        AppLightbox.updateMedia(); 
                    }
                    // Click στο background κλείνει το lightbox
                    else if (e.target.classList.contains('my-custom-lightbox') || e.target.classList.contains('my-custom-lightbox-img-container')) {
                        AppLightbox.close();
                    }
                    return;
                }

              // 5. Smart Close Άρθρου (Click εκτός ανοιχτού άρθρου)
                const openWrappers = document.querySelectorAll('.fetched-content-wrapper.is-open');
                if (openWrappers.length > 0) {
                    // Ελέγχουμε αν το κλικ έγινε ΜΕΣΑ σε ΟΠΟΙΟΔΗΠΟΤΕ από τα ανοιχτά άρθρα
                    const clickedInsideAny = Array.from(openWrappers).some(wrapper => {
                        const currentPost = wrapper.closest(CONFIG.SELECTORS.ARTICLE_CONTAINER);
                        return currentPost && currentPost.contains(e.target);
                    });
                // Διατήρηση State: Αποτροπή κλεισίματος αν το κλικ γίνει σε πλαϊνή στήλη, Widget ή Slider!
                    const isOutsideWidget = e.target.closest('aside, .sidebar, .widget, .slider');
                    if (!clickedInsideAny && !isOutsideWidget) {
                        ArticleEngine.closeAllOpened();
                    }
                }
            });
        }
    };

    // Boot App
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
    }

})();
  

;(() => {
  'use strict';
  //vivliothikikid
const initPieriaWidget = () => {
  if (window.pieriaMiniLibLoaded) return;
  window.pieriaMiniLibLoaded = true;

  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/vivliothiki.json";
  const MOTHER_PAGE = "https://dimperist.blogspot.com/p/blog-page_22.html";
  const errorImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTRhM2I4IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7Oks65zrLOu86vzr88L3RleHQ+PC9zdmc+";
  
  const cacheVersion = Math.floor(new Date().getTime() / 7200000);
  
  fetch(JSON_URL + "?v=" + cacheVersion)
    .then(res => res.json())
   .then(allBooks => {
      const shuffledBooks = [...allBooks].sort(() => 0.5 - Math.random());
      const widgets = document.querySelectorAll('.pieria-mini-lib-widget');
      widgets.forEach(widget => initMiniWidget(widget, shuffledBooks));
    })
   .catch(err => {
      console.error("Σφάλμα Mini Widget:", err);
      // Κλείνει τα spinner και δείχνει μήνυμα λάθους στα widgets
      document.querySelectorAll('.mini-lib-scroll-area').forEach(area => {
        area.innerHTML = '<div class="mini-lib-empty">⚠️ Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας.</div>';
      });
    });

const createSlug = (text) => String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}0-9]+/gu, '-').replace(/(^-|-$)+/g, '');

 function initMiniWidget(widget, allBooks) {
    const searchInput = widget.querySelector('.mini-lib-search');
    const grid = widget.querySelector('.mini-lib-grid');
    const scrollArea = widget.querySelector('.mini-lib-scroll-area');
    const loader = widget.querySelector('.mini-lib-loader');
    
    // Αδειάζει το πεδίο αναζήτησης σε περίπτωση που ο browser έχει 
    // κρατήσει προσωρινή μνήμη (επιστροφή με το πλήκτρο "Back")
    if (searchInput) searchInput.value = '';
    
  let filteredBooks = [...allBooks];
    const initialShuffled = [...filteredBooks]; // Κρατάει την αρχική τυχαία σειρά
    let currentIndex = 0;
    const BATCH_SIZE = 12; 
    let isRendering = false;
    let renderTimeout; // ΠΡΟΣΘΗΚΗ: Θα ελέγχει τη φόρτωση
    
 function createCard(book) {
      const safeBook = book || {}; // ΠΡΟΣΘΗΚΗ: Ασφάλεια σε περίπτωση που το ίδιο το αντικείμενο έρθει null
      const a = document.createElement('a');
      const safeTitle = safeBook.title || "Χωρίς Τίτλο"; 
      const safeImg = safeBook.image_url || errorImg;    
      
      a.href = `${MOTHER_PAGE}?book=${createSlug(safeTitle)}`;
      a.className = "mini-book-card";
      a.title = safeTitle;
      
      // Αφήνουμε κενά τα δεδομένα στο innerHTML
      a.innerHTML = `
        <div class="mini-cover-wrap">
           <!-- ΠΡΟΣΘΗΚΗ: Το this.onerror=null αποτρέπει το Infinite Loop -->
           <img class="mini-cover" loading="lazy" onerror="this.onerror=null; this.src='${errorImg}'">
        </div>
        <h4 class="mini-book-title"></h4>
      `;
      
      // ΠΡΟΣΘΗΚΗ: Ασφαλής εισαγωγή! Κανένα σύμβολο (<, >, ") δεν μπορεί πλέον να χαλάσει το widget
      a.querySelector('.mini-cover').src = safeImg;
      a.querySelector('.mini-book-title').textContent = safeTitle;
      
      return a;
    }

    function loadBatch() {
      if (isRendering || currentIndex >= filteredBooks.length) return;
      
      isRendering = true;
      loader.style.display = 'flex'; 
      // Αφαιρέθηκε το loader.innerHTML="..." γιατί το spinner υπάρχει ήδη στο HTML!

      renderTimeout = setTimeout(() => {
        const batch = filteredBooks.slice(currentIndex, currentIndex + BATCH_SIZE);
        batch.forEach(book => grid.appendChild(createCard(book)));
        currentIndex += BATCH_SIZE;
        isRendering = false;
        
        // Κρύβουμε τον loader μόνο όταν τελειώσουν ΟΛΑ τα βιβλία
     // Κρύβουμε τον loader μόνο όταν τελειώσουν ΟΛΑ τα βιβλία
        if (currentIndex >= filteredBooks.length) {
          loader.style.display = 'none';
        } else {
          // FIX: Force the observer to re-evaluate. If the new items didn't fill 
          // the screen and the loader is still visible, this will trigger the next batch automatically.
          observer.unobserve(loader);
          observer.observe(loader);
        }
      }, 50); 
    }

 let debounceTimer;
    // ΠΡΟΣΘΗΚΗ: Ασφαλής έλεγχος (Ενεργοποιούμε την αναζήτηση ΜΟΝΟ αν υπάρχει η μπάρα)
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        // ΑΚΥΡΩΣΗ ΑΚΑΡΙΑΙΑ με το που πατιέται το πλήκτρο! (πριν το setTimeout)
      clearTimeout(renderTimeout); 
      isRendering = true; // FIX: Lock the rendering state to block the observer while typing
      loader.style.display = 'flex';

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
       const query = searchInput.value.toLowerCase().trim();
        // ΠΡΟΣΘΗΚΗ: Μετατροπή του τελικού "ς" σε "σ" για άψογη ταύτιση της αναζήτησης
        const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ς/g, "σ");
        const normalizedQuery = normalize(query);
        
   if (query === '') {
            filteredBooks = [...initialShuffled]; // Επαναφέρει την αρχική σειρά
        } else {
            filteredBooks = allBooks.filter(b => {
              // ΠΡΟΣΘΗΚΗ: Χρήση του String() και έλεγχος != null για ασφαλή αναζήτηση αριθμών
              const safeTitle = (b && b.title != null) ? String(b.title).toLowerCase() : ""; 
              return normalize(safeTitle).includes(normalizedQuery);
            });
        }
        grid.innerHTML = '';
        currentIndex = 0;
        // --- ΠΡΟΣΘΗΚΗ: Επαναφορά του Scroll στην αρχή! ---
        scrollArea.scrollTop = 0;  // Για το κάθετο scroll (PC)
        scrollArea.scrollLeft = 0; // Για το οριζόντιο scroll (Κινητό)
       
      isRendering = false; // FIX: Unlock rendering now that the new results are ready

      if (filteredBooks.length === 0) {
             grid.innerHTML = '<div class="mini-lib-empty">😕 Δεν βρέθηκε βιβλίο...</div>';
             loader.style.display = 'none';
          } else {
             loadBatch();
          }
        }, 250);
      });
    } // <--- ΠΡΟΣΘΗΚΗ: Η αγκύλη που κλείνει την προστασία if (searchInput)

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isRendering) loadBatch();
    }, { 
      root: scrollArea, 
      rootMargin: "150px" 
    });
    
    observer.observe(loader);

    // 🔥 Η ΜΑΓΙΚΗ ΓΡΑΜΜΗ ΠΟΥ ΕΛΕΙΠΕ! 🔥
    // Φορτώνουμε ρητά τα πρώτα 12 βιβλία με το που ανοίγει η σελίδα, 
    // για να γεμίσει το κουτί και να δημιουργηθεί το scroll!
    loadBatch();
 }
};

// Ελέγχει αν η σελίδα έχει ήδη φορτώσει για να τρέξει αμέσως,
// αλλιώς περιμένει κανονικά το γεγονός DOMContentLoaded.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPieriaWidget);
} else {
  initPieriaWidget();
}
})();


;(() => {
   "use strict";

    // vivliothk
    const triggerFullscreen = (iframeId) => {
        const fIframe = document.getElementById(iframeId);
        if (!fIframe) return;

     const fallbackOpen = () => { 
           if (fIframe.src) {
               const newWin = window.open(fIframe.src, '_blank');
               // Αν ο browser μπλοκάρει το νέο παράθυρο λόγω Popup Blocker, κάνουμε ανακατεύθυνση στην ίδια καρτέλα
               if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                   window.location.href = fIframe.src;
               }
           } 
       };

        if (fIframe.requestFullscreen) {
            const p = fIframe.requestFullscreen();
            // Αν το API υπάρχει αλλά το browser το μπλοκάρει (π.χ. iPhone iframe ή λείπει το allow="fullscreen"), πιάνουμε την αποτυχία!
            if (p && p.catch) p.catch(fallbackOpen);
        } else if (fIframe.webkitRequestFullscreen) { // Safari / Chrome
            const p = fIframe.webkitRequestFullscreen();
            if (p && p.catch) p.catch(fallbackOpen);
        } else if (fIframe.mozRequestFullScreen) { // Firefox
            fIframe.mozRequestFullScreen();
        } else if (fIframe.msRequestFullscreen) { // IE11
            fIframe.msRequestFullscreen();
        } else {
            // FALLBACK αν δεν υποστηρίζεται καθόλου το API (Παλιά iPhones)
            fallbackOpen();
        }
    };

    // Κρατάμε και τα δύο ονόματα (PC & Mobile) για να λειτουργούν αυτόματα τα κουμπιά στο HTML σου!
    window.openLibraryFullscreen = () => triggerFullscreen("flipbook-iframe");
    window.openLibraryFullscreenMobile = () => triggerFullscreen("flipbook-iframe-mobile");

   // 2. Μηχανισμός YouTube & Κουμπιού Εγγραφής (Κοινός για PC & Mobile)
    const initApp = () => {
        // Λίστα με τα IDs για το PC και το Κινητό αντίστοιχα
        const platforms = [
            { boxId: "video-widget-box", ytId: "yt-player" },
            { boxId: "video-widget-box-mobile", ytId: "yt-player-mobile" }
        ];

       // ΔΙΟΡΘΩΣΗ Α: Ενεργοποιούμε το κλικ στα κουμπιά ΑΜΕΣΩΣ! Έτσι δουλεύουν ακόμα και αν το Adblocker μπλοκάρει το YT API.
        platforms.forEach(p => {
            const box = document.getElementById(p.boxId);
            if (!box) return;
            const subBtn = box.querySelector('.video-sub-action');
            if (subBtn && !subBtn.dataset.listenerAdded) {
                subBtn.addEventListener('click', () => subBtn.classList.add('is-hidden'));
                subBtn.dataset.listenerAdded = "true";
            }
        });

        const setupPlayers = () => {
            // Η έξυπνη λούπα: Ελέγχει και το PC και το κινητό!
            platforms.forEach(p => {
                const box = document.getElementById(p.boxId);
                const ytPlayerEl = document.getElementById(p.ytId);
                
                if (!box || !ytPlayerEl) return; // Αν δεν το βρει στη σελίδα, πάει στο επόμενο
                
                const subBtn = box.querySelector('.video-sub-action');

              const initPlayer = () => {
                    new YT.Player(p.ytId, {
                        events: {
                            'onStateChange': (e) => {
                                if (e.data === 1 && subBtn) subBtn.classList.add('is-hidden');
                            }
                        }
                    });
                };

                // ΔΙΟΡΘΩΣΗ Β: Προσθήκη enablejsapi=1 αν λείπει
                if (ytPlayerEl.tagName.toLowerCase() === 'iframe') {
                    const currentSrc = ytPlayerEl.getAttribute('src') || '';
                    if (currentSrc && !currentSrc.includes('enablejsapi=1')) {
                        // ΠΕΡΙΜΕΝΟΥΜΕ να ολοκληρωθεί η φόρτωση ΠΡΙΝ αρχικοποιηθεί το Player
                        ytPlayerEl.addEventListener('load', initPlayer, { once: true });
                        ytPlayerEl.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'enablejsapi=1';
                        return; // Σταματάμε την τρέχουσα εκτέλεση της λούπας
                    }
                }

                // Αν το API υπήρχε ήδη στο URL, αρχικοποιούμε άμεσα
                initPlayer();
            });
        };

        // Ασφαλής Φόρτωση YouTube API
        if (window.YT && window.YT.Player) {
            setupPlayers();
        } else {
            window.ytReadyCallbacks = window.ytReadyCallbacks || [];
            window.ytReadyCallbacks.push(setupPlayers); 

            if (!window.ytApiLoading) {
                window.ytApiLoading = true;
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                
                const existingOnReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (typeof existingOnReady === 'function') {
                        existingOnReady(); 
                    }
                    window.ytReadyCallbacks.forEach(cb => cb());
                    window.ytReadyCallbacks = []; 
                };
            }
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
})();


;(() => {
    "use strict";
  // xronokapsoyla
    const CONFIG = Object.freeze({
        labels: ["Δράσεις 14-25"], 
        fallbackImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
    });

    const DOM = {};

   const Utils = {
      cleanText: (htmlStr) => {
            if (!htmlStr) return "";
       // 1. Προσθήκη κενών πριν από block-level στοιχεία για αποφυγή συγχώνευσης λέξεων
            // Προστέθηκαν tags λιστών (ul, ol) και πινάκων (table, tr, td, th)
            const spacedStr = htmlStr.replace(/<\/?(p|div|br|h[1-6]|li|blockquote|table|tr|th|td|ul|ol)[^>]*>/gi, ' ');
            const doc = new DOMParser().parseFromString(spacedStr, 'text/html');
            
            // 2. Αφαίρεση tags κώδικα (scripts/styles) για να μην εμφανίζονται μέσα στην περίληψη
            doc.querySelectorAll('script, style').forEach(el => el.remove());
            
            return (doc.body.textContent || doc.body.innerText || "").replace(/\s+/g, ' ').trim();
        }
    };

   const MobileDataEngine = {
      isFetching: false,
      validLabels: null, // ΝΕΟ: Αποθηκεύει τις ετικέτες δυναμικά 
       fetchPosts: async (retryCount = 0) => {
            // ΝΕΟ: Επιτρέπουμε να τρέξει ξανά (bypass) μόνο αν κάνει αυτόματη επανακλήρωση (retry)
            if (MobileDataEngine.isFetching && retryCount === 0) return;
            MobileDataEngine.isFetching = true;

            try {
                // --- ΝΕΟ: 1. Δυναμική εύρεση ετικετών (εκτελείται αόρατα μόνο την 1η φορά) ---
                if (!MobileDataEngine.validLabels) {
                    const catRes = await fetch('/feeds/posts/summary?alt=json&max-results=0');
                    const catData = await catRes.json();
                    const allCategories = catData.feed.category || [];
                    
                    MobileDataEngine.validLabels = allCategories
                        .map(c => c.term)
                        .filter(term => {
                            // Αφαιρούμε τόνους και μετατρέπουμε σε πεζά (π.χ. Δράσεις 2026 -> δρασεις 2026)
                            const cleanTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                            // Το "δρασει" πιάνει "δράσεις", "δρασεις", κτλ. αγνοώντας το τελικό σίγμα (ς)
                            return cleanTerm.includes("δρασει");
                        });

                    // Αν δεν βρει τίποτα, κρατάει την αρχική ετικέτα του CONFIG ως ασφάλεια
                    if (MobileDataEngine.validLabels.length === 0) {
                        MobileDataEngine.validLabels = CONFIG.labels;
                    }
                }

                // Επιλογή τυχαίας ετικέτας από αυτές που βρήκε δυναμικά
                const randomLabel = MobileDataEngine.validLabels[Math.floor(Math.random() * MobileDataEngine.validLabels.length)];
                const encodedLabel = encodeURIComponent(randomLabel);
                // ----------------------------------------------------------------------------

                // 1. Παίρνουμε το συνολικό αριθμό άρθρων
                const metaUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`;
                const metaRes = await fetch(metaUrl);
                const metaData = await metaRes.json();

                const totalPosts = parseInt(metaData.feed.openSearch$totalResults.$t, 10);
                if (totalPosts === 0) throw new Error("Δεν βρέθηκαν αναρτήσεις.");

                // Πλέον ΔΕΝ βάζουμε όριο στο maxAllowedIndex. Παίρνουμε ΟΛΟ το εύρος.
            // Πλέον ΔΕΝ βάζουμε όριο στο maxAllowedIndex. Παίρνουμε ΟΛΟ το εύρος.
                let randomIndex = Math.floor(Math.random() * totalPosts) + 1;
                
                // Αποτροπή εμφάνισης του ίδιου άρθρου δύο φορές συνεχόμενα (αν υπάρχουν πάνω από 1 άρθρα)
                if (totalPosts > 1 && randomIndex === MobileDataEngine.lastIndex) {
                    randomIndex = (randomIndex % totalPosts) + 1;
                }
                MobileDataEngine.lastIndex = randomIndex;
                
                let currentIndex = randomIndex;
                let publishedMax = "";

                // 2. Το "Κόλπο": Όσο ο στόχος μας είναι πάνω από 500, κάνουμε άλματα.
                while (currentIndex > 500) {
                    let skipUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=500`;
                    if (publishedMax) skipUrl += `&published-max=${encodeURIComponent(publishedMax)}`;

                    const skipRes = await fetch(skipUrl);
                    const skipData = await skipRes.json();
                    
                 if (!skipData.feed?.entry || skipData.feed.entry.length === 0) {
                        // Το Blogger μέτρησε διεγραμμένα άρθρα. Ακυρώνουμε τα άλματα και πάμε στο 1ο (πρόσφατο) άρθρο.
                        currentIndex = 1;
                        publishedMax = "";
                        break;
                    }

                    // Αποθηκεύουμε την ημερομηνία της 500ής ανάρτησης για το επόμενο βήμα
                    publishedMax = skipData.feed.entry[0].published.$t;
                    // Αφαιρούμε 499 (όχι 500), γιατί το published-max θα φέρει 1η την ανάρτηση που μόλις βρήκαμε
                    currentIndex -= 499; 
                }

                // 3. Το τελικό request με το υπόλοιπο (που πλέον είναι σίγουρα <= 500)
                let finalUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=${currentIndex}`;
                if (publishedMax) finalUrl += `&published-max=${encodeURIComponent(publishedMax)}`;

                const finalRes = await fetch(finalUrl);
                const finalData = await finalRes.json();

          let entry = finalData.feed?.entry?.[0];
                if (!entry) {
                    // Fallback Ασφαλείας: Φορτώνουμε εγγυημένα την 1η ανάρτηση αν χτυπήσαμε σε "ghost post"
                    const safeRes = await fetch(`/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`);
                    const safeData = await safeRes.json();
                    entry = safeData.feed?.entry?.[0];
                    if (!entry) throw new Error("Δεν βρέθηκαν καθόλου αναρτήσεις.");
                }

                const pubDate = new Date(entry.published.$t);
                const diffDays = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
     
                if (diffDays <= 365) {
            
                    if (Math.random() > 0.20 && retryCount < 10) {
                        return await MobileDataEngine.fetchPosts(retryCount + 1); // Αθόρυβη νέα κλήρωση!
                    }
                }
                // -------------------------------------------------------------

                MobileDataEngine.processSingleEntry(entry);

            } catch (err) {
                console.warn('Χρονοκάψουλα:', err.message);
                MobileUIEngine.updateCard(
                    CONFIG.fallbackImg, 
                    "Σφάλμα Φόρτωσης", 
                    "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.", 
                    "Σφάλμα", 
                    "--", 
                    "#"
                );
            } finally {
                MobileDataEngine.isFetching = false;
            }
        },

      processSingleEntry: (entry) => {
            if (!entry) return;
            
            // Η έτοιμη συνάρτηση Utils.cleanText αποκωδικοποιεί τα HTML Entities με ασφάλεια
            const title = Utils.cleanText(entry.title?.$t) || 'Χωρίς Τίτλο';
          // Ασφαλής πλοήγηση στον πίνακα link με χρήση Optional Chaining (?.)
            const postLink = entry.link?.find(l => l.rel === 'alternate')?.href || '#';

            let imgSrc = CONFIG.fallbackImg;
       if (entry.media$thumbnail) {
                // Νέα, σύγχρονη Regex που πιάνει όλες τις παραλλαγές διαστάσεων (και τις παλιές και τις νέες)
                imgSrc = entry.media$thumbnail.url.replace(/\/(s\d+|w\d+-h\d+)[^\/]*\//, "/s600/");
                // Αναβάθμιση ανάλυσης για τις μικρογραφίες ενσωματωμένων βίντεο YouTube (από 120p σε 480p)
              // Αναβάθμιση ανάλυσης για τις μικρογραφίες ενσωματωμένων βίντεο YouTube (από 120p σε 480p)
                if (imgSrc.includes('youtube.com') || imgSrc.includes('ytimg.com')) {
                    // ΝΕΟ: Η κάθετος (/) διασφαλίζει ότι αντικαθίσταται αυστηρά ΜΟΝΟ το ακριβές αρχείο
                    imgSrc = imgSrc.replace('/default.jpg', '/hqdefault.jpg');
                }
         } else if (entry.content?.$t) {
                // Επιτρέπουμε τόσο τα μονά όσο και τα διπλά εισαγωγικά, καθιστώντας την αναζήτηση case-insensitive (i)
                const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                if (imgMatch) imgSrc = imgMatch[1];
            }

            // Αυτόματη μετατροπή σε HTTPS για αποφυγή σφαλμάτων Mixed Content σε αναρτήσεις παλιών ετών
            imgSrc = imgSrc.replace(/^http:\/\//i, 'https://');

          // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
        // Ελέγχουμε πρώτα το summary.$t (απαραίτητο για άρθρα με 'read more' break)
            let desc = Utils.cleanText(entry.summary?.$t || entry.content?.$t || "");
            if (desc.length > 80) {
                // Εύρεση του τελευταίου κενού διαστήματος πριν τον 80ο χαρακτήρα για να μην κόβονται λέξεις
                const lastSpace = desc.lastIndexOf(' ', 80);
                desc = desc.substring(0, lastSpace > 0 ? lastSpace : 80) + '...';
            }
            const pubDate = new Date(entry.published.$t);
            const months = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];
            const dateStr = `${months[pubDate.getMonth()]} ${pubDate.getFullYear()}`;
            
         // Υπολογισμός με βάση τις πραγματικές ημέρες, ώστε τα άρθρα της ίδιας σχολικής χρονιάς να μην εμφανίζονται ως "Πέρυσι" τον χειμώνα
         // Υπολογισμός με βάση τις πραγματικές ημέρες, ώστε τα άρθρα της ίδιας σχολικής χρονιάς να μην εμφανίζονται ως "Πέρυσι" τον χειμώνα
            const diffDays = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
            const yearsAgo = Math.max(0, Math.floor(diffDays / 365.25)); // ΝΕΟ: Αποτροπή παραγωγής αρνητικών αριθμών (-1)
            let badgeText = yearsAgo === 0 ? "Πρόσφατο" : yearsAgo === 1 ? "Πέρυσι" : `${yearsAgo} Χρόνια Πριν`;

            MobileUIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

 const MobileUIEngine = {
        updateCard: (img, title, desc, badge, date, link) => {
            DOM.imgs.forEach(el => {
                el.src = img;
                // ΝΕΟ: Αν η εικόνα του άρθρου είναι διεγραμμένη/σπασμένη (Error 404), φορτώνει αυτόματα το fallback
                el.onerror = () => {
                    el.src = CONFIG.fallbackImg;
                    el.onerror = null; // Αποτροπή ατέρμονου βρόχου αν σπάσει τυχαία και το fallback
                };
            });
            DOM.titles.forEach(el => el.innerText = title);
            DOM.descs.forEach(el => el.innerText = desc || "Διαβάστε περισσότερα...");
            DOM.badges.forEach(el => el.innerText = badge);
            DOM.dates.forEach(el => el.innerText = date);
            DOM.btnLinks.forEach(el => el.href = link);
        },

     createDust: () => {
            DOM.widgets.forEach(widget => {
                // Εγκλωβίζει τα στοιχεία αυστηρά εντός του widget αποτρέποντας τα scrollbars
                widget.style.overflow = "hidden"; 
                widget.style.position = "relative"; 
                
                widget.querySelectorAll('.stc-dust').forEach(el => el.remove());
                const fragment = document.createDocumentFragment();
              for (let i = 0; i < 15; i++) {
                    let dust = document.createElement("div");
                    dust.className = "stc-dust";
                    dust.style.pointerEvents = "none"; // Κάνει τη σκόνη "διαπερατή", αποτρέποντας το μπλοκάρισμα των κλικ
                    dust.style.width = dust.style.height = (Math.random() * 4 + 1) + "px";
                    dust.style.left = (Math.random() * 100) + "%";
                    dust.style.top = (Math.random() * 100) + "%";
                    dust.style.animationDuration = (Math.random() * 10 + 5) + "s";
                    dust.style.animationDelay = (Math.random() * 5) + "s";
                    fragment.appendChild(dust);
                }
                widget.appendChild(fragment);
            });
        },

        createArrowHint: (engineRef) => {
            DOM.widgets.forEach(widget => {
                if (widget.querySelector('.stc-arrow')) return; 
                
                const arrow = document.createElement('div');
                arrow.className = 'stc-arrow'; // Το κάναμε class αντί για id για να παίζει παντού
                arrow.innerHTML = '&#10095;'; 
                
                arrow.style.cssText = `
                    position: absolute; right: 15px; top: 50%; margin-top: -20px;
                    color: rgba(255, 255, 255, 0.8); font-size: 26px; cursor: pointer;
                    z-index: 20; user-select: none; padding: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                `;
                
               arrow.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    engineRef.triggerReRoll();
                });

                widget.appendChild(arrow);
                
                // Προστατευτικός έλεγχος υποστήριξης για να μην καταρρέει το script σε παλιές συσκευές
                if (typeof arrow.animate === 'function') {
                    arrow.animate([
                        { transform: 'translateX(0)', opacity: 0.5 },
                        { transform: 'translateX(6px)', opacity: 1 },
                        { transform: 'translateX(0)', opacity: 0.5 }
                    ], { duration: 1500, iterations: Infinity, easing: 'ease-in-out' });
                }
            });
        }
    };
const SwipeEngine = {
        startX: 0,
        startY: 0,
        isDragging: false, // <-- Προστέθηκε για το PC!
        isZooming: false, // <-- ΝΕΟ: Παρακολούθηση κατάστασης ζουμ
        
  init: () => {
            DOM.widgets.forEach(widget => {
                // Επιτρέπει το κάθετο scroll ΚΑΙ τη μεγέθυνση (pinch-to-zoom)
                widget.style.touchAction = "pan-y pinch-zoom";
                
             // --- 1. ΑΦΗ (ΚΙΝΗΤΟ) ---
                widget.addEventListener('touchstart', (e) => {
                    if (e.touches.length > 1) {
                        SwipeEngine.isZooming = true;
                        return; // Ακύρωση ανίχνευσης αν χρησιμοποιούνται πολλά δάχτυλα (π.χ. Ζουμ)
                    }
                    SwipeEngine.isZooming = false; // Επαναφορά σε κανονικό άγγιγμα
                    SwipeEngine.startX = e.changedTouches[0].screenX;
                    SwipeEngine.startY = e.changedTouches[0].screenY;
                }, { passive: true });
                
             widget.addEventListener('touchend', (e) => {
                    // Ενσωμάτωση του ελέγχου isZooming για πλήρη αποτροπή swipe αν προηγήθηκε ζουμ
                    if (e.changedTouches.length > 1 || e.touches.length > 0 || SwipeEngine.isZooming) return; 
                    
                    const endX = e.changedTouches[0].screenX;
                    const endY = e.changedTouches[0].screenY;
                    
                   // ΜΕΣΑ ΣΤΟ touchend (ΚΙΝΗΤΟ)
                    const deltaX = Math.abs(SwipeEngine.startX - endX);
                    const deltaY = Math.abs(SwipeEngine.startY - endY);
                    
                    // Απαιτούμε η οριζόντια κίνηση (swipe) να είναι τουλάχιστον διπλάσια από την κάθετη (scroll)
                    if (deltaX > 50 && deltaX > deltaY * 2) SwipeEngine.triggerReRoll();
                }, { passive: true });

                // --- 2. ΠΟΝΤΙΚΙ (ΥΠΟΛΟΓΙΣΤΗΣ) ---
                widget.style.cursor = "grab";
                widget.style.userSelect = "none";
                widget.ondragstart = () => false;

                widget.addEventListener('mousedown', (e) => {
                    if (e.target.closest('a') || e.button !== 0) return;
                    SwipeEngine.isDragging = true;
                    SwipeEngine.startX = e.pageX;
                    SwipeEngine.startY = e.pageY;
                    widget.style.cursor = "grabbing";
                });
            });

            // Το mouseup μπαίνει στο window για να μην κολλάει αν βγει το ποντίκι έξω
            window.addEventListener('mouseup', (e) => {
                if (!SwipeEngine.isDragging) return;
                SwipeEngine.isDragging = false;
                
                DOM.widgets.forEach(w => w.style.cursor = "grab");
           const deltaX = Math.abs(SwipeEngine.startX - e.pageX);
                const deltaY = Math.abs(SwipeEngine.startY - e.pageY);
                // Ακυρώνουμε την αλλαγή αν ο χρήστης απλώς μαρκάρει κείμενο προς αντιγραφή
                const hasSelectedText = window.getSelection().toString().trim().length > 0;
                if (deltaX > 80 && deltaX > deltaY && !hasSelectedText) SwipeEngine.triggerReRoll();
            });
        },
        
      triggerReRoll: () => {
            if (MobileDataEngine.isFetching) return;
            
            DOM.widgets.forEach(widget => {
          
                widget.style.transition = "opacity 0.3s";
                widget.style.opacity = "0.5";
                widget.style.pointerEvents = "none"; // Αποτροπή κλικ κατά τη διάρκεια της φόρτωσης
            });
            
            DOM.titles.forEach(title => title.innerText = "Αναζήτηση μνήμης...");
            
            MobileDataEngine.fetchPosts().finally(() => {
                DOM.widgets.forEach(widget => {
                    widget.style.opacity = "1";
                    widget.style.pointerEvents = ""; // Επαναφορά της δυνατότητας κλικ μόλις ολοκληρωθεί
                });
                MobileUIEngine.createDust(); 
            });
        }
    };

   const MobileApp = {
        init: () => {
            // Χρησιμοποιούμε querySelectorAll για να πιάσουμε ΚΑΙ του PC ΚΑΙ του κινητού
            DOM.widgets = document.querySelectorAll("#stc-widget, #stc-widget-mobile");
            if (DOM.widgets.length === 0) return;

            DOM.imgs = document.querySelectorAll("#stc-image, #stc-image-mobile");
            DOM.titles = document.querySelectorAll("#stc-title, #stc-title-mobile");
            DOM.descs = document.querySelectorAll("#stc-desc, #stc-desc-mobile");
            DOM.badges = document.querySelectorAll("#stc-badge, #stc-badge-mobile");
            DOM.dates = document.querySelectorAll("#stc-date, #stc-date-mobile");
            DOM.btnLinks = document.querySelectorAll("#stc-btn-link, #stc-btn-link-mobile");

            MobileDataEngine.fetchPosts();
            MobileUIEngine.createDust();
            MobileUIEngine.createArrowHint(SwipeEngine);
            SwipeEngine.init();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }
})();

;(() => {
  "use strict";

  //sansimeraol

 const CONFIG = Object.freeze({
    jsonUrl: "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/historyFactsMobile6.json",
    defaultFact: "Κάθε μέρα είναι μια ευκαιρία να μελετήσουμε το παρελθόν και να χτίσουμε ένα καλύτερο μέλλον.",
    storagePrefix: "daily_mission_", // Κοινό πρόθεμα για να μοιράζονται την ίδια αποστολή
    animDelay: 50,
    initDelay: 200
  });

  // Κενή μεταβλητή που θα γεμίσει δυναμικά από το API
  let DATA = null;

  // ==========================================
  // 2. UTILS & HELPERS
  // ==========================================
  const Utils = {
    // Κομψή αναζήτηση της κατάλληλης αποστολής με ασφάλεια (Fail-safe)
    generateMission: (factText) => {
      const text = factText.toLowerCase();
      let category = 'default';

      // Σαρώνει τις κατηγορίες μόνο αν τα δεδομένα έχουν φορτώσει σωστά
    if (DATA && DATA.keywordsMap) {
       for (const [key, keywords] of Object.entries(DATA.keywordsMap)) {
          // ΔΙΟΡΘΩΣΗ: Ασφαλής μετατροπή του kw σε String πριν εφαρμοστεί το toLowerCase(),
          // αποτρέποντας κρασαρίσματα αν το JSON περιέχει αριθμούς/χρονολογίες.
          if (keywords.some(kw => text.includes(String(kw).toLowerCase()))) {
            category = key;
            break;
          }
        }
      }

      const missionsList = (DATA && DATA.missions && DATA.missions[category] && DATA.missions[category].length > 0)
                           ? DATA.missions[category]
                           : (DATA && DATA.missions && DATA.missions['default'] && DATA.missions['default'].length > 0)
                              ? DATA.missions['default']
                              : ["Μοιράσου τη γνώση! Πες το σημερινό ιστορικό γεγονός σε έναν φίλο."]; // Τελικό Fallback

      return missionsList[Math.floor(Math.random() * missionsList.length)];
    },

    getDateKey: () => {
      const today = new Date();
      return `${today.getMonth()}-${today.getDate()}`;
    },

   // Καθαρίζει τον browser του κινητού από παλιές αποστολές για εξοικονόμηση χώρου
    cleanOldStorage: (currentKey) => {
      try { // ΚΡΙΣΙΜΟ: Προστασία από Fatal Error (SecurityError) αν ο χρήστης μπλοκάρει τα cookies/storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CONFIG.storagePrefix) && key !== currentKey) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn("Το localStorage δεν είναι προσβάσιμο για εκκαθάριση.");
      }
    }
  };

  // ==========================================
  // 3. WIDGET MANAGER
  // ==========================================
  const WidgetManager = {
  init: async () => {
      // --- Λήψη του JSON (Fetch API) ΜΙΑ φορά και για τα 2 ---
      try {
        const response = await fetch(CONFIG.jsonUrl);
        if (!response.ok) throw new Error("Σφάλμα κατά τη λήψη των δεδομένων.");
        DATA = await response.json(); 
      } catch (error) {
        console.error("Το API απέτυχε. Φόρτωση Fallback:", error);
        DATA = { historyFactsMobile: {}, missions: {}, keywordsMap: {} };
      }
      // ------------------------------------------------

      const dateKey = Utils.getDateKey();
      
      // Ασφαλής ανάγνωση του σημερινού γεγονότος (από το JSON του κινητού)
      const currentFact = (DATA && DATA.historyFactsMobile && DATA.historyFactsMobile[dateKey])
                          ? DATA.historyFactsMobile[dateKey]
                          : CONFIG.defaultFact;

      const storageKey = `${CONFIG.storagePrefix}${dateKey}`;

     // 1. Καθάρισμα παλιών δεδομένων
      Utils.cleanOldStorage(storageKey);

      // 2. Δημιουργία ή ανάγνωση της αποστολής (κοινή για PC και Κινητό)
      let savedMission = null;
      try { // ΚΡΙΣΙΜΟ: Προστασία της ανάγνωσης για να μην κρασάρει το widget!
        savedMission = localStorage.getItem(storageKey);
      } catch (e) {}
      if (!savedMission) {
        savedMission = Utils.generateMission(currentFact);
        try {
          localStorage.setItem(storageKey, savedMission);
        } catch (e) {
          console.warn("Το localStorage δεν είναι διαθέσιμο.");
        }
      }

      // 3. Εφαρμογή των δεδομένων δυναμικά (mobile και pc)
      const platforms = ['mobile', 'pc'];
      platforms.forEach(platform => {
        const factElement = document.getElementById(`history-fact-${platform}`);
        const missionElement = document.getElementById(`mission-text-${platform}`);
        
        // Αν βρει το κουτάκι του Fact (του PC ή του Mobile), το γεμίζει
        if (factElement) {
          factElement.style.opacity = '0';
          factElement.innerHTML = currentFact;
          
          setTimeout(() => {
            window.requestAnimationFrame(() => {
              factElement.style.transition = "opacity 0.5s ease";
              factElement.style.opacity = '1';
            });
          }, CONFIG.animDelay);
        }

        // Αν βρει το κουτάκι του Mission (του PC ή του Mobile), το γεμίζει
        if (missionElement) {
          missionElement.innerHTML = savedMission;
        }
      });
    },
toggleContainer: (event, platform) => {
      if (platform === 'mobile' && navigator.vibrate) navigator.vibrate(15); 
      
      const container = document.getElementById(`mission-container-${platform}`);
      if (container) container.classList.toggle("open");
    },

  // Διαχείριση κλεισίματος όταν γίνεται click έξω (για όλα τα widgets)
    setupOutsideClick: () => {
      // ΚΡΙΣΙΜΟ: Φτιάχνουμε τη λογική του κλεισίματος σε μια σταθερή μεταβλητή (για να μην την ξαναγράφουμε)
      const closeHandler = (event) => {
        // ΔΙΟΡΘΩΣΗ: Ασπίδα προστασίας. Αν το κλικ έγινε πάνω στο κουμπί toggle, 
        // αγνόησέ το εντελώς ώστε να μην κλείσει το μενού ακαριαία!
        if (event.target.closest('[onclick*="toggleMission"]')) return;

        const platforms = ['mobile', 'pc'];
        platforms.forEach(platform => {
          const wrapper = document.getElementById(`history-wrapper-container-${platform}`);
          const container = document.getElementById(`mission-container-${platform}`);
          
          if (wrapper && !wrapper.contains(event.target)) {
            if (container && container.classList.contains("open")) {
              container.classList.remove("open");
            }
          }
        });
      };

      // 1. Ακούμε στο 'click' (Για υπολογιστές και Android)
      document.addEventListener("click", closeHandler, { passive: true });
      
      // 2. Ακούμε στο 'touchstart' (ΥΠΟΧΡΕΩΤΙΚΟ για να μη κολλάει ανοιχτό το widget στα iPhone / iPad!)
      document.addEventListener("touchstart", closeHandler, { passive: true });
    }
      };

 // ==========================================
  // 4. ΕΚΚΙΝΗΣΗ ΛΕΙΤΟΥΡΓΙΩΝ
  // ==========================================
  // Εξάγουμε και τα δύο toggle functions παγκοσμίως (window) ώστε να τα βλέπει η HTML του site σου
  window.toggleMissionMobile = (event) => WidgetManager.toggleContainer(event, 'mobile');
  window.toggleMissionPC = (event) => WidgetManager.toggleContainer(event, 'pc');

 const startWidget = () => {
    // Χρησιμοποιούμε καθυστέρηση για να μην μπλοκάρουμε το κύριο νήμα (main thread)
    setTimeout(() => {
      WidgetManager.init();
      WidgetManager.setupOutsideClick();
    }, CONFIG.initDelay);
  };

  // ΚΡΙΣΙΜΟ: Ελέγχει αν η σελίδα έχει ΉΔΗ φορτώσει, αλλιώς περιμένει το event
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWidget);
  } else {
    startWidget();
  }

})();
