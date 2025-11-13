/**
 * COMPLETE Google Translate Banner Removal
 * This script removes the Google Translate notification bar completely
 * while keeping translation functionality intact
 * 
 * The notification bar that says:
 * "Google Translate | The content of this secure page will be sent to Google..."
 * is completely hidden using CSS injection and DOM manipulation
 */

(function() {
  'use strict';

  // Aggressive CSS to hide ALL Google Translate UI elements except the dropdown
  const hideGoogleTranslateBannerCSS = `
    /* Hide ONLY Google Translate banner/notification elements - NOT the combo dropdown */
    .goog-te-banner-frame,
    .goog-te-notifbar,
    .goog-te-banner,
    .goog-te-floating-button,
    .goog-te-popup,
    .goog-te-notif-button,
    [class*="goog-te-banner"],
    [class*="goog-te-notification"],
    [id*="goog-te-banner"],
    [id*="goog-te-notification"],
    iframe[id^="goog-te-banner"],
    iframe[id*="goog-te-banner"],
    iframe[src*="translate.google"],
    iframe.goog-te-banner-frame,
    iframe.skiptranslate {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      min-height: 0 !important;
      min-width: 0 !important;
      max-height: 0 !important;
      max-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      box-shadow: none !important;
      position: fixed !important;
      left: -99999px !important;
      top: -99999px !important;
      z-index: -99999 !important;
      overflow: hidden !important;
      clip-path: inset(0) !important;
    }

    /* Ensure the combo dropdown (language selector) stays visible */
    .goog-te-combo,
    .goog-te-gadget,
    .goog-te-gadget-simple,
    .goog-te-menu,
    .goog-te-menu-value {
      display: inline-block !important;
      visibility: visible !important;
      height: auto !important;
      width: auto !important;
      position: relative !important;
      left: auto !important;
      top: auto !important;
      z-index: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      clip-path: none !important;
    }

    /* Hide any remaining iframes that might contain the banner */
    iframe[src*="translate.google"],
    iframe[src*="goog"],
    iframe[title*="translate"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      position: fixed !important;
      left: -99999px !important;
      top: -99999px !important;
      z-index: -99999 !important;
    }
  `;

  // Inject the CSS immediately
  function injectHideCSS() {
    const style = document.createElement('style');
    style.id = 'hide-goog-translate-banner';
    style.type = 'text/css';
    style.textContent = hideGoogleTranslateBannerCSS;
    document.head.appendChild(style);
    console.log('[Google Translate Banner Hide] CSS injected successfully');
  }

  // DOM manipulation to hide elements that CSS can't catch
  function hideGoogleTranslateDOM() {
    // Hide banner frames and iframes
    const bannerElements = document.querySelectorAll(
      '.goog-te-banner-frame, ' +
      '.goog-te-notifbar, ' +
      '.goog-te-banner, ' +
      '[class*="goog-te-banner"]:not(.goog-te-combo):not(.goog-te-gadget), ' +
      '[id*="goog-te-banner"], ' +
      'iframe[id*="goog-te-banner"], ' +
      'iframe[src*="translate.google"]'
    );

    bannerElements.forEach(el => {
      // Safety check: never hide the combo dropdown
      if (el.classList && (el.classList.contains('goog-te-combo') || el.classList.contains('goog-te-gadget'))) {
        return;
      }
      
      // Apply multiple hiding techniques
      el.style.cssText = `
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        position: fixed !important;
        left: -99999px !important;
        top: -99999px !important;
        z-index: -99999 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        clip-path: inset(0) !important;
      `;
      
      // Also remove from visual tree
      if (el.parentNode) {
        el.style.pointerEvents = 'none';
      }
    });
  }

  // Initialize on document ready
  function init() {
    injectHideCSS();
    hideGoogleTranslateDOM();
  }

  // Run immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run at various intervals to catch dynamically loaded content
  setTimeout(hideGoogleTranslateDOM, 100);
  setTimeout(hideGoogleTranslateDOM, 500);
  setTimeout(hideGoogleTranslateDOM, 1000);
  setTimeout(hideGoogleTranslateDOM, 2000);
  setTimeout(hideGoogleTranslateDOM, 3000);
  setTimeout(hideGoogleTranslateDOM, 5000);

  // Watch for new elements being added to the page
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if it's an element and looks like a Google Translate element
          if (node.nodeType === 1) { // Element node
            const classList = node.classList || {};
            const classStr = node.className || '';
            const idStr = node.id || '';

            // Check if it's a banner element
            const isBanner = (
              classStr.includes('goog-te-banner') ||
              classStr.includes('goog-te-notif') ||
              classStr.includes('goog-te-popup') ||
              idStr.includes('goog-te-banner') ||
              idStr.includes('goog-te-notification') ||
              (node.tagName === 'IFRAME' && idStr.includes('goog')) ||
              (node.tagName === 'IFRAME' && node.src && node.src.includes('translate.google'))
            );

            // Check if it's the combo (which we want to keep)
            const isCombo = classStr.includes('goog-te-combo') || classStr.includes('goog-te-gadget');

            // Hide if it's a banner and NOT a combo
            if (isBanner && !isCombo) {
              node.style.cssText = `
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                position: fixed !important;
                left: -99999px !important;
                top: -99999px !important;
                z-index: -99999 !important;
              `;
              console.log('[Google Translate Banner Hide] Hidden element:', node.className || node.id);
            }
          }
        });
      }
    });
  });

  // Observe the entire document for changes
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  console.log('[Google Translate Banner Hide] Script loaded - banner hiding active');
})();
