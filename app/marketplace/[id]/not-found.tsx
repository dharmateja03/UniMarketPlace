import Link from "next/link";
import { Heading, Text, Em } from "@/components/ui/typography";

export default function ListingNotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <p style={{ fontSize: "48px", marginBottom: 16 }}>📦</p>
      <Heading as="h1" size="7">Listing not found</Heading>
      <Text as="p" size="3" color="muted" style={{ marginTop: 8, marginBottom: 24 }}>
        This listing may have been <Em>removed</Em> or the link is incorrect.
      </Text>
      <Link className="button primary" href="/marketplace">
        Browse marketplace
      </Link>
    </div>
  );
}
