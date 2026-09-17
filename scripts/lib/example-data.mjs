// Example ("shape and ambition of the platform") launch content, ported
// verbatim from reference/ThePodium_v5.html's STATE object -- the 9
// interconnected personas, the 8 published articles, 4 forum posts, and 5
// comments already written and reviewed there, plus the likes/follows that
// connect them. Nothing here is invented; see scripts/seed-examples.mjs for
// how it gets written to Supabase, and scripts/clear-examples.mjs for how
// every trace of it comes back out.
//
// Deliberately NOT ported: the prototype's one draft article (d001, never
// meant to be publicly visible), poll options on f004 and seriesId on a002/
// a007 (neither exists in the real posts schema -- see the comment atop
// supabase/migrations/20260803090002_create_posts.sql), isMod:true on
// tech_temi (would hand a demo login real moderation power over real
// content -- every example persona is seeded as an ordinary, non-mod
// account regardless of what the prototype's in-memory STATE says), and
// bookmarks/read_history (private per-user data, not "shape and ambition"
// content, and outside what was asked for).

// T(n): n days before whenever the seed script runs -- matches the
// prototype's own T(d) helper exactly, so re-running the seed script later
// keeps the demo's relative timestamps ("3 days ago") looking fresh
// instead of drifting into "8 months ago" as real launch date recedes.
export const T = (days) => new Date(Date.now() - days * 86400000).toISOString();

// Printed at the end of seed-examples.mjs. One shared password for every
// example persona, deliberately unlike any real password pattern, so it
// reads unmistakably as a demo credential rather than something a real
// account might use.
export const EXAMPLE_PASSWORD = "ThePodiumExample#2026";
export const EXAMPLE_EMAIL_DOMAIN = "example.com"; // IANA-reserved, never delivers mail
export const EXAMPLE_DATE_OF_BIRTH = "1994-06-15"; // arbitrary, safely over the 13+ age gate

