
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReportTemplates, createReport } from "@/services/reportService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportTemplate } from "@/types/reports";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, PieChart, LineChart, ListFilter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReportTemplateList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: getReportTemplates
  });
  
  const filteredTemplates = templates?.filter(
    template => !selectedCategory || template.category === selectedCategory
  );
  
  const handleCreateReport = async (template: ReportTemplate) => {
    try {
      const newReport = await createReport({
        template_id: template.id,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        parameters: {}
      });
      
      toast({
        title: "Report created",
        description: "Your report has been created successfully."
      });
      
      navigate(`/reports/${newReport.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getVisualIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return <BarChart className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      case 'line':
        return <LineChart className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };
  
  if (isLoading) return <div>Loading report templates...</div>;
  if (error) return <div>Error loading templates</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Report Templates</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "bg-secondary" : ""}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory('utilization')}
            className={selectedCategory === 'utilization' ? "bg-secondary" : ""}
          >
            Utilization
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory('cost')}
            className={selectedCategory === 'cost' ? "bg-secondary" : ""}
          >
            Cost
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory('department')}
            className={selectedCategory === 'department' ? "bg-secondary" : ""}
          >
            Department
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge>{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                {template.config.visualizations.map((vis) => (
                  <span key={vis} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                    {getVisualIcon(vis)} {vis}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-medium mb-1">Metrics:</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.config.metrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>
                <div className="font-medium mb-1">Dimensions:</div>
                <div className="flex flex-wrap gap-1">
                  {template.config.dimensions.map((dim) => (
                    <Badge key={dim} variant="secondary" className="text-xs">
                      {dim}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button 
                onClick={() => handleCreateReport(template)} 
                className="w-full"
              >
                Create Report
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
