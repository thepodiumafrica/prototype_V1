// Ported from ThePodium_v5.html's .tag / tagHtml().
export function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded border border-accent-border bg-amber-faint px-1.5 py-0.5 text-[11px] font-medium text-amber-dim lowercase">
      #{label}
    </span>
  );
}
