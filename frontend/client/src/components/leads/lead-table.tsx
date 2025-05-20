import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ChevronDown, ArrowDown, ArrowUpDown } from "lucide-react";
import LeadInitials from "@/components/leads/lead-initials";
import { type Lead } from "@shared/schema";

type SortField = "dateAdded" | "name" | "stage" | "channel" | "assignedTo" | "status";
type SortDirection = "asc" | "desc";

interface LeadTableProps {
  leads: Lead[];
}

const LeadTable = ({ leads }: LeadTableProps) => {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  const sortedLeads = [...leads].sort((a, b) => {
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

  return (
    <div className="bg-white rounded-b-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-white">
              <TableHead className="w-10">
                <Checkbox 
                  checked={selectedLeads.length === leads.length && leads.length > 0} 
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
            {sortedLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-[#F0F2F5] cursor-pointer">
                <TableCell>
                  <Checkbox 
                    checked={selectedLeads.includes(lead.id)} 
                    onCheckedChange={() => toggleSelectLead(lead.id)} 
                  />
                </TableCell>
                <TableCell className="text-sm text-[#1C1E21]">
                  {formatDate(lead.dateAdded)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <LeadInitials firstName={lead.firstName} lastName={lead.lastName} />
                    <span className="text-sm font-medium text-[#1C1E21]">
                      {lead.firstName} {lead.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-[#1C1E21]">
                    <span>{lead.stage}</span>
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#1C1E21]">{lead.channel}</TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-[#1C1E21]">
                    <span>{lead.assignedTo}</span>
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </div>
                </TableCell>
                <TableCell>
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
                <TableCell className="text-sm text-[#4BB543] font-medium">
                  {lead.action}
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-[#606770]">
                  No leads found. Create a new lead to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadTable;
