import type { DictKey } from "@/lib/i18n/dictionary";

// Ported from ThePodium_v5.html's su-type <select> options. Labels live in
// the i18n dictionary (userTypeReader/userTypeBlogger/userTypeNewsAgency)
// since they need to switch with the language toggle -- this is just the
// list of values.
export const USER_TYPES = ["reader", "blogger", "news_agency"] as const;

export type UserType = (typeof USER_TYPES)[number];

// Ported from ThePodium_v5.html's INTERESTS/AFRICAN_COUNTRIES/DIASPORA_COUNTRIES.
// These are the values actually stored in the database; their translated
// display labels live in the i18n dictionary (interestXxx keys) and
// lib/i18n/data-labels.ts (countries, expertise) -- the toggle only ever
// changes what's shown, never what's saved.
export const INTERESTS = [
  "technology", "finance", "culture", "history", "science", "education",
  "business", "art", "startups", "ai", "literature", "economics",
  "innovation", "policy", "careers", "diaspora", "entrepreneurship", "health",
] as const;

export const INTEREST_KEY: Record<(typeof INTERESTS)[number], DictKey> = {
  technology: "interestTechnology",
  finance: "interestFinance",
  culture: "interestCulture",
  history: "interestHistory",
  science: "interestScience",
  education: "interestEducation",
  business: "interestBusiness",
  art: "interestArt",
  startups: "interestStartups",
  ai: "interestAi",
  literature: "interestLiterature",
  economics: "interestEconomics",
  innovation: "interestInnovation",
  policy: "interestPolicy",
  careers: "interestCareers",
  diaspora: "interestDiaspora",
  entrepreneurship: "interestEntrepreneurship",
  health: "interestHealth",
};

export const AFRICAN_COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia", "Tanzania",
  "Uganda", "Senegal", "Ivory Coast", "Cameroon", "Zimbabwe", "Rwanda",
  "Zambia", "Mozambique", "Angola", "Mali", "Egypt", "Morocco", "Algeria",
  "Tunisia", "Somalia", "DR Congo", "Botswana", "Namibia", "Mauritius",
  "Sierra Leone", "Liberia", "Togo", "Benin", "Other",
] as const;

export const DIASPORA_COUNTRIES = [
  "United Kingdom", "United States", "France", "Canada", "Germany",
  "Netherlands", "Italy", "Spain", "Belgium", "Portugal", "Sweden",
  "Australia", "Brazil", "Other",
] as const;

// Ported from ThePodium_v5.html's EXPERTISE.
export const EXPERTISE = [
  "Nigerian fintech", "Mobile money", "African policy", "Afrobeats industry",
  "Lagos tech ecosystem", "Nairobi startup scene", "African literature",
  "Pan-African trade", "Diaspora career navigation", "African history",
  "Climate & agriculture", "Health systems", "African art market",
  "Women in tech Africa", "Islamic finance",
] as const;

// Ported from ThePodium_v5.html's CATS. `id` is the value stored/filtered
// on; `labelKey` is translated at render time.
export const CATS: { id: string; labelKey: DictKey }[] = [
  { id: "all", labelKey: "catAll" },
  { id: "technology", labelKey: "catTechnology" },
  { id: "finance", labelKey: "catFinance" },
  { id: "culture", labelKey: "catCulture" },
  { id: "history", labelKey: "catHistory" },
  { id: "science", labelKey: "catScience" },
  { id: "education", labelKey: "catEducation" },
  { id: "business", labelKey: "catBusiness" },
  { id: "art", labelKey: "catArt" },
  { id: "careers", labelKey: "catCareers" },
];

// Ported from ThePodium_v5.html's LANGS. Deliberately NOT translated by
// the language toggle: a language picker conventionally shows each
// language's own name (its autonym) regardless of the current UI
// language -- see the flagged note in this feature's summary.
export const LANGS = [
  { id: "en", l: "English" },
  { id: "fr", l: "Français" },
  { id: "sw", l: "Swahili" },
  { id: "yo", l: "Yoruba" },
  { id: "ig", l: "Igbo" },
  { id: "ha", l: "Hausa" },
  { id: "ar", l: "العربية" },
  { id: "pcm", l: "Pidgin" },
] as const;

