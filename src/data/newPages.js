// Content for the pages added on top of the original Framer site.
// Existing copy is reused verbatim wherever the source already had a line
// for it (home sections, About, tours listing, footer, testimonials).

// ---------------------------------------------------------------------------
// Destinations (page + per-destination detail pages)
// ---------------------------------------------------------------------------

export const DESTINATIONS_PAGE = {
  badge: "Destinations",
  title: "Places worth the journey",
  sub: "Four corners of the map where we run our smallest groups. Pick the landscape first — the route, the pace and the places you sleep get built around it.",
  groups: ["Asia", "Europe", "Africa", "Oceania", "South America"],
};

// One entry per destination the agency operates in; `tours` holds tour slugs
// (see hikes.js) that run there.
export const DESTINATIONS_ALL = [
  {
    slug: "nepal",
    name: "Nepal",
    region: "Nepal · Himalaya",
    continent: "Asia",
    image: "/img/abc.jpg",
    alt: "Traveller standing on a rocky outcrop above layered mountain ridges at sunset",
    body: "A week inside the Annapurna massif: terraced rice fields, Gurung villages, and mornings above the cloud line at 4,130 m. You sleep in tea houses, so the pack stays light and a hot meal is waiting at the end of every day.",
    attractions: ["Annapurna Base Camp", "Poon Hill sunrise", "Gurung villages of Ghandruk", "Machhapuchhre ridge"],
    activities: ["Tea-house trekking", "Village homestays", "Sunrise viewpoints", "Porter-supported days"],
    bestTime: ["March – April", "October – November", "Clear mornings, warm days", "Rhododendron season in spring"],
    tours: ["annapurna-base-camp"],
  },
  {
    slug: "scotland",
    name: "Scotland",
    region: "Scotland · Highlands",
    continent: "Europe",
    image: "/img/west-highland-way.jpg",
    alt: "Two tents pitched on an open meadow beneath a mountain ridge at sunset",
    body: "Scotland's classic 150 km route from Glasgow to Fort William, across Rannoch Moor and the Devil's Staircase. Long summer light, empty glens, and a warm pub waiting at the end of each stage.",
    attractions: ["Rannoch Moor", "Devil's Staircase", "Loch Lomond shore", "Fort William"],
    activities: ["Waymarked trail walking", "Bagging a Munro", "Bunkhouse nights", "Pub stops in every village"],
    bestTime: ["May – June", "Long daylight in summer", "September for quiet glens", "Expect rain any month"],
    tours: ["west-highland-way"],
  },
  {
    slug: "germany",
    name: "Germany",
    region: "Germany · Black Forest",
    continent: "Europe",
    image: "/img/black-forest-ridge-trail.jpg",
    alt: "Small group walking a narrow trail through a tall pine forest",
    body: "Germany's Black Forest walked ridge to ridge above pine valleys and clock-making villages. The gentlest tour we run — short days, good food, and trails that start less than an hour from the airport.",
    attractions: ["Merkurius ridge trails", "Clock-making villages", "Black Forest cake stops", "Valley railway towns"],
    activities: ["Ridge walking", "Village overnights", "Short transfer days", "Local food stops"],
    bestTime: ["April – October", "May for long evenings", "October colour", "Closed-toe boots year round"],
    tours: ["black-forest-ridge-trail"],
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    region: "New Zealand · Fiordland",
    continent: "Oceania",
    image: "/img/milford-track.jpg",
    alt: "Two travellers resting on a rock above a misty forested valley",
    body: "Fiordland's finest walk in the world: rainforest, hanging valleys and Sutherland Falls over four days. The country stays green all year, and with huts booked and bags moved ahead, you only carry a day pack.",
    attractions: ["Sutherland Falls", "Mackinnon Pass", "Arthur Valley", "Milford Sound"],
    activities: ["Great Walk hut trekking", "Bag drop ahead of you", "Rainforest boardwalks", "Fiord day trip"],
    bestTime: ["October – April", "November – March for warmth", "Book huts months ahead", "Rain is part of it"],
    tours: ["milford-track"],
  },
  {
    slug: "peru",
    name: "Peru",
    region: "Peru · Andes",
    continent: "South America",
    image: "/img/machu-picchu.jpg",
    alt: "",
    body: "From hidden valleys to iconic summits, explore tours designed for curious minds and adventurous spirits.",
    attractions: ["Machu Picchu", "Sun Gate approach", "Andean trail towns", "Sacred Valley"],
    activities: ["High-altitude trekking", "Ruins at first light", "Local market days", "Train transfer out"],
    bestTime: ["May – September", "Dry season on the trail", "June for clear skies", "Pack for cold nights"],
    tours: ["inca-trail-to-machu-picchu"],
  },
  {
    slug: "chile",
    name: "Chile",
    region: "Chile · Patagonia",
    continent: "South America",
    image: "/img/torres-del-paine-circuit.jpg",
    alt: "",
    body: "Four corners of the map where we run our smallest groups. Pick the landscape first — the route, the pace and the places you sleep get built around it.",
    attractions: ["Torres del Paine towers", "Grey Glacier", "French Valley", "Lake Pehoé"],
    activities: ["Circuit trekking", "Refugio nights", "Windy ridge days", "Glacier viewpoints"],
    bestTime: ["November – March", "Southern summer", "Book refugios early", "Wind every day of the year"],
    tours: ["torres-del-paine-circuit"],
  },
  {
    slug: "italy",
    name: "Italy",
    region: "Italy · Liguria",
    continent: "Europe",
    image: "/img/cinque-terre-coastal-trail.jpg",
    alt: "",
    body: "From hidden valleys to iconic summits, explore tours designed for curious minds and adventurous spirits.",
    attractions: ["The five villages", "Coastal stairways", "Harbour terraces", "Cliff-top vineyards"],
    activities: ["Coastal path walking", "Swim stops", "Village dinners", "Short transfer days"],
    bestTime: ["April – June", "September – October", "Avoid August crowds", "Warm sea into autumn"],
    tours: ["cinque-terre-coastal-trail"],
  },
  {
    slug: "france",
    name: "France",
    region: "France · Alps",
    continent: "Europe",
    image: "/img/tour-du-mont-blanc.jpg",
    alt: "",
    body: "Four corners of the map where we run our smallest groups. Pick the landscape first — the route, the pace and the places you sleep get built around it.",
    attractions: ["Mont Blanc massif", "Chamonix valley", "Alpine meadows", "Refuge stops"],
    activities: ["Circle trekking", "Cable-car start days", "Cheese stops in every col", "Hut-to-hut walking"],
    bestTime: ["Late June – September", "July for open passes", "September for quiet trails", "Snow above 2,500 m early"],
    tours: ["tour-du-mont-blanc"],
  },
  {
    slug: "tanzania",
    name: "Tanzania",
    region: "Tanzania · Kilimanjaro",
    continent: "Africa",
    image: "/img/mount-kilimanjaro.jpg",
    alt: "",
    body: "From hidden valleys to iconic summits, explore tours designed for curious minds and adventurous spirits.",
    attractions: ["Kili summit at 5,895 m", "Shira plateau", "Machame route camps", "Rainforest gate"],
    activities: ["High-altitude trekking", "Sunrise summit push", "Camp nights above the clouds", "Slow acclimatisation days"],
    bestTime: ["January – March", "June – October", "Dry underfoot", "Cold and clear at the top"],
    tours: ["mount-kilimanjaro"],
  },
  {
    slug: "iceland",
    name: "Iceland",
    region: "Iceland · Highlands",
    continent: "Europe",
    image: "/img/laugavegur-trail.jpg",
    alt: "",
    body: "Four corners of the map where we run our smallest groups. Pick the landscape first — the route, the pace and the places you sleep get built around it.",
    attractions: ["Landmannalaugar rhyolite", "Hekla views", "Hot spring rivers", "Black lava fields"],
    activities: ["Hut-to-hut trekking", "River crossings", "Soaking at the end of the day", "Midnight sun walking"],
    bestTime: ["Late June – early September", "Midnight sun", "Snow-free highlands", "Book huts ahead"],
    tours: ["laugavegur-trail"],
  },
];

