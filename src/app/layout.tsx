import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Droit Habitat - Plateforme de qualification de dossier",
  description: "Transformez une situation confuse en dossier clair, structure et exploitable.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
