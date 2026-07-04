"use client";

import { format } from "date-fns";
import { useMemo, useState, useEffect, forwardRef, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
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

function formatTime(hour: number, minute: number, hourFormat: 12 | 24): string {
  const min = minute.toString().padStart(2, "0");
  if (hourFormat === 24) return `${hour.toString().padStart(2, "0")}:${min}`;
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${min} ${period}`;
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

function applyTime(date: Date, timeStr: string): Date {
  const time24 = parse24h(timeStr);
  const [h, m] = time24.split(":");
  const d = new Date(date.getTime());
  d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return d;
}

// ─── Types ─────────────────────────────────────────────────────

export interface DateTimeRange {
  from?: Date;
  to?: Date;
}

export interface DateTimePickerRangeProps {
  value?: DateTimeRange;
  onChange?: (range: DateTimeRange) => void;
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

// ─── Single side picker (from / to) ───────────────────────────

interface SidePickerProps {
  label: string;
  date: Date | undefined;
  time: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onDayClick: () => void;
  timeSlots: string[];
  isTimePast: (timeValue: string) => boolean;
  disabled: boolean;
  isDateDisabled: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  defaultMonth?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

function SidePicker({
  label,
  date,
  time,
  onDateSelect,
  onTimeSelect,
  onDayClick,
  timeSlots,
  isTimePast,
  disabled,
  isDateDisabled,
  minDate,
  maxDate,
  defaultMonth,
  weekStartsOn,
}: SidePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to selected time
  useEffect(() => {
    const selectedIndex = timeSlots.indexOf(time);
    if (selectedIndex === -1) return;
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      const viewport = container.querySelector<HTMLElement>(
        '[data-slot="scroll-area-viewport"]',
      );
      if (!viewport) return;
      const buttons = viewport.querySelectorAll("button");
      if (buttons.length < 2) return;
      const itemHeight =
        (buttons[1] as HTMLElement).offsetTop -
        (buttons[0] as HTMLElement).offsetTop;
      const scrollPos = selectedIndex * itemHeight;
      const offset = viewport.clientHeight / 2 - itemHeight / 2;
      viewport.scrollTop = Math.max(0, scrollPos - offset);
    });
  }, [time, timeSlots]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start">
        <CalendarDropdown
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={onDateSelect}
          onDayClick={onDayClick}
          disabled={(d) => disabled || isDateDisabled(d)}
          startMonth={minDate}
          endMonth={maxDate}
          defaultMonth={defaultMonth}
          weekStartsOn={weekStartsOn}
        />
        <div
          ref={scrollRef}
          className="w-[150px] pr-3 py-3 h-[var(--calendar-height,350px)]"
        >
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 pr-2">
              {timeSlots.map((timeValue) => {
                const isSelected = timeValue === time;
                const isPast = isTimePast(timeValue);
                return (
                  <Button
                    key={timeValue}
                    className="w-full text-center justify-center px-2"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={disabled || isPast}
                    onClick={() => onTimeSelect(timeValue)}
                  >
                    {timeValue}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export const DateTimePickerRange = forwardRef<
  HTMLInputElement,
  DateTimePickerRangeProps
>(function DateTimePickerRange(
  {
    value,
    onChange,
    disabled = false,
    minDate,
    maxDate,
    placeholder = "Select date & time range",
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
  const [fromDate, setFromDate] = useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = useState<Date | undefined>(value?.to);
  const [fromTime, setFromTime] = useState<string>(
    formatTime(9, 0, hourFormat),
  );
  const [toTime, setToTime] = useState<string>(formatTime(17, 0, hourFormat));
  const [selectedTimezone, setSelectedTimezone] = useState(timezone ?? "UTC");
  const [isMobile, setIsMobile] = useState(false);
  // Track which side is active: "from" or "to"
  const [activeSide, setActiveSide] = useState<"from" | "to">("from");

  // Sync controlled value
  useEffect(() => {
    setFromDate(value?.from);
    setToDate(value?.to);
    if (value?.from) {
      setFromTime(
        formatTime(value.from.getHours(), value.from.getMinutes(), hourFormat),
      );
    }
    if (value?.to) {
      setToTime(
        formatTime(value.to.getHours(), value.to.getMinutes(), hourFormat),
      );
    }
  }, [value, hourFormat]);

  // Set local timezone after mount
  useEffect(() => {
    if (!timezone) {
      setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
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

  // Past time check
  const isTimePast = (timeValue: string): boolean => {
    const dateToCheck =
      activeSide === "from" ? fromDate || new Date() : toDate || new Date();
    const now = new Date();
    if (
      dateToCheck.getFullYear() !== now.getFullYear() ||
      dateToCheck.getMonth() !== now.getMonth() ||
      dateToCheck.getDate() !== now.getDate()
    )
      return false;
    return (
      toMinutes(parse24h(timeValue)) <= now.getHours() * 60 + now.getMinutes()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDatesFn?.(date)) return true;
    return false;
  };

  const emitChange = (from: Date | undefined, to: Date | undefined) => {
    onChange?.({ from, to });
  };

  // ─── From handlers ─────────────────────────────────────────

  const handleFromDateSelect = (date: Date | undefined) => {
    if (!date) {
      setFromDate(undefined);
      emitChange(undefined, toDate);
      return;
    }
    const combined = applyTime(date, fromTime);
    setFromDate(combined);
    emitChange(combined, toDate);
    setActiveSide("to");
  };

  const handleFromTimeSelect = (timeValue: string) => {
    setFromTime(timeValue);
    const dateToUse = fromDate || new Date();
    const combined = applyTime(dateToUse, timeValue);
    setFromDate(combined);
    emitChange(combined, toDate);
  };

  // ─── To handlers ───────────────────────────────────────────

  const handleToDateSelect = (date: Date | undefined) => {
    if (!date) {
      setToDate(undefined);
      emitChange(fromDate, undefined);
      return;
    }
    const combined = applyTime(date, toTime);
    setToDate(combined);
    emitChange(fromDate, combined);
  };

  const handleToTimeSelect = (timeValue: string) => {
    setToTime(timeValue);
    const dateToUse = toDate || new Date();
    const combined = applyTime(dateToUse, timeValue);
    setToDate(combined);
    emitChange(fromDate, combined);
    setIsOpen(false);
  };

  const handleTimezoneChange = (tz: string | null) => {
    if (!tz) return;
    setSelectedTimezone(tz);
    onTimezoneChange?.(tz);
  };

  // ─── Display ───────────────────────────────────────────────

  const hasSelection = fromDate || toDate;

  const displayText = hasSelection ? (
    <span className="flex items-center gap-1.5 truncate">
      {fromDate ? (
        <span>
          {format(fromDate, "MMM d, yyyy")} {fromTime}
        </span>
      ) : (
        <span className="text-muted-foreground">Start</span>
      )}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="h-3.5 w-3.5 shrink-0 opacity-50"
      />
      {toDate ? (
        <span>
          {format(toDate, "MMM d, yyyy")} {toTime}
        </span>
      ) : (
        <span className="text-muted-foreground">End</span>
      )}
      {showTimezone && (
        <span className="text-muted-foreground ml-1">
          {getTimezoneAbbr(selectedTimezone)}
        </span>
      )}
    </span>
  ) : (
    <span>{placeholder}</span>
  );

  // ─── Picker Content ────────────────────────────────────────

  const pickerContent = (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            activeSide === "from"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveSide("from")}
        >
          From{" "}
          {fromDate && (
            <span className="text-xs ml-1 opacity-70">
              {format(fromDate, "MMM d")}
            </span>
          )}
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            activeSide === "to"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveSide("to")}
        >
          To{" "}
          {toDate && (
            <span className="text-xs ml-1 opacity-70">
              {format(toDate, "MMM d")}
            </span>
          )}
        </button>
      </div>

      {/* Active side picker */}
      {activeSide === "from" ? (
        <SidePicker
          label="Start date & time"
          date={fromDate}
          time={fromTime}
          onDateSelect={handleFromDateSelect}
          onTimeSelect={handleFromTimeSelect}
          onDayClick={() => setActiveSide("to")}
          timeSlots={timeSlots}
          isTimePast={isTimePast}
          disabled={disabled}
          isDateDisabled={isDateDisabled}
          minDate={minDate}
          maxDate={maxDate}
          defaultMonth={fromDate}
          weekStartsOn={weekStartsOn}
        />
      ) : (
        <SidePicker
          label="End date & time"
          date={toDate}
          time={toTime}
          onDateSelect={handleToDateSelect}
          onTimeSelect={handleToTimeSelect}
          onDayClick={() => setIsOpen(false)}
          timeSlots={timeSlots}
          isTimePast={isTimePast}
          disabled={disabled}
          isDateDisabled={(date) => {
            if (fromDate && date < fromDate) return true;
            return isDateDisabled(date);
          }}
          minDate={fromDate || minDate}
          maxDate={maxDate}
          defaultMonth={toDate || fromDate}
          weekStartsOn={weekStartsOn}
        />
      )}

      {/* Timezone */}
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
    </div>
  );

  const triggerButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal",
        !hasSelection && "text-muted-foreground",
        className,
      )}
    >
      <HugeiconsIcon
        icon={Calendar03Icon}
        className="mr-2 h-4 w-4 shrink-0 opacity-50"
      />
      {displayText}
    </Button>
  );

  const hiddenInput = name ? (
    <input
      type="hidden"
      ref={ref}
      name={name}
      value={
        fromDate && toDate
          ? `${fromDate.toISOString()}/${toDate.toISOString()}`
          : ""
      }
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
              <DrawerTitle>Select date & time range</DrawerTitle>
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
        <PopoverContent className="w-auto p-0" align="start">
          {pickerContent}
        </PopoverContent>
      </Popover>
    </>
  );
});
