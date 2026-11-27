(function() {
  'use strict';

  const CONFIG = {
    WORKER_URL: "https://school-chat-bot.valantish.workers.dev/",
    TEASER_DELAY_MS: 16000,
    TEASER_DURATION_MS: 12000,
    SESSION_KEY: "school_chat_history",
    MAX_INPUT_CHARS: 500,
    MAX_HISTORY_CHARS: 7000
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

  if (!DOM.widget || !DOM.bubble || !DOM.window || !DOM.input || !DOM.sendBtn || !DOM.messagesBox) return;
  if (window.__schoolChatInitialized) return;
  window.__schoolChatInitialized = true;

  DOM.input.maxLength = CONFIG.MAX_INPUT_CHARS;
  DOM.messagesBox.setAttribute('role', 'log');
  DOM.messagesBox.setAttribute('aria-live', 'polite');
  DOM.messagesBox.setAttribute('aria-relevant', 'additions');
  DOM.bubble.setAttribute('aria-expanded', 'false');
  DOM.window.setAttribute('aria-hidden', 'true');
  DOM.window.inert = true;

  let conversationHistory = [];
  let isWaitingForResponse = false;
  let isChatOpen = false;
  let idleTimer, teaserTimeout, teaserHideTimeout;
  let activeRequest = null;
  let stopMicRecording = null;
  let isPageUnloading = false;

  window.addEventListener('beforeunload', () => { isPageUnloading = true; });
  window.addEventListener('pagehide', () => { isPageUnloading = true; });
  window.addEventListener('pageshow', () => { isPageUnloading = false; });

  function isTouchDevice() {
    if (window.matchMedia) {
      if (window.matchMedia('(pointer: fine)').matches) return false;
      if (window.matchMedia('(pointer: coarse)').matches) return true;
    }
    return navigator.maxTouchPoints > 0;
  }

  function isNarrowMobile() {
    return window.innerWidth <= 768 && isTouchDevice();
  }

  function adjustInputHeight(el) {
    if (!el) return;
    const prevScroll = el.scrollTop;
    el.style.height = 'auto';
    if (el.scrollHeight > 0) {
      el.style.height = el.scrollHeight + 'px';
    }
    el.scrollTop = prevScroll;
  }

 function saveSession() {
    try { sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(conversationHistory)); } catch(e) {}
  }

 function loadInitialMessages() {
    let savedSession = null;
    try { savedSession = sessionStorage.getItem(CONFIG.SESSION_KEY); } catch(e) {}
    if (savedSession) {
      try {
        const rawParsed = JSON.parse(savedSession);
        if (!Array.isArray(rawParsed)) throw new Error('INVALID_HISTORY');

       const filteredHistory = rawParsed.filter(msg =>
          msg &&
          (msg.role === 'user' || msg.role === 'model') &&
          Array.isArray(msg.parts) &&
          msg.parts[0] &&
          typeof msg.parts[0].text === 'string' &&
          msg.parts[0].text.trim() !== ''
        );

        const parsedHistory = [];
        for (const msg of filteredHistory) {
          if (parsedHistory.length === 0) {
            if (msg.role === 'user') parsedHistory.push(msg);
            continue;
          }
          const prev = parsedHistory[parsedHistory.length - 1];
          if (prev.role === msg.role) {
            if (msg.role === 'user') {
              parsedHistory[parsedHistory.length - 1] = msg;
            }
          } else {
            parsedHistory.push(msg);
          }
        }
        if (parsedHistory.length > 0 && parsedHistory[parsedHistory.length - 1].role === 'user') {
          const unsentMsg = parsedHistory.pop();
          try { sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(parsedHistory)); } catch(e) {}

          if (DOM.input && unsentMsg.parts && unsentMsg.parts[0]) {
            DOM.input.value = unsentMsg.parts[0].text.slice(0, CONFIG.MAX_INPUT_CHARS);
            adjustInputHeight(DOM.input);
          }
        }

        conversationHistory = parsedHistory;
        renderWelcomeMessage();
        conversationHistory.forEach(msg => {
          const isUser = msg.role === 'user';
          addMessageToUI(msg.parts[0].text, isUser ? 'msg-user' : 'msg-bot', !isUser, true);
        });

        if (conversationHistory.length > 0) {
          try { localStorage.setItem('chat_welcomed', 'true'); } catch(err) {}
        }
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


  function stripMarkdownFallback(text) {
    return text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/`([^`]+)`/g, '$1');
  }

 function addMessageToUI(content, senderClass, isMarkdown = false, forceScrollBottom = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${senderClass}`;

    if (isMarkdown) {
      if (typeof DOMPurify !== 'undefined' && typeof marked !== 'undefined') {
        try {
          const rawHtml = typeof marked.parse === 'function'
            ? marked.parse(content, { breaks: true })
            : marked(content, { breaks: true });
          msgDiv.innerHTML = DOMPurify.sanitize(rawHtml, {
            FORBID_TAGS: ['img', 'svg', 'iframe', 'style', 'form', 'input', 'button', 'video', 'audio', 'object', 'embed']
          });

          msgDiv.querySelectorAll('a[href]').forEach(link => {
            const href = (link.getAttribute('href') || '').trim();
            if (/^https?:\/\//i.test(href)) {
              link.setAttribute('target', '_blank');
              link.setAttribute('rel', 'noopener noreferrer');
            } else {
              link.removeAttribute('target');
            }
          });
        } catch (renderErr) {
          msgDiv.textContent = stripMarkdownFallback(content);
        }
      } else {
        msgDiv.textContent = stripMarkdownFallback(content);
      }
    } else {
      msgDiv.textContent = content;
    }

    DOM.messagesBox.appendChild(msgDiv);

    const isBotAnswer = senderClass.includes('msg-bot') && !senderClass.includes('msg-error');
    if (isBotAnswer && !forceScrollBottom) {
      const relativeTop = (msgDiv.offsetParent === DOM.messagesBox)
        ? msgDiv.offsetTop
        : (msgDiv.offsetTop - DOM.messagesBox.offsetTop);
      DOM.messagesBox.scrollTop = Math.max(0, relativeTop - 12);
    } else {
      DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    }

    return msgDiv;
  }


 let isHiddenByScroll = false;
  let lastScrollTop = window.scrollY || document.documentElement.scrollTop;
  let lastWakeTime = 0;

  function wakeUpChat() {
    if (isHiddenByScroll) return;

    DOM.widget.classList.remove('widget-sleep');
    clearTimeout(idleTimer);

    if (isChatOpen || !isNarrowMobile() || (DOM.teaser && DOM.teaser.classList.contains('teaser-visible'))) return;

    idleTimer = setTimeout(() => {
      DOM.widget.classList.add('widget-sleep');
    }, 5000);
  }

  function throttledWakeUp() {
    const now = Date.now();
    if (now - lastWakeTime < 400) return;
    lastWakeTime = now;
    wakeUpChat();
  }

  ['touchstart', 'keydown'].forEach(evt => window.addEventListener(evt, throttledWakeUp, { passive: true }));

  window.addEventListener('resize', function() {
    if (!isNarrowMobile()) {
      isHiddenByScroll = false;
      clearTimeout(idleTimer);
      DOM.widget.classList.remove('widget-sleep');
    }
  }, { passive: true });

  window.addEventListener('scroll', function() {
    if (isChatOpen) return;

    const currentScroll = window.scrollY || document.documentElement.scrollTop;

    if (currentScroll <= 0) {
      isHiddenByScroll = false;
      wakeUpChat();
      lastScrollTop = 0;
      return;
    }

    if (Math.abs(currentScroll - lastScrollTop) > 5) {
      if (currentScroll > lastScrollTop) {
        if (isNarrowMobile() && !isHiddenByScroll) {
          isHiddenByScroll = true;
          clearTimeout(idleTimer);
          DOM.widget.classList.add('widget-sleep');
        }
      } else if (currentScroll < lastScrollTop) {
        isHiddenByScroll = false;
        wakeUpChat();
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }
  }, { passive: true });

  isHiddenByScroll = false;
  wakeUpChat();

function initTeaser() {
    if (!DOM.teaser) return;
    let hasData = false;
    try { hasData = localStorage.getItem('chat_welcomed') || sessionStorage.getItem(CONFIG.SESSION_KEY); } catch(e) {}

    if (!hasData) {
      teaserTimeout = setTimeout(() => {
        if (!isChatOpen && DOM.teaser) {
          DOM.teaser.classList.add('teaser-visible');
          isHiddenByScroll = false;
          wakeUpChat();
          teaserHideTimeout = setTimeout(closeTeaser, CONFIG.TEASER_DURATION_MS);
        }
      }, CONFIG.TEASER_DELAY_MS);
    }
  }

  function closeTeaser() {
    clearTimeout(teaserTimeout);
    clearTimeout(teaserHideTimeout);
    if (DOM.teaser) DOM.teaser.classList.remove('teaser-visible');
    try { localStorage.setItem('chat_welcomed', 'true'); } catch(e) {}
    wakeUpChat();
  }

  if (DOM.teaserClose) {
    DOM.teaserClose.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); });
  }
  if (DOM.teaser) {
    DOM.teaser.addEventListener('click', (e) => { e.stopPropagation(); closeTeaser(); toggleChat(); });
  }

