(() => {
  "use strict";
// ΛΥΣΗ ΝΕΟ BUG 3 (Μέρος Α): Φτιάχνουμε μια ανεξάρτητη συνάρτηση.
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
