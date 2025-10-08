import json
import os
import pickle
import time
import logging
import asyncio
import aiohttp
from deep_translator import GoogleTranslator
from bs4 import BeautifulSoup
import glob
from firebase_admin import credentials, firestore, initialize_app
from playwright.sync_api import sync_playwright
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('translation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

CACHE_FILE = 'translation_cache.pkl'
PROGRESS_FILE = 'translation_progress.json'
EN_FILE = 'locales/en.json'

translation_state = {'progress': 0, 'logs': [], 'status': 'idle', 'message': ''}

def reset_progress_file():
    try:
        progress_state = {
            'progress': 0,
            'logs': [],
            'status': 'idle',
            'message': ''
        }
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(progress_state, f)
        os.chmod(PROGRESS_FILE, 0o666)
        logger.info("Progress file reset successfully")
    except Exception as e:
        logger.error(f"Failed to reset progress file: {e}")
        raise

def update_progress(state, force_write=False):
    try:
        milestones = {25, 50, 75, 100}
        if force_write or state['progress'] in milestones:
            with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
                json.dump(state, f)
            logger.info("Progress updated: %s%%", state['progress'])
    except Exception as e:
        logger.error(f"Failed to update progress file: {e}")
        raise

def load_cache():
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'rb') as f:
                return pickle.load(f)
        return {'zu': {}, 'tn': {}}
    except Exception as e:
        logger.error(f"Failed to load cache: {e}")
        return {'zu': {}, 'tn': {}}

def save_cache(cache):
    try:
        with open(CACHE_FILE, 'wb') as f:
            pickle.dump(cache, f)
        logger.info("Translation cache saved successfully")
    except Exception as e:
        logger.error(f"Failed to save cache: {e}")
        raise

async def translate_batch_async(texts, dest_lang, max_retries=5, batch_size=10):
    translated_texts = []
    async with aiohttp.ClientSession() as session:
        for i in range(0, len(texts), batch_size):
            sub_batch = texts[i:i + batch_size]
            for attempt in range(max_retries):
                try:
                    translator = GoogleTranslator(source='en', target=dest_lang)
                    translated = await asyncio.gather(
                        *[translator.translate_async(text, session=session) for text in sub_batch]
                    )
                    translated = [t if t is not None else sub_batch[j] for j, t in enumerate(translated)]
                    translated_texts.extend(translated)
                    logger.info(f"Successfully translated sub-batch {i//batch_size + 1} to {dest_lang}")
                    await asyncio.sleep(0.5)
                    break
                except Exception as e:
                    logger.warning(f"Attempt {attempt + 1} failed for sub-batch to {dest_lang}: {e}")
                    if attempt == max_retries - 1:
                        logger.error(f"Max retries exceeded for sub-batch to {dest_lang}. Using original texts.")
                        translated_texts.extend(sub_batch)
                    await asyncio.sleep(2 * (attempt + 1))
    return translated_texts

async def translate_all_languages(texts, translation_keys, cache):
    zu_task = translate_batch_async(texts, 'zu', max_retries=5, batch_size=10)
    tn_task = translate_batch_async(texts, 'tn', max_retries=5, batch_size=10)
    zu_translated, tn_translated = await asyncio.gather(zu_task, tn_task)
    
    zu_translations = {}
    tn_translations = {}
    for key, zu_text, tn_text in zip(translation_keys, zu_translated, tn_translated):
        zu_translations[key] = zu_text
        tn_translations[key] = tn_text
        cache['zu'][f"zu:{texts[translation_keys.index(key)]}"] = zu_text
        cache['tn'][f"tn:{texts[translation_keys.index(key)]}"] = tn_text
    
    return zu_translations, tn_translations

def initialize_firebase():
    try:
        cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS_PATH'))
        initialize_app(cred)
        return firestore.client()
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise

def scrape_firestore_translations():
    en_dict = {}
    try:
        db = initialize_firebase()
        
        news_snapshot = db.collection('news').get()
        for index, doc in enumerate(news_snapshot):
            news = doc.to_dict()
            en_dict[f"news.date{index}"] = news.get('date', 'Date not available')
            en_dict[f"news.title{index}"] = news.get('title', 'Untitled News')
            en_dict[f"news.description{index}"] = news.get('description', 'No description available')
        
        events_snapshot = db.collection('events').get()
        for index, doc in enumerate(events_snapshot):
            event = doc.to_dict()
            en_dict[f"events.date{index}"] = event.get('date', 'Date not available')
            en_dict[f"events.title{index}"] = event.get('title', 'Untitled Event')
            en_dict[f"events.details{index}"] = event.get('details', 'No details available')
        
        logger.info(f"Scraped {len(en_dict)} Firestore translations")
        return en_dict
    except Exception as e:
        logger.error(f"Error scraping Firestore: {e}")
        return {}

