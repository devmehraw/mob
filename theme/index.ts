// theme/index.ts
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius: 10, // Consistent border radius for cards, buttons, inputs
  cardShadow: {       // Consistent shadow style for cards
    shadowColor: colors.background.dark, // A softer shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
};