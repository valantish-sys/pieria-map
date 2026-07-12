let sliderPostsDesk = [];
let currentSlideIndexDesk = 0;
let autoSlideTimerDesk;
let isAnimatingDesk = false; // Νέο κλείδωμα για Desktop

// 1. Δεξαμενή με τις ΣΤΑΤΙΚΕΣ ΣΕΛΙΔΕΣ (Ανεξάρτητη για το Desktop)
let candidatePostsForExtraDesk = [
    { title: "Τα όρια δεν είναι φράχτες", link: "https://dimperist.blogspot.com/p/blog-page_8.html", image: "" },
    { title: "Αόρατος γονιός", link: "https://dimperist.blogspot.com/p/blog-page_1.html", image: "" },
    { title: "Πώς θα μεγαλώσουμε αυτόνομα και ανεξάρτητα παιδιά", link: "https://dimperist.blogspot.com/p/blog-page_13.html", image: "" },
    { title: "Τρόποι μείωσης της χρήσης οθονών από τα παιδιά", link: "https://dimperist.blogspot.com/p/blog-page.html", image: "" },
    { title: "10 τρόποι για να εκτιμά το παιδί τον εαυτό του", link: "https://dimperist.blogspot.com/p/10.html", image: "" },
    { title: "Τι κάνω όταν το παιδί μου θυμώνει;", link: "https://dimperist.blogspot.com/p/blog-page_86.html", image: "" },
    { title: "Παιδικές φοβίες: Αιτίες και Τρόποι Αντιμετώπισης", link: "https://dimperist.blogspot.com/p/blog-page_32.html", image: "" },
    { title: "Συναισθηματική ανάπτυξη & \"αρνητικά\" συναισθήματα", link: "https://dimperist.blogspot.com/p/blog-page_43.html", image: "" },
    { title: "Γράμμα παιδιού", link: "https://dimperist.blogspot.com/p/blog-page_71.html", image: "" },
    { title: "Το παιδί μου αντιμιλά, τι να κάνω;", link: "https://dimperist.blogspot.com/p/blog-page_98.html", image: "" },
    { title: "10 Συμβουλές για να αγαπήσουν τα «πρωτάκια» το σχολείο", link: "https://dimperist.blogspot.com/p/10_19.html", image: "" },
    { title: "Συμβουλές για καλύτερη επιστροφή στο σχολείο", link: "https://dimperist.blogspot.com/p/blog-page_19.html", image: "" },
    { title: "Οργάνωση μελέτης του παιδιού", link: "https://dimperist.blogspot.com/p/blog-page_20.html", image: "" },
    { title: "Πώς να κάνουν τα παιδιά να αγαπήσουν τα βιβλία", link: "https://dimperist.blogspot.com/p/blog-page_29.html", image: "" },
    { title: "Τι ΝΑ κάνετε και τι να ΜΗΝ κάνετε με το διάβασμα", link: "https://dimperist.blogspot.com/p/blog-page_64.html", image: "" },
    { title: "Bullying - Σχολικός Εκφοβισμός", link: "https://dimperist.blogspot.com/p/bullying.html", image: "" },
    { title: "Παιδική παχυσαρκία: Πρόληψη και σωστές διατροφικές συνήθειες", link: "https://dimperist.blogspot.com/p/blog-page_85.html", image: "" },
    { title: "Η άσκηση ως τρόπος ζωής", link: "https://dimperist.blogspot.com/2026/01/blog-post_14.html", image: "" },
    { title: "Ανακαλύψετε το σωστό άθλημα για το παιδί σας", link: "https://dimperist.blogspot.com/2026/02/blog-post_5.html", image: "" },
    { title: "Προστατεύομαι από τους σεισμούς", link: "https://dimperist.blogspot.com/p/blog-page_59.html", image: "" },
    { title: "Ενθαρρύνουμε τη δημιουργικότητα των παιδιών", link: "https://dimperist.blogspot.com/p/blog-page_41.html", image: "" },
    { title: "Η σημασία του παιχνιδιού στην ανάπτυξη", link: "https://dimperist.blogspot.com/p/blog-page_83.html", image: "" },
    { title: "Δραστηριότητες που αναπτύσσουν τις μαθησιακές δεξιότητες", link: "https://dimperist.blogspot.com/p/blog-page_56.html", image: "" }
];

