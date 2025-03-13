
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Building, Users, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-secondary mr-2" />
            <div className="font-bold text-xl">MeetingMaster</div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Log In</Button>
            <Button className="bg-secondary hover:bg-secondary-light">Sign Up</Button>
          </div>
        </div>
      </header>
      
      <main>
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Simplify Your Meeting Room Bookings
                </h1>
                <p className="mt-6 text-lg text-muted-foreground">
                  MeetingMaster is an intuitive, comprehensive meeting room booking 
                  application designed for internal business use. Efficiently manage 
                  reservations and access powerful analytics.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-secondary hover:bg-secondary-light">
                    Get Started
                  </Button>
                  <Button variant="outline" size="lg">
                    View Demo
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="https://placehold.co/600x400/2C3E50/FFFFFF?text=MeetingMaster+Dashboard" 
                    alt="MeetingMaster Dashboard Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <Calendar className="h-12 w-12 text-secondary" />
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                  <Building className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-muted/30 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="bg-secondary/10 p-3 rounded-lg w-fit mb-4">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Calendar</h3>
                <p className="text-muted-foreground">
                  View room availability in real-time with an intuitive calendar interface.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Room Management</h3>
                <p className="text-muted-foreground">
                  Easily manage and configure room details, equipment, and resources.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="bg-accent/10 p-3 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">User Controls</h3>
                <p className="text-muted-foreground">
                  Set up access levels, permissions, and user groups for secure management.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="bg-success/10 p-3 rounded-lg w-fit mb-4">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Booking</h3>
                <p className="text-muted-foreground">
                  Create, modify, and cancel reservations in just a few clicks.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="bg-warning/10 p-3 rounded-lg w-fit mb-4">
                  <svg className="h-6 w-6 text-warning" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6H4V18H20V6Z" />
                    <path d="M4 10H20" />
                    <path d="M10 6V18" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Resource Tracking</h3>
                <p className="text-muted-foreground">
                  Track and manage room resources and equipment availability.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="bg-secondary/10 p-3 rounded-lg w-fit mb-4">
                  <svg className="h-6 w-6 text-secondary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
                <p className="text-muted-foreground">
                  Gain insights with usage statistics and customizable reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="mt-auto bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Calendar className="h-5 w-5 mr-2" />
              <div className="font-bold">MeetingMaster</div>
            </div>
            <div className="text-sm opacity-70">
              © 2023 MeetingMaster. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
