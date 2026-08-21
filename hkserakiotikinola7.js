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

    if (globalFacts.length === 0) {
      textEl.innerHTML = "Δε βρέθηκαν πληροφορίες.";
      return;
    }

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
    const toggleFlip = () => {
      const isFlipped = inner.classList.contains("kf-is-flipped");
      const willBeFlipped = !isFlipped;
      
      inner.classList.toggle("kf-is-flipped", willBeFlipped);
      inner.setAttribute("aria-pressed", String(willBeFlipped));

      // Αν γυρνάει προς τα πίσω (δηλαδή την πατάμε για να δούμε το κείμενο),
      // βάζουμε το νέο κείμενο τη στιγμή που είναι ακριβώς στη μέση της περιστροφής (350ms).
      if (willBeFlipped) {
        setTimeout(updateText, 350);
      }
    };

    // Κλικ με το ποντίκι / δάχτυλο
    inner.addEventListener("click", toggleFlip);

    // Κλικ με το πληκτρολόγιο (Προσβασιμότητα)
    inner.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "Escape") {
        inner.classList.remove("kf-is-flipped");
        inner.setAttribute("aria-pressed", "false");
        // Στο desktop ανανεώνει το κείμενο έτοιμο για το επόμενο
        if (suffix === "desk") {
          setTimeout(updateText, 350);
        }
      }
    });

    // HOVER Effect ΜΟΝΟ στο Desktop
    if (suffix === "desk") {
      wrapper.addEventListener("mouseleave", () => {
        if (inner.classList.contains("kf-is-flipped")) return;
        
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
          if (!inner.classList.contains("kf-is-flipped")) {
            updateText();
          }
        }, 350);
      });
    }
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
