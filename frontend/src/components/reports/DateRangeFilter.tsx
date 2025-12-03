"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DatePreset =
  | "today"
  | "yesterday"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "allTime"
  | "custom";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  onApply?: () => void;
  className?: string;
}

const getDateRange = (preset: DatePreset): DateRange => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  switch (preset) {
    case "today":
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };

    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: formatDate(yesterday),
        endDate: formatDate(yesterday),
      };

    case "lastWeek":
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekStart.getDate() - 6);
      return {
        startDate: formatDate(lastWeekStart),
        endDate: formatDate(lastWeekEnd),
      };

    case "thisMonth":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: formatDate(monthStart),
        endDate: formatDate(today),
      };

    case "lastMonth":
      const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: formatDate(lastMonthStart),
        endDate: formatDate(lastMonthEnd),
      };

    case "thisQuarter":
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
      return {
        startDate: formatDate(quarterStart),
        endDate: formatDate(today),
      };

    case "thisYear":
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: formatDate(yearStart),
        endDate: formatDate(today),
      };

    case "allTime":
      // Set to a very early date to capture all historical data
      const allTimeStart = new Date(2020, 0, 1);
      return {
        startDate: formatDate(allTimeStart),
        endDate: formatDate(today),
      };

    default:
      return {
        startDate: formatDate(
          new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        ),
        endDate: formatDate(today),
      };
  }
};

const formatDateDisplay = (startDate: string, endDate: string): string => {
  // Parse date string as local timezone by adding time component
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const formatFull = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (startDate === endDate) {
    return formatFull(start);
  }

  return `${formatFull(start)} - ${formatFull(end)}`;
};

export default function DateRangeFilter({
  value,
  onChange,
  onApply,
  className,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<DatePreset | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presets: { label: string; value: DatePreset }[] = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last Week", value: "lastWeek" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "This Quarter", value: "thisQuarter" },
    { label: "This Year", value: "thisYear" },
    { label: "All Time", value: "allTime" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePresetClick = (preset: DatePreset) => {
    const dateRange = getDateRange(preset);
    onChange(dateRange);
    setActivePreset(preset);
    setShowCustom(false);
    setIsOpen(false);
    if (onApply) {
      onApply();
    }
  };

  const handleCustomClick = () => {
    setShowCustom(!showCustom);
    setActivePreset("custom");
  };

  const handleCustomDateChange = (
    field: "startDate" | "endDate",
    newValue: string
  ) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleApplyCustom = () => {
    setIsOpen(false);
    if (onApply) {
      onApply();
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Dropdown Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {formatDateDisplay(value.startDate, value.endDate)}
          </span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              Quick Select
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={cn(
                    "px-3 py-2 text-xs rounded-md transition-colors text-left",
                    activePreset === preset.value
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Range Toggle */}
            <button
              onClick={handleCustomClick}
              className={cn(
                "w-full px-3 py-2 text-xs rounded-md transition-colors text-left mt-2",
                activePreset === "custom"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Custom Range
            </button>

            {/* Custom Date Inputs */}
            {showCustom && (
              <div className="space-y-2 pt-2 border-t mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      htmlFor="customStart"
                      className="text-xs text-gray-600"
                    >
                      From
                    </Label>
                    <Input
                      id="customStart"
                      type="date"
                      value={value.startDate}
                      onChange={(e) =>
                        handleCustomDateChange("startDate", e.target.value)
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="customEnd"
                      className="text-xs text-gray-600"
                    >
                      To
                    </Label>
                    <Input
                      id="customEnd"
                      type="date"
                      value={value.endDate}
                      onChange={(e) =>
                        handleCustomDateChange("endDate", e.target.value)
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleApplyCustom}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                >
                  Apply Custom Range
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
