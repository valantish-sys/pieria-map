(() => {
    "use strict";

    const CONFIG = Object.freeze({
        feedUrl: 'https://dimperist.blogspot.com/feeds/posts/default?alt=json&max-results=500',
        mobileBreakpoint: 1140, layoutBreakpoint: 768, tooltipDelay: 200,
        quotes: [
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
        ]
    });

    // 🚀 DOM CACHE - Άδειο στην αρχή! Θα γεμίσει ΑΦΟΥ φορτώσει η σελίδα.
    const DOM = {};

    const Utils = {
        debounce: (func, delay) => {
            let timeout;
            return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), delay); };
        },
        
        // 🚀 Senior Move: Ασφαλής 100% καθαρισμός συμβόλων μέσω Native Browser API (No XSS Regex vulnerabilities)
        cleanTitle: (rawStr) => {
            if (!rawStr) return 'Χωρίς τίτλο';
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawStr, 'text/html');
            return doc.documentElement.textContent || rawStr;
        },

        getQuote: () => {
            let used = [];
            try { used = JSON.parse(localStorage.getItem('calUsedQuotes')) || []; } catch(e) {} // Fallback για Safari Private Mode
            
            if (used.length >= CONFIG.quotes.length) used = [];
            
            const usedSet = new Set(used);
            const available = CONFIG.quotes.map((_, i) => i).filter(i => !usedSet.has(i));
            const randomIndex = available.length ? available[Math.floor(Math.random() * available.length)] : 0;
            
            used.push(randomIndex);
            try { localStorage.setItem('calUsedQuotes', JSON.stringify(used)); } catch(e) {}
            
            return CONFIG.quotes[randomIndex];
        },

        // 🚀 Fix Timezone Bug: Η local ημερομηνία της συσκευής (Όχι UTC Λονδίνου)
        getTodayStr: () => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    };

    const DataEngine = {
        postsByDate: new Map(), // Χρήση Map αντί για object (O(1) lookups & proper hash structure)
        fetchData: async () => {
            try {
                const response = await fetch(CONFIG.feedUrl);
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                
                const data = await response.json();
                
                if (data.feed?.entry) {
                    data.feed.entry.forEach(post => {
                        const dateStr = post.published.$t.split('T')[0];
                        const linkObj = post.link.find(l => l.rel === 'alternate');
                        
                        if (!DataEngine.postsByDate.has(dateStr)) DataEngine.postsByDate.set(dateStr, []);
                        
                        DataEngine.postsByDate.get(dateStr).push({
                            title: Utils.cleanTitle(post.title?.$t),
                            url: linkObj ? linkObj.href : '#'
                        });
                    });
                }
            } catch (error) { console.error("Ημερολόγιο Data Engine Error:", error); }
        }
    };

    const UIEngine = {
        hideTimeout: null, currentHoveredFrame: null,
        init: () => {
            DOM.overlay = document.createElement('div');
            DOM.overlay.id = 'calendar-overlay';
            DOM.overlay.setAttribute('aria-hidden', 'true');
            
            DOM.tooltip = document.createElement('div');
            DOM.tooltip.id = 'calendar-tooltip';
            DOM.tooltip.setAttribute('role', 'dialog');
            DOM.tooltip.setAttribute('aria-modal', 'true');

            document.body.append(DOM.overlay, DOM.tooltip);

            DOM.overlay.addEventListener('click', UIEngine.closeTooltip);
            DOM.tooltip.addEventListener('mouseenter', () => clearTimeout(UIEngine.hideTimeout));
            DOM.tooltip.addEventListener('mouseleave', () => { if (window.innerWidth > CONFIG.mobileBreakpoint) UIEngine.closeTooltip(); });

            // 🚀 Accessibility Standard: Το Modal πρέπει να κλείνει με Esc
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && DOM.tooltip.classList.contains('is-active')) UIEngine.closeTooltip();
            });
        },

        showTooltip: (cellFrame, posts, isModal) => {
            clearTimeout(UIEngine.hideTimeout);
            DOM.tooltip.innerHTML = '';
            
            posts.forEach(p => {
                const a = document.createElement('a');
                a.href = p.url;
                a.className = 'tooltip-title-link';
                a.textContent = p.title; // Απόλυτη προστασία από XSS Inject
                DOM.tooltip.appendChild(a);
            });

            if (isModal) {
                DOM.tooltip.className = 'mode-modal';
                DOM.overlay.classList.add('is-visible');
            } else {
                DOM.tooltip.className = '';
                const rect = cellFrame.getBoundingClientRect();
                const topPos = rect.top + window.scrollY - DOM.tooltip.offsetHeight - 5;
                const leftPos = rect.left + window.scrollX + (rect.width / 2) - (DOM.tooltip.offsetWidth / 2);
                
                DOM.tooltip.style.top = `${Math.max(10, topPos)}px`;
                DOM.tooltip.style.left = `${Math.max(10, leftPos)}px`;
            }
            
            // Allow display:block to paint before triggering opacity transition
            requestAnimationFrame(() => requestAnimationFrame(() => DOM.tooltip.classList.add('is-active')));
        },

        closeTooltip: () => {
            DOM.overlay.classList.remove('is-visible');
            DOM.tooltip.classList.remove('is-active');
        }
    };

    const CalendarEngine = {
        calendar: null,
        init: () => {
            if (!DOM.calendarEl || !window.FullCalendar) return;
            const todayStr = Utils.getTodayStr();

            CalendarEngine.calendar = new window.FullCalendar.Calendar(DOM.calendarEl, {
                locale: 'el', initialView: 'dayGridMonth', headerToolbar: false,
                height: 'auto', displayEventTime: false,
                
                datesSet: (info) => {
                    if (!DOM.monthLabel) return;
                    const monthName = info.view.currentStart.toLocaleString('el-GR', { month: 'long', year: 'numeric' });
                    DOM.monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                },

                dayCellDidMount: (info) => {
                    const cellDateStr = info.el.dataset.date; 
                    const frame = info.el.querySelector('.fc-daygrid-day-frame');
                    if (!frame) return;

                    frame.style.position = 'relative'; 

                    if (DataEngine.postsByDate.has(cellDateStr)) {
                        frame.classList.add('has-posts');
                        // 🚀 A11y Focusable element
                        frame.setAttribute('tabindex', '0');
                        frame.setAttribute('role', 'button');
                        frame.setAttribute('aria-label', `Άνοιγμα ${DataEngine.postsByDate.get(cellDateStr).length} αναρτήσεων`);
                        
                        const dot = document.createElement('div');
                        dot.className = 'post-dot';
                        frame.appendChild(dot);
                    } else if (cellDateStr <= todayStr) {
                        const indicator = document.createElement('div');
                        indicator.className = 'empty-day-icon';
                        indicator.textContent = (cellDateStr < todayStr) ? '💤' : '✨'; 
                        indicator.setAttribute('aria-hidden', 'true');
                        frame.appendChild(indicator);
                    }
                }
            });

            CalendarEngine.calendar.render();
            CalendarEngine.setupEvents();
        },

        setupEvents: () => {
            DOM.prevBtn?.addEventListener('click', () => CalendarEngine.calendar.prev());
            DOM.nextBtn?.addEventListener('click', () => CalendarEngine.calendar.next());

            if (!DOM.container) return;

            const handleInteraction = (frame, type) => {
                const cell = frame.closest('.fc-daygrid-day');
                if (!cell) return;
                
                const dateStr = cell.dataset.date;
                const todayStr = Utils.getTodayStr();
                const posts = DataEngine.postsByDate.get(dateStr);

                if (!posts && dateStr > todayStr) return;

                let content = posts;
                if (!posts) {
                    if (!frame.dataset.quote) frame.dataset.quote = Utils.getQuote();
                    content = [{ title: frame.dataset.quote, url: 'javascript:void(0);' }];
                }

                if (type === 'click' || type === 'keyboard') {
                    if (window.innerWidth <= CONFIG.mobileBreakpoint) {
                        UIEngine.showTooltip(frame, content, true);
                    } else {
                        if (posts && posts.length === 1 && posts[0].url !== 'javascript:void(0);') {
                            window.location.href = posts[0].url; 
                        } else {
                            UIEngine.showTooltip(frame, content, true);
                        }
                    }
                } else if (type === 'hover' && window.innerWidth > CONFIG.mobileBreakpoint) {
                    UIEngine.showTooltip(frame, content, false);
                }
            };

            DOM.container.addEventListener('click', (e) => {
                const frame = e.target.closest('.fc-daygrid-day-frame');
                if (frame) { e.preventDefault(); handleInteraction(frame, 'click'); }
            });

            // 🚀 Accessibility: Enter key event
            DOM.container.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const frame = e.target.closest('.fc-daygrid-day-frame');
                    if (frame) { e.preventDefault(); handleInteraction(frame, 'keyboard'); }
                }
            });

            DOM.container.addEventListener('mouseover', (e) => {
                const frame = e.target.closest('.fc-daygrid-day-frame');
                if (frame && frame !== UIEngine.currentHoveredFrame) {
                    UIEngine.currentHoveredFrame = frame;
                    handleInteraction(frame, 'hover');
                }
            });

            DOM.container.addEventListener('mouseout', (e) => {
                const frame = e.target.closest('.fc-daygrid-day-frame');
                if (frame && !frame.contains(e.relatedTarget)) {
                    UIEngine.currentHoveredFrame = null;
                    UIEngine.hideTimeout = setTimeout(UIEngine.closeTooltip, CONFIG.tooltipDelay);
                }
            });
            
            // Swipe events
            let startX = 0, startY = 0;
            DOM.container.addEventListener('touchstart', e => {
                startX = e.changedTouches[0].screenX; startY = e.changedTouches[0].screenY;
            }, { passive: true });

            DOM.container.addEventListener('touchend', e => {
                const diffX = e.changedTouches[0].screenX - startX;
                const diffY = e.changedTouches[0].screenY - startY;
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < -40) CalendarEngine.calendar.next();
                    if (diffX > 40) CalendarEngine.calendar.prev();
                }
            }, { passive: true });
        }
    };

    const LayoutManager = {
        getOrCreateBase: () => {
            if (DOM.calBase) return DOM.calBase;
            let base = document.getElementById("calendar-mobile-base");
            if (!base) {
                base = document.createElement("div");
                base.id = "calendar-mobile-base";
                base.className = "widget";
            }
            DOM.calBase = base;
            return base;
        },
        move: () => {
            if (!DOM.calOrig || !DOM.calWidget) return;
            let parentWidget = DOM.calOrig.closest('.widget');

            if (window.innerWidth <= CONFIG.layoutBreakpoint) {
                let target = document.getElementById("eortologio-mobile-base") || document.getElementById("smarthub-mobile-base") || document.getElementById("HTML13");
                if (target) {
                    const base = LayoutManager.getOrCreateBase();
                    if (base.parentNode !== target.parentNode || base.previousSibling !== target) target.after(base);
                    if (DOM.calWidget.parentNode !== base) base.appendChild(DOM.calWidget);
                }
                if (parentWidget) parentWidget.style.display = "none";
            } else {
                if (DOM.calWidget.parentNode !== DOM.calOrig.parentNode) DOM.calOrig.parentNode.insertBefore(DOM.calWidget, DOM.calOrig.nextSibling);
                if (DOM.calBase?.parentNode) DOM.calBase.remove();
                if (parentWidget) parentWidget.style.display = "";
            }
        }
    };

    const AppController = {
        init: async () => {
            // 🚀 Ασφαλές DOM Caching (Τρέχει ΜΟΝΟ αφού φορτώσει η σελίδα)
            DOM.calendarEl = document.getElementById('calendar');
            DOM.container = document.getElementById('calendar-container');
            DOM.monthLabel = document.getElementById('monthLabel');
            DOM.prevBtn = document.getElementById('prevBtn');
            DOM.nextBtn = document.getElementById('nextBtn');
            DOM.calOrig = document.getElementById("calendar-original-location");
            DOM.calWidget = document.getElementById("calendar-widget-wrapper");

            UIEngine.init();
            LayoutManager.move();
            window.addEventListener("resize", Utils.debounce(LayoutManager.move, 150), { passive: true });
            
            await DataEngine.fetchData();
            
            // 🚀 Race condition fix: Περιμένουμε το script του FullCalendar να είναι fully loaded
            const ensureFCLoaded = setInterval(() => {
                if (window.FullCalendar) {
                    clearInterval(ensureFCLoaded);
                    CalendarEngine.init();
                }
            }, 50);
            setTimeout(() => clearInterval(ensureFCLoaded), 5000); // Fail-safe (timeout μετά από 5 δευτ.)
        }
    };

    // Εγγυημένη εκκίνηση
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AppController.init);
    } else {
        AppController.init();
    }
})();
