import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import NewBundleForm from "@/components/NewBundleForm";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

export default async function NewBundlePage() {
  const userId = getCurrentUserId();
  const listings = await prisma.listing.findMany({
    where: { userId, status: "AVAILABLE", bundleId: null },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <Heading as="h1" size="7">Create a Bundle</Heading>
          <Text as="p" size="2" color="muted" style={{ marginTop: 8 }}>
            Group your listings into a <Em>moving out sale</Em> or <Strong>bundle deal</Strong>.
          </Text>
        </div>
      </div>
      <div className="form-layout">
        <div className="panel">
          <NewBundleForm listings={listings} />
        </div>
        <aside className="side-stack">
          <div className="panel">
            <Heading as="h3" size="3">Bundle tips</Heading>
            <Text as="p" size="2" color="muted">
              Bundles with a <Strong>discount sell faster</Strong>. Group related items together and offer <Em>10-20% off</Em> the total.
            </Text>
          </div>
        </aside>
      </div>
    </div>
  );
}
