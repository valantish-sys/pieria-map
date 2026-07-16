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
    scriptDesk.src = "/feeds/posts/default/-/Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι|Γενικά?alt=json-in-script&max-results=50&callback=fetchLabelPostsForSliderDesk";
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
    autoSlideTimerDesk = setInterval(() => { moveSlideDesk(1); }, 2000); // Χρόνος στα 3000ms όπως στο mobile
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
</script>

<script src="/feeds/posts/default/-/δημοφιλή?alt=json-in-script&max-results=20&callback=fetchBloggerPostsDesk"></script>












<style>
/* Εμφάνιση ΜΟΝΟ σε PC */
#slider-wrapper-desktop { display: block; }
@media (max-width: 768px) {
    #slider-wrapper-desktop { display: none !important; }
}

.slider-main-title { text-align: center; font-weight: 800; font-size: 18px; margin: 0 0 15px 0; color: #a90e0e; font-family: 'Inter', Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px; display: table; margin: 0 auto 15px auto; padding: 6px 18px; background: #f8f8f8; border: 1px solid #eeeeee; border-radius: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.slider-main-title::before { content: '🔥 '; font-size: 16px; margin-right: 4px; }
@media (min-width: 769px) { .slider-main-title { font-size: 30px !important; padding: 5px 13px !important; margin-bottom: 11px !important; } .slider-main-title::before { font-size: 18px !important; } }

#custom-post-slider-desktop { position: relative; width: 100%; margin: 0 auto; overflow: hidden; border-radius: 12px; background: transparent; }
.slide-item { display: none; width: 100%; position: relative; animation: slideFade 0.8s ease; border-radius: 12px; overflow: hidden; }
.slide-item.active { display: block; }
#custom-post-slider-desktop a.slide-link, #custom-post-slider-desktop a.slide-link:hover { background: none !important; text-decoration: none !important; border: none !important; padding: 0 !important; display: block !important; }
#custom-post-slider-desktop .slide-item img { width: 100% !important; height: 220px !important; object-fit: cover !important; display: block !important; border-radius: 12px !important; margin: 0 !important; transition: transform 0.4s ease !important; }
.slide-item:hover img { transform: scale(1.04) !important; }
.slide-title-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; padding: 10px; box-sizing: border-box; z-index: 2; }
.slide-title { background: rgba(255, 255, 255, 0.85) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; color: #a90e0e !important; padding: 2px 4px !important; font-size: 12px !important; font-weight: 700 !important; font-family: 'Inter', Arial, sans-serif !important; text-align: center !important; border-radius: 10px !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: normal !important; word-wrap: break-word !important; line-height: 1.4 !important; max-height: 3.6em !important; border: 1px solid rgba(255, 255, 255, 0.4) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; transition: all 0.3s ease !important; margin: 0 !important; backface-visibility: hidden !important; -webkit-backface-visibility: hidden !important; transform: translateZ(0) !important; }
.slide-item:hover .slide-title { background: #a90e0e !important; color: #ffffff !important; border-color: #a90e0e !important; }

#custom-post-slider-desktop .slider-arrow { position: absolute !important; top: 50% !important; transform: translateY(-50%) !important; background: rgba(255, 255, 255, 0.6) !important; color: #333 !important; border: none !important; cursor: pointer !important; width: 28px !important; height: 28px !important; padding: 0 !important; border-radius: 50% !important; font-size: 14px ; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 20 !important; transition: background 0.3s, color 0.3s, transform 0.2s !important; box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important; opacity: 1 !important; visibility: visible !important; }
#custom-post-slider-desktop .slider-arrow:hover { background: rgba(255, 255, 255, 0.95) !important; color: #a90e0e !important; transform: translateY(-50%) scale(1.1) !important; }
.arrow-prev { left: 2px !important; }
.arrow-next { right: 2px !important; }
.hidden-arrow { display: none !important; }
@keyframes slideFade { from { opacity: 0.4; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.video-badge { position: absolute; top: 4px; left: 4px; background: rgba(169, 14, 14, 0.85) !important; color: #ffffff !important; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 13px; padding-left: 2px; box-sizing: border-box; pointer-events: none; transition: all 0.3s ease !important; }
.slide-item:hover .video-badge { background: rgba(17, 11, 11, 0.95) !important; transform: scale(1.08); }
.slide-counter { position: absolute; top: 4px; right: 4px; background: rgba(17, 17, 17, 0.7); color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; font-family: 'Inter', Arial, sans-serif; z-index: 10; pointer-events: none; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
/* ΣΥΜΠΛΗΡΩΜΑ: Καθαρός τίτλος με τσαχπινιά & κίνηση */
#slider-wrapper-desktop .slider-main-title {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    font-size: 19px !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; /* Ομαλή κίνηση με ελαστικότητα */
}

/* ΣΥΜΠΛΗΡΩΜΑ: Καθαρός τίτλος με διακριτική, κομψή κίνηση (minimal hover) */
#slider-wrapper-desktop .slider-main-title {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    font-size: 14px !important;
    position: relative !important;
}

/* Η διακριτική γραμμή που εμφανίζεται από κάτω */
#slider-wrapper-desktop .slider-main-title::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px; /* Απόσταση της γραμμής από το κείμενο */
    left: 50%;
    background-color: #a90e0e;
    transition: width 0.3s ease;
    transform: translateX(-50%);
    opacity: 0.7;
}

/* Εφέ: Η γραμμή απλώνεται όταν περνάς το ποντίκι */
#slider-wrapper-desktop:hover .slider-main-title::after,
#slider-wrapper-desktop .slider-main-title:hover::after {
    width: 100%;
}

/* Μια ανεπαίσθητη κίνηση στη φωτιά */
#slider-wrapper-desktop .slider-main-title::before {
    display: inline-block;
    transition: transform 0.3s ease !important;
}

#slider-wrapper-desktop:hover .slider-main-title::before,
#slider-wrapper-desktop .slider-main-title:hover::before {
    transform: scale(1.05) rotate(5deg) !important; /* Ελάχιστη μεγέθυνση και κλίση */
}
/* ΔΙΟΡΘΩΣΗ: Εξασφάλιση εμφάνισης 2 ολόκληρων σειρών στον τίτλο */
#custom-post-slider-desktop .slide-title {
    max-height: 4.2em !important; /* Αυξήθηκε για να χωράει το padding μαζί με τις 2 σειρές */
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important; /* Κόψιμο με αποσιωπητικά (...) ΜΟΝΟ αν ξεπεράσει τις 2 σειρές */
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
}

