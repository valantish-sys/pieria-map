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

  let conversationHistory = [];
  let isWaitingForResponse = false;
  let isChatOpen = false; 
  let idleTimer, teaserTimeout, teaserHideTimeout;

  // --- RΥΘΜΙΣΗ DOMPurify ---
  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
      if ('target' in node) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
      }
  });

  // --- 1. ΥΠΟΣΤΗΡΙΞΗ SESSION STORAGE ---
  function saveSession() {
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(conversationHistory));
  }

  function loadInitialMessages() {
    const savedSession = sessionStorage.getItem(CONFIG.SESSION_KEY);
    if (savedSession) {
      try {
        const parsedHistory = JSON.parse(savedSession);
        if (parsedHistory.length > 0 && parsedHistory[0].role !== "user") {
           parsedHistory.shift();
        }
        if (parsedHistory.length > 0 && parsedHistory[parsedHistory.length - 1].role === "user") {
           parsedHistory.pop(); 
           sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(parsedHistory)); 
        }
        conversationHistory = parsedHistory;
        renderWelcomeMessage();
        conversationHistory.forEach(msg => {
          const isUser = msg.role === 'user';
          addMessageToUI(msg.parts[0].text, isUser ? 'msg-user' : 'msg-bot', !isUser);
        });
        localStorage.setItem('chat_welcomed', 'true');
      } catch(e) {
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
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
      msgDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
    } else {
      msgDiv.innerHTML = DOMPurify.sanitize(content);
    }
    
    DOM.messagesBox.appendChild(msgDiv); 
    DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight; 
  }

  // --- 3. UI & WAKE UP (ΕΞΥΠΝΟ SCROLL) ---
  let isHiddenByScroll = false;
  let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

  function wakeUpChat() {
    // Αν το έχουμε κρύψει επειδή ο χρήστης κατεβαίνει, ΔΕΝ το ξυπνάμε με τυχαία αγγίγματα στην οθόνη
    if (isHiddenByScroll) return;
    
    DOM.widget.classList.remove('widget-sleep');
    clearTimeout(idleTimer);
    
    if (isChatOpen) return;
    
    idleTimer = setTimeout(() => {
      if (window.innerWidth <= 768 && !isChatOpen) DOM.widget.classList.add('widget-sleep');
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

    // Ανοχή 5px για ομαλότητα στο scroll
    if (currentScroll > lastScrollTop + 5) {
      // --- SCROLL ΠΡΟΣ ΤΑ ΚΑΤΩ (Εξαφάνιση) ---
      if (isMobile && !isHiddenByScroll) {
        isHiddenByScroll = true; // Το κλειδώνουμε
        clearTimeout(idleTimer); // Σταματάμε το χρονόμετρο των 5s
        DOM.widget.classList.add('widget-sleep');
      }
    } 
    else if (currentScroll < lastScrollTop - 5) {
      // --- SCROLL ΠΡΟΣ ΤΑ ΠΑΝΩ (Εμφάνιση) ---
      isHiddenByScroll = false; // Το ξεκλειδώνουμε
      wakeUpChat(); 
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
  }, { passive: true });

  // Αρχική κλήση με το που μπαίνει ο χρήστης για να φαίνεται
  isHiddenByScroll = false;
  wakeUpChat();

  function initTeaser() {
    if (!localStorage.getItem('chat_welcomed') && !sessionStorage.getItem(CONFIG.SESSION_KEY)) {
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
    localStorage.setItem('chat_welcomed', 'true');
  }

  DOM.teaserClose.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); });
  DOM.teaserText.addEventListener('click', () => { closeTeaser(); toggleChat(); });

  function toggleChat() {
    localStorage.setItem('chat_welcomed', 'true'); clearTimeout(teaserTimeout); closeTeaser();
    const isOpen = DOM.window.classList.contains('is-open');
    
    isHiddenByScroll = false; // ΝΕΟ: Αν ο χρήστης ανοίξει/κλείσει το chat, το ξεκλειδώνουμε!
    
    if (isOpen) {
      DOM.window.classList.remove('is-open'); isChatOpen = false;
    } else {
      DOM.window.classList.add('is-open'); isChatOpen = true;
      setTimeout(() => DOM.input.focus(), 300); 
      DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
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
    if (e.key === 'Enter' && !e.shiftKey) {
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

    cleaned = cleaned.replace(/[^\p{L}\p{N}\s\.,;:\?!()'"-]/gu, '');
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

  // --- 5. ΑΠΟΣΤΟΛΗ ΣΤΟ CLOUDFLARE WORKER ---
  async function handleSend() {
    const rawText = DOM.input.value.trim(); 
    if (!rawText || isWaitingForResponse) return;
    
    // Καθαρίζουμε το κείμενο πριν το στείλουμε
    const optimizedTextForModel = optimizeGreekText(rawText);
    
    isWaitingForResponse = true; 
    resetInput();
    DOM.input.disabled = true; DOM.sendBtn.disabled = true;
    
    // Δείχνουμε αυτό που έγραψε ο χρήστης στο UI
    addMessageToUI(rawText, 'msg-user', false); 
    
    // Αποθηκεύουμε στο ιστορικό το καθαρισμένο κείμενο
    conversationHistory.push({ role: "user", parts: [{ text: optimizedTextForModel }] });
    saveSession();
    
    const indicator = document.createElement('div'); indicator.className = 'typing-indicator'; indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    DOM.messagesBox.appendChild(indicator); DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    wakeUpChat();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); 

    try {
      if (!navigator.onLine) throw new Error('OFFLINE');

      let optimizedHistory = getOptimizedHistory(conversationHistory, 3500);

      // ΠΡΟΣΟΧΗ: Πλέον στέλνουμε ΜΟΝΟ το contents (ιστορικό). Το Cloudflare Worker βάζει τη βάση δεδομένων!
      const response = await fetch(CONFIG.WORKER_URL, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: optimizedHistory
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

      document.getElementById('typing-indicator').remove();
      const botReply = data.candidates[0].content.parts[0].text;
      
      addMessageToUI(botReply, 'msg-bot', true);
      conversationHistory.push({ role: "model", parts: [{ text: botReply }] });
      saveSession(); 

    } catch (error) {
      document.getElementById('typing-indicator')?.remove();
      let errorMessage = "⚠️ Προέκυψε σφάλμα σύνδεσης. Δοκιμάστε ξανά.";
      
      if (error.name === 'AbortError') errorMessage = "⏳ Η σύνδεση άργησε πολύ και διακόπηκε. Δοκιμάστε ξανά.";
      else if (error.message === 'OFFLINE' || error.name === 'TypeError') errorMessage = "🌐 Φαίνεται πως δεν έχετε σύνδεση στο ίντερνετ.";
      else if (error.message === 'RATE_LIMIT') errorMessage = "⏳ Δέχομαι πάρα πολλά μηνύματα! Δοκιμάστε ξανά σε 1 λεπτό.";
      else if (error.message === 'SERVER_ERROR') errorMessage = "🔌 Υπάρχει τεχνικό πρόβλημα στους servers. Δοκιμάστε ξανά σε λίγο.";
      else if (error.message === 'SAFETY_BLOCK') errorMessage = "🛡️ Το μήνυμα μπλοκαρίστηκε από τα φίλτρα ασφαλείας.";

      addMessageToUI(errorMessage, 'msg-bot msg-error', false); 
      conversationHistory.pop(); 
      saveSession();
      DOM.input.value = rawText; DOM.input.style.height = 'auto'; DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
    } finally {
      clearTimeout(timeoutId); 
      isWaitingForResponse = false; DOM.input.disabled = false; DOM.sendBtn.disabled = false; DOM.input.focus();
    }
  }

  loadInitialMessages();
  initTeaser();

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (!DOM.window.classList.contains('is-open')) return;
      const viewportHeight = window.visualViewport.height;
      DOM.window.style.maxHeight = `${viewportHeight - 20}px`;
      DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    });
  }

  DOM.bubble.addEventListener('click', toggleChat);
  DOM.closeBtn.addEventListener('click', toggleChat);
  DOM.sendBtn.addEventListener('click', handleSend);
  DOM.clearBtn.addEventListener('click', () => {
    conversationHistory = [];
    sessionStorage.removeItem(CONFIG.SESSION_KEY);
    renderWelcomeMessage();
  });

  // --- SPEECH TO TEXT ENGINE ---
  const micBtn = document.getElementById('school-chat-mic');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
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
      const transcript = event.results[0][0].transcript;
      DOM.input.value += (DOM.input.value ? ' ' : '') + transcript;
      DOM.input.style.height = 'auto'; 
      DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
    };

    recognition.onend = function() {
      isRecording = false;
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
    };

    recognition.onerror = function(event) {
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
    };

    micBtn.addEventListener('click', () => {
      if (isRecording) { recognition.stop(); } 
      else { recognition.start(); }
    });
  } else {
    if(micBtn) micBtn.style.display = 'none';
  }
})();
