import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
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

  await supabaseServer
    .from("daily_entries")
    .update({ publish_ok: false })
    .eq("participant_id", participant.id);

  await supabaseServer
    .from("card_candidates")
    .update({ status: "rejected" })
    .eq("participant_id", participant.id)
    .in("status", ["pending", "approved"]);

  return NextResponse.json({ ok: true });
}
