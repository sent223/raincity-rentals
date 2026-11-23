import Link from "next/link";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-8">
        <p className="text-5xl font-bold text-[#1F4D3A]">404</p>
        <h1 className="mt-3 text-3xl font-bold text-[#1F4D3A]">
          Page not found
        </h1>
        <p className="mt-3 text-[#4B5B5F]">
          The page you&apos;re looking for doesn&apos;t exist, or you
          don&apos;t have access to it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-[#2F6F8F] px-6 py-3 font-bold text-white"
          >
            Back to home
          </Link>
          <Link
            href="/vehicles"
            className="rounded-lg border border-[#C9D1CF] bg-white px-6 py-3 font-bold"
          >
            Browse vehicles
          </Link>
        </div>
      </div>
    </main>
  );
}