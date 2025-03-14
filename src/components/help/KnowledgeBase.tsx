
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, BookOpen } from "lucide-react";

interface KnowledgeBaseProps {
  searchQuery: string;
}

interface ArticleCategory {
  title: string;
  id: string;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
}

export function KnowledgeBase({ searchQuery }: KnowledgeBaseProps) {
  // Mock data - in a real app, this would come from an API
  const categories: ArticleCategory[] = [
    {
      title: "Getting Started",
      id: "getting-started",
      articles: [
        {
          id: "gs-1",
          title: "Creating Your First Booking",
          summary: "Learn how to make your first room reservation",
          content: "To create your first booking, navigate to the Bookings tab in the sidebar..."
        },
        {
          id: "gs-2",
          title: "Understanding Room Availability",
          summary: "How to check when rooms are available",
          content: "Room availability can be viewed in multiple ways. The Calendar view shows..."
        }
      ]
    },
    {
      title: "Managing Bookings",
      id: "managing-bookings",
      articles: [
        {
          id: "mb-1",
          title: "Editing and Cancelling Bookings",
          summary: "How to modify or cancel your existing bookings",
          content: "To edit a booking, navigate to My Bookings and click on the booking you want to modify..."
        },
        {
          id: "mb-2",
          title: "Recurring Meetings Setup",
          summary: "Set up meetings that repeat on a schedule",
          content: "When creating a booking, check the 'Make this a recurring meeting' option..."
        }
      ]
    },
    {
      title: "Admin Features",
      id: "admin-features",
      articles: [
        {
          id: "af-1",
          title: "Managing Rooms",
          summary: "How to add, edit, and remove rooms",
          content: "As an administrator, you can manage rooms by navigating to the Admin Panel..."
        },
        {
          id: "af-2",
          title: "System Settings",
          summary: "Configure global system settings",
          content: "System settings can be configured in the Admin Panel under Settings..."
        }
      ]
    }
  ];

  const [filteredCategories, setFilteredCategories] = useState<ArticleCategory[]>(categories);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = categories.map(category => {
      const filteredArticles = category.articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.summary.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      );

      return {
        ...category,
        articles: filteredArticles
      };
    }).filter(category => category.articles.length > 0);

    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  if (selectedArticle) {
    return (
      <Card>
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 -ml-2 w-fit"
            onClick={() => setSelectedArticle(null)}
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Articles
          </Button>
          <CardTitle>{selectedArticle.title}</CardTitle>
          <CardDescription>{selectedArticle.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{selectedArticle.content}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Knowledge Base
        </CardTitle>
        <CardDescription>
          Browse or search helpful articles and documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No articles found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {filteredCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger>{category.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.id}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <span>{article.title}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
