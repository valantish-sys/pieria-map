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
     "🚌 Εκδρομές & Επισκέψεις": ["εκδρομ", "επίσκεψ", "εκπαιδευτική επίσκεψη", "Θέατρική παράσταση" ],
    "🎉 Γιορτές & Επέτειοι": ["γιορτ", "εορτασμ", "επέτειος", "28η οκτωβρίου", "25η μαρτίου"],
    "⚽ Αθλητισμός & Δραστηριότητες": ["αθλητισμ", "αθλητικές δραστηριότητες", "σχολικός αθλητισμός", "έθιμ", "άνοιξη","πασχ","καραγκιοζ"],
    "🌿 Περιβάλλον & Φύση": ["φύση", "περιβαλλοντική", "ανακύκλωση"],
    "🏥 Υγεία & Ασφάλεια": ["υγεία", "ασφάλεια", "πρώτες βοήθειες"],
    "🤝 Κοινωνία & Αλληλεγγύη": ["κοινωνία", "αλληλεγγύη", "φιλανθρωπική", "εθελοντισμός",],
    "📚 Εκπαιδευτικά Προγράμματα": ["εκπαιδευτικό πρόγραμμα", "πρόγραμμα", "σεμινάριο", "ημερίδα", "ψηφιακός χώρος"],
    "🏫 Λειτουργία Σχολείου": ["λειτουργία σχολείου", "ανακοίνωση", "εγγραφές", "βαθμολογία", "Ε.Δ.Υ.", "ε.δ.υ.", "ε.δ.υ", "εδύ", "εδυ", "κτιρι"]

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
      "εγγραφ", "βαθμολογ", "αγιασμ", "ολοήμερ", "τηλεκπαίδευσ", "webex", "ενημέρωσ", "απουσί", "πρόγραμμα", "κηδεμόν", "ωράρι", "διευθυντ", "συνεδρίασ", "εγκύκλι", "ανακοίνωσ", "ωρολόγι", "απουσιολόγι", "κυλικεί", "επιτροπ", "συμβούλι", "εφημερί", "βαθμοί", "έλεγχ", "αργία", "κλειστά", "απεργί",  "αναμνηστικ"
    ]

  };

  const escapeHTML = str => str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));

