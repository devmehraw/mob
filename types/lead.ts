// types/lead.ts
export interface Lead {
  id: string;
  name: string;
  primaryPhone: string;
  secondaryPhone?: string;
  primaryEmail: string;
  secondaryEmail?: string;
  propertyType: 'Residential' | 'Commercial' | 'Land';
  budgetRange: string;
  preferredLocations: string[];
  source: 'Website' | 'Referral' | 'Social Media' | 'Walk-in' | 'Advertisement' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Nurturing' | 'Site Visit Scheduled' | 'Site Visited' | 'Negotiation' | 'Converted' | 'Lost' | 'Hold';
  assignedAgent?: string; // This should be the ID of the assigned agent
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  lastContacted?: Date;
  leadScore: 'High' | 'Medium' | 'Low';
  activities: Activity[];
  attachments: string[];
  createdBy?: string; // ID of the user who created the lead
  leadType: 'Lead' | 'Cold-Lead';
}

export interface Activity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Status Change' | 'Property Shown';
  description: string;
  date: Date | string; // Updated to allow string
  agent: string; // Name or ID of the agent who performed the activity
  metadata?: Record<string, any>; // For extra data like task priority, etc.
}

export interface Agent { // This interface can be used if you fetch agent details
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  userId?: string; // Link to the User ID in auth system
}

export interface LeadFilters {
  status?: Lead['status'];
  assignedAgent?: string;
  source?: Lead['source'];
  leadType?: Lead['leadType'];
  // Add other filterable fields as needed
}