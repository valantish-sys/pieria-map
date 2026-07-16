(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURATION & DATABASE
    // ==========================================
    const CONFIG = Object.freeze({
        mobileBreakpoint: 768,
        glassBaseId: "quiz-mobile-base",
        glassBaseClass: "widget",
        debounceDelay: 150
    });

    // Η Δεξαμενή Ερωτήσεων (Άδεια για να βάλεις τις δικές σου)
    const QUESTIONS_DB = [
        { text: "Οι καμήλες αποθηκεύουν νερό στην καμπούρα τους.", type: "myth", icon: "🐪", exp: "Αποθηκεύουν λίπος για ενέργεια!" },
        { text: "Οι πιγκουίνοι συναντούν πολικές αρκούδες.", type: "myth", icon: "🐧", exp: "Ποτέ! Ζουν σε αντίθετους πόλους." },
        { text: "Οι χαμαιλέοντες αλλάζουν χρώμα μόνο για να κρυφτούν.", type: "myth", icon: "🦎", exp: "Αλλάζουν χρώμα ανάλογα με τη διάθεσή τους!" },
        { text: "Ο γατόπαρδος είναι το πιο γρήγορο ζώο στη στεριά.", type: "truth", icon: "🐆", exp: "Σωστά! Τρέχει πιο γρήγορα από αυτοκίνητο." },
        { text: "Τα ποντίκια αγαπούν το τυρί περισσότερο από όλα.", type: "myth", icon: "🧀", exp: "Προτιμούν γλυκά, φρούτα και δημητριακά!" },
        { text: "Οι στρουθοκάμηλοι κρύβουν το κεφάλι τους στην άμμο.", type: "myth", icon: "🐦", exp: "Αν νιώσουν κίνδυνο, τρέχουν ή κλωτσάνε!" },
        { text: "Οι αράχνες είναι έντομα.", type: "myth", icon: "🕷️", exp: "Είναι αραχνοειδή με 8 πόδια!" },
        { text: "Οι ταύροι θυμώνουν με το κόκκινο χρώμα.", type: "myth", icon: "🐂", exp: "Αντιδρούν στην κίνηση, όχι στο χρώμα." },
        { text: "Το χρυσόψαρο έχει μνήμη μόνο 3 δευτερολέπτων.", type: "myth", icon: "🐠", exp: "Θυμούνται πράγματα για μήνες!" },
        { text: "Τα χταπόδια έχουν τρεις καρδιές.", type: "truth", icon: "🐙", exp: "Αλήθεια! Έχουν τρεις ξεχωριστές καρδιές." },
        { text: "Οι νυχτερίδες είναι εντελώς τυφλές.", type: "myth", icon: "🦇", exp: "Βλέπουν καλά, αλλά χρησιμοποιούν και ήχο." },
        { text: "Οι ελέφαντες δεν μπορούν να πηδήξουν.", type: "truth", icon: "🐘", exp: "Αλήθεια! Είναι πολύ βαριοί για άλματα." },
        { text: "Οι καρχαρίες δεν αρρωσταίνουν ποτέ.", type: "myth", icon: "🦈", exp: "Αρρωσταίνουν όπως όλα τα ζώα." },
        { text: "Τα σκυλιά βλέπουν μόνο ασπρόμαυρα.", type: "myth", icon: "🐕", exp: "Βλέπουν κυρίως μπλε και κίτρινο." },
        { text: "Ο βάτραχος πίνει νερό από το δέρμα του.", type: "truth", icon: "🐸", exp: "Σωστά! Το απορροφούν μέσω του δέρματος." },
        { text: "Τα φίδια μυρίζουν με τη γλώσσα τους.", type: "truth", icon: "🐍", exp: "Αλήθεια! Έτσι 'πιάνουν' τις μυρωδιές." },
        { text: "Η κουκουβάγια γυρίζει το κεφάλι της 360 μοίρες.", type: "myth", icon: "🦉", exp: "Το γυρίζει έως 270 μοίρες." },
        { text: "Τα μυρμήγκια δεν κοιμούνται ποτέ.", type: "myth", icon: "🐜", exp: "Παίρνουν πολλούς μικρούς υπνάκους." },
        { text: "Οι ιπποπόταμοι βγάζουν ροζ ιδρώτα.", type: "truth", icon: "🦛", exp: "Σωστά! Λειτουργεί σαν αντηλιακό." },
        { text: "Μόνο τα θηλυκά κουνούπια τσιμπάνε.", type: "truth", icon: "🦟", exp: "Αλήθεια! Χρειάζονται το αίμα για τα αυγά." },
        { text: "Τα σαλιγκάρια μπορούν να κοιμηθούν 3 χρόνια.", type: "truth", icon: "🐌", exp: "Αλήθεια! Αν έχει πολλή ξηρασία." },
        { text: "Οι κότες είναι απόγονοι των δεινοσαύρων.", type: "truth", icon: "🐔", exp: "Σωστά! Συγγενεύουν με τον T-Rex." },
        { text: "Το κέρατο του ρινόκερου είναι κόκκαλο.", type: "myth", icon: "🦏", exp: "Είναι από κερατίνη, όπως τα νύχια μας!" },
        { text: "Τα κουνέλια τρώνε μόνο καρότα.", type: "myth", icon: "🐇", exp: "Η βασική τους τροφή είναι το χόρτο." },
        { text: "Οι τίγρεις έχουν ριγέ δέρμα.", type: "truth", icon: "🐅", exp: "Αλήθεια! Ακόμα κι αν ξυριστούν." },
        { text: "Ο Δίας είναι ο μεγαλύτερος πλανήτης.", type: "truth", icon: "🪐", exp: "Σωστά! Χωράει όλους τους άλλους πλανήτες." },
        { text: "Ο Ήλιος είναι κίτρινος.", type: "myth", icon: "☀️", exp: "Είναι λευκός! Φαίνεται κίτρινος λόγω ατμόσφαιρας." },
        { text: "Το φεγγάρι έχει δικό του φως.", type: "myth", icon: "🌙", exp: "Αντανακλά το φως του Ήλιου." },
        { text: "Οι αστροναύτες επιπλέουν στο διάστημα.", type: "truth", icon: "🧑‍🚀", exp: "Σωστά λόγω έλλειψης βαρύτητας." },
        { text: "Το Σινικό Τείχος φαίνεται από το διάστημα με γυμνό μάτι.", type: "myth", icon: "🧱", exp: "Είναι πολύ στενό για να φανεί." },
        { text: "Δεν υπάρχει ήχος στο διάστημα.", type: "truth", icon: "🔇", exp: "Αλήθεια! Υπάρχει κενό αέρος." },
        { text: "Η Γη είναι τέλεια σφαίρα.", type: "myth", icon: "🌍", exp: "Είναι πεπλατυσμένη στους πόλους." },
        { text: "Μια μέρα στην Αφροδίτη διαρκεί πάνω από χρόνο.", type: "truth", icon: "⏳", exp: "Σωστά! Γυρίζει πολύ αργά." },
        { text: "Τα πεφταστέρια είναι αληθινά αστέρια.", type: "myth", icon: "🌠", exp: "Είναι μετεωρίτες που καίγονται." },
        { text: "Ο Άρης είναι ο 'Κόκκινος Πλανήτης'.", type: "truth", icon: "🔴", exp: "Σωστά! Λόγω του σκουριασμένου σιδήρου." },
        { text: "Το φως ταξιδεύει πιο γρήγορα από τον ήχο.", type: "truth", icon: "⚡", exp: "Αλήθεια! Γι' αυτό βλέπεις πρώτα την αστραπή." },
        { text: "Υπάρχει βαρύτητα στη Σελήνη.", type: "truth", icon: "🌕", exp: "Ναι, αλλά 6 φορές ασθενέστερη από τη Γη." },
        { text: "Ο Κρόνος είναι ο μόνος με δακτυλίους.", type: "myth", icon: "🪐", exp: "Έχουν και ο Δίας, ο Ουρανός και ο Ποσειδώνας." },
        { text: "Ο Ήλιος είναι πλανήτης.", type: "myth", icon: "🌞", exp: "Είναι αστέρι!" },
        { text: "Η Γη είναι ο 3ος πλανήτης από τον Ήλιο.", type: "truth", icon: "🌎", exp: "Σωστά! Μετά τον Ερμή και την Αφροδίτη." },
        { text: "Ένα νόμισμα από κτίριο τρυπάει το πεζοδρόμιο.", type: "myth", icon: "🪙", exp: "Είναι πολύ ελαφρύ για κάτι τέτοιο." },
        { text: "Φτιάχνουμε διαμάντια από μολύβια.", type: "truth", icon: "💎", exp: "Και τα δύο είναι από άνθρακα!" },
        { text: "Οι μαύρες τρύπες είναι άδειες.", type: "myth", icon: "🕳️", exp: "Είναι γεμάτες συμπιεσμένη ύλη!" },
        { text: "Το θαλασσινό νερό παγώνει.", type: "truth", icon: "🧊", exp: "Ναι, σε πιο χαμηλή θερμοκρασία από το γλυκό." },
        { text: "Το θερμόμετρο μετράει βάρος.", type: "myth", icon: "🌡️", exp: "Μετράει τη θερμοκρασία." },
        { text: "Ο πάγος επιπλέει στο νερό.", type: "truth", icon: "🧊", exp: "Σωστά! Είναι λιγότερο πυκνός." },
        { text: "Η Ανταρκτική είναι η πιο κρύα ήπειρος.", type: "truth", icon: "❄️", exp: "Σωστά! Έχει φτάσει τους -89 βαθμούς." },
        { text: "Το ουράνιο τόξο είναι τέλειος κύκλος.", type: "truth", icon: "🌈", exp: "Αλήθεια! Φαίνεται από αεροπλάνο." },
        { text: "Ο Ερμής είναι ο πιο ζεστός πλανήτης.", type: "myth", icon: "🌡️", exp: "Η Αφροδίτη είναι πιο ζεστή λόγω ατμόσφαιρας." },
        { text: "Οι αστροναύτες ψηλώνουν στο διάστημα.", type: "truth", icon: "📏", exp: "Σωστά! Η σπονδυλική στήλη τεντώνεται." },
        { text: "Η τσίχλα μένει στο στομάχι 7 χρόνια.", type: "myth", icon: "🍬", exp: "Αποβάλλεται σε λίγες μέρες." },
        { text: "Χρησιμοποιούμε το 10% του εγκεφάλου.", type: "myth", icon: "🧠", exp: "Χρησιμοποιούμε όλο τον εγκέφαλο!" },
        { text: "Τα δακτυλικά αποτυπώματα είναι μοναδικά.", type: "truth", icon: "🖐️", exp: "Σωστά! Ακόμα και στα δίδυμα." },
        { text: "Νύχια και μαλλιά μεγαλώνουν μετά τον θάνατο.", type: "myth", icon: "💅", exp: "Μύθος! Το δέρμα απλώς ζαρώνει." },
        { text: "Η γλώσσα είναι ο δυνατότερος μυς.", type: "myth", icon: "👅", exp: "Είναι ο μυς του σαγονιού (μασητήρας)." },
        { text: "Γεννιόμαστε με περισσότερα οστά.", type: "truth", icon: "🦴", exp: "Σωστά! Ενώνονται καθώς μεγαλώνουμε." },
        { text: "Το αίμα στο σώμα είναι μπλε.", type: "myth", icon: "🩸", exp: "Είναι πάντα κόκκινο!" },
        { text: "Φταρνίζεσαι με τα μάτια ανοιχτά.", type: "myth", icon: "🤧", exp: "Αδύνατο! Είναι αντανακλαστικό." },
        { text: "Η καρδιά έχει μέγεθος γροθιάς.", type: "truth", icon: "❤️", exp: "Σωστά!" },
        { text: "Τα δόντια είναι οστά.", type: "myth", icon: "🦷", exp: "Είναι από σμάλτο, πιο σκληρό από οστό." },
        { text: "Το διάβασμα στο σκοτάδι χαλάει τα μάτια.", type: "myth", icon: "📖", exp: "Απλώς τα κουράζει προσωρινά." },
        { text: "Ο δεξιός πνεύμονας είναι μεγαλύτερος.", type: "truth", icon: "🫁", exp: "Σωστά! Για να χωράει η καρδιά αριστερά." },
        { text: "Το κρύο προκαλεί κρυολόγημα.", type: "myth", icon: "🥶", exp: "Οι ιοί το προκαλούν, όχι το κρύο." },
        { text: "Το σώμα είναι κυρίως νερό.", type: "truth", icon: "💧", exp: "Σωστά! Πάνω από το 60%." },
        { text: "Ο εγκέφαλος κλείνει στον ύπνο.", type: "myth", icon: "😴", exp: "Είναι πολύ ενεργός τότε!" },
        { text: "Η γλώσσα έχει μοναδικό αποτύπωμα.", type: "truth", icon: "😛", exp: "Σωστά! Όπως τα δάχτυλα." },
        { text: "Αυτιά και μύτη μεγαλώνουν πάντα.", type: "truth", icon: "👃", exp: "Σωστά λόγω βαρύτητας στον χόνδρο." },
        { text: "Τα καρότα δίνουν νυχτερινή όραση.", type: "myth", icon: "🥕", exp: "Κάνουν καλό, αλλά όχι τόσο!" },
        { text: "Τα μωρά δεν έχουν δάκρυα στην αρχή.", type: "truth", icon: "👶", exp: "Σωστά! Οι αδένες αργούν να λειτουργήσουν." },
        { text: "Δεν μπορείς να γαργαλήσεις τον εαυτό σου.", type: "truth", icon: "🤣", exp: "Σωστά! Ο εγκέφαλος το περιμένει." },
        { text: "Η αναπνοή πάει στο στομάχι.", type: "myth", icon: "🌬️", exp: "Πηγαίνει στους πνεύμονες!" },
        { text: "Ανατριχιάζουμε για να ζεσταθούμε.", type: "truth", icon: "🥶", exp: "Σωστά! Παγιδεύει αέρα στο δέρμα." },
        { text: "Έχουμε μόνο 5 αισθήσεις.", type: "myth", icon: "👁️", exp: "Έχουμε πολλές περισσότερες!" },
        { text: "Τα νύχια χεριών μεγαλώνουν πιο γρήγορα.", type: "truth", icon: "💅", exp: "Σωστά! 3-4 φορές ταχύτερα." },
        { text: "Η ντομάτα είναι λαχανικό.", type: "myth", icon: "🍅", exp: "Φρούτο!" },
        { text: "Ο κεραυνός δεν χτυπάει 2 φορές στο ίδιο σημείο.", type: "myth", icon: "⚡", exp: "Χτυπάει συχνά τα ίδια σημεία!" },
        { text: "Τα φιστίκια μεγαλώνουν στο χώμα.", type: "truth", icon: "🥜", exp: "Σωστά! Δεν είναι δέντρα." },
        { text: "Οι μπανάνες μεγαλώνουν σε δέντρα.", type: "myth", icon: "🍌", exp: "Είναι γιγάντια βότανα!" },
        { text: "Η Γη έχει περισσότερο νερό.", type: "truth", icon: "🌊", exp: "Σωστά! Καλύπτει το 71%." },
        { text: "Τα ηλιοτρόπια ακολουθούν τον Ήλιο.", type: "truth", icon: "🌻", exp: "Σωστά!" },
        { text: "Η φράουλα έχει τα σπόρια έξω.", type: "truth", icon: "🍓", exp: "Σωστά! Είναι το μόνο φρούτο έτσι." },
        { text: "Το χαρτί είναι από πλαστικό.", type: "myth", icon: "📄", exp: "Είναι από ξύλο δέντρων." },
        { text: "Τα δέντρα κοιμούνται τον χειμώνα.", type: "truth", icon: "🌳", exp: "Σωστά! Μπαίνουν σε ανάπαυση." },
        { text: "Το μέλι δεν χαλάει.", type: "truth", icon: "🍯", exp: "Σωστά!" },
        { text: "Ακούς τη θάλασσα στο κοχύλι.", type: "myth", icon: "🐚", exp: "Ακούς τον αέρα και το αίμα σου." },
        { text: "Η ζάχαρη προκαλεί υπερκινητικότητα.", type: "myth", icon: "🍭", exp: "Φταίει ο ενθουσιασμός, όχι η ζάχαρη." },
        { text: "Ο Πύργος του Άιφελ ψηλώνει το καλοκαίρι.", type: "truth", icon: "🗼", exp: "Σωστά λόγω διαστολής μετάλλου." },
        { text: "Το καρπούζι είναι 92% νερό.", type: "truth", icon: "🍉", exp: "Σωστά!" },
        { text: "Το μπαμπού είναι δέντρο.", type: "myth", icon: "🎍", exp: "Είναι είδος γρασιδιού." },
        { text: "Το χιόνι είναι λευκό.", type: "myth", icon: "❄️", exp: "Είναι διάφανο, απλώς αντανακλά το φως." },
        { text: "Η σοκολάτα είναι από κακάο.", type: "truth", icon: "🍫", exp: "Σωστά!" },
        { text: "Ένα σύννεφο ζυγίζει ελάχιστα.", type: "myth", icon: "☁️", exp: "Ζυγίζει όσο 100 ελέφαντες!" },
        { text: "Το Έβερεστ είναι το ψηλότερο βουνό.", type: "truth", icon: "🏔️", exp: "Σωστά (πάνω από τη θάλασσα)." },
        { text: "Τα αεροπλάνα κουνάνε φτερά.", type: "myth", icon: "✈️", exp: "Πετάνε με κινητήρες και αεροδυναμική." },
        { text: "Ένα κομμένο σκουλήκι γίνεται δύο.", type: "myth", icon: "🪱", exp: "Μόνο το μέρος με το κεφάλι επιζεί." },
        { text: "Το αλάτι λιώνει τον πάγο.", type: "truth", icon: "🧂", exp: "Σωστά!" },
        { text: "Το γυαλί είναι από άμμο.", type: "truth", icon: "🪟", exp: "Σωστά!" },
        { text: "Ροδάκινα και αμύγδαλα είναι ίδια οικογένεια.", type: "truth", icon: "🍑", exp: "Σωστά! Τα ροδοειδή." },
{ text: "Τα γουρούνια ιδρώνουν πολύ.", type: "myth", icon: "🐖", exp: "Δεν έχουν ιδρωτοποιούς αδένες. Κυλιούνται στις λάσπες για να δροσιστούν!" },
        { text: "Τα φλαμίνγκο γεννιούνται ροζ.", type: "myth", icon: "🦩", exp: "Γεννιούνται γκρι! Το ροζ χρώμα έρχεται από τις γαρίδες που τρώνε." },
        { text: "Οι χελώνες μπορούν να βγουν από το καβούκι τους.", type: "myth", icon: "🐢", exp: "Αδύνατον! Είναι ενωμένο με τη σπονδυλική τους στήλη." },
        { text: "Στους ιππόκαμπους, ο μπαμπάς γεννάει τα μωρά.", type: "truth", icon: "🐡", exp: "Αλήθεια! Ο μπαμπάς κουβαλάει τα αυγά στην κοιλιά του." },
        { text: "Τα δελφίνια είναι ψάρια.", type: "myth", icon: "🐬", exp: "Είναι θηλαστικά! Πρέπει να βγουν στην επιφάνεια για να αναπνεύσουν." },
        { text: "Τα κοάλα είναι είδος αρκούδας.", type: "myth", icon: "🐨", exp: "Δεν είναι αρκούδες, είναι μαρσιποφόρα (όπως το καγκουρό)." },
        { text: "Το δέρμα της πολικής αρκούδας είναι μαύρο.", type: "truth", icon: "🐻‍❄️", exp: "Αλήθεια! Το μαύρο δέρμα τραβάει τη ζέστη του ήλιου, ενώ το τρίχωμα είναι διάφανο." },
        { text: "Η αστραπή είναι πιο ζεστή από την επιφάνεια του Ήλιου.", type: "truth", icon: "🌩️", exp: "Σωστά! Είναι περίπου 5 φορές πιο ζεστή." },
        { text: "Οι πεταλούδες γεύονται με τα πόδια τους.", type: "truth", icon: "🦋", exp: "Αλήθεια! Έχουν ειδικούς αισθητήρες γεύσης στα ποδαράκια τους." },
        { text: "Τα μήλα επιπλέουν στο νερό.", type: "truth", icon: "🍎", exp: "Σωστά! Το 25% του όγκου τους είναι γεμάτο με αέρα." },
        { text: "Τα φίδια δεν έχουν αυτιά εξωτερικά.", type: "truth", icon: "🐍", exp: "Σωστά! 'Ακούνε' νιώθοντας τις δονήσεις από το έδαφος." },
        { text: "Ο Πλούτωνας θεωρείται κανονικός πλανήτης.", type: "myth", icon: "🪐", exp: "Πλέον οι αστρονόμοι τον ονομάζουν 'πλανήτη νάνο'." },
        { text: "Όταν φταρνίζεσαι, σταματάει η καρδιά σου.", type: "myth", icon: "🤧", exp: "Η καρδιά συνεχίζει να χτυπάει κανονικά! Απλώς αλλάζει ελάχιστα ο ρυθμός." },
        { text: "Οι γάτες γουργουρίζουν μόνο όταν χαίρονται.", type: "myth", icon: "🐈", exp: "Γουργουρίζουν και όταν φοβούνται, πονάνε, ή για να ηρεμήσουν." },
        { text: "Οι άνθρωποι των σπηλαίων έζησαν μαζί με τους δεινόσαυρους.", type: "myth", icon: "🦖", exp: "Τους χωρίζουν περίπου 65 εκατομμύρια χρόνια!" },
        { text: "Τα μυρμήγκια μπορούν να σηκώσουν βάρος μεγαλύτερο από το δικό τους.", type: "truth", icon: "🐜", exp: "Σωστά! Σηκώνουν από 10 έως και 50 φορές το βάρος τους." },
        { text: "Αν πιάσεις βάτραχο, θα βγάλεις σπυράκια.", type: "myth", icon: "🐸", exp: "Είναι μύθος! Τα 'σπυράκια' του βατράχου είναι απλά αδένες στο δέρμα του." },
        { text: "Η μέλισσα πεθαίνει αφού τσιμπήσει.", type: "truth", icon: "🐝", exp: "Αλήθεια! Χάνει το κεντρί της και δεν μπορεί να επιβιώσει." },
        { text: "Οι κροκόδειλοι βγάζουν αληθινά δάκρυα.", type: "truth", icon: "🐊", exp: "Σωστά! Κλαίνε καθώς τρώνε, απλώς για να καθαρίσουν τα μάτια τους." },
        { text: "Αν καταπιείς κουκούτσι από καρπούζι, θα φυτρώσει στην κοιλιά σου.", type: "myth", icon: "🍉", exp: "Το οξύ στο στομάχι σου δεν το αφήνει να φυτρώσει ποτέ!" },
        { text: "Τα αστέρια έχουν σχήμα σαν αυτό που ζωγραφίζουμε με μύτες.", type: "myth", icon: "⭐", exp: "Είναι τεράστιες, ολοστρόγγυλες μπάλες από φωτιά και αέρια!" },
        { text: "Οι νυχτερίδες ανήκουν στην οικογένεια των πουλιών.", type: "myth", icon: "🦇", exp: "Είναι τα μοναδικά θηλαστικά στον κόσμο που μπορούν να πετάξουν!" },
        { text: "Το μάτι της στρουθοκαμήλου είναι πιο μεγάλο από τον εγκέφαλό της.", type: "truth", icon: "🦤", exp: "Αλήθεια! Έχουν τα μεγαλύτερα μάτια από κάθε άλλο ζώο της στεριάς." },
        { text: "Οι αράχνες κολλούν στον δικό τους ιστό.", type: "myth", icon: "🕸️", exp: "Αποφεύγουν τις κολλώδεις κλωστές και έχουν ειδικό λάδι στα πόδια τους." },
        { text: "Ο βραδύπους είναι το πιο αργό θηλαστικό στον κόσμο.", type: "truth", icon: "🦥", exp: "Σωστά! Κινείται τόσο αργά που φυτρώνουν βρύα στο τρίχωμά του." },
        { text: "Οι καμηλοπαρδάλεις έχουν μπλε ή μωβ γλώσσα.", type: "truth", icon: "🦒", exp: "Σωστά! Το σκούρο χρώμα την προστατεύει από τα εγκαύματα του ήλιου." },
        { text: "Κάθε τέσσερα χρόνια η χρονιά έχει μια μέρα παραπάνω.", type: "truth", icon: "🗓️", exp: "Αλήθεια! Είναι τα δίσεκτα έτη και ο Φεβρουάριος έχει 29 μέρες." },
        { text: "Τα μαργαριτάρια λιώνουν αν τα βάλεις μέσα σε ξύδι.", type: "truth", icon: "🦪", exp: "Αλήθεια! Το ξύδι διαλύει το ασβέστιο από το οποίο είναι φτιαγμένα." },
        { text: "Η πατάτα είναι ρίζα του φυτού.", type: "myth", icon: "🥔", exp: "Είναι 'κόνδυλος', δηλαδή ένα χοντρό υπόγειο κομμάτι του βλαστού!" },
        { text: "Τα άλογα μπορούν να κοιμηθούν όρθια.", type: "truth", icon: "🐴", exp: "Σωστά! Κλειδώνουν τις αρθρώσεις στα πόδια τους για να μην πέσουν." }
    ];

    // ==========================================
    // 2. DOM CACHE (Αποθήκευση στοιχείων στη μνήμη)
    // ==========================================
    const DOM = {
        display: document.getElementById("question-display"),
        feedback: document.getElementById("quiz-feedback"),
        iconSpan: document.getElementById("q-icon"),
        expBox: document.getElementById("explanation-box"),
        expText: document.getElementById("explanation-text"),
        btnRow: document.getElementById("action-buttons"),
        stats: document.getElementById("quiz-stats"),
        qContainer: document.getElementById("question-container"),
        quizOrig: document.getElementById("quiz-original-location"),
        quizWrap: document.getElementById("glass-quiz-wrapper"),
        quizBase: null
    };

    // ==========================================
    // 3. UTILITIES
    // ==========================================
    const Utils = {
        // Προστασία από το σπαμάρισμα του Resize
        debounce: (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        },
        // Αλγόριθμος Fisher-Yates (Ανακάτεμα O(n) μία φορά)
        shuffleArray: (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        }
    };

    // ==========================================
    // 4. QUIZ ENGINE (Η καρδιά του παιχνιδιού)
    // ==========================================
    const QuizEngine = {
        state: {
            questions: [],
            index: 0,
            score: 0,
            current: null
        },

        init: () => {
            if (QUESTIONS_DB.length === 0) return;
            // Ανακατεύουμε την "τράπουλα" μία φορά στην αρχή
            QuizEngine.state.questions = Utils.shuffleArray(QUESTIONS_DB);
            QuizEngine.loadNext();
        },

        loadNext: () => {
            const s = QuizEngine.state;
            
            // Αν παίξαμε όλες τις ερωτήσεις, ανακατεύουμε ξανά (Άπειρο παιχνίδι)
            if (s.index >= s.questions.length) {
                s.questions = Utils.shuffleArray(QUESTIONS_DB);
                s.index = 0;
            }

            // Ανάγνωση επόμενης ερώτησης σε O(1) χρόνο (Ακαριαία!)
            s.current = s.questions[s.index];
            s.index++;

            // Ενημέρωση του UI
            DOM.display.innerHTML = s.current.text; 
            DOM.iconSpan.innerHTML = s.current.icon;
            DOM.feedback.innerHTML = ""; 
            DOM.expBox.style.display = "none"; 
            DOM.btnRow.style.display = "flex";
            DOM.stats.innerHTML = `Σκορ: <strong>${s.score}</strong>`;

            // Επανεκκίνηση Animation (Reflow Trick)
            DOM.qContainer.classList.remove("question-anim");
            DOM.iconSpan.classList.remove("question-anim");
            void DOM.qContainer.offsetWidth; 
            DOM.qContainer.classList.add("question-anim");
            DOM.iconSpan.classList.add("question-anim");
        },

        processChoice: (userChoice) => {
            const s = QuizEngine.state;
            DOM.btnRow.style.display = "none";
            
            if (userChoice === s.current.type) { 
                s.score++; 
                DOM.feedback.innerHTML = "Σωστά! ✅"; 
                DOM.feedback.style.color = "#27ae60"; 
            } else { 
                DOM.feedback.innerHTML = "Λάθος! ❌"; 
                DOM.feedback.style.color = "#e74c3c"; 
            }
            
            DOM.expText.innerHTML = s.current.exp; 
            DOM.expBox.style.display = "block";
            DOM.stats.innerHTML = `Σκορ: <strong>${s.score}</strong>`;
        }
    };

    // ==========================================
    // 5. LAYOUT MANAGER (Μετακίνηση στα κινητά)
    // ==========================================
    const LayoutManager = {
        getOrCreateBase: () => {
            if (DOM.quizBase) return DOM.quizBase;
            const base = document.createElement("div");
            base.id = CONFIG.glassBaseId;
            base.className = CONFIG.glassBaseClass;
            DOM.quizBase = base;
            return base;
        },

        move: () => {
            if (!DOM.quizWrap) return;

            if (window.innerWidth <= CONFIG.mobileBreakpoint) {
                // Ψάχνει το HTML 6 για να κάτσει από κάτω του
                let target = document.getElementById("video-mobile-base") || document.getElementById("HTML6");
                if (target) {
                    const base = LayoutManager.getOrCreateBase();
                    if (base.parentNode !== target.parentNode || base.previousSibling !== target) {
                        target.after(base); 
                    }
                    if (DOM.quizWrap.parentNode !== base) {
                        base.appendChild(DOM.quizWrap);
                    }
                }
            } else {
                // Επαναφορά στην αρχική θέση (Desktop)
                if (DOM.quizOrig && DOM.quizOrig.parentNode && DOM.quizWrap.parentNode !== DOM.quizOrig.parentNode) {
                    DOM.quizOrig.parentNode.insertBefore(DOM.quizWrap, DOM.quizOrig.nextSibling);
                }
                if (DOM.quizBase?.parentNode) {
                    DOM.quizBase.remove();
                }
            }
        }
    };

    // ==========================================
    // 6. BOOTSTRAP (Εκκίνηση & Event Listeners)
    // ==========================================
    const App = {
        init: () => {
            // Early Return: Αν λείπει το βασικό HTML, ο κώδικας σταματάει αθόρυβα
            if (!DOM.display || !DOM.btnRow) return;

            QuizEngine.init();

            // 1. Event Delegation για τα κουμπιά απάντησης (Μύθος/Αλήθεια)
            DOM.btnRow.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn || !btn.dataset.choice) return;
                QuizEngine.processChoice(btn.dataset.choice);
            });

            // 2. Event Delegation για το κουμπί "Επόμενη Ερώτηση" (μέσα στο κουτί της εξήγησης)
            DOM.expBox.addEventListener("click", (e) => {
                const nextBtn = e.target.closest("button");
                if (nextBtn && nextBtn.dataset.action === "next") {
                    QuizEngine.loadNext();
                }
            });

            // 3. Αρχική Μετακίνηση & Ασφαλής παρακολούθηση Resize
            LayoutManager.move();
            window.addEventListener("resize", Utils.debounce(LayoutManager.move, CONFIG.debounceDelay), { passive: true });
        }
    };

    // Εκτέλεση όταν φορτώσει το DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", App.init);
    } else {
        App.init();
    }

})();
