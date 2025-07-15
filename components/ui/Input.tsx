// components/ui/Input.tsx (Conceptual update)
import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../theme'; // Import your theme

interface InputProps extends TextInputProps {
  // Add any custom props if you have them
}

export const Input: React.FC<InputProps> = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={theme.colors.text.light} // Use theme color
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderColor: theme.colors.border, // Use theme color
    borderWidth: 1,
    borderRadius: theme.borderRadius, // Use theme radius
    paddingHorizontal: theme.spacing.medium, // Use theme spacing
    fontSize: theme.typography.fontSize.body, // Use theme font size
    color: theme.colors.text.dark, // Use theme color
    backgroundColor: theme.colors.background.card, // Use theme color
  },
});