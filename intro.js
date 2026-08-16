(function($) {
    $(document).ready(function() {
      
      // --- SENIOR MASTER LOGIC: Time-Based LocalStorage & Referrer Check ---
      var cooldownHours = 336; // Ρύθμισε εδώ μετά από πόσες ώρες θέλεις να ξαναδεί το intro! (π.χ. 0.5 για μισή ώρα)
      var now = new Date().getTime();
      var lastSeen = localStorage.getItem('introLastSeenDate');
      
      var hasRecentIntro = false;
      if (lastSeen) {
          var hoursPassed = (now - parseInt(lastSeen)) / (1000 * 60 * 60);
          if (hoursPassed < cooldownHours) {
              hasRecentIntro = true; // Έχει δει το intro πρόσφατα (εντός του cooldown)
          }
      }

      // Αν το είδε πρόσφατα Ή αν έκανε κλικ σε εσωτερικό link του σχολείου
      if (hasRecentIntro || document.referrer.includes('dim-perist.pie.sch.gr')) {
          $('#epic-intro-overlay').remove(); // Αφαιρεί το intro από το DOM
          $('body').removeClass('is-in-intro'); // Επαναφέρει το scroll
          // Ανανεώνουμε το χρόνο αν κάνει περιήγηση, ώστε να μην πεταχτεί ξαφνικά αν αλλάξει tab μετά από 2 ώρες
          localStorage.setItem('introLastSeenDate', now.toString()); 
          return; // Σταματάει την εκτέλεση του intro
      }

      // Αν έφτασε εδώ, σημαίνει ότι θα δει το intro. Αποθηκεύουμε την τωρινή ώρα.
      localStorage.setItem('introLastSeenDate', now.toString());
      // ----------------------------------------------------------------------

      // Ξεκινάει το οπτικό κομμάτι του Intro
      $('#epic-intro-overlay').show().attr('aria-hidden', 'false');
      $('body').addClass('is-in-intro');

      var imgUrl = $('#magic-source-img').attr('src');
      var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
var isMobile = (window.innerWidth <= 1500) || isTouch;

      // 1. Ιδανικό Ripples Setup
      try {
        $('#intro-magic-canvas').ripples({
          resolution: isMobile ? 96 : 512, 
          dropRadius: 25,
          perturbance: isMobile ? 0.01 : 0.02,
          imageUrl: imgUrl 
        });
        
        if (!isMobile) {
            let dropCount = 0;
            let autoDrops = setInterval(function() {
              var $el = $('#intro-magic-canvas');
              if($el.length) {
                  $el.ripples('drop', Math.random() * $el.outerWidth(), Math.random() * $el.outerHeight(), 25, 0.05);
                  dropCount++;
                  if (dropCount >= 3) clearInterval(autoDrops);
              } else {
                  clearInterval(autoDrops);
              }
            }, 2500); 
        }
      } catch (e) { console.warn("WebGL ripples disabled or not supported."); }

      // 2. Parallax με RequestAnimationFrame (Απόλυτη 60fps απόδοση)
      let requestRef;
      let mouseX = 0, mouseY = 0;

      function updateParallax() {
        var moveX = (mouseX * 4 - 2); 
        var moveY = (mouseY * 4 - 2);
        // Χρήση translate3d για Hardware Acceleration
        $("#intro-magic-canvas-container").css("transform", "translate3d(" + moveX + "%, " + moveY + "%, 0)");
        requestRef = null;
      }

      if (!isMobile) {
          $(document).on("mousemove.intro", function(e) {
            if(!$('#epic-intro-overlay').length) return; 
            mouseX = e.clientX / window.innerWidth;
            mouseY = e.clientY / window.innerHeight;
            
            if (!requestRef) {
                requestRef = requestAnimationFrame(updateParallax);
            }
          });
      }

      // 3. Cinematic Έξοδος & Memory Cleanup
      $('#intro-enter-school-btn').on('click', function(e) {
        e.preventDefault(); 
        sessionStorage.setItem('introSeen', 'true');
        
        var snd = document.getElementById('intro-click-sound');
        if(snd) { 
            snd.currentTime = 0; // Σε περίπτωση πολλαπλών κλικ, παίζει άμεσα
            snd.play().catch(function(){}); 
        }
        
        try {
            $('#intro-magic-canvas').ripples('drop', $(window).width()/2, $(window).height()/2, 120, 0.6);
        } catch(e) {}

        $('#intro-fade-black').css('opacity', '1');

        setTimeout(function() {
          $('#epic-intro-overlay').fadeOut(1000, function() {
            $('body').removeClass('is-in-intro'); 
            $(document).off("mousemove.intro");
            if (requestRef) cancelAnimationFrame(requestRef); // Καθαρισμός μνήμης
            $(this).remove(); 
          });
        }, 1500);
      });

    });
  })(window.jQuery);
