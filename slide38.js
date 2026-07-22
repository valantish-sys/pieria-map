import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const db = getDatabase(app);
(() => {
  "use strict";

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
    YT: /(?:embed\/|v=|youtu\.be\/|vi\/|\/v\/|e\/|watch\?v=)([^#\&\?]{11})/,
    YT_IMG: /img\.youtube\.com\/vi\/([a-zA-Z0-9_-]{11})/,
    IMG_SIZE: /\/(w\d+-h\d+|s\d+)[^\/]*\//,
    FB: /facebook\.com\/(?:plugins\/video|video)/
  });

  const PASSIVE = { passive: true };

  window.addEventListener('touchstart', () => { STATE.isTouchDevice = true; }, { ...PASSIVE, once: true });

  // ==========================================
  // 2. UTILS & HELPERS
  // ==========================================
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

    handleImageFallback: (imgEl) => {
      const fallback = function(e) {
        if (this.src.includes('maxresdefault.jpg') && (this.naturalWidth <= 120 || e?.type === 'error')) {
          this.src = this.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
        }
      };
      imgEl.onload = fallback;
      imgEl.onerror = fallback;
    },

    extractData: (htmlStr) => {
      if (!htmlStr) return { imgs: [Utils.getRandomImg()], text: "" };
      
      const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
      const imgs = Array.from(doc.images).map(img => img.src).filter(Boolean);
      
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
      
      const fullText = (doc.body.textContent || "").replace(/\s+/g, ' ').trim();
      return { 
        imgs: imgs.length ? imgs : [Utils.getRandomImg()], 
        text: fullText 
      };
    },

    buildSafeTextNodes: (text, containerEl) => {
      containerEl.textContent = ''; 
      const parts = text.split(/\[\[\[(.*?)\]\]\]/g);
      const fragment = document.createDocumentFragment();
      parts.forEach((part, idx) => {
        if (!part) return;
        if (idx % 2 === 1) { 
          const span = Object.assign(document.createElement('span'), { className: 'fake-link', textContent: part });
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(part));
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

  // ==========================================
  // 3. NAV MANAGER
  // ==========================================
  const NavManager = {
    init: () => {
      const nav = document.querySelector('nav');
      if (!nav) return;
      
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const isScrolled = window.scrollY > 350;
            nav.classList.toggle('nav-fixed', isScrolled);
            document.body.classList.toggle('nav-is-fixed', isScrolled);
            ticking = false;
          });
          ticking = true;
        }
      }, PASSIVE);

      let idleTimeout;
      const resetIdleTimer = Utils.throttle(() => {
        nav.classList.remove('nav-hidden-active');
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          document.querySelector('.nav-fixed')?.classList.add('nav-hidden-active');
        }, 2000);
      }, 200);

      ['mousemove', 'scroll', 'touchstart', 'keydown'].forEach(evt => 
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
          
          const postId = rDiv.dataset.postid;
          // ΤΟ FIX ΕΙΝΑΙ ΕΔΩ: Προστέθηκε το \/ για να σβήνει τις κάθετες γραμμές!
          const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
          
          const postRef = ref(db, 'reactions/' + safePostId);
          onValue(postRef, (snapshot) => {
            const d = snapshot.val() || { love: 0, funny: 0, wow: 0 };
            rDiv.querySelector('.count-love').textContent = d.love || 0;
            rDiv.querySelector('.count-funny').textContent = d.funny || 0;
            rDiv.querySelector('.count-wow').textContent = d.wow || 0;
          });
        }
      });
    }, { rootMargin: '50px 0px', threshold: 0.1 }),
    
    handleVote: (btn) => {
      const rDiv = btn.closest('.floating-reactions');
      if (!rDiv || rDiv.classList.contains('is-voting') || rDiv.classList.contains('voted')) return;
      
      const postId = rDiv.dataset.postid;
      // ΚΑΙ ΕΔΩ: Προστέθηκε το \/ 
      const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
      const type = btn.dataset.type;
      const countSpan = btn.querySelector('span:last-child');
      
      rDiv.classList.add('is-voting', 'voted');
      rDiv.style.pointerEvents = 'none';
      countSpan.textContent = ".."; 
      
      const reactionRef = ref(db, 'reactions/' + safePostId + '/' + type);
      const totalRef = ref(db, 'stats/total_reactions');
      
      Promise.all([
          runTransaction(reactionRef, (currentCount) => { return (currentCount || 0) + 1; }),
          runTransaction(totalRef, (currentTotal) => { return (currentTotal || 0) + 1; })
      ])
      .then(() => {
        localStorage.setItem(`feedback_${safePostId}`, 'voted');
        rDiv.classList.remove('is-voting');
      })
      .catch((error) => {
        console.error("Σφάλμα Firebase:", error);
        rDiv.classList.remove('is-voting', 'voted');
        rDiv.style.pointerEvents = 'auto'; 
        countSpan.textContent = "!";
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
    lastFocus: null,
    
    init: () => {
      const LM = LightboxManager;
      if (!LM.el) return;
      
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

      let startX = 0, endX = 0;
      LM.el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, PASSIVE);
      LM.el.addEventListener('touchmove', e => { endX = e.touches[0].clientX; }, PASSIVE);
      LM.el.addEventListener('touchend', () => {
        if (endX === 0) return;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) diff > 0 ? LM.next() : LM.prev();
        endX = 0;
      });
      
      document.addEventListener('keydown', (e) => {
        if (!LM.el.classList.contains('active')) return;
        if (e.key === 'Escape') LM.close();
        else if (e.key === 'ArrowRight') LM.next();
        else if (e.key === 'ArrowLeft') LM.prev();
      });
    },
    
    open: (imgs) => {
      const LM = LightboxManager;
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
      LM.index = 0;
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
      
      LM.videoInterval = setInterval(() => {
        if (document.activeElement?.id === 'lightbox-video') window.focus();
      }, 500);
    },
    
    close: () => {
      const LM = LightboxManager;
      LM.el.classList.remove('active');
      document.body.classList.remove('lb-active');
      document.body.style.overflow = '';
      
      if (LM.video) LM.video.src = ''; // Αδειάζει το βίντεο για να μην παίζει background
      clearInterval(LM.videoInterval); 
      
      LM.lastFocus?.focus(); 
      window.SliderManager?.resume(true);
    },
    
    next: () => { LightboxManager.index = (LightboxManager.index + 1) % LightboxManager.images.length; LightboxManager.update(); },
    prev: () => { LightboxManager.index = (LightboxManager.index - 1 + LightboxManager.images.length) % LightboxManager.images.length; LightboxManager.update(); },
    
    update: () => {
      const LM = LightboxManager;
      if (!LM.images.length) return;
      
      const currentSrc = LM.images[LM.index];
      const ytMatch = currentSrc.match(REGEX.YT_IMG);
      const isFb = REGEX.FB.test(currentSrc);
      
      if (ytMatch?.[1]) {
        LM.img.style.display = 'none'; 
        LM.video.style.display = 'block';
        LM.video.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
        LM.download.style.display = 'none';
      } else if (isFb) {
        LM.img.style.display = 'none'; 
        LM.video.style.display = 'block';
        LM.video.src = currentSrc;
        LM.download.style.display = 'none';
      } else {
        LM.video.style.display = 'none'; 
        LM.video.src = "";
        LM.img.style.display = 'block'; 
        LM.img.src = currentSrc;
        LM.download.style.display = 'block';
        
        LM.download.onclick = async (e) => {
          e.preventDefault();
          try {
            const res = await fetch(currentSrc);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), {
              href: url,
              download: 'sxoleio_photo.jpg'
            });
            a.style.display = 'none'; 
            document.body.appendChild(a); 
            a.click(); 
            a.remove(); // Μηδενίζει την διαρροή μνήμης (Memory leak)
            window.URL.revokeObjectURL(url);
          } catch (err) {
            window.open(currentSrc, '_blank');
          }
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
            if (sData?.feed?.entry?.[0]) entries.unshift(sData.feed.entry[0]);
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
      
      const fragment = document.createDocumentFragment(); 
      SM.progressBar = Object.assign(document.createElement('div'), { id: 'progress-bar' });
      fragment.appendChild(SM.progressBar);
      
      const chunkSize = (window.innerWidth > 900) ? 330 : 68;

      entries.forEach((entry, idx) => {
        const href = entry.link?.find(l => l.rel === "alternate")?.href || "#";
        const title = entry.title?.$t || "Άρθρο";
        const isPinned = href.includes(CONFIG.pinnedPostPath);
        
        const { imgs, text: fullText } = Utils.extractData(entry.content?.$t || "");
        
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

        const slide = Object.assign(document.createElement('a'), {
          href, rel: "noopener", draggable: false,
          className: `slide ${isPinned ? "pinned-contain" : ""}`
        });
        slide.setAttribute("aria-hidden", "true"); 
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
        
        if (!isPinned && idx < 6) {
          slide.appendChild(Object.assign(document.createElement("div"), {
            className: "new-badge", textContent: "Νέα"
          }));
        }
        
        const caption = Object.assign(document.createElement("div"), { className: "slide-title" });
        caption.appendChild(Object.assign(document.createElement("strong"), { textContent: title }));
        
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

          let textStartX = 0;
          descContainer.addEventListener('touchstart', (e) => { textStartX = e.touches[0].clientX; e.stopPropagation(); }, PASSIVE);
          descContainer.addEventListener('touchend', (e) => {
            const diff = textStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
              const action = diff > 0 ? "next-snippet" : "prev-snippet";
              descContainer.querySelector(`[data-action="${action}"]`)?.click();
              e.stopPropagation();
            }
          }, PASSIVE);
        }
        caption.appendChild(descContainer);
        
        const postId = href ? new URL(href).pathname : "";
        if (postId?.length > 3) {
            // ΔΙΟΡΘΩΣΗ: Προστέθηκε το \/ για να ταιριάζει απόλυτα με το localStorage!
            const safePostId = postId.replace(/[\.\#\$\[\]\/]/g, '_');
            const isVoted = localStorage.getItem(`feedback_${safePostId}`);
          const reactDiv = Object.assign(document.createElement("div"), { className: `floating-reactions ${isVoted ? 'voted' : ''}` });
          reactDiv.dataset.postid = postId;
          
          reactDiv.innerHTML = `
            <button class="floating-btn" data-type="love" aria-label="Αγαπώ"><span>❤️</span><span class="count-love">0</span></button>
            <button class="floating-btn" data-type="funny" aria-label="Αστείο"><span>😂</span><span class="count-funny">0</span></button>
            <button class="floating-btn" data-type="wow" aria-label="Ουάου"><span>😮</span><span class="count-wow">0</span></button>
          `;
          ReactionsManager.observer.observe(reactDiv);
          slide.appendChild(reactDiv);
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
        
        [1 % SM.slides.length, (SM.slides.length - 1 + SM.slides.length) % SM.slides.length].forEach(idx => {
            const img = SM.slides[idx]?.el.querySelector("img");
            if (img?.dataset.fullSrc) {
                img.src = img.dataset.fullSrc;
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
      
      SM.slides[SM.index].el.classList.remove("active");
      SM.slides[SM.index].el.setAttribute("aria-hidden", "true");
      
      SM.index = newIndex;
      const nextSlide = SM.slides[SM.index];
      nextSlide.el.classList.add("active");
      nextSlide.el.setAttribute("aria-hidden", "false");

      const preloadNext = (newIndex + 1) % SM.slides.length;
      const preloadPrev = (newIndex - 1 + SM.slides.length) % SM.slides.length;
      
      [newIndex, preloadNext, preloadPrev].forEach(idx => {
          const img = SM.slides[idx]?.el.querySelector("img");
          if (img?.dataset.fullSrc) {
              img.src = img.dataset.fullSrc;
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
      if (!force && STATE.isPausedByTitle) return;
      
      const isPinned = SM.slides[SM.index]?.el.classList.contains('pinned-contain');
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
        diffX > 0 ? SM.next(true) : SM.prev(true);
      } else {
        STATE.wasDragged = false;
      }
      
      SM.touch.endX = 0; SM.touch.endY = 0;
      return swiped;
    },

    setupEvents: () => {
      const SM = window.SliderManager;
      
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

        const target = e.target.closest('.floating-btn, [data-action="zoom"], .slider-arrow, .snippet-btn');
        
        if (target) {
          e.preventDefault(); e.stopPropagation();
          
          if (target.classList.contains('floating-btn')) {
            ReactionsManager.handleVote(target);
          } 
          else if (target.dataset.action === 'zoom') {
            const slideObj = SM.slides.find(s => s.el === target.closest('.slide'));
            if (slideObj) LightboxManager.open(slideObj.imgs);
          } 
          else if (target.classList.contains('slider-arrow')) {
            SM.pause(); STATE.isPausedByTitle = false;
            target.dataset.action === 'prev-slide' ? SM.prev(true) : SM.next(true);
          } 
          else if (target.classList.contains('snippet-btn') && !target.classList.contains('disabled')) {
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
        if (STATE.isPausedByTitle && !e.target.closest('.slide-title')) {
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
        if (e.target.closest('.slide-desc-container')) return; 
        STATE.isTouchDevice = true; STATE.wasDragged = false;
        SM.touch.startX = e.touches[0].clientX; SM.touch.startY = e.touches[0].clientY;
        SM.touch.endX = 0; SM.touch.endY = 0;
        SM.showArrows(); SM.pause();
        if (SM.progressBar) { SM.progressBar.style.transition = 'none'; SM.progressBar.style.width = '0%'; }
      }, PASSIVE);

      SM.container.addEventListener('touchmove', e => { 
        SM.touch.endX = e.touches[0].clientX; 
        SM.touch.endY = e.touches[0].clientY; 
      }, PASSIVE);
      
      SM.container.addEventListener('touchend', e => {
        if (e.target.closest('.slide-desc-container')) return;
        SM.handleSwipe();
        if (!STATE.isPausedByTitle) { SM.resume(); SM.resetProgress(true); }
      });

      SM.container.addEventListener('mousedown', e => {
        if (e.button !== 0 || STATE.isTouchDevice || e.target.closest('.slide-desc-container')) return;
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
        if (document.body.classList.contains('lb-active')) return;
        const rect = SM.container.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          if (e.key === 'ArrowLeft') { e.preventDefault(); SM.prev(true); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); SM.next(true); }
        }
      });
    }
  };

  // ==========================================
  // 7. ΕΝΑΡΞΗ ΛΕΙΤΟΥΡΓΙΩΝ
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    NavManager.init();
    LightboxManager.init();
    window.SliderManager?.init();
  });

})();
