import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.appspot.com",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function checkAdminStatus(user) {
    if (!user) {
        console.log('DEBUG: No user provided for admin status check');
        return false;
    }
    try {
        const adminDoc = await getDoc(doc(db, 'admins', user.email.toLowerCase()));
        const isAdmin = adminDoc.exists() && adminDoc.data()?.isAdmin !== false;
        console.log('DEBUG: Admin status check for', user.email, ':', isAdmin, 'Document exists:', adminDoc.exists(), 'isAdmin field:', adminDoc.data()?.isAdmin);
        return isAdmin;
    } catch (error) {
        console.error('DEBUG: Error checking admin status:', error.code, error.message);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: Checking admin access at', new Date().toLocaleString('en-ZA'));

    // Check sessionStorage first
    const isVerified = sessionStorage.getItem('verified') === 'true';
    const sessionStart = sessionStorage.getItem('sessionStart');
    const now = Date.now();
    const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

    console.log('DEBUG: sessionStorage - verified:', isVerified, 'sessionStart:', sessionStart);

    if (!isVerified || !sessionStart) {
        console.log('DEBUG: Admin not verified in sessionStorage or sessionStart missing, redirecting to VerifyCode.html');
        window.location.assign('/LandingPage/SignInAndSignUp/verifycode.html');
        return;
    }

    // Check if session has expired
    const timeElapsed = now - parseInt(sessionStart);
    if (timeElapsed >= sessionDuration) {
        console.log('DEBUG: Session expired, clearing sessionStorage and redirecting');
        sessionStorage.removeItem('verified');
        sessionStorage.removeItem('sessionStart');
        sessionStorage.removeItem('verifiedAdminEmail');
        window.location.assign('/LandingPage/SignInAndSignUp/verifycode.html');
        return;
    }

    // Set timeout for remaining session time
    const remainingTime = sessionDuration - timeElapsed;
    setTimeout(() => {
        console.log('DEBUG: Session timeout reached, clearing sessionStorage and redirecting');
        sessionStorage.removeItem('verified');
        sessionStorage.removeItem('sessionStart');
        sessionStorage.removeItem('verifiedAdminEmail');
        window.location.assign('/LandingPage/SignInAndSignUp/verifycode.html');
    }, remainingTime);

    onAuthStateChanged(auth, async (user) => {
        console.log('DEBUG: Firebase auth state checked, user:', user ? user.email : 'null');

        if (!user || !user.email) {
            console.log('DEBUG: No authenticated user, redirecting to SignIn');
            resetAdminSession(false);
            window.location.assign('/LandingPage/SignInAndSignUp/SignIn.html');
            return;
        }

        const verifiedAdminEmail = (sessionStorage.getItem('verifiedAdminEmail') || '').toLowerCase();
        if (verifiedAdminEmail && user.email.toLowerCase() !== verifiedAdminEmail) {
            console.log('DEBUG: Verified admin email mismatch, forcing re-verification');
            resetAdminSession(false);
            window.location.assign('/LandingPage/SignInAndSignUp/verifycode.html');
            return;
        }

        const isAdmin = await checkAdminStatus(user);
        if (!isAdmin) {
            console.log('DEBUG: Authenticated user is not admin, redirecting to SignIn');
            resetAdminSession(false);
            window.location.assign('/LandingPage/SignInAndSignUp/SignIn.html');
            return;
        }

        console.log('DEBUG: Admin access confirmed, session expires in', (remainingTime / 1000 / 60).toFixed(2), 'minutes');
    });
});

// Function to reset session (for logout)
export function resetAdminSession(redirect = true) {
    console.log('DEBUG: Resetting admin session');
    sessionStorage.removeItem('verified');
    sessionStorage.removeItem('sessionStart');
    sessionStorage.removeItem('verifiedAdminEmail');
    sessionStorage.removeItem('pendingAdminEmail');
    signOut(auth).catch((error) => {
        console.warn('DEBUG: signOut failed while resetting admin session:', error);
    }).finally(() => {
        if (redirect) {
            window.location.assign('/LandingPage/SignInAndSignUp/SignIn.html');
        }
    });
}
