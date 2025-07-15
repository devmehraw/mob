import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
// Import Lottie if you decide to use it
// import LottieView from 'lottie-react-native'; 

const { width, height } = Dimensions.get('window');

interface SplashProps {
  onFinish: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SplashScreenSequence: React.FC<SplashProps> = ({ onFinish }) => {
  const [currentSplash, setCurrentSplash] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const skipButtonAnim = useRef(new Animated.Value(0)).current; // Animation for skip button visibility

  const splashScreens: { text: string; colors: [string, string]; icon?: string; lottieSource?: any }[] = [
    { 
      text: 'RealEstate CRM', 
      colors: [theme.colors.primary, theme.colors.primary], // Using theme colors directly
      icon: 'home',
      // lottieSource: require('../assets/lottie/home_animation.json'), // <--- PLACE YOUR LOTTIE JSON HERE
    },
    { 
      text: 'Connecting Buyers & Sellers', 
      colors: [theme.colors.secondary, theme.colors.primary],
      icon: 'people',
      // lottieSource: require('../assets/lottie/people_animation.json'), // <--- PLACE YOUR LOTTIE JSON HERE
    },
    { 
      text: 'Powered by Innovation', 
      colors: [theme.colors.accent, theme.colors.secondary],
      icon: 'bulb',
      // lottieSource: require('../assets/lottie/bulb_animation.json'), // <--- PLACE YOUR LOTTIE JSON HERE
    },
  ];

  useEffect(() => {
    // Show skip button after a short delay
    const skipButtonDelay = setTimeout(() => {
      Animated.timing(skipButtonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1000); // Show skip button after 1 second

    const sequenceTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (currentSplash < splashScreens.length - 1) {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              setCurrentSplash(prev => prev + 1);
              scaleAnim.setValue(0.8); // Reset scale for next splash
            });
          }, 2000); // Display each splash for 2 seconds
        } else {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(onFinish); // Call onFinish after the last splash fades out
          }, 2000);
        }
      });
    }, 500); // Initial delay before first splash fades in

    return () => {
      clearTimeout(sequenceTimeout);
      clearTimeout(skipButtonDelay);
    };
  }, [currentSplash, fadeAnim, scaleAnim, onFinish, skipButtonAnim]);

  const handleSkip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(onFinish);
  };

  const currentLottieSource = splashScreens[currentSplash].lottieSource;

  return (
    <AnimatedLinearGradient
      colors={splashScreens[currentSplash].colors}
      style={[StyleSheet.absoluteFillObject, styles.container, { opacity: fadeAnim }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Uncomment the LottieView if you have lottie-react-native installed and JSON files */}
        {/* {currentLottieSource ? (
          <LottieView
            source={currentLottieSource}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        ) : (
          splashScreens[currentSplash].icon && (
            <Ionicons
              name={splashScreens[currentSplash].icon as any}
              size={theme.typography.fontSize.h1 * 2} // Larger icon
              color={theme.colors.text.white}
              style={styles.icon}
            />
          )
        )} */}
        {/* Placeholder for Icon if Lottie is not used */}
        {splashScreens[currentSplash].icon && (
          <Ionicons
            name={splashScreens[currentSplash].icon as any}
            size={theme.typography.fontSize.h1 * 2} // Larger icon
            color={theme.colors.text.white}
            style={styles.icon}
          />
        )}
        <Text style={styles.text}>{splashScreens[currentSplash].text}</Text>
      </Animated.View>

      <Animated.View style={[styles.skipButtonContainer, { opacity: skipButtonAnim }]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
          <Ionicons name="play-skip-forward" size={theme.typography.fontSize.body} color={theme.colors.text.white} />
        </TouchableOpacity>
      </Animated.View>
    </AnimatedLinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: theme.spacing.medium,
  },
  // If using Lottie, adjust size as needed
  // lottieAnimation: {
  //   width: width * 0.6,
  //   height: width * 0.6,
  //   marginBottom: theme.spacing.medium,
  // },
  text: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: 'bold', // Kept as string literal
    color: theme.colors.text.white,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  skipButtonContainer: {
    position: 'absolute',
    top: theme.spacing.xxlarge + theme.spacing.medium, // Position below status bar
    right: theme.spacing.large,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius * 2, // More rounded pill shape
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
  },
  skipButtonText: {
    color: theme.colors.text.white,
    fontSize: theme.typography.fontSize.body,
    fontWeight: '600', // Kept as string literal
    marginRight: theme.spacing.xsmall,
  },
});

export default SplashScreenSequence;