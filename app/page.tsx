import Form from "next/form";
import Link from "next/link";
import Navbar from "../components/Navbar";

const STEPS = [
  {
    title: "Search",
    text: "Choose your dates and see only the vehicles that are free, with the full price including taxes and fees.",
  },
  {
    title: "Compare",
    text: "Browse vehicles from several Seattle rental companies and pick the pickup location nearest to you.",
  },
  {
    title: "Book",
    text: "Confirm in a minute. Free cancellation until 24 hours before pick-up.",
  },
];

const FEATURES = [
  {
    title: "Pickup near you",
    text: "Find the closest location, from Sea-Tac Airport to Capitol Hill, on an interactive map.",
  },
  {
    title: "Built for the Northwest",
    text: "Filter for EVs, all-wheel drive and roof racks for trips to the mountains.",
  },
  {
    title: "Clear prices",
    text: "See the daily rate, taxes and fees before you book. No surprises.",
  },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />

      <section className="bg-gradient-to-br from-[#1F4D3A] to-[#2F6F8F] px-4 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Drive the Pacific Northwest, rain or shine.
          </h1>
          <p className="mt-4 text-lg text-white">
            Compare vehicles from Seattle rental companies in one place.
          </p>

          <Form
            action="/vehicles"
            className="mt-8 grid gap-4 rounded-xl bg-white p-5 text-left text-[#1E2A2E] sm:grid-cols-5"
          >
            <label className="block text-xs font-medium text-[#4B5B5F] sm:col-span-2">
              Pick-up (Seattle time)
              <input
                type="datetime-local"
                name="start"
                required
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#4B5B5F] sm:col-span-2">
              Return (Seattle time)
              <input
                type="datetime-local"
                name="end"
                required
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              className="self-end rounded-lg bg-[#F5B700] px-5 py-2.5 font-bold text-[#1E2A2E]"
            >
              Search
            </button>
          </Form>

          <p className="mt-5 text-sm text-white">
            Or{" "}
            <Link href="/vehicles" className="font-bold underline">
              browse all vehicles
            </Link>{" "}
            or{" "}
            <Link href="/locations" className="font-bold underline">
              find a pickup location
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
        <h2 className="text-center text-3xl font-bold text-[#1F4D3A]">
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-[#C9D1CF] bg-white p-6"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F4D3A] font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-[#4B5B5F]">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-[#1F4D3A]">
            Why RainCity Rentals
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-[#DCE7E2] p-6"
              >
                <h3 className="text-xl font-bold text-[#1F4D3A]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[#1E2A2E]">{feature.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/vehicles"
              className="inline-block rounded-lg bg-[#2F6F8F] px-8 py-3 font-bold text-white"
            >
              Browse all vehicles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}