import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateReportStatus } from "@/app/actions";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

export default async function ModerationPage() {
  const reports = await prisma.report.findMany({
    include: { listing: true, reporter: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <Heading as="h1" size="7">Moderation Queue</Heading>
      <Text as="p" size="2" color="muted" style={{ marginTop: 8 }}>
        Review reports and update status.
      </Text>
      <div className="card-grid">
        {reports.map((report) => (
          <div key={report.id} className="card">
            <div className="card-body">
              <p className="tag">{report.status}</p>
              <h3>{report.listing.title}</h3>
              <Text as="p" size="1" color="muted">Reason: <Strong>{report.reason}</Strong></Text>
              {report.details && <Text as="p" size="1" color="muted">Details: <Em>{report.details}</Em></Text>}
              <Text as="p" size="1" color="muted">Reporter: <Strong>{report.reporter.name}</Strong></Text>
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
            <Text as="p" size="2" color="muted">No reports yet.</Text>
          </div>
        )}
      </div>
    </div>
  );
}
