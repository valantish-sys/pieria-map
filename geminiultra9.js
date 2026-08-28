(function() {
  'use strict';

  const CONFIG = {
    WORKER_URL: "https://school-chat-bot.valantish.workers.dev/",
    TEASER_DELAY_MS: 16000, 
    TEASER_DURATION_MS: 12000,
    SESSION_KEY: "school_chat_history"
  };

  const DOM = {
    widget: document.getElementById('school-chat-widget'),
    bubble: document.getElementById('school-chat-bubble'),
    window: document.getElementById('school-chat-window'),
    closeBtn: document.getElementById('school-chat-close'),
    clearBtn: document.getElementById('school-chat-clear'),
    input: document.getElementById('school-chat-input'),
    sendBtn: document.getElementById('school-chat-send'),
    messagesBox: document.getElementById('school-chat-messages'),
    teaser: document.getElementById('school-chat-teaser'),
    teaserClose: document.getElementById('school-teaser-close'),
    teaserText: document.getElementById('school-teaser-text')
  };
if (!DOM.widget) return;
  let conversationHistory = [];
  let isWaitingForResponse = false;
  let isChatOpen = false; 
  let idleTimer, teaserTimeout, teaserHideTimeout;
let activeRequest = null;

 function saveSession() {
    try { sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(conversationHistory)); } catch(e) {}
  }

 function loadInitialMessages() {
    let savedSession = null;
    try { savedSession = sessionStorage.getItem(CONFIG.SESSION_KEY); } catch(e) {}
    if (savedSession) {
      try {
        const parsedHistory = JSON.parse(savedSession);
        if (parsedHistory.length > 0 && parsedHistory[0].role !== "user") {
           parsedHistory.shift();
        }
       if (parsedHistory.length > 0 && parsedHistory[parsedHistory.length - 1].role === "user") {
           const unsentMsg = parsedHistory.pop(); 
           try { sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(parsedHistory)); } catch(e) {}
           
           // Επαναφορά του κειμένου στο πλαίσιο εισαγωγής για να μην χαθεί ο κόπος του χρήστη
           if (DOM.input && unsentMsg.parts && unsentMsg.parts[0]) {
               DOM.input.value = unsentMsg.parts[0].text;
               DOM.input.style.height = 'auto';
               if (DOM.input.scrollHeight > 0) {
                   DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
               }
           }
        }
        conversationHistory = parsedHistory;
        renderWelcomeMessage();
       conversationHistory.forEach(msg => {
          const isUser = msg.role === 'user';
          addMessageToUI(msg.parts[0].text, isUser ? 'msg-user' : 'msg-bot', !isUser);
        });
        try { localStorage.setItem('chat_welcomed', 'true'); } catch(err) {}
      } catch(e) {
        try { sessionStorage.removeItem(CONFIG.SESSION_KEY); } catch(err) {}
        renderWelcomeMessage();
      }
    } else {
      renderWelcomeMessage();
    }
  }

  function renderWelcomeMessage() {
    DOM.messagesBox.innerHTML = `
      <div class="chat-msg msg-bot">
        Καλώς ήρθες! 👋 Είμαι ο ψηφιακός βοηθός του Δημοτικού Σχολείου Περίστασης! 🏫<br /><br />
        Πώς μπορώ να σε βοηθήσω σήμερα; 🤔
      </div>
      <div class="chat-disclaimer">
        ⚠️ <b>ΠΡΟΣΟΧΗ:</b> Απαντώ μόνο σε γενικές πληροφορίες. Μην πληκτρολογείτε προσωπικά δεδομένα.
      </div>
    `;
  }

  // --- 2. ΠΡΟΣΘΗΚΗ ΜΗΝΥΜΑΤΩΝ ---
  function addMessageToUI(content, senderClass, isMarkdown = false) {
    const msgDiv = document.createElement('div'); 
    msgDiv.className = `chat-msg ${senderClass}`;
    
if (isMarkdown) {
      // Ελέγχουμε αν έχουν φορτώσει επιτυχώς ΚΑΙ οι δύο βιβλιοθήκες
      if (typeof DOMPurify !== 'undefined' && typeof marked !== 'undefined') {
          if (!window.isPurifyHookAdded) {
              DOMPurify.addHook('afterSanitizeAttributes', function(node) {
                  if ('target' in node) {
                      node.setAttribute('target', '_blank');
                      node.setAttribute('rel', 'noopener noreferrer');
                  }
              });
              window.isPurifyHookAdded = true;
          }
          msgDiv.innerHTML = DOMPurify.sanitize(marked.parse(content, { breaks: true }));
      } else {
          // Fallback σε απλό κείμενο αν κοπούν τα εξωτερικά scripts για να μην καταρρεύσει η εφαρμογή
          msgDiv.innerText = content;
      }
    } else {
      msgDiv.innerText = content;
    }
    
    DOM.messagesBox.appendChild(msgDiv); 
    DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight; 
  }

  // --- 3. UI & WAKE UP (ΕΞΥΠΝΟ SCROLL) ---
  let isHiddenByScroll = false;
  let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

 function wakeUpChat() {
    if (isHiddenByScroll) return;
    
    DOM.widget.classList.remove('widget-sleep');
    clearTimeout(idleTimer);
    

    if (isChatOpen || window.innerWidth > 768 || (DOM.teaser && DOM.teaser.classList.contains('teaser-visible'))) return;
    
    idleTimer = setTimeout(() => {
      DOM.widget.classList.add('widget-sleep');
    }, 5000);
  }

  // 1. Ακούμε τις απλές κινήσεις του χρήστη (Το scroll βγήκε από εδώ)
  ['mousemove', 'touchstart', 'keydown'].forEach(evt => window.addEventListener(evt, wakeUpChat, { passive: true }));

  // 2. ΝΕΟΣ ΕΞΥΠΝΟΣ ΜΗΧΑΝΙΣΜΟΣ ΜΟΝΟ ΓΙΑ ΤΟ SCROLL
  window.addEventListener('scroll', function() {
    if (isChatOpen) return; // Αν το chat είναι ανοιχτό, δεν το κρύβουμε ποτέ

    let currentScroll = window.scrollY || document.documentElement.scrollTop;
    const isMobile = window.innerWidth <= 768;

    // Αν φτάσει τέρμα πάνω στην οθόνη, το εμφανίζουμε πάντα
    if (currentScroll <= 0) {
      isHiddenByScroll = false;
      wakeUpChat();
      lastScrollTop = currentScroll;
      return;
    }

   // Ανοχή 5px: Αν η κίνηση είναι πολύ μικρή, την αγνοούμε για να συσσωρευτεί η διαφορά
    if (Math.abs(currentScroll - lastScrollTop) > 5) {
      if (currentScroll > lastScrollTop) {
        // --- SCROLL ΠΡΟΣ ΤΑ ΚΑΤΩ (Εξαφάνιση) ---
        if (isMobile && !isHiddenByScroll) {
          isHiddenByScroll = true; // Το κλειδώνουμε
          clearTimeout(idleTimer); // Σταματάμε το χρονόμετρο των 5s
          DOM.widget.classList.add('widget-sleep');
        }
      } 
      else if (currentScroll < lastScrollTop) {
        // --- SCROLL ΠΡΟΣ ΤΑ ΠΑΝΩ (Εμφάνιση) ---
        isHiddenByScroll = false; // Το ξεκλειδώνουμε
        wakeUpChat(); 
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }
  }, { passive: true });

  // Αρχική κλήση με το που μπαίνει ο χρήστης για να φαίνεται
  isHiddenByScroll = false;
  wakeUpChat();

 function initTeaser() {
    let hasData = false;
    try { hasData = localStorage.getItem('chat_welcomed') || sessionStorage.getItem(CONFIG.SESSION_KEY); } catch(e) {}
    
    if (!hasData) {
      teaserTimeout = setTimeout(() => {
        if (!isChatOpen) {
          DOM.teaser.classList.add('teaser-visible');
          isHiddenByScroll = false; // ΝΕΟ: Αν πεταχτεί το μήνυμα, εξασφαλίζουμε ότι θα φανεί!
          wakeUpChat();
          teaserHideTimeout = setTimeout(closeTeaser, CONFIG.TEASER_DURATION_MS);
        }
      }, CONFIG.TEASER_DELAY_MS);
    }
  }

function closeTeaser() {
    DOM.teaser.classList.remove('teaser-visible');
    try { localStorage.setItem('chat_welcomed', 'true'); } catch(e) {}
    wakeUpChat(); // ΠΡΟΣΘΗΚΗ: Επανεκκίνηση του ελέγχου αδράνειας τώρα που έκλεισε το teaser
  }

DOM.teaserClose.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); });
  DOM.teaserText.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); toggleChat(); });

 function toggleChat() {
    try { localStorage.setItem('chat_welcomed', 'true'); } catch(e) {} 
    clearTimeout(teaserTimeout); closeTeaser();
    const isOpen = DOM.window.classList.contains('is-open');
    
    isHiddenByScroll = false; // ΝΕΟ: Αν ο χρήστης ανοίξει/κλείσει το chat, το ξεκλειδώνουμε!
    
if (isOpen) {
      DOM.window.classList.remove('is-open'); isChatOpen = false;
      if (DOM.input) DOM.input.blur(); // ΝΕΟ: Αφαιρεί την εστίαση για να κλείσει το πληκτρολόγιο του κινητού
   } else {
      DOM.window.classList.add('is-open'); isChatOpen = true;
      
   // Το Scroll πρέπει να εκτελεστεί ΜΕΤΑ το transition της εμφάνισης για να υπολογιστεί το σωστό ύψος
      setTimeout(() => { 
          if (window.innerWidth > 768) DOM.input.focus(); 
          DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
          
          // Επανυπολογισμός ύψους του input τώρα που το widget είναι πλέον ορατό (scrollHeight > 0)
          if (DOM.input && DOM.input.value) {
              DOM.input.style.height = 'auto';
              if (DOM.input.scrollHeight > 0) {
                  DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
              }
          }
      }, 300);
    }
    wakeUpChat();
  }

  // --- 4. TEXTAREA DYNAMIC HEIGHT ---
  function resetInput() {
    DOM.input.value = '';
    DOM.input.style.height = 'auto';
  }

  DOM.input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

