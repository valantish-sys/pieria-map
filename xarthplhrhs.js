(function() {
  // Ορίζουμε το CSS ως String χρησιμοποιώντας backticks
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Lora:ital,wght@0,600;1,400&display=swap');

  .pieria-tolkien-widget {
    width: 100%;
    max-width: 680px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: auto;
    margin-right: auto;
    background: #2b261f;
    border: 4px solid #8c7355;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.7), inset 0 0 15px rgba(0,0,0,0.8);
    text-align: center;
    font-family: 'Lora', serif;
    position: relative;
    box-sizing: border-box;
  }

  .pt-header { margin-bottom: 16px; }
  
  .pt-title {
    font-family: 'Cinzel', serif;
    font-size: 24px;
    font-weight: 900;
    color: #d4c29d;
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }

  .pt-subtitle {
    font-size: 13px;
    color: #a39274;
    font-style: italic;
    margin-top: 4px;
  }

  /* ΤΟ ΧΑΡΤΙ ΠΕΡΓΑΜΗΝΗΣ */
  .tolkien-map-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 11;
    border: 3px solid #5c4a36;
    border-radius: 4px;
    box-shadow: inset 0 0 40px rgba(71, 52, 30, 0.6);
    overflow: hidden;
    background-color: #e3d8bc;
    /* Εφέ υφής παλιού χαρτιού με CSS */
    background-image: 
      radial-gradient(circle at 50% 50%, transparent 60%, rgba(92, 74, 54, 0.4) 100%),
      linear-gradient(rgba(181, 161, 126, 0.1) 2px, transparent 2px),
      linear-gradient(90deg, rgba(181, 161, 126, 0.1) 2px, transparent 2px);
    background-size: 100% 100%, 30px 30px, 30px 30px;
  }

  /* CSS DRAWING: ΘΑΛΑΣΣΑ (Δεξιά) */
  .tolkien-sea {
    position: absolute;
    top: 0; right: 0;
    width: 32%; height: 100%;
    background: #84a5b3;
    box-shadow: inset 15px 0 25px rgba(227, 216, 188, 0.7);
    border-left: 2px dashed #6b8894;
  }
  
  /* Γραμμές κυμάτων "σχεδιασμένες με πενάκι" */
  .tolkien-sea::after {
    content: '~   ~   ~\A  ~   ~   ~\A    ~   ~';
    white-space: pre;
    position: absolute;
    top: 20%; left: 30%;
    color: rgba(43, 65, 75, 0.3);
    font-family: monospace;
    font-size: 20px;
    line-height: 40px;
  }

  /* CSS DRAWING: ΒΟΥΝΑ ΣΤΥΛ TOLKIEN */
  .mountain-group {
    position: absolute;
    pointer-events: none;
  }

  /* Το κάθε βουνό είναι ένα σκοτεινό τρίγωνο με λευκή κορυφή */
  .t-peak {
    position: absolute;
    width: 0; height: 0;
    border-left: 35px solid transparent;
    border-right: 35px solid transparent;
    border-bottom: 55px solid #4a525d; /* Σχιστόλιθος */
    filter: drop-shadow(5px 3px 2px rgba(0,0,0,0.25));
  }
  
  /* Το χιόνι στην κορυφή */
  .t-peak::after {
    content: '';
    position: absolute;
    top: 0; left: -12px;
    width: 0; height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 22px solid #eef2f5;
  }

  /* ΠΙΝΕΖΕΣ - ΜΕΣΑΙΩΝΙΚΑ ΛΑΒΑΡΑ (Banners) */
  .t-banner {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 20;
    transition: transform 0.2s;
  }

  .t-banner:hover {
    transform: translate(-50%, -60%) scale(1.15);
    z-index: 50;
  }

  .banner-label {
    background: #6e2525; /* Βαθύ κόκκινο Μέσης Γης */
    border: 1.5px solid #d4c29d;
    color: #f7f4eb;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 2px;
    box-shadow: 2px 4px 6px rgba(0,0,0,0.4);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.5px;
  }

  /* ΠΕΡΙΣΤΑΣΗ: ΒΑΣΙΛΙΚΟ ΛΑΒΑΡΟ */
  .banner-peristasi { z-index: 40; }
  
  .banner-peristasi .banner-label {
    background: #c29b38; /* Βασιλικό Χρυσό */
    color: #1a140c;
    border: 2px solid #ffffff;
    font-weight: 900;
    box-shadow: 0 0 15px rgba(194, 155, 56, 0.8);
    animation: royal-pulse 2.5s infinite;
  }

  @keyframes royal-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }

  /* ΠΕΡΓΑΜΗΝΗ ΠΛΗΡΟФΟΡΙΩΝ (POPUP) */
  .tolkien-tooltip {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    width: 82%;
    max-width: 340px;
    background: #f4ecd8;
    border: 3px solid #6e2525;
    border-radius: 6px;
    padding: 20px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    opacity: 0;
    visibility: hidden;
    transition: all 0.25s ease;
    z-index: 100;
    text-align: center;
  }

  .tolkien-tooltip.active {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, -50%) scale(1);
  }

  .tolkien-tooltip h4 {
    font-family: 'Cinzel', serif;
    margin: 0 0 10px 0;
    color: #591c1c;
    font-size: 17px;
    font-weight: 900;
    border-bottom: 1px solid #c8b99c;
    padding-bottom: 6px;
  }

  .tolkien-tooltip p {
    margin: 0 0 18px 0;
    color: #3b3228;
    font-size: 13px;
    line-height: 1.5;
  }

  .close-t-btn {
    background: #591c1c;
    color: #d4c29d;
    font-family: 'Cinzel', serif;
    border: 1px solid #8c7355;
    padding: 8px 18px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 1px;
  }
  .close-t-btn:hover { background: #7a2626; }

  @media (max-width: 680px) {
  .pt-title { 
    /* Εδώ οι ρυθμίσεις για το pt-title αν θέλεις */
  }
  
  /* Οι υπόλοιπες κλάσεις μέσα στο media query, αλλά ΕΞΩ από το .pt-title */
  .banner-label { font-size: 8px; padding: 3px 5px; }
  .banner-peristasi .banner-label { font-size:9px; }

} /* <-- ΑΥΤΗ η αγκύλη έλειπε και σου χαλούσε το min-width παρακάτω! */
@media (max-width: 680px) {
  /* Αλλάζει το ύψος και την εμφάνιση του container στα κινητά */
  .pieria-tolkien-widget {
    height: 85vh; /* Καταλαμβάνει το 90% του ύψους της οθόνης */
    display: flex;
    flex-direction: column;
  }

  /* Ο χάρτης μεγαλώνει για να γεμίσει τον διαθέσιμο χώρο */
  .tolkien-map-frame {
    flex-grow: 1;
    aspect-ratio: auto; /* Καταργούμε το σταθερό ratio για να μην αφήνει κενά */
  }

  .banner-label { font-size: 8px!important; padding: 3px 5px; }
  .banner-peristasi .banner-label { font-size: 9px!important; }
}
/* CSS DRAWING: ΔΕΝΤΡΑ (Στυλ Tolkien) */
  .t-tree {
    position: absolute;
    width: 0; height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 20px solid #2b5736; /* Σκούρο πράσινο */

animation: t-wind 4s infinite ease-in-out;
  }
  
  .t-tree::after {
    content: '';
    position: absolute;
    bottom: -24px; left: -2px;
    width: 4px; height: 10px;
    background: #5c4a36; /* Καφέ κορμός */
  }

  /* ΟΜΑΔΕΣ ΔΕΝΤΡΩΝ */
  .tree-group {
    position: absolute;
    pointer-events: none;
    z-index: 10;
  }

  /* CSS DRAWING: ΒΑΡΚΕΣ (Στη Θάλασσα) */
  .t-boat {
    position: absolute;
    width: 25px; height: 8px;
    background: #5c4a36; /* Καφέ σκάφος */
    border-radius: 0 0 10px 10px;
 
    z-index: 15;
animation: t-boat 6s infinite ease-in-out;
  }

  .t-boat::before { /* Κατάρτι */
    content: '';
    position: absolute;
    top: -10px; left: 10px;
    width: 2px; height: 10px;
    background: #5c4a36;
  }

  .t-boat::after { /* Πανί */
    content: '';
    position: absolute;
    top: -10px; left: 2px;
    width: 0; height: 0;
    border-left: 8px solid #f4ecd8;
    border-bottom: 10px solid transparent;
  }

 /* ΣΩΣΤΟ ΣΧΗΜΑ ΔΕΛΦΙΝΙΟΥ */
  .t-dolphin {
    position: absolute;
    width: 22px; 
    height: 8px;
    background: #3a434c;
    border-radius: 70% 30% 20% 40%;
    transform: rotate(-15deg);
    z-index: 15;
    animation: t-leap 4s infinite ease-in-out;
  }

  /* Ραχιαίο πτερύγιο */
  .t-dolphin::before {
    content: '';
    position: absolute;
    top: -4px; 
    left: 8px;
    width: 6px; 
    height: 6px;
    background: #3a434c;
    clip-path: polygon(0 100%, 35% 0, 100% 100%);
    transform: rotate(18deg);
  }

  /* Ουρά */
  .t-dolphin::after {
    content: '';
    position: absolute;
    top: -1px; 
    left: -5px;
    width: 7px; 
    height: 8px;
    background: #3a434c;
    clip-path: polygon(0 0, 100% 50%, 0 100%, 45% 50%);
  }
@keyframes t-leap {
    0%, 100% { transform: translateY(0px) rotate(-18deg); }
    50%      { transform: translateY(-4px) rotate(8deg); }
  }


  @keyframes t-boat {
    0%, 100% { transform: translateY(0px) rotate(-7deg); }
    50%      { transform: translateY(-2px) rotate(6deg); }
  }
/* ΤΟ ΣΧΗΜΑ ΤΟΥ ΓΛΑΡΟΥ */
.t-bird {
  position: absolute;
  width: 16px;       /* Ήταν 14px, το κάναμε ελάχιστα πιο μεγάλο */
  height: 7px;
  z-index: 12; 
  animation: t-flap 2.5s infinite ease-in-out;
  opacity: 0.9;      /* ΑΥΞΗΘΗΚΕ: Από 0.6 πήγε στο 0.9 για να φαίνεται καθαρά */
}

/* Αριστερό φτερό */
.t-bird::before {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 50%; height: 100%;
  border-top: 2px solid #2b1a08;   /* ΑΛΛΑΧΘΗΚΕ: Πιο χοντρή γραμμή και σκούρο μελάνι */
  border-right: 2px solid #2b1a08; /* ΑΛΛΑΧΘΗΚΕ: Πιο χοντρή γραμμή και σκούρο μελάνι */
  border-radius: 0 100% 0 0;
}

/* Δεξί φτερό */
.t-bird::after {
  content: '';
  position: absolute;
  right: 0; top: 0;
  width: 50%; height: 100%;
  border-top: 2px solid #2b1a08;   /* ΑΛΛΑΧΘΗΚΕ: Πιο χοντρή γραμμή και σκούρο μελάνι */
  border-left: 2px solid #2b1a08;  /* ΑΛΛΑΧΘΗΚΕ: Πιο χοντρή γραμμή και σκούρο μελάνι */
  border-radius: 100% 0 0 0;
}
/* ΚΙΝΗΣΗ ΦΤΕΡΩΝ (Ανοιγοκλείνουν και ανεβοκατεβαίνουν ελαφρώς) */
@keyframes t-flap {
  0%, 100% { 
    transform: scaleY(1) translateY(0px); 
  }
  50% { 
    transform: scaleY(0.4) translateY(-3px); /* Τα φτερά κλείνουν προς τα πάνω */
  }
}
/* Εφαρμογή σταθερού ύψους 800px για μεγάλες οθόνες */
@media (min-width: 770px) {
  .tolkien-map-frame {
    height: 570px !important; 
    aspect-ratio: auto; 
  }
.pieria-tolkien-widget {
    width: 100%;
   margin-top: 25px;
}
}
.tolkien-tt-img {
    width: 100%;
    max-height: 130px;
    object-fit: cover;
    border: 2px solid #8c7355;
    border-radius: 4px;
    margin-bottom: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    filter: sepia(0.3) contrast(1.1); /* Δίνει μια ελαφριά αίσθηση παλιού χαρτιού */
  }
  @media (max-width: 680px) {
  .pt-title { 
    font-size: 23px !important; /* Εδώ αλλάζεις το μέγεθος για κινητά */
font-weight: 700 !important;
  }
  }
.t-kraken-attack {
  position: absolute;
  width: 75px;
  height: 65px;
  z-index: 14;
  display: none; /* <-- ΠΡΟΣΘΕΣΕ ΑΥΤΟ για να είναι κρυμμένο στην αρχή */
}

/* ΠΡΟΣΘΕΣΕ ΑΥΤΗ ΤΗΝ ΚΛΑΣΗ */
.t-kraken-attack.active {
  display: block; 
}
/* Νευρικό κούνημα καραβιού */
.shaking-boat {
  animation: kraken-boat-shake 2s infinite ease-in-out;
  transform-origin: 50% 55px;
}
@keyframes kraken-boat-shake {
  0%, 100% { transform: rotate(-5deg) translateY(0px); }
  25% { transform: rotate(4deg) translateY(-1px); }
  50% { transform: rotate(-6deg) translateY(1px); }
  75% { transform: rotate(5deg) translateY(-0.5px); }
}
/* === ΜΥΘΙΚΑ SVG ΤΕΡΑΤΑ (ΟΠΩΣ ΤΟ ΚΡΑΚΕΝ) === */
.t-stym-wrap {
  position: absolute;
  z-index: 14;
  display: none; /* Κρυμμένα αρχικά όπως το Κράκεν */
  
}

/* Εμφανίζονται όταν προστεθεί η κλάση .active από το JS σου */

.t-stym-wrap.active {
  display: block; 
}

/* 3. Στυμφαλίδες */
.t-stym-wrap { 
  width: 90px; height: 70px; 
  animation: flock-fly 36s infinite linear; 
  filter: drop-shadow(2px 5px 3px rgba(0,0,0,0.5)); 
}
.stym-wing { 
  transform-origin: center; 
  animation: wing-flap 0.2s infinite alternate; 
}
.stym-wing.right { 
  transform-origin: center; 
  animation: wing-flap-r 0.2s infinite alternate; 
}

@keyframes wing-flap { 0% { transform: scaleY(1) rotate(0deg); } 100% { transform: scaleY(0.5) rotate(10deg); } }
@keyframes wing-flap-r { 0% { transform: scaleY(1) rotate(0deg); } 100% { transform: scaleY(0.5) rotate(-10deg); } }

@keyframes flock-fly {
  0% { transform: translate(-40px, -20px) scale(0.7); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate(70px, 30px) scale(1); opacity: 0; }
}
/* Βασικό container - Φαίνεται κατευθείαν στον χάρτη */
.t-sirens-song {
  position: absolute;
  width: 70px;
  height: 60px;
  z-index: 50;
  /* Προαιρετικά: cursor: pointer; αν θέλεις να πατιέται */
display: none; /* <-- ΠΡΟΣΘΕΣΕ ΑΥΤΟ για να είναι κρυμμένο */
cursor: pointer; /* <-- ΠΡΟΣΘΕΣΕ ΑΥΤΟ για να φαίνεται ότι πατιέται */
}
/* ΠΡΟΣΘΕΣΕ ΑΥΤΗ ΤΗΝ ΚΛΑΣΗ για να το εμφανίζεις με JavaScript */
.t-sirens-song.active {
  display: block; 
}

/* Υπνωτισμένο πλοίο που παρασύρεται αργά προς τα δεξιά */
.drifting-boat {
  animation: boat-trance 4s infinite ease-in-out;
  transform-origin: 25px 62px;
}

@keyframes boat-trance {
  0% { transform: translateX(0px) rotate(0deg) translateY(0px); }
  50% { transform: translateX(3px) rotate(2deg) translateY(1px); }
  100% { transform: translateX(0px) rotate(0deg) translateY(0px); }
}

/* Η Σειρήνα που λικνίζεται ελκυστικά καθώς τραγουδά */
.siren-figure {
  animation: siren-sway 3s infinite ease-in-out;
  transform-origin: 75px 52px; /* Το σημείο που "κάθεται" στον βράχο */
}

@keyframes siren-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* Το τραγούδι: Κύματα που ταξιδεύουν προς το καράβι και σβήνουν */
.wave {
  opacity: 0;
  transform-origin: 62px 24px;
}

.wave1 { animation: magic-song 3s infinite linear; }
.wave2 { animation: magic-song 3s infinite linear 1s; } /* Καθυστέρηση 1 δευτ. */
.wave3 { animation: magic-song 3s infinite linear 2s; } /* Καθυστέρηση 2 δευτ. */

@keyframes magic-song {
  0% { 
    opacity: 0; 
    transform: translateX(0px) scale(0.5); 
  }
  20% { 
    opacity: 0.8; 
  }
  100% { 
    opacity: 0; 
    transform: translateX(-15px) scale(1.5); 
  }
}
/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά (συνολικά 50% από το αρχικό) */
@media (max-width: 767px) {
  .t-sirens-song {
    width: 53.6px;
    height: 48px;
  }
}
/* Αναγκάζει τον χάρτη να έχει το κλασικό βελάκι και ακυρώνει τα 4 βελάκια του Panzoom */
#map-area-2 {
    cursor: default !important;
}

/* Κρατάει το χεράκι επιλογής μόνο για τα σημεία που πατιούνται */
.t-banner {
    cursor: pointer !important;
}
/* Βασικό container (Ορατό από την αρχή - Χωρίς display: none) */
  .t-chimera-attack {
    position: absolute;
    width: 90px;
    height: 80px;
    z-index: 15;
display: none;
  }
/* ΝΕΑ ΚΛΑΣΗ: Εμφανίζεται μόνο όταν μπαίνει το .active από το JS */
.t-chimera-attack.active {
  display: block; 
}

  /* 1. Η αναπνοή του θηρίου (ανεβοκατεβαίνει όλο το σώμα ελαφριά) */
  .chimera-body {
    animation: beast-breathe 2.5s infinite ease-in-out;
    transform-origin: 50% 75px;
  }

  @keyframes beast-breathe {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.03); }
  }

  /* 2. Η φωτιά που αυξομειώνεται επιθετικά */
  .roaring-fire {
    animation: fire-breath 0.8s infinite alternate ease-in-out;
    transform-origin: 85px 55px;
  }

  @keyframes fire-breath {
    0% { transform: scale(0.6) rotate(-5deg); opacity: 0.6; }
    100% { transform: scale(1.3) rotate(5deg); opacity: 1; }
  }

  /* 3. Το φίδι-ουρά που χτυπιέται νευρικά στο πίσω μέρος */
  .snake-tail {
    animation: tail-whip 2s infinite ease-in-out;
    transform-origin: 35px 65px;
  }

  @keyframes tail-whip {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(15deg); }
  }
/* Μείωση όλου του σχεδίου κατά 30% ΜΟΝΟ στα κινητά */
  @media (max-width: 767px) {
    .t-chimera-attack {
      width: 63px;  /* 90px μείον 30% */
      height: 56px; /* 80px μείον 30% */
    }
  }
/* === Η ΕΧΙΔΝΑ (ΜΗΤΕΡΑ ΤΩΝ ΤΕΡΑΤΩΝ) === */
.t-echidna-lair {
  position: absolute;
  width: 48.5px;  /* Μειωμένο κατά 30% από 85px */
  height: 42.5px; 
  z-index: 50;
  cursor: pointer;
 display: none; 
}

/* Όταν προστίθεται η κλάση από το JS (αν ενεργοποιήσεις το display: none από πάνω) */
.t-echidna-lair.active {
  display: block; 
}

/* Η κίνηση του κορμού της (απαλό, σαγηνευτικό λίκνισμα) */
.echidna-torso {
  animation: echidna-sway 4s infinite ease-in-out;
  transform-origin: 50px 55px; /* Το σημείο που ενώνεται με το φίδι */
}

@keyframes echidna-sway {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}

/* Η κίνηση της ουράς (το φίδι συσπάται και "ανασαίνει") */
.echidna-tail {
  animation: snake-slither 3s infinite alternate ease-in-out;
  transform-origin: 50px 75px;
}

@keyframes snake-slither {
  0% { transform: scaleX(1) scaleY(1); }
  100% { transform: scaleX(1.03) scaleY(0.97); }
}

/* Τα τρομακτικά μάτια των μικρών τεράτων μέσα στο σκοτάδι της σπηλιάς */
.cave-eyes {
  animation: evil-blink 4s infinite ease-in-out;
}

.cave-eyes.delay {
  animation: evil-blink 5s infinite ease-in-out 2s;
}

@keyframes evil-blink {
  0%, 10%, 100% { opacity: 0; }
  5% { opacity: 1; } /* Αστραπιαίο ανοιγόκλεισμα */
  50% { opacity: 0; }
}
/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά (συνολικά 50% από το αρχικό) */
@media (max-width: 767px) {
  #echidna-monster {
    width: 43.6px;
    height: 38px;
  }
}
/* === Η ΧΑΡΥΒΔΗ (Η ΖΩΝΤΑΝΗ ΔΙΝΗ) === */
.t-charybdis-vortex {
  position: absolute;
  width: 59.5px;  /* Μειωμένο κατά 30% */
  height: 52.5px; /* Μειωμένο κατά 30% */
  z-index: 49;    /* Λίγο κάτω από τα άλλα τέρατα για να μοιάζει ένα με το νερό */
  cursor: pointer;
  display: none; 
}

/* Ενεργοποίηση μέσω JavaScript */
.t-charybdis-vortex.active {
  display: block;
}

/* Ο παλλόμενος πυρήνας της αβύσσου */
.vortex-abyss {
  animation: abyss-pulse 16s infinite alternate ease-in-out;
  transform-origin: 50px 42.5px;
}

@keyframes abyss-pulse {
  0% { transform: scale(0.8); opacity: 0.85; }
  100% { transform: scale(1); opacity: 1; }
}

/* Περιστροφή των ρευμάτων (Κάθε επίπεδο έχει άλλη ταχύτητα) */
.vortex-swirl-1 { animation: vortex-spin 12s infinite linear; transform-origin: 50px 42.5px; }
.vortex-swirl-2 { animation: vortex-spin 11s infinite linear; transform-origin: 50px 42.5px; }
.vortex-swirl-3 { animation: vortex-spin 10s infinite linear; transform-origin: 50px 42.5px; }
.vortex-swirl-4 { animation: vortex-spin 9s infinite linear; transform-origin: 50px 42.5px; }

@keyframes vortex-spin {
  100% { transform: rotate(360deg); }
}

/* Το άτυχο καραβάκι που ρουφιέται στον βυθό */
.doomed-boat-wrapper {
  animation: suck-into-abyss 7.5s infinite cubic-bezier(0.5, 0, 1, 1);
  transform-origin: 50px 42.5px;
}

@keyframes suck-into-abyss {
  0% { transform: rotate(0deg) scale(1); opacity: 1; }
  75% { transform: rotate(360deg) scale(0.3); opacity: 1; }
  100% { transform: rotate(450deg) scale(0); opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #charybdis-monster {
    width: 47.6px;
    height: 42px;
  }
}
/* === ΟΙ ΑΡΠΥΙΕΣ (ΟΙ ΑΡΠΑΧΤΡΕΣ ΤΟΥ ΑΝΕΜΟΥ) === */
.t-harpies-storm {
  position: absolute;
  width: 69.5px;
  height: 62.5px;
  z-index: 55; /* Ψηλά στον ουρανό */
  cursor: pointer;
   display: none; 
}
.t-harpies-storm.active { display: block; }

/* Ο Ανεμοστρόβιλος */
.wind-tornado {
  animation: tornado-spin 10.5s infinite linear;
  transform-origin: 50px 50px;
}
@keyframes tornado-spin {
  0% { transform: rotate(0deg) scaleY(0.9); }
  50% { transform: rotate(180deg) scaleY(1.1); }
  100% { transform: rotate(360deg) scaleY(0.9); }
}

/* Η κυκλική πτήση τους */
.harpy-1 {
  animation: harpy-fly-1 5s infinite linear;
  transform-origin: 50px 50px;
}
.harpy-2 {
  animation: harpy-fly-2 5s infinite linear;
  transform-origin: 50px 50px;
}

@keyframes harpy-fly-1 {
  0% { transform: rotate(0deg) translateX(15px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
}
@keyframes harpy-fly-2 {
  0% { transform: rotate(180deg) translateX(20px) rotate(-180deg); }
  100% { transform: rotate(540deg) translateX(20px) rotate(-540deg); }
}

@media (max-width: 767px) {
  #harpies-monster {
    width: 52.6px;
    height: 47px;
  }
}
/* === Ο ΚΕΡΒΕΡΟΣ (Ο ΦΥΛΑΚΑΣ ΤΟΥ ΑΔΗ) === */
.t-cerberus-gate {
  position: absolute;
  width: 42.5px;  /* Μειωμένο κατά 30% */
  height: 35.5px; /* Μειωμένο κατά 30% */
  z-index: 45;    /* Να κάθεται σωστά πάνω στον χάρτη */
  cursor: pointer;
  display: none; 
}

.t-cerberus-gate.active { display: block; }

/* Οι φλόγες της πύλης του Άδη */
.hades-hellfire {
  animation: hellfire-flicker 0.6s infinite alternate ease-in-out;
  transform-origin: 50px 75px;
}

@keyframes hellfire-flicker {
  0% { transform: scaleY(0.9); opacity: 0.6; }
  100% { transform: scaleY(1.2); opacity: 1; }
}

/* Αναπνοή του θηρίου */
.cerberus-body {
  animation: cerberus-breathe 1.5s infinite alternate ease-in-out;
  transform-origin: 50px 70px;
}

@keyframes cerberus-breathe {
  0% { transform: scaleY(1) scaleX(1); }
  100% { transform: scaleY(1.03) scaleX(1.02); }
}

/* Ανεξάρτητη κίνηση στα 3 κεφάλια */
.cerberus-head-l { animation: head-snarl-l 3s infinite ease-in-out; transform-origin: 38px 48px; }
.cerberus-head-c { animation: head-snarl-c 2.5s infinite ease-in-out; transform-origin: 50px 42px; }
.cerberus-head-r { animation: head-snarl-r 3.5s infinite ease-in-out; transform-origin: 62px 48px; }

@keyframes head-snarl-l { 
  0%, 100% { transform: rotate(0deg); } 
  50% { transform: rotate(-8deg) translateX(-2px); } 
}
@keyframes head-snarl-c { 
  0%, 100% { transform: translateY(0px); } 
  50% { transform: translateY(-3px) scale(1.05); } 
}
@keyframes head-snarl-r { 
  0%, 100% { transform: rotate(0deg); } 
  50% { transform: rotate(8deg) translateX(2px); } 
}

/* Η ουρά - φίδι που χτυπιέται */
.cerberus-tail {
  animation: cerberus-snake-whip 2s infinite ease-in-out;
  transform-origin: 25px 65px;
}

@keyframes cerberus-snake-whip {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-12deg); }
  75% { transform: rotate(15deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #cerberus-monster {
    width: 30.6px;
    height: 26px;
  }
}
/* === Η ΣΚΥΛΛΑ (Ο ΕΦΙΑΛΤΗΣ ΤΩΝ ΒΡΑΧΩΝ) === */
.t-scylla-cliffs {
  position: absolute;
  width: 50.5px;
  height: 43.5px;
  z-index: 52; /* Πιο πάνω από τη θάλασσα για να προεξέχει από τα βράχια */
  cursor: pointer;
  display: none; 
}

.t-scylla-cliffs.active { display: block; }

/* Τα σκοτεινά βράχια της σπηλιάς της */
.scylla-cave {
  animation: cave-shadow 3s infinite alternate ease-in-out;
}
@keyframes cave-shadow {
  0% { fill: #1c1f24; }
  100% { fill: #121417; }
}

/* Ανεξάρτητες κινήσεις για τα 6 κεφάλια (σαν να ψάχνουν/επιτίθενται) */
.s-head-1 { animation: scylla-strike-1 2.5s infinite alternate ease-in-out; transform-origin: 20px 60px; }
.s-head-2 { animation: scylla-strike-2 3.2s infinite alternate ease-in-out; transform-origin: 30px 65px; }
.s-head-3 { animation: scylla-strike-3 2.8s infinite alternate ease-in-out; transform-origin: 40px 60px; }
.s-head-4 { animation: scylla-strike-1 3.5s infinite alternate-reverse ease-in-out; transform-origin: 50px 65px; }
.s-head-5 { animation: scylla-strike-2 2.9s infinite alternate-reverse ease-in-out; transform-origin: 60px 60px; }
.s-head-6 { animation: scylla-strike-3 3.1s infinite alternate-reverse ease-in-out; transform-origin: 70px 65px; }

@keyframes scylla-strike-1 {
  0% { transform: rotate(-5deg) scale(0.95); }
  100% { transform: rotate(10deg) scale(1.05) translateY(-3px); }
}
@keyframes scylla-strike-2 {
  0% { transform: rotate(5deg) scale(1); }
  100% { transform: rotate(-10deg) scale(1.1) translateY(-5px); }
}
@keyframes scylla-strike-3 {
  0% { transform: rotate(-10deg) scale(0.9); }
  100% { transform: rotate(15deg) scale(1.1) translateY(-2px); }
}

/* Το νερό που σκάει στα βράχια της */
.scylla-waves {
  animation: scylla-crash 2s infinite alternate ease-in-out;
}
@keyframes scylla-crash {
  0% { transform: translateY(0px); opacity: 0.5; }
  100% { transform: translateY(-3px); opacity: 0.9; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #scylla-monster {
    width: 40.6px;
    height: 25px;
  }
}
/* === ΑΓΡΙΟΙ ΚΕΝΤΑΥΡΟΙ (Η ΑΓΕΛΗ ΤΟΥ ΔΑΣΟΥΣ) === */
.t-centaurs-pack {
  position: absolute;
  width: 49.5px;  /* Μειωμένο κατά 30% */
  height: 42.5px; /* Μειωμένο κατά 30% */
  z-index: 46;    /* Κάθεται ωραία ανάμεσα στα δέντρα */
  cursor: pointer;
  display: none; 
}

.t-centaurs-pack.active { display: block; }

/* Καλπασμός του μπροστινού Κενταύρου */
.centaur-lead {
  animation: centaur-gallop 0.6s infinite alternate ease-in-out;
  transform-origin: 50px 60px;
}

/* Καλπασμός του πίσω Κενταύρου (με μικρή διαφορά στο χρονισμό) */
.centaur-rear {
  animation: centaur-gallop 0.6s infinite alternate-reverse ease-in-out;
  transform-origin: 30px 50px;
}

@keyframes centaur-gallop {
  0% { transform: translateY(0px) rotate(-3deg); }
  100% { transform: translateY(-4px) rotate(4deg); }
}

/* Η φωτιά του πυρσού */
.centaur-torch {
  animation: torch-blaze 0.3s infinite alternate ease-in-out;
  transform-origin: 75px 25px;
}

@keyframes torch-blaze {
  0% { transform: scale(0.8) rotate(-5deg); opacity: 0.8; }
  100% { transform: scale(1.2) rotate(5deg); opacity: 1; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #centaurs-monster {
    width: 37.6px;
    height: 32px;
  }
}
/* === Η ΛΕΡΝΑΙΑ ΥΔΡΑ (ΤΟ ΤΕΡΑΣ ΤΟΥ ΒΑΛΤΟΥ) === */
.t-hydra-swamp {
  position: absolute;
  width: 50.5px;
  height: 47.5px;
  z-index: 48; /* Πάνω από το νερό, ανάμεσα στις στεριές */
  cursor: pointer;
  display: none; 
}

.t-hydra-swamp.active { display: block; }

/* Τοξικές φυσαλίδες που αναδύονται */
.toxic-bubbles circle {
  animation: swamp-bubble-rise 3s infinite ease-in;
}
.toxic-bubbles .tb-1 { animation-delay: 0s; }
.toxic-bubbles .tb-2 { animation-delay: 1.2s; }
.toxic-bubbles .tb-3 { animation-delay: 2.4s; }

@keyframes swamp-bubble-rise {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-15px) scale(1.5); opacity: 0; }
}

/* Ανεξάρτητη κίνηση στα κεφάλια (σαν φίδια που ψάχνουν) */
.h-head-1 { animation: hydra-strike-1 3s infinite alternate ease-in-out; transform-origin: 30px 65px; }
.h-head-2 { animation: hydra-strike-2 4s infinite alternate-reverse ease-in-out; transform-origin: 40px 65px; }
.h-head-3 { animation: hydra-strike-3 2.5s infinite alternate ease-in-out; transform-origin: 55px 65px; }
.h-head-4 { animation: hydra-strike-4 3.5s infinite alternate-reverse ease-in-out; transform-origin: 65px 65px; }

@keyframes hydra-strike-1 {
  0% { transform: rotate(-5deg) scale(0.9); }
  100% { transform: rotate(10deg) scale(1.1) translateY(-2px); }
}
@keyframes hydra-strike-2 {
  0% { transform: rotate(8deg); }
  100% { transform: rotate(-8deg) translateY(-4px); }
}
@keyframes hydra-strike-3 {
  0% { transform: rotate(-10deg); }
  100% { transform: rotate(12deg) translateY(-5px); }
}
@keyframes hydra-strike-4 {
  0% { transform: rotate(5deg) scale(0.9); }
  100% { transform: rotate(-15deg) scale(1.1); }
}

/* Οι καλαμιές που κουνιούνται στον άνεμο */
.swamp-reeds {
  animation: reeds-sway 2.5s infinite alternate ease-in-out;
  transform-origin: 50px 80px;
}
@keyframes reeds-sway {
  0% { transform: skewX(-5deg); }
  100% { transform: skewX(5deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #hydra-monster {
    width: 37.6px;
    height: 35px;
  }
}
/* === ΤΟ ΚΗΤΟΣ (ΤΟ ΤΕΡΑΣ ΤΗΣ ΑΒΥΣΣΟΥ) === */
.t-cetus-abyss {
  position: absolute;
  width: 50.5px;
  height: 43.5px;
  z-index: 50; /* Θάλασσα, στο ίδιο επίπεδο με τα πλοία */
  cursor: pointer;
   display: none;
}

.t-cetus-abyss.active { display: block; }

/* Το βαρύ, αργό ανασήκωμα του κορμού του μέσα από το νερό */
.cetus-body {
  animation: cetus-heave 4s infinite alternate ease-in-out;
  transform-origin: 50px 60px;
}

@keyframes cetus-heave {
  0% { transform: translateY(2px) rotate(-2deg); }
  100% { transform: translateY(-3px) rotate(2deg); }
}

/* Το τρομακτικό σαγόνι που ανοιγοκλείνει */
.cetus-jaw {
  animation: cetus-chomp 4s infinite alternate ease-in-out;
  transform-origin: 20px 40px;
}

@keyframes cetus-chomp {
  0% { transform: rotate(0deg); }
  20% { transform: rotate(5deg); }
  100% { transform: rotate(25deg); } /* Ανοίγει διάπλατα */
}

/* Το δρακοντείο πτερύγιο/φτερό στην πλάτη του */
.cetus-fin {
  animation: cetus-flap 3s infinite alternate ease-in-out;
  transform-origin: 70px 50px;
}

@keyframes cetus-flap {
  0% { transform: rotate(-8deg); }
  100% { transform: rotate(12deg); }
}

/* Τα σκοτεινά νερά που ταράζονται γύρω του */
.cetus-water {
  animation: cetus-churn 2s infinite alternate ease-in-out;
}

@keyframes cetus-churn {
  0% { transform: scaleX(0.95) translateX(1px); opacity: 0.7; }
  100% { transform: scaleX(1.05) translateX(-2px); opacity: 1; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #cetus-monster {
    width: 40.6px;
    height: 35px;
  }
}
/* === ΩΤΟΣ ΚΑΙ ΕΦΙΑΛΤΗΣ (ΟΙ ΑΛΩΑΔΕΣ ΓΙΓΑΝΤΕΣ) === */
.t-aloadae-giants {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 47; /* Ψηλά στον χάρτη, πάνω από τα βουνά */
  cursor: pointer;
  display: none; 
}

.t-aloadae-giants.active { display: block; }

/* Το βουνό που σηκώνουν (τρέμει από την υπερπροσπάθεια) */
.aloadae-mountain {
  animation: mountain-lift 3s infinite alternate ease-in-out;
  transform-origin: 50px 30px;
}
@keyframes mountain-lift {
  0% { transform: translateY(2px) rotate(-1deg); }
  100% { transform: translateY(-3px) rotate(1deg); }
}

/* Ο Ώτος (Αριστερός Γίγαντας) - Τεντώνει τους μυς του */
.giant-left {
  animation: giant-strain-l 3s infinite alternate ease-in-out;
  transform-origin: 30px 70px;
}
@keyframes giant-strain-l {
  0% { transform: scaleY(0.95) scaleX(1.02) translateX(-1px); }
  100% { transform: scaleY(1.05) scaleX(0.98) translateX(1px); }
}

/* Ο Εφιάλτης (Δεξιός Γίγαντας) - Αντίρροπη κίνηση ισορροπίας */
.giant-right {
  animation: giant-strain-r 3s infinite alternate ease-in-out;
  transform-origin: 70px 70px;
}
@keyframes giant-strain-r {
  0% { transform: scaleY(1.05) scaleX(0.98) translateX(1px); }
  100% { transform: scaleY(0.95) scaleX(1.02) translateX(-1px); }
}

/* Βράχια που πέφτουν από το βουνό */
.falling-rocks circle, .falling-rocks polygon {
  animation: rock-tumble 2.5s infinite linear;
}
.falling-rocks .r1 { animation-delay: 0s; }
.falling-rocks .r2 { animation-delay: 0.8s; }
.falling-rocks .r3 { animation-delay: 1.6s; }
@keyframes rock-tumble {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(18px) rotate(360deg); opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #aloadae-monster {
    width: 37.6px;
    height: 32px;
  }
}
/* === Ο ΤΥΦΩΕΑΣ (Η ΑΠΟΛΥΤΗ ΚΑΤΑΣΤΡΟΦΗ) === */
.t-typhon-storm {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 53; /* Ψηλά, γιατί είναι γιγάντιος */
  cursor: pointer;
  display: none; 
}

