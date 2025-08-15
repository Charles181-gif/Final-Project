// Authentication check for protected pages
import { authFallback } from './auth-fallback.js';

// Check if user is authenticated
function checkAuth() {
  const currentUser = authFallback.getCurrentUser();
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
});

export { checkAuth };