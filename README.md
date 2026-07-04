# Shadcn DateTime Picker

A beautifully crafted, fully-featured datetime picker built on top of [shadcn/ui](https://ui.shadcn.com), [@daypicker/react](https://daypicker.dev) v10, and [Base UI](https://base-ui.com). Ships with **3 variants** to cover every use case.

## Variants

| Component | Use Case |
|-----------|----------|
| [`DateTimePicker`](#datetimepicker) | All-in-one calendar + time picker in a single popover |
| [`DateTimePickerSeparate`](#datetimepickerseparate) | Individual date, time, and timezone fields |
| [`DateTimePickerRange`](#datetimepickerrange) | Start/end date+time range selection |
| [`DateTimePickerField`](#datetimepickerfield) | React Hook Form + Zod integration with Field component |

## Features

- 📅 **Date & time selection** — calendar + scrollable time picker side-by-side
- 🕐 **12h / 24h format** — AM/PM or military time
- 🌍 **Timezone selector** — grouped IANA timezones with offset display
- ⏰ **Min/Max time** — restrict to business hours or custom ranges
- 📆 **Min/Max dates** — constrain selectable date range
- 🚫 **Disabled dates** — custom function to disable specific dates (weekends, holidays, etc.)
- 🕑 **Past time auto-disable** — when today is selected, past time slots are greyed out
- 📱 **Responsive** — Popover on desktop, Drawer on mobile
- 📝 **Form compatible** — `name` prop with hidden input, `ref` forwarding via `forwardRef`
- 🔄 **Controlled & uncontrolled** — works both ways
- 🗓️ **Week start day** — start week on any day (Sunday, Monday, etc.)
- ⏱️ **Time intervals** — 15, 30, or 60 minute slots
- 🎯 **Scroll to selected** — time list auto-scrolls to selected time on open
- 🌙 **Dark mode** — inherits from your Shadcn theme
- 🔒 **SSR safe** — no hydration mismatches with Next.js
- 📦 **Zero extra dependencies** — only uses what Shadcn already provides

## Tech Stack

- **React 19** + **Next.js 16**
- **Shadcn/ui v4** (Base UI)
- **@daypicker/react v10**
- **date-fns v4**
- **Tailwind CSS v4**
- **TypeScript**

## Installation

### Prerequisites

You need a project with [shadcn/ui](https://ui.shadcn.com) already set up.

### 1. Install dependencies

```bash
npm install @daypicker/react date-fns
```

### 2. Add required Shadcn components

```bash
npx shadcn@latest add popover button scroll-area select separator drawer
```

### 3. Copy the components

Copy the following files into your project:

```
src/components/
├── ui/calendar-dropdown.tsx       # Required — custom calendar with dropdown navigation
├── datetime-picker.tsx            # Variant 1 — combined picker
├── datetime-picker-separate.tsx   # Variant 2 — separate fields
├── datetime-picker-range.tsx      # Variant 3 — range picker
└── datetime-picker-form.tsx       # Variant 4 — React Hook Form + Field wrapper
```

Pick only the variants you need — each file is self-contained.

---

## DateTimePicker

All-in-one calendar + time picker in a single popover. Best for forms, scheduling, and general datetime input.

### Basic Usage

```tsx
import { DateTimePicker } from "@/components/datetime-picker";

export default function MyForm() {
  const [date, setDate] = useState<Date>();

  return <DateTimePicker value={date} onChange={setDate} />;
}
```

### 12-Hour Format

```tsx
<DateTimePicker hourFormat={12} />
```

### Business Hours Only

```tsx
<DateTimePicker
  minTime="09:00"
  maxTime="17:00"
  hourFormat={12}
  timeInterval={30}
/>
```

### With Timezone Selector

```tsx
<DateTimePicker showTimezone />

// Pre-set timezone
<DateTimePicker showTimezone timezone="America/New_York" />

// Track timezone changes
<DateTimePicker
  showTimezone
  onTimezoneChange={(tz) => console.log(tz)}
/>
```

### Date Restrictions

```tsx
// Next 30 days only
<DateTimePicker
  minDate={new Date()}
  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
/>

// Disable weekends
<DateTimePicker
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

### Week Starts on Monday

```tsx
<DateTimePicker weekStartsOn={1} />
```

### Booking / Appointment Scenario

```tsx
<DateTimePicker
  minDate={new Date()}
  maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)}
  minTime="09:00"
  maxTime="17:00"
  hourFormat={12}
  timeInterval={30}
  weekStartsOn={1}
  showTimezone
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
  placeholder="Book an appointment"
/>
```

### Form Integration

```tsx
// With React Hook Form
<DateTimePicker
  name="appointment"
  ref={register}
  value={watch("appointment")}
  onChange={(date) => setValue("appointment", date)}
/>

// Native form
<form onSubmit={handleSubmit}>
  <DateTimePicker name="datetime" />
  <button type="submit">Submit</button>
</form>
```

### API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| undefined` | — | Controlled selected date/time |
| `onChange` | `(date: Date \| undefined) => void` | — | Callback when date/time changes |
| `disabled` | `boolean` | `false` | Disable the picker |
| `placeholder` | `string` | `"Pick a date and time"` | Placeholder text |
| `hourFormat` | `12 \| 24` | `24` | Time display format |
| `timeInterval` | `15 \| 30 \| 60` | `15` | Minutes between time slots |
| `minDate` | `Date` | — | Earliest selectable date |
| `maxDate` | `Date` | — | Latest selectable date |
| `minTime` | `string` | — | Earliest time slot (e.g. `"09:00"`) |
| `maxTime` | `string` | — | Latest time slot (e.g. `"17:00"`) |
| `timezone` | `string` | User's local | IANA timezone (e.g. `"America/New_York"`) |
| `showTimezone` | `boolean` | `false` | Show timezone selector dropdown |
| `onTimezoneChange` | `(tz: string) => void` | — | Callback when timezone changes |
| `weekStartsOn` | `0-6` | — | Week start day (0=Sun, 1=Mon, ...) |
| `disabledDates` | `(date: Date) => boolean` | — | Custom date disable function |
| `name` | `string` | — | Form field name (renders hidden input) |
| `className` | `string` | — | Custom class for trigger button |
| `ref` | `Ref<HTMLInputElement>` | — | Ref forwarded to hidden input |

---

## DateTimePickerSeparate

Individual date, time, and timezone fields that work together. Best when you want each field to be independently accessible.

### Basic Usage

```tsx
import { DateTimePickerSeparate } from "@/components/datetime-picker-separate";

<DateTimePickerSeparate />
```

### With Timezone

```tsx
<DateTimePickerSeparate showTimezone hourFormat={12} />
```

### Business Hours

```tsx
<DateTimePickerSeparate
  minTime="09:00"
  maxTime="17:00"
  hourFormat={12}
  timeInterval={30}
  showTimezone
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

### API Reference

Same props as `DateTimePicker`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datePlaceholder` | `string` | `"Pick a date"` | Date field placeholder |
| `timePlaceholder` | `string` | `"Pick time"` | Time field placeholder |

---

## DateTimePickerRange

Start/end date+time range selection with tab-based navigation. Best for booking systems, event scheduling, and analytics filters.

### Basic Usage

```tsx
import { DateTimePickerRange, type DateTimeRange } from "@/components/datetime-picker-range";

const [range, setRange] = useState<DateTimeRange>();

<DateTimePickerRange value={range} onChange={setRange} />
```

### Meeting Scheduler

```tsx
<DateTimePickerRange
  hourFormat={12}
  minTime="09:00"
  maxTime="17:00"
  timeInterval={30}
  showTimezone
  minDate={new Date()}
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
  placeholder="Schedule a meeting"
/>
```

### How It Works

1. Click the trigger to open the picker
2. **From tab** — select start date and time
3. Selecting a start date automatically switches to the **To tab**
4. **To tab** — select end date and time (dates before start are disabled)
5. Selecting end time closes the picker

### API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `DateTimeRange` | — | `{ from?: Date, to?: Date }` |
| `onChange` | `(range: DateTimeRange) => void` | — | Callback with range |

All other props are the same as `DateTimePicker`.

---

## DateTimePickerField

React Hook Form integration using Shadcn's Field component. Handles validation, labels, descriptions, and error display.

### Basic Usage

```tsx
import {
  DateTimePickerField,
  useForm,
  zodResolver,
} from "@/components/datetime-picker-form";
import { z } from "zod";

const schema = z.object({
  appointment: z.date({ error: "Please select a date and time." }),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <DateTimePickerField
        control={form.control}
        name="appointment"
        label="Appointment"
        description="Select a date and time for your appointment."
        hourFormat={12}
        minTime="09:00"
        maxTime="17:00"
        timeInterval={30}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `control` | `Control<T>` | **required** | React Hook Form control |
| `name` | `Path<T>` | **required** | Field name (type-safe) |
| `label` | `string` | — | Field label |
| `description` | `string` | — | Help text below the picker |

All other props from `DateTimePicker` are supported.

---

## Responsive Behavior

All variants automatically adapt to screen size:

- **Desktop (≥768px)** — Opens as a Popover below the trigger
- **Mobile (<768px)** — Opens as a bottom Drawer with swipe-to-dismiss

No configuration needed.

## License

MIT
