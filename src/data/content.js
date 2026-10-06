// Homepage content extracted from the rendered mirror
// (http://localhost:8091/trova-travel.framer.website/index.html).
// Image URLs are the canonical post-hydration framerusercontent.com URLs.
// CMS-backed cards (hikes / experience / journal) all resolve to one picsum
// seed in the hydrated DOM, so that single seed is used for every one of them.

export const IMG = {
  logo: "/logo-white.png",
  logoDark: "/logo.png",
  hero: "/img/PnKFFZTDtprKUgpnJfcXRmdKbw-dc3b93.png",
  contact: "/img/SKEOxyccXWzDnPBCqes8OKxWFE-36b270.jpg",
  about: "/img/JlclD7cUSGbFs5da7U2YZ0Jfo-e3f5d8.png",
  polaroid1: "/img/STbQ0TTQSrsZiFejlw0ISo8f8Cg-d589c2.png",
  polaroid2: "/img/kyESw1RHyMdsAjTFdft5SBan1g-37340a.png",
  polaroid3: "/img/VrrJ1dN3SN22nkPBDkuTXuLC8-d589c2.png",
  cms: "https://picsum.photos/seed/apitouch-1WphCNug7C7HhqPwXrQTT0M2KE97bd/900/700",
  included100: "/img/b8N0lZkrOvU8l5k66vVr97WwF6M-a6d13a.png",
  includedTransfers: "/img/3GCyVYdlNAmCVUUaBGEwCGt3LYc-a6d13a.png",
  guide: "/img/9LRjdvq7qodL0yYahLpqgygYuk-c022b9.png",
  testimonial: "/img/Lb7a9F2Y442x6WewlTOqDC6JVF0-784858.png",
  avatar1: "/img/Tb2IyWFVhCYJMmLVbyfHF949LoQ-cd2d3e.png",
  avatar2: "/img/rminNLvD1Ra33ajEBBIbdkyDw-cd2d3e.png",
  footer: "/img/tbrfdtrrgntbKXktgPNJCVV5rI-dc3b93.png",
};

export const CONTACT = {
  badge: "Contact us",
  title: ["Let's plan your", "next adventure"],
  image: IMG.contact,
  imageAlt: "Misty forest trail background for the AP",
  info: [
    { label: "Email", value: "email@API Touch.com" },
    { label: "Phone", value: "+1 (970) 555-0148" },
    { label: "Location", value: "Aspen, Colorado, USA" },
    { label: "Response Time", value: "We reply within 24 hours" },
  ],
  form: {
    name: { label: "Full Name", placeholder: "John Smith " },
    email: { label: "Email", placeholder: "you@company.com" },
    hike: {
      label: "Which tour are you thinking about?",
      options: [
        "Annapurna Base Camp",
        "Inca Trail to Machu Picchu",
        "Mount Kilimanjaro",
        "Cinque Terre Coastal Trail",
        "Black Forest Ridge Trail",
        "Milford Track",
        "Torres del Paine Circuit",
        "Tour du Mont Blanc",
        "West Highland Way",
        "Laugavegur Trail",
      ],
    },
    date: { label: "When are you thinking of going?" },
    message: { label: "Message", placeholder: "Tell us about your adventure" },
    submit: "Submit",
  },
};

// Per-route document head, mirroring the original pages.
export const PAGES = {
  "/": {
    title: "API Touch — Guided Hiking Trips & Outdoor Adventure Travel",
    description:
      "Discover guided hiking trips, scenic mountain trails, curated outdoor adventures, and stress-free trip planning with API Touch.",
  },
  "/contact": {
    title: "Contact API Touch — Plan Your Guided Hiking Trip",
    description:
      "Contact API Touch to plan a guided hiking trip, ask about routes, group sizes, dates, and outdoor adventure travel support.",
  },
  "/about": {
    title: "About API Touch — Our Story & Guides",
    description:
      "Learn about API Touch’s approach to guided hiking trips, curated routes, local expertise, and thoughtful outdoor adventure planning.",
  },
  "/gallery": {
    title: "Hiking Photo Gallery — API Touch",
    description:
      "Explore API Touch’s hiking photo gallery with scenic trails, camps, mountain landscapes, and outdoor adventure moments from guided trips.",
  },
  "/blog": {
    title: "Blog & Travel Guide, Trip Stories & Tips — API Touch",
    description:
      "Hiking guides, packing tips, and stories from the road. Inspiration for your next guided expedition.",
  },
  "/tours": {
    title: "Tours & Packages — API Touch",
    description:
      "Browse every API Touch tour and travel package, filtered by destination, duration, budget and travel type.",
  },
  "/destinations": {
    title: "Destinations — API Touch",
    description:
      "Explore the destinations API Touch operates in, organised by location, with attractions, activities and tour packages.",
  },
  "/experiences": {
    title: "Experiences — API Touch",
    description:
      "Browse trips by travel purpose — trekking, adventure, culture, wildlife, pilgrimage, honeymoon and family travel.",
  },
  "/services": {
    title: "Travel Services — API Touch",
    description:
      "Hotel booking, flight tickets, transportation, visa assistance, permits and travel insurance, arranged before you leave home.",
  },
  "/plan-your-trip": {
    title: "Plan Your Trip — API Touch",
    description:
      "Send API Touch your destination, dates, group size, preferences and budget, and get a route and a price back.",
  },
  "/why-apitouch": {
    title: "Why API Touch — Local Expertise & Small Groups",
    description:
      "Local expertise, personalized service, experienced guides, safety and support — what sets every API Touch trip apart.",
  },
  "/reviews": {
    title: "Reviews — API Touch",
    description:
      "Customer testimonials and traveller experiences from API Touch tours and guided hiking trips.",
  },
  "/faq": {
    title: "FAQ — API Touch",
    description:
      "Answers about bookings, payments, cancellations, visas, accommodation, transportation and travel with API Touch.",
  },
};

