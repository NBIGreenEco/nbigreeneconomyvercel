import { updateContent } from '../Trans.js';
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
  connectedCallback() {
    const currentPath = window.location.pathname;
    const isDashboard = currentPath === '/Dashboard/dashboard.html' || currentPath === '/ADMIN/admin-dashboard.html' || currentPath === '/ADMIN/manageevents.html'
      || currentPath === '/ADMIN/managefunding.html' || currentPath === '/ADMIN/ManageOpprtunities.html' || currentPath === '/ADMIN/managenews.html' 
      || currentPath === '/ADMIN/TranslationManager.html' || currentPath === '/ADMIN/database.html'|| currentPath === '/Fundimg-Hub/Funding-Hub.html' || currentPath === '/questionnaire/questionnaire.html' 
      || currentPath === '/LandingPage/GamifiedLearning/Gamified.html';

    this.innerHTML = `
      <div class="header-outer">
        <header class="header">
          <div class="logo">
            <a href="/index.html" id="logo-link">
              <img src="/Images/GET.png" data-i18n="[alt]header.logo_alt" alt="Green Economy Toolkit Logo" />
            </a>
          </div>
          
          <!-- Mobile menu button -->
          <button class="mobile-menu-button" id="mobile-menu-toggle" aria-label="Toggle menu">
            <span class="menu-icon"></span>
            <span class="menu-icon"></span>
            <span class="menu-icon"></span>
          </button>
          
          <nav class="nav" id="main-nav">
            <div class="nav-links">
              ${isDashboard ? '<a href="/index.html" data-i18n="header.home">Home</a>' : `
                <a href="/LandingPage/About Page/about.html" data-i18n="header.funding">About the green economy</a>
                <a href="/LandingPage/Opportunities/opportunities.html" data-i18n="header.opportunities">Opportunities</a>
                <a href="/LandingPage/IRM-Sector/IRMSector.html" data-i18n="header.find_a_job">IRM sector</a>
                <a href="/LandingPage/Knowledge-Hub/knowledge-hub.html" data-i18n="header.training">Knowledge hub</a>
              `}
            </div>
            <div class="nav-utils">
              <select class="language-selector" onchange="i18next.changeLanguage(this.value)">
                <option value="" disabled selected data-i18n="header.select">Select</option>
                <option value="en">English</option>
                <option value="zu">Isizulu</option>
                <option value="tn">Setswana</option>
              </select>
              <i class="fas fa-search search-icon" id="search-toggle"></i>
            </div>
            <div class="blue-section"></div>
          </nav>
        </header>
        <section class="search-section" id="search-popup" style="display: none;">
          <div class="search-container">
            <div class="search-header">
              <h3 data-i18n="header.ai-search-title">AI Enhanced Search</h3>
              <span class="search-close" id="search-close">×</span>
            </div>
            <div class="search-input-wrapper">
              <svg class="search-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input type="text" class="search-input" id="smartSearch" data-i18n="[placeholder]header.search-placeholder" placeholder="Search green funding, businesses, tools...">
            </div>
            <div id="search-results" class="search-results max-h-96 overflow-y-auto"></div>
          </div>
        </section>
      </div>
    `;

    // Apply translations after rendering
    setTimeout(updateContent, 0);

    // Setup search functionality - use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.setupSearchFunctionality();
      this.setupMobileMenu();
    }, 100);

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

  setupSearchFunctionality() {
    console.log('Setting up search functionality...');
    
    const searchToggle = this.querySelector('#search-toggle');
    const searchPopup = this.querySelector('#search-popup');
    const searchClose = this.querySelector('#search-close');
    const searchInput = this.querySelector('#smartSearch');

    console.log('Search elements found:', {
      searchToggle: !!searchToggle,
      searchPopup: !!searchPopup,
      searchClose: !!searchClose,
      searchInput: !!searchInput
    });

    if (!searchToggle || !searchPopup || !searchClose) {
      console.error('Critical search elements not found');
      return;
    }

    // Remove any existing event listeners
    const newSearchToggle = searchToggle.cloneNode(true);
    searchToggle.parentNode.replaceChild(newSearchToggle, searchToggle);
    
    const newSearchClose = searchClose.cloneNode(true);
    searchClose.parentNode.replaceChild(newSearchClose, searchClose);

    // Add click event listener to search toggle
    newSearchToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Search toggle clicked!');
      
      const isHidden = searchPopup.style.display === 'none' || !searchPopup.style.display;
      console.log('Search popup is hidden:', isHidden);
      
      if (isHidden) {
        searchPopup.style.display = 'block';
        searchPopup.classList.add('animate-in');
        searchPopup.classList.remove('animate-out');
        console.log('Search popup opened');
        
        // Focus on search input
        setTimeout(() => {
          const input = document.getElementById('smartSearch');
          if (input) {
            input.focus();
          }
        }, 100);
        
        // Initialize EnhancedSearch when popup is opened
        if (window.greenEconomySearch && !window.greenEconomySearch.initialized) {
          console.log('Initializing enhanced search...');
          window.greenEconomySearch.init();
        }
      } else {
        searchPopup.classList.add('animate-out');
        searchPopup.classList.remove('animate-in');
        setTimeout(() => {
          searchPopup.style.display = 'none';
          console.log('Search popup closed');
        }, 300);
      }
    });

    // Add click event listener to search close
    newSearchClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Search close clicked!');
      
      searchPopup.classList.add('animate-out');
      searchPopup.classList.remove('animate-in');
      setTimeout(() => {
        searchPopup.style.display = 'none';
        console.log('Search popup closed via close button');
      }, 300);
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
      if (searchPopup.style.display === 'block' && 
          !searchPopup.contains(e.target) && 
          !newSearchToggle.contains(e.target)) {
        searchPopup.classList.add('animate-out');
        searchPopup.classList.remove('animate-in');
        setTimeout(() => {
          searchPopup.style.display = 'none';
          console.log('Search popup closed via outside click');
        }, 300);
      }
    });

    console.log('Search functionality setup complete');
  }

  setupMobileMenu() {
    const menuToggle = this.querySelector('#mobile-menu-toggle');
    const nav = this.querySelector('#main-nav');
    const navLinks = this.querySelectorAll('.nav-links a, .nav-utils .search-icon, .language-selector');
    const header = this.querySelector('.header');

    if (menuToggle && nav) {
      // Toggle mobile menu
      const toggleMenu = () => {
        const isExpanding = !nav.classList.contains('active');
        
        if (isExpanding) {
          // Calculate height before expanding
          nav.style.display = 'flex';
          const height = nav.scrollHeight + 'px';
          nav.style.maxHeight = '0';
          
          // Trigger reflow
          nav.offsetHeight;
          
          // Expand
          nav.classList.add('active');
          menuToggle.classList.add('active');
          nav.style.maxHeight = height;
          
          // Add click outside handler
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
        nav.offsetHeight; // Trigger reflow
        nav.style.maxHeight = '0';
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      };
      
      // Handle menu toggle click
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      // Close menu when clicking on a nav link
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });
      
      // Handle window resize
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth > 1024) {
            nav.style.display = '';
            nav.style.maxHeight = '';
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
          }
        }, 250);
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
    // Check if CSS is already loaded
    if (!document.querySelector('link[href*="footer.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      
      // Calculate correct path based on current page location
      const currentPath = window.location.pathname;
      let cssPath = this.getFooterCSSPath();
      
      link.href = cssPath;
      link.onerror = () => {
        console.error('Failed to load footer.css from:', cssPath);
        // Try alternative paths
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
    
    // ADMIN pages
    if (currentPath.includes('/ADMIN/')) {
      return '../Master Page(Header and Footer)/footer.css';
    }
    // Dashboard pages
    else if (currentPath.includes('/Dashboard/')) {
      return '../Master Page(Header and Footer)/footer.css';
    }
    // LandingPage subpages (multiple levels)
    else if (currentPath.includes('/LandingPage/')) {
      // Check how deep we are in LandingPage
      const pathSegments = currentPath.split('/').filter(segment => segment);
      const landingPageIndex = pathSegments.indexOf('LandingPage');
      const depth = pathSegments.length - landingPageIndex - 1;
      
      if (depth >= 2) {
        return '../../../Master Page(Header and Footer)/footer.css';
      } else {
        return '../../Master Page(Header and Footer)/footer.css';
      }
    }
    // Funding Hub pages
    else if (currentPath.includes('/Funding Hub/')) {
      return '../Master Page(Header and Footer)/footer.css';
    }
    // API Management pages
    else if (currentPath.includes('/api-management/')) {
      return '../Master Page(Header and Footer)/footer.css';
    }
    // Questionnaire pages
    else if (currentPath.includes('/questionnaire/')) {
      return '../Master Page(Header and Footer)/footer.css';
    }
    // Root level pages
    else {
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
      
      link.onerror = () => {
        attempts++;
        tryNextPath();
      };
      
      link.onload = () => {
        console.log('Footer CSS loaded from alternative path:', path);
      };
      
      document.head.appendChild(link);
    };

    tryNextPath();
  }

  applyInlineFallbackStyles() {
    // Basic fallback styles if CSS fails to load
    const fallbackStyles = `
      .footer {
        background: #21b457;
        color: white;
        padding: 80px 0 40px;
        font-family: 'Arial', sans-serif;
        font-size: 14px;
        line-height: 1.8;
      }
      .footer .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 30px;
      }
      .footer-content {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 40px;
        margin-bottom: 60px;
      }
      .footer-logo-img {
        height: 50px;
        margin-bottom: 20px;
        max-width: 100%;
      }
      .footer-tagline {
        font-size: 14px;
        line-height: 1.6;
        margin-top: 15px;
        opacity: 0.9;
      }
      .footer-column {
        padding: 0 15px;
      }
      .footer-column h4 {
        margin-bottom: 25px;
        font-size: 16px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        padding-bottom: 12px;
      }
      .footer-column h4::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 50px;
        height: 2px;
        background: rgba(255, 255, 255, 0.3);
      }
      .footer-column ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .footer-column li {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
      }
      .footer-column a {
        color: white;
        text-decoration: none;
        font-size: 14px;
        opacity: 0.9;
        transition: all 0.3s ease;
        display: inline-block;
        line-height: 1.6;
      }
      .footer-column a:hover {
        opacity: 1;
        transform: translateX(3px);
        text-decoration: none;
      }
      .footer-column i {
        margin-right: 10px;
        width: 16px;
        text-align: center;
      }
      .footer-bottom {
        text-align: center;
        padding-top: 30px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 20px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
      @media (max-width: 1200px) {
        .footer-content {
          grid-template-columns: repeat(3, 1fr);
          gap: 50px 30px;
        }
      }
      @media (max-width: 768px) {
        .footer-content {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 576px) {
        .footer-content {
          grid-template-columns: 1fr;
        }
        .footer-column {
          text-align: center;
        }
        .footer-column h4::after {
          left: 50%;
          transform: translateX(-50%);
        }
      }
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
      
      if (depth >= 2) {
        return '../../../';
      } else {
        return '../../';
      }
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
            <!-- Logo Column -->
            <div class="footer-logo">
              <img src="${imagePath}Images/GET.png" alt="Green Economy Toolkit Logo" class="footer-logo-img" data-i18n="[alt]footer.logo_alt">
              <p class="footer-tagline" data-i18n="footer.tagline">Empowering sustainable growth through green economy solutions</p>
            </div>

            <!-- Contact Details Column -->
            <div class="footer-column">
              <h4 data-i18n="footer.contact_title">Contact Details</h4>
              <ul>
                <li><i class="fas fa-phone"></i> <span data-i18n="[html]footer.phone">+27 (0)11 544 6000</span></li>
                <li><i class="fas fa-envelope"></i> <span data-i18n="[html]footer.email">info@nbi.org.za</span></li>
              </ul>
            </div>

            <!-- Address Column -->
            <div class="footer-column">
              <h4 data-i18n="footer.address_title">Address</h4>
              <address>
                <p data-i18n="footer.physical_address">Physical Address:</p>
                <p data-i18n="footer.street">61 Katherine Street, Dennehof</p>
                <p data-i18n="footer.city">Sandton, 2196</p>
                <p data-i18n="footer.postal_address">Postal Address:</p>
                <p data-i18n="footer.postal_street">PO Box 294, Auckland Park</p>
                <p data-i18n="footer.postal_city">Johannesburg, 2006</p>
              </address>
            </div>

            <!-- Quick Links Column -->
            <div class="footer-column">
              <h4 data-i18n="footer.quick_links">Quick Links</h4>
              <ul>
                <li><a href="${basePath}index.html" data-i18n="footer.home">Home</a></li>
                <li><a href="${basePath}LandingPage/About Page/about.html" data-i18n="footer.about">About Us</a></li>
                <li><a href="${basePath}LandingPage/IRM-Sector/IRMSector.html" data-i18n="footer.irm_sector">IRM Sector</a></li>
                <li><a href="${basePath}LandingPage/Knowledge-Hub/knowledge-hub.html" data-i18n="footer.knowledge_hub">Knowledge Hub</a></li>
                <li><a href="${basePath}LandingPage/Opportunities/opportunities.html" data-i18n="footer.opportunities">Opportunities</a></li>
              </ul>
            </div>

            <!-- Information Column -->
            <div class="footer-column">
              <h4 data-i18n="footer.information">Information</h4>
              <ul>
                <li><a href="https://nbi.org.za/" data-i18n="footer.faq">FAQ</a></li>
                <li><a href="https://nbi.org.za/" data-i18n="footer.terms">Terms & Conditions</a></li>
                <li><a href="https://nbi.org.za/" data-i18n="footer.privacy">Privacy Policy</a></li>
                <li><a href="https://nbi.org.za/" data-i18n="footer.help">Help</a></li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p data-i18n="[html]footer.copyright">© ${new Date().getFullYear()} Green Economy Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;

    setTimeout(updateContent, 0);
    
    // Add smooth scrolling for all anchor links
    this.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        // Only handle internal anchor links
        if (targetId === '#' || targetId.startsWith('#!')) return;
        
        // Check if the link is on the same page
        if (window.location.pathname === this.pathname || this.pathname.endsWith('index.html')) {
          e.preventDefault();
          
          // Get the target element
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            // Get header height for offset
            const header = document.querySelector('green-economy-header');
            const headerHeight = header ? header.offsetHeight : 100;
            const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            // Use smooth scrolling with fallback
            try {
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            } catch (e) {
              // Fallback for browsers that don't support smooth scrolling
              window.scrollTo(0, offsetPosition);
            }
            
            // Update URL without page jump
            if (history.pushState) {
              history.pushState(null, null, targetId);
            } else {
              window.location.hash = targetId;
            }
          }
        }
      });
    });
    
    // Handle initial page load with hash
    if (window.location.hash) {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        window.scrollTo(0, 0); // Reset scroll first
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

  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Firebase auth persistence set to LOCAL");
    })
    .catch(error => {
      console.error("Error setting auth persistence:", error);
    });

  // Setup search functionality as a fallback
  setTimeout(() => {
    setupGlobalSearchFunctionality();
  }, 1000);

  document.querySelectorAll('a[href]').forEach((anchor) => {
    anchor.addEventListener('click', async (e) => {
      const href = anchor.getAttribute('href');
      if (!href.startsWith('/Dashboard/') && !href.startsWith('/ADMIN/') && href !== '#' && !href.startsWith('#')) {
        e.preventDefault();
        try {
          const user = auth.currentUser;
          if (user) {
            console.log('Logging out due to navigation to non-protected page:', href);
            await auth.signOut();
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('isVerified');
            console.log('User logged out successfully');
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
  } else {
    console.log('No login button found on this page');
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

  setTimeout(updateContent, 0);
});

// Global search functionality setup
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

  console.log('Global search elements found, setting up event listeners...');

  // Use event delegation to handle clicks
  document.addEventListener('click', (e) => {
    // Handle search toggle click
    if (e.target && (e.target.id === 'search-toggle' || e.target.closest('#search-toggle'))) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Search toggle clicked via delegation!');
      
      const popup = document.querySelector('#search-popup');
      if (!popup) {
        console.error('Search popup not found');
        return;
      }
      
      const isHidden = popup.style.display === 'none' || !popup.style.display;
      console.log('Popup is hidden:', isHidden);
      
      if (isHidden) {
        popup.style.display = 'block';
        popup.classList.add('animate-in');
        popup.classList.remove('animate-out');
        console.log('Search popup opened via delegation');
        
        // Focus on search input
        setTimeout(() => {
          const input = document.getElementById('smartSearch');
          if (input) {
            input.focus();
            console.log('Search input focused');
          }
        }, 100);
        
        // Initialize EnhancedSearch when popup is opened
        if (window.greenEconomySearch && !window.greenEconomySearch.initialized) {
          console.log('Initializing enhanced search via delegation...');
          window.greenEconomySearch.init();
        }
      } else {
        popup.classList.add('animate-out');
        popup.classList.remove('animate-in');
        setTimeout(() => {
          popup.style.display = 'none';
          console.log('Search popup closed via delegation');
        }, 300);
      }
    }
    
    // Handle search close click
    if (e.target && (e.target.id === 'search-close' || e.target.closest('#search-close'))) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Search close clicked via delegation!');
      
      const popup = document.querySelector('#search-popup');
      if (popup) {
        popup.classList.add('animate-out');
        popup.classList.remove('animate-in');
        setTimeout(() => {
          popup.style.display = 'none';
          console.log('Search popup closed via close button delegation');
        }, 300);
      }
    }
    
    // Close search when clicking outside
    const popup = document.querySelector('#search-popup');
    if (popup && popup.style.display === 'block' && 
        !popup.contains(e.target) && 
        !e.target.closest('#search-toggle')) {
      popup.classList.add('animate-out');
      popup.classList.remove('animate-in');
      setTimeout(() => {
        popup.style.display = 'none';
        console.log('Search popup closed via outside click delegation');
      }, 300);
    }
  });

  console.log('Global search functionality setup complete');
}

window.logout = async function() {
  console.log('Logging out...');
  try {
    await auth.signOut();
    window.localStorage.removeItem('emailForSignIn');
    window.localStorage.removeItem('isVerified');
    console.log('User logged out successfully');
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/index.html';
  }
};

window.home = async function() {
  console.log('Logging out via Home...');
  try {
    const user = auth.currentUser;
    if (user) {
      await auth.signOut();
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('isVerified');
      window.history.pushState(null, document.title, window.location.href);
      window.onpopstate = async function() {
        await auth.signOut();
        window.localStorage.removeItem('emailForSignIn');
        window.localStorage.removeItem('isVerified');
        window.location.href = '/index.html';
      };
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

// Debug function to test search manually
window.testSearch = function() {
  console.log('Testing search functionality...');
  const searchToggle = document.querySelector('#search-toggle');
  if (searchToggle) {
    searchToggle.click();
  } else {
    console.error('Search toggle not found for manual test');
  }
};