document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const input = document.getElementById("nl-input");
  const noticeWrapper = document.getElementById("nl-notice-wrapper");
  const submitBtn = document.getElementById("nl-submit-btn");
  const icon = document.getElementById("nl-icon");
  const form = document.getElementById("nl-form");

  // 1. Κρυφή Προειδοποίηση (Ανοίγει με το 1ο κλικ στο πεδίο)
  input?.addEventListener("focus", () => {
      noticeWrapper?.classList.add("open");
  }, { once: true });

  // 2. Έξυπνο Κουμπί (Ξεκλειδώνει όταν μπει "@" και ".")
  input?.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val.includes("@") && val.includes(".")) {
          submitBtn?.removeAttribute("disabled");
      } else {
          submitBtn?.setAttribute("disabled", "true");
      }
  });

  // 3. Εφέ Απογείωσης (Όταν πατηθεί η "Εγγραφή")
  form?.addEventListener("submit", () => {
      if (icon) {
          icon.innerHTML = "✈️";
          requestAnimationFrame(() => icon.classList.add("fly-away"));
      }
      if (submitBtn) {
          submitBtn.innerHTML = "Η εγγραφή στάλθηκε! 🚀";
          submitBtn.style.backgroundColor = "#27ae60"; // Γίνεται πράσινο
      }
  });
});
