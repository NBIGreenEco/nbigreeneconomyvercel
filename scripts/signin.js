import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.firebasestorage.app",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

// Always use production URL
const baseUrl = 'https://greeneconomytoolkit.org';

console.log("DEBUG: Initializing Firebase for SignIn at", new Date().toLocaleString('en-ZA'));
console.log(`DEBUG: Environment: ${isProduction ? 'production' : 'development'}, Base URL: ${baseUrl}`);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

function showLoader() {
    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loader && loaderOverlay) {
        loader.style.display = 'block';
        loaderOverlay.style.display = 'block';
        console.log("DEBUG: Loader shown");
    } else {
        console.error("DEBUG: Loader elements not found");
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loader && loaderOverlay) {
        loader.style.display = 'none';
        loaderOverlay.style.display = 'none';
        console.log("DEBUG: Loader hidden");
    } else {
        console.error("DEBUG: Loader elements not found");
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        const finalMessage = (typeof i18next !== 'undefined' && i18next.t)
            ? i18next.t('signin.error_message', { defaultValue: message })
            : message;
        errorMessage.textContent = finalMessage;
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }
}

function showVerificationModal() {
    const modal = document.getElementById('verification-modal');
    const modalOverlay = document.getElementById('verification-modal-overlay');
    if (modal && modalOverlay) {
        modal.style.display = 'block';
        modalOverlay.style.display = 'block';
        console.log("DEBUG: Verification modal shown");
    }
    const okBtn = document.getElementById('modal-ok-btn');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            modalOverlay.style.display = 'none';
            console.log("DEBUG: Verification modal closed");
        });
    }
}

async function trackInteraction(userId, category, action, label = "") {
    // Always log locally
    console.log(`DEBUG: Local log: userId=${userId || 'anonymous'}, category=${category}, action=${action}, label=${label}`);
    
    try {
        await addDoc(collection(db, 'interactions'), {
            userId: userId || `anonymous_${Date.now()}`,
            category,
            action,
            label,
            timestamp: serverTimestamp(),
            language: (typeof i18next !== 'undefined' ? i18next.language : 'en') || 'en',
            userAgent: navigator.userAgent
        });
        console.log("DEBUG: Interaction logged successfully to Firestore");
    } catch (error) {
        console.error("DEBUG: Error logging interaction:", error);
    }
}

