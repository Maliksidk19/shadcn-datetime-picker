"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { DateTimePicker } from "@/components/datetime-picker";
import { DateTimePickerSeparate } from "@/components/datetime-picker-separate";
import {
  DateTimePickerRange,
  type DateTimeRange,
} from "@/components/datetime-picker-range";
import {
  DateTimePickerField,
  useForm,
  zodResolver,
} from "@/components/datetime-picker-form";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function DemoCard({
  label,
  children,
  output,
}: {
  label: string;
  children: React.ReactNode;
  output?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {output && (
        <p className="text-xs text-muted-foreground font-mono bg-muted rounded-md px-3 py-2">
          {output}
        </p>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={Sun03Icon}
        className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <HugeiconsIcon
        icon={Moon02Icon}
        className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function DemoPage() {
  const [basicDate, setBasicDate] = useState<Date>();
  const [separateDate, setSeparateDate] = useState<Date>();
  const [rangeValue, setRangeValue] = useState<DateTimeRange>();
  const [activeTab, setActiveTab] = useState<
    "combined" | "separate" | "range" | "form"
  >("combined");
  const [formResult, setFormResult] = useState<string>();

  const tabs = [
    { id: "combined" as const, label: "Combined" },
    { id: "separate" as const, label: "Separate Fields" },
    { id: "range" as const, label: "Range" },
    { id: "form" as const, label: "Form" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Shadcn DateTime Picker
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              A fully-featured datetime picker built on shadcn/ui,
              @daypicker/react v10, and Base UI.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://github.com/Maliksidk19/shadcn-datetime-picker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                GitHub
              </a>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                3 Variants · 16+ Features · Fully Responsive
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Variant Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-sm font-sm rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Combined Variant ─────────────────────────────── */}
        {activeTab === "combined" && (
          <div className="space-y-10">
            <Section
              title="DateTimePicker"
              description="All-in-one calendar + time picker in a single popover."
            >
              <div className="grid gap-6 max-w-md">
                <DemoCard
                  label="Default"
                  output={
                    basicDate
                      ? `Selected: ${format(basicDate, "PPP, p")}`
                      : undefined
                  }
                >
                  <DateTimePicker value={basicDate} onChange={setBasicDate} />
                </DemoCard>

                <DemoCard label="12-hour format (AM/PM)">
                  <DateTimePicker hourFormat={12} />
                </DemoCard>

                <DemoCard label="30-minute intervals">
                  <DateTimePicker timeInterval={30} />
                </DemoCard>

                <DemoCard label="Min/Max dates (today → 30 days)">
                  <DateTimePicker
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  />
                </DemoCard>

                <DemoCard label="Business hours (9 AM – 5 PM)">
                  <DateTimePicker
                    minTime="09:00"
                    maxTime="17:00"
                    hourFormat={12}
                    timeInterval={30}
                  />
                </DemoCard>

                <DemoCard label="With timezone selector">
                  <DateTimePicker showTimezone />
                </DemoCard>

                <DemoCard label="Week starts on Monday">
                  <DateTimePicker weekStartsOn={1} />
                </DemoCard>

                <DemoCard label="Weekends disabled">
                  <DateTimePicker
                    disabledDates={(date) =>
                      date.getDay() === 0 || date.getDay() === 6
                    }
                  />
                </DemoCard>

                <DemoCard label="Full booking scenario">
                  <DateTimePicker
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)}
                    minTime="09:00"
                    maxTime="17:00"
                    hourFormat={12}
                    timeInterval={30}
                    weekStartsOn={1}
                    showTimezone
                    disabledDates={(date) =>
                      date.getDay() === 0 || date.getDay() === 6
                    }
                    placeholder="Book an appointment"
                  />
                </DemoCard>

                <DemoCard label="Disabled">
                  <DateTimePicker disabled />
                </DemoCard>
              </div>
            </Section>
          </div>
        )}

        {/* ─── Separate Fields Variant ──────────────────────── */}
        {activeTab === "separate" && (
          <div className="space-y-10">
            <Section
              title="DateTimePickerSeparate"
              description="Individual date, time, and timezone fields that work together."
            >
              <div className="grid gap-6 max-w-lg">
                <DemoCard
                  label="Default"
                  output={
                    separateDate
                      ? `Selected: ${format(separateDate, "PPP, p")}`
                      : undefined
                  }
                >
                  <DateTimePickerSeparate
                    value={separateDate}
                    onChange={setSeparateDate}
                  />
                </DemoCard>

                <DemoCard label="12-hour with timezone">
                  <DateTimePickerSeparate showTimezone hourFormat={12} />
                </DemoCard>

                <DemoCard label="Business hours">
                  <DateTimePickerSeparate
                    minTime="09:00"
                    maxTime="17:00"
                    hourFormat={12}
                    timeInterval={30}
                    showTimezone
                    disabledDates={(date) =>
                      date.getDay() === 0 || date.getDay() === 6
                    }
                  />
                </DemoCard>
              </div>
            </Section>
          </div>
        )}

        {/* ─── Range Variant ────────────────────────────────── */}
        {activeTab === "range" && (
          <div className="space-y-10">
            <Section
              title="DateTimePickerRange"
              description="Start/end date+time range selection with tab-based navigation."
            >
              <div className="grid gap-6 max-w-lg">
                <DemoCard
                  label="Default"
                  output={
                    rangeValue?.from && rangeValue?.to
                      ? `${format(rangeValue.from, "PPP, p")} → ${format(rangeValue.to, "PPP, p")}`
                      : undefined
                  }
                >
                  <DateTimePickerRange
                    value={rangeValue}
                    onChange={setRangeValue}
                  />
                </DemoCard>

                <DemoCard label="Meeting scheduler">
                  <DateTimePickerRange
                    hourFormat={12}
                    minTime="09:00"
                    maxTime="17:00"
                    timeInterval={30}
                    showTimezone
                    minDate={new Date()}
                    disabledDates={(date) =>
                      date.getDay() === 0 || date.getDay() === 6
                    }
                    placeholder="Schedule a meeting"
                  />
                </DemoCard>
              </div>
            </Section>
          </div>
        )}
        {/* ─── Form Variant ──────────────────────────────── */}
        {activeTab === "form" && (
          <div className="space-y-10">
            <Section
              title="Form Integration"
              description="Using DateTimePickerField with React Hook Form + Zod validation."
            >
              <div className="max-w-md">
                <FormDemo
                  onResult={setFormResult}
                />
                {formResult && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted rounded-md px-3 py-2 mt-4">
                    {formResult}
                  </p>
                )}
              </div>
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Form Demo ─────────────────────────────────────────────

const formSchema = z.object({
  appointment: z.date({ error: "Please select a date and time." }),
  deadline: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function FormDemo({ onResult }: { onResult: (result: string) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    const parts = [`Appointment: ${format(data.appointment, "PPP, p")}`];
    if (data.deadline) {
      parts.push(`Deadline: ${format(data.deadline, "PPP, p")}`);
    }
    onResult(parts.join(" | "));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <DateTimePickerField
        control={form.control}
        name="appointment"
        label="Appointment"
        description="Select a date and time for your appointment."
        hourFormat={12}
        minDate={new Date()}
        minTime="09:00"
        maxTime="17:00"
        timeInterval={30}
        placeholder="Pick appointment time"
      />

      <DateTimePickerField
        control={form.control}
        name="deadline"
        label="Deadline (optional)"
        description="Set an optional deadline."
        placeholder="Pick a deadline"
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
