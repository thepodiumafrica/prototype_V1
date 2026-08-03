const SEGMENTS: Array<{ flex: number; color: string }> = [
  { flex: 3, color: "#C99A3C" },
  { flex: 1, color: "#2A1E12" },
  { flex: 2, color: "#C05A2E" },
  { flex: 1, color: "#55754A" },
  { flex: 2, color: "#2F4A6B" },
  { flex: 1, color: "#2A1E12" },
  { flex: 3, color: "#C99A3C" },
];

export function KenteStrip() {
  return (
    <div className="flex h-[5px] w-full" aria-hidden="true">
      {SEGMENTS.map((s, i) => (
        <div key={i} style={{ flex: s.flex, background: s.color }} />
      ))}
    </div>
  );
}