DOM.input.addEventListener('keydown', (e) => { 
    // Προστασία !e.isComposing ώστε να μην αποστέλλεται το μήνυμα αν ο χρήστης 
    // επιλέγει λέξη από το Autocorrect / Λεξικό (IME)
    const isMobile = window.innerWidth <= 768;
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isMobile) {
      e.preventDefault(); 
      handleSend(); 
    }
  });

  // --- ΕΞΥΠΝΟΣ ΚΑΘΑΡΙΣΜΟΣ ΕΛΛΗΝΙΚΟΥ ΚΕΙΜΕΝΟΥ (Για τα μικρά μοντέλα) ---
  function optimizeGreekText(text) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/\s+/g, ' ');

    const isUpperCase = cleaned === cleaned.toUpperCase();
    const containsGreek = /[Α-Ωα-ωΆΈΉΊΌΎΏάέήίόύώ]/.test(cleaned);
    
    if (isUpperCase && containsGreek) {
        cleaned = cleaned.toLowerCase();
    }

// Προσθήκη υποστήριξης για αγκύλες ([]), άγκιστρα ({}) και τίλντα (~), 
    // διατηρώντας παράλληλα τα Emojis και τα ελληνικά εισαγωγικά («»).
   // Διατηρούμε όλα τα γράμματα, αριθμούς, emojis, κενά, καθώς και ΟΛΑ ανεξαιρέτως τα επίσημα 
    // σημεία στίξης (\p{P}) και τα μαθηματικά/άλλα σύμβολα (\p{S}).
    cleaned = cleaned.replace(/[^\p{L}\p{N}\p{Emoji}\p{P}\p{S}\s]/gu, '');
    return cleaned;
  }

  function getOptimizedHistory(history, maxChars = 3500) {
    let currentChars = 0; let optimizedHistory = [];
    for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i]; const msgLen = msg.parts[0].text.length;
        if (currentChars + msgLen > maxChars && optimizedHistory.length > 0) break;
        optimizedHistory.unshift(msg); 
        currentChars += msgLen;
    }
    while (optimizedHistory.length > 0 && optimizedHistory[0].role !== "user") { optimizedHistory.shift(); }
    return optimizedHistory;
  }

