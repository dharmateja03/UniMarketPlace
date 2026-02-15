import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Radix-style Typography Primitives ── */

type Size = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Weight = "light" | "regular" | "medium" | "bold";
type TextAlign = "left" | "center" | "right";

/* ─── Text ─── */
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "span" | "p" | "div" | "label";
  size?: Size;
  weight?: Weight;
  align?: TextAlign;
  color?: "accent" | "muted" | "accent-2" | "inherit";
  highContrast?: boolean;
  truncate?: boolean;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = "span", size, weight, align, color, highContrast, truncate, className, ...props }, ref) => {
    return (
      <Tag
        ref={ref as any}
        className={cn(
          "rt-Text",
          size && `rt-r-size-${size}`,
          weight && `rt-r-weight-${weight}`,
          align && `rt-r-align-${align}`,
          color && `rt-r-color-${color}`,
          highContrast && "rt-high-contrast",
          truncate && "rt-truncate",
          className
        )}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

/* ─── Heading ─── */
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: Size;
  weight?: Weight;
  align?: TextAlign;
  color?: "accent" | "muted" | "accent-2" | "inherit";
  highContrast?: boolean;
  truncate?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Tag = "h2", size, weight, align, color, highContrast, truncate, className, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn(
          "rt-Heading",
          size && `rt-r-size-${size}`,
          weight && `rt-r-weight-${weight}`,
          align && `rt-r-align-${align}`,
          color && `rt-r-color-${color}`,
          highContrast && "rt-high-contrast",
          truncate && "rt-truncate",
          className
        )}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

/* ─── Em ─── */
interface EmProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Em = React.forwardRef<HTMLElement, EmProps>(
  ({ className, ...props }, ref) => (
    <em ref={ref} className={cn("rt-Em", className)} {...props} />
  )
);
Em.displayName = "Em";

/* ─── Strong ─── */
interface StrongProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Strong = React.forwardRef<HTMLElement, StrongProps>(
  ({ className, ...props }, ref) => (
    <strong ref={ref} className={cn("rt-Strong", className)} {...props} />
  )
);
Strong.displayName = "Strong";

/* ─── Code ─── */
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  size?: Size;
  weight?: Weight;
  color?: "accent" | "muted" | "accent-2" | "inherit";
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ size, weight, color, className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "rt-Code",
        size && `rt-r-size-${size}`,
        weight && `rt-r-weight-${weight}`,
        color && `rt-r-color-${color}`,
        className
      )}
      {...props}
    />
  )
);
Code.displayName = "Code";

export { Text, Heading, Em, Strong, Code };
export type { TextProps, HeadingProps, EmProps, StrongProps, CodeProps };
