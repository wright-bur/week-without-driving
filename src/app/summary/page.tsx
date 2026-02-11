import { Container } from "@/components/Container";
import SummaryClient from "@/app/summary/summary-client";

export default function SummaryPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Summary</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Your week, reflected back
          </h1>
          <p className="text-lg text-ink/70">
            This is not a score. It&rsquo;s a snapshot. Keep what helps, leave the
            rest.
          </p>
        </div>
        <SummaryClient />
      </div>
    </Container>
  );
}
