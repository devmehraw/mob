// components/ui/AnimatedCard.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  animationType?: 'fadeIn' | 'slideInFromLeft' | 'slideInFromRight' | 'scaleIn';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  animationType = 'fadeIn',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(animationType === 'slideInFromLeft' ? -100 : animationType === 'slideInFromRight' ? 100 : 0)).current;
  const scale = useRef(new Animated.Value(animationType === 'scaleIn' ? 0.8 : 1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const animations = [];

      if (animationType === 'fadeIn') {
        animations.push(theme.animations.fadeIn(animatedValue));
      } else if (animationType === 'slideInFromLeft' || animationType === 'slideInFromRight') {
        animations.push(
          Animated.parallel([
            theme.animations.fadeIn(animatedValue),
            theme.animations.slideInFromLeft(translateX),
          ])
        );
      } else if (animationType === 'scaleIn') {
        animations.push(
          Animated.parallel([
            theme.animations.fadeIn(animatedValue),
            theme.animations.scaleIn(scale),
          ])
        );
      }

      Animated.parallel(animations).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [animatedValue, translateX, scale, delay, animationType]);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      { translateX },
      { scale },
    ],
  };

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium,
    ...theme.shadows.medium,
  },
});