import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Laptop Repairs",
  description: "Browse 1,500+ laptop repair solutions from Electronics Repair School. Filter by brand (Dell, HP, Lenovo, Asus, MSI, Apple) and problem type (No Power, Not Charging, No Display, Liquid Damage, Short Circuit). Find detailed troubleshooting steps and video tutorials.",
  openGraph: {
    title: "Browse Laptop Repairs | LaptopFixDB",
    description: "Browse 1,500+ laptop repair solutions. Filter by brand and problem type. Detailed troubleshooting steps and video tutorials.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Laptop Repairs | LaptopFixDB",
    description: "Browse 1,500+ laptop repair solutions. Filter by brand and problem type.",
  },
};

export default function RepairsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