def scrape_dynamic_content(urls):
    en_dict = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        for url in urls:
            try:
                logger.info(f"Scraping dynamic content from: {url}")
                page.goto(url, wait_until='networkidle')
                content = page.content()
                soup = BeautifulSoup(content, 'html.parser')
                for elem in soup.find_all(attrs={"data-i18n": True}):
                    i18n = elem['data-i18n']
                    value = None
                    if i18n.startswith('['):
                        if i18n.startswith('[alt]'):
                            key = i18n[5:]
                            value = elem.get('alt', '').strip()
                        elif i18n.startswith('[placeholder]'):
                            key = i18n[13:]
                            value = elem.get('placeholder', '').strip()
                        elif i18n.startswith('[title]'):
                            key = i18n[7:]
                            value = elem.get('title', '').strip()
                        elif i18n.startswith('[aria-label]'):
                            key = i18n[11:]
                            value = elem.get('aria-label', '').strip()
                    else:
                        key = i18n
                        value = elem.get_text(strip=True)
                    if key and value:
                        if key in en_dict and en_dict[key] != value:
                            logger.warning(f"Duplicate key {key} with different value in {url}: '{en_dict[key]}' vs '{value}'")
                        en_dict[key] = value
            except Exception as e:
                logger.error(f"Error scraping dynamic content from {url}: {e}")
        browser.close()
    return en_dict

def scrape_en_translations(root_dir):
    en_dict = {}
    admin_path = os.path.join(root_dir, 'ADMIN')
    html_files = [
        os.path.join(root_dir, 'index.html'),
        os.path.join(root_dir, 'api-management', 'api-management.html'),
        os.path.join(root_dir, 'Dashboard', 'dashboard.html'),
        os.path.join(root_dir, 'demo', 'index2.html'),
        os.path.join(root_dir, 'digital_human', 'digital-human.html'),
        os.path.join(root_dir, 'encodingdecoding', 'restored.html'),
        os.path.join(root_dir, 'Funding Hub', 'Funding-Hub.html'),
        os.path.join(root_dir, 'Funding Hub', 'test.html'),
        os.path.join(root_dir, 'LandingPage', 'VerifyEmail.html'),
        os.path.join(root_dir, 'LandingPage', 'About Page', 'about.html'),
        os.path.join(root_dir, 'LandingPage', 'chatbot', 'chatbot.html'),
        os.path.join(root_dir, 'LandingPage', 'Disclaimer', 'disclaimer.html'),
        os.path.join(root_dir, 'LandingPage', 'Focus-Area', 'focus-area.html'),
        os.path.join(root_dir, 'LandingPage', 'GamifiedLearning', 'Gamified.html'),
        os.path.join(root_dir, 'LandingPage', 'IRM-Sector', 'IRMSector.html'),
        os.path.join(root_dir, 'LandingPage', 'Knowledge-Hub', 'knowledge-hub.html'),
        os.path.join(root_dir, 'LandingPage', 'legal', 'Legal.html'),
        os.path.join(root_dir, 'LandingPage', 'Opportunities', 'opportunities.html'),
        os.path.join(root_dir, 'LandingPage', 'SignInAndSignUp', 'SignIn.html'),
        os.path.join(root_dir, 'LandingPage', 'SignInAndSignUp', 'SignUp.html'),
        os.path.join(root_dir, 'LandingPage', 'SignInAndSignUp', 'verifycode.html'),
        os.path.join(root_dir, 'Master Page(Header and Footer)', 'MasterPage.html'),
        os.path.join(root_dir, 'questionnaire', 'questionnaire.html'),
        os.path.join(root_dir, 'Sections', 'SMME', 'smme.html')
    ]
    
    for html_file in html_files:
        if not os.path.exists(html_file):
            logger.warning(f"HTML file not found: {html_file}")
            continue
        if html_file.startswith(admin_path + os.sep):
            continue
        logger.info(f"Processing file: {html_file}")
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            soup = BeautifulSoup(content, 'html.parser')
            for elem in soup.find_all(attrs={"data-i18n": True}):
                i18n = elem['data-i18n']
                value = None
                if i18n.startswith('['):
                    if i18n.startswith('[alt]'):
                        key = i18n[5:]
                        value = elem.get('alt', '').strip()
                    elif i18n.startswith('[placeholder]'):
                        key = i18n[13:]
                        value = elem.get('placeholder', '').strip()
                    elif i18n.startswith('[title]'):
                        key = i18n[7:]
                        value = elem.get('title', '').strip()
                    elif i18n.startswith('[aria-label]'):
                        key = i18n[11:]
                        value = elem.get('aria-label', '').strip()
                else:
                    key = i18n
                    value = elem.get_text(strip=True)
                if key and value:
                    if key in en_dict and en_dict[key] != value:
                        logger.warning(f"Duplicate key {key} with different value in {html_file}: '{en_dict[key]}' vs '{value}'")
                    en_dict[key] = value
        except Exception as e:
            logger.error(f"Error processing {html_file}: {e}")
    return en_dict

