document.addEventListener("DOMContentLoaded", () => {
  // === 1. ΒΑΣΙΚΕΣ ΜΕΤΑΒΛΗΤΕΣ ===
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/vivliothiki.json";
  const CACHE_KEY = "lib_data_v4";
  const CACHE_TIME_KEY = "lib_time_v4";
  const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 ώρες προσωρινή μνήμη (Data Caching)
  const BATCH_SIZE = 15; 
  
  let allBooks = [];
  let filteredBooks = [];
  let currentIndex = 0;
  
 // Τοπική Μνήμη (Local Storage) - Ασφαλής Ανάγνωση (Safe Parse)
 // Τοπική Μνήμη (Local Storage) - Ασφαλής Ανάγνωση (Safe Parse)
 // Τοπική Μνήμη (Local Storage) - Ασφαλής Ανάγνωση (Safe Parse)
const safeJSON = (key) => {
    try { 
      const parsedData = JSON.parse(localStorage.getItem(key)); 
      // Ελέγχει αυστηρά αν το αποτέλεσμα είναι Πίνακας (Array) πριν το επιστρέψει
      return Array.isArray(parsedData) ? parsedData : []; 
    } 
    catch (e) { return []; } 
  };

  // ΝΕΟ: Ασφαλής Αποθήκευση (Αποτρέπει το "κράσαρισμα" αν ο browser μπλοκάρει την αποθήκευση)
  const safeSetStorage = (key, value) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  };

  let favorites = safeJSON('lib-favorites');
  let historyUrls = safeJSON('lib-history');
  let readBooks = safeJSON('lib-read'); // <-- ΝΕΟ
  let showFavsOnly = false;
  let showReadOnly = false; // <-- ΝΕΟ
let debounceTimeout;
  let activeBook = null;

  // Στοιχεία (DOM)
 // Στοιχεία (DOM)
  const container = document.getElementById('premium-lib-container');
  if (!container) return; // Τερματίζει ομαλά την εκτέλεση αν το widget δεν βρίσκεται στην τρέχουσα σελίδα
  const gridEl = document.getElementById('lib-grid');
  const searchInputEl = document.getElementById('lib-search-input');
  const scrollAnchor = document.getElementById('lib-scroll-anchor');
  
  const historySection = document.getElementById('lib-history-section');
  const historyGrid = document.getElementById('lib-history-grid');
// --- ΠΡΟΣΘΗΚΗ: Λειτουργία καθαρισμού ιστορικού ---
  const clearHistoryBtn = document.getElementById('lib-clear-history-btn');
  if (clearHistoryBtn) {
   clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε το ιστορικό;')) {
        historyUrls = [];
        try { localStorage.removeItem('lib-history'); } catch(e) {} // Ασφαλής διαγραφή χωρίς κίνδυνο crash
        renderHistory();
        showToast("Το ιστορικό καθαρίστηκε 🗑️");
      }
    });
  }
  const toast = document.getElementById('lib-toast');
  const backToTopBtn = document.getElementById('lib-back-to-top');
  
  // Modal Στοιχεία
  const modal = document.getElementById('lib-modal');
  const modalImg = document.getElementById('lib-modal-cover');
  const modalTitle = document.getElementById('lib-modal-title');
  const modalReadBtn = document.getElementById('lib-modal-read-btn');

  const errorImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTRhM2I4IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7Oks65zrLOu86vzr88L3RleHQ+PC9zdmc+";

  const themeBtn = document.getElementById('lib-theme-btn');
  if (themeBtn) {
    try { 
      if (localStorage.getItem('lib-theme') === 'dark') { container.classList.add('dark-mode'); themeBtn.innerHTML = '☀️'; }
    } catch (e) {}
    themeBtn.addEventListener('click', () => {
      container.classList.toggle('dark-mode');
      const isDark = container.classList.contains('dark-mode');
      themeBtn.innerHTML = isDark ? '☀️' : '🌙';
      safeSetStorage('lib-theme', isDark ? 'dark' : 'light');
    });
  }

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  
 if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // === 3. ΦΟΡΤΩΣΗ ΔΕΔΟΜΕΝΩΝ (Πάντα Φρέσκα) ===
  scrollAnchor.style.display = 'grid'; 
  
  // --- ΔΙΟΡΘΩΣΗ: Αλεξίσφαιρο Smart Caching για Blogger ---
  // Δημιουργεί έναν αριθμό που αλλάζει 1 φορά κάθε 2 ώρες (7.200.000 ms)
  const cacheVersion = Math.floor(new Date().getTime() / 7200000);
  const SMART_URL = JSON_URL + "?v=" + cacheVersion;

 fetch(SMART_URL)
    .then(res => {
      if (!res.ok) throw new Error("Αποτυχία HTTP");
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Τα δεδομένα δεν είναι μορφής Array");
      allBooks = data;
      initApp();
    })
    .catch(err => {
      scrollAnchor.style.display = 'none';
      gridEl.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>❌ Σφάλμα σύνδεσης. Δοκιμάστε να ανανεώσετε τη σελίδα.</p>";
    });

  function initApp() {
    renderHistory();
    applyFilters();
    checkDeepLink();
  }

  function createBookCard(book) {
    const isFav = favorites.includes(book.book_url);
    const isRead = readBooks.includes(book.book_url);
    
    const card = document.createElement('div');
    card.className = `lib-book-card ${isRead ? 'is-read-card' : ''}`; // Πράσινη Κορνίζα
    card.title = book.title;
    
    card.innerHTML = `
      <div class="lib-cover-wrapper">
     <img src="${book.image_url}" alt="Εξώφυλλο" class="lib-cover" loading="lazy" onerror="this.onerror=null; this.src='${errorImg}';">
        <div class="lib-overlay"><span class="lib-read-btn-hover">🔍 Προβολή</span></div>
        <button class="lib-read-icon ${isRead ? 'is-read' : ''}" title="Διαβάστηκε">${isRead ? '✅' : '✔️'}</button>
        <button class="lib-fav-icon" title="Αγαπημένο">${isFav ? '❤️' : '🤍'}</button>
     </div>
      <div class="lib-info"><h3 class="lib-book-title"></h3></div>
    `;
    
    // Ασφαλής εισαγωγή κειμένου (textContent) για απόλυτη προστασία από σφάλματα HTML Parsing
    card.querySelector('.lib-book-title').textContent = book.title;

    // Λειτουργία Αγαπημένων
    const favBtn = card.querySelector('.lib-fav-icon');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
     if (favorites.includes(book.book_url)) {
        favorites = favorites.filter(url => url !== book.book_url);
        favBtn.innerHTML = '🤍'; 
        showToast("Αφαιρέθηκε από τα αγαπημένα 🤍");
      if (showFavsOnly) {
          card.remove(); 
          filteredBooks = filteredBooks.filter(b => b.book_url !== book.book_url);
          if (currentIndex > 0) currentIndex--; // Αποτροπή αρνητικού δείκτη
          document.getElementById('lib-count').textContent = filteredBooks.length;
          if (filteredBooks.length === 0) applyFilters(); // Επαναφέρει το μήνυμα "Δεν βρέθηκαν αποτελέσματα"
        }
      } else {
        favorites.push(book.book_url);
        favBtn.innerHTML = '❤️'; 
        showToast("Προστέθηκε στα αγαπημένα ❤️");
      }
     safeSetStorage('lib-favorites', JSON.stringify(favorites));
    renderHistory(); // ΣΥΓΧΡΟΝΙΣΜΟΣ: Ανανεώνει το Ιστορικό άμεσα!
    });

    // Λειτουργία Διαβάστηκε
    const readBtn = card.querySelector('.lib-read-icon');
    readBtn.addEventListener('click', (e) => {
      e.stopPropagation();
    if (readBooks.includes(book.book_url)) {
        readBooks = readBooks.filter(url => url !== book.book_url);
        readBtn.innerHTML = '✔️';
        readBtn.classList.remove('is-read');
        card.classList.remove('is-read-card');
        showToast("Αφαιρέθηκε από τα διαβασμένα");
      if (showReadOnly) {
        card.remove(); 
        filteredBooks = filteredBooks.filter(b => b.book_url !== book.book_url);
        if (currentIndex > 0) currentIndex--; // Αποτροπή αρνητικού δείκτη
        document.getElementById('lib-count').textContent = filteredBooks.length;
        if (filteredBooks.length === 0) applyFilters(); // Επαναφέρει σωστά το μήνυμα κενής λίστας και τις προτάσεις
      }
      } else {
        readBooks.push(book.book_url);
        readBtn.innerHTML = '✅';
        readBtn.classList.add('is-read');
        card.classList.add('is-read-card');
        showToast("Μπράβο! Το βιβλίο ολοκληρώθηκε! \u2705");
      }
     safeSetStorage('lib-read', JSON.stringify(readBooks));
renderHistory(); // ΣΥΓΧΡΟΝΙΣΜΟΣ: Ανανεώνει το Ιστορικό άμεσα!
    });

    card.addEventListener('click', () => openModal(book));
    return card;
  }

  function renderHistory() {
    const historyBooks = historyUrls.map(url => allBooks.find(b => b.book_url === url)).filter(Boolean);
    
    if (historyBooks.length === 0 || showFavsOnly || showReadOnly || searchInputEl.value.trim() !== '') {
      historySection.style.display = 'none';
      return;
    }
    
    historySection.style.display = 'block';
    historyGrid.innerHTML = '';
    
    historyBooks.forEach(book => {
      const card = createBookCard(book);
      
      // Προσθήκη του μικρού "✖" μόνο για τα βιβλία του ιστορικού
      const removeBtn = document.createElement('button');
      removeBtn.className = 'lib-history-remove';
      removeBtn.innerHTML = '✖';
      removeBtn.title = "Αφαίρεση από το ιστορικό";
      
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Σταματάει το κλικ για να μην ανοίξει το βιβλίο
        historyUrls = historyUrls.filter(url => url !== book.book_url);
    safeSetStorage('lib-history', JSON.stringify(historyUrls));
        renderHistory(); // Ξαναζωγραφίζει το ράφι αμέσως χωρίς το βιβλίο
      });
      
      // Βάζουμε το "✖" μέσα στην κάρτα, πάνω στο εξώφυλλο
     // Βάζουμε το "✖" μέσα στην κάρτα, πάνω στο εξώφυλλο
      const coverWrapper = card.querySelector('.lib-cover-wrapper');
      coverWrapper.appendChild(removeBtn);
      
      // ΔΙΟΡΘΩΣΗ: Κρύβουμε τα άλλα εικονίδια στο ιστορικό για να μην πέφτουν το ένα πάνω στο άλλο!
      const readIcon = coverWrapper.querySelector('.lib-read-icon');
      const favIcon = coverWrapper.querySelector('.lib-fav-icon');
      if (readIcon) readIcon.style.display = 'none';
      if (favIcon) favIcon.style.display = 'none';
      historyGrid.appendChild(card);
    });
  }
