(() => {
  "use strict";
const CONFIG = Object.freeze({
    maxBasePosts: 15,
    targetDate: new Date("2021-09-11T00:00:00Z"),
    autoSlideIntervalMs: 3000, 
    animLockMs: 500,
    
    feedPopularUrl: "/feeds/posts/default/-/" + encodeURIComponent("δημοφιλή") + "?alt=json&max-results=15",
  feedLabelsUrl: "/feeds/posts/default/-/" + "Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι|Γενικά".split('|').map(encodeURIComponent).join('|') + "?alt=json&max-results=50",
    
    safeImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdYTGP-KF_2ZHc7ykgjO533JVSDXYPsg36Oi3XC0Z6UN-yEKAhpbsK5PME3r9Q_WeAXn-c20sWAmLR65slEVQSaYaDVKLuYQtaqbjuGyH71VxJxgZqWx5vG1JSCOFlqWswSphTn6Zup1d8Uz9Ie2Tq9CQeHmWBPusLJ7rc_bPJkiau4W47iSy6cSp60N4/s800/Gemini_Generated_Image_1itzx51itzx51itz.png"
    // (Τα στατικά IDs διαγράφηκαν γιατί τα βρίσκει αυτόματα!)
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
      const content = entry.content ? entry.content.$t : "";

      try {
       const ytRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/(?:shorts\/|[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        const ytMatch = content.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
          return { imageUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`, isVideo: true };
        }

        const imgRegex = /<img[^>]+src="([^"]+)"/i;
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
          imageUrl = entry.media$thumbnail.url.replace(/\/s72-c\//, '/s800/').replace(/=s72-c/, '=s800');
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
      // Σταθερός διαιρέτης: Το άρθρο μένει ίδιο όλη την εβδομάδα
      const weeklyPick = candidates[weekNum % DATA.candidatePostsFor16.length];

      const weeklyPostObj = {
        title: "⭐ " + weeklyPick.title,
        link: weeklyPick.link,
        image: weeklyPick.image || CONFIG.safeImage,
        isVideo: weeklyPick.isVideo || false
      };

      const targetIndex = Math.min(15, STATE.sliderPosts.length);
      STATE.sliderPosts.splice(targetIndex, 0, weeklyPostObj);

      if (STATE.sliderPosts.length > 16) {
        STATE.sliderPosts = STATE.sliderPosts.slice(0, 16);
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
        
        // 2. FIX Bug 8: Αποφυγή σπασίματος του HTML από εισαγωγικά στον τίτλο
        const safeTitle = post.title.replace(/"/g, '&quot;');

        slide.innerHTML = `
          <a href="${post.link}" class="slide-link">
            ${videoBadge}
            <div class="slide-counter">${index + 1} / ${STATE.sliderPosts.length}</div>
            <img src="${post.image}" alt="${safeTitle}" ${loadingAttr}>
            <div class="slide-title-wrapper">
              <div class="slide-title">${post.title}</div>
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
        if (arrowPrev) {
          arrowPrev.classList.remove('hidden-arrow');
          arrowPrev.onclick = (e) => { e.preventDefault(); moveSlide(-1); }; // Αντικατάσταση event listener με onclick
        }
        if (arrowNext) {
          arrowNext.classList.remove('hidden-arrow');
          arrowNext.onclick = (e) => { e.preventDefault(); moveSlide(1); };  // Αντικατάσταση event listener με onclick
        }
        
        startAutoSlide();

       wrapper.addEventListener("mouseenter", () => {
          localState.isHovered = true;
          clearInterval(localState.autoSlideTimer);
        }, { passive: true });
        
        wrapper.addEventListener("mouseleave", () => {
          localState.isHovered = false;
          resetAutoSlide();
        }, { passive: true });
        
       wrapper.addEventListener("touchstart", (e) => {
          clearInterval(localState.autoSlideTimer);
          localState.touchStartX = e.changedTouches[0].screenX;
          localState.touchStartY = e.changedTouches[0].screenY;
          localState.isSwiping = false; // Μηδενισμός σε κάθε άγγιγμα
        }, { passive: true });

        wrapper.addEventListener("touchend", (e) => {
          const diffX = localState.touchStartX - e.changedTouches[0].screenX;
          const diffY = localState.touchStartY - e.changedTouches[0].screenY;
          
          // ΕΛΕΓΧΟΣ: Αλλάζει ΜΟΝΟ αν η οριζόντια κίνηση (swipe) είναι μεγαλύτερη από την κάθετη (scroll)
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            localState.isSwiping = true;
            if (diffX > 0) moveSlide(1);    
            else moveSlide(-1); 
          }
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
