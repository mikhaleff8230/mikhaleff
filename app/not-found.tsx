import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 / Outside the archive</p>
      <h1>The work<br />is elsewhere.</h1>
      <Link className="text-link" href="/en">Return to the gallery <span aria-hidden="true">→</span></Link>
    </main>
  );
}
