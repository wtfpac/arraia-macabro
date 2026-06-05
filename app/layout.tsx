import type { Metadata } from "next";
import { Cinzel, Creepster, Rye} from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const creepster = Creepster({
  variable: "--font-creepster",
  subsets: ["latin"],
  weight: "400",
});

const rye = Rye({
  variable: "--font-rye",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Arraiá Macabro",
  description: "Pac Birthday 🎃.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${creepster.variable} ${rye.variable}`}>
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}