import { Container } from "@/components/Container";
import StartClient from "@/app/start/start-client";

export default function StartPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Start</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Start your reflection
          </h1>
          <p className="text-lg text-ink/80">
            Optional context helps us learn what kinds of weeks people are
            living, without identifying you.
          </p>
        </div>
        <StartClient />
      </div>
    </Container>
  );
}
