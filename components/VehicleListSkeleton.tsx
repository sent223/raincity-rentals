export default function VehicleListSkeleton() {
  return (
    <div
      role="status"
      className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="animate-pulse overflow-hidden rounded-xl border border-[#C9D1CF] bg-white"
        >
          <div className="h-44 bg-[#E5E9E8]" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 rounded bg-[#E5E9E8]" />
            <div className="h-4 w-1/3 rounded bg-[#E5E9E8]" />
            <div className="h-8 w-1/2 rounded bg-[#E5E9E8]" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading vehicles...</span>
    </div>
  );
}