function addToHistory(book) {
    historyUrls = historyUrls.filter(url => url !== book.book_url);
    historyUrls.unshift(book.book_url); 
    if (historyUrls.length > 5) historyUrls.pop(); // Κρατάμε τα 5 πιο πρόσφατα
   safeSetStorage('lib-history', JSON.stringify(historyUrls));
    renderHistory();
  }

  // === 6. ΦΙΛΤΡΑ & DEBOUNCE ΑΝΑΖΗΤΗΣΗΣ ===
  searchInputEl.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => applyFilters(), 300); // 300ms Καθυστέρηση για επιδόσεις!
  });

 document.getElementById('lib-fav-filter-btn').addEventListener('click', (e) => {
    showFavsOnly = !showFavsOnly;
    e.currentTarget.classList.toggle('active', showFavsOnly); // Η χρήση currentTarget στοχεύει πάντα το κυρίως κουμπί
    applyFilters();
  });
  document.getElementById('lib-read-filter-btn').addEventListener('click', (e) => {
    showReadOnly = !showReadOnly;
    e.currentTarget.classList.toggle('active-read', showReadOnly);
    applyFilters();
  });

  let renderTimeout;
  let isRendering = false;

  function applyFilters() {
    clearTimeout(renderTimeout);
    isRendering = false;

  const query = searchInputEl.value.toLowerCase().trim();
    // Μετατρέπει αυτόματα όλα τα τελικά 'ς' σε 'σ' για να γίνεται 100% σωστά η σύγκριση στα Ελληνικά
    const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ς/g, "σ");
    const normalizedQuery = normalize(query);
   filteredBooks = allBooks.filter(b => {
    // Μετατροπή σε String με ασφάλεια πριν το toLowerCase για αποτροπή TypeError
      const safeTitle = (b && b.title) ? String(b.title).toLowerCase() : "";
     const matchSearch = normalize(safeTitle).includes(normalizedQuery);
      const matchFav = showFavsOnly ? favorites.includes(b && b.book_url) : true;
      const matchRead = showReadOnly ? readBooks.includes(b && b.book_url) : true;
      return matchSearch && matchFav && matchRead;
    });

    document.getElementById('lib-count').textContent = filteredBooks.length;
    currentIndex = 0;
    gridEl.innerHTML = ''; 
    renderHistory(); // Κρύβει το ράφι αν ψάχνουμε

    const noResultsEl = document.getElementById('lib-no-results');
    const suggestionsGridEl = document.getElementById('lib-suggestions-grid');

    if (filteredBooks.length === 0) {
      noResultsEl.style.display = 'block';
      scrollAnchor.style.display = 'none';
      
      // Έξυπνες Προτάσεις αν δεν βρεθεί κάτι
      suggestionsGridEl.innerHTML = '';
      if (!showFavsOnly && allBooks.length > 0) {
        document.getElementById('lib-suggestions-title').style.display = 'block';
        const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
        shuffled.slice(0, 4).forEach(book => suggestionsGridEl.appendChild(createBookCard(book)));
      } else {
        document.getElementById('lib-suggestions-title').style.display = 'none';
      }
    } else {
      noResultsEl.style.display = 'none';
      renderBatch(); 
    }
  }

  // === 7. ΑΠΕΙΡΗ ΚΥΛΙΣΗ (Αλεξίσφαιρη) ===
  function renderBatch() {
    if (isRendering || currentIndex >= filteredBooks.length) {
      if (currentIndex >= filteredBooks.length) scrollAnchor.style.display = 'none';
      return;
    }
    isRendering = true;
    scrollAnchor.style.display = 'grid';

    renderTimeout = setTimeout(() => {
      try { 
        const batch = filteredBooks.slice(currentIndex, currentIndex + BATCH_SIZE);
        batch.forEach(book => gridEl.appendChild(createBookCard(book)));
      } catch (err) {
        console.error("Σφάλμα:", err);
      } finally {
        currentIndex += BATCH_SIZE;
        isRendering = false;
        
      if (currentIndex >= filteredBooks.length) {
          scrollAnchor.style.display = 'none';
        } else {
          // Μόλις βάλει 15 βιβλία, ελέγχει ΑΜΕΣΩΣ αν η οθόνη έχει κι άλλο χώρο.
          if (scrollAnchor.offsetParent === null) return; // Σταματάει τον βρόχο μνήμης αν το widget είναι κρυφό!
          
          const rect = scrollAnchor.getBoundingClientRect();
          if (rect.top <= window.innerHeight + 400) {
            renderBatch();
          }
        }
      }
    }, 150); 
  }

  // Διπλή προστασία: Observer + Κλασικό Scroll
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && filteredBooks.length > 0) renderBatch(); 
  }, { rootMargin: "600px" });
  observer.observe(scrollAnchor);

  // ΔΙΟΡΘΩΣΗ: Ενιαίο και Ελαφρύ Scroll Event (Μηδενικό Lag στα κινητά)
  let scrollThrottle;
  window.addEventListener('scroll', () => {
    if (scrollThrottle) return;
    scrollThrottle = setTimeout(() => {
  if (backToTopBtn) {
        if (window.scrollY > 400) backToTopBtn.classList.add('show');
        else backToTopBtn.classList.remove('show');
      }
      
      // 2. Έλεγχος Infinite Scroll
      if (!isRendering && scrollAnchor.style.display !== 'none') {
        const rect = scrollAnchor.getBoundingClientRect();
        if (rect.top <= window.innerHeight + 600) renderBatch();
      }
      scrollThrottle = null;
    }, 150); // Τσεκάρει μόνο 6-7 φορές το δευτερόλεπτο. Υπεραρκετό και πανάλαφρο!
  }, { passive: true }); // Το passive: true κάνει το σκρολ ομαλό σαν βούτυρο

 document.getElementById('lib-lucky-btn').addEventListener('click', () => {
    // Απόλυτος σεβασμός στα φίλτρα του χρήστη, δεν παρακάμπτουμε τις επιλογές του.
    if (filteredBooks.length === 0) {
      showToast("Δεν βρέθηκαν βιβλία με τα τρέχοντα φίλτρα!");
      return;
    }
    
    const randomBook = filteredBooks[Math.floor(Math.random() * filteredBooks.length)];
    openModal(randomBook);
  });

