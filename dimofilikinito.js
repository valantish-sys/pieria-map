let sliderPostsMob = [];
let currentSlideIndexMob = 0;
let autoSlideTimerMob;

// 1. Δεξαμενή με τις ΣΤΑΤΙΚΕΣ ΣΕΛΙΔΕΣ (επειδή δεν έχουν ετικέτες στο Blogger)
let candidatePostsFor16 = [
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

// Συνάρτηση για εύρεση εικόνας (επαναχρησιμοποιήσιμη)
function extractImageFromEntry(entry) {
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

// 2. Φόρτωση των Δημοφιλών Αναρτήσεων
function fetchBloggerPostsMob(json) {
    const entries = json.feed.entry;
    if (!entries) return;
    const targetDate = new Date("2021-09-11T00:00:00Z");

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const publishedDate = new Date(entry.published.$t);
        if (publishedDate >= targetDate && sliderPostsMob.length < 15) {
            let title = entry.title.$t;
            let postLink = "";
            for (let j = 0; j < entry.link.length; j++) {
                if (entry.link[j].rel === "alternate") { postLink = entry.link[j].href; break; }
            }
            let media = extractImageFromEntry(entry);
            sliderPostsMob.push({ title, link: postLink, image: media.imageUrl, isVideo: media.isVideo });
        }
    }

    // Μόλις κατέβουν τα δημοφιλή, καλούμε το script για τις ετικέτες
    let script = document.createElement('script');
    script.src = "/feeds/posts/default/-/Διαπαιδαγώγηση|Ψυχολογία|Σχολείο|Υγεία|Παιχνίδι?alt=json-in-script&max-results=50&callback=fetchLabelPostsForSlider";
    document.body.appendChild(script);
}

// 3. Φόρτωση Αναρτήσεων με Ετικέτες (για να γεμίσει η 16η θέση δυναμικά)
function fetchLabelPostsForSlider(json) {
    if (json && json.feed && json.feed.entry) {
        json.feed.entry.forEach(entry => {
            let title = entry.title.$t;
            let postLink = "";
            for (let j = 0; j < entry.link.length; j++) {
                if (entry.link[j].rel === "alternate") { postLink = entry.link[j].href; break; }
            }
            let media = extractImageFromEntry(entry);
            candidatePostsFor16.push({ title, link: postLink, image: media.imageUrl, isVideo: media.isVideo });
        });
    }

    // Υπολογίζουμε την εβδομάδα και διαλέγουμε ένα άρθρο από τη συνολική δεξαμενή
    const weekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const weeklyPick = candidatePostsFor16[weekNum % candidatePostsFor16.length];
    
    // Εδώ είναι η διορθωμένη εικόνα που δεν θα σπάει ποτέ
    const safeImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgdYTGP-KF_2ZHc7ykgjO533JVSDXYPsg36Oi3XC0Z6UN-yEKAhpbsK5PME3r9Q_WeAXn-c20sWAmLR65slEVQSaYaDVKLuYQtaqbjuGyH71VxJxgZqWx5vG1JSCOFlqWswSphTn6Zup1d8Uz9Ie2Tq9CQeHmWBPusLJ7rc_bPJkiau4W47iSy6cSp60N4/s320/Gemini_Generated_Image_1itzx51itzx51itz.png";

    const weeklyPostObj = {
        title: "⭐ " + weeklyPick.title,
        link: weeklyPick.link,
        image: weeklyPick.image || safeImage,
        isVideo: weeklyPick.isVideo || false
    };

    // Εισαγωγή στη 16η θέση (index 15)
    if (sliderPostsMob.length >= 15) {
        sliderPostsMob.splice(15, 0, weeklyPostObj);
    } else {
        sliderPostsMob.push(weeklyPostObj);
    }

    if (sliderPostsMob.length > 16) {
        sliderPostsMob = sliderPostsMob.slice(0, 16);
    }

    buildSliderMob();
}

function buildSliderMob() {
    const container = document.getElementById("slider-content-mobile");
    const arrowPrev = document.querySelector('#custom-post-slider-mobile .arrow-prev');
    const arrowNext = document.querySelector('#custom-post-slider-mobile .arrow-next');
    if(sliderPostsMob.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις.</p>";
        return;
    }
    let htmlOutput = "";
    sliderPostsMob.forEach((post, index) => {
        let activeClass = index === 0 ? "active" : "";
        let videoBadgeHtml = post.isVideo ? `<div class="video-badge">&#9654;</div>` : "";
        htmlOutput += `<div class="slide-item ${activeClass}"><a href="${post.link}" class="slide-link">${videoBadgeHtml}<div class="slide-counter">${index + 1} / ${sliderPostsMob.length}</div><img src="${post.image}" alt="${post.title}"><div class="slide-title-wrapper"><div class="slide-title">${post.title}</div></div></a></div>`;
    });
    container.innerHTML = htmlOutput;
    if (sliderPostsMob.length > 1) {
        arrowPrev.classList.remove('hidden-arrow'); arrowNext.classList.remove('hidden-arrow');
        startAutoSlideMob(); initSwipeMob();
    }
}

function showSlideMob(index) {
    const slides = document.querySelectorAll("#custom-post-slider-mobile .slide-item");
    if (slides.length === 0) return;
    slides.forEach(slide => slide.classList.remove("active"));
    if (index >= sliderPostsMob.length) currentSlideIndexMob = 0;
    if (index < 0) currentSlideIndexMob = sliderPostsMob.length - 1;
    slides[currentSlideIndexMob].classList.add("active");
}

let isAnimatingMob = false; // Πρόσθεσε αυτή τη γραμμή έξω από τις συναρτήσεις

function moveSlideMob(step) {
    if (isAnimatingMob) return; // Αν κινείται ήδη, ακυρώνει το νέο πάτημα
    isAnimatingMob = true;
    
    currentSlideIndexMob += step;
    showSlideMob(currentSlideIndexMob);
    resetAutoSlideMob();
    
    // Ξεκλειδώνει μετά από 500ms (μισό δευτερόλεπτο)
    setTimeout(() => { isAnimatingMob = false; }, 500);
}

function startAutoSlideMob() {
    clearInterval(autoSlideTimerMob); // Καθαρίζει το προηγούμενο πριν ξεκινήσει νέο
    autoSlideTimerMob = setInterval(() => { moveSlideMob(1); }, 3000); // Το πήγα στα 3 δευτερόλεπτα για να είναι πιο αργό
}

function resetAutoSlideMob() {
    clearInterval(autoSlideTimerMob);
    if (sliderPostsMob.length > 1) startAutoSlideMob();
}
function initSwipeMob() {
    const sliderElem = document.getElementById("custom-post-slider-mobile");
    let touchStartX = 0; let touchEndX = 0;
    sliderElem.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    sliderElem.addEventListener("touchend", e => { touchEndX = e.changedTouches[0].screenX; if (touchStartX - touchEndX > 40) moveSlideMob(1); if (touchEndX - touchStartX > 40) moveSlideMob(-1); }, {passive: true});
}
</script>
<script src="/feeds/posts/default/-/δημοφιλή?alt=json-in-script&max-results=15&callback=fetchBloggerPostsMob"></script>








<style>
/* --- ΑΠΟΛΥΤΗ ΑΠΟΚΡΥΨΗ ΣΕ PC (Κουτί & Περιεχόμενο) --- */
@media screen and (min-width: 769px) {
    #slider-wrapper-mobile { display: none !important; }
    .widget:has(#slider-wrapper-mobile) {
        display: none !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }
}

/* --- CSS ΓΙΑ ΚΙΝΗΤΑ --- */
@media screen and (max-width: 768px) {
    #slider-wrapper-mobile { display: block !important; margin: 0 auto 25px auto !important; width: 100%; max-width: 530px; }
    .slider-main-title { text-align: center; font-weight: 800; font-size: 14px; color: #a90e0e; font-family: 'Inter', Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px; display: table; margin: 0 auto 5px auto; padding: 3px 8px; background: #f8f8f8; border: 1px solid #eeeeee; border-radius: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    .slider-main-title::before { content: '🔥 '; font-size: 16px; margin-right: 4px; }
    #custom-post-slider-mobile { position: relative; width: 100%; margin: 0 auto; overflow: hidden; border-radius: 12px; background: transparent; }
    
    /* Σωστή απόκρυψη των ανενεργών slides */
    #custom-post-slider-mobile .slide-item { display: none; width: 100%; position: relative; animation: slideFadeMob 0.8s ease; border-radius: 12px; overflow: hidden; }
    #custom-post-slider-mobile .slide-item.active { display: block !important; }
    
    #custom-post-slider-mobile a.slide-link, #custom-post-slider-mobile a.slide-link:hover { background: none !important; text-decoration: none !important; border: none !important; padding: 0 !important; display: block !important; }
    #custom-post-slider-mobile .slide-item img { width: 100% !important; height: 300px !important; object-fit: cover !important; display: block !important; border-radius: 12px !important; margin: 0 !important; transition: transform 0.4s ease !important; }
    .slide-title-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; padding: 0px; box-sizing: border-box; z-index: 2; }
    .slide-title { background: rgba(255, 255, 255, 0.85) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; color: #a90e0e !important; padding: 2px 2px !important; font-size: 15px !important; font-weight: 700 !important; font-family: 'Inter', Arial, sans-serif !important; text-align: center !important; border-radius: 10px !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: normal !important; word-wrap: break-word !important; line-height: 1.4 !important; max-height: 3.6em !important; border: 1px solid rgba(255, 255, 255, 0.4) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; margin: 0 !important; backface-visibility: hidden !important; -webkit-backface-visibility: hidden !important; transform: translateZ(0) !important; }
    #custom-post-slider-mobile .slider-arrow { position: absolute !important; top: 50% !important; transform: translateY(-50%) !important; background: rgba(255, 255, 255, 0.7) !important; color: #333 !important; border: none !important; cursor: pointer !important; width: 30px !important; height: 30px !important; padding: 0 !important; border-radius: 50% !important; font-size: 14px !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 20 !important; box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important; opacity: 1 !important; visibility: visible !important; }
    .arrow-prev { left: 4px !important; }
    .arrow-next { right: 4px !important; }
    .hidden-arrow { display: none !important; }
    @keyframes slideFadeMob { from { opacity: 0.5; } to { opacity: 1; } }
    .video-badge { position: absolute; top: 4px; left: 4px; background: rgba(169, 14, 14, 0.85) !important; color: #ffffff !important; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 13px; padding-left: 2px; box-sizing: border-box; pointer-events: none; }
    .slide-counter { position: absolute; top: 4px; right: 4px; background: rgba(17, 17, 17, 0.7); color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; font-family: 'Inter', Arial, sans-serif; z-index: 10; pointer-events: none; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
}
</style>

<div id="slider-wrapper-mobile">
    <h3 class="slider-main-title">Δημοφιλείς Αναρτήσεις</h3>
    <div id="custom-post-slider-mobile">
        <button class="slider-arrow arrow-prev hidden-arrow" onclick="moveSlideMob(-1)">&#10094;</button>
        <div id="slider-content-mobile">
            <p style="text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;">Φόρτωση αναρτήσεων...</p>
        </div>
        <button class="slider-arrow arrow-next hidden-arrow" onclick="moveSlideMob(1)">&#10095;</button>
    </div>
</div>

<script>
let sliderPostsMob = [];
let currentSlideIndexMob = 0;
let autoSlideTimerMob;

function fetchBloggerPostsMob(json) {
    const entries = json.feed.entry;
    if (!entries) return;
    const targetDate = new Date("2021-09-11T00:00:00Z");

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const publishedDate = new Date(entry.published.$t);
        if (publishedDate >= targetDate && sliderPostsMob.length < 20) {
            let title = entry.title.$t;
            let postLink = "";
            for (let j = 0; j < entry.link.length; j++) {
                if (entry.link[j].rel === "alternate") { postLink = entry.link[j].href; break; }
            }
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
            sliderPostsMob.push({ title, link: postLink, image: imageUrl, isVideo: isVideo });
        }
    }
    buildSliderMob();
}

function buildSliderMob() {
    const container = document.getElementById("slider-content-mobile");
    const arrowPrev = document.querySelector('#custom-post-slider-mobile .arrow-prev');
    const arrowNext = document.querySelector('#custom-post-slider-mobile .arrow-next');
    if(sliderPostsMob.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; font-family: Inter, Arial; color: #a90e0e;'>Δεν βρέθηκαν δημοφιλείς αναρτήσεις.</p>";
        return;
    }
    let htmlOutput = "";
    sliderPostsMob.forEach((post, index) => {
        let activeClass = index === 0 ? "active" : "";
        let videoBadgeHtml = post.isVideo ? `<div class="video-badge">&#9654;</div>` : "";
        htmlOutput += `<div class="slide-item ${activeClass}"><a href="${post.link}" class="slide-link">${videoBadgeHtml}<div class="slide-counter">${index + 1} / ${sliderPostsMob.length}</div><img src="${post.image}" alt="${post.title}"><div class="slide-title-wrapper"><div class="slide-title">${post.title}</div></div></a></div>`;
    });
    container.innerHTML = htmlOutput;
    if (sliderPostsMob.length > 1) {
        arrowPrev.classList.remove('hidden-arrow'); arrowNext.classList.remove('hidden-arrow');
        startAutoSlideMob(); initSwipeMob();
    }
}

function showSlideMob(index) {
    const slides = document.querySelectorAll("#custom-post-slider-mobile .slide-item");
    if (slides.length === 0) return;
    slides.forEach(slide => slide.classList.remove("active"));
    if (index >= sliderPostsMob.length) currentSlideIndexMob = 0;
    if (index < 0) currentSlideIndexMob = sliderPostsMob.length - 1;
    slides[currentSlideIndexMob].classList.add("active");
}
function moveSlideMob(step) { currentSlideIndexMob += step; showSlideMob(currentSlideIndexMob); resetAutoSlideMob(); }
function startAutoSlideMob() { autoSlideTimerMob = setInterval(() => { moveSlideMob(1); }, 2000); }
function resetAutoSlideMob() { clearInterval(autoSlideTimerMob); if (sliderPostsMob.length > 1) startAutoSlideMob(); }
function initSwipeMob() {
    const sliderElem = document.getElementById("custom-post-slider-mobile");
    let touchStartX = 0; let touchEndX = 0;
    sliderElem.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    sliderElem.addEventListener("touchend", e => { touchEndX = e.changedTouches[0].screenX; if (touchStartX - touchEndX > 40) moveSlideMob(1); if (touchEndX - touchStartX > 40) moveSlideMob(-1); }, {passive: true});
}
