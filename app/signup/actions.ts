"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "../../auth";
import { prisma } from "../../lib/prisma";
import { safeRedirect } from "../../lib/redirect";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signupPath(error: string, next: string): string {
  const params = new URLSearchParams({ error });
  if (next !== "/") params.set("next", next);
  return `/signup?${params.toString()}`;
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const next = safeRedirect(String(formData.get("next") ?? ""));

  if (name.length < 2 || name.length > 80) redirect(signupPath("name", next));
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    redirect(signupPath("email", next));
  }
  // bcrypt only reads the first 72 characters, so longer passwords are refused.
  if (password.length < 8 || password.length > 72) {
    redirect(signupPath("password", next));
  }
  if (password !== confirm) redirect(signupPath("match", next));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect(signupPath("exists", next));

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await prisma.user.create({
      data: { name, email, passwordHash, role: "RENTER" },
    });
  } catch (error) {
    console.error("Sign-up failed", error);
    redirect(signupPath("failed", next));
  }

  try {
    await signIn("credentials", { email, password, redirectTo: next });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }
}