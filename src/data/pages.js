// Page data for the about / gallery / journal pages, extracted from the
// rendered mirror (http://localhost:8091/trova-travel.framer.website/*).
// Image URLs are the canonical framerusercontent.com CDN URLs (the mirror's
// proxied srcset candidates 404).

export const ABOUT = {
  badge: "About Us",
  title: "Where Every Journey Begins",
  sub: "Meet the passionate explorers, guides, and adventure enthusiasts creating unforgettable hiking experiences.",
  banner: "/img/eletD2JNrNULFGPfhz7cuyGQ8-dc3b93.png",
  story: {
    badge: "Our Story",
    paragraphs: [
      "API Touch began with a handful of weekend hikes among friends who wanted more than a walk in the woods. We were tired of generic itineraries and guides who treated every group the same. So we built something smaller — routes chosen with care, groups kept intentionally intimate, and a belief that the outdoors deserves more attention than a checklist.",
      "What started as informal weekend trips has become a small team of guides who know these mountains personally. Every hike we run is shaped by that same instinct — go slower, plan better, and treat every group like it's the only one we're guiding that week.",
    ],
    image: "/img/RdokshmS0mFgqNy40JF6QVYHxoU-c022b9.png",
  },
  why: {
    badge: "Why API Touch",
    title: ["What sets every", "trip apart"],
    body: "Thoughtfully crafted experiences that bring together adventure, connection, and the beauty of the outdoors in every journey.",
    banner: "/img/DSeT2ifT6plLUrqFksN1V5rvoJc-36b270.jpg",
    cards: [
      { title: "Local guides, not scripts", body: "Every route led by someone who's walked it before." },
      { title: "Small groups, real caps", body: "Never more than 8 hikers joining a single guide." },
      { title: "Chosen routes, not permits", body: "Fewer trails offered, each one picked on purpose." },
    ],
  },
  guides: {
    badge: "Our Guides",
    title: ["Experts who know", "every path"],
    body: "From hidden viewpoints to challenging climbs, our guides lead every journey with experience and care.",
    people: [
      { role: "lead guide", name: "Maren K.", image: "/img/9LRjdvq7qodL0yYahLpqgygYuk-c022b9.png" },
      { role: "coastal route specialist", name: "Sofia Bianchi", image: "/img/PIX3swnixBY1QBeWJeiz8FGXcHg-c022b9.png" },
      { role: "wilderness route guide", name: "Tane Ngata", image: "/img/eFPmr6b77HuvCwgMEuxw49Onc-c022b9.png" },
      { role: "forest & lowland guide", name: "Elena Voss", image: "/img/J38JqsFGNs4XeDU3Bsfpvkb1k-c022b9.png" },
      { role: "high-altitude guide", name: "Dawa Sherpa", image: "/img/HknwrzFX9yu9Amjf9HNmHaee8Yk-c022b9.png" },
      { role: "desert & canyon guide", name: "Yuki Tanaka", image: "/img/O7n6t6GKSa6vg2e4CeolaFt0-c022b9.png" },
    ],
  },
};

