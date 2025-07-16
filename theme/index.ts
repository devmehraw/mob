// theme/index.ts
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

export const theme = {
  colors,
  typography,
  spacing,
  animations,
  borderRadius: 10, // Consistent border radius for cards, buttons, inputs
  cardShadow: {       // Consistent shadow style for cards
    shadowColor: colors.background.dark, // A softer shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  // Enhanced shadow variations
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};