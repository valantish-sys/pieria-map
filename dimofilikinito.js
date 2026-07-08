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
