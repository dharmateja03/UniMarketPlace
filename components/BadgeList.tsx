import { Badge } from "@/lib/badges";

export default function BadgeList({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;

  return (
    <div className="badge-list">
      {badges.map((badge) => (
        <span key={badge.key} className={`user-badge ${badge.key}`}>
          {badge.icon} {badge.label}
        </span>
      ))}
    </div>
  );
}
