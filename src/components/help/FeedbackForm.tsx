
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp } from "lucide-react";

export function FeedbackForm() {
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Please select a rating",
        description: "Rating is required to submit feedback",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would send the data to an API
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(null);
      setFeedback("");
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" /> Feedback
        </CardTitle>
        <CardDescription>
          Help us improve by sharing your thoughts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>How would you rate your experience?</Label>
            <div className="flex justify-center py-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-10 w-10 p-0 ${rating === value ? "text-amber-500" : "text-muted-foreground"}`}
                  onClick={() => setRating(value)}
                >
                  <Star className={`h-6 w-6 ${rating && rating >= value ? "fill-amber-500" : ""}`} />
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-type">What are you providing feedback about?</Label>
            <RadioGroup defaultValue="usability">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="usability" id="usability" />
                  <Label htmlFor="usability">Usability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="features" id="features" />
                  <Label htmlFor="features">Features</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="performance" />
                  <Label htmlFor="performance">Performance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea 
              id="feedback" 
              placeholder="Share your thoughts or suggestions..." 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
