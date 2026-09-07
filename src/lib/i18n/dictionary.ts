// The single source of truth for every piece of interface text in the
// app -- this extends ThePodium_v5.html's I18N object (see the file's
// `const I18N = {en:{...}, fr:{...}}` and its `t=k=>...` helper) rather
// than replacing it with a different mechanism. Keys the prototype
// already had (feed, articles, forum, cancel, save, follow, etc.) keep
// its exact English and French wording; everything the prototype didn't
// need translated (sign-up, password reset, moderation queue, the About
// page's mission, form validation, notifications...) is added here in
// the same flat key -> string shape.
//
// French wording throughout aims for natural, professional-publication
// French rather than literal word-for-word translation.

export const en = {
  // ─── Nav / global ────────────────────────────────────────────────
  feed: "Feed",
  articles: "Articles",
  forum: "Forum",
  about: "About",
  mod: "Mod",
  signin: "Sign In",
  join: "Join",
  out: "Out",
  create: "+ Create",
  newPost: "+ New Post",
  cancel: "Cancel",
  back: "← Back",
  save: "Save Changes",
  publish: "Publish",
  saveDraft: "Save Draft",
  comment: "Post Comment",
  reply: "Reply",
  follow: "Follow",
  unfollow: "Unfollow",
  all: "🌐 All",
  continent: "🌍 Continent",
  diaspora: "✈️ Diaspora",
  groups: "Groups",
  spaces: "Spaces",
  partnerships: "Partnerships",
  resources: "Resources",
  createAccount: "Create Account",
  switchTheme: "Switch theme",
  switchLanguage: "Switch language",

  // ─── Home page ───────────────────────────────────────────────────
  homeComingSoon: "Coming soon",
  homeTagline:
    "Voices of the continent and the diaspora — a place to inform, share, and take control of the African narrative.",

  // ─── Login page ──────────────────────────────────────────────────
  emailLabel: "Email",
  passwordLabel: "Password",
  forgotPassword: "Forgot password?",
  signingIn: "Signing in…",

  // ─── Sign-up page ────────────────────────────────────────────────
  usernameLabel: "Username",
  usernamePlaceholder: "your_username",
  passwordHint: "Min 10 chars · 1 uppercase · 1 symbol",
  dateOfBirthLabel: "Date of Birth",
  ageGateHint: "You must be at least 13 years old to join.",
  accountTypeLabel: "Account Type",
  creatingAccount: "Creating account…",
  usernameTaken: "Username already taken",
  signupGenericError:
    "We couldn't create your account. Please double-check your details and try again.",
  checkEmailHeading: "Check your email",
  checkEmailSignupBody:
    "We sent a confirmation link to {email}. Click it to finish creating your account.",
  userTypeReader: "Reader — browse and discuss",
  userTypeBlogger: "Blogger — write articles",
  userTypeNewsAgency: "News Agency — editorial",

  // ─── Forgot / reset password ─────────────────────────────────────
  resetPasswordHeading: "Reset your password",
  resetPasswordSubtitle:
    "Enter your email and we'll send you a link to reset it.",
  sendingResetLink: "Sending…",
  sendResetLink: "Send Reset Link",
  backToSignIn: "Back to Sign In",
  checkEmailResetBody:
    "If an account exists for {email}, we sent a link to reset your password.",
  linkExpiredHeading: "Link expired",
  linkExpiredBody: "{error} Request a new reset link and try again.",
  requestNewLink: "Request a new link",
  passwordUpdatedHeading: "Password updated",
  passwordUpdatedBody: "Your password has been changed.",
  continueToPodium: "Continue to The Podium",
  verifyingLink: "Verifying your reset link…",
  chooseNewPasswordHeading: "Choose a new password",
  newPasswordHint: "Min 10 chars, 1 uppercase, 1 number or symbol.",
  newPasswordLabel: "New Password",
  confirmPasswordLabel: "Confirm Password",
  updatingPassword: "Updating…",
  updatePassword: "Update Password",
  passwordsDontMatch: "Passwords don't match",

  // ─── Password / form validation ──────────────────────────────────
  pwTooShort: "Min 10 characters",
  pwNeedUppercase: "Need an uppercase letter",
  pwNeedNumberOrSymbol: "Need a number or symbol",
  usernameRequired: "Username required",
  usernameFormat: "3–24 chars, letters/numbers/underscores",
  dobRequired: "Date of birth required",
  dobInvalid: "Enter a valid date",
  dobTooYoung: "You must be at least 13 years old to join",

  // ─── About page ──────────────────────────────────────────────────
  aboutEyebrow: "Our Mission",
  aboutMission1:
    "One of the merits of globalisation is the creation of a world where intellectual conversation can be approached with different perspectives of cultural understanding. Africa, however, is often portrayed from a western-dominated ethnocentric perspective leaving little space for its own people to express the realities they face or the origins of African worldviews.",
  aboutMission2:
    "The Podium is a platform which wishes to bridge this gap and many more. It aims to engage the voices of Africans in the diaspora and within the continent to inform, share, and engage in important conversations. This dialogue has the potential to create innovation, cross-cultural understanding, and a better appreciation of personal provenance.",
  aboutMission3:
    "Through The Podium's focus on relevant topics such as art, history, economics, scientific innovation, technology, education, and business in the form of thought-provoking, engaging, user-generated content it will be possible to take control of the African narrative.",
  aboutMission4:
    "Every question has an answer. All information can find an interested audience. Every need has resources that can directly address it. Every conversation has a community ready to engage in it. The Podium, therefore, will create a place of connection and bridge gaps that have too long been in existence.",
  aboutOfferArticlesSub: "Long-form analysis",
  aboutOfferForumSub: "Open discussions",
  aboutOfferGroupsSub: "Topic communities",
  aboutOfferSpacesSub: "Networking events",
  aboutOfferPartnershipsSub: "Find collaborators",
  aboutOfferResourcesSub: "Finance & career guides",
  goToFeed: "Go to Your Feed →",
  joinThePodium: "Join The Podium",
  browseAsGuest: "Browse as Guest",

  // ─── Feed page ───────────────────────────────────────────────────
  yourFeed: "Your Feed",
  feedGreetingNote:
    "“Welcome” in {lang} — a different African language greets you each day",
  feedEmptyHeading: "Your feed is empty",
  feedEmptyBody: "Follow creators and set interests to personalise it.",
  browseArticles: "Browse Articles →",
  feedReasonFollowing: "Following @{username}",
  feedReasonInterests: "In your interests",
  feedReasonTrending: "Trending",

  // ─── Articles page ───────────────────────────────────────────────
  articlesHeading: "Articles",
  articlesCountSub: "{count} published articles",
  noArticlesInCategory: "No articles in this category yet.",

  // ─── Forum page ──────────────────────────────────────────────────
  forumHeading: "Forum",
  forumSub: "The palaver — open conversation under the community tree",
  noPostsYet: "No posts yet.",

  // ─── Guest banner ────────────────────────────────────────────────
  guestBannerTitle: "Browsing as a guest.",
  guestBannerBody:
    "Sign up to comment, follow creators, and join the conversation.",
  joinFree: "Join Free",

  // ─── Categories ──────────────────────────────────────────────────
  catAll: "All",
  catTechnology: "Technology",
  catFinance: "Finance",
  catCulture: "Culture",
  catHistory: "History",
  catScience: "Science",
  catEducation: "Education",
  catBusiness: "Business",
  catArt: "Art",
  catCareers: "Careers",

  // ─── Adinkra proverbs (symbol names stay untranslated Twi terms) ──
  adinkraPathTwists: "The path twists — adaptability and initiative",
  adinkraRamsHorns: "The ram's horns — strength with humility",
  adinkraSankofa: "Go back and retrieve it",
  adinkraNeaOnnim:
    "He who does not know can become knowledgeable by learning",
  adinkraEseNeTekrema:
    "The teeth and the tongue — we advance through interdependence",

  // ─── Post card / detail ──────────────────────────────────────────
  postDisputedWarning: "⚠ Some claims in this post are disputed.",
  readTimeMin: "{n} min",
  typeReader: "Reader",
  typeBlogger: "Blogger",
  typeNewsAgency: "News Agency",
  verified: "VERIFIED",
  founding: "Founding",
  trustLevelLabel: "Lvl {n} · {label}",
  trustNew: "New",
  trustRising: "Rising",
  trustEstablished: "Established",
  trustTrusted: "Trusted",
  trustFeatured: "Featured",
  africaFallback: "Africa",
  diasporaLabel: "DIASPORA",
  statusDraft: "DRAFT",
  statusPublished: "PUBLISHED",
  statusArchived: "ARCHIVED",
  contentNotFound: "Content not found.",
  userNotFound: "User not found.",
  whatsappShare: "WhatsApp ↗",
  readOnPodium: "Read on The Podium",
  shareLink: "🔗 Share",
  linkCopied: "Copied!",
  copy: "Copy",
  commentsHeading: "Comments ({n})",
  cannotComment: "Your account type cannot comment.",
  signInToJoin: "to join the conversation.",
  bookmarkSaved: "🔖 Saved",
  bookmarkSave: "🏷 Save",
  removeBookmark: "Remove bookmark",
  bookmarkTitle: "Bookmark",
  signInToLike: "Sign in to like content",

  // ─── Comment composer / thread ───────────────────────────────────
  writeComment: "Write a comment…",
  replyToUser: "Reply to @{username}…",
  writeSomethingFirst: "Write something first",
  signInRequired: "Sign in required",
  replySingular: "reply",
  replyPlural: "replies",

  // ─── Flag button / report modal ──────────────────────────────────
  flag: "Flag",
  reportContent: "Report Content",
  reportDisclaimer:
    "All reports are reviewed by a human moderator within 24 hours.",
  reasonLabel: "Reason",
  additionalNotesLabel: "Additional notes (optional)",
  anyContextPlaceholder: "Any context…",
  submitReport: "Submit Report",
  selectReason: "Select a reason",
  flagReasonHateSpeech: "Hate speech",
  flagReasonMisinformation: "Misinformation",
  flagReasonSpam: "Spam",
  flagReasonHarassment: "Harassment",
  flagReasonInappropriate: "Inappropriate content",
  flagReasonCopyright: "Copyright violation",
  flagReasonOther: "Other",

  // ─── Follow button ───────────────────────────────────────────────
  couldNotFollow: "Couldn't follow this account.",

  // ─── Post actions (owner controls) ───────────────────────────────
  editAction: "✎ Edit",
  publishAction: "↑ Publish",
  archiveAction: "Archive",
  restoreAction: "↺ Restore",

  // ─── Post form modal ─────────────────────────────────────────────
  createHeading: "Create",
  editPostHeading: "Edit Post",
  loadingEllipsis: "Loading…",
  titleLabel: "Title",
  titlePlaceholder: "A compelling title…",
  categoryLabel: "Category",
  languageLabel: "Language",
  contentLabel: "Content",
  contentPlaceholder: "Your ideas, analysis, or questions…",
  tagsLabel: "Tags",
  tagsPlaceholder: "technology, finance, culture…",
  wordCountLabel: "{n} words",
  saveAndPublish: "Save & Publish",
  draftsPrivateNote: "Drafts are private. Publish when ready.",
  titleRequired: "Title required",
  contentRequiredToPublish: "Content required to publish",
  couldNotLoadPost: "Couldn't load this post.",
  toolbarBold: "Bold",
  toolbarItalic: "Italic",
  toolbarHeading: "Heading",
  toolbarBullet: "Bullet",
  toolbarQuote: "Quote",
  toolbarCode: "Code",
  postTypeArticle: "Article",
  postTypeForumPost: "Forum Post",
  postTypeComment: "Comment",

  // ─── Moderator content actions / dispute modal ───────────────────
  removeContent: "Remove Content",
  dismiss: "Dismiss",
  markDisputed: "Mark Disputed",
  markAsDisputedHeading: "Mark as Disputed",
  markDisputedBody:
    "The post stays visible with a public advisory banner. Write the note readers will see.",
  disputeNoteLabel: "Dispute note",
  disputeNoteDefault:
    "Some claims in this article have not been independently verified.",
  applyDisputeLabel: "Apply Dispute Label",
  writeNoteForReaders: "Write a note for readers",

  // ─── Mod queue page ──────────────────────────────────────────────
  accessRestricted: "Access restricted.",
  moderationQueueHeading: "Moderation Queue",
  pendingResolvedSub: "{pending} pending · {resolved} resolved",
  totalFlags: "Total flags",
  removedStat: "Removed",
  dismissedStat: "Dismissed",
  slaWarning:
    "⚠ SLA: Hate speech within 6 hours. All other flags within 24 hours.",
  tabPending: "Pending",
  tabResolved: "Resolved",
  tabPublicLog: "Public Log",
  noPendingFlags: "✓ No pending flags.",
  urgentTag: "⚠ URGENT",
  reportedBy: "Reported by @{username}",
  viewLink: "View",
  removedLabel: "Removed",
  dismissedLabel: "Dismissed",
  publicModLogHeading: "Public Moderation Log",
  publicModLogBody:
    "The Podium publishes moderation statistics to maintain community trust.",
  statTotalFlagsReceived: "Total flags received",
  statReviewed: "Reviewed",
  statContentRemoved: "Content removed",
  statFlagsDismissed: "Flags dismissed",
  statAvgReviewTime: "Avg review time",
  statAvgReviewTimeValue: "< 12 hours",
  statPending: "Pending",

  // ─── Notifications ───────────────────────────────────────────────
  notificationsTitle: "Notifications",
  noNotificationsYet: "No notifications yet",
  notifLike: "@{username} liked your post",
  notifFollow: "@{username} started following you",
  notifComment: "@{username} commented on your post",
  notifReply: "@{username} replied to your comment",

  // ─── Settings page ───────────────────────────────────────────────
  editProfileHeading: "Edit Profile",
  bioLabel: "Bio",
  professionLabel: "Profession / Role",
  professionPlaceholder: "e.g. Software Engineer",
  industryLabel: "Industry",
  industryPlaceholder: "e.g. Technology, Finance",
  linkedinLabel: "LinkedIn URL",
  identityLabel: "Identity",
  identityAlly: "🤝 Ally",
  countryOfOriginLabel: "Country of Origin",
  selectEllipsis: "Select…",
  expertiseLabel: "Areas of Expertise (up to 5)",
  interestsLabel: "Interests",
  savingEllipsis: "Saving…",

  // ─── Profile page ────────────────────────────────────────────────
  editProfileLink: "Edit Profile",
  noBioYet: "No bio yet.",
  followersLabel: "followers",
  followingLabel: "following",
  publishedLabel: "published",
  expertiseHeading: "Expertise",
  interestsHeading: "Interests",
  yourReferralCode: "Your Referral Code",
  profileTabPublished: "published",
  profileTabDrafts: "drafts",
  profileTabArchived: "archived",
  profileTabBookmarks: "bookmarks",
  emptyPublished: "No posts yet.",
  emptyDrafts: "No drafts yet.",
  emptyArchived: "No archived posts yet.",
  emptyBookmarks: "No saved articles yet.",

  // ─── Onboarding ──────────────────────────────────────────────────
  onboardingWelcome: "Welcome to The Podium",
  onboardingIntro:
    "Help us understand where you're coming from so we can connect you with what matters most.",
  identityContinentLabel: "I'm on the African continent",
  identityContinentSub: "Living and working in Africa",
  identityDiasporaLabel: "I'm part of the African diaspora",
  identityDiasporaSub: "African living or working abroad",
  identityAllyLabel: "I'm an ally and supporter",
  identityAllySub: "Non-African interested in Africa",
  skipForNow: "Skip for now",
  step2of3: "STEP 2 OF 3 — YOUR ROOTS",
  whereAreYouFrom: "Where are you from?",
  rootsIntro:
    "This helps us connect you with content and people from your region.",
  selectCountryEllipsis: "Select country…",
  countryOfResidenceLabel: "Country of Residence",
  continueAction: "Continue",
  skipAction: "Skip",
  step3of3: "STEP 3 OF 3 — YOUR INTERESTS",
  whatDoYouWantToRead: "What do you want to read?",
  selectInterestsIntro: "Select everything that interests you.",
  finish: "Finish",

  // ─── Interests ───────────────────────────────────────────────────
  interestTechnology: "technology",
  interestFinance: "finance",
  interestCulture: "culture",
  interestHistory: "history",
  interestScience: "science",
  interestEducation: "education",
  interestBusiness: "business",
  interestArt: "art",
  interestStartups: "startups",
  interestAi: "ai",
  interestLiterature: "literature",
  interestEconomics: "economics",
  interestInnovation: "innovation",
  interestPolicy: "policy",
  interestCareers: "careers",
  interestDiaspora: "diaspora",
  interestEntrepreneurship: "entrepreneurship",
  interestHealth: "health",

  // ─── Proverbs (empty states) ─────────────────────────────────────
  africanProverbLabel: "African proverb, {topic}",
  proverbFeed: "However far the stream flows, it never forgets its source.",
  proverbFeedTag: "on beginnings",
  proverbGroups:
    "If you want to go fast, go alone. If you want to go far, go together.",
  proverbGroupsTag: "on community",
  proverbBoard: "A single bracelet does not jingle.",
  proverbBoardTag: "on conversation",
  proverbSpaces:
    "Wisdom is like a baobab tree; no one person can embrace it alone.",
  proverbSpacesTag: "on gathering",
  proverbMessages: "A single bracelet does not jingle.",
  proverbMessagesTag: "on connection",
  proverbSaved:
    "Knowledge is like a garden: if it is not cultivated, it cannot be harvested.",
  proverbSavedTag: "on learning",
  proverbDrafts: "However long the night, the dawn will break.",
  proverbDraftsTag: "on patience",

  // ─── Relative time (lib/format.ts) ───────────────────────────────
  justNow: "just now",
  minAgo: "{n}m ago",
  hourAgo: "{n}h ago",
  dayAgo: "{n}d ago",
} as const;

