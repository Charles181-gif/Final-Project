// Patient-only registration
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initRegistrationForm();
});

function initPasswordToggles() {
  const passwordToggle = document.getElementById('passwordToggle');
  const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  if (passwordToggle) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = password.getAttribute('type') === 'password';
      password.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggle.querySelector('i').classList.toggle('fa-eye');
      passwordToggle.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }

  if (confirmPasswordToggle) {
    confirmPasswordToggle.addEventListener('click', () => {
      const isPassword = confirmPassword.getAttribute('type') === 'password';
      confirmPassword.setAttribute('type', isPassword ? 'text' : 'password');
      confirmPasswordToggle.querySelector('i').classList.toggle('fa-eye');
      confirmPasswordToggle.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }
}

function initRegistrationForm() {
  const form = document.getElementById('registerForm');
  const submitButton = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('errorMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    hideError(errorEl);
    showLoading(submitButton);

    try {
      const formData = new FormData(form);
      const name = formData.get('name')?.trim();
      const email = formData.get('email')?.trim();
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      const terms = formData.get('terms');

      // Basic validations
      if (!name || !email || !password || !confirmPassword) {
        return showFail('Please fill in all required fields.', submitButton, errorEl);
      }
      if (!validateEmail(email)) {
        return showFail('Please enter a valid email address.', submitButton, errorEl);
      }
      if (password.length < 10) {
        return showFail('Password must be at least 10 characters long.', submitButton, errorEl);
      }
      if (password !== confirmPassword) {
        return showFail('Passwords do not match.', submitButton, errorEl);
      }
      if (!terms) {
        return showFail('You must agree to the Terms & Conditions.', submitButton, errorEl);
      }

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create minimal patient profile document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        fullName: name,
        userType: 'patient',
        createdAt: serverTimestamp(),
        active: true
      });

      // Redirect to login after successful registration
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      if (error?.code === 'auth/email-already-in-use') message = 'An account with this email already exists.';
      if (error?.code === 'auth/weak-password') message = 'Password is too weak.';
      if (error?.code === 'auth/invalid-email') message = 'Invalid email address.';
      showError(errorEl, message);
    } finally {
      hideLoading(submitButton);
    }
  });
}

// Helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showLoading(button) {
  if (!button) return;
  button.classList.add('loading');
  button.disabled = true;
  const btnText = button.querySelector('.btn-text');
  const btnLoading = button.querySelector('.btn-loading');
  if (btnText) btnText.style.display = 'none';
  if (btnLoading) btnLoading.style.display = 'inline-flex';
}

function hideLoading(button) {
  if (!button) return;
  button.classList.remove('loading');
  button.disabled = false;
  const btnText = button.querySelector('.btn-text');
  const btnLoading = button.querySelector('.btn-loading');
  if (btnText) btnText.style.display = 'inline';
  if (btnLoading) btnLoading.style.display = 'none';
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
}

function hideError(el) {
  if (!el) return;
  el.style.display = 'none';
}

function showFail(message, button, errorEl) {
  showError(errorEl, message);
  hideLoading(button);
  return false;
}
