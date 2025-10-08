// translation.js
class TranslationService {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translations = {};
  }

  // Load translations from JSON file
  async loadTranslations(lang) {
    try {
      const response = await fetch(`../translations/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      this.translations[lang] = await response.json();
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.applyTranslations();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if translation file fails
      if (lang !== 'en') {
        this.loadTranslations('en');
      }
    }
  }

  // Apply translations to elements with data-i18n attributes
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      if (translation) {
        // Handle special case for copyright with dynamic year
        if (key === 'footer.copyright') {
          element.textContent = translation.replace('{{year}}', new Date().getFullYear());
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update header navigation links
    const navLinks = document.querySelectorAll('.nav a');
    const navTranslations = this.translations[this.currentLanguage]?.header || {};
    navLinks.forEach((link, index) => {
      const keys = ['funding', 'opportunities', 'find_a_job', 'training'];
      if (keys[index] && navTranslations[keys[index]]) {
        link.textContent = navTranslations[keys[index]];
      }
    });
  }

  // Get translation for a given key
  getTranslation(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage] || {};
    for (const k of keys) {
      value = value[k];
      if (!value) return null;
    }
    return value;
  }
}

// Global translation service instance
const translator = new TranslationService();

// Global changeLanguage function
window.changeLanguage = function(lang) {
  translator.loadTranslations(lang);
};

// Initialize translations on page load
document.addEventListener('DOMContentLoaded', () => {
  translator.loadTranslations(translator.currentLanguage);
});