import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const demoCards = [
  {
    text: "I replaced a work commute with transit.\nWhat almost broke me: Time pressure.\nI felt proud.",
    card_type: "victory",
    tags: ["Time pressure"],
    status: "approved",
    flagged: false
  },
  {
    text: "School drop-off almost broke me.\nI felt exposed.",
    card_type: "systems",
    tags: ["Kids logistics", "Safety fear"],
    status: "approved",
    flagged: false
  },
  {
    text: "I replaced errands with walking.\nWhat almost broke me: Weather.\nIt was harder than expected.",
    card_type: "ambivalence",
    tags: ["Weather"],
    status: "approved",
    flagged: false
  },
  {
    text: "Not replacing a trip almost broke me.\nI felt annoyed.",
    card_type: "break",
    tags: ["Time pressure"],
    status: "approved",
    flagged: false
  },
  {
    text: "I replaced a social/joy trip with a ride from someone else.\nSomeone helped me.",
    card_type: "surprise",
    tags: ["Social embarrassment"],
    status: "approved",
    flagged: false
  }
];

const { error } = await supabase.from("card_candidates").insert(demoCards);
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log("Seeded demo cards.");
