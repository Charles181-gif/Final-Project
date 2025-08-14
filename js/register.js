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
  if (!form) return;
  
  const submitButton = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('errorMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    window.utils.hideError('errorMessage');
    window.utils.showLoading(submitButton);

    try {
      const formData = new FormData(form);
      const name = formData.get('name')?.trim();
      const email = formData.get('email')?.trim();
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
      const terms = formData.get('terms');

      // Basic validations
      if (!name || !email || !password || !confirmPassword) {
        window.utils.showError('errorMessage', 'Please fill in all required fields.');
        window.utils.hideLoading(submitButton);
        return;
      }
      if (!window.utils.validateEmail(email)) {
        window.utils.showError('errorMessage', 'Please enter a valid email address.');
        window.utils.hideLoading(submitButton);
        return;
      }
      if (password.length < 6) {
        window.utils.showError('errorMessage', 'Password must be at least 6 characters long.');
        window.utils.hideLoading(submitButton);
        return;
      }
      if (password !== confirmPassword) {
        window.utils.showError('errorMessage', 'Passwords do not match.');
        window.utils.hideLoading(submitButton);
        return;
      }
      if (!terms) {
        window.utils.showError('errorMessage', 'You must agree to the Terms & Conditions.');
        window.utils.hideLoading(submitButton);
        return;
      }

      try {
        // Use fallback authentication by default
        console.log('Using fallback authentication system');
        const fallbackResult = await authFallback.signUp(email, password, { full_name: name });
        
        window.utils.showSuccess('Account created successfully! Redirecting to login...');
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
        
        window.utils.showSuccess('Account created successfully! Redirecting to login...');
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
      window.utils.showError('errorMessage', message);
    } finally {
      window.utils.hideLoading(submitButton);
    }
  });
}

// Terms and conditions popup
window.showTermsAndConditions = function() {
  const content = `
<h3>Terms & Conditions</h3>
<div style="max-height: 400px; overflow-y: auto; text-align: left;">
<h4>1. Acceptance of Terms</h4>
<p>By using GhanaHealth+, you agree to these terms and conditions.</p>

<h4>2. Medical Disclaimer</h4>
<p>Our platform provides health information and connects you with healthcare providers. It does not replace professional medical advice.</p>

<h4>3. User Responsibilities</h4>
<p>• Provide accurate health information<br>
• Respect healthcare providers<br>
• Pay for services as agreed</p>

<h4>4. Privacy & Data</h4>
<p>We protect your health data according to Ghana's Data Protection Act and international standards.</p>

<h4>5. Service Availability</h4>
<p>We strive for 24/7 availability but cannot guarantee uninterrupted service.</p>

<h4>6. Limitation of Liability</h4>
<p>GhanaHealth+ is not liable for medical outcomes. Always seek emergency care when needed.</p>
</div>
  `;
  showPolicyPopup('Terms & Conditions', content);
};

function showPolicyPopup(title, content) {
  const popup = document.createElement('div');
  popup.className = 'policy-popup-overlay';
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  popup.innerHTML = `
    <div class="policy-popup" style="
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    ">
      <div class="policy-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="margin: 0;">${title}</h2>
        <button class="close-btn" onclick="closePolicyPopup()" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">&times;</button>
      </div>
      <div class="policy-content">
        ${content}
      </div>
      <div class="policy-footer" style="margin-top: 1rem; text-align: center;">
        <button class="btn btn-primary" onclick="closePolicyPopup()" style="
          background: #2da44e;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">I Understand</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  document.body.style.overflow = 'hidden';
}

window.closePolicyPopup = function() {
  const popup = document.querySelector('.policy-popup-overlay');
  if (popup) {
    popup.remove();
    document.body.style.overflow = '';
  }
};
