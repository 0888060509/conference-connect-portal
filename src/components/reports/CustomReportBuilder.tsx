
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createReportTemplate, createReport } from "@/services/reportService";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReportVisualization, ReportConfig } from "@/types/reports";
import { FieldSelector } from "@/components/reports/FieldSelector";
import { VisualizationSelector } from "@/components/reports/VisualizationSelector";
import { FilterBuilder } from "@/components/reports/FilterBuilder";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { useNavigate } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export function CustomReportBuilder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    visualizations: ['bar'],
    metrics: [],
    dimensions: [],
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First create template
      const template = await createReportTemplate({
        name: values.name,
        description: values.description,
        type: 'custom',
        category: 'custom',
        config: reportConfig,
        is_public: values.isPublic,
      });
      
      // Then create report based on template
      const report = await createReport({
        template_id: template.id,
        name: values.name,
        description: values.description,
      });
      
      toast({
        title: "Report created",
        description: "Your custom report has been created successfully"
      });
      
      navigate(`/reports/${report.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  
  const updateVisualization = (vis: ReportVisualization[]) => {
    setReportConfig(prev => ({ ...prev, visualizations: vis }));
  };
  
  const updateMetrics = (metrics: string[]) => {
    setReportConfig(prev => ({ ...prev, metrics }));
  };
  
  const updateDimensions = (dimensions: string[]) => {
    setReportConfig(prev => ({ ...prev, dimensions }));
  };
  
  const updateFilters = (filters: Record<string, any>) => {
    setReportConfig(prev => ({ ...prev, filters }));
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Report</CardTitle>
            <CardDescription>
              Build a custom report by selecting data fields and visualizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={`flex items-center ${i < step ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <div 
                      className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 
                        ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {i}
                    </div>
                    <span className="hidden sm:inline">
                      {i === 1 && "Basic Info"}
                      {i === 2 && "Data Fields"}
                      {i === 3 && "Visualizations"}
                      {i === 4 && "Preview & Save"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
            
            {step === 1 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(nextStep)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Quarterly Room Utilization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed analysis of room usage patterns..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description for your report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">Next</Button>
                  </div>
                </form>
              </Form>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Metrics</h3>
                    <FieldSelector 
                      fieldType="metrics"
                      selectedFields={reportConfig.metrics}
                      onFieldsChange={updateMetrics}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dimensions</h3>
                    <FieldSelector 
                      fieldType="dimensions"
                      selectedFields={reportConfig.dimensions}
                      onFieldsChange={updateDimensions}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Filters</h3>
                  <FilterBuilder 
                    dimensions={reportConfig.dimensions}
                    metrics={reportConfig.metrics}
                    onFiltersChange={updateFilters}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>Back</Button>
                  <Button 
                    onClick={nextStep}
                    disabled={reportConfig.metrics.length === 0 || reportConfig.dimensions.length === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <VisualizationSelector 
                  selectedVisualizations={reportConfig.visualizations}
                  onChange={updateVisualization}
                />
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>Back</Button>
                  <Button 
                    onClick={nextStep}
                    disabled={reportConfig.visualizations.length === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-6">
                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Report Configuration:</h3>
                  <div className="text-sm space-y-2">
                    <p><span className="font-medium">Name:</span> {form.getValues("name")}</p>
                    <p><span className="font-medium">Description:</span> {form.getValues("description") || "N/A"}</p>
                    <p>
                      <span className="font-medium">Visualizations:</span> {reportConfig.visualizations.join(", ")}
                    </p>
                    <p>
                      <span className="font-medium">Metrics:</span> {reportConfig.metrics.join(", ")}
                    </p>
                    <p>
                      <span className="font-medium">Dimensions:</span> {reportConfig.dimensions.join(", ")}
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <ReportPreview config={reportConfig} />
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>Back</Button>
                  <Button onClick={form.handleSubmit(onSubmit)}>Create Report</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}
