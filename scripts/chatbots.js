class GreenEconomyChatbot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.chatMessages = [];
    this.currentLanguage = 'en';
    this.translations = {
      en: {
        "ai-assistant-title": "AI Assistant",
        "ai-welcome": "Sawubona! Hello! Dumelang! 🌱 I'm your Green Economy AI Assistant. I can help you in isiZulu, English, or Tswana. How can I assist you with green economy opportunities today?",
        "ai-input-placeholder": "Ask me about green economy opportunities..."
      },
      zu: {
        "ai-assistant-title": "Umsizi we-AI",
        "ai-welcome": "Sawubona! 🌱 NginguMsizi wakho we-AI womnotho oluhlaza. Ngingakusiza ngesiZulu, isiNgisi, noma isiTswana. Ngingakusiza kanjani namathuba omnotho oluhlaza namuhla?",
        "ai-input-placeholder": "Ngibuze ngamathuba omnotho oluhlaza..."
      },
      tn: {
        "ai-assistant-title": "Mothusi wa AI",
        "ai-welcome": "Dumelang! 🌱 Ke Mothusi wa gago wa AI wa ikonomi e tala. Nka go thuša ka Setswana, Sekgowa kgotsa isiZulu. Nka go thuša jang ka ditšhono tsa ikonomi e tala gompieno?",
        "ai-input-placeholder": "Mpotse ka ditšhono tsa ikonomi e tala..."
      }
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.initializeChat();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --green-primary: #4eb5a6;
          --green-dark: #005d6a;
          --green-light: #b8e5e1;
          --green-accent: #7cc8bc;
          --light-bg: #f8fffe;
          --background: #ffffff;
          --foreground: #0f172a;
          --card: #ffffff;
          --card-foreground: #0f172a;
          --border: #e2e8f0;
          --muted-foreground: #64748b;
          --primary: #1e293b;
          --primary-foreground: #f8fafc;
          --secondary: #f1f5f9;
          --secondary-foreground: #1e293b;
          --radius: 10rem;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .ai-assistant-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--green-dark), var(--green-primary));
          border: none;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          z-index: 999;
        }

        .ai-assistant-btn:hover {
          background: linear-gradient(135deg, var(--green-primary), var(--green-dark));
          transform: scale(1.1);
          box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.3);
        }

        .ai-assistant-btn svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: white;
          margin: 5% auto;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          position: relative;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--muted-foreground);
          transition: color 0.2s ease;
        }

        .modal-close:hover {
          color: var(--green-primary);
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--light-bg);
        }

        .message {
          margin-bottom: 1rem;
          display: flex;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.ai {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-size: 0.875rem;
        }

        .message.user .message-content {
          background: var(--green-primary);
          color: white;
        }

        .message.ai .message-content {
          background: var(--light-bg);
          color: var(--foreground);
        }

        .chat-input-container {
          display: flex;
          gap: 1rem;
        }

        .chat-input {
          flex: 1;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .chat-input:focus {
          outline: none;
          border-color: var(--green-primary);
          box-shadow: 0 0 0 3px rgba(78, 181, 166, 0.1);
        }

        .chat-send {
          background: linear-gradient(135deg, var(--green-dark), var(--green-primary));
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .chat-send:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .ai-assistant-btn {
            width: 50px;
            height: 50px;
            bottom: 1rem;
            right: 1rem;
          }

          .ai-assistant-btn svg {
            width: 20px;
            height: 20px;
          }

          .modal-content {
            width: 95%;
            margin: 10% auto;
          }
        }
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
      <div id="aiModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <div class="chat-container">
            <h3 data-translate="ai-assistant-title">AI Assistant</h3>
            <div class="chat-messages" id="chatMessages">
            </div>
            <div class="chat-input-container">
              <input type="text" id="chatInput" class="chat-input" data-translate-placeholder="ai-input-placeholder" placeholder="Ask me about green economy opportunities...">
              <button class="chat-send">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const aiAssistantBtn = this.shadowRoot.querySelector('.ai-assistant-btn');
    const modalClose = this.shadowRoot.querySelector('.modal-close');
    const chatSend = this.shadowRoot.querySelector('.chat-send');
    const chatInput = this.shadowRoot.getElementById('chatInput');
    const modal = this.shadowRoot.getElementById('aiModal');

    aiAssistantBtn.addEventListener('click', () => this.openAIAssistant());
    modalClose.addEventListener('click', () => this.closeAIAssistant());
    chatSend.addEventListener('click', () => this.sendMessage());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeAIAssistant();
    });
  }

  initializeChat() {
    let tempUserId = new URLSearchParams(window.location.search).get('tempUserId');
    if (!tempUserId) {
      tempUserId = 'guest_' + Math.random().toString(36).substr(2, 9);
      console.log("Generated guest tempUserId:", tempUserId);
    }
    this.tempUserId = tempUserId;

    if (typeof firebase !== 'undefined' && firebase.firestore) {
      this.db = firebase.firestore();
    } else {
      console.warn("Firebase not available for chatbot interaction tracking");
    }

    this.updateLanguage(this.currentLanguage);
  }

  openAIAssistant() {
    const modal = this.shadowRoot.getElementById('aiModal');
    if (modal) {
      modal.style.display = 'flex';
      this.trackUserInteraction('ai_assistant', 'opened');
    }
  }

  closeAIAssistant() {
    const modal = this.shadowRoot.getElementById('aiModal');
    if (modal) {
      modal.style.display = 'none';
      this.trackUserInteraction('ai_assistant', 'closed');
    }
  }

  sendMessage() {
  const input = this.shadowRoot.getElementById('chatInput');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  this.addMessage(message, 'user');
  input.value = '';
  this.trackUserInteraction('ai_chat', 'message_sent');

  setTimeout(() => {
    const aiResponse = this.generateAIResponse(message);
    this.addMessage(aiResponse, 'ai');
  }, 1000);
}

