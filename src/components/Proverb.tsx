import { PROVERBS } from "@/lib/constants";

// Ported from ThePodium_v5.html's proverbHtml().
export function Proverb({ forKey }: { forKey: string }) {
  const p = PROVERBS[forKey];
  if (!p) return null;
  return (
    <>
      <div className="mx-auto mb-1.5 max-w-[380px] font-serif text-sm italic leading-relaxed text-text-muted">
        &quot;{p[0]}&quot;
      </div>
      <div className="mb-3.5 text-[11px] tracking-wide text-text-dim">
        African proverb, {p[1]}
      </div>
    </>
  );
}
