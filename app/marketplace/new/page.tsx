import Link from "next/link";
import NewListingForm from "@/components/NewListingForm";
import { Package, ShieldCheck, TrendingUp, Upload } from "lucide-react";

export default function NewListingPage() {
  return (
    <div className="post-listing-page">
      <div className="post-form-layout">
        <div className="panel post-form-card">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
              <Upload className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="post-form-title" style={{ marginBottom: 0 }}>Post a Listing</h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Fill in the details below to list your item on campus.{" "}
            <Link href="/marketplace/bulk" className="text-accent font-semibold hover:underline">
              Moving out? Bulk upload &rarr;
            </Link>
          </p>
          <NewListingForm />
        </div>
        <aside className="post-form-sidebar">
          <div className="panel">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold">Posting Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">1.</span>
                Use 3-6 clear photos — listings with photos sell 4x faster
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">2.</span>
                Set a fair price based on similar campus listings
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">3.</span>
                Add pickup details and respond within 24h
              </li>
            </ul>
          </div>
          <div className="panel">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-semibold">Safety</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Meet in public campus spots and keep communication inside UniHub when possible.
            </p>
          </div>
          <div className="panel">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold">Popular Categories</h3>
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
