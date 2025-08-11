// forgot-password.js

import { auth } from "./firebase-config.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const successMessageEl = document.getElementById("successMessage");
const errorMessageEl = document.getElementById("errorMessage");
const btnText = form.querySelector(".btn-text");
const btnLoading = form.querySelector(".btn-loading");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) return;

    // Reset messages
    successMessageEl.style.display = "none";
    errorMessageEl.style.display = "none";

    // Show loading
    btnText.style.display = "none";
    btnLoading.style.display = "inline-flex";

    try {
        await sendPasswordResetEmail(auth, email);
        successMessageEl.textContent = "Password reset link sent to your email.";
        successMessageEl.style.display = "block";
        emailInput.value = "";
    } catch (error) {
        console.error("Error sending reset email:", error);
        errorMessageEl.textContent = error.message || "Failed to send reset link.";
        errorMessageEl.style.display = "block";
    } finally {
        // Hide loading
        btnText.style.display = "inline-flex";
        btnLoading.style.display = "none";
    }
});
