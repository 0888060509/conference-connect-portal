
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";

export function SupportTicket() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    description: "",
    attachment: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachment: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would send the data to an API
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        description: "",
        attachment: null
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Submit a Support Ticket
        </CardTitle>
        <CardDescription>
          Request assistance for any issues you're experiencing
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              name="subject" 
              value={formData.subject} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="category">Category</Label>
              <HelpTooltip content="Select the category that best describes your issue" />
            </div>
            <Select value={formData.category} onValueChange={handleSelectChange} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking">Booking Issue</SelectItem>
                <SelectItem value="account">Account Access</SelectItem>
                <SelectItem value="technical">Technical Problem</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Please describe your issue in detail..." 
              rows={5} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment" className="block">Attachment (optional)</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="attachment" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById("attachment")?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {formData.attachment ? formData.attachment.name : "Upload File"}
              </Button>
              {formData.attachment && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
