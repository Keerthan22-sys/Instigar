import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown } from "lucide-react";

interface AddLeadsButtonProps {
  onCreateLead: () => void;
  onUploadLeads: () => void;
}

const AddLeadsButton = ({ onCreateLead, onUploadLeads }: AddLeadsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#0866FF] hover:bg-[#0866FF]/90 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add leads
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => {
            setIsOpen(false);
            onCreateLead();
          }}
          className="cursor-pointer"
        >
          Create lead
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setIsOpen(false);
            onUploadLeads();
          }}
          className="cursor-pointer"
        >
          Upload leads
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddLeadsButton;
