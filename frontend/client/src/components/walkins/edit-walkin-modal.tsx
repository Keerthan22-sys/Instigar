import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type WalkinLead, walkinLeadDisplaySchema } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useLeadsStore } from "@/hooks/use-leads-store";

interface EditWalkinModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: WalkinLead;
}

const EditWalkinModal = ({ isOpen, onClose, lead }: EditWalkinModalProps) => {
  const updateLead = useLeadsStore((state) => state.updateLead);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<WalkinLead>({
    resolver: zodResolver(walkinLeadDisplaySchema),
    defaultValues: {
      ...lead,
      dateAdded: typeof lead.dateAdded === 'string' ? new Date(lead.dateAdded) : lead.dateAdded,
      amount: lead.amount ?? (lead as any).amount ?? 0,
      fatherName: lead.fatherName ?? (lead as any).fatherName ?? '',
      motherName: lead.motherName ?? (lead as any).motherName ?? '',
      fatherPhoneNumber: lead.fatherPhoneNumber ?? (lead as any).fatherPhoneNumber ?? '',
      motherPhoneNumber: lead.motherPhoneNumber ?? (lead as any).motherPhoneNumber ?? '',
      address: lead.address ?? (lead as any).address ?? '',
      previousInstitution: lead.previousInstitution ?? (lead as any).previousInstitution ?? '',
      marksObtained: lead.marksObtained ?? (lead as any).marksObtained ?? '',
      type: 'walkin' as const,
    },
  });

  const onSubmit = async (values: WalkinLead) => {
    try {
      setIsSubmitting(true);
      // Format data for Spring Boot API - same format as create
      const apiData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        stage: values.stage,
        source: values.channel.toLowerCase().replace(/\s+/g, '-'),
        assignedTo: values.assignedTo,
        notes: values.notes || '',
        course: values.course || '',
        dateAdded: values.dateAdded instanceof Date 
          ? values.dateAdded.toISOString().split('T')[0] 
          : values.dateAdded,
        type: 'walkin',
        amount: values.amount ?? 0,
        // Walkin-specific fields
        fatherName: values.fatherName,
        motherName: values.motherName,
        fatherPhoneNumber: values.fatherPhoneNumber,
        motherPhoneNumber: values.motherPhoneNumber,
        address: values.address,
        previousInstitution: values.previousInstitution,
        marksObtained: values.marksObtained,
      };
      
      await updateLead(lead.id, apiData);
      // Refresh the walkins list after successful update
      // The store will automatically update the leads list
      onClose();
    } catch (error) {
      console.error("Error updating walkin lead:", error);
      alert(error instanceof Error ? error.message : 'Failed to update walkin lead. Please try again.');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold text-[#1C1E21]">Edit Walk-in Lead</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#606770]">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Student Information</h3>
                
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Parent Information</h3>

                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatherPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motherPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Academic Information</h3>

              <FormField
                control={form.control}
                name="previousInstitution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter previous institution" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marksObtained"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks Obtained</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter marks obtained" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Intake">Intake</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter assigned person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter admission amount" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWalkinModal;

