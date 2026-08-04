// Ported exactly from ThePodium_v5.html's ago()/fmtDate()/wc()/readTime().

import { GREETINGS } from "@/lib/constants";

// Ported exactly from ThePodium_v5.html's todayGreeting(): the same
// greeting for everyone on a given UTC day, rotating through the list.
export function todayGreeting(): [string, string] {
  return GREETINGS[Math.floor(Date.now() / 86400000) % GREETINGS.length];
}

export function ago(d: string): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function wc(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

export function readTime(t: string): string {
  return `${Math.max(1, Math.ceil(wc(t) / 200))} min`;
}
