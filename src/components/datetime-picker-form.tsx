"use client";

import { useForm, Controller, type FieldValues, type Path, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  DateTimePicker,
  type DateTimePickerProps,
} from "@/components/datetime-picker";

// ─── Generic Field Wrapper ─────────────────────────────────────

export interface DateTimePickerFieldProps<T extends FieldValues>
  extends Omit<DateTimePickerProps, "value" | "onChange" | "name" | "ref"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
}

export function DateTimePickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  ...pickerProps
}: DateTimePickerFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error || undefined}>
          <FieldContent>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              disabled={field.disabled}
              name={field.name}
              ref={field.ref}
              {...pickerProps}
            />
            {description && (
              <FieldDescription>{description}</FieldDescription>
            )}
            <FieldError>{fieldState.error?.message}</FieldError>
          </FieldContent>
        </Field>
      )}
    />
  );
}

// ─── Re-exports for convenience ────────────────────────────────

export { useForm, zodResolver };