async function checkQuestionnaireCompletion(user) {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.questionnaireCompleted && data.questionnaireResponseId) {
                const responseDoc = await getDoc(doc(db, 'questionnaire_responses', data.questionnaireResponseId));
                if (responseDoc.exists()) {
                    console.log(`DEBUG: User ${user.uid} has completed questionnaire with response ID: ${data.questionnaireResponseId}`);
                    return true;
                } else {
                    console.warn(`DEBUG: Questionnaire response ID ${data.questionnaireResponseId} not found, resetting completion status`);
                    await setDoc(doc(db, 'users', user.uid), {
                        questionnaireCompleted: false,
                        questionnaireResponseId: null
                    }, { merge: true });
                    return false;
                }
            }
            return false;
        }
        return false;
    } catch (error) {
        console.error("DEBUG: Error checking questionnaire completion:", error);
        await trackInteraction(user.uid, 'error', 'check_questionnaire', error.message);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOM fully loaded for SignIn page at", new Date().toLocaleString('en-ZA'));

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', (e) => {
            const email = e.target.value.trim();
            const passwordField = document.getElementById('password-field');
            if (email === 'nbigreeneconomy@gmail.com') {
                if (passwordField) passwordField.style.display = 'none';
                console.log("DEBUG: Admin email detected, hiding password field");
            } else {
                if (passwordField) passwordField.style.display = 'block';
                console.log("DEBUG: Non-admin email, showing password field");
            }
        });
    }

    const signInBtn = document.getElementById('sign-in-btn');
    const googleSignInBtn = document.getElementById('google-sign-in-btn');
    if (!signInBtn) console.error("DEBUG: Sign-in button not found");
    if (!googleSignInBtn) console.error("DEBUG: Google sign-in button not found");

    let isProcessing = false;

    if (signInBtn) {
        signInBtn.addEventListener('click', async (e) => {
            if (isProcessing) return;
            isProcessing = true;
            e.preventDefault();
            console.log("DEBUG: Sign-in button clicked");

            const email = document.getElementById('email')?.value?.trim();
            const password = document.getElementById('password')?.value;
            const errorMessage = document.getElementById('error-message');
            if (!email || !errorMessage) {
                console.error("DEBUG: Email or error-message element not found");
                showError("Please enter an email address.");
                isProcessing = false;
                return;
            }

            await trackInteraction(null, 'login', 'attempt', `Email: ${email}`);

            if (email === 'nbigreeneconomy@gmail.com') {
                showLoader();
                setTimeout(() => {
                    hideLoader();
                    window.location.href = `${baseUrl}/LandingPage/SignInAndSignUp/VerifyCode.html?email=${encodeURIComponent(email)}`;
                }, 1000);
                isProcessing = false;
                return;
            }

            if (!password) {
                showError("Password is required.");
                hideLoader();
                signInBtn.disabled = false;
                isProcessing = false;
                return;
            }

            showLoader();
            signInBtn.disabled = true;

            try {
                console.log("DEBUG: Attempting email/password sign-in for:", email);
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                console.log("DEBUG: Sign-in successful, checking email verification status");
                console.log("DEBUG: Firebase emailVerified flag:", user.emailVerified);

                // Refresh the user to get the latest emailVerified status from Firebase
                await user.reload();
                console.log("DEBUG: After reload - Firebase emailVerified flag:", user.emailVerified);

                // Check if email is verified in Firestore (most reliable method)
                let isEmailVerified = false;
                
                try {
                    const verificationDoc = await getDoc(doc(db, 'email_verifications', email));
                    if (verificationDoc.exists() && verificationDoc.data().isVerified) {
                        console.log("DEBUG: Email verification found in Firestore - VERIFIED");
                        isEmailVerified = true;
                    } else {
                        console.log("DEBUG: Email verification not found or not marked in Firestore");
                    }
                } catch (e) {
                    console.log("DEBUG: Error checking Firestore verification:", e.message);
                }

                // Also check Firebase's flag as secondary check
                if (user.emailVerified) {
                    console.log("DEBUG: Firebase emailVerified flag is TRUE");
                    isEmailVerified = true;
                }

                if (!isEmailVerified) {
                    console.log("DEBUG: Email not verified - blocking sign-in");
                    await auth.signOut();
                    hideLoader();
                    signInBtn.disabled = false;
                    showError("Please verify your email to continue.");
                    showVerificationModal();
                    await trackInteraction(null, 'login', 'failure', 'Email not verified');
                    isProcessing = false;
                    return;
                }

                console.log("DEBUG: Email verified - PROCEEDING WITH SIGN-IN");
                await setDoc(doc(db, 'users', user.uid), {
                    userId: user.uid,
                    email: user.email,
                    isAdmin: false,
                    language: (typeof i18next !== 'undefined' ? i18next.language : 'en') || 'en',
                    createdAt: serverTimestamp(),
                    emailVerified: true
                }, { merge: true });
                console.log("DEBUG: User doc written successfully");
                await trackInteraction(user.uid, 'login', 'success', `Email: ${email}`);

                const questionnaireCompleted = await checkQuestionnaireCompletion(user);
                const redirectUrl = questionnaireCompleted
                    ? `${baseUrl}/Dashboard/dashboard.html?userId=${user.uid}`
                    : `${baseUrl}/questionnaire/questionnaire.html?userId=${user.uid}`;
                window.location.href = redirectUrl;
            } catch (error) {
                hideLoader();
                signInBtn.disabled = false;
                console.error("DEBUG: Sign-in error:", error);
                let errorMsg = "Sign-in failed. Please try again.";
                if (error.code === 'auth/wrong-password') {
                    errorMsg = "Incorrect password.";
                } else if (error.code === 'auth/user-not-found') {
                    errorMsg = "No account found with this email.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMsg = "Invalid email address.";
                }
                await trackInteraction(null, 'login', 'failure', errorMsg);
                showError(errorMsg);
            }
            isProcessing = false;
        });
    }

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async (e) => {
            if (isProcessing) return;
            isProcessing = true;
            e.preventDefault();
            console.log("DEBUG: Google sign-in button clicked");
            await trackInteraction(null, 'login', 'attempt', 'Google');
            showLoader();
            googleSignInBtn.disabled = true;

            try {
                const userCredential = await signInWithPopup(auth, googleProvider);
                const user = userCredential.user;

                await setDoc(doc(db, 'users', user.uid), {
                    userId: user.uid,
                    email: user.email,
                    isAdmin: user.email === 'nbigreeneconomy@gmail.com',
                    language: (typeof i18next !== 'undefined' ? i18next.language : 'en') || 'en',
                    createdAt: serverTimestamp()
                }, { merge: true });
                console.log("DEBUG: User doc written successfully");
                await trackInteraction(user.uid, 'login', 'success', 'Google');

                if (user.email === 'nbigreeneconomy@gmail.com') {
                    window.location.href = `${baseUrl}/LandingPage/SignInAndSignUp/VerifyCode.html?email=${encodeURIComponent(user.email)}`;
                } else {
                    const questionnaireCompleted = await checkQuestionnaireCompletion(user);
                    const redirectUrl = questionnaireCompleted
                        ? `${baseUrl}/Dashboard/dashboard.html?userId=${user.uid}`
                        : `${baseUrl}/questionnaire/questionnaire.html?userId=${user.uid}`;
                    window.location.href = redirectUrl;
                }
            } catch (error) {
                console.error("DEBUG: Google sign-in error:", error);
                await trackInteraction(null, 'login', 'failure', error.message || 'Google sign-in failed');
                showError("Google sign-in failed. Please try again.");
            } finally {
                hideLoader();
                googleSignInBtn.disabled = false;
                isProcessing = false;
            }
        });
    }

    // Initial page load tracking
    trackInteraction(null, 'page', 'loaded', 'SignIn page');
});