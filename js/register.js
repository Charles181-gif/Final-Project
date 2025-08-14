// Patient-only registration
import { supabase } from './supabase-config.js';
import { authFallback } from './auth-fallback.js';

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

      try {
        // Use fallback authentication by default
        console.log('Using fallback authentication system');
        const fallbackResult = await authFallback.signUp(email, password, { full_name: name });
        
        showSuccess('Account created successfully! Redirecting to login...');
        form.reset();
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        return;
      } catch (fallbackError) {
        // If fallback fails, try Supabase as backup
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          });

          if (error) throw error;

        const user = data.user;

        // Create minimal patient profile document
        if (user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email,
              full_name: name,
              user_type: 'patient',
              created_at: new Date().toISOString(),
              active: true
            });
          
          if (insertError) {
            console.warn('Could not create user profile:', insertError);
          }
        }
        
        showSuccess('Account created successfully! Redirecting to login...');
        form.reset();
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        
      } catch (signUpError) {
        throw signUpError;
      }
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      if (error?.message?.includes('already registered')) message = 'An account with this email already exists.';
      if (error?.message?.includes('Password should be')) message = 'Password is too weak.';
      if (error?.message?.includes('Invalid email')) message = 'Invalid email address.';
      if (error?.message?.includes('captcha')) message = 'Registration temporarily unavailable. Please try again later.';
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

function showSuccess(message) {
  // Create success notification
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 300px;
  `;
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 5000);
}
