// screens/LeadsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
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

type LeadsScreenNavigationProp = StackScreenProps<LeadsStackParamList, 'LeadsList'>['navigation'];

const LeadsScreen = () => {
  const navigation = useNavigation<LeadsScreenNavigationProp>();
  const { user } = useAuth(); // Get the current user from the AuthContext
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  // Removed isAddModalOpen, isImportModalOpen, isExportModalOpen as they seem unused here
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  const canCreateLeads = permissionService.hasPermission(user, 'leads', 'create');
  // const canImportExportLeads = permissionService.hasPermission(user, 'reports', 'export'); // This variable is not used in the provided code

  // Filtered leads state
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

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
      case 'New': return { backgroundColor: theme.colors.secondary + '20', color: theme.colors.secondary };
      case 'Contacted': return { backgroundColor: theme.colors.primary + '20', color: theme.colors.primary };
      case 'Qualified': return { backgroundColor: theme.colors.success + '20', color: theme.colors.success };
      case 'Converted': return { backgroundColor: theme.colors.accent + '20', color: theme.colors.accent };
      case 'Lost': return { backgroundColor: theme.colors.danger + '20', color: theme.colors.danger };
      case 'Hold': return { backgroundColor: theme.colors.warning + '20', color: theme.colors.warning };
      default: return { backgroundColor: theme.colors.background.dark, color: theme.colors.text.medium };
    }
  };

  const renderLeadCard = ({ item }: { item: Lead }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.leadCard}
        onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.leadCardHeader}>
          <Text style={styles.leadName}>{item.name}</Text>
          <Text style={[styles.leadStatus, { backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }]}>{item.status}</Text>
        </View>
        <View style={styles.leadInfo}>
          <Text style={styles.leadDetail}>
            <Ionicons name="mail-outline" size={theme.typography.fontSize.small} color={theme.colors.text.medium} /> <Text style={styles.detailLabel}>Email:</Text> {item.primaryEmail}
          </Text>
          <Text style={styles.leadDetail}>
            <Ionicons name="call-outline" size={theme.typography.fontSize.small} color={theme.colors.text.medium} /> <Text style={styles.detailLabel}>Phone:</Text> {item.primaryPhone}
          </Text>
          <Text style={styles.leadDetail}>
            <Ionicons name="globe-outline" size={theme.typography.fontSize.small} color={theme.colors.text.medium} /> <Text style={styles.detailLabel}>Source:</Text> {item.source}
          </Text>
          <Text style={styles.leadDetail}>
            <Ionicons name="person-outline" size={theme.typography.fontSize.small} color={theme.colors.text.medium} /> <Text style={styles.detailLabel}>Assigned Agent:</Text> {item.assignedAgent || 'Unassigned'}
          </Text>
        </View>
        <View style={styles.leadActions}>
          {permissionService.hasPermission(user, 'leads', 'update') && (
            <Button
              title="Edit"
              onPress={() => navigation.navigate('AddEditLead', { leadId: item.id })}
              variant="outline"
              icon={<Ionicons name="create-outline" size={18} color={theme.colors.primary} />}
            />
          )}
          {permissionService.hasPermission(user, 'leads', 'delete') && (
            <Button
              title="Delete"
              onPress={() => handleDeleteLead(item.id)}
              variant="destructive"
              icon={<Ionicons name="trash-outline" size={18} color={theme.colors.text.white} />}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) { // Show full-screen loader only on initial load
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading leads...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={() => fetchLeads('Lead')} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>All Leads</Text>
        <View style={styles.headerButtons}>
          {canCreateLeads && (
            <TouchableOpacity onPress={handleAddLead} style={styles.addButton} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={theme.typography.fontSize.h2 + 5} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Add Lead</Text>
            </TouchableOpacity>
          )}
          {/* Add Import/Export buttons if needed and permitted */}
        </View>
      </View>

      {filteredLeads.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-circle-outline" size={theme.typography.fontSize.h1 * 2} color={theme.colors.text.light} />
          <Text style={styles.emptyStateText}>No leads found yet. Start by adding a new lead!</Text>
          {canCreateLeads && (
            <Button title="Add New Lead" onPress={handleAddLead} />
          )}
        </View>
      ) : (
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
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  header: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    backgroundColor: theme.colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xxlarge, // Adjust for status bar
  },
  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: '700',
    color: theme.colors.text.dark,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10', // A lighter shade of primary for the button background
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius,
    marginLeft: theme.spacing.small,
    ...theme.cardShadow, // Apply consistent shadow
  },
  addButtonText: {
    marginLeft: theme.spacing.xsmall,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.primary,
    fontWeight: '600',
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
  },
  errorText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.danger,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xlarge,
    backgroundColor: theme.colors.background.card, // Make empty state background match cards
    marginHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius,
    ...theme.cardShadow,
    marginTop: theme.spacing.large,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.light,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.large,
  },
  leadCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.cardShadow,
  },
  leadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xsmall,
  },
  leadName: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: '600',
    color: theme.colors.text.dark,
  },
  leadStatus: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: 'bold',
    backgroundColor: theme.colors.success + '20', // Default green for status, will be overridden by getStatusStyle
    color: theme.colors.success, // Default green for status, will be overridden by getStatusStyle
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.borderRadius - 4, // Slightly smaller radius for badge
    overflow: 'hidden', // Ensure background doesn't bleed out
  },
  leadInfo: {
    marginBottom: theme.spacing.small,
  },
  leadDetail: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.medium,
    marginBottom: theme.spacing.xsmall / 2,
    flexDirection: 'row',
    alignItems: 'center',
    lineHeight: theme.typography.fontSize.small * 1.5, // Improve line spacing
  },
  detailLabel: {
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginRight: theme.spacing.xsmall,
  },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.small, // Use gap for spacing between buttons
    marginTop: theme.spacing.small,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.small,
  },
  // actionButton and actionButtonText styles are now handled by the custom Button component,
  // so they are removed from here.
});

export default LeadsScreen;