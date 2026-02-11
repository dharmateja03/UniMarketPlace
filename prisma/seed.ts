import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "alex@student.edu" },
    update: {},
    create: {
      id: "demo-user",
      name: "Alex Rivera",
      email: "alex@student.edu",
      universityEmail: "alex@campus.edu",
      imageUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400"
    }
  });

  const secondUser = await prisma.user.upsert({
    where: { email: "jordan@student.edu" },
    update: {},
    create: {
      id: "demo-user-2",
      name: "Jordan Lee",
      email: "jordan@student.edu",
      universityEmail: "jordan@campus.edu",
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
      userId: demoUser.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200"
          }
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
        create: [
          { userId: demoUser.id },
          { userId: secondUser.id }
        ]
      },
      messages: {
        create: [
          {
            senderId: secondUser.id,
            body: "Is this still available? I can meet on campus this week."
          },
          {
            senderId: demoUser.id,
            body: "Yep! I am free Wednesday afternoon after 3pm."
          }
        ]
      }
    }
  });

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
      userId: secondUser.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200"
          }
        ]
      }
    }
  });

  await prisma.conversation.update({
    where: { id: convo.id },
    data: { messages: { create: { senderId: secondUser.id, body: "Awesome, I will DM you details." } } }
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
