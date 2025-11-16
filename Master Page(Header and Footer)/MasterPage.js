import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, browserLocalPersistence, setPersistence } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
  authDomain: "nbi-green-economy.firebaseapp.com",
  projectId: "nbi-green-economy",
  storageBucket: "nbi-green-economy.firebasestorage.app",
  messagingSenderId: "53732340059",
  appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
  measurementId: "G-37VRZ5CGE4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class GreenEconomyHeader extends HTMLElement {
  injectCriticalCSS() {
    /**
     * NUCLEAR OPTION: Inject a <style> tag that will override Google Translate CSS
     * This runs BEFORE Google Translate has a chance to inject its styles
     */
    const criticalStyle = document.createElement('style');
    criticalStyle.id = 'critical-google-translate-fix';
    criticalStyle.textContent = `
      /* CRITICAL: Force alignment on ALL Google Translate elements */
      .goog-te-combo {
        height: 70px !important;
        line-height: 70px !important;
        padding: 0 2rem !important;
        background-color: transparent !important;
        color: white !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
        width: 100% !important;
        margin: 0 !important;
        border: none !important;
        font-weight: 700 !important;
        font-size: 0.9rem !important;
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        vertical-align: middle !important;
      }

      .goog-te-combo:hover {
        background-color: #4ec3b0 !important;
      }

      #google_translate_element {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 70px !important;
        width: 150px !important;
        background-color: #207e74 !important;
        flex-shrink: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .goog-te-gadget-simple {
        display: flex !important;
        align-items: center !important;
        height: 70px !important;
        width: 100% !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .goog-te-gadget {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Hide Google banner permanently */
      .goog-te-banner-frame,
      .goog-te-banner,
      .goog-te-notifbar,
      .goog-te-floating-button,
      iframe.goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
      }
    `;
    
    // Inject at the HEAD level, before any other styles
    if (document.head) {
      document.head.insertBefore(criticalStyle, document.head.firstChild);
    } else {
      // Fallback: inject as soon as head exists
      const checkHead = setInterval(() => {
        if (document.head) {
          document.head.insertBefore(criticalStyle, document.head.firstChild);
          clearInterval(checkHead);
        }
      }, 10);
    }

    console.log('✅ CRITICAL CSS injected - Google Translate alignment locked');
  }

  connectedCallback() {
    // CRITICAL: Inject override stylesheet FIRST before any HTML renders
    this.injectCriticalCSS();
    
    const currentPath = window.location.pathname;
    const isDashboard = currentPath === '/Dashboard/dashboard.html' || currentPath === '/ADMIN/admin-dashboard.html' || currentPath === '/ADMIN/manageevents.html'
      || currentPath === '/ADMIN/managefunding.html' || currentPath === '/ADMIN/ManageOpprtunities.html' || currentPath === '/ADMIN/managenews.html' 
      || currentPath === '/ADMIN/TranslationManager.html' || currentPath === '/ADMIN/database.html' || currentPath === '/Fundimg-Hub/Funding-Hub.html' || currentPath === '/questionnaire/questionnaire.html' 
      || currentPath === '/LandingPage/GamifiedLearning/Gamified.html';

    this.innerHTML = `
      <div class="header-outer">
        <header class="header">
          <div class="logo">
            <a href="/index.html" id="logo-link">
              <img src="/Images/GET.png" alt="Green Economy Toolkit Logo" />
            </a>
          </div>
          
          <button class="mobile-menu-button" id="mobile-menu-toggle" aria-label="Toggle menu">
            <span class="menu-icon"></span>
            <span class="menu-icon"></span>
            <span class="menu-icon"></span>
          </button>
          
          <nav class="nav" id="main-nav">
            <div class="nav-links">
              ${isDashboard ? '<a href="/index.html">Home</a>' : `
                <a href="/LandingPage/About Page/about.html">About the green economy</a>
                <a href="/LandingPage/Opportunities/opportunities.html">Opportunities</a>
                <a href="/LandingPage/IRM-Sector/IRMSector.html">IRM sector</a>
                <a href="/LandingPage/Knowledge-Hub/knowledge-hub.html">Knowledge hub</a>
              `}
            </div>
            <div class="nav-utils">
              <select class="language-selector" id="langSelect" style="background-color: #207e74; color: white; border: none; padding: 0 15px; height: 70px; font-size: 0.9rem; font-weight: 700; cursor: pointer; border-radius: 0; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex-shrink: 0;" onchange="onLangChange.call(this)">
                <option value="en">English</option>
                <option value="zu">isiZulu</option>
                <option value="tn">Setswana</option>
              </select>
              <div id="error-message" class="translation-error"></div>
              <i class="fas fa-search search-icon" id="search-toggle"></i>
            </div>
          </nav>
        </header>
        <section class="search-section" id="search-popup" style="display: none;">
          <div class="search-container">
            <div class="search-header">
              <h3>AI Enhanced Search</h3>
              <span class="search-close" id="search-close">×</span>
            </div>
            <div class="search-input-wrapper">
              <svg class="search-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input type="text" class="search-input" id="smartSearch" placeholder="Search green funding, businesses, tools...">
            </div>
            <div id="search-results" class="search-results max-h-96 overflow-y-auto"></div>
          </div>
        </section>
      </div>
    `;

    this.setupSearchFunctionality();
    this.setupMobileMenu();

    // Add event listener for logo click to handle logout
    const logoLink = this.querySelector('#logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const user = auth.currentUser;
          if (user) {
            console.log('User is logged in, initiating logout...');
            await auth.signOut();
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('isVerified');
            console.log('User logged out successfully');
          } else {
            console.log('No user is logged in, redirecting to index...');
          }
          window.location.href = '/index.html';
        } catch (error) {
          console.error('Error during logo click logout:', error);
          window.location.href = '/index.html';
        }
      });
    }
  }

  preventLayoutShift() {
    const header = this.querySelector('.header');
    const headerOuter = this.querySelector('.header-outer');
    if (header && headerOuter) {
      header.style.minHeight = '70px';
      header.style.height = '70px';
      headerOuter.style.height = '70px';
      header.style.transition = 'none';
      headerOuter.style.transition = 'none';
      headerOuter.style.zIndex = '1000';
      headerOuter.style.position = 'relative';
      console.log('Header layout shift prevention applied');
    }
  }

  setupSearchFunctionality() {
    console.log('Setting up search functionality...');
    const searchToggle = this.querySelector('#search-toggle');
    const searchPopup = this.querySelector('#search-popup');
    const searchClose = this.querySelector('#search-close');
    const searchInput = this.querySelector('#smartSearch');

    if (!searchToggle || !searchPopup || !searchClose) {
      console.error('Critical search elements not found');
      return;
    }

    const newSearchToggle = searchToggle.cloneNode(true);
    searchToggle.parentNode.replaceChild(newSearchToggle, searchToggle);
    const newSearchClose = searchClose.cloneNode(true);
    searchClose.parentNode.replaceChild(newSearchClose, searchClose);

    newSearchToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = searchPopup.style.display === 'none' || !searchPopup.style.display;
      if (isHidden) {
        searchPopup.style.display = 'block';
        searchPopup.classList.add('animate-in');
        searchPopup.classList.remove('animate-out');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          const input = document.getElementById('smartSearch');
          if (input) input.focus();
        }, 100);
        if (window.greenEconomySearch && !window.greenEconomySearch.initialized) {
          window.greenEconomySearch.init();
        }
      } else {
        searchPopup.classList.add('animate-out');
        searchPopup.classList.remove('animate-in');
        setTimeout(() => {
          searchPopup.style.display = 'none';
          document.body.style.overflow = '';
        }, 300);
      }
    });

    newSearchClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      searchPopup.classList.add('animate-out');
      searchPopup.classList.remove('animate-in');
      setTimeout(() => {
        searchPopup.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (searchPopup.style.display === 'block' && 
          !searchPopup.contains(e.target) && 
          !newSearchToggle.contains(e.target)) {
        searchPopup.classList.add('animate-out');
        searchPopup.classList.remove('animate-in');
        setTimeout(() => {
          searchPopup.style.display = 'none';
          document.body.style.overflow = '';
        }, 300);
      }
    });

    if (searchInput) {
      searchInput.style.willChange = 'transform';
    }

    console.log('Search functionality setup complete');
  }

  setupMobileMenu() {
    const menuToggle = this.querySelector('#mobile-menu-toggle');
    const nav = this.querySelector('#main-nav');
    const navLinks = this.querySelectorAll('.nav-links a, .nav-utils .search-icon, #google_translate_element');
    const header = this.querySelector('.header');
    const headerOuter = this.querySelector('.header-outer');

    if (menuToggle && nav) {
      if (headerOuter) {
        headerOuter.style.minHeight = '70px';
        headerOuter.style.height = 'auto';
      }

      const toggleMenu = () => {
        const isExpanding = !nav.classList.contains('active');
        if (isExpanding) {
          nav.style.display = 'flex';
          const height = nav.scrollHeight + 'px';
          nav.style.maxHeight = '0';
          nav.style.opacity = '0';
          nav.offsetHeight;
          nav.classList.add('active');
          menuToggle.classList.add('active');
          nav.style.maxHeight = height;
          nav.style.opacity = '1';
          document.body.style.overflow = 'hidden';

          const handleClickOutside = (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
              closeMenu();
              document.removeEventListener('click', handleClickOutside);
            }
          };
          setTimeout(() => document.addEventListener('click', handleClickOutside), 10);
        } else {
          closeMenu();
        }
      };

      const closeMenu = () => {
        nav.style.maxHeight = nav.scrollHeight + 'px';
        nav.style.opacity = '1';
        nav.offsetHeight;
        nav.style.maxHeight = '0';
        nav.style.opacity = '0';
        setTimeout(() => {
          nav.classList.remove('active');
          menuToggle.classList.remove('active');
          document.body.style.overflow = '';
          setTimeout(() => {
            if (!nav.classList.contains('active')) {
              nav.style.display = '';
            }
          }, 300);
        }, 300);
      };

      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleMenu();
      });

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.stopPropagation();
          closeMenu();
        });
      });

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth > 1024) {
            nav.style.display = '';
            nav.style.maxHeight = '';
            nav.style.opacity = '';
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
          }
        }, 250);
      });

      navLinks.forEach(link => {
        link.style.outlineOffset = '2px';
        link.style.border = '1px solid transparent';
      });
    }
  }
}

