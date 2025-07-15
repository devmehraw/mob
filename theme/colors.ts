// theme/colors.ts
export const colors = {
  primary: '#2F80ED',      // Bright Blue (Main actions, active states)
  secondary: '#56CCF2',    // Lighter Blue (Accents, secondary elements)
  accent: '#BB6BD9',       // Purple (Highlights, unique elements like notifications)
  success: '#27AE60',      // Green
  warning: '#F2C94C',      // Yellow
  danger: '#EB5757',       // Red (For delete actions, errors)

  text: {
    dark: '#333333',       // Primary text color
    medium: '#555555',     // Secondary text, labels
    light: '#828282',      // Placeholder text, subtle info
    white: '#FFFFFF',      // Text on dark backgrounds
    primary: '#2F80ED',    // Text matching primary color
  },

  background: {
    screen: '#F8F8F8',     // General screen background
    card: '#FFFFFF',       // Card and input field background
    dark: '#E0E0E0',       // Subtle dividers, inactive states
    overlay: 'rgba(0, 0, 0, 0.5)', // For modals/overlays
  },

  border: '#E0E0E0',       // General border color
};