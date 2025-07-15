import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, JWTPayload } from '../types/auth';
import api from '../utils/api'; // Our axios instance

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Store token in AsyncStorage
  private async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('userToken', token);
  }

  // Get token from AsyncStorage
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('userToken');
  }

  // Remove token from AsyncStorage
  private async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('userToken');
  }

  // Decode JWT token (simplified for client-side, mainly for expiration check/roles)
  private decodeToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true; // Malformed or missing expiration
    }
    const currentTime = Date.now() / 1000; // in seconds
    return decoded.exp < currentTime;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      await this.setToken(token);
      await AsyncStorage.setItem('userData', JSON.stringify(user)); // Store user data too
      return user;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post('/auth/register', userData);
      // For registration, we typically just get a success message or the new user.
      // No token is usually returned on register unless auto-login is desired.
      // If your API returns a token on register, adjust this.
      return response.data.user; // Assuming your API returns { user: newUser, message: '...' }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // If your API has a /auth/logout endpoint to invalidate tokens on the server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call error (might be okay if token simply cleared):', error);
    } finally {
      await this.removeToken();
      await AsyncStorage.removeItem('userData');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/auth/profile', updates);
      const updatedUser = response.data;
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser)); // Update stored user data
      return updatedUser;
    } catch (error: any) {
      console.error('Profile update error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.post('/auth/change-password', passwordData);
    } catch (error: any) {
      console.error('Change password error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token || this.isTokenExpired(token)) {
        await this.removeToken();
        await AsyncStorage.removeItem('userData');
        return null;
      }
      
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        // Optimistically return stored user data, then refresh from API
        const user: User = JSON.parse(storedUserData);
        // Refresh token if needed or fetch updated profile
        api.get('/auth/me').then(response => {
          if (response.data) {
            AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
          }
        }).catch(err => console.error("Failed to refresh user data from API:", err));
        return user;
      }

      // If no stored user data, fetch from API
      const response = await api.get('/auth/me');
      if (response.data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      await this.removeToken(); // Clear token if fetching user fails
      await AsyncStorage.removeItem('userData');
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  async getUserRole(): Promise<'admin' | 'agent' | null> {
    const token = await this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  }
  
  // Google Account Connection - Requires a different approach for mobile
  // For web, window.open is used. For mobile, you'd typically use Expo WebBrowser
  // or a custom OAuth flow. This is a placeholder.
  async connectGoogleAccount(): Promise<string> {
    // This function will need significant adaptation for mobile.
    // It will likely involve:
    // 1. Getting an authorization URL from your Next.js backend for the mobile client.
    // 2. Opening that URL in Expo.WebBrowser.
    // 3. Handling the redirect back to your app with a code/token.
    // 4. Sending that code/token back to your Next.js backend to complete the connection.

    try {
      // Your backend should return a redirect URL for Google OAuth
      // On mobile, you will use Expo.WebBrowser to open this URL
      // And then handle the deep link back to your app after authentication.
      // This is a simplified example.
      const response = await api.get('/auth/google/connect-url'); // Your Next.js backend might expose such an endpoint
      const { authUrl } = response.data;
      if (!authUrl) {
        throw new Error("No Google auth URL provided by backend.");
      }
      // You will open this URL in Expo.WebBrowser and listen for redirects
      return authUrl; // Return the URL for the component to open
    } catch (error: any) {
      console.error('Google connect error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Google connection failed');
    }
  }

  async disconnectGoogleAccount(): Promise<void> {
    try {
      await api.post('/auth/google/disconnect');
    } catch (error: any) {
      console.error('Google disconnect error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Google disconnection failed');
    }
  }
}

export default AuthService;