// ---------------------------------------------------------------------------
// Experiences (page 6)
// ---------------------------------------------------------------------------

export const EXPERIENCES_PAGE = {
  badge: "Experiences",
  title: "See what the journey feels like",
  sub: "Every photo captures part of the journey—the people, places, and moments that make every adventure worth remembering.",
};

export const EXPERIENCES = [
  {
    slug: "trekking",
    title: "Trekking",
    body: "From peaceful forest walks to challenging mountain summits, discover adventures made for every kind of explorer.",
    image: "/img/FQzqMGdBoJbKxHELrjbP1GPe0-3d84e1.jpg",
  },
  {
    slug: "adventure",
    title: "Adventure",
    body: "Guided expeditions to wild peaks, hidden coastlines, and forests few ever reach.",
    image: "/img/60ioZwOh48dho1umQUVMdKewdE-3d84e1.jpg",
  },
  {
    slug: "culture",
    title: "Culture",
    body: "Explore remote landscapes, local stories, and unforgettable moments waiting beyond the next ridge.",
    image: "/img/bUA57OR2II2k1PqzhTWRuyCnbG4-3d84e1.jpg",
  },
  {
    slug: "wildlife",
    title: "Wildlife",
    body: "Every photo captures part of the journey—the people, places, and moments that make every adventure worth remembering.",
    image: "/img/v5nyoTWBMfBB1GntKSZQ2HCIAs-3d84e1.jpg",
  },
  {
    slug: "pilgrimage",
    title: "Pilgrimage",
    body: "From hidden valleys to iconic summits, explore tours designed for curious minds and adventurous spirits.",
    image: "/img/18kyoMAcCeYvr7BH5NVvlliRb8-3d84e1.jpg",
  },
  {
    slug: "honeymoon",
    title: "Honeymoon",
    body: "Small groups, expert local guides, and routes most people never find on their own.",
    image: "/img/H20t2UlF1HbZXncGKwHUyCazPwk-c769c1.jpg",
  },
  {
    slug: "family",
    title: "Family travel",
    body: "The gentlest tour we run — short days, good food, and trails that start less than an hour from the airport.",
    image: "/img/Y4I3ptD9YsDTo6Vc4GeLFGL2zZc-3d84e1.jpg",
  },
];

