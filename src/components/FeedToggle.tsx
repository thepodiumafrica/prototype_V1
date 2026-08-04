import Link from "next/link";

const MODES = [
  { id: "both", label: "🌐 All" },
  { id: "continent", label: "🌍 Continent" },
  { id: "diaspora", label: "✈️ Diaspora" },
] as const;

// Ported from ThePodium_v5.html's .feed-toggle/.ft-btn (STATE.feedMode).
export function FeedToggle({ active }: { active: string }) {
  return (
    <div className="flex gap-1 rounded-full bg-elevated p-[3px]">
      {MODES.map((m) => (
        <Link
          key={m.id}
          href={m.id === "both" ? "/feed" : `/feed?mode=${m.id}`}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap ${
            active === m.id ? "bg-surface text-amber" : "text-text-muted"
          }`}
        >
          {m.label}
        </Link>
      ))}
    </div>
  );
}
