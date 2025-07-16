import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface SplashProps {
  onFinish: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SplashScreenSequence: React.FC<SplashProps> = ({ onFinish }) => {
  const [currentSplash, setCurrentSplash] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const skipButtonAnim = useRef(new Animated.Value(0)).current; // Animation for skip button visibility

  const splashScreens: { text: string; subtitle: string; colors: [string, string]; icon?: string }[] = [
    { 
      text: 'RealEstate CRM', 
      subtitle: 'Your Gateway to Success',
      colors: [theme.colors.primary, theme.colors.secondary],
      icon: 'home',
    },
    { 
      text: 'Connecting Buyers & Sellers', 
      subtitle: 'Seamless Property Management',
      colors: [theme.colors.secondary, theme.colors.accent],
      icon: 'people',
    },
    { 
      text: 'Powered by Innovation', 
      subtitle: 'Advanced Lead Management',
      colors: [theme.colors.accent, theme.colors.primary],
      icon: 'bulb',
    },
  ];

  useEffect(() => {
    // Continuous rotation animation for icon
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, [rotateAnim, pulseAnim]);
  useEffect(() => {
    // Show skip button after a short delay
    const skipButtonDelay = setTimeout(() => {
      Animated.timing(skipButtonAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000); // Show skip button after 1 second

    const sequenceTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (currentSplash < splashScreens.length - 1) {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }).start(() => {
              setCurrentSplash(prev => prev + 1);
              scaleAnim.setValue(0.8); // Reset scale for next splash
            });
          }, 2500); // Display each splash for 2.5 seconds
        } else {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }).start(onFinish); // Call onFinish after the last splash fades out
          }, 2500);
        }
      });
    }, 300); // Initial delay before first splash fades in

    return () => {
      clearTimeout(sequenceTimeout);
      clearTimeout(skipButtonDelay);
    };
  }, [currentSplash, fadeAnim, scaleAnim, onFinish, skipButtonAnim]);

  const handleSkip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(onFinish);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AnimatedLinearGradient
        colors={splashScreens[currentSplash].colors}
        style={[StyleSheet.absoluteFillObject, styles.container, { opacity: fadeAnim }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {splashScreens[currentSplash].icon && (
            <Animated.View style={[
              styles.iconContainer,
              { 
                transform: [
                  { rotate },
                  { scale: pulseAnim }
                ] 
              }
            ]}>
              <Ionicons
                name={splashScreens[currentSplash].icon as any}
                size={80}
                color={theme.colors.text.white}
                style={styles.icon}
              />
            </Animated.View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.text}>{splashScreens[currentSplash].text}</Text>
            <Text style={styles.subtitle}>{splashScreens[currentSplash].subtitle}</Text>
          </View>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {splashScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentSplash && styles.progressDotActive
                ]}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.skipButtonContainer, { opacity: skipButtonAnim }]}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.8}>
            <Text style={styles.skipButtonText}>Skip</Text>
            <Ionicons name="play-skip-forward" size={16} color={theme.colors.text.white} />
          </TouchableOpacity>
        </Animated.View>
      </AnimatedLinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // Account for status bar
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: theme.spacing.xlarge,
    padding: theme.spacing.large,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.large,
  },
  icon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large,
    fontWeight: '300',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: theme.colors.text.white,
    width: 24,
  },
  skipButtonContainer: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.large,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipButtonText: {
    color: theme.colors.text.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: theme.spacing.xsmall,
  },
});

export default SplashScreenSequence;