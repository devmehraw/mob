// components/ui/Button.tsx

import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Animated } from 'react-native';
import { theme } from '../../theme';

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
  animateOnPress?: boolean; // New: Add press animation
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
  animateOnPress = true,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled || isLoading) {
      Animated.timing(opacityValue, {
        toValue: 0.6,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [disabled, isLoading, opacityValue]);

  const handlePressIn = () => {
    if (animateOnPress && !disabled && !isLoading) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animateOnPress && !disabled && !isLoading) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };
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
    <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}>
      <TouchableOpacity
        style={[buttonStyles, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading || disabled}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#fff' : theme.colors.primary} />
        ) : (
          <>
            {icon && <React.Fragment>{icon}</React.Fragment>}
            <Text style={[textStyles, icon ? styles.textWithIcon : null, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row', // Align icon and text
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius,
    minWidth: 100,
    ...theme.shadows.small,
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
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors.text.white,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.dark,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  secondaryText: {
    color: theme.colors.text.dark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  destructiveButton: {
    backgroundColor: theme.colors.danger,
  },
  destructiveText: {
    color: theme.colors.text.white,
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