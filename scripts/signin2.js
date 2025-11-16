import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.firebasestorage.app",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

const baseUrl = 'https://greeneconomytoolkit.com';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize form listener when DOM is ready
function initializeSigninForm() {
    const signinBtn = document.getElementById('signin-btn');
    
    if (signinBtn) {
        signinBtn.addEventListener('click', handleSignin);
        console.log('Sign in button listener attached');
    } else {
        console.error('Sign in button not found');
    }
}

// Show/Hide Functions
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

function showLoader() {
    const loaderOverlay = document.getElementById('loader-overlay');
    const loader = document.getElementById('loader');
    if (loaderOverlay) loaderOverlay.style.display = 'block';
    if (loader) loader.style.display = 'block';
}

function hideLoader() {
    const loaderOverlay = document.getElementById('loader-overlay');
    const loader = document.getElementById('loader');
    if (loaderOverlay) loaderOverlay.style.display = 'none';
    if (loader) loader.style.display = 'none';
}

function showVerificationModal() {
    const modalOverlay = document.getElementById('verification-modal-overlay');
    const modal = document.getElementById('verification-modal');
    if (modalOverlay) modalOverlay.classList.remove('hidden');
    if (modal) modal.classList.remove('hidden');
    
    const okBtn = document.getElementById('modal-ok-btn');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            if (modalOverlay) modalOverlay.classList.add('hidden');
            if (modal) modal.classList.add('hidden');
        });
    }
}

// Form Submit Handler
async function handleSignin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signinBtn = document.getElementById('signin-btn');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!email) {
        showError('Please enter your email address');
        return;
    }

    if (!password) {
        showError('Please enter your password');
        return;
    }

    showLoader();
    signinBtn.disabled = true;

    try {
        console.log('Attempting to sign in:', email);
        
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Sign in successful:', user.uid);

        // Check if email is verified
        await user.reload();
        
        if (!user.emailVerified) {
            console.log('Email not verified');
            await auth.signOut();
            hideLoader();
            signinBtn.disabled = false;
            showVerificationModal();
            return;
        }

        // Update user document
        await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            email: user.email,
            isAdmin: false,
            lastLogin: serverTimestamp(),
            emailVerified: true
        }, { merge: true });

        console.log('User document updated');

        // Check if user completed questionnaire
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const questionnaireCompleted = userDoc.exists() && userDoc.data().questionnaireCompleted;

        // Redirect based on questionnaire status
        hideLoader();

        setTimeout(() => {
            const redirectUrl = questionnaireCompleted
                ? `${baseUrl}/Dashboard/dashboard.html?userId=${user.uid}`
                : `${baseUrl}/questionnaire/questionnaire.html?userId=${user.uid}`;
            
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }, 500);

    } catch (error) {
        hideLoader();
        signinBtn.disabled = false;

        console.error('Sign in error:', error.code, error.message);

        let errorMsg = 'Sign in failed. Please try again.';

        if (error.code === 'auth/user-not-found') {
            errorMsg = 'No account found with this email address.';
        } else if (error.code === 'auth/wrong-password') {
            errorMsg = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg = 'Invalid email address.';
        } else if (error.code === 'auth/user-disabled') {
            errorMsg = 'This account has been disabled.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMsg = 'Too many failed login attempts. Please try again later.';
        }

        showError(errorMsg);
    }
}

// Initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSigninForm);
} else {
    initializeSigninForm();
}

console.log('SignIn2 script loaded successfully');
