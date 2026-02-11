import { redactAndFlag } from "@/lib/cards/pii";
import type { CardCandidate, DailyEntryInput, Surprise } from "@/types";

const surpriseLineMap: Record<Surprise, string> = {
  "Easier than expected": "It was easier than expected.",
  "Harder than expected": "It was harder than expected.",
  "I noticed something new": "I noticed something new.",
  "Someone helped me": "Someone helped me.",
  "Someone made it harder": "Someone made it harder.",
  "I felt calmer": "I felt calmer.",
  "I felt exposed": "I felt exposed.",
  "I felt proud": "I felt proud.",
  "I felt annoyed": "I felt annoyed."
};

const tripLabelMap: Record<string, string> = {
  "Work commute": "My work commute",
  "School drop-off": "School drop-off",
  Errands: "Errands",
  "Social/joy trip": "A social/joy trip",
  "I didn't replace one": "Not replacing a trip"
};

const positiveSurprises = new Set([
  "Easier than expected",
  "I felt calmer",
  "I felt proud"
]);
const negativeSurprises = new Set([
  "Harder than expected",
  "I felt exposed",
  "I felt annoyed"
]);

const systemTags = new Set([
  "Infrastructure gap",
  "Safety fear",
  "Kids logistics"
]);

function cleanLine(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

function trimToMax(text: string, max: number) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}...`;
}

export function resolveCardType(entry: DailyEntryInput) {
  const tags = entry.almost_broke_tags ?? [];
  const hasNothing = tags.includes("Nothing today");
  const hasScary = tags.some((tag) => tag !== "Nothing today");
  const surprise = entry.surprise ?? "I noticed something new";

  const isVictory = positiveSurprises.has(surprise) && (hasNothing || !hasScary);
  const isBreak =
    entry.trip_type === "I didn't replace one" ||
    entry.skipped ||
    (negativeSurprises.has(surprise) && hasScary);
  const isSystems = tags.some((tag) => systemTags.has(tag));
  const isAmbivalence =
    (positiveSurprises.has(surprise) && hasScary) ||
    (negativeSurprises.has(surprise) && !hasScary);

  if (isBreak) return "break" as const;
  if (isSystems) return "systems" as const;
  if (isVictory) return "victory" as const;
  if (isAmbivalence) return "ambivalence" as const;
  return "surprise" as const;
}

export function generateCardCandidates(entry: DailyEntryInput): CardCandidate[] {
  const tags = entry.almost_broke_tags ?? [];
  const cardType = resolveCardType(entry);
  const candidates: CardCandidate[] = [];

  const surprise = entry.surprise;
  const surpriseLine = surprise ? surpriseLineMap[surprise] : null;
  const tripLabel = entry.trip_type ? tripLabelMap[entry.trip_type] : "The trip";

  if (entry.almost_broke_text) {
    const lines = [
      `${tripLabel} almost broke me.`,
      trimToMax(entry.almost_broke_text, 160)
    ];
    if (surpriseLine && lines.length < 3) {
      lines.push(surpriseLine);
    }
    const rawText = lines.map(cleanLine).filter(Boolean).join("\n");
    const redacted = redactAndFlag(rawText);
    candidates.push({
      text: redacted.text,
      card_type: cardType,
      tags,
      flagged: redacted.flagged,
      flag_reason: redacted.flagReason
    });
  }

  const altLines: string[] = [];
  if (entry.trip_type && entry.trip_mode.length) {
    altLines.push(
      `I replaced ${entry.trip_type.toLowerCase()} with ${
        entry.trip_mode[0].toLowerCase()
      }.`
    );
  } else if (entry.trip_type) {
    altLines.push(`I faced ${entry.trip_type.toLowerCase()}.`);
  }

  const topTag = tags.find((tag) => tag !== "Nothing today");
  if (topTag) {
    altLines.push(`What almost broke me: ${topTag}.`);
  }
  if (surpriseLine) {
    altLines.push(surpriseLine);
  }

  if (altLines.length) {
    const rawText = altLines.slice(0, 3).map(cleanLine).join("\n");
    const redacted = redactAndFlag(rawText);
    candidates.push({
      text: redacted.text,
      card_type: cardType,
      tags,
      flagged: redacted.flagged,
      flag_reason: redacted.flagReason
    });
  }

  return candidates.slice(0, 2);
}
