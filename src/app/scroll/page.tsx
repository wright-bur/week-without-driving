import { Container } from "@/components/Container";
import ScrollClient from "@/app/scroll/scroll-client";

export default function ScrollPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Scroll</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Confessional scroll
          </h1>
          <p className="text-lg text-ink/70">
            Anonymous, curated reflections. No comments. No likes. Just the
            notes.
          </p>
        </div>
        <ScrollClient />
      </div>
    </Container>
  );
}
