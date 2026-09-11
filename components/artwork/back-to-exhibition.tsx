import Link from "next/link";

export function BackToExhibition({ locale }: { locale: string }) {
  return <Link className="back-link" href={`/${locale}/works`}>← Back to works</Link>;
}
