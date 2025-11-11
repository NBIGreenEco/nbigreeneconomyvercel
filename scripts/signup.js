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

// Configuration for baseUrl (browser-compatible replacement for process.env)
const config = {
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:5504' 
        : 'https://greeneconomytoolkit.org'
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
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = i18next.t('signup.error_message', { defaultValue: "Failed to initialize session: " + error.message });
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

    function showVerificationModal(email) {
        const modal = document.getElementById('verification-modal');
        const modalOverlay = document.getElementById('verification-modal-overlay');
        const okBtn = document.getElementById('modal-ok-btn');
        if (modal && modalOverlay && okBtn) {
            modal.style.display = 'block';
            modalOverlay.style.display = 'block';
            okBtn.onclick = () => {
                modal.style.display = 'none';
                modalOverlay.style.display = 'none';
                console.log(`Verification email sent, waiting for user action: ${email}`);
                // Optionally redirect to a waiting page or stay on the signup page
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
                language: i18next.language || 'en',
                userAgent: navigator.userAgent
            });
            console.log("Interaction tracked:", { tempUserId, category, action, label });
        } catch (error) {
            console.error("Error logging interaction:", error);
            console.log(`Local log: tempUserId=${tempUserId}, category=${category}, action=${action}, label=${label}`);
        }
    }

    function generateVerificationToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    async function sendAdminVerificationEmail(email, password, signUpBtn) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(`Created admin user: ${email}`);

            const token = generateVerificationToken();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
            const actionCodeSettings = {
                url: `${config.baseUrl}/LandingPage/SignInAndSignUp/VerifyEmail.html?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&tempUserId=${tempUserId}`,
                handleCodeInApp: true
            };
            await sendEmailVerification(user, actionCodeSettings);
            console.log(`Verification email sent to ${email} with token: ${token}`);

            await setDoc(doc(db, 'email_verifications', email), {
                email: email,
                token: token,
                isVerified: false,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt
            }, { merge: true });
            console.log('Email verification token stored in Firestore');

            await setDoc(doc(db, 'admins', email), { isAdmin: true }, { merge: true });

            hideLoader();
            showVerificationModal(email);
            await trackInteraction('signup', 'code_sent', `Email: ${email}, Token: ${token}, URL: ${actionCodeSettings.url}`);
        } catch (error) {
            hideLoader();
            signUpBtn.disabled = false;
            console.error("Admin sign-up error:", error, { code: error.code, message: error.message });
            await trackInteraction('signup', 'failure', `Error: ${error.message}`);
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = i18next.t('signup.error_message', { defaultValue: error.message || "Failed to send verification code. Please try again." });
                errorMessage.classList.remove('hidden');
                setTimeout(() => errorMessage.classList.add('hidden'), 5000);
            }
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
                const errorMessage = document.getElementById('error-message');
                if (!email || !password || !confirmPassword || !errorMessage) {
                    console.error("Form elements not found");
                    isProcessing = false;
                    return;
                }

                if (password !== confirmPassword) {
                    errorMessage.textContent = i18next.t('signup.password_mismatch', { defaultValue: "Passwords do not match." });
                    errorMessage.classList.remove('hidden');
                    setTimeout(() => errorMessage.classList.add('hidden'), 5000);
                    isProcessing = false;
                    return;
                }

                showLoader();
                signUpBtn.disabled = true;

                try {
                    if (email === 'nbigreeneconomy@gmail.com') {
                        await sendAdminVerificationEmail(email, password, signUpBtn);
                        // Track attempt after successful creation (now authenticated)
                        await trackInteraction('signup', 'attempt', `Email: ${email}`);
                    } else {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
                        // Track attempt after successful creation (now authenticated)
                        await trackInteraction('signup', 'attempt', `Email: ${email}`);
                        await sendEmailVerification(user, {
                            url: `${config.baseUrl}/LandingPage/SignInAndSignUp/SignIn.html?tempUserId=${tempUserId}`,
                            handleCodeInApp: true
                        });
                        await setDoc(doc(db, 'users', user.uid), {
                            userId: user.uid,
                            email: user.email,
                            isAdmin: false,
                            language: i18next.language || 'en',
                            createdAt: serverTimestamp()
                        }, { merge: true });

                        console.log("User created and email verification sent");
                        await trackInteraction('signup', 'success', `Email: ${email}`);
                        hideLoader();
                        errorMessage.textContent = i18next.t('signup.success_message', { defaultValue: "Account created! Please verify your email." });
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => {
                            errorMessage.classList.add('hidden');
                            window.location.href = `SignIn.html?tempUserId=${tempUserId}`;
                        }, 3000);
                    }
                } catch (error) {
                    hideLoader();
                    signUpBtn.disabled = false;
                    console.error("Sign-up error:", error);
                    // Track failure (may fallback to local log if not authenticated)
                    await trackInteraction('signup', 'failure', error.message);
                    errorMessage.textContent = i18next.t('signup.error_message', { defaultValue: error.message });
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
                        isAdmin: user.email === 'nbigreeneconomy@gmail.com',
                        language: i18next.language || 'en',
                        createdAt: serverTimestamp()
                    }, { merge: true });

                    console.log("User created with Google");
                    await trackInteraction('signup', 'success', 'Google');
                    hideLoader();
                    googleSignUpBtn.disabled = false;

                    if (user.email === 'nbigreeneconomy@gmail.com') {
                        const token = generateVerificationToken();
                        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                        const actionCodeSettings = {
                            url: `${config.baseUrl}/LandingPage/SignInAndSignUp/VerifyEmail.html?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token)}&tempUserId=${tempUserId}`,
                            handleCodeInApp: true
                        };
                        await sendEmailVerification(user, actionCodeSettings);
                        console.log(`Verification email sent to ${user.email} with token: ${token}`);

                        await setDoc(doc(db, 'email_verifications', user.email), {
                            email: user.email,
                            token: token,
                            isVerified: false,
                            createdAt: serverTimestamp(),
                            expiresAt: expiresAt
                        }, { merge: true });
                        console.log('Email verification token stored in Firestore');

                        await setDoc(doc(db, 'admins', user.email), { isAdmin: true }, { merge: true });

                        hideLoader();
                        showVerificationModal(user.email);
                        await trackInteraction('signup', 'code_sent', `Email: ${user.email}, Token: ${token}, URL: ${actionCodeSettings.url}`);
                    } else {
                        window.location.href = `/questionnaire/questionnaire.html?tempUserId=${tempUserId}`;
                    }
                } catch (error) {
                    hideLoader();
                    googleSignUpBtn.disabled = false;
                    console.error("Google sign-up error:", error);
                    // Track failure (may fallback to local log if not authenticated)
                    await trackInteraction('signup', 'failure', error.message);
                    const errorMessage = document.getElementById('error-message');
                    if (errorMessage) {
                        errorMessage.textContent = i18next.t('signup.error_message', { defaultValue: error.message });
                        errorMessage.classList.remove('hidden');
                        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
                    }
                }
                isProcessing = false;
            });
        }

        if (typeof updateLanguage === 'function') {
            updateLanguage(i18next.language || 'en');
        }
    });
} catch (error) {
    console.error("Firebase initialization failed:", error);
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = i18next.t('signup.error_message', { defaultValue: "Firebase initialization failed: " + error.message });
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }
    hideLoader();
}