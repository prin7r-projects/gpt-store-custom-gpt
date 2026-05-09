import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontFamily: "'Source Serif 4', Georgia, serif",
      backgroundColor: "#faf8f5",
      color: "#1a1a1a",
      textAlign: "center",
      padding: "2rem",
    }}>
      <h1 style={{ fontSize: "4rem", margin: "0 0 0.5rem", fontWeight: 300 }}>404</h1>
      <p style={{ fontSize: "1.25rem", margin: "0 0 2rem", maxWidth: "480px", lineHeight: 1.6 }}>
        That page doesn&apos;t exist. If you found us through a Store GPT, try the home page below.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "0.75rem 2rem",
          backgroundColor: "#1a1a1a",
          color: "#faf8f5",
          textDecoration: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        }}
      >
        Back to SeriousSequel
      </Link>
    </div>
  );
}
