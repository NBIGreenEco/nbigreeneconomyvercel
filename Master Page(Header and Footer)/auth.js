import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

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
const db = getFirestore(app);

async function hashCode(code) {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded for auth.js at 03:12 AM SAST, Aug 16, 2025');

  // Check auth state
  onAuthStateChanged(auth, (user) => {
    if (!user || user.email !== 'nbigreeneconomy@gmail.com') {
      console.log('Unauthorized access or user not logged in, redirecting to SignIn.html');
      window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
    }
  });

  const verifyBtn = document.getElementById('verify-btn');
  const verificationCodeInput = document.getElementById('verification-code');
  const verificationMessage = document.getElementById('verification-message');
  const errorMessage = document.getElementById('error-message');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loader = document.getElementById('loader');

  if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
      const code = verificationCodeInput.value.trim();
      if (!code) {
        errorMessage.textContent = 'Please enter a verification code.';
        errorMessage.classList.remove('hidden');
        return;
      }

      loaderOverlay.style.display = 'block';
      loader.style.display = 'block';
      errorMessage.classList.add('hidden');
      verificationMessage.classList.add('hidden');

      try {
        const adminRef = doc(db, 'admins', 'nbigreeneconomy@gmail.com');
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists() && adminDoc.data().codeHash === await hashCode(code)) {
          await updateDoc(adminRef, { codeHash: null, expiresAt: null });
          localStorage.setItem('isVerified', 'true');
          verificationMessage.textContent = 'Verification successful! Redirecting to dashboard...';
          verificationMessage.classList.remove('hidden');
          setTimeout(() => {
            window.location.href = '/ADMIN/admin-dashboard.html';
          }, 1500);
        } else {
          errorMessage.textContent = 'Invalid or expired verification code.';
          errorMessage.classList.remove('hidden');
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        errorMessage.textContent = 'Error verifying code. Please try again.';
        errorMessage.classList.remove('hidden');
      } finally {
        loaderOverlay.style.display = 'none';
        loader.style.display = 'none';
      }
    });
  }
});