
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoomsList } from "@/components/dashboard/RoomsList";
import { UpcomingBookings } from "@/components/dashboard/UpcomingBookings";
import { Calendar, Clock, Building, Users } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Bookings" 
            value="142" 
            icon={Calendar} 
            iconColor="bg-secondary"
            change={{ value: 12, positive: true }}
          />
          <StatCard 
            title="Rooms Available" 
            value="8/12" 
            icon={Building} 
            iconColor="bg-success"
          />
          <StatCard 
            title="Avg. Meeting Duration" 
            value="52 min" 
            icon={Clock} 
            iconColor="bg-warning"
            change={{ value: 8, positive: false }}
          />
          <StatCard 
            title="Active Users" 
            value="86" 
            icon={Users} 
            iconColor="bg-primary"
            change={{ value: 5, positive: true }}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingBookings />
          <RoomsList />
        </div>
      </div>
    </Layout>
  );
}