class GreenEconomyFooter extends HTMLElement {
  constructor() {
    super();
    this.ensureFooterCSS();
  }

  ensureFooterCSS() {
    if (!document.querySelector('link[href*="footer.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      const currentPath = window.location.pathname;
      let cssPath = this.getFooterCSSPath();
      link.href = cssPath;
      link.onerror = () => {
        console.error('Failed to load footer.css from:', cssPath);
        this.tryAlternativeCSSPaths();
      };
      link.onload = () => {
        console.log('Footer CSS loaded successfully from:', cssPath);
      };
      document.head.appendChild(link);
    }
  }

  getFooterCSSPath() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/ADMIN/')) {
      return '../Master Page(Header and Footer)/footer.css';
    } else if (currentPath.includes('/Dashboard/')) {
      return '../Master Page(Header and Footer)/footer.css';
    } else if (currentPath.includes('/LandingPage/')) {
      const pathSegments = currentPath.split('/').filter(segment => segment);
      const landingPageIndex = pathSegments.indexOf('LandingPage');
      const depth = pathSegments.length - landingPageIndex - 1;
      return depth >= 2 ? '../../../Master Page(Header and Footer)/footer.css' : '../../Master Page(Header and Footer)/footer.css';
    } else if (currentPath.includes('/Funding Hub/')) {
      return '../Master Page(Header and Footer)/footer.css';
    } else if (currentPath.includes('/api-management/')) {
      return '../Master Page(Header and Footer)/footer.css';
    } else if (currentPath.includes('/questionnaire/')) {
      return '../Master Page(Header and Footer)/footer.css';
    } else {
      return '/Master Page(Header and Footer)/footer.css';
    }
  }

  tryAlternativeCSSPaths() {
    const alternativePaths = [
      '/Master Page(Header and Footer)/footer.css',
      '../Master Page(Header and Footer)/footer.css',
      '../../Master Page(Header and Footer)/footer.css',
      '../../../Master Page(Header and Footer)/footer.css',
      './Master Page(Header and Footer)/footer.css'
    ];
    let attempts = 0;
    const tryNextPath = () => {
      if (attempts >= alternativePaths.length) {
        console.error('All footer.css paths failed, applying fallback styles');
        this.applyInlineFallbackStyles();
        return;
      }
      const path = alternativePaths[attempts];
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      link.onerror = () => { attempts++; tryNextPath(); };
      link.onload = () => { console.log('Footer CSS loaded from alternative path:', path); };
      document.head.appendChild(link);
    };
    tryNextPath();
  }

  applyInlineFallbackStyles() {
    const fallbackStyles = `
      .footer { background: #21b457; color: white; padding: 80px 0 40px; font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.8; position: relative; z-index: 1; }
      .footer .container { max-width: 1200px; margin: 0 auto; padding: 0 30px; }
      .footer-content { display: grid; grid-template-columns: repeat(5, 1fr); gap: 40px; margin-bottom: 60px; }
      .footer-logo-img { height: 50px; margin-bottom: 20px; max-width: 100%; }
      .footer-tagline { font-size: 14px; line-height: 1.6; margin-top: 15px; opacity: 0.9; }
      .footer-column { padding: 0 15px; }
      .footer-column h4 { margin-bottom: 25px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 12px; }
      .footer-column h4::after { content: ''; position: absolute; left: 0; bottom: 0; width: 50px; height: 2px; background: rgba(255, 255, 255, 0.3); }
      .footer-column ul { list-style: none; padding: 0; margin: 0; }
      .footer-column li { margin-bottom: 15px; display: flex; align-items: center; }
      .footer-column a { color: white; text-decoration: none; font-size: 14px; opacity: 0.9; transition: all 0.3s ease; display: inline-block; line-height: 1.6; }
      .footer-column a:hover { opacity: 1; transform: translateX(3px); text-decoration: none; }
      .footer-column i { margin-right: 10px; width: 16px; text-align: center; }
      .footer-bottom { text-align: center; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 20px; font-size: 14px; color: rgba(255, 255, 255, 0.8); }
      @media (max-width: 1200px) { .footer-content { grid-template-columns: repeat(3, 1fr); gap: 50px 30px; } }
      @media (max-width: 768px) { .footer-content { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 576px) { .footer-content { grid-template-columns: 1fr; } .footer-column { text-align: center; } .footer-column h4::after { left: 50%; transform: translateX(-50%); } }
    `;
    const style = document.createElement('style');
    style.textContent = fallbackStyles;
    document.head.appendChild(style);
    console.log('Applied inline fallback footer styles');
  }

  getBasePath() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/ADMIN/') || currentPath.includes('/Dashboard/') || 
        currentPath.includes('/Funding Hub/') || currentPath.includes('/api-management/') ||
        currentPath.includes('/questionnaire/')) {
      return '../';
    } else if (currentPath.includes('/LandingPage/')) {
      const pathSegments = currentPath.split('/').filter(segment => segment);
      const landingPageIndex = pathSegments.indexOf('LandingPage');
      const depth = pathSegments.length - landingPageIndex - 1;
      return depth >= 2 ? '../../../' : '../../';
    }
    return '/';
  }

  getImagePath() {
    return this.getBasePath();
  }

  connectedCallback() {
    const basePath = this.getBasePath();
    const imagePath = this.getImagePath();

    this.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-logo">
              <img src="${imagePath}Images/GET.png" alt="Green Economy Toolkit Logo" class="footer-logo-img">
              <p class="footer-tagline">Empowering sustainable growth through green economy solutions</p>
            </div>
            <div class="footer-column">
              <h4>Contact Details</h4>
              <ul>
                <li><i class="fas fa-phone"></i> <span>+27 (0)11 544 6000</span></li>
                <li><i class="fas fa-envelope"></i> <span>info@nbi.org.za</span></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4>Address</h4>
              <address>
                <p>Physical Address:</p>
                <p>61 Katherine Street, Dennehof</p>
                <p>Sandton, 2196</p>
                <p>Postal Address:</p>
                <p>PO Box 294, Auckland Park</p>
                <p>Johannesburg, 2006</p>
              </address>
            </div>
            <div class="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="${basePath}index.html">Home</a></li>
                <li><a href="${basePath}LandingPage/About Page/about.html">About Us</a></li>
                <li><a href="${basePath}LandingPage/IRM-Sector/IRMSector.html">IRM Sector</a></li>
                <li><a href="${basePath}LandingPage/Knowledge-Hub/knowledge-hub.html">Knowledge Hub</a></li>
                <li><a href="${basePath}LandingPage/Opportunities/opportunities.html">Opportunities</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4>Information</h4>
              <ul>
                <li><a href="https://nbi.org.za/">FAQ</a></li>
                <li><a href="https://nbi.org.za/">Terms & Conditions</a></li>
                <li><a href="https://nbi.org.za/">Privacy Policy</a></li>
                <li><a href="https://nbi.org.za/">Help</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} Green Economy Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;

    this.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId.startsWith('#!')) return;
        if (window.location.pathname === this.pathname || this.pathname.endsWith('index.html')) {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            const header = document.querySelector('green-economy-header');
            const headerHeight = header ? header.offsetHeight : 100;
            const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            try {
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            } catch (e) {
              window.scrollTo(0, offsetPosition);
            }
            if (history.pushState) {
              history.pushState(null, null, targetId);
            } else {
              window.location.hash = targetId;
            }
          }
        }
      });
    });

    if (window.location.hash) {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        window.scrollTo(0, 0);
        setTimeout(() => {
          const header = document.querySelector('green-economy-header');
          const headerHeight = header ? header.offsetHeight : 100;
          const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo(0, offsetPosition);
        }, 100);
      }
    }
  }
}

