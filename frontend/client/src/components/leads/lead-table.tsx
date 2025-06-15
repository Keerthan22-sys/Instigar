import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ChevronDown, ArrowDown, ArrowUpDown } from "lucide-react";
import LeadInitials from "@/components/leads/lead-initials";
import { type Lead } from "@shared/schema";
import EditLeadModal from "./edit-lead-modal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SortField = "dateAdded" | "name" | "stage" | "channel" | "assignedTo" | "status";
type SortDirection = "asc" | "desc";

interface LeadTableProps {
  leads: Lead[];
  filters?: {
    date?: Date;
    filters: Record<string, string[]>;
  };
}

const ITEMS_PER_PAGE = 20;

const LeadTable = ({ leads, filters }: LeadTableProps) => {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const toggleSelectLead = (id: number) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4" />;
    return sortDirection === "asc" ? 
      <ArrowDown className="ml-1 h-4 w-4 rotate-180" /> : 
      <ArrowDown className="ml-1 h-4 w-4" />;
  };

  // Format the date displayed in the table
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, "d MMM yyyy");
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  const handleCellClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  // Apply filters and sort the leads
  const filteredAndSortedLeads = [...leads]
    .filter(lead => {
      // Filter by stage
      if (filters?.filters?.stage && filters.filters.stage.length > 0) {
        if (!filters.filters.stage.includes(lead.stage.toLowerCase())) {
          return false;
        }
      }

      // Filter by channel
      if (filters?.filters?.channel && filters.filters.channel.length > 0) {
        if (!filters.filters.channel.includes(lead.channel.toLowerCase())) {
          return false;
        }
      }

      // Filter by assigned to
      if (filters?.filters?.assigned && filters.filters.assigned.length > 0) {
        if (!filters.filters.assigned.includes(lead.assignedTo.toLowerCase())) {
          return false;
        }
      }

      // Filter by status
      if (filters?.filters?.status && filters.filters.status.length > 0) {
        if (!filters.filters.status.includes(lead.status.toLowerCase())) {
          return false;
        }
      }

      // Filter by date
      if (filters?.date) {
        const leadDate = new Date(lead.dateAdded);
        const filterDate = new Date(filters.date);
        if (
          leadDate.getFullYear() !== filterDate.getFullYear() ||
          leadDate.getMonth() !== filterDate.getMonth() ||
          leadDate.getDate() !== filterDate.getDate()
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      
      switch (sortField) {
        case "dateAdded":
          return direction * (new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
        case "name":
          return direction * (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
        case "stage":
          return direction * a.stage.localeCompare(b.stage);
        case "channel":
          return direction * a.channel.localeCompare(b.channel);
        case "assignedTo":
          return direction * a.assignedTo.localeCompare(b.assignedTo);
        case "status":
          return direction * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeads = filteredAndSortedLeads.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-b-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-white">
              <TableHead className="w-10">
                <Checkbox 
                  checked={selectedLeads.length === currentLeads.length && currentLeads.length > 0} 
                  onCheckedChange={toggleSelectAll} 
                />
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-xs font-medium text-[#606770] uppercase tracking-wider"
                  onClick={() => handleSort("dateAdded")}
                >
                  Date added
                  {getSortIcon("dateAdded")}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-xs font-medium text-[#606770] uppercase tracking-wider"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-xs font-medium text-[#606770] uppercase tracking-wider"
                  onClick={() => handleSort("stage")}
                >
                  Stage
                  {getSortIcon("stage")}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-xs font-medium text-[#606770] uppercase tracking-wider"
                  onClick={() => handleSort("channel")}
                >
                  Channel
                  {getSortIcon("channel")}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-xs font-medium text-[#606770] uppercase tracking-wider"
                  onClick={() => handleSort("assignedTo")}
                >
                  Assigned to
                  {getSortIcon("assignedTo")}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center text-xs font-medium text-[#606770] uppercase tracking-wider"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {getSortIcon("status")}
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium text-[#606770] uppercase tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLeads.map((lead) => (
              <TableRow 
                key={lead.id} 
                className={`hover:bg-[#F0F2F5] ${lead.stage === "Converted" ? "bg-green-50" : ""}`}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedLeads.includes(lead.id)} 
                    onCheckedChange={() => toggleSelectLead(lead.id)} 
                  />
                </TableCell>
                <TableCell 
                  className="text-sm text-[#1C1E21] cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  {formatDate(lead.dateAdded)}
                </TableCell>
                <TableCell 
                  className="cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  <div className="flex items-center">
                    <LeadInitials firstName={lead.firstName} lastName={lead.lastName} />
                    <span className="text-sm font-medium text-[#1C1E21]">
                      {lead.firstName} {lead.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell 
                  className="cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  <div className="flex items-center text-sm text-[#1C1E21]">
                    <span>{lead.stage}</span>
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </div>
                </TableCell>
                <TableCell 
                  className="text-sm text-[#1C1E21] cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  {lead.channel}
                </TableCell>
                <TableCell 
                  className="cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  <div className="flex items-center text-sm text-[#1C1E21]">
                    <span>{lead.assignedTo}</span>
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </div>
                </TableCell>
                <TableCell 
                  className="cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  {lead.status === "Inactive" ? (
                    <Badge variant="secondary" className="bg-[#F5F7FA] text-[#606770] hover:bg-[#F5F7FA] hover:text-[#606770]">
                      Inactive
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                      {lead.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell 
                  className="text-sm text-[#4BB543] font-medium cursor-pointer"
                  onClick={() => handleCellClick(lead)}
                >
                  {lead.action}
                </TableCell>
              </TableRow>
            ))}
            {currentLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-[#606770]">
                  No leads found matching the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="py-4 px-6 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {selectedLead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
        />
      )}
    </div>
  );
};

export default LeadTable;
