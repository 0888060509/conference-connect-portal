
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Building, CheckCircle2, XCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

// Waitlist item type
interface WaitlistItem {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "normal" | "high" | "critical";
}

// Sample waitlist data
const sampleWaitlist: WaitlistItem[] = [
  {
    id: "wait-1",
    roomId: "1",
    roomName: "Executive Boardroom",
    title: "Strategic Planning Session",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    startTime: "10:00",
    endTime: "11:30",
    requestedBy: {
      id: "user-1",
      name: "John Smith",
      email: "john.smith@example.com",
      department: "Executive"
    },
    requestedAt: new Date(new Date().setHours(new Date().getHours() - 3)),
    status: "pending",
    priority: "high"
  },
  {
    id: "wait-2",
    roomId: "2",
    roomName: "Conference Room Alpha",
    title: "Product Demo",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    startTime: "14:00",
    endTime: "15:00",
    requestedBy: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      department: "Sales"
    },
    requestedAt: new Date(new Date().setHours(new Date().getHours() - 6)),
    status: "pending",
    priority: "normal"
  },
  {
    id: "wait-3",
    roomId: "1",
    roomName: "Executive Boardroom",
    title: "Budget Review",
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    startTime: "09:00",
    endTime: "10:30",
    requestedBy: {
      id: "user-3",
      name: "Robert Lee",
      email: "robert.lee@example.com",
      department: "Finance"
    },
    requestedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: "approved",
    priority: "critical"
  }
];

export function WaitlistManagement() {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(sampleWaitlist);
  const [activeTab, setActiveTab] = useState("pending");
  const { sendNotification } = useNotifications();
  
  const filteredWaitlist = waitlist.filter(item => {
    if (activeTab === "pending") return item.status === "pending";
    if (activeTab === "approved") return item.status === "approved";
    if (activeTab === "rejected") return item.status === "rejected";
    return true;
  });
  
  const handleApprove = (itemId: string) => {
    setWaitlist(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: "approved" } : item
    ));
    
    const item = waitlist.find(i => i.id === itemId);
    if (item) {
      sendNotification(
        "booking_confirmation",
        "Waitlist Request Approved",
        `Your waitlist request for "${item.title}" in ${item.roomName} has been approved.`,
        ["in_app", "email"],
        undefined,
        item.requestedBy.id
      );
    }
  };
  
  const handleReject = (itemId: string) => {
    setWaitlist(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: "rejected" } : item
    ));
    
    const item = waitlist.find(i => i.id === itemId);
    if (item) {
      sendNotification(
        "booking_cancellation",
        "Waitlist Request Rejected",
        `Your waitlist request for "${item.title}" in ${item.roomName} has been rejected.`,
        ["in_app", "email"],
        undefined,
        item.requestedBy.id
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Booking Waitlist</h2>
          <p className="text-muted-foreground">
            Manage and review waitlisted booking requests
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Requests
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {waitlist.filter(i => i.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <WaitlistTable waitlist={waitlist} onApprove={handleApprove} onReject={handleReject} />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <WaitlistTable waitlist={filteredWaitlist} onApprove={handleApprove} onReject={handleReject} />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-4">
          <WaitlistTable waitlist={filteredWaitlist} onApprove={handleApprove} onReject={handleReject} />
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          <WaitlistTable waitlist={filteredWaitlist} onApprove={handleApprove} onReject={handleReject} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface WaitlistTableProps {
  waitlist: WaitlistItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function WaitlistTable({ waitlist, onApprove, onReject }: WaitlistTableProps) {
  if (waitlist.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No waitlist requests found.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Request</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Room</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Requested By</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Requested {format(item.requestedAt, "MMM d, h:mm a")}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span>{item.roomName}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span>{format(item.date, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      <span>
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span>{item.requestedBy.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5.5">
                      {item.requestedBy.department}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={
                      item.priority === "critical" ? "destructive" : 
                      item.priority === "high" ? "default" : 
                      item.priority === "low" ? "outline" : 
                      "secondary"
                    }>
                      {item.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={
                      item.status === "approved" ? "success" : 
                      item.status === "rejected" ? "destructive" : 
                      "outline"
                    }>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    {item.status === "pending" && (
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-500 hover:text-green-600 hover:bg-green-50"
                          onClick={() => onApprove(item.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onReject(item.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {item.status !== "pending" && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(), "MMM d, yyyy")}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
