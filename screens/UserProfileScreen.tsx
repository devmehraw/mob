// screens/UserProfileScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, Button as RNButton, ScrollView, Alert, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { User, ChangePasswordData } from '../types/auth'; // Ensure these types are correctly imported
import { Input } from '../components/ui/Input'; // Assuming you have a basic Input component
import { Picker } from '@react-native-picker/picker'; // For theme selection
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button'; // Import your custom Button component
import { theme } from '../theme'; // Import the theme

const UserProfileScreen = () => {
  const { user, logout, updateProfile, changePassword, connectGoogleAccount, disconnectGoogleAccount, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Update State
  const [profileFormData, setProfileFormData] = React.useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '', // Email is usually not editable
    phone: user?.phone || '',
    department: user?.department || '',
    // Ensure preferences are fully initialized with defaults if user?.preferences is undefined
    preferences: user?.preferences || {
      theme: 'system',
      notifications: { email: true, push: true, leadUpdates: true, taskReminders: true },
      dashboard: { defaultView: 'leads', leadsPerPage: 10 },
    },
  });

  // Password Change State
  const [passwordFormData, setPasswordFormData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);

  const [profileChangesMade, setProfileChangesMade] = React.useState(false);

  // Effect to track changes in profileFormData for button enabling
  React.useEffect(() => {
    if (!user) return; // Cannot compare if user is null

    const hasChanges =
      profileFormData.name !== user.name ||
      profileFormData.phone !== user.phone ||
      profileFormData.department !== user.department ||
      profileFormData.preferences?.theme !== user.preferences.theme ||
      profileFormData.preferences?.notifications?.email !== user.preferences.notifications.email ||
      profileFormData.preferences?.notifications?.push !== user.preferences.notifications.push ||
      profileFormData.preferences?.notifications?.leadUpdates !== user.preferences.notifications.leadUpdates ||
      profileFormData.preferences?.notifications?.taskReminders !== user.preferences.notifications.taskReminders ||
      profileFormData.preferences?.dashboard?.defaultView !== user.preferences.dashboard.defaultView ||
      profileFormData.preferences?.dashboard?.leadsPerPage !== user.preferences.dashboard.leadsPerPage;

    setProfileChangesMade(hasChanges);
  }, [profileFormData, user]);

  const handleProfileChange = (name: keyof Partial<User>, value: string) => {
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (category: 'theme' | 'notifications' | 'dashboard', key: string, value: any) => {
    setProfileFormData(prev => {
      // Ensure preferences object exists, provide default if not
      const currentPreferences = prev.preferences || {
        theme: 'system',
        notifications: { email: true, push: true, leadUpdates: true, taskReminders: true },
        dashboard: { defaultView: 'leads', leadsPerPage: 10 },
      };

      let updatedPreferences = { ...currentPreferences };

      if (category === 'theme') {
        // Directly update the theme
        updatedPreferences.theme = value;
      } else {
        // For nested categories like 'notifications' or 'dashboard'
        // Ensure the sub-category object exists, provide default if not
        const currentCategoryPreferences = (currentPreferences as any)[category] || {}; // Use 'any' to access dynamically

        updatedPreferences = {
          ...updatedPreferences,
          [category]: {
            ...currentCategoryPreferences,
            [key]: value,
          },
        };
      }

      return {
        ...prev,
        preferences: updatedPreferences,
      };
    });
  };


  const handlePasswordChange = (name: keyof typeof passwordFormData, value: string) => {
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async () => {
    setIsSubmitting(true);
    setProfileMessage(null);
    try {
      if (user) {
        await updateProfile(profileFormData);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser(); // Fetch latest user data
      }
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
      console.error('Profile update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    setIsSubmitting(true);
    setPasswordMessage(null);
    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsSubmitting(false);
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      // Clear password fields
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password.' });
      console.error('Password change failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsSubmitting(true);
    try {
      await connectGoogleAccount();
      Alert.alert('Google Account Connected', 'Your Google account has been successfully linked.');
      await refreshUser(); // To update UI with connected status
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Could not connect Google account.');
      console.error('Google connect error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setIsSubmitting(true);
    try {
      await disconnectGoogleAccount();
      Alert.alert('Google Account Disconnected', 'Your Google account has been unlinked.');
      await refreshUser(); // To update UI with disconnected status
    } catch (error: any) {
      Alert.alert('Disconnection Failed', error.message || 'Could not disconnect Google account.');
      console.error('Google disconnect error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      {profileMessage && (
        <View style={[styles.messageBox, profileMessage.type === 'error' ? styles.errorBox : styles.successBox]}>
          <Text style={profileMessage.type === 'error' ? styles.errorText : styles.successText}>{profileMessage.text}</Text>
        </View>
      )}

      {passwordMessage && (
        <View style={[styles.messageBox, passwordMessage.type === 'error' ? styles.errorBox : styles.successBox]}>
          <Text style={passwordMessage.type === 'error' ? styles.errorText : styles.successText}>{passwordMessage.text}</Text>
        </View>
      )}

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <Input
            value={profileFormData.name}
            onChangeText={(text) => handleProfileChange('name', text)}
            placeholder="Your Name"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Not Editable)</Text>
          <Input
            value={profileFormData.email}
            editable={false} // Email typically not editable via profile screen
            placeholder="Your Email"
            style={{ backgroundColor: theme.colors.background.dark }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <Input
            value={profileFormData.phone}
            onChangeText={(text) => handleProfileChange('phone', text)}
            keyboardType="phone-pad"
            placeholder="Your Phone Number"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department</Text>
          <Input
            value={profileFormData.department}
            onChangeText={(text) => handleProfileChange('department', text)}
            placeholder="Your Department (Optional)"
            editable={!isSubmitting}
          />
        </View>

        <Button
          title={isSubmitting ? 'Updating...' : 'Update Profile'}
          onPress={handleProfileUpdate}
          isLoading={isSubmitting}
          disabled={isSubmitting || !profileChangesMade}
          style={styles.saveButton}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Account Preferences</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profileFormData.preferences?.theme || 'system'}
              onValueChange={(itemValue) => handlePreferenceChange('theme', 'theme', itemValue as 'light' | 'dark' | 'system')}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="System Default" value="system" />
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Dark" value="dark" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notifications</Text>
          <View>
            <Checkbox
              label="Email Notifications"
              value={profileFormData.preferences?.notifications?.email || false}
              onValueChange={(newValue) =>
                handlePreferenceChange('notifications', 'email', newValue)
              }
              disabled={isSubmitting}
            />
            <Checkbox
              label="Push Notifications"
              value={profileFormData.preferences?.notifications?.push || false}
              onValueChange={(newValue) =>
                handlePreferenceChange('notifications', 'push', newValue)
              }
              disabled={isSubmitting}
            />
            <Checkbox
              label="Lead Updates"
              value={profileFormData.preferences?.notifications?.leadUpdates || false}
              onValueChange={(newValue) =>
                handlePreferenceChange('notifications', 'leadUpdates', newValue)
              }
              disabled={isSubmitting}
            />
            <Checkbox
              label="Task Reminders"
              value={profileFormData.preferences?.notifications?.taskReminders || false}
              onValueChange={(newValue) =>
                handlePreferenceChange('notifications', 'taskReminders', newValue)
              }
              disabled={isSubmitting}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dashboard Default View</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profileFormData.preferences?.dashboard?.defaultView || 'leads'}
              onValueChange={(itemValue) => handlePreferenceChange('dashboard', 'defaultView', itemValue as 'leads' | 'analytics' | 'calendar')}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="Leads" value="leads" />
              <Picker.Item label="Analytics" value="analytics" />
              <Picker.Item label="Calendar" value="calendar" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leads Per Page</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profileFormData.preferences?.dashboard?.leadsPerPage || 10}
              onValueChange={(itemValue) => handlePreferenceChange('dashboard', 'leadsPerPage', itemValue as number)}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="5" value={5} />
              <Picker.Item label="10" value={10} />
              <Picker.Item label="20" value={20} />
              <Picker.Item label="50" value={50} />
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <Input
              value={passwordFormData.currentPassword}
              onChangeText={(text) => handlePasswordChange('currentPassword', text)}
              placeholder="Enter current password"
              secureTextEntry={!showCurrentPassword}
              style={styles.passwordInput}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.togglePasswordButton}
            >
              <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={24} color={theme.colors.text.light} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <Input
              value={passwordFormData.newPassword}
              onChangeText={(text) => handlePasswordChange('newPassword', text)}
              placeholder="Enter new password"
              secureTextEntry={!showNewPassword}
              style={styles.passwordInput}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.togglePasswordButton}
            >
              <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={24} color={theme.colors.text.light} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <Input
              value={passwordFormData.confirmNewPassword}
              onChangeText={(text) => handlePasswordChange('confirmNewPassword', text)}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirmNewPassword}
              style={styles.passwordInput}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              style={styles.togglePasswordButton}
            >
              <Ionicons name={showConfirmNewPassword ? 'eye-off' : 'eye'} size={24} color={theme.colors.text.light} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={isSubmitting ? 'Changing...' : 'Change Password'}
          onPress={handleChangePassword}
          isLoading={isSubmitting}
          disabled={isSubmitting || !passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmNewPassword}
          style={styles.saveButton}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Google Account Integration</Text>
        {user?.googleAccount?.isConnected ? (
          <>
            <Text style={styles.googleStatusConnected}>
              <Ionicons name="checkmark-circle" size={theme.typography.fontSize.body} color={theme.colors.success} /> Connected
            </Text>
            <Text style={styles.googleAccountEmail}>Email: {user.googleAccount.email}</Text>
            <Button
              title={isSubmitting ? 'Disconnecting...' : 'Disconnect Google Account'}
              onPress={handleDisconnectGoogle}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              variant="secondary"
              style={styles.googleButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.googleStatusDisconnected}>
              <Ionicons name="close-circle" size={theme.typography.fontSize.body} color={theme.colors.danger} /> Not Connected
            </Text>
            <Button
              title={isSubmitting ? 'Connecting...' : 'Connect Google Account'}
              onPress={handleConnectGoogle}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              style={styles.googleButton}
            />
          </>
        )}
      </View>


      <View style={styles.logoutSection}>
        <RNButton title="Logout" onPress={logout} color={theme.colors.danger} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
    padding: theme.spacing.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.screen,
  },
  loadingText: {
    marginTop: theme.spacing.small,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
  },
  header: {
    padding: theme.spacing.xxlarge,
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold',
    color: theme.colors.text.dark,
  },
  messageBox: {
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.large,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#fee2e2', // Kept as hardcoded for specific light shade, as no direct theme equivalent exists
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.small,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#d1fae5', // Kept as hardcoded for specific light shade, as no direct theme equivalent exists
    borderColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.small,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.cardShadow, // Apply consistent card shadow
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.small,
  },
  inputGroup: {
    marginBottom: theme.spacing.medium,
  },
  label: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.small,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50, // Make space for the eye icon
  },
  togglePasswordButton: {
    position: 'absolute',
    right: theme.spacing.medium,
    padding: theme.spacing.xsmall,
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
  checkboxItem: { // This style is no longer directly used for the individual checkbox, but for a wrapper if you needed it.
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  checkboxLabel: { // This style is no longer directly used for the individual checkbox label, but for a wrapper if you needed it.
    marginLeft: theme.spacing.small,
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
  },
  googleStatusConnected: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.success,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xsmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  googleStatusDisconnected: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.danger,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xsmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  googleAccountEmail: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    marginBottom: theme.spacing.medium,
  },
  saveButton: {
    marginTop: theme.spacing.large,
    backgroundColor: theme.colors.primary,
  },
  googleButton: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  logoutSection: {
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.xxlarge,
    alignItems: 'center',
  },
});

export default UserProfileScreen;