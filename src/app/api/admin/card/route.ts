import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminEmails, getUserFromRequest } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  const adminEmails = getAdminEmails();

  if (!user || !user.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { id, text, card_type, tags, status } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    text,
    card_type,
    tags,
    status
  };
  if (status === "approved") {
    update.approved_at = new Date().toISOString();
  }

  const supabaseServer = getSupabaseServerClient();
  const { error } = await supabaseServer
    .from("card_candidates")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
