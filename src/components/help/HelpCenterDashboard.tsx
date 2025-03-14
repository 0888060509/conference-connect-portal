
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, HelpCircle, MessageSquare, FileText, Video, Printer, Activity, Star } from "lucide-react";
import { KnowledgeBase } from "./KnowledgeBase";
import { FAQSection } from "./FAQSection";
import { SupportTicket } from "./SupportTicket";
import { VideoTutorials } from "./VideoTutorials";
import { UserManual } from "./UserManual";
import { SystemStatus } from "./SystemStatus";
import { FeedbackForm } from "./FeedbackForm";
import { GuidedWalkthrough } from "./GuidedWalkthrough";
import { ChatSupport } from "./ChatSupport";
import { HelpTooltip } from "./HelpTooltip";

export function HelpCenterDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="space-y-6">
      <Card className="relative">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search help resources..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <HelpTooltip
              content="Search across all help resources including knowledge base, FAQs, and user manuals"
              className="absolute right-3 top-3"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="knowledge-base" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Knowledge Base</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden md:inline">FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden md:inline">Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Resources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge-base">
          <KnowledgeBase searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="faqs">
          <FAQSection searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="support">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SupportTicket />
            <ChatSupport />
          </div>
        </TabsContent>
        
        <TabsContent value="tutorials">
          <VideoTutorials searchQuery={searchQuery} />
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserManual />
            <div className="space-y-6">
              <SystemStatus />
              <FeedbackForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <GuidedWalkthrough />
    </div>
  );
}
