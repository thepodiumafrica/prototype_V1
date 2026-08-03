export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <div className="flex h-[5px] w-full" aria-hidden="true">
        <div className="flex-[3]" style={{ background: "#C99A3C" }} />
        <div className="flex-[1]" style={{ background: "#2A1E12" }} />
        <div className="flex-[2]" style={{ background: "#C05A2E" }} />
        <div className="flex-[1]" style={{ background: "#55754A" }} />
        <div className="flex-[2]" style={{ background: "#2F4A6B" }} />
        <div className="flex-[1]" style={{ background: "#2A1E12" }} />
        <div className="flex-[3]" style={{ background: "#C99A3C" }} />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="relative mb-10 px-9 py-4">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2"
            style={{ borderColor: "var(--amber)" }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2"
            style={{ borderColor: "var(--amber)" }}
          />
          <span className="text-sm font-extrabold tracking-[0.14em] text-text">
            THE PODIUM
          </span>
        </div>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Coming soon
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
          Voices of the continent and the diaspora — a place to inform,
          share, and take control of the African narrative.
        </p>
      </main>
    </div>
  );
}
