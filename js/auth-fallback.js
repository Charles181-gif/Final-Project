// Authentication fallback system
class AuthFallback {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('ghanahealth_current_user') || 'null');
  }

  async signUp(email, password, metadata = {}) {
    // Check if user already exists
    if (this.users.find(user => user.email === email)) {
      throw new Error('User already exists with this email');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed
      ...metadata,
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    localStorage.setItem('ghanahealth_users', JSON.stringify(this.users));
    
    return { user: newUser, error: null };
  }

  async signIn(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = user;
    localStorage.setItem('ghanahealth_current_user', JSON.stringify(user));
    
    return { user, error: null };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('ghanahealth_current_user');
    return { error: null };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

export const authFallback = new AuthFallback();