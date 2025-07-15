// screens/DashboardScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { theme } from '../theme'; // Import your theme

const DashboardScreen = () => {
  const { user } = useAuth();

  // Re-introducing metrics for a more comprehensive dashboard
  const metrics = [
    { label: 'Total Leads', value: '125', icon: 'people-outline', color: theme.colors.primary },
    { label: 'New Leads (Today)', value: '8', icon: 'person-add-outline', color: theme.colors.success },
    { label: 'Cold Leads', value: '30', icon: 'snow-outline', color: theme.colors.secondary },
    { label: 'Converted Deals', value: '15', icon: 'checkmark-circle-outline', color: theme.colors.accent },
    { label: 'Upcoming Tasks', value: '5', icon: 'calendar-outline', color: theme.colors.warning },
    { label: 'Revenue (Month)', value: '$1.2M', icon: 'cash-outline', color: theme.colors.primary },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}!</Text>
          <Text style={styles.headerSubtitle}>Your CRM Dashboard</Text>
        </View>

        {user?.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark-outline" size={theme.typography.fontSize.small} color={theme.colors.text.white} />
            <Text style={styles.adminText}>Admin Access</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <Ionicons name={metric.icon as any} size={theme.typography.fontSize.h3} color={metric.color} style={styles.metricIcon} />
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {/* Placeholder for recent activities list */}
          <View style={styles.emptyCard}>
            <Ionicons name="information-circle-outline" size={theme.typography.fontSize.large} color={theme.colors.text.light} />
            <Text style={styles.emptyText}>No recent activities. Start engaging!</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          {/* Placeholder for charts/graphs */}
          <View style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={theme.typography.fontSize.large} color={theme.colors.text.light} />
            <Text style={styles.emptyText}>Detailed analytics coming soon!</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
    paddingTop: theme.spacing.medium,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.large,
  },
  header: {
    marginBottom: theme.spacing.xlarge,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    ...theme.cardShadow,
  },
  greeting: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: 'bold', // Direct string literal as requested
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
    marginBottom: theme.spacing.large,
  },
  adminText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.white,
    fontWeight: '500', // Direct string literal (medium) as requested
    marginLeft: theme.spacing.xsmall,
  },
  section: {
    marginBottom: theme.spacing.xlarge,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: '600', // Direct string literal (semibold) as requested
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.dark,
    paddingBottom: theme.spacing.small,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium,
    width: '48%',
    marginBottom: theme.spacing.medium,
    alignItems: 'center',
    ...theme.cardShadow,
  },
  metricIcon: {
    marginBottom: theme.spacing.xsmall,
  },
  metricValue: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: 'bold', // Direct string literal as requested
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.xsmall,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.cardShadow,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.light,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
});

export default DashboardScreen;