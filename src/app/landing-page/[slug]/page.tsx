import React from "react";
import { notFound } from "next/navigation";
import { getLandingPage } from "@/actions/landing-pages";
import { LandingPageContent } from "@/components/landing-page-2/landing-page-content";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const landingPage = await getLandingPage(slug);
  
  if (!landingPage) return {};

  return {
    title: landingPage.metaTitle || landingPage.title,
    description: landingPage.metaDescription || landingPage.description,
    openGraph: {
      images: landingPage.heroImage ? [landingPage.heroImage] : [],
    },
  };
}

export default async function Page(props: Props) {
  const { slug } = await props.params;
  const landingPage = await getLandingPage(slug);

  if (!landingPage) {
    notFound();
  }

  return <LandingPageContent landingPage={landingPage} />;
}