generateAIResponse(userMessage) {
  const offlineMessages = {
    en: "🌱 Our Green Economy AI Assistant is currently offline, nurturing new sustainable solutions. We'll be back online soon to help you grow your green initiatives!",
    zu: "🌱 UMsizi wethu we-AI womnotho oluhlaza akukho ku-inthanethi okwamanje, ukukhulisa izixazululo ezintsha ezizinzile. Sizobuya ku-inthanethi kungekudala ukuze sikusize ukukhulisa izinhlelo zakho eziluhlaza!",
    tn: "🌱 Mothusi wa rona wa AI wa ikonomi e tala ga o mo inthaneteng jaanong, o tshwere ka go godiša ditharollo tše dintšhwa tša go ikamêla. Re tla boela re le mo inthaneteng ka bofefo go go thuša go godiša merero ya gago e tala!"
  };
  return offlineMessages[this.currentLanguage] || offlineMessages.en;
}

  addMessage(content, sender) {
    const messagesContainer = this.shadowRoot.getElementById('chatMessages');
    if (!messagesContainer) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    this.chatMessages.push({ content, sender, timestamp: new Date() });
  }

/*generateAIResponse(userMessage) {
    const responses = {
      en: [
        "I can help you find green funding opportunities. What type of project are you working on?",
        "Let me connect you with relevant SMME businesses in your area. What industry are you interested in?",
        "I can guide you to the right sustainability toolkit. What environmental challenge are you facing?",
        "Great question! I can help you understand the legal requirements for green business certification."
      ],
      zu: [
        "Ngingakusiza ukuthola amathuba ezimali eziluhlaza. Yiluphi uhlobo lwephrojekthi osebenza ngalo?",
        "Ake ngikuxhumanise namabhizinisi afanele endaweni yakho. Yimuphi umkhakha onomdla ngawo?",
        "Ngingakuqondisa kutulusi efanele. Yiyiphi inselelo yendalo obhekane nayo?",
        "Umbuzo omuhle! Ngingakusiza ukuqonda izidingo zomthetho zokuqinisekisa ibhizinisi eliluhlaza."
      ],
      tn: [
        "Nka go thuša go bona ditšhono tsa madi a tala. Ke morojwa ofe o o sebetsang ka ona?",
        "A ke go golagane le dikgwebo tše di maleba mo kgaolong ya gago. Ke intasteri efe e o nang le kgatlhego go yona?",
        "Nka go dira gore o itekanele le sebereka se se maleba. Ke tlhohlo efe ya tikologo e o lebaneng le yona?",
        "Potšišo e botse! Nka go thuša go tlhaloganya ditlhokwa tsa semolao tsa netefatso ya dikgwebo tše di tala."
      ]
    };
    const langResponses = responses[this.currentLanguage] || responses.en;
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }*/

  trackUserInteraction(category, action, label = '') {
    if (this.db) {
      this.db.collection('interactions').add({
        tempUserId: this.tempUserId,
        category: category,
        action: action,
        label: label,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        language: this.currentLanguage,
        userAgent: navigator.userAgent
      }).catch((error) => {
        console.error("Error logging interaction to Firestore: ", error);
        console.log(`Local log: tempUserId=${this.tempUserId}, category=${category}, action=${action}, label=${label}`);
      });
    } else {
      console.log(`Local log: tempUserId=${this.tempUserId}, category=${category}, action=${action}, label=${label}`);
    }
  }

  changeLanguage(lang) {
    this.currentLanguage = lang;
    this.updateLanguage(lang);
    this.trackUserInteraction('language', 'changed', lang);
  }

  updateLanguage(lang) {
    this.currentLanguage = lang;
    const elements = this.shadowRoot.querySelectorAll('[data-translate]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-translate');
      if (this.translations[lang] && this.translations[lang][key]) {
        element.textContent = this.translations[lang][key];
      }
    });

    const placeholderElements = this.shadowRoot.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach((element) => {
      const key = element.getAttribute('data-translate-placeholder');
      if (this.translations[lang] && this.translations[lang][key]) {
        element.placeholder = this.translations[lang][key];
      }
    });
  }
}

customElements.define('green-economy-chatbot', GreenEconomyChatbot);