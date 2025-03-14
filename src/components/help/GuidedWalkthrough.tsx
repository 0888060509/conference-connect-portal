
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Steps } from "lucide-react";

interface WalkthroughStep {
  title: string;
  description: string;
  image: string;
}

export function GuidedWalkthrough() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Mock data - in a real app, this would come from an API
  const walkthroughSteps: WalkthroughStep[] = [
    {
      title: "Welcome to the Room Booking System",
      description: "This guided tour will walk you through the key features of our application. Click 'Next' to continue.",
      image: "/placeholder.svg"
    },
    {
      title: "Finding Available Rooms",
      description: "Use the search filters to find rooms based on your requirements - such as capacity, location, and available amenities.",
      image: "/placeholder.svg"
    },
    {
      title: "Making a Booking",
      description: "Select your preferred time slot, enter meeting details, and confirm your booking. You'll receive a confirmation notification.",
      image: "/placeholder.svg"
    },
    {
      title: "Managing Your Bookings",
      description: "View, edit, or cancel your bookings from the 'My Bookings' section. You can also set up recurring meetings.",
      image: "/placeholder.svg"
    },
    {
      title: "Handling Conflicts",
      description: "The system will help you resolve booking conflicts by offering alternative options or joining waitlists for preferred rooms.",
      image: "/placeholder.svg"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      setCurrentStep(0);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
  };

  const currentStepData = walkthroughSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className="bg-gradient-to-br from-primary/10 to-primary-foreground/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium">New to the system?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Take a guided tour to learn how to use all the key features.
              </p>
            </div>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Steps className="h-4 w-4" />
                Start Guided Tour
              </Button>
            </DialogTrigger>
          </div>
        </CardContent>
      </Card>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{currentStepData.title}</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {walkthroughSteps.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-md overflow-hidden border mb-4 bg-muted">
            <img 
              src={currentStepData.image} 
              alt={`Step ${currentStep + 1}`}
              className="w-full h-48 object-cover"
            />
          </div>
          
          <p>{currentStepData.description}</p>
          
          <div className="flex justify-center mt-4">
            {walkthroughSteps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 mx-1 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Skip Tour
            </Button>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          <Button onClick={handleNext}>
            {currentStep < walkthroughSteps.length - 1 ? "Next" : "Finish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