.t-typhon-storm.active { display: block; }

/* Τα γιγάντια φτερά που κρύβουν τον ήλιο */
.typhon-wing-l {
  animation: typhon-flap-l 4s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
.typhon-wing-r {
  animation: typhon-flap-r 4s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes typhon-flap-l {
  0% { transform: rotate(10deg) scaleY(1.1); }
  100% { transform: rotate(-15deg) scaleY(0.9); }
}
@keyframes typhon-flap-r {
  0% { transform: rotate(-10deg) scaleY(1.1); }
  100% { transform: rotate(15deg) scaleY(0.9); }
}

/* Ο κορμός από λάβα που "ανασαίνει" */
.typhon-torso {
  animation: typhon-breathe 2s infinite alternate ease-in-out;
  transform-origin: 50px 70px;
}
@keyframes typhon-breathe {
  0% { transform: scaleX(0.95) translateY(2px); }
  100% { transform: scaleX(1.05) translateY(-2px); }
}

/* Τα 100 κεφάλια δράκων (εδώ αναπαριστούμε τα κύρια που λικνίζονται) */
.t-head-group {
  animation: typhon-heads-sway 3s infinite alternate ease-in-out;
  transform-origin: 50px 45px;
}
@keyframes typhon-heads-sway {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

/* Τα πόδια-φίδια που χτυπιούνται στο έδαφος */
.typhon-snakes path {
  animation: typhon-whip 1.5s infinite alternate ease-in-out;
}
.typhon-snakes path:nth-child(even) { animation-direction: alternate-reverse; animation-duration: 2s; }
@keyframes typhon-whip {
  0% { transform: scaleY(0.9) skewX(-10deg); }
  100% { transform: scaleY(1.1) skewX(10deg); }
}

/* Οι Κεραυνοί που ρίχνει ασταμάτητα */
.typhon-lightning {
  animation: typhon-strike 3s infinite;
}
.typhon-lightning.delay {
  animation: typhon-strike 4s infinite 1.5s;
}
@keyframes typhon-strike {
  0%, 9%, 11%, 19%, 21%, 100% { opacity: 0; }
  10%, 20% { opacity: 1; transform: scale(1.1); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #typhon-monster {
    width: 41.6px;
    height: 36px;
  }
}
/* === ΟΙ ΛΕΟΝΤΕΣ ΤΟΥ ΒΟΡΡΑ (Η ΑΓΕΛΗ ΠΟΥ ΤΡΕΧΕΙ) === */
.t-macedonian-lions-pack {
  position: absolute;
  width: 55.5px;
  height: 48.5px;
  z-index: 46; 
  cursor: pointer;
  display: none; 
}

.t-macedonian-lions-pack.active { display: block; }

/* Ο Αρχηγός (Μπροστά) - Άλμα και βρυχηθμός */
.lion-lead {
  animation: lion-gallop-1 0.5s infinite alternate ease-in-out;
  transform-origin: 60px 50px;
}
@keyframes lion-gallop-1 {
  0% { transform: translateY(0px) rotate(-4deg); }
  100% { transform: translateY(-5px) rotate(4deg); }
}

/* Λιοντάρι 2 (Πίσω αριστερά) - Τρέχει πιο γρήγορα */
.lion-chaser-1 {
  animation: lion-gallop-2 0.4s infinite alternate-reverse ease-in-out;
  transform-origin: 30px 40px;
}
@keyframes lion-gallop-2 {
  0% { transform: translateY(-2px) rotate(2deg); }
  100% { transform: translateY(2px) rotate(-3deg); }
}

/* Λιοντάρι 3 (Κάτω δεξιά) - Χαμηλό, επιθετικό τρέξιμο */
.lion-chaser-2 {
  animation: lion-gallop-3 0.45s infinite alternate ease-in-out;
  transform-origin: 45px 65px;
}
@keyframes lion-gallop-3 {
  0% { transform: translateY(1px) scale(0.9) rotate(-2deg); }
  100% { transform: translateY(-2px) scale(0.95) rotate(2deg); }
}

/* Σκόνη από το τρέξιμο */
.pack-dust path {
  animation: dust-kick 0.6s infinite linear;
}
.pack-dust .d1 { animation-delay: 0s; }
.pack-dust .d2 { animation-delay: 0.2s; }
.pack-dust .d3 { animation-delay: 0.4s; }

@keyframes dust-kick {
  0% { transform: translateX(0) scale(0.5); opacity: 0.8; }
  100% { transform: translateX(-15px) scale(1.5); opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #macedonian-lion-monster {
    width: 44.6px;
    height: 39px;
  }
}
/* === ΟΙ ΤΕΛΧΙΝΕΣ (ΟΙ ΔΑΙΜΟΝΕΣ ΤΟΥ ΒΥΘΟΥ) === */
.t-telchines-forge {
  position: absolute;
  width: 50.5px;  /* Μειωμένο κατά 30% */
  height: 43.5px; /* Μειωμένο κατά 30% */
  z-index: 49;    /* Στον βυθό της θάλασσας */
  cursor: pointer;
  display: none;
}

.t-telchines-forge.active { display: block; }

/* Το σκοτεινό νερό που βράζει γύρω από το καμίνι */
.forge-water {
  animation: boiling-water 2s infinite alternate ease-in-out;
}
@keyframes boiling-water {
  0% { transform: scaleX(0.95); opacity: 0.6; }
  100% { transform: scaleX(1.05); opacity: 0.9; }
}

/* Ο Μεταλλουργός (Αριστερά) - Χτυπάει με το σφυρί */
.telchine-smith-arm {
  animation: hammer-strike 1.5s infinite;
  transform-origin: 30px 45px;
}
@keyframes hammer-strike {
  0%, 100% { transform: rotate(-45deg); }
  15% { transform: rotate(15deg); } /* Το χτύπημα στο αμόνι */
  30% { transform: rotate(-30deg); }
}

/* Το πυρωμένο μέταλλο που πάλλεται */
.glowing-metal {
  animation: metal-pulse 1.5s infinite;
}
@keyframes metal-pulse {
  0%, 100% { fill: #ff4500; filter: drop-shadow(0 0 2px #ff4500); }
  15% { fill: #ffffff; filter: drop-shadow(0 0 5px #fffb00); } /* Λάμψη στην κρούση */
}

/* Σπίθες από το χτύπημα */
.forge-sparks circle {
  animation: spark-fly 1.5s infinite;
}
.forge-sparks .s1 { animation-delay: 0s; }
.forge-sparks .s2 { animation-delay: 0.05s; }
.forge-sparks .s3 { animation-delay: 0.1s; }

@keyframes spark-fly {
  0%, 14% { opacity: 0; transform: translate(0, 0) scale(1); }
  15% { opacity: 1; transform: translate(0, 0) scale(1.5); }
  40% { opacity: 0; transform: translate(random(10px), -15px) scale(0); }
  100% { opacity: 0; }
}

/* Ο Μάγος (Δεξιά) - Καλεί τη θύελλα */
.telchine-mage {
  animation: mage-chant 3s infinite alternate ease-in-out;
  transform-origin: 75px 60px;
}
@keyframes mage-chant {
  0% { transform: translateY(2px) rotate(2deg); }
  100% { transform: translateY(-2px) rotate(-2deg); }
}

/* Η σκοτεινή μαγεία που στροβιλίζεται */
.dark-magic-rings {
  animation: magic-spin 4s infinite linear;
  transform-origin: 75px 35px;
}
@keyframes magic-spin {
  100% { transform: rotate(360deg) scale(1.1); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #telchines-monster {
    width: 42.6px;
    height: 37px;
  }
}
/* Διακριτικό κουμπί για τα Τέρατα (Glassmorphism Effect) */
.btn-monsters-only {
  position: absolute;
  /* Άλλαξε το top/bottom και το right/left ανάλογα με το πού ακριβώς είναι το 'Τα μυστικά της φύσης' */
  top: 667px; 
  right: 68px; 
  padding: 2px 4px;
  font-size: 10px;
  font-family: 'Cinzel', serif;
  color: #d4c29d;
  background: rgba(43, 38, 31, 0.3); /* Αχνό, ημιδιαφανές χρώμα */
  border: 1px solid rgba(140, 115, 85, 0.3);
  border-radius: 1px;
  backdrop-filter: blur(3px); /* Δημιουργεί την υφή του γυαλιού */
  -webkit-backdrop-filter: blur(3px);
  opacity: 0.9; /* Εδώ ρυθμίζεις πόσο αχνό θα είναι (0.5 = 50%) */
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

/* Όταν το ποντίκι πάει από πάνω, φωτίζεται */
.btn-monsters-only:hover {
  opacity: 0.9;
  background: rgba(43, 38, 31, 0.7);
  border: 1px solid rgba(140, 115, 85, 0.8);
  transform: scale(1.05);
}
@media (max-width: 767px) {
  .btn-monsters-only {
  position: absolute;
  /* Άλλαξε το top/bottom και το right/left ανάλογα με το πού ακριβώς είναι το 'Τα μυστικά της φύσης' */
  top: 573px; 
  right: 65px; 
  padding: 2px 4px;
  font-size: 9px;
  }
}
/* === Ο ΤΑΛΩΣ (ΤΟ ΧΑΛΚΙΝΟ ΡΟΜΠΟΤ ΤΗΣ ΑΡΧΑΙΟΤΗΤΑΣ) === */
.t-talos-automaton {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 48; /* Στη στεριά, κοντά στην ακτή */
  cursor: pointer;
  display: none; 
animation: talos-patrol 30s infinite alternate linear;
}

.t-talos-automaton.active { display: block; }

/* Η κάθετη περιπολία "πάνω-κάτω" στον χάρτη */
.talos-patrol-path {
 
  transform-origin: 50px 50px;
}
@keyframes talos-patrol {
  0% { transform: translateY(-82px); }
  100% { transform: translateY(15px); }
}

/* Το βαρύ, μηχανικό περπάτημα (κίνηση άκρων) */
.talos-arm-l { animation: talos-mech-walk 1.5s infinite alternate linear; transform-origin: 30px 40px; }
.talos-arm-r { animation: talos-mech-walk 1.5s infinite alternate-reverse linear; transform-origin: 70px 40px; }
.talos-leg-l { animation: talos-mech-walk 1.5s infinite alternate-reverse linear; transform-origin: 40px 65px; }
.talos-leg-r { animation: talos-mech-walk 1.5s infinite alternate linear; transform-origin: 60px 65px; }

@keyframes talos-mech-walk {
  0% { transform: rotate(-18deg); }
  100% { transform: rotate(18deg); }
}

/* Ο Ιχώρ (το θεϊκό αίμα) που πάλλεται και λάμπει */
.talos-ichor {
  animation: ichor-pulse 1.5s infinite alternate ease-in-out;
}
@keyframes ichor-pulse {
  0% { fill: #ff4500; filter: drop-shadow(0 0 2px #ff4500); }
  100% { fill: #fffb00; filter: drop-shadow(0 0 5px #ffea00); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #talos-monster {
    width: 47.6px;
    height: 42px;
  }
}
/* === Ο ΚΥΚΛΩΠΑΣ (Ο ΦΥΛΑΚΑΣ ΤΗΣ ΣΠΗΛΙΑΣ) === */
.t-cyclops-cave {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 47; /* Κοντά σε βουνά και ακτές */
  cursor: pointer;
  display: none; 
}

.t-cyclops-cave.active { display: block; }

/* Η βαριά, πρωτόγονη αναπνοή του */
.cyclops-body {
  animation: cyclops-breathe 3s infinite alternate ease-in-out;
  transform-origin: 50px 70px;
}
@keyframes cyclops-breathe {
  0% { transform: scaleY(0.98) scaleX(1.02); }
  100% { transform: scaleY(1.02) scaleX(0.98); }
}

/* Το τεράστιο ρόπαλο που κουνιέται ελαφρά */
.cyclops-club {
  animation: club-rest 2.5s infinite alternate ease-in-out;
  transform-origin: 75px 75px;
}
@keyframes club-rest {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

/* Το μάτι που σαρώνει τον ορίζοντα */
.cyclops-eye-pupil {
  animation: eye-search 4s infinite alternate ease-in-out;
}
@keyframes eye-search {
  0%, 10% { transform: translateX(-2.5px); }
  45%, 55% { transform: translateX(2.5px); }
  90%, 100% { transform: translateX(-2.5px); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #cyclops-monster {
    width: 38.6px;
    height: 33px;
  }
}
/* === Η ΜΕΔΟΥΣΑ (ΓΟΡΓΩ) === */
.t-medusa-gorgon {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 47; /* Σε ορεινό/βραχώδες σημείο */
  cursor: pointer;
  display: none;
}

.t-medusa-gorgon.active { display: block; }

/* Η αναπνοή της / κίνηση κορμού */
.medusa-head-sway {
  animation: medusa-sway 3s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes medusa-sway {
  0% { transform: translateY(1px) rotate(-2deg); }
  100% { transform: translateY(-1px) rotate(2deg); }
}

/* Τα φίδια που συστρέφονται */
.snake-group-1 path { animation: snake-writhe-1 2s infinite alternate ease-in-out; transform-origin: 50px 30px; }
.snake-group-2 path { animation: snake-writhe-2 2.5s infinite alternate-reverse ease-in-out; transform-origin: 50px 30px; }

@keyframes snake-writhe-1 {
  0% { transform: rotate(-5deg) scaleY(0.95); }
  100% { transform: rotate(5deg) scaleY(1.05); }
}
@keyframes snake-writhe-2 {
  0% { transform: rotate(5deg) skewX(-2deg); }
  100% { transform: rotate(-5deg) skewX(2deg); }
}

/* Η Πετρωτική, Πράσινη Λάμψη στα μάτια */
.medusa-gaze {
  animation: death-glare 1.5s infinite alternate;
}
@keyframes death-glare {
  0% { fill: #00ff00; filter: drop-shadow(0 0 2px #00ff00); }
  100% { fill: #ccffcc; filter: drop-shadow(0 0 8px #00ff00); }
}

.petrified-map {
  backdrop-filter: grayscale(100%) contrast(110%) brightness(85%) !important;
  -webkit-backdrop-filter: grayscale(100%) contrast(110%) brightness(85%) !important;
  background-color: rgba(0, 0, 0, 0.05); /* Μια πολύ αχνή υποψία γκρι */
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #medusa-monster {
    width: 37.6px;
    height: 32px;
  }
}
/* === Ο ΚΑΛΥΔΩΝΙΟΣ ΚΑΠΡΟΣ (ΤΟ ΔΑΙΜΟΝΙΚΟ ΑΓΡΙΟΓΟΥΡΟΥΝΟ) === */
.t-calydonian-boar {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 46; /* Στα ριζά των βουνών, ανάμεσα στα δέντρα */
  cursor: pointer;
  display: none; 
}

.t-calydonian-boar.active { display: block; }

/* Η ασταμάτητη, άγρια ορμή του σώματος */
.boar-body {
  animation: boar-charge 0.8s infinite alternate ease-in-out;
  transform-origin: 50px 75px;
}
@keyframes boar-charge {
  0% { transform: translateX(-1px) rotate(-1deg); }
  100% { transform: translateX(3px) rotate(2deg); }
}

/* Το κεφάλι που σκάβει το έδαφος με μανία */
.boar-head {
  animation: boar-dig 0.4s infinite alternate ease-in-out;
  transform-origin: 35px 55px;
}
@keyframes boar-dig {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(4px) rotate(-6deg); }
}

/* Χώματα και κομμάτια δέντρων που εκτοξεύονται από τις οπλές */
.boar-debris polygon, .boar-debris circle {
  animation: debris-fly 0.5s infinite linear;
}
.boar-debris .b1 { animation-delay: 0s; }
.boar-debris .b2 { animation-delay: 0.15s; }
.boar-debris .b3 { animation-delay: 0.3s; }

@keyframes debris-fly {
  0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
  100% { transform: translate(-15px, -12px) rotate(-180deg) scale(1.2); opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #calydonian-boar-monster {
    width: 42.6px;
    height: 37px;
  }
}
/* === Ο ΛΥΚΑΟΝΑΣ (Ο ΠΡΩΤΟΣ ΛΥΚΑΝΘΡΩΠΟΣ) === */
.t-lycaon-werewolf {
  position: absolute;
  width: 44.5px;
  height: 37.5px;
  z-index: 47; /* Ύψωμα, δάση */
  cursor: pointer;
  display: none;  
}

.t-lycaon-werewolf.active { display: block; }

/* Το ματωμένο φεγγάρι που πάλλεται πίσω του */
.blood-moon {
  animation: moon-pulse 3s infinite alternate ease-in-out;
}
@keyframes moon-pulse {
  0% { transform: scale(0.95); filter: drop-shadow(0 0 3px #ff0000); }
  100% { transform: scale(1.05); filter: drop-shadow(0 0 10px #ff0000); }
}

/* Η κίνηση: Τρέχει/κάνει άλμα μπροστά, σταματάει, ουρλιάζει, κάνει πίσω */
.lycaon-container {
  animation: lycaon-run-howl 4s infinite linear;
  transform-origin: 50px 75px;
}
@keyframes lycaon-run-howl {
  0% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(6px) translateY(-4px); } /* Άλμα μπροστά */
  20% { transform: translateX(12px) translateY(0); }   /* Προσγείωση */
  70% { transform: translateX(12px) translateY(0); }   /* Μένει ακίνητος και ουρλιάζει */
  80% { transform: translateX(6px) translateY(-4px); } /* Άλμα πίσω */
  100% { transform: translateX(0) translateY(0); }
}

/* Το κεφάλι πετάγεται πίσω για το ουρλιαχτό */
.lycaon-head {
  animation: howl-head 4s infinite ease-in-out;
  transform-origin: 45px 35px; /* Η βάση του λαιμού */
}
@keyframes howl-head {
  0%, 15%, 75%, 100% { transform: rotate(0deg); }
  25%, 65% { transform: rotate(-40deg); } /* Γέρνει απότομα προς τα πίσω/πάνω */
}

/* Το μάτι γυαλίζει επιθετικά όταν ουρλιάζει */
.lycaon-eye {
  animation: eye-flare 4s infinite ease-in-out;
}
@keyframes eye-flare {
  0%, 15%, 75%, 100% { fill: #ffcc00; filter: drop-shadow(0 0 1px #ffcc00); }
  25%, 65% { fill: #ff2200; filter: drop-shadow(0 0 5px #ff0000); } /* Γίνεται κατακόκκινο */
}

/* Τα πόδια κάνουν κίνηση όσο τρέχει */
.lycaon-legs {
  animation: run-legs 4s infinite linear;
  transform-origin: 40px 65px;
}
@keyframes run-legs {
  0%, 20%, 70%, 100% { transform: rotate(0deg); }
  5%, 15%, 75%, 85% { transform: rotate(15deg); }
  10%, 80% { transform: rotate(-10deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #lycaon-monster {
    width: 32.6px;
    height: 27px;
  }
}
/* === Ο ΜΙΝΩΤΑΥΡΟΣ (Ο ΕΚΤΕΛΕΣΤΗΣ ΤΟΥ ΛΑΒΥΡΙΝΘΟΥ) === */
.t-minotaur-labyrinth {
  position: absolute;
  width: 48.5px;
  height: 41.5px;
  z-index: 47; /* Ανάμεσα σε αρχαία ερείπια / βράχια */
  cursor: pointer;
  display: none; 
}

.t-minotaur-labyrinth.active { display: block; }

/* Η βαριά, κτηνώδης αναπνοή στο στήθος */
.minotaur-chest {
  animation: minotaur-breathe 2s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes minotaur-breathe {
  0% { transform: scaleX(0.98) scaleY(0.98); }
  100% { transform: scaleX(1.03) scaleY(1.02); }
}

/* Το βίαιο, κοφτό χτύπημα με τον Λάβρυ (Τσεκούρι) */
.minotaur-arm-weapon {
  animation: axe-strike 3s infinite;
  transform-origin: 40px 45px; /* Ο ώμος του τέρατος */
}
@keyframes axe-strike {
  0%, 15% { transform: rotate(0deg); } /* Στάση αναμονής */
  35% { transform: rotate(-35deg); } /* Σηκώνει το τσεκούρι αργά πίσω */
  40% { transform: rotate(45deg); }  /* ΑΣΤΡΑΠΙΑΙΟ ΧΤΥΠΗΜΑ ΚΑΤΩ! */
  45% { transform: rotate(38deg); }  /* Μικρή αναπήδηση από τη δύναμη */
  60%, 100% { transform: rotate(0deg); } /* Επιστροφή στη βάση */
}

/* Τα μάτια που αστράφτουν με οργή */
.minotaur-eye {
  animation: minotaur-rage 3s infinite;
}
@keyframes minotaur-rage {
  0%, 34% { fill: #ffcc00; }
  35%, 45% { fill: #ff0000; filter: drop-shadow(0 0 3px #ff0000); } /* Κοκκινίζουν στο χτύπημα! */
  46%, 100% { fill: #ffcc00; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #minotaur-monster {
    width: 38.6px;
    height: 33px;
  }
}
/* === Ο ΧΑΡΩΝ ΚΑΙ ΟΙ ΧΑΜΕΝΕΣ ΨΥΧΕΣ === */
.t-charon-ferry {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 46; /* Πάνω από ποτάμια / νερά */
  cursor: pointer;
  display: none; 
}

.t-charon-ferry.active { display: block; }

/* Το απαλό λίκνισμα της βάρκας στο νερό */
.charon-boat-rock {
  animation: boat-rock 4s infinite alternate ease-in-out;
  transform-origin: 50px 70px;
}
@keyframes boat-rock {
  0% { transform: rotate(-2deg) translateY(1px); }
  100% { transform: rotate(2deg) translateY(-1px); }
}

/* Η κίνηση της κωπηλασίας (Χέρι και Κουπί) */
.charon-rowing {
  animation: row-oar 3.5s infinite ease-in-out;
  transform-origin: 50px 45px; /* Ο ώμος του Χάροντα */
}
@keyframes row-oar {
  0%, 100% { transform: rotate(-12deg); }
  50% { transform: rotate(15deg); }
}

/* Η κίνηση του σκοτεινού ποταμού */
.charon-water {
  animation: river-flow 2s infinite alternate ease-in-out;
}
@keyframes river-flow {
  0% { transform: translateX(-2px); }
  100% { transform: translateX(2px); }
}

/* Οι Φασματικές Ψυχές (Νέον Λάμψη & Αιώρηση) */
.spectral-soul {
  animation: soul-float 3s infinite alternate ease-in-out;
}
@keyframes soul-float {
  0% { transform: translateY(0px) scale(0.9); opacity: 0.7; filter: drop-shadow(0 0 3px #00ffcc); }
  100% { transform: translateY(-6px) scale(1.1); opacity: 1; filter: drop-shadow(0 0 8px #00ffaa); }
}

/* Διαφορετικοί ρυθμοί για κάθε ψυχή ώστε να μη μοιάζουν ρομποτικές */
.soul-1 { animation-duration: 2.5s; animation-delay: 0s; }
.soul-2 { animation-duration: 3.5s; animation-delay: -1s; }
.soul-3 { animation-duration: 4s; animation-delay: -2s; }

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #charon-monster {
    width: 37.6px;
    height: 32px;
  }
}
/* === ΟΙ ΧΑΛΚΟΤΑΥΡΟΙ (ΤΑ ΜΗΧΑΝΙΚΑ ΚΤΗΝΗ ΤΟΥ ΗΦΑΙΣΤΟΥ) === */
.t-bronze-bull {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 47; 
  cursor: pointer;
  display: none; 
}

.t-bronze-bull.active { display: block; }

/* Ο βαρύς, μεταλλικός κορμός που "μαρσάρει" */
.bronze-bull-body {
  animation: bull-heave 2s infinite alternate ease-in-out;
  transform-origin: 50px 60px;
}
@keyframes bull-heave {
  0% { transform: scaleY(0.98) rotate(-1deg); }
  100% { transform: scaleY(1.02) rotate(1deg); }
}

/* Το μεταλλικό πόδι που χτυπάει το έδαφος */
.bull-stomp-leg {
  animation: mechanical-stomp 2s infinite;
  transform-origin: 55px 45px; /* Ο ώμος */
}
@keyframes mechanical-stomp {
  0%, 15% { transform: rotate(0deg); }
  25% { transform: rotate(-35deg); } /* Σηκώνει το πόδι πίσω/πάνω */
  35% { transform: rotate(15deg); }  /* ΒΙΑΙΟ ΧΤΥΠΗΜΑ ΚΑΤΩ */
  45%, 100% { transform: rotate(0deg); } /* Επιστροφή */
}

/* Σπίθες από την πρόσκρουση του χαλκού στο έδαφος */
.bull-sparks circle {
  animation: hoof-sparks 2s infinite;
}
.bull-sparks .s1 { animation-delay: 0s; }
.bull-sparks .s2 { animation-delay: 0.05s; }
.bull-sparks .s3 { animation-delay: 0.1s; }

@keyframes hoof-sparks {
  0%, 34% { opacity: 0; transform: translate(0, 0) scale(1); }
  35% { opacity: 1; transform: translate(0, 0) scale(1.5); } /* Συγχρονισμένο με το χτύπημα (35%) */
  50% { opacity: 0; transform: translate(-8px, -15px) scale(0); }
  100% { opacity: 0; }
}

/* Ο πίδακας φωτιάς από το στόμα */
.bull-fire-breath {
  animation: fire-stream 2s infinite;
  transform-origin: 80px 45px;
}
@keyframes fire-stream {
  0%, 34% { transform: scaleX(0); opacity: 0; }
  35% { transform: scaleX(1.1); opacity: 1; } /* Ξεσπάει φωτιά την ώρα του χτυπήματος! */
  50% { transform: scaleX(1); opacity: 0.8; }
  65% { transform: scaleX(0.5); opacity: 0; }
  100% { transform: scaleX(0); opacity: 0; }
}

/* Η λάμψη του εσωτερικού πυρήνα / ματιού */
.bull-core-glow {
  animation: core-pulse 1s infinite alternate;
}
@keyframes core-pulse {
  0% { fill: #ff4500; filter: drop-shadow(0 0 2px #ff4500); }
  100% { fill: #ffcc00; filter: drop-shadow(0 0 5px #ffcc00); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #bronze-bull-monster {
    width: 47.6px;
    height: 42px;
  }
}
/* === Η ΑΡΑΧΝΗ (Η ΚΑΤΑΡΑΜΕΝΗ ΥΦΑΝΤΡΑ) === */
.t-arachne-weaver {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 48; /* Στα δάση, κρέμεται από τα δέντρα */
  cursor: pointer;
  display: none;
}

.t-arachne-weaver.active { display: block; }

/* Ο λαμπερός ιστός στο φόντο */
.arachne-web-bg {
  animation: web-glow 3s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes web-glow {
  0% { opacity: 0.4; transform: scale(0.98); }
  100% { opacity: 0.7; transform: scale(1.02); filter: drop-shadow(0 0 2px #6b8c9e); }
}

/* Η κίνηση γιο-γιο (Ανεβοκατεβαίνει από τον ιστό της) */
.arachne-yo-yo {
  animation: spider-drop 5s infinite alternate ease-in-out;
}
@keyframes spider-drop {
  0% { transform: translateY(-15px); } /* Κρυμμένη ψηλά */
  100% { transform: translateY(12px); } /* Κατεβαίνει απειλητικά */
}

/* Τα ανατριχιαστικά πόδια που συσπώνται */
.arachne-leg-l { animation: spider-twitch-l 0.5s infinite alternate ease-in-out; transform-origin: 45px 50px; }
.arachne-leg-r { animation: spider-twitch-r 0.6s infinite alternate-reverse ease-in-out; transform-origin: 55px 50px; }

@keyframes spider-twitch-l {
  0% { transform: rotate(-2deg) scaleY(0.98); }
  100% { transform: rotate(3deg) scaleY(1.02); }
}
@keyframes spider-twitch-r {
  0% { transform: rotate(2deg) scaleY(0.98); }
  100% { transform: rotate(-3deg) scaleY(1.02); }
}

/* Τα τοξικά, φωσφοριζέ μάτια */
.arachne-eyes {
  animation: eye-glare 2s infinite alternate;
}
@keyframes eye-glare {
  0% { fill: #ff0044; filter: drop-shadow(0 0 1px #ff0044); }
  100% { fill: #ff0088; filter: drop-shadow(0 0 4px #ff0088); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #arachne-monster {
    width: 47.6px;
    height: 42px;
  }
}
/* === Η ΥΠΕΡΤΑΤΗ ΚΑΤΑΙΓΙΔΑ (ΤΥΦΩΝΑΣ) === */
.t-ultimate-storm {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 50; 
  cursor: pointer;
  display: none; 
}

.t-ultimate-storm.active { display: block; }

/* Ο Στροβιλισμός του Ανεμοστρόβιλου */
.m-storm-cloud-1 { animation: storm-spin 0.4s infinite alternate ease-in-out; }
.m-storm-cloud-2 { animation: storm-spin 0.5s infinite alternate-reverse ease-in-out; }
.m-storm-cloud-3 { animation: storm-spin 0.3s infinite alternate ease-in-out; }

@keyframes storm-spin {
  0% { transform: translateX(-3px) skewX(2deg); }
  100% { transform: translateX(3px) skewX(-2deg); }
}

/* Τα φίδια στη βάση */
.m-storm-snake-l {
  animation: storm-writhe-l 0.8s infinite alternate ease-in-out;
  transform-origin: 40px 75px;
}
.m-storm-snake-r {
  animation: storm-writhe-r 0.9s infinite alternate-reverse ease-in-out;
  transform-origin: 60px 75px;
}
@keyframes storm-writhe-l {
  0% { transform: rotate(-15deg) scaleY(0.9); }
  100% { transform: rotate(10deg) scaleY(1.1); }
}
@keyframes storm-writhe-r {
  0% { transform: rotate(15deg) scaleY(0.9); }
  100% { transform: rotate(-10deg) scaleY(1.1); }
}

/* Οι Αστραπές */
.m-storm-lightning {
  animation: storm-lightning-strike 2.5s infinite;
  opacity: 0;
}
.m-storm-lightning.l2 { animation-delay: 1.2s; }
.m-storm-lightning.l3 { animation-delay: 0.5s; animation-duration: 3s; }

@keyframes storm-lightning-strike {
  0%, 85% { opacity: 0; filter: drop-shadow(0 0 0px #fff); }
  88% { opacity: 1; filter: drop-shadow(0 0 8px #00ffff); }
  92% { opacity: 0; }
  94% { opacity: 1; filter: drop-shadow(0 0 12px #00ffff); }
  100% { opacity: 0; }
}

/* Τα πύρινα μάτια */
.m-storm-eyes {
  animation: ultimate-storm-eyes 1.5s infinite alternate;
}
@keyframes ultimate-storm-eyes {
  0% { fill: #ff2200; filter: drop-shadow(0 0 3px #ff2200); transform: scale(0.9); }
  100% { fill: #ffaa00; filter: drop-shadow(0 0 8px #ff5500); transform: scale(1.1); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #ultimate-storm-monster {
    width: 37.6px;
    height: 32px;
  }
}
/* === Ο ΠΗΓΑΣΟΣ (ΤΟ ΟΥΡΑΝΙΟ ΦΩΣ) === */
.t-pegasus-flight {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 55; /* Ψηλά στον ουρανό! */
  cursor: pointer;
  display: none; 
}

.t-pegasus-flight.active { display: block; }

/* Η Γραμμική Πτήση (Περνάει από δεξιά προς τα αριστερά και εξαφανίζεται) */
.pegasus-orbit-path {
  animation: pegasus-fly-left 25s infinite linear;
}
/* Η Διαγώνια Πτήση (Προς τα Αριστερά και Κάτω) */
@keyframes pegasus-fly-left {
  /* Αρχή: Ψηλά δεξιά (translate(100px, -60px)), κοιτάει αριστερά και έχει κλίση 15 μοίρες προς τα κάτω */
  0%   { transform: translate(100px, -60px) scaleX(-1) rotate(15deg); opacity: 0; }
  
  /* Εμφανίζεται πλήρως καθώς ξεκινάει τη βουτιά */
  15%  { transform: translate(70px, -40px) scaleX(-1) rotate(15deg); opacity: 1; }
  
  /* Διασχίζει διαγώνια τον ουρανό */
  85%  { transform: translate(-70px, 40px) scaleX(-1) rotate(15deg); opacity: 1; }
  
  /* Τέλος: Χαμηλά αριστερά (translate(-100px, 60px)) σβήνει ομαλά */
  100% { transform: translate(-100px, 60px) scaleX(-1) rotate(15deg); opacity: 0; }
}

/* Το μεγαλειώδες χτύπημα των φτερών */
.pegasus-wing-front {
  animation: flap-front 0.6s infinite alternate ease-in-out;
  transform-origin: 50px 45px;
}
.pegasus-wing-back {
  animation: flap-back 0.6s infinite alternate ease-in-out;
  transform-origin: 50px 45px;
}
@keyframes flap-front {
  0% { transform: rotate(-20deg) scaleY(0.9); }
  100% { transform: rotate(40deg) scaleY(1.1); }
}
@keyframes flap-back {
  0% { transform: rotate(20deg) scaleY(1.1); }
  100% { transform: rotate(-40deg) scaleY(0.9); }
}

/* Η Μαγική Αστερόσκονη / Χρυσόσκονη πίσω του */
.pegasus-sparkles circle, .pegasus-sparkles path {
  animation: magic-dust 1.5s infinite linear;
}
/* Καθυστέρηση για να μοιάζει με ίχνος που αφήνει φεύγοντας */
.pegasus-sparkles .st-1 { animation-delay: 0s; }
.pegasus-sparkles .st-2 { animation-delay: 0.3s; }
.pegasus-sparkles .st-3 { animation-delay: 0.6s; }
.pegasus-sparkles .st-4 { animation-delay: 0.9s; }
.pegasus-sparkles .st-5 { animation-delay: 1.2s; }

@keyframes magic-dust {
  0% { transform: translateX(0) scale(1); opacity: 1; }
  100% { transform: translateX(-30px) scale(0); opacity: 0; filter: drop-shadow(0 0 5px #fffb00); }
}

/* Ελαφριά αιώρηση στο σώμα την ώρα που καλπάζει */
.pegasus-body-gallop {
  animation: heavenly-gallop 0.6s infinite alternate ease-in-out;
}
@keyframes heavenly-gallop {
  0% { transform: translateY(1px); }
  100% { transform: translateY(-2px); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #pegasus-monster {
    width: 47.6px;
    height: 42px;
  }
}
/* === Η ΣΦΙΓΓΑ (ΤΟ ΑΠΟΛΥΤΟ ΑΙΝΙΓΜΑ) === */
.t-sphinx-riddle {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 46; /* Καθισμένη ψηλά, αλλά όχι όσο ο ουρανός */
  cursor: pointer;
  display: none;
}

.t-sphinx-riddle.active { display: block; }

/* Το αργό, μεγαλοπρεπές χτύπημα των χρυσών φτερών */
.sphinx-wing-front {
  animation: sphinx-flap-front 3s infinite alternate ease-in-out;
  transform-origin: 45px 40px; /* Ο ώμος της Σφίγγας */
}
.sphinx-wing-back {
  animation: sphinx-flap-back 3s infinite alternate ease-in-out;
  transform-origin: 45px 40px;
}
@keyframes sphinx-flap-front {
  0% { transform: rotate(-10deg) scaleY(0.95); }
  100% { transform: rotate(15deg) scaleY(1.05); }
}
@keyframes sphinx-flap-back {
  0% { transform: rotate(10deg) scaleY(1.05); }
  100% { transform: rotate(-15deg) scaleY(0.95); }
}

/* Η μαγική λάμψη στα μάτια της όταν κάνει το αίνιγμα */
.sphinx-eyes {
  animation: sphinx-gaze 4s infinite;
}
@keyframes sphinx-gaze {
  0%, 20% { fill: #1a1a1a; filter: drop-shadow(0 0 0px #00ffff); }
  40%, 60% { fill: #00ffff; filter: drop-shadow(0 0 4px #00ffff); } /* Το βλέμμα φωτίζεται */
  80%, 100% { fill: #1a1a1a; filter: drop-shadow(0 0 0px #00ffff); }
}

/* Τα αρχαία γράμματα που πάλλονται γύρω από το κεφάλι της */
.sphinx-runes text {
  font-family: serif;
  font-size: 8px;
  font-weight: bold;
  fill: #00ffff;
  animation: runes-glow 4s infinite;
  opacity: 0;
}
/* Διαφορετικοί χρόνοι για να φαίνονται σαν να ανάβουν με τη σειρά */
.sphinx-runes .r1 { animation-delay: 1.2s; }
.sphinx-runes .r2 { animation-delay: 1.4s; }
.sphinx-runes .r3 { animation-delay: 1.6s; }
.sphinx-runes .r4 { animation-delay: 1.8s; }
.sphinx-runes .r5 { animation-delay: 2.0s; }

@keyframes runes-glow {
  0%, 15% { opacity: 0; transform: translateY(2px); filter: drop-shadow(0 0 0px #00ffff); }
  40%, 60% { opacity: 1; transform: translateY(0px); filter: drop-shadow(0 0 3px #00ffff); }
  85%, 100% { opacity: 0; transform: translateY(-2px); filter: drop-shadow(0 0 0px #00ffff); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #sphinx-monster {
    width: 47.6px;
    height: 42px;
  }
}
/* === Ο ΔΡΑΚΟΝΤΑΣ ΤΗΣ ΚΟΛΧΙΔΑΣ (Ο ΑΙΩΝΙΟΣ ΦΥΛΑΚΑΣ) === */
.t-colchian-dragon {
  position: absolute;
  width: 49.5px;
  height: 42.5px;
  z-index: 44; /* Στα δάση / ιερά άλση */
  cursor: pointer;
   display: none; 
}

.t-colchian-dragon.active { display: block; }

/* Η μαγική λάμψη του Χρυσόμαλλου Δέρατος */
.golden-fleece-glow {
  animation: fleece-pulse 2s infinite alternate ease-in-out;
}
@keyframes fleece-pulse {
  0% { filter: drop-shadow(0 0 2px #ffaa00); fill: #ffcc00; }
  100% { filter: drop-shadow(0 0 8px #ffee00); fill: #fff566; }
}

/* Το "ξετύλιγμα" (uncoiling) του λαιμού και του κεφαλιού */
.dragon-uncoil {
  animation: snake-uncoil 4s infinite alternate ease-in-out;
  transform-origin: 50px 35px; /* Κέντρο του κορμού */
}
@keyframes snake-uncoil {
  0% { transform: translate(5px, -8px) rotate(10deg); } /* Πιο μαζεμένος ψηλά */
  100% { transform: translate(-8px, 5px) rotate(-5deg); } /* Τεντώνεται χαμηλά προς τον χρήστη */
}

/* Τα Υπνωτικά Κύματα από τα μάτια του (Toxic Yellow) */
.hypno-wave {
  fill: none;
  stroke: #ccff00;
  stroke-width: 1.5;
  animation: hypnotic-rings 2.5s infinite linear;
  opacity: 0;
}
/* Καθυστέρηση για να δημιουργείται αλυσίδα κυμάτων */
.hypno-wave.w1 { animation-delay: 0s; }
.hypno-wave.w2 { animation-delay: 0.8s; }
.hypno-wave.w3 { animation-delay: 1.6s; }

@keyframes hypnotic-rings {
  0% { transform: scale(0.1); opacity: 1; stroke-width: 2; }
  100% { transform: scale(3.5); opacity: 0; stroke-width: 0.2; }
}

/* Το σώμα που αναπνέει βαριά πάνω στο δέντρο */
.dragon-coils {
  animation: snake-breathe 3s infinite alternate ease-in-out;
}
@keyframes snake-breathe {
  0% { transform: scaleX(0.98); }
  100% { transform: scaleX(1.03); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #colchian-monster {
    width: 37.6px;
    height: 32px;
  }
}
/* === Ο ΧΡΥΣΑΕΤΟΣ (Ο ΒΑΣΙΛΙΑΣ ΤΩΝ ΟΥΡΑΝΩΝ) === */
.t-golden-eagle {
  position: absolute;
  width: 49px;
  height: 45px;
  z-index: 56; /* Πολύ ψηλά, πάνω από τα βουνά και τα σύννεφα */
  cursor: pointer;
  display: none; 
}

/* Εμφανίζεται όταν προστεθεί η κλάση .active από το JS */
.t-golden-eagle.active { display: block; }

/* 1. Η Κυκλική, αρχοντική πτήση (Soaring) */
.eagle-soar-path {
  animation: eagle-orbit 16s infinite linear;
  transform-origin: 50px 50px;
}
@keyframes eagle-orbit {
  0% { transform: rotate(0deg) translateX(25px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(25px) rotate(-360deg); }
}

/* 2. Ελαφριά κλίση του κορμού καθώς καβαλάει τον άνεμο */
.eagle-body-tilt {
  animation: eagle-glide 4s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes eagle-glide {
  0% { transform: rotate(-8deg); }
  100% { transform: rotate(8deg); }
}

/* 3. Το αργό, επιβλητικό ανοιγόκλεισμα των φτερών */
.eagle-wing-l {
  animation: eagle-flap-l 2.5s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
.eagle-wing-r {
  animation: eagle-flap-r 2.5s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes eagle-flap-l {
  0%, 15% { transform: rotate(15deg) scaleY(0.85); }
  85%, 100% { transform: rotate(-25deg) scaleY(1.15); }
}
@keyframes eagle-flap-r {
  0%, 15% { transform: rotate(-15deg) scaleY(0.85); }
  85%, 100% { transform: rotate(25deg) scaleY(1.15); }
}

/* Μείωση μεγέθους για κινητά */
@media (max-width: 767px) {
  #eagle-anim {
    width: 42px;
    height: 35px;
  }
}
/* === ΟΙΚΟΛΟΓΙΑ: ΡΟΖ ΦΛΑΜΙΝΓΚΟ (ΑΛΥΚΗ ΚΙΤΡΟΥΣ) === */
.t-eco-flamingos {
  position: absolute;
  width: 56px;
  height: 51px;
  z-index: 49; /* Σωστό επίπεδο για να είναι κάτω από το pop-up! */
  cursor: pointer;
  display: none; 
}

/* Εμφανίζονται όταν πάρουν την κλάση .active από το JS */
.t-eco-flamingos.active { display: block; }

/* 1. Η κίνηση του νερού της λιμνοθάλασσας */
.flamingo-water {
  animation: wetland-ripple 4s infinite alternate ease-in-out;
  transform-origin: 50px 75px;
}
@keyframes wetland-ripple {
  0% { transform: scaleX(0.9); opacity: 0.5; }
  100% { transform: scaleX(1.1); opacity: 0.8; }
}

/* 2. Φλαμίνγκο 1: Βουτάει τον λαιμό για τροφή */
.fl-neck-feed {
  animation: flamingo-dip 7s infinite ease-in-out;
  transform-origin: 65px 48px; /* Η βάση του λαιμού */
}
@keyframes flamingo-dip {
  0%, 15%, 100% { transform: rotate(0deg) translate(0, 0); }
  /* Σκύβει στο νερό */
  35%, 65% { transform: rotate(-55deg) translate(-12px, 12px); }
  /* Κάνει μικρές κινήσεις αναζήτησης (rummaging) κάτω από το νερό */
  45%, 55% { transform: rotate(-52deg) translate(-10px, 10px); } 
}

/* Τα κυματάκια που δημιουργεί το ράμφος στο νερό */
.feed-ripple {
  animation: beak-ripple 7s infinite;
  transform-origin: 38px 68px;
  opacity: 0;
}
@keyframes beak-ripple {
  0%, 34%, 66%, 100% { transform: scale(0); opacity: 0; stroke-width: 1.5; }
  35% { transform: scale(0.5); opacity: 1; }
  50% { transform: scale(2); opacity: 0; stroke-width: 0.5; }
  55% { transform: scale(0.5); opacity: 1; }
  65% { transform: scale(1.5); opacity: 0; stroke-width: 0.5; }
}

/* 3. Φλαμίνγκο 2: Ισορροπία στο ένα πόδι & Τέντωμα φτερού */
.fl-body-balance {
  animation: flamingo-balance 3s infinite alternate ease-in-out;
  transform-origin: 25px 65px;
}
@keyframes flamingo-balance {
  0% { transform: rotate(-2deg); }
  100% { transform: rotate(3deg); }
}

/* Το εντυπωσιακό τέντωμα/άνοιγμα του φτερού */
.fl-wing-stretch {
  animation: flamingo-flap 6s infinite;
  transform-origin: 22px 42px; /* Ο ώμος */
}
@keyframes flamingo-flap {
  0%, 75%, 100% { transform: rotate(0deg) scaleY(1) scaleX(1); }
  80% { transform: rotate(-50deg) scaleY(1.4) scaleX(1.1); } /* Ανοίγει ψηλά */
  85% { transform: rotate(-15deg) scaleY(1.1); } /* Διπλώνει λίγο */
  90% { transform: rotate(-45deg) scaleY(1.3) scaleX(1.1); } /* Δεύτερο τίναγμα */
}

/* Μείωση μεγέθους για τα κινητά */
@media (max-width: 767px) {
  #flamingos-anim {
    width: 48px;
    height: 43px;
  }
}
/* === ΑΓΡΙΟΓΙΔΟ - PRO VERSION === */
.t-eco-chamois {
  position: absolute;
  width: 75px; /* Μεγαλύτερο για να φαίνονται οι λεπτομέρειες */
  height: 75px;
  z-index: 50;
  cursor: pointer;
display: none;
  
}
.t-eco-chamois.active { display: block; }

/* 1. Η κίνηση της Ομίχλης (Ατμόσφαιρα) */
.chamois-fog {
  animation: fog-drift 12s infinite alternate ease-in-out;
}
@keyframes fog-drift {
  0% { transform: translateX(-5px); opacity: 0.6; }
  100% { transform: translateX(8px); opacity: 1; }
}

/* 2. Κύρια Τροχιά Άλματος (Αιωρείται, φτάνει ψηλά και προσγειώνεται) */
.chamois-master-leap {
  animation: chamois-trajectory 9s infinite cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: 25px 45px;
}
@keyframes chamois-trajectory {
  0%, 25%, 85%, 100% { transform: translate(0, 0); } /* Αφετηρία (Βράχος 1) */
  28% { transform: translate(8px, -10px) rotate(-15deg); } /* Άνοδος (Πριν ήταν -20px) */
  31% { transform: translate(18px, -12px) rotate(10deg); }  /* Κορυφή άλματος (Πριν ήταν -25px) */
  35%, 70% { transform: translate(25px, 4px); } /* Προσγείωση στον Βράχο 2 (Πριν ήταν 45px μακριά) */
  73% { transform: translate(15px, -6px) rotate(15deg); } /* Άνοδος επιστροφής */
  76% { transform: translate(5px, -10px) rotate(-10deg); } /* Κορυφή επιστροφής */
}

/* 3. Squash & Stretch (Συμπίεση για βάρος/κραδασμούς) */
.chamois-body-squash {
  animation: chamois-squash 9s infinite;
  transform-origin: 22px 50px;
}
@keyframes chamois-squash {
  0%, 22%, 37%, 67%, 82%, 100% { transform: scale(1, 1); }
  24%, 69% { transform: scale(1.1, 0.8) translateY(2px); } /* Μάζεμα πριν το άλμα */
  29%, 74% { transform: scale(0.95, 1.05); } /* Έκταση στον αέρα */
  35%, 78% { transform: scale(1.15, 0.75) translateY(4px); } /* Σκληρή προσγείωση (κραδασμός) */
}

/* 4. Κίνηση Ποδιών (Αρθρωτή) */
.chamois-leg-front {
  animation: leg-tuck-front 9s infinite;
  transform-origin: 30px 42px;
}
.chamois-leg-back {
  animation: leg-tuck-back 9s infinite;
  transform-origin: 15px 42px;
}
@keyframes leg-tuck-front {
  0%, 25%, 35%, 70%, 80%, 100% { transform: rotate(0deg); }
  28%, 74% { transform: rotate(-45deg); } /* Μαζεύονται προς τα πίσω στην πτήση */
  33%, 78% { transform: rotate(20deg); }  /* Εκτείνονται μπροστά για προσγείωση */
}
@keyframes leg-tuck-back {
  0%, 25%, 35%, 70%, 80%, 100% { transform: rotate(0deg); }
  28%, 74% { transform: rotate(35deg); }  /* Μαζεύονται προς τα μπρος */
  33%, 78% { transform: rotate(-15deg); } /* Εκτείνονται πίσω */
}

/* 5. Ανεξάρτητη κίνηση Λαιμού/Κεφαλιού */
.chamois-head-neck {
  animation: head-scan 9s infinite;
  transform-origin: 32px 30px;
}
@keyframes head-scan {
  0%, 25%, 35%, 70%, 85%, 100% { transform: rotate(0deg); }
  5%, 15% { transform: rotate(-10deg); } /* Κοιτάζει αριστερά κάτω */
  45%, 55% { transform: rotate(15deg); } /* Κοιτάζει δεξιά πάνω όταν είναι στον απέναντι βράχο */
}

/* 6. Σωματίδια Σκόνης κατά την εκκίνηση/προσγείωση */
.dust-particles { opacity: 0; }
#dust-left {
  animation: puff-left 9s infinite;
  transform-origin: 20px 55px;
}
#dust-right {
  animation: puff-right 9s infinite;
  transform-origin: 70px 60px;
}
@keyframes puff-left {
  0%, 23%, 27%, 77%, 82%, 100% { opacity: 0; transform: scale(0) translateY(0); }
  25%, 80% { opacity: 0.8; transform: scale(1.5) translateY(-3px); } /* Σκάει σκόνη στην εκκίνηση/προσγείωση */
}
@keyframes puff-right {
  0%, 33%, 38%, 68%, 73%, 100% { opacity: 0; transform: scale(0) translateY(0); }
  35%, 70% { opacity: 0.8; transform: scale(1.5) translateY(-3px); }
}

@media (max-width: 767px) {
  #chamois-anim { width: 55px; height: 55px; }
}
/* === ΘΑΛΑΣΣΙΑ ΧΕΛΩΝΑ CARETTA-CARETTA === */
.t-eco-turtle {
  position: absolute;
  width: 49px;
  height: 45px;
  z-index: 48; /* Πλέει στο νερό, κάτω από τα ιπτάμενα banners */
  cursor: pointer;
 display: none;
}
.t-eco-turtle.active { display: block; }

/* 1. Το λίκνισμα και η κίνηση του νερού στο background */
.turtle-water-layer {
  animation: turtle-sea-pulse 6s infinite alternate ease-in-out;
  transform-origin: 50px 53px;
}
@keyframes turtle-sea-pulse {
  0% { transform: scale(0.96); opacity: 0.6; }
  100% { transform: scale(1.04); opacity: 0.9; }
}

/* 2. Κύριο κολύμπι - Ήπια άνοδος και κάθοδος της χελώνης */
.turtle-master-swim {
  animation: turtle-swimming-cycle 12s infinite ease-in-out;
  transform-origin: 50px 53px;
}
@keyframes turtle-swimming-cycle {
  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
  30% { transform: translateY(-3px) scale(0.96) rotate(1deg); }  /* Κατεβαίνει ελαφρώς */
  42% { transform: translateY(2px) scale(1.03) rotate(-1deg); }  /* Ανεβαίνει για αέρα */
  46%, 56% { transform: translateY(4px) scale(1.05) rotate(0deg); } /* Στην επιφάνεια */
  75% { transform: translateY(-1px) scale(0.98) rotate(-1deg); } /* Επιστροφή στο βάθος */
}

/* 3. Ρυθμικά Μπροστινά Πτερύγια (Κουπιά) */
.turtle-flipper-l {
  animation: turtle-paddle-l 3.5s infinite ease-in-out;
  transform-origin: 32px 42px;
}
.turtle-flipper-r {
  animation: turtle-paddle-r 3.5s infinite ease-in-out;
  transform-origin: 68px 42px;
}
@keyframes turtle-paddle-l {
  0%, 100% { transform: rotate(0deg) skewX(0deg); }
  50% { transform: rotate(-28deg) skewX(-6deg); } /* Ώθηση νερού πίσω */
}
@keyframes turtle-paddle-r {
  0%, 100% { transform: rotate(0deg) skewX(0deg); }
  50% { transform: rotate(28deg) skewX(6deg); }
}

/* Πίσω πτερύγια (Σταθεροποιητές) */
.turtle-back-flippers {
  animation: turtle-stabilize 4s infinite alternate ease-in-out;
  transform-origin: 50px 70px;
}
@keyframes turtle-stabilize {
  0% { transform: rotate(-4deg); }
  100% { transform: rotate(4deg); }
}

/* 4. Κεφάλι που βγαίνει στην επιφάνεια */
.turtle-head-neck {
  animation: turtle-head-pop 12s infinite ease-in-out;
  transform-origin: 50px 35px;
}
@keyframes turtle-head-pop {
  0%, 39%, 59%, 100% { transform: scale(0.85) translateY(3px); opacity: 0.5; filter: blur(0.5px); } /* Υποβρύχια */
  44%, 54% { transform: scale(1.12) translateY(-2px); opacity: 1; filter: blur(0); } /* Έξω από το νερό */
}

/* 5. Διαστελλόμενα Κυματάκια (Ripples) */
.t-wave {
  fill: none;
  stroke: #a2eaf2;
  transform-origin: 50px 18px;
  opacity: 0;
}
.w1 { animation: turtle-ripple-fx 12s infinite ease-out; }
.w2 { animation: turtle-ripple-fx 12s infinite ease-out; animation-delay: 0.6s; }

@keyframes turtle-ripple-fx {
  0%, 43%, 57%, 100% { transform: scale(0); opacity: 0; stroke-width: 2.5; }
  45% { opacity: 0.8; stroke-width: 1.8; }
  53% { transform: scale(4.5); opacity: 0; stroke-width: 0.5; }
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .t-eco-turtle { width: 40px; height: 35px; }
}
/* === Η ΚΑΦΕ ΑΡΚΟΥΔΑ === */
.t-eco-bear {
  position: absolute;
  width: 49px;
  height: 45px;
  z-index: 51;
  cursor: pointer;
 display: none;
}
.t-eco-bear.active { display: block; }

.bear-master {
  animation: bear-emerge-cycle 10s infinite ease-in-out;
  transform-origin: 50px 95px;
}
@keyframes bear-emerge-cycle {
  0%, 15%, 85%, 100% { transform: translateY(45px); opacity: 0; } 
  22% { transform: translateY(12px); opacity: 1; } 
  25%, 42% { transform: translateY(12px); } 
  48% { transform: translateY(-4px); } 
  52%, 72% { transform: translateY(-4px); } 
  78% { transform: translateY(12px); } 
  82% { transform: translateY(45px); opacity: 0; } 
}

.bear-body-lift {
  animation: bear-body-stretch 10s infinite ease-in-out;
  transform-origin: 50px 80px;
}
@keyframes bear-body-stretch {
  0%, 42%, 78%, 100% { transform: scaleY(1) scaleX(1); }
  48%, 72% { transform: scaleY(1.16) scaleX(1.04); } 
}

.bear-paws {
  animation: bear-raise-paws 10s infinite ease-in-out;
  transform-origin: 50px 55px;
}
@keyframes bear-raise-paws {
  0%, 42%, 78%, 100% { transform: translateY(0); }
  48%, 72% { transform: translateY(-12px) rotate(4deg); } 
}

.bear-head {
  animation: bear-head-scan 10s infinite ease-in-out;
  transform-origin: 50px 35px;
}
@keyframes bear-head-scan {
  0%, 22%, 78%, 100% { transform: rotate(0deg) scale(1); }
  26% { transform: rotate(-10deg); } 
  34% { transform: rotate(10deg); }  
  40% { transform: rotate(0deg); }   
  48%, 72% { transform: scale(1.08); } 
}

@media (max-width: 767px) {
  .t-eco-bear { width: 43px; height: 38px; }
}
/* === ΟΙΚΟΛΟΓΙΑ: Η ΒΙΔΡΑ === */
.t-eco-otter {
  position: absolute;
  width: 54px;
  height: 49px;
  z-index: 52; /* Ανάμεσα στο νερό και τα πουλιά */
  cursor: pointer;
   display: none;
}
.t-eco-otter.active { display: block; }

/* 1. Ροή ποταμού (Εμπρός και πίσω επίπεδα για βάθος) */
.otter-water-back {
  animation: river-flow 3s infinite alternate ease-in-out;
}
.otter-water-front {
  animation: river-flow 4s infinite alternate-reverse ease-in-out;
}
@keyframes river-flow {
  0% { transform: translateX(-4px); }
  100% { transform: translateX(4px); }
}

/* 2. Η κίνηση της Βίδρας: Βουτιά - Εμφάνιση - Παρατήρηση - Κατάδυση */
.otter-dive-anim {
  animation: otter-play 7s infinite ease-in-out;
  transform-origin: 50px 65px;
}
@keyframes otter-play {
  0%, 100% { transform: translateY(30px) rotate(15deg); opacity: 0; } /* Κρυμμένη βαθιά */
  10% { transform: translateY(10px) rotate(-5deg); opacity: 1; } /* Σκάει μύτη */
  25% { transform: translateY(-5px) rotate(-10deg); } /* Τεντώνεται έξω */
  45% { transform: translateY(-2px) rotate(5deg); } /* Κοιτάει γύρω */
  60% { transform: translateY(0px) rotate(-5deg); } /* Κολυμπάει ελαφρώς */
  80% { transform: translateY(20px) rotate(25deg); opacity: 1; } /* Αρχίζει τη βουτιά */
  90% { transform: translateY(30px) rotate(30deg); opacity: 0; } /* Χάνεται στο νερό */
}

/* 3. Φυσαλίδες από το παιχνίδι στο νερό */
.ot-bubble {
  animation: otter-bubble-rise 3s infinite ease-in;
  opacity: 0;
}
.ot-b1 { animation-delay: 0.5s; }
.ot-b2 { animation-delay: 1.2s; }
.ot-b3 { animation-delay: 2.5s; }

@keyframes otter-bubble-rise {
  0% { transform: translateY(5px) scale(0.5); opacity: 0; }
  30% { opacity: 0.8; }
  100% { transform: translateY(-25px) scale(1.5); opacity: 0; }
}

/* Κινητά */
@media (max-width: 767px) {
  #otter-anim {
    width: 44px;
    height: 39px;
  }
}
/* === ΟΙΚΟΛΟΓΙΑ: ΑΓΡΙΟΓΟΥΡΟΥΝΟ (Άγριο & Γρήγορο) === */
.t-eco-boar {
  position: absolute;
  width: 50px;
  height: 46px;
  z-index: 53; 
  cursor: pointer;
display: none;
}
.t-eco-boar.active { display: block; }

/* 1. Η κίνηση του κορμού: Καλπασμός (Πάνω-κάτω και ελαφριά κλίση) */
.boar-running {
  animation: boar-gallop-body 4.3s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes boar-gallop-body {
  0% { transform: translateY(0px) rotate(-2deg); }
  100% { transform: translateY(4px) rotate(2deg); }
}

/* 2. Κίνηση ποδιών: Εναλλάξ ψαλιδιστά για αίσθηση τρεξίματος */
.boar-leg-b1 { animation: run-leg-b1 4.3s infinite linear; transform-origin: 30px 50px; }
.boar-leg-b2 { animation: run-leg-b2 4.3s infinite linear; transform-origin: 30px 50px; }
.boar-leg-f1 { animation: run-leg-f1 4.3s infinite linear; transform-origin: 65px 55px; }
.boar-leg-f2 { animation: run-leg-f2 4.3s infinite linear; transform-origin: 65px 55px; }

@keyframes run-leg-f1 { 0%, 100% { transform: rotate(-35deg); } 50% { transform: rotate(25deg); } }
@keyframes run-leg-f2 { 0%, 100% { transform: rotate(25deg); } 50% { transform: rotate(-35deg); } }
@keyframes run-leg-b1 { 0%, 100% { transform: rotate(35deg); } 50% { transform: rotate(-25deg); } }
@keyframes run-leg-b2 { 0%, 100% { transform: rotate(-25deg); } 50% { transform: rotate(35deg); } }

/* 3. Σκόνη από το τρέξιμο */
.dust {
  animation: dust-fly 0.5s infinite linear;
  opacity: 0;
}
.d1 { animation-delay: 0s; }
.d2 { animation-delay: 0.1s; }
.d3 { animation-delay: 0.2s; }
.d4 { animation-delay: 0.3s; }

@keyframes dust-fly {
  0% { transform: translateX(0) translateY(0) scale(0.5); opacity: 0.9; }
  100% { transform: translateX(-40px) translateY(-15px) scale(1.8); opacity: 0; }
}

@media (max-width: 767px) {
  #boar-anim { width: 45px; height: 40px; }
}
/* === Ο ΔΡΥΟΚΟΛΑΠΤΗΣ (ΤΟ ΧΤΥΠΗΜΑ) === */
.t-woodpecker-tree {
  position: absolute;
  width: 49.5px;
  height: 45.5px;
  z-index: 36; /* Φύση / Δάσος */
  cursor: pointer;
   display: none; 
}

.t-woodpecker-tree.active { display: block; }

/* Η δόνηση σε ΟΛΟ το SVG όταν χτυπάει το ράμφος */
.woodpecker-shake {
  animation: tree-vibration 2.5s infinite;
}
@keyframes tree-vibration {
  0%, 60% { transform: translateX(0px); }
  /* Το τριπλό χτύπημα */
  62% { transform: translateX(-1px); }
  65% { transform: translateX(1px); }
  68% { transform: translateX(-1px); }
  71% { transform: translateX(1px); }
  74% { transform: translateX(-1px); }
  77% { transform: translateX(0px); }
  100% { transform: translateX(0px); }
}

/* Το κεφάλι και το ράμφος που "χτυπάνε" (Pecking) */
.woodpecker-head-peck {
  animation: bird-pecking 2.5s infinite;
  transform-origin: 52px 35px; /* Η βάση του λαιμού του */
}
@keyframes bird-pecking {
  0%, 60% { transform: rotate(0deg); }
  /* Τριπλό γρήγορο χτύπημα προς τα εμπρός (αριστερά) */
  62% { transform: rotate(-18deg); }
  65% { transform: rotate(0deg); }
  68% { transform: rotate(-18deg); }
  71% { transform: rotate(0deg); }
  74% { transform: rotate(-18deg); }
  77% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

/* Τα κομματάκια ξύλου που πετάγονται (Wood chips) */
.wood-chips path {
  opacity: 0;
  animation: chips-fly 2.5s infinite;
}
.wood-chips .c1 { animation-delay: 0.05s; }
.wood-chips .c2 { animation-delay: 0.15s; }
.wood-chips .c3 { animation-delay: 0.25s; }

@keyframes chips-fly {
  0%, 60% { opacity: 0; transform: translate(0px, 0px) scale(0.5) rotate(0deg); }
  65% { opacity: 1; }
  80% { opacity: 0; transform: translate(-8px, 12px) scale(1) rotate(45deg); }
  100% { opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #woodpecker-nature {
    width: 39.6px;
    height: 34px;
  }
}
/* === ΤΟ ΖΑΡΚΑΔΙ (ΕΓΡΗΓΟΡΣΗ ΣΤΟ ΔΑΣΟΣ) === */
.t-roe-deer {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 34; /* Φύση / Λιβάδια */
  cursor: pointer;
   display: none; 
}

.t-roe-deer.active { display: block; }

/* Το σώμα αναπνέει ελαφρά */
.deer-body-breathe {
  animation: deer-breathe 4s infinite alternate ease-in-out;
  transform-origin: 55px 45px;
}
@keyframes deer-breathe {
  0% { transform: scaleY(0.98); }
  100% { transform: scaleY(1.02); }
}

/* Το Τίναγμα του Κεφαλιού (Βόσκει -> Ελέγχει -> Βόσκει) */
.deer-neck-head {
  animation: deer-alert-bob 7s infinite ease-in-out;
  transform-origin: 45px 48px; /* Η άρθρωση στον ώμο */
}
@keyframes deer-alert-bob {
  0%, 30% { transform: rotate(-45deg) translate(-5px, 12px); } /* Σκυμμένο, τρώει */
  35%, 65% { transform: rotate(0deg) translate(0px, 0px); } /* Πετιέται όρθιο! */
  70%, 100% { transform: rotate(-45deg) translate(-5px, 12px); } /* Ξανασκύβει */
}

/* Τα αυτιά τεντώνονται και συσπώνται όταν είναι όρθιο */
.deer-ear-l {
  animation: ear-twitch-l 7s infinite;
  transform-origin: 32px 20px;
}
.deer-ear-r {
  animation: ear-twitch-r 7s infinite;
  transform-origin: 36px 20px;
}
@keyframes ear-twitch-l {
  0%, 40% { transform: rotate(0deg); }
  45% { transform: rotate(-15deg); }
  48% { transform: rotate(5deg); }
  51% { transform: rotate(-15deg); }
  55%, 100% { transform: rotate(0deg); }
}
@keyframes ear-twitch-r {
  0%, 42% { transform: rotate(0deg); }
  46% { transform: rotate(15deg); }
  49% { transform: rotate(-5deg); }
  52% { transform: rotate(15deg); }
  56%, 100% { transform: rotate(0deg); }
}

/* Ελαφρύ κούνημα της ουράς */
.deer-tail {
  animation: tail-flick 4s infinite ease-in-out;
  transform-origin: 75px 42px;
}
@keyframes tail-flick {
  0%, 80% { transform: rotate(0deg); }
  85% { transform: rotate(-15deg); }
  90% { transform: rotate(5deg); }
  95%, 100% { transform: rotate(0deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #roe-deer-nature {
    width: 49.6px;
    height: 45px;
  }
}
/* === ΣΑΛΑΜΑΝΔΡΑ ΤΗΣ ΦΩΤΙΑΣ (S-CURVE ANIMATION) === */
.t-eco-salamander {
  position: absolute;
  width: 50px;
  height: 45px;
  z-index: 49; /* Στο έδαφος, κάτω από τα πουλιά */
  cursor: pointer;
display: none;
}
.t-eco-salamander.active { display: block; }

/* 1. Ο Κορμός λυγίζει αριστερά-δεξιά */
.sal-torso {
  animation: sal-body-bend 3s infinite ease-in-out;
  transform-origin: 50px 48px; /* Κέντρο του σώματος */
}
@keyframes sal-body-bend {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}

/* 2. Το Κεφάλι κάνει ΑΝΤΙΡΡΟΠΗ κίνηση για να στοχεύει μπροστά (Κύμα S) */
.sal-head {
  animation: sal-head-bend 3s infinite ease-in-out;
  transform-origin: 50px 32px; /* Βάση του λαιμού */
}
@keyframes sal-head-bend {
  0%, 100% { transform: rotate(14deg); }
  50% { transform: rotate(-14deg); }
}

/* 3. Η Ουρά κάνει επίσης ΑΝΤΙΡΡΟΠΗ κίνηση σαν μαστίγιο */
.sal-tail-group {
  animation: sal-tail-bend 3s infinite ease-in-out;
  transform-origin: 50px 63px; /* Ένωση ουράς με κορμό */
}
@keyframes sal-tail-bend {
  0%, 100% { transform: rotate(20deg); }
  50% { transform: rotate(-20deg); }
}

/* 4. ΚΙΝΗΣΗ ΠΟΔΙΩΝ (Σταυρωτό Βάδισμα - Cross Crawl) */
/* Το Εμπρός Αριστερά (fl) & Πίσω Δεξιά (br) πάνε μαζί */
.sal-leg.fl { animation: leg-swing-a 3s infinite ease-in-out; transform-origin: 41px 35px; }
.sal-leg.br { animation: leg-swing-a 3s infinite ease-in-out; transform-origin: 59px 60px; }

/* Το Εμπρός Δεξιά (fr) & Πίσω Αριστερά (bl) πάνε μαζί (αντίθετα από τα άλλα) */
.sal-leg.fr { animation: leg-swing-b 3s infinite ease-in-out; transform-origin: 59px 35px; }
.sal-leg.bl { animation: leg-swing-b 3s infinite ease-in-out; transform-origin: 41px 60px; }

@keyframes leg-swing-a {
  0%, 100% { transform: rotate(-30deg); } /* Πόδι τραβηγμένο πίσω */
  50% { transform: rotate(30deg); }       /* Πόδι απλωμένο μπροστά */
}
@keyframes leg-swing-b {
  0%, 100% { transform: rotate(30deg); }  /* Πόδι απλωμένο μπροστά */
  50% { transform: rotate(-30deg); }      /* Πόδι τραβηγμένο πίσω */
}

/* 5. Μικρή παλινδρόμηση όλου του ζώου μπρος-πίσω (Εφέ έρπυσης) */
.sal-wrapper {
  animation: sal-forward-crawl 1.5s infinite ease-in-out;
}
@keyframes sal-forward-crawl {
  0%, 100% { transform: rotate(35deg) translateY(0px); }
  50% { transform: rotate(35deg) translateY(-2px); }
}

/* Responsive */
@media (max-width: 767px) {
  .t-eco-salamander { width: 47px; height: 43px; }
}
/* === Η ΑΛΕΠΟΥ (ΤΟ ΣΚΑΝΑΡΙΣΜΑ) === */
.t-eco-fox {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 34; /* Φύση / Θάμνοι */
  cursor: pointer;
  display: none; 
}

.t-eco-fox.active { display: block; }

/* Η φουντωτή ουρά (Απαλό, συνεχόμενο κούνημα) */
.fox-tail-swish {
  animation: fox-tail-wag 3s infinite alternate ease-in-out;
  transform-origin: 65px 70px; /* Η βάση της ουράς πίσω */
}
@keyframes fox-tail-wag {
  0% { transform: rotate(-8deg); }
  100% { transform: rotate(12deg); }
}

/* Το κεφάλι (Σκανάρισμα/Μύρισμα εδάφους κάθε 6 δευτερόλεπτα) */
.fox-head-sniff {
  animation: fox-sniffing 6s infinite ease-in-out;
  transform-origin: 45px 45px; /* Η άρθρωση του λαιμού */
}
@keyframes fox-sniffing {
  0%, 70% { transform: rotate(0deg) translate(0px, 0px); } /* Κοιτάει περήφανα μπροστά */
  75%, 85% { transform: rotate(-35deg) translate(-10px, 12px); } /* Σκύβει και μυρίζει το χώμα */
  90%, 100% { transform: rotate(0deg) translate(0px, 0px); } /* Επιστρέφει ψηλά */
}

/* Το σώμα αναπνέει ελαφρά */
.fox-body-breathe {
  animation: fox-breathe 2.5s infinite alternate ease-in-out;
}
@keyframes fox-breathe {
  0% { transform: scaleY(0.98) translateY(1px); }
  100% { transform: scaleY(1.02) translateY(0px); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #fox-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === Ο ΠΕΛΕΚΑΝΟΣ (ΤΟ ΤΕΝΤΩΜΑ) === */
.t-eco-pelican {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 36; /* Φύση / Υγροβιότοπος */
  cursor: pointer;
  display: none; 
}

.t-eco-pelican.active { display: block; }

/* 1. Η κίνηση του κεφαλιού (Γέρνει πίσω) */
.peli-head-tilt {
  animation: pelican-yawn 7s infinite ease-in-out;
  transform-origin: 60px 30px; /* Βάση του λαιμού/κεφαλιού */
}
@keyframes pelican-yawn {
  0%, 55% { transform: rotate(0deg); } /* Ήρεμος */
  60%, 65% { transform: rotate(25deg); } /* Γέρνει πίσω για να χασμουρηθεί */
  72%, 100% { transform: rotate(0deg); } /* Επιστρέφει */
}

/* 2. Το πάνω ράμφος (Ανοίγει διάπλατα) */
.peli-upper-beak {
  animation: beak-open 7s infinite ease-in-out;
  transform-origin: 52px 28px;
}
@keyframes beak-open {
  0%, 56% { transform: rotate(0deg); }
  60%, 65% { transform: rotate(-35deg); } /* Ανοίγει ψηλά */
  70%, 100% { transform: rotate(0deg); }
}

/* 3. Ο ελαστικός σάκος (Μεγαλώνει/Τεντώνεται) */
.peli-pouch-stretch {
  animation: pouch-expand 7s infinite ease-in-out;
  transform-origin: 52px 30px;
}
@keyframes pouch-expand {
  0%, 56% { transform: scaleY(1) scaleX(1) translateY(0); }
  60%, 65% { transform: scaleY(1.5) scaleX(1.1) translateY(2px) skewX(-10deg); } /* Ο σάκος τεντώνεται */
  70%, 100% { transform: scaleY(1) scaleX(1) translateY(0); }
}

/* 4. Η φτερούγα (Τεντώνεται ταυτόχρονα) */
.peli-wing-stretch {
  animation: wing-flex 7s infinite ease-in-out;
  transform-origin: 65px 45px;
}
@keyframes wing-flex {
  0%, 55% { transform: rotate(0deg) scale(1); }
  60%, 65% { transform: rotate(-20deg) scale(1.1) translateY(-2px); } /* Σηκώνει τον ώμο */
  72%, 100% { transform: rotate(0deg) scale(1); }
}

/* Ελαφριά αναπνοή στο σώμα */
.peli-body-breathe {
  animation: peli-breathe 3s infinite alternate ease-in-out;
}
@keyframes peli-breathe {
  0% { transform: translateY(1px); }
  100% { transform: translateY(-1px); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #pelican-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === Ο ΑΛΠΙΚΟΣ ΤΡΙΤΩΝΑΣ (ΤΟ ΔΡΑΚΑΚΙ ΤΗΣ ΛΙΜΝΗΣ) === */
.t-eco-tritonas {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 33; /* Στα ρηχά / Λίμνες */
  cursor: pointer;
  display: none; 
}

.t-eco-tritonas.active { display: block; }

/* Η αιώρηση στο νερό (Ολόκληρο το SVG ανεβοκατεβαίνει) */
.triton-float {
  animation: water-hover 4s infinite alternate ease-in-out;
}
@keyframes water-hover {
  0% { transform: translateY(-3px); }
  100% { transform: translateY(3px); }
}

/* Το κούνημα της ουράς (Κολύμπι με rotate και skewX) */
.triton-tail-swim {
  animation: tail-swish 1.5s infinite alternate ease-in-out;
  transform-origin: 50px 55px; /* Η βάση της ουράς */
}
@keyframes tail-swish {
  0% { transform: rotate(-15deg) skewX(-15deg); }
  100% { transform: rotate(15deg) skewX(15deg); }
}

/* Τα κυματάκια του νερού (Ripples από κάτω του) */
.triton-ripple {
  fill: none;
  stroke: #ffffff;
  stroke-width: 1;
  animation: ripple-expand 3s infinite linear;
  opacity: 0;
  transform-origin: 50px 40px; /* Κέντρο του τρίτωνα */
}
/* Καθυστέρηση για να βγαίνει το ένα μετά το άλλο */
.triton-ripple.r1 { animation-delay: 0s; }
.triton-ripple.r2 { animation-delay: 1.5s; }

@keyframes ripple-expand {
  0% { transform: scale(0.2); opacity: 0.5; stroke-width: 1.5; }
  100% { transform: scale(2.5); opacity: 0; stroke-width: 0.2; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #tritonas-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === ΤΟ ΝΕΡΟΦΙΔΟ (Η ΑΘΟΡΥΒΗ ΟΛΙΣΘΗΣΗ) === */
.t-eco-nerofido {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 34; /* Πάνω στα ποτάμια / νερά */
  cursor: pointer;
  display: none; 
}

.t-eco-nerofido.active { display: block; }

/* Κυματισμοί του ποταμού γύρω από το σώμα */
.snake-water-ripple {
  fill: none;
  stroke: #7ec8e3;
  stroke-width: 1.5;
  animation: river-ripple 3s infinite linear;
  opacity: 0;
  transform-origin: 50px 50px;
}
.snake-water-ripple.r2 { animation-delay: 1.5s; }

@keyframes river-ripple {
  0% { transform: scale(0.3) scaleY(0.7); opacity: 0.8; stroke-width: 2; }
  100% { transform: scale(2) scaleY(1); opacity: 0; stroke-width: 0.2; }
}

/* Το σώμα επιπλέει και αναπνέει ελαφρά */
.snake-body-float {
  animation: snake-hover 4s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes snake-hover {
  0% { transform: scale(0.98) rotate(-2deg); }
  100% { transform: scale(1.02) rotate(2deg); }
}

/* Το κεφάλι ανασηκώνεται λίγο πριν βγάλει τη γλώσσα */
.snake-head-lift {
  animation: head-bob 5s infinite ease-in-out;
  transform-origin: 30px 30px; /* Η βάση του λαιμού */
}
@keyframes head-bob {
  0%, 75% { transform: translateY(0px) rotate(0deg); }
  85%, 95% { transform: translateY(-4px) rotate(-8deg); } /* Ανασηκώνεται */
  100% { transform: translateY(0px) rotate(0deg); }
}

/* Η διχαλωτή γλώσσα (Αστραπιαίο διπλό flick) */
.snake-tongue-flick {
  animation: tongue-dart 5s infinite;
  transform-origin: 19px 28px; /* Η άκρη της μουσούδας */
}
@keyframes tongue-dart {
  0%, 84% { transform: scaleX(0); }
  86% { transform: scaleX(1); } /* 1ο τίναγμα */
  88% { transform: scaleX(0); }
  90% { transform: scaleX(1); } /* 2ο τίναγμα */
  92%, 100% { transform: scaleX(0); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #nerofido-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === Ο ΚΑΒΟΥΡΑΣ (Η ΠΛΑΓΙΑ ΠΕΡΙΠΟΛΙΑ) === */
.t-sea-crab {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 33; /* Ακτογραμμή */
  cursor: pointer;
  display: none;
}

.t-sea-crab.active { display: block; }

/* Το πλάγιο περπάτημα (Περιπολία) */
.crab-sideways-patrol {
  animation: crab-walk 6s infinite ease-in-out;
}
@keyframes crab-walk {
  0%, 10% { transform: translateX(0); }
  40%, 60% { transform: translateX(15px); } /* Μετακίνηση δεξιά και στάση */
  90%, 100% { transform: translateX(0); } /* Επιστροφή */
}

/* Οι δαγκάνες ανοιγοκλείνουν ΜΟΝΟ όταν σταματάει (40%-60%) */
.crab-claw-l {
  animation: claw-snap-l 6s infinite;
  transform-origin: 35px 45px;
}
.crab-claw-r {
  animation: claw-snap-r 6s infinite;
  transform-origin: 65px 45px;
}

@keyframes claw-snap-l {
  0%, 42% { transform: rotate(0deg); }
  45% { transform: rotate(-25deg); } /* 1ο Κλακ */
  48% { transform: rotate(0deg); }
  52% { transform: rotate(-25deg); } /* 2ο Κλακ */
  55%, 100% { transform: rotate(0deg); }
}
@keyframes claw-snap-r {
  0%, 42% { transform: rotate(0deg); }
  45% { transform: rotate(25deg); } /* 1ο Κλακ */
  48% { transform: rotate(0deg); }
  52% { transform: rotate(25deg); } /* 2ο Κλακ */
  55%, 100% { transform: rotate(0deg); }
}

/* Τα πόδια κουνιούνται μόνο όταν περπατάει */
.crab-legs-move {
  animation: leg-scuttle 0.2s infinite;
}
@keyframes leg-scuttle {
  0% { transform: translateY(0); }
  100% { transform: translateY(1.5px); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #crab-sea-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === ΤΑ ΔΕΛΦΙΝΙΑ (ΣΥΓΧΡΟΝΙΣΜΕΝΟ ΑΛΜΑ) === */
.t-sea-dolphins {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 33; /* Θάλασσα */
  cursor: pointer;
  display: none; 
}

.t-sea-dolphins.active { display: block; }

/* Το επικό άλμα (Τόξο στον αέρα) */
.dolphin-jump {
  animation: dolphin-jump-anim 4s infinite ease-in-out;
  opacity: 0;
}
.dolphin-jump.parent { animation-delay: 0s; }
.dolphin-jump.calf { animation-delay: 0.5s; } /* Καθυστέρηση μισού δευτερολέπτου */

@keyframes dolphin-jump-anim {
  0% { transform: translate(-35px, 25px) rotate(-60deg); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translate(0px, -35px) rotate(0deg); opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate(35px, 25px) rotate(60deg); opacity: 0; }
}

/* Πιτσιλιές στη βάση του άλματος (Συγχρονισμένες με το χρόνο εισόδου/εξόδου) */
.dolphin-splash {
  fill: none;
  stroke: #ffffff;
  stroke-width: 1.5;
  opacity: 0;
  animation-duration: 4s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
}

/* Πιτσιλιά απογείωσης μαμάς (0s) */
.dolphin-splash.s-takeoff {
  animation-name: splash-boom-start;
  transform-origin: 20px 65px;
}
/* Πιτσιλιά απογείωσης παιδιού (καθυστέρηση 0.5s) */
.dolphin-splash.s-calf-takeoff {
  animation-name: splash-boom-start;
  animation-delay: 0.5s;
  transform-origin: 25px 65px;
}
/* Πιτσιλιά προσγείωσης μαμάς (στο 85% του κύκλου) */
.dolphin-splash.s-landing {
  animation-name: splash-boom-end;
  transform-origin: 80px 65px;
}

@keyframes splash-boom-start {
  0% { opacity: 0; transform: scale(0.2); }
  2% { opacity: 1; stroke-width: 2; }
  12% { opacity: 0; transform: scale(1.8); stroke-width: 0.5; }
  100% { opacity: 0; }
}

@keyframes splash-boom-end {
  0%, 82% { opacity: 0; transform: scale(0.2); }
  85% { opacity: 1; stroke-width: 2; }
  95% { opacity: 0; transform: scale(1.8); stroke-width: 0.5; }
  100% { opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #dolphins-sea-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === ΠΑΝΙΔΑ: ΑΒΟΚΕΤΑ === */
.t-eco-avocet {
  position: absolute;
  width: 54px;
  height: 49px;
  z-index: 48;
  cursor: pointer;
  display: none;
}
.t-eco-avocet.active { display: block; }

/* 1. Η κίνηση εκκρεμούς (Sweeping) για τον λαιμό και το κεφάλι */
.avocet-sweep-group {
  animation: avocet-foraging 4s infinite ease-in-out;
  transform-origin: 45px 52px; /* Η βάση του λαιμού, εκεί που ενώνεται με το στήθος */
}
@keyframes avocet-foraging {
  0%, 100% { transform: rotate(-22deg); } /* Σκούπισμα τέρμα αριστερά */
  50% { transform: rotate(18deg); }       /* Σκούπισμα τέρμα δεξιά */
}

/* 2. Κυματάκια στο νερό (Ripples) */
.avo-ripple-l, .avo-ripple-r {
  opacity: 0;
}
/* Το αριστερό σκάει στο 0% / 100% (άρα delay: 0s) */
.avo-ripple-l circle {
  animation: beak-ripple-fx 4s infinite ease-out;
}
/* Το δεξί σκάει στο 50% (άρα delay ακριβώς το μισό του κύκλου: 2s) */
.avo-ripple-r circle {
  animation: beak-ripple-fx 4s infinite ease-out;
  animation-delay: 2s;
}

@keyframes beak-ripple-fx {
  0% { transform: scale(0.2); opacity: 0; stroke-width: 2.5; }
  5% { opacity: 1; }
  35% { transform: scale(3.5); opacity: 0; stroke-width: 0.5; }
  100% { opacity: 0; }
}

/* 3. Πολύ απαλή αναπνοή/στάση του σώματος για να μη μοιάζει με άγαλμα */
.avocet-body {
  animation: avocet-body-balance 2s infinite alternate ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes avocet-body-balance {
  0% { transform: translateY(0px) rotate(-1deg); }
  100% { transform: translateY(-1.5px) rotate(1deg); }
}

/* Responsive */
@media (max-width: 767px) {
  .t-eco-avocet { width: 43px; height: 38px; }
}
/* === ΠΑΝΙΔΑ: ΝΕΡΟΚΟΤΣΥΦΑΣ === */
.t-eco-dipper {
  position: absolute;
  width: 60px;
  height: 60px;
  z-index: 47;
  cursor: pointer;
  display: none;
}
.t-eco-dipper.active { display: block; }

/* 1. Το Νευρικό Καθισματάκι (Bobbing - Squash & Stretch) */
.dipper-bob-master {
  animation: dipper-squash-jump 2.5s infinite;
  transform-origin: 50px 72px; /* Η βάση των ποδιών στον βράχο */
}

@keyframes dipper-squash-jump {
  0%, 40%, 80%, 100% { transform: scale(1, 1) translateY(0); }
  /* Διπλό γρήγορο καθισματάκι (Squash) */
  8%  { transform: scale(1.08, 0.85) translateY(3px); } 
  16% { transform: scale(0.95, 1.05) translateY(-2px); } 
  24% { transform: scale(1.08, 0.85) translateY(3px); } 
  32% { transform: scale(1, 1) translateY(0); }
  /* Μεγάλο τέντωμα για να ελέγξει τον χώρο (Stretch & Alert) */
  55% { transform: scale(0.92, 1.1) translateY(-4px); } 
  65% { transform: scale(0.92, 1.1) translateY(-4px); } 
}

/* 2. Κίνηση Ουράς (Twitch) */
.dipper-tail {
  animation: dipper-tail-twitch 2.5s infinite;
  transform-origin: 62px 60px;
}
@keyframes dipper-tail-twitch {
  0%, 40%, 100% { transform: rotate(0deg); }
  16% { transform: rotate(-15deg); } /* Πέφτει όταν τεντώνεται το σώμα */
  55% { transform: rotate(10deg); }  /* Σηκώνεται πιο ψηλά στο alert */
}

/* 3. Ορμητικό Ρέμα (Fast Flowing Water) */
.foam-fast {
  stroke-dasharray: 15 15;

}
.foam-slow {
  stroke-dasharray: 20 25;
  opacity: 0.7;
}
.foam-splash {
  stroke-dasharray: 10 30;

  opacity: 0.9;
}

@keyframes river-flow {
  from { stroke-dashoffset: 60; }
  to   { stroke-dashoffset: 0; }
}

/* Responsive */
@media (max-width: 767px) {
  .t-eco-dipper { width: 45px; height: 45px; }
}
/* === Ο ΓΛΑΡΟΣ (Η ΒΟΥΤΙΑ ΓΙΑ ΨΑΡΕΜΑ) === */
.t-sea-gull {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 36; /* Ψηλά στον αέρα και νερό */
  cursor: pointer;
  display: none; 
}

.t-sea-gull.active { display: block; }

/* Ο κύκλος της βουτιάς (Αιώρηση -> Βουτιά -> Βυθός -> Ανάδυση) */
.gull-dive-master {
  animation: gull-hunt-cycle 6s infinite ease-in-out;
  transform-origin: 25px 20px;
}
@keyframes gull-hunt-cycle {
  0%, 15% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; } /* Αιώρηση */
  18% { transform: translate(5px, -5px) rotate(80deg); opacity: 1; } /* Στοχεύει κάτω */
  25% { transform: translate(15px, 38px) rotate(80deg); opacity: 1; } /* Χτυπάει το νερό */
  26%, 45% { transform: translate(15px, 38px) rotate(80deg); opacity: 0; } /* Κάτω από το νερό */
  46% { transform: translate(15px, 38px) rotate(-35deg); opacity: 0; } /* Γυρνάει για ανάδυση */
  50% { transform: translate(15px, 38px) rotate(-35deg); opacity: 1; } /* Σπάει την επιφάνεια */
  65%, 100% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; } /* Επιστρέφει ψηλά */
}

/* Κλείσιμο φτερών (Αεροδυναμικό σχήμα) */
.gull-wings-fold {
  animation: wing-aerodynamic 6s infinite ease-in-out;
  transform-origin: 25px 20px;
}
@keyframes wing-aerodynamic {
  0%, 15% { transform: scaleY(1) scaleX(1); }
  18%, 25% { transform: scaleY(0.15) scaleX(0.7) rotate(10deg); } /* Κλειστά φτερά σαν βέλος */
  26%, 100% { transform: scaleY(1) scaleX(1); }
}

/* Κανονικό φτερούγισμα (Γίνεται μικροσκοπικό όταν τα φτερά κάνουν scaleY(0.15)) */
.gull-wing-flap {
  animation: wing-beat 0.4s infinite alternate ease-in-out;
  transform-origin: 25px 20px;
}
@keyframes wing-beat {
  0% { transform: rotate(-25deg); }
  100% { transform: rotate(25deg); }
}

/* Το συντριβάνι / πιτσιλιά στο νερό */
.gull-water-splash {
  fill: none;
  stroke: #ffffff;
  stroke-linecap: round;
  animation: splash-burst 6s infinite ease-out;
  transform-origin: 35px 65px;
  opacity: 0;
}
@keyframes splash-burst {
  0%, 24% { opacity: 0; transform: scale(0.3) translateY(0); stroke-width: 2; }
  25% { opacity: 1; transform: scale(0.8) translateY(-2px); stroke-width: 2.5; }
  30% { opacity: 0; transform: scale(1.6) translateY(-8px); stroke-width: 0.5; }
  100% { opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #gull-sea-nature {
    width: 54.6px;
    height: 49px;
  }
}
/* === ΤΟ ΜΙΚΡΟ ΚΟΠΑΔΙ (ΤΣΙΠΟΥΡΕΣ) === */
.t-sea-school {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 32; /* Μέσα στο νερό */
  cursor: pointer;
  display: none; 
}

.t-sea-school.active { display: block; }

/* Το κοινό animation του κοπαδιού (Απαλή αιώρηση/κολύμπι) */
.fish-swim {
  animation: school-bob 2.5s infinite alternate ease-in-out;
}

/* Τα διαφορετικά delays δημιουργούν τον συγχρονισμό του κοπαδιού! */
.fish-1 { animation-delay: 0s; }
.fish-2 { animation-delay: 0.3s; }
.fish-3 { animation-delay: 0.6s; }

@keyframes school-bob {
  0% { transform: translateY(-4px) rotate(-2deg); }
  100% { transform: translateY(4px) rotate(2deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #school-sea-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === Η ΦΩΚΙΑ (MONACHUS MONACHUS) - UPDATED === */
.t-sea-seal {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 35;
  cursor: pointer;
  /* overflow: hidden για να εξαφανίζεται η φώκια όταν κατεβαίνει κάτω από τη βάση */
  overflow: hidden; 
  display: none; 
}

.t-sea-seal.active { display: block; }

/* Animation Ανάδυσης (Παραμένει ίδιο) */
.seal-emerge-anim {
  animation: seal-hide-seek 7s infinite ease-in-out;
}
@keyframes seal-hide-seek {
  0%, 65% { transform: translateY(45px); opacity: 0; }
  70% { transform: translateY(5px); opacity: 1; }
  85% { transform: translateY(5px); opacity: 1; }
  90%, 100% { transform: translateY(45px); opacity: 0; }
}

/* Animation Ματιών (Το "σκανάρισμα") */
.seal-eyes-look {
  animation: eyes-scan 12s infinite ease-in-out;
}
@keyframes eyes-scan {
  0%, 72% { transform: translateX(0px); }
  75% { transform: translateX(-2.5px); } 
  80% { transform: translateX(2.5px); }  
  83%, 100% { transform: translateX(0px); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #seal-sea-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === Η ΑΛΚΥΟΝΗ (ΤΟ ΑΙΩΡΟΥΜΕΝΟ ΨΑΡΕΜΑ) === */
.t-eco-alkyoni {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 36; /* Ψηλά στον αέρα πάνω από το ποτάμι */
  cursor: pointer;
  display: none; 
}

.t-eco-alkyoni.active { display: block; }

/* Ο κύκλος της αιώρησης και της αστραπιαίας κατάδυσης */
.alkyoni-dive-master {
  animation: alkyoni-hunt 5s infinite ease-in-out;
  transform-origin: 50px 25px;
}
@keyframes alkyoni-hunt {
  /* 0% έως 60%: Στάσιμη αιώρηση στον αέρα με μικρο-κινήσεις */
  0%, 20%, 40%, 60% { transform: translateY(0px) rotate(0deg); }
  10%, 30%, 50% { transform: translateY(-2px) rotate(1deg); }
  
  /* 64%: Στοχοποίηση και αστραπιαία κατακόρυφη πτώση στο νερό (Y=65) */
  64% { transform: translateY(40px) rotate(75deg) scaleX(0.9); opacity: 1; }
  
  /* 65%-67%: Στιγμιαία εξαφάνιση μέσα στο νερό για το ψάρεμα */
  65%, 67% { transform: translateY(42px) rotate(75deg); opacity: 0; }
  
  /* 75%: Δυναμική ανάδυση και επιστροφή στη θέση της */
  75% { transform: translateY(-5px) rotate(-20deg); opacity: 1; }
  82%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
}

/* Πολύ γρήγορο, μικρό φτερούγισμα (flutter) κατά την αιώρηση */
.alkyoni-wings-flutter {
  animation: alkyoni-wing-beat 0.15s infinite alternate ease-in-out;
  transform-origin: 50px 28px;
}
@keyframes alkyoni-wing-beat {
  0% { transform: scaleY(0.3) rotate(-10deg); }
  100% { transform: scaleY(1.2) rotate(15deg); }
}

/* Μικρή πιτσιλιά στο ποτάμι τη στιγμή της εισόδου (64%) */
.alkyoni-river-splash {
  fill: none;
  stroke: #ffffff;
  stroke-linecap: round;
  opacity: 0;
  animation: alkyoni-splash-burst 5s infinite ease-out;
  transform-origin: 62px 65px;
}
@keyframes alkyoni-splash-burst {
  0%, 63% { opacity: 0; transform: scale(0.3); stroke-width: 2; }
  64% { opacity: 1; transform: scale(1); stroke-width: 2.5; }
  68% { opacity: 0; transform: scale(1.8); stroke-width: 0.5; }
  100% { opacity: 0; }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #alkyoni-eco-nature {
    width: 53.6px;
    height: 48px;
  }
}
/* === Ο ΣΚΙΟΥΡΟΣ (Ο ΑΚΡΟΒΑΤΗΣ ΤΩΝ ΚΟΡΜΩΝ) === */
.t-eco-squirrel {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 34; /* Πάνω στους κορμούς των δέντρων */
  cursor: pointer;
   display: none; 
}

.t-eco-squirrel.active { display: block; }

/* Το νευρικό σκαρφάλωμα (Άλμα -> Παύση -> Άλμα) */
.squirrel-climb-anim {
  animation: squirrel-scurry 8s infinite ease-in-out;
}
@keyframes squirrel-scurry {
  0%, 15% { transform: translateY(40px); opacity: 0; } /* Κρυμμένος στη βάση */
  17% { opacity: 1; }
  
  /* 1ο Πηδηματάκι */
  20% { transform: translateY(25px) rotate(-10deg); }
  22% { transform: translateY(25px) rotate(0deg); } /* Μικρή παύση */
  
  /* 2ο Πηδηματάκι */
  25% { transform: translateY(10px) rotate(-10deg); }
  27% { transform: translateY(10px) rotate(0deg); } /* Μικρή παύση */
  
  /* 3ο Πηδηματάκι - Φτάνει στη μέση του κορμού */
  30%, 65% { transform: translateY(-5px) rotate(0deg); opacity: 1; } /* Στάση για έλεγχο */
  
  /* Αστραπιαίο σκαρφάλωμα και εξαφάνιση στα φύλλα */
  68% { transform: translateY(-35px) rotate(-5deg); opacity: 1; }
  72%, 100% { transform: translateY(-35px); opacity: 0; } /* Μέσα στα φύλλα */
}

/* Το απότομο γύρισμα του κεφαλιού/σώματος (Look Around στο 45%-55%) */
.squirrel-turn-head {
  animation: squirrel-flip 8s infinite ease-in-out;
  transform-origin: 38px 35px; /* Το κέντρο του σκίουρου */
}
@keyframes squirrel-flip {
  0%, 42% { transform: scaleX(1); }
  45%, 58% { transform: scaleX(-1); } /* Γυρνάει ανάποδα κοιτώντας δεξιά */
  62%, 100% { transform: scaleX(1); } /* Ξαναγυρνάει μπροστά και φεύγει */
}

/* Ελαφρύ τρέμουλο στην ουρά του όσο είναι σταματημένος */
.squirrel-tail-twitch {
  animation: tail-twitch 0.4s infinite alternate ease-in-out;
  transform-origin: 32px 38px;
}
@keyframes tail-twitch {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #squirrel-eco-nature {
    width: 52.6px;
    height: 47px;
  }
}
/* === ΤΟ ΑΓΡΙΟ ΑΛΟΓΟ (Ο ΕΛΕΥΘΕΡΟΣ ΚΑΛΠΑΣΜΟΣ) === */
.t-wild-mustang {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 33; /* Πεδιάδες / Πρόποδες */
  cursor: pointer;
  display: none; 
}

.t-wild-mustang.active { display: block; }

/* 1. Η κίνηση κατά μήκος της οθόνης (Περνάει από δεξιά προς αριστερά) */
.mustang-gallop-across {
  animation: gallop-path 19s infinite linear;
}
@keyframes gallop-path {
  0% { transform: translateX(30px); opacity: 0; }
  10% { transform: translateX(15px); opacity: 1; }
  90% { transform: translateX(-15px); opacity: 1; }
  100% { transform: translateX(-30px); opacity: 0; }
}

/* 2. Ο ρυθμός του καλπασμού (Πάνω-κάτω και μπρος-πίσω) */
.mustang-body-rhythm {
  animation: gallop-bounce 0.6s infinite ease-in-out;
  transform-origin: 50px 50px;
}
@keyframes gallop-bounce {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(4deg); } /* Τέντωμα στον αέρα */
  100% { transform: translateY(0) rotate(-2deg); } /* Επαφή με το έδαφος */
}

/* 3. Η Χαίτη (Ανεμίζει προς τα πίσω) */
.mustang-mane-wind {
  animation: wind-blow-mane 0.4s infinite alternate ease-in-out;
  transform-origin: 28px 25px; /* Στον αυχένα */
}
@keyframes wind-blow-mane {
  0% { transform: skewX(10deg); }
  100% { transform: skewX(25deg); }
}

/* 4. Η Ουρά (Ανεμίζει προς τα πίσω έντονα) */
.mustang-tail-wind {
  animation: wind-blow-tail 0.5s infinite alternate ease-in-out;
  transform-origin: 75px 35px; /* Στη βάση της ουράς */
}
@keyframes wind-blow-tail {
  0% { transform: rotate(10deg) skewX(10deg); }
  100% { transform: rotate(25deg) skewX(20deg); }
}

/* Τα πόδια (Εντελώς απλό blur/κίνηση για την ψευδαίσθηση ταχύτητας) */
.mustang-legs-blur {
  animation: legs-gallop 0.3s infinite alternate;
  transform-origin: 50px 60px;
}
@keyframes legs-gallop {
  0% { transform: scaleX(0.8) skewX(10deg); }
  100% { transform: scaleX(1.2) skewX(-10deg); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #mustang-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === Η ΚΟΥΚΟΥΒΑΓΙΑ (Ο ΝΥΧΤΕΡΙΝΟΣ ΠΑΡΑΤΗΡΗΤΗΣ) === */
.t-eco-owl {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 34; /* Μέσα στις φυλλωσιές των δέντρων */
  cursor: pointer;
  display: none; 
}

.t-eco-owl.active { display: block; }

/* 1. Η ομαλή περιστροφή του κεφαλιού (Rotate αριστερά-δεξιά) */
.owl-head-turn {
  animation: owl-head-rotate 7s infinite ease-in-out;
  transform-origin: 50px 42px; /* Η βάση του κεφαλιού / λαιμός */
}
@keyframes owl-head-rotate {
  0%, 25% { transform: rotate(0deg); }      /* Κοιτάει ευθεία */
  35%, 55% { transform: rotate(-70deg); }   /* Στροφή αριστερά */
  65%, 85% { transform: rotate(70deg); }    /* Στροφή δεξιά */
  95%, 100% { transform: rotate(0deg); }    /* Επιστροφή στο κέντρο */
}

/* 2. Το αστραπιαίο ανοιγοκλείσιμο των ματιών (Double Blink με scaleY) */
.owl-eyes-blink {
  animation: owl-eye-snap 4s infinite ease-in-out;
  transform-origin: 50px 33px; /* Ο άξονας των ματιών */
}
@keyframes owl-eye-snap {
  0%, 45%, 49%, 53%, 100% { transform: scaleY(1); }
  47%, 51% { transform: scaleY(0); } /* Ακαριαίο διπλό κλείσιμο ματιών */
}

/* 3. Ήπια αναπνοή για το σώμα */
.owl-body-breath {
  animation: owl-breath 3s infinite alternate ease-in-out;
  transform-origin: 50px 55px;
}
@keyframes owl-breath {
  0% { transform: scaleY(0.97); }
  100% { transform: scaleY(1.03); }
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #owl-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}
/* === ΟΙ ΠΥΓΟΛΑΜΠΙΔΕΣ (ΤΟ ΜΑΓΙΚΟ ΔΑΣΟΣ) === */
.t-eco-firefly {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 35; 
  cursor: pointer;
display: none; 
}

.t-eco-firefly.active { display: block; }

.ff-glow {
  animation: firefly-pulse 2.5s infinite alternate ease-in-out;
}
.ff-glow.d1 { animation-duration: 3s; animation-delay: 0.5s; }
.ff-glow.d2 { animation-duration: 2s; animation-delay: 1.2s; }
.ff-glow.d3 { animation-duration: 3.5s; animation-delay: 0.2s; }

/* Αυξήσαμε την ένταση (pixels) στο drop-shadow για πολύ μεγαλύτερη λάμψη */
@keyframes firefly-pulse {
  0%, 20% { opacity: 0.5; filter: drop-shadow(0 0 4px #ccff00); transform: scale(0.9); }
  100% { opacity: 1; filter: drop-shadow(0 0 12px #ccff00) drop-shadow(0 0 22px #99ff00); transform: scale(1.1); }
}

.ff-flight-1 { animation: ff-path-1 8s infinite linear; transform-origin: 50px 45px; }
.ff-flight-2 { animation: ff-path-2 10s infinite linear reverse; transform-origin: 50px 45px; }
.ff-flight-3 { animation: ff-path-3 7s infinite linear; transform-origin: 50px 45px; }

@keyframes ff-path-1 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(12px, -8px) rotate(15deg); }
  66% { transform: translate(-8px, 12px) rotate(-10deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
}
@keyframes ff-path-2 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(-15px, -12px) rotate(-20deg); }
  66% { transform: translate(10px, 8px) rotate(10deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
}
@keyframes ff-path-3 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(8px, 15px) rotate(10deg); }
  66% { transform: translate(-12px, -5px) rotate(-15deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
}

@media (max-width: 767px) {
  #firefly-eco-nature {
    width: 53.6px;
    height: 48px;
  }
}
/* === Ο ΣΚΑΝΤΖΟΧΟΙΡΟΣ (ΑΜΥΝΑ ΚΑΙ ΚΟΥΒΑΡΙ) === */
.t-eco-hedgehog {
  position: absolute;
  width: 59.5px;
  height: 52.5px;
  z-index: 34; /* Στα λιβάδια ή τις καλλιέργειες */
  cursor: pointer;
  display: none; 
}

.t-eco-hedgehog.active { display: block; }

/* 1. Η κίνηση του περπατήματος (Αργά βήματα μπρος-πίσω και κούνημα) */
.hh-walk-anim {
  animation: hh-scuttle 8s infinite alternate ease-in-out;
  transform-origin: 50px 60px;
}
@keyframes hh-scuttle {
  0% { transform: translateX(-15px) rotate(0deg); }
  25% { transform: translateX(-7.5px) rotate(3deg); }
  50% { transform: translateX(0px) rotate(0deg); }
  75% { transform: translateX(7.5px) rotate(-3deg); }
  100% { transform: translateX(15px) rotate(0deg); }
}

/* Ομάδες για το Hover Effect με Transitions */
.hh-face, .hh-legs, .hh-spikes {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Όταν γίνεται HOVER (Ο σκαντζόχοιρος γίνεται κουβάρι) */
.t-eco-hedgehog:hover .hh-walk-anim {
  animation-play-state: paused; /* Σταματάει να περπατάει */
}

/* Το μουσούδι μαζεύεται προς τα μέσα και εξαφανίζεται */
.t-eco-hedgehog:hover .hh-face {
  transform: translateX(-12px) scale(0.2);
  opacity: 0;
}

/* Τα ποδαράκια μαζεύονται πάνω */
.t-eco-hedgehog:hover .hh-legs {
  transform: translateY(-8px) scaleY(0);
  opacity: 0;
}

/* Η πλάτη με τα αγκάθια κατεβαίνει και "φουσκώνει" ελαφρώς */
.t-eco-hedgehog:hover .hh-spikes {
  transform: scale(1.05) translateY(4px);
}

/* Επιπλέον 20% μείωση ΜΟΝΟ στα κινητά */
@media (max-width: 767px) {
  #hedgehog-eco-nature {
    width: 47.6px;
    height: 42px;
  }
}

  `; // Κλείνει το string του CSS

  // Έγχυση του CSS στο Head του εγγράφου
  const styleHead = document.createElement('style');
  styleHead.textContent = css;
  document.head.appendChild(styleHead);
})(); // Κλείνει η IIFE
const mythicData = {
    peristasi: { 
  title: "📍 Περίσταση - Η Βάση Μας!", 
  desc: "<b>Το Σχολείο μας!</b> Εδώ που χτυπάει η καρδιά της μάθησης. Ο δικός μας ιερός τόπος εξερεύνησης!<br><span style='color:#591c1c;'><b>📜 ΓΡΙΦΟΣ 1ος:</b></span> <i>«Ο πρώτος θησαυρός κρύβεται εκεί που οι αρχαίοι θεοί τυλίγονται στην ομίχλη... Ψάξε καλά πίσω από τις πιο ψηλές κορυφές!»</i>", 
  img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhSu8QA0AeV3HebnT1t0Zcd1LoqR36aNy3CKTc9BkYgMg7I75PnCWbHQ1wiRtbjkSxDJsFBDkbx50AatE71DlUZm6ySl90NS8hS081apqLjIkAQvxM5wx79i9Di9iA8ZOYKatx3VfF18uZKdipkQr4wuCtOPEWD6rX0gHmTkQY_mdZ1JyNLQ2nB7JLmF4/w640-h414/2026-06-30%2016_02_29-Android%20Device.png" 
},
skot: { title: "Μυστηριώδη Σκοτεινά🔦", desc: "Ένα κρυμμένο χωριό-φάντασμα στα Πιέρια Όρη! Περπατώντας ανάμεσα στα ερείπια των παλιών πέτρινων σπιτιών και την πυκνή φύση, νιώθεις σαν να μπαίνεις σε παραμύθι γεμάτο θρύλους και ιστορία.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiapbEAuUNgq4gIjE-guRk9O_0JMtVMpWhfFN9o6zbtesbfFlvkA0tqdR4jkcsoAJK7O_gtZPERGmGSQme8wC_XyH-RywrMXysUsPLC_kcOeLX_wdcbM-uThPfEzpiDA435Yad5zq2bqQgcXaNlNS2HtIgjFu3nJhqMX3Tnzjgb7K4b6YjipjwUngxO_HY/w640-h396/2026-07-01%2018_51_27-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
moni_makryrrachis: { 
  title: "Ιερά Μονή Θεοτόκου Μακρυρράχης ⛪", 
  desc: "Ιστορικό μοναστήρι που έχει συνδέσει το όνομά του με την τοπική παράδοση. Η παρουσία του στις πλαγιές των Πιερίων υπογραμμίζει τον διαχρονικό ρόλο που έπαιζε η περιοχή ως καταφύγιο και κέντρο πίστης για τον ελληνικό πληθυσμό.", 
  img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3ajjYh-S6Pb8im95Zxhwf1BDDfyoDGOOoLAQoIpm-4Na__8y8JUf7WD0PdipR89lv-GjA3syFSyNWK1oY9i5odhVhPoNHz0SHKGT1UZ0aK84E1lWMhum_gd06yUV4xay4IDvpGZ9Uy02_dLQY09Pu4AddJJxL7lwRu_oCUyaqiHrZBgj4yAddHqKtLAc/w640-h424/2026-06-30%2018_54_37-Android%20Device.png" 
},
    platamonas: { title: "Κάστρο Πλαταμώνα🏰", desc: "Ένα επιβλητικό σταυροφορικό φρούριο του 13ου αιώνα που δεσπόζει στρατηγικά στους πρόποδες του Ολύμπου. Χτισμένο πάνω σε λόφο, προσφέρει μαγευτική θέα στο Αιγαίο.",    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhwPEhUMu_gc1JKGhS5QrmjwWhwHgEhHD-NyjRekBejQIrDrMkzrJRhoKOTVGhi_en6TnCceov80yBTh8WR6ikXArXBBdqbfiFB1U2meHmPJ667gVLfm0SX-4SL1YBkFih3ioVEEiQj6CKw5ttEsfNeI_1UAjHraBGbDhrKAwu9164Sk-FKGxC1q7Tet0Q/w640-h376/2026-06-30%2016_05_39-Android%20Device.png" },
kolindros: { title: "Ιστορικός Κολινδρός 🏘️", desc: "Σημαντικό κέντρο του Ελληνισμού στα χρόνια της Τουρκοκρατίας και πρωταγωνιστής στους αγώνες για την απελευθέρωση της Μακεδονίας. Τα πετρόχτιστα αρχοντικά του μαρτυρούν τον πλούτο και το ένδοξο παρελθόν του.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKVJtPMyhHNlIrbropauNj9NK6yDFxC-V6oG_Ob0Acu-6H4MHga7PYjs85UsxVgkP3isri_4ZaqVz-i9EucXgjvQ4czA6fI2yZDY1o6GXmwKXYDt9GmEC8SlhCZpIA0JqytostbMyu3bUaeTU4iowtB0AsKGnCeFzCG3BqER5g-x_D7YdjcTSH9FI4GTk/w640-h532/2026-06-30%2016_10_38-kwdikes%20-%20%CE%95%CE%BE%CE%B5%CF%81%CE%B5%CF%8D%CE%BD%CE%B7%CF%83%CE%B7%20%CE%B1%CF%81%CF%87%CE%B5%CE%AF%CF%89%CE%BD.png" },
korinos_tombs: { title: "Μακεδονικοί Τάφοι Κορινού🏺", desc: "Εντυπωσιακά ταφικά μνημεία του 4ου αιώνα π.Χ. που μας ταξιδεύουν στην εποχή των αρχαίων Μακεδόνων βασιλιάδων. Μια αληθινή μηχανή του χρόνου!", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEinDZxZS5g5Nf-cmEyudZb-uSTwZegYoJoUa-h8MvnKuYm7XFFbvVdqPN8VfCfdcNIv7XlCj191LySgFwEg8lKzIyK4JrqQUhs8yCtNQ9vmcCzwAQDcNBD4lFyV9PzXMPGlk3U5k31PR0qIuN3tBPY1YpNB_oG1jexLBu49P3wzVq07Z0AnfTelCDIVZ-Q/s615/2026-06-30%2016_12_35-Android%20Device.png" },
    pydna: { title: "Αρχαία Πύδνα 🏺", desc: "Εδώ γράφτηκε τεράστιο κεφάλαιο ιστορίας, καθώς η μάχη του 168 π.Χ. σήμανε την πτώση της Μακεδονίας στους Ρωμαίους. Σήμερα σώζονται βυζαντινά ερείπια.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiDtGd8o7_revGOl7l7Y2-wPNNkay6ZZcWeqQ18zBX4M-oWkEPtJ4QPeWqzylU0arYPrkvdMHU93hGBqoBM1fBGHb0waXmArWbnqd1q4omLvoqLHajeX6nREdSAX2DM9sUxrhd_p-yaR9UdU0RXaz6qJOpJ0JkXqxhO6-0hOHwMqzJEp8sY7H6EjlB3K_g/w640-h470/2026-06-30%2016_13_57-Android%20Device.png" },
    leivithra: { title: "Αρχαιολογικός Χώρος Λειβήθρων🎶", desc: "Αρχαία πόλη στενά συνδεδεμένη με τον μυθικό Ορφέα και τις μούσες. Προσφέρει στον ταξιδιώτη σπουδαία αρχαιολογικά κατάλοιπα στους πρόποδες του Ολύμπου.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhyXu9HYTSskMZYn1EWS_4-58_q0Rmdgkc-eMToIG5gWeNbsPQyumrqZmbNmVzQi5BgQsHUvIVamkHcat19zmlLw7_r44aIrV57EIEs6P7GEGuMM-aqVBHaEju3dp63DVrGysKMsukgqfuuoy5Zca6Yxr_VOYZKflF5f_vrX4jlW_qqIbx1ZJkl4wS9e6Q/s1649/2026-06-30%2016_17_17-Android%20Device.png" },
    
    monastery: { title: "Μονή Αγ. Διονυσίου εν Ολύμπω⛪", desc: "Ιστορικό και επιβλητικό μοναστήρι του 16ου αιώνα, φωλιασμένο στο εντυπωσιακό φαράγγι του Ενιπέα. Παραμένει ένας ιερός τόπος πνευματικής σημασίας.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXBKcu2xaBgGh2KPJ7xUGgzRsPErOvV-JPDwsyiR1Ze1cvHIH5SrkK7rLPDpFWd54jg8IaIB5wIJIA7hpabo_eAQxwc33X5we5QGSlSIwZHkXPgOumzDvkwMkhCVGSSCfM-XvD7ob6b-LXjUawK3EepfPXS1wBbQvvl_Glj2HtGdHh3g2Tn16pRYk6bx8/w640-h416/2026-06-30%2016_41_56-EON%20TV.png" },
    kountouriotissa: { title: "Μονή Οσίου Εφραίμ & Παναγίας⛪", desc: "Η Μονή Οσίου Εφραίμ και ο βυζαντινός ναός της Παναγίας Θεοτόκου αποτελούν δύο θρησκευτικά μνημεία στην Κονταριώτισσα. Το μοναστήρι ξεχωρίζει για την αγιορειτική του αρχιτεκτονική, ενώ ο ναός της Παναγίας εντυπωσιάζει με την κατανυκτική ατμόσφαιρα.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEicx45xiGPn8RbdOQk727-em0UKndqjum7zP7yTYB7GaGQa61k78KY8rwEIyV0cBAZNN3pgIdG4fjc67qB3Ifqn5CKFPMtO1JZbiIRYy1-Q7AHb1LslWsYsDtvhzwDDBzgTc2HDhqAV8smG9spaVa5OYwyMNW6bW1MLggMZVcpegFWWedwhKk_EUhwyxLY/w640-h408/2026-06-30%2016_43_41-Android%20Device.png" },
dion_museum: { title: "Αρχαίο Δίον🏺", desc: "Στο Δίον, την ιερή πόλη των Μακεδόνων, το Αρχαιολογικό Πάρκο και το ελληνιστικό θέατρο ενώνονται αρμονικά με το Μουσείο, όπου δεσπόζουν ανεκτίμητοι θησαυροί, όπως η περίφημη αρχαία ύδραυλις, το αρχαιότερο πληκτροφόρο όργανο.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjnHD9sB6QuhAKcvVSKTzcYXKyWwNgmT-6504WkydaZdpgai8PpejwtGd5QpS873v0f7xEACzqwYk2gZZOWhkfMDhdQ4812Wg8I8t4H6sUHiYvuEBMRd_X11fqevb44hjvGvpSv3f2GkRcNdeKXLn6NeTKIl_PqItkMBBkokVkq16rX4qS0VmA-zTduTJA/w640-h410/2026-06-30%2016_45_15-Android%20Device.png" },
    olympus_center: { title: "Κέντρο Ολύμπου και Ναυτική Παράδοση⛰️", desc: "Στο Λιτόχωρο, το βουνό συνυπάρχει με τη ναυτική ιστορία. Το Κέντρο Δρυμού Ολύμπου αναδεικνύει την βιοποικιλότητα μέσα από τρισδιάστατες προβολές και το Ναυτικό Μουσείο αφηγείται τη σχέση των κατοίκων με τη θάλασσα.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhdzE8hJJRpndwER3Y3t2_QYeAkt2no58rLHeE1NjIIWGZkIK_8r6g5rej4oJF20xqbxg0HiSOJruSWIST8ekE0B366xcx0JiCRs19CyJZHFdzkx77ZGAlDLm-IhG3HT10g1oGgYcJjTdt4dSFmS_MR5WPHQUNuG_o4kholkVsJPj2m3gVCWTral37ijiA/w640-h378/2026-06-30%2016_49_45-Android%20Device.png" },
    olympus: { title: "Εθνικός Δρυμός Ολύμπου🏔️", desc: "Το μυθικό βουνό των δώδεκα θεών. Με την ψηλότερη κορυφή, σπάνια χλωρίδα και πλούσια πανίδα, προσελκύει χιλιάδες ορειβάτες παγκοσμίως.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNeyVkBIsDJs0On_PzqTbaDQYMMsjQ_OsButzrheerUom30edZhMuXQx540ZSY6wTFj6h-1p-HQtWH4sMqly5G6RQriVACeuy-R5SOudFx6n7h6LBMQ6BE-lrjm7fqW3uxeBZwZepJU1v-wOWayhq06pTWgFGhrWe_t0djyRrsFQ5VDXO0yH3bQjrlsOU/w640-h420/2026-06-30%2016_49_19-Android%20Device.png" },
    alyki: { title: "Υδροβιότοπος Αλυκής Κίτρους🦩", desc: "Μια σπάνια λιμνοθάλασσα και πολύτιμος οικολογικός παράδεισος. Αποτελεί καταφύγιο για τα ροζ φλαμίνγκο και εκατοντάδες άλλα πουλιά.Εκεί παράγεται «ο λευκός χρυσός», το αλάτι που συλλέγεται είναι εξαιρετικής ποιότητας", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEij8lMjSU7lUma2uzroNR74NevHqbUOph4YbDdujFH309sTjDns8VPZE45rbPaaCniXuynBhsInYtu63WoJPznI6gc_h-mK3HCz26xqY5tBXhyn-uouPT3o6JgAj-PbFCZ43Ioo6bgYQGkAauyHK1ioDIafRKwwubV9T5n8CXsRUryLzb2ljOCrw9SR7hc/w640-h412/2026-06-30%2016_53_19-Android%20Device.png" },
    enipeas: { title: "Φαράγγι του Ενιπέα🌊", desc: "Μαγευτική διαδρομή πεζοπορίας στις καταπράσινες πλαγιές του Ολύμπου, γεμάτη ξύλινες γέφυρες, εντυπωσιακές φυσικές βάθρες και πυκνή βλάστηση.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhVAwrgGUdYslzA01rCiNo6PHzYtSEUaOz9sqXk7z2D60cFmLf6z9ox9T3aEFrRRTsQtsp8a3BOk1IbRaX_emA0ti9Fqx9wVD4OMe7e_kUZZ1PbFB7VTXLNO7OtL6PDU4cg3cVdrw_N5XfiNBllRyJS9nFpzz4BPuAtTPl6d3GmNdsvCVXF0MBPOfy36cs/w542-h640/2026-06-30%2016_58_04-Android%20Device.png" },
    orlias: { title: "Καταρράκτες του Ορλιά 💦", desc: "Ένα κρυμμένο μυστικό της Πιερίας. Τα ορμητικά νερά σχηματίζουν φυσικές, σμαραγδένιες πισίνες, ιδανικές για δροσερές καλοκαιρινές βουτιές.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUqRRRK6qYJVgopSJx32T6K4_1hKv_FCpR9qdscSmMkOhkOuuYTyDWmZO3if1vjjw-Qy89xMf3iQN9vHJ_kWQfmIJeRPBuOFUd_tTe_btmnAF-ORoWV7QwwXHvX69dE-dM-n1NA6U1mj6k-UvnMSplr97ND2wWTNRUx1Fc5wrwTs6DIC6W8JkBEDx6NzY/w640-h490/2026-06-30%2016_59_43-Android%20Device.png" },
    agia_triada: { title: "Ρέμα Αγίας Τριάδας🌲", desc: "Κοντά στη γραφική Βροντού, η πανέμορφη ορεινή τοποθεσία μαγεύει τους περιπατητές. Μικροί καταρράκτες, παραδοσιακά γεφυράκια και πυκνή βλάστηση.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjyC48eGSwc_vUHzpc9JTZkp6FtosstjjUOCGaPXBXOFbqfBA61XzZYX6yHBzTrRsNrMpeHuCU5VXmXv4O3K3vElhWIjijc9HNiAe-4YxSzfeQBeLMIuJpODN2qOJlA5i-Wr8YXQ2NuCU7Vi9ndEKe-J97Y8GCMNMWPrmlQR7EldXflaysg7TkaTh3WR9Y/w640-h364/2026-06-30%2017_01_31-Android%20Device.png" },
    poroi: { title: "Παλαιός Παντελεήμονας 🍂", desc: "Ο Παλαιός Παντελεήμονας αναγεννήθηκε τη δεκαετία του 1980 και μετατράπηκε σε έναν από τους πιο δημοφιλείς παραδοσιακούς οικισμούς της Ελλάδας, κρυμμένος στα δάση του Κάτω Ολύμπου.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjCQbwN2fc3sHXq8snaHAnQBtAo1yicB7T0If5cT6modOVSfDVcgpgZJ88feVjpLo8EnMFG_i4yxrIoL5FqJaN8qTUqH8s3atZkJNF10cs2PmI8RGVlfX_4AIByB5Jj6T-RwYoLrdudmf3cItP5IV1klqg3Jb9RytfkQ73dkgSvNk5v_raIjsaF4T2cZxg/w520-h640/2026-06-30%2020_57_34-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    elatochori: { title: "Ελατοχώρι & Χιονοδρομικό ⛷️", desc: "Ο πιο γνωστός χειμερινός προορισμός της περιοχής. Το χιονοδρομικό κέντρο προσφέρει σύγχρονες εγκαταστάσεις, ενώ το διπλανό χωριό εξαιρετικούς ξενώνες.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAGhI1UW6aT9PBsHvV9g3s3w1oBqtCGw8B2Yw9ZCgO5am1PiIftpPVtZXEVxQijSD6roxptvH1ktjPGNAfuOt_8LYOkm32gGwHNrV1f7ZyAupfgsKln7Sd0vxxm54OAwcfnZtvfyhI-kJZ5UAXrG980sfIZpFkiBy2181m8ky-gkiAU1kqovjCdAwE8aY/w640-h384/2026-06-30%2017_05_54-Android%20Device.png" },
methoni: { title: "Αρχαία Μεθώνη 📜", desc: "Σημαντικό αρχαίο λιμάνι και σπουδαία αποικία. Ήξερες ότι εδώ βρέθηκε ένα από τα αρχαιότερα δείγματα ελληνικής γραφής; Ένα πραγματικό μάθημα ιστορίας!", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKYfrgBdlcho8ebyUdkigZtrE4tskghhyERVnk31DhmtNi5bF4aiFIqoGB_YC-2WKVHMnWoAQGpnCuRoQcimE6Ejz55tvVafzEzEnhXWAkp5ZzXgaX6x5CzZFsRWOLgfg8xp91jTFOUgYy5yGRbxLqYju3mYgoCz_2uxpgs4Vli0zLsauIxxxcVXRuLEs/w534-h640/2026-06-30%2017_07_47-Android%20Device.png" },
platanodasos: { 
  title: "Πλατανόδασος Νεοκαισάρειας 🌳", 
  desc: "Μια καταπράσινη όαση στις όχθες του ποταμού Μαυρονέρι. Με τα αιωνόβια πλατάνια να προσφέρουν πλούσια σκιά και το κελάρυσμα των νερών να δημιουργεί μια γαλήνια ατμόσφαιρα.", 
  img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0R3mFFPGGJEQYf0l89BD2YGxAKszT0XtXgwsPBXcYH6_HIoL0qwimClwbKbWM2r8tlU8vDukW10hvUkISWpF3vlNN6LJLU69pqd_6-rlpWXMDDUs323WUzPlDUZtzgjR_sIKvDLesIsVv8uhUc-FXrJBNZOwIn2C2Z0Z1nsP86DoodzoOlwoiqWq0lwI/w640-h470/2026-06-30%2018_44_13-Android%20Device.png" 
},
    katerini_park: { title: "Πάρκο Κατερίνης☀️", desc: "Τεράστιος καταπράσινος πνεύμονας δροσιάς στην καρδιά της πόλης. Με ψηλά δέντρα, τεχνητές λίμνες και προσεγμένα σκιερά μονοπάτια.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjrGaYwYftc2flI1GrTXXtgBakKzr15uJPnDhhSOnUwUZHdJ-9ZhXuS0vTMreu5c1kyzHFZ0jgGCzkEtE9L9dre8GMZTdreZYRqlFNBa63pfjXPOnU-4r0OkZYV-hA2iUDZ5PMCydBrLoAvykCIgq_-EjMm6fG0k1WSXhtOGd4oD5stvw9R70AhP9iiJFs/w640-h406/2026-06-30%2017_08_47-Android%20Device.png" },
    olympiaki_akti: { title: "Παραλία Ολυμπιακής Ακτής 🏖️", desc: "Τεράστια, φωτεινή αμμώδης ακτογραμμή. Οργανωμένη με δεκάδες τουριστικές υποδομές, αποτελεί το κορυφαίο και ασφαλές καλοκαιρινό θέρετρο.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5L1DirmgkiB-usKfaFQ3_4S-BMgUpKka4iVInG_H_QUrh6ne0XUhyMyrUl-0NBeByHi0AK9slHGJlErVtV1UdnrXO_53tC4An1yuQj1PensV34GBrlaSPGWRyaID6e6EeiWQvl6OB7Y2JSG7KEA0xeCS2OZ5g8v4QFGM0Up7LTzzvp3yPF-arUJRD8XU/w640-h336/2026-07-01%2016_23_59-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
mythic_pieriades: { 
    title: "Οι 9 Πιερίδες Κόρες 🦅", 
    desc: "Κάποτε, 9 πριγκίπισσες προκάλεσαν τις Μούσες σε διαγωνισμό τραγουδιού. Ηττήθηκαν και μεταμορφώθηκαν σε φλύαρες κίσσες! Άκουσες κανένα πουλί να σου μιλάει ανάμεσα στα έλατα;", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfmsEbCVx7kX7Ngk3GU2wQs8HBY4ZTmDNxUojcUSaH0k6KEcF-FqM6i4aLfskVDlIDSpnLKJssSjBc6wFRseb8bhYgzqxmJcUlDEjhSQ8eNTVwNMHKOavRj6WDitV36-x42q2xdo0z4yxk05-Rw3Hfaz5dy9PNaBewP3Q_bzxSrn5yPRKWZZ8DfFUvxEA/w640-h350/Gemini_Generated_Image_s9nfsss9nfsss9nf.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783174219/jos_pursuit-magpie-singing-before-being-chased-away-by-a-currawong-259192_lnxsr1.mp3" 
  },
  mythic_orpheus: { 
    title: "Ο Τάφος του Ορφέα 🎶", 
    desc: "Εδώ στα Λείβηθρα αναπαύεται ο μεγαλύτερος μουσικός της αρχαιότητας. Λένε πως τα αηδόνια σε αυτόν τον τόπο κελαηδούν πιο γλυκά από οπουδήποτε αλλού στον κόσμο...", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCNza0BQWEDPQHRwk1LVss_2lhyn7fRAbiFeCSPWp9JR8VvJqXNQsuTY6SfrrQ3gX6xtxnVtu74y0QWKfgxt1Tt5Ps14iZ16mWapr0m7ZUT6AUUD6Lfxycc2kgI3th0mCNTK3qApKG9erQ0ni6cjHAeXNwel2cW-LRm-h3_OxCMu2YXVaaxMSJYe1FD8Y/w640-h350/Gemini_Generated_Image_x3uwktx3uwktx3uw.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783174072/freesound_community-harp-flourish-6251_w6drgg.mp3" 
  },
  mythic_helikon: { 
    title: "Ο Ποταμός που Κρύφτηκε 💦", 
    desc: "Όταν οι Μαινάδες έψαξαν να πλύνουν τα χέρια τους, ο ποταμός Ελικώνας τρόμαξε τόσο που «βούτηξε» στα έγκατα της γης για να κρυφτεί, βγαίνοντας ξανά χιλιόμετρα μακριά, στο Δίον!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjSKyDnjTLiksGOayf3pGAkX7nZjZftQ8K19sTGdvwQ9dEwuEIxIjXa-WY0SkmkooebKjVtYq2SMBFMlbTZsvoZOIK6kSOf3Vqdih10fVyMM8TSPZeDDzlMB05j-_o98GvZ05B_7jYfSDJSGwrfFU8zcFCHM_Ma_xVMebEYJPn0PsAClixG6uLQ-Uxt-XA/w640-h350/Gemini_Generated_Image_y1kerwy1kerwy1ke.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175418/mix_04s_audio-joiner.com_1_sulpna.mp3" 
  },
  mythic_enipeas: { 
    title: "Ο Θεός Ενιπέας 🔱", 
    desc: "Ο πιο όμορφος ποτάμιος θεός. Ο Ποσειδώνας ζήλεψε την ομορφιά του και πήρε τη μορφή του για να κλέψει την καρδιά μιας πανέμορφης θνητής στα νερά του φαραγγιού.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhW0Oyx7sP-ijXbKnjxxuGuQbLfRsTXv2q6bt9oOl0QmVDsYZRnaxTB_HYCAsZ24hrf8_vQhlDtno0li7JZMYD9wX3Gv9ytsxrpjAkttrv_v9hZnIVBYyQWNDUzJ9BuHpJSVWKm7dN4LEabAACrA7dX1_ItwtdtOfHpo-seP-w9Esff_NMSqHrdt4nfJPY/w640-h350/Gemini_Generated_Image_lvscgelvscgelvsc.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175418/mix_04s_audio-joiner.com_1_sulpna.mp3" 
  },
  mythic_isis: { 
    title: "Το Ιερό της Ίσιδας 🪷", 
    desc: "Μια θεά από τη μακρινή Αίγυπτο ταξίδεψε ως την Πιερία! Το μυστικό ιερό της βρέθηκε βυθισμένο μέσα στα νερά και τη λάσπη του ποταμού στο αρχαίο Δίον.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgh6ea6nrAQW4YG9fFUnqR1RdTspLyJizPpNNUwd9I-CRTuqExrid0DAh2kOUe43XFdj0U5WxoBuuq5Q-ztDT5ktOHvglAqipMGrLo2jErqtcGj1S_LKV1yILJ__oYLrRHuVJ0R5D7Q_qrVKFii3i_ksEyamsvUAbV45gkNvRLiprTdjWic6Tfs0_DnDlg/w640-h350/Gemini_Generated_Image_6lhrba6lhrba6lhr.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175817/mix_05s_audio-joiner.com_gdsgdc.mp3" 
  },
  mythic_zeus: { 
    title: "Ο Θρόνος του Δία ⚡", 
    desc: "Στο ψηλότερο σημείο, το «Στεφάνι», καθόταν ο αρχηγός των θεών και έριχνε τους κεραυνούς του. Ακόμα και σήμερα, οι καταιγίδες εδώ είναι τρομακτικές!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2Sn3zeE_n-7XycM3CRfXtLtoy3HiBeEdWC-Frzl9qQcCMG74a6WXZZ1U9EwrrVqFje5IIDakrdUA32EXeJqQcncHkedXlMbTYB3p-HhQr3bhnVcrqVl4ShrD4hKbHtNXgqUvRYtY9qrbea9g1AAwbTsQHSUs2NOOge1wB99q7QTzfLIWI6E3M-SxQngM/w640-h350/Gemini_Generated_Image_3yxw9o3yxw9o3yxw.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171940/u_q2hb2391vb-thunder-clap-521194_mnspb7.mp3"  
  },
mythic_muses: { 
    title: "Η Γέννηση των Μουσών 🎵", 
    desc: "Στις σκιερές πλαγιές των Πιερίων Ορέων, η Μνημοσύνη γέννησε τις 9 Μούσες. Από εδώ, οι προστάτιδες των τεχνών ξεκινούσαν για να γεμίσουν με τις μελωδίες τους τον Όλυμπο!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjZl_mD67_ctQIBrX6GakEyylDUG51sCwLKTlfwSk20syzA1LohHqr75pwRG6ZGI77jiYs1NYJNuZ73eaclxtKdWIBUIsnXZ1k8Kmu81aB5eQLG2HJbzJkLwpdUrizl7et7Rg5huXRbBuo_Q1uEX2UZiIw2TBnkxgzpJg72fEPXOT-6M05-eqBMOgIUtGU/w640-h350/Gemini_Generated_Image_qcwj5cqcwj5cqcwj.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175981/universfield-magic-spell-278824_ngpnux.mp3" 
  },
  mythic_heracles: { 
    title: "Το Αρχαίο Ηράκλειο 🦁", 
    desc: "Κάτω από το σημερινό Κάστρο του Πλαταμώνα βρισκόταν μια αρχαία πόλη αφιερωμένη στον Ηρακλή! Ο μύθος λέει πως ο δυνατότερος των ηρώων προστάτευε αυτό το πέρασμα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitIedoNSgqKtXUvAPJS1rSNqL0gPEjpyATgUPHJGObuZzNQ4iqqV2unByGCsYs2IKcjQOVmvEN2Ho1eaR__sXXD3PmHgnrGJEIfeyfVY4oGCgV_XVf_x3IBiFf1aVnZ9bn0iE3UGrR3GqVS3rO7blG5LFawcZUs22-UP4c1IVXpi1Z6r2WtZMK3EE_OiQ/w640-h350/Gemini_Generated_Image_kg8lfukg8lfukg8l.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783173917/daviddumaisaudio-sword-slash-with-metal-shield-impact-185433_fzvi95.mp3" 
  },
  mythic_asklepios: { 
    title: "Τα Όνειρα του Ασκληπιού 🐍", 
    desc: "Στο ιερό του Ασκληπιού στο Δίον, οι άρρωστοι κοιμούνταν μέσα στον ναό («εγκοίμησις»). Πίστευαν πως ο θεός της ιατρικής θα τους επισκεφτεί στο όνειρό τους για να τους γιατρέψει!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj6qNpcD1FzZg3R1csbn6gcTqHYQEzXGJ6SgYa5r6vNbk_qzmyNA1GKqUO8tWTCYBoJhYOxv8SZojbX8j2n_qIB9F4qsiuXULmF_rSWYLwlvEjjPhGIXo31p3vR06dKce6D4x4ruXtmhlWX9Ysl02oITljLkbixerEwtNR4rbdDPTPu4BrjPKPCwXg941M/w640-h350/Gemini_Generated_Image_lkdga0lkdga0lkdg.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783174818/freesound_community-wind-chimes-37762_wvnzf0.mp3"  
  },
  mythic_hades: { 
    title: "Πύλες για τον Άδη 🏛️", 
    desc: "Οι εντυπωσιακοί, σκοτεινοί Μακεδονικοί τάφοι (όπως στον Κορινό) θεωρούνταν από τους αρχαίους ως το κατώφλι για το βασίλειο του Κάτω Κόσμου και της Περσεφόνης.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjTGagLFh5-CE4K4Tr8LGf6qrm0euHuj4qVSusobl2Vn1QyJcheZvNwdjhVtcGj09Am3av7Ue-Xs6-QTrGqHcHrJUlXDapJJ-IIxAa31mfgNiQtWVaDoMKGvY18L8bN67TTK3656mYYdJWcAW3SqHXaS3Ab9v9IxYYKZU2mKvbTgBVnHVvIGeEXEfCmth0/w640-h350/Gemini_Generated_Image_jl987zjl987zjl98.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783173728/freesound_community-stones-falling-6375_nxtfhg.mp3"  
  },
  mythic_demeter: { 
    title: "Το Δάκρυ της Δήμητρας 🌾", 
    desc: "Ένα από τα παλαιότερα ιερά του Δίου ανήκε στη θεά Δήμητρα. Οι αρχαίοι της άφηναν προσφορές για να έχουν καλή σοδειά, ελπίζοντας να ξεχάσει τη λύπη της για την κόρη της.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7Jf3okrs0pztRr2J5FszPXQgTraGdii7seLA5CN4ReoqHZd4Ox01CgfJxEX6XoyMKmqEOxxHIUaphopXaf8sd-Iv4SJZ8Cmf8sY3laTA46vxTEnarmBeVkawYez2SkSeeFRHws2lCS19OrHMM7h1aVXkmNuLbwpKwjlsFrKxVL9B7H4NKI45CXxOsrtg/w640-h350/Gemini_Generated_Image_xtizrjxtizrjxtiz.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175020/mix_10s_audio-joiner.com_flxnej.mp3" 
  },
mythic_pydna_fate: { 
    title: "Το Πεδίο της Μοίρας ⚔️", 
    desc: "Εδώ η γη σείστηκε από τα βήματα των λεγεώνων. Λένε πως η Πύδνα είναι ο τόπος όπου η μοίρα της Μακεδονίας άλλαξε για πάντα σε μια νύχτα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgS2L4YdQ1ipcfVhZqv3Qxtobw8ZAwbgSoPWZJgCzWnHrCS3RZkXdghoJPvg1VA1ElVCBZyIRLXI_x357N9xHFlPON9Tp7KqYHd1IF5ShZm-jljYoPfRs90voZmuc8pn8OkgxVPNv-H3PAkvo2J8_O0D1icN-W0NmbU5Sc9Io459OUqWzBVqTXV5-SnmzM/w640-h358/Gemini_Generated_Image_8ru2u08ru2u08ru2.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783176093/freesound_community-war-drum-loop-103870_yirtm1.mp3"  
  },
mythic_methoni_alphabet: { title: "Το Δώρο των Γραμμάτων ✍️", desc: "Στη Μεθώνη βρέθηκαν τα αρχαιότερα δείγματα γραφής. Ήταν δώρο των Θεών για να μην ξεχάσουμε ποτέ την ιστορία μας", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgaYA4WQ_fMIDhb-ziFo3X_cnwzc8RzaOmklpyYbBsC01NjU3qyAnGPWEoLP3MpY3ZARfvAawzkHHYGJ8Tr0JZSIuhyphenhyphengfqJzbUtZEK-PbJXiHgPVFz_ltjQ253I43gcMf-4dvJhXMRwEVC3t2RqqkRs2ropR2I9KcU2i1I5BuV8PQKmKyJtTZxdcJJ0QXU/w640-h350/Gemini_Generated_Image_g2fe3wg2fe3wg2fe.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175137/mix_04s_audio-joiner.com_zg0rwz.mp3" },
  mythic_posidon_salt: { title: "Ο Λευκός Χρυσός του Ποσειδώνα 🧂", desc: "Το αλάτι της Αλυκής ήταν ιερό. Πίστευαν πως ο Ποσειδώνας το χάρισε στην περιοχή για να προστατεύει τα σπίτια από το κακό.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNn_d-cPO_KOcwC_v9CZ2VMi8LYg1NY5CzDCq_9aBwCp4xqbDEgZ34ujgk-Bmh2z9ke0XWrPsN1q8E1xJmNjdN8lEYDY-W5zCBMW4oab3VEt7weAztcCgPRSfZa4EpCetgeNZTsVUiJXo63MoDmdDYrkuSc7fTlGSM7mMJ09EVAHx77ffaSmD6xo-LIs8/w640-h350/Gemini_Generated_Image_wbd4w8wbd4w8wbd4.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783176598/mix_10s_audio-joiner.com_1_hnkn2i.mp3" },
  mythic_aeolus: { title: "Οι Άνεμοι του Κολινδρού 🌬️", desc: "Εδώ ο Αίολος είχε ένα από τα περάσματά του. Οι κάτοικοι έφτιαχναν φυλαχτά για να τιθασεύουν τους ανέμους.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEigVE88i3D7Ak5QEMO-WH9ECmjBlGSGFxmCVGKDgBqg2RZSWHkQaBeTtm8jLFBagqDh6_WsyJnYLiG9ci94b7jao8R3KBqr0ABwngbZ8SB_oMHmBGnrZSK_k_WwJT62-JrmP_K9-cCkjz2z2fPWqWvQTk_oDpfcr_WHvdTwR9VPwmhYuEsePXU3PjUw1J4/w640-h350/Gemini_Generated_Image_s359mls359mls359.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783172069/dragon-studio-wind-gust-386158_kxtpiq.mp3" },
  mythic_cheiron: { title: "Το Σπήλαιο του Χείρωνα 🐴", desc: "Ο σοφότερος Κένταυρος δίδασκε εδώ ιατρική. Ίσως τα ίχνη του να είναι ακόμα κρυμμένα στα βαθιά των φαραγγιών.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh46grTG3tqJrqTQKeXrUnPqYyUwAquOZ8-QBrPF962lDt_4Ter9t4jUzdaVB5iywmoRnql1lrkCmt96oaoTBJecHdm1ynWcEBUW2UYmVTXtcWVWuYEzgMODimmDL9se-bzN9cJ5MtkRzlCTOikjv-FOb0uBKtyYzQ42-XIJp-cJwtRj-Es1xTpC5aeuao/w640-h358/Gemini_Generated_Image_wa9n4owa9n4owa9n.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175252/universfield-horse-123782_hmq245.mp3" },
mythic_typhon: { 
    title: "Ο Τρομερός Τυφωέας 🌋", 
    desc: "Το πιο τρομακτικό τέρας της μυθολογίας! Είχε εκατό κεφάλια δράκου και προσπάθησε να γκρεμίσει τον Όλυμπο. Ο Δίας τον πολέμησε ρίχνοντας αμέτρητους κεραυνούς που έκαναν τα βουνά της Πιερίας να τρέμουν!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDxnbAmjv2LbsoBMtx4mIuQcukNLDuqBYLx-hAHtE7EP8aTCY6Q81rKTlKgOHvWqiuGnRc0rLY2YNv_lLzHdCrMbHxVJurlydoptkRAE9HsfZhI0TeIkXzsOOcZK2eFuHswuLX-A737Uyk_YrYhq9CKgHxHg0L2bz9ggvmuOgEVeReMsJzV2XjqMxPVZk/w640-h350/Gemini_Generated_Image_bvpxjabvpxjabvpx.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171325/dragon-studio-monster-growl-376892_posw7h.mp3"
  },
  mythic_aloadae: { 
    title: "Οι Αλωάδες Γίγαντες 🪨", 
    desc: "Ο Ώτος και ο Εφιάλτης ήταν δύο τεράστια αδέρφια που μεγάλωναν ασταμάτητα. Θέλησαν να βάλουν τα βουνά το ένα πάνω στο άλλο για να φτάσουν τον ουρανό και να πολεμήσουν τους θεούς!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiR0Sz1mdejenD3_5CeC6zPufu4C2JXlS7DVggJvfrKikA6Rm-JKScmF7r3G8Ch3bcFI6V2D13b7EvsOGmtXP3bL5NLlha3urIxcuHd9PwdYvQOUupqZjc8CCflBEJPQRu2yu5gYAtnuMCAu8lPDZDhMC72RMz6bnMgvpDQcjhOY_4hS0M8-5Yc13KUYpU/w640-h350/Gemini_Generated_Image_niv039niv039niv0.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171793/dragon-studio-colossal-footsteps-467495_aslmo5.mp3"  
  },
  mythic_lions: { 
    title: "Οι Λέοντες του Βορρά 🦁", 
    desc: "Δεν είναι μόνο μύθος! Στην αρχαιότητα, τα πυκνά δάση της Μακεδονίας ήταν γεμάτα από τεράστια, άγρια λιοντάρια. Ακόμα και ο στρατός του Ξέρξη τρόμαξε όταν του επιτέθηκαν τη νύχτα!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgX3MCN29GQY_VmE_SEN34oBdalwvXL5O_q9L547ifXB5x6kpl19EyNq-ifVDb1yHvtpclvxMyXJe1OJoZsQOGSN_yoWEtfDMWn1Q60HMEd2yp25-yAI65_aLAtvxaRLx614KXFVPfplNwyvoKp0PZkZOS0meRaoFN3S_s7Q-JqEX4g863gbnf40YRLkHA/w640-h350/Gemini_Generated_Image_urbdjourbdjourbd.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171473/soundzee-lion-snarl-growl-354324_y8izrp.mp3" 
  },
  mythic_cetus: { 
    title: "Το Κήτος του Ποσειδώνα 🐉", 
    desc: "Ένα γιγάντιο, δρακοντόμορφο τέρας της θάλασσας! Ο θεός Ποσειδώνας το έστειλε από τα βάθη του πελάγους για να τιμωρήσει τους ανθρώπους. Πρόσεχε όταν ταξιδεύεις με τη βάρκα σου στα ανοιχτά!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgaWqm5FBMJaQQjl9tI5yaYsjYg10ll-FbH7CgP9DS5Jrr86228s8hm65u_2eWwE8j93H-XTExMHzg0LAc2Mp_jHpEtMzn5KhedTknLq0TrksdGqsJmODAgFZxj_jAnNJyap1OWfhiaQHIxAbaKmCBck9kFBcxYy0NeYogTVrbUHdDt_g_oHLBdlqi19OU/w640-h358/Gemini_Generated_Image_gddlpigddlpigddl.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171210/dragon-studio-deep-sea-monster-roar-329857_fkjshx.mp3" 
  }, // --- ΟΙΚΟΛΟΓΙΚΟ LAYER ---
  eco_agriogido: { 
    title: "Αγριόγιδο του Ολύμπου 🐐", 
    desc: "Ο ακροβάτης του βουνού! Έχει ειδικές οπλές που δεν γλιστράνε, επιτρέποντάς του να τρέχει σε γκρεμούς που ζαλίζουν. Τον χειμώνα τα αρσενικά κάνουν τρομερές μάχες!", 
    img: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Rupicapra_rupicapra_balcanica%2C_Olympus.jpg", 
    sound: "" 
  },
  nature_deer: { 
    title: "Ζαρκάδι 🦌", 
    desc: "Ο κρυφός κάτοικος του δάσους. Τον χειμώνα το τρίχωμά του γίνεται γκρι για να κρύβεται, ενώ το καλοκαίρι παίρνει ένα φωτεινό κοκκινωπό χρώμα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhSmZDnn36Woq9AAbPTulQfqGHg5gsxHGJRj0-3AZmh1AJgSxr3THaZFBUexrztII0RCBsqJJWnsy_m8Pnk0yiej_u24a_TuZsUMQHbUedTtTVtx5pguITGVMAHjyjSWDGHywv6KrlDFupnmqKdz-nvC4gOtcf7GFxgHtyru0OREbgiK-4pE8CUXbpbvQE/s476/2026-07-04%2018_58_23-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_aetos: { 
    title: "Χρυσαετός 🦅", 
    desc: "Ο βασιλιάς των ουρανών. Έχει τόσο δυνατή όραση που μπορεί να εντοπίσει ένα μικρό ποντίκι από χιλιόμετρα μακριά ενώ πετάει πάνω από τα Πιέρια!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiI7xIbJyALe202DFxAfBnluqTW7xrFq4k9vaFv_l9svMvJTeO6vPHRR98PRxNGH9YEMRAjvENBXiS5m7qpa2HrlAO7_bgM6mIxhWa2dCsgDEAX84PdsySby8A3xPewXjQm3Rom_o9mfAQwMCD7vrUGEdcxmAV6YytwJu9meR3i9V7zfJK8-Izu2aDjWM/s320/2026-07-04%2018_59_34-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_giankea: { 
    title: "Γιάνκεα (Jankaea) 🌸", 
    desc: "Ένα λουλούδι-επιζών! Φυτρώνει μόνο στον Όλυμπο και πουθενά αλλού στον κόσμο, επιβιώνοντας στις σκιερές ρωγμές των βράχων από την Εποχή των Παγετώνων.", 
    img: "https://cdn.skai.gr/sites/default/files/styles/style_800x600/public/articles/2015m/jankaea-heldreichii.-2.jpg.webp", 
    sound: "" 
  },
  eco_dryokolaptis: { 
    title: "Μαύρος Δρυοκολάπτης 🐦", 
    desc: "Ο μαραγκός του δάσους. Χτυπάει το ράμφος του στους κορμούς μέχρι και 20 φορές το δευτερόλεπτο για να βρει έντομα κάτω από τον φλοιό.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQBaQf5hxUj7nHFN9HR6oao5JN0pzbn5OUw8CJ_uyqouQ-wQDrzGhKwEoWvJKta4wP1VsLxNTJepTyrLT7oEoC-f7xCKgW5lnpRjB0mwe7ZneRT651CHxV-OKIiJr6_YMKKQ7rdjHYyEwPSWUcAysLrDEyjaul1LK2TP18khohMCYDde03nWRYBb0fNVk/s546/2026-07-04%2019_00_50-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_salamandra: { 
    title: "Σαλαμάνδρα 🦎", 
    desc: "Μοιάζει με σαύρα, αλλά είναι αμφίβιο! Τα έντονα κιτρινόμαυρα χρώματά της προειδοποιούν τους εχθρούς της στο δάσος να μείνουν μακριά.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgxuR8Gxvu2dXl92lacaLzPsCFpPa5LDoWczTRruJktul18-hfjHfyYSpShA_MvWbM4tJsiDv0GCo02kIb380V0HMO-c_R5gzH_YlUyJFzJRES9Pbh4nNtYSCLsflNLuKMrfu2-snUj84dqq50cfQhfaYT_MVh77k4QUYon7ZdFhRMn07CuUqeTe-925yA/s320/2026-07-04%2019_01_39-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png", 
    sound: "" 
  },
  eco_tritonas: { 
    title: "Αλπικός Τρίτωνας 🐉", 
    desc: "Ένα μικρό «δρακάκι» του νερού που ζει σε ορεινές λιμνούλες. Την άνοιξη, η κοιλιά του παίρνει ένα εντυπωσιακό, έντονο πορτοκαλί χρώμα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjj1ZXD2D3xxajEaOwZ79ZJBw9yg2TL0AhgfI315DtyV0l9qEIYtEA5lMvMZUiVNu-a1VRWRoZBGr9yb-hHHSVoCYR8SL-Vew-NzG24UgpIu__lOyyZGsdz_7K59Emfn_InO9hqYO8M_yDhSZEptlIFDriL0RdWgaVxRrMn4zmg7Nn7LvrcZPdYjk_suz8/s320/2026-07-04%2019_02_46-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_pefki: { 
    title: "Μαύρη Πεύκη 🌲", 
    desc: "Το δέντρο με τη σκληρή καρδιά. Το ξύλο της είναι τόσο ανθεκτικό που στα αρχαία χρόνια το χρησιμοποιούσαν για να φτιάχνουν γερά καράβια.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjjhYz1Kx3DuuHyzAgOD39d6ZIp-oXPGMe2X1P3teBFOgQJkz2ejXGzPR0jpRwE52dpjQMEPYJhQgBEgn_0xaZnF1sr0MdZrkO5SH04izMLJvgpgjRbLmspz98IviK1qlw48jPOqAUno1rOe1EXoKQq1J5KlzdsvYljXwXpQkL2uP78np9r4CgOY3TI35c/s320/2026-07-04%2019_04_10-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_rompolo: { 
    title: "Ρόμπολο (Λευκόδερμη Πεύκη) ❄️", 
    desc: "Ο γίγαντας των πάγων. Είναι ένα είδος πεύκου που αντέχει σε τρομερό κρύο και οι ρίζες του σπάνε τους βράχους για να βρουν χώμα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEisviHw-_pAQ1028UFbogV_aiQXTFZZBnwYxIYqeLkzaIDItjHnrmL6tlgl2x_gBKccLXdF9dLVwoCRZYh9t0zCYK0Foe7ySwWblx3uXRxbOt4qXbMh8-BqdEslMxxe0SW0XXp19H4dtp7Mra2eUChGsZHRn0UZM9rSdQqOJYhNIXf-sJWRdJtiO35wUyA/s320/2026-07-04%2019_05_11-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png", 
    sound: "" 
  },
  eco_alepou: { 
    title: "Κόκκινη Αλεπού 🦊", 
    desc: "Η πονηρή κυνηγός της περιοχής. Χρησιμοποιεί την παχιά και φουντωτή της ουρά σαν κουβέρτα για να ζεσταίνεται τις κρύες νύχτες στα βουνά.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjrZXP9zhb11jNEAErMgmHWgq7i5uqBdElhPv9HhuCm_n_IfUV4YJrG3BKzw7G5OzWpbVC2hq6oaA2xYfu0S82zRJ9UI545suMLuj03xvifVZWFYz9HbLln22lcO5bbZnjnsfkLnhVgyPYWNmP1r2_9f37BrYonIpm5GsHg-zHZZvIxv79IczWbCsKskm0/w640-h480/2026-07-04%2019_05_49-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_flamingo: { 
    title: "Ροζ Φλαμίνγκο 🦩", 
    desc: "Γεννιούνται γκρι! Το υπέροχο ροζ χρώμα τους στην Αλυκή Κίτρους το παίρνουν επειδή τρώνε ασταμάτητα μικροσκοπικές κόκκινες γαρίδες του αλμυρού νερού.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9pwpP7A5hum__FG5jopnUj5N6K5DjzFWBelGb12eucmYr0FJ3N3xA4cu1flf1q2YGSGJTtxMwJVexsbH2TensysDOwtis0hH-EuFd-t1D6GR2ZUuCxk9SxxgXUzlCDG8X5hHgfOauNQg/s1600/Phoenic+roseus+%25287%2529.jpg", 
    sound: "" 
  },
  eco_pelekanos: { 
    title: "Αργυροπελεκάνος 🪽", 
    desc: "Το πουλί-γιγαντιαίο αεροπλάνο! Όταν ανοίγει τα φτερά του για να πετάξει πάνω από τον υγρότοπο, το άνοιγμά τους μπορεί να φτάσει σχεδόν τα 3 μέτρα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhDdBW81HQlC4yMgcs3AyOK1rKI8ssz8gHd0IdRO0jAD82yMo9fAZLiS7ppKaD8NEcafE3-Cj0bDxbsrBH6jnJe_Nqv0oucvnNcAuD0kr-bueJJhBaslwuJvqjkdVn8-yvTvcB3NIl9lzqiNBjMPTYK70s4lSs5hZAfuyoqwVknIFg2Z_F_Q6kvQbmsPJg/s320/2026-07-04%2019_08_31-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_avoketa: { 
    title: "Αβοκέτα 🪶", 
    desc: "Ξεχωρίζει αμέσως από το λεπτό ράμφος της που γυρίζει προς τα πάνω. Το «σκουπίζει» δεξιά-αριστερά στα ρηχά νερά για να πιάσει το φαγητό της.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhY8WPFOOX-j6aKaKQMvHKFXqubXyudVBTDftl2CZizVg740Np-2DN4t2094BIhQbOogCCNYOczKtfk02zWK_eO9Me9RXtTZ9PRCRdAZ0dGvmeCJ0wHHLAD77CrpK3XoaxvG1LIl4WROtWQ-SMmlz91_3D0ODFkWONXK0-7sZpCLIPyy_yj0_VO0UJ8ujg/s320/2026-07-04%2018_55_19-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  sea_gull: { 
    title: "Μαυροκέφαλος Γλάρος 🕊️", 
    desc: "Ένας ξεχωριστός γλάρος που το καλοκαίρι φοράει «μαύρη κουκούλα» στο κεφάλι του, η οποία όμως εξαφανίζεται τον χειμώνα!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh0lrbCcTOo1by9DGz8-332wM6JFly-T6b8I77QW_PEtTcafR1qWtlOL4rQ9LGbvugdmIFw3w-CddN7EX8EO7hY29BDErYqeacqZ222Y8fC4XwHrWII79cdPDnjvuNKpgh53EvPKgcgX_2ggwM_0YinwJ4chH7XFmRsadxTt33utuI8EuQI7xig8t5bBWg/s320/2026-07-04%2019_09_13-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_vidra: { 
    title: "Βίδρα 🦦", 
    desc: "Η καλύτερη κολυμβήτρια των ποταμών. Φτιάχνει τη φωλιά της στις όχθες των καθαρών νερών και κλείνει τα αυτιά και τη μύτη της όταν βουτάει.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQklZDESmMDxylyLj-lZUMe7s19cmdcKPoyeCpwxx3uiookNRuUs9Yus7yj4xrw0MAAIoV2ER8Bc9viTjmKcjOI-rT2bC9jwty4qr5A8kMoFp1JIc3rS-ZjFzYzIx0vsN_gWKoIF4bJXqMcjDYFaczoi1P7-jTUjUGFBTsQSEoyaaktcojOiELhMW3FIw/s320/2026-07-04%2019_09_54-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_nerokotsyfas: { 
    title: "Νεροκότσυφας 🎵", 
    desc: "Το μοναδικό ωδικό πουλί που κάνει καταδύσεις! Περπατάει κυριολεκτικά κάτω από το ορμητικό νερό στα ρέματα για να βρει μικρά έντομα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_daJaSdrWA_b1dho7RErT8ZVQdm66uV8HjLeewiwWgcH6sdXQJDHCaKqkNyQ6uMJuzFP8Ji8FwpPp7x3xtAioBN1hHsCqrJMwEXs4gbtLUFEzwcLeY8lgoT48vA2mZxAye576Ku0ZwMttMj_z0uHR_Sbt9AlHjpfLAoKxd4A7B7zsgz5xXpzHCtMRAyA/s320/2026-07-04%2019_59_02-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_nerofido: { 
    title: "Νερόφιδο 🐍", 
    desc: "Παρόλο που τρομάζει πολλούς όταν το βλέπουν στις βάθρες, είναι εντελώς ακίνδυνο. Είναι τέλειος κολυμβητής και τρέφεται κυρίως με μικρά βατράχια.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3lKSEHVeLO9r29dZSspqBwZfnjG8b2fClulWPt7Bq7fUzLfaRmzaGivCR1QmPjWfs3qEkYEnSnyGfdtVlMS-CI0o43QeUzfYGtwSfl_cB_fuL-CpfQ1a8qW75Oy6tuEr_DDrKu0J1Uon1S206Gcpf4M_FYcIHJpH770o8awitrY9cet9QE9Mq7NxsRNU/s320/2026-07-04%2019_59_39-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_platanos: { 
    title: "Αιωνόβιος Πλάτανος 🌳", 
    desc: "Το δέντρο που διψάει. Τα πλατάνια ζουν εκατοντάδες χρόνια και φυτρώνουν πάντα εκεί που υπάρχει άφθονο, δροσερό νερό για τις ρίζες τους.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgxcADYYFOVNFxy_Stb3hdJWwe_NSeJNqv6HG7nLTxsAHAyn_gz7rb_vNsoyM7HIV99FUdyhfWCsfCL-vyJL-PWGLViuVJ03xVU1wyRvTUDnwbO4hXv48al1goaTH9b4CxxCQgn2WGXc2OzNeBDsTeWy2t9f9K9JD38EgJ37HmNs8RErRYnOM-vFQyFeUU/s320/2026-07-04%2020_00_47-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  },
  eco_armyriki: { 
    title: "Αρμυρίκι 🌿", 
    desc: "Ο επιζών της άμμου. Είναι από τα ελάχιστα δέντρα που μπορούν να απορροφήσουν αλμυρό νερό και να «φτύσουν» το αλάτι από τα μικρά φύλλα τους!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg1IB6c9f-oi0nwrPsheRUA4KffQUIntqtwPwSiHxndeU_sHEYMcUx2ZmD1WN0iVB3ZFltuiEpFeFQ4WrnkdhpRj-dQi87q5Hx79xtKxHUE2iptyyoVLAInIls_gNoKiQRfuaMg8D9Ep5IFaqZPPif60Xc3fibTUoCR-tIeeHygLPiH6d8jvEO1XCpATLw/s320/2026-07-04%2020_01_43-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png", 
    sound: "" 
  },
  eco_krinos: { 
    title: "Κρίνος της Θάλασσας 💮", 
    desc: "Ανθίζει μέσα στο κατακαλόκαιρο πάνω στην καυτή άμμο των παραλιών. Τα πανέμορφα λευκά άνθη του μοσχοβολούν μόνο μετά τη δύση του ηλίου.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgMF7wEcwLIlX0ze1hje6p9oU8pb-_FoVyFHJuCo4otvAoYEfTVgSZEQ5_HlJfKaM_wGNzHypY44cg7NQRHjHE1f1u408qyRiFR1Y4lEQjjpKPjoVZdQrX6HimkROs4nWPGXqYs8BUfp9TCOb5HCIaQeIRiWaBl6rp_sifoTK7Yqxw6aLJnBPAQqoYkduM/s320/2026-07-04%2020_02_25-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "" 
  }, sea_mydi: { 
    title: "Μύδι Ολύμπου 🦪", 
    desc: "Ο θησαυρός του Θερμαϊκού! Τα μύδια της Πιερίας αναπτύσσονται στα καθαρά νερά του κόλπου και αποτελούν την πιο διάσημη τοπική θαλασσινή γεύση.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjlVPtB0oGuXrz_NE0_ijBlnRCa5Ly6nNdvneYwVBtnXb02ytLMHDwoL3fAyTCzWcpw9O-JyH7wUmklAYMfkPoMGMbtcxdYgRmSrIt0VU0_tiUi7Gz12XoCxPuDqNmSAimn71cGtupJvvL55xYLFz2T_rfO4CXJAoZxM40uqwpTSUN17XXKZYQujYlVGfE/s320/2026-07-04%2020_11_50-2025-09-25%2018_01_46-World%20of%20Warcraft.png", sound: "" 
  },
  eco_turtle: { 
    title: "Χελώνα Caretta-Caretta 🐢", 
    desc: "Η αρχόντισσα της άμμου! Οι ακτές της Πιερίας αποτελούν γνωστό πέρασμα για τις θαλάσσιες χελώνες. Ωστόσο, αν και διασχίζουν τα νερά μας αναζητώντας ασφαλή καταφύγια, σπάνια επιλέγουν να βγουν στις δικές μας αμμουδιές.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSH3M-mnuSm3GiqtWUyP19lZ_IvTcCvhyt4i586wjwWX5sAGXkOVL2IG2HRT3J5r5LPBFJSdmweWgYl0GQ2vJs4NAuueyv1flgR3NlEhKMZVFI3TnAu4Ij6SU_99nDSyGsll8tnk1oKgRi0d1a2Y3sizNVrZ2YDMDYy81pSYzsS-wtnOh-l_WxztFFA6A/s320/2026-07-04%2020_12_42-2025-09-25%2018_01_46-World%20of%20Warcraft.png", sound: "" 
  },
  sea_tsipoura: { 
    title: "Τσιπούρα 🐟", 
    desc: "Το πιο χαρακτηριστικό ψάρι των ρηχών ακτών μας. Τις βλέπουμε συχνά να κολυμπούν κοντά στους βράχους και τα λιμανάκια.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh_Yf2W1ixGIo-I4iuW4P2atb-wXZuQWZSsipt-XmLxw8firCZb2dRrX0ErPLVQVRcilHcxGCEvB17bhRBHn81kXQkhkRK_Q6hw2zRI-xMtgToxSgoxG_O9M0QbQ2baYX_DisiO4ex7-Qs5LTzxzTJT2jhGndhKD5mIl-o27jDkdMdmR_2vmOsSQOaMDjw/s320/2026-07-04%2020_13_18-2025-09-25%2018_01_46-World%20of%20Warcraft.png", sound: "" 
  },
  sea_poseidonia: { 
    title: "Ποσειδωνία (Θαλάσσιο Ποσειδωνάκι) 🌿", 
    desc: "Δεν είναι φύκι, είναι φυτό! Τα λιβάδια Ποσειδωνίας στον βυθό της Πιερίας καθαρίζουν το νερό και είναι το σπίτι για χιλιάδες μικρά ψάρια.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjE3OBNvIKnmQxJOZF0tSmNQ_CDwIyKvnJcVXazhcxF4RvVpnE_DwXDGs3P6IHBorBZ8-afg8avLeveb5anp2Wf2sWdtudCT590gKfQxOf-50LBvOUorvVJCOkgs_rAQm8CTeZERBX2uqfb5ZECjE3ittbVuWO51ON2mL59FJIlL5aFuApIuK1tuRH0zXU/s320/2026-07-04%2020_14_00-2025-09-25%2018_01_46-World%20of%20Warcraft.png", sound: "" 
  },
  sea_kavouri: { 
    title: "Κάβουρας 🦀", 
    desc: "Ο κάτοικος των βράχων. Τον συναντάμε σε όλα τα παραθαλάσσια σημεία της Πιερίας, από τον Πλαταμώνα μέχρι τη Μεθώνη.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg8HNzJw8W0sDhy-oENpFE307UIR4ChysPdK9PMFFdTkSMuE1S6CISUBVVUgARbiknUbzfslKsRo9BbcY56eMYPpEyG_6R497xngU-kwlwayVKBtZI-q-tnQGbwfqbXA_KrtTI2V0jk8YphbvxT6Qviu60EX6StZFg8AIDuNt4M9fel9EQ_gVE3WZF5haM/s320/2026-07-04%2020_14_49-2025-09-25%2018_01_46-World%20of%20Warcraft.png", sound: "" 
  },
  sea_dolphins: { 
    title: "Ρινοδέλφινο 🐬", 
    desc: "Ο πιστός μας σύντροφος. Τα δελφίνια συχνά ακολουθούν τις ψαρόβαρκες στα ανοιχτά των ακτών της Πιερίας.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2awe-amBi1CpnrMEJSLEAG6P0aggQUiPsVPard2EZtvB4V37KU53aPvT356cbIG5DVNrexEEDRTysmWG0cXlOA_vSYNiWsBlmmuISQlQjhKzQgWzMxJnb4O2w1hIQYVg-z1Y_UONECl67xiEGo5fu3jBTdkQ0DYsNqW8GTlQe0tf9s3rrMbk0TAJlP2Y/s320/2026-07-04%2020_15_33-2025-09-25%2018_01_46-World%20of%20Warcraft.png", sound: "" 
  }, mythic_kraken: { 
    title: "Το Θρυλικό Κράκεν του Θερμαϊκού! 🐙", 
    desc: "Ένα γιγάντιο μυθικό τέρας με τεράστια πλοκάμια που αναδύεται από τα βάθη της θάλασσας! Λένε πως όταν θυμώνει, τυλίγει τα καράβια των θνητών και τα παρασύρει στον βυθό, δημιουργώντας τεράστιες δίνες στα ανοιχτά της Πιερίας. Πρόσεχε το ταξίδι σου!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj8Eco8PTt1Z3gjN9Mu3_FR8lW_PvPr0BcbufXPULZ4KUD49lOAYVWDqLOHJAJlE0B8e8oNFqAq1-_zou5ljKZagw0f82c_PvlN4lJ97fnBHdBL_2DLklvs4vi6PCmtSBXJLGC9QLD-rOeEe1xU1oiMPEP9xlJfl-zZ9AsaRNCH6ucHrmRWT2vcwZQmJQ8/w640-h338/2026-07-06%2018_31_43-2025-09-25%2018_01_46-World%20of%20Warcraft.png", // Εδώ μπορείς να αλλάξεις το link με δική σου εικόνα
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171210/dragon-studio-deep-sea-monster-roar-329857_fkjshx.mp3" 
  }, mythic_stymphalian: { 
    title: "Στυμφαλίδες Όρνιθες 🦅", 
    desc: "Φτερά από χαλκό και νύχια κοφτερά σαν σπαθιά! Οι Στυμφαλίδες φυλάνε την Αλυκή. Αν δεις τον ουρανό να σκοτεινιάζει, τρέξε να κρυφτείς!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZpqaKWjhnG58zFwBKTQ2s66MPvvDucx6NYJubPMcdjAVWfs2eznqS9JcG5ykU6FyQWPFW0F-vJf6O0QUIBYgtDGFsIAdnuTEoowv6OezXhmblN0T2cWsGdtviAGGBWHeP3FXEg6B9n5T5m2QF0OX2INvIQ9Vhod7pEAcvr4CSnTjA-Z9HK8_dl8jjdcY/s1600/2026-07-06%2019_14_38-2025-09-25%2018_01_46-World%20of%20Warcraft.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783354632/u_kse9ncnirq-bird-creature-screams-399552_jxjtbp.mp3" 
  }, mythic_sirens: { 
    title: "Οι Σειρήνες της Πιερίας 🧜‍♀️", 
    desc: "Στα ανοιχτά της Πιερίας, εκεί που η θάλασσα βαθαίνει, οι Σειρήνες παραμονεύουν πάνω στους βράχους. Με το απόκοσμο, μαγευτικό τους τραγούδι υπνωτίζουν τους ναυτικούς, οδηγώντας τα καράβια στον όλεθρο.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEibRThxjVabOsy0iM4ns5GEjs6ehgjDzleYh6iRBWJP6q5ZGye_vxkbSPWNc1wSER_RM3ikFk-cvQ-oFTqRT5dwsnfZ7I6AL7DKm9mHqvXKGoDgClj82Th30DzDYzAQ3IXx2_SkNcZDARoevTAtdXBjSJnSv7Ftv_VCuk22SS2uBl2u3Si7wvpgGq4SHhI/s320/Gemini_Generated_Image_osvsitosvsitosvs.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783360542/mix_09s_audio-joiner.com_kigv5m.mp3" 
  }, mythic_chimera: { 
    title: "Η Τρομερή Χίμαιρα 🔥", 
    desc: "Ένα φοβερό, μυθικό τέρας με σώμα λιονταριού, κεφάλι κατσίκας στην πλάτη και ουρά φιδιού! Αναπνέει φλόγες και σκορπά τον τρόμο. Αναπνέει φλόγες και σκορπά τον τρόμο. Πρόσεχε τα βήματά σου στα μονοπάτια του βουνού!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGc5Hv0M-l6gbyf_8Lh2frs92w9YyhT_xn4I5e9dlOJBeQP3ntT6uYlsLvEkzYSKF1j2DXF1TDCJ6ayXYz6Re7Q-Tnody-9s5jYuDB2lj7z_ZFQ9nWSbHYxaAcjBZpVzDETejnZLipTy387obUDKJ5U8xEEpMwVshlNIoReVhMxUiztME4Aze8nw-hW9g/s320/Gemini_Generated_Image_jmfxjjmfxjjmfxjj.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171210/dragon-studio-deep-sea-monster-roar-329857_fkjshx.mp3" 
  },
mythic_echidna: { 
    title: "Η Έχιδνα: Η Μητέρα των Τεράτων 🐍", 
    desc: "Μισή πανέμορφη γυναίκα και μισό γιγάντιο, φολιδωτό φίδι! Κρύβεται στα σκοτεινά σπήλαια στα Πιερικά Όρη. Μαζί με τον Τυφωέα, γέννησαν τα πιο τρομακτικά τέρατα της ελληνικής μυθολογίας.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjI7COQPVguhybxYjvh79Q9Ugc5biurvBzrjsWq4wRhNEjVxK6qPrTVJtXpWFJfm96G1OMbxUIzsnU1rsbGaKGyv-EzneKgBeigMcTiwZvz6M7g6zBFBbgAZhnm2LRdr2VAaPTWlQRaoW4d41o5FCre4bQQmYO4XLIWWBRPVqCwy_KqCtMM6G13rGWnnHw/s320/Gemini_Generated_Image_m3zimpm3zimpm3zi.png", sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783373121/delon_boomkin-snake-hissing-457450_m6zloe.mp3" /* Έβαλα έναν τρομακτικό ήχο, μπορείς να τον αλλάξεις */
  }, mythic_charybdis: { 
    title: "Η Χάρυβδη 🌪️", 
    desc: "Το ζωντανό στόμα του βυθού! Μια γιγάντια, θανατηφόρα δίνη που καταπίνει τα πάντα στο πέρασμά της. Κράτα γερά το τιμόνι του πλοίου σου για να μην παρασυρθείς στο απόλυτο σκοτάδι.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiM5u3urWyiuW7diqon5cIYhmpy2WHiP9ShW9YZfqJMNZ_YQfDX9eE55zg-Y4_swi0Z4npXwKjFALxbWjnbEjz9W85bTIhexgwrm8oV9oxoNOqaJWEjf2wUVO5Gk5PSw5SY4wLnujcNUxkAleT__0oI9eFOZZuYBm5eRdE3itBxSeGXB4U4X3OLFiluv6A/s320/Gemini_Generated_Image_azrh7mazrh7mazrh.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783374575/mix_05s_audio-joiner.com_fl52af.mp3" 
  }, mythic_harpies: { 
    title: "Οι Άρπυιες 🦅", 
    desc: "Οι αρπάχτρες του ανέμου! Τρομακτικά πλάσματα με σώμα πουλιού και πρόσωπο γυναίκας. Κατεβαίνουν από τις κορυφές σαν μανιασμένοι ανεμοστρόβιλοι για να κλέψουν τη λεία τους.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhJkGOeBl9twQiO0wni_Tww_VrMfDksCXN7oDInWoycnQGGS9dHW5B0T5X8OFrYhwC4nCpgAGdnWVK_V7pv9lwJsjaZin7mKhADog8ZfXGa7WcP_3SABhjK9q6k2sPRGVsiRMm-32rE9qmGSg-lkcMnll0hRHPq1zdO8kthpWwWxM_KIJjlglrokTtk4Jo/s320/Gemini_Generated_Image_pkxecjpkxecjpkxe.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783354632/u_kse9ncnirq-bird-creature-screams-399552_jxjtbp.mp3" 
  }, mythic_cerberus: { 
    title: "Ο Κέρβερος: Ο Φύλακας του Άδη 🐕‍🦺", 
    desc: "Κάτω από τους αρχαίους Μακεδονικούς Τάφους του Κορινού, λέγεται πως βρίσκεται η ίδια η Πύλη του Κάτω Κόσμου. Και μπροστά της παραμονεύει ο Κέρβερος: ο τεράστιος, τρικέφαλος σκύλος με την ουρά-φίδι, που δεν αφήνει κανέναν ζωντανό να περάσει!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZJ0Kq0Ug1zCjc8haGHKe5C-hsq6IkuIRr2T77CeH1j24pB1z4QYsYFuFKTSKAKRMdwcg7pbiE9PtdhlNH9a-c8uvPvOxx9lkfWrmYghwVVrv7RFH6e4Jd-hRI0ywgxoFvbBvGixqfzbc4m9zHDaFvnSyfu10qctJY2agDCmS9_F2lnWs355S4lCSn3Gc/s320/Gemini_Generated_Image_m416cym416cym416.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171473/soundzee-lion-snarl-growl-354324_y8izrp.mp3" /* Ήχος βρυχηθμού */
  }, mythic_scylla: { 
    title: "Η Σκύλλα: Ο Εφιάλτης των Βράχων 🐉", 
    desc: "Κρυμμένη στις απόκρημνες σπηλιές, η Σκύλλα παραμονεύει! Με τα έξι της κεφάλια να τεντώνονται μέσα από το σκοτάδι, αρπάζει όποιον άτυχο ναυτικό προσπαθήσει να αποφύγει τη θανατηφόρα ρουφήχτρα της Χάρυβδης. Ο απόλυτος τρόμος του πελάγους!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjvVpprBFmA9RSaDnru8yzFtLoqwc-Gs9H5IwLCN2AlGXhZ_WwCAO5-zwz0-6kmPSP0XvwUn1NS7JW0hXfLBlZ2qpwWbVubV6ssYbFRauhG4Zl58UZUN0qf8MsM9lyktcSlMBRQYAJOzx9YqQBXueWYSt5QEiIEDQSlEJCYLc_3JQFQFHyVnCC6vOQlJ38/s320/Gemini_Generated_Image_aeoxitaeoxitaeox.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783427542/mix_06s_audio-joiner.com_wsyuvb.mp3" 
  }, mythic_centaurs: { 
    title: "Άγριοι Κένταυροι 🏹", 
    desc: "Η αφηνιασμένη αγέλη του δάσους! Μισοί άνθρωποι και μισοί άλογα, οι άγριοι Κένταυροι καλπάζουν μεθυσμένοι και πολεμοχαρείς ανάμεσα στα πυκνά δέντρα. Με φλεγόμενους πυρσούς και τεντωμένα τόξα, είναι οι απόλυτοι κυρίαρχοι της ορεινής Πιερίας τη νύχτα.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhF_q2eeBsz0NLF7QN9TVz6U3GSh0WRNDRX39VFtkuL7YjcHCLRvyu-24pDnPjpHcDvM7Ucp9RA28l7g1_Nn2uBpWpvZr0QkVTddAibd4DIMIo_hcse58RZ_ODYdhrzAzL2L8oYHHYFqWJyZ5dTkQn5yDS3WB9eWh_mTKb6BEoeq1q5wt3RIngYlzpHl3s/s320/Gemini_Generated_Image_1zb4pv1zb4pv1zb4.png", /* Μπορείς να βάλεις εικόνα κενταύρων εδώ */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783175252/universfield-horse-123782_hmq245.mp3" /* Ήχος αλόγων/καλπασμού */
  }, mythic_hydra: { 
    title: "Η Λερναία Ύδρα 🐍", 
    desc: "Μέσα στις λάσπες και τις καλαμιές του Υδροβιότοπου της Αλυκής, εκεί που το γλυκό νερό σμίγει με το αλμυρό, κρύβεται ένα δηλητηριώδες, πολυκέφαλο ερπετό. Πρόσεχε πού πατάς, γιατί για κάθε κεφάλι που κόβεις, φυτρώνουν δύο νέα στη θέση του!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEipqSgyI_5VwIvS3duo6crFAtl3Pxf60OxzQxqQae9YCLra4yGg8CJ6ieA8hXfy8KSN_qZwObQZhkatMiIRryqAwh2fbUFIO4QGCF6IDCj3nYYCGsr7hK0xE2bbo4lA2LbnrjU2PWQz6naRL-pZukSt7dmHzbh9ncJStVb_wlIRropUzo_u50RvvpBQrRg/s320/Gemini_Generated_Image_locsfflocsfflocs.png", /* Μπορείς να βάλεις μια άλλη εικόνα εδώ */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171325/dragon-studio-monster-growl-376892_posw7h.mp3" /* Ήχος βάλτου/συριγμού */
  },mythic_telchines: { 
    title: "Οι Τελχίνες: Οι Δαίμονες του Βυθού 🔱", 
    desc: "Μυστηριώδη, αμφίβια όντα με κεφάλια σκύλων και πτερύγια αντί για χέρια! Βαθιά στα σκοτεινά νερά του Θερμαϊκού, οι σκοτεινοί αυτοί μάγοι και μεταλλουργοί σφυρηλατούν καταραμένα όπλα και καλούν φονικές καταιγίδες με τη μαγεία τους, απειλώντας όποιο καράβι τολμήσει να περάσει από πάνω τους.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSRaU7Q8SDhKTE7JsUz110pvhEzBQBptV5_c6nyceCmTV0hJfdWtqx6pGcXU4qnTx5UFjpxbyxc5rrhQVWvzataKnqqo7G6X8MTPFPg869CE5qlroTgchCBYxvFJu1TH30S5jvzFNXT-1GR5PoEcR3G1N2r-L8PvgGhcknfO-kd6WCXp3qYrcg1Ib3HFA/s320/Gemini_Generated_Image_itejqxitejqxitej.png", /* Άλλαξε την εικόνα με κάτι σχετικό αν θέλεις */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783410565/freesound-community-anvil-hit-2-14845_1PGsgtnr_myjh6u.mp3" /* Ήχος μεταλλουργείου / χτύπημα στο αμόνι */
  }, mythic_talos: { 
    title: "Ο Τάλως: Το Χάλκινο Ρομπότ ⚙️", 
    desc: "Το υπέρτατο μηχανικό θαύμα της αρχαιότητας! Ένας γιγάντιος, άτρωτος χάλκινος φύλακας που περιπολεί τις ακτές ασταμάτητα, βγάζοντας απόκοσμους μεταλλικούς ήχους. Αντί για αίμα, στις φλέβες του τρέχει ο 'ιχώρ', το πυρωμένο υγρό των θεών, που λάμπει μέσα από τον θώρακα και τα μάτια του.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjMJUu9GjyFfb0-2jhzoTBEPvKpu1naHPa7tpyviYFhjfayiO6n1V16P3AL9L1l6o_JYvhWrW9umMOJQa6fxefWP_pnKqdmC4NXCr7tC0ZPCDT8fp2uXuvyf7OPliZjPMs-gmcBQaMGMdpbfZ4q8mvnGDQLrYT-OyAyMzlVn-d7UsamoxWzwdU6oD18tYI/s320/Gemini_Generated_Image_eolwpoeolwpoeolw.png", /* Μπορείς να βάλεις εικόνα ενός χάλκινου γίγαντα */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783427414/soundreality-metallic-swell-132658_u0fhxq.mp3" /* Ένας μεταλλικός ήχος χτυπήματος είναι τέλειος εδώ */
  }, mythic_cyclops: { 
    title: "Ο Κύκλωπας 👁️", 
    desc: "Ένας πρωτόγονος, άγριος γίγαντας με ένα μόνο μάτι στη μέση του μετώπου του. Κάθεται στην είσοδο της σκοτεινής σπηλιάς του, κρατώντας ένα πελώριο αγκαθωτό ρόπαλο, και σαρώνει τον ορίζοντα ψάχνοντας για καράβια και άτυχους ναυτικούς που θα τολμήσουν να πλησιάσουν την ακτή του.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEisoNNjdLmFjavL90-VTCDewFcUqQJwXAJx71DpSkrUBsVv05YvuNdv7DgqjAYR6MAVIAVAMBDMDD0P6hBQJipWyJe0EBGP98n6UdIH_YrU9YYSdzY6_eHAggjnNZntINtKz9MufoU1L-izb2UBC7Z7FvuHZuFRt8W2OVSXMED8rugSHTtg1HVCbUl8leY/s320/Gemini_Generated_Image_w9td3vw9td3vw9td.png", /* Μπορείς να βάλεις εικόνα ενός Κύκλωπα */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783428914/dragon-studio-thud-sound-effect-405470_lzeb5o.mp3" /* Ένας βαθύς βρυχηθμός ταιριάζει απόλυτα */
  }, mythic_medusa: { 
    title: "Η Μέδουσα (Γοργώ) 🐍", 
    desc: "Το απόλυτο, εμβληματικό τέρας! Ένα αποτρόπαιο πλάσμα με χλωμό δέρμα και δεκάδες φαρμακερά φίδια στο κεφάλι της. Κρύβεται στα σκοτεινά φαράγγια, και το παγωμένο της βλέμμα εκπέμπει μια θανατηφόρα πράσινη λάμψη. Όποιος τολμήσει να την κοιτάξει στα μάτια, μετατρέπεται αμέσως σε πέτρα!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-gfHcIhDIcAVQXPbbQcDs0kXCzgDki1QaEsYe_CN4ojThwoQQYGXZwyGQU_mo-SnxuUbOOWo-H-CULPH2oN0D9q_imAaBSkOawGVZV8uiGE65mkrTfOcTAkzVQlGhiRwTl-pyrLt4h_qfEsNY9El49_MaKX6V4o0tXUKiQRbCdlK1AZS5DmmVR6sho14/s320/Gemini_Generated_Image_x3a7sjx3a7sjx3a7.png", /* Μια ωραία εικόνα της Μέδουσας */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783373121/delon_boomkin-snake-hissing-457450_m6zloe.mp3" /* Ήχος από σφύριγμα φιδιών (hiss) θα ήταν τέλειος */
  }, mythic_boar: { 
    title: "Ο Καλυδώνιος Κάπρος 🐗", 
    desc: "Μια ασταμάτητη, χερσαία απειλή! Ένα γιγάντιο αγριογούρουνο σταλμένο από την ίδια τη θεά Άρτεμη για να τιμωρήσει τους θνητούς. Βρίσκεται στους πρόποδες των βουνών και σκάβει το χώμα με μανία, βγάζοντας λευκούς αφρούς από το στόμα, ξεριζώνοντας ολόκληρα δέντρα και ισοπεδώνοντας τα πάντα στο πέρασμά του.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjtqX8kuCKZ_aPW3fpIiGVjqxByl0n8I9Lyu3QwjhqSWybUsLsBGZuDuaypBY86I92_GLGsgn4bOY4DlG_3NMnCTmSvDC4AHCuPbU1Qta1MLh5IZQjYi2u8336L4CA2PRrQAUn9DbRsqRGggeSBXidbJJri4TeDI7EftyNxo4kWw7gavYPRfF7DklrnCTc/s320/Gemini_Generated_Image_pynxrspynxrspynx.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783430501/magiaz-porco1-326305_cwnnv2.mp3" /* Ένας άγριος ήχος ζώου/γρυλίσματος ταιριάζει γάντι */
  }, mythic_lycaon: { 
    title: "Ο Λυκάονας (Ο Πρώτος Λυκάνθρωπος) 🐺", 
    desc: "Ο μυθικός βασιλιάς της Αρκαδίας σκότωσε πολλούς ανθρώπους για θυσία στον Δία. Όμως ο θεός εξοργίστηκε και τον καταράστηκε να μεταμορφωθεί στον πρώτο λυκάνθρωπο της ιστορίας! Μια γιγάντια, σκιώδης φιγούρα που βγαίνει από τα σκοτεινά δάση και ουρλιάζει κάτω από το φεγγάρι.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgWieWTPCzuivjB2JwpjQued7Q7Bfrg2ngXiUyuuEzt7cCDWaQfFaX7GndCYMDD9wfZXOPQrvcRNfc-STCXYajT3uWWLlHViXaulCzc8XiCI_FlwBbL6vcZIZBA-ytS9rRr9R6KCqY3Q_gWPftieLrODsQQrDLb62ZOTIIcsbyHlc9EtTnPbVdx_OALAAE/s320/Gemini_Generated_Image_yum1l1yum1l1yum1.png", /* Μπορείς να βάλεις μια τρομακτική εικόνα λυκάνθρωπου/φεγγαριού */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783433910/universfield-wolf-howl-140235_wo53e8.mp3" /* Ένα ανατριχιαστικό ουρλιαχτό λύκου ταιριάζει απόλυτα! */
  }, mythic_minotaur: { 
    title: "Ο Μινώταυρος 🪓", 
    desc: "Η απόλυτη ενσάρκωση του ωμού τρόμου! Ένας γιγάντιος εκτελεστής με σώμα ανθρώπου και κεφάλι ταύρου. Περιπλανιέται στα μισογκρεμισμένα αρχαία ερείπια, κρατώντας σφιχτά τον 'Λάβρυ' (τον τεράστιο διπλό πέλεκυ). Όταν εντοπίσει θήραμα, η αναπνοή του βαραίνει, τα μάτια του αστράφτουν με οργή και καταφέρει φονικά χτυπήματα που τραντάζουν τη γη!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhK4OrhGyUfnvEmkKf0hNu-PF_YPY5CHMhdWxisSVf-yQ-nboc5ZBf4ivPDtWm2kuH5XxXW66Jgy45tmq2gahEzJkSCexASIya3hLlTd9aRTwHiPqUdG2GwI91d3XT-tTOgVkY22tGlV0tAfzTwLWy_RF0PkPgEyDdC4jbAvbebnQOb6mhhrl-Glf-Ms4Y/s2816/Gemini_Generated_Image_sjz9pvsjz9pvsjz9.png", 
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783435287/mix_08s_audio-joiner.com_1_ovrado.mp3" /* Ένας ήχος από βαρύ όπλο που κόβει τον αέρα/χτυπάει είναι ιδανικός! */
  }, mythic_charon: { 
    title: "Ο Χάρων και οι Χαμένες Ψυχές 🛶", 
    desc: "Ο απόκοσμος βαρκάρης του Κάτω Κόσμου δεν περιορίζεται μόνο στον Άδη! Πλέει σιωπηλά στα σκοτεινά νερά των ποταμών, ψάχνοντας για ψυχές που δεν έχουν βρει ακόμα τον δρόμο τους. Κωπηλατεί ασταμάτητα τη σάπια βάρκα του, περιτριγυρισμένος από τα γαλαζοπράσινα πνεύματα που τον ακολουθούν.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjrWC0jNirWiCjRmNPIXSX367jmDeCZw44zeVlZhVHn9Oj4Iw6A5gqgxiXmsQuIx_GVUzWgEtStyIgkIuYTftwTa8mRvJ5SL4wd6gNgnJbObe8wmrAfxW_XASDYDCYW-qLryxyOw0C4yYoAU0Sz125a_5KmoFxQP1slYHFdZkE6G55fzKIuvuUvK1_Ffpw/s320/Gemini_Generated_Image_vg1kg5vg1kg5vg1k.png", /* Μπορείς να βάλεις εικόνα με μια σκιώδη βάρκα/φάντασμα */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783435743/dragon-studio-ghost-whisper-351569_qnwtfx.mp3" /* Ήχος από νερό που πλατσουρίζει αργά ή απόκοσμος άνεμος */
  }, mythic_bronzebull: { 
    title: "Οι Χαλκοταύροι 🔥", 
    desc: "Η απόλυτη μηχανική καταστροφή! Γιγάντιοι, ασταμάτητοι ταύροι κατασκευασμένοι εξολοκλήρου από χαλκό, φτιαγμένοι από τον θεό Ήφαιστο. Τα μεταλλικά τους σώματα δεν έχουν αίμα, αλλά έναν πύρινο πυρήνα. Κάθε φορά που χτυπούν τη μεταλλική τους οπλή στο έδαφος πετώντας σπίθες, ένα θανατηφόρο ρεύμα φωτιάς ξεπηδάει από το στόμα τους!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhS95ABVzjoQEQBhR-LQUljieAAWw9qCU1u0m0KuRqe01MpzWuuJbJCVVZx8PU2BsPKgYK3H0cScCiYI8uV8rRESHa5yy-REGJCgn72xRN6vnB8W3204-X7XfOxuf4gPQhxA7br2dMm4mNmbWUoDmd0Whq5Rl5A5-vD4Qch0tQK3GhpR0cdZdfYKtyPrqw/s320/Gemini_Generated_Image_dscsmodscsmodscs.png", /* Μπορείς να βάλεις μια εικόνα ενός φλεγόμενου μηχανικού ταύρου */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783435287/mix_08s_audio-joiner.com_1_ovrado.mp3" /* Ένας ήχος από μέταλλο και φλόγιστρο (ή φωτιά) είναι το ιδανικό */
  }, mythic_arachne: { 
    title: "Η Αράχνη (Η Καταραμένη Υφάντρα) 🕷️", 
    desc: "Η θνητή υφάντρα που τόλμησε να προκαλέσει τη θεά Αθηνά και καταδικάστηκε να υφαίνει για πάντα στο σκοτάδι. Τώρα κρέμεται ανάποδα από τα σκοτεινά δέντρα του δάσους. Το δηλητηριώδες βλέμμα της παρακολουθεί αθόρυβα όποιον τολμήσει να μπλεχτεί στον ιστό της.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgwqAyp4kKPjL6ZGM2NZYnRzwxOrecqRjDHhztvIyqZ0MEmZUypGXhJob6PJbMBUL4bGLfTagCu3uF9ni_9DyyvuYbo26coqv3-J0ICi5Wk89SMkW44jlmYZumnhGMVkTRP-6G7xo1U7XzRePQNZcfcCfswRqToK85o-mJ7p5N7Qb1_Y8v6SnmRbVSPZEA/s320/Gemini_Generated_Image_ocg5bbocg5bbocg5.png", /* Βρες μια ωραία εικόνα αράχνης ή ιστού */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783439276/dragon-studio-steam-hissing-386157_XHD7jhIR_tr4b5s.mp3" /* Ένας ήχος από 'κλικ' εντόμου ή αέρα ταιριάζει πολύ */
  }, mythic_storm: { 
    title: "Η Υπέρτατη Καταιγίδα 🌪️", 
    desc: "Το εκατοντακέφαλο τέρας που συγκλόνισε τον Όλυμπο, ηττημένος, αλλά αθάνατος, θάφτηκε στα έγκατα της γης, όπου η ανάσα του μεταμορφώθηκε στον πρώτο, καταστροφικό Τυφώνα. Τώρα, απελευθερώνει πύρινους ανέμους και ηφαιστειακή λάβα, έτοιμος να καταπιεί όποιον βρεθεί στο πέρασμά του.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiHCjL66a0L1DQdsRODXVv2UDN0qX1kPN0umkwW5_TjZKFyizLt6cuhAKfKi7Lll39QoV1Y2JVEZhHMqZ49RFJV4uYzgIFjVscAWQCbi_XI0yHkIZHtf6XqUjb3lABGsk5d-_WoVQb8QYT8D1i3-_0_K3uSiu_0E4OGBnRwl97hsrHQ093108dg04IMYHA/s320/c3cc1f12-d093-4c71-a602-f405d10efbe7.jpg",
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783439514/magiaz-hurricane-458503_k9kvjx.mp3"
  }, mythic_pegasus: { 
    title: "Ο Πήγασος (Το Ουράνιο Φως) ✨", 
    desc: "Μια αχτίδα φωτός στο σκοτάδι των τεράτων! Το θρυλικό, λαμπερό φτερωτό άλογο της μυθολογίας πετάει περήφανα στους ουρανούς της Πιερίας αφήνοντας πίσω του ένα μαγευτικό ίχνος από χρυσόσκονη και αστερόσκονη που καθαρίζει τον κόσμο.", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhWDQrndmbU59LpeOWQKxyNbVDXG1c7TfoArMJVDdtafQoIg7D7PXt50doC7vyAA6aS7WWDpKafwiAKH3rkhWj-NTfUjVHPI3Hi-wBFvWjw73CbEfYKv4ZkEx9Z7tb9R8k77GdH3LzA9gpSsQSBYobxHPOI1NkuiYjyJmbFkYurTFCSeQZSpITnswPRpzA/s320/Gemini_Generated_Image_eyidkieyidkieyid.png", /* Μπορείς να βάλεις μια μαγική εικόνα του Πήγασου */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783442527/dragon-studio-horse-neigh-515279_kdfezj.mp3" /* Ήχος από άλογο ή ένας μαγικός ήχος 'sparkle' (chimes) */
  }, mythic_sphinx: { 
    title: "Η Σφίγγα (Το Απόλυτο Αίνιγμα) 🦁", 
    desc: "Η αγέρωχη φύλακας των αρχαίων περασμάτων! Ένα πλάσμα με σώμα λιονταριού, τεράστια χρυσά φτερά αετού και πρόσωπο γυναίκας. Κάθεται ακίνητη πάνω στον μαρμάρινο κίονα της, όμως όποιος την πλησιάσει, θα δει τα μάτια της να λάμπουν καθώς λέει το θανάσιμο αίνιγμά της!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjEYp4aCcOUPkREwrSVeNAp_OZ4skmzbK8j6IHb7zvV0vo4yczugtoW9bzh5LYHEfVeWi3Ata6jtnm1kQPgXsEjYOFcHlhxz1nAhood7qoEYAAoUYju7UOk788pSVI17XUX_JkanVQV7Sp46chC2V6-NA-IhAJWBUV7VZ2-hTtXc7ZaWbZRB87pogQ0TiA/s320/Gemini_Generated_Image_lyg2q2lyg2q2lyg2.png", /* Μπορείς να βάλεις μια όμορφη εικόνα της Σφίγγας */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783444073/freesound_community-flapping-39306_holrzv.mp3" /* Ένας ήχος από μαγικά 'chimes' ή ένας αέρας που σφυρίζει απόκοσμα */
  }, mythic_colchian: { 
    title: "Ο Δράκοντας της Κολχίδας 🐉", 
    desc: "Ο αιώνιος φύλακας του Ιερού Άλσους του Άρη! Ένας γιγάντιος δράκος τυλιγμένος σφιχτά γύρω από το δέντρο όπου κρέμεται το Χρυσόμαλλο Δέρας. Δεν κοιμάται ποτέ. Αν τον πλησιάσεις, το τεράστιο κεφάλι του θα ξετυλιχθεί αργά και αθόρυβα προς το μέρος σου. Μην τον κοιτάξεις, η υπνωτική του δύναμη είναι ακαταμάχητη!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2cuKXQHtGbgBGJe7pjhZEitY9d2Mx2M3yYRg8Lu_90JBdVTM0mmbrez4NeIa4FlqboaUrlZjs_6DAdbAx0l9gDX9eJ5f1TQ13g0OHbnssIMCFmRBti_Ki8Ks4T_l90vjsDhWcnnQq7jrVipSUc22s39Ex9t1H5rO4dZRS2XrmgAc3kaqU-HqfAe8J8mo/s320/Gemini_Generated_Image_k12a31k12a31k12a.png", /* Μπορείς να βάλεις μια εικόνα Δράκου ή του Χρυσόμαλλου Δέρατος */
    sound: "https://res.cloudinary.com/drx2a5ane/video/upload/v1783171325/dragon-studio-monster-growl-376892_posw7h.mp3" /* Ένας ήχος από συριγμό φιδιού (hiss) ή μαγικό/απόκοσμο ambient */
  }, eco_arkouda: { 
    title: "Καφέ Αρκούδα 🐻", 
    desc: "Ο σιωπηλός άρχοντας των Πιερίων! Αν και τεράστια, τρέφεται κυρίως με άγρια φρούτα και μέλι, ενώ λειτουργεί ως ο «κηπουρός του δάσους». Μπορεί να τρέξει με ταχύτητα 50 χλμ/ώρα και έχει εκπληκτική όσφρηση!", 
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEghb5e-MvCL_DHz27QTOY4AIedw8_z0T4eeU64q_Ottr3jmFRaRKNgwKYa3iDtNRG3FbdiMUtbhi077Tbql2cSObvrkzLOLCMhGJzH6w0Gn7WFef3uHrprWRFQx0W3KlESeO8Sm2VQIxjHc5OU0ZeQaFftXIUWLa-U2mU8DPGpiMfg-8XW-H4haRndz8eQ/s320/2026-07-08%2012_08_11-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png", /* Βάλε εδώ το δικό σου link εικόνας όταν το έχεις */
    sound: "" 
  }, eco_agriogourouno: { 
  title: "Το Αγριογούρουνο των Δασών 🐗", 
  desc: "Στιβαρό, γρήγορο και επιβλητικό! Το αγριογούρουνο διασχίζει με ορμή τα πυκνά δάση βελανιδιάς και οξιάς της Πιερίας αναζητώντας την τροφή του. Με την αντοχή του, είναι ο πραγματικός «σκαπανέας» της φύσης, καθώς ανανεώνει το χώμα του δάσους με το πέρασμά του.", 
  img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEghUsiIs71NxILVyLrX-hW39uFt4kDRgHcYpzE0ppENmCFd-8RAr56htJhRHmMcVxTymS5qzguiPARbvxWtTpYLhyDvYOS6Kie7_BqHgsm1VIK12lEW3AzSBDABXXRDKfTbr0rqd0cqCYRmtaBkVCLY2idVjlq3Ad4gxPxrrQvW9NHtsrfnlKDMM2M2p0Q/s320/2026-07-08%2013_34_21-2025-09-25%2018_01_46-World%20of%20Warcraft.png",
  sound: "" // Άδειο string για να μην προσπαθεί να φορτώσει ανύπαρκτο αρχείο

  }
  };

  function showPlace(placeId, event) {
    // Αν για κάποιο λόγο δεν πέρασε το event, άνοιξέ το κανονικά
    if (!event) return; 
    
    // Υπολογίζουμε την απόσταση μεταξύ pointerdown και pointerup μέσα στο ίδιο το κλικ
    const diffX = Math.abs(event.clientX - startX);
    const diffY = Math.abs(event.clientY - startY);
    
    // Αν η μετακίνηση είναι πάνω από 7 pixels, σημαίνει ότι ο χρήστης έκανε drag, οπότε ακυρώνουμε το άνοιγμα
    if (diffX > 7 || diffY > 7) {
        return;
    }
// === ΝΕΟ: Μαρκάρει την πινέζα ως "Διαβασμένη" ===
    if (event.currentTarget) {
        event.currentTarget.classList.add('visited-banner');
}
    document.getElementById('tt-title').innerHTML = mythicData[placeId].title;
    document.getElementById('tt-desc').innerHTML = mythicData[placeId].desc;
    

    // Αλλαγή της εικόνας
    const imgEl = document.getElementById('tt-img');
    if (mythicData[placeId].img) {
      imgEl.src = mythicData[placeId].img; // Βάζει το link του συγκεκριμένου αξιοθέατου
      imgEl.style.display = 'block'; // Εμφανίζει την εικόνα
    } else {
      imgEl.style.display = 'none'; // Την κρύβει αν κάπου ξεχάσεις να βάλεις link
    }
// === ΝΕΑ ΠΡΟΣΘΗΚΗ: Εμφάνιση της περγαμηνής ΜΟΝΟ όταν πατηθεί η Περίσταση ===
    if (placeId === 'peristasi') {
      const t2_1 = document.getElementById('treasure-2-1');
      if (t2_1 && t2_1.style.display !== 'none') {
        t2_1.classList.remove('hidden-treasure');
      }
    }
// Σταματάει ακαριαία τον ήχο της θάλασσας από το κεντρικό κουμπί
    oceanAudio2.pause();
    oceanAudio2.currentTime = 0;
    clearTimeout(audioTimeout2);
    clearInterval(fadeInterval2);
// === ΝΕΑ ΠΡΟΣΘΗΚΗ ΓΙΑ ΔΙΑΦΟΡΕΤΙΚΟ ΗΧΟ ΑΝΑ ΠΙΝΕΖΑ ===
    if (mythicData[placeId].sound && isSoundOn2) {
        // Αν παίζει ήδη κάποιος ήχος από προηγούμενη πινέζα, σταμάτησέ τον αμέσως
        if (currentActiveAudio) {
            currentActiveAudio.pause();
            currentActiveAudio.currentTime = 0;
        }

        // Δημιουργεί δυναμικά τον ήχο της συγκεκριμένης πινέζας
        currentActiveAudio = new Audio(mythicData[placeId].sound);
        currentActiveAudio.volume = 0.8; // Ρύθμιση έντασης (0.0 έως 1.0)
        currentActiveAudio.play().catch(e => console.log("Sound play blocked or failed:", e));
    }
// === ΝΕΟ: ΕΝΕΡΓΟΠΟΙΗΣΗ ΑΤΜΟΣΦΑΙΡΙΚΩΝ ΕΦΕ & ΚΑΙΡΟΥ ===
    const overlay = document.getElementById('map-dark-overlay');
    if (overlay) {
        overlay.className = 'map-overlay'; // Καθαρίζει τα προηγούμενα
        
        // Λίστες με το ποιο εφέ πάει πού
        const darkPlaces = ['mythic_hades', 'skot', 'mythic_typhon', 'mythic_echidna', 'mythic_storm', 'mythic_lycaon' ,'mythic_pydna_fate', 'mythic_cerberus', 'mythic_charon', 'mythic_centaurs', 'mythic_hydra', 'mythic_lions'];
        const abyssPlaces = ['mythic_cetus', 'mythic_charybdis', 'mythic_kraken', 'mythic_telchines', 'mythic_scylla'];
        const snowPlaces = ['elatochori', 'olympus', 'eco_rompolo'];
        const sparklePlaces = ['mythic_muses', 'mythic_orpheus', 'mythic_methoni_alphabet'];
        const lightningPlaces = ['mythic_zeus', 'mythic_storm', 'mythic_harpies'];
const stonePlaces = ['mythic_medusa'];

        if (darkPlaces.includes(placeId)) overlay.classList.add('dark-mode');
        else if (abyssPlaces.includes(placeId)) overlay.classList.add('abyss-mode');
        else if (snowPlaces.includes(placeId)) overlay.classList.add('fx-snow');
        else if (sparklePlaces.includes(placeId)) overlay.classList.add('fx-sparkles');
        else if (lightningPlaces.includes(placeId)) overlay.classList.add('fx-lightning');
else if (stonePlaces.includes(placeId)) overlay.classList.add('petrified-map'); // <-- ΑΥΤΟ ΠΡΟΣΘΕΤΕΙΣ
    }

    document.getElementById('tolkien-tooltip').classList.add('active');
    if(event) event.stopPropagation();
  }
// === ΝΕΟ JAVASCRIPT: Η ΛΟΓΙΚΗ ΤΟΥ ΠΑΙΧΝΙΔΙΟΥ ΓΙΑ ΤΟΝ 2Ο ΧΑΡΤΗ ===
  function showTreasurePopup2(title, desc) {
    // Σημείωση: Εδώ χρησιμοποιούμε τα ID του 2ου χάρτη (tt-title, tt-desc, tt-img)
    document.getElementById('tt-title').innerHTML = title;
    document.getElementById('tt-desc').innerHTML = desc;
    document.getElementById('tt-img').style.display = 'none';
    document.getElementById('tolkien-tooltip').classList.add('active');
  }

  function foundTreasure2(step, event) {
    event.stopPropagation();
    
    if (step === 1) {
      showTreasurePopup2(
        "📜 Παλιά Περγαμηνή", 
      "Τα κατάφερες! Η περγαμηνή γράφει:<br><br><i>«Ο επόμενος θησαυρός είναι ένα αρχαίο νόμισμα. Κρύβεται στα βόρεια, δίπλα σε ένα σπουδαίο αρχαίο λιμάνι, εκεί όπου βρέθηκαν τα πρώτα δείγματα της ελληνικής γραφής...»</i>"
    );
      document.getElementById('treasure-2-2').classList.remove('hidden-treasure');
      document.getElementById('treasure-2-1').style.display = 'none';
      
    } else if (step === 2) {
      showTreasurePopup2(
        "🪙 Αρχαίο Νόμισμα", 
      "Υπέροχα! Ταξίδεψες μέχρι την Αρχαία Μεθώνη και βρήκες το νόμισμα! Πάνω του έχει χαραγμένο το τελευταίο στοιχείο:<br><br><i>«Το τελικό έπαθλο φυλάσσεται τέρμα νότια, δίπλα στα μεγάλα πέτρινα τείχη του κάστρου που βρέχονται από το Αιγαίο...»</i>"
    );
      document.getElementById('treasure-2-3').classList.remove('hidden-treasure');
      document.getElementById('treasure-2-2').style.display = 'none';
      
    } else if (step === 3) {
      showTreasurePopup2(
        "💍 Το Δαχτυλίδι της Πιερίας!", 
        "<h3 style='color:#c29b38; margin: 0;'>ΣΥΓΧΑΡΗΤΗΡΙΑ!</h3><br>Ανακάλυψες τον μεγάλο θησαυρό, έλυσες όλους τους γρίφους και ολοκλήρωσες την περιπέτεια με επιτυχία!"
      );
      document.getElementById('treasure-2-3').style.display = 'none';
    }
  }
  function hidePlace() {
    document.getElementById('tolkien-tooltip').classList.remove('active');
// Αφαίρεση φίλτρου
const overlay = document.getElementById('map-dark-overlay');
if (overlay) overlay.className = 'map-overlay';
  }

  document.addEventListener('click', function(event) {
    const tooltip = document.getElementById('tolkien-tooltip');
    if (tooltip.classList.contains('active') && !tooltip.contains(event.target)) {
      hidePlace();
    }
  });
// 👇 ΕΔΩ ΑΚΡΙΒΩΣ ΞΕΚΙΝΑΕΙ Ο ΚΩΔΙΚΑΣ ΕΝΑΛΛΑΓΗΣ ΓΙΑ ΤΟΝ 2Ο ΧΑΡΤΗ 👇
// === ΗΧΟΣ 2ου ΧΑΡΤΗ (Ανεξάρτητες μεταβλητές) ===
const oceanAudio2 = new Audio("https://res.cloudinary.com/drx2a5ane/video/upload/v1783095191/solarmusic-ocean-waves-112906._ee1tbg.mp3");
let audioTimeout2;
let fadeInterval2;
let mapState2 = 5; 
let isSoundOn2 = true;
let currentActiveAudio = null;
function toggleMute2() {
    isSoundOn2 = !isSoundOn2;
    document.getElementById('sound-btn-2').innerHTML = isSoundOn2 ? "🔊" : "🔇";
    
    if (!isSoundOn2) {
        oceanAudio2.pause();
        oceanAudio2.currentTime = 0;
        clearTimeout(audioTimeout2);
        clearInterval(fadeInterval2);

        // Σταμάτημα και του ήχου της πινέζας αν παίζει
        if (currentActiveAudio) {
            currentActiveAudio.pause();
            currentActiveAudio.currentTime = 0;
        }
    }
}
function toggleBanners2(isFirstLoad) {
    hidePlace(); 
    clearTimeout(audioTimeout2);
    clearInterval(fadeInterval2);

    // Ο κώδικας του ήχου
    if (isSoundOn2 && !isFirstLoad) {
        oceanAudio2.volume = 1.0;
        oceanAudio2.currentTime = 0;
        oceanAudio2.play();

        audioTimeout2 = setTimeout(() => {
            fadeInterval2 = setInterval(() => {
                if (oceanAudio2.volume > 0.1) {
                    oceanAudio2.volume -= 0.1; 
                } else {
                    oceanAudio2.pause();
                    oceanAudio2.currentTime = 0;
                    clearInterval(fadeInterval2);
                }
            }, 200); 
        }, 6000); 
    }
    
    const button2 = document.getElementById('toggle-btn-2');
    const map2Area = document.getElementById('map-area-2');
    if (!map2Area) return; 
    const allBanners2 = map2Area.querySelectorAll('.t-banner');

    const groupA2 = ['peristasi', 'platamonas', 'pydna', 'methoni', 'kolindros', 'olympus', 'enipeas', 'agia_triada', 'elatochori', 'katerini_park', 'olympiaki_akti', 'dion_museum', 'monastery'];
    const groupB2 = ['skot', 'moni_makryrrachis', 'korinos_tombs', 'leivithra', 'kountouriotissa', 'olympus_center', 'alyki', 'poroi', 'platanodasos', 'orlias'];

    // Στάδιο 1: Μόνο Group B
    if (mapState2 === 1) {
if(document.getElementById('monsters-only-btn')) document.getElementById('monsters-only-btn').style.display = 'none';
        allBanners2.forEach(b => {
            const isMythic = b.classList.contains('mythic-banner');
            const isEco = b.classList.contains('eco-banner');
            const isB = groupB2.some(p => (b.getAttribute('onclick')||'').includes("'" + p + "'"));
            b.classList.toggle('visible-group', isB && !isMythic && !isEco);
            b.classList.toggle('hidden-group', !isB || isMythic || isEco);
        });
// Εξαφάνιση του Κράκεν (για σιγουριά)
        const kraken = document.getElementById('kraken-monster');
        if (kraken) kraken.classList.remove('active');
document.getElementById('stym-monster').classList.remove('active');
document.getElementById('sirens-monster').classList.remove('active');
const chimera = document.getElementById('chimera-monster');
        if (chimera) chimera.classList.remove('active');
const echidna = document.getElementById('echidna-monster');
        if (echidna) echidna.classList.remove('active');
const charybdis = document.getElementById('charybdis-monster');
        if (charybdis) charybdis.classList.remove('active');
const harpies = document.getElementById('harpies-monster');
        if (harpies) harpies.classList.remove('active');
const cerberus = document.getElementById('cerberus-monster');
        if (cerberus) cerberus.classList.remove('active');
const scylla = document.getElementById('scylla-monster');
        if (scylla) scylla.classList.remove('active');
const centaurs = document.getElementById('centaurs-monster');
        if (centaurs) centaurs.classList.remove('active');
        const cetus = document.getElementById('cetus-monster');
        if (cetus) cetus.classList.remove('active');
const aloadae = document.getElementById('aloadae-monster');
        if (aloadae) aloadae.classList.remove('active');
const typhon = document.getElementById('typhon-monster');
        if (typhon) typhon.classList.remove('active');
const macedonianLion = document.getElementById('macedonian-lion-monster');
        if (macedonianLion) macedonianLion.classList.remove('active');
const telchines = document.getElementById('telchines-monster');
        if (telchines) telchines.classList.remove('active');
const talos = document.getElementById('talos-monster');
        if (talos) talos.classList.remove('active');
const cyclops = document.getElementById('cyclops-monster');
        if (cyclops) cyclops.classList.remove('active');
const medusa = document.getElementById('medusa-monster');
if (medusa) medusa.classList.remove('active');
const boar = document.getElementById('calydonian-boar-monster');
        if (boar) boar.classList.remove('active');
const lycaon = document.getElementById('lycaon-monster');
        if (lycaon) lycaon.classList.remove('active');
const minotaur = document.getElementById('minotaur-monster');
        if (minotaur) minotaur.classList.remove('active');
const charon = document.getElementById('charon-monster');
        if (charon) charon.classList.remove('active');
const bronzeBull = document.getElementById('bronze-bull-monster');
        if (bronzeBull) bronzeBull.classList.remove('active');
const arachne = document.getElementById('arachne-monster');
        if (arachne) arachne.classList.remove('active');
const ultimateStorm = document.getElementById('ultimate-storm-monster');
        if (ultimateStorm) ultimateStorm.classList.remove('active');
const pegasus = document.getElementById('pegasus-monster');
        if (pegasus) pegasus.classList.remove('active');
const sphinx = document.getElementById('sphinx-monster');
        if (sphinx) sphinx.classList.remove('active');
const colchian = document.getElementById('colchian-monster');
        if (colchian) colchian.classList.remove('active');
const eagle = document.getElementById('eagle-anim');
if (eagle) eagle.classList.remove('active');
const flamingos = document.getElementById('flamingos-anim');
if (flamingos) flamingos.classList.remove('active');
const chamois = document.getElementById('chamois-anim');
if (chamois) chamois.classList.remove('active');
const turtle = document.getElementById('turtle-anim');
if (turtle) turtle.classList.remove('active');
const bear = document.getElementById('bear-anim');
if (bear) bear.classList.remove('active');
const otter = document.getElementById('otter-anim');
if (otter) otter.classList.remove('active');
const boarNew = document.getElementById('boar-anim-new');
if (boarNew) boarNew.classList.remove('active');
const woodpecker = document.getElementById('woodpecker-nature');
if (woodpecker) woodpecker.classList.remove('active');
const roeDeer = document.getElementById('roe-deer-nature');
if (roeDeer) roeDeer.classList.remove('active');
const salamander = document.getElementById('salamander-anim');
if (salamander) salamander.classList.remove('active');
const ecoFox = document.getElementById('fox-eco-nature');
if (ecoFox) ecoFox.classList.remove('active');
const ecoPelican = document.getElementById('pelican-eco-nature');
if (ecoPelican) ecoPelican.classList.remove('active');
const ecoTritonas = document.getElementById('tritonas-eco-nature');
if (ecoTritonas) ecoTritonas.classList.remove('active');
const ecoNerofido = document.getElementById('nerofido-eco-nature');
if (ecoNerofido) ecoNerofido.classList.remove('active');
const seaCrab = document.getElementById('crab-sea-nature');
if (seaCrab) seaCrab.classList.remove('active');
const seaDolphins = document.getElementById('dolphins-sea-nature');
if (seaDolphins) seaDolphins.classList.remove('active');
const avoketa = document.getElementById('avocet-anim');
if (avoketa) avoketa.classList.remove('active');
const dipper = document.getElementById('dipper-anim');
if (dipper) dipper.classList.remove('active');
const seaGullHide = document.getElementById('gull-sea-nature');
if (seaGullHide) seaGullHide.classList.remove('active');
const seaSchool = document.getElementById('school-sea-nature');
if (seaSchool) seaSchool.classList.remove('active');
const seaSealHide = document.getElementById('seal-sea-nature');
if (seaSealHide) seaSealHide.classList.remove('active');
const ecoAlkyoniHide = document.getElementById('alkyoni-eco-nature');
if (ecoAlkyoniHide) ecoAlkyoniHide.classList.remove('active');
const ecoSquirrelHide = document.getElementById('squirrel-eco-nature');
if (ecoSquirrelHide) ecoSquirrelHide.classList.remove('active');
const ecoMustangHide = document.getElementById('mustang-eco-nature');
if (ecoMustangHide) ecoMustangHide.classList.remove('active');
const ecoOwlHide = document.getElementById('owl-eco-nature');
if (ecoOwlHide) ecoOwlHide.classList.remove('active');
const ecoFireflyHide = document.getElementById('firefly-eco-nature');
if (ecoFireflyHide) ecoFireflyHide.classList.remove('active');
const ecoHedgehogHide = document.getElementById('hedgehog-eco-nature');
if (ecoHedgehogHide) ecoHedgehogHide.classList.remove('active');
        button2.innerHTML = "✨Φώτισε όλα τα Μονοπάτια!";
const hydra = document.getElementById('hydra-monster');
        if (hydra) hydra.classList.remove('active');
        mapState2 = 2;
    } 
    // Στάδιο 2: Όλα τα κανονικά
    else if (mapState2 === 2) {
if(document.getElementById('monsters-only-btn')) document.getElementById('monsters-only-btn').style.display = 'none';
        allBanners2.forEach(b => {
            const isSpecial = b.classList.contains('mythic-banner') || b.classList.contains('eco-banner');
            b.classList.toggle('visible-group', !isSpecial);
            b.classList.toggle('hidden-group', isSpecial);
        });
// Εξαφάνιση του Κράκεν (για σιγουριά)
        const kraken = document.getElementById('kraken-monster');
        if (kraken) kraken.classList.remove('active');
document.getElementById('stym-monster').classList.remove('active');
document.getElementById('sirens-monster').classList.remove('active');
const chimera = document.getElementById('chimera-monster');
        if (chimera) chimera.classList.remove('active');
const echidna = document.getElementById('echidna-monster');
        if (echidna) echidna.classList.remove('active');
const charybdis = document.getElementById('charybdis-monster');
        if (charybdis) charybdis.classList.remove('active');
const harpies = document.getElementById('harpies-monster');
        if (harpies) harpies.classList.remove('active');
const cerberus = document.getElementById('cerberus-monster');
        if (cerberus) cerberus.classList.remove('active');
const scylla = document.getElementById('scylla-monster');
        if (scylla) scylla.classList.remove('active');
const centaurs = document.getElementById('centaurs-monster');
        if (centaurs) centaurs.classList.remove('active');
const hydra = document.getElementById('hydra-monster');
        if (hydra) hydra.classList.remove('active');
        const cetus = document.getElementById('cetus-monster');
        if (cetus) cetus.classList.remove('active');
const aloadae = document.getElementById('aloadae-monster');
        if (aloadae) aloadae.classList.remove('active');
const typhon = document.getElementById('typhon-monster');
        if (typhon) typhon.classList.remove('active');
const macedonianLion = document.getElementById('macedonian-lion-monster');
        if (macedonianLion) macedonianLion.classList.remove('active');
const telchines = document.getElementById('telchines-monster');
        if (telchines) telchines.classList.remove('active');
const talos = document.getElementById('talos-monster');
        if (talos) talos.classList.remove('active');
const cyclops = document.getElementById('cyclops-monster');
        if (cyclops) cyclops.classList.remove('active');
const medusa = document.getElementById('medusa-monster');
if (medusa) medusa.classList.remove('active');
const boar = document.getElementById('calydonian-boar-monster');
        if (boar) boar.classList.remove('active');
const lycaon = document.getElementById('lycaon-monster');
        if (lycaon) lycaon.classList.remove('active');
const minotaur = document.getElementById('minotaur-monster');
        if (minotaur) minotaur.classList.remove('active');
const charon = document.getElementById('charon-monster');
        if (charon) charon.classList.remove('active');
const bronzeBull = document.getElementById('bronze-bull-monster');
        if (bronzeBull) bronzeBull.classList.remove('active');
const arachne = document.getElementById('arachne-monster');
        if (arachne) arachne.classList.remove('active');
const ultimateStorm = document.getElementById('ultimate-storm-monster');
        if (ultimateStorm) ultimateStorm.classList.remove('active');
const pegasus = document.getElementById('pegasus-monster');
        if (pegasus) pegasus.classList.remove('active');
const sphinx = document.getElementById('sphinx-monster');
        if (sphinx) sphinx.classList.remove('active');
const colchian = document.getElementById('colchian-monster');
        if (colchian) colchian.classList.remove('active');
const eagle = document.getElementById('eagle-anim');
if (eagle) eagle.classList.remove('active');
const flamingos = document.getElementById('flamingos-anim');
if (flamingos) flamingos.classList.remove('active');
const chamois = document.getElementById('chamois-anim');
if (chamois) chamois.classList.remove('active');
const turtle = document.getElementById('turtle-anim');
if (turtle) turtle.classList.remove('active');
const bear = document.getElementById('bear-anim');
if (bear) bear.classList.remove('active');
const otter = document.getElementById('otter-anim');
if (otter) otter.classList.remove('active');
const boarNew = document.getElementById('boar-anim-new');
if (boarNew) boarNew.classList.remove('active');
const woodpecker = document.getElementById('woodpecker-nature');
if (woodpecker) woodpecker.classList.remove('active');
const roeDeer = document.getElementById('roe-deer-nature');
if (roeDeer) roeDeer.classList.remove('active');
const salamander = document.getElementById('salamander-anim');
if (salamander) salamander.classList.remove('active');
const ecoFox = document.getElementById('fox-eco-nature');
if (ecoFox) ecoFox.classList.remove('active');
const ecoPelican = document.getElementById('pelican-eco-nature');
if (ecoPelican) ecoPelican.classList.remove('active');
const ecoTritonas = document.getElementById('tritonas-eco-nature');
if (ecoTritonas) ecoTritonas.classList.remove('active');
const ecoNerofido = document.getElementById('nerofido-eco-nature');
if (ecoNerofido) ecoNerofido.classList.remove('active');
const seaCrab = document.getElementById('crab-sea-nature');
if (seaCrab) seaCrab.classList.remove('active');
const seaDolphins = document.getElementById('dolphins-sea-nature');
if (seaDolphins) seaDolphins.classList.remove('active');
const avoketa = document.getElementById('avocet-anim');
if (avoketa) avoketa.classList.remove('active');
const dipper = document.getElementById('dipper-anim');
if (dipper) dipper.classList.remove('active');
const seaGullHide = document.getElementById('gull-sea-nature');
if (seaGullHide) seaGullHide.classList.remove('active');
const seaSchool = document.getElementById('school-sea-nature');
if (seaSchool) seaSchool.classList.remove('active');
const seaSealHide = document.getElementById('seal-sea-nature');
if (seaSealHide) seaSealHide.classList.remove('active');
const ecoAlkyoniHide = document.getElementById('alkyoni-eco-nature');
if (ecoAlkyoniHide) ecoAlkyoniHide.classList.remove('active');
const ecoSquirrelHide = document.getElementById('squirrel-eco-nature');
if (ecoSquirrelHide) ecoSquirrelHide.classList.remove('active');
const ecoMustangHide = document.getElementById('mustang-eco-nature');
if (ecoMustangHide) ecoMustangHide.classList.remove('active');
const ecoOwlHide = document.getElementById('owl-eco-nature');
if (ecoOwlHide) ecoOwlHide.classList.remove('active');
const ecoFireflyHide = document.getElementById('firefly-eco-nature');
if (ecoFireflyHide) ecoFireflyHide.classList.remove('active');
const ecoHedgehogHide = document.getElementById('hedgehog-eco-nature');
if (ecoHedgehogHide) ecoHedgehogHide.classList.remove('active');
        button2.innerHTML = "⚡ Μυθική Πιερία!";
    mapState2 = 3;
} 
// Στάδιο 3: Μόνο τα Μυθικά
else if (mapState2 === 3) {
    
    // 👇 ΕΔΩ ΕΓΙΝΕ Η ΑΛΛΑΓΗ (Εμφάνιση ΚΑΙ reset του κειμένου σε "ΜΟΝΟ ΤΕΡΑΤΑ")
    if (document.getElementById('monsters-only-btn')) {
        document.getElementById('monsters-only-btn').style.display = 'block';
        document.getElementById('monsters-only-btn').innerHTML = 'ΜΟΝΟ ΤΕΡΑΤΑ';
    }

    allBanners2.forEach(b => {
        const isMythic = b.classList.contains('mythic-banner');
        b.classList.toggle('visible-group', isMythic);
        b.classList.toggle('hidden-group', !isMythic);
    });
const kraken = document.getElementById('kraken-monster');
        if (kraken) kraken.classList.add('active');
document.getElementById('stym-monster').classList.add('active');
document.getElementById('sirens-monster').classList.add('active');
const chimera = document.getElementById('chimera-monster');
        if (chimera) chimera.classList.add('active');
const echidna = document.getElementById('echidna-monster');
        if (echidna) echidna.classList.add('active');
const charybdis = document.getElementById('charybdis-monster');
        if (charybdis) charybdis.classList.add('active');
const harpies = document.getElementById('harpies-monster');
        if (harpies) harpies.classList.add('active');
const cerberus = document.getElementById('cerberus-monster');
        if (cerberus) cerberus.classList.add('active');
const scylla = document.getElementById('scylla-monster');
        if (scylla) scylla.classList.add('active');
const centaurs = document.getElementById('centaurs-monster');
        if (centaurs) centaurs.classList.add('active');
const hydra = document.getElementById('hydra-monster');
        if (hydra) hydra.classList.add('active');
        const cetus = document.getElementById('cetus-monster');
        if (cetus) cetus.classList.add('active');
const aloadae = document.getElementById('aloadae-monster');
        if (aloadae) aloadae.classList.add('active');
const typhon = document.getElementById('typhon-monster');
        if (typhon) typhon.classList.add('active');
const macedonianLion = document.getElementById('macedonian-lion-monster');
        if (macedonianLion) macedonianLion.classList.add('active');
const telchines = document.getElementById('telchines-monster');
        if (telchines) telchines.classList.add('active');
const talos = document.getElementById('talos-monster');
        if (talos) talos.classList.add('active');
const cyclops = document.getElementById('cyclops-monster');
        if (cyclops) cyclops.classList.add('active');
const medusa = document.getElementById('medusa-monster');
if (medusa) medusa.classList.add('active');
const boar = document.getElementById('calydonian-boar-monster');
        if (boar) boar.classList.add('active');
const lycaon = document.getElementById('lycaon-monster');
        if (lycaon) lycaon.classList.add('active');
const minotaur = document.getElementById('minotaur-monster');
        if (minotaur) minotaur.classList.add('active');
const charon = document.getElementById('charon-monster');
        if (charon) charon.classList.add('active');
const bronzeBull = document.getElementById('bronze-bull-monster');
        if (bronzeBull) bronzeBull.classList.add('active');
const arachne = document.getElementById('arachne-monster');
        if (arachne) arachne.classList.add('active');
const ultimateStorm = document.getElementById('ultimate-storm-monster');
        if (ultimateStorm) ultimateStorm.classList.add('active');
const pegasus = document.getElementById('pegasus-monster');
        if (pegasus) pegasus.classList.add('active');
const sphinx = document.getElementById('sphinx-monster');
        if (sphinx) sphinx.classList.add('active');
const colchian = document.getElementById('colchian-monster');
        if (colchian) colchian.classList.add('active');
const eagle = document.getElementById('eagle-anim');
if (eagle) eagle.classList.remove('active');
const flamingos = document.getElementById('flamingos-anim');
if (flamingos) flamingos.classList.remove('active');
const chamois = document.getElementById('chamois-anim');
if (chamois) chamois.classList.remove('active');
const turtle = document.getElementById('turtle-anim');
if (turtle) turtle.classList.remove('active');
const bear = document.getElementById('bear-anim');
if (bear) bear.classList.remove('active');
const otter = document.getElementById('otter-anim');
if (otter) otter.classList.remove('active');
const boarNew = document.getElementById('boar-anim-new');
if (boarNew) boarNew.classList.remove('active');
const woodpecker = document.getElementById('woodpecker-nature');
if (woodpecker) woodpecker.classList.remove('active');
const roeDeer = document.getElementById('roe-deer-nature');
if (roeDeer) roeDeer.classList.remove('active');
const salamander = document.getElementById('salamander-anim');
if (salamander) salamander.classList.remove('active');
const ecoFox = document.getElementById('fox-eco-nature');
if (ecoFox) ecoFox.classList.remove('active');
const ecoPelican = document.getElementById('pelican-eco-nature');
if (ecoPelican) ecoPelican.classList.remove('active');
const ecoTritonas = document.getElementById('tritonas-eco-nature');
if (ecoTritonas) ecoTritonas.classList.remove('active');
const ecoNerofido = document.getElementById('nerofido-eco-nature');
if (ecoNerofido) ecoNerofido.classList.remove('active');
const seaCrab = document.getElementById('crab-sea-nature');
if (seaCrab) seaCrab.classList.remove('active');
const seaDolphins = document.getElementById('dolphins-sea-nature');
if (seaDolphins) seaDolphins.classList.remove('active');
const avoketa = document.getElementById('avocet-anim');
if (avoketa) avoketa.classList.remove('active');
const dipper = document.getElementById('dipper-anim');
if (dipper) dipper.classList.remove('active');
const seaGullHide = document.getElementById('gull-sea-nature');
if (seaGullHide) seaGullHide.classList.remove('active');
const seaSchool = document.getElementById('school-sea-nature');
if (seaSchool) seaSchool.classList.remove('active');
const seaSealHide = document.getElementById('seal-sea-nature');
if (seaSealHide) seaSealHide.classList.remove('active');
const ecoAlkyoniHide = document.getElementById('alkyoni-eco-nature');
if (ecoAlkyoniHide) ecoAlkyoniHide.classList.remove('active');
const ecoSquirrelHide = document.getElementById('squirrel-eco-nature');
if (ecoSquirrelHide) ecoSquirrelHide.classList.remove('active');
const ecoMustangHide = document.getElementById('mustang-eco-nature');
if (ecoMustangHide) ecoMustangHide.classList.remove('active');
const ecoOwlHide = document.getElementById('owl-eco-nature');
if (ecoOwlHide) ecoOwlHide.classList.remove('active');
const ecoFireflyHide = document.getElementById('firefly-eco-nature');
if (ecoFireflyHide) ecoFireflyHide.classList.remove('active');
const ecoHedgehogHide = document.getElementById('hedgehog-eco-nature');
if (ecoHedgehogHide) ecoHedgehogHide.classList.remove('active');
        button2.innerHTML = "🌿Τα Μυστικά της Φύσης!"; // Προστέθηκε το κουμπί για το επόμενο βήμα!
        mapState2 = 4;
    }
    // Στάδιο 4: Μόνο τα Οικολογικά (ΝΕΟ ΒΗΜΑ)
    else if (mapState2 === 4) {
if(document.getElementById('monsters-only-btn')) document.getElementById('monsters-only-btn').style.display = 'none';
        allBanners2.forEach(b => {
            const isEco = b.classList.contains('eco-banner');
            b.classList.toggle('visible-group', isEco);
            b.classList.toggle('hidden-group', !isEco);
        });
// Εξαφάνιση του Κράκεν
        const kraken = document.getElementById('kraken-monster');
        if (kraken) kraken.classList.remove('active');
document.getElementById('stym-monster').classList.remove('active');
document.getElementById('sirens-monster').classList.remove('active');
const chimera = document.getElementById('chimera-monster');
        if (chimera) chimera.classList.remove('active');
const echidna = document.getElementById('echidna-monster');
        if (echidna) echidna.classList.remove('active');
const charybdis = document.getElementById('charybdis-monster');
        if (charybdis) charybdis.classList.remove('active');
const harpies = document.getElementById('harpies-monster');
        if (harpies) harpies.classList.remove('active');
const cerberus = document.getElementById('cerberus-monster');
        if (cerberus) cerberus.classList.remove('active');
const scylla = document.getElementById('scylla-monster');
        if (scylla) scylla.classList.remove('active');
const centaurs = document.getElementById('centaurs-monster');
        if (centaurs) centaurs.classList.remove('active');
const hydra = document.getElementById('hydra-monster');
        if (hydra) hydra.classList.remove('active');
        const cetus = document.getElementById('cetus-monster');
        if (cetus) cetus.classList.remove('active');
const aloadae = document.getElementById('aloadae-monster');
        if (aloadae) aloadae.classList.remove('active');
const typhon = document.getElementById('typhon-monster');
        if (typhon) typhon.classList.remove('active');
const macedonianLion = document.getElementById('macedonian-lion-monster');
        if (macedonianLion) macedonianLion.classList.remove('active');
const telchines = document.getElementById('telchines-monster');
        if (telchines) telchines.classList.remove('active');
const talos = document.getElementById('talos-monster');
        if (talos) talos.classList.remove('active');
const cyclops = document.getElementById('cyclops-monster');
        if (cyclops) cyclops.classList.remove('active');
const medusa = document.getElementById('medusa-monster');
if (medusa) medusa.classList.remove('active');
const boar = document.getElementById('calydonian-boar-monster');
        if (boar) boar.classList.remove('active');
const lycaon = document.getElementById('lycaon-monster');
        if (lycaon) lycaon.classList.remove('active');
const minotaur = document.getElementById('minotaur-monster');
        if (minotaur) minotaur.classList.remove('active');
const charon = document.getElementById('charon-monster');
        if (charon) charon.classList.remove('active');
const bronzeBull = document.getElementById('bronze-bull-monster');
        if (bronzeBull) bronzeBull.classList.remove('active');
const arachne = document.getElementById('arachne-monster');
        if (arachne) arachne.classList.remove('active');
const ultimateStorm = document.getElementById('ultimate-storm-monster');
        if (ultimateStorm) ultimateStorm.classList.remove('active');
const pegasus = document.getElementById('pegasus-monster');
        if (pegasus) pegasus.classList.remove('active');
const sphinx = document.getElementById('sphinx-monster');
        if (sphinx) sphinx.classList.remove('active');
const colchian = document.getElementById('colchian-monster');
        if (colchian) colchian.classList.remove('active');
const eagle = document.getElementById('eagle-anim');
if (eagle) eagle.classList.add('active');
const flamingos = document.getElementById('flamingos-anim'); 
if (flamingos) flamingos.classList.add('active');
const chamois = document.getElementById('chamois-anim');
if (chamois) chamois.classList.add('active');
const turtle = document.getElementById('turtle-anim');
if (turtle) turtle.classList.add('active');
const bear = document.getElementById('bear-anim');
if (bear) bear.classList.add('active');
const otter = document.getElementById('otter-anim');
if (otter) otter.classList.add('active');
const boarNew = document.getElementById('boar-anim-new');
    if (boarNew) boarNew.classList.add('active');
const woodpecker = document.getElementById('woodpecker-nature');
if (woodpecker) woodpecker.classList.add('active');
const roeDeer = document.getElementById('roe-deer-nature');
if (roeDeer) roeDeer.classList.add('active');
const salamander = document.getElementById('salamander-anim');
if (salamander) salamander.classList.add('active');
const ecoFox = document.getElementById('fox-eco-nature');
if (ecoFox) ecoFox.classList.add('active');
const ecoPelican = document.getElementById('pelican-eco-nature');
if (ecoPelican) ecoPelican.classList.add('active');
const ecoTritonas = document.getElementById('tritonas-eco-nature');
if (ecoTritonas) ecoTritonas.classList.add('active');
const ecoNerofido = document.getElementById('nerofido-eco-nature');
if (ecoNerofido) ecoNerofido.classList.add('active');
const seaCrab = document.getElementById('crab-sea-nature');
if (seaCrab) seaCrab.classList.add('active');
const seaDolphins = document.getElementById('dolphins-sea-nature');
if (seaDolphins) seaDolphins.classList.add('active');
const avoketa = document.getElementById('avocet-anim');
if (avoketa) avoketa.classList.add('active');
const dipper = document.getElementById('dipper-anim');
if (dipper) dipper.classList.add('active');
const seaGull = document.getElementById('gull-sea-nature');
if (seaGull) seaGull.classList.add('active');
const seaSchool = document.getElementById('school-sea-nature');
if (seaSchool) seaSchool.classList.add('active');
const seaSeal = document.getElementById('seal-sea-nature');
if (seaSeal) seaSeal.classList.add('active');
const ecoAlkyoni = document.getElementById('alkyoni-eco-nature');
if (ecoAlkyoni) ecoAlkyoni.classList.add('active');
const ecoSquirrel = document.getElementById('squirrel-eco-nature');
if (ecoSquirrel) ecoSquirrel.classList.add('active');
const ecoMustang = document.getElementById('mustang-eco-nature');
if (ecoMustang) ecoMustang.classList.add('active');
const ecoOwl = document.getElementById('owl-eco-nature');
if (ecoOwl) ecoOwl.classList.add('active');
const ecoFirefly = document.getElementById('firefly-eco-nature');
if (ecoFirefly) ecoFirefly.classList.add('active');
const ecoHedgehog = document.getElementById('hedgehog-eco-nature');
if (ecoHedgehog) ecoHedgehog.classList.add('active');
        button2.innerHTML = "🔄 Επαναφορά στην Αρχή!";
        mapState2 = 5;
    }
    // Στάδιο 5: Αρχική (Group A)
    else {
if(document.getElementById('monsters-only-btn')) document.getElementById('monsters-only-btn').style.display = 'none';
        allBanners2.forEach(b => {
            const isMythic = b.classList.contains('mythic-banner');
            const isEco = b.classList.contains('eco-banner');
            const isA = groupA2.some(p => (b.getAttribute('onclick')||'').includes("'" + p + "'"));
            b.classList.toggle('visible-group', isA && !isMythic && !isEco);
            b.classList.toggle('hidden-group', !isA || isMythic || isEco);
        });
// Εξαφάνιση του Κράκεν στην επαναφορά
        const kraken = document.getElementById('kraken-monster');
        if (kraken) kraken.classList.remove('active');
document.getElementById('stym-monster').classList.remove('active');
document.getElementById('sirens-monster').classList.remove('active');
const chimera = document.getElementById('chimera-monster');
        if (chimera) chimera.classList.remove('active');
const echidna = document.getElementById('echidna-monster');
        if (echidna) echidna.classList.remove('active');
const charybdis = document.getElementById('charybdis-monster');
        if (charybdis) charybdis.classList.remove('active');
const harpies = document.getElementById('harpies-monster');
        if (harpies) harpies.classList.remove('active');
const cerberus = document.getElementById('cerberus-monster');
        if (cerberus) cerberus.classList.remove('active');
const scylla = document.getElementById('scylla-monster');
        if (scylla) scylla.classList.remove('active');
const centaurs = document.getElementById('centaurs-monster');
        if (centaurs) centaurs.classList.remove('active');
const hydra = document.getElementById('hydra-monster');
        if (hydra) hydra.classList.remove('active');
        const cetus = document.getElementById('cetus-monster');
        if (cetus) cetus.classList.remove('active');
const aloadae = document.getElementById('aloadae-monster');
        if (aloadae) aloadae.classList.remove('active');
const typhon = document.getElementById('typhon-monster');
        if (typhon) typhon.classList.remove('active');
const macedonianLion = document.getElementById('macedonian-lion-monster');
        if (macedonianLion) macedonianLion.classList.remove('active');
const telchines = document.getElementById('telchines-monster');
        if (telchines) telchines.classList.remove('active');
const talos = document.getElementById('talos-monster');
        if (talos) talos.classList.remove('active');
const cyclops = document.getElementById('cyclops-monster');
        if (cyclops) cyclops.classList.remove('active');
const medusa = document.getElementById('medusa-monster');
if (medusa) medusa.classList.remove('active');
const boar = document.getElementById('calydonian-boar-monster');
        if (boar) boar.classList.remove('active');
const lycaon = document.getElementById('lycaon-monster');
        if (lycaon) lycaon.classList.remove('active');
const minotaur = document.getElementById('minotaur-monster');
        if (minotaur) minotaur.classList.remove('active');
const charon = document.getElementById('charon-monster');
        if (charon) charon.classList.remove('active');
const bronzeBull = document.getElementById('bronze-bull-monster');
        if (bronzeBull) bronzeBull.classList.remove('active');
const arachne = document.getElementById('arachne-monster');
        if (arachne) arachne.classList.remove('active');
const ultimateStorm = document.getElementById('ultimate-storm-monster');
        if (ultimateStorm) ultimateStorm.classList.remove('active');
const pegasus = document.getElementById('pegasus-monster');
        if (pegasus) pegasus.classList.remove('active');
const sphinx = document.getElementById('sphinx-monster');
        if (sphinx) sphinx.classList.remove('active');
const colchian = document.getElementById('colchian-monster');
        if (colchian) colchian.classList.remove('active');
const eagle = document.getElementById('eagle-anim');
if (eagle) eagle.classList.remove('active');
const flamingos = document.getElementById('flamingos-anim');
if (flamingos) flamingos.classList.remove('active');
const chamois = document.getElementById('chamois-anim');
if (chamois) chamois.classList.remove('active');
const turtle = document.getElementById('turtle-anim');
if (turtle) turtle.classList.remove('active');
const bear = document.getElementById('bear-anim');
if (bear) bear.classList.remove('active');
const otter = document.getElementById('otter-anim');
if (otter) otter.classList.remove('active');
const boarNew = document.getElementById('boar-anim-new');
if (boarNew) boarNew.classList.remove('active');
const woodpecker = document.getElementById('woodpecker-nature');
if (woodpecker) woodpecker.classList.remove('active');
const roeDeer = document.getElementById('roe-deer-nature');
if (roeDeer) roeDeer.classList.remove('active');
const salamander = document.getElementById('salamander-anim');
if (salamander) salamander.classList.remove('active');
const ecoFox = document.getElementById('fox-eco-nature');
if (ecoFox) ecoFox.classList.remove('active');
const ecoPelican = document.getElementById('pelican-eco-nature');
if (ecoPelican) ecoPelican.classList.remove('active');
const ecoTritonas = document.getElementById('tritonas-eco-nature');
if (ecoTritonas) ecoTritonas.classList.remove('active');
const ecoNerofido = document.getElementById('nerofido-eco-nature');
if (ecoNerofido) ecoNerofido.classList.remove('active');
const seaCrab = document.getElementById('crab-sea-nature');
if (seaCrab) seaCrab.classList.remove('active');
const seaDolphins = document.getElementById('dolphins-sea-nature');
if (seaDolphins) seaDolphins.classList.remove('active');
const avoketa = document.getElementById('avocet-anim');
if (avoketa) avoketa.classList.remove('active');
const dipper = document.getElementById('dipper-anim');
if (dipper) dipper.classList.remove('active');
const seaGullHide = document.getElementById('gull-sea-nature');
if (seaGullHide) seaGullHide.classList.remove('active');
const seaSchool = document.getElementById('school-sea-nature');
if (seaSchool) seaSchool.classList.remove('active');
const seaSealHide = document.getElementById('seal-sea-nature');
if (seaSealHide) seaSealHide.classList.remove('active');
const ecoAlkyoniHide = document.getElementById('alkyoni-eco-nature');
if (ecoAlkyoniHide) ecoAlkyoniHide.classList.remove('active');
const ecoSquirrelHide = document.getElementById('squirrel-eco-nature');
if (ecoSquirrelHide) ecoSquirrelHide.classList.remove('active');
const ecoMustangHide = document.getElementById('mustang-eco-nature');
if (ecoMustangHide) ecoMustangHide.classList.remove('active');
const ecoOwlHide = document.getElementById('owl-eco-nature');
if (ecoOwlHide) ecoOwlHide.classList.remove('active');
const ecoFireflyHide = document.getElementById('firefly-eco-nature');
if (ecoFireflyHide) ecoFireflyHide.classList.remove('active');
const ecoHedgehogHide = document.getElementById('hedgehog-eco-nature');
if (ecoHedgehogHide) ecoHedgehogHide.classList.remove('active');
        button2.innerHTML = "🗺️ Ανακάλυψε τα υπόλοιπα!";
        mapState2 = 1;
    }
}

// Δίνουμε 0.3 δευτερόλεπτα χρόνο στον browser να "χτίσει" τον 2ο χάρτη
setTimeout(function() {
    toggleBanners2(true);
}, 300);
// 👆 ΕΔΩ ΤΕΛΕΙΩΝΕΙ Ο ΚΩΔΙΚΑΣ ΓΙΑ ΤΟΝ 2Ο ΧΑΡΤΗ 👆
// Αυτόματο Preloading όλων των εικόνων του χάρτη για ακαριαία εμφάνιση
window.addEventListener('load', function() {
    Object.values(mythicData).forEach(place => {
        if (place.img) {
            const imgCache = new Image();
            imgCache.src = place.img;
        }
    });
});


// === ΕΝΕΡΓΟΠΟΙΗΣΗ PANZOOM ΜΕ ΠΡΟΣΤΑΣΙΑ ΓΙΑ ΤΑ ΚΛΙΚ ===
const mapAreaPanzoom = document.getElementById('map-area-2');
const zoomWrapper = mapAreaPanzoom.parentElement;

const panzoom = Panzoom(mapAreaPanzoom, {
    maxScale: 2.5,
    minScale: 1,
    contain: 'none',
    step: 0.3,
    pinchSpeed: 1,
    excludeClass: 't-banner' 

});

// Επιτρέπει το zoom με το ροδάκι
zoomWrapper.addEventListener('wheel', panzoom.zoomWithWheel);

// Ακριβής διαχωρισμός Drag και Click
let startX, startY;
let isDragging = false;

mapAreaPanzoom.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = false; 
    mapAreaPanzoom.style.setProperty('cursor', 'grabbing', 'important');
});

mapAreaPanzoom.addEventListener('pointerup', (e) => {
    // Επαναφέρει το κλασικό βελάκι στον χάρτη μόλις αφήνεις το κλικ
    mapAreaPanzoom.style.setProperty('cursor', 'default', 'important');
    
    const diffX = Math.abs(e.clientX - startX);
    const diffY = Math.abs(e.clientY - startY);
    
    if (diffX > 7 || diffY > 7) {
        isDragging = true;
    }
});

// --- ΝΕΑ ΒΕΛΤΙΣΤΟΠΟΙΗΣΗ: "Ξεκούραση" του επεξεργαστή κατά την κίνηση ---
mapAreaPanzoom.addEventListener('panzoomstart', () => {
    // Απενεργοποιούμε τα events ΜΟΝΟ στα banner όσο κινούμαστε, όχι σε όλο τον χάρτη
    document.querySelectorAll('.t-banner').forEach(banner => {
        banner.style.pointerEvents = 'none';
    });
});

mapAreaPanzoom.addEventListener('panzoomend', () => {
    // Τα επαναφέρουμε στα banner μόλις σταματήσει η κίνηση
    document.querySelectorAll('.t-banner').forEach(banner => {
        banner.style.pointerEvents = 'auto';
    });
});
function showOnlyMonsters() {
    // 1. Κλείνουμε το tooltip αν είναι ανοιχτό
    hidePlace();

    // 👇 ΕΔΩ ΗΤΑΝ ΤΟ ΛΑΘΟΣ: Προσθέσαμε τον ορισμό του κουμπιού για να ξέρει ο κώδικας ποιο είναι!
    const btn = document.getElementById('monsters-only-btn');
    if (!btn) return;

    const map2Area = document.getElementById('map-area-2');
    if (!map2Area) return;
    const allBanners2 = map2Area.querySelectorAll('.t-banner');

    // === ΑΝ ΤΟ ΚΟΥΜΠΙ ΓΡΑΦΕΙ "ΕΠΑΝΑΦΟΡΑ", ΓΥΡΝΑ ΚΑΙ ΔΕΙΞΕ ΟΛΑ ΤΑ ΜΥΘΙΚΑ ===
    if (btn.innerHTML === "ΕΠΑΝΑΦΟΡΑ") {
        allBanners2.forEach(b => {
            if (b.classList.contains('mythic-banner')) {
                b.classList.remove('hidden-group');
                b.classList.add('visible-group');
            } else {
                b.classList.remove('visible-group');
                b.classList.add('hidden-group');
            }
        });
        btn.innerHTML = "ΜΟΝΟ ΤΕΡΑΤΑ"; // Ξαναγυρίζει το όνομα
        return; // Σταματάει εδώ, δεν προχωράει στα τέρατα
    }

    // === ΑΛΛΙΩΣ, ΚΑΝΕ ΤΟ ΦΙΛΤΡΑΡΙΣΜΑ ΓΙΑ ΤΑ ΤΕΡΑΤΑ ===
    // 2. Η λίστα με τα ID των τεράτων (Βγάλαμε τελείως το 'skoteina')
    const monsterPlaceIDs = [
        'mythic_kraken', 'mythic_chimera', 'mythic_echidna', 
        'mythic_charybdis', 'mythic_harpies', 'mythic_cerberus', 'mythic_scylla', 
        'mythic_centaurs', 'mythic_cetus', 'mythic_typhon', 'mythic_hydra', 
        'mythic_telchines', 'mythic_lions', 'mythic_stymphalian'
    ];

    // 3. Σκανάρουμε ΟΛΑ τα banners του χάρτη ανεξαιρέτως
    allBanners2.forEach(b => {
        const onclickText = b.getAttribute('onclick') || '';
        
        // Ελέγχουμε αν το onclick περιέχει κάποιο από τα τέρατα
        const isMonster = monsterPlaceIDs.some(id => onclickText.includes("'" + id + "'"));

        if (isMonster) {
            b.classList.remove('hidden-group');
            b.classList.add('visible-group');
        } else {
            b.classList.remove('visible-group');
            b.classList.add('hidden-group');
        }
    });

    // 4. Ενεργοποιούμε τα SVG animations των τεράτων
    const monstersSVG = [
        'kraken-monster', 'stym-monster', 'sirens-monster', 'chimera-monster', 
        'echidna-monster', 'charybdis-monster', 'harpies-monster', 'cerberus-monster', 
        'scylla-monster', 'centaurs-monster', 'cetus-monster', 'aloadae-monster', 
        'typhon-monster', 'macedonian-lion-monster', 'telchines-monster', 'hydra-monster'
    ];

    monstersSVG.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    });

    // Αλλάζουμε το κείμενο σε ΕΠΑΝΑΦΟΡΑ για το επόμενο κλικ
    btn.innerHTML = "ΕΠΑΝΑΦΟΡΑ";
}
