import Link from "next/link";
import Navbar from "../../../components/Navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-xl px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1F4D3A]">Vehicle not found</h1>
        <p className="mt-3 text-[#5B6B6F]">
          This vehicle doesn&apos;t exist or is no longer available.
        </p>
        <Link
          href="/vehicles"
          className="mt-6 inline-block rounded-lg bg-[#2F6F8F] px-6 py-3 font-bold text-white"
        >
          Browse all vehicles
        </Link>
      </div>
    </main>
  );
}