// Ανεξάρτητη συνάρτηση εύρεσης εικόνας για το Desktop
function extractImageFromEntryDesk(entry) {
    let imageUrl = ""; let isVideo = false;
    if (entry.content && entry.content.$t) {
        const ytRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        const ytMatch = entry.content.$t.match(ytRegex);
        if (ytMatch && ytMatch[1]) { imageUrl = "https://img.youtube.com/vi/" + ytMatch[1] + "/hqdefault.jpg"; isVideo = true; }
    }
    if (!imageUrl && entry.content && entry.content.$t) {
        const imgRegex = /<img[^>]+src="([^"]+)"/i;
        const match = entry.content.$t.match(imgRegex);
        if (match) {
            imageUrl = match[1];
            if (imageUrl.includes("blogger.googleusercontent.com") || imageUrl.includes("bp.blogspot.com")) {
                imageUrl = imageUrl.replace(/\/s[0-9]+(-b|-c|-w)?\//, '/s1600/');
                imageUrl = imageUrl.replace(/=w[0-9]+-h[0-9]+(-c)?/, '=s1600');
            }
        }
    }
    if (!imageUrl && entry.media$thumbnail) {
        imageUrl = entry.media$thumbnail.url;
        imageUrl = imageUrl.replace(/\/s72-c\//, '/s1600/');
        imageUrl = imageUrl.replace(/=s72-c/, '=s1600');
    }
    if (!imageUrl) { imageUrl = "https://via.placeholder.com/350x220?text=Χωρίς+Εικόνα"; }
    return { imageUrl, isVideo };
}

// 2. Φόρτωση των Δημοφιλών Αναρτήσεων (Desktop)
function fetchBloggerPostsDesk(json) {
    const entries = json.feed.entry;
    if (!entries) return;
    const targetDate = new Date("2021-09-11T00:00:00Z");

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const publishedDate = new Date(entry.published.$t);
        if (publishedDate >= targetDate && sliderPostsDesk.length < 20) {
            let title = entry.title.$t;
            let postLink = "";
            for (let j = 0; j < entry.link.length; j++) {
                if (entry.link[j].rel === "alternate") { postLink = entry.link[j].href; break; }
            }
            let media = extractImageFromEntryDesk(entry);
            sliderPostsDesk.push({ title, link: postLink, image: media.imageUrl, isVideo: media.isVideo });
        }
    }

    // Κλήση του νέου script ετικετών για το Desktop
    let scriptDesk = document.createElement('script');
    scriptDesk.src = "/feeds/posts/default/-/Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι?alt=json-in-script&max-results=50&callback=fetchLabelPostsForSliderDesk";
    document.body.appendChild(scriptDesk);
}

// 3. Φόρτωση Αναρτήσεων με Ετικέτες (Δυναμική προσθήκη για το Desktop)
function fetchLabelPostsForSliderDesk(json) {
    if (json && json.feed && json.feed.entry) {
        json.feed.entry.forEach(entry => {
            let title = entry.title.$t;
            let postLink = "";
            for (let j = 0; j < entry.link.length; j++) {
                if (entry.link[j].rel === "alternate") { postLink = entry.link[j].href; break; }
            }
            let media = extractImageFromEntryDesk(entry);
            candidatePostsForExtraDesk.push({ title, link: postLink, image: media.imageUrl, isVideo: media.isVideo });
        });
    }

    const weekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const weeklyPick = candidatePostsForExtraDesk[weekNum % candidatePostsForExtraDesk.length];
    
    const safeImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdYTGP-KF_2ZHc7ykgjO533JVSDXYPsg36Oi3XC0Z6UN-yEKAhpbsK5PME3r9Q_WeAXn-c20sWAmLR65slEVQSaYaDVKLuYQtaqbjuGyH71VxJxgZqWx5vG1JSCOFlqWswSphTn6Zup1d8Uz9Ie2Tq9CQeHmWBPusLJ7rc_bPJkiau4W47iSy6cSp60N4/s800/Gemini_Generated_Image_1itzx51itzx51itz.png";

    const weeklyPostObj = {
        title: "⭐ " + weeklyPick.title,
        link: weeklyPick.link,
        image: weeklyPick.image || safeImage,
        isVideo: weeklyPick.isVideo || false
    };

    // Εισαγωγή στην 21η θέση (index 20) επειδή το Desktop δείχνει 20 αναρτήσεις
    if (sliderPostsDesk.length >= 20) {
        sliderPostsDesk.splice(20, 0, weeklyPostObj);
    } else {
        sliderPostsDesk.push(weeklyPostObj);
    }

    if (sliderPostsDesk.length > 21) {
        sliderPostsDesk = sliderPostsDesk.slice(0, 21);
    }

    buildSliderDesk();
}

