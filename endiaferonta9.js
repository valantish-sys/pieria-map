(() => {
  "use strict";

  const CATEGORIES = [
    {
      id: 'parenting', title: 'Διαπαιδαγώγηση', feedLabel: 'Διαπαιδαγώγηση', icon: '🌱', color: '#9b59b6',
      posts: [
        { title: 'Τα όρια δεν είναι φράχτες', url: 'https://dimperist.blogspot.com/p/blog-page_8.html' },
        { title: 'Αόρατος γονιός', url: 'https://dimperist.blogspot.com/p/blog-page_1.html' },
        { title: 'Πώς θα μεγαλώσουμε αυτόνομα και ανεξάρτητα παιδιά', url: 'https://dimperist.blogspot.com/p/blog-page_13.html' },
        { title: 'Τρόποι μείωσης της χρήσης οθονών από τα παιδιά', url: 'https://dimperist.blogspot.com/p/blog-page.html' }
      ]
    },
    {
      id: 'psychology', title: 'Ψυχολογία', feedLabel: 'Ψυχολογία', icon: '🧠', color: '#2980b9',
      posts: [
        { title: '10 τρόποι για να εκτιμά το παιδί τον εαυτό του', url: 'https://dimperist.blogspot.com/p/10.html' },
        { title: 'Τι κάνω όταν το παιδί μου θυμώνει;', url: 'https://dimperist.blogspot.com/p/blog-page_86.html' },
        { title: 'Παιδικές φοβίες: Αιτίες και Τρόποι Αντιμετώπισης', url: 'https://dimperist.blogspot.com/p/blog-page_32.html' },
        { title: 'Συναισθηματική ανάπτυξη & "αρνητικά" συναισθήματα', url: 'https://dimperist.blogspot.com/p/blog-page_43.html' },
        { title: 'Γράμμα παιδιού', url: 'https://dimperist.blogspot.com/p/blog-page_71.html' },
        { title: 'Το παιδί μου αντιμιλά, τι να κάνω;', url: 'https://dimperist.blogspot.com/p/blog-page_98.html' }
      ]
    },
    {
      id: 'school', title: 'Σχολείο & Βιβλία', feedLabel: 'Σχολείο', icon: '📚', color: '#f39c12',
      posts: [
        { title: '10 Συμβουλές για να αγαπήσουν τα «πρωτάκια» το σχολείο', url: 'https://dimperist.blogspot.com/p/10_19.html' },
        { title: 'Συμβουλές για καλύτερη επιστροφή στο σχολείο', url: 'https://dimperist.blogspot.com/p/blog-page_19.html' },
        { title: 'Οργάνωση μελέτης του παιδιού', url: 'https://dimperist.blogspot.com/p/blog-page_20.html' },
        { title: 'Πώς να κάνουν τα παιδιά να αγαπήσουν τα βιβλία', url: 'https://dimperist.blogspot.com/p/blog-page_29.html' },
        { title: 'Τι ΝΑ κάνετε και τι να ΜΗΝ κάνετε με το διάβασμα', url: 'https://dimperist.blogspot.com/p/blog-page_64.html' },
        { title: 'Bullying - Σχολικός Εκφοβισμός', url: 'https://dimperist.blogspot.com/p/bullying.html' }
      ]
    },
    {
      id: 'health', title: 'Υγεία & Ασφάλεια', feedLabel: 'Υγεία', icon: '🏥', color: '#e74c3c',
      posts: [
        { title: '«Παιδική παχυσαρκία: Πρόληψη και σωστές διατροφικές συνήθειες»', url: 'https://dimperist.blogspot.com/p/blog-page_85.html' },
        { title: 'Η άσκηση ως τρόπος ζωής', url: 'https://dimperist.blogspot.com/2026/01/blog-post_14.html' },
        { title: 'Ανακαλύψετε το σωστό άθλημα για το παιδί σας', url: 'https://dimperist.blogspot.com/2026/02/blog-post_5.html' },
        { title: 'Προστατεύομαι από τους σεισμούς', url: 'https://dimperist.blogspot.com/p/blog-page_59.html' }
      ]
    },
    {
      id: 'play', title: 'Παιχνίδι & Δημιουργικότητα', feedLabel: 'Παιχνίδι', icon: '🎨', color: '#27ae60',
      posts: [
        { title: 'Ενθαρρύνουμε τη δημιουργικότητα των παιδιών', url: 'https://dimperist.blogspot.com/p/blog-page_41.html' },
        { title: 'Η σημασία του παιχνιδιού στην ανάπτυξη', url: 'https://dimperist.blogspot.com/p/blog-page_83.html' },
        { title: 'Δραστηριότητες που αναπτύσσουν τις μαθησιακές δεξιότητες', url: 'https://dimperist.blogspot.com/p/blog-page_56.html' }
      ]
    },
    {
      id: 'general', title: 'Γενικά Θέματα', feedLabel: 'Γενικά', icon: '📌', color: '#7f8c8d',
      posts: []
    }
  ];

 const txtEl = document.createElement('textarea');
  const dec = s => String(s || '').replace(/&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z0-9]+);/g, m => { txtEl.innerHTML = m; return txtEl.value; });
  const clean = s => dec(dec(s));
  const esc = s => clean(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const escUrl = u => String(u || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const countTxt = n => `${n} ${n === 1 ? 'άρθρο' : 'άρθρα'}`;
  const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ς/g, 'σ');
  const normUrl = u => (u || '').trim().replace(/^https?:\/\//i, '').replace(/\?m=[01]$/, '').replace(/\/$/, '');
  const gridEl = document.getElementById('bv2-grid');
  const inputEl = document.getElementById('bv2-input');
  const clearEl = document.getElementById('bv2-clear');
  const instantEl = document.getElementById('bv2-instant');
  let openCatId = null;

  // Δημιουργία Modal απευθείας στο body ώστε να μην εγκλωβίζεται από το Blogger template
  const oldModal = document.getElementById('bv2-modal-overlay');
  if (oldModal) oldModal.remove();
  const modalEl = document.createElement('div');
  modalEl.id = 'bv2-modal-overlay';
  modalEl.className = 'bv2-modal-wrap';
  modalEl.innerHTML = `
    <div class="bv2-sheet" id="bv2-sheet">
      <div class="bv2-sheet-head">
        <div class="bv2-sheet-title" id="bv2-m-title"></div>
        <button type="button" class="bv2-close" id="bv2-m-close">✕</button>
      </div>
      <div class="bv2-sheet-body" id="bv2-m-body"></div>
    </div>
  `;
  document.body.appendChild(modalEl);

  function renderBento() {
    gridEl.innerHTML = CATEGORIES.map(c => {
      const previews = c.posts.slice(0, 2).map(p => `<div class="bv2-prev-item">${esc(p.title)}</div>`).join('');
      return `
        <div class="bv2-tile" data-cat="${c.id}" style="--c:${c.color}">
          <div>
            <div class="bv2-tile-head">
              <span class="bv2-tile-icon">${c.icon}</span>
              <span class="bv2-count">${countTxt(c.posts.length)}</span>
            </div>
            <div class="bv2-tile-title">${esc(c.title)}</div>
            <div class="bv2-previews">
              ${previews || '<div class="bv2-prev-item">Πατήστε για προβολή θεμάτων...</div>'}
            </div>
          </div>
          <div class="bv2-cta">Προβολή όλων <span>➔</span></div>
          <div class="bv2-watermark">${c.icon}</div>
        </div>
      `;
    }).join('');
  }

  function renderModalContent(cat) {
    document.getElementById('bv2-sheet').style.setProperty('--c', cat.color);
    document.getElementById('bv2-m-title').textContent = `${cat.icon} ${clean(cat.title)} (${countTxt(cat.posts.length)})`;
    const body = document.getElementById('bv2-m-body');
    if (!cat.posts.length) {
      body.innerHTML = `<div style="padding:20px;text-align:center;color:#64748b;">Δεν υπάρχουν διαθέσιμα άρθρα αυτή τη στιγμή.</div>`;
      return;
    }
    body.innerHTML = cat.posts.map(p => `
      <a class="bv2-link" href="${escUrl(p.url)}" style="--c:${cat.color}">
        <span>${esc(p.title)}</span><span>➔</span>
      </a>
    `).join('');
  }

  function openModal(catId) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    openCatId = catId;
    renderModalContent(cat);
    modalEl.classList.add('open');
    document.getElementById('bv2-m-body').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    openCatId = null;
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
    CATEGORIES.forEach(c => {
      const catNorm = norm(c.title);
      c.posts.forEach(p => {
        const hay = `${norm(p.title)} ${catNorm}`;
        if (words.every(w => hay.includes(w))) {
          const key = normUrl(p.url);
          if (!seenHits.has(key)) {
            seenHits.add(key);
            hits.push({ ...p, cat: c });
          }
        }
      });
    });

    instantEl.classList.add('open');
    if (!hits.length) {
      instantEl.innerHTML = `<div style="color:#64748b;padding:8px;">Δεν βρέθηκε άρθρο για \u00AB${esc(inputEl.value)}\u00BB.</div>`;
      return;
    }
    const resLabel = hits.length === 1 ? 'Βρέθηκε 1 αποτέλεσμα:' : `Βρέθηκαν ${hits.length} αποτελέσματα:`;
    instantEl.innerHTML = `<div style="font-size:0.82rem;font-weight:700;color:#64748b;margin-bottom:10px;">${resLabel}</div>` +
      `<div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;">` +
      hits.map(h => `<a class="bv2-link" href="${escUrl(h.url)}" style="--c:${h.cat.color}">
        <span><strong style="color:${h.cat.color}">${h.cat.icon}</strong> ${esc(h.title)}</span><span>➔</span>
      </a>`).join('') + `</div>`;
  }
  async function fetchCategory(cat) {
    const seen = new Set(cat.posts.map(p => normUrl(p.url)));
    let startIndex = 1, maxResults = 150, hasMore = true;
    try {
      while (hasMore) {
        const res = await fetch(`/feeds/posts/summary/-/${encodeURIComponent(cat.feedLabel)}?alt=json&max-results=${maxResults}&start-index=${startIndex}`);
        const data = await res.json();
        const entries = data.feed && data.feed.entry ? data.feed.entry : [];
        if (entries.length > 0) {
          let added = false;
          entries.forEach(entry => {
            const title = (entry.title && entry.title.$t) ? entry.title.$t : 'Χωρίς τίτλο';
            const linkObj = (entry.link || []).find(l => l.rel === 'alternate');
            const url = linkObj ? linkObj.href : '#';
            const key = normUrl(url);
            if (!seen.has(key)) { seen.add(key); cat.posts.push({ title, url }); added = true; }
          });
          if (added) {
            renderBento();
            if (openCatId === cat.id) renderModalContent(cat);
            if (inputEl.value.trim()) renderInstantSearch();
          }
          startIndex += entries.length;
          if (entries.length < maxResults) hasMore = false;
        } else hasMore = false;
      }
    } catch (e) { console.warn('Σφάλμα φόρτωσης:', cat.feedLabel, e); }
  }

  gridEl.addEventListener('click', e => {
    const tile = e.target.closest('.bv2-tile');
    if (tile) openModal(tile.dataset.cat);
  });
  document.getElementById('bv2-m-close').addEventListener('click', closeModal);
  modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && openCatId) closeModal(); });
  inputEl.addEventListener('input', renderInstantSearch);
  clearEl.addEventListener('click', () => { inputEl.value = ''; renderInstantSearch(); inputEl.focus(); });

  renderBento();
  CATEGORIES.forEach(fetchCategory);
})();
