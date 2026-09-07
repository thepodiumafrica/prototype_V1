import { PROVERBS } from "@/lib/constants";
import { getT } from "@/lib/i18n/locale";

// Ported from ThePodium_v5.html's proverbHtml().
export async function Proverb({ forKey }: { forKey: string }) {
  const p = PROVERBS[forKey];
  if (!p) return null;
  const { t } = await getT();
  return (
    <>
      <div className="mx-auto mb-1.5 max-w-[380px] font-serif text-sm italic leading-relaxed text-text-muted">
        &quot;{t(p.textKey)}&quot;
      </div>
      <div className="mb-3.5 text-[11px] tracking-wide text-text-dim">
        {t("africanProverbLabel", { topic: t(p.tagKey) })}
      </div>
    </>
  );
}
