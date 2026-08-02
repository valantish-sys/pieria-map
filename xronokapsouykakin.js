(() => {
    "use strict";

    const CONFIG = Object.freeze({
        labels: ["Δράσεις 14-25"], 
        fallbackImg: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
    });

    const DOM = {};

    const Utils = {
        cleanText: (htmlStr) => {
            let temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            return (temp.textContent || temp.innerText || "").replace(/\s+/g, ' ').trim();
        }
    };

    const MobileDataEngine = {
        fetchPosts: async () => {
            try {
                const randomLabel = CONFIG.labels[Math.floor(Math.random() * CONFIG.labels.length)];
                const encodedLabel = encodeURIComponent(randomLabel);

                const metaUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1`;
                const metaRes = await fetch(metaUrl);
                const metaData = await metaRes.json();

                const totalPosts = parseInt(metaData.feed.openSearch$totalResults.$t, 10);
                if (totalPosts === 0) throw new Error("Δεν βρέθηκαν αναρτήσεις.");

                const randomIndex = Math.floor(Math.random() * totalPosts) + 1;

                const finalUrl = `/feeds/posts/default/-/${encodedLabel}?alt=json&max-results=1&start-index=${randomIndex}`;
                const finalRes = await fetch(finalUrl);
                const finalData = await finalRes.json();

                MobileDataEngine.processSingleEntry(finalData.feed.entry[0]);

            } catch (err) {
                console.warn('Χρονοκάψουλα Mobile:', err.message);
                if (DOM.title) DOM.title.innerText = "Σφάλμα Φόρτωσης";
                if (DOM.desc) DOM.desc.innerText = "Δεν μπορέσαμε να ανακτήσουμε τη μνήμη.";
            }
        },

        processSingleEntry: (entry) => {
            if (!entry) return;
            
            const title = entry.title.$t || 'Χωρίς Τίτλο';
            const postLink = entry.link.find(l => l.rel === 'alternate')?.href || '#';

            let imgSrc = CONFIG.fallbackImg;
            if (entry.media$thumbnail) {
                imgSrc = entry.media$thumbnail.url.replace(/\/s[0-9]+(\-c)?\//, "/s600/");
            } else if (entry.content?.$t) {
                const imgMatch = entry.content.$t.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imgSrc = imgMatch[1];
            }

            let desc = entry.snippet || Utils.cleanText(entry.content?.$t || "");
            if (desc.length > 80) desc = desc.substring(0, 80) + '...';

            const pubDate = new Date(entry.published.$t);
            const months = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];
            const dateStr = `${months[pubDate.getMonth()]} ${pubDate.getFullYear()}`;
            
            const yearsAgo = new Date().getFullYear() - pubDate.getFullYear();
            let badgeText = yearsAgo === 0 ? "Πρόσφατο" : yearsAgo === 1 ? "Πέρυσι" : `${yearsAgo} Χρόνια Πριν`;

            MobileUIEngine.updateCard(imgSrc, title, desc, badgeText, dateStr, postLink);
        }
    };

    const MobileUIEngine = {
        updateCard: (img, title, desc, badge, date, link) => {
            if (!DOM.widget) return;
            DOM.img.src = img;
            DOM.title.innerText = title;
            DOM.desc.innerText = desc || "Διαβάστε περισσότερα...";
            DOM.badge.innerText = badge;
            DOM.date.innerText = date;
            DOM.btnLink.href = link;
        },

        createDust: () => {
            if (!DOM.widget) return;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < 15; i++) {
                let dust = document.createElement("div");
                dust.className = "stc-dust";
                dust.style.width = dust.style.height = (Math.random() * 4 + 1) + "px";
                dust.style.left = (Math.random() * 100) + "%";
                dust.style.top = (Math.random() * 100) + "%";
                dust.style.animationDuration = (Math.random() * 10 + 5) + "s";
                dust.style.animationDelay = (Math.random() * 5) + "s";
                fragment.appendChild(dust);
            }
            DOM.widget.appendChild(fragment);
        }
    };

    const MobileApp = {
        init: () => {
            DOM.widget = document.getElementById("stc-widget-mobile");
            if (!DOM.widget) return;

            DOM.img = document.getElementById("stc-image-mobile");
            DOM.title = document.getElementById("stc-title-mobile");
            DOM.desc = document.getElementById("stc-desc-mobile");
            DOM.badge = document.getElementById("stc-badge-mobile");
            DOM.date = document.getElementById("stc-date-mobile");
            DOM.btnLink = document.getElementById("stc-btn-link-mobile");

            MobileDataEngine.fetchPosts();
            MobileUIEngine.createDust();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", MobileApp.init);
    } else {
        MobileApp.init();
    }
})();
