/**
 * Credentials Service
 * Centralized location for managing authentication credentials
 */

interface CredentialsState {
  email: string;
  password: string;
  passwordHistory: string[];
}

const state: CredentialsState = {
  email: 'worker2847@chronolog.corp',
  password: 'Compliance2024!',
  passwordHistory: [],
};

export const credentials = {
  /**
   * Get the valid username/email
   */
  getEmail: (): string => state.email,
  
  /**
   * Get the valid password
   */
  getPassword: (): string => state.password,
  
  /**
   * Get password history
   */
  getPasswordHistory: (): readonly string[] => [...state.passwordHistory],
  
  /**
   * Set a new email
   */
  setEmail: (newEmail: string): void => {
    state.email = newEmail;
  },
  
  /**
   * Set a new password (automatically adds current password to history)
   */
  setPassword: (newPassword: string): void => {
    // Add current password to history before changing it
    if (state.password && !state.passwordHistory.includes(state.password)) {
      state.passwordHistory.push(state.password);
    }
    state.password = newPassword;
  },
  
  /**
   * Check if a password has been used before
   */
  isPasswordInHistory: (password: string): boolean => {
    return state.passwordHistory.includes(password) || state.password === password;
  },
  
  /**
   * Clear password history
   */
  clearPasswordHistory: (): void => {
    state.passwordHistory = [];
  },
  
  /**
   * Validate credentials
   */
  validate: (email: string, password: string): boolean => {
    return email === state.email && password === state.password;
  },
  
  /**
   * Get formatted login info for display
   */
  getLoginInfo: (): string => `🔐 Login Info:\nEmail: ${state.email}\nPassword: ${state.password}`,
};

