import Link from "next/link";
import { CATS, ADINKRA } from "@/lib/constants";
import { AdinkraIcon } from "@/components/AdinkraIcon";

// Ported from ThePodium_v5.html's catBarHtml(). Plain links (?cat=...) so
// filtering works without client JS and the category is shareable/bookmarkable.
export function CategoryBar({
  basePath,
  active,
}: {
  basePath: string;
  active: string;
}) {
  return (
    <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
      {CATS.map((c) => {
        const a = ADINKRA[c.id];
        const isActive = active === c.id;
        return (
          <Link
            key={c.id}
            href={c.id === "all" ? basePath : `${basePath}?cat=${c.id}`}
            title={a ? `${a.name} — ${a.proverb}` : undefined}
            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
              isActive
                ? "border-amber bg-amber-faint text-amber"
                : "border-border text-text-muted"
            }`}
          >
            {a && <AdinkraIcon category={c.id} size={12} />}
            {c.l}
          </Link>
        );
      })}
    </div>
  );
}
