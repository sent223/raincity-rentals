import type { DisplayStatus } from "../lib/bookings";

const STYLES: Record<DisplayStatus, string> = {
  Upcoming: "bg-[#DCE7E2] text-[#1F4D3A]",
  "In progress": "bg-[#CFE0E8] text-[#2F6F8F]",
  Completed: "bg-[#E5E9E8] text-[#4B5B5F]",
  Cancelled: "bg-[#FBE4E1] text-[#7A1F14]",
};

export default function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}