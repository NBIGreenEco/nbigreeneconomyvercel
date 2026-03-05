import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.firebasestorage.app",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

// Configuration for baseUrl - use current domain dynamically
// This allows the code to work on any deployment (localhost, vercel, custom domain)
const config = {
    baseUrl: window.location.origin
};

console.log("Initializing Firebase for SignUp at", new Date().toLocaleString('en-ZA'));
console.log("Using baseUrl:", config.baseUrl);
try {
    let app;
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully");

    // Set auth persistence to session-only
    setPersistence(auth, browserSessionPersistence)
        .then(() => {
            console.log("Auth persistence set to session-only");
        })
        .catch(error => {
            console.error("Error setting auth persistence:", error);
            const errorMessage = document.getElementById('error-message1');
            if (errorMessage) {
                errorMessage.textContent = "Failed to initialize session: " + getFriendlyAuthError(error);
                errorMessage.classList.remove('hidden');
                setTimeout(() => errorMessage.classList.add('hidden'), 5000);
            }
        });

    // Get or generate temporary user ID
    let tempUserId = new URLSearchParams(window.location.search).get('tempUserId');
    if (!tempUserId) {
        tempUserId = 'guest_' + Math.random().toString(36).substr(2, 9);
        console.log("Generated guest tempUserId:", tempUserId);
    }

    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');

    function showLoader() {
        if (loader && loaderOverlay) {
            loader.style.display = 'block';
            loaderOverlay.style.display = 'flex';
            console.log("Loader shown");
        } else {
            console.error("Loader elements not found");
        }
    }

    function hideLoader() {
        if (loader && loaderOverlay) {
            loader.style.display = 'none';
            loaderOverlay.style.display = 'none';
            console.log("Loader hidden");
        } else {
            console.error("Loader elements not found");
        }
    }

    function showSpamWarningModal(email) {
        const modal = document.getElementById('verification-modal');
        const modalOverlay = document.getElementById('verification-modal-overlay');
        const okBtn = document.getElementById('modal-ok-btn');
        if (modal && modalOverlay && okBtn) {
            // Update modal content with spam warning
            modal.innerHTML = `
                <div style="text-align: center;">
                    <h2 style="font-size: 1.5rem; color: #4eb5a6; margin-bottom: 1rem;"> Check Your Email</h2>
                    <p style="font-size: 1rem; color: #555; margin-bottom: 1.5rem;">
                        A verification link has been sent to:<br/>
                        <strong>${email}</strong>
                    </p>
                    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 0.25rem; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                        <p style="color: #ff6b6b; font-weight: 600; margin: 0 0 0.5rem 0;">⚠️ Important:</p>
                        <p style="color: #555; margin: 0; font-size: 0.95rem; line-height: 1.6;">
                            The verification email might end up in your <strong>Spam</strong> or <strong>Promotions</strong> folder. 
                            Please check these folders if you don't see the email in your inbox.
                        </p>
                    </div>
                    <p style="font-size: 0.95rem; color: #777; margin-bottom: 2rem; line-height: 1.6;">
                        Click the verification link to complete your sign-up and you'll be redirected to the Sign In page.
                    </p>
                    <button id="modal-ok-btn" style="background-color: #4eb5a6; color: white; padding: 12px 28px; border-radius: 4px; font-weight: 600; border: none; cursor: pointer; font-size: 1rem; transition: background-color 0.3s;">
                        Understood
                    </button>
                </div>
            `;
            
            modal.style.display = 'block';
            modalOverlay.style.display = 'block';
            
            const newOkBtn = document.getElementById('modal-ok-btn');
            newOkBtn.onclick = () => {
                modal.style.display = 'none';
                modalOverlay.style.display = 'none';
                console.log(`User acknowledged spam warning for: ${email}`);
                window.location.href = `SignIn.html?tempUserId=${tempUserId}`;
            };
        } else {
            console.error("Modal elements not found");
        }
    }

    async function trackInteraction(category, action, label = "") {
        try {
            await addDoc(collection(db, 'interactions'), {
                tempUserId: tempUserId,
                category: category,
                action: action,
                label: label,
                timestamp: serverTimestamp(),
                language: 'en' || 'en',
                userAgent: navigator.userAgent
            });
            console.log("Interaction tracked:", { tempUserId, category, action, label });
        } catch (error) {
            console.error("Error logging interaction:", error);
            console.log(`Local log: tempUserId=${tempUserId}, category=${category}, action=${action}, label=${label}`);
        }
    }

    //helper function for Firebase errors
    function getFriendlyAuthError(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/email-already-in-use':
                return 'This email is already registered. Try signing in instead.';
            case 'auth/weak-password':
                return 'Your password must be at least 6 characters long.';
            case 'auth/missing-password':
                return 'Please enter a password.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return 'Something went wrong. Please try again.';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM fully loaded for SignUp page at", new Date().toLocaleString('en-ZA'));

        const signUpBtn = document.getElementById('sign-up-btn');
        const googleSignUpBtn = document.getElementById('google-sign-up-btn');
        if (!signUpBtn) console.error("Sign-up button not found");
        if (!googleSignUpBtn) console.error("Google sign-up button not found");

        let isProcessing = false;
        if (signUpBtn) {
            signUpBtn.addEventListener('click', async (e) => {
                if (isProcessing) return;
                isProcessing = true;
                e.preventDefault();
                const email = document.getElementById('email')?.value;
                const password = document.getElementById('password')?.value;
                const confirmPassword = document.getElementById('confirm-password')?.value;
                const errorMessage = document.getElementById('error-message1');
                if (!email || !password || !confirmPassword || !errorMessage) {
                    errorMessage.textContent = "Please fill in all fields.";
                    errorMessage.classList.remove('hidden');
                    setTimeout(() => errorMessage.classList.add('hidden'), 5000);
                    isProcessing = false;
                    return;
                }

                if (password !== confirmPassword) {
                    errorMessage.textContent = "Passwords do not match.";
                    errorMessage.classList.remove('hidden');
                    setTimeout(() => errorMessage.classList.add('hidden'), 5000);
                    isProcessing = false;
                    return;
                }

                showLoader();
                signUpBtn.disabled = true;

                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    // Track attempt after successful creation (now authenticated)
                    await trackInteraction('signup', 'attempt', `Email: ${email}`);
                    
                    // Send verification email with proper continueUrl
                    // Remove the full path - Firebase will use the default continue URL
                    const actionCodeSettings = {
                        url: `${config.baseUrl}/LandingPage/SignUp.html`,
                        handleCodeInApp: true
                    };
                    await sendEmailVerification(user, actionCodeSettings);
                    console.log('Verification email sent with actionCodeSettings:', actionCodeSettings);
                    
                    await setDoc(doc(db, 'users', user.uid), {
                        userId: user.uid,
                        email: user.email,
                        isAdmin: false,
                        language: 'en' || 'en',
                        createdAt: serverTimestamp()
                    }, { merge: true });

                    console.log("User created and email verification sent to VerifyEmail.html");
                    await trackInteraction('signup', 'success', `Email: ${email}`);
                    hideLoader();
                    showSpamWarningModal(email);
                } catch (error) {
                    hideLoader();
                    signUpBtn.disabled = false;
                    console.error("Sign-up error:", error);
                    // Track failure (may fallback to local log if not authenticated)
                    await trackInteraction('signup', 'failure', error.message);
                    errorMessage.textContent = getFriendlyAuthError(error);
                    errorMessage.classList.remove('hidden');
                    setTimeout(() => errorMessage.classList.add('hidden'), 5000);
                }
                isProcessing = false;
            });
        }

        if (googleSignUpBtn) {
            googleSignUpBtn.addEventListener('click', async (e) => {
                if (isProcessing) return;
                isProcessing = true;
                e.preventDefault();
                // Track attempt before auth (will fallback to local log)
                await trackInteraction('signup', 'attempt', 'Google');
                showLoader();
                googleSignUpBtn.disabled = true;
                try {
                    const userCredential = await signInWithPopup(auth, googleProvider);
                    const user = userCredential.user;
                    await setDoc(doc(db, 'users', user.uid), {
                        userId: user.uid,
                        email: user.email,
                        isAdmin: false,
                        language: 'en' || 'en',
                        createdAt: serverTimestamp()
                    }, { merge: true });

                    console.log("User created with Google");
                    await trackInteraction('signup', 'success', 'Google');
                    hideLoader();
                    googleSignUpBtn.disabled = false;

                    window.location.href = `/questionnaire/questionnaire.html?tempUserId=${tempUserId}`;
                } catch (error) {
                    hideLoader();
                    googleSignUpBtn.disabled = false;
                    console.error("Google sign-up error:", error);
                    // Track failure (may fallback to local log if not authenticated)
                    await trackInteraction('signup', 'failure', error.message);
                    const errorMessage = document.getElementById('error-message1');
                    if (errorMessage) {
                        errorMessage.textContent = getFriendlyAuthError(error);
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
                    }
                }
                isProcessing = false;
            });
        }

        if (typeof updateLanguage === 'function') {
            updateLanguage('en' || 'en');
        }
    });
} catch (error) {
    console.error("Firebase initialization failed:", error);
    const errorMessage = document.getElementById('error-message1');
    if (errorMessage) {
        errorMessage.textContent = "Firebase initialization failed: " + getFriendlyAuthError(error);
        

        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }
    hideLoader();
}
