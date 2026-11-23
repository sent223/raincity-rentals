import Link from "next/link";

export default function CompanyHeader({
  companyName,
  active,
}: {
  companyName: string;
  active: "vehicles" | "bookings";
}) {
  const tab = (isActive: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-medium ${
      isActive
        ? "border-[#1F4D3A] text-[#1F4D3A]"
        : "border-transparent text-[#4B5B5F]"
    }`;

  return (
    <div className="mb-6">
      <p className="text-sm text-[#4B5B5F]">Company dashboard</p>
      <h1 className="text-3xl font-bold text-[#1F4D3A]">{companyName}</h1>
      <nav className="mt-4 flex gap-6 border-b border-[#C9D1CF]">
        <Link href="/company/vehicles" className={tab(active === "vehicles")}>
          Vehicles
        </Link>
        <Link href="/company/bookings" className={tab(active === "bookings")}>
          Bookings
        </Link>
      </nav>
    </div>
  );
}