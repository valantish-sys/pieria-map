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
        
        /* ===================================================
           ΝΕΟ ΚΟΛΠΟ: Βάζουμε το σύμβολο ΜΟΝΟ στο 1ο άρθρο
           =================================================== */
        if (index === 0) {
          // Μπορείς να αλλάξεις το ⚡ σε 🔴 ή 🔥 
          anchor.innerHTML = `<span style="color: #ff0000; margin-right: 8px;">🔥</span> ${title}`; 
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

      /* ========================================================
         11. ΕΞΥΠΝΟΣ ΥΠΟΛΟΓΙΣΜΟΣ ΤΑΧΥΤΗΤΑΣ ΜΕ ΜΑΘΗΜΑΤΙΚΑ 
         ======================================================== */
      // Ζητάμε από τον browser να διαβάσει τις διαστάσεις της οθόνης και του κειμένου
      // (Χρησιμοποιούμε requestAnimationFrame για να είμαστε σίγουροι ότι τα pixels "έκατσαν" σωστά)
      requestAnimationFrame(() => {
        const outerWidth = tickerOuter.clientWidth; // Πλάτος της οθόνης σε pixels
        const totalScrollWidth = tickerContainer.scrollWidth; 
        const singleSetWidth = totalScrollWidth / 2; // Το πλάτος των άρθρων πριν τα διπλασιάσουμε

        // ΡΥΘΜΙΣΗ: Πόσα δευτερόλεπτα θέλεις να διαρκεί η λούπα;
        const loopDuration = 40; 
        
        // Υπολογισμός (Ταχύτητα = Απόσταση / Χρόνος)
        const speed = singleSetWidth / loopDuration; // Πόσα pixels το δευτερόλεπτο τρέχει
        const entranceDuration = outerWidth / speed; // Πόσο χρόνο ακριβώς χρειάζεται η είσοδος!

        // Φτιάχνουμε το CSS δυναμικά, αποκλειστικά για την οθόνη του συγκεκριμένου χρήστη
        tickerContainer.style.animation = `
          ticker-entrance ${entranceDuration}s linear forwards, 
          ticker-loop ${loopDuration}s linear ${entranceDuration}s infinite
        `;

        // Ανάβουμε το Fade-in αφού περαστεί το animation
        if (tickerOuter) tickerOuter.classList.add("ticker-loaded");
      });

    } catch (error) {
      console.error("News Ticker Error:", error);
      tickerContainer.textContent = "Προσωρινή αδυναμία φόρτωσης ειδήσεων.";
      if (tickerOuter) tickerOuter.classList.add("ticker-loaded"); 
    }
  })();
});
