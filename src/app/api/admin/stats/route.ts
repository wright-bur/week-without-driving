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
  const [{ count: participantsStarted }, { count: completed }, pending, approved] =
    await Promise.all([
      supabaseServer
        .from("participants")
        .select("id", { count: "exact", head: true }),
      supabaseServer
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("completed", true),
      supabaseServer
        .from("card_candidates")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseServer
        .from("card_candidates")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
    ]);

  return NextResponse.json({
    participantsStarted: participantsStarted ?? 0,
    completed: completed ?? 0,
    pendingCards: pending.count ?? 0,
    approvedCards: approved.count ?? 0
  });
}
