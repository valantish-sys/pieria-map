document.addEventListener("DOMContentLoaded", () => {
  (async function initNewsTicker() {
    // 1. Ρυθμίσεις (Εύκολη διαχείριση στο μέλλον)
    const config = {
      blogUrl: "https://dimperist.blogspot.com",
      maxPosts: 6,
      containerId: "ticker-scroll",
      fallbackLink: "#"
    };

    // 2. Έλεγχος ύπαρξης στοιχείου ΠΡΙΝ το request (Εξοικονόμηση πόρων)
    const tickerContainer = document.getElementById(config.containerId);
    if (!tickerContainer) return;

    try {
      // 3. Σύγχρονο Fetch API με async/await
      const feedUrl = `${config.blogUrl}/feeds/posts/default?alt=json&max-results=${config.maxPosts}`;
      const response = await fetch(feedUrl);
      
      // 4. Σωστός έλεγχος δικτύου (Το fetch δεν πιάνει τα 404/500 από μόνο του)
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      
      // 5. Ασφαλής προσπέλαση δεδομένων (Optional Chaining '?')
      const entries = data?.feed?.entry;

      if (!entries || !entries.length) {
        tickerContainer.textContent = "Δεν βρέθηκαν αναρτήσεις.";
        return;
      }

      // 6. Επιδόσεις: Χρήση DocumentFragment (Αποτρέπει τα DOM reflows)
      const fragment = document.createDocumentFragment();

      entries.forEach(entry => {
        const title = entry.title?.$t || "Χωρίς τίτλο";
        const altLink = entry.link?.find(l => l.rel === "alternate");
        const linkHref = altLink?.href || config.fallbackLink;

        // 7. Απόλυτη Ασφάλεια XSS: Χρήση createElement & textContent αντί για innerHTML
        const anchor = document.createElement("a");
        anchor.href = linkHref;
        anchor.className = "ticker-link";
        anchor.textContent = title; 

        fragment.appendChild(anchor);
      });

      // 8. Διπλασιασμός στοιχείων για το CSS εφέ της αδιάκοπης κύλισης
      const clonedFragment = fragment.cloneNode(true);

      // 9. Προσβασιμότητα (Accessibility & SEO): Κρύβουμε τα διπλότυπα
      clonedFragment.querySelectorAll("a").forEach(anchor => {
        anchor.setAttribute("aria-hidden", "true");
        anchor.setAttribute("tabindex", "-1");
      });

      // 10. Ταχύτατη και σύγχρονη εισαγωγή στο DOM
      tickerContainer.replaceChildren(fragment, clonedFragment);

    } catch (error) {
      console.error("News Ticker Error:", error);
      // Προαιρετικό fallback σε περίπτωση που πέσει το Blogger API
      // tickerContainer.textContent = "Προσωρινή αδυναμία φόρτωσης ειδήσεων.";
    }
  })();
});
