// hooks/useLeads.ts
import { useState, useEffect, useCallback } from 'react';
import { Lead, Activity } from '../types/lead'; // Adjust path if needed
import api from '../utils/api'; // Import your axios instance
import AsyncStorage from '@react-native-async-storage/async-storage'; // To get token for auth headers

// Define the shape of data required for adding a new lead (without backend-generated fields)
export type NewLeadData = Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities' | 'lastContacted' | 'attachments'> & {
  activities?: Activity[]; // Ensure activities can be included when creating, even if empty
  attachments?: string[]; // Ensure attachments can be included
};

// Define the shape of data required for updating an existing lead
export type UpdateLeadData = Partial<Omit<Lead, 'createdAt' | 'updatedAt'>>; // Make sure it's partial and omits backend-generated fields

// Extend the hook return type to include the typed fetch function
interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: (leadType?: 'Lead' | 'Cold-Lead') => Promise<void>; // Updated signature
  getLeadById: (id: string) => Promise<Lead | null>; // Added getLeadById
  createLead: (leadData: NewLeadData) => Promise<Lead>;
  updateLead: (id: string, updateData: UpdateLeadData) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  addActivity: (leadId: string, activityData: Omit<Activity, 'id'> & { date?: Date | string }) => Promise<Lead>;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get auth headers
  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchLeads = useCallback(async (leadType?: 'Lead' | 'Cold-Lead') => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<Lead[]>('/leads', {
        headers,
        params: { leadType },
      });
      setLeads(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch leads';
      setError(errorMessage);
      console.error('Error fetching leads:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const getLeadById = useCallback(async (id: string): Promise<Lead | null> => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<Lead>(`/leads/${id}`, { headers });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch lead details';
      setError(errorMessage);
      console.error('Error fetching lead details:', err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const createLead = useCallback(async (leadData: NewLeadData): Promise<Lead> => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<Lead>('/leads', leadData, { headers });
      setLeads(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create lead';
      setError(errorMessage);
      console.error('Error creating lead:', err.response?.data || err.message);
      throw new Error(errorMessage);
    }
  }, [getAuthHeaders]);

  const updateLead = useCallback(async (id: string, updateData: UpdateLeadData): Promise<Lead> => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await api.put<Lead>(`/leads/${id}`, updateData, { headers });
      setLeads(prev => prev.map(lead => (lead.id === id ? response.data : lead)));
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update lead';
      setError(errorMessage);
      console.error('Error updating lead:', err.response?.data || err.message);
      throw new Error(errorMessage);
    }
  }, [getAuthHeaders]);

  const deleteLead = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      await api.delete(`/leads/${id}`, { headers });
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete lead';
      setError(errorMessage);
      console.error('Error deleting lead:', err.response?.data || err.message);
      throw new Error(errorMessage);
    }
  }, [getAuthHeaders]);

  const addActivity = useCallback(async (
    leadId: string,
    activityData: Omit<Activity, 'id'> & { date?: Date | string }
  ): Promise<Lead> => {
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await api.post(`/leads/${leadId}/activities`, activityData, { headers });
      const updatedLead = response.data;
      setLeads(prev => prev.map(lead => (lead.id === leadId ? updatedLead : lead)));
      return updatedLead;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add activity';
      setError(errorMessage);
      console.error('Error adding activity:', err.response?.data || err.message);
      throw new Error(errorMessage);
    }
  }, [getAuthHeaders]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    getLeadById, // Make sure this is returned
    createLead,
    updateLead,
    deleteLead,
    addActivity,
  };
};