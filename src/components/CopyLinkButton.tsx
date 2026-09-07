"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

// Ported from ThePodium_v5.html's "🔗 Share" button. The prototype's
// version doesn't actually copy anything -- it just shows a toast --
// which is the same gap CopyReferralButton already closed for the
// referral code button, so this follows that precedent: a real
// clipboard write, with the button label itself as feedback.
export function CopyLinkButton() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-text"
    >
      {copied ? t("linkCopied") : t("shareLink")}
    </button>
  );
}
