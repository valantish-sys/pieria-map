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
    if (!tickerContainer) return;

    try {
      const feedUrl = `${config.blogUrl}/feeds/posts/default?alt=json&max-results=${config.maxPosts}`;
      const response = await fetch(feedUrl);
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const entries = data?.feed?.entry;

      if (!entries || !entries.length) {
        tickerContainer.textContent = "Δεν βρέθηκαν αναρτήσεις.";
        if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
        return;
      }

      const fragment = document.createDocumentFragment();

      // Προσοχή: Προσθέσαμε το 'index' στην παρένθεση
      entries.forEach((entry, index) => {
        const title = entry.title?.$t || "Χωρίς τίτλο";
        const altLink = entry.link?.find(l => l.rel === "alternate");
        const linkHref = altLink?.href || config.fallbackLink;

        const anchor = document.createElement("a");
        anchor.href = linkHref;
        anchor.className = "unique-top-ticker-link"; 
        

        anchor.textContent = title; 
        
        /* ===================================================
           ΝΕΟ ΚΟΛΠΟ (ΑΣΦΑΛΗΣ ΤΡΟΠΟΣ): Προσθήκη συμβόλου
           =================================================== */
        if (index === 0) {
          // 2. Προσθέτουμε το εικονίδιο στην αρχή του link (πριν το κείμενο)
          anchor.insertAdjacentHTML("afterbegin", `<span style="color: #ff0000; margin-right: 8px;">⭐</span> `);
        }

        fragment.appendChild(anchor);
      });

      const clonedFragment = fragment.cloneNode(true);
      clonedFragment.querySelectorAll("a").forEach(anchor => {
        anchor.setAttribute("aria-hidden", "true");
        anchor.setAttribute("tabindex", "-1");
      });

      tickerContainer.replaceChildren(fragment, clonedFragment);

     /* ========================================================
         11. ΕΞΥΠΝΟΣ ΥΠΟΛΟΓΙΣΜΟΣ (ΠΡΟΣΤΑΣΙΑ ΓΙΑ FONTS & RESIZE)
         ======================================================== */
      const calculateAnimation = () => {
        const outerWidth = tickerOuter.clientWidth;
        const totalScrollWidth = tickerContainer.scrollWidth;
        
        // Προστασία αν το στοιχείο έχει προσωρινά display: none στο CSS (διαίρεση με το 0)
        if (outerWidth === 0 || totalScrollWidth === 0) return;

        const singleSetWidth = totalScrollWidth / 2;
        const loopDuration = 40; 
        const speed = singleSetWidth / loopDuration;
        const entranceDuration = outerWidth / speed;

        // Reset του animation για να πάρει σωστά τις νέες τιμές σε περίπτωση περιστροφής κινητού
        tickerContainer.style.animation = 'none';
        void tickerContainer.offsetWidth; // Απαραίτητο κόλπο του browser για force reflow

        // Στέλνουμε το πλάτος της οθόνης στο CSS (απαραίτητο για να μην έρχεται το ticker με τεράστια ταχύτητα στην αρχή)
        tickerContainer.style.setProperty('--entrance-start', `${outerWidth}px`);

        tickerContainer.style.animation = `
          ticker-entrance ${entranceDuration}s linear forwards, 
          ticker-loop ${loopDuration}s linear ${entranceDuration}s infinite
        `;
      };

      // Περιμένουμε ΠΡΩΤΑ να φορτώσουν πλήρως οι γραμματοσειρές
      document.fonts.ready.then(() => {
        requestAnimationFrame(() => {
          calculateAnimation();
          if (tickerOuter) tickerOuter.classList.add("ticker-loaded");
          
          // Επαναϋπολογισμός αυτόματα αν ο χρήστης γυρίσει το κινητό του (resize)
          const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(calculateAnimation);
          });
          resizeObserver.observe(tickerOuter);
        });
      });

    } catch (error) {
      console.error("News Ticker Error:", error);
      tickerContainer.textContent = "Προσωρινή αδυναμία φόρτωσης ειδήσεων.";
      if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
    }
  })();
});
