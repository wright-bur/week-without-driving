import { Container } from "@/components/Container";
import DayClient from "@/app/day/day-client";

export default function DayPage({ params }: { params: { day: string } }) {
  const dayNumber = Number(params.day);
  const initialDay =
    Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 7
      ? dayNumber
      : 1;

  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">Day log</p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Your reflection
          </h1>
          <p className="text-lg text-ink/70">
            Pick a day and leave one honest note. No names or specific places.
          </p>
        </div>
        <DayClient initialDay={initialDay} />
      </div>
    </Container>
  );
}
