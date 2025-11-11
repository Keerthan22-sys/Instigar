import { useState, useEffect, useCallback } from "react";
import LeadHeader from "@/components/leads/lead-header";
import LeadFilters, { FilterState } from "@/components/leads/lead-filters";
import LeadStats from "@/components/leads/lead-stats";
import LeadTabs from "@/components/leads/lead-tabs";
import LeadTable from "@/components/leads/lead-table";
import CreateWalkinModal from "@/components/walkins/create-walkin-modal";
import UploadLeadsModal from "@/components/leads/upload-leads-modal";
import { useLeadsStore } from "@/hooks/use-leads-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isSameDay } from "date-fns";
import { type Lead, type CreateWalkinLead } from "@shared/schema";

const WalkinsCenter = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterState>({ filters: {} });
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  
  const leads = useLeadsStore((state) => state.leads);
  const isLoading = useLeadsStore((state) => state.isLoading);
  const error = useLeadsStore((state) => state.error);
  const fetchWalkinsLeads = useLeadsStore((state) => state.fetchWalkinsLeads);
  const addWalkinLead = useLeadsStore((state) => state.addWalkinLead);
  
  // Fetch leads on component mount
  useEffect(() => {
    fetchWalkinsLeads();
  }, [fetchWalkinsLeads]);

  // Apply filters when leads or filter state changes
  useEffect(() => {
    const filtered = leads.filter(lead => {
      // Filter by stage
      if (activeFilters.filters?.stage && activeFilters.filters.stage.length > 0) {
        if (!activeFilters.filters.stage.includes(lead.stage.toLowerCase())) {
          return false;
        }
      }

      // Filter by channel
      if (activeFilters.filters?.channel && activeFilters.filters.channel.length > 0) {
        if (!activeFilters.filters.channel.includes(lead.channel.toLowerCase())) {
          return false;
        }
      }

      // Filter by assigned to
      if (activeFilters.filters?.assigned && activeFilters.filters.assigned.length > 0) {
        if (!activeFilters.filters.assigned.includes(lead.assignedTo.toLowerCase())) {
          return false;
        }
      }

      // Filter by status
      if (activeFilters.filters?.status && activeFilters.filters.status.length > 0) {
        if (!activeFilters.filters.status.includes(lead.status.toLowerCase())) {
          return false;
        }
      }

      // Filter by date
      if (activeFilters.date) {
        const leadDate = new Date(lead.dateAdded);
        const filterDate = new Date(activeFilters.date);
        if (!isSameDay(leadDate, filterDate)) {
          return false;
        }
      }

      return true;
    });

    setFilteredLeads(filtered);
  }, [leads, activeFilters]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

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

  const handleCreateLead = async (lead: CreateWalkinLead) => {
    await addWalkinLead(lead);
    closeCreateModal();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <LeadHeader 
        onCreateLead={openCreateModal} 
        onUploadLeads={openUploadModal} 
        title="Walk-ins"
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
          isWalkin={true}
        />
      )}
      
      <CreateWalkinModal 
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

export default WalkinsCenter; 