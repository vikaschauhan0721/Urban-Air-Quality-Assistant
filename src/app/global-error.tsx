"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h1>Saans encountered a critical error</h1>
        <p>Please reload the application to restore your saved air quality dashboard.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            border: "none",
            background: "#0f766e",
            color: "#ffffff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload Saans
        </button>
      </body>
    </html>
  );
}
