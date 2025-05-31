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
import { useAssigneesStore } from "@/hooks/use-assignees-store";
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
  stage: FilterItem[];
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
  stage: [
    { label: "Intake", value: "intake" },
    { label: "Qualified", value: "qualified" },
    { label: "Converted", value: "converted" },
  ],
};

const LeadFilters = ({ onFilterChange }: LeadFiltersProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    forms: [],
    status: [],
    channel: [],
    assigned: [],
    stage: [],
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

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      const currentFilters = prev[filterType] || [];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value];
      
      return {
        ...prev,
        [filterType]: newFilters
      };
    });
  };

  const handleAddAssignee = () => {
    if (newAssignedName.trim()) {
      addAssignee({ label: newAssignedName, value: newAssignedName.toLowerCase() });
      setNewAssignedName("");
    }
  };

  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      addChannel({ label: newChannelName, value: newChannelName.toLowerCase() });
      setNewChannelName("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[200px] justify-start text-left font-normal ${
                date ? "text-[#1C1E21]" : "text-[#606770]"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Stage Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              Stage
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {filterOptions.stage.map((stage) => (
              <DropdownMenuItem key={stage.value} className="flex items-center">
                <Checkbox
                  id={`stage-${stage.value}`}
                  checked={filters.stage?.includes(stage.value)}
                  onCheckedChange={() => handleFilterChange("stage", stage.value)}
                  className="mr-2"
                />
                <label
                  htmlFor={`stage-${stage.value}`}
                  className="text-sm cursor-pointer"
                >
                  {stage.label}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Channel Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              Channel
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {channels.map((channel) => (
              <DropdownMenuItem key={channel.value} className="flex items-center">
                <Checkbox
                  id={`channel-${channel.value}`}
                  checked={filters.channel?.includes(channel.value)}
                  onCheckedChange={() => handleFilterChange("channel", channel.value)}
                  className="mr-2"
                />
                <label
                  htmlFor={`channel-${channel.value}`}
                  className="text-sm cursor-pointer"
                >
                  {channel.label}
                </label>
              </DropdownMenuItem>
            ))}
            <div className="p-2 border-t">
              <div className="flex gap-2">
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Add new channel"
                  className="h-8"
                />
                <Button
                  size="sm"
                  onClick={handleAddChannel}
                  className="h-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assigned To Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              Assigned To
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {assignees.map((assignee) => (
              <DropdownMenuItem key={assignee.value} className="flex items-center">
                <Checkbox
                  id={`assigned-${assignee.value}`}
                  checked={filters.assigned?.includes(assignee.value)}
                  onCheckedChange={() => handleFilterChange("assigned", assignee.value)}
                  className="mr-2"
                />
                <label
                  htmlFor={`assigned-${assignee.value}`}
                  className="text-sm cursor-pointer"
                >
                  {assignee.label}
                </label>
              </DropdownMenuItem>
            ))}
            <div className="p-2 border-t">
              <div className="flex gap-2">
                <Input
                  value={newAssignedName}
                  onChange={(e) => setNewAssignedName(e.target.value)}
                  placeholder="Add new assignee"
                  className="h-8"
                />
                <Button
                  size="sm"
                  onClick={handleAddAssignee}
                  className="h-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              Status
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {filterOptions.status.map((status) => (
              <DropdownMenuItem key={status.value} className="flex items-center">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status?.includes(status.value)}
                  onCheckedChange={() => handleFilterChange("status", status.value)}
                  className="mr-2"
                />
                <label
                  htmlFor={`status-${status.value}`}
                  className="text-sm cursor-pointer"
                >
                  {status.label}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {(date || Object.values(filters).some(f => f.length > 0)) && (
        <div className="flex flex-wrap gap-2">
          {date && (
            <div className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-1 rounded-full">
              <span className="text-sm text-[#1C1E21]">
                Date: {format(date, "d MMM yyyy")}
              </span>
              <button
                onClick={() => setDate(undefined)}
                className="text-[#606770] hover:text-[#1C1E21]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {Object.entries(filters).map(([type, values]) =>
            values.map((value) => (
              <div key={`${type}-${value}`} className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-1 rounded-full">
                <span className="text-sm text-[#1C1E21]">
                  {type}: {value}
                </span>
                <button
                  onClick={() => handleFilterChange(type, value)}
                  className="text-[#606770] hover:text-[#1C1E21]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
