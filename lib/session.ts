import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "../auth";

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