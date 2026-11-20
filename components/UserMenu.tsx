import Link from "next/link";
import { connection } from "next/server";
import { auth, signOut } from "../auth";

export default async function UserMenu() {
  // Wait for a real visitor before reading the login session.
  await connection();
  const session = await auth();

  if (!session?.user) {
    return (
      <>
        <Link href="/login" className="hover:underline">
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-[#F5B700] px-4 py-1.5 font-bold text-[#1E2A2E]"
        >
          Sign up
        </Link>
      </>
    );
  }

  const firstName = (session.user.name ?? "there").split(" ")[0];

  return (
    <>
                {session.user.role === "COMPANY_ADMIN" && (
        <Link href="/company/vehicles" className="hover:underline">
          Dashboard
        </Link>
      )}
      <Link href="/bookings" className="hover:underline">
        My bookings
      </Link>  
      <span>Hi, {firstName}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className="hover:underline">
          Log out
        </button>
      </form>
    </>
  );
}