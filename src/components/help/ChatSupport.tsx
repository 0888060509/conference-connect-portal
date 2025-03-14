
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "support";
  timestamp: Date;
}

export function ChatSupport() {
  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate admin availability - in a real app, this would be determined by actual admin presence
  useEffect(() => {
    // Randomly determine if support is online (70% chance)
    setIsOnline(Math.random() > 0.3);
    
    // Add initial welcome message if support is online
    if (isOnline) {
      setMessages([
        {
          id: "welcome-msg",
          content: "Hello! How can I help you today?",
          sender: "support",
          timestamp: new Date()
        }
      ]);
    } else {
      setMessages([
        {
          id: "offline-msg",
          content: "Sorry, live chat support is currently offline. Please submit a support ticket or check back later.",
          sender: "support",
          timestamp: new Date()
        }
      ]);
    }
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    
    // Simulate support response
    if (isOnline) {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        const supportMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          content: getAutoResponse(newMessage),
          sender: "support",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, supportMessage]);
      }, 2000 + Math.random() * 1000);
    }
  };
  
  // Simple auto-response generator - in a real app, this would be more sophisticated
  const getAutoResponse = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes("book") || lowerMsg.includes("reservation")) {
      return "For booking issues, please check our Knowledge Base articles on reservations. If you need specific help, please provide the booking ID.";
    } else if (lowerMsg.includes("cancel")) {
      return "To cancel a booking, go to 'My Bookings', find the booking you want to cancel, and click the 'Cancel' button. Is there a specific booking you're trying to cancel?";
    } else if (lowerMsg.includes("waitlist")) {
      return "The waitlist feature automatically notifies you when a room becomes available. You'll receive a notification and will have a limited time to confirm the booking.";
    } else {
      return "Thank you for your message. Could you provide more details about your issue so I can better assist you?";
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Live Chat Support
          </CardTitle>
          <Badge variant={isOnline ? "default" : "outline"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <CardDescription>
          {isOnline 
            ? "Chat with our support team in real-time" 
            : "Live support is currently unavailable"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="h-[320px] overflow-y-auto pr-2 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                {message.sender === "support" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Support" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                )}
                <div className={`p-3 rounded-lg ${
                  message.sender === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Support" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-100">●</span>
                    <span className="animate-pulse delay-200">●</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form 
          className="flex gap-2 w-full" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input 
            placeholder={isOnline ? "Type your message..." : "Chat currently unavailable"} 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isOnline}
          />
          <Button type="submit" size="icon" disabled={!isOnline}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