// 3-column masonry; every image renders 406px wide with an exact
// aspect ratio (width/height of the source file).
export const GALLERY = {
  badge: "Gallery",
  title: "Explore the Journey",
  sub: "A collection of breathtaking landscapes, meaningful moments, and unforgettable adventures waiting to inspire your next escape.",
  columns: [
    [
      { src: "/img/zFAVjhAqdjFpMrm7nOAQjbHChM4-339e70.jpg", w: 896, h: 1152 },
      { src: "/img/8DnPG0ky3Fo13hEsc80rfleWmo-c769c1.jpg", w: 1024, h: 1024 },
      { src: "/img/FQzqMGdBoJbKxHELrjbP1GPe0-3d84e1.jpg", w: 1248, h: 832 },
      { src: "/img/60ioZwOh48dho1umQUVMdKewdE-3d84e1.jpg", w: 1248, h: 832 },
      { src: "/img/GPSrigAgoEU2OU15Meoz77ziUw-e37b9d.jpg", w: 864, h: 1184 },
    ],
    [
      { src: "/img/H20t2UlF1HbZXncGKwHUyCazPwk-c769c1.jpg", w: 1024, h: 1024 },
      { src: "/img/Y4I3ptD9YsDTo6Vc4GeLFGL2zZc-3d84e1.jpg", w: 1248, h: 832 },
      { src: "/img/4WzHoyuQG37PnUyvBbKtaU700-e37b9d.jpg", w: 864, h: 1184 },
      { src: "/img/k9MkvI8xpUyM88mrQELcYQxInw-c769c1.jpg", w: 1024, h: 1024 },
      { src: "/img/bUA57OR2II2k1PqzhTWRuyCnbG4-3d84e1.jpg", w: 1248, h: 832 },
    ],
    [
      { src: "/img/v5nyoTWBMfBB1GntKSZQ2HCIAs-3d84e1.jpg", w: 1248, h: 832 },
      { src: "/img/BxJl4MaoPNuSYUlgMaFRVKrg8vU-e37b9d.jpg", w: 864, h: 1184 },
      { src: "/img/18kyoMAcCeYvr7BH5NVvlliRb8-3d84e1.jpg", w: 1248, h: 832 },
      { src: "/img/pfGyVHz52nccDlKhYabvnbBgs-c769c1.jpg", w: 1024, h: 1024 },
      { src: "/img/BGyQPO8SFCsl7zAOogdRQG3Rtg-3d84e1.jpg", w: 1248, h: 832 },
    ],
  ],
};

export const JOURNAL_PAGE = {
  badge: "Blog & Travel Guide",
  title: "Stories, Tips & Trail inspiration",
  sub: "Explore hiking guides, travel tips, destination highlights, and outdoor stories to inspire your next adventure.",
  featured: {
    tag: "Trip planning",
    read: "3 min read",
    title: "What we tell you before day one",
    href: "/blog/what-we-tell-you-before-day-one",
    image: "/img/NENgCJ6izkRDL4t6pG8ydu5abM-36b270.jpg",
  },
  categories: ["All", "Trip planning", "Guide notes", "Gear"],
  posts: [
    { tag: "Guide notes", read: "4 min read", title: "Why the same route feels different every season", href: "/blog/why-the-same-route-feels-different-every-season", image: "/img/QUqWUHn2rJ1LpPe4XycDXekcI0-36b270.jpg" },
    { tag: "Gear", read: "4 min read", title: "The gear we replace every year", href: "/blog/the-gear-we-replace-every-year", image: "/img/D6hhxyu1yvA3ktjfHLLQp39hGo-36b270.jpg" },
    { tag: "Guide notes", read: "4 min read", title: "When to turn a group around", href: "/blog/when-to-turn-a-group-around", image: "/img/LB8mF9nLMz2COnEkZJ8sN18k4M-36b270.jpg" },
    { tag: "Gear", read: "3 min read", title: "What actually goes in your pack", href: "/blog/what-actually-goes-in-your-pack", image: "/img/wEacF8wyJjiVnuzit9TMFQ2G0sw-36b270.jpg" },
    { tag: "Trip planning", read: "4 min read", title: "What eight days on foot actually changes", href: "/blog/what-eight-days-on-foot-actually-changes", image: "/img/QNXHdlqZw3aarEaU7hEjT7DdZZk-36b270.jpg" },
    { tag: "Trip planning", read: "4 min read", title: "What we look for in a campsite", href: "/blog/what-we-look-for-in-a-campsite", image: "/img/wOa2z7EWlsHWggwolHDiXaCMxmE-36b270.jpg" },
    { tag: "Guide notes", read: "4 min read", title: "How we choose a route", href: "/blog/how-we-pick-a-route", image: "/img/A80eHXIRREM5birbFvpWFn5E-36b270.jpg" },
    { tag: "Guide notes", read: "3 min read", title: "Reading a mountain before you climb it", href: "/blog/reading-a-mountain-before-you-climb-it", image: "/img/k54Jt90u1SbWB4REScNu4VTIVc-36b270.jpg" },
    { tag: "Trip planning", read: "3 min read", title: "Why we cap groups at eight", href: "/blog/why-we-cap-groups-at-eight", image: "/img/owzBIx6L2o5qYj65iVBUPi7GF6A-36b270.jpg" },
  ],
};
