const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3}[\s.-]?\d{4}/g;
const streetRegex = /\b\d{1,5}\s+[A-Za-z0-9'.-]+(?:\s+[A-Za-z0-9'.-]+){0,3}\s+(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Dr|Drive|Ct|Court|Way|Pl|Place)\b/i;
const schoolRegex = /\b(Elementary|Middle School|High School|School|College|University)\b/i;
const employerRegex = /\bat\s+[A-Z][A-Za-z0-9&'.-]{2,}/;

export type RedactionResult = {
  text: string;
  flagged: boolean;
  flagReason: string | null;
};

export function redactAndFlag(text: string): RedactionResult {
  let flagged = false;
  const reasons: string[] = [];

  if (streetRegex.test(text)) {
    flagged = true;
    reasons.push("Possible street address");
  }

  if (schoolRegex.test(text)) {
    flagged = true;
    reasons.push("Possible school reference");
  }

  if (employerRegex.test(text)) {
    flagged = true;
    reasons.push("Possible employer reference");
  }

  let redacted = text.replace(emailRegex, "[redacted]");
  redacted = redacted.replace(phoneRegex, "[redacted]");

  return {
    text: redacted.trim(),
    flagged,
    flagReason: reasons.length ? reasons.join("; ") : null
  };
}
