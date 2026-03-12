export type Advert = {
  id: string;
  name: string;
  age: number;
  location: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  phone: string;
  whatsapp: string;
  email?: string;
  images: string[];
  profileImage: string;
  postedAt: string;
  expiresAt: string;
  status: "active" | "expired";
  featured?: boolean;
};

export const adverts: Advert[] = [
  {
    id: "1",
    name: "Sarah Dlamini",
    age: 32,
    location: "Sandton, Johannesburg",
    category: "Cleaning",
    shortDescription: "Professional home cleaner with 8 years of experience. Thorough, reliable, and uses eco-friendly products.",
    fullDescription:
      "I am a professional home cleaner with over 8 years of experience serving clients across Sandton and surrounding areas. I specialise in deep cleaning, regular maintenance cleans, and move-in/move-out services. I use eco-friendly, non-toxic products that are safe for children and pets. My services include kitchen deep cleans, bathroom scrubbing, floor mopping and vacuuming, window cleaning, and laundry. I bring all my own supplies and equipment. References available on request. Available Monday to Saturday, 8am–5pm.",
    phone: "+27 82 123 4567",
    whatsapp: "27821234567",
    email: "sarah.dlamini@email.com",
    images: ["/images/service-1.jpg", "/images/provider-1.jpg"],
    profileImage: "/images/provider-1.jpg",
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
    category: "Plumbing",
    shortDescription: "Licensed plumber. Leaks, burst pipes, installations, and drain unblocking. Fast response, fair prices.",
    fullDescription:
      "I am a fully licensed plumber with 15 years of hands-on experience. I handle everything from small leaks and dripping taps to full bathroom installations, burst pipes, and blocked drains. I provide upfront quotes with no hidden costs. Available for emergency callouts 7 days a week. I cover Randburg, Roodepoort, Northgate, and surrounding areas. All work is guaranteed and I carry full public liability insurance.",
    phone: "+27 83 234 5678",
    whatsapp: "27832345678",
    email: "mike.nkosi@email.com",
    images: ["/images/service-2.jpg", "/images/provider-2.jpg"],
    profileImage: "/images/provider-2.jpg",
    postedAt: "2025-03-07T14:00:00Z",
    expiresAt: "2025-04-06T14:00:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Lerato Mokoena",
    age: 27,
    location: "Fourways, Johannesburg",
    category: "Hairdressing",
    shortDescription: "Mobile hairdresser. Hair cuts, colour, braids, and treatments at your home. Flexible hours.",
    fullDescription:
      "I am a qualified mobile hairdresser offering a full range of hair services in the comfort of your own home. Services include haircuts, blow-dries, colour and highlights, braiding, relaxers, and deep conditioning treatments. I come fully equipped with all professional tools and products. I cater for women, men, and children. Available evenings and weekends to suit your schedule. I serve Fourways, Douglasdale, Lonehill, and Sunninghill.",
    phone: "+27 84 345 6789",
    whatsapp: "27843456789",
    images: ["/images/service-3.jpg", "/images/provider-3.jpg"],
    profileImage: "/images/provider-3.jpg",
    postedAt: "2025-03-06T10:00:00Z",
    expiresAt: "2025-04-05T10:00:00Z",
    status: "active",
  },
  {
    id: "4",
    name: "David Sithole",
    age: 38,
    location: "Midrand, Johannesburg",
    category: "Electrical",
    shortDescription: "Registered electrician. Fault finding, DB boards, lighting, plugs, and COC certificates.",
    fullDescription:
      "I am a registered electrician with the ECA (Electrical Contractors Association). I handle all domestic electrical work including fault finding, DB board upgrades, new plug and light installations, geyser connections, security lighting, and Certificates of Compliance (COC). All work complies with SANS 10142. I provide free quotes and carry full insurance. Serving Midrand, Centurion, Halfway House, and surrounding areas.",
    phone: "+27 85 456 7890",
    whatsapp: "27854567890",
    email: "david.sithole@email.com",
    images: ["/images/provider-4.jpg", "/images/service-1.jpg"],
    profileImage: "/images/provider-4.jpg",
    postedAt: "2025-03-05T08:00:00Z",
    expiresAt: "2025-04-04T08:00:00Z",
    status: "active",
  },
  {
    id: "5",
    name: "Nomsa Khumalo",
    age: 29,
    location: "Soweto, Johannesburg",
    category: "Tutoring",
    shortDescription: "Maths and Science tutor for Grade 8–12. Home visits available. Matric pass rate 100%.",
    fullDescription:
      "I am a qualified Maths and Physical Science teacher with a passion for helping learners reach their full potential. I offer one-on-one and small group tutoring sessions at your home for Grade 8 to Grade 12. I focus on understanding concepts, not just memorising. I have a 100% matric pass rate with all my private students over the past 3 years. Sessions are 1.5 hours each. I cover Soweto, Eldorado Park, and Lenasia.",
    phone: "+27 86 567 8901",
    whatsapp: "27865678901",
    email: "nomsa.khumalo@email.com",
    images: ["/images/provider-1.jpg", "/images/service-3.jpg"],
    profileImage: "/images/provider-1.jpg",
    postedAt: "2025-03-04T11:00:00Z",
    expiresAt: "2025-04-03T11:00:00Z",
    status: "active",
  },
  {
    id: "6",
    name: "Thabo Molefe",
    age: 41,
    location: "Pretoria East",
    category: "Gardening",
    shortDescription: "Experienced gardener. Lawn mowing, pruning, planting, and garden maintenance. Weekly contracts available.",
    fullDescription:
      "I have 12 years of experience maintaining private and commercial gardens across Pretoria East. My services include lawn mowing and edging, hedge and tree pruning, weeding, planting seasonal flowers and shrubs, irrigation installation and maintenance, and general garden clean-ups. I bring my own tools and can arrange my own transport. Weekly, fortnightly, or once-off bookings available. Serving Faerie Glen, Garsfontein, Moreleta Park, and The Willows.",
    phone: "+27 87 678 9012",
    whatsapp: "27876789012",
    images: ["/images/provider-2.jpg", "/images/service-2.jpg"],
    profileImage: "/images/provider-2.jpg",
    postedAt: "2025-03-03T07:00:00Z",
    expiresAt: "2025-04-02T07:00:00Z",
    status: "active",
  },
  {
    id: "7",
    name: "Zanele Zulu",
    age: 35,
    location: "Cape Town CBD",
    category: "Cleaning",
    shortDescription: "Deep cleaning and post-construction cleans. Airbnb turnovers welcome. Available 7 days.",
    fullDescription:
      "I specialise in deep cleans, post-construction cleans, and Airbnb turnovers. I am reliable, thorough, and available 7 days a week. I have a team of 2 available for large properties. All cleaning products and equipment provided. I serve Cape Town CBD, Sea Point, Green Point, Waterfront, and De Waterkant. References available from happy Airbnb hosts.",
    phone: "+27 82 789 0123",
    whatsapp: "27827890123",
    email: "zanele.zulu@email.com",
    images: ["/images/service-1.jpg", "/images/provider-3.jpg"],
    profileImage: "/images/provider-3.jpg",
    postedAt: "2025-03-02T09:00:00Z",
    expiresAt: "2025-03-09T09:00:00Z",
    status: "expired",
  },
  {
    id: "8",
    name: "Sipho Ndlovu",
    age: 50,
    location: "Durban North",
    category: "Plumbing",
    shortDescription: "Senior plumber with 20 years experience. Specialises in hot water systems and bathroom renovations.",
    fullDescription:
      "With 20 years in the trade, I specialise in hot water systems (solar, heat pump, and conventional), bathroom renovations, and underground leak detection. I am fully licensed and insured. I provide detailed written quotes before any work begins. Available for scheduled and emergency jobs across Durban North, La Lucia, and Umhlanga.",
    phone: "+27 83 890 1234",
    whatsapp: "27838901234",
    images: ["/images/provider-2.jpg", "/images/service-2.jpg"],
    profileImage: "/images/provider-2.jpg",
    postedAt: "2025-02-20T08:00:00Z",
    expiresAt: "2025-02-27T08:00:00Z",
    status: "expired",
  },
];

export const getActiveAdverts = () =>
  adverts
    .filter((a) => a.status === "active")
    .sort((a, b) => {
      // Featured adverts always sort first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Within the same group, sort by most recently posted
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

export const getExpiredAdverts = () =>
  adverts.filter((a) => a.status === "expired").sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());

export const getAdvertById = (id: string) => adverts.find((a) => a.id === id);

export const categories = ["All", "Cleaning", "Plumbing", "Electrical", "Hairdressing", "Tutoring", "Gardening"];
