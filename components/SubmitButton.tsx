"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
  tone = "primary",
}: {
  children: ReactNode;
  pendingText: string;
  tone?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const colors =
    tone === "danger"
      ? "bg-[#B3261E] text-white"
      : "bg-[#F5B700] text-[#1E2A2E]";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-lg px-4 py-3 font-bold disabled:opacity-60 ${colors}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}