async function loadSchoolYearActions(label, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Εμφάνιση αρχικού μηνύματος φόρτωσης για τον επισκέπτη
    container.innerHTML = '<div class="empty-message">Φόρτωση δεδομένων, παρακαλώ περιμένετε...</div>';

    try {
      const encodedLabel = encodeURIComponent(label);
      
      // ΝΕΑ ΛΟΓΙΚΗ: Κυκλική λήψη σε μικρές δόσεις!
      let startIndex = 1;
      const maxResults = 50; // Μικρή παρτίδα (50) γιατί φέρνουμε ολόκληρα κείμενα (default) για να τα "διαβάσει" ο αλγόριθμος
      let hasMore = true;
      let allEntries = [];
      
      const baseUrl = `https://dimperist.blogspot.com/feeds/posts/default/-/${encodedLabel}?alt=json`;

      // Κάνουμε "κύκλους" ζητώντας 50-50 μέχρι να μαζέψουμε ΟΛΑ τα άρθρα
   // Κάνουμε "κύκλους" ζητώντας 50-50 μέχρι να μαζέψουμε ΟΛΑ τα άρθρα
      while (hasMore) {
        const url = `${baseUrl}&max-results=${maxResults}&start-index=${startIndex}`;
        const response = await fetch(url);
        
        // Αν η ετικέτα δεν υπάρχει/δεν έχει άρθρα (404), σταματάμε ομαλά τη λήψη
        if (!response.ok) {
          hasMore = false;
          break;
        }

        const data = await response.json();
        
      if (data.feed?.entry && data.feed.entry.length > 0) {
          allEntries = allEntries.concat(data.feed.entry); // Ενώνουμε τα νέα άρθρα με τα παλιά
          startIndex += data.feed.entry.length;
          
          // ΑΦΑΙΡΕΘΗΚΕ ο λανθασμένος έλεγχος (< maxResults).
          // Η λήψη σταματάει πλέον αξιόπιστα μόνο όταν το API δεν έχει να στείλει απολύτως κανένα άλλο άρθρο (δηλαδή όταν πάει στο else).
        } else {
          hasMore = false;
        }
      }
      
      const entries = allEntries;
      
      if (entries.length === 0) {
        container.innerHTML = '<div class="empty-message">Δεν υπάρχουν ακόμα δράσεις καταχωρημένες.</div>';
        return;
      }

      const categoriesData = {};

      // Η διαδικασία κατηγοριοποίησης παραμένει ακριβώς η ίδια (και τέλεια) που είχες
     // Η διαδικασία κατηγοριοποίησης παραμένει ακριβώς η ίδια (και τέλεια) που είχες
      entries.forEach(entry => {
        // Χρήση προαιρετικής αλυσίδας (Optional Chaining) για ασφάλεια
        const title = entry.title?.$t || "Άρθρο χωρίς τίτλο";
        const link = entry.link.find(l => l.rel === 'alternate')?.href || '#';
        const content = entry.content?.$t || entry.summary?.$t || "";
        
        const publishedDate = new Date(entry.published.$t);
        const formattedDate = publishedDate.toLocaleDateString('el-GR');
        
     let assignedCategory = "📌 Γενικά"; 
        
        // ΝΕΟ: Συνάρτηση που μετατρέπει σε πεζά ΚΑΙ αφαιρεί όλους τους τόνους από τα γράμματα
        const normalizeText = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const normalizedTitle = normalizeText(title);
        const normalizedContent = normalizeText(content); // (ή cleanContent)

        const foundPriority = Object.entries(priorityKeywords).some(([categoryName, keywords]) => {
          if (keywords.some(kw => {
            const normalizedKw = normalizeText(kw); // Αφαίρεση τόνων και από τη λέξη-κλειδί!
            return normalizedTitle.includes(normalizedKw) || normalizedContent.includes(normalizedKw);
          })) {
            assignedCategory = categoryName;
            return true;
          }
          return false;
        });

        if (!foundPriority) {
          let maxMatches = 0;
          Object.entries(categoryKeywords).forEach(([categoryName, keywords]) => {
            const matchCount = keywords.filter(kw => {
              const normalizedKw = normalizeText(kw);
              return normalizedTitle.includes(normalizedKw) || normalizedContent.includes(normalizedKw);
            }).length;
            if (matchCount > maxMatches) {
              maxMatches = matchCount;
              assignedCategory = categoryName;
            }
          });
        }
        if (!categoriesData[assignedCategory]) categoriesData[assignedCategory] = [];
        categoriesData[assignedCategory].push({ title, link, date: formattedDate });
      });

    // Διατηρούμε την προσεγμένη θεματική σειρά με την οποία γράφτηκαν οι κατηγορίες στο `categoryColors`
      const predefinedOrder = Object.keys(categoryColors);
      const sortedCategories = Object.keys(categoriesData).sort((a, b) => {
        if (a === "📌 Γενικά") return 1;
        if (b === "📌 Γενικά") return -1;
        return predefinedOrder.indexOf(a) - predefinedOrder.indexOf(b);
      });

      container.innerHTML = sortedCategories.map((catName, index) => {
        const catColor = categoryColors[catName] || categoryColors["📌 Γενικά"];
        const postCount = categoriesData[catName].length;

        const postsHTML = categoriesData[catName].map((post, postIndex) => `
          <a href="${post.link}" class="action-block" style="--cat-color: ${catColor}; animation-delay: ${(index * 0.05) + (postIndex * 0.02)}s">
            <div style="display: flex; flex-direction: column; flex-grow: 1;">
              <span class="action-title">${escapeHTML(post.title)}</span>
              <span class="action-date">🗓️ ${post.date}</span>
            </div>
            <span class="action-arrow">➔</span>
          </a>
        `).join('');

        return `
          <div class="inner-accordion-item" style="animation-delay: ${index * 0.05}s">
            <button class="inner-header" style="--cat-color: ${catColor};">
              <span>${catName} <span class="category-badge">${postCount}</span></span>
              <span class="accordion-icon">+</span>
            </button>
            <div class="inner-content-grid">
              <div class="inner-content-inner">
                <div class="inner-padding">
                  <div class="actions-grid">
                    ${postsHTML}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Σφάλμα κατά τη φόρτωση:', error);
      container.innerHTML = '<div class="empty-message">Σφάλμα κατά τη φόρτωση των δεδομένων.</div>';
    }
  }

  // =========================================================================
  // Κεντρικός Ακροατής Γεγονότων (Event Delegation) ΧΩΡΙΣ JS HEIGHT CALCULATIONS
  // Το CSS Grid κάνει πλέον όλη τη μαγική δουλειά της αυξομείωσης!
  // =========================================================================
  document.addEventListener("click", function(e) {
    const header = e.target.closest('.outer-header, .inner-header');
    if (!header) return; 

    // Απλά αλλάζουμε την κλάση "active" στο κουμπί
    header.classList.toggle("active");
  });

 const initWidget = () => {
    loadSchoolYearActions("Δράσεις", "year-2025-container");
    loadSchoolYearActions("Δράσεις 14-25", "year-2014-container");
    loadSchoolYearActions("Δράσεις 26", "year-2026-container");
  };

  // Ελέγχουμε αν το DOM έχει ήδη φορτώσει. Αν ναι, εκτελούμε άμεσα, αλλιώς περιμένουμε το event.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
