import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Assignee = {
  label: string;
  value: string;
};

interface AssigneesState {
  assignees: Assignee[];
  addAssignee: (name: string) => void;
  removeAssignee: (value: string) => void;
  getAssignees: () => Assignee[];
}

// Initial default assignees
const defaultAssignees: Assignee[] = [
  { label: "Unassigned", value: "unassigned" },
  { label: "John Doe", value: "john_doe" },
  { label: "Jane Smith", value: "jane_smith" },
];

// Create a store that persists assignee data in localStorage
export const useAssigneesStore = create<AssigneesState>()(
  persist(
    (set, get) => ({
      assignees: defaultAssignees,
      
      addAssignee: (name: string) => {
        if (!name.trim()) return;
        
        const value = name.trim().toLowerCase().replace(/\s+/g, '_');
        
        // Check if already exists
        const exists = get().assignees.some(
          a => a.label.toLowerCase() === name.trim().toLowerCase() || 
               a.value === value
        );
        
        if (exists) return;
        
        const newAssignee: Assignee = {
          label: name.trim(),
          value: value
        };
        
        set(state => ({
          assignees: [...state.assignees, newAssignee]
        }));
      },
      
      removeAssignee: (value: string) => {
        // Don't allow removing default unassigned option
        if (value === 'unassigned') return;
        
        set(state => ({
          assignees: state.assignees.filter(a => a.value !== value)
        }));
      },
      
      getAssignees: () => {
        return get().assignees;
      }
    }),
    {
      name: 'leads-assignees-storage', // unique name for localStorage
    }
  )
);