(() => {
  "use strict";

  // 1. EVENT DELEGATION: Ένας κεντρικός "διακόπτης" για όλα τα Ακορντεόν
  document.addEventListener("click", function(e) {
    const header = e.target.closest('.accordion-header');
    if (!header) return; 
    header.classList.toggle("active");
  });

  // 2. Συνάρτηση μέτρησης και τοποθέτησης του αριθμού στην "Κονκάρδα" (Badge)
  function updateCount(container, countContainer) {
    if (container && countContainer) {
      const parentUl = container.closest('.accordion-list');
      if (parentUl) {
        const total = parentUl.querySelectorAll('li').length;
        if (total > 0) {
           countContainer.innerHTML = total;
           countContainer.style.display = 'inline-block';
        } else {
           countContainer.style.display = 'none';
        }
      }
    }
  }

  // 3. Σύγχρονη Μέθοδος (Fetch) για να τραβάει ΟΛΑ τα άρθρα ελαφριά
  async function fetchAccordionData(label, containerId, countId) {
    const container = document.getElementById(containerId);
    const countContainer = document.getElementById(countId);
    if (!container) return;

  let startIndex = 1;
    const maxResults = 150; // Μικρές παρτίδες
    let hasMore = true;

    const encodedLabel = encodeURIComponent(label);
    
    // ΠΡΟΣΟΧΗ: Χρησιμοποιούμε /summary/ για να είναι πανάλαφρο!
    const baseUrl = `/feeds/posts/summary/-/${encodedLabel}?alt=json`;

    try {
      // Κυκλική λήψη μέχρι να βρει ΟΛΑ τα άρθρα της κατηγορίας
      while (hasMore) {
        const response = await fetch(`${baseUrl}&max-results=${maxResults}&start-index=${startIndex}`);
        const data = await response.json();

        if (data.feed && data.feed.entry && data.feed.entry.length > 0) {
       let batchHtmlCode = '';

        data.feed.entry.forEach(entry => {
            const rawTitle = entry.title.$t || "Χωρίς τίτλο";
            // Ασφαλής μετατροπή ειδικών χαρακτήρων για αποφυγή κατάρρευσης του HTML
            const postTitle = rawTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            
            const linkObj = entry.link.find(l => l.rel === 'alternate');
            const postUrl = linkObj ? linkObj.href : '#';
            
            batchHtmlCode += `<li><a href="${postUrl}">${postTitle}</a></li>`;
          });
          
          // Άμεση προβολή της παρτίδας στην οθόνη! Αν κοπεί το ίντερνετ μετά, αυτά τα άρθρα έχουν σωθεί.
          container.insertAdjacentHTML('beforeend', batchHtmlCode);
          
        // Άμεση ενημέρωση του αριθμού στην κονκάρδα ώστε ο επισκέπτης να βλέπει τη φόρτωση ζωντανά
          updateCount(container, countContainer);

          startIndex += data.feed.entry.length;
          
          // Αν επιστράφηκαν λιγότερα άρθρα από το όριο (150), σημαίνει πως δεν υπάρχουν άλλα.
          // Σταματάμε τη λούπα άμεσα για να αποφύγουμε την επόμενη, περιττή κλήση δικτύου.
          if (data.feed.entry.length < maxResults) {
            hasMore = false;
          }
 
        } else {
          hasMore = false;
        } 
  } // <--- Αυτή η αγκύλη κλείνει τη λούπα "while (hasMore)"
    } catch (error) { // <--- Εδώ κλείνει το "try" και ξεκινάει το "catch"
      console.warn(`Σφάλμα κατά τη φόρτωση της κατηγορίας ${label}:`, error);
      updateCount(container, countContainer); // Ενημέρωση κονκάρδας έστω και για τα χειροκίνητα
    }
  } // <--- Αυτή η αγκύλη κλείνει ολόκληρη τη συνάρτηση "fetchAccordionData"

 // 4. ΕΚΚΙΝΗΣΗ
  function initAccordion() {
    // Ενημερώνουμε αρχικά τις κονκάρδες (σε περίπτωση που έχεις βάλει στατικά άρθρα με το χέρι)
    updateCount(document.getElementById('auto-parenting'), document.getElementById('count-parenting'));
    updateCount(document.getElementById('auto-psychology'), document.getElementById('count-psychology'));
    updateCount(document.getElementById('auto-school'), document.getElementById('count-school'));
    updateCount(document.getElementById('auto-health'), document.getElementById('count-health'));
    updateCount(document.getElementById('auto-play'), document.getElementById('count-play'));
    updateCount(document.getElementById('auto-general'), document.getElementById('count-general'));

    // Εκτελούνται όλα παράλληλα στο παρασκήνιο (ασύγχρονα) χωρίς να κολλάνε το site!
    fetchAccordionData('Διαπαιδαγώγηση', 'auto-parenting', 'count-parenting');
    fetchAccordionData('Ψυχολογία', 'auto-psychology', 'count-psychology');
    fetchAccordionData('Σχολείο', 'auto-school', 'count-school');
    fetchAccordionData('Υγεία', 'auto-health', 'count-health');
    fetchAccordionData('Παιχνίδι', 'auto-play', 'count-play');
    fetchAccordionData('Γενικά', 'auto-general', 'count-general');
  }

  // Αν η σελίδα έχει ήδη φορτώσει εκτελούμε αμέσως, διαφορετικά περιμένουμε το συμβάν
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initAccordion);
  } else {
    initAccordion();
  }
})();
