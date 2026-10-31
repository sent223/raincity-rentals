export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <header className="bg-[#1F4D3A] px-8 py-5 text-white">
        <span className="text-xl font-bold">RainCity Rentals</span>
      </header>
      <section className="bg-[#DCE7E2] px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-[#1F4D3A]">
          Drive the Pacific Northwest, rain or shine.
        </h1>
        <p className="mt-4 text-[#5B6B6F]">
          Search is coming soon. Project in development.
        </p>
        <button className="mt-8 rounded-lg bg-[#F5B700] px-8 py-3 font-bold">
          Search
        </button>
      </section>
    </main>
  );
}