// `menu: "destinations"` marks the one entry that opens the nav mega-menu
// instead of navigating (the panel itself links through to the page).
export const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Destinations", href: "/destinations", menu: "destinations" },
  { label: "Our Package", href: "/tours", menu: "packages" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
];
export const HERO = {
  eyebrow: "Global Expeditions · Est. Wild",
  title: "Go Where the Trail Ends",
  cta: "Find your next tour",
  ctaHref: "/tours",
  sub: "Guided expeditions to wild peaks, hidden coastlines, and forests few ever reach.",
  image: IMG.hero,
  imageAlt: "Hiker overlooking a mountain trail, repr",
};

export const ABOUT = {
  badge: "About us",
  title: ["Uncover the", "Stories Hidden in", "Every Landscape"],
  body: "API Touch is a hiking agency built for people who want to go further. Small groups, expert local guides, and routes most people never find on their own.",
  cta: "Our story",
  ctaHref: "/about",
  stats: [
    { label: "Years running", value: "12+ years" },
    { label: "Miles Explored", value: "5000+" },
    { label: "Destinations", value: "38 worldwide" },
  ],
  image: IMG.about,
  cardTitle: "Every trip, a new story",
  cardBody: "From summit to valley — every path has something to say.",
  polaroids: [IMG.polaroid1, IMG.polaroid2, IMG.polaroid3],
};

export const HIKES_SECTION = {
  badge: "Our tours",
  title: ["Discover What Awaits", "Beyond the Path"],
  body: "From hidden valleys to iconic summits, explore tours designed for curious minds and adventurous spirits.",
  cta: "Browse all tours",
  ctaHref: "/tours",
};

export const HIKES = [
  {
    slug: "annapurna-base-camp",
    chips: ["Moderate", "5 Days"],
    title: "Annapurna Base Camp",
    href: "/tours/annapurna-base-camp",
    image: "/img/abc.jpg",
    alt: "Annapurna Base Camp hiking gallery image showing scenic trai",
  },
  {
    slug: "inca-trail-to-machu-picchu",
    chips: ["Tough", "4 Days"],
    title: "Inca Trail to Machu Picchu",
    href: "/tours/inca-trail-to-machu-picchu",
    image: "/img/machu-picchu.jpg",
    alt: "Inca Trail to Machu Picchu guided hiking",
  },
  {
    slug: "cinque-terre-coastal-trail",
    chips: ["Easy", "3 Days"],
    title: "Cinque Terre Coastal Trail",
    href: "/tours/cinque-terre-coastal-trail",
    image: "/img/cinque-terre-coastal-trail.jpg",
    alt: "Cinque Terre Coastal Trail guided hiking",
  },
  {
    slug: "mount-kilimanjaro",
    chips: ["Tough", "6 Days"],
    title: "Mount Kilimanjaro",
    href: "/tours/mount-kilimanjaro",
    image: "/img/mount-kilimanjaro.jpg",
    alt: "Mount Kilimanjaro guided hiking trip her",
  },
];

// Alternating "Our destinations" rows: image on one side, heading + copy on the other.
export const DESTINATIONS_SECTION = {
  badge: "Our destinations",
  title: ["Places worth", "the journey"],
  body: "Four corners of the map where we run our smallest groups. Pick the landscape first — the route, the pace and the places you sleep get built around it.",
};

