
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart, 
  ScatterChart, 
  Table 
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportVisualization } from "@/types/reports";

const VISUALIZATIONS = [
  { id: "bar", label: "Bar Chart", icon: BarChart, description: "Compare values across categories" },
  { id: "line", label: "Line Chart", icon: LineChart, description: "Show trends over time" },
  { id: "pie", label: "Pie Chart", icon: PieChart, description: "Show proportion of a whole" },
  { id: "area", label: "Area Chart", icon: AreaChart, description: "Show cumulative totals over time" },
  { id: "scatter", label: "Scatter Plot", icon: ScatterChart, description: "Show correlation between variables" },
  { id: "table", label: "Table", icon: Table, description: "Display data in rows and columns" },
];

interface VisualizationSelectorProps {
  selectedVisualizations: ReportVisualization[];
  onChange: (visualizations: ReportVisualization[]) => void;
}

export function VisualizationSelector({ 
  selectedVisualizations, 
  onChange 
}: VisualizationSelectorProps) {
  const toggleVisualization = (vis: ReportVisualization) => {
    if (selectedVisualizations.includes(vis)) {
      onChange(selectedVisualizations.filter(v => v !== vis));
    } else {
      onChange([...selectedVisualizations, vis]);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Visualizations</h3>
      <p className="text-muted-foreground">
        Select one or more visualization types for your report
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VISUALIZATIONS.map((vis) => (
          <Card 
            key={vis.id} 
            className={`cursor-pointer transition-colors ${
              selectedVisualizations.includes(vis.id as ReportVisualization) 
                ? "border-primary bg-primary/5" 
                : ""
            }`}
            onClick={() => toggleVisualization(vis.id as ReportVisualization)}
          >
            <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{vis.label}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {vis.description}
                </CardDescription>
              </div>
              <Checkbox 
                checked={selectedVisualizations.includes(vis.id as ReportVisualization)}
                className="mt-1"
                onCheckedChange={() => toggleVisualization(vis.id as ReportVisualization)}
              />
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <vis.icon className="h-16 w-16 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
