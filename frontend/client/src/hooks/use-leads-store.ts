import { create } from 'zustand';
import { format } from 'date-fns';
import { type Lead, type SpringLead } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  addLead: (lead: any) => Promise<void>;
  updateLead: (id: number, lead: Partial<SpringLead>) => Promise<void>;
  deleteLead: (id: number) => Promise<void>;
}

// Helper function to convert Spring Boot API lead to frontend Lead type
const convertToLeadDisplay = (springLead: SpringLead): Lead => {
  const nameParts = springLead.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    id: springLead.id || 0,
    firstName,
    lastName,
    email: springLead.email,
    phone: springLead.phone,
    stage: springLead.stage,
    source: springLead.source,
    assignedTo: springLead.assignedTo,
<<<<<<< Updated upstream
    channel: 'Email',
=======
    //channel: 'Email',
>>>>>>> Stashed changes
    status: 'Active',
    dateAdded: springLead.dateAdded ? new Date(springLead.dateAdded) : new Date(),
    action: 'Complete form',
    notes: springLead.notes || '',
    course: springLead.course || ''
  };
};

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,
  
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('GET', '/api/leads');
<<<<<<< Updated upstream
      const data = await response.json();
      const convertedLeads = Array.isArray(data) ? data.map(convertToLeadDisplay) : [];
=======
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of leads');
      }
      const convertedLeads = data.map(convertToLeadDisplay);
>>>>>>> Stashed changes
      set({ leads: convertedLeads, isLoading: false });
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch leads', 
<<<<<<< Updated upstream
        isLoading: false
=======
        isLoading: false,
        leads: [] // Set empty array instead of initialLeads to avoid confusion
>>>>>>> Stashed changes
      });
    }
  },
  
  addLead: async (lead) => {
    set({ isLoading: true, error: null });
    try {
<<<<<<< Updated upstream
      const response = await apiRequest('POST', '/api/leads', lead);
      const data = await response.json();
=======
      console.log('Sending lead data to API:', lead); // Debug log
      const response = await apiRequest('POST', '/api/leads', lead);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create lead: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data); // Debug log
      
>>>>>>> Stashed changes
      const newLead = convertToLeadDisplay(data);
      
      // Update the leads list with the new lead at the beginning
      set((state) => ({
        leads: [newLead, ...state.leads],
<<<<<<< Updated upstream
        isLoading: false
=======
        isLoading: false,
        error: null
>>>>>>> Stashed changes
      }));
    } catch (error) {
      console.error('Error adding lead:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add lead', 
        isLoading: false 
      });
<<<<<<< Updated upstream
=======
      throw error; // Re-throw to let the UI handle the error
>>>>>>> Stashed changes
    }
  },
  
  updateLead: async (id, lead) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('PUT', `/api/leads/${id}`, lead);
      const data = await response.json();
      const updatedLead = convertToLeadDisplay(data);
      
      set((state) => ({
        leads: state.leads.map(l => l.id === id ? updatedLead : l),
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