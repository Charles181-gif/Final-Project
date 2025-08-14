// Fallback authentication system for development
export const authFallback = {
  async signUp(email, password, userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists in localStorage
    const existingUsers = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
    const userExists = existingUsers.find(user => user.email === email);
    
    if (userExists) {
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const newUser = {
      id: 'user_' + Date.now(),
      email,
      full_name: userData.full_name,
      user_type: 'patient',
      created_at: new Date().toISOString(),
      active: true
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('ghanahealth_users', JSON.stringify(existingUsers));
    
    return { user: newUser, error: null };
  },
  
  async signIn(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUsers = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
    const user = existingUsers.find(user => user.email === email);
    
    if (!user) {
      throw new Error('No user found with this email');
    }
    
    // Store current user session
    localStorage.setItem('ghanahealth_current_user', JSON.stringify(user));
    
    return { user, error: null };
  },
  
  async getCurrentUser() {
    const currentUser = localStorage.getItem('ghanahealth_current_user');
    return currentUser ? JSON.parse(currentUser) : null;
  },
  
  async signOut() {
    localStorage.removeItem('ghanahealth_current_user');
    return { error: null };
  }
};