customElements.define('green-economy-header', GreenEconomyHeader);
customElements.define('green-economy-footer', GreenEconomyFooter);

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded for MasterPage.js at", new Date().toLocaleString('en-ZA'));

  // Hide Google Translate notification bar
  const hideGoogleTranslateBanner = () => {
    // Hide the notification bar element
    const notifbars = document.querySelectorAll('.goog-te-notifbar, [class*="goog-te-banner"], [id*="goog-te-banner"]');
    notifbars.forEach(el => {
      el.style.display = 'none !important';
      el.style.visibility = 'hidden !important';
      el.style.height = '0 !important';
      el.style.overflow = 'hidden !important';
    });

    // Hide any iframes that contain the banner
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe.id && iframe.id.includes('goog')) {
        iframe.style.display = 'none !important';
        iframe.style.visibility = 'hidden !important';
        iframe.style.height = '0 !important';
        iframe.style.width = '0 !important';
      }
    });
  };

  // Hide banner immediately and on intervals to catch it if it loads later
  hideGoogleTranslateBanner();
  setTimeout(hideGoogleTranslateBanner, 500);
  setTimeout(hideGoogleTranslateBanner, 1000);
  setTimeout(hideGoogleTranslateBanner, 2000);

  // Watch for dynamically added banner elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Check if it's an element node
            if (node.classList && (node.classList.contains('goog-te-notifbar') || 
                                   node.classList.contains('goog-te-banner-frame') ||
                                   node.classList.contains('goog-te-banner'))) {
              node.style.display = 'none !important';
              node.style.visibility = 'hidden !important';
            }
            if (node.tagName === 'IFRAME' && node.id && node.id.includes('goog')) {
              node.style.display = 'none !important';
              node.style.visibility = 'hidden !important';
            }
          }
        });
      }
    });
  });

  // Start observing the document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });

  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Firebase auth persistence set to LOCAL"))
    .catch(error => console.error("Error setting auth persistence:", error));

  // DISABLED: setupGlobalSearchFunctionality is handled by custom element setupSearchFunctionality
  // setTimeout(() => setupGlobalSearchFunctionality(), 1000);

  document.querySelectorAll('a[href]').forEach((anchor) => {
    anchor.addEventListener('click', async (e) => {
      const href = anchor.getAttribute('href');
      if (!href.startsWith('/Dashboard/') && !href.startsWith('/ADMIN/') && href !== '#' && !href.startsWith('#')) {
        e.preventDefault();
        try {
          const user = auth.currentUser;
          if (user) {
            await auth.signOut();
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('isVerified');
          }
        } catch (error) {
          console.error('Error during navigation logout:', error);
        }
        window.location.href = href;
      }
    });
  });

  document.querySelectorAll('.hero-button, .business-card-button, .event-button').forEach((button) => {
    button.addEventListener('click', function () {
      console.log(`${this.className} clicked: ${this.textContent}`);
    });
  });

  const loginButton = document.querySelector('.login-button');
  if (loginButton) {
    loginButton.addEventListener('click', function () {
      console.log('Login button clicked');
      window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
    });
  }

  const playBtn = document.querySelector('.play-button');
  const heroVideo = document.querySelector('.hero-video');
  if (playBtn && heroVideo) {
    playBtn.addEventListener('click', function () {
      if (heroVideo.paused) {
        heroVideo.play();
        playBtn.classList.add('hidden');
      }
    });
    heroVideo.addEventListener('pause', function () {
      playBtn.classList.remove('hidden');
    });
  }

});