async function handleSend() {
    const rawText = DOM.input.value.trim(); 
    if (!rawText || isWaitingForResponse) return;

    // ΠΡΟΣΤΑΣΙΑ: Διαγραφή τυχόν παλαιότερων μηνυμάτων σφάλματος από το UI για να μη συσσωρεύονται
    const errorMsgs = DOM.messagesBox.querySelectorAll('.msg-error');
    errorMsgs.forEach(err => err.remove());
    
    // ΠΡΟΣΤΑΣΙΑ: Απενεργοποιούμε το μικρόφωνο κατά την αποστολή, για αποφυγή Ghost Typing
    if (typeof micBtn !== 'undefined' && micBtn && micBtn.classList.contains('is-recording')) { micBtn.click(); }
   
    // Καθαρίζουμε το κείμενο πριν το στείλουμε
    
   
    // Καθαρίζουμε το κείμενο πριν το στείλουμε
    let optimizedTextForModel = optimizeGreekText(rawText);
    
    // FIX: Αν η Regex έσβησε τα πάντα (π.χ. ο χρήστης έστειλε μόνο Emojis), 
    // χρησιμοποιούμε το αρχικό κείμενο για να μη σκάσει το API με Error 400.
    if (!optimizedTextForModel) {
        optimizedTextForModel = rawText;
    }
    
 isWaitingForResponse = true; 
    resetInput();
    DOM.input.readOnly = true; DOM.sendBtn.disabled = true; // Αλλαγή σε readOnly
    
    // Δείχνουμε αυτό που έγραψε ο χρήστης στο UI
    addMessageToUI(rawText, 'msg-user', false); 
    
// Αποθηκεύουμε στο ιστορικό το ΑΡΧΙΚΟ κείμενο για τη σωστή εμφάνιση στο UI
    conversationHistory.push({ role: "user", parts: [{ text: rawText }] });
    saveSession();
    
    const indicator = document.createElement('div'); indicator.className = 'typing-indicator'; indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    DOM.messagesBox.appendChild(indicator); DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    wakeUpChat();

// ΑΝΤΙΚΑΤΑΣΤΑΣΗ: Χρήση της global μεταβλητής activeRequest
   activeRequest = new AbortController();
   const currentRequest = activeRequest; // ΝΕΟ: Τοπική αναφορά για αποτροπή Race Condition
   // Αύξηση του ορίου στα 30 δευτερόλεπτα για αποφυγή συχνών αποτυχιών του AI
   const timeoutId = setTimeout(() => { if (currentRequest) currentRequest.abort(); }, 30000);

    try {
      if (!navigator.onLine) throw new Error('OFFLINE');

    let optimizedHistory = getOptimizedHistory(conversationHistory, 3500);

      // Εφαρμόζουμε τη βελτιστοποίηση κειμένου ΜΟΝΟ για την αποστολή στο API
      const payloadHistory = optimizedHistory.map(msg => {
          if (msg.role === 'user') {
              let optText = optimizeGreekText(msg.parts[0].text);
              return { role: "user", parts: [{ text: optText || msg.parts[0].text }] };
          }
          return msg;
      });

      // ΠΡΟΣΟΧΗ: Πλέον στέλνουμε ΜΟΝΟ το contents (ιστορικό). Το Cloudflare Worker βάζει τη βάση δεδομένων!
      const response = await fetch(CONFIG.WORKER_URL, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        signal: activeRequest.signal,
        body: JSON.stringify({
          contents: payloadHistory
        })
      });
      
      if (!response.ok) {
          if (response.status === 429) throw new Error('RATE_LIMIT');
          if (response.status >= 500) throw new Error('SERVER_ERROR');
          throw new Error('API_ERROR');
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
          if (data.promptFeedback && data.promptFeedback.blockReason) { throw new Error('SAFETY_BLOCK'); }
          throw new Error('EMPTY_RESPONSE');
      }

      document.getElementById('typing-indicator')?.remove();
      
    const candidate = data.candidates[0];
      // FIX: Προστασία από Safety Blocks που αφαιρούν το αντικείμενο content
      if (candidate.finishReason === 'SAFETY' || !candidate.content) {
          throw new Error('SAFETY_BLOCK');
      }
      
      // ΠΡΟΣΤΑΣΙΑ: Αποτρέπει TypeError αν το API επιστρέψει το response χωρίς το array 'parts'
    // ΠΡΟΣΤΑΣΙΑ: Αποτρέπει TypeError αν το API επιστρέψει το response χωρίς το array 'parts'
      if (!candidate.content.parts || candidate.content.parts.length === 0) {
          throw new Error('EMPTY_RESPONSE');
      }
      
      const botReply = candidate.content.parts[0].text;
      
      // ΠΡΟΣΤΑΣΙΑ: Αποτρέπει το TypeError που παραπλανά ότι "κόπηκε το ίντερνετ" αν λείπει το κείμενο
      if (typeof botReply === 'undefined') {
          throw new Error('EMPTY_RESPONSE');
      }
      
      addMessageToUI(botReply, 'msg-bot', true);
      conversationHistory.push({ role: "model", parts: [{ text: botReply }] });
      saveSession(); 

  } catch (error) {
      // ΝΕΟ: Έλεγχος currentRequest για αποτροπή καταστροφής αν ο χρήστης καθαρίσει και στείλει νέο μήνυμα αμέσως
      if (error.name === 'AbortError' && activeRequest !== currentRequest) {
          return;
      }
      if (error.name === 'AbortError' && activeRequest === null) {
          return;
      }

      document.getElementById('typing-indicator')?.remove();
      
      // ΝΕΟ: Διαγραφή του τελευταίου μηνύματος χρήστη από το UI για αποφυγή διπλοτυπίας
      
      // ΝΕΟ: Διαγραφή του τελευταίου μηνύματος χρήστη από το UI για αποφυγή διπλοτυπίας
      const userMessages = DOM.messagesBox.querySelectorAll('.msg-user');
      if (userMessages.length > 0) {
        userMessages[userMessages.length - 1].remove();
      }

      let errorMessage = "⚠️ Προέκυψε σφάλμα σύνδεσης. Δοκιμάστε ξανά.";
      
      if (error.name === 'AbortError') errorMessage = "⏳ Η σύνδεση άργησε πολύ και διακόπηκε. Δοκιμάστε ξανά.";
      else if (error.message === 'OFFLINE' || error.name === 'TypeError') errorMessage = "🌐 Φαίνεται πως δεν έχετε σύνδεση στο ίντερνετ.";
      else if (error.message === 'RATE_LIMIT') errorMessage = "⏳ Δέχομαι πάρα πολλά μηνύματα! Δοκιμάστε ξανά σε 1 λεπτό.";
      else if (error.message === 'SERVER_ERROR') errorMessage = "🔌 Υπάρχει τεχνικό πρόβλημα στους servers. Δοκιμάστε ξανά σε λίγο.";
      else if (error.message === 'SAFETY_BLOCK') errorMessage = "🛡️ Το μήνυμα μπλοκαρίστηκε από τα φίλτρα ασφαλείας.";

      addMessageToUI(errorMessage, 'msg-bot msg-error', false); 
      conversationHistory.pop(); 
      saveSession();
 DOM.input.value = rawText; 
      DOM.input.style.height = 'auto'; 
      // ΠΡΟΣΤΑΣΙΑ: Υπολογισμός ύψους μόνο αν το στοιχείο είναι ορατό (scrollHeight > 0)
      if (DOM.input.scrollHeight > 0) {
          DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
      }
} finally {
      clearTimeout(timeoutId); 
      
      // Αποτροπή Race Condition: Ξεκλειδώνουμε το UI ΜΟΝΟ αν το αίτημα που ολοκληρώθηκε είναι το τρέχον
      if (activeRequest === currentRequest) {
          isWaitingForResponse = false; DOM.input.readOnly = false; DOM.sendBtn.disabled = false;
          
          if (window.innerWidth > 768 && isChatOpen) {
            DOM.input.focus();
          }
      }
    }
}
  loadInitialMessages();
  initTeaser();

