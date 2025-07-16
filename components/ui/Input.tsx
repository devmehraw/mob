import React, { useRef, useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, Animated, View } from 'react-native';
import { theme } from '../../theme';

interface InputProps extends TextInputProps {
  error?: boolean;
  animateOnFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  style, 
  error = false, 
  animateOnFocus = true,
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (animateOnFocus) {
      Animated.parallel([
        Animated.timing(borderColorValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(scaleValue, {
          toValue: 1.01,
          useNativeDriver: true,
        }),
      ]).start();
    }
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (animateOnFocus) {
      Animated.parallel([
        Animated.timing(borderColorValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
    onBlur?.(e);
  };

  const borderColor = borderColorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? theme.colors.danger : theme.colors.border, theme.colors.primary],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.text.light}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.small,
  },
  input: {
    height: 48,
    paddingHorizontal: 12, // Minimal padding as requested
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
  },
});