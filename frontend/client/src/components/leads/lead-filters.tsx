import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ChevronDown, CalendarIcon, Plus, X } from "lucide-react";
import { useAssigneesStore, type Assignee } from "@/hooks/use-assignees-store";
import { useChannelsStore } from "@/hooks/use-channels-store";

export type FilterItem = {
  label: string;
  value: string;
};

export type FilterOptions = {
  forms: FilterItem[];
  status: FilterItem[];
  channel: FilterItem[];
  assigned: FilterItem[];
};

export interface FilterState {
  date?: Date;
  filters: Record<string, string[]>;
}

export interface LeadFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

// Filter options for everything except assignees and channels, which come from their respective stores
const filterOptions: Omit<FilterOptions, 'assigned' | 'channel'> = {
  forms: [
    { label: "Contact Form", value: "contact_form" },
    { label: "Landing Page", value: "landing_page" },
    { label: "Signup Form", value: "signup_form" },
  ],
  status: [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Complete form", value: "complete_form" },
  ],
};

const LeadFilters = ({ onFilterChange }: LeadFiltersProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    forms: [],
    status: [],
    channel: [],
    assigned: [],
  });
  
  // Get assignees and channels from their respective stores
  const assignees = useAssigneesStore(state => state.assignees);
  const addAssignee = useAssigneesStore(state => state.addAssignee);
  const removeAssignee = useAssigneesStore(state => state.removeAssignee);
  
  const channels = useChannelsStore(state => state.channels);
  const addChannel = useChannelsStore(state => state.addChannel);
  const removeChannel = useChannelsStore(state => state.removeChannel);
  
  // State for the custom inputs
  const [newAssignedName, setNewAssignedName] = useState("");
  const [newChannelName, setNewChannelName] = useState("");

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange({ date, filters });
  }, [date, filters, onFilterChange]);

  const handleFilterSelect = (filterType: string, value: string) => {
    console.log('Filter selected:', filterType, value);
    setFilters((prev) => {
      const currentValues = prev[filterType] || [];
      if (currentValues.includes(value)) {
        const newValues = currentValues.filter((v) => v !== value);
        console.log('Removing value:', value, 'New values:', newValues);
        return {
          ...prev,
          [filterType]: newValues,
        };
      } else {
        const newValues = [...currentValues, value];
        console.log('Adding value:', value, 'New values:', newValues);
        return {
          ...prev,
          [filterType]: newValues,
        };
      }
    });
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  // Add a new name to the "Assigned to" filter options using shared store
  const handleAddAssignedName = () => {
    if (!newAssignedName.trim()) return;
    
    // Add to the shared store
    addAssignee(newAssignedName);
    setNewAssignedName(""); // Clear the input
  };
  
  // Remove a name from the "Assigned to" filter options
  const handleRemoveAssignedName = (valueToRemove: string) => {
    // First remove it from selected filters if it's selected
    setFilters(prev => ({
      ...prev,
      assigned: prev.assigned.filter(v => v !== valueToRemove)
    }));
    
    // Then remove it from shared store
    removeAssignee(valueToRemove);
  };

  // Add a new channel to the filter options
  const handleAddChannel = () => {
    if (!newChannelName.trim()) return;
    addChannel(newChannelName);
    setNewChannelName(""); // Clear the input
  };

  // Remove a channel from the filter options
  const handleRemoveChannel = (valueToRemove: string) => {
    // First remove it from selected filters if it's selected
    setFilters(prev => ({
      ...prev,
      channel: prev.channel.filter(v => v !== valueToRemove)
    }));
    
    // Then remove it from the store
    removeChannel(valueToRemove);
  };

  const clearFilters = () => {
    setFilters({
      forms: [],
      status: [],
      channel: [],
      assigned: [],
    });
    setDate(undefined);
  };

  const createFilterDropdown = (
    filterType: keyof FilterOptions | 'assigned',
    label: string,
    icon?: React.ReactNode
  ) => {
    // Special case for "assigned" filter type
    if (filterType === 'assigned') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={`px-3 py-2 h-auto text-sm font-medium flex items-center gap-1 ${
                filters[filterType]?.length > 0 
                  ? "bg-blue-50 text-primary border-primary" 
                  : "text-[#606770]"
              }`}
            >
              {icon}
              {label} 
              {filters[filterType]?.length > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center mx-1">
                  {filters[filterType].length}
                </span>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="p-2 border-b">
              <p className="text-xs text-gray-500 mb-1">Add a new person to assign leads to:</p>
              <div className="flex gap-2">
                <Input 
                  type="text"
                  placeholder="Enter name"
                  className="h-8 text-sm"
                  value={newAssignedName}
                  onChange={(e) => setNewAssignedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAssignedName();
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={handleAddAssignedName}
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {assignees.map((option) => (
                <DropdownMenuItem key={option.value} className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${filterType}-${option.value}`}
                      checked={filters[filterType]?.includes(option.value)}
                      onCheckedChange={() => handleFilterSelect(filterType, option.value)}
                    />
                    <label
                      htmlFor={`${filterType}-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </div>
                  
                  {/* Don't allow deleting the default "Unassigned" option */}
                  {option.value !== 'unassigned' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAssignedName(option.value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // Special case for "channel" filter type
    if (filterType === 'channel') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={`px-3 py-2 h-auto text-sm font-medium flex items-center gap-1 ${
                filters[filterType]?.length > 0 
                  ? "bg-blue-50 text-primary border-primary" 
                  : "text-[#606770]"
              }`}
            >
              {icon}
              {label} 
              {filters[filterType]?.length > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center mx-1">
                  {filters[filterType].length}
                </span>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="p-2 border-b">
              <p className="text-xs text-gray-500 mb-1">Add a new channel:</p>
              <div className="flex gap-2">
                <Input 
                  type="text"
                  placeholder="Enter channel name"
                  className="h-8 text-sm"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChannel();
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={handleAddChannel}
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {channels.map((option) => (
                <DropdownMenuItem key={option.value} className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${filterType}-${option.value}`}
                      checked={filters[filterType]?.includes(option.value)}
                      onCheckedChange={() => handleFilterSelect(filterType, option.value)}
                    />
                    <label
                      htmlFor={`${filterType}-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </div>
                  
                  {/* Don't allow deleting the default options */}
                  {!['walk-ins', 'phone', 'website', 'social-media'].includes(option.value) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveChannel(option.value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // Standard filter dropdown for other filter types
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`px-3 py-2 h-auto text-sm font-medium flex items-center gap-1 ${
              filters[filterType]?.length > 0 
                ? "bg-blue-50 text-primary border-primary" 
                : "text-[#606770]"
            }`}
          >
            {icon}
            {label} 
            {filters[filterType]?.length > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center mx-1">
                {filters[filterType].length}
              </span>
            )}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {filterOptions[filterType].map((option) => (
            <DropdownMenuItem key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`${filterType}-${option.value}`}
                checked={filters[filterType]?.includes(option.value)}
                onCheckedChange={() => handleFilterSelect(filterType, option.value)}
              />
              <label
                htmlFor={`${filterType}-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button variant="outline" className="px-3 py-2 h-auto text-[#606770] text-sm flex items-center">
        <Plus className="h-3 w-3 mr-2" /> Add filters
      </Button>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-2 items-center">
        {createFilterDropdown("forms", "Forms")}
        
        {/* Date filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={`px-3 py-2 h-auto text-sm font-medium flex items-center gap-1 ${
                date ? "bg-blue-50 text-primary border-primary" : "text-[#606770]"
              }`}
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              {date ? format(date, "PPP") : "Select dates"} <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="p-2 border-b border-gray-200">
              <h3 className="text-sm font-medium">Select Date</h3>
              <p className="text-xs text-gray-500">Filter leads by date</p>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              toDate={new Date()}
            />
            {date && (
              <div className="p-2 border-t border-gray-200 flex justify-between">
                <span className="text-xs text-gray-500">
                  Filtering by {format(date, "MMMM d, yyyy")}
                </span>
                <Button 
                  variant="ghost" 
                  className="h-auto py-0 px-2 text-xs text-red-600 hover:text-red-800"
                  onClick={() => handleDateSelect(undefined)}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
        
        {createFilterDropdown("status", "Status")}
        {createFilterDropdown("channel", "Channel")}
        {createFilterDropdown("assigned", "Assigned to")}

        <Button 
          variant="ghost" 
          className="px-3 py-2 h-auto text-[#606770] text-sm font-medium flex items-center gap-1"
          onClick={clearFilters}
        >
          <X className="h-3 w-3 mr-1" /> Clear filters
        </Button>
      </div>
    </div>
  );
};

export default LeadFilters;
