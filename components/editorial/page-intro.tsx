export function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="editorial-hero">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
      </div>
      <p>{subtitle}</p>
    </header>
  );
}
