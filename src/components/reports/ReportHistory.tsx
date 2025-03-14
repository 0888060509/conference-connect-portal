
import { useState, useEffect } from "react";
import { getReportHistory } from "@/services/reportService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function ReportHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getReportHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to load report history:", error);
        toast({
          title: "Error",
          description: "Failed to load report history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [toast]);
  
  if (loading) {
    return <div className="flex justify-center p-4">Loading history...</div>;
  }
  
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No report viewing history yet.</p>
            <p className="mt-2">Your recently viewed reports will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{item.reports.name}</CardTitle>
                <CardDescription>
                  {item.reports.description || "No description"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/reports/${item.report_id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Viewed: {new Date(item.viewed_at).toLocaleString()}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/reports/${item.report_id}`}>
                  View Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
