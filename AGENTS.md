<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Shadcn DateTime Picker — Agent Integration Guide

Use this guide when a user asks you to add a datetime picker to their project.

## Prerequisites

The target project must have:
- React 18+ (React 19 recommended)
- [shadcn/ui](https://ui.shadcn.com) set up
- Tailwind CSS v4
- TypeScript

## Step 1: Install Dependencies

```bash
npm install @daypicker/react date-fns
# or
bun add @daypicker/react date-fns
```

## Step 2: Add Required Shadcn Components

```bash
npx shadcn@latest add popover button scroll-area select separator drawer
```

For the form variant, also ensure these are available:
```bash
npx shadcn@latest add field label
npm install react-hook-form @hookform/resolvers zod
```

## Step 3: Copy Components

Copy from this repo's `src/components/` into the user's project:

**Always required:**
- `ui/calendar-dropdown.tsx` — custom calendar with dropdown month/year navigation

**Pick the variant(s) the user needs:**

| File | When to use |
|------|-------------|
| `datetime-picker.tsx` | Default — all-in-one calendar + time in a popover |
| `datetime-picker-separate.tsx` | User wants separate date, time, timezone fields |
| `datetime-picker-range.tsx` | User needs start/end date+time range |
| `datetime-picker-form.tsx` | User needs React Hook Form + Zod validation |

Each variant file is **self-contained** (except for the shared `calendar-dropdown.tsx`).

## Step 4: Verify Import Paths

All components use `@/components/ui/` and `@/lib/utils` import aliases. Adjust if the user's project uses different path aliases.

## Available Props (All Variants)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date` | — | Controlled value |
| `onChange` | `(date: Date \| undefined) => void` | — | Change callback |
| `disabled` | `boolean` | `false` | Disable picker |
| `placeholder` | `string` | `"Pick a date and time"` | Placeholder |
| `hourFormat` | `12 \| 24` | `24` | AM/PM or 24h |
| `timeInterval` | `15 \| 30 \| 60` | `15` | Minutes between slots |
| `minDate` / `maxDate` | `Date` | — | Date constraints |
| `minTime` / `maxTime` | `string` | — | Time constraints (e.g. `"09:00"`) |
| `timezone` | `string` | User's local | IANA timezone |
| `showTimezone` | `boolean` | `false` | Show timezone selector |
| `onTimezoneChange` | `(tz: string) => void` | — | Timezone change callback |
| `weekStartsOn` | `0-6` | — | Week start day |
| `disabledDates` | `(date: Date) => boolean` | — | Custom date disable |
| `name` | `string` | — | Form field name (hidden input) |
| `className` | `string` | — | Trigger button class |
| `ref` | `Ref<HTMLInputElement>` | — | Forwarded to hidden input |

## Common Integration Patterns

### Basic form field
```tsx
<DateTimePicker value={date} onChange={setDate} />
```

### Booking system
```tsx
<DateTimePicker
  minDate={new Date()}
  minTime="09:00"
  maxTime="17:00"
  hourFormat={12}
  timeInterval={30}
  showTimezone
  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
/>
```

### React Hook Form
```tsx
<DateTimePickerField
  control={form.control}
  name="appointment"
  label="Appointment"
  description="Pick a date and time."
  hourFormat={12}
/>
```

### Date range
```tsx
<DateTimePickerRange
  value={range}
  onChange={setRange}
  placeholder="Select range"
/>
```

## Responsive Behavior

All variants automatically use:
- **Popover** on desktop (≥768px)
- **Drawer** on mobile (<768px)

No configuration needed.

## Important Notes

- Components are SSR-safe (no hydration mismatches)
- Past time slots are automatically disabled when today is selected
- Time list auto-scrolls to selected time on popover open
- Dark mode is inherited from the Shadcn theme
- The `calendar-dropdown.tsx` uses `@daypicker/react` v10 API (not the old `react-day-picker`)
