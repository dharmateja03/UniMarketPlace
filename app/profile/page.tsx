import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export default async function ProfilePage() {
  const userId = getCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { listings: true }
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <div className="panel" style={{ marginTop: 16 }}>
        <h3>{user.name}</h3>
        <p>{user.universityEmail}</p>
        <p style={{ color: "var(--muted)" }}>Listings: {user.listings.length}</p>
      </div>

      <h2 className="section-title">Your Listings</h2>
      <div className="card-grid">
        {user.listings.map((listing) => (
          <div className="card" key={listing.id}>
            <p className="tag">{listing.transactionType}</p>
            <h3>{listing.title}</h3>
            <p>{listing.campus}</p>
          </div>
        ))}
        {!user.listings.length && (
          <div className="card">
            <p>You have not posted a listing yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
