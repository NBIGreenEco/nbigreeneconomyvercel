import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
  authDomain: "nbi-green-economy.firebaseapp.com",
  projectId: "nbi-green-economy",
  storageBucket: "nbi-green-economy.firebasestorage.app",
  messagingSenderId: "53732340059",
  appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
  measurementId: "G-37VRZ5CGE4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in anonymously to satisfy Firestore rules
signInAnonymously(auth)
  .then(() => console.log('DEBUG: Anonymous authentication successful'))
  .catch(error => {
    console.error('DEBUG: Anonymous authentication error:', error, {
      code: error.code,
      message: error.message
    });
  });

async function hashCode(code) {
  console.log('DEBUG: Hashing input code');
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashString = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('DEBUG: Generated hash:', hashString);
  return hashString;
}

async function getStoredPasswordHash() {
  console.log('DEBUG: Fetching stored password hash from admin_config/password_hash');
  try {
    const configRef = doc(db, 'admin_config', 'password_hash');
    const configDoc = await getDoc(configRef);
    if (configDoc.exists()) {
      const hash = configDoc.data().hash;
      console.log('DEBUG: Retrieved stored hash:', hash);
      return hash;
    } else {
      console.error('DEBUG: No password hash document found');
      throw new Error('Password configuration not found');
    }
  } catch (error) {
    console.error('DEBUG: Error fetching password hash:', error, {
      code: error.code,
      message: error.message
    });
    throw error;
  }
}

async function trackInteraction(userId, category, action, label = "") {
  console.log('DEBUG: Tracking interaction:', { userId, category, action, label });
  try {
    await addDoc(collection(db, 'interactions'), {
      userId: userId || `anonymous_${Date.now()}`,
      category,
      action,
      label,
      timestamp: serverTimestamp(),
      language: document.documentElement.lang || 'en',
      userAgent: navigator.userAgent
    });
    console.log('DEBUG: Interaction logged successfully');
  } catch (error) {
    console.error('DEBUG: Error logging interaction:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DEBUG: DOM fully loaded for verifyCode.js at', new Date().toLocaleString('en-ZA'));
  const verifyForm = document.getElementById('verify-code-form');
  const verifyBtn = document.getElementById('verify-btn');
  const verificationCodeInput = document.getElementById('verification-code');
  const verificationMessage = document.getElementById('verification-message');
  const errorMessage = document.getElementById('error-message');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loader = document.getElementById('loader');

  if (!verifyForm || !verifyBtn || !verificationCodeInput || !verificationMessage || !errorMessage || !loaderOverlay || !loader) {
    console.error('DEBUG: Missing DOM elements:', {
      verifyForm: !!verifyForm,
      verifyBtn: !!verifyBtn,
      verificationCodeInput: !!verificationCodeInput,
      verificationMessage: !!verificationMessage,
      errorMessage: !!errorMessage,
      loaderOverlay: !!loaderOverlay,
      loader: !!loader
    });
    return;
  }

  verifyBtn.style.opacity = '1';
  verifyBtn.style.cursor = 'pointer';
  console.log('DEBUG: Verify button initialized as enabled');

  verifyBtn.addEventListener('click', () => {
    trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'button_click', 'Button state: enabled');
  });

  verifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('DEBUG: Form submitted for password verification');
    const password = verificationCodeInput.value.trim();
    if (!password) {
      console.log('DEBUG: No admin code entered');
      errorMessage.textContent = i18next.t('verifycode.error_message', { defaultValue: 'Please enter the admin code.' });
      errorMessage.classList.remove('hidden');
      await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'no_password_entered', 'Empty admin code');
      return;
    }
    console.log('DEBUG: Processing admin code verification');
    loaderOverlay.style.display = 'block';
    loader.style.display = 'block';
    errorMessage.classList.add('hidden');
    verificationMessage.classList.add('hidden');
    try {
      const passwordHash = await hashCode(password);
      const storedHash = await getStoredPasswordHash();
      console.log('DEBUG: Comparing hashes:', { enteredHash: passwordHash, storedHash });
      if (passwordHash === storedHash) {
        console.log('DEBUG: Admin code verification successful');
        sessionStorage.setItem('verified', 'true');
        sessionStorage.setItem('sessionStart', Date.now().toString()); // Set session start time
        verificationMessage.textContent = i18next.t('verifycode.success_message', { defaultValue: 'Admin code verified successfully! Redirecting to dashboard...' });
        verificationMessage.classList.remove('hidden');
        await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'success', 'Admin code verified');
        setTimeout(() => {
          console.log('DEBUG: Redirecting to /ADMIN/admin-dashboard.html');
          window.location.href = '/ADMIN/admin-dashboard.html';
        }, 1500);
      } else {
        console.log('DEBUG: Invalid admin code');
        errorMessage.textContent = i18next.t('verifycode.error_message', { defaultValue: 'Invalid admin code.' });
        errorMessage.classList.remove('hidden');
        await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'invalid_password', 'Admin code mismatch');
      }
    } catch (error) {
      console.error('DEBUG: Error verifying admin code:', error, {
        code: error.code,
        message: error.message
      });
      let errorText = error.message;
      if (error.code === 'permission-denied') {
        errorText = 'Access denied. Please ensure the backend is configured correctly.';
      } else if (error.message === 'Password configuration not found') {
        errorText = 'Admin code configuration is missing. Contact support.';
      }
      errorMessage.textContent = i18next.t('verifycode.error_message', { defaultValue: `Error verifying admin code: ${errorText}` });
      errorMessage.classList.remove('hidden');
      await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'error', errorText);
    } finally {
      console.log('DEBUG: Hiding loader');
      loaderOverlay.style.display = 'none';
      loader.style.display = 'none';
    }
  });
});