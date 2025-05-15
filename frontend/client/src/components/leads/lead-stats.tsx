import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { useLeadsStore } from "@/hooks/use-leads-store";

const LeadStats = () => {
  const leads = useLeadsStore((state) => state.leads);
  
  // Calculate statistics
  const intakeLeads = leads.filter(lead => lead.stage === "Intake").length;
  const convertedLeads = leads.filter(lead => lead.stage === "Converted").length;
  const conversionRate = leads.length > 0 
    ? Math.round((convertedLeads / leads.length) * 100) 
    : 0;

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Card className="flex-1 min-w-[200px] shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#606770]">
                Intake leads: {intakeLeads > 0 ? intakeLeads : "--"}
              </h3>
              <Button variant="ghost" className="text-[#606770] rounded-full w-5 h-5 p-0">
                <InfoIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-w-[200px] shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#606770]">
                Converted leads: {convertedLeads > 0 ? convertedLeads : "--"}
              </h3>
              <Button variant="ghost" className="text-[#606770] rounded-full w-5 h-5 p-0">
                <InfoIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-w-[200px] shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#606770]">
                Conversion rate: {conversionRate > 0 ? `${conversionRate}%` : "--"}
              </h3>
              <Button variant="ghost" className="text-[#606770] rounded-full w-5 h-5 p-0">
                <InfoIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="ml-auto">
        <Button variant="link" className="px-3 py-2 text-primary text-sm font-medium">
          View all
        </Button>
      </div>
    </div>
  );
};

export default LeadStats;