function buildSliderDesk() {
    const container = document.getElementById("slider-content-desktop");
    const arrowPrev = document.querySelector('#custom-post-slider-desktop .arrow-prev');
    const arrowNext = document.querySelector('#custom-post-slider-desktop .arrow-next');
    
    if(sliderPostsDesk.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις μετά τις 11/09/2021.</p>";
        arrowPrev.classList.add('hidden-arrow');
        arrowNext.classList.add('hidden-arrow');
        return;
    }

    let htmlOutput = "";
    sliderPostsDesk.forEach((post, index) => {
        let activeClass = index === 0 ? "active" : "";
        let videoBadgeHtml = post.isVideo ? `<div class="video-badge">&#9654;</div>` : "";
        
        htmlOutput += `
            <div class="slide-item ${activeClass}">
                <a href="${post.link}" class="slide-link">
                    ${videoBadgeHtml}
                    <div class="slide-counter">${index + 1} / ${sliderPostsDesk.length}</div>
                    <img src="${post.image}" alt="${post.title}">
                    <div class="slide-title-wrapper">
                        <div class="slide-title">${post.title}</div>
                    </div>
                </a>
            </div>
        `;
    });
    
    container.innerHTML = htmlOutput;
    
    if (sliderPostsDesk.length > 1) {
        arrowPrev.classList.remove('hidden-arrow');
        arrowNext.classList.remove('hidden-arrow');
        startAutoSlideDesk();
        initSwipeDesk();
        initHoverPauseDesk();
    } else {
        arrowPrev.classList.add('hidden-arrow');
        arrowNext.classList.add('hidden-arrow');
    }
}

function showSlideDesk(index) {
    const slides = document.querySelectorAll("#custom-post-slider-desktop .slide-item");
    if (slides.length === 0) return;
    
    slides.forEach(slide => slide.classList.remove("active"));
    if (index >= sliderPostsDesk.length) currentSlideIndexDesk = 0;
    if (index < 0) currentSlideIndexDesk = sliderPostsDesk.length - 1;
    slides[currentSlideIndexDesk].classList.add("active");
}

function moveSlideDesk(step) {
    if (isAnimatingDesk) return; // Προστασία από spamming κλικ στο Desktop
    isAnimatingDesk = true;

    currentSlideIndexDesk += step;
    showSlideDesk(currentSlideIndexDesk);
    resetAutoSlideDesk(); 
    
    setTimeout(() => { isAnimatingDesk = false; }, 500); // Ξεκλειδώνει μετά από 500ms
}

function startAutoSlideDesk() {
    clearInterval(autoSlideTimerDesk);
    autoSlideTimerDesk = setInterval(() => { moveSlideDesk(1); }, 3000); // Χρόνος στα 3000ms όπως στο mobile
}

function resetAutoSlideDesk() {
    clearInterval(autoSlideTimerDesk);
    if (sliderPostsDesk.length > 1) startAutoSlideDesk();
}

function initSwipeDesk() {
    const sliderElem = document.getElementById("custom-post-slider-desktop");
    let touchStartX = 0; let touchEndX = 0;
    sliderElem.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    sliderElem.addEventListener("touchend", e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 40) moveSlideDesk(1);  
        if (touchEndX - touchStartX > 40) moveSlideDesk(-1); 
    }, {passive: true});
}

function initHoverPauseDesk() {
    const sliderElem = document.getElementById("custom-post-slider-desktop");
    if (!sliderElem) return;
    sliderElem.addEventListener("mouseenter", () => clearInterval(autoSlideTimerDesk));
    sliderElem.addEventListener("mouseleave", resetAutoSlideDesk);
}
