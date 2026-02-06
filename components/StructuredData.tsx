import Script from "next/script";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "LaptopFixDB",
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
        logo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/og-image.png`,
        description:
          "A searchable database of laptop repair solutions featuring 1,500+ repair videos from Electronics Repair School.",
        sameAs: ["https://www.youtube.com/@electronicsrepairschool"],
      },
      {
        "@type": "WebSite",
        name: "LaptopFixDB",
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
        description:
          "Search through 1,500+ laptop repair videos from Electronics Repair School. Find troubleshooting steps and solutions by brand, model, or problem type.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/repairs?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
