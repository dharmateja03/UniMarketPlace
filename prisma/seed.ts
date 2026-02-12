import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "alex@student.edu" },
    update: { isVerified: true },
    create: {
      id: "demo-user",
      name: "Alex Rivera",
      email: "alex@student.edu",
      universityEmail: "alex@campus.edu",
      campus: "Main Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400"
    }
  });

  const secondUser = await prisma.user.upsert({
    where: { email: "jordan@student.edu" },
    update: { isVerified: true },
    create: {
      id: "demo-user-2",
      name: "Jordan Lee",
      email: "jordan@student.edu",
      universityEmail: "jordan@campus.edu",
      campus: "North Campus",
      isVerified: true,
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400"
    }
  });

  const listing = await prisma.listing.upsert({
    where: { id: "demo-listing" },
    update: {},
    create: {
      id: "demo-listing",
      title: "MacBook Air M2 (2023)",
      description: "Lightly used, comes with charger and case. Battery cycle count under 60.",
      priceCents: 85000,
      category: "Electronics",
      condition: "Like New",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: demoUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200" }
        ]
      }
    }
  });

  const convo = await prisma.conversation.upsert({
    where: { id: "demo-convo" },
    update: {},
    create: {
      id: "demo-convo",
      listingId: listing.id,
      participants: {
        create: [{ userId: demoUser.id }, { userId: secondUser.id }]
      },
      messages: {
        create: [
          { senderId: secondUser.id, body: "Is this still available? I can meet on campus this week." },
          { senderId: demoUser.id, body: "Yep! I am free Wednesday afternoon after 3pm." }
        ]
      }
    }
  });

  // Housing listing with new fields
  await prisma.listing.upsert({
    where: { id: "demo-listing-2" },
    update: {},
    create: {
      id: "demo-listing-2",
      title: "Studio sublet for summer",
      description: "Furnished studio near north gate. Utilities included. June to August.",
      priceCents: 120000,
      category: "Housing",
      condition: "Furnished",
      campus: "North Campus",
      transactionType: "RENT",
      rentalPeriodDays: 90,
      deliveryOptions: ["MEETUP"],
      userId: secondUser.id,
      moveInDate: new Date("2026-06-01"),
      moveOutDate: new Date("2026-08-31"),
      furnished: true,
      roommates: 0,
      petsAllowed: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-3" },
    update: {},
    create: {
      id: "demo-listing-3",
      title: "Road bike - great for commuting",
      description: "Aluminum frame, tuned brakes, includes helmet and lock.",
      priceCents: 28000,
      category: "Bikes",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP"],
      userId: demoUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-4" },
    update: {},
    create: {
      id: "demo-listing-4",
      title: "Standing desk - adjustable height",
      description: "Electric sit/stand desk, 55-inch tabletop, cable tray.",
      priceCents: 19000,
      category: "Furniture",
      condition: "Like New",
      campus: "South Campus",
      transactionType: "SELL",
      deliveryOptions: ["PICKUP"],
      userId: secondUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-5" },
    update: {},
    create: {
      id: "demo-listing-5",
      title: "Calculus & Physics textbook bundle",
      description: "Both in good condition, light highlighting.",
      priceCents: 6500,
      category: "Books",
      condition: "Good",
      campus: "North Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: demoUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-6" },
    update: {},
    create: {
      id: "demo-listing-6",
      title: "DSLR camera kit for weekend rental",
      description: "Canon DSLR with two lenses. Weekend rental, deposit required.",
      priceCents: 4500,
      category: "Electronics",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "RENT",
      rentalPeriodDays: 2,
      deliveryOptions: ["MEETUP"],
      userId: secondUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1519183071298-a2962e4023c9?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-7" },
    update: {},
    create: {
      id: "demo-listing-7",
      title: "Campus graduation gown rental",
      description: "Gown + cap for May ceremony. Fits 5'7\"–5'11\".",
      priceCents: 3000,
      category: "Clothing",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "RENT",
      rentalPeriodDays: 3,
      deliveryOptions: ["MEETUP"],
      userId: demoUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-8" },
    update: {},
    create: {
      id: "demo-listing-8",
      title: "Microwave + mini fridge set",
      description: "Perfect for dorm room. Both cleaned and working.",
      priceCents: 9000,
      category: "Appliances",
      condition: "Good",
      campus: "South Campus",
      transactionType: "SELL",
      deliveryOptions: ["PICKUP", "DELIVERY"],
      userId: secondUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1200" },
          { url: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.listing.upsert({
    where: { id: "demo-listing-9" },
    update: {},
    create: {
      id: "demo-listing-9",
      title: "Club concert tickets (2)",
      description: "Friday night show. Digital transfer immediately.",
      priceCents: 7000,
      category: "Tickets",
      condition: "New",
      campus: "North Campus",
      transactionType: "SELL",
      deliveryOptions: ["DELIVERY"],
      userId: demoUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1200" }
        ]
      }
    }
  });

  // Free listing
  await prisma.listing.upsert({
    where: { id: "demo-listing-free" },
    update: {},
    create: {
      id: "demo-listing-free",
      title: "Moving out - free desk lamp",
      description: "Works perfectly, just don't need it anymore. First come first serve!",
      priceCents: 0,
      category: "Furniture",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "SELL",
      deliveryOptions: ["MEETUP", "PICKUP"],
      userId: demoUser.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?q=80&w=1200" }
        ]
      }
    }
  });

  // Housing listing with roommates
  await prisma.listing.upsert({
    where: { id: "demo-listing-housing" },
    update: {},
    create: {
      id: "demo-listing-housing",
      title: "2BR apartment - roommate needed",
      description: "Looking for a roommate for fall semester. Shared bathroom, great location near campus.",
      priceCents: 85000,
      category: "Housing",
      condition: "Good",
      campus: "Main Campus",
      transactionType: "RENT",
      rentalPeriodDays: 120,
      deliveryOptions: ["MEETUP"],
      userId: demoUser.id,
      moveInDate: new Date("2026-08-15"),
      moveOutDate: new Date("2026-12-15"),
      furnished: true,
      roommates: 1,
      petsAllowed: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200" }
        ]
      }
    }
  });

  await prisma.conversation.update({
    where: { id: convo.id },
    data: { messages: { create: { senderId: secondUser.id, body: "Awesome, I will DM you details." } } }
  });

  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: "Smooth pickup, great condition!",
        sellerId: demoUser.id,
        reviewerId: secondUser.id,
        listingId: listing.id
      },
      {
        rating: 4,
        comment: "Responsive seller and fair price.",
        sellerId: demoUser.id,
        reviewerId: secondUser.id
      }
    ]
  });

  await prisma.savedListing.create({
    data: {
      userId: secondUser.id,
      listingId: listing.id
    }
  });

  await prisma.report.create({
    data: {
      listingId: listing.id,
      reporterId: secondUser.id,
      reason: "Suspected scam",
      details: "Price seems too low, please review."
    }
  });

  // Follow: Jordan follows Alex
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: secondUser.id,
        followingId: demoUser.id,
      },
    },
    update: {},
    create: {
      followerId: secondUser.id,
      followingId: demoUser.id,
    },
  });

  // Transaction: Jordan bought the bike from Alex
  await prisma.transaction.upsert({
    where: {
      listingId_buyerId: {
        listingId: "demo-listing-3",
        buyerId: secondUser.id,
      },
    },
    update: {},
    create: {
      listingId: "demo-listing-3",
      sellerId: demoUser.id,
      buyerId: secondUser.id,
      priceCents: 28000,
    },
  });

  // Bundle: Alex's moving out sale
  const bundle = await prisma.bundle.upsert({
    where: { id: "demo-bundle" },
    update: {},
    create: {
      id: "demo-bundle",
      title: "Alex's Moving Out Sale",
      description: "Graduating and need to clear everything. Take it all for a discount!",
      discountPercent: 15,
      userId: demoUser.id,
    },
  });

  // Add some listings to the bundle
  await prisma.listing.updateMany({
    where: { id: { in: ["demo-listing-5", "demo-listing-free"] } },
    data: { bundleId: bundle.id },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