function toggleChat() {
    try { localStorage.setItem('chat_welcomed', 'true'); } catch(e) {}
    closeTeaser();
    const isOpen = DOM.window.classList.contains('is-open');

    isHiddenByScroll = false;

    if (isOpen) {
      if (stopMicRecording) stopMicRecording();
      if (DOM.input) DOM.input.blur();
      DOM.bubble.focus();
      DOM.window.classList.remove('is-open');
      DOM.window.style.maxHeight = '';
      DOM.window.style.bottom = '';
      DOM.window.style.top = '';
      isChatOpen = false;
      DOM.bubble.setAttribute('aria-expanded', 'false');
      DOM.window.setAttribute('aria-hidden', 'true');
      DOM.window.inert = true;
    } else {
      DOM.window.inert = false;
      DOM.window.setAttribute('aria-hidden', 'false');
      DOM.bubble.setAttribute('aria-expanded', 'true');
      DOM.window.classList.add('is-open');
      isChatOpen = true;

      setTimeout(() => {
        if (!isTouchDevice()) DOM.input.focus();
        DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;

        if (DOM.input && DOM.input.value) {
          adjustInputHeight(DOM.input);
        }
      }, 300);
    }
    wakeUpChat();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isChatOpen) {
      toggleChat();
    }
  });

  function resetInput() {
    DOM.input.value = '';
    DOM.input.style.height = 'auto';
  }

  DOM.input.addEventListener('input', function() {
    adjustInputHeight(this);
  });

  DOM.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isTouchDevice()) {
      e.preventDefault();
      handleSend();
    }
  });

 function optimizeGreekText(text) {
    let cleaned = text.normalize ? text.normalize('NFC') : text;
    cleaned = cleaned
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    cleaned = cleaned.replace(/[^\p{L}\p{M}\p{N}\p{Emoji}\p{P}\p{S}\s\u200D\uFE0F]/gu, '');
    return cleaned.slice(0, CONFIG.MAX_INPUT_CHARS);
  }

 function getOptimizedHistory(history, maxChars = CONFIG.MAX_HISTORY_CHARS) {
    if (!Array.isArray(history) || history.length === 0) return [];

    let currentChars = 0;
    const optimizedHistory = [];
    let i = history.length - 1;

    if (history[i].role === 'user') {
      const latestText = history[i].parts[0].text.slice(0, maxChars);
      optimizedHistory.unshift({ role: 'user', parts: [{ text: latestText }] });
      currentChars += latestText.length;
      i--;
    }

    while (i >= 1) {
      const modelMsg = history[i];
      const userMsg = history[i - 1];

      if (userMsg.role !== 'user' || modelMsg.role !== 'model') {
        i--;
        continue;
      }

      const userText = userMsg.parts[0].text;
      const modelText = modelMsg.parts[0].text;
      const pairLen = userText.length + modelText.length;

      if (currentChars + pairLen <= maxChars) {
        optimizedHistory.unshift(userMsg, modelMsg);
        currentChars += pairLen;
        i -= 2;
      } else {
        const remaining = maxChars - currentChars;
        if (optimizedHistory.length <= 1 && remaining > userText.length + 100) {
          const trimmedModelText = modelText.slice(0, remaining - userText.length - 1) + '…';
          optimizedHistory.unshift(
            userMsg,
            { role: 'model', parts: [{ text: trimmedModelText }] }
          );
        }
        break;
      }
    }

    while (optimizedHistory.length > 0 && optimizedHistory[0].role !== 'user') {
      optimizedHistory.shift();
    }
    return optimizedHistory;
  }

  function detectPersonalData(text) {
    const findings = [];

    const sanitizedForNumbers = text
      .replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, ' ')
      .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ')
      .replace(/\b(?:19|20)\d{2}\s*[-–/]\s*(?:19|20)?\d{2,4}\b/g, ' ');

    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
      findings.push('διεύθυνση email');
    }
    if (/(?:^|[^\d])(?:(?:\+|00)30[ .-]?)?(?:69|2[1-8])\d(?:[ .-]?\d){7}(?!\d)/.test(sanitizedForNumbers)) {
      findings.push('αριθμός τηλεφώνου');
    }
    if (/(?:^|[^\d])\d{6}[ -]?\d{5}(?!\d)/.test(sanitizedForNumbers)) {
      findings.push('ΑΜΚΑ');
    }
    if (/(?:^|[^\d])\d{9}(?!\d)/.test(sanitizedForNumbers)) {
      findings.push('ΑΦΜ');
    }
    if (/(?:^|[^Α-Ωα-ωA-Za-z0-9])[Α-ΩA-Z]{1,2}[\s-]?\d{6}(?!\d)/.test(text)) {
      findings.push('αριθμός ταυτότητας');
    }
    if (/(?:^|[^A-Za-z0-9])GR\d{2}(?:[\s-]?\d{4}){5}[\s-]?\d{3}(?!\d)/i.test(text)) {
      findings.push('τραπεζικό IBAN');
    }

    return findings;
  }

