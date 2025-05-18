import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClipIt - Video Clip Extractor",
  description: "Extract social media worthy clips from your videos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
