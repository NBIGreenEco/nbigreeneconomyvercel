import { getApp, initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
  authDomain: "nbi-green-economy.firebaseapp.com",
  projectId: "nbi-green-economy",
  storageBucket: "nbi-green-economy.appspot.com",
  messagingSenderId: "53732340059",
  appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
  measurementId: "G-37VRZ5CGE4"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set session persistence to align with dashboard behavior
setPersistence(auth, browserSessionPersistence)
  .catch(error => console.error('DEBUG: Error setting auth persistence:', error));

/**
 * Checks if a user is logged in, redirects to sign-in if not.
 * @returns {Promise<boolean>} True if user is authenticated, false otherwise.
 */
export async function checkUserLogin() {
  try {
    console.log('Checking user login at', new Date().toLocaleString('en-ZA'));
    const user = await new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        unsubscribe(); // Unsubscribe after first call to prevent memory leaks
        resolve(user);
      });
    });

    if (!user) {
      console.log('No user logged in, redirecting to /LandingPage/SignInAndSignUp/SignIn.html');
      window.location.assign('/LandingPage/SignInAndSignUp/SignIn.html');
      return false;
    }

    console.log('User login confirmed for:', user.email);
    return true;
  } catch (error) {
    console.error('Error checking user login:', error);
    window.location.assign('/LandingPage/SignInAndSignUp/SignIn.html');
    return false;
  }
} 