import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 0);
  const limit = Number(searchParams.get("limit") ?? 16);
  const types = searchParams.get("types")?.split(",").filter(Boolean) ?? [];
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  const start = page * limit;
  const end = start + limit;

  const supabaseServer = getSupabaseServerClient();
  let query = supabaseServer
    .from("card_candidates")
    .select("id, text, card_type, tags, day, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(start, end);

  if (types.length) {
    query = query.in("card_type", types);
  }

  if (tags.length) {
    query = query.overlaps("tags", tags);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cards = (data ?? []).map((card) => ({
    ...card,
    tags: card.tags ?? []
  }));
  const hasMore = cards.length > limit;

  return NextResponse.json({
    cards: cards.slice(0, limit),
    hasMore
  });
}
