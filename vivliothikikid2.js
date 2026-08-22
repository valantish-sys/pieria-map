const initPieriaWidget = () => {
  if (window.pieriaMiniLibLoaded) return;
  window.pieriaMiniLibLoaded = true;

  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/vivliothiki.json";
  const MOTHER_PAGE = "https://dimperist.blogspot.com/p/blog-page_16.html";
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

  const createSlug = (text) => (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}0-9]+/gu, '-').replace(/(^-|-$)+/g, '');

  function initMiniWidget(widget, allBooks) {
    const searchInput = widget.querySelector('.mini-lib-search');
    const grid = widget.querySelector('.mini-lib-grid');
    const scrollArea = widget.querySelector('.mini-lib-scroll-area');
    const loader = widget.querySelector('.mini-lib-loader');
    
  let filteredBooks = [...allBooks];
    const initialShuffled = [...filteredBooks]; // Κρατάει την αρχική τυχαία σειρά
    let currentIndex = 0;
    const BATCH_SIZE = 12; 
    let isRendering = false;
    let renderTimeout; // ΠΡΟΣΘΗΚΗ: Θα ελέγχει τη φόρτωση
    
   function createCard(book) {
      const a = document.createElement('a');
      const safeTitle = book.title || "Χωρίς Τίτλο"; // Ασφάλεια αν λείπει ο τίτλος
      const safeImg = book.image_url || errorImg;    // Ασφάλεια αν λείπει η εικόνα
      
      a.href = `${MOTHER_PAGE}?book=${createSlug(safeTitle)}`;
      a.className = "mini-book-card";
      a.title = safeTitle;
      a.innerHTML = `
        <div class="mini-cover-wrap">
           <!-- ΠΡΟΣΘΗΚΗ: Το this.onerror=null αποτρέπει το Infinite Loop -->
           <img src="${safeImg}" class="mini-cover" loading="lazy" onerror="this.onerror=null; this.src='${errorImg}'">
        </div>
        <h4 class="mini-book-title">${safeTitle}</h4>
      `;
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
              const safeTitle = (b && b.title) ? b.title.toLowerCase() : ""; 
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
