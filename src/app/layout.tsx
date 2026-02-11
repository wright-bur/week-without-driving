import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Week Without Driving Confessional",
  description: "A 7-day reflection challenge and public confessional scroll."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-ink">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
