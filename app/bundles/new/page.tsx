import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import NewBundleForm from "@/components/NewBundleForm";

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
          <h1>Create a Bundle</h1>
          <p className="meta" style={{ marginTop: 8 }}>
            Group your listings into a moving out sale or bundle deal.
          </p>
        </div>
      </div>
      <div className="form-layout">
        <div className="panel">
          <NewBundleForm listings={listings} />
        </div>
        <aside className="side-stack">
          <div className="panel">
            <h3>Bundle tips</h3>
            <p className="meta">
              Bundles with a discount sell faster. Group related items together and offer 10-20% off the total.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
