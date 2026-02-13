"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="listing-success-page">
      <div className="listing-success-card">
        <div className="listing-success-icon" style={{ background: "color-mix(in srgb, #dc3545 12%, transparent)" }}>
          <span style={{ color: "#dc3545" }}>!</span>
        </div>
        <h1>Something went wrong</h1>
        <p className="meta" style={{ maxWidth: 360, margin: "0 auto 24px" }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="listing-success-actions">
          <button className="button primary" onClick={reset}>
            Try Again
          </button>
          <a className="button" href="/">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