// Which travel type each tour is filed under (used by the tours filters).
export const EXPERIENCE_BY_TOUR = {
  "annapurna-base-camp": "trekking",
  "inca-trail-to-machu-picchu": "culture",
  "cinque-terre-coastal-trail": "family",
  "mount-kilimanjaro": "adventure",
  "black-forest-ridge-trail": "family",
  "milford-track": "trekking",
  "torres-del-paine-circuit": "adventure",
  "tour-du-mont-blanc": "trekking",
  "west-highland-way": "trekking",
  "laugavegur-trail": "adventure",
};

// ---------------------------------------------------------------------------
// Services (page 7) — the three home cards plus the rest of the list
// ---------------------------------------------------------------------------

export const SERVICES_PAGE = {
  badge: "Services",
  title: "Everything sorted before you go",
  sub: "Three things every trip needs, taken off your list — visas, flights and rooms booked, confirmed, and sent to you as one itinerary.",
  body: "From local guides and trailhead transfers to meals, gear, and small groups, every detail is thoughtfully arranged before you arrive.",
  extra: [
    {
      title: "Transportation",
      body: "Trailhead to trailhead, no detours",
      note: "Airport pick-up, trailhead transfers and the return leg, all booked on the same itinerary.",
      image: "/img/3GCyVYdlNAmCVUUaBGEwCGt3LYc-a6d13a.png",
    },
    {
      title: "Permits",
      body: "Visas, transit stops and permits, all of it before you book anything else.",
      note: "Park entries, trail permits and restricted-area paperwork lodged with your dates already confirmed.",
      image: "",
    },
    {
      title: "Travel insurance",
      body: "Cover for the unexpected — delays, medical care and days you cannot walk.",
      note: "Arranged with your booking so the paperwork is done before you leave home.",
      image: "",
    },
  ],
  cta: "Plan Your Tour",
  ctaHref: "/plan-your-trip",
};

