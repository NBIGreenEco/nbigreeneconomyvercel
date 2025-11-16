import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, addDoc, serverTimestamp, collection } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

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
const googleProvider = new GoogleAuthProvider();

function showLoader() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('loader-overlay').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('loader-overlay').style.display = 'none';
}

function showError(message) {
    const el = document.getElementById('error-message');
    const final = (window.i18next?.t) ? i18next.t('signin.error_message', { defaultValue: message }) : message;
    el.textContent = final;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

function showVerificationModal() {
    document.getElementById('verification-modal').style.display = 'block';
    document.getElementById('verification-modal-overlay').style.display = 'block';
    document.getElementById('modal-ok-btn').onclick = () => {
        document.getElementById('verification-modal').style.display = 'none';
        document.getElementById('verification-modal-overlay').style.display = 'none';
    };
}

async function trackInteraction(userId, category, action, label = "") {
    console.log(`Track: ${category}/${action} - ${label}`);
    try {
        await addDoc(collection(db, 'interactions'), {
            userId: userId || `anonymous_${Date.now()}`,
            category, action, label,
            timestamp: serverTimestamp(),
            language: (window.i18next?.language) || 'en',
            userAgent: navigator.userAgent
        });
    } catch (e) { console.error("Track error:", e); }
}

async function checkQuestionnaireCompletion(user) {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) return false;
        const data = userDoc.data();
        if (!data.questionnaireCompleted || !data.questionnaireResponseId) return false;
        const res = await getDoc(doc(db, 'questionnaire_responses', data.questionnaireResponseId));
        return res.exists();
    } catch (e) {
        console.error("Questionnaire check error:", e);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordField = document.getElementById('password-field');
    const signInBtn = document.getElementById('sign-in-btn');

    if (!signInBtn) {
        console.error("SIGN-IN BUTTON NOT FOUND! Check ID: 'sign-in-btn'");
        return;
    }

    emailInput?.addEventListener('blur', () => {
        if (emailInput.value.trim() === 'nbigreeneconomy@gmail.com') {
            passwordField.style.display = 'none';
        } else {
            passwordField.style.display = 'block';
        }
    });

    let isProcessing = false;

    signInBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (isProcessing) return;
        isProcessing = true;
        signInBtn.disabled = true;

        const email = emailInput.value.trim();
        const password = document.getElementById('password')?.value;

        if (!email) { showError("Enter email."); isProcessing = false; signInBtn.disabled = false; return; }

        await trackInteraction(null, 'login', 'attempt', email);

        if (email === 'nbigreeneconomy@gmail.com') {
            showLoader();
            setTimeout(() => {
                hideLoader();
                window.location.href = `${baseUrl}/LandingPage/SignInAndSignUp/verifycode.html?email=${encodeURIComponent(email)}`;
            }, 1000);
            return;
        }

        if (!password) { showError("Password required."); hideLoader(); signInBtn.disabled = false; isProcessing = false; return; }

        showLoader();
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const user = cred.user;
            await user.reload();

            let verified = user.emailVerified;
            if (!verified) {
                const vDoc = await getDoc(doc(db, 'email_verifications', email));
                verified = vDoc.exists() && vDoc.data().isVerified;
            }

            if (!verified) {
                await auth.signOut();
                showVerificationModal();
                showError("Verify your email first.");
                await trackInteraction(null, 'login', 'failure', 'unverified');
                hideLoader();
                signInBtn.disabled = false;
                isProcessing = false;
                return;
            }

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                language: (window.i18next?.language) || 'en',
                emailVerified: true
            }, { merge: true });

            await trackInteraction(user.uid, 'login', 'success', email);

            const done = await checkQuestionnaireCompletion(user);
            const redirect = done
                ? `${baseUrl}/Dashboard/dashboard.html?userId=${user.uid}`
                : `${baseUrl}/questionnaire/questionnaire.html?userId=${user.uid}`;

            window.location.href = redirect;
        } catch (err) {
            let msg = "Sign-in failed.";
            if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
            else if (err.code === 'auth/user-not-found') msg = "No account found.";
            else if (err.code === 'auth/invalid-email') msg = "Invalid email.";
            showError(msg);
            await trackInteraction(null, 'login', 'failure', err.code);
        } finally {
            hideLoader();
            signInBtn.disabled = false;
            isProcessing = false;
        }
    });

    trackInteraction(null, 'page', 'loaded', 'SignIn');
});