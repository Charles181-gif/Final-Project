import { authFallback } from './auth-fallback.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = authFallback.getCurrentUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  initProfileForm(user);
});

function initProfileForm(user) {
  const form = document.getElementById('profileForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const profilePicFile = formData.get('profilePic');
    
    const profileData = {
      full_name: formData.get('fullName'),
      age: formData.get('age'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      gender: formData.get('gender'),
      blood_type: formData.get('bloodType'),
      notifications: formData.get('notifications') === 'on'
    };
    
    // Handle profile picture
    if (profilePicFile && profilePicFile.size > 0) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profileData.profilePicture = e.target.result;
        saveProfileData(user, profileData);
      };
      reader.readAsDataURL(profilePicFile);
    } else {
      saveProfileData(user, profileData);
    }
  });
}

function saveProfileData(user, profileData) {
  // Update user profile in localStorage
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[user.email]) {
    users[user.email] = { ...users[user.email], ...profileData };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(users[user.email]));
  }
  
  // Redirect to dashboard
  window.location.href = 'dashboard.html';
}