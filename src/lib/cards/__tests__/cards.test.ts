import { describe, expect, it } from "vitest";
import { redactAndFlag } from "@/lib/cards/pii";
import { generateCardCandidates, resolveCardType } from "@/lib/cards/generate";
import type { DailyEntryInput } from "@/types";

const baseEntry: DailyEntryInput = {
  day: 1,
  trip_type: "Work commute",
  trip_mode: ["Transit"],
  almost_broke_tags: ["Time pressure"],
  almost_broke_text: "Late and worried about missing the bus.",
  surprise: "I felt proud",
  publish_ok: true,
  skipped: false
};

describe("PII redaction", () => {
  it("redacts emails and phones", () => {
    const result = redactAndFlag(
      "Email me at test@example.com or call 555-555-1234."
    );
    expect(result.text).not.toContain("test@example.com");
    expect(result.text).not.toContain("555-555-1234");
    expect(result.text).toContain("[redacted]");
  });

  it("flags street addresses", () => {
    const result = redactAndFlag("I waited on 123 Main St for 20 minutes.");
    expect(result.flagged).toBe(true);
  });

  it("flags school references", () => {
    const result = redactAndFlag("Dropped a kid at Lincoln High School.");
    expect(result.flagged).toBe(true);
  });

  it("flags employer references", () => {
    const result = redactAndFlag("I was late at Google again.");
    expect(result.flagged).toBe(true);
  });
});

describe("Card generation", () => {
  it("prefers the optional sentence", () => {
    const cards = generateCardCandidates(baseEntry);
    expect(cards[0].text).toContain("almost broke me");
    expect(cards[0].text).toContain("Late and worried");
  });

  it("assigns victory for positive surprise with low friction", () => {
    const entry: DailyEntryInput = {
      ...baseEntry,
      almost_broke_tags: ["Nothing today"],
      surprise: "I felt proud"
    };
    expect(resolveCardType(entry)).toBe("victory");
  });
});