def load_en_translations():
    global translation_state
    translation_state['status'] = 'running'
    translation_state['message'] = 'Scraping HTML, Firestore, and dynamic content for English translations'
    update_progress(translation_state, force_write=True)
    try:
        root_dir = os.path.dirname(os.path.abspath(__file__))
        html_translations = scrape_en_translations(root_dir)
        firestore_translations = scrape_firestore_translations()
        urls = [
            'http://localhost:5500/index.html',
            'http://localhost:5500/api-management/api-management.html',
            'http://localhost:5500/Dashboard/dashboard.html',
            'http://localhost:5500/demo/index2.html',
            'http://localhost:5500/digital_human/digital-human.html',
            'http://localhost:5500/encodingdecoding/restored.html',
            'http://localhost:5500/Funding Hub/Funding-Hub.html',
            'http://localhost:5500/Funding Hub/test.html',
            'http://localhost:5500/LandingPage/VerifyEmail.html',
            'http://localhost:5500/LandingPage/About Page/about.html',
            'http://localhost:5500/LandingPage/chatbot/chatbot.html',
            'http://localhost:5500/LandingPage/Disclaimer/disclaimer.html',
            'http://localhost:5500/LandingPage/Focus-Area/focus-area.html',
            'http://localhost:5500/LandingPage/GamifiedLearning/Gamified.html',
            'http://localhost:5500/LandingPage/IRM-Sector/IRMSector.html',
            'http://localhost:5500/LandingPage/Knowledge-Hub/knowledge-hub.html',
            'http://localhost:5500/LandingPage/legal/Legal.html',
            'http://localhost:5500/LandingPage/Opportunities/opportunities.html',
            'http://localhost:5500/LandingPage/SignInAndSignUp/SignIn.html',
            'http://localhost:5500/LandingPage/SignInAndSignUp/SignUp.html',
            'http://localhost:5500/LandingPage/SignInAndSignUp/verifycode.html',
            'http://localhost:5500/Master Page(Header and Footer)/MasterPage.html',
            'http://localhost:5500/questionnaire/questionnaire.html',
            'http://localhost:5500/Sections/SMME/smme.html'
        ]
        dynamic_translations = scrape_dynamic_content(urls)
        flat_en = {**html_translations, **firestore_translations, **dynamic_translations}
        count = len(flat_en)
        logger.info(f"Scraped {count} English translations (HTML + Firestore + Dynamic)")
        translation_state['logs'].append({
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
            'level': 'INFO',
            'message': f"Scraped {count} English translations (HTML + Firestore + Dynamic)"
        })
        update_progress(translation_state, force_write=True)
        return flat_en
    except Exception as e:
        logger.error(f"Error scraping translations: {e}")
        translation_state['logs'].append({
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
            'level': 'ERROR',
            'message': f"Error scraping translations: {e}"
        })
        update_progress(translation_state, force_write=True)
        raise

def unflatten_dict(flat_dict, sep='.'):
    nested = {}
    for key, value in flat_dict.items():
        parts = key.split(sep)
        d = nested
        for part in parts[:-1]:
            if part not in d:
                d[part] = {}
            d = d[part]
        d[parts[-1]] = value
    return nested

