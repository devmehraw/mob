// screens/AddEditLeadScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from '../components/ui/Checkbox';
import { useLeads, NewLeadData, UpdateLeadData } from '../hooks/useLeads';
import { useAuth } from '../hooks/useAuth';
import { PermissionService } from '../lib/permissions';
import { User as AgentUser } from '../types/auth'; // Re-using User type for agents if structure is similar
import api from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme'; // Import the theme

// Mock data (replace with actual API calls in a real app)
const budgetRanges = ['< $100k', '$100k - $250k', '$250k - $500k', '$500k - $1M', '> $1M'];
const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const propertyTypes = ['Residential', 'Commercial', 'Land'];
const sources = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Advertisement', 'Other'];
const leadStatuses = ['New', 'Contacted', 'Qualified', 'Nurturing', 'Site Visit Scheduled', 'Site Visited', 'Negotiation', 'Converted', 'Lost', 'Hold'];
const leadScores = ['High', 'Medium', 'Low'];
const leadTypes = ['Lead', 'Cold-Lead'];

const AddEditLeadScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { leadId } = (route.params as { leadId?: string }) || {};

  const { user } = useAuth(); // Get the current user
  const { getLeadById, createLead, updateLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  const isEditing = !!leadId;

  const [formData, setFormData] = useState<NewLeadData | UpdateLeadData>({
    name: '',
    primaryPhone: '',
    secondaryPhone: '',
    primaryEmail: '',
    secondaryEmail: '',
    propertyType: 'Residential',
    budgetRange: budgetRanges[0],
    preferredLocations: [],
    source: 'Website',
    status: 'New',
    assignedAgent: user?.id || '', // Default to current user's ID
    notes: '',
    leadScore: 'Medium',
    leadType: 'Lead',
  });
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<AgentUser[]>([]); // State for agents list
  const [currentLocationsInput, setCurrentLocationsInput] = useState('');

  useEffect(() => {
    const fetchLeadData = async () => {
      if (isEditing && leadId) {
        setLoading(true);
        try {
          const leadData = await getLeadById(leadId);
          if (leadData) {
            setFormData({
              ...leadData,
              // Ensure preferredLocations is an array of strings
              preferredLocations: leadData.preferredLocations || [],
              // Set assignedAgent from leadData or default to current user if not set
              assignedAgent: leadData.assignedAgent || user?.id || '',
            });
            setCurrentLocationsInput(leadData.preferredLocations.join(', '));
          }
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to fetch lead data.');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      } else {
        // When adding a new lead, default assignedAgent to the current user
        setFormData(prev => ({ ...prev, assignedAgent: user?.id || '' }));
      }
    };

    // Fetch agents if the current user is an admin
    const fetchAgents = async () => {
      if (user?.role === 'admin' && permissionService.hasPermission(user, 'users', 'read')) {
        try {
          const response = await api.get('/admin/users', { params: { role: 'agent' } });
          setAgents(response.data.users);
        } catch (error: any) {
          console.error('Failed to fetch agents:', error.response?.data || error.message);
          Alert.alert('Error', 'Failed to load agents for assignment.');
        }
      }
    };

    fetchLeadData();
    fetchAgents();
  }, [leadId, isEditing, getLeadById, navigation, user, permissionService]);

  const handleChange = (name: keyof (NewLeadData | UpdateLeadData), value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationInputChange = (text: string) => {
    setCurrentLocationsInput(text);
    // Split by comma and trim each part to get an array of locations
    const locationsArray = text.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
    handleChange('preferredLocations', locationsArray);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        if (!permissionService.hasPermission(user, 'leads', 'update')) {
          Alert.alert('Permission Denied', 'You do not have permission to update leads.');
          setLoading(false);
          return;
        }
        await updateLead(leadId!, formData as UpdateLeadData);
        Alert.alert('Success', 'Lead updated successfully!');
      } else {
        if (!permissionService.hasPermission(user, 'leads', 'create')) {
          Alert.alert('Permission Denied', 'You do not have permission to create leads.');
          setLoading(false);
          return;
        }
        // Ensure assignedAgent is set for new leads
        const dataToCreate = {
          ...formData as NewLeadData,
          assignedAgent: formData.assignedAgent || user?.id, // Assign if not explicitly set
        };
        await createLead(dataToCreate);
        Alert.alert('Success', 'Lead created successfully!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save lead.');
    } finally {
      setLoading(false);
    }
  };

  const renderPickerItems = (items: string[]) => {
    return items.map(item => (
      <Picker.Item key={item} label={item} value={item} style={styles.pickerItem} />
    ));
  };

  // Check if the current user is an admin or the assigned agent for editing
  const canEditLead = permissionService.hasPermission(user, 'leads', 'update') && (
    user?.role === 'admin' || formData.assignedAgent === user?.id
  );

  // Check if the current user can assign leads (typically only admin)
  const canAssignLeads = permissionService.hasPermission(user, 'leads', 'assign');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={theme.typography.fontSize.h3} color={theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Lead' : 'Add New Lead'}</Text>
        <View style={{ width: theme.spacing.large }} />{/* Spacer for alignment */}
      </View>

      <View style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lead Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
            <Input
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Lead Name"
              editable={canEditLead || !isEditing} // Allow editing if new lead or if has permission
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Phone <Text style={styles.required}>*</Text></Text>
            <Input
              value={formData.primaryPhone}
              onChangeText={(text) => handleChange('primaryPhone', text)}
              placeholder="e.g., +1234567890"
              keyboardType="phone-pad"
              editable={canEditLead || !isEditing}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Secondary Phone</Text>
            <Input
              value={formData.secondaryPhone}
              onChangeText={(text) => handleChange('secondaryPhone', text)}
              placeholder="Optional Phone"
              keyboardType="phone-pad"
              editable={canEditLead || !isEditing}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Email <Text style={styles.required}>*</Text></Text>
            <Input
              value={formData.primaryEmail}
              onChangeText={(text) => handleChange('primaryEmail', text)}
              placeholder="e.g., example@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={canEditLead || !isEditing}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Secondary Email</Text>
            <Input
              value={formData.secondaryEmail}
              onChangeText={(text) => handleChange('secondaryEmail', text)}
              placeholder="Optional Email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={canEditLead || !isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Type <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.propertyType}
                onValueChange={(itemValue: 'Residential' | 'Commercial' | 'Land') => handleChange('propertyType', itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                enabled={canEditLead || !isEditing}
              >
                {renderPickerItems(propertyTypes)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget Range <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.budgetRange}
                onValueChange={(itemValue: string) => handleChange('budgetRange', itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                enabled={canEditLead || !isEditing}
              >
                {renderPickerItems(budgetRanges)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Locations (comma-separated)</Text>
            <Input
              value={currentLocationsInput}
              onChangeText={handleLocationInputChange}
              placeholder="e.g., New York, Los Angeles"
              editable={canEditLead || !isEditing}
              style={styles.textArea}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Source <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.source}
                onValueChange={(itemValue: 'Website' | 'Referral' | 'Social Media' | 'Walk-in' | 'Advertisement' | 'Other') => handleChange('source', itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                enabled={canEditLead || !isEditing}
              >
                {renderPickerItems(sources)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(itemValue: 'New' | 'Contacted' | 'Qualified' | 'Nurturing' | 'Site Visit Scheduled' | 'Site Visited' | 'Negotiation' | 'Converted' | 'Lost' | 'Hold') => handleChange('status', itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                enabled={canEditLead || !isEditing}
              >
                {renderPickerItems(leadStatuses)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lead Score <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.leadScore}
                onValueChange={(itemValue: 'High' | 'Medium' | 'Low') => handleChange('leadScore', itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                enabled={canEditLead || !isEditing}
              >
                {renderPickerItems(leadScores)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lead Type <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.leadType}
                onValueChange={(itemValue: 'Lead' | 'Cold-Lead') => handleChange('leadType', itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                enabled={canEditLead || !isEditing}
              >
                {renderPickerItems(leadTypes)}
              </Picker>
            </View>
          </View>

          {canAssignLeads && user?.role === 'admin' && ( // Only admin can assign agents
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assigned Agent</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.assignedAgent}
                  onValueChange={(itemValue: string) => handleChange('assignedAgent', itemValue)}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <Input
              value={formData.notes}
              onChangeText={(text) => handleChange('notes', text)}
              placeholder="Add notes about the lead..."
              multiline
              style={styles.textArea}
              editable={canEditLead || !isEditing}
            />
          </View>
        </View>

        <Button
          title={isEditing ? 'Update Lead' : 'Create Lead'}
          onPress={handleSubmit}
          disabled={loading || !(canEditLead || !isEditing)}
          style={styles.submitButton}
        />
        {loading && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingIndicator} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: 12,
    backgroundColor: theme.colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: 50, // Adjust for status bar
  },
  backButton: {
    padding: theme.spacing.xsmall,
  },
  title: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: '600', // As per instruction, keep fontWeight as string literal
    color: theme.colors.text.dark,
  },
  formContainer: {
    padding: theme.spacing.medium + theme.spacing.xsmall, // 20
  },
  section: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.medium - 1, // 15
    marginBottom: theme.spacing.medium, // 15
    ...theme.cardShadow,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: '600', // As per instruction, keep fontWeight as string literal
    color: theme.colors.text.dark,
    marginBottom: theme.spacing.medium - 1, // 15
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.small, // 8
  },
  inputGroup: {
    marginBottom: theme.spacing.medium - 1, // 15
  },
  label: {
    fontSize: theme.typography.fontSize.small, // 14, originally 15
    color: theme.colors.text.dark, // Using dark for labels, originally 333
    marginBottom: theme.spacing.small, // 8
    fontWeight: '500', // As per instruction, keep fontWeight as string literal
  },
  required: {
    color: theme.colors.danger,
  },
  pickerContainer: {
    borderColor: theme.colors.border, // Using border color, originally ddd
    borderWidth: 1,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.card,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: { // Style for Picker.Item if needed (platform dependent)
    fontSize: theme.typography.fontSize.small, // 14, originally 15
    color: theme.colors.text.dark, // Using dark for picker items, originally 333
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top', // For Android to start text at top
  },
  submitButton: {
    marginTop: theme.spacing.medium + theme.spacing.xsmall, // 20
  },
  loadingIndicator: {
    marginTop: theme.spacing.small, // 10
  },
});

export default AddEditLeadScreen;