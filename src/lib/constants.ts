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
