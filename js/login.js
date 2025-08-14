// Patient-only login
import { supabase } from './supabase-config.js';
import { authFallback } from './auth-fallback.js';

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

      let user, userDoc;
      
      // Use fallback authentication by default
      try {
        console.log('Using fallback authentication system');
        const fallbackResult = await authFallback.signIn(email, password);
        user = fallbackResult.user;
      } catch (fallbackError) {
        // If fallback fails, try Supabase as backup
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          user = data.user;
        } catch (supabaseError) {
          throw new Error('Invalid email or password');
        }
      }

      // Check if user document exists (skip for fallback users)
      if (user.id && user.id.startsWith('user_')) {
        // Fallback user - use stored data
        userDoc = user;
      } else {
        // Supabase user - fetch from database
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!userError && userData) {
            userDoc = userData;
            // Check if user type is restricted
            if (userDoc.user_type && userDoc.user_type !== 'patient') {
              window.utils.showError('errorMessage', 'Only patient accounts can sign in here.');
              return;
            }
          }
        } catch (docError) {
          console.warn('Could not fetch user document:', docError);
          // Continue with login even if document fetch fails
        }
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Store profile in session for quick access
      const profileData = {
        id: user.id,
        email: user.email,
        displayName: userDoc?.full_name || user.email.split('@')[0],
        ...(userDoc || {})
      };
      sessionStorage.setItem('userProfile', JSON.stringify(profileData));

      window.utils.showSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = 'profile-setup.html';
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Provide more specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      window.utils.showError('errorMessage', errorMessage);
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
