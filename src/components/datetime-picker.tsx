"use client";

import { format } from "date-fns";
import { useMemo, useState, useRef, useEffect, forwardRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDropdown } from "@/components/ui/calendar-dropdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONE_GROUPS: Record<string, string[]> = {
  "North America": [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "America/Toronto",
    "America/Vancouver",
    "Pacific/Honolulu",
  ],
  Europe: [
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Amsterdam",
    "Europe/Moscow",
    "Europe/Istanbul",
  ],
  Asia: [
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Dhaka",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
  ],
  "Australia & Pacific": [
    "Australia/Perth",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
    "Pacific/Fiji",
  ],
  "South America": [
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "America/Bogota",
    "America/Santiago",
  ],
  Africa: [
    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "Africa/Nairobi",
  ],
};

function getTimezoneLabel(tz: string): string {
  const city = tz.split("/").pop()?.replace(/_/g, " ") || tz;
  try {
    const offset =
      new Intl.DateTimeFormat("en", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value || "";
    return `${city} (${offset})`;
  } catch {
    return city;
  }
}

function getTimezoneAbbr(tz: string): string {
  try {
    return (
      new Intl.DateTimeFormat("en", {
        timeZone: tz,
        timeZoneName: "short",
      })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value || tz
    );
  } catch {
    return tz;
  }
}

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  timeInterval?: 15 | 30 | 60;
  hourFormat?: 12 | 24;
  timezone?: string;
  showTimezone?: boolean;
  onTimezoneChange?: (timezone: string) => void;
  minTime?: string;
  maxTime?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabledDates?: (date: Date) => boolean;
  name?: string;
  className?: string;
}