export const DESTINATIONS = [
  {
    slug: "nepal",
    region: "Nepal · Himalaya",
    title: "Annapurna Base Camp",
    body: "A week inside the Annapurna massif: terraced rice fields, Gurung villages, and mornings above the cloud line at 4,130 m. You sleep in tea houses, so the pack stays light and a hot meal is waiting at the end of every day.",
    image: "/img/abc.jpg",
    alt: "Traveller standing on a rocky outcrop above layered mountain ridges at sunset",
  },
  {
    slug: "scotland",
    region: "Scotland · Highlands",
    title: "West Highland Way",
    body: "Scotland's classic 150 km route from Glasgow to Fort William, across Rannoch Moor and the Devil's Staircase. Long summer light, empty glens, and a warm pub waiting at the end of each stage.",
    image: "/img/60ioZwOh48dho1umQUVMdKewdE-3d84e1.jpg",
    alt: "Two tents pitched on an open meadow beneath a mountain ridge at sunset",
  },
  {
    slug: "germany",
    region: "Germany · Black Forest",
    title: "Black Forest Ridge Trail",
    body: "Germany's Black Forest walked ridge to ridge above pine valleys and clock-making villages. The gentlest tour we run — short days, good food, and trails that start less than an hour from the airport.",
    image: "/img/bUA57OR2II2k1PqzhTWRuyCnbG4-3d84e1.jpg",
    alt: "Small group walking a narrow trail through a tall pine forest",
  },
  {
    slug: "new-zealand",
    region: "New Zealand · Fiordland",
    title: "Milford Track",
    body: "Fiordland's finest walk in the world: rainforest, hanging valleys and Sutherland Falls over four days. The country stays green all year, and with huts booked and bags moved ahead, you only carry a day pack.",
    image: "/img/v5nyoTWBMfBB1GntKSZQ2HCIAs-3d84e1.jpg",
    alt: "Two travellers resting on a rock above a misty forested valley",
  },
];

export const INCLUDED_SECTION = {
  badge: "What's included",
  title: ["What makes the", "experience different"],
  body: "From local guides and trailhead transfers to meals, gear, and small groups, every detail is thoughtfully arranged before you arrive.",
};

// Feature (mist) cards: icon + heading + copy
export const INCLUDED_FEATURES = {
  guiding: { icon: "2784223275", title: "Guiding", body: "A local lead on every route, start to finish" },
  gear: { icon: "1118047839", title: "Gear", body: "Tents, mats and cookware, already packed" },
  meals: { icon: "50407791", title: "Meals", body: "Fresh meals and snacks, ready every day" },
  groups: { icon: "2109778876", title: "Small groups", body: "Never more than 8 hikers per guide, every time" },
};

// Photo cards: image + heading + one-line caption
export const INCLUDED_PHOTOS = {
  transfers: { image: IMG.includedTransfers, title: "Transfers", body: "Trailhead to trailhead, no detours" },
  always: { image: IMG.included100, title: "100%", body: "Local guides on every trip" },
};

export const EXPERIENCE_SECTION = {
  badge: "Experience",
  title: ["See what the", "journey feels like"],
  body: "Every photo captures part of the journey—the people, places, and moments that make every adventure worth remembering.",
  cta: "See More Moments",
  ctaHref: "/gallery",
};

export const EXPERIENCE_IMAGES = [
  { src: IMG.cms, alt: "" },
  { src: IMG.cms, alt: "" },
  { src: IMG.cms, alt: "" },
  { src: IMG.cms, alt: "" },
];

export const GUIDE_SECTION = {
  badge: "Who are we",
  title: ["Meet the people", "behind the path"],
  body1: "Our guides grew up walking these mountains, long before it was a job. They know which route fits your pace and what you actually need on the trail — whether it's your first multi-day tour or your tenth.",
  body2: "They adjust to whoever shows up. Beginners get the full walkthrough, gear to footing, no assumptions made. Experienced hikers get pushed further, faster, with less hand-holding. Either way, you're walking with someone who knows the ground.",
  points: [
    { icon: "2327548604", title: "WFR-Certified", body: "WFR-certified guides, 5+ years leading multi-day routes." },
    { icon: "535953797", title: "Small groups", body: "Max 8 hikers per guide. Real attention on the trail." },
  ],
  image: IMG.guide,
  imageAlt: "API Touch travel guide preview showing c",
  role: "lead guide",
  name: "Maren K.",
};

export const SERVICES_SECTION = {
  badge: "Services",
  title: ["Everything sorted", "before you go"],
  body: "Three things every trip needs, taken off your list — visas, flights and rooms booked, confirmed, and sent to you as one itinerary.",
  cta: "Plan your tour",
  ctaHref: "/plan-your-trip",
};

