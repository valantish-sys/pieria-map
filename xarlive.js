(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  const CONFIG = Object.freeze({
    audioUrl: "https://grafis.sch.gr/index.php/s/fMEcaLWSZxManpy/download",
    audioFadeDelay: 6000,     // Πόσο θα παίξει πριν αρχίσει το fade out
    audioFadeStepMs: 200,     // Κάθε πότε μειώνεται η ένταση
    audioFadeDrop: 0.1,       // Πόσο μειώνεται η ένταση ανά βήμα
    groupA: ['peristasi', 'olympus', 'katerini', 'platamonas', 'aiginio', 'pydna', 'elatochori', 'litochoro', 'kolindros', 'kontariotissa', 'milia'],
    groupB: ['alykes', 'livadi', 'ryakia', 'paralia', 'dion', 'agiosdimitrios', 'panteleimonas', 'leptokarya', 'anoskotina', 'korinos']
  });

  const STATE = {
    audio: new Audio(CONFIG.audioUrl),
    isSoundOn: true,
    mapState: 3,              // 1: Group B, 2: Όλα, 3: Group A
    audioTimeout: null,
    fadeInterval: null
  };

  // ==========================================
  // 2. DATABASE (Εδώ βάζεις τα δεδομένα σου)
  // ==========================================
  // Βάλε εδώ μέσα όλο το περιεχόμενο του placesData1 που έχεις
  window.PLACES_DB = {
    olympus: { title: " Όρος Όλυμπος ⛰️", desc: "Η υψηλότερη κορυφή (2.918μ). Κατοικία των αρχαίων θεών, τυλιγμένη στην ομίχλη των μύθων.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi79_Nh1GTS4KGAJZPOYbawFK_aeBSxCMO_Tb6KYv6JsIHlUZauPd0mk_rTK61uodHVvDu7f57ptOpsZrM8NC19x-EnRBbIp-FIYdA8mtmqhQ-D1cTi9H7tq1Us_JHkx9XWqxQXDjMtQHyDZNZRf10foffiu7ps2ley2uY3byh3YRDbfpGHYSruz4T1KuU/w640-h418/2026-07-01%2011_47_56-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
livadi: {
  title: "Λιβάδι Πιερίας 🌲",
  desc: "Το Λιβάδι Πιερίας είναι ένα όμορφο ορεινό χωριό στα Πιέρια Όρη, γνωστό για τα πυκνά δάση οξιάς και βελανιδιάς, το δροσερό κλίμα και τις υπέροχες διαδρομές μέσα στη φύση.",
  img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgvc4JHQx8EfoQv5HbJNbGs_u3Qa5wYNkfSavSHfOnBPsmdUn2zIHupJvSJ0Vfhd8zB1pUAEOWfwL9wvsNJqxCpWOEBUX0HRIwC21FINybKo-ii87_Boi_8Z7musnQfBABG275HjYCIRxoNIK_aPtYbkm6dQ1N03TWUXRyWpiCJtDOZLpCX_nTY1HH3YUA/w640-h352/2026-07-01%2019_51_01-2025-09-25%2018_01_46-World%20of%20Warcraft.png"
},
kolindros: { title: "Έλαφος 🏘️", desc: "Το χωριό Έλαφος είναι ένας ορεινός παράδεισος πνιγμένος στα έλατα και τις καστανιές. Η περιοχή προσφέρει μοναδικές διαδρομές για πεζοπορία μέσα στο δάσος, ενώ η παραδοσιακή αρχιτεκτονική των σπιτιών προσδίδει μια ιδιαίτερη γοητεία.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjxQ9BHLinOBunsr9rzXFw6raIqb93fdw1Yn8UIer37-NYB11ysAblF_-KmiKhlwYT-D91i5hxUyM7g4FQyqrbWM4IzZylA5taYZf4Gw80okzFNCWwcpFqtghKvH9iPmx26bPyUrCC5I3ecuL-1iIqTNoFCRql66LYZbV7RgGgfX_B_2nS0nfAeII8xl4/w640-h394/2026-07-01%2012_14_33-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    elatochori: { title: "Ρητίνη 💧", desc: "Ορεινός οικισμός στα βουνά των Πιερίων, συνδεδεμένος με τη ρητίνη που «κυλά» στις φλέβες των δασών του. Η ρητίνη αποτελεί το αρωματικό αποτύπωμα της περιοχής και σύμβολο του δεσμού του χωριού με το βουνό.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgsbJgSlqcCKp7TiDVJvz9liMJM0-3xxyH_gWd1EO6TzNqxw2RxDHr2wVqMQrsi44tWN0T7Zo0l1y1IVd47dNfp04OJJviHXBQb99RIKfBcs5eVfZyOfZDqXwqVWqFzfSx9trWkz1pvhBfcFJT1bYvP8wh5rl_CrrQ9FrgLfE5wuRC9D8_TVRt23uXEgDk/w640-h354/2026-07-01%2012_01_33-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
ryakia: {
  title: "Ρυάκια Πιερίας 🌿",
  desc: "Τα Ρυάκια είναι ένα γραφικό χωριό στους πρόποδες των Πιερίων, περιτριγυρισμένο από πλούσια βλάστηση και μικρά ρέματα που χάρισαν το όνομά του. Ξεχωρίζει για το φυσικό του τοπίο, την ηρεμία και την παραδοσιακή μακεδονική ατμόσφαιρα.",
  img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixYZhuGSxTF5BVCbFYEF83ACGzPB5XMnobb96VTQ9U9cuETXFe-zhPwEY8bd0aoOw8lsuPOeZwfVENRaZukbJhS6NAC2TQQvqhNDAU1JUmpfdSu7JHdAtSTV2Rj8OwXZfF1WOsD32UJMNYMiQEjfjcM7_sMWnvlUJAGKd1UZtA4kqRj2T9c_iUWgJR-w0/w400-h363/2026-07-01%2020_04_42-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
agiosdimitrios: { title: "Άγιος Δημήτριος 🏔️", desc: "Ορεινή γοητεία στο πέρασμα για την Ελασσόνα. Πυκνά δάση, παραδοσιακή γαστρονομία και απόλυτη ηρεμία στο στενό της Πέτρας.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhe6RgnJuKKADleEJE9kZ7oS6J822yO3lrC7Eod2Qj-ySChyNBQyQHU0sKmLlw-ugPhZO1VNjebXSsV3um_BHZyQkaIqJPsF_3sO4TkcXJTopF7kdbWJAdcGw3mviTEeLDiavXvGKD5G4WYl1__684ceD3xzRjUSzMFnLAx2wKHklWrSXYWxOmFMBdTAC4/w640-h418/2026-07-01%2011_55_33-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    dion: { title: "Βροντού ☁️", desc: "Εκεί που οι μύθοι συναντούν την πραγματικότητα. Η Βροντού στέκει περήφανη στη βάση του Ολύμπου, τυλιγμένη συχνά στην ομίχλη και το μυστήριο, κρατώντας ζωντανό τον απόηχο των αρχαίων θεών.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiAGS2G5bLqO3wxGjYufABU_w7MgGWHqmuk1D5GSoLch0MPFxEWHLAfUxKisRZl1eALp8cGzZRQ2aa3fGuXgMwV9c-pam_qkiRbLBSS5bQLOl14WwCDhMTxzDuMLYdcCSknj4NvPd6HbEHEUx5gtVHJpEpID766rxz6fL0w5vrIxqCLPfbOFcklwJQnu4Q/w640-h458/2026-07-01%2012_17_47-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    litochoro: { title: "Λιτόχωρο 🏡", desc: "Η πύλη του Ολύμπου. Κωμόπολη χτισμένη στην αρχή του φαραγγιού του Ενιπέα.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgxFrPdPUUOhaefrFkdg6DQ2DlJ3OBiy_fJEkrKxkjWYv7wuVxAGyTCzBgU4lqIDC6AUOwlCXjYjUozuo_cXCxyo5xQZUbHLPgHf5RSw7Ck7eVVpW3qHACE-lzXrdh9ULoGZKwMwgx4uy3uXWIMxfJ8hhkyo0uTFjdcbcRavuN55BcjZ583wjJe9bD8360/w640-h406/2026-07-01%2012_22_28-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    katerini: { title: "Κατερίνη ⚔️", desc: "Η Κατερίνη αρχικά ήταν ένας μικρός οικισμός που χρησίμευε ως σταθμός για τα καραβάνια που μετέφεραν εμπορεύματα στην ευρύτερη περιοχή της Πιερίας.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbT_36jfuor5odbmLNKs8SA3gN3FGBzc2aLf4J3Jo6rniKUs0MmSVK5sudSI27ZyOsM5tbWbkqv-lcZEpuqpMF2H0IkYLpFcicaodoBs-NLGQcqQYlgRZx1y3QcxD5D1fgkwwxnvHEsPKaGwztdtJYI7mEdZ-kg06mHfBwW1oNQbRY3lrzsa5TNkIqS6A/w640-h429/2026-07-01%2015_55_40-%CE%A7%CE%91%CE%A1%CE%A4%CE%97%CE%A3%20%CE%91%CE%9E%CE%99%CE%9F%CE%98%CE%95%CE%91%CE%A4%CE%91.txt%20-%20Notepad.png" },
    peristasi: { title: "📍 ΠΕΡΙΣΤΑΣΗ - Το Οχυρό μας! 🏫", desc: "<b>ΕΔΩ ΕΙΝΑΙ ΤΟ ΣΧΟΛΕΙΟ ΜΑΣ!</b><br><br>Τόπος φιλόξενος, μία ανάσα μακριά από την πόλη μας. Η αρχή κάθε περιπέτειας!", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6On1i6fWBU_PoUOhEmqBQDETC2S3I2QaRfSdZBly5VMGf1-llSLjlNlk0SyP1lnWpMbIPb-mbVixLnhCGE1D4kbfMzYDChqzbMahZz9Mg7APQ-dxsqiT9oHcy_XrX1qj8orKOSwEtCyMerTjclZitEx67z_mjkCa_7PnHaYJHfimFFGP1BAsfNSzEiYw/w640-h322/2026-07-01%2012_27_42-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    paralia: { title: "Παραλία Κατερίνης ⚓", desc: "Η Παραλία Κατερίνης διαθέτει μια εκτεταμένη αμμώδη ακτή με ρηχά, καθαρά νερά, γεγονός που την καθιστά εξαιρετικά φιλική και ασφαλή για οικογένειες με παιδιά.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhkGrhUlftV3ratEWE61I0a5EVAvv6xxa4kJeG514xdTksLADgRln6HsN08WEJFgqz9xk_r6q_3TgR3flf9ReA3v_rkSrNMBuCgB6ElRylakbTNymHvj45iQ0O4DxEsgncVjkdQkj6yQnxSFE4kbovkBsirtzDsqZzzsvLNsxjkPsvHM5keLDj0jrLJU2M/w640-h358/2026-07-01%2015_52_37-%CE%A7%CE%91%CE%A1%CE%A4%CE%97%CE%A3%20%CE%91%CE%9E%CE%99%CE%9F%CE%98%CE%95%CE%91%CE%A4%CE%91.txt%20-%20Notepad.png" },
leptokarya: { title: "Λεπτοκαρυά 🌊", desc: "Εκεί που ο Όλυμπος συναντά το κύμα. Μια απέραντη ακτογραμμή κάτω από τη σκιά του βουνού των θεών, που ενώνει την αλμύρα της θάλασσας με την άγρια ομορφιά της φύσης.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh49Q-chdnAp7QNZvdYf4mkKSpsda-SjEIOwgu3EhH9DFLZsfUHHHCC2UfA7SsRiA6sykhVvJqVLEBwHtcxOEiSW2XveRmMTeWi01jnxBIseYpNpbwVhHea2718D5bwL23YQAMAVe1cpWf50-q8J2ZJkbvz7IYgmtRZmJe8BH1TCPkt20QyVQh3g7gCBIs/w640-h424/2026-07-01%2012_36_12-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    platamonas: { title: "Πλαταμώνας 🏰", desc: "Το μπαλκόνι του Αιγαίου. Ένα επιβλητικό οχυρό που αγκαλιάζει τη θάλασσα, προσφέροντας μαγευτική θέα και μια αίσθηση μυστηρίου ανάμεσα στα τείχη και το απέραντο γαλάζιο.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKt8c_XM8tqRGvrsvsuMtRjU6vzsLJm40YAkD-64AIk0yTjc6nIAaYPfBE3xM7REpRUxCWtGHiS13GgC5ldeTI8FcPe9iSes0vbjDWMPaW4NYFO9t5dzYVBwH8PHF8Z3J3_Kfyvd4VR_qdUdwMUi7FLC08UiLmRRPz6RIW7Wu9xgnuIUMiDwRBbqfuBSI/w640-h314/2026-07-01%2013_53_00-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    panteleimonas: { title: "Παλαιοί Πόροι 🍂", desc: "Μαγευτικό πέτρινο ορεινό χωριό της Νότιας Πιερίας. Χτισμένο μέσα σε πυκνά δάση από έλατα, μαγνητίζει τον επισκέπτη με την παραδοσιακή του αρχιτεκτονική.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjLXkf9PfctHKzMGMwKJfkKqrfY_vB00lJX0VSZ5rpEt6_y_NMoNIMb7fII7kSGz3uIeS7NjYS_F9OTuMxgVBJvjmZv76kKoASbprO2Vr8Ao5Cqp8XS6YrOS61OonnTI1EZX9fBQdYJEhNS-f5GH7V68GdFwsrGPuW5S3H5sK52oRT3ZpiZLfvnHutIopw/w640-h502/2026-07-01%2013_55_40-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    pydna: { title: "Μακρύγιαλος 🏺", desc: "Ένας παραθαλάσσιος προορισμός που συνδυάζει την ηρεμία του Θερμαϊκού με την αυθεντική φιλοξενία. Το ιδανικό σημείο για βόλτες πλάι στο κύμα, με θέα που απλώνεται μέχρι τον Όλυμπο και τα φώτα της Θεσσαλονίκης.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi8QX5_b75c2xwp6GwLgMQkzuvgCNHjOwyDEYzucUE6RSxc6QPq8x2nZYGLWRxNr6Fkfw_8iTUWQz_RP5bRgOCRc8coMAQuDl2DRmNpW04JSVA53hyphenhyphenShjDrBYOUrsyTBqanvd9wKHa4ijGu2FwY_CUDncup2mpIbxNMglyp6FsR6OYqXFDR9opYuZ_JfBM/w640-h610/2026-07-01%2013_56_55-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    alykes: { title: "Κίτρος 🦩", desc: "Έδρα της Ιεράς Μητροπόλεως Κίτρους, Κατερίνης και Πλαταμώνος. Ένας τόπος με βαθιά πνευματικότητα και ιστορική σημασία, όπου η πίστη συναντά την τοπική παράδοση σε μια περιοχή με ιδιαίτερη θρησκευτική ταυτότητα.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgneVG9USBpEpDKuEMDf4WXVkN1_08EzYNnAkb66otP6frPFGOWmIt12hdd0ochMQGR3cgtnFtd96py6l6lQqD8be_nVE-fxI4qyoYvY5gk7vGq6jbx2DUqj2udGlew665bfigYRxjNdAERlUoNYoeEGKzG5IEwlHIDojm4tCoXCidbRaIe8-rs7PeP0hQ/w640-h274/2026-07-01%2013_58_18-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    milia: { title: "Μηλιά (Η Έδρα των Λαζαίων) 🦅", desc: "Ο ορεινός προμαχώνας των Πιερίων. Το θρυλικό ορμητήριο της ξακουστής οικογένειας των Λαζαίων, των ηρωικών κλεφταρματολών που αντιστάθηκαν σθεναρά στην Οθωμανική Αυτοκρατορία. Ένας τόπος ποτισμένος με μπαρούτι και ανυπότακτο πνεύμα.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg4nXB_Xr_G0sIo_J4SLL50Qk4x3BPxCLUn6jhLVuOl7ufaDGnC6uLG4pE-qaQYcDM7qQC_KaCaKVobGZ_rCcAaBM1wtUHLNOGK4OFazwzPJOMFmufGhcCEJwKyBg-sB1CnswsRRoQhCnX0tIvE8L_4yCHLBDK8YRxcLkN9kKGU3QVJZihPsltaPJ7Bnaw/w640-h356/2026-07-01%2013_59_29-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    kontariotissa: { title: " Κονταριώτισσα ⛪", desc: "Ένα γραφικό κεφαλοχώρι στις παρυφές του Ολύμπου. Ένας τόπος που αγκαλιάζει τον ορεινό όγκο, προσφέροντας γνήσια παραδοσιακή ατμόσφαιρα και μια μοναδική επαφή με το επιβλητικό τοπίο του βουνού των Θεών.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgAhAbcmZOUP9ZnfLDEKww5KkP3m4_Y6Rvp0S46LXkmo5ESyJKSfGJfE4QQnTXv7sHDDNuHAARS-EbLNPcpPdzTW0nKK8mmIiRn8m64wxgKX3sJi8jXILbKUX16zX60gmkltklyNd07O1uU4PuhMD-djkfLZNywEmQaXzVxQE1RjKsGhUox1FNlEuTfNjs/w640-h422/2026-07-01%2014_01_30-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    anoskotina: { title: "Άνω Σκοτίνα 🏚️", desc: "Ένας παραδοσιακός οικισμός-φάντασμα κρυμμένος στις πλαγιές του Κάτω Ολύμπου, πνιγμένος στα υπεραιωνόβια πλατάνια. Τα πετρόχτιστα σπίτια της μοιάζουν ανέγγιχτα από τον χρόνο, βγαλμένα από παραμύθι.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEic0bPoJBVgEfAUr1ymL_NWP_zCP3rUtn8yU4HQEqYMD1db6XcocwB_89_q1hErnoozoUFP58FGgn_g_CoNTNDfzqnwZKd7E__eOFQC53LkBkNHFqnuXgGvOIS_QRydyET-zItmAa48AGiFBeH096UhQ7b6-55hcdpIm72ZQHbogidHXT8a5bs7QHGF8_g/w640-h474/2026-07-01%2014_02_30-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
aiginio: { title: "Αιγίνιο 🌾", desc: "Ο εύφορος κάμπος της βόρειας Πιερίας. Ένας τόπος γεμάτος ζωντανή παράδοση, ιστορικές βυζαντινές εκκλησιές και φυσική ομορφιά κοντά στους προστατευμένους υδροβιότοπους.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglKzTrLdlgz15emRwy5PSkfbrqcWgy0-5ZK-FWCwsctBqaZ7Ro4Q_WmWoAItjYl14RHKnnKcnARxP35QeiUK1PLCqE5QGX7yPzCr-3QOyll6AFMX8QypFpVMDvgE2oenzCW3ydLADTf2rJq6W2PnY60RfnAgRvn8aSNI04nSX62zbtgrRwg2MZKwMc2i0/w400-h223/2026-07-01%2014_10_17-2025-09-25%2018_01_46-World%20of%20Warcraft.png" },
    korinos: { title: "Ν. Τραπεζούντα 🪦", desc: "Η Νέα Τραπεζούντα Πιερίας ιδρύθηκε από Πόντιους πρόσφυγες, διατηρώντας ζωντανή την ιστορική μνήμη. Διακρίνεται για την παραδοσιακή αρχιτεκτονική των σπιτιών της, τη φιλοξενία των κατοίκων και τις ζωντανές ποντιακές παραδόσεις.", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKOAF6pS9Qjb78BXkK0OhCuSDvntS4qxiURPmGZohtcnIBYpWDfvTpRB-MTtL3G94_tkGQh9gEDNIMJgtChr9GjPv_gLHtOKdRUDSWacoPfCPe8q7aHx7-9Wd0XepIQ92de_sROFWk12WUUy8PSF8yhc1lBKq_UfsqoysN3wGg664-BZWtITHnlCRcjmk/w640-h476/2026-07-01%2014_04_01-2025-09-25%2018_01_46-World%20of%20Warcraft.png" }
 
  };

  // ==========================================
  // 3. AUDIO MANAGER
  // ==========================================
  const AudioManager = {
    toggle: (btnEl) => {
      STATE.isSoundOn = !STATE.isSoundOn;
      btnEl.innerHTML = STATE.isSoundOn ? "🔊" : "🔇";
      
      if (!STATE.isSoundOn) {
        AudioManager.stop();
      }
    },
    play: () => {
      if (!STATE.isSoundOn) return;
      AudioManager.stop(); // Καθαρίζει τυχόν προηγούμενα timers
      
      STATE.audio.volume = 1.0;
      STATE.audio.currentTime = 0;
      
      // Χειρισμός Promise για τους σύγχρονους browsers (αποφυγή errors)
      const playPromise = STATE.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* Σιωπηρή αποτυχία αν ο browser μπλοκάρει το autoplay */ });
      }

      STATE.audioTimeout = setTimeout(() => {
        STATE.fadeInterval = setInterval(() => {
          if (STATE.audio.volume > 0.1) {
            STATE.audio.volume = Math.max(0, STATE.audio.volume - CONFIG.audioFadeDrop);
          } else {
            AudioManager.stop();
          }
        }, CONFIG.audioFadeStepMs);
      }, CONFIG.audioFadeDelay);
    },
    stop: () => {
      clearTimeout(STATE.audioTimeout);
      clearInterval(STATE.fadeInterval);
      STATE.audio.pause();
      STATE.audio.currentTime = 0;
    }
  };

  // ==========================================
  // 4. TOOLTIP MANAGER
  // ==========================================
  const TooltipManager = {
    el: document.getElementById('tolkien-tooltip-1'),
    titleEl: document.getElementById('tt-title-1'),
    descEl: document.getElementById('tt-desc-1'),
    imgEl: document.getElementById('tt-img-1'),

    show: (placeId) => {
      const data = window.PLACES_DB[placeId];
      if (!data || !TooltipManager.el) return;

      // Ενημέρωση περιεχομένου
      TooltipManager.titleEl.innerHTML = data.title || "";
      TooltipManager.descEl.innerHTML = data.desc || "";
      
      // Διαχείριση Εικόνας
      if (data.img) {
        TooltipManager.imgEl.src = data.img;
        TooltipManager.imgEl.style.display = 'block';
      } else {
        TooltipManager.imgEl.style.display = 'none';
      }

      // Εμφάνιση
      TooltipManager.el.classList.add('active');
    },
    hide: () => {
      if (TooltipManager.el) {
        TooltipManager.el.classList.remove('active');
      }
    }
  };

  // ==========================================
  // 5. MAP MANAGER (Διαχείριση Χάρτη & Banners)
  // ==========================================
  const MapManager = {
    init: () => {
      MapManager.toggle(true); // Αρχική φόρτωση
      MapManager.setupEvents();
      MapManager.preloadImages();
    },

    toggle: (isFirstLoad = false) => {
      TooltipManager.hide();
      if (!isFirstLoad) AudioManager.play();

      const button = document.getElementById('toggle-btn');
      const allBanners = document.querySelectorAll('#map-area .t-banner');
      if (!button || !allBanners.length) return;

      // Λογική εναλλαγής καταστάσεων
      if (STATE.mapState === 1) {
        // Κατάσταση 1: Εμφάνιση Group B
        MapManager.applyVisibility(allBanners, CONFIG.groupB);
        button.innerHTML = "✨ Εμφάνιση όλων μαζί!";
        STATE.mapState = 2;
      } else if (STATE.mapState === 2) {
        // Κατάσταση 2: Εμφάνιση Όλων
        allBanners.forEach(banner => {
          banner.classList.remove('hidden-group');
          banner.classList.add('visible-group');
        });
        button.innerHTML = "🔄 Επαναφορά στην αρχική!";
        STATE.mapState = 3;
      } else {
        // Κατάσταση 3: Εμφάνιση Group A (Αρχική)
        MapManager.applyVisibility(allBanners, CONFIG.groupA);
        button.innerHTML = "🗺️ Ανακάλυψε τα υπόλοιπα!";
        STATE.mapState = 1;
      }
    },

    applyVisibility: (banners, activeGroup) => {
      banners.forEach(banner => {
        // Εξάγει το ID της περιοχής είτε από data-attribute είτε διαβάζοντας έξυπνα το παλιό onclick!
        const placeId = banner.dataset.place || (banner.getAttribute('onclick') || '').match(/'([^']+)'/)?.[1];
        
        if (placeId && activeGroup.includes(placeId)) {
          banner.classList.remove('hidden-group');
          banner.classList.add('visible-group');
        } else {
          banner.classList.remove('visible-group');
          banner.classList.add('hidden-group');
        }
      });
    },

    // ==========================================
    // Έξυπνο Event Delegation (Λιγότερη κατανάλωση RAM)
    // ==========================================
    setupEvents: () => {
      document.addEventListener('click', (e) => {
        const banner = e.target.closest('.t-banner');
        const closeBtn = e.target.closest('.close-t-btn');
        const toggleBtn = e.target.closest('#toggle-btn');
        const soundBtn = e.target.closest('.sound-toggle-btn');
        const tooltip = document.getElementById('tolkien-tooltip-1');

        // 1. Κλικ σε Λάβαρο (Banner)
        if (banner) {
          e.preventDefault();
          e.stopPropagation();
          // Διαβάζει δυναμικά ποιο λάβαρο πατήθηκε
banner.classList.add('visited-banner');
          const placeId = banner.dataset.place || (banner.getAttribute('onclick') || '').match(/'([^']+)'/)?.[1];
          if (placeId) TooltipManager.show(placeId);
          return;
        }

        // 2. Κλικ στο κουμπί Κλεισίματος
        if (closeBtn) {
          e.preventDefault();
          TooltipManager.hide();
          return;
        }

        // 3. Κλικ στο κουμπί Εναλλαγής Χάρτη
        if (toggleBtn) {
          e.preventDefault();
          MapManager.toggle(false);
          return;
        }

        // 4. Κλικ στο κουμπί Ήχου
        if (soundBtn) {
          e.preventDefault();
          AudioManager.toggle(soundBtn);
          return;
        }

        // 5. Κλικ στο κενό (για να κλείσει το Tooltip)
        if (tooltip && tooltip.classList.contains('active') && !tooltip.contains(e.target)) {
          TooltipManager.hide();
        }
      });
    },

    preloadImages: () => {
      window.addEventListener('load', () => {
        Object.values(window.PLACES_DB || {}).forEach(place => {
          if (place?.img) {
            const imgCache = new Image();
            imgCache.src = place.img;
          }
        });
      }, { passive: true });
    }
  };

  // ==========================================
  // 6. ΕΚΚΙΝΗΣΗ (Άμεση εκτέλεση για Blogger)
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MapManager.init);
  } else {
    MapManager.init(); // Αν το script φορτώσει μετά το DOM, τρέχει ακαριαία
  }

})();
