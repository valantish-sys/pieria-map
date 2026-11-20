
  /* ================= ΠΑΙΔΙΚΟΣ ΕΞΕΡΕΥΝΗΤΗΣ ΠΕΡΙΣΤΑΣΗΣ ================= */
  (function() {
    "use strict";

    var modal = document.getElementById("peristasiExplorerModal");
    var modalBody = document.getElementById("pexpModalBody");
    var zoomOverlay = document.getElementById("pexpImgZoom");
    var zoomTarget = document.getElementById("pexpImgZoomTarget");
    var zoomCap = document.getElementById("pexpImgZoomCap");
    if (!modal) return;

    function on(id, evt, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener(evt, fn);
    }

 var popTimer = null;
    var routeTimer = null;
    var currentTab = "population";
    var selectDestByStep = null;
    var routeReady = false;
    var elevReady = false;
    var churchesReady = false;
    var weatherLoaded = false;
    var churchesData = [];
    var currentChurchIdx = 0;

   var closeRootBubble = function() {};
    var activeRootKey = "";

    if (!document.getElementById("pexpInteractiveStyles")) {
      var extraCss = document.createElement("style");
      extraCss.id = "pexpInteractiveStyles";
      extraCss.textContent =
        ".pexp-stop-toprow{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}" +
        ".pexp-stop-toprow .pexp-stop-badge{margin:0!important}" +
        ".pexp-route-play-btn{border:1px solid #93c5fd;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:12.5px;padding:5px 12px;border-radius:999px;cursor:pointer;transition:all .2s;white-space:nowrap}" +
        ".pexp-route-play-btn:hover{background:#dbeafe}" +
        ".pexp-route-play-btn.is-playing{background:#1e6cff;border-color:#1e6cff;color:#fff}" +
        "#pexpSubToday .pexp-vehicles-grid{grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}" +
        ".pexp-vehicle-card--1922{background:#fffbeb!important;border-color:#fcd34d!important}" +
        ".pexp-vehicle-card--1922 .pexp-vehicle-val{color:#b45309!important}" +
        ".pexp-speed-track{display:block;width:100%;height:6px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;margin-top:8px}" +
        ".pexp-speed-fill{display:block;height:100%;width:0;border-radius:999px;transition:width .45s cubic-bezier(.22,1,.36,1)}" +
        ".pexp-fill-car{background:#059669}.pexp-fill-bike{background:#0284c7}.pexp-fill-walk{background:#d97706}.pexp-fill-cart{background:#b45309}" +
        ".pexp-zoom-nav{position:fixed;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(15,23,42,.72);color:#fff;font-size:24px;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:100020;user-select:none}" +
        ".pexp-zoom-nav:hover{background:rgba(30,108,255,.9)}" +
        ".pexp-zoom-prev{left:14px}.pexp-zoom-next{right:14px}" +
        ".pexp-zoom-close{position:fixed;top:16px;right:18px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(15,23,42,.72);color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:100021}" +
        ".pexp-zoom-close:hover{background:rgba(220,38,38,.85)}" +
        ".pexp-church-photo{height:310px!important;object-fit:contain!important;background:linear-gradient(180deg,#dbeafe 0%,#eff6ff 100%)!important;padding:6px}" +
        ".pexp-house-big,.pexp-root-badge{cursor:pointer;transition:transform .18s,box-shadow .18s}" +
        ".pexp-house-big:hover,.pexp-root-badge:hover{transform:translateY(-2px) scale(1.07)}" +
        ".pexp-root-badge.is-selected{box-shadow:0 0 0 3px rgba(30,108,255,.35)}" +
        ".pexp-roots-hint{font-size:12px;color:#475569;text-align:center;margin:8px 0 4px;font-weight:600}" +
        ".pexp-root-pop{margin-top:10px;padding:12px 14px;border-radius:14px;border:2px solid var(--r-border,#93c5fd);background:var(--r-bg,#eff6ff);color:#1e293b;text-align:left}" +
        ".pexp-root-pop-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}" +
        ".pexp-root-pop-title{font-weight:800;font-size:14px;color:var(--r-accent,#1d4ed8)}" +
        ".pexp-root-pop-close{border:none;background:rgba(15,23,42,.08);color:#334155;width:26px;height:26px;border-radius:50%;cursor:pointer;font-weight:700}" +
        ".pexp-root-pop-desc{font-size:13.5px;line-height:1.5;margin-bottom:8px}" +
        ".pexp-root-pop-tags{display:flex;flex-wrap:wrap;gap:6px}" +
        ".pexp-root-pop-tag{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#fff;border:1px solid var(--r-border,#93c5fd);color:#334155}" +
        ".pexp-root-pop-cta{margin-top:9px;border:none;background:var(--r-accent,#1e6cff);color:#fff;font-size:12.5px;font-weight:700;padding:6px 13px;border-radius:999px;cursor:pointer}" +
        ".school-history-wrapper a.image-link img{cursor:zoom-in}";
      document.head.appendChild(extraCss);
    }

    function hasHorizontalScroll(node, stopAt) {
      while (node && node !== stopAt && node !== document.body) {
        if (node.nodeType === 1 && node.scrollWidth > node.clientWidth + 6) {
          var ov = window.getComputedStyle(node).overflowX;
          if (ov === "auto" || ov === "scroll") return true;
        }
        node = node.parentNode;
      }
      return false;
    }

    function bindSwipe(el, onSwipeLeft, onSwipeRight) {
      if (!el) return;
      var sx = 0, sy = 0, multi = false, ignore = false;
      el.addEventListener("touchstart", function(e) {
        if (e.touches.length > 1) { multi = true; return; }
        var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
        ignore = (tag === "input" || tag === "select" || tag === "textarea" || hasHorizontalScroll(e.target, el));
        multi = false;
        sx = e.touches[0].screenX;
        sy = e.touches[0].screenY;
      }, { passive: true });

      el.addEventListener("touchmove", function(e) {
        if (e.touches.length > 1) multi = true;
      }, { passive: true });

      el.addEventListener("touchend", function(e) {
        if (multi || ignore || e.touches.length > 0) return;
        var dx = e.changedTouches[0].screenX - sx;
        var dy = e.changedTouches[0].screenY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          if (dx < 0 && onSwipeLeft) onSwipeLeft();
          else if (dx > 0 && onSwipeRight) onSwipeRight();
        }
      }, { passive: true });
    }

    var fallbackSvg = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="15">Εικόνα Πιερίας</text></svg>'
    );

    modal.querySelectorAll("img").forEach(function(img) {
      img.addEventListener("error", function() {
        if (this.src !== fallbackSvg) this.src = fallbackSvg;
      });
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src") && img.src.indexOf("data:image/") !== 0) {
        img.src = fallbackSvg;
      }
    });

    /* Μεγέθυνση φωτογραφίας με πλοήγηση (κουμπιά, swipe, βελάκια) */
    var zoomList = [];
    var zoomIdx = 0;
    var zoomPrevBtn = null;
    var zoomNextBtn = null;

   var blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    function closeZoom(fromPopState) {
      if (!zoomOverlay || !zoomOverlay.classList.contains("is-open")) return;
      zoomOverlay.classList.remove("is-open");
      if (!modal.classList.contains("is-open")) {
        document.body.style.overflow = "";
      }
      if (!fromPopState && window.history.state && window.history.state.pexpZoom) {
        try { window.history.back(); } catch (e) {}
      }
    }

    if (zoomOverlay) {
      var zoomCloseBtn = document.createElement("button");
      zoomCloseBtn.type = "button";
      zoomCloseBtn.className = "pexp-zoom-close";
      zoomCloseBtn.setAttribute("aria-label", "Κλείσιμο");
      zoomCloseBtn.textContent = "\u2715";

      zoomPrevBtn = document.createElement("button");
      zoomPrevBtn.type = "button";
      zoomPrevBtn.className = "pexp-zoom-nav pexp-zoom-prev";
      zoomPrevBtn.setAttribute("aria-label", "Προηγούμενη φωτογραφία");
      zoomPrevBtn.textContent = "\u2039";

      zoomNextBtn = document.createElement("button");
      zoomNextBtn.type = "button";
      zoomNextBtn.className = "pexp-zoom-nav pexp-zoom-next";
      zoomNextBtn.setAttribute("aria-label", "Επόμενη φωτογραφία");
      zoomNextBtn.textContent = "\u203A";

      zoomOverlay.appendChild(zoomCloseBtn);
      zoomOverlay.appendChild(zoomPrevBtn);
      zoomOverlay.appendChild(zoomNextBtn);

      zoomCloseBtn.addEventListener("click", function(e) { e.stopPropagation(); closeZoom(false); });
      zoomPrevBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(-1); });
      zoomNextBtn.addEventListener("click", function(e) { e.stopPropagation(); stepZoom(1); });
      zoomOverlay.addEventListener("click", function() { closeZoom(false); });
      bindSwipe(zoomOverlay, function() { stepZoom(1); }, function() { stepZoom(-1); });
    }

    function openZoomWithList(list, startIndex) {
      if (!list || !list.length || !zoomOverlay) return;
      var wasOpen = zoomOverlay.classList.contains("is-open");
      zoomList = list;
      zoomIdx = (startIndex >= 0 && startIndex < list.length) ? startIndex : 0;
      if (zoomOverlay.parentNode !== document.body) {
        document.body.appendChild(zoomOverlay);
      }
      renderZoomItem();
      zoomOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";

      if (!wasOpen) {
        try {
          if (!window.history.state || !window.history.state.pexpZoom) {
            var nextState = { pexpZoom: true };
            if (modal.classList.contains("is-open")) nextState.pexpModal = true;
            window.history.pushState(nextState, "", window.location.href);
          }
        } catch (e) {}
      }
    }

    function renderZoomItem() {
      var item = zoomList[zoomIdx];
      if (!item) return;
      if (zoomTarget) {
        var triedThumb = false;
        zoomTarget.onerror = function() {
          if (!triedThumb && item.thumb && this.src !== item.thumb) {
            triedThumb = true;
            this.src = item.thumb;
          } else if (this.src !== fallbackSvg) {
            this.onerror = null;
            this.src = fallbackSvg;
          }
        };
        if (zoomTarget.src !== item.src) {
          zoomTarget.src = blankGif;
          zoomTarget.src = item.src;
        }
      }
      if (zoomCap) {
        var countSuffix = zoomList.length > 1 ? " (" + (zoomIdx + 1) + "/" + zoomList.length + ")" : "";
        zoomCap.textContent = (item.caption || "") + countSuffix;
      }
      var navDisp = zoomList.length > 1 ? "flex" : "none";
      if (zoomPrevBtn) zoomPrevBtn.style.display = navDisp;
      if (zoomNextBtn) zoomNextBtn.style.display = navDisp;
    }

    function stepZoom(dir) {
      if (zoomList.length <= 1) return;
      zoomIdx = (zoomIdx + dir + zoomList.length) % zoomList.length;
      renderZoomItem();
    }

    modal.addEventListener("click", function(e) {
      var zImg = e.target.closest(".pexp-zoomable");
      if (!zImg || !zImg.src || zImg.src.indexOf("data:image/") === 0) return;
      e.stopPropagation();

      if (zImg.id === "pexpRouteMainImg" && typeof routePhotos !== "undefined" && routePhotos.length) {
        var rList = routePhotos.map(function(p) { return { src: p.src, caption: p.alt || "" }; });
        var rIdx = 0;
        for (var i = 0; i < routePhotos.length; i++) {
          if (zImg.src === routePhotos[i].src || zImg.getAttribute("src") === routePhotos[i].src) {
            rIdx = i;
            break;
          }
        }
        openZoomWithList(rList, rIdx);
      } else if (zImg.id === "pexpChurchMainImg" && churchesData.length) {
        var cList = churchesData.map(function(c) { return { src: c.img, caption: c.caption }; });
        openZoomWithList(cList, currentChurchIdx);
      } else {
        var scope = zImg.closest(".pexp-pane") || modal;
        var candidates = scope.querySelectorAll(".pexp-zoomable");
        var gList = [];
        var gIdx = 0;
        candidates.forEach(function(el) {
          if (el.src && el.src.indexOf("data:image/") !== 0 && el.offsetParent !== null) {
            if (el === zImg) gIdx = gList.length;
            gList.push({ src: el.src, caption: el.alt || "" });
          }
        });
        openZoomWithList(gList, gIdx);
      }
    });

    /* Ενιαίο Lightbox στις ιστορικές φωτογραφίες & τον χάρτη της σελίδας */
    var historyWrap = document.querySelector(".school-history-wrapper") || document;
    var pageImageLinks = historyWrap.querySelectorAll("a.image-link");
    pageImageLinks.forEach(function(link, clickedIdx) {
      link.addEventListener("click", function(e) {
        var img = link.querySelector("img");
        var fullHref = link.getAttribute("href");
        if (!fullHref && (!img || !img.src)) return;
        e.preventDefault();

        var pList = [];
        pageImageLinks.forEach(function(lnk) {
          var im = lnk.querySelector("img");
          var srcUrl = lnk.getAttribute("href") || (im ? im.src : "");
          var thumbUrl = im ? im.src : "";
          var altTxt = im && im.alt ? im.alt.trim() : "";
          var evBox = lnk.closest(".timeline-event");
          var dateEl = evBox ? evBox.querySelector(".timeline-date") : null;
          var dateTxt = dateEl ? dateEl.textContent.trim() : "";
          var capTxt = (dateTxt && altTxt) ? (dateTxt + " \u2022 " + altTxt) : (altTxt || dateTxt);
          pList.push({ src: srcUrl, thumb: thumbUrl, caption: capTxt });
        });

        openZoomWithList(pList, clickedIdx);
      });
    });

   /* Εναλλαγή Καρτελών */
    var tabBtns = modal.querySelectorAll("#pexpTabs .pexp-tab-btn");
    var panes = {
      population: document.getElementById("pexp-pane-population"),
      route: document.getElementById("pexp-pane-route"),
      elevation: document.getElementById("pexp-pane-elevation"),
      churches: document.getElementById("pexp-pane-churches")
    };

    function stopPopAutoplay() {
      if (popTimer) {
        clearInterval(popTimer);
        popTimer = null;
        var playBtn = document.getElementById("pexpPlayBtn");
        if (playBtn) playBtn.textContent = "\u25B6\uFE0F Παίξε την Ιστορία!";
      }
    }

    function stopRouteAutoplay() {
      if (routeTimer) {
        clearInterval(routeTimer);
        routeTimer = null;
      }
      var rBtn = document.getElementById("pexpPlayRouteBtn");
      if (rBtn) {
        rBtn.textContent = "\u25B6\uFE0F Παίξε το Ταξίδι!";
        rBtn.classList.remove("is-playing");
      }
    }

    function activateTab(tabName) {
      if (!panes[tabName]) tabName = "population";
      stopPopAutoplay();
      stopRouteAutoplay();
      currentTab = tabName;

      tabBtns.forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-tab") === tabName);
      });
      Object.keys(panes).forEach(function(k) {
        if (panes[k]) panes[k].classList.toggle("is-active", k === tabName);
      });
      if (modalBody) modalBody.scrollTop = 0;

      if (tabName === "route" && !routeReady) {
        routeReady = true;
        renderStop(4, false);
      } else if (tabName === "elevation") {
        if (!elevReady) {
          elevReady = true;
          selectZone(1);
        }
        if (!weatherLoaded) loadLiveTemperatures();
      } else if (tabName === "churches" && !churchesReady) {
        churchesReady = true;
        renderChurch(0);
      }
    }

    tabBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        activateTab(btn.getAttribute("data-tab"));
      });
    });

    window.openPeristasiModal = function(initialTab) {
      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      if (zoomOverlay && zoomOverlay.parentNode !== document.body) document.body.appendChild(zoomOverlay);

      activateTab(initialTab || "population");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      try {
        if (!window.history.state || !window.history.state.pexpModal) {
          window.history.pushState({ pexpModal: true }, "", window.location.href);
        }
      } catch (e) {}
    };

    window.openChurchesModal = function() {
      window.openPeristasiModal("churches");
    };

    function closePeristasiModal(fromPopState) {
      if (!modal.classList.contains("is-open")) return;
      stopPopAutoplay();
      stopRouteAutoplay();
      if (zoomOverlay) zoomOverlay.classList.remove("is-open");
      if (modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      if (!fromPopState && window.history.state && window.history.state.pexpModal) {
        try { window.history.back(); } catch (e) {}
      }
    }

    on("pexpCloseBtn", "click", function() { closePeristasiModal(false); });
    var modalBackdropDown = false;
    modal.addEventListener("mousedown", function(e) {
      modalBackdropDown = (e.target === modal);
    });
    modal.addEventListener("click", function(e) {
      if (modalBackdropDown && e.target === modal) closePeristasiModal(false);
      modalBackdropDown = false;
    });
   document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
          closeZoom(false);
        } else if (modal.classList.contains("is-open") && currentTab === "population" && activeRootKey) {
          closeRootBubble();
        } else if (modal.classList.contains("is-open")) {
          closePeristasiModal(false);
        } else if (activeFacIdx !== -1) {
          closeFacilityCard();
        }
        return;
      }

      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      var dir = (e.key === "ArrowRight") ? 1 : -1;

      if (zoomOverlay && zoomOverlay.classList.contains("is-open")) {
        if (zoomList.length > 1) {
          e.preventDefault();
          stepZoom(dir);
        }
        return;
      }

      if (modal.classList.contains("is-open")) {
        if (currentTab === "route") {
          e.preventDefault();
          if (subToday && subToday.style.display === "block") {
            if (selectDestByStep) selectDestByStep(dir);
          } else {
            stopRouteAutoplay();
            renderStop(currentStopIdx + dir, false);
          }
        } else if (currentTab === "elevation") {
          e.preventDefault();
          selectZone(curZoneIdx + dir);
        } else if (currentTab === "churches") {
          e.preventDefault();
          renderChurch(currentChurchIdx + dir);
        } else if (currentTab === "population" && activeFacIdx !== -1 && modal.contains(pfacStage)) {
          e.preventDefault();
          openFacilityCard(activeFacIdx + dir, false);
        }
        return;
      }

      if (activeFacIdx !== -1 && pfacStage) {
        var stRect = pfacStage.getBoundingClientRect();
        if (stRect.bottom > 0 && stRect.top < window.innerHeight) {
          e.preventDefault();
          openFacilityCard(activeFacIdx + dir, false);
        }
      }
    });
   window.addEventListener("popstate", function() {
      if (zoomOverlay && zoomOverlay.classList.contains("is-open") && !(window.history.state && window.history.state.pexpZoom)) {
        closeZoom(true);
      }
      if (modal.classList.contains("is-open") && !(window.history.state && window.history.state.pexpModal)) {
        closePeristasiModal(true);
      }
    });

    document.querySelectorAll(".pexp-card-trigger").forEach(function(card) {
      card.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    /* ================= 1. ΤΟ ΧΩΡΙΟ ΜΑΣ ΜΕΓΑΛΩΝΕΙ (1924 -> 2021) ================= */
    var censusData = [
      { year: 1924, pop: 130, story: "1924: Οι πρώτοι 130 Περιστασιανοί πρόσφυγες από την Ανατολική Θράκη φτάνουν εδώ! Φτιάχνουν τα πρώτα τους σπιτάκια, την εκκλησία του Αη-Γιώργη και το πρώτο μικρό πλίνθινο σχολείο." },
      { year: 1928, pop: 616, story: "1928: Στο χωριό ζουν πια 166 προσφυγικές οικογένειες (616 κάτοικοι)! Φέρνουν μαζί τους και το όμορφο έθιμο της εικόνας του Αγίου Μόδεστου, που φιλοξενείται από σπίτι σε σπίτι." },
      { year: 1940, pop: 936, story: "1940: Το χωριό μεγαλώνει στα 936 άτομα και τα χωράφια γεμίζουν ζωή. Στον Β' Παγκόσμιο Πόλεμο φιλοξενούνται εδώ Νεοζηλανδοί στρατιώτες, ενώ στην Κατοχή το χωριό θρηνεί 14 ήρωες κατοίκους." },
      { year: 1951, pop: 1071, story: "1951: Ξεπερνάμε τους 1.000 κατοίκους! Στην Περίσταση έρχονται να ζήσουν οικογένειες από τα ορεινά Σκοτεινά Πιερίας, καθώς και οικογένειες Βλάχων." },
      { year: 1961, pop: 1130, story: "1961: Με 1.130 κατοίκους, όλο το χωριό χαίρεται γιατί χτίζεται από πέτρα το νέο διώροφο διδακτήριο του σχολείου μας (1960\u20131965)!" },
      { year: 1971, pop: 1176, story: "1971: Έρχονται στο χωριό μας Έλληνες Πόντιοι από την πρώην Σοβιετική Ένωση! Παράλληλα φτιάχνονται οι δύο πρώτες ποδοσφαιρικές ομάδες, ο «Όλυμπος» και η «Αναγέννηση»." },
      { year: 1981, pop: 1491, story: "1981: Φτάνουμε τους 1.491 κατοίκους! Οι δύο ομάδες ενώνονται στην αγαπημένη μας Α.Ε. Περίστασης (Α.Ε.Π.) και στο σχολείο μας φιλοξενείται και το Γυμνάσιο." },
      { year: 1991, pop: 1730, story: "1991: Νέες οικογένειες Ποντίων από τη Γεωργία, την Αρμενία, τη Ρωσία και το Καζακστάν ριζώνουν στην Περίσταση και οι γειτονιές γεμίζουν παιδιά (1.730 κάτοικοι)!" },
      { year: 2001, pop: 2232, story: "2001: Το χωριό ξεπερνά τις 2.200 ψυχές! Ιδρύεται ο Σύλλογος Ανατολικοθρακών και λίγο αργότερα (2005\u20132006) προστίθεται η καινούργια πτέρυγα του σχολείου μας." },
      { year: 2011, pop: 2545, story: "2011: Το μεγάλο ρεκόρ της Περίστασης με 2.545 κατοίκους! Το χωριό μας ανήκει πλέον στον Δήμο Κατερίνης." },
      { year: 2021, pop: 2367, story: "Σήμερα (2.367 κάτοικοι): Ένα ζωντανό, μεγάλο χωριό με Παιδικό Σταθμό, Νηπιαγωγείο, το 12/θέσιο Δημοτικό μας, Γυμνάσιο και γήπεδα, όπου Θρακιώτες, Πόντιοι, Βλάχοι και Σκοτεινιώτες είμαστε μια αγκαλιά!" }
    ];

    var popSlider = document.getElementById("pexpPopSlider");
    var yearVal = document.getElementById("pexpYearVal");
    var popVal = document.getElementById("pexpPopVal");
    var scaleVal = document.getElementById("pexpScaleVal");
    var housesGrid = document.getElementById("pexpHousesGrid");
    var popStory = document.getElementById("pexpPopStory");
    var popChips = document.querySelectorAll("#pexpPopChips .pexp-year-stone");
    var playBtn = document.getElementById("pexpPlayBtn");
    var rootVlach = document.getElementById("pexpRootVlach");
    var rootPontic = document.getElementById("pexpRootPontic");

    if (housesGrid) {
      housesGrid.innerHTML =
        '<span class="pexp-house-big pexp-house-landmark" title="Ι.Ν. Αγίου Γεωργίου">\u26EA</span>' +
        '<span class="pexp-house-big pexp-house-landmark" title="Το Σχολείο μας">\uD83C\uDFEB</span>';
    }

    var numFmt = (typeof Intl !== "undefined" && Intl.NumberFormat) ? new Intl.NumberFormat("el-GR") : null;
    var renderedHouseCount = 0;

    function getPopForYear(yr) {
      if (yr <= censusData[0].year) {
        return { pop: censusData[0].pop, story: censusData[0].story };
      }
      for (var i = 0; i < censusData.length - 1; i++) {
        var a = censusData[i], b = censusData[i + 1];
        if (yr >= a.year && yr <= b.year) {
          var ratio = (yr - a.year) / (b.year - a.year);
          var pop = Math.round(a.pop + ratio * (b.pop - a.pop));
          var closest = (yr - a.year <= b.year - yr) ? a : b;
          return { pop: pop, story: closest.story };
        }
      }
      var last = censusData[censusData.length - 1];
      return { pop: last.pop, story: last.story };
    }

    function renderPopulation(yr) {
      if (!housesGrid) return;
      var info = getPopForYear(yr);
      var formattedPop = numFmt ? numFmt.format(info.pop) : info.pop.toLocaleString("el-GR");

      if (yearVal) yearVal.textContent = "\uD83D\uDCC5 " + yr;
      if (popVal) popVal.textContent = formattedPop + " κάτοικοι";

      var buses = Math.max(3, Math.round(info.pop / 50));
      if (scaleVal) scaleVal.textContent = "\uD83D\uDE8C Όσο " + buses + " σχολικά λεωφορεία!";

      var targetHouses = Math.max(1, Math.ceil(info.pop / 150));

     if (renderedHouseCount < targetHouses) {
        var frag = document.createDocumentFragment();
        while (renderedHouseCount < targetHouses) {
          var span = document.createElement("span");
          span.className = "pexp-house-big pexp-dyn-house pexp-h-thrace";
          span.textContent = "\uD83C\uDFE0";
          frag.appendChild(span);
          renderedHouseCount++;
        }
        housesGrid.appendChild(frag);
      } else {
        while (renderedHouseCount > targetHouses) {
          var lastEl = housesGrid.lastElementChild;
          if (!lastEl || !lastEl.classList.contains("pexp-dyn-house")) break;
          housesGrid.removeChild(lastEl);
          renderedHouseCount--;
        }
      }

      for (var k = 2; k < housesGrid.children.length; k++) {
        var hEl = housesGrid.children[k];
        var hIdx = k - 2;
        var cls = "pexp-h-thrace";
        var ic = "\uD83C\uDFE0";
        var ttl = "Σπίτι Θρακιωτών";
        if (yr >= 1947 && hIdx >= 5 && hIdx < 7) {
          cls = "pexp-h-vlach";
          ic = "\uD83C\uDFE1";
          ttl = "Σπίτι Σκοτεινιωτών & Βλάχων";
        } else if (yr >= 1965 && hIdx >= 7) {
          cls = "pexp-h-pontic";
          ic = "\uD83C\uDFD8\uFE0F";
          ttl = "Σπίτι Ποντίων";
        }
        var fullCls = "pexp-house-big pexp-dyn-house " + cls;
        if (hEl.className !== fullCls) {
          hEl.className = fullCls;
          hEl.textContent = ic;
          hEl.title = ttl;
        }
      }

      if (rootVlach) rootVlach.classList.toggle("is-unlocked", yr >= 1947);
      if (rootPontic) rootPontic.classList.toggle("is-unlocked", yr >= 1965);
      if ((activeRootKey === "vlach" && yr < 1947) || (activeRootKey === "pontic" && yr < 1965)) {
        closeRootBubble();
      }

      if (popStory) popStory.textContent = info.story;
      popChips.forEach(function(ch) {
        ch.classList.toggle("is-active", Number(ch.getAttribute("data-year")) === yr);
      });
    }

    if (popSlider) {
      popSlider.addEventListener("input", function() {
        stopPopAutoplay();
        renderPopulation(Number(popSlider.value));
      });
    }
    popChips.forEach(function(ch) {
      ch.addEventListener("click", function() {
        stopPopAutoplay();
        var y = Number(ch.getAttribute("data-year"));
        if (popSlider) popSlider.value = y;
        renderPopulation(y);
      });
    });

   if (playBtn && popSlider) {
      playBtn.addEventListener("click", function() {
        if (popTimer) {
          stopPopAutoplay();
          return;
        }
        var cur = Number(popSlider.value);
        if (cur >= 2021) {
          cur = 1924;
          popSlider.value = cur;
          renderPopulation(cur);
        }
        playBtn.textContent = "\u23F8\uFE0F Παύση";
        popTimer = setInterval(function() {
          cur += 1;
          if (cur >= 2021) {
            cur = 2021;
            stopPopAutoplay();
          }
          popSlider.value = cur;
          renderPopulation(cur);
        }, 65);
      });
    }
   renderPopulation(1924);

    /* Διαδραστικά Σπιτάκια & Ρίζες Καταγωγής */
    var rootsCatalog = {
      thrace: {
        title: "\uD83D\uDFE6 Ρίζες από την Ανατολική Θράκη (1922\u20131924)",
        accent: "#1d4ed8", border: "#93c5fd", bg: "#eff6ff",
        desc: "Οι πρόσφυγες προπαππούδες μας από την παλιά Περίσταση της Προποντίδας έφεραν το έθιμο της εικόνας του Αγίου Μόδεστου, τη θρακιώτικη γκάιντα, τον ζωηρό χορό «Ζωναράδικο» και τις νόστιμες θρακιώτικες πίτες!",
        tags: ["\uD83D\uDDBC\uFE0F Έθιμο Αγ. Μόδεστου", "\uD83D\uDC83 Χορός Ζωναράδικο", "\uD83E\uDD67 Θρακιώτικες Πίτες & Κουσκούσι"]
      },
      vlach: {
        minYear: 1951,
        title: "\uD83D\uDFE7 Σκοτεινά Πιερίας & Βλάχοι (1947\u20131951)",
        accent: "#c2410c", border: "#fdba74", bg: "#fff7ed",
        desc: "Οι οικογένειες από τα ορεινά Σκοτεινά (Μόρνα) και οι Βλάχοι έφεραν την αγάπη για το βουνό των Πιερίων, τους λεβέντικους κυκλικούς χορούς στα πανηγύρια, την τέχνη των υφαντών και τις παραδοσιακές χορτόπιτες!",
        tags: ["\u26F0\uFE0F Ορεινή Παράδοση Πιερίων", "\uD83E\uDDF6 Υφαντά & Κεντήματα", "\uD83C\uDFB6 Κύκλιοι Χοροί"]
      },
      pontic: {
        minYear: 1971,
        title: "\uD83D\uDFE9 Ελληνισμός του Πόντου (1965 & 1990)",
        accent: "#047857", border: "#6ee7b7", bg: "#ecfdf5",
        desc: "Οι Πόντιοι συγχωριανοί μας ζωντάνεψαν τις γειτονιές με τον ήχο της ποντιακής λύρας (κεμεντζέ), τους περήφανους χορούς «Τικ», «Κοτσαρί» και «Σέρα» και αγαπημένα εδέσματα όπως τα πιροσκί και τα ωτία!",
        tags: ["\uD83C\uDFBB Ποντιακή Λύρα", "\uD83D\uDD25 Χοροί Σέρα & Κοτσαρί", "\uD83E\uDD5F Πιροσκί, Ωτία & Σορβάς"]
      },
      church: {
        title: "\u26EA Ι.Ν. Αγίου Γεωργίου & Μοδέστου (από το 1924)",
        accent: "#4f46e5", border: "#a5b4fc", bg: "#eef2ff",
        desc: "Το πρώτο ιερό κτίσμα που έφτιαξαν οι πρόσφυγες μόλις έφτασαν εδώ, για να στεγάσουν τα 18 κιβώτια με τα ιερά κειμήλια της Προποντίδας!",
        tags: ["\uD83D\uDCE6 Κειμήλια 1922", "\uD83D\uDD14 Καρδιά της Ενορίας"],
        ctaTab: "churches",
        ctaText: "\u26EA Δες την Καρτέλα των Εκκλησιών \u279C"
      },
      school: {
        title: "\uD83C\uDFEB 100 Χρόνια Δημοτικό Σχολείο (1926\u20132026)",
        accent: "#0284c7", border: "#7dd3fc", bg: "#f0f9ff",
        desc: "Από το πρώτο μικρό πλίνθινο σχολείο με τις 2 αίθουσες, στο πέτρινο διδακτήριο του 1965 και στο σημερινό 12/θέσιο σχολείο μας!",
        tags: ["\uD83C\uDF82 100 Χρόνια Παιδείας", "\uD83D\uDCD6 4 Γενιές Μαθητών"]
      }
    };

    var meadowScene = panes.population ? panes.population.querySelector(".pexp-meadow-scene") : null;
    var rootsBar = panes.population ? panes.population.querySelector(".pexp-roots-bar") : null;
    var rootThrace = document.getElementById("pexpRootThrace");
    var rootBubble = null;

    if (rootsBar && meadowScene) {
      var rHint = document.createElement("div");
      rHint.className = "pexp-roots-hint";
      rHint.textContent = "\uD83D\uDC46 Πάτησε πάνω σε ένα σπιτάκι ή στις ρίζες για να δεις έθιμα & παραδόσεις!";
      meadowScene.insertBefore(rHint, rootsBar);

      rootBubble = document.createElement("div");
      rootBubble.style.display = "none";
      meadowScene.appendChild(rootBubble);

      [rootThrace, rootVlach, rootPontic].forEach(function(el) {
        if (el) { el.setAttribute("role", "button"); el.tabIndex = 0; }
      });

      closeRootBubble = function() {
        activeRootKey = "";
        if (rootBubble) { rootBubble.style.display = "none"; rootBubble.innerHTML = ""; }
        [rootThrace, rootVlach, rootPontic].forEach(function(el) {
          if (el) el.classList.remove("is-selected");
        });
      };

      var openRootBubble = function(key, toggleIfSame) {
        var data = rootsCatalog[key];
        if (!data || !rootBubble) return;
        if (toggleIfSame && activeRootKey === key) {
          closeRootBubble();
          return;
        }
        stopPopAutoplay();
        if (data.minYear && popSlider && Number(popSlider.value) < data.minYear) {
          popSlider.value = data.minYear;
          renderPopulation(data.minYear);
        }
        activeRootKey = key;
        if (rootThrace) rootThrace.classList.toggle("is-selected", key === "thrace");
        if (rootVlach) rootVlach.classList.toggle("is-selected", key === "vlach");
        if (rootPontic) rootPontic.classList.toggle("is-selected", key === "pontic");

        var tagsHtml = data.tags.map(function(t) {
          return '<span class="pexp-root-pop-tag">' + t + '</span>';
        }).join("");
        var ctaHtml = data.ctaTab
          ? '<button type="button" class="pexp-root-pop-cta" data-goto-tab="' + data.ctaTab + '">' + data.ctaText + '</button>'
          : '';

        rootBubble.className = "pexp-root-pop";
        rootBubble.style.setProperty("--r-accent", data.accent);
        rootBubble.style.setProperty("--r-border", data.border);
        rootBubble.style.setProperty("--r-bg", data.bg);
        rootBubble.style.display = "block";
        rootBubble.innerHTML =
          '<div class="pexp-root-pop-top">' +
            '<span class="pexp-root-pop-title">' + data.title + '</span>' +
            '<button type="button" class="pexp-root-pop-close" data-close-root="1" title="Κλείσιμο">\u2715</button>' +
          '</div>' +
          '<div class="pexp-root-pop-desc">' + data.desc + '</div>' +
          '<div class="pexp-root-pop-tags">' + tagsHtml + '</div>' +
          ctaHtml;
      }

      var detectRootTarget = function(target) {
        if (target.closest("#pexpRootThrace")) return { key: "thrace", badge: true };
        if (target.closest("#pexpRootVlach")) return { key: "vlach", badge: true };
        if (target.closest("#pexpRootPontic")) return { key: "pontic", badge: true };
        if (target.closest(".pexp-h-thrace")) return { key: "thrace", badge: false };
        if (target.closest(".pexp-h-vlach")) return { key: "vlach", badge: false };
        if (target.closest(".pexp-h-pontic")) return { key: "pontic", badge: false };
        var lm = target.closest(".pexp-house-landmark");
        if (lm) {
          var isChurch = lm.textContent.indexOf("\u26EA") !== -1;
          return { key: isChurch ? "church" : "school", badge: true };
        }
        return null;
      }

      meadowScene.addEventListener("click", function(e) {
        if (e.target.closest("[data-close-root]")) { closeRootBubble(); return; }
        var gotoBtn = e.target.closest("[data-goto-tab]");
        if (gotoBtn) { activateTab(gotoBtn.getAttribute("data-goto-tab")); return; }
        var hit = detectRootTarget(e.target);
        if (hit) openRootBubble(hit.key, hit.badge || activeRootKey === hit.key);
      });

      meadowScene.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          var hit = detectRootTarget(e.target);
          if (hit) {
            e.preventDefault();
            openRootBubble(hit.key, true);
          }
        }
      });
    }

    /* ================= 2. ΤΟ ΤΑΞΙΔΙ ΤΟΥ 1922 & ΣΗΜΕΡΙΝΕΣ ΑΠΟΣΤΑΣΕΙΣ ================= */
    var subBtns = document.querySelectorAll("#pexpRouteSubSwitch .pexp-subswitch-btn");
    var subJourney = document.getElementById("pexpSubJourney");
    var subToday = document.getElementById("pexpSubToday");

    subBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var target = btn.getAttribute("data-sub");
        subBtns.forEach(function(b) { b.classList.toggle("is-active", b === btn); });
        if (subJourney) subJourney.style.display = (target === "journey") ? "block" : "none";
        if (subToday) subToday.style.display = (target === "today") ? "block" : "none";
      });
    });

    var routePhotos = [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/%C5%9Eark%C3%B6yden_Marmara_Adas%C4%B1.jpg",
        alt: "Η ακτή της παλιάς Περίστασης (Σάρκιοϊ) στην Προποντίδα"
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/8/88/Greek_mother_%26_child_waiting_in_camp_at_Salonica_for_continuation_of_journey_from_the_Caucasus_to_Thrace_LCCN2001705752.jpg",
        alt: "Μητέρα με παιδί σε προσφυγικό καταυλισμό της Θεσσαλονίκης (1923)"
      },
      {
        src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5I-4gpVPit29pk2-R5GMqYOUAHS5WPUeZ8r12kEEv-aaKFCtFTrpPD03aj9EcSyFfEeoazWO_MVYD5s0neGL2zQ2xiN2l-qwe8WLosTCsI7igZyIV2QEqkU8cLXrVTZ6rP_KcJ9JBpKOj414NBApLsU1mRU-J7vyNTb42X7c4ii0bW_RP4Yzdr0xT69s/s1600/2025-10-24%2015_32_58-NVIDIA%20GeForce%20Overlay.png",
        alt: "Η σημερινή Περίσταση Πιερίας και το 12/Θ Δημοτικό Σχολείο μας"
      }
    ];

    var routeStops = [
      {
        cx: 567, cy: 128, photoIdx: 0,
        badge: "Σταθμός 1 από 5 \u2022 Αφετηρία",
        title: "1. Η Παλιά Περίσταση στην Προποντίδα",
        path: "M 567,128",
        story: "Εδώ ζούσαν οι προπαππούδες μας δίπλα στη θάλασσα της Προποντίδας! Είχαν αμπέλια, καράβια και σπουδαίους δασκάλους, μέχρι τον Οκτώβριο του 1922 που έπρεπε μέσα σε 15 μέρες να αφήσουν τα σπίτια τους."
      },
      {
        cx: 482, cy: 81, photoIdx: 0,
        badge: "Σταθμός 2 από 5 \u2022 ~100 χλμ.",
        title: "2. Περνώντας τον Ποταμό Έβρο",
        path: "M 567,128 L 482,81",
        story: "Όσες οικογένειες ξεκίνησαν από τη στεριά φόρτωσαν στα κάρα λίγα ρούχα, κουβέρτες και εικονίσματα και πέρασαν με κόπο τον μεγάλο ποταμό Έβρο."
      },
      {
        cx: 278, cy: 78, photoIdx: 1,
        badge: "Σταθμός 3 από 5 \u2022 ~300 χλμ.",
        title: "3. Από τη Θράκη & με Καράβια στο Αιγαίο",
        path: "M 567,128 L 482,81 L 278,78",
        story: "Άλλοι προχωρούσαν στον δρόμο προς την Καβάλα και άλλοι ταξίδευαν με πλοία στο Αιγαίο, κουβαλώντας μαζί τους 18 ξύλινα κιβώτια με τα ιερά κειμήλια των εκκλησιών τους!"
      },
      {
        cx: 121, cy: 124, photoIdx: 1,
        badge: "Σταθμός 4 από 5 \u2022 ~460 χλμ.",
        title: "4. Αντάμωμα στη Θεσσαλονίκη (22 Οκτ. 1922)",
        path: "M 567,128 L 482,81 L 278,78 L 121,124",
        story: "Στη Θεσσαλονίκη συναντήθηκαν όσοι ήρθαν με τα πλοία και όσοι ήρθαν με τα κάρα. Κάποιες οικογένειες έμειναν εκεί, ενώ οι δικοί μας συνέχισαν νότια για την Πιερία!"
      },
      {
        cx: 78, cy: 180, photoIdx: 2,
        badge: "Σταθμός 5 από 5 \u2022 ~500 χλμ. συνολικά",
        title: "5. Νέα Περίσταση Πιερίας: Το Νέο μας Σπίτι!",
        path: "M 567,128 L 482,81 L 278,78 L 121,124 L 78,180",
        story: "Το 1924 ρίζωσαν στον εύφορο κάμπο της Κατερίνης! Έχτισαν τον Αη-Γιώργη και το σχολείο μας και έδωσαν στο χωριό το όνομα της αγαπημένης τους πατρίδας: Περίσταση!"
      }
    ];

    var currentStopIdx = 4;
    var landActive = document.getElementById("pexpLandActive");
    var landBg = document.getElementById("pexpLandBg");
    var seaPath = document.getElementById("pexpSeaPath");
    var activeRing = document.getElementById("pexpActiveRing");
    var mainRouteImg = document.getElementById("pexpRouteMainImg");
    var thumbBtns = document.querySelectorAll("#pexpRouteThumbs .pexp-thumb-btn");
    var stopBadge = document.getElementById("pexpStopBadge");
    var stopTitle = document.getElementById("pexpRouteStopTitle");
    var routeStory = document.getElementById("pexpRouteStory");
    var routePins = document.querySelectorAll("#pexpRouteSvg .pexp-pin");
    var routeModes = document.querySelectorAll("#pexpRouteModes .pexp-mini-pill");

    function setRoutePhoto(pIdx) {
      var ph = routePhotos[pIdx] || routePhotos[0];
      if (mainRouteImg) {
        mainRouteImg.src = ph.src;
        mainRouteImg.alt = ph.alt;
      }
      thumbBtns.forEach(function(b, i) {
        b.classList.toggle("is-active", i === pIdx);
      });
    }

    thumbBtns.forEach(function(b) {
      b.addEventListener("click", function() {
        setRoutePhoto(Number(b.getAttribute("data-photo")));
      });
    });

    var origLandDash = landActive ? landActive.getAttribute("stroke-dasharray") : null;
    var landAnimTimer = null;

    function measurePathLen(dStr) {
      if (!landActive || !landActive.getTotalLength) return 0;
      landActive.setAttribute("d", dStr);
      try { return landActive.getTotalLength(); } catch (e) { return 0; }
    }

    function renderStop(idx, animateSegment) {
      var prevIdx = currentStopIdx;
      currentStopIdx = (idx + routeStops.length) % routeStops.length;
      var st = routeStops[currentStopIdx];

      if (landActive) {
        clearTimeout(landAnimTimer);
        if (animateSegment && !origLandDash && currentStopIdx === prevIdx + 1 && landActive.getTotalLength) {
          var prevLen = measurePathLen(routeStops[prevIdx].path);
          var newLen = measurePathLen(st.path);
          if (newLen > prevLen) {
            landActive.style.transition = "none";
            landActive.style.strokeDasharray = newLen + " " + newLen;
            landActive.style.strokeDashoffset = String(newLen - prevLen);
            landActive.getBoundingClientRect();
            landActive.style.transition = "stroke-dashoffset 0.85s ease-out";
            landActive.style.strokeDashoffset = "0";
            landAnimTimer = setTimeout(function() {
              landActive.style.transition = "";
              landActive.style.strokeDasharray = "";
              landActive.style.strokeDashoffset = "";
            }, 900);
          }
        } else {
          landActive.style.transition = "";
          landActive.style.strokeDasharray = origLandDash || "";
          landActive.style.strokeDashoffset = "";
          landActive.setAttribute("d", st.path);
        }
      }

      if (activeRing) {
        activeRing.setAttribute("cx", st.cx);
        activeRing.setAttribute("cy", st.cy);
      }
      if (stopBadge) stopBadge.textContent = st.badge;
      if (stopTitle) stopTitle.textContent = st.title;
      if (routeStory) routeStory.textContent = st.story;
      setRoutePhoto(st.photoIdx);
      routePins.forEach(function(p, i) {
        p.style.opacity = i <= currentStopIdx ? "1" : "0.6";
      });
    }

    subBtns.forEach(function(btn) {
      btn.addEventListener("click", stopRouteAutoplay);
    });

    routePins.forEach(function(pin) {
      pin.addEventListener("click", function() {
        stopRouteAutoplay();
        renderStop(Number(pin.getAttribute("data-stop")), false);
      });
    });
    on("pexpPrevStop", "click", function() {
      stopRouteAutoplay();
      renderStop(currentStopIdx - 1, false);
    });
    on("pexpNextStop", "click", function() {
      stopRouteAutoplay();
      renderStop(currentStopIdx + 1, false);
    });

   var routePlayBtn = document.getElementById("pexpPlayRouteBtn");
    if (!routePlayBtn && stopBadge && stopBadge.parentNode) {
      var topRow = document.createElement("div");
      topRow.className = "pexp-stop-toprow";
      stopBadge.parentNode.insertBefore(topRow, stopBadge);
      topRow.appendChild(stopBadge);

      routePlayBtn = document.createElement("button");
      routePlayBtn.type = "button";
      routePlayBtn.id = "pexpPlayRouteBtn";
      routePlayBtn.className = "pexp-route-play-btn";
      routePlayBtn.textContent = "\u25B6\uFE0F Παίξε το Ταξίδι!";
      topRow.appendChild(routePlayBtn);
    }

    if (routePlayBtn) {
      routePlayBtn.addEventListener("click", function() {
        if (routeTimer) {
          stopRouteAutoplay();
          return;
        }
        if (landActive && landActive.style.display === "none" && routeModes.length) {
          routeModes[0].click();
        }
        if (currentStopIdx >= routeStops.length - 1) {
          renderStop(0, false);
        }
        routePlayBtn.textContent = "\u23F8\uFE0F Παύση";
        routePlayBtn.classList.add("is-playing");
        routeTimer = setInterval(function() {
          if (!modal.classList.contains("is-open") || (subJourney && subJourney.style.display === "none")) {
            stopRouteAutoplay();
            return;
          }
          var nextIdx = currentStopIdx + 1;
          renderStop(nextIdx, true);
          if (nextIdx >= routeStops.length - 1) {
            stopRouteAutoplay();
          }
        }, 3000);
      });
    }

    bindSwipe(
      subJourney || panes.route,
      function() { stopRouteAutoplay(); renderStop(currentStopIdx + 1, false); },
      function() { stopRouteAutoplay(); renderStop(currentStopIdx - 1, false); }
    );

    routeModes.forEach(function(btn) {
      btn.addEventListener("click", function() {
        routeModes.forEach(function(b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var m = btn.getAttribute("data-mode");
        if (seaPath) seaPath.style.display = (m === "land") ? "none" : "block";
        if (landBg) landBg.style.display = (m === "sea") ? "none" : "block";
        if (landActive) landActive.style.display = (m === "sea") ? "none" : "block";
      });
    });

    /* Σημερινές Αποστάσεις & Σύγκριση με το Κάρο του 1922 */
    var localDests = {
      katerini: {
        walk: "36 λεπτά", walkPct: 80,
        bike: "10 λεπτά", bikePct: 22,
        car:  "5 λεπτά",  carPct: 11,
        cart: "~45 λεπτά", cartPct: 100,
        note: "Στον παλιό χωματόδρομο, το βοϊδόκαρο χρειαζόταν 9 φορές περισσότερο χρόνο από το σημερινό αυτοκίνητο!"
      },
      paralia: {
        walk: "1 ώρα",    walkPct: 80,
        bike: "16 λεπτά", bikePct: 21,
        car:  "7 λεπτά",  carPct: 9,
        cart: "~1 ώρα & 15 λεπτά", cartPct: 100,
        note: "Ανάμεσα από χωράφια και αμμόλοφους μέχρι τη θάλασσα του Θερμαϊκού!"
      },
      olympus: {
        walk: "2 μέρες ορειβασία", walkPct: 100,
        bike: "1 ώρα (έως Λιτόχωρο)", bikePct: 24,
        car:  "25 λεπτά (έως Λιτόχωρο)", carPct: 10,
        cart: "~6 ώρες (έως Λιτόχωρο)", cartPct: 72,
        note: "Ολόκληρο πρωινό ταξίδι στις πλαγιές του Ολύμπου για ξύλα και εμπόριο!"
      },
      thess: {
        walk: "~14 ώρες", walkPct: 65,
        bike: "~3,5 ώρες", bikePct: 22,
        car:  "50 λεπτά", carPct: 6,
        cart: "2 μέρες (με διανυκτέρευση)", cartPct: 100,
        note: "Έτσι ακριβώς ήρθαν το 1922 οι πρόσφυγες προπαππούδες μας από τη Θεσσαλονίκη στην Περίσταση!"
      }
    };

    var wEl = document.getElementById("pexpTimeWalk");
    var bEl = document.getElementById("pexpTimeBike");
    var cEl = document.getElementById("pexpTimeCar");
    var destBtns = document.querySelectorAll("#pexpDestBtns .pexp-dest-btn");
    var destKeys = ["katerini", "paralia", "olympus", "thess"];
    var curDestIdx = 0;

    function attachSpeedBar(el, cls) {
      if (!el || !el.parentNode) return null;
      var track = document.createElement("span");
      track.className = "pexp-speed-track";
      var fill = document.createElement("span");
      fill.className = "pexp-speed-fill " + cls;
      track.appendChild(fill);
      el.insertAdjacentElement("afterend", track);
      return fill;
    }

    var vehiclesGrid = wEl ? wEl.closest(".pexp-vehicles-grid") : null;
    var cartTimeEl = document.getElementById("pexpTimeCart1922");
    if (vehiclesGrid && !cartTimeEl) {
      var cartCard = document.createElement("div");
      cartCard.className = "pexp-vehicle-card pexp-vehicle-card--1922";
      cartCard.innerHTML =
        '<span class="pexp-vehicle-emoji">\uD83D\uDC34</span>' +
        '<span class="pexp-vehicle-lbl">Κάρο του 1922</span>' +
        '<span class="pexp-vehicle-val" id="pexpTimeCart1922"></span>';
      vehiclesGrid.appendChild(cartCard);
      cartTimeEl = document.getElementById("pexpTimeCart1922");
    }

    var wBar = attachSpeedBar(wEl, "pexp-fill-walk");
    var bBar = attachSpeedBar(bEl, "pexp-fill-bike");
    var cBar = attachSpeedBar(cEl, "pexp-fill-car");
    var cartBar = attachSpeedBar(cartTimeEl, "pexp-fill-cart");
    var cartNoteEl = subToday ? subToday.querySelector(".pexp-kid-story-text") : null;

    function selectDestination(key) {
      var idx = destKeys.indexOf(key);
      curDestIdx = idx !== -1 ? idx : 0;
      var d = localDests[destKeys[curDestIdx]];

      if (wEl) wEl.textContent = d.walk;
      if (bEl) bEl.textContent = d.bike;
      if (cEl) cEl.textContent = d.car;
      if (wBar) wBar.style.width = d.walkPct + "%";
      if (bBar) bBar.style.width = d.bikePct + "%";
      if (cBar) cBar.style.width = d.carPct + "%";

      if (cartTimeEl) cartTimeEl.textContent = d.cart;
      if (cartNoteEl) cartNoteEl.textContent = d.note;
      if (cartBar) cartBar.style.width = d.cartPct + "%";

      destBtns.forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-dest") === destKeys[curDestIdx]);
      });
    }

    selectDestByStep = function(step) {
      var next = (curDestIdx + step + destKeys.length) % destKeys.length;
      selectDestination(destKeys[next]);
    };

    destBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        selectDestination(btn.getAttribute("data-dest"));
      });
    });

    bindSwipe(
      subToday,
      function() { selectDestByStep(1); },
      function() { selectDestByStep(-1); }
    );

    selectDestination("katerini");

    /* ================= 3. ΑΠΟ ΤΗ ΘΑΛΑΣΣΑ ΣΤΟΝ ΟΛΥΜΠΟ ================= */
    var olympusZones = [
      {
        cx: 75, cy: 188,
        alt: "Επίπεδο 1/5 \u2022 Υψόμετρο: 0 μέτρα",
        title: "\uD83C\uDF0A 1. Παραλία Κατερίνης: Εκεί που Ξεκινά το Μέτρημα!",
        desc: "Μόλις 5 χλμ. από το σχολείο μας είναι η θάλασσα του Θερμαϊκού. Από την επιφάνεια της θάλασσας (0 μέτρα) μετράμε το ύψος κάθε βουνού στη Γη!",
        img1: "https://upload.wikimedia.org/wikipedia/commons/1/11/Beach_Paralia_Katerini_-_panoramio.jpg",
        img2: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Beach_Paralia_Katerini_-_panoramio_%281%29.jpg",
        caption: "\uD83D\uDD0D Πάτησε στις φωτογραφίες για να τις δεις μεγάλες!",
        flora: ["\uD83C\uDF3C Κρίνος της θάλασσας", "\uD83C\uDFD6\uFE0F Αμμοθίνες"],
        fauna: ["\uD83D\uDC26 Γλάροι", "\uD83D\uDC22 Χελώνα Caretta caretta", "\uD83D\uDC2C Δελφίνια"],
        fact: "\uD83D\uDCA1 Το ήξερες; Ο λευκός «κρίνος της θάλασσας» ανθίζει το καλοκαίρι μέσα στην καυτή άμμο χωρίς καθόλου πότισμα!"
      },
      {
        cx: 238, cy: 140,
        alt: "Επίπεδο 2/5 \u2022 Υψόμετρο: 26 μέτρα",
        title: "\uD83C\uDFE1 2. Περίσταση: Το Χωριό μας στον Κάμπο!",
        desc: "Εδώ είμαστε εμείς! Η Περίσταση βρίσκεται στα 26 μέτρα ύψος από τη θάλασσα \u2014 περίπου όσο δύο διώροφα σχολεία το ένα πάνω στο άλλο!",
        img1: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0NL2aawSLfkOnNV8J_9cVNawgSBmkVdzSEmpkmtqgdjoNP8QO4rzJBrKxqEAJTnZ-RTHENX00Lq9rocWbrupB52YSzieFEytgLDhciFXms3NW1Maua0S1bRE_FuJjxBsca7xPHBsvBJY4DRestQzEGob8FU_CW_2u9EaYTuK6jhNC_nRXQgPR6M4pAAE/s1600/2025-10-25%2010_58_15-NVIDIA%20GeForce%20Overlay.png",
        img2: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Dion_view_of_Olympus.jpg",
        caption: "\uD83D\uDD0D Η Περίσταση από ψηλά & ο κάμπος μας κάτω από τον Όλυμπο",
        flora: ["\uD83E\uDD5D Ακτινίδια & Ροδάκινα", "\uD83C\uDF3E Σιτάρι & Βαμβάκι", "\uD83C\uDF3D Καλαμπόκι"],
        fauna: ["\uD83E\uDDA9 Πελαργοί στις κολώνες", "\uD83E\uDD8A Αλεπούδες", "\uD83D\uDC22 Χελώνες & Χελιδόνια"],
        fact: "\uD83D\uDCA1 Το ήξερες; Κάθε άνοιξη οι πελαργοί πετούν χιλιάδες χιλιόμετρα από την Αφρική για να φτιάξουν φωλιά στα χωριά μας!"
      },
      {
        cx: 388, cy: 126,
        alt: "Επίπεδο 3/5 \u2022 Υψόμετρο: 300 έως 1.100 μέτρα",
        title: "\uD83D\uDCA7 3. Χαράδρα Ενιπέα: Καταρράκτες & Δάση!",
        desc: "Ανεβαίνοντας στον Όλυμπο συναντάμε το ποτάμι του Ενιπέα με παγωμένους καταρράκτες, ξύλινα γεφυράκια και πυκνά δάση από οξιές και πεύκα.",
        img1: "https://upload.wikimedia.org/wikipedia/commons/9/96/%CE%9A%CE%B1%CF%84%CE%B1%CF%81%CE%B1%CE%BA%CF%84%CE%B7%CF%82_%CE%95%CE%BD%CE%B9%CF%80%CE%B5%CE%B1.jpg",
        img2: "https://upload.wikimedia.org/wikipedia/commons/7/76/JankaeaHeldreichii30.jpg",
        caption: "\uD83D\uDD0D Καταρράκτης στον Ενιπέα & το σπάνιο μωβ λουλούδι Γιάνκεα",
        flora: ["\uD83C\uDF33 Οξιές & Πλατάνια", "\uD83C\uDF32 Μαύρη Πεύκη", "\uD83C\uDF38 Λουλούδι Γιάνκεα"],
        fauna: ["\uD83E\uDD8C Ζαρκάδια", "\uD83D\uDC3F\uFE0F Σκιουράκια", "\uD83E\uDD8B Σπάνιες Πεταλούδες"],
        fact: "\uD83D\uDCA1 Το ήξερες; Το μωβ λουλούδι «Γιάνκεα» ζει μόνο στα βράχια του Ολύμπου από την Εποχή των Παγετώνων!"
      },
      {
        cx: 525, cy: 56,
        alt: "Επίπεδο 4/5 \u2022 Υψόμετρο: 1.100 έως 2.500 μέτρα",
        title: "\uD83C\uDF32 4. Το Δάσος με τα Γιγάντια Ρόμπολα!",
        desc: "Ψηλά στις πλαγιές φυτρώνει το Ρόμπολο, ένα πανίσχυρο πεύκο που αντέχει τους κεραυνούς, το βαθύ χιόνι και τους δυνατούς ανέμους!",
        img1: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Prionia_olympos_greece_IMG_7601.jpg",
        img2: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mount_Olympus_from_Litochoro.jpg",
        caption: "\uD83D\uDD0D Τα δάση στα Πριόνια & οι ψηλές πλαγιές του Ολύμπου",
        flora: ["\uD83C\uDF32 Αιωνόβια Ρόμπολα", "\uD83C\uDF3F Ορεινά αγριολούλουδα"],
        fauna: ["\uD83E\uDD85 Αετοί", "\uD83D\uDC3B Καφέ Αρκούδα", "\uD83D\uDC17 Αγριογούρουνα"],
        fact: "\uD83D\uDCA1 Το ήξερες; Τα ρόμπολα του Ολύμπου σκαρφαλώνουν έως τα 2.750 μέτρα \u2014 είναι το πιο ψηλό δάσος σε όλη την Ευρώπη!"
      },
      {
        cx: 682, cy: 24,
        alt: "Επίπεδο 5/5 \u2022 Υψόμετρο: 2.918 μέτρα (Κορυφή!)",
        title: "\uD83C\uDFD4\uFE0F 5. Μύτικας (2.918 μ.): Πάνω από τα Σύννεφα!",
        desc: "Φτάσαμε στην πιο ψηλή κορυφή της Ελλάδας! Από τον Ιούλιο του 2026 ο Όλυμπος προστατεύεται επίσημα ως Μνημείο Παγκόσμιας Κληρονομιάς της UNESCO.",
        img1: "https://upload.wikimedia.org/wikipedia/commons/0/00/Mytikas_at_sunset_%28Olympus_mt.%29.jpg",
        img2: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Rupicapra_rupicapra_balcanica%2C_Olympus.jpg",
        caption: "\uD83D\uDD0D Η κορυφή Μύτικας & το Αγριόγιδο του Ολύμπου",
        flora: ["\uD83C\uDF3C 23 μοναδικά λουλούδια που ζουν μόνο στον Όλυμπο!"],
        fauna: ["\uD83D\uDC10 Αγριόγιδο του Ολύμπου", "\uD83E\uDD85 Χρυσαετός", "\uD83D\uDC26 Πετροπέρδικα"],
        fact: "\uD83D\uDCA1 Το ήξερες; Το αγριόγιδο σκαρφαλώνει στους πιο απότομους γκρεμούς χωρίς να γλιστράει ποτέ!"
      }
    ];

    var curZoneIdx = 1;
    var zRing = document.getElementById("pexpZoneRing");
    var zImg1 = document.getElementById("pexpZoneImg1");
    var zImg2 = document.getElementById("pexpZoneImg2");
    var zCap = document.getElementById("pexpZoneCaption");
    var zAlt = document.getElementById("pexpZoneAlt");
    var zTitle = document.getElementById("pexpZoneTitle");
    var zDesc = document.getElementById("pexpZoneDesc");
    var zFlora = document.getElementById("pexpZoneFlora");
    var zFauna = document.getElementById("pexpZoneFauna");
    var zFact = document.getElementById("pexpZoneFact");
    var zHits = document.querySelectorAll("#pexpProfileSvg .pexp-zone-hit");

    function selectZone(idx) {
      curZoneIdx = (idx + olympusZones.length) % olympusZones.length;
      var z = olympusZones[curZoneIdx];
      if (zRing) {
        zRing.setAttribute("cx", z.cx);
        zRing.setAttribute("cy", z.cy);
      }
      if (zAlt) zAlt.textContent = z.alt;
      if (zTitle) zTitle.textContent = z.title;
      if (zDesc) zDesc.textContent = z.desc;
      if (zImg1) { zImg1.src = z.img1; zImg1.alt = z.title; }
      if (zImg2) { zImg2.src = z.img2; zImg2.alt = z.title; }
      if (zCap) zCap.textContent = z.caption;
      if (zFlora) zFlora.innerHTML = z.flora.map(function(f) { return '<span class="pexp-tag-flora">' + f + '</span>'; }).join("");
      if (zFauna) zFauna.innerHTML = z.fauna.map(function(a) { return '<span class="pexp-tag-fauna">' + a + '</span>'; }).join("");
      if (zFact) zFact.textContent = z.fact;

      zHits.forEach(function(h, i) { h.style.opacity = (i === curZoneIdx) ? "1" : "0.78"; });
    }

    zHits.forEach(function(h) {
      h.addEventListener("click", function() { selectZone(Number(h.getAttribute("data-zone"))); });
    });
   on("pexpZonePrev", "click", function() { selectZone(curZoneIdx - 1); });
    on("pexpZoneNext", "click", function() { selectZone(curZoneIdx + 1); });
    bindSwipe(
      panes.elevation,
      function() { selectZone(curZoneIdx + 1); },
      function() { selectZone(curZoneIdx - 1); }
    );

  var weatherFetching = false;
   function loadLiveTemperatures() {
      if (weatherLoaded || weatherFetching || typeof window.fetch !== "function") return;
      var tempPill = document.getElementById("pexpLiveTemp");
      if (!tempPill) return;
      weatherFetching = true;
      fetch("https://api.open-meteo.com/v1/forecast?latitude=40.2741&longitude=22.5396&current=temperature_2m&timezone=auto")
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
          weatherFetching = false;
          if (data && data.current && typeof data.current.temperature_2m === "number") {
            weatherLoaded = true;
            var tPeristasi = Math.round(data.current.temperature_2m);
            var tMytikas = Math.round(data.current.temperature_2m - 18.8);
            tempPill.textContent = "\uD83C\uDF21\uFE0F Τώρα: Περίσταση (26μ) " + tPeristasi + "\u00B0C  \u2022  Κορυφή Μύτικα (2.918μ) ~" + tMytikas + "\u00B0C!";
          }
        })
       .catch(function() {
          weatherFetching = false;
        });
    }

    /* ================= 3Β. ΟΙ ΕΚΚΛΗΣΙΕΣ ΜΑΣ (4η ΚΑΡΤΕΛΑ) ================= */
    churchesData = [
      {
        badge: "Εκκλησία 1 από 2 \u2022 Κέντρο Περίστασης",
        title: "\u26EA 1. Ιερός Ναός Αγ. Γεωργίου & Αγ. Μοδέστου",
        img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpoIvD-uW-PJidxwFEyZqvdrRrE8_XY7mvNoHvKQQXl9w69-O04hyphenhyphenuOqUqNnul-f19sMorQDWZUL8nxfPoRaORl5RauIy-ak1pEjsFv0LCcLLIn4sPuA0BaFe1QofqCxXxGxijUqSO5HBOU7jxpO78M0U7MPs8kjoJ2BAplETfQMZBt55Jp1cNq7K_MwY/s1600/2026-06-28%2020_49_56-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png",
        caption: "Ιερός Ναός Αγίου Γεωργίου και Αγίου Μοδέστου Περίστασης",
        story: "Μόλις εγκαταστάθηκαν οι πρώτοι πρόσφυγες το 1924, το πρώτο τους μέλημα — μαζί με το πλίνθινο σχολείο — ήταν να χτίσουν την εκκλησία του Αη-Γιώργη! Εδώ φυλάσσονται με αγάπη τα ιερά κειμήλια και οι εικόνες που ταξίδεψαν το 1922 μέσα σε 18 ξύλινα κιβώτια από την παλιά Περίσταση της Προποντίδας.",
        tags: [
          "\uD83D\uDCC5 23 Απριλίου (ή Δευτέρα Πάσχα) \u2022 Αγ. Γεωργίου",
          "\uD83D\uDCC5 16 Δεκεμβρίου \u2022 Αγ. Μοδέστου",
          "\uD83D\uDDBC\uFE0F Ιερά Κειμήλια Προποντίδας (1922)"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Ο Άγιος Μόδεστος είναι ο προστάτης των γεωργών και των ζώων! Κάθε Δεκέμβριο αναβιώνει το παλιό θρακιώτικο έθιμο όπου η εικόνα του Αγίου φιλοξενείται από σπίτι σε σπίτι!"
      },
      {
        badge: "Εκκλησία 2 από 2 \u2022 Εξωκκλήσι",
        title: "\uD83C\uDF38 2. Εξωκκλήσι Παναγίας Ζωοδόχου Πηγής",
        img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEirhu5w5w8mTAO71RZQFCOFdv_zyb0gZMYiTfDEczPbV1-vnQRzSt0HMEjpQfG5i1LZQWD1BNmBJGnXl7tU-5cCnKgfe1fc6vVJZi9dYFx8Qxn6__uLdb8Geed7_haGxJ37WD7slapAKjONWd4knhs4B0lq5cvEBMOF9HoBs_hG7gmVffhz922OmFSgb2M/s1600/2026-06-28%2020_52_12-2025-09-25%2018_01_46-World%20of%20Warcraft.png.png",
        caption: "Εξωκκλήσι Παναγίας Ζωοδόχου Πηγής Περίστασης",
        story: "Μέσα στο πράσινο και τα δέντρα του κάμπου μας βρίσκεται το όμορφο εξωκκλήσι της Παναγίας Ζωοδόχου Πηγής! Είναι ένα ήσυχο, φωτεινό καταφύγιο στη φύση, όπου μικροί και μεγάλοι ανάβουν το κεράκι τους και ανταμώνουν όλοι μαζί κάθε άνοιξη μετά το Πάσχα.",
        tags: [
          "\uD83D\uDCC5 Παρασκευή της Διακαινησίμου (μετά το Πάσχα)",
          "\uD83C\uDF3F Ανοιξιάτικο Πανηγύρι στη Φύση",
          "\uD83D\uDD6F\uFE0F Αγίασμα & Προσκύνημα"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Η γιορτή της Ζωοδόχου Πηγής πέφτει πάντα την πρώτη Παρασκευή μετά την Κυριακή του Πάσχα, γεμίζοντας το εξωκκλήσι μας οικογένειες, παιδιά και ανοιξιάτικα λουλούδια!"
      }
    ];

    var cMainImg = document.getElementById("pexpChurchMainImg");
    var cBadge = document.getElementById("pexpChurchBadge");
    var cTitle = document.getElementById("pexpChurchTitle");
    var cStory = document.getElementById("pexpChurchStory");
    var cTags = document.getElementById("pexpChurchTags");
    var cFact = document.getElementById("pexpChurchFact");
    var cThumbs = document.querySelectorAll("#pexpChurchThumbs .pexp-thumb-btn");

    function renderChurch(idx) {
      if (!churchesData.length) return;
      currentChurchIdx = (idx + churchesData.length) % churchesData.length;
      var ch = churchesData[currentChurchIdx];
      if (cMainImg) { cMainImg.src = ch.img; cMainImg.alt = ch.caption; }
      if (cBadge) cBadge.textContent = ch.badge;
      if (cTitle) cTitle.textContent = ch.title;
      if (cStory) cStory.textContent = ch.story;
      if (cTags) {
        cTags.innerHTML = ch.tags.map(function(t) {
          return '<span class="pexp-tag-flora">' + t + '</span>';
        }).join("");
      }
      if (cFact) cFact.textContent = ch.fact;
      cThumbs.forEach(function(btn, i) {
        btn.classList.toggle("is-active", i === currentChurchIdx);
      });
    }

    cThumbs.forEach(function(btn) {
      btn.addEventListener("click", function() {
        renderChurch(Number(btn.getAttribute("data-church")));
      });
    });
    on("pexpPrevChurch", "click", function() { renderChurch(currentChurchIdx - 1); });
    on("pexpNextChurch", "click", function() { renderChurch(currentChurchIdx + 1); });
    bindSwipe(
      panes.churches,
      function() { renderChurch(currentChurchIdx + 1); },
      function() { renderChurch(currentChurchIdx - 1); }
    );

    /* ================= 4. ΠΑΙΔΙΚΕΣ ΚΑΡΤΕΣ ΥΠΟΔΟΜΩΝ & ΦΟΡΕΩΝ ================= */
    var facilitiesData = [
      {
        icon: "\uD83C\uDFEB",
        accent: "#1e6cff", border: "#93c5fd", soft: "#eff6ff",
        badge: "\uD83C\uDF82 100 Χρόνια Σχολείο (1926\u20132026) \u2022 Μακεδονίας 15",
        title: "Το 12/θέσιο Δημοτικό Σχολείο μας!",
        story: "Το σχολείο μας κλείνει έναν ολόκληρο αιώνα ζωής! Από το 1926 μέχρι σήμερα, τέσσερις γενιές παιδιών της Περίστασης έμαθαν εδώ γράμματα, έπαιξαν στη μεγάλη μας αυλή και έκαναν τους καλύτερούς τους φίλους.",
        tags: [
          "\uD83D\uDCD6 Δανειστική & Ψηφιακή Βιβλιοθήκη",
          "\uD83E\uDD16 Υπολογιστές & Ρομποτική",
          "\uD83C\uDFCA Σκάκι & Κολύμβηση",
          "\uD83C\uDFC0 Γήπεδα & Αίθουσα Εκδηλώσεων"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Το σχολείο μας έχει δική του Ψηφιακή Βιβλιοθήκη με 350 δωρεάν παιδικά βιβλία, ενώ στο σκάκι έχουμε κατακτήσει τη 2η θέση ανάμεσα στα Δημοτικά όλης της Κατερίνης!"
      },
      {
        icon: "\uD83D\uDCDA",
        accent: "#4f46e5", border: "#a5b4fc", soft: "#eef2ff",
        badge: "\uD83D\uDD2C Το Επόμενο Σχολείο μας \u2022 Ολύμπου 2",
        title: "Γυμνάσιο Περίστασης: Εκεί που Μεγαλώνουμε!",
        story: "Μόλις τελειώσουμε την ΣΤ' Δημοτικού, μας περιμένει το Γυμνάσιο του χωριού μας! Ιδρύθηκε το 1981 (τα πρώτα χρόνια φιλοξενήθηκε στο δικό μας σχολείο) και από το 1994 έχει το δικό του μεγάλο κτίριο με 14 αίθουσες.",
        tags: [
          "\uD83E\uDDEA 3 Εργαστήρια Πειραμάτων & Τεχνολογίας",
          "\uD83C\uDF0D Αγγλικά, Γαλλικά & Γερμανικά",
          "\uD83C\uDFC3 Μεγάλη Αυλή & Σκάμμα Άλματος",
          "\uD83D\uDC9A Εθελοντικές Δράσεις & Βιβλιοθήκη"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Στο Γυμνάσιο της Περίστασης έρχονται παιδιά από 5 περιοχές (Περίσταση, Σταθμό, Καλλιθέα, Παραλία και Ολυμπιακή Ακτή), οπότε θα γνωρίσεις ακόμα περισσότερους φίλους!"
      },
      {
        icon: "\uD83E\uDDF8",
        accent: "#db2777", border: "#f9a8d4", soft: "#fdf2f8",
        badge: "\uD83C\uDFA8 Από το 1978 \u2022 Αγίου Γεωργίου 2",
        title: "3/θέσιο Νηπιαγωγείο: Τα Πρώτα μας Βήματα!",
        story: "Θυμάσαι τις πρώτες σου ζωγραφιές και τα πρώτα τραγούδια; Στο Νηπιαγωγείο της Περίστασης, με τις 3 φωτεινές τάξεις και την όμορφη αυλή, τα παιδιά 4 έως 6 ετών ετοιμάζονται με παιχνίδι και χαρά για το Δημοτικό!",
        tags: [
          "\uD83C\uDFB2 3 Φωτεινές Τάξεις Παιχνιδιού",
          "\uD83C\uDF33 Ασφαλής Αυλή 500 τ.μ.",
          "\uD83D\uDD24 Δημιουργικά Αγγλικά",
          "\uD83C\uDF89 Γιορτές & Παρελάσεις"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Σχεδόν όλοι οι μαθητές και οι μαθήτριες του Δημοτικού μας ξεκίνησαν τη σχολική τους ζωή από αυτήν ακριβώς την αυλή!"
      },
      {
        icon: "\uD83D\uDC76",
        accent: "#0284c7", border: "#7dd3fc", soft: "#f0f9ff",
        badge: "\uD83C\uDF7C Για τα πιο Μικρά Παιδάκια \u2022 Ολύμπου 2",
        title: "Δημοτικός Παιδικός Σταθμός: Η Πρώτη Αγκαλιά!",
        story: "Δίπλα στο Γυμνάσιο βρίσκεται το πιο γλυκό σχολείο της γειτονιάς μας! Εδώ τα μικρότερα παιδάκια του χωριού (πριν ακόμα πάνε Νηπιαγωγείο) μαθαίνουν να μοιράζονται, να τραγουδούν, να ζωγραφίζουν και να παίζουν ομαδικά.",
        tags: [
          "\uD83C\uDFB5 Τραγούδι & Παραμύθια",
          "\uD83E\uDD1D Ομαδικό Παιχνίδι & Φιλία",
          "\uD83C\uDF4E Φροντίδα & Υγιεινό Φαγητό",
          "\uD83D\uDC3E Δράσεις Αγάπης για τα Ζώα"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Η Περίσταση είναι από τα λίγα χωριά που έχουν όλες τις βαθμίδες: ένα παιδί ξεκινά από τον Παιδικό Σταθμό και φτάνει έως τα 15 του χρόνια στη δική του γειτονιά!"
      },
      {
        icon: "\u26BD",
        accent: "#059669", border: "#6ee7b7", soft: "#ecfdf5",
        badge: "\uD83C\uDFC5 2 Μεγάλα Αθλητικά Κέντρα \u2022 2.000+ Θέσεις!",
        title: "Οι Αθλητικές Εγκαταστάσεις της Γειτονιάς μας!",
        story: "Το χωριό μας αγαπάει πολύ τον αθλητισμό! Έχουμε το μεγάλο Γήπεδο Ποδοσφαίρου με σκεπαστή κερκίδα 1.000 θέσεων, αλλά και δίπλα μας το ανακαινισμένο Κλειστό Γυμναστήριο Τ9 (άνω των 1.000 θέσεων) για μπάσκετ, βόλεϊ και μεγάλους αγώνες!",
        tags: [
          "\u26BD Γήπεδο 1.000 Θέσεων",
          "\uD83C\uDFC0 Κλειστό Γυμναστήριο Τ9 (1.000+ Θέσεις)",
          "\uD83C\uDFBE Γήπεδα 5x5 & Τένις",
          "\u267F Ανελκυστήρες & Πρόσβαση για Όλους"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Το Κλειστό Γυμναστήριο Τ9 είναι το μοναδικό κλειστό γήπεδο σε όλη την Πιερία που μπορεί να φιλοξενήσει αγώνες επαγγελματικών κατηγοριών και πανελλήνια πρωταθλήματα!"
      },
      {
        icon: "\uD83C\uDFAD",
        accent: "#d97706", border: "#fcd34d", soft: "#fffbeb",
        badge: "\uD83D\uDC83 Παράδοση & Χορός \u2022 Πλ. Ανατολικής Θράκης & Μακεδονίας 1",
        title: "Οι Πολιτιστικοί Σύλλογοι του Χωριού μας!",
        story: "Στην Πλατεία Ανατολικής Θράκης βρίσκεται ο Σύλλογος Ανατολικοθρακών (από το 1998) με 4 χορευτικά τμήματα για παιδιά και μεγάλους, Μνημείο Προσφύγων, ενώ στην οδό Μακεδονίας 1 η Εύξεινος Λέσχη Περίστασης κρατά ζωντανή την ποντιακή παράδοση!",
        tags: [
          "\uD83D\uDC5F Παιδικά Χορευτικά Τμήματα",
          "\uD83C\uDFFA Μνημείο Προσφύγων",
          "\uD83C\uDF1F Το Έθιμο του Αγίου Μόδεστου",
          "\uD83C\uDFB6 Θρακιώτικοι & Ποντιακοί Χοροί"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Κάθε Δεκέμβριο στη γιορτή του Αγίου Μόδεστου (προστάτη των γεωργών και των ζώων) τηρείται το παλιό θρακιώτικο έθιμο όπου η εικόνα του Αγίου φιλοξενείται από σπίτι σε σπίτι!"
      },
      {
        icon: "\uD83C\uDFC6",
        accent: "#dc2626", border: "#fca5a5", soft: "#fef2f2",
        badge: "\u26BD Ιστορική Ομάδα από το 1968 & 1978 \u2022 Γήπεδο Περίστασης",
        title: "Α.Ε. Περίστασης: Η Ομάδα της Καρδιάς μας!",
        story: "Το 1968 το χωριό μας είχε δύο ομάδες, τον «Όλυμπο» και την «Αναγέννηση». Το 1978 ένωσαν τις δυνάμεις τους και γεννήθηκε η Α.Ε. Περίστασης! Έχει παιδική Ακαδημία ποδοσφαίρου και έχει κατακτήσει σπουδαία κύπελλα και πρωταθλήματα στην Πιερία (όπως το 2014 και το 2026!).",
        tags: [
          "\uD83E\uDD1D Ένωση 2 Ομάδων το 1978",
          "\uD83E\uDD47 Πρωταθλήτρια Πιερίας (2014 & 2026)",
          "\uD83D\uDC66 Παιδική Ακαδημία Ποδοσφαίρου",
          "\u2B50 Φυτώριο Μεγάλων Παικτών"
        ],
        fact: "\uD83D\uDCA1 Το ήξερες; Από τα παιδικά τμήματα της Α.Ε. Περίστασης ξεκίνησαν να παίζουν μπάλα ο διεθνής ποδοσφαιριστής της Εθνικής Ελλάδας Αλέξανδρος Τζιόλης και ο επαγγελματίας Κώστας Γιαννούλης!"
      }
    ];

    var pfacPills = document.querySelectorAll("#pfacPillsList li[data-fac]");
    var pfacStage = document.getElementById("pfacStage");
    var activeFacIdx = -1;

    function closeFacilityCard() {
      activeFacIdx = -1;
      if (pfacStage) pfacStage.innerHTML = "";
      pfacPills.forEach(function(li) {
        li.classList.remove("is-active");
      });
    }

    function openFacilityCard(idx, shouldScroll) {
      if (!pfacStage) return;
      var cleanIdx = (idx + facilitiesData.length) % facilitiesData.length;

      if (cleanIdx === activeFacIdx && shouldScroll) {
        closeFacilityCard();
        return;
      }

      activeFacIdx = cleanIdx;
      var item = facilitiesData[cleanIdx];

     pfacPills.forEach(function(li) {
        var isCurrent = (Number(li.getAttribute("data-fac")) === cleanIdx);
        li.classList.toggle("is-active", isCurrent);
        if (isCurrent) {
          li.style.setProperty("--pfac-accent", item.accent);
        }
      });

      var tagsHtml = item.tags.map(function(t) {
        return '<span class="pfac-tag">' + t + '</span>';
      }).join("");

      pfacStage.innerHTML =
        '<div class="pfac-card" style="--pfac-accent:' + item.accent + '; --pfac-border:' + item.border + '; --pfac-soft:' + item.soft + ';">' +
          '<div class="pfac-top">' +
            '<span class="pfac-badge">' + item.badge + '</span>' +
            '<button type="button" class="pfac-close" id="pfacCloseBtn" title="Κλείσιμο">\u2715</button>' +
          '</div>' +
          '<div class="pfac-title-row">' +
            '<span class="pfac-big-icon">' + item.icon + '</span>' +
            '<h4 class="pfac-title">' + item.title + '</h4>' +
          '</div>' +
          '<div class="pfac-story">' + item.story + '</div>' +
          '<div class="pfac-tags">' + tagsHtml + '</div>' +
          '<div class="pfac-fact">' + item.fact + '</div>' +
          '<div class="pfac-nav">' +
            '<button type="button" class="pfac-nav-btn" id="pfacPrevBtn">\u2B05\uFE0F Προηγούμενο</button>' +
            '<span class="pfac-count">' + (cleanIdx + 1) + ' από ' + facilitiesData.length + '</span>' +
            '<button type="button" class="pfac-nav-btn" id="pfacNextBtn">Επόμενο \u27A1\uFE0F</button>' +
          '</div>' +
        '</div>';

      if (shouldScroll) {
        requestAnimationFrame(function() {
          var rect = pfacStage.getBoundingClientRect();
          var limitBottom = (modalBody && modalBody.contains(pfacStage))
            ? modalBody.getBoundingClientRect().bottom
            : window.innerHeight;
          if (rect.bottom > limitBottom) {
            pfacStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      }
    }

   if (pfacStage) {
      pfacStage.addEventListener("click", function(e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        if (btn.id === "pfacCloseBtn") closeFacilityCard();
        else if (btn.id === "pfacPrevBtn") openFacilityCard(activeFacIdx - 1, false);
        else if (btn.id === "pfacNextBtn") openFacilityCard(activeFacIdx + 1, false);
      });
      bindSwipe(
        pfacStage,
        function() { if (activeFacIdx !== -1) openFacilityCard(activeFacIdx + 1, false); },
        function() { if (activeFacIdx !== -1) openFacilityCard(activeFacIdx - 1, false); }
      );
    }

    pfacPills.forEach(function(li) {
      li.addEventListener("click", function() {
        openFacilityCard(Number(li.getAttribute("data-fac")), true);
      });
      li.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFacilityCard(Number(li.getAttribute("data-fac")), true);
        }
      });
    });
  })();