export const SERVICES = [
  {
    icon: "2327548604",
    title: "Visas",
    body: "Your passport checked against every entry rule on the route, then the applications lodged — visas, transit stops and permits, all of it before you book anything else.",
  },
  {
    icon: "1403532491",
    title: "Air Ticketing",
    body: "Flights shaped around the route: a day of buffer before day one, and layovers that leave room for delayed bags or a missed connection.",
  },
  {
    icon: "4159562592",
    title: "Hotel Booking",
    body: "Pre- and post-tour stays in the quiet, central rooms we use every season — reserved, paid and confirmed with your dates before you leave home.",
  },
];

export const TESTIMONIAL_SECTION = {
  badge: "Testimonials",
  title: ["The memories speak", "for themselves"],
  body: "Honest reflections from people who explored the trail with API Touch and experienced it for themselves, creating memories that truly last.",
};

export const FEATURED_QUOTE = {
  quote: "\"I came for the mountains, but I left with memories I'll never forget. Every trail, every viewpoint, and every conversation made this journey feel truly special.\"",
  name: "Emily Carter",
  trip: "Milford Track",
  image: IMG.testimonial,
};

export const REVIEWS = [
  {
    title: "Every step felt worth it",
    body: "I've done plenty of tours before, but this one stood out. The route was stunning, the guide knew every hidden viewpoint, and the small group made it easy to connect with everyone. It felt less like a package and more like an adventure with friends",
    name: "Sofia Williams",
    trip: "Annapurna Base Camp",
    avatar: IMG.avatar1,
  },
  {
    title: "Memories that stayed with me",
    body: "Watching the sunrise from the peak was unforgettable, but what made the trip special was the people. The guide created such a welcoming atmosphere that even solo travelers felt like part of the group from day one.",
    name: "Liam Carter",
    trip: "Mount Kilimanjaro",
    avatar: IMG.avatar2,
  },
];

export const JOURNAL_SECTION = {
  badge: "Travel Journal",
  title: ["Stories, Tips &", "Trail inspiration"],
  body: "Explore hiking guides, travel tips, destination highlights, and outdoor stories to inspire your next adventure.",
  cta: "Explore Journal",
  ctaHref: "/blog",
};

export const JOURNAL = [
  {
    tags: ["guide notes", "3 min read"],
    title: "What we tell you before day one",
    href: "/blog/what-we-tell-you-before-day-one",
    image: IMG.cms,
    alt: "Guide reviewing a paper map with a small",
  },
  {
    tags: ["guide notes", "4 min read"],
    title: "Why the same route feels different every season",
    href: "/blog/why-the-same-route-feels-different-every-season",
    image: IMG.cms,
    alt: "Seasonal shift along a familiar path on ",
  },
  {
    tags: ["guide notes", "4 min read"],
    title: "The gear we replace every year",
    href: "/blog/the-gear-we-replace-every-year",
    image: IMG.cms,
    alt: "Guide safety gear including rope and fir",
  },
];

export const FAQ_SECTION = {
  badge: "FAQ",
  title: ["Good to know", "before you go"],
  body: "From packing lists to trail difficulty, here's everything you need to feel prepared.",
  cta: "Get in touch",
  ctaHref: "/contact",
};

export const FAQS = [
  { q: "How experienced do I need to be?", a: "If you can walk a few hours on uneven ground, you're ready." },
  { q: "How many people are in a group?", a: "Usually 6 to 8— small enough to stay quiet." },
  { q: "What should I bring?", a: "A packing list goes out once you book, built around the season ahead." },
  { q: "What happens if the weather turns?", a: "Guides know the alternate routes and adjust the day." },
  { q: "Can I change my dates after booking?", a: "Yes, up to 14 days before departure, no extra cost." },
];

export const FOOTER = {
  title: ["Your next adventure", "starts here"],
  body: "Explore remote landscapes, local stories, and unforgettable moments waiting beyond the next ridge.",
  cta: "Explore Tours",
  ctaHref: "/tours",
  background: IMG.footer,
  backgroundAlt: "Scenic mountain trail background in the ",
  subline: "Guided tours, breathtaking trails, and unforgettable moments—all thoughtfully crafted in one place.",
  copyright: "© 2026 API Touch",
  columns: [
    { label: "Navigation", links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ] },
    { label: "CMS", links: [
      { label: "Tours", href: "/tours" },
      { label: "Gallery", href: "/gallery" },
      { label: "Blog", href: "/blog" },
    ] },
    { label: "Legal page", links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms Of Service", href: "/terms-of-service" },
    ] },
    // `href: null` marks a link whose destination does not exist yet — the
    // footer renders it as a disabled placeholder instead of a live anchor.
    { label: "Social", links: [
      { label: "Facebook", href: null },
      { label: "Instagram", href: null },
      { label: "YouTube", href: null },
    ] },
  ],
};
