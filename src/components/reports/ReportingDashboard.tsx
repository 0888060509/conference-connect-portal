
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportTemplateList } from "@/components/reports/ReportTemplateList";
import { MyReports } from "@/components/reports/MyReports";
import { CustomReportBuilder } from "@/components/reports/CustomReportBuilder";
import { ScheduledReports } from "@/components/reports/ScheduledReports";
import { ReportFavorites } from "@/components/reports/ReportFavorites";
import { ReportHistory } from "@/components/reports/ReportHistory";

export function ReportingDashboard() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full md:w-auto">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-6">
          <ReportTemplateList />
        </TabsContent>
        
        <TabsContent value="my-reports" className="mt-6">
          <MyReports />
        </TabsContent>
        
        <TabsContent value="builder" className="mt-6">
          <CustomReportBuilder />
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-6">
          <ScheduledReports />
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          <ReportFavorites />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <ReportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
