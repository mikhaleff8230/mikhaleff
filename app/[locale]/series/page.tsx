import { redirect } from "next/navigation";

export default async function LegacySeriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/collections`);
}
