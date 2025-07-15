import { NavigatorScreenParams } from '@react-navigation/native';

// Define the parameter types for your Leads Stack
export type LeadsStackParamList = {
  LeadsList: undefined; // No params for the LeadsList screen
  ColdLeadsList: undefined; // Added ColdLeadsList with no params
  LeadDetails: { leadId: string }; // leadId is a required string param for LeadDetails
  AddEditLead: { leadId?: string } | undefined; // leadId is an optional string param for AddEditLead
};

// Define the parameter types for your main App Tabs
export type AppTabsParamList = {
  Dashboard: undefined;
  Leads: NavigatorScreenParams<LeadsStackParamList>; // Nested navigator
  Profile: undefined;
  'Cold Leads': NavigatorScreenParams<LeadsStackParamList>; // Nested navigator for Cold Leads
};

// Define the parameter types for your Auth Stack
export type AuthStackParamList = {
  App: NavigatorScreenParams<AppTabsParamList>; // Nested navigator for authenticated app flow
  Login: undefined;
  Register: undefined;
};

// This is the RootStack, which defines the main flow of your app
export type RootStackParamList = {
  Splash: undefined; // Assuming SplashScreenSequence is named 'Splash' in root
  Auth: NavigatorScreenParams<AuthStackParamList>; // Nested navigator for Auth flow (Login/Register)
  App: NavigatorScreenParams<AppTabsParamList>; // Direct entry for authenticated app flow
};

// Declare module augmentation for React Navigation
// This allows TypeScript to understand the types when using useNavigation, useRoute etc.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}