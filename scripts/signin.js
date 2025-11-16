// /scripts/signin.js
window.signinScriptLoaded = true;
console.log("DEBUG: signin.js loaded at", new Date().toLocaleString('en-ZA'));

import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
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

function showLoader() {
    const l = document.getElementById('loader'), o = document.getElementById('loader-overlay');
    if (l && o) { l.style.display = 'block'; o.style.display = 'block'; }
}
function hideLoader() {
    const l = document.getElementById('loader'), o = document.getElementById('loader-overlay');
    if (l && o) { l.style.display = 'none'; o.style.display = 'none'; }
}
function showError(msg) {
    const el = document.getElementById('error-message');
    if (!el) return;
    const txt = window.i18next?.t ? i18next.t('signin.error_message', { defaultValue: msg }) : msg;
    el.textContent = txt; el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}
function showVerificationModal() {
    const m = document.getElementById('verification-modal'), o = document.getElementById('verification-modal-overlay');
    if (m && o) { m.style.display = 'block'; o.style.display = 'block'; }
    const btn = document.getElementById('modal-ok-btn');
    if (btn) btn.onclick = () => { m.style.display = 'none'; o.style.display = 'none'; };
}

async function trackInteraction(uid, cat, act, lbl = "") {
    try {
        await addDoc(collection(db, 'interactions'), {
            userId: uid || `anonymous_${Date.now()}`,
            category: cat, action: act, label: lbl,
            timestamp: serverTimestamp(),
            language: window.i18next?.language || 'en',
            userAgent: navigator.userAgent
        });
    } catch (e) { console.error("Track error:", e); }
}

async function checkQuestionnaireCompletion(user) {
    try {
        const ud = await getDoc(doc(db, 'users', user.uid));
        if (!ud.exists()) return false;
        const d = ud.data();
        if (!d.questionnaireCompleted || !d.questionnaireResponseId) return false;
        const rd = await getDoc(doc(db, 'questionnaire_responses', d.questionnaireResponseId));
        return rd.exists();
    } catch (e) { return false; }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM ready – attaching sign-in logic");

    const emailInput = document.getElementById('email');
    const passwordField = document.getElementById('password-field');
    const signInBtn = document.getElementById('sign-in-btn');

    if (!signInBtn) {
        console.error("SIGN-IN BUTTON NOT FOUND! ID: 'sign-in-btn'");
        return;
    }

    emailInput?.addEventListener('blur', () => {
        passwordField.style.display = emailInput.value.trim() === 'nbigreeneconomy@gmail.com' ? 'none' : 'block';
    });

    let processing = false;
    signInBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (processing) return;
        processing = true; signInBtn.disabled = true;

        const email = emailInput.value.trim();
        const password = document.getElementById('password')?.value;

        if (!email) { showError("Enter email."); processing = false; signInBtn.disabled = false; return; }
        await trackInteraction(null, 'login', 'attempt', email);

        if (email === 'nbigreeneconomy@gmail.com') {
            showLoader();
            setTimeout(() => {
                hideLoader();
                window.location.href = `${baseUrl}/LandingPage/SignInAndSignUp/verifycode.html?email=${encodeURIComponent(email)}`;
            }, 1000);
            return;
        }

        if (!password) { showError("Password required."); processing = false; signInBtn.disabled = false; return; }

        showLoader();
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const user = cred.user; await user.reload();

            let verified = user.emailVerified;
            if (!verified) {
                const v = await getDoc(doc(db, 'email_verifications', email));
                verified = v.exists() && v.data().isVerified;
            }

            if (!verified) {
                await auth.signOut();
                showVerificationModal();
                showError("Verify your email first.");
                await trackInteraction(null, 'login', 'failure', 'unverified');
                hideLoader(); signInBtn.disabled = false; processing = false;
                return;
            }

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                language: window.i18next?.language || 'en',
                emailVerified: true
            }, { merge: true });

            await trackInteraction(user.uid, 'login', 'success', email);

            const done = await checkQuestionnaireCompletion(user);
            window.location.href = done
                ? `${baseUrl}/Dashboard/dashboard.html?userId=${user.uid}`
                : `${baseUrl}/questionnaire/questionnaire.html?userId=${user.uid}`;
        } catch (err) {
            let msg = "Sign-in failed.";
            if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
            else if (err.code === 'auth/user-not-found') msg = "No account found.";
            else if (err.code === 'auth/invalid-email') msg = "Invalid email.";
            showError(msg);
            await trackInteraction(null, 'login', 'failure', err.code);
        } finally {
            hideLoader(); signInBtn.disabled = false; processing = false;
        }
    });

    trackInteraction(null, 'page', 'loaded', 'SignIn');
});