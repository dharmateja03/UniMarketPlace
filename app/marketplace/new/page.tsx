import NewListingForm from "@/components/NewListingForm";

export default function NewListingPage() {
  return (
    <div>
      <h1>Post a Listing</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>
        Students will only see posts from verified university accounts.
      </p>
      <NewListingForm />
    </div>
  );
}
