import Link from "next/link";
import { Heading, Text, Em } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <p style={{ fontSize: "48px", marginBottom: 16 }}>🔍</p>
      <Heading as="h1" size="7">Page not found</Heading>
      <Text as="p" size="3" color="muted" style={{ marginTop: 8, marginBottom: 24 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been <Em>moved</Em>.
      </Text>
      <Link className="button primary" href="/">
        Go home
      </Link>
    </div>
  );
}
