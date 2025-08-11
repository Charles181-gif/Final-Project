// Patient-only login
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function() {
  initPasswordToggle();
  initLoginForm();
});

function initPasswordToggle() {
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  if (!passwordToggle || !passwordInput) return;

  const toggleIcon = passwordToggle.querySelector('i');
  passwordToggle.addEventListener('click', function() {
    const asText = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', asText ? 'text' : 'password');
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
  });
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    window.utils.hideError('errorMessage');
    window.utils.showLoading(submitButton);

    try {
      const formData = new FormData(form);
      const email = formData.get('email')?.trim();
      const password = formData.get('password');
      const rememberMe = formData.get('rememberMe');

      if (!email || !password) {
        window.utils.showError('errorMessage', 'Please enter both email and password.');
        return;
      }
      if (!window.utils.validateEmail(email)) {
        window.utils.showError('errorMessage', 'Please enter a valid email address.');
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ensure user doc exists and is patient
      const userDocSnap = await getDoc(doc(db, 'users', user.uid));
      if (!userDocSnap.exists()) {
        // First-time login without profile → go to profile setup
        window.location.href = 'profile-setup.html';
        return;
      }
      const userDoc = userDocSnap.data();
      if (userDoc.userType && userDoc.userType !== 'patient') {
        window.utils.showError('errorMessage', 'Only patient accounts can sign in here.');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Optionally store profile in session for quick access
      sessionStorage.setItem('userProfile', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userDoc
      }));

      window.utils.showSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } catch (error) {
      console.error('Login error:', error);
      window.utils.showError('errorMessage', 'Login failed. Please check your credentials.');
    } finally {
      window.utils.hideLoading(submitButton);
    }
  });

  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    const rm = document.getElementById('rememberMe');
    if (rm) rm.checked = true;
  }
}
