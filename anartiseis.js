document.addEventListener('DOMContentLoaded', async function() {
  // Δημιουργία DOM στοιχείων για το Popup
  const overlay = document.createElement('div');
  overlay.id = 'calendar-overlay';
  document.body.appendChild(overlay);

  const tooltip = document.createElement('div');
  tooltip.id = 'calendar-tooltip';
  document.body.appendChild(tooltip);

  let hideTimeout;
const dailyQuotes = [
    "Κάθε μέρα είναι μια νέα ευκαιρία για παιχνίδι και γνώση!",
    "Το χαμόγελό σου μπορεί να φωτίσει ολόκληρη την τάξη!",
    "Μην σταματάς ποτέ να ρωτάς «γιατί» έτσι ανακαλύπτεις τον κόσμο!",
    "Είσαι μοναδικός και έχεις υπέροχες ιδέες να μοιραστείς.",
    "Η ευγένεια είναι μια κρυφή υπερδύναμη που ομορφαίνει τα πάντα.",
    "Διάβασε μια σελίδα από το αγαπημένο σου βιβλίο σήμερα!",
    "Τα λάθη είναι απλώς αποδείξεις ότι προσπαθείς.",
    "Η φιλία είναι το πιο όμορφο παιχνίδι στο διάλειμμα.",
    "Πίστεψε στις δυνάμεις σου, μπορείς να καταφέρεις πολλά!",
    "Μια μικρή καλή πράξη σήμερα θα κάνει κάποιον ευτυχισμένο.",
    "Πάρε μια βαθιά ανάσα και χαλάρωσε για λίγα λεπτά.",
    "Η φαντασία σου είναι ένας μαγικός κόσμος χωρίς όρια.",
    "Βοήθησε έναν συμμαθητή σου σήμερα, η ομαδικότητα είναι δύναμη!",
    "Κάθε μικρό βήμα σε φέρνει πιο κοντά στα όνειρά σου.",
    "Η γνώση μεγαλώνει όταν τη μοιράζεσαι με τους φίλους σου.",
    "Να είσαι περήφανος για την προσπάθεια που καταβάλλεις κάθε μέρα.",
    "Ο κόσμος είναι γεμάτος θαύματα, βγες έξω και εξερεύνησέ τον!",
    "Ένα «ευχαριστώ» μπορεί να φτιάξει τη μέρα ενός ανθρώπου.",
    "Η υπομονή είναι το κλειδί για να λύσεις τις πιο δύσκολες ασκήσεις.",
    "Γέλα με την καρδιά σου σήμερα, το γέλιο είναι υγεία!",
    "Η καθαριότητα στο θρανίο σου φέρνει καθαρή σκέψη.",
    "Κάνε μια ζωγραφιά και χάρισέ την σε κάποιον που αγαπάς.",
    "Ο αθλητισμός μας δίνει ενέργεια και μας μαθαίνει να συνεργαζόμαστε.",
    "Άκουσε με προσοχή τι έχουν να σου πουν οι άλλοι.",
    "Σεβάσου τη φύση και τα φυτά γύρω σου, μας δίνουν ζωή.",
    "Η ειλικρίνεια χτίζει τις πιο δυνατές φιλίες.",
    "Κάθε μέρα μαθαίνουμε κάτι καινούργιο, αρκεί να έχουμε ανοιχτά μάτια.",
    "Μην τα παρατάς αν κάτι σε δυσκολέψει, προσπάθησε ξανά!",
    "Το πιο όμορφο ταξίδι γίνεται μέσα από τις σελίδες ενός βιβλίου.",
    "Να είσαι πάντα ο εαυτός σου, γιατί ο εαυτός σου είναι υπέροχος!",
    "Μια καλή κουβέντα μπορεί να σβήσει μια κακή στιγμή.",
    "Μην ξεχνάς να πίνεις νερό και να φροντίζεις το σώμα σου.",
    "Η μουσική μπορεί να σου φτιάξει τη διάθεση σε ένα λεπτό.",
    "Βάλε στόχο να γίνεις σήμερα λίγο καλύτερος από χθες.",
    "Τα ζώα έχουν ανάγκη την αγάπη και την προστασία μας.",
    "Όταν συνεργαζόμαστε, οι δύσκολες εργασίες γίνονται παιχνιδάκι.",
    "Κάθε αστέρι στον ουρανό είναι σαν ένα δικό σου όνειρο.",
    "Χρησιμοποίησε τις «μαγικές λέξεις»: παρακαλώ, ευχαριστώ, συγγνώμη.",
    "Η περιέργεια είναι η αρχή κάθε μεγάλης ανακάλυψης.",
    "Κάνε ένα ήρεμο κλείσιμο στη μέρα σου σκεπτόμενος κάτι καλό.",
    "Η αγκαλιά είναι το καλύτερο φάρμακο για τη στεναχώρια.",
    "Μίλα με όμορφα λόγια στους γονείς και τους δασκάλους σου.",
    "Η δημιουργικότητα κρύβεται σε κάθε σου κατασκευή.",
    "Δοκίμασε να φας ένα φρούτο σήμερα για έξτρα ενέργεια.",
    "Όλοι οι άνθρωποι είναι διαφορετικοί και αυτό κάνει τον κόσμο όμορφο.",
    "Η συγκέντρωση σε βοηθάει να τελειώνεις γρήγορα τα μαθήματά σου.",
    "Παίξε δίκαια σε κάθε παιχνίδι, η αξία είναι στη συμμετοχή.",
    "Μάζεψε τα παιχνίδια σου και κράτα το δωμάτιό σου συμμαζεμένο.",
    "Η ιστορία μας διδάσκει σπουδαία πράγματα για το παρελθόν.",
    "Το διάστημα κρύβει μυστικά που περιμένουν να τα ανακαλύψεις.",
    "Γίνε ο ήρωας της δικής σου ιστορίας σήμερα!",
    "Η θετική σκέψη διώχνει μακριά τα σύννεφα της ανησυχίας.",
    "Μοιράσου τα πράγματά σου, η χαρά διπλασιάζεται.",
    "Κάθε πρωί ξυπνάς με την ευκαιρία να γράψεις μια όμορφη σελίδα.",
    "Η λύση σε ένα πρόβλημα κρύβεται συχνά στην ηρεμία.",
    "Μάθε να συγχωρείς, η κακία βαραίνει την καρδιά.",
    "Φτιάξε ένα πλάνο για τη μέρα σου, θα σε βοηθήσει πολύ.",
    "Οι μεγάλοι επιστήμονες ξεκίνησαν κάνοντας απλές ερωτήσεις.",
    "Η τέχνη μας επιτρέπει να εκφράσουμε όσα νιώθουμε.",
    "Απόλαυσε τον καθαρό αέρα και τον ήλιο στο διάλειμμα.",
    "Να είσαι θαρραλέος, ο φόβος νικιέται με την προσπάθεια.",
    "Ένα καθαρό περιβάλλον ξεκινάει από εμάς τους ίδιους.",
    "Η αγάπη για τη μάθηση είναι ένα δώρο που κρατάει για πάντα.",
    "Σκέψου πριν μιλήσεις, οι λέξεις έχουν μεγάλη δύναμη.",
    "Βρες χρόνο να παίξεις με το κατοικίδιό σου ή να παρατηρήσεις τα πουλιά.",
    "Η γεωγραφία μας δείχνει πόσο τεράστιος και όμορφος είναι ο πλανήτης.",
    "Όταν νιώθεις κουρασμένος, κλείσε τα μάτια και σκέψου μια όμορφη εικόνα.",
    "Η επιτυχία έρχεται σε όσους επιμένουν με χαμόγελο.",
    "Μην κρίνεις ένα βιβλίο από το εξώφυλλό του, εξερεύνησέ το.",
    "Να είσαι πάντα έτοιμος να προσφέρεις μια χείρα βοηθείας.",
    "Τα μαθηματικά είναι σαν γρίφοι που περιμένουν να τους λύσεις.",
    "Κάθε εποχή του χρόνου έχει τη δική της ξεχωριστή ομορφιά.",
    "Η ποίηση κρύβει μουσική μέσα στις λέξεις.",
    "Κάνε μια καλή πράξη στα κρυφά, η εσωτερική χαρά είναι τεράστια.",
    "Να σέβεσαι τους μεγαλύτερους, έχουν πολλά να σου μάθουν.",
    "Η αυτοπεποίθηση χτίζεται μέρα με τη μέρα, με κάθε μικρή σου νίκη.",
    "Γίνε εσύ η αλλαγή που θέλεις να δεις στην τάξη σου.",
    "Το χιούμορ και τα αστεία κάνουν τη ζωή πιο ανάλαφρη.",
    "Μην φοβάσαι το σκοτάδι, τα αστέρια λάμπουν μόνο εκεί.",
    "Κάθε μέρα είναι ένα δώρο, άνοιξέ το με ενθουσιασμό!",
    "Μάθε να ακούς τους φίλους σου όταν έχουν πρόβλημα.",
    "Τα πειράματα στη φυσική μας δείχνουν τη μαγεία του κόσμου.",
    "Η συνέπεια στα μαθήματα σου αφήνει περισσότερο χρόνο για παιχνίδι.",
    "Φρόντισε τα βιβλία σου, είναι οι καλύτεροι οδηγοί σου.",
    "Ένα ζεστό ρόφημα βοηθάει το σώμα να ηρεμήσει το βράδυ.",
    "Η κηπουρική μας μαθαίνει να έχουμε υπομονή με τη φύση.",
    "Κάθε πολιτισμός έχει τις δικές του όμορφες παραδόσεις.",
    "Η ελευθερία συμβαδίζει πάντα με την υπευθυνότητα.",
    "Μην αφήνεις για αύριο αυτό που μπορείς να μάθεις σήμερα.",
    "Οι φίλοι είναι σαν τα αστέρια, δεν τους βλέπεις πάντα αλλά είναι εκεί.",
    "Η συγκέντρωση είναι σαν ένας μυς που γυμνάζεται.",
    "Να είσαι ευγνώμων για το φαγητό που υπάρχει στο τραπέζι σου.",
    "Η τεχνολογία είναι χρήσιμη όταν τη χρησιμοποιούμε με μέτρο.",
    "Κάνε μια βόλτα στη φύση και άκουσε το θρόισμα των φύλλων.",
    "Η ειρήνη ξεκινάει από έναν καλό λόγο στο θρανίο.",
    "Μην συγκρίνεις τον εαυτό σου με άλλους, είσαι ξεχωριστός!",
    "Η προσπάθεια μετράει περισσότερο από τον βαθμό.",
    "Μάθε να μοιράζεσαι τα παιχνίδια σου, είναι πιο διασκεδαστικό.",
    "Το νερό είναι πολύτιμο, μην το σπαταλάς όταν πλένεις τα χέρια σου.",
    "Κάθε μέρα κρύβει μια μικρή περιπέτεια, βρες τη!",
    "Η ευγένεια δεν κοστίζει τίποτα, αλλά αξίζει πάρα πολλά.",
    "Τα όνειρά σου δεν έχουν ηλικία, συνέχισε να ονειρεύεσαι.",
    "Όταν διαβάζεις, γίνεσαι ο εξερευνητής νέων κόσμων.",
    "Η αλήθεια σε κάνει να νιώθεις ελεύθερος και ήσυχος.",
    "Μάθε να χαίρεσαι με την επιτυχία των φίλων σου.",
    "Το σώμα σου χρειάζεται καλό ύπνο για να μεγαλώσει σωστά.",
    "Οι καλές συνήθειες από νωρίς χτίζουν ένα λαμπρό μέλλον.",
    "Μην αφήνεις μια κακή στιγμή να σου χαλάσει όλη τη μέρα.",
    "Η αρχαιολογία μας αποκαλύπτει τα μυστικά των αρχαίων λαών.",
    "Να έχεις πάντα θάρρος να λες τη γνώμη σου με ευγένεια.",
    "Η ομαδική δουλειά κάνει τα θαύματα πραγματικότητα.",
    "Κάθε δέντρο που βλέπεις δίνει οξυγόνο σε εμάς και τα ζώα.",
    "Μάθε να λες «μπράβο» στους άλλους, τους δίνει μεγάλη χαρά.",
    "Η μουσική των πουλιών το πρωί είναι το καλύτερο ξυπνητήρι.",
    "Η υπομονή σε βοηθάει να περιμένεις τη σειρά σου στο παιχνίδι.",
    "Μην ξεχνάς να χαμογελάς στον καθρέφτη σου κάθε πρωί.",
    "Η γνώση είναι ένα κλειδί που ανοίγει όλες τις πόρτες.",
    "Κάθε δυσκολία σε κάνει πιο δυνατό και πιο σοφό.",
    "Σέβασου τους κανόνες του παιχνιδιού για να περάσουν όλοι καλά.",
    "Η αγάπη για την οικογένεια είναι η πιο ζεστή φωλιά.",
    "Κάνε μια ερώτηση στον δάσκαλό σου για κάτι που σε εντυπωσίασε.",
    "Ο καθαρός αέρας καθαρίζει το μυαλό και διώχνει την κούραση.",
    "Η ζωγραφική είναι ο λόγος της ψυχής χωρίς λέξεις.",
    "Μάθε να φροντίζεις τα πράγματά σου για να κρατήσουν καιρό.",
    "Η διαφορετικότητα είναι το χρώμα που ομορφαίνει τη ζωή.",
    "Κάθε καλό παράδειγμα εμπνέει και τους γύρω σου.",
    "Η μελέτη σε βοηθάει να κατανοήσεις πώς λειτουργεί ο κόσμος.",
    "Μην ξεχνάς να λες «καλημέρα» με ένα μεγάλο χαμόγελο.",
    "Η θάλασσα μας ηρεμεί και μας θυμίζει πόσο απέραντος είναι ο κόσμος.",
    "Οι καλοί τρόποι είναι το διαβατήριο για παντού.",
    "Πίστεψε στο θαύμα της προσπάθειας και θα δεις αποτελέσματα.",
    "Κάθε μέρα είναι μια ευκαιρία να γίνεις ο καλύτερος εαυτός σου.",
    "Η φιλία θέλει φροντίδα, όπως ένα όμορφο λουλούδι.",
    "Μην φοβάσαι να ζητήσεις βοήθεια όταν τη χρειάζεσαι.",
    "Η λογοτεχνία μας μαθαίνει να μπαίνουμε στη θέση των άλλων.",
    "Κράτα τις υποσχέσεις σου, έτσι κερδίζεις την εμπιστοσύνη.",
    "Το γέλιο με τους φίλους είναι η καλύτερη ανάμνηση.",
    "Η ανακύκλωση σώζει τον πλανήτη μας από τα σκουπίδια.",
    "Κάθε σωστή απάντηση ξεκίνησε από μια καλή προσπάθεια.",
    "Τα φρούτα σου δίνουν τις απαραίτητες βιταμίνες και υπερδυνάμεις!",
    "Να είσαι περίεργος για τον κόσμο, κρύβει πολλές εκπλήξεις.",
    "Η ηρεμία είναι ο καλύτερος σύμβουλος στις αποφάσεις.",
    "Μάθε να μοιράζεσαι τη χαρά σου, έτσι πολλαπλασιάζεται.",
    "Η ιστορία της επιστήμης είναι γεμάτη από επίμονους ανθρώπους.",
    "Σέβασου τον χώρο των άλλων, όπως θες να σέβονται τον δικό σου.",
    "Η προσφορά χωρίς αντάλλαγμα γεμίζει την καρδιά με φως.",
    "Μην αφήνεις τις αποτυχίες να σου κλέβουν τον ενθουσιασμό.",
    "Κάθε μέρα είναι μια λευκή σελίδα στο ημερολόγιο της ζωής σου.",
    "Η ευγένεια κάνει ακόμα και τις πιο δύσκολες μέρες όμορφες.",
    "Ταξίδεψε με τη φαντασία σου σε όποιο μέρος του κόσμου θες.",
    "Η αγάπη για το διάβασμα είναι ένας θησαυρός που δεν χάνεται.",
    "Να είσαι δίκαιος και ειλικρινής σε ό,τι κι αν κάνεις.",
    "Κάθε μικρή επιτυχία αξίζει να γιορτάζεται με ένα χαμόγελο.",
    "Το σώμα σου είναι το σπίτι σου, φρόντισέ το με καλή διατροφή.",
    "Η ομαδικότητα στο σχολείο δημιουργεί τις καλύτερες παρέες.",
    "Μην ξεχνάς να λες «παρακαλώ» όταν ζητάς κάτι.",
    "Η φύση την άνοιξη είναι γεμάτη χρώματα και αρώματα.",
    "Η γνώση σε κάνει ανεξάρτητο και δυνατό.",
    "Κάθε μάθημα είναι ένα λιθαράκι για το μέλλον σου.",
    "Μάθε να διαχειρίζεσαι τον χρόνο σου σωστά για να προλαβαίνεις τα πάντα.",
    "Η υπομονή φέρνει πάντα τα καλύτερα αποτελέσματα.",
    "Γίνε ένας καλός ακροατής για τους φίλους σου.",
    "Τα αστέρια τη νύχτα μας θυμίζουν πόσο μεγάλο είναι το σύμπαν.",
    "Η καθαρή συνείδηση φέρνει τον πιο γλυκό ύπνο.",
    "Μην σταματάς να προσπαθείς, η εξάσκηση σε κάνει καλύτερο.",
    "Η ευτυχία κρύβεται στα πιο απλά και καθημερινά πράγματα.",
    "Σέβασου τα δικαιώματα των άλλων, όπως και τα δικά σου.",
    "Η δημιουργία μιας χειροτεχνίας σου δίνει μεγάλη ικανοποίηση.",
    "Μάθε να προστατεύεις τα αδύναμα πλάσματα γύρω σου.",
    "Η δύναμη της θέλησης μπορεί να καταφέρει σπουδαία πράγματα.",
    "Κάθε πρωινό ξύπνημα είναι μια νέα ευκαιρία για χαρά.",
    "Η φιλία είναι μια γέφυρα που ενώνει τις καρδιές μας.",
    "Μην αφήνεις τον θυμό να παίρνει αποφάσεις για σένα.",
    "Η μελέτη του παρελθόντος μας βοηθάει να φτιάξουμε ένα καλύτερο μέλλον.",
    "Να είσαι πάντα έτοιμος να μάθεις κάτι καινούργιο.",
    "Η ευγένεια στους λόγους σου δείχνει έναν όμορφο χαρακτήρα.",
    "Απόλαυσε το παιχνίδι στο έπακρο, αλλά πάντα με ασφάλεια.",
    "Η αγάπη για τα ζώα μας κάνει πιο καλούς ανθρώπους.",
    "Κάθε βιβλίο που τελειώνεις είναι ένας ακόμα στόχος που πέτυχες.",
    "Η ειλικρινής συγγνώμη διορθώνει και τα μεγαλύτερα λάθη.",
    "Να είσαι ευγνώμων για τους ανθρώπους που σε αγαπούν.",
    "Η φαντασία είναι το όχημα για να αλλάξεις τον κόσμο προς το καλύτερο.",
    "Κάνε μια βόλτα στο πάρκο και νιώσε τη ζωντάνια της φύσης.",
    "Η σταθερή προσπάθεια νικάει πάντα το πηγαίο ταλέντο.",
    "Κράτα το χαμόγελό σου ζωντανό, είναι μεταδοτικό!",
    "Η σοφία ξεκινάει από την παραδοχή ότι πάντα έχουμε κάτι να μάθουμε.",
    "Μην αφήνεις τις μικρές αναποδιές να σου χαλάνε τη διάθεση.",
    "Η συνεργασία στην τάξη κάνει το μάθημα πιο διασκεδαστικό.",
    "Να είσαι περήφανος για τη μοναδικότητά σου.",
    "Η γνώση είναι το φως που διώχνει το σκοτάδι της άγνοιας.",
    "Κάθε μέρα είναι μια ευκαιρία να προσφέρεις χαρά σε κάποιον.",
    "Η υπομονή και η επιμονή είναι οι καλύτεροι σύμμαχοι της επιτυχίας.",
    "Κλείσε τη μέρα σου με μια θετική σκέψη και κοιμήσου ήρεμα!"
];

function getRandomQuote() {
    let used = [];
    try {
        used = JSON.parse(localStorage.getItem('usedQuotes')) || [];
    } catch(e) { used = []; }
    
    // Αν έχουμε δείξει πάνω από 170 προτάσεις, καθαρίζουμε το ιστορικό για να μην ξεμείνουμε
    if (used.length > 170 || used.length >= dailyQuotes.length) {
        used = [];
    }
    
    let available = [];
    for (let i = 0; i < dailyQuotes.length; i++) {
        if (!used.includes(i)) available.push(i);
    }
    
    const randomIndex = available[Math.floor(Math.random() * available.length)];
    used.push(randomIndex);
    
    try {
        localStorage.setItem('usedQuotes', JSON.stringify(used));
    } catch(e) {}
    
    return dailyQuotes[randomIndex];
}
  // Συνάρτηση Εμφάνισης Popup / Tooltip
  function showTooltip(cellFrame, posts, isModal) {
      clearTimeout(hideTimeout);
      tooltip.innerHTML = '';
      
     posts.forEach(p => {
          let a = document.createElement('a');
          a.href = p.url;
          a.className = 'tooltip-title-link';
          
          let displayTitle = p.title ? p.title : 'Χωρίς τίτλο';
          
          // 🛠️ ΔΙΟΡΘΩΣΗ: Μετατροπή των HTML Number Entities σε καθαρά εισαγωγικά "
          displayTitle = displayTitle
              .replace(/&#171;/g, '"')  // Διορθώνει το «
              .replace(/&#187;/g, '"')  // Διορθώνει το »
              .replace(/&#183;/g, '·')  // Διορθώνει την άνω τελεία αν χρειαστεί
              .replace(/\u00C2\u00AB/g, '"').replace(/\u00C2\u00BB/g, '"')
              .replace(/\u00A4\u00C3/g, '"').replace(/\u00A5\u00C3/g, '"')
              .replace(/[\u00AB\u2039]/g, '"').replace(/[\u00BB\u203A]/g, '"');

          a.innerText = displayTitle;
          tooltip.appendChild(a);
      });

      tooltip.style.display = 'block';
      tooltip.style.visibility = 'hidden'; // Κρυφό προσωρινά για υπολογισμό διαστάσεων

      if (isModal) {
          // Κινητό / Click Mode: Σκοτεινή Οθόνη και Κέντρο
          overlay.style.display = 'block';
          tooltip.style.position = 'fixed';
          tooltip.style.top = '50%';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translate(-50%, -50%) scale(0.9)';
          tooltip.style.visibility = 'visible';
          
          setTimeout(() => {
              overlay.style.opacity = '1';
              tooltip.style.opacity = '1';
              tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
          }, 10);
      } else {
          // PC Hover Mode: Ακριβώς πάνω από το κελί
          tooltip.style.position = 'absolute';
          tooltip.style.transform = 'none';
          
          const rect = cellFrame.getBoundingClientRect();
          let topPos = rect.top + window.scrollY - tooltip.offsetHeight +10;
          let leftPos = rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2);
          
          tooltip.style.top = topPos + 'px';
          tooltip.style.left = leftPos + 'px';
          tooltip.style.visibility = 'visible';
          
          setTimeout(() => { tooltip.style.opacity = '1'; }, 10);
      }
  }

  function closeTooltip() {
      overlay.style.opacity = '0';
      tooltip.style.opacity = '0';
      setTimeout(() => {
          overlay.style.display = 'none';
          tooltip.style.display = 'none';
      }, 300);
  }

  overlay.addEventListener('click', closeTooltip);
  tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
  tooltip.addEventListener('mouseleave', () => { if (window.innerWidth > 1140) closeTooltip(); });

  const feedUrl = 'https://dimperist.blogspot.com/feeds/posts/default?alt=json&max-results=500';
  
  try {
    const response = await fetch(feedUrl);
    const data = await response.json();
    
    // ΑΛΛΑΓΗ 1: Τραβάμε πλέον τον τίτλο της ανάρτησης!
    // 🛠️ ΣΥΜΠΛΗΡΩΜΑ: Φίλτρο Encoding για τους τίτλους από το RSS Feed
    const events = data.feed.entry ? data.feed.entry.map(post => {
        let cleanTitle = post.title ? post.title.$t : 'Χωρίς τίτλο';
        
        cleanTitle = cleanTitle
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
            .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
            .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
            .replace(/\u00C2\u00AB/g, '"').replace(/\u00C2\u00BB/g, '"')
            .replace(/\u00A4\u00C3/g, '"').replace(/\u00A5\u00C3/g, '"')
            .replace(/[\u00AB\u2039]/g, '"').replace(/[\u00BB\u203A]/g, '"');

        return {
            title: cleanTitle, 
            start: post.published.$t.split('T')[0],
            url: post.link.find(l => l.rel === 'alternate').href
        };
    }) : [];

    // ΑΛΛΑΓΗ 2: Ομαδοποίηση αναρτήσεων ανά ημερομηνία
    const postsByDate = {};
    events.forEach(post => {
        if (!postsByDate[post.start]) { postsByDate[post.start] = []; }
        postsByDate[post.start].push(post);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const calendarEl = document.getElementById('calendar');
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'el', 
      initialView: 'dayGridMonth',
      headerToolbar: false,
      events: events,
      height: '100%',
      contentHeight: '100%',
      displayEventTime: false,
      eventContent: function() {
        return { html: '<div class="post-dot"></div>' };
      },
      // Καταργούμε το eventClick του ημερολογίου, το αναλαμβάνει πλέον το κελί!
      datesSet: function(info) {
        const monthLabel = document.getElementById('monthLabel');
        const date = info.view.currentStart;
        const monthName = date.toLocaleString('el-GR', { month: 'long', year: 'numeric' });
        monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      },
      dayCellDidMount: function(info) {
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(info.date - tzOffset)).toISOString().slice(0, 10);
        let frame = info.el.querySelector('.fc-daygrid-day-frame');

       /// Οι άδειες μέρες (παρελθόν και σήμερα) δείχνουν την τυχαία πρόταση
        if (localISOTime <= todayStr && !postsByDate[localISOTime]) {
          let emptyDayIndicator = document.createElement('div');
          // Αν είναι παρελθόν βάζει 💤, αν είναι το σήμερα βάζει ✨ (ή ό,τι θες)
          emptyDayIndicator.innerHTML = (localISOTime < todayStr) ? '💤' : '✨'; 
          emptyDayIndicator.style.cssText = 'position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); opacity: 0.25; font-size: 20px; cursor: default; pointer-events: none;';
          if (frame) {
            frame.style.position = 'relative'; 
            frame.appendChild(emptyDayIndicator);
            
            // Ενεργοποιούμε το hover/pointer στυλ και για τις άδειες μέρες
            frame.classList.add('has-posts'); 
            
            // Hover Λειτουργία για PC (Κενή μέρα)
            frame.addEventListener('mouseenter', () => {
                if (window.innerWidth > 1140) {
                    if (!frame.dataset.quote) {
                        frame.dataset.quote = getRandomQuote(); // Παίρνει μια τυχαία πρόταση
                    }
                    showTooltip(frame, [{ title: frame.dataset.quote, url: 'javascript:void(0);' }], false);
                }
            });
            
            frame.addEventListener('mouseleave', () => {
                if (window.innerWidth > 1140) {
                    hideTimeout = setTimeout(() => {
                        closeTooltip();
                        delete frame.dataset.quote; // Καθαρισμός για την επόμενη φορά
                    }, 200);
                }
            });

            // Click / Tap Λειτουργία για Κινητά & PC (Κενή μέρα -> Ανοίγει Pop-up)
            frame.addEventListener('click', (e) => {
                e.preventDefault();
                if (!frame.dataset.quote) {
                    frame.dataset.quote = getRandomQuote();
                }
                showTooltip(frame, [{ title: frame.dataset.quote, url: 'javascript:void(0);' }], true); 
            });
          }
        }

        // Αν η μέρα ΕΧΕΙ αναρτήσεις (Ο δικός σου αρχικός κώδικας)
        if (postsByDate[localISOTime] && frame) {
            frame.classList.add('has-posts'); 
            const dayPosts = postsByDate[localISOTime];

            // Hover (μόνο για υπολογιστές)
            frame.addEventListener('mouseenter', (e) => {
                if (window.innerWidth > 1140) showTooltip(frame, dayPosts, false);
            });
            frame.addEventListener('mouseleave', () => {
                if (window.innerWidth > 1140) hideTimeout = setTimeout(closeTooltip, 200);
            });

            // Tap/Click ΟΛΟΚΛΗΡΟΥ ΤΟΥ ΚΕΛΙΟΥ
            frame.addEventListener('click', (e) => {
                e.preventDefault(); 
                if (window.innerWidth <= 1140) {
                    // Σε κινητό: ΠΑΝΤΑ σκοτεινή οθόνη (Modal)
                    showTooltip(frame, dayPosts, true);
                } else {
                    // Σε υπολογιστή: Άνοιγμα κατευθείαν αν είναι 1, αλλιώς Modal αν είναι πολλές
                    if (dayPosts.length === 1) {
                        window.open(dayPosts[0].url, '_self'); 
                    } else {
                        showTooltip(frame, dayPosts, true); 
                    }
                }
            });
        }
      }
    });

    calendar.render();

    document.getElementById('prevBtn').addEventListener('click', () => calendar.prev());
    document.getElementById('nextBtn').addEventListener('click', () => calendar.next());

    const calendarContainer = document.getElementById('calendar-container');
    let touchstartX = 0;
    let touchstartY = 0;

    calendarContainer.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, { passive: true, capture: true }); 

    calendarContainer.addEventListener('touchend', function(event) {
        let touchendX = event.changedTouches[0].screenX;
        let touchendY = event.changedTouches[0].screenY;
        let xDiff = touchendX - touchstartX;
        let yDiff = touchendY - touchstartY;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff < -40) calendar.next();
            if (xDiff > 40) calendar.prev();
        }
    }, { passive: true, capture: true });

    const calOrig = document.getElementById("calendar-original-location");
    const calWidget = document.getElementById("calendar-widget-wrapper");
    let calBase = document.getElementById("calendar-mobile-base") || Object.assign(document.createElement("div"), {id:"calendar-mobile-base", className:"widget"});

    function moveCalendar() {
        let parentWidget = calOrig ? calOrig.closest('.widget') : null;

        if (window.innerWidth <= 768) {
            let target = document.getElementById("eortologio-mobile-base") || document.getElementById("smarthub-mobile-base") || document.getElementById("HTML13");
            if (target) {
                target.after(calBase);
                calBase.appendChild(calWidget);
                calWidget.style.margin = "0 auto";
            }
            if (parentWidget) parentWidget.style.display = "none";
        } else if (calOrig && calOrig.parentNode) {
            calOrig.parentNode.insertBefore(calWidget, calOrig.nextSibling);
            if (calBase.parentNode) calBase.parentNode.removeChild(calBase);
            if (parentWidget) parentWidget.style.display = "";
        }
    }

    moveCalendar();
    window.addEventListener("resize", moveCalendar);
    window.addEventListener("load", moveCalendar);
    setTimeout(moveCalendar, 1000);

  } catch (error) {
    console.error("Σφάλμα κατά τη φόρτωση του feed:", error);
  }
});
