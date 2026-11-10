import type { Metadata } from "next";
import { SITE_URL, business } from "@/config/businessData";

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image = "/og.png",
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "en-IN": url,
        "hi-IN": url,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      siteName: business.name,
      locale: "en_IN",
      title: `${title} | ${business.name}`,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${business.name} — paint binders, wall textures and plastering tools in ${business.locality}, ${business.city}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${business.name}`,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
