import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateReportStatus } from "@/app/actions";

export default async function ModerationPage() {
  const reports = await prisma.report.findMany({
    include: { listing: true, reporter: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1>Moderation Queue</h1>
      <p className="meta" style={{ marginTop: 8 }}>
        Review reports and update status.
      </p>
      <div className="card-grid">
        {reports.map((report) => (
          <div key={report.id} className="card">
            <div className="card-body">
              <p className="tag">{report.status}</p>
              <h3>{report.listing.title}</h3>
              <p className="meta">Reason: {report.reason}</p>
              {report.details && <p className="meta">Details: {report.details}</p>}
              <p className="meta">Reporter: {report.reporter.name}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <form action={updateReportStatus.bind(null, report.id, "UNDER_REVIEW")}>
                  <button className="button" type="submit">Under review</button>
                </form>
                <form action={updateReportStatus.bind(null, report.id, "RESOLVED")}>
                  <button className="button primary" type="submit">Resolve</button>
                </form>
                <Link className="button" href={`/marketplace/${report.listingId}`}>
                  View listing
                </Link>
              </div>
            </div>
          </div>
        ))}
        {!reports.length && (
          <div className="card">
            <p>No reports yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