// ---------------------------------------------------------------------------
// Plan Your Trip (page 8) — form reuses the contact page's controls
// ---------------------------------------------------------------------------

export const PLAN_TRIP = {
  badge: "Plan your trip",
  title: ["Let's plan your", "next adventure"],
  sub: "Tell us the destination, the dates and who is coming — we come back with a route, a price and the dates that fit.",
  info: [
    { label: "Response Time", value: "We reply within 24 hours" },
    { label: "Group size", value: "Never more than 8 per guide" },
    { label: "Email", value: "email@API Touch.com" },
    { label: "Phone", value: "+1 (970) 555-0148" },
  ],
  form: {
    name: { label: "Full Name", placeholder: "John Smith " },
    email: { label: "Email", placeholder: "you@company.com" },
    destination: { label: "Which destination are you thinking about?", options: [] },
    date: { label: "When are you thinking of going?" },
    group: { label: "Group size", options: ["1 – 2 travellers", "3 – 4 travellers", "5 – 6 travellers", "7 – 8 travellers"] },
    preferences: { label: "What are you after?", options: ["Trekking", "Adventure", "Culture", "Wildlife", "Pilgrimage", "Honeymoon", "Family travel"] },
    budget: { label: "Budget per person", options: ["Under $1,000", "$1,000 – $2,000", "$2,000 – $4,000", "$4,000+"] },
    message: { label: "Message", placeholder: "Tell us about your adventure" },
    submit: "Submit",
  },
};

// ---------------------------------------------------------------------------
// Cancellation & Refund Policy (page 19)
// ---------------------------------------------------------------------------

export const CANCELLATION = {
  slug: "cancellation-refund",
  title: "Cancellation & Refund Policy",
  updated: "",
  sections: [
    {
      heading: "",
      paragraphs: [
        "Plans change. These rules set out what happens when you cancel, when we do, and what comes back to you either way.",
      ],
    },
    {
      heading: "Cancelling by you",
      paragraphs: [
        "Tell us in writing, by email, and the date we receive it is the date your cancellation takes effect.",
        "More than 30 days before departure: full refund of everything you have paid, less any flights already ticketed.",
        "Between 30 and 14 days before departure: 50% of the tour price is retained to cover guides and lodging already held for you.",
        "Less than 14 days before departure: the tour price is non-refundable, but you can move the booking to new dates at no extra cost.",
      ],
    },
    {
      heading: "Changing your dates",
      paragraphs: [
        "Yes, up to 14 days before departure, no extra cost.",
        "One date change per booking is free. After that a $50 amendment fee applies.",
      ],
    },
    {
      heading: "If we cancel",
      paragraphs: [
        "If we cannot run the trip — not enough guides, a closed trail, a permit refused — you get a full refund, including the deposit, or you can move the whole booking to any other departure with space.",
        "We never hold your money back when the cancellation is on us.",
      ],
    },
    {
      heading: "Weather and trail closures",
      paragraphs: [
        "Guides know the alternate routes and adjust the day. Turning a day around is not a cancellation and is not refundable.",
        "If a route is closed for the whole trip, the section in this policy for cancellations by us applies.",
      ],
    },
    {
      heading: "Flights and hotels",
      paragraphs: [
        "Air tickets follow the airline's own rules and are usually non-refundable once issued — we tell you the fare conditions before you pay.",
        "Hotel rooms are held under this policy up to the cancellation deadline shown on your booking confirmation.",
      ],
    },
    {
      heading: "How refunds are paid",
      paragraphs: [
        "Refunds go back to the original payment method within 10 working days of the cancellation being confirmed.",
      ],
    },
    {
      heading: "Questions",
      paragraphs: [
        "Write to us before you cancel if you are unsure which window you are in — we would rather change your dates than keep a deposit.",
      ],
    },
  ],
};
