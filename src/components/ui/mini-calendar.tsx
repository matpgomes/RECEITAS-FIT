"use client";

import * as React from "react";
import {
  format,
  addDays,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasRecipe?: (date: Date) => boolean;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  hasRecipe,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [centerDate, setCenterDate] = React.useState<Date>(selectedDate);
  const itemRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  // Generate 21 days: 10 before today, today, 10 after
  const allDays = React.useMemo(() => {
    const today = new Date();
    const days: Date[] = [];
    for (let i = -10; i <= 10; i++) {
      days.push(addDays(today, i));
    }
    return days;
  }, []);

  // Scroll to center element
  const scrollToDate = (date: Date, behavior: ScrollBehavior = "smooth") => {
    const dateKey = format(date, "yyyy-MM-dd");
    const element = itemRefs.current.get(dateKey);
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const containerWidth = container.offsetWidth;

      const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);

      container.scrollTo({
        left: scrollPosition,
        behavior,
      });
    }
  };

  // Detect center element on scroll
  const handleScroll = React.useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;

    let closestDate: Date | null = null;
    let closestDistance = Infinity;

    allDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const element = itemRefs.current.get(dateKey);
      if (element) {
        const elementCenter = element.offsetLeft + element.offsetWidth / 2;
        const distance = Math.abs(containerCenter - elementCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestDate = day;
        }
      }
    });

    if (closestDate) {
      const closestDateStr = format(closestDate, "yyyy-MM-dd");
      const centerDateStr = format(centerDate, "yyyy-MM-dd");

      if (closestDateStr !== centerDateStr) {
        setCenterDate(closestDate);
        onSelectDate(closestDate);
      }
    }
  }, [allDays, centerDate, onSelectDate]);

  // Debounced scroll handler
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 200);
    };

    container.addEventListener("scroll", debouncedScroll);
    return () => {
      container.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Initial scroll to selected date
  React.useEffect(() => {
    setTimeout(() => {
      scrollToDate(selectedDate, "auto");
    }, 0);
  }, []);

  const handleDateClick = (date: Date) => {
    setCenterDate(date);
    onSelectDate(date);
    scrollToDate(date);
  };

  const handlePrevious = () => {
    const newDate = subDays(centerDate, 1);
    setCenterDate(newDate);
    onSelectDate(newDate);
    scrollToDate(newDate);
  };

  const handleNext = () => {
    const newDate = addDays(centerDate, 1);
    setCenterDate(newDate);
    onSelectDate(newDate);
    scrollToDate(newDate);
  };

  return (
    <div className="w-full overflow-visible rounded-lg border bg-card text-card-foreground shadow-sm h-[160px]">
      <div className="flex items-center justify-between px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xs font-medium text-muted-foreground">
          {format(centerDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 px-3 py-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {allDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isCenter = format(day, "yyyy-MM-dd") === format(centerDate, "yyyy-MM-dd");
          const dayHasRecipe = hasRecipe ? hasRecipe(day) : false;

          return (
            <Button
              key={dateKey}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(dateKey, el);
                } else {
                  itemRefs.current.delete(dateKey);
                }
              }}
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-full p-2 shrink-0",
                "transition-[width,height,background-color,box-shadow] duration-500 ease-out",
                "bg-muted/50 hover:bg-muted/60",
                "will-change-[width,height]",
                !isCenter && "h-12 w-12",
                isCenter && "h-16 w-16 bg-green-500/70 hover:bg-green-500/70 shadow-[0_0_20px_rgba(34,197,94,0.7)]",
              )}
              style={{
                scrollSnapAlign: "center",
              }}
              onClick={() => handleDateClick(day)}
            >
              <time
                dateTime={dateKey}
                className={cn(
                  "font-bold transition-[font-size,color] duration-500 ease-out",
                  isCenter ? "text-2xl text-white" : "text-lg text-foreground"
                )}
              >
                {format(day, "d")}
              </time>
              <span
                className={cn(
                  "font-medium uppercase leading-none transition-[font-size,color] duration-500 ease-out",
                  isCenter ? "text-[11px] text-white/90" : "text-[9px] text-muted-foreground"
                )}
              >
                {format(day, "EEEEE", { locale: ptBR })}
              </span>
              {dayHasRecipe && !isCenter && (
                <div className="h-1 w-1 rounded-full bg-green-500 mt-0.5 transition-opacity duration-300" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
