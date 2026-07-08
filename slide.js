(function() {
window.addEventListener('load', () => {
    // Μικρή καθυστέρηση 500ms για να είναι σίγουρο ότι όλα τα div έχουν σχεδιαστεί
    setTimeout(() => {
        console.log("Ξεκινάω το slider...");
        // ΕΔΩ ΒΑΖΕΙΣ ΟΛΟ ΤΟΝ ΥΠΟΛΟΙΠΟ ΚΩΔΙΚΑ ΣΟΥ
    }, 500);
});
  let isTouchDevice = false;
  let isPausedByTitle = false; // ΝΕΟ: Ελέγχει αν το slider έχει παγώσει
  window.addEventListener('touchstart', () => { isTouchDevice = true; }, { passive: true });
  const feedUrl = "https://dimperist.blogspot.com/feeds/posts/default?alt=json&max-results=106";
  const resumeSlider = (e) => {
    if (isPausedByTitle && !e.target.closest('.slide-title')) {
      isPausedByTitle = false;
      if (window.resetProgressBar) resetProgressBar(true);
      // Επανεκκίνηση του κεντρικού χρονομέτρου για να ξεκινάει πάλι από το μηδέν!
      if (window.restartSmartTimer) window.restartSmartTimer(); 
    }
  };
  document.addEventListener('click', resumeSlider);
  // ===================================================================
  // Ο πίνακας με τις 4 στατικές εικόνες
  const defaultImages = [
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFiu4dVYlPwxK3xtwKSurxCvPBaryI-jgcqysrU2BrKHbxlVOOKiZUT-v7wTK8UbMCfzNUjbA7aNk1e51z093ft3yC6_GkBbHu4I1-3DaxdfK-gbuzazZ0HNSBjrJ2gM_4GBBrRyFabK23uIZmXwgaezpRieBPTBWCE4pCm6kal9nAGG_5wAOsbIR7_Q8/s320/Gemini_Generated_Image_kj2jlbkj2jlbkj2j.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEicnwcf5MtSIS5zph5DxV7oJnr5y7Boimib6Wpq4NGfyLvr7xCU6bU3muKSFERVBVYj0BzVBzI0JORWKuJkbLo4YrCE9S4Efu2Q3MyvOtMtX7ZfIyoZGQ5kqQLHh3ZvjQfaP6xx-RYwEshSLmLnsQxGKnbJnNmJVbVi4JaG-SvM-knJzZWTZ7Y7XreDlME/s320/Gemini_Generated_Image_y8h9zxy8h9zxy8h9.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRiqsHKDiJK_tfJo5VAqpx_s1wASZGYnSNQDfhhFEDYNowBmPGAfUQMjlTTsJSK8Rvg_aL7RSiCgc7Edx6z8W-UnB3jS_8Z5BtW2-K7gkr4dUlOCt7Q1b-n4xGJk86OzxPsWFyymq0AuIEKNcaDKp36RcnUxdcQyF-JtQDQuojBqc_2okh9-w0Bd9o1aM/s320/Gemini_Generated_Image_pa075bpa075bpa07.png",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh98wnzkmN_Kry_Uvi_NfprZD7n9yq85Pn-ywWbjNMNQ6X7opEGMo3p5C3L5hX9qTRIEXFaRux56pMptwV7Zg-n9nNSWcfpmYBxZ2TfS2ojJHc5gZjd-IZ5ki2jGu8FIcRKUzFSulm8Ac-pVIIe9HTRxHgSg4eso3TjvxW8tAZByBYZNVLFft7EBo7T-H0/s320/Gemini_Generated_Image_ox9wwxox9wwxox9w.png"
  ];
  
  const getRandomDefaultImg = () => defaultImages[Math.floor(Math.random() * defaultImages.length)];
  const container = document.getElementById('recent-slider');
  if (!container) return; 
  
 function upscaleImgUrl(url) {
    let targetUrl = url;
    
    // 1. Αν ΔΕΝ υπάρχει εικόνα ή είναι Facebook iframe, βάλε την default
    if (!targetUrl || targetUrl.includes('facebook.com/plugins/video')) {
      targetUrl = getRandomDefaultImg();
    }
    
    // 2. Τώρα, όποια εικόνα κι αν είναι (είτε από το post, είτε η default), ΚΑΝΤΗΝ HD!
    if (targetUrl.includes('img.youtube.com')) {
      return targetUrl.replace('hqdefault.jpg', 'maxresdefault.jpg');
    }
    if (targetUrl.match(/\/(w\d+-h\d+|s\d+)[^\/]*\//)) {
      return targetUrl.replace(/\/(w\d+-h\d+|s\d+)[^\/]*\//, '/s1600-rw/');
    }
    
    return targetUrl;
  }
  
  function extractImagesFromHtml(htmlStr) {
    if (!htmlStr) return [getRandomDefaultImg()];
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlStr;
    const imgs = [...tmp.querySelectorAll('img')].map(img => img.src);
    
    // Πιάνουμε όλα τα iframes
    const iframes = [...tmp.querySelectorAll('iframe')];
    iframes.forEach(iframe => {
      const src = iframe.src;
      // Έλεγχος για YouTube Video
      const match = src.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        const thumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        imgs.push(thumb);
      }
      // ΝΕΟ: Έλεγχος για Facebook Video
      else if (src.includes('facebook.com/plugins/video') || src.includes('facebook.com/video')) {
        imgs.push(src); // Το περνάμε αυτούσιο
      }
    });
    return imgs.length > 0 ? imgs : [getRandomDefaultImg()];
  }
  
  function handleImageFallback(imgEl) {
    imgEl.onload = function() {
      if (this.src.includes('maxresdefault.jpg') && this.naturalWidth <= 120) {
        this.src = this.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
    };
    imgEl.onerror = function() {
      if (this.src.includes('maxresdefault.jpg')) {
        this.src = this.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
    };
  }

fetch(feedUrl)
    .then(res => res.json())
    .then(async data => {  
      const entries = data.feed?.entry || [];

      // === ΕΞΥΠΝΟΣ ΚΩΔΙΚΑΣ v2: ΑΣΦΑΛΗΣ ΑΝΑΚΤΗΣΗ ΜΕΣΩ API ===
      const postPath = "/2026/06/12.html"; // Ψάχνουμε μόνο την κατάληξη του URL
      
      const pinnedIndex = entries.findIndex(entry => {
        const linkObj = (entry.link || []).find(l => l.rel === "alternate");
        return linkObj && linkObj.href.includes(postPath);
      });

      if (pinnedIndex > 0) {
        // Βρέθηκε στις πρόσφατες, την φέρνουμε πρώτη
        const pinnedPost = entries.splice(pinnedIndex, 1)[0];
        entries.unshift(pinnedPost);
      } else if (pinnedIndex === -1) {
        // Πάλιωσε. Ζητάμε από το Blogger ΜΟΝΟ αυτή την ανάρτηση με βάση το path της!
        try {
          const singleRes = await fetch(`https://dimperist.blogspot.com/feeds/posts/default?alt=json&path=${postPath}`);
          const singleData = await singleRes.json();
          if (singleData && singleData.feed && singleData.feed.entry && singleData.feed.entry.length > 0) {
             entries.unshift(singleData.feed.entry[0]);
          }
        } catch (error) {
           console.error("Σφάλμα ανάκτησης καρφιτσωμένης ανάρτησης:", error);
        }
      }
      // === ΤΕΛΟΣ ΕΞΥΠΝΟΥ ΚΩΔΙΚΑ ===

      const slides = [];
      
      // Δημιουργία της μπάρας προόδου
      const progressBar = document.createElement('div');
      progressBar.id = 'progress-bar';
      container.appendChild(progressBar);

      /// Συνάρτηση για την κίνηση της μπάρας
      // Συνάρτηση για την κίνηση της μπάρας
      // Συνάρτηση για την κίνηση της μπάρας
      window.resetProgressBar = function(force = false) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        
        if (document.body.classList.contains('lb-active')) return;
        
        // Αν ΔΕΝ έχουμε κάνει force, ελέγχουμε το hover. 
        if (!force) {
          // Η ΛΥΣΗ: Ελέγχουμε το hover ΜΟΝΟ αν ΔΕΝ είμαστε σε κινητό!
          if (!isTouchDevice && container.matches(':hover')) return;
        }
        
        setTimeout(() => {
          // Η μπάρα διαβάζει τα δευτερόλεπτα (7 ή 5) ανάλογα με το link
          let durationSecs = (slides[index] && slides[index].el.href.includes("/2026/06/12.html")) ? 8 : 5;
          progressBar.style.transition = `width ${durationSecs}s linear`;
          progressBar.style.width = '100%';
        }, 50);
      }

      entries.forEach((entry, idx) => {
        const linkObj = (entry.link || []).find(l => l.rel === "alternate");
        const href = linkObj ? linkObj.href : "#";
        const title = entry.title?.$t || "Άρθρο";
        const content = entry.content?.$t || "";
        const imgs = extractImagesFromHtml(content); 
      // Πιο ισχυρός καθαρισμός κειμένου (Snippet)
const tempDiv = document.createElement("div");
tempDiv.innerHTML = content;
const styles = tempDiv.getElementsByTagName('style');
while (styles[0]) styles[0].parentNode.removeChild(styles[0]);
const scripts = tempDiv.getElementsByTagName('script');
while (scripts[0]) scripts[0].parentNode.removeChild(scripts[0]);

// ΝΕΟ: Εντοπίζουμε τα links και τα "μαρκάρουμε" με ειδικά σύμβολα
// πριν το textContent τα καταστρέψει
const links = tempDiv.querySelectorAll('a');
links.forEach(a => {
    // Κρατάμε το κείμενο του συνδέσμου ανάμεσα σε 3 αγκύλες π.χ. [[[Πατήστε εδώ]]]
    if (a.innerText.trim() !== "") {
        a.outerHTML = `[[[${a.innerText}]]]`;
    }
});

let fullText = tempDiv.textContent || tempDiv.innerText || "";
fullText = fullText.replace(/\s+/g, ' ').trim();

// === ΝΕΑ ΛΟΓΙΚΗ: Χωρίζουμε το κείμενο σε "Σελίδες" των 140 χαρακτήρων ===
// Ορισμός μεγέθους κειμένου: 300 χαρακτήρες για μεγάλες οθόνες, 71 για μικρές
let chunkSize = 68; 
if (window.innerWidth > 900) {
    chunkSize = 330; 
} 
const textChunks = [];

if (fullText.length === 0) {
    textChunks.push("Δεν υπάρχει κείμενο σε αυτή την ανακοίνωση.");
} else if (fullText.length <= chunkSize) {
    // ΚΑΛΗ ΛΕΙΤΟΥΡΓΙΑ: Αν χωράει όλο, μπαίνει ως έχει ΧΩΡΙΣ αποσιωπητικά
    textChunks.push(fullText.trim());
} else {
    let i = 0;
    while (i < fullText.length) {
        // Αν το υπόλοιπο κείμενο χωράει στο τρέχον chunk (τελευταία σελίδα)
        if (i + chunkSize >= fullText.length) {
            textChunks.push(fullText.substring(i).trim());
            break;
        }

        let sliceEnd = i + chunkSize;
        let lastSpace = fullText.lastIndexOf(' ', sliceEnd);

        if (lastSpace > i) {
            // Κόψιμο σε ολόκληρη λέξη + αποσιωπητικά αφού υπάρχει κι άλλο κείμενο
            textChunks.push(fullText.substring(i, lastSpace).trim() + "...");
            i = lastSpace + 1;
        } else {
            // Αναγκαστικό κόψιμο αν είναι λέξη-μαμούθ
            textChunks.push(fullText.substring(i, sliceEnd).trim() + "...");
            i = sliceEnd;
        }
    }
}

const slide = document.createElement("a");
slide.href = href;
slide.rel = "noopener";
slide.className = "slide";
slide.draggable = false;
slide.ondragstart = (e) => e.preventDefault(); 
 // Αν είναι η καρφιτσωμένη ανάρτηση, της προσθέτουμε μια ειδική κλάση για το CSS
if (href.includes("/2026/06/12.html")) {
    slide.classList.add("pinned-contain");
}      
const imgEl = document.createElement("img");
handleImageFallback(imgEl);
imgEl.src = upscaleImgUrl(imgs[0]);
imgEl.alt = title;
imgEl.draggable = false;
imgEl.ondragstart = (e) => e.preventDefault();
slide.appendChild(imgEl); 

// Έλεγχος: Αν είναι η καρφιτσωμένη, ΜΗΝ βάλεις ταμπελάκι. 
// Αν δεν είναι, έλεγξε αν ανήκει στις 5 πρώτες πραγματικές αναρτήσεις (idx < 6).
if (href.includes("/2026/06/12.html")) {
    // Είναι η καρφιτσωμένη, δεν κάνουμε τίποτα (προσπερνιέται)
} else if (idx < 6) {
    const badge = document.createElement("div");
    badge.className = "new-badge";
    badge.textContent = "Νέα";
    slide.appendChild(badge); 
}
        
const caption = document.createElement("div");
caption.className = "slide-title";

// Προσθήκη Τίτλου
const titleEl = document.createElement("strong");
titleEl.textContent = title;
caption.appendChild(titleEl);

// === Προσθήκη Container για Κείμενο & Βελάκια ===
const descContainer = document.createElement("div");
descContainer.className = "slide-desc-container";

const descEl = document.createElement("div");
descEl.className = "slide-desc";
// Συνάρτηση που μετατρέπει τα σημαδάκια σε ψεύτικους συνδέσμους
const formatFakeLinks = (text) => {
    return text.replace(/\[\[\[(.*?)\]\]\]/g, '<span class="fake-link">$1</span>')
               .replace(/\[\[\[/g, '') // Καθάρισμα αν το κείμενο κόπηκε στη μέση του συνδέσμου
               .replace(/\]\]\]/g, '');
};

// Αντί για textContent βάζουμε innerHTML για να δουλέψει το <span>
descEl.innerHTML = formatFakeLinks(textChunks[0]);
descContainer.appendChild(descEl);

// Αν το κείμενο έχει πάνω από 1 "σελίδα", φτιάχνουμε τα βελάκια
if (textChunks.length > 1) {
    const paginationControls = document.createElement("div");
    paginationControls.className = "snippet-pagination";

    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "&#10094;"; // Βελάκι Αριστερά
    prevBtn.className = "snippet-btn disabled"; 

    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "&#10095;"; // Βελάκι Δεξιά
    nextBtn.className = "snippet-btn";

    let currentChunk = 0;

    const updateSnippet = () => {
        descEl.innerHTML = formatFakeLinks(textChunks[currentChunk]);
        // Ενεργοποίηση/Απενεργοποίηση των κουμπιών
        if (currentChunk === 0) prevBtn.classList.add("disabled");
        else prevBtn.classList.remove("disabled");
        
        if (currentChunk === textChunks.length - 1) nextBtn.classList.add("disabled");
        else nextBtn.classList.remove("disabled");
    };
// --- SWIPE ΓΙΑ ΤΟ ΚΕΙΜΕΝΟ ---
    let textStartX = 0;
    descContainer.addEventListener('touchstart', (e) => {
        textStartX = e.touches[0].clientX;
        e.stopPropagation(); // Κλειδώνει το swipe μόνο στο κείμενο
    }, {passive: true});

    descContainer.addEventListener('touchend', (e) => {
        let diff = textStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0 && currentChunk < textChunks.length - 1) currentChunk++;
            else if (diff < 0 && currentChunk > 0) currentChunk--;
            updateSnippet();
            e.stopPropagation();
        }
    }, {passive: true});
    // ----------------------------
    prevBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        e.stopPropagation(); // Σταματάει το κλικ από το να ανοίξει την ανάρτηση
        if (currentChunk > 0) { 
            currentChunk--; 
            updateSnippet(); 
        }
    });

    nextBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        e.stopPropagation(); // Σταματάει το κλικ από το να ανοίξει την ανάρτηση
        if (currentChunk < textChunks.length - 1) { 
            currentChunk++; 
            updateSnippet(); 
        }
    });

    paginationControls.appendChild(prevBtn);
    paginationControls.appendChild(nextBtn);
    descContainer.appendChild(paginationControls);
}

caption.appendChild(descContainer);

// Έλεγχος για διπλό πάτημα στον τίτλο (μόνο για κινητά/τάμπλετ)
// Έλεγχος για διπλό πάτημα στον τίτλο και ενεργοποίηση της παύσης (για κινητά)
let lastClick = 0;
// Έλεγχος για πάτημα στον τίτλο
caption.addEventListener('click', (e) => {
  if (isTouchDevice || window.innerWidth <= 868) {
    
    if (wasDragged) return; 

    if (!isPausedByTitle) {
      e.preventDefault(); 
      e.stopPropagation();
      isPausedByTitle = true;
      
      // ΠΡΟΣΘΗΚΗ: Σταματάμε εντελώς το αόρατο χρονόμετρο στο παρασκήνιο!
      if (window.pauseSmartTimer) window.pauseSmartTimer();

      const pBar = document.getElementById('progress-bar');
      if (pBar) {
        pBar.style.transition = 'none';
        pBar.style.width = '100%';
      }
    } 
    else if (e.target.closest('.snippet-btn')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
});
// === ΑΡΧΗ: ΕΝΣΩΜΑΤΩΣΗ FLOATING REACTIONS ΕΔΩ ===
try {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2gHWrrA3A0MjsQLz30e3NFSpr6BzorfRf08ZR_v5of87VcgQjNSJJ_Re0ivyZYcLTxA/exec";
  let postId = "";
  if (href) {
    postId = new URL(href).pathname;
  }

  if (postId && postId.length > 3) {
    const reactionsDiv = document.createElement("div");
    reactionsDiv.className = "floating-reactions";
    
    const hasVoted = localStorage.getItem('feedback_' + postId);
    if (hasVoted) reactionsDiv.classList.add('voted');

    reactionsDiv.innerHTML = `
      <button class="floating-btn" data-type="love"><span>❤️</span><span class="count-love">0</span></button>
      <button class="floating-btn" data-type="funny"><span>😂</span><span class="count-funny">0</span></button>
      <button class="floating-btn" data-type="wow"><span>😮</span><span class="count-wow">0</span></button>
    `;

    const btns = reactionsDiv.querySelectorAll('.floating-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 1. Αν έχει ήδη πατηθεί, αγνοούμε εντελώς το κλικ
        if (reactionsDiv.classList.contains('is-voting') || reactionsDiv.classList.contains('voted')) {
            return;
        }

        // 2. ΑΚΑΡΙΑΙΟ ΚΛΕΙΔΩΜΑ
        reactionsDiv.classList.add('is-voting');
        reactionsDiv.classList.add('voted');
        reactionsDiv.style.pointerEvents = 'none';

        // 3. Αποθηκεύουμε στη μνήμη ΑΜΕΣΩΣ (πριν καν μιλήσουμε με τον server)
        localStorage.setItem('feedback_' + postId, 'voted');

        let type = btn.getAttribute('data-type');
        let countSpan = btn.querySelector('span:last-child');
        
        // 4. Αυξάνουμε τον αριθμό +1 τοπικά, για να δει ο χρήστης αμέσως αποτέλεσμα (Optimistic Update)
        let currentCount = parseInt(countSpan.innerText) || 0;
        countSpan.innerText = currentCount + 1;

        // 5. Στέλνουμε το αίτημα στο background
        fetch(`${SCRIPT_URL}?postId=${encodeURIComponent(postId)}&emoji=${type}`, {
            method: 'GET',
            keepalive: true // ΣΩΤΗΡΙΟ: Το αίτημα φεύγει ακόμα κι αν ο χρήστης ανανεώσει τη σελίδα!
        })
          .then(r => r.json())
          .then(d => {
            // Όταν απαντήσει ο server, βάζουμε το πραγματικό νούμερο
            countSpan.innerText = d[type];
            reactionsDiv.classList.remove('is-voting');
          })
          .catch((err) => { 
            // Αν κάτι πάει στραβά, αφαιρούμε το is-voting αλλά το αφήνουμε voted για να μην έχουμε spam
            reactionsDiv.classList.remove('is-voting');
            console.error("Σφάλμα:", err);
          });
      });
    });

    fetch(`${SCRIPT_URL}?postId=${encodeURIComponent(postId)}&nocache=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        reactionsDiv.querySelector('.count-love').innerText = d.love || 0;
        reactionsDiv.querySelector('.count-funny').innerText = d.funny || 0;
        reactionsDiv.querySelector('.count-wow').innerText = d.wow || 0;
      }).catch(() => {});

    slide.appendChild(reactionsDiv);

    // --- ΔΙΟΡΘΩΜΕΝΟ: ΑΥΤΟΜΑΤΟ ΚΡΥΨΙΜΟ REACTIONS ΣΤΑ ΚΙΝΗΤΑ ---
    if (isTouchDevice || window.innerWidth <= 1468) {
        let hideTimer;
        
        const startTimeout = () => {
            clearTimeout(hideTimer);
            reactionsDiv.classList.remove('hidden-reactions'); // Τα εμφανίζουμε
            hideTimer = setTimeout(() => {
                reactionsDiv.classList.add('hidden-reactions'); // Τα κρύβουμε μετά από 7δ
            }, 5400);
        };

        // Ξεκινάμε τον timer με το που δημιουργούνται
        startTimeout();

        // Επανεμφάνιση με άγγιγμα οπουδήποτε στην οθόνη
        // Χρησιμοποιούμε {passive: true} για απόδοση
        document.addEventListener('touchstart', startTimeout, { passive: true });
    }
  }
} catch(e) { console.error("Reactions error:", e); }
// === ΤΕΛΟΣ: FLOATING REACTIONS ===
slide.appendChild(caption);
        // Έλεγχος: Εμφάνισε το εικονίδιο αν υπάρχουν 3+ εικόνες Ή αν υπάρχει έστω 1 βίντεο YouTube
        const hasVideo = imgs.some(src => src.includes('img.youtube.com') || src.includes('facebook.com/plugins/video'));

        if (imgs.length >= 2 || hasVideo) {
          const zoomIcon = document.createElement("div");
          zoomIcon.className = "zoom-icon";
          
          // Αν η ανάρτηση έχει βίντεο, βάλε το εικονίδιο Play (▶️), αλλιώς τον Φακό (🔍)
          zoomIcon.innerHTML = hasVideo ? "▶️" : "🔍"; 
          zoomIcon.title = hasVideo ? "Αναπαραγωγή βίντεο" : "Προβολή όλων των εικόνων (" + imgs.length + ")";
          
          // Όταν πατάμε το εικονίδιο, ανοίγει το Lightbox
          zoomIcon.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            openLightbox(imgs);
          });
          slide.appendChild(zoomIcon);
        }
        container.appendChild(slide);
        slides.push({ el: slide, imgs });
      });
        
      if (slides.length === 0) {
        container.innerHTML = '<div class="no-images">Δεν βρέθηκαν αναρτήσεις.</div>';
        return;
      }
      
      let index = 0;
      let imgIndex = 0;
      slides[index].el.classList.add("active");
      
      // Αρχική εκκίνηση της μπάρας προόδου
      resetProgressBar();
      
      function nextSlide(force = false) {
        // Ορισμός του τρέχοντος slide
        const current = slides[index];

        // Έλεγχος αν το slider είναι παγωμένο από τον τίτλο
        if (isPausedByTitle) {
          progressBar.style.transition = 'none';
          progressBar.style.width = '100%';
          return;
        }

        // Αλλαγή slide: Πηγαίνουμε ΠΑΝΤΑ στην επόμενη ανάρτηση
        current.el.classList.remove("active");
        index = (index + 1) % slides.length;
        imgIndex = 0; // Επαναφορά στην πρώτη εικόνα της νέας ανάρτησης

        const next = slides[index];
        const nextImg = next.el.querySelector("img");
        if (nextImg && next.imgs.length > 0) {
          handleImageFallback(nextImg);
          nextImg.src = upscaleImgUrl(next.imgs[0]);
        }
        next.el.classList.add("active");
        resetProgressBar(force);
      }

      function prevSlide(force = false) {
        // Έλεγχος αν το slider είναι παγωμένο από τον τίτλο (για την αφή)
        if (isPausedByTitle) {
          progressBar.style.transition = 'none';
          progressBar.style.width = '100%';
          return;
        }

        // Ορισμός του τρέχοντος slide
        const current = slides[index];
        
        // Αλλαγή slide: Πηγαίνουμε ΠΑΝΤΑ στην προηγούμενη ανάρτηση
        current.el.classList.remove("active");
        index = (index - 1 + slides.length) % slides.length;
        imgIndex = 0; // Επαναφορά στην πρώτη εικόνα

        const prev = slides[index];
        const prevImg = prev.el.querySelector("img");
        if (prevImg && prev.imgs.length > 0) {
          handleImageFallback(prevImg);
          prevImg.src = upscaleImgUrl(prev.imgs[0]);
        }
        prev.el.classList.add("active");
        resetProgressBar(force);
      }

      // === ΝΕΟΣ ΕΞΥΠΝΟΣ ΧΡΟΝΟΔΙΑΚΟΠΤΗΣ ===
      function startSmartTimer() {
        // Ελέγχει αν είναι η συγκεκριμένη ανάρτηση για να δώσει 7000ms (7s) αντί για 5000ms (5s)
        let duration = (slides[index] && slides[index].el.href.includes("/2026/06/12.html")) ? 8000 : 5000;
        
        return setTimeout(() => {
          nextSlide();
          slideInterval = startSmartTimer(); // Κάνει λούπα τον εαυτό του
        }, duration);
      }

     let slideInterval = startSmartTimer();

      // Παγκόσμιες συναρτήσεις για να μπορεί το κλικ εκτός slider να ελέγχει τον χρόνο
      window.restartSmartTimer = function() {
        clearInterval(slideInterval);
        slideInterval = startSmartTimer();
      };
      
      window.pauseSmartTimer = function() {
        clearInterval(slideInterval);
      };

      // --- ΣΥΣΤΗΜΑ ΒΕΛΩΝ (ARROWS) ---

      // --- ΣΥΣΤΗΜΑ ΒΕΛΩΝ (ARROWS) ---
      const prevArrow = document.createElement('button');
      prevArrow.className = 'slider-arrow left';
      prevArrow.innerHTML = '&#10094;'; 
      prevArrow.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        clearInterval(slideInterval);
       isPausedByTitle = false;
        
        // Αν είμαστε σε κινητό, αγνοούμε εντελώς τη λογική του hover
        const isHovered = !isTouchDevice && container.matches(':hover');
        
        prevSlide(!isHovered);
        
        if (!isHovered) {
            slideInterval = startSmartTimer();
        }
        showArrows(); 
      };

      const nextArrow = document.createElement('button');
      nextArrow.className = 'slider-arrow right';
      nextArrow.innerHTML = '&#10095;'; 
      nextArrow.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearInterval(slideInterval);
        isPausedByTitle = false;
        
        const isHovered = !isTouchDevice && container.matches(':hover');
        
        nextSlide(!isHovered);
        
        if (!isHovered) {
            slideInterval = startSmartTimer();
        }
        showArrows();
      };

      container.appendChild(prevArrow);
      container.appendChild(nextArrow);

      let arrowTimeout;
      function showArrows() {
        container.classList.add('show-arrows');
        clearTimeout(arrowTimeout);
        arrowTimeout = setTimeout(() => {
          container.classList.remove('show-arrows');
        }, 3000);
      }

      showArrows();
/* === ΠΡΟΣΘΗΚΗ: ΕΜΦΑΝΙΣΗ ΒΕΛΩΝ ΜΕ SCROLL & ΚΛΙΚ ΠΑΝΤΟΥ === */
const triggerArrowsGlobal = () => {
    // Καλούμε την ήδη υπάρχουσα συνάρτηση showArrows που έχεις ορίσει
    if (typeof showArrows === 'function') {
        showArrows();
    }
};

// 1. Εμφάνιση με το Scroll
window.addEventListener('scroll', triggerArrowsGlobal, { passive: true });

// 2. Εμφάνιση με κλικ ή tap σε όλη τη σελίδα
document.addEventListener('mousedown', (e) => {
    // Ελέγχουμε αν το κλικ ΔΕΝ έγινε πάνω στα ίδια τα βέλη για να μην έχουμε διπλά events
    if (!e.target.closest('.slider-arrow')) {
        triggerArrowsGlobal();
    }
});

// 3. Εμφάνιση με άγγιγμα (touch) για κινητά
document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.slider-arrow')) {
        triggerArrowsGlobal();
    }
}, { passive: true });
// 4. Εμφάνιση με την κίνηση του ποντικιού οπουδήποτε στη σελίδα
document.addEventListener('mousemove', () => {
    // Το περιορίζουμε μόνο για υπολογιστές, ώστε να μην μπερδεύει τα κινητά
    if (!isTouchDevice) {
        triggerArrowsGlobal();
    }
}, { passive: true });
      // --- ΔΙΑΧΕΙΡΙΣΗ HOVER (ΜΟΝΟ ΓΙΑ ΠΟΝΤΙΚΙ) ---
      container.addEventListener('mouseenter', () => {
        if (isTouchDevice) return; // Τα κινητά δεν έχουν παραδοσιακό hover
        clearInterval(slideInterval);
        showArrows();
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
      });

      container.addEventListener('mousemove', () => {
        if (!isTouchDevice) showArrows();
      });

      container.addEventListener('mouseleave', () => {
        if (isTouchDevice || document.body.classList.contains('lb-active')) return; 
        
        if (isDragging) {
           isDragging = false;
           let swiped = handleSwipe();
           clearInterval(slideInterval);
           if (!isPausedByTitle) {
               slideInterval = startSmartTimer();
               if (!swiped) resetProgressBar();
           }
        } else {
           clearInterval(slideInterval);
           if (!isPausedByTitle) {
               slideInterval = startSmartTimer();
               resetProgressBar(); 
           }
        }
      });

      // --- ΣΥΣΤΗΜΑ SWIPE & DRAG ---
      let startX = 0;
      let endX = 0;
      let isDragging = false;
      let wasDragged = false;

      function handleSwipe() {
        if (endX === 0) {
          wasDragged = false; 
          return false;
        }
        
        let diff = startX - endX;
        let didSwipe = false; 
        
        if (Math.abs(diff) > 40) {
          wasDragged = true;
          didSwipe = true;
          if (diff > 0) nextSlide(true); // Πάντα force=true στο swipe
          else prevSlide(true);
        } else {
          wasDragged = false;
        }
        
        endX = 0; 
        return didSwipe;
      }

      // -- EVENTS ΓΙΑ ΚΙΝΗΤΑ (TOUCH) --
      container.addEventListener('touchstart', (e) => {
        isTouchDevice = true;
        wasDragged = false; 
        startX = e.touches[0].clientX;
        endX = 0;
        showArrows();
        clearInterval(slideInterval);
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
      }, {passive: true});

      container.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
      }, {passive: true});

      container.addEventListener('touchend', () => {
        let swiped = handleSwipe(); 
        
        clearInterval(slideInterval);
        
        // Αν το slider είναι παγωμένο επειδή διαβάζεις, ΔΕΝ ξεκινάμε τον χρόνο!
        if (!isPausedByTitle) {
            slideInterval = startSmartTimer();
            resetProgressBar(true); 
        }
      });
      // -- EVENTS ΓΙΑ ΥΠΟΛΟΓΙΣΤΗ (MOUSE) --
      container.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || isTouchDevice) return;
      isPausedByTitle = false;
        wasDragged = false; 
        isDragging = true;
        startX = e.clientX;
        endX = 0;
        clearInterval(slideInterval);
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        endX = e.clientX;
      });

      container.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        let swiped = handleSwipe();
        
        clearInterval(slideInterval);
        
        const isHovered = container.matches(':hover');
        
        if (!isHovered) {
          slideInterval = startSmartTimer();
        }
        
        if (swiped) {
          resetProgressBar(!isHovered);
        } else {
          if (!isHovered) {
            resetProgressBar();
          }
        }
      });

      // Αντικατάσταση του παλιού click listener (Η δική σου λειτουργία προστασίας)
      container.addEventListener('click', (e) => {
        if (wasDragged) {
          e.preventDefault();
          e.stopPropagation(); 
          wasDragged = false;
        }
      }, true); 
// === ΛΟΓΙΚΗ LIGHTBOX ===
const lightbox = document.getElementById('custom-lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbVideo = document.getElementById('lightbox-video');
const lbClose = document.querySelector('.lightbox-close');
const lbPrev = document.querySelector('.lightbox-prev');
const lbNext = document.querySelector('.lightbox-next');
const lbCounter = document.querySelector('.lightbox-counter');

// Νέες μεταβλητές για Λήψη και Μικρογραφίες
const lbDownload = document.getElementById('lightbox-download');
const lbThumbnailsContainer = document.querySelector('.lightbox-thumbnails');

let lbImages = [];
let lbIndex = 0;

function updateLightbox() {
  if (lbImages.length > 0) {
    let currentSrc = lbImages[lbIndex];
    let ytMatch = currentSrc.match(/img\.youtube\.com\/vi\/([a-zA-Z0-9_-]{11})/);
    let isFb = currentSrc.includes('facebook.com/plugins/video'); // ΝΕΟ
    
    if (ytMatch && ytMatch[1]) {
      // YouTube
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
      lbDownload.style.display = 'none'; 
    } else if (isFb) {
      // ΝΕΟ: Facebook Βίντεο
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = currentSrc; // Φορτώνει απευθείας το Facebook iframe
      lbDownload.style.display = 'none';
    } else {
      // Εικόνα
      lbVideo.style.display = 'none';
      lbVideo.src = "";  
      lbImg.style.display = 'block';
      lbImg.src = currentSrc;
      lbDownload.style.display = 'block';

      // Λειτουργία Force Download (Άμεση Λήψη)
      lbDownload.onclick = (e) => {
        e.preventDefault();
        fetch(currentSrc)
          .then(res => res.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'sxoleio_photo.jpg'; 
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(() => window.open(currentSrc, '_blank')); // Αν αποτύχει, ανοίγει σε νέα καρτέλα
      };
    }
    
    lbCounter.textContent = (lbIndex + 1) + " από " + lbImages.length;

    // Ενημέρωση ενεργής μικρογραφίας (Thumbnails)
    const thumbs = lbThumbnailsContainer.querySelectorAll('.thumb-img');
    thumbs.forEach((thumb, idx) => {
      if (idx === lbIndex) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }
}

window.openLightbox = function(imagesArray) {
  document.body.classList.add('lb-active'); 
  document.body.style.overflow = 'hidden'; 
  if (typeof slideInterval !== 'undefined') clearInterval(slideInterval);
  
  const pBar = document.getElementById('progress-bar');
  if (pBar) {
    pBar.style.transition = 'none';
    pBar.style.width = '0%';
  }
  
lbImages = imagesArray.map(img => img.includes('facebook.com') ? img : upscaleImgUrl(img));
  lbIndex = 0;
  
  lbThumbnailsContainer.innerHTML = ''; 
  
  lbImages.forEach((src, idx) => {
    const thumb = document.createElement('img');
    thumb.className = 'thumb-img';
    
    let videoId = null;
    let isFb = src.includes('facebook.com/plugins/video');
    const match = src.match(/(?:embed\/|v=|youtu\.be\/|vi\/)([a-zA-Z0-9_-]{11})/);
    
    if (match && match[1] && !isFb) {
        videoId = match[1];
    }

    if (videoId) {
        // YouTube thumbnail
        thumb.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else if (isFb) {
        // ΝΕΟ: Facebook thumbnail (Βάζει τυχαία μια από τις 4 βασικές εικόνες)
        thumb.src = getRandomDefaultImg();
    } else {
        // Κανονική εικόνα
        thumb.src = src;
    }

    thumb.onclick = (e) => {
      e.stopPropagation();
      lbIndex = idx;
      updateLightbox();
    };
    
    lbThumbnailsContainer.appendChild(thumb);

    // Προφόρτωση μόνο αν είναι κανονική εικόνα
    if (!videoId) {
      const preloadedImg = new Image();
      preloadedImg.src = src;
    }
  });
  
  updateLightbox();
  lightbox.classList.add('active');
};

// --- ΣΥΣΤΗΜΑ SWIPE ΚΑΙ ΕΛΕΓΧΟΣ LIGHTBOX ---
let lbStartX = 0;
let lbEndX = 0;
lightbox.addEventListener('touchstart', (e) => { lbStartX = e.touches[0].clientX; }, {passive: true});
lightbox.addEventListener('touchmove', (e) => { lbEndX = e.touches[0].clientX; }, {passive: true});
lightbox.addEventListener('touchend', () => {
  if (lbEndX === 0) return;
  let diff = lbStartX - lbEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) lbNext.click(); 
    else lbPrev.click();
  }
  lbEndX = 0;
});

lbClose.onclick = () => {
  lightbox.classList.remove('active');
  document.body.classList.remove('lb-active');
  document.body.style.overflow = ''; // <-- ΠΡΟΣΤΕΘΗΚΕ: Επαναφέρει το scroll της σελίδας
  lbVideo.src = ""; 
  slideInterval = startSmartTimer();
  resetProgressBar();
};

lbNext.onclick = (e) => {
  e.stopPropagation();
  lbIndex = (lbIndex + 1) % lbImages.length;
  updateLightbox();
};

lbPrev.onclick = (e) => {
  e.stopPropagation();
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  updateLightbox();
};

lightbox.onclick = (e) => {
  if (e.target === lightbox) lbClose.onclick();
};
// Μεταβλητή για το χρονόμετρο του Lightbox
let lbIdleTimeout;

function resetLightboxIdle() {
    // Επιλέγουμε τα βελάκια και τον counter (προαιρετικά)
    const controls = [lbPrev, lbNext, lbCounter, lbClose];
    
    // Εμφάνιση των στοιχείων (αφαιρούμε την κλάση απόκρυψης)
    controls.forEach(el => {
        if (el) el.classList.remove('lb-hidden');
    });

    // Καθαρισμός του προηγούμενου timer
    clearTimeout(lbIdleTimeout);

    // Αν το lightbox είναι ανοιχτό, ξεκινάμε την αντίστροφη μέτρηση
    if (lightbox.classList.contains('active')) {
        lbIdleTimeout = setTimeout(() => {
            controls.forEach(el => {
                if (el) el.classList.add('lb-hidden');
            });
        }, 3000); // 3 δευτερόλεπτα
    }
}

// Παρακολούθηση κινήσεων ΜΟΝΟ πάνω στο Lightbox
['mousemove', 'touchstart', 'click'].forEach(evt => {
    lightbox.addEventListener(evt, resetLightboxIdle, { passive: true });
});
// <-- ΠΡΟΣΤΕΘΗΚΕ: Έλεγχος Πληκτρολογίου (ESC & Βελάκια)
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') lbClose.onclick();
  if (e.key === 'ArrowRight') lbNext.onclick(e);
  if (e.key === 'ArrowLeft') lbPrev.onclick(e);
});
// Έλεγχος αν ο χρήστης έκανε κλικ μέσα στο βίντεο του Lightbox (YouTube/Facebook)
setInterval(function() {
    // Ελέγχει αν το iframe είναι ΣΥΓΚΕΚΡΙΜΕΝΑ το lightbox-video, αφήνοντας το AI ήσυχο!
    if (document.activeElement && document.activeElement.id === 'lightbox-video') {
        resetLightboxIdle(); // Εμφανίζουμε τα βέλη
        window.focus(); // Παίρνουμε πίσω το focus
    }
}, 500);

// Κλείσιμο του fetch feed data
    })
    .catch(err => {
      console.error("Σφάλμα φόρτωσης feed:", err);
      container.innerHTML = '<div class="no-images">Σφάλμα φόρτωσης αναρτήσεων.</div>';
    });
});
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    const body = document.body;
    if (!nav) return;

    // Τέρμα τα if (window.innerWidth). 
    // Η συνάρτηση θα βάζει την κλάση ΠΑΝΤΑ. 
    // Το αν θα φαίνεται fixed ή όχι, θα το αποφασίζει το CSS.
    if (window.pageYOffset > 350) { 
        nav.classList.add('nav-fixed');
        body.classList.add('nav-is-fixed');
    } else {
        nav.classList.remove('nav-fixed');
        body.classList.remove('nav-is-fixed');
    }
});
</script>
<script>
(function() {
    let idleTimeout;

    function resetIdleTimer() {
        const nav = document.querySelector('nav'); 
        if (nav) nav.classList.remove('nav-hidden-active');

        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            const navToHide = document.querySelector('.nav-fixed');
            if (navToHide) navToHide.classList.add('nav-hidden-active');
        }, 2000);
    }

    // Παρακολούθηση κίνησης
    ['mousemove', 'scroll', 'touchstart', 'keydown'].forEach(evt => 
        window.addEventListener(evt, resetIdleTimer, { passive: true })
    );

    // ΤΟ ΚΛΙΚ ΠΟΥ ΚΑΘΑΡΙΖΕΙ ΤΟ ΟΡΦΑΝΟ
    document.addEventListener('click', (e) => {
        const nav = document.querySelector('nav');
        // Αν το κλικ είναι ΕΞΩ από το μενού
        if (nav && !nav.contains(e.target)) {
            const dropdowns = document.querySelectorAll('.dropdown-content, .sub-dropdown-content');
            dropdowns.forEach(d => {
                d.style.display = 'none'; // Κλείνει ακαριαία
                setTimeout(() => { d.style.display = ''; }, 100); // Επανέρχεται η δυνατότητα hover
            });
            resetIdleTimer(); // Εμφανίζει ξανά τη μπάρα αφού υπήρξε δραστηριότητα
        }
    });

    resetIdleTimer();
})();