function openModal(book) {
   activeBook = book;
    modalImg.onerror = function() { this.onerror = null; this.src = errorImg; }; // Αποτροπή άπειρου βρόχου (Crash)
   modalImg.src = book.image_url || errorImg;
    modalTitle.textContent = book.title;
    modalReadBtn.href = book.book_url;
    modalReadBtn.target = "_blank"; // Ανοίγει σε νέα καρτέλα για να μην χαθεί η πρόοδος αναζήτησης/σκρολ!
    
    // Η ΜΑΓΕΙΑ: Βγάζουμε το παράθυρο ΕΚΤΟΣ Blogger
    
    // Η ΜΑΓΕΙΑ: Βγάζουμε το παράθυρο ΕΚΤΟΣ Blogger και το βάζουμε κατευθείαν στο σώμα της σελίδας!
    document.body.appendChild(modal);
    if (container.classList.contains('dark-mode')) {
        modal.classList.add('dark-mode');
    } else {
        modal.classList.remove('dark-mode');
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    addToHistory(book); 
  }

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    activeBook = null;
    
   const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('book');
    try { window.history.replaceState({}, document.title, cleanUrl.toString()); } catch(e) {} // Προστασία από Iframe SecurityError

    // NUDGE (ΜΑΓΕΙΑ): Ξυπνάει το σκρολ μόλις κλείσεις το βιβλίο!

    // NUDGE (ΜΑΓΕΙΑ): Ξυπνάει το σκρολ μόλις κλείσεις το βιβλίο!
    setTimeout(() => {
      const rect = scrollAnchor.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 250) renderBatch();
    }, 150);
  }
  
  document.getElementById('lib-close-btn').addEventListener('click', closeModal);
  document.getElementById('lib-modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });

 // Share Button (Native Mobile Share API)
  document.getElementById('lib-modal-share-btn').addEventListener('click', async (e) => {
    e.preventDefault(); // Σταματάει οποιαδήποτε συμπεριφορά που κάνει refresh
    if (!activeBook) return;
    
    const shareUrl = new URL(window.location.href);
// Ασφαλής μετατροπή σε String πριν την επεξεργασία για αποτροπή TypeError
    const slugify = (text) => String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zα-ω0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = slugify(activeBook.title); 
    
    shareUrl.searchParams.set('book', slug);
    const finalUrl = shareUrl.toString();

    // 1. ΔΟΚΙΜΗ ΓΙΑ ΚΙΝΗΤΑ: Άνοιγμα του native μενού (αναδύεται από κάτω)
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeBook.title,
          text: 'Δες αυτό το βιβλίο:',
          url: finalUrl
        });
      } catch (err) {
        console.log("Η κοινοποίηση ακυρώθηκε από τον χρήστη.");
      }
    } 
    // 2. ΕΝΑΛΛΑΚΤΙΚΗ ΓΙΑ ΥΠΟΛΟΓΙΣΤΕΣ (Fall-back): Αντιγραφή του link
    else {
      try {
        await navigator.clipboard.writeText(finalUrl);
        showToast("Ο σύνδεσμος αντιγράφηκε! 🔗");
      } catch (err) {
        // Αλεξίσφαιρη αντιγραφή αν το clipboard API δεν υποστηρίζεται
        const textArea = document.createElement("textarea");
        textArea.value = finalUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.setAttribute("readonly", "true"); // Μπλοκάρει το βίαιο άνοιγμα του πληκτρολογίου στα κινητά
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          showToast("Ο σύνδεσμος αντιγράφηκε! 🔗");
        } catch (e) {
          showToast("Σφάλμα αντιγραφής.");
        }
        document.body.removeChild(textArea);
      }
    }
  });

  // Έλεγχος αν ο χρήστης μπήκε από σύνδεσμο κοινοποίησης
  function checkDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const bookSlug = params.get('book');
    if (bookSlug && allBooks.length > 0) {
      
  // Ασφαλής μετατροπή σε String πριν την επεξεργασία για αποτροπή TypeError
    const slugify = (text) => String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zα-ω0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const foundBook = allBooks.find(b => slugify(b.title) === bookSlug);
      
    if (foundBook) {
        setTimeout(() => {
          // Το 'auto' μετακινεί ακαριαία τη σελίδα για να αποφευχθεί το τρέμουλο/πάγωμα (glitch) από το Modal
          container.scrollIntoView({ behavior: 'auto', block: 'start' }); 
          openModal(foundBook);
        }, 500); 
      }
    }
  }

});
