import { authFallback } from './auth-fallback.js';

document.addEventListener('DOMContentLoaded', function() {
  initPasswordToggle();
  initLoginForm();
});

function initPasswordToggle() {
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      passwordToggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    const email = form.email.value.trim();
    const password = form.password.value;
    
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    showLoading(submitButton);
    hideError();
    
    try {
      await authFallback.signIn(email, password);
      showSuccess('Login successful!');
      setTimeout(() => window.location.href = 'profile-setup.html', 1000);
    } catch (error) {
      showError('Invalid email or password');
    } finally {
      hideLoading(submitButton);
    }
  });
}

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function hideError() {
  const errorEl = document.getElementById('errorMessage');
  if (errorEl) errorEl.style.display = 'none';
}

function showSuccess(message) {
  const successEl = document.getElementById('successMessage');
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
}

function showLoading(button) {
  if (button) {
    button.disabled = true;
    const text = button.querySelector('.btn-text');
    const loading = button.querySelector('.btn-loading');
    if (text) text.style.display = 'none';
    if (loading) loading.style.display = 'inline-flex';
  }
}

function hideLoading(button) {
  if (button) {
    button.disabled = false;
    const text = button.querySelector('.btn-text');
    const loading = button.querySelector('.btn-loading');
    if (text) text.style.display = 'inline';
    if (loading) loading.style.display = 'none';
  }
}