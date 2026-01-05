import { create } from 'zustand';
import { format } from 'date-fns';
import { type Lead, type SpringLead, type WalkinLead } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  fetchWalkinsLeads: () => Promise<void>;
  addLead: (lead: any) => Promise<void>;
  addWalkinLead: (lead: any) => Promise<void>;
  updateLead: (id: number, lead: Partial<SpringLead>) => Promise<void>;
  deleteLead: (id: number) => Promise<void>;
}

// Helper function to convert Spring Boot API lead to frontend Lead type
const convertToLeadDisplay = (springLead: SpringLead): Lead => {
  const nameParts = springLead.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  console.log('Converting API lead:', springLead);
  const convertedLead = {
    id: springLead.id || 0,
    firstName,
    lastName,
    email: springLead.email,
    phone: springLead.phone,
    stage: springLead.stage,
    channel: springLead.source?.toLowerCase().replace('_', '-') || '', // Convert walk_ins to walk-ins
    assignedTo: springLead.assignedTo,
    status: 'Active',
    dateAdded: springLead.dateAdded ? new Date(springLead.dateAdded) : new Date(),
    action: 'Complete form',
    notes: springLead.notes || '',
    course: springLead.course || '',
    amount: springLead.amount || 0
  };
  console.log('Converted lead:', convertedLead);
  return convertedLead;
};

// Helper function to convert Spring Boot API walkin lead to frontend WalkinLead type
const convertToWalkinLeadDisplay = (springLead: SpringLead): WalkinLead & Lead => {
  const nameParts = springLead.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  console.log('Converting API walkin lead:', springLead);
  const convertedLead: WalkinLead & Lead = {
    id: springLead.id || 0,
    firstName,
    lastName,
    email: springLead.email,
    phone: springLead.phone,
    stage: springLead.stage,
    channel: springLead.source?.toLowerCase().replace('_', '-') || '',
    assignedTo: springLead.assignedTo,
    status: 'Active',
    dateAdded: springLead.dateAdded ? new Date(springLead.dateAdded) : new Date(),
    action: 'Complete form',
    notes: springLead.notes || '',
    course: springLead.course || '',
    amount: springLead.amount || 0,
    // Walkin-specific fields
    fatherName: springLead.fatherName || '',
    motherName: springLead.motherName || '',
    fatherPhoneNumber: springLead.fatherPhoneNumber || '',
    motherPhoneNumber: springLead.motherPhoneNumber || '',
    address: springLead.address || '',
    previousInstitution: springLead.previousInstitution || '',
    marksObtained: springLead.marksObtained || '',
    type: 'walkin' as const
  };
  console.log('Converted walkin lead:', convertedLead);
  return convertedLead;
};

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,
  
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching leads from API');
      
      // First, try to debug auth if 403 occurs
      try {
        const debugResponse = await apiRequest('GET', '/api/leads/debug-auth');
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          console.log('🔍 Auth Debug Info:', debugData);
        }
      } catch (debugError) {
        console.warn('⚠️ Could not fetch debug auth info:', debugError);
      }
      
      const response = await apiRequest('GET', '/api/leads/filter?type=leads');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of leads');
      }
      const convertedLeads = data.map(convertToLeadDisplay);
      set({ leads: convertedLeads, isLoading: false });
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch leads', 
        isLoading: false,
        leads: [] // Set empty array instead of initialLeads to avoid confusion
      });
    }
  },

  fetchWalkinsLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('GET', '/api/leads/filter?type=walkin');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of leads');
      }
      // Use walkin conversion function to preserve all walkin-specific fields
      const convertedLeads = data.map(convertToWalkinLeadDisplay);
      set({ leads: convertedLeads as Lead[], isLoading: false });
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch leads', 
        isLoading: false,
        leads: [] // Set empty array instead of initialLeads to avoid confusion
      });
    }
  },
  
  addLead: async (lead) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Sending lead data to API:', lead); // Debug log
      // Ensure type is set to 'leads' by default unless explicitly provided
      const payload = { ...lead, type: lead?.type ?? 'leads' };
      const response = await apiRequest('POST', '/api/leads', payload);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create lead: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data); // Debug log
      
      const newLead = convertToLeadDisplay(data);
      
      // Update the leads list with the new lead at the beginning
      set((state) => ({
        leads: [newLead, ...state.leads],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error adding lead:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add lead', 
        isLoading: false 
      });
      throw error; // Re-throw to let the UI handle the error
    }
  },

  addWalkinLead: async (lead) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Sending lead data to API:', lead); // Debug log
      // Ensure type is set to 'walkin' by default unless explicitly provided
      const payload = { ...lead, type: lead?.type ?? 'walkin' };
      const response = await apiRequest('POST', '/api/leads', payload);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create lead: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data); // Debug log
      
      // Use walkin conversion function to preserve all walkin-specific fields
      const newLead = convertToWalkinLeadDisplay(data);
      
      // Update the leads list with the new lead at the beginning
      set((state) => ({
        leads: [newLead as Lead, ...state.leads],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error adding lead:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add lead', 
        isLoading: false 
      });
      throw error; // Re-throw to let the UI handle the error
    }
  },
  
  updateLead: async (id, lead) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Updating lead with data:', lead); // Debug log
      const response = await apiRequest('PUT', `/api/leads/${id}`, lead);
      const data = await response.json();
      console.log('Update API response:', data); // Debug log
      
      // Check if it's a walkin by checking for walkin-specific fields in the response
      const isWalkin = data.type === 'walkin' || data.fatherName || data.previousInstitution;
      const updatedLead = isWalkin ? convertToWalkinLeadDisplay(data) : convertToLeadDisplay(data);
      
      set((state) => ({
        leads: state.leads.map(l => l.id === id ? (updatedLead as Lead) : l),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating lead:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update lead', 
        isLoading: false 
      });
    }
  },
  
  deleteLead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest('DELETE', `/api/leads/${id}`);
      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting lead:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete lead', 
        isLoading: false 
      });
    }
  }
}));