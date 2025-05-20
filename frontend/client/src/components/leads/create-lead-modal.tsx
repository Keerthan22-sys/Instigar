import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { createLeadSchema, type CreateLead } from "@shared/schema";
import { useAssigneesStore } from "@/hooks/use-assignees-store";
import { useChannelsStore } from "@/hooks/use-channels-store";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: any) => void;
}

const CreateLeadModal = ({ isOpen, onClose, onCreateLead }: CreateLeadModalProps) => {
  // Get assignees and channels from shared stores
  const assignees = useAssigneesStore(state => state.assignees);
  const channels = useChannelsStore(state => state.channels);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateLead>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      stage: "Intake",
      channel: "walk-ins",
      assignedTo: "Unassigned",
      notes: "",
      course: "",
    }
  });

  const onSubmit = async (data: CreateLead) => {
    try {
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
        dateAdded: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
      
      console.log('Submitting lead data:', apiData); // Debug log
      await onCreateLead(apiData);
      reset();
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      // Show error message to user
      alert(error instanceof Error ? error.message : 'Failed to create lead. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        reset();
      }
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold text-[#1C1E21]">Create New Lead</DialogTitle>
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
            {errors.course && (
              <p className="text-xs text-red-500 mt-1">{errors.course.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="channel" className="text-sm font-medium text-[#606770]">
              Channel
            </Label>
            <Select 
              defaultValue="walk-ins" 
              onValueChange={(value) => {
                console.log('Selected channel value:', value);
                setValue("channel", value.toLowerCase());
              }}
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
            <Select defaultValue="Intake" onValueChange={(value) => setValue("stage", value)}>
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
            <Select defaultValue="Unassigned" onValueChange={(value) => setValue("assignedTo", value)}>
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
              className="bg-[#0866FF] hover:bg-[#0866FF]/90 text-white font-medium min-w-[120px]"
            >
              Create Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadModal;