export const PERSONAS = [
  {
    username: "tech_temi",
    user_type: "blogger",
    verified: true,
    founding_creator: true,
    bio: "Tech founder & builder · Lagos, Nigeria",
    african_identity: "continent",
    country_origin: "Nigeria",
    country_residence: "Nigeria",
    profession: "Software Engineer / Founder",
    industry: "Technology",
    years_experience: 7,
    linkedin_url: "linkedin.com/in/techtemi",
    expertise: ["Lagos tech ecosystem", "Mobile money", "Nigerian fintech"],
    interests: ["technology", "ai", "startups", "innovation"],
    joinedDaysAgo: 120,
    following: ["finance_amara", "TechAfrica_News", "culture_kwame"],
  },
  {
    username: "finance_amara",
    user_type: "blogger",
    verified: false,
    founding_creator: true,
    bio: "Personal finance & investment writer · Accra, Ghana",
    african_identity: "continent",
    country_origin: "Ghana",
    country_residence: "Ghana",
    profession: "Financial Analyst",
    industry: "Finance",
    years_experience: 5,
    linkedin_url: "",
    expertise: ["Pan-African trade", "African policy", "Nigerian fintech"],
    interests: ["finance", "investment", "economics", "startups"],
    joinedDaysAgo: 90,
    following: ["tech_temi", "EconoAfrica_Daily", "TechAfrica_News"],
  },
  {
    username: "culture_kwame",
    user_type: "blogger",
    verified: false,
    founding_creator: true,
    bio: "African culture, literature & contemporary art · Kumasi, Ghana",
    african_identity: "continent",
    country_origin: "Ghana",
    country_residence: "Ghana",
    profession: "Writer & Cultural Critic",
    industry: "Arts & Culture",
    years_experience: 8,
    linkedin_url: "",
    expertise: ["African literature", "African art market", "African history"],
    interests: ["culture", "literature", "art", "history"],
    joinedDaysAgo: 80,
    following: ["TechAfrica_News", "finance_amara"],
  },
  {
    username: "history_adaeze",
    user_type: "blogger",
    verified: false,
    founding_creator: false,
    bio: "Historian & educator · Enugu, Nigeria",
    african_identity: "continent",
    country_origin: "Nigeria",
    country_residence: "Nigeria",
    profession: "Historian / Lecturer",
    industry: "Education",
    years_experience: 10,
    linkedin_url: "",
    expertise: ["African history", "Pan-African trade"],
    interests: ["history", "education", "culture"],
    joinedDaysAgo: 60,
    following: ["culture_kwame", "TechAfrica_News"],
  },
  {
    username: "diaspora_kofi",
    user_type: "blogger",
    verified: false,
    founding_creator: false,
    bio: "Ghanaian in London · writes on career, identity & belonging",
    african_identity: "diaspora",
    country_origin: "Ghana",
    country_residence: "United Kingdom",
    profession: "Strategy Consultant",
    industry: "Consulting",
    years_experience: 4,
    linkedin_url: "linkedin.com/in/diasporakofi",
    expertise: ["Diaspora career navigation", "Pan-African trade"],
    interests: ["careers", "diaspora", "finance", "education"],
    joinedDaysAgo: 45,
    following: ["finance_amara", "EconoAfrica_Daily"],
  },
  {
    username: "TechAfrica_News",
    user_type: "news_agency",
    verified: true,
    founding_creator: true,
    bio: "Africa's leading independent technology journalism platform",
    african_identity: "continent",
    country_origin: "Kenya",
    country_residence: "Kenya",
    profession: "News Agency",
    industry: "Media",
    years_experience: 6,
    linkedin_url: "",
    expertise: ["Nairobi startup scene", "African policy"],
    interests: ["technology", "innovation", "policy", "startups"],
    joinedDaysAgo: 365,
    following: [],
  },
  {
    username: "EconoAfrica_Daily",
    user_type: "news_agency",
    verified: true,
    founding_creator: true,
    bio: "Daily economic & business intelligence across the African continent",
    african_identity: "continent",
    country_origin: "South Africa",
    country_residence: "South Africa",
    profession: "News Agency",
    industry: "Finance & Media",
    years_experience: 8,
    linkedin_url: "",
    expertise: ["Pan-African trade", "Islamic finance"],
    interests: ["economics", "business", "markets", "policy"],
    joinedDaysAgo: 300,
    following: [],
  },
  {
    username: "bola_reads",
    user_type: "reader",
    verified: false,
    founding_creator: false,
    bio: "Curious reader · Abuja, Nigeria",
    african_identity: "continent",
    country_origin: "Nigeria",
    country_residence: "Nigeria",
    profession: "Product Manager",
    industry: "Technology",
    years_experience: 3,
    linkedin_url: "",
    expertise: [],
    interests: ["technology", "finance", "culture", "literature"],
    joinedDaysAgo: 55,
    following: ["tech_temi", "finance_amara", "TechAfrica_News", "culture_kwame"],
  },
  {
    username: "ade_curious",
    user_type: "reader",
    verified: false,
    founding_creator: false,
    bio: "Science, AI & culture enthusiast · Ibadan",
    african_identity: "continent",
    country_origin: "Nigeria",
    country_residence: "Nigeria",
    profession: "Research Assistant",
    industry: "Science & Research",
    years_experience: 2,
    linkedin_url: "",
    expertise: [],
    interests: ["science", "ai", "culture", "history"],
    joinedDaysAgo: 40,
    following: ["tech_temi", "culture_kwame", "TechAfrica_News"],
  },
];

