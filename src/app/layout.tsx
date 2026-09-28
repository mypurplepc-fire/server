import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Construction Cost Control",
  description: "Cost control for small construction companies",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
