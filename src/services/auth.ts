// Simple authentication service using localStorage
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro'; // Default to 'free'
  password?: string; // Optional for OAuth users
  provider?: 'email' | 'google' | 'sso'; // Authentication provider
  createdAt: number;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

const STORAGE_KEY = 'loomin_users';
const CURRENT_USER_KEY = 'loomin_current_user';
const RESET_TOKENS_KEY = 'loomin_reset_tokens';

// Get all registered users
export const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Sign up a new user
export const signUp = (email: string, name: string, password: string): { success: boolean; message: string; user?: User } => {
  if (!email || !name || !password) {
    return { success: false, message: 'All fields are required' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  const users = getAllUsers();
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return { success: false, message: 'Email already registered' };
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    plan: 'free', // Default new users to free plan
    password, // In production, hash this!
    provider: 'email',
    createdAt: Date.now(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true, message: 'Account created successfully', user: newUser };
};

// Login user
export const login = (emailOrName: string, password: string): { success: boolean; message: string; user?: User } => {
  if (!emailOrName || !password) {
    return { success: false, message: 'Email and password are required' };
  }

  const users = getAllUsers();
  const user = users.find(u => (u.email === emailOrName || u.name === emailOrName) && u.password === password);

  if (!user) {
    return { success: false, message: 'Invalid email/name or password' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: 'Logged in successfully', user };
};

// Google OAuth login (mock implementation)
export const googleLogin = (googleEmail: string, googleName: string): { success: boolean; message: string; user?: User } => {
  if (!googleEmail || !googleName) {
    return { success: false, message: 'Google login failed' };
  }

  let users = getAllUsers();
  let user = users.find(u => u.email === googleEmail && u.provider === 'google');

  if (!user) {
    // Create new user from Google account
    user = {
      id: Math.random().toString(36).substr(2, 9),
      email: googleEmail,
      name: googleName,
      plan: 'free', // Default new users to free plan
      provider: 'google',
      createdAt: Date.now(),
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: 'Google login successful', user };
};

// SSO login (mock implementation)
export const ssoLogin = (ssoEmail: string, ssoName: string, ssoProvider: string = 'sso'): { success: boolean; message: string; user?: User } => {
  if (!ssoEmail || !ssoName) {
    return { success: false, message: 'SSO login failed' };
  }

  let users = getAllUsers();
  let user = users.find(u => u.email === ssoEmail && u.provider === 'sso');

  if (!user) {
    // Create new user from SSO account
    user = {
      id: Math.random().toString(36).substr(2, 9),
      email: ssoEmail,
      name: ssoName,
      plan: 'free', // Default new users to free plan
      provider: 'sso',
      createdAt: Date.now(),
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: 'SSO login successful', user };
};

// Request password reset
export const requestPasswordReset = (email: string): { success: boolean; message: string } => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, message: 'Email not found' };
  }

  if (!user.password) {
    return { success: false, message: 'This account uses social login. Cannot reset password.' };
  }

  // Generate reset token
  const resetToken = Math.random().toString(36).substr(2, 9);
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;

  const updatedUsers = getAllUsers().map(u => u.id === user.id ? user : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));

  // In production, send email with reset link
  localStorage.setItem(`reset_token_${resetToken}`, JSON.stringify({ email, token: resetToken, expiry: resetTokenExpiry }));

  return { success: true, message: `Password reset token generated: ${resetToken}. (In production, this would be sent via email)` };
};

// Reset password with token
export const resetPassword = (resetToken: string, newPassword: string): { success: boolean; message: string } => {
  if (!resetToken || !newPassword) {
    return { success: false, message: 'Reset token and new password are required' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  const tokenData = localStorage.getItem(`reset_token_${resetToken}`);
  if (!tokenData) {
    return { success: false, message: 'Invalid reset token' };
  }

  const { email, expiry } = JSON.parse(tokenData);

  if (Date.now() > expiry) {
    localStorage.removeItem(`reset_token_${resetToken}`);
    return { success: false, message: 'Reset token has expired' };
  }

  const users = getAllUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  localStorage.removeItem(`reset_token_${resetToken}`);

  return { success: true, message: 'Password reset successfully' };
};

// Get current logged-in user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};
