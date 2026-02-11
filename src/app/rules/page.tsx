import Link from "next/link";
import { Container } from "@/components/Container";

export default function RulesPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Rules</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Keep it honest, keep it safe
          </h1>
        </div>
        <section className="section-card space-y-4 text-lg text-ink/80">
          <ul className="list-disc space-y-2 pl-6">
            <li>No naming individuals.</li>
            <li>No precise locations.</li>
            <li>No harassment or targeting.</li>
            <li>Keep it about your experience.</li>
          </ul>
        </section>
        <section className="section-card space-y-4 text-lg text-ink/80">
          <h2 className="font-serif text-2xl text-ink">What gets rejected</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Entries with names, addresses, or specific workplaces.</li>
            <li>Anything that identifies a child, school, or employer.</li>
            <li>Harassment, threats, or public shaming.</li>
            <li>Advertising or campaign copy.</li>
          </ul>
        </section>
        <Link className="btn-secondary w-fit" href="/">
          Back to home
        </Link>
      </div>
    </Container>
  );
}
