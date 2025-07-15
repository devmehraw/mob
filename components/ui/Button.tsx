// components/ui/Button.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'small' | 'default' | 'large';
  icon?: React.ReactNode; // Optional icon component
  style?: ViewStyle; // Custom style for the TouchableOpacity
  textStyle?: TextStyle; // Custom style for the Text
  disabled?: boolean; // New: Add disabled prop
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  size = 'default',
  icon,
  style,
  textStyle,
  disabled = false, // Default to false
}) => {
  const getButtonStyles = () => {
    let buttonStyles: ViewStyle = { ...styles.buttonBase };
    let textStyles: TextStyle = { ...styles.textBase };

    // Apply variant styles
    switch (variant) {
      case 'primary':
        buttonStyles = { ...buttonStyles, ...styles.primaryButton };
        textStyles = { ...textStyles, ...styles.primaryText };
        break;
      case 'secondary':
        buttonStyles = { ...buttonStyles, ...styles.secondaryButton };
        textStyles = { ...textStyles, ...styles.secondaryText };
        break;
      case 'outline':
        buttonStyles = { ...buttonStyles, ...styles.outlineButton };
        textStyles = { ...textStyles, ...styles.outlineText };
        break;
      case 'destructive':
        buttonStyles = { ...buttonStyles, ...styles.destructiveButton };
        textStyles = { ...textStyles, ...styles.destructiveText };
        break;
    }

    // Apply size styles
    switch (size) {
      case 'small':
        buttonStyles = { ...buttonStyles, ...styles.smallButton };
        textStyles = { ...textStyles, ...styles.smallText };
        break;
      case 'large':
        buttonStyles = { ...buttonStyles, ...styles.largeButton };
        textStyles = { ...textStyles, ...styles.largeText };
        break;
      case 'default':
      default:
        // Default styles are already in buttonBase and textBase
        break;
    }

    // Apply disabled styles
    if (disabled || isLoading) {
      buttonStyles = { ...buttonStyles, opacity: 0.6 }; // Reduce opacity when disabled or loading
    }

    return { buttonStyles, textStyles };
  };

  const { buttonStyles, textStyles } = getButtonStyles();

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={isLoading || disabled} // Disable interaction when loading or explicitly disabled
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#fff' : '#2f80ed'} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          {/* Fix: Conditionally apply textWithIcon style using a ternary operator */}
          <Text style={[textStyles, icon ? styles.textWithIcon : null, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row', // Align icon and text
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 8, // Space between icon and text
  },

  // Variants
  primaryButton: {
    backgroundColor: '#2f80ed', // Blue
  },
  primaryText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0', // Light gray
    borderColor: '#ddd',
    borderWidth: 1,
  },
  secondaryText: {
    color: '#333',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: '#2f80ed',
    borderWidth: 2,
  },
  outlineText: {
    color: '#2f80ed',
  },
  destructiveButton: {
    backgroundColor: '#e74c3c', // Red
  },
  destructiveText: {
    color: '#fff',
  },

  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    minWidth: 80,
  },
  smallText: {
    fontSize: 14,
  },
  largeButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    minWidth: 150,
  },
  largeText: {
    fontSize: 18,
  },
});