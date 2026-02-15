export default function Loading() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-block" style={{ height: 32, width: 200, marginBottom: 8 }} />
      <div className="skeleton-block" style={{ height: 16, width: 300, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-block" style={{ height: 160, borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: 12 }}>
              <div className="skeleton-block" style={{ height: 14, width: "60%", marginBottom: 8 }} />
              <div className="skeleton-block" style={{ height: 12, width: "80%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
