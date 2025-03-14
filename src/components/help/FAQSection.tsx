
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageSquare } from "lucide-react";

interface FAQSectionProps {
  searchQuery: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function FAQSection({ searchQuery }: FAQSectionProps) {
  // Mock data - in a real app, this would come from an API
  const allFaqs: FAQ[] = [
    {
      id: "faq-1",
      question: "How do I book a room?",
      answer: "Navigate to the Bookings page, select your preferred date and time, choose an available room, and click 'Book Now' to confirm your reservation.",
      category: "Booking"
    },
    {
      id: "faq-2",
      question: "Can I modify my booking after it's confirmed?",
      answer: "Yes, you can edit or cancel your booking by going to 'My Bookings' and selecting the booking you wish to modify. Changes are subject to room availability.",
      category: "Booking"
    },
    {
      id: "faq-3",
      question: "What happens if there's a booking conflict?",
      answer: "If a conflict is detected, you'll be notified and presented with alternative options. You can either choose a different time/room or join the waitlist for your preferred room.",
      category: "Conflicts"
    },
    {
      id: "faq-4",
      question: "How does the waitlist work?",
      answer: "When a room is fully booked, you can join the waitlist. If a booking is cancelled, people on the waitlist are automatically notified in order of priority.",
      category: "Waitlist"
    },
    {
      id: "faq-5",
      question: "Can I book recurring meetings?",
      answer: "Yes, when creating a booking, check the 'Make this a recurring meeting' option and set your preferred schedule (daily, weekly, monthly).",
      category: "Booking"
    },
    {
      id: "faq-6",
      question: "How do I check room amenities?",
      answer: "Room amenities are listed on each room's detail page. You can also filter rooms by specific amenities when searching for available rooms.",
      category: "Rooms"
    }
  ];

  const [faqs, setFaqs] = useState<FAQ[]>(allFaqs);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFaqs(allFaqs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allFaqs.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query)
    );

    setFaqs(filtered);
  }, [searchQuery]);

  const categories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Frequently Asked Questions
        </CardTitle>
        <CardDescription>
          Quick answers to common questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {faqs.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No FAQs found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map(category => {
              const categoryFaqs = faqs.filter(faq => faq.category === category);
              
              return (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-lg">{category}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFaqs.map(faq => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p>{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
