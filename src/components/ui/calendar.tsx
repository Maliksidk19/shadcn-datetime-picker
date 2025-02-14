"use client";

import * as React from "react";
import { DayPicker, Dropdown as DropDownDayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  captionLabelClassName?: string;
  dayClassName?: string;
  dayButtonClassName?: string;
  dropdownsClassName?: string;
  footerClassName?: string;
  monthClassName?: string;
  monthCaptionClassName?: string;
  monthGridClassName?: string;
  monthsClassName?: string;
  weekClassName?: string;
  weekdayClassName?: string;
  weekdaysClassName?: string;
  rangeEndClassName?: string;
  rangeMiddleClassName?: string;
  rangeStartClassName?: string;
  selectedClassName?: string;
  disabledClassName?: string;
  hiddenClassName?: string;
  outsideClassName?: string;
  todayClassName?: string;
  selectTriggerClassName?: string;
};

function Calendar({
  className,
  classNames,
  hideNavigation,
  showOutsideDays = true,
  components: customComponents,
  ...props
}: CalendarProps) {
  const _monthsClassName = cn(
    "relative flex flex-col gap-4 sm:flex-row",
    props.monthsClassName
  );
  const _monthCaptionClassName = cn(
    "relative flex h-7 items-center justify-center",
    props.monthCaptionClassName
  );
  const _dropdownsClassName = cn(
    "flex items-center justify-center gap-2 w-full",
    hideNavigation ? "w-full" : "",
    props.dropdownsClassName
  );
  const _footerClassName = cn("pt-3 text-sm", props.footerClassName);
  const _weekdaysClassName = cn("flex", props.weekdaysClassName);
  const _weekdayClassName = cn(
    "w-9 text-sm font-normal text-muted-foreground",
    props.weekdayClassName
  );
  const _captionLabelClassName = cn(
    "truncate text-sm font-medium",
    props.captionLabelClassName
  );

  const _monthGridClassName = cn("mx-auto mt-4", props.monthGridClassName);
  const _weekClassName = cn("mt-2 flex w-max items-start", props.weekClassName);
  const _dayClassName = cn(
    "flex size-9 flex-1 items-center justify-center p-0 text-sm",
    props.dayClassName
  );
  const _dayButtonClassName = cn(
    buttonVariants({ variant: "ghost" }),
    "size-9 rounded-md p-0 font-normal transition-none aria-selected:opacity-100",
    props.dayButtonClassName
  );

  const buttonRangeClassName =
    "bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground";
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    "rounded-s-md",
    props.rangeStartClassName
  );
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    "rounded-e-md",
    props.rangeEndClassName
  );
  const _rangeMiddleClassName = cn(
    "bg-accent !text-foreground [&>button]:bg-transparent [&>button]:!text-foreground [&>button]:hover:bg-transparent [&>button]:hover:!text-foreground",
    props.rangeMiddleClassName
  );
  const _selectedClassName = cn(
    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
    props.selectedClassName
  );
  const _todayClassName = cn(
    "[&>button]:bg-accent [&>button]:text-accent-foreground",
    props.todayClassName
  );
  const _outsideClassName = cn(
    "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    props.outsideClassName
  );
  const _disabledClassName = cn(
    "text-muted-foreground opacity-50",
    props.disabledClassName
  );
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName);

  const Dropdown = React.useCallback(
    ({
      value,
      onChange,
      options,
    }: React.ComponentProps<typeof DropDownDayPicker>) => {
      const selected = options?.find((option) => option.value === value);
      const handleChange = (value: string) => {
        const changeEvent = {
          target: { value },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange?.(changeEvent);
      };
      return (
        <Select
          value={value?.toString()}
          onValueChange={(value) => {
            handleChange(value);
          }}
        >
          <SelectTrigger className="outline-none focus:ring-0 focus:ring-offset-0">
            <SelectValue>{selected?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="center">
            <ScrollArea className="h-80">
              {options?.map(({ value, label, disabled }, id) => (
                <SelectItem
                  key={`${value}-${id}`}
                  value={value?.toString()}
                  disabled={disabled}
                >
                  {label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      );
    },
    []
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      hideNavigation={true} // Ensure navigation is hidden
      className={cn("p-3", className)}
      classNames={{
        caption_label: _captionLabelClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        dropdowns: _dropdownsClassName,
        footer: _footerClassName,
        month: props.monthClassName,
        month_caption: _monthCaptionClassName,
        month_grid: _monthGridClassName,
        months: _monthsClassName,
        week: _weekClassName,
        weekday: _weekdayClassName,
        weekdays: _weekdaysClassName,
        range_end: _rangeEndClassName,
        range_middle: _rangeMiddleClassName,
        range_start: _rangeStartClassName,
        selected: _selectedClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
        outside: _outsideClassName,
        today: _todayClassName,
        nav: "hidden", // This hides the navigation (chevrons)
        ...classNames,
      }}
      components={{
        Dropdown,
        ...customComponents,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
