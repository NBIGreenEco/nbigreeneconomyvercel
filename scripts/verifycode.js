import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
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

async function trackInteraction(tempUserId, category, action, label = "") {
  console.log('DEBUG: Tracking interaction:', { tempUserId, category, action, label });
  try {
    await addDoc(collection(db, 'interactions'), {
      tempUserId: tempUserId || `anonymous_${Date.now()}`,
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

  const getCurrentUser = () => new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });

  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.email) {
    errorMessage.textContent = 'Please sign in first.';
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
      window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
    }, 1200);
    return;
  }

  const normalizedEmail = currentUser.email.toLowerCase();
  const pendingAdminEmail = (sessionStorage.getItem('pendingAdminEmail') || '').toLowerCase();
  if (pendingAdminEmail && pendingAdminEmail !== normalizedEmail) {
    errorMessage.textContent = 'Admin verification session mismatch. Please sign in again.';
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
      window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
    }, 1200);
    return;
  }

  const adminDoc = await getDoc(doc(db, 'admins', normalizedEmail));
  const isAdmin = adminDoc.exists() && adminDoc.data()?.isAdmin !== false;
  if (!isAdmin) {
    errorMessage.textContent = 'This account is not authorized for admin access.';
    errorMessage.classList.remove('hidden');
    await trackInteraction(currentUser.uid, 'verify_code', 'not_admin_blocked', normalizedEmail);
    setTimeout(() => {
      window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
    }, 1200);
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
      errorMessage.textContent = 'Please enter the admin code.';
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

      // Support for legacy or plaintext stored hash values (fallbacks)
      // Expected: storedHash is a full SHA-256 hex string (64 chars). If not, try fallbacks
      let verified = false;
      if (passwordHash === storedHash) {
        verified = true;
      } else if (storedHash === password) {
        // Plaintext stored in Firestore (insecure) — accept for backwards compatibility
        console.warn('DEBUG: Stored admin password appears to be plaintext. Consider updating to SHA-256.');
        verified = true;
        await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'fallback_plaintext_used', 'Plaintext stored hash');
      } else if (storedHash && storedHash.length < 64 && passwordHash.slice(0, storedHash.length) === storedHash) {
        // Some older flows may have stored a truncated hash; allow match but encourage an update
        console.warn('DEBUG: Stored admin password appears to be a truncated hash. Update to full SHA-256 for security.');
        verified = true;
        await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'fallback_truncated_hash', 'Truncated stored hash');
      }

      if (verified) {
        console.log('DEBUG: Admin code verification successful');
        sessionStorage.setItem('verified', 'true');
        sessionStorage.setItem('sessionStart', Date.now().toString()); // Set session start time
        sessionStorage.setItem('verifiedAdminEmail', normalizedEmail);
        sessionStorage.removeItem('pendingAdminEmail');
        verificationMessage.textContent = 'Admin code verified successfully! Redirecting to dashboard...';
        verificationMessage.classList.remove('hidden');
        await trackInteraction(currentUser.uid, 'verify_code', 'success', 'Admin code verified');
        setTimeout(() => {
          console.log('DEBUG: Redirecting to /ADMIN/admin-dashboard.html');
          window.location.href = '/ADMIN/admin-dashboard.html';
        }, 1500);
      } else {
        console.log('DEBUG: Invalid admin code');
        errorMessage.textContent = 'Invalid admin code.';
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
      errorMessage.textContent = 'verifycode.error_message';
      errorMessage.classList.remove('hidden');
      await trackInteraction(`anonymous_${Date.now()}`, 'verify_code', 'error', errorText);
    } finally {
      console.log('DEBUG: Hiding loader');
      loaderOverlay.style.display = 'none';
      loader.style.display = 'none';
    }
  });
});
