(function() {
    "use strict";

    var churchSlideIndex = 1;
    var churchModal = document.getElementById("churchesModal");
    if (!churchModal) return;

    function showChurchSlides(n) {
      var slides = churchModal.getElementsByClassName("church-slide");
      if (!slides.length) return;
      if (n > slides.length) churchSlideIndex = 1;
      if (n < 1) churchSlideIndex = slides.length;
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slides[churchSlideIndex - 1].style.display = "block";
    }

   var isChurchOpen = false;
    var churchFadeTimer = null;

    function openChurchesModal() {
      if (churchModal.parentNode !== document.body) {
        document.body.appendChild(churchModal);
      }
      isChurchOpen = true;
      clearTimeout(churchFadeTimer);
      churchModal.style.display = "block";
      churchModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      churchFadeTimer = setTimeout(function() { churchModal.classList.add("show"); }, 10);
      showChurchSlides(churchSlideIndex);

      try {
        if (window.history.state && window.history.state.pexpModal) {
          window.history.replaceState({ churchModal: true }, "", window.location.href);
        } else if (!window.history.state || !window.history.state.churchModal) {
          window.history.pushState({ churchModal: true }, "", window.location.href);
        }
      } catch (e) {}
    }

    function closeChurchesModal(fromPopState) {
      if (!isChurchOpen) return;
      isChurchOpen = false;
      clearTimeout(churchFadeTimer);
      if (churchModal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      churchModal.classList.remove("show");
      churchModal.setAttribute("aria-hidden", "true");
      var pexp = document.getElementById("peristasiExplorerModal");
      if (!pexp || !pexp.classList.contains("is-open")) {
        document.body.style.overflow = "";
      }
      churchFadeTimer = setTimeout(function() {
        if (!isChurchOpen) {
          churchModal.style.display = "none";
        }
      }, 300);

      if (!fromPopState && window.history.state && window.history.state.churchModal) {
        try { window.history.back(); } catch (e) {}
      }
    }

    function changeChurchSlide(n) {
      showChurchSlides(churchSlideIndex += n);
    }

    window.openChurchesModal = openChurchesModal;
    window.closeChurchesModal = closeChurchesModal;
    window.changeChurchSlide = changeChurchSlide;

   var touchStartX = 0;
    var touchStartY = 0;
    var isMultiTouch = false;
    var swipeZone = document.getElementById("churchSwipeArea");

    if (swipeZone) {
      swipeZone.addEventListener("touchstart", function(e) {
        if (e.touches.length > 1) {
          isMultiTouch = true;
          return;
        }
        isMultiTouch = false;
        touchStartX = e.touches[0].screenX;
        touchStartY = e.touches[0].screenY;
      }, { passive: true });

      swipeZone.addEventListener("touchmove", function(e) {
        if (e.touches.length > 1) isMultiTouch = true;
      }, { passive: true });

      swipeZone.addEventListener("touchend", function(e) {
        if (isMultiTouch || e.touches.length > 0) return;
        var diffX = e.changedTouches[0].screenX - touchStartX;
        var diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < -50) changeChurchSlide(1);
          else if (diffX > 50) changeChurchSlide(-1);
        }
      }, { passive: true });
    }

    var churchBackdropDown = false;
    churchModal.addEventListener("mousedown", function(e) {
      churchBackdropDown = (e.target === churchModal);
    });
    churchModal.addEventListener("click", function(e) {
      if (churchBackdropDown && e.target === churchModal) closeChurchesModal(false);
      churchBackdropDown = false;
    });

   churchModal.addEventListener("keydown", function(e) {
      var btn = e.target.closest('[role="button"]');
      if (btn && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        btn.click();
      }
    });

    document.addEventListener("keydown", function(e) {
      if (!isChurchOpen) return;
      if (e.key === "Escape") closeChurchesModal(false);
      else if (e.key === "ArrowLeft") changeChurchSlide(-1);
      else if (e.key === "ArrowRight") changeChurchSlide(1);
    });

    window.addEventListener("popstate", function() {
      if (isChurchOpen) closeChurchesModal(true);
    });
  })();

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
    var routeReady = false;
    var elevReady = false;
    var weatherLoaded = false;

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

    /* Μεγέθυνση φωτογραφίας με πάτημα */
    modal.addEventListener("click", function(e) {
      var zImg = e.target.closest(".pexp-zoomable");
      if (!zImg || !zImg.src || zImg.src.indexOf("data:image/") === 0) return;
      e.stopPropagation();
      if (zoomTarget) zoomTarget.src = zImg.src;
      if (zoomCap) zoomCap.textContent = zImg.alt || "";
      if (zoomOverlay) zoomOverlay.classList.add("is-open");
    });
    if (zoomOverlay) {
      zoomOverlay.addEventListener("click", function() {
        zoomOverlay.classList.remove("is-open");
      });
    }

    /* Εναλλαγή Καρτελών */
    var tabBtns = modal.querySelectorAll("#pexpTabs .pexp-tab-btn");
    var panes = {
      population: document.getElementById("pexp-pane-population"),
      route: document.getElementById("pexp-pane-route"),
      elevation: document.getElementById("pexp-pane-elevation")
    };

    function stopPopAutoplay() {
      if (popTimer) {
        clearInterval(popTimer);
        popTimer = null;
        var playBtn = document.getElementById("pexpPlayBtn");
        if (playBtn) playBtn.textContent = "\u25B6\uFE0F Παίξε την Ιστορία!";
      }
    }

   function activateTab(tabName) {
      if (tabName === "churches") {
        var hasChurches = typeof window.openChurchesModal === "function";
        closePeristasiModal(hasChurches);
        if (hasChurches) window.openChurchesModal();
        return;
      }
      stopPopAutoplay();
      tabBtns.forEach(function(b) {
        b.classList.toggle("is-active", b.getAttribute("data-tab") === tabName);
      });
      Object.keys(panes).forEach(function(k) {
        if (panes[k]) panes[k].classList.toggle("is-active", k === tabName);
      });
      if (modalBody) modalBody.scrollTop = 0;

      if (tabName === "route" && !routeReady) {
        routeReady = true;
        renderStop(4);
      } else if (tabName === "elevation") {
        if (!elevReady) {
          elevReady = true;
          selectZone(1);
        }
        if (!weatherLoaded) loadLiveTemperatures();
      }
    }

    tabBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        activateTab(btn.getAttribute("data-tab"));
      });
    });

   window.openPeristasiModal = function(initialTab) {
      if (initialTab === "churches") {
        var hasChurches = typeof window.openChurchesModal === "function";
        closePeristasiModal(hasChurches);
        if (hasChurches) window.openChurchesModal();
        return;
      }

      if (typeof window.closeChurchesModal === "function") {
        window.closeChurchesModal(true);
      }

      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      if (zoomOverlay && zoomOverlay.parentNode !== document.body) document.body.appendChild(zoomOverlay);

      activateTab(initialTab || "population");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      try {
        if (window.history.state && window.history.state.churchModal) {
          window.history.replaceState({ pexpModal: true }, "", window.location.href);
        } else if (!window.history.state || !window.history.state.pexpModal) {
          window.history.pushState({ pexpModal: true }, "", window.location.href);
        }
      } catch (e) {}
    };

    function closePeristasiModal(fromPopState) {
      if (!modal.classList.contains("is-open")) return;
      stopPopAutoplay();
      if (zoomOverlay) zoomOverlay.classList.remove("is-open");
      if (modal.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      var cModal = document.getElementById("churchesModal");
      if (!cModal || cModal.getAttribute("aria-hidden") === "true") {
        document.body.style.overflow = "";
      }

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
          zoomOverlay.classList.remove("is-open");
        } else if (modal.classList.contains("is-open")) {
          closePeristasiModal(false);
        }
      }
    });
    window.addEventListener("popstate", function() {
      if (modal.classList.contains("is-open")) closePeristasiModal(true);
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
          var idx = renderedHouseCount;
          var span = document.createElement("span");
          var cls = "pexp-h-thrace";
          var ic = "\uD83C\uDFE0";
          if (idx >= 6 && idx < 8) {
            cls = "pexp-h-vlach";
            ic = "\uD83C\uDFE1";
          } else if (idx >= 8) {
            cls = "pexp-h-pontic";
            ic = "\uD83C\uDFD8\uFE0F";
          }
          span.className = "pexp-house-big pexp-dyn-house " + cls;
          span.textContent = ic;
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

      if (rootVlach) rootVlach.classList.toggle("is-unlocked", yr >= 1947);
      if (rootPontic) rootPontic.classList.toggle("is-unlocked", yr >= 1965);

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

    function renderStop(idx) {
      currentStopIdx = (idx + routeStops.length) % routeStops.length;
      var st = routeStops[currentStopIdx];
      if (landActive) landActive.setAttribute("d", st.path);
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

    routePins.forEach(function(pin) {
      pin.addEventListener("click", function() {
        renderStop(Number(pin.getAttribute("data-stop")));
      });
    });
    on("pexpPrevStop", "click", function() { renderStop(currentStopIdx - 1); });
    on("pexpNextStop", "click", function() { renderStop(currentStopIdx + 1); });

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

    /* Σημερινές Αποστάσεις */
    var localDests = {
      katerini: { walk: "36 λεπτά",          bike: "10 λεπτά",              car: "5 λεπτά" },
      paralia:  { walk: "1 ώρα",             bike: "16 λεπτά",              car: "7 λεπτά" },
      olympus:  { walk: "2 μέρες ορειβασία", bike: "1 ώρα (έως Λιτόχωρο)",  car: "25 λεπτά (έως Λιτόχωρο)" },
      thess:    { walk: "~14 ώρες",          bike: "~3,5 ώρες",             car: "50 λεπτά" }
    };
    var wEl = document.getElementById("pexpTimeWalk");
    var bEl = document.getElementById("pexpTimeBike");
    var cEl = document.getElementById("pexpTimeCar");
    var destBtns = document.querySelectorAll("#pexpDestBtns .pexp-dest-btn");

    destBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var key = btn.getAttribute("data-dest");
        var d = localDests[key] || localDests.katerini;
        if (wEl) wEl.textContent = d.walk;
        if (bEl) bEl.textContent = d.bike;
        if (cEl) cEl.textContent = d.car;
        destBtns.forEach(function(b) { b.classList.toggle("is-active", b === btn); });
      });
    });

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

  var weatherFetching = false;
    function loadLiveTemperatures() {
      if (weatherLoaded || weatherFetching) return;
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
