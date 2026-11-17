import { Suspense } from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <header className="bg-[#1F4D3A] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link href="/" className="text-xl font-bold">
          RainCity Rentals
        </Link>
        <nav className="flex items-center gap-6 text-sm">
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