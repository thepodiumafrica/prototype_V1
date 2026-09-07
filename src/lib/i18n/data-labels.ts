import type { Locale } from "@/lib/i18n/dictionary";

// French display labels for the constants.ts data lists whose *values*
// are stored as-is in the database (country_origin, expertise[], ...).
// Only the label shown to the user changes with the language toggle --
// the stored value is always the canonical English string below, so a
// profile written while the toggle was on FR reads back identically
// under EN.
//
// LANGS (English/Français/Swahili/...) is deliberately NOT translated
// here: language pickers conventionally show each language's own name
// (its autonym), the same in every UI locale -- see the note flagged at
// the end of this feature's summary.

export const AFRICAN_COUNTRIES_FR: Record<string, string> = {
  Nigeria: "Nigeria",
  Ghana: "Ghana",
  Kenya: "Kenya",
  "South Africa": "Afrique du Sud",
  Ethiopia: "Éthiopie",
  Tanzania: "Tanzanie",
  Uganda: "Ouganda",
  Senegal: "Sénégal",
  "Ivory Coast": "Côte d'Ivoire",
  Cameroon: "Cameroun",
  Zimbabwe: "Zimbabwe",
  Rwanda: "Rwanda",
  Zambia: "Zambie",
  Mozambique: "Mozambique",
  Angola: "Angola",
  Mali: "Mali",
  Egypt: "Égypte",
  Morocco: "Maroc",
  Algeria: "Algérie",
  Tunisia: "Tunisie",
  Somalia: "Somalie",
  "DR Congo": "RD Congo",
  Botswana: "Botswana",
  Namibia: "Namibie",
  Mauritius: "Maurice",
  "Sierra Leone": "Sierra Leone",
  Liberia: "Liberia",
  Togo: "Togo",
  Benin: "Bénin",
  Other: "Autre",
};

export const DIASPORA_COUNTRIES_FR: Record<string, string> = {
  "United Kingdom": "Royaume-Uni",
  "United States": "États-Unis",
  France: "France",
  Canada: "Canada",
  Germany: "Allemagne",
  Netherlands: "Pays-Bas",
  Italy: "Italie",
  Spain: "Espagne",
  Belgium: "Belgique",
  Portugal: "Portugal",
  Sweden: "Suède",
  Australia: "Australie",
  Brazil: "Brésil",
  Other: "Autre",
};

export const EXPERTISE_FR: Record<string, string> = {
  "Nigerian fintech": "Fintech nigériane",
  "Mobile money": "Argent mobile",
  "African policy": "Politiques africaines",
  "Afrobeats industry": "Industrie de l'afrobeats",
  "Lagos tech ecosystem": "Écosystème tech de Lagos",
  "Nairobi startup scene": "Scène des startups de Nairobi",
  "African literature": "Littérature africaine",
  "Pan-African trade": "Commerce panafricain",
  "Diaspora career navigation": "Parcours professionnel en diaspora",
  "African history": "Histoire africaine",
  "Climate & agriculture": "Climat et agriculture",
  "Health systems": "Systèmes de santé",
  "African art market": "Marché de l'art africain",
  "Women in tech Africa": "Femmes dans la tech en Afrique",
  "Islamic finance": "Finance islamique",
};

function labelFor(
  value: string,
  map: Record<string, string>,
  locale: Locale,
): string {
  return locale === "fr" ? (map[value] ?? value) : value;
}

export const countryLabel = (value: string, locale: Locale) =>
  labelFor(value, { ...AFRICAN_COUNTRIES_FR, ...DIASPORA_COUNTRIES_FR }, locale);

export const expertiseLabel = (value: string, locale: Locale) =>
  labelFor(value, EXPERTISE_FR, locale);
