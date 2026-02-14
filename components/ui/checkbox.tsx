"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "h-[18px] w-[18px] shrink-0 rounded-[4px] border border-border bg-card transition-all",
            "peer-checked:bg-accent peer-checked:border-accent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1 ring-offset-background",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "flex items-center justify-center",
            className
          )}
        >
          <CheckIcon className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

// Simple version that works with native form data
function FormCheckbox({ name, value, defaultChecked, label, className }: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="h-[18px] w-[18px] shrink-0 rounded-[4px] border border-border bg-card transition-all peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1 ring-offset-background flex items-center justify-center">
          <CheckIcon className="h-3 w-3 text-white opacity-0 transition-opacity" />
        </div>
        <style>{`
          input:checked + div svg { opacity: 1 !important; }
        `}</style>
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{label}</span>
    </label>
  );
}

export { Checkbox, FormCheckbox };
