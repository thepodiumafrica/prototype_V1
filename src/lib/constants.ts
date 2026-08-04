// Ported from ThePodium_v5.html's su-type <select> options.
export const USER_TYPES = [
  { value: "reader", label: "Reader — browse and discuss" },
  { value: "blogger", label: "Blogger — write articles" },
  { value: "news_agency", label: "News Agency — editorial" },
] as const;

export type UserType = (typeof USER_TYPES)[number]["value"];

// Ported from ThePodium_v5.html's INTERESTS/AFRICAN_COUNTRIES/DIASPORA_COUNTRIES.
export const INTERESTS = [
  "technology", "finance", "culture", "history", "science", "education",
  "business", "art", "startups", "ai", "literature", "economics",
  "innovation", "policy", "careers", "diaspora", "entrepreneurship", "health",
] as const;

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

// Ported from ThePodium_v5.html's TYPE_LABEL.
export const TYPE_LABEL: Record<UserType, string> = {
  blogger: "Blogger",
  news_agency: "News Agency",
  reader: "Reader",
};

// Ported from ThePodium_v5.html's TRUST_LABELS.
export const TRUST_LABELS = ["", "New", "Rising", "Established", "Trusted", "Featured"] as const;

// Ported from ThePodium_v5.html's CATS.
export const CATS = [
  { id: "all", l: "All" },
  { id: "technology", l: "Technology" },
  { id: "finance", l: "Finance" },
  { id: "culture", l: "Culture" },
  { id: "history", l: "History" },
  { id: "science", l: "Science" },
  { id: "education", l: "Education" },
  { id: "business", l: "Business" },
  { id: "art", l: "Art" },
  { id: "careers", l: "Careers" },
] as const;

// Ported from ThePodium_v5.html's LANGS.
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
// category filter pills and as a header on article pages.
export const ADINKRA: Record<string, { sym: string; name: string; proverb: string }> = {
  technology: { sym: "nkyinkyim", name: "Nkyinkyim", proverb: "The path twists — adaptability and initiative" },
  finance: { sym: "dwennimmen", name: "Dwennimmen", proverb: "The ram's horns — strength with humility" },
  culture: { sym: "sankofa", name: "Sankofa", proverb: "Go back and retrieve it" },
  history: { sym: "sankofa", name: "Sankofa", proverb: "Go back and retrieve it" },
  science: { sym: "nkyinkyim", name: "Nkyinkyim", proverb: "The path twists — adaptability and initiative" },
  education: { sym: "neaonnim", name: "Nea Onnim", proverb: "He who does not know can become knowledgeable by learning" },
  business: { sym: "dwennimmen", name: "Dwennimmen", proverb: "The ram's horns — strength with humility" },
  art: { sym: "sankofa", name: "Sankofa", proverb: "Go back and retrieve it" },
  careers: { sym: "esenetekrema", name: "Ese ne Tekrema", proverb: "The teeth and the tongue — we advance through interdependence" },
};

// Ported from ThePodium_v5.html's PROVERBS -- shown in empty states.
export const PROVERBS: Record<string, [string, string]> = {
  feed: ["However far the stream flows, it never forgets its source.", "on beginnings"],
  groups: ["If you want to go fast, go alone. If you want to go far, go together.", "on community"],
  board: ["A single bracelet does not jingle.", "on conversation"],
  spaces: ["Wisdom is like a baobab tree; no one person can embrace it alone.", "on gathering"],
  messages: ["A single bracelet does not jingle.", "on connection"],
  saved: ["Knowledge is like a garden: if it is not cultivated, it cannot be harvested.", "on learning"],
  drafts: ["However long the night, the dawn will break.", "on patience"],
};

// Ported from ThePodium_v5.html's GREETINGS -- a different African-language
// greeting each day, shown at the top of the feed.
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
