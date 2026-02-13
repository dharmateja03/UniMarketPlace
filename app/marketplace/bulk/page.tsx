import Link from "next/link";
import BulkUploadForm from "@/components/BulkUploadForm";

export default function BulkUploadPage() {
  return (
    <div className="bulk-upload-page">
      <div className="bulk-upload-header">
        <h1>Bulk Upload</h1>
        <p className="meta" style={{ marginTop: 4 }}>
          Moving out? List multiple items at once. All items get the &quot;Must Go ASAP&quot; flair automatically.
        </p>
        <p className="meta" style={{ marginTop: 8 }}>
          <Link href="/marketplace/new" style={{ color: "var(--accent)", fontWeight: 600 }}>
            ← Single listing instead
          </Link>
        </p>
      </div>

      <BulkUploadForm />
    </div>
  );
}
