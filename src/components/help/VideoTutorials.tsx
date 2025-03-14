
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Video, Search, PlayCircle } from "lucide-react";

interface VideoTutorialsProps {
  searchQuery: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  tags: string[];
}

export function VideoTutorials({ searchQuery }: VideoTutorialsProps) {
  // Mock data - in a real app, this would come from an API
  const allTutorials: Tutorial[] = [
    {
      id: "video-1",
      title: "Getting Started with Room Booking",
      description: "A complete walkthrough of the room booking process",
      duration: "4:32",
      thumbnail: "/placeholder.svg",
      videoUrl: "https://example.com/video1",
      category: "Basics",
      tags: ["booking", "getting started", "rooms"]
    },
    {
      id: "video-2",
      title: "Managing Your Bookings",
      description: "Learn how to view, edit, and cancel your bookings",
      duration: "5:16",
      thumbnail: "/placeholder.svg",
      videoUrl: "https://example.com/video2",
      category: "Basics",
      tags: ["booking management", "editing", "cancellation"]
    },
    {
      id: "video-3",
      title: "Setting Up Recurring Meetings",
      description: "How to schedule recurring meetings and manage exceptions",
      duration: "6:45",
      thumbnail: "/placeholder.svg",
      videoUrl: "https://example.com/video3",
      category: "Advanced",
      tags: ["recurring", "scheduling", "calendar"]
    },
    {
      id: "video-4",
      title: "Working with the Calendar View",
      description: "Navigating and using the calendar effectively",
      duration: "3:58",
      thumbnail: "/placeholder.svg",
      videoUrl: "https://example.com/video4",
      category: "Interface",
      tags: ["calendar", "navigation", "viewing"]
    },
    {
      id: "video-5",
      title: "Administrator Room Management",
      description: "How administrators can manage rooms and equipment",
      duration: "8:21",
      thumbnail: "/placeholder.svg",
      videoUrl: "https://example.com/video5",
      category: "Admin",
      tags: ["admin", "rooms", "equipment"]
    },
    {
      id: "video-6",
      title: "Handling Booking Conflicts",
      description: "Understanding and resolving booking conflicts",
      duration: "5:37",
      thumbnail: "/placeholder.svg",
      videoUrl: "https://example.com/video6",
      category: "Advanced",
      tags: ["conflicts", "resolution", "waitlist"]
    }
  ];

  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>(allTutorials);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filter tutorials based on search query and category
  useEffect(() => {
    let filtered = [...allTutorials];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tutorial => 
        tutorial.title.toLowerCase().includes(query) || 
        tutorial.description.toLowerCase().includes(query) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(tutorial => tutorial.category === activeCategory);
    }
    
    setTutorials(filtered);
  }, [searchQuery, activeCategory]);

  // Get unique categories for tabs
  const categories = ["all", ...new Set(allTutorials.map(t => t.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" /> Video Tutorials
        </CardTitle>
        <CardDescription>
          Learn key features through guided video walkthroughs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedVideo ? (
          <div className="space-y-4">
            <button 
              className="text-sm text-primary flex items-center gap-1"
              onClick={() => setSelectedVideo(null)}
            >
              ← Back to videos
            </button>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{selectedVideo.title}</h3>
              <p className="text-muted-foreground">{selectedVideo.description}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{selectedVideo.duration}</Badge>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline">{selectedVideo.category}</Badge>
              </div>
            </div>
            
            <AspectRatio ratio={16/9} className="bg-muted overflow-hidden rounded-md border">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <PlayCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Video would play here</p>
                  <p className="text-xs text-muted-foreground mt-1">In a real app, an embedded video player would be shown</p>
                </div>
              </div>
            </AspectRatio>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full h-auto flex flex-wrap">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="capitalize"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {tutorials.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No tutorials found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search terms or category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map(tutorial => (
                  <div 
                    key={tutorial.id} 
                    className="rounded-md border overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedVideo(tutorial)}
                  >
                    <div className="relative">
                      <AspectRatio ratio={16/9} className="bg-muted">
                        <img 
                          src={tutorial.thumbnail} 
                          alt={tutorial.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                          <PlayCircle className="h-12 w-12 text-white" />
                        </div>
                        <Badge className="absolute bottom-2 right-2 bg-black/70">{tutorial.duration}</Badge>
                      </AspectRatio>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-medium line-clamp-1">{tutorial.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
