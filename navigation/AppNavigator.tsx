import React from 'react';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, NavigatorScreenParams, useRoute } from '@react-navigation/native';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main App Screens
import LeadsScreen from '../screens/LeadsScreen';
import ColdLeadsScreen from '../screens/ColdLeadsScreen'; // Import the new ColdLeadsScreen
import UserProfileScreen from '../screens/UserProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LeadDetailsScreen from '../screens/LeadDetailsScreen';
import AddEditLeadScreen from '../screens/AddEditLeadScreen';

import { useAuth } from '../hooks/useAuth';
import SplashScreenSequence from '../screens/SplashScreen';

// Import your defined types
import { LeadsStackParamList, AppTabsParamList, AuthStackParamList, RootStackParamList } from './types';


// Define the navigators with their respective parameter lists
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppTabs = createBottomTabNavigator<AppTabsParamList>();
const LeadsStack = createStackNavigator<LeadsStackParamList>(); // Stack for Leads (LeadsList, LeadDetails, AddEditLead)
const ColdLeadsInnerStack = createStackNavigator<LeadsStackParamList>(); // NEW: Stack specifically for Cold Leads

// Leads Stack Navigator: Handles navigation within the 'Leads' tab
function LeadsStackNavigator() {
  return (
    <LeadsStack.Navigator>
      <LeadsStack.Screen
        name="LeadsList"
        component={LeadsScreen}
        options={{ headerShown: false }}
      />
      {/* ColdLeadsList should NOT be here if you want it primarily via its own tab/stack */}
      {/* If you want to navigate *from* LeadsList *to* ColdLeadsList, keep it.
          But for the purpose of a dedicated tab, it's better separate.
          I'm removing it from here for clarity with the new ColdLeadsTabNavigator below. */}
      {/* <LeadsStack.Screen
        name="ColdLeadsList"
        component={ColdLeadsScreen}
        options={{ headerShown: false }}
      /> */}
      <LeadsStack.Screen
        name="LeadDetails"
        component={LeadDetailsScreen}
        options={{ headerShown: false }}
      />
      <LeadsStack.Screen
        name="AddEditLead"
        component={AddEditLeadScreen}
        options={({ route }: StackScreenProps<LeadsStackParamList, 'AddEditLead'>) => ({
          title: route.params?.leadId ? 'Edit Lead' : 'Add New Lead',
        })}
      />
    </LeadsStack.Navigator>
  );
}

// NEW: Cold Leads Stack Navigator: Handles navigation within the 'Cold Leads' tab
function ColdLeadsTabNavigator() { // Naming it something distinct, like 'ColdLeadsTabNavigator'
  return (
    <ColdLeadsInnerStack.Navigator>
      <ColdLeadsInnerStack.Screen
        name="ColdLeadsList" // This makes ColdLeadsScreen the *initial* screen for this tab's stack
        component={ColdLeadsScreen}
        options={{ headerShown: false }}
      />
      {/* You might want to access LeadDetails or AddEditLead from ColdLeadsScreen too */}
      <ColdLeadsInnerStack.Screen
        name="LeadDetails"
        component={LeadDetailsScreen}
        options={{ headerShown: false }}
      />
      <ColdLeadsInnerStack.Screen
        name="AddEditLead"
        component={AddEditLeadScreen}
        options={({ route }: StackScreenProps<LeadsStackParamList, 'AddEditLead'>) => ({
          title: route.params?.leadId ? 'Edit Lead' : 'Add New Lead',
        })}
      />
    </ColdLeadsInnerStack.Navigator>
  );
}


// App Tab Navigator: Handles the bottom tabs for authenticated users
function AppTabNavigator() {
  return (
    <AppTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Leads') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Cold Leads') { // NEW: Icon for Cold Leads
            iconName = focused ? 'snow' : 'snow-outline'; // Or 'ice-cream-outline', 'thermometer' etc.
          } else {
            iconName = 'alert'; // Fallback icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f80ed', // A shade of blue for active tabs
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <AppTabs.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <AppTabs.Screen name="Leads" component={LeadsStackNavigator} options={{ headerShown: false }} />
      <AppTabs.Screen name="Cold Leads" component={ColdLeadsTabNavigator} options={{ headerShown: false }} />
      <AppTabs.Screen name="Profile" component={UserProfileScreen} options={{ headerShown: false }} />
    </AppTabs.Navigator>
  );
}

// Root Navigator: Manages the overall flow including splash, auth, and main app
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = React.useState(false);

  // Show splash screen until it's finished and auth state is loaded
  if (!isSplashFinished || isLoading) {
    return <SplashScreenSequence onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is authenticated, show the main app tabs
        <AuthStack.Screen
          name="App"
          component={AppTabNavigator}
        />
      ) : (
        // User is not authenticated, show login/register screens
        <>
          <AuthStack.Screen
            name="Login"
            component={LoginScreen}
          />
          <AuthStack.Screen
            name="Register"
            component={RegisterScreen}
          />
        </>
      )}
    </AuthStack.Navigator>
  );
};

export default AppNavigator;