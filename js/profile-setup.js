import { supabase } from './supabase-config.js';
import { authFallback } from './auth-fallback.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check fallback auth first
  let user = await authFallback.getCurrentUser();
  
  if (!user) {
    // Try Supabase as backup
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      user = supabaseUser;
    } catch (error) {
      console.log('Supabase auth check failed:', error.message);
    }
  }
  
  if (!user) {
    window.location.href = 'login.html';
  } else {
    initProfileForm(user);
  }
});

function initProfileForm(user) {
  const form = document.getElementById('profileForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const age = parseInt(document.getElementById('age').value.trim(), 10);
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value;
    const gender = document.getElementById('gender').value;
    const bloodType = document.getElementById('bloodType').value;
    const notifications = document.getElementById('notifications').checked;
    const file = document.getElementById('profilePic').files[0];

    let avatarUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });
      
      if (!uploadError) {
        const { data } = supabase.storage
          .from('profiles')
          .getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }
    }

    const profileData = {
      full_name: fullName,
      age,
      phone,
      location,
      gender,
      blood_type: bloodType || null,
      notifications: !!notifications,
      avatar_url: avatarUrl,
      user_type: 'patient',
      updated_at: new Date().toISOString()
    };

    // Save to localStorage for fallback users
    if (user.id && user.id.startsWith('user_')) {
      const users = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        localStorage.setItem('ghanahealth_users', JSON.stringify(users));
        localStorage.setItem('ghanahealth_current_user', JSON.stringify(users[userIndex]));
      }
    } else {
      // Try Supabase for non-fallback users
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      }
    }
    
    // Always redirect to dashboard after profile setup
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}
