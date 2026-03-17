export type BodyType = "Fit" | "Thick" | "Average" | "Slender";

export type Advert = {
  id: string;
  name: string;
  age: number;
  location: string;
  /** e.g. Female, Male */
  gender: string;
  /** Fit | Thick | Average | Slender */
  bodyType: BodyType;
  category: string;
  shortDescription: string;
  fullDescription: string;
  phone: string;
  whatsapp: string;
  email?: string;
  images: string[];
  imageFocalPoints?: string[];
  profileImage: string;
  postedAt: string;
  expiresAt: string;
  status: "active" | "expired";
  featured?: boolean;
  featuredUntil?: string;
};

export const adverts: Advert[] = [
  {
    id: "1",
    name: "Sarah Dlamini",
    age: 32,
    location: "Sandton, Johannesburg",
    gender: "Female",
    bodyType: "Average",
    category: "Soft & slow",
    shortDescription:
      "Warm hands, slow breaths, and nowhere to be. I come to you—blankets, mood lighting, and cuddles that melt the week away.",
    fullDescription:
      "Hey love. I’m Sarah, and I specialise in the kind of cuddles that make you forget your phone exists. I travel to your place with soft throws, optional essential oils, and zero rush. Think spooning, head-on-chest, lazy strokes through your hair—always consent-first, always platonic, always deliciously present. Evenings and weekends work best. Sandton and surrounds. Message me and tell me what kind of tired you are—I’ll match the vibe.",
    phone: "+27 82 123 4567",
    whatsapp: "27821234567",
    email: "sarah.dlamini@email.com",
    images: ["/images/provider-1.png", "/images/provider-5.png"],
    profileImage: "/images/provider-1.png",
    postedAt: "2025-03-08T09:00:00Z",
    expiresAt: "2025-04-07T09:00:00Z",
    status: "active",
    featured: true,
  },
  {
    id: "2",
    name: "Mike Nkosi",
    age: 45,
    location: "Randburg, Johannesburg",
    gender: "Male",
    bodyType: "Fit",
    category: "Big spoon energy",
    shortDescription:
      "Tall, calm, and built for wrapping around you. Home visits—movie optional, holding you non-negotiable.",
    fullDescription:
      "I’m Mike. If you crave weight, warmth, and someone who can actually hold space without making it weird—I’m your guy. I do in-home cuddle sessions: couch, bed, floor nest—whatever feels safe and good for you. Firm hugs, gentle rocking, the kind of silence that feels full. Boundaries are sacred; we agree everything upfront. Randburg, Roodepoort, Northgate. Evenings after 6 or Sunday afternoons. WhatsApp me a 🧡 and your area.",
    phone: "+27 83 234 5678",
    whatsapp: "27832345678",
    email: "mike.nkosi@email.com",
    images: ["/images/provider-2.png", "/images/provider-4.png"],
    profileImage: "/images/provider-2.png",
    postedAt: "2025-03-07T14:00:00Z",
    expiresAt: "2025-04-06T14:00:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Lerato Mokoena",
    age: 27,
    location: "Fourways, Johannesburg",
    gender: "Female",
    bodyType: "Slender",
    category: "Movie night",
    shortDescription:
      "Popcorn, your sofa, and me tucked into your side. Flirty-safe cuddles while the credits roll.",
    fullDescription:
      "Lerato here—I turn your living room into the cosiest date-with-yourself you’ve ever had. I bring the vibe: soft hoodie optional, playlists if you want them, and arms that don’t get tired halfway through the film. Strictly platonic, seriously sensual in the sense of *present*—no expectations, just contact that feels like honey. Fourways, Douglasdale, Lonehill. Flexible hours; late nights are my favourite. Slide into my DMs with your postcode.",
    phone: "+27 84 345 6789",
    whatsapp: "27843456789",
    images: ["/images/provider-3.png", "/images/provider-1.png"],
    profileImage: "/images/provider-3.png",
    postedAt: "2025-03-06T10:00:00Z",
    expiresAt: "2025-04-05T10:00:00Z",
    status: "active",
  },
  {
    id: "4",
    name: "David Sithole",
    age: 38,
    location: "Midrand, Johannesburg",
    gender: "Male",
    bodyType: "Average",
    category: "Deep rest",
    shortDescription:
      "For when you’re burnt out and need someone to simply *be there*—breath synced, lights low, world off.",
    fullDescription:
      "David. I do cuddle sessions for people who are done performing. You lie down, I adjust until you’re comfortable, and we let the nervous system downshift. No small talk required—though I’m great at it if you want. Midrand, Centurion, Halfway House. I’m punctual, scent-light, and trained in reading body language so we never cross a line you didn’t draw. Book via WhatsApp; say ‘rest’ and I’ll send availability.",
    phone: "+27 85 456 7890",
    whatsapp: "27854567890",
    email: "david.sithole@email.com",
    images: ["/images/provider-4.png", "/images/provider-2.png"],
    profileImage: "/images/provider-4.png",
    postedAt: "2025-03-05T08:00:00Z",
    expiresAt: "2025-04-04T08:00:00Z",
    status: "active",
  },
  {
    id: "5",
    name: "Nomsa Khumalo",
    age: 29,
    location: "Soweto, Johannesburg",
    gender: "Female",
    bodyType: "Thick",
    category: "Playful energy",
    shortDescription:
      "Laughs between cuddles, tickles if you’re into it, then back to slow—sparkly energy, soft landing.",
    fullDescription:
      "Nomsa 💋 I’m the one if you want cuddles that don’t feel like a funeral. A little teasing, a lot of warmth, always respectful. I come to you; we set the rules together. Soweto, Eldos, Lenasia. Afternoons or early evenings. I’m flirty in the way sunshine is—bright, not demanding. Message me with ‘cuddle’ and what kind of day you’ve had.",
    phone: "+27 86 567 8901",
    whatsapp: "27865678901",
    email: "nomsa.khumalo@email.com",
    images: ["/images/provider-5.png", "/images/provider-3.png"],
    profileImage: "/images/provider-5.png",
    postedAt: "2025-03-04T11:00:00Z",
    expiresAt: "2025-04-03T11:00:00Z",
    status: "active",
  },
  {
    id: "6",
    name: "Thabo Molefe",
    age: 41,
    location: "Pretoria East",
    gender: "Male",
    bodyType: "Fit",
    category: "Overnight vibe",
    shortDescription:
      "Long-form holding—for insomniacs and cuddle addicts. We negotiate hours; your place, your pace.",
    fullDescription:
      "Thabo. Some people need more than an hour to unclench. I offer extended in-home sessions: same rules as always—consent, platonic, no surprises. Pretoria East, Faerie Glen, Moreleta. If you’ve been starved of touch, we go slow until your body believes it’s safe. WhatsApp only; tell me ‘overnight’ or ‘long session’ and I’ll reply with boundaries sheet + rates mindset (we keep it simple).",
    phone: "+27 87 678 9012",
    whatsapp: "27876789012",
    images: ["/images/provider-2.png", "/images/provider-5.png"],
    profileImage: "/images/provider-2.png",
    postedAt: "2025-03-03T07:00:00Z",
    expiresAt: "2025-04-02T07:00:00Z",
    status: "active",
  },
  {
    id: "7",
    name: "Zanele Zulu",
    age: 35,
    location: "Cape Town CBD",
    gender: "Female",
    bodyType: "Thick",
    category: "Soft & slow",
    shortDescription:
      "Slow cuddles, sea-air optional, you horizontal—CBD & Atlantic Seaboard when I’m back live.",
    fullDescription:
      "Zanele. Cape Town CBD, Sea Point, Green Point. I had a run of back-to-back bookings and my listing lapsed—reposting soon. Same vibe: slow, intentional, ridiculously cosy. Hit me up when I’m live again.",
    phone: "+27 82 789 0123",
    whatsapp: "27827890123",
    email: "zanele.zulu@email.com",
    images: ["/images/provider-1.png", "/images/provider-4.png"],
    profileImage: "/images/provider-1.png",
    postedAt: "2025-03-02T09:00:00Z",
    expiresAt: "2025-03-09T09:00:00Z",
    status: "expired",
  },
  {
    id: "8",
    name: "Sipho Ndlovu",
    age: 50,
    location: "Durban North",
    gender: "Male",
    bodyType: "Average",
    category: "Big spoon energy",
    shortDescription:
      "Seasoned holder—steady arms, dad jokes optional. Durban North & surrounds; expired listing, back soon.",
    fullDescription:
      "Sipho. Twenty years of making people feel held—literally. Listing expired but I’ll be back on Hook shortly. Durban North, Umhlanga. Save my number if you like the vibe.",
    phone: "+27 83 890 1234",
    whatsapp: "27838901234",
    images: ["/images/provider-3.png", "/images/provider-5.png"],
    profileImage: "/images/provider-3.png",
    postedAt: "2025-02-20T08:00:00Z",
    expiresAt: "2025-02-27T08:00:00Z",
    status: "expired",
  },
];

