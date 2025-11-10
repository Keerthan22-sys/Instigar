import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddLeadsButton from "@/components/leads/add-leads-button";
import { Bell, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

interface LeadHeaderProps {
  onCreateLead: () => void;
  onUploadLeads: () => void;
  title?: string;
}

const LeadHeader = ({ onCreateLead, onUploadLeads, title = "Leads" }: LeadHeaderProps) => {
  const [, navigate] = useLocation();
  const isWalkinsPage = title === "Walk-ins";

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-[#1C1E21]">{title}</h1>
        {!isWalkinsPage && (
          <Button
            variant="outline"
            onClick={() => navigate("/walkins")}
            className="text-[#606770] hover:text-[#1C1E21]"
          >
            Walk-ins
          </Button>
        )}
        {isWalkinsPage && (
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-[#606770] hover:text-[#1C1E21]"
          >
            Back to Leads
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onUploadLeads}
          className="text-[#606770] hover:text-[#1C1E21]"
        >
          Upload Leads
        </Button>
        <Button onClick={onCreateLead}>
          {isWalkinsPage ? "Add Walk-in" : "Add Lead"}
        </Button>
      </div>
    </div>
  );
};

export default LeadHeader;
