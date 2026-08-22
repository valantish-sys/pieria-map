document.addEventListener("DOMContentLoaded", () => {
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
      // Προσθήκη cache: "no-store" και _cb timestamp. Αποτρέπει αυστηρά τους browsers 
      // να σερβίρουν "μπαγιάτικες" ειδήσεις από την προσωρινή τους μνήμη.
      const timestamp = Date.now();
      const feedUrl = `${config.blogUrl}/feeds/posts/default?alt=json&max-results=${config.maxPosts}&_cb=${timestamp}`;
      const response = await fetch(feedUrl, { cache: "no-store" });
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const entries = data?.feed?.entry;

    if (!entries || !entries.length) {
        tickerContainer.textContent = "Δεν βρέθηκαν αναρτήσεις.";
        if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
        return;
      }

      // ΛΥΣΗ BUG 5: Εγγυόμαστε ότι υπάρχουν τουλάχιστον 6 στοιχεία γεμίζοντας τα κενά (Loop fill),
      // για να μην ξεμείνει από κείμενο η οθόνη και εμφανιστούν τρύπες.
      while (entries.length > 0 && entries.length < 6) {
          entries.push(...entries.slice(0, 6 - entries.length));
      }

      const fragment = document.createDocumentFragment();

      // Προσοχή: Προσθέσαμε το 'index' στην παρένθεση
     // Προσοχή: Προσθέσαμε το 'index' στην παρένθεση
      entries.forEach((entry, index) => {
        const rawTitle = entry.title?.$t || "Χωρίς τίτλο";
        
        // Ασφαλής αποκωδικοποίηση συμβόλων του Blogger API (π.χ. &amp;). 
        // Γίνεται μέσω textarea για να μεταφραστούν τα σύμβολα χωρίς να ανοίξει τρύπα XSS.
        const txtDecoder = document.createElement("textarea");
        txtDecoder.innerHTML = rawTitle;
        const title = txtDecoder.value;
        const altLink = entry.link?.find(l => l.rel === "alternate");
        const linkHref = altLink?.href || config.fallbackLink;

        const anchor = document.createElement("a");
        anchor.href = linkHref;
        anchor.className = "unique-top-ticker-link"; 
        
     /* ===================================================
           ΝΕΟ ΚΟΛΠΟ: Βάζουμε το σύμβολο ΜΟΝΟ στο 1ο άρθρο
           =================================================== */
        if (index === 0) {
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

     // ΛΥΣΗ BUG 3: Περιμένουμε υποχρεωτικά τις γραμματοσειρές να φορτώσουν για σωστά μαθηματικά
      await document.fonts.ready;

      requestAnimationFrame(() => {
        // ΛΥΣΗ BUG 2: Fallback τιμές (1000px) αν το στοιχείο φορτώσει σε background tab (αποτροπή NaNs)
        const outerWidth = tickerOuter.clientWidth || 1000; 
        const totalScrollWidth = tickerContainer.scrollWidth || (outerWidth * 2); 
        const singleSetWidth = totalScrollWidth / 2; 

      // Ορίζουμε σταθερή ΤΑΧΥΤΗΤΑ (πόσα pixels θα διανύει ανά δευτερόλεπτο)
const speed = 60; // Παίξε με αυτό το νούμερο (π.χ. 50-80) μέχρι να πετύχεις τον ρυθμό που σου αρέσει

// Ο χρόνος πλέον υπολογίζεται αυτόματα ανάλογα με το μήκος των τίτλων!
const loopDuration = singleSetWidth / speed; 
const entranceDuration = outerWidth / speed;

        // Αποστολή ακριβούς πλάτους στο CSS (συνδέεται με το Bug 4 παρακάτω)
        tickerOuter.style.setProperty('--start-pos', `${outerWidth}px`);

        tickerContainer.style.animation = `
          ticker-entrance ${entranceDuration}s linear forwards, 
          ticker-loop ${loopDuration}s linear ${entranceDuration}s infinite
        `;

        if (tickerOuter) tickerOuter.classList.add("ticker-loaded");
      });

    } catch (error) {
      console.error("News Ticker Error:", error);
      tickerContainer.textContent = "Προσωρινή αδυναμία φόρτωσης ειδήσεων.";
      if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
    }
  })();
});
