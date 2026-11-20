import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "../auth";
import { prisma } from "./prisma";

// For server components: sends logged-out visitors to the login page
// and returns the signed-in user otherwise.
export async function requireUser(next: string) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return session.user;
}

// Reads the user from the database (not the cookie), so a changed role or
// company takes effect immediately. Returns null unless the user is a
// company admin with a company.
export async function loadCompanyAdmin(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });
  if (!user || user.role !== "COMPANY_ADMIN" || !user.company) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company: user.company,
  };
}

// For company dashboard pages: logged-out visitors go to login,
// everyone who isn't a company admin sees "not found".
export async function requireCompanyAdmin(next: string) {
  const user = await requireUser(next);
  const admin = await loadCompanyAdmin(Number(user.id));
  if (!admin) notFound();
  return admin;
}