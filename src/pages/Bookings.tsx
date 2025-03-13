
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { BookingForm } from "@/components/bookings/BookingForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Bookings() {
  const [showNewBooking, setShowNewBooking] = useState(false);

  return (
    <Layout title="Bookings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs defaultValue="calendar" className="w-auto">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            className="bg-secondary hover:bg-secondary-light"
            onClick={() => setShowNewBooking(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsContent value="calendar" className="mt-0">
            <BookingCalendar />
          </TabsContent>
          <TabsContent value="list" className="mt-0">
            <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center text-muted-foreground">
                <p>Bookings list view will be displayed here</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowNewBooking(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Booking
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
          <BookingForm />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
