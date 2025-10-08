from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import subprocess
import json
import os
import logging
from firebase_admin import credentials, firestore, initialize_app
from threading import Thread
import pickle
import time

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": [
        "https://nbi2.netlify.app",
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500"
    ],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

def initialize_firebase():
    cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS_PATH'))
    initialize_app(cred)
    return firestore.client()

def listen_for_changes():
    try:
        db = initialize_firebase()
        
        def on_snapshot(collection_snapshot, changes, read_time):
            for change in changes:
                if change.type.name in ['ADDED', 'MODIFIED', 'REMOVED']:
                    logger.info(f"Detected change in {change.document.reference.path}: {change.type.name}")
                    Thread(target=run_translation_task).start()
        
        db.collection('news').on_snapshot(on_snapshot)
        db.collection('events').on_snapshot(on_snapshot)
        logger.info("Started Firestore listeners for news and events")
    except Exception as e:
        logger.error(f"Error starting Firestore listener: {e}")

def run_translation_task():
    try:
        process = subprocess.Popen(['python', 'Trans.py'], cwd=os.getcwd(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate(timeout=60)
        if process.returncode != 0:
            logger.error(f"Translation process failed: {stderr.decode('utf-8')}")
        else:
            logger.info("Translation process completed successfully")
    except Exception as e:
        logger.error(f"Error running translation task: {e}")

@app.route('/ping', methods=['GET', 'OPTIONS'])
def ping():
    logger.info("Received %s request to /ping from origin: %s", request.method, request.headers.get('Origin'))
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({'status': 'success', 'message': 'Server is running'})

@app.route('/run-translation', methods=['POST', 'OPTIONS'])
def run_translation():
    logger.info("Received %s request to /run-translation from origin: %s", request.method, request.headers.get('Origin'))
    if request.method == 'OPTIONS':
        return '', 204
    try:
        if not os.path.exists('locales'):
            os.makedirs('locales')
        if not os.path.exists('locales/en.json'):
            raise FileNotFoundError("English translation file (locales/en.json) not found")
        with open('translation_progress.json', 'w', encoding='utf-8') as f:
            json.dump({'progress': 0, 'logs': [], 'status': 'idle', 'message': ''}, f)
        process = subprocess.Popen(['python', 'Trans.py'], cwd=os.getcwd(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate(timeout=60)
        if process.returncode != 0:
            error_message = stderr.decode('utf-8') if stderr else "Unknown error in Trans.py"
            logger.error("Translation process failed: %s", error_message)
            return jsonify({'status': 'error', 'message': f"Translation process failed: {error_message}"}), 500
        logger.info("Translation process started")
        return jsonify({'status': 'success', 'message': 'Translation started'})
    except Exception as e:
        logger.error("Error running translation: %s", str(e))
        return jsonify({'status': 'error', 'message': f"Error running translation: {str(e)}"}), 500

@app.route('/translation-progress', methods=['GET', 'OPTIONS'])
def get_progress():
    logger.info("Received %s request to /translation-progress from origin: %s", request.method, request.headers.get('Origin'))
    if request.method == 'OPTIONS':
        return '', 204
    try:
        if not os.path.exists('translation_progress.json'):
            raise FileNotFoundError("Progress file (translation_progress.json) not found")
        with open('translation_progress.json', 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    except Exception as e:
        logger.error("Error fetching progress: %s", str(e))
        return jsonify({'status': 'error', 'message': f"Error fetching progress: {str(e)}"}), 500

@app.route('/locales/<filename>', methods=['GET', 'OPTIONS'])
def serve_locales(filename):
    logger.info("Received %s request to /locales/%s from origin: %s", request.method, filename, request.headers.get('Origin'))
    if request.method == 'OPTIONS':
        return '', 204
    try:
        return send_from_directory('locales', filename)
    except Exception as e:
        logger.error("Error serving locale file %s: %s", filename, str(e))
        return jsonify({'status': 'error', 'message': f"Error serving locale file: {str(e)}"}), 404

@app.route('/update-cms', methods=['POST', 'OPTIONS'])
def update_cms():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        key = data.get('key')
        value = data.get('value')
        if not key or not value:
            return jsonify({'status': 'error', 'message': 'Key and value are required'}), 400
        
        en_file = 'locales/en.json'
        if os.path.exists(en_file):
            with open(en_file, 'r', encoding='utf-8') as f:
                en_data = json.load(f)
        else:
            en_data = {}
        
        def set_nested(data, keys, value):
            for key in keys[:-1]:
                data = data.setdefault(key, {})
            data[keys[-1]] = value
        
        set_nested(en_data, key.split('.'), value)
        with open(en_file, 'w', encoding='utf-8') as f:
            json.dump(en_data, f, ensure_ascii=False, indent=4)
        
        cache_file = 'translation_cache.pkl'
        if os.path.exists(cache_file):
            with open(cache_file, 'rb') as f:
                cache = pickle.load(f)
            for lang in ['zu', 'tn']:
                cache_key = f"{lang}:{value}"
                if cache_key in cache[lang]:
                    del cache[lang][cache_key]
            with open(cache_file, 'wb') as f:
                pickle.dump(cache, f)
        
        logger.info(f"Updated CMS key {key} with value {value}")
        Thread(target=run_translation_task).start()
        return jsonify({'status': 'success', 'message': 'CMS content updated and translation started'})
    except Exception as e:
        logger.error(f"Error updating CMS: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/log-missing-keys', methods=['POST', 'OPTIONS'])
def log_missing_keys():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        keys = data.get('keys', [])
        with open('missing_translations.log', 'a', encoding='utf-8') as f:
            for key in keys:
                f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S %Z')}: Missing translation key: {key}\n")
        logger.info(f"Logged {len(keys)} missing translation keys")
        return jsonify({'status': 'success', 'message': 'Missing keys logged'})
    except Exception as e:
        logger.error(f"Error logging missing keys: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/start-listener', methods=['POST', 'OPTIONS'])
def start_listener():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        Thread(target=listen_for_changes).start()
        logger.info("Firestore listener started")
        return jsonify({'status': 'success', 'message': 'Firestore listener started'})
    except Exception as e:
        logger.error(f"Error starting Firestore listener: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server on port %s", os.environ.get('PORT', 10000))
    Thread(target=listen_for_changes).start()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))