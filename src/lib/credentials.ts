/**
 * Credentials Service
 * Centralized location for managing authentication credentials
 */

interface CredentialsState {
  email: string;
  password: string;
  passwordHistory: string[];
  resetAttempts: number;
}

type CredentialsListener = () => void;

const state: CredentialsState = {
  email: 'worker2847@chronolog.corp',
  password: 'Compliance2024!',
  passwordHistory: [],
  resetAttempts: 0,
};

const listeners: Set<CredentialsListener> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
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
    notifyListeners();
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
    notifyListeners();
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
   * Get the number of reset attempts
   */
  getResetAttempts: (): number => state.resetAttempts,
  
  /**
   * Increment reset attempts counter
   */
  incrementResetAttempts: (): void => {
    state.resetAttempts += 1;
  },
  
  /**
   * Reset the reset attempts counter
   */
  resetResetAttempts: (): void => {
    state.resetAttempts = 0;
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
  
  /**
   * Subscribe to credential changes
   * Returns an unsubscribe function
   */
  subscribe: (listener: CredentialsListener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

