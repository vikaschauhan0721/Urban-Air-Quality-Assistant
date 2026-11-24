import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saans — Urban Air Quality Assistant",
  description:
    "Clear, honest daily choices to protect your family's lungs — starting with free steps first. Live India CPCB & US AQI, deterministic indoor impact math, and bilingual guidance.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "Saans — Urban Air Quality Assistant",
    description:
      "Location- and household-tailored low-emission routines, free indoor air hacks, and transparent PM2.5/CO2 impact math.",
    type: "website",
    siteName: "Saans",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saans — Urban Air Quality Assistant",
    description:
      "Breathe easier, one choice at a time. Live CPCB AQI & deterministic indoor air-quality plans.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