if (window.visualViewport) {
    let lastVpHeight = window.visualViewport.height;
    window.visualViewport.addEventListener('resize', () => {
      const viewportHeight = window.visualViewport.height;
      DOM.window.style.maxHeight = `${viewportHeight - 20}px`;
      
    // ΝΕΟ: Scroll κάτω ΜΟΝΟ αν το ύψος μειωθεί δραματικά (π.χ. >150px, άνοιγμα ψηφιακού πληκτρολογίου).
      // Αποτρέπει το απότομο scroll όταν αλλάζει μέγεθος η μπάρα διευθύνσεων του browser!
      if (DOM.window.classList.contains('is-open') && viewportHeight < lastVpHeight - 150) {
        DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
      }
      lastVpHeight = viewportHeight;
    });
  }

  DOM.bubble.addEventListener('click', toggleChat);
  DOM.closeBtn.addEventListener('click', toggleChat);
  DOM.sendBtn.addEventListener('click', handleSend);
DOM.clearBtn.addEventListener('click', () => {
    // ΝΕΟ: Ακυρώνει τη σύνδεση αν το bot "σκέφτεται" τη στιγμή του καθαρισμού
    if (activeRequest) { activeRequest.abort(); activeRequest = null; }
    
    // ΠΡΟΣΤΑΣΙΑ: Κλείσιμο μικροφώνου αν ο χρήστης πατήσει καθαρισμό ενόσω υπαγορεύει
    if (typeof micBtn !== 'undefined' && micBtn && micBtn.classList.contains('is-recording')) { micBtn.click(); }

   isWaitingForResponse = false;
    // ΝΕΟ: Επαναφορά ΚΑΙ του readOnly. Το disabled μόνο του δεν αρκεί!
    DOM.input.readOnly = false; DOM.input.disabled = false; DOM.sendBtn.disabled = false;
    document.getElementById('typing-indicator')?.remove();
    
    resetInput(); // ΠΡΟΣΘΗΚΗ: Καθαρίζει το μισογραμμένο κείμενο και επαναφέρει το ύψος
    
  conversationHistory = [];
    try { sessionStorage.removeItem(CONFIG.SESSION_KEY); } catch(e) {}
    renderWelcomeMessage();
  });

  // --- SPEECH TO TEXT ENGINE ---
  const micBtn = document.getElementById('school-chat-mic');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
 if (SpeechRecognition && micBtn) { // Προστασία σε περίπτωση που το κουμπί δεν υπάρχει στο HTML
    const recognition = new SpeechRecognition();
    recognition.lang = 'el-GR';
    recognition.interimResults = false; 
    let isRecording = false;

    recognition.onstart = function() {
      isRecording = true;
      micBtn.classList.add('is-recording');
      DOM.input.placeholder = "Ακούω...";
    };

recognition.onresult = function(event) {
      if (isWaitingForResponse) return; // ΝΕΟ: Αποτροπή Ghost Typing αν το μήνυμα έχει ήδη σταλεί
      
      let newTranscript = '';
      // Σάρωση μόνο των νέων αποτελεσμάτων βάσει του resultIndex για αποφυγή επανάληψης λέξεων
      for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript;
      }
      
      if (newTranscript) {
          DOM.input.value += (DOM.input.value ? ' ' : '') + newTranscript;
          DOM.input.style.height = 'auto'; 
          DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
      }
    };
    recognition.onend = function() {
      isRecording = false;
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
    };

    recognition.onerror = function(event) {
      isRecording = false; // ΝΕΟ: Ξεκλειδώνει το μικρόφωνο για την επόμενη χρήση
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
    };

 micBtn.addEventListener('click', () => {
      if (isWaitingForResponse) return; // ΠΡΟΣΤΑΣΙΑ: Απαγόρευση μικροφώνου όσο το bot απαντά

      if (isRecording) { 
        recognition.stop(); 
        // ΝΕΟ: Χειροκίνητη επαναφορά UI/State για αποτροπή μόνιμου κολλήματος (Bug του Android)
        isRecording = false; 
        micBtn.classList.remove('is-recording');
        if (DOM.input) DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
      } else { 
        isRecording = true; // Άμεσο κλείδωμα για αποφυγή διπλού κλικ
        try { 
          recognition.start(); 
        } catch (e) { 
          isRecording = false; 
        }
      }
    });
  } else {
    if(micBtn) micBtn.style.display = 'none';
  }
})();
