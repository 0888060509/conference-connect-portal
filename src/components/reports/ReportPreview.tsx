
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ReportConfig, ReportData, ReportVisualization } from "@/types/reports";
import { 
  Bar, 
  Line, 
  Pie, 
  ComposedChart, 
  Area, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { useTheme } from "next-themes";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportPreviewProps {
  config: ReportConfig;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8'];

export function ReportPreview({ config }: ReportPreviewProps) {
  const { theme } = useTheme();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Set up mock data based on config
  useEffect(() => {
    setLoading(true);
    
    // In a real app, this would fetch data from an API
    setTimeout(() => {
      const mockData: ReportData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: config.metrics[0] || 'Value',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };
      
      // Add additional datasets if multiple metrics selected
      if (config.metrics.length > 1) {
        mockData.datasets.push({
          label: config.metrics[1],
          data: [28, 48, 40, 19, 86, 27],
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        });
      }
      
      setData(mockData);
      setLoading(false);
    }, 1500);
  }, [config]);
  
  // Convert data to Recharts format
  const rechartsData = data ? data.labels.map((label, i) => {
    const dataPoint: Record<string, any> = { name: label };
    data.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[i];
    });
    return dataPoint;
  }) : [];
  
  // Get a chart configuration for Recharts based on visualization type
  const getChart = (type: ReportVisualization) => {
    if (!data || loading) {
      return <Skeleton className="w-full h-64" />;
    }
    
    const chartConfig = {
      bar: {
        label: "Bar Chart",
        colors: {
          light: { background: "#F9FAFB", text: "#111827", grid: "#E5E7EB" },
          dark: { background: "#1F2937", text: "#F9FAFB", grid: "#374151" }
        }
      },
      line: {
        label: "Line Chart",
        theme: {
          light: "#3B82F6",
          dark: "#60A5FA"
        }
      },
      pie: {
        label: "Pie Chart",
        theme: {
          light: "#0f172a",
          dark: "#f1f5f9"
        }
      }
    };
    
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets.map((dataset, index) => (
                <Bar 
                  key={dataset.label} 
                  dataKey={dataset.label} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets.map((dataset, index) => (
                <Line 
                  key={dataset.label} 
                  type="monotone" 
                  dataKey={dataset.label} 
                  stroke={COLORS[index % COLORS.length]} 
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <Pie
              data={rechartsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey={data.datasets[0].label}
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {rechartsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets.map((dataset, index) => (
                <Area 
                  key={dataset.label} 
                  type="monotone" 
                  dataKey={dataset.label} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={COLORS[index % COLORS.length]} 
                  fillOpacity={0.3}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets.map((dataset, index) => (
                <Scatter 
                  key={dataset.label} 
                  name={dataset.label} 
                  data={rechartsData.map((d, i) => ({ x: i, y: d[dataset.label] }))} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  {data.datasets.map(dataset => (
                    <TableHead key={dataset.label}>{dataset.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rechartsData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.name}</TableCell>
                    {data.datasets.map(dataset => (
                      <TableCell key={dataset.label}>
                        {row[dataset.label].toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      default:
        return <div>Unsupported visualization type</div>;
    }
  };
  
  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium">Preview</h3>
      
      {config.visualizations.map(vis => (
        <Card key={vis} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">{vis} Visualization</CardTitle>
            <CardDescription>Preview of {config.metrics.join(', ')} by {config.dimensions.join(', ')}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {getChart(vis)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
