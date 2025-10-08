i18next
  .use(i18nextHttpBackend)
  .use(i18nextBrowserLanguageDetector)
  .init({
    debug: true,
    fallbackLng: 'en',
    backend: {
      loadPath: 'lang/{{lng}}.json',
    }
  }, function(err, t) {
    if (err) return console.error(err);
    updateContent();
  });

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    elem.innerText = i18next.t(key);
  });
}

function changeLanguage(lng) {
  i18next.changeLanguage(lng, updateContent);
}
