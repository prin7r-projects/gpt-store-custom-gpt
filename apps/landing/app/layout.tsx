import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Found us in the GPT Store? Here's what serious help looks like.",
  description:
    "We publish productized custom GPTs in the OpenAI GPT Store as a discovery layer. The same teams behind the GPTs run real engagements with weekly checkpoints, owned workflows, and named deliverables.",
  metadataBase: new URL("https://gpt-store-custom-gpt.prin7r.com"),
  openGraph: {
    title: "After the GPT Store",
    description:
      "Productized custom GPTs in the OpenAI Store as the first conversation. Real engagements behind them.",
    url: "https://gpt-store-custom-gpt.prin7r.com",
    siteName: "After the GPT Store",
    locale: "en_US",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
