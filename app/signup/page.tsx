import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import SubmitButton from "../../components/SubmitButton";
import { auth } from "../../auth";
import { first, type SearchParams } from "../../lib/filters";
import { safeRedirect } from "../../lib/redirect";
import { registerUser } from "./actions";

const ERRORS: Record<string, string> = {
  name: "Please enter your name (2 to 80 characters).",
  email: "Please enter a valid email address.",
  password: "Your password must be between 8 and 72 characters.",
  match: "The two passwords don't match.",
  exists: "An account with that email already exists. Try logging in.",
  failed: "Something went wrong. Please try again.",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

async function SignupForm({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const next = safeRedirect(first(query.next));
  const session = await auth();
  if (session?.user) redirect(next);

  const errorMessage = ERRORS[first(query.error) ?? ""];
  const loginHref =
    next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[#C9D1CF] bg-white p-8">
      <h1 className="text-2xl font-bold text-[#1F4D3A]">Create your account</h1>
      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
        >
          {errorMessage}
        </p>
      )}
      <form action={registerUser} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block text-xs font-medium text-[#5B6B6F]">
          Full name
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-medium text-[#5B6B6F]">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-medium text-[#5B6B6F]">
          Password (at least 8 characters)
          <input
            type="password"
            name="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-medium text-[#5B6B6F]">
          Confirm password
          <input
            type="password"
            name="confirm"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <SubmitButton pendingText="Creating account...">
          Create account
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-[#5B6B6F]">
        Already have an account?{" "}
        <Link href={loginHref} className="text-[#2F6F8F] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-12">
        <Suspense fallback={<p className="text-center text-[#5B6B6F]">Loading...</p>}>
          <SignupForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}