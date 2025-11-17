// Cookie Consent Banner Script
// Manages user consent for cookies and analytics

class CookieConsentManager {
  constructor() {
    this.cookieName = 'nbi_cookie_consent';
    this.cookieExpire = 365; // days
    this.consentGiven = false;
    this.init();
  }

  init() {
    // Check if user has already given consent
    if (!this.getConsentStatus()) {
      this.showBanner();
    } else {
      this.consentGiven = true;
      console.log('✅ Cookie consent previously given');
    }
  }

  getConsentStatus() {
    const consent = localStorage.getItem(this.cookieName);
    return consent === 'accepted' || consent === 'denied';
  }

  showBanner() {
    // Create banner HTML
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-consent-wrapper">
        <div class="cookie-consent-content">
          <div class="cookie-consent-text">
            <h3>Cookie Consent</h3>
            <p>
              We use cookies to enhance your browsing experience and analyze website traffic. 
              Your privacy is important to us. By accepting, you consent to the use of cookies 
              for analytics and functionality.
            </p>
          </div>
          <div class="cookie-consent-buttons">
            <button id="cookie-accept-all" class="cookie-btn cookie-btn-accept">Accept All</button>
            <button id="cookie-deny" class="cookie-btn cookie-btn-deny">Deny</button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ffffff;
        color: #1a1a1a;
        z-index: 9998;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Poppins', sans-serif;
        animation: slideUp 0.5s cubic-bezier(.4,1.4,.6,1) both;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .cookie-consent-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0;
      }

      .cookie-consent-content {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2rem;
        align-items: center;
        padding: 2rem 2.5rem;
        border-top: 1px solid #e5e5e5;
      }

      .cookie-consent-text h3 {
        font-size: 1.1rem;
        margin: 0 0 0.75rem 0;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: 0.3px;
      }

      .cookie-consent-text p {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #555;
      }

      .cookie-consent-buttons {
        display: flex;
        gap: 1rem;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .cookie-btn {
        padding: 0.85rem 1.8rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(.4,1.4,.6,1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Poppins', sans-serif;
        letter-spacing: 0.3px;
      }

      .cookie-btn-accept {
        background: #2b9589;
        color: white;
      }

      .cookie-btn-accept:hover {
        background: #207e74;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(43, 149, 137, 0.25);
      }

      .cookie-btn-accept:active {
        transform: translateY(0);
      }

      .cookie-btn-deny {
        background: transparent;
        color: #2b9589;
        border: 1.5px solid #2b9589;
      }

      .cookie-btn-deny:hover {
        background: #f0f9f8;
        border-color: #207e74;
        color: #207e74;
        transform: translateY(-2px);
      }

      .cookie-btn-deny:active {
        transform: translateY(0);
      }

      @media (max-width: 1024px) {
        .cookie-consent-content {
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
        }

        .cookie-consent-buttons {
          width: 100%;
          justify-content: stretch;
        }

        .cookie-btn {
          flex: 1;
        }
      }

      @media (max-width: 640px) {
        #cookie-consent-banner {
          padding: 0;
        }

        .cookie-consent-content {
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
        }

        .cookie-consent-text h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .cookie-consent-text p {
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .cookie-consent-buttons {
          width: 100%;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cookie-btn {
          width: 100%;
          padding: 0.8rem 1.5rem;
        }
      }

      @media (max-width: 480px) {
        .cookie-consent-content {
          padding: 1rem 1.2rem;
        }

        .cookie-consent-text h3 {
          font-size: 0.95rem;
        }

        .cookie-consent-text p {
          font-size: 0.85rem;
        }

        .cookie-btn {
          padding: 0.7rem 1.2rem;
          font-size: 0.9rem;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Attach event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    const acceptBtn = document.getElementById('cookie-accept-all');
    const denyBtn = document.getElementById('cookie-deny');

    acceptBtn?.addEventListener('click', () => this.acceptCookies());
    denyBtn?.addEventListener('click', () => this.denyCookies());
  }

  acceptCookies() {
    localStorage.setItem(this.cookieName, 'accepted');
    this.consentGiven = true;
    this.hideBanner();
    console.log('✅ User accepted cookies');
    
    // Initialize analytics or other cookie-dependent features
    this.initializeAnalytics();
  }

  denyCookies() {
    localStorage.setItem(this.cookieName, 'denied');
    this.consentGiven = false;
    this.hideBanner();
    console.log('❌ User denied cookies');
  }

  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease forwards';
      setTimeout(() => banner.remove(), 300);
    }
  }

  initializeAnalytics() {
    // Initialize Clarity analytics
    if (window.clarity) {
      console.log('📊 Analytics initialized');
    }
  }

  hasCookieConsent() {
    return this.getConsentStatus();
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsentManager = new CookieConsentManager();
  });
} else {
  window.cookieConsentManager = new CookieConsentManager();
}
