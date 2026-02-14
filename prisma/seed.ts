import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Users ──
  const alex = await prisma.user.upsert({
    where: { email: "alex@student.edu" },
    update: { isVerified: true },
    create: {
      id: "demo-user",
      name: "Alex Rivera",
      email: "alex@student.edu",
      universityEmail: "alex@campus.edu",
      campus: "Main Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400",
    },
  });

  const jordan = await prisma.user.upsert({
    where: { email: "jordan@student.edu" },
    update: { isVerified: true },
    create: {
      id: "demo-user-2",
      name: "Jordan Lee",
      email: "jordan@student.edu",
      universityEmail: "jordan@campus.edu",
      campus: "North Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@student.edu" },
    update: {},
    create: {
      id: "demo-user-3",
      name: "Priya Sharma",
      email: "priya@student.edu",
      universityEmail: "priya@campus.edu",
      campus: "South Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: "marcus@student.edu" },
    update: {},
    create: {
      id: "demo-user-4",
      name: "Marcus Chen",
      email: "marcus@student.edu",
      universityEmail: "marcus@campus.edu",
      campus: "Main Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    },
  });

  const sofia = await prisma.user.upsert({
    where: { email: "sofia@student.edu" },
    update: {},
    create: {
      id: "demo-user-5",
      name: "Sofia Martinez",
      email: "sofia@student.edu",
      universityEmail: "sofia@campus.edu",
      campus: "North Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
    },
  });

  const tyler = await prisma.user.upsert({
    where: { email: "tyler@student.edu" },
    update: {},
    create: {
      id: "demo-user-6",
      name: "Tyler Brooks",
      email: "tyler@student.edu",
      universityEmail: "tyler@campus.edu",
      campus: "South Campus",
      isVerified: false,
    },
  });

  console.log("✓ 6 users seeded");

  // ── Listings ──

  // Electronics
  const macbook = await prisma.listing.upsert({
    where: { id: "seed-macbook" },
    update: {},
    create: {
      id: "seed-macbook",
      title: "MacBook Air M2 (2023)",
      description: "Lightly used, comes with charger and case. Battery cycle count under 60. Perfect for CS students.",
      priceCents: 85000,
      category: "Electronics",
      condition: "Like New",
      campus: "Main Campus",
      transactionType: "SELL",
      flairs: ["Like New", "Price Negotiable"],
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: alex.id,
      viewCount: 47,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-ipad" },
    update: {},
    create: {
      id: "seed-ipad",
      title: "iPad Pro 11\" with Apple Pencil",
      description: "M1 chip, 256GB, Space Gray. Includes Apple Pencil 2nd gen and Magic Keyboard. Great for notes and drawing.",
      priceCents: 62000,
      category: "Electronics",
      condition: "Like New",
      campus: "Main Campus",
      transactionType: "SELL",
      flairs: ["Barely Used"],
      deliveryOptions: ["MEETUP"],
      userId: priya.id,
      viewCount: 32,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-airpods" },
    update: {},
    create: {
      id: "seed-airpods",
      title: "AirPods Pro 2 - sealed box",
      description: "Brand new, sealed. Got them as a gift but already have a pair.",
      priceCents: 18000,
      category: "Electronics",
      condition: "Brand New",
      campus: "North Campus",
      transactionType: "SELL",
      flairs: ["Brand New", "Final Price"],
      deliveryOptions: ["MEETUP", "DELIVERY"],
      userId: sofia.id,
      viewCount: 58,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-monitor" },
    update: {},
    create: {
      id: "seed-monitor",
      title: "Dell 27\" 4K Monitor",
      description: "USB-C, adjustable stand, excellent color. Selling because I'm graduating.",
      priceCents: 22000,
      originalPriceCents: 32000,
      discountPercent: 30,
      saleEndsAt: new Date("2026-03-01"),
      category: "Electronics",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      flairs: ["Must Go ASAP"],
      deliveryOptions: ["PICKUP"],
      userId: marcus.id,
      viewCount: 41,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-camera" },
    update: {},
    create: {
      id: "seed-camera",
      title: "Canon DSLR kit - weekend rental",
      description: "Canon EOS with two lenses (18-55mm, 50mm f/1.8). Weekend rental, $50 deposit required.",
      priceCents: 4500,
      category: "Electronics",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "RENT",
      rentalPeriodDays: 3,
      flairs: ["Price Negotiable"],
      deliveryOptions: ["MEETUP"],
      userId: jordan.id,
      viewCount: 29,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1519183071298-a2962e4023c9?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200" },
        ],
      },
    },
  });

  // Furniture
  await prisma.listing.upsert({
    where: { id: "seed-desk" },
    update: {},
    create: {
      id: "seed-desk",
      title: "Standing desk - electric adjustable",
      description: "FlexiSpot electric sit/stand desk, 55-inch bamboo top, cable management tray. Whisper quiet motor.",
      priceCents: 19000,
      category: "Furniture",
      condition: "Like New",
      campus: "South Campus",
      transactionType: "SELL",
      flairs: ["Barely Used", "Price Negotiable"],
      deliveryOptions: ["PICKUP"],
      userId: jordan.id,
      viewCount: 35,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-chair" },
    update: {},
    create: {
      id: "seed-chair",
      title: "Herman Miller Aeron (Size B)",
      description: "The holy grail of office chairs. Fully loaded, lumbar support. Bought it two years ago.",
      priceCents: 45000,
      category: "Furniture",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      flairs: ["Under a Year Old"],
      deliveryOptions: ["PICKUP"],
      userId: alex.id,
      viewCount: 62,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-bookshelf" },
    update: {},
    create: {
      id: "seed-bookshelf",
      title: "IKEA KALLAX shelf unit (white)",
      description: "4x4 cube shelf, perfect for dorm/apartment. Includes 4 drawer inserts. Disassembled for easy transport.",
      priceCents: 6000,
      category: "Furniture",
      condition: "Good",
      campus: "North Campus",
      transactionType: "SELL",
      flairs: ["Must Go ASAP"],
      deliveryOptions: ["PICKUP", "MEETUP"],
      userId: priya.id,
      viewCount: 18,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-lamp-free" },
    update: {},
    create: {
      id: "seed-lamp-free",
      title: "FREE - Desk lamp, works perfectly",
      description: "Moving out and don't need it. LED, adjustable brightness. First come first serve!",
      priceCents: 0,
      category: "Furniture",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      flairs: ["Must Go ASAP"],
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: marcus.id,
      viewCount: 24,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?q=80&w=1200" },
        ],
      },
    },
  });

  // Books
  await prisma.listing.upsert({
    where: { id: "seed-textbooks" },
    update: {},
    create: {
      id: "seed-textbooks",
      title: "Calculus & Linear Algebra bundle",
      description: "Stewart Calculus (8th ed) + Lay Linear Algebra (6th ed). Light highlighting, no tears. Save $100+.",
      priceCents: 6500,
      category: "Books",
      condition: "Good",
      campus: "North Campus",
      transactionType: "SELL",
      flairs: ["Price Negotiable"],
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: alex.id,
      viewCount: 22,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-orgo" },
    update: {},
    create: {
      id: "seed-orgo",
      title: "Organic Chemistry (Klein, 4th ed)",
      description: "No highlighting, barely opened it if I'm being honest. Comes with solutions manual.",
      priceCents: 4500,
      category: "Books",
      condition: "Like New",
      campus: "South Campus",
      transactionType: "SELL",
      flairs: ["Barely Used"],
      deliveryOptions: ["MEETUP"],
      userId: sofia.id,
      viewCount: 15,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-cs-books" },
    update: {},
    create: {
      id: "seed-cs-books",
      title: "CLRS Algorithms + Clean Code",
      description: "Introduction to Algorithms (3rd ed) + Clean Code by Robert C. Martin. Essential CS reads.",
      priceCents: 5000,
      category: "Books",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP", "DELIVERY"],
      userId: marcus.id,
      viewCount: 27,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200" },
        ],
      },
    },
  });

  // Bikes
  const bike = await prisma.listing.upsert({
    where: { id: "seed-bike" },
    update: {},
    create: {
      id: "seed-bike",
      title: "Road bike - great campus commuter",
      description: "Aluminum frame, recently tuned brakes and derailleurs. Includes helmet, U-lock, and lights.",
      priceCents: 28000,
      category: "Bikes",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      flairs: ["Price Negotiable"],
      deliveryOptions: ["MEETUP"],
      userId: alex.id,
      viewCount: 44,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-ebike" },
    update: {},
    create: {
      id: "seed-ebike",
      title: "Electric scooter - 20mi range",
      description: "Segway Ninebot Max. Holds charge well, top speed 18mph. Great for commuting across campus.",
      priceCents: 35000,
      category: "Bikes",
      condition: "Good",
      campus: "South Campus",
      transactionType: "SELL",
      flairs: ["Under a Year Old"],
      deliveryOptions: ["MEETUP"],
      userId: tyler.id,
      viewCount: 51,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200" },
        ],
      },
    },
  });

  // Clothing
  await prisma.listing.upsert({
    where: { id: "seed-jacket" },
    update: {},
    create: {
      id: "seed-jacket",
      title: "North Face puffer jacket (M)",
      description: "Black 700-fill down jacket. Wore it one season, washed and clean. Super warm.",
      priceCents: 12000,
      originalPriceCents: 25000,
      discountPercent: 50,
      saleEndsAt: new Date("2026-02-28"),
      category: "Clothing",
      condition: "Like New",
      campus: "North Campus",
      transactionType: "SELL",
      flairs: ["Like New"],
      deliveryOptions: ["MEETUP"],
      userId: sofia.id,
      viewCount: 33,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-grad-gown" },
    update: {},
    create: {
      id: "seed-grad-gown",
      title: "Graduation gown + cap rental",
      description: "Black gown + mortarboard cap. Fits 5'7\"–5'11\". Available for May ceremony weekend.",
      priceCents: 3000,
      category: "Clothing",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "RENT",
      rentalPeriodDays: 3,
      deliveryOptions: ["MEETUP"],
      userId: alex.id,
      viewCount: 19,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1200" },
        ],
      },
    },
  });

  // Appliances
  await prisma.listing.upsert({
    where: { id: "seed-microwave" },
    update: {},
    create: {
      id: "seed-microwave",
      title: "Microwave + mini fridge combo",
      description: "Perfect dorm essentials. Microwave 700W, fridge 3.2 cu ft. Both cleaned and working great.",
      priceCents: 9000,
      category: "Appliances",
      condition: "Good",
      campus: "South Campus",
      transactionType: "SELL",
      flairs: ["Must Go ASAP"],
      deliveryOptions: ["PICKUP", "DELIVERY"],
      userId: jordan.id,
      viewCount: 20,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-keurig" },
    update: {},
    create: {
      id: "seed-keurig",
      title: "Keurig K-Mini coffee maker",
      description: "Single serve, matte black. Includes 20 assorted K-cups. Perfect for early morning classes.",
      priceCents: 3500,
      category: "Appliances",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: priya.id,
      viewCount: 14,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200" },
        ],
      },
    },
  });

  // Tickets
  await prisma.listing.upsert({
    where: { id: "seed-concert" },
    update: {},
    create: {
      id: "seed-concert",
      title: "Spring Fling concert tickets (2)",
      description: "Can't make it anymore. Digital transfer immediately after payment. Front section.",
      priceCents: 7000,
      category: "Tickets",
      condition: "New",
      campus: "North Campus",
      transactionType: "SELL",
      flairs: ["Final Price"],
      deliveryOptions: ["DELIVERY"],
      userId: alex.id,
      viewCount: 39,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1200" },
        ],
      },
    },
  });

  // Services
  await prisma.listing.upsert({
    where: { id: "seed-tutoring" },
    update: {},
    create: {
      id: "seed-tutoring",
      title: "CS tutoring - Data Structures & Algorithms",
      description: "Senior CS major, 4.0 GPA. $25/hour on campus or Zoom. Helped 15+ students ace their exams.",
      priceCents: 2500,
      category: "Services",
      condition: "New",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP", "DELIVERY"],
      userId: marcus.id,
      viewCount: 56,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200" },
        ],
      },
    },
  });

  // Housing
  await prisma.listing.upsert({
    where: { id: "seed-studio" },
    update: {},
    create: {
      id: "seed-studio",
      title: "Furnished studio sublet - summer",
      description: "Bright studio near north gate. All utilities included. June through August. AC, in-unit laundry.",
      priceCents: 120000,
      category: "Housing",
      condition: "Furnished",
      campus: "North Campus",
      transactionType: "RENT",
      rentalPeriodDays: 90,
      deliveryOptions: ["MEETUP"],
      userId: jordan.id,
      moveInDate: new Date("2026-06-01"),
      moveOutDate: new Date("2026-08-31"),
      furnished: true,
      roommates: 0,
      petsAllowed: false,
      viewCount: 71,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-apartment" },
    update: {},
    create: {
      id: "seed-apartment",
      title: "2BR apartment - roommate needed",
      description: "Looking for a chill roommate for fall semester. Shared bathroom, 10 min walk to campus. Rent split is $850/mo.",
      priceCents: 85000,
      category: "Housing",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "RENT",
      rentalPeriodDays: 120,
      deliveryOptions: ["MEETUP"],
      userId: priya.id,
      moveInDate: new Date("2026-08-15"),
      moveOutDate: new Date("2026-12-15"),
      furnished: true,
      roommates: 1,
      petsAllowed: true,
      viewCount: 45,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200" },
        ],
      },
    },
  });

  // Free stuff
  await prisma.listing.upsert({
    where: { id: "seed-free-hangers" },
    update: {},
    create: {
      id: "seed-free-hangers",
      title: "FREE - 30+ plastic hangers",
      description: "Moving out, don't need them. Pickup from south dorms lobby.",
      priceCents: 0,
      category: "Furniture",
      condition: "Good",
      campus: "South Campus",
      transactionType: "SELL",
      flairs: ["Must Go ASAP"],
      deliveryOptions: ["PICKUP"],
      userId: tyler.id,
      viewCount: 8,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200" },
        ],
      },
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-free-plants" },
    update: {},
    create: {
      id: "seed-free-plants",
      title: "FREE - 3 potted succulents",
      description: "Healthy succulents in cute pots. Can't take them home over summer. Please give them a good home!",
      priceCents: 0,
      category: "Furniture",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP"],
      userId: sofia.id,
      viewCount: 31,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1200" },
        ],
      },
    },
  });

  console.log("✓ 25 listings seeded");

  // ── Conversations & Messages ──
  const convo1 = await prisma.conversation.upsert({
    where: { id: "seed-convo-1" },
    update: {},
    create: {
      id: "seed-convo-1",
      listingId: macbook.id,
      participants: {
        create: [{ userId: alex.id }, { userId: jordan.id }],
      },
      messages: {
        create: [
          { senderId: jordan.id, body: "Hey! Is the MacBook still available?" },
          { senderId: alex.id, body: "Yes! Battery health is at 96%. Want to meet on campus?" },
          { senderId: jordan.id, body: "Awesome, I can meet Wednesday after 3pm near the library." },
          { senderId: alex.id, body: "Perfect, see you there! I'll bring the charger and case too." },
        ],
      },
    },
  });

  await prisma.conversation.upsert({
    where: { id: "seed-convo-2" },
    update: {},
    create: {
      id: "seed-convo-2",
      listingId: bike.id,
      participants: {
        create: [{ userId: alex.id }, { userId: priya.id }],
      },
      messages: {
        create: [
          { senderId: priya.id, body: "Hi! Is the bike good for a 15 min commute?" },
          { senderId: alex.id, body: "Definitely, I used it daily for exactly that. Smooth ride." },
          { senderId: priya.id, body: "Would you take $250?" },
          { senderId: alex.id, body: "Meet me in the middle at $260?" },
          { senderId: priya.id, body: "Deal! When can I pick it up?" },
        ],
      },
    },
  });

  await prisma.conversation.upsert({
    where: { id: "seed-convo-3" },
    update: {},
    create: {
      id: "seed-convo-3",
      listingId: "seed-studio",
      participants: {
        create: [{ userId: jordan.id }, { userId: marcus.id }],
      },
      messages: {
        create: [
          { senderId: marcus.id, body: "Is the studio still available for June?" },
          { senderId: jordan.id, body: "Yes! Want to come see it this weekend?" },
          { senderId: marcus.id, body: "That would be great. Saturday afternoon works for me." },
        ],
      },
    },
  });

  console.log("✓ 3 conversations seeded");

  // ── Reviews ──
  await prisma.review.createMany({
    data: [
      { rating: 5, comment: "Smooth transaction, MacBook was exactly as described!", sellerId: alex.id, reviewerId: jordan.id, listingId: macbook.id },
      { rating: 4, comment: "Fair price, responsive seller. Would buy again.", sellerId: alex.id, reviewerId: priya.id, listingId: bike.id },
      { rating: 5, comment: "Super helpful and patient. Great person to deal with.", sellerId: alex.id, reviewerId: marcus.id },
      { rating: 5, comment: "Fast reply, met on time, item was perfect.", sellerId: jordan.id, reviewerId: alex.id, listingId: "seed-desk" },
      { rating: 4, comment: "Good textbooks, saved me a ton of money.", sellerId: sofia.id, reviewerId: priya.id, listingId: "seed-orgo" },
      { rating: 5, comment: "Excellent tutoring, helped me understand recursion!", sellerId: marcus.id, reviewerId: sofia.id, listingId: "seed-tutoring" },
      { rating: 3, comment: "Item was okay, a bit more worn than described.", sellerId: tyler.id, reviewerId: jordan.id, listingId: "seed-ebike" },
      { rating: 5, comment: "Amazing deal on the monitor. Thanks!", sellerId: marcus.id, reviewerId: alex.id, listingId: "seed-monitor" },
    ],
    skipDuplicates: true,
  });

  console.log("✓ 8 reviews seeded");

  // ── Saved Listings ──
  const savedPairs = [
    { userId: jordan.id, listingId: macbook.id },
    { userId: priya.id, listingId: "seed-chair" },
    { userId: priya.id, listingId: "seed-airpods" },
    { userId: marcus.id, listingId: "seed-studio" },
    { userId: marcus.id, listingId: bike.id },
    { userId: sofia.id, listingId: "seed-textbooks" },
    { userId: sofia.id, listingId: "seed-monitor" },
    { userId: alex.id, listingId: "seed-desk" },
    { userId: alex.id, listingId: "seed-ebike" },
    { userId: tyler.id, listingId: "seed-jacket" },
  ];

  for (const pair of savedPairs) {
    await prisma.savedListing.upsert({
      where: { userId_listingId: pair },
      update: {},
      create: pair,
    });
  }

  console.log("✓ 10 saved listings seeded");

  // ── Follows ──
  const followPairs = [
    { followerId: jordan.id, followingId: alex.id },
    { followerId: priya.id, followingId: alex.id },
    { followerId: marcus.id, followingId: alex.id },
    { followerId: alex.id, followingId: jordan.id },
    { followerId: sofia.id, followingId: jordan.id },
    { followerId: alex.id, followingId: priya.id },
    { followerId: jordan.id, followingId: marcus.id },
    { followerId: priya.id, followingId: sofia.id },
  ];

  for (const pair of followPairs) {
    await prisma.follow.upsert({
      where: { followerId_followingId: pair },
      update: {},
      create: pair,
    });
  }

  console.log("✓ 8 follows seeded");

  // ── Transactions ──
  await prisma.transaction.upsert({
    where: { listingId_buyerId: { listingId: bike.id, buyerId: priya.id } },
    update: {},
    create: {
      listingId: bike.id,
      sellerId: alex.id,
      buyerId: priya.id,
      priceCents: 26000,
    },
  });

  // Mark bike as sold
  await prisma.listing.update({
    where: { id: bike.id },
    data: { status: "SOLD" },
  });

  console.log("✓ 1 transaction seeded (bike sold)");

  // ── Offers ──
  await prisma.offer.createMany({
    data: [
      { amountCents: 75000, message: "Would you take $750? I can pick up today.", listingId: macbook.id, buyerId: marcus.id, sellerId: alex.id, status: "PENDING" },
      { amountCents: 80000, message: "How about $800? Cash.", listingId: macbook.id, buyerId: sofia.id, sellerId: alex.id, status: "PENDING" },
      { amountCents: 55000, message: "Can you do $550 for the iPad?", listingId: "seed-ipad", buyerId: jordan.id, sellerId: priya.id, status: "PENDING" },
      { amountCents: 40000, listingId: "seed-chair", buyerId: priya.id, sellerId: alex.id, status: "ACCEPTED" },
      { amountCents: 10000, message: "Would you take $100?", listingId: "seed-jacket", buyerId: tyler.id, sellerId: sofia.id, status: "DECLINED" },
    ],
    skipDuplicates: true,
  });

  console.log("✓ 5 offers seeded");

  // ── Reports ──
  await prisma.report.create({
    data: {
      listingId: "seed-concert",
      reporterId: tyler.id,
      reason: "Possible ticket scam",
      details: "Price seems too low for front section tickets. Might be fake.",
    },
  });

  console.log("✓ 1 report seeded");

  // ── Bundle ──
  const bundle = await prisma.bundle.upsert({
    where: { id: "seed-bundle" },
    update: {},
    create: {
      id: "seed-bundle",
      title: "Alex's Graduation Clearout",
      description: "Graduating and need to clear everything! Take multiple items for a discount.",
      discountPercent: 15,
      userId: alex.id,
    },
  });

  await prisma.listing.updateMany({
    where: { id: { in: ["seed-textbooks", "seed-grad-gown", "seed-concert"] } },
    data: { bundleId: bundle.id },
  });

  console.log("✓ 1 bundle seeded");
  console.log("\n🎉 Seed complete! 6 users, 25 listings, conversations, reviews, offers, and more.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
