
import { useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, format } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableCalendarViewProps {
  children: React.ReactNode;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: "month" | "week" | "day" | "timeline";
  title: string;
}

export function SwipeableCalendarView({
  children,
  currentDate,
  setCurrentDate,
  view,
  title
}: SwipeableCalendarViewProps) {
  const [swiping, setSwiping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const navigate = (direction: "prev" | "next") => {
    if (view === "month") {
      direction === "prev" 
        ? setCurrentDate(subMonths(currentDate, 1)) 
        : setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      direction === "prev" 
        ? setCurrentDate(subWeeks(currentDate, 1)) 
        : setCurrentDate(addWeeks(currentDate, 1));
    } else {
      direction === "prev" 
        ? setCurrentDate(subDays(currentDate, 1)) 
        : setCurrentDate(addDays(currentDate, 1));
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigate("next"),
    onSwipedRight: () => navigate("prev"),
    onSwiping: () => setSwiping(true),
    onSwiped: () => setSwiping(false),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  return (
    <div className="w-full h-full relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate("prev")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Previous"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-medium">{title}</h2>
          <button 
            onClick={() => navigate("next")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Next"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div 
        {...swipeHandlers}
        ref={contentRef}
        className={cn(
          "transition-opacity duration-300 touch-pan-y", 
          swiping ? "opacity-80" : "opacity-100"
        )}
      >
        {children}
      </div>

      {/* Mobile swipe indicator */}
      <div className="flex gap-1 justify-center mt-4 md:hidden">
        <div className="text-xs text-muted-foreground">
          Swipe to navigate
        </div>
      </div>
    </div>
  );
}
