"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export default function SubmitButton({ label, pendingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const text = pending ? pendingLabel ?? `${label}…` : label;

  return (
    <button className={className ?? "button primary"} type="submit" disabled={pending} aria-disabled={pending}>
      {text}
      {pending && <span className="spinner" aria-hidden="true" />}
    </button>
  );
}
