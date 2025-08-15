// Debug utilities for authentication
console.log('Auth debug loaded');

// Debug function to check stored data
window.debugAuth = function() {
  console.log('=== AUTH DEBUG ===');
  console.log('Users:', JSON.parse(localStorage.getItem('ghanahealth_users') || '[]'));
  console.log('Current User:', JSON.parse(localStorage.getItem('ghanahealth_current_user') || 'null'));
  console.log('==================');
};

// Clear all auth data
window.clearAuthData = function() {
  localStorage.removeItem('ghanahealth_users');
  localStorage.removeItem('ghanahealth_current_user');
  console.log('Auth data cleared');
};