// DISABLED: This global search functionality conflicts with the custom element's setupSearchFunctionality
// The custom element handles search setup properly, so this is no longer needed
/*
function setupGlobalSearchFunctionality() {
  console.log('Setting up global search functionality...');
  const searchToggle = document.querySelector('#search-toggle');
  const searchPopup = document.querySelector('#search-popup');
  const searchClose = document.querySelector('#search-close');

  if (!searchToggle || !searchPopup || !searchClose) {
    console.log('Search elements not found, retrying in 1 second...');
    setTimeout(setupGlobalSearchFunctionality, 1000);
    return;
  }

  document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'search-toggle' || e.target.closest('#search-toggle'))) {
      e.preventDefault();
      e.stopPropagation();
      const popup = document.querySelector('#search-popup');
      const isHidden = popup.style.display === 'none' || !popup.style.display;
      if (isHidden) {
        popup.style.display = 'block';
        popup.classList.add('animate-in');
        popup.classList.remove('animate-out');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          const input = document.getElementById('smartSearch');
          if (input) input.focus();
        }, 100);
        if (window.greenEconomySearch && !window.greenEconomySearch.initialized) {
          window.greenEconomySearch.init();
        }
      } else {
        popup.classList.add('animate-out');
        popup.classList.remove('animate-in');
        setTimeout(() => {
          popup.style.display = 'none';
          document.body.style.overflow = '';
        }, 300);
      }
    }

    if (e.target && (e.target.id === 'search-close' || e.target.closest('#search-close'))) {
      e.preventDefault();
      e.stopPropagation();
      const popup = document.querySelector('#search-popup');
      if (popup) {
        popup.classList.add('animate-out');
        popup.classList.remove('animate-in');
        setTimeout(() => {
          popup.style.display = 'none';
          document.body.style.overflow = '';
        }, 300);
      }
    }

    const popup = document.querySelector('#search-popup');
    if (popup && popup.style.display === 'block' && 
        !popup.contains(e.target) && 
        !e.target.closest('#search-toggle')) {
      popup.classList.add('animate-out');
      popup.classList.remove('animate-in');
      setTimeout(() => {
        popup.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }
  });

  console.log('Global search functionality setup complete');
}
*/