// Articles + forum posts, keyed by the prototype's own oid (example_key).
export const POSTS = [
  {
    example_key: "a001",
    creator: "TechAfrica_News",
    otype: "Article",
    category: "technology",
    tags: ["technology", "ai", "innovation"],
    title: "How Generative AI is Reshaping African Software Development",
    content: `The continent's developer community is experiencing a quiet revolution. From Nairobi's Silicon Savannah to Lagos' island tech hubs, generative AI tools are rapidly changing how software gets built.\n\nIn a survey of over 2,000 African developers last quarter, nearly 60% reported using AI coding assistants daily — a figure that has tripled in 18 months.\n\n## What developers are actually saying\n\n"It's not replacing us," says Okonkwo Chidi, lead engineer at a Lagos fintech. "It's removing the boring parts so we can focus on the creative problem-solving that actually requires local context."\n\n## The ownership question\n\nAs AI tools lower the skill floor for certain development tasks, attention is shifting to whether African developers can own the tools they use — not just adopt the ones built elsewhere.`,
    views: 3240,
    daysAgo: 5,
    likedBy: ["bola_reads", "ade_curious"],
  },
  {
    example_key: "a002",
    creator: "finance_amara",
    otype: "Article",
    category: "finance",
    tags: ["finance", "investment", "diaspora"],
    title: "Investing in Nigerian Startups: A Guide for the Diaspora",
    content: `As a young Nigerian who has navigated both the London and Lagos investment scenes, I am often asked: "How do I actually invest in startups back home?"\n\n## Know your investment thesis\n\nAre you betting on fintech, agritech, healthtech, or B2B SaaS? Each has different risk profiles and exit timelines.\n\n## Understand the instruments\n\nGet comfortable with SAFE notes and convertible instruments. They dominate pre-seed deals here, unlike the priced equity rounds common in Europe.\n\n## Network intentionally\n\nThe best deals in Lagos rarely appear on formal platforms. Join WhatsApp groups, attend Demo Africa, and find a trusted lead investor to co-invest with.`,
    views: 2100,
    daysAgo: 12,
    likedBy: ["tech_temi", "bola_reads"],
  },
  {
    example_key: "a003",
    creator: "culture_kwame",
    otype: "Article",
    category: "culture",
    tags: ["culture", "literature", "africa"],
    title: "The New African Canon: Why Our Stories Must Be Told By Us",
    content: `For too long, the stories told about Africa were told by those who viewed the continent through the narrow aperture of distance.\n\nThat is changing. Slowly, unevenly, but unmistakably.\n\n## The renaissance underway\n\nGhanaian author Ama Owusu's debut novel sold over 200,000 copies in its first year, mostly through WhatsApp book clubs — not traditional publishing channels.\n\n## The infrastructure lesson\n\nThe infrastructure for African storytelling no longer needs to route through gatekeepers in London and New York. It can — and should — be built here.`,
    views: 1560,
    daysAgo: 18,
    likedBy: ["ade_curious"],
  },
  {
    example_key: "a004",
    creator: "TechAfrica_News",
    otype: "Article",
    category: "technology",
    tags: ["technology", "policy", "ai"],
    title: "Kenya's Draft AI Governance Framework Faces Criticism",
    content: `Kenya's Communications Authority released a draft framework for artificial intelligence governance last week, drawing immediate criticism from the technology community.\n\n"The framework was written without meaningful consultation," said Dr. Angela Ndungu of Strathmore University.\n\n## The contested provision\n\nA requirement that any AI system making 'consequential decisions' submit to a conformity assessment before deployment is the most disputed point.\n\n## The other side\n\nProponents argue some regulatory baseline is overdue. "We have seen real harms from unregulated AI systems in hiring and credit scoring."`,
    views: 2890,
    daysAgo: 2,
    likedBy: ["tech_temi", "finance_amara", "bola_reads"],
  },
  {
    example_key: "a005",
    creator: "EconoAfrica_Daily",
    otype: "Article",
    category: "finance",
    tags: ["economics", "markets", "africa"],
    title: "Pan-African Stock Exchange: Dream or Near Reality?",
    content: `The idea of a unified African stock exchange has circulated in development finance circles for decades. Recent moves by the African Union suggest the concept may finally be gathering momentum.\n\n"The collective market capitalisation of African exchanges exceeds $1.5 trillion," noted the AfDB's chief economist. "Fragmentation is costing us liquidity and depth."`,
    views: 1200,
    daysAgo: 7,
    likedBy: ["finance_amara"],
  },
  {
    example_key: "a006",
    creator: "tech_temi",
    otype: "Article",
    category: "business",
    tags: ["startups", "entrepreneurship", "lagos"],
    title: "What I Learned Failing My First Startup in Lagos",
    content: `Two years ago, I shut down Lokari — a hyperlocal delivery app we spent 18 months building. We raised ₦12m and still failed.\n\n## Lesson 1: The infrastructure problem\n\nWe built a beautiful product assuming our logistics partners would be reliable. They were not. The last-mile problem in Lagos is not a product problem — it is a roads, traffic, and trust problem.\n\n## Lesson 2: Unit economics from day one\n\nIf your unit economics don't work at 100 users, they rarely fix themselves at 10,000.\n\n## Lesson 3: Knowing when to quit\n\nI held on four months longer than I should have. I am building again. Differently this time.`,
    views: 4100,
    daysAgo: 9,
    likedBy: ["finance_amara", "bola_reads", "ade_curious", "culture_kwame"],
  },
  {
    example_key: "a007",
    creator: "history_adaeze",
    otype: "Article",
    category: "history",
    tags: ["history", "africa", "education"],
    title: "The Great Libraries of West Africa: What We Have Forgotten",
    content: `Before European contact, West Africa was home to some of the world's great centres of learning. The library of Timbuktu held an estimated 700,000 manuscripts.\n\nScholars from across the Islamic world travelled to Sankore University to study mathematics, astronomy, medicine, and law.\n\n## Why this matters today\n\nThe lie that Africa had no intellectual tradition before colonialism has consequences. It shapes policy, funding, and what young Africans believe is possible.\n\n**Knowing our history is not nostalgia — it is infrastructure.**`,
    views: 1890,
    daysAgo: 14,
    likedBy: ["culture_kwame", "bola_reads", "ade_curious"],
  },
  {
    example_key: "a008",
    creator: "diaspora_kofi",
    otype: "Article",
    category: "careers",
    tags: ["careers", "diaspora"],
    title: "Navigating the European Job Market as an African Professional",
    content: `When I arrived in London for my master's degree, I assumed the hardest part was over. What I had not accounted for was the invisible curriculum.\n\n## Your name is not a barrier\n\nThe companies worth working for will not penalise you for your name.\n\n## Your African experience is expertise\n\nThe economic complexity you have navigated, the resourcefulness you have developed, the multilingualism — these are genuinely valuable.\n\n## Find your people\n\nAfrican professionals networks in your city are not just social. They are intelligence networks.`,
    views: 2780,
    daysAgo: 6,
    likedBy: ["bola_reads", "finance_amara"],
  },
  {
    example_key: "f001",
    creator: "tech_temi",
    otype: "Forum Post",
    category: "technology",
    tags: ["technology", "tools"],
    title: "What local tech tools are you actually building with?",
    content:
      "I am curious — what tools, frameworks, or platforms built specifically for the African market are people using and loving? Payments, hosting, comms — anything goes.",
    views: 820,
    daysAgo: 3,
    likedBy: ["bola_reads", "ade_curious"],
  },
  {
    example_key: "f002",
    creator: "bola_reads",
    otype: "Forum Post",
    category: "finance",
    tags: ["finance", "naira"],
    title: "Best strategies for saving with the current naira situation?",
    content:
      "With inflation eating through savings and the naira where it is, how are people actually protecting their money? Dollar accounts? Stablecoins? Real estate?",
    views: 1450,
    daysAgo: 1,
    likedBy: ["tech_temi", "finance_amara"],
  },
  {
    example_key: "f003",
    creator: "culture_kwame",
    otype: "Forum Post",
    category: "culture",
    tags: ["culture", "literature"],
    title: "What African books have genuinely changed how you think?",
    content:
      "Not looking for the obvious answers (though Achebe is always valid). I want to know which books by African authors have actually shifted something fundamental.",
    views: 970,
    daysAgo: 4,
    likedBy: ["ade_curious", "bola_reads"],
  },
  {
    example_key: "f004",
    creator: "history_adaeze",
    otype: "Forum Post",
    category: "education",
    tags: ["education", "history"],
    title: "Should African history be mandatory in African schools?",
    content:
      "We spend more time on European colonisers than on the Malian Empire or the Zulu Kingdom. Is mandatory African history in curricula the right policy answer?",
    views: 1670,
    daysAgo: 2,
    likedBy: ["culture_kwame", "bola_reads", "ade_curious"],
  },
];

