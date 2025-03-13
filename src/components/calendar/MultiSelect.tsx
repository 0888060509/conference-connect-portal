
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  emptyMessage = "No options found."
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);

  // Initialize selected labels
  useEffect(() => {
    const labels: Record<string, string> = {};
    options.forEach(option => {
      if (selected.includes(option.value)) {
        labels[option.value] = option.label;
      }
    });
    setSelectedLabels(labels);
  }, [options, selected]);

  // Update trigger width when selected items change
  useEffect(() => {
    if (triggerRef.current) {
      setInputWidth(triggerRef.current.getBoundingClientRect().width);
    }
  }, [selected]);

  const handleSelect = (value: string) => {
    const option = options.find(opt => opt.value === value);
    if (!option) return;
    
    const newSelected = [...selected];
    
    if (newSelected.includes(value)) {
      // Remove if already selected
      const index = newSelected.indexOf(value);
      newSelected.splice(index, 1);
    } else {
      // Add if not selected
      newSelected.push(value);
    }
    
    onChange(newSelected);
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10"
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map(value => (
                <Badge key={value} variant="secondary" className="mr-1 px-1 py-0">
                  {selectedLabels[value] || value}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(e as unknown as React.MouseEvent, value);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleRemove(e, value)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: inputWidth }}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
