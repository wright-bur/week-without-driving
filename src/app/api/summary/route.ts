import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getTopItems(items: string[], limit: number) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item]) => item);
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseServer = getSupabaseServerClient();
  const { data: participant, error: participantError } = await supabaseServer
    .from("participants")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  }

  const { data: entries, error: entriesError } = await supabaseServer
    .from("daily_entries")
    .select(
      "day, trip_type, skipped, almost_broke_tags, surprise, publish_ok"
    )
    .eq("participant_id", participant.id);

  if (entriesError || !entries) {
    return NextResponse.json({ error: "Unable to load entries" }, { status: 500 });
  }

  const replacedCount = entries.filter(
    (entry) =>
      !entry.skipped &&
      entry.trip_type &&
      entry.trip_type !== "I didn't replace one"
  ).length;
  const skippedCount = entries.filter((entry) => entry.skipped).length;
  const nearBreakCount = entries.filter((entry) => {
    const tags = entry.almost_broke_tags ?? [];
    return !entry.skipped && !tags.includes("Nothing today");
  }).length;

  const allTags = entries.flatMap((entry) =>
    (entry.almost_broke_tags ?? []).filter((tag: string) => tag !== "Nothing today")
  );
  const allSurprises = entries
    .map((entry) => entry.surprise)
    .filter(Boolean) as string[];

  const topTags = getTopItems(allTags, 2);
  const topSurprises = getTopItems(allSurprises, 2);

  const shareText =
    `Week without driving: ${replacedCount} trips replaced, ` +
    `${skippedCount} skipped. ` +
    `Most common stressor: ${topTags.join(", ") || "(none)"}. ` +
    `Most common surprise: ${topSurprises.join(", ") || "(none)"}. ` +
    `Not a streak. A reckoning.`;

  return NextResponse.json({
    replacedCount,
    skippedCount,
    nearBreakCount,
    topTags,
    topSurprises,
    shareText
  });
}
