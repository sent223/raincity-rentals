import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import SubmitButton from "../../components/SubmitButton";
import { auth } from "../../auth";
import { first, type SearchParams } from "../../lib/filters";
import { safeRedirect } from "../../lib/redirect";
import { loginUser } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "That email or password isn't right. Please try again.",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

async function LoginForm({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const next = safeRedirect(first(query.next));
  const session = await auth();
  if (session?.user) redirect(next);

  const errorMessage = ERRORS[first(query.error) ?? ""];
  const signupHref =
    next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[#C9D1CF] bg-white p-8">
      <h1 className="text-2xl font-bold text-[#1F4D3A]">Log in</h1>
      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
        >
          {errorMessage}
        </p>
      )}
      <form action={loginUser} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
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
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>
        <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-[#5B6B6F]">
        New here?{" "}
        <Link href={signupHref} className="text-[#2F6F8F] underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-12">
        <Suspense fallback={<p className="text-center text-[#5B6B6F]">Loading...</p>}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}