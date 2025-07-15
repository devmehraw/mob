import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient'; // For background gradient
import { theme } from '../../theme'; // Import your theme

const { height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }:any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent' as 'admin' | 'agent', // Default role
    phone: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register } = useAuth();

  const handleChange = (name: string, value: string | 'admin' | 'agent') => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccessMessage('Registration successful! Please log in.');
      setFormData({ // Clear form after successful registration
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'agent',
        phone: '',
        department: '',
      });
      // Optionally navigate to login after a delay
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
      Alert.alert('Registration Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient // Added a subtle gradient background
      colors={[theme.colors.background.screen, theme.colors.background.dark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.appName}>Join RealEstate CRM</Text>
            <Text style={styles.tagline}>Create your account to get started</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Fill in your details</Text>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            {successMessage && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name<Text style={styles.required}>*</Text></Text>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
              <Input
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password<Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
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
              <Text style={styles.passwordHint}>Min 8 characters, 1 uppercase, 1 lowercase, 1 number.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password<Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.togglePasswordButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.text.light}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role<Text style={styles.required}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.role}
                  onValueChange={(itemValue) => handleChange('role', itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Agent" value="agent" />
                  <Picker.Item label="Admin" value="admin" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <Input
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department (Optional)</Text>
              <Input
                placeholder="e.g., Sales, Marketing"
                value={formData.department}
                onChangeText={(text) => handleChange('department', text)}
              />
            </View>

            <Button
              title="Register"
              onPress={handleSubmit}
              isLoading={isLoading}
              style={styles.registerButton}
            />
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLinkHighlight}>Log In</Text>
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
    backgroundColor: theme.colors.background.screen,
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.large,
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  appName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold', // Changed from theme.typography.fontWeight.bold
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  tagline: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.large,
    ...theme.cardShadow,
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
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: theme.colors.success + '10',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
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
  required: {
    color: theme.colors.danger,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: theme.spacing.xxlarge,
  },
  togglePasswordButton: {
    position: 'absolute',
    right: theme.spacing.medium,
    padding: theme.spacing.xsmall,
  },
  passwordHint: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.light,
    marginTop: theme.spacing.xsmall,
    marginLeft: theme.spacing.xsmall,
  },
  pickerContainer: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.card,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: { // Style for Picker.Item if needed (platform dependent)
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
  },
  registerButton: {
    marginTop: theme.spacing.medium,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  loginText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
  },
  loginLinkHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold', // Changed from theme.typography.fontWeight.bold
  },
});

export default RegisterScreen;