import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

console.log("DEBUG: dashboard.js loaded at", new Date().toLocaleString('en-ZA'));

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.appspot.com",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}
const auth = getAuth(app);

const paths = {
    funding: "/Funding Hub/Funding-Hub.html",
    toolkits: "/ToolKits/toolkits.html",
    legal: "/LandingPage/legal/Legal.html",
    gamified: "/LandingPage/GamifiedLearning/Gamified.html"
};

function showLoader() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    console.log("DEBUG: Loader shown");
}

function hideLoader() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    console.log("DEBUG: Loader hidden");
}

function displayErrorMessage(message) {
    const container = document.querySelector(".dashboard-grid") || document.querySelector(".container-full") || document.body;
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    container.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 10000);
    console.log("DEBUG: Error message displayed:", message);
}

function initializeDashboard() {
    console.log("DEBUG: Initializing dashboard cards...");
    const dashboardCards = document.querySelectorAll(".dashboard-card");
    console.log(`DEBUG: Found ${dashboardCards.length} dashboard cards`);
    if (dashboardCards.length === 0) {
        console.warn("DEBUG: No dashboard cards found");
        displayErrorMessage("No dashboard cards found. Please check the page structure.");
        return;
    }
    dashboardCards.forEach((card, index) => {
        const section = card.getAttribute("data-section");
        console.log(`DEBUG: Binding click handler for card ${index + 1}: ${section}`);
        card.removeEventListener("click", handleCardClick);
        card.addEventListener("click", handleCardClick);
        card.style.cursor = "pointer";
        card.style.pointerEvents = "auto";
        card.style.position = "relative";
        card.style.zIndex = "10";
        console.log(`DEBUG: Card ${section} listener attached`);
    });
}

function handleCardClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("DEBUG: Card clicked at", new Date().toLocaleString('en-ZA'), "Target:", event.target.tagName, "Card:", this);
    const section = this.getAttribute("data-section");
    console.log(`DEBUG: Card section: ${section}`);
    if (!section) {
        console.error("DEBUG: No data-section attribute found");
        displayErrorMessage("Navigation error: Invalid card section.");
        return;
    }
    navigateToSection(section);
}

function navigateToSection(section) {
    console.log(`DEBUG: Navigating to section: ${section}`);
    if (!auth.currentUser) {
        console.error("DEBUG: No authenticated user found, redirecting to SignIn.html");
        displayErrorMessage("No authenticated user. Redirecting to sign-in.");
        window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
        hideLoader();
        return;
    }
    auth.currentUser.getIdToken().then((idToken) => {
        console.log("DEBUG: ID token retrieved successfully");
        if (paths[section]) {
            showLoader();
            console.log(`DEBUG: Attempting navigation to ${paths[section]}`);
            const targetUrl = new URL(paths[section], window.location.origin).href;
            window.location.assign(targetUrl);
        } else {
            console.error(`DEBUG: Invalid section: ${section}`);
            displayErrorMessage("Navigation error: Section not found.");
            hideLoader();
        }
    }).catch((error) => {
        console.error("DEBUG: Error retrieving ID token:", error);
        displayErrorMessage("Authentication error. Please sign in again.");
        window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
        hideLoader();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM loaded for dashboard.js at', new Date().toLocaleString('en-ZA'));
    onAuthStateChanged(auth, (user) => {
        console.log('DEBUG: onAuthStateChanged in dashboard.js:', user ? { uid: user.uid, email: user.email, verified: user.emailVerified } : 'No user');
        if (user && user.emailVerified) {
            initializeDashboard();
        } else if (user && !user.emailVerified) {
            console.log('DEBUG: Email not verified, redirecting to VerifyEmail.html');
            window.location.href = '/LandingPage/SignInAndSignUp/VerifyEmail.html';
        } else {
            console.log('DEBUG: No user authenticated, redirecting to SignIn.html');
            window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
        }
    });
});