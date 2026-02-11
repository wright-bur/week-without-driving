import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import DayClient from "@/app/day/day-client";

export default function DayPage({ params }: { params: { day: string } }) {
  const dayNumber = Number(params.day);
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) {
    notFound();
  }

  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">
            Day {dayNumber} of 7
          </p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl">
            Today&rsquo;s reflection
          </h1>
          <p className="text-lg text-ink/70">
            Keep it short. No names or specific places. One honest note is
            enough.
          </p>
        </div>
        <DayClient day={dayNumber} />
      </div>
    </Container>
  );
}