window.logout = async function() {
  try {
    await auth.signOut();
    window.localStorage.removeItem('emailForSignIn');
    window.localStorage.removeItem('isVerified');
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/index.html';
  }
};

window.home = async function() {
  try {
    const user = auth.currentUser;
    if (user) {
      await auth.signOut();
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('isVerified');
    }
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Error during home logout:', error);
    window.location.href = '/index.html';
  }
};

function navigateToFocusArea(areaId) {
  window.location.href = `/LandingPage/Focus-Area/focus-area.html?area=${areaId}`;
}

window.testSearch = function() {
  const searchToggle = document.querySelector('#search-toggle');
  if (searchToggle) searchToggle.click();
};

// ========== TRANSLATION SYSTEM ==========
let currentLanguage = 'en';

// Translate a single piece of text
async function translateText(text, targetLang) {
  const sourceLang = currentLanguage || 'en';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0].map(seg => seg[0]).join('');
}

// Translate the whole page (all text nodes)
async function translatePage(targetLang) {
  const selector = document.getElementById('langSelect');
  if (!selector) return;
  
  const original = selector.dataset.original || selector.options[selector.selectedIndex].text;
  selector.dataset.original = original;

  const translating = targetLang === 'en' ? 'English' :
                      targetLang === 'zu' ? 'isiZulu' :
                      'Setswana';
  selector.options[selector.selectedIndex].text = `Translating to ${translating}...`;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: node => {
        const p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const nodes = [];
  let n;
  while (n = walker.nextNode()) nodes.push(n);

  const BATCH = 15;
  for (let i = 0; i < nodes.length; i += BATCH) {
    const batch = nodes.slice(i, i + BATCH);
    const promises = batch.map(node => translateText(node.nodeValue, targetLang));
    const results = await Promise.all(promises);
    batch.forEach((node, idx) => node.nodeValue = results[idx]);
  }

  selector.options[selector.selectedIndex].text = original;
  currentLanguage = targetLang;
}

// Dropdown change handler
function onLangChange() {
  const lang = this.value;
  if (lang === 'en') {
    location.reload();
    return;
  }
  translatePage(lang).catch(err => {
    console.error(err);
    alert('Translation failed - check your internet connection.');
  });
}

// Make functions globally accessible
window.onLangChange = onLangChange;
window.translateText = translateText;
window.translatePage = translatePage;