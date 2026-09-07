import Link from "next/link";
import { getT } from "@/lib/i18n/locale";
import type { DictKey } from "@/lib/i18n/dictionary";

const MODES: { id: string; labelKey: DictKey }[] = [
  { id: "both", labelKey: "all" },
  { id: "continent", labelKey: "continent" },
  { id: "diaspora", labelKey: "diaspora" },
];

// Ported from ThePodium_v5.html's .feed-toggle/.ft-btn (STATE.feedMode).
export async function FeedToggle({ active }: { active: string }) {
  const { t } = await getT();
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
          {t(m.labelKey)}
        </Link>
      ))}
    </div>
  );
}
