(() => {
  "use strict";

  // Το ακριβές JSON σου
  const JSON_URL = "https://cdn.jsdelivr.net/gh/valantish-sys/pieria-map@main/kidsFactsMob.json";
  let globalFacts = [];

  // Εργαλείο: Ανακάτεμα του πίνακα
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Ενεργοποιεί κάθε κάρτα αυτόνομα
  const setupWidget = (suffix) => {
    const inner = document.getElementById(`kf-inner-${suffix}`);
    const textEl = document.getElementById(`kf-fact-${suffix}`);
    const wrapper = document.getElementById(`kf-wrapper-${suffix}`);

  if (!inner || !textEl || !wrapper) return;

    // FIX: Ενεργοποιεί το focus για το πληκτρολόγιο (tabindex) και λύνει το "νεκρό" κλικ στα iPhone
    inner.setAttribute("tabindex", "0");
    inner.setAttribute("role", "button");

    // Τοπική μνήμη για την κάθε κάρτα
    let shuffled = shuffleArray(globalFacts);
    let index = 0;
    let updateTimer = null;

    // Συνάρτηση που αλλάζει το κείμενο χρησιμοποιώντας ΠΑΝΤΑ το innerHTML
    const updateText = () => {
      if (index >= shuffled.length) {
        shuffled = shuffleArray(globalFacts);
        index = 0;
      }
      textEl.innerHTML = shuffled[index];
      index++;
    };

    // Αρχική φόρτωση του πρώτου κειμένου
    updateText();

    // Η Λογική της Περιστροφής
  // Η Λογική της Περιστροφής
    const toggleFlip = () => {
      const isFlipped = inner.classList.contains("kf-is-flipped");
      const willBeFlipped = !isFlipped;
      
      inner.classList.toggle("kf-is-flipped", willBeFlipped);
      inner.setAttribute("aria-pressed", String(willBeFlipped));

      // FIX: Ακυρώνουμε προηγούμενο timer αν γίνει απανωτό κλικ (Spam Click)
      if (updateTimer) clearTimeout(updateTimer);

      // FIX: Αλλάζουμε το κείμενο ΜΟΝΟ όταν η κάρτα ΚΛΕΙΝΕΙ (!willBeFlipped), 
      // ώστε να ετοιμαστεί κρυφά το επόμενο fact χωρίς να "κάψουμε" το τωρινό!
      if (!willBeFlipped) {
        updateTimer = setTimeout(updateText, 350);
      }
    };

  // Κλικ με το ποντίκι / δάχτυλο
    inner.addEventListener("click", () => {
      // Αν ο χρήστης έχει επιλέξει (μαρκάρει) κείμενο, αγνοούμε το κλικ για να μη γυρίσει η κάρτα απότομα
      if (window.getSelection().toString().trim().length > 0) return;
      
      toggleFlip();
    });

   // Κλικ με το πληκτρολόγιο (Προσβασιμότητα)
    inner.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "Escape") {
        if (inner.classList.contains("kf-is-flipped")) {
          toggleFlip(); // Χρησιμοποιούμε τη σωστή συνάρτηση για να κλείσει και να ανανεωθεί σωστά
        }
      }
    });

 
  };

  // Εκκίνηση (Κατεβάζει το JSON και ξεκινάει τις κάρτες)
  const init = async () => {
    try {
      const response = await fetch(JSON_URL);
      if (response.ok) {
        const data = await response.json();
        // Διαβάζει αποκλειστικά το kidsFactsMob
        globalFacts = data.kidsFactsMob || [];
      }
   } catch (e) {
      console.error("Σφάλμα φόρτωσης δεδομένων:", e);
    }
    
    // FIX: Αν το JSON αποτύχει ή είναι άδειο, βάζουμε το μήνυμα ως "μοναδική πληροφορία" (fact)
    // Έτσι η κάρτα συνεχίζει να λειτουργεί κανονικά και ο χρήστης, γυρίζοντάς την, βλέπει το μήνυμα!
    if (globalFacts.length === 0) {
      globalFacts = ["Δε βρέθηκαν πληροφορίες αυτή τη στιγμή. Δοκιμάστε ξανά αργότερα!"];
    }

    // Ενεργοποιεί ταυτόχρονα το κινητό και το PC!
    setupWidget("mob");
    setupWidget("desk");
  };

  // Τρέχει μόλις φορτώσει η σελίδα
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