function formatTime(hour: number, minute: number, hourFormat: 12 | 24): string {
  const min = minute.toString().padStart(2, "0");
  if (hourFormat === 24) {
    return `${hour.toString().padStart(2, "0")}:${min}`;
  }
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${min} ${period}`;
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function parse24h(display: string): string {
  // If already 24h format, return as-is
  if (!display.includes("AM") && !display.includes("PM")) return display;

  const [timePart, period] = display.split(" ");
  const [hStr, mStr] = timePart.split(":");
  let hour = parseInt(hStr, 10);
  if (period === "AM" && hour === 12) hour = 0;
  else if (period === "PM" && hour !== 12) hour += 12;
  return `${hour.toString().padStart(2, "0")}:${mStr}`;
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      onChange,
      disabled = false,
      minDate,
      maxDate,
      placeholder = "Pick a date and time",
      timeInterval = 15,
      hourFormat = 24,
      timezone,
      showTimezone = false,
      onTimezoneChange,
      minTime,
      maxTime,
      weekStartsOn,
      disabledDates: disabledDatesFn,
      name,
      className,
    },
    ref,
  ) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState<string>(formatTime(9, 0, hourFormat));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedTimezone, setSelectedTimezone] = useState(
    timezone ?? "UTC",
  );

  // Set local timezone after mount to avoid hydration mismatch
  useEffect(() => {
    if (!timezone) {
      setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [timezone]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Sync controlled value prop → internal state
  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      const h = value.getHours();
      const m = value.getMinutes();
      setTime(formatTime(h, m, hourFormat));
    }
  }, [value, hourFormat]);

  // Sync timezone prop
  useEffect(() => {
    if (timezone) setSelectedTimezone(timezone);
  }, [timezone]);

  // Detect mobile screen (SSR-safe)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Memoize time slots to avoid recreating on every render
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const slotsPerHour = 60 / timeInterval;
    const totalSlots = 24 * slotsPerHour;

    // Parse min/max constraints to minutes for comparison
    const minMinutes = minTime ? toMinutes(parse24h(minTime)) : 0;
    const maxMinutes = maxTime ? toMinutes(parse24h(maxTime)) : 24 * 60 - 1;

    for (let i = 0; i < totalSlots; i++) {
      const hour = Math.floor(i / slotsPerHour);
      const minute = (i % slotsPerHour) * timeInterval;
      const totalMins = hour * 60 + minute;
      if (totalMins >= minMinutes && totalMins <= maxMinutes) {
        slots.push(formatTime(hour, minute, hourFormat));
      }
    }
    return slots;
  }, [timeInterval, hourFormat, minTime, maxTime]);

  // Check if a time slot is in the past (for today's date)
  const isTimePast = (timeValue: string): boolean => {
    const dateToCheck = selectedDate || new Date();
    const now = new Date();

    // Only disable past times if the date is today
    if (
      dateToCheck.getFullYear() !== now.getFullYear() ||
      dateToCheck.getMonth() !== now.getMonth() ||
      dateToCheck.getDate() !== now.getDate()
    ) {
      return false;
    }

    const time24 = parse24h(timeValue);
    const slotMinutes = toMinutes(time24);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= nowMinutes;
  };

  // Scroll to selected time when popover opens
  useEffect(() => {
    if (!isOpen) return;

    const selectedIndex = timeSlots.indexOf(time);
    if (selectedIndex === -1) return;

    // Wait for popover content to mount and paint
    requestAnimationFrame(() => {
      const container = scrollAreaRef.current;
      if (!container) return;

      // Try both Base UI and native scrollable container
      const viewport =
        container.querySelector<HTMLElement>(
          '[data-slot="scroll-area-viewport"]',
        ) || container.querySelector<HTMLElement>('[style*="overflow"]');

      if (!viewport) return;

      // Get actual button height from DOM
      const buttons = viewport.querySelectorAll("button");
      if (buttons.length === 0) return;

      const firstButton = buttons[0] as HTMLElement;
      const secondButton = buttons[1] as HTMLElement;
      const itemHeight = secondButton
        ? secondButton.offsetTop - firstButton.offsetTop
        : firstButton.offsetHeight + 4; // fallback: height + gap

      const scrollPosition = selectedIndex * itemHeight;
      const offset = viewport.clientHeight / 2 - itemHeight / 2;
      viewport.scrollTop = Math.max(0, scrollPosition - offset);
    });
  }, [isOpen, time, timeSlots]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange?.(undefined);
      return;
    }

    // Apply current time to the selected date
    const time24 = parse24h(time);
    const [hours, minutes] = time24.split(":");
    if (hours && minutes) {
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }

    setSelectedDate(date);
    onChange?.(date);
  }, [time, onChange]);

  const handleTimeSelect = (timeValue: string) => {
    setTime(timeValue);

    // Use selected date or default to today if no date selected yet
    const dateToUse = selectedDate || new Date();

    // Convert to 24h for Date operations
    const time24 = parse24h(timeValue);
    const [hours, minutes] = time24.split(":");
    if (hours && minutes) {
      const newDate = new Date(dateToUse.getTime());
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      setSelectedDate(newDate);
      onChange?.(newDate);
    }

    setIsOpen(false);
  };

  const handleTimezoneChange = (tz: string | null) => {
    if (!tz) return;
    setSelectedTimezone(tz);
    onTimezoneChange?.(tz);
  };

  const handleDayClick = () => {
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDatesFn?.(date)) return true;
    return false;
  };

  const triggerContent = (
    <>
      {selectedDate ? (
        <>
          {format(selectedDate, "PPP")}, {time}
          {showTimezone && (
            <span className="text-muted-foreground ml-1">
              {getTimezoneAbbr(selectedTimezone)}
            </span>
          )}
        </>
      ) : (
        <span>{placeholder}</span>
      )}
      <HugeiconsIcon
        icon={Calendar03Icon}
        className="ml-auto h-4 w-4 opacity-50"
      />
    </>
  );

  const pickerContent = (
    <>
      <div className="flex flex-row items-start">
        <CalendarDropdown
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={handleDateSelect}
          onDayClick={handleDayClick}
          disabled={isDateDisabled}
          startMonth={minDate}
          endMonth={maxDate}
          defaultMonth={selectedDate}
          weekStartsOn={weekStartsOn}
        />
        <div
          ref={scrollAreaRef}
          className="w-[150px] pr-3 py-3 h-[var(--calendar-height,350px)]"
        >
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 pr-3 py-1">
              {timeSlots.map((timeValue) => {
                const isSelected = timeValue === time;
                const isPast = isTimePast(timeValue);
                return (
                  <Button
                    key={timeValue}
                    className="w-full text-center justify-center px-2"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={isPast}
                    onClick={() => handleTimeSelect(timeValue)}
                  >
                    {timeValue}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
      {showTimezone && (
        <div className="border-t px-3 py-2">
          <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue>
                {getTimezoneAbbr(selectedTimezone)} —{" "}
                {selectedTimezone.split("/").pop()?.replace(/_/g, " ")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              side="bottom"
              alignItemWithTrigger={false}
            >
              <ScrollArea className="h-72">
                {Object.entries(TIMEZONE_GROUPS).map(([group, zones]) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {zones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {getTimezoneLabel(tz)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );

  const triggerButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal",
        !selectedDate && "text-muted-foreground",
        className,
      )}
    >
      {triggerContent}
    </Button>
  );

  // Hidden input for form compatibility
  const hiddenInput = name ? (
    <input
      type="hidden"
      ref={ref}
      name={name}
      value={selectedDate?.toISOString() ?? ""}
    />
  ) : null;

  if (isMobile) {
    return (
      <>
        {hiddenInput}
        <Drawer open={isOpen} onOpenChange={setIsOpen} showSwipeHandle>
          <DrawerTrigger render={triggerButton} />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Pick date & time</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pt-0">{pickerContent}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {hiddenInput}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger render={triggerButton} />
        <PopoverContent className="w-auto p-0 flex flex-col" align="start">
          {pickerContent}
        </PopoverContent>
      </Popover>
    </>
  );
},
);
