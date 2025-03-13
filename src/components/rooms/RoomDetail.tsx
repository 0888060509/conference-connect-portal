
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Monitor, Wifi, MapPin, Clock } from "lucide-react";

// Sample room data
const room = {
  id: 1,
  name: "Executive Boardroom",
  location: "3rd Floor, Building A",
  capacity: 14,
  availability: "Available",
  equipment: [
    "Video Conference System",
    "Whiteboard",
    "Projector",
    "Surround Sound",
    "High-speed Wi-Fi",
  ],
  description:
    "Our Executive Boardroom features a premium video conferencing system, comfortable seating for up to 14 people, and a panoramic view of the city skyline. Perfect for important client meetings and executive sessions.",
  upcoming: [
    {
      id: 1,
      title: "Executive Committee Meeting",
      time: "Today, 2:00 PM - 3:30 PM",
      organizer: "Amanda Johnson",
    },
    {
      id: 2,
      title: "Strategic Planning Session",
      time: "Tomorrow, 10:00 AM - 12:00 PM",
      organizer: "Michael Chen",
    },
  ],
};

export function RoomDetail() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="mr-1 h-4 w-4" />
            {room.location}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Check Availability</Button>
          <Button className="bg-secondary hover:bg-secondary-light">Book Now</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Capacity</div>
                    <div className="font-medium">{room.capacity} people</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        {room.availability}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{room.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Equipment & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {room.equipment.map((item, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      {i === 0 && <Monitor className="h-3 w-3" />}
                      {i === 4 && <Wifi className="h-3 w-3" />}
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {room.upcoming.map((booking) => (
                <div key={booking.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium">{booking.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {booking.time}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Organized by: {booking.organizer}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Availability</CardTitle>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly">
            <TabsContent value="daily" className="mt-0">
              <div className="text-center p-6 text-muted-foreground">
                Daily availability view will be shown here
              </div>
            </TabsContent>
            <TabsContent value="weekly" className="mt-0">
              <div className="h-64 overflow-hidden flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center text-muted-foreground">
                  Weekly calendar view will be displayed here
                </div>
              </div>
            </TabsContent>
            <TabsContent value="monthly" className="mt-0">
              <div className="text-center p-6 text-muted-foreground">
                Monthly availability view will be shown here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
