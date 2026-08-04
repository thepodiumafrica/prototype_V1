import { ADINKRA } from "@/lib/constants";

// Ported exactly from ThePodium_v5.html's ADK_SVG paths.
const PATHS: Record<string, React.ReactNode> = {
  sankofa: (
    <>
      <path
        d="M10 16 C5.5 16 4.5 11 7 8.7 C8.7 7.2 11.8 7.3 12.7 9.5 C13.5 11.3 12 12.9 10.4 12.5 C9.5 12.3 9.2 11.3 9.8 10.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12.4" cy="6.6" r="1.1" fill="currentColor" />
    </>
  ),
  nkyinkyim: (
    <path
      d="M4 15 L4 11 L10 11 L10 5 L16 5 L16 9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  dwennimmen: (
    <path
      d="M7 15 C3.5 12 5 6.5 9 6.5 M13 15 C16.5 12 15 6.5 11 6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  ),
  neaonnim: (
    <path
      d="M6 4 L6 16 M14 4 L14 16 M6 7 L14 7 M6 11 L14 11 M6 15 L14 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
  esenetekrema: (
    <>
      <ellipse cx="10" cy="7" rx="5.5" ry="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="10" cy="13" rx="5.5" ry="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
};

export function AdinkraIcon({
  category,
  size = 13,
}: {
  category: string;
  size?: number;
}) {
  const a = ADINKRA[category];
  if (!a) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      {PATHS[a.sym]}
    </svg>
  );
}
