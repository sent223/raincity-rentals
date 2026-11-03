import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-[#1F4D3A] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link href="/" className="text-xl font-bold">
          RainCity Rentals
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/vehicles" className="hover:underline">
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}