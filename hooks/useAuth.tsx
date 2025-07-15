import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';
import AuthService from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen'; // Import SplashScreen

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<void>;
  connectGoogleAccount: () => Promise<void>;
  disconnectGoogleAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const authService = AuthService.getInstance();

  const initializeAuth = useCallback(async () => {
    try {
      // Keep splash screen visible until we determine auth state
      await SplashScreen.preventAutoHideAsync();

      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let isAuthenticated = await authService.isAuthenticated();
      let user: User | null = null;

      if (isAuthenticated) {
        user = await authService.getCurrentUser();
        // Ensure user is not null even if isAuthenticated is true (e.g., token valid but user data fetch failed)
        if (!user) {
          await authService.logout(); // Force logout if user data is somehow missing
          isAuthenticated = false;
        }
      }

      setAuthState({
        user,
        isAuthenticated,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error.message || 'Failed to initialize authentication',
      }));
      await AsyncStorage.clear(); // Ensure all auth data is cleared on error
    } finally {
      // Hide splash screen once auth state is determined
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.login(credentials);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.register(userData);
      // After successful registration, you might want to auto-login or redirect to login screen
      setAuthState(prev => ({ ...prev, isLoading: false, error: null })); // Just update loading state
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Logout failed',
      }));
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedUser = await authService.updateProfile(updates);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed',
      }));
      throw error;
    }
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.changePassword(passwordData);
      setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Change password failed',
      }));
      throw error;
    }
  };

  const connectGoogleAccount = async () => {
    try {
      // This will return the Google OAuth URL from your backend
      const authUrl = await authService.connectGoogleAccount();
      // On mobile, you open this URL using Expo.WebBrowser
      // You'll need to listen for the redirect back to your app
      // and then send the result (e.g., code) back to your backend.
      // This part is more complex and depends on Google's mobile OAuth flow.
      // For now, we'll just log the URL.
      console.log("Google Auth URL for mobile:", authUrl);
      // Example: Linking.openURL(authUrl); or WebBrowser.openBrowserAsync(authUrl);
      // You'd then set up deep linking in app.json and handle the redirect.
      // For this example, we'll keep it simple and assume the backend handles most of it.
      await refreshUser(); // Refresh user data after potential connection
    } catch (error: any) {
      console.error('Google connect error:', error);
      throw error;
    }
  };

  const disconnectGoogleAccount = async () => {
    try {
      await authService.disconnectGoogleAccount();
      await refreshUser();
    } catch (error: any) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.getCurrentUser();
      setAuthState(prev => ({ ...prev, user, isLoading: false, isAuthenticated: !!user }));
    } catch (error: any) {
      console.error('Refresh user error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || 'Failed to refresh user' }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        connectGoogleAccount,
        disconnectGoogleAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}