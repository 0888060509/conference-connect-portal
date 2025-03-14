
import { useState, useEffect } from "react";
import { getFavoriteReports, removeReportFromFavorites } from "@/services/reportService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function ReportFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await getFavoriteReports();
        setFavorites(data);
      } catch (error) {
        console.error("Failed to load favorite reports:", error);
        toast({
          title: "Error",
          description: "Failed to load favorite reports",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [toast]);
  
  const handleRemoveFromFavorites = async (reportId: string) => {
    try {
      await removeReportFromFavorites(reportId);
      setFavorites(favorites.filter(fav => fav.report_id !== reportId));
      toast({
        title: "Success",
        description: "Report removed from favorites",
      });
    } catch (error) {
      console.error("Failed to remove report from favorites:", error);
      toast({
        title: "Error",
        description: "Failed to remove report from favorites",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-4">Loading favorites...</div>;
  }
  
  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Star className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>You haven't favorited any reports yet.</p>
            <p className="mt-2">Mark reports as favorites to access them quickly.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{favorite.reports.name}</CardTitle>
                <CardDescription>
                  {favorite.reports.description || "No description"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveFromFavorites(favorite.report_id)}
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/reports/${favorite.report_id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Last updated: {new Date(favorite.reports.updated_at).toLocaleDateString()}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/reports/${favorite.report_id}`}>
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
