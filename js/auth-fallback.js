// Fallback authentication system for development
export const authFallback = {
  async signUp(email, password, userData) {
    console.log('Fallback signUp called for:', email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
      const userExists = existingUsers.find(user => user.email === email);
      
      if (userExists) {
        throw new Error('User already registered with this email');
      }
      
      // Create new user
      const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        email,
        full_name: userData.full_name || 'User',
        user_type: 'patient',
        created_at: new Date().toISOString(),
        active: true
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('ghanahealth_users', JSON.stringify(existingUsers));
      
      console.log('User created successfully:', newUser.id);
      return { user: newUser, error: null };
    } catch (error) {
      console.error('Fallback signUp error:', error);
      throw error;
    }
  },
  
  async signIn(email, password) {
    console.log('Fallback signIn called for:', email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const existingUsers = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
      const user = existingUsers.find(user => user.email === email);
      
      if (!user) {
        throw new Error('No account found with this email address');
      }
      
      // Store current user session
      localStorage.setItem('ghanahealth_current_user', JSON.stringify(user));
      
      console.log('User signed in successfully:', user.id);
      return { user, error: null };
    } catch (error) {
      console.error('Fallback signIn error:', error);
      throw error;
    }
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