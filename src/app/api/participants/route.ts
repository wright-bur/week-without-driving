import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parent_status = body.parent_status ?? null;
    const area_type = body.area_type ?? null;

    const supabaseServer = getSupabaseServerClient();
    const { data: existing, error: lookupError } = await supabaseServer
      .from("participants")
      .select("id, parent_status, area_type")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (existing) {
      const { error: updateError } = await supabaseServer
        .from("participants")
        .update({
          parent_status: parent_status ?? existing.parent_status,
          area_type: area_type ?? existing.area_type
        })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ id: existing.id });
    }

    const { data: inserted, error: insertError } = await supabaseServer
      .from("participants")
      .insert({
        auth_user_id: user.id,
        parent_status,
        area_type,
        current_day: 1,
        completed: false
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
