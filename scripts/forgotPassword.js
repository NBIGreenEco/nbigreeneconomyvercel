import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.firebasestorage.app",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById("email");
const resetBtn = document.getElementById("reset-btn");
const errorMessage = document.getElementById("error-message");

resetBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  errorMessage.classList.add("hidden");

  if (!email) {
    errorMessage.textContent = "Please enter your email address.";
    errorMessage.classList.remove("hidden");
    return;
  }

  try {
    /*await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + "/SignIn.html"
    });
    */
    await sendPasswordResetEmail(auth, email);


    errorMessage.textContent =
      "Password reset email sent. Please check your inbox.";
    errorMessage.style.color = "#16a34a"; 
    errorMessage.classList.remove("hidden");

    setTimeout(() => {
    window.location.href = "SignIn.html";
    }, 900);

  } catch (err) {
    errorMessage.textContent = err.message;
    errorMessage.style.color = "#dc2626"; // red
    errorMessage.classList.remove("hidden");
  }
});
