import { useState } from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useLeadsStore } from "@/hooks/use-leads-store";

type TabOption = "all" | "unread" | "intake" | "qualified" | "converted";

const LeadTabs = () => {
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const leads = useLeadsStore((state) => state.leads);
  
  // Count leads by stage
  const intakeCount = leads.filter(lead => lead.stage === "Intake").length;
  const qualifiedCount = leads.filter(lead => lead.stage === "Qualified").length;
  const convertedCount = leads.filter(lead => lead.stage === "Converted").length;

  return (
    <div className="bg-white rounded-t-lg shadow-sm p-4 border-b border-[#E4E6EB]">
      <div className="flex items-center gap-4 text-sm">
        <button 
          className={`font-medium ${activeTab === "all" ? "text-primary border-b-2 border-primary pb-2" : "text-[#606770]"}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        
        <button 
          className={`font-medium ${activeTab === "unread" ? "text-primary border-b-2 border-primary pb-2" : "text-[#606770]"}`}
          onClick={() => setActiveTab("unread")}
        >
          Unread
        </button>
        
        <div className="flex items-center gap-1 text-[#606770]">
          <button 
            className={`font-medium ${activeTab === "intake" ? "text-primary" : "text-[#606770]"}`}
            onClick={() => setActiveTab("intake")}
          >
            Intake
          </button>
          <span className="bg-gray-200 text-xs px-1.5 py-0.5 rounded-full">
            {intakeCount || 0}
          </span>
          <ChevronRight className="h-3 w-3 ml-1" />
        </div>
        
        <div className="flex items-center gap-1 text-[#606770]">
          <button 
            className={`font-medium ${activeTab === "qualified" ? "text-primary" : "text-[#606770]"}`}
            onClick={() => setActiveTab("qualified")}
          >
            Qualified
          </button>
          <span className="bg-gray-200 text-xs px-1.5 py-0.5 rounded-full">
            {qualifiedCount || 0}
          </span>
          <ChevronRight className="h-3 w-3 ml-1" />
        </div>
        
        <div className="flex items-center gap-1 text-[#606770]">
          <button 
            className={`font-medium ${activeTab === "converted" ? "text-primary" : "text-[#606770]"}`}
            onClick={() => setActiveTab("converted")}
          >
            Converted
          </button>
          <span className="bg-gray-200 text-xs px-1.5 py-0.5 rounded-full">
            {convertedCount || 0}
          </span>
        </div>
        
        <div className="ml-auto">
          <button className="w-8 h-8 flex items-center justify-center text-[#606770]">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTabs;
