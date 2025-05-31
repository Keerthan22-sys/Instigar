import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FilterItem = {
  label: string;
  value: string;
};

interface ChannelsState {
  channels: FilterItem[];
  addChannel: (channel: FilterItem) => void;
  removeChannel: (value: string) => void;
}

// Default channels
const defaultChannels: FilterItem[] = [
  { label: "Walk-ins", value: "walk-ins" },
  { label: "Phone", value: "phone" },
  { label: "Website", value: "website" },
  { label: "Social Media", value: "social-media" },
];

// Load channels from localStorage or use defaults
const loadChannels = (): FilterItem[] => {
  try {
    const storedChannels = localStorage.getItem('channels');
    if (storedChannels) {
      const parsedChannels = JSON.parse(storedChannels);
      // Ensure default channels are always present
      const defaultValues = defaultChannels.map(ch => ch.value);
      const customChannels = parsedChannels.filter((ch: FilterItem) => !defaultValues.includes(ch.value));
      return [...defaultChannels, ...customChannels];
    }
  } catch (error) {
    console.error('Error loading channels from localStorage:', error);
  }
  return defaultChannels;
};

export const useChannelsStore = create<ChannelsState>()(
  persist(
    (set) => ({
      channels: loadChannels(),
      
      addChannel: (channel) => {
        set((state) => {
          // Check if channel already exists
          if (state.channels.some(ch => ch.value === channel.value)) {
            return state;
          }
          const newChannels = [...state.channels, channel];
          // Save to localStorage
          localStorage.setItem('channels', JSON.stringify(newChannels));
          return { channels: newChannels };
        });
      },
      
      removeChannel: (value: string) => {
        set((state) => {
          // Don't allow removing default channels
          if (defaultChannels.some(ch => ch.value === value)) {
            return state;
          }
          const newChannels = state.channels.filter(ch => ch.value !== value);
          // Save to localStorage
          localStorage.setItem('channels', JSON.stringify(newChannels));
          return { channels: newChannels };
        });
      }
    }),
    {
      name: 'channels-storage', // unique name for localStorage key
      partialize: (state) => ({ channels: state.channels }), // only persist channels
    }
  )
); 