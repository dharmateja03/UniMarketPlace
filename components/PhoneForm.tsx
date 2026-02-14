"use client";

import { useFormState } from "react-dom";
import SubmitButton from "@/components/SubmitButton";
import { updatePhone } from "@/app/actions";

type FormState = { error: string | null };
const initialState: FormState = { error: null };

export default function PhoneForm({ currentPhone }: { currentPhone: string | null }) {
  const [state, formAction] = useFormState(updatePhone, initialState);

  return (
    <form action={formAction}>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <input
        name="phone"
        type="tel"
        placeholder="Phone number"
        defaultValue={currentPhone ?? ""}
        autoComplete="tel"
      />
      <SubmitButton label="Save Phone" pendingLabel="Saving..." />
    </form>
  );
}
