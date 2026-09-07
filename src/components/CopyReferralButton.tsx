"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

export function CopyReferralButton({ code }: { code: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs font-semibold text-text-muted"
    >
      {copied ? t("linkCopied") : t("copy")}
    </button>
  );
}
