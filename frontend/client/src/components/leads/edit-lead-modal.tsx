import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { type Lead } from "@shared/schema";
import { useAssigneesStore } from "@/hooks/use-assignees-store";
import { useChannelsStore } from "@/hooks/use-channels-store";
import { useLeadsStore } from "@/hooks/use-leads-store";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const EditLeadModal = ({ isOpen, onClose, lead }: EditLeadModalProps) => {
  const updateLead = useLeadsStore((state) => state.updateLead);
  const assignees = useAssigneesStore(state => state.assignees);
  const channels = useChannelsStore(state => state.channels);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Lead>({
    defaultValues: {
      ...lead,
      dateAdded: typeof lead.dateAdded === 'string' ? new Date(lead.dateAdded) : lead.dateAdded
    }
  });

  const onSubmit = async (data: Lead) => {
    try {
      setIsSubmitting(true);
      // Format data for Spring Boot API
      const apiData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        stage: data.stage,
        source: data.channel.toLowerCase(),
        assignedTo: data.assignedTo,
        notes: data.notes,
        course: data.course,
        dateAdded: data.dateAdded instanceof Date ? data.dateAdded.toISOString().split('T')[0] : data.dateAdded
      };
      
      await updateLead(lead.id, apiData);
      onClose();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(error instanceof Error ? error.message : 'Failed to update lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold text-[#1C1E21]">Edit Lead</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#606770]">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-[#606770]">
              First Name *
            </Label>
            <Input 
              id="firstName" 
              {...register("firstName")}
              className="mt-1 border-[#E4E6EB] focus:border-primary focus:ring-primary"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-[#606770]">
              Last Name *
            </Label>
            <Input 
              id="lastName" 
              {...register("lastName")}
              className="mt-1 border-[#E4E6EB] focus:border-primary focus:ring-primary"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-[#606770]">
              Email Address *
            </Label>
            <Input 
              id="email" 
              type="email"
              {...register("email")}
              className="mt-1 border-[#E4E6EB] focus:border-primary focus:ring-primary"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-[#606770]">
              Phone Number *
            </Label>
            <Input 
              id="phone" 
              {...register("phone")}
              className="mt-1 border-[#E4E6EB] focus:border-primary focus:ring-primary"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="course" className="text-sm font-medium text-[#606770]">
              Course
            </Label>
            <Input 
              id="course" 
              {...register("course")}
              className="mt-1 border-[#E4E6EB] focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <Label htmlFor="channel" className="text-sm font-medium text-[#606770]">
              Channel
            </Label>
            <Select 
              defaultValue={lead.channel}
              onValueChange={(value) => setValue("channel", value.toLowerCase())}
            >
              <SelectTrigger id="channel" className="mt-1 border-[#E4E6EB]">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="stage" className="text-sm font-medium text-[#606770]">
              Stage
            </Label>
            <Select 
              defaultValue={lead.stage}
              onValueChange={(value) => setValue("stage", value)}
            >
              <SelectTrigger id="stage" className="mt-1 border-[#E4E6EB]">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Intake">Intake</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="assignedTo" className="text-sm font-medium text-[#606770]">
              Assigned To
            </Label>
            <Select 
              defaultValue={lead.assignedTo}
              onValueChange={(value) => setValue("assignedTo", value)}
            >
              <SelectTrigger id="assignedTo" className="mt-1 border-[#E4E6EB]">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.value} value={assignee.label}>
                    {assignee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-[#606770]">
              Notes
            </Label>
            <Textarea 
              id="notes" 
              {...register("notes")}
              className="mt-1 border-[#E4E6EB] focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white pb-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="border-[#E4E6EB] text-[#606770] font-medium min-w-[80px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0866FF] hover:bg-[#0866FF]/90 text-white font-medium min-w-[120px]"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal; 