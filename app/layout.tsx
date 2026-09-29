import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZOATLAS — Collectionnez le monde vivant",
  description: "Un atlas vivant et un jeu de collection consacré au monde animal.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
