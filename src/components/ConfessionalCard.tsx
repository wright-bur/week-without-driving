import { Chip } from "@/components/Chip";

export type ConfessionalCardProps = {
  text: string;
  cardType: string;
  tags: string[];
  day?: number | null;
};

export function ConfessionalCard({
  text,
  cardType,
  tags,
  day
}: ConfessionalCardProps) {
  const lines = text.split("\n").filter(Boolean);
  const displayType =
    cardType.charAt(0).toUpperCase() + cardType.slice(1).toLowerCase();

  return (
    <article className="section-card flex flex-col gap-4 bg-white/90">
      <div className="space-y-2 text-lg font-serif text-ink">
        {lines.map((line, index) => (
          <p key={index} className="leading-relaxed">
            {line}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-dusk">
        <Chip>{displayType}</Chip>
        {tags.slice(0, 2).map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
        {day ? <Chip>Day {day}</Chip> : null}
      </div>
    </article>
  );
}
