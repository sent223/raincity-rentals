"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-8">
      <h1 className="text-3xl font-bold text-[#1F4D3A]">
        Something went wrong
      </h1>
      <p className="mt-3 text-[#4B5B5F]">
        An unexpected error happened. Please try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#F5B700] px-6 py-3 font-bold text-[#1E2A2E]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[#C9D1CF] bg-white px-6 py-3 font-bold"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}