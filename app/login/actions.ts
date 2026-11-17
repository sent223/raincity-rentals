"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "../../auth";
import { safeRedirect } from "../../lib/redirect";

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirect(String(formData.get("next") ?? ""));

  try {
    await signIn("credentials", { email, password, redirectTo: next });
  } catch (error) {
    if (error instanceof AuthError) {
      const params = new URLSearchParams({ error: "invalid" });
      if (next !== "/") params.set("next", next);
      redirect(`/login?${params.toString()}`);
    }
    throw error;
  }
}