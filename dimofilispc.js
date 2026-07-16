(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION (Ρυθμίσεις Desktop)
  // ==========================================
  const CONFIG = Object.freeze({
    // Στο Desktop θέλουμε 15 βασικά άρθρα (συν 1 της εβδομάδας = 16)
    maxBasePosts: 15, 
    targetDate: new Date("2021-09-11T00:00:00Z"),
    autoSlideIntervalMs: 2000, // Αλλαγή κάθε 2 δευτερόλεπτα
    animLockMs: 500, // Κλείδωμα για spam κλικ στα βελάκια
    
    // Απευθείας URLs για τα JSON δεδομένα
    feedPopularUrl: "/feeds/posts/default/-/δημοφιλή?alt=json&max-results=15",
    feedLabelsUrl: "/feeds/posts/default/-/Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι|Γενικά?alt=json&max-results=50",
    
    safeImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdYTGP-KF_2ZHc7ykgjO533JVSDXYPsg36Oi3XC0Z6UN-yEKAhpbsK5PME3r9Q_WeAXn-c20sWAmLR65slEVQSaYaDVKLuYQtaqbjuGyH71VxJxgZqWx5vG1JSCOFlqWswSphTn6Zup1d8Uz9Ie2Tq9CQeHmWBPusLJ7rc_bPJkiau4W47iSy6cSp60N4/s800/Gemini_Generated_Image_1itzx51itzx51itz.png",
    sliderContainerId: "slider-content-desktop",
    sliderWrapperId: "custom-post-slider-desktop"
  });

  const DATA = Object.freeze({
    candidatePostsForExtraDesk: [
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

  // ==========================================
  // 2. STATE (Κατάσταση & Μνήμη)
  // ==========================================
  const STATE = {
    sliderPosts: [],
    currentIndex: 0,
    autoSlideTimer: null,
    isAnimating: false,
    touchStartX: 0
  };

  // ==========================================
  // 3. UTILITIES (Εργαλεία & Regex)
  // ==========================================
  const Utils = {
    extractMedia: (entry) => {
      let imageUrl = "";
      let isVideo = false;
      const content = entry.content ? entry.content.$t : "";

      try {
        const ytRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        const ytMatch = content.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
          return { imageUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`, isVideo: true };
        }

        const imgRegex = /<img[^>]+src="([^"]+)"/i;
        const imgMatch = content.match(imgRegex);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
          if (imageUrl.includes("blogger.googleusercontent.com") || imageUrl.includes("bp.blogspot.com")) {
            imageUrl = imageUrl.replace(/\/s[0-9]+(-b|-c|-w)?\//, '/s1600/').replace(/=w[0-9]+-h[0-9]+(-c)?/, '=s1600');
          }
          return { imageUrl, isVideo: false };
        }

        if (entry.media$thumbnail && entry.media$thumbnail.url) {
          imageUrl = entry.media$thumbnail.url.replace(/\/s72-c\//, '/s1600/').replace(/=s72-c/, '=s1600');
          return { imageUrl, isVideo: false };
        }
      } catch (err) {}

      return { imageUrl: CONFIG.safeImage, isVideo: false };
    },

    getLink: (entry) => {
      const linkObj = entry.link.find(l => l.rel === "alternate");
      return linkObj ? linkObj.href : "#";
    }
  };

  // ==========================================
  // 4. API MANAGER (Ασύγχρονη Λήψη)
  // ==========================================
  const ApiManager = {
    fetchData: async () => {
      try {
        const [popularRes, labelsRes] = await Promise.all([
          fetch(CONFIG.feedPopularUrl).then(r => r.json()),
          fetch(CONFIG.feedLabelsUrl).then(r => r.json())
        ]);

        ApiManager.processPopularPosts(popularRes);
        ApiManager.processWeeklyPick(labelsRes);
        
        SliderManager.buildDOM();
      } catch (error) {
        document.getElementById(CONFIG.sliderContainerId).innerHTML = 
          "<p style='text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;'>Σφάλμα φόρτωσης αναρτήσεων.</p>";
      }
    },

    processPopularPosts: (json) => {
      const entries = json.feed.entry || [];
      for (const entry of entries) {
        // Όριο τα 15 βασικά άρθρα
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
      let candidates = [...DATA.candidatePostsForExtraDesk];
      const entries = json.feed.entry || [];
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

      // Εισαγωγή στη 16η θέση (index 15) - Διόρθωσα τον αριθμό εδώ
      const targetIndex = Math.min(15, STATE.sliderPosts.length);
      STATE.sliderPosts.splice(targetIndex, 0, weeklyPostObj);

      // Περικοπή: Κρατάμε ΑΥΣΤΗΡΑ 16 άρθρα συνολικά - Διόρθωσα τον αριθμό εδώ
      if (STATE.sliderPosts.length > 16) {
        STATE.sliderPosts = STATE.sliderPosts.slice(0, 16);
      }
    }
  };

  // ==========================================
  // 5. SLIDER MANAGER (UI & DOM)
  // ==========================================
  const SliderManager = {
    buildDOM: () => {
      const container = document.getElementById(CONFIG.sliderContainerId);
      const wrapper = document.getElementById(CONFIG.sliderWrapperId);
      if (!container || !wrapper) return;

      const arrowPrev = wrapper.querySelector('.arrow-prev');
      const arrowNext = wrapper.querySelector('.arrow-next');

      if (STATE.sliderPosts.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις μετά τις 11/09/2021.</p>";
        if (arrowPrev) arrowPrev.classList.add('hidden-arrow');
        if (arrowNext) arrowNext.classList.add('hidden-arrow');
        return;
      }

      const fragment = document.createDocumentFragment();

      STATE.sliderPosts.forEach((post, index) => {
        const slide = document.createElement('div');
        slide.className = `slide-item ${index === 0 ? "active" : ""}`;
        
        const loadingAttr = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
        const videoBadge = post.isVideo ? `<div class="video-badge">&#9654;</div>` : "";

        slide.innerHTML = `
          <a href="${post.link}" class="slide-link">
            ${videoBadge}
            <div class="slide-counter">${index + 1} / ${STATE.sliderPosts.length}</div>
            <img src="${post.image}" alt="${post.title}" ${loadingAttr}>
            <div class="slide-title-wrapper">
              <div class="slide-title">${post.title}</div>
            </div>
          </a>
        `;
        fragment.appendChild(slide);
      });

      container.innerHTML = "";
      container.appendChild(fragment);

      if (STATE.sliderPosts.length > 1) {
        if (arrowPrev) arrowPrev.classList.remove('hidden-arrow');
        if (arrowNext) arrowNext.classList.remove('hidden-arrow');
        
        SliderManager.startAutoSlide();
        SliderManager.setupEvents(wrapper, arrowPrev, arrowNext);
      } else {
        if (arrowPrev) arrowPrev.classList.add('hidden-arrow');
        if (arrowNext) arrowNext.classList.add('hidden-arrow');
      }
    },

    showSlide: (index) => {
      const slides = document.querySelectorAll(`#${CONFIG.sliderWrapperId} .slide-item`);
      if (slides.length === 0) return;

      slides.forEach(slide => slide.classList.remove("active"));

      if (index >= STATE.sliderPosts.length) STATE.currentIndex = 0;
      else if (index < 0) STATE.currentIndex = STATE.sliderPosts.length - 1;
      else STATE.currentIndex = index;

      slides[STATE.currentIndex].classList.add("active");
    },

    moveSlide: (step) => {
      if (STATE.isAnimating) return;
      STATE.isAnimating = true;

      SliderManager.showSlide(STATE.currentIndex + step);
      SliderManager.resetAutoSlide();

      setTimeout(() => { STATE.isAnimating = false; }, CONFIG.animLockMs);
    },

    startAutoSlide: () => {
      clearInterval(STATE.autoSlideTimer);
      STATE.autoSlideTimer = setInterval(() => { 
        SliderManager.moveSlide(1); 
      }, CONFIG.autoSlideIntervalMs);
    },

    resetAutoSlide: () => {
      clearInterval(STATE.autoSlideTimer);
      if (STATE.sliderPosts.length > 1) SliderManager.startAutoSlide();
    },

    setupEvents: (wrapper, arrowPrev, arrowNext) => {
      if (arrowNext) arrowNext.addEventListener("click", () => SliderManager.moveSlide(1));
      if (arrowPrev) arrowPrev.addEventListener("click", () => SliderManager.moveSlide(-1));

      wrapper.addEventListener("mouseenter", () => clearInterval(STATE.autoSlideTimer), { passive: true });
      wrapper.addEventListener("mouseleave", SliderManager.resetAutoSlide, { passive: true });
      
      wrapper.addEventListener("touchstart", (e) => {
        clearInterval(STATE.autoSlideTimer);
        STATE.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      wrapper.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = STATE.touchStartX - touchEndX;
        
        if (diff > 40) SliderManager.moveSlide(1);    
        else if (diff < -40) SliderManager.moveSlide(-1); 
        
        SliderManager.resetAutoSlide();
      }, { passive: true });
    }
  };

  // ==========================================
  // 6. ΕΚΚΙΝΗΣΗ
  // ==========================================
  if (document.readyState === "loading") {
    // Αν η σελίδα ακόμα φορτώνει, περίμενε το DOMContentLoaded
    document.addEventListener("DOMContentLoaded", ApiManager.fetchData);
  } else {
    // Αν το script κατέβηκε αφού η σελίδα είχε ήδη φορτώσει, τρέξτο κατευθείαν
    ApiManager.fetchData();
  }


})();
