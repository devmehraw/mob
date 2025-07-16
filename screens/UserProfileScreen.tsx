import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button as RNButton, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { User, ChangePasswordData } from '../types/auth';
import { Input } from '../components/ui/Input';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { theme } from '../theme';

const UserProfileScreen = () => {
  const { user, logout, updateProfile, changePassword, connectGoogleAccount, disconnectGoogleAccount, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Profile Update State
  const [profileFormData, setProfileFormData] = React.useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
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

  React.useEffect(() => {
    if (!user) return;

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
      const currentPreferences = prev.preferences || {
        theme: 'system',
        notifications: { email: true, push: true, leadUpdates: true, taskReminders: true },
        dashboard: { defaultView: 'leads', leadsPerPage: 10 },
      };

      let updatedPreferences = { ...currentPreferences };

      if (category === 'theme') {
        updatedPreferences.theme = value;
      } else {
        const currentCategoryPreferences = (currentPreferences as any)[category] || {};
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
        await refreshUser();
      }
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
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
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.primary]}
                style={styles.profileImageGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={40} color={theme.colors.text.white} />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{user.name}</Text>
            <Text style={styles.headerSubtitle}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons 
                name={user.role === 'admin' ? 'shield-checkmark' : 'person'} 
                size={16} 
                color={theme.colors.text.white} 
              />
              <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {profileMessage && (
            <View style={[styles.messageBox, profileMessage.type === 'error' ? styles.errorBox : styles.successBox]}>
              <Ionicons 
                name={profileMessage.type === 'error' ? 'alert-circle' : 'checkmark-circle'} 
                size={20} 
                color={profileMessage.type === 'error' ? theme.colors.danger : theme.colors.success} 
              />
              <Text style={profileMessage.type === 'error' ? styles.errorText : styles.successText}>
                {profileMessage.text}
              </Text>
            </View>
          )}

          {passwordMessage && (
            <View style={[styles.messageBox, passwordMessage.type === 'error' ? styles.errorBox : styles.successBox]}>
              <Ionicons 
                name={passwordMessage.type === 'error' ? 'alert-circle' : 'checkmark-circle'} 
                size={20} 
                color={passwordMessage.type === 'error' ? theme.colors.danger : theme.colors.success} 
              />
              <Text style={passwordMessage.type === 'error' ? styles.errorText : styles.successText}>
                {passwordMessage.text}
              </Text>
            </View>
          )}

          <View style={styles.formSection}>
            <LinearGradient
              colors={[theme.colors.background.card, theme.colors.background.screen]}
              style={styles.sectionGradient}
            >
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.text.medium} /> Name
                </Text>
                <Input
                  value={profileFormData.name}
                  onChangeText={(text) => handleProfileChange('name', text)}
                  placeholder="Your Name"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="mail-outline" size={16} color={theme.colors.text.medium} /> Email (Read Only)
                </Text>
                <Input
                  value={profileFormData.email}
                  editable={false}
                  placeholder="Your Email"
                  style={{ backgroundColor: theme.colors.background.dark }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="call-outline" size={16} color={theme.colors.text.medium} /> Phone
                </Text>
                <Input
                  value={profileFormData.phone}
                  onChangeText={(text) => handleProfileChange('phone', text)}
                  keyboardType="phone-pad"
                  placeholder="Your Phone Number"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="business-outline" size={16} color={theme.colors.text.medium} /> Department
                </Text>
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
                icon={<Ionicons name="save-outline" size={20} color={theme.colors.text.white} />}
              />
            </LinearGradient>
          </View>

          <View style={styles.formSection}>
            <LinearGradient
              colors={[theme.colors.background.card, theme.colors.background.screen]}
              style={styles.sectionGradient}
            >
              <Text style={styles.sectionTitle}>Preferences</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="color-palette-outline" size={16} color={theme.colors.text.medium} /> Theme
                </Text>
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
                <Text style={styles.label}>
                  <Ionicons name="notifications-outline" size={16} color={theme.colors.text.medium} /> Notifications
                </Text>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    label="Email Notifications"
                    value={profileFormData.preferences?.notifications?.email || false}
                    onValueChange={(newValue) => handlePreferenceChange('notifications', 'email', newValue)}
                    disabled={isSubmitting}
                  />
                  <Checkbox
                    label="Push Notifications"
                    value={profileFormData.preferences?.notifications?.push || false}
                    onValueChange={(newValue) => handlePreferenceChange('notifications', 'push', newValue)}
                    disabled={isSubmitting}
                  />
                  <Checkbox
                    label="Lead Updates"
                    value={profileFormData.preferences?.notifications?.leadUpdates || false}
                    onValueChange={(newValue) => handlePreferenceChange('notifications', 'leadUpdates', newValue)}
                    disabled={isSubmitting}
                  />
                  <Checkbox
                    label="Task Reminders"
                    value={profileFormData.preferences?.notifications?.taskReminders || false}
                    onValueChange={(newValue) => handlePreferenceChange('notifications', 'taskReminders', newValue)}
                    disabled={isSubmitting}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.formSection}>
            <LinearGradient
              colors={[theme.colors.background.card, theme.colors.background.screen]}
              style={styles.sectionGradient}
            >
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
                icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.white} />}
              />
            </LinearGradient>
          </View>

          <View style={styles.logoutSection}>
            <TouchableOpacity onPress={logout} style={styles.logoutButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[theme.colors.danger, theme.colors.danger + 'CC']}
                style={styles.logoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-out-outline" size={24} color={theme.colors.text.white} />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.screen,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
  },
  header: {
    marginBottom: theme.spacing.medium,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: theme.spacing.large,
    paddingHorizontal: theme.spacing.large,
    ...theme.shadows.medium,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: theme.spacing.medium,
    ...theme.shadows.medium,
  },
  profileImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.white + 'CC',
    marginBottom: theme.spacing.medium,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.text.white + '20',
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
    borderRadius: theme.borderRadius,
  },
  roleText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xsmall,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: 100,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: theme.colors.danger + '10',
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.small,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  successBox: {
    backgroundColor: theme.colors.success + '10',
    borderColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.small,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  formSection: {
    marginBottom: theme.spacing.large,
    borderRadius: theme.borderRadius + 4,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  sectionGradient: {
    padding: theme.spacing.medium,
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
    paddingRight: 50,
  },
  togglePasswordButton: {
    position: 'absolute',
    right: theme.spacing.medium,
    padding: theme.spacing.xsmall,
  },
  pickerContainer: {
    borderColor: theme.colors.border,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.small,
  },
  picker: {
    height: 48,
    width: '100%',
  },
  checkboxContainer: {
    gap: theme.spacing.small,
  },
  saveButton: {
    marginTop: theme.spacing.medium,
  },
  logoutSection: {
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.xxlarge,
  },
  logoutButton: {
    borderRadius: theme.borderRadius + 4,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: '600',
    color: theme.colors.text.white,
    marginLeft: theme.spacing.small,
  },
});

export default UserProfileScreen;