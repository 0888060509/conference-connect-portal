
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for upcoming bookings
const upcomingBookings = [
  {
    id: 1,
    title: "Weekly Team Standup",
    room: "Executive Boardroom",
    date: "Today",
    time: "10:30 AM - 11:00 AM",
    attendees: 8,
    status: "upcoming",
  },
  {
    id: 2,
    title: "Project Kickoff",
    room: "Innovation Lab",
    date: "Today",
    time: "1:00 PM - 2:30 PM",
    attendees: 5,
    status: "upcoming",
  },
  {
    id: 3,
    title: "Client Meeting",
    room: "Meeting Room 101",
    date: "Tomorrow",
    time: "10:00 AM - 11:00 AM",
    attendees: 4,
    status: "upcoming",
  },
];

export function UpcomingBookings() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Upcoming Bookings</span>
          <Button variant="outline" size="sm" className="text-sm h-8 px-3">
            Calendar View
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{booking.title}</h3>
                  <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{booking.room}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{booking.attendees} attendees</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 hover:bg-accent/10 hover:text-accent hover:border-accent/20">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
