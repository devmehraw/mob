import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Input } from '../../components/ui/Input'; // Assuming this Input component exists
import { Button } from '../../components/ui/Button'; // Assuming this Button component exists
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook exists
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme'; // Import your theme

const { height } = Dimensions.get('window'); // Get screen height for responsive scroll view

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth(); // Destructure login from useAuth hook

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors
    try {
      await login({ email, password });
      // Navigation is typically handled by AuthProvider's useEffect or App.tsx based on isAuthenticated state
    } catch (error: any) {
      // Set a user-friendly error message
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      // Show an alert for immediate feedback
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient // Background gradient for a modern look
      colors={[theme.colors.background.screen, theme.colors.background.dark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView // Ensures inputs are visible when keyboard is open
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.appName}>RealEstate CRM</Text> {/* Application Name */}
            <Text style={styles.tagline}>Your Gateway to Property Success</Text>
          </View>

          <View style={styles.card}> {/* Card-like container for the login form */}
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to your account</Text>

            {errorMessage && ( // Display error message if present
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input} // Apply specific input style if needed (Input component should handle most styling)
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword} // Toggle secure text entry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput} // Apply specific input style
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.togglePasswordButton}
                >
                  <Ionicons // Eye icon to show/hide password
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.text.light} // Use theme color for icon
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Log In"
              onPress={handleLogin}
              isLoading={isLoading} // Show loading spinner when logging in
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}> {/* "OR" divider for alternative login methods */}
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Placeholder for social login buttons (e.g., Google) */}
            <Button
              title="Sign In with Google"
              onPress={() => Alert.alert('Google Login', 'Coming Soon!')}
              variant="outline" // Assuming 'outline' variant for buttons
              icon={<Ionicons name="logo-google" size={20} color={theme.colors.primary} />} // Google icon
              style={styles.socialButton}
            />
          </View>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')} // Navigate to Register screen
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLinkHighlight}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color set by LinearGradient, but also a fallback
    backgroundColor: theme.colors.background.screen,
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Allows content to expand and be scrollable
    justifyContent: 'center',
    padding: theme.spacing.large,
    minHeight: height, // Ensure scroll view takes full height
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  appName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold', // Changed from theme.typography.fontWeight.bold
    color: theme.colors.primary, // Use primary color for app name
    marginBottom: theme.spacing.small,
  },
  tagline: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.background.card, // White card background
    borderRadius: theme.borderRadius, // Apply consistent border radius from theme
    padding: theme.spacing.large,
    ...theme.cardShadow, // Apply global card shadow from theme
    marginBottom: theme.spacing.xlarge,
  },
  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold', // Changed from theme.typography.fontWeight.bold
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: theme.colors.danger + '10', // Light red with 10% opacity
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.small,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: theme.spacing.medium,
  },
  label: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    marginBottom: theme.spacing.xsmall,
    fontWeight: '500', // Changed from theme.typography.fontWeight.medium
  },
  input: {
    // These styles are generally handled by your custom Input component.
    // Add overrides here if specific to LoginScreen inputs.
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: theme.spacing.xxlarge, // Make space for the eye icon
  },
  togglePasswordButton: {
    position: 'absolute',
    right: theme.spacing.medium,
    padding: theme.spacing.xsmall,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end', // Align to the right
    marginBottom: theme.spacing.large,
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary,
    fontWeight: '500', // Changed from theme.typography.fontWeight.medium
  },
  loginButton: {
    marginTop: theme.spacing.medium,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xlarge,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border, // Use theme border color
  },
  dividerText: {
    marginHorizontal: theme.spacing.medium,
    color: theme.colors.text.light,
    fontSize: theme.typography.fontSize.small,
    fontWeight: '500', // Changed from theme.typography.fontWeight.medium
  },
  socialButton: {
    marginTop: theme.spacing.small,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  registerText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
  },
  registerLinkHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold', // Changed from theme.typography.fontWeight.bold
  },
});

export default LoginScreen;