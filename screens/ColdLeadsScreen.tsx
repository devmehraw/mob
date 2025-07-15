// screens/ColdLeadsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { Lead } from '../types/lead';
import { Button } from '../components/ui/Button';
import { PermissionService } from '../lib/permissions';
import { LeadsStackParamList } from '../navigation/types';

type LeadsScreenNavigationProp = StackScreenProps<LeadsStackParamList, 'LeadsList'>['navigation'];

const ColdLeadsScreen = () => {
  const navigation = useNavigation<LeadsScreenNavigationProp>();
  const { user } = useAuth(); // Get the current user from the AuthContext
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const canCreateLeads = permissionService.hasPermission(user, 'leads', 'create');
  const canImportExportLeads = permissionService.hasPermission(user, 'reports', 'export');

  // Filtered leads state
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

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
      fetchLeads('Cold-Lead'); // Re-fetch leads when the screen comes into focus
    }, [fetchLeads])
  );

  const handleAddLead = () => {
    if (canCreateLeads) {
      navigation.navigate('AddEditLead', { leadId: undefined });
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to create leads.');
    }
  };

  const handleDeleteLead = (id: string) => {
    if (permissionService.hasPermission(user, 'leads', 'delete')) {
      Alert.alert(
        "Delete Lead",
        "Are you sure you want to delete this lead?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await deleteLead(id);
                Alert.alert("Success", "Lead deleted successfully.");
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

  const renderLeadCard = ({ item }: { item: Lead }) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
    >
      <View style={styles.leadCardHeader}>
        <Text style={styles.leadName}>{item.name}</Text>
        <Text style={styles.leadStatus}>{item.status}</Text>
      </View>
      <View style={styles.leadInfo}>
        <Text style={styles.leadDetail}>
          <Text style={styles.detailLabel}>Email:</Text> {item.primaryEmail}
        </Text>
        <Text style={styles.leadDetail}>
          <Text style={styles.detailLabel}>Phone:</Text> {item.primaryPhone}
        </Text>
        <Text style={styles.leadDetail}>
          <Text style={styles.detailLabel}>Source:</Text> {item.source}
        </Text>
        <Text style={styles.leadDetail}>
          <Text style={styles.detailLabel}>Assigned Agent:</Text> {item.assignedAgent || 'Unassigned'}
        </Text>
      </View>
      <View style={styles.leadActions}>
        {permissionService.hasPermission(user, 'leads', 'update') && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditLead', { leadId: item.id })}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color="#2f80ed" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {permissionService.hasPermission(user, 'leads', 'delete') && (
          <TouchableOpacity
            onPress={() => handleDeleteLead(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchLeads} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cold Leads</Text>
        <View style={styles.headerButtons}>
          {canCreateLeads && (
            <TouchableOpacity onPress={handleAddLead} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#2ecc71" />
              <Text style={styles.addButtonText}>Add Lead</Text>
            </TouchableOpacity>
          )}
          {/* Add Import/Export buttons if needed and permitted */}
        </View>
      </View>

      {filteredLeads.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-circle-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateText}>No cold leads found.</Text>
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40, // Adjusted for status bar for better spacing
    shadowColor: '#000', // Added shadow for a subtle lift
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Subtle shadow
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0ffe0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7f6',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Slightly more pronounced shadow
    shadowOpacity: 0.15, // Increased shadow opacity
    shadowRadius: 5, // Increased shadow radius
    elevation: 4, // Increased elevation
  },
  leadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
  },
  leadStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71', // Green for status
    backgroundColor: '#e9f8f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  leadInfo: {
    marginBottom: 10,
  },
  leadDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#2f80ed',
    fontWeight: '500',
  },
});

export default ColdLeadsScreen;