import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddLeadsButton from "@/components/leads/add-leads-button";
import { Bell, MessageSquare } from "lucide-react";

interface LeadHeaderProps {
  onCreateLead: () => void;
  onUploadLeads: () => void;
}

const LeadHeader = ({ onCreateLead, onUploadLeads }: LeadHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-[#1C1E21]">Leads Centre</h1>
      <div className="flex items-center gap-4">
        <AddLeadsButton 
          onCreateLead={onCreateLead} 
          onUploadLeads={onUploadLeads} 
        />
        
        <div className="relative">
          <Button variant="outline" className="w-10 h-10 p-0 rounded-full bg-white border border-[#E4E6EB] flex items-center justify-center">
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 bg-[#0866FF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white p-0"
            >
              1
            </Badge>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadHeader;
