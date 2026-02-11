import { Container } from "@/components/Container";

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Privacy</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            What we store
          </h1>
        </div>
        <section className="section-card space-y-4 text-lg text-ink/80">
          <ul className="list-disc space-y-2 pl-6">
            <li>Anonymous session id (Supabase auth user id).</li>
            <li>Your daily answers and optional context labels.</li>
            <li>Publish consent for each day.</li>
          </ul>
          <p>
            We do not store GPS data or exact locations. We do not collect names,
            emails, or public profiles.
          </p>
        </section>
        <section className="section-card space-y-4 text-lg text-ink/80">
          <h2 className="font-serif text-2xl text-ink">Retention</h2>
          <p>
            You can delete your week from this device at any time by clearing
            local storage. The server retains anonymized entries only.
          </p>
          <p>
            To request removal of published cards, email: contact@example.com
          </p>
        </section>
      </div>
    </Container>
  );
}
