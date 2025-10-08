const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SERVER_URL = isLocalhost ? 'http://localhost:10000' : 'https://nbi-green-economy-j3c3.onrender.com';

i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'zu', 'tn'],
        backend: {
            loadPath: `${SERVER_URL}/locales/{{lng}}.json?v=${new Date().getTime()}`
        },
        detection: {
            order: ['querystring', 'localStorage', 'cookie', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie']
        },
        debug: true
    }, (err, t) => {
        if (err) {
            console.error('i18next initialization failed:', err);
            setTimeout(() => {
                i18next.loadResources((loadErr) => {
                    if (loadErr) {
                        console.error('Retry failed:', loadErr);
                        applyFallbackTranslations();
                    } else {
                        console.log('i18next retry successful, language:', i18next.language);
                        updateContent();
                    }
                });
            }, 2000);
            return;
        }
        console.log('i18next initialized at', new Date().toLocaleString('en-ZA'), 'language:', i18next.language);
        updateContent();
    });

export function applyFallbackTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        try {
            if (key.startsWith('[')) {
                const match = key.match(/\[(\w+)\](.+)/);
                if (match) {
                    const [, attr, i18nKey] = match;
                    const fallback = elem.getAttribute(attr) || 'Content not available';
                    elem.setAttribute(attr, fallback);
                    console.warn(`Fallback applied for attribute ${attr} with key ${i18nKey}: ${fallback}`);
                } else {
                    console.error(`Invalid data-i18n format for key: ${key}`);
                }
            } else {
                const fallback = elem.innerHTML.trim() || 'Content not available';
                elem.innerHTML = fallback;
                console.warn(`Fallback applied for key ${key}: ${fallback}`);
            }
        } catch (error) {
            console.error(`Error applying fallback for key ${key}:`, error);
        }
    });
    console.warn('Applied fallback translations due to initialization failure');
}

export async function updateContent() {
    const missingKeys = [];
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        try {
            if (key.startsWith('[')) {
                const match = key.match(/\[(\w+)\](.+)/);
                if (match) {
                    const [, attr, i18nKey] = match;
                    const translation = i18next.t(i18nKey, { defaultValue: elem.getAttribute(attr) || 'Content not available' });
                    if (translation === i18nKey) {
                        missingKeys.push(i18nKey);
                        console.warn(`Missing translation for key: ${i18nKey} on element with attribute ${attr}`);
                    }
                    elem.setAttribute(attr, translation);
                } else {
                    console.error(`Invalid data-i18n format for key: ${key}`);
                }
            } else {
                const translation = i18next.t(key, { defaultValue: elem.innerHTML.trim() || 'Content not available' });
                if (translation === key) {
                    missingKeys.push(key);
                    console.warn(`Missing translation for key: ${key} on element with innerHTML`);
                }
                elem.innerHTML = translation;
            }
        } catch (error) {
            console.error(`Error translating key ${key}:`, error);
            missingKeys.push(key);
        }
    });

    if (missingKeys.length > 0) {
        console.warn('Missing translations:', missingKeys);
        try {
            const response = await fetch(`${SERVER_URL}/log-missing-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keys: missingKeys }),
                mode: 'cors'
            });
            if (!response.ok) {
                console.error('Failed to log missing keys:', response.statusText);
            } else {
                console.log('Missing keys logged to server');
            }
        } catch (error) {
            console.error('Error logging missing keys:', error);
        }
    } else {
        console.log('All translations applied successfully');
    }
}

i18next.on('languageChanged', () => {
    console.log('Language changed to:', i18next.language);
    updateContent();
});