// Ported from ThePodium_v5.html's ADINKRA. Each category is paired with an
// Adinkra symbol and its traditional proverb, shown as a tooltip on the
// category filter pills and as a header on article pages. `sym`/`name`
// are Twi terms, kept as-is in both languages; `proverbKey` translates.
export const ADINKRA: Record<string, { sym: string; name: string; proverbKey: DictKey }> = {
  technology: { sym: "nkyinkyim", name: "Nkyinkyim", proverbKey: "adinkraPathTwists" },
  finance: { sym: "dwennimmen", name: "Dwennimmen", proverbKey: "adinkraRamsHorns" },
  culture: { sym: "sankofa", name: "Sankofa", proverbKey: "adinkraSankofa" },
  history: { sym: "sankofa", name: "Sankofa", proverbKey: "adinkraSankofa" },
  science: { sym: "nkyinkyim", name: "Nkyinkyim", proverbKey: "adinkraPathTwists" },
  education: { sym: "neaonnim", name: "Nea Onnim", proverbKey: "adinkraNeaOnnim" },
  business: { sym: "dwennimmen", name: "Dwennimmen", proverbKey: "adinkraRamsHorns" },
  art: { sym: "sankofa", name: "Sankofa", proverbKey: "adinkraSankofa" },
  careers: { sym: "esenetekrema", name: "Ese ne Tekrema", proverbKey: "adinkraEseNeTekrema" },
};

// Ported from ThePodium_v5.html's FLAG_REASONS. `value` is what's stored
// in flags.reason (and compared against elsewhere, e.g. the mod queue's
// hate-speech SLA banner) -- only `labelKey` changes with the toggle.
export const FLAG_REASONS: { value: string; labelKey: DictKey }[] = [
  { value: "Hate speech", labelKey: "flagReasonHateSpeech" },
  { value: "Misinformation", labelKey: "flagReasonMisinformation" },
  { value: "Spam", labelKey: "flagReasonSpam" },
  { value: "Harassment", labelKey: "flagReasonHarassment" },
  { value: "Inappropriate content", labelKey: "flagReasonInappropriate" },
  { value: "Copyright violation", labelKey: "flagReasonCopyright" },
  { value: "Other", labelKey: "flagReasonOther" },
];

// Ported from ThePodium_v5.html's PROVERBS -- shown in empty states.
export const PROVERBS: Record<string, { textKey: DictKey; tagKey: DictKey }> = {
  feed: { textKey: "proverbFeed", tagKey: "proverbFeedTag" },
  groups: { textKey: "proverbGroups", tagKey: "proverbGroupsTag" },
  board: { textKey: "proverbBoard", tagKey: "proverbBoardTag" },
  spaces: { textKey: "proverbSpaces", tagKey: "proverbSpacesTag" },
  messages: { textKey: "proverbMessages", tagKey: "proverbMessagesTag" },
  saved: { textKey: "proverbSaved", tagKey: "proverbSavedTag" },
  drafts: { textKey: "proverbDrafts", tagKey: "proverbDraftsTag" },
};

// Ported from ThePodium_v5.html's GREETINGS -- a different African-language
// greeting each day, shown at the top of the feed. Deliberately NOT
// translated: these are real greetings shown in their own language.
export const GREETINGS: [string, string][] = [
  ["Ẹ káàbọ̀", "Yoruba"],
  ["Akwaaba", "Twi"],
  ["Karibu", "Swahili"],
  ["Sannu da zuwa", "Hausa"],
  ["Nnọọ", "Igbo"],
  ["Wamukelekile", "Zulu"],
  ["Dalal ak jàmm", "Wolof"],
  ["Mauya", "Shona"],
];