// Comments, keyed the same way. parent is the example_key of the article
// or forum post they reply to -- every one of these is a top-level
// comment in the prototype (no reply-to-a-reply in this seed set).
export const COMMENTS = [
  {
    example_key: "c001",
    creator: "finance_amara",
    parent: "f001",
    content:
      "Paystack and Flutterwave APIs are world-class for payment infrastructure. For hosting, Cloudflare Workers has been excellent for edge logic that holds up with intermittent connections.",
    daysAgo: 2,
    likedBy: ["tech_temi"],
  },
  {
    example_key: "c002",
    creator: "ade_curious",
    parent: "f001",
    content:
      "Selar for digital product sales is massively underrated. Handles delivery, payments, and subscriptions in a way that actually works with Nigerian bank cards.",
    daysAgo: 2,
    likedBy: [],
  },
  {
    example_key: "c003",
    creator: "bola_reads",
    parent: "f002",
    content:
      "Dollar ETFs through Bamboo or Risevest are worth looking at for equity exposure without crypto volatility. Your money sits in US-denominated assets.",
    daysAgo: 1,
    likedBy: ["tech_temi"],
  },
  {
    example_key: "c004",
    creator: "ade_curious",
    parent: "f003",
    content:
      "Half of a Yellow Sun by Chimamanda Ngozi Adichie. Changed how I think about memory, war, and complicity.",
    daysAgo: 3,
    likedBy: ["culture_kwame", "bola_reads"],
  },
  {
    example_key: "c005",
    creator: "bola_reads",
    parent: "a006",
    content:
      "Thank you for writing this. The part about knowing when to quit is something I have been wrestling with in my own small project.",
    daysAgo: 8,
    likedBy: ["tech_temi"],
  },
];
