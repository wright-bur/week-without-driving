import Link from "next/link";
import { Container } from "@/components/Container";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Container className="flex flex-1 flex-col gap-16 py-16">
        <section className="flex flex-col gap-8">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-dusk">
              Week Without Driving Confessional
            </p>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
              WEEK WITHOUT DRIVING CONFESSIONAL
            </h1>
            <p className="text-xl font-semibold text-ember">
              "Not a streak. A reckoning."
            </p>
          </div>
          <div className="grid gap-6 text-lg text-ink/80 md:grid-cols-3">
            <p>
              A seven-day reflection challenge for people trying one week without
              driving. Each day is a small note to yourself about the trip you
              replaced, what almost broke you, and what surprised you.
            </p>
            <p>
              When you opt in, we generate an anonymous confessional scroll card
              from your entry. The public scroll is a quiet wall of notes - no
              likes, no comments, no scores.
            </p>
            <p>
              We protect your anonymity. No names, no locations, no GPS. You
              decide what gets published, every day, and you can withdraw
              consent.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="btn-primary" href="/start">
              Start my week
            </Link>
            <Link className="btn-secondary" href="/scroll">
              Read the confessional scroll
            </Link>
          </div>
        </section>

        <section className="section-card max-w-3xl space-y-4">
          <h2 className="font-serif text-2xl text-ink">Privacy &amp; Safety</h2>
          <p className="text-ink/80">
            We store only what you share in the reflection prompts. No GPS, no
            exact locations, no names. Publishing is always optional and
            reviewed before anything appears on the public scroll.
          </p>
          <p className="text-ink/70">
            If you include personal identifiers, we automatically redact obvious
            patterns and flag your card for extra review.
          </p>
        </section>
      </Container>

      <footer className="border-t border-amber-200/60 bg-white/70 py-6 text-sm text-dusk">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <p>Outside CalBike. A personal civic-art project.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/scroll">Scroll</Link>
            <Link href="/rules">Rules</Link>
            <Link href="/privacy">Privacy</Link>
            <Link className="opacity-60" href="/admin">
              Admin
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
