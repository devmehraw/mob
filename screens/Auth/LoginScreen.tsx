import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Input } from '../../components/ui/Input'; // Assuming this Input component exists
import { Button } from '../../components/ui/Button'; // Assuming this Button component exists
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook exists
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme'; // Import your theme
import { AnimatedCard } from '../../components/ui/AnimatedCard';

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
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <AnimatedCard style={styles.headerCard} animationType="fadeIn" delay={200}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name="home" size={50} color={theme.colors.primary} />
                </View>
                <Text style={styles.appName}>RealEstate CRM</Text>
                <Text style={styles.tagline}>Your Gateway to Property Success</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard style={styles.card} animationType="slideInFromLeft" delay={400}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Log in to your account</Text>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="mail-outline" size={16} color={theme.colors.text.medium} /> Email
                </Text>
                <Input
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  error={!!errorMessage}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.colors.text.medium} /> Password
                </Text>
                <View style={styles.passwordContainer}>
                  <Input
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.passwordInput}
                    error={!!errorMessage}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.togglePasswordButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.colors.text.light}
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
                isLoading={isLoading}
                style={styles.loginButton}
                icon={<Ionicons name="log-in-outline" size={20} color={theme.colors.text.white} />}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Sign In with Google"
                onPress={() => Alert.alert('Google Login', 'Coming Soon!')}
                variant="outline"
                icon={<Ionicons name="logo-google" size={20} color={theme.colors.primary} />}
                style={styles.socialButton}
              />
            </AnimatedCard>

            <AnimatedCard style={styles.registerLinkCard} animationType="fadeIn" delay={600}>
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.registerLinkHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </AnimatedCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Allows content to expand and be scrollable
    padding: theme.spacing.large,
    minHeight: height, // Ensure scroll view takes full height
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: theme.spacing.large,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    ...theme.shadows.medium,
  },
  appName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  tagline: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: theme.spacing.xlarge,
    ...theme.shadows.large,
  },
  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger + '10',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.small,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  inputGroup: {
    marginBottom: theme.spacing.medium,
  },
  label: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    marginBottom: theme.spacing.xsmall,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
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
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.medium,
    color: theme.colors.text.light,
    fontSize: theme.typography.fontSize.small,
    fontWeight: '500',
  },
  socialButton: {
    marginTop: theme.spacing.small,
  },
  registerLinkCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: theme.spacing.medium,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
  },
  registerLinkHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;