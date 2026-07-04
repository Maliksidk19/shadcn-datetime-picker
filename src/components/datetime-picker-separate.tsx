"use client";

import { format } from "date-fns";
import { useMemo, useState, useEffect, forwardRef, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
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

// ─── Shared helpers ────────────────────────────────────────────

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

function formatTime(
  hour: number,
  minute: number,
  hourFormat: 12 | 24,
): string {
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
  if (!display.includes("AM") && !display.includes("PM")) return display;
  const [timePart, period] = display.split(" ");
  const [hStr, mStr] = timePart.split(":");
  let hour = parseInt(hStr, 10);
  if (period === "AM" && hour === 12) hour = 0;
  else if (period === "PM" && hour !== 12) hour += 12;
  return `${hour.toString().padStart(2, "0")}:${mStr}`;
}

// ─── Types ─────────────────────────────────────────────────────

export interface DateTimePickerSeparateProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  datePlaceholder?: string;
  timePlaceholder?: string;
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

// ─── Component ─────────────────────────────────────────────────

export const DateTimePickerSeparate = forwardRef<
  HTMLInputElement,
  DateTimePickerSeparateProps
>(function DateTimePickerSeparate(
  {
    value,
    onChange,
    disabled = false,
    minDate,
    maxDate,
    datePlaceholder = "Pick a date",
    timePlaceholder = "Pick time",
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
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState<string>(formatTime(9, 0, hourFormat));
  const [selectedTimezone, setSelectedTimezone] = useState(
    timezone ?? "UTC",
  );

  // Set local timezone after mount to avoid hydration mismatch
  useEffect(() => {
    if (!timezone) {
      setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [timezone]);
  const [isMobile, setIsMobile] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Sync controlled value
  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setTime(formatTime(value.getHours(), value.getMinutes(), hourFormat));
    }
  }, [value, hourFormat]);

  // Sync timezone prop
  useEffect(() => {
    if (timezone) setSelectedTimezone(timezone);
  }, [timezone]);

  // SSR-safe mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const slotsPerHour = 60 / timeInterval;
    const totalSlots = 24 * slotsPerHour;
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

  // Scroll to selected time
  useEffect(() => {
    if (!timeOpen) return;
    const selectedIndex = timeSlots.indexOf(time);
    if (selectedIndex === -1) return;

    requestAnimationFrame(() => {
      const container = scrollAreaRef.current;
      if (!container) return;
      const viewport = container.querySelector<HTMLElement>(
        '[data-slot="scroll-area-viewport"]',
      );
      if (!viewport) return;
      const buttons = viewport.querySelectorAll("button");
      if (buttons.length === 0) return;
      const first = buttons[0] as HTMLElement;
      const second = buttons[1] as HTMLElement;
      const itemHeight = second
        ? second.offsetTop - first.offsetTop
        : first.offsetHeight + 4;
      const scrollPos = selectedIndex * itemHeight;
      const offset = viewport.clientHeight / 2 - itemHeight / 2;
      viewport.scrollTop = Math.max(0, scrollPos - offset);
    });
  }, [timeOpen, time, timeSlots]);

  // Past time check
  const isTimePast = (timeValue: string): boolean => {
    const dateToCheck = selectedDate || new Date();
    const now = new Date();
    if (
      dateToCheck.getFullYear() !== now.getFullYear() ||
      dateToCheck.getMonth() !== now.getMonth() ||
      dateToCheck.getDate() !== now.getDate()
    ) {
      return false;
    }
    const slotMinutes = toMinutes(parse24h(timeValue));
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= nowMinutes;
  };

  // Build combined date
  const buildDate = (
    date: Date | undefined,
    timeStr: string,
  ): Date | undefined => {
    if (!date) return undefined;
    const time24 = parse24h(timeStr);
    const [h, m] = time24.split(":");
    if (!h || !m) return date;
    const newDate = new Date(date.getTime());
    newDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return newDate;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange?.(undefined);
      return;
    }
    const combined = buildDate(date, time);
    setSelectedDate(combined);
    onChange?.(combined);
  };

  const handleDayClick = () => setDateOpen(false);

  const handleTimeSelect = (timeValue: string) => {
    setTime(timeValue);
    const dateToUse = selectedDate || new Date();
    const combined = buildDate(dateToUse, timeValue);
    setSelectedDate(combined);
    onChange?.(combined);
    setTimeOpen(false);
  };

  const handleTimezoneChange = (tz: string | null) => {
    if (!tz) return;
    setSelectedTimezone(tz);
    onTimezoneChange?.(tz);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDatesFn?.(date)) return true;
    return false;
  };

  // ─── Date Picker ───────────────────────────────────────────

  const calendarContent = (
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
  );

  const dateButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn(
        "flex-1 justify-start text-left font-normal",
        !selectedDate && "text-muted-foreground",
      )}
    >
      <HugeiconsIcon icon={Calendar03Icon} className="mr-2 h-4 w-4 opacity-50" />
      {selectedDate ? format(selectedDate, "PPP") : datePlaceholder}
    </Button>
  );

  const datePicker = isMobile ? (
    <Drawer open={dateOpen} onOpenChange={setDateOpen} showSwipeHandle>
      <DrawerTrigger render={dateButton} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pick a date</DrawerTitle>
        </DrawerHeader>
        <div className="flex justify-center p-4 pt-0">{calendarContent}</div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Popover open={dateOpen} onOpenChange={setDateOpen}>
      <PopoverTrigger render={dateButton} />
      <PopoverContent className="w-auto p-0" align="start">
        {calendarContent}
      </PopoverContent>
    </Popover>
  );

  // ─── Time Picker ───────────────────────────────────────────

  const timeListContent = (
    <div ref={scrollAreaRef} className="w-full">
      <ScrollArea className="h-[280px]">
        <div className="flex flex-col gap-1 p-2">
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
  );

  const timeButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn(
        "w-[140px] justify-start text-left font-normal",
        !selectedDate && "text-muted-foreground",
      )}
    >
      <HugeiconsIcon icon={Clock01Icon} className="mr-2 h-4 w-4 opacity-50" />
      {time}
    </Button>
  );

  const timePicker = isMobile ? (
    <Drawer open={timeOpen} onOpenChange={setTimeOpen} showSwipeHandle>
      <DrawerTrigger render={timeButton} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pick a time</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pt-0">{timeListContent}</div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Popover open={timeOpen} onOpenChange={setTimeOpen}>
      <PopoverTrigger render={timeButton} />
      <PopoverContent className="w-[180px] p-0" align="start">
        {timeListContent}
      </PopoverContent>
    </Popover>
  );

  // ─── Timezone Picker ───────────────────────────────────────

  const timezonePicker = showTimezone ? (
    <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
      <SelectTrigger
        size="sm"
        disabled={disabled}
        className="w-[180px] font-normal"
      >
        <HugeiconsIcon
          icon={Globe02Icon}
          className="mr-2 h-4 w-4 opacity-50"
        />
        <SelectValue>
          {getTimezoneAbbr(selectedTimezone)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" side="bottom" alignItemWithTrigger={false}>
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
  ) : null;

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {name && (
        <input
          type="hidden"
          ref={ref}
          name={name}
          value={selectedDate?.toISOString() ?? ""}
        />
      )}
      {datePicker}
      {timePicker}
      {timezonePicker}
    </div>
  );
});
