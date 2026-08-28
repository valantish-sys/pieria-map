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


  function addMessageToUI(content, senderClass, isMarkdown = false) {
    const msgDiv = document.createElement('div'); 
    msgDiv.className = `chat-msg ${senderClass}`;
    
if (isMarkdown) {
    
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
       
          msgDiv.innerText = content;
      }
    } else {
      msgDiv.innerText = content;
    }
    
    DOM.messagesBox.appendChild(msgDiv); 
    DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight; 
  }


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


  ['mousemove', 'touchstart', 'keydown'].forEach(evt => window.addEventListener(evt, wakeUpChat, { passive: true }));


  window.addEventListener('scroll', function() {
    if (isChatOpen) return; 

    let currentScroll = window.scrollY || document.documentElement.scrollTop;
    const isMobile = window.innerWidth <= 768;

    if (currentScroll <= 0) {
      isHiddenByScroll = false;
      wakeUpChat();
      lastScrollTop = currentScroll;
      return;
    }


    if (Math.abs(currentScroll - lastScrollTop) > 5) {
      if (currentScroll > lastScrollTop) {
   
        if (isMobile && !isHiddenByScroll) {
          isHiddenByScroll = true; 
          clearTimeout(idleTimer); 
          DOM.widget.classList.add('widget-sleep');
        }
      } 
      else if (currentScroll < lastScrollTop) {
     
        isHiddenByScroll = false; 
        wakeUpChat(); 
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    }
  }, { passive: true });


  isHiddenByScroll = false;
  wakeUpChat();

 function initTeaser() {
    let hasData = false;
    try { hasData = localStorage.getItem('chat_welcomed') || sessionStorage.getItem(CONFIG.SESSION_KEY); } catch(e) {}
    
    if (!hasData) {
      teaserTimeout = setTimeout(() => {
        if (!isChatOpen) {
          DOM.teaser.classList.add('teaser-visible');
          isHiddenByScroll = false;
          wakeUpChat();
          teaserHideTimeout = setTimeout(closeTeaser, CONFIG.TEASER_DURATION_MS);
        }
      }, CONFIG.TEASER_DELAY_MS);
    }
  }

function closeTeaser() {
    DOM.teaser.classList.remove('teaser-visible');
    try { localStorage.setItem('chat_welcomed', 'true'); } catch(e) {}
    wakeUpChat();
  }

DOM.teaserClose.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); });
  DOM.teaserText.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); toggleChat(); });

 function toggleChat() {
    try { localStorage.setItem('chat_welcomed', 'true'); } catch(e) {} 
    clearTimeout(teaserTimeout); closeTeaser();
    const isOpen = DOM.window.classList.contains('is-open');
    
    isHiddenByScroll = false;
    
if (isOpen) {
      DOM.window.classList.remove('is-open'); isChatOpen = false;
      if (DOM.input) DOM.input.blur(); 
   } else {
      DOM.window.classList.add('is-open'); isChatOpen = true;
      
      setTimeout(() => { 
          if (window.innerWidth > 768) DOM.input.focus(); 
          DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    
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

  function resetInput() {
    DOM.input.value = '';
    DOM.input.style.height = 'auto';
  }

  DOM.input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

DOM.input.addEventListener('keydown', (e) => { 

    const isMobile = window.innerWidth <= 768;
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isMobile) {
      e.preventDefault(); 
      handleSend(); 
    }
  });

  function optimizeGreekText(text) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/\s+/g, ' ');

    const isUpperCase = cleaned === cleaned.toUpperCase();
    const containsGreek = /[Α-Ωα-ωΆΈΉΊΌΎΏάέήίόύώ]/.test(cleaned);
    
    if (isUpperCase && containsGreek) {
        cleaned = cleaned.toLowerCase();
    }

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

    const errorMsgs = DOM.messagesBox.querySelectorAll('.msg-error');
    errorMsgs.forEach(err => err.remove());

    if (typeof micBtn !== 'undefined' && micBtn && micBtn.classList.contains('is-recording')) { micBtn.click(); }

    let optimizedTextForModel = optimizeGreekText(rawText);

    if (!optimizedTextForModel) {
        optimizedTextForModel = rawText;
    }
    
 isWaitingForResponse = true; 
    resetInput();
    DOM.input.readOnly = true; DOM.sendBtn.disabled = true; 

    addMessageToUI(rawText, 'msg-user', false); 

    conversationHistory.push({ role: "user", parts: [{ text: rawText }] });
    saveSession();
    
    const indicator = document.createElement('div'); indicator.className = 'typing-indicator'; indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    DOM.messagesBox.appendChild(indicator); DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    wakeUpChat();

   activeRequest = new AbortController();
   const currentRequest = activeRequest; 
   const timeoutId = setTimeout(() => { if (currentRequest) currentRequest.abort(); }, 30000);

    try {
      if (!navigator.onLine) throw new Error('OFFLINE');

    let optimizedHistory = getOptimizedHistory(conversationHistory, 3500);


      const payloadHistory = optimizedHistory.map(msg => {
          if (msg.role === 'user') {
              let optText = optimizeGreekText(msg.parts[0].text);
              return { role: "user", parts: [{ text: optText || msg.parts[0].text }] };
          }
          return msg;
      });

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

   const typingInd = document.getElementById('typing-indicator');
      if (typingInd) typingInd.remove();
      
    const candidate = data.candidates[0];

      if (candidate.finishReason === 'SAFETY' || !candidate.content) {
          throw new Error('SAFETY_BLOCK');
      }

      if (!candidate.content.parts || candidate.content.parts.length === 0) {
          throw new Error('EMPTY_RESPONSE');
      }
      
      const botReply = candidate.content.parts[0].text;
 
      if (typeof botReply === 'undefined') {
          throw new Error('EMPTY_RESPONSE');
      }
      
      addMessageToUI(botReply, 'msg-bot', true);
      conversationHistory.push({ role: "model", parts: [{ text: botReply }] });
      saveSession(); 

  } catch (error) {

      if (error.name === 'AbortError' && activeRequest !== currentRequest) {
          return;
      }
      if (error.name === 'AbortError' && activeRequest === null) {
          return;
      }

    const typingInd = document.getElementById('typing-indicator');
      if (typingInd) typingInd.remove();
   
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

      if (DOM.input.scrollHeight > 0) {
          DOM.input.style.height = (DOM.input.scrollHeight) + 'px';
      }
} finally {
      clearTimeout(timeoutId); 
  
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

    if (activeRequest) { activeRequest.abort(); activeRequest = null; }

    if (typeof micBtn !== 'undefined' && micBtn && micBtn.classList.contains('is-recording')) { micBtn.click(); }

   isWaitingForResponse = false;

    DOM.input.readOnly = false; DOM.input.disabled = false; DOM.sendBtn.disabled = false;
 const typingInd = document.getElementById('typing-indicator');
      if (typingInd) typingInd.remove();
    
    resetInput();
    
  conversationHistory = [];
    try { sessionStorage.removeItem(CONFIG.SESSION_KEY); } catch(e) {}
    renderWelcomeMessage();
  });

  const micBtn = document.getElementById('school-chat-mic');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
 if (SpeechRecognition && micBtn) { 
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
      if (isWaitingForResponse) return; 
      
      let newTranscript = '';
  
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
      isRecording = false; 
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
    };

 micBtn.addEventListener('click', () => {
      if (isWaitingForResponse) return;

      if (isRecording) { 
        recognition.stop(); 
      
        isRecording = false; 
        micBtn.classList.remove('is-recording');
        if (DOM.input) DOM.input.placeholder = "Γράψτε το ερώτημά σας εδώ...";
      } else { 
        isRecording = true; 
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