async function handleSend() {
    if (isWaitingForResponse) return;
    if (stopMicRecording) stopMicRecording();

    const rawText = DOM.input.value.trim();
    if (!rawText) return;

    DOM.messagesBox.querySelectorAll('.msg-error').forEach(err => err.remove());

    if (rawText.length > CONFIG.MAX_INPUT_CHARS) {
      addMessageToUI(`⚠️ Το μήνυμα είναι πολύ μεγάλο (μέγιστο όριο ${CONFIG.MAX_INPUT_CHARS} χαρακτήρες).`, 'msg-bot msg-error', false);
      return;
    }

    const detectedPII = detectPersonalData(rawText);
    if (detectedPII.length > 0) {
      addMessageToUI(
        `🛡️ Για την προστασία σας, το μήνυμα δεν στάλθηκε επειδή εντοπίστηκε προσωπικό στοιχείο (${detectedPII.join(', ')}). Παρακαλούμε αφαιρέστε το και δοκιμάστε ξανά.`,
        'msg-bot msg-error',
        false
      );
      return;
    }

    isWaitingForResponse = true;
    resetInput();
    DOM.input.readOnly = true;
    DOM.sendBtn.disabled = true;

    const userMsgEl = addMessageToUI(rawText, 'msg-user', false, true);

    conversationHistory.push({ role: 'user', parts: [{ text: rawText }] });
    saveSession();

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    DOM.messagesBox.appendChild(indicator);
    DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
    wakeUpChat();

    activeRequest = new AbortController();
    const currentRequest = activeRequest;
    const timeoutId = setTimeout(() => { if (currentRequest) currentRequest.abort(); }, 30000);

    try {
      if (!navigator.onLine) throw new Error('OFFLINE');

      const optimizedHistory = getOptimizedHistory(conversationHistory, CONFIG.MAX_HISTORY_CHARS);
      const payloadHistory = optimizedHistory.map(msg => {
        if (msg.role === 'user') {
          const optText = optimizeGreekText(msg.parts[0].text);
          return { role: 'user', parts: [{ text: optText || msg.parts[0].text.slice(0, CONFIG.MAX_INPUT_CHARS) }] };
        }
        return msg;
      });

      const response = await fetch(CONFIG.WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: currentRequest.signal,
        body: JSON.stringify({ contents: payloadHistory })
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('RATE_LIMIT');
        if (response.status >= 500) throw new Error('SERVER_ERROR');
        throw new Error('API_ERROR');
      }

      const data = await response.json();

      if (activeRequest !== currentRequest) return;

      if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback && data.promptFeedback.blockReason) throw new Error('SAFETY_BLOCK');
        throw new Error('EMPTY_RESPONSE');
      }

      const candidate = data.candidates[0];
      const safetyReasons = ['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII'];

      if (safetyReasons.includes(candidate.finishReason)) {
        throw new Error('SAFETY_BLOCK');
      }
      if (candidate.finishReason === 'RECITATION') {
        throw new Error('RECITATION_BLOCK');
      }

      const parts = (candidate.content && Array.isArray(candidate.content.parts)) ? candidate.content.parts : [];
      const botReply = parts
        .filter(part => !part.thought && typeof part.text === 'string')
        .map(part => part.text)
        .join('')
        .trim();

      if (!botReply) {
        throw new Error('EMPTY_RESPONSE');
      }

     const typingInd = document.getElementById('typing-indicator');
      if (typingInd) typingInd.remove();

      conversationHistory.push({ role: 'model', parts: [{ text: botReply }] });
      saveSession();

      try {
        addMessageToUI(botReply, 'msg-bot', true);
      } catch (uiErr) {
        addMessageToUI(botReply, 'msg-bot', false);
      }

    } catch (error) {
      if (isPageUnloading || activeRequest !== currentRequest || activeRequest === null) return;

      const typingInd = document.getElementById('typing-indicator');
      if (typingInd) typingInd.remove();

      if (userMsgEl && userMsgEl.parentNode) {
        userMsgEl.remove();
      }

      let errorMessage = "⚠️ Προέκυψε σφάλμα επικοινωνίας. Δοκιμάστε ξανά.";

      if (error.name === 'AbortError') {
        errorMessage = "⏳ Η απάντηση άργησε πολύ και διακόπηκε. Δοκιμάστε ξανά.";
      } else if (error.message === 'OFFLINE' || !navigator.onLine) {
        errorMessage = "🌐 Φαίνεται πως δεν έχετε σύνδεση στο διαδίκτυο.";
      } else if (error.name === 'TypeError') {
        errorMessage = "🔌 Αδυναμία σύνδεσης με τον βοηθό (πιθανό μπλοκάρισμα δικτύου ή προσωρινό πρόβλημα).";
      } else if (error.message === 'RATE_LIMIT') {
        errorMessage = "⏳ Δέχομαι πάρα πολλά μηνύματα αυτή τη στιγμή! Δοκιμάστε ξανά σε 1 λεπτό.";
      } else if (error.message === 'SERVER_ERROR') {
        errorMessage = "🔌 Υπάρχει προσωρινό τεχνικό πρόβλημα στον διακομιστή. Δοκιμάστε σε λίγο.";
      } else if (error.message === 'SAFETY_BLOCK') {
        errorMessage = "🛡️ Το μήνυμα δεν μπόρεσε να απαντηθεί λόγω πολιτικής ασφαλείας.";
      } else if (error.message === 'RECITATION_BLOCK' || error.message === 'EMPTY_RESPONSE') {
        errorMessage = "🤔 Δεν μπόρεσα να διαμορφώσω απάντηση γι' αυτό. Δοκιμάστε να διατυπώσετε αλλιώς την ερώτηση.";
      }

      addMessageToUI(errorMessage, 'msg-bot msg-error', false);
      conversationHistory.pop();
      saveSession();

      DOM.input.value = rawText;
      adjustInputHeight(DOM.input);
    } finally {
      clearTimeout(timeoutId);

      if (activeRequest === currentRequest) {
        activeRequest = null;
        isWaitingForResponse = false;
        DOM.input.readOnly = false;
        DOM.sendBtn.disabled = false;

        if (!isTouchDevice() && isChatOpen) {
          DOM.input.focus();
        }
      }
    }
  }
  loadInitialMessages();
  initTeaser();

