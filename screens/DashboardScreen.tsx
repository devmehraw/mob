// screens/DashboardScreen.tsx

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Animated, TouchableOpacity, StatusBar } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { theme } from '../theme'; // Import your theme
import { AnimatedCard } from '../components/ui/AnimatedCard';

const DashboardScreen = () => {
  const { user } = useAuth();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const metricsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      theme.animations.fadeIn(headerAnimation, 600),
      theme.animations.slideInFromLeft(metricsAnimation, 800),
    ]).start();
  }, [headerAnimation, metricsAnimation]);
  // Re-introducing metrics for a more comprehensive dashboard
  const metrics = [
    { label: 'Total Leads', value: '125', icon: 'people-outline', color: theme.colors.primary, trend: '+12%' },
    { label: 'New Leads (Today)', value: '8', icon: 'person-add-outline', color: theme.colors.success, trend: '+5%' },
    { label: 'Cold Leads', value: '30', icon: 'snow-outline', color: theme.colors.secondary, trend: '-3%' },
    { label: 'Converted Deals', value: '15', icon: 'checkmark-circle-outline', color: theme.colors.accent, trend: '+8%' },
    { label: 'Upcoming Tasks', value: '5', icon: 'calendar-outline', color: theme.colors.warning, trend: '0%' },
    { label: 'Revenue (Month)', value: '$1.2M', icon: 'cash-outline', color: theme.colors.primary, trend: '+15%' },
  ];

  const quickActions = [
    { label: 'Add Lead', icon: 'person-add', color: theme.colors.primary },
    { label: 'View Reports', icon: 'analytics', color: theme.colors.secondary },
    { label: 'Schedule Call', icon: 'call', color: theme.colors.success },
    { label: 'Send Email', icon: 'mail', color: theme.colors.accent },
  ];
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: headerAnimation }]}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</Text>
                <Text style={styles.headerSubtitle}>Your CRM Dashboard</Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.text.white} />
                <Text style={styles.adminText}>Admin Access</Text>
              </View>
            )}
          </Animated.View>

          <AnimatedCard style={styles.quickActionsCard} animationType="slideInFromRight" delay={300}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={[styles.quickActionButton, { borderColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                  <Text style={[styles.quickActionText, { color: action.color }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <Animated.View style={[styles.metricsGrid, { opacity: metricsAnimation }]}>
              {metrics.map((metric, index) => (
                <AnimatedCard 
                  key={index} 
                  style={styles.metricCard} 
                  animationType="scaleIn" 
                  delay={400 + (index * 100)}
                >
                  <TouchableOpacity style={styles.metricContent}>
                    <View style={styles.metricHeader}>
                      <Ionicons name={metric.icon as any} size={28} color={metric.color} />
                      <View style={[styles.trendBadge, { backgroundColor: metric.trend.includes('+') ? theme.colors.success + '20' : metric.trend.includes('-') ? theme.colors.danger + '20' : theme.colors.text.light + '20' }]}>
                        <Text style={[styles.trendText, { color: metric.trend.includes('+') ? theme.colors.success : metric.trend.includes('-') ? theme.colors.danger : theme.colors.text.medium }]}>
                          {metric.trend}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
            </Animated.View>
          </View>

          <AnimatedCard style={styles.section} animationType="fadeIn" delay={800}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <View style={styles.activityList}>
              {[1, 2, 3].map((_, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Lead converted to customer</Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </View>
              ))}
            </View>
          </AnimatedCard>

          <AnimatedCard style={styles.section} animationType="slideInFromLeft" delay={1000}>
            <Text style={styles.sectionTitle}>Performance Insights</Text>
            <View style={styles.insightsContainer}>
              <View style={styles.insightItem}>
                <Ionicons name="trending-up" size={24} color={theme.colors.success} />
                <Text style={styles.insightText}>Conversion rate up 15% this month</Text>
              </View>
              <View style={styles.insightItem}>
                <Ionicons name="time" size={24} color={theme.colors.warning} />
                <Text style={styles.insightText}>Average response time: 2.3 hours</Text>
              </View>
            </View>
          </AnimatedCard>

        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.large,
  },
  header: {
    marginBottom: theme.spacing.large,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    ...theme.shadows.medium,
    marginBottom: theme.spacing.medium,
  },
  profileButton: {
    padding: theme.spacing.xsmall,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.dark,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
    marginTop: theme.spacing.xsmall,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
    borderRadius: theme.borderRadius,
    alignSelf: 'flex-start',
    ...theme.shadows.small,
  },
  adminText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white,
    fontWeight: '500',
    marginLeft: theme.spacing.xsmall,
  },
  quickActionsCard: {
    marginBottom: theme.spacing.large,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    borderWidth: 1,
    marginBottom: theme.spacing.small,
    backgroundColor: theme.colors.background.card,
  },
  quickActionText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.typography.fontSize.small,
    fontWeight: '500',
  },
  section: {
    marginBottom: theme.spacing.xlarge,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.medium,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: theme.spacing.medium,
  },
  metricContent: {
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
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.xsmall,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.dark,
  },
  activityIcon: {
    marginRight: theme.spacing.medium,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.light,
    marginTop: 2,
  },
  insightsContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
  },
  insightText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.dark,
    marginLeft: theme.spacing.medium,
    flex: 1,
  },
});

export default DashboardScreen;