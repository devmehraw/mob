// screens/LeadsScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, RefreshControl, Animated, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { Lead } from '../types/lead';
import { Button } from '../components/ui/Button';
import { PermissionService } from '../lib/permissions';
import { LeadsStackParamList } from '../navigation/types';
import { theme } from '../theme'; // Import your theme
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

type LeadsScreenNavigationProp = StackScreenProps<LeadsStackParamList, 'LeadsList'>['navigation'];

const LeadsScreen = () => {
  const navigation = useNavigation<LeadsScreenNavigationProp>();
  const { user } = useAuth(); // Get the current user from the AuthContext
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const listAnimation = useRef(new Animated.Value(0)).current;

  const canCreateLeads = permissionService.hasPermission(user, 'leads', 'create');


  useEffect(() => {
    Animated.stagger(200, [
      theme.animations.fadeIn(headerAnimation, 600),
      theme.animations.slideInFromLeft(listAnimation, 800),
    ]).start();
  }, [headerAnimation, listAnimation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeads('Lead'); // Ensure it fetches 'Lead' type on refresh
    setRefreshing(false);
  }, [fetchLeads]);


  useEffect(() => {
    if (leads && user) {
      if (user.role === 'admin') {
        // Admin can view all leads
        setFilteredLeads(leads);
      } else {
        // Agents can only view leads assigned to them
        setFilteredLeads(leads.filter(lead => lead.assignedAgent === user.id));
      }
    } else {
      setFilteredLeads([]);
    }
  }, [leads, user]);

  useFocusEffect(
    useCallback(() => {
      fetchLeads('Lead'); // Re-fetch leads when the screen comes into focus
    }, [fetchLeads])
  );

  const handleAddLead = () => {
    if (canCreateLeads) {
      navigation.navigate('AddEditLead', { leadId: undefined }); // Pass leadType for new lead
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to create leads.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (permissionService.hasPermission(user, 'leads', 'delete')) {
      Alert.alert(
        "Delete Lead",
        "Are you sure you want to delete this lead? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await deleteLead(id);
                Alert.alert("Success", "Lead deleted successfully!");
                // No need to refetch here, useLeads hook updates its state
              } catch (err: any) {
                Alert.alert("Error", err.message || "Failed to delete lead.");
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to delete leads.');
    }
  };

  const getStatusStyle = (status: Lead['status']) => {
    switch (status) {
      case 'New': return { backgroundColor: theme.colors.secondary + '20', color: theme.colors.secondary, icon: 'star' };
      case 'Contacted': return { backgroundColor: theme.colors.primary + '20', color: theme.colors.primary, icon: 'call' };
      case 'Qualified': return { backgroundColor: theme.colors.success + '20', color: theme.colors.success, icon: 'checkmark-circle' };
      case 'Converted': return { backgroundColor: theme.colors.accent + '20', color: theme.colors.accent, icon: 'trophy' };
      case 'Lost': return { backgroundColor: theme.colors.danger + '20', color: theme.colors.danger, icon: 'close-circle' };
      case 'Hold': return { backgroundColor: theme.colors.warning + '20', color: theme.colors.warning, icon: 'pause-circle' };
      default: return { backgroundColor: theme.colors.background.dark, color: theme.colors.text.medium, icon: 'help-circle' };
    }
  };

  const renderLeadCard = ({ item }: { item: Lead }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <AnimatedCard style={styles.leadCard} animationType="fadeIn" delay={100}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
          activeOpacity={0.8}
          style={styles.leadCardContent}
        >
          <View style={styles.leadCardHeader}>
            <View style={styles.leadNameContainer}>
              <Text style={styles.leadName}>{item.name}</Text>
              <Text style={styles.leadScore}>Score: {item.leadScore}</Text>
            </View>
            <View style={[styles.leadStatus, { backgroundColor: statusStyle.backgroundColor }]}>
              <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.color} />
              <Text style={[styles.leadStatusText, { color: statusStyle.color }]}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.leadInfo}>
            <View style={styles.leadDetailRow}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.text.medium} />
              <Text style={styles.leadDetail}>{item.primaryEmail}</Text>
            </View>
            <View style={styles.leadDetailRow}>
              <Ionicons name="call-outline" size={16} color={theme.colors.text.medium} />
              <Text style={styles.leadDetail}>{item.primaryPhone}</Text>
            </View>
            <View style={styles.leadDetailRow}>
              <Ionicons name="business-outline" size={16} color={theme.colors.text.medium} />
              <Text style={styles.leadDetail}>{item.propertyType} • {item.budgetRange}</Text>
            </View>
            <View style={styles.leadDetailRow}>
              <Ionicons name="person-outline" size={16} color={theme.colors.text.medium} />
              <Text style={styles.leadDetail}>{item.assignedAgent || 'Unassigned'}</Text>
            </View>
          </View>
          
          <View style={styles.leadActions}>
            {permissionService.hasPermission(user, 'leads', 'update') && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddEditLead', { leadId: item.id })}
              >
                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {permissionService.hasPermission(user, 'leads', 'delete') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteLead(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                <Text style={[styles.actionButtonText, { color: theme.colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  if (loading && !refreshing) { // Show full-screen loader only on initial load
    return (
      <View style={styles.centered}>
        <LoadingSpinner size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your leads...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={60} color={theme.colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={() => fetchLeads('Lead')} 
          icon={<Ionicons name="refresh" size={18} color={theme.colors.text.white} />}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: headerAnimation }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>All Leads</Text>
              <Text style={styles.subtitle}>{filteredLeads.length} active leads</Text>
            </View>
            {canCreateLeads && (
              <TouchableOpacity onPress={handleAddLead} style={styles.addButton} activeOpacity={0.8}>
                <Ionicons name="add" size={24} color={theme.colors.text.white} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {filteredLeads.length === 0 ? (
          <AnimatedCard style={styles.emptyState} animationType="scaleIn" delay={400}>
            <Ionicons name="people-circle-outline" size={80} color={theme.colors.text.light} />
            <Text style={styles.emptyStateTitle}>No leads found</Text>
            <Text style={styles.emptyStateText}>Start building your pipeline by adding your first lead!</Text>
            {canCreateLeads && (
              <Button 
                title="Add Your First Lead" 
                onPress={handleAddLead}
                icon={<Ionicons name="add-circle" size={20} color={theme.colors.text.white} />}
                style={styles.emptyStateButton}
              />
            )}
          </AnimatedCard>
        ) : (
          <Animated.View style={[{ flex: 1 }, { opacity: listAnimation }]}>
            <FlatList
              data={filteredLeads}
              keyExtractor={(item) => item.id}
              renderItem={renderLeadCard}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.primary}
                  colors={[theme.colors.primary]}
                />
              }
            />
          </Animated.View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  header: {
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.small,
    marginBottom: theme.spacing.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.dark,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    marginTop: 2,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.screen,
    padding: theme.spacing.large,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.danger,
    marginVertical: theme.spacing.medium,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxlarge,
    margin: theme.spacing.large,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.light,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: theme.spacing.medium,
  },
  listContentContainer: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  leadCard: {
    marginBottom: theme.spacing.medium,
  },
  leadCardContent: {
    padding: theme.spacing.medium,
  },
  leadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  leadNameContainer: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginBottom: 2,
  },
  leadScore: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
  },
  leadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: 12,
  },
  leadStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  leadInfo: {
    marginBottom: theme.spacing.medium,
  },
  leadDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  leadDetail: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.small,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.small,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.background.screen,
  },
  deleteButton: {
    backgroundColor: theme.colors.danger + '10',
  },
  actionButtonText: {
    marginLeft: theme.spacing.xsmall,
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default LeadsScreen;