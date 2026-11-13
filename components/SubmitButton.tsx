"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
}: {
  children: ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#F5B700] px-4 py-3 font-bold text-[#1E2A2E] disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}