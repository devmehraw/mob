// theme/animations.ts
import { Animated, Easing } from 'react-native';

export const animations = {
  // Timing configurations
  timing: {
    fast: 200,
    medium: 300,
    slow: 500,
    verySlow: 800,
  },

  // Easing functions
  easing: {
    easeInOut: Easing.inOut(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeIn: Easing.in(Easing.ease),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },

  // Common animation presets
  fadeIn: (animatedValue: Animated.Value, duration: number = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  fadeOut: (animatedValue: Animated.Value, duration: number = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    });
  },

  slideInFromRight: (animatedValue: Animated.Value, duration: number = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  slideInFromLeft: (animatedValue: Animated.Value, duration: number = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  scaleIn: (animatedValue: Animated.Value, duration: number = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  pulse: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  },

  shake: (animatedValue: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);
  },

  // Spring animations
  springIn: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    });
  },

  // Stagger animation helper
  stagger: (animations: Animated.CompositeAnimation[], delay: number = 100) => {
    return Animated.stagger(delay, animations);
  },
};