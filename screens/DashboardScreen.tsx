import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Animated, 
  TouchableOpacity, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user } = useAuth();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const metricsAnimation = useRef(new Animated.Value(0)).current;
  const actionsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(metricsAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(actionsAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const metrics = [
    { 
      label: 'Total Leads', 
      value: '125', 
      icon: 'people-outline', 
      color: theme.colors.primary, 
      trend: '+12%',
      gradient: [theme.colors.primary, theme.colors.secondary]
    },
    { 
      label: 'New Today', 
      value: '8', 
      icon: 'person-add-outline', 
      color: theme.colors.success, 
      trend: '+5%',
      gradient: [theme.colors.success, theme.colors.primary]
    },
    { 
      label: 'Cold Leads', 
      value: '30', 
      icon: 'snow-outline', 
      color: theme.colors.secondary, 
      trend: '-3%',
      gradient: [theme.colors.secondary, theme.colors.accent]
    },
    { 
      label: 'Converted', 
      value: '15', 
      icon: 'checkmark-circle-outline', 
      color: theme.colors.accent, 
      trend: '+8%',
      gradient: [theme.colors.accent, theme.colors.success]
    },
    { 
      label: 'Tasks Due', 
      value: '5', 
      icon: 'calendar-outline', 
      color: theme.colors.warning, 
      trend: '0%',
      gradient: [theme.colors.warning, theme.colors.primary]
    },
    { 
      label: 'Revenue', 
      value: '$1.2M', 
      icon: 'cash-outline', 
      color: theme.colors.primary, 
      trend: '+15%',
      gradient: [theme.colors.primary, theme.colors.accent]
    },
  ];

  const quickActions = [
    { label: 'Add Lead', icon: 'person-add', color: theme.colors.primary, gradient: [theme.colors.primary, theme.colors.secondary] },
    { label: 'View Reports', icon: 'analytics', color: theme.colors.secondary, gradient: [theme.colors.secondary, theme.colors.accent] },
    { label: 'Schedule Call', icon: 'call', color: theme.colors.success, gradient: [theme.colors.success, theme.colors.primary] },
    { label: 'Send Email', icon: 'mail', color: theme.colors.accent, gradient: [theme.colors.accent, theme.colors.secondary] },
  ];

  const recentActivities = [
    { title: 'Lead converted to customer', time: '2 hours ago', icon: 'checkmark-circle', color: theme.colors.success },
    { title: 'New lead from website', time: '4 hours ago', icon: 'person-add', color: theme.colors.primary },
    { title: 'Follow-up call scheduled', time: '6 hours ago', icon: 'call', color: theme.colors.warning },
    { title: 'Email campaign sent', time: '1 day ago', icon: 'mail', color: theme.colors.secondary },
  ];

  const renderMetricCard = (metric: any, index: number) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    return (
      <Animated.View 
        key={index} 
        style={[
          styles.metricCard,
          {
            opacity: animatedValue,
            transform: [{ scale }],
          }
        ]}
      >
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={metric.gradient}
            style={styles.metricGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <Ionicons name={metric.icon} size={28} color={theme.colors.text.white} />
              <View style={[
                styles.trendBadge,
                { 
                  backgroundColor: metric.trend.includes('+') 
                    ? theme.colors.success + '30' 
                    : metric.trend.includes('-') 
                    ? theme.colors.danger + '30' 
                    : theme.colors.text.white + '30'
                }
              ]}>
                <Text style={[
                  styles.trendText,
                  { 
                    color: metric.trend.includes('+') 
                      ? theme.colors.text.white 
                      : metric.trend.includes('-') 
                      ? theme.colors.text.white 
                      : theme.colors.text.white
                  }
                ]}>
                  {metric.trend}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
      
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: headerAnimation }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</Text>
                <Text style={styles.headerSubtitle}>Welcome to your CRM Dashboard</Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.primary]}
                  style={styles.profileGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={24} color={theme.colors.text.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.text.white} />
                <Text style={styles.adminText}>Admin Access</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: actionsAnimation }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon as any} size={24} color={theme.colors.text.white} />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: metricsAnimation }]}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => renderMetricCard(metric, index))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: actionsAnimation }]}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activityCard}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: metricsAnimation }]}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <View style={styles.insightsCard}>
            <LinearGradient
              colors={[theme.colors.success + '10', theme.colors.background.card]}
              style={styles.insightGradient}
            >
              <View style={styles.insightItem}>
                <Ionicons name="trending-up" size={24} color={theme.colors.success} />
                <Text style={styles.insightText}>Conversion rate up 15% this month</Text>
              </View>
            </LinearGradient>
            <LinearGradient
              colors={[theme.colors.warning + '10', theme.colors.background.card]}
              style={styles.insightGradient}
            >
              <View style={styles.insightItem}>
                <Ionicons name="time" size={24} color={theme.colors.warning} />
                <Text style={styles.insightText}>Average response time: 2.3 hours</Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    marginBottom: theme.spacing.large,
  },
  headerGradient: {
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
    paddingHorizontal: theme.spacing.large,
    ...theme.shadows.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  welcomeSection: {
    flex: 1,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.white + 'CC',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.text.white + '20',
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
    borderRadius: theme.borderRadius,
    alignSelf: 'flex-start',
  },
  adminText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white,
    fontWeight: '500',
    marginLeft: theme.spacing.xsmall,
  },
  section: {
    marginBottom: theme.spacing.xlarge,
    paddingHorizontal: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.medium,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: theme.spacing.small,
    borderRadius: theme.borderRadius + 4,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  quickActionText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.typography.fontSize.small,
    fontWeight: '500',
    color: theme.colors.text.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: theme.spacing.medium,
    borderRadius: theme.borderRadius + 4,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  metricGradient: {
    padding: theme.spacing.medium,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xsmall,
  },
  trendBadge: {
    paddingHorizontal: theme.spacing.xsmall,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xsmall,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white + 'CC',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius + 4,
    padding: theme.spacing.medium,
    ...theme.shadows.small,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.dark,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.medium,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.light,
  },
  insightsCard: {
    gap: theme.spacing.small,
  },
  insightGradient: {
    borderRadius: theme.borderRadius + 4,
    padding: theme.spacing.medium,
    ...theme.shadows.small,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
    marginLeft: theme.spacing.medium,
    flex: 1,
    fontWeight: '500',
  },
});

export default DashboardScreen;