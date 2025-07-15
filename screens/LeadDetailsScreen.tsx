// screens/LeadDetailsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLeads } from '../hooks/useLeads';
import { Lead, Activity } from '../types/lead';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { PermissionService } from '../lib/permissions';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { LeadsStackParamList } from '../navigation/types';
import api from '../utils/api'; // Import your axios instance
import { User as AgentUser } from '../types/auth'; // Re-using User type for agents if structure is similar


// Helper for formatting dates (you might want a dedicated utility for this)
const formatDate = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type LeadDetailsScreenRouteProp = StackScreenProps<LeadsStackParamList, 'LeadDetails'>['route'];
type LeadDetailsScreenNavigationProp = StackScreenProps<LeadsStackParamList, 'LeadDetails'>['navigation'];

const LeadDetailsScreen = () => {
  const route = useRoute<LeadDetailsScreenRouteProp>();
  const navigation = useNavigation<LeadDetailsScreenNavigationProp>();
  const { leadId } = route.params;

  const { user } = useAuth();
  const { getLeadById, addActivity, updateLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Lead['status'] | undefined>(undefined);
  const [agents, setAgents] = useState<AgentUser[]>([]); // State for agents list
  const [assignedAgentName, setAssignedAgentName] = useState<string>('N/A');


  // Fetch lead data
  const fetchLeadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLead = await getLeadById(leadId);
      if (fetchedLead) {
        // Ensure that the logged-in agent can view this lead
        if (user?.role === 'agent' && fetchedLead.assignedAgent !== user.id) {
          setError('You do not have permission to view this lead.');
          setLead(null); // Clear lead data if not permitted
          Alert.alert('Permission Denied', 'You do not have permission to view this lead.');
          navigation.goBack();
          return;
        }
        setLead(fetchedLead);
        setSelectedStatus(fetchedLead.status); // Set initial status for the picker
        if (fetchedLead.assignedAgent) {
            // Attempt to find agent name if agents list is available
            const foundAgent = agents.find(agent => agent.id === fetchedLead.assignedAgent);
            setAssignedAgentName(foundAgent?.name || 'Unknown Agent');
        } else {
            setAssignedAgentName('Unassigned');
        }
      } else {
        setError('Lead not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lead details.');
    } finally {
      setLoading(false);
    }
  }, [leadId, getLeadById, user, navigation, agents]);

  // Fetch agents if the current user is an admin
  const fetchAgents = useCallback(async () => {
    if (user?.role === 'admin' && permissionService.hasPermission(user, 'users', 'read')) {
      try {
        const response = await api.get('/admin/users', { params: { role: 'agent' } });
        setAgents(response.data.users);
      } catch (error: any) {
        console.error('Failed to fetch agents:', error.response?.data || error.message);
        // Alert.alert('Error', 'Failed to load agents for assignment.'); // Don't block if agents fail to load
      }
    }
  }, [user, permissionService]);


  useFocusEffect(
    useCallback(() => {
      fetchAgents(); // Fetch agents first
      fetchLeadData(); // Then fetch lead data
    }, [fetchLeadData, fetchAgents])
  );

  useEffect(() => {
    if (lead?.assignedAgent && agents.length > 0) {
      const foundAgent = agents.find(agent => agent.id === lead.assignedAgent);
      setAssignedAgentName(foundAgent?.name || 'Unknown Agent');
    } else if (!lead?.assignedAgent) {
      setAssignedAgentName('Unassigned');
    }
  }, [lead, agents]);


  const handleAddActivity = async () => {
    if (!newActivityDescription.trim()) {
      Alert.alert('Error', 'Activity description cannot be empty.');
      return;
    }
    if (!lead || !user || !permissionService.hasPermission(user, 'communications', 'create')) {
      Alert.alert('Permission Denied', 'You do not have permission to add activities.');
      return;
    }

    setLoading(true);
    try {
      const activity: Omit<Activity, 'id'> = {
        type: 'Note', // Default to 'Note' for now, could be a picker
        description: newActivityDescription.trim(),
        date: new Date(),
        agent: user.name, // Use current user's name as the agent for the activity
      };
      const updatedLead = await addActivity(lead.id, activity);
      setLead(updatedLead);
      setNewActivityDescription('');
      Alert.alert('Success', 'Activity added successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add activity.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!lead || !user || !permissionService.hasPermission(user, 'leads', 'update')) {
      Alert.alert('Permission Denied', 'You do not have permission to update lead status.');
      return;
    }
    if (newStatus === lead.status) return; // No change

    setLoading(true);
    try {
      const updatedLead = await updateLead(lead.id, { status: newStatus });
      setLead(updatedLead);
      setSelectedStatus(newStatus);
      Alert.alert('Success', 'Lead status updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update lead status.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgentChange = async (newAgentId: string) => {
    if (!lead || !user || user.role !== 'admin' || !permissionService.hasPermission(user, 'leads', 'assign')) {
      Alert.alert('Permission Denied', 'Only admins can assign leads.');
      return;
    }

    setLoading(true);
    try {
      const updatedLead = await updateLead(lead.id, { assignedAgent: newAgentId });
      setLead(updatedLead);
      const assignedAgentName = agents.find(agent => agent.id === newAgentId)?.name || 'Unassigned';
      setAssignedAgentName(assignedAgentName);
      Alert.alert('Success', `Lead assigned to ${assignedAgentName} successfully!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to assign agent.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToEditLead = () => {
    if (lead && (user?.role === 'admin' || lead.assignedAgent === user?.id) && permissionService.hasPermission(user, 'leads', 'update')) {
      navigation.navigate('AddEditLead', { leadId: lead.id });
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to edit this lead.');
    }
  };

  if (loading && !lead) { // Show loading only if lead data is not yet available
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lead data is unavailable.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const canEditLeadDetails = permissionService.hasPermission(user, 'leads', 'update') && (user?.role === 'admin' || lead.assignedAgent === user?.id);
  const canAddActivity = permissionService.hasPermission(user, 'communications', 'create');
  const canChangeStatus = permissionService.hasPermission(user, 'leads', 'update') && (user?.role === 'admin' || lead.assignedAgent === user?.id);
  const canAssignLeads = permissionService.hasPermission(user, 'leads', 'assign') && user?.role === 'admin';


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#34495e" />
        </TouchableOpacity>
        <Text style={styles.title}>Lead Details</Text>
        {canEditLeadDetails && (
          <TouchableOpacity onPress={navigateToEditLead} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#2f80ed" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.cardTitle}>{lead.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Primary Email:</Text>
          <Text style={styles.detailText}>{lead.primaryEmail}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Primary Phone:</Text>
          <Text style={styles.detailText}>{lead.primaryPhone}</Text>
        </View>
        {lead.secondaryEmail && (
          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>Secondary Email:</Text>
            <Text style={styles.detailText}>{lead.secondaryEmail}</Text>
          </View>
        )}
        {lead.secondaryPhone && (
          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>Secondary Phone:</Text>
            <Text style={styles.detailText}>{lead.secondaryPhone}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Property Type:</Text>
          <Text style={styles.detailText}>{lead.propertyType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Budget Range:</Text>
          <Text style={styles.detailText}>{lead.budgetRange}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Preferred Locations:</Text>
          <Text style={styles.detailText}>{lead.preferredLocations.join(', ')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Source:</Text>
          <Text style={styles.detailText}>{lead.source}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Lead Score:</Text>
          <Text style={styles.detailText}>{lead.leadScore}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Lead Type:</Text>
          <Text style={styles.detailText}>{lead.leadType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Created At:</Text>
          <Text style={styles.detailText}>{formatDate(lead.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Last Contacted:</Text>
          <Text style={styles.detailText}>{lead.lastContacted ? formatDate(lead.lastContacted) : 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailLabel}>Assigned Agent:</Text>
          <Text style={styles.detailText}>{assignedAgentName}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.detailLabel}>Notes:</Text>
          <Text style={styles.notesText}>{lead.notes || 'No notes available.'}</Text>
        </View>

        {canChangeStatus && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Update Status:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(itemValue: Lead['status']) => handleStatusChange(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {['New', 'Contacted', 'Qualified', 'Nurturing', 'Site Visit Scheduled', 'Site Visited', 'Negotiation', 'Converted', 'Lost', 'Hold'].map(status => (
                  <Picker.Item key={status} label={status} value={status} style={styles.pickerItem} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {canAssignLeads && (
             <View style={styles.inputGroup}>
             <Text style={styles.label}>Reassign Lead:</Text>
             <View style={styles.pickerContainer}>
               <Picker
                 selectedValue={lead.assignedAgent || ''}
                 onValueChange={(itemValue: string) => handleAssignAgentChange(itemValue)}
                 style={styles.picker}
                 itemStyle={styles.pickerItem}
               >
                 <Picker.Item label="Unassigned" value="" style={styles.pickerItem} />
                 {agents.map((agent) => (
                   <Picker.Item key={agent.id} label={agent.name} value={agent.id} style={styles.pickerItem} />
                 ))}
               </Picker>
             </View>
           </View>
        )}

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
        {canAddActivity && (
          <View style={styles.addNoteContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a new activity..."
              multiline
              value={newActivityDescription}
              onChangeText={setNewActivityDescription}
            />
            <Button title="Add Activity" onPress={handleAddActivity} disabled={loading} />
          </View>
        )}

        {lead.activities.length === 0 ? (
          <Text style={styles.noActivitiesText}>No activities recorded yet.</Text>
        ) : (
          lead.activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityType}>{activity.type}</Text>
                <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
              </View>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityAgent}>Agent: {activity.agent}</Text>
            </View>
          ))
        )}
      </View>

      {/* Placeholder for Attachments section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attachments</Text>
        {lead.attachments.length === 0 ? (
          <Text style={styles.noActivitiesText}>No attachments.</Text>
        ) : (
          lead.attachments.map((attachment, index) => (
            <Text key={index}>{attachment}</Text> // Render attachment links/names
          ))
        )}
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50, // Adjust for status bar
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495e',
  },
  editButton: {
    padding: 5,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
    width: 130, // Fixed width for labels for better alignment
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
  },
  infoGroup: {
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  addNoteContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  noteInput: {
    height: 80,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  activityCard: {
    backgroundColor: '#fcfcfc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  activityType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2f80ed',
  },
  activityDate: {
    fontSize: 12,
    color: '#888',
  },
  activityDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  activityAgent: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
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
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: { // Style for Picker.Item if needed (platform dependent)
    fontSize: 15,
    color: '#333',
  },
});

export default LeadDetailsScreen;