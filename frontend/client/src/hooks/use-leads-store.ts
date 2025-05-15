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

// Generate current date and dates for sample data
const currentDate = new Date();
const yesterday = new Date(currentDate);
yesterday.setDate(currentDate.getDate() - 1);

const dayBefore = new Date(currentDate);
dayBefore.setDate(currentDate.getDate() - 2);

// Initial leads data for fallback if API is not available
const initialLeads: Lead[] = [
  { 
    id: 1, 
    firstName: 'Seetharam', 
    lastName: 'Manjhi', 
    email: 'seetharam@example.com',
    phone: '+1234567890',
    dateAdded: yesterday, // Yesterday
    stage: 'Intake', 
    source: 'Paid', 
    assignedTo: 'Unassigned', 
    channel: 'Email address', 
    status: 'Inactive', 
    action: 'Complete form',
    notes: '',
    course: ''
  },
  { 
    id: 2, 
    firstName: 'Abu', 
    lastName: 'Zer', 
    email: 'abu@example.com',
    phone: '+1234567891',
    dateAdded: dayBefore, // Day before yesterday
    stage: 'Intake', 
    source: 'Paid', 
    assignedTo: 'Unassigned', 
    channel: 'Email address', 
    status: 'Complete form', 
    action: 'Complete form',
    notes: '',
    course: ''
  },
  { 
    id: 3, 
    firstName: 'Jane', 
    lastName: 'Smith', 
    email: 'jane@example.com',
    phone: '+1234567892',
    dateAdded: yesterday, // Yesterday
    stage: 'Qualified', 
    source: 'Organic', 
    assignedTo: 'John Doe', 
    channel: 'Phone', 
    status: 'Active', 
    action: 'Schedule call',
    notes: 'Interested in premium service',
    course: 'Marketing 101'
  },
  { 
    id: 4, 
    firstName: 'John', 
    lastName: 'Miller', 
    email: 'john@example.com',
    phone: '+1234567893',
    dateAdded: currentDate, // Today
    stage: 'Converted', 
    source: 'Referral', 
    assignedTo: 'Jane Smith', 
    channel: 'Email', 
    status: 'Active', 
    action: 'Send welcome email',
    notes: 'Conversion complete',
    course: 'Business Strategy'
  }
];

// Helper function to convert Spring Boot API lead to frontend Lead type
const convertToLeadDisplay = (springLead: SpringLead): Lead => {
  // Split the name into firstName and lastName
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
    channel: 'Email', // Default value since Spring Boot API doesn't have this
    status: 'Active', // Default value
    dateAdded: springLead.dateAdded ? new Date(springLead.dateAdded) : new Date(),
    action: 'Complete form',
    notes: springLead.notes || '',
    course: springLead.course || ''
  };
};

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: initialLeads, // Start with initial data for development
  isLoading: false,
  error: null,
  
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      // For now, use the initial data instead of trying to connect to API
      // This ensures the app works without a backend
      // When backend is available, this will be replaced with proper API call
      
      // Uncomment the next lines when backend is connected
      // const data = await apiRequest<SpringLead[]>('GET', '/api/leads');
      // const convertedLeads = Array.isArray(data) ? data.map(convertToLeadDisplay) : [];
      // set({ leads: convertedLeads, isLoading: false });
      
      // For development, use initial data to ensure UI renders
      setTimeout(() => {
        set({ leads: initialLeads, isLoading: false });
      }, 500);
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch leads', 
        isLoading: false,
        leads: initialLeads // Always show sample leads if API fails
      });
    }
  },
  
  addLead: async (lead) => {
    set({ isLoading: true, error: null });
    try {
      // Comment this out for development without backend
      // const data = await apiRequest<SpringLead>('POST', '/api/leads', lead);
      
      // For development, use local data
      console.log('Would send to API:', lead);
      
      // Create a local lead entry
      const nameParts = lead.name.split(' ');
      const localLead: Lead = {
        id: Date.now(), // Generate a temporary ID
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: lead.email,
        phone: lead.phone,
        dateAdded: new Date(),
        stage: lead.stage,
        source: lead.source,
        assignedTo: lead.assignedTo,
        channel: 'Email',
        status: 'Active',
        action: 'Complete form',
        notes: lead.notes || '',
        course: lead.course || ''
      };
      
      set((state) => ({
        leads: [localLead, ...state.leads],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding lead:', error);
      
      // Display the error but don't add any duplicate lead since we already did that above
      set((state) => ({
        error: error instanceof Error ? error.message : 'Failed to add lead to API',
        isLoading: false
      }));
    }
  },
  
  updateLead: async (id, lead) => {
    set({ isLoading: true, error: null });
    try {
      // For development without backend
      // const data = await apiRequest<SpringLead>('PUT', `/api/leads/${id}`, lead);
      // const updatedLead = convertToLeadDisplay(data);
      
      console.log('Would send to API:', lead);
      
      // Update lead locally
      set((state) => {
        const existingLead = state.leads.find(l => l.id === id);
        if (!existingLead) {
          return { 
            error: 'Lead not found', 
            isLoading: false 
          };
        }
        
        // Only update fields that are in the update payload
        const updatedLead = { ...existingLead };
        if (lead.name) {
          const nameParts = lead.name.split(' ');
          updatedLead.firstName = nameParts[0] || '';
          updatedLead.lastName = nameParts.slice(1).join(' ') || '';
        }
        if (lead.email) updatedLead.email = lead.email;
        if (lead.phone) updatedLead.phone = lead.phone;
        if (lead.stage) updatedLead.stage = lead.stage;
        if (lead.source) updatedLead.source = lead.source;
        if (lead.assignedTo) updatedLead.assignedTo = lead.assignedTo;
        if (lead.notes) updatedLead.notes = lead.notes;
        if (lead.course) updatedLead.course = lead.course;
        
        return {
          leads: state.leads.map(l => l.id === id ? updatedLead : l),
          isLoading: false
        };
      });
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
      // For development without backend
      // await apiRequest('DELETE', `/api/leads/${id}`);
      console.log('Would delete lead from API:', id);
      
      // Delete locally
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
