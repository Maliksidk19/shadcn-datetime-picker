"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

const FormSchema = z.object({
  datetime: z.date({
    required_error: "Date & time is required!",
  }),
});

export function DatetimePickerV1() {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState<string>("05:00");
  const [date, setDate] = useState<Date | null>(new Date()); // Default button height

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success(`Meeting at: ${format(data.datetime, "PPP, p")}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="datetime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Datetime</FormLabel>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        `${format(field.value, "PPP")}, ${time}`
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 flex items-start"
                  align="start"
                >
                  <div ref={calendarRef}>
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={date || field.value}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          const [hours, minutes] = time.split(":");
                          selectedDate.setHours(
                            parseInt(hours),
                            parseInt(minutes)
                          );
                          setDate(selectedDate);
                          field.onChange(selectedDate);
                        }
                      }}
                      onDayClick={() => setIsOpen(false)}
                      fromYear={2000}
                      toYear={new Date().getFullYear()}
                      disabled={(date) =>
                        Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
                        Number(date) > Date.now() + 1000 * 60 * 60 * 24 * 30
                      }
                    />
                  </div>
                  <div className="w-[120px] my-4 mr-2">
                    <ScrollArea className="h-[18rem]">
                      <div className="flex flex-col gap-2 h-full">
                        {Array.from({ length: 96 }).map((_, i) => {
                          const hour = Math.floor(i / 4)
                            .toString()
                            .padStart(2, "0");
                          const minute = ((i % 4) * 15)
                            .toString()
                            .padStart(2, "0");
                          const timeValue = `${hour}:${minute}`;
                          return (
                            <Button
                              key={i}
                              className="w-full text-left px-2"
                              variant="outline"
                              onClick={() => {
                                setTime(timeValue);
                                if (date) {
                                  const newDate = new Date(date.getTime());
                                  newDate.setHours(
                                    parseInt(hour),
                                    parseInt(minute)
                                  );
                                  setDate(newDate);
                                  field.onChange(newDate);
                                }
                                setIsOpen(false);
                              }}
                            >
                              {timeValue}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>Set your date and time.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
