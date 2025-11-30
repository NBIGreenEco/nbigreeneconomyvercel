// /scripts/signin.js - Clean version
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

// Use the current domain dynamically instead of hardcoded URL
const baseUrl = window.location.origin;
console.log("DEBUG: Using baseUrl:", baseUrl);

// ✅ Helper function for debugging verification status
window.checkVerificationStatus = async (email) => {
    try {
        const verDoc = await getDoc(doc(db, 'email_verifications', email));
        if (verDoc.exists()) {
            console.log(`✅ email_verifications/${email} exists:`, verDoc.data());
            return verDoc.data();
        } else {
            console.log(`❌ email_verifications/${email} does NOT exist`);
            return null;
        }
    } catch (error) {
        console.error(`Error checking verification: ${error.message}`);
    }
};
console.log('💡 TIP: Run window.checkVerificationStatus("your@email.com") in console to check verification status');

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
    el.textContent = msg; 
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

function showVerificationModal() {
    const m = document.getElementById('verification-modal'), o = document.getElementById('verification-modal-overlay');
    if (m && o) { m.style.display = 'block'; o.style.display = 'block'; }
    
    // "I've Verified My Email" button - allows retry
    const okBtn = document.getElementById('modal-ok-btn');
    if (okBtn) {
        okBtn.onclick = () => { 
            console.log('[SIGNIN] User clicked "I\'ve Verified My Email" - closing modal');
            m.style.display = 'none'; 
            o.style.display = 'none'; 
        };
    }
    
    // "Back" button - clears form
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => { 
            console.log('[SIGNIN] User clicked "Back" - closing modal and clearing form');
            m.style.display = 'none'; 
            o.style.display = 'none';
            emailInput.value = '';
            if (document.getElementById('password')) {
                document.getElementById('password').value = '';
            }
        };
    }
}

async function trackInteraction(uid, cat, act, lbl = "") {
    try {
        await addDoc(collection(db, 'interactions'), {
            userId: uid || `anonymous_${Date.now()}`,
            category: cat, action: act, label: lbl,
            timestamp: serverTimestamp(),
            language: 'en',
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

    console.log("Sign-in button element:", signInBtn);
    console.log("Email input element:", emailInput);
    console.log("Password field element:", passwordField);

    if (!signInBtn) {
        console.error("SIGN-IN BUTTON NOT FOUND! ID: 'sign-in-btn'");
        return;
    }

    emailInput?.addEventListener('blur', () => {
        passwordField.style.display = emailInput.value.trim() === 'nbigreeneconomy@gmail.com' ? 'none' : 'block';
    });

    let processing = false;
    
    // Main click handler
    const handleSignIn = async (e) => {
        console.log("Sign-in button clicked! Event:", e);
        e?.preventDefault?.();
        if (processing) return;
        processing = true; 
        signInBtn.disabled = true;

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
            const user = cred.user; 
            await user.reload();

            console.log(`[SIGNIN] ✅ User authenticated: ${user.uid}, Email: ${user.email}`);
            console.log(`[SIGNIN] Firebase emailVerified: ${user.emailVerified}`);

            // ⚠️ CRITICAL: Check email verification from Firestore email_verifications collection
            // This matches the Firestore rules structure
            let verified = false;
            console.log(`[SIGNIN] Checking Firestore email_verifications for: ${email}`);
            
            try {
                const verDoc = await getDoc(doc(db, 'email_verifications', email));
                if (verDoc.exists()) {
                    const verData = verDoc.data();
                    // Check if isVerified is true (matches Firestore rules field)
                    verified = verData.isVerified === true;
                    console.log(`[SIGNIN] ✅ Firestore email_verifications found:`, verData);
                    console.log(`[SIGNIN] isVerified value: ${verData.isVerified}, Verified: ${verified}`);
                } else {
                    console.log(`[SIGNIN] ❌ No email_verifications document found for: ${email}`);
                    verified = false;
                }
            } catch (fsErr) {
                console.error(`[SIGNIN] ❌ Firestore lookup error: ${fsErr.message}`);
                verified = false;
            }

            // ❌ BLOCK if not verified
            if (!verified) {
                console.log(`[SIGNIN] ❌ BLOCKED - Email not verified. Signing user out.`);
                await auth.signOut();
                hideLoader();
                showVerificationModal();
                showError("Please verify your email first before signing in.");
                await trackInteraction(null, 'login', 'failure', `unverified_email: ${email}`);
                signInBtn.disabled = false; 
                processing = false;
                return;
            }

            console.log(`[SIGNIN] ✅ Email verified. Proceeding to next step...`);
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                language: 'en',
                emailVerified: true
            }, { merge: true });

            // ✅ Initialize admin session here
            console.log('📝 Setting up admin session...');
            await window.AdminSessionManager.initializeAdminSession(user);
            window.AdminSessionManager.logSessionInfo();

            await trackInteraction(user.uid, 'login', 'success', email);

            const done = await checkQuestionnaireCompletion(user);
            const nextPage = done
                ? `${baseUrl}/Dashboard/dashboard.html?userId=${user.uid}`
                : `${baseUrl}/questionnaire/questionnaire.html?userId=${user.uid}`;
            
            console.log('✅ Login successful, redirecting to:', nextPage);
            window.location.href = nextPage;
        } catch (err) {
            let msg = "Sign-in failed.";
            if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
            else if (err.code === 'auth/user-not-found') msg = "No account found.";
            else if (err.code === 'auth/invalid-email') msg = "Invalid email.";
            console.error(`[SIGNIN] Error: ${err.code} - ${err.message}`);
            showError(msg);
            await trackInteraction(null, 'login', 'failure', err.code);
        } finally {
            hideLoader(); 
            signInBtn.disabled = false; 
            processing = false;
        }
    };
    
    // Make the handler globally available as a backup
    window.handleSignInClick = handleSignIn;
    
    // Attach the click handler
    signInBtn.addEventListener('click', handleSignIn);
    console.log('Sign-in button listener attached successfully');

    // Fallback: If DOM change occurs, reattach listener
    const observer = new MutationObserver(() => {
        const btn = document.getElementById('sign-in-btn');
        if (btn && !btn.__handlerAttached) {
            btn.addEventListener('click', handleSignIn);
            btn.__handlerAttached = true;
            console.log('Reattached sign-in handler via MutationObserver');
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    signInBtn.__handlerAttached = true;

    trackInteraction(null, 'page', 'loaded', 'SignIn');
});
