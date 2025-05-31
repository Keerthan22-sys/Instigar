import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FilterItem = {
  label: string;
  value: string;
};

interface AssigneesState {
  assignees: FilterItem[];
  addAssignee: (assignee: FilterItem) => void;
  removeAssignee: (value: string) => void;
}

// Initial default assignees
const defaultAssignees: FilterItem[] = [
  { label: "Unassigned", value: "unassigned" },
  { label: "John Doe", value: "john_doe" },
  { label: "Jane Smith", value: "jane_smith" },
];

// Create a store that persists assignee data in localStorage
export const useAssigneesStore = create<AssigneesState>()(
  persist(
    (set, get) => ({
      assignees: defaultAssignees,
      
      addAssignee: (assignee) => {
        if (!assignee.label.trim() || !assignee.value.trim()) return;
        
        const value = assignee.value.trim().toLowerCase().replace(/\s+/g, '_');
        
        // Check if already exists
        const exists = get().assignees.some(
          a => a.label.toLowerCase() === assignee.label.trim().toLowerCase() || 
               a.value === value
        );
        
        if (exists) return;
        
        set(state => ({
          assignees: [...state.assignees, assignee]
        }));
      },
      
      removeAssignee: (value: string) => {
        // Don't allow removing default unassigned option
        if (value === 'unassigned') return;
        
        set(state => ({
          assignees: state.assignees.filter(a => a.value !== value)
        }));
      },
    }),
    {
      name: 'leads-assignees-storage', // unique name for localStorage
    }
  )
);