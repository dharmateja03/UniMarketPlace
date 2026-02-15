import Link from "next/link";
import NewListingForm from "@/components/NewListingForm";
import { CubeIcon, LockClosedIcon, RocketIcon, UploadIcon } from "@radix-ui/react-icons";
import { Text, Heading, Em, Strong } from "@/components/ui/typography";

export default function NewListingPage() {
  return (
    <div className="post-listing-page">
      <div className="post-form-layout">
        <div className="panel post-form-card">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
              <UploadIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <Heading as="h1" size="6" className="post-form-title" style={{ marginBottom: 0 }}>Post a Listing</Heading>
            </div>
          </div>
          <Text as="p" size="2" color="muted" className="mb-6">
            Fill in the details below to list your item on campus.{" "}
            <Link href="/marketplace/bulk" className="text-accent font-semibold hover:underline">
              <Em>Moving out? Bulk upload &rarr;</Em>
            </Link>
          </Text>
          <NewListingForm />
        </div>
        <aside className="post-form-sidebar">
          <div className="panel">
            <div className="flex items-center gap-2 mb-2">
              <RocketIcon className="w-4 h-4 text-accent" />
              <Heading as="h3" size="2" weight="medium">Posting Tips</Heading>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Text size="1" color="accent" className="mt-0.5"><Strong>1.</Strong></Text>
                <Text size="1" color="muted">Use <Strong>3-6 clear photos</Strong> — listings with photos sell <Em>4x faster</Em></Text>
              </li>
              <li className="flex items-start gap-2">
                <Text size="1" color="accent" className="mt-0.5"><Strong>2.</Strong></Text>
                <Text size="1" color="muted">Set a <Em>fair price</Em> based on similar campus listings</Text>
              </li>
              <li className="flex items-start gap-2">
                <Text size="1" color="accent" className="mt-0.5"><Strong>3.</Strong></Text>
                <Text size="1" color="muted">Add pickup details and respond within <Strong>24h</Strong></Text>
              </li>
            </ul>
          </div>
          <div className="panel">
            <div className="flex items-center gap-2 mb-2">
              <LockClosedIcon className="w-4 h-4 text-secondary" />
              <Heading as="h3" size="2" weight="medium">Safety</Heading>
            </div>
            <Text as="p" size="1" color="muted">
              Meet in <Em>public campus spots</Em> and keep communication inside UniHub when possible.
            </Text>
          </div>
          <div className="panel">
            <div className="flex items-center gap-2 mb-2">
              <CubeIcon className="w-4 h-4 text-accent" />
              <Heading as="h3" size="2" weight="medium">Popular Categories</Heading>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Electronics", "Books", "Furniture", "Housing", "Clothing", "Bikes"].map((cat) => (
                <span key={cat} className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