if (window.visualViewport) {
    let wasKeyboardOpen = false;
    const handleViewportChange = () => {
      if (!isChatOpen) return;

      const vv = window.visualViewport;
      const isKeyboardOpen = (window.innerHeight - vv.height) > 120;

      if (isKeyboardOpen) {
        const kbOffset = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
        DOM.window.style.bottom = `${kbOffset + 10}px`;
        DOM.window.style.top = 'auto';
        DOM.window.style.maxHeight = `${Math.max(200, vv.height - 36)}px`;
        if (!wasKeyboardOpen) {
          DOM.messagesBox.scrollTop = DOM.messagesBox.scrollHeight;
        }
      } else {
        DOM.window.style.maxHeight = '';
        DOM.window.style.bottom = '';
        DOM.window.style.top = '';
      }
      wasKeyboardOpen = isKeyboardOpen;
    };

    window.visualViewport.addEventListener('resize', handleViewportChange, { passive: true });
    window.visualViewport.addEventListener('scroll', handleViewportChange, { passive: true });
  }

  DOM.bubble.addEventListener('click', toggleChat);
  if (DOM.closeBtn) DOM.closeBtn.addEventListener('click', toggleChat);
  DOM.sendBtn.addEventListener('click', handleSend);

  if (DOM.clearBtn) {
    DOM.clearBtn.addEventListener('click', () => {
      if (activeRequest) { activeRequest.abort(); activeRequest = null; }
      if (stopMicRecording) stopMicRecording();

      isWaitingForResponse = false;
      DOM.input.readOnly = false;
      DOM.input.disabled = false;
      DOM.sendBtn.disabled = false;

      const typingInd = document.getElementById('typing-indicator');
      if (typingInd) typingInd.remove();

      resetInput();
      conversationHistory = [];
      try { sessionStorage.removeItem(CONFIG.SESSION_KEY); } catch(e) {}
      renderWelcomeMessage();
    });
  }

 const micBtn = document.getElementById('school-chat-mic');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const DEFAULT_PLACEHOLDER = (DOM.input && DOM.input.getAttribute('placeholder')) || "Γράψτε το ερώτημά σας εδώ...";

  if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'el-GR';
    recognition.interimResults = true;
    let isRecording = false;
    let isStartingMic = false;
    let baseTextBeforeMic = '';

    stopMicRecording = function() {
      if (!isRecording && !isStartingMic) return;
      isRecording = false;
      isStartingMic = false;
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = DEFAULT_PLACEHOLDER;
      try { recognition.abort(); } catch (e) {}
    };

    recognition.onstart = function() {
      isStartingMic = false;
      isRecording = true;
      baseTextBeforeMic = DOM.input.value.trim();
      micBtn.classList.add('is-recording');
      DOM.input.placeholder = "Ακούω...";
    };

    recognition.onresult = function(event) {
      if (!isRecording || isWaitingForResponse) return;

      let sessionTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        sessionTranscript += event.results[i][0].transcript;
      }

      const combined = (baseTextBeforeMic ? baseTextBeforeMic + ' ' : '') + sessionTranscript.trim();
      DOM.input.value = combined.slice(0, CONFIG.MAX_INPUT_CHARS);
      adjustInputHeight(DOM.input);
    };

    recognition.onend = function() {
      isStartingMic = false;
      isRecording = false;
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = DEFAULT_PLACEHOLDER;
    };

    recognition.onerror = function(event) {
      isStartingMic = false;
      isRecording = false;
      micBtn.classList.remove('is-recording');
      DOM.input.placeholder = DEFAULT_PLACEHOLDER;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        DOM.messagesBox.querySelectorAll('.msg-error').forEach(err => err.remove());
        addMessageToUI("🎤 Δεν επιτράπηκε η πρόσβαση στη φωνητική υπαγόρευση από τον φυλλομετρητή ή τις ρυθμίσεις σας.", 'msg-bot msg-error', false);
      } else if (event.error === 'audio-capture') {
        DOM.messagesBox.querySelectorAll('.msg-error').forEach(err => err.remove());
        addMessageToUI("🎤 Δεν εντοπίστηκε ενεργό μικρόφωνο στη συσκευή σας.", 'msg-bot msg-error', false);
      }
    };

    micBtn.addEventListener('click', () => {
      if (isWaitingForResponse || isStartingMic) return;

      if (isRecording) {
        try { recognition.stop(); } catch (e) { stopMicRecording(); }
      } else {
        isStartingMic = true;
        try {
          recognition.start();
        } catch (e) {
          isStartingMic = false;
          isRecording = false;
        }
      }
    });
  } else {
    if (micBtn) micBtn.style.display = 'none';
  }
})();
