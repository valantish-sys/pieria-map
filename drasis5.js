(() => {
  "use strict";

  const YEARS = [
    {
      id: 'y2026',
      title: 'Δράσεις 2026-2027',
      short: '2026-2027',
      icon: '🚀',
      feedLabel: 'Δράσεις 26',
      subtitle: 'Όλες οι δραστηριότητες και εκδηλώσεις της φετινής σχολικής χρονιάς',
      loaded: false,
      loading: false,
      total: 0,
      categories: {}
    },
    {
      id: 'y2025',
      title: 'Δράσεις 2025-2026',
      short: '2025-2026',
      icon: '✨',
      feedLabel: 'Δράσεις',
      subtitle: 'Ανασκόπηση δράσεων και εκδηλώσεων του σχολικού έτους 2025-2026',
      loaded: false,
      loading: false,
      total: 0,
      categories: {}
    },
    {
      id: 'y2014',
      title: 'Δράσεις 2014-2025',
      short: '2014-2025',
      icon: '⚡',
      feedLabel: 'Δράσεις 14-25',
      subtitle: 'Πλούσιο ιστορικό αρχείο δράσεων και στιγμών έντεκα σχολικών ετών',
      loaded: false,
      loading: false,
      total: 0,
      categories: {}
    }
  ];

  const categoryColors = {
    "🎉 Γιορτές & Επέτειοι": "#e67e22",
    "🚌 Εκδρομές & Επισκέψεις": "#f39c12",
    "⚽ Αθλητισμός & Δραστηριότητες": "#27ae60",
    "🌿 Περιβάλλον & Φύση": "#2ecc71",
    "🏥 Υγεία & Ασφάλεια": "#e74c3c",
    "🤝 Κοινωνία & Αλληλεγγύη": "#9b59b6",
    "📚 Εκπαιδευτικά Προγράμματα": "#2980b9",
    "🏫 Λειτουργία Σχολείου": "#34495e",
    "📌 Γενικά": "#7f8c8d"
  };

  const priorityKeywords = {
    "🚌 Εκδρομές & Επισκέψεις": ["εκδρομ", "επίσκεψ", "εκπαιδευτική επίσκεψη", "θεατρική παράσταση"],
    "🎉 Γιορτές & Επέτειοι": ["γιορτ", "εορτασμ", "επέτειος", "28η οκτωβρίου", "25η μαρτίου"],
    "⚽ Αθλητισμός & Δραστηριότητες": ["αθλητισμ", "αθλητικές δραστηριότητες", "σχολικός αθλητισμός", "έθιμ", "άνοιξη", "πασχ", "καραγκιοζ"],
    "🌿 Περιβάλλον & Φύση": ["φύση", "περιβαλλοντική", "ανακύκλωση"],
    "🏥 Υγεία & Ασφάλεια": ["υγεία", "ασφάλεια", "πρώτες βοήθειες"],
    "🤝 Κοινωνία & Αλληλεγγύη": ["κοινωνία", "αλληλεγγύη", "φιλανθρωπική", "εθελοντισμός"],
    "📚 Εκπαιδευτικά Προγράμματα": ["εκπαιδευτικό πρόγραμμα", "σεμινάριο", "ημερίδα", "ψηφιακός χώρος"],
    "🏫 Λειτουργία Σχολείου": ["λειτουργία σχολείου", "ανακοίνωση", "εγγραφές", "βαθμολογία", "ε.δ.υ", "εδυ", "κτιρι"]
  };

  const categoryKeywords = {
    "🎉 Γιορτές & Επέτειοι": [
      "χριστουγ", "γιορτ", "επέτει", "28η", "25η", "πολυτεχν", "αγίου", "εκκλησιασμ", "βασιλόπιτ", "παρέλασ", "μαρτάκια", "πάσχα", "αποκρι", "καρναβάλ", "εθνικ", "σημαία", "όχι", "χορός", "χορό", "χορευτ", "εκδήλωσ", "κάλαντα", "τραγούδ", "ποιήματ", "στεφάν", "παράδοση", "έθιμ", "λαζαρ", "μασκέ", "χαρταετ", "τσικνοπέμπτ", "1821", "λήξη", "αποφοίτησ", "τελετή", "μνήμη", "ιστορικ",
      "1940", "μητέρ", "πατέρ", "γυναικ", "τριών ιεραρχ", "πρωτοχρονι", "ευαγγελισμ", "ευχές", "αναστάσιμ", "φεστιβάλ"
    ],
    "🚌 Εκδρομές & Επισκέψεις": [
      "επίσκεψ", "εκδρομ", "θέατρ", "μουσεί", "πάρκ", "εργοστάσι", "πτέρυγα", "γήπεδο", "περίπατ", "βουλή", "ξενάγησ", "ταξίδι", "μεταφορ", "λεωφορεί", "συνοδεί", "αρχαιολογ", "μνημεί", "σινεμά", "κινηματογράφ", "όλυμπ", "δίον", "πλαταμών", "κάστρ", "αρχαιότητ", "πλανητάρι", "περιήγησ", "βόλτα",
      "ορειβατ", "λίμνη", "ποτάμι", "σπήλαι", "προορισμ", "αξιοθέατ", "εξερεύνησ", "μονοπάτ", "τοπίο", "κατασκηνωσ"
    ],
    "⚽ Αθλητισμός & Δραστηριότητες": [
      "αθλητ", "μπάσκετ", "κολύμβησ", "χάντμπολ", "άσκηση", "φιλάθλ", "παιχνίδ", "σκάκι", "ρουά ματ", "ποδόσφαιρ", "βόλεϊ", "γυμναστικ", "αγών", "πρωτάθλημ", "τουρνουά", "στίβ", "γυμναστ", "προπόνησ", "μετάλλι", "κύπελλ", "τένις", "επιτραπέζι", "τζούντο", "καράτε", "σκυταλοδρομί", "δρόμος", "άλμα", "γηπεδάκι", "ολυμπιακ", "διελκυστίνδ",
      "πινγκ πονγκ", "μπαλάκι", "σχοινάκι", "χορογραφί", "ζέσταμ", "ομάδα", "fair play", "παραολυμπιακ", "τάεκβοντο", "ευεξί", 
    ],
    "🌿 Περιβάλλον & Φύση": [
      "ανακύκλωσ", "ζώων", "περιβάλλ", "υγροτόπ", "κήπο", "δέντρ", "αυτοκίνητο", "πλανήτ", "ηλιακό", "κλίμα", "οικολογ", "φύτευσ", "καθαρισμ", "δάσος", "παραλία", "φυσικ", "αναδάσωσ", "κλιματικ", "χλωρίδ", "πανίδ", "ενέργει", "αειφόρ", "σκουπίδι", "μποστάν", "λαχανικ", "βόταν", "ανανεώσιμ", "φωτοβολταϊκ", "ρύπανσ", "βιώσιμ", "θάλασσ", "νερό",
      "φύση", "λουλούδ", "σπόρ", "κομποστοποίησ", "αδέσποτ", "κατοικίδι", "οικοσύστημ", "επαναχρησιμοποίησ", "γλάστρ", "εξοικονόμησ"
    ],
    "🏥 Υγεία & Ασφάλεια": [
      "υγεία", "ασφάλεια", "κορονοϊ", "covid", "λοιμωξ", "σεισμ", "καιρικ", "διαβήτη", "δόντια", "πρώτες βοήθειες", "εμβόλι", "διατροφ", "νοσοκομεί", "πυροσβεστικ", "τροχαία", "κυκλοφοριακ", "διασωστ", "πρόληψ", "γιατρ", "υγιειν", "φάρμακ", "ασθένει", "ποδήλατ", "κράνος", "ζώνη", "ψείρ", "ίωσ", "ερυθρ", "σταυρ", "αστυνομί", "μικρόβι", "διασώστ",
      "οδοντίατρ", "παιδίατρ", "ατύχημ", "αντισεισμικ", "πυρκαγι", "παχυσαρκί", "νοσηλευτ", "εκαβ", "έκτακτ", "πανδημί"
    ],
    "🤝 Κοινωνία & Αλληλεγγύη": [
      "βία", "εκφοβισμ", "συνεκπαίδευσ", "αναπηρία", "δικαιώματ", "καλοσύν", "εθελοντ", "αιμοδοσί", "δωρεά", "φιλανθρωπ", "προσφορ", "συμπερίληψ", "bullying", "ειρήνη", "κοινωνικ", "στήριξ", "βοήθει", "αλληλοσεβασμ", "ισότητ", "προσφυγ", "αγάπη", "χαμόγελ", "ρατσισμ", "διαφορετικότητ", "ισοτιμί", "σεβασμ", "συνεργασί", "ευαισθητοποίησ", "αμεα", "συσσίτι",
      "ενσυναίσθησ", "αποδοχ", "ένταξ", "unicef", "τρόφιμ", "ρούχ", "αλληλοβοήθει", "άπορ", "φιλία", "οικογένει"
    ],
    "📚 Εκπαιδευτικά Προγράμματα": [
      "βιβλί", "γλώσσας", "project", "τάμπλετ", "έρευνα", "ρομποτικ", "stem", "πείραμα", "διαγωνισμ", "παρουσίασ", "συγγραφ", "σεμινάρι", "ημερίδ", "έκθεσ", "εργαστήρι", "λογοτεχν", "καινοτομ", "εργασί", "μελέτ", "πληροφορικ", "φιλαναγνωσί", "διαδραστικ", "ψηφιακ", "δεξιότητ", "erasmus", "etwinning", "μουσειακ", "ρομπότ", "κώδικα", "προγραμματισμ", "επιστήμ",
      "μαθηματικ", "αγγλικ", "γαλλικ", "γερμανικ", "εφευρέσ", "ανάγνωσ", "αστρονομί", "coding", "διαδίκτυ", "ασφαλές", "ζωγραφικ", "διαγωνισμ"
    ],
   "🏫 Λειτουργία Σχολείου": [
      "εγγραφ", "βαθμολογ", "αγιασμ", "ολοήμερ", "τηλεκπαίδευσ", "webex", "ενημέρωσ", "απουσί", "πρόγραμμα", "κηδεμόν", "ωράρι", "διευθυντ", "συνεδρίασ", "εγκύκλι", "ανακοίνωσ", "ωρολόγι", "απουσιολόγι", "κυλικεί", "επιτροπ", "συμβούλι", "εφημερί", "βαθμοί", "έλεγχ", "αργία", "κλειστά", "απεργί", "αναμνηστικ"
    ]
  };

  /* Βοηθητικές συναρτήσεις καθαρισμού συμβόλων & ελληνικής αναζήτησης */
 /* Βοηθητικές συναρτήσεις καθαρισμού συμβόλων (με cache ταχύτητας) & ελληνικής αναζήτησης */
  const txtEl = document.createElement('textarea');
  const entCache = new Map();
  const dec = s => {
    const str = String(s || '');
    if (!str.includes('&')) return str;
    return str.replace(/&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z0-9]+);/g, m => {
      let v = entCache.get(m);
      if (v === undefined) { txtEl.innerHTML = m; v = txtEl.value; entCache.set(m, v); }
      return v;
    });
  };
  const clean = s => dec(dec(s));
  const esc = s => clean(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const escUrl = u => String(u || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ς/g, 'σ');
  const normUrl = u => (u || '').trim().replace(/^https?:\/\//i, '').replace(/\?m=[01]$/, '').replace(/\/$/, '');
  const countTxt = n => `${n} ${n === 1 ? 'δράση' : 'δράσεις'}`;
  const splitCat = key => {
    const k = clean(key);
    const idx = k.indexOf(' ');
    return idx > -1 ? { icon: k.slice(0, idx), name: k.slice(idx + 1) } : { icon: '\uD83D\uDCCC', name: k };
  };

  /* Αποκατάσταση όλων των emojis/τίτλων που κωδικοποιεί ο κειμενογράφος του Blogger */
  YEARS.forEach(y => {
    y.title = clean(y.title);
    y.short = clean(y.short);
    y.icon = clean(y.icon);
    y.feedLabel = clean(y.feedLabel);
    y.subtitle = clean(y.subtitle);
  });
  const cleanCatEntries = Object.entries(categoryColors).map(([k, v]) => [clean(k), v]);
  for (const k in categoryColors) delete categoryColors[k];
  cleanCatEntries.forEach(([k, v]) => { categoryColors[k] = v; });
  const DEFAULT_CAT = clean('\uD83D\uDCCC Γενικά');

  /* Προ-υπολογισμός κανονικοποιημένων λέξεων-κλειδιών χωρίς διπλότυπα */
  const compiledPriority = Object.entries(priorityKeywords).map(([cat, kws]) => [
    clean(cat),
    [...new Set(kws.filter(Boolean).map(norm))]
  ]);
  const compiledKeywords = Object.entries(categoryKeywords).map(([cat, kws]) => [
    clean(cat),
    [...new Set(kws.filter(Boolean).map(norm))]
  ]);
  const predefinedOrder = Object.keys(categoryColors);

  let activeIdx = 0;
  let userInteracted = false;
  let openModalCat = null;

  const gridEl = document.getElementById('ab-grid');
  const heroEl = document.getElementById('ab-hero');
  const heroTitleEl = document.getElementById('ab-hero-title');
  const heroBadgeEl = document.getElementById('ab-hero-badge');
  const heroSubEl = document.getElementById('ab-hero-sub');
  const dotsEl = document.getElementById('ab-dots');
  const inputEl = document.getElementById('ab-input');
  const clearEl = document.getElementById('ab-clear');
  const instantEl = document.getElementById('ab-instant');

  /* Δημιουργία Modal απευθείας στο body */
  const oldModal = document.getElementById('ab-modal-overlay');
  if (oldModal) oldModal.remove();
  const modalEl = document.createElement('div');
  modalEl.id = 'ab-modal-overlay';
  modalEl.className = 'ab-modal-wrap';
  modalEl.innerHTML = `
    <div class="ab-sheet" id="ab-sheet">
      <div class="ab-sheet-head">
        <div>
          <div class="ab-sheet-title" id="ab-m-title"></div>
          <div class="ab-sheet-sub" id="ab-m-sub"></div>
        </div>
        <button type="button" class="ab-close" id="ab-m-close" aria-label="Κλείσιμο">✕</button>
      </div>
      <div class="ab-sheet-body" id="ab-m-body"></div>
    </div>
  `;
  document.body.appendChild(modalEl);

  function classifyEntry(title, rawHtml) {
    const plainContent = rawHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
    const nTitle = norm(title);
    const nContent = norm(plainContent);

    for (const [catName, kws] of compiledPriority) {
      if (kws.some(kw => nTitle.includes(kw) || nContent.includes(kw))) return catName;
    }

   let bestCat = DEFAULT_CAT;
    let maxMatches = 0;
    for (const [catName, kws] of compiledKeywords) {
      let matches = 0;
      for (let i = 0; i < kws.length; i++) {
        if (nTitle.includes(kws[i]) || nContent.includes(kws[i])) matches++;
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCat = catName;
      }
    }
    return bestCat;
  }

  async function loadYear(yearObj) {
    if (yearObj.loaded || yearObj.loading) return;
    yearObj.loading = true;
    if (YEARS[activeIdx].id === yearObj.id) renderAll();

    const encoded = encodeURIComponent(yearObj.feedLabel);
    const baseUrl = `/feeds/posts/default/-/${encoded}?alt=json`;
    let startIndex = 1;
    const maxResults = 50;
    let hasMore = true;
    const seen = new Set();
    const catMap = {};
    let count = 0;

    try {
      while (hasMore) {
        const res = await fetch(`${baseUrl}&max-results=${maxResults}&start-index=${startIndex}`);
        if (!res.ok) break;
        const data = await res.json();
        const entries = data.feed && data.feed.entry ? data.feed.entry : [];

        if (entries.length > 0) {
          entries.forEach(entry => {
            const rawTitle = (entry.title && entry.title.$t) ? entry.title.$t : 'Δράση χωρίς τίτλο';
            const title = clean(rawTitle);
            const linkObj = (entry.link || []).find(l => l.rel === 'alternate');
            const url = linkObj ? linkObj.href : '#';
            const key = normUrl(url);
            if (seen.has(key)) return;
            seen.add(key);

            const content = (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || '';
            const pub = entry.published && entry.published.$t ? new Date(entry.published.$t) : null;
            const date = (pub && !isNaN(pub)) ? pub.toLocaleDateString('el-GR') : '';

           const cat = classifyEntry(title, content);
            if (!catMap[cat]) catMap[cat] = [];
            catMap[cat].push({ title, url, date, ts: (pub && !isNaN(pub)) ? pub.getTime() : 0 });
            count++;
          });

          startIndex += entries.length;
          const totalRes = data.feed.openSearch$totalResults ? parseInt(data.feed.openSearch$totalResults.$t, 10) : null;
          if (totalRes && startIndex > totalRes) hasMore = false;
        } else {
          hasMore = false;
        }
      }
    } catch (err) {
      console.warn('Σφάλμα φόρτωσης έτους:', yearObj.feedLabel, err);
    }

    yearObj.categories = catMap;
    yearObj.total = count;
    yearObj.loaded = true;
    yearObj.loading = false;

    if (YEARS[activeIdx].id === yearObj.id) {
      renderAll();
      if (openModalCat) renderModalContent(yearObj, openModalCat);
    }
    if (inputEl.value.trim()) renderInstantSearch();
  }

 function renderHero() {
    const y = YEARS[activeIdx];
    heroTitleEl.textContent = `${clean(y.icon)} ${clean(y.title)}`;
    heroBadgeEl.textContent = y.loaded ? `${countTxt(y.total)} συνολικά` : 'Φόρτωση...';
    heroSubEl.textContent = clean(y.subtitle);

    dotsEl.innerHTML = YEARS.map((item, idx) => `
      <button type="button" class="ab-dot ${idx === activeIdx ? 'active' : ''}" data-idx="${idx}" aria-label="${esc(item.title)}"></button>
    `).join('');
  }

  function renderGrid() {
    const y = YEARS[activeIdx];

    if (!y.loaded) {
      gridEl.innerHTML = `<div class="ab-skeleton"></div><div class="ab-skeleton"></div><div class="ab-skeleton"></div><div class="ab-skeleton"></div>`;
      return;
    }

    const sortedCats = Object.keys(y.categories).sort((a, b) => {
      if (a === DEFAULT_CAT) return 1;
      if (b === DEFAULT_CAT) return -1;
      return predefinedOrder.indexOf(a) - predefinedOrder.indexOf(b);
    });

    if (!sortedCats.length) {
      gridEl.innerHTML = `<div class="ab-empty">Δεν υπάρχουν ακόμα καταχωρημένες δράσεις για το έτος ${esc(y.short)}.</div>`;
      return;
    }

    gridEl.innerHTML = sortedCats.map(catKey => {
      const posts = y.categories[catKey] || [];
      const color = categoryColors[catKey] || "#64748b";
      const { icon, name } = splitCat(catKey);

      const previews = posts.slice(0, 2).map(p => `
        <div class="ab-prev-item">
          <span class="ab-prev-txt">${esc(p.title)}</span>
          ${p.date ? `<span class="ab-prev-date">${esc(p.date)}</span>` : ''}
        </div>
      `).join('');

      return `
        <div class="ab-tile" data-cat="${esc(catKey)}" style="--c:${color}">
          <div>
            <div class="ab-tile-head">
              <span class="ab-tile-icon">${esc(icon)}</span>
              <span class="ab-count">${countTxt(posts.length)}</span>
            </div>
            <div class="ab-tile-title">${esc(name)}</div>
            <div class="ab-previews">${previews}</div>
          </div>
          <div class="ab-cta">Προβολή όλων <span>\u2794</span></div>
          <div class="ab-watermark">${esc(icon)}</div>
        </div>
      `;
    }).join('');
  }

  function renderAll() {
    renderHero();
    renderGrid();
  }

  function switchYear(newIdx) {
    userInteracted = true;
    activeIdx = (newIdx + YEARS.length) % YEARS.length;
    renderAll();
    if (!YEARS[activeIdx].loaded && !YEARS[activeIdx].loading) {
      loadYear(YEARS[activeIdx]);
    }
    const wrap = document.getElementById('actions-bento');
    if (wrap) {
      const rect = wrap.getBoundingClientRect();
      if (rect.top < -20) window.scrollBy({ top: rect.top - 12, behavior: 'smooth' });
    }
  }

  function renderModalContent(yearObj, catKey) {
    const posts = yearObj.categories[catKey] || [];
    const color = categoryColors[catKey] || "#334155";
    const { icon, name } = splitCat(catKey);

    document.getElementById('ab-sheet').style.setProperty('--c', color);
    document.getElementById('ab-m-title').textContent = `${clean(icon)} ${clean(name)} (${countTxt(posts.length)})`;
    document.getElementById('ab-m-sub').textContent = `${clean(yearObj.icon)} Σχολικό έτος ${clean(yearObj.short)}`;

    const body = document.getElementById('ab-m-body');
    body.innerHTML = posts.map(p => `
      <a class="ab-link" href="${escUrl(p.url)}" style="--c:${color}">
        <div class="ab-link-main">
          <span class="ab-link-title">${esc(p.title)}</span>
          ${p.date ? `<span class="ab-link-meta">\uD83D\uDDD3\uFE0F ${esc(p.date)}</span>` : ''}
        </div>
        <span>\u2794</span>
      </a>
    `).join('');
  }

  function openModal(catKey) {
    const key = clean(catKey);
    const y = YEARS[activeIdx];
    if (!y.categories[key]) return;
    openModalCat = key;
    renderModalContent(y, key);
    modalEl.classList.add('open');
    document.getElementById('ab-m-body').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    openModalCat = null;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderInstantSearch() {
    const q = norm(inputEl.value.trim());
    clearEl.style.display = q ? 'flex' : 'none';
    if (!q) { instantEl.classList.remove('open'); return; }

    const words = q.split(/\s+/);
    const hits = [];
    const seenHits = new Set();

    YEARS.forEach(y => {
      Object.entries(y.categories).forEach(([catKey, posts]) => {
        const catNorm = norm(catKey);
        const color = categoryColors[catKey] || "#3b82f6";
        const { icon } = splitCat(catKey);

        posts.forEach(p => {
          const hay = `${norm(p.title)} ${catNorm} ${norm(y.short)}`;
          if (words.every(w => hay.includes(w))) {
            const key = normUrl(p.url);
            if (!seenHits.has(key)) {
              seenHits.add(key);
              hits.push({ ...p, icon, color, yearShort: y.short });
            }
          }
        });
      });
    });

    hits.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    instantEl.classList.add('open');
    if (!hits.length) {
      instantEl.innerHTML = `<div style="color:#64748b;padding:8px;">Δεν βρέθηκε δράση για \u00AB${esc(inputEl.value)}\u00BB.</div>`;
      return;
    }

    const resLabel = hits.length === 1
      ? 'Βρέθηκε 1 αποτέλεσμα σε όλα τα έτη:'
      : `Βρέθηκαν ${hits.length} αποτελέσματα σε όλα τα έτη:`;

    instantEl.innerHTML =
      `<div style="font-size:0.82rem;font-weight:700;color:#64748b;margin-bottom:10px;">${resLabel}</div>` +
      `<div class="ab-instant-list">` +
      hits.map(h => `
        <a class="ab-link" href="${escUrl(h.url)}" style="--c:${h.color}">
          <div class="ab-link-main">
            <span class="ab-link-title"><strong style="color:${h.color}">${esc(h.icon)}</strong> ${esc(h.title)}</span>
            <span class="ab-link-meta">
              ${h.date ? `<span>\uD83D\uDDD3\uFE0F ${esc(h.date)}</span>` : ''}
              <span class="ab-year-tag">${esc(h.yearShort)}</span>
            </span>
          </div>
          <span>\u2794</span>
        </a>
      `).join('') + `</div>`;
  }

  /* Υποστήριξη οριζόντιου Swipe (προστασία από pinch-zoom & back-gesture οθόνης) */
  function attachSwipe(el) {
    let startX = 0, startY = 0, tracking = false;
    el.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) { tracking = false; return; }
      const x = e.touches[0].clientX;
      if (x < 24 || x > window.innerWidth - 24) { tracking = false; return; }
      startX = x;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    el.addEventListener('touchmove', e => {
      if (e.touches.length > 1) tracking = false;
    }, { passive: true });

    el.addEventListener('touchend', e => {
      if (!tracking || e.changedTouches.length !== 1) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.8) {
        switchYear(dx < 0 ? activeIdx + 1 : activeIdx - 1);
      }
    }, { passive: true });
  }

  /* Event Listeners */
  document.getElementById('ab-prev').addEventListener('click', () => switchYear(activeIdx - 1));
  document.getElementById('ab-next').addEventListener('click', () => switchYear(activeIdx + 1));
  dotsEl.addEventListener('click', e => {
    const dot = e.target.closest('.ab-dot');
    if (dot) switchYear( Number(dot.dataset.idx) );
  });

  gridEl.addEventListener('click', e => {
    const tile = e.target.closest('.ab-tile');
    if (tile) openModal(tile.dataset.cat);
  });

  document.getElementById('ab-m-close').addEventListener('click', closeModal);
  modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && openModalCat) closeModal();
  });
  window.addEventListener('pageshow', () => {
    document.body.style.overflow = modalEl.classList.contains('open') ? 'hidden' : '';
  });

  inputEl.addEventListener('input', renderInstantSearch);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); inputEl.blur(); }
  });
  clearEl.addEventListener('click', () => { inputEl.value = ''; renderInstantSearch(); inputEl.focus(); });

  attachSwipe(heroEl);
  attachSwipe(gridEl);

  /* Εκκίνηση με προτεραιότητα στο τρέχον έτος */
  async function init() {
    renderAll();
    await loadYear(YEARS[0]);

    // Αν η νέα χρονιά δεν έχει ακόμα αναρτήσεις, γυρνάει αυτόματα στην προηγούμενη
    if (YEARS[0].total === 0 && !userInteracted) {
      await loadYear(YEARS[1]);
      if (YEARS[1].total > 0 && !userInteracted) {
        activeIdx = 1;
        renderAll();
      }
      loadYear(YEARS[2]);
    } else {
      Promise.all([loadYear(YEARS[1]), loadYear(YEARS[2])]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