export type Locale = "en" | "fr";
export type DictKey = keyof typeof en;

export const fr: Record<DictKey, string> = {
  // ─── Nav / global ────────────────────────────────────────────────
  feed: "Fil",
  articles: "Articles",
  forum: "Forum",
  about: "À propos",
  mod: "Modération",
  signin: "Connexion",
  join: "Rejoindre",
  out: "Sortir",
  create: "+ Créer",
  newPost: "+ Nouveau post",
  cancel: "Annuler",
  back: "← Retour",
  save: "Enregistrer",
  publish: "Publier",
  saveDraft: "Brouillon",
  comment: "Commenter",
  reply: "Répondre",
  follow: "Suivre",
  unfollow: "Ne plus suivre",
  all: "🌐 Tout",
  continent: "🌍 Continent",
  diaspora: "✈️ Diaspora",
  groups: "Groupes",
  spaces: "Espaces",
  partnerships: "Partenariats",
  resources: "Ressources",
  createAccount: "Créer un compte",
  switchTheme: "Changer de thème",
  switchLanguage: "Changer de langue",

  // ─── Home page ───────────────────────────────────────────────────
  homeComingSoon: "Bientôt disponible",
  homeTagline:
    "Les voix du continent et de la diaspora — un espace pour s'informer, partager et reprendre en main le récit africain.",

  // ─── Login page ──────────────────────────────────────────────────
  emailLabel: "E-mail",
  passwordLabel: "Mot de passe",
  forgotPassword: "Mot de passe oublié ?",
  signingIn: "Connexion en cours…",

  // ─── Sign-up page ────────────────────────────────────────────────
  usernameLabel: "Nom d'utilisateur",
  usernamePlaceholder: "votre_nom_utilisateur",
  passwordHint: "Min. 10 caractères · 1 majuscule · 1 symbole",
  dateOfBirthLabel: "Date de naissance",
  ageGateHint: "Vous devez avoir au moins 13 ans pour nous rejoindre.",
  accountTypeLabel: "Type de compte",
  creatingAccount: "Création du compte…",
  usernameTaken: "Ce nom d'utilisateur est déjà pris",
  signupGenericError:
    "Nous n'avons pas pu créer votre compte. Vérifiez vos informations et réessayez.",
  checkEmailHeading: "Vérifiez votre e-mail",
  checkEmailSignupBody:
    "Nous avons envoyé un lien de confirmation à {email}. Cliquez dessus pour finaliser la création de votre compte.",
  userTypeReader: "Lecteur — parcourir et échanger",
  userTypeBlogger: "Blogueur — rédiger des articles",
  userTypeNewsAgency: "Agence de presse — contenu éditorial",

  // ─── Forgot / reset password ─────────────────────────────────────
  resetPasswordHeading: "Réinitialiser votre mot de passe",
  resetPasswordSubtitle:
    "Indiquez votre e-mail et nous vous enverrons un lien pour le réinitialiser.",
  sendingResetLink: "Envoi en cours…",
  sendResetLink: "Envoyer le lien",
  backToSignIn: "Retour à la connexion",
  checkEmailResetBody:
    "Si un compte existe pour {email}, nous lui avons envoyé un lien de réinitialisation.",
  linkExpiredHeading: "Lien expiré",
  linkExpiredBody: "{error} Demandez un nouveau lien et réessayez.",
  requestNewLink: "Demander un nouveau lien",
  passwordUpdatedHeading: "Mot de passe mis à jour",
  passwordUpdatedBody: "Votre mot de passe a été modifié.",
  continueToPodium: "Continuer vers The Podium",
  verifyingLink: "Vérification de votre lien…",
  chooseNewPasswordHeading: "Choisissez un nouveau mot de passe",
  newPasswordHint: "Min. 10 caractères, 1 majuscule, 1 chiffre ou symbole.",
  newPasswordLabel: "Nouveau mot de passe",
  confirmPasswordLabel: "Confirmer le mot de passe",
  updatingPassword: "Mise à jour…",
  updatePassword: "Mettre à jour le mot de passe",
  passwordsDontMatch: "Les mots de passe ne correspondent pas",

  // ─── Password / form validation ──────────────────────────────────
  pwTooShort: "Min. 10 caractères",
  pwNeedUppercase: "Une majuscule est requise",
  pwNeedNumberOrSymbol: "Un chiffre ou un symbole est requis",
  usernameRequired: "Nom d'utilisateur requis",
  usernameFormat: "3 à 24 caractères : lettres, chiffres, tirets bas",
  dobRequired: "Date de naissance requise",
  dobInvalid: "Entrez une date valide",
  dobTooYoung: "Vous devez avoir au moins 13 ans pour nous rejoindre",

  // ─── About page ──────────────────────────────────────────────────
  aboutEyebrow: "Notre mission",
  aboutMission1:
    "L'un des mérites de la mondialisation est d'avoir créé un monde où le débat intellectuel peut s'aborder à travers différentes perspectives culturelles. L'Afrique, pourtant, est trop souvent présentée selon un regard occidental et ethnocentré, laissant peu de place à ses propres peuples pour exprimer les réalités qu'ils vivent ou les origines de leurs visions du monde.",
  aboutMission3:
    "En donnant la parole à des sujets essentiels — l'art, l'histoire, l'économie, l'innovation scientifique, la technologie, l'éducation, les affaires — sous forme de contenus engageants et créés par ses utilisateurs, The Podium rendra possible la reprise en main du récit africain.",
  aboutMission2:
    "The Podium est une plateforme qui souhaite combler ce fossé, et bien d'autres encore. Elle vise à donner la parole aux Africains de la diaspora comme du continent, pour s'informer, partager et prendre part à des conversations essentielles. Ce dialogue peut faire naître l'innovation, une compréhension interculturelle plus riche et une meilleure appréciation de ses propres racines.",
  aboutMission4:
    "Chaque question a une réponse. Toute information peut trouver un public intéressé. Chaque besoin dispose de ressources capables d'y répondre directement. Chaque conversation trouve une communauté prête à s'y engager. The Podium créera ainsi un espace de connexion, comblant des fossés qui ont trop longtemps existé.",
  aboutOfferArticlesSub: "Analyses approfondies",
  aboutOfferForumSub: "Discussions ouvertes",
  aboutOfferGroupsSub: "Communautés thématiques",
  aboutOfferSpacesSub: "Rencontres de réseautage",
  aboutOfferPartnershipsSub: "Trouvez des partenaires",
  aboutOfferResourcesSub: "Guides finance et carrière",
  goToFeed: "Accéder à votre fil →",
  joinThePodium: "Rejoindre The Podium",
  browseAsGuest: "Parcourir en invité",

  // ─── Feed page ───────────────────────────────────────────────────
  yourFeed: "Votre Fil",
  feedGreetingNote:
    "« Bienvenue » en {lang} — une langue africaine différente vous salue chaque jour",
  feedEmptyHeading: "Votre fil est vide",
  feedEmptyBody:
    "Suivez des créateurs et choisissez vos centres d'intérêt pour le personnaliser.",
  browseArticles: "Découvrir les articles →",
  feedReasonFollowing: "Vous suivez @{username}",
  feedReasonInterests: "Dans vos centres d'intérêt",
  feedReasonTrending: "Tendance",

  // ─── Articles page ───────────────────────────────────────────────
  articlesHeading: "Articles",
  articlesCountSub: "{count} articles publiés",
  noArticlesInCategory: "Aucun article dans cette catégorie pour le moment.",

  // ─── Forum page ──────────────────────────────────────────────────
  forumHeading: "Forum",
  forumSub: "La palabre — conversations ouvertes sous l'arbre de la communauté",
  noPostsYet: "Aucune publication pour le moment.",

  // ─── Guest banner ────────────────────────────────────────────────
  guestBannerTitle: "Vous naviguez en tant qu'invité.",
  guestBannerBody:
    "Inscrivez-vous pour commenter, suivre des créateurs et rejoindre la conversation.",
  joinFree: "Rejoindre gratuitement",

  // ─── Categories ──────────────────────────────────────────────────
  catAll: "Toutes",
  catTechnology: "Technologie",
  catFinance: "Finance",
  catCulture: "Culture",
  catHistory: "Histoire",
  catScience: "Science",
  catEducation: "Éducation",
  catBusiness: "Affaires",
  catArt: "Art",
  catCareers: "Carrières",

  // ─── Adinkra proverbs ────────────────────────────────────────────
  adinkraPathTwists: "Le chemin serpente — adaptabilité et initiative",
  adinkraRamsHorns: "Les cornes du bélier — la force dans l'humilité",
  adinkraSankofa: "Retourne le chercher",
  adinkraNeaOnnim: "Celui qui ne sait pas peut apprendre à savoir",
  adinkraEseNeTekrema:
    "Les dents et la langue — nous avançons par l'interdépendance",

  // ─── Post card / detail ──────────────────────────────────────────
  postDisputedWarning: "⚠ Certaines affirmations de cette publication sont contestées.",
  readTimeMin: "{n} min",
  typeReader: "Lecteur",
  typeBlogger: "Blogueur",
  typeNewsAgency: "Agence de presse",
  verified: "VÉRIFIÉ",
  founding: "Fondateur",
  trustLevelLabel: "Niv. {n} · {label}",
  trustNew: "Nouveau",
  trustRising: "En progression",
  trustEstablished: "Confirmé",
  trustTrusted: "Fiable",
  trustFeatured: "Vedette",
  africaFallback: "Afrique",
  diasporaLabel: "DIASPORA",
  statusDraft: "BROUILLON",
  statusPublished: "PUBLIÉ",
  statusArchived: "ARCHIVÉ",
  contentNotFound: "Contenu introuvable.",
  userNotFound: "Utilisateur introuvable.",
  whatsappShare: "WhatsApp ↗",
  readOnPodium: "À lire sur The Podium",
  shareLink: "🔗 Partager",
  linkCopied: "Copié !",
  copy: "Copier",
  commentsHeading: "Commentaires ({n})",
  cannotComment: "Votre type de compte ne permet pas de commenter.",
  signInToJoin: "pour rejoindre la conversation.",
  bookmarkSaved: "🔖 Enregistré",
  bookmarkSave: "🏷 Enregistrer",
  removeBookmark: "Retirer des favoris",
  bookmarkTitle: "Ajouter aux favoris",
  signInToLike: "Connectez-vous pour aimer ce contenu",

  // ─── Comment composer / thread ───────────────────────────────────
  writeComment: "Écrivez un commentaire…",
  replyToUser: "Répondre à @{username}…",
  writeSomethingFirst: "Écrivez d'abord quelque chose",
  signInRequired: "Connexion requise",
  replySingular: "réponse",
  replyPlural: "réponses",

  // ─── Flag button / report modal ──────────────────────────────────
  flag: "Signaler",
  reportContent: "Signaler ce contenu",
  reportDisclaimer:
    "Tous les signalements sont examinés par un modérateur sous 24 heures.",
  reasonLabel: "Motif",
  additionalNotesLabel: "Remarques complémentaires (facultatif)",
  anyContextPlaceholder: "Contexte supplémentaire…",
  submitReport: "Envoyer le signalement",
  selectReason: "Choisissez un motif",
  flagReasonHateSpeech: "Discours haineux",
  flagReasonMisinformation: "Désinformation",
  flagReasonSpam: "Spam",
  flagReasonHarassment: "Harcèlement",
  flagReasonInappropriate: "Contenu inapproprié",
  flagReasonCopyright: "Violation de droits d'auteur",
  flagReasonOther: "Autre",

  // ─── Follow button ───────────────────────────────────────────────
  couldNotFollow: "Impossible de suivre ce compte.",

  // ─── Post actions (owner controls) ───────────────────────────────
  editAction: "✎ Modifier",
  publishAction: "↑ Publier",
  archiveAction: "Archiver",
  restoreAction: "↺ Restaurer",

  // ─── Post form modal ─────────────────────────────────────────────
  createHeading: "Créer",
  editPostHeading: "Modifier la publication",
  loadingEllipsis: "Chargement…",
  titleLabel: "Titre",
  titlePlaceholder: "Un titre percutant…",
  categoryLabel: "Catégorie",
  languageLabel: "Langue",
  contentLabel: "Contenu",
  contentPlaceholder: "Vos idées, analyses ou questions…",
  tagsLabel: "Mots-clés",
  tagsPlaceholder: "technologie, finance, culture…",
  wordCountLabel: "{n} mots",
  saveAndPublish: "Enregistrer et publier",
  draftsPrivateNote: "Les brouillons sont privés. Publiez quand vous êtes prêt.",
  titleRequired: "Le titre est requis",
  contentRequiredToPublish: "Le contenu est requis pour publier",
  couldNotLoadPost: "Impossible de charger cette publication.",
  toolbarBold: "Gras",
  toolbarItalic: "Italique",
  toolbarHeading: "Titre",
  toolbarBullet: "Liste à puces",
  toolbarQuote: "Citation",
  toolbarCode: "Code",
  postTypeArticle: "Article",
  postTypeForumPost: "Publication au forum",
  postTypeComment: "Commentaire",

  // ─── Moderator content actions / dispute modal ───────────────────
  removeContent: "Retirer le contenu",
  dismiss: "Rejeter",
  markDisputed: "Marquer comme contesté",
  markAsDisputedHeading: "Marquer comme contesté",
  markDisputedBody:
    "La publication reste visible avec une bannière d'avertissement publique. Rédigez la note que les lecteurs verront.",
  disputeNoteLabel: "Note de contestation",
  disputeNoteDefault:
    "Certaines affirmations de cet article n'ont pas été vérifiées de manière indépendante.",
  applyDisputeLabel: "Appliquer le libellé de contestation",
  writeNoteForReaders: "Rédigez une note pour les lecteurs",

  // ─── Mod queue page ──────────────────────────────────────────────
  accessRestricted: "Accès restreint.",
  moderationQueueHeading: "File de modération",
  pendingResolvedSub: "{pending} en attente · {resolved} traités",
  totalFlags: "Signalements au total",
  removedStat: "Retirés",
  dismissedStat: "Rejetés",
  slaWarning:
    "⚠ Délai : discours haineux sous 6 heures. Tous les autres signalements sous 24 heures.",
  tabPending: "En attente",
  tabResolved: "Traités",
  tabPublicLog: "Journal public",
  noPendingFlags: "✓ Aucun signalement en attente.",
  urgentTag: "⚠ URGENT",
  reportedBy: "Signalé par @{username}",
  viewLink: "Voir",
  removedLabel: "Retiré",
  dismissedLabel: "Rejeté",
  publicModLogHeading: "Journal public de modération",
  publicModLogBody:
    "The Podium publie ses statistiques de modération pour préserver la confiance de la communauté.",
  statTotalFlagsReceived: "Signalements reçus au total",
  statReviewed: "Examinés",
  statContentRemoved: "Contenus retirés",
  statFlagsDismissed: "Signalements rejetés",
  statAvgReviewTime: "Délai moyen d'examen",
  statAvgReviewTimeValue: "< 12 heures",
  statPending: "En attente",

  // ─── Notifications ───────────────────────────────────────────────
  notificationsTitle: "Notifications",
  noNotificationsYet: "Aucune notification pour le moment",
  notifLike: "@{username} a aimé votre publication",
  notifFollow: "@{username} a commencé à vous suivre",
  notifComment: "@{username} a commenté votre publication",
  notifReply: "@{username} a répondu à votre commentaire",

  // ─── Settings page ───────────────────────────────────────────────
  editProfileHeading: "Modifier le profil",
  bioLabel: "Bio",
  professionLabel: "Profession / Poste",
  professionPlaceholder: "ex. Ingénieur logiciel",
  industryLabel: "Secteur",
  industryPlaceholder: "ex. Technologie, Finance",
  linkedinLabel: "URL LinkedIn",
  identityLabel: "Identité",
  identityAlly: "🤝 Allié",
  countryOfOriginLabel: "Pays d'origine",
  selectEllipsis: "Sélectionner…",
  expertiseLabel: "Domaines d'expertise (5 maximum)",
  interestsLabel: "Centres d'intérêt",
  savingEllipsis: "Enregistrement…",

  // ─── Profile page ────────────────────────────────────────────────
  editProfileLink: "Modifier le profil",
  noBioYet: "Aucune bio pour le moment.",
  followersLabel: "abonnés",
  followingLabel: "abonnements",
  publishedLabel: "publiés",
  expertiseHeading: "Expertise",
  interestsHeading: "Centres d'intérêt",
  yourReferralCode: "Votre code de parrainage",
  profileTabPublished: "publiés",
  profileTabDrafts: "brouillons",
  profileTabArchived: "archivés",
  profileTabBookmarks: "favoris",
  emptyPublished: "Aucune publication pour le moment.",
  emptyDrafts: "Aucun brouillon pour le moment.",
  emptyArchived: "Aucune publication archivée pour le moment.",
  emptyBookmarks: "Aucun article enregistré pour le moment.",

  // ─── Onboarding ──────────────────────────────────────────────────
  onboardingWelcome: "Bienvenue sur The Podium",
  onboardingIntro:
    "Aidez-nous à mieux vous connaître afin de vous proposer ce qui compte le plus pour vous.",
  identityContinentLabel: "Je suis sur le continent africain",
  identityContinentSub: "Vivant et travaillant en Afrique",
  identityDiasporaLabel: "Je fais partie de la diaspora africaine",
  identityDiasporaSub: "Africain(e) vivant ou travaillant à l'étranger",
  identityAllyLabel: "Je suis un(e) allié(e) et soutien",
  identityAllySub: "Non-Africain(e) intéressé(e) par l'Afrique",
  skipForNow: "Passer pour l'instant",
  step2of3: "ÉTAPE 2 SUR 3 — VOS RACINES",
  whereAreYouFrom: "D'où venez-vous ?",
  rootsIntro:
    "Cela nous aide à vous proposer des contenus et des personnes de votre région.",
  selectCountryEllipsis: "Sélectionnez un pays…",
  countryOfResidenceLabel: "Pays de résidence",
  continueAction: "Continuer",
  skipAction: "Passer",
  step3of3: "ÉTAPE 3 SUR 3 — VOS CENTRES D'INTÉRÊT",
  whatDoYouWantToRead: "Que souhaitez-vous lire ?",
  selectInterestsIntro: "Sélectionnez tout ce qui vous intéresse.",
  finish: "Terminer",

  // ─── Interests ───────────────────────────────────────────────────
  interestTechnology: "technologie",
  interestFinance: "finance",
  interestCulture: "culture",
  interestHistory: "histoire",
  interestScience: "science",
  interestEducation: "éducation",
  interestBusiness: "affaires",
  interestArt: "art",
  interestStartups: "startups",
  interestAi: "IA",
  interestLiterature: "littérature",
  interestEconomics: "économie",
  interestInnovation: "innovation",
  interestPolicy: "politiques publiques",
  interestCareers: "carrières",
  interestDiaspora: "diaspora",
  interestEntrepreneurship: "entrepreneuriat",
  interestHealth: "santé",

  // ─── Proverbs (empty states) ─────────────────────────────────────
  africanProverbLabel: "Proverbe africain, {topic}",
  proverbFeed:
    "Aussi loin que coule le ruisseau, il n'oublie jamais sa source.",
  proverbFeedTag: "sur les commencements",
  proverbGroups:
    "Si tu veux aller vite, marche seul. Si tu veux aller loin, marchons ensemble.",
  proverbGroupsTag: "sur la communauté",
  proverbBoard: "Un seul bracelet ne tinte pas.",
  proverbBoardTag: "sur le dialogue",
  proverbSpaces:
    "La sagesse est comme un baobab : nul ne peut l'embrasser seul.",
  proverbSpacesTag: "sur le rassemblement",
  proverbMessages: "Un seul bracelet ne tinte pas.",
  proverbMessagesTag: "sur le lien",
  proverbSaved:
    "Le savoir est comme un jardin : s'il n'est pas cultivé, on ne peut le récolter.",
  proverbSavedTag: "sur l'apprentissage",
  proverbDrafts: "Aussi longue soit la nuit, l'aube finit par se lever.",
  proverbDraftsTag: "sur la patience",

  // ─── Relative time (lib/format.ts) ───────────────────────────────
  justNow: "à l'instant",
  minAgo: "il y a {n} min",
  hourAgo: "il y a {n} h",
  dayAgo: "il y a {n} j",
};

export const dictionaries: Record<Locale, Record<DictKey, string>> = {
  en,
  fr,
};

/** Simple {placeholder} interpolation -- all this dictionary needs. */
export function translate(
  locale: Locale,
  key: DictKey,
  vars?: Record<string, string | number>,
): string {
  const raw = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    raw,
  );
}
