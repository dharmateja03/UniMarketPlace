"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function FormSwitch({ name, value, defaultChecked, label, description, className }: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  label: string;
  description?: string;
  className?: string;
}) {
  const [checked, setChecked] = React.useState(defaultChecked ?? false);

  return (
    <label className={cn("flex items-center justify-between gap-3 cursor-pointer group", className)}>
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="sr-only"
      />
      <div
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-accent" : "bg-border"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    </label>
  );
}

export { FormSwitch };