export const getActiveAdverts = () =>
  adverts
    .filter((a) => a.status === "active")
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

export const getExpiredAdverts = () =>
  adverts
    .filter((a) => a.status === "expired")
    .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());

export const getAdvertById = (id: string) => adverts.find((a) => a.id === id);

export const getFeaturedAdverts = () => getActiveAdverts().filter((a) => a.featured);

export const getSuggestedAdverts = (
  excludeId: string,
  sameCategory: string,
  limit = 6
): Advert[] => {
  const active = getActiveAdverts().filter((a) => a.id !== excludeId);
  const sameCat = active.filter((a) => a.category === sameCategory);
  const otherCat = active.filter((a) => a.category !== sameCategory);
  return [...sameCat, ...otherCat].slice(0, limit);
};

export const zimbabweCities = [
  "Harare",
  "Bulawayo",
  "Chitungwiza",
  "Mutare",
  "Gweru",
  "Kwekwe",
  "Kadoma",
  "Masvingo",
  "Chinhoyi",
  "Marondera",
  "Norton",
  "Chegutu",
  "Zvishavane",
  "Bindura",
  "Beitbridge",
  "Hwange",
  "Kariba",
  "Rusape",
  "Chiredzi",
  "Victoria Falls",
  "Gokwe",
  "Shurugwi",
  "Chipinge",
  "Redcliff",
] as const;

export type ZimbabweCity = (typeof zimbabweCities)[number];

export const categories = [
  "All",
  "Soft & slow",
  "Big spoon energy",
  "Movie night",
  "Deep rest",
  "Playful energy",
  "Overnight vibe",
];

export const genders = ["All", "Female", "Male"] as const;

export const bodyTypes: (BodyType | "All")[] = ["All", "Fit", "Thick", "Average", "Slender"];
