import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminEmails, getUserFromRequest } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  const adminEmails = getAdminEmails();

  if (!user || !user.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabaseServer = getSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("card_candidates")
    .select("id, text, card_type, tags, flagged, flag_reason, day, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map((card) => ({
    ...card,
    tags: card.tags ?? []
  }));

  return NextResponse.json(normalized);
}
