import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LaptopFixDB",
    default: "LaptopFixDB - 1,500+ Laptop Repair Solutions Database",
  },
  description: "Search through 1,500+ laptop repair videos from Electronics Repair School. Find troubleshooting steps and solutions by brand, model, or problem type. Expert repair guides for Dell, HP, Lenovo, MSI, Asus, Apple, and more.",
  keywords: [
    "laptop repair",
    "laptop troubleshooting",
    "laptop fix",
    "electronics repair",
    "laptop repair database",
    "laptop repair videos",
    "no power laptop",
    "laptop not charging",
    "laptop liquid damage",
    "laptop short circuit",
    "Dell repair",
    "HP repair",
    "Lenovo repair",
    "Asus repair",
    "Apple MacBook repair",
  ],
  authors: [{ name: "LaptopFixDB" }],
  creator: "LaptopFixDB",
  publisher: "LaptopFixDB",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "LaptopFixDB",
    title: "LaptopFixDB - 1,500+ Laptop Repair Solutions Database",
    description: "Search through 1,500+ laptop repair videos from Electronics Repair School. Find troubleshooting steps and solutions by brand, model, or problem type.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LaptopFixDB - Laptop Repair Solutions Database",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LaptopFixDB - 1,500+ Laptop Repair Solutions Database",
    description: "Search through 1,500+ laptop repair videos from Electronics Repair School. Find troubleshooting steps and solutions by brand, model, or problem type.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
