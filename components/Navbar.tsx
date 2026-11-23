import { Suspense } from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <header className="bg-[#1F4D3A] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
        <Link href="/" className="text-xl font-bold">
          RainCity Rentals
        </Link>
        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        >
          <Link href="/vehicles" className="hover:underline">
            Browse
          </Link>
          <Link href="/locations" className="hover:underline">
            Locations
          </Link>
          <Suspense fallback={<span className="inline-block w-28" />}>
            <UserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}