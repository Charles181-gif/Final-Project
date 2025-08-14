import { authFallback } from './auth-fallback.js';

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initRegistrationForm();
});

function initPasswordToggles() {
  const toggles = ['passwordToggle', 'confirmPasswordToggle'];
  const inputs = ['password', 'confirmPassword'];
  
  toggles.forEach((toggleId, index) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputs[index]);
    
    if (toggle && input) {
      toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      });
    }
  });
}

function initRegistrationForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const terms = form.terms.checked;
    
    if (!name || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    if (!terms) {
      showError('Please accept the terms and conditions');
      return;
    }
    
    showLoading(submitButton);
    hideError();
    
    try {
      await authFallback.signUp(email, password, { full_name: name });
      showSuccess('Account created successfully!');
      form.reset();
      setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (error) {
      showError(error.message);
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

window.showTermsAndConditions = function() {
  alert('Terms & Conditions: By using GhanaHealth+, you agree to our terms of service and privacy policy.');
};