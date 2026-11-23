import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#C9D1CF] bg-white px-4 py-8 text-sm text-[#4B5B5F] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="text-[#1E2A2E]">RainCity Rentals</strong> is a
          portfolio project. The companies, vehicles and prices are fictional.
        </p>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/vehicles" className="hover:underline">
            Browse
          </Link>
          <Link href="/locations" className="hover:underline">
            Locations
          </Link>
          <a
            href="https://github.com/sent223/raincity-rentals"
            className="hover:underline"
          >
            Source on GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}