"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="route-error"><p className="eyebrow">Something moved out of frame</p><h1>The page could not be shown.</h1><button type="button" onClick={reset}>Try again <span>→</span></button></main>;
}
