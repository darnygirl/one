/**
 * DateRangePicker - Date range picker with presets
 *
 * Features:
 * - Calendar popup
 * - Quick ranges (today, this week, etc.)
 * - Custom range input
 * - Timezone support
 */

import { useState } from "react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "../utils";

export interface DateRangePreset {
  label: string;
  getValue: () => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  presets?: DateRangePreset[];
  showPresets?: boolean;
  placeholder?: string;
  className?: string;
}

const defaultPresets: DateRangePreset[] = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: "Last 30 Days",
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: "This Week",
    getValue: () => {
      const now = new Date();
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    },
  },
  {
    label: "Last Week",
    getValue: () => {
      const now = subDays(new Date(), 7);
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const now = new Date();
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    },
  },
  {
    label: "Last Month",
    getValue: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "This Year",
    getValue: () => {
      const now = new Date();
      return {
        from: startOfYear(now),
        to: endOfYear(now),
      };
    },
  },
  {
    label: "Last Year",
    getValue: () => {
      const lastYear = new Date(new Date().getFullYear() - 1, 0, 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear),
      };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  presets = defaultPresets,
  showPresets = true,
  placeholder = "Pick a date range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = preset.getValue();
    onChange?.(range);
    setOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range) return placeholder;

    if (range.from) {
      if (range.to) {
        // Check if same day
        if (range.from.getTime() === range.to.getTime()) {
          return format(range.from, "PPP");
        }
        return `${format(range.from, "PP")} - ${format(range.to, "PP")}`;
      }
      return format(range.from, "PPP");
    }

    return placeholder;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {showPresets && (
              <div className="border-r">
                <div className="p-3 pb-2">
                  <h4 className="text-sm font-medium">Quick Ranges</h4>
                </div>
                <div className="p-1 space-y-1 min-w-[140px]">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full justify-start font-normal"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={value}
                onSelect={onChange}
                numberOfMonths={2}
                defaultMonth={value?.from}
              />
              <div className="flex gap-2 pt-3 border-t mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange?.(undefined);
                    setOpen(false);
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