def main():
    global translation_state
    reset_progress_file()
    translation_state = {'progress': 0, 'logs': [], 'status': 'running', 'message': 'Starting translation'}
    update_progress(translation_state, force_write=True)

    try:
        if os.path.exists('locales/zu.json') and os.path.exists('locales/tn.json'):
            translation_state['progress'] = 100
            translation_state['status'] = 'success'
            translation_state['message'] = 'Translations already exist'
            update_progress(translation_state, force_write=True)
            logger.info("Using existing translations")
            return

        cache = load_cache()
        flat_en = load_en_translations()
        if not flat_en:
            translation_state['status'] = 'error'
            translation_state['message'] = "Failed to scrape English translations. Translation aborted."
            update_progress(translation_state, force_write=True)
            return

        for key in list(cache['zu'].keys()) + list(cache['tn'].keys()):
            if key.startswith('zu:news.') or key.startswith('zu:events.') or \
               key.startswith('tn:news.') or key.startswith('tn:events.'):
                del cache[key.split(':', 1)[1]]

        texts_to_batch = [v for v in flat_en.values() if v]
        translation_keys = [k for k, v in flat_en.items() if v]

        total_steps = len(texts_to_batch)
        batch_size = 10
        total_batches = (total_steps + batch_size - 1) // batch_size
        progress_per_batch = 90 / total_batches if total_batches > 0 else 90

        zu_translations = {}
        tn_translations = {}

        for i in range(0, len(texts_to_batch), batch_size):
            batch = texts_to_batch[i:i + batch_size]
            keys = translation_keys[i:i + batch_size]
            try:
                zu_batch, tn_batch = asyncio.run(translate_all_languages(batch, keys, cache))
                zu_translations.update(zu_batch)
                tn_translations.update(tn_batch)

                translation_state['progress'] = min(translation_state['progress'] + progress_per_batch, 90)
                translation_state['logs'].append({
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                    'level': 'INFO',
                    'message': f"Processed batch {i//batch_size + 1} successfully"
                })
                update_progress(translation_state)
            except Exception as e:
                logger.error(f"Error processing batch {i//batch_size + 1}: {e}")
                translation_state['logs'].append({
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                    'level': 'ERROR',
                    'message': f"Error processing batch {i//batch_size + 1}: {e}"
                })
                update_progress(translation_state)
                raise

        translation_state['message'] = 'Saving translations'
        update_progress(translation_state, force_write=True)

        os.makedirs('locales', exist_ok=True)

        en_nested = unflatten_dict(flat_en)
        file_path = EN_FILE
        temp_file_path = f'{EN_FILE}.tmp'
        try:
            with open(temp_file_path, 'w', encoding='utf-8') as f:
                json.dump(en_nested, f, ensure_ascii=False, indent=4)
            os.replace(temp_file_path, file_path)
            logger.info(f"English JSON file generated successfully")
            translation_state['logs'].append({
                'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                'level': 'INFO',
                'message': f"English JSON file generated successfully"
            })
        except Exception as e:
            logger.error(f"Failed to save {file_path}: {e}")
            translation_state['logs'].append({
                'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                'level': 'ERROR',
                'message': f"Failed to save {file_path}: {e}"
            })
            raise

        for lang, translations in [('zu', zu_translations), ('tn', tn_translations)]:
            nested_trans = unflatten_dict(translations)
            file_path = f'locales/{lang}.json'
            temp_file_path = f'locales/{lang}.json.tmp'
            try:
                with open(temp_file_path, 'w', encoding='utf-8') as f:
                    json.dump(nested_trans, f, ensure_ascii=False, indent=4)
                os.replace(temp_file_path, file_path)
                logger.info(f"Translation JSON file for {lang} generated successfully")
                translation_state['logs'].append({
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                    'level': 'INFO',
                    'message': f"Translation JSON file for {lang} generated successfully"
                })
            except Exception as e:
                logger.error(f"Failed to save {file_path}: {e}")
                translation_state['logs'].append({
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                    'level': 'ERROR',
                    'message': f"Failed to save {file_path}: {e}"
                })
                raise
            update_progress(translation_state, force_write=True)

        save_cache(cache)

        translation_state['progress'] = 100
        translation_state['status'] = 'success'
        translation_state['message'] = 'Translations generated successfully'
        update_progress(translation_state, force_write=True)
        logger.info("Translations generated successfully at %s", time.strftime("%Y-%m-%d %H:%M:%S %Z"))

    except Exception as e:
        logger.error(f"Translation process failed: {e}")
        translation_state['status'] = 'error'
        translation_state['message'] = f"Translation failed: {str(e)}"
        update_progress(translation_state, force_write=True)
        save_cache(cache)
        raise

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.error(f"Fatal error in main: {e}")
        translation_state['status'] = 'error'
        translation_state['message'] = f"Fatal error: {str(e)}"
        update_progress(translation_state, force_write=True)