import React from 'react';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, NavigatorScreenParams, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main App Screens
import LeadsScreen from '../screens/LeadsScreen';
import ColdLeadsScreen from '../screens/ColdLeadsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LeadDetailsScreen from '../screens/LeadDetailsScreen';
import AddEditLeadScreen from '../screens/AddEditLeadScreen';

import { useAuth } from '../hooks/useAuth';
import SplashScreenSequence from '../screens/SplashScreen';
import { theme } from '../theme';

// Import your defined types
import { LeadsStackParamList, AppTabsParamList, AuthStackParamList, RootStackParamList } from './types';

// Define the navigators with their respective parameter lists
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppTabs = createBottomTabNavigator<AppTabsParamList>();
const LeadsStack = createStackNavigator<LeadsStackParamList>();
const ColdLeadsInnerStack = createStackNavigator<LeadsStackParamList>();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={[theme.colors.background.card, theme.colors.background.screen]}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName: keyof typeof Ionicons.glyphMap;
            if (route.name === 'Dashboard') {
              iconName = isFocused ? 'home' : 'home-outline';
            } else if (route.name === 'Leads') {
              iconName = isFocused ? 'people' : 'people-outline';
            } else if (route.name === 'Profile') {
              iconName = isFocused ? 'person' : 'person-outline';
            } else if (route.name === 'Cold Leads') {
              iconName = isFocused ? 'snow' : 'snow-outline';
            } else {
              iconName = 'alert';
            }

            return (
              <View key={index} style={styles.tabItem}>
                <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
                  <Ionicons
                    name={iconName}
                    size={isFocused ? 26 : 22}
                    color={isFocused ? theme.colors.primary : theme.colors.text.light}
                    onPress={onPress}
                  />
                  {isFocused && (
                    <Text style={styles.tabLabel}>{label}</Text>
                  )}
                </View>
                {isFocused && <View style={styles.activeIndicator} />}
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

// Leads Stack Navigator
function LeadsStackNavigator() {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background.screen} 
        translucent={false}
      />
      <LeadsStack.Navigator screenOptions={{ headerShown: false }}>
        <LeadsStack.Screen name="LeadsList" component={LeadsScreen} />
        <LeadsStack.Screen name="LeadDetails" component={LeadDetailsScreen} />
        <LeadsStack.Screen name="AddEditLead" component={AddEditLeadScreen} />
      </LeadsStack.Navigator>
    </>
  );
}

// Cold Leads Stack Navigator
function ColdLeadsTabNavigator() {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background.screen} 
        translucent={false}
      />
      <ColdLeadsInnerStack.Navigator screenOptions={{ headerShown: false }}>
        <ColdLeadsInnerStack.Screen name="ColdLeadsList" component={ColdLeadsScreen} />
        <ColdLeadsInnerStack.Screen name="LeadDetails" component={LeadDetailsScreen} />
        <ColdLeadsInnerStack.Screen name="AddEditLead" component={AddEditLeadScreen} />
      </ColdLeadsInnerStack.Navigator>
    </>
  );
}

// App Tab Navigator
function AppTabNavigator() {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background.screen} 
        translucent={false}
      />
      <AppTabs.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <AppTabs.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Home' }}
        />
        <AppTabs.Screen 
          name="Leads" 
          component={LeadsStackNavigator}
          options={{ title: 'Leads' }}
        />
        <AppTabs.Screen 
          name="Cold Leads" 
          component={ColdLeadsTabNavigator}
          options={{ title: 'Cold' }}
        />
        <AppTabs.Screen 
          name="Profile" 
          component={UserProfileScreen}
          options={{ title: 'Profile' }}
        />
      </AppTabs.Navigator>
    </>
  );
}

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = React.useState(false);

  if (!isSplashFinished || isLoading) {
    return <SplashScreenSequence onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <AuthStack.Screen name="App" component={AppTabNavigator} />
      ) : (
        <>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </AuthStack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...theme.shadows.large,
  },
  tabBarGradient: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minHeight: 50,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary + '15',
  },
  tabLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
});

export default AppNavigator;