</style>

<div id="slider-wrapper-desktop">
    <h3 class="slider-main-title">Δημοφιλείς Αναρτήσεις</h3>
    <div id="custom-post-slider-desktop">
        <button class="slider-arrow arrow-prev hidden-arrow" onclick="moveSlideDesk(-1)">&#10094;</button>
        <div id="slider-content-desktop">
            <p style="text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;">Φόρτωση αναρτήσεων...</p>
        </div>
        <button class="slider-arrow arrow-next hidden-arrow" onclick="moveSlideDesk(1)">&#10095;</button>
    </div>
</div>

<script>
let sliderPostsDesk = [];
let currentSlideIndexDesk = 0;
let autoSlideTimerDesk;

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
                if (entry.link[j].rel === "alternate") {
                    postLink = entry.link[j].href;
                    break;
                }
            }

            let imageUrl = "";
            let isVideo = false;

            if (entry.content && entry.content.$t) {
                const ytRegex = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
                const ytMatch = entry.content.$t.match(ytRegex);
                if (ytMatch && ytMatch[1]) {
                    imageUrl = "https://img.youtube.com/vi/" + ytMatch[1] + "/hqdefault.jpg";
                    isVideo = true;
                }
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

            sliderPostsDesk.push({ title, link: postLink, image: imageUrl, isVideo: isVideo });
        }
    }
    buildSliderDesk();
}

function buildSliderDesk() {
    const container = document.getElementById("slider-content-desktop");
    const arrowPrev = document.querySelector('#custom-post-slider-desktop .arrow-prev');
    const arrowNext = document.querySelector('#custom-post-slider-desktop .arrow-next');
    
    if(sliderPostsDesk.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις μετά τις 11/09/2025.</p>";
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
    currentSlideIndexDesk += step;
    showSlideDesk(currentSlideIndexDesk);
    resetAutoSlideDesk(); 
}

function startAutoSlideDesk() {
    autoSlideTimerDesk = setInterval(() => { moveSlideDesk(1); }, 2000);
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
