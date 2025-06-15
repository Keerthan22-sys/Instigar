import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLeadsStore } from "@/hooks/use-leads-store";

interface UploadLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadLeadsModal = ({ isOpen, onClose }: UploadLeadsModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const fetchLeads = useLeadsStore((state) => state.fetchLeads);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv") {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/leads/csv/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast({
        title: "Upload successful",
        description: "Your leads have been uploaded successfully",
      });

      // Refresh the leads list
      await fetchLeads();
      onClose();
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload leads",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setSelectedFile(null);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold text-[#1C1E21]">Upload Leads</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#606770]">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center
              ${isDragging ? "border-primary" : "border-[#E4E6EB]"}
              ${selectedFile ? "bg-blue-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <Upload className="h-12 w-12 text-primary mx-auto" />
            </div>
            
            <p className="text-sm text-[#606770] mb-2">
              {selectedFile 
                ? `Selected file: ${selectedFile.name}` 
                : "Drag and drop your CSV file here or"}
            </p>
            
            <Button 
              type="button" 
              className="bg-[#0866FF] hover:bg-[#0866FF]/90 text-white rounded-md font-medium text-sm"
              onClick={handleBrowseClick}
            >
              Browse Files
            </Button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".csv" 
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <p className="mt-2 text-xs text-[#606770]">Supported file: CSV</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-[#1C1E21] mb-2">CSV Format Guidelines</h3>
            <p className="text-xs text-[#606770] mb-2">Your CSV file should include the following columns:</p>
            <ul className="text-xs text-[#606770] list-disc pl-5 space-y-1">
              <li>name (required)</li>
              <li>stage (required)</li>
              <li>source (required)</li>
              <li>assignedTo (required)</li>
              <li>notes (optional)</li>
              <li>email (required)</li>
              <li>phone (required)</li>
              <li>course (optional)</li>
              <li>dateAdded (required, format: YYYY-MM-DD)</li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="border-[#E4E6EB] text-[#606770] font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`${selectedFile ? 'bg-[#0866FF] hover:bg-[#0866FF]/90' : 'bg-gray-300 cursor-not-allowed'} text-white font-medium`}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Leads'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadLeadsModal;
