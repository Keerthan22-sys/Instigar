import { useState, useEffect, useCallback } from "react";
import LeadHeader from "@/components/leads/lead-header";
import LeadFilters, { FilterState } from "@/components/leads/lead-filters";
import LeadStats from "@/components/leads/lead-stats";
import LeadTabs from "@/components/leads/lead-tabs";
import LeadTable from "@/components/leads/lead-table";
import CreateLeadModal from "@/components/leads/create-lead-modal";
import UploadLeadsModal from "@/components/leads/upload-leads-modal";
import { useLeadsStore } from "@/hooks/use-leads-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isSameDay } from "date-fns";
import { Lead } from "@shared/schema";

const LeadsCenter = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterState>({ filters: {} });
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  
  const leads = useLeadsStore((state) => state.leads);
  const isLoading = useLeadsStore((state) => state.isLoading);
  const error = useLeadsStore((state) => state.error);
  const fetchLeads = useLeadsStore((state) => state.fetchLeads);
  const addLead = useLeadsStore((state) => state.addLead);
  
  // Fetch leads on component mount
  useEffect(() => {
    console.log('📥 LeadsCenter mounted, fetching leads...');
    fetchLeads().catch((error) => {
      console.error('❌ Error in fetchLeads:', error);
    });
  }, [fetchLeads]);

  // Apply filters when leads or filter state changes
  useEffect(() => {
    if (!leads) return;
    
    let filtered = [...leads];
    
    // Apply date filter if selected
    if (activeFilters.date) {
      filtered = filtered.filter(lead => {
        // Ensure proper date comparison
        return isSameDay(new Date(lead.dateAdded), new Date(activeFilters.date!));
      });
    }
    
    // Apply other filters
    if (activeFilters.filters) {
      // Filter by channel
      if (activeFilters.filters.channel && activeFilters.filters.channel.length > 0) {
        console.log('Filtering by channels:', activeFilters.filters.channel);
        filtered = filtered.filter(lead => {
          const leadChannel = lead.channel?.toLowerCase() || '';
          const filterChannels = activeFilters.filters.channel!.map(c => c.toLowerCase());
          console.log('Lead:', lead.firstName, lead.lastName);
          console.log('Lead channel:', leadChannel);
          console.log('Filter channels:', filterChannels);
          
          // Check if the lead's channel matches any of the selected filter channels
          const matches = filterChannels.some(filterChannel => {
            // Normalize both values for comparison
            const normalizedLeadChannel = leadChannel.replace(/\s+/g, '-');
            const normalizedFilterChannel = filterChannel.replace(/\s+/g, '-');
            console.log('Comparing:', normalizedLeadChannel, 'with', normalizedFilterChannel);
            return normalizedLeadChannel === normalizedFilterChannel;
          });
          
          console.log('Match result:', matches);
          return matches;
        });
      }
      
      // Filter by status
      if (activeFilters.filters.status && activeFilters.filters.status.length > 0) {
        filtered = filtered.filter(lead => {
          const leadStatus = lead.status?.toLowerCase() || '';
          const filterStatuses = activeFilters.filters.status!.map(s => s.toLowerCase());
          return filterStatuses.includes(leadStatus);
        });
      }
      
      // Filter by assigned to
      if (activeFilters.filters.assigned && activeFilters.filters.assigned.length > 0) {
        filtered = filtered.filter(lead => {
          const leadAssigned = lead.assignedTo?.toLowerCase() || '';
          const filterAssigned = activeFilters.filters.assigned!.map(a => a.toLowerCase());
          return filterAssigned.includes(leadAssigned) ||
            (filterAssigned.includes('unassigned') && leadAssigned === 'unassigned');
        });
      }
    }
    
    console.log('Filtered leads:', filtered);
    setFilteredLeads(filtered);
  }, [leads, activeFilters]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setActiveFilters(newFilters);
  }, []);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };
  
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };
  
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };
  
  const handleCreateLead = async (lead: any) => {
    try {
      console.log('Creating lead with data:', lead); // Debug log
      await addLead(lead);
      closeCreateModal();
      // Refresh the leads list after successful creation
      await fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      // Keep the modal open if there's an error
      // The error will be shown in the error alert
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <LeadHeader 
        onCreateLead={openCreateModal} 
        onUploadLeads={openUploadModal} 
      />
      
      <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button 
              onClick={toggleFilters}
              className="flex items-center gap-2 px-4 py-2 text-[#606770] font-medium border border-[#E4E6EB] rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              {showFilters ? "Hide filters" : "Show filters"}
            </button>
          </div>

          {showFilters && <LeadFilters onFilterChange={handleFilterChange} />}
        </div>
      </div>
      
      <LeadStats />
      
      <LeadTabs />
      
      {/* Display error message if API call fails */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. The app will still work with local data.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show active filter indicators if any filters are applied */}
      {(activeFilters.date || 
       (activeFilters.filters && Object.values(activeFilters.filters).some(f => f.length > 0))) && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Showing {filteredLeads.length} results with applied filters
            {activeFilters.date && (
              <span className="ml-2 font-semibold">
                Date: {new Date(activeFilters.date).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* Show loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <LeadTable 
          leads={filteredLeads.length > 0 ? filteredLeads : leads} 
          filters={activeFilters}
        />
      )}
      
      <CreateLeadModal 
        isOpen={isCreateModalOpen} 
        onClose={closeCreateModal}
        onCreateLead={handleCreateLead}
      />
      
      <UploadLeadsModal 
        isOpen={isUploadModalOpen} 
        onClose={closeUploadModal}
      />
    </div>
  );
};

export default LeadsCenter;
