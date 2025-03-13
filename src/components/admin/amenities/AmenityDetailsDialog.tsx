
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcon } from "./AmenityIcon";
import { Amenity, AmenityType } from "@/types/amenities";
import { generateQRCode } from "@/services/AmenityService";
import { toast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Calendar,
  QrCode,
  FileText,
  BarChart3,
  Download,
  ExternalLink
} from "lucide-react";

interface AmenityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity;
  amenityTypes: AmenityType[];
}

export function AmenityDetailsDialog({ 
  open, 
  onOpenChange, 
  amenity, 
  amenityTypes
}: AmenityDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingQR, setGeneratingQR] = useState(false);
  
  // Get amenity type name
  const getTypeName = () => {
    const type = amenityTypes.find(t => t.id === amenity.type);
    return type ? type.name : "Unknown Type";
  };
  
  // Get status badge
  const getStatusBadge = () => {
    switch (amenity.status) {
      case "available":
        return (
          <Badge className="flex items-center gap-1 bg-success/20 text-success hover:bg-success/30">
            <CheckCircle2 className="h-3 w-3" />
            Available
          </Badge>
        );
      case "unavailable":
        return (
          <Badge className="flex items-center gap-1 bg-destructive/20 text-destructive hover:bg-destructive/30">
            <AlertTriangle className="h-3 w-3" />
            Unavailable
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="flex items-center gap-1 bg-warning/20 text-warning hover:bg-warning/30">
            <Settings className="h-3 w-3" />
            Maintenance
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="flex items-center gap-1 bg-info/20 text-info hover:bg-info/30">
            <Calendar className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      default:
        return <Badge>{amenity.status}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Generate QR code
  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    
    try {
      // Generate content for QR code - in a real app, this would be more sophisticated
      const content = JSON.stringify({
        id: amenity.id,
        name: amenity.name,
        type: getTypeName(),
        manual: amenity.manualUrl
      });
      
      await generateQRCode(amenity.id, content);
      
      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully."
      });
      
      // Refresh the amenity to show the QR code
      // In a real app, you would update the amenity state directly
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive"
      });
    } finally {
      setGeneratingQR(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AmenityIcon icon={amenity.icon} className="h-5 w-5" />
            {amenity.name}
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="usage">Usage Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">{amenity.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Type</h3>
                <p className="text-sm">{getTypeName()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Assigned Rooms</h3>
                <p className="text-sm">{amenity.roomIds.length} room(s)</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                <p className="text-sm">{formatDate(amenity.lastUpdated)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Created</h3>
                <p className="text-sm">{formatDate(amenity.createdAt)}</p>
              </div>
            </div>
            
            {/* QR Code and Manuals */}
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Resources</h3>
              <div className="flex flex-wrap gap-2">
                {amenity.qrCodeUrl ? (
                  <a 
                    href={amenity.qrCodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm" className="h-8">
                      <QrCode className="h-3.5 w-3.5 mr-1" />
                      View QR Code
                    </Button>
                  </a>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={handleGenerateQR}
                    disabled={generatingQR}
                  >
                    <QrCode className="h-3.5 w-3.5 mr-1" />
                    {generatingQR ? "Generating..." : "Generate QR Code"}
                  </Button>
                )}
                
                {amenity.manualUrl && (
                  <a 
                    href={amenity.manualUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm" className="h-8">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      User Manual
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            {/* Maintenance Schedule */}
            <div>
              <h3 className="text-sm font-medium mb-1">Maintenance Schedule</h3>
              {amenity.maintenanceSchedule ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                    {amenity.maintenanceSchedule.frequency.charAt(0).toUpperCase() + 
                     amenity.maintenanceSchedule.frequency.slice(1)}
                  </Badge>
                  <span className="text-sm">
                    Next: {formatDate(amenity.maintenanceSchedule.nextDate)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No scheduled maintenance</p>
              )}
            </div>
            
            {/* Maintenance History */}
            <div>
              <h3 className="text-sm font-medium mb-2">Maintenance History</h3>
              {amenity.maintenanceRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No maintenance records</p>
              ) : (
                <div className="border rounded-md divide-y">
                  {[...amenity.maintenanceRecords]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record, index) => (
                      <div key={record.id} className="p-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{formatDate(record.date)}</span>
                          <span className="text-sm text-muted-foreground">by {record.performedBy}</span>
                        </div>
                        <p className="text-sm mt-1">{record.notes}</p>
                        {record.nextScheduledDate && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Next scheduled: {formatDate(record.nextScheduledDate)}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            {/* Usage Statistics */}
            {amenity.usageStats ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Usage Count</h3>
                    <p className="text-sm">{amenity.usageStats.usageCount} times</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Last Used</h3>
                    <p className="text-sm">{formatDate(amenity.usageStats.lastUsed)}</p>
                  </div>
                </div>
                
                {/* Popular Times */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Popular Times</h3>
                  <div className="h-40 border rounded-md p-3">
                    <div className="flex justify-between items-end h-full">
                      {amenity.usageStats.popularTimes.map((time, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="bg-primary/60 w-8" 
                            style={{ 
                              height: `${(time.count / Math.max(...amenity.usageStats!.popularTimes.map(t => t.count))) * 100}%` 
                            }} 
                          />
                          <span className="text-xs mt-1">{time.day.substring(0, 3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="h-8">
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                    View Detailed Analytics
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No usage statistics available</p>
                <p className="text-sm mt-1">Usage data will be collected once this amenity is used.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
