export type BodyType = "Fit" | "Thick" | "Average" | "Slender";

export type Advert = {
  id: string;
  name: string;
  age: number;
  location: string;
  /** Suburb within `location` (city); omitted for legacy rows. */
  suburb?: string;
  /** e.g. Female, Male */
  gender: string;
  /** Fit | Thick | Average | Slender */
  bodyType: BodyType;
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
  /** Hero strip + priority ordering; time-limited via `premiumUntil`. */
  premium?: boolean;
  premiumUntil?: string;
  /** Badge-only tier; time-limited via `vipUntil`. */
  vip?: boolean;
  vipUntil?: string;
  ratingAvg?: number;
  ratingCount?: number;
};

/** Premium listings first, then newest by `postedAt` (used for API + home feed). */
export function sortAdvertsForFeed(adverts: Advert[]): Advert[] {
  return [...adverts].sort((a, b) => {
    if (a.premium && !b.premium) return -1;
    if (!a.premium && b.premium) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
}

export const adverts: Advert[] = [
  {
    id: "1",
    name: "Sarah Dlamini",
    age: 32,
    location: "Sandton, Johannesburg",
    gender: "Female",
    bodyType: "Average",
    shortDescription:
      "Soft kisses down your neck, hands that linger, and no clock on the bed. I come to you—your sheets, your rules, my mouth where you want it.",
    fullDescription:
      "Hey love. I’m Sarah, and I show up to fuck you properly: slow at first, filthy by the end. I travel to your place with lingerie under my coat, toys if you ask, and zero shame. Oral, riding, eye contact that doesn’t look away—everything we agree on, nothing off the table you didn’t ask for. Evenings and weekends. Sandton and surrounds. Tell me how you like to come and I’ll build the night around it.",
    phone: "+27 82 123 4567",
    whatsapp: "27821234567",
    email: "sarah.dlamini@email.com",
    images: ["/images/provider-1.png", "/images/provider-5.png"],
    profileImage: "/images/provider-1.png",
    postedAt: "2025-03-08T09:00:00Z",
    expiresAt: "2025-04-07T09:00:00Z",
    status: "active",
    premium: true,
  },
  {
    id: "2",
    name: "Mike Nkosi",
    age: 45,
    location: "Randburg, Johannesburg",
    gender: "Male",
    bodyType: "Fit",
    shortDescription:
      "Built to pin you down, split you open, and make you beg before I let you finish. Outcalls—your bed, my tempo.",
    fullDescription:
      "I’m Mike. If you want someone who takes charge—hair in a fist, dirty talk, stamina that outlasts you—I’m your guy. I do full-service outcalls: oral, penetration, positions until you’re shaking. Hard or slow, but always explicit. We negotiate limits and safe words upfront. Randburg, Roodepoort, Northgate. Evenings after 6 or Sunday afternoons. WhatsApp me a 🔥 and your area.",
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
    shortDescription:
      "Netflix stays on mute—we’re too busy with hands under clothes, grinding, and me finishing what the opening credits started.",
    fullDescription:
      "Lerato here. I turn your couch into foreplay: straddling, teasing, then the bedroom when you can’t wait. Girlfriend-style energy with porn-star honesty—I love giving head, being ridden, and hearing what gets you there. Fourways, Douglasdale, Lonehill. Late nights are my favourite. Message your postcode and what you want between the sheets.",
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
    shortDescription:
      "Full-body oil, edging, and release when you’re dripping—tantric pace with a filthy payoff.",
    fullDescription:
      "David. I do sensual massage that turns into whatever we negotiate: body slides, prostate if you’re curious, oral finish or full sex—your call. Midrand, Centurion, Halfway House. I’m punctual, discreet, and obsessed with consent while we get obscene. Book via WhatsApp; say ‘touch’ and I’ll send rates and availability.",
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
    shortDescription:
      "Laughing one minute, riding you the next—oral, toys, and stamina that matches your filthy mouth.",
    fullDescription:
      "Nomsa 💋 I’m the one if you want fun that ends with both of us breathless. Teasing strip, sloppy head, then rounds until we’re spent—always consensual, always explicit. I come to you; we set limits together. Soweto, Eldos, Lenasia. Afternoons or early evenings. Message me with ‘tonight’ and how hard you want to go.",
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
    shortDescription:
      "Overnight stays—multiple rounds, shower breaks, and breakfast eyes when we’re finally done.",
    fullDescription:
      "Thabo. Some hunger doesn’t fit in an hour. I offer extended outcall nights: sex, sleep, repeat—everything negotiated upfront, condoms non-negotiable unless we’ve agreed otherwise with proof. Pretoria East, Faerie Glen, Moreleta. WhatsApp only; say ‘overnight’ and I’ll send rates and what I’m into.",
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
    shortDescription:
      "Slow head, slower strokes, sea air on the balcony between rounds—CBD when I’m back live.",
    fullDescription:
      "Zanele. Cape Town CBD, Sea Point, Green Point. Listing lapsed during a busy run—reposting soon. Same vibe: unhurried, explicit, worth the wait. Hit me when I’m live again.",
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
    shortDescription:
      "Seasoned, dominant energy—Durban North & surrounds; expired listing, back soon.",
    fullDescription:
      "Sipho. Twenty years of leaving clients wrecked in the best way. Listing expired but I’ll be back on Hook shortly. Durban North, Umhlanga. Save my number if you like it rough and respectful.",
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
      if (a.premium && !b.premium) return -1;
      if (!a.premium && b.premium) return 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

export const getExpiredAdverts = () =>
  adverts
    .filter((a) => a.status === "expired")
    .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());

export const getAdvertById = (id: string) => adverts.find((a) => a.id === id);

export const getPremiumAdverts = () => getActiveAdverts().filter((a) => a.premium);

export const getSuggestedAdverts = (excludeId: string, limit = 6): Advert[] => {
  return getActiveAdverts()
    .filter((a) => a.id !== excludeId)
    .slice(0, limit);
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

/** Suburbs per city — used for listing signup and filters. */
export const zimbabweCitySuburbs = {
  Harare: [
    "Borrowdale",
    "Highlands",
    "Mount Pleasant",
    "Avondale",
    "Mabelreign",
    "Highfield",
    "Mbare",
    "Budiriro",
    "Greendale",
    "Waterfalls",
  ],
  Bulawayo: [
    "Hillside",
    "Suburbs",
    "Kumalo",
    "Morningside",
    "Makokoba",
    "Cowdray Park",
    "Nkulumane",
    "Bradfield",
    "Burnside",
    "Paddonhurst",
  ],
  Chitungwiza: ["Seke", "Zengeza", "St Mary's", "Unit L", "Manyame Park"],
  Mutare: ["Murambi", "Chikanga", "Dangamvura", "Sakubva", "Yeovil"],
  Gweru: ["Mkoba", "Daylesford", "Southview", "Lundi Park", "Ascot"],
  Kwekwe: ["Mbizo", "Msasa Park", "Newtown", "Roasting Plant", "Fitchlea"],
  Kadoma: ["Rimuka", "Eiffel Flats", "Mornington", "Westview", "Cherrybank"],
  Masvingo: ["Mucheke", "Rujeko", "Rhodene", "Target Kopje", "Victoria Ranch"],
  Chinhoyi: ["Orange Grove", "Brundish", "Shackleton", "Gwayagwaya", "Hunyani"],
  Marondera: ["Paradise Park", "Winston Park", "Dombotombo", "Yellow City", "Ruzawi"],
  Norton: ["Knowe", "Katanga", "Twin Lakes", "Maridale", "Govans"],
  Chegutu: ["Pfupajena", "Hintonville", "Chakari", "Umvovo", "Chinengundu"],
  Zvishavane: ["Mandava", "Maglas", "Birthday", "Hillview", "Pote"],
  Bindura: ["Chipadze", "Aerodrome", "Low Density", "Chiwaridzo", "Brockley"],
  Beitbridge: ["Dulivhadzimu", "Messina", "Medium Density", "Holiday Inn Area", "Border Post Area"],
  Hwange: ["Empumalanga", "Baobab", "Number 1", "Number 2", "Number 3"],
  Kariba: ["Mahombekombe", "Nyamhunga", "Breezes", "Heights", "Cutty Sark"],
  Rusape: ["Vengere", "Castle Beacon", "Maglas", "Mabvazuva"],
  Chiredzi: ["Tshovani", "Hippo Valley", "Triangle", "Low Density"],
  "Victoria Falls": ["Chinotimba", "Mkhosana", "Low Density", "Aerodrome"],
  Gokwe: ["Mapfungautsi", "Sasame", "Green Valley", "Njelele"],
  Shurugwi: ["Sebanga", "Peak Mine", "Railway Block", "Ironsides"],
  Chipinge: ["Gaza", "Low Density", "Medium Density", "Stoddart"],
  Redcliff: ["Rutendo", "Torwood", "Millview", "Simbi Park"],
} as const satisfies Readonly<Record<ZimbabweCity, readonly string[]>>;

export function getSuburbsForCity(city: string): readonly string[] {
  return (zimbabweCitySuburbs as Record<string, readonly string[]>)[city] ?? [];
}

export function formatAdvertLocation(advert: { location: string; suburb?: string }): string {
  const s = advert.suburb?.trim();
  if (s) return `${s}, ${advert.location}`;
  return advert.location;
}

export const genders = ["All", "Female", "Male"] as const;

export const bodyTypes: (BodyType | "All")[] = ["All", "Fit", "Thick", "Average", "Slender"];
