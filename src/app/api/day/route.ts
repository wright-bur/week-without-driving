import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateCardCandidates } from "@/lib/cards/generate";
import type { DailyEntryInput } from "@/types";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as DailyEntryInput & {
    day?: number;
  };
  const day = Number(body.day);
  if (!Number.isInteger(day) || day < 1 || day > 7) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
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

  const entry: DailyEntryInput = {
    day,
    trip_type: body.trip_type ?? null,
    trip_mode: Array.isArray(body.trip_mode) ? body.trip_mode : [],
    almost_broke_tags: Array.isArray(body.almost_broke_tags)
      ? body.almost_broke_tags
      : [],
    almost_broke_text: body.almost_broke_text
      ? body.almost_broke_text.slice(0, 160)
      : null,
    surprise: body.surprise ?? null,
    publish_ok: Boolean(body.publish_ok),
    skipped: Boolean(body.skipped)
  };

  const { error: upsertError } = await supabaseServer
    .from("daily_entries")
    .upsert(
      {
        participant_id: participant.id,
        day: entry.day,
        trip_type: entry.trip_type,
        trip_mode: entry.trip_mode,
        almost_broke_tags: entry.almost_broke_tags,
        almost_broke_text: entry.almost_broke_text,
        surprise: entry.surprise,
        publish_ok: entry.publish_ok,
        skipped: entry.skipped
      },
      { onConflict: "participant_id,day" }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const nextDay = day < 7 ? day + 1 : 7;
  const completed = day === 7;
  await supabaseServer
    .from("participants")
    .update({ current_day: nextDay, completed })
    .eq("id", participant.id);

  if (!entry.publish_ok) {
    await supabaseServer
      .from("card_candidates")
      .update({ status: "rejected" })
      .eq("participant_id", participant.id)
      .eq("day", day)
      .in("status", ["pending", "approved"]);

    return NextResponse.json({ ok: true });
  }

  if (!entry.skipped) {
    await supabaseServer
      .from("card_candidates")
      .delete()
      .eq("participant_id", participant.id)
      .eq("day", day)
      .eq("status", "pending");

    const candidates = generateCardCandidates(entry).map((candidate) => ({
      participant_id: participant.id,
      day,
      text: candidate.text,
      card_type: candidate.card_type,
      tags: candidate.tags.filter((tag) => tag !== "Nothing today"),
      status: "pending",
      flagged: candidate.flagged,
      flag_reason: candidate.flag_reason
    }));

    if (candidates.length) {
      const { error: insertError } = await supabaseServer
        .from("card_candidates")
        .insert(candidates);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
